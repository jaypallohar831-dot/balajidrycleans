-- ============================================================
--  005_works.sql — Work Showcase & Portfolio (Hamara Kaam)
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

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

comment on table public.works is 'Completed dry cleaning & laundry work showcase with before/after photos';

create index if not exists idx_works_order on public.works (display_order, is_active);
create index if not exists idx_works_category on public.works (category);

alter table public.works enable row level security;

-- Anonymous users can read active works
create policy "anon_read_active_works"
  on public.works for select
  to anon
  using (is_active = true);

-- Authenticated admins have full CRUD access
create policy "admin_all_works"
  on public.works for all
  to authenticated
  using (true)
  with check (true);

-- Updated_at trigger
drop trigger if exists set_works_updated_at on public.works;
create trigger set_works_updated_at
  before update on public.works
  for each row execute function public.handle_updated_at();

-- Seed high-quality initial showcase work samples
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

