**English** · [Español](README.es.md)

# 54D

Website and platform for 54D: the 54-day transformation method.
Two products with very different audiences and price points, in one codebase:

| Product | What it is | Price | Funnel |
|---|---|---|---|
| **54D ON** | Online program in its own app | from USD 54/month | Meta Ads → self-service checkout |
| **54D Studios** | In person, 5 locations | ~USD 60,000/year | Local SEO → consultation request |

> Keeping the two apart is a **business rule, not a design preference**.
> Read [docs/marketing/BRAND_SEPARATION.md](docs/marketing/BRAND_SEPARATION.md)
> before moving copy or imagery between sections.

**Production:** https://54d-web.54d.workers.dev · **API:** https://54d-api.54d.workers.dev

---

## Getting started (15 minutes)

If this is your first day, follow **[docs/ONBOARDING.md](docs/ONBOARDING.md)**:
step-by-step setup, which credentials to request, and how to verify everything
works.

Short version, if your environment is already set up:

```bash
npm install --prefix apps/web && npm install --prefix apps/api
npm run dev --prefix apps/web   # site at http://localhost:5173
npm run dev --prefix apps/api   # API at  http://localhost:8788
```

Needs Node 20+ (developed on 24) and env files that are **not in the repo**:
`apps/web/.env` and `apps/api/.dev.vars`. Copy the `.example` files and ask for
the real values.

---

## Stack

- **Web** — React Router v7 (framework mode) on Cloudflare Workers, SSR.
  Bilingual EN/ES with browser detection.
- **API** — Hono Worker: Stripe checkout, webhooks, leads, Mindbody proxy,
  server-side events to Meta CAPI and GA4.
- **Data** — Supabase (Postgres + Auth). Versioned migrations in `supabase/migrations/`.
- **Payments** — Stripe direct. *(Shopify, WordPress and Hotmart are gone.)*

```
54d/
├── apps/
│   ├── web/            # public site + /admin
│   │   ├── app/routes/         # one route per page
│   │   ├── app/data/           # program and location catalogs
│   │   ├── app/lib/            # i18n, attribution, asset helpers
│   │   └── public/images/      # client-approved media
│   └── api/            # Hono Worker (src/index.ts is nearly all of it)
├── packages/design/    # tokens and fonts
├── supabase/migrations/
└── docs/               # this documentation
```

---

## Documentation

**Start here**

| Document | For what |
|---|---|
| [ONBOARDING.md](docs/ONBOARDING.md) | Local setup, credentials, first verification |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the pieces fit and why *(Spanish)* |
| [STATUS.md](docs/STATUS.md) | What ships, what is missing, what is blocked |

**Work in progress**

| Document | For what |
|---|---|
| [STRIPE.md](docs/STRIPE.md) | Payment status, what is left to wire, known bugs |
| [INTEGRATIONS.md](docs/INTEGRATIONS.md) | Mindbody, Trainerize and **FitBudd**: what each one does |
| [ANALYTICS.md](docs/ANALYTICS.md) | Measurement contract and per-ad attribution *(Spanish)* |
| [DEPLOY.md](docs/DEPLOY.md) | How it ships *(Spanish)* |

**Product context** (read before changing content)

- [marketing/BRAND_SEPARATION.md](docs/marketing/BRAND_SEPARATION.md) — the hard ON vs Studios rule
- [marketing/SITE_STRATEGY.md](docs/marketing/SITE_STRATEGY.md) — what each page does
- [marketing/PROGRAM_LANDINGS.md](docs/marketing/PROGRAM_LANDINGS.md) — the 13 ad landing pages
- [design/](docs/design/) — history of the design rounds and their rules

> The five documents above (README, ONBOARDING, STRIPE, INTEGRATIONS, STATUS)
> exist in English and Spanish, switchable from the header of each file. The
> older design and marketing docs are Spanish-only: they are historical
> context, not required reading to work on the code.

---

## Project rules

These get broken by accident all the time. They apply to code, copy and images:

1. **Never invent data.** Testimonials, result figures, addresses and phone
   numbers come from verified sources (real App Store reviews, Google Business
   profiles). No data, no publishing.
2. **No boxing gear, no orange cones** in imagery. The client removed the heavy
   bags from the studios; there is a banned-asset list in the comments of
   `apps/web/app/data/program-landings.ts`.
3. **No in-person gym photos in ON context** (`/on`, `/pricing`, `/programs/*`).
   That product is online: photos are set, app or results.
4. **Always bilingual.** Every visible string needs EN and ES. Neutral Spanish
   with *tuteo*, never *voseo*.
5. **No em dashes** in visible copy (CI greps for them).
6. **One yellow primary button per view** (secondaries are ghost).
7. **Never commit secrets.** `.env*` and `.dev.vars*` are gitignored; if you
   touch one, check `git status` before committing.

---

## Verify before committing

```bash
npm run typecheck --prefix apps/web   # must exit with 0 errors
```

There is no automated test suite: verification is **visual and measured**. Many
layout changes were validated with Playwright measuring the real DOM (button
heights, overflow, alignment). If you touch layout, look at the page at both
1440 and 390 and in both languages before calling it done.
