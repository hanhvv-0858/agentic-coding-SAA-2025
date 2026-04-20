-- 0003_kudos_views.sql
-- `kudos_with_stats` view denormalises hearts_count so the feed hot
-- path stays a single SELECT. Lifted from plan.md §Database Schema >
-- Views. `has_hearted` is computed per-user in the Server Action via
-- `left join kudo_hearts on kudo_id = kudos.id and user_id = auth.uid()`.

create or replace view kudos_with_stats as
select
  k.*,
  coalesce(h.cnt, 0) as hearts_count
from kudos k
left join (
  select kudo_id, count(*)::int as cnt
  from kudo_hearts
  group by kudo_id
) h on h.kudo_id = k.id;
