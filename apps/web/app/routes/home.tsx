import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Nav, Footer } from "../components/site";
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

/* Chooser flagship (SEPARATION_SPEC §1): en desktop Studios pesa mas
   que ON (3fr vs 2fr). Scoped via :has() para no tocar app.css; bajo
   900px manda el 1fr de app.css y Studios queda arriba por orden DOM. */
const CHOOSER_CSS = `
@media (min-width: 901px) {
  .split:has(.split-flagship) { grid-template-columns: 3fr 2fr; }
}
`;

export default function Home() {

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: CHOOSER_CSS }} />
      <Nav />

      {/* ============ HERO ============ */}
      <header className="hero" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "clamp(1.25rem, 3vh, 2.5rem)" }}>
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
        <div className="hero-content" style={{ marginBottom: 0 }}>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.9rem, 4.6vw, 4.4rem)" }}>
            54 days.
            <br />
            <span className="accent">One transformation.</span>
          </h1>
        </div>
      {/* ============ EL CHOOSER: dos puertas NO equivalentes ============
          Studios primero y con mas peso (3fr, CHOOSER_CSS): flagship por
          aplicacion, sin precio ni trial en su panel. ON con su precio y
          su trial: son productos distintos, hasta la app es distinta. */}
      <section className="split" id="choose" style={{ position: "relative", zIndex: 2, width: "100%", marginTop: "clamp(1rem, 2vh, 1.6rem)" }}>
        <div className="split-panel split-studios split-flagship" style={{ minHeight: 0, padding: "clamp(1.6rem, 2.8vh, 2.6rem) clamp(1.6rem, 2.5vw, 2.8rem)" }}>
          <img
            src={asset("images/studios/coral-gables/class-mural-wide.jpg")}
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
            <span className="split-label">The flagship experience</span>
            {/* h2: primer heading tras el h1 del hero (outline sin saltos) */}
            <h2 className="split-title">54D Studios</h2>
            <p className="split-desc">
              The complete method, in person, with a dedicated team of
              coaches, a nutritionist, and a physiotherapist. Admission by
              Generation: one start date, limited places. Miami, Mexico
              City, Bogotá.
            </p>
          </div>
          <div className="split-footer" style={{ position: "relative", zIndex: 1 }}>
            <Link to="/studios" className="btn btn-ghost">
              Request a consultation
            </Link>
            <span className="split-price">
              By application · Limited places per Generation
            </span>
          </div>
        </div>
        <div className="split-panel split-on" style={{ minHeight: 0, padding: "clamp(1.6rem, 2.8vh, 2.6rem) clamp(1.6rem, 2.5vw, 2.8rem)" }}>
          <div>
            <span className="split-label">Online, wherever you are</span>
            <h2 className="split-title">54D ON</h2>
            <p className="split-desc">
              The 54-day digital program in the 54D On app: daily training,
              your nutrition protocol, and a real coach in your corner. From
              $54 a month.
            </p>
          </div>
          <div className="split-footer">
            <Link to="/pricing" className="btn btn-on">
              Start free. 7 days.
            </Link>
            <span className="split-price">Cancel anytime</span>
          </div>
        </div>
      </section>
      </header>


      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
