# PROGRAM LANDINGS — /programs/:slug (Meta cold traffic)

Ruta: `/programs/:slug` → `app/routes/program-landing.tsx`. Checkout: `startCheckout(priceId)` de `../lib/attribution`, priceIds EXACTOS de on.tsx. Fotos via `asset("images/...")`. Sistema Glow: #070707 / #FFD200, radius 2/8, grilla estricta, ritmo 208/156. Sitio EN. Sin tracking extra: utm_content persiste solo.

## 1. EL TEMPLATE (mismo esqueleto, 13 landings)

1. **HERO** (100vh mobile-first): foto real full-bleed + gradiente a negro. Program name (kicker amarillo), hook en 1 línea (display), subhead 1 línea, precio grande con ancla tachada si aplica, CTA único amarillo → `startCheckout(priceId)`. Microcopy bajo el botón: "One payment · Coach included · 30-day money-back guarantee". Nada más: cero nav links que compitan.
2. **WHAT YOU'LL DO** (franja negra, punteos ✓ amarillos): 4-5 bullets concretos de la data por programa. Foto secundaria vertical al costado en desktop.
3. **IS THIS FOR YOU** (2 columnas): "This is for you if..." / "This is NOT for you if...". El filtro honesto sube conversión y baja refunds. 1 línea cada lado.
4. **THE STRUCTURE** (3-4 stat cards): Duration · Sessions/week · Equipment · Level. Números grandes, labels chicos.
5. **PROOF**: garantía 30 días explicada en 1 frase, rating 4.9 App Store con `<AppStoreBadges />`, y "A real coach, not an algorithm: a certified 54D coach reviews your form and answers in the app". Foto de coach (coach-correction / coach-hands).
6. **FAQ** (3-4 acordeones) → **FINAL CTA** (repite precio + botón + microcopy) → **STICKY MOBILE BAR** (precio + CTA, aparece al scrollear pasado el hero).

**Membresía como upsell suave**: una sola tarjeta angosta ENTRE Proof y FAQ: "Or get everything. All 10 programs + unlimited coach + 650 sessions for $54/mo. 7-day free trial." Link de texto → `/pricing` (o `startCheckout("PENDING_membership_monthly")`). Visual secundaria (borde, no fill amarillo). Nunca en hero, nunca en sticky: el CTA principal es uno solo.

## 2. DIFERENCIAS POR TIER

- **Starters $19-$39** (Reset 7, First Move, Emergency Kit, Max Burn, Booty on Fire): compra impulso. Hero directo, "Start today" en el CTA, urgencia suave ("14 days from now you'll wish you started today"), FAQ de 3, página corta (skip stat cards extensas). Fricción cero: el precio ES el argumento.
- **Medios $95-$185** (Full Body, Lower Body, Upper Body): consideración. Structure completa, semana tipo (week 1 vs week 9), proof con coach destacado, FAQ de 4. CTA "Get the program".
- **Flagship $385/$400** (54D ON, Step 2): venta completa. Hero de transformación, "Starts Mondays" como escasez real (countdown al próximo lunes), sección extra "Your 9 weeks" (fases), coach ilimitado + insignia destacados, membresía anual como comparación de valor ("$588/yr = this program + everything else"). CTA "Reserve my spot · Starts Monday".
- **Runners 5K/10K/21K** (solo membresía): la landing vende la MEMBRESÍA con el plan como gancho. Hero con el programa, CTA → `startCheckout("PENDING_membership_monthly")`, precio "$54/mo · 7-day free trial", punteo extra "Plus all 10 programs included". Sin upsell card (ya es la membresía).

## 3. LA DATA — copy EN final

### 54D ON — $385 (reg. one payment) · 9 wk · priceId PENDING_54d-on_onetime
- **Hook:** 54 days. A different body. A different you.
- **Subhead:** The complete 54D transformation method, with a real coach on your side for 9 weeks.
- **Do:** ✓ Train 6 days a week with structured 45-min sessions ✓ Follow the method that built 54D: strength, cardio, discipline ✓ Get your form checked by a certified coach, unlimited ✓ Track every phase across 3 cycles of 18 days ✓ Earn the 54D badge when you finish
- **For:** you're ready to commit 9 weeks and want a coach holding you accountable. **Not for:** you want a casual workout you can skip without anyone noticing.
- **Foto:** hd/cg-ramp-runners-wide (hero) + studios/coral-gables/graduation-celebration-01 (proof)
- **FAQ:** When does it start? Every Monday. · Do I need a gym? Dumbbells and space to move. · What if I miss a day? Your coach adjusts the plan, you don't start over. · Refunds? Full refund within 30 days.

### Step 2 — $400 · 9 wk advanced · PENDING_step-2_onetime
- **Hook:** You finished 54D. Now go where most people never do.
- **Subhead:** The advanced 9-week program for graduates who want more load, more speed, more.
- **Do:** ✓ Heavier lifts and advanced progressions ✓ 6 sessions/week built on the 54D base ✓ Unlimited coach feedback on every rep ✓ Performance benchmarks each 18-day cycle
- **For:** you completed 54D ON (or train at that level) and want the next ceiling. **Not for:** your first structured program, start with 54D ON.
- **Foto:** hd/cg-overhead-press (hero) + studios/coral-gables/barbell-press-class-01
- **FAQ:** Do I need to have finished 54D ON? It's built for graduates, advanced athletes can join. · Equipment? Dumbbells, a bar if you have one. · Start date? Mondays. · Refunds? 30 days.

### Lower Body — $185 · 9 wk · PENDING_lower-body_onetime
- **Hook:** Legs that carry you further. Built in 9 weeks.
- **Subhead:** A focused lower-body program with a coach checking your squat, not a video guessing.
- **Do:** ✓ Squat, hinge and lunge patterns, progressively loaded ✓ 4-5 sessions/week, 40 min each ✓ Explosive work: jumps and sprints ✓ Coach reviews your form in the app
- **For:** you want visible lower-body strength and shape with structure. **Not for:** you're after a full-body plan, see Full Body or 54D ON.
- **Foto:** studios/coral-gables/jump-training-54d-wall-01 (hero) + ramp-climb-vertical
- **FAQ:** Equipment? Dumbbells, optional band. · Level? Scalable, coach adapts loads. · Knees issues? Coach modifies, ask first. · Refunds? 30 days.

### Upper Body — $185 · 9 wk · PENDING_upper-body_onetime
- **Hook:** Shoulders, back, arms. The 9-week upper build.
- **Subhead:** Press, pull and carry your way to an upper body that shows up in every shirt.
- **Do:** ✓ Push/pull splits, progressive overload ✓ 4-5 sessions/week ✓ Core work wired into every session ✓ Unlimited coach form checks
- **For:** you want upper-body strength and definition with real programming. **Not for:** cardio-first goals, see Max Burn.
- **Foto:** studios/hallandale/bench-press-54d (hero) + dumbbell-press
- **FAQ:** Equipment? Dumbbells, bench optional. · Bulky? You'll build lean strength, nutrition drives size. · Level? Scalable. · Refunds? 30 days.

### Full Body — $95 · 4 wk · PENDING_full-body_onetime
- **Hook:** Four weeks. Every muscle. One plan.
- **Subhead:** The complete-body reset for people who want results without a 2-hour gym life.
- **Do:** ✓ 45-min full-body sessions, 5x/week ✓ Strength + conditioning in every workout ✓ Coach feedback whenever you need it ✓ A finish-line test in week 4
- **For:** you want a serious month of training with everything covered. **Not for:** you want a 9-week transformation, that's 54D ON.
- **Foto:** hd/cg-gym-wide (hero) + hd/cg-effort-yellow-d
- **FAQ:** Home or gym? Either, dumbbells enough. · After the 4 weeks? Most continue to 54D ON. · Level? All. · Refunds? 30 days.

### Emergency Kit — $39 · 14 days · PENDING_emergency-kit_onetime
- **Hook:** Big date? Beach trip? You have 14 days. Use them.
- **Subhead:** The 2-week emergency plan to look and feel sharper, fast.
- **Do:** ✓ Daily 30-min high-intensity sessions ✓ Full-body burn, zero filler ✓ Simple daily checklist ✓ Coach in your corner the whole 14 days
- **For:** you have a deadline and want maximum result per day. **Not for:** long-term transformation, that's a 9-week program.
- **Foto:** studios/coral-gables/boxer-closeup (hero)
- **FAQ:** Is 14 days enough? Enough to change how you look and feel, not your life, that takes 54 days. · Equipment? Minimal. · Refunds? 30 days.

### Max Burn — $39 · 14 days · PENDING_max-burn_onetime
- **Hook:** 14 days of the hardest cardio you'll love finishing.
- **Subhead:** Pure conditioning: short, brutal, done before your excuses wake up.
- **Do:** ✓ Daily HIIT sessions under 35 min ✓ Heart-rate zones that actually burn fat ✓ Zero equipment needed ✓ Coach keeps you honest daily
- **For:** you want to sweat hard and jumpstart your engine. **Not for:** strength-first goals, see Upper/Lower Body.
- **Foto:** studios/coral-gables/group-cardio-session-01 (hero) + spin-bikes-boxing-bags-01
- **FAQ:** Fitness level? Scalable intensity. · Equipment? None. · Refunds? 30 days.

### First Move — $39 · 14 days · PENDING_first-move_onetime
- **Hook:** The hardest part is starting. This is starting, made easy.
- **Subhead:** 14 days built for absolute beginners, with a real coach so you never feel lost.
- **Do:** ✓ Gentle daily sessions from 20 min ✓ Learn the fundamental movements right ✓ A coach answers every question, no shame ✓ Build the habit before the intensity
- **For:** you haven't trained in years (or ever) and want a kind start. **Not for:** experienced athletes, you'll be bored.
- **Foto:** studios/coral-gables/coach-correction (hero) + hd/hl-laugh
- **FAQ:** I'm really out of shape, can I? This exists exactly for you. · Equipment? None. · After? Full Body is the natural next step. · Refunds? 30 days.

### Booty on Fire — $39 · 14 days · PENDING_booty-on-fire_onetime
- **Hook:** 14 days. One goal. You know which one.
- **Subhead:** Glute-focused training that burns today and shows in two weeks.
- **Do:** ✓ Daily glute + lower-body targeted sessions ✓ Progressive activation to hip thrusts ✓ Band and bodyweight, home-friendly ✓ Coach checks your form so it works
- **For:** you want a focused glute kickstart now. **Not for:** full lower-body strength, that's Lower Body 9 wk.
- **Foto:** studios/coral-gables/group-squat-class-01 (hero)
- **FAQ:** Equipment? A band helps, not required. · Results in 14 days? Activation and shape changes, yes; keep going for more. · Refunds? 30 days.

### Reset 7 — $19 · 7 days · PENDING_reset-7_onetime
- **Hook:** One week to remember what your body can do.
- **Subhead:** 7 days of movement, mobility and momentum for $19. Start today.
- **Do:** ✓ One short session daily, 20-30 min ✓ Mobility + light strength + walks ✓ Sleep and hydration micro-goals ✓ Coach support all week
- **For:** you're stuck and need a low-stakes way back in. **Not for:** you're already training consistently.
- **Foto:** studios/coral-gables/training-floor-recovery-01 (hero)
- **FAQ:** Only $19, what's the catch? None, it's the front door to 54D. · Equipment? None. · Refunds? 30 days.

### Runners 5K — membership only · PENDING_membership_monthly
- **Hook:** Your first 5K, coached from couch to finish line.
- **Subhead:** Included with 54D ON membership: the 5K plan, a real coach, and all 10 programs. $54/mo, 7-day free trial.
- **Do:** ✓ 3 runs/week with walk-run progressions ✓ Strength sessions that protect your knees ✓ Coach adjusts pace to your reality ✓ Plus every 54D program included
- **For:** you've never raced and want to finish a 5K strong. **Not for:** sub-20 5K runners, see 10K/21K.
- **Foto:** studios/coral-gables/runner-effort (hero)
- **FAQ:** Why membership? Run plans live alongside strength content you'll need. · Cancel? Anytime. · Trial? 7 days free.

### Runners 10K — membership only · PENDING_membership_monthly
- **Hook:** Double the distance. Own the 10K.
- **Subhead:** The 10K plan plus unlimited coaching and every 54D program. $54/mo, free for 7 days.
- **Do:** ✓ 4 runs/week: tempo, intervals, long run ✓ Runner-specific strength twice a week ✓ Race-day pacing strategy from your coach ✓ All 10 programs included
- **For:** you run 5Ks and want the next distance done right. **Not for:** first-time runners, start at 5K.
- **Foto:** hd/cg-runner-vertical (hero) + studios/coral-gables/sprint-vertical
- **FAQ:** How long is the plan? Progressive blocks to race day. · Cancel? Anytime. · Trial? 7 days free.

### Runners 21K — membership only · PENDING_membership_monthly
- **Hook:** 21K is not a longer run. It's a different you.
- **Subhead:** Half-marathon training with a coach who's watching your load, not just your pace. $54/mo, 7-day trial.
- **Do:** ✓ 4-5 runs/week with structured long-run builds ✓ Strength + mobility to survive the mileage ✓ Fueling and taper guidance ✓ Unlimited coach + all programs included
- **For:** you've raced 10K and want the half without breaking. **Not for:** new runners, the mileage will eat you.
- **Foto:** hd/cg-ramp-runners-wide (hero) + hd/cg-stairs-group
- **FAQ:** Injury history? Coach adapts volume, tell them upfront. · Cancel? Anytime. · Trial? 7 days free.

## Foto ledger (max 2 usos)
cg-ramp-runners-wide: 54D ON, Runners 21K · resto: 1 uso c/u. Libres para secundarias: cg-highfive-euphoria, cg-mural-seated, hl-locker-space, class-mural-wide, agility-ladder-drill-01, coach-with-headset-01, class-under-letters, coach-hands, coach-headset, stairs-vertical.
