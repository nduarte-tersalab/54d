[English](README.md) · **Español**

# 54D

Sitio y plataforma de 54D: el método de transformación de 54 días.
Dos productos con públicos y precios muy distintos, en un solo código base:

| Producto | Qué es | Precio | Funnel |
|---|---|---|---|
| **54D ON** | Programa online en app propia | desde USD 54/mes | Meta Ads → checkout self-service |
| **54D Studios** | Presencial, 5 sedes | ~USD 60.000/año | SEO local → solicitud de consulta |

> La separación entre los dos es una **regla de negocio, no una preferencia de diseño**.
> Ver [docs/marketing/BRAND_SEPARATION.md](docs/marketing/BRAND_SEPARATION.md) antes de
> mover copy o imágenes entre secciones.

**Producción:** https://54d-web.54d.workers.dev · **API:** https://54d-api.54d.workers.dev

---

## Empezar (15 minutos)

Si es tu primer día en el proyecto, seguí **[docs/ONBOARDING.md](docs/ONBOARDING.es.md)**:
tiene el setup paso a paso, cómo pedir las credenciales y cómo verificar que
todo quedó andando.

Resumen para quien ya tiene el entorno:

```bash
npm install --prefix apps/web && npm install --prefix apps/api
npm run dev --prefix apps/web   # sitio en http://localhost:5173
npm run dev --prefix apps/api   # API en  http://localhost:8788
```

Requiere Node 20+ (se desarrolla con 24) y archivos de entorno que **no están
en el repo**: `apps/web/.env` y `apps/api/.dev.vars`. Copiá los `.example` y
pedí los valores reales.

---

## Stack

- **Web** — React Router v7 (framework mode) sobre Cloudflare Workers, SSR.
  Bilingüe EN/ES con detección por navegador.
- **API** — Worker con Hono: checkout de Stripe, webhooks, leads, proxy de Mindbody,
  eventos server-side a Meta CAPI y GA4.
- **Datos** — Supabase (Postgres + Auth). Migraciones versionadas en `supabase/migrations/`.
- **Pagos** — Stripe directo. *(Shopify, WordPress y Hotmart quedaron atrás.)*

```
54d/
├── apps/
│   ├── web/            # sitio público + /admin
│   │   ├── app/routes/         # una ruta por página
│   │   ├── app/data/           # catálogo de programas y sedes
│   │   ├── app/lib/            # i18n, atribución, helpers de assets
│   │   └── public/images/      # media aprobada por el cliente
│   └── api/            # Worker Hono (src/index.ts es casi todo)
├── packages/design/    # tokens y fuentes
├── supabase/migrations/
└── docs/               # esta documentación
```

---

## Documentación

**Empezá acá**

| Documento | Para qué |
|---|---|
| [ONBOARDING.md](docs/ONBOARDING.es.md) | Setup local, credenciales, primera verificación |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Cómo encajan las piezas y por qué |
| [STATUS.md](docs/STATUS.es.md) | Qué está listo, qué falta, qué está bloqueado |

**Trabajo en curso**

| Documento | Para qué |
|---|---|
| [STRIPE.md](docs/STRIPE.es.md) | Estado de pagos, qué falta conectar, bugs conocidos |
| [INTEGRATIONS.md](docs/INTEGRATIONS.es.md) | Mindbody, Trainerize y **FitBudd**: qué hace cada uno |
| [ANALYTICS.md](docs/ANALYTICS.md) | Contrato de medición y atribución por anuncio |
| [DEPLOY.md](docs/DEPLOY.md) | Cómo se publica |

**Contexto de producto** (leer antes de cambiar contenido)

- [marketing/BRAND_SEPARATION.md](docs/marketing/BRAND_SEPARATION.md) — la regla dura ON vs Studios
- [marketing/SITE_STRATEGY.md](docs/marketing/SITE_STRATEGY.md) — qué hace cada página
- [marketing/PROGRAM_LANDINGS.md](docs/marketing/PROGRAM_LANDINGS.md) — las 13 landings de pauta
- [design/](docs/design/) — historial de las rondas de diseño y sus reglas

---

## Reglas del proyecto

Estas se rompen seguido por descuido. Valen para código, copy e imágenes:

1. **No inventar datos.** Testimonios, cifras de resultados, direcciones y
   teléfonos salen de fuentes verificadas (reseñas reales del App Store, perfiles
   de Google Business). Si no hay dato, no se publica.
2. **Nada de boxeo ni conos naranjas** en imágenes. El cliente retiró las bolsas
   de los studios; hay una lista de assets vetados en los comentarios de
   `apps/web/app/data/program-landings.ts`.
3. **Cero fotos de gimnasio presencial en contexto ON** (`/on`, `/pricing`,
   `/programs/*`). Ese producto es online: las fotos son de set, app o resultados.
4. **Bilingüe siempre.** Todo string visible necesita variante EN y ES.
   Español neutro con tuteo, nunca voseo.
5. **Sin em dashes** en copy visible (hay un grep de CI que los caza).
6. **Un solo botón primario amarillo por vista** (los secundarios son *ghost*).
7. **Los secretos nunca se commitean.** `.env*` y `.dev.vars*` están en
   `.gitignore`; si tocás uno, verificá `git status` antes de commitear.

---

## Verificación antes de commitear

```bash
npm run typecheck --prefix apps/web   # debe terminar en 0 errores
```

El proyecto no tiene test suite automatizada: la verificación es **visual y
medida**. Muchos cambios de layout se validaron con Playwright midiendo el DOM
real (alturas de botón, overflow, alineación). Si tocás layout, mirá la página
en las dos resoluciones (1440 y 390) y en los dos idiomas antes de dar por
terminado.
