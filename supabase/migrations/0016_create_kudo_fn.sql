-- 0016_create_kudo_fn.sql
-- Stored function for atomic Viết Kudo insertion (plan.md §Database
-- Changes, committed architecture choice per review round 2).
--
-- Security model (plan.md Risk Assessment row):
--   - `SECURITY DEFINER` — function runs with owner's privileges,
--     bypassing RLS on the 4 target tables.
--   - `sender_id` is HARD-CODED to `auth.uid()` inside the function
--     body (NOT a parameter) — callers cannot spoof identity.
--   - Hashtag slug resolution is a safe read from the public
--     `hashtags` table; unknown slugs are silently skipped.
--   - Image paths are validated against `storage.objects` ownership
--     upstream (the compose UI uploads via authenticated client,
--     so Storage RLS has already enforced ownership by the time the
--     path reaches this function).

create or replace function create_kudo(
  p_title text,
  p_body text,
  p_is_anonymous boolean,
  p_recipient_id uuid,
  p_hashtag_slugs text[],
  p_image_paths text[]
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_kudo_id uuid;
  caller_id uuid;
begin
  -- Authenticate caller; function cannot be called anonymously.
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'create_kudo: authentication required';
  end if;

  -- Validate inputs before writes.
  if p_title is null or length(btrim(p_title)) = 0 then
    raise exception 'create_kudo: title is required';
  end if;
  if p_body is null or length(btrim(p_body)) = 0 then
    raise exception 'create_kudo: body is required';
  end if;
  if p_recipient_id is null then
    raise exception 'create_kudo: recipient_id is required';
  end if;
  if p_hashtag_slugs is null or array_length(p_hashtag_slugs, 1) is null then
    raise exception 'create_kudo: at least one hashtag is required';
  end if;
  if array_length(p_hashtag_slugs, 1) > 5 then
    raise exception 'create_kudo: maximum 5 hashtags allowed';
  end if;
  if p_image_paths is not null and array_length(p_image_paths, 1) > 5 then
    raise exception 'create_kudo: maximum 5 images allowed';
  end if;

  -- Insert the kudo row — sender_id is hard-coded to caller.
  insert into kudos (sender_id, title, body, is_anonymous)
  values (caller_id, p_title, p_body, coalesce(p_is_anonymous, false))
  returning id into new_kudo_id;

  -- Insert the single recipient row (single-recipient per Q1).
  insert into kudo_recipients (kudo_id, recipient_id)
  values (new_kudo_id, p_recipient_id);

  -- Insert hashtag junction rows — resolve slug → id; skip unknown.
  insert into kudo_hashtags (kudo_id, hashtag_id)
  select new_kudo_id, h.id
  from hashtags h
  where h.slug = any(p_hashtag_slugs);

  -- Insert image junction rows — position derives from array index.
  if p_image_paths is not null and array_length(p_image_paths, 1) > 0 then
    insert into kudo_images (kudo_id, url, position)
    select new_kudo_id, path, idx - 1
    from unnest(p_image_paths) with ordinality as t(path, idx);
  end if;

  return new_kudo_id;
end;
$$;

-- Grant execute to authenticated role only (unauthenticated users
-- cannot call this). The function itself also checks auth.uid() above.
revoke all on function create_kudo(text, text, boolean, uuid, text[], text[]) from public;
grant execute on function create_kudo(text, text, boolean, uuid, text[], text[]) to authenticated;
