**English** · [Español](INTEGRATIONS.es.md)

# Integrations: Mindbody, Trainerize and FitBudd

Three third-party platforms show up in this project and they are easy to
confuse. This document clarifies what each one does, what is wired, and what
is still undecided.

---

## The map, in one table

| Platform | For which product | Status | Who charges |
|---|---|---|---|
| **Mindbody** | 54D Studios (in person) | Partially integrated | Mindbody, with its own integration |
| **Trainerize** | current "54D On" app (white-label) | In use by the client, not wired to the site | — |
| **FitBudd** | evaluated replacement for the ON app | **Undecided** | Undecided (brings its own Stripe) |

The rule that runs through everything: **Studios and ON do not mix.** They are
products 90x apart in price. The apps are different too, which is why the 54D
ON app badges never appear on studio pages
(see [marketing/BRAND_SEPARATION.md](marketing/BRAND_SEPARATION.md) *(Spanish)*).

---

## Mindbody — Studios

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
That is why the webhook provenance filter exists — see [STRIPE.md](STRIPE.md).

---

## Trainerize — the current ON app

The published "54D On" app is a Trainerize white-label. You can tell from the
Android package: `com.trainerize.fiftyfourdays`.

**It is not integrated with the site.** The site links to it (App Store and
Google Play badges) and shows its rating, nothing more. Subscriptions sold
through our Stripe checkout **do not currently provision anyone in the app**:
that bridge does not exist yet, and it is exactly the problem FitBudd is meant
to solve or replace.

The testimonials shown on the site are real reviews of this app, harvested from
the public iTunes RSS feed.

---

## FitBudd — the open decision

FitBudd is a white-label fitness app platform for trainers and gyms: a direct
competitor to Trainerize. It offers a client-branded app, training plans, coach
chat, and **payments via Stripe, PayPal and in-app purchases**, with no platform
commission on top.

### What to decide before writing code

The question is not technical, it is business architecture: **who charges?**

**Option A — our checkout charges, FitBudd only grants access**

```
Meta Ad → landing → our Stripe checkout → webhook
        → provision the user in FitBudd via their API
```

- Keeps **all** the per-ad attribution already built.
- Keeps control of the funnel, pricing and Meta CAPI events.
- Requires FitBudd to have a user-provisioning API and the webhook to call it.
- This is the option that **does not throw away** what is already built.

**Option B — FitBudd charges with its own integration**

- Less code on our side; FitBudd handles subscriptions and access.
- **Measurement breaks** unless FitBudd lets us pass our own metadata through
  to Stripe and returns it in its webhooks. Without that, there is no way to
  know which ad produced which sale, which is the central goal of this project.
- The site stops selling and starts referring.

**Option C — hybrid**: the site charges the membership (where attribution
matters, because that is what gets advertised) and FitBudd handles access and
the experience. In practice this is option A with clearer division of labor.

### Questions to put to FitBudd before deciding

1. Is there a public API to **create users and assign programs** from outside?
   What authentication?
2. If we charge, how is access granted? Is creating the account enough, or must
   the subscription live in their system?
3. If FitBudd charges, can it pass **arbitrary metadata** (our
   `attribution_id`) into checkout and return it by webhook?
4. Does it use **the client's same Stripe account** or its own? If the same,
   our provenance filter already stops its charges from polluting metrics, but
   confirm it.
5. What happens to current Trainerize members? Is there a migration?

### What is already on our side, whichever way it goes

- The **provenance filter** protects the metrics if the Stripe account is shared.
- The `/leads` endpoint and the best-effort sync pattern used with Mindbody
  (save first, sync after, log the failure without breaking the flow) is the
  same pattern to use for provisioning in FitBudd.
- The `program_prices` table already maps program → `stripe_price_id` →
  `interval`, so adding a FitBudd identifier per program is one more column.

> **Note for whoever makes the call:** this project exists to answer "how many
> free trials come from each ad, how many buy, and how many cancel". Any
> architecture that breaks that link must be rejected or explicitly compensated.
