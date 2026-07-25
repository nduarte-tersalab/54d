-- Observabilidad del sync de leads → Mindbody (aplicada 25/07/2026)
alter table leads
  add column if not exists mindbody_sync_error text,
  add column if not exists mindbody_synced_at timestamptz;
