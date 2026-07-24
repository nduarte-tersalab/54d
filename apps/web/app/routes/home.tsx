import type { Route } from "./+types/home";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D — The 54-Day Transformation Method" },
    {
      name: "description",
      content:
        "High-intensity training, personalized nutrition, and a coach on you every day for 54 days. Online, or in our studios in Miami, Mexico City, and Bogotá.",
    },
  ];
}

/* Cuando el cliente entregue el video del hero (R2/Stream), setear acá */
const HERO_VIDEO_URL: string | null = null;
const HERO_POSTER_URL: string | null = null;

const METHOD = [
  {
    num: "D01",
    name: "Training",
    desc: "Daily high-intensity sessions designed by coaches, not by an algorithm. Every day of the program has a purpose.",
  },
  {
    num: "D07",
    name: "Nutrition",
    desc: "A nutrition protocol built for your body and your goal. No generic diets — what you eat is part of the program.",
  },
  {
    num: "D21",
    name: "Real coaching",
    desc: "Daily follow-up from a live coach. Writes to you, corrects you, pushes you. The difference between an app and a method.",
  },
  {
    num: "D54",
    name: "The result",
    desc: "54 days later, you don't finish a challenge. You finish someone new — with the tools to stay that way.",
  },
];

function Ticker() {
  const items = [
    "Coral Gables",
    "Hallandale",
    "Mexico City",
    "Bogotá",
    "Online worldwide",
    "54 days",
  ];
  // Duplicado para el loop infinito del marquee
  const track = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {track.map((item, i) => (
          <span key={i}>
            {item} <span className="dot">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const method = useReveal();
  const studios = useReveal();
  const cta = useReveal();

  return (
    <div>
      <Nav />

      {/* ============ HERO ============ */}
      <header className="hero">
        <div className="hero-media">
          {HERO_VIDEO_URL ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={HERO_POSTER_URL ?? undefined}
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
          ) : (
            <div className="hero-poster" />
          )}
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="hero-kicker">The 54D Method</span>
          <h1 className="hero-title">
            54 days.
            <br />
            <span className="accent">One transformation.</span>
          </h1>
          <p className="hero-sub">
            High-intensity training, personalized nutrition, and a coach who
            checks in every single day. Online, or in our studios.
          </p>
          <div className="hero-ctas" id="empezar">
            <a href="/pricing" className="btn btn-primary">
              Start free — 7 days
            </a>
            <a href="#studios" className="btn btn-ghost">
              Explore the studios
            </a>
          </div>
        </div>
        <div style={{ height: "6vh" }} />
        <Ticker />
      </header>

      {/* ============ EL MÉTODO (glass cards) ============ */}
      <section className="section bloom" id="metodo">
        <div className="section-inner" ref={method.ref}>
          <div className={method.className}>
            <span className="day-marker">The method</span>
            <div className="method-intro">
              <h2 className="section-title">
                Not a gym. A program with a start —{" "}
                <span className="accent">and an end.</span>
              </h2>
              <p>
                54D started with a simple question: what happens when you treat
                your transformation like a professional project — with dates, a
                method, and someone who demands more of you? This is what
                happens.
              </p>
            </div>
            <div className="method-grid">
              {METHOD.map((m) => (
                <div className="method-card" key={m.num}>
                  <div className="method-num">{m.num}</div>
                  <div className="method-name">{m.name}</div>
                  <p className="method-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROGRAMAS: ON / STUDIOS ============ */}
      <section className="split" id="programas" style={{ scrollMarginTop: "6rem" }}>
        <div className="split-panel split-on">
          <div>
            <span className="split-label">Online — wherever you are</span>
            <h3 className="split-title">54D ON</h3>
            <p className="split-desc">
              Every digital program, your nutrition protocol, and daily
              follow-up from a live coach. From home, with whatever you have.
            </p>
          </div>
          <div className="split-footer">
            <a href="/pricing" className="btn btn-on">
              Start free — 7 days
            </a>
            <span className="split-price">Monthly, quarterly, or annual subscription</span>
          </div>
        </div>
        <div className="split-panel split-studios">
          <div>
            <span className="split-label">In person — 5 studios</span>
            <h3 className="split-title">54D Studios</h3>
            <p className="split-desc">
              The full experience: small groups, coaches on the floor, a
              nutritionist, and physiotherapy. Generations with a start date
              and limited spots.
            </p>
          </div>
          <div className="split-footer">
            <a href="#studios" className="btn btn-primary">
              Explore the studios
            </a>
          </div>
        </div>
      </section>

      {/* ============ STUDIOS (index tipográfico) ============ */}
      <section className="section bloom-right" id="studios">
        <div className="section-inner" ref={studios.ref}>
          <div className={studios.className}>
            <span className="day-marker">Studios</span>
            <h2 className="section-title">
              Three countries. <span className="accent">Five studios.</span>
            </h2>
            <div className="studios-list">
              {STUDIOS.map((s) => (
                <a key={s.slug} href={`/studios/${s.slug}`} className="studio-row">
                  <span className="studio-city">{s.city}</span>
                  <span className="studio-country">{s.country}</span>
                  <span className="studio-cta">Book →</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              Day 1 <span className="accent">is today.</span>
            </h2>
            <div className="hero-ctas">
              <a href="/pricing" className="btn btn-primary">
                Start free — 7 days
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
