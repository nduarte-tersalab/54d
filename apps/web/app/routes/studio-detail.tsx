import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/studio-detail";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";
import { asset } from "../lib/asset";

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

export async function loader({ params }: Route.LoaderArgs) {
  const studio = STUDIOS.find((s) => s.slug === params.slug);
  if (!studio) throw new Response("Not Found", { status: 404 });
  /* Numeros placeholder (555) no viajan ni en el payload de hidratacion:
     se vacian hasta que el cliente cargue los reales en data/studios.ts */
  const whatsapp = studio.whatsapp.includes("555") ? "" : studio.whatsapp;
  return { studio: { ...studio, whatsapp } };
}

/* Display de ciudad: el separador del data (middle dot actual, em dash
   [u2014] legacy) se normaliza a "Mexico City · Carso" en UI y a espacio
   simple ("Mexico City Carso") en SEO/schema, donde el middle dot tampoco
   va (regla COPY_V3 §2: nunca en slugs ni SEO). Escape unicode a
   propósito: el em dash literal está prohibido en apps/web/app (CI grep). */
const cityLabel = (city: string) => city.replace(/\s*\u2014\s*/g, " · ");
const cityPlain = (city: string) =>
  city.replace(/\s*(?:\u2014|\u00B7)\s*/g, " ");

/* Title + meta description por sede: LOCAL_SEO.md §1 verbatim.
   Excepción (SEPARATION_SPEC decisión 2): Hallandale cierra con
   "Apply for the next Generation." en vez del cierre original con
   verbo de carrito (border rule 5 de BRAND_SEPARATION). */
const LOCAL_META: Record<string, { title: string; desc: string }> = {
  "coral-gables": {
    title: "Private Group Transformation Studio in Coral Gables | 54D",
    desc: "54 days, small groups, coaches on the floor, nutrition and physiotherapy on Ponce de Leon Blvd. Join the next Generation at 54D Coral Gables.",
  },
  hallandale: {
    title: "Small Group Transformation Studio in Hallandale Beach | 54D",
    desc: "The 54D Method between Miami and Fort Lauderdale: 54 days, fixed groups, coaches, nutrition and physio at 601 N Federal Hwy. Apply for the next Generation.",
  },
  "mexico-carso": {
    title: "54 Day Transformation Program in Polanco | 54D CDMX",
    desc: "Train the 54D Method steps from Plaza Carso in Nuevo Polanco: small groups, coaches, nutrition and physiotherapy. Next Generation starting soon.",
  },
  "mexico-santa-fe": {
    title: "54 Day Transformation Program in Santa Fe | 54D CDMX",
    desc: "The 54D Method in the corporate heart of Santa Fe, CDMX: fixed Generations, coaches on the floor, nutrition and physio. Limited spots per start.",
  },
  bogota: {
    title: "54 Day Transformation Program in Bogota | 54D",
    desc: "Train the 54D Method steps from Parque de la 93 in Chapinero: small groups, coaches, nutrition and physiotherapy. Join the next Generation.",
  },
};

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "54D Studios" }];
  const { studio } = loaderData;
  const local = LOCAL_META[studio.slug];
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
const HOURS = [
  { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "05:30", closes: "21:00" },
  { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "12:00" },
]; // Del SCHEDULE actual (PLACEHOLDER fase 1: confirmar por sede con Mindbody)

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
    sameAs: ["https://www.instagram.com/54d"], // DATO_PENDIENTE: handle por sede si existe
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
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
  "mexico-carso": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Mexico City Carso", url: "https://54d.com/studios/mexico-carso",
    address: { "@type": "PostalAddress", streetAddress: "Lago Zurich 245, Ampliacion Granada", // DATO_PENDIENTE
      addressLocality: "Miguel Hidalgo", addressRegion: "CDMX", postalCode: "11529", addressCountry: "MX" },
    geo: { "@type": "GeoCoordinates", latitude: 19.4404, longitude: -99.2046 },
    /* telephone: DATO_PENDIENTE — no publicar NAP falso (jurado HT fix 1) */
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
  "mexico-santa-fe": {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Mexico City Santa Fe", url: "https://54d.com/studios/mexico-santa-fe",
    address: { "@type": "PostalAddress", streetAddress: "Av. Vasco de Quiroga 3800", // DATO_PENDIENTE
      addressLocality: "Cuajimalpa", addressRegion: "CDMX", postalCode: "05348", addressCountry: "MX" },
    geo: { "@type": "GeoCoordinates", latitude: 19.3599, longitude: -99.2743 },
    /* telephone: DATO_PENDIENTE — no publicar NAP falso (jurado HT fix 1) */
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
  },
  bogota: {
    "@context": "https://schema.org", "@type": "ExerciseGym",
    name: "54D Bogota", url: "https://54d.com/studios/bogota",
    address: { "@type": "PostalAddress", streetAddress: "Cra. 11 #93-10, Chapinero", // DATO_PENDIENTE
      addressLocality: "Bogota", addressRegion: "Bogota D.C.", addressCountry: "CO" },
    geo: { "@type": "GeoCoordinates", latitude: 4.6768, longitude: -74.0484 },
    /* telephone: DATO_PENDIENTE — no publicar NAP falso (jurado HT fix 1) */
    openingHoursSpecification: HOURS, priceRange: "$$$$",
    sameAs: ["https://www.instagram.com/54d"], parentOrganization: ORG,
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

/* Bloque de contenido local por sede: LOCAL_SEO.md §3 verbatim
   (zonas y vias reales, 60-72 palabras por sede) */
const LOCAL_COPY: Record<string, string> = {
  "coral-gables":
    "Our Coral Gables studio sits at 4210 Ponce de Leon Blvd, a few blocks from the Shops at Merrick Park and the Douglas Road Metrorail station. Members drive in from Coconut Grove, South Miami and Brickell for one reason: a 54 day program you cannot get anywhere else in Miami. First sessions start at 6 AM, and you can be back on US 1 before the city wakes up.",
  hallandale:
    "54D Hallandale sits at 601 N Federal Hwy (US 1), minutes from the beach and the halfway point between Miami and Fort Lauderdale. Members come from Aventura, Hollywood, Sunny Isles and Golden Beach, most within a ten minute drive. Morning Generations finish before the Gulfstream Park traffic starts, and the studio's location makes it the natural home for the method in Broward County.",
  "mexico-carso":
    "In Nuevo Polanco, steps from Plaza Carso and the Museo Soumaya, our studio serves the executives and families of Polanco, Granada and Irrigacion. Lago Zurich is minutes from Ejercito Nacional and Ferrocarril de Cuernavaca, with parking in the Carso complex. Early Generations let you train, shower and be at your office on Mariano Escobedo or Paseo de la Reforma before 8 AM.",
  "mexico-santa-fe":
    "Our Santa Fe studio sits on Av. Vasco de Quiroga, in the corporate district that runs from Centro Santa Fe to Parque La Mexicana. If you work in the towers of Santa Fe or live in Bosques de las Lomas, Interlomas or Contadero, your Generation trains here: before the office, or right after, without crossing the city.",
  bogota:
    "54D Bogota lives in Chapinero, steps from Parque de la 93 on Carrera 11. The studio draws members from Chico, Rosales and Usaquen, many walking over from the offices along the Calle 93 corridor. Sessions start at 5:30 AM, before the Septima fills up, and the neighborhood's cafes have adopted our Generations as their post workout ritual.",
};

/* Sub localizado del hero por sede (zona/barrio): PLACEHOLDER, confirmar con cliente */
const ZONE: Record<string, string> = {
  "coral-gables": "In the heart of Coral Gables, on Ponce de Leon Blvd.",
  hallandale: "Between Miami and Fort Lauderdale, on N Federal Hwy.",
  "mexico-carso": "In Nuevo Polanco, right by Plaza Carso.",
  "mexico-santa-fe": "In the corporate heart of Santa Fe.",
  bogota: "In Chapinero, steps from Parque de la 93.",
};

/* Próxima generación por sede: DATO_PENDIENTE (fechas y cupos placeholder,
   confirmar con cliente / Mindbody antes del launch) */
const GENERATION: Record<string, { start: string; startShort: string; spots: number }> = {
  "coral-gables": { start: "Monday, August 17", startShort: "AUG 17", spots: 20 },
  hallandale: { start: "Monday, August 24", startShort: "AUG 24", spots: 20 },
  "mexico-carso": { start: "Monday, August 17", startShort: "AUG 17", spots: 24 },
  "mexico-santa-fe": { start: "Monday, August 24", startShort: "AUG 24", spots: 24 },
  bogota: { start: "Monday, August 31", startShort: "AUG 31", spots: 20 },
};

/* Horarios estáticos fase 1: PLACEHOLDER (Mindbody live en fase 2) */
const SCHEDULE = [
  { days: "Monday to Friday", hours: "5:30 AM to 9:00 PM" },
  { days: "Saturday", hours: "7:00 AM to 12:00 PM" },
  { days: "Sunday", hours: "Active recovery: your protocol sets it" },
];

/* Qué incluye la experiencia presencial en la sede */
const INCLUDES = [
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
];

/* ============================================================
   Fotos por sede (ART_DIRECTION_V3 §2)
   Coral Gables: galería real del studio (IMAGES_CG.md, 9 verticales 2:3).
   Resto de sedes: fotos de marca 54D con captions genéricos (no
   afirman ser esa sede) hasta que el cliente envíe fotos propias.
   Ratios calculados para igualar alturas en el photo-grid
   (columna 3fr a ratio R exige columna 2fr a ratio 1.5R).
   ============================================================ */
type GalleryPhoto = {
  src: string;
  alt: string;
  ratio: string;
  caption: string;
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
    src: hl("class-under-letters.jpg"),
    alt: "A full 54D generation posing under the giant 54D letters at the Hallandale studio",
  },
};

const GALLERY_ROWS: Record<string, GalleryRow[]> = {
  "coral-gables": [
    {
      photos: [
        {
          src: cg("boxing-focus.jpg"),
          alt: "Athlete in white boxing gloves working the heavy bag at 54D Coral Gables",
          ratio: "1 / 1",
          caption: "Boxing, coached",
        },
        {
          src: cg("barbell-press-gaze-vertical.jpg"),
          alt: "Athlete pressing a barbell overhead, eyes on the bar, at 54D Coral Gables",
          ratio: "2 / 3",
          caption: "Strength, rep by rep",
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
          caption: "The yellow stairs",
        },
        {
          src: cg("coach-boxing-pads.jpg"),
          alt: "A 54D coach holding the bag for an athlete mid boxing round",
          ratio: "1 / 1",
          caption: "Coaches on the floor",
        },
      ],
    },
    {
      photos: [
        {
          src: cg("bike-floor-laughter.jpg"),
          alt: "Two athletes laughing between rounds on the bike floor at 54D Coral Gables",
          ratio: "3 / 2",
          caption: "The bike floor",
        },
        {
          src: cg("dumbbell-strength-light.jpg"),
          alt: "Athlete pressing a dumbbell overhead in natural window light",
          ratio: "1 / 1",
          caption: "54D iron, every rep",
        },
      ],
    },
  ],
  hallandale: [
    {
      photos: [
        {
          src: hl("dumbbell-press.jpg"),
          alt: "Athlete pressing 54D dumbbells at shoulder height, focused",
          ratio: "1 / 1",
          caption: "54D iron, every rep",
        },
        {
          src: hl("stairs-vertical.jpg"),
          alt: "Runner in a 54D top climbing the yellow staircase at Hallandale",
          ratio: "2 / 3",
          caption: "The yellow stairs",
        },
      ],
    },
    {
      flip: true,
      photos: [
        {
          src: hl("coach-headset.jpg"),
          alt: "54D coach with a headset leading cardio between the boxing bags",
          ratio: "2 / 3",
          caption: "Coaches on the floor",
        },
        {
          src: hl("coach-hands.jpg"),
          alt: "Coach correcting an athlete's dumbbell press with his hands",
          ratio: "1 / 1",
          caption: "Hands-on coaching",
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
        caption: "The 54D method on the floor",
      },
      {
        src: "images/brand/coach-class-boxing-bags-vertical.jpg",
        alt: "54D coach standing over a mat class in front of hanging boxing bags",
        ratio: "1 / 1",
        caption: "Small groups, coached live",
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
    src: hl("bench-press-54d.jpg"),
    alt: "Bench press with a 54D branded plate shot from a low dramatic angle",
  },
};

function LeadForm({ locationSlug }: { locationSlug: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL ?? "http://localhost:8788") + "/leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            phone: data.get("phone"),
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
    maxWidth: "36rem",
    marginTop: "3rem",
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
          Application{" "}
          <span style={{ color: "var(--c-yellow)" }}>received.</span>
        </div>
        <p className="method-desc" style={{ marginTop: "0.9rem" }}>
          We will reach out on WhatsApp to schedule your consultation.
        </p>
      </div>
    );
  }

  /* Mini-form de reserva: nombre + WhatsApp (DESIGN_FIXES_V4 §5).
     El API acepta leads con solo phone (email O phone requerido). */
  return (
    <form onSubmit={handleSubmit} style={panelStyle} noValidate={false}>
      <div className="field">
        <label htmlFor="lead-name">Name</label>
        <input
          id="lead-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your full name"
        />
      </div>
      <div className="field">
        <label htmlFor="lead-phone">WhatsApp</label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+1 · +52 · +57"
        />
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
        {status === "sending" ? "Sending…" : "Request a consultation"}
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
          We couldn't send your details. Try again, or message us directly on
          WhatsApp.
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
        We contact you for one thing: scheduling your consultation. No spam,
        no endless calls.
      </p>
    </form>
  );
}

export default function StudioDetail({ loaderData }: Route.ComponentProps) {
  const { studio } = loaderData;
  const generation = GENERATION[studio.slug];
  const whatsappUrl = `https://wa.me/${studio.whatsapp.replace(/\D/g, "")}`;
  /* Numeros reales pendientes del cliente (jurado HT fix 1): un WhatsApp
     falso visible es grieta de credibilidad en un producto flagship.
     Con numeros reales en data/studios.ts esto se enciende solo. */
  const hasRealWhatsapp = studio.whatsapp.length > 0;

  const heroPhoto = HERO_PHOTO[studio.slug];
  const galleryRows = GALLERY_ROWS[studio.slug] ?? BRAND_ROWS;
  const bandPhoto = BAND_PHOTO[studio.slug];

  const gen = useReveal();
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
            <Link to="/" style={{ color: "var(--c-mist)", textDecoration: "none" }}>
              54D
            </Link>
            <span aria-hidden="true" style={{ margin: "0 0.45rem" }}>
              /
            </span>
            <Link
              to="/studios"
              style={{ color: "var(--c-mist)", textDecoration: "none" }}
            >
              Studios
            </Link>
            <span aria-hidden="true" style={{ margin: "0 0.45rem" }}>
              /
            </span>
            <span aria-current="page" style={{ color: "var(--c-white)" }}>
              54D {cityLabel(studio.city)}
            </span>
          </nav>
          <h1 className="hero-title">
            54D
            <br />
            <span className="accent">{cityLabel(studio.city)}.</span>
          </h1>
          <p className="hero-sub">
            {ZONE[studio.slug] ?? studio.address} The full method, in person:
            your Generation, your coaches, your result.
          </p>
          <div className="hero-ctas">
            <a href="#reserva" className="btn btn-primary">
              Request a consultation
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
                WhatsApp us
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ============ PRÓXIMA GENERACIÓN ============ */}
      <section className="section">
        <div className="section-inner" ref={gen.ref}>
          <div className={gen.className}>
            <span className="day-marker">Next Generation</span>
            <h2 className="section-title">
              Generations <span className="accent">fill up.</span>
            </h2>
            <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "38rem" }}>
              {generation
                ? `Yours starts ${generation.start}. Admission is by Generation: one start date, limited places, no rolling entry.`
                : "Admission is by Generation: one start date, limited places, no rolling entry."}
            </p>
            {generation && (
              <div className="stat-row" style={{ maxWidth: "46rem" }}>
                <div className="stat">
                  <div className="stat-value">{generation.startShort}</div>
                  <div className="stat-label">Start date</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{generation.spots}</div>
                  <div className="stat-label">Places per Generation</div>
                </div>
                <div className="stat">
                  <div className="stat-value">54</div>
                  <div className="stat-label">Days with the same group</div>
                </div>
              </div>
            )}
            <div className="hero-ctas" style={{ marginTop: "2.6rem" }}>
              <a href="#reserva" className="btn btn-primary">
                Request a consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUÉ INCLUYE LA EXPERIENCIA ============ */}
      <section className="section">
        <div className="section-inner" ref={includes.ref}>
          <div className={includes.className}>
            <span className="day-marker">The experience</span>
            <div className="method-intro">
              <h2 className="section-title">
                What you get training <span className="accent">here.</span>
              </h2>
              <p>
                You start with a full initial assessment on day 1:
                measurements, history, and goal. From there the whole studio
                team works on your transformation.
              </p>
            </div>
            <div className="method-grid">
              {INCLUDES.map((item) => (
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
              {GALLERY_ROWS[studio.slug] ? "Inside the studio" : "Inside 54D"}
            </span>
            <h2 className="section-title">This is where it happens.</h2>
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
                        <img src={asset(p.src)} alt={p.alt} loading="lazy" />
                      </div>
                      <figcaption className="photo-caption">
                        {p.caption}
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
            <span className="day-marker">Day 54</span>
            <h2 className="section-title">
              Graduation day is real here.
            </h2>
            <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "34rem" }}>
              Every Generation at 54D {cityLabel(studio.city)} ends the same
              way: results on the table and a room full of people who made it.
            </p>
            <div className="hero-ctas">
              <a href="#reserva" className="btn btn-primary">
                Request a consultation
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ============ HORARIOS Y UBICACIÓN ============ */}
      <section className="section">
        <div className="section-inner" ref={location.ref}>
          <div className={location.className}>
            <span className="day-marker">Schedule and location</span>
            <h2 className="section-title">
              Your studio, your <span className="accent">schedule.</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.1rem",
                marginTop: "3rem",
              }}
            >
              {/* Horarios estáticos fase 1: Mindbody live en fase 2 */}
              <div style={panelStyle}>
                <div className="method-name" style={{ marginTop: 0 }}>
                  Schedule
                </div>
                {/* .schedule: tabular-nums vía global CSS (DESIGN_FIXES_V4 §2) */}
                <div className="schedule" style={{ marginTop: "1.4rem" }}>
                  {SCHEDULE.map((row) => (
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
                <p className="method-desc" style={{ marginTop: "1.2rem" }}>
                  Your group's schedule is confirmed in your consultation:
                  each Generation trains in fixed blocks.
                </p>
              </div>
              <div style={panelStyle}>
                <div className="method-name" style={{ marginTop: 0 }}>
                  Location
                </div>
                <p className="method-desc" style={{ marginTop: "1.4rem" }}>
                  {studio.address}
                </p>
                {/* Contenido local por sede (LOCAL_SEO §3, verbatim) */}
                {LOCAL_COPY[studio.slug] && (
                  <p className="method-desc">{LOCAL_COPY[studio.slug]}</p>
                )}
                <p className="method-desc">
                  Not sure how to get here? Message us and we'll point the
                  way.
                </p>
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
                      Get directions
                    </a>
                  )}
                  {studio.phone && (
                    <a
                      href={`tel:${studio.phone.replace(/[^+\d]/g, "")}`}
                      className="btn btn-ghost"
                    >
                      Call · {studio.phone.replace("+1 ", "")}
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
                {/* Interlinking cross-country (LOCAL_SEO §4): las 5 sedes,
                    la actual sin link. Reparte autoridad entre paises. */}
                <p className="method-desc" style={{ marginTop: "1.6rem" }}>
                  All 54D Studios:{" "}
                  {STUDIOS.map((s, i) => (
                    <span key={s.slug}>
                      {i > 0 && " · "}
                      {s.slug === studio.slug ? (
                        <span style={{ color: "var(--c-white)" }}>
                          {cityLabel(s.city)}
                        </span>
                      ) : (
                        <Link
                          to={`/studios/${s.slug}`}
                          style={{ color: "var(--c-yellow)", textDecoration: "none" }}
                        >
                          {cityLabel(s.city)}
                        </Link>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FORMULARIO DE LEAD ============ */}
      {/* FIXES_V5 §3.2: único campo de luz de la página (ember pre-CTA) */}
      <section className="section bloom-ember" id="reserva">
        <div className="section-inner" ref={lead.ref}>
          <div className={lead.className}>
            <span className="day-marker">Apply</span>
            <h2 className="section-title">
              Apply for your place in the next{" "}
              <span className="accent">Generation.</span>
            </h2>
            {/* Guardrail high-ticket (SEPARATION_SPEC §4, verbatim) */}
            <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "36rem" }}>
              54D Studios is our flagship tier, a private-client level
              program. Your consultation covers fit, your Generation's start
              date, and the investment.
            </p>
            <LeadForm locationSlug={studio.slug} />
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL: CRUCE A ON ============ */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              Not close by? Do the method{" "}
              <span className="accent">online.</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/on" className="btn btn-primary">
                Explore 54D ON
              </Link>
              <Link to="/method" className="btn btn-ghost">
                See the method
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
