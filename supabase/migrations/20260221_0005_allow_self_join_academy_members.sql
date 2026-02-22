-- Allow students to join academies themselves using invite code flow.

drop policy if exists academy_members_insert_self on public.academy_members;

create policy academy_members_insert_self
on public.academy_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'student'
);
