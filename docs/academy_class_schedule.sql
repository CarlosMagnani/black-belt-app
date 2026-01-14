-- 0 = domingo, 1 = segunda, ..., 6 = sabado
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

  created_at timestamptz not null default now()
);

create index if not exists idx_schedule_academy_weekday
  on public.academy_class_schedule(academy_id, weekday);

alter table public.academy_class_schedule enable row level security;

create policy "schedule_select_member_or_owner"
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

create policy "schedule_write_owner_only"
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
