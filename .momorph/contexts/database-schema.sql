-- ============================================================================
-- Sun* Annual Awards 2025 — Consolidated Database Schema
-- ============================================================================
-- Snapshot of the public schema AFTER all 21 migrations (0001–0021) have been
-- applied. Generated from supabase/migrations/* on 2026-04-23.
--
-- This file is a CURRENT-STATE reference, not a replayable migration. Dropped
-- columns (e.g., profiles.honour_code) and superseded function signatures are
-- omitted. For migration history, see DATABASE_ANALYSIS.md.
--
-- External dependencies (Supabase-managed; not declared here):
--   * auth.users          — Supabase Auth
--   * storage.buckets     — Supabase Storage
--   * storage.objects     — Supabase Storage
--   * extension pgcrypto  — for gen_random_uuid()
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE public.honour_title AS ENUM (
  'Legend Hero',
  'Rising Hero',
  'Super Hero',
  'New Hero'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- departments — Sun* organisational unit registry (49 canonical codes seeded
-- in migration 0011; 6 SVN-* legacy + 5 older codes purged in 0011/0012).
-- ----------------------------------------------------------------------------
CREATE TABLE public.departments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text        NOT NULL UNIQUE,
  name_vi     text        NOT NULL,
  name_en     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- profiles — Denormalised mirror of auth.users with department + honour tier.
-- Auto-provisioned on first sign-in via on_auth_user_created trigger.
-- honour_code column was dropped in migration 0013 (redundant with FK join).
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id             uuid                 PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          text                 NOT NULL,
  display_name   text,
  avatar_url     text,
  department_id  uuid                 REFERENCES public.departments(id),
  honour_title   public.honour_title,
  created_at     timestamptz          NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- hashtags — Bilingual social-tagging vocabulary. Migration 0010 replaced the
-- 10-row generic seed with 13 canonical Sun* Q4 2025 hashtags.
-- ----------------------------------------------------------------------------
CREATE TABLE public.hashtags (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        NOT NULL UNIQUE,
  label_vi    text        NOT NULL,
  label_en    text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- kudos — Primary recognition record (immutable; UPDATE/DELETE denied by RLS).
-- title was added in 0007 (backfilled to "Lời cám ơn" in 0019 for legacy nulls).
-- is_anonymous + anonymous_alias added in 0015/0017.
-- ----------------------------------------------------------------------------
CREATE TABLE public.kudos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body              text        NOT NULL,
  title             text,
  is_anonymous      boolean     NOT NULL DEFAULT false,
  anonymous_alias   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kudos_anonymous_alias_pairing CHECK (
    (is_anonymous = false AND anonymous_alias IS NULL)
    OR (is_anonymous = true  AND char_length(btrim(anonymous_alias)) BETWEEN 2 AND 40)
  )
);

CREATE INDEX kudos_created_at_desc ON public.kudos (created_at DESC);

-- ----------------------------------------------------------------------------
-- kudo_recipients — Sender → recipient junction. Composite PK enforces 1:1
-- (one recipient per kudo in the current spec). Trigger trg_sync_recipient_honour
-- recomputes the recipient's honour tier on insert.
-- ----------------------------------------------------------------------------
CREATE TABLE public.kudo_recipients (
  kudo_id       uuid NOT NULL REFERENCES public.kudos(id)    ON DELETE CASCADE,
  recipient_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (kudo_id, recipient_id)
);

-- ----------------------------------------------------------------------------
-- kudo_hashtags — Many-to-many junction between kudos and hashtags.
-- Legacy orphan rows (kudo with 0 hashtags) backfilled in 0020.
-- ----------------------------------------------------------------------------
CREATE TABLE public.kudo_hashtags (
  kudo_id     uuid NOT NULL REFERENCES public.kudos(id)    ON DELETE CASCADE,
  hashtag_id  uuid NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (kudo_id, hashtag_id)
);

CREATE INDEX kudo_hashtags_hashtag_id ON public.kudo_hashtags (hashtag_id);

-- ----------------------------------------------------------------------------
-- kudo_hearts — Idempotent like/heart toggle (composite PK enforces single
-- heart per user per kudo).
-- ----------------------------------------------------------------------------
CREATE TABLE public.kudo_hearts (
  kudo_id     uuid        NOT NULL REFERENCES public.kudos(id)    ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kudo_id, user_id)
);

CREATE INDEX kudo_hearts_user_id ON public.kudo_hearts (user_id);

-- ----------------------------------------------------------------------------
-- kudo_images — Up-to-5 image attachments per kudo. URL points at the
-- Supabase Storage bucket `kudo-images` (created in 0014). Hard cap enforced
-- by both the position CHECK constraint and the kudo_images_limit trigger.
-- ----------------------------------------------------------------------------
CREATE TABLE public.kudo_images (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kudo_id     uuid        NOT NULL REFERENCES public.kudos(id) ON DELETE CASCADE,
  url         text        NOT NULL,
  position    smallint    NOT NULL DEFAULT 0 CHECK (position BETWEEN 0 AND 4),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kudo_images_kudo_id_position ON public.kudo_images (kudo_id, position);

-- ----------------------------------------------------------------------------
-- gift_redemptions — Ledger of physical-prize redemptions (Secret Box unlocks
-- or other gift sources). Backend-only writes via service_role.
-- Business rule (migration 0022): each Sunner can redeem AT MOST one gift,
-- enforced via a UNIQUE constraint on user_id.
-- ----------------------------------------------------------------------------
CREATE TABLE public.gift_redemptions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  gift_name    text        NOT NULL,
  quantity     integer     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  source       text        NOT NULL DEFAULT 'secret_box',
  redeemed_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX gift_redemptions_redeemed_at_desc ON public.gift_redemptions (redeemed_at DESC);
CREATE INDEX gift_redemptions_user_id          ON public.gift_redemptions (user_id);

-- ----------------------------------------------------------------------------
-- secret_boxes — Per-Sunner box ledger (NULL opened_at = unopened).
-- Boxes are minted by the backend; users can only mark their own as opened.
-- ----------------------------------------------------------------------------
CREATE TABLE public.secret_boxes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opened_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX secret_boxes_user_opened ON public.secret_boxes (user_id, opened_at);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- kudos_with_stats — Hot-path feed view; precomputes hearts_count per kudo.
-- has_hearted is computed per-user at query time in Server Actions via an
-- additional LEFT JOIN against kudo_hearts using the session auth.uid().
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.kudos_with_stats AS
  SELECT
    k.*,
    COALESCE(h.cnt, 0) AS hearts_count
  FROM public.kudos k
  LEFT JOIN (
    SELECT kudo_id, COUNT(*)::int AS cnt
    FROM public.kudo_hearts
    GROUP BY kudo_id
  ) h ON h.kudo_id = k.id;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- handle_new_user() — Trigger function: auto-provision a profiles row when a
-- new auth.users record is created. Idempotent via ON CONFLICT DO NOTHING.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- enforce_kudo_image_limit() — Trigger function: hard-cap kudo images at 5.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_kudo_image_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.kudo_images WHERE kudo_id = NEW.kudo_id) >= 5 THEN
    RAISE EXCEPTION 'kudo_images: each kudo may carry at most 5 images';
  END IF;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- compute_honour_tier(p_user_id) — Pure SQL function: derive a recipient's
-- honour tier from the count of DISTINCT senders (anonymous kudos still count).
-- Thresholds: New 1–4, Rising 5–9, Super 10–19, Legend ≥ 20.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_honour_tier(p_user_id uuid)
RETURNS public.honour_title
LANGUAGE sql
STABLE
AS $$
  WITH counts AS (
    SELECT COUNT(DISTINCT k.sender_id) AS distinct_senders
    FROM public.kudo_recipients kr
    JOIN public.kudos k ON k.id = kr.kudo_id
    WHERE kr.recipient_id = p_user_id
  )
  SELECT CASE
    WHEN distinct_senders = 0                       THEN NULL::public.honour_title
    WHEN distinct_senders BETWEEN 1  AND 4          THEN 'New Hero'::public.honour_title
    WHEN distinct_senders BETWEEN 5  AND 9          THEN 'Rising Hero'::public.honour_title
    WHEN distinct_senders BETWEEN 10 AND 19         THEN 'Super Hero'::public.honour_title
    ELSE                                                  'Legend Hero'::public.honour_title
  END
  FROM counts;
$$;

REVOKE ALL ON FUNCTION public.compute_honour_tier(uuid) FROM public;
GRANT  EXECUTE ON FUNCTION public.compute_honour_tier(uuid) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- sync_recipient_honour() — Trigger function: on INSERT into kudo_recipients,
-- recompute and persist the recipient's honour tier (no-op if unchanged).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_recipient_honour()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tier public.honour_title;
BEGIN
  new_tier := public.compute_honour_tier(NEW.recipient_id);
  UPDATE public.profiles
    SET honour_title = new_tier
  WHERE id = NEW.recipient_id
    AND honour_title IS DISTINCT FROM new_tier;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- create_kudo(...) — Atomic Viết Kudo composer entry point. Hard-codes
-- sender_id = auth.uid() (no spoofing). Validates inputs, then writes to
-- kudos + kudo_recipients + kudo_hashtags + kudo_images in one transaction.
-- Runs as SECURITY DEFINER to bypass per-table RLS while validation gates
-- act as the security perimeter. EXECUTE granted only to `authenticated`.
-- Final 7-param signature from migration 0017 (the 6-param 0016 version
-- was dropped to avoid overload ambiguity).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_kudo(
  p_title            text,
  p_body             text,
  p_is_anonymous     boolean,
  p_recipient_id     uuid,
  p_hashtag_slugs    text[],
  p_image_paths      text[],
  p_anonymous_alias  text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id     uuid := auth.uid();
  new_kudo_id   uuid;
  alias_clean   text;
  slug_count    int;
  image_count   int;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'create_kudo: not authenticated';
  END IF;
  IF p_title IS NULL OR length(btrim(p_title)) = 0 THEN
    RAISE EXCEPTION 'create_kudo: title is required';
  END IF;
  IF p_body IS NULL OR length(btrim(p_body)) = 0 THEN
    RAISE EXCEPTION 'create_kudo: body is required';
  END IF;
  IF p_recipient_id IS NULL THEN
    RAISE EXCEPTION 'create_kudo: recipient_id is required';
  END IF;
  IF p_hashtag_slugs IS NULL OR array_length(p_hashtag_slugs, 1) IS NULL THEN
    RAISE EXCEPTION 'create_kudo: at least one hashtag is required';
  END IF;
  slug_count := array_length(p_hashtag_slugs, 1);
  IF slug_count > 5 THEN
    RAISE EXCEPTION 'create_kudo: at most 5 hashtags allowed';
  END IF;
  IF p_image_paths IS NOT NULL THEN
    image_count := COALESCE(array_length(p_image_paths, 1), 0);
    IF image_count > 5 THEN
      RAISE EXCEPTION 'create_kudo: at most 5 images allowed';
    END IF;
  END IF;
  IF p_is_anonymous THEN
    alias_clean := btrim(p_anonymous_alias);
    IF alias_clean IS NULL OR char_length(alias_clean) NOT BETWEEN 2 AND 40 THEN
      RAISE EXCEPTION 'create_kudo: anonymous_alias must be 2..40 chars when is_anonymous=true';
    END IF;
  ELSE
    IF p_anonymous_alias IS NOT NULL AND length(btrim(p_anonymous_alias)) > 0 THEN
      RAISE EXCEPTION 'create_kudo: anonymous_alias must be null when is_anonymous=false';
    END IF;
    alias_clean := NULL;
  END IF;

  INSERT INTO public.kudos (sender_id, title, body, is_anonymous, anonymous_alias)
  VALUES (caller_id, btrim(p_title), btrim(p_body), p_is_anonymous, alias_clean)
  RETURNING id INTO new_kudo_id;

  INSERT INTO public.kudo_recipients (kudo_id, recipient_id)
  VALUES (new_kudo_id, p_recipient_id);

  -- Resolve slugs → ids; unknown slugs are silently dropped.
  INSERT INTO public.kudo_hashtags (kudo_id, hashtag_id)
  SELECT new_kudo_id, h.id
  FROM public.hashtags h
  WHERE h.slug = ANY (p_hashtag_slugs);

  IF p_image_paths IS NOT NULL THEN
    INSERT INTO public.kudo_images (kudo_id, url, position)
    SELECT new_kudo_id, path, ord - 1
    FROM unnest(p_image_paths) WITH ORDINALITY AS u(path, ord);
  END IF;

  RETURN new_kudo_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_kudo(text, text, boolean, uuid, text[], text[], text) FROM public;
GRANT  EXECUTE ON FUNCTION public.create_kudo(text, text, boolean, uuid, text[], text[], text) TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- auto-provision profiles on first sign-in
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- hard-cap kudo image attachments at 5
CREATE TRIGGER kudo_images_limit
  BEFORE INSERT ON public.kudo_images
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_kudo_image_limit();

-- recompute recipient honour tier on each new kudo
CREATE TRIGGER trg_sync_recipient_honour
  AFTER INSERT ON public.kudo_recipients
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_recipient_honour();

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.departments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudo_recipients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudo_hashtags     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudo_hearts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudo_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_redemptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_boxes      ENABLE ROW LEVEL SECURITY;

-- ---- departments ----------------------------------------------------------
CREATE POLICY departments_select_authenticated ON public.departments
  FOR SELECT TO authenticated USING (true);

-- ---- profiles -------------------------------------------------------------
CREATE POLICY profiles_select_authenticated ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ---- hashtags -------------------------------------------------------------
CREATE POLICY hashtags_select_authenticated ON public.hashtags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY hashtags_insert_authenticated ON public.hashtags
  FOR INSERT TO authenticated WITH CHECK (true);

-- ---- kudos ----------------------------------------------------------------
CREATE POLICY kudos_select_authenticated ON public.kudos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY kudos_insert_self ON public.kudos
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- ---- kudo_recipients ------------------------------------------------------
CREATE POLICY kudo_recipients_select ON public.kudo_recipients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY kudo_recipients_insert ON public.kudo_recipients
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.kudos WHERE id = kudo_id AND sender_id = auth.uid())
  );

-- ---- kudo_hashtags --------------------------------------------------------
CREATE POLICY kudo_hashtags_select ON public.kudo_hashtags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY kudo_hashtags_insert ON public.kudo_hashtags
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.kudos WHERE id = kudo_id AND sender_id = auth.uid())
  );

-- ---- kudo_hearts ----------------------------------------------------------
CREATE POLICY kudo_hearts_select ON public.kudo_hearts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY kudo_hearts_insert_self ON public.kudo_hearts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY kudo_hearts_delete_self ON public.kudo_hearts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---- kudo_images ----------------------------------------------------------
CREATE POLICY kudo_images_select_authenticated ON public.kudo_images
  FOR SELECT TO authenticated USING (true);

CREATE POLICY kudo_images_insert_sender ON public.kudo_images
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.kudos WHERE id = kudo_id AND sender_id = auth.uid())
  );

CREATE POLICY kudo_images_delete_sender ON public.kudo_images
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.kudos WHERE id = kudo_id AND sender_id = auth.uid())
  );

-- ---- gift_redemptions -----------------------------------------------------
CREATE POLICY gift_redemptions_select_authenticated ON public.gift_redemptions
  FOR SELECT TO authenticated USING (true);

-- ---- secret_boxes ---------------------------------------------------------
CREATE POLICY secret_boxes_select_self ON public.secret_boxes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY secret_boxes_open_self ON public.secret_boxes
  FOR UPDATE TO authenticated
  USING      (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STORAGE
-- ============================================================================
-- The `kudo-images` bucket is private; reads use signed URLs at render time.
-- Created in migration 0014.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kudo-images',
  'kudo-images',
  false,
  5242880,                                            -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies on storage.objects (any authenticated user can read; owner-only writes).
CREATE POLICY kudo_images_read_authenticated ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kudo-images');

CREATE POLICY kudo_images_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kudo-images' AND owner = auth.uid());

CREATE POLICY kudo_images_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'kudo-images' AND owner = auth.uid());

-- ============================================================================
-- SEED DATA — see supabase/seed.sql + migration 0010 (hashtags) + 0011
-- (departments). Not duplicated here to keep this file as a structural
-- snapshot rather than a data dump.
-- ============================================================================
