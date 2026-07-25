/**
 * Mindbody Public API v6 — integración mínima de leads.
 *
 * addclient funciona con Api-Key + SiteId solos (verificado en sandbox
 * 25/07/2026: client 100015625 creado sin user token). El staff token
 * (usertoken/issue) queda para endpoints futuros (membresías, ventas,
 * clases) y HOY devuelve 403: el developer account está en sandbox
 * hasta que Mindbody apruebe el go-live y el site 317554 autorice.
 *
 * Los campos requeridos de addclient los define CADA site
 * (client/requiredclientfields). Si el site pide campos que un lead
 * web no tiene (p. ej. Birthday), el error queda registrado en
 * leads.mindbody_sync_error: visible, no inventamos datos.
 */
import type { Env } from '../types';

const MB = 'https://api.mindbodyonline.com/public/v6';

type MbResult =
  | { ok: true; clientId: string }
  | { ok: false; error: string };

export async function pushLeadToMindbody(
  env: Env,
  lead: { name?: string; email?: string; phone?: string }
): Promise<MbResult> {
  if (!env.MINDBODY_API_KEY || !env.MINDBODY_SITE_ID) {
    return { ok: false, error: 'mindbody_not_configured' };
  }

  const [firstName, ...rest] = (lead.name ?? '').trim().split(/\s+/);
  const body = {
    FirstName: firstName || 'Web',
    LastName: rest.join(' ') || 'Lead',
    Email: lead.email || undefined,
    MobilePhone: lead.phone || undefined,
    ReferredBy: 'Web',
  };

  try {
    const res = await fetch(`${MB}/client/addclient`, {
      method: 'POST',
      headers: {
        'Api-Key': env.MINDBODY_API_KEY,
        SiteId: env.MINDBODY_SITE_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      Client?: { Id?: number | string; UniqueId?: number | string };
      Error?: { Message?: string; Code?: string };
    };
    if (!res.ok || data.Error) {
      return {
        ok: false,
        error: `${data.Error?.Code ?? res.status}: ${data.Error?.Message ?? 'unknown'}`,
      };
    }
    const id = data.Client?.UniqueId ?? data.Client?.Id;
    if (!id) return { ok: false, error: 'no_client_id_in_response' };
    return { ok: true, clientId: String(id) };
  } catch (err) {
    return { ok: false, error: `network: ${String(err)}` };
  }
}
