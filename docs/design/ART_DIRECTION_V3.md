# 54D: Dirección de arte v3 "Glow, grounded"

Respuesta al feedback del cliente (24/07): el sitio se veía "hecho con IA". La lona negra, el amarillo
como luz y la tipografía condensada se quedan. Lo que cambia: la barra deja de flotar, entran las fotos
reales de los manifests, la app pasa a primer plano y purgamos los tics (em-dashes incluidos: revisar
todo el copy y reemplazar por punto, coma o dos puntos; nunca "—").

---

## 1. HEADER NUEVO: barra sólida full-width

Patrón de referencia (Nike / Represent / Whoop): la barra es un plano del layout, no un objeto flotando.
Full-width, negro sólido al scroll, sin blur, borde inferior hairline, esquinas duras.

Estructura JSX (reemplaza el `<nav>` de `apps/web/app/components/site.tsx`):
wordmark "54D" a la izquierda (blanco sólido, sin gradient en la D), links en caps condensadas al centro-derecha,
CTA "Start free" como bloque sólido amarillo (radio 2px) al extremo derecho. En mobile: hamburger que abre
un panel full-screen negro con links gigantes. Nada de pill, nada de glass.

CSS completo (reemplaza TODO el bloque `/* ---------- Nav ---------- */` de `app.css`):

```css
/* ---------- Nav (barra sólida full-width) ---------- */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: 64px; padding: 0 var(--gutter);
  background: transparent; border-bottom: 1px solid transparent;
  transition: background var(--transition), border-color var(--transition);
}
.nav.scrolled { background: var(--c-black); border-bottom-color: var(--hairline); }
.nav-logo {
  font-family: var(--font-display); font-weight: 800; font-size: 1.35rem;
  letter-spacing: 0.02em; color: var(--c-white); text-decoration: none;
}
.nav-links { display: flex; align-items: center; gap: clamp(1.2rem, 2.5vw, 2.4rem); }
.nav-links a:not(.btn) {
  font-family: var(--font-display); font-weight: 700; font-size: 0.8rem;
  text-transform: uppercase; letter-spacing: 0.14em; color: var(--c-white);
  text-decoration: none; padding: 0.4rem 0; border-bottom: 2px solid transparent;
  transition: border-color var(--transition), color var(--transition);
}
.nav-links a:not(.btn):hover { border-bottom-color: var(--c-yellow); }
.nav-links a[aria-current="page"] { border-bottom-color: var(--c-yellow); }
.btn-nav {
  background: var(--c-yellow); color: var(--c-black) !important;
  border-radius: 2px; padding: 0.7rem 1.5rem; font-size: 0.8rem;
  letter-spacing: 0.1em; box-shadow: none;
}
.btn-nav:hover { background: var(--c-amber); transform: none; }
/* Hamburger + drawer mobile */
.nav-burger {
  display: none; width: 44px; height: 44px; background: none; border: 0;
  cursor: pointer; position: relative; z-index: 102;
}
.nav-burger span {
  display: block; width: 22px; height: 2px; background: var(--c-white);
  margin: 5px auto; transition: transform var(--transition), opacity var(--transition);
}
.nav-burger[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
.nav-burger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.nav-drawer {
  position: fixed; inset: 0; z-index: 101; background: var(--c-black);
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 var(--gutter); transform: translateX(100%);
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
}
.nav-drawer.open { transform: translateX(0); }
.nav-drawer a {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(2.6rem, 11vw, 4.5rem); line-height: 1.12;
  text-transform: uppercase; color: var(--c-white); text-decoration: none;
  border-bottom: 1px solid var(--hairline); padding: 0.35em 0;
}
.nav-drawer a:active, .nav-drawer a:hover { color: var(--c-yellow); }
.nav-drawer .btn-nav { align-self: flex-start; margin-top: 2rem; border-bottom: 0;
  font-size: 1rem; padding: 1rem 2.2rem; }
@media (max-width: 820px) {
  .nav-links { display: none; }
  .nav-burger { display: block; }
}
```

Comportamiento: `scrolled` se activa igual que hoy (scrollY > 40); en el hero la barra es transparente
sobre la foto, al scroll es negro pleno. El drawer bloquea scroll del body (`overflow: hidden`) y se
cierra al navegar. Las páginas ganan `padding-top: 64px` solo donde no hay hero full-bleed.

## 2. FOTOGRAFÍA: reglas de integración

Assets: `docs/assets/IMAGES_BRAND.md` (12 fotos, 1000px) y `docs/assets/IMAGES_CG.md` (9 verticales 2:3).
Siempre via helper: `import { asset } from "../lib/asset"; <img src={asset("images/brand/...jpg")} />`.

Tratamiento: las fotos ya traen la paleta 54D (negro + mural amarillo). Regla dura: NUNCA filtros amarillos
sobre piel. Tratamiento por defecto: leve desaturación + veil negro para que el texto respire; el amarillo
solo aparece en UI (captions, kickers, reglas) y en el mural que ya está EN la foto. Hero de home:
`gym-interior-54d-logo-wide.jpg` (desktop) / `54d-logo-mural-core-class-vertical.jpg` (mobile).

Ratios: horizontales 3:2 nativas, recortar a 21:9 para bands; verticales CG 2:3 nativas para grids/cards.
A 1000px no estirar más allá de ~60vw por imagen: en full-bleed compensar con overlay + grano.

Composición editorial: nada centrado por default. Grids asimétricos 60/40, imágenes con bleed a un borde
del viewport, texto invadiendo la foto. Captions en caps chicas espaciadas estilo mono.

```css
/* ---------- Fotografía ---------- */
.photo-band { position: relative; min-height: 62vh; overflow: hidden; }
.photo-band img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; filter: saturate(0.82) contrast(1.05);
}
.photo-band::after { content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(7,7,7,0.82) 0%, rgba(7,7,7,0.35) 55%, rgba(7,7,7,0.1) 100%); }
.photo-band-content { position: relative; z-index: 1; max-width: var(--container);
  margin: 0 auto; padding: clamp(4rem, 9vw, 7rem) var(--gutter); }
.photo-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 1rem;
  align-items: stretch; }
.photo-grid.flip { grid-template-columns: 2fr 3fr; }
@media (max-width: 820px) { .photo-grid, .photo-grid.flip { grid-template-columns: 1fr; } }
.photo-card { position: relative; overflow: hidden; border-radius: 4px; background: var(--c-ink); }
.photo-card img { width: 100%; height: 100%; object-fit: cover; display: block;
  filter: saturate(0.82) contrast(1.05); transition: transform 600ms cubic-bezier(0.16,1,0.3,1); }
.photo-card:hover img { transform: scale(1.03); }
.photo-card figcaption, .photo-caption {
  font-family: var(--font-display); font-weight: 700; font-size: 0.68rem;
  text-transform: uppercase; letter-spacing: 0.22em; color: var(--c-faint);
  padding: 0.7rem 0 0; display: flex; gap: 0.6rem; align-items: baseline;
}
.photo-caption::before { content: ''; width: 18px; height: 2px; background: var(--c-yellow);
  align-self: center; flex: none; }
.photo-bleed-right { margin-right: calc(-1 * var(--gutter)); border-radius: 4px 0 0 4px; }
.photo-bleed-left { margin-left: calc(-1 * var(--gutter)); border-radius: 0 4px 4px 0; }
```

Uso sugerido: home = hero foto + 1 photo-band (group-photo-54d-mural, comunidad); /method = photo-grid
con class-plank-54d-mural + vertical CG; /studios/coral-gables = grid 2:3 con las 9 de IMAGES_CG.

## 3. SECCIÓN "THE APP" (54D On, iOS + Android)

Datos verificados en `docs/marketing/APP_INFO.md`: nombre exacto "54D On", 4.9 en App Store (1,788
ratings), 4.98 en Play, coach real con seguimiento diario, integración Apple Health / Watch.
Links canónicos: `https://apps.apple.com/us/app/54d-on/id1520445334` y
`https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays`.

Layout: split 40/60. Izquierda: teléfono en CSS puro. Derecha: título, lista numerada dura de features
(coach real, plan 360, on-demand y live, nutrición, Apple Health), badges de stores como bloques de
texto con hairline (NO usar los badges trademark de Apple/Google como imágenes), fila de ratings.

```css
/* ---------- The app ---------- */
.app-section { display: grid; grid-template-columns: 2fr 3fr; gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center; }
@media (max-width: 860px) { .app-section { grid-template-columns: 1fr; } }
.phone { width: min(290px, 74vw); aspect-ratio: 9 / 19.2; margin: 0 auto;
  border-radius: 42px; border: 1px solid #2a2a2a; background: #101010;
  padding: 10px; box-shadow: 0 40px 90px rgba(0,0,0,0.6); position: relative; }
.phone::before { content: ''; position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
  width: 84px; height: 24px; border-radius: 999px; background: #070707; z-index: 2; }
.phone-screen { width: 100%; height: 100%; border-radius: 32px; overflow: hidden;
  background: linear-gradient(200deg, #1a1a1a 0%, #0b0b0b 100%); }
.phone-screen img { width: 100%; height: 100%; object-fit: cover; }
.app-features { counter-reset: feat; margin: 2rem 0; }
.app-features li { list-style: none; counter-increment: feat; display: grid;
  grid-template-columns: 3.2rem 1fr; gap: 1rem; align-items: baseline;
  padding: 1.05rem 0; border-top: 1px solid var(--hairline); }
.app-features li:last-child { border-bottom: 1px solid var(--hairline); }
.app-features li::before { content: counter(feat, decimal-leading-zero);
  font-family: var(--font-display); font-weight: 800; font-size: 1rem; color: var(--c-yellow); }
.app-features strong { font-family: var(--font-display); font-weight: 800; font-size: 1.05rem;
  text-transform: uppercase; color: var(--c-white); display: block; }
.app-features span { color: var(--c-mist); font-size: 0.95rem; line-height: 1.5; }
.store-badges { display: flex; gap: 0.8rem; flex-wrap: wrap; }
.store-badge { display: flex; flex-direction: column; padding: 0.7rem 1.4rem;
  border: 1px solid var(--hairline); border-radius: 2px; text-decoration: none;
  transition: border-color var(--transition); }
.store-badge:hover { border-color: var(--c-yellow); }
.store-badge small { font-size: 0.62rem; text-transform: uppercase;
  letter-spacing: 0.18em; color: var(--c-faint); }
.store-badge b { font-family: var(--font-display); font-weight: 800; font-size: 1rem;
  text-transform: uppercase; color: var(--c-white); }
.app-rating { display: flex; gap: 2rem; margin-top: 1.4rem; font-size: 0.8rem;
  text-transform: uppercase; letter-spacing: 0.14em; color: var(--c-faint); }
.app-rating b { color: var(--c-yellow); font-family: var(--font-display); margin-right: 0.4rem; }
```

Copy de badges: `<small>Download on the</small><b>App Store</b>` y `<small>Get it on</small><b>Google Play</b>`.
Ratings: "4.9 App Store" y "4.9 Google Play" (redondear 4.98 hacia abajo, nunca inflar). Si no hay
screenshot verificado de la app, el phone-screen queda con el gradiente + wordmark 54D centrado.

## 4. DE-IA-IFICACIÓN GLOBAL

1. Gradient text: SOLO en el accent del hero de home y máximo 1 accent por página interior. Todo otro
   `.accent`, `.method-num`, `.stat-value`, `.pricing-price`, hover de `.studio-city` y el `em` del
   logo pasan a color sólido (`--c-white` o `--c-yellow` plano según jerarquía).
2. Esquinas: pills solo en `.btn-primary` y `.btn-ghost` existentes. TODO componente nuevo usa 2-4px.
   Migrar `.day-marker` y `.hero-kicker` a radio 2px sin glass (borde hairline seco, sin blur ni fondo).
3. Blooms: máximo 1 por página (el del hero). Quitar `.bloom` de las secciones intermedias; la foto
   real reemplaza a la luz decorativa.
4. Em-dashes: prohibidos en todo copy nuevo y purgar los existentes. Buscar `—` en `apps/web/app` y
   reemplazar por punto, coma, dos puntos o reescritura.
5. Hovers: nada de solo-escala ni translateY genérico en cards; preferir cambio de borde/color y el
   zoom lento de `.photo-card`. Quitar `transform: translateY(-6px)` de method/pricing cards.
6. Layout: alternar alineaciones (títulos a la izquierda por default), nada de tríos icon+título+párrafo.
