-- Invite-code lookup must bypass member-only academies SELECT RLS for join flow.

create or replace function public.get_academy_by_invite_code(p_code text)
returns setof public.academies
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.academies
  where upper(replace(invite_code, '-', '')) = upper(replace(p_code, '-', ''))
  limit 1;
$$;

revoke all on function public.get_academy_by_invite_code(text) from anon;
revoke all on function public.get_academy_by_invite_code(text) from public;
grant execute on function public.get_academy_by_invite_code(text) to authenticated;
