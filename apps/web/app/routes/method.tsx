import { Link } from "react-router";
import type { Route } from "./+types/method";
import { Nav, Footer, useReveal } from "../components/site";
import { asset } from "../lib/asset";
import { useLang, resolveLang, type Lang } from "../lib/i18n";

export async function loader({ request }: Route.LoaderArgs) {
  return { lang: resolveLang(request) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const es = loaderData?.lang === "es";
  return [
    {
      title: es
        ? "El Método 54D: cómo te cambian 54 días"
        : "The 54D Method: How 54 Days Change You",
    },
    {
      name: "description",
      content: es
        ? "Qué es el Método 54D: 54 días de entrenamiento estructurado, un protocolo de nutrición personalizado y coaching diario. Cómo funciona, día a día."
        : "What the 54D Method is: 54 days of structured training, a personalized nutrition protocol, and daily coaching. How it works, day by day.",
    },
  ];
}

/* Definición citable (AEO): primer párrafo de la página, respuesta
   directa a "¿qué es 54D?" para Google, ChatGPT y Gemini. */
const DEFINITION: Record<Lang, string> = {
  en: "54D is a 54-day body-transformation program that combines high-intensity training, a personalized nutrition protocol, and daily follow-up from a real coach. It is not a fitness app or a gym membership: it is a structured method with a start date, a demanding standard, and an end. 54D is available online through 54D ON, and in person at 54D Studios in Coral Gables, Hallandale, Mexico City, and Bogotá.",
  es: "54D es un programa de transformación física de 54 días que combina entrenamiento de alta intensidad, un protocolo de nutrición personalizado y el seguimiento diario de un coach real. No es una app de fitness ni una membresía de gimnasio: es un método estructurado con fecha de inicio, un estándar exigente y un final. 54D está disponible online a través de 54D ON y de forma presencial en los 54D Studios de Coral Gables, Hallandale, Ciudad de México y Bogotá.",
};

const PILLARS: {
  num: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    num: "01",
    name: { en: "Training", es: "Entrenamiento" },
    desc: {
      en: "Daily high-intensity sessions designed by coaches, not by an algorithm. Every day has a purpose inside a 54-session progression that scales with your level. In the studio or with whatever you have at home.",
      es: "Sesiones diarias de alta intensidad diseñadas por coaches, no por un algoritmo. Cada día tiene un propósito dentro de una progresión de 54 sesiones que escala con tu nivel. En el estudio o con lo que tengas en casa.",
    },
  },
  {
    num: "02",
    name: { en: "Nutrition", es: "Nutrición" },
    desc: {
      en: "No generic diets: what you eat is part of the program. Your protocol is built for your body and your goal from day 1, and corrected along the way with your real results.",
      es: "Sin dietas genéricas: lo que comes es parte del programa. Tu protocolo se crea para tu cuerpo y tu meta desde el día 1, y se corrige en el camino con tus resultados reales.",
    },
  },
  {
    num: "03",
    name: { en: "Coaching", es: "Coaching" },
    desc: {
      en: "A coach writes to you, corrects you, demands more. Every day. Not a bot, not a notification: a real person who knows your case and notices when you slack.",
      es: "Un coach te escribe, te corrige, te exige más. Todos los días. No es un bot ni una notificación: es una persona real que conoce tu caso y se da cuenta cuando aflojas.",
    },
  },
  {
    num: "04",
    name: { en: "Result", es: "Resultado" },
    desc: {
      en: "On day 54 you don't finish a challenge: you finish someone new. And you have the tools to keep it without depending on anyone: habits, protocol, judgment.",
      es: "El día 54 no terminas un reto: terminas siendo otra persona. Y te quedas con las herramientas para mantenerlo sin depender de nadie: hábitos, protocolo, criterio.",
    },
  },
];

const TIMELINE: {
  day: Record<Lang, string>;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    day: { en: "Day 01", es: "Día 01" },
    title: { en: "Assessment and base", es: "Evaluación y base" },
    desc: {
      en: "Initial assessment: measurements, level, history, and goal. Your protocol is built on your data, not on a template. Week 1 installs the base: technique, pace, and the habit of reporting to your coach.",
      es: "Evaluación inicial: medidas, nivel, historial y meta. Tu protocolo se construye con tus datos, no con una plantilla. La semana 1 instala la base: técnica, ritmo y el hábito de reportarte con tu coach.",
    },
  },
  {
    day: { en: "Day 07", es: "Día 07" },
    title: {
      en: "Your protocol is already running",
      es: "Tu protocolo ya está en marcha",
    },
    desc: {
      en: "Your nutrition protocol is already running and your coach has a week of your data. The first adjustments land here: loads, portions, recovery. The program stops being generic. For good.",
      es: "Tu protocolo de nutrición ya corre y tu coach tiene una semana de tus datos. Aquí llegan los primeros ajustes: cargas, porciones, recuperación. El programa deja de ser genérico. Para siempre.",
    },
  },
  {
    day: { en: "Day 21", es: "Día 21" },
    title: { en: "Where most people quit", es: "Donde la mayoría abandona" },
    desc: {
      en: "The early motivation is spent and the full result isn't visible yet. This is where most people quit. And where your coach pushes harder: more follow-up, not less. This is what the method is for.",
      es: "La motivación inicial se agotó y el resultado completo todavía no se ve. Aquí es donde la mayoría abandona. Y donde tu coach aprieta más: más seguimiento, no menos. Para esto existe el método.",
    },
  },
  {
    day: { en: "Day 35", es: "Día 35" },
    title: { en: "The building zone", es: "La zona de construcción" },
    desc: {
      en: "Your body is responding: more strength, more energy, clothes that fit differently. The program raises the standard because you can take more now. Nobody gets off at day 35.",
      es: "Tu cuerpo está respondiendo: más fuerza, más energía, ropa que te queda distinto. El programa sube el estándar porque ahora puedes con más. Nadie se baja en el día 35.",
    },
  },
  {
    day: { en: "Day 54", es: "Día 54" },
    title: {
      en: "The result. And the plan to keep it",
      es: "El resultado. Y el plan para mantenerlo",
    },
    desc: {
      en: "Final measurements, a comparison against your day 1, and something bigger: 54 days of installed habits. You leave with a concrete plan to keep the result, because finishing the program isn't the end.",
      es: "Medidas finales, la comparación contra tu día 1 y algo más grande: 54 días de hábitos instalados. Te vas con un plan concreto para mantener el resultado, porque terminar el programa no es el final.",
    },
  },
];

const FIT_YES: Record<Lang, string[]> = {
  en: [
    "You want a result with an end date, not an endless membership.",
    "You can commit for 54 days: train, eat by your protocol, and report to your coach.",
    "You'd rather be pushed than congratulated.",
    "You've tried it alone and you know discipline is built with someone on you.",
  ],
  es: [
    "Quieres un resultado con fecha de final, no una membresía infinita.",
    "Puedes comprometerte 54 días: entrenar, comer según tu protocolo y reportarte con tu coach.",
    "Prefieres que te exijan a que te feliciten.",
    "Ya lo intentaste por tu cuenta y sabes que la disciplina se construye con alguien encima.",
  ],
};

const FIT_NO: Record<Lang, string[]> = {
  en: [
    "You're looking for a shortcut: magic formulas or results without training.",
    "You want a workout app to use “whenever you can”.",
    "You're not willing to change how you eat for 54 days.",
    "You'd rather have a coach who asks nothing when you disappear.",
  ],
  es: [
    "Buscas un atajo: fórmulas mágicas o resultados sin entrenar.",
    "Quieres una app de ejercicio para usar “cuando se pueda”.",
    "No piensas cambiar tu forma de comer durante 54 días.",
    "Prefieres un coach que no pregunte nada cuando desapareces.",
  ],
};

type MethodFaq = {
  q: string;
  a: string;
  links: { href: string; label: string }[];
};
const FAQ: Record<Lang, MethodFaq[]> = {
  en: [
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
      a: "One method, two very different programs. 54D ON is your transformation, wherever you are, on your schedule, coached through the 54D On app. 54D Studios is the flagship: in person, by application, with a dedicated team of coaches, a nutritionist, and a physiotherapist in Miami, Mexico City, and Bogotá. Neither is a lighter version of the other. They are built for different lives.",
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
  ],
  es: [
    {
      q: "¿Necesito experiencia previa?",
      a: "No. El día 1 empieza con una evaluación: tu nivel, tus medidas, tu punto de partida. El programa escala contigo: el estándar es relativo a tu cuerpo, no al de al lado. Empiezas donde estás, con lo que tienes.",
      links: [{ href: "/blog", label: "Más guías en el blog" }],
    },
    {
      q: "¿Y si me salto un día?",
      a: "Lo hablas con tu coach y sigues. Un día perdido no rompe el programa; abandonar sí. Para eso existe el coaching diario: para que un mal día no se convierta en una mala semana.",
      links: [],
    },
    {
      q: "¿ON o Studios? ¿Cuál es para mí?",
      a: "Un método, dos programas muy distintos. 54D ON es tu transformación, donde estés y a tu horario, con coach en la app 54D On. 54D Studios es la experiencia insignia: presencial, por solicitud, con un equipo dedicado de coaches, nutricionista y fisioterapeuta en Miami, Ciudad de México y Bogotá. Ninguno es la versión ligera del otro. Están hechos para vidas distintas.",
      links: [
        { href: "/on", label: "Descubre 54D ON" },
        { href: "/studios", label: "Explora los studios" },
      ],
    },
    {
      q: "¿Qué resultados puedo esperar en 54 días?",
      a: "Depende de tu punto de partida y de qué tanto sigas el programa. Lo que no cambia: pérdida de grasa, ganancia de fuerza y hábitos de nutrición que sabes mantener. Y si sigues el programa 30 días y no ves resultados, te devolvemos tu dinero.",
      links: [{ href: "/pricing", label: "Mira los planes y empieza gratis" }],
    },
  ],
};

/* Schema SIEMPRE desde el EN (idioma principal indexado) */
const FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.en.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export default function Method() {
  const { lang } = useLang();
  const es = lang === "es";
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
          <span className="day-marker">{es ? "El Método" : "The Method"}</span>
          <h1 className="hero-title">
            {es ? "54 días de método." : "54 days of method."}
            <br />
            <span className="accent">{es ? "No de suerte." : "Not luck."}</span>
          </h1>
          <p className="hero-sub">
            {es
              ? "Un programa con fecha de inicio, fecha de final y un coach que no te deja a la deriva."
              : "A program with a start date, an end date, and a coach who won't let you drift."}
          </p>
          <div className="hero-ctas">
            <Link to="/pricing" className="btn btn-primary">
              {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
            </Link>
            <Link to="/studios" className="btn btn-ghost">
              {es ? "Explora los studios" : "Explore the studios"}
            </Link>
          </div>
        </div>
      </header>

      {/* ============ QUÉ ES 54D (definición AEO) ============ */}
      <section className="section bloom">
        <div className="section-inner" ref={definition.ref}>
          <div className={definition.className}>
            <span className="day-marker">
              {es ? "Qué es 54D" : "What is 54D"}
            </span>
            <div className="method-intro">
              <h2 className="section-title">
                {es
                  ? "Un método con estructura, un estándar y "
                  : "A method with structure, a standard, and "}
                <span className="accent">{es ? "un final." : "an end."}</span>
              </h2>
              <p>{DEFINITION[lang]}</p>
            </div>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-value">54</div>
                <div className="stat-label">
                  {es ? "Días de estructura" : "Days of structure"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">4</div>
                <div className="stat-label">
                  {es ? "Pilares del método" : "Pillars of the method"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">5</div>
                <div className="stat-label">
                  {es ? "Studios en 3 países" : "Studios in 3 countries"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">
                  {es ? "Días gratis para probarlo" : "Days free to try it"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOS 4 PILARES ============ */}
      <section className="section" id="pilares">
        <div className="section-inner" ref={pillars.ref}>
          <div className={pillars.className}>
            <span className="day-marker">
              {es ? "Los 4 pilares" : "The 4 pillars"}
            </span>
            <div className="method-intro">
              <h2 className="section-title">
                {es ? "Cuatro pilares. " : "Four pillars. "}
                <span className="accent">
                  {es ? "Cero improvisación." : "Zero improvisation."}
                </span>
              </h2>
              <p>
                {es
                  ? "Cada día del programa combina los cuatro. Ninguno funciona solo: entrenar sin comer bien es remar en círculos, y un plan sin nadie que lo exija es un PDF más."
                  : "Every day of the program combines all four. None of them works alone: training without eating right is rowing in circles, and a plan with nobody demanding it is just another PDF."}
              </p>
            </div>
            {/* Split cards/foto: pilares en 2×2 + columna lateral con el
                coach en el piso (hd2, vertical 3:4). En pantallas angostas
                la foto cae debajo de las cards como banda (minHeight). */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "stretch",
                gap: "1.1rem",
              }}
            >
              <div
                style={{
                  flex: "2 1 34rem",
                  minWidth: 0,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "1.1rem",
                }}
              >
                {PILLARS.map((p) => (
                  <div className="method-card" key={p.num}>
                    <div className="method-num">{p.num}</div>
                    <div className="method-name">{p.name[lang]}</div>
                    <p className="method-desc">{p.desc[lang]}</p>
                  </div>
                ))}
              </div>
              <figure
                style={{
                  margin: 0,
                  flex: "1 1 19rem",
                  minWidth: "min(100%, 16rem)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    flex: "1 1 auto",
                    minHeight: "24rem",
                    overflow: "hidden",
                    borderRadius: "var(--r-media, 2px)",
                    background: "var(--c-ink)",
                  }}
                >
                  <img
                    src={asset("images/studios/coral-gables/group-squat-class-01.jpg")}
                    alt={
                      es
                        ? "Una clase de 54D en sentadilla al unísono con el coach marcando el ritmo"
                        : "A 54D class squatting in unison with the coach setting the pace"
                    }
                    loading="lazy"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 30%",
                      filter: "saturate(0.85) contrast(1.05)",
                    }}
                  />
                </div>
                <figcaption className="photo-caption">
                  {es
                    ? "Un coach en el piso, en cada sesión"
                    : "A coach on the floor, every session"}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PHOTO BAND: LA CLASE EN TRABAJO ============ */}
      <section
        className="photo-band band-tight"
        aria-label={es ? "Dentro de una clase de 54D" : "Inside a 54D class"}
      >
        <img
          src={asset("images/brand/class-plank-54d-mural.jpg")}
          alt={
            es
              ? "Una clase completa de 54D sosteniendo planchas sobre los mats bajo el mural 54D"
              : "A full 54D class holding planks on the mats under the 54D mural"
          }
          loading="lazy"
        />
        <div className="photo-band-content">
          <span className="day-marker">
            {es ? "Dentro de una sesión" : "Inside a session"}
          </span>
          <h2 className="section-title">
            {es ? (
              <>Así se ve el trabajo.</>
            ) : (
              <>
                This is what
                <br />
                the work looks like.
              </>
            )}
          </h2>
          <p className="photo-caption">
            {es
              ? "Una clase de 54D en plena sesión, día a día"
              : "54D class in session, day by day"}
          </p>
        </div>
      </section>

      {/* ============ TIMELINE D01 → D54 ============ */}
      <section className="section" id="timeline">
        <div className="section-inner" ref={timeline.ref}>
          <div className={timeline.className}>
            <span className="day-marker">D01 → D54</span>
            <div className="gen-split">
              <div>
                <h2 className="section-title">
                  {es ? "54 días, " : "54 days, "}
                  <span className="accent">
                    {es ? "día a día." : "day by day."}
                  </span>
                </h2>
                <p style={{ marginTop: "1.4rem", maxWidth: "34rem" }}>
                  {es
                    ? "El programa no es “entrena duro y come bien”. Es una secuencia diseñada: cada bloque prepara el siguiente y tu coach ajusta las variables sobre la marcha."
                    : "The program isn't “train hard and eat well”. It's a designed sequence: each block sets up the next, and your coach adjusts the variables as you go."}
                </p>
                <figure
                  style={{
                    position: "sticky",
                    top: "6rem",
                    margin: "2.4rem 0 0",
                    maxWidth: "26rem",
                  }}
                >
                  <img
                    src={asset("images/studios/coral-gables/coach-correction.jpg")}
                    alt={
                      es
                        ? "Miembros de 54D ejecutando press de hombro con mancuernas durante una sesión"
                        : "54D members performing dumbbell shoulder presses during a session"
                    }
                    loading="lazy"
                    style={{
                      width: "100%",
                      aspectRatio: "3 / 4",
                      objectFit: "cover",
                      borderRadius: "var(--r-media, 2px)",
                      filter: "saturate(0.85) contrast(1.05)",
                    }}
                  />
                  <figcaption
                    className="photo-caption"
                    style={{ marginTop: "0.9rem" }}
                  >
                    {es
                      ? "Cada rep se corrige en el momento"
                      : "Every rep gets corrected in the moment"}
                  </figcaption>
                </figure>
              </div>
              <div className="timeline">
                {TIMELINE.map((t) => (
                  <div className="timeline-item" key={t.day.en}>
                    <span className="timeline-day">{t.day[lang]}</span>
                    <h3>{t.title[lang]}</h3>
                    <p>{t.desc[lang]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GARANTÍA 30 DÍAS (photo-band) ============ */}
      {/* Patrón de banda de method: day-marker + título sobre la foto de la
          generación celebrando (hd2). Los stats glass leen bien sobre el velo. */}
      <section
        className="photo-band"
        id="garantia"
        aria-label={
          es ? "La garantía de 30 días de 54D" : "The 30-day 54D guarantee"
        }
      >
        <img
          src={asset("images/hd2/method-guarantee-celebration.jpg")}
          alt={
            es
              ? "Una Generación completa de 54D flexionando y celebrando frente a la pared amarilla de 54D al final del programa"
              : "A full 54D generation flexing and celebrating in front of the yellow 54D wall at the end of the program"
          }
          loading="lazy"
        />
        <div className="photo-band-content" ref={guarantee.ref}>
          <div className={guarantee.className}>
            <span className="day-marker">
              {es ? "La garantía" : "The guarantee"}
            </span>
            <h2 className="section-title" style={{ maxWidth: "24ch" }}>
              {es
                ? "Si cumples y no funciona, "
                : "If you do the work and it doesn't work, "}
              <span className="accent">
                {es ? "no pagas." : "you don't pay."}
              </span>
            </h2>
            <p
              style={{
                maxWidth: "34rem",
                marginTop: "1.4rem",
                fontSize: "var(--text-body)",
                lineHeight: 1.65,
                color: "var(--c-mist)",
                textShadow: "0 1px 24px rgba(7,7,7,.6)",
              }}
            >
              {es
                ? "Tienes 30 días. Sigue el programa: entrenamiento, protocolo de nutrición y reporte diario con tu coach. Si no ves resultados, te devolvemos tu dinero. Sin interrogatorios, sin letra chica, sin “llama para cancelar”."
                : "You have 30 days. Follow the program: training, nutrition protocol, and daily check-ins with your coach. If you don't see results, we refund your money. No interrogation, no fine print, no “call us to cancel”."}
            </p>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">
                  {es ? "Días gratis, sin cargo" : "Days free, no charge"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">30</div>
                <div className="stat-label">
                  {es
                    ? "Días de garantía de resultados"
                    : "Day results guarantee"}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">1</div>
                <div className="stat-label">
                  {es
                    ? "Clic para cancelar, sin llamadas"
                    : "Click to cancel, no calls"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PARA QUIÉN ES / PARA QUIÉN NO ============ */}
      {/* FIXES_V5 §4: sin hacks de padding — el ritmo lo pone --space-section */}
      <section className="section" id="para-quien">
        <div className="section-inner" ref={fit.ref}>
          <div className={fit.className}>
            <span className="day-marker">
              {es ? "Un filtro honesto" : "An honest filter"}
            </span>
            <h2 className="section-title">
              {es ? "Esto no es para todos. " : "This isn't for everyone. "}
              <span className="accent">
                {es ? "Y está bien." : "That's fine."}
              </span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: "1.1rem",
                marginTop: "var(--space-block)",
              }}
            >
              <div className="method-card">
                <div className="method-num">{es ? "SÍ" : "YES"}</div>
                <div className="method-name">
                  {es ? "Es para ti si…" : "It's for you if…"}
                </div>
                <ul className="pricing-features">
                  {FIT_YES[lang].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="method-card">
                <div className="method-num">NO</div>
                <div className="method-name">
                  {es ? "No es para ti si…" : "It's not for you if…"}
                </div>
                <ul className="pricing-features">
                  {FIT_NO[lang].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ (con schema FAQPage, SIEMPRE en EN) ============ */}
      <section className="section" id="faq">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }}
        />
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">{es ? "Preguntas" : "Questions"}</span>
            <h2 className="section-title">
              {es ? "Lo que la gente pregunta " : "What people ask "}
              <span className="accent">
                {es ? "antes de empezar." : "before they start."}
              </span>
            </h2>
            {/* 2 columnas: mismo patrón que /pricing y /on (queda 2x2) */}
            <div
              className="faq-list"
              style={{
                maxWidth: "none",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))",
                alignItems: "start",
              }}
            >
              {FAQ[lang].map((f) => (
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

      {/* ============ SPLIT DE CIERRE: DOS PRODUCTOS, NO DOS SEDES ============ */}
      {/* QUIET v6: los dos botones del split en ghost; el único primario
          amarillo de la zona baja es el del cierre final. */}
      <section className="split">
        <div className="split-panel split-on">
          <img
            src={asset("images/programs/54d-on-wide.jpg")}
            alt={
              es
                ? "Coaches de 54D ON en el set negro con luz cálida del programa digital"
                : "54D ON coaches on the black, warm-lit set of the digital program"
            }
            loading="lazy"
            style={{
              margin:
                "calc(-1 * clamp(2.4rem, 4.5vw, 4rem)) calc(-1 * clamp(2.4rem, 4.5vw, 4rem)) 1.8rem",
              width: "calc(100% + 2 * clamp(2.4rem, 4.5vw, 4rem))",
              maxWidth: "none",
              height: "200px",
              objectFit: "cover",
              filter: "saturate(0.85) contrast(1.05)",
            }}
          />
          <div>
            <span className="split-label">
              {es ? "Online, donde estés" : "Online, wherever you are"}
            </span>
            <h3 className="split-title">54D ON</h3>
            <p className="split-desc">
              {es
                ? "El programa digital de 54 días en la app 54D On: entrenamiento diario, tu protocolo de nutrición y un coach real de tu lado. Empieza con 7 días gratis."
                : "The 54-day digital program in the 54D On app: daily training, your nutrition protocol, and a real coach in your corner. Start with 7 days free."}
            </p>
          </div>
          <div
            className="split-footer"
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.8rem",
            }}
          >
            <Link to="/on" className="btn btn-ghost">
              {es ? "Descubre 54D ON" : "Discover 54D ON"}
            </Link>
            {/* PRECIO_PENDIENTE */}
            <span className="split-price">
              {es ? "Desde $54/mes · 7 días gratis" : "From $54/mo · 7 days free"}
            </span>
          </div>
        </div>
        <div className="split-panel split-studios">
          <img
            src={asset("images/brand/group-photo-54d-mural.jpg")}
            alt={
              es
                ? "Una Generación completa de 54D posando junta bajo el mural gigante 54D"
                : "A full 54D Generation posing together under the giant 54D mural"
            }
            loading="lazy"
            style={{
              margin:
                "calc(-1 * clamp(2.4rem, 4.5vw, 4rem)) calc(-1 * clamp(2.4rem, 4.5vw, 4rem)) 1.8rem",
              width: "calc(100% + 2 * clamp(2.4rem, 4.5vw, 4rem))",
              maxWidth: "none",
              height: "200px",
              objectFit: "cover",
              filter: "saturate(0.85) contrast(1.05)",
            }}
          />
          <div>
            <span className="split-label">
              {es ? "La experiencia insignia" : "The flagship experience"}
            </span>
            <h3 className="split-title">54D Studios</h3>
            <p className="split-desc">
              {es
                ? "El método completo, presencial, con un equipo dedicado de coaches, nutricionista y fisioterapeuta. Admisión por Generación: una fecha de inicio, cupos limitados. Miami, Ciudad de México, Bogotá."
                : "The complete method, in person, with a dedicated team of coaches, a nutritionist, and a physiotherapist. Admission by Generation: one start date, limited places. Miami, Mexico City, Bogotá."}
            </p>
          </div>
          <div
            className="split-footer"
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.8rem",
            }}
          >
            <Link to="/studios" className="btn btn-ghost">
              {es ? "Solicita una consulta" : "Request a consultation"}
            </Link>
            <span className="split-price">
              {es
                ? "Admisión por solicitud · Cupos limitados por Generación"
                : "By application · Limited places per Generation"}
            </span>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              {es ? "Ya conoces el método. " : "Now you know the method. "}
              <span className="accent">{es ? "Úsalo." : "Use it."}</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/pricing" className="btn btn-primary">
                {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
              </Link>
              <Link to="/studios" className="btn btn-ghost">
                {es ? "Explora los studios" : "Explore the studios"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
