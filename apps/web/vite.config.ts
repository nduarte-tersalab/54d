import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// GITHUB_PAGES=true → build estático para Pages (sin runtime de Workers,
// assets bajo /54d/). Default → Cloudflare Workers con SSR.
const ghPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: ghPages ? "/54d/" : "/",
  plugins: [
    ...(ghPages ? [] : [cloudflare({ viteEnvironment: { name: "ssr" } })]),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
