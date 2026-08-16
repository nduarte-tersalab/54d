import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/studio-detail";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS, cityLabel } from "../data/studios";
import { asset } from "../lib/asset";
import { resolveLang, useLang, type Lang } from "../lib/i18n";
import { DIAL_CODES, FREQUENT_ISO, isoFlag } from "../data/dial-codes";
import { GOOGLE_REVIEWS } from "../data/testimonials";

/* ============================================================
   /studios/:slug: detalle de sede (54D Studios)
   Funnel: conversión presencial high-ticket. El form de leads
   se mantiene (POST /leads, sync Mindbody) pero reencuadrado
   como aplicación/consulta: todo CTA dice "Request a
   consultation" (SEPARATION_SPEC §4). Copy según
   SITE_STRATEGY.md y COPY_V3.md (sin em/en dashes en copy
   visible). Local SEO: LOCAL_SEO.md §1 a §4 (metas, schema
   ExerciseGym + BreadcrumbList, bloque local por sede).
   Fotos: galería real de Coral Gables (IMAGES_CG.md); resto de
   sedes con fotos de marca genéricas (IMAGES_BRAND.md).
   ============================================================ */

/* Clase de schedule live (shape del endpoint /mindbody/classes de la API) */
type LiveClass = {
  id: number;
  name: string;
  staff: string;
  start: string;
  end: string;
  location: string;
  locationId: number;
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const studio = STUDIOS.find((s) => s.slug === params.slug);
  if (!studio) throw new Response("Not Found", { status: 404 });
  /* Numeros placeholder (555) no viajan ni en el payload de hidratacion:
     se vacian hasta que el cliente cargue los reales en data/studios.ts */
  const whatsapp = studio.whatsapp.includes("555") ? "" : studio.whatsapp;

  /* Schedule live desde Mindbody via nuestra API (cacheada 10 min en el
     edge). Fail-soft SIEMPRE: sin go-live, sin red o sin match de sede
     devuelve [] y la UI cae a los horarios estaticos. El match por
     nombre ("54D Coral Gables" contiene la ciudad) activa la grilla
     sola cuando el site productivo se encienda. */
  let liveClasses: LiveClass[] = [];
  try {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8788";
    const res = await fetch(`${apiUrl}/mindbody/classes?days=7`, {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = (await res.json()) as { classes?: LiveClass[] };
      const city = cityPlain(studio.city).toLowerCase();
      liveClasses = (data.classes ?? [])
        .filter((k) => k.location.toLowerCase().includes(city))
        .slice(0, 60);
    }
  } catch {
    /* silencio: los horarios estaticos cubren */
  }

  return { studio: { ...studio, whatsapp }, liveClasses, lang: resolveLang(request) };
}

/* Display de ciudad: cityLabel compartido y localizado (data/studios.ts),
   misma fuente que footer e index. cityPlain queda local: es la forma
   SEO/schema ("Mexico City Carso"), donde el middle dot no va (COPY_V3
   §2). Escape unicode a propósito: el em dash literal está prohibido
   en apps/web/app (CI grep). */
const cityPlain = (city: string) =>
  city.replace(/\s*(?:\u2014|\u00B7)\s*/g, " ");

/* Title + meta description por sede: LOCAL_SEO.md §1 verbatim.
   Excepción (SEPARATION_SPEC decisión 2): Hallandale cierra con
   "Apply for the next Generation." en vez del cierre original con
   verbo de carrito (border rule 5 de BRAND_SEPARATION). */
const LOCAL_META: Record<string, Record<"en" | "es", { title: string; desc: string }>> = {
  "coral-gables": {
    en: {
      title: "Private Group Transformation Studio in Coral Gables | 54D",
      desc: "54 days, small groups, coaches on the floor, nutrition and physiotherapy on Ponce de Leon Blvd. Join the next Generation at 54D Coral Gables.",
    },
    es: {
      title: "Studio de transformación en grupos privados en Coral Gables | 54D",
      desc: "54 días, grupos reducidos, coaches en el piso, nutrición y fisioterapia en Ponce de Leon Blvd. Únete a la próxima Generación en 54D Coral Gables.",
    },
  },
  hallandale: {
    en: {
      title: "Small Group Transformation Studio in Hallandale Beach | 54D",
      desc: "The 54D Method between Miami and Fort Lauderdale: 54 days, fixed groups, coaches, nutrition and physio at 601 N Federal Hwy. Apply for the next Generation.",
    },
    es: {
      title: "Studio de transformación en grupos reducidos en Hallandale Beach | 54D",
      desc: "El Método 54D entre Miami y Fort Lauderdale: 54 días, grupos fijos, coaches, nutrición y fisioterapia en 601 N Federal Hwy. Aplica a la próxima Generación.",
    },
  },
  "mexico-carso": {
    en: {
      title: "54 Day Transformation Program in Polanco | 54D CDMX",
      desc: "Train the 54D Method steps from Plaza Carso in Nuevo Polanco: small groups, coaches, nutrition and physiotherapy. Next Generation starting soon.",
    },
    es: {
      title: "Programa de transformación de 54 días en Polanco | 54D CDMX",
      desc: "Entrena el Método 54D a pasos de Plaza Carso en Nuevo Polanco: grupos reducidos, coaches, nutrición y fisioterapia. Próxima Generación por comenzar.",
    },
  },
  "mexico-santa-fe": {
    en: {
      title: "54 Day Transformation Program in Santa Fe | 54D CDMX",
      desc: "The 54D Method in the corporate heart of Santa Fe, CDMX: fixed Generations, coaches on the floor, nutrition and physio. Limited spots per start.",
    },
    es: {
      title: "Programa de transformación de 54 días en Santa Fe | 54D CDMX",
      desc: "El Método 54D en el corazón corporativo de Santa Fe, CDMX: Generaciones fijas, coaches en el piso, nutrición y fisioterapia. Cupos limitados por inicio.",
    },
  },
  bogota: {
    en: {
      title: "54 Day Transformation Program in Bogota | 54D",
      desc: "Train the 54D Method steps from Parque de la 93 in Chapinero: small groups, coaches, nutrition and physiotherapy. Join the next Generation.",
    },
    es: {
      title: "Programa de transformación de 54 días en Bogotá | 54D",
      desc: "Entrena el Método 54D a pasos del Parque de la 93 en Chapinero: grupos reducidos, coaches, nutrición y fisioterapia. Únete a la próxima Generación.",
    },
  },
};

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "54D Studios" }];
  const { studio } = loaderData;
  const local = LOCAL_META[studio.slug]?.[loaderData.lang ?? "en"];
  if (local) {
    return [{ title: local.title }, { name: "description", content: local.desc }];
  }
  /* Fallback (formato previo) para slugs futuros sin metadata local */
  return [
    { title: `54D ${cityPlain(studio.city)}: Join the Next Generation` },
    {
      name: "description",
      content: `The 54D Method in ${cityPlain(studio.city)}: small-group training with a coach, nutrition, and physiotherapy. Next Generation starting soon. Limited spots.`,
    },
  ];
}

/* ============================================================
   Schema.org JSON-LD: LOCAL_SEO.md §2 verbatim. ExerciseGym es
   subtipo de LocalBusiness (la categoria que Google mapea a
   "Gym"). Flagship: priceRange "$$$$", sin Offer ni precio.
   Direcciones, telefonos y geo son DATO_PENDIENTE del cliente:
   bloquean GBP y el pin exacto, no el deploy del schema.
   El spec ubica este bloque en app/data/studio-schema.ts; queda
   inline porque esta ruta es hoy su unico consumidor. Extraer
   tal cual cuando otra ruta lo necesite.
   ============================================================ */
const ORG = { "@type": "Organization", name: "54D", url: "https://54d.com" };
/* Horarios en schema: OMITIDOS en TODAS las sedes hasta tener la tabla
   semanal real por sede (mismo criterio deliberado de CG/HL): un schema
   de horas placeholder que contradice al GBP resta consistencia local. */

const STUDIO_SCHEMA: Record<string, object> = {
  /* CG + Hallandale: NAP VERIFICADO contra el Google Business Profile real
     (30/07/2026, links de Maps del cliente). Los horarios se omiten hasta
     tener la tabla semanal completa: un schema de horas que contradice al
     GBP resta consistencia local, no suma. */
  "coral-gables": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Coral Gables", url: "https://54d.com/studios/coral-gables",
    address: { "@type": "PostalAddress", streetAddress: "4210 Ponce de Leon Blvd",
      addressLocality: "Coral Gables", addressRegion: "FL", postalCode: "33146", addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: 25.7327988, longitude: -80.2587469 },
    telephone: "+17868177008",
    hasMap: "https://maps.app.goo.gl/b2uZ1n7XQJv75em86",
    priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d.mia"],
    parentOrganization: ORG,
  },
  hallandale: {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Hallandale", url: "https://54d.com/studios/hallandale",
    address: { "@type": "PostalAddress", streetAddress: "601 N Federal Hwy",
      addressLocality: "Hallandale Beach", addressRegion: "FL", postalCode: "33009", addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: 25.9927944, longitude: -80.1433381 },
    telephone: "+17865834387",
    hasMap: "https://maps.app.goo.gl/7y6WxPq2zHR8G473A",
    priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d.mia"], parentOrganization: ORG,
  },
  "mexico-carso": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Mexico City Carso", url: "https://54d.com/studios/mexico-carso",
    address: { "@type": "PostalAddress", streetAddress: "C. Lago Zurich 219, Amp Granada",
      addressLocality: "Miguel Hidalgo", addressRegion: "CDMX", postalCode: "11529", addressCountry: "MX" },
    geo: { "@type": "GeoCoordinates", latitude: 19.4421, longitude: -99.2041 },
    telephone: "+525552505301",
    hasMap: "https://www.google.com/maps/search/54D+Plaza+Carso+Ciudad+de+Mexico",
    priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d.mx"], parentOrganization: ORG,
  },
  "mexico-santa-fe": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Mexico City Santa Fe", url: "https://54d.com/studios/mexico-santa-fe",
    address: { "@type": "PostalAddress", streetAddress: "Av. Javier Barros Sierra 540",
      addressLocality: "Álvaro Obregón", addressRegion: "CDMX", postalCode: "01376", addressCountry: "MX" },
    geo: { "@type": "GeoCoordinates", latitude: 19.3647, longitude: -99.2597 },
    telephone: "+525518090259",
    hasMap: "https://www.google.com/maps/search/54D+Santa+Fe+Ciudad+de+Mexico",
    priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d.mx"], parentOrganization: ORG,
  },
  bogota: {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Bogota", url: "https://54d.com/studios/bogota",
    address: { "@type": "PostalAddress", streetAddress: "Cl. 109 #18b-51", // GBP sin reclamar: CONFIRMAR
      addressLocality: "Bogota", addressRegion: "Bogota D.C.", addressCountry: "CO" },
    /* geo removido: el pin viejo era del placeholder de Chapinero; el GBP
       (sin reclamar) no expone plus code. Reponer cuando el cliente confirme. */
    telephone: "+5716949016",
    hasMap: "https://www.google.com/maps/search/54D+Bogota",
    priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d.col"], parentOrganization: ORG,
  },
};

/* BreadcrumbList de 3 niveles por sede (LOCAL_SEO §4) */
const BREADCRUMB_SCHEMA = (slug: string, name: string): object => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "54D", item: "https://54d.com/" },
    { "@type": "ListItem", position: 2, name: "Studios", item: "https://54d.com/studios" },
    { "@type": "ListItem", position: 3, name, item: `https://54d.com/studios/${slug}` },
  ],
});

/* Bloque de contenido local por sede: LOCAL_SEO.md §3 verbatim en EN
   (zonas y vias reales, 60-72 palabras por sede). ES: traduccion
   editorial propia (acentos correctos en ES aunque el EN los omita). */
const LOCAL_COPY: Record<Lang, Record<string, string>> = {
  en: {
    "coral-gables":
      "Our Coral Gables studio sits at 4210 Ponce de Leon Blvd, a few blocks from the Shops at Merrick Park and the Douglas Road Metrorail station. Members drive in from Coconut Grove, South Miami and Brickell for one reason: a 54 day program you cannot get anywhere else in Miami. First sessions start at 6 AM, and you can be back on US 1 before the city wakes up.",
    hallandale:
      "54D Hallandale sits at 601 N Federal Hwy (US 1), minutes from the beach and the halfway point between Miami and Fort Lauderdale. Members come from Aventura, Hollywood, Sunny Isles and Golden Beach, most within a ten minute drive. Morning Generations finish before the Gulfstream Park traffic starts, and the studio's location makes it the natural home for the method in Broward County.",
    "mexico-carso":
      "In Nuevo Polanco, steps from Plaza Carso and the Museo Soumaya, our studio serves the executives and families of Polanco, Granada and Irrigacion. Lago Zurich is minutes from Ejercito Nacional and Ferrocarril de Cuernavaca, with parking in the Carso complex. Early Generations let you train, shower and be at your office on Mariano Escobedo or Paseo de la Reforma before 8 AM.",
    "mexico-santa-fe":
      "Our Santa Fe studio sits on Av. Vasco de Quiroga, in the corporate district that runs from Centro Santa Fe to Parque La Mexicana. If you work in the towers of Santa Fe or live in Bosques de las Lomas, Interlomas or Contadero, your Generation trains here: before the office, or right after, without crossing the city.",
    bogota:
      "54D Bogota lives on Calle 109, in the Santa Barbara area of Usaquen. The studio draws members from Chico, Rosales and Santa Ana, minutes from the offices along the Carrera 19 corridor. Morning Generations finish before the city's traffic builds, and the neighborhood's cafes have adopted our members as their post workout ritual.",
  },
  es: {
    "coral-gables":
      "Nuestro studio de Coral Gables está en 4210 Ponce de Leon Blvd, a pocas cuadras de los Shops at Merrick Park y de la estación Douglas Road del Metrorail. Nuestros miembros llegan desde Coconut Grove, South Miami y Brickell por una razón: un programa de 54 días que no existe en ningún otro lugar de Miami. Las primeras sesiones comienzan a las 6 AM, y puedes estar de vuelta en la US 1 antes de que la ciudad despierte.",
    hallandale:
      "54D Hallandale está en 601 N Federal Hwy (US 1), a minutos de la playa y en el punto medio entre Miami y Fort Lauderdale. Nuestros miembros llegan desde Aventura, Hollywood, Sunny Isles y Golden Beach, la mayoría a menos de diez minutos en auto. Las Generaciones de la mañana terminan antes de que empiece el tráfico de Gulfstream Park, y la ubicación del studio lo convierte en la casa natural del método en el condado de Broward.",
    "mexico-carso":
      "En Nuevo Polanco, a pasos de Plaza Carso y del Museo Soumaya, nuestro studio recibe a los ejecutivos y familias de Polanco, Granada e Irrigación. Lago Zurich está a minutos de Ejército Nacional y Ferrocarril de Cuernavaca, con estacionamiento en el complejo Carso. Las Generaciones tempranas te permiten entrenar, ducharte y estar en tu oficina en Mariano Escobedo o Paseo de la Reforma antes de las 8 AM.",
    "mexico-santa-fe":
      "Nuestro studio de Santa Fe está sobre Av. Vasco de Quiroga, en el distrito corporativo que va de Centro Santa Fe a Parque La Mexicana. Si trabajas en las torres de Santa Fe o vives en Bosques de las Lomas, Interlomas o Contadero, tu Generación entrena aquí: antes de la oficina, o justo después, sin cruzar la ciudad.",
    bogota:
      "54D Bogotá vive sobre la Calle 109, en la zona de Santa Bárbara, Usaquén. El studio recibe miembros de Chicó, Rosales y Santa Ana, a minutos de las oficinas del corredor de la Carrera 19. Las Generaciones de la mañana terminan antes de que se llene el tráfico, y los cafés del barrio ya adoptaron a nuestros miembros como su ritual post entrenamiento.",
  },
};

/* Sub localizado del hero por sede (zona/barrio): PLACEHOLDER, confirmar con cliente */
const ZONE: Record<Lang, Record<string, string>> = {
  en: {
    "coral-gables": "In the heart of Coral Gables, on Ponce de Leon Blvd.",
    hallandale: "Between Miami and Fort Lauderdale, on N Federal Hwy.",
    "mexico-carso": "In Nuevo Polanco, right by Plaza Carso.",
    "mexico-santa-fe": "In the corporate heart of Santa Fe.",
    bogota: "On Calle 109, Santa Barbara, Usaquen.",
  },
  es: {
    "coral-gables": "En el corazón de Coral Gables, sobre Ponce de Leon Blvd.",
    hallandale: "Entre Miami y Fort Lauderdale, sobre N Federal Hwy.",
    "mexico-carso": "En Nuevo Polanco, junto a Plaza Carso.",
    "mexico-santa-fe": "En el corazón corporativo de Santa Fe.",
    bogota: "Sobre la Calle 109, Santa Bárbara, Usaquén.",
  },
};

/* Próxima generación por sede: DATO_PENDIENTE (fechas y cupos placeholder,
   confirmar con cliente / Mindbody antes del launch). ES: start en
   minúscula porque va embebido a mitad de frase ("comienza el lunes..."). */
const GENERATION: Record<
  Lang,
  Record<string, { start: string; startShort: string; spots: number }>
> = {
  en: {
    "coral-gables": { start: "Monday, August 17", startShort: "AUG 17", spots: 20 },
    hallandale: { start: "Monday, August 24", startShort: "AUG 24", spots: 20 },
    "mexico-carso": { start: "Monday, August 17", startShort: "AUG 17", spots: 24 },
    "mexico-santa-fe": { start: "Monday, August 24", startShort: "AUG 24", spots: 24 },
    bogota: { start: "Monday, August 31", startShort: "AUG 31", spots: 20 },
  },
  es: {
    "coral-gables": { start: "lunes 17 de agosto", startShort: "17 AGO", spots: 20 },
    hallandale: { start: "lunes 24 de agosto", startShort: "24 AGO", spots: 20 },
    "mexico-carso": { start: "lunes 17 de agosto", startShort: "17 AGO", spots: 24 },
    "mexico-santa-fe": { start: "lunes 24 de agosto", startShort: "24 AGO", spots: 24 },
    bogota: { start: "lunes 31 de agosto", startShort: "31 AGO", spots: 20 },
  },
};

/* Fecha ISO de cada inicio (fuente única de vigencia del bloque de arriba).
   GUARD: una fecha vencida en pantalla es el peor golpe de confianza
   high-ticket; pasado el día de inicio, la página degrada SOLA al copy
   de admisión sin fecha (ya existente). Al confirmar fechas nuevas,
   actualizar GENERATION y este record juntos. */
const GENERATION_START_ISO: Record<string, string> = {
  "coral-gables": "2026-08-17",
  hallandale: "2026-08-24",
  "mexico-carso": "2026-08-17",
  "mexico-santa-fe": "2026-08-24",
  bogota: "2026-08-31",
};

/* Horarios estáticos fase 1: PLACEHOLDER (Mindbody live en fase 2) */
const SCHEDULE: Record<Lang, Array<{ days: string; hours: string }>> = {
  en: [
    { days: "Monday to Friday", hours: "6:00 AM to 8:00 PM" },
    { days: "Saturday", hours: "7:00 AM to 12:00 PM" },
    { days: "Sunday", hours: "Active recovery, guided by your protocol" },
  ],
  es: [
    { days: "Lunes a viernes", hours: "6:00 AM a 8:00 PM" },
    { days: "Sábado", hours: "7:00 AM a 12:00 PM" },
    { days: "Domingo", hours: "Recuperación activa, guiada por tu protocolo" },
  ],
};

/* Formato del schedule live: deterministico entre SSR y cliente.
   Las horas de Mindbody son naive locales del site; se muestran tal
   cual, sin pasar por el timezone del runtime. */
const fmtTime = (iso: string) => {
  const h = parseInt(iso.slice(11, 13), 10);
  const m = iso.slice(14, 16);
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${h >= 12 ? "PM" : "AM"}`;
};
const WEEKDAYS: Record<Lang, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
};
const MONTHS: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
};
const fmtDay = (dateStr: string, lang: Lang) => {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = WEEKDAYS[lang][d.getUTCDay()];
  const month = MONTHS[lang][d.getUTCMonth()];
  /* ES lee fecha antes que mes: "Lunes · 17 Ago" vs "Monday · Aug 17" */
  return lang === "es"
    ? `${day} · ${d.getUTCDate()} ${month}`
    : `${day} · ${month} ${d.getUTCDate()}`;
};

/* Qué incluye la experiencia presencial en la sede */
const INCLUDES: Record<Lang, Array<{ num: string; name: string; desc: string }>> = {
  en: [
    {
      num: "01",
      name: "Coaches on the floor",
      desc: "Small groups with coaches who correct you live, rep by rep. No one trains on autopilot.",
    },
    {
      num: "02",
      name: "Nutritionist on site",
      desc: "Your nutrition protocol is built from real measurements and adjusted across the 54 days, not set once.",
    },
    {
      num: "03",
      name: "Physiotherapy",
      desc: "Prevention and recovery inside the program, so intensity doesn't cost you the result.",
    },
    {
      num: "04",
      name: "Fixed group",
      desc: "Your Generation trains with you from start to finish. Same group, same date, same goal. No one goes it alone.",
    },
  ],
  es: [
    {
      num: "01",
      name: "Coaches en el piso",
      desc: "Grupos pequeños con coaches que te corrigen en vivo, rep por rep. Nadie entrena en piloto automático.",
    },
    {
      num: "02",
      name: "Nutricionista en el studio",
      desc: "Tu protocolo de nutrición se construye con mediciones reales y se ajusta durante los 54 días, no se define una sola vez.",
    },
    {
      num: "03",
      name: "Fisioterapia",
      desc: "Prevención y recuperación dentro del programa, para que la intensidad no te cueste el resultado.",
    },
    {
      num: "04",
      name: "Grupo fijo",
      desc: "Tu Generación entrena contigo de principio a fin. Mismo grupo, misma fecha, mismo objetivo. Nadie lo hace solo.",
    },
  ],
};

/* ============================================================
   Fotos por sede (ART_DIRECTION_V3 §2)
   Coral Gables: galería real del studio (IMAGES_CG.md, 9 verticales 2:3).
   Resto de sedes: fotos de marca 54D con captions genéricos (no
   afirman ser esa sede) hasta que el cliente envíe fotos propias.
   Ratios calculados para igualar alturas en el photo-grid
   (columna 3fr a ratio R exige columna 2fr a ratio 1.5R).
   PROHIBIDAS en Studios (boxeo/conos verificados):
   brand/coach-stretch-demo-vertical, brand/coach-class-boxing-bags-vertical,
   brand/gym-structure-heavy-bags-wide, hallandale/coach-headset,
   coral-gables/boxer-closeup, coral-gables/spin-bikes-boxing-bags-01,
   hd/cg-highfive-euphoria, hd/cg-stairs-group
   ============================================================ */
/* caption bilingüe; src/alt/ratio son fuente única (alt queda EN en fase 1).
   imgStyle: reencuadre puntual (objectPosition/filter) por foto. */
type GalleryPhoto = {
  src: string;
  alt: string;
  ratio: string;
  caption: Record<Lang, string>;
  imgStyle?: React.CSSProperties;
};
type GalleryRow = { flip?: boolean; photos: [GalleryPhoto, GalleryPhoto] };

const cg = (file: string) => `images/studios/coral-gables/${file}`;
const hl = (file: string) => `images/studios/hallandale/${file}`;

/* Foto real de hero solo donde existe galería propia de la sede
   (HD de las galerías pic-time del cliente, 25/07/2026) */
const HERO_PHOTO: Record<string, { src: string; alt: string }> = {
  "coral-gables": {
    src: cg("mural-54d-editorial-wide.jpg"),
    alt: "An athlete mid drill in front of the giant 54D mural at the Coral Gables studio",
  },
  hallandale: {
    src: hl("mural-54d-members-wide.jpg"),
    alt: "Two 54D members standing under the giant 54D mural at the Hallandale studio",
  },
  /* LATAM: fotos de los perfiles de Google de cada sede (cliente 06/08) */
  "mexico-santa-fe": {
    src: "images/studios/mexico-santa-fe/facade-generation.jpg",
    alt: "A full 54D Generation posing outside the glass facade of the Santa Fe studio",
  },
  bogota: {
    src: "images/studios/bogota/container-facade.jpg",
    alt: "The black and yellow container facade of the 54D Bogota studio",
  },
};

const GALLERY_ROWS: Record<string, GalleryRow[]> = {
  "coral-gables": [
    {
      photos: [
        {
          src: cg("barbell-press-gaze-vertical.jpg"),
          alt: "Athlete pressing a barbell overhead, eyes on the bar, at 54D Coral Gables",
          ratio: "1 / 1",
          caption: { en: "Strength, rep by rep", es: "Fuerza, rep por rep" },
        },
        {
          src: cg("group-squat-class-01.jpg"),
          alt: "A full class holding the bottom of a squat at 54D Coral Gables",
          ratio: "2 / 3",
          caption: {
            en: "The squat block, together",
            es: "El bloque de sentadillas, juntos",
          },
        },
      ],
    },
    {
      flip: true,
      photos: [
        {
          src: cg("yellow-stairs-run-vertical.jpg"),
          alt: "An athlete in a 54D tank descending the signature yellow stairs at Coral Gables",
          ratio: "2 / 3",
          caption: { en: "The yellow stairs", es: "La escalera amarilla" },
        },
        {
          src: cg("runner-smile-vertical.jpg"),
          alt: "A member smiling mid run across the training floor",
          ratio: "1 / 1",
          caption: { en: "Cardio with the group", es: "Cardio con el grupo" },
        },
      ],
    },
    {
      photos: [
        {
          src: cg("nutrition-spread-vertical.jpg"),
          alt: "Fresh nutrition spread: salmon, tuna, vegetables and fruit on the 54D table",
          ratio: "3 / 2",
          caption: {
            en: "Nutrition, part of the method",
            es: "Nutrición, parte del método",
          },
          /* Reencuadre oscuro: la banda alta de la mesa (madera negra +
             bandejas) en lugar del primer plano rosa; saturación abajo
             para que la fila no desentone con la galería */
          imgStyle: {
            objectPosition: "center 22%",
            filter: "saturate(0.68) contrast(1.05) brightness(0.88)",
          },
        },
        {
          /* graduation-celebration-01: el abrazo de graduación real, en la
             clave oscura de la galería (reemplaza generation-hug, la fila
             más clara antes del cierre emocional) */
          src: cg("graduation-celebration-01.jpg"),
          alt: "Members of a 54D Generation embracing at their graduation under the 54D mural",
          ratio: "1 / 1",
          caption: {
            en: "Fifty-four days together",
            es: "Cincuenta y cuatro días juntos",
          },
          imgStyle: { objectPosition: "center 32%" },
        },
      ],
    },
  ],
  hallandale: [
    {
      photos: [
        {
          src: hl("barbell-one-step-mural.jpg"),
          alt: "Athlete curling a barbell under the One Step At A Time mural at Hallandale",
          ratio: "1 / 1",
          caption: { en: "Strength, rep by rep", es: "Fuerza, rep por rep" },
        },
        {
          src: hl("yellow-stairs-descend-vertical.jpg"),
          alt: "Members running down the yellow staircase at 54D Hallandale",
          ratio: "2 / 3",
          caption: { en: "The yellow stairs", es: "La escalera amarilla" },
        },
      ],
    },
    {
      flip: true,
      photos: [
        {
          src: hl("runner-mural-motion-vertical.jpg"),
          alt: "Athlete mid run in front of the 54D mural, hair in motion",
          ratio: "2 / 3",
          caption: { en: "Cardio, coached", es: "Cardio, con coach" },
        },
        {
          src: hl("member-press-smile.jpg"),
          alt: "A member smiling through a dumbbell press at 54D Hallandale",
          ratio: "1 / 1",
          caption: { en: "54D iron, every rep", es: "Hierro 54D, cada rep" },
        },
      ],
    },
    {
      photos: [
        {
          src: hl("generation-trio.jpg"),
          alt: "Three Hallandale members arm in arm after a session, smiling",
          ratio: "3 / 2",
          caption: {
            en: "Fifty-four days together",
            es: "Cincuenta y cuatro días juntos",
          },
        },
        {
          src: hl("bike-floor-smile.jpg"),
          alt: "A member laughing on the bike floor at 54D Hallandale",
          ratio: "1 / 1",
          caption: { en: "The bike floor", es: "El piso de bicis" },
        },
      ],
    },
  ],
};

/* Fila genérica de marca para sedes sin galería propia */
const BRAND_ROWS: GalleryRow[] = [
  {
    photos: [
      {
        src: "images/brand/class-plank-54d-mural.jpg",
        alt: "Full class training on mats under the 54D mural on a black wall",
        ratio: "3 / 2",
        caption: {
          en: "The 54D method on the floor",
          es: "El método 54D en el piso",
        },
      },
      {
        src: "images/studios/coral-gables/generation-hug.jpg",
        alt: "Two 54D members embracing after a session, both smiling",
        ratio: "1 / 1",
        caption: { en: "The Generation, together", es: "La Generación, unida" },
      },
    ],
  },
];

/* Banda fotográfica emocional por sede */
const BAND_PHOTO: Record<string, { src: string; alt: string }> = {
  "coral-gables": {
    src: cg("generation-graduation-mural.jpg"),
    alt: "A full Coral Gables Generation celebrating graduation under the 54D mural",
  },
  hallandale: {
    src: hl("class-under-letters.jpg"),
    alt: "A full 54D Generation posing under the giant 54D letters at the Hallandale studio",
  },
};

/* Franja de prensa pre-form: mismos assets aprobados del gate (home.tsx),
   tratamiento quiet (grayscale, opacidad baja). [archivo, nombre, alto px] */
const PRESS = [
  ["mens-health.png", "Men's Health", 15],
  ["forbes.png", "Forbes", 17],
  ["business-insider.png", "Business Insider", 13],
  ["new-york-post.png", "New York Post", 14],
  ["haute-living.png", "Haute Living", 12],
] as const;

/* Lista COMPLETA de paises (data/dial-codes.ts): el cliente contacta el
   100% de los leads por WhatsApp — ningun pais puede faltar. Frecuentes
   arriba; el resto alfabetico segun el idioma del visitante. */
const DEFAULT_DIAL: Record<string, string> = {
  US: "+1",
  MX: "+52",
  CO: "+57",
};

function LeadForm({
  locationSlug,
  countryCode,
  whatsappUrl,
}: {
  locationSlug: string;
  countryCode: string;
  /** Vía de rescate del lead fallido: link tapeable en el error */
  whatsappUrl?: string;
}) {
  const { lang } = useLang();
  const es = lang === "es";
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      /* El value de la option es "dial|ISO" (único por país: varios países
         comparten +1 y el select caía en el último). El payload de /leads
         NO cambia: se envía solo el dial. */
      const dial = String(data.get("dial")).split("|")[0];
      const res = await fetch(
        (import.meta.env.VITE_API_URL ?? "http://localhost:8788") + "/leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            phone: `${dial} ${String(data.get("phone")).trim()}`,
            location_slug: locationSlug,
          }),
        }
      );
      if (!res.ok) throw new Error("Lead request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const panelStyle: React.CSSProperties = {
    maxWidth: "100%",
    marginTop: 0,
    padding: "clamp(2rem, 4vw, 3rem)",
    borderRadius: "var(--r-card, 8px)",
    background: "var(--glass)",
    border: "1px solid var(--hairline)",
    backdropFilter: "blur(10px)",
  };

  if (status === "success") {
    return (
      <div style={panelStyle} aria-live="polite">
        <div className="method-name" style={{ marginTop: 0 }}>
          {es ? "Solicitud" : "Application"}{" "}
          <span style={{ color: "var(--c-yellow)" }}>
            {es ? "recibida." : "received."}
          </span>
        </div>
        <p className="method-desc" style={{ marginTop: "0.9rem" }}>
          {es
            ? "Te escribiremos por WhatsApp para agendar tu consulta."
            : "We will reach out on WhatsApp to schedule your consultation."}
        </p>
      </div>
    );
  }

  /* Mini-form de reserva: nombre + WhatsApp (DESIGN_FIXES_V4 §5).
     El API acepta leads con solo phone (email O phone requerido). */
  return (
    <form onSubmit={handleSubmit} style={panelStyle} noValidate={false}>
      <div className="field">
        <label htmlFor="lead-name">{es ? "Nombre" : "Name"}</label>
        <input
          id="lead-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder={es ? "Tu nombre completo" : "Your full name"}
        />
      </div>
      <div className="field">
        <label htmlFor="lead-phone">WhatsApp</label>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <select
            name="dial"
            aria-label={es ? "Código de país" : "Country code"}
            defaultValue={`${DEFAULT_DIAL[countryCode] ?? "+1"}|${
              DEFAULT_DIAL[countryCode] ? countryCode : "US"
            }`}
            style={{ flex: "0 0 auto", width: "8.6rem" }}
          >
            {/* Código ANTES del nombre: el select clipea el final de la
                option ("🇺🇸 United S…"); así el dato clave siempre se ve */}
            <optgroup label={es ? "Frecuentes" : "Frequent"}>
              {FREQUENT_ISO.map((iso) => {
                const c = DIAL_CODES.find((d) => d[0] === iso);
                if (!c) return null;
                return (
                  <option key={`f-${c[0]}`} value={`${c[1]}|${c[0]}`}>
                    {isoFlag(c[0])} {c[1]} {es ? c[3] : c[2]}
                  </option>
                );
              })}
            </optgroup>
            {/* Los frecuentes no se repiten en el listado alfabético */}
            <optgroup label={es ? "Todos los países" : "All countries"}>
              {DIAL_CODES.filter(
                (c) => !(FREQUENT_ISO as readonly string[]).includes(c[0])
              )
                .sort((a, b) =>
                  (es ? a[3] : a[2]).localeCompare(es ? b[3] : b[2], lang)
                )
                .map((c) => (
                  <option key={c[0]} value={`${c[1]}|${c[0]}`}>
                    {isoFlag(c[0])} {c[1]} {es ? c[3] : c[2]}
                  </option>
                ))}
            </optgroup>
          </select>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel-national"
            inputMode="tel"
            placeholder={es ? "Tu número" : "Your number"}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "sending"}
        style={{
          width: "100%",
          opacity: status === "sending" ? 0.6 : 1,
        }}
      >
        {status === "sending"
          ? es
            ? "Enviando…"
            : "Sending…"
          : es
            ? "Solicita una consulta"
            : "Request a consultation"}
      </button>
      {status === "error" && (
        <p
          className="error"
          aria-live="polite"
          style={{
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "var(--c-red)",
          }}
        >
          {es
            ? "No pudimos enviar tus datos. Intenta de nuevo o "
            : "We couldn't send your details. Try again, or "}
          {whatsappUrl ? (
            /* Vía de rescate TAPEABLE: el lead fallido salta a WhatsApp */
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--c-yellow)",
                textDecoration: "underline",
                display: "inline-block",
                padding: "0.6rem 0.2rem",
                margin: "-0.6rem -0.2rem",
              }}
            >
              {es
                ? "escríbenos directamente por WhatsApp."
                : "message us directly on WhatsApp."}
            </a>
          ) : (
            <span>
              {es
                ? "escríbenos directamente por WhatsApp."
                : "message us directly on WhatsApp."}
            </span>
          )}
        </p>
      )}
      <p
        style={{
          marginTop: "1.2rem",
          fontSize: "0.82rem",
          lineHeight: 1.5,
          color: "var(--c-faint)",
        }}
      >
        {es
          ? "Te contactamos para una sola cosa: agendar tu consulta. Sin spam, sin llamadas interminables."
          : "We contact you for one thing: scheduling your consultation. No spam, no endless calls."}
      </p>
    </form>
  );
}

/** Fila de estrellas del rating agregado de Google (relleno fraccional:
    4.5 pinta 4 llenas y media). Solo datos reales del perfil. */
function Stars({ rating }: { rating: string }) {
  const val = parseFloat(rating);
  const path =
    "M12 2l2.9 6.26 6.6.56-5 4.4 1.5 6.48L12 16.2 5.99 19.7l1.5-6.48-5-4.4 6.6-.56z";
  return (
    <span
      style={{ display: "inline-flex", gap: "3px", verticalAlign: "-2px" }}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, val - i));
        return (
          <span
            key={i}
            style={{ position: "relative", width: 15, height: 15, display: "inline-block" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
              <path d={path} fill="rgba(255,255,255,0.16)" />
            </svg>
            <span
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                width: `${fill * 100}%`,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d={path} fill="var(--c-yellow)" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* Glifo oficial de WhatsApp (path de simple-icons, monocromo blanco) */
function WhatsAppFab({
  whatsapp,
  city,
}: {
  whatsapp: string;
  city: string;
}) {
  const { lang } = useLang();
  const es = lang === "es";
  /* Gate por viewport: mientras el hero (ya tiene su ghost de WhatsApp)
     o el form #reserva están a la vista, el FAB se esconde; no triplica
     affordances de contacto ni tapa el CTA del form en mobile. Arranca
     oculto (el primer viewport ES el hero) y el IO corrige al instante. */
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const targets = [
      document.querySelector(".hero"),
      document.getElementById("reserva"),
    ].filter((el): el is Element => el !== null);
    if (targets.length === 0) {
      setHidden(false);
      return;
    }
    const visible = new Set<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setHidden(visible.size > 0);
      },
      { threshold: 0.05 }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
  const msg = encodeURIComponent(
    es
      ? `Hola, quiero información sobre 54D ${city}.`
      : `Hi, I'd like information about 54D ${city}.`
  );
  return (
    <a
      className={`wa-fab${hidden ? " wa-fab-hidden" : ""}`}
      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      aria-label={
        es
          ? `Escríbenos por WhatsApp, 54D ${city}`
          : `Message 54D ${city} on WhatsApp`
      }
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

export default function StudioDetail({ loaderData }: Route.ComponentProps) {
  const { studio, liveClasses } = loaderData;
  const { lang } = useLang();
  const es = lang === "es";
  /* CTA primario repetido 3 veces (hero, generación, band) */
  const ctaLabel = es ? "Solicita una consulta" : "Request a consultation";
  /* Agrupar por fecha (YYYY-MM-DD) preservando orden cronologico */
  const scheduleDays: Array<{ date: string; classes: typeof liveClasses }> = [];
  for (const k of liveClasses) {
    const date = k.start.slice(0, 10);
    const last = scheduleDays[scheduleDays.length - 1];
    if (last && last.date === date) last.classes.push(k);
    else scheduleDays.push({ date, classes: [k] });
  }
  /* Vigencia: el día de inicio todavía se muestra; desde el día siguiente
     la Generación anunciada se apaga y cae el copy sin fecha. */
  const startISO = GENERATION_START_ISO[studio.slug];
  const generationRaw = GENERATION[lang][studio.slug];
  const generation =
    generationRaw && startISO && new Date(startISO + "T23:59:59") >= new Date()
      ? generationRaw
      : undefined;
  const whatsappUrl = `https://wa.me/${studio.whatsapp.replace(/\D/g, "")}`;
  /* Numeros reales pendientes del cliente (jurado HT fix 1): un WhatsApp
     falso visible es grieta de credibilidad en un producto flagship.
     Con numeros reales en data/studios.ts esto se enciende solo. */
  const hasRealWhatsapp = studio.whatsapp.length > 0;

  const heroPhoto = HERO_PHOTO[studio.slug];
  const galleryRows = GALLERY_ROWS[studio.slug] ?? BRAND_ROWS;
  const bandPhoto = BAND_PHOTO[studio.slug];

  const gen = useReveal();
  const reviewsReveal = useReveal();
  const includes = useReveal();
  const gallery = useReveal();
  const location = useReveal();
  const lead = useReveal();
  const cta = useReveal();

  const panelStyle: React.CSSProperties = {
    padding: "clamp(1.8rem, 3.5vw, 2.6rem)",
    borderRadius: "var(--r-card, 8px)",
    background: "var(--glass)",
    border: "1px solid var(--hairline)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div>
      <Nav />

      {/* Schema LocalBusiness/ExerciseGym completo por sede (LOCAL_SEO §2):
          PostalAddress + geo + horarios + priceRange. Si el slug no está en
          el record no se emite nada: nunca el schema plano viejo. */}
      {STUDIO_SCHEMA[studio.slug] && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STUDIO_SCHEMA[studio.slug]),
          }}
        />
      )}
      {/* BreadcrumbList (LOCAL_SEO §4) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            BREADCRUMB_SCHEMA(studio.slug, `54D ${cityPlain(studio.city)}`)
          ),
        }}
      />

      {/* ============ HERO INTERIOR ============ */}
      <header className="hero hero-inner">
        <div className="hero-media">
          {heroPhoto ? (
            <img src={asset(heroPhoto.src)} alt={heroPhoto.alt} />
          ) : (
            /* Foto propia de la sede pendiente del cliente: poster de luz mientras tanto */
            <div className="hero-poster" />
          )}
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">54D Studios · {studio.country}</span>
          {/* Breadcrumb UI (LOCAL_SEO §4): espejo del BreadcrumbList JSON-LD */}
          <nav
            aria-label="Breadcrumb"
            style={{
              margin: "0.9rem 0 0.2rem",
              fontSize: "0.82rem",
              letterSpacing: "0.02em",
              color: "var(--c-faint)",
            }}
          >
            {/* Target táctil ≥44px sin mover el layout (padding compensado) */}
            <Link
              to="/"
              style={{
                color: "var(--c-mist)",
                textDecoration: "none",
                display: "inline-block",
                padding: "0.85rem 0.45rem",
                margin: "-0.85rem -0.45rem",
              }}
            >
              54D
            </Link>
            <span aria-hidden="true" style={{ margin: "0 0.45rem" }}>
              /
            </span>
            <Link
              to="/studios"
              style={{
                color: "var(--c-mist)",
                textDecoration: "none",
                display: "inline-block",
                padding: "0.85rem 0.45rem",
                margin: "-0.85rem -0.45rem",
              }}
            >
              Studios
            </Link>
            <span aria-hidden="true" style={{ margin: "0 0.45rem" }}>
              /
            </span>
            <span aria-current="page" style={{ color: "var(--c-white)" }}>
              54D {cityLabel(studio.city, lang)}
            </span>
          </nav>
          <h1 className="hero-title">
            54D
            <br />
            <span className="accent">{cityLabel(studio.city, lang)}.</span>
          </h1>
          <p className="hero-sub">
            {ZONE[lang][studio.slug] ?? studio.address}{" "}
            {es
              ? "El método completo, en persona: tu Generación, tus coaches, tu resultado."
              : "The full method, in person: your Generation, your coaches, your result."}
          </p>
          <div className="hero-ctas">
            <a href="#reserva" className="btn btn-primary">
              {ctaLabel}
            </a>
            {/* Secundario ligero y más corto que el primario
                (DESIGN_FIXES_V4 §5, studio-cg-desktop-0.png) */}
            {hasRealWhatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                {es ? "Escríbenos por WhatsApp" : "WhatsApp us"}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ============ PRÓXIMA GENERACIÓN ============ */}
      <section className="section">
        <div className="section-inner" ref={gen.ref}>
          <div className={gen.className}>
            {/* Reparto de canvas (lección .gen-split): la columna de stats
                NACE a la altura del título; sin stats vigentes la sección
                vuelve a una sola columna. */}
            <div className={generation ? "gen-split" : undefined}>
              <div>
                <span className="day-marker">
                  {es ? "Próxima Generación" : "Next Generation"}
                </span>
                {/* Copy claro-primero (cliente 05/08): el titulo dice lo
                    concreto en lenguaje llano; "Generacion" aparece recien
                    en el lead, donde se define sola en su primera mencion. */}
                <h2 className="section-title">
                  {es ? (
                    <>
                      Una sola fecha de inicio.{" "}
                      <span className="accent">Cupos limitados.</span>
                    </>
                  ) : (
                    <>
                      One start date.{" "}
                      <span className="accent">Limited places.</span>
                    </>
                  )}
                </h2>
                <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "38rem" }}>
                  {generation
                    ? es
                      ? `Tu Generación es el grupo con el que empiezas y terminas. La próxima comienza el ${generation.start}, y nadie entra después del día uno.`
                      : `Your Generation is the group you start and finish with. The next one begins ${generation.start}, and no one joins after day one.`
                    : es
                      ? "Tu Generación es el grupo con el que empiezas y terminas. La admisión es por solicitud, y nadie entra después del día uno."
                      : "Your Generation is the group you start and finish with. Admission is by application, and no one joins after day one."}
                </p>
                <div className="hero-ctas" style={{ marginTop: "2.6rem" }}>
                  <a href="#reserva" className="btn btn-primary">
                    {ctaLabel}
                  </a>
                </div>
              </div>
              {generation && (
                <div
                  className="stat-row"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  }}
                >
                  <div className="stat">
                    <div className="stat-value">{generation.startShort}</div>
                    <div className="stat-label">
                      {es ? "Fecha de inicio" : "Start date"}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{generation.spots}</div>
                    <div className="stat-label">
                      {es ? "Cupos por Generación" : "Places per Generation"}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">54</div>
                    <div className="stat-label">
                      {es ? "Días con el mismo grupo" : "Days with the same group"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUÉ INCLUYE LA EXPERIENCIA ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={includes.ref}>
          <div className={includes.className}>
            <span className="day-marker">
              {es ? "La experiencia" : "The experience"}
            </span>
            <div className="method-intro">
              <h2 className="section-title">
                {es ? (
                  <>
                    Lo que obtienes entrenando{" "}
                    <span className="accent">aquí.</span>
                  </>
                ) : (
                  <>
                    What you get training <span className="accent">here.</span>
                  </>
                )}
              </h2>
              <p>
                {es
                  ? "Comienzas con una evaluación inicial completa el día 1: mediciones, historial y objetivo. A partir de ahí, todo el equipo del studio trabaja en tu transformación."
                  : "You start with a full initial assessment on day 1: measurements, history, and goal. From there the whole studio team works on your transformation."}
              </p>
            </div>
            <div className="method-grid">
              {INCLUDES[lang].map((item) => (
                <div className="method-card" key={item.num}>
                  <div className="method-num">{item.num}</div>
                  <div className="method-name">{item.name}</div>
                  <p className="method-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GALERÍA: FOTOS REALES ============ */}
      <section className="section">
        <div className="section-inner" ref={gallery.ref}>
          <div className={gallery.className}>
            <span className="day-marker">
              {GALLERY_ROWS[studio.slug]
                ? es
                  ? "Dentro del studio"
                  : "Inside the studio"
                : es
                  ? "Dentro de 54D"
                  : "Inside 54D"}
            </span>
            <h2 className="section-title">
              {es ? "Aquí es donde sucede." : "This is where it happens."}
            </h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "3rem" }}>
              {galleryRows.map((row, i) => (
                <div
                  key={i}
                  className={row.flip ? "photo-grid flip" : "photo-grid"}
                >
                  {row.photos.map((p) => (
                    <figure key={p.src} style={{ margin: 0 }}>
                      <div
                        className="photo-card"
                        style={{ aspectRatio: p.ratio }}
                      >
                        <img
                          src={asset(p.src)}
                          alt={p.alt}
                          loading="lazy"
                          style={p.imgStyle}
                        />
                      </div>
                      <figcaption className="photo-caption">
                        {p.caption[lang]}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PHOTO BAND: GRADUACIÓN (solo sedes con foto real) ============ */}
      {bandPhoto && (
        <section className="photo-band">
          <img src={asset(bandPhoto.src)} alt={bandPhoto.alt} loading="lazy" />
          <div className="photo-band-content">
            <span className="day-marker">{es ? "Día 54" : "Day 54"}</span>
            <h2 className="section-title">
              {es
                ? "Aquí el día de graduación es real."
                : "Graduation day is real here."}
            </h2>
            <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "34rem" }}>
              {es
                ? `Cada Generación en 54D ${cityLabel(studio.city, lang)} termina de la misma manera: resultados sobre la mesa y una sala llena de gente que lo logró.`
                : `Every Generation at 54D ${cityLabel(studio.city, lang)} ends the same way: results on the table and a room full of people who made it.`}
            </p>
            <div className="hero-ctas">
              <a href="#reserva" className="btn btn-primary">
                {ctaLabel}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ============ RESEÑAS DE GOOGLE (testimonios reales, verificables) ============ */}
      {GOOGLE_REVIEWS[studio.slug] && (
        <section className="section section-tight">
          <div className="section-inner" ref={reviewsReveal.ref}>
            <div className={reviewsReveal.className}>
              <span className="day-marker">
                {es ? "Reseñas de Google" : "From Google reviews"}
              </span>
              <h2 className="section-title">
                {es
                  ? "Lo que dice la gente que entrena aquí."
                  : "What the people training here say."}
              </h2>
              <p
                className="method-desc"
                style={{
                  marginTop: "1rem",
                  color: "var(--c-faint)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  flexWrap: "wrap",
                }}
              >
                <Stars rating={GOOGLE_REVIEWS[studio.slug].rating} />
                <span>
                  {GOOGLE_REVIEWS[studio.slug].rating} / 5 ·{" "}
                  {GOOGLE_REVIEWS[studio.slug].count}{" "}
                  {es ? "reseñas en Google" : "reviews on Google"}
                </span>
              </p>
              <div className="review-grid">
                {GOOGLE_REVIEWS[studio.slug].quotes.map((q) => (
                  <figure className="review-card" key={q.name}>
                    <blockquote>
                      {"\u201C"}
                      {es ? q.textEs : q.textEn}
                      {"\u201D"}
                    </blockquote>
                    <figcaption>
                      {q.name} ·{" "}
                      {es
                        ? "Reseña de Google"
                        : "Translated from a Google review"}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <a
                href={GOOGLE_REVIEWS[studio.slug].url}
                target="_blank"
                rel="noreferrer"
                className="review-all-link"
              >
                {es
                  ? "Leer todas las reseñas en Google"
                  : "Read all reviews on Google"}{" "}
                {"\u2197"}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ============ HORARIOS Y UBICACIÓN ============ */}
      <section className="section">
        <div className="section-inner" ref={location.ref}>
          <div className={location.className}>
            <span className="day-marker">
              {es ? "Horarios y ubicación" : "Schedule and location"}
            </span>
            <h2 className="section-title">
              {es ? (
                <>
                  Tu studio, tu <span className="accent">horario.</span>
                </>
              ) : (
                <>
                  Your studio, your <span className="accent">schedule.</span>
                </>
              )}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.1rem",
                marginTop: "3rem",
                /* stretch: ambos paneles a altura pareja en desktop */
                alignItems: "stretch",
              }}
            >
              {/* Horarios estáticos fase 1: Mindbody live en fase 2 */}
              <div style={panelStyle}>
                {/* "Studio hours": el horario de operación no es el horario
                    de entrenamiento; la aclaración de bloques va ARRIBA de
                    la tabla para encuadrar la lectura */}
                <div className="method-name" style={{ marginTop: 0 }}>
                  {es ? "Horario del studio" : "Studio hours"}
                </div>
                <p className="method-desc" style={{ marginTop: "0.9rem" }}>
                  {es
                    ? "El horario de tu grupo se confirma en tu consulta: cada Generación entrena en bloques fijos."
                    : "Your group's schedule is confirmed in your consultation: each Generation trains in fixed blocks."}
                </p>
                {/* .schedule: tabular-nums vía global CSS (DESIGN_FIXES_V4 §2).
                    Con datos de Mindbody: la semana real, agrupada por dia.
                    Sin datos (sin go-live / sede sin match): franjas estaticas. */}
                {scheduleDays.length > 0 ? (
                  <div className="schedule" style={{ marginTop: "1.4rem" }}>
                    {scheduleDays.map((day) => (
                      <div key={day.date} style={{ marginBottom: "1.3rem" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-label)",
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--c-faint)",
                            padding: "0.4rem 0",
                            borderBottom: "1px solid var(--hairline)",
                          }}
                        >
                          {fmtDay(day.date, lang)}
                        </div>
                        {day.classes.map((k) => (
                          <div
                            key={k.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "1rem",
                              padding: "0.7rem 0",
                              borderBottom: "1px solid var(--hairline)",
                              fontSize: "0.92rem",
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ color: "var(--c-white)" }}>
                              {k.name}
                              {k.staff && (
                                <span style={{ color: "var(--c-faint)" }}>
                                  {" "}· {k.staff}
                                </span>
                              )}
                            </span>
                            <span
                              style={{
                                color: "var(--c-mist)",
                                textAlign: "right",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmtTime(k.start)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="schedule" style={{ marginTop: "1.4rem" }}>
                    {SCHEDULE[lang].map((row) => (
                      <div
                        key={row.days}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "1rem",
                          padding: "0.85rem 0",
                          borderBottom: "1px solid var(--hairline)",
                          fontSize: "0.95rem",
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: "var(--c-mist)" }}>{row.days}</span>
                        <span style={{ color: "var(--c-white)", textAlign: "right" }}>
                          {row.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={panelStyle}>
                <div className="method-name" style={{ marginTop: 0 }}>
                  {es ? "Ubicación" : "Location"}
                </div>
                <p className="method-desc" style={{ marginTop: "1.4rem" }}>
                  {studio.address}
                </p>
                {/* Contenido local por sede (LOCAL_SEO §3, verbatim en EN) */}
                {LOCAL_COPY[lang][studio.slug] && (
                  <p className="method-desc">{LOCAL_COPY[lang][studio.slug]}</p>
                )}
                {hasRealWhatsapp && (
                  <p className="method-desc">
                    {es
                      ? "¿No sabes cómo llegar? Escríbenos y te guiamos."
                      : "Not sure how to get here? Message us and we'll point the way."}
                  </p>
                )}
                <div
                  style={{
                    marginTop: "1.8rem",
                    display: "flex",
                    gap: "0.8rem",
                    flexWrap: "wrap",
                  }}
                >
                  {studio.mapsUrl && (
                    <a
                      href={studio.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost"
                    >
                      {es ? "Cómo llegar" : "Get directions"}
                    </a>
                  )}
                  {studio.phone && (
                    /* Formato visible unificado con el del WhatsApp de al
                       lado: "+1 786 817 7008" (espacios, con país) */
                    <a
                      href={`tel:${studio.phone.replace(/[^+\d]/g, "")}`}
                      className="btn btn-ghost"
                    >
                      {es ? "Llamar" : "Call"} ·{" "}
                      {studio.phone.replace(/-/g, " ")}
                    </a>
                  )}
                  {hasRealWhatsapp && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost"
                    >
                      WhatsApp · {studio.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FORMULARIO DE LEAD ============ */}
      {/* FIXES_V5 §3.2: único campo de luz de la página (ember pre-CTA) */}
      <section
        className="section section-tight bloom-ember"
        id="reserva"
        style={{ scrollMarginTop: "5rem" }}
      >
        <div className="section-inner" ref={lead.ref}>
          <div className={lead.className}>
            <div className="apply-split">
              <div>
                <span className="day-marker">
                  {es ? "Solicitud" : "Apply"}
                </span>
                <h2 className="section-title">
                  {es ? (
                    <>
                      Solicita tu lugar en la próxima{" "}
                      <span className="accent">Generación.</span>
                    </>
                  ) : (
                    <>
                      Apply for your place in the next{" "}
                      <span className="accent">Generation.</span>
                    </>
                  )}
                </h2>
                {/* Guardrail high-ticket (SEPARATION_SPEC §4, verbatim en EN) */}
                <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "36rem" }}>
                  {es
                    ? "54D Studios es nuestro nivel insignia, un programa con trato de cliente privado. Tu consulta define tres cosas: si el programa es para ti, la fecha de inicio de tu Generación y la inversión."
                    : "54D Studios is our flagship tier, a private-client level program. Your consultation covers fit, your Generation's start date, and the investment."}
                </p>
                {/* Prensa quiet junto a la decision (antes era una banda
                    huerfana entre dos zonas muertas — feedback cliente) */}
                <div
                  style={{
                    marginTop: "2.2rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.9rem clamp(1.4rem, 2.6vw, 2.4rem)",
                  }}
                  aria-label={es ? "En los medios" : "Featured on"}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-label)",
                      fontWeight: 500,
                      fontSize: "0.6rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--c-faint)",
                      flexBasis: "100%",
                    }}
                  >
                    {es ? "En los medios" : "Featured on"}
                  </span>
                  {PRESS.map(([file, name, h]) => (
                    <img
                      key={file}
                      src={asset(`images/press/${file}`)}
                      alt={name}
                      loading="lazy"
                      style={{
                        height: Math.round((h as number) * 0.85),
                        width: "auto",
                        filter: "grayscale(1)",
                        opacity: 0.38,
                      }}
                    />
                  ))}
                </div>
                {/* Interlinking cross-country (LOCAL_SEO §4) al fondo de la
                    columna izquierda: las 5 sedes, la actual sin link.
                    Separador coma: "Ciudad de México · Carso, ..." se lee
                    como dos sedes y no cuatro. Targets con padding táctil. */}
                <p className="method-desc" style={{ marginTop: "2.4rem" }}>
                  {es ? "Todos los 54D Studios:" : "All 54D Studios:"}{" "}
                  {STUDIOS.map((s, i) => (
                    <span key={s.slug}>
                      {i > 0 && ", "}
                      {s.slug === studio.slug ? (
                        <span style={{ color: "var(--c-white)" }}>
                          {cityLabel(s.city, lang)}
                        </span>
                      ) : (
                        <Link
                          to={`/studios/${s.slug}`}
                          style={{
                            color: "var(--c-yellow)",
                            textDecoration: "none",
                            display: "inline-block",
                            padding: "0.6rem 0.25rem",
                            margin: "-0.6rem -0.25rem",
                          }}
                        >
                          {cityLabel(s.city, lang)}
                        </Link>
                      )}
                    </span>
                  ))}
                </p>
              </div>
              <LeadForm
                locationSlug={studio.slug}
                countryCode={studio.countryCode}
                whatsappUrl={hasRealWhatsapp ? whatsappUrl : undefined}
              />
            </div>
          </div>
        </div>
      </section>


      <Footer />
      {hasRealWhatsapp && (
        <WhatsAppFab whatsapp={studio.whatsapp} city={cityPlain(studio.city)} />
      )}
    </div>
  );
}
