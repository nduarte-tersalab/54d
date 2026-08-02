import { Link } from "react-router";
import type { Route } from "./+types/studios";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";
import { asset } from "../lib/asset";

/* ============================================================
   /studios: index de sedes (54D Studios)
   Funnel: consideración presencial high-ticket (flagship, por
   aplicación: el CTA es la consulta, nunca carrito). Copy según
   SITE_STRATEGY.md, COPY_V3.md y SEPARATION_SPEC.md §3 (sin
   em/en dashes en copy visible).
   Fotos reales según ART_DIRECTION_V3.md + IMAGES_BRAND.md.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D Studios: The Flagship Experience in 3 Countries" },
    {
      name: "description",
      content:
        "The 54D Method in person: a dedicated team of coaches, nutritionist, and physiotherapy. Admission by Generation, by application. Miami, Mexico City, Bogotá.",
    },
  ];
}

/* Display de ciudad: el em dash del data ("Mexico City [u2014] Carso") se
   convierte a middle dot ("Mexico City · Carso") solo en UI.
   Regla COPY_V3 §2: nunca en slugs ni SEO. Escape unicode a propósito:
   el caracter literal está prohibido en apps/web/app (CI grep). */
const cityLabel = (city: string) => city.replace(/\s*\u2014\s*/g, " · ");

/* La experiencia presencial: qué la hace distinta a entrenar solo */
const EXPERIENCE = [
  {
    num: "01",
    name: "Small groups",
    desc: "No one gets lost in the crowd. Limited spots per Generation, so every session has your name on it and your form gets real attention.",
  },
  {
    num: "02",
    name: "Coaches on the floor",
    desc: "You don't follow a screen. A coach two meters away corrects you. Every rep counts because someone is watching it.",
  },
  {
    num: "03",
    name: "Nutritionist",
    desc: "Your nutrition protocol is built and adjusted at the studio, with real measurements. What you eat is part of the program.",
  },
  {
    num: "04",
    name: "Physiotherapy",
    desc: "Prevention and recovery inside the program. You train hard for 54 days because a team makes sure you cross the finish line in one piece.",
  },
];

/* Cómo funcionan las generaciones: fecha de inicio + cupo limitado */
const GENERATION_TIMELINE = [
  {
    day: "Today",
    title: "Request a consultation",
    desc: "Admission is by Generation: one start date, limited places, no rolling entry. Your consultation covers fit, dates, and the investment.",
  },
  {
    day: "D01",
    title: "Your Generation starts",
    desc: "Everyone starts the same day, with the same initial assessment. No one joins late and no one starts alone.",
  },
  {
    day: "D01 to D54",
    title: "Same group, 54 days",
    desc: "You train with the same people and the same coaches through the entire program. The pressure of the group is part of the method.",
  },
  {
    day: "D54",
    title: "Your Generation closes",
    desc: "Final measurements, results on the table, and how you keep them. The program ends. The new you doesn't.",
  },
];

/* PROHIBIDAS en Studios (boxeo/conos verificados): brand/coach-stretch-demo-vertical,
   brand/coach-class-boxing-bags-vertical, brand/gym-structure-heavy-bags-wide,
   hallandale/coach-headset, coral-gables/boxer-closeup,
   coral-gables/spin-bikes-boxing-bags-01, hd/cg-highfive-euphoria,
   hd/cg-stairs-group */
/* Grid editorial asimétrico (ART_DIRECTION_V3 §2): fotos de marca reales.
   Ratios calculados para que ambas columnas del photo-grid queden a la
   misma altura (3fr a ratio R exige 2fr a ratio 1.5R). */
type FloorPhoto = {
  src: string;
  alt: string;
  ratio: string;
  caption: string;
};

const FLOOR_ROWS: { flip?: boolean; photos: [FloorPhoto, FloorPhoto] }[] = [
  {
    photos: [
      {
        src: "images/studios/coral-gables/bike-floor-laughter.jpg",
        alt: "Two athletes laughing between rounds on the 54D bike floor",
        ratio: "3 / 2",
        caption: "The bike floor",
      },
      {
        src: "images/studios/coral-gables/cardio-jump-mural-vertical.jpg",
        alt: "Athlete mid jump during the cardio block under the 54D mural",
        ratio: "1 / 1",
        caption: "Cardio, coached live",
      },
    ],
  },
  {
    flip: true,
    photos: [
      {
        src: "images/studios/coral-gables/group-cardio-session-01.jpg",
        alt: "A 54D class mid cardio block, the whole group moving together",
        ratio: "1 / 1",
        caption: "The cardio block",
      },
      {
        src: "images/brand/class-plank-rows-54d-mural.jpg",
        alt: "Rows of students holding planks on colored mats under the 54D mural",
        ratio: "3 / 2",
        caption: "One group, one standard",
      },
    ],
  },
];

export default function Studios() {
  const map = useReveal();
  const floor = useReveal();
  const experience = useReveal();
  const generations = useReveal();
  const cta = useReveal();

  return (
    <div>
      <Nav />

      {/* ============ HERO INTERIOR (foto real de marca) ============ */}
      <header className="hero hero-inner">
        <div className="hero-media">
          <img
            src={asset("images/brand/generation-line-54d-mural-wide.jpg")}
            alt="A 54D Generation arm in arm with their coach under the 54D mural"
          />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">54D Studios · The flagship experience</span>
          <h1 className="hero-title">
            Three countries.
            <br />
            <span className="accent">Five studios.</span>
          </h1>
          <p className="hero-sub">
            The complete method with a dedicated team on one outcome: coaches,
            a nutritionist, and a physiotherapist assigned to your Generation.
          </p>
          <div className="hero-ctas">
            <a href="#sedes" className="btn btn-primary">
              Find your studio
            </a>
          </div>
          {/* Guardrail high-ticket (SEPARATION_SPEC §3, verbatim) */}
          <p className="method-desc" style={{ marginTop: "1.6rem", maxWidth: "36rem" }}>
            54D Studios is our flagship tier, a private-client level program.
            Your consultation covers fit, your Generation's start date, and
            the investment.
          </p>
        </div>
      </header>

      {/* ============ MAPA CONCEPTUAL DE SEDES (grid de cards) ============ */}
      {/* FIXES_V5 §3.2: único campo de luz de la página */}
      <section className="section bloom-right" id="sedes">
        <div className="section-inner" ref={map.ref}>
          <div className={map.className}>
            <span className="day-marker">Studios</span>
            <h2 className="section-title">
              Choose your <span className="accent">studio.</span>
            </h2>
            <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "38rem" }}>
              Miami, Mexico City, and Bogotá. Each studio runs its own
              Generations: same method, same standard, your city.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "1.1rem",
                marginTop: "3rem",
              }}
            >
              {STUDIOS.map((s) => (
                <Link
                  key={s.slug}
                  to={`/studios/${s.slug}`}
                  className="method-card"
                  aria-label={`54D ${cityLabel(s.city)} transformation program`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span className="method-num">{s.countryCode}</span>
                  <div className="method-name" style={{ marginTop: "2rem" }}>
                    {cityLabel(s.city)}
                  </div>
                  <p className="method-desc" style={{ marginBottom: "1.6rem" }}>
                    {s.address}
                  </p>
                  <span
                    className="studio-cta"
                    style={{ marginTop: "auto", alignSelf: "flex-start" }}
                  >
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOTOS REALES: EL PISO DE 54D ============ */}
      <section className="section">
        <div className="section-inner" ref={floor.ref}>
          <div className={floor.className}>
            <span className="day-marker">Inside 54D</span>
            <h2 className="section-title">The floor does the talking.</h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "3rem" }}>
              {FLOOR_ROWS.map((row, i) => (
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

      {/* ============ LA EXPERIENCIA PRESENCIAL ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={experience.ref}>
          <div className={experience.className}>
            <span className="day-marker">The experience</span>
            <div className="method-intro">
              <h2 className="section-title">
                In person is another <span className="accent">level.</span>
              </h2>
              <p>
                54D Studios is not another group class. It's the full method
                with a team around you: coaches, a nutritionist, and
                physiotherapy working on your transformation, in person.
              </p>
            </div>
            <div className="method-grid">
              {EXPERIENCE.map((e) => (
                <div className="method-card" key={e.num}>
                  <div className="method-num">{e.num}</div>
                  <div className="method-name">{e.name}</div>
                  <p className="method-desc">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONAN LAS GENERACIONES ============ */}
      <section className="section">
        <div className="section-inner" ref={generations.ref}>
          <div className={generations.className}>
            <span className="day-marker">Generations</span>
            <h2 className="section-title">
              You don't join whenever you want. You join with your{" "}
              <span className="accent">Generation.</span>
            </h2>
            <div className="gen-split">
              <div>
                <p className="lead" style={{ maxWidth: "38rem" }}>
                  Each studio opens Generations: the group you start and
                  finish with. A start date, limited spots, and 54 days
                  together. That's why it works. This is not an open
                  membership. It's a commitment with a date.
                </p>
                <p className="lead" style={{ marginTop: "1rem", maxWidth: "38rem" }}>
                  You are measured on day 1 and on day 54. The numbers are the
                  contract.
                </p>
              </div>
              <div className="timeline">
                {GENERATION_TIMELINE.map((t) => (
                  <div className="timeline-item" key={t.day}>
                    <span className="timeline-day">{t.day}</span>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PHOTO BAND: COMUNIDAD (foto grupal real) ============ */}
      <section className="photo-band band-tight">
        <img
          src={asset("images/brand/group-photo-54d-mural.jpg")}
          alt="A full 54D Generation posing together under the giant 54D mural"
          loading="lazy"
        />
        <div className="photo-band-content">
          <span className="day-marker">The Generation</span>
          <h2 className="section-title">
            You start with strangers.
            <br />
            You finish with your people.
          </h2>
          <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "34rem" }}>
            Every Generation trains, sweats, and graduates together. That is
            what the studios are for.
          </p>
          <div className="hero-ctas">
            <a href="#sedes" className="btn btn-primary">
              Find your studio
            </a>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL: CONSULTA (separacion dura: sin cruce a ON) ============ */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              One consultation.
              <br />
              One decision that holds 54 days.
            </h2>
            <div className="final-links">
              {STUDIOS.map((s) => (
                <Link key={s.slug} to={`/studios/${s.slug}`} className="studio-cta">
                  {cityLabel(s.city)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
