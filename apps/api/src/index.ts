/**
 * 54D API — Cloudflare Worker (Hono)
 *
 * POST /checkout          → guarda atribución + crea Stripe Checkout Session
 * POST /webhooks/stripe   → sincroniza suscripciones a Supabase + CAPI/GA4
 * POST /leads             → leads presenciales (futuro: push a Mindbody)
 * GET  /health
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CheckoutRequest, Env } from './types';
import { sendMetaEvent } from './lib/meta';
import { sendGa4Event } from './lib/ga4';

type Ctx = { Bindings: Env };

const app = new Hono<Ctx>();

app.use('*', async (c, next) => {
  const corsMw = cors({ origin: [c.env.SITE_URL], allowMethods: ['GET', 'POST'] });
  return corsMw(c, next);
});

const db = (env: Env): SupabaseClient =>
  createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

const stripe = (env: Env) =>
  new Stripe(env.STRIPE_SECRET_KEY, {
    // Fetch nativo de Workers (sin Node http)
    httpClient: Stripe.createFetchHttpClient(),
  });

app.get('/health', (c) => c.json({ ok: true }));

// ------------------------------------------------------------------
// Checkout: el front manda priceId + toda la atribución capturada.
// ------------------------------------------------------------------
app.post('/checkout', async (c) => {
  const body = await c.req.json<CheckoutRequest>();
  if (!body?.priceId) return c.json({ error: 'priceId requerido' }, 400);

  const supabase = db(c.env);

  // 1. Guardar atribución ANTES de crear la sesión
  const { data: attr, error: attrErr } = await supabase
    .from('checkout_attributions')
    .insert({
      utm_source: body.attribution?.utm_source,
      utm_medium: body.attribution?.utm_medium,
      utm_campaign: body.attribution?.utm_campaign,
      utm_content: body.attribution?.utm_content,
      utm_term: body.attribution?.utm_term,
      fbclid: body.attribution?.fbclid,
      fbp: body.attribution?.fbp,
      fbc: body.attribution?.fbc,
      gclid: body.attribution?.gclid,
      ga_client_id: body.attribution?.ga_client_id,
      landing_path: body.attribution?.landing_path,
      referrer: body.attribution?.referrer,
    })
    .select('id')
    .single();
  if (attrErr) return c.json({ error: attrErr.message }, 500);

  // 2. Trial days: los define el Price en Stripe (espejo en program_prices)
  const { data: price } = await supabase
    .from('program_prices')
    .select('trial_days')
    .eq('stripe_price_id', body.priceId)
    .maybeSingle();

  // 3. Crear Checkout Session
  const session = await stripe(c.env).checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: body.priceId, quantity: 1 }],
    customer_email: body.email || undefined,
    client_reference_id: attr.id,
    subscription_data: price?.trial_days
      ? { trial_period_days: price.trial_days }
      : undefined,
    allow_promotion_codes: true,
    success_url: `${c.env.SITE_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${c.env.SITE_URL}/precios`,
    metadata: { attribution_id: attr.id },
  });

  await supabase
    .from('checkout_attributions')
    .update({ checkout_session_id: session.id })
    .eq('id', attr.id);

  return c.json({ url: session.url });
});

// ------------------------------------------------------------------
// Webhooks de Stripe
// ------------------------------------------------------------------
app.post('/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.text('missing signature', 400);

  const payload = await c.req.text();
  let event: Stripe.Event;
  try {
    event = await stripe(c.env).webhooks.constructEventAsync(
      payload,
      sig,
      c.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return c.text('bad signature', 400);
  }

  const supabase = db(c.env);

  // Idempotencia: si ya lo procesamos, 200 y listo
  const { error: dupErr } = await supabase
    .from('webhook_events')
    .insert({ source: 'stripe', event_id: event.id, type: event.type, payload: event as unknown as object });
  if (dupErr?.code === '23505') return c.text('ok (dup)', 200);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await onCheckoutCompleted(c.env, supabase, event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSubscription(supabase, event.data.object);
        break;
      case 'invoice.paid':
        await onInvoicePaid(c.env, supabase, event.data.object);
        break;
      case 'invoice.payment_failed':
        await upsertInvoice(supabase, event.data.object);
        break;
    }
    await supabase
      .from('webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('source', 'stripe')
      .eq('event_id', event.id);
  } catch (err) {
    await supabase
      .from('webhook_events')
      .update({ error: String(err) })
      .eq('source', 'stripe')
      .eq('event_id', event.id);
    // 500 → Stripe reintenta
    return c.text('handler error', 500);
  }

  return c.text('ok', 200);
});

// ---------- handlers ----------

async function upsertCustomer(
  supabase: SupabaseClient,
  stripeCustomerId: string,
  email?: string | null,
  name?: string | null
): Promise<string> {
  const { data } = await supabase
    .from('stripe_customers')
    .upsert(
      { stripe_customer_id: stripeCustomerId, email: email ?? undefined, name: name ?? undefined },
      { onConflict: 'stripe_customer_id' }
    )
    .select('id')
    .single();
  return data!.id;
}

async function upsertSubscription(
  supabase: SupabaseClient,
  sub: Stripe.Subscription
): Promise<string> {
  const customerId = await upsertCustomer(supabase, sub.customer as string);
  const priceId = sub.items.data[0]?.price?.id;

  // Mapear price → programa vía espejo
  const { data: pp } = await supabase
    .from('program_prices')
    .select('program_id')
    .eq('stripe_price_id', priceId)
    .maybeSingle();

  const { data } = await supabase
    .from('subscriptions')
    .upsert(
      {
        stripe_subscription_id: sub.id,
        customer_id: customerId,
        status: sub.status,
        stripe_price_id: priceId,
        program_id: pp?.program_id ?? null,
        trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      },
      { onConflict: 'stripe_subscription_id' }
    )
    .select('id')
    .single();
  return data!.id;
}

async function onCheckoutCompleted(
  env: Env,
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<void> {
  if (!session.subscription) return;

  const s = await stripe(env).subscriptions.retrieve(session.subscription as string);
  const subRowId = await upsertSubscription(supabase, s);
  const customerId = await upsertCustomer(
    supabase,
    session.customer as string,
    session.customer_details?.email,
    session.customer_details?.name
  );

  // Enlazar atribución ← ESTO conecta el ad de Meta con la suscripción
  const attrId = session.client_reference_id;
  let attr: { fbp?: string; fbc?: string; ga_client_id?: string } | null = null;
  if (attrId) {
    const { data } = await supabase
      .from('checkout_attributions')
      .update({ subscription_id: subRowId, customer_id: customerId })
      .eq('id', attrId)
      .select('fbp, fbc, ga_client_id')
      .single();
    attr = data;
  }

  const email = session.customer_details?.email ?? undefined;
  const isTrial = s.status === 'trialing';

  // Server-side events (dedup con pixel vía event_id determinístico)
  await sendMetaEvent(env, {
    eventName: isTrial ? 'StartTrial' : 'Subscribe',
    eventId: `${s.id}:start`,
    email,
    fbp: attr?.fbp,
    fbc: attr?.fbc,
  });
  if (attr?.ga_client_id) {
    await sendGa4Event(env, {
      clientId: attr.ga_client_id,
      name: 'begin_trial',
      params: { subscription_id: s.id },
    });
  }
}

async function upsertInvoice(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = await upsertCustomer(supabase, invoice.customer as string);
  const stripeSubId = (invoice.subscription as string | null) ?? null;

  let subRowId: string | null = null;
  if (stripeSubId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeSubId)
      .maybeSingle();
    subRowId = data?.id ?? null;
  }

  await supabase.from('invoices').upsert(
    {
      stripe_invoice_id: invoice.id,
      subscription_id: subRowId,
      customer_id: customerId,
      amount_paid: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? 'usd',
      status: invoice.status,
      paid_at: invoice.status === 'paid' ? new Date().toISOString() : null,
    },
    { onConflict: 'stripe_invoice_id' }
  );
}

async function onInvoicePaid(
  env: Env,
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
): Promise<void> {
  await upsertInvoice(supabase, invoice);
  if (invoice.amount_paid === 0) return; // invoice $0 del trial — no es conversión

  const stripeSubId = (invoice.subscription as string | null) ?? null;
  if (!stripeSubId) return;

  // ¿Primer cobro real? → marcar conversión + eventos Purchase
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, first_paid_at')
    .eq('stripe_subscription_id', stripeSubId)
    .maybeSingle();
  if (!sub || sub.first_paid_at) return;

  await supabase
    .from('subscriptions')
    .update({ first_paid_at: new Date().toISOString() })
    .eq('id', sub.id);

  const { data: attr } = await supabase
    .from('checkout_attributions')
    .select('fbp, fbc, ga_client_id')
    .eq('subscription_id', sub.id)
    .maybeSingle();

  const value = (invoice.amount_paid ?? 0) / 100;
  const currency = (invoice.currency ?? 'usd').toUpperCase();

  await sendMetaEvent(env, {
    eventName: 'Purchase',
    eventId: `${stripeSubId}:first_payment`,
    email: invoice.customer_email ?? undefined,
    fbp: attr?.fbp ?? undefined,
    fbc: attr?.fbc ?? undefined,
    value,
    currency,
  });
  if (attr?.ga_client_id) {
    await sendGa4Event(env, {
      clientId: attr.ga_client_id,
      name: 'purchase',
      params: { value, currency, transaction_id: invoice.id },
    });
  }
}

// ------------------------------------------------------------------
// Leads presenciales (fase 2: push a Mindbody con locations.mindbody_site_id)
// ------------------------------------------------------------------
app.post('/leads', async (c) => {
  const body = await c.req.json<Record<string, string>>();
  if (!body?.email && !body?.phone) return c.json({ error: 'email o phone requerido' }, 400);

  const { error } = await db(c.env).from('leads').insert({
    name: body.name,
    email: body.email,
    phone: body.phone,
    location_id: body.location_id || null,
    program_id: body.program_id || null,
    utm_source: body.utm_source,
    utm_medium: body.utm_medium,
    utm_campaign: body.utm_campaign,
  });
  if (error) return c.json({ error: error.message }, 500);

  await sendMetaEvent(c.env, {
    eventName: 'Lead',
    eventId: `lead:${body.email ?? body.phone}:${Date.now()}`,
    email: body.email,
  });

  return c.json({ ok: true });
});

export default app;
