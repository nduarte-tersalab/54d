import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/pricing";
import { Nav, Footer, useReveal } from "../components/site";
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
   Planes 54D ON.
   priceId: PLACEHOLDER. Reemplazar por los price ids reales
   de Stripe cuando el cliente los confirme.
   ============================================================ */
type Plan = {
  priceId: string;
  plan: string;
  price: string;
  period: string;
  note: string;
  features: string[];
  featured: boolean;
  badge?: string;
  regular?: string;
};

/* Precios reales de store.54d.com/packs, verificados 25/07/2026.
   regular = precio de lista que la tienda tacha (ancla de descuento).
   PRICE_IDs de Stripe pendientes de las keys del cliente. */
const PLANS: Plan[] = [
  {
    priceId: "PRICE_ID_MENSUAL",
    plan: "Monthly",
    price: "$54",
    regular: "$99",
    period: "/ month",
    note: "Start at your own pace. No strings.",
    features: [
      "Full access to the method",
      "No minimum commitment",
      "Cancel anytime",
    ],
    featured: false,
  },
  {
    priceId: "PRICE_ID_TRIMESTRAL",
    plan: "Quarterly",
    price: "$156",
    regular: "$267",
    period: "/ quarter",
    note: "Three months: the full 54 days plus time to lock in the habit.",
    badge: "Most chosen",
    features: [
      "Everything in the monthly plan",
      "Works out to $52/mo",
      "Covers your full transformation",
    ],
    featured: true,
  },
  {
    priceId: "PRICE_ID_ANUAL",
    plan: "Annual",
    price: "$588",
    regular: "$954",
    period: "/ year",
    note: "For those going for more than one transformation.",
    features: [
      "Everything in the monthly plan",
      "Works out to $49/mo, the best price",
      "A full year of the method and your coach",
    ],
    featured: false,
  },
];

/* Qué incluye TODO plan: lista única, sin letra chica */
const INCLUDED = [
  {
    num: "01",
    name: "Daily training",
    desc: "Progressive video sessions, designed by coaches, not by an algorithm. With whatever you have at home.",
  },
  {
    num: "02",
    name: "Nutrition protocol",
    desc: "Built for your body and your goal from day 1. No generic diets: what you eat is part of the program.",
  },
  {
    num: "03",
    name: "Live coach",
    desc: "Real follow-up over chat. Writes to you, corrects you, demands more. Every day, all 54 of them.",
  },
  {
    num: "04",
    name: "Community",
    desc: "You train alone. You're not alone. Access from any device, in any country.",
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

export default function Pricing() {
  const plans = useReveal();
  const included = useReveal();
  const noRisk = useReveal();
  const proof = useReveal();
  const faq = useReveal();
  const cta = useReveal();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Sticky bar mobile al 50% de scroll (DESIGN_FIXES_V4 §5) */
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setShowStickyBar(mq.matches && max > 0 && window.scrollY / max >= 0.5);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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
      <Nav />

      {/* ============ HERO INTERIOR (landing de ads: corto y al grano) ============ */}
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

      {/* ============ PLANES ============ */}
      <section className="section" id="plans" style={{ scrollMarginTop: "5rem" }}>
        <div className="section-inner" ref={plans.ref}>
          <div className={plans.className}>
            <span className="day-marker">Plans</span>
            <h2 className="section-title">
              One method. <span style={{ color: "var(--c-yellow)" }}>Three ways to start.</span>
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
              One subscription. Every program: 650+ recorded sessions, 12+
              nutrition protocols, 120+ recipes, new releases at no extra cost.{" "}
              <Link to="/on" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
                See every program →
              </Link>
            </p>
            <div className="pricing-grid">
              {PLANS.map((p) => (
                <div
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
                  <span className="pricing-plan">{p.plan}</span>
                  {/* PRECIO_PENDIENTE: confirmar precios con cliente */}
                  <div className="pricing-price">
                    {p.regular && (
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
                    )}
                    {p.price}
                  </div>
                  <span className="pricing-period">{p.period}</span>
                  <p style={{ marginTop: "0.9rem", fontSize: "0.95rem", lineHeight: 1.5, color: "var(--c-mist)" }}>
                    {p.note}
                  </p>
                  <ul className="pricing-features">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
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
                </div>
              ))}
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
              {MICROCOPY} · secure payment by Stripe
            </p>

            {/* Trust bar */}
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

      {/* ============ QUÉ INCLUYE TODO PLAN ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
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
            <div className="method-grid">
              {INCLUDED.map((item) => (
                <div className="method-card" key={item.num}>
                  <div className="method-num">{item.num}</div>
                  <div className="method-name">{item.name}</div>
                  <p className="method-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SIN RIESGO (anti-objeción + garantía) ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner" ref={noRisk.ref}>
          <div className={noRisk.className}>
            <span className="day-marker">Zero risk</span>
            <h2 className="section-title">
              If it's not for you, <span style={{ color: "var(--c-yellow)" }}>you don't pay.</span>
            </h2>
            <div className="pricing-grid">
              {NO_RISK.map((item) => (
                <div className="method-card" key={item.name}>
                  <div
                    className="method-num"
                    style={{ fontSize: "1rem", letterSpacing: "var(--track-btn, 0.07em)" }}
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

      {/* ============ PRUEBA SOCIAL (placeholder) ============ */}
      {/* SOCIAL_PROOF_PLACEHOLDER: reemplazar con testimonios reales,
          fotos y generaciones confirmadas por el cliente */}
      <section className="section" style={{ paddingTop: 0 }}>
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

      {/* ============ FAQ ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
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

      {/* ============ CTA FINAL ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
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

      {/* ============ STICKY BAR MOBILE (visible al 50% de scroll) ============ */}
      {showStickyBar && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            padding: "0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom))",
            background: "rgba(7, 7, 7, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <a
            href="#plans"
            className="btn btn-primary"
            style={{ display: "block", width: "100%", textAlign: "center" }}
          >
            Start free. 7 days.
          </a>
        </div>
      )}

      <Footer />
    </div>
  );
}
