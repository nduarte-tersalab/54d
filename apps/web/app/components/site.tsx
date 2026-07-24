import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
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
      <Link to="/" className="nav-logo">
        54<em>D</em>
      </Link>
      <div className="nav-links">
        <Link to="/method">Method</Link>
        <Link to="/on">54D ON</Link>
        <Link to="/studios">Studios</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/pricing" className="btn btn-primary btn-nav">
          Start free
        </Link>
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
            <Link to="/method">Method</Link>
            <Link to="/on">54D ON</Link>
            <Link to="/studios">54D Studios</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div>
            <h4>Studios</h4>
            {STUDIOS.map((s) => (
              <Link key={s.slug} to={`/studios/${s.slug}`}>
                {s.city}
              </Link>
            ))}
          </div>
          <div>
            <h4>More</h4>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
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
            <Link to="/terms" style={{ display: "inline", marginRight: "1.5rem" }}>
              Terms
            </Link>
            <Link to="/privacy" style={{ display: "inline" }}>
              Privacy
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
