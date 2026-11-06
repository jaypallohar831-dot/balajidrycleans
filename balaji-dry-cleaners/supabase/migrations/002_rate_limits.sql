-- ============================================================
--  002_rate_limits.sql — Rate-limiting table
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.rate_limits (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null    default now(),
  ip_hash    text        not null,
  route_key  text        not null
);

comment on table public.rate_limits is 'IP-based rate limit tracking (auto-pruned)';

-- Fast lookups for the rate-limit check query
create index if not exists idx_rate_limits_lookup
  on public.rate_limits (ip_hash, route_key, created_at desc);

-- RLS: only service-role can access (no anon, no authenticated)
alter table public.rate_limits enable row level security;

-- No policies = only service-role key can read/write (bypasses RLS).

-- ── Auto-prune old entries (older than 15 minutes) ───────
-- Run this as a Supabase cron (pg_cron) or call periodically.
-- To set up in Supabase Dashboard → Database → Extensions → enable pg_cron,
-- then run:
--
--   select cron.schedule(
--     'prune-rate-limits',
--     '*/5 * * * *',
--     $$ delete from public.rate_limits where created_at < now() - interval '15 minutes' $$
--   );
