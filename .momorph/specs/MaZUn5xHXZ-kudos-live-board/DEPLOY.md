# Sun* Kudos – Live Board · Production Deploy Checklist

**Last updated**: 2026-04-20
**Owner**: Frontend + Platform on-call
**Associated phase**: Phase 11 (T109 — production deploy)

---

## 1. Environment variables

| Name | Scope | Required? | Source |
|------|-------|-----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | ✅ yes | Supabase project settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | ✅ yes | Supabase project settings → API → anon `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** / CI-only | ⚠️ yes, but NEVER expose client-side | Supabase project settings → API → `service_role` key |
| `NEXT_PUBLIC_EVENT_START_AT` | Client + Server | ✅ yes | Launch timestamp ISO-8601 string |

**Hard rule**: only `NEXT_PUBLIC_*` variables ship into the Cloudflare
Workers client bundle. `SUPABASE_SERVICE_ROLE_KEY` is injected at build
/ deploy time via Wrangler secrets and only used by server-side code
paths (migrations, back-fills, admin tooling). No client code imports
it.

---

## 2. Migration order

Production migrations are **append-only**. Apply in order via the
Supabase CLI linked to the production project:

```sh
# From repo root, with the Supabase CLI linked to prod:
supabase db push
```

This runs any unapplied migrations from `supabase/migrations/` in
lexical order:

1. `0001_init_kudos_schema.sql` — departments, users, hashtags, kudos,
   kudo_hashtags, kudo_hearts, kudo_attachments (7 tables)
2. `0002_rls_policies.sql` — row-level security on all 7 tables
3. `0003_spotlight_view.sql` — materialised `spotlight_recipients_v`
4. `0004_indices.sql` — covering indices for `/kudos` hot paths

**Never** run `supabase db reset` against prod — that drops schemas.
If a migration errors, investigate the error, fix the migration file
(if not yet committed) or roll forward with a compensating migration
(see §5 below).

---

## 3. Seed data

- `supabase/seed.sql` is **dev-only**. It is loaded by
  `supabase start` for local dev and *not* picked up by `db push`.
- Reference data that genuinely ships to prod — departments
  (`departments`) and the canonical hashtag list (`hashtags`) — are
  inserted from idempotent migrations using
  `insert … on conflict (slug) do nothing`, so re-running them is a
  no-op.
- Do not copy avatar / sample-image fixture rows to prod. Those exist
  only for the local-dev fixture set under `public/images/kudos/`.

---

## 4. Pre-deploy lint

```sh
supabase db lint
```

Runs the Supabase SQL linter (policy + index + type checks). Zero
warnings gate the deploy. Known safe signals (safelist in PR
description):

- `0003_spotlight_view.sql`: view is materialised — acceptable.
- `kudos.body`: `text` column — acceptable (no length limit by
  product decision).

Additionally, before promoting staging → prod:

```sh
yarn lint && yarn typecheck && yarn test:run && yarn build
```

All four must be green.

---

## 5. Rollback strategy

Migrations are append-only. If a deployed migration needs to be
reverted:

1. **Do not** delete or edit the original file.
2. Write a new compensating migration — `000N_revert_000M_reason.sql`.
3. Land it via the same PR flow and `supabase db push`.
4. Document the compensating migration in the PR description +
   CHANGELOG (so the next migration author knows the history).

Example:

```
supabase/migrations/
├── 0001_init_kudos_schema.sql
├── 0002_rls_policies.sql
├── 0003_spotlight_view.sql
├── 0004_indices.sql
└── 0005_revert_0004_unused_index.sql   ← compensating
```

Code-level rollback (revert a bad UI change) is the standard
Cloudflare Workers route: `wrangler rollback` points `/kudos` back to
the previous deployment in <60 s.

---

## 6. Post-deploy smoke test

Run against the production URL immediately after deploy:

1. `GET /kudos` (signed-out) → 302 to `/login?next=/kudos`.
2. Sign in with a Google account on the allow-listed domain.
3. `GET /kudos` (signed-in, empty DB) → hero + composer pill visible,
   "Hiện tại chưa có Kudos nào." empty-state copy visible.
4. `GET /kudos` (signed-in, seeded test account) → ≥ 1 `KudoPostCard`
   rendered with sender + recipient + hearts count.
5. Heart a kudo (non-self) → counter flips optimistically within
   150 ms, Server Action resolves within 1 s, no toast.
6. Copy-link on a kudo → clipboard contains the permalink, toast
   surfaces `kudos.card.copyToast` copy.
7. `/kudos?hashtag=dedicated` and `/kudos?department=engineering`
   both render filtered feeds or empty-state variant.
8. Open DevTools Network tab → bundle size ≤ 85 KB for the `/kudos`
   route payload (TR-003 target).
9. Run the Lighthouse panel at 3G throttle → LCP < 2.5 s, CLS < 0.1,
   Performance ≥ 80.

If any step fails: `wrangler rollback` first, then open a bug.

---

## 7. Generated types

After running migrations on prod (or staging, whichever is first):

```sh
supabase gen types typescript --linked > src/types/database.ts
```

Commit the regenerated file in the same deploy PR so the build's
`tsc --noEmit` stays in sync with the DB schema.
