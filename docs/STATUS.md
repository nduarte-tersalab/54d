**English** · [Español](STATUS.es.md)

# Project status

Snapshot as of **18 August 2026**. What is done, what is missing, and most
importantly **what is blocked waiting on something external**.

Keep this file current: it is the first thing a new joiner reads.

---

## Done and in production

**Public site** — 24 routes, all bilingual EN/ES with browser detection and a
manual switcher (`54d_lang` cookie).

| Route | What it is |
|---|---|
| `/` | The gate: video + two doors (Studios / ON). No header or footer, deliberately. |
| `/on`, `/pricing` | Online product sales: membership, 13 programs, the app |
| `/programs/:slug` | 13 ad landing pages, one template + data |
| `/studios`, `/studios/:slug` | Index with carousel + 5 locations |
| `/method`, `/blog`, `/contact` | Content and contact |
| `/assessment` | Lead magnet: 12 questions → name + WhatsApp → `/leads` |
| `/privacy`, `/terms` | Legal (`routes/legal.tsx`, one route with two ids) |
| `/admin/*` | Dashboard: login, metrics, leads, blog and program CRUD |

**API** (`apps/api/src/index.ts`): `/health`, `/checkout`, `/webhooks/stripe`,
`/mindbody/classes`, `/leads`.

**Data**: schema applied in Supabase with a seeded catalog (15 programs, 13
prices), attribution, subscription mirror, webhook events and the
`v_campaign_funnel` view for the per-ad funnel.

**Local SEO**: NAP verified against the real Google Business profiles of all 5
locations, `ExerciseGym` JSON-LD with phone, geo and `hasMap`, sitemap and robots.

**Verified content**: real App Store testimonials (harvested from the public
iTunes RSS), official client before/afters, 17 named coaches, official covers
for the 10 programs.

---

## Blocked, waiting on the client

This is **not tech debt**: the code is written and waiting for data.

| What is missing | Blocks | Detail |
|---|---|---|
| **Stripe keys** | The site being able to charge | See [STRIPE.md](STRIPE.md). Every CTA returns `503 payments_not_configured` today |
| **Real price IDs** | Same | 30 `PENDING_*` placeholders across 3 files |
| **Mindbody go-live** | Live schedules per location | `usertoken/issue` returns `DeniedAccess`. The UI already falls back to static schedules without breaking |
| **FitBudd answers** | Rebuilding attribution once FitBudd charges | Direction is decided (FitBudd charges natively). What is missing is whether it supports metadata pass-through: see [INTEGRATIONS.md](INTEGRATIONS.md) |
| **Allumi / Helvetica Neue Condensed fonts** | Final typography | Running on Archivo / Archivo Narrow as stand-ins; the swap is one `@font-face` change |
| **META_PIXEL_ID, CAPI token, GA4** | Real measurement | The code reads them from env and activates itself when they exist |
| **Full weekly schedules per location** | Publishing the complete grid | There is a base table today; the detailed one would come from Mindbody |
| **NAP for MX and CO** | Local SEO for those 3 locations | The 2 US ones are verified; CDMX and Bogotá come from unclaimed profiles |

---

## Known debt

Ours, in priority order:

1. **One-time Purchase does not fire** — the most expensive bug. Program
   purchases (`mode: 'payment'`) produce no conversion event, so Meta cannot
   optimize for value. Detail and fix in
   [STRIPE.md](STRIPE.md#3-fix-the-one-time-payment-conversion-bug).
2. **No `/thanks` page** — `success_url` returns to `/pricing`. Needed for
   browser-side conversion events.
3. **Blog without CMS** — `apps/web/app/routes/blog.tsx` has 3 hardcoded posts
   and the cards link to `#`. The table exists in Supabase and the CRUD is at
   `/admin/blog`: the public `/blog/:slug` route and the index wiring are missing.
4. **No test suite** — verification is visual and measured (Playwright against
   the real DOM). If the team grows, this is the first thing worth adding.
5. **Blog authors are placeholders** — "Head Coach, 54D" and generic
   credentials. E-E-A-T wants real names.
6. **Static sitemap** — updated by hand; worth generating once the blog is dynamic.

---

## History that explains odd decisions

Things that look arbitrary and are not:

- **The home gate has no header or footer.** Deliberate: the visitor chooses
  between two products of very different price before seeing anything else.
- **`/studios*` never mentions ON** (not in nav, footer or app banner). It is
  the hard brand-separation rule: a USD 60,000 buyer should not run into the
  USD 54 version.
- **Button heights are tokens.** Six different heights coexisted because they
  were derived from padding; now they are declared (`--btn-h`, `--btn-h-sm`,
  `--btn-h-nav`).
- **There is a banned-image list** in the comments of `program-landings.ts`:
  boxing bags (the client removed them from the studios) and orange cones. They
  slipped in three separate times.
- **Banned assets are quarantined** outside `public/`, in
  `apps/web/design-assets/prohibited-studios/`, so they cannot come back by
  accident.
- **In a few months Studios drops the program model** and becomes a traditional
  studio (client heads-up, no firm date). When that happens, all the Generation,
  admission and graduation content needs repositioning.
