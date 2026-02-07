-- Add sex field to profiles table
-- Values: M (Male), F (Female), O (Other), N (Not specified)

begin;

alter table public.profiles
  add column if not exists sex char(1) check (sex in ('M', 'F', 'O', 'N'));

comment on column public.profiles.sex is 'User sex: M=Male, F=Female, O=Other, N=Not specified';

commit;
