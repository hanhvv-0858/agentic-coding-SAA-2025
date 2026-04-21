-- 0012_purge_legacy_departments.sql
-- Post-0011 cleanup: remove 5 pre-SVN legacy department rows
-- (`BIZ`, `DES`, `HR`, `PM`, `QA`) that survived migration 0011
-- because its DELETE clause targeted only `code LIKE 'SVN-%'`.
--
-- These rows predate the SVN-* seed from the initial 0001 migration
-- (likely dev-env leftovers). None of them appear in the 49 canonical
-- Sun* codes, and a pre-migration check confirmed zero profiles
-- reference them. Safe to drop.
--
-- Idempotent: re-running hits zero-row WHERE clauses and no-ops.

update profiles
set department_id = null
where department_id in (
  select id from departments where code in ('BIZ', 'DES', 'HR', 'PM', 'QA')
);

delete from departments where code in ('BIZ', 'DES', 'HR', 'PM', 'QA');
