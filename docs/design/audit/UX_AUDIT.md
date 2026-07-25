# 54D — Auditoría UX / Conversión (crítico de jurado)

Fecha: 2026-07-25
Evidencia: 24 screenshots en `scratchpad/audit/` (home / method / on / pricing / studio-cg × desktop-0..3; home / pricing mobile-0..1).
Código auditado: `apps/web/app/app.css`, `apps/web/app/routes/home.tsx`.

Veredicto general: la dirección es correcta (negro #070707 + amarillo #FFD200 + display condensada funciona), pero el sitio se queda en "plantilla premium bien ejecutada", no en dirección de arte. Las tres cosas que el cliente sospecha son reales y verificables en pantalla. Y hay un cuarto problema que nadie mencionó y es el más caro: **los precios no aparecen en ninguna de las 24 capturas**.

---

## 1. Jerarquía de CTAs: tres amarillos compitiendo en el primer viewport

**Evidencia: `home-desktop-0.png`, `pricing-desktop-0.png`, `studio-cg-desktop-0.png`**

- En `home-desktop-0` conviven a la vez: "START FREE" (nav, rectángulo radio 2px), "START FREE. 7 DAYS." (hero, píldora degradada) y "EXPLORE THE STUDIOS" (ghost píldora del mismo tamaño exacto que el primario). Tres llamadas, dos de ellas al mismo destino con dos formas y dos copys distintos. El ojo no sabe cuál es "el" botón.
- El secundario ghost tiene idéntico alto, idéntico radio e idéntica tipografía que el primario: pesa lo mismo. Un secundario debe ser un enlace con flecha o un outline visualmente más ligero (menos padding, sin fondo, texto mist).
- En `studio-cg-desktop-0` el patrón cambia otra vez: "RESERVE YOUR SPOT" + "MESSAGE US ON WHATSAPP" — el CTA de WhatsApp es más ancho que el primario. El botón más grande de la página no es el que convierte.
- Incoherencia de radios en los propios CTAs (confirmada en `app.css`): nav `border-radius: 2px` (línea 104), hero `--r-pill: 999px`, cards `--r-lg: 28px`, FAQ `--r-md: 20px`, store-badges `2px`. Cinco geometrías conviviendo; el cliente lo detectó bien. **Decisión de dirección de arte necesaria: o sistema "sharp" (2px, coherente con el logo distressed y el tono militar del programa) o sistema píldora — no ambos.** Recomendación: sharp 2px para todo elemento accionable; reservar radios grandes solo para cards de superficie.

**Fix:** un único primario por viewport (píldora o sharp, pero uno), un secundario tipográfico (`texto + →`), y unificar el copy del CTA primario en todo el funnel: siempre "START FREE — 7 DAYS", nunca tres variantes.

## 2. La marca: el nav usa texto plano "54D" mientras el logo real aparece pintado en las paredes

**Evidencia: `home-desktop-0.png` vs `home-mobile-0.png`, `pricing-desktop-0.png` (muro con el logo distressed gigante)**

- El activo oficial existe: `apps/web/public/images/brand/logo-54d.png` (500×500, "54" blanco + "D" amarilla distressed + ®). El sitio lo ignora y compone "54D" en Allumi a 1.35rem. La ironía es visible en `home-mobile-0`: el logo real (distressed, con la D amarilla) domina la foto del hero mientras el nav muestra un wordmark genérico dos centímetros más arriba.
- En `pricing-desktop-0.png` y `pricing-mobile-0.png` hay además una colisión física: el breadcrumb "HOME / PRICING" se monta sobre la zona del logo en la esquina superior izquierda (breadcrumb en y≈8, logo en y≈31 con el eyebrow "54D ON · 7-DAY FREE TRIAL" en y≈57 — tres elementos apilados sin aire en la misma esquina).
- El footer (`home-desktop-3.png`) usa un "54D" fantasma de ~250px de alto en degradado casi invisible: es el único sitio donde se intenta usar la marca en grande, y se hace con texto plano otra vez, no con la textura distressed que es el activo diferencial.

**Fix:** logo real en nav (SVG o el PNG a 28–32px de alto, la D amarilla es reconocible a ese tamaño), breadcrumb fuera del bloque del logo (o eliminarlo: en un funnel de 5 páginas el breadcrumb no aporta), y el watermark del footer con el logo distressed real con opacidad 0.06–0.08.

## 3. Sección app: badges de texto que parecen inputs vacíos + un teléfono negro sin pantalla

**Evidencia: `home-desktop-2.png` (el cliente lo señaló explícitamente), `on-desktop-1.png`, `home-mobile-1.png`**

- Los "badges" actuales (`home-desktop-2`, y-200 aprox.) son dos rectángulos hairline con "DOWNLOAD ON THE / APP STORE" y "GET IT ON / GOOGLE PLAY" en texto puro. Sin glifo, leen como ghost buttons genéricos o, peor, como campos de formulario vacíos. El badge de tienda es un patrón con memoria muscular universal: sin el icono, pierde el 80% del reconocimiento y la credibilidad de "hay una app real".
- El mockup del teléfono es un rectángulo negro vacío en las tres capturas (`home-desktop-2`, `on-desktop-1`, `home-mobile-1`). Un frame de iPhone sin UI dentro comunica exactamente lo contrario de lo que se pretende: que la app no existe. Si no hay screenshot real de la app todavía, mejor un crop de la foto real del coach con overlay de chat, o eliminar el device y dejar la lista numerada 01–05, que sí es buena.
- Los ratings "4.9 App Store · 4.9 Google Play" van en 0.8rem gris sobre negro debajo de todo: es el social proof más fuerte de la sección y es lo menos visible.
- Spec exacta del componente nuevo: **ver Anexo A al final** (SVG inline listo para pegar, sin dependencias ni assets trademark descargados).

## 4. El agujero del funnel: los precios no existen visualmente

**Evidencia: `pricing-desktop-0.png` → `pricing-desktop-1.png` → `pricing-desktop-2.png` (las 4 alturas de scroll capturadas) y `pricing-mobile-0/1.png`**

- La página /pricing abre con OTRO hero a pantalla completa ("START TODAY. THE FIRST 7 DAYS ARE ON US.") con el mismo CTA que ya se pulsó para llegar aquí. El usuario que hizo clic en "START FREE" aterriza en… otra invitación a empezar gratis, no en los planes.
- En las cuatro capturas de scroll de desktop las tarjetas de precio no aparecen nunca: `-0` es hero, `-1` es "EVERY PLAN INCLUDES EVERYTHING" (cards 01–04), `-2` ya es el FAQ con las tarjetas de planes cortadas en el borde superior (se ven 100px de sus fondos). Los precios viven en un hueco entre capturas: están a ~2 viewports y medio de profundidad. En mobile (`pricing-mobile-1`) tras un viewport entero aún se está en "04 COMMUNITY". **La página de precios entierra los precios.**
- Fricción añadida en `pricing-desktop-2`: el FAQ ocupa media columna izquierda y deja el 50% derecho del viewport en negro vacío. Lo mismo pasa en `on-desktop-2` (título + foto a la izquierda, mitad derecha vacía) y en `method-desktop-2` (~350px de vacío entre las cards Yes/No y el FAQ).
- `method-desktop-2` además rompe el sistema tipográfico: "Yes" / "No" en itálica con caja baja, único lugar del sitio que abandona el uppercase display. Detalle menor pero es exactamente el tipo de grieta que separa plantilla de dirección de arte.

**Fix:** en /pricing, hero de media altura máximo (breadcrumb + H1 + una línea) y las tres tarjetas de plan visibles o asomando en el primer viewport. El "EVERY PLAN INCLUDES" va DESPUÉS de los precios, como refuerzo, no antes como muro. Sticky bar mobile con "Start free — 7 days" al superar el 50% de scroll.

## 5. Tipografía de párrafos: la sospecha del cliente es correcta

**Evidencia: `home-desktop-0.png` (subhero), `method-desktop-0.png` (columna derecha), `pricing-desktop-1.png` (descripciones 01–04)**

- `--font-body: 'Helvetica Neue Condensed', 'Archivo Narrow', …` (`app.css:35`): **todo el running text del sitio va en condensada**. La condensada es una voz de titular; en párrafos de 2–4 líneas a 0.95–1.12rem sobre negro produce esa textura apretada y "barata" que el cliente percibe sin saber nombrarla. Se ve claramente en el subhero de `home-desktop-0` y en el bloque largo de `method-desktop-0` (columna derecha).
- Agrava: color mist (gris medio) sobre #070707 con peso ligero — párrafos como los de `pricing-desktop-1` (cards 01–04) rondan un contraste bajo para 0.95rem.
- **Fix de dirección de arte:** condensada SOLO para display/eyebrows/CTAs. Cuerpo en una grotesk de ancho normal (Archivo regular, Inter, o Helvetica Now Text), 1rem/1.6, color subiendo a ~rgba(255,255,255,0.72). El contraste condensada-display vs grotesk-texto es precisamente lo que hace "editorial" a un sitio de este género; hoy todo es la misma voz estrujada.

## 6. Mobile

**Evidencia: `home-mobile-0.png`, `home-mobile-1.png`, `pricing-mobile-0.png`**

- `home-mobile-0`: "TRANSFORMATION" toca el borde derecho del viewport (el clamp `--text-hero` min 2.4rem no cede lo suficiente para 390px con esa palabra de 14 caracteres en extended). O se reduce el mínimo del clamp, o se parte la palabra tipográficamente ("TRANSFOR-/MATION" es aceptable en este lenguaje visual), o se cambia a `font-size: min(9.5vw, …)` calculado para la palabra más larga.
- `home-mobile-0`: el ticker de sedes queda pegado a los CTAs y se corta ("ABLES ● … MEXIC"). El corte de un ticker es natural, pero a esa opacidad y tamaño es ruido, no señal.
- `home-mobile-1`: el CTA "EXPLORE THE STUDIOS" dentro de la card de Studios rompe a dos líneas dentro de la píldora — píldora de dos líneas es el anti-patrón de la píldora. Ancho fijo del botón o copy más corto ("SEE THE STUDIOS").
- `pricing-mobile-0`: la colisión breadcrumb/logo descrita en §2 es peor a 390px: tres niveles de texto apilados en 60px verticales.

## 7. Footer

**Evidencia: `home-desktop-3.png`, `pricing-desktop-3.png`, `studio-cg-desktop-3.png` (idénticos)**

- El footer arranca con ~200px de vacío + la banda CTA final cortada a una lámina amarilla de 30px en la parte superior de las tres capturas (el CTA final y el footer no se encadenan: hay un colchón muerto entre ambos).
- Cuatro columnas correctas, pero: sin CTA propio, sin badges de app (el lugar natural para repetirlos), "Instagram" como texto plano sin glifo, y sin ningún trust marker (métodos de pago, garantía de 30 días que SÍ se menciona en pricing y desaparece aquí).
- El watermark "54D" fantasma consume ~250px de scroll a opacidad casi cero: o se ve (logo distressed real, opacidad 0.07) o se elimina.
- Micro-bug de contenido: el footer dice "Miami · Mexico City · Bogotá" pero los studios listados son Coral Gables y Hallandale — "Miami" no es ninguna de las dos. Unificar denominación.

## 8. Forms

- En las 24 capturas no hay ningún formulario visible (el flujo de captura vive detrás de "BOOK →" / "RESERVE YOUR SPOT"). Esto en sí es un hallazgo: **el funnel no tiene ninguna captura de lead visible en scroll pasivo** — ni email capture, ni WhatsApp inline, ni selector de generación. Para un producto de cohortes con fecha ("Yours starts Monday, August 17", `studio-cg-desktop-0`) un mini-form de reserva en la propia página de studio (nombre + WhatsApp) reduciría la fricción del salto a plataforma externa.
- `app.css:786` define inputs con `--r-md` (20px): cuando el form exista, chocará otra vez con el sistema de radios de §1. Inputs al mismo radio que los CTAs (2px en el sistema propuesto).

---

## Anexo A — Spec exacta: StoreBadge con glifos SVG inline

Reemplaza el bloque `.store-badge` actual (`app.css:847-855`) y el markup de `home.tsx:334-353` (y sus gemelos en `on.tsx` / `pricing.tsx` — extraer a componente compartido en `app/components/site.tsx`).

### Anatomía

```
┌──────────────────────────────┐
│  ⌘   DOWNLOAD ON THE         │   alto fijo: 56px
│ 24px  APP STORE              │   padding: 0 20px 0 16px
└──────────────────────────────┘   gap icono-texto: 12px
```

- Contenedor: `inline-flex`, `align-items: center`, `height: 56px`, `gap: 12px`, `background: #070707`, `border: 1px solid rgba(255,255,255,0.18)`, `border-radius: 2px` (sistema sharp, §1), `text-decoration: none`, `transition: border-color 220ms cubic-bezier(0.33,1,0.68,1), color 220ms`.
- Icono: SVG inline 24×24, `fill: currentColor`, color base `#FFFFFF`.
- Línea 1 (`small`): 10px, uppercase, `letter-spacing: 0.14em`, `color: rgba(255,255,255,0.55)`, `line-height: 1`.
- Línea 2 (`b`): `var(--font-display)`, 800, 15px, uppercase, `letter-spacing: 0.02em`, `color: #fff`, `line-height: 1.15`, `margin-top: 3px`.
- Hover/focus-visible: `border-color: #FFD200`; el icono pasa a `#FFD200` (vía `color` en el `<a>` + `fill="currentColor"`). El texto se mantiene blanco: un solo acento cambia, no tres.
- Los dos badges dentro de un flex con `gap: 12px; flex-wrap: wrap`.
- Accesibilidad: `aria-label="Download on the App Store"` / `"Get it on Google Play"` en cada `<a>`; los SVG con `aria-hidden="true"`.

### Componente (TSX, listo para pegar)

```tsx
function StoreBadge({
  href, lineOne, lineTwo, icon, label,
}: {
  href: string; lineOne: string; lineTwo: string;
  icon: React.ReactNode; label: string;
}) {
  return (
    <a className="store-badge" href={href} target="_blank"
       rel="noopener noreferrer" aria-label={label}>
      {icon}
      <span className="store-badge-text">
        <small>{lineOne}</small>
        <b>{lineTwo}</b>
      </span>
    </a>
  );
}

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

// Uso:
<div className="store-badges">
  <StoreBadge href={APP_STORE_URL} label="Download on the App Store"
    lineOne="Download on the" lineTwo="App Store" icon={AppleIcon} />
  <StoreBadge href={GOOGLE_PLAY_URL} label="Get it on Google Play"
    lineOne="Get it on" lineTwo="Google Play" icon={PlayIcon} />
</div>
```

Ambos glifos son paths monocromos dibujados inline (`fill: currentColor`): cero dependencias, cero imágenes descargadas, y en hover heredan el amarillo del enlace. El triángulo de Play va en monocromo deliberadamente — la versión multicolor pelearía con la paleta binaria negro/amarillo del sitio.

### CSS (reemplaza el bloque actual)

```css
.store-badges { display: flex; gap: 12px; flex-wrap: wrap; }
.store-badge {
  display: inline-flex; align-items: center; gap: 12px;
  height: 56px; padding: 0 20px 0 16px;
  background: var(--c-black);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  color: #fff;                       /* alimenta currentColor del glifo */
  text-decoration: none;
  transition: border-color var(--transition), color var(--transition);
}
.store-badge:hover,
.store-badge:focus-visible { border-color: var(--c-yellow); color: var(--c-yellow); }
.store-badge svg { flex: 0 0 24px; }
.store-badge-text { display: flex; flex-direction: column; }
.store-badge small {
  font-size: 10px; line-height: 1; text-transform: uppercase;
  letter-spacing: 0.14em; color: rgba(255, 255, 255, 0.55);
}
.store-badge b {
  font-family: var(--font-display); font-weight: 800;
  font-size: 15px; line-height: 1.15; margin-top: 3px;
  text-transform: uppercase; letter-spacing: 0.02em; color: #fff;
}
```

Nota: el texto de línea 2 permanece blanco en hover (solo borde+glifo viran a amarillo); por eso `b { color:#fff }` fijo y `currentColor` solo en el SVG.

---

## Top-3 (resumen ejecutivo)

1. **Los precios están enterrados** — /pricing abre con un segundo hero a pantalla completa y las tarjetas de plan no aparecen en ninguna de las capturas de scroll (`pricing-desktop-0..2`). Es la fuga de conversión número uno.
2. **Sistema de CTAs incoherente** — tres amarillos compitiendo en el primer viewport, secundario con el mismo peso que el primario, y cinco radios distintos (2px, 20px, 28px, 999px) en la misma página (`home-desktop-0`, `app.css`).
3. **La sección app desacredita la app** — badges de solo texto sin glifos + mockup de teléfono con pantalla negra vacía (`home-desktop-2`, `on-desktop-1`). Spec de badges nuevos con SVG inline en el Anexo A.
