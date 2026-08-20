# 54D: contrato de medición

Objetivo: saber de qué CANAL vienen las ventas, los free trials y los leads
(Meta, newsletter, orgánico, SEO, directo), y dentro de Meta saber por CADA
anuncio cuántos trials arranca, cuántos convierten y cuántos cancelan. Sin
contaminación de Mindbody y sin depender solo del pixel del browser.

Este documento está solo en español: es la herramienta interna del equipo.
Para conectar Stripe ver [STRIPE.md](STRIPE.es.md).

## 1. La cadena completa (dónde vive cada eslabón)

```
Ad de Meta ──click──> 54d.com?utm_*&fbclid=...
                        │  captureAttribution() guarda first-touch
                        │  (utm_source/campaign/CONTENT, fbclid, fbp/fbc,
                        │   ga_client_id, landing, referrer) en localStorage
                        ▼
              Botón de compra → POST /checkout
                        │  fila en checkout_attributions +
                        │  session.metadata { attribution_id, source:'54d-web' }
                        │  subscription.metadata idem (se setea aparte:
                        │  la metadata de session NO se propaga)
                        ▼
              Stripe Checkout → webhooks → espejo en Supabase
                        │  trial_start / first_paid_at / canceled_at
                        │  linkeados a la atribución original
                        ▼
        CAPI (Meta) + GA4 server-side con fbclid/fbp/fbc
        └─> Meta matchea el evento al AD exacto que originó el click
```

Dos agrupaciones sobre el mismo espejo:

- `v_campaign_funnel` agrupa por fuente + campaña + **anuncio** (utm_content).
  Sirve para optimizar pauta.
- `v_channel_funnel` agrupa por **canal comercial**. Sirve para responder la
  pregunta del negocio: de dónde viene la plata.

## 2. OBLIGATORIO en Meta Ads Manager: parámetros de URL

En cada campaña (o en la plantilla de la cuenta), campo "URL parameters":

```
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Sin `utm_content={{ad.name}}` NO hay medición por anuncio. El fbclid lo agrega
Meta solo. Regla de equipo: nombres de ads estables (renombrar un ad parte su
historia en dos filas).

Para newsletter, la misma disciplina del otro lado: `utm_medium=email` o
`utm_source=newsletter` en cada link que salga de Klaviyo o Mailchimp. Sin eso,
un click de newsletter se clasifica como `referral` o `direct`.

## 3. El problema Mindbody⇄Stripe y cómo estamos blindados

Mindbody cobra los studios y puede estar vinculado A LA MISMA cuenta de Stripe
(se vincula con un account ID). Eso significa que NUESTRO webhook recibe también
los eventos de Mindbody.

Defensa implementada (apps/api):
- Todo objeto creado por el sitio lleva `metadata.source = '54d-web'` (checkout
  session Y subscription).
- El webhook IGNORA: sessions sin nuestra marca, subscriptions sin marca que
  tampoco existan ya en nuestro espejo, e invoices cuya subscription no esté en
  el espejo.
- Resultado: los cobros de Mindbody no tocan `subscriptions`, ni `invoices`, ni
  las vistas de métricas, ni disparan CAPI/GA4.

**Cambio de escenario**: ahora que FitBudd va a cobrar con su integración nativa
en la misma cuenta, este filtro binario deja afuera también las ventas de la app,
que sí queremos contar. La solución es convertirlo en clasificador de tres vías
(`web`, `fitbudd`, `foreign`) sin dejar entrar a Mindbody. Está especificado en
[STRIPE.md](STRIPE.es.md), parte 3.

**Pregunta abierta al cliente**: confirmar qué cuenta usa Mindbody y la relación
Mindbody/Trainerize (la app actual es white-label de Trainerize).

## 4. Definiciones exactas de las métricas (para no discutirlas después)

| Métrica | Definición técnica |
|---|---|
| Checkout iniciado | fila en checkout_attributions (click en comprar) |
| Trial iniciado | subscription con trial_start (webhook) |
| Conversión paga | first_paid_at ≠ null (primer invoice.paid > $0) |
| Activa hoy | status = 'active' |
| Cancelada | status = 'canceled' |
| Baja en trial | canceled sin first_paid_at (probó y no pagó) |
| Revenue | suma de invoices status paid (centavos) |
| Conversión % | conversiones pagas / checkouts iniciados, redondeado a 1 decimal |

## 5. Atribución por canal (infraestructura ya creada)

Migración: `supabase/migrations/20260818120000_channel_attribution.sql`,
**aplicada en producción**. Define un clasificador y tres vistas.

### 5.1 `channel_of()`, la fuente única de verdad

```sql
channel_of(utm_source, utm_medium, referrer, fbclid, gclid) returns text
```

Función `immutable`. Toda vista que agrupe por origen tiene que usarla, para que
dashboard, leads y ventas cuenten igual. Si mañana hay que reclasificar un canal,
se toca acá y cambia en todos lados a la vez.

Canales que devuelve, en el orden de precedencia con el que se evalúan (lo más
específico primero):

| Canal | Cuándo |
|---|---|
| `meta_ads` | hay `fbclid`, o `utm_source` de Meta/Facebook/IG con `utm_medium` pago |
| `meta_organic` | `utm_source` de Meta/Facebook/IG sin medium pago |
| `google_ads` | hay `gclid` |
| `paid_other` | `utm_medium` en cpc / ppc / paid, sin caer en los anteriores |
| `newsletter` | `utm_medium` email / newsletter / mail, o `utm_source` newsletter / klaviyo / mailchimp / email |
| `seo` | sin `utm_source` y con referrer de buscador (google, bing, duckduckgo, yahoo, ecosia, brave), o `utm_medium = organic` |
| `social_organic` | referrer de t.co, twitter, x.com, linkedin, tiktok, youtube, whatsapp |
| `direct` | sin `utm_source` y sin referrer (escribió la URL, QR, app) |
| `referral` | sin `utm_source` pero con referrer de otro sitio |
| *(utm_source en minúscula)* | cualquier UTM que no encaje en ninguna regla, se muestra crudo para no perderlo |

Verificado en vivo contra la base productiva: `channel_of('meta','paid',...)`
devuelve `meta_ads`; un referrer de Google sin UTM devuelve `seo`; medium `email`
devuelve `newsletter`; todo vacío devuelve `direct`.

### 5.2 Las tres vistas

Las tres son `security_invoker = on`, o sea que respetan la RLS de quien
consulta: solo un usuario con rol staff ve las filas.

**`v_channel_funnel`**, el bloque principal del dashboard.

| Columna | Qué es |
|---|---|
| `channel` | resultado de `channel_of` |
| `checkouts_iniciados` | filas de checkout_attributions |
| `trials_iniciados` | subscriptions con trial_start |
| `conversiones_pagas` | subscriptions con first_paid_at |
| `activas_hoy` | status active |
| `canceladas` | status canceled |
| `bajas_en_trial` | canceled sin first_paid_at |
| `revenue_cents` | suma de invoices pagos, en centavos |
| `conversion_pct` | conversiones pagas sobre checkouts, 1 decimal |

Ordenada por `revenue_cents` descendente, así el canal que más factura queda
arriba.

**`v_leads_by_channel`**, lo mismo para leads (sedes y assessment, que no pasan
por checkout).

| Columna | Qué es |
|---|---|
| `channel` | `channel_of(utm_source, utm_medium, null, null, null)` |
| `leads_total` | total de leads |
| `nuevos` | status new |
| `contactados` | status contacted |
| `ultimos_30d` | creados en los últimos 30 días |
| `sincronizados_mindbody` | tienen mindbody_client_id |

**`v_channel_daily`**, serie diaria de los últimos 90 días para el gráfico de
tendencia: `dia`, `channel`, `checkouts`, `trials`, `ventas`, `revenue_cents`.

### 5.3 Dónde se consumen

- `v_channel_funnel` y `v_channel_daily`: dashboard de `/admin`
  (`apps/web/app/routes/admin.tsx`), junto con `v_subscription_summary` y
  `v_campaign_funnel`. Mismo patrón para las cuatro: fetch desde el cliente
  cuando `useAdminGuard` confirma sesión.
- `v_leads_by_channel`: resumen por canal en `/admin/leads`
  (`apps/web/app/routes/admin-leads.tsx`).
- El admin es la única superficie del sitio que queda en español, porque es
  herramienta interna del equipo del cliente.

Con cero ventas reales las tres vistas devuelven cero filas. El dashboard tiene
que decir que falta conectar Stripe, no mostrar un cero mudo ni un gráfico roto.

### 5.4 Límites conocidos de estas vistas (leerlos antes de sacar conclusiones)

1. **Los leads tienen menos precisión que las ventas.** La tabla `leads` guarda
   `utm_source` y `utm_medium`, pero no referrer ni click ids. Por eso
   `v_leads_by_channel` llama a `channel_of` con los últimos tres argumentos en
   null, y un lead orgánico que llegó por Google sin UTM cae en `direct`, no en
   `seo`. Para igualar la precisión habría que agregar `referrer` y `fbclid` a
   `leads` y al contrato de `POST /leads`, que hoy no se toca.
2. **El revenue solo cuenta suscripciones.** `revenue_cents` suma `invoices`
   unidas por `subscription_id`. Las compras de un pago (`mode: 'payment'`) no
   generan invoice ni suscripción, así que aportan cero. Es el mismo bug de
   conversión descrito en [STRIPE.md](STRIPE.es.md), parte 3.5.
3. **Una venta sin fila en `checkout_attributions` es invisible, no
   "desatribuida".** Las vistas arrancan `from checkout_attributions`, así que si
   FitBudd cobra sin que el sitio haya registrado el touch, esa venta no aparece
   en ninguna fila, ni siquiera en una de canal desconocido. Es la razón por la
   que el handoff de la parte 2 de STRIPE.md no es opcional.
4. **First-touch, no last-touch.** `captureAttribution()` guarda el primer touch
   con campaña y no lo pisa salvo que llegue una campaña nueva. Es una decisión,
   no un accidente: es la que responde "qué anuncio trajo a esta persona".

## 6. Dedup pixel vs CAPI

Los eventos server-side van con `event_id` determinístico (id de
subscription/invoice). Cuando el Pixel del browser esté activo
(VITE_META_PIXEL_ID), usar el MISMO event_id en ambos lados: Meta deduplica solo.
Nunca mandar Purchase solo desde el browser: el webhook es la fuente de verdad
(el usuario puede cerrar la pestaña antes del redirect de vuelta).

Regla nueva para el escenario FitBudd: **solo se emite a CAPI cuando el match de
atribución es determinístico**. Una conversión adivinada por ventana temporal le
enseña al algoritmo a optimizar hacia la audiencia equivocada, y eso es caro y
lento de revertir. Ver [STRIPE.md](STRIPE.es.md), parte 2.

## 7. Pendientes para activar la cadena completa

1. Stripe keys (sk_test primero) → crear productos/precios, reemplazar `PENDING_`
   en `program_prices`, configurar el webhook endpoint. Checklist ejecutable en
   [STRIPE.md](STRIPE.es.md), parte 1.
2. Handoff de atribución hacia FitBudd y clasificador de tres vías en el webhook
   (partes 2 y 3 de STRIPE.md). Sin esto, las ventas de la app no llegan al
   dashboard.
3. META_PIXEL_ID + META_CAPI_ACCESS_TOKEN (Events Manager → Conversions API).
4. GA4_MEASUREMENT_ID + GA4_API_SECRET.
5. Página `/thanks` para el success_url (dispara los eventos browser-side con el
   mismo event_id del server).
6. Test end-to-end con Test Events de Meta antes de prender campañas.
