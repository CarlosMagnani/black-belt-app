-- Phase 03: academy staff + professor logic + instructor RLS

begin;

do $$
begin
  create type public.academy_staff_role as enum ('owner', 'professor');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.academy_staff (
  academy_id uuid not null references public.academies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.academy_staff_role not null,
  created_at timestamptz not null default now(),
  primary key (academy_id, user_id)
);

-- Backfill owner staff rows for academies that already exist
insert into public.academy_staff (academy_id, user_id, role)
select a.id, a.owner_id, 'owner'
from public.academies a
on conflict (academy_id, user_id) do nothing;

-- Trigger: ensure owner is always in staff on academy creation
create or replace function public.academy_staff_add_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.academy_staff (academy_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (academy_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists tr_academy_staff_add_owner on public.academies;
create trigger tr_academy_staff_add_owner
after insert on public.academies
for each row execute function public.academy_staff_add_owner();

-- Ensure schedule has instructor_id (app expects this)
alter table if exists public.academy_class_schedule
  add column if not exists instructor_id uuid references public.profiles(id) on delete set null;

-- Staff RLS
alter table public.academy_staff enable row level security;

drop policy if exists staff_select_owner on public.academy_staff;
create policy staff_select_owner
  on public.academy_staff for select
  to authenticated
  using (
    exists (
      select 1 from public.academies a
      where a.id = academy_staff.academy_id
        and a.owner_id = auth.uid()
    )
  );

drop policy if exists staff_select_self on public.academy_staff;
create policy staff_select_self
  on public.academy_staff for select
  to authenticated
  using (user_id = auth.uid());

-- Only owner can delete professor rows (owner row is protected)
drop policy if exists staff_delete_owner_professor on public.academy_staff;
create policy staff_delete_owner_professor
  on public.academy_staff for delete
  to authenticated
  using (
    role = 'professor'
    and exists (
      select 1 from public.academies a
      where a.id = academy_staff.academy_id
        and a.owner_id = auth.uid()
    )
  );

-- RPC used by the app to add professors by email
create or replace function public.add_professor_to_academy(p_academy_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Only academy owner can add staff
  if not exists (
    select 1 from public.academies a
    where a.id = p_academy_id and a.owner_id = auth.uid()
  ) then
    raise exception 'not_allowed';
  end if;

  select id into v_user_id
  from public.profiles
  where lower(email) = lower(p_email)
  limit 1;

  if v_user_id is null then
    raise exception 'user_not_found';
  end if;

  insert into public.academy_staff (academy_id, user_id, role)
  values (p_academy_id, v_user_id, 'professor')
  on conflict (academy_id, user_id) do nothing;
end;
$$;

-- Extend schedule select policy to allow staff too
drop policy if exists schedule_select_member_or_owner on public.academy_class_schedule;
create policy schedule_select_member_staff_or_owner
  on public.academy_class_schedule for select
  to authenticated
  using (
    exists (select 1 from public.academies a where a.id = academy_class_schedule.academy_id and a.owner_id = auth.uid())
    or exists (select 1 from public.academy_members m where m.academy_id = academy_class_schedule.academy_id and m.user_id = auth.uid())
    or exists (select 1 from public.academy_staff s where s.academy_id = academy_class_schedule.academy_id and s.user_id = auth.uid())
  );

-- Professors can see pending check-ins for their classes (RLS filters results)
drop policy if exists checkins_select_instructor on public.class_checkins;
create policy checkins_select_instructor
  on public.class_checkins for select
  to authenticated
  using (
    exists (
      select 1
      from public.academy_class_schedule c
      join public.academy_staff s
        on s.academy_id = c.academy_id
       and s.user_id = auth.uid()
      where c.id = class_checkins.class_id
        and c.instructor_id = auth.uid()
        and s.role in ('owner','professor')
    )
  );

drop policy if exists checkins_update_instructor on public.class_checkins;
create policy checkins_update_instructor
  on public.class_checkins for update
  to authenticated
  using (
    exists (
      select 1
      from public.academy_class_schedule c
      join public.academy_staff s
        on s.academy_id = c.academy_id
       and s.user_id = auth.uid()
      where c.id = class_checkins.class_id
        and c.instructor_id = auth.uid()
        and s.role in ('owner','professor')
    )
  )
  with check (validated_by = auth.uid());

commit;

