# Feature Specification: Floating Action Button – Collapsed (Trigger)

**Frame ID**: `_hphd32jN2`
**Frame Name**: `Floating Action Button - phim nổi chức năng`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/_hphd32jN2
**Companion frame**: `Sv7DFwBw1h` (expanded menu — see [../Sv7DFwBw1h-fab-quick-actions/spec.md](../Sv7DFwBw1h-fab-quick-actions/spec.md))
**Created**: 2026-04-20
**Status**: Draft

---

## Overview

Defines the **collapsed / entry state** of the authenticated-shell
Floating Action Button. It's a small cream-coloured pill pinned to the
bottom-right of the viewport on every authenticated screen where the
FAB is mounted (Homepage SAA today; Live board when that ships). A
click / tap / Enter / Space toggles the expanded menu (`Sv7DFwBw1h`).

The pill itself is **icon-only**: pen glyph + `"/"` separator + Sun*
Awards monogram. There is no text label — the icon combo is the brand
wordmark for "write a kudo / Sun Annual Awards", recognisable on its
own.

**Why this spec exists alongside `Sv7DFwBw1h`**: Figma tracks each
state as a separate frame, but at runtime they are two phases of a
single `<QuickActionsFab>` component. `Sv7DFwBw1h`'s spec explicitly
defers the trigger contract to this document. Both must be
implemented together so the toggle state transition is internally
consistent.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Open the quick-actions menu from anywhere (Priority: P1)

A logged-in user browsing Homepage / Live board wants to access either
"Viết KUDOS" or "Thể lệ" without hunting for nav links. The FAB pill
is visible regardless of scroll position; a single click opens the
expanded menu.

**Why this priority**: this is the entire reason the FAB exists. If
the trigger doesn't open the menu reliably, the whole widget is dead.

**Independent Test**: render `<QuickActionsFab>` in isolation, click
the trigger → `aria-expanded` flips to `true` and the menu portion
renders. No other dependencies.

**Acceptance Scenarios**:

1. **Given** the FAB is collapsed (`open === false`) and an
   authenticated user is on Homepage, **When** the user clicks the
   pill, **Then** `open` flips to `true` — the trigger unmounts and
   the expanded menu renders at the same `bottom-6 right-6` slot with
   the Cancel button now occupying the pill's former position.
2. **Given** the FAB is collapsed and a keyboard user tabs to the
   pill, **When** they press Enter or Space, **Then** the menu opens
   and focus moves to the first menu item ("Thể lệ").

---

### User Story 2 – Only visible when menu is closed (Priority: P1)

The trigger pill is the **entry state** of the widget. When the menu
is open, the pill is hidden; the Cancel button in the expanded menu
takes its bottom-right slot. When the menu closes (via Cancel / Esc /
outside-click / tile navigation), the pill reappears.

**Why this priority**: Figma models trigger + menu as two frames that
never render together. Rendering both at once would visually stack the
pill behind the menu's Cancel button — same anchor, same offset — and
create ambiguous click targets.

**Independent Test**: render `<QuickActionsFab>` with `open === true`
→ trigger pill is not in the DOM (or has `display: none`). Toggle to
`open === false` → pill renders again at `bottom-6 right-6`.

**Acceptance Scenarios**:

1. **Given** the menu is open, **When** the DOM is inspected, **Then**
   the trigger pill element is either absent or
   `display: none` — never visually co-present with the menu.
2. **Given** the menu has just closed (Cancel / Esc / outside-click /
   navigation), **When** React re-renders, **Then** the pill reappears
   at `bottom-6 right-6` in its default state (no stale hover/active
   styling).
3. **Given** the menu was opened by a keyboard user and then closed
   via Esc, **When** focus resolution runs, **Then** focus lands on
   the re-mounted trigger pill (so the user can continue keyboard
   navigation without falling to `<body>`).

---

### User Story 3 – Persistent visibility while scrolling (Priority: P1)

The FAB remains pinned to bottom-right regardless of page scroll. It
does not slide away on scroll-down, and it does not become occluded
by dynamic page content.

**Why this priority**: the FAB's whole value prop is "accessible from
anywhere". If it disappears during scroll (some fancy pattern) or
stacks under the sticky header, it fails its purpose.

**Independent Test**: render inside a long scrolling page; scroll to
any position → FAB still at bottom-right with same offset. Open a
modal → FAB is below the modal overlay (z-50 < modal's z-index).

**Acceptance Scenarios**:

1. **Given** the page is scrollable and the user is near the top,
   **When** they scroll 5000px down, **Then** the FAB is still at
   `right: 24px; bottom: 24px` in the viewport.
2. **Given** the sticky SiteHeader is visible (z-40), **When** the
   FAB renders (z-50), **Then** the FAB sits above the header if
   their positions overlap (rare — header is on top, FAB on bottom,
   but if a mobile keyboard pushes content, the FAB should NOT hide
   under the header).
3. **Given** a modal is open (z-index ≥ 100 by project convention),
   **When** the FAB is mounted, **Then** the modal's backdrop covers
   the FAB and clicks on the FAB go to the backdrop (closing the
   modal), not to the FAB button. *(Implementation detail: the FAB
   does not need to know about modals — z-index ordering handles
   this.)*

---

### User Story 4 – Branded glow affordance (Priority: P2)

The pill has a composite drop + warm cream glow shadow to make it
readable and branded on any background (dark or light hero imagery).
Hover visibly strengthens the shadow — a subtle lift that communicates
"interactive".

**Why this priority**: affordance polish. A pill without shadow on a
busy image background can vanish. The glow is low-cost to implement
and matches the Figma design exactly.

**Independent Test**: visual regression — capture the pill against a
dark and a light background and diff against
[./assets/frame.png](./assets/frame.png). Composite shadow layers
present.

**Acceptance Scenarios**:

1. **Given** the FAB is rendered on Homepage over the hero image,
   **When** the page paints, **Then** the pill's double-layer shadow
   (black drop + cream glow) is visible and the pill is legible even
   over the brightest part of the hero.
2. **Given** the FAB is at rest, **When** the user hovers the pill,
   **Then** the shadow lifts (larger blur, more spread) within 150ms.

---

### User Story 5 – Screen-reader disclosure semantics (Priority: P2)

A screen-reader user navigating Homepage hears the FAB announced with
a meaningful label (not "button, button, button") and understands
whether the menu is currently open.

**Why this priority**: WCAG 2.2 AA + constitution §II. Icon-only
buttons without an `aria-label` fail A11y audits.

**Independent Test**: axe-core sweep on the trigger — zero serious
violations. Manual VoiceOver / NVDA walkthrough: "Quick actions menu,
collapsed button" / "Quick actions menu, expanded button".

**Acceptance Scenarios**:

1. **Given** VoiceOver is active, **When** focus lands on the
   collapsed FAB, **Then** it announces the trigger with an
   i18n-sourced label (`common.fab.open` → VI: "Mở menu thao tác
   nhanh", EN: "Open quick actions menu") and a collapsed
   disclosure-button state via `aria-haspopup="menu"` +
   `aria-expanded="false"`.
2. **Given** the menu has closed (Cancel / Esc / outside-click /
   navigation) and the trigger has re-mounted, **When** the SR user
   tabs back to the pill, **Then** the same collapsed-state
   announcement plays — not a stale "expanded" state from the
   previous render.

---

### User Story 6 – Reduced-motion compliance (Priority: P3)

A user with `prefers-reduced-motion: reduce` hovers / presses the
pill — state changes (background, shadow) apply instantly, no 150ms
easing.

**Why this priority**: accessibility polish. Low user-facing impact
but trivial to implement correctly.

**Independent Test**: set system preference → hover pill → no
`transition-*` property takes effect.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion: reduce` is active, **When** the
   user hovers the pill, **Then** the background colour and shadow
   change immediately (no 150ms fade).

---

### Edge Cases

- **Unauthenticated users**: the FAB is only rendered on authenticated
  screens. No logic on the component itself — the parent layout
  decides whether to mount `<QuickActionsFab>` based on Supabase
  session state.
- **Pre-launch (`/countdown` rewrite active)**: Homepage SAA does not
  render pre-launch (middleware rewrites `/` → `/countdown`, which is
  chromeless). The FAB therefore never renders pre-launch either. ✓
  No extra guard needed.
- **Very narrow viewports** (< 360px wide): the 106px pill + 16px
  right offset = 122px required. Fits even on the smallest mainstream
  viewports (iPhone SE 320×568). No narrow-viewport fallback needed.
- **Very short viewports** (< 200px tall — e.g. split-screen mobile):
  pill + 16px bottom offset = 80px. Still fits. If the on-screen
  keyboard pushes viewport height below this, the FAB would overlap
  keyboard; acceptable for MVP (mobile keyboards typically close on
  tap outside anyway).
- **RTL locale**: not in scope for this project (VI + EN only, both
  LTR).
- **Print stylesheet**: covered by FR-012 — the FAB root carries
  `print:hidden`. No design input needed; the FAB has no meaning in a
  printed document.
- **Two FAB instances accidentally mounted** (e.g. both SiteLayout and
  a page independently mounting `<QuickActionsFab>`): they'd stack at
  the same position. Prevent by mounting once at
  `app/(authenticated)/layout.tsx` level only. Implementation concern,
  not a user-facing edge case.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

Visual specifications live in
[design-style.md](./design-style.md). This section covers behaviour
only.

| Component | Description | Interactions |
|-----------|-------------|--------------|
| `QuickActionsFabTrigger` | The cream pill (106×64, pen + "/" + saa). Fixed bottom-right, z-50. Only rendered while `open === false`. | Click / Tap / Enter / Space → set `open === true` (one-way opener; closing lives on the expanded menu); Hover → shadow lift |

Children of the trigger (icons + "/" separator) are not interactive —
they're purely decorative glyphs inside the single button.

### Navigation Flow

- **From**: any authenticated screen that mounts `<QuickActionsFab>`
  (currently Homepage SAA). Each mount is a rendered instance of the
  same component.
- **To**: stays on the same URL. Clicking the trigger sets
  `open === true` (one-way opener; subsequent closing is handled by
  the expanded menu's Cancel / Esc / outside-click / tile-click).
  Actual navigation happens from within the expanded menu (Thể lệ tile
  → `/the-le`; Viết KUDOS tile → `/kudos/new`). See
  [Sv7DFwBw1h/spec.md](../Sv7DFwBw1h-fab-quick-actions/spec.md).

### Visual Requirements

- Responsive breakpoints — see [design-style.md](./design-style.md)
  §Responsive Specifications.
- Animations — 150ms ease-in-out on background + shadow only. No
  transform animations on the pill. Respect
  `prefers-reduced-motion: reduce`.
- Accessibility — WCAG 2.2 AA. Trigger must have an `aria-label`,
  `aria-expanded`, and `aria-haspopup="menu"`. Focus-visible outline.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The trigger MUST render as a fixed-position element
  anchored bottom-right with 24px offset on desktop/tablet and 16px
  offset on mobile (< 640px).
- **FR-002**: The trigger MUST be exactly 106×64 px with 16px internal
  padding, 8px gaps, and a 100px (fully rounded) border-radius.
- **FR-003**: The trigger's background MUST be `#FFEA9E`
  (`--color-accent-cream`) in default state, `#FFE586` on hover,
  `#FFDD6B` on active, unchanged on focus (focus is expressed via
  outline).
- **FR-004**: The trigger's box-shadow MUST be the composite
  `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` in default state
  (drop shadow + warm cream glow).
- **FR-005**: The trigger MUST contain exactly three children in this
  order: `<Icon name="pencil" size={24}>`, `<span>"/"</span>`
  (Montserrat 700 24/32 `#00101A`), and a 24×24 `<Image>` pointing at
  `/images/the-le/icon_rule_saa@2x.png` with `unoptimized` (Q4 ✅
  — maps to Figma `MM_MEDIA_LOGO`; same glyph as the Thể lệ tile in
  the expanded menu).
- **FR-006**: Clicking, tapping, pressing Enter, or pressing Space on
  the trigger MUST set `open === true` (a one-way opener in the
  trigger's lifetime — the trigger never sees `open === true` because
  it unmounts when the menu opens; closing is handled by the expanded
  menu's Cancel / Esc / outside-click / tile-navigation).
- **FR-007**: The trigger MUST carry `aria-haspopup="menu"`,
  `aria-expanded={open}` (which is always `false` while the trigger
  renders — kept for correctness against SR state cache), and a
  localised `aria-label` matching `common.fab.open` (vi) /
  `common.fab.open` (en).
- **FR-008**: When the user opens the menu by **keyboard** (Enter /
  Space on the trigger), focus MUST move to the first menu item
  (`Thể lệ`). When the user opens the menu by **mouse / touch**, focus
  MUST stay with the trigger's document flow — i.e. after the menu
  mounts, focus is not forcibly moved; the user can keyboard-navigate
  the menu by pressing Tab from wherever focus landed. When the menu
  subsequently closes, focus MUST return to the freshly re-mounted
  trigger pill (not to `<body>`).
- **FR-009**: The whole `<QuickActionsFab>` MUST be a `"use client"`
  component. Initial client render MUST have `open === false` so SSR
  markup contains the trigger pill, never the expanded menu (prevents
  open-menu flash + hydration mismatch).
- **FR-010**: The trigger MUST NOT render while `open === true`.
  Either unmount it or apply `display: none`. This keeps the Cancel
  button in the expanded menu as the sole visible control in the
  bottom-right slot.
- **FR-011**: The trigger's focus-visible outline MUST be a 2px solid
  white ring with 2px offset, rendered only when focus arrived via
  keyboard (`:focus-visible`, not `:focus`).
- **FR-012**: The trigger MUST be hidden in print media (`@media
  print { display: none }` or Tailwind's `print:hidden`).

### Technical Requirements

- **TR-001**: Ship as part of the `<QuickActionsFab>` client component
  at `src/components/shell/QuickActionsFab.tsx`. `shell/` is a **new
  feature-scoped folder** — constitution §I permits feature-scoped
  subfolders under `src/components/`; "shell" groups widgets that
  cross routes (FAB, future global toasts, etc.). The existing
  [src/components/homepage/QuickActionsFab.tsx](../../../src/components/homepage/QuickActionsFab.tsx)
  MUST be relocated + replaced as part of this work.
- **TR-002**: Use the existing `<Icon>` primitive for `pencil` and
  `saa` — do not inline SVG paths.
- **TR-003**: Reuse existing colour + font tokens
  (`--color-accent-cream*`, `--color-brand-900`, `--font-montserrat`).
  **Introduce three new tokens** (shared with the expanded-menu spec —
  add once to [src/app/globals.css](../../../src/app/globals.css)):
  - `--text-fab` — Montserrat 700 24px/32px · used for the "/" and
    the expanded-menu tile labels
  - `--shadow-fab-pill` — `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287`
  - `--shadow-fab-pill-hover` — `0 6px 10px 0 rgba(0,0,0,0.3), 0 0 10px 0 #FAE287`
- **TR-004**: The composite shadow MUST be expressed via
  `shadow-[var(--shadow-fab-pill)]` (default) /
  `hover:shadow-[var(--shadow-fab-pill-hover)]`. Do not inline the raw
  multi-layer value at call sites.
- **TR-005**: i18n strings added under a new `common.fab.*`
  namespace (shared with `Sv7DFwBw1h`): `common.fab.open`,
  `common.fab.rules`, `common.fab.writeKudo`, `common.fab.close`.
- **TR-006**: Integration tests MUST cover FR-001 through FR-012.
  Mirror the patterns used in
  [src/components/homepage/ProfileMenu.tsx](../../../src/components/homepage/ProfileMenu.tsx)
  tests.
- **TR-007**: Accessibility sweep (`@axe-core/playwright`) on Homepage
  SAA with the FAB rendered MUST report zero serious/critical
  violations on the trigger subtree — both collapsed and expanded.
- **TR-008**: Clicking the trigger SHOULD fire an `fab_open` analytics
  event once Live board lands. Reserve the event name in
  [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts)
  during implementation; do not emit in MVP. Matches the expanded
  spec's TR-004.

### Key Entities *(if feature involves data)*

None. The trigger holds local component state (`open: boolean`) only.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| — | — | None — trigger toggles local state only | — |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of FR-001 through FR-012 are covered by unit or
  integration tests.
- **SC-002**: Zero axe-core serious/critical violations on the FAB
  subtree, both states.
- **SC-003**: A keyboard-only user can open the menu, act on a menu
  item or cancel, and return focus to the page — all without mouse
  input. Verified via a manual walkthrough recorded in the Viết Kudo /
  Live board integration sprint.
- **SC-004**: Visual regression diff of the collapsed pill against
  [./assets/frame.png](./assets/frame.png) within the project's
  existing threshold.
- **SC-005**: Composite shadow (drop + glow) verified visible on both
  dark (hero image) and light page backgrounds by capturing a
  Playwright screenshot on Homepage SAA.

---

## Out of Scope

- **Expanded menu content + behaviour** — defined in
  [../Sv7DFwBw1h-fab-quick-actions/spec.md](../Sv7DFwBw1h-fab-quick-actions/spec.md).
  This spec only defines the trigger.
- **Dynamic per-screen action lists** — the trigger always toggles the
  same menu in MVP; routes that mount `<QuickActionsFab>` don't
  customise its contents.
- **Trigger variants** (different icon sets, different label for
  specific screens) — not in scope. All instances are identical.
- **Haptics / sound feedback on open** — none.
- **Draggable / repositionable FAB** — pinned to bottom-right
  permanently; users cannot move it.
- **RTL layouts** — out of project scope.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications — **N/A**
- [ ] Database design — **N/A**
- [x] Screen flow documented (`.momorph/contexts/screen_specs/SCREENFLOW.md`)
- [x] Design style document complete ([design-style.md](./design-style.md))
- [x] Reference screenshot saved to `./assets/frame.png`
- [x] Companion expanded-state spec authored
      (`../Sv7DFwBw1h-fab-quick-actions/`)
- [x] Existing `<Icon>` primitive has `pencil` + `saa` glyphs
- [x] Existing `--color-accent-cream*` + `--color-brand-900` tokens

---

## Notes

- **Implementation bundle**: this spec + the expanded-state spec
  together describe **one component** (`<QuickActionsFab>`). They will
  share a single `plan.md` / `tasks.md` and be implemented in a single
  sprint. Splitting them across sprints would almost certainly require
  refactoring later.
- **Prototype alignment gap**: the current
  [src/components/homepage/QuickActionsFab.tsx](../../../src/components/homepage/QuickActionsFab.tsx)
  renders the pill visually close to this spec but is missing:
  - the composite `--shadow-fab-pill` glow (`0 0 6px 0 #FAE287`)
  - the hover shadow-lift (`--shadow-fab-pill-hover`)
  - the `print:hidden` rule
  - aria strings from i18n (it uses props; should pull from
    `getMessages()` via a server-rendered wrapper or pass through)
  - relocation to `src/components/shell/`
  - correct expanded-state content (see `Sv7DFwBw1h` spec) — current
    dark dropdown list must be replaced
  These gaps close during implementation. Both FAB specs are ready;
  plan + implement as one bundled sprint.
- **Why three glyphs and not a label**: the brand wordmark is the pen
  + / + Sun* logo combo. Design intentionally chose it to avoid
  competing with the expanded menu's labels. Don't add a text label
  "here" — it's cluttered and duplicates the menu's "Viết KUDOS".
- **Open questions**:
  - Q1 ✅ resolved 2026-04-20 — `--shadow-fab-pill-hover` =
    `0 6px 10px 0 rgba(0,0,0,0.3), 0 0 10px 0 #FAE287`.
  - Q5 ✅ resolved 2026-04-20 — EN `aria-label` for `common.fab.open`
    is `"Open quick actions menu"`.
  - **Q3 (Design, open)** — when menu opens, should the pill → menu
    transition involve a visible morph animation (trigger fades out
    while menu fades in, 150ms crossfade) or a hard swap? Spec
    currently assumes hard swap.
  - **Q6 (Tech, open)** — project-wide modal z-index convention.
    US-3 scenario 3 assumes modals sit at `z-index ≥ 100` above the
    FAB's `z-50`. No modals exist in the codebase yet — ratify during
    the plan review for Viết Kudo.
