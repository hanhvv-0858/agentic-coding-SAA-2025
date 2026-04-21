# Tasks: Dropdown Hashtag Filter

**Frame**: `JWpsISMAaM-dropdown-hashtag-filter`
**Prerequisites**: plan.md ✅, spec.md ✅, design-style.md ✅

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (US1, US2, US3, US4)
- **|**: File path affected by this task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pre-flight safety + spec doc lookups. No new project-level init needed (this is an in-place redesign of an existing feature).

- [ ] T001 Read plan.md §Migration Plan + design-style.md §Component Style Details to confirm target tokens/classes | .momorph/specs/JWpsISMAaM-dropdown-hashtag-filter/plan.md
- [ ] T002 Verify last applied migration is `0009_backfill_profiles.sql` so `0010_hashtags_localize.sql` is the correct next number | supabase/migrations/
- [ ] T003 [P] Take a pre-migration backup of the `hashtags` + `kudo_hashtags` tables (non-reversible DELETE follows) | backups/pre-0010-hashtags.sql
- [ ] T004 [P] `grep` the codebase for any OTHER consumer of `filters.allHashtags` / `filters.allDepartments` i18n keys to confirm safe deletion in Phase 3 | src/**/*.tsx,ts

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: DB schema migration + type sync that every downstream phase depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete — Phase 3/4 queries + UI both depend on the new `label_vi` / `label_en` columns.

- [ ] T005 Author migration `0010_hashtags_localize.sql` — RENAME `label → label_en`, ADD `label_vi` nullable, DELETE old junction + hashtag rows whose `slug NOT IN` the canonical 13, UPSERT 13 canonical rows (slug + label_vi + label_en) with `ON CONFLICT (slug) DO UPDATE`, SET NOT NULL on both label columns | supabase/migrations/0010_hashtags_localize.sql
- [ ] T006 Run `supabase db push` against hosted project and verify `supabase migration list` shows 0010 in both Local + Remote columns | (remote action)
- [ ] T007 Update `src/types/database.ts` by hand — in `Database["public"]["Tables"]["hashtags"]`, remove `label: string` and add `label_vi: string` + `label_en: string` to `Row` / `Insert` / `Update` shapes (Option 3a from plan) | src/types/database.ts
- [ ] T008 Replace `supabase/seed.sql`'s 10-row hashtag INSERT block with the canonical 13 rows (slug, label_vi, label_en) using `ON CONFLICT (slug) DO NOTHING` so `supabase db reset` stays idempotent | supabase/seed.sql

**Checkpoint**: Hosted DB migrated, types synced, local seed matches remote → downstream phases unblocked.

---

## Phase 3: User Story 1 — Filter feed by picking a hashtag (Priority: P1) 🎯 MVP

**Goal**: Clicking the Hashtag chip on `/kudos` opens a dark-navy popover listing the 13 locale-resolved hashtags. Selecting one writes `?hashtag=<slug>` via `router.replace()` and the feed/carousel/spotlight refetch with the filter.

**Independent Test**: Navigate to `/kudos`, click the Hashtag chip, pick `#Cống hiến` (vi locale). Assert URL becomes `?hashtag=dedicated`, feed re-renders with only matching kudos, dropdown closes, active filter chip `#Cống hiến ✕` appears below the chip row.

### Backend (US1)

- [ ] T009 [US1] TDD — add Vitest test for `getKudoHashtags()` that mocks `getLocale()` → `"vi"` and asserts the Supabase `select()` is called with `"slug, label:label_vi"` and `.order("label_vi")`; mirror case for `"en"` | src/app/kudos/__tests__/actions.hashtags.spec.ts
- [ ] T010 [US1] Implement locale-resolved SELECT in `getKudoHashtags()` (pick `label_vi` vs `label_en` by `await getLocale()`, order by the chosen column) — make T009 green | src/app/kudos/actions.ts

### Frontend — tests first (US1)

- [ ] T011 [P] [US1] TDD — write `FilterDropdown.spec.tsx` scenario: panel opens on chip click and renders N items from `options` prop with dark-navy background (`bg-[var(--color-details-container-2,#00070C)]`) + cream border class | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T012 [P] [US1] TDD — scenario: clicking a non-selected item calls `onSelect(slug)` and popover closes; no virtual "All" first row is rendered | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T013 [P] [US1] TDD — scenario: item matching `value` prop carries `aria-selected="true"` + text-shadow class `[text-shadow:_0_4px_4px_rgba(0,0,0,0.25),_0_0_6px_#FAE287]` (FR-005) | src/components/kudos/__tests__/FilterDropdown.spec.tsx

### Frontend — implementation (US1)

- [ ] T014 [US1] Swap `FilterDropdown.tsx` panel container classes: `bg-[var(--color-panel-surface,#FFF9E8)]` → `bg-[var(--color-details-container-2,#00070C)]`; add `border border-[var(--color-border-secondary)]` + `shadow-[0_8px_24px_rgba(0,0,0,0.35)]`; `py-2` → `p-1.5` | src/components/kudos/FilterDropdown.tsx
- [ ] T015 [US1] Swap item row classes to dark theme: base `flex h-14 items-center gap-1 rounded p-4 font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.5px] text-white hover:bg-[var(--color-accent-cream)]/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]`; selected overlay `bg-[var(--color-accent-cream)]/10 [text-shadow:_0_4px_4px_rgba(0,0,0,0.25),_0_0_6px_#FAE287]`; remove the `active ? "bg-cream/40"` cursor highlight | src/components/kudos/FilterDropdown.tsx
- [ ] T016 [US1] Remove the `allOptions` virtual first row (line ~71-74) — listbox iterates `options` directly; commit path `commit(idx)` unchanged | src/components/kudos/FilterDropdown.tsx
- [ ] T017 [US1] Delete `filters.allHashtags` + `filters.allDepartments` keys from both locale files (confirmed via T004 grep that no other consumer references them) | src/messages/vi.json, src/messages/en.json
- [ ] T018 [US1] Update `FilterBar.spec.tsx` if any existing assertion references the removed "All hashtags" / "All departments" labels or the old cream panel class | src/components/kudos/__tests__/FilterBar.spec.tsx

**Checkpoint**: User Story 1 complete — happy-path select-and-filter works end-to-end with real Supabase data.

---

## Phase 4: User Story 2 — Dismiss without changing filter (Priority: P1)

**Goal**: The popover closes on outside-click (using a `window` listener so iOS body-click-through works), ESC key (returning focus to the chip), chip re-click, and a second selection elsewhere — without mutating `?hashtag` when no item was selected. FR-004, FR-009.

**Independent Test**: Open the dropdown. (a) Click anywhere outside → closes, URL unchanged. (b) Press ESC → closes, focus on chip. (c) Click the chip again → toggles closed. (d) Click the Department chip → Hashtag closes (FR-009 mutual exclusion). (e) Click the currently-selected item → URL drops `?hashtag` (FR-003 toggle-off).

### Frontend — tests first (US2)

- [ ] T019 [P] [US2] TDD — scenario: mousedown outside the panel + chip closes the popover and leaves `onSelect` uninvoked | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T020 [P] [US2] TDD — scenario: ESC key closes the popover and moves focus back to the trigger button | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T021 [P] [US2] TDD — scenario: clicking the currently-selected item calls `onSelect(null)` (toggle-off, FR-003) | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T022 [P] [US2] TDD — scenario: opening a second `FilterDropdown` with different `kind` closes the first (mutual exclusion, FR-009) — render two instances in the test and simulate opening the second | src/components/kudos/__tests__/FilterDropdown.spec.tsx

### Frontend — implementation (US2)

- [ ] T023 [US2] Swap outside-click listeners from `document.addEventListener("mousedown"/"touchstart", onDown)` to `window.addEventListener(...)` (TR-003) — mirror the change in cleanup; verify iOS Safari tap still closes | src/components/kudos/FilterDropdown.tsx
- [ ] T024 [US2] Inside the click handler on a selected item, call `onSelect(null)` instead of `onSelect(slug)` (toggle-off); no virtual "All" row to fall back on | src/components/kudos/FilterDropdown.tsx

**Checkpoint**: All dismissal paths work; mutual exclusion verified; toggle-off clears URL.

---

## Phase 5: User Story 3 — Keyboard navigation (Priority: P2)

**Goal**: Keyboard-first users can open/navigate/select/close the popover entirely via `Enter`, `ArrowUp/Down`, `Home`, `End`, `Escape`. WCAG 2.1.1 compliance. Existing keyboard logic in `FilterDropdown` is mostly already in place — this phase verifies + tightens the flow.

**Independent Test**: Tab to the Hashtag chip. Press Enter → dropdown opens with focus on the currently-selected item (or first item). ArrowDown/ArrowUp moves the visual cursor; Home/End jump to endpoints; Enter selects; Esc cancels.

### Frontend — tests first (US3)

- [ ] T025 [P] [US3] TDD — scenario: pressing Enter/Space on the closed chip opens the popover with `activeIndex` set to the matching `value` (or `0`) | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T026 [P] [US3] TDD — scenario: ArrowDown/ArrowUp move `activeIndex`; clamped at `[0, options.length - 1]` (no wrap, matches existing behaviour) | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T027 [P] [US3] TDD — scenario: Home jumps to index 0; End jumps to `options.length - 1` | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T028 [P] [US3] TDD — scenario: Enter/Space on an active item calls `commit(activeIndex)` and closes the popover; Esc closes without selecting | src/components/kudos/__tests__/FilterDropdown.spec.tsx

### Frontend — implementation (US3)

- [ ] T029 [US3] Audit the existing `handleKeyDown` in `FilterDropdown.tsx` against T025–T028; adjust bounds (no more `+1` offset from the removed virtual "All" row) and ensure Home/End still land on valid indices | src/components/kudos/FilterDropdown.tsx

**Checkpoint**: Keyboard navigation covered end-to-end; no mouse-required path.

---

## Phase 6: User Story 4 — Scroll through a long list (Priority: P3)

**Goal**: On viewports where 13 items × 56 px = 728 px exceeds the panel `max-height`, the inner list scrolls vertically while panel chrome stays anchored. US4.

**Independent Test**: Resize the viewport to 500 px height, open the dropdown, verify a vertical scrollbar appears on the `<ul>` and all 13 items are reachable by scroll. Selection works from any scroll position.

### Frontend — tests first (US4)

- [ ] T030 [P] [US4] TDD — scenario: rendering 13 options sets listbox `max-h` / `overflow-y-auto` classes; simulate a short viewport and assert `.scrollHeight > .clientHeight` | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T031 [P] [US4] TDD — scenario: selecting an item while the list is scrolled still calls `onSelect` and closes the popover | src/components/kudos/__tests__/FilterDropdown.spec.tsx

### Frontend — implementation (US4)

- [ ] T032 [US4] Change the listbox `max-h-[320px]` class to `max-h-[min(640px,calc(100vh-160px))]` + keep `overflow-y-auto`; style the scrollbar for Firefox (`scrollbar-width: thin`) and WebKit (`scrollbar-color: #998C5F #00070C`) | src/components/kudos/FilterDropdown.tsx

**Checkpoint**: All 4 user stories ship; dropdown is usable keyboard + mouse + touch at desktop + tablet + short viewports.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error / empty / clipping / Department parity / fixture refresh.

### Error & empty handling

- [ ] T033 [P] TDD — scenario: when `options.length === 0` the trigger chip has `aria-disabled="true"` and clicking it does NOT open the popover (FR-007) | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T034 [P] TDD — scenario: when `disabled` + `onRetry` provided, the inline "Không tải được — Thử lại" renders below the chip and calling Retry invokes `onRetry` (FR-008) | src/components/kudos/__tests__/FilterDropdown.spec.tsx

### Popover clipping (TR-005)

- [ ] T035 Verify popover is NOT clipped by `overflow-x-hidden` on `<main>` at 1920 px and 1366 px — set `overflow: visible` on the `FilterBar` outer `<div>` wrapper OR render popover via `createPortal(<ul …>, document.body)` with absolute position computed from `button.getBoundingClientRect()` | src/components/kudos/FilterBar.tsx, src/components/kudos/FilterDropdown.tsx

### Department parity + responsive

- [ ] T036 [P] Manual walk-through — open `/kudos`, click the Department (Bộ phận) chip, confirm it inherits the dark-navy panel + cream border + selected-item glow; selecting a department still fires `kudos_filter_apply` with `kind: "department"` | (manual QA)
- [ ] T037 [P] Responsive sweep — capture screenshots at 640 px, 1024 px, 1920 px; confirm popover renders anchored to chip and items remain tappable (≥44×44 touch target per constitution Principle II) | (Playwright / manual)

### Analytics verification

- [ ] T038 [P] Confirm `track({ type: "kudos_filter_apply", kind: "hashtag", value: <slug \| "(cleared)"> })` still fires on select + toggle-off (no code changes expected; smoke via existing `FilterBar.spec.tsx` + devtools Network/Console) | src/components/kudos/__tests__/FilterBar.spec.tsx

### Fixture refresh

- [ ] T039 Replace `HASHTAG_SLUGS` array in `seed-kudos-fixtures.ts` with the 13 canonical slugs; run `yarn seed` to re-attach sample kudos to real tags | scripts/seed-kudos-fixtures.ts
- [ ] T040 Verify seeded kudos display filterable hashtag chips on `/kudos` via a visual check; select each of 3 tags and confirm the feed narrows | (manual QA)

### Cross-spec docs

- [ ] T041 [P] `grep` `.momorph/` for legacy slug names (`ontime`, `creative`, `teamwork`, `mentor`, `leadership`, `innovation`, `customer-first`, `wellness`, `fun`) in the parent Live board spec/plan/notes; update to the new 13-tag list | .momorph/specs/MaZUn5xHXZ-kudos-live-board/*.md
- [ ] T042 [P] Tick the Dependencies checklist items in this spec's `spec.md` (migration 0010 pushed, types synced) | .momorph/specs/JWpsISMAaM-dropdown-hashtag-filter/spec.md

### Perf spot-check (TR-001)

- [ ] T043 Open Chrome DevTools Performance tab, record click→dropdown-visible on `/kudos`; confirm < 16 ms on a mid-range laptop. If > 16 ms, wrap the open toggle in `startTransition` and re-measure | (manual DevTools)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies — start immediately.
- **Phase 2 Foundation**: Depends on Phase 1 (backup + number check) → **blocks** all Phase 3+ work because action + UI both query the new `label_vi`/`label_en` columns.
- **Phase 3 US1 (MVP)**: Depends on Phase 2. Backend (T009-T010) can run in parallel with Frontend (T011-T018) because they touch different files, but downstream component tests assume the server action returns shaped data.
- **Phase 4 US2**: Depends on Phase 3 (edits the same `FilterDropdown.tsx`). Sequential with Phase 3 unless tasks carefully partition different regions of the file.
- **Phase 5 US3**: Depends on Phase 4 (removal of virtual "All" row changes keyboard bounds).
- **Phase 6 US4**: Depends on Phase 3 (panel classes finalised before adjusting max-height / scrollbar styling).
- **Phase 7 Polish**: Depends on Phases 3–6.

### Within Each Phase

- Tests FIRST (Red) → Implementation (Green) → Refactor. See Phase 3 order: T009 (test) → T010 (impl), T011–T013 (tests) → T014–T016 (impl).
- File-coordination rule: Phases 3–6 all edit `FilterDropdown.tsx`. Within a phase, `[P]` tests can run in parallel because they only touch the spec file, but implementation tasks on `FilterDropdown.tsx` must be sequential (single-writer per file).

### Parallel Opportunities

- **Phase 1**: T003 (backup) + T004 (grep) are [P].
- **Phase 3 tests**: T011 + T012 + T013 can run in parallel (same spec file but independent `describe` blocks — git merge is trivial).
- **Phase 3 backend vs frontend**: T009–T010 (actions.ts path) is independent of T011–T018 (FilterDropdown path). Different engineers can work concurrently.
- **Phase 4–6 tests**: All test-writing tasks are [P] inside each phase.
- **Phase 7**: T033/T034/T036/T037/T038/T041/T042 can all run in parallel — different owners / files.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 (setup + backup).
2. Complete Phase 2 (migration + types + seed).
3. Complete Phase 3 only (US1: open → select → URL + feed update).
4. **STOP and VALIDATE**: walk the happy path at `/kudos` in both `vi` and `en` locales. Confirm seed-fixtures kudos still render with hashtag chips attaching to the new slugs.
5. Deploy (feature-flag optional — change is visible but backward-compatible at the URL contract level).

### Incremental Delivery

1. Setup + Foundation → push + verify.
2. US1 → test in staging → deploy.
3. US2 → test → deploy.
4. US3 → test → deploy.
5. US4 → test → deploy.
6. Polish round (Phase 7) → final deploy.

### Critical Path (if staffed by one engineer)

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7. Approx 1–2 days of work (spec is small, scope is an in-place redesign, zero new components).

---

## Notes

- **Commit cadence**: commit after each task or each `describe` block (Phases 3–6 all edit `FilterDropdown.tsx` — small commits help bisect regressions).
- **Do NOT amend existing 10-slug hashtag kudos manually** — rely on the cascade DELETE + `yarn seed` pipeline.
- **Revert path**: if Phase 2 migration mis-applies, restore from the T003 backup (`psql $DATABASE_URL < backups/pre-0010-hashtags.sql`) + drop the migration's DB entry via `supabase migration repair --status reverted 0010`.
- **Mobile not covered** — see spec §Out of Scope. Ignore touch-specific tests beyond the window-listener check (T023).
- Mark tasks complete as you go: `[x]`.
