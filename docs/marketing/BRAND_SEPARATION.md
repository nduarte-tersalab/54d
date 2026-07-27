# BRAND SEPARATION: 54D ON vs 54D STUDIOS

Client feedback 28/07. 54D Studios is ~$60,000 USD/year per person. 54D ON is $54/month.
The site currently presents them as equivalents. That is a 90x price gap communicated as a coin flip.
This doc is the correction: the problem, the architecture, the home spec, the border rules, and the VS table rewrite.
Scope guard: do NOT touch ON pricing, checkout, program landings, or admin.

---

## 1. THE PROBLEM: THE SITE SAYS THEY COST THE SAME

Every one of these is a real string in the code today. Each one flattens a $60k service into a $54 app.

| File | Exact copy today | Why it destroys the studios' price |
| --- | --- | --- |
| on.tsx (VS_STUDIOS heading) | "The same method. Two ways in." | The literal thesis of equivalence. If it is the same thing two ways, the rational buyer picks the $54 way and walks into a studio expecting app pricing. |
| on.tsx (VS intro) | "No fine print: ON and Studios share the same program and the same standard. What changes is where you train, and who you train with." | Explicitly tells the reader the only difference is location. Location is not worth 90x. |
| on.tsx (hero) | "Same training. Same protocol. Same standard." | Written to sell ON up. Read the other way, it prices Studios down. |
| home.tsx (split panels) | ON and Studios as visually identical sibling panels, same size, same weight | Layout is copy. Two equal doors say two equal products. |
| home.tsx (Studios panel) | "The full experience: small groups, coaches on the floor, a nutritionist, and physiotherapy." | Reads like a gym amenity list, not a $60k transformation service. "Small groups" is boutique-fitness language, $40/class language. |
| home.tsx / studios rows | "Book →" | You book a spin class. You do not "book" a $60k engagement. Carted language on an uncartable product. |
| site.tsx:151 (global Footer) | 54D On App Store / Google Play badges on EVERY page, studios included | Studio pages literally advertise the $54 product's app. Wrong app besides: studios run on Mindbody, not 54D On. |
| studio-detail.tsx (form success) | "Done. Your spot is held." | A $60k admission decided by a 2-field form. Kills the perceived selectivity that justifies the price. |

Net effect: Meta traffic and studio walk-ins share one mental price anchor, $54. The studios inherit the app's price in the customer's head, and every sales conversation starts $59,946 behind.

---

## 2. BRAND ARCHITECTURE

One method, one brand, two products that are NOT versions of each other.

### 54D ON: the digital program
Keeps everything already built: visible pricing, 7-day trial, Meta Ads to checkout, program landings, the 54D On app.
Voice: direct, energetic, urgent. "Start free. 7 days." stays. Price is a feature here; say it loudly.

### 54D Studios: the flagship experience
Positioning: an in-person, by-application transformation program delivered by a dedicated multidisciplinary team. Not "the in-person version of the app." The app is not mentioned here at all (studios run on Mindbody's member app; that is operational detail, not marketing).

Language system (final EN, use verbatim):
- Category label: "The flagship experience" (never "plan", "class", "membership", "subscription")
- Entry verb: "Apply" / "Request a consultation" (never "book", "buy", "start free")
- Cohort: "Generation" as an exclusive cohort: "Admission is by Generation: one start date, limited places, no rolling entry."
- Team: "A dedicated team on one outcome: coaches, a nutritionist, and a physiotherapist assigned to your Generation."
- Proof: measured results: "You are measured on day 1 and on day 54. The numbers are the contract."
- Scarcity, only real numbers: "20 places" / "24 places" per Generation, real dates from Mindbody. Never fake countdowns.

Value signals: real limited places, a named start date, an admission/consultation step, initial assessment as ritual, graduation as proof. No cart, no checkout, no trial, no discount language, ever.

### Price decision: DECIDED, in conversation only
No number on the site. The page signals tier through language and process (application, dedicated team, limited places), and the price is presented in the consultation.
Justification: at ~$60k the price needs the value narrative a human delivers live; any printed number ("from $X") becomes the negotiation ceiling and an ad-comparison target. This is the E by Equinox / private-coaching norm: the application IS the price signal.
Guardrail so nobody arrives expecting $54: one qualifying line near the CTA, final copy: "54D Studios is our flagship tier, a private-client level program. Your consultation covers fit, your Generation's start date, and the investment."

---

## 3. THE HOME CHOOSER

The home's job changes: present the METHOD, then force a choice between two non-equivalent doors.

### Hero (brand level, product agnostic)
Keep the ramp video. Title stays "54 days. One transformation." Subhead becomes:
"High-intensity training, personalized nutrition, and a coach who demands more of you, every day for 54 days."
CTAs change: remove "Start free. 7 days." from the hero (it pre-sells ON before the choice). Single CTA scrolls to the chooser: "Choose how you do it".

### The chooser (immediately after hero, replaces the current split)
Two doors, deliberately unequal. Studios first on desktop (left), larger visual weight, full-bleed editorial photo (cg-class-mural-wide or coach-correction), dark, quiet, serif-calm typography, no price anywhere. ON second, energetic, yellow accent, price visible.

Door 1, STUDIOS (flagship, dark, editorial):
- Eyebrow: "The flagship experience"
- Title: "54D Studios"
- Body: "The complete method, in person, with a dedicated team of coaches, a nutritionist, and a physiotherapist. Admission by Generation: one start date, limited places. Miami, Mexico City, Bogotá."
- CTA (ghost/outline, calm): "Request a consultation"
- Footnote: "By application · Limited places per Generation"

Door 2, ON (accessible, energetic, price visible):
- Eyebrow: "Online, wherever you are"
- Title: "54D ON"
- Body: "The 54-day digital program in the 54D On app: daily training, your nutrition protocol, and a real coach in your corner. From $54 a month."
- CTA (primary yellow): "Start free. 7 days."
- Footnote: "Cancel anytime"

### What stays / what goes on home
- STAYS: hero video, method cards (brand level, shared truthfully: the method IS shared, the delivery is not), community photo band, footer.
- MOVES: app section (54D On) moves below the chooser and gets an explicit ON label: eyebrow "54D ON · The app". It sells ON only.
- CHANGES: studios index rows stay but "Book →" becomes "Explore →"; section intro gains one flagship line: "Our flagship program runs in five studios across three countries."
- GOES: the current equal split panels; "Start free. 7 days." as the hero CTA; final CTA becomes two-door again (small): "Start ON free" + "Request a Studios consultation".

---

## 4. BORDER RULES: WHAT NEVER CROSSES

1. ON's price ($54, "/mo", "from $49") never appears on /studios, /studios/:slug, or inside the Studios door/panel on home. No exceptions, including comparison tables.
2. 54D On app badges, App Store / Google Play links, and app ratings never appear on studio pages. Fix the global Footer (site.tsx:151): render badges only outside studios routes, or move them into an ON-only footer variant. Same for app-banner.tsx if it mounts globally.
3. "Same method. Two ways in." and any "same X, same Y" construction is banned as a cross-product bridge. The method is shared; the product sentences never equate. Approved bridge line: "One method. Two very different ways to live it."
4. The 7-day free trial, "cancel anytime", "money-back", discounts, and strike-through pricing never appear in any Studios context. Trials are subscription language; flagships do not trial.
5. "Book", "buy", "checkout", "subscription", "plan" are ON-only verbs. Studios use "apply", "request a consultation", "reserve your place in the Generation" (post-consultation only).
6. Studio pages never link to /pricing. Cross-sell direction is one-way and explicit: Studios pages may offer ON as the honest alternative ("No studio in your city?" block stays, it is good), but ON pages present Studios as an elevation, never as a same-price alternative.

---

## 5. THE VS TABLE (on.tsx): "WHICH 54D IS FOR YOU"

Replace VS_STUDIOS wholesale. New heading and intro, final EN:

Heading: "Which 54D is for you?"
Intro: "One method, two very different programs. 54D ON is your transformation, wherever you are, on your schedule. 54D Studios is the flagship: in person, by application, with a dedicated team. Neither is a lighter version of the other. They are built for different lives."

New rows (label / 54D ON / 54D Studios):

| | 54D ON | 54D Studios |
| --- | --- | --- |
| What it is | The 54-day digital program, coached through the 54D On app | The flagship experience: the method in person, end to end |
| Your team | A real coach over daily chat | A dedicated team on the floor: coaches, nutritionist, physiotherapist |
| How you join | Start today with 7 days free | By application: a consultation, then your Generation's start date |
| Your group | A global online community | Your Generation: limited places, one start date, 54 days together |
| Where | Wherever you are, with what you have | Five studios: Miami, Mexico City, Bogotá |
| The commitment | A subscription you control, from $54 a month | A private-client level program, discussed in your consultation |

CTAs under the table, unequal on purpose:
- ON (primary yellow): "Start free. 7 days." → /pricing
- Studios (ghost, editorial): "Request a consultation" → /studios (then per-studio lead form; rename that form's CTA from "Reserve your spot" to "Request a consultation" and success copy from "Your spot is held" to "Application received. We will reach out on WhatsApp to schedule your consultation.")

Note: keep the "commitment" row exactly as written. It is the only place ON's price appears near Studios, it appears in ON's own column as ON's feature, and the Studios cell answers with tier language, not a number. That contrast is the whole strategy in one row.

---

## Out of scope, flagged for later phases
- Local SEO for CDMX and Bogotá in English is structurally weak; ES i18n is a separate phase, do not bolt onto this one. Meanwhile: schema.org ExerciseGym exists on studio-detail only; extend with geo, openingHours, and sameAs when real data lands.
- Real Generation dates and place counts must come from Mindbody before scarcity claims ship; placeholders in studio-detail.tsx (GENERATION) are marked DATO_PENDIENTE.
