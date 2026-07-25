# 54D — Información verificada de la app móvil

> Investigado el 2026-07-24. Fuentes: iTunes Lookup API (datos oficiales de Apple), JSON-LD de la ficha de Google Play, y HTML de landing.54d.com / 54d.com.
> Todo lo marcado VERIFICADO fue comprobado contra la fuente; lo NO VERIFICADO no debe usarse en copy sin confirmar.

---

## 1. App principal: **54D On** (la app de la suscripción 54D ON)

### iOS — App Store (VERIFICADO vía iTunes Lookup API, 2026-07-24)

| Campo | Valor |
|---|---|
| Nombre exacto | **54D On** (trackName oficial de Apple) |
| URL | https://apps.apple.com/us/app/54d-on/id1520445334 (curl -I → **200**) |
| App ID | 1520445334 |
| Bundle ID | `com.trainerize.fiftyfourdays` |
| Desarrollador/Seller | Coral GPY Gables LLC |
| Rating | **4.9** (4.94519) con **1,788 valoraciones** (US store) |
| Precio | Gratis (la suscripción se vende aparte) |
| Categoría | Health & Fitness |
| Clasificación | 17+ |
| Idiomas | EN, FR, DE, IT, PT, ES |
| iOS mínimo | 15.0 |
| Versión actual | 8.6.3 (16-abr-2026) |
| Lanzamiento | 29-jun-2020 |

### Android — Google Play (VERIFICADO vía JSON-LD de la ficha, 2026-07-24)

| Campo | Valor |
|---|---|
| Nombre exacto | **54D On** |
| URL | https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays (curl -I → **200**) |
| Package | `com.trainerize.fiftyfourdays` |
| Desarrollador (Play) | "54D" (URL de autor: https://54donline.fitbudd.com/) |
| Rating | **4.98** con **551 valoraciones** |
| Descargas | **10K+** |
| Precio | Gratis |
| Content rating | Everyone |

Nota técnica: el package/bundle `com.trainerize.fiftyfourdays` indica origen en la plataforma Trainerize; la URL de autor en Play apunta a FitBudd (54donline.fitbudd.com). Plataforma white-label subyacente actual: NO VERIFICADO más allá de estos indicios.

### Descripción oficial de la ficha (texto idéntico en App Store y Play, VERIFICADO)

> "54D ON is a digital personalized training platform that brings together exercise, nutrition, and wellness in one place.
>
> Unlike other apps, you never train alone. Every user is supported by a real coach who guides you, motivates you, and provides daily personalized follow-up. Your coach designs a 360° plan tailored to your level, goals, and lifestyle.
>
> Train anytime, anywhere, with access to dozens of On-Demand programs and live workouts including strength, cardio, mobility, Pilates, yoga, and wellness. You also receive nutrition plans and tools designed to support your energy, focus, and consistency.
>
> Everything is built to adapt to you, your pace, and your life.
>
> Train when you want, where you want.
> When you join the 54D ON family, you're never training alone."

Además, la ficha de iOS añade (VERIFICADO):
> "The app integrates with Apple Health to show your daily activity - distance, steps, active energy, and flights… App also uses Apple Health to track energy burned and heart rate during a workout session, if an Apple Watch is used. Workout metrics are shared with the coach to better design your workout schedule."

Disclaimer oficial en ambas fichas: "Users should seek a doctor's advice before using this app and making any medical decisions."

### Features prometidas por la ficha (VERIFICADAS — texto de la ficha)

1. **Coach real con seguimiento diario personalizado** — "Every user is supported by a real coach who guides you, motivates you, and provides daily personalized follow-up."
2. **Plan 360° a medida** — "Your coach designs a 360° plan tailored to your level, goals, and lifestyle."
3. **Programas On-Demand y workouts en vivo** — "dozens of On-Demand programs and live workouts including strength, cardio, mobility, Pilates, yoga, and wellness."
4. **Planes y herramientas de nutrición** — "nutrition plans and tools designed to support your energy, focus, and consistency."
5. **Integración Apple Health / Apple Watch** (solo iOS) — actividad diaria, energía quemada y frecuencia cardiaca en workouts; métricas compartidas con el coach.

Screenshots: la Lookup API devolvió `screenshotUrls` vacío para 54D On (inusual); las capturas visibles en la web de la store NO fueron descargadas ni catalogadas → contenido exacto de screenshots: NO VERIFICADO.

---

## 2. Relación app ↔ suscripción 54D ON

- La app es **gratis de descargar** en ambas stores (VERIFICADO).
- landing.54d.com vende la **"54D ON Subscription"**: prueba gratis de 7 días; precios mostrados ~~$99~~ **$54/mes** (mensual), ~~$89~~ $52/mes (trimestral), ~~$79~~ $49/mes (anual), "Cancel anytime" (VERIFICADO en el contenido de landing.54d.com el 2026-07-24; los precios pueden cambiar — reconfirmar antes de publicar cifras).
- La landing usa el badge **"4.9 App Store"** como social proof (VERIFICADO en el HTML), lo que apunta a que la app es el canal de entrega del programa.
- La ficha describe la membresía como "When you join the 54D ON family…" y todo el value prop (coach, planes, on-demand) vive en la app.
- **NO VERIFICADO**: el flujo exacto de acceso (si el login member es exclusivamente vía app, si hay web-app paralela, y si la suscripción se puede comprar in-app o solo vía web/Stripe). Ninguna página estática de 54d.com/start.54d.com enlaza directamente a las stores (verificado por grep del HTML: no hay links a apps.apple.com ni play.google.com), así que el deep-link oficial de descarga desde la web: NO EXISTE / NO VERIFICADO.

---

## 3. Otras apps "54D" (legacy / estudios — NO confundir en marketing)

| App | Store | URL | Estado |
|---|---|---|---|
| **54D** (iOS, id1450739885, bundle `com.fitmetrix.54dapp`) | App Store | https://apps.apple.com/us/app/54d/id1450739885 (200) | App de estudios sobre FitMetrix. Última versión 3.25.0 del 27-ago-2021 → **aparentemente abandonada**. Rating 4.3 (10 valoraciones). Descripción: "This App will help you through all your 54D Journey… follow your performance and schedule your sessions." |
| **54D Studios** (Android, `com.fitmetrix.dmx54`) | Google Play | https://play.google.com/store/apps/details?id=com.fitmetrix.dmx54 (200) | Publicada por "FitMetrix by MINDBODY". Descripción: "Plan and Schedule your classes in our Studios with us from your Mobile device." Para clases presenciales, no para la suscripción ON. |
| ~~54D (Android, `com.fitmetrix.d54`)~~ | Google Play | — | curl -I → **404**. Ya no existe. |

La página de desarrollador "54D" en Play solo lista **una** app activa: 54D On (`com.trainerize.fiftyfourdays`) (VERIFICADO).

**Recomendación marketing**: enlazar únicamente 54D On (id1520445334 / com.trainerize.fiftyfourdays). No usar las apps FitMetrix/Mindbody en campañas de la suscripción ON.

---

## 4. URLs canónicas para campañas

- iOS: `https://apps.apple.com/us/app/54d-on/id1520445334`
- Android: `https://play.google.com/store/apps/details?id=com.trainerize.fiftyfourdays`
- Landing suscripción: `https://landing.54d.com/`
