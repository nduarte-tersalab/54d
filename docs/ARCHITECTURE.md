# 54D — Arquitectura

Stack decidido: **Supabase** (Postgres + Auth + Storage) + **Cloudflare Workers**.
Cobro: **Stripe directo** (Shopify, WordPress y Hotmart quedaron atrás — migrado).
Local por ahora; deploy a Workers cuando esté maduro.

## Apps (monorepo)

```
54d/
├── apps/
│   ├── web/        # Sitio público: home (video hero), programas, studios, blog
│   └── api/        # Worker Hono: Stripe checkout+webhooks, Meta CAPI, GA4 MP, Mindbody
├── packages/
│   └── design/     # tokens.css + fuentes licenciadas
├── supabase/
│   └── migrations/ # schema versionado
└── docs/
```

El dashboard (ABM blog, programas, métricas) vive en `apps/web` bajo `/admin`,
protegido por Supabase Auth + tabla `profiles` (role admin/editor). Si crece,
se extrae a worker propio sin tocar la DB.

## Flujo de dinero + atribución (el corazón del proyecto)

```
Meta Ad → landing (utm_*, fbclid en URL; cookies _fbp/_fbc)
  → CTA "Empezar trial"
  → POST /api/checkout  ── guarda checkout_attributions (utm, fbp, fbc, gclid,
  │                        ga_client_id, landing_path) y crea Stripe Checkout
  │                        Session (trial 7 días, client_reference_id = attr.id)
  → Stripe Checkout (hosted)
  → webhook checkout.session.completed
      ├─ upsert stripe_customers + subscriptions (status=trialing)
      ├─ enlaza attribution → subscription
      ├─ Meta CAPI: StartTrial (con fbp/fbc + email hasheado → match quality)
      └─ GA4 Measurement Protocol: begin_trial (client_id de la attribution)
  → webhook invoice.paid (primer cobro real)
      ├─ subscriptions.first_paid_at = now()  ← ESTA es la conversión
      ├─ Meta CAPI: Subscribe/Purchase con valor
      └─ GA4 MP: purchase con valor
```

Reglas:
- **Client-side** (gtag + fbq) para pageviews y eventos de UI.
- **Server-side** (CAPI + GA4 MP) para trial/purchase — inmune a adblockers,
  es lo que Meta necesita para optimizar campañas.
- Deduplicación Meta: mismo `event_id` en pixel y CAPI.
- El dashboard lee `v_campaign_funnel`: trials y compras por utm_campaign →
  responde directo "¿cuántos trials/compras generó cada campaña de Meta?".

## Stripe — decisiones

- Checkout hosted (no Elements) en fase 1: PCI trivial, Apple/Google Pay gratis.
- Un Product por programa; Prices mensual/trimestral/anual espejados en
  `program_prices` (fuente de verdad: Stripe; el espejo evita llamadas API en render).
- Customer Portal de Stripe para autoservicio de cancelación/upgrade en fase 1.
- Webhooks idempotentes vía `webhook_events (source, event_id) unique`.

## Mindbody (presencial)

Fase 1: leads a tabla `leads` + horarios estáticos por sede.
Fase 2: API Mindbody real (site_id por sede en `locations.mindbody_site_id`):
clases/horarios live, booking de clase de prueba. Requiere credenciales
developer del cliente (API Key + staff user por site).

## Sedes

Coral Gables, Hallandale, CDMX (Carso y Santa Fe), Bogotá. **NYC eliminado.**

## Env vars (apps/api)

```
SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
META_PIXEL_ID / META_CAPI_ACCESS_TOKEN
GA4_MEASUREMENT_ID / GA4_API_SECRET
MINDBODY_API_KEY (fase 2)
```

## Diseño

- Paleta: amarillo #FFD200 sobre negro #0B0B0B — extraída del CSS real del sitio.
- Display: Allumi Std Extended (uppercase, tracking corto, leading 0.95).
- Body/UI: Helvetica Neue Condensed.
- Hero: video muted/loop (R2 o Cloudflare Stream) con poster image → LCP sano:
  el video se carga lazy tras el poster, `preload="none"`.
- Estética dura: radius 2px, mucho contraste, mucho aire.
