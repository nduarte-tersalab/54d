**English** · [Español](STRIPE.es.md)

# Stripe payments

Status, how it works today, what is missing, and the three known problems.
If you are here to wire payments, this is your document.

---

## Status at a glance

| | Status |
|---|---|
| Checkout code | **Done** (`apps/api/src/index.ts`, `POST /checkout`) |
| Stripe webhook | **Done**, with provenance filter and idempotency |
| Per-ad attribution | **Done** (front-end capture → table → mirror → SQL view) |
| Stripe keys | **MISSING** (never configured) |
| Real price IDs | **MISSING**: 30 `PENDING_*` placeholders |
| One-time Purchase event | **KNOWN BUG**, no conversion fires (see below) |
| `/thanks` page | **Does not exist** |

**Nothing can charge yet.** Every buy CTA returns `503
payments_not_configured` on purpose, so the front end does not show a fake
network error.

---

## How the flow works today

```
Meta Ad
  → landing (captures utm_*, fbclid, _fbp/_fbc, gclid, ga_client_id, landing_path)
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

The `v_campaign_funnel` view (in
`supabase/migrations/20260725190000_ad_level_funnel.sql`) joins all of that to
answer, per ad: how many trials, how many purchases, how many cancellations.

### The provenance filter (do not remove it)

The Stripe account **may be shared** with other platforms (today Mindbody
charges the studios; tomorrow FitBudd might charge the app). Their charges
would hit our webhook and pollute the ad metrics.

So every event passes a gate:

```ts
// checkout.session.completed
if (s.metadata?.source === '54d-web' && s.metadata?.attribution_id) { ... }

// customer.subscription.*
const isOurs = sub.metadata?.source === '54d-web' || await subscriptionExists(supabase, sub.id);

// invoice.*
if (await invoiceIsOurs(supabase, inv)) { ... }
```

A detail that is expensive to discover on your own: **Session metadata does NOT
propagate to the Subscription.** That is why it is set twice, once in
`metadata` and once in `subscription_data.metadata`.

---

## What is left to do

### 1. Load the keys

In Cloudflare (production) and in `apps/api/.dev.vars` (local):

```
STRIPE_SECRET_KEY=sk_live_...      # or sk_test_ to test
STRIPE_WEBHOOK_SECRET=whsec_...
```

```bash
cd apps/api
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

Webhook endpoint to register in Stripe:
`https://54d-api.54d.workers.dev/webhooks/stripe`

Events to subscribe: `checkout.session.completed`, `invoice.paid`,
`invoice.payment_failed`, `customer.subscription.created|updated|deleted`.

### 2. Create products and prices, and replace the 30 placeholders

`PENDING_*` currently lives in three places:

| File | How many | What they are |
|---|---|---|
| `apps/web/app/data/program-landings.ts` | 14 | the 13 programs (+1 repeated) |
| `apps/web/app/routes/on.tsx` | 13 | the program showcase |
| `apps/web/app/routes/pricing.tsx` | 3 | the membership plans |

Real prices (verified against store.54d.com/packs on 2026-07-25):

- **Membership**: USD 54/month · 156/quarter · 588/year. 7-day trial.
- **One-time programs**: Reset 7 USD 19 · Emergency Kit / Max Burn / First Move / Booty on Fire USD 39 · Full Body 95 · Lower/Upper Body 185 · 54D ON 385 · Step 2 400.
- **Runners (5K/10K/21K)**: membership only, not sold separately.

There is a **mirror in Supabase**: the `program_prices` table stores
`stripe_price_id`, `interval` and `trial_days`. The endpoint reads it to decide
`mode` and trial. **Update it alongside the code**, or checkout will create
sessions in the wrong mode.

### 3. Fix the one-time-payment conversion bug

`onCheckoutCompleted` (around line 297 of `apps/api/src/index.ts`) opens with:

```ts
if (!session.subscription) return;
```

Program purchases are created with `mode: 'payment'`, so they **have no
subscription and get ignored**. No invoice is created either (there is no
`invoice_creation`), so they do not come through `invoice.paid` either.

Concrete consequence: **no program purchase ever reaches Meta.** Without a
Purchase event there is no value optimization and no ROAS; only traffic
campaigns are possible. The 3 runners programs (which are membership) do work,
which hides the problem during testing.

What to do:

1. In `onCheckoutCompleted`, branch on `session.mode`: if it is `payment`,
   mirror the purchase and fire `Purchase` to Meta CAPI + `purchase` to GA4,
   using `session.amount_total` and the linked attribution.
2. Create the `/thanks` page and use it as `success_url` (today it returns to
   `/pricing?checkout=success`). It also gives you a home for browser-side events.
3. While you are in there: add `external_id` and the `fbc`-from-`fbclid`
   fallback in CAPI `user_data`, which improves match quality.

### 4. Test end to end

```bash
stripe listen --forward-to localhost:8788/webhooks/stripe
```

Minimum cases: subscription with trial, cancellation during trial, first real
charge, one-time purchase, and a **foreign** charge (created by hand in Stripe
without `metadata.source`) to confirm the filter ignores it.

Check in Supabase that `checkout_attributions`, `subscriptions`/purchases and
`webhook_events` filled in, and that `v_campaign_funnel` returns the row with
the ad's `utm_content`.

---

## FitBudd

Covered in [INTEGRATIONS.md](INTEGRATIONS.md), but what matters here:

FitBudd brings **its own Stripe integration**. Before writing any code, decide
**who charges**, because per-ad attribution depends on it:

- **If our checkout charges** and we provision the user in FitBudd through
  their API after the webhook → we keep all measurement. This is the option
  that preserves what is already built.
- **If FitBudd charges** → we lose the ad → sale link, unless it can be rebuilt
  from whatever metadata FitBudd lets us pass through.

Either way, if they share the same Stripe account, **the provenance filter
already covers you**: FitBudd charges will not pollute the metrics as long as
they do not carry `metadata.source = '54d-web'`.

---

## Relevant files

| File | What is in it |
|---|---|
| `apps/api/src/index.ts` | `/checkout`, `/webhooks/stripe` and all helpers |
| `apps/web/app/lib/attribution.ts` | attribution capture, `startCheckout()`, pixel events |
| `supabase/migrations/00000000000001_init.sql` | tables: `checkout_attributions`, `subscriptions`, `program_prices`, `webhook_events` |
| `supabase/migrations/20260725190000_ad_level_funnel.sql` | `v_campaign_funnel` view |
| [ANALYTICS.md](ANALYTICS.md) *(Spanish)* | measurement contract and the UTMs ads must use |
