# ATMOSPHERE SPEC — Gradientes y micro-motion (sistema Glow)

Fecha: 2026-07-26 · Autor: pase de atmósfera (feedback cliente 26/07, puntos 3 y 4)
Fuente de verdad: `apps/web/app/app.css` · Evidencia: `audit-v5/` (screenshots + metrics.json)

Blacklist vigente (se respeta en todo este documento): sin blur/glass nuevo, sin pills,
sin gradient-text adicional. Todas las opacidades de campos de fondo ≤ 0.08.

---

## 0. Diagnóstico con números

- **El corte del video es real y medible.** `metrics.json` home: `heroRect.h = 900`,
  `heroContent.bottom = 748.8`. Quedan **151 px** de video entre el último CTA y el borde
  del hero. El `.hero-veil` actual (app.css:285) termina en `rgba(7,7,7,0.88) 92%` — **nunca
  llega a opacidad 1**, así que el último píxel del hero muestra video al 12% sobre negro y
  el `<section id="metodo">` (padding `144px 56px`, fondo `#070707` plano) arranca con un
  borde horizontal visible. Se ve en `home-d0.png` (banda inferior, y≈830–900) y el mismo
  defecto en la foto de `home-d1.png` (y≈545, corte de la photo-band contra los split panels).
- **Heros interiores:** `heroRect.h = 495` en method/on/studios/studio-cg/blog/contact
  (516 en studio-hl, 557 en pricing). Mismo veil, mismo corte, menos altura para disimularlo.
- **Hover genérico:** hoy `.method-card`, `.pricing-card` y `.split-panel` hacen todos
  `translateY(-6px)` (app.css:461, 796, 528). Tres familias distintas, un solo gesto = se
  siente plantilla.
- **Blooms actuales:** `.bloom::before` 0.07 / `.bloom-right::before` 0.06 (app.css:377–386).
  Opacidad correcta, pero el fade a `transparent 60%` es corto y en pantallas OLED deja un
  halo con borde perceptible.

---

## 1. HERO VIDEO FADE — el video se funde, nunca se corta

**Decisión:** el `.hero-veil` existente se queda como capa de legibilidad (scrim superior
0.5 + rampa inferior). Se **agrega una capa nueva** `::after` dentro del mismo elemento —
no se toca el DOM — dedicada exclusivamente a la fusión con la lona: un scrim *eased*
(stops en curva, no lineales: un gradiente de 2 stops produce banding visible sobre video
oscuro) que **sí termina en `#070707` sólido**.

Altura: **32%** del hero en home (≈288 px de los 900) y **24%** en `.hero-inner`
(≈119 px de los 495). El contenido del hero vive por encima (`.hero-content` es `z-index: 2`),
así que la capa nunca tapa CTAs.

```css
/* ── PEGAR: reemplaza el bloque .hero-veil (app.css:285-289) ───────────── */
.hero-veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* Scrim de legibilidad: igual que antes arriba, pero la rampa inferior
     baja a 0.72 — la fusión real la hace ::after, no esta capa. */
  background: linear-gradient(180deg,
    rgba(7,7,7,0.5) 0%,
    rgba(7,7,7,0)   40%,
    rgba(7,7,7,0.72) 92%);
}
.hero-veil::after {
  /* Fusión video → lona. Stops en curva ease-in (y = x^2 aprox) para que el
     ojo no encuentre ni el inicio del gradiente ni el final del video. */
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;   /* -1px: mata la línea de subpixel en zoom/retina */
  height: 32%;
  pointer-events: none;
  background: linear-gradient(180deg,
    rgba(7,7,7,0)    0%,
    rgba(7,7,7,0.045) 12%,
    rgba(7,7,7,0.16)  28%,
    rgba(7,7,7,0.36)  46%,
    rgba(7,7,7,0.62)  64%,
    rgba(7,7,7,0.85)  80%,
    rgba(7,7,7,0.97)  92%,
    #070707          100%);
}

/* Interiores con foto: fade más corto, la misma curva.
   (495px de hero → ~119px de fade; suficiente porque la foto va a opacity .5) */
.hero-inner .hero-veil::after { height: 24%; }
```

**Criterio de aceptación:** screenshot del fold en 1440×900 → en la fila de píxeles
y=899 el sample debe ser exactamente `#070707`; entre y=610 y y=900 no debe existir
ningún gradiente con salto >4 niveles RGB entre filas adyacentes (anti-banding).

Aplica igual a `.photo-band` (el corte de `home-d1.png`): añadir la misma rampa al
`::after` existente (app.css:868) **sin** tocar su gradiente horizontal:

```css
/* ── PEGAR: reemplaza .photo-band::after (app.css:868-869) ─────────────── */
.photo-band::after {
  content: ''; position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(7,7,7,0) 78%, rgba(7,7,7,0.55) 92%, #070707 100%),
    linear-gradient(0deg,   rgba(7,7,7,0) 78%, rgba(7,7,7,0.55) 92%, #070707 100%),
    linear-gradient(90deg, rgba(7,7,7,0.82) 0%, rgba(7,7,7,0.35) 55%, rgba(7,7,7,0.1) 100%);
}
```

---

## 2. CAMPOS DE GRADIENTE DE FONDO — tres, reutilizables, máx. 1 por página

Regla dura: **un campo por página** (el hero no cuenta, es media). Opacidad pico ≤ 0.08.
Feather largo (`transparent 72%`) para que el halo no tenga borde — es lo que delata "AI glow".

```css
/* ── PEGAR: reemplaza .bloom::before y .bloom-right::before (app.css:377-386) ── */
/* Campo A — "dawn": luz alta y lateral. Para secciones de apertura/contenido. */
.bloom::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 75% 55% at 18% 4%,
    rgba(255, 210, 0, 0.06), rgba(255, 210, 0, 0.02) 45%, transparent 72%);
}
.bloom-right::before {
  background: radial-gradient(ellipse 70% 58% at 86% 12%,
    rgba(255, 184, 0, 0.05), rgba(255, 184, 0, 0.018) 45%, transparent 72%);
}

/* ── PEGAR: nuevo, debajo de .bloom-right ──────────────────────────────── */
/* Campo B — "ember": brasa baja y cálida. SOLO para la sección previa al CTA
   final (prepara el ojo para el amarillo del final-wrap sin competir con él). */
.bloom-ember::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 90% 55% at 50% 108%,
    rgba(255, 168, 0, 0.055), rgba(255, 168, 0, 0.02) 40%, transparent 70%);
}

/* Campo C — "seam": costura de temperatura vertical. NO es un halo: es la
   transición térmica entre el hero (cálido por el video/foto) y la lona.
   Negro que pasa por un negro-ámbar imperceptible y vuelve. Se aplica a la
   PRIMERA sección tras el hero, y solo ahí. */
.seam-warm {
  background: linear-gradient(180deg,
    #070707 0%,
    #0B0A07 38%,     /* negro +2 puntos de temperatura, no se lee como color */
    #080807 70%,
    #070707 100%);
}
```

**Asignación (máx. 1 campo/página):**

| Página | Campo | Dónde | Por qué |
|---|---|---|---|
| home | `seam-warm` | `#metodo` (primera sección, `padding 144px 56px`) | Recibe el fade del video: la costura hace que el negro post-hero no sea plano de golpe. |
| method | `.bloom` | Ya está en la 1ª sección (`section bloom`, metrics.json) — se queda, recalibrado | Página editorial, luz alta de lectura. |
| on | `.bloom-ember` | Última sección (`section`, `0px 56px 144px`) antes del CTA | Es la página de venta digital: brasa antes del cierre. |
| pricing | `.bloom` | `#plans` | La luz cae sobre las cards, no sobre texto. |
| studios | `.bloom-right` | `#sedes` | Contrapeso: el listado alinea a la izquierda. |
| studio-cg / studio-hl | `.bloom-ember` | Última sección pre-CTA | Mismo patrón que /on. |
| blog | **quitar dos** — hoy tiene 3 blooms (metrics.json: secciones 1, 2 y 3) | Dejar solo el de la 1ª sección | 3 halos en una página = papel tapiz. |
| contact | `.bloom` (ya está) | 1ª sección | Sin cambios. |

---

## 3. MICRO-HOVER — cada familia tiene su gesto, nadie comparte coreografía

Problema actual: `translateY(-6px)` en method-card + pricing-card + split-panel.
Regla nueva: **el lift vertical queda reservado a los botones** (`-2px`, ya existente).
Las cards no saltan: se *encienden*. Cada familia, un gesto propio.

Token nuevo (pegar junto a `--transition`, app.css:74):

```css
  --transition-slow: 600ms cubic-bezier(0.16, 1, 0.3, 1); /* imágenes y luz */
```

### 3.1 `.method-card` — la luz interior se enciende, el borde superior se dibuja

```css
/* ── PEGAR: reemplaza .method-card:hover (app.css:460-466 aprox) ───────── */
.method-card { transition: background var(--transition), border-color var(--transition), box-shadow var(--transition); }
.method-card:hover {
  /* sin translateY: la card no se mueve, se enciende */
  background: var(--glass-hover);
  border-color: var(--line-accent);
  box-shadow: 0 0 44px rgba(255, 200, 0, 0.07);
}
.method-card:hover::before { opacity: 1; } /* la luz interior existente se queda */
/* El numeral 01–04 recupera color con la luz */
.method-card:hover .method-num { color: var(--c-yellow); opacity: 1; }
.method-num { transition: color var(--transition), opacity var(--transition); }
```

### 3.2 `.pricing-card` — ignición de borde + regla inferior que se dibuja

```css
/* ── PEGAR: reemplaza .pricing-card:hover (app.css:796) y añade ::after ── */
.pricing-card:hover { border-color: var(--line-accent-strong); } /* sin translateY */
.pricing-card::after {
  content: '';
  position: absolute;
  left: 1.9rem; right: 1.9rem; bottom: 0;
  height: 2px;
  background: var(--grad-sun);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-slow);
}
.pricing-card:hover::after { transform: scaleX(1); }
.pricing-card:hover .pricing-price { filter: brightness(1.08); }
.pricing-price { transition: filter var(--transition); }
```

### 3.3 `.studio-row` — se queda su `translateX(6px)` (es su firma) + flecha que llega

El fill amarillo del `.studio-cta` ya existe y funciona. Se añade solo la flecha:

```css
/* ── PEGAR: debajo de .studio-cta (app.css:~619) ───────────────────────── */
.studio-cta::after {
  content: '→';
  display: inline-block;
  margin-left: 0.5rem;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--transition), transform var(--transition);
}
.studio-row:hover .studio-cta::after { opacity: 1; transform: translateX(0); }
```

### 3.4 `.photo-card` — zoom lento 1.02 + caption que despierta

```css
/* ── PEGAR: reemplaza .photo-card img / :hover (app.css:877-879) ───────── */
.photo-card img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  filter: saturate(0.82) contrast(1.05);
  transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1), filter 900ms cubic-bezier(0.16, 1, 0.3, 1);
}
.photo-card:hover img { transform: scale(1.02); filter: saturate(0.95) contrast(1.05); }
/* La regla amarilla de la caption crece: 18px → 32px */
.photo-caption::before { transition: width var(--transition-slow); }
.photo-card:hover + .photo-caption::before,
figure:hover .photo-caption::before { width: 32px; }
.photo-caption { transition: color var(--transition); }
figure:hover .photo-caption { color: var(--c-mist); }
```

### 3.5 `.store-badge` y `.day-marker` — encendido de línea, sin movimiento

```css
/* ── PEGAR: complementa a.store-badge:hover (app.css:923) ──────────────── */
a.store-badge { transition: border-color var(--transition), color var(--transition), background var(--transition); }
a.store-badge:hover { background: var(--glass); } /* además del borde amarillo existente */
```

### 3.6 Botones — el primario ya tiene su lift; el ghost gana temperatura

```css
/* ── PEGAR: complementa .btn-ghost:hover (app.css:233-237) ─────────────── */
.btn-ghost:hover {
  border-color: var(--line-accent-strong);
  color: var(--c-yellow) !important;
  background: rgba(255, 210, 0, 0.05);  /* ≤0.08: es luz, no fill */
  box-shadow: none;
}
```

### 3.7 `.split-panel` — pierde el translateY, conserva su sombra viva

```css
/* ── PEGAR: reemplaza .split-panel:hover (app.css:528) ─────────────────── */
.split-panel:hover { transform: none; }
/* .split-on:hover ya intensifica su sombra ámbar (app.css:~536): suficiente. */
```

### Accesibilidad de movimiento (obligatorio con lo anterior)

```css
@media (prefers-reduced-motion: reduce) {
  .photo-card img, .pricing-card::after, .studio-cta::after,
  .hero-poster::after { transition: none; animation: none; }
}
```

---

## Orden de implementación

1. §1 hero fade (home + hero-inner + photo-band) — es el punto explícito del cliente.
2. §3.1–3.7 hovers (borrar los tres `translateY(-6px)` de cards).
3. §2 campos: recalibrar blooms, añadir `bloom-ember`/`seam-warm`, podar blog a 1 bloom.
4. Verificar criterio de aceptación de §1 con screenshot 1440×900 y sample de píxeles.
