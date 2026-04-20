-- Run this once in the Supabase SQL Editor after creating the project.
-- Bucket-less; we're using Postgres directly.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  company text,
  why text,
  tokens text,
  referrer text,
  source text,          -- auto-tagged: "dashboard" or "apps/<app-name>"
  user_agent text,
  ip text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_submitted_at_idx on public.leads (submitted_at desc);
create index if not exists leads_updated_at_idx on public.leads (updated_at desc);
create index if not exists leads_source_idx on public.leads (source);

alter table public.leads enable row level security;

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- =============================================================================
-- MIGRATION — if you already created the table with name/email NOT NULL, run:
-- =============================================================================
-- alter table public.leads alter column name drop not null;
-- alter table public.leads alter column email drop not null;
-- alter table public.leads add column if not exists updated_at timestamptz default now();
-- (then re-run the function + trigger above)

-- =============================================================================
-- Optional: let admin users read leads in Supabase Studio
-- =============================================================================
-- create policy "admin-read" on public.leads
--   for select
--   to authenticated
--   using (true);
