-- Phase 02 owner portal tables + schedule extensions

begin;

alter table if exists public.academy_class_schedule
  add column if not exists is_recurring boolean,
  add column if not exists start_date date;

alter table if exists public.academy_class_schedule
  alter column is_recurring set default true;

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

alter table if exists public.class_checkins
  add column if not exists id uuid,
  add column if not exists academy_id uuid,
  add column if not exists class_id uuid,
  add column if not exists student_id uuid,
  add column if not exists status text,
  add column if not exists validated_by uuid,
  add column if not exists validated_at timestamptz,
  add column if not exists created_at timestamptz;

alter table if exists public.class_checkins
  alter column created_at set default now(),
  alter column status set default 'pending';

create index if not exists idx_checkins_academy_status
  on public.class_checkins(academy_id, status);
create index if not exists idx_checkins_student
  on public.class_checkins(student_id, created_at);

create table if not exists public.student_progress (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  academy_id uuid not null references public.academies(id) on delete cascade,
  approved_classes_count int not null default 0,
  updated_at timestamptz default now()
);

alter table if exists public.student_progress
  add column if not exists student_id uuid,
  add column if not exists academy_id uuid,
  add column if not exists approved_classes_count int,
  add column if not exists updated_at timestamptz;

alter table if exists public.student_progress
  alter column approved_classes_count set default 0,
  alter column updated_at set default now();

create index if not exists idx_student_progress_academy
  on public.student_progress(academy_id);

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
