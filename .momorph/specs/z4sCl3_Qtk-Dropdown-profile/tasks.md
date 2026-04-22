# Tasks: Dropdown-profile

**Frame**: `z4sCl3_Qtk-Dropdown-profile`
**Prerequisites**: [spec.md](spec.md) · [design-style.md](design-style.md) · [plan.md](plan.md)
**Scope**: 1 visual refactor PR · 2 modified files · 1 new test file · 0 new deps · 0 DB changes

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.tsx
```

- **[P]**: Parallelisable (different file, no blocking dep on any incomplete task)
- **[Story]**: `[US1]`, `[US2]`, `[US3]` — present only inside user-story phases
- All three user-story phases modify the same file (`ProfileMenu.tsx`) → tasks within those phases are **sequential** by nature even if marked independent
- File paths use workspace-root-relative form

---

## Phase 1 — Setup

**Goal**: verify the environment is ready for the visual refactor. No code changes.

- [x] T001 Verify `--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream` exist in [src/app/globals.css](../../../src/app/globals.css) with the values specified in design-style §2.1 (expected: `#00070c`, `#998c5f`, `#ffea9e`). Confirmed 2026-04-22 — task is a pre-flight check, not a code change. | `src/app/globals.css`
- [x] T002 [P] Run `grep -R "ProfileMenu" src` to confirm the 6 consumer call-sites listed in [plan.md §Technical Context](plan.md) still pass the same prop shape (`user`, `isAdmin`, `labels`). Any drift → fix before Phase 2. | `src/` (read-only sweep)
- [x] T003 [P] Run baseline `yarn test:run` to record the starting pass/fail counts, so Phase 6 can compare against it. | (no file change)

---

## Phase 2 — Foundational

**Goal**: add the `user` icon atom so Phase 3 can consume it.
**Blocks**: US1 (Profile row gets a `user` icon — cannot ship Phase 3 without this).

- [x] T004 Add `"user"` glyph to the Icon sprite union and add a `case "user":` branch returning an inline 24×24 SVG (outlined head + rounded shoulders) matching the sprite's `fill="none"` + `<path fill="currentColor">` convention. | `src/components/ui/Icon.tsx`
- [x] T005 Smoke-render `<Icon name="user" size={24} />` in `src/app/kudos/page.tsx` temporarily (or any playground page) to confirm the glyph renders; revert the temporary mount before committing. | `src/components/ui/Icon.tsx` (visual only)

---

## Phase 3 — User Story US1: Open menu + navigate to Profile (P1)

**Story goal**: From any authenticated page, click the avatar → see the dark-navy dropdown with a correctly-styled Profile row (cream α=0.10 hover + glow + user icon); clicking navigates to `/profile`.
**Independent test**: Mount `<ProfileMenu />` with `isAdmin={false}` → assert panel applies the new Tailwind classes and Profile row renders the user icon + `<Link href="/profile">`.

- [x] T006 [US1] Rewrite the panel wrapper `<div role="menu">` className in [src/components/layout/ProfileMenu.tsx](../../../src/components/layout/ProfileMenu.tsx): swap `bg-[var(--color-brand-800)]` → `bg-[var(--color-panel-surface)]`; swap `shadow-lg ring-1 ring-white/10` → `border border-[var(--color-border-secondary)]`; swap `min-w-[220px]` → `w-max min-w-[133px]`; add `p-1.5`; drop `overflow-hidden`. Keep `absolute right-0 top-12 z-50 flex flex-col rounded-lg` intact. | `src/components/layout/ProfileMenu.tsx`
- [x] T007 [US1] Extract the shared item className into a local `const itemClass = "..."` constant at the top of the component so the 3 rows (Profile, Admin, Logout) stay in sync. Value: `"inline-flex h-14 items-center justify-start gap-1 rounded px-4 py-4 text-base leading-6 font-bold tracking-[0.15px] text-white motion-safe:transition-colors duration-150 hover:bg-[var(--color-accent-cream)]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 focus-visible:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] cursor-pointer"`. | `src/components/layout/ProfileMenu.tsx`
- [x] T008 [US1] Update the Profile `<Link>` element: replace existing className with `itemClass`; append `<Icon name="user" size={24} className="ml-auto shrink-0" />` after the `{labels.profile}` text. Preserve `href="/profile"` and `onClick={close}`. | `src/components/layout/ProfileMenu.tsx`

---

## Phase 4 — User Story US2: Logout (P1)

**Story goal**: Clicking Logout submits the existing `signOut` Server Action and redirects to `/login`. Visual style matches the dark-navy family.
**Independent test**: Mount `<ProfileMenu />` → assert the Logout `<button>` sits inside a `<form action={signOut}>` and has the shared `itemClass` + `chevron-right` icon.

- [x] T009 [US2] Update the Logout `<button type="submit">` inside `<form action={signOut}>`: replace existing className with `itemClass + " w-full text-left"`; append `<Icon name="chevron-right" size={24} className="ml-auto shrink-0" />` after the `{labels.signOut}` text. Preserve the `<form action={signOut} className="contents">` wrapper and its native-submission double-click prevention. | `src/components/layout/ProfileMenu.tsx`
- [x] T010 [US2] Update the conditional Admin `<Link href="/admin">` element (renders when `isAdmin={true}`): replace existing className with `itemClass`; append `<Icon name="chevron-right" size={24} className="ml-auto shrink-0" />` after the `{labels.adminDashboard}` text. Preserve `href="/admin"` and `onClick={close}`. Note: final icon choice for the admin row is deferred to sibling spec `54rekaCHG1-Dropdown-profile-Admin`; using `chevron-right` here is a placeholder matching the family. | `src/components/layout/ProfileMenu.tsx`

---

## Phase 5 — User Story US3: A11y parity (P2)

**Story goal**: Keyboard users can open (Enter/Space on trigger), navigate (Tab between items), activate (Enter/Space on item), and dismiss (Esc / outside-click) the menu. P1 a11y bar only; P3 Arrow-key roving + Tab-out auto-close explicitly deferred.
**Independent test**: Automated keyboard traversal through the trigger + 2 items + dismissal; axe-core returns 0 violations.

- [x] T011 [US3] Verify the existing `useEffect` listeners in `ProfileMenu.tsx` already cover the P1 a11y contract (mousedown outside closes, Escape closes). Add no new keyboard handlers — P3 arrow-key nav and Tab-out close are not required for MVP (spec FR-006/FR-007). Document the decision with a short inline comment referencing spec FR-006. | `src/components/layout/ProfileMenu.tsx`
- [x] T012 [US3] Confirm the focus-visible ring on both items derives from `itemClass` (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2`). No extra wiring needed — verification only. | `src/components/layout/ProfileMenu.tsx`

---

## Phase 6 — Polish & Cross-cutting

**Goal**: Lock in regressions, verify visual parity, ship a11y clean.

- [x] T013 [P] Create `src/components/layout/__tests__/ProfileMenu.spec.tsx` with 8 scenarios:<br/>(1) renders closed by default — no `role="menu"` in DOM;<br/>(2) opens on trigger click — `role="menu"` appears with 2 `menuitem` elements;<br/>(3) `isAdmin={true}` → renders 3 items with the `adminDashboard` label in the middle;<br/>(4) outside click closes the menu;<br/>(5) `Escape` keypress closes the menu;<br/>(6) Profile row is an `<a href="/profile">`;<br/>(7) Logout row is a `<button type="submit">` inside a `<form>` whose `action` is a function (Server Action);<br/>(8) panel className contains `bg-[var(--color-panel-surface)]` AND `border-[var(--color-border-secondary)]` — visual-regression anchor. | `src/components/layout/__tests__/ProfileMenu.spec.tsx`
- [ ] T014 Manual visual parity check at viewports 375 / 800 / 1440 px — compare rendered panel against Figma frame `z4sCl3_Qtk` (screenshot in spec assets). Every row of the divergence table in [spec.md §"Existing implementation — divergence vs Figma"](spec.md) must read as "closed". | (manual)
- [ ] T015 axe-core sweep: open the account dropdown on `/kudos` → run axe DevTools → 0 violations expected. Also verify `prefers-reduced-motion: reduce` emulation (Chrome DevTools → Rendering tab) skips the hover transitions. | (manual)
- [x] T016 Run `yarn test:run` full suite → confirm no regression vs the Phase 1 baseline from T003. Any existing spec that fails due to this refactor must be investigated (expected: 0 regressions given `page.integration.spec.tsx` mocks `ProfileMenu` to `null`). | (no file change)

---

## Dependency Graph

```
T001 ─┐
T002 ─┤ (all Setup can run in parallel)
T003 ─┘

       ▼
T004 ──► T005                               [Phase 2 — user glyph]

       ▼
T006 ──► T007 ──► T008                      [Phase 3 — US1]

       ▼
T009 ──► T010                               [Phase 4 — US2]  (after T007, because reuses itemClass)

       ▼
T011 ──► T012                               [Phase 5 — US3]

       ▼
T013 (P, can start after T010) ──► T016
T014 (parallel with T013/T015)
T015 (parallel with T013/T014)
```

**Critical path**: T004 → T006 → T007 → T008 → T009 → T013 → T016. Everything else can run in parallel on top of the critical path.

---

## Independent Test Criteria (per story)

| Story | How to verify in isolation                                                                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1   | Mount `<ProfileMenu user={fixture} isAdmin={false} labels={fixture} />` → click trigger → assert panel renders with `bg-[var(--color-panel-surface)]` + Profile `<Link>` + `user` icon + `chevron-right` on Logout.   |
| US2   | Same mount → assert Logout button sits inside `<form action={signOut}>`; rely on existing `signOut.ts` tests for the Server Action itself (out of this spec's scope).                                                  |
| US3   | Same mount → focus trigger → `Enter` opens → Profile row has visible focus ring (`outline 2 px var(--color-accent-cream)`) → `Escape` closes → focus back on trigger.                                                 |

---

## Parallel Execution Opportunities

- **Phase 1** (all 3 Setup tasks parallel): T001, T002, T003.
- **Phase 6** (Polish): T013 (test file — new), T014 (manual visual), T015 (manual a11y) can all run at once; T016 runs last.
- **Cross-phase**: T013 (test file creation) can start as soon as T010 completes, running in parallel with T011/T012.

---

## Summary

- **Total tasks**: 16 (T001 – T016)
- **Setup**: 3 tasks (T001–T003, all `[P]`)
- **Foundational**: 2 tasks (T004–T005)
- **US1 MVP (P1)**: 3 tasks (T006–T008)
- **US2 (P1)**: 2 tasks (T009–T010)
- **US3 (P2)**: 2 tasks (T011–T012)
- **Polish**: 4 tasks (T013–T016)
- **New files**: 1 (`ProfileMenu.spec.tsx`)
- **Modified files**: 2 (`ProfileMenu.tsx`, `Icon.tsx`)
- **New dependencies**: 0
- **New migrations / new Server Actions**: 0
- **Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (T001–T010) — after these 10 tasks, the dark-navy account menu ships fully-styled with Profile navigation and Logout working. Phase 5 (US3 verification-only) and Phase 6 (tests + parity sweep) are the sign-off gate, not a behaviour gate.
- **Parallelisable groups**: 3 (Setup, Polish, and cross-phase T013 alongside T011/T012)
- **Constitution compliance**: all 9 applicable rules mapped in [plan.md §Constitution Compliance](plan.md).

### Format validation

All 16 tasks follow the strict checklist format: `- [ ] T### [P?] [Story?] Description | file/path.tsx` — ✅ verified.
