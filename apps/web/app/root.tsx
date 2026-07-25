import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useEffect } from "react";
import { captureAttribution } from "./lib/attribution";

const BASE = import.meta.env.BASE_URL;
/* og:image absoluta (Meta/WhatsApp la fetchean desde afuera):
   apunta al worker canónico, sirve para todos los previews */
const OG_IMAGE = "https://54d-web.54d.workers.dev/images/og/og-54d.jpg";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/png", href: `${BASE}favicon-64.png` },
  { rel: "apple-touch-icon", href: `${BASE}apple-touch-icon.png` },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // PLACEHOLDER hasta tener los woff2 licenciados:
  // Archivo ≈ Allumi Std Extended · Archivo Narrow ≈ Helvetica Neue Condensed
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Archivo+Narrow:wght@400;500;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="54D" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE} />
        <Meta />
        <Links />
        {/* GA4 + Meta Pixel: se activan solo si hay IDs en el env.
            Los eventos de conversión (trial/purchase) van server-side
            desde apps/api — esto cubre pageviews + eventos de UI. */}
        {import.meta.env.VITE_GA4_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA4_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${import.meta.env.VITE_GA4_ID}');`,
              }}
            />
          </>
        ) : null}
        {import.meta.env.VITE_META_PIXEL_ID ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${import.meta.env.VITE_META_PIXEL_ID}');fbq('track','PageView');`,
            }}
          />
        ) : null}
      </head>
      <body className="grain">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Captura utm_*/fbclid/gclid del primer touch y los persiste
  useEffect(() => {
    captureAttribution();
  }, []);
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "We couldn't find this page."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ padding: "8rem 2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "4rem" }}>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ overflowX: "auto", padding: "1rem", fontSize: "0.8rem" }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
