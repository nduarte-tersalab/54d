/* ============================================================
   Testimonios REALES por sede — extraídos de las reseñas
   públicas de Google de cada studio (links del cliente,
   06/08/2026). Regla del proyecto: cero testimonios inventados;
   estos son citables porque son públicos y verificables en el
   perfil de Google de cada sede (link "todas las reseñas").
   - textEs = cita textual (todas las reseñas están en español).
   - textEn = traducción al inglés; la UI la marca "Translated
     from a Google review" (práctica estándar de Google).
   - Nombre como aparece en Google, apellido a inicial.
   - rating/count del agregado del perfil al 06/08/2026.
   NO editar las citas más allá de recortes con elipsis.
   ============================================================ */

export interface SedeReviews {
  rating: string;
  count: number;
  /** URL pública para leer todas las reseñas del perfil */
  url: string;
  quotes: {
    name: string;
    textEs: string;
    textEn: string;
  }[];
}

export const GOOGLE_REVIEWS: Record<string, SedeReviews> = {
  "coral-gables": {
    rating: "4.5",
    count: 75,
    url: "https://maps.app.goo.gl/b2uZ1n7XQJv75em86",
    quotes: [
      {
        name: "Iveth L.",
        textEs:
          "Llevo más de 3 años entrenando en 54D y puedo decir con total seguridad que ha sido una experiencia que ha cambiado mi vida.",
        textEn:
          "I've been training at 54D for over 3 years and I can say with total certainty that it has been a life-changing experience.",
      },
      {
        name: "Catalina S.",
        textEs:
          "No solo te cambia tu físico (para siempre) sino tu mente, tus posibilidades, tu confianza, tu seguridad y sobre todo tu corazón.",
        textEn:
          "It doesn't just change your body (forever), it changes your mind, your possibilities, your confidence, and above all your heart.",
      },
      {
        name: "Estefanía M.",
        textEs:
          "Súper buen programa, sobre todo la motivación que comparten los coaches. Hay veces que ni ganas tengo de entrenar y no más empiezo y ya la motivación regresa a mí.",
        textEn:
          "Great program, especially the motivation the coaches share. Some days I don't even feel like training, and the moment I start, the motivation comes right back.",
      },
    ],
  },
  hallandale: {
    rating: "4.9",
    count: 19,
    url: "https://maps.app.goo.gl/7y6WxPq2zHR8G473A",
    quotes: [
      {
        name: "Marcela M.",
        textEs:
          "54D es mucho más que un gimnasio, es una experiencia transformadora. Desde el primer día te enseñan el verdadero valor de la disciplina y cómo aplicarla en cada aspecto de tu vida. Las instalaciones son de primer nivel.",
        textEn:
          "54D is much more than a gym, it's a transformative experience. From day one they teach you the true value of discipline and how to apply it to every part of your life. The facilities are first class.",
      },
      {
        name: "Laura P.",
        textEs:
          "54D es simplemente excepcional. Cada sesión es intensa y desafiante, exactamente lo que necesitaba. Los entrenadores son altamente profesionales y saben cómo motivarte para dar lo mejor de ti.",
        textEn:
          "54D is simply exceptional. Every session is intense and challenging, exactly what I needed. The coaches are highly professional and know how to push you to give your best.",
      },
      {
        name: "Eli G.",
        textEs:
          "54D más que un gym es una experiencia que todos deberíamos probar: ejercicios con recuperación y nutrición guiada, y espacios de recuperación súper cómodos.",
        textEn:
          "More than a gym, 54D is an experience everyone should try: training with guided recovery and nutrition, and really comfortable recovery spaces.",
      },
    ],
  },
  "mexico-carso": {
    rating: "4.8",
    count: 24,
    url: "https://www.google.com/maps/search/54D+Plaza+Carso+Ciudad+de+Mexico",
    quotes: [
      {
        name: "Delia V.",
        textEs:
          "Hay un antes y un después de un ciclo en 54D, y no solamente físico, sino mental y emocional. Los cambios de las personas que se comprometen con el programa son increíblemente buenos.",
        textEn:
          "There's a before and after a 54D cycle, and not just physically: mentally and emotionally too. The changes in people who commit to the program are incredibly good.",
      },
      {
        name: "Ro A.",
        textEs:
          "El mejor lugar para entrenar, un gran ambiente para sacar el estrés y centrarte en ti.",
        textEn:
          "The best place to train, a great environment to burn off stress and focus on yourself.",
      },
    ],
  },
  "mexico-santa-fe": {
    rating: "4.4",
    count: 87,
    url: "https://www.google.com/maps/search/54D+Santa+Fe+Ciudad+de+Mexico",
    quotes: [
      {
        name: "Luis C.",
        textEs: "El mejor lugar, el mejor ambiente, lo mejor para hacer ejercicio.",
        textEn: "The best place, the best atmosphere, the best way to train.",
      },
      {
        name: "José Luis B.",
        textEs:
          "Voy con mis sesiones de nutrición, gran atención de su parte, muy apasionada por su trabajo. Me encanta ir aquí.",
        textEn:
          "I come for my nutrition sessions, great attention on their part, really passionate about their work. I love coming here.",
      },
    ],
  },
  bogota: {
    rating: "4.4",
    count: 37,
    url: "https://www.google.com/maps/search/54D+Bogota",
    quotes: [
      {
        name: "Camila R.",
        textEs: "¡Increíble! Transformaron mi vida en solo 54 días.",
        textEn: "Incredible! They transformed my life in just 54 days.",
      },
    ],
  },
};
