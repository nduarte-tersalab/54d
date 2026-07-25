# BRAND AUDIT — Integración del logo 54D

**Crítico de marca · Jurado de diseño · 2026-07-25**
Evidencia: screenshots en `scratchpad/audit/` + píxeles de `apps/web/public/images/brand/logo-54d.png` + código en `apps/web/app/`.

---

## 0. Diagnóstico

La marca registrada de 54D — "54" blanco, "D" amarillo distressed, ® — **no aparece ni una sola vez en la interfaz**. Y lo grave no es la ausencia: es la contradicción visible.

- `pricing-desktop-0.png`: el mural distressed "54D" ocupa media pared del hero, gigante, con la D amarilla corroída… y a 80px de distancia, el nav muestra "54D" en Archivo geométrico limpio (`site.tsx:78-80`). El usuario ve el logo real y el logo falso **en el mismo viewport**. Eso no lee como minimalismo; lee como sitio que no es de la marca.
- `home-mobile-0.png`: mismo caso — el mural distressed es el fondo del hero completo y el nav lo contradice arriba a la izquierda.
- `home-desktop-3.png`: el footer tiene el gesto correcto (watermark gigante con gradiente amarillo→nada, `.footer-giant`, app.css:633) pero ejecutado con **tipografía del sistema**, no con las letterforms reales. Es un placeholder de la idea, no la idea.
- **Favicon**: `public/favicon.ico` es el favicon de la plantilla de React Router — color dominante medido **#D0021B (rojo)**. Un tab rojo en un sitio negro/amarillo. Esto es un bug de marca, no una decisión.
- **og:image**: no existe (`grep og:` en `app/` → cero resultados). Cada share en WhatsApp/Instagram/Meta Ads sale sin marca — y este negocio compra tráfico en Meta.

---

## 1. Anatomía del asset (medida, no estimada)

`logo-54d.png` — 500×500, RGBA, fondo transparente.

| Dato | Valor medido |
|---|---|
| Caja de tinta real | x 0–499, y 142–355 → **lockup 500×213 px (ratio 2.35:1)** dentro de un lienzo cuadrado con ~142px de aire arriba y ~145 abajo |
| "54" | blanco puro #FFFFFF (36.8k px) — **invisible sobre fondo claro** |
| "D" + ® | amarillo #F8D000 (21.9k px), zona x 328–499 |
| ® | círculo pequeño arriba-derecha del hombro de la D (~y 143–170) — a escala nav se convierte en ruido de 2–3px |

**Consecuencias:**
1. Nunca posicionar el PNG cuadrado tal cual: el 57% del lienzo es aire. Recortar al strip 500×213 (`logo-54d-lockup.png`) y trabajar siempre con ese ratio.
2. El master es un PNG de 500px. Suficiente para nav y favicon; **insuficiente para el footer gigante y para print**. Pedir al cliente el vector (AI/EPS/SVG) es dependencia dura de este spec. Mientras llega: ningún uso por encima de 560px de ancho renderizado.
3. Solo-dark por diseño: el "54" blanco restringe el lockup a fondos ≤ #1A1A1A. Si algún día existe contexto claro (email, PDF), derivar variante "54" #070707 + D amarillo intacta. En el sitio actual (100% oscuro en las cinco páginas auditadas) no hace falta.

---

## 2. Spec de integración

### 2.1 Nav (reemplaza el texto de `site.tsx:78-80`)

- Asset: `logo-54d-nav.png` — el lockup **sin ®** (borrar el círculo del master; a 22px de alto el ® mide ~3px: ni legible ni legal, solo suciedad). Export @1x y @2x (104px).
- Tamaño: **alto 22px desktop** (ancho resultante ≈ 52px) dentro del nav de 64px; **alto 20px en mobile** (`home-mobile-0.png` muestra el "54D" tipográfico actual a ~19px de cap height — la sustitución es 1:1 en presencia).
- Alineación: borde izquierdo del "5" al gutter (el bbox arranca en x=0 con tinta sólida, no hay que compensar).
- Estados: sin hover effect (el logo no es un link que necesite afordancia extra; ya lo es por posición). `alt="54D"`.
- El nav transparente→negro al scroll (app.css:85) no cambia nada: blanco+amarillo funciona sobre ambos.

### 2.2 Footer gigante (reemplaza `.footer-giant`, app.css:633-647)

El gesto actual (gradiente rgba(255,210,0,.14)→.015 clipped a texto) es correcto; cambiar solo el vehículo:

```css
.footer-giant {
  width: min(560px, 78vw);            /* cap por resolución del master PNG */
  aspect-ratio: 500 / 213;
  margin: 2rem auto 0;
  background: linear-gradient(180deg, rgba(255,210,0,0.14) 0%, rgba(255,210,0,0.015) 85%);
  -webkit-mask: url('/images/brand/logo-54d-lockup.png') center / contain no-repeat;
  mask: url('/images/brand/logo-54d-lockup.png') center / contain no-repeat;
}
```

Aquí sí **con ®** — a 560px el ® mide ~30px y es legible; el footer es donde vive la versión legal completa. Cuando llegue el vector, subir el cap a `min(900px, 78vw)`.

### 2.3 Favicon (reemplazo urgente de `public/favicon.ico`)

- Glifo: **la D amarilla sola** (crop x 328–499 → 171×213). El lockup completo es ilegible a 16px; la D distressed amarilla es el único glifo ownable de la marca a esa escala.
- Set: `favicon.ico` (16+32+48, D sobre transparente), `icon.svg` cuando exista vector, `apple-touch-icon.png` 180×180 (D centrada sobre #070707, 18% de padding), 512×512 para manifest.
- El distress se pierde por antialiasing a 16px: aceptable — la silueta + el amarillo hacen el trabajo.

### 2.4 og:image + meta (no existe hoy)

- `og-default.png` 1200×630: fondo #070707, grano al 4% (el mismo feTurbulence de app.css:67, horneado), lockup **con ®** a 560px centrado ópticamente (centrar sobre el cuerpo "54D" ignorando el ®, que cuelga en el margen derecho), debajo "54 DAYS. ONE TRANSFORMATION." en la display condensada, blanco, tracking 0.14em.
- Añadir en `root.tsx` / meta de rutas: `og:image`, `og:title`, `og:type`, `twitter:card=summary_large_image`. Con Meta Ads activo, esta imagen es la creative por defecto de cada link share: hoy ese slot está en blanco.

### 2.5 Safe area y mínimos

- Clear space: **0.5× la altura del lockup** en los cuatro lados (28px de aire por cada 56px de alto). El ® vive dentro del mark, no invade el clear space de otros elementos.
- Mínimos: lockup con ® ≥ 90px de ancho; entre 40–90px usar variante sin ®; debajo de 40px solo la D (favicon).
- Prohibido: recolorear, estirar, aplicar el gradiente amarillo→ámbar de los CTAs al logo, colocarlo sobre foto sin scrim ≥ 40%.

---

## 3. Las tres decisiones

### Decisión 1 — El sistema limpio se queda; el distress vive solo en logo, foto y grano. No se añade ni una textura más.

Tentación obvia: "el logo es grunge, ensuciemos el sistema". Sería un error. La evidencia dice que el contraste ya funciona: en `pricing-desktop-0.png` la tipografía limpia blanca/amarilla del hero convive con el mural corroído de fondo y esa fricción es exactamente la tensión premium del sitio — orden del método vs. sudor del gym. El sitio ya tiene tres portadores de grit sancionados: la **fotografía** (murales distressed en `home-mobile-0`, `pricing-desktop-0`), el **grano global al 4%** (app.css:67) y ahora el **logo real**. Añadir texturas UI (bordes rotos, fondos sucios, display distressed) convertiría dirección de arte en disfraz. El logo distressed sobre sistema quirúrgico es la fórmula Nike/Gymshark: la marca es la única cosa "sucia" y por eso es la protagonista.

### Decisión 2 — Manda el token #FFD200. El logo no se recolorea, el token no se mueve.

Medido en píxeles: el amarillo del logo es **#F8D000** (248,208,0); el sistema usa **#FFD200** (255,210,0). ΔE ≈ 2 — en flat fills lado a lado apenas perceptible; con el logo distressed y separado de los CTAs, imperceptible. Recolorear el master sería tocar un archivo registrado (®) por una diferencia que nadie ve; oscurecer el token a #F8D000 apagaría todos los CTAs un 3% de luminancia para nada. Regla única derivada: no colocar el lockup montado directamente sobre un fill plano #FFD200 (única situación donde el delta se delata) — que de todos modos ya está prohibido por contraste (D amarilla sobre amarillo).

### Decisión 3 — La marca real entra en los cuatro puntos de identidad — nav, footer, favicon, og:image — y el favicon es P0 porque hoy es el de React Router.

El nav lleva el lockup sin ® a 22px (§2.1); el footer convierte su watermark tipográfico en las letterforms reales vía CSS mask conservando el gradiente actual (§2.2); el favicon pasa de **rojo #D0021B de plantilla** a la D amarilla (§2.3) — es el error de marca más objetivo del sitio y cuesta una hora; y se crea el og:image que hoy no existe pese a que el negocio compra tráfico en Meta (§2.4). Dependencia dura: pedir el master vectorial — el PNG de 500px limita el footer a 560px y bloquea cualquier uso print/retina grande.

---

*Archivos citados: `apps/web/app/components/site.tsx` (78-80, 160-162), `apps/web/app/app.css` (14, 67, 86-91, 633-647), `apps/web/public/favicon.ico`, `apps/web/public/images/brand/logo-54d.png`. Screenshots: `home-desktop-0/3`, `home-mobile-0`, `pricing-desktop-0`, `method-desktop-0`.*
