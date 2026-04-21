-- Careers — applications table + resume storage bucket.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  linkedin_url text,
  role text,                       -- optional free text
  message text,                    -- optional free text
  resume_storage_path text,        -- path within the `resumes` storage bucket
  resume_filename text,            -- original filename for display
  user_agent text,
  ip text,
  submitted_at timestamptz not null default now()
);

create index if not exists applications_email_idx on public.applications (email);
create index if not exists applications_submitted_at_idx on public.applications (submitted_at desc);

alter table public.applications enable row level security;
-- No policies = default deny for anon/authenticated; service-role bypasses RLS.

-- Private storage bucket for resumes. Service-role client uploads; nothing public.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;
