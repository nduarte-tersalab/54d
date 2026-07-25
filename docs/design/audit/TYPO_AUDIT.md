# 54D — Auditoría tipográfica (nivel jurado)

**Fecha:** 2026-07-25
**Alcance:** solo tipografía. Evidencia: 24 screenshots (`scratchpad/audit/`) + `apps/web/app/app.css`.
**Veredicto corto:** la dirección display es correcta (condensada bold uppercase, negro/amarillo). Lo que se siente "template" es casi todo **texto corrido**: el body también es condensada, las medidas de línea se van a 90+ caracteres, y hay 9 valores distintos de letter-spacing sin sistema. El cliente tiene razón: el problema está en los párrafos.

---

## 1. HALLAZGO CENTRAL — Condensada en texto corrido (confirmado)

**Hipótesis del cliente: CONFIRMADA.** `--font-body: 'Helvetica Neue Condensed', 'Archivo Narrow', ...` (`app.css:35`) aplica una condensada a TODO el body.

**Evidencia:**
- `home-desktop-0.png` — el sub del hero ("High-intensity training, personalized nutrition…") se lee apretado: los blancos internos de las letras son estrechos, los ascendentes se tocan visualmente y la línea se vuelve una tira gris comprimida sobre foto. A 1.15rem con `max-width: 34rem` la condensada mete ~70 caracteres por línea.
- `method-desktop-1.png` — los párrafos del timeline ("Initial assessment: measurements, level, history, and goal. Your protocol is built on your data, not on a…") corren a **~90–105 caracteres por línea** (`.timeline-item p { max-width: 38rem }` + condensada). El ideal editorial es 55–70. Esto, más que cualquier otra cosa, es lo que se percibe como "barato".
- `pricing-mobile-0.png` — el párrafo del hero a 4 líneas condensadas sobre foto: textura de clasificado de periódico, no de marca premium.
- `home-desktop-3.png` (footer) — links y legal en condensada 0.95/0.8rem: a tamaños pequeños la condensada pierde aún más legibilidad y suma a la sensación de plantilla.

**Por qué pasa:** las marcas que 54D quiere como pares (Nike, Barry's, Represent, On) usan condensada **solo en display** — titulares, cifras, eyebrows. El texto corrido siempre va en un grotesco de ancho normal. Cuando display y body comparten la misma compresión, desaparece el contraste de voz: todo grita con el mismo timbre y nada se lee cómodo.

**Recomendación (concreta):**

```css
/* Display: se queda condensada/extendida — es la voz de la marca */
--font-display: 'Allumi Std Extended', 'Archivo', 'Arial Narrow', sans-serif;

/* Body: grotesco de ancho NORMAL con fallbacks de sistema reales */
--font-body: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Roboto, Arial, sans-serif;

/* Cuando lleguen las woff2 del cliente:
   Helvetica Neue Condensed queda RESERVADA para eyebrows, captions,
   labels y cifras — nunca para <p>. Si se quiere Helvetica en body,
   es 'Helvetica Neue' (Roman 400/500), no la Condensed. */
--font-label: 'Helvetica Neue Condensed', 'Archivo Narrow', sans-serif; /* solo caps cortas */
```

Al pasar a ancho normal, **recalibrar medidas**: los `max-width` actuales fueron dimensionados para condensada y quedarán bien casi sin tocar (34rem ≈ 62ch en Archivo normal), pero `.timeline-item p` debe bajar de 38rem a **34rem**, y `.hero-sub` puede quedarse en 34rem.

---

## 2. Escala y jerarquía: real vs percibida

**Lo que funciona:** hero (`home-desktop-0.png`) — "54 DAYS. / ONE TRANSFORMATION." con `line-height: 0.94` y el acento en gradiente es el mejor momento tipográfico del sitio. Los eyebrows con regla amarilla (`method-desktop-0.png`, "WHAT IS 54D") son dirección de arte real.

**Lo que falla:**

1. **Todas las secciones gritan igual.** Cada H2 usa el mismo `--text-h2` con patrón blanco+amarillo ("THE WHOLE METHOD. **NO FILLER.**", "EVERY PLAN INCLUDES **EVERYTHING.**", "THE SAME METHOD. **TWO WAYS IN.**" — `on-desktop-0/2.png`, `pricing-desktop-1.png`). A la cuarta repetición el acento amarillo deja de significar jerarquía y se vuelve wallpaper. Reservar el acento gradiente para hero + CTA final; los H2 intermedios en blanco sólido, o acento amarillo plano `#FFD200` sin gradiente.
2. **Los números dominan a los títulos.** `pricing-desktop-1.png`: "01/02/03/04" a 2.6rem amarillo vs título "DAILY TRAINING" a ~1.35rem blanco — el ojo lee el ornamento antes que el contenido. Bajar numerales a 1.6rem, `--c-faint`, o alinearlos como superíndice del título.
3. **Salto débil título-de-card → body.** `.method-name` 1.25rem vs `.method-desc` 0.98rem es un salto de 1.27× — en la percepción casi no hay jerarquía dentro de la card (`pricing-desktop-1.png`). Con body a ancho normal 1rem, subir títulos de card a 1.35–1.5rem.
4. **No existe párrafo lead.** Los intro laterales ("54D is a 54-day body-transformation program…", `method-desktop-0.png`) usan el mismo estilo que cualquier `<p>`. Definir `.lead { font-size: 1.25rem; line-height: 1.55; color: var(--c-white); font-weight: 450; }` para el primer párrafo de cada sección — es el truco más barato para que el texto se sienta editorial y no de template.

**Escala propuesta (exacta):**

```css
--text-hero: clamp(2.6rem, 6.5vw, 6.75rem);   /* lh 0.92, tracking -0.01em */
--text-h2:   clamp(2rem, 4.2vw, 3.4rem);      /* lh 0.98 */
--text-h3:   1.4rem;                           /* card titles, lh 1.1 */
--text-lead: 1.25rem;                          /* lh 1.55, blanco pleno */
--text-body: 1rem;                             /* lh 1.65, --c-mist */
--text-sm:   0.875rem;                         /* lh 1.5, legal/captions largas */
--text-cap:  0.75rem;                          /* caps + tracking, lh 1 */
```

Line-heights de body: con condensada, 1.55 quedaba corto (columnas densas en `method-desktop-1.png`); con ancho normal usar **1.6–1.65** en 1rem y **1.5** en 0.875rem.

---

## 3. Letter-spacing en caps: 9 valores, cero sistema

Auditoría de `app.css`: tracking en uso = `0.06 / 0.1 / 0.14 / 0.16 / 0.18 / 0.2 / 0.22 / 0.24 / 0.26em`. Nueve pasos para el mismo gesto (caps chicas espaciadas). Visible comparando el eyebrow "WHAT'S INCLUDED" (`on-desktop-0.png`, 0.24em), el label "IN PERSON. 5 STUDIOS." (`home-mobile-1.png`, 0.26em — se desintegra: los espacios superan el ancho de letra), el nav (0.14em) y "DOWNLOAD ON THE" en los badges (0.18em a 0.62rem, `home-desktop-2.png` — por debajo de 10px con ese tracking parece ruido, no texto).

**Tokens propuestos (3, no 9):**

```css
--track-btn:   0.07em;  /* botones, 0.9-0.95rem caps */
--track-label: 0.14em;  /* nav, breadcrumbs, labels ≥0.78rem */
--track-eyebrow: 0.22em; /* eyebrows y captions cortas — TOPE máximo */
```

Regla: nada por encima de 0.22em; nada con tracking por debajo de 0.68rem de tamaño (subir los `small` de `.store-badge` de 0.62rem a 0.7rem).

---

## 4. Roturas y accidentes visibles

- **`home-mobile-0.png` — "TRANSFORMATION." toca/rebasa el borde derecho del viewport.** El clamp min de `--text-hero` (2.4rem) no cabe con una palabra de 15 caracteres a 390px. Fix: `--text-hero: clamp(2.1rem, 10.5vw, 6.75rem)` o versión corta del titular en mobile. Un hero que clipa es descalificación inmediata en jurado.
- **`home-desktop-1.png` — párrafo sobre foto sin apoyo.** "Every program runs as a generation…" en `--c-mist` sobre la foto de grupo: contraste al límite en la zona clara del muro. El scrim existe en el hero pero no aquí; añadir `text-shadow: 0 1px 24px rgba(7,7,7,.6)` o extender el veil.
- **`method-desktop-2.png` — "Yes / No" rompe el sistema.** Son las dos únicas palabras del sitio en title-case display grande. Todo el resto del display es uppercase. O "YES / NO" uppercase, o convertirlas en eyebrow + título. Hoy parecen de otro sitio.
- **`pricing-desktop-2.png` — preguntas del FAQ en caps display.** "WHAT'S THE COACH LIKE? IS IT A REAL PERSON?" — una pregunta conversacional en caps condensadas pierde la voz humana que el copy intenta tener. Preguntas en sentence case, body font 1.05rem/600; la respuesta ya está bien.
- **`studio-cg-desktop-2.png` — horarios sin numerales tabulares.** "5:30 AM to 9:00 PM" alineado a la derecha con cifras proporcionales baila verticalmente. `font-variant-numeric: tabular-nums` en `.schedule`, precios y ratings.
- **`home-desktop-2.png` — badges de app tipográficos sin icono.** Como sistema de texto puro podría ser una decisión (borde 1px, dos líneas), pero a `border-radius: 2px` junto a botones pill y cards de 28px lee como placeholder sin terminar, no como decisión. O badges oficiales de Apple/Google, o compromiso total con la versión tipográfica: añadir glifo  y ▶ inline, radius 999px como el resto de CTAs. (Los radios 2/4/12/20/28/42/999px son inconsistencia real que el cliente ya huele; consolidar en 4 tokens: `2px | 12px | 24px | 999px`.)
- **Nav: "54D" en texto plano ignora el logo oficial** (`public/images/brand/logo-54d.png`, "54" blanco + "D" amarillo distressed + ®). El wordmark limpio del nav (`home-desktop-0.png`) borra la única textura gráfica propietaria que tiene la marca — la misma que sí aparece pintada en la pared de las fotos (`pricing-desktop-0.png`). Usar el logo como imagen (~30px de alto) o recrear el "D" amarillo: `<span class="nav-logo">54<em>D</em></span>` ya está soportado en CSS (`app.css:91`) y no se usa en el sitio público.

---

## 5. Qué NO tocar

- Hero display con lh 0.92–0.94 y punto final en titulares ("54 DAYS. ONE TRANSFORMATION.") — voz de marca correcta.
- Eyebrow con regla amarilla de 26px — distintivo, consistente en todas las páginas.
- Captions de foto ("EVERY REP, WATCHED", `studio-cg-desktop-1.png`) — 0.68rem caps con regla amarilla: el mejor detalle tipográfico del sitio; es el patrón a extender, no los badges.
- Footer gigante "54D" en gradiente al 14% — bien medido, no compite.

---

## Prioridad de implementación

| # | Cambio | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 1 | Body a ancho normal + medidas 34rem + lh 1.65 | 1 línea CSS + QA | El 60% del "todavía le falta" |
| 2 | Fix clip de hero en mobile | 1 línea | Elimina un descalificador |
| 3 | Tokens de tracking (3) y de radius (4) | 30 min | Consistencia perceptible |
| 4 | Acento amarillo solo en hero + CTA final; numerales de card degradados | 1 h | Recupera jerarquía |
| 5 | `.lead` + FAQ en sentence case + tabular-nums | 1 h | Voz editorial |
| 6 | Logo real en nav; badges: oficial o compromiso tipográfico | 1 h | Marca, no template |
