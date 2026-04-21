-- 0013_drop_profile_honour_code.sql
-- Remove `profiles.honour_code` column. After migrations 0011 +
-- 0012 the column duplicated `departments.code` (populated from the
-- fixture script's `deptCode`). Consolidate by dropping the column
-- and deriving the displayed code from `departments.code` via the
-- existing `profiles.department_id` FK join at read time.
--
-- `honour_title` (enum: Legend / Rising / Super / New Hero) is NOT
-- dropped — it's a separate concept (award tier) independent of
-- the Sunner's department.

alter table profiles drop column if exists honour_code;
