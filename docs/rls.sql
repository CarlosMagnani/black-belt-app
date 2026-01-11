alter table public.profiles enable row level security;
alter table public.academies enable row level security;
alter table public.academy_members enable row level security;

-- profiles: user can read/update own profile
create policy "profiles_read_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

-- academies: owner can CRUD
create policy "academies_owner_select"
on public.academies for select
using (auth.uid() = owner_id);

create policy "academies_owner_insert"
on public.academies for insert
with check (auth.uid() = owner_id);

create policy "academies_owner_update"
on public.academies for update
using (auth.uid() = owner_id);

create policy "academies_owner_delete"
on public.academies for delete
using (auth.uid() = owner_id);

-- academy_members:
-- - student can insert own membership
-- - owner can read members
create policy "members_insert_self"
on public.academy_members for insert
with check (auth.uid() = user_id);

create policy "members_select_owner_or_self"
on public.academy_members for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.academies a
    where a.id = academy_id and a.owner_id = auth.uid()
  )
);

-- recommended unique constraint for upsert
create unique index if not exists academy_members_unique
  on public.academy_members(academy_id, user_id);
