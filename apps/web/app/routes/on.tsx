import { useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/on";
import { Nav, Footer, useReveal } from "../components/site";
import { AppStoreBadges } from "../components/badges";
import { StickyCta } from "../components/sticky-cta";
import { asset } from "../lib/asset";
import { startCheckout } from "../lib/attribution";
import { useLang, type Lang } from "../lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D ON: The 54-Day Method, Online with a Coach" },
    {
      name: "description",
      content:
        "Thirteen real programs in the 54D On app: daily training, nutrition protocols, and a real coach who follows you. Try it free for 7 days.",
    },
  ];
}

/* ============ Contenido ============ */

const INCLUDES = [
  {
    num: "01",
    name: "Daily training",
    desc: "Progressive video sessions designed by coaches, not by an algorithm. With whatever you have at home.",
  },
  {
    num: "02",
    name: "Nutritional protocol",
    desc: "Built for your body and your goal from day 1. No generic diets: what you eat is part of the program.",
  },
  {
    num: "03",
    name: "Community chat",
    desc: "You train alone. You're not alone. A global community chasing the same thing you are.",
  },
  {
    num: "04",
    name: "Coach follow-up",
    desc: "Real coaching over chat. On 54D ON and Step 2 it's unlimited and fully personalized.",
  },
];

/* Programas reales: PROGRAMS_ON.md + precios de store.54d.com/packs
   (verificados 25/07/2026). oneTime = precio de compra individual en USD;
   sin oneTime = solo disponible dentro de la membresía. */
type Program = {
  num: string;
  name: string;
  slug: string; // landing /programs/{slug} (PROGRAM_LANDINGS.md)
  line: string;
  equipment: string;
  intensity: string;
  audience: string;
  tag?: string;
  followUp?: boolean;
  duration: string;
  oneTime?: number;
  priceId?: string;
  startNote?: string;
};

/* Tiers reales de la membresía (store.54d.com/packs, 25/07/2026).
   El precio POR MES es el protagonista: el total facturado va como
   nota (MEMBERSHIP_SALES §3.2). Orden del stack: featured al medio.
   "Cancel anytime" vive en la riskline bajo cada CTA, no se triplica.
   Stripe PRICE_IDs pendientes de las keys del cliente. */
type MembershipTier = {
  priceId: string;
  plan: Record<Lang, string>;
  perMonth: number;
  regularPerMonth: number;
  billed: Record<Lang, string>;
  featured?: boolean;
  photo: string;
  photoAlt: string;
  /** objectPosition de la franja de 120px: encuadre que no decapite rostros */
  photoPos: string;
  tagline: Record<Lang, string>;
};
const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    priceId: "PENDING_membership_monthly",
    plan: { en: "Monthly", es: "Mensual" },
    perMonth: 54,
    regularPerMonth: 99,
    billed: { en: "Billed monthly", es: "Facturación mensual" },
    photo: "images/hd2/spare-man-running.jpg",
    photoAlt: "Athlete running with visible effort on the 54D floor",
    photoPos: "center 33%",
    tagline: { en: "Start at your pace", es: "Empieza a tu ritmo" },
  },
  {
    priceId: "PENDING_membership_quarterly",
    plan: { en: "Quarterly", es: "Trimestral" },
    perMonth: 52,
    regularPerMonth: 89,
    billed: { en: "$156 every 3 months", es: "$156 cada 3 meses" },
    featured: true,
    photo: "images/hd/cg-effort-yellow-d.jpg",
    photoAlt: "Athlete grimacing with effort in front of the yellow 54D letter",
    photoPos: "center 36%",
    tagline: { en: "The full 54 days", es: "Los 54 días completos" },
  },
  {
    priceId: "PENDING_membership_yearly",
    plan: { en: "Yearly", es: "Anual" },
    perMonth: 49,
    regularPerMonth: 79,
    billed: { en: "$588 a year · lowest per month", es: "$588 al año · el mes más bajo" },
    photo: "images/hd2/blog-spin-smile.jpg",
    photoAlt: "Member smiling mid ride on a spin bike at 54D",
    photoPos: "center 32%",
    tagline: { en: "Make it your life", es: "Hazlo tu estilo de vida" },
  },
];

/* Punteos EXACTOS de la membresía (MEMBERSHIP_SALES §4), verbo primero.
   Se usan 5 de 6: el de guarantee se omite de la lista y vive como
   microcopy de riesgo junto a los CTA (§2). */
const MEMBERSHIP_POINTS: Record<Lang, { strong: string; rest: string }[]> = {
  en: [
    {
      strong: "Train every program",
      rest: ": all 13, including 54D ON, with 650+ recorded sessions",
    },
    {
      strong: "Get a real coach",
      rest: " in your corner: unlimited chat, corrections, and follow-up",
    },
    {
      strong: "Eat with a plan",
      rest: ": 12+ nutrition protocols and 120+ recipes built by the team",
    },
    {
      strong: "Start free",
      rest: ": 7 full days with everything unlocked before you pay a cent",
    },
    {
      strong: "Cancel in one click",
      rest: ": from your account, no calls, no retention tricks",
    },
  ],
  es: [
    {
      strong: "Entrena todos los programas",
      rest: ": los 13, incluido 54D ON, con 650+ sesiones grabadas",
    },
    {
      strong: "Ten un coach real",
      rest: " en tu esquina: chat ilimitado, correcciones y seguimiento",
    },
    {
      strong: "Come con un plan",
      rest: ": 12+ protocolos de nutrición y 120+ recetas creadas por el equipo",
    },
    {
      strong: "Empieza gratis",
      rest: ": 7 días completos con todo desbloqueado antes de pagar un centavo",
    },
    {
      strong: "Cancela en un clic",
      rest: ": desde tu cuenta, sin llamadas ni trucos de retención",
    },
  ],
};

const PROGRAMS: Program[] = [
  {
    num: "01",
    name: "54D ON",
    slug: "54d-on",
    tag: "Signature",
    line: "The signature program. 54 days to lose fat, build muscle, and rebuild your habits.",
    equipment: "Elastic bands suggested",
    intensity: "High",
    audience: "The full transformation, start to finish",
    followUp: true,
    duration: "9 weeks",
    oneTime: 385,
    priceId: "PENDING_54d-on_onetime",
    startNote: "Starts Mondays",
  },
  {
    num: "02",
    name: "Step 2",
    slug: "step-2",
    line: "You finished 54D ON. This is what comes after.",
    equipment: "Elastic bands suggested",
    intensity: "Extreme",
    audience: "54D ON graduates and advanced athletes",
    followUp: true,
    duration: "9 weeks",
    oneTime: 400,
    priceId: "PENDING_step-2_onetime",
  },
  {
    num: "03",
    name: "Emergency Kit",
    slug: "emergency-kit",
    tag: "Most popular",
    line: "Two weeks. Up to 4 pounds down. Our most popular program.",
    equipment: "Resistance bands needed",
    intensity: "High",
    audience: "Fast fat loss on a deadline",
    duration: "14 days",
    oneTime: 39,
    priceId: "PENDING_emergency-kit_onetime",
  },
  {
    num: "04",
    name: "Max Burn",
    slug: "max-burn",
    line: "Thirty minutes a day, built to burn. Nothing decorative about it.",
    equipment: "Resistance bands needed",
    intensity: "High",
    audience: "Accelerated fat loss in short sessions",
    duration: "14 days",
    oneTime: 39,
    priceId: "PENDING_max-burn_onetime",
  },
  {
    num: "05",
    name: "Reset 7",
    slug: "reset-7",
    line: "Don't let four days of excess define the next four months. Seven days to correct course.",
    equipment: "Elastic bands suggested",
    intensity: "Full body work, short format",
    audience: "Getting back on track after you fell off",
    duration: "7 days",
    oneTime: 19,
    priceId: "PENDING_reset-7_onetime",
  },
  {
    num: "06",
    name: "First Move",
    slug: "first-move",
    line: "The first step. Low impact, daily discipline, zero assumptions.",
    equipment: "None",
    intensity: "Low impact",
    audience: "Beginners, sedentary starters, and advanced ages",
    duration: "14 days",
    oneTime: 39,
    priceId: "PENDING_first-move_onetime",
  },
  {
    num: "07",
    name: "Full Body",
    slug: "full-body",
    line: "Don't do things halfway. Tone and strengthen every area of the body.",
    equipment: "Resistance bands needed",
    intensity: "Medium, mixed training",
    audience: "Overall conditioning, head to toe",
    duration: "4 weeks",
    oneTime: 95,
    priceId: "PENDING_full-body_onetime",
  },
  {
    num: "08",
    name: "Lower Body",
    slug: "lower-body",
    line: "Turn on the power in your lower half.",
    equipment: "Resistance bands needed",
    intensity: "Focused strength work",
    audience: "Thighs and glutes",
    duration: "9 weeks",
    oneTime: 185,
    priceId: "PENDING_lower-body_onetime",
  },
  {
    num: "09",
    name: "Upper Body",
    slug: "upper-body",
    line: "Strong arms. A back that shows the work.",
    equipment: "Resistance bands needed",
    intensity: "Focused strength work",
    audience: "Arm and back strength and definition",
    duration: "9 weeks",
    oneTime: 185,
    priceId: "PENDING_upper-body_onetime",
  },
  {
    num: "10",
    name: "Booty on Fire",
    slug: "booty-on-fire",
    line: "Glute work that earns the name.",
    equipment: "Resistance bands needed",
    intensity: "Targeted, high effort",
    audience: "Maximum glute results in less time",
    duration: "14 days",
    oneTime: 39,
    priceId: "PENDING_booty-on-fire_onetime",
  },
  {
    num: "11",
    name: "Runners 5K",
    slug: "runners-5k",
    line: "Your first 5K, or a faster one.",
    equipment: "Your running shoes",
    intensity: "Beginner, intermediate, or advanced tracks",
    audience: "First-time and short-distance runners",
    duration: "Self-paced",
  },
  {
    num: "12",
    name: "Runners 10K",
    slug: "runners-10k",
    line: "The next distance. Take it seriously.",
    equipment: "Your running shoes",
    intensity: "Intermediate and advanced tracks",
    audience: "Runners moving up to medium distance",
    duration: "Self-paced",
  },
  {
    num: "13",
    name: "Runner 21K",
    slug: "runners-21k",
    line: "The half marathon. Prepare like you mean it.",
    equipment: "Your running shoes",
    intensity: "Single advanced track",
    audience: "Long-distance runners pushing their limit",
    duration: "Self-paced",
  },
];

/* Features verificadas de la app (APP_INFO.md / COPY_V3.md seccion 4) */
const APP_FEATURES = [
  {
    name: "A real coach, every day",
    desc: "Guidance, corrections, and daily personalized follow-up from a human.",
  },
  {
    name: "A 360° plan built for you",
    desc: "Your level, your goals, your life.",
  },
  {
    name: "On-demand and live workouts",
    desc: "Dozens of programs: strength, cardio, mobility, Pilates, yoga, wellness.",
  },
  {
    name: "Nutrition built in",
    desc: "Plans and tools built for energy, focus, and consistency.",
  },
  {
    name: "Apple Health and Apple Watch",
    desc: "Activity, energy, and heart rate, shared with your coach. iOS only.",
  },
];

const STEPS = [
  {
    day: "Step 01",
    title: "Activate your 7-day free trial",
    desc: "No cost, no commitment. Full access from minute one: training, nutrition, and your coach.",
  },
  {
    day: "Step 02",
    title: "Open the app and start Day 1",
    desc: "Everything runs in the 54D On app: your training, your nutrition protocol, and the chat where your coach introduces themselves. Your plan adjusts to your body, your goal, and what you have at home.",
  },
  {
    day: "Step 03",
    title: "On day 8, you decide",
    desc: "If you stay, your transformation is already moving. If it's not for you, cancel in one click and pay nothing.",
  },
  {
    day: "Week by week",
    title: "The program tightens with you",
    desc: "Intensity rises every week and your protocol adjusts to your results. Your coach reviews your week, corrects you, and demands more. 54 days later you don't finish a challenge. You finish someone new.",
  },
];

const VS_APPS: [string, string, string][] = [
  ["Training", "Library workouts, the same for everyone", "Progressive sessions designed by coaches"],
  ["Nutrition", "A generic calorie counter", "A protocol built for your body and your goal"],
  ["Coaching", "Automated notifications", "A real coach who writes to you every day"],
  ["Structure", "An endless membership, no finish line", "Programs with a start. And an end."],
  ["If you miss a day", "Nothing happens. No one notices", "Your coach notices. And writes to you."],
];

const VS_STUDIOS: [string, string, string][] = [
  ["What it is", "The 54-day digital program, coached through the 54D On app", "The flagship experience: the method in person, end to end"],
  ["Your team", "A real coach over daily chat", "A dedicated team on the floor: coaches, nutritionist, physiotherapist"],
  ["How you join", "Start today with 7 days free", "By application: a consultation, then your Generation's start date"],
  ["Your group", "A global online community", "Your Generation: limited places, one start date, 54 days together"],
  ["Where", "Wherever you are, with what you have", "Five studios: Miami, Mexico City, Bogotá"],
  ["The commitment", "A subscription you control, from $54 a month", "A private-client level program, discussed in your consultation"],
];

const FAQ: Record<Lang, { q: string; a: string }[]> = {
  en: [
    {
      q: "Should I get the membership or buy one program?",
      a: "The membership includes every program, unlimited coaching, and the community, and starts with a free week: it's the way to go if you want the full method or aren't sure where to start. Buying a single program makes sense when you want exactly one run, one payment, no subscription. Same training, same coach, either way.",
    },
    {
      q: "Which program should I start with?",
      a: "If you want the full transformation, start with 54D ON: it's the signature program. If you've never trained, start with First Move. If you're coming back after a rough patch, Reset 7. With the membership you can switch or enroll in more than one at a time.",
    },
    {
      q: "Do I need equipment or prior experience?",
      a: "No. Most programs use elastic or resistance bands at most, and First Move needs nothing at all. You start at your level, and intensity rises week by week, with you.",
    },
    {
      q: "Is the coach a real person?",
      a: "Yes. Not a bot, not an automated notification: a coach from the 54D team who reviews your progress, corrects you, and writes to you every day.",
    },
    {
      q: "How much time do I need each day?",
      a: "Sessions are designed to be completed in under an hour. What the method asks of you isn't time. It's consistency.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. The first 7 days are free: cancel before day 8 and you pay nothing. After that, you cancel straight from your account: no calls, no tricks.",
    },
    {
      q: "Does it work in my country?",
      a: "54D ON works wherever you are: the United States, Mexico, Colombia, or anywhere with a connection. All you need is your phone.",
    },
  ],
  es: [
    {
      q: "¿Me conviene la membresía o comprar un solo programa?",
      a: "La membresía incluye todos los programas, coaching ilimitado y la comunidad, y empieza con una semana gratis: es el camino si quieres el método completo o no sabes por dónde empezar. Comprar un solo programa tiene sentido cuando quieres exactamente un ciclo, un pago, sin suscripción. Mismo entrenamiento, mismo coach, en ambos casos.",
    },
    {
      q: "¿Con qué programa empiezo?",
      a: "Si quieres la transformación completa, empieza con 54D ON: es el programa insignia. Si nunca has entrenado, empieza con First Move. Si vuelves después de una mala racha, Reset 7. Con la membresía puedes cambiar o inscribirte en más de uno a la vez.",
    },
    {
      q: "¿Necesito equipo o experiencia previa?",
      a: "No. La mayoría de los programas usan como máximo bandas elásticas o de resistencia, y First Move no necesita nada. Empiezas en tu nivel, y la intensidad sube semana a semana, contigo.",
    },
    {
      q: "¿El coach es una persona real?",
      a: "Sí. No es un bot ni una notificación automática: es un coach del equipo 54D que revisa tu progreso, te corrige y te escribe todos los días.",
    },
    {
      q: "¿Cuánto tiempo necesito al día?",
      a: "Las sesiones están diseñadas para completarse en menos de una hora. Lo que el método te pide no es tiempo. Es constancia.",
    },
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Sí. Los primeros 7 días son gratis: cancela antes del día 8 y no pagas nada. Después, cancelas directo desde tu cuenta: sin llamadas, sin trucos.",
    },
    {
      q: "¿Funciona en mi país?",
      a: "54D ON funciona donde estés: Estados Unidos, México, Colombia o cualquier lugar con conexión. Solo necesitas tu teléfono.",
    },
  ],
};

/* ============ Estilos puntuales (tablas, lista editorial, app) ============ */

const tableWrap: CSSProperties = {
  marginTop: "var(--space-block)",
  borderRadius: "var(--r-card, 8px)",
  border: "1px solid var(--hairline)",
  background: "var(--glass)",
  backdropFilter: "blur(10px)",
  overflowX: "auto",
};
/* min-width vive en .cmp-table (app.css): ≤640px la tabla se re-apila
   por fila en vez de scrollear */
const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.98rem",
  lineHeight: 1.5,
};
const th: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-eyebrow, 0.22em)",
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
  letterSpacing: "var(--track-label, 0.14em)",
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

/* Lista editorial de programas: filas duras con hairline, sin cards.
   El layout de fila, meta y precio vive en .prog-row/.prog-meta/.prog-price
   (app.css) para poder responder a ≤640px — FIXES_V5 §4 / MOBILE_COMMERCE F4. */
const progHead: CSSProperties = {
  flex: "0 1 17rem",
  minWidth: "13rem",
};
const progNum: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: "0.8rem",
  letterSpacing: "var(--track-label, 0.12em)",
  color: "var(--c-faint)",
};
const progName: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "clamp(1.35rem, 2.4vw, 1.7rem)",
  lineHeight: 1.05,
  color: "var(--c-white)",
  marginTop: "0.35rem",
};
const progTag: CSSProperties = {
  display: "inline-block",
  marginTop: "0.6rem",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-eyebrow, 0.22em)",
  color: "var(--c-yellow)",
  border: "1px solid var(--line-accent, rgba(255, 210, 0, 0.3))",
  borderRadius: "var(--r-control, 2px)",
  padding: "0.3rem 0.6rem",
};
const progBody: CSSProperties = {
  flex: "1 1 24rem",
  minWidth: "16rem",
};
const progLine: CSSProperties = {
  fontSize: "1.05rem",
  lineHeight: 1.55,
  color: "var(--c-white)",
};
const progMeta: CSSProperties = {
  marginTop: "0.6rem",
  fontSize: "0.88rem",
  lineHeight: 1.7,
  color: "var(--c-mist)",
};
const metaKey: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
  color: "var(--c-faint)",
  marginRight: "0.4rem",
};
const metaDot: CSSProperties = {
  color: "var(--c-faint)",
  margin: "0 0.6rem",
};
const progFollowUp: CSSProperties = {
  display: "block",
  marginTop: "0.5rem",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
  color: "var(--c-yellow)",
};
const progDuration: CSSProperties = {
  fontFamily: "var(--font-label)",
  fontWeight: 700,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
  color: "var(--c-faint)",
};
const progAmount: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "1.5rem",
  lineHeight: 1,
  color: "var(--c-white)",
};
const progPriceNote: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--c-faint)",
};
/* Badge "Best value" de la card destacada */
const tierBadge: CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  fontFamily: "var(--font-label)",
  fontWeight: 700,
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-label, 0.14em)",
  color: "var(--c-black)",
  background: "var(--c-yellow)",
  borderRadius: "var(--r-control)",
  padding: "0.3rem 0.6rem",
};
/* ============ Membresía mini-pitch (MEMBERSHIP_SALES §2) ============
   plans-split 5/7 replicado inline: flex-wrap apila en pantallas angostas
   (pitch primero). check-list y btn-riskline replican §1.2 y §3.4. */
const membSplit: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "stretch",
  gap: "var(--space-block)",
};
const membPitch: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  flex: "1 1 20rem",
  minWidth: 0,
  minHeight: "26rem",
  display: "flex",
  borderRadius: "var(--r-card, 8px)",
  border: "1px solid var(--hairline)",
  background: "var(--c-ink)",
};
const membPitchImg: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  filter: "saturate(0.82) contrast(1.05)",
};
/* Veil negro 78%: la foto es contexto, los punteos mandan (§2) */
const membPitchVeil: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(7, 7, 7, 0.78)",
};
const membPitchInner: CSSProperties = {
  position: "relative",
  zIndex: 1,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "clamp(1.8rem, 3.5vw, 2.8rem)",
};
const membStack: CSSProperties = {
  flex: "1.4 1 24rem",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "1.1rem",
};
const checkList: CSSProperties = {
  listStyle: "none",
  margin: "1.6rem 0 0",
  padding: 0,
  display: "grid",
  gap: "0.55rem",
};
const checkItem: CSSProperties = {
  display: "flex",
  gap: "0.65rem",
  fontSize: "0.95rem",
  lineHeight: 1.45,
  color: "var(--c-mist)",
};
/* ✓ amarillo sólido, sin círculo, sin fondo (nada de pills) */
const checkTick: CSSProperties = {
  color: "var(--c-yellow)",
  fontWeight: 700,
  flex: "none",
};
const checkStrong: CSSProperties = { color: "var(--c-white)", fontWeight: 600 };
const membRisk: CSSProperties = {
  marginTop: "auto",
  paddingTop: "1.6rem",
  fontSize: "0.8rem",
  color: "var(--c-faint)",
};
/* btn-riskline (§3.4): microcopy de riesgo PEGADO al botón */
const riskline: CSSProperties = {
  display: "block",
  marginTop: "0.55rem",
  fontSize: "0.72rem",
  letterSpacing: "0.02em",
  textAlign: "center",
  color: "var(--c-faint)",
};
/* Card compacta: plan+precio a la izquierda, CTA a la derecha; wrap en mobile */
const tierRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1.1rem 2.2rem",
};
const tierInfo: CSSProperties = { flex: "1 1 13rem", minWidth: 0 };
const tierAction: CSSProperties = { flex: "1 1 12rem", minWidth: 0 };
const tierStrike: CSSProperties = {
  fontSize: "0.5em",
  color: "var(--c-faint)",
  fontWeight: 500,
  marginRight: "0.4em",
};
const tierPerMonth: CSSProperties = {
  fontSize: "0.38em",
  fontWeight: 700,
  color: "var(--c-mist)",
  marginLeft: "0.15em",
};
/* Nombre de programa → landing /programs/{slug}: dos caminos por fila */
const progNameLink: CSSProperties = { color: "inherit", textDecoration: "none" };
const progNameArrow: CSSProperties = {
  color: "var(--c-yellow)",
  fontSize: "0.62em",
  marginLeft: "0.5rem",
  verticalAlign: "0.14em",
};
const photoCaption: CSSProperties = {
  display: "flex",
  gap: "0.6rem",
  alignItems: "center",
  paddingTop: "0.7rem",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "var(--track-eyebrow, 0.22em)",
  color: "var(--c-faint)",
};
const captionTick: CSSProperties = {
  width: "18px",
  height: "2px",
  background: "var(--c-yellow)",
  flex: "none",
};
/* QUIET v6b: acentos de display en blanco; el amarillo quedo en CTAs,
   reglas de eyebrow y micro-marcas */
const solidAccent: CSSProperties = { color: "inherit" };

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
    /* .table-wrap: affordance de scroll horizontal (fade mask 88%, solo
       donde hay scroll); .cmp-table re-apila por fila en ≤640px */
    <div style={tableWrap} className="table-wrap">
      <table style={table} className="cmp-table">
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

/** Telefono con captura REAL de la app 54D ON (screenshots del cliente,
    06/08/2026): la sesion del dia con coach. El marco sigue siendo CSS. */
function AppPhone() {
  return (
    <div
      style={{
        width: "min(290px, 74vw)",
        aspectRatio: "9 / 19.2",
        margin: "0 auto",
        borderRadius: "42px",
        border: "1px solid var(--hairline)",
        background: "#101010",
        padding: "10px",
        boxShadow: "0 40px 90px rgba(0, 0, 0, 0.6)",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "84px",
          height: "24px",
          borderRadius: "999px",
          background: "#070707",
          zIndex: 2,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "32px",
          overflow: "hidden",
          background: "#0b0b0b",
        }}
      >
        <img
          src={asset("images/app/on-workout-coach.jpg")}
          alt="54D ON app: today's strength session with your coach, ready to start"
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

/* ============ Página ============ */

export default function On() {
  const { lang } = useLang();
  const es = lang === "es";
  const incluye = useReveal();
  const membresia = useReveal();
  const programas = useReveal();
  const [busy, setBusy] = useState<string | null>(null);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);
  /* El error se ancla a la card/fila tapeada: aparece donde el usuario
     está mirando, no dos pantallas más abajo */
  const [errPlan, setErrPlan] = useState<string | null>(null);
  /* Colapso mobile del catálogo (≤900px vía CSS .prog-collapsed) */
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const buy = async (priceId: string) => {
    setBusy(priceId);
    setCheckoutErr(null);
    setErrPlan(null);
    try {
      await startCheckout(priceId);
    } catch (e) {
      /* Solo pasan los mensajes intencionales de startCheckout (503 de
         Stripe sin configurar); un fallo de red crudo ("Failed to fetch")
         cae al copy amable bilingue, igual que en /pricing */
      setCheckoutErr(
        e instanceof Error && e.message.startsWith("Payments are being connected")
          ? e.message
          : es
            ? "No pudimos iniciar el pago. Revisa tu conexión e intenta de nuevo en unos segundos."
            : "We couldn't start checkout. Check your connection and try again in a few seconds."
      );
      setErrPlan(priceId);
      setBusy(null);
    }
  };
  const app = useReveal();
  const pasos = useReveal();
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
          <img
            src={asset("images/hd2/blog-barbell-press.jpg")}
            alt="Athlete pressing a loaded barbell during a 54D strength session"
          />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">54D ON · Online</span>
          <h1 className="hero-title">
            {es ? "El método completo." : "The full method."}
            <br />
            <span className="accent">
              {es ? "Donde estés." : "Wherever you are."}
            </span>
          </h1>
          <p className="hero-sub">
            {es
              ? "El programa 54D completo en la app 54D On: tu entrenamiento, tu protocolo de nutrición y un coach real en tu esquina. Sin gimnasio, sin excusas de agenda."
              : "The full 54D program in the 54D On app: your training, your nutrition protocol, and a real coach in your corner. No gym, no scheduling excuses."}
          </p>
          {/* Un solo destino para la misma acción en toda la página:
              #membership (los precios viven acá mismo) */}
          <div className="hero-ctas">
            <a href="#membership" className="btn btn-primary">
              {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
            </a>
            <Link to="/studios" className="btn btn-ghost">
              {es ? "Explora los studios" : "Explore the studios"}
            </Link>
          </div>
        </div>
      </header>

      {/* ============ QUÉ INCLUYE ============ */}
      <section className="section">
        <div className="section-inner" ref={incluye.ref}>
          <div className={incluye.className}>
            <span className="day-marker">What's included</span>
            <div className="method-intro">
              <h2 className="section-title">
                The whole method. <span style={solidAccent}>No filler.</span>
              </h2>
              <p>
                54D ON is not a stripped-down version. It's the full program:
                training, nutrition, and a real coach who follows you.{" "}
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

      {/* ============ MEMBRESÍA (mini-pitch, MEMBERSHIP_SALES §2) ============
          Split 5/7: izquierda pitch con foto velada + punteos ✓, derecha los
          3 tiers compactos apilados con riskline bajo cada CTA. */}
      <section
        className="section"
        id="membership"
        style={{ scrollMarginTop: "5rem" }}
      >
        <div className="section-inner" ref={membresia.ref}>
          <div className={membresia.className}>
            <div style={membSplit}>
              <div style={membPitch}>
                <img
                  src={asset("images/studios/hallandale/class-under-letters.jpg")}
                  alt="Members training mid-class under the 54D letters at the Hallandale studio"
                  loading="lazy"
                  style={membPitchImg}
                />
                <div style={membPitchVeil} aria-hidden="true" />
                <div style={membPitchInner}>
                  <span className="day-marker">
                    {es ? "La membresía" : "The membership"}
                  </span>
                  <h2 className="section-title">
                    {es ? "Una membresía." : "One membership."}{" "}
                    <span style={solidAccent}>{es ? "Todo." : "Everything."}</span>
                  </h2>
                  {/* Punteos §4: verbo en blanco, resto en mist */}
                  <ul style={checkList}>
                    {MEMBERSHIP_POINTS[lang].map((pt) => (
                      <li style={checkItem} key={pt.strong}>
                        <span style={checkTick} aria-hidden="true">
                          ✓
                        </span>
                        <span>
                          <strong style={checkStrong}>{pt.strong}</strong>
                          {pt.rest}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p style={membRisk}>
                    {es
                      ? "Garantía de devolución de 30 días · pago seguro con Stripe"
                      : "30-day money-back guarantee · secure payment by Stripe"}
                  </p>
                </div>
              </div>
              <div style={membStack}>
                {MEMBERSHIP_TIERS.map((t) => (
                  <div
                    className={t.featured ? "pricing-card featured" : "pricing-card"}
                    key={t.priceId}
                    style={{ overflow: "hidden" }}
                  >
                    {/* Cabecera fotográfica del plan: cada tier con su
                        significado (arrancar / el esfuerzo / el largo plazo) */}
                    <div style={{ position: "relative", margin: "-2.2rem -1.9rem 1.4rem" }}>
                      <img
                        src={asset(t.photo)}
                        alt={t.photoAlt}
                        loading="lazy"
                        style={{
                          width: "100%",
                          maxWidth: "none",
                          height: "120px",
                          objectFit: "cover",
                          /* Encuadre por foto: la franja de 120px no corta rostros */
                          objectPosition: t.photoPos,
                          display: "block",
                          filter: "saturate(0.85) contrast(1.05)",
                        }}
                      />
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(7,7,7,0.1) 40%, rgba(7,7,7,0.82) 100%)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: "1.9rem",
                          bottom: "0.55rem",
                          fontFamily: "var(--font-label)",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          letterSpacing: "var(--track-label, 0.14em)",
                          textTransform: "uppercase",
                          color: "var(--c-mist)",
                        }}
                      >
                        {t.tagline[lang]}
                      </span>
                    </div>
                    {t.featured && (
                      <span style={tierBadge}>
                        {es ? "El más elegido" : "Most chosen"}
                      </span>
                    )}
                    <div style={tierRow}>
                      <div style={tierInfo}>
                        <div className="pricing-plan">{t.plan[lang]}</div>
                        <div className="pricing-price">
                          <s style={tierStrike}>${t.regularPerMonth}</s>
                          ${t.perMonth}
                          <span style={tierPerMonth}>
                            {es ? "/mes" : "/mo"}
                          </span>
                        </div>
                        <div className="pricing-period">{t.billed[lang]}</div>
                      </div>
                      <div style={tierAction}>
                        {/* UN primario por vista (QUIET v6): solo la featured;
                            los otros dos tiers van en ghost */}
                        <button
                          type="button"
                          className={
                            t.featured ? "btn btn-primary" : "btn btn-ghost"
                          }
                          style={{ marginTop: 0, width: "100%" }}
                          disabled={busy === t.priceId}
                          onClick={() => buy(t.priceId)}
                        >
                          {busy === t.priceId
                            ? es
                              ? "Abriendo el pago…"
                              : "Opening checkout…"
                            : es
                              ? "Empieza tu prueba gratis"
                              : "Start free trial"}
                        </button>
                        <span style={riskline}>
                          {es
                            ? "7 días gratis · cancela cuando quieras"
                            : "7 days free · cancel anytime"}
                        </span>
                      </div>
                    </div>
                    {/* El error vive DENTRO de la card tapeada */}
                    {checkoutErr && errPlan === t.priceId && (
                      <p
                        role="alert"
                        style={{
                          marginTop: "1rem",
                          fontSize: "0.88rem",
                          color: "var(--c-red)",
                        }}
                      >
                        {checkoutErr}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Cierre: un solo CTA secundario a /pricing + ancla a #programs */}
            <div
              style={{
                marginTop: "2.4rem",
                display: "flex",
                alignItems: "center",
                gap: "1.4rem",
                flexWrap: "wrap",
              }}
            >
              <Link to="/pricing" className="btn btn-ghost">
                {es ? "Compara los planes →" : "Compare plans →"}
              </Link>
              <span style={{ fontSize: "0.85rem", color: "var(--c-faint)" }}>
                {es ? "¿Prefieres pagar una sola vez?" : "Prefer to pay once?"}{" "}
                <a
                  href="#programs"
                  style={{ color: "var(--c-yellow)", textDecoration: "none" }}
                >
                  {es
                    ? "Cada programa de abajo también se vende por separado."
                    : "Every program below is also sold on its own."}
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROGRAMAS REALES (lista editorial) ============ */}
      <section
        className="section section-tight"
        id="programs"
        style={{ scrollMarginTop: "5rem" }}
      >
        <div className="section-inner" ref={programas.ref}>
          <div className={programas.className}>
            <span className="day-marker">Programs</span>
            <div className="method-intro">
              <h2 className="section-title">
                Thirteen programs. <span style={solidAccent}>Two ways in.</span>
              </h2>
              <p>
                All of them come with the membership. Or buy just the one you
                need: one payment, the full run, your coach included. Open any
                program for the full breakdown.
              </p>
            </div>
            {/* ≤900px: los programas 6-13 se pliegan tras el toggle (CSS
                .prog-collapsed); en desktop la lista entera sigue visible */}
            <div
              className={`prog-list${showAllPrograms ? "" : " prog-collapsed"}`}
              style={{ borderBottom: "1px solid var(--hairline)" }}
            >
              {PROGRAMS.map((p) => (
                <article className="prog-row" key={p.num}>
                  <div style={progHead}>
                    <span style={progNum}>{p.num}</span>
                    {/* Dos caminos por fila (PROGRAM_LANDINGS.md): el nombre
                        abre la landing del programa; el botón de abajo sigue
                        siendo checkout directo. Runners también linkean. */}
                    <h3 style={progName}>
                      <Link to={`/programs/${p.slug}`} style={progNameLink}>
                        {p.name}
                        <span aria-hidden="true" style={progNameArrow}>
                          →
                        </span>
                      </Link>
                    </h3>
                    {p.tag && <span style={progTag}>{p.tag}</span>}
                  </div>
                  <div style={progBody}>
                    <p style={progLine}>{p.line}</p>
                    {/* Pares key/valor en <span> propios: en ≤640px .prog-meta
                        pasa a grid apilado y los puntos se ocultan (F4) */}
                    <p style={progMeta} className="prog-meta">
                      <span style={metaKey}>Equipment</span>
                      <span>{p.equipment}</span>
                      <span
                        style={metaDot}
                        className="meta-dot"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <span style={metaKey}>Intensity</span>
                      <span>{p.intensity}</span>
                      <span
                        style={metaDot}
                        className="meta-dot"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <span style={metaKey}>For</span>
                      <span>{p.audience}</span>
                    </p>
                    {p.followUp && (
                      <span style={progFollowUp}>
                        Includes unlimited personalized follow-up
                      </span>
                    )}
                  </div>
                  <div className="prog-price">
                    <span style={progDuration}>{p.duration}</span>
                    {p.oneTime && p.priceId ? (
                      <>
                        <span style={progAmount}>${p.oneTime}</span>
                        {/* Target ≥44px: antes 168×35px con font 11.5px (F2) */}
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{
                            padding: "0.8rem 1.5rem",
                            fontSize: "0.8rem",
                            minHeight: "44px",
                            marginTop: "0.6rem",
                          }}
                          disabled={busy === p.priceId}
                          onClick={() => buy(p.priceId!)}
                        >
                          {busy === p.priceId ? "Opening…" : "Buy this program"}
                        </button>
                        <span style={progPriceNote}>one payment</span>
                        {/* El error de checkout aparece en la fila tapeada */}
                        {checkoutErr && errPlan === p.priceId && (
                          <span
                            role="alert"
                            style={{ fontSize: "0.78rem", color: "var(--c-red)" }}
                          >
                            {checkoutErr}
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={progPriceNote}>Membership only</span>
                    )}
                    {p.startNote && (
                      <span style={progPriceNote}>{p.startNote}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {!showAllPrograms && (
              <button
                type="button"
                className="btn btn-ghost prog-toggle"
                onClick={() => setShowAllPrograms(true)}
              >
                {es ? "Ver los 13 programas" : "Show all 13 programs"}
              </button>
            )}
            <div
              style={{
                marginTop: "2.4rem",
                display: "flex",
                alignItems: "center",
                gap: "1.4rem",
                flexWrap: "wrap",
              }}
            >
              <a href="#membership" className="btn btn-primary">
                {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
              </a>
              <span style={{ fontSize: "0.85rem", color: "var(--c-faint)" }}>
                {es
                  ? "¿No sabes cuál? La semana gratis los incluye todos."
                  : "Not sure which one? The free week includes them all."}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LA APP (vehículo de entrega del producto) ============ */}
      <section className="section">
        <div className="section-inner" ref={app.ref}>
          <div className={app.className}>
            <span className="day-marker">The app</span>
            <h2 className="section-title">
              Your whole program. <span style={solidAccent}>In your pocket.</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "clamp(2.5rem, 6vw, 5rem)",
                alignItems: "center",
                marginTop: "var(--space-block)",
              }}
            >
              <AppPhone />
              <div>
                {/* Sentence case (QUIET v6): las caps quedan solo en
                    eyebrows/metadata */}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)",
                    lineHeight: 1.05,
                    color: "var(--c-white)",
                  }}
                >
                  The method lives in the app.
                </h3>
                <p
                  style={{
                    marginTop: "0.9rem",
                    maxWidth: "34rem",
                    fontSize: "1.05rem",
                    lineHeight: 1.6,
                    color: "var(--c-mist)",
                  }}
                >
                  Training, nutrition, and a real coach in one place. Rated 4.9
                  on the App Store.
                </p>
                <ol style={{ margin: "1.8rem 0 2rem", padding: 0 }}>
                  {APP_FEATURES.map((f, i) => (
                    <li
                      key={f.name}
                      style={{
                        listStyle: "none",
                        display: "grid",
                        gridTemplateColumns: "2.8rem 1fr",
                        gap: "1rem",
                        alignItems: "baseline",
                        padding: "1rem 0",
                        borderTop: "1px solid var(--hairline)",
                        borderBottom:
                          i === APP_FEATURES.length - 1
                            ? "1px solid var(--hairline)"
                            : undefined,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          color: "var(--c-yellow)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong
                          style={{
                            display: "block",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "1rem",
                            textTransform: "uppercase",
                            color: "var(--c-white)",
                          }}
                        >
                          {f.name}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.92rem",
                            lineHeight: 1.5,
                            color: "var(--c-mist)",
                          }}
                        >
                          {f.desc}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <AppStoreBadges
                  appStoreUrl="https://apps.apple.com/us/app/54d-on/id1520445334"
                  googlePlayUrl="https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays"
                />
                <div
                  style={{
                    display: "flex",
                    gap: "2rem",
                    marginTop: "1.4rem",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "var(--track-label, 0.14em)",
                    color: "var(--c-faint)",
                  }}
                >
                  <span>
                    <b
                      style={{
                        color: "var(--c-yellow)",
                        fontFamily: "var(--font-display)",
                        fontVariantNumeric: "tabular-nums",
                        marginRight: "0.4rem",
                      }}
                    >
                      4.9
                    </b>
                    App Store
                  </span>
                  <span>
                    <b
                      style={{
                        color: "var(--c-yellow)",
                        fontFamily: "var(--font-display)",
                        fontVariantNumeric: "tabular-nums",
                        marginRight: "0.4rem",
                      }}
                    >
                      4.9
                    </b>
                    Google Play
                  </span>
                </div>
                <p style={{ marginTop: "1.2rem", fontSize: "0.85rem", color: "var(--c-faint)" }}>
                  The 54D On app is free to download. Your subscription unlocks
                  everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={pasos.ref}>
          <div className={pasos.className}>
            <span className="day-marker">How it works</span>
            <h2 className="section-title">
              Three steps and you're <span style={solidAccent}>in.</span>
            </h2>
            {/* Split foto/pasos: el celular con el coach en pantalla ES el
                producto (hd2, vertical 9:16) — protagonista junto a los pasos.
                El mockup CSS de la sección app queda intacto. */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "clamp(2.5rem, 6vw, 5rem)",
                /* start: la columna derecha nace a la altura de la izquierda
                   (reparto de canvas, lección .gen-split) */
                alignItems: "start",
                marginTop: "var(--space-block)",
              }}
            >
              <figure style={{ margin: 0 }}>
                <img
                  src={asset("images/hd2/on-phone-coach.jpg")}
                  alt="A member holding up a phone playing a 54D coach's video against the studio's yellow wall"
                  loading="lazy"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    objectPosition: "center 55%",
                    borderRadius: "var(--r-media, 2px)",
                    filter: "saturate(0.85) contrast(1.05)",
                  }}
                />
                <figcaption style={photoCaption}>
                  <span style={captionTick} aria-hidden="true" />
                  A real coach on your screen. That's the product.
                </figcaption>
              </figure>
              <div className="timeline" style={{ marginTop: 0 }}>
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
        </div>
      </section>

      {/* ============ DIFERENCIALES VS APPS GENÉRICAS ============ */}
      <section className="section">
        <div className="section-inner" ref={difApps.ref}>
          <div className={difApps.className}>
            <span className="day-marker">The difference</span>
            <h2 className="section-title">
              This is not <span style={solidAccent}>another app.</span>
            </h2>
            <p style={{ marginTop: "1.4rem", maxWidth: "38rem", fontSize: "1.05rem", lineHeight: 1.6, color: "var(--c-mist)" }}>
              Workout apps sell you access to content. 54D ON puts you inside a
              program with structure, a standard, and an end. The app is just
              the vehicle.
            </p>
            <CompareTable
              columns={["", "A generic app", "54D ON"]}
              rows={VS_APPS}
              accentCol={2}
            />
          </div>
        </div>
      </section>

      {/* ============ WHICH 54D: ON VS STUDIOS SIN IGUALAR VALOR ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={vsStudios.ref}>
          <div className={vsStudios.className}>
            <span className="day-marker">Which 54D</span>
            <h2 className="section-title">
              Which 54D is <span style={solidAccent}>for you?</span>
            </h2>
            {/* Texto y foto lado a lado: llena la mitad derecha vacía (on-desktop-2.png) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "clamp(2rem, 5vw, 4.5rem)",
                alignItems: "start",
                marginTop: "1.4rem",
              }}
            >
              <p style={{ maxWidth: "38rem", fontSize: "1.05rem", lineHeight: 1.6, color: "var(--c-mist)" }}>
                One method, two very different programs. 54D ON is your
                transformation, wherever you are, on your schedule. 54D Studios
                is the flagship: in person, by application, with a dedicated
                team. Neither is a lighter version of the other. They are built
                for different lives.
              </p>
              <figure style={{ margin: 0 }}>
                <img
                  src={asset("images/hd/cg-gym-wide.jpg")}
                  alt="Wide view of the 54D training floor, equipment set and ready"
                  loading="lazy"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "21 / 9",
                    objectFit: "cover",
                    objectPosition: "center 22%",
                    borderRadius: "var(--r-media, 2px)",
                    filter: "saturate(0.82) contrast(1.05)",
                  }}
                />
                <figcaption style={photoCaption}>
                  <span style={captionTick} aria-hidden="true" />
                  One method. Two very different ways to live it.
                </figcaption>
              </figure>
            </div>
            <CompareTable
              columns={["", "54D ON", "54D Studios"]}
              rows={VS_STUDIOS}
              accentCol={1}
            />
            {/* CTAs desiguales a proposito: ON a #membership, Studios a consulta */}
            <div className="hero-ctas" style={{ marginTop: "2rem" }}>
              <a href="#membership" className="btn btn-primary">
                {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
              </a>
              <Link to="/studios" className="btn btn-ghost">
                {es ? "Solicita una consulta" : "Request a consultation"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      {/* FIXES_V5 §3.2: único campo de gradiente de la página (bloom-ember pre-CTA) */}
      <section className="section bloom-ember">
        <div className="section-inner" ref={faq.ref}>
          <div className={faq.className}>
            <span className="day-marker">FAQ</span>
            <h2 className="section-title">
              {es ? (
                <>
                  Antes de <span style={solidAccent}>empezar.</span>
                </>
              ) : (
                <>
                  Before you <span style={solidAccent}>start.</span>
                </>
              )}
            </h2>
            {/* 2 columnas en desktop: mismo patrón que /pricing */}
            <div
              className="faq-list"
              style={{
                maxWidth: "none",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))",
                alignItems: "start",
              }}
            >
              {FAQ[lang].map((f) => (
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
          Los montos ($54/mes, $156/trim, $588/año) viven allá. PRECIO_PENDIENTE. */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              {es ? (
                <>
                  Tu Día 1 no necesita <span className="accent">gimnasio.</span>
                </>
              ) : (
                <>
                  Your Day 1 doesn't need <span className="accent">a gym.</span>
                </>
              )}
            </h2>
            <div className="hero-ctas">
              <a href="#membership" className="btn btn-primary">
                {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
              </a>
            </div>
            <p style={{ marginTop: "1.2rem", fontSize: "0.85rem", color: "var(--c-faint)" }}>
              {es
                ? "7 días gratis · cancela cuando quieras"
                : "7 days free · cancel anytime"}
            </p>
          </div>
        </div>
      </section>

      {/* Página de 15.458px sin CTA persistente → sticky compartida (FIXES_V5 §4) */}
      <StickyCta
        href="#membership"
        label={es ? "Empieza tu prueba gratis" : "Start free trial"}
      />

      <Footer />
    </div>
  );
}
