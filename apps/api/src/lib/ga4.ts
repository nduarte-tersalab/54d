/**
 * GA4 Measurement Protocol (server-side).
 * Usa el client_id capturado en el browser al momento del checkout
 * para que el evento caiga en la misma sesión/usuario de GA4.
 */
import type { Env } from '../types';

export type Ga4Event = {
  clientId: string;
  name: 'begin_trial' | 'purchase' | 'generate_lead' | 'begin_checkout';
  params?: Record<string, unknown>;
};

export async function sendGa4Event(env: Env, e: Ga4Event): Promise<void> {
  if (!env.GA4_MEASUREMENT_ID || !env.GA4_API_SECRET || !e.clientId) return;

  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: e.clientId,
        events: [{ name: e.name, params: { ...e.params } }],
      }),
    }
  );
  if (!res.ok) {
    console.error('GA4 MP error', res.status, await res.text());
  }
}
