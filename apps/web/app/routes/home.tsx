import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";
import { asset } from "../lib/asset";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D: The 54-Day Transformation Method" },
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

/* Links canónicos verificados (docs/marketing/APP_INFO.md). Solo 54D On:
   nunca las apps legacy FitMetrix/Mindbody. */
const APP_STORE_URL = "https://apps.apple.com/us/app/54d-on/id1520445334";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays";

/* Acento sólido (regla de de-IA-ificación: gradient text solo en el hero) */
const solidAccent = { color: "var(--c-yellow)" } as const;

const METHOD = [
  {
    num: "D01",
    name: "Training",
    desc: "Daily high-intensity sessions designed by coaches, not by an algorithm. Every day of the program has a purpose.",
  },
  {
    num: "D07",
    name: "Nutrition",
    desc: "A nutrition protocol built for your body and your goal. No generic diets. What you eat is part of the program.",
  },
  {
    num: "D21",
    name: "Real coaching",
    desc: "Daily follow-up from a live coach. Writes to you, corrects you, pushes you. The difference between an app and a method.",
  },
  {
    num: "D54",
    name: "The result",
    desc: "54 days later, you don't finish a challenge. You finish someone new, with the tools to stay that way.",
  },
];

/* Features verificadas de la ficha (APP_INFO.md / COPY_V3.md §4) */
const APP_FEATURES = [
  {
    name: "A real coach, every day",
    desc: "Guidance, corrections, and daily personalized follow-up from a human.",
  },
  {
    name: "A 360° plan built for you",
    desc: "Your level, your goals, your life.",
  },
  {
    name: "On-demand and live workouts",
    desc: "Dozens of programs: strength, cardio, mobility, Pilates, yoga, wellness.",
  },
  {
    name: "Nutrition plans and tools",
    desc: "Built for energy, focus, and consistency.",
  },
  {
    name: "Apple Health and Apple Watch",
    desc: "Activity, energy, and heart rate, shared with your coach. iOS only.",
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
  const community = useReveal();
  const app = useReveal();
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
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet={asset("images/brand/54d-logo-mural-core-class-vertical.jpg")}
              />
              <img
                src={asset("images/brand/gym-interior-54d-logo-wide.jpg")}
                alt="Inside the 54D studio: a full class training on mats under the giant 54D mural"
                fetchPriority="high"
              />
            </picture>
          )}
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
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
            <Link to="/pricing" className="btn btn-primary">
              Start free. 7 days.
            </Link>
            <a href="#studios" className="btn btn-ghost">
              Explore the studios
            </a>
          </div>
        </div>
        <div style={{ height: "6vh" }} />
        <Ticker />
      </header>

      {/* ============ EL MÉTODO (glass cards) ============ */}
      <section className="section" id="metodo">
        <div className="section-inner" ref={method.ref}>
          <div className={method.className}>
            <span className="day-marker">The method</span>
            <div className="method-intro">
              <h2 className="section-title">
                Not a gym. A program with a start.{" "}
                <span style={solidAccent}>And an end.</span>
              </h2>
              <p>
                54D started with a simple question: what happens when you treat
                your transformation like a professional project, with dates, a
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

      {/* ============ PHOTO BAND: comunidad ============ */}
      <section className="photo-band">
        <img
          src={asset("images/brand/group-photo-54d-mural.jpg")}
          alt="A 54D generation of around 25 people celebrating together in front of the 54D mural"
          loading="lazy"
        />
        <div className="photo-band-content" ref={community.ref}>
          <div className={community.className}>
            <span className="photo-caption">Generation after generation</span>
            <h2 className="section-title" style={{ marginTop: "1.4rem" }}>
              You don't finish alone.
            </h2>
            <p
              style={{
                maxWidth: "32rem",
                marginTop: "1.4rem",
                fontSize: "1.12rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              Every program runs as a generation: same start date, same finish
              line. The people in this photo started as strangers.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PROGRAMAS: ON / STUDIOS ============ */}
      <section className="split" id="programas" style={{ scrollMarginTop: "6rem" }}>
        <div className="split-panel split-on">
          <div>
            <span className="split-label">Online. Wherever you are.</span>
            <h3 className="split-title">54D ON</h3>
            <p className="split-desc">
              Every digital program, your nutrition protocol, and daily
              follow-up from a live coach. From home, with whatever you have.
            </p>
          </div>
          <div className="split-footer">
            <Link to="/pricing" className="btn btn-on">
              Start free. 7 days.
            </Link>
            <span className="split-price">Monthly, quarterly, or annual subscription</span>
          </div>
        </div>
        <div className="split-panel split-studios">
          <img
            src={asset("images/brand/gym-structure-heavy-bags-wide.jpg")}
            alt=""
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.82) contrast(1.05)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(7,7,7,0.62) 0%, rgba(7,7,7,0.88) 100%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="split-label">In person. 5 studios.</span>
            <h3 className="split-title">54D Studios</h3>
            <p className="split-desc">
              The full experience: small groups, coaches on the floor, a
              nutritionist, and physiotherapy. Generations with a start date
              and limited spots.
            </p>
          </div>
          <div className="split-footer" style={{ position: "relative", zIndex: 1 }}>
            <a href="#studios" className="btn btn-primary">
              Explore the studios
            </a>
          </div>
        </div>
      </section>

      {/* ============ THE APP: 54D On ============ */}
      <section className="section" id="app">
        <div className="section-inner" ref={app.ref}>
          <div className={app.className}>
            <div className="app-section">
              <div className="phone" aria-hidden="true">
                <div
                  className="phone-screen"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "2.6rem",
                      letterSpacing: "0.02em",
                      color: "var(--c-white)",
                    }}
                  >
                    54<span style={solidAccent}>D</span>
                  </span>
                </div>
              </div>
              <div>
                <span className="day-marker">54D On. iOS and Android.</span>
                <h2 className="section-title">The method lives in the app.</h2>
                <p
                  style={{
                    maxWidth: "34rem",
                    marginTop: "1.4rem",
                    fontSize: "1.12rem",
                    lineHeight: 1.6,
                    color: "var(--c-mist)",
                  }}
                >
                  Training, nutrition, and a real coach in one place. Rated 4.9
                  on the App Store.
                </p>
                <ol className="app-features">
                  {APP_FEATURES.map((f) => (
                    <li key={f.name}>
                      <div>
                        <strong>{f.name}</strong>
                        <span>{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="store-badges">
                  <a
                    className="store-badge"
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <small>Download on the</small>
                    <b>App Store</b>
                  </a>
                  <a
                    className="store-badge"
                    href={GOOGLE_PLAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <small>Get it on</small>
                    <b>Google Play</b>
                  </a>
                </div>
                <div className="app-rating">
                  <span>
                    <b>4.9</b>App Store
                  </span>
                  <span>
                    <b>4.9</b>Google Play
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STUDIOS (index tipográfico) ============ */}
      <section className="section" id="studios">
        <div className="section-inner" ref={studios.ref}>
          <div className={studios.className}>
            <span className="day-marker">Studios</span>
            <h2 className="section-title">
              Three countries. <span style={solidAccent}>Five studios.</span>
            </h2>
            <div className="studios-list">
              {STUDIOS.map((s) => (
                <Link key={s.slug} to={`/studios/${s.slug}`} className="studio-row">
                  <span className="studio-city">{s.city}</span>
                  <span className="studio-country">{s.country}</span>
                  <span className="studio-cta">Book →</span>
                </Link>
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
              Day 1 <span style={solidAccent}>is today.</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/pricing" className="btn btn-primary">
                Start free. 7 days.
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
