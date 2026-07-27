# MOBILE COMMERCE — Auditoría del funnel de compra en mobile

**Fecha:** 26/07/2026 · **Auditor:** especialista Mobile UX de comercio
**Alcance:** `/on`, `/pricing`, `/studios/coral-gables`, `/studios/hallandale`, `/contact` a 390–412px (Pixel 7).
**Evidencia:** screenshots `audit-v5/{página}-m0..m2.png`, `audit-v5/metrics.json` (valores computados), más mediciones live con Playwright sobre `http://localhost:5173` (Pixel 7, 412×915) — valores citados en cada hallazgo.

Archivos implicados:
- `apps/web/app/app.css` (sistema)
- `apps/web/app/routes/on.tsx` (membresía + 13 programas, estilos inline)
- `apps/web/app/routes/pricing.tsx` (planes + sticky bar)
- `apps/web/app/routes/studio-detail.tsx` (mini-form de leads)
- `apps/web/app/routes/contact.tsx` (form de contacto)

---

## Resumen ejecutivo

El "plumbing" del funnel está bien hecho: inputs de 16px (cero zoom iOS), campos de 56px, submits de 55px, `<details>` nativos con summary de 72px. Lo que falla es la **jerarquía comercial en el stack mobile**: el hero interior choca contra el nav fijo, los CTAs de compra directa de los 13 programas miden 35px de alto con fuente de 11.5px, la card "Best value" queda enterrada al final del stack, y la página más larga del funnel (15.458px en `/on`) no tiene sticky CTA mientras `/pricing` sí.

---

## Hallazgos

### F1 · P0 — El hero interior colisiona con el nav fijo (todas las páginas del funnel)

**Evidencia.** Medido en Pixel 7 con app-banner activo: en `/on` el `.hero-title` arranca en `top: 65px` y el nav termina en `bottom: 120px` → **55px de título quedan debajo del nav**. `overlap: true` también en `/studios/coral-gables`. Se ve a simple vista en `on-m0.png`: "THE FULL METHOD" pisa el logo 54D y el hamburger. En desktop el mismo defecto: `metrics.json` da `heroContentRect.top = 7.1px` en method/on/studios/studio-cg y `0px` en pricing/studio-hl, contra un nav de 64px. Es exactamente el "padding de los heros se siente mal" del cliente, cuantificado.

**Causa.** `.hero { min-height: 100svh; justify-content: flex-end; padding: 0 }` y `.hero-inner { min-height: 55svh }` (metrics: `heroPadding.padding = "0px"`, `min-height: 495px`). Cuando el contenido (título 3 líneas + sub + 2 CTAs apilados) mide más que el min-height, crece hacia arriba sin ninguna reserva para el nav fijo (64px) ni el smart app banner (56px, `--app-banner-h`).

**Fix (app.css).** El preflight de Tailwind ya pone `box-sizing: border-box`, así que el padding participa del min-height y no rompe los heros altos:

```css
/* Reserva para nav fijo + app banner: el contenido nunca sube debajo del chrome */
.hero {
  padding-top: calc(var(--app-banner-h, 0px) + 64px + 1.5rem);
}
/* El hero interior deja de quedarse corto cuando el contenido crece */
.hero-inner { min-height: min(62svh, 42rem); }
```

Bonus directo para el feedback #4 del cliente (video "cortado por debajo"): la transición del hero al scroll ya existe (`.hero-veil` termina en `rgba(7,7,7,0.88)` al 92%); subirla a `1` al 100% hace el corte invisible:

```css
.hero-veil {
  background: linear-gradient(180deg, rgba(7,7,7,0.5) 0%, rgba(7,7,7,0) 40%, rgba(7,7,7,0.92) 88%, var(--c-black) 100%);
}
```

---

### F2 · P0 — Los CTAs de compra directa miden 35×168px con fuente de 11.5px (13 filas de `/on`)

**Evidencia.** Medido: botón "Buy this program" = **168×35px, font-size 11.52px**. El mínimo iOS HIG / WCAG 2.5.8 es 44×44. Son los botones que disparan `startCheckout()` — el punto de conversión de pago único — y son los controles más pequeños de todo el sitio (los demás botones mobile miden 50–57px de alto según `metrics.json → mobile.buttons`).

**Causa.** `on.tsx:858-865`: estilo inline `padding: "0.5rem 1.1rem", fontSize: "0.72rem"` sobre `.btn-ghost`.

**Fix (on.tsx, línea ~861).**

```tsx
style={{
  padding: "0.8rem 1.5rem",
  fontSize: "0.8rem",
  minHeight: "44px",
  marginTop: "0.6rem",
}}
```

Y en mobile conviene que sea primario visual dentro de la fila (es el único CTA de la fila): considerar `className="btn btn-primary"` cuando `p.oneTime` existe, dejando ghost solo en desktop si se quiere sobriedad.

---

### F3 · P0 — El stack de pricing entierra la opción "featured"

**Evidencia.**
- `/on#membership`: 3 cards idénticas de **261px** cada una; la featured ("Best value", Yearly) va **tercera** en el DOM → en mobile aparece tras ~520px de scroll dentro del bloque, después de dos cards visualmente gemelas.
- `/pricing#plans`: cards de **428 / 449 / 451px** (gridH total 1.363px = ~3.5 pantallas de planes); la featured (Quarterly, "Most chosen") va segunda. La única diferenciación computada es el borde: `rgba(255,210,0,0.5)` vs `rgba(255,255,255,0.09)` — 1px de diferencia de color con el **mismo fondo** `rgba(255,255,255,0.04)`. En un stack donde nunca ves dos cards juntas, esa señal desaparece (`pricing-m0.png` muestra que tras el hero ni siquiera se llega a la primera card sin scroll).

**Causa.** `.pricing-grid { grid-template-columns: 1fr }` a ≤900px sin re-orden ni refuerzo visual (`app.css:790-798`). En `on.tsx` el orden del array `MEMBERSHIP_TIERS` pone `featured: true` al final (línea 84-88).

**Fix (app.css).** `pricing-grid` es grid, así que `order` funciona sin tocar el DOM:

```css
@media (max-width: 900px) {
  .pricing-grid .pricing-card.featured {
    order: -1;
    background: var(--glass-hover);
    box-shadow: 0 16px 48px rgba(255, 200, 0, 0.10);
  }
}
```

Esto además responde al feedback #3 del cliente (jugar con degradados): la featured puede llevar un bloom propio:

```css
.pricing-card.featured::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 55% at 50% -10%, rgba(255, 210, 0, 0.10), transparent 60%);
  border-radius: inherit;
}
```

Nota a11y: con `order` el orden visual difiere del orden de tabulación; si molesta, la alternativa es ordenar el array con featured primero solo en mobile (o siempre — también funciona en desktop, patrón "columna del medio destacada" no es obligatorio).

---

### F4 · P1 — Fila de programa a 390px: la columna de precio queda huérfana y la meta-línea es ilegible

**Evidencia.** Fila con precio medida: **457px de alto**. La columna de precio (`progPrice`, `marginLeft: auto`, `alignItems: flex-end`, `textAlign: right`) al envolver queda como línea propia **alineada a la derecha, a 204px del borde izquierdo**, desconectada del contenido — en `on-m1.png` se ve "SELF-PACED / Membership only" flotando a la derecha con medio viewport vacío a su izquierda. La meta-línea inline rompe a mitad de valor: "EQUIPMENT Your running / shoes · INTENSITY Intermediate and advanced / tracks · FOR ..." (mismo screenshot). La sección completa mide **5.175px** — 6+ pantallas — y así de floja es la señal por fila.

**Causa.** `on.tsx:379-486`: `progRow` es flex-wrap con `progHead` (min 13rem) + `progBody` (min 16rem) + `progPrice` (min 8.5rem, right-aligned) — a 372px de contenido todo envuelve, pero los estilos de alineación derecha se diseñaron para la fila horizontal de desktop.

**Fix.** Mover estos estilos inline a clases en `app.css` (son ~10 objetos `CSSProperties` que hoy no pueden tener media queries) y añadir:

```css
/* Fila de programa (migrar de estilos inline de on.tsx) */
.prog-row { display: flex; flex-wrap: wrap; gap: 0.7rem 2.8rem; padding: 1.8rem 0; border-top: 1px solid var(--hairline); }
.prog-price { flex: 0 0 auto; margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; min-width: 8.5rem; text-align: right; }

@media (max-width: 640px) {
  .prog-row { gap: 0.9rem 0; }
  /* El precio deja de ser columna derecha: pasa a barra horizontal pegada al contenido */
  .prog-price {
    margin-left: 0; width: 100%;
    flex-direction: row; align-items: center; justify-content: space-between;
    text-align: left; padding-top: 0.9rem; border-top: 1px dashed var(--hairline);
  }
  /* Meta: key-value apilado en vez de inline con puntos */
  .prog-meta { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 0.7rem; }
  .prog-meta .meta-dot { display: none; }
}
```

En el JSX (`on.tsx:833-846`) envolver cada par key/valor en un `<span>` para que el grid mobile funcione:

```tsx
<p style={progMeta} className="prog-meta">
  <span style={metaKey}>Equipment</span><span>{p.equipment}</span>
  <span style={metaKey}>Intensity</span><span>{p.intensity}</span>
  <span style={metaKey}>For</span><span>{p.audience}</span>
</p>
```

---

### F5 · P1 — `/on` mide 15.458px en mobile y no tiene sticky CTA; `/pricing` sí (y tarde)

**Evidencia.** `on.pageH = 15.458px` (~17 pantallas), con la membresía (el producto principal) en el primer tercio y luego 5.175px de programas. `/pricing` sí tiene sticky bar (`pricing.tsx:566-590`, visible en `pricing-m1/m2.png`, CTA de 50px) pero dispara al **50% de scroll** cuando los planes están en `gridTop = 855px` (~7% de la página) — durante casi toda la lectura de objeciones/FAQ no hay CTA visible hasta pasar la mitad. Además la barra no compensa: `body padding-bottom: 0px` → tapa los links legales del footer (~76px + safe-area).

**Fix.**
1. Extraer la sticky bar de `pricing.tsx` a un componente `StickyCta` compartido (`apps/web/app/components/`), con `href` y `label` por página.
2. Usarla en `/on` apuntando a `#membership` con label "Start free trial".
3. Bajar el umbral de 0.5 a ~0.25 (`pricing.tsx:220`: `window.scrollY / max >= 0.25`).
4. Compensar el solape: cuando la barra está visible, `document.body.style.paddingBottom = "84px"` (o un spacer en el layout).

---

### F6 · P1 — El chrome fijo consume 120px del viewport (16% de un Pixel 7)

**Evidencia.** App banner custom (56px, siempre visible, `app.css:166-173` `position: fixed`) + nav 64px = **120px permanentes** en todos los screenshots m*. En `/pricing` al 50% de scroll se suma la sticky bottom (~76px): **~196px, el 21% del viewport, es chrome** — en una página cuyo trabajo es mostrar 3 cards de precio.

**Fix (bajo riesgo).** Auto-ocultar el banner al scrollear hacia abajo, reaparecer al subir:

```css
.app-banner { transition: transform 260ms cubic-bezier(0.33,1,0.68,1); }
.app-banner.hidden { transform: translateY(-100%); }
```

con el mismo listener de scroll del nav (`scrolled`) invertido, y actualizando `--app-banner-h` a `0px` cuando se oculta para que el nav suba con él. Alternativa más simple: hacer el banner `position: static` (scrollea con la página, patrón del smart banner nativo de iOS).

---

### F7 · P2 — La tabla comparativa de `/on` scrollea horizontal sin affordance

**Evidencia.** `on.tsx:342-344`: `table { minWidth: "42rem" }` (672px) dentro de `tableWrap { overflowX: auto }` — a 390px scrollea horizontal, pero no hay ninguna señal (ni sombra, ni fade, ni hint). La columna accent queda fuera de pantalla.

**Fix.** Fade de borde + hint, o mejor: en ≤640px renderizar las mismas filas como lista apilada de dos valores. Fix mínimo (CSS sobre el wrapper, requiere clase):

```css
.table-wrap {
  -webkit-overflow-scrolling: touch;
  mask-image: linear-gradient(90deg, black 88%, transparent);
}
```

---

### F8 · OK — Lo que ya está bien (no tocar)

| Elemento | Medido | Umbral |
|---|---|---|
| Inputs lead form studios (`.field input`) | **16px** font, 56px alto | ≥16px (no dispara zoom iOS) ✓ |
| Form contacto (5 campos + select + textarea) | **16px** font, 51–152px | ✓ |
| Submit forms | 55px alto | ≥44px ✓ |
| FAQ `<details>` summary | **72px** de target, nativo | ✓ |
| Botones CTA generales mobile | 50–57px (`metrics.json → mobile.buttons`) | ✓ |
| Overflow horizontal | `viewportOverflowX: false` en las 9 páginas | ✓ |
| `type="tel"` + `autocomplete="tel|name"` en leads | presente | ✓ |

Mejora menor de forms: añadir `enterKeyHint="send"` al último campo y `inputMode="tel"` explícito (hoy lo infiere del type). El mini-form de studios está al **80% de la página** (formTop 7.946 de 9.876px) — correcto solo si los CTAs "Reserve your spot" del hero anclan a él; verificar el anchor.

---

## Orden de implementación sugerido

| # | Fix | Esfuerzo | Impacto conversión |
|---|---|---|---|
| 1 | F1 padding-top del hero + veil al 100% | 15 min (CSS) | Alto — primera impresión en todo el sitio |
| 2 | F2 tap targets de "Buy this program" | 10 min (inline) | Alto — CTA de pago directo |
| 3 | F3 featured first + refuerzo visual | 20 min (CSS) | Alto — jerarquía de planes |
| 4 | F5 StickyCta compartido + threshold 25% + padding compensatorio | 45 min (JSX) | Medio-alto |
| 5 | F4 fila de programa responsive (migrar inline → clases) | 1.5 h (JSX+CSS) | Medio |
| 6 | F6 app banner auto-hide | 30 min | Medio |
| 7 | F7 affordance de tabla | 15 min | Bajo |
