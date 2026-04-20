-- 0007_kudo_title_images.sql
-- Adds `title` (free-text "danh hiệu") to kudos and introduces the
-- `kudo_images` junction for up-to-5 attachments per kudo. Before this
-- migration the Live board injected demo titles + image URLs via
-- `decorateKudoMock`; now both live on real rows written by the
-- upcoming "Viết Kudo" composer flow.

alter table kudos
  add column if not exists title text;

create table if not exists kudo_images (
  id uuid primary key default gen_random_uuid(),
  kudo_id uuid not null references kudos(id) on delete cascade,
  url text not null,
  position smallint not null default 0 check (position between 0 and 4),
  created_at timestamptz not null default now()
);

create index if not exists kudo_images_kudo_id_position
  on kudo_images (kudo_id, position);

alter table kudo_images enable row level security;

-- Read: any authenticated Sunner can fetch (images render in the feed).
create policy "kudo_images_select_authenticated" on kudo_images
  for select using (auth.role() = 'authenticated');

-- Insert: only the kudo's sender can attach images (mirrors the
-- ownership check on `kudo_recipients` / `kudo_hashtags`).
create policy "kudo_images_insert_sender" on kudo_images
  for insert with check (
    exists (
      select 1 from kudos where id = kudo_id and sender_id = auth.uid()
    )
  );

-- Delete: sender can remove their own attachments (edit-kudo flow).
create policy "kudo_images_delete_sender" on kudo_images
  for delete using (
    exists (
      select 1 from kudos where id = kudo_id and sender_id = auth.uid()
    )
  );

-- Enforce the 5-image cap at the DB layer so the composer can't bypass
-- client validation. Raises a constraint error on the 6th row.
create or replace function enforce_kudo_image_limit()
returns trigger as $$
begin
  if (select count(*) from kudo_images where kudo_id = new.kudo_id) >= 5 then
    raise exception 'kudo_images: each kudo may carry at most 5 images';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists kudo_images_limit on kudo_images;
create trigger kudo_images_limit
  before insert on kudo_images
  for each row execute function enforce_kudo_image_limit();

-- Recreate `kudos_with_stats` so `select k.*` picks up the new
-- `title` column. Postgres views are resolved at creation and do not
-- auto-expand when a base-table column is added.
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
