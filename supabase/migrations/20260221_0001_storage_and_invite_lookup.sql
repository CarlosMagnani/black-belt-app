-- Restore invite-code lookup RPC and add academy logo storage bucket/policies.

begin;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'academy-logos',
  'academy-logos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists academy_logos_public_read on storage.objects;
create policy academy_logos_public_read
on storage.objects
for select
to public
using (bucket_id = 'academy-logos');

drop policy if exists academy_logos_user_insert on storage.objects;
create policy academy_logos_user_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'academy-logos'
  and name like auth.uid()::text || '/%'
);

drop policy if exists academy_logos_user_update on storage.objects;
create policy academy_logos_user_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'academy-logos'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'academy-logos'
  and name like auth.uid()::text || '/%'
);

drop policy if exists academy_logos_user_delete on storage.objects;
create policy academy_logos_user_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'academy-logos'
  and name like auth.uid()::text || '/%'
);

commit;
