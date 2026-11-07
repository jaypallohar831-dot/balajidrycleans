-- ============================================================
--  BALAJI DRY CLEANERS — ALL-IN-ONE DATABASE SETUP
--  Run this entire script once in:
--  Supabase Dashboard → SQL Editor → New Query → Run (Ctrl+Enter)
-- ============================================================

-- ── 0. Extensions ───────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "moddatetime";

-- ── Helper function for updated_at timestamps ──────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════
--  1. INQUIRIES (Contact & WhatsApp inquiries)
-- ═══════════════════════════════════════════════════════════
create table if not exists public.inquiries (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  updated_at   timestamptz             default now(),
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

create index if not exists idx_inquiries_status     on public.inquiries (status);
create index if not exists idx_inquiries_created_at on public.inquiries (created_at desc);
create index if not exists idx_inquiries_phone      on public.inquiries (phone);

alter table public.inquiries enable row level security;

create policy "anon_insert_inquiries"
  on public.inquiries for insert
  to anon
  with check (true);

create policy "admin_all_inquiries"
  on public.inquiries for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
--  2. BOOKINGS (Pickup Booking Form)
-- ═══════════════════════════════════════════════════════════
create sequence if not exists public.booking_code_seq start 1000 increment 1;

create table if not exists public.bookings (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  updated_at    timestamptz             default now(),
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

create index if not exists idx_bookings_status       on public.bookings (status);
create index if not exists idx_bookings_pickup_date  on public.bookings (pickup_date);
create index if not exists idx_bookings_created_at   on public.bookings (created_at desc);
create index if not exists idx_bookings_phone        on public.bookings (phone);
create index if not exists idx_bookings_booking_code on public.bookings (booking_code);

alter table public.bookings enable row level security;

create policy "anon_insert_bookings"
  on public.bookings for insert
  to anon
  with check (true);

create policy "admin_all_bookings"
  on public.bookings for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
--  3. PAGE_VIEWS (Lightweight analytics)
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

create index if not exists idx_page_views_path       on public.page_views (path);
create index if not exists idx_page_views_created_at on public.page_views (created_at desc);

alter table public.page_views enable row level security;

create policy "anon_insert_page_views"
  on public.page_views for insert
  to anon
  with check (true);

-- ═══════════════════════════════════════════════════════════
--  4. RATE_LIMITS (Anti-Spam Sliding Window)
-- ═══════════════════════════════════════════════════════════
create table if not exists public.rate_limits (
  id          uuid        primary key default gen_random_uuid(),
  key         text        not null,
  endpoint    text        not null,
  timestamp   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists idx_rate_limits_key_window
  on public.rate_limits (key, endpoint, timestamp desc);

alter table public.rate_limits enable row level security;

-- ═══════════════════════════════════════════════════════════
--  5. NOTIFICATION_LOGS (Audit Trail)
-- ═══════════════════════════════════════════════════════════
create table if not exists public.notification_logs (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  booking_id  uuid        references public.bookings(id) on delete set null,
  channel     text        not null,
  recipient   text        not null,
  status      text        not null check (status in ('sent', 'failed', 'skipped', 'retried')),
  error       text,
  meta        jsonb
);

create index if not exists idx_notification_logs_booking_id on public.notification_logs (booking_id);
create index if not exists idx_notification_logs_created_at on public.notification_logs (created_at desc);

alter table public.notification_logs enable row level security;

create policy "admin_all_notification_logs"
  on public.notification_logs for all
  to authenticated
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════════
--  6. BOOKING STATUS HISTORY
-- ═══════════════════════════════════════════════════════════
create table if not exists public.booking_status_history (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status   text        not null,
  note        text,
  changed_by  text        not null default 'admin',
  created_at  timestamptz not null default now()
);

create index if not exists idx_bsh_booking_id on public.booking_status_history (booking_id);
create index if not exists idx_bsh_created_at on public.booking_status_history (created_at desc);

alter table public.booking_status_history enable row level security;

create policy "admin_all_booking_status_history"
  on public.booking_status_history for all
  to authenticated
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════════════════
--  7. DYNAMIC SERVICES TABLE
-- ═══════════════════════════════════════════════════════════
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

create index if not exists idx_services_order on public.services (display_order, is_active);

alter table public.services enable row level security;

create policy "anon_read_active_services"
  on public.services for select
  to anon
  using (is_active = true);

create policy "admin_all_services"
  on public.services for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

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

-- ═══════════════════════════════════════════════════════════
--  8. WORK SHOWCASE (HAMARA KAAM / PORTFOLIO)
-- ═══════════════════════════════════════════════════════════
create table if not exists public.works (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  category      text        not null default 'General',
  description   text        not null,
  before_image  text,
  after_image   text        not null,
  tags          text[]      default '{}',
  tag_text      text,
  customer_note text,
  is_featured   boolean     not null default false,
  is_active     boolean     not null default true,
  display_order integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ensure all columns exist if table already existed previously
alter table public.works add column if not exists display_order integer not null default 0;
alter table public.works add column if not exists is_active boolean not null default true;
alter table public.works add column if not exists is_featured boolean not null default false;
alter table public.works add column if not exists tag_text text;
alter table public.works add column if not exists customer_note text;
alter table public.works add column if not exists tags text[] default '{}';
alter table public.works add column if not exists before_image text;
alter table public.works add column if not exists after_image text;
alter table public.works add column if not exists category text not null default 'General';

create index if not exists idx_works_order on public.works (display_order, is_active);
create index if not exists idx_works_category on public.works (category);

alter table public.works enable row level security;

create policy "anon_read_active_works"
  on public.works for select
  to anon
  using (is_active = true);

create policy "admin_all_works"
  on public.works for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists set_works_updated_at on public.works;
create trigger set_works_updated_at
  before update on public.works
  for each row execute function public.handle_updated_at();

insert into public.works (
  title, category, description, before_image, after_image, tag_text, customer_note, is_featured, is_active, display_order
)
values
  (
    'Bridal Silk Lehenga Zari & Spot Care',
    'Saree & Lehenga',
    'Shaadi ke baad haldi aur mehendi ke daag safe eco-solvent spotting se 100% remove kiye gaye, gota-patti aur zari ki original shine restore hui.',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    '100% Zari Safe · Haldi Daag Clean',
    'Bhilwara mein sabse safe bridal lehenga cleaning!',
    true,
    true,
    1
  ),
  (
    'Groom Designer Sherwani & Stole Finishing',
    'Wedding Wear',
    'Delicate embroidery aur velvet work par special dry solvent clean kiya gaya aur Italian steam mannequin par crisp shape diya.',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'Steam Iron Finish · Zero Shrink',
    'Shaadi ke din bilkul showroom jaisa fresh look mila.',
    true,
    true,
    2
  ),
  (
    'Pure Woolen Blazer & Coat Lint Restoration',
    'Winter Care',
    'Thand ke mausam mein lint, odour aur dust remove karke fabric soft conditioner treatment diya gaya.',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    'Lint-Free · Woolmark Approved',
    'Puraani coat bilkul nayi jaisi mulayam ho gayi.',
    true,
    true,
    3
  ),
  (
    'Double Bed Mink Blanket Deep Hygiene Wash',
    'Rajai & Kambal',
    'Heavy kambal ki anti-bacterial hygiene wash aur vacuum packaging, taaki agle season tak khushbudar aur safe rahe.',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    'Anti-Bacterial · Vacuum Pack',
    'Ghar par wash karna mushkil tha, Balaji ne bohot badhiya safai ki.',
    false,
    true,
    4
  ),
  (
    'White Formal Shirt Tea & Ink Stain Removal',
    'Stain Removal',
    'Collar par chai aur pen ki ink ka ziddi daag specialised spotting reagent se bina fabric kamzor kiye mitaya.',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    'Spotting Specialist · Daag Mukt',
    'Daag bilkul gayab ho gaya!',
    true,
    true,
    5
  );

-- ═══════════════════════════════════════════════════════════
--  9. STORAGE BUCKET (For Work Images)
-- ═══════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('works', 'works', true)
on conflict (id) do update set public = true;

create policy "Public Access to Works"
  on storage.objects for select
  to anon
  using (bucket_id = 'works');

create policy "Admin Upload to Works"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'works');

create policy "Admin Delete from Works"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'works');
