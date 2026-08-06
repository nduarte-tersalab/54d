import { useEffect, useState } from "react";

/**
 * Sticky CTA mobile compartida (FIXES_V5 §4 / MOBILE_COMMERCE F5).
 * Extraída de pricing.tsx: barra fija inferior en ≤900px que aparece
 * tras ~1.2 pantallas de scroll (umbral ABSOLUTO: el 25% relativo dejaba
 * 3+ pantallas sin CTA en páginas largas como /on) y compensa el footer
 * con paddingBottom en el body.
 */
export function StickyCta({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => {
      setVisible(mq.matches && window.scrollY > window.innerHeight * 1.2);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /* Con la barra visible, compensa el solape sobre el legal del footer
     (~76px + safe-area) — MOBILE_COMMERCE F5 fix 4. */
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "84px";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [visible]);

  if (!visible) return null;

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
      <a
        href={href}
        className="btn btn-primary"
        style={{ display: "block", width: "100%", textAlign: "center" }}
      >
        {label}
      </a>
    </div>
  );
}
