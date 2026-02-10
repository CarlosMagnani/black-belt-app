-- Phase 04: academy plans table + RLS

begin;

do $$
begin
  create type public.plan_periodicity as enum ('MENSAL','TRIMESTRAL','SEMESTRAL','ANUAL');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.academy_plans (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null check (price_cents > 0),
  periodicity public.plan_periodicity not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_academy_plans_academy_id on public.academy_plans(academy_id);
create index if not exists idx_academy_plans_active on public.academy_plans(academy_id, is_active);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_academy_plans_touch on public.academy_plans;
create trigger tr_academy_plans_touch
before update on public.academy_plans
for each row execute function public.touch_updated_at();

alter table public.academy_plans enable row level security;

-- Owner CRUD
drop policy if exists plans_write_owner_only on public.academy_plans;
create policy plans_write_owner_only
  on public.academy_plans for all
  to authenticated
  using (
    exists (select 1 from public.academies a where a.id = academy_plans.academy_id and a.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.academies a where a.id = academy_plans.academy_id and a.owner_id = auth.uid())
  );

-- Members can read active plans
drop policy if exists plans_select_member_active on public.academy_plans;
create policy plans_select_member_active
  on public.academy_plans for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.academy_members m
      where m.academy_id = academy_plans.academy_id
        and m.user_id = auth.uid()
    )
  );

commit;

