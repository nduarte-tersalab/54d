import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/studio-detail";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";
import { asset } from "../lib/asset";

/* ============================================================
   /studios/:slug: detalle de sede (54D Studios)
   Funnel: conversión presencial. Fase 1: lead → POST /leads
   (Mindbody live en fase 2). Copy según SITE_STRATEGY.md y
   COPY_V3.md (sin em/en dashes en copy visible).
   Fotos: galería real de Coral Gables (IMAGES_CG.md); resto de
   sedes con fotos de marca genéricas (IMAGES_BRAND.md).
   ============================================================ */

export async function loader({ params }: Route.LoaderArgs) {
  const studio = STUDIOS.find((s) => s.slug === params.slug);
  if (!studio) throw new Response("Not Found", { status: 404 });
  return { studio };
}

/* Display de ciudad: el em dash del data ("Mexico City [u2014] Carso") se
   convierte a middle dot ("Mexico City · Carso") en UI y a espacio simple
   ("Mexico City Carso") en SEO/schema. Regla COPY_V3 §2. Escape unicode a
   propósito: el caracter literal está prohibido en apps/web/app (CI grep). */
const cityLabel = (city: string) => city.replace(/\s*\u2014\s*/g, " · ");
const cityPlain = (city: string) => city.replace(/\s*\u2014\s*/g, " ");

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "54D Studios" }];
  const { studio } = loaderData;
  return [
    { title: `54D ${cityPlain(studio.city)}: Join the Next Generation` },
    {
      name: "description",
      content: `The 54D Method in ${cityPlain(studio.city)}: small-group training with a coach, nutrition, and physiotherapy. Next Generation starting soon. Limited spots.`,
    },
  ];
}

/* Sub localizado del hero por sede (zona/barrio): PLACEHOLDER, confirmar con cliente */
const ZONE: Record<string, string> = {
  "coral-gables": "In the heart of Coral Gables, on Ponce de Leon Blvd.",
  hallandale: "Between Miami and Fort Lauderdale, on Hallandale Beach Blvd.",
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

/* Foto real de hero solo donde existe galería propia de la sede */
const HERO_PHOTO: Record<string, { src: string; alt: string }> = {
  "coral-gables": {
    src: cg("jump-training-54d-wall-01.jpg"),
    alt: "Athlete mid jump during plyometric training in front of the giant 54 mural at 54D Coral Gables",
  },
};

const GALLERY_ROWS: Record<string, GalleryRow[]> = {
  "coral-gables": [
    {
      photos: [
        {
          src: cg("group-squat-class-01.jpg"),
          alt: "Full class holding deep squats under the LED strips at 54D Coral Gables",
          ratio: "1 / 1",
          caption: "Every rep, watched",
        },
        {
          src: cg("coach-with-headset-01.jpg"),
          alt: "54D coach with a headset mic leading the class on the training floor",
          ratio: "2 / 3",
          caption: "Coaches on the floor",
        },
      ],
    },
    {
      flip: true,
      photos: [
        {
          src: cg("spin-bikes-boxing-bags-01.jpg"),
          alt: "Row of spin bikes in use with boxing bags hanging from the rig behind",
          ratio: "2 / 3",
          caption: "The equipment",
        },
        {
          src: cg("barbell-press-class-01.jpg"),
          alt: "Group class pressing barbells with the 54D mural in the background",
          ratio: "1 / 1",
          caption: "Strength, coached live",
        },
      ],
    },
    {
      photos: [
        {
          src: cg("agility-ladder-drill-01.jpg"),
          alt: "Two athletes running an agility ladder drill past the golden 54D wall logo",
          ratio: "1 / 1",
          caption: "Speed and agility work",
        },
        {
          src: cg("group-cardio-session-01.jpg"),
          alt: "Group cardio session in full movement on the 54D training floor",
          ratio: "2 / 3",
          caption: "Cardio with the group",
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

/* Banda fotográfica emocional: solo Coral Gables (foto de graduación real) */
const BAND_PHOTO: Record<string, { src: string; alt: string }> = {
  "coral-gables": {
    src: cg("graduation-celebration-01.jpg"),
    alt: "Emotional group hug at a 54D graduation with golden balloons and the 54D mural",
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
            email: data.get("email"),
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
    borderRadius: "var(--r-lg)",
    background: "var(--glass)",
    border: "1px solid var(--hairline)",
    backdropFilter: "blur(10px)",
  };

  if (status === "success") {
    return (
      <div style={panelStyle} aria-live="polite">
        <div
          className="method-name"
          style={{ marginTop: 0, fontSize: "1.5rem" }}
        >
          Done. Your spot is <span style={{ color: "var(--c-yellow)" }}>held.</span>
        </div>
        <p className="method-desc" style={{ marginTop: "0.9rem" }}>
          We got your details. We'll reach out on WhatsApp to confirm your
          spot in the next Generation and answer any questions.
        </p>
      </div>
    );
  }

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
        <label htmlFor="lead-email">Email</label>
        <input
          id="lead-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
        />
      </div>
      <div className="field">
        <label htmlFor="lead-phone">Phone</label>
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
        {status === "sending" ? "Sending…" : "Reserve your spot"}
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
        We contact you for one thing: confirming your spot. No spam, no
        endless calls.
      </p>
    </form>
  );
}

export default function StudioDetail({ loaderData }: Route.ComponentProps) {
  const { studio } = loaderData;
  const generation = GENERATION[studio.slug];
  const siblings = STUDIOS.filter(
    (s) => s.countryCode === studio.countryCode && s.slug !== studio.slug
  );
  const whatsappUrl = `https://wa.me/${studio.whatsapp.replace(/\D/g, "")}`;

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
    borderRadius: "var(--r-lg)",
    background: "var(--glass)",
    border: "1px solid var(--hairline)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div>
      <Nav />

      {/* Schema LocalBusiness/ExerciseGym: SEO local + AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ExerciseGym",
            name: `54D ${cityPlain(studio.city)}`,
            address: studio.address,
            telephone: studio.whatsapp,
            url: `https://54d.com/studios/${studio.slug}`,
          }),
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
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/studios">Studios</Link>
            <span>/</span>
            <span>{cityLabel(studio.city)}</span>
          </nav>
          <span className="day-marker">54D Studios · {studio.country}</span>
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
              Reserve your spot
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Message us on WhatsApp
            </a>
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
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "38rem",
                fontSize: "1.08rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              {generation
                ? `Yours starts ${generation.start}. Limited spots: when it's full, the next window is the next Generation.`
                : "Limited spots per Generation: when it's full, the next window is the next Generation."}
            </p>
            {generation && (
              <div className="stat-row" style={{ maxWidth: "46rem" }}>
                <div className="stat">
                  <div className="stat-value">{generation.startShort}</div>
                  <div className="stat-label">Start date</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{generation.spots}</div>
                  <div className="stat-label">Spots per Generation</div>
                </div>
                <div className="stat">
                  <div className="stat-value">54</div>
                  <div className="stat-label">Days with the same group</div>
                </div>
              </div>
            )}
            <div className="hero-ctas" style={{ marginTop: "2.6rem" }}>
              <a href="#reserva" className="btn btn-primary">
                Reserve your spot
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
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "34rem",
                fontSize: "1.08rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              Every Generation at 54D {cityLabel(studio.city)} ends the same
              way: results on the table and a room full of people who made it.
            </p>
            <div className="hero-ctas">
              <a href="#reserva" className="btn btn-primary">
                Reserve your spot
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
                <div style={{ marginTop: "1.4rem" }}>
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
                  Your group's schedule is confirmed when you reserve: each
                  Generation trains in fixed blocks.
                </p>
              </div>
              <div style={panelStyle}>
                <div className="method-name" style={{ marginTop: 0 }}>
                  Location
                </div>
                <p className="method-desc" style={{ marginTop: "1.4rem" }}>
                  {studio.address}
                </p>
                <p className="method-desc">
                  Parking and public transit access in the area. Not sure how
                  to get here? Message us and we'll point the way.
                </p>
                <div
                  style={{
                    marginTop: "1.8rem",
                    display: "flex",
                    gap: "0.8rem",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                    style={{ padding: "0.8rem 1.6rem", fontSize: "0.85rem" }}
                  >
                    WhatsApp · {studio.whatsapp}
                  </a>
                </div>
                {siblings.length > 0 && (
                  <p className="method-desc" style={{ marginTop: "1.6rem" }}>
                    Also in {studio.country}:{" "}
                    {siblings.map((s, i) => (
                      <span key={s.slug}>
                        {i > 0 && " · "}
                        <Link
                          to={`/studios/${s.slug}`}
                          style={{ color: "var(--c-yellow)", textDecoration: "none" }}
                        >
                          {cityLabel(s.city)}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FORMULARIO DE LEAD ============ */}
      <section className="section" id="reserva">
        <div className="section-inner" ref={lead.ref}>
          <div className={lead.className}>
            <span className="day-marker">Reserve</span>
            <h2 className="section-title">
              Reserve your spot in the next{" "}
              <span className="accent">Generation.</span>
            </h2>
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "36rem",
                fontSize: "1.08rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              Leave your details and we'll reach out to confirm your spot,
              your schedule, and your initial assessment at 54D{" "}
              {cityLabel(studio.city)}.
            </p>
            <LeadForm locationSlug={studio.slug} />
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL: CRUCE A ON ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
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
