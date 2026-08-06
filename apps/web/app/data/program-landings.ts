/* ============================================================
   Data de las landings por programa: /programs/:slug
   Fuente: docs/marketing/PROGRAM_LANDINGS.md (27/07/2026).
   Precios reales de store.54d.com; priceIds EXACTOS de on.tsx
   (PENDING_* hasta que el cliente confirme las keys de Stripe).
   Copy bilingue EN/ES (i18n regla dura 3): todo campo visible es
   Record<Lang, ...>. Sin em/en dashes (regla COPY_V3), ES neutro
   latino con tuteo, jamas voseo.
   Equipo alineado a la fuente de verdad: on.tsx PROGRAMS[].equipment.
   ============================================================ */

import type { Lang } from "../lib/i18n";

type Dict = Record<Lang, string>;

export type ProgramSlug =
  | "54d-on"
  | "step-2"
  | "emergency-kit"
  | "max-burn"
  | "reset-7"
  | "first-move"
  | "full-body"
  | "lower-body"
  | "upper-body"
  | "booty-on-fire"
  | "runners-5k"
  | "runners-10k"
  | "runners-21k";

/* Tiers del doc §2: definen las variantes del template.
   starter  $19-$39: compra impulso, página corta, urgencia suave.
   mid      $95-$185: consideración, structure + semana tipo.
   flagship $385/$400: venta completa, fases + arranque lunes.
   runners  solo membresía: la landing vende la membresía. */
export type ProgramTier = "starter" | "mid" | "flagship" | "runners";

export type LandingImage = {
  /** Ruta relativa a /public: se resuelve con asset() en la ruta */
  src: string;
  alt: Dict;
};

export type ProgramLanding = {
  slug: ProgramSlug;
  name: string;
  tier: ProgramTier;
  /** Stripe price id EXACTO (ya cableado en el API de checkout) */
  priceId: string;
  /** Precio mostrado, ej. "$385" o "$54" */
  price: string;
  /** Sufijo del precio (runners: "/mo") */
  priceSuffix?: string;
  /** Ancla tachada si aplica (runners: reg $99/mo de la membresía) */
  anchor?: string;
  /** Nota corta junto al precio: "one payment" | "7-day free trial" */
  priceNote: Dict;
  duration: Dict;
  /** H1 del hero, partido para el span .accent */
  hook: Record<Lang, { plain: string; accent: string }>;
  subhead: Dict;
  /** Copy del CTA principal (por tier, doc §2) */
  cta: Dict;
  /** Microcopy bajo el botón */
  microcopy: Dict;
  /** Urgencia concreta (solo starters) */
  urgency?: Dict;
  /** Punteos de WHAT YOU'LL DO (el ✓ lo pinta el template) */
  bullets: Record<Lang, string[]>;
  /** "This is for you if..." (1 línea) */
  forWho: Dict;
  /** "This is NOT for you if..." (1 línea) */
  notFor: Dict;
  /** Puerta de salida cualificada dentro del sitio (card NOT FOR YOU) */
  notForLink?: { slug: ProgramSlug; label: Dict };
  /** Quick wins: 4 pruebas de baja friccion, hero y cierre */
  quickWins: Record<Lang, { value: string; label: string }[]>;
  hero: LandingImage;
  secondary?: LandingImage;
  /** Stat cards de THE STRUCTURE (se omite en starters: página corta) */
  stats?: { value: Dict; label: Dict }[];
  /** Semana tipo week 1 vs week final (solo mids) */
  progression?: { fromLabel: Dict; from: Dict; toLabel: Dict; to: Dict };
  /** "Your 9 weeks": fases por ciclo de 18 días (solo flagship) */
  phases?: { label: Dict; title: Dict; desc: Dict }[];
  faq: Record<Lang, { q: string; a: string }[]>;
};

const hd = (f: string) => `images/hd/${f}.jpg`;
const hd2 = (f: string) => `images/hd2/${f}.jpg`;
const cg = (f: string) => `images/studios/coral-gables/${f}.jpg`;
const hl = (f: string) => `images/studios/hallandale/${f}.jpg`;

const ONE_PAYMENT: Dict = {
  en: "One payment · Coach included · 30-day money-back guarantee",
  es: "Un pago · Coach incluido · Garantía de 30 días",
};
const MEMBERSHIP_MICROCOPY: Dict = {
  en: "7 days free · Cancel anytime · 30-day guarantee",
  es: "7 días gratis · Cancela cuando quieras · Garantía de 30 días",
};
const ONE_PAYMENT_NOTE: Dict = { en: "one payment", es: "pago único" };
const TRIAL_NOTE: Dict = { en: "7-day free trial", es: "prueba gratis de 7 días" };

/* FAQ compartidas. Las cuatro primeras son verbatim de copy ya
   publicado y aprobado en on.tsx / pricing.tsx: no reescribir. */

const FAQ_REFUND = {
  en: {
    q: "What's the refund policy?",
    a: "Full refund within 30 days. No interrogation, no fine print.",
  },
  es: {
    q: "¿Cuál es la política de reembolso?",
    a: "Reembolso completo dentro de los 30 días. Sin interrogatorios, sin letra pequeña.",
  },
};

const FAQ_MISS = {
  en: {
    q: "What if I miss a day?",
    a: "Your coach adjusts the plan and you keep going. You don't start over.",
  },
  es: {
    q: "¿Y si me salto un día?",
    a: "Tu coach ajusta el plan y sigues. No empiezas de cero.",
  },
};

const FAQ_APP = {
  en: {
    q: "Where do I train it?",
    a: "In the 54D ON app for iOS and Android: your sessions, your progress, and the chat with your coach all live there. The app is free to download and rated 4.9 on the App Store.",
  },
  es: {
    q: "¿Dónde lo entreno?",
    a: "En la app 54D ON para iOS y Android: ahí viven tus sesiones, tu progreso y el chat con tu coach. La app es gratis de descargar y tiene 4.9 en el App Store.",
  },
};

const FAQ_COUNTRY = {
  en: {
    q: "Does it work in my country?",
    a: "54D ON works wherever you are: the United States, Mexico, Colombia, or anywhere with a connection. All you need is your phone.",
  },
  es: {
    q: "¿Funciona en mi país?",
    a: "54D ON funciona donde estés: Estados Unidos, México, Colombia o cualquier lugar con conexión. Solo necesitas tu teléfono.",
  },
};

/* Solo en los 10 slugs de un pago: los runners ya venden membresía */
const FAQ_MEMBERSHIP = {
  en: {
    q: "Should I get the membership or buy one program?",
    a: "The membership includes every program, unlimited coaching, and the community, and starts with a free week: it's the way to go if you want the full method or aren't sure where to start. Buying a single program makes sense when you want exactly one run, one payment, no subscription. Same training, same coach, either way.",
  },
  es: {
    q: "¿Me conviene la membresía o comprar un solo programa?",
    a: "La membresía incluye todos los programas, coaching ilimitado y la comunidad, y empieza con una semana gratis: es el camino si quieres el método completo o no sabes por dónde empezar. Comprar un solo programa tiene sentido cuando quieres exactamente un ciclo, un pago, sin suscripción. Mismo entrenamiento, mismo coach, en ambos casos.",
  },
};

/** Arma el faq bilingue desde items {en, es} sin duplicar el orden a mano */
const faqs = (
  items: { en: { q: string; a: string }; es: { q: string; a: string } }[]
): Record<Lang, { q: string; a: string }[]> => ({
  en: items.map((i) => i.en),
  es: items.map((i) => i.es),
});

export const PROGRAM_LANDINGS: Record<ProgramSlug, ProgramLanding> = {
  /* ============ FLAGSHIP $385/$400 ============ */
  "54d-on": {
    slug: "54d-on",
    name: "54D ON",
    tier: "flagship",
    priceId: "PENDING_54d-on_onetime",
    price: "$385",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "9 weeks", es: "9 semanas" },
    hook: {
      en: { plain: "54 days. A different body.", accent: "A different you." },
      es: { plain: "54 días. Otro cuerpo.", accent: "Otro tú." },
    },
    subhead: {
      en: "The complete 54D transformation method, with a real coach on your side for 9 weeks.",
      es: "El método completo de transformación de 54D, con un coach real de tu lado durante 9 semanas.",
    },
    cta: {
      en: "Reserve my spot · Starts Monday",
      es: "Reserva mi lugar · Empieza el lunes",
    },
    microcopy: ONE_PAYMENT,
    bullets: {
      en: [
        "Train 6 days a week with structured 45-min sessions",
        "Follow the method that built 54D: strength, cardio, discipline",
        "Get your form checked by a certified coach, unlimited",
        "Track every phase across 3 cycles of 18 days",
        "Earn the 54D badge when you finish",
      ],
      es: [
        "Entrena 6 días por semana con sesiones estructuradas de 45 min",
        "Sigue el método que construyó 54D: fuerza, cardio, disciplina",
        "Un coach certificado revisa tu técnica, sin límite",
        "Registra cada fase a lo largo de 3 ciclos de 18 días",
        "Gana la insignia 54D cuando termines",
      ],
    },
    forWho: {
      en: "You're ready to commit 9 weeks and want a coach holding you accountable.",
      es: "Estás listo para comprometerte 9 semanas y quieres un coach que te haga responsable.",
    },
    notFor: {
      en: "You want a casual workout you can skip without anyone noticing.",
      es: "Quieres un entrenamiento casual que puedas saltarte sin que nadie lo note.",
    },
    quickWins: {
      en: [
        { value: "Monday", label: "Your day 1" },
        { value: "45 min", label: "Per session" },
        { value: "6 days a week", label: "Your rhythm" },
        { value: "Bands optional", label: "All you need" },
      ],
      es: [
        { value: "Lunes", label: "Tu día 1" },
        { value: "45 min", label: "Por sesión" },
        { value: "6 días por semana", label: "Tu ritmo" },
        { value: "Bandas opcional", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: hd("cg-ramp-runners-wide"),
      alt: {
        en: "Group of athletes sprinting up the ramp at the 54D Coral Gables studio",
        es: "Grupo de atletas corriendo por la rampa del estudio 54D de Coral Gables",
      },
    },
    secondary: {
      src: cg("graduation-celebration-01"),
      alt: {
        en: "A 54D generation celebrating graduation together on the training floor",
        es: "Una generación de 54D celebrando su graduación en el piso de entrenamiento",
      },
    },
    stats: [
      {
        value: { en: "9 wk", es: "9 sem" },
        label: { en: "Duration", es: "Duración" },
      },
      {
        value: { en: "6/wk", es: "6/sem" },
        label: { en: "Sessions", es: "Sesiones" },
      },
      {
        value: { en: "45 min", es: "45 min" },
        label: { en: "Per session", es: "Por sesión" },
      },
      {
        value: { en: "3", es: "3" },
        label: { en: "Cycles of 18 days", es: "Ciclos de 18 días" },
      },
    ],
    phases: [
      {
        label: { en: "Days 1-18", es: "Días 1-18" },
        title: { en: "Cycle 1: Foundation", es: "Ciclo 1: Base" },
        desc: {
          en: "Structured 45-min sessions build the habit. Your coach checks your form from day one and calibrates the plan to your level.",
          es: "Sesiones estructuradas de 45 min construyen el hábito. Tu coach revisa tu técnica desde el día uno y calibra el plan a tu nivel.",
        },
      },
      {
        label: { en: "Days 19-36", es: "Días 19-36" },
        title: { en: "Cycle 2: Build", es: "Ciclo 2: Construcción" },
        desc: {
          en: "Intensity rises. Strength, cardio and discipline stack week over week, and your coach adjusts the load as your body answers.",
          es: "Sube la intensidad. Fuerza, cardio y disciplina se acumulan semana tras semana, y tu coach ajusta la carga según responde tu cuerpo.",
        },
      },
      {
        label: { en: "Days 37-54", es: "Días 37-54" },
        title: { en: "Cycle 3: Prove it", es: "Ciclo 3: Demuéstralo" },
        desc: {
          en: "The hardest block of the method. You finish the 54 days, and you earn the 54D badge.",
          es: "El bloque más duro del método. Terminas los 54 días y ganas la insignia 54D.",
        },
      },
    ],
    faq: faqs([
      {
        en: {
          q: "When does it start?",
          a: "Every Monday. A new generation kicks off each week: reserve your spot and you start the next one.",
        },
        es: {
          q: "¿Cuándo empieza?",
          a: "Todos los lunes. Cada semana arranca una generación nueva: reserva tu lugar y empiezas la siguiente.",
        },
      },
      {
        en: {
          q: "Do I need a gym?",
          a: "No. Elastic bands and space to move are enough. Every session is built for wherever you train.",
        },
        es: {
          q: "¿Necesito gimnasio?",
          a: "No. Con bandas elásticas y espacio para moverte alcanza. Cada sesión está hecha para donde sea que entrenes.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "step-2": {
    slug: "step-2",
    name: "Step 2",
    tier: "flagship",
    priceId: "PENDING_step-2_onetime",
    price: "$400",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "9 weeks", es: "9 semanas" },
    hook: {
      en: {
        plain: "You finished 54D.",
        accent: "Now go where most people never do.",
      },
      es: {
        plain: "Terminaste 54D.",
        accent: "Ahora ve a donde casi nadie llega.",
      },
    },
    subhead: {
      en: "The advanced 9-week program for graduates who want more load, more speed, more.",
      es: "El programa avanzado de 9 semanas para graduados que quieren más carga, más velocidad, más.",
    },
    cta: {
      en: "Reserve my spot · Starts Monday",
      es: "Reserva mi lugar · Empieza el lunes",
    },
    microcopy: ONE_PAYMENT,
    bullets: {
      en: [
        "Heavier lifts and advanced progressions",
        "6 sessions/week built on the 54D base",
        "Unlimited coach feedback on every rep",
        "Performance benchmarks each 18-day cycle",
      ],
      es: [
        "Levantamientos más pesados y progresiones avanzadas",
        "6 sesiones por semana construidas sobre la base de 54D",
        "Feedback ilimitado del coach en cada repetición",
        "Benchmarks de rendimiento en cada ciclo de 18 días",
      ],
    },
    forWho: {
      en: "You completed 54D ON (or train at that level) and want the next ceiling.",
      es: "Completaste 54D ON (o entrenas a ese nivel) y quieres el siguiente techo.",
    },
    notFor: {
      en: "It's your first structured program: start with 54D ON.",
      es: "Es tu primer programa estructurado: empieza con 54D ON.",
    },
    notForLink: {
      slug: "54d-on",
      label: { en: "See 54D ON →", es: "Ver 54D ON →" },
    },
    quickWins: {
      en: [
        { value: "Monday", label: "Your day 1" },
        { value: "6 days a week", label: "Sessions" },
        { value: "Advanced", label: "Level" },
        { value: "Bands optional", label: "All you need" },
      ],
      es: [
        { value: "Lunes", label: "Tu día 1" },
        { value: "6 días por semana", label: "Sesiones" },
        { value: "Avanzado", label: "Nivel" },
        { value: "Bandas opcional", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: hd("cg-overhead-press"),
      alt: {
        en: "Athlete driving a loaded barbell overhead under studio lights",
        es: "Atleta empujando una barra cargada por encima de la cabeza bajo las luces del estudio",
      },
    },
    secondary: {
      src: cg("barbell-press-gaze-vertical"),
      alt: {
        en: "Athlete under a loaded barbell in an advanced studio session",
        es: "Atleta bajo una barra cargada en una sesión avanzada del estudio",
      },
    },
    stats: [
      {
        value: { en: "9 wk", es: "9 sem" },
        label: { en: "Duration", es: "Duración" },
      },
      {
        value: { en: "6/wk", es: "6/sem" },
        label: { en: "Sessions", es: "Sesiones" },
      },
      {
        value: { en: "18", es: "18" },
        label: {
          en: "Day cycles, benchmarked",
          es: "Ciclos de días, con benchmark",
        },
      },
      {
        value: { en: "Advanced", es: "Avanzado" },
        label: { en: "Level", es: "Nivel" },
      },
    ],
    phases: [
      {
        label: { en: "Days 1-18", es: "Días 1-18" },
        title: { en: "Cycle 1: Recalibrate", es: "Ciclo 1: Recalibrar" },
        desc: {
          en: "Heavier baselines than 54D ON. Performance benchmarks set your new starting line.",
          es: "Bases más pesadas que en 54D ON. Los benchmarks de rendimiento marcan tu nueva línea de salida.",
        },
      },
      {
        label: { en: "Days 19-36", es: "Días 19-36" },
        title: { en: "Cycle 2: Overload", es: "Ciclo 2: Sobrecarga" },
        desc: {
          en: "Advanced progressions: more load, more speed. Your coach reviews every rep that matters.",
          es: "Progresiones avanzadas: más carga, más velocidad. Tu coach revisa cada repetición que importa.",
        },
      },
      {
        label: { en: "Days 37-54", es: "Días 37-54" },
        title: { en: "Cycle 3: Peak", es: "Ciclo 3: Pico" },
        desc: {
          en: "The heaviest lifts of the program and the final benchmarks. This is where most people never go.",
          es: "Los levantamientos más pesados del programa y los benchmarks finales. Aquí es donde casi nadie llega.",
        },
      },
    ],
    faq: faqs([
      {
        en: {
          q: "When does it start?",
          a: "Mondays. Reserve your spot and start the next one.",
        },
        es: {
          q: "¿Cuándo empieza?",
          a: "Los lunes. Reserva tu lugar y empiezas el siguiente.",
        },
      },
      {
        en: {
          q: "What equipment do I need?",
          a: "Elastic bands and space to move. No gym required.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Bandas elásticas y espacio para moverte. No necesitas gimnasio.",
        },
      },
      {
        en: {
          q: "Do I need to have finished 54D ON?",
          a: "It's built for 54D ON graduates. Advanced athletes who train at that level can join too.",
        },
        es: {
          q: "¿Necesito haber terminado 54D ON?",
          a: "Está hecho para graduados de 54D ON. Los atletas avanzados que entrenan a ese nivel también pueden entrar.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  /* ============ STARTERS $19-$39 ============ */
  "emergency-kit": {
    slug: "emergency-kit",
    name: "Emergency Kit",
    tier: "starter",
    priceId: "PENDING_emergency-kit_onetime",
    price: "$39",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "14 days", es: "14 días" },
    hook: {
      en: { plain: "You have 14 days.", accent: "Train every one of them." },
      es: { plain: "Tienes 14 días.", accent: "Entrena todos." },
    },
    subhead: {
      en: "A 14-day plan: one 30-minute session a day, with a coach. Starts today.",
      es: "Un plan de 14 días: una sesión de 30 minutos al día, con coach. Empieza hoy.",
    },
    cta: { en: "Start today", es: "Empieza hoy" },
    microcopy: ONE_PAYMENT,
    urgency: {
      en: "Session 1 is 30 minutes. You can do it today.",
      es: "La sesión 1 dura 30 minutos. La puedes hacer hoy.",
    },
    bullets: {
      en: [
        "Daily 30-min high-intensity sessions",
        "Full-body work, zero filler",
        "Simple daily checklist",
        "Coach in your corner the whole 14 days",
      ],
      es: [
        "Sesiones diarias de alta intensidad de 30 min",
        "Trabajo de cuerpo completo, sin relleno",
        "Una lista simple para cada día",
        "Coach en tu esquina los 14 días",
      ],
    },
    forWho: {
      en: "You have a date on the calendar and want maximum result per day.",
      es: "Tienes una fecha en el calendario y quieres el máximo resultado por día.",
    },
    notFor: {
      en: "You want long-term transformation: that's a 9-week program.",
      es: "Quieres una transformación de largo plazo: eso es un programa de 9 semanas.",
    },
    notForLink: {
      slug: "54d-on",
      label: { en: "See 54D ON →", es: "Ver 54D ON →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "30 min", label: "Per session" },
        { value: "14 days", label: "Start to finish" },
        { value: "Bands", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "30 min", label: "Por sesión" },
        { value: "14 días", label: "De inicio a fin" },
        { value: "Bandas", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: "images/programs/emergency-kit.jpg",
      alt: {
        en: "Athlete mid high-intensity set on the 54D training floor",
        es: "Atleta en plena serie de alta intensidad en el piso de entrenamiento de 54D",
      },
    },
    secondary: {
      src: cg("cardio-jump-mural-vertical"),
      alt: {
        en: "Athlete mid jump in front of the 54D mural at the studio",
        es: "Atleta en pleno salto frente al mural 54D del estudio",
      },
    },
    faq: faqs([
      {
        en: {
          q: "What equipment do I need?",
          a: "Resistance bands. Nothing else.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Bandas de resistencia. Nada más.",
        },
      },
      {
        en: {
          q: "What do I get in 14 days?",
          a: "14 daily sessions of 30 minutes, your form checked by a coach, and the habit started.",
        },
        es: {
          q: "¿Qué me llevo en 14 días?",
          a: "14 sesiones diarias de 30 minutos, tu técnica revisada por un coach y el hábito arrancado.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "max-burn": {
    slug: "max-burn",
    name: "Max Burn",
    tier: "starter",
    priceId: "PENDING_max-burn_onetime",
    price: "$39",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "14 days", es: "14 días" },
    hook: {
      en: {
        plain: "14 days of the hardest cardio",
        accent: "you'll love finishing.",
      },
      es: {
        plain: "14 días del cardio más duro",
        accent: "que vas a amar terminar.",
      },
    },
    subhead: {
      en: "Pure conditioning: short, hard, done before the day starts.",
      es: "Puro acondicionamiento: corto, intenso, y termina antes de que arranque el día.",
    },
    cta: { en: "Start today", es: "Empieza hoy" },
    microcopy: ONE_PAYMENT,
    urgency: {
      en: "Session 1 is under 35 minutes. Do it today.",
      es: "La sesión 1 dura menos de 35 minutos. Hazla hoy.",
    },
    bullets: {
      en: [
        "Daily HIIT sessions under 35 min",
        "Heart-rate zones your coach sets for every session",
        "Resistance bands and floor space, nothing else",
        "Coach keeps you honest daily",
      ],
      es: [
        "Sesiones diarias de HIIT de menos de 35 min",
        "Zonas de frecuencia cardíaca que tu coach define en cada sesión",
        "Bandas de resistencia y espacio en el piso, nada más",
        "Tu coach te mantiene honesto todos los días",
      ],
    },
    forWho: {
      en: "You want to sweat hard and jumpstart your engine.",
      es: "Quieres sudar fuerte y encender tu motor.",
    },
    notFor: {
      en: "Your goals are strength-first: see Upper Body or Lower Body.",
      es: "Tus metas son de fuerza primero: mira Upper Body o Lower Body.",
    },
    notForLink: {
      slug: "upper-body",
      label: { en: "See Upper Body →", es: "Ver Upper Body →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "Under 35 min", label: "Per session" },
        { value: "14 days", label: "Start to finish" },
        { value: "Bands", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "Menos de 35 min", label: "Por sesión" },
        { value: "14 días", label: "De inicio a fin" },
        { value: "Bandas", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: cg("group-cardio-session-01"),
      alt: {
        en: "Group cardio session at full intensity on the 54D training floor",
        es: "Sesión de cardio grupal a máxima intensidad en el piso de entrenamiento de 54D",
      },
    },
    secondary: {
      src: hd2("v-spin-rider"),
      alt: {
        en: "Rider out of the saddle on a spin bike, smiling through the effort",
        es: "Ciclista de pie sobre la bici de spinning, sonriendo en pleno esfuerzo",
      },
    },
    faq: faqs([
      {
        en: {
          q: "What equipment do I need?",
          a: "Resistance bands. Nothing else.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Bandas de resistencia. Nada más.",
        },
      },
      {
        en: {
          q: "What fitness level do I need?",
          a: "Any. The intensity is scalable and your coach keeps it honest.",
        },
        es: {
          q: "¿Qué nivel necesito?",
          a: "Cualquiera. La intensidad es escalable y tu coach la mantiene honesta.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "reset-7": {
    slug: "reset-7",
    name: "Reset 7",
    tier: "starter",
    priceId: "PENDING_reset-7_onetime",
    price: "$19",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "7 days", es: "7 días" },
    hook: {
      en: { plain: "One week to remember", accent: "what your body can do." },
      es: {
        plain: "Una semana para recordar",
        accent: "lo que tu cuerpo puede hacer.",
      },
    },
    subhead: {
      en: "7 days of movement, mobility and momentum for $19. Start today.",
      es: "7 días de movimiento, movilidad e impulso por $19. Empieza hoy.",
    },
    cta: { en: "Start today", es: "Empieza hoy" },
    microcopy: ONE_PAYMENT,
    urgency: {
      en: "Day 1 is 20 minutes. Today.",
      es: "El día 1 son 20 minutos. Hoy.",
    },
    bullets: {
      en: [
        "One short session daily, 20-30 min",
        "Mobility + light strength + walks",
        "Sleep and hydration micro-goals",
        "Coach support all week",
      ],
      es: [
        "Una sesión corta al día, 20-30 min",
        "Movilidad + fuerza ligera + caminatas",
        "Micro metas de sueño e hidratación",
        "Apoyo de tu coach toda la semana",
      ],
    },
    forWho: {
      en: "You're stuck and need a low-stakes way back in.",
      es: "Estás estancado y necesitas una forma de volver sin presión.",
    },
    notFor: {
      en: "You're already training consistently.",
      es: "Ya entrenas de forma constante.",
    },
    notForLink: {
      slug: "54d-on",
      label: { en: "See 54D ON →", es: "Ver 54D ON →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "20 to 30 min", label: "Per session" },
        { value: "7 days", label: "Start to finish" },
        { value: "Bands optional", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "20 a 30 min", label: "Por sesión" },
        { value: "7 días", label: "De inicio a fin" },
        { value: "Bandas opcionales", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: cg("training-floor-recovery-01"),
      alt: {
        en: "Athletes stretching and recovering together on the training floor",
        es: "Atletas estirando y recuperando juntos en el piso de entrenamiento",
      },
    },
    faq: faqs([
      {
        en: {
          q: "What equipment do I need?",
          a: "Elastic bands help, but you can start without them.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Las bandas elásticas ayudan, pero puedes empezar sin ellas.",
        },
      },
      {
        en: {
          q: "Only $19. What's the catch?",
          a: "None. It's the front door to 54D.",
        },
        es: {
          q: "Solo $19. ¿Dónde está la trampa?",
          a: "No hay. Es la puerta de entrada a 54D.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "first-move": {
    slug: "first-move",
    name: "First Move",
    tier: "starter",
    priceId: "PENDING_first-move_onetime",
    price: "$39",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "14 days", es: "14 días" },
    hook: {
      en: {
        plain: "The hardest part is starting.",
        accent: "This is starting, made easy.",
      },
      es: {
        plain: "Lo más difícil es empezar.",
        accent: "Esto es empezar, hecho fácil.",
      },
    },
    subhead: {
      en: "14 days built for absolute beginners, with a real coach so you never feel lost.",
      es: "14 días hechos para principiantes absolutos, con un coach real para que nunca te sientas perdido.",
    },
    cta: { en: "Start today", es: "Empieza hoy" },
    microcopy: ONE_PAYMENT,
    urgency: {
      en: "Session 1 is 20 minutes, and your coach walks you through it.",
      es: "La sesión 1 dura 20 minutos y tu coach te guía.",
    },
    bullets: {
      en: [
        "Gentle daily sessions from 20 min",
        "Learn the fundamental movements right",
        "A coach answers every question, no shame",
        "Build the habit before the intensity",
      ],
      es: [
        "Sesiones diarias suaves desde 20 min",
        "Aprende bien los movimientos fundamentales",
        "Un coach responde cada pregunta, sin vergüenza",
        "Construye el hábito antes que la intensidad",
      ],
    },
    forWho: {
      en: "You haven't trained in years (or ever) and want a kind start.",
      es: "No entrenas hace años (o nunca lo hiciste) y quieres un comienzo amable.",
    },
    notFor: {
      en: "You're an experienced athlete: you'll be bored.",
      es: "Eres un atleta con experiencia: te vas a aburrir.",
    },
    notForLink: {
      slug: "54d-on",
      label: { en: "See 54D ON →", es: "Ver 54D ON →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "From 20 min", label: "Per session" },
        { value: "14 days", label: "Start to finish" },
        { value: "No equipment", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "Desde 20 min", label: "Por sesión" },
        { value: "14 días", label: "De inicio a fin" },
        { value: "Sin equipo", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: cg("coach-correction"),
      alt: {
        en: "A 54D coach correcting an athlete's form mid movement",
        es: "Un coach de 54D corrigiendo la técnica de una atleta en pleno movimiento",
      },
    },
    secondary: {
      src: hd2("spare-cyclist-sign"),
      alt: {
        en: "Member setting up her spin bike under the yellow wall that reads We train something more powerful than your body",
        es: "Una miembro ajustando su bici de spinning bajo la pared amarilla que dice We train something more powerful than your body",
      },
    },
    faq: faqs([
      {
        en: { q: "What equipment do I need?", a: "None. Nothing to buy." },
        es: { q: "¿Qué equipo necesito?", a: "Ninguno. Nada que comprar." },
      },
      {
        en: {
          q: "I'm really out of shape. Can I do this?",
          a: "This exists exactly for you. Gentle sessions, zero assumptions.",
        },
        es: {
          q: "Estoy muy fuera de forma. ¿Puedo hacerlo?",
          a: "Esto existe exactamente para ti. Sesiones suaves, cero suposiciones.",
        },
      },
      {
        en: {
          q: "What comes after the 14 days?",
          a: "Full Body is the natural next step.",
        },
        es: {
          q: "¿Qué viene después de los 14 días?",
          a: "Full Body es el siguiente paso natural.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "booty-on-fire": {
    slug: "booty-on-fire",
    name: "Booty on Fire",
    tier: "starter",
    priceId: "PENDING_booty-on-fire_onetime",
    price: "$39",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "14 days", es: "14 días" },
    hook: {
      en: { plain: "14 days.", accent: "Glutes and lower body, every day." },
      es: { plain: "14 días.", accent: "Glúteos y tren inferior, todos los días." },
    },
    subhead: {
      en: "Glute-focused sessions with a band or bodyweight, at home. 14 days with a coach.",
      es: "Sesiones enfocadas en glúteos, con banda o peso corporal, en casa. 14 días con coach.",
    },
    cta: { en: "Start today", es: "Empieza hoy" },
    microcopy: ONE_PAYMENT,
    urgency: {
      en: "Day 1 is today. Your coach checks your form from the first rep.",
      es: "El día 1 es hoy. Tu coach revisa tu técnica desde la primera repetición.",
    },
    bullets: {
      en: [
        "Daily glute + lower-body targeted sessions",
        "Progressive activation to hip thrusts",
        "Band and bodyweight, home-friendly",
        "Coach checks your form so it works",
      ],
      es: [
        "Sesiones diarias enfocadas en glúteos y tren inferior",
        "Activación progresiva hasta el hip thrust",
        "Banda y peso corporal, ideal para casa",
        "Tu coach revisa tu técnica para que funcione",
      ],
    },
    forWho: {
      en: "You want a focused glute kickstart, now.",
      es: "Quieres un arranque enfocado en glúteos, ahora.",
    },
    notFor: {
      en: "You want full lower-body strength: that's Lower Body, 9 weeks.",
      es: "Quieres fuerza completa de tren inferior: eso es Lower Body, 9 semanas.",
    },
    notForLink: {
      slug: "lower-body",
      label: { en: "See Lower Body →", es: "Ver Lower Body →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "Daily", label: "Sessions" },
        { value: "14 days", label: "Start to finish" },
        { value: "Bands", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "Todos los días", label: "Sesiones" },
        { value: "14 días", label: "De inicio a fin" },
        { value: "Bandas", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: cg("group-squat-class-01"),
      alt: {
        en: "Full class holding the bottom of a squat together at the studio",
        es: "Clase completa sosteniendo juntos el fondo de una sentadilla en el estudio",
      },
    },
    secondary: {
      src: hd2("v-squat-band"),
      alt: {
        en: "Athlete in a deep squat with a blue resistance band above her knees, class squatting behind her",
        es: "Atleta en sentadilla profunda con una banda de resistencia azul sobre las rodillas, la clase en sentadilla detrás",
      },
    },
    faq: faqs([
      {
        en: {
          q: "What equipment do I need?",
          a: "Resistance bands. That is the whole list.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Bandas de resistencia. Esa es toda la lista.",
        },
      },
      {
        en: {
          q: "What do I get in 14 days?",
          a: "14 daily sessions, your form checked by a coach, and the habit started.",
        },
        es: {
          q: "¿Qué me llevo en 14 días?",
          a: "14 sesiones diarias, tu técnica revisada por un coach y el hábito arrancado.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  /* ============ MIDS $95-$185 ============ */
  "full-body": {
    slug: "full-body",
    name: "Full Body",
    tier: "mid",
    priceId: "PENDING_full-body_onetime",
    price: "$95",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "4 weeks", es: "4 semanas" },
    hook: {
      en: { plain: "Four weeks. Every muscle.", accent: "One plan." },
      es: { plain: "Cuatro semanas. Cada músculo.", accent: "Un solo plan." },
    },
    subhead: {
      en: "The complete-body reset for people who want results without a 2-hour gym life.",
      es: "El reinicio de cuerpo completo para quien quiere resultados sin vivir 2 horas en el gimnasio.",
    },
    cta: { en: "Start the program", es: "Empieza el programa" },
    microcopy: ONE_PAYMENT,
    bullets: {
      en: [
        "45-min full-body sessions, 5x/week",
        "Strength + conditioning in every workout",
        "Coach feedback whenever you need it",
        "A finish-line test in week 4",
      ],
      es: [
        "Sesiones de cuerpo completo de 45 min, 5 veces por semana",
        "Fuerza + acondicionamiento en cada entrenamiento",
        "Feedback de tu coach cuando lo necesites",
        "Una prueba de meta final en la semana 4",
      ],
    },
    forWho: {
      en: "You want a serious month of training with everything covered.",
      es: "Quieres un mes serio de entrenamiento con todo cubierto.",
    },
    notFor: {
      en: "You want a 9-week transformation: that's 54D ON.",
      es: "Quieres una transformación de 9 semanas: eso es 54D ON.",
    },
    notForLink: {
      slug: "54d-on",
      label: { en: "See 54D ON →", es: "Ver 54D ON →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "45 min", label: "Per session" },
        { value: "5 a week", label: "Sessions" },
        { value: "Bands", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "45 min", label: "Por sesión" },
        { value: "5 por semana", label: "Sesiones" },
        { value: "Bandas", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: hd("cg-gym-wide"),
      alt: {
        en: "Wide view of the 54D Coral Gables training floor mid session",
        es: "Vista amplia del piso de entrenamiento de 54D Coral Gables en plena sesión",
      },
    },
    secondary: {
      src: hd2("spare-class-jump"),
      alt: {
        en: "Whole class dropping into squats in front of the giant 54D wall, coach calling the round",
        es: "La clase entera bajando a la sentadilla frente al muro gigante de 54D, el coach marcando la ronda",
      },
    },
    stats: [
      {
        value: { en: "4 wk", es: "4 sem" },
        label: { en: "Duration", es: "Duración" },
      },
      {
        value: { en: "5/wk", es: "5/sem" },
        label: { en: "Sessions", es: "Sesiones" },
      },
      {
        value: { en: "45 min", es: "45 min" },
        label: { en: "Per session", es: "Por sesión" },
      },
      {
        value: { en: "All", es: "Todos" },
        label: { en: "Levels", es: "Los niveles" },
      },
    ],
    progression: {
      fromLabel: { en: "Week 1", es: "Semana 1" },
      from: {
        en: "Full-body sessions that groove the patterns: strength plus conditioning, 45 minutes, done.",
        es: "Sesiones de cuerpo completo que asientan los patrones: fuerza más acondicionamiento, 45 minutos, listo.",
      },
      toLabel: { en: "Week 4", es: "Semana 4" },
      to: {
        en: "Same structure, heavier and faster, capped with the finish-line test.",
        es: "La misma estructura, más pesada y más rápida, y cierra con la prueba de meta final.",
      },
    },
    faq: faqs([
      {
        en: {
          q: "Home or gym?",
          a: "Either. Resistance bands and space to move are enough.",
        },
        es: {
          q: "¿Casa o gimnasio?",
          a: "Cualquiera. Con bandas de resistencia y espacio para moverte alcanza.",
        },
      },
      {
        en: {
          q: "What happens after the 4 weeks?",
          a: "Most people continue into 54D ON. This month is the perfect ramp.",
        },
        es: {
          q: "¿Qué pasa después de las 4 semanas?",
          a: "La mayoría sigue con 54D ON. Este mes es la rampa perfecta.",
        },
      },
      {
        en: {
          q: "What level is it for?",
          a: "All levels. Sessions scale with you.",
        },
        es: {
          q: "¿Para qué nivel es?",
          a: "Todos los niveles. Las sesiones escalan contigo.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "lower-body": {
    slug: "lower-body",
    name: "Lower Body",
    tier: "mid",
    priceId: "PENDING_lower-body_onetime",
    price: "$185",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "9 weeks", es: "9 semanas" },
    hook: {
      en: {
        plain: "Legs that carry you further.",
        accent: "Built in 9 weeks.",
      },
      es: {
        plain: "Piernas que te llevan más lejos.",
        accent: "Construidas en 9 semanas.",
      },
    },
    subhead: {
      en: "A focused lower-body program with a coach checking your squat, not a video guessing.",
      es: "Un programa enfocado en tren inferior con un coach que revisa tu sentadilla, no un video que adivina.",
    },
    cta: { en: "Start the program", es: "Empieza el programa" },
    microcopy: ONE_PAYMENT,
    bullets: {
      en: [
        "Squat, hinge and lunge patterns, progressively loaded",
        "4-5 sessions/week, 40 min each",
        "Explosive work: jumps and sprints",
        "Coach reviews your form in the app",
      ],
      es: [
        "Patrones de sentadilla, bisagra y zancada, con carga progresiva",
        "4-5 sesiones por semana, 40 min cada una",
        "Trabajo explosivo: saltos y sprints",
        "Tu coach revisa tu técnica en la app",
      ],
    },
    forWho: {
      en: "You want visible lower-body strength and shape with structure.",
      es: "Quieres fuerza y forma visibles en el tren inferior, con estructura.",
    },
    notFor: {
      en: "You're after a full-body plan: see Full Body or 54D ON.",
      es: "Buscas un plan de cuerpo completo: mira Full Body o 54D ON.",
    },
    notForLink: {
      slug: "full-body",
      label: { en: "See Full Body →", es: "Ver Full Body →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "40 min", label: "Per session" },
        { value: "4 to 5 a week", label: "Sessions" },
        { value: "Bands", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "40 min", label: "Por sesión" },
        { value: "4 a 5 por semana", label: "Sesiones" },
        { value: "Bandas", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: cg("jump-training-54d-wall-01"),
      alt: {
        en: "Athlete mid box jump in front of the 54D wall",
        es: "Atleta en pleno salto al cajón frente al muro de 54D",
      },
    },
    secondary: {
      src: cg("ramp-climb-vertical"),
      alt: {
        en: "Athlete climbing the studio ramp, shot from below",
        es: "Atleta subiendo la rampa del estudio, tomada desde abajo",
      },
    },
    stats: [
      {
        value: { en: "9 wk", es: "9 sem" },
        label: { en: "Duration", es: "Duración" },
      },
      {
        value: { en: "4-5/wk", es: "4-5/sem" },
        label: { en: "Sessions", es: "Sesiones" },
      },
      {
        value: { en: "40 min", es: "40 min" },
        label: { en: "Per session", es: "Por sesión" },
      },
      {
        value: { en: "Scalable", es: "Escalable" },
        label: { en: "Level", es: "Nivel" },
      },
    ],
    progression: {
      fromLabel: { en: "Week 1", es: "Semana 1" },
      from: {
        en: "Squat, hinge and lunge patterns at controlled loads. Your coach calibrates depth and form before the weight goes up.",
        es: "Patrones de sentadilla, bisagra y zancada con cargas controladas. Tu coach calibra la profundidad y la técnica antes de subir el peso.",
      },
      toLabel: { en: "Week 9", es: "Semana 9" },
      to: {
        en: "Progressively loaded lifts plus explosive jumps and sprints. The finish looks nothing like the start.",
        es: "Levantamientos con carga progresiva más saltos y sprints explosivos. El final no se parece en nada al inicio.",
      },
    },
    faq: faqs([
      {
        en: {
          q: "What equipment do I need?",
          a: "Resistance bands. Nothing else.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Bandas de resistencia. Nada más.",
        },
      },
      {
        en: {
          q: "What level is it for?",
          a: "It's scalable: your coach adapts the loads to where you are.",
        },
        es: {
          q: "¿Para qué nivel es?",
          a: "Es escalable: tu coach adapta las cargas a donde estás.",
        },
      },
      {
        en: {
          q: "I have knee issues. Can I do it?",
          a: "Your coach can modify the plan around them. Ask before you start.",
        },
        es: {
          q: "Tengo problemas de rodilla. ¿Puedo hacerlo?",
          a: "Tu coach puede modificar el plan alrededor de eso. Pregúntale antes de empezar.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  "upper-body": {
    slug: "upper-body",
    name: "Upper Body",
    tier: "mid",
    priceId: "PENDING_upper-body_onetime",
    price: "$185",
    priceNote: ONE_PAYMENT_NOTE,
    duration: { en: "9 weeks", es: "9 semanas" },
    hook: {
      en: {
        plain: "Shoulders, back, arms.",
        accent: "The 9-week upper build.",
      },
      es: {
        plain: "Hombros, espalda, brazos.",
        accent: "La construcción de 9 semanas.",
      },
    },
    subhead: {
      en: "Press, pull and carry your way to an upper body that shows up in every shirt.",
      es: "Empuja, jala y carga hasta tener un tren superior que se nota en cada camiseta.",
    },
    cta: { en: "Start the program", es: "Empieza el programa" },
    microcopy: ONE_PAYMENT,
    bullets: {
      en: [
        "Push/pull splits, progressive overload",
        "4-5 sessions/week",
        "Core work wired into every session",
        "Unlimited coach form checks",
      ],
      es: [
        "Divisiones de empuje y jalón, con sobrecarga progresiva",
        "4-5 sesiones por semana",
        "Trabajo de core integrado en cada sesión",
        "Revisiones de técnica ilimitadas con tu coach",
      ],
    },
    forWho: {
      en: "You want upper-body strength and definition with real programming.",
      es: "Quieres fuerza y definición en el tren superior con programación real.",
    },
    notFor: {
      en: "Your goals are cardio-first: see Max Burn.",
      es: "Tus metas son de cardio primero: mira Max Burn.",
    },
    notForLink: {
      slug: "max-burn",
      label: { en: "See Max Burn →", es: "Ver Max Burn →" },
    },
    quickWins: {
      en: [
        { value: "Today", label: "Your day 1" },
        { value: "4 to 5 a week", label: "Sessions" },
        { value: "9 weeks", label: "Start to finish" },
        { value: "Bands", label: "All you need" },
      ],
      es: [
        { value: "Hoy", label: "Tu día 1" },
        { value: "4 a 5 por semana", label: "Sesiones" },
        { value: "9 semanas", label: "De inicio a fin" },
        { value: "Bandas", label: "Todo lo que necesitas" },
      ],
    },
    hero: {
      src: hl("bench-press-54d"),
      alt: {
        en: "Athlete bench pressing under the 54D letters at the Hallandale studio",
        es: "Atleta en press de banca bajo las letras 54D del estudio de Hallandale",
      },
    },
    secondary: {
      src: hd2("v-biceps-plate"),
      alt: {
        en: "Athlete in profile mid biceps curl with a weight plate, studio stairs behind her",
        es: "Atleta de perfil en pleno curl de bíceps con un disco, las escaleras del estudio detrás",
      },
    },
    stats: [
      {
        value: { en: "9 wk", es: "9 sem" },
        label: { en: "Duration", es: "Duración" },
      },
      {
        value: { en: "4-5/wk", es: "4-5/sem" },
        label: { en: "Sessions", es: "Sesiones" },
      },
      {
        value: { en: "Bands", es: "Bandas" },
        label: { en: "All you need", es: "Todo lo que necesitas" },
      },
      {
        value: { en: "Scalable", es: "Escalable" },
        label: { en: "Level", es: "Nivel" },
      },
    ],
    progression: {
      fromLabel: { en: "Week 1", es: "Semana 1" },
      from: {
        en: "Push and pull fundamentals with strict form. You build the base volume your shoulders and back will grow on.",
        es: "Fundamentos de empuje y jalón con técnica estricta. Construyes el volumen base sobre el que van a crecer tus hombros y tu espalda.",
      },
      toLabel: { en: "Week 9", es: "Semana 9" },
      to: {
        en: "Heavier presses, weighted pulls and core wired into every session. It shows in every shirt.",
        es: "Presses más pesados, jalones con carga y core integrado en cada sesión. Se nota en cada camiseta.",
      },
    },
    faq: faqs([
      {
        en: {
          q: "What equipment do I need?",
          a: "Resistance bands. Nothing else.",
        },
        es: {
          q: "¿Qué equipo necesito?",
          a: "Bandas de resistencia. Nada más.",
        },
      },
      {
        en: {
          q: "Will it make me bulky?",
          a: "You'll build lean strength. Size comes from nutrition, not from a program alone.",
        },
        es: {
          q: "¿Me va a poner muy voluminoso?",
          a: "Vas a construir fuerza magra. El tamaño viene de la nutrición, no de un programa por sí solo.",
        },
      },
      {
        en: {
          q: "What level is it for?",
          a: "Scalable. Your coach adapts the loads to your level.",
        },
        es: {
          q: "¿Para qué nivel es?",
          a: "Escalable. Tu coach adapta las cargas a tu nivel.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
      FAQ_MEMBERSHIP,
      FAQ_REFUND,
    ]),
  },

  /* ============ RUNNERS (solo membresía) ============ */
  "runners-5k": {
    slug: "runners-5k",
    name: "Runners 5K",
    tier: "runners",
    priceId: "PENDING_membership_monthly",
    price: "$54",
    priceSuffix: "/mo",
    priceNote: TRIAL_NOTE,
    duration: { en: "Self-paced", es: "A tu ritmo" },
    hook: {
      en: {
        plain: "Your first 5K,",
        accent: "coached from couch to finish line.",
      },
      es: {
        plain: "Tu primer 5K,",
        accent: "con coach desde el sillón hasta la meta.",
      },
    },
    subhead: {
      en: "Included with 54D ON membership: the 5K plan, a real coach, and all 13 programs. $54/mo, 7-day free trial.",
      es: "Incluido en la membresía 54D ON: el plan de 5K, un coach real y los 13 programas. $54/mes, prueba gratis de 7 días.",
    },
    cta: { en: "Start free. 7 days.", es: "Empieza gratis. 7 días." },
    microcopy: MEMBERSHIP_MICROCOPY,
    bullets: {
      en: [
        "3 runs/week with walk-run progressions",
        "Strength sessions that protect your knees",
        "Coach adjusts pace to your reality",
        "Plus every 54D program included",
      ],
      es: [
        "3 salidas por semana con progresiones camina-corre",
        "Sesiones de fuerza que protegen tus rodillas",
        "Tu coach ajusta el ritmo a tu realidad",
        "Además, todos los programas de 54D incluidos",
      ],
    },
    forWho: {
      en: "You've never raced and want to finish a 5K strong.",
      es: "Nunca has competido y quieres terminar un 5K fuerte.",
    },
    notFor: {
      en: "You run sub-20 5Ks: see the 10K and 21K plans.",
      es: "Corres 5K en menos de 20 minutos: mira los planes de 10K y 21K.",
    },
    notForLink: {
      slug: "runners-10k",
      label: { en: "See Runners 10K →", es: "Ver Runners 10K →" },
    },
    quickWins: {
      en: [
        { value: "Free", label: "Your first 7 days" },
        { value: "3 a week", label: "Runs" },
        { value: "Your shoes", label: "All you need" },
        { value: "1 click", label: "To cancel" },
      ],
      es: [
        { value: "Gratis", label: "Tus primeros 7 días" },
        { value: "3 por semana", label: "Salidas" },
        { value: "Tus zapatillas", label: "Todo lo que necesitas" },
        { value: "1 clic", label: "Para cancelar" },
      ],
    },
    hero: {
      src: cg("runner-effort"),
      alt: {
        en: "Runner at full effort, face set, mid stride on the studio floor",
        es: "Corredora a máximo esfuerzo, la mirada fija, en plena zancada en el piso del estudio",
      },
    },
    secondary: {
      src: hd2("v-runner-smile"),
      alt: {
        en: "Smiling runner in a 54D tank striding up the studio ramp at an easy pace",
        es: "Corredora sonriente con top de 54D subiendo la rampa del estudio a ritmo suave",
      },
    },
    stats: [
      {
        value: { en: "5K", es: "5K" },
        label: { en: "The goal", es: "La meta" },
      },
      {
        value: { en: "3/wk", es: "3/sem" },
        label: { en: "Runs", es: "Salidas" },
      },
      {
        value: { en: "Walk-run", es: "Camina-corre" },
        label: { en: "Progressions", es: "Progresiones" },
      },
      {
        value: { en: "Beginner", es: "Principiante" },
        label: { en: "Level", es: "Nivel" },
      },
    ],
    faq: faqs([
      {
        en: {
          q: "How does the trial work?",
          a: "7 days free. Cancel before day 8 and you pay nothing.",
        },
        es: {
          q: "¿Cómo funciona la prueba?",
          a: "7 días gratis. Cancela antes del día 8 y no pagas nada.",
        },
      },
      {
        en: { q: "Can I cancel?", a: "Anytime, straight from your account." },
        es: {
          q: "¿Puedo cancelar?",
          a: "Cuando quieras, directo desde tu cuenta.",
        },
      },
      {
        en: {
          q: "Why is this membership only?",
          a: "Run plans live alongside the strength content you'll need. The membership includes both, plus every other 54D program.",
        },
        es: {
          q: "¿Por qué solo está en la membresía?",
          a: "Los planes de carrera viven junto al contenido de fuerza que vas a necesitar. La membresía incluye los dos, más todos los demás programas de 54D.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
    ]),
  },

  "runners-10k": {
    slug: "runners-10k",
    name: "Runners 10K",
    tier: "runners",
    priceId: "PENDING_membership_monthly",
    price: "$54",
    priceSuffix: "/mo",
    priceNote: TRIAL_NOTE,
    duration: { en: "Self-paced", es: "A tu ritmo" },
    hook: {
      en: { plain: "Double the distance.", accent: "Own the 10K." },
      es: { plain: "El doble de distancia.", accent: "Domina el 10K." },
    },
    subhead: {
      en: "The 10K plan plus unlimited coaching and every 54D program. $54/mo, free for 7 days.",
      es: "El plan de 10K más coaching ilimitado y todos los programas de 54D. $54/mes, gratis por 7 días.",
    },
    cta: { en: "Start free. 7 days.", es: "Empieza gratis. 7 días." },
    microcopy: MEMBERSHIP_MICROCOPY,
    bullets: {
      en: [
        "4 runs/week: tempo, intervals, long run",
        "Runner-specific strength twice a week",
        "Race-day pacing strategy from your coach",
        "All 13 programs included",
      ],
      es: [
        "4 salidas por semana: tempo, intervalos, salida larga",
        "Fuerza específica para corredores dos veces por semana",
        "Estrategia de ritmo para el día de la carrera, de tu coach",
        "Los 13 programas incluidos",
      ],
    },
    forWho: {
      en: "You run 5Ks and want the next distance done right.",
      es: "Corres 5K y quieres la siguiente distancia bien hecha.",
    },
    notFor: {
      en: "You're a first-time runner: start at 5K.",
      es: "Es tu primera vez corriendo: empieza en 5K.",
    },
    notForLink: {
      slug: "runners-5k",
      label: { en: "See Runners 5K →", es: "Ver Runners 5K →" },
    },
    quickWins: {
      en: [
        { value: "Free", label: "Your first 7 days" },
        { value: "4 a week", label: "Runs" },
        { value: "2 a week", label: "Strength" },
        { value: "1 click", label: "To cancel" },
      ],
      es: [
        { value: "Gratis", label: "Tus primeros 7 días" },
        { value: "4 por semana", label: "Salidas" },
        { value: "2 por semana", label: "Fuerza" },
        { value: "1 clic", label: "Para cancelar" },
      ],
    },
    hero: {
      src: hd("cg-runner-vertical"),
      alt: {
        en: "Runner in full stride across the Coral Gables studio",
        es: "Corredora en plena zancada cruzando el estudio de Coral Gables",
      },
    },
    secondary: {
      src: hd2("v-quad-stretch"),
      alt: {
        en: "Runner airborne mid plyometric jump over the floor ladder beside the studio stairs",
        es: "Corredora en el aire en pleno salto pliométrico sobre la escalera de piso, junto a las escaleras del estudio",
      },
    },
    stats: [
      {
        value: { en: "10K", es: "10K" },
        label: { en: "The goal", es: "La meta" },
      },
      {
        value: { en: "4/wk", es: "4/sem" },
        label: { en: "Runs", es: "Salidas" },
      },
      {
        value: { en: "2/wk", es: "2/sem" },
        label: { en: "Strength sessions", es: "Sesiones de fuerza" },
      },
      {
        value: { en: "Intermediate", es: "Intermedio" },
        label: { en: "Level", es: "Nivel" },
      },
    ],
    faq: faqs([
      {
        en: {
          q: "How does the trial work?",
          a: "7 days free. Cancel before day 8 and you pay nothing.",
        },
        es: {
          q: "¿Cómo funciona la prueba?",
          a: "7 días gratis. Cancela antes del día 8 y no pagas nada.",
        },
      },
      {
        en: { q: "Can I cancel?", a: "Anytime, straight from your account." },
        es: {
          q: "¿Puedo cancelar?",
          a: "Cuando quieras, directo desde tu cuenta.",
        },
      },
      {
        en: {
          q: "How long is the plan?",
          a: "Progressive blocks that build to race day.",
        },
        es: {
          q: "¿Cuánto dura el plan?",
          a: "Bloques progresivos que te construyen hasta el día de la carrera.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
    ]),
  },

  "runners-21k": {
    slug: "runners-21k",
    name: "Runners 21K",
    tier: "runners",
    priceId: "PENDING_membership_monthly",
    price: "$54",
    priceSuffix: "/mo",
    priceNote: TRIAL_NOTE,
    duration: { en: "Self-paced", es: "A tu ritmo" },
    hook: {
      en: {
        plain: "21K is not a longer run.",
        accent: "It's a different you.",
      },
      es: {
        plain: "21K no es una salida más larga.",
        accent: "Es otro tú.",
      },
    },
    subhead: {
      en: "Half-marathon training with a coach who's watching your load, not just your pace. $54/mo, 7-day trial.",
      es: "Entrenamiento de media maratón con un coach que mira tu carga, no solo tu ritmo. $54/mes, prueba de 7 días.",
    },
    cta: { en: "Start free. 7 days.", es: "Empieza gratis. 7 días." },
    microcopy: MEMBERSHIP_MICROCOPY,
    bullets: {
      en: [
        "4-5 runs/week with structured long-run builds",
        "Strength + mobility to survive the mileage",
        "Fueling and taper guidance",
        "Unlimited coach + all programs included",
      ],
      es: [
        "4-5 salidas por semana con salidas largas estructuradas",
        "Fuerza + movilidad para sobrevivir al kilometraje",
        "Guía de alimentación y de descarga previa a la carrera",
        "Coach ilimitado + todos los programas incluidos",
      ],
    },
    forWho: {
      en: "You've raced 10K and want the half without breaking.",
      es: "Ya corriste un 10K y quieres la media sin romperte.",
    },
    notFor: {
      en: "You're a new runner: the mileage will eat you.",
      es: "Eres corredor nuevo: el kilometraje te va a comer.",
    },
    notForLink: {
      slug: "runners-5k",
      label: { en: "See Runners 5K →", es: "Ver Runners 5K →" },
    },
    quickWins: {
      en: [
        { value: "Free", label: "Your first 7 days" },
        { value: "4 to 5 a week", label: "Runs" },
        { value: "Your shoes", label: "All you need" },
        { value: "1 click", label: "To cancel" },
      ],
      es: [
        { value: "Gratis", label: "Tus primeros 7 días" },
        { value: "4 a 5 por semana", label: "Salidas" },
        { value: "Tus zapatillas", label: "Todo lo que necesitas" },
        { value: "1 clic", label: "Para cancelar" },
      ],
    },
    hero: {
      src: hd("cg-ramp-runners-wide"),
      alt: {
        en: "Runners charging up the ramp together at the 54D Coral Gables studio",
        es: "Corredores subiendo juntos la rampa del estudio 54D de Coral Gables",
      },
    },
    secondary: {
      src: hd2("spare-man-running"),
      alt: {
        en: "Runner grinding up the studio ramp, effort on his face, the group at his back",
        es: "Corredor peleando la subida de la rampa del estudio, el esfuerzo en la cara y el grupo a su espalda",
      },
    },
    stats: [
      {
        value: { en: "21K", es: "21K" },
        label: { en: "The goal", es: "La meta" },
      },
      {
        value: { en: "4-5/wk", es: "4-5/sem" },
        label: { en: "Runs", es: "Salidas" },
      },
      {
        value: { en: "Strength", es: "Fuerza" },
        label: { en: "Plus mobility work", es: "Más trabajo de movilidad" },
      },
      {
        value: { en: "Advanced", es: "Avanzado" },
        label: { en: "Level", es: "Nivel" },
      },
    ],
    faq: faqs([
      {
        en: {
          q: "How does the trial work?",
          a: "7 days free. Cancel before day 8 and you pay nothing.",
        },
        es: {
          q: "¿Cómo funciona la prueba?",
          a: "7 días gratis. Cancela antes del día 8 y no pagas nada.",
        },
      },
      {
        en: { q: "Can I cancel?", a: "Anytime, straight from your account." },
        es: {
          q: "¿Puedo cancelar?",
          a: "Cuando quieras, directo desde tu cuenta.",
        },
      },
      {
        en: {
          q: "I have an injury history. Can I train this?",
          a: "Your coach adapts the volume. Tell them upfront.",
        },
        es: {
          q: "Tengo historial de lesiones. ¿Puedo entrenarlo?",
          a: "Tu coach adapta el volumen. Cuéntaselo desde el principio.",
        },
      },
      FAQ_MISS,
      FAQ_APP,
      FAQ_COUNTRY,
    ]),
  },
};
