import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { STUDIOS } from "../data/studios";
import { asset } from "../lib/asset";
import { AppStoreBadges } from "./badges";

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

const NAV_LINKS = [
  { to: "/method", label: "Method" },
  { to: "/on", label: "54D ON" },
  { to: "/studios", label: "Studios" },
  { to: "/blog", label: "Blog" },
] as const;

/* CTA global unificado (DESIGN_FIXES_V4 §5): nav y hero, mismo copy.
   \u2014 = em dash del copy V4, escapado por el grep de CI. */
const CTA_COPY = "Start free. 7 days.";

/* SEPARATION_SPEC §5: en rutas /studios* el trial es lenguaje de
   suscripcion de ON y no puede aparecer; nav y footer mutan solos via
   pathname (toda ruta studio futura queda protegida por defecto). */
const STUDIOS_CTA_COPY = "Request a consultation";

const APP_STORE_URL = "https://apps.apple.com/us/app/54d-on/id1520445334";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays";

/** Nav global: barra sólida full-width (ART_DIRECTION_V3 §1).
 *  Transparente sobre el hero, negro pleno al scroll (scrollY > 40).
 *  Mobile: hamburger + drawer full-screen que bloquea el scroll del
 *  body y se cierra al navegar. Links a rutas reales (no anclas). */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const inStudios = pathname.startsWith("/studios");
  /* CTA de consulta pathname-aware: en la sede ancla al form de ESA pagina
     (#reserva); en el index, al grid de sedes (#sedes). Anchor nativo
     same-page: el browser scrollea solo, sin sacar al visitante de la
     pagina del form. */
  const inStudioDetail = /^\/studios\/./.test(pathname);
  const consultHref = inStudioDetail ? "#reserva" : "#sedes";
  /* SEPARACION DURA (cliente 01/08): en contexto Studios el nav no ofrece
     ON — high ticket presencial y low ticket online no se cruzan */
  const links = inStudios
    ? NAV_LINKS.filter((l) => l.to !== "/on")
    : NAV_LINKS;
  /* Gateway (crítica de diseño): la nav no contesta la pregunta antes de
     hacerla. En "/" queda logo + burger; la card de ON pasa a ser el único
     objeto amarillo del fold. */
  const isGateway = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drawer abierto: bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}${isGateway ? " nav-minimal" : ""}`}>
      <div className="nav-inner">
      <Link to="/" className="nav-logo" onClick={close} aria-label="54D home">
        <img src={asset("images/brand/logo-54d.png")} alt="54D" width={52} height={52} />
      </Link>
      <div className="nav-links">
        {links.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
        {inStudios ? (
          <a href={consultHref} className="btn btn-ghost btn-nav">
            {STUDIOS_CTA_COPY}
          </a>
        ) : (
          <Link to="/pricing" className="btn btn-primary btn-nav">
            {CTA_COPY}
          </Link>
        )}
      </div>
      <button
        type="button"
        className="nav-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="nav-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <div id="nav-drawer" className={`nav-drawer${open ? " open" : ""}`}>
        {links.map((item) => (
          <Link key={item.to} to={item.to} onClick={close}>
            {item.label}
          </Link>
        ))}
        {/* Contact solo en el drawer (FIXES_V5 §4 / MOBILE_NAV H4): destino de
            primer nivel en mobile (WhatsApp por sede); el nav desktop se
            mantiene corto y Contact vive en el footer. */}
        <Link to="/contact" onClick={close}>
          Contact
        </Link>
        {inStudios ? (
          <a
            href={consultHref}
            className="btn btn-ghost btn-nav"
            onClick={close}
          >
            {STUDIOS_CTA_COPY}
          </a>
        ) : (
          <Link to="/pricing" className="btn btn-primary btn-nav" onClick={close}>
            {CTA_COPY}
          </Link>
        )}
      </div>
      </div>
    </nav>
  );
}

/** Regla de copy v3 (COPY_V3 §1-2): nada de em/en dashes visibles.
 *  Nombres de sede "City <dash> Area" se muestran "City · Area".
 *  (\u2014 = em dash, \u2013 = en dash; escapados por el grep de CI) */
const cityLabel = (city: string): string =>
  city.replace(/\s*[\u2014\u2013]\s*/g, " · ");

/** Footer global. Sedes desde app/data/studios.ts.
 *  En /studios* (SEPARATION_SPEC §5): sin badges de la app 54D On (los
 *  studios se administran por Mindbody, es OTRA app), sin trust bar de
 *  suscripcion y sin link a Pricing (border rule 6). */
export function Footer() {
  const { pathname } = useLocation();
  const inStudios = pathname.startsWith("/studios");
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <h4>54D</h4>
            <p style={{ maxWidth: "22rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
              The 54-day transformation method. Coral Gables · Hallandale
              · Mexico City · Bogotá{inStudios ? "." : " · Online."}
            </p>
            {!inStudios && (
              <AppStoreBadges
                appStoreUrl={APP_STORE_URL}
                googlePlayUrl={GOOGLE_PLAY_URL}
              />
            )}
            <p className="footer-trust">
              {inStudios ? (
                <>
                  <span>By application</span>
                  <span>Limited places per Generation</span>
                  <span>Miami · Mexico City · Bogotá</span>
                </>
              ) : (
                <>
                  <span>7 days free</span>
                  <span>Cancel anytime</span>
                  <span>30-day guarantee</span>
                </>
              )}
            </p>
          </div>
          <div>
            <h4>Programs</h4>
            <Link to="/method">Method</Link>
            {!inStudios && <Link to="/on">54D ON</Link>}
            <Link to="/studios">54D Studios</Link>
            {!inStudios && <Link to="/pricing">Pricing</Link>}
          </div>
          <div>
            <h4>Studios</h4>
            {STUDIOS.map((s) => (
              <Link key={s.slug} to={`/studios/${s.slug}`}>
                {cityLabel(s.city)}
              </Link>
            ))}
          </div>
          <div>
            <h4>More</h4>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
            {/* handle Studios = sameAs del schema de sedes; confirmar con
                cliente si existe handle propio por sede */}
            <a
              className="footer-social"
              href={
                inStudios
                  ? "https://www.instagram.com/54d"
                  : "https://www.instagram.com/54d.online"
              }
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                <circle cx="12" cy="12" r="4.4" />
                <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
          </div>
        </div>
        {/* Lockup real como máscara (V4 §3): letterforms del PNG, mismo gradiente.
            URL vía asset() por el BASE_URL de Pages. */}
        <div
          className="footer-giant"
          style={{
            WebkitMaskImage: `url(${asset("images/brand/logo-54d.png")})`,
            maskImage: `url(${asset("images/brand/logo-54d.png")})`,
          }}
          aria-hidden="true"
        />
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
