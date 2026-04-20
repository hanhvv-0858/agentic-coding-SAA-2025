-- 0009_backfill_profiles.sql
-- One-shot backfill: insert a `profiles` row for every `auth.users`
-- that doesn't already have one. The `on_auth_user_created` trigger
-- (migration 0004) only fires on future INSERTs, so any user whose
-- account predates the trigger — or signed in during a rollout race —
-- hits an FK violation when the app tries to write `kudo_hearts`,
-- `kudo_recipients`, `secret_boxes`, etc. against `profiles(id)`.
--
-- Idempotent: `ON CONFLICT DO NOTHING` means re-running this migration
-- is a no-op once every auth user has a profile row.

insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    split_part(coalesce(u.email, ''), '@', 1)
  ) as display_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and u.email is not null
on conflict (id) do nothing;

-- Self-insert RLS policy so the defensive `ensureProfile` upsert in
-- `toggleKudoHeart` (and future Server Actions facing the same orphan-
-- auth-user race) can run under the user session. Only the user's
-- own row is insertable — `auth.uid()` must match `id`.
create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid());
