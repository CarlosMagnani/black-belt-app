-- Allow profile reads for users that share an academy (owner/member), while preserving self access.

begin;

create or replace function public.can_read_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_profile_id = auth.uid()
    or exists (
      select 1
      from public.academies a
      where (
        a.owner_id = auth.uid()
        or exists (
          select 1
          from public.academy_members me
          where me.academy_id = a.id
            and me.user_id = auth.uid()
        )
      )
      and (
        a.owner_id = p_profile_id
        or exists (
          select 1
          from public.academy_members target
          where target.academy_id = a.id
            and target.user_id = p_profile_id
        )
      )
    );
$$;

revoke all on function public.can_read_profile(uuid) from anon;
revoke all on function public.can_read_profile(uuid) from public;
grant execute on function public.can_read_profile(uuid) to authenticated;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_same_academy on public.profiles;
drop policy if exists profiles_select_own on public.profiles;

create policy profiles_select_same_academy
  on public.profiles for select
  to authenticated
  using (public.can_read_profile(id));

commit;
