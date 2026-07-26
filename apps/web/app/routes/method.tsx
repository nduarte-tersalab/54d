import { Link } from "react-router";
import type { Route } from "./+types/method";
import { Nav, Footer, useReveal } from "../components/site";
import { asset } from "../lib/asset";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "The 54D Method: How 54 Days Change You" },
    {
      name: "description",
      content:
        "What the 54D Method is: 54 days of structured training, a personalized nutrition protocol, and daily coaching. How it works, day by day.",
    },
  ];
}

/* Definición citable (AEO): primer párrafo de la página, respuesta
   directa a "¿qué es 54D?" para Google, ChatGPT y Gemini. */
const DEFINITION =
  "54D is a 54-day body-transformation program that combines high-intensity training, a personalized nutrition protocol, and daily follow-up from a real coach. It is not a fitness app or a gym membership: it is a structured method with a start date, a demanding standard, and an end. 54D is available online through 54D ON, and in person at 54D Studios in Coral Gables, Hallandale, Mexico City, and Bogotá.";

const PILLARS = [
  {
    num: "01",
    name: "Training",
    desc: "Daily high-intensity sessions designed by coaches, not by an algorithm. Every day has a purpose inside a 54-session progression that scales with your level. In the studio or with whatever you have at home.",
  },
  {
    num: "02",
    name: "Nutrition",
    desc: "No generic diets: what you eat is part of the program. Your protocol is built for your body and your goal from day 1, and corrected along the way with your real results.",
  },
  {
    num: "03",
    name: "Coaching",
    desc: "A coach writes to you, corrects you, demands more. Every day. Not a bot, not a notification: a real person who knows your case and notices when you slack.",
  },
  {
    num: "04",
    name: "Result",
    desc: "On day 54 you don't finish a challenge: you finish someone new. And you have the tools to keep it without depending on anyone: habits, protocol, judgment.",
  },
];

const TIMELINE = [
  {
    day: "Day 01",
    title: "Assessment and base",
    desc: "Initial assessment: measurements, level, history, and goal. Your protocol is built on your data, not on a template. Week 1 installs the base: technique, pace, and the habit of reporting to your coach.",
  },
  {
    day: "Day 07",
    title: "Your protocol is already running",
    desc: "Your nutrition protocol is already running and your coach has a week of your data. The first adjustments land here: loads, portions, recovery. The program stops being generic. For good.",
  },
  {
    day: "Day 21",
    title: "Where most people quit",
    desc: "The early motivation is spent and the full result isn't visible yet. This is where most people quit. And where your coach pushes harder: more follow-up, not less. This is what the method is for.",
  },
  {
    day: "Day 35",
    title: "The building zone",
    desc: "Your body is responding: more strength, more energy, clothes that fit differently. The program raises the standard because you can take more now. Nobody gets off at day 35.",
  },
  {
    day: "Day 54",
    title: "The result. And the plan to keep it",
    desc: "Final measurements, a comparison against your day 1, and something bigger: 54 days of installed habits. You leave with a concrete plan to keep the result, because finishing the program isn't the end.",
  },
];

const FIT_YES = [
  "You want a result with an end date, not an endless membership.",
  "You can commit for 54 days: train, eat by your protocol, and report to your coach.",
  "You'd rather be pushed than congratulated.",
  "You've tried it alone and you know discipline is built with someone on you.",
];

const FIT_NO = [
  "You're looking for a shortcut: magic formulas or results without training.",
  "You want a workout app to use “whenever you can”.",
  "You're not willing to change how you eat for 54 days.",
  "You'd rather have a coach who asks nothing when you disappear.",
];

const FAQ = [
  {
    q: "Do I need prior experience?",
    a: "No. Day 1 starts with an assessment: your level, your measurements, your starting point. The program scales with you: the standard is relative to your body, not the person next to you. You start where you are, with what you have.",
    links: [{ href: "/blog", label: "More guides on the blog" }],
  },
  {
    q: "What if I miss a day?",
    a: "You talk it through with your coach and keep going. One missed day doesn't break the program; quitting does. That's what daily coaching is for: so a bad day doesn't turn into a bad week.",
    links: [],
  },
  {
    q: "ON or Studios: which one is for me?",
    a: "If you want to train wherever you are, on your schedule: 54D ON. If you want the full in-person experience: coaches on the floor, a fixed group, a nutritionist, and physiotherapy. That's 54D Studios in Miami, Mexico City, or Bogotá. The method is the same.",
    links: [
      { href: "/on", label: "Discover 54D ON" },
      { href: "/studios", label: "Explore the studios" },
    ],
  },
  {
    q: "What results can I expect in 54 days?",
    a: "It depends on your starting point and how closely you follow the program. What stays constant: fat loss, strength gains, and nutrition habits you know how to keep. And if you follow the program for 30 days and don't see results, we refund your money.",
    links: [{ href: "/pricing", label: "See plans and start free" }],
  },
];

const FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export default function Method() {
  const definition = useReveal();
  const pillars = useReveal();
  const timeline = useReveal();
  const guarantee = useReveal();
  const fit = useReveal();
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
          <span className="day-marker">The Method</span>
          <h1 className="hero-title">
            54 days of method.
            <br />
            <span className="accent">Not luck.</span>
          </h1>
          <p className="hero-sub">
            A program with a start date, an end date, and a coach who won't let
            you drift.
          </p>
          <div className="hero-ctas">
            <Link to="/pricing" className="btn btn-primary">
              Start free. 7 days.
            </Link>
            <Link to="/studios" className="btn btn-ghost">
              Explore the studios
            </Link>
          </div>
        </div>
      </header>

      {/* ============ QUÉ ES 54D (definición AEO) ============ */}
      <section className="section bloom">
        <div className="section-inner" ref={definition.ref}>
          <div className={definition.className}>
            <span className="day-marker">What is 54D</span>
            <div className="method-intro">
              <h2 className="section-title">
                A method with structure, a standard, and{" "}
                <span className="accent">an end.</span>
              </h2>
              <p>{DEFINITION}</p>
            </div>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-value">54</div>
                <div className="stat-label">Days of structure</div>
              </div>
              <div className="stat">
                <div className="stat-value">4</div>
                <div className="stat-label">Pillars of the method</div>
              </div>
              <div className="stat">
                <div className="stat-value">5</div>
                <div className="stat-label">Studios in 3 countries</div>
              </div>
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">Days free to try it</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOS 4 PILARES ============ */}
      <section className="section bloom-right" id="pilares">
        <div className="section-inner" ref={pillars.ref}>
          <div className={pillars.className}>
            <span className="day-marker">The 4 pillars</span>
            <div className="method-intro">
              <h2 className="section-title">
                Four pillars. <span className="accent">Zero improvisation.</span>
              </h2>
              <p>
                Every day of the program combines all four. None of them works
                alone: training without eating right is rowing in circles, and a
                plan with nobody demanding it is just another PDF.
              </p>
            </div>
            <div className="method-grid">
              {PILLARS.map((p) => (
                <div className="method-card" key={p.num}>
                  <div className="method-num">{p.num}</div>
                  <div className="method-name">{p.name}</div>
                  <p className="method-desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PHOTO BAND: LA CLASE EN TRABAJO ============ */}
      <section className="photo-band" aria-label="Inside a 54D class">
        <img
          src={asset("images/hd/cg-effort-yellow-d.jpg")}
          alt="A full 54D class holding planks on the mats under the 54D mural"
          loading="lazy"
        />
        <div className="photo-band-content">
          <span className="day-marker">Inside a session</span>
          <h2 className="section-title">
            This is what
            <br />
            the work looks like.
          </h2>
          <p className="photo-caption">54D class in session, day by day</p>
        </div>
      </section>

      {/* ============ TIMELINE D01 → D54 ============ */}
      <section className="section bloom" id="timeline">
        <div className="section-inner" ref={timeline.ref}>
          <div className={timeline.className}>
            <span className="day-marker">D01 → D54</span>
            <div className="method-intro">
              <h2 className="section-title">
                54 days, <span className="accent">day by day.</span>
              </h2>
              <p>
                The program isn't &ldquo;train hard and eat well&rdquo;. It's a
                designed sequence: each block sets up the next, and your coach
                adjusts the variables as you go.
              </p>
            </div>
            <div className="timeline">
              {TIMELINE.map((t) => (
                <div className="timeline-item" key={t.day}>
                  <span className="timeline-day">{t.day}</span>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GARANTÍA 30 DÍAS ============ */}
      <section className="section bloom-right" id="garantia">
        <div className="section-inner" ref={guarantee.ref}>
          <div className={guarantee.className}>
            <span className="day-marker">The guarantee</span>
            <div className="method-intro">
              <h2 className="section-title">
                If you do the work and it doesn't work,{" "}
                <span className="accent">you don't pay.</span>
              </h2>
              <p>
                You have 30 days. Follow the program: training, nutrition
                protocol, and daily check-ins with your coach. If you don't
                see results, we refund your money. No interrogation, no fine
                print, no &ldquo;call us to cancel&rdquo;.
              </p>
            </div>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">Days free, no charge</div>
              </div>
              <div className="stat">
                <div className="stat-value">30</div>
                <div className="stat-label">Day results guarantee</div>
              </div>
              <div className="stat">
                <div className="stat-value">1</div>
                <div className="stat-label">Click to cancel, no calls</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PARA QUIÉN ES / PARA QUIÉN NO ============ */}
      {/* paddingBottom 0: cierra el vacío de ~350px antes del FAQ
          (DESIGN_FIXES_V4 §5, evidencia method-desktop-2.png) */}
      <section
        className="section bloom"
        id="para-quien"
        style={{ paddingBottom: 0 }}
      >
        <div className="section-inner" ref={fit.ref}>
          <div className={fit.className}>
            <span className="day-marker">An honest filter</span>
            <h2 className="section-title">
              This isn't for everyone. <span className="accent">That's fine.</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: "1.1rem",
                marginTop: "3rem",
              }}
            >
              <div className="method-card">
                <div className="method-num">YES</div>
                <div className="method-name">It's for you if…</div>
                <ul className="pricing-features">
                  {FIT_YES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="method-card">
                <div className="method-num">NO</div>
                <div className="method-name">It's not for you if…</div>
                <ul className="pricing-features">
                  {FIT_NO.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ (con schema FAQPage) ============ */}
      <section className="section bloom-right" id="faq">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }}
        />
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">Questions</span>
            <h2 className="section-title">
              What people ask <span className="accent">before they start.</span>
            </h2>
            <div className="faq-list">
              {FAQ.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                  {f.links.length > 0 && (
                    <p>
                      {f.links.map((l, i) => (
                        <span key={l.href}>
                          {i > 0 && " · "}
                          <Link
                            to={l.href}
                            style={{
                              color: "var(--c-yellow)",
                              textDecoration: "none",
                            }}
                          >
                            {l.label} →
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SPLIT DE CIERRE: ON / STUDIOS ============ */}
      <section className="split">
        <div className="split-panel split-on">
          <div>
            <span className="split-label">Online: 54D ON</span>
            <h3 className="split-title">Do it online.</h3>
            <p className="split-desc">
              The full method from home: video training sessions, a nutrition
              protocol, and your coach over chat. Start with 7 days free.
            </p>
          </div>
          <div className="split-footer">
            <Link to="/on" className="btn btn-on">
              Discover 54D ON
            </Link>
            {/* PRECIO_PENDIENTE */}
            <span className="split-price">From $54/mo · 7 days free</span>
          </div>
        </div>
        <div className="split-panel split-studios">
          <div>
            <span className="split-label">In person: 5 studios</span>
            <h3 className="split-title">Do it in a studio.</h3>
            <p className="split-desc">
              The full experience, in person: coaches on the floor, a
              Generation, the group you start and finish with, and limited
              spots. Miami, Mexico City, and Bogotá.
            </p>
          </div>
          <div className="split-footer">
            <Link to="/studios" className="btn btn-primary">
              Explore the studios
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              Now you know the method. <span className="accent">Use it.</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/pricing" className="btn btn-primary">
                Start free. 7 days.
              </Link>
              <Link to="/studios" className="btn btn-ghost">
                Explore the studios
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
