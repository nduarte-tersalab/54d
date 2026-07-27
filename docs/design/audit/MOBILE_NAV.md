# MOBILE_NAV — Auditoría mobile: navegación y jerarquía

**Lead:** Mobile UX (navegación y jerarquía) · **Fecha:** 2026-07-26
**Evidencia:** `audit-v5/{página}-m0..m2.png` (Pixel 7, 412×915), `audit-v5/metrics.json`, más mediciones live (Playwright, Pixel 7 con smart app banner activo → viewport útil 412×839).
**Contexto de cromo fijo:** app banner 56px (fixed, z90) + nav 64px (fixed, z100) = **120px de cromo permanente = 14.3% del viewport**.

---

## H1 — CRÍTICO: el hero de las páginas interiores choca contra el logo/nav

**Evidencia.** `metrics.json` → `heroContentRect.top` con `navHeight: 64`:

| Página | top (desktop 1440) | ¿Bajo el nav? |
|---|---|---|
| method / on / studios / studio-cg | **7.1px** | Sí |
| pricing / studio-hl | **0px** | Sí |
| blog / contact | 102 / 202px | No |

En mobile es peor: medido live en `/method`, `.hero-title` arranca en **y=64.7** mientras el nav ocupa 56–120 y el logo está en (20, 64, 47×47): **el H1 se dibuja literalmente encima del logo**. Visible a simple vista en `method-m0.png` ("54 DAYS OF…" pisando el lockup 54D) y `pricing-m0.png` (kicker "54D ON · 7-DAY FREE TRIAL" cruzado con el logo; `contentTop` medido 80.2 < navBottom 120).

**Causa raíz.** `.hero-inner { min-height: 55svh }` (app.css:781) + `.hero { justify-content: flex-end }` (app.css:240-247) sin **ningún clearance superior**. Cuando el contenido mide más que 55svh (siempre en mobile: H1 + sub + 2 CTAs ≈ 400px+), crece hacia arriba hasta y≈0, detrás del banner+nav. Esto es además el origen del feedback del cliente "el padding de los heros se siente mal".

**Fix CSS** (app.css, junto a `.hero-inner`):

```css
.hero-inner {
  min-height: 55svh;
  /* clearance: banner (si existe) + nav 64px + aire */
  padding-top: calc(var(--app-banner-h, 0px) + 64px + clamp(1.5rem, 4vh, 3rem));
}
```

Con `flex-end` el padding-top actúa como límite duro: el contenido ya no puede invadir el nav. Verificar después que `heroContentRect.top ≥ 120` en mobile y `≥ 64` en desktop en las 6 páginas afectadas.

---

## H2 — Smart app banner: touch targets ilegales y 120px de cromo

**Evidencia (medido live, Pixel 7):**

- `.app-banner-close` → **26.1×34.4px** (mínimo 44×44; WCAG 2.5.5 / HIG). Cerrar el banner es el gesto más frecuente y es el más difícil de acertar.
- `.app-banner-get` → 93.3×**35.6px** (alto < 44).
- Banner (fixed) + nav (fixed) = 120px que nunca se van; en `home-m1.png`/`home-m2.png` se ve que a mitad de scroll seguimos pagando 120px de pantalla. El banner sí desplaza correctamente el nav (`top: var(--app-banner-h)`, app.css:107) — el layout no se rompe — pero nada empuja el *contenido* (el hero arranca en y=0 detrás del cromo; ver H1).

**Fix CSS** (app.css:166-197):

```css
.app-banner { height: 60px; }              /* +4px para respirar */
.app-banner-close {
  padding: 0;
  width: 44px; height: 44px;               /* target real */
  display: grid; place-items: center;
  margin-left: -8px;                        /* compensa visualmente */
}
.app-banner-get { padding: 0.85rem 1rem; } /* alto resultante ≈ 44px */
```

(y en `app-banner.tsx` actualizar `BANNER_H = "60px"`). Recomendación UX extra: el banner nativo iOS de Safari scrollea con la página; considerar `position: absolute` (en vez de `fixed`) para que el nuestro también desaparezca al scrollear y devuelva 56–60px de viewport.

---

## H3 — Footer: badge de Google Play desbordado y targets de 22.8px

**Evidencia.**

- Medido live: `a.store-badge` = 170×56 fijo; el segundo (Google Play) reporta **`overflowing: true`** (scrollHeight > 56). En `home-m2.png` se ve el texto "GET IT ON / GOOGLE PLAY" partido en 3 líneas y los dos badges apilados como cajas estrechas descolgadas a la izquierda.
- Links de footer (sedes, Blog, Contact, legal): alto medido **22.8px** con 0.6rem de margen → pitch ~32px, muy por debajo de 44px en la zona del pulgar.
- `footer-grid` colapsa bien a 2 columnas (`@media 860px`, app.css:682; visible en `home-m2.png`) — eso está OK.

**Causa.** `a.store-badge { height: 56px }` fijo (app.css:918) con `small` de 10px que envuelve a 2 líneas cuando el ancho queda en 170px.

**Fix CSS:**

```css
a.store-badge { height: auto; min-height: 56px; flex: 1 1 170px; max-width: 220px; }
.store-badge small { white-space: nowrap; }
@media (max-width: 640px) {
  .footer .store-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .footer a { padding-block: 0.55rem; margin-bottom: 0; } /* target ≥44px */
}
```

---

## H4 — Drawer: targets excelentes, pero faltan destinos y falta `overflow-y`

**Evidencia (medido live con drawer abierto).**

- Links: 83.5px de alto, font 45.3px — targets sobrados, jerarquía correcta. CTA "Start free. 7 days." 265×50 (también en `metrics.json`, botón #2 de cada página).
- Contenido del drawer: **Method, 54D ON, Studios, Blog + CTA** (site.tsx:46-51). **No hay Contact ni Pricing como ítems**: Pricing queda cubierto por el CTA, pero **Contact solo es alcanzable scrolleando hasta el footer** — en un sitio de leads con WhatsApp por sede (`contact-m1.png`) es un destino de primer nivel en mobile.
- `overflow-y: visible` y `scrollable: false`: en portrait caben (4×83.5 + 50 ≈ 384px de 839), pero en **landscape (alto ≈ 390px) los links se recortan sin scroll posible**.
- Burger: **44×44 ✓** (medido live en (348, 65.5); CSS app.css:133).

**Fix** (site.tsx + app.css):

```tsx
// site.tsx — añadir al drawer (no al nav desktop si se quiere mantener corto):
<Link to="/contact" onClick={close}>Contact</Link>
```

```css
.nav-drawer { overflow-y: auto; padding-top: 4rem; padding-bottom: 3rem; }
```

---

## H5 — Ritmo vertical mobile: 192px muertos entre secciones y hero sin aire inferior

**Evidencia.**

- `--space-section` resuelve a **96px** en 412px (medido live: secciones `96px 20px`). Entre dos secciones se apilan 96+96 = **192px de vacío** — visible en `method-m1.png`: hueco de ~190px entre el fin del timeline y "THE GUARANTEE" (≈47% de una pantalla). En desktop `metrics.json` reporta `144px 56px` consistente en las 36 secciones auditadas — el sistema es regular, solo que en mobile no se comprime lo suficiente.
- Contrapartida en el hero: `.hero-content { margin: 0 auto 4vh }` → solo ~34px entre los CTAs y el borde del hero en mobile (`home-m0.png`: "EXPLORE THE STUDIOS" casi pegado al ticker), mientras que arriba sobran 192px entre secciones. La jerarquía respira donde no toca.
- Título de hero mobile: `hero-content` con `padding: 0 20px` (metrics.json `mobile.heroContentPadding` en las 9 páginas) y H1 medido 372/412 = 90% del ancho — aceptable, no toca bordes; no requiere fix.

**Fix CSS:**

```css
:root { --space-section: clamp(4.5rem, 10vw, 9rem); }   /* 72px en mobile */
.hero-content { margin: 0 auto clamp(2.5rem, 6vh, 4rem); }
```

Esto además prepara el terreno para el degradado de transición del hero que pidió el cliente (el aire inferior del hero pasa a ser estable, no 4vh).

---

## Verificaciones sin hallazgo (OK)

- **Overflow horizontal:** `viewportOverflowX: false` en las 9 páginas (metrics.json). ✓
- **Botones de contenido:** todos los CTAs medidos en mobile ≥50px de alto (metrics.json: 50–57px; el botón `w:0,h:0` de cada página es el CTA del nav desktop oculto por `display:none`, no un bug). ✓
- **Ticker:** 61.2px de alto, font 14.4px, máscara de esfumado en bordes (`home-m0.png` abajo); `prefers-reduced-motion` lo pausa (app.css:730). ✓
- **Photo-bands:** en mobile sirven el asset vertical (medido: banda 520px con imagen 1066×1600 en `/method`; `studio-cg-m1.png` muestra las fotos de studio a sangre correcta). ✓
- **Footer grid:** colapsa a 2 columnas en <860px, sin huérfanos (`home-m2.png`). ✓

---

## Top-5 priorizado

1. **H1** Hero interior pisa el logo/nav en 6 de 9 páginas (mobile y desktop) → `padding-top` en `.hero-inner`.
2. **H2** App banner: close 26×34px y GET APP alto 36px (<44), 120px de cromo fijo → targets 44px y banner no-fixed.
3. **H3** Footer: badge Google Play desbordado (height 56 fija) y links de 22.8px → height auto + padding-block.
4. **H4** Drawer sin Contact y sin `overflow-y: auto` (clip garantizado en landscape).
5. **H5** Ritmo mobile: 192px entre secciones vs 34px bajo los CTAs del hero → `--space-section` 4.5rem min y margen inferior del hero estable.
