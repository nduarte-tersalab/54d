# 54D — Dirección de Arte v2 "Glow" (multi-página)

Guía para construir cualquier página interior sin romper el sistema. Fuente de verdad de estilos: `apps/web/app/app.css`. Antes de inventar algo, busca ahí.

## 1. Principios (5 máximas)

1. **El amarillo es LUZ, no pintura.** #FFD200 aparece como bloom radial, gradiente (`--grad-sun`, `--grad-text`), glow o texto clipeado. Nunca como fondo plano de sección. Única excepción: el panel `.split-on` (54D ON).
2. **Una sola lona.** Todo el sitio vive sobre `#070707` continuo (`--c-black` en `body`). Las secciones no cambian el fondo: se diferencian con blooms (`.bloom`, `.bloom-right`), hairlines degradados y paneles glass flotantes.
3. **Vidrio sobre negro.** Las superficies elevadas son `--glass` + `border: 1px solid var(--hairline)` + `backdrop-filter: blur(...)`, radios `--r-lg`/`--r-md`, hover que sube (`translateY(-6px)`) y enciende el borde a `rgba(255,210,0,0.25–0.3)`.
4. **Tipografía como identidad.** Display: `--font-display` (Archivo placeholder → Allumi Std Ext), peso 800, uppercase, line-height ≤1. Body: `--font-body`. El acento se hace con `<span className="accent">` (gradiente clipeado), jamás con color plano amarillo en titulares.
5. **Movimiento con propósito.** Todo usa `--transition` (220ms). Entradas con `.reveal`/`useReveal()` (copiar hook de `home.tsx`). Respetar `prefers-reduced-motion` (ya cubierto en app.css). Nada de parallax ni animaciones decorativas nuevas.

**Copy:** español neutro LATAM (tú: "conoce", "tienes"). El voseo existente ("conocé", "tenés") es un bug de copy — corregir al tocar cada página. NYC no existe: nunca mencionarla. Precios placeholder ($54/mes, $156/trim, $588/año) siempre con comentario `{/* PRECIO_PENDIENTE */}` en JSX.

## 2. Template de página interior

Toda página interior sigue: **hero interior → 2–4 secciones de contenido → cierre CTA → footer**. El nav y footer son idénticos a home.

```jsx
{/* Hero interior: ~55vh, más bajo que home (100svh). Sin ticker, sin video. */}
<header className="hero hero-inner">
  <div className="hero-media"><div className="hero-poster" /></div>
  <div className="hero-veil" />
  <div className="hero-content">
    <nav className="breadcrumb"><a href="/">Inicio</a><span>/</span><span>Precios</span></nav>
    <span className="day-marker">54D ON</span>
    <h1 className="hero-title">Elige tu <span className="accent">plan.</span></h1>
    <p className="hero-sub">Prueba 7 días gratis. Cancela cuando quieras.</p>
  </div>
</header>
```

Ritmo de secciones: alternar `.section .bloom` y `.section .bloom-right` para que la luz cambie de lado. Cada sección abre con `day-marker` + `section-title` (con un `.accent` por título, no más). Máximo un panel "pesado" (grid de cards, tabla) por sección. Cierre SIEMPRE con `.final-wrap` (título corto + `.btn-primary` que llama `startCheckout(priceId)` de `app/lib/attribution.ts` si es CTA de suscripción, o link a Mindbody/agenda si es Studios).

## 3. Inventario de clases existentes (app.css)

| Clase | Uso | Ejemplo |
|---|---|---|
| `.nav` / `.nav.scrolled` | Nav pill flotante glass. Copiar componente `Nav` de home.tsx | — |
| `.btn .btn-primary` | CTA principal (gradiente sol, texto negro) | `<a className="btn btn-primary">Empieza gratis</a>` |
| `.btn .btn-ghost` | CTA secundario glass | `<a className="btn btn-ghost">Ver studios</a>` |
| `.btn-on` | CTA negro sobre panel amarillo (solo dentro de `.split-on`) | — |
| `.section` + `.section-inner` | Contenedor de sección, padding y max-width | `<section className="section bloom"><div className="section-inner">…` |
| `.bloom` / `.bloom-right` | Luz radial de fondo por sección | modificador de `.section` |
| `.day-marker` | Eyebrow/pill amarilla que abre cada sección | `<span className="day-marker">El método</span>` |
| `.section-title` + `.accent` | H2 display; `.accent` = gradiente clipeado | `<h2 className="section-title">Tres países. <span className="accent">Cinco studios.</span></h2>` |
| `.method-grid` / `.method-card` | Grid 4→2→1 de glass cards (num + name + desc). Reusable para beneficios, features, staff | ver home.tsx |
| `.split` / `.split-panel` / `.split-on` / `.split-studios` | Par de paneles ON/Studios | ver home.tsx |
| `.studios-list` / `.studio-row` | Index tipográfico con hairlines y hover-glow | `<a className="studio-row"><span className="studio-city">Bogotá</span>…` |
| `.final-wrap` / `.final-title` | Bloque de cierre CTA | `<div className="final-wrap"><h2 className="final-title">El día 1 <span className="accent">es hoy.</span></h2>…` |
| `.ticker` | Marquee esfumado. SOLO en home | — |
| `.hero-kicker`, `.hero-sub`, `.hero-ctas` | Piezas del hero, válidas también en hero interior | ver §2 |
| `.reveal` (+ hook `useReveal`) | Entrada on-scroll | `<div ref={x.ref} className={x.className}>` |
| `.metric-card` | Solo admin; en páginas públicas usar `.stat-row` (§4) | — |

## 4. Componentes NUEVOS (CSS a agregar en app.css)

```css
/* ---------- Interiores: hero bajo + breadcrumb ---------- */
.hero-inner { min-height: 55svh; }
.hero-inner .hero-content { margin-bottom: clamp(2.5rem, 6vh, 4.5rem); }
.breadcrumb { display: flex; gap: 0.6rem; align-items: center; font-size: 0.78rem;
  text-transform: uppercase; letter-spacing: 0.14em; color: var(--c-faint); margin-bottom: 1.4rem; }
.breadcrumb a { color: var(--c-faint); text-decoration: none; transition: color var(--transition); }
.breadcrumb a:hover { color: var(--c-yellow); }
.breadcrumb span:last-child { color: var(--c-mist); }

/* ---------- Pricing cards (página /precios) ---------- */
.pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; margin-top: 3rem; }
@media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; } }
.pricing-card { position: relative; display: flex; flex-direction: column; gap: 0.4rem;
  padding: 2.2rem 1.9rem; border-radius: var(--r-lg); background: var(--glass);
  border: 1px solid var(--hairline); backdrop-filter: blur(10px);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition); }
.pricing-card:hover { transform: translateY(-6px); border-color: rgba(255, 210, 0, 0.3); }
.pricing-card.featured { border-color: rgba(255, 210, 0, 0.45);
  background: linear-gradient(180deg, rgba(255, 210, 0, 0.08), rgba(255, 255, 255, 0.03));
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5), 0 0 50px rgba(255, 200, 0, 0.08); }
.pricing-plan { font-family: var(--font-display); font-weight: 700; font-size: 0.82rem;
  text-transform: uppercase; letter-spacing: 0.2em; color: var(--c-mist); }
.pricing-price { font-family: var(--font-display); font-weight: 800; font-size: 3.2rem; line-height: 1;
  background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pricing-period { font-size: 0.9rem; color: var(--c-faint); }
.pricing-features { margin: 1.4rem 0 1.8rem; display: grid; gap: 0.55rem;
  font-size: 0.95rem; line-height: 1.5; color: var(--c-mist); }
.pricing-features li { list-style: none; padding-left: 1.3rem; position: relative; }
.pricing-features li::before { content: '●'; position: absolute; left: 0; font-size: 0.5rem; top: 0.4em;
  background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pricing-card .btn { margin-top: auto; text-align: center; }

/* ---------- FAQ (details nativo, glass) ---------- */
.faq-list { max-width: 46rem; margin-top: 3rem; display: grid; gap: 0.8rem; }
.faq-item { border-radius: var(--r-md); background: var(--glass); border: 1px solid var(--hairline);
  overflow: hidden; transition: border-color var(--transition), background var(--transition); }
.faq-item[open] { background: var(--glass-hover); border-color: rgba(255, 210, 0, 0.25); }
.faq-item summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between;
  align-items: center; gap: 1rem; padding: 1.2rem 1.5rem; font-family: var(--font-display);
  font-weight: 700; font-size: 1rem; text-transform: uppercase; color: var(--c-white); }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.4rem; color: var(--c-yellow); transition: transform var(--transition); }
.faq-item[open] summary::after { transform: rotate(45deg); }
.faq-item p { padding: 0 1.5rem 1.4rem; font-size: 0.98rem; line-height: 1.6; color: var(--c-mist); }

/* ---------- Timeline 54 días (página método) ---------- */
.timeline { position: relative; margin-top: 3.5rem; display: grid; gap: 2.2rem; padding-left: 2rem; }
.timeline::before { content: ''; position: absolute; left: 5px; top: 6px; bottom: 6px; width: 1px;
  background: linear-gradient(180deg, var(--c-yellow), rgba(255, 210, 0, 0.05)); }
.timeline-item { position: relative; }
.timeline-item::before { content: ''; position: absolute; left: -2rem; top: 6px; width: 11px; height: 11px;
  border-radius: 50%; background: var(--grad-sun); box-shadow: 0 0 14px rgba(255, 210, 0, 0.7); }
.timeline-day { font-family: var(--font-display); font-weight: 800; font-size: 0.8rem;
  letter-spacing: 0.24em; text-transform: uppercase; color: var(--c-yellow); }
.timeline-item h3 { font-family: var(--font-display); font-weight: 800; font-size: 1.35rem;
  text-transform: uppercase; margin-top: 0.3rem; color: var(--c-white); }
.timeline-item p { margin-top: 0.5rem; max-width: 38rem; font-size: 0.98rem; line-height: 1.6; color: var(--c-mist); }

/* ---------- Stat row (cifras públicas) ---------- */
.stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.1rem; margin-top: 3rem; }
.stat { padding: 1.6rem 1.4rem; border-radius: var(--r-md); background: var(--glass); border: 1px solid var(--hairline); }
.stat-value { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.2rem, 4vw, 3.4rem); line-height: 1;
  background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
.stat-label { margin-top: 0.5rem; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--c-faint); }

/* ---------- Form fields glass (contacto / leads Studios) ---------- */
.field { display: grid; gap: 0.45rem; margin-bottom: 1.2rem; }
.field label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--c-mist); }
.field input, .field select, .field textarea { width: 100%; padding: 0.95rem 1.2rem; font-family: var(--font-body);
  font-size: 1rem; color: var(--c-white); background: var(--glass); border: 1px solid var(--hairline);
  border-radius: var(--r-md); outline: none; transition: border-color var(--transition), background var(--transition), box-shadow var(--transition); }
.field input::placeholder, .field textarea::placeholder { color: var(--c-faint); }
.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(255, 210, 0, 0.5);
  background: var(--glass-hover); box-shadow: 0 0 24px rgba(255, 210, 0, 0.08); }
.field .error { font-size: 0.82rem; color: var(--c-red); }
```

Uso: pricing → `<div className="pricing-card featured">` con botón `.btn-primary` que llama `startCheckout(priceId)`; FAQ → `<details className="faq-item"><summary>…</summary><p>…</p></details>`; timeline → items D01/D07/D21/D54.

## 5. Reglas duras (NUNCA)

- **Nunca** bloques de fondo blanco o gris claro. No existe "sección clara". La lona es una.
- **Nunca** amarillo plano como fondo. Solo `--grad-sun`, y solo en `.btn-primary`, `.split-on`, hovers de `.studio-cta` y el dot del timeline.
- **Nunca** radios < 20px en superficies (excepción heredada: links del admin-side a 12px). Nada de esquinas duras ni `border-radius: 0`.
- **Nunca** tipografías fuera de `--font-display` / `--font-body`, ni pesos display < 700. No hardcodear "Archivo": cuando llegue Allumi el swap es en las variables.
- **Nunca** colores hex nuevos en componentes: usar variables (`--c-*`, `--glass`, `--hairline`, gradientes). Sombras amarillas siempre en rgba(255, 2xx, 0, ≤0.35).
- **Nunca** mencionar NYC; nunca voseo; nunca precio sin `PRECIO_PENDIENTE`; nunca CTA de suscripción que no pase por `startCheckout()` (rompe la atribución de Meta).
- **Nunca** nuevas dependencias ni librerías de animación. React Router v7 + CSS del sistema, nada más.
