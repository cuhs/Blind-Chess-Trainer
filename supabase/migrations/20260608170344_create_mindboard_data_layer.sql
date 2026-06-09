create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  global_elo_handicap integer not null default 1200,
  current_streak integer not null default 0 check (current_streak >= 0),
  last_active_date date,
  total_fog_cleared numeric not null default 0 check (total_fog_cleared >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.heatmap_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  origin_square text check (origin_square is null or origin_square ~ '^[a-h][1-8]$'),
  target_square text check (target_square is null or target_square ~ '^[a-h][1-8]$'),
  is_success boolean not null,
  interaction_type text not null check (interaction_type in ('puzzle', 'match_peek')),
  created_at timestamptz not null default now(),
  constraint heatmap_ledger_target_required
    check (interaction_type <> 'puzzle' or target_square is not null)
);

create table if not exists public.puzzle_bank (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  fen text not null,
  motif_json jsonb not null default '{}'::jsonb,
  nlp_prompt text not null,
  input_placeholder text,
  subtitle text,
  answer_square text not null check (answer_square ~ '^[a-h][1-8]$'),
  answer_type text not null default 'square' check (answer_type in ('square', 'yes-no')),
  expected_answer text not null,
  moves jsonb not null default '[]'::jsonb check (jsonb_typeof(moves) = 'array'),
  squares_touched jsonb not null default '[]'::jsonb check (jsonb_typeof(squares_touched) = 'array'),
  source text not null default 'daily' check (source in ('daily', 'peek')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_last_active_idx
  on public.profiles (last_active_date desc);

create index if not exists heatmap_ledger_user_created_idx
  on public.heatmap_ledger (user_id, created_at desc);

create index if not exists heatmap_ledger_user_target_idx
  on public.heatmap_ledger (user_id, target_square)
  where target_square is not null;

create index if not exists puzzle_bank_active_created_idx
  on public.puzzle_bank (created_at, slug)
  where is_active;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

create trigger puzzle_bank_set_updated_at
  before update on public.puzzle_bank
  for each row
  execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.heatmap_ledger enable row level security;
alter table public.puzzle_bank enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Ledger rows are readable by owner"
  on public.heatmap_ledger
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Ledger rows are insertable by owner"
  on public.heatmap_ledger
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Active puzzles are readable"
  on public.puzzle_bank
  for select
  to authenticated
  using (is_active);

create or replace function public.get_heatmap_counts()
returns table(target_square text, interactions bigint)
language sql
stable
set search_path = ''
as $$
  select
    ledger.target_square,
    count(*) filter (where ledger.is_success) as interactions
  from public.heatmap_ledger as ledger
  where ledger.user_id = (select auth.uid())
    and ledger.target_square is not null
  group by ledger.target_square;
$$;

grant usage on schema public to anon, authenticated;
grant usage on schema private to postgres, service_role;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.heatmap_ledger to authenticated;
grant select on public.puzzle_bank to authenticated;
grant execute on function public.get_heatmap_counts() to authenticated;
