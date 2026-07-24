import { Link } from "react-router";
import type { Route } from "./+types/studios";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";

/* ============================================================
   /studios — Index de sedes (54D Studios)
   Funnel: consideración presencial. Copy según SITE_STRATEGY.md.
   Mapa conceptual: grid de cards glass por ciudad (no mapa real).
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D Studios — Miami, Mexico City, Bogotá" },
    {
      name: "description",
      content:
        "Live the 54D Method in person: small groups, coaches on the floor, nutrition and physiotherapy. Five studios across three countries. Reserve your spot.",
    },
  ];
}

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
    desc: "Spots per Generation are limited. When it's full, it's full — the next window is the next Generation, not tomorrow.",
  },
  {
    day: "D01",
    title: "Your Generation starts",
    desc: "Everyone starts the same day, with the same initial assessment. No one joins late and no one starts alone.",
  },
  {
    day: "D01–D54",
    title: "Same group, 54 days",
    desc: "You train with the same people and the same coaches through the entire program. The pressure of the group is part of the method.",
  },
  {
    day: "D54",
    title: "Your Generation closes",
    desc: "Final measurements, results on the table, and the plan to keep them. The program ends. The new you doesn't.",
  },
];

export default function Studios() {
  const map = useReveal();
  const experience = useReveal();
  const generations = useReveal();
  const cta = useReveal();

  return (
    <div>
      <Nav />

      {/* ============ HERO INTERIOR ============ */}
      <header className="hero hero-inner">
        <div className="hero-media">
          <div className="hero-poster" />
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

      {/* ============ MAPA CONCEPTUAL DE SEDES (grid glass) ============ */}
      <section className="section bloom" id="sedes">
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
                    {s.city}
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

      {/* ============ LA EXPERIENCIA PRESENCIAL ============ */}
      <section className="section bloom-right">
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
      <section className="section bloom">
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
              Each studio opens Generations — the group you start and finish
              with — with a start date, limited spots, and 54 days together.
              That's why it works: this is not an open membership. It's a
              commitment with a date.
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

      {/* ============ CTA FINAL — CRUCE A ON ============ */}
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
