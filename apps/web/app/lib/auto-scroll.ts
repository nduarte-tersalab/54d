import { useEffect, useRef } from "react";

/* ============================================================
   Autoplay de carruseles por PASOS (cliente 17/08).
   Notas tecnicas ganadas a fuerza de QC:
   - la marquesina continua (scrollLeft += x) es incompatible con
     scroll-snap mandatory: el navegador re-snapea cada frame.
   - scrollTo({behavior:"smooth"}) tambien puede ser cancelado por
     el snap a mitad de animacion. Por eso cada paso SUSPENDE el
     snap, anima, y lo restaura al asentar (~700ms).
   - avanza al siguiente tile cada `intervalMs`; al final (umbral o
     estancamiento) rebobina al inicio con salto instantaneo.
   - pausa con hover/touch/drag/foco; prefers-reduced-motion apaga.
   ============================================================ */
export function useAutoScroll<T extends HTMLElement>(intervalMs = 3600) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    let lastPos = -1;
    let restore: number | undefined;

    const withSnapSuspended = (move: () => void) => {
      el.style.scrollSnapType = "none";
      move();
      window.clearTimeout(restore);
      restore = window.setTimeout(() => {
        el.style.scrollSnapType = "";
      }, 700);
    };

    const step = () => {
      if (paused || el.scrollWidth <= el.clientWidth) return;
      const kids = [...el.children] as HTMLElement[];
      if (!kids.length) return;
      const atEnd =
        el.scrollLeft >= el.scrollWidth - el.clientWidth - 4 ||
        (lastPos >= 0 && Math.abs(el.scrollLeft - lastPos) < 20);
      if (atEnd) {
        lastPos = -1;
        withSnapSuspended(() => el.scrollTo({ left: 0, behavior: "auto" }));
        return;
      }
      lastPos = el.scrollLeft;
      /* offsetLeft se mide contra el ancestro POSICIONADO, no contra el
         carrusel: se normaliza restando el offset del primer tile (si no,
         "el siguiente" siempre es el primero y el paso mueve ~9px) */
      const base = kids[0].offsetLeft;
      const next = kids.find((k) => k.offsetLeft - base > el.scrollLeft + 8);
      withSnapSuspended(() =>
        el.scrollTo({
          left: next ? next.offsetLeft - base : el.scrollWidth,
          behavior: "smooth",
        })
      );
    };

    const id = setInterval(step, intervalMs);
    const stop = () => { paused = true; };
    const go = () => { paused = false; };

    el.addEventListener("pointerenter", stop);
    el.addEventListener("pointerleave", go);
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("touchend", () => setTimeout(go, 3500), { passive: true });
    el.addEventListener("focusin", stop);
    el.addEventListener("focusout", go);

    return () => {
      clearInterval(id);
      window.clearTimeout(restore);
      el.style.scrollSnapType = "";
    };
  }, [intervalMs]);
  return ref;
}
