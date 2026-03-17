-- =============================================
-- SCHEMA V2: Perfiles, Amigos, Ánimos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Tabla de perfiles de usuario
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text default '',
  plan_start_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Permitir leer perfiles de amigos
create policy "Friends can view profiles"
  on profiles for select
  using (true);

-- 2. Tabla de códigos de invitación
create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  code text not null unique,
  created_at timestamptz default now()
);

alter table invite_codes enable row level security;

create policy "Users manage own invite code"
  on invite_codes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read invite codes"
  on invite_codes for select
  using (true);

-- 3. Tabla de amistades
create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  friend_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

alter table friendships enable row level security;

create policy "Users manage own friendships"
  on friendships for all
  using (auth.uid() = user_id or auth.uid() = friend_id)
  with check (auth.uid() = user_id or auth.uid() = friend_id);

-- 4. Tabla de ánimos
create table if not exists encouragements (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users(id) on delete cascade not null,
  to_user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table encouragements enable row level security;

create policy "Users manage encouragements"
  on encouragements for all
  using (auth.uid() = from_user_id or auth.uid() = to_user_id)
  with check (auth.uid() = from_user_id);

-- 5. Columna share_token (si no fue agregada antes)
alter table journal_entries
  add column if not exists share_token text unique;

-- 6. Política para ver entradas compartidas (si no existe)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'journal_entries'
    and policyname = 'Anyone can view shared entries'
  ) then
    execute 'create policy "Anyone can view shared entries"
      on journal_entries for select
      using (share_token is not null)';
  end if;
end $$;

-- 7. Storage bucket para notas de voz
-- Ejecutar esto manualmente en Storage > New bucket:
-- Nombre: voice-notes, Private: true
-- O ejecutar:
insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', false)
on conflict (id) do nothing;

create policy "Users manage own voice notes"
  on storage.objects for all
  using (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
