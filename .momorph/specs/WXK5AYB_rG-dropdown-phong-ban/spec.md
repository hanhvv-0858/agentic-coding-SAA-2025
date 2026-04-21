# Feature Specification: Dropdown Phòng ban (Department Filter)

**Frame ID**: `721:5684` (wrapper) / `563:8027` (dropdown panel)
**Frame Name**: `Dropdown Phòng ban`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Screen ID**: `WXK5AYB_rG`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/WXK5AYB_rG
**Parent screen**: `MaZUn5xHXZ` — Kudos Live board (`/kudos`)
**Sibling screen**: `JWpsISMAaM` — Dropdown Hashtag filter (same popover pattern)
**Created**: 2026-04-21
**Status**: Draft

---

## Overview

Popover dropdown that opens from the **Bộ phận** (Department) chip in the
Live board's `FilterBar`. The panel lists all department codes registered
in the system (`CEVC2`, `CEVC3`, `CPV`, `OPDC - HRD - HRBP`, `STVC - R&D`,
`Infra`, …). Picking one filters **All Kudos feed**, **Highlight
carousel**, and **Spotlight board** by the senders whose
`profiles.department_id` matches — using the existing
`FilterState.department` contract in `src/types/kudo.ts` consumed by
`getKudoFeed({ department })`.

The dropdown is the **direct sibling** of
[JWpsISMAaM-dropdown-hashtag-filter](../JWpsISMAaM-dropdown-hashtag-filter/spec.md)
— same popover shell, same open/close/keyboard/toggle-off behaviour,
same shared `FilterDropdown` component. This spec only documents the
**deltas** + the content list; the base behaviour is inherited.

### Relationship to existing code

`FilterDropdown` with `kind="department"` is **already wired** in the
codebase — see
[src/components/kudos/FilterBar.tsx:93-100](../../../src/components/kudos/FilterBar.tsx#L93)
and [src/components/kudos/FilterDropdown.tsx](../../../src/components/kudos/FilterDropdown.tsx).
The dark-navy visual redesign shipped for the Hashtag dropdown
(JWpsISMAaM) is inherited. **No new component files are needed.**
Implementation for this spec is limited to:

- Migration `0011_seed_real_departments.sql` — replace the 6 generic
  `SVN-*` seed rows with the 49 canonical Sun\* department codes
  (user-confirmed Option B on 2026-04-21).
- Seed + fixture-script refresh so fixture Sunners re-attach to real
  department codes after migration push.
- Verifying the existing `getKudoDepartments()` action — no body
  change (already locale-resolved + already works with the new data).

### Analytics (existing, no new event)

`FilterBar.updateParam()` already fires
`track({ type: "kudos_filter_apply", kind: "department", value: <code | "(cleared)"> })`
on every URL update — shared with the Hashtag path.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Filter feed by picking a department (Priority: P1)

A Sunner clicks the **Bộ phận** chip. Dropdown opens with all
department codes. They pick one (e.g. `CEVC2`). Dropdown closes, the
URL updates to `?department=CEVC2`, and the feed / carousel / spotlight
narrow to kudos whose sender belongs to that department.

**Why this priority**: Core reason the dropdown exists; mirror of the
Hashtag P1 flow.

**Independent Test**: Navigate to `/kudos`, click **Bộ phận** chip,
pick `CEVC2`. Assert URL `?department=CEVC2`, feed re-renders narrowed,
chip shows the active code in the ActiveChip row below.

**Acceptance Scenarios**:

1. **Given** the Sunner is on `/kudos` with no department filter applied,
   **when** they click the Bộ phận chip, **then** the dropdown opens
   anchored to the chip, all available department codes are rendered,
   and no item is marked selected.
2. **Given** the dropdown is open, **when** the Sunner clicks one item
   (e.g. `CEVC2`), **then** the dropdown closes, `?department=CEVC2`
   is written via `router.replace()`, and the three feed blocks refetch
   with the filter applied (re-using existing `getKudoFeed({ department })`
   wiring).
3. **Given** `?department=CEVC2` is already in the URL, **when** the
   Sunner re-opens the dropdown, **then** the matching item renders
   with the **Selected** visual state (cream-tinted panel + text-shadow
   glow) and carries `aria-selected="true"`.
4. **Given** the dropdown is open, **when** the Sunner clicks the
   currently-selected item again, **then** the filter clears,
   `?department` is removed from the URL, and the dropdown closes
   (toggle-off — FR-003).

---

### User Story 2 — Dismiss without changing the filter (Priority: P1)

Same as the Hashtag sibling (US2 in that spec). Outside-click, ESC,
chip re-click all close the popover without mutating state. ESC
returns focus to the chip. Opening the Hashtag dropdown closes this
one (mutual exclusion — FR-009).

**Acceptance Scenarios**: mirrors
[JWpsISMAaM/spec.md §US2](../JWpsISMAaM-dropdown-hashtag-filter/spec.md#user-story-2).

---

### User Story 3 — Keyboard navigation (Priority: P2)

Identical to
[JWpsISMAaM/spec.md §US3](../JWpsISMAaM-dropdown-hashtag-filter/spec.md#user-story-3).
Enter on chip opens, ArrowDown/Up move, Home/End jump, Enter commits,
Esc cancels.

---

### User Story 4 — Scroll through a long list (Priority: P3)

The department list is **much longer** than hashtags — Figma source
lists **49 department codes** (CTO, SPD, FCOV, CEVC1, CEVC2,
STVC - R&D, CEVC2 - CySS, FCOV - LRM, CEVC2 - System, OPDC - HRF,
CEVC1 - DSV - UI/UX 1, CEVC1 - DSV, CEVEC, OPDC - HRD - C&C, STVC,
FCOV - F&A, CEVC1 - DSV - UI/UX 2, CEVC1 - AIE, OPDC - HRF - C&B,
FCOV - GA, FCOV - ISO, STVC - EE, GEU - HUST, CEVEC - SAPD,
OPDC - HRF - OD, CEVEC - GSD, GEU - TM, STVC - R&D - DTR,
STVC - R&D - DPS, CEVC3, STVC - R&D - AIR, CEVC4, PAO, GEU, GEU - DUT,
OPDC - HRD - L&D, OPDC - HRD - TI, OPDC - HRF - TA, GEU - UET,
STVC - R&D - SDX, OPDC - HRD - HRBP, PAO - PEC, IAV, STVC - Infra,
CPV - CGP, GEU - UIT, OPDC - HRD, BDV, CPV, PAO - PAO). 49 × 56 px =
2744 px intrinsic — dropdown **MUST** scroll internally past
`max-height: min(640px, calc(100vh - chipBottom - 16px))`.

**Why this priority**: Must-have at MVP because the list length
guarantees overflow on any normal viewport — unlike the 13-tag Hashtag
list which barely fits at desktop. Raised from P3 (Hashtag sibling) to
**P2** here. Scroll is already implemented in `FilterDropdown`; this
spec verifies it remains reachable.

**Acceptance Scenarios**:

1. **Given** 49 department codes returned by `getKudoDepartments()`,
   **when** the dropdown opens, **then** the listbox shows a vertical
   scrollbar and all 49 codes are reachable via scroll or arrow-key
   navigation.
2. **Given** the user scrolls to an item near the bottom (e.g. `PAO`),
   **when** they click it, **then** `onSelect("PAO")` fires and the
   popover closes regardless of scroll offset.

---

### Edge Cases

- **Zero departments in DB** — Bộ phận chip renders **disabled** with
  `aria-disabled="true"` and `opacity-50`. Click is a no-op. Matches
  FR-007 pattern from the Hashtag sibling.
- **Hashtag + Department active simultaneously** — both chips carry the
  selected visual + their own `ActiveChip` pill appears in the row
  below FilterBar. `getKudoFeed` intersects the two filters (already
  implemented).
- **Department code renamed / deleted upstream** — active
  `?department=<stale>` doesn't crash. Dropdown opens with no item
  highlighted; feed returns empty until the user clears the filter
  via toggle-off or the `ActiveChip` ✕.
- **Very long code (e.g. `CEVC1 - DSV - UI/UX 1`)** — width clamp
  `max-w-[260px]` with `overflow-hidden text-ellipsis` prevents
  overflow. Already implemented via panel `w-[215px] max-w-[260px]`;
  long items may need `min-w-0` + `truncate` class on the label span.
  See **FR-011** below.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Description | Interactions |
|-----------|-------------|--------------|
| `FilterDropdown` (popover, `kind="department"`) | Floating popover shell inherited from Hashtag sibling — 215×hug, cream `#998C5F` 1px border, navy `#00070C` fill, radius 8, padding 6 | Opens on chip click; closes on outside-click / ESC / select / chip re-click / mutually exclusive with Hashtag |
| `HashtagItem` → reused for departments | Row with plain code text (no `#` prefix — departments are raw codes), Montserrat 16/24/700, white fill, padding 16, radius 4 | Hover `bg-cream/8`, Selected `bg-cream/10` + text-shadow glow |
| **Active filter chip** (existing) | Cream pill below FilterBar showing the active code + ✕ via `<ActiveChip>` in [FilterBar.tsx:132-141](../../../src/components/kudos/FilterBar.tsx#L132) | Click ✕ → `updateParam("department", null)` — same clear path |

See [design-style.md](design-style.md) for pixel specs + Node IDs.

### Navigation Flow

- **From**: Kudos Live board (`/kudos`) — click **Bộ phận** chip in
  FilterBar.
- **Close triggers**: identical to Hashtag sibling.
- **To**: URL mutates to `?department=<code>` via `router.replace()`
  with `{ scroll: false }`.

### Visual Requirements

Identical to
[JWpsISMAaM/design-style.md](../JWpsISMAaM-dropdown-hashtag-filter/design-style.md)
except the item label:

- **No `#` prefix** — department codes are plain strings
  (`CEVC2`, `OPDC - HRD - HRBP`, `Infra`).
- **Long codes truncate** if wider than `max-w-[260px]` — add
  `truncate` + `min-w-0` to the label span if not already present.

Animations, a11y, and reduced-motion behaviour — identical.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render all active departments from the
  `departments` table, ordered **alphabetically ASC by code**
  (already implemented: `getKudoDepartments()` ORDER BY the
  locale-resolved label column, which equals `code` per Q2). Note:
  this differs from the Figma source ordering which is organic /
  as-entered — alphabetical is intentionally chosen for findability
  across 49 rows. First rows will be `BDV`, `CEVC1`,
  `CEVC1 - AIE`, `CEVC1 - DSV`, `CEVC1 - DSV - UI/UX 1`, …
- **FR-002**: System MUST persist the selected department as
  `?department=<code>` on the `/kudos` URL.
- **FR-003**: Users MUST be able to clear the filter by clicking the
  currently-selected item (toggle-off) — inherited from sibling.
- **FR-004**: Close on outside-click / ESC / chip re-click / select —
  inherited from sibling.
- **FR-005**: Matching-item Selected state inherited from sibling.
- **FR-006**: `FilterState.department` contract unchanged.
- **FR-007**: Empty list → chip disabled — inherited.
- **FR-008**: Error + Retry path — inherited.
- **FR-009**: Mutual exclusion with Hashtag dropdown — inherited.
- **FR-010**: Labels locale-resolved from `departments.name_vi` /
  `name_en`. Already implemented.
- **FR-011** *(new to this screen)*: Long department codes
  (e.g. `CEVC1 - DSV - UI/UX 1` — 26 chars) MUST render cleanly
  inside the panel's effective content area
  (215 px panel − 12 px panel padding − 32 px item padding
  = ~171 px text width). At Montserrat 16 px bold, that fits ~15
  characters on one line — codes ≥ 16 chars will wrap to a 2nd line
  (still within `h-14` = 56 px row since `leading-6` × 2 = 48 px).
  Implementation choice:
  - **Option A (wrap, default)**: Allow natural wrapping. No code
    change. Acceptable because `h-14` row height accommodates 2
    lines and long codes are rare (~8 of 49).
  - **Option B (truncate)**: Add `truncate min-w-0` to the item's
    label span so long codes show ellipsis on one line. Requires a
    wrapper `<span>` inside the `<li>` (currently the label is the
    direct `<li>` child).
  - **Option C (widen panel)**: Bump `w-[215px] max-w-[260px]` →
    `w-[280px] max-w-[340px]` for Department only. Divergent from
    Hashtag sibling — not preferred.

  Pick at QA time after visual check. Default = Option A.

### Technical Requirements

- **TR-001** → **TR-005**: all inherited from
  [JWpsISMAaM spec §TR](../JWpsISMAaM-dropdown-hashtag-filter/spec.md#technical-requirements).

### Key Entities

- **Department** (existing, `departments` table — no schema change
  needed):

  | Column | Type | Notes |
  |---|---|---|
  | `id` | `uuid` | PK |
  | `code` | `text` | unique, raw department code (`CEVC2`, `OPDC - HRD - HRBP`, …) |
  | `name_vi` | `text` | Vietnamese display name |
  | `name_en` | `text` | English display name |
  | `created_at` | `timestamptz` | — |

- **Profile.department_id** (existing) — foreign key into
  `departments.id`. `getKudoFeed` narrows senders by joining
  `kudo_recipients → profiles.department_id` when the filter is
  active.
- **FilterState** (existing) — the dropdown only mutates `department`.
  Value stored is the `code` (not id, not name), so URL is stable
  across locale switches.

### Data Requirements

| Field | Source | Consumed as | Notes |
|---|---|---|---|
| `departments.code` | DB | URL param `?department=<code>` + `<option value>` | Stable across locales |
| `departments.name_vi` | DB | Display label when `locale === "vi"` | No `#` prefix |
| `departments.name_en` | DB | Display label when `locale === "en"` | No `#` prefix |
| `Department.label` | Server Action | Single resolved label | `getKudoDepartments()` already picks the correct column; UI stays locale-agnostic |

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `GET /departments` → Server Action `getKudoDepartments()` | GET | Returns `Department[]` (`{ code, label }`). With proper-noun codes (VN = EN = code), `label` falls through to `code` for both locales. | **Exists** — no code change. |
| Migration `0011_seed_real_departments.sql` | — | Replace 6 generic `SVN-*` rows with 49 Sun\* canonical codes. See **Migration Plan** below. | **New** |

### Migration Plan (2026-04-21, user-confirmed Option B)

**Canonical Sun\* department set — 49 codes** (Q1 → Option B, Q2 →
`name_vi == name_en == code` because department names are proper
nouns / internal org codes, not translatable text).

Code order follows the Figma source (organic, not alphabetical).
Alphabetical display ordering happens at the action layer via
`ORDER BY name_vi ASC`.

| # | code | # | code | # | code |
|---|---|---|---|---|---|
| 1 | CTO | 18 | CEVC1 - AIE | 35 | GEU - DUT |
| 2 | SPD | 19 | OPDC - HRF - C&B | 36 | OPDC - HRD - L&D |
| 3 | FCOV | 20 | FCOV - GA | 37 | OPDC - HRD - TI |
| 4 | CEVC1 | 21 | FCOV - ISO | 38 | OPDC - HRF - TA |
| 5 | CEVC2 | 22 | STVC - EE | 39 | GEU - UET |
| 6 | STVC - R&D | 23 | GEU - HUST | 40 | STVC - R&D - SDX |
| 7 | CEVC2 - CySS | 24 | CEVEC - SAPD | 41 | OPDC - HRD - HRBP |
| 8 | FCOV - LRM | 25 | OPDC - HRF - OD | 42 | PAO - PEC |
| 9 | CEVC2 - System | 26 | CEVEC - GSD | 43 | IAV |
| 10 | OPDC - HRF | 27 | GEU - TM | 44 | STVC - Infra |
| 11 | CEVC1 - DSV - UI/UX 1 | 28 | STVC - R&D - DTR | 45 | CPV - CGP |
| 12 | CEVC1 - DSV | 29 | STVC - R&D - DPS | 46 | GEU - UIT |
| 13 | CEVEC | 30 | CEVC3 | 47 | OPDC - HRD |
| 14 | OPDC - HRD - C&C | 31 | STVC - R&D - AIR | 48 | BDV |
| 15 | STVC | 32 | CEVC4 | 49 | CPV |
| 16 | FCOV - F&A | 33 | PAO |  |  |
| 17 | CEVC1 - DSV - UI/UX 2 | 34 | GEU |  |  |

> Note: the Figma source also lists `OPD` (no C) and `PAO - PAO` — the
> first is a likely typo for `OPDC`, the second an apparent
> duplicate-of-parent. Excluded from the canonical 49.

---

**Migration `0011_seed_real_departments.sql`**:

1. Insert the 49 canonical codes (idempotent on `code`). Every row has
   `name_vi == name_en == code` per Q2 decision:
   ```sql
   insert into departments (code, name_vi, name_en) values
     ('CTO',                    'CTO',                    'CTO'),
     ('SPD',                    'SPD',                    'SPD'),
     ('FCOV',                   'FCOV',                   'FCOV'),
     ('CEVC1',                  'CEVC1',                  'CEVC1'),
     ('CEVC2',                  'CEVC2',                  'CEVC2'),
     ('STVC - R&D',             'STVC - R&D',             'STVC - R&D'),
     ('CEVC2 - CySS',           'CEVC2 - CySS',           'CEVC2 - CySS'),
     ('FCOV - LRM',             'FCOV - LRM',             'FCOV - LRM'),
     ('CEVC2 - System',         'CEVC2 - System',         'CEVC2 - System'),
     ('OPDC - HRF',             'OPDC - HRF',             'OPDC - HRF'),
     ('CEVC1 - DSV - UI/UX 1',  'CEVC1 - DSV - UI/UX 1',  'CEVC1 - DSV - UI/UX 1'),
     ('CEVC1 - DSV',            'CEVC1 - DSV',            'CEVC1 - DSV'),
     ('CEVEC',                  'CEVEC',                  'CEVEC'),
     ('OPDC - HRD - C&C',       'OPDC - HRD - C&C',       'OPDC - HRD - C&C'),
     ('STVC',                   'STVC',                   'STVC'),
     ('FCOV - F&A',             'FCOV - F&A',             'FCOV - F&A'),
     ('CEVC1 - DSV - UI/UX 2',  'CEVC1 - DSV - UI/UX 2',  'CEVC1 - DSV - UI/UX 2'),
     ('CEVC1 - AIE',            'CEVC1 - AIE',            'CEVC1 - AIE'),
     ('OPDC - HRF - C&B',       'OPDC - HRF - C&B',       'OPDC - HRF - C&B'),
     ('FCOV - GA',              'FCOV - GA',              'FCOV - GA'),
     ('FCOV - ISO',             'FCOV - ISO',             'FCOV - ISO'),
     ('STVC - EE',              'STVC - EE',              'STVC - EE'),
     ('GEU - HUST',             'GEU - HUST',             'GEU - HUST'),
     ('CEVEC - SAPD',           'CEVEC - SAPD',           'CEVEC - SAPD'),
     ('OPDC - HRF - OD',        'OPDC - HRF - OD',        'OPDC - HRF - OD'),
     ('CEVEC - GSD',            'CEVEC - GSD',            'CEVEC - GSD'),
     ('GEU - TM',               'GEU - TM',               'GEU - TM'),
     ('STVC - R&D - DTR',       'STVC - R&D - DTR',       'STVC - R&D - DTR'),
     ('STVC - R&D - DPS',       'STVC - R&D - DPS',       'STVC - R&D - DPS'),
     ('CEVC3',                  'CEVC3',                  'CEVC3'),
     ('STVC - R&D - AIR',       'STVC - R&D - AIR',       'STVC - R&D - AIR'),
     ('CEVC4',                  'CEVC4',                  'CEVC4'),
     ('PAO',                    'PAO',                    'PAO'),
     ('GEU',                    'GEU',                    'GEU'),
     ('GEU - DUT',              'GEU - DUT',              'GEU - DUT'),
     ('OPDC - HRD - L&D',       'OPDC - HRD - L&D',       'OPDC - HRD - L&D'),
     ('OPDC - HRD - TI',        'OPDC - HRD - TI',        'OPDC - HRD - TI'),
     ('OPDC - HRF - TA',        'OPDC - HRF - TA',        'OPDC - HRF - TA'),
     ('GEU - UET',              'GEU - UET',              'GEU - UET'),
     ('STVC - R&D - SDX',       'STVC - R&D - SDX',       'STVC - R&D - SDX'),
     ('OPDC - HRD - HRBP',      'OPDC - HRD - HRBP',      'OPDC - HRD - HRBP'),
     ('PAO - PEC',              'PAO - PEC',              'PAO - PEC'),
     ('IAV',                    'IAV',                    'IAV'),
     ('STVC - Infra',           'STVC - Infra',           'STVC - Infra'),
     ('CPV - CGP',              'CPV - CGP',              'CPV - CGP'),
     ('GEU - UIT',              'GEU - UIT',              'GEU - UIT'),
     ('OPDC - HRD',             'OPDC - HRD',             'OPDC - HRD'),
     ('BDV',                    'BDV',                    'BDV'),
     ('CPV',                    'CPV',                    'CPV')
   on conflict (code) do nothing;
   ```
2. Break the FK from `profiles.department_id` to any old `SVN-*`
   row so the DELETE below doesn't fail (`ON DELETE NO ACTION` is the
   default on that FK):
   ```sql
   update profiles
   set department_id = null
   where department_id in (
     select id from departments where code like 'SVN-%'
   );
   ```
3. Delete the 6 generic SVN-\* rows:
   ```sql
   delete from departments where code like 'SVN-%';
   ```

Fixture profiles are re-attached to real codes at **seed time**
(step 4 below) — not inside the SQL migration, because the new→old
mapping depends on the fixture user list which lives in TypeScript.

---

**Seed update — `supabase/seed.sql`**:

Replace the 6-row `SVN-*` INSERT block with the 49 canonical rows
(VN = EN = code per Q2). Keep `ON CONFLICT (code) DO NOTHING` so
`supabase db reset` stays idempotent.

---

**Fixture script update — `scripts/seed-kudos-fixtures.ts`**:

Current `FIXTURE_USERS` array maps 8 fixture Sunners to
`SVN-ENG / SVN-DES / SVN-PM / SVN-QA / SVN-BIZ / SVN-HR`. Replace
with a sensible mapping to the real 49-code set:

| Fixture | Old deptCode | New deptCode |
|---|---|---|
| Alice Nguyen  | SVN-ENG | `CEVC1` |
| Bob Tran      | SVN-DES | `CEVC1 - DSV` |
| Charlie Le    | SVN-PM  | `SPD` |
| Diana Pham    | SVN-QA  | `STVC - EE` |
| Ethan Vo      | SVN-BIZ | `BDV` |
| Fiona Bui     | SVN-HR  | `OPDC - HRD` |
| George Hoang  | SVN-ENG | `CEVC2` |
| Hanna Do      | SVN-DES | `CEVC1 - DSV - UI/UX 1` |

Re-running `yarn seed` after migration push will update
`profiles.department_id` to point to the new rows.

---

**Action verification — `src/app/kudos/actions.ts`**:

`getKudoDepartments()` body unchanged. With `name_vi == name_en == code`,
the locale-resolved `label` returned equals the code — exactly what
the FilterDropdown renders. No code edit needed.

---

### Execution order

The 3 changes must land together in a **single commit/PR** and roll out
in this sequence to avoid a broken intermediate state:

1. **Code commit** — update all 3 files locally (migration file,
   `seed.sql`, `scripts/seed-kudos-fixtures.ts`). Do NOT push the
   migration yet.
2. **`supabase db push`** — applies migration 0011 to the hosted DB.
   Hosted state is now: 49 new codes exist; fixture profiles have
   `department_id = NULL` (step 2 of migration nulled them out);
   old `SVN-*` rows deleted.
3. **`yarn seed`** — re-runs `scripts/seed-kudos-fixtures.ts`, which
   calls `backfillProfile()` for each fixture Sunner. With the
   updated `FIXTURE_USERS.deptCode` pointing to real codes, this
   restores `profiles.department_id` to the new dept ids.

**Critical**: if you run `yarn seed` with the OLD `FIXTURE_USERS`
(still referencing `SVN-*`) against the migrated DB, `depts.find()`
in `backfillProfile` returns `undefined` → profile.department_id
becomes NULL → fixture Sunners lose department attachment until
fixture script is updated + seed re-run. Keep the 3 file edits in
one commit to avoid this race.

### RLS note

`departments` table already has `departments_select_authenticated`
RLS policy (migration `0002_kudos_rls.sql`) — any authenticated
Sunner can read all rows. Migration 0011 **does not** touch RLS
since schema doesn't change, only data. No new policy needed.

---

## Clarification Needed

_All open questions resolved as of 2026-04-21. Decisions:_

1. **Department seed scope** → **Option B**. Migrate to the 49
   canonical Sun\* department codes now; delete the 6 generic
   `SVN-*` rows; re-bucket the 8 fixture Sunners via the updated
   `scripts/seed-kudos-fixtures.ts` mapping. See
   §Migration Plan above.
2. **Label localisation** → **no translation** (`name_vi == name_en ==
   code`). Department codes are proper nouns / internal org
   identifiers (`CEVC2`, `STVC - R&D`, `OPDC - HRD - HRBP`), not
   translatable text.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Selecting a department updates feed + carousel +
  spotlight within 500 ms.
- **SC-002**: Dropdown passes WCAG 2.1 AA keyboard + screen-reader
  audits (inherited from sibling — verified via the shared
  `FilterDropdown.spec.tsx`).
- **SC-003**: Long department codes truncate cleanly without
  horizontal overflow.

---

## Out of Scope

- Adding a free-text search input inside the dropdown (49 items is
  borderline — may be added in a follow-up if scroll UX proves
  cumbersome).
- Multi-select — MVP is single-select.
- Hierarchical grouping of departments (e.g. collapse
  `CEVC1 - DSV - UI/UX 1` / `UI/UX 2` under a `CEVC1 - DSV` parent) —
  Figma shows flat list; grouping deferred.
- Mobile bottom-sheet variant — tracked separately.
- Migration from 6 generic → 49 real department codes (see Q1/Q2).

---

## Dependencies

- [x] `getKudoDepartments()` Server Action ready
  (`src/app/kudos/actions.ts`) with locale-resolved label.
- [x] `FilterDropdown` dark-navy visual (redesigned for JWpsISMAaM
  sibling) — `kind="department"` inherits automatically.
- [x] `FilterBar` renders `FilterDropdown` with `kind="department"`
  + wires `updateParam("department", slug)`.
- [x] `departments` table schema has `code` + `name_vi` + `name_en`.
- [x] Option B + no-translation decision locked (2026-04-21).
- [x] Tests inherited from sibling (`FilterDropdown.spec.tsx` 18
      scenarios cover both `kind="hashtag"` and `kind="department"`
      via the shared component — kind-specific test included
      (`T022` mutual exclusion renders both kinds in parallel)).
- [x] Migration `0011_seed_real_departments.sql` authored, pushed
      via `supabase db push` (2026-04-21).
- [x] Migration `0012_purge_legacy_departments.sql` authored + pushed
      to clean up 5 pre-SVN legacy rows (BIZ/DES/HR/PM/QA).
- [x] `supabase/seed.sql` updated with 49-code INSERT block.
- [x] `scripts/seed-kudos-fixtures.ts` FIXTURE_USERS remapped to real
      codes + `yarn seed` re-run. 8 fixture profiles verified attached
      via SQL sanity query.
- [x] FR-011 — resolved **Option B (truncate)** applied proactively:
      `FilterDropdown.tsx` item wraps label in `<span className="min-w-0
      flex-1 truncate">` + `title` attribute for full-text tooltip.
      Eliminates risk of long codes (`CEVC1 - DSV - UI/UX 1` etc.)
      overflowing the fixed `h-14 p-4` item box. 18/18 unit tests
      stay green.

---

## Notes

- **Zero new UI code**: because the Hashtag sibling redesign already
  touched `FilterDropdown.tsx` (shared component) and `FilterBar.tsx`
  passes `kind="department"` unchanged, the dark-navy visual applies
  to the Department chip automatically. Only FR-011 label truncation
  may need a one-class edit on the item `<li>` if long codes overflow.
- **Implementation scope** is DB-only this round: migration 0011 +
  seed.sql + fixture script remap. No TypeScript changes expected.
- **Roll-forward safety**: if the migration push succeeds but the
  fixture re-seed fails, the Department filter still works — just
  shows 49 codes with no attached fixture Sunners. Feed stays
  unchanged (uses `?department=<code>` filter which simply narrows to
  zero results).
