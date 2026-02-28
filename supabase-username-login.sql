-- Enable username -> email lookup for login (used by client RPC call: lookup_login_email)
-- Run once in Supabase SQL Editor.

create or replace function public.lookup_login_email(p_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_key text;
  v_count integer;
  v_email text;
begin
  v_key := lower(trim(coalesce(p_username, '')));
  if v_key = '' then
    return null;
  end if;

  -- Exact match first
  select u.email
  into v_email
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where lower(coalesce(p.username, '')) = v_key
     or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) = v_key
     or lower(split_part(coalesce(u.email, ''), '@', 1)) = v_key
  limit 1;

  if v_email is not null then
    return v_email;
  end if;

  -- If exact match fails, allow a unique prefix match for friendlier username login.
  select count(*)
  into v_count
  from (
    select u.id
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    where lower(coalesce(p.username, '')) like v_key || '%'
       or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) like v_key || '%'
       or lower(split_part(coalesce(u.email, ''), '@', 1)) like v_key || '%'
    limit 2
  ) candidates;

  if v_count = 1 then
    select u.email
    into v_email
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    where lower(coalesce(p.username, '')) like v_key || '%'
       or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) like v_key || '%'
       or lower(split_part(coalesce(u.email, ''), '@', 1)) like v_key || '%'
    limit 1;
  end if;

  return v_email;
end;
$$;

revoke all on function public.lookup_login_email(text) from public;
grant execute on function public.lookup_login_email(text) to anon, authenticated;
