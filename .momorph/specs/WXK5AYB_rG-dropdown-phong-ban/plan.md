# Implementation Plan: Dropdown Phòng ban

**Frame**: `WXK5AYB_rG-dropdown-phong-ban`
**Date**: 2026-04-21
**Spec**: [spec.md](spec.md)
**Design**: [design-style.md](design-style.md)
**Sibling**: [JWpsISMAaM-dropdown-hashtag-filter](../JWpsISMAaM-dropdown-hashtag-filter/plan.md)

---

## Summary

Migrate the `departments` table from 6 generic `SVN-*` seed rows to
the 49 canonical Sun\* organisational codes (user-confirmed Option B,
2026-04-21). Zero new UI code — the dark-navy dropdown visual is
already inherited from the Hashtag sibling via the shared
`FilterDropdown` component with `kind="department"`.

Scope is **DB + seed + fixture only**:

1. **Migration `0011_seed_real_departments.sql`** — INSERT 49 rows,
   NULL-out fixture profiles pointing to old `SVN-*`, DELETE the 6
   old rows.
2. **`supabase/seed.sql`** — replace the 6-row INSERT with the 49-row
   INSERT (VN = EN = code, since department names are proper nouns).
3. **`scripts/seed-kudos-fixtures.ts`** — remap `FIXTURE_USERS.deptCode`
   from the 6 old codes to 8 real codes (mapping table in spec §Migration
   Plan).

All 3 changes land in a single commit. Push order: code commit →
`supabase db push` → `yarn seed`. See spec §Execution order for the
broken-intermediate-state trap.

---

## Technical Context

| | |
|---|---|
| **Language/Framework** | TypeScript / Next.js 16 App Router + React 19 (no FE changes this round) |
| **Primary Dependencies** | Supabase SSR (`@supabase/ssr`), Supabase CLI |
| **Database** | Supabase Postgres (hosted project `opmgaciujjeaugojcail`) — migrations in `supabase/migrations/NNNN_*.sql` |
| **Testing** | Vitest + Testing Library (existing `FilterDropdown.spec.tsx` covers both `kind="hashtag"` and `kind="department"` via sibling test T022 — no new test file needed) |
| **State Management** | URL-as-state (unchanged) |
| **API Style** | Server Actions (`getKudoDepartments()` unchanged) |
| **i18n** | N/A for this screen (codes are proper nouns; no VN/EN variant — spec Q2) |

---

## Constitution Compliance Check

| Requirement | Constitution Rule | Status |
|---|---|---|
| TypeScript strict | Principle I | ✅ No new TS code; existing paths type-check clean |
| `@/*` imports | Principle I | ✅ No new imports |
| Folder structure (Next App Router) | Principle I | ✅ DB migration goes to `supabase/migrations/`, fixture script to `scripts/` — matches existing pattern |
| Responsive Design (3 breakpoints) | Principle II | ✅ Inherited from shared `FilterDropdown` |
| TDD (Red-Green-Refactor) | Principle III | ✅ Existing 18-scenario `FilterDropdown.spec.tsx` covers department kind parameterisation; no new tests required |
| Security (RLS) | Principle IV | ✅ `departments_select_authenticated` policy from migration 0002 already applies; migration 0011 touches data only, no policy change |
| Web-only scope | Project Scope | ✅ No native work |

**Violations**: none.

---

## Architecture Decisions

### Frontend Approach

- **Component structure**: no change. `FilterDropdown` with `kind="department"` is already consumed by `FilterBar`. Visual dark-navy redesign inherited from JWpsISMAaM — no new file needed.
- **State management**: unchanged. URL `?department=<code>` is the single source of truth.
- **Data fetching**: `getKudoDepartments()` fetched once at RSC boundary in `src/app/kudos/page.tsx`, passed down.

### Backend Approach

- **API design**: `getKudoDepartments()` signature + body unchanged. Locale-resolved `label` falls through to `code` (since `name_vi == name_en == code`) — ordering remains alphabetical ASC via the existing `.order(labelCol)` call.
- **Data access**: direct Supabase client (pattern unchanged).
- **Validation**: no new input; read-only action.

### Database Migration Strategy

Migration 0011 is **three-step** inside a single SQL file:

```
INSERT (idempotent on code) → UPDATE profiles.dept_id = NULL → DELETE old SVN-*
```

FK `profiles.department_id → departments.id` defaults to `ON DELETE
NO ACTION`, so step 3 would fail without step 2 first. Idempotent:
re-running hits zero-row WHERE clauses and no-ops.

### Integration Points

- **Existing services**: `src/app/kudos/actions.ts` (`getKudoDepartments`), Supabase server client.
- **Shared components**: `FilterDropdown.tsx` (zero code edit), `FilterBar.tsx` (zero code edit).
- **API contracts**: `Department` type in `src/types/kudo.ts` unchanged (`{ code, label }`).

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/WXK5AYB_rG-dropdown-phong-ban/
├── spec.md              # ✅ shipped (migration plan + execution order)
├── design-style.md      # ✅ shipped (inherited visuals + 5 deltas)
├── plan.md              # this file
├── tasks.md             # next step via /momorph.tasks
└── assets/
    └── frame.png        # ✅ shipped
```

No `research.md` needed — feature reuses established Hashtag sibling
pattern. No architectural unknowns.

### Source Code (affected areas)

```text
# Database
supabase/
├── migrations/
│   └── 0011_seed_real_departments.sql    # NEW — INSERT 49 + NULL profiles + DELETE SVN-*
└── seed.sql                                # EDIT — replace 6-row dept INSERT with 49-row

# Scripts
scripts/
└── seed-kudos-fixtures.ts                  # EDIT — FIXTURE_USERS deptCode remap (8 entries)

# Frontend
# ⚠️ NO changes expected. Verification only:
# - src/components/kudos/FilterDropdown.tsx (inherit dark visual)
# - src/components/kudos/FilterBar.tsx (passes kind="department" unchanged)
# - src/app/kudos/actions.ts (getKudoDepartments body unchanged)
# - src/types/database.ts (hashtags.Row unchanged by this feature; departments row already has name_vi + name_en)
```

### Dependencies

**No new npm packages**. Supabase CLI already installed locally (used for prior migrations 0005-0010).

---

## Implementation Approach

### Phase 0 — Asset Preparation *(skip)*

No new visual assets. The dropdown visual (dark-navy panel, cream border, text-shadow glow on selected) was shipped with the Hashtag sibling.

### Phase 1 — Migration authoring (DB)

Write `supabase/migrations/0011_seed_real_departments.sql` per spec §Migration Plan. 3 SQL statements:

1. `INSERT ... ON CONFLICT (code) DO NOTHING` with all 49 rows.
2. `UPDATE profiles SET department_id = NULL WHERE department_id IN (SELECT id FROM departments WHERE code LIKE 'SVN-%');`
3. `DELETE FROM departments WHERE code LIKE 'SVN-%';`

Full INSERT body (49 rows with VN = EN = code) is pre-written in spec.md §Migration Plan — copy-paste directly.

### Phase 2 — Seed + fixture remap (files)

Coordinated edits — land together in one commit:

- **`supabase/seed.sql`**: replace the existing 6-row `SVN-*` block with the 49-row block (same content as migration 0011 step 1, minus `WHERE` clauses since seed starts from empty).
- **`scripts/seed-kudos-fixtures.ts`**: update `FIXTURE_USERS` array — map the 8 fixture Sunners per the table in spec §Migration Plan:

  ```ts
  const FIXTURE_USERS = [
    { email: "alice@kudos.test",   displayName: "Alice Nguyen",   deptCode: "CEVC1" },
    { email: "bob@kudos.test",     displayName: "Bob Tran",       deptCode: "CEVC1 - DSV" },
    { email: "charlie@kudos.test", displayName: "Charlie Le",     deptCode: "SPD" },
    { email: "diana@kudos.test",   displayName: "Diana Pham",     deptCode: "STVC - EE" },
    { email: "ethan@kudos.test",   displayName: "Ethan Vo",       deptCode: "BDV" },
    { email: "fiona@kudos.test",   displayName: "Fiona Bui",      deptCode: "OPDC - HRD" },
    { email: "george@kudos.test",  displayName: "George Hoang",   deptCode: "CEVC2" },
    { email: "hanna@kudos.test",   displayName: "Hanna Do",       deptCode: "CEVC1 - DSV - UI/UX 1" },
  ] as const;
  ```

### Phase 3 — Push + re-seed (remote ops)

**Strict order** (spec §Execution order):

1. `git commit` all 3 changes together.
2. `supabase db push` — applies 0011. Verify via
   `supabase migration list` that 0011 appears in both Local + Remote columns.
3. **Post-push sanity check** (paste into Supabase SQL editor or
   `psql`):
   ```sql
   select count(*) from departments where code like 'SVN-%';  -- expect 0
   select count(*) from departments;                          -- expect 49
   select count(*) from profiles where department_id is null; -- expect = # of fixture users (8)
   ```
4. `yarn seed` — re-attaches fixture profiles to the real codes.
5. Final check after seed:
   ```sql
   select p.display_name, d.code
   from profiles p
   left join departments d on d.id = p.department_id
   where p.email like '%@kudos.test'
   order by p.display_name;
   ```
   Expect 8 rows mapping per spec §Migration Plan (Alice → CEVC1, Bob → CEVC1 - DSV, etc.).

If you seed BEFORE updating `FIXTURE_USERS`, `backfillProfile()` can't find the old codes in the migrated DB and sets `department_id = NULL`. All 3 file edits must precede the push + seed.

### Phase 4 — QA + polish

- **Visual smoke test**: open `/kudos` after re-seed. Click **Bộ phận** chip → dropdown shows 49 real codes alphabetically sorted. Pick `CEVC1` → feed narrows to fixture Sunners attached to `CEVC1` (Alice). Toggle-off by re-clicking.
- **Long-label check (FR-011)**: scroll to `CEVC1 - DSV - UI/UX 1` — verify it wraps to 2 lines inside `h-14` row OR decide to add `truncate` per Option B in spec.
- **Playwright manual**: open `/kudos`, open both Hashtag and Department dropdowns, verify mutual exclusion (FR-009).
- **Existing tests**: re-run `npx vitest run src/components/kudos/__tests__/FilterDropdown.spec.tsx` — should stay 18/18 green (kind is parameterised, no change needed).

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `yarn seed` run before `FIXTURE_USERS` update → profiles' `department_id` nulled out | Medium | Low | Spec §Execution order + this plan §Phase 3 emphasise strict order; all 3 file edits in one commit |
| Long codes (`CEVC1 - DSV - UI/UX 1`) wrap or overflow visually | Medium | Low | FR-011 has 3 options (wrap / truncate / widen panel); decision at QA time, default = wrap (already fits in `h-14`) |
| Migration 0011 INSERT clashes with prior `supabase/seed.sql` run (which still has SVN codes) | Low | Low | `INSERT ... ON CONFLICT DO NOTHING` is idempotent; DELETE targets only `LIKE 'SVN-%'` |
| Non-reversible migration — DELETE of 6 old rows | Low | Low | Dev-only data, no prod users. Restore via `supabase/seed.sql` rollback if needed |
| FR-011 Option C (widen panel) would diverge from Hashtag sibling visual | Low (unlikely needed) | Medium (UX consistency) | Prefer Option A (wrap) or B (truncate). Don't pick C unless design approves |

### Estimated Complexity

- **Frontend**: **None** — zero file edits expected.
- **Backend**: **Low** — 1 SQL migration (~80 lines including 49 INSERT rows).
- **Fixtures**: **Low** — 8-line array update in `seed-kudos-fixtures.ts`.
- **Testing**: **None new** — inherited from Hashtag sibling.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component interactions**: existing
  [src/components/kudos/__tests__/FilterDropdown.spec.tsx](../../../src/components/kudos/__tests__/FilterDropdown.spec.tsx)
  covers department kind through these scenarios (all use the shared
  component; kind-specific rendering already parameterised):
  - `trigger labels — renders the department label when kind='department'`
  - `US2 — T022 opening one popover closes the other (FR-009 mutual exclusion)` — renders both `kind="hashtag"` AND `kind="department"` instances simultaneously
  - All 18 other scenarios (open, close, keyboard, scroll, selected state, disabled, retry) apply unchanged because `kind` is a prop, not a code-path
- [x] **External dependencies**: Supabase — migration 0011 validated
  by `supabase migration list` + Phase 3 sanity-check SQL.
- [x] **Data layer**: post-migration smoke `SELECT count(*) FROM departments;`
  must return 49; `SELECT count(*) WHERE code LIKE 'SVN-%';` must return 0.
- [x] **User workflows**: manual Playwright walk-through at Phase 4.

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Re-seed fixtures → open `/kudos` → Bộ phận chip active → dropdown shows 49 codes alphabetically
   - [ ] Click `CEVC1` → URL `?department=CEVC1` → feed narrows to Alice
   - [ ] Re-click `CEVC1` → URL clears → feed restores

2. **Error Handling**
   - [ ] `getKudoDepartments()` rejects (manually break DB creds) → chip disabled + Retry link
   - [ ] Stale `?department=SVN-ENG` in URL → dropdown opens with no selected item, no crash

3. **Edge Cases**
   - [ ] Open Department while Hashtag is open → Hashtag closes (FR-009)
   - [ ] Long code `CEVC1 - DSV - UI/UX 1` → verify wrap or truncate behaviour (FR-011 QA call)

### Coverage Goals

| Area | Target | Priority |
|---|---|---|
| Migration 0011 smoke SELECT | 1 execution post-push | High |
| Department dropdown rendering | Covered by existing sibling tests | High |
| Fixture remap | 1 manual Playwright after `yarn seed` | High |
| Long-label visual QA | 1 manual inspection | Medium |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed
- [x] `spec.md` finalized (all clarifications resolved 2026-04-21)
- [x] `design-style.md` finalized (inherits sibling)
- [x] Hashtag sibling redesign shipped (`FilterDropdown` dark visual already applied)
- [x] `departments` table schema already has `code` + `name_vi` + `name_en` (no schema change)
- [x] RLS `departments_select_authenticated` already in place (migration 0002)
- [ ] Migration 0011 authored + pushed to hosted Supabase (Phase 1 + 3)
- [ ] Fixture re-seed executed (`yarn seed`)

### External Dependencies

- **Supabase CLI** — already linked to hosted project `opmgaciujjeaugojcail` per prior session migrations (0005-0010).

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate a concrete task list — though scope is small enough (3 files, no parallel opportunities because all 3 land together) that you may skip tasks.md and jump directly to `/momorph.implement`.
2. **Begin implementation**:
   - `/momorph.implement` scope=Phase1 → author migration 0011.
   - `/momorph.implement` scope=Phase2 → update seed.sql + fixture script.
   - Commit all 3 together → push → seed → QA.

---

## Notes

- **Why no research.md**: feature is a derivative of the Hashtag sibling with no new UI, no new architecture, and no new patterns. Spec §Migration Plan + §Execution Order give a complete path. Research docs would be noise.
- **`PAO - PAO` / `OPD`** (Figma listed but excluded): both deliberately omitted from the canonical 49 — first likely a duplicate-of-parent artefact, second a typo for `OPDC`. Confirm with content-owner before any future migration adds them.
- **Alphabetical vs Figma-organic ordering**: explicitly alphabetical ASC by code. Better UX at 49 items; matches Hashtag sibling convention.
- **Release rollback**: if Phase 3 fails mid-way, re-running is safe (all steps idempotent). Profile `department_id` restore is handled by `backfillProfile()`.
