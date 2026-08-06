import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/pricing";
import { Nav, Footer, useReveal } from "../components/site";
import { StickyCta } from "../components/sticky-cta";
import { startCheckout } from "../lib/attribution";
import { asset } from "../lib/asset";
import { useLang, type Lang } from "../lib/i18n";

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
/* Trio de planes lado a lado (cliente 07/08, referencia landing evergreen):
   comparacion escaneable en UNA vista; cada tier con foto de identidad y
   chip de beneficio. Lenguaje quiet: glass, un solo primario (featured). */
.plans-trio { display: grid; grid-template-columns: 1fr; gap: 1.4rem; margin-top: var(--space-block); }
@media (min-width: 1000px) { .plans-trio { grid-template-columns: repeat(3, 1fr); } }
.plans-trio .pricing-card { display: flex; flex-direction: column; padding: 0; overflow: hidden; }
.plan-photo { position: relative; height: 152px; }
.plan-photo img { width: 100%; height: 100%; object-fit: cover; display: block;
  filter: saturate(0.82) contrast(1.03); }
.plan-photo::after { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(7,7,7,0.05) 45%, rgba(7,7,7,0.72) 100%); }
.plan-chip { position: absolute; left: 1.5rem; bottom: 0.9rem; z-index: 1;
  font-family: var(--font-label); font-weight: 500; font-size: 0.66rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--c-mist); }
.pricing-card.featured .plan-chip { color: var(--c-yellow); }
.plan-body { padding: 1.5rem 1.6rem 1.7rem; display: flex; flex-direction: column; flex: 1; }
.plan-body > header { display: flex; flex-direction: column; gap: 0.4rem; }
.plan-body .check-list { margin: 1.2rem 0 1.6rem; }
.plan-body > footer { margin-top: auto; display: flex; flex-direction: column; }

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

@media (max-width: 999px) {
  /* Mobile commerce: la featured abre el stack */
  .plans-trio .pricing-card.featured { order: -1; background: var(--glass-hover); }
}
`;

/* ============================================================
   Planes 54D ON.
   priceId: PLACEHOLDER. Reemplazar por los price ids reales
   de Stripe cuando el cliente los confirme.
   ============================================================ */
type Plan = {
  priceId: string;
  plan: Record<Lang, string>;
  price: string;
  regular: string;
  period: Record<Lang, string>;
  /* §1.2: solo los 3 diferenciales del plan, verbo primero en <strong> */
  features: { lead: Record<Lang, string>; rest: Record<Lang, string> }[];
  featured: boolean;
  badge?: Record<Lang, string>;
  /* Trio audiovisual (cliente 07/08): foto de identidad + chip de
     beneficio por tier, mismas fotos que los tiers de /on */
  photo: string;
  photoAlt: string;
  photoPos: string;
  chip: Record<Lang, string>;
};

/* Precios reales de store.54d.com/packs, verificados 25/07/2026.
   regular = precio de lista que la tienda tacha (ancla de descuento).
   PRICE_IDs de Stripe pendientes de las keys del cliente. */
const PLANS: Plan[] = [
  {
    priceId: "PENDING_membership_monthly",
    plan: { en: "Monthly", es: "Mensual" },
    price: "$54",
    regular: "$99",
    period: { en: "/ month · billed monthly", es: "/ mes · facturación mensual" },
    photo: "images/hd2/spare-man-running.jpg",
    photoAlt: "Athlete running with visible effort on the 54D floor",
    photoPos: "center 33%",
    chip: { en: "Most flexible", es: "El más flexible" },
    features: [
      {
        lead: { en: "Start", es: "Empieza" },
        rest: {
          en: " with everything unlocked from day 1",
          es: " con todo desbloqueado desde el día 1",
        },
      },
      {
        lead: { en: "Commit", es: "Paga" },
        rest: {
          en: " to nothing: billed month to month",
          es: " mes a mes, sin compromiso de permanencia",
        },
      },
      {
        lead: { en: "Cancel", es: "Cancela" },
        rest: {
          en: " anytime from your account, one click",
          es: " cuando quieras desde tu cuenta, en un clic",
        },
      },
    ],
    featured: false,
  },
  {
    priceId: "PENDING_membership_quarterly",
    plan: { en: "Quarterly", es: "Trimestral" },
    price: "$52",
    regular: "$89",
    period: { en: "/ month · $156 every 3 months", es: "/ mes · $156 cada 3 meses" },
    badge: { en: "Most chosen", es: "El más elegido" },
    photo: "images/hd/cg-effort-yellow-d.jpg",
    photoAlt: "Athlete grimacing with effort in front of the yellow 54D letter",
    photoPos: "center 36%",
    chip: { en: "Most chosen", es: "El más elegido" },
    features: [
      {
        lead: { en: "Get", es: "Recibe" },
        rest: {
          en: " everything in the monthly plan",
          es: " todo lo del plan mensual",
        },
      },
      {
        lead: { en: "Cover", es: "Cubre" },
        rest: {
          en: " the full 54 days, plus time to lock the habit",
          es: " los 54 días completos, más tiempo para fijar el hábito",
        },
      },
      {
        lead: { en: "Save", es: "Ahorra" },
        rest: {
          en: " $2 every month vs the monthly plan",
          es: " $2 al mes frente al plan mensual",
        },
      },
    ],
    featured: true,
  },
  {
    priceId: "PENDING_membership_yearly",
    plan: { en: "Annual", es: "Anual" },
    price: "$49",
    regular: "$79",
    period: { en: "/ month · $588 a year", es: "/ mes · $588 al año" },
    photo: "images/hd2/blog-spin-smile.jpg",
    photoAlt: "Member smiling mid ride on the 54D bike floor",
    photoPos: "center 32%",
    chip: { en: "Best value", es: "Mejor precio" },
    features: [
      {
        lead: { en: "Get", es: "Recibe" },
        rest: {
          en: " everything in the monthly plan",
          es: " todo lo del plan mensual",
        },
      },
      {
        lead: { en: "Lock", es: "Asegura" },
        rest: {
          en: " the lowest monthly price all year",
          es: " el precio mensual más bajo todo el año",
        },
      },
      {
        lead: { en: "Train", es: "Entrena" },
        rest: {
          en: " every new release at no extra cost",
          es: " cada nuevo lanzamiento sin costo extra",
        },
      },
    ],
    featured: false,
  },
];

/* §4 Punteos EXACTOS de la membresía: la lista de valor completa
   vive UNA sola vez, en Everything included. Verbo primero. */
const MEMBERSHIP_VALUE: Record<Lang, { lead: string; rest: string }[]> = {
  en: [
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
  ],
  es: [
    {
      lead: "Entrena todos los programas",
      rest: ": los 13, incluido 54D ON, con 650+ sesiones grabadas",
    },
    {
      lead: "Ten un coach real",
      rest: " en tu esquina: chat ilimitado, correcciones y seguimiento",
    },
    {
      lead: "Come con un plan",
      rest: ": 12+ protocolos de nutrición y 120+ recetas creadas por el equipo",
    },
    {
      lead: "Empieza gratis",
      rest: ": 7 días completos con todo desbloqueado antes de pagar un centavo",
    },
    {
      lead: "Cancela en un clic",
      rest: ": desde tu cuenta, sin llamadas ni trucos de retención",
    },
    {
      lead: "Mantén tus resultados cubiertos",
      rest: ": garantía de devolución de 30 días si haces el trabajo",
    },
  ],
};

/* Bloque anti-objeción: matar riesgo percibido en tráfico frío */
const NO_RISK: Record<Lang, { q: string; name: string; desc: string }[]> = {
  en: [
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
  ],
  es: [
    {
      q: "¿Y si no me gusta?",
      name: "Prueba gratis de 7 días",
      desc: "Acceso completo al método desde el primer minuto. Si no es para ti, cancela en un clic antes del día 8. El cargo es cero.",
    },
    {
      q: "¿Y si empiezo y no funciona?",
      name: "Garantía de 30 días",
      desc: "Sigue el programa y, si no ves resultados, te devolvemos tu dinero. Sin interrogatorios, sin letra pequeña.",
    },
    {
      q: "¿Me van a cobrar sin avisar?",
      name: "Sin cargos sorpresa",
      desc: "Te enviamos un correo antes de tu primer cargo. Cancela desde tu cuenta: sin llamadas, sin trucos de retención.",
    },
  ],
};

/* SOCIAL_PROOF_PLACEHOLDER: la sección Results queda APAGADA (array
   vacío) hasta tener testimonios REALES confirmados por el cliente
   (nombre, edad, ciudad, generación y foto). Regla dura: NO INVENTAR
   DATOS. Al cargar testimonios verificados acá, la sección se
   enciende sola. */
type Testimonial = { quote: string; name: string; tag: string };
const TESTIMONIALS: Testimonial[] = [];

/* FAQ de objeciones: también alimenta el schema FAQPage (SIEMPRE en EN,
   idioma indexado) */
type Faq = { q: string; a: string; link?: { href: string; label: string } };
const FAQS: Record<Lang, Faq[]> = {
  en: [
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
  ],
  es: [
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Sí. Cancela desde tu cuenta en un clic: sin llamadas, sin trucos. Cancela antes del día 8 y no pagas nada. Además te enviamos un correo antes de tu primer cargo.",
    },
    {
      q: "¿Necesito equipo o experiencia?",
      a: "No. Empiezas en tu nivel, con lo que tienes en casa. Las sesiones son progresivas: el programa se adapta a tu punto de partida, no al revés.",
    },
    {
      q: "¿Necesito la app?",
      a: "Sí. 54D ON se entrega a través de la app 54D On para iOS y Android: ahí viven tu entrenamiento diario, tu protocolo de nutrición y el chat con tu coach. La app es gratis de descargar y tiene 4.9 en el App Store. Tu suscripción desbloquea todo.",
      link: { href: "/on", label: "Mira cómo funciona 54D ON →" },
    },
    {
      q: "¿Cómo es el coach? ¿Es una persona real?",
      a: "Una persona real, no un bot. Tu coach te escribe por chat, revisa tu progreso, te corrige y te exige más. Todos los días. La app es solo el vehículo: el método es el coach.",
    },
    {
      q: "¿Cómo funciona el cobro?",
      a: "Activas tu prueba gratis de 7 días sin costo. Antes de que termine, te enviamos un correo. Solo entonces se procesa el primer cargo del plan que elegiste, de forma segura con Stripe. Después se renueva según tu plan, y puedes cancelar cuando quieras.",
    },
    {
      q: "¿Puedo cambiar de plan después?",
      a: "Sí. Puedes pasar de mensual a trimestral o anual desde tu cuenta cuando quieras; el cambio aplica en tu siguiente ciclo de facturación.",
    },
    {
      q: "¿En qué países está disponible?",
      a: "En todos. 54D ON funciona desde cualquier país, en cualquier dispositivo; los precios están en dólares (USD) y el pago se procesa con Stripe.",
    },
    {
      q: "¿Cómo funciona el Método 54D?",
      a: "54 días de entrenamiento estructurado, un protocolo de nutrición personalizado y coaching diario. Un programa con inicio, final y alguien que te exige más.",
      link: { href: "/method", label: "Conoce el método completo →" },
    },
  ],
};

/* Schema SIEMPRE desde el EN (idioma principal indexado) */
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.en.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const MICROCOPY: Record<Lang, string> = {
  en: "7 days free · cancel anytime · 30-day guarantee",
  es: "7 días gratis · cancela cuando quieras · garantía de 30 días",
};
/* §3.4: la riskline por card ya dice "7 days free · cancel anytime";
   la línea central de la sección no lo triplica */
const RISKLINE: Record<Lang, string> = {
  en: "7 days free · cancel anytime",
  es: "7 días gratis · cancela cuando quieras",
};
const PLANS_FOOTNOTE: Record<Lang, string> = {
  en: "30-day guarantee · secure payment by Stripe",
  es: "Garantía de 30 días · pago seguro con Stripe",
};

export default function Pricing() {
  const { lang } = useLang();
  const es = lang === "es";
  const plans = useReveal();
  const band = useReveal();
  const included = useReveal();
  const noRisk = useReveal();
  const proof = useReveal();
  const faq = useReveal();
  const cta = useReveal();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* El error se ancla a la card tapeada (no dos pantallas más abajo) */
  const [errorPlan, setErrorPlan] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    if (loadingPlan) return;
    setError(null);
    setErrorPlan(null);
    setLoadingPlan(priceId);
    try {
      // startCheckout adjunta la atribución (utm/fbclid) y redirige a Stripe
      await startCheckout(priceId);
    } catch {
      setError(
        es
          ? "No pudimos iniciar el pago. Revisa tu conexión e intenta de nuevo en unos segundos."
          : "We couldn't start checkout. Check your connection and try again in a few seconds."
      );
      setErrorPlan(priceId);
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
          <img
            src={asset("images/brand/logo-54d-on.svg")}
            alt="54D ON"
            style={{ height: "54px", width: "auto", marginBottom: "var(--space-4)" }}
          />
          <span className="day-marker">
            {es ? "Prueba gratis de 7 días" : "7-day free trial"}
          </span>
          <h1 className="hero-title">
            {es ? "Empieza hoy." : "Start today."}
            <br />
            <span className="accent">
              {es
                ? "Los primeros 7 días van por nuestra cuenta."
                : "The first 7 days are on us."}
            </span>
          </h1>
          <p className="hero-sub">
            {es
              ? "Acceso completo al método. Cancela antes del día 8 y no pagas nada."
              : "Full access to the method. Cancel before day 8 and pay nothing."}
          </p>
          <div className="hero-ctas">
            <a href="#plans" className="btn btn-primary">
              {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
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
            <span className="day-marker">{es ? "Planes" : "Plans"}</span>
            <h2 className="section-title">
              {es
                ? "Un método. Tres maneras de empezar."
                : "One method. Three ways to start."}
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
              {es
                ? "Una sola suscripción, todos los programas. El método, el coach y la comunidad son iguales en los tres: solo eliges cómo pagar."
                : "One subscription, every program. The method, the coach, and the community are the same in all three: you only choose how you pay."}{" "}
              <Link to="/on" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
                {es ? "Mira todos los programas →" : "See every program →"}
              </Link>
            </p>

            {/* Trio audiovisual (cliente 07/08): tres tiers lado a lado,
                cada uno con foto de identidad, chip de beneficio y precio
                protagonista. Un solo primario (featured). */}
            <div className="plans-trio">
              {PLANS.map((p) => (
                <article
                  key={p.priceId}
                  className={`pricing-card${p.featured ? " featured" : ""}`}
                >
                  <div className="plan-photo">
                    <img
                      src={asset(p.photo)}
                      alt={p.photoAlt}
                      loading="lazy"
                      style={{ objectPosition: p.photoPos }}
                    />
                    <span className="plan-chip">{p.chip[lang]}</span>
                  </div>
                  <div className="plan-body">
                    <header>
                      <span className="pricing-plan">{p.plan[lang]}</span>
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
                      <span className="pricing-period">{p.period[lang]}</span>
                    </header>
                    <ul className="check-list">
                      {p.features.map((f) => (
                        <li key={f.lead.en}>
                          <strong>{f.lead[lang]}</strong>
                          {f.rest[lang]}
                        </li>
                      ))}
                    </ul>
                    <footer>
                      <button
                        type="button"
                        className={`btn ${p.featured ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => handleCheckout(p.priceId)}
                        disabled={loadingPlan !== null}
                        aria-busy={loadingPlan === p.priceId}
                        style={loadingPlan && loadingPlan !== p.priceId ? { opacity: 0.5 } : undefined}
                      >
                        {loadingPlan === p.priceId
                          ? es
                            ? "Conectando…"
                            : "Connecting…"
                          : es
                            ? "Empieza tu prueba gratis"
                            : "Start free trial"}
                      </button>
                      <span className="btn-riskline">{RISKLINE[lang]}</span>
                      {error && errorPlan === p.priceId && (
                        <p
                          role="alert"
                          style={{
                            marginTop: "0.8rem",
                            fontSize: "0.88rem",
                            color: "var(--c-red)",
                            textAlign: "center",
                          }}
                        >
                          {error}
                        </p>
                      )}
                    </footer>
                  </div>
                </article>
              ))}
            </div>

            <p
              style={{
                marginTop: "1.6rem",
                fontSize: "0.85rem",
                color: "var(--c-faint)",
                textAlign: "center",
              }}
            >
              {PLANS_FOOTNOTE[lang]}
            </p>

            {/* Trust bar: cierra Plans, queda como está (§1.3.1) */}
            <div className="stat-row">
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">{es ? "Días gratis" : "Days free"}</div>
              </div>
              <div className="stat">
                <div className="stat-value">30</div>
                <div className="stat-label">
                  {es ? "Días de garantía" : "Day guarantee"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">54</div>
                <div className="stat-label">
                  {es ? "Días de método" : "Days of method"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">{es ? "1 clic" : "1 click"}</div>
                <div className="stat-label">
                  {es ? "Para cancelar" : "To cancel"}
                </div>
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
            <span className="photo-caption">
              {es ? "La meta" : "The finish line"}
            </span>
            <h2 className="section-title" style={{ marginTop: "1.4rem", maxWidth: "24ch" }}>
              {es
                ? "En 54 días no te vas a reconocer."
                : "54 days from now, you won't recognize yourself."}
            </h2>
          </div>
        </div>
      </section>

      {/* ============ AIDA · D: QUÉ INCLUYE TODO PLAN (§1.3.3: punteos + foto coach) ============ */}
      <section className="section">
        <div className="section-inner" ref={included.ref}>
          <div className={included.className}>
            <span className="day-marker">
              {es ? "Todo incluido" : "Everything included"}
            </span>
            <div className="method-intro">
              {/* Titular 100% blanco (QUIET v6): acento con color inherit */}
              <h2 className="section-title">
                {es ? (
                  <>
                    Cada plan incluye <span className="accent">todo.</span>
                  </>
                ) : (
                  <>
                    Every plan includes <span className="accent">everything.</span>
                  </>
                )}
              </h2>
              <p>
                {es
                  ? "El plan solo cambia cuánto pagas y con qué frecuencia. El método es el mismo: completo, exigente y con un coach real detrás. Sin versiones recortadas, sin funciones bloqueadas."
                  : "The plan only changes what you pay and how often. The method is the same: complete, demanding, with a real coach behind it. No stripped-down tiers, no locked features."}
              </p>
            </div>
            {/* Split 2 columnas: la lista de valor completa (§4) vive UNA vez.
                Foto a 3/2: la columna derecha acompaña la altura de la lista
                sin dejar canvas muerto */}
            <div className="photo-grid" style={{ alignItems: "start", gap: "var(--space-block)" }}>
              <ul className="check-list">
                {MEMBERSHIP_VALUE[lang].map((item) => (
                  <li key={item.lead}>
                    <strong>{item.lead}</strong>
                    {item.rest}
                  </li>
                ))}
              </ul>
              <figure style={{ margin: 0 }}>
                <div className="photo-card" style={{ aspectRatio: "3 / 2" }}>
                  {/* Vertical recortada a 3/2: el encuadre sube al rostro del
                      coach (el centro de la foto es torso negro sobre negro) */}
                  <img
                    src={asset("images/studios/coral-gables/coach-with-headset-01.jpg")}
                    alt="A 54D coach wearing a headset guiding the class from the training floor"
                    loading="lazy"
                    style={{ objectPosition: "center 26%" }}
                  />
                </div>
                <figcaption className="photo-caption">
                  {es
                    ? "Tu coach · Cada uno de los 54 días"
                    : "Your coach · Every one of the 54 days"}
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
            <span className="day-marker">{es ? "Cero riesgo" : "Zero risk"}</span>
            {/* Titular 100% blanco (QUIET v6) */}
            <h2 className="section-title">
              {es ? (
                <>
                  Si no es para ti, <span className="accent">no pagas.</span>
                </>
              ) : (
                <>
                  If it's not for you, <span className="accent">you don't pay.</span>
                </>
              )}
            </h2>
            <div className="pricing-grid">
              {NO_RISK[lang].map((item) => (
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

      {/* ============ AIDA · D: PRUEBA SOCIAL (APAGADA hasta tener datos
          reales) ============ */}
      {/* Gateada al array: con TESTIMONIALS vacío no se renderiza nada.
          NO INVENTAR DATOS: solo testimonios confirmados por el cliente
          (nombre, edad, ciudad, generación y foto). */}
      {TESTIMONIALS.length > 0 && (
        <section className="section">
          <div className="section-inner" ref={proof.ref}>
            <div className={proof.className}>
              <span className="day-marker">{es ? "Resultados" : "Results"}</span>
              <h2 className="section-title">
                {es ? (
                  <>
                    Sigues <span className="accent">tú.</span>
                  </>
                ) : (
                  <>
                    You're <span className="accent">next.</span>
                  </>
                )}
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
      )}

      {/* ============ AIDA · A: FAQ (objeciones tardías) ============ */}
      <section className="section">
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">{es ? "Preguntas" : "Questions"}</span>
            {/* Titular 100% blanco (QUIET v6) */}
            <h2 className="section-title">
              {es ? (
                <>
                  Lo que preguntarías{" "}
                  <span className="accent">antes de empezar.</span>
                </>
              ) : (
                <>
                  What you'd ask <span className="accent">before starting.</span>
                </>
              )}
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
              {FAQS[lang].map((f) => (
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
              {es ? (
                <>
                  Tu Día 1 <span className="accent">empieza gratis.</span>
                </>
              ) : (
                <>
                  Your Day 1 <span className="accent">starts free.</span>
                </>
              )}
            </h2>
            <div className="hero-ctas">
              <a href="#plans" className="btn btn-primary">
                {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
              </a>
              <Link to="/studios" className="btn btn-ghost">
                {es
                  ? "¿Prefieres entrenar en persona? Conoce los studios"
                  : "Rather train in person? See the studios"}
              </Link>
            </div>
            <p style={{ marginTop: "1.4rem", fontSize: "0.82rem", color: "var(--c-faint)" }}>
              {MICROCOPY[lang]}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky CTA mobile compartida (umbral 25%, compensa el footer):
          extraída a components/sticky-cta.tsx — FIXES_V5 §4 / MOBILE_COMMERCE F5 */}
      <StickyCta
        href="#plans"
        label={es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
      />

      <Footer />
    </div>
  );
}
