[English](STRIPE.md) · **Español**

# Pagos con Stripe

Cómo conectar Stripe en el escenario que eligió el cliente, y cómo mantener viva
la medición por canal dentro de ese escenario. Si venís a conectar pagos, este es
tu documento.

**La dirección elegida (confirmada por el cliente):** FitBudd ya está asociado a
Stripe y la app va a cobrar con la **integración nativa de FitBudd con Stripe**.
Aun así el cliente quiere el dashboard que responda de dónde vienen las ventas y
los free trials: Meta, newsletter, orgánico, SEO. Esas dos cosas no son
compatibles solas. Hacerlas compatibles es el trabajo que describen la
[Parte 2](#parte-2-el-problema-central-y-el-attribution-handoff) y la
[Parte 3](#parte-3-qué-cambia-en-el-código).

---

## TL;DR del estado

| | Estado |
|---|---|
| Código de checkout (sitio) | **Listo** (`apps/api/src/index.ts`, `POST /checkout`) |
| Webhook de Stripe | **Listo**, con filtro de procedencia e idempotencia |
| Atribución por anuncio | **Lista** (captura en el front → tabla → espejo → vista SQL) |
| Atribución por canal | **Lista**: `channel_of` + 3 vistas, consumidas por `/admin` (ver [ANALYTICS.md](ANALYTICS.md)) |
| Claves de Stripe | **FALTAN** (nunca se configuraron) |
| Price IDs reales | **FALTAN**: hay 30 placeholders `PENDING_*` |
| Eventos de FitBudd llegando al espejo | **NO ESTÁ HECHO**: hoy el webhook los descarta |
| Match entre venta de FitBudd y touch | **NO ESTÁ HECHO**: no se guarda ninguna clave de correlación |
| Purchase de pago único | **BUG conocido**, no dispara conversión |
| Página `/thanks` | **No existe** |

**Todavía no se puede cobrar desde el sitio.** Cada CTA de compra responde
`503 payments_not_configured` a propósito, para no mostrar un error de red falso.
El dashboard se dibuja con estados vacíos que dicen exactamente eso, en vez de
mostrar un cero mudo.

---

## Cómo funciona el flujo hoy

```
Meta Ad
  → landing (captura utm_*, fbclid, _fbp/_fbc, gclid, ga_client_id, landing_path, referrer)
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

`v_campaign_funnel` responde esto por anuncio. `v_channel_funnel` responde lo
mismo por canal comercial. Las dos leen el mismo espejo.

### El filtro de procedencia (no lo borres, convertilo)

La cuenta de Stripe está compartida. Hoy Mindbody cobra los studios ahí, y
mañana FitBudd va a cobrar la app en la misma cuenta. Los dos pegan en nuestro
webhook.

Todo evento pasa por un gate (`apps/api/src/index.ts`, líneas 154 a 192):

```ts
// checkout.session.completed
if (s.metadata?.source === '54d-web' && s.metadata?.attribution_id) { ... }

// customer.subscription.*
const isOurs = sub.metadata?.source === '54d-web' || await subscriptionExists(supabase, sub.id);

// invoice.*
if (await invoiceIsOurs(supabase, inv)) { ... }
```

Hoy ese gate es binario: nuestro, o ignorado. Eso es justamente lo que hay que
cambiar, y la [Parte 3](#parte-3-qué-cambia-en-el-código) explica cómo, sin
dejar entrar de nuevo a Mindbody.

Detalle que cuesta caro descubrir solo: **la metadata de la Session NO se propaga
a la Subscription**. Por eso se setea dos veces, una en `metadata` y otra en
`subscription_data.metadata`.

---

## Parte 1: conectar Stripe, checklist ejecutable

Hacela en orden. Los pasos 1 a 4 son en el dashboard de Stripe, los 5 a 7 en el
repo y en Cloudflare.

### 1. Confirmar de qué cuenta hablamos

Hay una cuenta de Stripe y al menos tres plataformas queriendo cobrar en ella:
Mindbody (studios), FitBudd (app ON) y nuestro propio checkout (lo que el sitio
siga vendiendo directo). Antes que nada, anotá el account ID y confirmá con el
cliente que FitBudd está conectado a **esa** cuenta y no a una segunda. Si
FitBudd cobra en otra cuenta, sus eventos nunca llegan a nuestro webhook y toda
la Parte 2 cambia: el único camino que queda son los webhooks propios de FitBudd
o su API, si los tiene.

### 2. Crear productos y precios

Un producto por cosa vendible, un precio por intervalo de cobro. Precios
verificados contra store.54d.com/packs el 25/07/2026:

- **Membresía**: USD 54/mes, 156/trimestre, 588/año. Trial de 7 días.
- **Programas de un pago**: Reset 7 USD 19 · Emergency Kit / Max Burn / First
  Move / Booty on Fire USD 39 · Full Body 95 · Lower/Upper Body 185 · 54D ON 385
  · Step 2 400.
- **Runners (5K/10K/21K)**: solo por membresía, no se venden sueltos.

El trial se puede poner en el precio o pasarlo en el checkout, pero elegí uno y
sé consistente, porque lo que lee nuestro endpoint es `program_prices.trial_days`.

**Si FitBudd crea sus propios productos para los mismos planes, no los
dupliques.** Dos productos para una membresía significan dos price IDs, revenue
partido en los reportes nativos de Stripe y una tabla de mapeo que nadie
mantiene. Definí quién es dueño del catálogo antes de crear nada (pregunta
abierta 6, más abajo).

### 3. Reemplazar los 30 placeholders

Hoy hay `PENDING_*` en tres lugares:

| Archivo | Cuántos | Qué son |
|---|---|---|
| `apps/web/app/data/program-landings.ts` | 14 | los 13 programas (+1 repetido) |
| `apps/web/app/routes/on.tsx` | 13 | la vitrina de programas |
| `apps/web/app/routes/pricing.tsx` | 3 | los planes de membresía |

Hay un **espejo en Supabase**: la tabla `program_prices` guarda
`stripe_price_id`, `interval` y `trial_days`. El endpoint la lee para decidir
`mode` y trial. **Actualizala junto con el código**, o el checkout va a crear
sesiones con el modo equivocado. Si algunos precios son de FitBudd, insertá esas
filas también: eso es lo que después permite mapear una venta de FitBudd a un
programa.

### 4. Obtener las claves

Desde el dashboard de Stripe, **en modo test primero**:

- `sk_test_...` (Developers → API keys → Secret key)
- `whsec_...` (Developers → Webhooks → tu endpoint → Signing secret). Este recién
  aparece después del paso 6, así que este paso se hace dos veces.

Ninguna de las dos se commitea. Ninguna va en archivos `.env*` que se publiquen.

### 5. Cargarlas como secrets en Cloudflare

```bash
cd apps/api
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

Cada comando pide el valor y lo guarda cifrado en el Worker. Para desarrollo
local los mismos dos nombres van en `apps/api/.dev.vars`, que está gitignoreado:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Para verificar qué hay cargado sin imprimir valores:

```bash
npx wrangler secret list
```

### 6. Registrar el endpoint del webhook

En Stripe, Developers → Webhooks → Add endpoint:

```
https://54d-api.<subdominio-de-la-cuenta>.workers.dev/webhooks/stripe
```

El Worker se llama `54d-api` en `apps/api/wrangler.jsonc`; el subdominio es el de
la cuenta. Si hay un dominio propio delante de la API, usá ese. El signing secret
que te devuelve va al paso 5.

### 7. Suscribir los eventos

Set mínimo para el checkout propio del sitio:

| Evento | Qué alimenta |
|---|---|
| `checkout.session.completed` | espejar customer y subscription, enlazar atribución |
| `invoice.paid` | `first_paid_at`, la conversión real, y el revenue |
| `invoice.payment_failed` | dunning y riesgo de churn |
| `customer.subscription.created` | arranque de trial |
| `customer.subscription.updated` | cambios de estado, cancel at period end |
| `customer.subscription.deleted` | cancelaciones y bajas en trial |

Estos se suman cuando FitBudd cobre en la misma cuenta:

| Evento | Por qué hace falta ahora |
|---|---|
| `customer.created` | el email con el que matchea la estrategia (b) llega acá primero |
| `customer.updated` | el email puede completarse después |
| `payment_intent.succeeded` | cobros de un pago que nunca generan invoice |
| `charge.refunded` | sin esto el revenue reportado queda por encima del real |

Suscribir un evento no es procesarlo: el handler es un `switch` y lo que no está
listado se cae solo. Suscribir temprano es barato y llena `webhook_events.payload`
con ejemplos reales, que es exactamente lo que necesita el paso de descubrimiento
de la Parte 3.

---

## Parte 2: el problema central y el attribution handoff

### El problema, dicho con precisión

FitBudd cobra en la cuenta de Stripe del cliente. Esos eventos **sí llegan a
nuestro webhook**, porque un endpoint de webhook recibe todo lo que pasa en la
cuenta. Hoy se tiran a la basura: una suscripción de FitBudd no lleva
`metadata.source = '54d-web'` y no existe en nuestro espejo, así que
`subscriptionExists()` devuelve false y el gate la descarta.

O sea: la venta ocurre, la plata es real, y el dashboard no muestra nada.

Dejarlos entrar es la mitad fácil. La mitad difícil es que un evento de FitBudd
no tiene idea de qué anuncio, newsletter o búsqueda trajo a esa persona. Stripe
sabe que hay un cliente que pagó. No sabe que hizo click en un anuncio de Meta
hace once días. Ese vínculo vive solo de nuestro lado, en
`checkout_attributions`, y hoy se escribe únicamente cuando alguien toca un CTA
de compra de nuestro propio checkout.

### El patrón: attribution handoff

Partir la venta en dos mitades que se reencuentran después por una clave de
correlación.

```
1. TOUCH (nuestro sitio)
   el visitante aterriza con utm_* / fbclid / referrer
   captureAttribution() lo guarda en localStorage
        │
2. HANDOFF (nuestro sitio, en el momento de mandarlo a FitBudd)
   el CTA no linkea derecho afuera. Primero POSTea la atribución
   y el identificador que podamos llevar, y recién ahí redirige.
   → fila en checkout_attributions con una clave de correlación
        │
3. COMPRA (FitBudd, en la cuenta de Stripe compartida)
   FitBudd crea customer + subscription + invoice
        │
4. MATCH (nuestro webhook)
   llega el evento, se clasifica como origen 'fitbudd'
   y se matchea contra la fila de atribución por la clave
        │
5. REPORTE
   el espejo ya tiene una suscripción con un canal detrás,
   y v_channel_funnel la cuenta como cualquier otra venta
```

El paso 2 es el que no existe todavía y no es opcional. Sin una fila escrita en
el momento del handoff no hay nada contra qué matchear después, y no hay código
de webhook ingenioso que lo recupere. Además, `v_channel_funnel` lee
`from checkout_attributions left join subscriptions`: una venta sin fila de
atribución no queda "sin atribuir", queda **invisible** para la vista.

### Las tres estrategias de match, por orden de fiabilidad

#### (a) Metadata o client reference pasada a través de FitBudd

Si FitBudd permite adjuntar un valor arbitrario al checkout que crea, ahí va
nuestro `attribution_id` y lo leemos de vuelta en el objeto de Stripe.

- **Fiabilidad: determinística.** O está bien, o no está. Nunca está mal.
- **Costo:** casi nulo de nuestro lado, el id ya lo generamos.
- **Depende de:** que FitBudd soporte pass-through de metadata, campos
  personalizados, o un query param que reenvíe. **Sin confirmar. Es la pregunta
  abierta 1 y es la respuesta más valiosa de conseguir.**
- Leelo del objeto de Stripe en este orden: `metadata.attribution_id`, después
  `client_reference_id`, después `subscription.metadata.attribution_id`. Acordate
  de que la metadata de la session no se propaga a la subscription: si FitBudd la
  setea en un solo lugar, hay que saber en cuál.

#### (b) Email normalizado del customer de Stripe

Guardar el email en el handoff y matchear `lower(trim(email))` contra el email
del customer de Stripe.

- **Fiabilidad: alta cuando los dos lados lo tienen, y lo flojo es la cobertura,
  no la precisión.** Un match equivocado requiere que dos personas distintas
  compartan una dirección de mail, cosa rara. Un match faltante es común.
- **Falla cuando:** nunca pedimos el email antes de redirigir (hoy no lo
  pedimos), la persona se registra en FitBudd con otra dirección, el private
  relay de Apple la reescribe, la compra ocurre por in-app purchase con el mail
  de la cuenta de Apple o Google, o la familia comparte una casilla.
- **Costo:** una columna `email` en `checkout_attributions` (hoy no existe:
  `/checkout` recibe `body.email` y solo se lo pasa a Stripe como
  `customer_email`), más un paso de captura de email antes del redirect. Ese paso
  tiene un costo real de conversión: cada campo antes de un redirect pierde
  gente. Pesalo, no lo agregues por reflejo.
- Matcheá contra `customer.email` y contra
  `checkout_session.customer_details.email`, y guardá cuál pegó.

#### (c) Ventana temporal más landing

Último recurso. Matchear la venta con el touch sin matchear más reciente de la
misma landing dentro de una ventana de N horas.

- **Fiabilidad: aproximada, y se degrada justo cuando el negocio crece.** Con dos
  ventas por hora acierta casi siempre. Con veinte visitantes concurrentes en la
  misma landing es cara o ceca, y se equivoca con confianza en vez de callarse.
- **Nunca la uses para alimentar Meta CAPI.** Un Purchase equivocado le enseña al
  algoritmo a optimizar hacia la audiencia equivocada, y ese daño es caro y lento
  de revertir. Usala solo para el dashboard interno.
- Sea cual sea la ventana, escribila como decisión, marcá cada fila que produzca
  como baja confianza, y mostrá ese porcentaje en el dashboard. Un número que
  nadie puede auditar es peor que un hueco que todos ven.

#### El resumen honesto

Empujá fuerte por (a). Caé en (b) si el cliente acepta un paso de email antes del
redirect. Tratá a (c) como parche que tiene que estar visiblemente etiquetado,
nunca como plan. Y registrá cómo se matcheó cada fila, para que el dashboard
pueda decir "el 82 por ciento del revenue está atribuido de forma
determinística" en vez de dar a entender que lo está todo.

---

## Parte 3: qué cambia en el código

Nada de esto está escrito todavía. Es la especificación, no la descripción.

### 3.1 El filtro se convierte en clasificador

No borres el filtro de procedencia. Mindbody cobra membresías de studio en la
misma cuenta, un producto 90x más caro que la app, así que dejarlo entrar no
agrega ruido: destruye los números. El revenue quedaría mal por un orden de
magnitud y con él todas las tasas de conversión.

Reemplazá el booleano por tres resultados:

```ts
type Origin = 'web' | 'fitbudd' | 'foreign';
```

- `web`: `metadata.source === '54d-web'`, o ya está en el espejo con
  `origin = 'web'`. Se comporta igual que hoy.
- `fitbudd`: reconocido como de la app ON. Se espeja y se matchea, pero **no** se
  trata como nuestro checkout: no hay `client_reference_id` confiable ni evento
  de browser con el cual deduplicar.
- `foreign`: todo lo demás, que hoy es Mindbody. Se marca procesado y se ignora,
  igual que ahora.

### 3.2 Cómo distinguir `fitbudd` de `foreign`

Esto no se responde desde el escritorio, y adivinar acá corrompe el espejo.
Descubrilo con datos reales, usando infraestructura que ya existe: cada evento se
guarda entero en `webhook_events.payload`.

1. Registrá el endpoint y suscribí los eventos (Parte 1) antes de escribir
   handler alguno.
2. Dejá pasar algunos cobros reales de cada tipo, o hacé un cobro de prueba por
   plataforma.
3. Mirá qué los distingue:

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

Candidatos a discriminador, del mejor para abajo:

1. **`application`**: cuando una plataforma cobra vía Stripe Connect u OAuth,
   Stripe estampa el ID de la aplicación conectada en los objetos que crea. Si
   FitBudd y Mindbody muestran valores distintos acá, este es el discriminador
   más limpio disponible y no necesita cooperación de ninguno de los dos. Si usan
   Connect o no, te lo dice la consulta de arriba.
2. **Price o product ID**: si los planes de FitBudd son precios conocidos, un
   lookup contra `program_prices` los clasifica. Robusto, pero solo si el catálogo
   se mantiene (Parte 1, paso 3).
3. **Metadata que FitBudd ponga en sus propios objetos**: posible, desconocido,
   vale la pena pedirlo (pregunta abierta 2).

Elijas el que elijas, escribilo como una sola función con el razonamiento en un
comentario al lado, y ante la duda devolvé `foreign`. Una venta sin clasificar
que falta en el dashboard es un bug que se encuentra. Un cobro de Mindbody
contado como venta de la app es un bug que parece una buena noticia.

### 3.3 Columnas nuevas en el espejo

| Tabla | Columna | Para qué |
|---|---|---|
| `subscriptions` | `origin text not null default 'web'`, check en (`web`, `fitbudd`, `other`) | separar lo que vendió el sitio de lo que vendió la app, en cada vista y cada export |
| `invoices` | `origin text` | el revenue se parte igual, y los reembolsos caen del lado correcto |
| `checkout_attributions` | `email text` | la clave de correlación de la estrategia (b). Guardado normalizado, minúscula y sin espacios |
| `checkout_attributions` | `match_method text` (`metadata`, `email`, `window`, `null`) | permite que el dashboard diga cómo se hizo el vínculo |
| `checkout_attributions` | `match_confidence text` (`exact`, `probable`, `weak`) | (a) es exact, (b) es probable, (c) es weak |
| `checkout_attributions` | `matched_at timestamptz` | separa "todavía no matcheó" de "no va a matchear nunca" |

`origin` con default `'web'` para que las filas existentes conserven su
significado y no haga falta backfill.

### 3.4 La rama nueva del webhook

Dentro de `customer.subscription.*` e `invoice.*`, después de clasificar:

1. Si `origin === 'fitbudd'`, espejar la suscripción y el invoice igual que los
   propios, con `origin = 'fitbudd'`.
2. Intentar el match en orden (a), (b), (c). Frenar en el primero que pegue.
   Escribir `subscription_id`, `match_method`, `match_confidence` y `matched_at`
   en la fila de atribución.
3. Si no matchea nada, igual espejar la venta. Una venta sin atribuir es una
   venta real y tiene que aparecer en los totales, en un bucket visible de "sin
   atribuir". Esto implica además que `v_channel_funnel`, que arranca desde
   `checkout_attributions`, necesita un camino paralelo para las suscripciones
   sin fila de atribución, porque si no esas ventas faltan en silencio en vez de
   contarse como desconocidas.
4. Disparar Meta CAPI y GA4 **solo** con `match_confidence = 'exact'`, y solo
   para eventos `origin = 'fitbudd'` que representen un primer pago genuino. Para
   todo lo demás, espejar sin emitir. Darle a Meta una conversión adivinada es
   peor que no darle nada.

Mantené la idempotencia actual: el insert en `webhook_events` por
`(source, event_id)` ya hace que los reintentos sean seguros, y Stripe reintenta.

### 3.5 El bug de pago único, sigue abierto

`onCheckoutCompleted` (`apps/api/src/index.ts`, línea 297) empieza así:

```ts
if (!session.subscription) return;
```

Las compras de programa se crean con `mode: 'payment'`, así que no tienen
subscription y se ignoran. Como tampoco se emite factura (no hay
`invoice_creation`), tampoco entran por `invoice.paid`. Consecuencia concreta:
**ninguna compra de programa llega a Meta.** Sin evento Purchase no hay
optimización por valor ni ROAS, solo campañas de tráfico. Los tres programas de
runners son membresía y sí funcionan, lo que disimula el problema en las pruebas.

Arreglo, cobre quien cobre:

1. Ramificar por `session.mode`. Si es `payment`, espejar la compra y disparar
   `Purchase` a Meta CAPI más `purchase` a GA4, usando `session.amount_total` y
   la atribución enlazada.
2. Crear la página `/thanks` y usarla como `success_url` (hoy vuelve a
   `/pricing?checkout=success`). Sirve además de casa para los eventos
   browser-side.
3. Ya que estás: sumar `external_id` y el fallback de `fbc` desde `fbclid` en
   `user_data` de CAPI, que mejora el match quality.

---

## Parte 4: probar antes de creerle a cualquier número

```bash
stripe listen --forward-to localhost:8788/webhooks/stripe
```

Casos mínimos:

| Caso | Qué demuestra |
|---|---|
| Suscripción con trial, desde nuestro checkout | el camino feliz sigue funcionando |
| Cancelación durante el trial | `bajas_en_trial` cuenta |
| Primer cobro real | `first_paid_at` y revenue |
| Compra de un pago | el bug de 3.5 está realmente arreglado |
| Cobro sin `metadata.source` (creado a mano) | el filtro sigue rechazando ajenos |
| Cobro de FitBudd con el handoff hecho | matchea por (a) o (b), `origin = 'fitbudd'` |
| Cobro de FitBudd sin touch previo | se espeja, sin atribuir, y se ve como tal |
| Un cobro de studio de Mindbody | se sigue ignorando, `origin` nunca es `fitbudd` |

Los últimos tres son los nuevos y son los que deciden si el dashboard dice la
verdad. Después comprobá en Supabase que se llenaron `checkout_attributions`,
`subscriptions`, `invoices` y `webhook_events`, y que `v_channel_funnel` movió la
fila del canal correcto.

---

## Preguntas abiertas para FitBudd

Afiladas al escenario elegido. El contexto completo de integración está en
[INTEGRATIONS.md](INTEGRATIONS.es.md).

1. **Pass-through de metadata.** ¿Podemos adjuntar un valor arbitrario (nuestro
   `attribution_id`) al checkout que crea FitBudd, y sobrevive hasta el objeto de
   Stripe como `metadata` o `client_reference_id`? Esta sola respuesta decide si
   la atribución es exacta o aproximada.
2. **Webhooks propios.** ¿FitBudd emite webhooks propios (compra, trial iniciado,
   cancelación) que podamos consumir en lugar de, o además de, los de Stripe?
   ¿Qué trae el payload, incluye el email del cliente?
3. **Cuenta de Stripe compartida.** Confirmar que FitBudd cobra en la **misma**
   cuenta de Stripe que los studios, y cómo está conectado: Stripe Connect,
   OAuth, o una secret key pegada a mano. La respuesta determina si el campo
   `application` puede discriminar sus eventos de los de Mindbody.
4. **API de lectura.** ¿Hay API para listar suscripciones, miembros y su estado?
   Una reconciliación nocturna contra ella es la red de seguridad más barata
   contra un webhook perdido, y además cubre las in-app purchases que nunca tocan
   Stripe.
5. **In-app purchases.** Si alguien se suscribe por App Store o Google Play en
   vez de Stripe, ¿esa venta aparece en Stripe? Si no, nunca va a llegar a
   nuestro dashboard por este camino y necesita respuesta propia.
6. **Quién es dueño del catálogo.** ¿Los planes de FitBudd usan productos y
   precios creados por nosotros o por él? Productos duplicados parten el revenue
   en los reportes nativos de Stripe antes incluso de llegar a los nuestros.
7. **Miembros actuales de Trainerize.** ¿Hay migración, y los miembros migrados
   generan eventos de Stripe que parecerían ventas nuevas?

---

## Archivos relevantes

| Archivo | Qué tiene |
|---|---|
| `apps/api/src/index.ts` | `/checkout`, `/webhooks/stripe`, filtro de procedencia (154 a 192), helpers |
| `apps/web/app/lib/attribution.ts` | captura de atribución, `startCheckout()`, eventos del pixel |
| `supabase/migrations/00000000000001_init.sql` | tablas: `checkout_attributions`, `subscriptions`, `invoices`, `program_prices`, `webhook_events` |
| `supabase/migrations/20260725190000_ad_level_funnel.sql` | vista `v_campaign_funnel` (por anuncio) |
| `supabase/migrations/20260818120000_channel_attribution.sql` | `channel_of()` y las tres vistas de canal |
| [ANALYTICS.md](ANALYTICS.md) | contrato de medición, clasificador de canal y los UTM que deben usar los anuncios |
| [INTEGRATIONS.md](INTEGRATIONS.es.md) | Mindbody, Trainerize y FitBudd, quién cobra qué |
