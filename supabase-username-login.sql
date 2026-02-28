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
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where lower(coalesce(p.username, '')) = lower(trim(p_username))
     or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) = lower(trim(p_username))
     or lower(split_part(coalesce(u.email, ''), '@', 1)) = lower(trim(p_username))
  limit 1;

  return v_email;
end;
$$;

revoke all on function public.lookup_login_email(text) from public;
grant execute on function public.lookup_login_email(text) to anon, authenticated;
