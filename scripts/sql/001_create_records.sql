-- create records table with strict RLS for per-user isolation
-- Enable pgcrypto if needed for gen_random_uuid(); Supabase usually has this enabled by default.
create extension if not exists pgcrypto;

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  filename text not null,
  hash text not null,
  url text not null,
  iv text not null,
  salt text not null,
  size bigint not null,
  created_at timestamptz not null default now()
);

-- RLS: on by default for secure access
alter table public.records enable row level security;

-- Policies: users can insert their own rows and read only their own rows
drop policy if exists "records_insert_own" on public.records;
create policy "records_insert_own"
on public.records
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "records_select_own" on public.records;
create policy "records_select_own"
on public.records
for select
to authenticated
using (auth.uid() = user_id);

-- Optional: add basic index for faster lookups by user/time
create index if not exists records_user_created_at_idx on public.records (user_id, created_at desc);
