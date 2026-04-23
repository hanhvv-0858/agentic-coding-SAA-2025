# Implementation Plan: Sun\* Kudos – Live Board

**Frame**: `MaZUn5xHXZ-kudos-live-board` (Figma node `2940:13431`)
**Spec**: [`spec.md`](./spec.md) (~600 lines, 23 FRs / 12 TRs / 10 SCs)
**Design-style**: [`design-style.md`](./design-style.md) (~920 lines)
**Date**: 2026-04-20
**Last Updated**: 2026-04-20
**Status**: Draft (v2)
**Target Route**: `/kudos`

> **v2 — pivoted from mock-first to Supabase-from-day-one** per stakeholder
> decision (2026-04-20). Phase 6 (mock→backend swap) removed; Phase 1 now
> includes migrations + seed; Server Actions call `@/libs/supabase/server`
> directly. See §Database Schema (new) and §Data Layer Plan (rewritten).

---

## Summary

Build the **social heart of SAA 2025** — the `/kudos` Live board — as a
Server-Component-first Next.js 15 page that renders three vertical slabs
(A KV hero + composer pill, B Highlight carousel + Spotlight word-cloud,
C+D All Kudos feed + sticky personal-stats sidebar) over a dark
`#00101A` shell. Every interactive widget (heart, filter dropdowns,
carousel, spotlight pan/zoom, copy-link, composer hand-off) ships as a
small `"use client"` island; everything else is RSC. **Backend is
Supabase-from-day-one** (constitution §V): Phase 1 lands the schema
migrations, RLS policies, seed data, and Server Actions that call
`@/libs/supabase/server` directly. No mock-provider indirection — types
are generated from the live schema via `supabase gen types typescript`,
and every Server Action returns rows the UI consumes verbatim.

**Phasing** (each phase a deployable vertical slice):

| Phase | Stories | Outcome |
|---|---|---|
| 0 | — | Asset prep + folder scaffold |
| 1 | foundation + DB | Migrations + RLS + seed + generated types + Server Action skeleton + route shell + i18n + tokens |
| 2 | US1 P1 | Feed read (real Supabase query) + KudoPostCard + EmptyState + skeleton |
| 3 | US2 P1 + US3/US4 P1 | Heart toggle (optimistic, real INSERT/DELETE) + hashtag/department filters |
| 4 | US5 P1 + US6 P2 + US7 P2 + US8 P2 | Highlight carousel, Spotlight pan/zoom, sidebar stats, composer hand-off |
| 5 | US9 P3 | Reduced-motion sweep, axe-core gate, polish + RLS integration tests + production deploy checklist |

---

## Technical Context

| Area | Choice |
|---|---|
| **Language / Framework** | TypeScript 5.x (strict) · Next.js 15 App Router · React 19 |
| **UI Library** | React Server Components by default; `"use client"` islands for `HeartButton`, `FilterDropdown`, `HighlightCarousel`, `SpotlightBoard`, `SunnerSearchPill`, `CopyLinkButton`, `KudoListClient` |
| **Styling** | TailwindCSS v4 with `@theme inline` tokens in `src/app/globals.css`; arbitrary-value utilities for composite shadows (e.g. shadow utility referencing `--shadow-kudo-card`) — bracket-class literals wrapped in fenced `tsx` / `css` / `html` blocks only (constitution §V; Tailwind v4 scans plain markdown and a stray bracket utility in a table cell triggers a build failure) |
| **State** | Local `useState` + `useOptimistic` + `useTransition` per island; one module-level `Map<kudoId,{count,hearted}>` shared via `useSyncExternalStore` for FR-009 carousel↔feed sync |
| **Data fetching** | RSC `Promise.all` in `page.tsx`; mutations via Server Actions in `src/app/kudos/actions.ts` (TR-005); each action calls `await createClient()` from `@/libs/supabase/server` then `.from(...).select(...)`; cache strategy `Cache-Control: private, no-store` (session-gated) |
| **i18n** | `getMessages()` + new `kudos.*` namespace in `src/messages/{vi,en}.json`; `Messages = typeof vi` auto-infers types |
| **Icons** | Existing `<Icon>` sprite in `src/components/ui/Icon.tsx`; extended with `heart`, `heart-filled`, `search`, `pencil`, `hashtag`, `building`, `arrow-left`, `arrow-right`, `copy-link`, `eye`, `gift` |
| **Analytics** | Extend `AnalyticsEvent` union in `src/libs/analytics/track.ts` with 8 new event types (see §Token & i18n plan). Plan supersedes spec FR-021's three placeholder names (`screen_view` / `kudo_hearted` / `kudo_filter`) with the namespaced `kudos_*` set below — the underlying coverage (feed view + heart + filter) is preserved, granularity is finer (compose hand-off, copy-link, carousel/spotlight gestures). |
| **Testing** | Vitest + `@testing-library/react` + happy-dom (unit/integration); Playwright + `@axe-core/playwright` (E2E + a11y) |
| **Deployment** | Cloudflare Workers via OpenNext (existing pipeline) — no Node native modules |

---

## Constitution Compliance Check

*GATE: must pass before implementation begins.* Each spec TR-* mapped to
the constitution rule it satisfies.

| Spec ref | Constitution rule | Compliance | Status |
|---|---|---|---|
| TR-001 (Server Component route) | §V "Prefer Server Components by default" | `src/app/kudos/page.tsx` is RSC; reads `searchParams`, runs `Promise.all`, redirects on missing session (mirrors Awards `redirect("/login")` pattern) | **Planned** |
| TR-002 (client islands list) | §V "`'use client'` only when needed" | 7 islands listed, each justified by browser API / event handler / state | **Planned** |
| TR-003 (≤ 85 KB JS) | §V "Cloudflare Workers — keep bundle minimal" | Lazy-load Spotlight + carousel non-center slides; ship pan/zoom hand-rolled (~100 LOC) per Q9 | **Planned** |
| TR-004 (LCP < 2.5 s) | §II "WCAG/Performance" + §V "next/image priority" | Hero text is LCP candidate; KV image `priority` desktop, `loading="lazy"` mobile | **Planned** |
| TR-005 (Server Actions for mutations) | §V "Data fetching in Server Components or Server Actions" | `src/app/kudos/actions.ts` exports `toggleKudoHeart` etc.; `revalidateTag("kudos")` post-mutation | **Planned** |
| TR-006 (idempotent heart endpoint) | §IV "Input validation server-side" | UNIQUE `(user_id, kudo_id)` enforced as composite PK on `kudo_hearts`; Server Action uses `INSERT ... ON CONFLICT DO NOTHING` for add and `DELETE` for remove — both idempotent | **Planned** |
| TR-007 (no new top-level deps unless justified) | §V "Avoid large dependencies" | Carousel: hand-roll CSS scroll-snap (~60 LOC) — recommended over embla. Pan/zoom: hand-roll Pointer Events (~100 LOC) — Q9 default. `@tanstack/react-virtual` only added IF feed > 30 items in production (TR-011) — gated | **Compliant** |
| TR-008 (reuse + new tokens) | §V "Use design tokens from Tailwind config" | All listed in §Token plan below; lifted from design-style §TR-008 verbatim | **Planned** |
| TR-009 (test coverage) | §III "Test-First Development" | 4 unit suites + 3 integration + 1 E2E + 1 a11y file (see §Testing) | **Planned** |
| TR-010 (responsive imagery) | §II "Images responsive via `next/image`" | All avatars + thumbnails use `<Image>` with `sizes` | **Planned** |
| TR-011 (virtualise > 30) | §V "Tree-shakeable" | Conditional dep — only loaded if needed | **Planned** |
| TR-012 (precomputed Spotlight coords) | §V "Workers CPU limits" | Server returns `x/y` 0–1 floats; client only multiplies; no client-side d3-cloud | **Planned** |
| FR-003 (auth gate) | §IV "Verify session via Supabase Auth middleware" | RSC calls `supabase.auth.getUser()` → `redirect('/login?next=/kudos')`. Reuses Awards' try/catch + redirect shape (`src/app/awards/page.tsx`) but adds the `?next=` query param per spec FR-003 (Awards itself redirects to `/login` without it) | **Planned** |
| FR-011 (i18n only) | §I "No hardcoded strings" | All copy in `kudos.*`; Vitest snapshot fails on string literals in JSX | **Planned** |
| FR-013 (Copy Link clipboard) | §IV "No `dangerouslySetInnerHTML`" | `navigator.clipboard.writeText`; fallback `document.execCommand("copy")` on hidden textarea | **Planned** |
| FR-018 (single H1 + `<h2>` sections) | §II WCAG 2.2 AA | Tested via axe-core in Phase 5 | **Planned** |
| FR-020 (gesture scoping) | §II "no body scroll jank" | `overflow: hidden` on carousel + Spotlight containers; `touch-action: pan-y` outside, `none` inside | **Planned** |
| FR-021 (analytics) | §V (no rule violation) | New `AnalyticsEvent` union members; emits via existing `track()` | **Planned** |
| FR-022 (try/catch supabase) | §IV (graceful auth failure) | Mirrors Awards page `try/catch` + `user = null` pattern | **Planned** |
| §I — Folder structure | All new code under `src/components/kudos/` (feature scope) + `src/app/kudos/` (route) | **Planned** |
| §I — `@/*` imports only | Enforced by ESLint `no-restricted-imports` (already in repo config) | **Compliant** |
| §III — Co-located tests | Each component has `__tests__/<Name>.spec.tsx` sibling | **Planned** |
| §IV — XSS prevention | Body text rendered as plain string (Q11 default); no `innerHTML`; URLs auto-linkified via safe linkifier (no HTML injection) | **Planned** |
| §V — Supabase as DB layer (Principle V) | All persistent data lives in Supabase Postgres; migrations + RLS in `supabase/migrations/*.sql`; Server Actions use `@/libs/supabase/server` exclusively | **Planned (Compliant)** |

**No violations**. Compose flow `/kudos/new` is a separate spec and is
referenced as a navigation target only — out of scope for this plan.

---

## Architecture Decisions

### Frontend

- **Component pattern**: feature-scoped (`src/components/kudos/`) +
  route folder (`src/app/kudos/`). Each component is a single-purpose
  file; `KudoPostCard.tsx` composes inlined sub-pieces (sender,
  recipient, sent-icon, timestamp, content, action-bar) to keep slot
  count to design-style §17 spec.
- **State**: prefer **local + URL** state. Filters live in URL
  (`?hashtag=`, `?department=`); RSC re-renders on `searchParams`
  change. Heart state is per-card local + a tiny module-level shared
  store (FR-009) — **no React Context, no Redux, no SWR**. `useTransition`
  + `useOptimistic` cover mutation UX (TR-002).
- **Data fetching (initial)**: `page.tsx` runs `Promise.all` over
  7 server-side reads. Each read is a Server Action that calls
  `await createClient()` from `@/libs/supabase/server` and runs a typed
  `.from(...).select(...)` against the schema in §Database Schema.
- **Data fetching (mutations)**: Server Actions in `actions.ts`. Heart
  toggle returns the new authoritative `{count, hearted, multiplier?}`.
  Filter changes use `router.replace()` from a client component — no
  full page refresh needed because the list segment re-runs SSR.
- **Lazy mounting**: `<HighlightCarousel>` non-center slides and
  `<SpotlightBoard>` mount via `IntersectionObserver` (TR-003). Center
  carousel slide ships in initial SSR for LCP.
- **Shared heart sync (FR-009)**: a `heartsCache` module exposes
  `subscribe(id)` and `set(id, value)`; `useSyncExternalStore` reads it
  in both `<HeartButton>` instances. No new dep.

### Backend (Supabase-from-day-one)

- **API surface** (per spec §API Dependencies): the 11 `[predicted]`
  REST endpoints map 1:1 onto Server Actions in
  `src/app/kudos/actions.ts` — there is no public REST layer for MVP.
  Each Server Action's underlying query and mutation is sketched in
  §Data Layer Plan; the table below records the spec-endpoint → action
  mapping for traceability:
  - `GET /kudos` → `getKudoFeed(filters, cursor)` (paginated by `created_at` keyset, filterable by `hashtag` / `department`)
  - `GET /kudos?sort=hearts&limit=5&timeframe=event` → `getHighlightKudos(filters)`
  - `GET /kudos/spotlight` → `getSpotlight()` returns `{total, recipients: [{name, x, y, weight, recent_kudo}]}` (TR-012 — server-precomputed coords)
  - `POST /kudos/:id/hearts` → `toggleKudoHeart(id, action)` (idempotent — see §Database Schema, TR-006)
  - `GET /users/me/kudos-stats` → `getMyKudosStats()` (US7)
  - `GET /users/latest-giftees?limit=10` → `getLatestGiftees(limit)` (D.3)
  - `GET /hashtags` → `getKudoHashtags()`; `GET /departments` → `getKudoDepartments()`
  - `GET /users?search=` → `searchSunner(query)` (sunner search A.1 + B.7.3, debounced 300 ms)
- **Idempotency** (TR-006): `kudo_hearts` uses composite PK
  `(kudo_id, user_id)`; the `addHeart` Server Action runs
  `INSERT ... ON CONFLICT DO NOTHING`, `removeHeart` runs `DELETE`.
  Both are naturally idempotent — see §Database Schema.
- **Special-day multiplier** (Q13 default A): heart-toggle response
  includes `{multiplier: 1|2, reason?: string}`; client renders
  micro-confetti on `multiplier > 1`.

### Database (in scope — see §Database Schema)

- Schema, RLS, and seed migrations ship in Phase 1 of this plan. The
  11 `[predicted]` endpoints from spec §API Dependencies map onto the
  Server Actions in `src/app/kudos/actions.ts` (no separate REST layer).
  Full DDL + RLS preview lives in §Database Schema below; migration
  files land under `supabase/migrations/`.

### Integration points

- **`/` Homepage** (`src/app/page.tsx`) — already links via
  `KudosPromoBlock`. No change.
- **Header nav** (`src/data/navItems.ts`) — already lists `/kudos` with
  `common.nav.sunKudos` key; `NavLink` active-state auto-highlights via
  `usePathname()` (verified in `src/components/layout/NavLink.tsx`).
  Verify `--color-nav-dot` (red dot) renders on `/kudos` like `/awards`
  does — no code change expected.
- **`<QuickActionsFab>`** (`src/components/shell/QuickActionsFab.tsx`) —
  already shipped; Live board's `page.tsx` reads
  `messages.common.fab` and passes as `labels` prop, mirroring Homepage
  + Awards (per FAB plan §Notes "Scope discipline").
- **`<SiteHeader>`, `<SiteFooter>`, `<NavLink>`, `<LanguageToggle>`,
  `<NotificationBell>`, `<ProfileMenu>`** — all reused verbatim.
- **`<Icon>`** — extended with 11 new sprite entries (see §Token plan).

---

## Database Schema

Schema, RLS, views, and triggers ship as numbered SQL files under
`supabase/migrations/`. Local apply via `supabase db reset`; production
applies migrations only (seed gated to non-production — see §Seed
strategy).

> **Schema lifecycle (plan-embedded → canonical)** — For now, this
> §Database Schema is the **authoritative source** for Live board DB
> work; migrations `0001..0004*.sql` are derived from it directly. Once
> `/momorph.specify` is run for **Viết Kudo** (`ihQ26W78P2`), we will
> run `/momorph.database` **once** covering both features to generate
> the project-wide canonical file at
> `.momorph/contexts/database-schema.sql`. At that point this section
> becomes a pointer to the canonical file, and any schema delta (likely
> minor refinements only — Live board + Viết Kudo share the same
> kudos/junction tables) lands as a follow-up migration. Option C per
> the 2026-04-20 pivot discussion — rationale: share tables across both
> features with one schema-design pass instead of two.

### Tables (8)

`profiles`, `departments`, `hashtags`, `kudos`, `kudo_recipients`
(junction), `kudo_hashtags` (junction), `kudo_hearts` (junction), and
`gift_redemptions` (§D.3 prize ledger — added migration 0005,
2026-04-21).

```sql
-- 0001_kudos_schema.sql (excerpt)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  department_id uuid references departments(id),
  created_at timestamptz default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_vi text not null,
  name_en text not null,
  created_at timestamptz default now()
);

create table hashtags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  created_at timestamptz default now()
);

create table kudos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table kudo_recipients (
  kudo_id uuid references kudos(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,
  primary key (kudo_id, recipient_id)
);

create table kudo_hashtags (
  kudo_id uuid references kudos(id) on delete cascade,
  hashtag_id uuid references hashtags(id) on delete cascade,
  primary key (kudo_id, hashtag_id)
);

create table kudo_hearts (
  kudo_id uuid references kudos(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (kudo_id, user_id)
);

-- indexes
create index kudos_created_at_desc on kudos (created_at desc);
create index kudo_hearts_user_id on kudo_hearts (user_id);
create index kudo_hashtags_hashtag_id on kudo_hashtags (hashtag_id);

-- 0005_gift_redemptions.sql — §D.3 Secret Box prize ledger. One row
-- per physical prize a Sunner has redeemed. Surfaced by
-- getLatestGiftees() as the "10 SUNNER NHẬN QUÀ MỚI NHẤT" sidebar.
create table gift_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  gift_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  source text not null default 'secret_box',
  redeemed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index gift_redemptions_redeemed_at_desc on gift_redemptions (redeemed_at desc);
create index gift_redemptions_user_id on gift_redemptions (user_id);
```

### RLS Policies (`0002_kudos_rls.sql`)

Every table is RLS-enabled. Reads are open to authenticated users; writes
are scoped to the row owner. Tables with no INSERT/UPDATE/DELETE policy
deny those operations entirely (departments, profiles updates by others,
etc.).

```sql
-- 0002_kudos_rls.sql (excerpt)
alter table profiles enable row level security;
alter table departments enable row level security;
alter table hashtags enable row level security;
alter table kudos enable row level security;
alter table kudo_recipients enable row level security;
alter table kudo_hashtags enable row level security;
alter table kudo_hearts enable row level security;

-- profiles: anyone authenticated can read; users can update only their own
create policy "profiles_select_authenticated" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on profiles for update using (id = auth.uid());

-- departments + hashtags: read-all for authenticated; admin-only writes (no policy => denied)
create policy "departments_select_authenticated" on departments for select using (auth.role() = 'authenticated');
create policy "hashtags_select_authenticated" on hashtags for select using (auth.role() = 'authenticated');
create policy "hashtags_insert_authenticated" on hashtags for insert with check (auth.role() = 'authenticated');

-- kudos: read-all for authenticated; INSERT only as self
create policy "kudos_select_authenticated" on kudos for select using (auth.role() = 'authenticated');
create policy "kudos_insert_self" on kudos for insert with check (sender_id = auth.uid());

-- kudo_recipients + kudo_hashtags: insert allowed only when associated kudo is owned by inserter
create policy "kudo_recipients_select" on kudo_recipients for select using (auth.role() = 'authenticated');
create policy "kudo_recipients_insert" on kudo_recipients for insert with check (
  exists (select 1 from kudos where id = kudo_id and sender_id = auth.uid())
);
create policy "kudo_hashtags_select" on kudo_hashtags for select using (auth.role() = 'authenticated');
create policy "kudo_hashtags_insert" on kudo_hashtags for insert with check (
  exists (select 1 from kudos where id = kudo_id and sender_id = auth.uid())
);

-- kudo_hearts: read-all; INSERT/DELETE only as self
create policy "kudo_hearts_select" on kudo_hearts for select using (auth.role() = 'authenticated');
create policy "kudo_hearts_insert_self" on kudo_hearts for insert with check (user_id = auth.uid());
create policy "kudo_hearts_delete_self" on kudo_hearts for delete using (user_id = auth.uid());

-- gift_redemptions (§D.3, migration 0005): authenticated Sunners can
-- read the org-wide ledger. Writes are driven by the Secret Box backend
-- via service_role only — no end-user INSERT/UPDATE/DELETE policy.
alter table gift_redemptions enable row level security;
create policy "gift_redemptions_select_authenticated" on gift_redemptions
  for select using (auth.role() = 'authenticated');
```

### Views (`0003_kudos_views.sql`)

To keep the feed query simple, a `kudos_with_stats` view denormalises
`hearts_count` so the UI doesn't need a GROUP BY in the hot path:

```sql
create view kudos_with_stats as
select
  k.*,
  coalesce(h.cnt, 0) as hearts_count
from kudos k
left join (
  select kudo_id, count(*)::int as cnt from kudo_hearts group by kudo_id
) h on h.kudo_id = k.id;
```

`has_hearted` is computed per-user in the Server Action via either an
`exists()` subquery or a `left join kudo_hearts on user_id = auth.uid()`
— recommend the join (one round-trip; predictable plan).

### Triggers (`0004_profiles_trigger.sql`)

Insert trigger on `auth.users` auto-provisions a `profiles` row on first
sign-in (copies `email`, leaves `display_name` nullable for the user to
set in profile settings later). Avoids the orphan-FK class of bug when a
brand-new user lands on `/kudos` before anything else.

### Seed strategy (`supabase/seed.sql`)

`seed.sql` populates:

- **Departments** — originally 6 generic `SVN-*` placeholders; replaced
  on 2026-04-21 by migration `0011_seed_real_departments.sql` (spec
  `WXK5AYB_rG`) with the 49 canonical Sun\* organisational codes
  (`CTO`, `SPD`, `FCOV`, `CEVC1`, `CEVC2`, `STVC - R&D`, ...). Department
  codes are proper nouns: `name_vi == name_en == code`. Migration
  `0012_purge_legacy_departments.sql` cleans up 5 pre-SVN legacy
  rows (`BIZ`, `DES`, `HR`, `PM`, `QA`).
- **~10 popular hashtags** — seeded from the Q4 default set: `dedicated`,
  `creative`, `teamwork`, `mentor`, `ontime`, `leadership`, `innovation`,
  `customer-first`, `wellness`, `fun` (slugs lowercased; `label` holds
  the display form).
- **~30 sample kudos** — distributed across the 6 departments and the
  10 hashtags, with varied hearts counts to exercise the highlight
  carousel's "top 5 by hearts" ordering; 2 of the 8 fixture profiles
  receive multiple kudos so the Spotlight word-cloud has non-uniform
  `weight` values.
- **2 RLS fixture users** (`rls-user-a@test.sun`, `rls-user-b@test.sun`)
  with fixed passwords — used only by `tests/integration/rls/*`.

Production deploy runs schema migrations only — seed is gated by
`NODE_ENV !== 'production'` or manual `supabase db reset` (production
never runs `db reset`).

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/MaZUn5xHXZ-kudos-live-board/
├── spec.md              # ~600 lines, 23 FR / 12 TR / 10 SC
├── design-style.md      # ~920 lines, all tokens + node IDs
├── plan.md              # THIS FILE
├── tasks.md             # next step (momorph.tasks)
└── assets/frame.png     # 1440×5862 reference export
```

### Source code — new files

| File | Purpose | Type |
|---|---|---|
| `src/app/kudos/page.tsx` | RSC route shell; auth gate; reads `searchParams`; `Promise.all` over 7 fetches; renders all sections | RSC |
| `src/app/kudos/loading.tsx` | Skeleton fallback — 1 hero + 1 carousel + 3 feed cards + 1 sidebar block | RSC |
| `src/app/kudos/error.tsx` | Page-level error boundary; logs + offers retry | RSC |
| `src/app/kudos/actions.ts` | Server Actions: `getKudoFeed`, `toggleKudoHeart`, `getHighlightKudos`, `getSpotlight`, `searchSunner`, `getKudoHashtags`, `getKudoDepartments`, `getMyKudosStats`, `getLatestGiftees` | Server |
| `src/types/kudo.ts` | App-facing type aliases (FilterState, FeedPage, KudosStats, LatestGiftee, SpotlightRecipient, HeartToggleResult) — `Kudo`/`Hashtag`/`Department` re-exported as derived aliases from generated `Database` types | Types |
| `src/types/database.ts` | Generated by `supabase gen types typescript --local` — Postgres-derived row types | Types (generated) |
| `supabase/migrations/0001_kudos_schema.sql` | 7 tables + indexes — see §Database Schema | Migration |
| `supabase/migrations/0002_kudos_rls.sql` | RLS enable + select/insert/delete policies | Migration |
| `supabase/migrations/0003_kudos_views.sql` | `kudos_with_stats` view (denormalised `hearts_count`) | Migration |
| `supabase/migrations/0004_profiles_trigger.sql` | `auth.users → profiles` auto-provision insert trigger | Migration |
| `supabase/seed.sql` | Local-dev seed: ~6 departments, ~10 hashtags, ~30 sample kudos | Seed |
| `src/libs/supabase/queries/kudos.ts` | **Optional** thin typed query helpers (`getFeed`, `toggleHeart`, etc.). May be collapsed into `actions.ts` directly if the wrapper layer earns no reuse — call out the choice in PR description | Server (optional) |
| `src/components/kudos/KudosHero.tsx` | A.1 — KV image + H1 + decorative KUDOS art | RSC |
| `src/components/kudos/ComposerPill.tsx` | A.1 — opens compose route/modal; emits `track("kudos_compose_open", source: "liveboard_pill")` | Client |
| `src/components/kudos/SunnerSearchPill.tsx` | A.1 sibling — debounced search dropdown | Client |
| `src/components/kudos/HighlightHeader.tsx` | B.1 caption + "HIGHLIGHT KUDOS" `<h2>` | RSC |
| `src/components/kudos/FilterDropdown.tsx` | B.1.1 + B.1.2 — combobox pattern; supports both hashtag + department via `kind` prop | Client |
| `src/components/kudos/HighlightCarousel.tsx` | B.2 — CSS scroll-snap + arrow controls + roving tabindex | Client |
| `src/components/kudos/HighlightKudoCard.tsx` | B.3 — 528×hug, 3-line clamp | RSC |
| `src/components/kudos/CarouselPager.tsx` | B.5 — "n/5" + prev/next | Client |
| `src/components/kudos/SpotlightHeader.tsx` | B.6 caption + "SPOTLIGHT BOARD" `<h2>` | RSC |
| `src/components/kudos/SpotlightBoard.tsx` | B.7 — pan/zoom canvas; hand-rolled Pointer Events; lazy via IntersectionObserver. Inlines B.7.1 `SpotlightCounter`, B.7.2 `SpotlightPanZoomControls`, and B.7.3 `SpotlightSearch` per design-style §Implementation Mapping (no separate files for the three sub-pieces) | Client |
| `src/components/kudos/AllKudosHeader.tsx` | C.1 caption + "ALL KUDOS" `<h2>` | RSC |
| `src/components/kudos/KudoPostCard.tsx` | C.3/C.5/C.6/C.7 — main cream card; composes 7 inline slots | RSC (heart + copy-link inside are client) |
| `src/components/kudos/KudoListClient.tsx` | Client wrapper around SSR'd initial page; appends new pages via Server Action; FR-009 cache subscriber | Client |
| `src/components/kudos/HeartButton.tsx` | C.4.1 — `useOptimistic` + 300 ms debounce + reduced-motion branch | Client |
| `src/components/kudos/CopyLinkButton.tsx` | C.4.2 — clipboard + 1.5 s "Đã copy!" swap + toast | Client |
| `src/components/kudos/KudoParticipant.tsx` | Sender + Recipient (same shape per design-style §17a/17b) | RSC |
| `src/components/kudos/KudoImageRow.tsx` | C.3.6 — up to 5 thumbnails | RSC |
| `src/components/kudos/KudoHashtagRow.tsx` | C.3.7 — clickable hashtag pills (FR-008) | Client |
| `src/components/kudos/KudoStatsSidebar.tsx` | D — sticky 422-wide sidebar | RSC |
| `src/components/kudos/StatsBlock.tsx` | D.1 — 5 metric rows + divider + Mở quà CTA | RSC |
| `src/components/kudos/MoQuaButton.tsx` | D.1.8 — disabled when 0 boxes (FR-010) | Client (only because of disabled tooltip) |
| `src/components/kudos/LatestGifteeList.tsx` | D.3 — 10 recipients | RSC |
| `src/components/kudos/EmptyState.tsx` | FR-002 — generic empty-state message | RSC |
| `src/components/kudos/InlineError.tsx` | Per-block fetch failure (US9 #4) | RSC |
| `src/components/kudos/KudoCardSkeleton.tsx` | 200 ms-delayed skeleton | RSC |
| `src/components/kudos/hooks/useHeartsCache.ts` | `useSyncExternalStore` reader + setter | Client |
| `src/components/kudos/hooks/useReducedMotion.ts` | `matchMedia('(prefers-reduced-motion: reduce)')` reader | Client |
| `src/components/kudos/hooks/useDebouncedCallback.ts` | 300 ms debouncer (FR-007) | Client |
| `src/components/kudos/hooks/usePanZoom.ts` | Pointer Events pan + wheel/pinch zoom (Spotlight) | Client |
| `src/components/kudos/__tests__/HeartButton.spec.tsx` | TR-009 unit | Test |
| `src/components/kudos/__tests__/FilterDropdown.spec.tsx` | TR-009 unit | Test |
| `src/components/kudos/__tests__/KudoPostCard.spec.tsx` | TR-009 unit | Test |
| `src/components/kudos/__tests__/HighlightCarousel.spec.tsx` | TR-009 unit | Test |
| `src/components/kudos/__tests__/CopyLinkButton.spec.tsx` | FR-013 | Test |
| `src/components/kudos/__tests__/SpotlightBoard.spec.tsx` | US6 | Test |
| `src/components/kudos/__tests__/heartsCache.spec.ts` | FR-009 sync | Test |
| `src/components/kudos/__tests__/page.integration.spec.tsx` | TR-009 integration: SSR with filters, redirect, empty state | Test |
| `tests/e2e/kudos.spec.ts` | Playwright happy-path: sign-in → /kudos → heart → reload → still hearted → filter narrows → carousel next → FAB Viết Kudo | Test |
| `tests/e2e/kudos.a11y.spec.ts` | axe-core sweep on /kudos at 375×812 + 1440×900 (SC-003) | Test |

### Source code — modified files

| File | Change | Why |
|---|---|---|
| `src/app/globals.css` | Add 11 NEW tokens listed in design-style §TR-008 (see §Token plan) inside `@theme inline` block | TR-008 |
| `src/messages/vi.json` | Add `kudos.*` namespace (8 sub-namespaces — see §Token plan) | FR-011 |
| `src/messages/en.json` | Add same `kudos.*` keys with EN copy (Marketing-drafted; ship VI placeholders if EN delayed) | FR-011 |
| `src/libs/analytics/track.ts` | Extend `AnalyticsEvent` union with 7 new event types | FR-021 |
| `src/components/ui/Icon.tsx` | Add sprite entries: `heart`, `heart-filled`, `search`, `pencil`, `hashtag`, `building`, `arrow-left`, `arrow-right`, `copy-link`, `eye`, `gift` | Spec §Dependencies |
| `src/data/navItems.ts` | **Verify only** — `/kudos` already present at row 3 (HEADER_NAV) and row 3 (FOOTER_NAV); no edit | — |
| `src/app/page.tsx` | **No change** — `KudosPromoBlock` already links to `/kudos` | — |
| `src/libs/supabase/server.ts` | **No change** — already exports `createClient()` (verified 2026-04-20) | — |
| `package.json` | **Verify only** — `@supabase/ssr ^0.10.2` and `@supabase/supabase-js ^2.103.3` already present (verified 2026-04-20); no new deps for the data layer | — |

### Source code — deleted

None. The Live board is purely additive.

### Dependencies

| Package | Change | Reason / alternative |
|---|---|---|
| (none — default) | — | Carousel hand-rolled with CSS scroll-snap (~60 LOC). Pan/zoom hand-rolled with Pointer Events (~100 LOC, Q9 default). IntersectionObserver native. `date-fns` already present for timestamp formatting. Toast uses existing pattern. |
| `@tanstack/react-virtual` | **Conditional** — added only if/when feed > 30 items in production | TR-011 — gates on real-data behaviour; not needed for MVP seed (~30 items) |
| `react-zoom-pan-pinch` (~12 KB gzipped) | **Rejected** — alternative to hand-roll | Q9 default is hand-roll; rationale: avoids bundle bloat (TR-003 ≤ 85 KB) and license risk; hand-roll covers pan + wheel zoom + pinch in one hook |
| `embla-carousel-react` (~9 KB) | **Rejected** — alternative to hand-roll | TR-007: CSS scroll-snap + a small swipe handler covers all 5 acceptance scenarios for US5 |

**Net dep change for MVP**: zero new top-level dependencies.

---

## Implementation Approach

Vertical slices. Each phase is independently deployable behind a feature
flag (or simply gated by absence of a route — phase 1 lands `/kudos`
returning the empty hero).

### Phase 0 — Asset prep

Skip-able for code, but required before Phase 2 has visual parity. Spec
§Dependencies lists 3 image assets that **do not exist yet** under
`public/images/kudos/`:

| Asset | Path | Source / OQ |
|---|---|---|
| KV hero keyvisual 1440×512 JPG | `public/images/kudos/kv-kudos-hero.jpg` | Figma `MM_MEDIA_KV Background` (`2940:13435`) |
| Decorative KUDOS logo art (SVN-Gotham baked PNG) | `public/images/kudos/kudos-logo-art.png` | Figma `2940:13441` |
| Spotlight wooden backdrop JPG | `public/images/kudos/spotlight-backdrop.jpg` | Figma `2940:14173` (`MM_MEDIA_Kudos`) — **OQ-DS-6** |
| Mở quà gift icon (optional) | sprite entry `gift` in `<Icon>` | Figma `2940:13497` decorative glyph |
| Sample sender/recipient avatars (8 unique) | `public/images/kudos/avatars/avatar-{1..8}.jpg` | Seed-only placeholders; real avatars in production come from Supabase Storage |
| Sample card attachment images (5 unique) | `public/images/kudos/samples/sample-{1..5}.jpg` | Seed-only placeholders |

**Action**: Design exports the 3 production assets; engineering
generates avatar/sample placeholders (256×256 cropped public-domain
photos) for local-dev seed data.

### Phase 1 — Foundation + DB

Make the route addressable, schema applied, types generated, Server
Action skeleton calling Supabase, tokens + i18n in place. Visually =
empty page with hero + composer pill (no carousel/feed yet) — but
backed by real Supabase reads (which return empty arrays from a freshly
seeded local DB until Phase 2 wires the queries).

| Step | Deliverable |
|---|---|
| 1.1 | Add 11 NEW tokens to `src/app/globals.css` (`@theme inline`) — see §Token plan; add `kudos.*` i18n namespace; add 8 analytics event types; extend `<Icon>` sprite with 11 glyphs |
| 1.2 | **NEW**: Prerequisite — install Supabase CLI (`brew install supabase/tap/supabase` on macOS, or `npm i -D supabase` locally; document preferred path in README). Then author `supabase/migrations/0001_kudos_schema.sql`, `0002_kudos_rls.sql`, `0003_kudos_views.sql`, `0004_profiles_trigger.sql` + `supabase/seed.sql`; apply locally via `supabase db reset` and verify with a smoke query |
| 1.3 | **NEW**: Generate TS types from schema → `src/types/database.ts` via `supabase gen types typescript --local > src/types/database.ts`; export `Kudo`, `Hashtag`, `Department` from `src/types/kudo.ts` as derived aliases over the generated row types. **Rule**: any subsequent migration must regenerate and commit `src/types/database.ts` in the same PR (enforced via CI `supabase db diff` check — see §Risk Assessment) |
| 1.4 | **NEW**: Server Actions skeleton in `src/app/kudos/actions.ts` calling `await createClient()` from `@/libs/supabase/server` (return empty arrays for now; real queries land in Phase 2/3) |
| 1.5 | Create `src/app/kudos/page.tsx` RSC shell — auth gate (mirror Awards `try/catch + redirect` pattern, plus `?next=/kudos`) + `Promise.all` over the Server Action stubs + render hero only |
| 1.6 | Create `loading.tsx` + `error.tsx` |
| 1.7 | Create `KudosHero` + `ComposerPill` + `SunnerSearchPill` components |
| 1.8 | Add a failing Vitest placeholder under `__tests__/` to lock TDD order |

**Acceptance**: navigating to `/kudos` while signed-in renders the hero
+ composer pill, the page passes `tsc --noEmit` and `yarn lint`.

### Phase 2 — US1 P1: Browse the live kudos feed

Implements US1 acceptance scenarios 1–6 + edge cases (empty, > 5 lines,
> 5 images, missing avatar).

| Step | Deliverable |
|---|---|
| 2.1 | Unit tests for `KudoPostCard` (TR-009): renders all 7 slots; body clamps to 5 lines; images cap at 5; hashtags cap at 5; missing avatar → monogram fallback (FR-016) |
| 2.2 | Implement `KudoParticipant`, `KudoImageRow`, `KudoHashtagRow`, `KudoPostCard` |
| 2.3 | Implement `EmptyState`, `KudoCardSkeleton`, `InlineError` |
| 2.4 | Implement `AllKudosHeader` + `KudoListClient` (no infinite scroll yet — just renders SSR'd page) |
| 2.5 | Promote `getKudoFeed()` from skeleton stub to real Supabase query — joins `kudos_with_stats → kudo_recipients → profiles` and `kudo_hashtags → hashtags`; orders by `created_at desc`; cursor-paginates via `created_at` keyset |
| 2.6 | Wire `page.tsx` → calls `getKudoFeed()` → renders feed beneath hero |
| 2.7 | Integration test: SSR `/kudos` with empty seed → "Hiện tại chưa có Kudos nào." renders (FR-002); SSR with seeded rows → cards render |
| 2.8 | Phase-2 visual QA against `assets/frame.png` for cream card stack |

### Phase 3 — US2 P1 (heart) + US3/US4 P1 (filters)

| Step | Deliverable |
|---|---|
| 3.1 | Unit tests for `HeartButton` (TR-009): toggles state, disabled when sender (FR-006), debounced 300 ms (FR-007), rolls back on network fail, respects reduced-motion |
| 3.2 | Implement `useDebouncedCallback`, `useReducedMotion`, `heartsCache`, `useHeartsCache` |
| 3.3 | Implement `HeartButton` with `useOptimistic` + `useTransition`; calls `toggleKudoHeart` Server Action — server-side does `INSERT ... ON CONFLICT DO NOTHING` (add) or `DELETE` (remove) on `kudo_hearts`, then re-reads the row from `kudos_with_stats` to return authoritative `{heartsCount, hasHearted, multiplier}` |
| 3.4 | Implement `CopyLinkButton` (FR-013) with 1.5 s label swap + toast |
| 3.5 | Wire `KudoCardActionBar` slot inside `KudoPostCard` to render both buttons |
| 3.6 | Unit tests for `FilterDropdown` (TR-009): keyboard nav, single-select, outside-click closes |
| 3.7 | Implement `FilterDropdown` (combobox pattern, `aria-haspopup="listbox"`) — covers B.1.1 + B.1.2 via `kind` prop |
| 3.8 | Wire `page.tsx` to read `searchParams.hashtag` + `searchParams.department` and pass to fetches; `FilterDropdown` calls `router.replace()` (FR-023) |
| 3.9 | Implement `KudoHashtagRow` click handler (FR-008) — applies hashtag filter |
| 3.10 | Integration test: `/kudos?hashtag=dedicated` SSRs filtered data (TR-009 — FR-014) |
| 3.11 | Toast queue infra (if not already present) — minimal `<Toaster>` in `app/kudos/layout.tsx` (or reuse global) |

### Phase 4 — US5 P1 (carousel) + US6 P2 (spotlight) + US7 P2 (sidebar) + US8 P2 (composer hand-off)

| Step | Deliverable |
|---|---|
| 4.1 | Implement `HighlightHeader`, `HighlightKudoCard`, `CarouselPager`, `HighlightCarousel` (CSS scroll-snap, arrow controls, roving tabindex) — uses shared `heartsCache` for FR-009 |
| 4.2 | Unit tests for `HighlightCarousel` (TR-009): N slides, edge-arrow disabled, pager updates, heart syncs |
| 4.3 | Implement `usePanZoom` hook (Pointer Events; ~100 LOC) |
| 4.4 | Implement `SpotlightHeader`, `SpotlightBoard` (lazy via IntersectionObserver, mounts when 100 px from viewport); precomputed coords returned by `getSpotlight()` Server Action (TR-012) |
| 4.5 | `SpotlightSearch` (B.7.3) inline — autocompletes from spotlight names; Enter → pans/centers + pulses match |
| 4.6 | Unit test for `SpotlightBoard`: renders 120 names, hover → tooltip within 200 ms, keyboard arrow-key roving (Q8 default) |
| 4.7 | Implement `KudoStatsSidebar`, `StatsBlock`, `MoQuaButton`, `LatestGifteeList`; sticky positioning per design-style §20 |
| 4.8 | Wire `MoQuaButton` disabled when `unopened === 0` (FR-010); navigates to `/gifts/open` (parked) → toast "Đang xây dựng" fallback |
| 4.9 | Wire `ComposerPill` click → `/kudos/new` + `track("kudos_compose_open", source: "liveboard_pill")`; FAB already emits its own event |
| 4.10 | Add `<QuickActionsFab labels={fabLabels} />` to `page.tsx` (mirror Awards) |

### Phase 5 — US9 P3: a11y, reduced-motion, polish

| Step | Deliverable |
|---|---|
| 5.1 | Reduced-motion sweep across all 12 motion entries from design-style §Motion (Vitest mocks `matchMedia`) |
| 5.2 | Skip-link `<a href="#feed">` at top of `page.tsx` (mirrors Awards) |
| 5.3 | Skeleton 200 ms delay (US9 #2) — wrap fetches in a delayed-loader pattern |
| 5.4 | Inline error state for each block (feed/carousel/spotlight/stats) — Promise.all with `.catch` per fetch |
| 5.5 | Offline branch: heart click queues + toast (US2 #7); listen to `navigator.onLine` |
| 5.6 | Playwright E2E (`tests/e2e/kudos.spec.ts`) — full happy path |
| 5.7 | Playwright a11y (`tests/e2e/kudos.a11y.spec.ts`) — axe-core SC-003 |
| 5.8 | Manual keyboard walkthrough (SC-010) — documented in PR description |
| 5.9 | Lighthouse mobile run — verify SC-002 (LCP < 2.5 s, CLS < 0.1, Perf ≥ 80) |
| 5.10 | Update `SCREENFLOW.md` row 6 → 🟢 shipped; add Discovery Log entry |

### Phase 6 — US10 P2: Profile preview + honour tooltip + Spotlight roving tabindex

Bundled because all three touch the same interaction surfaces (avatar /
name / honour pill on KudoCards + Spotlight name nodes). Single PR keeps
the a11y regression review surface small.

**Design source references**:
- `HonourTooltip` container + typography + layout: **design-style §26**
  (100% Figma-sourced, node `3241:14991`).
- `ProfilePreviewTooltip` container + typography + layout:
  **design-style §27** (inferred — see §29 confidence log for visual-QA
  expectations after ship).
- Motion specs for both: **design-style §28**.

| Step | Deliverable |
|---|---|
| 6.0 | **Refactor `HONOUR_PILL_MAP`** from [`KudoParticipant.tsx`](../../../src/components/kudos/KudoParticipant.tsx) out into a shared module `src/components/kudos/honourPills.ts` (pure data + type `HonourTier`). Update KudoParticipant to import from new path. Zero behaviour change. This unblocks 6.2 + 6.3 which both reuse the pill asset. |
| 6.1 | New Server Action `getProfilePreview(userId)` in [`src/app/kudos/actions.ts`](../../../src/app/kudos/actions.ts) — returns `{ displayName, departmentCode, honourTitle, kudosReceivedCount, kudosSentCount, isSelf }`; memoised on the client via an in-memory `Map<userId, payload>` with **60 s TTL** (tier can change mid-session after a new kudo triggers the DB compute function). `departmentCode` reads `departments.code` per Q21 (not a hierarchical path). |
| 6.2 | New client component [`src/components/kudos/ProfilePreviewTooltip.tsx`](../../../src/components/kudos/ProfilePreviewTooltip.tsx) — Radix-free popover using absolute positioning measured off the trigger's `getBoundingClientRect()`. **Content layout is design-style §27.1–27.8** (380 px card width / navy bg / 6 rows: display name 22px cream truncated → dept line 14px white+grey → tier pill from 6.0 → 1 px divider white/15 → 2 stats rows 16px white+cream → CTA). **CTA rendered inline per §27.7/27.9 snippet** — do not route through `<PrimaryButton>` for this MVP (PrimaryButton signature doesn't match the icon-prefix + full-width shape). **Hide CTA entirely when `isSelf === true`** (§27.8). Interactions: dwell-open 400 ms / pointer-leave-close 200 ms / `Esc` close. Touch branch (`@media (hover: none)`): first tap opens, outside tap / second tap closes (Q20 option a). |
| 6.3 | New client component [`src/components/kudos/HonourTooltip.tsx`](../../../src/components/kudos/HonourTooltip.tsx) — **layout from design-style §26** (304 px × 194 px min / navy bg / radius 16 / padding 16 / gap 16). Tier pill 218 × 38 from 6.0's shared map, body text a **single `<p>` concatenating threshold + flavor with a space** (not 2 lines — Figma ships as one wrapped text block). `role="tooltip"` + `aria-describedby` wired to the trigger. Static copy from i18n keys `kudos.honour.tooltip.{newHero|risingHero|superHero|legendHero}.{threshold|flavor}`. |
| 6.4 | Add **13 new i18n keys** to `src/messages/vi.json` + EN stub placeholders: **8 honour tooltip keys** (4 tiers × {threshold, flavor}, verbatim from US10 AC5) + **5 profile preview keys** (`kudos.profilePreview.{ariaLabel, departmentLabel, receivedLabel, sentLabel, ctaLabel}`, per design-style §27.10). |
| 6.5 | Implement **shared hook `useTooltipAnchor(triggerRef)`** in `src/components/kudos/hooks/useTooltipAnchor.ts` — single source of dwell / pointer-leave / Esc / touch-outside-close logic; returns `{ open, position, handlers }`. Position computed from `triggerRef.current.getBoundingClientRect()` + card size; choose above / below based on available viewport space (fallback below). Mount fade 150 ms / unmount fade 120 ms per design-style §28; instant under `prefers-reduced-motion`. Consumed by both 6.2 and 6.3. |
| 6.6 | Wire **profile preview triggers**: update `KudoCardSender`, `KudoCardRecipient` (inside [`KudoParticipant.tsx`](../../../src/components/kudos/KudoParticipant.tsx)), the `LatestGiftee` row (inside [`KudoStatsSidebar.tsx`](../../../src/components/kudos/KudoStatsSidebar.tsx)), and `SpotlightBoard` name buttons to host `<ProfilePreviewTooltip>` via the hook from 6.5. Trigger surface = the whole avatar + name block on KudoParticipant; avatar-only on LatestGiftee (name is already click-to-profile); name button on Spotlight. |
| 6.7 | Wire **honour tooltip triggers**: the **tier pill `<Image>`** inside `KudoParticipant.tsx` (sender + recipient blocks) is the trigger — not a separate "hoa thị count" element (there's no separate count visible in the card; the pill itself is the hover target). Wraps each `<Image>` in a zero-padding `<button>` with `aria-describedby` pointing at the tooltip id. |
| 6.8 | **Q8 roving tabindex** on `<SpotlightBoard>`: promote outer container to `role="listbox"` + single `tabIndex={0}`; inner name buttons get `tabIndex={focusedIndex === i ? 0 : -1}`. Arrow-keys `←↑↓→` do 2-D nearest-neighbour search using the post-relaxation `(x, y)` coords from `laidOut`; `Home`/`End` focus first/last laid-out name; `Enter`/`Space` on a focused name opens `<ProfilePreviewTooltip>` from 6.2. |
| 6.9 | Unit tests: `ProfilePreviewTooltip.spec.tsx` (dwell timing with fake timers / Esc close / CTA click routes to `/kudos/new?recipient=:userId` / `isSelf` hides CTA / touch branch / lazy-fetch memoisation); `HonourTooltip.spec.tsx` (4 tier variants render correct copy / `role="tooltip"` / `aria-describedby` linkage); `useTooltipAnchor.spec.ts` (pure hook — dwell + leave + Esc + touch paths with fake timers); extend `SpotlightBoard.spec.tsx` with roving-tabindex assertions. |
| 6.10 | axe-core regression sweep on `/kudos` with tooltips open (new scenario in `tests/e2e/kudos.a11y.spec.ts`) — assert zero serious/critical violations from the new ARIA (`role="tooltip"`, `role="dialog"` on profile preview, `role="listbox"` + roving `tabindex`). |
| 6.11 | **Visual QA pass** against user-shared profile preview image — use design-style §29 confidence log as the tuning checklist. Expected ±2 px adjustments on: display name font-size (22 vs 24?), stat-row gap (8 vs 12?), divider margins. Commit tweaks as follow-up diffs; do not revisit Figma ingestion unless layout looks fundamentally off. |

---

### Production deploy checklist (no separate phase)

Backend ships in Phase 1, so there is no mock-→backend cutover. Before
promoting to production:

- **Env vars** (required in Cloudflare Workers + CI):
  - `NEXT_PUBLIC_SUPABASE_URL` — staging / production project URL
    (client- and server-side; already wired via `@/libs/supabase/server`
    and `@/libs/supabase/client`).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key (RLS-gated).
  - `SUPABASE_SERVICE_ROLE_KEY` — **CI-only**, used by the migration
    step and the RLS integration suite runner. **Never shipped to the
    Worker runtime** — not referenced in `src/**`.
- **Apply migrations**: run `supabase db push` (or `supabase migration
  up --linked`) against staging first, then production. **Do NOT run
  `supabase db reset` or apply `seed.sql` in production** — seed is
  local-dev-only.
- **Verify RLS**: run `supabase db lint` (policy/index warnings) and a
  manual smoke test: sign in as user A, insert a kudo, sign in as user
  B, confirm the row is visible (read) but `update`/`delete` against
  A's row are denied.
- **Run the RLS integration suite** (`tests/integration/rls/kudos.spec.ts`)
  against the staging Supabase project (see §Testing Strategy for the
  authentication mechanism).
- **Regenerate types**: confirm `src/types/database.ts` is regenerated
  against the deployed schema (`supabase gen types typescript
  --project-id <staging>`) and committed before the frontend deploy.
- **Rollback strategy**: migrations are append-only (no in-place edits,
  no destructive `DROP` without a prior data-preserving step). If a
  migration fails mid-deploy: (a) new migrations are idempotent where
  possible (`if not exists`, `on conflict do nothing`), so re-running
  after a fix is safe; (b) for a hard failure, author a compensating
  migration (`000N_revert_000M.sql`) that undoes the offending DDL and
  deploy it — never `git revert` a migration SQL file after it has
  touched staging/prod. Frontend deploy gates on migration success: if
  migrations fail, block the Worker deploy via CI job dependency so the
  UI never references columns that don't exist.

---

## Token & i18n plan

### NEW CSS tokens (lifted verbatim from design-style §TR-008)

Add inside the `@theme inline` block in `src/app/globals.css` after the
`--shadow-fab-tile` line:

```css
/* Kudos Live board (spec MaZUn5xHXZ) — design-style §TR-008. */
--color-kudo-card: #fff8e1;
--color-muted-grey: #999999;
--color-secondary-btn-fill: rgba(255, 234, 158, 0.10);
--color-heart-active: var(--color-nav-dot); /* alias — Q10 default */
--radius-kudo-card: 24px;
--radius-highlight-card: 16px;
--radius-sidebar-card: 17px;
--radius-spotlight: 47px;
--radius-pill: 68px;
--radius-filter-chip: 4px;
--shadow-kudo-card: 0 4px 12px rgba(0, 0, 0, 0.25); /* OQ-DS-2 default */
```

**Reuse (no edit needed)**: `--color-brand-900/700`, `--color-card`,
`--color-accent-cream{,-hover,-active}`, `--color-divider`,
`--color-nav-dot`, `--color-panel-surface`, `--color-border-secondary`,
`--font-montserrat`, `--shadow-fab-{pill,pill-hover,tile}`.

### i18n namespaces

Add under `kudos.*` in both `src/messages/vi.json` and
`src/messages/en.json`. Estimated ~70 leaf keys across 8 sub-namespaces:

| Namespace | Sample keys |
|---|---|
| `kudos.meta` | `title`, `description` |
| `kudos.hero` | `h1`, `composerPlaceholder`, `searchPlaceholder` |
| `kudos.feed` | `sectionCaption`, `sectionTitle`, `endOfList`, `loadMore`, `bodyTruncated` |
| `kudos.filters` | `hashtagLabel`, `departmentLabel`, `clearLabel`, `loadError` |
| `kudos.card` | `heartAria`, `heartAriaDisabled`, `copyLinkLabel`, `copyLinkSuccess`, `copyLinkToast`, `imageAlt`, `seeDetailLabel`, `monogramAlt` |
| `kudos.spotlight` | `sectionCaption`, `sectionTitle`, `counterSuffix`, `searchPlaceholder`, `tooltipTemplate`, `noResults`, `panLabel`, `zoomInLabel`, `zoomOutLabel` |
| `kudos.highlight` | `sectionCaption`, `sectionTitle`, `pagerTemplate`, `prevLabel`, `nextLabel` |
| `kudos.sidebar` | `statsTitle`, `statReceived`, `statSent`, `statHearts`, `statBoxesOpened`, `statBoxesUnopened`, `moQuaCta`, `moQuaDisabledTooltip`, `latestGifteesTitle`, `noGiftees` |
| `kudos.empty` | `feedEmpty`, `spotlightEmpty`, `gifteesEmpty` |
| `kudos.error` | `feedError`, `carouselError`, `spotlightError`, `statsError`, `retryLabel`, `heartError`, `offlineWarning`, `filterOfflineToast`, `parkedToast` |

### Analytics events

Extend `AnalyticsEvent` union in `src/libs/analytics/track.ts` (no
breaking change to `screen_view`):

```ts
| { type: "kudos_feed_view"; filters?: { hashtag?: string; department?: string } }
| { type: "kudos_filter_apply"; kind: "hashtag" | "department"; value: string }
| { type: "kudos_heart_toggle"; id: string; action: "add" | "remove"; multiplier?: 1 | 2 }
| { type: "kudos_card_open"; id: string; source: "feed" | "carousel" }
| { type: "kudos_copy_link"; id: string }
| { type: "kudos_spotlight_pan"; delta_x: number; delta_y: number }
| { type: "kudos_carousel_scroll"; from_index: number; to_index: number }
| { type: "kudos_compose_open"; source: "liveboard_pill" | "fab" }
```

8 new events (one more than spec FR-021 baseline — `kudos_compose_open`
covers US8 #1 & #2 hand-off).

---

## Data Layer Plan

### Type definitions (`src/types/kudo.ts`)

App-facing types are derived from the generated `Database` types
(`src/types/database.ts`, produced by `supabase gen types typescript`).
Hand-rolled aggregates compose the joined shapes the UI needs:

```ts
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type HashtagRow = Database["public"]["Tables"]["hashtags"]["Row"];
type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];
type KudoStatsRow = Database["public"]["Views"]["kudos_with_stats"]["Row"];

export type KudoUser = Pick<ProfileRow, "id" | "display_name" | "avatar_url" | "department_id">;
export type Hashtag = Pick<HashtagRow, "slug" | "label">;
export type Department = Pick<DepartmentRow, "code"> & { label: string };

export type Kudo = KudoStatsRow & {
  sender: KudoUser;
  recipients: KudoUser[];
  hashtags: Hashtag[];
  has_hearted: boolean;
};

export type FeedPage = { items: Kudo[]; nextCursor: string | null; hasMore: boolean };
export type FilterState = { hashtag: string | null; department: string | null };
export type KudosStats = { receivedCount: number; sentCount: number; heartsReceived: number; secretBoxesOpened: number; secretBoxesUnopened: number };
export type LatestGiftee = { id: string; displayName: string; avatarUrl: string | null; giftDescription: string };
export type SpotlightRecipient = { name: string; x: number; y: number; weight: number; recentKudo: { time: string; preview: string } };
export type HeartToggleResult = { id: string; heartsCount: number; hasHearted: boolean; multiplier: 1 | 2; reason?: string };
```

### Server Action signatures (`src/app/kudos/actions.ts`)

Each action begins with `const supabase = await createClient()` from
`@/libs/supabase/server` (cookie-aware, RLS honoured per the caller's
session). Query shapes are sketched inline so the §Database Schema and
the data layer stay in sync.

```ts
"use server";
import { createClient } from "@/libs/supabase/server";

// Joins kudos_with_stats → kudo_recipients → profiles AND
// kudo_hashtags → hashtags; computes has_hearted via left join on
// kudo_hearts where user_id = auth.uid(); orders by created_at desc.
async function getKudoFeed(filters: FilterState, cursor?: string): Promise<FeedPage>;

// addHeart: INSERT INTO kudo_hearts (kudo_id, user_id) ON CONFLICT DO NOTHING.
// removeHeart: DELETE FROM kudo_hearts WHERE kudo_id = $1 AND user_id = auth.uid().
// Re-reads kudos_with_stats for authoritative count.
async function toggleKudoHeart(id: string, action: "add" | "remove"): Promise<HeartToggleResult>;

// SELECT slug, label FROM hashtags ORDER BY label.
async function getKudoHashtags(): Promise<Hashtag[]>;

// SELECT code, name_vi AS label FROM departments ORDER BY name_vi (label
// picked by current locale at the action boundary).
async function getKudoDepartments(): Promise<Department[]>;

// SELECT id, display_name, avatar_url FROM profiles WHERE display_name ILIKE $1 LIMIT 10.
async function searchSunner(query: string): Promise<KudoUser[]>;

// Aggregates DISTINCT recipient_id from kudo_recipients with their
// kudo-received count (used as `weight`); coords precomputed server-side.
async function getSpotlight(): Promise<{ total: number; recipients: SpotlightRecipient[] }>;

// SELECT * FROM kudos_with_stats ORDER BY hearts_count DESC LIMIT 5
// (with same join shape as the feed for sender + recipients + hashtags).
async function getHighlightKudos(filters: FilterState): Promise<Kudo[]>;

// 5 aggregates over kudos / kudo_recipients / kudo_hearts /
// secret_boxes (secret_boxes table is parked — return zeros until that
// spec ships).
async function getMyKudosStats(): Promise<KudosStats>;

// §D.3 — SELECT id, gift_name, quantity, redeemed_at, profile JOIN
// FROM gift_redemptions ORDER BY redeemed_at DESC LIMIT $1. Org-wide
// prize ledger (migration 0005, 2026-04-21). `giftDescription` is
// composed in the action from a locale-specific template
// ("Nhận được {quantity} {gift}" / "Received {quantity} {gift}").
async function getLatestGiftees(limit: number): Promise<LatestGiftee[]>;
```

Aggregate `hearts_count` uses the `kudos_with_stats` view (see §Database
Schema) so the hot path stays a single SELECT. `has_hearted` is a
per-user predicate added in the Server Action via
`left join kudo_hearts on kudo_id = kudos.id and user_id = auth.uid()`
(alternative: `exists()` subquery — view-based is recommended for
predictable plans, subquery documented as fallback).

For the **B.7 word-cloud Spotlight**, `getSpotlightRecipients()` (a
helper inside `getSpotlight`) groups `kudo_recipients` by
`recipient_id` to derive each name's kudo count → `weight`. For the
**B.2 Highlight carousel**, `getHighlightKudos()` orders by
`hearts_count desc limit 5` from the view.

### Data flow

1. **Initial render**: RSC `page.tsx` → `Promise.all` over 7 server
   actions → all sections SSR'd (FR-014).
2. **Heart toggle**: client → `toggleKudoHeart` Server Action →
   `revalidateTag("kudos")` → `useOptimistic` rolls back on error.
3. **Filter change**: client → `router.replace("?hashtag=...")` →
   RSC re-runs → SSR re-renders with new data (FR-023).
4. **Hashtag click in card** (FR-008): same as filter change but
   triggered from the hashtag row.
5. **Spotlight lazy load**: client `IntersectionObserver` →
   `getSpotlight()` Server Action → renders names.
6. **Carousel↔feed sync** (FR-009): both `HeartButton` instances read
   from module-level `heartsCache` via `useSyncExternalStore`.

### Local development data

There is no mock provider. Local development uses the seeded Supabase
project (`make up` brings up local Supabase; `supabase db reset` applies
migrations + `seed.sql`). Every Server Action runs against the same
Postgres in dev, staging, and prod — the only difference is which
project URL `NEXT_PUBLIC_SUPABASE_URL` points to and whether the seed
ran (production: never).

---

## Testing Strategy

| Phase | Test file(s) | Type | Coverage target |
|---|---|---|---|
| 1 | `__tests__/page.integration.spec.tsx` (placeholder) | Vitest | TDD lock |
| 2 | `__tests__/KudoPostCard.spec.tsx` | Vitest unit | TR-009 (slot rendering, clamp, image/hashtag caps, monogram); covers FR-016 |
| 2 | `__tests__/page.integration.spec.tsx` | Vitest integration | FR-002 empty state; FR-003 redirect; SSR happy path |
| 3 | `__tests__/HeartButton.spec.tsx` | Vitest unit | TR-009 (toggle, disabled, debounce, rollback, reduced-motion); FR-006/007 |
| 3 | `__tests__/CopyLinkButton.spec.tsx` | Vitest unit | FR-013 (clipboard, label swap, fallback) |
| 3 | `__tests__/FilterDropdown.spec.tsx` | Vitest unit | TR-009 (keyboard nav, single-select, outside-click); SC-010 |
| 3 | `__tests__/heartsCache.spec.ts` | Vitest unit | FR-009 sync via `useSyncExternalStore` |
| 4 | `__tests__/HighlightCarousel.spec.tsx` | Vitest unit | TR-009 (N slides, edge-arrow disable, pager, FR-009 sync) |
| 4 | `__tests__/SpotlightBoard.spec.tsx` | Vitest unit | US6 (render, hover tooltip, keyboard roving, lazy mount) |
| 5 | `tests/e2e/kudos.spec.ts` | Playwright E2E | TR-009 happy path (sign-in → heart → reload → filter → carousel → FAB) |
| 5 | `tests/e2e/kudos.a11y.spec.ts` | Playwright + axe-core | SC-003 (zero serious/critical violations at 375×812 + 1440×900) |
| 1–5 | `src/app/kudos/__tests__/actions.spec.ts` | Vitest unit | Server Action shape / argument validation / error mapping (Supabase client mocked at the boundary) |
| 5 | `tests/integration/rls/kudos.spec.ts` | Vitest integration (real Supabase) | **RLS** — auth as user A → query → assert visibility; auth as user B → mutate → assert deny; per-table happy + denied path |

| Type | Focus | Coverage |
|---|---|---|
| RLS integration | Auth as user A → query → assert visibility; auth as user B → mutate → assert deny | Per-table happy + denied path |

**Mocking strategy**: Supabase client mocked at the boundary for unit
tests (Vitest `vi.mock("@/libs/supabase/server")`); Playwright runs
against built app with Supabase Auth emulator (existing fixture) hitting
a freshly seeded local Supabase project.

**RLS integration auth** — no mocks; the suite exercises real policies.
Setup:

1. `supabase/seed.sql` inserts two fixture users `rls-user-a@test.sun`
   and `rls-user-b@test.sun` via `auth.admin.createUser()` (called from
   a seed helper using the service-role key, since `auth.users` is not
   writable by anon).
2. Each test acquires a session per user with
   `supabase.auth.signInWithPassword({ email, password })` against the
   local Supabase (passwords fixed in seed, e.g. `rls-test-1234`).
3. The resulting `access_token` (JWT) is passed to
   `createClient(SUPABASE_URL, ANON_KEY, { global: { headers: {
   Authorization: \`Bearer ${access_token}\` } } })` so RLS evaluates
   `auth.uid()` correctly per request.
4. A separate service-role client (constructed from
   `SUPABASE_SERVICE_ROLE_KEY`, only in test env) is used to set up /
   tear down fixtures that bypass RLS.

Env for the suite: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` — loaded from `.env.test.local` (never
committed). CI uses secrets; local dev pulls from `supabase status`.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Spotlight pan/zoom perf with 388+ DOM nodes** (TR-012, US6) | High | High | Server-precomputed coords; lazy mount; CSS `transform: translate3d` for GPU layer; `will-change: transform` only during active drag; dev-mode FPS counter; consider canvas fallback if DOM impl drops below 30 fps on mid-mobile |
| **RLS policy bug → silent empty results** | High | High | RLS denies are silent (just empty rows / no error); mitigation: dedicated integration suite `tests/integration/rls/kudos.spec.ts` that authenticates as test users A/B and asserts both visibility AND denied-mutation paths per table |
| **Supabase migration drift between dev / staging / prod** | Med | Med | CI step runs `supabase db diff` against staging before merge; migrations are append-only (no in-place edits); `src/types/database.ts` regenerated and committed every time a migration lands |
| **Composite shadow + Tailwind v4 token interop** (arbitrary-value shadow utility referencing `--shadow-kudo-card` not resolving) | Med | Med | Verified pattern already shipping for `--shadow-fab-pill`; smoke-test in Phase 1.1 hot-reload |
| **Reduced-motion coverage gap** — easy to forget 12 motion entries | Med | Med | Single mock-`matchMedia` Vitest helper; one test per motion entry in design-style §Motion; PR checklist item |
| **Bundle ≤ 85 KB (TR-003)** at risk if both carousel + spotlight ship as deps | Med | Med | Hand-roll both per Q9 default; `@next/bundle-analyzer` gate in CI; lazy-mount Spotlight |
| **Carousel + feed heart desync** (FR-009) — same kudo, two components | Med | Med | Module-level `heartsCache` + `useSyncExternalStore`; dedicated unit test `heartsCache.spec.ts` |
| **Sticky sidebar overflow on short viewports** (1080p / 720p) | Low | Low | `position: sticky; top: calc(var(--header-h) + 24px)`; inner D.3 `overflow: auto`; manual QA |
| **Tall page (5862 px Figma) hurts LCP** | Low | Low | LCP candidate is hero text (no image dependency); KV image `priority` desktop only |
| **i18n EN parity at merge time** | Low | Low | Ship VI placeholders if EN delayed; update via i18n PR (no code change) |

**Top 3**: (1) Spotlight pan/zoom perf with 388+ nodes, (2) RLS policy
bug → silent empty results, (3) composite-shadow Tailwind v4 interop.

---

## Open Questions (prioritised)

Spec ships **16 product/UX questions (Q1–Q16)** + design-style ships
**9 design questions (OQ-DS-1..9)**. Consolidated and prioritised:

### Blocking-for-plan (must resolve before Phase 1 starts)

*None.* Every spec/design question has a viable default; defaults are
documented in spec + design-style and re-stated below.

### Blocking-for-implement (must resolve before phase 2 / 3 / 4 ships)

| ID | Question | Default to ship | Owner |
|---|---|---|---|
| **Q1** | Infinite scroll vs. "Load more" | "Load more" button (a11y simpler; sticky-sidebar safe) — Phase 2 | Product |
| **Q3** | Carousel default slide | Slide 3 (center-biased, matches Figma) — Phase 4 | UX |
| **Q9** | Pan/zoom dependency | Hand-roll Pointer Events (~100 LOC) — Phase 4 | Eng |
| **OQ-DS-2** | `--shadow-kudo-card` value | `0 4px 12px rgba(0, 0, 0, 0.25)` — Phase 1 | Design |
| **OQ-DS-6** | Spotlight backdrop image | Bake `public/images/kudos/spotlight-backdrop.jpg` — Phase 0 | Design |

### Resolved-default — confirm with PM if disagree (Supabase pivot, 2026-04-20)

| ID | Question | Resolved default |
|---|---|---|
| **Q4** | Hashtag origin (was: Spotlight weight) — pivot redirected this slot to data-layer | **Free-text on first use, canonicalized into `hashtags` table** (slug-deduped, lowercased on insert). Catalog/moderation deferred. Spec's original Q4 (Spotlight weight = hearts received) is preserved as the default and now also resolved. |
| **Q5** | Department source (was: Mobile sidebar D collapse) — pivot redirected this slot to data-layer | **Static `departments` seed table for MVP**, curated via `supabase/seed.sql` (canonical Sun* list). HR-API sync = future background job. Spec's original Q5 (mobile sidebar stacks below C) is preserved as the default and now also resolved. |
| **Q15** | View Kudo route (was: Sunner search behaviour) — pivot redirected this slot to a routing decision | **Reserve `/kudos/[id]` URL** (used by copy-link target + spotlight deep-link) but **DO NOT implement the page** in this plan — out of scope per SCREENFLOW. Spec's original Q15 (sunner search same-page dropdown) is preserved as the default. |

### Non-blocking (defaults in place; revisit at production)

| ID | Question | Default |
|---|---|---|
| Q2 | > 5 attachment images | Hide overflow until detail view ships |
| Q6 | Real-time updates | Polling Spotlight counter every 60 s; manual refresh on feed |
| Q7 | Mobile Spotlight | Vertical top-20 list |
| Q8 | Spotlight keyboard nav | Roving tabindex (single tabstop + arrow keys) |
| Q10 | Heart-active token alias | `--color-heart-active: var(--color-nav-dot)` |
| Q11 | Body format | Plain text + URL auto-link + emoji |
| Q12 | Department filter semantics | Recipient's team |
| Q13 | Special-day multiplier | Server returns `{multiplier, reason}`; client renders micro-confetti |
| Q14 | Composer pill route vs. modal | Modal (preserves feed scroll); fall back to route |
| Q16 | Spotlight layout algorithm | Server-precomputed coords (TR-012) |
| OQ-DS-1 | Cream-card body text colour | Navy `#00101A` (Figma-exact) |
| OQ-DS-3 | Hover-fill darkening | `rgba(255, 234, 158, 0.15)` |
| OQ-DS-4 | Carousel slide-to-slide gap | 24 px |
| OQ-DS-5 | Pan/zoom controls dimensions | TBD; ship at 32 px height pill, refine post-merge |
| OQ-DS-7 | Timestamp grey contrast | Accept WCAG 1.4.3 incidental-UI exception; hold `#999999` |
| OQ-DS-8 | Mobile Spotlight layout | Vertical top-20 list (parallels Q7) |
| OQ-DS-9 | Mobile carousel reflow | 1-up swipe, no peek |

### Resolved-with-default-fallback

All 25 questions resolve to a documented default — plan proceeds without
blocking on Product/Design.

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` reviewed (v1.1.0)
- [x] `spec.md` approved (Draft → ready for review)
- [x] `design-style.md` approved (Draft → ready for review)
- [x] `SCREENFLOW.md` row 6 confirms predicted APIs
- [ ] `momorph.apispecs` for this frame — **superseded** by Server Actions in this plan; only needed if a public REST surface is later required
- [x] `momorph.database` — **superseded** by §Database Schema in this plan; the 7 tables ship as `supabase/migrations/0001..0004*.sql` in Phase 1
- [ ] Phase 0 image assets exported by Design — required before Phase 2 visual QA

### External dependencies

- [x] `<QuickActionsFab>` shipped (`src/components/shell/QuickActionsFab.tsx`)
- [x] `<SiteHeader>` / `<SiteFooter>` / `<NavLink>` / `<LanguageToggle>` / `<NotificationBell>` / `<ProfileMenu>` shipped
- [x] `<Icon>` sprite system (`src/components/ui/Icon.tsx`)
- [x] `getMessages()` helper (`src/libs/i18n/getMessages.ts`)
- [x] `track()` analytics emitter (`src/libs/analytics/track.ts`)
- [x] Supabase auth (`src/libs/supabase/server.ts`)
- [ ] `/kudos/new` route — placeholder exists from FAB plan; final form spec is parked (SCREENFLOW row 7)
- [ ] `/gifts/open` route — parked; FR-010 fallback toast covers absence

---

## Next Steps

After plan approval:

1. Run `/momorph.tasks` to break Phases 0–5 into executable tasks
2. Begin Phase 0 (asset prep) + Phase 1 (foundation + DB) immediately —
   both are unblocked
3. `/momorph.apispecs` and `/momorph.database` are **superseded** by
   §Database Schema and the Server Actions in this plan (no separate
   API or DB ticket required for MVP)

---

## Notes

- **Why feature folder `src/components/kudos/`** (not `ui/`): the Live
  board is a feature, not a primitive — constitution §I "[feature]/"
  pattern matches exactly (mirrors `src/components/awards/` and
  `src/components/homepage/`).
- **Why no React Context / Redux / SWR**: the only cross-component state
  is the heart cache (FR-009), addressable by a 30-line module + native
  `useSyncExternalStore`. Filter state lives in URL. Card-local state
  lives in `useState`. A global store would be over-engineering for one
  shared map.
- **Why hand-roll carousel + pan/zoom**: TR-003 bundle target + TR-007
  dep policy. Both implementations are well-bounded (~60 + ~100 LOC) and
  match the four acceptance scenarios for US5 / US6 without a vendor
  abstraction. If FPS regresses on mobile in QA, switch to embla /
  react-zoom-pan-pinch in a follow-up.
- **Why Supabase-from-day-one**: per stakeholder pivot 2026-04-20 and
  constitution §V (Supabase as the DB layer for all persistent state).
  Removing the mock-provider indirection eliminates a class of
  type-drift and Phase-6-cutover risk; the trade-off is that Phase 1 is
  a touch heavier (migrations + RLS land before any UI work). Generated
  types from `supabase gen types typescript` keep the contract honest.
- **Why Server Actions over `/api/...` route handlers**: TR-005 allows
  either; Server Actions colocate with the route, get free progressive
  enhancement, and avoid manual route-handler boilerplate. If a public
  REST surface becomes needed later (e.g., for a mobile app), a thin
  `/api/kudos/...` adapter can call into the same actions.
- **Scope discipline**: this plan does not implement Viết Kudo
  (`/kudos/new`), Kudo detail (`/kudos/:id`), hashtag/department
  dropdown content beyond the trigger, secret-box flow, or the user
  profile preview. All are referenced and parked per SCREENFLOW.
- **Traceability**: every component name is a Figma node ID in
  design-style §Implementation Mapping; every FR/TR/SC is referenced in
  the §Constitution Compliance table or §Phase steps.
