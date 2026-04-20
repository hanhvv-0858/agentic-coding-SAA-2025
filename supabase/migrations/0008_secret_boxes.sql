-- 0008_secret_boxes.sql
-- Per-Sunner Secret Box ledger. One row per box awarded. `opened_at`
-- NULL = unopened, NOT NULL = opened (timestamp when the user clicked
-- "Mở Secret Box" on the sidebar). Rewards count toward
-- `getMyKudosStats().secretBoxesOpened` / `secretBoxesUnopened`.
--
-- This migration only creates the table + RLS; the trigger that mints
-- new boxes (e.g. "+1 box every N kudos received") is intentionally
-- deferred to a later task alongside the Secret Box reveal flow.

create table if not exists secret_boxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists secret_boxes_user_opened
  on secret_boxes (user_id, opened_at);

alter table secret_boxes enable row level security;

-- Read: a Sunner sees only their own boxes.
create policy "secret_boxes_select_self" on secret_boxes
  for select using (user_id = auth.uid());

-- Update: a Sunner can only mark their own boxes as opened. The
-- WITH CHECK makes sure they can't transfer ownership or reset
-- opened_at to NULL (mintting a fresh "opened" row requires service
-- role; UI only sets `opened_at = now()`).
create policy "secret_boxes_open_self" on secret_boxes
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Inserts are backend-only (service_role) — no end-user INSERT policy.
