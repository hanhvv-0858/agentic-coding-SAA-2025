# Tasks: Dropdown-profile Admin

**Frame**: `54rekaCHG1-Dropdown-profile-Admin`
**Prerequisites**: [spec.md](spec.md) · [design-style.md](design-style.md) · [plan.md](plan.md)
**Parent**: [`z4sCl3_Qtk-Dropdown-profile`](../z4sCl3_Qtk-Dropdown-profile/) — admin variant is a **1-line icon swap** on top of the parent's implementation.
**Scope**: 1 small follow-up PR · 1–2 modified files · 0 new files · 0 new deps · 0 DB changes

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.tsx
```

- **[P]**: Parallelisable (different file, no blocking dep)
- **[Story]**: `[US1]` — the only user story this plan delivers code for; US2 + US3 inherit from parent + existing codebase
- Since this plan modifies ≤ 2 files and T003 depends on T002, most tasks are sequential

---

## Phase 1 — Setup

**Goal**: decide on the Dashboard icon before touching code.

- [x] T001 [P] Decide the Dashboard icon glyph. Default recommendation: add a new `"dashboard"` glyph to the sprite (2×2 grid of rounded rectangles). Alternatives: reuse `"building"` or keep `"chevron-right"` placeholder. Record the decision at the top of [plan.md](plan.md) before proceeding to Phase 2. | (no file change — decision only)

---

## Phase 2 — Foundational

**Goal**: add the chosen glyph to the sprite so Phase 3 can consume it.
**Blocks**: T003 (cannot swap the icon in the menu until the sprite exposes it). Skip entirely if T001 picks Option 2 (`building`) or Option 3 (keep `chevron-right`).

- [x] T002 If T001 chose the new `"dashboard"` glyph: add `"dashboard"` to the `IconName` union and a `case "dashboard":` branch returning an inline 24×24 SVG — 2×2 grid of rounded rectangles, following the sprite's mixed `fill="none"` + `<path fill="currentColor">` convention used by `bell`, `pencil`, etc. | `src/components/ui/Icon.tsx`

---

## Phase 3 — User Story US1: Admin navigates to Dashboard (P1)

**Story goal**: Admin user clicking "Dashboard" in the account menu lands on `/admin`; the row renders with the final Dashboard icon (not the `chevron-right` placeholder).
**Independent test**: Render `<ProfileMenu isAdmin={true} />` → the Admin menuitem contains an icon with `name` equal to the glyph chosen in T001.

- [x] T003 [US1] Swap the Dashboard row icon in `src/components/layout/ProfileMenu.tsx`: replace `<Icon name="chevron-right" size={24} className="ml-auto shrink-0" />` (inside the `{isAdmin && <Link href="/admin" ...>...}` block, line ~94) with the chosen glyph (e.g. `<Icon name="dashboard" ... />`). Keep `href`, `role`, `onClick`, and `className` unchanged. | `src/components/layout/ProfileMenu.tsx`

---

## Phase 4 — User Story US2: Profile & Logout parity (P1)

**Status**: **No tasks required**. The parent spec's implementation already covers these rows identically across both variants; zero admin-specific work.

---

## Phase 5 — User Story US3: Admin-role enforcement (P1)

**Status**: **No tasks required**. The `isAdmin` prop derivation (`user.app_metadata.role === "admin"`) and the `/admin` route guard (`src/app/admin/page.tsx:10-11` → `redirect("/error/403")`) already exist and are authoritative. This spec validates — does not re-implement — these gates.

---

## Phase 6 — Polish

- [x] T004 [P] Run `yarn test:run src/components/layout/__tests__/ProfileMenu.spec.tsx` — confirm the existing 8 scenarios pass after the icon swap. Scenario 3 (`isAdmin={true}` → 3 menuitem rows) is the admin-variant anchor; no new test scenarios needed because the icon-swap does not change DOM role/structure. | (no file change)
- [ ] T005 Manual visual smoke at `/kudos` logged in as an admin account (`user.app_metadata.role === "admin"`): verify the Dashboard row appears between Profile and Logout, renders with the chosen glyph, has the dark-navy listbox styling (cream α=0.10 hover + text-shadow glow on hover), and clicking it navigates to `/admin`. Also verify non-admin account still sees 2 rows (no regression). | (manual)

---

## Dependency Graph

```
T001 (decision, Phase 1)
   ▼
T002 (Phase 2, conditional on T001 choice)
   ▼
T003 (Phase 3 — US1)
   ▼
T004 (Phase 6 — regression)
T005 (Phase 6 — manual, can run in parallel with T004)
```

**Critical path**: T001 → T002 → T003 → T004. T005 is parallel with T004.

---

## Independent Test Criteria (per story)

| Story  | How to verify in isolation |
| ------ | --------------------------- |
| US1    | Render `<ProfileMenu isAdmin={true} user={fixture} labels={fixture} />` → open the menu → assert 3 `menuitem` elements, the middle one's `href="/admin"` and its rendered `<svg>` matches the chosen glyph. |
| US2    | Inherited from parent spec — no isolated verification needed. |
| US3    | Inherited from existing `/admin` route guard — no isolated verification needed. |

---

## Parallel Execution Opportunities

- T004 and T005 in Phase 6 can run concurrently (different human/tool — automated test vs manual eye).
- T001 (decision) has no blocking siblings and can be flagged as `[P]`, but downstream tasks wait for the decision output anyway.

---

## Summary

- **Total tasks**: 5 (T001 – T005)
- **Setup**: 1 task (T001)
- **Foundational**: 1 task (T002) — conditional on T001
- **US1 (P1)**: 1 task (T003)
- **US2 (P1)**: 0 tasks (inherited)
- **US3 (P1)**: 0 tasks (existing guard authoritative)
- **Polish**: 2 tasks (T004, T005)
- **New files**: 0
- **Modified files**: 1–2 (`Icon.tsx` conditional + `ProfileMenu.tsx`)
- **New dependencies**: 0
- **Suggested MVP scope**: T001 → T002 → T003 delivers the feature; T004 + T005 are the sign-off gate.
- **Parallelisable groups**: 1 — T004 / T005 in Polish.

### Format validation

All 5 tasks follow the strict checklist format — ✅ verified.
