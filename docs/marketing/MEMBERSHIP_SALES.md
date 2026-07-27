# MEMBERSHIP_SALES — Spec del upgrade de venta (pricing.tsx + on.tsx)

Diagnóstico del cliente (27/07): al bloque de membresías le faltan imágenes, punteos y separación.
Objetivo: que /pricing venda como una landing DR de suscripción (Whoop/Peloton tier), no como una tabla.
Precios y priceIds NO se tocan. Sin em-dashes, sin pills, copy en inglés.

## 1. /pricing — upgrade del bloque de planes

### 1.1 Foto real sin robarle foco al precio (patrón: banda lateral)
Split 5/7 dentro de `#plans`: columna izquierda foto vertical, derecha los 3 planes apilados.
La foto es contexto emocional; el precio sigue siendo el elemento de mayor contraste de la sección.

```tsx
<div className="plans-split">   {/* nuevo: grid 5fr/7fr, gap var(--space-block); ≤1080px apila, foto max-height 46vh arriba */}
  <figure className="photo-card plans-photo"> {/* sticky top 6rem en desktop */}
    <img src={asset("images/hd/cg-mural-seated.jpg")} alt="..." />
    <figcaption className="photo-caption">Gen 41 · Coral Gables</figcaption>
  </figure>
  <div className="plans-stack">{/* los 3 pricing-card apilados, featured al medio */}</div>
</div>
```
- Foto: `hd/cg-mural-seated.jpg` (vertical, con mural 54D). Alternativa: `studios/coral-gables/ramp-climb-vertical.jpg`.
- Overlay: gradiente negro 60% desde abajo (reusar el `::after` de photo-band) para que la foto no compita en luminancia con `$54`.
- PROHIBIDO: foto de fondo detrás de las cards (mata legibilidad del tachado) y foto dentro de la featured (rompe el escaneo de los 3 precios).
- Al apilar los planes en columna, cada `pricing-card` pasa a layout horizontal interno en desktop (plan+precio a la izquierda, features al centro, CTA a la derecha): comparación vertical de precios en un solo eje visual, patrón Peloton.

### 1.2 Punteos con checkmarks duros
Reemplazar los bullets de `pricing-features` y usarlos también en /on:

```css
.check-list { display: grid; gap: 0.55rem; margin-top: 1.1rem; }
.check-list li { display: flex; gap: 0.65rem; font-size: 0.95rem; line-height: 1.45; color: var(--c-mist); }
.check-list li::before { content: '✓'; color: var(--c-yellow); font-weight: 700; flex: none; }
.check-list li strong { color: var(--c-white); font-weight: 600; }
```
- ✓ amarillo sólido, sin círculo, sin fondo (nada de pills). Primera o segunda palabra en `<strong>` blanco: el ojo escanea la columna de verbos.
- En las cards de plan quedan solo los 3 diferenciales del plan; la lista de valor completa (§4) vive una sola vez, ver §1.3.

### 1.3 Separación entre "elegir plan" / "qué incluye" / "riesgo cero"
Hoy las tres secciones se funden: mismo fondo, mismo `method-card`. Diferenciar por tratamiento:
1. **Plans** (`#plans`, bloom): la única sección con foto + cards de precio. Cierra con `stat-row` (queda como está).
2. **Photo-band separador** entre Plans e Included: `photo-band band-tight` con `hd/cg-highfive-euphoria.jpg`, un claim corto en `photo-band-content` ("54 days from now, you won't recognize yourself."). Es el descanso visual que pide el cliente.
3. **Everything included**: pasa de `method-grid` de 4 cards a split 2 columnas: izquierda los 6 punteos de §4 en `check-list` (font-size 1.05rem), derecha `photo-card` con `studios/coral-gables/coach-with-headset-01.jpg`. El method-grid actual de 4 cards se elimina (duplica /method).
4. **Zero risk**: fondo `var(--c-ink)` en la section (única sección con fondo distinto en la página) + borde superior e inferior `1px solid var(--hairline)`. Las 3 cards `method-card` quedan, pero el `method-num` (la pregunta) va en amarillo.
Regla: ninguna sección consecutiva repite el mismo esqueleto de grid.

### 1.4 Orden AIDA de la página completa
A — Hero (promesa + 7 días gratis) · CTA #plans
I — **Plans con foto** (decisión arriba del fold 2: el tráfico de ads viene caliente, el precio no se esconde) + stat-row
I — Photo-band separador (emoción)
D — Everything included (6 punteos + foto coach) → Zero risk (ink) → Results/testimonios
A — FAQ (objeciones tardías) → CTA final → StickyCta
Cambio vs hoy: solo se inserta el photo-band y se rediseñan Included y Zero risk; el orden macro ya es correcto, el problema es textura, no secuencia.

## 2. /on sección #membership — mini-pitch, no duplicado
Estructura: split 5/7 (mismo `plans-split`). Izquierda: pitch. Derecha: los 3 tiers en versión compacta.
- Izquierda: `day-marker` "The membership" + H2 actual + los 6 punteos de §4 en `check-list` (usar 5: omitir el de guarantee, que va bajo el CTA) + microcopy de riesgo.
- Foto: NO va card de foto aparte aquí (la página ya tiene photo-bands); en su lugar la columna izquierda lleva de fondo `studios/hallandale/class-under-letters.jpg` con veil negro 78%, o se deja sin foto si ensucia. Prioridad: punteos > foto en esta sección.
- Derecha: 3 `pricing-card` compactas (sin features list, solo plan + tachado + precio + billed + CTA). Ya es casi lo actual: solo se les añade el microcopy de §3 bajo cada botón.
- Cierre de sección: línea actual "Prefer to pay once?..." queda, ahora con link ancla a `#programs`.
- Lo que NO va: stat-row, testimonios, FAQ de pricing. Un solo CTA secundario "Compare plans →" a /pricing.

## 3. Reglas de presentación de precio (fitness DR)
1. **Ancla tachada siempre**: `<s>$99</s> $54` con `/mo` chico. Ya está en ambos archivos: mantener. El tachado nunca supera 0.5em del precio.
2. **Per-month framing en los 3 tiers**: el número grande es SIEMPRE el mensual ($54/$52/$49); el total ($156/$588) solo en `pricing-period`. Nunca liderar con el total anual.
3. **Badge de valor, no de precio**: featured lleva "Most chosen" (pricing) / "Best value" (on) como `day-marker` flotante actual. Un solo badge por grid. Nunca "SALE" ni "%OFF".
4. **Microcopy de riesgo PEGADO al botón**: dentro de cada `pricing-card`, inmediatamente bajo el CTA:
   ```tsx
   <span className="btn-riskline">7 days free · cancel anytime</span>
   /* css: font-size 0.72rem; color var(--c-faint); text-align center; margin-top 0.55rem; letter-spacing 0.02em */
   ```
   La línea centralizada de la sección ("...30-day guarantee · secure payment by Stripe") se conserva pero pierde el "7 days free · cancel anytime" para no triplicar.
5. **CTA verbo de inicio, no de pago**: "Start free trial" (nunca "Buy", "Subscribe" ni "Checkout" en membresía; "Buy this program" queda solo para one-time en #programs).
6. **Un decisor por card**: plan, precio, 3 diferenciales, CTA, riskline. Nada más dentro de la card.

## 4. Punteos EXACTOS de la membresía (copy final, verbo primero)
```
✓ Train every program: all 13, including 54D ON, with 650+ recorded sessions
✓ Get a real coach in your corner: unlimited chat, corrections, and follow-up
✓ Eat with a plan: 12+ nutrition protocols and 120+ recipes built by the team
✓ Start free: 7 full days with everything unlocked before you pay a cent
✓ Cancel in one click: from your account, no calls, no retention tricks
✓ Keep your results covered: 30-day money-back guarantee if you do the work
```
El `<strong>` de cada línea: "Train every program", "Get a real coach", "Eat with a plan", "Start free", "Cancel in one click", "Keep your results covered".

## Notas de implementación
- priceIds `PENDING_*` intactos; `startCheckout` intacto; no agregar tracking (captureAttribution ya cubre).
- Nuevas clases: `.plans-split`, `.plans-stack`, `.plans-photo`, `.check-list`, `.btn-riskline`. Todo lo demás reusa clases existentes.
- Mobile: plans-split apila (foto primero, max-height 46vh); check-list no cambia; StickyCta queda.
- Alt text descriptivo real en toda foto nueva (accesibilidad + Meta ads landing score).
