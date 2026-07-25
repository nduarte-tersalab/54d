import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/contact";
import { Nav, Footer, useReveal } from "../components/site";
import { STUDIOS } from "../data/studios";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact 54D" },
    {
      name: "description",
      content:
        "Questions about 54D ON, the studios, or your subscription? Write to us. We actually answer. Find us in Miami, Mexico City, and Bogotá.",
    },
  ];
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8788";

const INSTAGRAM_URL = "https://www.instagram.com/54d.online";

/** wa.me exige solo dígitos (código de país incluido, sin +) */
function waHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const caminos = useReveal();
  const sedes = useReveal();
  const escribenos = useReveal();
  const cierre = useReveal();

  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const slug = data.get("location_slug");
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          location_slug: slug ? String(slug) : null,
          notes: data.get("notes"),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

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
          <span className="day-marker">Contact</span>
          <h1 className="hero-title">
            Let's talk<span className="accent">.</span>
          </h1>
          <p className="hero-sub">
            Questions about the method, the studios, or your subscription? We
            answer for real: a human on the team, not a bot.
          </p>
        </div>
      </header>

      {/* ============ DOS CAMINOS: ON / STUDIOS ============ */}
      <section className="section bloom" style={{ paddingBottom: "2.5rem" }}>
        <div className="section-inner" ref={caminos.ref}>
          <div className={caminos.className}>
            <span className="day-marker">Choose your path</span>
            <h2 className="section-title">
              Your question has <span className="accent">a straight answer.</span>
            </h2>
          </div>
        </div>
      </section>
      <div className="split">
        <div className="split-panel split-on" style={{ minHeight: "40vh" }}>
          <div>
            <span className="split-label">Online? 54D ON</span>
            <h3 className="split-title">Plans and pricing</h3>
            <p className="split-desc">
              7-day free trial, monthly, quarterly, and annual plans, billing
              and cancellation. It's all explained on the pricing page. No
              fine print.
            </p>
          </div>
          <div className="split-footer">
            <Link to="/pricing" className="btn btn-on">
              See plans
            </Link>
            {/* PRECIO_PENDIENTE */}
            <span className="split-price">From $54/mo</span>
          </div>
        </div>
        <div className="split-panel split-studios" style={{ minHeight: "40vh" }}>
          <div>
            <span className="split-label">In person? 54D Studios</span>
            <h3 className="split-title">Talk to your studio</h3>
            <p className="split-desc">
              Generations, start dates, spots, and schedules are handled
              directly by each studio. Pick yours and book with their team.
            </p>
          </div>
          <div className="split-footer">
            <a href="#sedes" className="btn btn-primary">
              Choose my studio
            </a>
          </div>
        </div>
      </div>

      {/* ============ SELECTOR DE SEDE ============ */}
      <section className="section bloom-right" id="sedes">
        <div className="section-inner" ref={sedes.ref}>
          <div className={sedes.className}>
            <span className="day-marker">Studios</span>
            <h2 className="section-title">
              Five studios. <span className="accent">Three countries.</span>
            </h2>
            <div className="studios-list">
              {STUDIOS.map((s) => (
                <Link key={s.slug} to={`/studios/${s.slug}`} className="studio-row">
                  <span className="studio-city">{s.city}</span>
                  <span className="studio-country">{s.country}</span>
                  <span className="studio-cta">See studio →</span>
                </Link>
              ))}
            </div>
            <p
              style={{
                marginTop: "2.5rem",
                color: "var(--c-mist)",
                maxWidth: "34rem",
              }}
            >
              No studio in your city? The full method lives online too.{" "}
              <Link
                to="/on"
                style={{ color: "var(--c-yellow)", textDecoration: "none" }}
              >
                Explore 54D ON →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ============ FORMULARIO GENERAL ============ */}
      <section className="section bloom" id="formulario">
        <div className="section-inner" ref={escribenos.ref}>
          <div className={escribenos.className}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "clamp(2.5rem, 5vw, 5rem)",
                alignItems: "start",
              }}
            >
              {/* Columna izquierda: copy + canales alternativos */}
              <div>
                <span className="day-marker">Write to us</span>
                <h2 className="section-title">
                  Tell us <span className="accent">what you need.</span>
                </h2>
                <p className="lead" style={{ marginTop: "1.6rem", maxWidth: "30rem" }}>
                  The method, plans, your subscription, or press: leave your
                  message and we reply within one business day.
                </p>

                <div style={{ marginTop: "3rem" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "var(--track-label, 0.14em)",
                      color: "var(--c-faint)",
                      marginBottom: "1rem",
                    }}
                  >
                    Prefer WhatsApp? Message your studio directly
                  </span>
                  {STUDIOS.map((s) => (
                    <a
                      key={s.slug}
                      href={waHref(s.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "block",
                        color: "var(--c-mist)",
                        textDecoration: "none",
                        fontSize: "0.98rem",
                        lineHeight: 1.5,
                        marginBottom: "0.55rem",
                      }}
                    >
                      {s.city} · {s.whatsapp}
                    </a>
                  ))}
                </div>

                <div style={{ marginTop: "2.2rem" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "var(--track-label, 0.14em)",
                      color: "var(--c-faint)",
                      marginBottom: "1rem",
                    }}
                  >
                    Or on social
                  </span>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "var(--c-mist)",
                      textDecoration: "none",
                      fontSize: "0.98rem",
                    }}
                  >
                    Instagram · @54d.online
                  </a>
                </div>
              </div>

              {/* Columna derecha: formulario glass */}
              <div
                style={{
                  background: "var(--glass)",
                  border: "1px solid var(--hairline)",
                  borderRadius: "var(--r-card, 8px)",
                  padding: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {status === "success" ? (
                  <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                    <span className="day-marker">Message sent</span>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: "1.8rem",
                        textTransform: "uppercase",
                        color: "var(--c-white)",
                      }}
                    >
                      Received.
                    </h3>
                    <p
                      style={{
                        marginTop: "0.8rem",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        color: "var(--c-mist)",
                      }}
                    >
                      We'll reply by email within one business day. Meanwhile,
                      the method is waiting.
                    </p>
                    <div
                      style={{
                        marginTop: "1.8rem",
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Link to="/method" className="btn btn-ghost">
                        See the method
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setStatus("idle")}
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="field">
                      <label htmlFor="contacto-nombre">Name</label>
                      <input
                        id="contacto-nombre"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="contacto-email">Email</label>
                      <input
                        id="contacto-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="contacto-telefono">Phone</label>
                      <input
                        id="contacto-telefono"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 305 000 0000"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="contacto-sede">Studio of interest</label>
                      <select id="contacto-sede" name="location_slug" defaultValue="">
                        <option value="">Not sure yet / it's about 54D ON</option>
                        {STUDIOS.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.city}, {s.country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="contacto-mensaje">Message</label>
                      <textarea
                        id="contacto-mensaje"
                        name="notes"
                        rows={5}
                        required
                        placeholder="Tell us what you need: the method, plans, Generations, your subscription…"
                      />
                    </div>
                    {status === "error" && (
                      <div className="field" role="alert">
                        <span className="error">
                          We couldn't send your message. Try again, or message
                          us on WhatsApp.
                        </span>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status === "loading"}
                      style={{
                        width: "100%",
                        opacity: status === "loading" ? 0.6 : 1,
                      }}
                    >
                      {status === "loading" ? "Sending…" : "Send message"}
                    </button>
                    <p
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.82rem",
                        textAlign: "center",
                        color: "var(--c-faint)",
                      }}
                    >
                      We reply within one business day.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner" ref={cierre.ref}>
          <div className={`final-wrap ${cierre.className}`}>
            <h2 className="final-title">
              Ask less. <span className="accent">Train more.</span>
            </h2>
            <div className="hero-ctas">
              <Link to="/pricing" className="btn btn-primary">
                Start free. 7 days.
              </Link>
              <Link to="/method#faq" className="btn btn-ghost">
                See the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
