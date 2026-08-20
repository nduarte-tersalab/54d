**English** · [Español](INTEGRATIONS.es.md)

# Integrations: Mindbody, Trainerize and FitBudd

Three third-party platforms show up in this project and they are easy to
confuse. This document clarifies what each one does, what is wired, and what
the chosen direction means for measurement.

---

## The map, in one table

| Platform | For which product | Status | Who charges |
|---|---|---|---|
| **Mindbody** | 54D Studios (in person) | Partially integrated | Mindbody, with its own integration |
| **Trainerize** | current "54D On" app (white-label) | In use by the client, not wired to the site | nobody, through us |
| **FitBudd** | replacement for the ON app | **Decided**: FitBudd, with its native Stripe integration | **FitBudd**, on the client's Stripe account |

The rule that runs through everything: **Studios and ON do not mix.** They are
products 90x apart in price. The apps are different too, which is why the 54D
ON app badges never appear on studio pages
(see [marketing/BRAND_SEPARATION.md](marketing/BRAND_SEPARATION.md) *(Spanish)*).

---

## Mindbody: Studios

The system the client uses to run the in-person studios: classes, schedules,
clients.

**What is wired today**

- `GET /mindbody/classes` (in `apps/api/src/index.ts`) pulls real schedules per
  location, cached 10 minutes at the edge. Location pages consume it and **fail
  soft**: with no response, they fall back to static schedules. That means you
  can develop without Mindbody and nothing breaks.
- `POST /leads` pushes the lead into Mindbody via `addclient` (best effort: if
  it fails, the lead is still saved in Supabase and `mindbody_sync_error` is
  recorded).

**Access status**

The API key works for `addclient` with `Api-Key` + `SiteId`. What is **not**
enabled is `usertoken/issue`, which requires *go-live* approval from the
Mindbody developer portal. It was requested and, at the time of writing, still
returns `DeniedAccess`. Until then live schedules stay off, but the code is
ready: nothing needs changing, the API just has to start answering.

**Careful with Stripe**: Mindbody may be charging on the same Stripe account.
This is the reason the webhook keeps a provenance check even now that FitBudd
charges are meant to come in. Studio memberships cost roughly 90x an app
subscription, so a single studio charge counted as an app sale skews revenue by
an order of magnitude. See [STRIPE.md](STRIPE.md), part 3.

---

## Trainerize: the current ON app

The published "54D On" app is a Trainerize white-label. You can tell from the
Android package: `com.trainerize.fiftyfourdays`.

**It is not integrated with the site.** The site links to it (App Store and
Google Play badges) and shows its rating, nothing more. Nothing sold on the site
provisions anyone in the app: that bridge does not exist, and it is exactly the
problem FitBudd is meant to replace.

The testimonials shown on the site are real reviews of this app, harvested from
the public iTunes RSS feed.

---

## FitBudd: the chosen direction

FitBudd is a white-label fitness app platform for trainers and gyms: a direct
competitor to Trainerize. It offers a client-branded app, training plans, coach
chat, and payments via Stripe, PayPal and in-app purchases, with no platform
commission on top.

**The client has decided.** FitBudd is already connected to Stripe and the app
will charge through **FitBudd's native Stripe integration**. This is no longer
an open architectural question, and the earlier framing of this document as
"option A versus option B" is obsolete.

### What that decision costs, and what it does not

What it buys: less code, less to maintain, and a payment flow the vendor
supports. That is real value and it is why the decision is reasonable.

What it costs: the ad-to-sale link does not survive on its own. Our checkout
wrote it by construction, because we created the Stripe session and stamped our
own `attribution_id` on it. A FitBudd checkout writes nothing of ours. The
Stripe event arrives with a customer who paid and no trace of the Meta ad they
clicked eleven days earlier.

What it does **not** cost, contrary to the previous version of this document:
the measurement is not simply lost. It can be rebuilt with an attribution
handoff, at a precision that depends on one answer from FitBudd. The full
pattern, the three match strategies and their honest reliability are in
[STRIPE.md](STRIPE.md), part 2. The short version:

| Strategy | Precision | Depends on |
|---|---|---|
| Our `attribution_id` passed through FitBudd | deterministic | FitBudd supporting metadata pass-through (unconfirmed) |
| Normalized customer email | high precision, partial coverage | capturing the email before the redirect |
| Time window plus landing | approximate, degrades with volume | nothing, and that is the problem |

### What we have to build on our side

1. **The handoff.** The CTA that sends someone to FitBudd cannot be a plain
   link. It has to record the touch first (utm, fbclid, referrer, and whatever
   correlation key we can carry) and redirect after. Without this step there is
   nothing to match against later, and no webhook code recovers it.
2. **Let FitBudd events in.** They already reach our webhook, since it is the
   same Stripe account, and today the provenance filter discards them. That
   filter becomes a three-way classifier: ours, FitBudd's, foreign.
3. **Keep Mindbody out.** Non negotiable, for the 90x reason above.
4. **Mark the origin in the mirror.** A column that separates what the site sold
   from what the app sold, so both can be read separately and added up
   deliberately.

### Questions for FitBudd, in priority order

1. **Metadata pass-through**: can we attach an arbitrary value to the checkout
   FitBudd creates, and does it survive to the Stripe object? This is the one
   that decides everything else.
2. **Its own webhooks**: does FitBudd emit purchase, trial and cancellation
   events of its own? What is in the payload?
3. **The Stripe account**: same account as the studios, confirmed? Connected via
   Stripe Connect, OAuth, or a pasted key?
4. **Read API**: can we list subscriptions and members to reconcile nightly?
5. **In-app purchases**: does an App Store or Google Play subscription show up in
   Stripe at all? If not, that revenue never reaches this pipeline.
6. **Catalog ownership**: whose products and prices, ours or theirs?
7. **Trainerize migration**: do migrated members produce Stripe events that look
   like new sales?

### What is already on our side, whichever way the answers land

- The **provenance check** protects the metrics on a shared Stripe account. It
  changes shape, it does not go away.
- The **channel infrastructure is built**: `channel_of()` plus three views
  classify any touch into meta_ads, newsletter, seo, direct and the rest. See
  [ANALYTICS.md](ANALYTICS.md) *(Spanish)*. It works the moment sales start
  reaching the mirror with an attribution behind them.
- The `/leads` endpoint and the best-effort sync pattern used with Mindbody
  (save first, sync after, log the failure without breaking the flow) is the
  same pattern to use for anything we push into FitBudd.
- The `program_prices` table already maps program → `stripe_price_id` →
  `interval`, so adding a FitBudd identifier per program is one more column.

> **Note for whoever reviews this:** this project exists to answer "how many free
> trials come from each channel, how many buy, and how many cancel". The
> architecture chosen does not answer that by itself. It can, with the handoff.
> Shipping the FitBudd integration without the handoff means shipping a
> dashboard that will show zero forever.
