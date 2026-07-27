# SEPARATION SPEC: 54D ON vs 54D Studios (implementacion)

Sintesis ejecutable de docs/marketing/BRAND_SEPARATION.md + LOCAL_SEO.md.
Regla madre: el precio de ON ($54) y su lenguaje de suscripcion (trial, cancel anytime,
book, buy) nunca tocan contexto Studios. Studios es flagship por aplicacion, sin numero.
Scope guard: NO tocar precios de ON, checkout, program landings, admin.
Copy final EN va entre comillas: usar verbatim. Sin em dashes en copy visible.

## Decisiones (donde los docs chocan o callan)

1. Verbo Studios: "Request a consultation" en TODOS los CTAs de contexto Studios.
   "Book a consultation" queda descartado: la border rule 5 de BRAND_SEPARATION banea
   "book" como verbo Studios y el doc es la autoridad de copy final.
2. SEO vs flagship: los title/meta por sede conservan keywords de busqueda ("small group
   training", "transformation gym"): el title habla al buscador, la pagina al cliente.
   Excepcion: la meta de Hallandale pierde "Reserve your spot" (choca con border rule 5);
   cierre nuevo: "Apply for the next Generation." El resto de LOCAL_SEO §1 va verbatim.
3. Separacion por ruta, no por prop: Nav, Footer y SmartAppBanner detectan
   `pathname.startsWith("/studios")` via useLocation() y mutan solos. Toda ruta studio
   futura queda protegida por defecto, sin prop-drilling.
4. Schema: `@type: "ExerciseGym"` (subtipo de LocalBusiness que Google mapea a "Gym"),
   `priceRange: "$$$$"`, sin Offer ni precio. Se shippea YA con los placeholders
   DATO_PENDIENTE de LOCAL_SEO §2; la confirmacion del cliente bloquea GBP y el pin
   exacto de geo, no el deploy del schema. i18n ES: fase aparte, no se implementa.
5. En on.tsx cae tambien el hero "Same training. Same protocol. Same standard." (esta en
   la tabla del problema aunque la seccion 5 no lo pide). La fila "The commitment" de la
   tabla VS conserva "$54 a month" en la columna de ON: es la unica aparicion del precio
   cerca de Studios y es deliberada (el contraste ES la estrategia). No "arreglarla".

---

## 1. home.tsx

**Hero (lineas 156-175).** Titulo queda. `hero-sub` nuevo: "High-intensity training,
personalized nutrition, and a coach who demands more of you, every day for 54 days."
`hero-ctas` pasa a UN solo boton (fuera "Start free. 7 days." y "Explore the studios"):
`<a href="#choose" className="btn btn-primary">Choose how you do it</a>`.

**El chooser.** Mover la `section.split` (lineas 238-294) para que quede INMEDIATAMENTE
despues del `<header className="hero">`, con `id="choose"`. Reordenar: Studios primero
(izquierda desktop), ON segundo. Nueva clase `split-flagship` en el panel Studios para
peso visual mayor (CSS: `.split:has(.split-flagship) { grid-template-columns: 3fr 2fr }`
desktop; en mobile Studios arriba). Contenido:

- Panel Studios (`split-panel split-studios split-flagship`, mantiene el img full-bleed
  absoluto + velo; cambiar foto a `images/studios/coral-gables/class-mural-wide.jpg`):
  - `split-label`: "The flagship experience"
  - `split-title`: "54D Studios"
  - `split-desc`: "The complete method, in person, with a dedicated team of coaches, a
    nutritionist, and a physiotherapist. Admission by Generation: one start date,
    limited places. Miami, Mexico City, Bogotá."
  - `split-footer`: `<Link to="/studios" className="btn btn-ghost">Request a
    consultation</Link>` + `<span className="split-price">By application · Limited
    places per Generation</span>`
- Panel ON (`split-panel split-on`, sin foto, acento amarillo como hoy):
  - `split-label`: "Online, wherever you are"
  - `split-title`: "54D ON"
  - `split-desc`: "The 54-day digital program in the 54D On app: daily training, your
    nutrition protocol, and a real coach in your corner. From $54 a month."
  - `split-footer`: `<Link to="/pricing" className="btn btn-on">Start free. 7 days.</Link>`
    + `<span className="split-price">Cancel anytime</span>`

**Queda igual:** seccion metodo (`#metodo`), photo band comunidad, footer.
**Seccion app (296-358):** queda debajo del chooser (ya lo esta tras el move); el
`day-marker` cambia de "54D On. iOS and Android." a "54D ON · The app". Badges y rating
se quedan: home fuera de /studios es territorio ON.
**Studios index (360-379):** intro nueva antes de `studios-list`: `<p className="lead">`
"Our flagship program runs in five studios across three countries." El
`<span className="studio-cta">Book →</span>` pasa a "Explore →" y el Link gana
`aria-label={`54D ${s.city} transformation program`}`.
**CTA final (381-424):** dos puertas chicas en `hero-ctas`:
`<Link to="/pricing" className="btn btn-primary">Start ON free</Link>` +
`<Link to="/studios" className="btn btn-ghost">Request a Studios consultation</Link>`.

## 2. on.tsx

**Hero sub (linea 844):** reemplazar por "The full 54D program in the 54D On app: your
training, your nutrition protocol, and a real coach in your corner. No gym, no
scheduling excuses." (CTAs del hero quedan igual.)

**Seccion VS (1396-1452), reescritura completa:**
- `day-marker`: "ON vs Studios" → "Which 54D"
- `section-title`: "Which 54D is for you?" (sin span accent, o accent en "for you?")
- Parrafo intro: "One method, two very different programs. 54D ON is your
  transformation, wherever you are, on your schedule. 54D Studios is the flagship: in
  person, by application, with a dedicated team. Neither is a lighter version of the
  other. They are built for different lives."
- Figcaption de la foto: "One method. Two very different ways to live it."
- `VS_STUDIOS` (lineas 355-362) reemplazado entero:

```ts
const VS_STUDIOS: [string, string, string][] = [
  ["What it is", "The 54-day digital program, coached through the 54D On app", "The flagship experience: the method in person, end to end"],
  ["Your team", "A real coach over daily chat", "A dedicated team on the floor: coaches, nutritionist, physiotherapist"],
  ["How you join", "Start today with 7 days free", "By application: a consultation, then your Generation's start date"],
  ["Your group", "A global online community", "Your Generation: limited places, one start date, 54 days together"],
  ["Where", "Wherever you are, with what you have", "Five studios: Miami, Mexico City, Bogotá"],
  ["The commitment", "A subscription you control, from $54 a month", "A private-client level program, discussed in your consultation"],
];
```

- CTAs bajo la tabla (reemplaza el Link ghost de 1445-1449), desiguales a proposito:
  `<Link to="/pricing" className="btn btn-primary">Start free. 7 days.</Link>` +
  `<Link to="/studios" className="btn btn-ghost">Request a consultation</Link>`
- NO tocar: "Thirteen programs. Two ways in." (linea 1060, es membership vs compra
  unica dentro de ON, no cruza productos), VS_APPS, FAQ, precios.

## 3. studios.tsx

**meta:** title "54D Studios: The Flagship Experience in 3 Countries"; description:
"The 54D Method in person: a dedicated team of coaches, nutritionist, and physiotherapy.
Admission by Generation, by application. Miami, Mexico City, Bogotá."
**Hero:** `day-marker` → "54D Studios · The flagship experience". `hero-sub` →
"The complete method with a dedicated team on one outcome: coaches, a nutritionist, and
a physiotherapist assigned to your Generation." CTAs quedan ("Find your studio" +
"Explore 54D ON") pero debajo va el guardrail, `<p>` chico estilo `method-desc`:
"54D Studios is our flagship tier, a private-client level program. Your consultation
covers fit, your Generation's start date, and the investment."
**Cards de sedes (188-222):** "Book →" → "Explore →"; el Link gana
`aria-label={`54D ${cityLabel(s.city)} transformation program`}`.
**GENERATION_TIMELINE[0]:** title "Reserve your spot" → "Request a consultation"; desc:
"Admission is by Generation: one start date, limited places, no rolling entry. Your
consultation covers fit, dates, and the investment."
**Copy sweep:** en la intro de Generations, "It's a commitment with a date." queda;
anadir tras el parrafo: "You are measured on day 1 and on day 54. The numbers are the
contract." Photo band y CTA final a ON quedan como estan (el cruce "No studio in your
city?" es bueno y aprobado).

## 4. studio-detail.tsx

**Nuevo archivo `app/data/studio-schema.ts`:** pegar verbatim el bloque TS de
LOCAL_SEO.md §2 (ORG, HOURS, STUDIO_SCHEMA con PostalAddress + geo + telephone +
openingHoursSpecification + priceRange "$$$$" + sameAs + parentOrganization). Anadir y
exportar `BREADCRUMB_SCHEMA(slug, name)` segun §4 (BreadcrumbList de 3 niveles).
**Schema inline (397-410):** reemplazar el objeto plano por DOS scripts JSON-LD:
`STUDIO_SCHEMA[studio.slug]` y el BreadcrumbList. Fallback: si el slug no esta, no
renderizar (nunca el schema viejo con address string).
**meta():** nuevo record `LOCAL_META: Record<string,{title,desc}>` con los 5 title/meta
de LOCAL_SEO §1 verbatim (Hallandale con el cierre "Apply for the next Generation.").
`meta()` lo usa por slug; fallback al formato actual.
**Hero:** breadcrumb UI encima del H1 dentro de `hero-content` (links chicos:
"54D / Studios / 54D {city}", el ultimo sin link). H1 queda "54D {city}" (brand-first).
`hero-sub` queda (ZONE ya da la zona local). CTAs: primario pasa de "Reserve your spot"
a "Request a consultation" (mismo `href="#reserva"`); WhatsApp ghost queda.
**Seccion Next Generation:** lead nuevo: `Yours starts {generation.start}. Admission is
by Generation: one start date, limited places, no rolling entry.` Stat label "Spots per
Generation" → "Places per Generation". CTA → "Request a consultation".
**Photo band graduacion:** CTA → "Request a consultation". Texto queda (graduation as
proof es senal de valor).
**Location panel:** anadir el bloque de contenido local de LOCAL_SEO §3 verbatim (nuevo
record `LOCAL_COPY: Record<string,string>`, parrafo `method-desc` bajo la address).
Reemplazar "Also in {country}" por bloque "All 54D Studios" con links a las 5 sedes
(cross-country, reparte autoridad).
**Form (seccion #reserva):** `day-marker` "Reserve" → "Apply". H2: "Apply for your place
in the next {accent}Generation.{/accent}" Lead: guardrail verbatim ("54D Studios is our
flagship tier, a private-client level program. Your consultation covers fit, your
Generation's start date, and the investment."). Boton submit: "Reserve your spot" →
"Request a consultation". Success: titulo "Application received." y body "We will reach
out on WhatsApp to schedule your consultation." (fuera "Your spot is held").
**Nunca en esta pagina:** precio de ON, trial, badges de app, links a /pricing. El CTA
final "Not close by? Do the method online." → /on queda: cruce honesto aprobado.

## 5. site.tsx + root.tsx (globales)

**site.tsx / Nav:** `const { pathname } = useLocation(); const inStudios =
pathname.startsWith("/studios");` El CTA del nav (desktop y drawer) muta: si
`inStudios`, `<Link to="/studios#sedes" className="btn btn-ghost btn-nav">Request a
consultation</Link>`; si no, queda "Start free. 7 days." → /pricing. NAV_LINKS quedan.
**site.tsx / Footer:** mismo `inStudios`. Cuando true: NO renderizar `AppStoreBadges` y
la `footer-trust` ("7 days free / Cancel anytime / 30-day guarantee" es lenguaje de
suscripcion) se reemplaza por: `<span>By application</span><span>Limited places per
Generation</span><span>Miami · Mexico City · Bogotá</span>`. El link "Pricing" de la
columna Programs se oculta en studios (border rule 6). Resto del footer queda.
**root.tsx (linea 95):** `SmartAppBanner` promociona la app 54D On: no montar en
`/studios*`. Gate por pathname dentro del componente (misma tecnica useLocation).

---

## Checklist de aceptacion (8 puntos medibles)

1. Cero menciones del precio de ON en paginas studios: grep de "$54", "$49", "/mo",
   "a month" sobre el HTML renderizado de /studios y las 5 /studios/:slug da 0 (incluye
   nav, footer y banner).
2. Schema LocalBusiness valido en las 5: cada /studios/:slug emite JSON-LD ExerciseGym
   con PostalAddress, geo, openingHoursSpecification y priceRange, y las 5 pasan el
   Google Rich Results Test sin errores.
3. El home presenta dos puertas no equivalentes: chooser inmediatamente despues del
   hero, Studios primero y con mayor peso visual (3fr vs 2fr), sin precio ni trial en su
   panel; ON con "From $54 a month" y "Start free. 7 days." visibles. Cero CTAs de
   checkout antes del chooser.
4. Cero badges "54D On" app en studios: grep de AppStoreBadges/SmartAppBanner y de los
   dominios apps.apple.com / play.google.com en el HTML de rutas /studios* da 0.
5. Cero verbos de carrito en contexto Studios: grep de "Book", "Buy", "Reserve your
   spot", "checkout", "subscription", "plan" en /studios*, en el panel Studios del home
   y en la columna Studios de la tabla VS da 0; todo CTA Studios dice "Request a
   consultation" (o "Explore →" en indices).
6. "The same method. Two ways in.", "Same training. Same protocol. Same standard." y
   "share the same program and the same standard" eliminados del repo (grep = 0); la
   tabla VS renderiza el heading "Which 54D is for you?" con exactamente 6 filas nuevas.
7. Guardrail line ("flagship tier, a private-client level program... the investment")
   presente y verbatim en studios.tsx (hero) y en las 5 studio-detail (form), y el
   success del form dice "Application received", no "Your spot is held".
8. Local SEO on-page en las 5 sedes: title y meta description por slug segun LOCAL_SEO
   §1 (Hallandale sin "Reserve your spot"), BreadcrumbList JSON-LD + breadcrumb UI, y
   bloque de contenido local de 60-72 palabras con zonas/vias reales en cada detail.
