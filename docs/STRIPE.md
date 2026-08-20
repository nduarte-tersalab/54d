# Pagos con Stripe

Estado, cómo funciona hoy, qué falta y los tres problemas conocidos.
Si venís a conectar pagos, este es tu documento.

---

## TL;DR del estado

| | Estado |
|---|---|
| Código de checkout | **Listo** (`apps/api/src/index.ts`, `POST /checkout`) |
| Webhook de Stripe | **Listo**, con filtro de procedencia e idempotencia |
| Atribución por anuncio | **Lista** (captura en el front → tabla → espejo → vista SQL) |
| Claves de Stripe | **FALTAN** (nunca se configuraron) |
| Price IDs reales | **FALTAN**: hay 30 placeholders `PENDING_*` |
| Purchase de pago único | **BUG conocido**, no dispara conversión (ver abajo) |
| Página `/thanks` | **No existe** |

**Nada puede cobrar todavía.** Cada CTA de compra responde `503
payments_not_configured` a propósito, para no mostrar un error de red falso.

---

## Cómo funciona el flujo hoy

```
Meta Ad
  → landing (captura utm_*, fbclid, _fbp/_fbc, gclid, ga_client_id, landing_path)
  → POST /checkout { priceId, attribution }
      1. INSERT en checkout_attributions   ← se guarda ANTES de crear la sesión
      2. lee program_prices para saber interval y trial_days
      3. crea Checkout Session en Stripe:
         - mode: 'payment'       si interval = one_time   (programas sueltos)
         - mode: 'subscription'  si month/quarter/year     (membresía)
         - metadata.source = '54d-web'  ← marca de procedencia
         - client_reference_id = id de la atribución
      4. guarda checkout_session_id en la atribución
  → Stripe Checkout (hospedado por Stripe)
  → POST /webhooks/stripe
      · checkout.session.completed  → espeja customer + subscription, enlaza atribución,
                                      dispara StartTrial (Meta CAPI) y GA4
      · invoice.paid                → first_paid_at: ESTA es la conversión real
      · customer.subscription.*     → estado, cancelaciones, bajas en trial
```

La vista `v_campaign_funnel` (en `supabase/migrations/20260725190000_ad_level_funnel.sql`)
cruza todo eso para responder, por anuncio: cuántos trials, cuántas compras,
cuántas cancelaciones.

### El filtro de procedencia (no lo quites)

La cuenta de Stripe **puede estar compartida** con otras plataformas (hoy
Mindbody cobra los studios; mañana quizá FitBudd cobre la app). Sus cobros
llegarían a nuestro webhook y contaminarían las métricas de ads.

Por eso todo evento pasa por un gate:

```ts
// checkout.session.completed
if (s.metadata?.source === '54d-web' && s.metadata?.attribution_id) { ... }

// customer.subscription.*
const isOurs = sub.metadata?.source === '54d-web' || await subscriptionExists(supabase, sub.id);

// invoice.*
if (await invoiceIsOurs(supabase, inv)) { ... }
```

Detalle que cuesta caro descubrir solo: **la metadata de la Session NO se
propaga a la Subscription**. Por eso se setea dos veces, una en `metadata` y
otra en `subscription_data.metadata`.

---

## Lo que falta hacer

### 1. Cargar las claves

En Cloudflare (producción) y en `apps/api/.dev.vars` (local):

```
STRIPE_SECRET_KEY=sk_live_...      # o sk_test_ para probar
STRIPE_WEBHOOK_SECRET=whsec_...
```

```bash
cd apps/api
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

Endpoint del webhook a registrar en Stripe:
`https://54d-api.54d.workers.dev/webhooks/stripe`

Eventos a suscribir: `checkout.session.completed`, `invoice.paid`,
`invoice.payment_failed`, `customer.subscription.created|updated|deleted`.

### 2. Crear productos y precios, y reemplazar los 30 placeholders

Hoy hay `PENDING_*` en tres lugares:

| Archivo | Cuántos | Qué son |
|---|---|---|
| `apps/web/app/data/program-landings.ts` | 14 | los 13 programas (+1 repetido) |
| `apps/web/app/routes/on.tsx` | 13 | la vitrina de programas |
| `apps/web/app/routes/pricing.tsx` | 3 | los planes de membresía |

Precios reales (verificados contra store.54d.com/packs el 25/07/2026):

- **Membresía**: USD 54/mes · 156/trimestre · 588/año. Trial de 7 días.
- **Programas de un pago**: Reset 7 USD 19 · Emergency Kit / Max Burn / First Move / Booty on Fire USD 39 · Full Body 95 · Lower/Upper Body 185 · 54D ON 385 · Step 2 400.
- **Runners (5K/10K/21K)**: solo por membresía, no se venden sueltos.

Hay un **espejo en Supabase**: la tabla `program_prices` guarda
`stripe_price_id`, `interval` y `trial_days`. El endpoint la lee para decidir
`mode` y trial. **Actualizala junto con el código**, o el checkout va a crear
sesiones con el modo equivocado.

### 3. Arreglar el bug de conversión en pagos únicos

`onCheckoutCompleted` (línea ~297 de `apps/api/src/index.ts`) empieza así:

```ts
if (!session.subscription) return;
```

Las compras de programa se crean con `mode: 'payment'`, así que **no tienen
subscription y se ignoran**. Como tampoco se emite factura (no hay
`invoice_creation`), tampoco entra por `invoice.paid`.

Consecuencia concreta: **ninguna compra de programa llega a Meta**. Sin evento
Purchase no hay optimización por valor ni ROAS; solo se pueden correr campañas
de tráfico. Los 3 programas de runners (que son membresía) sí funcionan, lo que
disimula el problema en las pruebas.

Qué hay que hacer:

1. En `onCheckoutCompleted`, ramificar por `session.mode`: si es `payment`,
   espejar la compra y disparar `Purchase` a Meta CAPI + `purchase` a GA4,
   usando `session.amount_total` y la atribución enlazada.
2. Crear la página `/thanks` y usarla como `success_url` (hoy vuelve a
   `/pricing?checkout=success`). Sirve además para los eventos browser-side.
3. Mientras estés ahí: sumar `external_id` y el fallback de `fbc` desde `fbclid`
   en `user_data` de CAPI, que mejora el match quality.

### 4. Probar de punta a punta

```bash
stripe listen --forward-to localhost:8788/webhooks/stripe
```

Casos mínimos: suscripción con trial, cancelación durante el trial, primer
cobro real, compra de un pago, y un cobro **ajeno** (creado a mano en Stripe
sin `metadata.source`) para confirmar que el filtro lo ignora.

Comprobá en Supabase que se llenaron `checkout_attributions`,
`subscriptions`/compras y `webhook_events`, y que `v_campaign_funnel`
devuelve la fila con el `utm_content` del anuncio.

---

## FitBudd

Está en [INTEGRATIONS.md](INTEGRATIONS.md), pero lo que importa acá:

FitBudd trae **su propia integración con Stripe**. Antes de escribir código hay
que decidir **quién cobra**, porque de eso depende si conservamos la atribución
por anuncio:

- **Si cobra nuestro checkout** y damos de alta al usuario en FitBudd por su
  API tras el webhook → conservamos toda la medición. Es la opción que preserva
  lo que ya está construido.
- **Si cobra FitBudd** → perdemos el vínculo anuncio → venta, salvo que se
  reconstruya con la metadata que FitBudd permita pasar.

En cualquiera de los dos casos, si comparten la misma cuenta de Stripe, **el
filtro de procedencia ya te cubre**: los cobros de FitBudd no van a ensuciar
las métricas mientras no lleven `metadata.source = '54d-web'`.

---

## Archivos relevantes

| Archivo | Qué tiene |
|---|---|
| `apps/api/src/index.ts` | `/checkout`, `/webhooks/stripe` y todos los helpers |
| `apps/web/app/lib/attribution.ts` | captura de atribución, `startCheckout()`, eventos del pixel |
| `supabase/migrations/00000000000001_init.sql` | tablas: `checkout_attributions`, `subscriptions`, `program_prices`, `webhook_events` |
| `supabase/migrations/20260725190000_ad_level_funnel.sql` | vista `v_campaign_funnel` |
| [ANALYTICS.md](ANALYTICS.md) | contrato de medición y los UTM que deben usar los anuncios |
