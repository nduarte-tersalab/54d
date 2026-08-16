import { Link } from "react-router";
import type { Route } from "./+types/studios";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS, cityLabel } from "../data/studios";
import { asset } from "../lib/asset";
import { resolveLang, useLang, type Lang } from "../lib/i18n";

/* ============================================================
   /studios: index de sedes (54D Studios)
   Funnel: consideración presencial high-ticket (flagship, por
   aplicación: el CTA es la consulta, nunca carrito). Copy según
   SITE_STRATEGY.md, COPY_V3.md y SEPARATION_SPEC.md §3 (sin
   em/en dashes en copy visible).
   i18n fase 1: copy visible bilingüe EN/ES vía useLang. SEO (meta)
   y alt/aria quedan EN, idioma principal indexado.
   Fotos reales según ART_DIRECTION_V3.md + IMAGES_BRAND.md.
   ============================================================ */

export async function loader({ request }: Route.LoaderArgs) {
  return { lang: resolveLang(request) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const es = loaderData?.lang === "es";
  return [
    {
      title: es
        ? "54D Studios: la experiencia insignia en 3 países"
        : "54D Studios: The Flagship Experience in 3 Countries",
    },
    {
      name: "description",
      content: es
        ? "El Método 54D presencial: un equipo dedicado de coaches, nutricionista y fisioterapia. Admisión por Generación, por solicitud. Miami, Ciudad de México, Bogotá."
        : "The 54D Method in person: a dedicated team of coaches, nutritionist, and physiotherapy. Admission by Generation, by application. Miami, Mexico City, Bogotá.",
    },
  ];
}

/* Display de ciudad: cityLabel compartido y localizado en data/studios.ts
   (una sola fuente con footer y detalle de sede). */

/* Thumbnail por sede para el chooser: SOLO sedes con galería curada
   propia. LATAM: fotos de los perfiles de Google de cada sede
   (pedido cliente 06/08). Verificadas sin bolsas/conos. */
const SEDE_THUMBS: Record<string, { src: string; alt: string }> = {
  "coral-gables": {
    src: "images/studios/coral-gables/mural-54d-editorial-wide.jpg",
    alt: "An athlete mid drill in front of the giant 54D mural at the Coral Gables studio",
  },
  hallandale: {
    src: "images/studios/hallandale/mural-54d-members-wide.jpg",
    alt: "Two 54D members standing under the giant 54D mural at the Hallandale studio",
  },
  "mexico-carso": {
    src: "images/studios/mexico-carso/reception-54d.jpg",
    alt: "Reception desk with the 54D logo at the Plaza Carso studio",
  },
  "mexico-santa-fe": {
    src: "images/studios/mexico-santa-fe/facade-generation.jpg",
    alt: "A full 54D Generation posing outside the glass facade of the Santa Fe studio",
  },
  bogota: {
    src: "images/studios/bogota/container-facade.jpg",
    alt: "The black and yellow container facade of the 54D Bogota studio",
  },
};

/* La experiencia presencial: qué la hace distinta a entrenar solo */
const EXPERIENCE = {
  en: [
    {
      num: "01",
      name: "Small groups",
      desc: "No one gets lost in the crowd. Limited spots per Generation, so every session has your name on it and your form gets real attention.",
    },
    {
      num: "02",
      name: "Coaches on the floor",
      desc: "You don't follow a screen. A coach two meters away corrects you. Every rep counts because someone is watching it.",
    },
    {
      num: "03",
      name: "Nutritionist",
      desc: "Your nutrition protocol is built and adjusted at the studio, with real measurements. What you eat is part of the program.",
    },
    {
      num: "04",
      name: "Physiotherapy",
      desc: "Prevention and recovery inside the program. You train hard for 54 days because a team makes sure you cross the finish line in one piece.",
    },
  ],
  es: [
    {
      num: "01",
      name: "Grupos reducidos",
      desc: "Nadie se pierde en la multitud. Cupos limitados por Generación: cada sesión lleva tu nombre y tu técnica recibe atención real.",
    },
    {
      num: "02",
      name: "Coaches en el piso",
      desc: "No sigues una pantalla. Un coach a dos metros te corrige. Cada repetición cuenta porque alguien la está viendo.",
    },
    {
      num: "03",
      name: "Nutricionista",
      desc: "Tu protocolo de nutrición se construye y se ajusta en el studio, con mediciones reales. Lo que comes es parte del programa.",
    },
    {
      num: "04",
      name: "Fisioterapia",
      desc: "Prevención y recuperación dentro del programa. Entrenas fuerte 54 días porque un equipo se asegura de que cruces la meta sin romperte.",
    },
  ],
};

/* Cómo funcionan las generaciones: fecha de inicio + cupo limitado */
const GENERATION_TIMELINE = {
  en: [
    {
      day: "Today",
      title: "Request a consultation",
      desc: "Admission is by Generation: one start date, limited places, no rolling entry. Your consultation covers fit, dates, and the investment.",
    },
    {
      day: "D01",
      title: "Your Generation starts",
      desc: "Everyone starts the same day, with the same initial assessment. No one joins late and no one starts alone.",
    },
    {
      day: "D01 to D54",
      title: "Same group, 54 days",
      desc: "You train with the same people and the same coaches through the entire program. The pressure of the group is part of the method.",
    },
    {
      day: "D54",
      title: "Your Generation closes",
      desc: "Final measurements, results on the table, and how you keep them. The program ends. The new you doesn't.",
    },
  ],
  es: [
    {
      day: "Hoy",
      title: "Solicita una consulta",
      desc: "La admisión es por Generación: una sola fecha de inicio, cupo limitado, sin ingreso continuo. En la consulta vemos si es para ti, las fechas y la inversión.",
    },
    {
      day: "D01",
      title: "Empieza tu Generación",
      desc: "Todos empiezan el mismo día, con la misma evaluación inicial. Nadie entra tarde y nadie empieza solo.",
    },
    {
      day: "D01 a D54",
      title: "Mismo grupo, 54 días",
      desc: "Entrenas con las mismas personas y los mismos coaches durante todo el programa. La presión del grupo es parte del método.",
    },
    {
      day: "D54",
      title: "Cierra tu Generación",
      desc: "Mediciones finales, resultados sobre la mesa y cómo mantenerlos. El programa termina. La nueva versión de ti, no.",
    },
  ],
};

/* PROHIBIDAS en Studios (boxeo/conos verificados): brand/coach-stretch-demo-vertical,
   brand/coach-class-boxing-bags-vertical, brand/gym-structure-heavy-bags-wide,
   hallandale/coach-headset, coral-gables/boxer-closeup,
   coral-gables/spin-bikes-boxing-bags-01, hd/cg-highfive-euphoria,
   hd/cg-stairs-group */
/* Grid editorial asimétrico (ART_DIRECTION_V3 §2): fotos de marca reales.
   Ratios calculados para que ambas columnas del photo-grid queden a la
   misma altura (3fr a ratio R exige 2fr a ratio 1.5R).
   Caption bilingüe por foto; src/alt/ratio son únicos (alt queda EN). */
type FloorPhoto = {
  src: string;
  alt: string;
  ratio: string;
  caption: Record<Lang, string>;
};

const FLOOR_ROWS: { flip?: boolean; photos: [FloorPhoto, FloorPhoto] }[] = [
  {
    photos: [
      {
        src: "images/studios/coral-gables/bike-floor-laughter.jpg",
        alt: "Two athletes laughing between rounds on the 54D bike floor",
        ratio: "3 / 2",
        caption: { en: "The bike floor", es: "El piso de bicis" },
      },
      {
        src: "images/studios/coral-gables/cardio-jump-mural-vertical.jpg",
        alt: "Athlete mid jump during the cardio block under the 54D mural",
        ratio: "1 / 1",
        caption: { en: "Cardio, coached live", es: "Cardio con coach en vivo" },
      },
    ],
  },
  {
    flip: true,
    photos: [
      {
        src: "images/studios/coral-gables/group-cardio-session-01.jpg",
        alt: "A 54D class mid cardio block, the whole group moving together",
        ratio: "1 / 1",
        caption: { en: "The cardio block", es: "El bloque de cardio" },
      },
      {
        src: "images/brand/class-plank-rows-54d-mural.jpg",
        alt: "Rows of students holding planks on colored mats under the 54D mural",
        ratio: "3 / 2",
        caption: { en: "One group, one standard", es: "Un grupo, un estándar" },
      },
    ],
  },
];

export default function Studios() {
  const map = useReveal();
  const floor = useReveal();
  const experience = useReveal();
  const generations = useReveal();
  const cta = useReveal();
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <div>
      <Nav />

      {/* ============ HERO INTERIOR (foto real de marca) ============ */}
      <header className="hero hero-inner">
        <div className="hero-media">
          <img
            src={asset("images/brand/generation-line-54d-mural-wide.jpg")}
            alt="A 54D Generation arm in arm with their coach under the 54D mural"
          />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">
            {es
              ? "54D Studios · La experiencia insignia"
              : "54D Studios · The flagship experience"}
          </span>
          <h1 className="hero-title">
            {es ? "Tres países." : "Three countries."}
            <br />
            <span className="accent">
              {es ? "Cinco studios." : "Five studios."}
            </span>
          </h1>
          <p className="hero-sub">
            {es
              ? "El método completo con un equipo dedicado a un solo resultado: coaches, nutricionista y fisioterapeuta asignados a tu Generación."
              : "The complete method with a dedicated team on one outcome: coaches, a nutritionist, and a physiotherapist assigned to your Generation."}
          </p>
          <div className="hero-ctas">
            <a href="#sedes" className="btn btn-primary">
              {es ? "Encuentra tu studio" : "Find your studio"}
            </a>
          </div>
          {/* Guardrail high-ticket (SEPARATION_SPEC §3, verbatim) */}
          <p className="method-desc" style={{ marginTop: "1.6rem", maxWidth: "36rem" }}>
            {es
              ? "54D Studios es nuestro nivel insignia, un programa con trato de cliente privado. En la consulta vemos si es para ti, la fecha de inicio de tu Generación y la inversión."
              : "54D Studios is our flagship tier, a private-client level program. Your consultation covers fit, your Generation's start date, and the investment."}
          </p>
        </div>
      </header>

      {/* ============ MAPA CONCEPTUAL DE SEDES (grid de cards) ============ */}
      {/* FIXES_V5 §3.2: único campo de luz de la página */}
      <section
        className="section bloom-right"
        id="sedes"
        style={{ scrollMarginTop: "5rem" }}
      >
        <div className="section-inner" ref={map.ref}>
          <div className={map.className}>
            <span className="day-marker">Studios</span>
            <h2 className="section-title">
              {es ? "Elige tu" : "Choose your"}{" "}
              <span className="accent">studio.</span>
            </h2>
            <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "38rem" }}>
              {es
                ? "Miami, Ciudad de México y Bogotá. Cada studio tiene sus propias Generaciones: mismo método, mismo estándar, tu ciudad."
                : "Miami, Mexico City, and Bogotá. Each studio runs its own Generations: same method, same standard, your city."}
            </p>
            {/* Tiles clickeables: ciudad protagonista, dirección como
                metadata, hover solo de borde (deja de leerse como un
                resultado de Maps). */}
            <div className="sede-grid">
              {STUDIOS.map((s) => {
                const thumb = SEDE_THUMBS[s.slug];
                return (
                  <Link
                    key={s.slug}
                    to={`/studios/${s.slug}`}
                    className="sede-tile"
                    aria-label={`54D ${cityLabel(s.city, "en")} transformation program`}
                  >
                    {thumb && (
                      <span className="sede-thumb">
                        <img src={asset(thumb.src)} alt={thumb.alt} loading="lazy" />
                      </span>
                    )}
                    <span className="sede-body">
                      <span className="sede-country">
                        {s.countryCode} · {s.country}
                      </span>
                      <span className="sede-city">{cityLabel(s.city, lang)}</span>
                      <span className="sede-addr">{s.address}</span>
                      <span className="sede-go">
                        {es ? "Explorar →" : "Explore →"}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOTOS REALES: EL PISO DE 54D ============ */}
      <section className="section">
        <div className="section-inner" ref={floor.ref}>
          <div className={floor.className}>
            <span className="day-marker">
              {es ? "Dentro de 54D" : "Inside 54D"}
            </span>
            <h2 className="section-title">
              {es ? "El piso habla por sí solo." : "The floor does the talking."}
            </h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "3rem" }}>
              {FLOOR_ROWS.map((row, i) => (
                <div
                  key={i}
                  className={row.flip ? "photo-grid flip" : "photo-grid"}
                >
                  {row.photos.map((p) => (
                    <figure key={p.src} style={{ margin: 0 }}>
                      <div
                        className="photo-card"
                        style={{ aspectRatio: p.ratio }}
                      >
                        <img src={asset(p.src)} alt={p.alt} loading="lazy" />
                      </div>
                      <figcaption className="photo-caption">
                        {p.caption[lang]}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LA EXPERIENCIA PRESENCIAL ============ */}
      <section className="section section-tight">
        <div className="section-inner" ref={experience.ref}>
          <div className={experience.className}>
            <span className="day-marker">
              {es ? "La experiencia" : "The experience"}
            </span>
            <div className="method-intro">
              <h2 className="section-title">
                {es ? "Lo presencial es otro" : "In person is another"}{" "}
                <span className="accent">{es ? "nivel." : "level."}</span>
              </h2>
              <p>
                {es
                  ? "54D Studios no es una clase grupal más. Es el método completo con un equipo a tu alrededor: coaches, nutricionista y fisioterapia trabajando en tu transformación, en persona."
                  : "54D Studios is not another group class. It's the full method with a team around you: coaches, a nutritionist, and physiotherapy working on your transformation, in person."}
              </p>
            </div>
            <div className="method-grid">
              {EXPERIENCE[lang].map((e) => (
                <div className="method-card" key={e.num}>
                  <div className="method-num">{e.num}</div>
                  <div className="method-name">{e.name}</div>
                  <p className="method-desc">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONAN LAS GENERACIONES ============ */}
      <section className="section">
        <div className="section-inner" ref={generations.ref}>
          <div className={generations.className}>
            {/* Split desde el titulo (cliente 06/08: la derecha quedaba muy
                abajo): izquierda = eyebrow + titulo + leads; el timeline
                sube hasta la altura del titulo y llena el canvas */}
            <div className="gen-split">
              <div>
                <span className="day-marker">
                  {es ? "Generaciones" : "Generations"}
                </span>
                <h2 className="section-title">
                  {es
                    ? "No entras cuando quieres. Entras con tu"
                    : "You don't join whenever you want. You join with your"}{" "}
                  <span className="accent">
                    {es ? "Generación." : "Generation."}
                  </span>
                </h2>
                <p className="lead" style={{ maxWidth: "38rem", marginTop: "1.6rem" }}>
                  {es
                    ? "Cada studio abre Generaciones: el grupo con el que empiezas y terminas. Una fecha de inicio, cupo limitado y 54 días juntos. Por eso funciona. Esto no es una membresía abierta. Es un compromiso con fecha."
                    : "Each studio opens Generations: the group you start and finish with. A start date, limited spots, and 54 days together. That's why it works. This is not an open membership. It's a commitment with a date."}
                </p>
                <p className="lead" style={{ marginTop: "1rem", maxWidth: "38rem" }}>
                  {es
                    ? "Te mides el día 1 y el día 54. Los números son el contrato."
                    : "You are measured on day 1 and on day 54. The numbers are the contract."}
                </p>
              </div>
              <div className="timeline">
                {GENERATION_TIMELINE[lang].map((t) => (
                  <div className="timeline-item" key={t.day}>
                    <span className="timeline-day">{t.day}</span>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PHOTO BAND: COMUNIDAD (foto grupal real) ============ */}
      <section className="photo-band band-tight">
        <img
          src={asset("images/brand/group-photo-54d-mural.jpg")}
          alt="A full 54D Generation posing together under the giant 54D mural"
          loading="lazy"
        />
        <div className="photo-band-content">
          <span className="day-marker">
            {es ? "La Generación" : "The Generation"}
          </span>
          <h2 className="section-title">
            {es ? "Empiezas con desconocidos." : "You start with strangers."}
            <br />
            {es ? "Terminas con tu gente." : "You finish with your people."}
          </h2>
          <p className="lead" style={{ marginTop: "1.4rem", maxWidth: "34rem" }}>
            {es
              ? "Cada Generación entrena, suda y se gradúa junta. Para eso existen los studios."
              : "Every Generation trains, sweats, and graduates together. That is what the studios are for."}
          </p>
          <div className="hero-ctas">
            <a href="#sedes" className="btn btn-primary">
              {es ? "Encuentra tu studio" : "Find your studio"}
            </a>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL: CONSULTA (separacion dura: sin cruce a ON) ============ */}
      <section className="section">
        <div className="section-inner" ref={cta.ref}>
          <div className={`final-wrap ${cta.className}`}>
            <h2 className="final-title">
              {es ? "Una consulta." : "One consultation."}
              <br />
              {es
                ? "Una decisión que se sostiene 54 días."
                : "One decision that holds 54 days."}
            </h2>
            {/* El cierre lleva UN primario (único CTA dominante de la banda);
                las ciudades quedan como links de texto secundarios */}
            <div className="hero-ctas" style={{ justifyContent: "center" }}>
              <a href="#sedes" className="btn btn-primary">
                {es ? "Encuentra tu studio" : "Find your studio"}
              </a>
            </div>
            <div className="final-links">
              {STUDIOS.map((s) => (
                <Link
                  key={s.slug}
                  to={`/studios/${s.slug}`}
                  style={{
                    color: "var(--c-faint)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    padding: "0.7rem 0.5rem",
                  }}
                >
                  {cityLabel(s.city, lang)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
