-- 0019_backfill_kudo_title.sql
-- Backfill `kudos.title` for legacy rows created before the Viết Kudo
-- compose flow added the required Title field (FR-001 per spec
-- ihQ26W78P2). Historical kudos were inserted either by fixtures or by
-- the PR-1 foundation when title was still optional, so they render
-- with an empty "Danh hiệu" slot on the Live board (user report
-- 2026-04-22).
--
-- Strategy: set a neutral Vietnamese fallback "Lời cám ơn" for any
-- kudo with NULL or whitespace-only title. Idempotent — re-running is
-- a no-op for rows already backfilled or with a real title.

update kudos
set title = 'Lời cám ơn'
where title is null
   or char_length(btrim(title)) = 0;

-- Force PostgREST to reload schema cache (views unchanged but the
-- refresh is cheap and keeps deploys consistent with 0017 / 0018).
notify pgrst, 'reload schema';
