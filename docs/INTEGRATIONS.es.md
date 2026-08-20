[English](INTEGRATIONS.md) · **Español**

# Integraciones: Mindbody, Trainerize y FitBudd

Hay tres plataformas de terceros dando vueltas en este proyecto y es fácil
confundirlas. Este documento aclara qué hace cada una, qué está conectado y qué
implica para la medición la dirección que se eligió.

---

## El mapa en una tabla

| Plataforma | Para qué producto | Estado | Quién cobra |
|---|---|---|---|
| **Mindbody** | 54D Studios (presencial) | Integrado parcialmente | Mindbody, con su propia integración |
| **Trainerize** | app "54D On" actual (white-label) | En uso por el cliente, sin integrar al sitio | nadie, a través nuestro |
| **FitBudd** | reemplazo de la app ON | **Decidido**: FitBudd, con su integración nativa de Stripe | **FitBudd**, en la cuenta de Stripe del cliente |

Regla que atraviesa todo: **Studios y ON no se cruzan.** Son productos con 90x de
diferencia de precio. Las apps también son distintas, y por eso los badges de la
app 54D ON no aparecen en páginas de studios
(ver [marketing/BRAND_SEPARATION.md](marketing/BRAND_SEPARATION.md)).

---

## Mindbody: Studios

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

La API key funciona para `addclient` con `Api-Key` + `SiteId`. Lo que **no** está
habilitado es `usertoken/issue`, que requiere la aprobación de *go-live* del
portal de developers de Mindbody. Se pidió y al momento de escribir esto seguía
devolviendo `DeniedAccess`. Mientras tanto los horarios en vivo no se encienden,
pero el código ya está listo: no hay que tocar nada, solo que la API empiece a
responder.

**Ojo con Stripe**: Mindbody puede estar cobrando en la misma cuenta de Stripe.
Esa es la razón por la que el webhook conserva un chequeo de procedencia incluso
ahora que los cobros de FitBudd sí tienen que entrar. Una membresía de studio
cuesta unas 90 veces una suscripción de la app, así que un solo cobro de studio
contado como venta de app desvía el revenue en un orden de magnitud. Ver
[STRIPE.md](STRIPE.es.md), parte 3.

---

## Trainerize: la app ON actual

La app "54D On" que hoy está publicada es un white-label de Trainerize. Se nota
en el package de Android: `com.trainerize.fiftyfourdays`.

**No está integrada al sitio.** El sitio la enlaza (badges de App Store y Google
Play) y muestra su rating, nada más. Nada de lo que se vende en el sitio da de
alta a nadie en la app: ese puente no existe, y es justamente el problema que
FitBudd viene a reemplazar.

Los testimonios que se muestran en el sitio son reseñas reales de esta app,
cosechadas del RSS público de iTunes.

---

## FitBudd: la dirección elegida

FitBudd es una plataforma de apps de fitness white-label para entrenadores y
gimnasios: compite directamente con Trainerize. Ofrece app propia con la marca
del cliente, planes de entrenamiento, chat con el coach y cobros con Stripe,
PayPal e in-app purchases, sin comisión propia sobre el pago.

**El cliente ya decidió.** FitBudd está asociado a Stripe y la app va a cobrar
con la **integración nativa de FitBudd con Stripe**. Ya no es una pregunta
abierta de arquitectura, y el planteo anterior de este documento como "opción A
contra opción B" quedó viejo.

### Qué cuesta esa decisión y qué no

Lo que compra: menos código, menos mantenimiento y un flujo de pago que el
proveedor sostiene. Es valor real y por eso la decisión es razonable.

Lo que cuesta: el vínculo anuncio → venta no sobrevive solo. Nuestro checkout lo
escribía por construcción, porque creábamos la sesión de Stripe y le estampábamos
nuestro `attribution_id`. Un checkout de FitBudd no escribe nada nuestro. El
evento de Stripe llega con un cliente que pagó y ningún rastro del anuncio de
Meta que tocó once días antes.

Lo que **no** cuesta, al contrario de lo que decía la versión anterior de este
documento: la medición no se pierde sin más. Se puede reconstruir con un
attribution handoff, con una precisión que depende de una respuesta de FitBudd.
El patrón completo, las tres estrategias de match y su fiabilidad honesta están
en [STRIPE.md](STRIPE.es.md), parte 2. La versión corta:

| Estrategia | Precisión | Depende de |
|---|---|---|
| Nuestro `attribution_id` pasado a través de FitBudd | determinística | que FitBudd soporte pass-through de metadata (sin confirmar) |
| Email normalizado del customer | precisión alta, cobertura parcial | capturar el email antes del redirect |
| Ventana temporal más landing | aproximada, se degrada con el volumen | nada, y ese es el problema |

### Qué hay que construir de nuestro lado

1. **El handoff.** El CTA que manda a alguien a FitBudd no puede ser un link
   pelado. Tiene que registrar el touch primero (utm, fbclid, referrer y la clave
   de correlación que podamos llevar) y redirigir después. Sin ese paso no hay
   contra qué matchear más adelante, y ningún código de webhook lo recupera.
2. **Dejar entrar los eventos de FitBudd.** Ya llegan a nuestro webhook, porque
   es la misma cuenta de Stripe, y hoy el filtro de procedencia los descarta. Ese
   filtro pasa a ser un clasificador de tres vías: nuestro, de FitBudd, ajeno.
3. **Dejar afuera a Mindbody.** No negociable, por el motivo 90x de arriba.
4. **Marcar el origen en el espejo.** Una columna que separe lo que vendió el
   sitio de lo que vendió la app, para poder leerlos por separado y sumarlos a
   propósito.

### Preguntas para FitBudd, por orden de prioridad

1. **Pass-through de metadata**: ¿podemos adjuntar un valor arbitrario al
   checkout que crea FitBudd, y sobrevive hasta el objeto de Stripe? Es la que
   decide todo lo demás.
2. **Webhooks propios**: ¿FitBudd emite eventos propios de compra, trial y
   cancelación? ¿Qué trae el payload?
3. **La cuenta de Stripe**: ¿la misma que la de los studios, confirmado?
   ¿Conectada por Stripe Connect, OAuth, o una key pegada a mano?
4. **API de lectura**: ¿podemos listar suscripciones y miembros para reconciliar
   todas las noches?
5. **In-app purchases**: ¿una suscripción por App Store o Google Play aparece en
   Stripe? Si no, ese revenue nunca llega a este pipeline.
6. **Dueño del catálogo**: ¿productos y precios de quién, nuestros o de ellos?
7. **Migración de Trainerize**: ¿los miembros migrados generan eventos de Stripe
   que parecerían ventas nuevas?

### Lo que ya está de nuestro lado, caigan como caigan las respuestas

- El **chequeo de procedencia** protege las métricas en una cuenta de Stripe
  compartida. Cambia de forma, no desaparece.
- La **infraestructura de canal ya está construida**: `channel_of()` más tres
  vistas clasifican cualquier touch en meta_ads, newsletter, seo, direct y el
  resto. Ver [ANALYTICS.md](ANALYTICS.md). Funciona apenas las ventas empiecen a
  llegar al espejo con una atribución detrás.
- El endpoint `/leads` y el patrón de *sync best-effort* usado con Mindbody
  (guardar primero, sincronizar después, registrar el error sin romper el flujo)
  es el mismo patrón para cualquier cosa que empujemos a FitBudd.
- La tabla `program_prices` ya mapea programa → `stripe_price_id` → `interval`,
  así que agregar un identificador de FitBudd por programa es una columna más.

> **Nota para quien revise esto:** la razón de ser de este proyecto es poder
> responder "cuántos free trials vienen de cada canal, cuántos compran y cuántos
> cancelan". La arquitectura elegida no responde eso sola. Puede responderlo, con
> el handoff. Entregar la integración de FitBudd sin el handoff es entregar un
> dashboard que va a mostrar cero para siempre.
