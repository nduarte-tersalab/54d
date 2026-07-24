# 54D — English Copy Bible (Primary Language: EN)

Source of truth for all public-site English copy. Funnel and page structure mirror `SITE_STRATEGY.md`.
Voice: direct, demanding, premium (Nike/Whoop). Second person. Short, hard headlines. No cheap hype — never "burn fat fast", "melt pounds", "get shredded". **NYC does not exist.** Prices are placeholders — keep `// PRECIO_PENDIENTE` comments untouched (internal marker).
Routes: `/` · `/method` · `/on` · `/pricing` · `/studios` · `/studios/:slug` · `/blog` · `/contact`. `/admin` stays in Spanish — do not touch.

---

## Glossary — fixed terms (all translators must comply)

| ES | EN | Notes |
|---|---|---|
| generación | **Generation** | Brand term. "Gen 42" in testimonials. See ruling below. |
| sede / studio | **studio** (lowercase in prose; "54D Studios" as product name) | Never "location", "branch", "gym". |
| coach en vivo | **live coach** | A real human. Never "AI coach", "trainer bot". |
| entrenamiento de alta intensidad | **high-intensity training** | Not "HIIT" unless technically accurate in context. |
| protocolo de nutrición | **nutrition protocol** | Not "diet", not "meal plan". |
| garantía de 30 días | **30-day guarantee** | Always this exact phrase. |
| prueba de 7 días gratis | **7-day free trial** | CTA form: "Start free — 7 days". |
| seguimiento diario | **daily coaching** / "checks in every day" | Not "tracking". |
| cupo limitado | **limited spots** | Not "seats". |
| el método | **the method** (lowercase); "The 54D Method" as proper noun | |
| transformación | **transformation** | The program's outcome word. Use sparingly, never plural hype. |
| Ciudad de México | **Mexico City** | Studios: "Mexico City — Carso", "Mexico City — Santa Fe". |

**Ruling: "Generation" over "cohort"** — it's 54D's own brand vocabulary ("Gen 42"), carries identity and belonging where "cohort" reads clinical/academic; we keep the equity, and define it on first use per page ("your Generation — the group you start and finish with").

Fixed CTA labels (verbatim, sitewide): **"Start free — 7 days"** (primary → `/pricing`) · **"Explore the studios"** (→ `/studios`) · **"See the method"** (→ `/method`) · **"Reserve your spot"** (studio lead form) · **"Start free trial"** (pricing cards → `startCheckout(priceId)`).
Global nav: The Method (`/method`) · 54D ON (`/on`) · Studios (`/studios`) · Blog (`/blog`) · button "Start free" (`/pricing`).

---

## / — Home

- **SEO title (43):** `54D — The 54-Day Transformation Method`
- **Meta (140):** `High-intensity training, personalized nutrition, and a coach on you every day for 54 days. Online, or in our studios in Miami, Mexico City, and Bogotá.`
- **Hero:** kicker `The 54D Method` · H1 **"54 days. One transformation."** · Sub: "High-intensity training, personalized nutrition, and a coach who checks in every single day. Online, or in our studios." · CTA1 "Start free — 7 days" → `/pricing` · CTA2 "Explore the studios" → `/studios`
- **Ticker:** Coral Gables · Hallandale · Mexico City · Bogotá · Online everywhere
- **Method section (D01/D07/D21/D54 cards):** H2 **"Not a gym. A program with a start — and an end."** Card copy notes: "What you eat is part of the program." / "You don't finish a challenge. You finish someone new — with the tools to stay that way." Link: "See the full method →" → `/method`
- **ON/Studios split:** ON panel "Your transformation. Wherever you are." → `/on` · Studios panel "The full experience, in person." → `/studios`
- **Social proof:** H2 **"Thousands have done it. You're next."** — 3 testimonials with name, age, city, Generation ("Gen 42, Mexico City")
- **Final CTA:** **"Day 1 is today."** → `/pricing`

## /method — The 54D Method

- **SEO title (44):** `The 54D Method: How 54 Days Change You`
- **Meta (139):** `What the 54D Method is: 54 days of structured training, a personalized nutrition protocol, and daily coaching. How it works, day by day.`
- **Hero:** kicker `The Method` · H1 **"54 days of method. Not luck."** · Sub: "A program with a start date, an end date, and a coach who won't let you drift."
- **AEO definition paragraph (first paragraph on page — quotable verbatim by ChatGPT/Gemini):**
  > "54D is a 54-day body-transformation program that combines high-intensity training, a personalized nutrition protocol, and daily follow-up from a real coach. It is not a fitness app or a gym membership: it is a structured method with a start date, a demanding standard, and an end. 54D is available online through 54D ON, and in person at 54D Studios in Coral Gables, Hallandale, Mexico City, and Bogotá."
- **Timeline D01→D54:** Week 1 "Assessment and base." · D07 "Your nutrition protocol is already running." · D21 "Where most people quit. This is where your coach pushes harder." · D54 "The result — and the plan to keep it."
- **3 pillars:** Training ("Sessions designed by coaches, not by an algorithm. Every day has a purpose.") · Nutrition ("No generic diets. What you eat is part of the program.") · Coaching ("A coach who writes to you, corrects you, demands more. Every day.")
- **FAQ (FAQPage schema):** "Do I need prior experience?" / "What if I miss a day?" / "ON or Studios — which one is for me?" / "What results can I expect in 54 days?"
- **Closing split:** "Do it online" → `/on` · "Do it in a studio" → `/studios`
- **CTAs:** "Start free — 7 days" → `/pricing` · "Explore the studios" → `/studios`

## /on — 54D ON

- **SEO title (48):** `54D ON: The 54-Day Method, Online with a Coach`
- **Meta (145):** `The full 54D program from home: daily training sessions, a personalized nutrition protocol, and a real coach who follows you. Try it free for 7 days.`
- **Hero:** kicker `54D ON — Online` · H1 **"The full method. Wherever you are."** · Sub: "Same training. Same protocol. Same standard. No gym, no scheduling excuses." · CTA "Start free — 7 days" → `/pricing`
- **What's included:** Daily video training ("54 progressive sessions. With whatever you have at home.") · Nutrition protocol ("Built for your body and your goal from day 1.") · Live coach ("Real follow-up over chat. Corrects you, pushes you, answers you.") · Community ("You train alone. You're not alone.")
- **How it works (3 steps):** "1. Activate your 7-day free trial." / "2. Get your protocol and start Day 1." / "3. On day 8, you decide. If you stay, your transformation is already moving."
- **App section:** H2 **"Your whole program. In your pocket."**
- **Honest ON vs Studios table** → closes with "Rather train in person? Explore the studios →" → `/studios`
- **Final CTA:** **"Your Day 1 doesn't need a gym."** → `/pricing`

## /pricing — Plans (ADS LANDING — must stand alone for cold Meta traffic)

- **SEO title (45):** `54D ON Pricing — Start With 7 Days Free`
- **Meta (140):** `Pick your 54D ON plan: monthly, quarterly, or annual. 7-day free trial, no commitment, 30-day guarantee. Cancel anytime, straight from your account.`
- **Hero:** H1 **"Start today. The first 7 days are on us."** · Sub: "Full access to the method. No commitment — if it's not for you, cancel before day 8 and pay nothing."
- **Plan cards** (highlight quarterly, "Most chosen — one full 54-day program fits inside"): Monthly $54/mo · Quarterly $156 · Annual $588 ("for more than one transformation"). Keep `// PRECIO_PENDIENTE` on all three. Card CTA: "Start free trial" → `startCheckout(priceId)`
- **Every plan includes:** daily training, nutrition protocol, live coach, community, any device.
- **Objection block (in this order):**
  - "What if I don't like it?" → 7-day free trial, full access. Cancel in one click before day 8. Zero charge.
  - "What if I start and it doesn't work?" → **30-day guarantee**: follow the program, and if you don't see results, we refund you. No interrogation.
  - "Will you charge me without warning?" → Email notice before your first charge. Cancel from your account — no calls, no tricks.
  - "Is this just another workout app?" → No. A real coach writes to you every day. The app is just the vehicle.
  - "Do I need equipment or experience?" → You start at your level, with what you have at home.
- **Trust bar:** Secure payment by Stripe · Cancel anytime · 30-day guarantee
- **Short FAQ** (FAQPage schema): billing, cancellation, plan changes, countries.
- **Final CTA + microcopy under button:** "7 days free · cancel anytime · 30-day guarantee"
- **Secondary (discreet):** "Rather train in person? See the studios" → `/studios`. Minimal nav; logo always → `/`.

## /studios — Studios index

- **SEO title (44):** `54D Studios — Miami, Mexico City, Bogotá`
- **Meta (147):** `Live the 54D Method in person: small groups, coaches on the floor, nutrition and physiotherapy. Five studios across three countries. Reserve your spot.`
- **Hero:** kicker `54D Studios` · H1 **"Three countries. Five studios."** · Sub: "The full experience of the method: coaches on the floor, a nutritionist, physiotherapy, and a Generation that trains with you."
- **How Generations work:** "You don't join whenever you want. You join when your Generation starts: a start date, limited spots, and 54 days with the same group. That's why it works."
- **Studio index rows** → `/studios/:slug`, each with "Book →": Coral Gables (US) · Hallandale (US) · Mexico City — Carso (MX) · Mexico City — Santa Fe (MX) · Bogotá (CO)
- **Cross-sell banner:** "No studio in your city? The full method lives online too." → `/on`

## /studios/:slug — Studio detail (x5)

- **SEO title pattern:** `54D {City} — Join the Next Generation` (e.g. "54D Coral Gables — Join the Next Generation", 44)
- **Meta pattern (~140, adjust per studio):** `The 54D Method in {City/area}: small-group training with a coach, nutrition, and physiotherapy. Next Generation starting soon — limited spots.`
- **Schema:** `LocalBusiness`/`ExerciseGym` with address, geo, hours.
- **Hero:** H1 **"54D {City}"** · localized sub (e.g. "In the heart of Coral Gables.")
- **Next Generation block:** start date + spots · "Generations fill up. Yours starts {date}." · CTA "Reserve your spot" (anchor → lead form)
- **Sections:** In-person experience (coaches on the floor, initial assessment, nutritionist, physiotherapy, fixed group) · Schedule · Location (map, address, parking/transit) · Studio coaches (name + credential, E-E-A-T) · Lead form (name, email, phone, Generation of interest → `leads` table)
- **Cross-sell:** "Not close by? Do the method online." → `/on` · Secondary CTA "See the method" → `/method`

## /blog — Blog index

- **SEO title (48):** `54D Blog — Training, Nutrition, and the Method`
- **Meta (135):** `Training, nutrition, and transformation guides written by 54D coaches. No fitness noise — what actually works, and why.`
- **Hero:** H1 **"What works. And why."** · Sub: "Written by the coaches behind thousands of transformations — not by a content generator."
- **Sections:** featured article · category grid (Training / Nutrition / Method) · inline CTA "Done reading? Start doing. — Start free — 7 days" → `/pricing`
- **Initial articles (Article schema, credentialed bylines — E-E-A-T):**
  1. **"How Long Does It Really Take to Transform Your Body? What 54 Days of Data Show"** — by {Head Coach, 54D}, certified strength & conditioning coach {credential}. (AEO query: "how long to see results from working out"; proprietary Generation data = Experience.)
  2. **"Training at Home vs. the Gym: What Works Better for Your Goal"** — by {54D ON Coach}, {BSc Sports Science / credential}. (LLM-citable comparison; bridge to `/on`.)
  3. **"What to Eat Before and After Training: A Practical Guide, No Miracle Supplements"** — by {54D Nutritionist}, {RD / license no.}. (High-volume query; anti-hype voice differentiates; bridge to nutrition protocol.)

## /contact — Contact

- **SEO title (13):** `Contact — 54D`
- **Meta (137):** `Questions about 54D ON, the studios, or your subscription? Write to us — we actually answer. Find us in Miami, Mexico City, and Bogotá.`
- **Hero:** H1 **"Let's talk."** · Sub: "Questions about the method, the studios, or your subscription? We answer for real."
- **Form:** name, email, topic (ON / Studios / Subscription / Press), message · Submit CTA: **"Send message"**
- **Sections:** per-studio contact info (links to each `/studios/:slug`) · Instagram · Smart-redirect block: "Wondering how the method works?" → `/method` · "Pricing and plans?" → `/pricing` · Secondary CTA "See the FAQ" → `/method#faq`

---

## Cross-cutting rules

- Every checkout CTA routes through `/pricing` → `startCheckout(priceId)`; preserve `utm_*`/`fbclid` on internal navigation to `/pricing`.
- AEO: quotable definition = first paragraph of `/method`; `FAQPage` on `/method` and `/pricing`; `LocalBusiness` per studio; `Article` with credentialed author per post; `Organization` + `sameAs` (Instagram) at root.
- Banned vocabulary: "burn fat fast", "shred", "melt", "crush your goals", "beach body", "insane results", "hack". Banned facts: any NYC mention.
- Numbers: "54 days" always numeric. "Day 1", "day 8", "D01–D54" per visual system. Em dashes for hard pauses ("The first 7 days are on us — no commitment.").
