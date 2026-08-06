import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { STUDIOS, cityLabel } from "../data/studios";
import { asset } from "../lib/asset";
import { AppStoreBadges } from "./badges";
import { LangToggle, useLang } from "../lib/i18n";

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
  { to: "/method", label: { en: "Method", es: "Método" } },
  { to: "/on", label: { en: "54D ON", es: "54D ON" } },
  { to: "/studios", label: { en: "Studios", es: "Studios" } },
  { to: "/blog", label: { en: "Blog", es: "Blog" } },
] as const;

/* CTA global unificado (DESIGN_FIXES_V4 §5): nav y hero, mismo copy.
   \u2014 = em dash del copy V4, escapado por el grep de CI. */
const CTA_COPY = { en: "Start free. 7 days.", es: "Empieza gratis. 7 días." };

/* SEPARATION_SPEC §5: en rutas /studios* el trial es lenguaje de
   suscripcion de ON y no puede aparecer; nav y footer mutan solos via
   pathname (toda ruta studio futura queda protegida por defecto). */
const STUDIOS_CTA_COPY = { en: "Request a consultation", es: "Solicita una consulta" };

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
  const { lang } = useLang();
  const inStudios = pathname.startsWith("/studios");
  /* Contexto ONLINE (cliente 07/08): en /on, /pricing y las landings de
     programas el nav lleva el lockup oficial de 54D ON */
  const inOn =
    pathname === "/on" ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/programs");
  /* CTA de consulta pathname-aware: en la sede ancla al form de ESA pagina
     (#reserva); en el index, al grid de sedes (#sedes). Anchor nativo
     same-page: el browser scrollea solo, sin sacar al visitante de la
     pagina del form. */
  /* En /programs/* el unico amarillo de la vista tiene que ser el boton
     que cobra: el CTA del nav baja a ghost (QUIET v6, un primario por
     vista). Destino y copy no cambian. */
  const inPrograms = pathname.startsWith("/programs");
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
        {inOn ? (
          <img
            src={asset("images/brand/logo-54d-on.svg")}
            alt="54D ON"
            className="logo-on"
          />
        ) : (
          <img src={asset("images/brand/logo-54d.png")} alt="54D" width={52} height={52} />
        )}
      </Link>
      <div className="nav-links">
        {links.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label[lang]}
          </NavLink>
        ))}
        <LangToggle />
        {inStudios ? (
          <a href={consultHref} className="btn btn-ghost btn-nav">
            {STUDIOS_CTA_COPY[lang]}
          </a>
        ) : (
          <Link
            to="/pricing"
            className={`btn ${inPrograms ? "btn-ghost" : "btn-primary"} btn-nav`}
          >
            {CTA_COPY[lang]}
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
            {item.label[lang]}
          </Link>
        ))}
        {/* Contact solo en el drawer (FIXES_V5 §4 / MOBILE_NAV H4): destino de
            primer nivel en mobile (WhatsApp por sede); el nav desktop se
            mantiene corto y Contact vive en el footer. */}
        <Link to="/contact" onClick={close}>
          {lang === "es" ? "Contacto" : "Contact"}
        </Link>
        <LangToggle style={{ marginTop: "1.2rem" }} />
        {/* En el drawer el CTA de consulta ES el primario de la vista
            (mobile no tiene otro botón a la vista): btn-primary */}
        {inStudios ? (
          <a
            href={consultHref}
            className="btn btn-primary btn-nav"
            onClick={close}
          >
            {STUDIOS_CTA_COPY[lang]}
          </a>
        ) : (
          <Link
            to="/pricing"
            className={`btn ${inPrograms ? "btn-ghost" : "btn-primary"} btn-nav`}
            onClick={close}
          >
            {CTA_COPY[lang]}
          </Link>
        )}
      </div>
      </div>
    </nav>
  );
}

/* cityLabel compartido y localizado: vive en data/studios.ts (una sola
   fuente para footer, index de sedes y detalle de sede). */

/** Footer global. Sedes desde app/data/studios.ts.
 *  En /studios* (SEPARATION_SPEC §5): sin badges de la app 54D On (los
 *  studios se administran por Mindbody, es OTRA app), sin trust bar de
 *  suscripcion y sin link a Pricing (border rule 6). */
export function Footer() {
  const { pathname } = useLocation();
  const inStudios = pathname.startsWith("/studios");
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <h4>54D</h4>
            <p style={{ maxWidth: "22rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {es
                ? "El método de transformación de 54 días. Coral Gables · Hallandale · Ciudad de México · Bogotá"
                : "The 54-day transformation method. Coral Gables · Hallandale · Mexico City · Bogotá"}
              {inStudios ? "." : " · Online."}
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
                  <span>{es ? "Admisión por solicitud" : "By application"}</span>
                  <span>{es ? "Cupos limitados por Generación" : "Limited places per Generation"}</span>
                  <span>{es ? "Miami · Ciudad de México · Bogotá" : "Miami · Mexico City · Bogotá"}</span>
                </>
              ) : (
                <>
                  <span>{es ? "7 días gratis" : "7 days free"}</span>
                  <span>{es ? "Cancela cuando quieras" : "Cancel anytime"}</span>
                  <span>{es ? "Garantía de 30 días" : "30-day guarantee"}</span>
                </>
              )}
            </p>
          </div>
          <div>
            <h4>{es ? "Programas" : "Programs"}</h4>
            <Link to="/method">{es ? "Método" : "Method"}</Link>
            {!inStudios && <Link to="/on">54D ON</Link>}
            <Link to="/studios">54D Studios</Link>
            {!inStudios && <Link to="/pricing">Pricing</Link>}
          </div>
          <div>
            <h4>Studios</h4>
            {STUDIOS.map((s) => (
              <Link key={s.slug} to={`/studios/${s.slug}`}>
                {cityLabel(s.city, lang)}
              </Link>
            ))}
          </div>
          <div>
            <h4>{es ? "Más" : "More"}</h4>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">{es ? "Contacto" : "Contact"}</Link>
            {/* handle Studios = sameAs del schema de sedes; confirmar con
                cliente si existe handle propio por sede */}
            <a
              className="footer-social"
              href={
                inStudios
                  ? /* IG por sede (cliente 04/08): en pagina de sede, el handle
                       de ESA sede; en el index, el de la sede US insignia */
                    STUDIOS.find((s) => pathname === `/studios/${s.slug}`)
                      ?.instagram ?? "https://www.instagram.com/54d.mia"
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
          <span>
            © {new Date().getFullYear()} 54D.{" "}
            {es ? "Todos los derechos reservados." : "All rights reserved."}
          </span>
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
