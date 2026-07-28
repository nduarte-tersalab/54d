import { Link } from "react-router";
import type { Route } from "./+types/home";
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
/* Mobile apilado: la foto propia de Studios recortaba el video de fondo
   (feedback cliente). La puerta queda transparente y el video pasa a
   traves; un velo suave sostiene la legibilidad sobre el movimiento. */
@media (max-width: 900px) {
  .split-flagship { background: rgba(7, 7, 7, 0.30); box-shadow: none; }
  .split-flagship > img, .split-flagship .flagship-scrim { display: none; }
}
/* Mobile: sin cromo el fold gana ~120px; copy COMPLETO, jamas truncado. */
@media (max-width: 820px) {
  .hero:has(#choose) { padding-top: 3.5rem; }
  .split:has(.split-flagship) .split-title { font-size: 1.9rem; }
  .split:has(.split-flagship) .split-desc { margin-top: 0.6rem; font-size: 0.95rem; }
  .bridge-line { max-width: 30ch; margin-inline: auto; font-size: 12px !important; letter-spacing: 0.18em !important; }
}
/* Media-on-media resuelto: el video ocupa solo la zona alta del gateway
   y se funde a negro ANTES de las puertas. La foto de Studios ya no
   compite con un fondo en movimiento. */
.hero:has(#choose) .hero-media { height: 58%; }
@media (min-width: 821px) { .press-below { display: none; } }
@media (max-width: 820px) { .press-inhero { display: none; } }
.hero:has(#choose) .hero-media::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 46%;
  background: linear-gradient(180deg, rgba(7,7,7,0) 0%, rgba(7,7,7,0.5) 45%, #070707 100%);
}
/* Gateway de un solo screen: el padding de seccion de .split cede 15px
   por lado para que el aire nuevo bajo la prensa quepa en 100svh */
.hero .split { padding-block: calc(var(--space-section) - 15px); }
/* Gateway de un solo screen: internos de puerta compactos */
.split:has(.split-flagship) .split-footer { margin-top: 1.2rem; }
.split:has(.split-flagship) .split-desc { margin-top: 0.9rem; }
`;

export default function Home() {

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: CHOOSER_CSS }} />

      {/* ============ HERO ============ */}
      <header className="hero" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "clamp(2rem, 3.6vh, 3.25rem)" }}>
        <div className="hero-media">
          {/* Video en todos los breakpoints (pedido cliente); poster +
              preload=metadata cuidan datos móviles hasta que arranca. */}
          {HERO_VIDEO_URL ? (
            <video
              className="hero-media-video"
              style={{ objectPosition: "center 24%" }}
              /* React no serializa `muted` en el SSR, asi que Chrome evalua el
                 autoplay como video "con sonido" y lo bloquea; ademas el primer
                 play() puede abortarse durante la hidratacion. Forzar por
                 propiedad y reintentar hasta que arranque. */
              ref={(el) => {
                if (!el) return;
                el.muted = true;
                let tries = 0;
                const kick = () => {
                  if (!el.paused || tries++ > 8) return;
                  el.play().catch(() => setTimeout(kick, 350));
                };
                kick();
                /* Donde el autoplay este duro-bloqueado (iOS Low Power Mode,
                   Data Saver): el primer toque en la pagina lo arranca */
                const onTouch = () => {
                  if (el.isConnected && el.paused) el.play().catch(() => {});
                };
                document.addEventListener("pointerdown", onTouch, {
                  once: true,
                  passive: true,
                });
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_POSTER_URL ?? undefined}
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
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
              width: "clamp(84px, 10vw, 136px)",
              height: "auto",
              filter: "drop-shadow(0 8px 44px rgba(0,0,0,0.55))",
            }}
          />
        </div>
      {/* ============ EL CHOOSER: dos puertas NO equivalentes ============
          Crítica ronda 2: interiores CENTRADOS en ambos paneles (la espina
          de la página es central), microcopy DEBAJO del CTA, CTAs en
          paridad de tamaño, copy con ancho tope y text-wrap balance.
          Studios 3fr flagship / ON 2fr: la asimetría es jerarquía. */}
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
          marginBottom: "0.4rem",
        }}
        className="bridge-line"
      >
        One method. Two very different ways to live it.
      </p>
      <section className="split" id="choose" style={{ position: "relative", zIndex: 2, width: "100%", marginTop: "clamp(0.8rem, 1.4vh, 1.2rem)" }}>
        <div
          className="split-panel split-studios split-flagship"
          style={{
            minHeight: "315px",
            padding: "clamp(1.8rem, 3.8vh, 2.8rem) clamp(1.5rem, 3vw, 3.5rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
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
              filter: "saturate(0.55) brightness(0.82) contrast(1.05)",
            }}
          />
          <div
            aria-hidden="true"
            className="flagship-scrim"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.72) 100%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="split-label">The flagship experience</span>
            <h2 className="split-title" style={{ textWrap: "balance" }}>54D Studios</h2>
            <p
              className="split-desc"
              style={{ maxWidth: "42ch", marginInline: "auto", textWrap: "balance" }}
            >
              The complete method, in person. Coaches, nutrition,
              physiotherapy. One Generation: one start date, limited places.
            </p>
            <div style={{ marginTop: "1.4rem" }}>
              <Link
                to="/studios"
                className="btn btn-ghost"
                style={{
                  height: "56px",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 2.2rem",
                  fontSize: "0.875rem",
                  letterSpacing: "0.12em",
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.85)",
                }}
              >
                Apply for admission
              </Link>
              <span
                style={{
                  display: "block",
                  marginTop: "14px",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                By application · Limited places per Generation
              </span>
            </div>
          </div>
        </div>
        <div
          className="split-panel split-on"
          style={{
            background: "var(--c-yellow)",
            minHeight: "315px",
            padding: "clamp(1.8rem, 3.8vh, 2.8rem) clamp(1.5rem, 3vw, 3rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div>
            <span className="split-label">Online, wherever you are</span>
            <h2 className="split-title" style={{ textWrap: "balance" }}>54D ON</h2>
            <p
              className="split-desc"
              style={{ maxWidth: "36ch", marginInline: "auto", textWrap: "balance" }}
            >
              The 54-day digital program in the 54D On app: daily training,
              your nutrition protocol, and a real coach in your corner.
            </p>
            <div style={{ marginTop: "1.4rem" }}>
              <Link
                to="/pricing"
                className="btn btn-on"
                style={{
                  height: "56px",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 2.2rem",
                  fontSize: "0.875rem",
                  letterSpacing: "0.12em",
                }}
              >
                Start free. 7 days.
              </Link>
              <span
                style={{
                  display: "block",
                  marginTop: "14px",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: "rgba(0,0,0,0.65)",
                }}
              >
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

        {/* Prensa dentro del fold (desktop): label arriba de los logos */}
        <div
          className="press-inhero"
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: "clamp(0.6rem, 1.2vh, 1rem)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontWeight: 700,
              fontSize: "0.6rem",
              letterSpacing: "var(--track-eyebrow, 0.22em)",
              textTransform: "uppercase",
              color: "var(--c-faint)",
            }}
          >
            Featured on
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(1.2rem, 2.6vw, 2.6rem)",
              flexWrap: "wrap",
            }}
          >
            {[
              ["mens-health.png", "Men's Health", 16],
              ["forbes.png", "Forbes", 18],
              ["business-insider.png", "Business Insider", 14],
              ["new-york-post.png", "New York Post", 15],
              ["haute-living.png", "Haute Living", 13],
            ].map(([file, name, h]) => (
              <img
                key={file as string}
                src={asset(`images/press/${file}`)}
                alt={name as string}
                loading="lazy"
                style={{ height: h as number, width: "auto", opacity: 0.58 }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ============ PRENSA (logos blancos del CDN del cliente) ============ */}
      <section
        aria-label="Featured on"
        className="press-below"
        style={{
          padding: "40px var(--gutter) 64px",
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


      {/* Microlínea legal (Meta Ads exige privacy accesible; el footer completo no vuelve) */}
      <p
        style={{
          textAlign: "center",
          padding: "0 var(--gutter) 16px",
          fontSize: "10px",
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        © 2026 54D · <Link to="/privacy" style={{ color: "inherit" }}>Privacy</Link> · <Link to="/terms" style={{ color: "inherit" }}>Terms</Link>
      </p>
    </div>
  );
}
