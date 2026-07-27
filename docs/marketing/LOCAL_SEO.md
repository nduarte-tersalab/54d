# LOCAL SEO: 54D Studios (5 sedes)

Alcance: /studios y /studios/:slug. Sitio EN. Para CDMX y Bogotá las keywords ES son
RECOMENDACION para la fase i18n; la implementacion actual queda en EN con hreflang pendiente.
Fuente de NAP: apps/web/app/data/studios.ts (direcciones y WhatsApp son PLACEHOLDER: todo
dato marcado DATO_PENDIENTE debe confirmarse con el cliente antes de indexar).

## 1. Metadata por sede

### Coral Gables (US)
- Title (55): `Private Group Transformation Gym in Coral Gables | 54D`
- Meta (147): `54 days, small groups, coaches on the floor, nutrition and physiotherapy on Ponce de Leon Blvd. Join the next Generation at 54D Coral Gables.`
- H1: `54D Coral Gables` con sub local visible: "On Ponce de Leon Blvd, Coral Gables"
- Keywords EN: `body transformation program coral gables`, `small group training coral gables`, `luxury gym coral gables`

### Hallandale (US)
- Title (57): `Small Group Transformation Gym in Hallandale Beach | 54D`
- Meta (150): `The 54D Method between Miami and Fort Lauderdale: 54 days, fixed groups, coaches, nutrition and physio on Hallandale Beach Blvd. Reserve your spot.`
- H1: `54D Hallandale` con sub local: "On Hallandale Beach Blvd, minutes from Aventura"
- Keywords EN: `transformation program hallandale beach`, `small group training hallandale`, `gym near aventura fl`

### Mexico City Carso (MX)
- Title (52): `54 Day Transformation Program in Polanco | 54D CDMX`
- Meta (145): `Train the 54D Method steps from Plaza Carso in Nuevo Polanco: small groups, coaches, nutrition and physiotherapy. Next Generation starting soon.`
- H1: `54D Mexico City Carso` con sub local: "In Nuevo Polanco, by Plaza Carso"
- Keywords ES (fase i18n, NO implementar en EN): `gimnasio en polanco`, `programa de transformacion cdmx`, `entrenamiento en grupos pequenos polanco`

### Mexico City Santa Fe (MX)
- Title (54): `54 Day Transformation Program in Santa Fe | 54D CDMX`
- Meta (143): `The 54D Method in the corporate heart of Santa Fe, CDMX: fixed Generations, coaches on the floor, nutrition and physio. Limited spots per start.`
- H1: `54D Mexico City Santa Fe` con sub local: "On Av. Vasco de Quiroga, Santa Fe"
- Keywords ES (fase i18n): `gimnasio santa fe cdmx`, `entrenamiento personalizado santa fe`, `programa 54 dias cdmx`

### Bogota (CO)
- Title (52): `54 Day Transformation Program in Bogota | 54D`
- Meta (141): `Train the 54D Method steps from Parque de la 93 in Chapinero: small groups, coaches, nutrition and physiotherapy. Join the next Generation.`
- H1: `54D Bogota` con sub local: "In Chapinero, steps from Parque de la 93"
- Keywords ES (fase i18n): `gimnasio parque de la 93`, `programa de transformacion bogota`, `entrenamiento en grupos pequenos chapinero`

Nota: el patron "ciudad + servicio de alto valor" va en el title; el H1 conserva la marca
(54D + ciudad) porque el hero es brand-first, y la ciudad + zona se refuerza en el hero-sub.

## 2. Schema.org JSON-LD (ExerciseGym)

Decision: `ExerciseGym` (mas especifico que HealthClub y es la categoria que Google mapea a
"Gym"). El schema actual en studio-detail.tsx usa address como string plano: reemplazar por
PostalAddress. Listo para pegar como objeto TS (Record por slug), con la URL del sitio como
constante:

```ts
// apps/web/app/data/studio-schema.ts
const ORG = { "@type": "Organization", name: "54D", url: "https://54d.com" };
const HOURS = [
  { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "05:30", closes: "21:00" },
  { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "12:00" },
]; // Del SCHEDULE actual (PLACEHOLDER fase 1: confirmar por sede con Mindbody)

export const STUDIO_SCHEMA: Record<string, object> = {
  "coral-gables": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Coral Gables", url: "https://54d.com/studios/coral-gables",
    address: { "@type": "PostalAddress", streetAddress: "2222 Ponce de Leon Blvd", // DATO_PENDIENTE
      addressLocality: "Coral Gables", addressRegion: "FL", postalCode: "33134", addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: 25.7509, longitude: -80.2577 },
    telephone: "+13055550154", // DATO_PENDIENTE
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], // DATO_PENDIENTE: handle por sede si existe
    parentOrganization: ORG,
  },
  hallandale: {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Hallandale", url: "https://54d.com/studios/hallandale",
    address: { "@type": "PostalAddress", streetAddress: "1000 E Hallandale Beach Blvd", // DATO_PENDIENTE
      addressLocality: "Hallandale Beach", addressRegion: "FL", postalCode: "33009", addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: 25.9857, longitude: -80.1300 },
    telephone: "+19545550154", // DATO_PENDIENTE
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
  "mexico-carso": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Mexico City Carso", url: "https://54d.com/studios/mexico-carso",
    address: { "@type": "PostalAddress", streetAddress: "Lago Zurich 245, Ampliacion Granada", // DATO_PENDIENTE
      addressLocality: "Miguel Hidalgo", addressRegion: "CDMX", postalCode: "11529", addressCountry: "MX" },
    geo: { "@type": "GeoCoordinates", latitude: 19.4404, longitude: -99.2046 },
    telephone: "+525555550154", // DATO_PENDIENTE
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
  "mexico-santa-fe": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Mexico City Santa Fe", url: "https://54d.com/studios/mexico-santa-fe",
    address: { "@type": "PostalAddress", streetAddress: "Av. Vasco de Quiroga 3800", // DATO_PENDIENTE
      addressLocality: "Cuajimalpa", addressRegion: "CDMX", postalCode: "05348", addressCountry: "MX" },
    geo: { "@type": "GeoCoordinates", latitude: 19.3599, longitude: -99.2743 },
    telephone: "+525555550155", // DATO_PENDIENTE
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
  bogota: {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Bogota", url: "https://54d.com/studios/bogota",
    address: { "@type": "PostalAddress", streetAddress: "Cra. 11 #93-10, Chapinero", // DATO_PENDIENTE
      addressLocality: "Bogota", addressRegion: "Bogota D.C.", addressCountry: "CO" },
    geo: { "@type": "GeoCoordinates", latitude: 4.6768, longitude: -74.0484 },
    telephone: "+573005550154", // DATO_PENDIENTE
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
};
```

Geo: coordenadas aproximadas de la zona (Ponce de Leon Blvd, Hallandale Beach Blvd, Plaza
Carso, Vasco de Quiroga y Parque de la 93). Ajustar al pin exacto de GBP cuando exista.

## 3. Bloque de contenido local por sede (EN, para la pagina de la sede)

**Coral Gables (72w).** Our Coral Gables studio sits on Ponce de Leon Blvd, minutes from
Miracle Mile and the Douglas Road Metrorail station. Members drive in from Coconut Grove,
South Miami and Brickell for one reason: a 54 day program you cannot get anywhere else in
Miami. Street and garage parking are easy before the 5:30 AM sessions, and you can be back
on US 1 before the city wakes up.

**Hallandale (66w).** 54D Hallandale sits on Hallandale Beach Blvd just off I-95, the
halfway point between Miami and Fort Lauderdale. Members come from Aventura, Hollywood,
Sunny Isles and Golden Beach, most within a ten minute drive. Morning Generations finish
before the Gulfstream Park traffic starts, and the studio's location makes it the natural
home for the method in Broward County.

**Mexico City Carso (70w).** In Nuevo Polanco, steps from Plaza Carso and the Museo
Soumaya, our studio serves the executives and families of Polanco, Granada and Irrigacion.
Lago Zurich is minutes from Ejercito Nacional and Ferrocarril de Cuernavaca, with parking
in the Carso complex. Early Generations let you train, shower and be at your office on
Mariano Escobedo or Paseo de la Reforma before 8 AM.

**Mexico City Santa Fe (63w).** Our Santa Fe studio sits on Av. Vasco de Quiroga, in the
corporate district that runs from Centro Santa Fe to Parque La Mexicana. If you work in the
towers of Santa Fe or live in Bosques de las Lomas, Interlomas or Contadero, your
Generation trains here: before the office, or right after, without crossing the city.

**Bogota (65w).** 54D Bogota lives in Chapinero, steps from Parque de la 93 on Carrera 11.
The studio draws members from Chico, Rosales and Usaquen, many walking over from the
offices along the Calle 93 corridor. Sessions start at 5:30 AM, before the Septima fills
up, and the neighborhood's cafes have adopted our Generations as their post workout ritual.

## 4. Estructura

**Breadcrumbs (JSON-LD por pagina de sede, mas visible en UI encima del H1):**
```ts
{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
  { "@type": "ListItem", position: 1, name: "54D", item: "https://54d.com/" },
  { "@type": "ListItem", position: 2, name: "Studios", item: "https://54d.com/studios" },
  { "@type": "ListItem", position: 3, name: "54D Coral Gables" }, // por sede
]}
```

**Interlinking:**
- /studios ya enlaza a las 5 sedes (cards): OK. Anadir anchor descriptivo (aria-label con
  ciudad + "transformation program") en el "Book" generico.
- studio-detail ya enlaza a sedes hermanas del mismo pais ("Also in ..."): extender a las 5
  sedes (cross-country footer block "All 54D Studios") para repartir autoridad.
- Cada sede debe enlazar de vuelta a /studios (breadcrumb UI) y a /method (contexto).
- Quitar de las paginas de Studios cualquier badge o CTA de la app "54D On": Studios se
  administra por Mindbody con su propia app de miembros. Es la app equivocada y ademas
  contamina la separacion de productos que pide el cliente.

**Google Business Profile (nota para el cliente, por sede):**
- Crear o reclamar 1 perfil por sede con categoria principal "Gym" y secundarias
  "Personal trainer", "Nutritionist" (si aplica en la region).
- NAP identico al sitio: mismo nombre ("54D Coral Gables"), misma direccion y telefono que
  studios.ts y el schema. Hoy direcciones y WhatsApp son PLACEHOLDER: bloquea GBP.
- Fotos: minimo 10 por sede (fachada, floor, coaches, graduacion). CG y Hallandale ya
  tienen galeria propia; CDMX x2 y Bogota estan pendientes (hoy usan fotos genericas).
- Enlace del perfil a la URL de la sede (/studios/:slug), no al home.
- Horarios de GBP identicos al SCHEDULE del sitio, y pedir resenas a cada Generacion
  graduada (el momento de mayor euforia: dia 54).

## 5. Nota i18n (fase aparte, no implementar ahora)

Local SEO en ingles para CDMX y Bogota es estructuralmente debil: las busquedas locales son
en espanol. Recomendacion: rutas /es/ con hreflang en-US/es-MX/es-CO, titles y H1 en ES
usando las keywords de la seccion 1, y el mismo schema (el JSON-LD es idioma neutral).
Mientras tanto el schema + GBP en ES capturan parte del intent local sin tocar el sitio EN.
