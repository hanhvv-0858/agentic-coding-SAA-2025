-- 0014_kudo_images_storage.sql
-- Create the `kudo-images` Supabase Storage bucket + RLS policies for
-- the Viết Kudo compose flow (spec ihQ26W78P2 TR-002).
--
-- Bucket config:
--   - private (public = false) — signed URLs generated at read time
--   - size limit 5 MB (5 * 1024 * 1024 = 5242880 bytes)
--   - MIME whitelist: image/jpeg, image/png, image/webp
--
-- RLS (plan.md §Database Changes):
--   - SELECT: any authenticated user (feed renders any kudo's images)
--   - INSERT: only the object owner (auth.uid()) — RLS on storage.objects
--   - DELETE: owner-only (edit-kudo flow + compose cleanup)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kudo-images', 'kudo-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Read — any authenticated Sunner.
drop policy if exists "kudo_images_read_authenticated" on storage.objects;
create policy "kudo_images_read_authenticated" on storage.objects
  for select
  using (bucket_id = 'kudo-images' and auth.role() = 'authenticated');

-- Insert — owner is auth.uid() (Supabase Storage sets `owner` from JWT).
drop policy if exists "kudo_images_insert_own" on storage.objects;
create policy "kudo_images_insert_own" on storage.objects
  for insert
  with check (bucket_id = 'kudo-images' and owner = auth.uid());

-- Delete — owner-only (covers Hủy cleanup + edit flows).
drop policy if exists "kudo_images_delete_own" on storage.objects;
create policy "kudo_images_delete_own" on storage.objects
  for delete
  using (bucket_id = 'kudo-images' and owner = auth.uid());
