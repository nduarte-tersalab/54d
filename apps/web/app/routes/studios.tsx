import { Link } from "react-router";
import type { Route } from "./+types/studios";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";
import { asset } from "../lib/asset";

/* ============================================================
   /studios: index de sedes (54D Studios)
   Funnel: consideración presencial. Copy según SITE_STRATEGY.md
   y COPY_V3.md (sin em/en dashes en copy visible).
   Fotos reales según ART_DIRECTION_V3.md + IMAGES_BRAND.md.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D Studios: Miami, Mexico City, Bogotá" },
    {
      name: "description",
      content:
        "Live the 54D Method in person: small groups, coaches on the floor, nutrition and physiotherapy. Five studios across three countries. Reserve your spot.",
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
    title: "Reserve your spot",
    desc: "Spots per Generation are limited. When it's full, it's full. The next window is the next Generation, not tomorrow.",
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
    desc: "Final measurements, results on the table, and the plan to keep them. The program ends. The new you doesn't.",
  },
];

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
        src: "images/brand/gym-structure-heavy-bags-wide.jpg",
        alt: "Industrial 54D gym structure with heavy bags hanging from chains over the training floor",
        ratio: "3 / 2",
        caption: "The floor, the rig, the bags",
      },
      {
        src: "images/brand/coach-class-boxing-bags-vertical.jpg",
        alt: "54D coach standing over a mat class in front of a row of hanging boxing bags",
        ratio: "1 / 1",
        caption: "Coaches in the room",
      },
    ],
  },
  {
    flip: true,
    photos: [
      {
        src: "images/brand/coach-stretch-demo-vertical.jpg",
        alt: "Coach with a headset demonstrating a stretch to students seated on mats",
        ratio: "1 / 1",
        caption: "Demo first, then work",
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
            src={asset("images/brand/studio-class-54d-mural-stairs.jpg")}
            alt="Full 54D class training on mats with a coach standing, giant 54D mural on the wall"
          />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Studios</span>
          </nav>
          <span className="day-marker">54D Studios</span>
          <h1 className="hero-title">
            Three countries.
            <br />
            <span className="accent">Five studios.</span>
          </h1>
          <p className="hero-sub">
            The full experience of the method: coaches on the floor, a
            nutritionist, physiotherapy, and a Generation that trains with you.
          </p>
          <div className="hero-ctas">
            <a href="#sedes" className="btn btn-primary">
              Find your studio
            </a>
            <Link to="/on" className="btn btn-ghost">
              Explore 54D ON
            </Link>
          </div>
        </div>
      </header>

      {/* ============ MAPA CONCEPTUAL DE SEDES (grid de cards) ============ */}
      <section className="section" id="sedes">
        <div className="section-inner" ref={map.ref}>
          <div className={map.className}>
            <span className="day-marker">Studios</span>
            <h2 className="section-title">
              Choose your <span className="accent">studio.</span>
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "1rem",
                    }}
                  >
                    <span className="method-num">{s.countryCode}</span>
                    <span className="studio-country">{s.country}</span>
                  </div>
                  <div className="method-name" style={{ marginTop: "2rem" }}>
                    {cityLabel(s.city)}
                  </div>
                  <p className="method-desc">{s.address}</p>
                  <span
                    className="studio-cta"
                    style={{ marginTop: "1.6rem", alignSelf: "flex-start" }}
                  >
                    Book →
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
      <section className="section">
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
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "38rem",
                fontSize: "1.08rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              Each studio opens Generations: the group you start and finish
              with. A start date, limited spots, and 54 days together. That's
              why it works. This is not an open membership. It's a commitment
              with a date.
            </p>
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
      </section>

      {/* ============ PHOTO BAND: COMUNIDAD (foto grupal real) ============ */}
      <section className="photo-band">
        <img
          src={asset("images/brand/group-photo-54d-mural.jpg")}
          alt="A full 54D Generation smiling together in front of the 54D mural after class"
          loading="lazy"
        />
        <div className="photo-band-content">
          <span className="day-marker">The Generation</span>
          <h2 className="section-title">
            You start with strangers.
            <br />
            You finish with your people.
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

      {/* ============ CTA FINAL: CRUCE A ON ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              No studio in your city?
              <br />
              The full method lives <span className="accent">online.</span>
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
