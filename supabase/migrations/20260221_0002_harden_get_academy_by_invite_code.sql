-- Keep function execution context deterministic for security linter compliance.

alter function public.get_academy_by_invite_code(text)
set search_path = public;
