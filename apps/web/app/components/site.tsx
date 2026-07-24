import { useEffect, useRef, useState } from "react";
import { STUDIOS } from "../data/studios";

/* ============================================================
   Componentes globales del sitio (Nav, Footer) + useReveal.
   Compartidos por todas las páginas públicas. Cambios acá
   impactan todo el sitio: coordinar con el tech lead.
   ============================================================ */

/** Entrada on-scroll (.reveal). Uso:
 *  const x = useReveal();
 *  <div ref={x.ref} className={x.className}>…</div>
 */
export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Ya en viewport al montar → mostrar directo
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    // Fallback: nunca dejar contenido invisible (bots, IO quirks)
    const failsafe = setTimeout(() => setVisible(true), 2500);
    return () => {
      obs.disconnect();
      clearTimeout(failsafe);
    };
  }, []);
  return { ref, className: `reveal${visible ? " visible" : ""}` };
}

/** Nav global pill flotante. Links a rutas reales (no anclas). */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <a href="/" className="nav-logo">
        54<em>D</em>
      </a>
      <div className="nav-links">
        <a href="/method">Method</a>
        <a href="/on">54D ON</a>
        <a href="/studios">Studios</a>
        <a href="/blog">Blog</a>
        <a href="/pricing" className="btn btn-primary btn-nav">
          Start free
        </a>
      </div>
    </nav>
  );
}

/** Footer global. Sedes desde app/data/studios.ts. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <h4>54D</h4>
            <p style={{ maxWidth: "22rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
              The 54-day transformation method. Miami · Mexico City · Bogotá
              · Online.
            </p>
          </div>
          <div>
            <h4>Programs</h4>
            <a href="/method">Method</a>
            <a href="/on">54D ON</a>
            <a href="/studios">54D Studios</a>
            <a href="/pricing">Pricing</a>
          </div>
          <div>
            <h4>Studios</h4>
            {STUDIOS.map((s) => (
              <a key={s.slug} href={`/studios/${s.slug}`}>
                {s.city}
              </a>
            ))}
          </div>
          <div>
            <h4>More</h4>
            <a href="/blog">Blog</a>
            <a href="/contact">Contact</a>
            <a href="https://www.instagram.com/54d.online" rel="noreferrer" target="_blank">
              Instagram
            </a>
          </div>
        </div>
        <div className="footer-giant" aria-hidden="true">
          54D
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} 54D. All rights reserved.</span>
          <span>
            <a href="/terms" style={{ display: "inline", marginRight: "1.5rem" }}>
              Terms
            </a>
            <a href="/privacy" style={{ display: "inline" }}>
              Privacy
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
