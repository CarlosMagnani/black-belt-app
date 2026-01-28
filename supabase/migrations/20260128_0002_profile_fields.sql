-- Phase 01: expand profiles with personal fields + belt degree

begin;

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists federation_number text,
  add column if not exists belt_degree int;

commit;
