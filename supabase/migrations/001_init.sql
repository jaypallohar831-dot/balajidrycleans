-- ============================================================
--  Balaji Dry Cleaners  ·  001_init.sql
--  Run once in: Supabase Dashboard → SQL Editor → New Query
--  Or via CLI:  npx supabase db push
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "moddatetime"; -- auto-update updated_at

-- ═══════════════════════════════════════════════════════════
--  1. INQUIRIES  (contact-form / WhatsApp enquiries)
-- ═══════════════════════════════════════════════════════════
create table if not exists public.inquiries (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  name         text        not null,
  phone        text        not null,
  message      text,
  source       text        not null    default 'website',
  status       text        not null    default 'new'
                           check (status in ('new', 'contacted', 'closed')),
  utm_source   text,
  utm_campaign text,
  ip_hash      text,
  user_agent   text
);

comment on table public.inquiries is 'Contact-form and WhatsApp enquiry submissions';

-- Indexes
create index if not exists idx_inquiries_status     on public.inquiries (status);
create index if not exists idx_inquiries_created_at on public.inquiries (created_at desc);
create index if not exists idx_inquiries_phone      on public.inquiries (phone);

-- ═══════════════════════════════════════════════════════════
--  2. BOOKINGS  (pickup-booking form)
-- ═══════════════════════════════════════════════════════════

-- Sequence for human-readable booking codes: BDC-0001, BDC-0002, …
create sequence if not exists public.booking_code_seq start 1 increment 1;

create table if not exists public.bookings (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  booking_code  text        not null    unique
                            default ('BDC-' || lpad(nextval('public.booking_code_seq')::text, 4, '0')),
  name          text        not null,
  phone         text        not null,
  service       text        not null,
  pickup_slot   text        not null
                            check (pickup_slot in ('subah', 'dopahar', 'shaam')),
  pickup_date   date        not null,
  address       text        not null,
  status        text        not null    default 'pending'
                            check (status in (
                              'pending', 'confirmed', 'picked_up', 'delivered', 'cancelled'
                            )),
  notes         text,
  utm_source    text,
  utm_campaign  text
);

comment on table public.bookings is 'Pickup booking requests from the website form';

-- Indexes
create index if not exists idx_bookings_status       on public.bookings (status);
create index if not exists idx_bookings_pickup_date  on public.bookings (pickup_date);
create index if not exists idx_bookings_created_at   on public.bookings (created_at desc);
create index if not exists idx_bookings_phone        on public.bookings (phone);
create index if not exists idx_bookings_booking_code on public.bookings (booking_code);

-- ═══════════════════════════════════════════════════════════
--  3. PAGE_VIEWS  (lightweight self-hosted analytics)
-- ═══════════════════════════════════════════════════════════
create table if not exists public.page_views (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  path         text        not null,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  device       text,
  ip_hash      text
);

comment on table public.page_views is 'Lightweight, anonymous page-view analytics';

-- Indexes
create index if not exists idx_page_views_path       on public.page_views (path);
create index if not exists idx_page_views_created_at on public.page_views (created_at desc);

-- ═══════════════════════════════════════════════════════════
--  4. UPDATED_AT TRIGGER  (auto-touch on row update)
-- ═══════════════════════════════════════════════════════════

-- Add an updated_at column to tables that need it
alter table public.inquiries add column if not exists updated_at timestamptz default now();
alter table public.bookings  add column if not exists updated_at timestamptz default now();

-- Generic trigger function using moddatetime
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach triggers
drop trigger if exists set_updated_at on public.inquiries;
create trigger set_updated_at
  before update on public.inquiries
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.bookings;
create trigger set_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
--  5. ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.inquiries  enable row level security;
alter table public.bookings   enable row level security;
alter table public.page_views enable row level security;

-- ── inquiries ─────────────────────────────────────────────
-- Anon users can INSERT (submit the form) but cannot read/update/delete.
create policy "anon_insert_inquiries"
  on public.inquiries for insert
  to anon
  with check (true);

-- Service role (server-side) has full access by default — no policy needed.
-- Authenticated admins can read all inquiries.
create policy "admin_read_inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

-- Authenticated admins can update status.
create policy "admin_update_inquiries"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);

-- ── bookings ──────────────────────────────────────────────
-- Anon users can INSERT (book a pickup).
create policy "anon_insert_bookings"
  on public.bookings for insert
  to anon
  with check (true);

-- Authenticated admins can read all bookings.
create policy "admin_read_bookings"
  on public.bookings for select
  to authenticated
  using (true);

-- Authenticated admins can update booking status.
create policy "admin_update_bookings"
  on public.bookings for update
  to authenticated
  using (true)
  with check (true);

-- ── page_views ────────────────────────────────────────────
-- Anon users can INSERT (log a page view).
create policy "anon_insert_page_views"
  on public.page_views for insert
  to anon
  with check (true);

-- Authenticated admins can read analytics.
create policy "admin_read_page_views"
  on public.page_views for select
  to authenticated
  using (true);

-- ═══════════════════════════════════════════════════════════
--  6. DAILY STATS VIEW (optional, read-only convenience)
-- ═══════════════════════════════════════════════════════════
create or replace view public.daily_stats as
select
  date_trunc('day', created_at)::date as day,
  count(*) filter (where true)         as total_views,
  count(distinct ip_hash)              as unique_visitors
from public.page_views
group by 1
order by 1 desc;

-- ═══════════════════════════════════════════════════════════
--  Done! ✅
-- ═══════════════════════════════════════════════════════════
