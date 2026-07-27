import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/blog";
import { Nav, Footer, useReveal } from "../components/site";
import { asset } from "../lib/asset";

/* ============================================================
   /blog: Index del blog (awareness · SEO/AEO top-funnel).
   Hero editorial + destacado + grid por categoría + newsletter.
   Copy EN según docs/marketing/COPY_V3.md (voz directa, you).
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D Blog: Training, Nutrition, and the Method" },
    {
      name: "description",
      content:
        "Training, nutrition, and transformation guides written by 54D coaches. No fitness noise. What actually works, and why.",
    },
  ];
}

/* ------------------------------------------------------------
   Data placeholder de artículos.
   TODO: conectar a Supabase (tabla `posts`): este array local
   desaparece cuando el CMS esté listo. Los slugs quedan definidos
   para las futuras rutas /blog/:slug (hoy las cards linkean a "#").
   TODO: schema `Article` (JSON-LD) se agrega en la página de cada
   post cuando exista la ruta real, no en este index.
   AUTOR_PENDIENTE: nombres y credenciales reales por confirmar
   con el cliente (E-E-A-T). FECHAS placeholder.
   ------------------------------------------------------------ */

type Category = "Training" | "Nutrition" | "Method";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  credential: string;
  initials: string;
  date: string; // display placeholder
  dateISO: string;
  readTime: string;
  cover: string;
  coverAlt: string;
}

const POSTS: Post[] = [
  {
    slug: "how-long-to-transform-your-body",
    cover: "images/studios/coral-gables/jump-training-54d-wall-01.jpg",
    coverAlt: "Athlete mid jump during plyometric training in front of the 54 mural",
    title:
      "How Long Does It Really Take to Transform Your Body? What 54 Days of Data Show",
    excerpt:
      "It's not 21 days or 12 magic weeks. We analyzed data from our Generations to answer, with evidence, when the first real change shows up. And what speeds it up.",
    category: "Method",
    author: "Head Coach, 54D", // AUTOR_PENDIENTE
    credential: "Certified strength & conditioning coach", // AUTOR_PENDIENTE: credencial real
    initials: "HC",
    date: "Jul 21, 2026",
    dateISO: "2026-07-21",
    readTime: "8 min",
  },
  {
    slug: "training-at-home-vs-gym",
    cover: "images/studios/coral-gables/group-cardio-session-01.jpg",
    coverAlt: "Group cardio session in full movement on the 54D training floor",
    title: "Training at Home vs. the Gym: What Works Better for Your Goal",
    excerpt:
      "The gym isn't mandatory, and your living room isn't a plan B. We compare results, adherence, and real cost so you choose by your goal, not the myth.",
    category: "Training",
    author: "54D ON Coach", // AUTOR_PENDIENTE
    credential: "BSc Sports Science", // AUTOR_PENDIENTE: credencial real
    initials: "ON",
    date: "Jul 14, 2026",
    dateISO: "2026-07-14",
    readTime: "6 min",
  },
  {
    slug: "what-to-eat-before-after-training",
    cover: "images/studios/coral-gables/training-floor-recovery-01.jpg",
    coverAlt: "Athletes recovering on the training floor after a 54D session",
    title:
      "What to Eat Before and After Training: A Practical Guide, No Miracle Supplements",
    excerpt:
      "What you eat around training matters more than any powder. A straight guide from our nutritionist: what, how much, and when. With real food.",
    category: "Nutrition",
    author: "54D Nutritionist", // AUTOR_PENDIENTE
    credential: "Registered Dietitian", // AUTOR_PENDIENTE: cédula/licencia
    initials: "NU",
    date: "Jul 7, 2026",
    dateISO: "2026-07-07",
    readTime: "7 min",
  },
];

const CATEGORIES = ["All", "Training", "Nutrition", "Method"] as const;
type Filter = (typeof CATEGORIES)[number];

/* ------------------------------------------------------------
   Piezas locales de la página
   ------------------------------------------------------------ */

function CategoryPill({ label }: { label: Category }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.68rem",
        letterSpacing: "var(--track-eyebrow, 0.22em)",
        textTransform: "uppercase",
        color: "var(--c-yellow)",
        padding: "0.32rem 0.8rem",
        borderRadius: "var(--r-control, 2px)",
        border: "1px solid rgba(255, 210, 0, 0.25)",
        background: "rgba(255, 210, 0, 0.06)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function AuthorRow({ post }: { post: Post }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
      <span
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 210, 0, 0.08)",
          border: "1px solid rgba(255, 210, 0, 0.25)",
          color: "var(--c-yellow)",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "0.78rem",
          letterSpacing: "var(--track-btn, 0.07em)",
        }}
      >
        {post.initials}
      </span>
      <span style={{ display: "grid", gap: "0.15rem", minWidth: 0 }}>
        <span style={{ fontSize: "0.92rem", color: "var(--c-white)" }}>
          {post.author}
        </span>
        <span style={{ fontSize: "0.78rem", color: "var(--c-faint)" }}>
          {post.credential}
        </span>
      </span>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    // TODO: href a `/blog/${post.slug}` cuando exista la ruta del post
    <a
      href="#"
      className="method-card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <img
        src={asset(post.cover)}
        alt={post.coverAlt}
        loading="lazy"
        style={{
          margin: "-1.8rem -1.6rem 1.3rem",
          width: "calc(100% + 3.2rem)",
          maxWidth: "none",
          aspectRatio: "3 / 2",
          objectFit: "cover",
          filter: "saturate(0.85) contrast(1.05)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <CategoryPill label={post.category} />
        <span
          style={{
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "var(--track-label, 0.14em)",
            color: "var(--c-faint)",
          }}
        >
          <time dateTime={post.dateISO}>{post.date}</time> · {post.readTime}
        </span>
      </div>
      <h3 className="method-name" style={{ marginTop: "1.2rem" }}>
        {post.title}
      </h3>
      <p
        className="method-desc"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.excerpt}
      </p>
      <div
        style={{
          position: "relative",
          marginTop: "auto",
          paddingTop: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <AuthorRow post={post} />
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: "var(--track-label, 0.14em)",
            textTransform: "uppercase",
            color: "var(--c-faint)",
            whiteSpace: "nowrap",
          }}
        >
          Read →
        </span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------
   Página
   ------------------------------------------------------------ */

export default function Blog() {
  const [filter, setFilter] = useState<Filter>("All");
  const featured = POSTS[0];
  const visible =
    filter === "All" ? POSTS : POSTS.filter((p) => p.category === filter);

  const destacado = useReveal();
  const articulos = useReveal();
  const newsletter = useReveal();
  const cierre = useReveal();

  return (
    <div>
      <Nav />

      {/* ============ HERO INTERIOR (editorial) ============ */}
      {/* hero-compact (FIXES_V5 §4): poster sin CTAs, ~280px de contenido */}
      <header className="hero hero-inner hero-compact">
        <div className="hero-media">
          <div className="hero-poster" />
        </div>
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="day-marker">54D Blog</span>
          <h1 className="hero-title">
            What works.
            <br />
            <span className="accent">And why.</span>
          </h1>
          <p className="hero-sub">
            Written by the coaches behind thousands of transformations, not by
            a content generator.
          </p>
        </div>
      </header>

      {/* ============ ARTÍCULO DESTACADO ============ */}
      {/* FIXES_V5 §3.2: único campo de luz de la página */}
      <section className="section bloom">
        <div className="section-inner" ref={destacado.ref}>
          <div className={destacado.className}>
            <span className="day-marker">Featured</span>
            <h2 className="section-title">
              Start <span className="accent">here.</span>
            </h2>
            <article
              style={{
                position: "relative",
                marginTop: "3rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: "clamp(1.5rem, 4vw, 3rem)",
                alignItems: "center",
                padding: "clamp(2rem, 4.5vw, 3.8rem)",
                borderRadius: "var(--r-card, 8px)",
                background: "var(--glass)",
                border: "1px solid var(--hairline)",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
              }}
            >
              {/* Luz interior del panel (bloom, no bloque) */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(ellipse 55% 75% at 88% 0%, rgba(255, 210, 0, 0.10), transparent 62%)",
                }}
              />
              <img
                src={asset(featured.cover)}
                alt={featured.coverAlt}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: "var(--r-media, 2px)",
                  filter: "saturate(0.85) contrast(1.05)",
                }}
              />
              <div style={{ position: "relative", minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <CategoryPill label={featured.category} />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "var(--track-label, 0.14em)",
                      color: "var(--c-faint)",
                    }}
                  >
                    <time dateTime={featured.dateISO}>{featured.date}</time> ·{" "}
                    {featured.readTime} read
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
                    lineHeight: 1.04,
                    textTransform: "uppercase",
                    color: "var(--c-white)",
                    marginTop: "1.4rem",
                    maxWidth: "26ch",
                  }}
                >
                  {featured.title}
                </h3>
                <p
                  style={{
                    marginTop: "1.2rem",
                    maxWidth: "38rem",
                    color: "var(--c-mist)",
                  }}
                >
                  {featured.excerpt}
                </p>
                <div style={{ marginTop: "1.8rem" }}>
                  <AuthorRow post={featured} />
                </div>
                <div style={{ marginTop: "2.2rem" }}>
                  {/* TODO: href a `/blog/${featured.slug}` cuando exista la ruta */}
                  <a href="#" className="btn btn-ghost">
                    Read article →
                  </a>
                </div>
              </div>
              {/* Cifra fantasma: los 54 días de datos del artículo */}
              <div
                aria-hidden="true"
                style={{
                  position: "relative",
                  textAlign: "center",
                  alignSelf: "center",
                  userSelect: "none",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(6rem, 13vw, 12rem)",
                  lineHeight: 0.8,
                  color: "rgba(255, 210, 0, 0.14)",
                }}
              >
                54
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ TODOS LOS ARTÍCULOS (strip de categorías + grid) ============ */}
      <section className="section">
        <div className="section-inner" ref={articulos.ref}>
          <div className={articulos.className}>
            <span className="day-marker">All articles</span>
            <h2 className="section-title">
              Pick your <span className="accent">topic.</span>
            </h2>

            {/* Strip de categorías (filtro local) */}
            <div
              role="group"
              aria-label="Filter articles by category"
              style={{
                display: "flex",
                gap: "0.7rem",
                flexWrap: "wrap",
                marginTop: "2.4rem",
              }}
            >
              {CATEGORIES.map((c) => {
                const active = c === filter;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    aria-pressed={active}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      letterSpacing: "var(--track-label, 0.14em)",
                      textTransform: "uppercase",
                      padding: "0.6rem 1.3rem",
                      borderRadius: "var(--r-control, 2px)",
                      cursor: "pointer",
                      transition: "all var(--transition)",
                      color: active ? "var(--c-yellow)" : "var(--c-mist)",
                      background: active
                        ? "rgba(255, 210, 0, 0.08)"
                        : "var(--glass)",
                      border: active
                        ? "1px solid rgba(255, 210, 0, 0.4)"
                        : "1px solid var(--hairline)",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Grid de cards glass */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.1rem",
                marginTop: "2.2rem",
              }}
            >
              {visible.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>

            {/* CTA intercalado hacia /pricing */}
            <div
              style={{
                marginTop: "3.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                flexWrap: "wrap",
                padding: "1.8rem 2.2rem",
                borderRadius: "var(--r-card, 8px)",
                background: "var(--glass)",
                border: "1px solid var(--hairline)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  color: "var(--c-white)",
                }}
              >
                Done reading?{" "}
                <span style={{ color: "var(--c-yellow)" }}>Start doing.</span>
              </p>
              <Link to="/pricing" className="btn btn-primary">
                Start free. 7 days.
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER (solo UI por ahora) ============ */}
      <section className="section">
        <div className="section-inner" ref={newsletter.ref}>
          <div className={newsletter.className}>
            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: "clamp(2rem, 4vw, 4rem)",
                alignItems: "center",
                padding: "clamp(2.2rem, 4.5vw, 4rem)",
                borderRadius: "var(--r-card, 8px)",
                background: "var(--glass)",
                border: "1px solid var(--hairline)",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(ellipse 60% 80% at 8% 100%, rgba(255, 184, 0, 0.09), transparent 60%)",
                }}
              />
              <div style={{ position: "relative", minWidth: 0 }}>
                <span className="day-marker">Newsletter</span>
                <h2 className="section-title">
                  The method, <span className="accent">in your inbox.</span>
                </h2>
                <p
                  style={{
                    marginTop: "1.2rem",
                    maxWidth: "32rem",
                    color: "var(--c-mist)",
                  }}
                >
                  One guide a week from our coaches: training, nutrition, and
                  the method. If it doesn't add value, we don't send it.
                </p>
              </div>
              {/* TODO: conectar el submit (Supabase tabla `subscribers` o ESP).
                  Por ahora solo UI: el submit no hace nada. */}
              <form
                style={{ position: "relative" }}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="field">
                  <label htmlFor="newsletter-email">Your email</label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  Subscribe
                </button>
                <p
                  style={{
                    marginTop: "0.9rem",
                    fontSize: "0.8rem",
                    textAlign: "center",
                    color: "var(--c-faint)",
                  }}
                >
                  One email a week. Cancel anytime.
                </p>
              </form>
              {/* Textura editorial lateral: detalle de hoodie STRONGER */}
              <img
                src={asset("images/hd2/newsletter-stronger.jpg")}
                alt="Close-up of the STRONGER typography printed on a black 54D hoodie"
                loading="lazy"
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  borderRadius: "var(--r-media, 2px)",
                  filter: "saturate(0.85) contrast(1.05)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section">
        <div className="section-inner" ref={cierre.ref}>
          <div className={`final-wrap ${cierre.className}`}>
            <h2 className="final-title">
              You have the theory. <span className="accent">Now the method.</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/pricing" className="btn btn-primary">
                Start free. 7 days.
              </Link>
              <Link to="/method" className="btn btn-ghost">
                See the method
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
