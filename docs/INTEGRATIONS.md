# Integraciones: Mindbody, Trainerize y FitBudd

Hay tres plataformas de terceros dando vueltas en este proyecto y es fácil
confundirlas. Este documento aclara qué hace cada una, qué está conectado y
qué está por decidirse.

---

## El mapa en una tabla

| Plataforma | Para qué producto | Estado | Quién cobra |
|---|---|---|---|
| **Mindbody** | 54D Studios (presencial) | Integrado parcialmente | Mindbody, con su propia integración |
| **Trainerize** | app "54D On" actual (white-label) | En uso por el cliente, sin integrar al sitio | — |
| **FitBudd** | reemplazo evaluado para la app ON | **Por definir** | Por definir (trae Stripe propio) |

Regla que atraviesa todo: **Studios y ON no se cruzan.** Son productos con 90x
de diferencia de precio. Las apps también son distintas, y por eso los badges
de la app 54D ON no aparecen en páginas de studios
(ver [marketing/BRAND_SEPARATION.md](marketing/BRAND_SEPARATION.md)).

---

## Mindbody — Studios

Es el sistema con el que el cliente gestiona los studios presenciales: clases,
horarios, clientes.

**Qué está conectado hoy**

- `GET /mindbody/classes` (en `apps/api/src/index.ts`) trae los horarios reales
  por sede, cacheados 10 minutos en el edge. Las páginas de sede lo consumen y
  **fallan de forma suave**: si no hay respuesta, muestran los horarios estáticos.
  Eso significa que podés desarrollar sin Mindbody sin romper nada.
- `POST /leads` empuja el lead a Mindbody con `addclient` (best-effort: si falla,
  el lead igual queda guardado en Supabase y se registra `mindbody_sync_error`).

**Estado del acceso**

La API key funciona para `addclient` con `Api-Key` + `SiteId`. Lo que **no**
está habilitado es `usertoken/issue`, que requiere la aprobación de *go-live*
del portal de developers de Mindbody. Se pidió y al momento de escribir esto
seguía devolviendo `DeniedAccess`. Mientras tanto los horarios en vivo no se
encienden, pero el código ya está listo para cuando pase: no hay que tocar nada,
solo que la API empiece a responder.

**Ojo con Stripe**: Mindbody puede estar cobrando en la misma cuenta de Stripe.
Por eso existe el filtro de procedencia del webhook — ver [STRIPE.md](STRIPE.md).

---

## Trainerize — la app ON actual

La app "54D On" que hoy está publicada es un white-label de Trainerize. Se nota
en el package de Android: `com.trainerize.fiftyfourdays`.

**No está integrada al sitio.** El sitio la enlaza (badges de App Store y Google
Play) y muestra su rating, nada más. Las suscripciones que vendería nuestro
checkout de Stripe **hoy no dan de alta a nadie en la app automáticamente**: ese
puente no existe todavía, y es justamente el problema que FitBudd viene a
resolver o a reemplazar.

Los testimonios que se muestran en el sitio son reseñas reales de esta app,
cosechadas del RSS público de iTunes.

---

## FitBudd — la decisión abierta

FitBudd es una plataforma de apps de fitness white-label para entrenadores y
gimnasios: compite directamente con Trainerize. Ofrece app propia con la marca
del cliente, planes de entrenamiento, chat con el coach y **cobros con Stripe,
PayPal e in-app purchases**, sin comisión propia sobre el pago.

### Lo que hay que decidir antes de escribir código

La pregunta no es técnica, es de arquitectura de negocio: **¿quién cobra?**

**Opción A — cobra nuestro checkout, FitBudd solo da acceso**

```
Meta Ad → landing → nuestro checkout de Stripe → webhook
        → alta del usuario en FitBudd vía su API
```

- Conserva **toda** la atribución por anuncio que ya está construida.
- Conserva el control del funnel, los precios y los eventos a Meta CAPI.
- Requiere que FitBudd tenga API de alta de usuarios y que el webhook la llame.
- Es la opción que **no tira a la basura** lo que ya está hecho.

**Opción B — cobra FitBudd con su propia integración**

- Menos código nuestro; FitBudd gestiona suscripciones y accesos.
- **Se rompe la medición por anuncio** salvo que FitBudd permita pasar metadata
  propia hasta Stripe y devolverla en sus webhooks. Sin eso, no se puede saber
  qué anuncio generó qué venta, que es el objetivo central del proyecto.
- El sitio pasa de vender a derivar.

**Opción C — híbrido**: el sitio cobra la membresía (donde la atribución
importa, porque es lo que se pauta) y FitBudd gestiona el acceso y la
experiencia. En la práctica es la opción A con reparto de responsabilidades claro.

### Preguntas para responder con FitBudd antes de decidir

1. ¿Tiene API pública para **crear usuarios y asignar programas** desde afuera?
   ¿Con qué autenticación?
2. Si cobramos nosotros, ¿cómo se le da el acceso al usuario? ¿Alcanza con crear
   la cuenta, o requiere que la suscripción viva en su sistema?
3. Si cobra FitBudd, ¿permite pasar **metadata arbitraria** (nuestro
   `attribution_id`) al checkout y recuperarla por webhook?
4. ¿Usa **la misma cuenta de Stripe** del cliente o una propia? Si es la misma,
   nuestro filtro de procedencia ya evita que sus cobros contaminen las métricas,
   pero conviene confirmarlo.
5. ¿Qué pasa con los miembros actuales de Trainerize? ¿Hay migración?

### Lo que ya está de nuestro lado, sea cual sea la decisión

- El **filtro de procedencia** del webhook protege las métricas si comparten
  cuenta de Stripe.
- El endpoint `/leads` y el patrón de *sync best-effort* usado con Mindbody
  (guardar primero, sincronizar después, registrar el error sin romper el flujo)
  es el mismo patrón que conviene usar para dar de alta en FitBudd.
- La tabla `program_prices` ya mapea programa → `stripe_price_id` → `interval`,
  así que agregar un identificador de FitBudd por programa es una columna más.

> **Nota para quien tome la decisión:** la razón de ser de este proyecto es poder
> responder "cuántos free trials vienen de cada anuncio, cuántos compran y
> cuántos cancelan". Cualquier arquitectura que rompa ese vínculo hay que
> descartarla o compensarla explícitamente.
