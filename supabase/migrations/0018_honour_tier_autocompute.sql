-- 0018_honour_tier_autocompute.sql
-- Auto-compute `profiles.honour_title` from received-kudo activity.
-- Resolved 2026-04-22 in `/momorph.reviewspecify` — see spec section
-- "Honour tier auto-computation" in
-- `.momorph/specs/MaZUn5xHXZ-kudos-live-board/spec.md`.
--
-- Decisions:
--   Q1 distinct senders (not total kudos)
--   Q2 anonymous kudos count (sender privacy ≠ tier)
--   Q3 thresholds — New 1..4, Rising 5..9, Super 10..19, Legend ≥20
--   Q4 AFTER-INSERT trigger on kudo_recipients
--   Q5 one-time backfill at end of this migration
--   Q6 migration file 0018

-- 1. Pure tier-computation helper. STABLE: same inputs → same output
--    within a statement. Returns NULL when the user has zero recipients.
create or replace function compute_honour_tier(p_user_id uuid)
returns honour_title
language sql
stable
set search_path = public
as $$
  with counts as (
    select count(distinct k.sender_id) as distinct_senders
    from kudo_recipients kr
    join kudos k on k.id = kr.kudo_id
    where kr.recipient_id = p_user_id
  )
  select case
    when distinct_senders = 0 then null::honour_title
    when distinct_senders between 1 and 4 then 'New Hero'::honour_title
    when distinct_senders between 5 and 9 then 'Rising Hero'::honour_title
    when distinct_senders between 10 and 19 then 'Super Hero'::honour_title
    else 'Legend Hero'::honour_title
  end
  from counts;
$$;

revoke all on function compute_honour_tier(uuid) from public;
grant execute on function compute_honour_tier(uuid) to authenticated, service_role;

-- 2. Trigger function — recomputes the recipient's tier. Idempotent
--    UPDATE (IS DISTINCT FROM) avoids write churn on same-tier inserts.
--    SECURITY DEFINER so kudo senders can update the recipient's row
--    without granting direct UPDATE on profiles to `authenticated`.
create or replace function sync_recipient_honour()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tier honour_title;
begin
  new_tier := compute_honour_tier(new.recipient_id);
  update profiles
  set honour_title = new_tier
  where id = new.recipient_id
    and honour_title is distinct from new_tier;
  return new;
end;
$$;

revoke all on function sync_recipient_honour() from public;

-- 3. Wire the trigger. Drop-if-exists so the migration is idempotent.
drop trigger if exists trg_sync_recipient_honour on kudo_recipients;
create trigger trg_sync_recipient_honour
  after insert on kudo_recipients
  for each row
  execute function sync_recipient_honour();

-- 4. Backfill — one-shot UPDATE for all users with ≥1 recipient row.
--    Users with zero kudos are left with honour_title = null.
update profiles p
set honour_title = compute_honour_tier(p.id)
where exists (
  select 1 from kudo_recipients kr where kr.recipient_id = p.id
)
  and p.honour_title is distinct from compute_honour_tier(p.id);

-- 5. Force PostgREST to reload its schema cache so the function gains
--    a REST surface immediately (matches the migration 0017 pattern).
notify pgrst, 'reload schema';
