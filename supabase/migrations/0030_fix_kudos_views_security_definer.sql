-- ============================================================================
-- Migration 0030 — Restore web compatibility after migration 0022
-- ============================================================================
-- Problems introduced by migration 0022 (`anonymity_and_moderation`):
--
--   1. The combination
--        REVOKE SELECT ON public.kudos FROM authenticated;
--        CREATE VIEW public.kudos_feed WITH (security_invoker = true) ...
--      raised `permission denied for table kudos` whenever an authenticated
--      client read from `kudos_feed` or `kudos_with_stats`. With
--      `security_invoker = true` the view runs under the caller's role,
--      and that role no longer has SELECT on the underlying table.
--
--   2. Migration 0022 also dropped the SELECT RLS policy on `kudos` for
--      `authenticated` (`DROP POLICY IF EXISTS kudos_select_authenticated`)
--      without replacing it. As a side-effect, the new
--      `kudo_recipients_select` policy — which uses
--      `EXISTS (SELECT 1 FROM public.kudos k WHERE ...)` — could never
--      satisfy the EXISTS clause for non-authors, so `kudo_recipients`
--      embeds returned empty and recipient names disappeared from feeds.
--
-- Fix:
--   1. GRANT SELECT ON public.kudos back to `authenticated`. This is a
--      pragmatic departure from migration 0022's "force-read-through-view"
--      stance: that approach is incompatible with PostgREST clients that
--      query related tables (kudo_recipients, kudo_hearts, etc.) whose
--      RLS depends on EXISTS-subqueries against `kudos`. RLS still
--      enforces row-level filtering — see (3).
--
--   2. (Was step 2 in the original 0030.) Skipped — view recreation
--      without security_invoker turned out not to be sufficient on its
--      own; restoring the privilege + RLS policy is the minimal fix.
--
--   3. Re-add the SELECT RLS policy on `kudos` for `authenticated`. The
--      USING clause mirrors `kudos_feed`'s WHERE clause so non-authors
--      cannot see soft_hidden/spam rows even when reading directly from
--      `kudos`. Note: the sender_id redaction CASE in `kudos_feed` is a
--      column transform that cannot be expressed in RLS — clients
--      reading `kudos` directly will see un-redacted sender_id. The web
--      client already performs the equivalent redaction in JS (see
--      src/app/kudos/actions.ts), so this is acceptable for now. iOS
--      should continue using `kudos_feed` to get DB-side redaction.
-- ============================================================================

BEGIN;

-- 1. Restore table privilege.
GRANT SELECT ON public.kudos TO authenticated;

-- 2. Re-add SELECT RLS policy. Filter mirrors kudos_feed's WHERE clause.
DROP POLICY IF EXISTS kudos_select_authenticated ON public.kudos;

CREATE POLICY kudos_select_authenticated ON public.kudos
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    OR sender_id = auth.uid()
  );

COMMIT;

NOTIFY pgrst, 'reload schema';
