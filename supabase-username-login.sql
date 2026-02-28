-- Enable username -> email lookup for login (used by client RPC call: lookup_login_email)
-- Run once in Supabase SQL Editor.

create or replace function public.lookup_login_email(p_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  select u.email
  into v_email
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where lower(p.username) = lower(trim(p_username))
  limit 1;

  return v_email;
end;
$$;

revoke all on function public.lookup_login_email(text) from public;
grant execute on function public.lookup_login_email(text) to anon, authenticated;
