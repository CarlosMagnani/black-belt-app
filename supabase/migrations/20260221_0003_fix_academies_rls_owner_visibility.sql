-- Ensure academy owners can read their academy row immediately after insert (RETURNING / select).

create or replace function public.is_member_of_academy(p_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.academies a
    where a.id = p_academy_id
      and a.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.academy_members am
    where am.academy_id = p_academy_id
      and am.user_id = auth.uid()
  );
$$;

create or replace function public.is_owner_of_academy(p_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.academies a
    where a.id = p_academy_id
      and a.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.academy_members am
    where am.academy_id = p_academy_id
      and am.user_id = auth.uid()
      and am.role = 'owner'
  );
$$;
