-- Foundation schema + RLS for DojoFlow (Phase 00)

begin;

create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum ('professor', 'student');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text,
  avatar_url text,
  current_belt text,
  created_at timestamptz default now()
);

alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists avatar_url text,
  add column if not exists current_belt text,
  add column if not exists created_at timestamptz;

alter table if exists public.profiles
  alter column created_at set default now(),
  alter column current_belt set default 'Branca';

create table if not exists public.academies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  city text,
  logo_url text,
  invite_code text not null unique,
  created_at timestamptz default now()
);

alter table if exists public.academies
  add column if not exists owner_id uuid,
  add column if not exists name text,
  add column if not exists city text,
  add column if not exists logo_url text,
  add column if not exists invite_code text,
  add column if not exists created_at timestamptz;

alter table if exists public.academies
  alter column created_at set default now();

create unique index if not exists idx_academies_invite_code
  on public.academies(invite_code);
create index if not exists idx_academies_owner_id
  on public.academies(owner_id);

create table if not exists public.academy_members (
  academy_id uuid not null references public.academies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now()
);

alter table if exists public.academy_members
  add column if not exists academy_id uuid,
  add column if not exists user_id uuid,
  add column if not exists joined_at timestamptz;

alter table if exists public.academy_members
  alter column joined_at set default now();

create unique index if not exists idx_members_academy_user
  on public.academy_members(academy_id, user_id);
create index if not exists idx_members_academy_id
  on public.academy_members(academy_id);
create index if not exists idx_members_user_id
  on public.academy_members(user_id);

create table if not exists public.academy_class_schedule (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  title text not null,
  instructor_name text,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  location text,
  level text,
  notes text,
  created_at timestamptz default now()
);

alter table if exists public.academy_class_schedule
  add column if not exists id uuid,
  add column if not exists academy_id uuid,
  add column if not exists title text,
  add column if not exists instructor_name text,
  add column if not exists weekday smallint,
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists location text,
  add column if not exists level text,
  add column if not exists notes text,
  add column if not exists created_at timestamptz;

alter table if exists public.academy_class_schedule
  alter column created_at set default now();

create index if not exists idx_schedule_academy_weekday
  on public.academy_class_schedule(academy_id, weekday);

create or replace function public.get_academy_by_invite_code(p_code text)
returns setof public.academies
language sql
stable
as $$
  select *
  from public.academies
  where invite_code = p_code;
$$;

alter table public.profiles enable row level security;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

alter table public.academies enable row level security;
drop policy if exists academies_select_authenticated on public.academies;
create policy academies_select_authenticated
  on public.academies for select
  to authenticated
  using (true);

drop policy if exists academies_insert_owner on public.academies;
create policy academies_insert_owner
  on public.academies for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists academies_update_owner on public.academies;
create policy academies_update_owner
  on public.academies for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

alter table public.academy_members enable row level security;
drop policy if exists members_select_self_or_owner on public.academy_members;
create policy members_select_self_or_owner
  on public.academy_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.academies a
      where a.id = academy_members.academy_id
        and a.owner_id = auth.uid()
    )
  );

drop policy if exists members_insert_self on public.academy_members;
create policy members_insert_self
  on public.academy_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.academies a where a.id = academy_id)
  );

alter table public.academy_class_schedule enable row level security;
drop policy if exists schedule_select_member_or_owner on public.academy_class_schedule;
create policy schedule_select_member_or_owner
  on public.academy_class_schedule for select
  to authenticated
  using (
    exists (
      select 1
      from public.academies a
      where a.id = academy_class_schedule.academy_id
        and a.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.academy_members m
      where m.academy_id = academy_class_schedule.academy_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists schedule_write_owner_only on public.academy_class_schedule;
create policy schedule_write_owner_only
  on public.academy_class_schedule for all
  to authenticated
  using (
    exists (
      select 1
      from public.academies a
      where a.id = academy_class_schedule.academy_id
        and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.academies a
      where a.id = academy_class_schedule.academy_id
        and a.owner_id = auth.uid()
    )
  );

commit;
