/**
 * Meta Conversions API (server-side).
 * Se manda con el MISMO event_id que el pixel del browser → Meta deduplica.
 * fbp/fbc + email hasheado suben el Event Match Quality, que es lo que
 * alimenta la optimización de campañas.
 */
import type { Env } from '../types';

type MetaEventName = 'StartTrial' | 'Subscribe' | 'Purchase' | 'Lead' | 'CompleteRegistration';

export type MetaEvent = {
  eventName: MetaEventName;
  eventId: string;              // p.ej. `sub_xxx:start_trial` — determinístico
  eventTime?: number;           // unix seconds
  email?: string;               // se hashea acá adentro
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  value?: number;               // en la moneda indicada (no centavos)
  currency?: string;
  eventSourceUrl?: string;
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sendMetaEvent(env: Env, e: MetaEvent): Promise<void> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) return; // no configurado aún

  const user_data: Record<string, unknown> = {};
  if (e.email) user_data.em = [await sha256(e.email)];
  if (e.fbp) user_data.fbp = e.fbp;
  if (e.fbc) user_data.fbc = e.fbc;
  if (e.clientIp) user_data.client_ip_address = e.clientIp;
  if (e.userAgent) user_data.client_user_agent = e.userAgent;

  const body = {
    data: [
      {
        event_name: e.eventName,
        event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: 'website',
        event_source_url: e.eventSourceUrl,
        user_data,
        ...(e.value != null
          ? { custom_data: { value: e.value, currency: e.currency ?? 'USD' } }
          : {}),
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    console.error('Meta CAPI error', res.status, await res.text());
  }
}
