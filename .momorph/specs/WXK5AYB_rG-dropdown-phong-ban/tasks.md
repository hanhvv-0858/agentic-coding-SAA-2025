# Tasks: Dropdown Phòng ban (Department Filter)

**Frame**: `WXK5AYB_rG-dropdown-phong-ban`
**Prerequisites**: plan.md ✅, spec.md ✅, design-style.md ✅
**Sibling**: `JWpsISMAaM-dropdown-hashtag-filter` — shared `FilterDropdown` component + all rendering tests inherited.

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (US1, US2, US3, US4)
- **|**: File path affected by this task

---

## Phase 1: Setup (Pre-flight)

**Purpose**: Verify prerequisites before authoring migration. No project-level scaffolding needed (scope is DB + seed + fixture only).

- [x] T001 Confirm last applied migration is `0010_hashtags_localize.sql` so `0011` is the correct next number via `supabase migration list` | supabase/migrations/
- [x] T002 [P] Cross-read spec §Migration Plan to extract the canonical 49-code INSERT body + 8-row fixture remap table for copy-paste | .momorph/specs/WXK5AYB_rG-dropdown-phong-ban/spec.md
- [x] T003 [P] Verify `departments` table schema already has `code` + `name_vi` + `name_en` columns (no schema change this migration) | src/types/database.ts

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Author the 3 coordinated file changes. They MUST land in ONE commit before `supabase db push` + `yarn seed` — running `yarn seed` with stale `FIXTURE_USERS.deptCode` against the migrated DB will NULL-out fixture profile department_ids (spec §Execution order).

**⚠️ CRITICAL**: All three edits commit together. Push + seed run AFTER the commit per Phase 3.

- [x] T004 Author migration `0011_seed_real_departments.sql` with the 3-step SQL: (1) `INSERT ... ON CONFLICT (code) DO NOTHING` with all 49 canonical codes from spec (VN = EN = code), (2) `UPDATE profiles SET department_id = NULL WHERE department_id IN (SELECT id FROM departments WHERE code LIKE 'SVN-%')`, (3) `DELETE FROM departments WHERE code LIKE 'SVN-%'` | supabase/migrations/0011_seed_real_departments.sql
- [x] T005 [P] Replace the 6-row `SVN-*` INSERT block in `supabase/seed.sql` with the 49-row canonical INSERT (`name_vi = name_en = code`), keep `ON CONFLICT (code) DO NOTHING` for idempotency | supabase/seed.sql
- [x] T006 [P] Remap `FIXTURE_USERS` in `scripts/seed-kudos-fixtures.ts` — update the 8-entry array so `deptCode` fields point to real canonical codes: Alice→`CEVC1`, Bob→`CEVC1 - DSV`, Charlie→`SPD`, Diana→`STVC - EE`, Ethan→`BDV`, Fiona→`OPDC - HRD`, George→`CEVC2`, Hanna→`CEVC1 - DSV - UI/UX 1` | scripts/seed-kudos-fixtures.ts
- [x] T007 Single-commit all three files (T004 + T005 + T006) via `git add` + `git commit` so the DB + seed + fixture edits land atomically | (git)

**Checkpoint**: Migration + seed + fixture edits committed. Nothing pushed yet.

---

## Phase 3: User Story 1 — Filter feed by picking a department (Priority: P1) 🎯 MVP

**Goal**: Pushing migration 0011 + re-seeding fixtures makes the Department dropdown render the 49 canonical Sun\* codes, and selecting one filters `/kudos` feed by the real fixture Sunner attached to that code.

**Independent Test**: After Phase 2 push + seed, navigate to `/kudos` (logged-in), click **Bộ phận** chip → dropdown shows 49 codes alphabetically → pick `CEVC1` → URL becomes `?department=CEVC1`, feed narrows to Alice's kudos, `ActiveChip "CEVC1 ✕"` appears below the FilterBar.

### DB push + re-seed (US1)

- [x] T008 [US1] Run `supabase db push` against the hosted project to apply migration 0011. Verify via `supabase migration list` that 0011 appears in BOTH Local + Remote columns | (remote action)
- [x] T009 [US1] Post-push sanity-check SQL (Supabase SQL editor or `psql`): `SELECT count(*) FROM departments WHERE code LIKE 'SVN-%';` expect 0; `SELECT count(*) FROM departments;` expect 49; `SELECT count(*) FROM profiles WHERE department_id IS NULL AND email LIKE '%@kudos.test';` expect 8 | (SQL verification)
- [ ] T010 [US1] Run `yarn seed` to re-attach fixture profiles to the new codes via `backfillProfile()` | (local command)
- [ ] T011 [US1] Post-seed sanity-check SQL to confirm fixture mapping: `SELECT p.display_name, d.code FROM profiles p LEFT JOIN departments d ON d.id = p.department_id WHERE p.email LIKE '%@kudos.test' ORDER BY p.display_name;` — expect 8 rows matching the T006 mapping table | (SQL verification)

### Smoke test (US1)

- [ ] T012 [US1] Manual walkthrough on `/kudos`: open Bộ phận chip → verify 49 codes render alphabetically (first row `BDV`, last row `STVC - R&D - SDX` or similar). Pick `CEVC1` → URL becomes `?department=CEVC1` via `router.replace()`, feed renders only Alice's kudos (she's the only fixture attached to `CEVC1`). Click `CEVC1` again → toggle-off clears URL + restores full feed | (manual QA)

**Checkpoint**: Happy path end-to-end works with real data. Department filter is live.

---

## Phase 4: User Story 2 — Dismiss without changing filter (Priority: P1)

**Goal**: Verify the popover closes via outside-click / ESC / chip re-click / opening the Hashtag dropdown (mutual exclusion, FR-009) without mutating `?department`. All behavior inherited from the shared `FilterDropdown` — this phase is verification only, no new code.

**Independent Test**: With dropdown open, try (a) click outside, (b) press ESC, (c) click Bộ phận chip, (d) click the Hashtag chip — all should close the Department popover without changing `?department` URL param.

- [x] T013 [P] [US2] Verify existing `FilterDropdown.spec.tsx` scenario `T019` passes with department-kind use case (outside mousedown closes popover) by running `npx vitest run src/components/kudos/__tests__/FilterDropdown.spec.tsx` — should stay 18/18 green after Phase 2 commit | src/components/kudos/__tests__/FilterDropdown.spec.tsx
- [ ] T014 [P] [US2] Manual mutual-exclusion walkthrough: open Bộ phận → click Hashtag chip → confirm Bộ phận closes AND Hashtag opens (FR-009, covered by sibling T022) | (manual QA)

**Checkpoint**: Dismissal paths confirmed. No code change was required.

---

## Phase 5: User Story 3 — Keyboard navigation (Priority: P2)

**Goal**: Tab to Bộ phận chip, Enter opens, Arrow/Home/End navigate, Enter commits, Esc cancels. Fully inherited from shared `FilterDropdown`.

**Independent Test**: Focus Bộ phận chip via Tab → Enter opens → ArrowDown 2× → Enter commits second item → URL updates.

- [ ] T015 [US3] Manual keyboard-only walkthrough on Bộ phận dropdown: Tab navigates to chip, Enter opens, ArrowDown/Up move cursor, Home/End jump to first/last, Enter commits, Esc cancels and returns focus to chip | (manual QA)

**Checkpoint**: Keyboard a11y confirmed. Existing sibling tests (T025–T028) cover the logic.

---

## Phase 6: User Story 4 — Scroll through long list (Priority: P3)

**Goal**: 49 codes × 56 px row = 2744 px intrinsic → listbox must scroll internally past `max-h-[min(640px,calc(100vh-160px))]`. Inherited from shared `FilterDropdown`.

**Independent Test**: Open Bộ phận dropdown on desktop at 900 px viewport height → verify vertical scrollbar appears → scroll to `STVC - R&D - SDX` (near alphabet end) → click → URL updates.

- [ ] T016 [US4] Manual long-list scroll walkthrough: open Bộ phận, verify scrollbar appears, scroll to a late-alphabet code like `STVC - R&D - SDX` (alphabetical position ~45), click, confirm `?department=STVC - R%26D - SDX` URL + feed narrows (empty if no fixture attached, which is fine for this test) | (manual QA)

**Checkpoint**: Scroll works at short viewports.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: FR-011 long-label QA + cross-spec docs cleanup.

### FR-011 long-label visual QA

- [x] T017 Open Bộ phận dropdown, scroll to `CEVC1 - DSV - UI/UX 1` (26 chars). Observe: does it wrap to 2 lines inside the 56 px row (acceptable = Option A) or overflow horizontally (need Option B `truncate min-w-0`)? | (manual QA)
- [x] T018 If T017 shows overflow, add `truncate min-w-0` to the label span inside `<li>` in `FilterDropdown.tsx` item markup; requires wrapping the label text in `<span className="truncate min-w-0">`. Re-run `npx vitest run src/components/kudos/__tests__/FilterDropdown.spec.tsx` to confirm 18/18 stay green | src/components/kudos/FilterDropdown.tsx

### Cross-spec docs

- [x] T019 [P] Update parent Live board spec if any section references the old 6 `SVN-*` department codes — grep `.momorph/specs/MaZUn5xHXZ-kudos-live-board/` for `SVN-ENG`/`SVN-DES`/etc. and update | .momorph/specs/MaZUn5xHXZ-kudos-live-board/*.md
- [x] T020 [P] Tick Dependencies checklist in this feature's spec.md as items complete (Migration authored/pushed, seed.sql updated, fixture remapped, FR-011 verified) | .momorph/specs/WXK5AYB_rG-dropdown-phong-ban/spec.md

### Analytics verification

- [ ] T021 [P] Open DevTools Network/Console on `/kudos`, click a department → confirm `track({ type: "kudos_filter_apply", kind: "department", value: "CEVC1" })` fires. Click `ActiveChip ✕` → confirm same event fires with `value: "(cleared)"` (no code change expected; existing FilterBar wiring inherited) | (manual QA + devtools)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies — start immediately.
- **Phase 2 Foundation**: Depends on Phase 1. All three file edits (T004, T005, T006) must commit together in T007 — **blocks** every subsequent push/seed task.
- **Phase 3 US1**: Depends on Phase 2 commit. T008 → T009 → T010 → T011 → T012 are strict sequential (push → verify → seed → verify → QA) because each step depends on the previous one's side-effects.
- **Phase 4 US2, Phase 5 US3, Phase 6 US4**: Depend on Phase 3 (need real data to exercise). Can run in parallel amongst themselves — they're all verification-only, different testing surfaces.
- **Phase 7 Polish**: Depends on Phase 3-6. Cross-spec doc updates (T019, T020, T021) can run in parallel.

### Within Phase 2

- T005 + T006 are `[P]` — different files, no dependency on each other.
- T004 is NOT `[P]` with T005/T006 — they all get committed together in T007, but T004 is logically "first" as the migration anchor.
- T007 blocks all further work — single commit gate.

### Within Phase 3

- T008 → T009 → T010 → T011 → T012 all sequential. Cannot parallelize — each step's output feeds the next (`supabase db push` must precede `SELECT count`, which must precede `yarn seed`, etc.).

### Parallel Opportunities

- **Phase 1**: T002 + T003 `[P]` — read spec + verify schema in parallel.
- **Phase 2**: T005 + T006 `[P]` (T004 sequential).
- **Phase 4/5/6**: can run in parallel by different QA owners — each user story's verification is independent after Phase 3 completes.
- **Phase 7**: T019 + T020 + T021 all `[P]` — different files/actions.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 (verify prerequisites).
2. Complete Phase 2 (author the 3 file edits + single-commit).
3. Complete Phase 3 (push + seed + verify — real data shipping).
4. **STOP and VALIDATE**: walk the happy path on `/kudos` with real 49 codes. Confirm fixture Sunners show in filter results.
5. If OK → deploy/commit as MVP.

### Verification rounds

- Phase 4 → confirm dismissal paths (quick manual).
- Phase 5 → confirm keyboard (quick manual).
- Phase 6 → confirm scroll (quick manual).
- Phase 7 → FR-011 QA + optional Option B fix + docs sync.

### Critical path (single engineer)

Phase 1 → Phase 2 → Phase 3 (strict sequence) → Phase 4/5/6 in parallel → Phase 7.  
Approx **1-2 hours** of work total: 15 min author SQL, 5 min seed edits, 5 min fixture script, 30 min push+seed+verify, 30-60 min QA walkthroughs.

---

## Notes

- **Zero frontend code changes** expected unless T017 surfaces long-label overflow → T018 adds `truncate min-w-0`.
- **Commit strategy**: Phase 2 tasks (T004, T005, T006) land in a single commit via T007 to avoid the race where `yarn seed` runs with stale `FIXTURE_USERS` (spec §Execution order).
- **Rollback**: if push succeeds but seed fails (unlikely; `backfillProfile` is defensive), re-run `yarn seed`. Migration 0011 itself is idempotent (ON CONFLICT DO NOTHING + WHERE clauses that target only SVN-\*).
- **Release cleanup**: the temporary `[kudos]` `console.error` logs added in a prior session (page.tsx:119-150) are not affected by this work — leave them until a dedicated "release prep" commit.
- Mark tasks complete as you go: `[x]`.
