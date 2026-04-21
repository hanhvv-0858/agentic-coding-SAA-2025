# Implementation Plan: Dropdown Hashtag Filter

**Frame**: `JWpsISMAaM-dropdown-hashtag-filter`
**Date**: 2026-04-21
**Spec**: [spec.md](spec.md)
**Design**: [design-style.md](design-style.md)

---

## Summary

Redesign the existing shared `FilterDropdown` component so both the
**Hashtag** and **Department** chips on `/kudos` FilterBar adopt the
dark-navy popover visual from this Figma source. Localize hashtag
labels to VN/EN by migrating the `hashtags` table to
`label_vi` + `label_en` columns (mirroring the existing `departments`
pattern), then wire `getKudoHashtags()` to resolve the correct column
at action entry. No new component files are added — this is an
in-place redesign + DB migration + fixture refresh.

Scope is narrow but cross-cuts 3 layers:

1. **DB** — migration `0010_hashtags_localize.sql` renames `label` →
   `label_en`, adds `label_vi`, purges + reseeds the 13 canonical tags.
2. **Server Action** — `getKudoHashtags()` body resolves `label` per
   current locale.
3. **Client UI** — `FilterDropdown.tsx` panel + item styles flip to the
   dark visual; "All hashtags / All departments" virtual first option
   removed (clear-by-toggle + existing `ActiveChip ✕` replace it).

---

## Technical Context

| | |
|---|---|
| **Language/Framework** | TypeScript / Next.js 16 App Router + React 19 |
| **Primary Dependencies** | Tailwind v4, Supabase SSR (`@supabase/ssr`) |
| **Database** | Supabase Postgres (hosted) — migrations in `supabase/migrations/NNNN_*.sql` |
| **Testing** | Vitest + Testing Library, Playwright (e2e) |
| **State Management** | URL-as-state via `next/navigation` `useSearchParams` + `router.replace()`; local popover open state in `FilterDropdown` via `useState` |
| **API Style** | Server Actions (`"use server"` in `src/app/kudos/actions.ts`) — no REST layer |
| **i18n** | Message catalogs `src/messages/{vi,en}.json` + existing `getLocale()` helper (already used by `getKudoDepartments`) |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] Follows project coding conventions — TypeScript strict, `@/*` import alias, kebab-case route, PascalCase components
- [x] Uses approved libraries and patterns — Tailwind utilities, Supabase SSR client, no new deps
- [x] Adheres to folder structure guidelines — everything under `src/components/kudos/`, `src/app/kudos/actions.ts`, `supabase/migrations/`
- [x] Meets security requirements — RLS preserved on `hashtags`, slug-not-label persisted in URL (no PII leak)
- [x] Follows testing standards — Red-Green-Refactor on `FilterDropdown.spec.tsx` (test already exists at `src/components/kudos/__tests__/FilterBar.spec.tsx`; add a dedicated `FilterDropdown.spec.tsx` for the new visual contract)
- [x] **Responsive Design (Principle II)** — popover works at desktop + tablet; mobile degrades gracefully (see spec §Visual Requirements). Future bottom-sheet is an explicit out-of-scope item.
- [x] **Web-only (Project Scope)** — no native APIs used.

**Violations**: none.

---

## Architecture Decisions

### Frontend Approach

- **Component Structure** — **Update in place**, do NOT fork. The
  existing generic `FilterDropdown.tsx` is the single owner of both
  Hashtag and Department popovers. Path A from spec §Relationship to
  existing code: one style change serves both filters.
- **Styling Strategy** — Tailwind arbitrary-value utilities mapped to
  existing CSS custom properties. Verified token inventory in
  `src/app/globals.css`:
  - `--color-accent-cream` → `#FFEA9E` (already used; consume via Tailwind `/10`, `/8` opacity modifiers)
  - `--color-border-secondary` → `#998c5f` ✅ **matches** Figma `Details-Border` — **no new token needed**
  - Panel fill `#00070C` (Figma `Details-Container-2`) → inline value via `bg-[var(--color-details-container-2,#00070C)]` with the fallback literal. If this color spreads to other screens, promote to a named var in a follow-up.
- **Popover positioning** — Implementation target: render the popover
  **in-tree** as a direct descendant of the trigger button (current
  pattern in `FilterDropdown`) but add `overflow: visible` to the
  FilterBar wrapper. Portal to `<body>` is the fallback plan if
  `overflow-x-hidden` on `<main>` clips the popover (TR-005).
- **State management** — unchanged. URL is source of truth for active
  filter; `FilterDropdown` owns only open/closed + keyboard cursor.
- **Data fetching** — unchanged. Hashtags are fetched once at the
  `/kudos` RSC boundary via `getKudoHashtags()` and passed down as
  props.

### Backend Approach

- **API Design** — `getKudoHashtags()` signature unchanged (still
  returns `Hashtag[]` with `{ slug, label }`). Body updated to pick
  the right column based on locale:
  ```ts
  const locale = await getLocale();
  const col = locale === "vi" ? "label_vi" : "label_en";
  const { data } = await supabase
    .from("hashtags")
    .select(`slug, label:${col}`)
    .order(col, { ascending: true });
  ```
- **Data Access** — direct Supabase client, no ORM layer (matches
  existing pattern in `actions.ts`).
- **Validation** — not needed — read-only action, no user-supplied
  inputs. The filter value is URL-validated at `/kudos` page entry
  (existing `FilterState` type).

### Integration Points

- **Existing Services** — `src/app/kudos/actions.ts` (`getKudoHashtags`), `src/libs/i18n/getMessages.ts` (`getLocale`), Supabase client (`src/libs/supabase/server.ts`).
- **Shared Components** — `FilterDropdown` is updated, consumed unchanged by `FilterBar`. `ActiveChip` unchanged.
- **API Contracts** — `Hashtag` type in `src/types/kudo.ts` unchanged externally (still `{ slug, label }`); internally the source columns change.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/JWpsISMAaM-dropdown-hashtag-filter/
├── spec.md              # Feature specification (✅ shipped)
├── design-style.md      # Visual specs (✅ shipped)
├── plan.md              # This file (✅ shipped)
├── tasks.md             # Task breakdown (next step via /momorph.tasks)
└── assets/
    └── frame.png        # Figma reference (✅ shipped)
```

No `research.md` needed — scope is incremental on a component that
already exists and has a passing test. Architectural pattern
(URL-as-state + RSC data + client popover) is established by
`FilterBar`/`FilterDropdown` and is reused verbatim.

### Source Code (affected areas)

```text
# Frontend
src/components/kudos/
├── FilterDropdown.tsx                 # EDIT — flip panel + items to dark visual; remove "All hashtags / All departments" virtual first option
├── __tests__/
│   ├── FilterBar.spec.tsx             # EDIT — update chip-label expectations if any change
│   └── FilterDropdown.spec.tsx        # NEW — covers open/close, toggle-off, a11y, keyboard, selected-state render
└── (no new component files)

src/app/kudos/
├── actions.ts                         # EDIT — getKudoHashtags() body: locale-resolve `label_vi`/`label_en`

src/libs/i18n/
└── getMessages.ts                     # (read-only) getLocale() already exists

src/types/
└── database.ts                        # REGENERATE after migration push; hashtags.Row gains label_vi + label_en

# Database
supabase/
├── migrations/
│   └── 0010_hashtags_localize.sql    # NEW — rename+add columns, purge old, upsert 13 canonical rows, SET NOT NULL
└── seed.sql                           # EDIT — replace 10-tag INSERT block with 13-tag block carrying both columns

# Scripts / fixtures
scripts/
└── seed-kudos-fixtures.ts             # EDIT — update HASHTAG_SLUGS constant so seeded kudos use the new 13 slugs
```

### Dependencies

**No new npm packages**. All required pieces already ship:

| Package | Version | Purpose |
|---|---|---|
| `@supabase/ssr` | existing | Supabase server client |
| `next/navigation` | existing (Next 16) | `useSearchParams`, `useRouter` |
| `tailwindcss` | existing v4 | Styling |
| `vitest` + `@testing-library/react` | existing | Unit/integration tests |

---

## Implementation Strategy

### Phase Breakdown

**Phase 0 — Asset Preparation** *(skip)*
- No new images/icons required. The popover is pure CSS on cream border + navy fill. The `hashtag` and `building` icons used as chip prefixes already exist in [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx).

**Phase 1 — Database migration (DB)**
1. **Pre-push safety net**: take a snapshot of the `hashtags` +
   `kudo_hashtags` tables before pushing the non-reversible DELETE.
   Hosted Supabase doesn't run `down` migrations, so rollback
   means manually restoring. Either:
   - `supabase db dump --data-only -t public.hashtags -t public.kudo_hashtags > backups/pre-0010-hashtags.sql`, **or**
   - Use the Supabase dashboard → Database → Backups → create a
     point-in-time snapshot before push.
2. Write `supabase/migrations/0010_hashtags_localize.sql` per spec
   §Migration Plan. DDL order: RENAME → ADD nullable → DELETE old
   junction rows + old hashtag rows → UPSERT 13 canonical rows →
   SET NOT NULL on both columns.
3. Run `supabase db push` against hosted project; verify via
   `supabase migration list` (0010 should appear in both Local + Remote columns).
4. **Type sync for `hashtags` row**. The current `src/types/database.ts`
   is a **1001-line hand-maintained file**, not a vanilla generator
   output — running `supabase gen types typescript --linked > src/types/database.ts`
   will produce a massive unrelated diff (Storage buckets, `graphql_public` schema,
   relationship keys in different order, etc.). Two viable options:
   - **Option 3a (recommended)**: Hand-edit `database.ts` to add
     `label_vi: string` + `label_en: string` to the `hashtags.Row`
     / `Insert` / `Update` shapes and remove the old `label: string`
     column. ~15 lines of diff. Low risk.
   - **Option 3b**: Full regen with `supabase gen types`, then `git diff`
     and hand-merge only the `hashtags` + any previously-untyped
     additions (`kudo_images`, `gift_redemptions`, `secret_boxes`
     should already be hand-added from prior sessions — re-verify).
     Higher noise; only do this if the hand file has drifted from
     the live schema in multiple places.
5. Update `supabase/seed.sql` so a fresh `supabase db reset` matches
   the remote state (new 13-row hashtag INSERT block).

**Phase 2 — Server Action (API)**
6. TDD: add a Vitest test at `src/app/kudos/__tests__/actions.hashtags.spec.ts`
   that mocks `getLocale()` returning `"vi"` / `"en"` and asserts the
   `select()` column argument changes accordingly. (Adjust path to
   match existing test convention if different.)
7. Implement the locale-resolved SELECT in `getKudoHashtags`. Red →
   Green → refactor.

**Phase 3 — Filter dropdown visual redesign (UI)**
8. TDD: write `src/components/kudos/__tests__/FilterDropdown.spec.tsx`
   covering:
   - Open on click; close on outside-click (via `window` event — TR-003) + ESC + chip re-click.
   - Selected item carries `aria-selected="true"` + text-shadow class.
   - Clicking the selected item calls `onSelect(null)` (toggle-off, FR-003).
   - Keyboard: ArrowDown/Up/Home/End/Enter/Esc (US3).
   - Virtual "All hashtags / All departments" first option is
     **NOT** rendered (removed in this redesign).
   - Panel applies dark background + cream border + shadow classes.
   - Listbox carries `max-h-[640px]` + `overflow-y-auto` — rendering 13
     items of 56 px each (= 728 px intrinsic) produces a scrollable
     container (US4 scroll assertion).
   - Disabled state: when `options.length === 0`, the trigger has
     `aria-disabled="true"` and `onClick` is a no-op (FR-007).
   - Error + retry: when `disabled && onRetry` provided, the inline
     "Không tải được — Thử lại" control renders below and calling
     it invokes `onRetry` (FR-008).
9. Update `FilterDropdown.tsx`:
   - **Panel container classes** (currently line 233–236):
     - `bg-[var(--color-panel-surface,#FFF9E8)]` → `bg-[var(--color-details-container-2,#00070C)]`
     - add `border border-[var(--color-border-secondary)]` (token already defined in `src/app/globals.css` as `#998c5f`)
     - swap `shadow-[var(--shadow-fab-tile,...)]` → `shadow-[0_8px_24px_rgba(0,0,0,0.35)]`
     - keep `rounded-lg`
     - change `py-2` → `p-1.5` (panel padding 6 px per design)
     - **update max-height**: `max-h-[320px]` → `max-h-[640px]` with `max-h-[min(640px,calc(100vh-160px))]` as the responsive fallback (design §Layout).
     - **update panel width**: currently `min-w-full` on the listbox (matches trigger). Keep `min-w-full` as a floor BUT add `w-[215px] max-w-[260px]` so it tracks the 215 px Figma width when the chip is narrower. Re-verify with Playwright at 1920 px.
   - **Item classes** (currently line 256–261):
     - base: `flex h-14 items-center gap-1 rounded p-4 font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.5px] text-white hover:bg-[var(--color-accent-cream)]/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]`
     - selected overlay: `bg-[var(--color-accent-cream)]/10 [text-shadow:_0_4px_4px_rgba(0,0,0,0.25),_0_0_6px_#FAE287]`
     - remove the `active ? "bg-[var(--color-accent-cream)]/40" : ""` row — the new design has a distinct hover (`/8`) vs selected (`/10`); active-keyboard-cursor reuses the hover shade.
   - **Outside-click listener (TR-003)**: change `document.addEventListener("mousedown"/"touchstart", onDown)` (line 90–91) → `window.addEventListener(...)` so iOS Safari body-click-through taps also close the popover. Mirror the change in the cleanup.
   - **Remove virtual "All" option**: delete the `allOptions` prefix row
     (line 71–74) — the listbox now iterates `options` directly.
     Clearing flows via `commit(idx)` when the selected item is
     re-clicked → `onSelect(null)` (toggle-off path).
   - **i18n keys audit** (existing keys in `src/messages/{vi,en}.json`):
     - `filters.allHashtags` + `filters.allDepartments` — **safe to delete** after grep confirms no other consumer.
     - `filters.emptyList` — **keep** (still used when the list is legitimately empty post-open).
     - `filters.loadError` + `filters.retryLabel` — **keep** (still used for the disabled + retry path per FR-008).
   - **Mutual exclusion (FR-009)**: No new code needed. The two
     `FilterDropdown` instances inside `FilterBar` each own their
     own `containerRef` + outside-click listener. When the user
     clicks the second chip while the first popover is open, the
     second chip sits OUTSIDE the first's `containerRef` → the
     first's `window.addEventListener("mousedown", …)` fires and
     closes it. Verify by test scenario "Department popover opens
     while Hashtag is open → Hashtag closes".
10. Run the test suite; iterate until green.

**Phase 4 — Locale + clipping polish**
11. Verify `router.replace()` + `kudos_filter_apply` analytics still fire (no changes expected; spec confirms).
12. Ensure popover isn't clipped by `overflow-x-hidden` on `<main>`
    (TR-005): set `overflow: visible` on `FilterBar`'s outer
    wrapper, or add a portal fallback. Test at 1920 px viewport.
13. Check Department dropdown inherits the new dark visual end-to-end
    on `/kudos` (manual walk-through + Playwright smoke test if an
    e2e for filters exists).

**Phase 5 — Fixture refresh + docs**
14. Update `scripts/seed-kudos-fixtures.ts` — replace `HASHTAG_SLUGS`
    array with the 13 new slugs. Run `yarn seed` to re-populate.
15. Update the parent Live board spec/plan if it references the old
    10-tag list (grep for `ontime`, `creative`, … in `.momorph`).
16. Tick the Dependencies checklist items in spec.md as they resolve.

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Department filter regression — inherits dark look but uses slightly different content (no `#` prefix, different label). Visual QA needed. | Medium | Medium | Phase 4 step 12: manual Playwright pass on Department filter + one snapshot test. |
| Migration 0010 purge removes junction rows; dev Kudos lose their hashtag badges | High (intended) | Low | Re-run `yarn seed` after migration push; documented in Phase 5 step 14. No prod data at risk (dev-only). |
| Migration 0010 is non-reversible (DELETE old rows) and hosted Supabase has no automatic `down` | Medium | High | Phase 1 step 1 mandates `supabase db dump` snapshot before push OR dashboard point-in-time backup. |
| `overflow-x-hidden` clipping breaks popover on narrow viewports | Medium | Medium | TR-005 in spec; Phase 4 step 12 adds `overflow: visible` to FilterBar wrapper OR React portal. |
| `supabase gen types` drift — generated `database.ts` introduces schema nodes unrelated to this feature (noisy diff) | Low | Low | Run gen, commit only the `hashtags` / `Database` diffs relevant to this PR; revert unrelated drift by hand. |
| Removing `filters.allHashtags` / `filters.allDepartments` i18n keys breaks untracked consumers | Low | Low | `grep` before delete; leave keys if any other component references them. |

### Estimated Complexity

- **Frontend**: **Low** — `FilterDropdown` is ~270 LoC; changes are style-only + removal of 6 lines (virtual "All" option).
- **Backend**: **Low** — 1 SQL migration, 3-line action change, types regen.
- **Testing**: **Medium** — new `FilterDropdown.spec.tsx` needs coverage across 7+ scenarios (open/close × 3 triggers, toggle-off, keyboard, a11y attrs). Existing `FilterBar.spec.tsx` may need adjustments if its snapshot covered the old cream style.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: `FilterBar` → `FilterDropdown` prop wiring + `onSelect` → `router.replace`
- [x] **External dependencies**: Supabase `getKudoHashtags()` — mock at the boundary using Vitest `vi.mock("@/libs/supabase/server", ...)`, already pattern in other tests
- [x] **Data layer**: migration 0010 — validate with `supabase db reset` + `SELECT * FROM hashtags` in CI preview DB
- [x] **User workflows**: US1 (select → URL update → re-render feed) is covered by existing `page.integration.spec.tsx`; extend it if not already matching the new label format

### Test Categories

| Category | Applicable? | Key Scenarios |
|---|---|---|
| UI ↔ Logic | Yes | Click chip → popover opens; select → `onSelect` fires with slug; toggle-off → `onSelect(null)` |
| Service ↔ Service | No | No new service boundaries |
| App ↔ External API | Yes | `getKudoHashtags()` against mocked Supabase — locale picks correct column |
| App ↔ Data Layer | Yes | Integration test: after migration `SELECT slug, label_vi, label_en FROM hashtags` returns all 13 rows |
| Cross-platform | Yes (responsive) | Verify popover renders + is usable at 640 px, 1024 px, 1920 px |

### Test Environment

- **Environment**: Vitest (happy-dom) for unit/integration; Playwright against local `next dev` for e2e smoke.
- **Test data strategy**: Mocked Supabase responses (fixtures inline in spec files) for unit; real hosted Supabase for manual/Playwright walkthrough.
- **Isolation**: `beforeEach` resets `useSearchParams` mocks + `vi.mock` state.

### Mocking Strategy

| Dependency Type | Strategy | Rationale |
|---|---|---|
| Supabase client | Mock at `@/libs/supabase/server` boundary | Keep unit tests offline |
| `next/navigation` | Mock `useRouter` + `useSearchParams` | Already used by `FilterBar.spec.tsx`; reuse pattern |
| `getLocale` | Mock `@/libs/i18n/getMessages` per test to drive the locale-resolved column path | Drives FR-010 assertions |
| Analytics `track` | Mock to a spy; assert `kudos_filter_apply` call arguments | Already mocked in existing tests |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Click Hashtag chip → popover opens → click `#Cống hiến` → URL has `?hashtag=dedicated` + popover closed
   - [ ] Locale=`vi` → server returns VN labels; UI shows VN
   - [ ] Locale=`en` → server returns EN labels; UI shows EN

2. **Error Handling**
   - [ ] `getKudoHashtags()` rejects → chip renders disabled + retry button visible
   - [ ] `?hashtag=nonexistent` (stale slug) → dropdown opens with NO selected item; no crash

3. **Edge Cases**
   - [ ] Empty DB → chip disabled; clicking it does nothing
   - [ ] Toggle-off: click currently-selected item → `onSelect(null)` → URL loses `?hashtag`
   - [ ] Department popover opens while Hashtag is open → Hashtag closes (FR-009 mutual exclusion)
   - [ ] ESC returns focus to the chip (a11y)
   - [ ] Touch tap outside popover closes it (TR-003 — listener on `window`, iOS Safari body-click-through)
   - [ ] Stale `?hashtag=nonexistent` slug doesn't crash; no item is marked selected
   - [ ] **TR-001 perf** — NOT asserted in unit tests (happy-dom
         doesn't reflect real render perf). Validate manually at
         Phase 4 using Chrome DevTools Performance panel on the
         `/kudos` route, or add a Playwright e2e check that
         measures time-from-click-to-dropdown-visible and asserts
         `< 16 ms` on a mid-range laptop run. If slower than
         expected, investigate React transition/startTransition
         wrapping of the open toggle.

### Tooling & Framework

- **Test framework**: Vitest + `@testing-library/react` + `happy-dom` (existing setup)
- **Supporting tools**: Playwright (existing `tests/e2e/`)
- **CI integration**: `yarn test:run` in CI (existing script)

### Coverage Goals

| Area | Target | Priority |
|---|---|---|
| `FilterDropdown` unit tests | 90 %+ | High |
| `getKudoHashtags` locale branch | 100 % (2 cases) | High |
| Migration 0010 — smoke SELECT | executed once in preview | High |
| E2E — pick hashtag → feed filters | 1 Playwright scenario | Medium |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed
- [x] `spec.md` finalized (all clarifications resolved 2026-04-21)
- [x] `design-style.md` finalized (tokens + Node IDs mapped)
- [x] Parent Live board spec shipped (`MaZUn5xHXZ-kudos-live-board`)
- [x] `FilterDropdown.tsx` + `FilterBar.tsx` exist in codebase
- [ ] Migration 0010 pushed to hosted Supabase (user step after Phase 1)
- [ ] `src/types/database.ts` regenerated (user step after migration push)

### External Dependencies

- **Supabase CLI** — for migration push + types regen (already installed locally per session context)
- **Hosted Supabase project** `AIDD-SAA-2025` (`opmgaciujjeaugojcail`) — already linked

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate task breakdown across the 5 phases
2. **Review** tasks.md for parallelization opportunities — Phase 1 (DB) blocks Phase 2 (action); Phase 3 (UI) can run concurrently with Phase 2 since it doesn't touch DB
3. **Begin** implementation:
   - `/momorph.implement` with scope=Phase1 → push migration → regen types
   - `/momorph.implement` with scope=Phase2 → update action + test
   - `/momorph.implement` with scope=Phase3 → update FilterDropdown + test
   - Polish + e2e

---

## Notes

- **Why no `research.md`**: This feature reuses an established pattern (URL-as-state + RSC data fetch + client popover). `FilterDropdown` already has a working test that informs the redesign. No unknowns to investigate.
- **Naming convention kept**: Despite spec.md using `HashtagDropdown` as the visual-role label, the implementation target remains `FilterDropdown.tsx` (generic, used by Department too). Component file NOT renamed.
- **`Aim High` / `Be Agile` / `Wasshoi`** labels carry identical strings across VN + EN columns — they're Sun\* company-value callouts, intentionally untranslated. The UI treats them as normal rows (locale-resolved column still runs, it just happens to return the same string).
- **Future work tracked in spec §Out of Scope**: multi-select, search input, free-text hashtag creation, mobile bottom-sheet. Not part of this plan.
