import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/assessment";
import { Nav, Footer } from "../components/site";
import { resolveLang, useLang, type Lang } from "../lib/i18n";
import { DIAL_CODES, FREQUENT_ISO, isoFlag } from "../data/dial-codes";

/* ============================================================
   /assessment: lead magnet del funnel ON (cliente, 17/08).
   12 preguntas adaptadas del assessment de vitality.54d.com,
   SIN scoring (prohibido inventar puntajes o perfiles medicos):
   las respuestas viajan serializadas en `notes` del lead y el
   coach responde por WhatsApp con una recomendacion humana.
   Un paso = una pregunta, avance automatico al elegir; cierre
   con nombre + WhatsApp (mismo patron LeadForm de studio-detail)
   y POST al endpoint real /leads (email O phone; phone alcanza).
   El API dispara Meta Lead server-side: sin fbq aca (evita doble
   conteo). Sin location_slug: no hay sede, el lead es de ON.
   Quiet v6: lona negra, un primario por vista, bilingue EN/ES.
   ============================================================ */

export async function loader({ request }: Route.LoaderArgs) {
  return { lang: resolveLang(request) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const es = loaderData?.lang === "es";
  return [
    {
      title: es
        ? "Assessment 54D: descubre qué está frenando tu progreso"
        : "54D Assessment: Find What's Holding Your Progress Back",
    },
    {
      name: "description",
      content: es
        ? "12 preguntas rápidas sobre movimiento, nutrición, sueño, estrés y consistencia. Al final te contactamos por WhatsApp con una recomendación de tu coach."
        : "12 quick questions about movement, nutrition, sleep, stress, and consistency. At the end we reach out on WhatsApp with a recommendation from your coach.",
    },
  ];
}

/* ---------- Contenido: 6 categorías x 2 preguntas ---------- */

type CatKey =
  | "movimiento"
  | "nutricion"
  | "sueno"
  | "estres"
  | "consistencia"
  | "disposicion";

const CATEGORIES: Record<CatKey, Record<Lang, string>> = {
  movimiento: { en: "Movement", es: "Movimiento" },
  nutricion: { en: "Nutrition", es: "Nutrición" },
  sueno: { en: "Sleep and recovery", es: "Sueño y recuperación" },
  estres: { en: "Stress", es: "Estrés" },
  consistencia: { en: "Consistency", es: "Consistencia" },
  disposicion: { en: "Readiness", es: "Disposición" },
};

type Question = {
  cat: CatKey;
  q: Record<Lang, string>;
  opts: Record<Lang, string[]>;
};

const QUESTIONS: Question[] = [
  {
    cat: "movimiento",
    q: {
      es: "¿Con qué frecuencia haces ejercicio físico intencional?",
      en: "How often do you do intentional physical exercise?",
    },
    opts: {
      es: [
        "Casi nunca: menos de 1 vez por semana",
        "Ocasionalmente: 1 a 2 veces por semana",
        "Regularmente: 3 a 4 veces por semana",
        "Consistentemente: 5 o más veces por semana",
      ],
      en: [
        "Almost never: less than once a week",
        "Occasionally: 1 to 2 times a week",
        "Regularly: 3 to 4 times a week",
        "Consistently: 5 or more times a week",
      ],
    },
  },
  {
    cat: "movimiento",
    q: {
      es: "Cuando entrenas, ¿cómo describirías tu nivel de esfuerzo?",
      en: "When you train, how would you describe your effort level?",
    },
    opts: {
      es: [
        "No entreno actualmente",
        "Moderado: me muevo pero sin mucho desafío",
        "Alto: salgo de mi zona de confort",
        "Muy alto: sesiones progresivas y retadoras",
      ],
      en: [
        "I don't train right now",
        "Moderate: I move but without much challenge",
        "High: I get out of my comfort zone",
        "Very high: progressive, challenging sessions",
      ],
    },
  },
  {
    cat: "nutricion",
    q: {
      es: "¿Qué tan estructurada es tu alimentación actualmente?",
      en: "How structured is your eating right now?",
    },
    opts: {
      es: [
        "Como lo que hay, sin plan ni intención",
        "Intento comer bien pero sin estructura real",
        "Tengo hábitos claros, aunque no siempre los sigo",
        "Sigo un protocolo nutricional consistente",
      ],
      en: [
        "I eat whatever's around, no plan or intention",
        "I try to eat well but with no real structure",
        "I have clear habits, though I don't always follow them",
        "I follow a consistent nutrition protocol",
      ],
    },
  },
  {
    cat: "nutricion",
    q: {
      es: "¿Cómo calificarías la calidad general de lo que comes?",
      en: "How would you rate the overall quality of what you eat?",
    },
    opts: {
      es: [
        "Mucho procesado, poco control sobre lo que consumo",
        "Mezcla de bueno y malo, sin mucha conciencia",
        "Mayoritariamente saludable con algunos deslices",
        "Alimentos reales, porciones intencionales, consistente",
      ],
      en: [
        "Lots of processed food, little control over what I eat",
        "A mix of good and bad, without much awareness",
        "Mostly healthy with some slip-ups",
        "Real food, intentional portions, consistent",
      ],
    },
  },
  {
    cat: "sueno",
    q: {
      es: "¿Cuántas horas duermes en promedio por noche?",
      en: "How many hours do you sleep on average per night?",
    },
    opts: {
      es: ["Menos de 5 horas", "5 a 6 horas", "6 a 7 horas", "7 a 9 horas"],
      en: [
        "Less than 5 hours",
        "5 to 6 hours",
        "6 to 7 hours",
        "7 to 9 hours",
      ],
    },
  },
  {
    cat: "sueno",
    q: {
      es: "¿Cómo te despiertas la mayoría de las mañanas?",
      en: "How do you wake up most mornings?",
    },
    opts: {
      es: [
        "Agotado: necesito varias alarmas para levantarme",
        "Cansado: funciono, pero con esfuerzo",
        "Descansado la mayoría de los días",
        "Descansado y con energía, sin necesidad de alarma",
      ],
      en: [
        "Exhausted: I need multiple alarms to get up",
        "Tired: I function, but it takes effort",
        "Rested most days",
        "Rested and energized, no alarm needed",
      ],
    },
  },
  {
    cat: "estres",
    q: {
      es: "¿Cómo describirías tu nivel de estrés en las últimas semanas?",
      en: "How would you describe your stress level over the past few weeks?",
    },
    opts: {
      es: [
        "Abrumador: siento que no tengo control",
        "Alto: lo manejo como puedo, pero me afecta",
        "Moderado, con algunos picos manejables",
        "Bajo o manejable: tengo perspectiva y herramientas",
      ],
      en: [
        "Overwhelming: I feel like I have no control",
        "High: I manage as I can, but it affects me",
        "Moderate, with a few manageable spikes",
        "Low or manageable: I have perspective and tools",
      ],
    },
  },
  {
    cat: "estres",
    q: {
      es: "¿Tienes prácticas activas para manejar el estrés?",
      en: "Do you have active practices to manage stress?",
    },
    opts: {
      es: [
        "No tengo nada establecido",
        "A veces hago algo (caminar, música), sin rutina",
        "Tengo herramientas que uso con cierta regularidad",
        "Tengo un sistema claro: respiración, meditación, desconexión",
      ],
      en: [
        "I have nothing in place",
        "Sometimes I do something (walk, music), no routine",
        "I have tools I use fairly regularly",
        "I have a clear system: breathing, meditation, disconnecting",
      ],
    },
  },
  {
    cat: "consistencia",
    q: {
      es: "En las últimas 4 semanas, ¿cómo fue tu consistencia en hábitos saludables?",
      en: "Over the last 4 weeks, how consistent were you with healthy habits?",
    },
    opts: {
      es: [
        "No pude mantener nada: semanas caóticas",
        "Inconsistente: muchas interrupciones",
        "Bastante consistente, con algunos baches",
        "Muy consistente, casi sin interrupciones",
      ],
      en: [
        "I couldn't keep anything up: chaotic weeks",
        "Inconsistent: lots of interruptions",
        "Fairly consistent, with a few bumps",
        "Very consistent, almost no interruptions",
      ],
    },
  },
  {
    cat: "consistencia",
    q: {
      es: "¿Qué pasa cuando algo externo interrumpe tus hábitos?",
      en: "What happens when something external disrupts your habits?",
    },
    opts: {
      es: [
        "Casi siempre me desvío y no retomo por semanas",
        "Me cuesta volver, pero eventualmente lo hago",
        "Generalmente retomo en 1 a 2 días",
        "Tengo sistemas que me anclan: retomo al día siguiente",
      ],
      en: [
        "I almost always derail and don't restart for weeks",
        "I struggle to get back, but eventually do",
        "I usually get back within 1 to 2 days",
        "I have systems that anchor me: I restart the next day",
      ],
    },
  },
  {
    cat: "disposicion",
    q: {
      es: "¿Qué tan claro tienes lo que quieres lograr en salud en los próximos 90 días?",
      en: "How clear are you on what you want to achieve in health over the next 90 days?",
    },
    opts: {
      es: [
        "No lo tengo claro: no sé por dónde empezar",
        "Tengo una idea vaga, pero nada concreto",
        "Lo tengo bastante claro, con algunas metas definidas",
        "Lo tengo muy claro, con métricas y plazos específicos",
      ],
      en: [
        "Not clear: I don't know where to start",
        "I have a vague idea, but nothing concrete",
        "Pretty clear, with some defined goals",
        "Very clear, with specific metrics and deadlines",
      ],
    },
  },
  {
    cat: "disposicion",
    q: {
      es: "¿Cuánto estás dispuesto a cambiar hoy para lograr esos resultados?",
      en: "How willing are you to change today to achieve those results?",
    },
    opts: {
      es: [
        "No estoy listo: hay demasiados obstáculos ahora mismo",
        "Dispuesto a hacer cambios pequeños y graduales",
        "Dispuesto a hacer cambios reales y sostenibles",
        "Completamente comprometido: empiezo hoy",
      ],
      en: [
        "I'm not ready: too many obstacles right now",
        "Willing to make small, gradual changes",
        "Willing to make real, sustainable changes",
        "Fully committed: I start today",
      ],
    },
  },
];

const TOTAL = QUESTIONS.length;

/* Serializa SIEMPRE en ES (el equipo comercial lee uniforme);
   la primera línea registra el idioma del visitante */
function buildNotes(lang: Lang, answers: number[]): string {
  return (
    `Assessment ON (${lang})\n` +
    QUESTIONS.map(
      (q, i) =>
        `${CATEGORIES[q.cat].es}: ${q.q.es} -> ${q.opts.es[answers[i]] ?? ""}`
    ).join("\n")
  );
}

export default function Assessment() {
  const { lang } = useLang();
  const es = lang === "es";

  /* -1 = intro (hero), 0..11 = preguntas, 12 = contacto */
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>(() =>
    Array(TOTAL).fill(-1)
  );
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  function pick(qIdx: number, optIdx: number) {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
    /* Avance automático suave; 250ms deja ver la selección */
    advanceTimer.current = window.setTimeout(() => {
      setStep((s) => (s < TOTAL ? s + 1 : s));
    }, 250);
  }

  function goBack() {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      /* value de la option = "dial|ISO" (varios países comparten +1);
         el payload lleva solo el dial, como el LeadForm de sede */
      const dial = String(data.get("dial")).split("|")[0];
      const res = await fetch(
        (import.meta.env.VITE_API_URL ?? "http://localhost:8788") + "/leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            phone: `${dial} ${String(data.get("phone")).trim()}`,
            notes: buildNotes(lang, answers),
          }),
        }
      );
      if (!res.ok) throw new Error("Lead request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const panelStyle: React.CSSProperties = {
    maxWidth: "100%",
    marginTop: "2rem",
    padding: "clamp(2rem, 4vw, 3rem)",
    borderRadius: "var(--r-card, 8px)",
    background: "var(--glass)",
    border: "1px solid var(--hairline)",
    backdropFilter: "blur(10px)",
  };

  const backLinkStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    marginTop: "1.6rem",
    padding: "0.6rem 0.2rem",
    fontSize: "0.85rem",
    color: "var(--c-faint)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  };

  const progressLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-label)",
    fontSize: "0.75rem",
    letterSpacing: "var(--track-label)",
    textTransform: "uppercase",
    color: "var(--c-faint)",
  };

  const question = step >= 0 && step < TOTAL ? QUESTIONS[step] : null;

  return (
    <div>
      {/* Estilos del flujo: hover/selected de opciones + fade por paso.
          prefers-reduced-motion: sin animación (regla dura del sitio). */}
      <style>{`
        .as-option {
          display: block;
          width: 100%;
          text-align: left;
          background: var(--glass);
          border: 1px solid var(--hairline);
          border-radius: var(--r-control);
          padding: 0.95rem 1.15rem;
          min-height: 44px;
          color: var(--c-mist);
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.45;
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition), color var(--transition);
        }
        .as-option:hover { border-color: var(--line-accent-strong); background: var(--glass-hover); }
        .as-option.selected { border-color: var(--c-yellow); color: var(--c-white); }
        .as-step { animation: asFade 0.24s ease both; }
        @keyframes asFade { from { opacity: 0; } to { opacity: 1; } }
        .as-bar-fill { transition: width 0.25s ease; }
        @media (prefers-reduced-motion: reduce) {
          .as-step { animation: none; }
          .as-bar-fill { transition: none; }
          .as-option { transition: none; }
        }
      `}</style>

      <Nav />

      {step === -1 ? (
        /* ============ INTRO: hero corto sobre lona negra ============ */
        <header className="hero hero-inner hero-compact">
          <div className="hero-content">
            <span className="day-marker">
              {es ? "Assessment · 2 minutos" : "Assessment · 2 minutes"}
            </span>
            <h1 className="hero-title">
              {es
                ? "¿Qué está frenando tu progreso?"
                : "What's holding your progress back?"}
            </h1>
            <p className="hero-sub">
              {es
                ? "12 preguntas. Al final te contactamos por WhatsApp con una recomendación de tu coach."
                : "12 questions. At the end we reach out on WhatsApp with a recommendation from your coach."}
            </p>
            <div className="hero-ctas">
              {/* CTA de arranque, no de compra: sin btn-attn */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(0)}
              >
                {es ? "Empezar" : "Start"}
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* ============ FLUJO: una pregunta por paso ============ */
        <section
          className="section"
          style={{ paddingTop: "var(--hero-pad-top)", minHeight: "72svh" }}
        >
          <div className="section-inner" style={{ maxWidth: "40rem" }}>
            {status === "success" ? (
              /* ============ ÉXITO ============ */
              <div className="as-step" style={{ paddingTop: "2rem" }}>
                <div style={{ ...panelStyle, marginTop: 0 }} aria-live="polite">
                  <div className="method-name" style={{ marginTop: 0 }}>
                    {es
                      ? "Listo. Te escribiremos por WhatsApp."
                      : "Done. We'll reach out on WhatsApp."}
                  </div>
                  <p className="method-desc" style={{ marginTop: "0.9rem" }}>
                    {es
                      ? "Mientras tanto, conoce 54D ON: el método completo en tu bolsillo, con 7 días gratis."
                      : "In the meantime, explore 54D ON: the complete method in your pocket, with 7 days free."}
                  </p>
                  <Link
                    to="/on"
                    className="btn btn-primary"
                    style={{ marginTop: "1.6rem" }}
                  >
                    {es ? "Conoce 54D ON" : "Explore 54D ON"}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Progreso: label + barra fina */}
                <div style={{ paddingTop: "1rem" }}>
                  {question && (
                    <div style={progressLabelStyle}>
                      {es
                        ? `Pregunta ${step + 1} de ${TOTAL}`
                        : `Question ${step + 1} of ${TOTAL}`}
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    style={{
                      height: "3px",
                      marginTop: "0.7rem",
                      background: "var(--hairline)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="as-bar-fill"
                      style={{
                        height: "100%",
                        width: `${(Math.min(step, TOTAL) / TOTAL) * 100}%`,
                        background: "var(--c-yellow)",
                      }}
                    />
                  </div>
                </div>

                {question ? (
                  /* ---------- Paso de pregunta ---------- */
                  <div key={step} className="as-step" style={{ marginTop: "2.6rem" }}>
                    <span className="day-marker">
                      {CATEGORIES[question.cat][lang]}
                    </span>
                    <h2
                      className="section-title"
                      style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
                    >
                      {question.q[lang]}
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gap: "0.7rem",
                        marginTop: "2rem",
                      }}
                    >
                      {question.opts[lang].map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          className={
                            answers[step] === i
                              ? "as-option selected"
                              : "as-option"
                          }
                          onClick={() => pick(step, i)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {step > 0 && (
                      <button type="button" style={backLinkStyle} onClick={goBack}>
                        {es ? "Anterior" : "Back"}
                      </button>
                    )}
                  </div>
                ) : (
                  /* ---------- Paso final: nombre + WhatsApp ---------- */
                  <div key="contact" className="as-step" style={{ marginTop: "2.6rem" }}>
                    <span className="day-marker">
                      {es ? "Último paso" : "Last step"}
                    </span>
                    <h2
                      className="section-title"
                      style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
                    >
                      {es
                        ? "¿A dónde te enviamos el resultado?"
                        : "Where do we send your result?"}
                    </h2>
                    <form onSubmit={handleSubmit} style={panelStyle}>
                      <div className="field">
                        <label htmlFor="as-name">{es ? "Nombre" : "Name"}</label>
                        <input
                          id="as-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder={es ? "Tu nombre completo" : "Your full name"}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="as-phone">WhatsApp</label>
                        <div style={{ display: "flex", gap: "0.6rem" }}>
                          <select
                            name="dial"
                            aria-label={es ? "Código de país" : "Country code"}
                            defaultValue="+1|US"
                            style={{ flex: "0 0 auto", width: "8.6rem" }}
                          >
                            <optgroup label={es ? "Frecuentes" : "Frequent"}>
                              {FREQUENT_ISO.map((iso) => {
                                const c = DIAL_CODES.find((d) => d[0] === iso);
                                if (!c) return null;
                                return (
                                  <option key={`f-${c[0]}`} value={`${c[1]}|${c[0]}`}>
                                    {isoFlag(c[0])} {c[1]} {es ? c[3] : c[2]}
                                  </option>
                                );
                              })}
                            </optgroup>
                            <optgroup label={es ? "Todos los países" : "All countries"}>
                              {DIAL_CODES.filter(
                                (c) =>
                                  !(FREQUENT_ISO as readonly string[]).includes(
                                    c[0]
                                  )
                              )
                                .sort((a, b) =>
                                  (es ? a[3] : a[2]).localeCompare(
                                    es ? b[3] : b[2],
                                    lang
                                  )
                                )
                                .map((c) => (
                                  <option key={c[0]} value={`${c[1]}|${c[0]}`}>
                                    {isoFlag(c[0])} {c[1]} {es ? c[3] : c[2]}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          <input
                            id="as-phone"
                            name="phone"
                            type="tel"
                            required
                            autoComplete="tel-national"
                            inputMode="tel"
                            placeholder={es ? "Tu número" : "Your number"}
                            style={{ flex: 1, minWidth: 0 }}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={status === "sending"}
                        style={{
                          width: "100%",
                          opacity: status === "sending" ? 0.6 : 1,
                        }}
                      >
                        {status === "sending"
                          ? es
                            ? "Enviando…"
                            : "Sending…"
                          : es
                            ? "Enviar y ver mi recomendación"
                            : "Send and see my recommendation"}
                      </button>
                      {status === "error" && (
                        <p
                          role="alert"
                          aria-live="polite"
                          style={{
                            marginTop: "1rem",
                            fontSize: "0.9rem",
                            color: "var(--c-red)",
                          }}
                        >
                          {es
                            ? "No pudimos enviar tus respuestas. Intenta de nuevo."
                            : "We couldn't send your answers. Try again."}
                        </p>
                      )}
                      <p
                        style={{
                          marginTop: "1.1rem",
                          fontSize: "0.75rem",
                          lineHeight: 1.5,
                          color: "var(--c-faint)",
                        }}
                      >
                        {es
                          ? "Tus datos son tuyos. Sin spam."
                          : "Your data is yours. No spam."}
                      </p>
                    </form>
                    <button type="button" style={backLinkStyle} onClick={goBack}>
                      {es ? "Anterior" : "Back"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
