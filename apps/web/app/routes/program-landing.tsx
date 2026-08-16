import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/program-landing";
import { Nav, Footer, useReveal } from "../components/site";
import { AppStoreBadges } from "../components/badges";
import { StickyCta } from "../components/sticky-cta";
import { asset } from "../lib/asset";
import { startCheckout } from "../lib/attribution";
import { useLang, resolveLang } from "../lib/i18n";
import type { Lang } from "../lib/i18n";
import { PROGRAM_LANDINGS } from "../data/program-landings";
import type {
  ProgramLanding,
  ProgramSlug,
  ProgramTier,
} from "../data/program-landings";

/* ============================================================
   /programs/:slug: landing por programa para tráfico frío de Meta
   (docs/marketing/PROGRAM_LANDINGS.md). Un template, 13 landings,
   variantes por tier (starter / mid / flagship / runners).
   Checkout directo con startCheckout(priceId, meta): cada punto de
   compra manda su cta_position. La atribución (utm_content={{ad.name}})
   la captura root.tsx y la adjunta el propio startCheckout.
   Copy 100% bilingüe: el idioma sale del loader (SSR) y del contexto.
   REGLA DE ALCANCE (cliente, 13/08): la banda de antes/despues va en
   las 13 landings, en slot 2 post-hero. Claim -5kg SOLO en 54d-on y
   step-2; mid/starter/runners llevan linea puente SIN cifra ni
   deadline. Microcopy `Los resultados varian segun la persona`
   SIEMPRE bajo composites. Banda sin CTA ni urgencia. Labels
   THEN/NOW quemados en EN: aceptado, el contexto ES lo cargan
   microcaption y captions. Testimonios: SOLO del harvest, verbatim,
   jamas traducidos ni editados; ver blocklist en program-landings.ts.
   ============================================================ */

export async function loader({ params, request }: Route.LoaderArgs) {
  const landing: ProgramLanding | undefined =
    PROGRAM_LANDINGS[params.slug as ProgramSlug];
  if (!landing) throw new Response("Not Found", { status: 404 });
  return { landing, lang: resolveLang(request) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "54D Programs" }];
  const p = loaderData.landing;
  const l = loaderData.lang;
  return [
    { title: `${p.name}: ${p.hook[l].plain} ${p.hook[l].accent} | 54D` },
    { name: "description", content: p.subhead[l] },
  ];
}

const APP_STORE_URL = "https://apps.apple.com/us/app/54d-on/id1520445334";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays";

/* Foto de coach del bloque PROOF (doc §1.5: coach-correction / coach-hands;
   coach-correction es hero de First Move, así que PROOF usa coach-hands) */
const COACH_PHOTO = {
  src: "images/studios/hallandale/coach-hands.jpg",
  alt: {
    en: "Close-up of a 54D coach's hands guiding an athlete through a movement",
    es: "Primer plano de las manos de un coach de 54D guiando a una atleta en un movimiento",
  },
};

/* ============ Copy del chrome del template (EN/ES) ============ */

const T = {
  en: {
    onePayment: "One payment",
    startsMondays: "Starts Mondays",
    includedMembership: "Included with 54D ON membership",
    programEyebrow: "The program",
    doTitle1: "What you'll",
    doTitle2: "do.",
    filterEyebrow: "The honest filter",
    filterTitle1: "Is this",
    filterTitle2: "for you?",
    forYouIf: "This is for you if",
    notForYouIf: "This is NOT for you if",
    structureEyebrow: "The structure",
    structureTitle1: "The numbers",
    structureTitle2: "that matter.",
    progressionEyebrow: "The progression",
    phasesEyebrow: "Your 9 weeks",
    phasesTitle1: "Three cycles.",
    phasesTitle2: "One standard.",
    proofEyebrow: "Zero risk",
    proofTitle1: "A real coach.",
    proofTitle2: "A real guarantee.",
    guaranteeName: "30-day money-back guarantee",
    guaranteeBody:
      "Train it for 30 days. If it's not for you, we refund your money. No interrogation, no fine print.",
    coachName: "A real coach, not an algorithm",
    coachBody:
      "A certified 54D coach reviews your form and answers in the app. Every question, every rep, the whole way through.",
    captionStudio: "Shot at a 54D studio. This is the standard.",
    captionCoach: "A certified 54D coach, in your corner.",
    faqEyebrow: "FAQ",
    faqTitle1: "Before you",
    faqTitle2: "start.",
    opening: "Opening checkout…",
    nextGen: "Next generation starts Monday",
    inDays: "in",
    day: "day",
    days: "days",
    membershipEyebrow: "Also available monthly",
    membershipLine:
      "Prefer to pay monthly? The 54D ON membership includes all 13 programs, unlimited coach and 650+ recorded sessions for $54/mo, with 7 days free.",
    membershipYearly:
      "Going yearly? $588 a year covers this program, plus everything else.",
    membershipLink: "See membership plans · $54/mo, 7 days free →",
    noSubscription: "One payment. No subscription.",
    noteOnePayment: "ONE PAYMENT · 30-DAY MONEY-BACK GUARANTEE",
    noteTrial: "7 DAYS FREE · CANCEL ANYTIME",
    ctaDo: "That is the plan",
    ctaFilter: "Sounds like you",
    ctaStructure: "Week 1 starts here",
    ctaProof: "30 days to try it",
    ctaProofRunners: "7 days free to try it",
    ctaFaq: "Still thinking?",
  },
  es: {
    onePayment: "Un pago",
    startsMondays: "Empieza los lunes",
    includedMembership: "Incluido en la membresía 54D ON",
    programEyebrow: "El programa",
    doTitle1: "Lo que vas a",
    doTitle2: "hacer.",
    filterEyebrow: "El filtro honesto",
    filterTitle1: "¿Esto es",
    filterTitle2: "para ti?",
    forYouIf: "Esto es para ti si",
    notForYouIf: "Esto NO es para ti si",
    structureEyebrow: "La estructura",
    structureTitle1: "Los números",
    structureTitle2: "que importan.",
    progressionEyebrow: "La progresión",
    phasesEyebrow: "Tus 9 semanas",
    phasesTitle1: "Tres ciclos.",
    phasesTitle2: "Un estándar.",
    proofEyebrow: "Riesgo cero",
    proofTitle1: "Un coach real.",
    proofTitle2: "Una garantía real.",
    guaranteeName: "Garantía de devolución de 30 días",
    guaranteeBody:
      "Entrénalo 30 días. Si no es para ti, te devolvemos tu dinero. Sin interrogatorios, sin letra chica.",
    coachName: "Un coach real, no un algoritmo",
    coachBody:
      "Un coach certificado de 54D revisa tu técnica y te responde en la app. Cada pregunta, cada repetición, todo el camino.",
    captionStudio: "Tomada en un estudio 54D. Este es el estándar.",
    captionCoach: "Un coach certificado de 54D, de tu lado.",
    faqEyebrow: "Preguntas",
    faqTitle1: "Antes de",
    faqTitle2: "empezar.",
    opening: "Abriendo el pago…",
    nextGen: "La próxima generación empieza el lunes",
    inDays: "en",
    day: "día",
    days: "días",
    membershipEyebrow: "También disponible por mes",
    membershipLine:
      "¿Prefieres pagar por mes? La membresía 54D ON incluye los 13 programas, coach ilimitado y más de 650 sesiones grabadas por $54/mes, con 7 días gratis.",
    membershipYearly:
      "¿Prefieres el plan anual? $588 al año cubren este programa y todo lo demás.",
    membershipLink: "Ver planes de membresía · $54/mes, 7 días gratis →",
    noSubscription: "Un pago. Sin suscripción.",
    noteOnePayment: "UN PAGO · GARANTÍA DE 30 DÍAS",
    noteTrial: "7 DÍAS GRATIS · CANCELA CUANDO QUIERAS",
    ctaDo: "Ese es el plan",
    ctaFilter: "Si eso es lo tuyo",
    ctaStructure: "La semana 1 empieza aquí",
    ctaProof: "30 días para probarlo",
    ctaProofRunners: "7 días gratis para probarlo",
    ctaFaq: "¿Todavía lo piensas?",
  },
} as const;

/* Línea de encuadre de la banda RESULTADOS, por tier (cliente 13/08):
   el claim oficial -5kg SOLO en flagship (54d-on, step-2); mid, starter
   y runners llevan línea puente honesta SIN cifra ni deadline (regla
   dura Meta Personal Health). */
const RESULTS_FRAME: Record<ProgramTier, Record<Lang, string>> = {
  flagship: {
    en: "Average member result: -5 kg in 54 days · Verified by 54D coaches",
    es: "Resultado promedio de nuestros miembros: -5 kg en 54 días · Verificado por coaches 54D",
  },
  mid: {
    en: "Results from the complete 54D method. This program runs on the same system and the same coach.",
    es: "Resultados del método completo de 54D. Este programa entrena con el mismo sistema y el mismo coach.",
  },
  starter: {
    en: "These results come from the complete 54D method. This program is your way in.",
    es: "Estos resultados son del método completo de 54D. Este programa es tu punto de entrada.",
  },
  runners: {
    en: "The complete method behind these results is included in your membership.",
    es: "El método completo detrás de estos resultados está incluido en tu membresía.",
  },
};

/* ============ Estilos puntuales (solo inline + clases de app.css) ============ */

/* QUIET v6: acentos de display en blanco (inherit); el amarillo queda en
   CTAs, eyebrows y micro-marcas */
const solidAccent: CSSProperties = { color: "inherit" };
const bodyCopy: CSSProperties = {
  fontSize: "1.05rem",
  lineHeight: 1.6,
  color: "var(--c-mist)",
};
const twoCol: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: "clamp(2rem, 5vw, 4rem)",
  alignItems: "center",
  marginTop: "var(--space-block)",
};
const checkItem: CSSProperties = {
  listStyle: "none",
  display: "grid",
  gridTemplateColumns: "2rem 1fr",
  gap: "0.9rem",
  alignItems: "baseline",
  padding: "1.05rem 0",
  borderTop: "1px solid var(--hairline)",
};
const checkMark: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: "1.05rem",
  color: "var(--c-yellow)",
};
const checkText: CSSProperties = {
  fontSize: "1.05rem",
  lineHeight: 1.6,
  color: "var(--c-white)",
};
const cardLabel: CSSProperties = {
  fontFamily: "var(--font-label)",
  fontWeight: 700,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-eyebrow, 0.22em)",
};
const crossLink: CSSProperties = {
  display: "inline-block",
  marginTop: "0.9rem",
  minHeight: "44px",
  lineHeight: "44px",
  color: "var(--c-yellow)",
  textDecoration: "none",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
};
const priceRow: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.8rem",
  flexWrap: "wrap",
  marginTop: "1.8rem",
};
const priceNoteStyle: CSSProperties = {
  fontFamily: "var(--font-label)",
  fontWeight: 700,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
  color: "var(--c-mist)",
};
const microStyle: CSSProperties = {
  marginTop: "1.1rem",
  fontFamily: "var(--font-label)",
  fontWeight: 700,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
  color: "var(--c-faint)",
};
const errStyle: CSSProperties = {
  marginTop: "1.1rem",
  fontSize: "0.9rem",
  color: "var(--c-yellow)",
};
const proofName: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: "var(--text-h3, 1.4rem)",
  lineHeight: 1.1,
  color: "var(--c-white)",
};
const verticalShot: CSSProperties = {
  width: "100%",
  display: "block",
  aspectRatio: "4 / 5",
  objectFit: "cover",
  borderRadius: "var(--r-media, 2px)",
  filter: "saturate(0.82) contrast(1.05)",
};

/** Precio grande con ancla tachada si aplica (hero y CTA final) */
function PriceLine({
  landing,
  note,
  center,
  lang,
}: {
  landing: ProgramLanding;
  note: string;
  center?: boolean;
  lang: Lang;
}) {
  return (
    <div style={center ? { ...priceRow, justifyContent: "center" } : priceRow}>
      <span className="pricing-price">
        {landing.anchor && (
          <s
            style={{
              fontSize: "0.45em",
              color: "var(--c-faint)",
              fontWeight: 500,
              marginRight: "0.4em",
            }}
          >
            {landing.anchor}
          </s>
        )}
        {landing.price}
        {landing.priceSuffix && (
          <span
            style={{
              fontSize: "0.38em",
              fontWeight: 700,
              color: "var(--c-mist)",
              marginLeft: "0.15em",
            }}
          >
            {landing.priceSuffix[lang]}
          </span>
        )}
      </span>
      <span style={priceNoteStyle}>{note}</span>
    </div>
  );
}

/** Quick wins: 4 pruebas de baja fricción, hairline puro (QUIET v6) */
function QuickWins({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="qw-row">
      {items.map((q) => (
        <div className="qw" key={q.label}>
          <div className="qw-value">{q.value}</div>
          <div className="qw-label">{q.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProgramLandingPage({
  loaderData,
}: Route.ComponentProps) {
  const p = loaderData.landing;
  const { lang } = useLang();
  const es = lang === "es";
  const t = T[lang];

  const doSection = useReveal();
  const filter = useReveal();
  const structure = useReveal();
  const journey = useReveal();
  const appStrip = useReveal();
  const proof = useReveal();
  const results = useReveal();
  const upsell = useReveal();
  const faq = useReveal();
  const cta = useReveal();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* El 503 de Stripe pendiente llega TIPADO (payments_not_configured):
     copy veraz bilingüe. El copy de conexión queda para fallos de red. */
  const buy = async (position: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await startCheckout(p.priceId, {
        contentId: p.slug,
        item: p.name,
        position,
        value: Number(p.price.replace(/[^0-9.]/g, "")),
      });
    } catch (e) {
      const pending = e instanceof Error && e.name === "payments_not_configured";
      setError(
        pending
          ? es
            ? "Estamos conectando los pagos. Podrás completar tu compra muy pronto; no es un problema de tu lado."
            : e.message
          : es
            ? "No pudimos iniciar el pago. Revisa tu conexión e intenta de nuevo."
            : "We couldn't start checkout. Check your connection and try again."
      );
      setBusy(false);
    }
  };

  /* ViewContent al montar: sin evento de mitad de embudo Meta no puede
     optimizar mientras el volumen de Purchase es bajo */
  useEffect(() => {
    const w = window as unknown as { fbq?: (...a: unknown[]) => void };
    w.fbq?.("track", "ViewContent", {
      content_ids: [p.slug],
      content_name: p.name,
      content_type: "product",
      content_category: p.tier,
      value: Number(p.price.replace(/[^0-9.]/g, "")),
      currency: "USD",
    });
  }, [p.slug, p.name, p.tier, p.price]);

  /* Escasez real del flagship: días hasta el próximo lunes, calculado
     en el cliente (post-hidratación) para no desfasar SSR vs browser */
  const [daysToMonday, setDaysToMonday] = useState<number | null>(null);
  useEffect(() => {
    if (p.tier !== "flagship") return;
    const day = new Date().getDay();
    setDaysToMonday((1 - day + 7) % 7 || 7);
  }, [p.tier]);

  const kicker =
    p.tier === "runners"
      ? `${p.name} · ${t.includedMembership}`
      : p.tier === "flagship"
        ? `${p.name} · ${p.duration[lang]} · ${t.startsMondays}`
        : `${p.name} · ${p.duration[lang]} · ${t.onePayment}`;

  const buyLabel =
    p.tier === "flagship"
      ? es
        ? `Reserva tu lugar · ${p.price}`
        : `Reserve my spot · ${p.price}`
      : p.tier === "mid"
        ? es
          ? `Empieza el programa · ${p.price}`
          : `Start the program · ${p.price}`
        : p.tier === "runners"
          ? es
            ? "Empieza gratis · 7 días"
            : "Start free · 7 days"
          : es
            ? `Empieza hoy · ${p.price}`
            : `Start today · ${p.price}`;

  const stickyLabel = busy ? t.opening : buyLabel;
  const inlineNote = p.tier === "runners" ? t.noteTrial : t.noteOnePayment;

  const finalTitle =
    p.tier === "flagship" ? (
      es ? (
        <>
          Tu lugar <span className="accent">se abre el lunes.</span>
        </>
      ) : (
        <>
          Your spot <span className="accent">opens Monday.</span>
        </>
      )
    ) : p.tier === "mid" ? (
      es ? (
        <>
          Un pago. <span className="accent">Un coach incluido.</span>
        </>
      ) : (
        <>
          One payment. <span className="accent">A coach included.</span>
        </>
      )
    ) : p.tier === "runners" ? (
      es ? (
        <>
          Tu primera semana <span className="accent">es gratis.</span>
        </>
      ) : (
        <>
          Your first week <span className="accent">is free.</span>
        </>
      )
    ) : es ? (
      <>
        {p.price}. <span className="accent">Empieza hoy.</span>
      </>
    ) : (
      <>
        {p.price}. <span className="accent">Start today.</span>
      </>
    );

  /* Único amarillo por vista: hero, sticky o cierre (nunca dos a la vez) */
  const heroButton = (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => buy("hero")}
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? t.opening : p.cta[lang]}
    </button>
  );
  const finalButton = (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => buy("final")}
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? t.opening : p.cta[lang]}
    </button>
  );

  /* CTA inline: camino de compra a un tap en cada punto del scroll.
     SIEMPRE ghost, para no romper la regla de un solo amarillo por vista. */
  const InlineCta = ({
    eyebrow,
    position,
  }: {
    eyebrow: string;
    position: string;
  }) => (
    <div className="inline-cta">
      <span className="inline-cta-eyebrow">{eyebrow}</span>
      <span className="inline-cta-note">{inlineNote}</span>
      <button
        type="button"
        className="btn btn-ghost inline-cta-btn"
        onClick={() => buy(position)}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? t.opening : buyLabel}
      </button>
    </div>
  );

  return (
    /* .landing-page: ritmo de landing de pauta — frontera de seccion mas
       corta que el sitio institucional (256px se leia como vacio; cliente
       14/08 "muchos espacios vacios") */
    <div className="landing-page">
      <Nav />

      {/* ============ 1. HERO (100vh, un solo CTA) ============ */}
      <header className="hero">
        <div className="hero-media">
          {/* heroFocus (data): foco de arte por slug via custom properties;
              app.css las lee como object-position d/m */}
          <img
            src={asset(p.hero.src)}
            alt={p.hero.alt[lang]}
            fetchPriority="high"
            decoding="async"
            loading="eager"
            style={
              {
                ...(p.heroFocus?.desktop && {
                  "--hero-pos-d": p.heroFocus.desktop,
                }),
                ...(p.heroFocus?.mobile && {
                  "--hero-pos-m": p.heroFocus.mobile,
                }),
              } as CSSProperties
            }
          />
        </div>
        <div className="hero-veil" />
        <div
          className={
            p.heroCopyNarrow ? "hero-content hero-copy-narrow" : "hero-content"
          }
        >
          <span className="day-marker">{kicker}</span>
          <h1 className="hero-title">
            {p.hook[lang].plain}
            <br />
            <span className="accent">{p.hook[lang].accent}</span>
          </h1>
          <p className="hero-sub">{p.subhead[lang]}</p>
          <PriceLine landing={p} note={p.priceNote[lang]} lang={lang} />
          <div className="hero-ctas">{heroButton}</div>
          {/* Mentalidad del comprador (cliente 16/08): "voy a bajar una app".
              El micro suma la senal de app + rating desde el hero. */}
          <p style={microStyle}>
            {p.microcopy[lang]}
            {" · "}
            {es ? "EN LA APP 54D ON ★ 4.9" : "IN THE 54D ON APP ★ 4.9"}
          </p>
          {/* Los quick wins van DEBAJO del botón a propósito: no empujan
              el primario fuera del pliegue en 375x667 */}
          <QuickWins items={p.quickWins[lang]} />
          {p.tier === "flagship" && (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.9rem",
                color: "var(--c-mist)",
              }}
            >
              {t.nextGen}
              {daysToMonday !== null &&
                ` · ${t.inDays} ${daysToMonday} ${daysToMonday === 1 ? t.day : t.days}`}
            </p>
          )}
          {p.urgency && (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.9rem",
                color: "var(--c-mist)",
              }}
            >
              {p.urgency[lang]}
            </p>
          )}
          {error && (
            <p role="alert" style={errStyle}>
              {error}
            </p>
          )}
        </div>
      </header>

      {/* ============ 1b. RESULTADOS (las 13, slot 2 post-hero) ============
          REGLA DE ALCANCE (cliente, 13/08): la banda de antes/despues va en
          las 13 landings, en slot 2 post-hero. Claim -5kg SOLO en 54d-on y
          step-2; mid/starter/runners llevan linea puente SIN cifra ni
          deadline. Microcopy `Los resultados varian segun la persona`
          SIEMPRE bajo composites (horneado aqui: imposible renderizar los
          composites sin el). Banda sin CTA ni urgencia. Labels THEN/NOW
          quemados en EN: aceptado, el contexto ES lo cargan microcaption y
          captions. Variante compacta (section-tight, sin H2) en starters y
          runners. */}
      <section
        className={
          p.tier === "starter" || p.tier === "runners"
            ? "section section-tight"
            : "section"
        }
      >
        <div className="section-inner" ref={results.ref}>
          <div className={results.className}>
            <span className="day-marker">{es ? "Resultados" : "Results"}</span>
            {(p.tier === "flagship" || p.tier === "mid") && (
              <h2 className="section-title">
                {es ? "El antes y después" : "The before and after"}{" "}
                <span style={solidAccent}>
                  {es ? "habla por sí solo." : "speaks for itself."}
                </span>
              </h2>
            )}
            <p style={{ ...bodyCopy, marginTop: "1.4rem", maxWidth: "38rem" }}>
              {RESULTS_FRAME[p.tier][lang]}
            </p>
            <div className="results-grid">
              {p.results.map((file) => {
                const name = file.charAt(0).toUpperCase() + file.slice(1);
                return (
                  <figure style={{ margin: 0 }} key={file}>
                    <img
                      src={asset(`images/results/${file}.jpg`)}
                      alt={
                        es
                          ? `Antes y después de ${name}, miembro de 54D ON`
                          : `${name}'s before and after as a 54D ON member`
                      }
                      loading="lazy"
                    />
                    <figcaption
                      style={{
                        ...cardLabel,
                        color: "var(--c-faint)",
                        fontSize: "0.7rem",
                        marginTop: "0.6rem",
                      }}
                    >
                      {name.toUpperCase()}
                      {es ? " · ANTES Y DESPUÉS" : " · THEN AND NOW"}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
            <p className="photo-caption" style={{ marginTop: "0.9rem" }}>
              {es
                ? "Antes y después reales de miembros de 54D ON · Los resultados varían según la persona."
                : "Real member before-and-afters from 54D ON · Results vary by person."}
            </p>
          </div>
        </div>
      </section>

      {/* ============ 2. WHAT YOU'LL DO (punteos ✓ + foto vertical) ============ */}
      <section className="section">
        <div className="section-inner" ref={doSection.ref}>
          <div className={doSection.className}>
            <span className="day-marker">{t.programEyebrow}</span>
            <h2 className="section-title">
              {t.doTitle1} <span style={solidAccent}>{t.doTitle2}</span>
            </h2>
            <div style={p.secondary ? twoCol : { marginTop: "var(--space-block)" }}>
              <ul style={{ margin: 0, padding: 0, maxWidth: "38rem" }}>
                {p.bullets[lang].map((b, i) => (
                  <li
                    key={i}
                    style={
                      i === p.bullets[lang].length - 1
                        ? { ...checkItem, borderBottom: "1px solid var(--hairline)" }
                        : checkItem
                    }
                  >
                    <span style={checkMark} aria-hidden="true">
                      ✓
                    </span>
                    <span style={checkText}>{b}</span>
                  </li>
                ))}
              </ul>
              {p.secondary && (
                <figure style={{ margin: 0, maxWidth: "26rem" }}>
                  <img
                    src={asset(p.secondary.src)}
                    alt={p.secondary.alt[lang]}
                    loading="lazy"
                    style={verticalShot}
                  />
                  <figcaption className="photo-caption">
                    {t.captionStudio}
                  </figcaption>
                </figure>
              )}
            </div>
            <InlineCta eyebrow={t.ctaDo} position="inline_do" />
          </div>
        </div>
      </section>

      {/* ============ 3. IS THIS FOR YOU (filtro honesto) ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={filter.ref}>
          <div className={filter.className}>
            <span className="day-marker">{t.filterEyebrow}</span>
            <h2 className="section-title">
              {t.filterTitle1} <span style={solidAccent}>{t.filterTitle2}</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "1.1rem",
                marginTop: "var(--space-block)",
              }}
            >
              <div
                className="method-card"
                style={{ borderColor: "var(--line-accent, rgba(255, 210, 0, 0.3))" }}
              >
                <div style={{ ...cardLabel, color: "var(--c-yellow)" }}>
                  {t.forYouIf}
                </div>
                <p className="method-desc" style={{ fontSize: "1.05rem" }}>
                  {p.forWho[lang]}
                </p>
              </div>
              <div className="method-card">
                <div style={{ ...cardLabel, color: "var(--c-faint)" }}>
                  {t.notForYouIf}
                </div>
                <p className="method-desc" style={{ fontSize: "1.05rem" }}>
                  {p.notFor[lang]}
                </p>
                {/* Descalificamos en frío: la puerta de salida se queda
                    dentro del sitio en vez de rebotar el clic pagado */}
                {p.notForLink && (
                  <Link to={`/programs/${p.notForLink.slug}`} style={crossLink}>
                    {p.notForLink.label[lang]}
                  </Link>
                )}
              </div>
            </div>
            <InlineCta eyebrow={t.ctaFilter} position="inline_filter" />
          </div>
        </div>
      </section>

      {/* ============ 4. THE STRUCTURE (stat cards; starters la saltan) ============ */}
      {p.stats && (
        <section className="section section-tight">
          <div className="section-inner" ref={structure.ref}>
            <div className={structure.className}>
              <span className="day-marker">{t.structureEyebrow}</span>
              <h2 className="section-title">
                {t.structureTitle1}{" "}
                <span style={solidAccent}>{t.structureTitle2}</span>
              </h2>
              <div className="stat-row prog-stats">
                {p.stats.map((s, i) => (
                  <div className="stat" key={i}>
                    <div className="stat-value">{s.value[lang]}</div>
                    <div className="stat-label">{s.label[lang]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ 4b. MID: semana tipo · FLAGSHIP: tus 9 semanas ============ */}
      {(p.progression || p.phases) && (
        <section className="section section-tight">
          <div className="section-inner" ref={journey.ref}>
            <div className={journey.className}>
              {p.progression && (
                <>
                  <span className="day-marker">{t.progressionEyebrow}</span>
                  <h2 className="section-title">
                    {p.progression.fromLabel[lang]} vs{" "}
                    <span style={solidAccent}>
                      {p.progression.toLabel[lang].toLowerCase()}.
                    </span>
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                      gap: "1.1rem",
                      marginTop: "var(--space-block)",
                    }}
                  >
                    <div className="method-card">
                      <div style={{ ...cardLabel, color: "var(--c-faint)" }}>
                        {p.progression.fromLabel[lang]}
                      </div>
                      <p className="method-desc" style={{ fontSize: "1.02rem" }}>
                        {p.progression.from[lang]}
                      </p>
                    </div>
                    <div
                      className="method-card"
                      style={{
                        borderColor: "var(--line-accent, rgba(255, 210, 0, 0.3))",
                      }}
                    >
                      <div style={{ ...cardLabel, color: "var(--c-yellow)" }}>
                        {p.progression.toLabel[lang]}
                      </div>
                      <p className="method-desc" style={{ fontSize: "1.02rem" }}>
                        {p.progression.to[lang]}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {p.phases && (
                <>
                  <span className="day-marker">{t.phasesEyebrow}</span>
                  <h2 className="section-title">
                    {t.phasesTitle1}{" "}
                    <span style={solidAccent}>{t.phasesTitle2}</span>
                  </h2>
                  <div className="timeline">
                    {p.phases.map((ph, i) => (
                      <div className="timeline-item" key={i}>
                        <span className="timeline-day">{ph.label[lang]}</span>
                        <h3>{ph.title[lang]}</h3>
                        <p>{ph.desc[lang]}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <InlineCta eyebrow={t.ctaStructure} position="inline_structure" />
            </div>
          </div>
        </section>
      )}

      {/* ============ 4c. LA APP (mentalidad comprador de app, 16/08):
           el telefono real + 3 hechos + tiendas. Patron probado de /on. ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={appStrip.ref}>
          <div className={appStrip.className}>
            <div className="app-strip">
              <picture>
                <source
                  media="(max-width: 640px)"
                  srcSet={asset("images/app/Phone-hero-mobile.png")}
                />
                <img
                  src={asset("images/app/Phone-d-hero.png")}
                  alt={
                    es
                      ? "La app 54D On: la sesión del día en video y el chat real con tu coach"
                      : "The 54D On app: today's session on video and the real chat with your coach"
                  }
                  loading="lazy"
                  className="app-strip-phone"
                />
              </picture>
              <div>
                <h2 className="section-title" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
                  {es
                    ? "Tu programa vive en la app 54D On."
                    : "Your program lives in the 54D On app."}
                </h2>
                <ul className="app-strip-list">
                  <li>
                    {es
                      ? "Cada sesión en video, con tu coach real en el chat"
                      : "Every session on video, with your real coach in the chat"}
                  </li>
                  <li>{es ? "iOS y Android" : "iOS and Android"}</li>
                  <li>
                    {es
                      ? "La app se descarga gratis"
                      : "The app is free to download"}
                  </li>
                </ul>
                <AppStoreBadges
                  appStoreUrl={APP_STORE_URL}
                  googlePlayUrl={GOOGLE_PLAY_URL}
                />
                <div className="app-rating">
                  <span>
                    <b>4.9</b> App Store
                  </span>
                  <span>
                    <b>4.9</b> Google Play
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. PROOF (garantía + coach real + 4.9) ============ */}
      <section className="section">
        <div className="section-inner" ref={proof.ref}>
          <div className={proof.className}>
            <span className="day-marker">{t.proofEyebrow}</span>
            <h2 className="section-title">
              {t.proofTitle1} <span style={solidAccent}>{t.proofTitle2}</span>
            </h2>
            {/* alignItems start SOLO aca: las coach cards alinean con la
                primera hairline de la garantia (las demas secciones siguen
                center) */}
            <div style={{ ...twoCol, alignItems: "start" }}>
              {/* Cards oficiales de coaches (nombre y especialidad quemados)
                  cuando la landing tiene equipo asignado; si no, la foto de
                  manos de siempre. Fucho EXCLUIDO del pool (boxeo). */}
              {p.coaches?.length ? (
                <div>
                  <div className="coach-row">
                    {p.coaches.map((path) => {
                      const file = path.split("/").pop()!.replace(".jpg", "");
                      const coachName =
                        file.charAt(0).toUpperCase() + file.slice(1);
                      return (
                        <div className="coach-card" key={path}>
                          <img
                            src={asset(path)}
                            alt={
                              es
                                ? `${coachName}, coach de 54D`
                                : `${coachName}, 54D coach`
                            }
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="photo-caption">{t.captionCoach}</p>
                </div>
              ) : (
                <figure style={{ margin: 0 }}>
                  <img
                    src={asset(COACH_PHOTO.src)}
                    alt={COACH_PHOTO.alt[lang]}
                    loading="lazy"
                    style={{ ...verticalShot, aspectRatio: "4 / 3" }}
                  />
                  <figcaption className="photo-caption">
                    {t.captionCoach}
                  </figcaption>
                </figure>
              )}
              <div>
                <div style={{ borderTop: "1px solid var(--hairline)", padding: "1.4rem 0" }}>
                  <h3 style={proofName}>{t.guaranteeName}</h3>
                  <p style={{ ...bodyCopy, marginTop: "0.6rem" }}>
                    {t.guaranteeBody}
                  </p>
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--hairline)",
                    borderBottom: "1px solid var(--hairline)",
                    padding: "1.4rem 0",
                  }}
                >
                  <h3 style={proofName}>{t.coachName}</h3>
                  <p style={{ ...bodyCopy, marginTop: "0.6rem" }}>
                    {t.coachBody}
                  </p>
                </div>
                <div style={{ marginTop: "1.8rem" }}>
                  <AppStoreBadges
                    appStoreUrl={APP_STORE_URL}
                    googlePlayUrl={GOOGLE_PLAY_URL}
                  />
                  <div className="app-rating">
                    <span>
                      <b>4.9</b> App Store
                    </span>
                    <span>
                      <b>4.9</b> Google Play
                    </span>
                  </div>
                </div>
                {/* Resena real del App Store (harvest, verbatim, jamas
                    traducida): la voz humana justo bajo la cifra 4.9.
                    Rail editorial: sin caja, sin glass. */}
                {p.testimonial && (
                  <div
                    style={{
                      borderTop: "1px solid var(--hairline)",
                      marginTop: "1.4rem",
                      padding: "1.4rem 0 0",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        color: "var(--c-yellow)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.2em",
                      }}
                    >
                      {"★".repeat(p.testimonial[lang].rating)}
                    </div>
                    <p
                      style={{
                        fontSize: "1.05rem",
                        lineHeight: 1.6,
                        color: "var(--c-white)",
                        margin: "0.7rem 0 0",
                      }}
                    >
                      {p.testimonial[lang].quote}
                    </p>
                    <div
                      style={{
                        ...cardLabel,
                        color: "var(--c-faint)",
                        fontSize: "0.7rem",
                        marginTop: "0.7rem",
                      }}
                    >
                      {p.testimonial[lang].author} · App Store ·{" "}
                      {p.testimonial[lang].country.toUpperCase()}
                    </div>
                  </div>
                )}
                <InlineCta
                  eyebrow={p.tier === "runners" ? t.ctaProofRunners : t.ctaProof}
                  position="inline_proof"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. FAQ (único campo de gradiente: pre-CTA) ============ */}
      <section className="section bloom-ember">
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">{t.faqEyebrow}</span>
            <h2 className="section-title">
              {t.faqTitle1} <span style={solidAccent}>{t.faqTitle2}</span>
            </h2>
            {/* 2 columnas en desktop: mismo patrón que /pricing y /on */}
            <div
              className="faq-list"
              style={{
                maxWidth: "none",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))",
                alignItems: "start",
              }}
            >
              {/* Tráfico frío en teléfono no abre acordeones: el primero,
                  que es la objeción desbloqueante del tier, va abierto */}
              {p.faq[lang].map((f, i) => (
                <details className="faq-item" key={f.q} open={i === 0}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <InlineCta eyebrow={t.ctaFaq} position="inline_faq" />
          </div>
        </div>
      </section>

      {/* ============ 7. CTA FINAL (repite precio + botón + microcopy) ============ */}
      <section className="section" id="buy" style={{ scrollMarginTop: "5rem" }}>
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">{finalTitle}</h2>
            <PriceLine landing={p} note={p.priceNote[lang]} center lang={lang} />
            <QuickWins items={p.quickWins[lang]} />
            <div className="hero-ctas">{finalButton}</div>
            <p style={{ ...microStyle, marginTop: "1.2rem" }}>
              {p.microcopy[lang]}
            </p>
            {p.tier !== "runners" && (
              <p style={{ ...microStyle, marginTop: "0.6rem" }}>
                {t.noSubscription}
              </p>
            )}
            {error && (
              <p role="alert" style={errStyle}>
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============ 8. MEMBRESÍA (después del cierre: no compite con la
           venta de un pago justo antes del botón) ============ */}
      {p.tier !== "runners" && (
        <section className="section section-tight">
          <div className="section-inner" ref={upsell.ref}>
            <div className={upsell.className} style={{ maxWidth: "44rem" }}>
              <div style={{ ...cardLabel, color: "var(--c-faint)" }}>
                {t.membershipEyebrow}
              </div>
              <p style={{ ...bodyCopy, marginTop: "0.7rem" }}>
                {t.membershipLine}
              </p>
              {p.tier === "flagship" && (
                <p
                  style={{
                    marginTop: "0.6rem",
                    fontSize: "0.9rem",
                    color: "var(--c-faint)",
                  }}
                >
                  {t.membershipYearly}
                </p>
              )}
              <Link
                to="/pricing"
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  minHeight: "48px",
                  lineHeight: "48px",
                  color: "var(--c-yellow)",
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "var(--track-label, 0.14em)",
                }}
              >
                {t.membershipLink}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sticky mobile: cobra en 1 tap y se retira cuando #buy entra en vista.
          error: el fallo del tap sticky aparece DENTRO de la barra. */}
      <StickyCta
        href="#buy"
        label={stickyLabel}
        onClick={() => buy("sticky")}
        busy={busy}
        hideWhenVisible="#buy"
        error={error}
      />

      <Footer />
    </div>
  );
}
