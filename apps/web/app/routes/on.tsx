import { useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/on";
import { Nav, Footer, useReveal } from "../components/site";
import { AppStoreBadges } from "../components/badges";
import { StickyCta } from "../components/sticky-cta";
import { asset } from "../lib/asset";
import { startCheckout } from "../lib/attribution";
import { useLang, resolveLang, type Lang } from "../lib/i18n";

export async function loader({ request }: Route.LoaderArgs) {
  return { lang: resolveLang(request) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const es = loaderData?.lang === "es";
  return [
    {
      title: es
        ? "54D ON: el método de 54 días, online y con coach"
        : "54D ON: The 54-Day Method, Online with a Coach",
    },
    {
      name: "description",
      content: es
        ? "Trece programas reales en la app 54D On: entrenamiento diario, protocolos de nutrición y un coach real que te sigue. Pruébalo gratis por 7 días."
        : "Thirteen real programs in the 54D On app: daily training, nutrition protocols, and a real coach who follows you. Try it free for 7 days.",
    },
  ];
}

/* ============ Contenido ============ */

const INCLUDES: {
  num: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    num: "01",
    name: { en: "Daily training", es: "Entrenamiento diario" },
    desc: {
      en: "Progressive video sessions designed by coaches, not by an algorithm. With whatever you have at home.",
      es: "Sesiones en video progresivas, diseñadas por coaches y no por un algoritmo. Con lo que tengas en casa.",
    },
  },
  {
    num: "02",
    name: { en: "Nutritional protocol", es: "Protocolo de nutrición" },
    desc: {
      en: "Built for your body and your goal from day 1. No generic diets: what you eat is part of the program.",
      es: "Creado para tu cuerpo y tu meta desde el día 1. Sin dietas genéricas: lo que comes es parte del programa.",
    },
  },
  {
    num: "03",
    name: { en: "Community chat", es: "Comunidad" },
    desc: {
      en: "You train alone. You're not alone. A global community chasing the same thing you are.",
      es: "Entrenas donde quieras, pero nunca a solas: una comunidad global persigue lo mismo que tú.",
    },
  },
  {
    num: "04",
    name: { en: "Coach follow-up", es: "Seguimiento del coach" },
    desc: {
      en: "Real coaching over chat. On 54D ON and Step 2 it's unlimited and fully personalized.",
      es: "Coaching real por chat. En 54D ON y Step 2 es ilimitado y totalmente personalizado.",
    },
  },
];

/* Programas reales: PROGRAMS_ON.md + precios de store.54d.com/packs
   (verificados 25/07/2026). oneTime = precio de compra individual en USD;
   sin oneTime = solo disponible dentro de la membresía. */
type Program = {
  num: string;
  name: string;
  slug: string; // landing /programs/{slug} (PROGRAM_LANDINGS.md)
  line: Record<Lang, string>;
  equipment: string;
  intensity: Record<Lang, string>;
  audience: string;
  tag?: Record<Lang, string>;
  followUp?: boolean;
  duration: Record<Lang, string>;
  oneTime?: number;
  priceId?: string;
  startNote?: Record<Lang, string>;
  /* Vitrina con imagen: la card usa images/programs/<slug>.jpg */
  kicker: Record<Lang, string>;
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
  photoAlt: Record<Lang, string>;
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
    photo: "images/programs/runners-21k.jpg",
    photoAlt: {
      en: "Runner training outdoors along the beachfront",
      es: "Corredor entrenando al aire libre frente a la playa",
    },
    photoPos: "center 35%",
    tagline: { en: "Start at your pace", es: "Empieza a tu ritmo" },
  },
  {
    priceId: "PENDING_membership_quarterly",
    plan: { en: "Quarterly", es: "Trimestral" },
    perMonth: 52,
    regularPerMonth: 89,
    billed: { en: "$156 every 3 months", es: "$156 cada 3 meses" },
    featured: true,
    photo: "images/programs/emergency-kit-wide.jpg",
    photoAlt: {
      en: "Athlete mid cardio drill on the official 54D ON set",
      es: "Atleta en pleno cardio en el set oficial de 54D ON",
    },
    photoPos: "center 25%",
    tagline: { en: "The full 54 days", es: "Los 54 días completos" },
  },
  {
    priceId: "PENDING_membership_yearly",
    plan: { en: "Yearly", es: "Anual" },
    perMonth: 49,
    regularPerMonth: 79,
    billed: { en: "$588 a year · lowest per month", es: "$588 al año · la mensualidad más baja" },
    photo: "images/programs/first-move-wide.jpg",
    photoAlt: {
      en: "Two members stretching together on the 54D ON set",
      es: "Dos miembros estirando juntos en el set de 54D ON",
    },
    photoPos: "center 30%",
    tagline: { en: "Make it your life", es: "Tu nuevo estilo de vida" },
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
      rest: " de tu lado: chat ilimitado, correcciones y seguimiento",
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
    kicker: { en: "The full transformation", es: "La transformación completa" },
    tag: { en: "Signature", es: "Insignia" },
    line: { en: "The signature program. 54 days to lose fat, build muscle, and rebuild your habits.", es: "El programa insignia. 54 días para bajar grasa, ganar músculo y reconstruir tus hábitos." },
    equipment: "Elastic bands suggested",
    intensity: { en: "High", es: "Alta" },
    audience: "The full transformation, start to finish",
    followUp: true,
    duration: { en: "9 weeks", es: "9 semanas" },
    oneTime: 385,
    priceId: "PENDING_54d-on_onetime",
    startNote: { en: "Starts Mondays", es: "Empieza los lunes" },
  },
  {
    num: "02",
    name: "Step 2",
    slug: "step-2",
    kicker: { en: "For 54D ON graduates", es: "Para graduados de 54D ON" },
    line: { en: "You finished 54D ON. This is what comes after.", es: "Terminaste 54D ON. Esto es lo que sigue." },
    equipment: "Elastic bands suggested",
    intensity: { en: "Extreme", es: "Extrema" },
    audience: "54D ON graduates and advanced athletes",
    followUp: true,
    duration: { en: "9 weeks", es: "9 semanas" },
    oneTime: 400,
    priceId: "PENDING_step-2_onetime",
  },
  {
    num: "03",
    name: "Emergency Kit",
    slug: "emergency-kit",
    kicker: { en: "Fat loss, fast", es: "Quema grasa, rápido" },
    tag: { en: "Most popular", es: "El más popular" },
    line: { en: "Two weeks. Up to 4 pounds down. Our most popular program.", es: "Dos semanas. Hasta 2 kilos menos. Nuestro programa más popular." },
    equipment: "Resistance bands needed",
    intensity: { en: "High", es: "Alta" },
    audience: "Fast fat loss on a deadline",
    duration: { en: "14 days", es: "14 días" },
    oneTime: 39,
    priceId: "PENDING_emergency-kit_onetime",
  },
  {
    num: "04",
    name: "Max Burn",
    slug: "max-burn",
    kicker: { en: "Burn and endurance", es: "Quema y resistencia" },
    line: { en: "Thirty minutes a day, built to burn. Nothing decorative about it.", es: "Treinta minutos al día, hechos para quemar. Nada decorativo." },
    equipment: "Resistance bands needed",
    intensity: { en: "High", es: "Alta" },
    audience: "Accelerated fat loss in short sessions",
    duration: { en: "14 days", es: "14 días" },
    oneTime: 39,
    priceId: "PENDING_max-burn_onetime",
  },
  {
    num: "05",
    name: "Reset 7",
    slug: "reset-7",
    kicker: { en: "Reset your habits", es: "Reinicia tus hábitos" },
    line: { en: "Don't let four days of excess define the next four months. Seven days to correct course.", es: "No dejes que cuatro días de excesos definan los próximos cuatro meses. Siete días para corregir el rumbo." },
    equipment: "Elastic bands suggested",
    intensity: { en: "Full body work, short format", es: "Cuerpo completo, formato corto" },
    audience: "Getting back on track after you fell off",
    duration: { en: "7 days", es: "7 días" },
    oneTime: 19,
    priceId: "PENDING_reset-7_onetime",
  },
  {
    num: "06",
    name: "First Move",
    slug: "first-move",
    kicker: { en: "Your first program", es: "Tu primer programa" },
    line: { en: "The first step. Low impact, daily discipline, zero assumptions.", es: "El primer paso. Bajo impacto, disciplina diaria, cero supuestos." },
    equipment: "None",
    intensity: { en: "Low impact", es: "Bajo impacto" },
    audience: "Beginners, sedentary starters, and advanced ages",
    duration: { en: "14 days", es: "14 días" },
    oneTime: 39,
    priceId: "PENDING_first-move_onetime",
  },
  {
    num: "07",
    name: "Full Body",
    slug: "full-body",
    kicker: { en: "Head to toe", es: "De pies a cabeza" },
    line: { en: "Don't do things halfway. Tone and strengthen every area of the body.", es: "No hagas las cosas a medias. Tonifica y fortalece cada zona del cuerpo." },
    equipment: "Resistance bands needed",
    intensity: { en: "Medium, mixed training", es: "Media, entrenamiento mixto" },
    audience: "Overall conditioning, head to toe",
    duration: { en: "4 weeks", es: "4 semanas" },
    oneTime: 95,
    priceId: "PENDING_full-body_onetime",
  },
  {
    num: "08",
    name: "Lower Body",
    slug: "lower-body",
    kicker: { en: "Lower body focus", es: "Foco en tren inferior" },
    line: { en: "Turn on the power in your lower half.", es: "Enciende la potencia de tu tren inferior." },
    equipment: "Resistance bands needed",
    intensity: { en: "Focused strength work", es: "Trabajo de fuerza focalizado" },
    audience: "Thighs and glutes",
    duration: { en: "9 weeks", es: "9 semanas" },
    oneTime: 185,
    priceId: "PENDING_lower-body_onetime",
  },
  {
    num: "09",
    name: "Upper Body",
    slug: "upper-body",
    kicker: { en: "Arms, back, chest", es: "Brazos, espalda, pecho" },
    line: { en: "Strong arms. A back that shows the work.", es: "Brazos fuertes. Una espalda que muestra el trabajo." },
    equipment: "Resistance bands needed",
    intensity: { en: "Focused strength work", es: "Trabajo de fuerza focalizado" },
    audience: "Arm and back strength and definition",
    duration: { en: "9 weeks", es: "9 semanas" },
    oneTime: 185,
    priceId: "PENDING_upper-body_onetime",
  },
  {
    num: "10",
    name: "Booty on Fire",
    slug: "booty-on-fire",
    kicker: { en: "Glutes and legs", es: "Glúteos y piernas" },
    line: { en: "Glute work that earns the name.", es: "Trabajo de glúteos que se gana el nombre." },
    equipment: "Resistance bands needed",
    intensity: { en: "Targeted, high effort", es: "Focalizada, alto esfuerzo" },
    audience: "Maximum glute results in less time",
    duration: { en: "14 days", es: "14 días" },
    oneTime: 39,
    priceId: "PENDING_booty-on-fire_onetime",
  },
  {
    num: "11",
    name: "Runners 5K",
    slug: "runners-5k",
    kicker: { en: "Run your first 5K", es: "Corre tus primeros 5K" },
    line: { en: "Your first 5K, or a faster one.", es: "Tus primeros 5K, o unos más rápidos." },
    equipment: "Your running shoes",
    intensity: { en: "Beginner, intermediate, and advanced plans", es: "Planes principiante, intermedio y avanzado" },
    audience: "First-time and short-distance runners",
    duration: { en: "Self-paced", es: "A tu ritmo" },
  },
  {
    num: "12",
    name: "Runners 10K",
    slug: "runners-10k",
    kicker: { en: "Step up to 10K", es: "Sube a 10K" },
    line: { en: "The next distance. Take it seriously.", es: "La siguiente distancia. Tómatela en serio." },
    equipment: "Your running shoes",
    intensity: { en: "Intermediate and advanced plans", es: "Planes intermedio y avanzado" },
    audience: "Runners moving up to medium distance",
    duration: { en: "Self-paced", es: "A tu ritmo" },
  },
  {
    num: "13",
    name: "Runner 21K",
    slug: "runners-21k",
    kicker: { en: "Half marathon ready", es: "Rumbo a la media maratón" },
    line: { en: "The half marathon. Prepare like you mean it.", es: "La media maratón. Prepárate en serio." },
    equipment: "Your running shoes",
    intensity: { en: "A single advanced plan", es: "Un solo plan avanzado" },
    audience: "Long-distance runners pushing their limit",
    duration: { en: "Self-paced", es: "A tu ritmo" },
  },
];

/* Features verificadas de la app (APP_INFO.md / COPY_V3.md seccion 4) */
const APP_FEATURES: { name: Record<Lang, string>; desc: Record<Lang, string> }[] = [
  {
    name: { en: "A real coach, every day", es: "Un coach real, todos los días" },
    desc: {
      en: "Guidance, corrections, and daily personalized follow-up from a human.",
      es: "Guía, correcciones y seguimiento personalizado de una persona real, cada día.",
    },
  },
  {
    name: { en: "A 360° plan built for you", es: "Un plan 360 hecho para ti" },
    desc: {
      en: "Your level, your goals, your life.",
      es: "Tu nivel, tus metas, tu vida.",
    },
  },
  {
    name: { en: "On-demand and live workouts", es: "Entrenamientos grabados y en vivo" },
    desc: {
      en: "Dozens of programs: strength, cardio, mobility, Pilates, yoga, wellness.",
      es: "Decenas de programas: fuerza, cardio, movilidad, pilates, yoga, bienestar.",
    },
  },
  {
    name: { en: "Nutrition built in", es: "Nutrición integrada" },
    desc: {
      en: "Plans and tools built for energy, focus, and consistency.",
      es: "Planes y herramientas pensados para tu energía, tu enfoque y tu constancia.",
    },
  },
  {
    name: { en: "Apple Health and Apple Watch", es: "Apple Health y Apple Watch" },
    desc: {
      en: "Activity, energy, and heart rate, shared with your coach. iOS only.",
      es: "Actividad, energía y frecuencia cardiaca, compartidas con tu coach. Solo en iOS.",
    },
  },
];

const STEPS: {
  day: Record<Lang, string>;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    day: { en: "Step 01", es: "Paso 01" },
    title: {
      en: "Activate your 7-day free trial",
      es: "Activa tu prueba gratis de 7 días",
    },
    desc: {
      en: "No cost, no commitment. Full access from minute one: training, nutrition, and your coach.",
      es: "Sin costo y sin compromiso. Acceso completo desde el primer minuto: entrenamiento, nutrición y tu coach.",
    },
  },
  {
    day: { en: "Step 02", es: "Paso 02" },
    title: {
      en: "Open the app and start Day 1",
      es: "Abre la app y arranca tu Día 1",
    },
    desc: {
      en: "Everything runs in the 54D On app: your training, your nutrition protocol, and the chat where your coach introduces themselves. Your plan adjusts to your body, your goal, and what you have at home.",
      es: "Todo pasa en la app 54D On: tu entrenamiento, tu protocolo de nutrición y el chat donde tu coach se presenta. Tu plan se ajusta a tu cuerpo, tu meta y lo que tienes en casa.",
    },
  },
  {
    day: { en: "Step 03", es: "Paso 03" },
    title: { en: "On day 8, you decide", es: "El día 8, tú decides" },
    desc: {
      en: "If you stay, your transformation is already moving. If it's not for you, cancel in one click and pay nothing.",
      es: "Si te quedas, tu transformación ya está en marcha. Si no es para ti, cancela en un clic y no pagas nada.",
    },
  },
  {
    day: { en: "Week by week", es: "Semana a semana" },
    title: {
      en: "The program tightens with you",
      es: "La exigencia sube contigo",
    },
    desc: {
      en: "Intensity rises every week and your protocol adjusts to your results. Your coach reviews your week, corrects you, and demands more. 54 days later you don't finish a challenge. You finish someone new.",
      es: "La intensidad sube cada semana y tu protocolo se ajusta a tus resultados. Tu coach revisa tu semana, te corrige y te exige más. 54 días después no terminas un reto. Terminas siendo otra persona.",
    },
  },
];

const VS_APPS: Record<Lang, [string, string, string][]> = {
  en: [
    ["Training", "Library workouts, the same for everyone", "Progressive sessions designed by coaches"],
    ["Nutrition", "A generic calorie counter", "A protocol built for your body and your goal"],
    ["Coaching", "Automated notifications", "A real coach who writes to you every day"],
    ["Structure", "An endless membership, no finish line", "Programs with a start. And an end."],
    ["If you miss a day", "Nothing happens. No one notices", "Your coach notices. And writes to you."],
  ],
  es: [
    ["Entrenamiento", "Rutinas de catálogo, iguales para todos", "Sesiones progresivas diseñadas por coaches"],
    ["Nutrición", "Un contador de calorías genérico", "Un protocolo creado para tu cuerpo y tu meta"],
    ["Coaching", "Notificaciones automáticas", "Un coach real que te escribe todos los días"],
    ["Estructura", "Una membresía infinita, sin meta", "Programas con un inicio. Y un final."],
    ["Si te saltas un día", "No pasa nada. Nadie se da cuenta", "Tu coach se da cuenta. Y te escribe."],
  ],
};

const VS_STUDIOS: Record<Lang, [string, string, string][]> = {
  en: [
    ["What it is", "The 54-day digital program, coached through the 54D On app", "The flagship experience: the method in person, end to end"],
    ["Your team", "A real coach over daily chat", "A dedicated team on the floor: coaches, nutritionist, physiotherapist"],
    ["How you join", "Start today with 7 days free", "By application: a consultation, then your Generation's start date"],
    ["Your group", "A global online community", "Your Generation: limited places, one start date, 54 days together"],
    ["Where", "Wherever you are, with what you have", "Five studios: Miami, Mexico City, Bogotá"],
    ["The commitment", "A subscription you control, from $54 a month", "A private-client level program, discussed in your consultation"],
  ],
  es: [
    ["Qué es", "El programa digital de 54 días, con coach en la app 54D On", "La experiencia insignia: el método presencial, de principio a fin"],
    ["Tu equipo", "Un coach real por chat, todos los días", "Un equipo dedicado en el piso: coaches, nutricionista, fisioterapeuta"],
    ["Cómo entras", "Empieza hoy con 7 días gratis", "Por solicitud: una consulta y la fecha de inicio de tu Generación"],
    ["Tu grupo", "Una comunidad global en línea", "Tu Generación: cupos limitados, una fecha de inicio, 54 días juntos"],
    /* "Cinco studios" es CORRECTO: hay 5 sedes (data/studios.ts) */
    ["Dónde", "Donde estés, con lo que tengas", "Cinco studios: Miami, Ciudad de México, Bogotá"],
    ["El compromiso", "Una suscripción que tú controlas, desde $54 al mes", "Un programa de nivel cliente privado, se conversa en tu consulta"],
  ],
};

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
/* ============ Membresía mini-pitch (MEMBERSHIP_SALES §2) ============
   plans-split 5/7 replicado inline: flex-wrap apila en pantallas angostas
   (pitch primero). check-list y btn-riskline replican §1.2 y §3.4. */
const membSplit: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
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
/* Card compacta: plan+precio a la izquierda, CTA a la derecha; wrap en mobile */
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
      /* El 503 de Stripe sin configurar llega TIPADO (payments_not_configured):
         copy veraz bilingue. Un fallo de red real cae al copy de conexión. */
      const pending = e instanceof Error && e.name === "payments_not_configured";
      setCheckoutErr(
        pending
          ? es
            ? "Estamos conectando los pagos. Podrás completar tu compra muy pronto; no es un problema de tu lado."
            : e.message
          : es
            ? "No pudimos iniciar el pago. Revisa tu conexión e intenta de nuevo en unos segundos."
            : "We couldn't start checkout. Check your connection and try again in a few seconds."
      );
      setErrPlan(priceId);
      setBusy(null);
    }
  };
  const app = useReveal();
  const coaches = useReveal();
  const resultados = useReveal();
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
            src={asset("images/programs/full-body-wide.jpg")}
            alt={
              es
                ? "Atleta entrenando con mancuernas sobre el fondo negro de 54D ON"
                : "Athlete training with dumbbells against the black 54D ON backdrop"
            }
          />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <img
            src={asset("images/brand/logo-54d-on.svg")}
            alt="54D ON"
            style={{ height: "62px", width: "auto", marginBottom: "var(--space-4)" }}
          />
          <h1 className="hero-title">
            {es ? "El método completo." : "The full method."}
            <br />
            <span className="accent">
              {es ? "Donde estés." : "Wherever you are."}
            </span>
          </h1>
          <p className="hero-sub">
            {es
              ? "El programa 54D completo en la app 54D On: tu entrenamiento, tu protocolo de nutrición y un coach real de tu lado. Sin gimnasio, sin excusas de agenda."
              : "The full 54D program in the 54D On app: your training, your nutrition protocol, and a real coach in your corner. No gym, no scheduling excuses."}
          </p>
          {/* Un solo destino para la misma acción en toda la página:
              #membership (los precios viven acá mismo) */}
          <div className="hero-ctas">
            <a href="#membership" className="btn btn-primary btn-attn">
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
            <span className="day-marker">
              {es ? "Qué incluye" : "What's included"}
            </span>
            <div className="method-intro">
              <h2 className="section-title">
                {es ? "El método completo. " : "The whole method. "}
                <span style={solidAccent}>{es ? "Sin relleno." : "No filler."}</span>
              </h2>
              <p>
                {es
                  ? "54D ON no es una versión recortada. Es el programa completo: entrenamiento, nutrición y un coach real que te sigue de cerca."
                  : "54D ON is not a stripped-down version. It's the full program: training, nutrition, and a real coach who follows you."}{" "}
                <Link to="/method" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
                  {es ? "Conoce el método completo →" : "See the full method →"}
                </Link>
              </p>
            </div>
            <div className="method-grid">
              {INCLUDES.map((item) => (
                <div className="method-card" key={item.num}>
                  <div className="method-num">{item.num}</div>
                  <div className="method-name">{item.name[lang]}</div>
                  <p className="method-desc">{item.desc[lang]}</p>
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
            <div style={membSplit} className="memb-split">
              <div style={membPitch}>
                <img
                  src={asset("images/programs/step-2-wide.jpg")}
                  alt="Athlete training under warm light on the official 54D ON set"
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
              <div className="plans-trio" style={{ marginTop: 0 }}>
                {MEMBERSHIP_TIERS.map((t) => (
                  <article
                    className={t.featured ? "pricing-card featured" : "pricing-card"}
                    key={t.priceId}
                  >
                    <div className="plan-photo">
                      <img
                        src={asset(t.photo)}
                        alt={t.photoAlt[lang]}
                        loading="lazy"
                        style={{ objectPosition: t.photoPos }}
                      />
                      <span className="plan-chip">{t.tagline[lang]}</span>
                    </div>
                    <div className="plan-body">
                      <header>
                        <div className="pricing-plan">{t.plan[lang]}</div>
                        <div className="pricing-price">
                          <s
                            style={{
                              fontSize: "0.45em",
                              color: "var(--c-faint)",
                              fontWeight: 500,
                              marginRight: "0.4em",
                            }}
                          >
                            ${t.regularPerMonth}
                          </s>
                          ${t.perMonth}
                          <span
                            style={{
                              fontSize: "0.4em",
                              fontWeight: 500,
                              color: "var(--c-faint)",
                              marginLeft: "0.2em",
                            }}
                          >
                            {es ? "/mes" : "/mo"}
                          </span>
                        </div>
                        <div className="pricing-period">{t.billed[lang]}</div>
                      </header>
                      <footer>
                        <button
                          type="button"
                          className={
                            t.featured ? "btn btn-primary btn-attn" : "btn btn-ghost"
                          }
                          style={{ width: "100%", textAlign: "center", marginTop: "1.4rem" }}
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
                        <span className="btn-riskline">
                          {es
                            ? "7 días gratis · cancela cuando quieras"
                            : "7 days free · cancel anytime"}
                        </span>
                        {checkoutErr && errPlan === t.priceId && (
                          <p
                            role="alert"
                            style={{
                              marginTop: "0.8rem",
                              fontSize: "0.88rem",
                              color: "var(--c-red)",
                              textAlign: "center",
                            }}
                          >
                            {checkoutErr}
                          </p>
                        )}
                      </footer>
                    </div>
                  </article>
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
              <span style={{ fontSize: "0.85rem", color: "var(--c-faint)" }}>
                {es ? "¿No sabes por dónde empezar?" : "Not sure where to start?"}{" "}
                <Link to="/assessment" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
                  {es ? "Haz el assessment de 2 minutos →" : "Take the 2-minute assessment →"}
                </Link>
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
            <span className="day-marker">{es ? "Programas" : "Programs"}</span>
            <div className="method-intro">
              <h2 className="section-title">
                {es ? "Trece programas. " : "Thirteen programs. "}
                <span style={solidAccent}>
                  {es ? "Dos maneras de entrar." : "Two ways in."}
                </span>
              </h2>
              <p>
                {es
                  ? "Todos vienen con la membresía. O compra solo el que necesitas: un pago, el ciclo completo, tu coach incluido. Abre cualquiera para verlo en detalle."
                  : "All of them come with the membership. Or buy just the one you need: one payment, the full run, your coach included. Open any program for the full breakdown."}
              </p>
            </div>
            {/* Vitrina con imagen (cliente 07/08): cada card empuja a SU
                landing, que es la pieza que convierte en Meta Ads. El
                checkout directo sigue disponible en la card. En <=900px
                se pliegan los programas 6-13 tras el toggle. */}
            <div
              className={`prog-grid${showAllPrograms ? "" : " prog-collapsed"}`}
            >
              {PROGRAMS.map((p) => (
                <article className="prog-card" key={p.num}>
                  <Link
                    to={`/programs/${p.slug}`}
                    className="prog-card-media"
                    aria-label={
                      es ? `Ver el programa ${p.name}` : `See the ${p.name} program`
                    }
                  >
                    <img
                      src={asset(`images/programs/${p.slug}.jpg`)}
                      alt=""
                      loading="lazy"
                    />
                    <span className="prog-card-kicker">{p.kicker[lang]}</span>
                    {p.tag && <span className="prog-card-tag">{p.tag[lang]}</span>}
                  </Link>
                  <div className="prog-card-body">
                    <h3 className="prog-card-name">
                      <Link to={`/programs/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p className="prog-card-line">{p.line[lang]}</p>
                    <p className="prog-card-meta">
                      <span>{p.duration[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {es ? "Intensidad" : "Intensity"} {p.intensity[lang]}
                      </span>
                      {p.followUp && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {es ? "Seguimiento incluido" : "Follow-up included"}
                          </span>
                        </>
                      )}
                    </p>
                    <div className="prog-card-foot">
                      <span className="prog-card-price">
                        {p.oneTime ? (
                          <>
                            <b>${p.oneTime}</b>{" "}
                            <em>{es ? "pago único" : "one payment"}</em>
                          </>
                        ) : (
                          <em>{es ? "Solo con membresía" : "Membership only"}</em>
                        )}
                      </span>
                      <Link to={`/programs/${p.slug}`} className="prog-card-cta">
                        {es ? "Ver programa" : "See program"}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    </div>
                    {p.oneTime && p.priceId && (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost prog-card-buy"
                          disabled={busy === p.priceId}
                          onClick={() => buy(p.priceId!)}
                        >
                          {busy === p.priceId
                            ? es
                              ? "Abriendo…"
                              : "Opening…"
                            : es
                              ? "Comprar este programa"
                              : "Buy this program"}
                        </button>
                        {checkoutErr && errPlan === p.priceId && (
                          <span
                            role="alert"
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--c-red)",
                              marginTop: "0.5rem",
                              display: "block",
                            }}
                          >
                            {checkoutErr}
                          </span>
                        )}
                      </>
                    )}
                    {/* Nota SIEMPRE renderizada (nbsp si no hay): los botones
                        de la fila alinean su linea base entre cards */}
                    <span className="prog-card-note">
                      {p.startNote ? p.startNote[lang] : " "}
                    </span>
                  </div>
                </article>
              ))}
              {/* Closing tile (queja cliente 13/08): pieza 14 del grid que
                  llena las celdas vacias junto a Runner 21K y le da contexto
                  al CTA. Es el UNICO primario de la vista de programas. */}
              <article className="prog-card prog-close">
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
                    lineHeight: 1.2,
                    color: "var(--c-white)",
                    maxWidth: "34rem",
                  }}
                >
                  {es
                    ? "¿No sabes cuál? La semana gratis los incluye todos."
                    : "Not sure which one? The free week includes them all."}
                </p>
                <a href="#membership" className="btn btn-primary">
                  {es ? "Empieza gratis. 7 días." : "Start free. 7 days."}
                </a>
                <span className="btn-riskline">
                  {es
                    ? "7 días gratis · cancela cuando quieras"
                    : "7 days free · cancel anytime"}
                </span>
              </article>
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
          </div>
        </div>
      </section>

      {/* ============ LA APP (vehículo de entrega del producto) ============ */}
      <section className="section">
        <div className="section-inner" ref={app.ref}>
          <div className={app.className}>
            <span className="day-marker">{es ? "La app" : "The app"}</span>
            <h2 className="section-title">
              {es ? "Todo tu programa. " : "Your whole program. "}
              <span style={solidAccent}>
                {es ? "En tu bolsillo." : "In your pocket."}
              </span>
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
              {/* Renders OFICIALES de la app (harvest del cliente, 13/08):
                  PNG con alfa real, componen directo sobre la lona #070707.
                  Sin marco CSS, sin sombra. */}
              <div>
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
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </picture>
                <img
                  className="watch-desktop"
                  src={asset("images/app/watch.png")}
                  alt={
                    es
                      ? "La app 54D On en el Apple Watch: los entrenamientos del día"
                      : "The 54D On app on Apple Watch: the day's workouts"
                  }
                  loading="lazy"
                  style={{
                    width: "100%",
                    maxWidth: "320px",
                    margin: "2rem auto 0",
                    /* display vive en .watch-desktop (app.css): el inline
                       pisaba el display:none del media query <=900px */
                  }}
                />
              </div>
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
                  {es
                    ? "El método vive en la app."
                    : "The method lives in the app."}
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
                  {es
                    ? "Entrenamiento, nutrición y un coach real en un solo lugar. Calificación de 4.9 en el App Store."
                    : "Training, nutrition, and a real coach in one place. Rated 4.9 on the App Store."}
                </p>
                <ol style={{ margin: "1.8rem 0 2rem", padding: 0 }}>
                  {APP_FEATURES.map((f, i) => (
                    <li
                      key={f.name.en}
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
                          {f.name[lang]}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.92rem",
                            lineHeight: 1.5,
                            color: "var(--c-mist)",
                          }}
                        >
                          {f.desc[lang]}
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
                  {es
                    ? "Descargar la app 54D On es gratis. Tu suscripción desbloquea todo."
                    : "The 54D On app is free to download. Your subscription unlocks everything."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOS COACHES (cards oficiales del cliente, 13/08) ============
          La promesa "coach real" por fin muestra humanos con nombre y
          especialidad. 10 de las 17 cards oficiales; Fucho EXCLUIDO (boxeo). */}
      <section className="section section-tight">
        <div className="section-inner" ref={coaches.ref}>
          <div className={coaches.className}>
            <span className="day-marker">{es ? "Los coaches" : "The coaches"}</span>
            <h2 className="section-title">
              {es
                ? "Coaches reales. Con nombre y especialidad."
                : "Real coaches. With a name and a specialty."}
            </h2>
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "38rem",
                fontSize: "1.05rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              {es
                ? "Un equipo de 17 coaches reales detrás del método."
                : "A team of 17 real coaches behind the method."}
            </p>
            <div className="coach-strip">
              {[
                "alexis",
                "alicia",
                "sol",
                "jennifer",
                "kevin",
                "cristina",
                "april",
                "luis",
                "andrea",
                "katia",
              ].map((name) => (
                <div className="coach-card" key={name}>
                  <img
                    src={asset(`images/coaches/${name}.jpg`)}
                    alt={
                      es
                        ? `${name.charAt(0).toUpperCase()}${name.slice(1)}, coach de 54D`
                        : `${name.charAt(0).toUpperCase()}${name.slice(1)}, 54D coach`
                    }
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={pasos.ref}>
          <div className={pasos.className}>
            <span className="day-marker">
              {es ? "Cómo funciona" : "How it works"}
            </span>
            <h2 className="section-title">
              {es ? "Tres pasos y estás " : "Three steps and you're "}
              <span style={solidAccent}>{es ? "dentro." : "in."}</span>
            </h2>
            {/* Split captura/pasos: la pantalla real del workout con coach ES el
                producto (captura de la app, vertical) — protagonista junto a los
                pasos. El mockup CSS de la sección app queda intacto. */}
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
              <figure style={{ margin: "0 auto", maxWidth: "320px" }}>
                <img
                  src={asset("images/app/on-workout-coach.jpg")}
                  alt={
                    es
                      ? "Pantalla de la app 54D On con un entrenamiento de fuerza guiado por un coach real"
                      : "54D On app screen with a strength workout led by a real coach"
                  }
                  loading="lazy"
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: "var(--r-media, 2px)",
                  }}
                />
                <figcaption style={photoCaption}>
                  <span style={captionTick} aria-hidden="true" />
                  {es
                    ? "Un coach real en tu pantalla. Ese es el producto."
                    : "A real coach on your screen. That's the product."}
                </figcaption>
              </figure>
              <div className="timeline" style={{ marginTop: 0 }}>
                {STEPS.map((s) => (
                  <div className="timeline-item" key={s.day.en}>
                    <span className="timeline-day">{s.day[lang]}</span>
                    <h3>{s.title[lang]}</h3>
                    <p>{s.desc[lang]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ RESULTADOS REALES (THEN/NOW oficiales) ============
          REGLA DE ALCANCE: los antes/después y el claim -5kg SOLO viven en
          /on, /pricing y /programs/54d-on. NO esparcir a las otras 12
          landings (claim no publicado por programa + riesgo Meta Personal
          Health). SIN CTA: la banda es evidencia, no venta. */}
      <section className="section">
        <div className="section-inner" ref={resultados.ref}>
          <div className={resultados.className}>
            <span className="day-marker">
              {es ? "Resultados reales" : "Real results"}
            </span>
            <h2 className="section-title">
              {es ? "Así se ve el día 54." : "This is what day 54 looks like."}
            </h2>
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "38rem",
                fontSize: "1.05rem",
                lineHeight: 1.6,
                color: "var(--c-mist)",
              }}
            >
              {es
                ? "Resultado promedio de nuestros miembros: -5 kg en 54 días · Verificado por coaches 54D"
                : "Average member result: -5 kg in 54 days · Verified by 54D coaches"}
            </p>
            <div className="results-grid">
              {(
                [
                  ["elizabeth", "Elizabeth"],
                  ["rafael", "Rafael"],
                  ["silvana", "Silvana"],
                ] as const
              ).map(([file, name]) => (
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
                </figure>
              ))}
            </div>
            <p className="photo-caption" style={{ marginTop: "0.9rem" }}>
              {es
                ? "Antes y después reales de miembros de 54D ON"
                : "Real member before-and-afters from 54D ON"}
            </p>
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIALES VS APPS GENÉRICAS ============ */}
      <section className="section">
        <div className="section-inner" ref={difApps.ref}>
          <div className={difApps.className}>
            <span className="day-marker">
              {es ? "La diferencia" : "The difference"}
            </span>
            <h2 className="section-title">
              {es ? "Esto no es " : "This is not "}
              <span style={solidAccent}>
                {es ? "una app más." : "another app."}
              </span>
            </h2>
            <p style={{ marginTop: "1.4rem", maxWidth: "38rem", fontSize: "1.05rem", lineHeight: 1.6, color: "var(--c-mist)" }}>
              {es
                ? "Las apps de ejercicio te venden acceso a contenido. 54D ON te mete en un programa con estructura, un estándar y un final. La app es solo el vehículo."
                : "Workout apps sell you access to content. 54D ON puts you inside a program with structure, a standard, and an end. The app is just the vehicle."}
            </p>
            <CompareTable
              columns={es ? ["", "Una app genérica", "54D ON"] : ["", "A generic app", "54D ON"]}
              rows={VS_APPS[lang]}
              accentCol={2}
            />
          </div>
        </div>
      </section>

      {/* ============ WHICH 54D: ON VS STUDIOS SIN IGUALAR VALOR ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={vsStudios.ref}>
          <div className={vsStudios.className}>
            <span className="day-marker">
              {es ? "Elige tu 54D" : "Which 54D"}
            </span>
            <h2 className="section-title">
              {es ? "¿Cuál 54D es " : "Which 54D is "}
              <span style={solidAccent}>{es ? "para ti?" : "for you?"}</span>
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
                {es
                  ? "Un método, dos programas muy distintos. 54D ON es tu transformación, donde estés y a tu horario. 54D Studios es la experiencia insignia: presencial, por solicitud, con un equipo dedicado. Ninguno es la versión ligera del otro. Están hechos para vidas distintas."
                  : "One method, two very different programs. 54D ON is your transformation, wherever you are, on your schedule. 54D Studios is the flagship: in person, by application, with a dedicated team. Neither is a lighter version of the other. They are built for different lives."}
              </p>
              <figure style={{ margin: 0 }}>
                <img
                  src={asset("images/programs/54d-on-wide.jpg")}
                  alt={
                    es
                      ? "Los coaches de 54D ON en el cover oficial del programa"
                      : "The 54D ON coaches on the official program cover"
                  }
                  loading="lazy"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "21 / 9",
                    objectFit: "cover",
                    objectPosition: "center 40%",
                    borderRadius: "var(--r-media, 2px)",
                    filter: "saturate(0.82) contrast(1.05)",
                  }}
                />
                <figcaption style={photoCaption}>
                  <span style={captionTick} aria-hidden="true" />
                  {es
                    ? "Un método. Dos maneras muy distintas de vivirlo."
                    : "One method. Two very different ways to live it."}
                </figcaption>
              </figure>
            </div>
            <CompareTable
              columns={["", "54D ON", "54D Studios"]}
              rows={VS_STUDIOS[lang]}
              accentCol={1}
            />
            {/* CTAs desiguales a proposito: ON a #membership, Studios a consulta.
                Centrados: cierran una tabla full-width, no una columna. */}
            <div
              className="hero-ctas"
              style={{ marginTop: "2rem", justifyContent: "center" }}
            >
              <a href="#membership" className="btn btn-primary btn-attn">
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
              <a href="#membership" className="btn btn-primary btn-attn">
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

      {/* Página de 15.458px sin CTA persistente → sticky compartida (FIXES_V5 §4).
          Se retira sobre la membresía y sobre el cierre: nunca dos primarios
          amarillos en la misma vista (QUIET v6). */}
      <StickyCta
        href="#membership"
        label={es ? "Empieza tu prueba gratis" : "Start free trial"}
        hideWhenVisible="#membership, .final-wrap, .prog-close"
      />

      <Footer />
    </div>
  );
}
