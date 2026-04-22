-- 0020_backfill_kudo_hashtags.sql
-- Legacy kudos created before the Viết Kudo compose flow enforced the
-- 1..5 hashtag requirement (FR-003 per spec ihQ26W78P2) have zero rows
-- in `kudo_hashtags`. Backfill 2 random hashtags per orphan kudo so the
-- Live board renders realistic demo data and hashtag filtering works
-- end-to-end.
--
-- Strategy: for each kudo with no rows in `kudo_hashtags`, pick 2
-- distinct hashtags at random and insert the junction rows. Idempotent:
-- re-running is a no-op (the `NOT EXISTS` guard skips kudos that
-- already have at least one hashtag).

insert into kudo_hashtags (kudo_id, hashtag_id)
select k.id, h.id
from kudos k
cross join lateral (
  select id
  from hashtags
  order by random()
  limit 2
) h
where not exists (
  select 1 from kudo_hashtags kh where kh.kudo_id = k.id
)
on conflict (kudo_id, hashtag_id) do nothing;

-- Force PostgREST to reload its cache (consistent with 0017–0019).
notify pgrst, 'reload schema';
