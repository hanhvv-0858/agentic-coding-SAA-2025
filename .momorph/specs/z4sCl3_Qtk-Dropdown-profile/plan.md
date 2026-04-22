# Implementation Plan: Dropdown-profile

**Frame**: `z4sCl3_Qtk-Dropdown-profile`
**Spec**: [spec.md](spec.md) · [design-style.md](design-style.md)
**Created**: 2026-04-22
**Status**: Ready for `/momorph.tasks`

---

## Summary

Close the **visual divergence** between the existing [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) and the Figma source-of-truth for `z4sCl3_Qtk`. Behaviour (Server-Action logout, outside-click + Esc dismissal, admin-conditional row) already ships and matches the spec; only the **dark-navy listbox family visual tokens + icons** need alignment.

**Total shape**: 1 visual refactor on an existing client component + 1 new sprite icon (`user`) + 1 new unit test file. No new dependencies, no DB changes, no new Server Actions. Delivered as **one small PR**.

---

## Technical Context

| Field                    | Value                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Language / Framework     | TypeScript (strict) + Next.js 16 App Router + React 19                                                  |
| Primary Dependencies     | TailwindCSS v4, `@supabase/ssr` (existing). **No new deps.**                                            |
| Server Action            | `@/libs/auth/signOut.ts` — existing, unchanged                                                          |
| Routes touched           | Reads from `/profile` (existing), `/admin` (existing), `/login` (existing)                              |
| Database / Migrations    | None                                                                                                    |
| Existing target file     | [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx)               |
| Sibling spec (same component) | `54rekaCHG1-Dropdown-profile-Admin` — `isAdmin=true` branch of the same file                      |
| Consumer pages (5)       | `src/app/page.tsx`, `src/app/kudos/page.tsx`, `src/app/awards/page.tsx`, `src/app/the-le/page.tsx`, `src/components/shell/QuickActionsFab.tsx` (all pass the same `user` / `isAdmin` / `labels` shape — no prop API change needed) |
| Existing test touching it | [`src/components/kudos/__tests__/page.integration.spec.tsx:78`](../../../src/components/kudos/__tests__/page.integration.spec.tsx) — mocks `ProfileMenu` to `null` ⇒ refactor-safe |

---

## Constitution Compliance

| Requirement                                  | Constitution Rule                                  | Status                                                     |
| -------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| TypeScript strict                            | §I Clean Code                                      | ✅ Compliant (existing file is strict)                       |
| Client Component only when necessary         | §V Platform Best Practices                         | ✅ `"use client"` justified (keyboard / mouse listeners)     |
| Data fetching in Server Components / Actions | §V                                                 | ✅ No client-side fetches; logout uses Server Action         |
| RLS + auth middleware                        | §IV Security                                       | ✅ No session logic added; reuses `signOut.ts`               |
| Tailwind utility classes, no custom CSS      | §V                                                 | ✅ All styling via utilities + existing CSS vars             |
| Touch-target ≥ 44 × 44 px on mobile           | §II Responsive Design                              | ✅ Items `h-14` × ≥ 119 px wide                              |
| `motion-safe:` on transitions                 | §II                                                | ✅ Applied to hover/focus bg + text-shadow transitions       |
| WCAG 2.2 AA                                  | §II / §V                                           | 📋 Planned — axe sweep in Phase 4                           |
| Tests co-located, TDD where feasible         | §III                                               | 📋 Planned — new `ProfileMenu.spec.tsx` with 6-8 scenarios  |

No conflicts. No deviations needed.

---

## Architecture Decisions

### Frontend

- **Component pattern**: Modify the existing single file `ProfileMenu.tsx`. No new component extraction (the two menu items are not reused elsewhere yet). If they become reusable (e.g., `NotificationMenuItem` shares the style), extract `<DarkNavyMenuItem />` atom at that point — YAGNI for now.
- **State management**: Unchanged — single `open: boolean` via `useState`. No `useTransition` or `useFormStatus` for MVP (no loading spinner required per FR-008).
- **Data fetching**: None inside this component. Session comes from the parent header (RSC) and is passed via the `user` prop.
- **Styling**: All Tailwind utility classes + arbitrary values pointing to existing CSS variables (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`). No new tokens.
- **Icons**: Reuse `Icon` sprite at [`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx). `chevron-right` is already in the sprite. `user` must be added.
- **i18n labels**: Reuse existing `labels` prop (`open`, `profile`, `signOut`, `adminDashboard`). No new message keys.

### Backend

Not applicable. No API changes. No new Server Actions. No DB changes.

---

## Project Structure

### New Files

| File                                                                            | Purpose                                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/components/layout/__tests__/ProfileMenu.spec.tsx`                          | Unit tests — 6-8 scenarios covering open/close/navigate/logout/a11y |

### Modified Files

| File                                                      | Changes                                                                                                                                                                |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/layout/ProfileMenu.tsx`                   | Visual refactor: swap panel bg + border + padding + item height + add item icons + active-state glow + cream α=0.10 hover bg + rounded item radius + hug-content width |
| `src/components/ui/Icon.tsx`                              | Add `user` glyph (24 × 24, stroke-current, outlined person silhouette) to the sprite `IconName` type + switch `case "user"`                                            |

### Dependencies

| Package | Version | Purpose |
| ------- | ------- | ------- |
| —       | —       | **None** — reuse everything existing |

---

## Implementation Approach

Single PR with 4 thin phases run sequentially.

### Phase 0 — Asset prep + token existence check

- Verify `user` glyph is NOT in the sprite — confirmed 2026-04-22 (`grep "user"` returns no match in `Icon.tsx` sprite switch).
- Verify the 3 CSS variables referenced by this plan actually exist in the project — confirmed 2026-04-22:
  - `--color-panel-surface` → `#00070c` at [globals.css:45](../../../src/app/globals.css)
  - `--color-border-secondary` → `#998c5f` at [globals.css:46](../../../src/app/globals.css)
  - `--color-accent-cream` → `#ffea9e` at [globals.css:31](../../../src/app/globals.css)
- Pick a simple outlined user icon (circle head + rounded shoulders) — self-implement as inline SVG, matching the sprite's mixed `fill="none"` + `<path fill="currentColor">` convention used by `bell`, `pencil`, etc.
- No external file downloads.

### Phase 1 — Sprite addition (unblock Phase 2)

- Add `"user"` to the `IconName` union in `Icon.tsx`.
- Add `case "user":` returning inline SVG (16×16 viewBox → scaled via `size` prop).
- Quick inspection with `<Icon name="user" size={24} />` in any playground page.

### Phase 2 — Visual refactor of ProfileMenu (the main work)

Close all 9 rows of the divergence table (spec §"Existing implementation — divergence vs Figma"). **Do NOT extract a shared `<MenuItem />` atom** — the 3 rows have different DOM shapes: Profile is `<Link>`, Admin is `<Link>` (conditional), Logout is `<button type="submit">` inside `<form action={signOut}>`. Shared className string is enough (YAGNI).

Concretely, rewrite the class strings in-place:

```
Panel (the <div role="menu">):
  - bg-[var(--color-brand-800)]  →  bg-[var(--color-panel-surface)]
  - shadow-lg ring-1 ring-white/10  →  border border-[var(--color-border-secondary)]
  - min-w-[220px]  →  w-max min-w-[133px]
  - add  p-1.5
  - drop  overflow-hidden

Item className (shared across Link/button/admin):
  - swap  px-4 py-3  →  h-14 px-4 py-4  (use flex items-center justify-start gap-1)
  - add   rounded
  - add   text-base leading-6 font-bold tracking-[0.15px]
  - swap  hover:bg-white/10  →  hover:bg-[var(--color-accent-cream)]/10
  - add   motion-safe:transition-colors duration-150
  - add active-state glow via hover + focus-visible:
         hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]
         focus-visible:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]
  - Profile item <Link>: append <Icon name="user" size={24} className="ml-auto shrink-0" />
  - Logout <button>:     append <Icon name="chevron-right" size={24} className="ml-auto shrink-0" />
  - Admin <Link>:        append <Icon name="chevron-right" size={24} className="ml-auto shrink-0" />
          (admin variant reuses chevron — confirmed by design consistency in the Figma family;
          flagged in Open Questions for sibling spec 54rekaCHG1 to confirm the icon choice)

Structural integrity to preserve (do NOT touch):
  - The <form action={signOut}> wrapping the Logout button — Server Action binding stays.
  - The <Link href="/profile" onClick={close}> pattern — closes menu on click.
  - The `open` state machine + useEffect mousedown/keydown listeners.
  - The trigger <button> above the menu — out of scope.
```

### Phase 3 — Unit tests (TDD-friendly — write alongside Phase 2)

Create `src/components/layout/__tests__/ProfileMenu.spec.tsx` with:

1. **Render — closed by default**: trigger visible, no `role="menu"` element yet.
2. **Open on click**: click trigger → menu appears, renders two items with correct labels ("Profile" / "Logout").
3. **Admin prop**: `isAdmin={true}` → three items with `adminDashboard` label inserted between.
4. **Outside click closes**: mount → open → click body outside → menu unmounts.
5. **Esc closes**: open → press `Escape` → menu unmounts.
6. **Icons present**: Profile item contains an SVG with `data-icon="user"` (or testid); Logout contains `data-icon="chevron-right"` — adapt to current Icon sprite testid convention.
7. **Logout uses form action**: the Logout row is a `<button type="submit">` inside a `<form action={signOut}>`. Assert the form's `action` is a function (Server Action).
8. **Visual regression anchors**: assert panel wrapper className contains `bg-[var(--color-panel-surface)]` and `border-[var(--color-border-secondary)]` — catches accidental reverts.

### Phase 4 — Polish + a11y sweep

- Visual parity check at 3 breakpoints (375 / 800 / 1440) — static screenshot vs Figma.
- `prefers-reduced-motion: reduce` emulation — confirm transitions skip.
- axe-core manual run on the opened panel → 0 violations.
- Manually verify tab order: trigger → menu items in document order → (menu still open after last Tab — this is acceptable per FR-006; tab-out auto-close remains P3 nice-to-have).

**Gate**: All 9 divergence rows closed; 8 unit tests green; axe clean; visual parity signed off.

---

## Testing Strategy

| Type        | Focus                                                                               | Coverage                       |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| Unit        | `ProfileMenu.tsx` — 8 scenarios in `__tests__/ProfileMenu.spec.tsx`                  | 100 % of behavioural branches  |
| Integration | Header + ProfileMenu render path (existing header spec, if present) — no new work   | Existing coverage retained     |
| Visual      | Manual eyeball at 3 breakpoints + Figma frame compare                                | P1 gate for PR merge           |
| A11y        | axe-core manual run on opened panel + keyboard traversal                             | 0 violations required          |
| E2E         | Not added (scope too small; logout already has smoke coverage elsewhere)             | n/a                            |

**Test naming**: match existing conventions — `describe("<ProfileMenu />", ...)`, `it("renders ...", ...)`.

---

## Risk Assessment

| Risk                                                            | Impact | Likelihood | Mitigation                                                                                                                                                      |
| --------------------------------------------------------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual change breaks an existing header consumer                | Low    | Low        | `ProfileMenu` is imported by 5 page files + `QuickActionsFab` — all pass the same `user` / `isAdmin` / `labels` prop shape; no new prop is introduced.           |
| Integration test regresses because of DOM-shape change          | —      | —          | **Non-issue**: [`page.integration.spec.tsx:78`](../../../src/components/kudos/__tests__/page.integration.spec.tsx) mocks `ProfileMenu` to `null`. Safe to refactor. |
| New `user` icon diverges from app's icon aesthetic              | Low    | Low        | Match the sprite's mixed `fill="none"` + `<path fill="currentColor">` convention used by `bell`, `pencil`, etc.                                                   |
| Admin item uses `chevron-right` but the sibling spec has not confirmed | Low | Medium  | Admin variant spec `54rekaCHG1` owns that detail. Ship non-admin Profile + Logout this PR; follow-up admin icon in the sibling spec's PR.                        |
| `motion-safe:` text-shadow not reset on non-hover               | Low    | Low        | Apply text-shadow ONLY on `hover:` / `focus-visible:` variants — default state has no text-shadow rule, so reverting on mouseout is automatic.                    |
| CSS variable name `--color-panel-surface` not yet defined        | High   | —          | **Verified 2026-04-22** — all 3 tokens present in [globals.css:31,45,46](../../../src/app/globals.css). Risk retired.                                            |
| Logout form submission breaks because icon is inside `<button type="submit">` | Medium | Low | Confirmed native semantics: clicking the icon inside `<button type="submit">` still submits the form. No `onClick.stopPropagation()` needed.                   |

---

## Open Questions

- [ ] **Admin item icon**: confirm whether `chevron-right` (matching Profile/Logout family) is correct, or whether `54rekaCHG1` spec prefers a different glyph (e.g., `shield` / `arrow-up-right`). Blocks only the admin row styling — non-blocking for this spec's MVP since the admin branch is owned by a sibling spec.

(No other open questions — all Q1–Q5 from spec.md are resolved.)

---

## Implementation checklist (quick reference for `/momorph.tasks`)

- [ ] T001 Add `"user"` to `Icon.tsx` sprite union + switch case (inline SVG)
- [ ] T002 Refactor `ProfileMenu.tsx` panel classes (bg, border, padding, width)
- [ ] T003 Refactor `ProfileMenu.tsx` item classes (height, icons, text-shadow, hover bg, radius)
- [ ] T004 Ensure `motion-safe:` gating on all new transitions
- [ ] T005 Create `__tests__/ProfileMenu.spec.tsx` with 8 scenarios
- [ ] T006 axe-core manual sweep at `/kudos` with menu opened
- [ ] T007 Visual parity check at 375 / 800 / 1440 vs Figma frame
- [ ] T008 Run full `yarn test:run` to confirm no other tests regress
