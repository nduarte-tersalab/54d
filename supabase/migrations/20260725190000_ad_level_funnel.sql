-- Funnel a nivel ANUNCIO (no solo campaña) + bajas por atribución.
-- utm_content lleva el nombre/id del ad (plantilla de URL en Meta Ads:
-- utm_content={{ad.name}}). Ver docs/ANALYTICS.md.

drop view if exists v_campaign_funnel;

create or replace view v_campaign_funnel
with (security_invoker = on) as
select
  coalesce(a.utm_source, '(direct)')   as utm_source,
  coalesce(a.utm_campaign, '(none)')   as utm_campaign,
  coalesce(a.utm_content, '(none)')    as utm_content,          -- el anuncio
  count(distinct a.id)                                              as checkouts_iniciados,
  count(distinct s.id) filter (where s.trial_start is not null)     as trials_iniciados,
  count(distinct s.id) filter (where s.first_paid_at is not null)   as conversiones_pagas,
  count(distinct s.id) filter (where s.status = 'active')           as activas_hoy,
  count(distinct s.id) filter (where s.status = 'canceled')         as canceladas,
  count(distinct s.id) filter (
    where s.status = 'canceled' and s.first_paid_at is null
  )                                                                 as bajas_en_trial,
  coalesce(sum(i.amount_paid) filter (where i.status = 'paid'), 0)  as revenue_cents
from checkout_attributions a
left join subscriptions s on s.id = a.subscription_id
left join invoices i      on i.subscription_id = s.id
group by 1, 2, 3;
