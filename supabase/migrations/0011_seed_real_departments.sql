-- 0011_seed_real_departments.sql
-- Replace the 6 generic `SVN-*` department seed rows with the 49
-- canonical Sun* organisational codes (spec WXK5AYB_rG — Dropdown
-- Phòng ban, user-confirmed Option B 2026-04-21).
--
-- `name_vi == name_en == code` because department codes are proper
-- nouns / internal org identifiers, not translatable text.
--
-- 3-step non-reversible migration:
--   1. INSERT the 49 new rows (idempotent via ON CONFLICT on `code`).
--   2. NULL out `profiles.department_id` where it still points to the
--      old `SVN-*` rows (the `profiles.department_id → departments.id`
--      FK defaults to ON DELETE NO ACTION so step 3 would fail
--      otherwise).
--   3. DELETE the 6 old rows.
--
-- Fixture profiles are re-attached to real codes at seed time via
-- `scripts/seed-kudos-fixtures.ts` (updated in the same commit).

-- Step 1: insert canonical 49 codes.
insert into departments (code, name_vi, name_en) values
  ('CTO',                    'CTO',                    'CTO'),
  ('SPD',                    'SPD',                    'SPD'),
  ('FCOV',                   'FCOV',                   'FCOV'),
  ('CEVC1',                  'CEVC1',                  'CEVC1'),
  ('CEVC2',                  'CEVC2',                  'CEVC2'),
  ('STVC - R&D',             'STVC - R&D',             'STVC - R&D'),
  ('CEVC2 - CySS',           'CEVC2 - CySS',           'CEVC2 - CySS'),
  ('FCOV - LRM',             'FCOV - LRM',             'FCOV - LRM'),
  ('CEVC2 - System',         'CEVC2 - System',         'CEVC2 - System'),
  ('OPDC - HRF',             'OPDC - HRF',             'OPDC - HRF'),
  ('CEVC1 - DSV - UI/UX 1',  'CEVC1 - DSV - UI/UX 1',  'CEVC1 - DSV - UI/UX 1'),
  ('CEVC1 - DSV',            'CEVC1 - DSV',            'CEVC1 - DSV'),
  ('CEVEC',                  'CEVEC',                  'CEVEC'),
  ('OPDC - HRD - C&C',       'OPDC - HRD - C&C',       'OPDC - HRD - C&C'),
  ('STVC',                   'STVC',                   'STVC'),
  ('FCOV - F&A',             'FCOV - F&A',             'FCOV - F&A'),
  ('CEVC1 - DSV - UI/UX 2',  'CEVC1 - DSV - UI/UX 2',  'CEVC1 - DSV - UI/UX 2'),
  ('CEVC1 - AIE',            'CEVC1 - AIE',            'CEVC1 - AIE'),
  ('OPDC - HRF - C&B',       'OPDC - HRF - C&B',       'OPDC - HRF - C&B'),
  ('FCOV - GA',              'FCOV - GA',              'FCOV - GA'),
  ('FCOV - ISO',             'FCOV - ISO',             'FCOV - ISO'),
  ('STVC - EE',              'STVC - EE',              'STVC - EE'),
  ('GEU - HUST',             'GEU - HUST',             'GEU - HUST'),
  ('CEVEC - SAPD',           'CEVEC - SAPD',           'CEVEC - SAPD'),
  ('OPDC - HRF - OD',        'OPDC - HRF - OD',        'OPDC - HRF - OD'),
  ('CEVEC - GSD',            'CEVEC - GSD',            'CEVEC - GSD'),
  ('GEU - TM',               'GEU - TM',               'GEU - TM'),
  ('STVC - R&D - DTR',       'STVC - R&D - DTR',       'STVC - R&D - DTR'),
  ('STVC - R&D - DPS',       'STVC - R&D - DPS',       'STVC - R&D - DPS'),
  ('CEVC3',                  'CEVC3',                  'CEVC3'),
  ('STVC - R&D - AIR',       'STVC - R&D - AIR',       'STVC - R&D - AIR'),
  ('CEVC4',                  'CEVC4',                  'CEVC4'),
  ('PAO',                    'PAO',                    'PAO'),
  ('GEU',                    'GEU',                    'GEU'),
  ('GEU - DUT',              'GEU - DUT',              'GEU - DUT'),
  ('OPDC - HRD - L&D',       'OPDC - HRD - L&D',       'OPDC - HRD - L&D'),
  ('OPDC - HRD - TI',        'OPDC - HRD - TI',        'OPDC - HRD - TI'),
  ('OPDC - HRF - TA',        'OPDC - HRF - TA',        'OPDC - HRF - TA'),
  ('GEU - UET',              'GEU - UET',              'GEU - UET'),
  ('STVC - R&D - SDX',       'STVC - R&D - SDX',       'STVC - R&D - SDX'),
  ('OPDC - HRD - HRBP',      'OPDC - HRD - HRBP',      'OPDC - HRD - HRBP'),
  ('PAO - PEC',              'PAO - PEC',              'PAO - PEC'),
  ('IAV',                    'IAV',                    'IAV'),
  ('STVC - Infra',           'STVC - Infra',           'STVC - Infra'),
  ('CPV - CGP',              'CPV - CGP',              'CPV - CGP'),
  ('GEU - UIT',              'GEU - UIT',              'GEU - UIT'),
  ('OPDC - HRD',             'OPDC - HRD',             'OPDC - HRD'),
  ('BDV',                    'BDV',                    'BDV'),
  ('CPV',                    'CPV',                    'CPV')
on conflict (code) do nothing;

-- Step 2: break FK so step 3's DELETE doesn't fail. Fixture profiles
-- are re-attached after `yarn seed` runs against the migrated DB.
update profiles
set department_id = null
where department_id in (
  select id from departments where code like 'SVN-%'
);

-- Step 3: drop the 6 generic seed rows.
delete from departments where code like 'SVN-%';
