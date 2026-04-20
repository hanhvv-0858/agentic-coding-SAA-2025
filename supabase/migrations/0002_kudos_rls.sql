-- 0002_kudos_rls.sql
-- RLS policies for the Kudos Live board. Every table is RLS-enabled.
-- Reads are open to authenticated users; writes are scoped to the row
-- owner. Tables with no INSERT/UPDATE/DELETE policy deny those
-- operations entirely (departments writes, profiles updates by others,
-- etc.). Lifted from plan.md §Database Schema > RLS Policies.

alter table profiles enable row level security;
alter table departments enable row level security;
alter table hashtags enable row level security;
alter table kudos enable row level security;
alter table kudo_recipients enable row level security;
alter table kudo_hashtags enable row level security;
alter table kudo_hearts enable row level security;

-- profiles: anyone authenticated reads; users update only their own.
create policy "profiles_select_authenticated" on profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

-- departments + hashtags: read-all for authenticated; admin-only writes
-- (no policy ⇒ denied). hashtags INSERT is allowed for authenticated
-- users so users can mint new hashtags from the composer.
create policy "departments_select_authenticated" on departments
  for select using (auth.role() = 'authenticated');
create policy "hashtags_select_authenticated" on hashtags
  for select using (auth.role() = 'authenticated');
create policy "hashtags_insert_authenticated" on hashtags
  for insert with check (auth.role() = 'authenticated');

-- kudos: read-all for authenticated; INSERT only as self.
create policy "kudos_select_authenticated" on kudos
  for select using (auth.role() = 'authenticated');
create policy "kudos_insert_self" on kudos
  for insert with check (sender_id = auth.uid());

-- kudo_recipients + kudo_hashtags: INSERT allowed only when the
-- associated kudo is owned by the inserter.
create policy "kudo_recipients_select" on kudo_recipients
  for select using (auth.role() = 'authenticated');
create policy "kudo_recipients_insert" on kudo_recipients
  for insert with check (
    exists (select 1 from kudos where id = kudo_id and sender_id = auth.uid())
  );
create policy "kudo_hashtags_select" on kudo_hashtags
  for select using (auth.role() = 'authenticated');
create policy "kudo_hashtags_insert" on kudo_hashtags
  for insert with check (
    exists (select 1 from kudos where id = kudo_id and sender_id = auth.uid())
  );

-- kudo_hearts: read-all; INSERT/DELETE only as self (TR-006 idempotency).
create policy "kudo_hearts_select" on kudo_hearts
  for select using (auth.role() = 'authenticated');
create policy "kudo_hearts_insert_self" on kudo_hearts
  for insert with check (user_id = auth.uid());
create policy "kudo_hearts_delete_self" on kudo_hearts
  for delete using (user_id = auth.uid());
