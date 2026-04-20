-- supabase/seed.sql
-- Local-dev seed for Sun* Kudos Live board. Production deploy runs
-- schema migrations only — seed is gated to non-production via
-- `supabase db reset` (never run in production). Plan.md §Seed strategy.

-- 6 canonical Sun* departments (codes + VI/EN labels per plan §Seed).
insert into departments (code, name_vi, name_en) values
  ('SVN-ENG', 'Kỹ thuật', 'Engineering'),
  ('SVN-DES', 'Thiết kế', 'Design'),
  ('SVN-PM',  'Sản phẩm', 'Product'),
  ('SVN-QA',  'Kiểm thử', 'QA'),
  ('SVN-BIZ', 'Kinh doanh', 'Business'),
  ('SVN-HR',  'Nhân sự', 'HR')
on conflict (code) do nothing;

-- 10 popular hashtags (Q4 default set).
insert into hashtags (slug, label) values
  ('dedicated',     'Dedicated'),
  ('creative',      'Creative'),
  ('teamwork',      'Teamwork'),
  ('mentor',        'Mentor'),
  ('ontime',        'OnTime'),
  ('leadership',    'Leadership'),
  ('innovation',    'Innovation'),
  ('customer-first','CustomerFirst'),
  ('wellness',      'Wellness'),
  ('fun',           'Fun')
on conflict (slug) do nothing;

-- Sample kudos seed
-- ----------------------------------------------------------------------
-- Sample kudos and profile fixtures depend on auth.users rows existing
-- first (profiles.id references auth.users). Creating auth.users
-- requires `auth.admin.createUser()` from the Supabase Admin API, which
-- can't be invoked from seed.sql directly. Keep the block below as a
-- TODO stub — a companion script (supabase/scripts/seed-fixtures.ts or
-- a post-reset hook) should run via `supabase functions invoke` once
-- the CLI is available.
--
-- do $$ begin
--   if current_setting('app.environment', true) <> 'production' then
--     -- TODO(phase-1.5): insert ~30 sample kudos distributed across
--     -- the 6 seeded departments and 10 seeded hashtags with varied
--     -- hearts_count so the highlight carousel has ordering + the
--     -- spotlight word-cloud has non-uniform weights.
--     -- TODO(phase-1.5): seed 2 RLS fixture users
--     --   rls-user-a@test.sun / rls-user-b@test.sun
--     -- for tests/integration/rls/*.
--     null;
--   end if;
-- end $$;
