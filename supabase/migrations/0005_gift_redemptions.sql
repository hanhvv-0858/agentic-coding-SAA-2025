-- 0005_gift_redemptions.sql
-- Sun* Kudos Live board §D.3 "10 SUNNER NHẬN QUÀ MỚI NHẤT".
-- Physical-prize ledger surfaced in the sidebar. Each row = one
-- redemption event (user U received Q×G at timestamp T). Populated by
-- the Secret Box redemption flow (future) and the local dev seed
-- (scripts/seed-kudos-fixtures.ts).

create table if not exists gift_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  gift_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  source text not null default 'secret_box',
  redeemed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists gift_redemptions_redeemed_at_desc
  on gift_redemptions (redeemed_at desc);
create index if not exists gift_redemptions_user_id
  on gift_redemptions (user_id);

alter table gift_redemptions enable row level security;

-- Read: any authenticated Sunner can see the org-wide latest redemptions
-- (§D.3 — sidebar is public across the org, not scoped to the viewer).
create policy "gift_redemptions_select_authenticated" on gift_redemptions
  for select using (auth.role() = 'authenticated');

-- Writes are driven by the backend (Secret Box flow) via service_role.
-- No direct INSERT/UPDATE/DELETE policy for end users — denied by RLS.
