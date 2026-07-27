/* ============================================================
   Data de las landings por programa: /programs/:slug
   Fuente: docs/marketing/PROGRAM_LANDINGS.md (27/07/2026).
   Precios reales de store.54d.com; priceIds EXACTOS de on.tsx
   (PENDING_* hasta que el cliente confirme las keys de Stripe).
   Fotos del ledger del doc (max 2 usos por foto). Copy EN final,
   sin em/en dashes (regla COPY_V3).
   ============================================================ */

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
  alt: string;
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
  priceNote: string;
  duration: string;
  /** H1 del hero, partido para el span .accent */
  hook: { plain: string; accent: string };
  subhead: string;
  /** Copy del CTA principal (por tier, doc §2) */
  cta: string;
  /** Microcopy bajo el botón */
  microcopy: string;
  /** Urgencia suave (solo starters) */
  urgency?: string;
  /** Punteos de WHAT YOU'LL DO (el ✓ lo pinta el template) */
  bullets: string[];
  /** "This is for you if..." (1 línea) */
  forWho: string;
  /** "This is NOT for you if..." (1 línea) */
  notFor: string;
  hero: LandingImage;
  secondary?: LandingImage;
  /** Stat cards de THE STRUCTURE (se omite en starters: página corta) */
  stats?: { value: string; label: string }[];
  /** Semana tipo week 1 vs week final (solo mids) */
  progression?: { fromLabel: string; from: string; toLabel: string; to: string };
  /** "Your 9 weeks": fases por ciclo de 18 días (solo flagship) */
  phases?: { label: string; title: string; desc: string }[];
  faq: { q: string; a: string }[];
};

const hd = (f: string) => `images/hd/${f}.jpg`;
const cg = (f: string) => `images/studios/coral-gables/${f}.jpg`;
const hl = (f: string) => `images/studios/hallandale/${f}.jpg`;

const ONE_PAYMENT = "One payment · Coach included · 30-day money-back guarantee";
const MEMBERSHIP_MICROCOPY = "7 days free · Cancel anytime · 30-day guarantee";
const URGENCY_14 = "14 days from now you'll wish you started today.";

const REFUND_FAQ = {
  q: "What's the refund policy?",
  a: "Full refund within 30 days. No interrogation, no fine print.",
};

export const PROGRAM_LANDINGS: Record<ProgramSlug, ProgramLanding> = {
  /* ============ FLAGSHIP $385/$400 ============ */
  "54d-on": {
    slug: "54d-on",
    name: "54D ON",
    tier: "flagship",
    priceId: "PENDING_54d-on_onetime",
    price: "$385",
    priceNote: "one payment",
    duration: "9 weeks",
    hook: { plain: "54 days. A different body.", accent: "A different you." },
    subhead:
      "The complete 54D transformation method, with a real coach on your side for 9 weeks.",
    cta: "Reserve my spot · Starts Monday",
    microcopy: ONE_PAYMENT,
    bullets: [
      "Train 6 days a week with structured 45-min sessions",
      "Follow the method that built 54D: strength, cardio, discipline",
      "Get your form checked by a certified coach, unlimited",
      "Track every phase across 3 cycles of 18 days",
      "Earn the 54D badge when you finish",
    ],
    forWho:
      "You're ready to commit 9 weeks and want a coach holding you accountable.",
    notFor: "You want a casual workout you can skip without anyone noticing.",
    hero: {
      src: hd("cg-ramp-runners-wide"),
      alt: "Group of athletes sprinting up the ramp at the 54D Coral Gables studio",
    },
    secondary: {
      src: cg("graduation-celebration-01"),
      alt: "A 54D generation celebrating graduation together on the training floor",
    },
    stats: [
      { value: "9 wk", label: "Duration" },
      { value: "6/wk", label: "Sessions" },
      { value: "45 min", label: "Per session" },
      { value: "3", label: "Cycles of 18 days" },
    ],
    phases: [
      {
        label: "Days 1-18",
        title: "Cycle 1: Foundation",
        desc: "Structured 45-min sessions build the habit. Your coach checks your form from day one and calibrates the plan to your level.",
      },
      {
        label: "Days 19-36",
        title: "Cycle 2: Build",
        desc: "Intensity rises. Strength, cardio and discipline stack week over week, and your coach adjusts the load as your body answers.",
      },
      {
        label: "Days 37-54",
        title: "Cycle 3: Prove it",
        desc: "The hardest block of the method. You finish the 54 days, and you earn the 54D badge.",
      },
    ],
    faq: [
      {
        q: "When does it start?",
        a: "Every Monday. A new generation kicks off each week: reserve your spot and you start the next one.",
      },
      {
        q: "Do I need a gym?",
        a: "No. Dumbbells and space to move are enough. Every session is built for wherever you train.",
      },
      {
        q: "What if I miss a day?",
        a: "Your coach adjusts the plan and you keep going. You don't start over.",
      },
      REFUND_FAQ,
    ],
  },

  "step-2": {
    slug: "step-2",
    name: "Step 2",
    tier: "flagship",
    priceId: "PENDING_step-2_onetime",
    price: "$400",
    priceNote: "one payment",
    duration: "9 weeks",
    hook: {
      plain: "You finished 54D.",
      accent: "Now go where most people never do.",
    },
    subhead:
      "The advanced 9-week program for graduates who want more load, more speed, more.",
    cta: "Reserve my spot · Starts Monday",
    microcopy: ONE_PAYMENT,
    bullets: [
      "Heavier lifts and advanced progressions",
      "6 sessions/week built on the 54D base",
      "Unlimited coach feedback on every rep",
      "Performance benchmarks each 18-day cycle",
    ],
    forWho:
      "You completed 54D ON (or train at that level) and want the next ceiling.",
    notFor: "It's your first structured program: start with 54D ON.",
    hero: {
      src: hd("cg-overhead-press"),
      alt: "Athlete driving a loaded barbell overhead under studio lights",
    },
    secondary: {
      src: cg("barbell-press-class-01"),
      alt: "Class pressing loaded barbells in sync at the Coral Gables studio",
    },
    stats: [
      { value: "9 wk", label: "Duration" },
      { value: "6/wk", label: "Sessions" },
      { value: "18", label: "Day cycles, benchmarked" },
      { value: "Advanced", label: "Level" },
    ],
    phases: [
      {
        label: "Days 1-18",
        title: "Cycle 1: Recalibrate",
        desc: "Heavier baselines than 54D ON. Performance benchmarks set your new starting line.",
      },
      {
        label: "Days 19-36",
        title: "Cycle 2: Overload",
        desc: "Advanced progressions: more load, more speed. Your coach reviews every rep that matters.",
      },
      {
        label: "Days 37-54",
        title: "Cycle 3: Peak",
        desc: "The heaviest lifts of the program and the final benchmarks. This is where most people never go.",
      },
    ],
    faq: [
      {
        q: "Do I need to have finished 54D ON?",
        a: "It's built for 54D ON graduates. Advanced athletes who train at that level can join too.",
      },
      {
        q: "What equipment do I need?",
        a: "Dumbbells, and a bar if you have one. Nothing else.",
      },
      {
        q: "When does it start?",
        a: "Mondays. Reserve your spot and start the next one.",
      },
      REFUND_FAQ,
    ],
  },

  /* ============ STARTERS $19-$39 ============ */
  "emergency-kit": {
    slug: "emergency-kit",
    name: "Emergency Kit",
    tier: "starter",
    priceId: "PENDING_emergency-kit_onetime",
    price: "$39",
    priceNote: "one payment",
    duration: "14 days",
    hook: {
      plain: "Big date? Beach trip?",
      accent: "You have 14 days. Use them.",
    },
    subhead: "The 2-week emergency plan to look and feel sharper, fast.",
    cta: "Start today",
    microcopy: ONE_PAYMENT,
    urgency: URGENCY_14,
    bullets: [
      "Daily 30-min high-intensity sessions",
      "Full-body burn, zero filler",
      "Simple daily checklist",
      "Coach in your corner the whole 14 days",
    ],
    forWho: "You have a deadline and want maximum result per day.",
    notFor: "You want long-term transformation: that's a 9-week program.",
    hero: {
      src: cg("boxer-closeup"),
      alt: "Close-up of a boxer mid combination, gloves up and eyes locked",
    },
    faq: [
      {
        q: "Is 14 days really enough?",
        a: "Enough to change how you look and feel. Not your life: that takes 54 days.",
      },
      {
        q: "What equipment do I need?",
        a: "Minimal. The plan works with what you have at home.",
      },
      REFUND_FAQ,
    ],
  },

  "max-burn": {
    slug: "max-burn",
    name: "Max Burn",
    tier: "starter",
    priceId: "PENDING_max-burn_onetime",
    price: "$39",
    priceNote: "one payment",
    duration: "14 days",
    hook: {
      plain: "14 days of the hardest cardio",
      accent: "you'll love finishing.",
    },
    subhead:
      "Pure conditioning: short, brutal, done before your excuses wake up.",
    cta: "Start today",
    microcopy: ONE_PAYMENT,
    urgency: URGENCY_14,
    bullets: [
      "Daily HIIT sessions under 35 min",
      "Heart-rate zones that actually burn fat",
      "Zero equipment needed",
      "Coach keeps you honest daily",
    ],
    forWho: "You want to sweat hard and jumpstart your engine.",
    notFor: "Your goals are strength-first: see Upper Body or Lower Body.",
    hero: {
      src: cg("group-cardio-session-01"),
      alt: "Group cardio session at full intensity on the 54D training floor",
    },
    secondary: {
      src: cg("spin-bikes-boxing-bags-01"),
      alt: "Spin bikes and boxing bags lined up on the 54D training floor",
    },
    faq: [
      {
        q: "What fitness level do I need?",
        a: "Any. The intensity is scalable and your coach keeps it honest.",
      },
      { q: "What equipment do I need?", a: "None. Zero." },
      REFUND_FAQ,
    ],
  },

  "reset-7": {
    slug: "reset-7",
    name: "Reset 7",
    tier: "starter",
    priceId: "PENDING_reset-7_onetime",
    price: "$19",
    priceNote: "one payment",
    duration: "7 days",
    hook: {
      plain: "One week to remember",
      accent: "what your body can do.",
    },
    subhead: "7 days of movement, mobility and momentum for $19. Start today.",
    cta: "Start today",
    microcopy: ONE_PAYMENT,
    urgency: "A week from now you'll wish you started today.",
    bullets: [
      "One short session daily, 20-30 min",
      "Mobility + light strength + walks",
      "Sleep and hydration micro-goals",
      "Coach support all week",
    ],
    forWho: "You're stuck and need a low-stakes way back in.",
    notFor: "You're already training consistently.",
    hero: {
      src: cg("training-floor-recovery-01"),
      alt: "Athletes stretching and recovering together on the training floor",
    },
    faq: [
      {
        q: "Only $19. What's the catch?",
        a: "None. It's the front door to 54D.",
      },
      { q: "What equipment do I need?", a: "None." },
      REFUND_FAQ,
    ],
  },

  "first-move": {
    slug: "first-move",
    name: "First Move",
    tier: "starter",
    priceId: "PENDING_first-move_onetime",
    price: "$39",
    priceNote: "one payment",
    duration: "14 days",
    hook: {
      plain: "The hardest part is starting.",
      accent: "This is starting, made easy.",
    },
    subhead:
      "14 days built for absolute beginners, with a real coach so you never feel lost.",
    cta: "Start today",
    microcopy: ONE_PAYMENT,
    urgency: URGENCY_14,
    bullets: [
      "Gentle daily sessions from 20 min",
      "Learn the fundamental movements right",
      "A coach answers every question, no shame",
      "Build the habit before the intensity",
    ],
    forWho: "You haven't trained in years (or ever) and want a kind start.",
    notFor: "You're an experienced athlete: you'll be bored.",
    hero: {
      src: cg("coach-correction"),
      alt: "A 54D coach correcting an athlete's form mid movement",
    },
    secondary: {
      src: hd("hl-laugh"),
      alt: "Two athletes laughing between sets at the 54D studio",
    },
    faq: [
      {
        q: "I'm really out of shape. Can I do this?",
        a: "This exists exactly for you. Gentle sessions, zero assumptions.",
      },
      { q: "What equipment do I need?", a: "None." },
      {
        q: "What comes after the 14 days?",
        a: "Full Body is the natural next step.",
      },
      REFUND_FAQ,
    ],
  },

  "booty-on-fire": {
    slug: "booty-on-fire",
    name: "Booty on Fire",
    tier: "starter",
    priceId: "PENDING_booty-on-fire_onetime",
    price: "$39",
    priceNote: "one payment",
    duration: "14 days",
    hook: { plain: "14 days. One goal.", accent: "You know which one." },
    subhead: "Glute-focused training that burns today and shows in two weeks.",
    cta: "Start today",
    microcopy: ONE_PAYMENT,
    urgency: URGENCY_14,
    bullets: [
      "Daily glute + lower-body targeted sessions",
      "Progressive activation to hip thrusts",
      "Band and bodyweight, home-friendly",
      "Coach checks your form so it works",
    ],
    forWho: "You want a focused glute kickstart, now.",
    notFor: "You want full lower-body strength: that's Lower Body, 9 weeks.",
    hero: {
      src: cg("group-squat-class-01"),
      alt: "Full class holding the bottom of a squat together at the studio",
    },
    faq: [
      {
        q: "What equipment do I need?",
        a: "A band helps, but it's not required.",
      },
      {
        q: "Will I see results in 14 days?",
        a: "Activation and shape changes, yes. Keep going for more.",
      },
      REFUND_FAQ,
    ],
  },

  /* ============ MIDS $95-$185 ============ */
  "full-body": {
    slug: "full-body",
    name: "Full Body",
    tier: "mid",
    priceId: "PENDING_full-body_onetime",
    price: "$95",
    priceNote: "one payment",
    duration: "4 weeks",
    hook: { plain: "Four weeks. Every muscle.", accent: "One plan." },
    subhead:
      "The complete-body reset for people who want results without a 2-hour gym life.",
    cta: "Get the program",
    microcopy: ONE_PAYMENT,
    bullets: [
      "45-min full-body sessions, 5x/week",
      "Strength + conditioning in every workout",
      "Coach feedback whenever you need it",
      "A finish-line test in week 4",
    ],
    forWho: "You want a serious month of training with everything covered.",
    notFor: "You want a 9-week transformation: that's 54D ON.",
    hero: {
      src: hd("cg-gym-wide"),
      alt: "Wide view of the 54D Coral Gables training floor mid session",
    },
    secondary: {
      src: hd("cg-effort-yellow-d"),
      alt: "Athlete at full effort beside the yellow 54D letters",
    },
    stats: [
      { value: "4 wk", label: "Duration" },
      { value: "5/wk", label: "Sessions" },
      { value: "45 min", label: "Per session" },
      { value: "All", label: "Levels" },
    ],
    progression: {
      fromLabel: "Week 1",
      from: "Full-body sessions that groove the patterns: strength plus conditioning, 45 minutes, done.",
      toLabel: "Week 4",
      to: "Same structure, heavier and faster, capped with the finish-line test.",
    },
    faq: [
      { q: "Home or gym?", a: "Either. Dumbbells are enough." },
      {
        q: "What happens after the 4 weeks?",
        a: "Most people continue into 54D ON. This month is the perfect ramp.",
      },
      { q: "What level is it for?", a: "All levels. Sessions scale with you." },
      REFUND_FAQ,
    ],
  },

  "lower-body": {
    slug: "lower-body",
    name: "Lower Body",
    tier: "mid",
    priceId: "PENDING_lower-body_onetime",
    price: "$185",
    priceNote: "one payment",
    duration: "9 weeks",
    hook: {
      plain: "Legs that carry you further.",
      accent: "Built in 9 weeks.",
    },
    subhead:
      "A focused lower-body program with a coach checking your squat, not a video guessing.",
    cta: "Get the program",
    microcopy: ONE_PAYMENT,
    bullets: [
      "Squat, hinge and lunge patterns, progressively loaded",
      "4-5 sessions/week, 40 min each",
      "Explosive work: jumps and sprints",
      "Coach reviews your form in the app",
    ],
    forWho: "You want visible lower-body strength and shape with structure.",
    notFor: "You're after a full-body plan: see Full Body or 54D ON.",
    hero: {
      src: cg("jump-training-54d-wall-01"),
      alt: "Athlete mid box jump in front of the 54D wall",
    },
    secondary: {
      src: cg("ramp-climb-vertical"),
      alt: "Athlete climbing the studio ramp, shot from below",
    },
    stats: [
      { value: "9 wk", label: "Duration" },
      { value: "4-5/wk", label: "Sessions" },
      { value: "40 min", label: "Per session" },
      { value: "Scalable", label: "Level" },
    ],
    progression: {
      fromLabel: "Week 1",
      from: "Squat, hinge and lunge patterns at controlled loads. Your coach calibrates depth and form before the weight goes up.",
      toLabel: "Week 9",
      to: "Progressively loaded lifts plus explosive jumps and sprints. The finish looks nothing like the start.",
    },
    faq: [
      {
        q: "What equipment do I need?",
        a: "Dumbbells. A band helps but is optional.",
      },
      {
        q: "What level is it for?",
        a: "It's scalable: your coach adapts the loads to where you are.",
      },
      {
        q: "I have knee issues. Can I do it?",
        a: "Your coach can modify the plan around them. Ask before you start.",
      },
      REFUND_FAQ,
    ],
  },

  "upper-body": {
    slug: "upper-body",
    name: "Upper Body",
    tier: "mid",
    priceId: "PENDING_upper-body_onetime",
    price: "$185",
    priceNote: "one payment",
    duration: "9 weeks",
    hook: {
      plain: "Shoulders, back, arms.",
      accent: "The 9-week upper build.",
    },
    subhead:
      "Press, pull and carry your way to an upper body that shows up in every shirt.",
    cta: "Get the program",
    microcopy: ONE_PAYMENT,
    bullets: [
      "Push/pull splits, progressive overload",
      "4-5 sessions/week",
      "Core work wired into every session",
      "Unlimited coach form checks",
    ],
    forWho: "You want upper-body strength and definition with real programming.",
    notFor: "Your goals are cardio-first: see Max Burn.",
    hero: {
      src: hl("bench-press-54d"),
      alt: "Athlete bench pressing under the 54D letters at the Hallandale studio",
    },
    secondary: {
      src: hl("dumbbell-press"),
      alt: "Athlete pressing dumbbells overhead at the Hallandale studio",
    },
    stats: [
      { value: "9 wk", label: "Duration" },
      { value: "4-5/wk", label: "Sessions" },
      { value: "Dumbbells", label: "Bench optional" },
      { value: "Scalable", label: "Level" },
    ],
    progression: {
      fromLabel: "Week 1",
      from: "Push and pull fundamentals with strict form. You build the base volume your shoulders and back will grow on.",
      toLabel: "Week 9",
      to: "Heavier presses, weighted pulls and core wired into every session. It shows in every shirt.",
    },
    faq: [
      {
        q: "What equipment do I need?",
        a: "Dumbbells. A bench helps but is optional.",
      },
      {
        q: "Will it make me bulky?",
        a: "You'll build lean strength. Size comes from nutrition, not from a program alone.",
      },
      {
        q: "What level is it for?",
        a: "Scalable. Your coach adapts the loads to your level.",
      },
      REFUND_FAQ,
    ],
  },

  /* ============ RUNNERS (solo membresía) ============ */
  "runners-5k": {
    slug: "runners-5k",
    name: "Runners 5K",
    tier: "runners",
    priceId: "PENDING_membership_monthly",
    price: "$54",
    priceSuffix: "/mo",
    priceNote: "7-day free trial",
    duration: "Self-paced",
    hook: {
      plain: "Your first 5K,",
      accent: "coached from couch to finish line.",
    },
    subhead:
      "Included with 54D ON membership: the 5K plan, a real coach, and all 10 programs. $54/mo, 7-day free trial.",
    cta: "Start free. 7 days.",
    microcopy: MEMBERSHIP_MICROCOPY,
    bullets: [
      "3 runs/week with walk-run progressions",
      "Strength sessions that protect your knees",
      "Coach adjusts pace to your reality",
      "Plus every 54D program included",
    ],
    forWho: "You've never raced and want to finish a 5K strong.",
    notFor: "You run sub-20 5Ks: see the 10K and 21K plans.",
    hero: {
      src: cg("runner-effort"),
      alt: "Runner at full effort, face set, mid stride on the studio floor",
    },
    stats: [
      { value: "5K", label: "The goal" },
      { value: "3/wk", label: "Runs" },
      { value: "Walk-run", label: "Progressions" },
      { value: "Beginner", label: "Level" },
    ],
    faq: [
      {
        q: "Why is this membership only?",
        a: "Run plans live alongside the strength content you'll need. The membership includes both, plus every other 54D program.",
      },
      { q: "Can I cancel?", a: "Anytime, straight from your account." },
      {
        q: "How does the trial work?",
        a: "7 days free. Cancel before day 8 and you pay nothing.",
      },
    ],
  },

  "runners-10k": {
    slug: "runners-10k",
    name: "Runners 10K",
    tier: "runners",
    priceId: "PENDING_membership_monthly",
    price: "$54",
    priceSuffix: "/mo",
    priceNote: "7-day free trial",
    duration: "Self-paced",
    hook: { plain: "Double the distance.", accent: "Own the 10K." },
    subhead:
      "The 10K plan plus unlimited coaching and every 54D program. $54/mo, free for 7 days.",
    cta: "Start free. 7 days.",
    microcopy: MEMBERSHIP_MICROCOPY,
    bullets: [
      "4 runs/week: tempo, intervals, long run",
      "Runner-specific strength twice a week",
      "Race-day pacing strategy from your coach",
      "All 10 programs included",
    ],
    forWho: "You run 5Ks and want the next distance done right.",
    notFor: "You're a first-time runner: start at 5K.",
    hero: {
      src: hd("cg-runner-vertical"),
      alt: "Runner in full stride across the Coral Gables studio",
    },
    secondary: {
      src: cg("sprint-vertical"),
      alt: "Athlete sprinting flat out down the studio floor",
    },
    stats: [
      { value: "10K", label: "The goal" },
      { value: "4/wk", label: "Runs" },
      { value: "2/wk", label: "Strength sessions" },
      { value: "Intermediate", label: "Level" },
    ],
    faq: [
      {
        q: "How long is the plan?",
        a: "Progressive blocks that build to race day.",
      },
      { q: "Can I cancel?", a: "Anytime, straight from your account." },
      {
        q: "How does the trial work?",
        a: "7 days free. Cancel before day 8 and you pay nothing.",
      },
    ],
  },

  "runners-21k": {
    slug: "runners-21k",
    name: "Runners 21K",
    tier: "runners",
    priceId: "PENDING_membership_monthly",
    price: "$54",
    priceSuffix: "/mo",
    priceNote: "7-day free trial",
    duration: "Self-paced",
    hook: {
      plain: "21K is not a longer run.",
      accent: "It's a different you.",
    },
    subhead:
      "Half-marathon training with a coach who's watching your load, not just your pace. $54/mo, 7-day trial.",
    cta: "Start free. 7 days.",
    microcopy: MEMBERSHIP_MICROCOPY,
    bullets: [
      "4-5 runs/week with structured long-run builds",
      "Strength + mobility to survive the mileage",
      "Fueling and taper guidance",
      "Unlimited coach + all programs included",
    ],
    forWho: "You've raced 10K and want the half without breaking.",
    notFor: "You're a new runner: the mileage will eat you.",
    hero: {
      src: hd("cg-ramp-runners-wide"),
      alt: "Runners charging up the ramp together at the 54D Coral Gables studio",
    },
    secondary: {
      src: hd("cg-stairs-group"),
      alt: "Training group climbing the stairs together at first light",
    },
    stats: [
      { value: "21K", label: "The goal" },
      { value: "4-5/wk", label: "Runs" },
      { value: "Strength", label: "Plus mobility work" },
      { value: "Advanced", label: "Level" },
    ],
    faq: [
      {
        q: "I have an injury history. Can I train this?",
        a: "Your coach adapts the volume. Tell them upfront.",
      },
      { q: "Can I cancel?", a: "Anytime, straight from your account." },
      {
        q: "How does the trial work?",
        a: "7 days free. Cancel before day 8 and you pay nothing.",
      },
    ],
  },
};
