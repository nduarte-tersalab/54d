import type { Config } from "@react-router/dev/config";

/**
 * Dos modos de build:
 * - Default: SSR en Cloudflare Workers (producción)
 * - GITHUB_PAGES=true: sitio estático prerenderizado bajo /54d/
 *   (preview en nduarte-tersalab.github.io/54d). Las rutas admin
 *   quedan como SPA client-side (sin loaders de servidor).
 */
const ghPages = process.env.GITHUB_PAGES === "true";

export default {
  ssr: !ghPages,
  ...(ghPages
    ? {
        basename: "/54d/",
        // Con ssr:false, toda ruta con loader de servidor debe prerenderizarse.
        // studio-detail (loader) → las 5 sedes enumeradas.
        prerender: [
          "/",
          "/method",
          "/on",
          "/pricing",
          "/studios",
          "/studios/coral-gables",
          "/studios/hallandale",
          "/studios/mexico-carso",
          "/studios/mexico-santa-fe",
          "/studios/bogota",
          "/blog",
          "/contact",
        ],
      }
    : {}),
} satisfies Config;
