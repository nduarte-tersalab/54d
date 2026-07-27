# FIXES V5 — Síntesis del Director de Diseño (26/07/2026)

Consolida: `audit/SPACING_HEROES.md`, `audit/SPACING_RHYTHM.md`, `audit/MOBILE_NAV.md`,
`audit/MOBILE_COMMERCE.md`, `ATMOSPHERE_SPEC.md`. Evidencia: `audit-v5/metrics.json` + screenshots.
Responde los 4 puntos del cliente: padding de heros, espaciados globales, degradados/hover, video que "se corta por debajo".

**Los 4 números que lo resumen:** `heroContentRect.top = 0px` en pricing/studio-hl y `7.1px` en method/on/studios/studio-cg contra un nav de 64px (metrics.json — el eyebrow se dibuja dentro del nav, `pricing-d0.png`, `method-d0.png`, `on-m0.png`); fronteras entre secciones de **149px en /on vs 403px en /blog** (2.7×, `blog-d1.png`); photo-band de home con **1px** de aire inferior (`home-d1.png`); `.hero-veil` que muere en `rgba(7,7,7,0.88)` al 92% → el video queda ~12% visible en el borde (`home-d0.png`, y≈830–900).

---

## §1 — TOKENS (`:root` de `app.css`, reemplaza L67-70 y añade)

Reconciliación: escala de RHYTHM (media-frontera) **gana** al `clamp(4.5rem,10vw,9rem)` de MOBILE_NAV — resuelve los 192px muertos de mobile Y elimina los 14 hacks inline. Hero: padding en `.hero` (no `.hero-inner`) para cubrir también home, con la variable de banner de MOBILE_NAV y el clamp de SPACING_HEROES. `--hero-min-inner` toma el `min(62svh, 42rem)` de MOBILE_COMMERCE (cap en pantallas altas). Se descarta `--section-pad-after-hero` de SPACING_HEROES: con la escala nueva la primera sección aporta 104px y el gap hero→heading queda en ~150px solo, sin regla especial.

```css
:root {
  --nav-h: 64px;
  /* Escala vertical — cada sección posee MEDIA frontera (padding-block simétrico) */
  --space-2: 1rem;                               /* gaps de grid (ya OK) */
  --space-3: 1.5rem;                             /* interior cards, legal footer */
  --space-4: 2rem;                               /* eyebrow → título (absorbe --space-eyebrow) */
  --space-block: clamp(3rem, 5vw, 3.5rem);       /* título → grid (unifica 3rem y 3.5rem) */
  --space-band: clamp(4rem, 8vw, 6.5rem);        /* interior de photo-band */
  --space-section: clamp(3.5rem, 7.5vw, 6.5rem); /* media frontera: 56→104px */
  --space-page: clamp(6rem, 10vw, 9rem);         /* despedida pre-footer */
  /* Hero */
  --hero-pad-top: calc(var(--app-banner-h, 0px) + var(--nav-h) + clamp(1.5rem, 4vh, 3rem));
  --hero-pad-bottom: clamp(2.5rem, 6vh, 4rem);   /* unifica 36px home / 54px interiores */
  --hero-min: 100svh;
  --hero-min-inner: min(62svh, 42rem);           /* 55svh (495px) < contenido real 434–503px */
  --transition-slow: 600ms cubic-bezier(0.16, 1, 0.3, 1); /* imágenes y luz */
}
```

Frontera resultante sección↔sección: **208px @1440 / 112px @412 — siempre, en las 9 páginas.**

---

## §2 — CSS GLOBAL por bloque de `app.css`

### 2.1 Hero (L240-247, L291-298, L781-782)
```css
.hero {
  position: relative; min-height: var(--hero-min);
  display: flex; flex-direction: column; justify-content: flex-end;
  overflow: hidden;
  padding-top: var(--hero-pad-top);   /* el contenido ya no puede subir bajo el nav/banner */
}
.hero-inner { min-height: var(--hero-min-inner); }
/* UNA sola regla de aire inferior; BORRAR ".hero-inner .hero-content { margin-bottom: ... }" (L782) */
.hero-content { position: relative; z-index: 2; padding: 0 var(--gutter);
  width: 100%; max-width: var(--container); margin: 0 auto var(--hero-pad-bottom); }
```

### 2.2 Secciones y split (L372, L500-507)
```css
.section { padding: var(--space-section) var(--gutter); }
.section:last-of-type { padding-bottom: var(--space-page); }  /* única excepción: pre-footer */
.split { padding-block: var(--space-section); }  /* F2/F3 RHYTHM: fin del 1px de home-d1 y del −94px mobile de method */
```
Unificar `margin-top: 3rem` → `var(--space-block)` en `.split-footer` (L555), `.pricing-grid` (L790), `.faq-list` (L812), `.stat-row` (L840). `.day-marker` pasa a `margin-bottom: var(--space-4)`.

### 2.3 Photo-bands (L863-871)
```css
.photo-band { margin-block: 0; }  /* full-bleed; los vecinos aportan su media frontera */
.photo-band-content { padding: var(--space-band) var(--gutter); }
```

### 2.4 Footer (L665, L918-927) — hoy 80px/32px fijos, 224px de caja de entrada
```css
.footer { padding: var(--space-section) var(--gutter) var(--space-3); }
a.store-badge { height: auto; min-height: 56px; flex: 1 1 170px; max-width: 220px; }
.store-badge small { white-space: nowrap; }   /* mata el "GET IT ON / GOOGLE PLAY" en 3 líneas */
@media (max-width: 640px) {
  .footer .store-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .footer a { padding-block: 0.65rem; margin-bottom: 0; }  /* target ≥44px (hoy 22.8px) */
}
```

### 2.5 Mobile: nav, drawer, app banner (L144-197)
```css
.nav-drawer { overflow-y: auto; padding-top: 4rem; padding-bottom: 3rem; } /* clip en landscape */
.app-banner { height: 60px; transition: transform 260ms cubic-bezier(0.33,1,0.68,1); }
.app-banner.hidden { transform: translateY(-100%); }  /* auto-hide al scrollear abajo */
.app-banner-close { padding: 0; width: 44px; height: 44px; display: grid; place-items: center;
  margin-left: -8px; }                                 /* hoy 26.1×34.4px */
.app-banner-get { padding: 0.85rem 1rem; }             /* hoy alto 35.6px */
```
JS: mismo listener `scrolled` del nav, invertido; al ocultarse, `--app-banner-h: 0px` (el nav sube con él). `app-banner.tsx`: `BANNER_H = "60px"`.

### 2.6 Botones mobile — una sola altura (hoy 50/55/57px, metrics `mobile.buttons`)
```css
@media (max-width: 640px) {
  .btn-primary, .btn-ghost { padding: 1.05rem 2rem; font-size: 0.9rem; min-height: 55px; }
}
```

---

## §3 — ATMÓSFERA (integra ATMOSPHERE_SPEC; recortes indicados)

### 3.1 Hero video fade — pedido explícito del cliente
Gana la versión *eased* de ATMOSPHERE (8 stops en curva, termina en `#070707` sólido, `-1px` anti-subpixel) sobre el 3-stop de SPACING_HEROES. Reemplaza `.hero-veil` (L285-289):
```css
.hero-veil { position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(7,7,7,0.5) 0%, rgba(7,7,7,0) 40%, rgba(7,7,7,0.72) 92%); }
.hero-veil::after {  /* fusión video → lona; stops ease-in: sin banding, sin línea de corte */
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 32%;
  pointer-events: none;
  background: linear-gradient(180deg,
    rgba(7,7,7,0) 0%, rgba(7,7,7,0.045) 12%, rgba(7,7,7,0.16) 28%, rgba(7,7,7,0.36) 46%,
    rgba(7,7,7,0.62) 64%, rgba(7,7,7,0.85) 80%, rgba(7,7,7,0.97) 92%, #070707 100%); }
.hero-inner .hero-veil::after { height: 24%; }  /* heros de foto: fade más corto, misma curva */
```
El ticker (z2) y `.hero-content` (z2) quedan sobre el fade (z1): el ticker de home apoya en negro pleno. **Borrar** el spacer `<div style={{height:'6vh'}}/>` de `home.tsx:177` (redundante con `--hero-pad-bottom`).

Mismo tratamiento al corte de `home-d1.png` (y≈545): reemplaza `.photo-band::after` (L868-869):
```css
.photo-band::after { content: ''; position: absolute; inset: 0; background:
  linear-gradient(180deg, rgba(7,7,7,0) 78%, rgba(7,7,7,0.55) 92%, #070707 100%),
  linear-gradient(0deg,   rgba(7,7,7,0) 78%, rgba(7,7,7,0.55) 92%, #070707 100%),
  linear-gradient(90deg, rgba(7,7,7,0.82) 0%, rgba(7,7,7,0.35) 55%, rgba(7,7,7,0.1) 100%); }
```

### 3.2 Campos de gradiente de fondo — máx. 1 por página, pico ≤0.08, feather 72%
Reemplaza `.bloom::before`/`.bloom-right::before` (L377-386) y añade B/C según ATMOSPHERE §2 (bloom "dawn" 0.06, `bloom-right` 0.05, `bloom-ember` 0.055 bajo-cálido, `seam-warm` costura `#070707→#0B0A07→#070707`). Asignación: home=`seam-warm` en `#metodo` · method=`.bloom` 1ª sección (queda) · on=`.bloom-ember` pre-CTA · pricing=`.bloom` en `#plans` · studios=`.bloom-right` en `#sedes` · studio-cg/hl=`.bloom-ember` pre-CTA · **blog: quitar 2 de sus 3 blooms** (dejar 1ª sección) · contact=queda.

### 3.3 Hovers — muere el `translateY(-6px)` compartido; el lift queda solo en botones
Aplicar ATMOSPHERE §3 completo (3.1–3.7): `.method-card` se enciende (glass-hover + borde accent + numeral amarillo, sin movimiento); `.pricing-card` ignición de borde + regla inferior `--grad-sun` que se dibuja con `scaleX` (`--transition-slow`); `.studio-row` conserva su `translateX(6px)` + flecha `→` que llega en `.studio-cta::after`; `.photo-card img` zoom 900ms a 1.02 + caption que despierta (regla amarilla 18→32px); `.split-panel:hover { transform: none; }` (su sombra ámbar ya hace el trabajo); `.btn-ghost:hover` gana `background: rgba(255,210,0,0.05)`; `a.store-badge:hover` gana `background: var(--glass)`. Cerrar con el bloque `prefers-reduced-motion` de ATMOSPHERE.

**Recorte del director:** el bloom de la featured card (`.pricing-card.featured::before`, radial 0.10) propuesto por MOBILE_COMMERCE **se aplica solo en ≤900px** — en desktop violaría la regla "máx. 1 campo por página" de ATMOSPHERE en /pricing (ya tiene `.bloom` en `#plans`).

---

## §4 — POR ARCHIVO de ruta

| Archivo | Cambios |
|---|---|
| `routes/home.tsx` | L177: borrar spacer `6vh`. L383: quitar `paddingTop: 0`. `#metodo`: añadir clase `seam-warm`. |
| `routes/on.tsx` | Quitar `paddingTop: 0` ×8 (L726, 810, 904, 1053, 1074, 1096, 1151, 1173). L858-865 CTA "Buy this program" (hoy 168×35px, font 11.5px): `padding: "0.8rem 1.5rem", fontSize: "0.8rem", minHeight: "44px"`. Migrar fila de programa inline→clases `.prog-row/.prog-price/.prog-meta` con el breakpoint 640px de MOBILE_COMMERCE F4 (precio pasa a barra horizontal, meta a grid key/value). Tabla comparativa: clase `.table-wrap` con `mask-image` fade 88%. Añadir `<StickyCta href="#membership" label="Start free trial" />` (página de 15.458px sin CTA persistente). `.bloom-ember` en la última sección pre-CTA. |
| `routes/pricing.tsx` | Quitar `paddingTop: 0` ×5 (L415, 443, 471, 504, 545). L220: umbral sticky `0.5 → 0.25`. Con barra visible: `paddingBottom: 84px` en body/spacer (hoy tapa el legal del footer). Extraer la sticky a `components/sticky-cta.tsx` compartido. CSS: `.pricing-grid .pricing-card.featured { order: -1; }` + refuerzo (`glass-hover` + sombra ámbar 0.10 + bloom propio) en ≤900px — hoy la featured va 2ª/3ª en un stack de cards de 428-451px con 1px de borde como única señal. |
| `routes/method.tsx` | L313: quitar `paddingBottom: 0` de `#para-quien`. El `.split` promo (58px desktop / solape −94px mobile contra FAQ) respira solo con §2.2. |
| `routes/contact.tsx` | L88: quitar `paddingBottom: "2.5rem"`. L403: quitar `paddingTop: 0`. Opcional: `.hero-compact` (`--hero-min-inner: 50svh`) si 62svh se siente vacío con 239px de contenido. |
| `routes/blog.tsx` | L580: quitar `paddingTop: 0`. Podar 2 de 3 blooms. Opcional `.hero-compact`. |
| `routes/studios.tsx` | L342: quitar `paddingTop: 0`. `.bloom-right` en `#sedes`. |
| `routes/studio-detail.tsx` | L692: quitar `paddingTop: 0`. `.bloom-ember` pre-CTA. Verificar que los CTAs "Reserve your spot" del hero anclan al mini-form (está al 80% de la página). |
| `components/site.tsx` | Drawer (L46-51): añadir `<Link to="/contact">Contact</Link>` (hoy Contact solo existe en el footer, con WhatsApp por sede como destino de primer nivel). |
| `components/app-banner.tsx` | `BANNER_H = "60px"`; lógica auto-hide (§2.5) sincronizando `--app-banner-h → 0px` al ocultar. |
| `components/sticky-cta.tsx` | NUEVO: extraído de pricing.tsx L566-590; props `href`/`label`; usado en /pricing y /on. |

Nota: grep de control tras migrar — `grep -rn "paddingTop: 0" apps/web/app/routes/` debe devolver **0** resultados; ídem `translateY(-6px)` en `app.css`.

---

## §5 — CHECKLIST DE ACEPTACIÓN (binario, medible con Playwright + sample de píxeles)

1. `heroContentRect.top ≥ 96px` en desktop 1440 en las 9 páginas (hoy: 0 / 7.1 / 102 / 202 / 268).
2. En Pixel 7 con app banner activo, `heroContentRect.top ≥ 120px` en las 9 páginas (hoy /method: título en y=64.7 sobre el logo).
3. Home 1440×900: la fila de píxeles y=899 del hero samplea **exactamente `#070707`**, y entre y=610–900 ningún salto >4 niveles RGB entre filas adyacentes (anti-banding).
4. Margen inferior de `.hero-content` = 40–64px (un solo valor computado por viewport) en las 9 páginas (hoy 36 en home, 54 interiores).
5. Frontera sección↔sección = 208px ±4 @1440 y 112px ±4 @412 en todas las fronteras de las 9 páginas (hoy 149–403px); `grep "paddingTop: 0"` en `routes/` = 0.
6. Aire alrededor de cada photo-band entre 104–208px @1440 (hoy 1px en home, 400px en studios).
7. `viewportOverflowX: false` en las 9 páginas @412 (se mantiene).
8. Todos los touch targets del cromo y funnel ≥44px: `.app-banner-close` = 44×44 (hoy 26.1×34.4), "Buy this program" alto ≥44 (hoy 35), links de footer pitch ≥44 (hoy 22.8+margen).
9. `.btn` de contenido en mobile: una sola altura = 55px ±1 (hoy 50/55/57).
10. En /pricing y /on mobile, la card `featured` es la **primera** del stack y la sticky CTA aparece antes del 25% de scroll sin tapar el legal del footer.
11. Drawer mobile: contiene Contact y scrollea completo en landscape (alto 390px).
12. Cero `translateY(-6px)` en hover de cards (`method-card`, `pricing-card`, `split-panel`); badge Google Play en una línea por palabra, sin `overflowing: true`.

---

*Orden de implementación: §1+§2.1 (hero) → §3.1 (fade, pedido explícito) → §2.2-2.4 + limpieza inline (ritmo) → §3.3 (hovers) → §3.2 (campos) → §4 commerce (featured/sticky/44px) → correr §5.*
