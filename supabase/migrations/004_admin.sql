-- ============================================================
--  004_admin.sql — Status History & Dynamic Services
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. BOOKING STATUS HISTORY ────────────────────────────────
create table if not exists public.booking_status_history (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status   text        not null,
  note        text,
  changed_by  text        not null default 'admin',
  created_at  timestamptz not null default now()
);

comment on table public.booking_status_history is 'Audit trail of every booking status transition';

create index if not exists idx_bsh_booking_id on public.booking_status_history (booking_id);
create index if not exists idx_bsh_created_at on public.booking_status_history (created_at desc);

alter table public.booking_status_history enable row level security;

create policy "admin_all_booking_status_history"
  on public.booking_status_history for all
  to authenticated
  using (true)
  with check (true);

-- ── 2. DYNAMIC SERVICES TABLE ────────────────────────────────
create table if not exists public.services (
  id            text        primary key,
  title         text        not null,
  description   text        not null,
  icon          text        not null default 'Sparkles',
  inquiry       text,
  display_order integer     not null default 0,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ensure all columns exist if table already existed previously
alter table public.services add column if not exists display_order integer not null default 0;
alter table public.services add column if not exists is_active boolean not null default true;
alter table public.services add column if not exists icon text not null default 'Sparkles';
alter table public.services add column if not exists inquiry text;

comment on table public.services is 'Manageable list of services offered by Balaji Dry Cleaners';

create index if not exists idx_services_order on public.services (display_order, is_active);

alter table public.services enable row level security;

-- Anon can read active services
create policy "anon_read_active_services"
  on public.services for select
  to anon
  using (is_active = true);

-- Authenticated admins can manage all services
create policy "admin_all_services"
  on public.services for all
  to authenticated
  using (true)
  with check (true);

-- Trigger for updated_at
drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

-- Seed default services from siteConfig
insert into public.services (id, title, description, icon, inquiry, display_order, is_active)
values
  ('suit-blazer-sherwani', 'Suit / Blazer / Sherwani', 'Formal aur wedding wear ki delicate solvent cleaning aur crisp steam finish.', 'Shirt', 'Namaste Balaji Dry Cleaners! Mujhe Suit / Blazer / Sherwani dry clean karwana hai.', 1, true),
  ('saree-lehenga-ghagra', 'Saree / Lehenga / Ghagra Choli', 'Silk, zari aur gota-patti wale designer kapdo ki gentle, safe dry cleaning.', 'Crown', 'Namaste Balaji Dry Cleaners! Mujhe Saree / Lehenga dry clean karwana hai.', 2, true),
  ('sweater-jacket-shawl', 'Sweater / Jacket / Shawl', 'Woolen aur leather garments ki bina shrink hue soft lint-free restoration.', 'Layers', 'Namaste Balaji Dry Cleaners! Mujhe Winter wear (Sweater/Jacket/Shawl) clean karwana hai.', 3, true),
  ('rajai-kambal-parde', 'Rajai / Kambal / Parde', 'Heavy blankets, quilts aur curtains ki deep germ-free hygiene wash aur packaging.', 'Home', 'Namaste Balaji Dry Cleaners! Mujhe Rajai / Kambal / Parde wash karwane hain.', 4, true),
  ('daily-wash-iron', 'Daily Wash and Iron', 'Rojana ke shirts, kurtas aur trousers ki fresh laundry aur wrinkle-free press.', 'WashingMachine', 'Namaste Balaji Dry Cleaners! Mujhe Daily Wash and Iron service chahiye.', 5, true),
  ('stain-removal', 'Stain Removal (Haldi, Tel, Chai, Ink)', 'Ziddi se ziddi daag-dhabbo par specialised treatment, kapde ke rang ko bachate hue.', 'Sparkles', 'Namaste Balaji Dry Cleaners! Mujhe ziddi daag (Haldi/Chai/Tel/Ink) hatwane hain.', 6, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  inquiry = excluded.inquiry;
