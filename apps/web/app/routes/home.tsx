import { Link } from "react-router";
import type { Route } from "./+types/home";
import { asset } from "../lib/asset";
import { LangToggle, resolveLang, useLang } from "../lib/i18n";

export async function loader({ request }: Route.LoaderArgs) {
  return { lang: resolveLang(request) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const es = loaderData?.lang === "es";
  return [
    {
      title: es
        ? "54D: el método de transformación de 54 días"
        : "54D: The 54-Day Transformation Method",
    },
    {
      name: "description",
      content: es
        ? "Entrenamiento de alta intensidad, nutrición personalizada y un coach contigo todos los días durante 54 días. Online o en nuestros studios de Miami, Ciudad de México y Bogotá."
        : "High-intensity training, personalized nutrition, and a coach on you every day for 54 days. Online, or in our studios in Miami, Mexico City, and Bogotá.",
    },
  ];
}

/* Video del hero: generado con Higgsfield (Seedance 2.0) desde la foto
   real de la rampa — 1080p, 8s, loop, todos los breakpoints. */
const HERO_VIDEO_URL: string | null = asset("videos/hero-ramp-v2.mp4");
const HERO_POSTER_URL: string | null = asset("images/hd/cg-ramp-runners-wide.jpg");

const PRESS = [
  ["mens-health.png", "Men's Health", 15],
  ["forbes.png", "Forbes", 17],
  ["business-insider.png", "Business Insider", 13],
  ["new-york-post.png", "New York Post", 14],
  ["haute-living.png", "Haute Living", 12],
] as const;

/* ============================================================
   QUIET v6 — el gate deja de gritar (feedback del equipo 30/07).
   Una sola pieza: video calmo detras de todo, logo chico, una
   linea en sentence case y dos puertas de vidrio oscuro. Sin
   fotos propias en las puertas, sin bloque amarillo, sin caps.
   El amarillo queda en DOS acentos: la regla superior de ON y
   su boton. El aire vuelve a ser el protagonista.
   ============================================================ */
const GATE_CSS = `
.gate {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: clamp(3.5rem, 6vh, 5rem) var(--gutter) clamp(1.6rem, 3vh, 2.4rem);
}
.gate-media { position: absolute; inset: 0; z-index: 0; }
.gate-media video {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 30%;
}
.gate-veil {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg,
    rgba(7,7,7,0.60) 0%,
    rgba(7,7,7,0.34) 42%,
    rgba(7,7,7,0.80) 100%);
}
.gate-inner {
  position: relative; z-index: 2;
  width: 100%;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
.gate-logo { height: clamp(56px, 6.5vw, 78px); width: auto; }
.gate-line {
  margin-top: 1.5rem;
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
  max-width: 52ch;
  text-wrap: balance;
}
.gate-doors {
  margin-top: clamp(2.6rem, 5.5vh, 4.2rem);
  width: 100%;
  max-width: 1040px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
.gate-door {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  color: var(--c-white);
  background: rgba(9, 9, 9, 0.52);
  border: 1px solid var(--hairline);
  border-radius: var(--r-card);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: clamp(2.2rem, 4vh, 3.1rem) clamp(1.6rem, 3vw, 3rem);
  transition: border-color var(--transition), background var(--transition);
}
.gate-door:hover {
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(9, 9, 9, 0.66);
}
/* El unico gesto de marca del gate: ON lleva la regla amarilla */
.gate-door-on { border-top: 2px solid var(--c-yellow); }
.gate-eyebrow {
  font-family: var(--font-label);
  font-weight: 500;
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}
.gate-title {
  margin-top: 0.85rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.55rem, 2.2vw, 2.1rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.gate-desc {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.66);
  max-width: 44ch;
  text-wrap: balance;
}
.gate-cta {
  margin-top: 1.7rem;
  display: inline-flex; align-items: center;
  min-height: var(--btn-h-sm);
  padding: 0 1.8rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  border-radius: var(--r-control);
  transition: border-color var(--transition), background var(--transition);
}
.gate-cta-quiet {
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: var(--c-white);
}
.gate-door:hover .gate-cta-quiet { border-color: rgba(255, 255, 255, 0.6); }
.gate-cta-on { background: var(--c-yellow); color: var(--c-black); }
.gate-door:hover .gate-cta-on { background: #EFC500; }
.gate-micro {
  margin-top: 0.95rem;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.4);
}
.gate-press {
  margin-top: clamp(2.6rem, 5vh, 3.8rem);
  display: flex; flex-direction: column; align-items: center;
  gap: 1.1rem;
}
.gate-press-label {
  font-family: var(--font-label);
  font-weight: 500;
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
}
.gate-press-logos {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap;
  gap: 1rem clamp(1.6rem, 3.2vw, 3rem);
}
.gate-press-logos img { filter: grayscale(1); opacity: 0.4; }
.gate-legal {
  margin-top: clamp(1.6rem, 3vh, 2.4rem);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.3);
}
/* Target táctil ≥44px sin mover el layout (padding compensado con margin) */
.gate-legal a {
  color: inherit;
  display: inline-block;
  padding: 1.05rem 0.55rem;
  margin: -1.05rem -0.55rem;
}
@media (min-width: 901px) {
  .gate-doors { grid-template-columns: 3fr 2fr; grid-template-rows: repeat(5, auto); }
  /* Cada puerta hereda las filas del contenedor: titulo con titulo, CTA con
     CTA. Antes cada una centraba su contenido por separado y, al tener
     descripciones de distinto largo, los titulos caian desfasados 12px. */
  .gate-door {
    grid-row: span 5;
    display: grid;
    grid-template-rows: subgrid;
    align-content: start;
    justify-items: center;
    /* .gate-door hereda align-items:center del flex; en grid eso centraria
       cada hijo DENTRO de su fila y desalinearia el desc mas corto */
    align-items: start;
  }
}
@media (max-width: 900px) {
  .gate { justify-content: flex-start; padding-top: clamp(3rem, 8vh, 4.5rem); }
  .gate-desc { font-size: 0.92rem; }
  /* Compactar: el CTA amarillo de ON (la unica decision del gate) entra
     COMPLETO en el primer viewport de 844px */
  .gate-doors { margin-top: clamp(1.6rem, 3.5vh, 2.4rem); }
  .gate-door { padding: clamp(1.5rem, 2.6vh, 2rem) clamp(1.4rem, 3vw, 2rem); }
  .gate-press { margin-top: clamp(1.8rem, 3.5vh, 2.6rem); }
}
`;

const GATE_COPY = {
  en: {
    line: "One method. Two very different ways to live it.",
    studiosEyebrow: "The flagship experience",
    studiosDesc:
      "The complete method, in person: coaches, nutrition, physiotherapy. One Generation, limited places.",
    studiosCta: "Apply for admission",
    studiosMicro: "By application · Miami, Mexico City, Bogotá",
    onEyebrow: "Online, wherever you are",
    onDesc:
      "The 54-day program in the app: daily training, your nutrition protocol, a real coach in your corner.",
    onCta: "Start free for 7 days",
    onMicro: "Cancel anytime",
    press: "Featured on",
    chooseLabel: "Choose your 54D",
  },
  es: {
    line: "Un método. Dos maneras muy distintas de vivirlo.",
    studiosEyebrow: "La experiencia insignia",
    studiosDesc:
      "El método completo, presencial: coaches, nutrición, fisioterapia. Una Generación, cupos limitados.",
    studiosCta: "Solicita tu admisión",
    studiosMicro: "Admisión por solicitud · Miami, Ciudad de México, Bogotá",
    onEyebrow: "Online, donde estés",
    onDesc:
      "El programa de 54 días en la app: entrenamiento diario, tu protocolo de nutrición y un coach real contigo.",
    onCta: "Empieza gratis por 7 días",
    onMicro: "Cancela cuando quieras",
    press: "En los medios",
    chooseLabel: "Elige tu 54D",
  },
} as const;

export default function Home() {
  const { lang } = useLang();
  const es = lang === "es";
  const c = GATE_COPY[lang];
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: GATE_CSS }} />

      <header className="gate">
        <div className="gate-media">
          {HERO_VIDEO_URL ? (
            <video
              /* React no serializa \`muted\` en el SSR y Chrome puede vetar el
                 autoplay pre-hidratacion; ademas el primer play() puede
                 abortarse. Forzar por propiedad, reintentar, y cubrir los
                 contextos duro-bloqueados con el primer toque. */
              ref={(el) => {
                if (!el) return;
                el.muted = true;
                let tries = 0;
                const kick = () => {
                  if (!el.paused || tries++ > 8) return;
                  el.play().catch(() => setTimeout(kick, 350));
                };
                kick();
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
            <img
              src={asset("images/hd/cg-ramp-runners-wide.jpg")}
              alt=""
              fetchPriority="high"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
        <div className="gate-veil" />

        <LangToggle
          style={{
            position: "absolute",
            top: "clamp(1rem, 2.5vh, 1.8rem)",
            right: "var(--gutter)",
            zIndex: 3,
          }}
        />

        <div className="gate-inner">
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
            className="gate-logo"
            src={asset("images/brand/logo-54d.png")}
            alt="54D"
          />
          <p className="gate-line">{c.line}</p>

          <nav className="gate-doors" aria-label={c.chooseLabel} id="choose">
            <Link to="/studios" className="gate-door">
              <span className="gate-eyebrow">{c.studiosEyebrow}</span>
              <span className="gate-title">54D Studios</span>
              <span className="gate-desc">{c.studiosDesc}</span>
              <span className="gate-cta gate-cta-quiet">{c.studiosCta}</span>
              <span className="gate-micro">{c.studiosMicro}</span>
            </Link>
            <Link to="/on" className="gate-door gate-door-on">
              <span className="gate-eyebrow">{c.onEyebrow}</span>
              {/* Titulo tipografiado, igual que la puerta de Studios (pedido
                  cliente): en el gate las dos puertas se leen como pares.
                  El lockup ON vive en el nav de /on y en sus landings. */}
              <span className="gate-title">54D ON</span>
              <span className="gate-desc">{c.onDesc}</span>
              <span className="gate-cta gate-cta-on">{c.onCta}</span>
              <span className="gate-micro">{c.onMicro}</span>
            </Link>
          </nav>

          <div className="gate-press" aria-label="Featured on">
            <span className="gate-press-label">{c.press}</span>
            <div className="gate-press-logos">
              {PRESS.map(([file, name, h]) => (
                <img
                  key={file}
                  src={asset(`images/press/${file}`)}
                  alt={name}
                  loading="lazy"
                  style={{ height: h, width: "auto" }}
                />
              ))}
            </div>
          </div>

          {/* Microlinea legal (Meta Ads exige privacy accesible desde la landing) */}
          <p className="gate-legal">
            © 2026 54D ·{" "}
            <Link to="/privacy">{es ? "Privacidad" : "Privacy"}</Link> ·{" "}
            <Link to="/terms">{es ? "Términos" : "Terms"}</Link>
          </p>
        </div>
      </header>
    </div>
  );
}
