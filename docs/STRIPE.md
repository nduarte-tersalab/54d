**English** · [Español](STRIPE.es.md)

# Stripe payments

How to connect Stripe in the scenario the client chose, and how to keep per
channel measurement alive inside it. If you are here to wire payments, this is
your document.

**The chosen direction (confirmed by the client):** FitBudd is already connected
to Stripe and the app will charge through **FitBudd's native Stripe
integration**. The client still wants the dashboard that answers where sales and
free trials come from: Meta, newsletter, organic, SEO. Those two things are not
automatically compatible. Making them compatible is the work described in
[Part 2](#part-2-the-central-problem-and-the-attribution-handoff) and
[Part 3](#part-3-what-changes-in-the-code).

---

## Status at a glance

| | Status |
|---|---|
| Checkout code (site) | **Done** (`apps/api/src/index.ts`, `POST /checkout`) |
| Stripe webhook | **Done**, with provenance filter and idempotency |
| Per ad attribution | **Done** (front-end capture → table → mirror → SQL view) |
| Per channel attribution | **Done**: `channel_of` + 3 views, read by `/admin` (see [ANALYTICS.md](ANALYTICS.md) *(Spanish)*) |
| Stripe keys | **MISSING** (never configured) |
| Real price IDs | **MISSING**: 30 `PENDING_*` placeholders |
| FitBudd events reaching the mirror | **NOT BUILT**: today the webhook discards them |
| Match between a FitBudd sale and a touch | **NOT BUILT**: no correlation key is stored |
| One-time Purchase event | **KNOWN BUG**, no conversion fires |
| `/thanks` page | **Does not exist** |

**Nothing can charge from the site yet.** Every buy CTA returns
`503 payments_not_configured` on purpose, so the front end does not show a fake
network error. The dashboard renders with empty states that say exactly this,
rather than showing a silent zero.

---

## How the flow works today

```
Meta Ad
  → landing (captures utm_*, fbclid, _fbp/_fbc, gclid, ga_client_id, landing_path, referrer)
  → POST /checkout { priceId, attribution }
      1. INSERT into checkout_attributions   ← saved BEFORE creating the session
      2. reads program_prices for interval and trial_days
      3. creates a Stripe Checkout Session:
         - mode: 'payment'       if interval = one_time   (single programs)
         - mode: 'subscription'  if month/quarter/year     (membership)
         - metadata.source = '54d-web'  ← provenance marker
         - client_reference_id = attribution id
      4. stores checkout_session_id on the attribution
  → Stripe Checkout (Stripe-hosted)
  → POST /webhooks/stripe
      · checkout.session.completed  → mirrors customer + subscription, links attribution,
                                      fires StartTrial (Meta CAPI) and GA4
      · invoice.paid                → first_paid_at: THIS is the real conversion
      · customer.subscription.*     → status, cancellations, trial drop-offs
```

`v_campaign_funnel` answers this per ad. `v_channel_funnel` answers the same per
commercial channel. Both read the same mirror.

### The provenance filter (do not delete it, convert it)

The Stripe account is shared. Mindbody charges the studios on it today, and
FitBudd will charge the app on it tomorrow. Both hit our webhook.

Every event passes a gate (`apps/api/src/index.ts`, lines 154 to 192):

```ts
// checkout.session.completed
if (s.metadata?.source === '54d-web' && s.metadata?.attribution_id) { ... }

// customer.subscription.*
const isOurs = sub.metadata?.source === '54d-web' || await subscriptionExists(supabase, sub.id);

// invoice.*
if (await invoiceIsOurs(supabase, inv)) { ... }
```

Today this gate is binary: ours, or ignored. That is exactly what has to change,
and [Part 3](#part-3-what-changes-in-the-code) explains how, without letting
Mindbody back in.

A detail that is expensive to discover on your own: **Session metadata does NOT
propagate to the Subscription.** That is why it is set twice, once in `metadata`
and once in `subscription_data.metadata`.

---

## Part 1: connect Stripe, executable checklist

Run it in order. Steps 1 to 4 are done in the Stripe dashboard, 5 to 7 in the
repo and Cloudflare.

### 1. Confirm which account

There is one Stripe account and at least three platforms want to charge on it:
Mindbody (studios), FitBudd (ON app), and our own checkout (whatever the site
keeps selling directly). Before anything else, write down the account ID and
confirm with the client that FitBudd is connected to **that** account and not to
a second one. If FitBudd charges on a different account, none of its events ever
reach our webhook and the whole of Part 2 changes: the only path left is
FitBudd's own webhooks or its API, if it has them.

### 2. Create the products and prices

One product per sellable thing, one price per billing interval. Verified prices
against store.54d.com/packs on 2026-07-25:

- **Membership**: USD 54/month, 156/quarter, 588/year. 7-day trial.
- **One-time programs**: Reset 7 USD 19 · Emergency Kit / Max Burn / First Move /
  Booty on Fire USD 39 · Full Body 95 · Lower/Upper Body 185 · 54D ON 385 ·
  Step 2 400.
- **Runners (5K/10K/21K)**: membership only, not sold separately.

Set the trial on the price or pass it at checkout, but pick one and be
consistent, because `program_prices.trial_days` is what our endpoint reads.

**If FitBudd creates its own products for the same plans, do not duplicate
them.** Two products for one membership means two price IDs, split revenue in
Stripe's own reports and a mapping table that nobody maintains. Decide who owns
the catalog before creating anything (open question 6 below).

### 3. Replace the 30 placeholders

`PENDING_*` currently lives in three places:

| File | How many | What they are |
|---|---|---|
| `apps/web/app/data/program-landings.ts` | 14 | the 13 programs (+1 repeated) |
| `apps/web/app/routes/on.tsx` | 13 | the program showcase |
| `apps/web/app/routes/pricing.tsx` | 3 | the membership plans |

There is a **mirror in Supabase**: the `program_prices` table stores
`stripe_price_id`, `interval` and `trial_days`. The endpoint reads it to decide
`mode` and trial. **Update it alongside the code**, or checkout creates sessions
in the wrong mode. If FitBudd owns some prices, insert those rows too: that is
what later lets you map a FitBudd sale to a program.

### 4. Get the keys

From the Stripe dashboard, in **test mode first**:

- `sk_test_...` (Developers → API keys → Secret key)
- `whsec_...` (Developers → Webhooks → your endpoint → Signing secret). You only
  get this after step 6, so this step runs twice.

Never commit either one. Never put them in `.env*` files that ship.

### 5. Load them as secrets in Cloudflare

```bash
cd apps/api
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

Each command prompts for the value and stores it encrypted on the Worker. For
local development the same two names go in `apps/api/.dev.vars`, which is
gitignored:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Verify what is loaded without printing values:

```bash
npx wrangler secret list
```

### 6. Register the webhook endpoint

In Stripe, Developers → Webhooks → Add endpoint:

```
https://54d-api.<account-subdomain>.workers.dev/webhooks/stripe
```

The Worker is named `54d-api` in `apps/api/wrangler.jsonc`; the subdomain is the
account's. If a custom domain is in front of the API, use that instead. Copy the
signing secret it gives you back into step 5.

### 7. Subscribe the events

Minimum set for the site's own checkout:

| Event | What it feeds |
|---|---|
| `checkout.session.completed` | mirror customer and subscription, link attribution |
| `invoice.paid` | `first_paid_at`, the real conversion, and revenue |
| `invoice.payment_failed` | dunning and churn risk |
| `customer.subscription.created` | trial start |
| `customer.subscription.updated` | status changes, cancel at period end |
| `customer.subscription.deleted` | cancellations, trial drop-offs |

Add these once FitBudd charges on the same account:

| Event | Why it is needed now |
|---|---|
| `customer.created` | the email that strategy (b) matches on arrives here first |
| `customer.updated` | the email can be filled in after the fact |
| `payment_intent.succeeded` | one-time charges that never produce an invoice |
| `charge.refunded` | otherwise reported revenue drifts above real revenue |

Subscribing to an event does not mean processing it: the handler is a `switch`
and anything not listed falls through. Subscribing early is cheap and it fills
`webhook_events.payload` with real examples, which is exactly what you need for
the discovery step in Part 3.

---

## Part 2: the central problem and the attribution handoff

### The problem, stated precisely

FitBudd charges on the client's Stripe account. Those events **do reach our
webhook**, because a webhook endpoint receives everything that happens on the
account. Today they are dropped on the floor: a FitBudd subscription carries no
`metadata.source = '54d-web'` and does not exist in our mirror, so
`subscriptionExists()` returns false and the gate discards it.

So the sale happens, the money is real, and the dashboard shows nothing.

Letting them in is the easy half. The hard half is that a FitBudd event carries
no idea of which ad, newsletter or search brought that person. Stripe knows
there is a customer who paid. It does not know they clicked a Meta ad eleven
days ago. That link lives only on our side, in `checkout_attributions`, and
today it is only ever written when someone clicks a buy CTA on our own checkout.

### The pattern: attribution handoff

Split the sale into two halves that meet later on a correlation key.

```
1. TOUCH (our site)
   visitor lands with utm_* / fbclid / referrer
   captureAttribution() stores it in localStorage
        │
2. HANDOFF (our site, at the moment we send them to FitBudd)
   the CTA does not link straight out. It first POSTs the attribution
   and whatever identifier we can carry across, and only then redirects.
   → row in checkout_attributions with a correlation key
        │
3. PURCHASE (FitBudd, on the shared Stripe account)
   FitBudd creates customer + subscription + invoice
        │
4. MATCH (our webhook)
   the event arrives, is classified as origin 'fitbudd',
   and is matched back against the attribution row by the correlation key
        │
5. REPORT
   the mirror now has a subscription with a channel behind it,
   and v_channel_funnel counts it like any other sale
```

Step 2 is the part that does not exist yet and is not optional. Without a row
written at handoff time there is nothing to match against later, and no clever
webhook code recovers it. Note also that `v_channel_funnel` reads
`from checkout_attributions left join subscriptions`: a sale with no attribution
row is not merely unattributed, it is **invisible** to the view.

### The three match strategies, by reliability

#### (a) Metadata or client reference passed through FitBudd

If FitBudd lets us attach an arbitrary value to the checkout it creates, put our
`attribution_id` there and read it back off the Stripe object.

- **Reliability: deterministic.** Right or absent, never wrong.
- **Cost:** almost none on our side, we already generate the id.
- **Depends on:** FitBudd supporting metadata pass-through, custom fields, or a
  query parameter it forwards. **Unconfirmed. This is open question 1 below and
  it is the single most valuable answer to get.**
- Read it in this order on the Stripe object: `metadata.attribution_id`, then
  `client_reference_id`, then `subscription.metadata.attribution_id`. Remember
  session metadata does not propagate to the subscription, so if FitBudd sets it
  in only one place, find out which.

#### (b) Normalized email of the Stripe customer

Store the email at handoff and match `lower(trim(email))` against the email on
the Stripe customer.

- **Reliability: high when both sides have it, and coverage is the weak part,
  not precision.** A wrong match needs two different people to share an email
  address, which is rare. A missing match is common.
- **It fails when:** we never asked for the email before redirecting (today we
  never do), the person signs up in FitBudd with a different address than the
  one they gave us, Apple private relay rewrites it, the purchase happens
  through an in-app purchase with an Apple or Google account email, or the
  household shares one address.
- **Cost:** an `email` column on `checkout_attributions` (it does not exist
  today, `/checkout` receives `body.email` and only forwards it to Stripe as
  `customer_email`), plus an email capture step before the redirect. That step
  is a real conversion cost: every field before a redirect loses people. Weigh
  it, do not add it reflexively.
- Match against both `customer.email` and `checkout_session.customer_details
  .email`, and store which one hit.

#### (c) Time window plus landing

Last resort. Match the sale to the most recent unmatched touch from the same
landing within a window of N hours.

- **Reliability: approximate, and it degrades exactly when the business grows.**
  With two sales an hour it is mostly right. With twenty concurrent visitors on
  the same landing it is a coin flip, and it is confidently wrong rather than
  silent.
- **Never use it to feed Meta CAPI.** A wrong Purchase teaches the algorithm to
  optimize toward the wrong audience, and that damage is expensive and slow to
  undo. Use it for the internal dashboard only.
- Whatever the window is, write it down as a decision, tag every row it produces
  as low confidence, and show that share in the dashboard. A number nobody can
  audit is worse than a gap everyone can see.

#### The honest summary

Push hard for (a). Fall back to (b) if the client accepts an email step before
the redirect. Treat (c) as a stopgap that must be visibly labelled, never as the
plan. And record how each row was matched, so the dashboard can say "82 percent
of revenue is deterministically attributed" instead of implying that all of it
is.

---

## Part 3: what changes in the code

Nothing here is written yet. This is the specification, not a description.

### 3.1 The filter becomes a classifier

Do not delete the provenance filter. Mindbody charges studio memberships on the
same account, a product 90x the price of the app, so letting it in does not add
noise, it destroys the numbers: revenue would be wrong by an order of magnitude
and every conversion rate with it.

Replace the boolean with three outcomes:

```ts
type Origin = 'web' | 'fitbudd' | 'foreign';
```

- `web`: `metadata.source === '54d-web'`, or already in our mirror with
  `origin = 'web'`. Behaves exactly as today.
- `fitbudd`: recognized as belonging to the ON app. Mirrored and matched, but
  **not** treated as our checkout: there is no `client_reference_id` to trust and
  no browser event to deduplicate against.
- `foreign`: everything else, which today means Mindbody. Marked processed and
  ignored, same as now.

### 3.2 How to tell `fitbudd` from `foreign`

This cannot be answered from the desk, and guessing here would corrupt the
mirror. Discover it from real data, using infrastructure that already exists:
every event is stored whole in `webhook_events.payload`.

1. Register the endpoint and subscribe the events (Part 1) before writing any
   handler code.
2. Let a few real charges of each kind happen, or make one test charge per
   platform.
3. Inspect what distinguishes them:

```sql
select
  type,
  payload -> 'data' -> 'object' ->> 'application'  as application,
  payload -> 'data' -> 'object' ->  'metadata'     as metadata,
  payload -> 'data' -> 'object' ->> 'description'  as description,
  count(*)
from webhook_events
where source = 'stripe'
group by 1, 2, 3, 4
order by count desc;
```

Candidate discriminators, best first:

1. **`application`**: when a platform charges through Stripe Connect or OAuth,
   Stripe stamps the connected application ID on the objects it creates. If
   FitBudd and Mindbody show different values here, this is the cleanest
   discriminator available and it needs no cooperation from either vendor.
   Whether they use Connect at all is what the query above tells you.
2. **Price or product ID**: if the FitBudd plans are known prices, a lookup
   against `program_prices` classifies them. Robust, but only if the catalog is
   maintained (Part 1, step 3).
3. **Metadata FitBudd sets on its own objects**: possible, unknown, worth asking
   for (open question 2).

Whichever you pick, write it as one function with the reasoning in a comment
next to it, and default to `foreign` when unsure. An unclassified sale that is
missing from the dashboard is a bug you can find. An unclassified Mindbody
charge counted as an app sale is a bug that looks like good news.

### 3.3 New columns in the mirror

| Table | Column | Why |
|---|---|---|
| `subscriptions` | `origin text not null default 'web'`, check in (`web`, `fitbudd`, `other`) | separate what the site sold from what the app sold, in every view and every export |
| `invoices` | `origin text` | revenue splits the same way, and refunds land on the right side |
| `checkout_attributions` | `email text` | the correlation key for strategy (b). Store it normalized, lowercase and trimmed |
| `checkout_attributions` | `match_method text` (`metadata`, `email`, `window`, `null`) | lets the dashboard state how the link was made |
| `checkout_attributions` | `match_confidence text` (`exact`, `probable`, `weak`) | (a) is exact, (b) is probable, (c) is weak |
| `checkout_attributions` | `matched_at timestamptz` | separates "not matched yet" from "will never match" |

Default `origin` to `'web'` so existing rows keep their meaning and no backfill
is needed.

### 3.4 The new webhook branch

Inside `customer.subscription.*` and `invoice.*`, after classification:

1. If `origin === 'fitbudd'`, mirror the subscription and invoice exactly as for
   our own, with `origin = 'fitbudd'`.
2. Try the match, in order (a), (b), (c). Stop at the first hit. Write
   `subscription_id`, `match_method`, `match_confidence` and `matched_at` on the
   attribution row.
3. If nothing matches, still mirror the sale. An unattributed sale is a real
   sale and it must show up in totals, in a visible "unattributed" bucket. This
   also means `v_channel_funnel`, which starts from `checkout_attributions`,
   needs a companion path for subscriptions with no attribution row, otherwise
   these sales are silently absent rather than counted as unknown.
4. Fire Meta CAPI and GA4 **only** for `match_confidence = 'exact'`, and only
   for `origin = 'fitbudd'` events that represent a genuine first payment. For
   everything else, mirror without emitting. Feeding Meta a guessed conversion
   is worse than feeding it nothing.

Keep the existing idempotency: the insert into `webhook_events` on
`(source, event_id)` already makes replays safe, and Stripe does replay.

### 3.5 The one-time payment bug, still open

`onCheckoutCompleted` (`apps/api/src/index.ts`, line 297) opens with:

```ts
if (!session.subscription) return;
```

Program purchases are created with `mode: 'payment'`, so they have no
subscription and get ignored. No invoice is created either (there is no
`invoice_creation`), so they do not come in through `invoice.paid` either.
Concrete consequence: **no program purchase ever reaches Meta.** No Purchase
event means no value optimization and no ROAS, only traffic campaigns. The three
runners programs are membership and do work, which hides the problem in testing.

Fix, whoever ends up charging:

1. Branch on `session.mode`. If it is `payment`, mirror the purchase and fire
   `Purchase` to Meta CAPI plus `purchase` to GA4, using `session.amount_total`
   and the linked attribution.
2. Create the `/thanks` page and use it as `success_url` (today it returns to
   `/pricing?checkout=success`). It also gives the browser-side events a home.
3. While you are in there, add `external_id` and the `fbc` from `fbclid`
   fallback in CAPI `user_data`, which improves match quality.

---

## Part 4: test before trusting any number

```bash
stripe listen --forward-to localhost:8788/webhooks/stripe
```

Minimum cases:

| Case | What it proves |
|---|---|
| Subscription with trial, from our checkout | the happy path still works |
| Cancellation during trial | `bajas_en_trial` counts |
| First real charge | `first_paid_at` and revenue |
| One-time purchase | the bug in 3.5 is actually fixed |
| Charge with no `metadata.source` (created by hand) | the filter still rejects strangers |
| FitBudd charge with the handoff done | matched by (a) or (b), `origin = 'fitbudd'` |
| FitBudd charge with no previous touch | mirrored, unattributed, visible as such |
| A Mindbody studio charge | still ignored, `origin` never becomes `fitbudd` |

The last three are the new ones and they are the ones that decide whether the
dashboard tells the truth. Then check in Supabase that
`checkout_attributions`, `subscriptions`, `invoices` and `webhook_events` filled
in, and that `v_channel_funnel` moved the row of the right channel.

---

## Open questions for FitBudd

Sharpened to the chosen scenario. The full integration context is in
[INTEGRATIONS.md](INTEGRATIONS.md).

1. **Metadata pass-through.** Can we attach an arbitrary value (our
   `attribution_id`) to the checkout FitBudd creates, and does it survive to the
   Stripe object as `metadata` or `client_reference_id`? This one answer decides
   whether attribution is exact or approximate.
2. **Its own webhooks.** Does FitBudd emit webhooks of its own (purchase, trial
   started, cancellation) that we could consume instead of, or alongside, the
   Stripe ones? What is in the payload, and does it include the customer email?
3. **Shared Stripe account.** Confirm FitBudd charges on the **same** Stripe
   account as the studios, and how it is connected: Stripe Connect, OAuth, or a
   pasted secret key. The answer determines whether the `application` field can
   discriminate its events from Mindbody's.
4. **Read API.** Is there an API to list subscriptions, members and their
   status? A nightly reconciliation against it is the cheapest safety net
   against a missed webhook, and it also covers in-app purchases that never
   touch Stripe at all.
5. **In-app purchases.** If someone subscribes through the App Store or Google
   Play instead of Stripe, does that sale appear in Stripe? If not, it will
   never reach our dashboard through this path and needs its own answer.
6. **Who owns the catalog.** Do FitBudd's plans use products and prices we
   create, or ones it creates? Duplicated products split revenue in Stripe's own
   reports before we even get to ours.
7. **Existing Trainerize members.** Is there a migration, and do migrated
   members generate Stripe events that would look like new sales?

---

## Relevant files

| File | What is in it |
|---|---|
| `apps/api/src/index.ts` | `/checkout`, `/webhooks/stripe`, provenance filter (154 to 192), helpers |
| `apps/web/app/lib/attribution.ts` | attribution capture, `startCheckout()`, pixel events |
| `supabase/migrations/00000000000001_init.sql` | tables: `checkout_attributions`, `subscriptions`, `invoices`, `program_prices`, `webhook_events` |
| `supabase/migrations/20260725190000_ad_level_funnel.sql` | `v_campaign_funnel` view (per ad) |
| `supabase/migrations/20260818120000_channel_attribution.sql` | `channel_of()` and the three channel views |
| [ANALYTICS.md](ANALYTICS.md) *(Spanish)* | measurement contract, channel classifier, the UTMs ads must use |
| [INTEGRATIONS.md](INTEGRATIONS.md) | Mindbody, Trainerize and FitBudd, who charges what |
