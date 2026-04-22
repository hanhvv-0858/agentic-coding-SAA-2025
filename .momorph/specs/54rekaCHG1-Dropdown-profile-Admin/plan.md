# Implementation Plan: Dropdown-profile Admin

**Frame**: `54rekaCHG1-Dropdown-profile-Admin`
**Spec**: [spec.md](spec.md) · [design-style.md](design-style.md)
**Parent plan**: [`z4sCl3_Qtk-Dropdown-profile/plan.md`](../z4sCl3_Qtk-Dropdown-profile/plan.md)
**Created**: 2026-04-22
**Status**: **Mostly already shipped** via the parent's implementation. This plan tracks the one remaining delta: the Dashboard icon choice.

---

## Summary

The admin variant is **almost entirely delivered by the parent spec's implementation** — the z4sCl3_Qtk plan already refactored `ProfileMenu.tsx` so the conditional `{isAdmin && <Link href="/admin" className={itemClass}>}` row ships with the dark-navy family styling + a `chevron-right` icon placeholder. This plan covers **the single delta** that remains:

- Choose / add the proper Dashboard icon glyph (currently `chevron-right` placeholder).

**Total shape**: ≤ 2 tasks. No new files. No new dependencies. No DB changes. No new Server Actions. Ships as a small follow-up PR after the parent's PR is merged.

---

## Technical Context

| Field                    | Value                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Language / Framework     | TypeScript strict + Next.js 16 App Router + React 19                                                                            |
| Shared component         | [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) — admin row already conditionally rendered via `{isAdmin && <Link href="/admin" className={itemClass}>...</Link>}` |
| Admin role source        | `(user.app_metadata as { role?: string } \| null)?.role === "admin"` — already used in 4 consumer pages + the `/admin` route guard |
| `/admin` route guard     | [`src/app/admin/page.tsx:10-11`](../../../src/app/admin/page.tsx) — `if (role !== "admin") redirect("/error/403")` — already in place |
| Database / Migrations    | None                                                                                                                            |
| Dashboard icon (current) | `chevron-right` (placeholder — same as Logout row)                                                                              |
| Dashboard icon (target)  | **TBD — see Q1 in spec.md**. Candidates in existing sprite: `building`, `diamond`, `target`. Or add a new `"dashboard"` grid glyph. |

---

## Constitution Compliance

| Requirement                         | Constitution Rule             | Status                                                  |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------- |
| TypeScript strict                   | §I Clean Code                 | ✅ Existing file is strict                              |
| Server-side auth for authorization  | §IV Security                  | ✅ `isAdmin` derived server-side; `/admin` has RLS guard |
| Tailwind utility classes only       | §V                            | ✅ Reuses `itemClass` + panel classes from parent refactor |
| Touch-target ≥ 44 × 44 px           | §II Responsive Design         | ✅ Inherits `h-14 × ~153 px` from parent                 |
| WCAG 2.2 AA                         | §II                           | 📋 Parent's axe sweep covers admin render too            |
| Tests co-located                    | §III                          | 📋 Parent test file already has an `isAdmin={true}` scenario (T013 test 3) |

No conflicts. No new deviations.

---

## Architecture Decisions

### Frontend

- **No new component**. Admin variant is a **conditional render of one `<Link>`** inside the existing `ProfileMenu.tsx`. The prop-driven dual-spec pattern is already wired.
- **Styling**: Shared `itemClass` constant — Dashboard row automatically inherits the dark-navy family styling, hover/focus glow, and icon slot.
- **Icon choice**: The only decision still outstanding. Options (ranked by preference):
  1. **Add a new `"dashboard"` glyph** to the sprite (2×2 grid of small rounded squares — classic dashboard symbol). Matches the Figma `componentId: 662:10350`'s semantic intent.
  2. **Reuse `building`** from the existing sprite (office / admin building metaphor).
  3. **Keep `chevron-right`** placeholder (matches the family but gives no semantic cue).
- **i18n**: `labels.adminDashboard` key already exists in the prop contract — no message-catalogue changes needed unless the copy itself changes (out of scope).

### Backend

Not applicable.

---

## Project Structure

### New Files

| File                | Purpose |
| ------------------- | ------- |
| (none)              | —       |

### Modified Files

| File                                       | Changes                                                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/Icon.tsx`               | **If Option 1 chosen**: add `"dashboard"` glyph (24 × 24 grid-of-4) to the sprite union + switch case. Skip entirely if Option 2/3.     |
| `src/components/layout/ProfileMenu.tsx`    | Change **one line** — replace `<Icon name="chevron-right" ... />` inside the admin `<Link>` with the chosen glyph (e.g. `"dashboard"`). |

### Dependencies

| Package | Version | Purpose |
| ------- | ------- | ------- |
| —       | —       | **None** |

---

## Implementation Approach

### Phase 0 — Decide on the icon (blocks both other phases)

- Review design team's intent for `componentId: 662:10350` (if access to Figma source is easy, resolve directly; otherwise agree on a sensible default).
- **Default**: add a new `"dashboard"` grid glyph to the sprite — strongest semantic match and costs ≤ 10 lines of code.

### Phase 1 — Sprite addition (skippable if Option 2/3)

- Add `"dashboard"` to the `IconName` union in `Icon.tsx`.
- Add a `case "dashboard":` branch returning an inline 24×24 SVG — 2×2 grid of rounded rectangles with `fill="currentColor"` or stroke-current.

### Phase 2 — Swap the Dashboard row icon

- In `ProfileMenu.tsx`, replace `<Icon name="chevron-right" size={24} className="ml-auto shrink-0" />` inside the admin `<Link href="/admin">` block with the chosen glyph.
- Keep everything else unchanged (className, href, onClick, role).

### Phase 3 — Tests (validation only — existing suite covers the behaviour)

- Run `yarn test:run src/components/layout/__tests__/ProfileMenu.spec.tsx`. Scenario 3 (`isAdmin={true}` → 3 menuitem rows) already asserts the admin branch renders. No new test file needed.
- Optionally, extend Scenario 3 with an icon-name assertion once the final glyph is chosen, e.g. `expect(adminItem.querySelector('svg')).toHaveAttribute('data-icon', 'dashboard')` — only worth adding if the sprite's test ergonomics support it.

### Phase 4 — Visual smoke

- Reload `/kudos` as an admin account (`user.app_metadata.role === "admin"`). Verify the Dashboard row appears between Profile and Logout with the chosen icon + the dark-navy styling.
- Verify that `/admin` route still redirects to `/error/403` when role changes, by temporarily stripping `app_metadata.role` from the dev JWT.

**Gate**: Dashboard row renders with the agreed icon; admin E2E path (avatar → Dashboard → `/admin`) works end-to-end for an admin user.

---

## Testing Strategy

| Type        | Focus                                                     | Coverage                                      |
| ----------- | --------------------------------------------------------- | --------------------------------------------- |
| Unit        | `ProfileMenu` admin branch                                | Already in parent's `ProfileMenu.spec.tsx` (scenario 3) |
| Integration | Header + ProfileMenu admin render path                    | Inherits from parent pages (mock `null` already) |
| Visual      | Manual eyeball at 375 / 800 / 1440 px on an admin account | Manual in Phase 4                             |
| A11y        | axe-core on opened panel with 3 rows                      | Covered by parent's Phase 6 sweep              |
| E2E         | Not added — existing `/admin` guard test is authoritative | n/a                                           |

---

## Risk Assessment

| Risk                                                      | Impact | Likelihood | Mitigation                                                                                                   |
| --------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------ |
| Icon swap changes row layout (e.g., wider glyph)          | Low    | Low        | All icons in the sprite render at 24 × 24; swap is visually drop-in. Visual smoke covers any surprise.       |
| Panel width grows enough to overflow mobile viewport      | Low    | Low        | Panel is `w-max` — at 375 px the admin panel (~166 px) still fits with generous margin.                      |
| Admin claim propagation lag on role change                | Low    | Low        | Expected — documented in spec US3 Scenario 1. Server-side `/admin` guard catches any privilege mismatch.     |
| New `dashboard` icon diverges from the sprite's aesthetic | Low    | Low        | Mirror the existing mixed `fill="none"` + `<path fill="currentColor">` or `stroke-current` style of `bell` / `user`.|

No high-severity risks.

---

## Open Questions

- **Q1 (inherited from spec.md)**: Final Dashboard icon glyph. Default recommendation in this plan: add a new `"dashboard"` grid glyph. Confirm with design before Phase 1.

No other open questions. All architectural / security / integration questions were resolved during `/momorph.reviewspecify` (spec §Known clarifications applied).

---

## Implementation checklist (quick reference for `/momorph.tasks`)

- [ ] T001 Decide the Dashboard icon (design-sign-off or default to new `"dashboard"` glyph).
- [ ] T002 (if default) Add `"dashboard"` glyph to `src/components/ui/Icon.tsx` (sprite union + switch case with 2×2 grid SVG).
- [ ] T003 Swap the Dashboard row icon in `src/components/layout/ProfileMenu.tsx` from `chevron-right` to the chosen glyph.
- [ ] T004 Run `yarn test:run src/components/layout/__tests__/ProfileMenu.spec.tsx` — confirm existing 8 scenarios still pass.
- [ ] T005 Manual visual smoke on `/kudos` with an admin account — verify Dashboard row layout + icon + navigation to `/admin`.
