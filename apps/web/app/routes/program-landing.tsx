import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/program-landing";
import { Nav, Footer, useReveal } from "../components/site";
import { AppStoreBadges } from "../components/badges";
import { StickyCta } from "../components/sticky-cta";
import { asset } from "../lib/asset";
import { startCheckout } from "../lib/attribution";
import { PROGRAM_LANDINGS } from "../data/program-landings";
import type { ProgramLanding, ProgramSlug } from "../data/program-landings";

/* ============================================================
   /programs/:slug: landing por programa para tráfico frío de Meta
   (docs/marketing/PROGRAM_LANDINGS.md). Un template, 13 landings,
   variantes por tier (starter / mid / flagship / runners).
   Checkout directo con startCheckout(priceId); la atribución
   (utm_content={{ad.name}}) ya la captura root.tsx y la adjunta
   el propio startCheckout: acá no hay tracking extra.
   ============================================================ */

export async function loader({ params }: Route.LoaderArgs) {
  const landing: ProgramLanding | undefined =
    PROGRAM_LANDINGS[params.slug as ProgramSlug];
  if (!landing) throw new Response("Not Found", { status: 404 });
  return { landing };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "54D Programs" }];
  const p = loaderData.landing;
  return [
    { title: `${p.name}: ${p.hook.plain} ${p.hook.accent} | 54D` },
    { name: "description", content: p.subhead },
  ];
}

const APP_STORE_URL = "https://apps.apple.com/us/app/54d-on/id1520445334";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays";

/* Foto de coach del bloque PROOF (doc §1.5: coach-correction / coach-hands;
   coach-correction es hero de First Move, así que PROOF usa coach-hands) */
const COACH_PHOTO = {
  src: "images/studios/hallandale/coach-hands.jpg",
  alt: "Close-up of a 54D coach's hands guiding an athlete through a movement",
};

/* ============ Estilos puntuales (solo inline + clases de app.css) ============ */

const solidAccent: CSSProperties = { color: "var(--c-yellow)" };
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
const priceRow: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.8rem",
  flexWrap: "wrap",
  marginTop: "1.8rem",
};
const priceAnchor: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: "1.4rem",
  color: "var(--c-faint)",
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
  textTransform: "uppercase",
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
  center,
}: {
  landing: ProgramLanding;
  center?: boolean;
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
            {landing.priceSuffix}
          </span>
        )}
      </span>
      <span style={priceNoteStyle}>{landing.priceNote}</span>
    </div>
  );
}

export default function ProgramLandingPage({
  loaderData,
}: Route.ComponentProps) {
  const p = loaderData.landing;

  const doSection = useReveal();
  const filter = useReveal();
  const structure = useReveal();
  const journey = useReveal();
  const proof = useReveal();
  const upsell = useReveal();
  const faq = useReveal();
  const cta = useReveal();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await startCheckout(p.priceId);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We couldn't start checkout. Check your connection and try again."
      );
      setBusy(false);
    }
  };

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
      ? `${p.name} · Included with 54D ON membership`
      : p.tier === "flagship"
        ? `${p.name} · ${p.duration} · Starts Mondays`
        : `${p.name} · ${p.duration} · One payment`;

  const stickyLabel =
    p.tier === "flagship"
      ? `Reserve my spot · ${p.price}`
      : p.tier === "runners"
        ? `Start free · ${p.price}/mo`
        : `${p.cta} · ${p.price}`;

  const finalTitle =
    p.tier === "flagship" ? (
      <>
        Your spot <span className="accent">opens Monday.</span>
      </>
    ) : p.tier === "mid" ? (
      <>
        One payment. <span className="accent">A coach included.</span>
      </>
    ) : p.tier === "runners" ? (
      <>
        Your first week <span className="accent">is free.</span>
      </>
    ) : (
      <>
        {p.price}. <span className="accent">Start today.</span>
      </>
    );

  const checkoutButton = (
    <button
      type="button"
      className="btn btn-primary"
      onClick={buy}
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? "Opening checkout…" : p.cta}
    </button>
  );

  return (
    <div>
      <Nav />

      {/* ============ 1. HERO (100vh, un solo CTA) ============ */}
      <header className="hero">
        <div className="hero-media">
          <img src={asset(p.hero.src)} alt={p.hero.alt} />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">{kicker}</span>
          <h1 className="hero-title">
            {p.hook.plain}
            <br />
            <span className="accent">{p.hook.accent}</span>
          </h1>
          <p className="hero-sub">{p.subhead}</p>
          <PriceLine landing={p} />
          <div className="hero-ctas">{checkoutButton}</div>
          <p style={microStyle}>{p.microcopy}</p>
          {p.tier === "flagship" && (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.9rem",
                color: "var(--c-mist)",
              }}
            >
              Next generation starts Monday
              {daysToMonday !== null &&
                ` · in ${daysToMonday} ${daysToMonday === 1 ? "day" : "days"}`}
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
              {p.urgency}
            </p>
          )}
          {error && (
            <p role="alert" style={errStyle}>
              {error}
            </p>
          )}
        </div>
      </header>

      {/* ============ 2. WHAT YOU'LL DO (punteos ✓ + foto vertical) ============ */}
      <section className="section">
        <div className="section-inner" ref={doSection.ref}>
          <div className={doSection.className}>
            <span className="day-marker">The program</span>
            <h2 className="section-title">
              What you'll <span style={solidAccent}>do.</span>
            </h2>
            <div style={p.secondary ? twoCol : { marginTop: "var(--space-block)" }}>
              <ul style={{ margin: 0, padding: 0, maxWidth: "38rem" }}>
                {p.bullets.map((b, i) => (
                  <li
                    key={b}
                    style={
                      i === p.bullets.length - 1
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
                    alt={p.secondary.alt}
                    loading="lazy"
                    style={verticalShot}
                  />
                  <figcaption className="photo-caption">
                    Shot at a 54D studio. This is the standard.
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. IS THIS FOR YOU (filtro honesto) ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={filter.ref}>
          <div className={filter.className}>
            <span className="day-marker">The honest filter</span>
            <h2 className="section-title">
              Is this <span style={solidAccent}>for you?</span>
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
                  This is for you if
                </div>
                <p className="method-desc" style={{ fontSize: "1.05rem" }}>
                  {p.forWho}
                </p>
              </div>
              <div className="method-card">
                <div style={{ ...cardLabel, color: "var(--c-faint)" }}>
                  This is NOT for you if
                </div>
                <p className="method-desc" style={{ fontSize: "1.05rem" }}>
                  {p.notFor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4. THE STRUCTURE (stat cards; starters la saltan) ============ */}
      {p.stats && (
        <section className="section section-tight">
          <div className="section-inner" ref={structure.ref}>
            <div className={structure.className}>
              <span className="day-marker">The structure</span>
              <h2 className="section-title">
                The numbers <span style={solidAccent}>that matter.</span>
              </h2>
              <div className="stat-row">
                {p.stats.map((s) => (
                  <div className="stat" key={s.label}>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
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
                  <span className="day-marker">The progression</span>
                  <h2 className="section-title">
                    {p.progression.fromLabel} vs{" "}
                    <span style={solidAccent}>
                      {p.progression.toLabel.toLowerCase()}.
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
                        {p.progression.fromLabel}
                      </div>
                      <p className="method-desc" style={{ fontSize: "1.02rem" }}>
                        {p.progression.from}
                      </p>
                    </div>
                    <div
                      className="method-card"
                      style={{
                        borderColor: "var(--line-accent, rgba(255, 210, 0, 0.3))",
                      }}
                    >
                      <div style={{ ...cardLabel, color: "var(--c-yellow)" }}>
                        {p.progression.toLabel}
                      </div>
                      <p className="method-desc" style={{ fontSize: "1.02rem" }}>
                        {p.progression.to}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {p.phases && (
                <>
                  <span className="day-marker">Your 9 weeks</span>
                  <h2 className="section-title">
                    Three cycles. <span style={solidAccent}>One standard.</span>
                  </h2>
                  <div className="timeline">
                    {p.phases.map((ph) => (
                      <div className="timeline-item" key={ph.label}>
                        <span className="timeline-day">{ph.label}</span>
                        <h3>{ph.title}</h3>
                        <p>{ph.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 5. PROOF (garantía + coach real + 4.9) ============ */}
      <section className="section">
        <div className="section-inner" ref={proof.ref}>
          <div className={proof.className}>
            <span className="day-marker">Zero risk</span>
            <h2 className="section-title">
              A real coach. <span style={solidAccent}>A real guarantee.</span>
            </h2>
            <div style={twoCol}>
              <figure style={{ margin: 0 }}>
                <img
                  src={asset(COACH_PHOTO.src)}
                  alt={COACH_PHOTO.alt}
                  loading="lazy"
                  style={{ ...verticalShot, aspectRatio: "4 / 3" }}
                />
                <figcaption className="photo-caption">
                  A certified 54D coach, in your corner.
                </figcaption>
              </figure>
              <div>
                <div style={{ borderTop: "1px solid var(--hairline)", padding: "1.4rem 0" }}>
                  <h3 style={proofName}>30-day money-back guarantee</h3>
                  <p style={{ ...bodyCopy, marginTop: "0.6rem" }}>
                    Follow the program, and if you don't see results in 30 days,
                    we refund your money. No interrogation, no fine print.
                  </p>
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--hairline)",
                    borderBottom: "1px solid var(--hairline)",
                    padding: "1.4rem 0",
                  }}
                >
                  <h3 style={proofName}>A real coach, not an algorithm</h3>
                  <p style={{ ...bodyCopy, marginTop: "0.6rem" }}>
                    A certified 54D coach reviews your form and answers in the
                    app. Every question, every rep, the whole way through.
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. MEMBRESÍA (upsell suave; runners ya la venden) ============ */}
      {p.tier !== "runners" && (
        <section className="section section-tight">
          <div className="section-inner" ref={upsell.ref}>
            <div className={upsell.className} style={{ maxWidth: "44rem" }}>
              <div
                style={{
                  border: "1px solid var(--hairline)",
                  borderRadius: "var(--r-card, 8px)",
                  background: "var(--glass)",
                  backdropFilter: "blur(10px)",
                  padding: "1.9rem 1.8rem",
                }}
              >
                <div style={{ ...cardLabel, color: "var(--c-yellow)" }}>
                  Or get everything
                </div>
                <p style={{ ...bodyCopy, color: "var(--c-white)", marginTop: "0.7rem" }}>
                  All 10 programs + unlimited coach + 650+ sessions for $54/mo.
                  7-day free trial.
                </p>
                {p.tier === "flagship" && (
                  <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", color: "var(--c-faint)" }}>
                    Going yearly? $588 a year covers this program, plus
                    everything else.
                  </p>
                )}
                <Link
                  to="/pricing"
                  style={{
                    display: "inline-block",
                    marginTop: "1rem",
                    color: "var(--c-yellow)",
                    textDecoration: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "var(--track-label, 0.14em)",
                  }}
                >
                  See membership plans →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ 7. FAQ (único campo de gradiente: pre-CTA) ============ */}
      <section className="section bloom-ember">
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">FAQ</span>
            <h2 className="section-title">
              Before you <span style={solidAccent}>start.</span>
            </h2>
            <div className="faq-list">
              {p.faq.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. CTA FINAL (repite precio + botón + microcopy) ============ */}
      <section className="section" id="buy" style={{ scrollMarginTop: "5rem" }}>
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">{finalTitle}</h2>
            <PriceLine landing={p} center />
            <div className="hero-ctas">{checkoutButton}</div>
            <p style={{ ...microStyle, marginTop: "1.2rem" }}>{p.microcopy}</p>
            {error && (
              <p role="alert" style={errStyle}>
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky mobile: precio + CTA al scrollear pasado el hero */}
      <StickyCta href="#buy" label={stickyLabel} />

      <Footer />
    </div>
  );
}
