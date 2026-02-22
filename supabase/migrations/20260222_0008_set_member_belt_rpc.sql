-- Secure belt/degree updates for students by academy management (owner/professor).

begin;

create or replace function public.set_member_belt(
  p_profile_id uuid,
  p_belt public.belt_rank,
  p_degree integer
)
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed boolean;
begin
  if p_profile_id is null then
    raise exception 'profile_required';
  end if;

  if p_degree is null then
    raise exception 'degree_required';
  end if;

  select exists (
    select 1
    from public.academies a
    where (
      a.owner_id = auth.uid()
      or exists (
        select 1
        from public.academy_members me
        where me.academy_id = a.id
          and me.user_id = auth.uid()
          and me.role::text in ('owner', 'instructor', 'professor')
      )
      or exists (
        select 1
        from public.academy_staff s
        where s.academy_id = a.id
          and s.user_id = auth.uid()
          and s.role::text in ('owner', 'professor')
      )
    )
    and exists (
      select 1
      from public.academy_members target
      where target.academy_id = a.id
        and target.user_id = p_profile_id
        and target.role::text = 'student'
    )
  ) into v_allowed;

  if not coalesce(v_allowed, false) then
    raise exception 'not_allowed';
  end if;

  return query
  update public.profiles
  set belt = p_belt,
      belt_degree = p_degree,
      updated_at = now()
  where id = p_profile_id
  returning *;
end;
$$;

revoke all on function public.set_member_belt(uuid, public.belt_rank, integer) from anon;
revoke all on function public.set_member_belt(uuid, public.belt_rank, integer) from public;
grant execute on function public.set_member_belt(uuid, public.belt_rank, integer) to authenticated;

commit;
