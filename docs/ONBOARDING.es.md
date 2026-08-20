[English](ONBOARDING.md) · **Español**

# Onboarding

Objetivo: tener el sitio y la API corriendo en tu máquina, y entender qué
mirar primero. Toma unos 15 minutos si ya tenés las credenciales.

## 0. Antes de empezar: pedí los accesos

Nada de esto está en el repo (ni debe estarlo). Pedíselos a Nicolás:

| Qué | Para qué | Sin esto |
|---|---|---|
| `apps/web/.env` | Clave publicable de Supabase, URL de la API | El sitio arranca igual |
| `apps/api/.dev.vars` | Supabase (secret), Mindbody, Stripe, Meta, GA4 | La API arranca, pero los endpoints que tocan datos fallan |
| Acceso al proyecto de Supabase | Ver datos, correr migraciones | Podés leer el schema en `supabase/migrations/` |
| Acceso a Cloudflare | Deploy | Podés desarrollar sin esto |
| Acceso a Stripe | El trabajo de pagos | Ver [STRIPE.md](STRIPE.es.md) |

Ambos archivos tienen un `.example` versionado que muestra qué variables van.
Copialos y completá:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/web/.env.example apps/web/.env
```

## 1. Instalar

Node 20 o superior (el equipo usa 24). No hay workspaces configurados: cada app
instala por separado.

```bash
npm install --prefix apps/web
npm install --prefix apps/api
```

## 2. Levantar

Dos terminales:

```bash
npm run dev --prefix apps/web   # http://localhost:5173
```

```bash
npm run dev --prefix apps/api   # http://localhost:8788
```

El sitio funciona sin la API: los formularios y el checkout fallan de forma
controlada (mensaje al usuario, no pantalla rota). Para trabajar en frontend
alcanza con levantar `web`.

## 3. Verificar que quedó bien

```bash
curl -s -o /dev/null -w "web:%{http_code}\n" http://localhost:5173/
curl -s http://localhost:8788/health          # {"ok":true}
npm run typecheck --prefix apps/web           # 0 errores
```

Abrí estas páginas y contrastá con producción (https://54d-web.54d.workers.dev):

- `/` — el gate: video, dos puertas (Studios / ON)
- `/on` — la página de venta del producto online
- `/programs/max-burn` — una de las 13 landings de pauta
- `/studios/coral-gables` — una sede, con su formulario de leads
- `/assessment` — el lead magnet

Probá el cambio de idioma con el selector EN/ES del header. El idioma se
detecta del navegador y se recuerda en la cookie `54d_lang`.

## 4. Cómo está organizado el código

**Una ruta = un archivo** en `apps/web/app/routes/`. Las rutas se registran en
`apps/web/app/routes.ts`.

Los dos archivos que más vas a tocar:

- `apps/web/app/data/program-landings.ts` — el catálogo de los 13 programas.
  Cada uno tiene hook, bullets, FAQ, precios, fotos y quick wins, todo en EN y ES.
  **Cambiar contenido de una landing casi siempre es editar este archivo, no el template.**
- `apps/web/app/routes/program-landing.tsx` — el template único que renderiza
  las 13. Un cambio acá impacta a todas.

Lo mismo para sedes: `apps/web/app/data/studios.ts` (datos) y
`apps/web/app/routes/studio-detail.tsx` (template).

**La API es prácticamente un solo archivo**: `apps/api/src/index.ts`.
Endpoints: `/health`, `/checkout`, `/webhooks/stripe`, `/mindbody/classes`, `/leads`.

**Estilos**: `apps/web/app/app.css` tiene el sistema (tokens de color, tipografía,
espaciado, alturas de control). Los estilos muy locales a una página viven
inline o en un bloque `<style>` dentro de esa ruta.

## 5. Convenciones que importan

Están en el [README](../README.es.md#reglas-del-proyecto). Las tres que más se
rompen sin querer:

- Todo texto nuevo necesita **EN y ES**. El patrón es `Record<Lang, string>` en
  data, o `es ? "..." : "..."` en JSX.
- **Sin em dashes** en copy visible.
- Las **alturas de botón salen de tokens** (`--btn-h`, `--btn-h-sm`,
  `--btn-h-nav`), nunca de padding a ojo. Hubo una ronda entera para arreglar
  eso; si agregás un botón con altura propia, volvés a romperlo.

## 6. Publicar

Ver [DEPLOY.md](DEPLOY.md). En corto:

```bash
source .env.cloudflare
cd apps/web && VITE_API_URL=https://54d-api.54d.workers.dev npm run build && npx wrangler deploy
```

El build toma un *snapshot* de la configuración: si cambiás `wrangler.toml`,
tenés que reconstruir antes de deployar o publicás la versión vieja.

## 7. Por dónde seguir

1. [STATUS.md](STATUS.es.md) — el estado real: qué está terminado y qué está esperando datos del cliente.
2. [STRIPE.md](STRIPE.es.md) — si venís a conectar pagos, ese es tu documento.
3. [ARCHITECTURE.md](ARCHITECTURE.md) — el flujo de dinero y atribución, que es el corazón del proyecto.
