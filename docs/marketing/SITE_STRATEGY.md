# 54D — Estrategia de sitio multi-página

Objetivo dual: (a) conversión a trial de 54D ON vía Meta Ads (`startCheckout(priceId)` de `app/lib/attribution.ts`), (b) SEO/AEO en Google, ChatGPT y Gemini para México, Colombia y US-hispano.
Idioma: **español neutro LATAM (tú)**. Prohibido el voseo ("conocé/tenés" → "conoce/tienes"). Voz: directa, exigente, premium, sin humo fitness. **NYC no existe.** Precios PLACEHOLDER — marcar `// PRECIO_PENDIENTE` en código.

Arquitectura de funnel: Ads → `/precios` (conversión) · Orgánico → `/blog` y `/metodo` (awareness) → `/on` o `/studios/:slug` (consideración) → `/precios` o lead Mindbody.

---

## / — Home (hub)

1. **Funnel:** awareness + distribución. Intent: navegacional ("54d", "54D método") y visitantes de marca desde social. Su trabajo es enrutar: ON vs Studios en <10 segundos.
2. **SEO:** Title: `54D — El método de transformación de 54 días` (45). Description: `Entrenamiento de alta intensidad, nutrición y coaching diario durante 54 días. Online o en nuestros studios de Miami, CDMX y Bogotá.` (139)
3. **Secciones:**
   - Hero (video): kicker "El método 54D" · H1 "54 días. **Una transformación.**" · Sub: "Entrenamiento de alta intensidad, nutrición personalizada y un coach que te sigue todos los días. Online o en nuestros studios." · CTA1 "Empieza gratis — 7 días" → `/precios` · CTA2 "Conoce los studios" → `/studios`.
   - Ticker de sedes (Coral Gables · Hallandale · Ciudad de México · Bogotá · Online en todo el mundo).
   - El método (4 cards D01/D07/D21/D54): H2 "No es un gym. Es un programa con principio y **final.**" — corregir copy actual: "lo que comes es parte del programa", "no terminas un challenge: terminas otra persona. Y tienes las herramientas para sostenerlo". Link "Conoce el método completo →" → `/metodo`.
   - Split ON/Studios: panel ON "Tu transformación, donde estés" → `/on`; panel Studios "La experiencia completa, en persona" → `/studios`.
   - Prueba social: 3 testimonios con nombre, edad, ciudad, generación ("Gen 42, CDMX"). H2 "Miles ya lo hicieron. **Tú eres el siguiente.**"
   - CTA final: "El día 1 **es hoy.**" → `/precios`.
4. **CTAs:** primario "Empieza gratis — 7 días" → `/precios`; secundario "Conoce los studios" → `/studios`.
5. **Links internos:** `/metodo`, `/on`, `/studios`, `/studios/:slug` (footer), `/precios`, `/blog`, `/contacto`.

## /metodo — El método 54D

1. **Funnel:** awareness/consideración. Intent: informacional ("qué es el método 54D", "cómo funciona 54D", "54 días transformación"). Página AEO central: debe responder "¿qué es 54D?" de forma citable por LLMs.
2. **SEO:** Title: `El método 54D: cómo funciona la transformación` (46). Description: `Qué es el método 54D: 54 días de entrenamiento estructurado, protocolo de nutrición y coaching diario. Así funciona, día por día.` (127)
3. **Secciones:**
   - Hero: kicker "El método" · H1 "54 días con método. **No con suerte.**" · Sub: "Un programa con fecha de inicio, fecha de final y un coach que no te deja soltar."
   - Definición AEO (primer párrafo, respuesta directa): "54D es un programa de transformación física de 54 días que combina entrenamiento de alta intensidad, un protocolo de nutrición personalizado y seguimiento diario de un coach. No es una app ni una membresía de gym: es un método con estructura, exigencia y final."
   - Timeline D01→D54 (usa `.day-marker`): Semana 1 "Diagnóstico y base" / D07 "Tu protocolo de nutrición ya está corriendo" / D21 "El punto donde la mayoría abandona. Aquí es donde tu coach aprieta" / D54 "El resultado — y el plan para sostenerlo".
   - Los 3 pilares (`.method-card`): Entrenamiento ("Sesiones diseñadas por coaches, no por un algoritmo. Cada día tiene un objetivo") · Nutrición ("Sin dietas genéricas: lo que comes es parte del programa") · Coaching ("Un coach te escribe, te corrige, te exige. Todos los días").
   - FAQ con schema `FAQPage` (JSON-LD): "¿Necesito experiencia previa?" / "¿Qué pasa si fallo un día?" / "¿ON o Studios: cuál me conviene?" / "¿Qué resultados puedo esperar en 54 días?"
   - Split de cierre: "Hazlo online" → `/on` · "Hazlo en un studio" → `/studios`.
4. **CTAs:** primario "Empieza gratis — 7 días" → `/precios`; secundario "Ver studios" → `/studios`.
5. **Links internos:** `/on`, `/studios`, `/precios`, 2-3 artículos de `/blog` desde la FAQ.

## /on — 54D ON (producto online)

1. **Funnel:** consideración → conversión. Intent: comercial ("programa fitness online con coach", "entrenar en casa con seguimiento"). Vende el producto; `/precios` cierra.
2. **SEO:** Title: `54D ON: el método de 54 días, online y con coach` (47). Description: `El programa completo de 54D desde tu casa: entrenamientos diarios, nutrición personalizada y un coach real que te sigue. Prueba 7 días gratis.` (139)
3. **Secciones:**
   - Hero: kicker "54D ON — Online" · H1 "El método completo. **Donde estés.**" · Sub: "Los mismos entrenamientos, el mismo protocolo, el mismo nivel de exigencia. Sin gym, sin excusas de agenda." · CTA "Prueba 7 días gratis" → `/precios`.
   - Qué incluye (grid): Entrenamiento diario en video ("54 sesiones progresivas. Con lo que tengas en casa") · Protocolo de nutrición ("Ajustado a tu cuerpo y tu meta desde el día 1") · Coach en vivo ("Seguimiento real por chat. Te corrige, te empuja, te responde") · Comunidad ("Entrenas solo, pero no estás solo").
   - Cómo funciona (3 pasos): "1. Activa tu prueba de 7 días — sin costo." / "2. Recibe tu protocolo y empieza el día 1." / "3. Al día 8 decides. Si sigues, tu transformación ya arrancó."
   - App/experiencia: capturas del producto, H2 "Todo tu programa **en tu bolsillo.**"
   - Comparativa honesta ON vs Studios (tabla): cierra con "¿Prefieres entrenar presencial? Conoce los studios →" → `/studios`.
   - Testimonios ON (personas que lo hicieron desde casa) + CTA final "Tu día 1 no necesita un gym." → `/precios`.
4. **CTAs:** primario "Prueba 7 días gratis" → `/precios` (no directo a checkout: `/precios` presenta planes y dispara `startCheckout`); secundario "Conoce los studios" → `/studios`.
5. **Links internos:** `/precios` (múltiple), `/metodo`, `/studios`, `/blog`.

## /precios — Planes (LANDING DE ADS)

1. **Funnel:** conversión pura. Intent: transaccional. Destino de campañas Meta — debe sostenerse sola para tráfico frío de ads (el usuario puede no haber visto nada más del sitio). `noindex` NO: indexable, pero optimizada para paid.
2. **SEO:** Title: `Precios 54D ON — Empieza con 7 días gratis` (43). Description: `Elige tu plan de 54D ON: mensual, trimestral o anual. Prueba gratis 7 días, sin compromiso, y garantía de 30 días. Cancela cuando quieras.` (136)
3. **Secciones (lógica de landing):**
   - Hero corto: H1 "Empieza hoy. **Los primeros 7 días van por nuestra cuenta.**" · Sub: "Acceso completo al método. Sin compromiso: si no es para ti, cancelas antes del día 8 y no pagas nada."
   - Cards de planes (3, destacar trimestral como "El más elegido" — coincide con los 54 días del programa): Mensual $54/mes · Trimestral $156 ("un programa completo de 54 días entra aquí") · Anual $588 ("para quien va por más de una transformación"). `// PRECIO_PENDIENTE` en los tres. CTA de cada card: "Empezar prueba gratis" → `startCheckout(priceId)`.
   - Qué incluye todo plan (lista única, sin letra chica): entrenamientos diarios, protocolo de nutrición, coach en vivo, comunidad, acceso desde cualquier dispositivo.
   - **Bloque anti-objeción** (matar objeciones en orden de peso para tráfico frío de Meta):
     - "¿Y si no me gusta?" → Trial 7 días sin compromiso: acceso completo, cancelas en un clic antes del día 8, cargo cero.
     - "¿Y si empiezo y no funciona?" → **Garantía de 30 días**: si sigues el programa y no ves resultados, te devolvemos tu dinero. Sin interrogatorio.
     - "¿Me van a cobrar sin avisar?" → Aviso por email antes del primer cobro. Cancelas desde tu cuenta, sin llamadas ni trucos.
     - "¿Es otra app de ejercicios?" → No. Es un coach real que te escribe todos los días. La app es solo el vehículo.
     - "¿Necesito equipo/experiencia?" → Empiezas en tu nivel, con lo que tengas en casa.
   - Trust bar: Stripe (pago seguro) · cancela cuando quieras · garantía 30 días.
   - FAQ corta con schema `FAQPage` (cobros, cancelación, cambio de plan, países).
   - CTA final repetido + micro-copy bajo el botón: "7 días gratis · cancela cuando quieras · garantía de 30 días".
4. **CTAs:** primario "Empezar prueba gratis" (x3 cards + final) → `startCheckout(priceId)`; secundario discreto "¿Prefieres presencial? Ver studios" → `/studios`. Nav mínima en esta página: menos fugas, pero nunca ocultar el logo → `/`.
5. **Links internos:** salientes mínimos (`/metodo` en FAQ "¿cómo funciona?", `/studios` secundario). Entrantes: TODAS las páginas apuntan aquí con el CTA primario.

## /studios — Studios (index)

1. **Funnel:** consideración (producto presencial). Intent: comercial-local ("54D cerca de mí", "gym transformación Miami/CDMX/Bogotá").
2. **SEO:** Title: `54D Studios — Miami, Ciudad de México y Bogotá` (46). Description: `Vive el método 54D en persona: grupos reducidos, coaches en el piso, nutrición y fisioterapia. Cinco studios en tres países. Reserva tu lugar.` (139)
3. **Secciones:**
   - Hero: kicker "54D Studios" · H1 "Tres países. **Cinco studios.**" · Sub: "La experiencia completa del método: coaches en el piso, nutricionista, fisioterapia y una generación que entrena contigo."
   - Cómo funcionan las generaciones: "No entras cuando quieras. Entras cuando empieza tu generación: fecha de inicio, cupo limitado y 54 días con el mismo grupo. Por eso funciona."
   - Index de sedes (`.studio-row`): Coral Gables (US) · Hallandale (US) · CDMX Carso (MX) · CDMX Santa Fe (MX) · Bogotá (CO) → cada fila a `/studios/:slug` con "Agenda →".
   - Banner cruce: "¿No hay un studio en tu ciudad? El método completo también vive online." → `/on`.
4. **CTAs:** primario por sede "Ver studio / Agenda" → `/studios/:slug`; secundario "Conoce 54D ON" → `/on`.
5. **Links internos:** las 5 `/studios/:slug`, `/on`, `/metodo`.

## /studios/:slug — Detalle de sede (x5)

1. **Funnel:** conversión presencial (lead → Mindbody, fase 1: formulario a tabla `leads`). Intent: local-transaccional ("54D Coral Gables horarios", "54D Santa Fe precios").
2. **SEO (patrón):** Title: `54D {Ciudad} — Reserva tu generación` (ej. "54D Coral Gables — Reserva tu generación", 38). Description: `El método 54D en {Ciudad/zona}: entrenamiento en grupos reducidos con coach, nutrición y fisioterapia. Próxima generación con cupo limitado.` (~135, ajustar por sede). Schema `LocalBusiness`/`ExerciseGym` con dirección, geo, horarios — clave para SEO local y AEO.
3. **Secciones:**
   - Hero con foto de la sede: H1 "54D {Ciudad}" · Sub localizado (barrio/zona, ej. "En el corazón de Coral Gables").
   - Próxima generación: fecha de inicio, cupos, "Las generaciones se llenan. La tuya empieza el {fecha}." CTA "Reserva tu lugar".
   - Qué incluye la experiencia presencial: coaches en el piso, evaluación inicial, nutricionista, fisioterapia, grupo fijo.
   - Horarios de la sede (estáticos fase 1, Mindbody live fase 2).
   - Ubicación: mapa, dirección, estacionamiento/transporte.
   - Coaches de la sede (nombre + credencial — soporte E-E-A-T).
   - Formulario de lead: nombre, email, teléfono, generación de interés → tabla `leads`.
   - Cruce: "¿No te queda cerca? Haz el método online." → `/on`.
4. **CTAs:** primario "Reserva tu lugar" → formulario de lead (ancla en página); secundario "Conoce el método" → `/metodo`.
5. **Links internos:** `/studios` (volver al index), otras sedes del mismo país, `/metodo`, `/on`.

## /blog — Blog (index)

1. **Funnel:** awareness (SEO/AEO top-funnel). Intent: informacional fitness LATAM. Motor de captación orgánica y de citabilidad en ChatGPT/Gemini.
2. **SEO:** Title: `Blog 54D — Entrenamiento, nutrición y método` (44). Description: `Guías de entrenamiento, nutrición y transformación física escritas por los coaches de 54D. Sin humo: lo que funciona y por qué.` (124)
3. **Secciones:** Hero editorial ("Lo que funciona. **Y por qué.**" · Sub: "Escrito por los coaches que llevan miles de transformaciones — no por un generador de contenido."), artículo destacado, grid por categoría (Entrenamiento / Nutrición / Método), CTA intercalado "¿Listo para dejar de leer y empezar? Prueba 7 días gratis" → `/precios`.
4. **CTAs:** primario en artículos y en index → `/precios`; secundario "Conoce el método" → `/metodo`.
5. **Links internos:** cada artículo enlaza a `/metodo` (definición del método), `/on` o `/precios` según tema, y artículos relacionados. Schema `Article` con autor + credencial en cada post.

**3 artículos iniciales (SEO/AEO, con E-E-A-T):**
1. "¿Cuánto tiempo se tarda realmente en transformar tu cuerpo? Lo que dicen 54 días de datos" — por {Head Coach 54D}, entrenador certificado {credencial}. (Query AEO: "cuánto tiempo tarda ver resultados ejercicio". Angle: datos propios de generaciones = Experience.)
2. "Entrenar en casa vs. en un gym: qué funciona mejor según tu objetivo" — por {Coach 54D ON}, {credencial en ciencias del deporte}. (Comparativa citable por LLMs; puente natural a `/on`.)
3. "Qué comer antes y después de entrenar: guía práctica sin suplementos milagro" — por {Nutricionista 54D}, {cédula/licencia}. (Alto volumen en MX/CO; la voz anti-humo diferencia; puente a protocolo de nutrición.)

## /contacto — Contacto

1. **Funnel:** soporte a todas las etapas; recuperación de dudas pre-compra. Intent: navegacional/soporte.
2. **SEO:** Title: `Contacto — 54D` (14). Description: `¿Dudas sobre 54D ON, los studios o tu suscripción? Escríbenos y te respondemos. Estamos en Miami, Ciudad de México y Bogotá.` (123)
3. **Secciones:** H1 "Hablemos." · Sub: "¿Dudas sobre el método, los studios o tu suscripción? Respondemos de verdad." · Formulario (nombre, email, tema: ON / Studios / Suscripción / Prensa, mensaje) · Datos por sede (link a cada `/studios/:slug`) · Instagram · Bloque desvío inteligente: "¿Tu duda es sobre cómo funciona el método?" → `/metodo` · "¿Sobre precios y planes?" → `/precios`.
4. **CTAs:** primario "Enviar mensaje" (submit); secundario "Ver preguntas frecuentes" → `/metodo#faq`.
5. **Links internos:** `/metodo`, `/precios`, las 5 sedes.

---

## Reglas transversales

- **Nav global:** El método (`/metodo`) · 54D ON (`/on`) · Studios (`/studios`) · Blog (`/blog`) · botón "Empieza gratis" (`/precios`). Corregir anclas actuales de home (`#metodo`, `#studios`) → rutas reales.
- **AEO:** definición citable de 54D en `/metodo` (párrafo 1), `FAQPage` en `/metodo` y `/precios`, `LocalBusiness` por sede, `Article` con autor en blog, `Organization` + `sameAs` (Instagram) en root.
- **Atribución:** todo CTA a checkout pasa por `/precios` → `startCheckout(priceId)`; preservar `utm_*`/`fbclid` en la navegación interna hacia `/precios`.
- **Copy QA:** barrer voseo existente en `home.tsx` (líneas con "comés", "terminás", "tenés", "tratás", "Conocé") al construir las páginas.
