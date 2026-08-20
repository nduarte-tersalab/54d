-- ============================================================
-- Atribución por CANAL (no solo por campaña de Meta).
--
-- El dashboard tiene que responder: de dónde vienen las ventas y
-- los free trials. Los canales que el cliente pidió ver:
-- Meta Ads, newsletter, orgánico/SEO, directo y referral.
--
-- Hasta ahora v_campaign_funnel agrupaba por utm_source crudo, que
-- sirve para Meta (donde controlamos la plantilla de URL) pero deja
-- afuera el tráfico sin UTM: alguien que llega por Google o escribe
-- la URL cae en '(direct)' sin distinción.
--
-- Acá se agrega:
--   1. channel_of(): clasificador único, usado por TODAS las vistas
--      para que dashboard, leads y ventas cuenten igual.
--   2. v_channel_funnel: el funnel agrupado por canal.
--   3. v_leads_by_channel: lo mismo para leads (Studios + assessment).
--   4. v_channel_daily: serie temporal para graficar.
--
-- Ver docs/STRIPE.md (sección FitBudd) para el caso en que el cobro
-- ocurra fuera de nuestro checkout.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Clasificador de canal
--    Orden de precedencia deliberado: lo más específico primero.
--    IMMUTABLE + STABLE para que Postgres pueda indexarla si hace falta.
-- ------------------------------------------------------------
create or replace function channel_of(
  p_utm_source   text,
  p_utm_medium   text,
  p_referrer     text,
  p_fbclid       text default null,
  p_gclid        text default null
) returns text
language sql
immutable
as $$
  select case
    -- Meta pagado: por UTM propio o por el click id que agrega Facebook
    when p_fbclid is not null and p_fbclid <> '' then 'meta_ads'
    when lower(coalesce(p_utm_source, '')) in ('meta', 'facebook', 'fb', 'ig', 'instagram')
         and lower(coalesce(p_utm_medium, '')) in ('paid', 'cpc', 'ppc', 'paid_social')
      then 'meta_ads'
    when lower(coalesce(p_utm_source, '')) in ('meta', 'facebook', 'fb', 'ig', 'instagram')
      then 'meta_organic'

    -- Google Ads
    when p_gclid is not null and p_gclid <> '' then 'google_ads'
    when lower(coalesce(p_utm_medium, '')) in ('cpc', 'ppc', 'paid')
      then 'paid_other'

    -- Email / newsletter
    when lower(coalesce(p_utm_medium, '')) in ('email', 'newsletter', 'mail')
         or lower(coalesce(p_utm_source, '')) in ('newsletter', 'klaviyo', 'mailchimp', 'email')
      then 'newsletter'

    -- Búsqueda orgánica: sin UTM y con referrer de buscador
    when p_utm_source is null
         and p_referrer ~* '(google|bing|duckduckgo|yahoo|ecosia|brave)\.'
      then 'seo'
    when lower(coalesce(p_utm_medium, '')) = 'organic' then 'seo'

    -- Social orgánico (no Meta)
    when p_referrer ~* '(t\.co|twitter|x\.com|linkedin|tiktok|youtube|whatsapp)'
      then 'social_organic'

    -- Sin UTM y sin referrer: escribió la URL o vino de un QR / app
    when p_utm_source is null and coalesce(p_referrer, '') = '' then 'direct'

    -- Cualquier otro sitio que nos linkeó
    when p_utm_source is null then 'referral'

    -- UTM que no cae en ninguna regla: se ve tal cual para no perderlo
    else lower(p_utm_source)
  end;
$$;

comment on function channel_of is
  'Clasifica un touch en canal comercial (meta_ads, newsletter, seo, direct...). Fuente unica de verdad: usarla en toda vista que agrupe por origen.';

-- ------------------------------------------------------------
-- 2. Funnel por canal: ventas y trials, que es la pregunta del negocio
-- ------------------------------------------------------------
drop view if exists v_channel_funnel;

create or replace view v_channel_funnel
with (security_invoker = on) as
select
  channel_of(a.utm_source, a.utm_medium, a.referrer, a.fbclid, a.gclid) as channel,
  count(distinct a.id)                                              as checkouts_iniciados,
  count(distinct s.id) filter (where s.trial_start is not null)     as trials_iniciados,
  count(distinct s.id) filter (where s.first_paid_at is not null)   as conversiones_pagas,
  count(distinct s.id) filter (where s.status = 'active')           as activas_hoy,
  count(distinct s.id) filter (where s.status = 'canceled')         as canceladas,
  count(distinct s.id) filter (
    where s.status = 'canceled' and s.first_paid_at is null
  )                                                                 as bajas_en_trial,
  coalesce(sum(i.amount_paid) filter (where i.status = 'paid'), 0)  as revenue_cents,
  -- % de checkouts que terminan pagando: la métrica que compara canales
  round(
    100.0 * count(distinct s.id) filter (where s.first_paid_at is not null)
    / nullif(count(distinct a.id), 0)
  , 1)                                                              as conversion_pct
from checkout_attributions a
left join subscriptions s on s.id = a.subscription_id
left join invoices i      on i.subscription_id = s.id
group by 1
order by revenue_cents desc;

comment on view v_channel_funnel is
  'Ventas y trials por canal comercial. Alimenta el bloque principal de /admin.';

-- ------------------------------------------------------------
-- 3. Leads por canal (Studios y assessment no pasan por checkout:
--    su origen vive en la tabla leads, no en checkout_attributions)
-- ------------------------------------------------------------
drop view if exists v_leads_by_channel;

create or replace view v_leads_by_channel
with (security_invoker = on) as
select
  channel_of(l.utm_source, l.utm_medium, null, null, null) as channel,
  count(*)                                                  as leads_total,
  count(*) filter (where l.status = 'new')                  as nuevos,
  count(*) filter (where l.status = 'contacted')            as contactados,
  count(*) filter (where l.created_at > now() - interval '30 days') as ultimos_30d,
  count(*) filter (where l.mindbody_client_id is not null)  as sincronizados_mindbody
from leads l
group by 1
order by leads_total desc;

comment on view v_leads_by_channel is
  'Leads (sedes + assessment) agrupados por canal, mismo clasificador que las ventas.';

-- ------------------------------------------------------------
-- 4. Serie diaria por canal, para graficar tendencia
-- ------------------------------------------------------------
drop view if exists v_channel_daily;

create or replace view v_channel_daily
with (security_invoker = on) as
select
  date_trunc('day', a.created_at)::date as dia,
  channel_of(a.utm_source, a.utm_medium, a.referrer, a.fbclid, a.gclid) as channel,
  count(distinct a.id)                                            as checkouts,
  count(distinct s.id) filter (where s.trial_start is not null)   as trials,
  count(distinct s.id) filter (where s.first_paid_at is not null) as ventas,
  coalesce(sum(i.amount_paid) filter (where i.status = 'paid'), 0) as revenue_cents
from checkout_attributions a
left join subscriptions s on s.id = a.subscription_id
left join invoices i      on i.subscription_id = s.id
where a.created_at > now() - interval '90 days'
group by 1, 2
order by 1 desc, revenue_cents desc;

comment on view v_channel_daily is
  'Serie diaria (90 dias) por canal para el grafico de tendencia del dashboard.';
