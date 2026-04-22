-- 0017_kudo_anonymous_alias.sql
-- Adds the anonymous-nickname column to `kudos` and extends
-- `create_kudo()` to persist it. Resolved in spec round 3 2026-04-21
-- (Viết Kudo ihQ26W78P2 US6 + FR-011) — Figma item G requires a
-- nickname text field when "Gửi lời cám ơn và ghi nhận ẩn danh" is
-- ticked.

-- 1. Add the nullable column.
alter table kudos
  add column if not exists anonymous_alias text null;

-- 2. Pairing CHECK — alias is null when public, 2..40 chars when anonymous.
alter table kudos drop constraint if exists kudos_anonymous_alias_pairing;
alter table kudos add constraint kudos_anonymous_alias_pairing
  check (
    (is_anonymous = false and anonymous_alias is null)
    or (is_anonymous = true and char_length(btrim(anonymous_alias)) between 2 and 40)
  );

-- 3. Recreate `kudos_with_stats` view so `k.*` picks up `anonymous_alias`.
--    Postgres views are resolved at creation and do not auto-expand on
--    base-table column additions — same reason we recreate in 0015.
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

-- 4. Replace `create_kudo` with a variant that accepts p_anonymous_alias.
--    Drop the old signature first so overload resolution stays clean.
drop function if exists create_kudo(text, text, boolean, uuid, text[], text[]);

create or replace function create_kudo(
  p_title text,
  p_body text,
  p_is_anonymous boolean,
  p_recipient_id uuid,
  p_hashtag_slugs text[],
  p_image_paths text[],
  p_anonymous_alias text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_kudo_id uuid;
  caller_id uuid;
  trimmed_alias text := btrim(coalesce(p_anonymous_alias, ''));
  final_alias text;
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

  -- Anonymous/alias pairing — mirror the CHECK constraint so callers
  -- get a clear error message instead of a constraint violation.
  if coalesce(p_is_anonymous, false) = true then
    if char_length(trimmed_alias) < 2 or char_length(trimmed_alias) > 40 then
      raise exception 'create_kudo: anonymous_alias must be 2..40 chars when is_anonymous=true';
    end if;
    final_alias := trimmed_alias;
  else
    if trimmed_alias <> '' then
      raise exception 'create_kudo: anonymous_alias must be null when is_anonymous=false';
    end if;
    final_alias := null;
  end if;

  -- Insert the kudo row — sender_id is hard-coded to caller.
  insert into kudos (sender_id, title, body, is_anonymous, anonymous_alias)
  values (caller_id, p_title, p_body, coalesce(p_is_anonymous, false), final_alias)
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

revoke all on function create_kudo(text, text, boolean, uuid, text[], text[], text) from public;
grant execute on function create_kudo(text, text, boolean, uuid, text[], text[], text) to authenticated;
