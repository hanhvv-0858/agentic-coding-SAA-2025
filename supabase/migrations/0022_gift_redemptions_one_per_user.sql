-- ============================================================================
-- 0022_gift_redemptions_one_per_user.sql
-- ============================================================================
-- Enforce the business rule "each Sunner can redeem at most one gift" at
-- the DB level by adding a UNIQUE constraint on `gift_redemptions.user_id`.
--
-- Before adding the constraint we defensively clean any pre-existing
-- duplicates — keep the MOST RECENT redemption (by redeemed_at, then
-- created_at as tiebreaker) and delete the rest. Without this step the
-- ALTER TABLE would fail on any environment whose fixture seed or manual
-- backfill wrote more than one row per user (the pre-2026-04-24 seeder
-- cycled `profiles[i % N]` and created 2 rows per user when N < 10).
-- ============================================================================

-- Step 1 — De-duplicate: tag rows with ROW_NUMBER() per user_id and
-- delete everything but the newest.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY redeemed_at DESC, created_at DESC
    ) AS rn
  FROM public.gift_redemptions
)
DELETE FROM public.gift_redemptions
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2 — Add the UNIQUE constraint. Named explicitly so future
-- migrations can drop it without guessing PostgreSQL's auto-generated
-- identifier.
ALTER TABLE public.gift_redemptions
  ADD CONSTRAINT gift_redemptions_user_id_key UNIQUE (user_id);

-- Step 3 — Reload the PostgREST schema cache so downstream clients
-- see the new constraint immediately (no app restart required).
NOTIFY pgrst, 'reload schema';
