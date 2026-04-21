-- 0010_hashtags_localize.sql
-- Localize the `hashtags` table to support both Vietnamese and English
-- display labels (feature spec JWpsISMAaM — Dropdown Hashtag Filter,
-- FR-010). Mirrors the existing `departments.name_vi` / `name_en`
-- pattern so the server action can resolve the correct column per
-- locale at request time.
--
-- This migration also REPLACES the old 10-row generic seed
-- (`dedicated/creative/teamwork/...`) with the canonical 13-row
-- Sun* Q4 2025 hashtag set. Only `dedicated` overlaps — the other 9
-- old slugs + their `kudo_hashtags` junction rows are deleted.
--
-- ⚠️ Non-reversible: the DELETE + UPSERT below rewrites hashtag
-- content. Dev-only data; the fixture seed script
-- (`scripts/seed-kudos-fixtures.ts`) repopulates `kudo_hashtags`
-- joins after migration push.

-- 1. Rename existing `label` → `label_en` (current values are
-- English: Dedicated, Creative, Teamwork, ...).
alter table hashtags rename column label to label_en;

-- 2. Add nullable `label_vi` (NOT NULL enforced at step 5 after
-- backfill via UPSERT below).
alter table hashtags add column if not exists label_vi text;

-- 3. Purge old hashtag rows that aren't part of the new canonical
-- set. `on delete cascade` on `kudo_hashtags.hashtag_id` cleans up
-- the junction rows automatically, but we DELETE them explicitly
-- first for clarity + to avoid relying on cascade semantics.
delete from kudo_hashtags where hashtag_id in (
  select id from hashtags where slug not in (
    'comprehensive', 'expertise', 'high-performance', 'inspiring',
    'dedicated', 'aim-high', 'be-agile', 'wasshoi',
    'goal-oriented', 'customer-focused', 'process-driven',
    'creative-solution', 'excellent-management'
  )
);
delete from hashtags where slug not in (
  'comprehensive', 'expertise', 'high-performance', 'inspiring',
  'dedicated', 'aim-high', 'be-agile', 'wasshoi',
  'goal-oriented', 'customer-focused', 'process-driven',
  'creative-solution', 'excellent-management'
);

-- 4. Upsert the 13 canonical rows. `dedicated` already exists
-- (survived the DELETE) and will be UPDATEd to pick up `label_vi`.
-- The other 12 are fresh INSERTs.
insert into hashtags (slug, label_vi, label_en) values
  ('comprehensive',        'Toàn diện',          'Comprehensive'),
  ('expertise',            'Giỏi chuyên môn',    'Expertise'),
  ('high-performance',     'Hiệu suất cao',      'High Performance'),
  ('inspiring',            'Truyền cảm hứng',    'Inspiring'),
  ('dedicated',            'Cống hiến',          'Dedicated'),
  ('aim-high',             'Aim High',           'Aim High'),
  ('be-agile',             'Be Agile',           'Be Agile'),
  ('wasshoi',              'Wasshoi',            'Wasshoi'),
  ('goal-oriented',        'Hướng mục tiêu',     'Goal-Oriented'),
  ('customer-focused',     'Hướng khách hàng',   'Customer-Focused'),
  ('process-driven',       'Chuẩn quy trình',    'Process-Driven'),
  ('creative-solution',    'Giải pháp sáng tạo', 'Creative Solution'),
  ('excellent-management', 'Quản lý xuất sắc',   'Excellent Management')
on conflict (slug) do update set
  label_vi = excluded.label_vi,
  label_en = excluded.label_en;

-- 5. Enforce NOT NULL on both localized columns now that every row
-- has both set by the UPSERT above.
alter table hashtags alter column label_vi set not null;
alter table hashtags alter column label_en set not null;
