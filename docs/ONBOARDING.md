**English** · [Español](ONBOARDING.es.md)

# Onboarding

Goal: get the site and the API running on your machine, and know what to look
at first. About 15 minutes if you already have the credentials.

## 0. Before you start: request access

None of this is in the repo (nor should it be). Ask Nicolás for:

| What | For what | Without it |
|---|---|---|
| `apps/web/.env` | Supabase publishable key, API URL | The site still starts |
| `apps/api/.dev.vars` | Supabase (secret), Mindbody, Stripe, Meta, GA4 | The API starts, but endpoints that touch data fail |
| Supabase project access | See data, run migrations | You can read the schema in `supabase/migrations/` |
| Cloudflare access | Deploy | You can develop without it |
| Stripe access | The payments work | See [STRIPE.md](STRIPE.md) |

Both env files have a versioned `.example` showing which variables go in.
Copy them and fill in:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/web/.env.example apps/web/.env
```

## 1. Install

Node 20 or higher (the team runs 24). There are no workspaces configured: each
app installs separately.

```bash
npm install --prefix apps/web
npm install --prefix apps/api
```

## 2. Run

Two terminals:

```bash
npm run dev --prefix apps/web   # http://localhost:5173
```

```bash
npm run dev --prefix apps/api   # http://localhost:8788
```

The site works without the API: forms and checkout fail gracefully (a message
to the user, not a broken screen). For frontend work, running `web` is enough.

## 3. Verify it worked

```bash
curl -s -o /dev/null -w "web:%{http_code}\n" http://localhost:5173/
curl -s http://localhost:8788/health          # {"ok":true}
npm run typecheck --prefix apps/web           # 0 errors
```

Open these pages and compare against production (https://54d-web.54d.workers.dev):

- `/` — the gate: video, two doors (Studios / ON)
- `/on` — the sales page for the online product
- `/programs/max-burn` — one of the 13 ad landing pages
- `/studios/coral-gables` — a location, with its lead form
- `/assessment` — the lead magnet

Try the language switch in the header. Language is detected from the browser
and remembered in the `54d_lang` cookie.

## 4. How the code is organized

**One route = one file** in `apps/web/app/routes/`. Routes are registered in
`apps/web/app/routes.ts`.

The two files you will touch most:

- `apps/web/app/data/program-landings.ts` — the catalog for all 13 programs.
  Each has hook, bullets, FAQ, pricing, photos and quick wins, in EN and ES.
  **Changing a landing page's content is almost always editing this file, not
  the template.**
- `apps/web/app/routes/program-landing.tsx` — the single template that renders
  all 13. A change here hits every one of them.

Same split for locations: `apps/web/app/data/studios.ts` (data) and
`apps/web/app/routes/studio-detail.tsx` (template).

**The API is basically one file**: `apps/api/src/index.ts`.
Endpoints: `/health`, `/checkout`, `/webhooks/stripe`, `/mindbody/classes`, `/leads`.

**Styles**: `apps/web/app/app.css` holds the system (color, type, spacing and
control-height tokens). Styles local to one page live inline or in a `<style>`
block inside that route.

## 5. Conventions that matter

They are in the [README](../README.md#project-rules). The three most often
broken by accident:

- Every new string needs **EN and ES**. The pattern is `Record<Lang, string>`
  in data, or `es ? "..." : "..."` in JSX.
- **No em dashes** in visible copy.
- **Button heights come from tokens** (`--btn-h`, `--btn-h-sm`, `--btn-h-nav`),
  never from eyeballed padding. There was a whole round to fix this; adding a
  button with its own height breaks it again.

## 6. Ship

See [DEPLOY.md](DEPLOY.md) *(Spanish)*. In short:

```bash
source .env.cloudflare
cd apps/web && VITE_API_URL=https://54d-api.54d.workers.dev npm run build && npx wrangler deploy
```

The build takes a config **snapshot**: if you change `wrangler.toml`, rebuild
before deploying or you ship the old version.

## 7. Where to go next

1. [STATUS.md](STATUS.md) — the real state: what is done and what is waiting on client data.
2. [STRIPE.md](STRIPE.md) — if you are here to wire payments, that is your document.
3. [ARCHITECTURE.md](ARCHITECTURE.md) *(Spanish)* — the money and attribution flow, the heart of the project.
