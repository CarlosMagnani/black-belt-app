-- The academy existence check in policy depended on academies SELECT RLS and blocked valid joins.

drop policy if exists academy_members_insert_self on public.academy_members;

create policy academy_members_insert_self
on public.academy_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'student'
);
