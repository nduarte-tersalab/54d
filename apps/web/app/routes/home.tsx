import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Nav, Footer, useReveal } from "../components/site";
import { AppStoreBadges } from "../components/badges";
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

/* Video del hero: generado con Higgsfield (Seedance 2.0) desde la foto
   real de la rampa — 1080p, 8s, loop. Solo desktop; mobile usa la foto
   (9MB no se le impone a datos móviles). */
const HERO_VIDEO_URL: string | null = asset("videos/hero-ramp-v2.mp4");
const HERO_POSTER_URL: string | null = asset("images/hd/cg-ramp-runners-wide.jpg");

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
            <>
              {/* Desktop: video. Mobile: foto vertical (clase .hero-media-mobile). */}
              <video
                className="hero-media-desktop"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={HERO_POSTER_URL ?? undefined}
              >
                <source src={HERO_VIDEO_URL} type="video/mp4" />
              </video>
              <img
                className="hero-media-mobile"
                src={asset("images/hd/cg-runner-vertical.jpg")}
                alt="Runner climbing the yellow stairs at a 54D studio"
                fetchPriority="high"
              />
            </>
          ) : (
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet={asset("images/hd/cg-runner-vertical.jpg")}
              />
              <img
                src={asset("images/hd/cg-ramp-runners-wide.jpg")}
                alt="Runners climbing the yellow ramp inside the dark 54D studio"
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
          <p
            className="hero-sub lead"
            style={{ textShadow: "0 1px 24px rgba(7,7,7,.6)" }}
          >
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
              <p className="lead">
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
          src={asset("images/hd/cg-highfive-euphoria.jpg")}
          alt="A 54D class celebrating with arms up and high fives after finishing a session"
          loading="lazy"
        />
        <div className="photo-band-content" ref={community.ref}>
          <div className={community.className}>
            <span className="photo-caption">Generation after generation</span>
            <h2 className="section-title" style={{ marginTop: "1.4rem" }}>
              You don't finish alone.
            </h2>
            <p
              className="lead"
              style={{
                maxWidth: "32rem",
                marginTop: "1.4rem",
                textShadow: "0 1px 24px rgba(7,7,7,.6)",
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
            <p className="split-desc lead">
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
            src={asset("images/hd/cg-stairs-group.jpg")}
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
              See the studios
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
                <div className="phone-screen">
                  <img
                    src={asset("images/brand/coach-stretch-demo-vertical.jpg")}
                    alt=""
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "43% 30%",
                    }}
                  />
                </div>
              </div>
              <div>
                <span className="day-marker">54D On. iOS and Android.</span>
                <h2 className="section-title">The method lives in the app.</h2>
                <p
                  className="lead"
                  style={{ maxWidth: "34rem", marginTop: "1.4rem" }}
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
                <AppStoreBadges
                  appStoreUrl={APP_STORE_URL}
                  googlePlayUrl={GOOGLE_PLAY_URL}
                />
                <div
                  className="app-rating"
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--c-white)",
                  }}
                >
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
