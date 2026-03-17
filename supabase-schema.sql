-- Crear tabla de entradas del diario
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  day_number integer not null check (day_number >= 1 and day_number <= 365),
  is_completed boolean default false,
  what_i_read text default '',
  what_god_said text default '',
  what_i_will_do text default '',
  prayer text default '',
  free_notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, day_number)
);

-- Habilitar Row Level Security
alter table journal_entries enable row level security;

-- Política: cada usuario solo puede ver y modificar sus propias entradas
create policy "Users can manage their own entries"
  on journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
