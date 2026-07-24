/* ============================================================
   54D Studios — single source of truth for locations (shared).
   5 active locations: Coral Gables, Hallandale, Mexico City
   Carso, Mexico City Santa Fe, Bogotá. NYC was removed: do
   not add it back.
   Addresses and WhatsApp numbers are PLACEHOLDER — confirm
   with the client before launch.
   ============================================================ */

export type CountryCode = "US" | "MX" | "CO";

export interface Studio {
  slug: string;
  /** Display name of the location (as shown in the UI) */
  city: string;
  country: string;
  countryCode: CountryCode;
  /** PLACEHOLDER — address pending client confirmation */
  address: string;
  /** PLACEHOLDER — WhatsApp number pending client confirmation */
  whatsapp: string;
  /** IANA timezone of the location */
  timezone: string;
}

export const STUDIOS: Studio[] = [
  {
    slug: "coral-gables",
    city: "Coral Gables",
    country: "United States",
    countryCode: "US",
    address: "2222 Ponce de Leon Blvd, Coral Gables, FL 33134", // PLACEHOLDER
    whatsapp: "+1 305 555 0154", // PLACEHOLDER
    timezone: "America/New_York",
  },
  {
    slug: "hallandale",
    city: "Hallandale",
    country: "United States",
    countryCode: "US",
    address: "1000 E Hallandale Beach Blvd, Hallandale Beach, FL 33009", // PLACEHOLDER
    whatsapp: "+1 954 555 0154", // PLACEHOLDER
    timezone: "America/New_York",
  },
  {
    slug: "mexico-carso",
    city: "Mexico City — Carso",
    country: "Mexico",
    countryCode: "MX",
    address: "Lago Zúrich 245, Ampliación Granada, Miguel Hidalgo, 11529 CDMX", // PLACEHOLDER
    whatsapp: "+52 55 5555 0154", // PLACEHOLDER
    timezone: "America/Mexico_City",
  },
  {
    slug: "mexico-santa-fe",
    city: "Mexico City — Santa Fe",
    country: "Mexico",
    countryCode: "MX",
    address: "Av. Vasco de Quiroga 3800, Santa Fe, Cuajimalpa, 05348 CDMX", // PLACEHOLDER
    whatsapp: "+52 55 5555 0155", // PLACEHOLDER
    timezone: "America/Mexico_City",
  },
  {
    slug: "bogota",
    city: "Bogotá",
    country: "Colombia",
    countryCode: "CO",
    address: "Cra. 11 #93-10, Chapinero, Bogotá", // PLACEHOLDER
    whatsapp: "+57 300 555 0154", // PLACEHOLDER
    timezone: "America/Bogota",
  },
];
