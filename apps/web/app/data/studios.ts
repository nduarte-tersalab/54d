/* ============================================================
   54D Studios: single source of truth for locations (shared).
   5 active locations: Coral Gables, Hallandale, Mexico City
   Carso, Mexico City Santa Fe, Bogotá. NYC was removed: do
   not add it back.
   NAP de Coral Gables y Hallandale VERIFICADO contra sus
   perfiles de Google Business (30/07/2026, links del cliente).
   MX y CO siguen PLACEHOLDER: confirmar antes de publicarlos.
   Display naming (COPY_V3.md §2): "{City} · {Area}" with a
   middle dot, only when a city has more than one studio. The
   dot is display-only: never in slugs or SEO titles.
   ============================================================ */

export type CountryCode = "US" | "MX" | "CO";

/** Display de ciudad compartido (footer, index y sedes): normaliza el
 *  separador legacy (em/en dash, escapados por el grep de CI) a " · " y
 *  localiza el nombre visible en ES. Slugs, SEO y schema quedan EN. */
export const cityLabel = (city: string, lang: "en" | "es" = "en"): string => {
  const dotted = city.replace(/\s*[\u2014\u2013]\s*/g, " · ");
  return lang === "es"
    ? dotted.replace("Mexico City", "Ciudad de México")
    : dotted;
};

export interface Studio {
  slug: string;
  /** Display name of the location (as shown in the UI) */
  city: string;
  country: string;
  countryCode: CountryCode;
  address: string;
  /** WhatsApp number: PLACEHOLDER hasta confirmar linea por sede */
  whatsapp: string;
  /** IANA timezone of the location */
  timezone: string;
  /** Telefono publico verificado (Google Business Profile) — tel: y schema */
  phone?: string;
  /** Coordenadas del perfil de Google (schema GeoCoordinates) */
  geo?: { lat: number; lng: number };
  /** Link corto oficial de Google Maps (schema hasMap + CTA directions) */
  mapsUrl?: string;
  /** true solo cuando dirección y teléfono salieron del GBP real */
  napVerified?: boolean;
  /** Handle de Instagram por sede (cliente, 04/08/2026) */
  instagram?: string;
}

export const STUDIOS: Studio[] = [
  {
    slug: "coral-gables",
    city: "Coral Gables",
    country: "United States",
    countryCode: "US",
    address: "4210 Ponce de Leon Blvd, Coral Gables, FL 33146",
    whatsapp: "+1 786 769 4956",
    timezone: "America/New_York",
    phone: "+1 786-817-7008",
    instagram: "https://www.instagram.com/54d.mia",
    geo: { lat: 25.7327988, lng: -80.2587469 },
    mapsUrl: "https://maps.app.goo.gl/b2uZ1n7XQJv75em86",
    napVerified: true,
  },
  {
    slug: "hallandale",
    city: "Hallandale",
    country: "United States",
    countryCode: "US",
    address: "601 N Federal Hwy, Hallandale Beach, FL 33009",
    whatsapp: "+1 786 583 4387",
    timezone: "America/New_York",
    phone: "+1 786-583-4387",
    instagram: "https://www.instagram.com/54d.mia",
    geo: { lat: 25.9927944, lng: -80.1433381 },
    mapsUrl: "https://maps.app.goo.gl/7y6WxPq2zHR8G473A",
    napVerified: true,
  },
  {
    slug: "mexico-carso",
    city: "Mexico City · Carso",
    country: "Mexico",
    countryCode: "MX",
    address: "C. Lago Zurich 219, Amp Granada, Miguel Hidalgo, 11529 CDMX",
    whatsapp: "+52 55 2337 8937",
    timezone: "America/Mexico_City",
    phone: "+52 55 5250 5301",
    instagram: "https://www.instagram.com/54d.mx/",
    mapsUrl: "https://www.google.com/maps/search/54D+Plaza+Carso+Ciudad+de+Mexico",
    napVerified: true,
  },
  {
    slug: "mexico-santa-fe",
    city: "Mexico City · Santa Fe",
    country: "Mexico",
    countryCode: "MX",
    address: "Av. Javier Barros Sierra 540, Santa Fe, Álvaro Obregón, 01376 CDMX",
    whatsapp: "+52 55 2337 8937",
    timezone: "America/Mexico_City",
    phone: "+52 55 1809 0259",
    instagram: "https://www.instagram.com/54d.mx/",
    mapsUrl: "https://www.google.com/maps/search/54D+Santa+Fe+Ciudad+de+Mexico",
    napVerified: true,
  },
  {
    slug: "bogota",
    city: "Bogotá",
    country: "Colombia",
    countryCode: "CO",
    /* GBP de Bogotá SIN RECLAMAR al 06/08/2026: dirección del perfil
       (Cl. 109), CONFIRMAR con cliente antes de darla por definitiva */
    address: "Cl. 109 #18b-51, Bogotá",
    whatsapp: "+57 300 228 3913",
    timezone: "America/Bogota",
    phone: "+57 1 6949016",
    instagram: "https://www.instagram.com/54d.col",
    mapsUrl: "https://www.google.com/maps/search/54D+Bogota",
  },
];
