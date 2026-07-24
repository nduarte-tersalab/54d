# 54D — Deploy

## Previews

| Entorno | URL | Estado |
|---|---|---|
| GitHub Pages (estático, prerender) | https://nduarte-tersalab.github.io/54d/ | Auto en cada push a `main` (workflow `pages.yml`) |
| Cloudflare workers.dev (SSR real) | pendiente de API token | — |
| Producción 54d.com | NO tocar hasta plan de corte (hoy sirve el Shopify del cliente) | — |

Nota Pages: requiere repo público o plan GitHub Pro/Team si es privado.
El preview de Pages es solo visual: sin API worker, checkout y forms de leads
no operan. El admin sí funciona (Supabase es acceso directo desde el browser).

## Workers Builds (CI de Cloudflare) — settings al conectar el repo

Dashboard → Workers → Create → Connect to Git → `nduarte-tersalab/54d`.
Son DOS workers sobre el mismo repo:

**54d-web**
- Root directory: `apps/web`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Variables de build: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_API_URL` (URL del worker 54d-api), `VITE_GA4_ID`, `VITE_META_PIXEL_ID`

**54d-api**
- Root directory: `apps/api`
- Build command: (vacío)
- Deploy command: `npx wrangler deploy`
- Secrets (via `wrangler secret put` o dashboard → Settings → Variables):
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`,
  `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`
- Var no secreta: `SITE_URL` = URL pública del sitio

## Deploy manual (cuando haya API token)

```bash
export CLOUDFLARE_API_TOKEN=...   # template "Edit Cloudflare Workers"
export CLOUDFLARE_ACCOUNT_ID=...
cd apps/api && npx wrangler deploy
cd apps/web && npm run build && npx wrangler deploy
```

## Stripe webhooks (cuando haya keys)

Endpoint: `https://<54d-api>.workers.dev/webhooks/stripe`
Eventos: `checkout.session.completed`, `customer.subscription.*`,
`invoice.paid`, `invoice.payment_failed`. El `whsec_` va a `STRIPE_WEBHOOK_SECRET`.
