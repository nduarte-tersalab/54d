# 54D — Contrato de medición de ads

Objetivo: por CADA anuncio de Meta saber cuántos free trials arranca,
cuántos convierten a pago y cuántos cancelan. Sin contaminación de
Mindbody y sin depender solo del pixel del browser.

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

Dashboard: `v_campaign_funnel` agrupa por fuente + campaña + **anuncio**
(utm_content) con checkouts, trials, conversiones, activas, canceladas,
bajas en trial y revenue.

## 2. OBLIGATORIO en Meta Ads Manager — parámetros de URL

En cada campaña (o en la plantilla de la cuenta), campo "URL parameters":

```
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Sin `utm_content={{ad.name}}` NO hay medición por anuncio. El fbclid lo
agrega Meta solo. Regla de equipo: nombres de ads estables (renombrar un
ad parte su historia en dos filas).

## 3. El problema Mindbody⇄Stripe y cómo estamos blindados

Mindbody cobra los studios y puede estar vinculado A LA MISMA cuenta de
Stripe (se vincula con un account ID). Eso significa que NUESTRO webhook
recibe también los eventos de Mindbody.

Defensa implementada (apps/api):
- Todo objeto creado por el sitio lleva `metadata.source = '54d-web'`
  (checkout session Y subscription).
- El webhook IGNORA: sessions sin nuestra marca, subscriptions sin marca
  que tampoco existan ya en nuestro espejo, e invoices cuya subscription
  no esté en el espejo.
- Resultado: los cobros de Mindbody no tocan `subscriptions`, ni
  `invoices`, ni las vistas de métricas, ni disparan CAPI/GA4.

**Recomendación igual**: si se puede, cuenta de Stripe separada para el
sitio (más limpio para conciliar y para los reportes nativos de Stripe).
Si comparten cuenta, el filtro de arriba es la garantía.
**Pregunta abierta al cliente**: confirmar qué cuenta usa Mindbody y la
relación Mindbody/Trainerize (la app es white-label de Trainerize).

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

## 5. Dedup pixel vs CAPI

Los eventos server-side van con `event_id` determinístico (id de
subscription/invoice). Cuando el Pixel del browser esté activo
(VITE_META_PIXEL_ID), usar el MISMO event_id en ambos lados: Meta
deduplica solo. Nunca mandar Purchase solo desde el browser: el webhook
es la fuente de verdad (el usuario puede cerrar la pestaña antes del
redirect de vuelta).

## 6. Pendientes para activar la cadena completa

1. Stripe keys (sk_test primero) → crear productos/precios, reemplazar
   PENDING_ en program_prices, configurar webhook endpoint.
2. META_PIXEL_ID + META_CAPI_ACCESS_TOKEN (Events Manager → Conversions API).
3. GA4_MEASUREMENT_ID + GA4_API_SECRET.
4. Página /thanks para el success_url (dispara los eventos browser-side
   con el mismo event_id del server).
5. Test end-to-end con Test Events de Meta antes de prender campañas.
