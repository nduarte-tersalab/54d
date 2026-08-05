import { Link, useLocation } from "react-router";
import { Nav, Footer } from "../components/site";

/* ============================================================
   /privacy y /terms — una sola ruta con dos cuerpos.
   PLANTILLA ESTANDAR pendiente de revision legal del cliente
   (no publica datos inventados: sin domicilio social, sin SLAs,
   sin jurisdiccion especifica). Existen porque Meta Ads exige
   privacy accesible desde la landing y el footer los linkea.
   Quiet v6: prosa angosta, sentence case, cero decoracion.
   ============================================================ */

const UPDATED = "August 2026";

type Section = { h: string; body: string[] };

const PRIVACY: Section[] = [
  {
    h: "What we collect",
    body: [
      "When you request a consultation, apply for a Generation, or contact us, we collect the information you give us: your name, phone number, email, and the studio or program you are interested in.",
      "When you browse this site we collect standard usage data through analytics tools (pages visited, device type, approximate location). We use Google Analytics and Meta advertising tools to understand how people find us and to measure our campaigns.",
      "If you purchase a subscription or program, payments are processed by Stripe. We never see or store your full card details. If you book or manage sessions at a studio, that data is managed through Mindbody, our studio management platform.",
    ],
  },
  {
    h: "How we use it",
    body: [
      "To respond to your consultation request and manage your admission process.",
      "To deliver the program you purchased and support you during it.",
      "To measure and improve our marketing. We share conversion events with advertising platforms (such as Meta and Google) so we can measure which campaigns work.",
      "We do not sell your personal information.",
    ],
  },
  {
    h: "Cookies and tracking",
    body: [
      "This site uses cookies and similar technologies for analytics and advertising attribution. You can block cookies in your browser settings; the site keeps working without them.",
    ],
  },
  {
    h: "Sharing",
    body: [
      "We share data only with the service providers that make 54D work: payment processing (Stripe), studio management (Mindbody), analytics and advertising (Google, Meta), and hosting infrastructure. Each provider processes your data under its own privacy terms.",
    ],
  },
  {
    h: "Your rights",
    body: [
      "You can ask us to access, correct, or delete the personal information we hold about you at any time. Reach us through the contact page and we will handle it.",
    ],
  },
  {
    h: "Changes",
    body: [
      "If this policy changes, the new version will be published on this page with an updated date.",
    ],
  },
];

const TERMS: Section[] = [
  {
    h: "Who we are",
    body: [
      "54D operates transformation programs online and in person at our studios in the United States, Mexico, and Colombia. These terms cover your use of this website and the purchase of our programs and memberships.",
    ],
  },
  {
    h: "Programs and memberships",
    body: [
      "54D ON is a digital subscription delivered through the 54D On app. Subscriptions renew automatically until cancelled; you can cancel anytime and keep access until the end of the paid period. Trials convert into a paid subscription unless cancelled before the trial ends.",
      "54D Studios programs are in-person and admission-based. Enrollment, scheduling, and studio policies are confirmed during your consultation and managed through our studio platform.",
    ],
  },
  {
    h: "Payments and refunds",
    body: [
      "Online payments are processed by Stripe. Prices are shown before you confirm any purchase. Refund requests are reviewed case by case according to the terms presented at purchase; contact us and we will walk you through it.",
    ],
  },
  {
    h: "Health disclaimer",
    body: [
      "54D programs involve high-intensity physical training. They are not medical advice. Consult your physician before starting any training or nutrition program, and tell your coaches about any condition that could affect your training. You are responsible for training within your own limits.",
    ],
  },
  {
    h: "Intellectual property",
    body: [
      "The 54D name, logo, method, content, and imagery on this site belong to 54D and cannot be reproduced without permission.",
    ],
  },
  {
    h: "Contact",
    body: [
      "Questions about these terms or this site: reach us through the contact page.",
    ],
  },
];

export function meta({ location }: { location: { pathname: string } }) {
  const isPrivacy = location.pathname === "/privacy";
  return [
    { title: isPrivacy ? "Privacy Policy | 54D" : "Terms of Service | 54D" },
    { name: "robots", content: "noindex" },
  ];
}

export default function Legal() {
  const { pathname } = useLocation();
  const isPrivacy = pathname === "/privacy";
  const sections = isPrivacy ? PRIVACY : TERMS;

  return (
    <div>
      <Nav />
      <main
        style={{
          maxWidth: "44rem",
          margin: "0 auto",
          padding:
            "calc(var(--nav-h) + clamp(3.5rem, 8vh, 6rem)) var(--gutter) var(--space-page)",
        }}
      >
        <span className="day-marker">54D · Legal</span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.9rem, 3.6vw, 2.8rem)",
            lineHeight: 1.12,
            letterSpacing: "-0.015em",
          }}
        >
          {isPrivacy ? "Privacy policy" : "Terms of service"}
        </h1>
        <p
          style={{
            marginTop: "0.9rem",
            fontSize: "0.85rem",
            color: "var(--c-faint)",
          }}
        >
          Last updated: {UPDATED}
        </p>

        {sections.map((s) => (
          <section key={s.h} style={{ marginTop: "2.6rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.15rem",
                lineHeight: 1.3,
                color: "var(--c-white)",
              }}
            >
              {s.h}
            </h2>
            {s.body.map((p, i) => (
              <p
                key={i}
                style={{
                  marginTop: "0.9rem",
                  fontSize: "0.98rem",
                  lineHeight: 1.75,
                  color: "var(--c-mist)",
                }}
              >
                {p}
              </p>
            ))}
          </section>
        ))}

        <p style={{ marginTop: "3rem", fontSize: "0.98rem", lineHeight: 1.7 }}>
          <Link to="/contact" style={{ color: "var(--c-yellow)", textDecoration: "none" }}>
            Contact us
          </Link>{" "}
          <span style={{ color: "var(--c-faint)" }}>
            with any question about {isPrivacy ? "your data" : "these terms"}.
          </span>
        </p>
      </main>
      <Footer />
    </div>
  );
}
