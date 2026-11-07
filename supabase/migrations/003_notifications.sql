-- ============================================================
--  003_notifications.sql — Notification Audit Logs
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.notification_logs (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null    default now(),
  type       text        not null,   -- 'email_owner' | 'whatsapp_owner' | 'email_customer'
  target     text        not null,   -- recipient email or phone
  status     text        not null    check (status in ('sent', 'failed', 'skipped')),
  error      text,                   -- error message if failed
  metadata   jsonb                   -- payload summary or response info
);

comment on table public.notification_logs is 'Audit trail of all email and WhatsApp dispatch attempts';

-- Fast lookup indexes
create index if not exists idx_notification_logs_created_at
  on public.notification_logs (created_at desc);

create index if not exists idx_notification_logs_status
  on public.notification_logs (status);

create index if not exists idx_notification_logs_type
  on public.notification_logs (type);

-- RLS: Only service-role can read/write logs
alter table public.notification_logs enable row level security;

-- Authenticated admins can view notification logs
create policy "admin_read_notification_logs"
  on public.notification_logs for select
  to authenticated
  using (true);
