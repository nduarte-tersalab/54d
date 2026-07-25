# 54D — Auditoría de sistema de tokens (crítica de dirección de arte)

**Fuente:** `apps/web/app/app.css` (858 líneas) + 24 screenshots (`scratchpad/audit/`).
**Diagnóstico en una frase:** el sitio tiene *dos personalidades de radio* conviviendo — un lenguaje duro/editorial (2–4px, hairlines, caps condensadas) y un lenguaje soft/fintech (pills 999, glass 28px, glows) — y el cliente lo percibe como "algo falta" porque ningún componente confirma al de al lado.

---

## 1. Border-radius: la tabla del caos

10 valores distintos en producción. Evidencia visual citada por screenshot.

| Valor | Dónde se usa (app.css) | Evidencia visual |
|---|---|---|
| **2px** | `.nav .btn-nav` (L104), `.store-badge` (L849) | `home-desktop-0`: CTA amarillo del nav casi cuadrado. `home-desktop-2`: badges App Store / Google Play cuadrados (y sin iconos: solo texto en caja — parecen placeholders, el cliente tiene razón) |
| **4px** | `.photo-card` (L811), `.photo-bleed-*` (L822–823) | `studio-cg-desktop-1`: fotos casi a hueso, lo más "editorial" del sitio |
| **12px** | `.admin-side a` (L686) | admin (no público, pero es un cuarto dialecto) |
| **20px** (`--r-md`) | `.studio-row` (L507), `.metric-card` (L697), `.faq-item` (L750), `.stat` (L776), `.field input/select/textarea` (L786) | `pricing-desktop-2`: acordeones FAQ con esquinas de app bancaria |
| **28px** (`--r-lg`) | `.method-card` (L379), `.split-panel` (L450), `.final-wrap` (L568), `.pricing-card` (L729) | `pricing-desktop-1`: cards 01–04; `home-desktop-1`: paneles ON/Studios; `studio-cg-desktop-2`: cards Schedule/Location |
| **32px** | `.phone-screen` (L834) | `on-desktop-1` (mockup device — justificable) |
| **42px** | `.phone` (L830) | `on-desktop-1` (idem) |
| **50%** | halo hero (L211), dots timeline (L767) | `method-desktop-1`: dots del timeline (correcto, es geometría, no UI) |
| **99px** | scrollbar thumb (L63) | — |
| **999px** (`--r-pill`) | `.btn` base (L150) → `btn-primary`, `btn-ghost`, `btn-on`; `.studio-cta` (L550); notch del phone (L833) | `home-desktop-0`, `on-desktop-0`, `studio-cg-desktop-2`: todos los CTA de página son pills con gradiente |

### El conflicto que el cliente huele sin poder nombrarlo
En `home-desktop-0` conviven **en el mismo viewport**: el CTA del nav "START FREE" a 2px y el CTA del hero "START FREE. 7 DAYS." a 999px. Es el mismo verbo, la misma acción, el mismo amarillo — y dos geometrías opuestas. En `home-desktop-2` se suma la tercera: badges de app a 2px pegados a un listado con dots amarillos, dos scrolls después de pills y cards de 28px. Tres sistemas de esquinas para una sola marca.

### Bonus detectado en la evidencia (no es radius, pero es jurado)
- `pricing-desktop-0` y `on-desktop-0`: el **breadcrumb "HOME / PRICING" se monta sobre el logo "54D"** del nav. Colisión de layout visible en producción.
- `home-mobile-0`: "TRANSFORMATION." **toca el borde derecho** del viewport — el clamp del hero (`--text-hero`, 7vw) no protege el peor caso.
- El nav usa texto plano "54D" cuando existe logo oficial distressed (`public/images/brand/logo-54d.png`). La textura distressed del logo es justamente el argumento a favor de la dirección dura (§4).

---

## 2. Los otros cuatro caos

### 2.1 Espaciado vertical entre secciones
| Valor | Dónde |
|---|---|
| `clamp(5.5rem, 11vw, 10rem)` | `.section` (L307) |
| `clamp(4rem, 9vw, 7rem)` | `.photo-band-content` (L806) |
| `clamp(3.5rem, 8vw, 7rem)` | `.final-wrap` (L569) |
| `5rem … 2rem` | `.footer` (L598) |
| `3.5rem / 3rem / 2.2rem` | márgenes internos ad-hoc: `.method-intro` (L364), `.studios-list` (L499), `.pricing-grid` (L726), `.faq-list` (L749), `.timeline` (L762), `.stat-row` (L775), `.day-marker` (L334) |

Cinco ritmos sin escala común. Se siente en `pricing-desktop-2`: el aire entre cards y sección FAQ no es múltiplo de nada.

### 2.2 Hairlines
| Valor | Dónde |
|---|---|
| `--hairline` rgba(255,255,255,0.09) | nav, cards, ticker, faq, fields, app-features… (uso mayoritario, bien) |
| `#2a2a2a` sólido | `.phone` (L830), scrollbar (L63) — equivale a ~0.16 blanco, más claro que el token |
| gradiente `transparent → hairline → transparent` | `.studio-row + .studio-row::before` (L513), `.footer::before` (L601) |
| `border-bottom: 2px solid` amarillo | links nav activos (L96–100) — este es *underline*, no hairline; correcto |

### 2.3 Opacidades de glass / bordes amarillos
| Valor | Dónde |
|---|---|
| 0.02 | ticker bg (L277) |
| 0.035 | `--glass` |
| 0.05 | `.btn-ghost` bg (L167) |
| 0.07 | `--glass-hover`; admin active amarillo (L690) |
| 0.08 | `.pricing-card.featured` gradiente (L734) |
| Bordes amarillos: 0.25 / 0.3 / 0.45 / 0.5 | metric-card y faq open (0.25), method-card y pricing hover (0.3), featured (0.45), btn-ghost hover y field focus (0.5) |

Cinco fondos y cuatro intensidades de borde amarillo donde bastan dos y dos.

### 2.4 Tamaños de botón
| Padding / font | Dónde |
|---|---|
| 1.05rem 2.4rem / 0.95rem | `btn-primary`, `btn-ghost`, `btn-on` |
| 0.7rem 1.5rem / 0.8rem | `.nav .btn-nav` (L104) |
| 0.6rem 1.4rem / 0.78rem | `.btn-nav` genérico (L165) — **dos definiciones que compiten para la misma clase** |
| 0.55rem 1.2rem / 0.82rem | `.studio-cta` (L549) |
| 1rem 2.2rem / 1rem | `.nav-drawer .btn-nav` (L134) |

### 2.5 Tipografía de párrafos (la sospecha del cliente)
Nueve tamaños de body copy: 1.15 / 1.12 / 1.05 / 0.98 (×3) / 0.95 (×3)… todos en **Archivo Narrow condensada** al 65% de blanco. Una condensada es voz de titular; usada como texto de lectura a 0.95rem sobre negro produce exactamente la incomodidad que el cliente reporta ("sospecho de los párrafos"). No es el tamaño: es que el body no debería ser condensed. Recomendación fuera de alcance de tokens pero necesaria: body en Archivo regular (o la Allumi text cuando llegue), y reducir a 2 tamaños de párrafo (1.125rem lead / 0.9375rem base).

---

## 3. Propuesta: UNA escala — dirección "duro y editorial"

**Decisión y justificación.** La marca es distressed, condensada, uppercase, negro/amarillo — boxeo, no wellness. De los dos dialectos que conviven, el que pertenece a esa marca es el duro: el CTA de nav a 2px, las fotos a 4px, los hairlines, el logo distressed. Los pills con gradiente y el glass de 28px son el dialecto prestado (fintech/wellness genérico 2023) y son lo primero que un director de arte quitaría. **Se elimina `--r-pill` de la UI.** El pill del hero no se "resuelve conviviendo" con el nav: se rinde ante él.

```css
/* Radius — 3 tokens, cero excepciones en UI */
--r-control: 2px;   /* TODO botón (primario incluido), input, badge, tag, breadcrumb-chip */
--r-card:    8px;   /* cards glass, paneles split, FAQ, pricing, stats, final-wrap, admin */
--r-media:   2px;   /* fotos y video: mismo corte que los controles */
/* 50% queda solo para geometría real (dots, halos). 42/32px quedan SOLO dentro del
   mockup .phone (es un objeto físico, no UI). Scrollbar hereda --r-control. */

/* Espaciado vertical — una escala, base 8 */
--space-section: clamp(6rem, 10vw, 9rem);   /* .section, .photo-band-content, .final-wrap */
--space-block:   3.5rem;                    /* título → contenido (method-intro, grids, faq, timeline) */
--space-eyebrow: 2rem;                      /* day-marker → título */

/* Superficie y línea — dos pasos, no cinco */
--glass:       rgba(255,255,255,0.04);      /* absorbe 0.02, 0.035, 0.05 */
--glass-hover: rgba(255,255,255,0.07);      /* absorbe 0.08 featured (featured se marca con borde, no con fondo) */
--hairline:    rgba(255,255,255,0.09);      /* única línea; #2a2a2a se elimina */
--line-accent: rgba(255,210,0,0.30);        /* borde amarillo reposo/hover sutil */
--line-accent-strong: rgba(255,210,0,0.50); /* featured, focus */

/* Botones — dos tamaños, un radio */
--btn-lg: padding 1rem 2.25rem / font 0.95rem;   /* CTA de página */
--btn-sm: padding 0.65rem 1.4rem / font 0.8rem;  /* nav, studio-cta, chips */
```

**Reglas de aplicación:**
1. `.btn { border-radius: var(--r-control) }` — muere el override de `.nav .btn-nav` (L102–106) porque ya no hay nada que sobreescribir; el CTA primario conserva el gradiente `--grad-sun`, que a 2px se vuelve señal de marca en vez de caramelo.
2. `--r-lg`/`--r-md` (28/20) se remapean ambos a `--r-card: 8px`; el glass sobrevive, pero con esquinas que pertenecen a la misma familia que las fotos de `studio-cg-desktop-1`.
3. `.studio-cta` deja de ser pill → `--btn-sm` a 2px; el hover de relleno amarillo se mantiene.
4. Store badges: `--r-control` + **iconos reales de Apple/Google** (SVG inline, monocromo blanco) — la caja de solo-texto de `home-desktop-2` es lo que los delata como maqueta.
5. Consolidar las dos definiciones de `.btn-nav` (L104 vs L165) en una.
6. Nav: reemplazar el texto "54D" por `logo-54d.png` (altura 28–32px); arreglar colisión breadcrumb/logo (`pricing-desktop-0`) y el clip de "TRANSFORMATION." en `home-mobile-0` (bajar techo del clamp a ~6.2rem o `overflow-wrap`).

**Por qué 8px y no 0:** a 0px el glass oscuro sobre negro pierde el borde perceptible y las cards se funden con la lona; 8px mantiene la lectura de "panel" en `pricing-desktop-1` sin volver al lenguaje soft. Es el punto medio defendible entre el 4px de las fotos y el 12px del admin — y reemplaza a ambos.
