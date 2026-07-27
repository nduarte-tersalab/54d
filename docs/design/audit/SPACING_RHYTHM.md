# SPACING_RHYTHM — Auditoría de ritmo vertical (fuera de heros)

**Fecha:** 26/07/2026 · **Alcance:** 9 páginas (home, method, on, pricing, studios, studio-cg, studio-hl, blog, contact), desktop 1440 y Pixel 7 (412).
**Fuentes:** `scratchpad/audit-v5/metrics.json`, screenshots `audit-v5/{página}-d0..d3 / m0..m2.png`, y medición adicional con Playwright (`rhythm-measure.mjs`) de TODAS las secciones por página (metrics.json solo muestrea las primeras 4). Padding/box-gaps son valores computados exactos; los "content gaps" (aire visible entre el último contenido de una sección y el primero de la siguiente) son medidos en DOM y verificados contra screenshots.

**Contexto CSS** (`apps/web/app/app.css`):

```css
--space-section: clamp(6rem, 10vw, 9rem);  /* = 144px @1440, 96px @412 */
--space-block:   3.5rem;                   /* 56px fijo */
--space-eyebrow: 2rem;
--gutter: clamp(1.25rem, 4vw, 3.5rem);     /* = 56px @1440, 20px @412 */
.section { padding: var(--space-section) var(--gutter); }   /* L372 */
.footer  { padding: 5rem var(--gutter) 2rem; }              /* L665 */
.photo-band-content { padding: clamp(4rem, 9vw, 7rem) var(--gutter); } /* L871: 112px @1440 */
```

---

## 1. Hallazgos

### F1 — Frontera entre secciones bimodal: 288px vs 144px, sin criterio (CRÍTICO)

`.section` lleva `--space-section` arriba Y abajo (144px + 144px @1440). Cuando dos secciones completas se tocan, la frontera es **288px de caja**. Pero **14 secciones** anulan el top con inline `style={{ paddingTop: 0 }}`, dejando la frontera en **144px**:

| Archivo | Instancias inline `paddingTop: 0` |
|---|---|
| `routes/on.tsx` L726, 810, 904, 1053, 1074, 1096, 1151, 1173 | 8 |
| `routes/pricing.tsx` L415, 443, 471, 504, 545 | 5 |
| `routes/home.tsx` L383, `routes/blog.tsx` L580, `routes/contact.tsx` L403, `routes/studios.tsx` L342, `routes/studio-detail.tsx` L692 | 1 c/u |

Resultado medido (desktop, aire real entre contenidos):

- **/on**: cadena de 8 fronteras a **149–151px** cada una (metrics.json: `membership/programs/section` = `"0px 56px 144px"`).
- **/pricing**: 149–184px (5 secciones a `"0px 56px 144px"`).
- **/blog**: 3 fronteras de **389–403px** (todas `"144px 56px"`; ver blog-d1: la featured card termina en y≈190 y el eyebrow "ALL ARTICLES" aparece en y≈495 — ~305px de negro vacío en un solo viewport).
- **/studios**: 322–360px. **/method**: 295–354px. **/studio-cg**: 295–341px.

La misma decisión de diseño ("siguiente sección") vale 149px en /on y 403px en /blog: **2.7× de diferencia** entre páginas hermanas. /on y /pricing se sienten densas; /blog y /studios, océanos.

### F2 — Photo-bands sin regla de respiración: de 1px a 400px (CRÍTICO)

`.photo-band` es full-bleed sin padding propio (pt=0/pb=0) y su interior usa una escala ajena al sistema (`clamp(4rem, 9vw, 7rem)` = 112px @1440 vs 144px de sección). Fronteras medidas alrededor de cada band (desktop / mobile):

| Página | antes del band | después del band |
|---|---|---|
| home ("You don't finish alone" → split 54D ON/STUDIOS) | 145px / 128px | **1px / 43px** |
| method | 145px / 97px | 183px / 135px |
| studios (band → CTA final) | 112px / 64px | **400px / 280px** |
| studio-cg / studio-hl | 171 / 139px | 150 / 183px |

En **home-d1 se ve la colisión**: las cards del split "54D ON / 54D STUDIOS" nacen pegadas al borde inferior de la foto (1px de aire), porque `.split` no es `.section` y no tiene padding vertical propio (L503-506: solo `padding: 0 var(--gutter)`). El rango 1px→400px alrededor del mismo componente es la ruptura de ritmo más violenta del sitio.

### F3 — /method: bloque 54D ON asfixiado (58px desktop, solapamiento en mobile) junto a fronteras de 354px

En /method el `.split` (promo 54D ON) tampoco tiene padding vertical: el aire FAQ → split medido es **58px desktop** y **−94px en mobile** (el contenido medido se solapa con el bloque anterior), mientras que en la misma página las demás fronteras van de **295 a 354px**. Además `#para-quien` lleva `paddingBottom: 0` inline (`method.tsx` L313) → frontera de 144px entre dos vecinas de 288px. Tres ritmos distintos (58 / 144 / 288-354) en un solo scroll (method-d2/d3, method-m2).

### F4 — /contact: intro asimétrica 144/40 y agujero hasta "sedes"

`contact.tsx` L88: `style={{ paddingBottom: "2.5rem" }}` → la primera sección queda `"144px 56px 40px"` (metrics.json) con h=348px, seguida de `#sedes` con 144px top: frontera de **184px** que no existe en ninguna otra página. En contact-d1 el bloque de quick-cards termina cortado en y≈120 y el heading de studios aparece tras una banda vacía de ~215px. Mobile: la zona intro→sedes mide **>1000px** de recorrido para dos bloques de contenido de 256px (contact-m0/m1).

### F5 — Footer: 224px de entrada, 32px de salida, valores fijos fuera del sistema

`app.css` L665: `.footer { padding: 5rem var(--gutter) 2rem; }` — 80px/32px **fijos, sin token y sin clamp** (idéntico en mobile). La última sección de cada página aporta 144px de padding-bottom → **224px de caja** antes del primer contenido del footer (aire visible medido: 305px desktop, 201px mobile, idéntico en las 9 páginas), contra **32px** bajo la línea legal. El hairline decorativo del footer (L668) flota en medio de esa banda muerta. En method-m2/home-m2 se ve: océano sobre el logo-máscara gigante, legal pegado al borde inferior.

### F6 — Dos escalas compitiendo para "título → contenido": 48px vs 56px

- `--space-block: 3.5rem` (56px) → `method-intro` L429, `studios-list` L566, `timeline` L826.
- `margin-top: 3rem` (48px) hardcodeado → `pricing-grid` L790, `faq-list` L812, `stat-row` L840, `split-footer` L555.

Mismo rol semántico (heading de sección → grid de contenido), dos valores. Los gaps de grid en cambio sí son coherentes (method-grid/pricing-grid/stat-row = 1.1rem; photo-grid 1rem; faq-list 0.8rem) — el problema es solo el eje vertical macro.

### F7 — Mobile: la escala colapsa a un solo valor y pierde jerarquía

@412px `--space-section` clampa a 96px. Fronteras completas = 192px, fronteras con `paddingTop:0` = 96px, footer = 80px fijo, photo-bands = 64px interiores. Medido: home ticker→metodo 127px, metodo→band 128px, band→split **43px**, app→studios 423px (banda de imagen), studios→CTA 176px. El botón de sección en mobile además varía 50/55/57px de alto (metrics.json `mobile.buttons`, todas las páginas) — tres alturas para el mismo `.btn`.

---

## 2. Escala vertical unificada propuesta

Principio: **cada sección posee media frontera**. `padding-block` simétrico e igual para todas → toda frontera sección-sección mide exactamente `2 × --space-section`, sin hacks inline. Paso de escala ×1.33-1.5.

```css
:root {
  /* --- Escala vertical 54D (Glow) --- */
  --space-2: 1rem;                              /* 16px  gaps de grid ya existentes (1–1.2rem, OK) */
  --space-3: 1.5rem;                            /* 24px  interior de cards, legal del footer */
  --space-4: 2rem;                              /* 32px  eyebrow → título (sustituye --space-eyebrow) */
  --space-block: clamp(3rem, 5vw, 3.5rem);      /* 48→56px  título → grid (unifica los 3rem y 3.5rem) */
  --space-band: clamp(4rem, 8vw, 6.5rem);       /* 64→104px  interior de photo-band y final-wrap */
  --space-section: clamp(3.5rem, 7.5vw, 6.5rem);/* 56→104px  MEDIA frontera (padding-block de .section) */
  --space-page: clamp(6rem, 10vw, 9rem);        /* 96→144px  hero → primera sección y pre-footer */
}

.section    { padding-block: var(--space-section); }   /* frontera real: 112px mobile → 208px desktop, SIEMPRE */
.photo-band { margin-block: 0; }                        /* full-bleed; los vecinos ya aportan su media frontera */
.photo-band-content { padding: var(--space-band) var(--gutter); }
.split      { padding-block: var(--space-section); }    /* F2/F3: el split deja de ser un cuerpo sin aire */
.footer     { padding: var(--space-section) var(--gutter) var(--space-3); } /* entrada 56–104px + pb144→ ya no: */
.section:last-of-type { padding-bottom: var(--space-page); } /* única excepción: despedida antes del footer */
```

Fronteras resultantes @1440 / @412:

| Frontera | Hoy | Propuesta |
|---|---|---|
| sección ↔ sección (completas) | 288 / 192px | **208 / 112px** |
| sección ↔ sección (`paddingTop:0`) | 144 / 96px | **208 / 112px** (hack eliminado) |
| sección ↔ photo-band | 1–400px | 104–208 / 56–112px |
| última sección ↔ footer | 224+hairline / 176px | 144+104 → **~200 / ~150px** con hairline anclado |
| título → grid | 48 ó 56px | 48→56px fluido, un token |

### Migración (orden sugerido)

1. `app.css` L68-70: nuevos tokens; L372 `padding-block`; L665 footer; L871 photo-band; L503 `.split`.
2. Borrar los **14** `style={{ paddingTop: 0 }}` (on.tsx ×8, pricing.tsx ×5, home/blog/contact/studios/studio-detail ×1) + `paddingBottom` inline en `contact.tsx` L88 y `method.tsx` L313.
3. Unificar `margin-top: 3rem` → `var(--space-block)` en L555, L790, L812, L840.
4. QA visual: home-d1 (split ya no toca el band), blog-d1 (océano cerrado), on-d1/d2 (respira), method-m2, contact-m0.

Esto además le da al cliente el "juego de degradados" que pide sin tocar contenido: con fronteras constantes, los `bloom` y el degradado de transición del video del hero (ver SPACING_HEROES.md) caen siempre a la misma distancia del contenido.
