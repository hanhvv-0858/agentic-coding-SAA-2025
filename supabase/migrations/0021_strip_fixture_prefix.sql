-- 0021_strip_fixture_prefix.sql
-- Remove the `[fixture#N] ` dedup marker that `scripts/seed-kudos-fixtures.ts`
-- used to prepend to every seeded kudo body. The marker leaked into the
-- UI and made demo content look synthetic (user report 2026-04-22). The
-- seeder has been updated to rely on `(sender_id, body)` uniqueness
-- instead of the marker, so removing it is safe and idempotent.
--
-- Pattern: `[fixture#<digits>] ` at the very start of `body`. Use a
-- regex replace anchored with `^` so only the prefix is stripped; the
-- rest of the body is preserved verbatim.

update kudos
set body = regexp_replace(body, '^\[fixture#\d+\]\s*', '')
where body ~ '^\[fixture#\d+\]';

-- Cheap schema-cache reload to stay consistent with the 0017–0020 pattern.
notify pgrst, 'reload schema';
