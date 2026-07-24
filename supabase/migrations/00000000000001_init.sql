-- ============================================================
-- 54D — Schema inicial
-- Dominio: programas (online + studio), blog SEO, suscripciones
-- Stripe, atribución de ads (Meta/Google), leads Mindbody.
-- ============================================================

-- ---------- ENUMS ----------
create type program_type as enum ('online', 'studio');
create type post_status as enum ('draft', 'published', 'archived');
create type sub_status as enum (
  'trialing', 'active', 'past_due', 'canceled',
  'incomplete', 'incomplete_expired', 'unpaid', 'paused'
);
create type lead_status as enum ('new', 'contacted', 'booked', 'converted', 'lost');

-- ---------- HELPERS ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Staff check para RLS (dashboard)
create table profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  full_name  text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

create or replace function is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create policy "profiles: own row" on profiles
  for select using (auth.uid() = user_id);
create policy "profiles: staff read all" on profiles
  for select using (is_staff());

-- ---------- LOCATIONS (presencial) ----------
create table locations (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  city             text not null,
  country          text not null,             -- 'US' | 'MX' | 'CO'
  timezone         text not null,
  address          text,
  whatsapp         text,
  mindbody_site_id text,                      -- para la integración Mindbody
  active           boolean not null default true,
  sort             int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_locations_updated before update on locations
  for each row execute function set_updated_at();
alter table locations enable row level security;
create policy "locations: public read active" on locations
  for select using (active or is_staff());
create policy "locations: staff write" on locations
  for all using (is_staff()) with check (is_staff());

-- Seed (NYC queda fuera por decisión de negocio)
insert into locations (slug, name, city, country, timezone, sort) values
  ('coral-gables', '54D Coral Gables', 'Coral Gables, FL', 'US', 'America/New_York', 1),
  ('hallandale',   '54D Hallandale',   'Hallandale, FL',   'US', 'America/New_York', 2),
  ('mexico-carso', '54D Carso',        'Ciudad de México', 'MX', 'America/Mexico_City', 3),
  ('mexico-santa-fe', '54D Santa Fe',  'Ciudad de México', 'MX', 'America/Mexico_City', 4),
  ('bogota',       '54D Bogotá',       'Bogotá',           'CO', 'America/Bogota', 5);

-- ---------- PROGRAMS ----------
create table programs (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  type          program_type not null,
  name          text not null,
  tagline       text,
  description   text,                          -- markdown
  duration_days int default 54,
  hero_image    text,
  hero_video    text,                          -- URL (R2 / Stream)
  published     boolean not null default false,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_programs_updated before update on programs
  for each row execute function set_updated_at();
alter table programs enable row level security;
create policy "programs: public read published" on programs
  for select using (published or is_staff());
create policy "programs: staff write" on programs
  for all using (is_staff()) with check (is_staff());

-- Programa presencial disponible por sede
create table program_locations (
  program_id  uuid not null references programs (id) on delete cascade,
  location_id uuid not null references locations (id) on delete cascade,
  primary key (program_id, location_id)
);
alter table program_locations enable row level security;
create policy "program_locations: public read" on program_locations for select using (true);
create policy "program_locations: staff write" on program_locations
  for all using (is_staff()) with check (is_staff());

-- Cohortes / generaciones con fecha de inicio (presencial)
create table cohorts (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references programs (id) on delete cascade,
  location_id uuid not null references locations (id) on delete cascade,
  starts_on   date not null,
  capacity    int,
  status      text not null default 'open' check (status in ('open', 'waitlist', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_cohorts_updated before update on cohorts
  for each row execute function set_updated_at();
alter table cohorts enable row level security;
create policy "cohorts: public read" on cohorts for select using (true);
create policy "cohorts: staff write" on cohorts
  for all using (is_staff()) with check (is_staff());

-- Espejo de precios de Stripe (la fuente de verdad es Stripe;
-- esto permite render sin llamar la API y auditar cambios)
create table program_prices (
  id               uuid primary key default gen_random_uuid(),
  program_id       uuid not null references programs (id) on delete cascade,
  stripe_price_id  text not null unique,
  stripe_product_id text,
  currency         text not null default 'usd',
  unit_amount      int not null,               -- centavos
  interval         text check (interval in ('month', 'quarter', 'year', 'one_time')),
  trial_days       int default 0,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
alter table program_prices enable row level security;
create policy "prices: public read active" on program_prices
  for select using (active or is_staff());
create policy "prices: staff write" on program_prices
  for all using (is_staff()) with check (is_staff());

-- ---------- BLOG (SEO / E-E-A-T) ----------
create table authors (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  credentials text,                            -- "Nutricionista, Lic. ..." → E-E-A-T
  bio         text,
  avatar_url  text,
  instagram   text,
  created_at  timestamptz not null default now()
);
alter table authors enable row level security;
create policy "authors: public read" on authors for select using (true);
create policy "authors: staff write" on authors
  for all using (is_staff()) with check (is_staff());

create table categories (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  name_es text not null,
  name_en text not null
);
alter table categories enable row level security;
create policy "categories: public read" on categories for select using (true);
create policy "categories: staff write" on categories
  for all using (is_staff()) with check (is_staff());

create table posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null,
  locale            text not null default 'es' check (locale in ('es', 'en')),
  translation_group uuid not null default gen_random_uuid(), -- une par ES/EN
  title             text not null,
  excerpt           text,
  body              text,                       -- markdown
  cover_url         text,
  author_id         uuid references authors (id) on delete set null,
  category_id       uuid references categories (id) on delete set null,
  tags              text[] not null default '{}',
  seo_title         text,
  seo_description   text,
  status            post_status not null default 'draft',
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (slug, locale)
);
create index idx_posts_status_published on posts (status, published_at desc);
create index idx_posts_translation on posts (translation_group);
create trigger trg_posts_updated before update on posts
  for each row execute function set_updated_at();
alter table posts enable row level security;
create policy "posts: public read published" on posts
  for select using (status = 'published' or is_staff());
create policy "posts: staff write" on posts
  for all using (is_staff()) with check (is_staff());

-- ---------- STRIPE MIRROR ----------
create table stripe_customers (
  id                 uuid primary key default gen_random_uuid(),
  stripe_customer_id text not null unique,
  email              text,
  name               text,
  user_id            uuid references auth.users (id) on delete set null, -- member area futuro
  created_at         timestamptz not null default now()
);
create index idx_stripe_customers_email on stripe_customers (lower(email));
alter table stripe_customers enable row level security;
create policy "customers: staff read" on stripe_customers for select using (is_staff());

create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  stripe_subscription_id text not null unique,
  customer_id            uuid not null references stripe_customers (id) on delete cascade,
  status                 sub_status not null,
  stripe_price_id        text,
  program_id             uuid references programs (id) on delete set null,
  trial_start            timestamptz,
  trial_end              timestamptz,
  first_paid_at          timestamptz,           -- primer invoice cobrado → conversión real
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  canceled_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index idx_subscriptions_status on subscriptions (status);
create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();
alter table subscriptions enable row level security;
create policy "subscriptions: staff read" on subscriptions for select using (is_staff());

create table invoices (
  id                uuid primary key default gen_random_uuid(),
  stripe_invoice_id text not null unique,
  subscription_id   uuid references subscriptions (id) on delete set null,
  customer_id       uuid references stripe_customers (id) on delete cascade,
  amount_paid       int not null default 0,     -- centavos
  currency          text not null default 'usd',
  status            text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now()
);
alter table invoices enable row level security;
create policy "invoices: staff read" on invoices for select using (is_staff());

-- ---------- ATRIBUCIÓN DE ADS ----------
-- Se llena al crear la Checkout Session (client_reference_id = attribution.id)
-- y se enlaza a la suscripción en el webhook checkout.session.completed.
create table checkout_attributions (
  id                 uuid primary key default gen_random_uuid(),
  checkout_session_id text unique,
  subscription_id    uuid references subscriptions (id) on delete set null,
  customer_id        uuid references stripe_customers (id) on delete set null,
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  utm_content        text,
  utm_term           text,
  fbclid             text,
  fbp                text,                      -- cookie _fbp → Meta CAPI match
  fbc                text,                      -- cookie _fbc → Meta CAPI match
  gclid              text,
  ga_client_id       text,                      -- GA4 Measurement Protocol
  landing_path       text,
  referrer           text,
  created_at         timestamptz not null default now()
);
create index idx_attr_campaign on checkout_attributions (utm_source, utm_campaign);
alter table checkout_attributions enable row level security;
create policy "attributions: staff read" on checkout_attributions for select using (is_staff());

-- Idempotencia + auditoría de webhooks
create table webhook_events (
  id           uuid primary key default gen_random_uuid(),
  source       text not null check (source in ('stripe', 'meta', 'mindbody')),
  event_id     text not null,
  type         text not null,
  payload      jsonb not null,
  processed_at timestamptz,
  error        text,
  created_at   timestamptz not null default now(),
  unique (source, event_id)
);
alter table webhook_events enable row level security;
create policy "webhooks: staff read" on webhook_events for select using (is_staff());

-- ---------- LEADS (presencial / Mindbody) ----------
create table leads (
  id                 uuid primary key default gen_random_uuid(),
  name               text,
  email              text,
  phone              text,
  location_id        uuid references locations (id) on delete set null,
  program_id         uuid references programs (id) on delete set null,
  status             lead_status not null default 'new',
  mindbody_client_id text,
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_leads_status on leads (status);
create trigger trg_leads_updated before update on leads
  for each row execute function set_updated_at();
alter table leads enable row level security;
create policy "leads: staff all" on leads
  for all using (is_staff()) with check (is_staff());

-- ---------- MÉTRICAS PARA EL DASHBOARD ----------
-- Funnel por campaña: trials iniciados, conversiones a pago, revenue.
create or replace view v_campaign_funnel
with (security_invoker = on) as
select
  coalesce(a.utm_source, '(direct)')   as utm_source,
  coalesce(a.utm_campaign, '(none)')   as utm_campaign,
  count(distinct a.id)                                              as checkouts_iniciados,
  count(distinct s.id) filter (where s.trial_start is not null)     as trials_iniciados,
  count(distinct s.id) filter (where s.first_paid_at is not null)   as conversiones_pagas,
  count(distinct s.id) filter (where s.status = 'active')           as activas_hoy,
  coalesce(sum(i.amount_paid) filter (where i.status = 'paid'), 0)  as revenue_cents
from checkout_attributions a
left join subscriptions s on s.id = a.subscription_id
left join invoices i      on i.subscription_id = s.id
group by 1, 2;

-- Estado actual de la base de suscriptores
create or replace view v_subscription_summary
with (security_invoker = on) as
select
  count(*) filter (where status = 'trialing')                                    as en_trial,
  count(*) filter (where status = 'active')                                      as activas,
  count(*) filter (where status = 'past_due')                                    as past_due,
  count(*) filter (where status = 'canceled' and canceled_at > now() - interval '30 days') as bajas_30d,
  count(*) filter (where first_paid_at > now() - interval '30 days')             as conversiones_30d
from subscriptions;
