-- 0004_profiles_trigger.sql
-- Auto-provision a `profiles` row on first sign-in so a brand-new user
-- landing on /kudos doesn't hit an orphan-FK bug. Copies email; derives
-- display_name from raw_user_meta_data.full_name (Google OIDC) or email
-- local-part; copies avatar_url when present.
-- Plan.md §Database Schema > Triggers.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
