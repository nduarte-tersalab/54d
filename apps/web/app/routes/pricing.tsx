import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/pricing";
import { Nav, Footer, useReveal } from "../components/site";
import { StickyCta } from "../components/sticky-cta";
import { startCheckout } from "../lib/attribution";
import { asset } from "../lib/asset";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D ON Pricing: Start With 7 Days Free" },
    {
      name: "description",
      content:
        "Pick your 54D ON plan: monthly, quarterly, or annual. 7-day free trial, no commitment, 30-day guarantee. Cancel anytime, straight from your account.",
    },
  ];
}

/* ============================================================
   MEMBERSHIP_SALES §1: clases nuevas del bloque de planes.
   Viven en este archivo (no en app.css) porque solo /pricing
   las usa: .plans-split, .plans-stack, .plans-photo,
   .check-list, .btn-riskline. Todo lo demás reusa app.css.
   ============================================================ */
const PLANS_CSS = `
/* §1.1 Split 5/7: foto vertical izquierda, planes apilados derecha */
.plans-split { display: grid; grid-template-columns: 5fr 7fr; gap: var(--space-block); align-items: start; margin-top: var(--space-block); }
.plans-photo { margin: 0; }
.plans-photo .photo-card { position: relative; }
/* Overlay: negro 60% desde abajo (patron photo-band) para que la foto
   no compita en luminancia con el precio */
.plans-photo .photo-card::after { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(7, 7, 7, 0) 40%, rgba(7, 7, 7, 0.6) 100%); }
.plans-stack { display: grid; gap: 1.1rem; align-content: start; }
.plans-stack .pricing-card > header { display: flex; flex-direction: column; gap: 0.4rem; }
.plans-stack .pricing-card .check-list { margin-bottom: 1.5rem; }
.plans-stack .pricing-card > footer { margin-top: auto; display: flex; flex-direction: column; }

/* §1.2 Punteos con checkmarks duros: sin circulo, sin fondo, sin pills */
.check-list { display: grid; gap: 0.55rem; margin-top: 1.1rem; list-style: none; padding: 0; }
/* li en bloque con check absoluto: el <strong> fluye INLINE con el
   resto (el flex anterior partia lead/rest en columnas rotas) */
.check-list li { position: relative; padding-left: 1.5rem; font-size: 0.95rem; line-height: 1.5; color: var(--c-mist); }
.check-list li::before { content: '\\2713'; position: absolute; left: 0; top: 0; color: var(--c-yellow); font-weight: 700; }
.check-list li strong { color: var(--c-white); font-weight: 600; }

/* §3.4 Microcopy de riesgo pegado al boton */
.btn-riskline { display: block; font-size: 0.72rem; color: var(--c-faint); text-align: center; margin-top: 0.55rem; letter-spacing: 0.02em; }

/* §1.3.3 Lista de valor completa a 1.05rem en Everything included */
.photo-grid .check-list { margin-top: 1.6rem; max-width: 36rem; display: grid; gap: 0.9rem; }
.photo-grid .check-list li { font-size: 1.05rem; padding-left: 1.7rem; }

@media (min-width: 1081px) {
  /* Foto sticky mientras se escanean los 3 precios */
  .plans-photo { position: sticky; top: 6rem; }
}
@media (min-width: 1240px) {
  /* §1.1 Cards apiladas pasan a layout horizontal interno (patron Peloton):
     plan+precio izquierda, diferenciales centro, CTA derecha.
     Un solo eje vertical de comparacion de precios. */
  .plans-stack .pricing-card { display: grid; grid-template-columns: minmax(9rem, 10.5rem) 1fr minmax(11rem, 12.5rem); align-items: center; column-gap: 1.6rem; }
  .plans-stack .pricing-card .check-list { margin: 0; }
  .plans-stack .pricing-card > footer { margin-top: 0; }
}
@media (max-width: 1080px) {
  /* Mobile/tablet: apila con la foto arriba, max 46vh */
  .plans-split { grid-template-columns: 1fr; }
  .plans-photo .photo-card { height: 46vh; }
}
@media (max-width: 900px) {
  /* Replica del refuerzo featured de app.css (alli scoped a .pricing-grid):
     la featured abre el stack en mobile commerce */
  .plans-stack .pricing-card.featured { order: -1; background: var(--glass-hover); box-shadow: 0 16px 48px rgba(255, 200, 0, 0.10); }
}
`;

/* ============================================================
   Planes 54D ON.
   priceId: PLACEHOLDER. Reemplazar por los price ids reales
   de Stripe cuando el cliente los confirme.
   ============================================================ */
type Plan = {
  priceId: string;
  plan: string;
  price: string;
  regular: string;
  period: string;
  /* §1.2: solo los 3 diferenciales del plan, verbo primero en <strong> */
  features: { lead: string; rest: string }[];
  featured: boolean;
  badge?: string;
};

/* Precios reales de store.54d.com/packs, verificados 25/07/2026.
   regular = precio de lista que la tienda tacha (ancla de descuento).
   PRICE_IDs de Stripe pendientes de las keys del cliente. */
const PLANS: Plan[] = [
  {
    priceId: "PENDING_membership_monthly",
    plan: "Monthly",
    price: "$54",
    regular: "$99",
    period: "/ month · billed monthly",
    features: [
      { lead: "Start", rest: " with everything unlocked from day 1" },
      { lead: "Commit", rest: " to nothing: billed month to month" },
      { lead: "Cancel", rest: " anytime from your account, one click" },
    ],
    featured: false,
  },
  {
    priceId: "PENDING_membership_quarterly",
    plan: "Quarterly",
    price: "$52",
    regular: "$89",
    period: "/ month · $156 every 3 months",
    badge: "Most chosen",
    features: [
      { lead: "Get", rest: " everything in the monthly plan" },
      { lead: "Cover", rest: " the full 54 days, plus time to lock the habit" },
      { lead: "Save", rest: " $2 every month vs the monthly plan" },
    ],
    featured: true,
  },
  {
    priceId: "PENDING_membership_yearly",
    plan: "Annual",
    price: "$49",
    regular: "$79",
    period: "/ month · $588 a year",
    features: [
      { lead: "Get", rest: " everything in the monthly plan" },
      { lead: "Lock", rest: " the lowest monthly price all year" },
      { lead: "Train", rest: " every new release at no extra cost" },
    ],
    featured: false,
  },
];

/* §4 Punteos EXACTOS de la membresía: la lista de valor completa
   vive UNA sola vez, en Everything included. Verbo primero. */
const MEMBERSHIP_VALUE: { lead: string; rest: string }[] = [
  {
    lead: "Train every program",
    rest: ": all 13, including 54D ON, with 650+ recorded sessions",
  },
  {
    lead: "Get a real coach",
    rest: " in your corner: unlimited chat, corrections, and follow-up",
  },
  {
    lead: "Eat with a plan",
    rest: ": 12+ nutrition protocols and 120+ recipes built by the team",
  },
  {
    lead: "Start free",
    rest: ": 7 full days with everything unlocked before you pay a cent",
  },
  {
    lead: "Cancel in one click",
    rest: ": from your account, no calls, no retention tricks",
  },
  {
    lead: "Keep your results covered",
    rest: ": 30-day money-back guarantee if you do the work",
  },
];

/* Bloque anti-objeción: matar riesgo percibido en tráfico frío */
const NO_RISK = [
  {
    q: "What if I don't like it?",
    name: "7-day free trial",
    desc: "Full access to the method from minute one. If it's not for you, cancel in one click before day 8. The charge is zero.",
  },
  {
    q: "What if I start and it doesn't work?",
    name: "30-day guarantee",
    desc: "Follow the program, and if you don't see results, we refund your money. No interrogation, no fine print.",
  },
  {
    q: "Will you charge me without warning?",
    name: "No surprise charges",
    desc: "We email you before your first charge. Cancel from your account: no calls, no retention tricks.",
  },
];

/* SOCIAL_PROOF_PLACEHOLDER: reemplazar con testimonios reales
   del cliente (nombre, edad, ciudad, generación y foto). */
const TESTIMONIALS = [
  {
    quote:
      "I thought it was another workout app. The difference was the coach: he wrote to me every day, even the days I wanted to disappear.",
    name: "Mariana R., 34",
    tag: "Gen 41 · Mexico City",
  },
  {
    quote:
      "I did the full method from home, with two dumbbells and a band. On day 54 I didn't recognize myself in the day 1 photos.",
    name: "Camilo T., 29",
    tag: "54D ON · Bogotá",
  },
  {
    quote:
      "What scared me most was paying and quitting, like always. This time, someone didn't let me let go. That's the difference.",
    name: "Andrea S., 41",
    tag: "54D ON · Miami",
  },
];

/* FAQ de objeciones: también alimenta el schema FAQPage */
const FAQS: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account in one click: no calls, no tricks. Cancel before day 8 and you pay nothing. And we email you before your first charge.",
  },
  {
    q: "Do I need equipment or experience?",
    a: "No. You start at your level, with what you have at home. Sessions are progressive: the program adapts to your starting point, not the other way around.",
  },
  {
    q: "Do I need the app?",
    a: "Yes. 54D ON is delivered through the 54D On app for iOS and Android: your daily training, your nutrition protocol, and the chat with your coach all live there. The app is free to download and rated 4.9 on the App Store. Your subscription unlocks everything.",
    link: { href: "/on", label: "See how 54D ON works →" },
  },
  {
    q: "What's the coach like? Is it a real person?",
    a: "A real person, not a bot. Your coach writes to you over chat, reviews your progress, corrects you, and demands more. Every day. The app is just the vehicle: the method is the coach.",
  },
  {
    q: "How does billing work?",
    a: "You activate your 7-day free trial at no cost. Before it ends, we email you. Only then does the first charge for the plan you chose go through, processed securely by Stripe. After that it renews per your plan, and you can cancel anytime.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. You can switch from monthly to quarterly or annual from your account anytime; the change applies on your next billing cycle.",
  },
  {
    q: "Which countries is it available in?",
    a: "All of them. 54D ON works from any country, on any device; prices are in US dollars (USD) and payment is processed by Stripe.",
  },
  {
    q: "How does the 54D Method work?",
    a: "54 days of structured training, a personalized nutrition protocol, and daily coaching. A program with a start, an end, and someone who demands more of you.",
    link: { href: "/method", label: "See the full method →" },
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const MICROCOPY = "7 days free · cancel anytime · 30-day guarantee";
/* §3.4: la riskline por card ya dice "7 days free · cancel anytime";
   la línea central de la sección no lo triplica */
const RISKLINE = "7 days free · cancel anytime";
const PLANS_FOOTNOTE = "30-day guarantee · secure payment by Stripe";

export default function Pricing() {
  const plans = useReveal();
  const band = useReveal();
  const included = useReveal();
  const noRisk = useReveal();
  const proof = useReveal();
  const faq = useReveal();
  const cta = useReveal();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    if (loadingPlan) return;
    setError(null);
    setLoadingPlan(priceId);
    try {
      // startCheckout adjunta la atribución (utm/fbclid) y redirige a Stripe
      await startCheckout(priceId);
    } catch {
      setError(
        "We couldn't start checkout. Check your connection and try again in a few seconds."
      );
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <style dangerouslySetInnerHTML={{ __html: PLANS_CSS }} />
      <Nav />

      {/* ============ AIDA · A: HERO (promesa + 7 días gratis) ============ */}
      <header className="hero hero-inner">
        <div className="hero-media">
          <img
            src={asset("images/brand/studio-class-54d-mural-stairs.jpg")}
            alt="A full 54D class training on mats under the 54D mural"
          />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">54D ON · 7-day free trial</span>
          <h1 className="hero-title">
            Start today.
            <br />
            <span className="accent">The first 7 days are on us.</span>
          </h1>
          <p className="hero-sub">
            Full access to the method. Cancel before day 8 and pay nothing.
          </p>
          <div className="hero-ctas">
            <a href="#plans" className="btn btn-primary">
              Start free. 7 days.
            </a>
          </div>
        </div>
      </header>

      {/* ============ AIDA · I: PLANES CON FOTO (decisión arriba, el precio no se esconde) ============ */}
      {/* FIXES_V5 §3.2: único campo de gradiente de la página (bloom en #plans) */}
      <section
        className="section bloom"
        id="plans"
        style={{ scrollMarginTop: "5rem" }}
      >
        <div className="section-inner" ref={plans.ref}>
          <div className={plans.className}>
            <span className="day-marker">Plans</span>
            <h2 className="section-title">
              One method. Three ways to start.
            </h2>
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "40rem",
                fontSize: "1.05rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              One subscription, every program. The method, the coach, and the
              community are the same in all three: you only choose how you pay.{" "}
              <Link to="/on" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
                See every program →
              </Link>
            </p>

            {/* §1.1 Split 5/7: la foto es contexto emocional; el precio sigue
                siendo el elemento de mayor contraste de la sección */}
            <div className="plans-split">
              <figure className="plans-photo">
                <div className="photo-card">
                  <img
                    src={asset("images/hd/cg-mural-seated.jpg")}
                    alt="A 54D generation seated on the training floor under the yellow 54D mural in Coral Gables"
                    loading="lazy"
                  />
                </div>
                <figcaption className="photo-caption">
                  Gen 41 · Coral Gables
                </figcaption>
              </figure>

              <div className="plans-stack">
                {PLANS.map((p) => (
                  <article
                    key={p.priceId}
                    className={`pricing-card${p.featured ? " featured" : ""}`}
                  >
                    {p.badge && (
                      <span
                        className="day-marker"
                        style={{
                          position: "absolute",
                          top: "-0.95rem",
                          right: "1.4rem",
                          marginBottom: 0,
                          background: "var(--c-ink)",
                          fontSize: "0.68rem",
                          letterSpacing: "var(--track-label, 0.14em)",
                          whiteSpace: "nowrap",
                          padding: "0.4rem 0.8rem",
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                    {/* §3.6 Un decisor por card: plan, precio, 3 diferenciales, CTA, riskline */}
                    <header>
                      <span className="pricing-plan">{p.plan}</span>
                      {/* §3.1 ancla tachada + §3.2 per-month framing: el número
                          grande es SIEMPRE el mensual */}
                      <div className="pricing-price">
                        <s
                          style={{
                            fontSize: "0.45em",
                            color: "var(--c-faint)",
                            fontWeight: 500,
                            marginRight: "0.4em",
                          }}
                        >
                          {p.regular}
                        </s>
                        {p.price}
                      </div>
                      <span className="pricing-period">{p.period}</span>
                    </header>
                    <ul className="check-list">
                      {p.features.map((f) => (
                        <li key={f.lead}>
                          <strong>{f.lead}</strong>
                          {f.rest}
                        </li>
                      ))}
                    </ul>
                    <footer>
                      {/* §3.5 CTA verbo de inicio, nunca de pago */}
                      <button
                        type="button"
                        className={`btn ${p.featured ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => handleCheckout(p.priceId)}
                        disabled={loadingPlan !== null}
                        aria-busy={loadingPlan === p.priceId}
                        style={loadingPlan && loadingPlan !== p.priceId ? { opacity: 0.5 } : undefined}
                      >
                        {loadingPlan === p.priceId ? "Connecting…" : "Start free trial"}
                      </button>
                      {/* §3.4 riesgo pegado al botón */}
                      <span className="btn-riskline">{RISKLINE}</span>
                    </footer>
                  </article>
                ))}
              </div>
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  marginTop: "1.4rem",
                  fontSize: "0.95rem",
                  color: "var(--c-red)",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
            <p
              style={{
                marginTop: "1.6rem",
                fontSize: "0.85rem",
                color: "var(--c-faint)",
                textAlign: "center",
              }}
            >
              {PLANS_FOOTNOTE}
            </p>

            {/* Trust bar: cierra Plans, queda como está (§1.3.1) */}
            <div className="stat-row">
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">Days free</div>
              </div>
              <div className="stat">
                <div className="stat-value">30</div>
                <div className="stat-label">Day guarantee</div>
              </div>
              <div className="stat">
                <div className="stat-value">54</div>
                <div className="stat-label">Days of method</div>
              </div>
              <div className="stat">
                <div className="stat-value">1 click</div>
                <div className="stat-label">To cancel</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AIDA · I: PHOTO-BAND SEPARADOR (emoción, descanso visual §1.3.2) ============ */}
      <section className="photo-band band-tight">
        <img
          src={asset("images/hd/cg-highfive-euphoria.jpg")}
          alt="Two 54D members leaping into a high five, celebrating the end of a session"
          loading="lazy"
        />
        <div className="photo-band-content" ref={band.ref}>
          <div className={band.className}>
            <span className="photo-caption">The finish line</span>
            <h2 className="section-title" style={{ marginTop: "1.4rem", maxWidth: "24ch" }}>
              54 days from now, you won't recognize yourself.
            </h2>
          </div>
        </div>
      </section>

      {/* ============ AIDA · D: QUÉ INCLUYE TODO PLAN (§1.3.3: punteos + foto coach) ============ */}
      <section className="section">
        <div className="section-inner" ref={included.ref}>
          <div className={included.className}>
            <span className="day-marker">Everything included</span>
            <div className="method-intro">
              <h2 className="section-title">
                Every plan includes <span style={{ color: "var(--c-yellow)" }}>everything.</span>
              </h2>
              <p>
                The plan only changes what you pay and how often. The method is
                the same: complete, demanding, with a real coach behind it. No
                stripped-down tiers, no locked features.
              </p>
            </div>
            {/* Split 2 columnas: la lista de valor completa (§4) vive UNA vez */}
            <div className="photo-grid" style={{ alignItems: "start", gap: "var(--space-block)" }}>
              <ul className="check-list">
                {MEMBERSHIP_VALUE.map((item) => (
                  <li key={item.lead}>
                    <strong>{item.lead}</strong>
                    {item.rest}
                  </li>
                ))}
              </ul>
              <figure style={{ margin: 0 }}>
                <div className="photo-card">
                  <img
                    src={asset("images/studios/coral-gables/coach-with-headset-01.jpg")}
                    alt="A 54D coach wearing a headset guiding the class from the training floor"
                    loading="lazy"
                  />
                </div>
                <figcaption className="photo-caption">
                  Your coach · Every one of the 54 days
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AIDA · D: SIN RIESGO (§1.3.4: única sección con fondo ink) ============ */}
      <section
        className="section"
        style={{
          background: "var(--c-ink)",
          borderTop: "1px solid var(--hairline)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div className="section-inner" ref={noRisk.ref}>
          <div className={noRisk.className}>
            <span className="day-marker">Zero risk</span>
            <h2 className="section-title">
              If it's not for you, <span style={{ color: "var(--c-yellow)" }}>you don't pay.</span>
            </h2>
            <div className="pricing-grid">
              {NO_RISK.map((item) => (
                <div className="method-card" key={item.name}>
                  {/* La pregunta en amarillo (§1.3.4) */}
                  <div
                    className="method-num"
                    style={{
                      fontSize: "1rem",
                      letterSpacing: "var(--track-btn, 0.07em)",
                      color: "var(--c-yellow)",
                      opacity: 1,
                    }}
                  >
                    {item.q}
                  </div>
                  <div className="method-name">{item.name}</div>
                  <p className="method-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ AIDA · D: PRUEBA SOCIAL (placeholder) ============ */}
      {/* SOCIAL_PROOF_PLACEHOLDER: reemplazar con testimonios reales,
          fotos y generaciones confirmadas por el cliente */}
      <section className="section">
        <div className="section-inner" ref={proof.ref}>
          <div className={proof.className}>
            <span className="day-marker">Results</span>
            <h2 className="section-title">
              Thousands have done it. <span style={{ color: "var(--c-yellow)" }}>You're next.</span>
            </h2>
            <div className="pricing-grid">
              {TESTIMONIALS.map((t) => (
                <div className="method-card" key={t.name}>
                  <p className="method-desc" style={{ marginTop: 0, fontSize: "1.02rem" }}>
                    "{t.quote}"
                  </p>
                  <div className="method-name" style={{ fontSize: "1rem" }}>{t.name}</div>
                  <p
                    style={{
                      marginTop: "0.3rem",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "var(--track-label, 0.14em)",
                      color: "var(--c-faint)",
                    }}
                  >
                    {t.tag}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ AIDA · A: FAQ (objeciones tardías) ============ */}
      <section className="section">
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">Questions</span>
            <h2 className="section-title">
              What you'd ask <span style={{ color: "var(--c-yellow)" }}>before starting.</span>
            </h2>
            {/* 2 columnas: mata el 50% de viewport en negro vacío (pricing-desktop-2.png) */}
            <div
              className="faq-list"
              style={{
                maxWidth: "none",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))",
                alignItems: "start",
              }}
            >
              {FAQS.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>
                    {f.a}
                    {f.link && (
                      <>
                        {" "}
                        <Link
                          to={f.link.href}
                          style={{ color: "var(--c-yellow)", textDecoration: "none" }}
                        >
                          {f.link.label}
                        </Link>
                      </>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ AIDA · A: CTA FINAL ============ */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              Your Day 1 <span className="accent">starts free.</span>
            </h2>
            <div className="hero-ctas">
              <a href="#plans" className="btn btn-primary">
                Start free. 7 days.
              </a>
              <Link to="/studios" className="btn btn-ghost">
                Rather train in person? See the studios
              </Link>
            </div>
            <p style={{ marginTop: "1.4rem", fontSize: "0.82rem", color: "var(--c-faint)" }}>
              {MICROCOPY}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky CTA mobile compartida (umbral 25%, compensa el footer):
          extraída a components/sticky-cta.tsx — FIXES_V5 §4 / MOBILE_COMMERCE F5 */}
      <StickyCta href="#plans" label="Start free. 7 days." />

      <Footer />
    </div>
  );
}
