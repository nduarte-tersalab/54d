import { useEffect, useRef, useState } from "react";

/**
 * Sticky CTA mobile compartida (FIXES_V5 §4 / MOBILE_COMMERCE F5).
 * Extraída de pricing.tsx: barra fija inferior en ≤900px que aparece
 * tras ~0.85 pantallas de scroll (umbral ABSOLUTO: el 25% relativo dejaba
 * 3+ pantallas sin CTA en páginas largas como /on) y compensa el footer
 * con paddingBottom en el body.
 *
 * onClick (opcional): convierte la barra en un botón que cobra en 1 tap
 * en vez de un ancla que solo scrollea. Sin onClick sigue siendo el <a>
 * de siempre: on.tsx y pricing.tsx la usan así y no se tocan.
 * hideWhenVisible (opcional): selector (o lista separada por comas) de los
 * bloques de compra. Cuando CUALQUIERA entra en viewport la barra se retira,
 * para no dejar dos botones amarillos primarios en la misma vista (QUIET v6).
 * error (opcional): mensaje de fallo del checkout renderizado DENTRO de la
 * barra, sobre el botón: el fallo del tap sticky ya no es silencioso.
 */
export function StickyCta({
  href,
  label,
  onClick,
  busy,
  hideWhenVisible,
  error,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  busy?: boolean;
  hideWhenVisible?: string;
  error?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => {
      setVisible(mq.matches && window.scrollY > window.innerHeight * 0.85);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /* Estado por elemento observado: covered = ALGUNO intersecta */
  const coveredMap = useRef(new Map<Element, boolean>());
  useEffect(() => {
    if (!hideWhenVisible) return;
    const els = hideWhenVisible
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .flatMap((sel) => Array.from(document.querySelectorAll(sel)));
    if (els.length === 0) return;
    const map = coveredMap.current;
    map.clear();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) map.set(e.target, e.isIntersecting);
        setCovered(Array.from(map.values()).some(Boolean));
      },
      { threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      map.clear();
    };
  }, [hideWhenVisible]);

  /* Con la barra visible, compensa el solape sobre el legal del footer
     (~76px + safe-area) — MOBILE_COMMERCE F5 fix 4. */
  useEffect(() => {
    if (!visible || covered) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "84px";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [visible, covered]);

  if (!visible || covered) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        padding: "0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom))",
        background: "rgba(7, 7, 7, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--hairline)",
      }}
    >
      {error && (
        <p
          role="alert"
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.78rem",
            color: "var(--c-red)",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      {onClick ? (
        <button
          type="button"
          className="btn btn-primary btn-attn"
          onClick={onClick}
          disabled={busy}
          aria-busy={busy}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            minHeight: "var(--btn-h-mobile)",
          }}
        >
          {label}
        </button>
      ) : (
        <a
          href={href}
          className="btn btn-primary btn-attn"
          style={{ display: "block", width: "100%", textAlign: "center" }}
        >
          {label}
        </a>
      )}
    </div>
  );
}
