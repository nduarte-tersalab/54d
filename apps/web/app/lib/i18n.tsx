import { createContext, useContext, useState } from "react";

/* ============================================================
   i18n fase 1 (cliente, 04/08/2026): EN primario, ES secundario.
   - Deteccion automatica server-side por Accept-Language en el
     primer visit (root loader) — sin flash de idioma.
   - Eleccion manual persistida en cookie 54d_lang (1 anio).
   - Sin URLs /es todavia: Google indexa EN (idioma principal).
     La fase SEO local MX/CO migrara a subpaths + hreflang.
   - Tono ES: neutro latino, "tu". JAMAS voseo (veto marketing).
   ============================================================ */

export type Lang = "en" | "es";

export const LANG_COOKIE = "54d_lang";

/** Resuelve el idioma en el server: cookie manda; si no, Accept-Language */
export function resolveLang(request: Request): Lang {
  const cookie = request.headers.get("Cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)54d_lang=(en|es)/);
  if (m) return m[1] as Lang;
  const accept = request.headers.get("Accept-Language") ?? "";
  const primary = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return primary.startsWith("es") ? "es" : "en";
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({
  initial,
  children,
}: {
  initial: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initial);
  const setLang = (l: Lang) => {
    setLangState(l);
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = l;
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** Selector quiet EN · ES (nav, drawer y gate del home) */
export function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();
  return (
    <span className="lang-toggle" style={style}>
      <button
        type="button"
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        aria-pressed={lang === "es"}
        onClick={() => setLang("es")}
      >
        ES
      </button>
    </span>
  );
}
