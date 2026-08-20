[English](STATUS.md) · **Español**

# Estado del proyecto

Foto al **18 de agosto de 2026**. Lo que está terminado, lo que falta y —lo más
importante— **qué está bloqueado esperando algo de afuera**.

Mantené este archivo al día: es lo primero que lee quien se suma.

---

## Listo y en producción

**Sitio público** — 24 rutas, todas bilingües EN/ES con detección por navegador
y selector manual (cookie `54d_lang`).

| Ruta | Qué es |
|---|---|
| `/` | Gate: video + dos puertas (Studios / ON). Sin header ni footer, a propósito. |
| `/on`, `/pricing` | Venta del producto online: membresía, 13 programas, la app |
| `/programs/:slug` | 13 landings de pauta, un template + data |
| `/studios`, `/studios/:slug` | Index con carrusel + 5 sedes |
| `/method`, `/blog`, `/contact` | Contenido y contacto |
| `/assessment` | Lead magnet: 12 preguntas → nombre + WhatsApp → `/leads` |
| `/privacy`, `/terms` | Legales (`routes/legal.tsx`, una ruta con dos ids) |
| `/admin/*` | Dashboard: login, métricas, leads, ABM de blog y programas |

**API** (`apps/api/src/index.ts`): `/health`, `/checkout`, `/webhooks/stripe`,
`/mindbody/classes`, `/leads`.

**Datos**: schema aplicado en Supabase con catálogo seedeado (15 programas, 13
precios), atribución, espejo de suscripciones, webhook events y la vista
`v_campaign_funnel` para el funnel por anuncio.

**SEO local**: NAP verificado contra los perfiles reales de Google Business de
las 5 sedes, JSON-LD `ExerciseGym` con teléfono, geo y `hasMap`, sitemap y robots.

**Contenido verificado**: testimonios reales del App Store (cosechados del RSS
público de iTunes), antes/después oficiales del cliente, 17 coaches con nombre,
covers oficiales de los 10 programas.

---

## Bloqueado esperando al cliente

Esto **no es deuda técnica**: el código está listo y esperando datos.

| Qué falta | Bloquea | Detalle |
|---|---|---|
| **Claves de Stripe** | Que el sitio pueda cobrar | Ver [STRIPE.md](STRIPE.es.md). Hoy todo CTA responde `503 payments_not_configured` |
| **Price IDs reales** | Lo mismo | 30 placeholders `PENDING_*` en 3 archivos |
| **Go-live de Mindbody** | Horarios en vivo por sede | `usertoken/issue` devuelve `DeniedAccess`. La UI ya cae a horarios estáticos sin romperse |
| **Respuestas de FitBudd** | Reconstruir la atribución cuando FitBudd cobre | La dirección ya está decidida (cobra FitBudd nativo). Falta saber si soporta metadata pass-through: ver [INTEGRATIONS.md](INTEGRATIONS.es.md) |
| **Fuentes Allumi / Helvetica Neue Condensed** | Tipografía definitiva | Corre con Archivo / Archivo Narrow como sustitutos; el swap es cambiar el `@font-face` |
| **META_PIXEL_ID, CAPI token, GA4** | Medición real | El código los lee del env y se activa solo cuando existen |
| **Horarios semanales por sede** | Publicar la grilla completa | Hoy hay una tabla base; la fina llegaría por Mindbody |
| **NAP de MX y CO** | SEO local de esas 3 sedes | Las 2 de US están verificadas; las de CDMX y Bogotá vienen de perfiles sin reclamar |

---

## Deuda conocida

Cosas nuestras, priorizadas:

1. **Purchase de pago único no dispara** — el bug más caro. Las compras de
   programa (`mode: 'payment'`) no generan evento de conversión, así que Meta
   no puede optimizar por valor. Detalle y arreglo en [STRIPE.md](STRIPE.es.md#3-arreglar-el-bug-de-conversión-en-pagos-únicos).
2. **No hay página `/thanks`** — el `success_url` vuelve a `/pricing`. Hace falta
   para los eventos browser-side de conversión.
3. **Blog sin CMS** — `apps/web/app/routes/blog.tsx` tiene 3 posts hardcodeados
   y las cards linkean a `#`. La tabla existe en Supabase y el ABM está en
   `/admin/blog`: falta la ruta pública `/blog/:slug` y conectar el índice.
4. **Sin test suite** — la verificación es visual y medida (Playwright contra el
   DOM real). Si el equipo crece, esto es lo primero que conviene agregar.
5. **Autores del blog son placeholder** — "Head Coach, 54D" y credenciales
   genéricas. E-E-A-T pide nombres reales.
6. **Sitemap estático** — se actualiza a mano; cuando el blog sea dinámico
   conviene generarlo.

---

## Historia útil para entender decisiones raras

Cosas que parecen arbitrarias y no lo son:

- **El gate del home no tiene header ni footer.** Es deliberado: el visitante
  elige entre dos productos de precio muy distinto antes de ver nada más.
- **`/studios*` no menciona nunca a ON** (ni nav, ni footer, ni banner de app).
  Es la regla dura de separación de marca: un comprador de USD 60.000 no debe
  encontrarse con la versión de USD 54.
- **Las alturas de botón son tokens.** Hubo 6 alturas distintas conviviendo por
  derivarlas de padding; ahora se declaran (`--btn-h`, `--btn-h-sm`, `--btn-h-nav`).
- **Hay una lista de imágenes vetadas** en los comentarios de
  `program-landings.ts`: bolsas de boxeo (el cliente las retiró de los studios)
  y conos naranjas. Se colaron tres veces en rondas distintas.
- **Los assets prohibidos están en cuarentena** fuera de `public/`, en
  `apps/web/design-assets/prohibited-studios/`, para que no puedan volver por
  accidente.
- **En unos meses Studios deja el modelo de programas** y pasa a studio
  tradicional (aviso del cliente, sin fecha firme). Cuando pase, todo el
  contenido de Generaciones, admisión y graduación necesita reposicionarse.
