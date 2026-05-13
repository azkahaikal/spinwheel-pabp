-- ============================================================
--  Supabase SQL migration
--  Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. spin_sessions table
--    Replaces base44 entity: SpinSession
-- ------------------------------------------------------------
create table if not exists public.spin_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  type          text not null,                -- 'normal' | 'weighted' | 'double' | 'truth_or_dare'
  title         text,
  options       jsonb,                        -- array of { label, weight? }
  result        text,
  result_secondary text,
  created_at    timestamptz default now()
);

-- Index for the list() query (order by created_at desc)
create index if not exists spin_sessions_user_created
  on public.spin_sessions (user_id, created_at desc);

-- Row-level security: users only see their own sessions
alter table public.spin_sessions enable row level security;

create policy "Users manage their own spin sessions"
  on public.spin_sessions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 2. rooms table
--    Replaces base44 entity: Room
-- ------------------------------------------------------------
create table if not exists public.rooms (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique,
  status        text not null default 'waiting',  -- 'waiting' | 'spinning' | 'finished'
  options       jsonb default '[]',
  participants  jsonb default '[]',               -- array of { email, name }
  host_email    text,
  result        text,
  created_at    timestamptz default now()
);

-- Index for list() queries
create index if not exists rooms_created
  on public.rooms (created_at desc);

-- Row-level security: any authenticated user can read rooms;
-- only the host (matched by email) can update/delete.
alter table public.rooms enable row level security;

create policy "Authenticated users can read rooms"
  on public.rooms
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create rooms"
  on public.rooms
  for insert
  with check (auth.role() = 'authenticated');

create policy "Anyone authenticated can update rooms (join, add options, spin)"
  on public.rooms
  for update
  using (auth.role() = 'authenticated');

create policy "Host can delete their room"
  on public.rooms
  for delete
  using (host_email = auth.jwt() ->> 'email');


-- 3. Enable Realtime for the rooms table
--    (required for Room.subscribe() to work)
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.rooms;
