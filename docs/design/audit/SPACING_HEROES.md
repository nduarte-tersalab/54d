# Auditoría de espaciados — Heros (26/07/2026)

Evidencia: `scratchpad/audit-v5/` (screenshots `{página}-d0..d3.png` desktop 1440×900, `{página}-m0..m2.png` Pixel 7) + `metrics.json` (valores computados).
CSS auditado: `apps/web/app/app.css` (líneas 240–332 `.hero*`, 780–787 `.hero-inner`/breadcrumb).

## Reglas actuales (las que producen el problema)

| Regla | Valor | Efecto a 1440×900 |
|---|---|---|
| `.hero` | `min-height:100svh; justify-content:flex-end;` **sin padding-top** | nada reserva los 64px del nav fijo |
| `.hero-inner` | `min-height:55svh` | 495px de hero interior |
| `.hero-content` (home) | `margin: 0 auto 4vh` | 36px de margen inferior |
| `.hero-inner .hero-content` | `margin-bottom: clamp(2.5rem,6vh,4.5rem)` | 54px (regla distinta a home) |
| `.section` | `padding: 144px 56px` | 144px de padding-top tras cada hero |
| `.hero-veil` | termina en `rgba(7,7,7,0.88)` al 92% | el video queda ~12% visible en el borde inferior → corte duro |

**Diagnóstico raíz: el hero interior es una caja rígida de 495px, anclada al fondo (`flex-end`), sin padding-top. El slot útil es 495 − 54 = 441px. El contenido real de casi todas las páginas mide 434–503px, así que el texto sube hasta chocar (o meterse debajo) del nav fijo de 64px. Eso es lo que el cliente siente como "el padding está mal en todos".**

---

## Por página

### 1. `/pricing` — CRÍTICO
- `heroContentRect.top = 0` (metrics.json): el contenido mide 502.7px > 441px de slot; el hero se estira a 557px y el contenido toca el borde superior del viewport.
- **El eyebrow "54D ON · 7-DAY FREE TRIAL" queda dentro de la barra del nav, pegado al logo** (`pricing-d0.png`, arriba-izquierda; en `pricing-m0.png` queda montado DEBAJO del logo 54D).
- Propuesta: top del contenido ≥ **96px** (64 nav + 32 aire). Con el sistema de abajo sale solo.

### 2. `/studios/hallandale` (studio-hl) — CRÍTICO
- `top = 0`, contenido 462.4px, hero estirado a 516px. Eyebrow "54D STUDIOS · UNITED STATES" dentro del nav (`studio-hl-d0.png`).
- Mismo fix: clearance mínimo 96px.

### 3. `/method`, `/on`, `/studios`, `/studios/coral-gables` (studio-cg) — GRAVE (idénticos)
- `top = 7.1px`: el eyebrow arranca a 7px del viewport, es decir **57px por debajo del inicio del nav → tapado por el nav fijo** (`method-d0.png`: "THE METHOD" se lee dentro de la barra). Contenido 434px en slot de 441px: 7px de aire arriba vs 54 abajo.
- Propuesta: mismos 96px de clearance; el hero interior debe crecer (ver sistema).

### 4. `/` (home) — el corte del video
- Hero 900px (100svh), contenido top 268 / bottom 748.8: proporción correcta. El problema es la salida:
  - `.hero-veil` termina en `rgba(7,7,7,0.88)` al 92% → en el borde inferior del hero el video sigue viéndose (~12% + opacity 0.5 del video) y la sección siguiente es `#070707` sólido → **línea de corte visible** (`home-d0.png`, borde con el ticker; el cliente: "se corta por debajo").
  - Propuesta: capa de fade dedicada al fondo del hero: `linear-gradient(180deg, transparent 0%, rgba(7,7,7,0.6) 55%, #070707 96%)` en el último 28% de altura, bajo el ticker. El ticker (y ~845–900) queda apoyado sobre negro pleno y la transición al scroll es continua.
- Redundancia de espaciadores: `margin-bottom: 36px` del `.hero-content` + `<div style="height:6vh"/>` (54px, `home.tsx:177`) + ticker. Dos mecanismos para el mismo aire; dejar uno (margen) y eliminar el div.
- Inconsistencia: home usa `4vh` (36px) de margen inferior y los interiores `clamp(...6vh...)` (54px). Unificar.

### 5. `/blog` — menor
- `top = 102.3px`: no choca con el nav (38px de holgura) pero es la única página con esa cifra: 0 / 7 / 102 / 202 / 268 según página → **no hay ritmo común de aire superior**.

### 6. `/contact` — hero vacío + seam
- Contenido de solo 239px (top 201.7 → bottom 441) en un hero de 495: 41% del hero es aire muerto arriba y aún así el hero ocupa 55svh.
- En `contact-d0.png` se ve un **seam horizontal a ~y493**: el bloom del hero termina y la sección siguiente (`section bloom`, padding `144px 56px 40px`) trae otro fondo → borde visible. Mismo fix de fade que home, aplicado a `.hero-inner` genérico.

### 7. Doble espacio hero → primera sección (todas las interiores)
- Texto del hero termina en y=441, margen inferior 54px, fin del hero 495, y la primera sección mete `padding-top:144px` → **el siguiente heading aparece a ~y655: 214px de vacío** (`method-d0.png`, `studio-hl-d0.png`, `contact-d0.png`). En un hero de 495px, un gap de 214 es desproporcionado (43% de la altura del hero).
- Propuesta: la sección inmediata al hero usa padding-top reducido: **96px** (gap total texto→heading ≈ 150px).

### 8. Mobile (Pixel 7)
- `hero-content` con `0 20px` de padding lateral: correcto.
- La colisión nav/eyebrow es peor: con el smart-app-banner (~110px) + nav, en `pricing-m0.png` el eyebrow queda solapado con el logo.
- Alturas de botón inconsistentes en el flujo: 50 / 55 / 57px según página (metrics.json `mobile.buttons`). Unificar a una sola altura (55px) — nota lateral, no de hero.

---

## PROPUESTA DE SISTEMA — variables unificadas de hero

Añadir a `:root` de `app.css` y reescribir `.hero`/`.hero-inner` contra estas variables. Ninguna página vuelve a declarar espaciados de hero por su cuenta.

```css
:root {
  --nav-h: 64px;
  /* aire superior garantizado: nav + respiro. Nunca menos. */
  --hero-pad-top: calc(var(--nav-h) + clamp(2rem, 5vh, 3rem));      /* 96–112px */
  /* aire inferior único para TODOS los heros (hoy: 36 en home, 54 interiores) */
  --hero-pad-bottom: clamp(2.5rem, 6vh, 4rem);                       /* 40–64px */
  /* alturas mínimas del lienzo */
  --hero-min: 100svh;        /* home */
  --hero-min-inner: 62svh;   /* interiores: 55svh (495px) se queda corto para contenido de 434–503px */
  /* padding-top de la sección que sigue a un hero (en vez de los 144px genéricos) */
  --section-pad-after-hero: clamp(4.5rem, 11vh, 6.5rem);             /* ~96px */
  /* altura del fade de salida del media del hero */
  --hero-fade-h: 28%;
}

.hero {
  min-height: var(--hero-min);
  padding-top: var(--hero-pad-top);       /* ← la clave: el contenido ya no puede subir bajo el nav */
}
.hero-inner { min-height: var(--hero-min-inner); }
.hero-content,
.hero-inner .hero-content { margin: 0 auto var(--hero-pad-bottom); } /* una sola regla */

/* Fade de transición con el scroll (pedido explícito del cliente) */
.hero::after {
  content: '';
  position: absolute; left: 0; right: 0; bottom: 0;
  height: var(--hero-fade-h);
  z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(7,7,7,0.6) 55%, var(--c-black) 96%);
}

/* La primera sección tras el hero no duplica aire */
.hero + .section, .hero + section { padding-top: var(--section-pad-after-hero); }
```

Cambios acompañantes:
- `home.tsx:177`: eliminar el `<div style={{height:'6vh'}}/>`; el aire lo da `--hero-pad-bottom`.
- El ticker queda como último hijo del header, apoyado sobre el fade (z-index del ticker ya es 2 > fade 1).
- `/contact` y `/blog` (contenido corto): pueden usar `--hero-min-inner: 50svh` vía modificador `.hero-compact` si 62svh se siente vacío — pero siempre con el mismo `--hero-pad-top`/`--hero-pad-bottom`.
- Verificar tras el cambio que `heroContentRect.top ≥ 96` en las 9 páginas y que ninguna vuelva a estirar el hero por overflow de contenido.

---

## TOP-5 (resumen ejecutivo)

1. **pricing y studio-hl: contenido del hero a top=0, eyebrow dentro del nav** (contenido 502.7/462.4px > slot 441px). Fix: `padding-top: calc(64px + 2rem)` en `.hero` → clearance ≥96px.
2. **method/on/studios/studio-cg: contenido a top=7px, tapado por el nav de 64px.** Mismo fix + `--hero-min-inner: 62svh` (495px actuales no dan para contenido de 434px + aire).
3. **Video de home corta duro abajo**: `.hero-veil` acaba en opacidad 0.88 al 92% y la sección siguiente es #070707 sólido. Fix: `.hero::after` con fade a negro pleno en el último 28% (y mismo fade elimina el seam de contact a y≈493).
4. **214px de vacío entre texto de hero y primer heading en todas las interiores** (54 margen + 144 padding sección). Fix: `--section-pad-after-hero ≈ 96px` → gap ~150px.
5. **Sin ritmo común**: margen inferior 36px (home) vs 54px (interiores), aire superior 0/7/102/202/268px según página, y espaciador redundante de 6vh en home. Fix: las variables `--hero-pad-top`/`--hero-pad-bottom` únicas del sistema.
