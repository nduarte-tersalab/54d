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
.split-flagship > img { transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1); }
.split-flagship:hover > img { transform: scale(1.045); }
/* Mobile: la decision completa en el fold (critica H1). Dieta del chooser. */
@media (max-width: 820px) {
  .hero:has(#choose) { padding-top: calc(var(--app-banner-h, 0px) + 56px + 0.75rem); }
  .split:has(.split-flagship) .split-title { font-size: 1.8rem; }
  .split:has(.split-flagship) .split-desc {
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; margin-top: 0.6rem; font-size: 0.95rem;
  }
  .split:has(.split-flagship) .split-panel { padding: 1rem 1.25rem !important; }
  .split:has(.split-flagship) .split-footer { margin-top: 0.8rem; }
}
/* Gateway de un solo screen: internos de puerta compactos */
.split:has(.split-flagship) .split-footer { margin-top: 1.2rem; }
.split:has(.split-flagship) .split-desc { margin-top: 0.9rem; }
`;

export default function Home() {

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: CHOOSER_CSS }} />
      <Nav />

      {/* ============ HERO ============ */}
      <header className="hero" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "clamp(1rem, 1.8vh, 1.5rem)" }}>
        <div className="hero-media">
          {HERO_VIDEO_URL ? (
            <>
              {/* Desktop: video. Mobile: foto vertical (clase .hero-media-mobile). */}
              <video
                className="hero-media-desktop"
                style={{ objectPosition: "center 24%" }}
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
        <div
          className="hero-content"
          style={{
            marginBottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Brand-first como el sitio live del cliente: el logo ES el titular.
              h1 oculto para SEO/a11y. */}
          <h1
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clipPath: "inset(50%)",
            }}
          >
            54D. 54 days. One transformation.
          </h1>
          <img
            src={asset("images/brand/logo-54d.png")}
            alt="54D"
            fetchPriority="high"
            style={{
              width: "clamp(88px, 11.5vw, 156px)",
              height: "auto",
              filter: "drop-shadow(0 8px 44px rgba(0,0,0,0.55))",
            }}
          />
        </div>
      {/* ============ EL CHOOSER: dos puertas NO equivalentes ============
          Studios primero y con mas peso (3fr, CHOOSER_CSS): flagship por
          aplicacion, sin precio ni trial en su panel. ON con su precio y
          su trial: son productos distintos, hasta la app es distinta. */}
      <p
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          fontFamily: "var(--font-label)",
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "var(--track-eyebrow, 0.22em)",
          textTransform: "uppercase",
          color: "var(--c-mist)",
          textShadow: "0 1px 18px rgba(7,7,7,0.9)",
          marginBottom: "0.6rem",
        }}
      >
        One method. Two very different ways to live it.
      </p>
      <section className="split" id="choose" style={{ position: "relative", zIndex: 2, width: "100%", marginTop: "clamp(0.5rem, 1vh, 0.8rem)" }}>
        <div className="split-panel split-studios split-flagship" style={{ minHeight: 0, padding: "clamp(1.6rem, 2.8vh, 2.6rem) clamp(1.6rem, 2.5vw, 2.8rem)" }}>
          <img
            src={asset("images/hd/cg-gym-wide.jpg")}
            alt=""
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.8) contrast(1.06) brightness(0.94)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(7,7,7,0.92) 0%, rgba(7,7,7,0.55) 45%, rgba(7,7,7,0.15) 100%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="split-label">The flagship experience</span>
            {/* h2: primer heading tras el h1 del hero (outline sin saltos) */}
            <h2 className="split-title">54D Studios</h2>
            <p className="split-desc">
              The complete method, in person. Coaches, nutrition,
              physiotherapy. One Generation: one start date, limited places.
            </p>
          </div>
          <div className="split-footer" style={{ position: "relative", zIndex: 1 }}>
            <Link
              to="/studios"
              className="btn btn-ghost"
              style={{ borderColor: "rgba(255,255,255,0.85)" }}
            >
              Apply for admission
            </Link>
            <span className="split-price">
              By application · Limited places per Generation
            </span>
          </div>
        </div>
        <div className="split-panel split-on" style={{ background: "var(--c-yellow)", minHeight: 0, padding: "clamp(1.6rem, 2.8vh, 2.6rem) clamp(1.6rem, 2.5vw, 2.8rem)" }}>
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

      {/* ============ PRENSA (logos blancos del CDN del cliente) ============ */}
      <section
        aria-label="Featured on"
        style={{
          padding: "clamp(1.8rem, 4vh, 3rem) var(--gutter)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div
          className="section-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(1.4rem, 3.5vw, 3.2rem)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontWeight: 700,
              fontSize: "0.64rem",
              letterSpacing: "var(--track-eyebrow, 0.22em)",
              textTransform: "uppercase",
              color: "var(--c-faint)",
            }}
          >
            Featured on
          </span>
          {[
            ["mens-health.png", "Men's Health", 20],
            ["forbes.png", "Forbes", 22],
            ["business-insider.png", "Business Insider", 17],
            ["new-york-post.png", "New York Post", 19],
            ["haute-living.png", "Haute Living", 16],
          ].map(([file, name, h]) => (
            <img
              key={file as string}
              src={asset(`images/press/${file}`)}
              alt={name as string}
              loading="lazy"
              style={{ height: h as number, width: "auto", opacity: 0.62 }}
            />
          ))}
        </div>
      </section>


      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
