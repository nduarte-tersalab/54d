/**
 * Captura de atribución first-touch en el browser.
 * Se guarda en localStorage al aterrizar y se manda al API
 * al momento de crear el checkout — ahí se une con la
 * suscripción de Stripe vía client_reference_id.
 */

const KEY = "54d_attr";

type StoredAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing_path?: string;
  referrer?: string;
  ts?: number;
};

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const existing = getStored();
    const hasNewCampaign = params.has("utm_source") || params.has("fbclid") || params.has("gclid");

    // First-touch: solo pisamos si llega una campaña nueva o no hay nada
    if (existing && !hasNewCampaign) return;

    const attr: StoredAttribution = {
      utm_source: params.get("utm_source") ?? existing?.utm_source,
      utm_medium: params.get("utm_medium") ?? existing?.utm_medium,
      utm_campaign: params.get("utm_campaign") ?? existing?.utm_campaign,
      utm_content: params.get("utm_content") ?? existing?.utm_content,
      utm_term: params.get("utm_term") ?? existing?.utm_term,
      fbclid: params.get("fbclid") ?? existing?.fbclid,
      gclid: params.get("gclid") ?? existing?.gclid,
      /* Campaña nueva = touch nuevo: landing_path es el único campo que
         dice CUÁL de las 13 landings generó la venta, así que se refresca
         junto con los utm. Si no, todo visitante recurrente y todo el
         retargeting quedan pegados al primer visit de siempre. */
      landing_path: hasNewCampaign
        ? window.location.pathname
        : (existing?.landing_path ?? window.location.pathname),
      referrer: hasNewCampaign
        ? (document.referrer || undefined)
        : (existing?.referrer ?? document.referrer ?? undefined),
      ts: hasNewCampaign ? Date.now() : (existing?.ts ?? Date.now()),
    };
    localStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    // localStorage bloqueado — seguimos sin atribución
  }
}

function getStored(): StoredAttribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : null;
  } catch {
    return null;
  }
}

function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** GA4 client_id vía gtag (si está cargado) */
function getGaClientId(): Promise<string | undefined> {
  return new Promise((resolve) => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (!w.gtag || !import.meta.env.VITE_GA4_ID) return resolve(undefined);
    const timeout = setTimeout(() => resolve(undefined), 800);
    w.gtag("get", import.meta.env.VITE_GA4_ID, "client_id", (id: string) => {
      clearTimeout(timeout);
      resolve(id);
    });
  });
}

/** Atribución completa para mandar al API al crear checkout */
export async function getFullAttribution() {
  const stored = getStored() ?? {};
  return {
    ...stored,
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc"),
    ga_client_id: await getGaClientId(),
  };
}

/** Inicia el checkout de Stripe con la atribución adjunta.
 *  meta (opcional): dispara InitiateCheckout en el pixel y begin_checkout
 *  en GA4 con la posición del CTA, para poder iterar los 7 puntos de compra
 *  de las landings. Segundo argumento opcional: pricing.tsx y on.tsx
 *  siguen llamando startCheckout(priceId) sin cambios. */
export async function startCheckout(
  priceId: string,
  meta?: { item?: string; position?: string; value?: number; contentId?: string }
): Promise<void> {
  /* content_id canonico: el slug del programa cuando lo hay (asi Meta
     empalma ViewContent con InitiateCheckout); si no, el priceId. */
  const contentId = meta?.contentId ?? priceId;
  const attribution = await getFullAttribution();
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8788";
  try {
    const w = window as unknown as {
      fbq?: (...a: unknown[]) => void;
      gtag?: (...a: unknown[]) => void;
    };
    w.fbq?.("track", "InitiateCheckout", {
      content_ids: [contentId],
      content_name: meta?.item,
      content_type: "product",
      value: meta?.value,
      currency: "USD",
    });
    w.gtag?.("event", "begin_checkout", {
      items: [{ item_id: contentId, item_name: meta?.item }],
      value: meta?.value,
      currency: "USD",
      cta_position: meta?.position,
    });
  } catch {
    // Sin pixel/gtag cargados: el checkout sigue igual
  }
  const res = await fetch(`${apiUrl}/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ priceId, attribution }),
  });
  if (res.status === 503) {
    // Stripe aún sin configurar (keys pendientes)
    throw new Error(
      "Payments are being connected. Checkout opens very soon; nothing is wrong on your end."
    );
  }
  if (!res.ok) throw new Error("We couldn't start checkout");
  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}
