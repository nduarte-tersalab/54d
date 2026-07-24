import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/on";
import { Nav, Footer, useReveal } from "../components/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D ON: The 54-Day Method, Online with a Coach" },
    {
      name: "description",
      content:
        "The full 54D program from home: daily training sessions, a personalized nutrition protocol, and a real coach who follows you. Try it free for 7 days.",
    },
  ];
}

/* ============ Contenido ============ */

const INCLUDES = [
  {
    num: "01",
    name: "Daily video training",
    desc: "54 progressive sessions designed by coaches. With whatever you have at home.",
  },
  {
    num: "02",
    name: "Nutrition protocol",
    desc: "Built for your body and your goal from day 1. No generic diets: what you eat is part of the program.",
  },
  {
    num: "03",
    name: "Live coach",
    desc: "Real follow-up over chat. Corrects you, pushes you, answers you. Every day.",
  },
  {
    num: "04",
    name: "Community",
    desc: "You train alone. You're not alone. A community chasing the same thing you are.",
  },
];

const STEPS = [
  {
    day: "Step 01",
    title: "Activate your 7-day free trial",
    desc: "No cost, no commitment. Full access to the method from minute one: training, nutrition, and your coach.",
  },
  {
    day: "Step 02",
    title: "Get your protocol and start Day 1",
    desc: "Your training and nutrition plan adjusts to your body, your goal, and what you have at home. Your coach introduces themselves and you start.",
  },
  {
    day: "Step 03",
    title: "On day 8, you decide",
    desc: "If you stay, your transformation is already moving. If it's not for you, cancel in one click and pay nothing.",
  },
  {
    day: "Week by week",
    title: "The program tightens with you",
    desc: "Intensity rises every week and your protocol adjusts to your results. Your coach reviews your week, corrects you, and demands more. 54 days later you don't finish a challenge — you finish someone new.",
  },
];

const SCREENS = [
  {
    tag: "D12 · Today",
    title: "Today's training",
    desc: "Guided video, block by block.",
  },
  {
    tag: "Protocol",
    title: "Your nutrition",
    desc: "The day's meals, built for you.",
  },
  {
    tag: "Coach",
    title: "Chat with your coach",
    desc: "Real answers. No bots.",
  },
];

const VS_APPS: [string, string, string][] = [
  ["Training", "Library workouts, the same for everyone", "54 progressive sessions designed by coaches"],
  ["Nutrition", "A generic calorie counter", "A protocol built for your body and your goal"],
  ["Coaching", "Automated notifications", "A real coach who writes to you every day"],
  ["Structure", "An endless membership, no finish line", "54 days with a start — and an end"],
  ["If you miss a day", "Nothing happens. No one notices", "Your coach notices — and writes to you"],
];

const VS_STUDIOS: [string, string, string][] = [
  ["Where", "Wherever you are, with what you have", "At one of our five studios"],
  ["Coach", "Daily coaching over chat", "Coaches on the floor, every session"],
  ["Schedule", "You decide when to train", "Your Generation's schedule"],
  ["Group", "Online community", "A Generation that trains with you — the group you start and finish with"],
  ["Extras", "The whole method in your pocket", "Nutritionist and physiotherapy at the studio"],
  ["Start", "Today, with 7 days free", "When your Generation opens — limited spots"],
];

const FAQ = [
  {
    q: "Do I need equipment or prior experience?",
    a: "No. You start at your level, with what you have at home. The first sessions build the base, and intensity rises week by week — with you.",
  },
  {
    q: "Is the coach a real person?",
    a: "Yes. Not a bot, not an automated notification: a coach from the 54D team who reviews your progress, corrects you, and writes to you every day.",
  },
  {
    q: "How much time do I need each day?",
    a: "Sessions are designed to be completed in under an hour. What the method asks of you isn't time — it's consistency for 54 days.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. The first 7 days are free: cancel before day 8 and you pay nothing. After that, you cancel straight from your account — no calls, no tricks.",
  },
  {
    q: "Does it work in my country?",
    a: "54D ON works wherever you are: the United States, Mexico, Colombia, or anywhere with a connection. All you need is your phone.",
  },
];

/* ============ Estilos puntuales (tablas y mockups) ============ */

const tableWrap: CSSProperties = {
  marginTop: "3rem",
  borderRadius: "var(--r-lg)",
  border: "1px solid var(--hairline)",
  background: "var(--glass)",
  backdropFilter: "blur(10px)",
  overflowX: "auto",
};
const table: CSSProperties = {
  width: "100%",
  minWidth: "42rem",
  borderCollapse: "collapse",
  fontSize: "0.98rem",
  lineHeight: 1.5,
};
const th: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  textAlign: "left",
  padding: "1.3rem 1.6rem",
  color: "var(--c-faint)",
};
const thAccent: CSSProperties = { ...th, color: "var(--c-yellow)" };
const tdLabel: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.82rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--c-white)",
  padding: "1.15rem 1.6rem",
  borderTop: "1px solid var(--hairline)",
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "1.15rem 1.6rem",
  borderTop: "1px solid var(--hairline)",
  color: "var(--c-mist)",
};
const tdOn: CSSProperties = { ...td, color: "var(--c-white)" };

function CompareTable({
  columns,
  rows,
  accentCol,
}: {
  columns: [string, string, string];
  rows: [string, string, string][];
  accentCol: 1 | 2;
}) {
  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th} scope="col">
              {columns[0]}
            </th>
            <th style={accentCol === 1 ? thAccent : th} scope="col">
              {columns[1]}
            </th>
            <th style={accentCol === 2 ? thAccent : th} scope="col">
              {columns[2]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, a, b]) => (
            <tr key={label}>
              <td style={tdLabel}>{label}</td>
              <td style={accentCol === 1 ? tdOn : td}>{a}</td>
              <td style={accentCol === 2 ? tdOn : td}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Placeholder de captura del producto: glass + aspect-ratio hasta tener assets reales. */
function PhoneMock({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div
      style={{
        aspectRatio: "9 / 18",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--hairline)",
        background:
          "radial-gradient(ellipse 90% 45% at 50% 0%, rgba(255, 210, 0, 0.08), transparent 60%), var(--glass)",
        backdropFilter: "blur(10px)",
        padding: "1.5rem 1.4rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          alignSelf: "flex-start",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--c-yellow)",
          border: "1px solid rgba(255, 210, 0, 0.25)",
          borderRadius: "var(--r-pill)",
          padding: "0.4rem 0.9rem",
        }}
      >
        {tag}
      </span>
      {/* Barras esqueleto: sugieren UI hasta tener capturas reales */}
      <div style={{ display: "grid", gap: "0.55rem" }} aria-hidden="true">
        <div style={{ height: "10px", width: "82%", borderRadius: "var(--r-pill)", background: "rgba(255, 255, 255, 0.07)" }} />
        <div style={{ height: "10px", width: "64%", borderRadius: "var(--r-pill)", background: "rgba(255, 255, 255, 0.05)" }} />
        <div style={{ height: "10px", width: "72%", borderRadius: "var(--r-pill)", background: "rgba(255, 255, 255, 0.04)" }} />
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.1rem",
            textTransform: "uppercase",
            lineHeight: 1.05,
            color: "var(--c-white)",
          }}
        >
          {title}
        </div>
        <p style={{ marginTop: "0.5rem", fontSize: "0.88rem", lineHeight: 1.5, color: "var(--c-mist)" }}>{desc}</p>
      </div>
    </div>
  );
}

/* ============ Página ============ */

export default function On() {
  const incluye = useReveal();
  const pasos = useReveal();
  const app = useReveal();
  const difApps = useReveal();
  const vsStudios = useReveal();
  const faq = useReveal();
  const cta = useReveal();

  return (
    <div>
      <Nav />

      {/* ============ HERO INTERIOR ============ */}
      <header className="hero hero-inner">
        <div className="hero-media">
          <div className="hero-poster" />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>54D ON</span>
          </nav>
          <span className="day-marker">54D ON — Online</span>
          <h1 className="hero-title">
            The full method.
            <br />
            <span className="accent">Wherever you are.</span>
          </h1>
          <p className="hero-sub">
            Same training. Same protocol. Same standard. No gym, no scheduling
            excuses.
          </p>
          <div className="hero-ctas">
            <Link to="/pricing" className="btn btn-primary">
              Start free — 7 days
            </Link>
            <Link to="/studios" className="btn btn-ghost">
              Explore the studios
            </Link>
          </div>
        </div>
      </header>

      {/* ============ QUÉ INCLUYE ============ */}
      <section className="section bloom">
        <div className="section-inner" ref={incluye.ref}>
          <div className={incluye.className}>
            <span className="day-marker">What's included</span>
            <div className="method-intro">
              <h2 className="section-title">
                The whole method. <span className="accent">No filler.</span>
              </h2>
              <p>
                54D ON is not a stripped-down version: it's the full 54-day
                program — training, nutrition, and a real coach who follows
                you.{" "}
                <Link to="/method" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
                  See the full method →
                </Link>
              </p>
            </div>
            <div className="method-grid">
              {INCLUDES.map((item) => (
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

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="section bloom-right">
        <div className="section-inner" ref={pasos.ref}>
          <div className={pasos.className}>
            <span className="day-marker">How it works</span>
            <h2 className="section-title">
              Three steps and you're <span className="accent">in.</span>
            </h2>
            <div className="timeline">
              {STEPS.map((s) => (
                <div className="timeline-item" key={s.day}>
                  <span className="timeline-day">{s.day}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LA EXPERIENCIA (mockups placeholder) ============ */}
      <section className="section bloom">
        <div className="section-inner" ref={app.ref}>
          <div className={app.className}>
            <span className="day-marker">The experience</span>
            <div className="method-intro">
              <h2 className="section-title">
                Your whole program <span className="accent">in your pocket.</span>
              </h2>
              <p>
                Your training for the day, your nutrition protocol, and the
                chat with your coach live in one place. Open, train, report.
                No friction.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "1.1rem",
                maxWidth: "54rem",
              }}
            >
              {SCREENS.map((s) => (
                <PhoneMock key={s.title} {...s} />
              ))}
            </div>
            <p style={{ marginTop: "1.4rem", fontSize: "0.8rem", color: "var(--c-faint)" }}>
              Illustrative product views. Access from any device.
            </p>
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIALES VS APPS GENÉRICAS ============ */}
      <section className="section bloom-right">
        <div className="section-inner" ref={difApps.ref}>
          <div className={difApps.className}>
            <span className="day-marker">The difference</span>
            <h2 className="section-title">
              This is not <span className="accent">another app.</span>
            </h2>
            <p style={{ marginTop: "1.4rem", maxWidth: "38rem", fontSize: "1.05rem", lineHeight: 1.6, color: "var(--c-mist)" }}>
              Workout apps sell you access to content. 54D ON puts you inside
              a program with structure, a standard, and an end. The app is
              just the vehicle.
            </p>
            <CompareTable
              columns={["", "A generic app", "54D ON"]}
              rows={VS_APPS}
              accentCol={2}
            />
          </div>
        </div>
      </section>

      {/* ============ COMPARATIVA HONESTA ON VS STUDIOS ============ */}
      <section className="section bloom">
        <div className="section-inner" ref={vsStudios.ref}>
          <div className={vsStudios.className}>
            <span className="day-marker">ON vs Studios</span>
            <h2 className="section-title">
              The same method. <span className="accent">Two ways in.</span>
            </h2>
            <p style={{ marginTop: "1.4rem", maxWidth: "38rem", fontSize: "1.05rem", lineHeight: 1.6, color: "var(--c-mist)" }}>
              No fine print: ON and Studios share the same program and the
              same standard. What changes is where — and who — you train with.
            </p>
            <CompareTable
              columns={["", "54D ON", "54D Studios"]}
              rows={VS_STUDIOS}
              accentCol={1}
            />
            <div style={{ marginTop: "2rem" }}>
              <Link to="/studios" className="btn btn-ghost">
                Rather train in person? Explore the studios →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section bloom-right">
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">FAQ</span>
            <h2 className="section-title">
              Before you <span className="accent">start.</span>
            </h2>
            <div className="faq-list">
              {FAQ.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      {/* Suscripción: /pricing presenta los planes y dispara startCheckout(priceId).
          Los montos ($54/mes, $156/trim, $588/año) viven allá — PRECIO_PENDIENTE. */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              Your Day 1 doesn't need <span className="accent">a gym.</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/pricing" className="btn btn-primary">
                Start free — 7 days
              </Link>
            </div>
            <p style={{ marginTop: "1.2rem", fontSize: "0.85rem", color: "var(--c-faint)" }}>
              7 days free · cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
