-- 0015_kudo_anonymous.sql
-- Add `is_anonymous` flag to `kudos` table for the Viết Kudo compose
-- flow's US6 (resolved Q2 in spec review). Recreate the
-- `kudos_with_stats` view so `select k.*` picks up the new column —
-- Postgres views are resolved at creation and don't auto-expand on
-- base-table column additions.

alter table kudos
  add column if not exists is_anonymous boolean not null default false;

drop view if exists kudos_with_stats;
create view kudos_with_stats as
select
  k.*,
  coalesce(h.cnt, 0) as hearts_count
from kudos k
left join (
  select kudo_id, count(*)::int as cnt
  from kudo_hearts
  group by kudo_id
) h on h.kudo_id = k.id;
