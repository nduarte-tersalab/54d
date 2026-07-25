import { useEffect, useState } from "react";
import { asset } from "../lib/asset";

/* ============================================================
   Smart App Banner (mobile only).
   - iOS Safari: NO renderiza esto — usa el banner nativo del
     meta apple-itunes-app en root.tsx (lo dibuja el sistema).
   - Android (cualquier browser) y iOS con Chrome/Firefox
     (CriOS/FxiOS, donde el nativo no existe): esta barra.
   Dismiss persistente en localStorage. Corre solo en cliente
   (SSR devuelve null; sin mismatch de hidratación).
   ============================================================ */

const APP_STORE_URL = "https://apps.apple.com/us/app/54d-on/id1520445334";
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays";
const DISMISS_KEY = "54d-app-banner-dismissed";
const BANNER_H = "56px";

export function SmartAppBanner() {
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      setPlatform("android");
    } else if (/iphone|ipad|ipod/i.test(ua) && /crios|fxios/i.test(ua)) {
      setPlatform("ios");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (platform) root.style.setProperty("--app-banner-h", BANNER_H);
    else root.style.removeProperty("--app-banner-h");
    return () => root.style.removeProperty("--app-banner-h");
  }, [platform]);

  if (!platform) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setPlatform(null);
  };

  return (
    <div className="app-banner">
      <button
        type="button"
        className="app-banner-close"
        aria-label="Dismiss app banner"
        onClick={dismiss}
      >
        ×
      </button>
      <img
        src={asset("images/brand/logo-54d.png")}
        alt=""
        className="app-banner-icon"
      />
      <span className="app-banner-text">
        <b>54D On</b>
        <small>A real coach, every day</small>
      </span>
      <a
        href={platform === "android" ? PLAY_URL : APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="app-banner-get"
      >
        Get app
      </a>
    </div>
  );
}
