# DESIGN FIXES V4 — Síntesis del director (4 audits + evidencia visual)

**Dirección decidida: "duro y editorial".** De los dos dialectos que conviven (sharp 2px/hairline/distressed vs pills/glass 28px/glow), gana el primero: es el que pertenece al logo distressed, al boxeo y al tono militar del programa. Muere `--r-pill` en UI. (SYSTEM §3 + UX §1 contra el statu quo; TYPO proponía pill para badges — desestimado, 2 críticos vs 1 y coherencia con el logo.)

---

## 1. TOKENS (`apps/web/app/app.css` `:root`)

```css
/* Radius — 3 tokens, cero excepciones en UI (reemplazan --r-lg/--r-md/--r-pill) */
--r-control: 2px;   /* botones (primario incluido), inputs, badges, tags */
--r-card:    8px;   /* cards glass, paneles split, FAQ, pricing, stats, final-wrap */
--r-media:   2px;   /* fotos y video */
/* 50% solo geometría (dots, halos). 42/32px SOLO dentro del mockup .phone. */

/* Tipografía — condensada SOLO display/labels; body a ancho normal (TYPO §1, UX §5) */
--font-display: 'Allumi Std Extended', 'Archivo', 'Arial Narrow', sans-serif;
--font-body: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Roboto, Arial, sans-serif;
--font-label: 'Helvetica Neue Condensed', 'Archivo Narrow', sans-serif; /* eyebrows, captions, cifras */

/* Escala (TYPO §2; hero min baja para que TRANSFORMATION quepa a 390px) */
--text-hero: clamp(2.1rem, 9.6vw, 6.75rem);  /* lh 0.92, tracking -0.01em */
--text-h2:   clamp(2rem, 4.2vw, 3.4rem);     /* lh 0.98 */
--text-h3:   1.4rem;                          /* títulos de card, lh 1.1 */
--text-lead: 1.25rem;                         /* lh 1.55, blanco pleno */
--text-body: 1rem;                            /* lh 1.65 */
--text-sm:   0.875rem;                        /* lh 1.5 */
--text-cap:  0.75rem;                         /* caps con tracking, lh 1 */

/* Tracking — 3 tokens, no 9 (TYPO §3). Regla: nada >0.22em; nada con tracking <0.68rem */
--track-btn:     0.07em;
--track-label:   0.14em;
--track-eyebrow: 0.22em;

/* Superficie y línea — 2+2 (SYSTEM §2.3) */
--glass:       rgba(255,255,255,0.04);
--glass-hover: rgba(255,255,255,0.07);
--hairline:    rgba(255,255,255,0.09);        /* #2a2a2a se elimina */
--line-accent:        rgba(255,210,0,0.30);
--line-accent-strong: rgba(255,210,0,0.50);

/* Color de texto body: sube de 0.65 a 0.72 (UX §5) */
--c-mist: rgba(255,255,255,0.72);

/* Espaciado vertical — una escala (SYSTEM §2.1) */
--space-section: clamp(6rem, 10vw, 9rem);
--space-block:   3.5rem;
--space-eyebrow: 2rem;
```

**AMARILLO: no cambia.** `--c-yellow: #FFD200` se queda; el logo (#F8D000, ΔE≈2) no se recolorea. Única regla: nunca el lockup sobre fill plano #FFD200 (BRAND Decisión 2).

---

## 2. GLOBAL CSS (bloques de app.css a tocar)

```css
/* BOTONES — UNA regla de geometría; muere el pill (resuelve nav 2px vs hero 999px) */
.btn { border-radius: var(--r-control); letter-spacing: var(--track-btn); }
.btn-primary, .btn-ghost, .btn-on { padding: 1rem 2.25rem; font-size: 0.95rem; } /* --btn-lg */
.btn-nav, .studio-cta { padding: 0.65rem 1.4rem; font-size: 0.8rem; border-radius: var(--r-control); }
/* Eliminar el override .nav .btn-nav (L102–107): ya no hay nada que sobreescribir.
   Consolidar las DOS definiciones de .btn-nav (L104 vs L165) en una. */
/* Secundario más ligero que el primario (UX §1): */
.btn-ghost { background: transparent; border: 1px solid var(--hairline);
  color: var(--c-mist) !important; backdrop-filter: none; }
.btn-ghost:hover { border-color: var(--line-accent-strong); color: var(--c-yellow) !important; box-shadow: none; }
.studio-cta { border-radius: var(--r-control); } /* deja de ser pill; hover amarillo se mantiene */

/* CARDS — 28/20px remapean a 8px */
.method-card, .split-panel, .final-wrap, .pricing-card { border-radius: var(--r-card); }
.studio-row, .metric-card, .faq-item, .stat { border-radius: var(--r-card); }
.admin-side a { border-radius: var(--r-control); }
.pricing-card.featured { background: var(--glass); border-color: var(--line-accent-strong); }
/* featured se marca con borde, no con fondo (SYSTEM §2.3) */

/* FORMS */
.field input, .field select, .field textarea { border-radius: var(--r-control);
  font-family: var(--font-body); }
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--line-accent-strong); box-shadow: none; }

/* BODY TEXT — el 60% del "todavía le falta" (TYPO §1) */
body { font-family: var(--font-body); }
p, .method-desc, .split-desc, .faq-item p, .timeline-item p { font-size: var(--text-body); line-height: 1.65; }
.timeline-item p { max-width: 34rem; }          /* baja de 38rem: ~65ch */
.lead { font-size: var(--text-lead); line-height: 1.55; color: var(--c-white); font-weight: 450; }
/* .lead se aplica al primer <p> de cada sección (method-intro p, hero-sub, split-desc del panel ON) */
.method-name, .timeline-item h3 { font-size: var(--text-h3); }  /* sube de 1.25/1.35 */
.method-num { font-size: 1.6rem; background: none; color: var(--c-faint); -webkit-text-fill-color: currentColor; }
/* numerales 01–04 dejan de gritar más que el título (TYPO §2.2) */

/* ACENTO — gradiente solo hero + CTA final; H2 intermedios acento plano */
.section-title .accent { background: none; -webkit-text-fill-color: var(--c-yellow); color: var(--c-yellow); }
/* .hero-title .accent y .final-title .accent conservan --grad-text */

/* NUMERALES TABULARES (horarios, precios, ratings) */
.schedule, .pricing-price, .app-rating b, .stat-value { font-variant-numeric: tabular-nums; }

/* FAQ — pregunta en sentence case, voz humana (TYPO §4) */
.faq-item summary { font-family: var(--font-body); font-weight: 600; font-size: 1.05rem;
  text-transform: none; }

/* TRACKING — remapear todos los letter-spacing existentes a los 3 tokens:
   0.06→--track-btn · 0.1/0.14/0.16→--track-label · 0.18/0.2/0.22/0.24/0.26→--track-eyebrow */
.split-label, .day-marker, .photo-caption { letter-spacing: var(--track-eyebrow); }

/* SCROLLBAR / MISC */
::-webkit-scrollbar-thumb { background: var(--glass-hover); border-radius: var(--r-control); }
.phone { border-color: var(--hairline); }
```

---

## 3. LOGO (BRAND §2 — el PNG es cuadrado con la tinta en y142–355; renderizado a 52px la tinta mide 52×22)

**Nav** (`site.tsx:78-80`, reemplaza el texto "54D"):
```tsx
import { asset } from "../lib/asset";

<Link to="/" className="nav-logo" onClick={close} aria-label="54D — Home">
  <img src={asset("images/brand/logo-54d.png")} alt="54D" width={52} height={52} />
</Link>
```
```css
.nav-logo img { display: block; width: 52px; height: 52px; object-fit: contain; }
@media (max-width: 820px) { .nav-logo img { width: 47px; height: 47px; } } /* tinta ≈20px */
```
Sin hover effect. El aire transparente del PNG centra la tinta verticalmente en el nav de 64px solo.

**Footer** (`site.tsx:160-162`, `.footer-giant` app.css:633-647 — letterforms reales, mismo gradiente):
```css
.footer-giant {
  width: min(560px, 78vw);              /* cap por resolución del master 500px */
  aspect-ratio: 500 / 213;
  margin: 2rem auto 0;
  background: linear-gradient(180deg, rgba(255,210,0,0.14) 0%, rgba(255,210,0,0.015) 85%);
  -webkit-mask: url('/images/brand/logo-54d.png') center / cover no-repeat;
  mask: url('/images/brand/logo-54d.png') center / cover no-repeat;
  /* cover sobre caja 2.35:1 recorta el aire del PNG cuadrado y deja la banda de tinta */
}
```
Markup: `<div className="footer-giant" style={{ WebkitMaskImage: \`url(${asset("images/brand/logo-54d.png")})\`, maskImage: \`url(${asset("images/brand/logo-54d.png")})\` }} aria-hidden="true" />` (sin texto dentro; la URL vía asset() por BASE_URL de Pages).

**P0 marca:** `public/favicon.ico` es el de la plantilla React Router (rojo #D0021B). Reemplazar por la D amarilla sola (crop x328–499 del PNG) en 16/32/48 + `apple-touch-icon.png` 180×180 sobre #070707. Crear `og-default.png` 1200×630 (lockup + "54 DAYS. ONE TRANSFORMATION.") y metas `og:image/og:title/twitter:card` en `root.tsx` — el negocio compra Meta Ads y hoy comparte sin marca.

---

## 4. BADGES → `apps/web/app/components/badges.tsx` (spec UX Anexo A, radius del sistema sharp)

```tsx
const AppleIcon = (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);
const PlayIcon = (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
    <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
  </svg>
);

function StoreBadge({ href, lineOne, lineTwo, icon, label }: {
  href: string; lineOne: string; lineTwo: string; icon: React.ReactNode; label: string;
}) {
  return (
    <a className="store-badge" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {icon}
      <span className="store-badge-text"><small>{lineOne}</small><b>{lineTwo}</b></span>
    </a>
  );
}

export function AppStoreBadges({ appStoreUrl, googlePlayUrl }: { appStoreUrl: string; googlePlayUrl: string }) {
  return (
    <div className="store-badges">
      <StoreBadge href={appStoreUrl} label="Download on the App Store"
        lineOne="Download on the" lineTwo="App Store" icon={AppleIcon} />
      <StoreBadge href={googlePlayUrl} label="Get it on Google Play"
        lineOne="Get it on" lineTwo="Google Play" icon={PlayIcon} />
    </div>
  );
}
```
CSS (reemplaza `.store-badge*` app.css:847-855): contenedor `inline-flex; align-items:center; gap:12px; height:56px; padding:0 20px 0 16px; background:var(--c-black); border:1px solid rgba(255,255,255,0.18); border-radius:var(--r-control); color:#fff; text-decoration:none;` — hover/focus-visible `border-color + color: var(--c-yellow)` (solo borde y glifo viran; `b{color:#fff}` fijo). `small`: 10px caps `--track-label` rgba(255,255,255,0.55). `b`: display 800, 15px caps, margin-top 3px. `.store-badges{display:flex;gap:12px;flex-wrap:wrap}`. Glifos monocromos deliberadamente (el Play multicolor pelearía con la paleta binaria). Sustituir el markup duplicado de badges en `home.tsx` / `on.tsx` por `<AppStoreBadges/>` y repetirlos en el footer.

---

## 5. POR PÁGINA

- **`routes/pricing.tsx`** — LA fuga de conversión (UX §4): hero pasa a `hero-inner` media altura (H1 + una línea), las 3 tarjetas de plan suben al primer viewport; "EVERY PLAN INCLUDES" se mueve DESPUÉS de los precios. Sticky bar mobile "START FREE — 7 DAYS" al 50% de scroll. FAQ a 2 columnas o max-width centrado (hoy 50% del viewport en negro vacío, `pricing-desktop-2.png`).
- **`components/site.tsx`** — logo nav + footer (§3). **Eliminar el breadcrumb** (UX: en un funnel de 5 páginas no aporta; resuelve de raíz la colisión breadcrumb/logo de `pricing-desktop-0.png`). Footer: añadir `<AppStoreBadges/>`, glifo de Instagram, trust markers (30-day guarantee), y "Miami" → "Coral Gables · Hallandale" (bug de contenido). CTA nav y hero unifican copy: siempre "START FREE — 7 DAYS".
- **`routes/home.tsx`** — hero-sub y párrafo sobre foto de grupo: añadir `text-shadow: 0 1px 24px rgba(7,7,7,.6)` o extender veil (`home-desktop-1.png`). Phone mockup: pantalla con crop de foto real del coach vía asset() en `.phone-screen img` — el rectángulo negro vacío desacredita la app (`home-desktop-2.png`). CTA card Studios mobile: copy "SEE THE STUDIOS" (la píldora rompía a 2 líneas; con 2px igual aplica). Ratings 4.9 suben de peso: `--text-body` blanco.
- **`routes/method.tsx`** — cards "Yes / No" en title-case display: pasar a "YES / NO" uppercase (única rotura del sistema, `method-desktop-2.png`); cerrar el vacío de ~350px antes del FAQ.
- **`routes/on.tsx`** — usar `<AppStoreBadges/>`; H2 con acento plano (sin gradiente); mitad derecha vacía de `on-desktop-2.png`: subir la foto o reducir min-height.
- **`routes/studio-detail.tsx`** — `.schedule` con tabular-nums; CTA WhatsApp como secundario ligero (hoy es más ancho que el primario, `studio-cg-desktop-0.png`); mini-form de reserva (nombre + WhatsApp) con los `.field` a `--r-control`.
- **`root.tsx` / `public/`** — favicon + og:image (§3 P0).

**Pedir al cliente:** el vector del logo (AI/EPS/SVG) — el PNG de 500px capa el footer a 560px — y las woff2 definitivas (Allumi + HN Condensed, que queda solo como `--font-label`).
