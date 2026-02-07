-- Align Supabase DB schema to app code expectations

begin;

-- profiles: add missing fields
alter table if exists public.profiles
  add column if not exists sex text;

-- academy_class_schedule: add recurrence fields
alter table if exists public.academy_class_schedule
  add column if not exists is_recurring boolean,
  add column if not exists start_date date;

alter table if exists public.academy_class_schedule
  alter column is_recurring set default true;

-- class_checkins table
create table if not exists public.class_checkins (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  class_id uuid not null references public.academy_class_schedule(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_checkins_academy_status
  on public.class_checkins(academy_id, status);
create index if not exists idx_checkins_student
  on public.class_checkins(student_id, created_at);

-- student_progress table
create table if not exists public.student_progress (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  academy_id uuid not null references public.academies(id) on delete cascade,
  approved_classes_count int not null default 0,
  updated_at timestamptz default now()
);

create index if not exists idx_student_progress_academy
  on public.student_progress(academy_id);

-- RLS policies: ensure parity with app expectations
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

alter table public.class_checkins enable row level security;

drop policy if exists checkins_select_own on public.class_checkins;
create policy checkins_select_own
  on public.class_checkins for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists checkins_select_owner on public.class_checkins;
create policy checkins_select_owner
  on public.class_checkins for select
  to authenticated
  using (
    exists (
      select 1
      from public.academies a
      where a.id = class_checkins.academy_id
        and a.owner_id = auth.uid()
    )
  );

drop policy if exists checkins_insert_self on public.class_checkins;
create policy checkins_insert_self
  on public.class_checkins for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1
      from public.academy_members m
      where m.academy_id = class_checkins.academy_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists checkins_update_owner on public.class_checkins;
create policy checkins_update_owner
  on public.class_checkins for update
  to authenticated
  using (
    exists (
      select 1
      from public.academies a
      where a.id = class_checkins.academy_id
        and a.owner_id = auth.uid()
    )
  );

alter table public.student_progress enable row level security;

drop policy if exists progress_select_self on public.student_progress;
create policy progress_select_self
  on public.student_progress for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists progress_select_owner on public.student_progress;
create policy progress_select_owner
  on public.student_progress for select
  to authenticated
  using (
    exists (
      select 1
      from public.academies a
      where a.id = student_progress.academy_id
        and a.owner_id = auth.uid()
    )
  );

drop policy if exists progress_write_owner on public.student_progress;
create policy progress_write_owner
  on public.student_progress for all
  to authenticated
  using (
    exists (
      select 1
      from public.academies a
      where a.id = student_progress.academy_id
        and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.academies a
      where a.id = student_progress.academy_id
        and a.owner_id = auth.uid()
    )
  );

commit;
