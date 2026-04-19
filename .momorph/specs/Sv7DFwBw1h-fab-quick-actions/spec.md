# Feature Specification: Floating Action Button – Expanded (Quick Actions)

**Frame ID**: `Sv7DFwBw1h`
**Frame Name**: `Floating Action Button - phim nổi chức năng 2`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/Sv7DFwBw1h
**Companion frame**: `_hphd32jN2` (collapsed / entry state — spec'd at [../_hphd32jN2-fab-collapsed/spec.md](../_hphd32jN2-fab-collapsed/spec.md))
**Created**: 2026-04-19
**Status**: Draft

---

## Overview

Defines the **expanded state** of the authenticated-shell Floating
Action Button. When a signed-in user clicks the collapsed FAB
(`_hphd32jN2`), the widget expands into a right-aligned vertical stack
of three tiles:

1. **Thể lệ** — opens the event rules page (`/the-le`).
2. **Viết KUDOS** — opens the compose-kudo screen (`/kudos/new`,
   pending Live board + Viết Kudo specs).
3. **Cancel** (red circular X) — collapses back to the FAB entry state.

The menu is a fixed-position floating overlay: it does not occupy
document flow and sits above all page content except modals. It ships
on the same screens where the FAB already appears (Homepage SAA,
future: Live board).

**Why this work exists**: the existing `QuickActionsFab` component
(shipped with Homepage) is a single-item dark dropdown. This frame
supersedes that design with a two-action + explicit-cancel pattern,
matching the Figma source of truth.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Compose a kudo via the FAB (Priority: P1)

A logged-in user browsing Homepage / Live board wants to write a KUDOS
without hunting for the compose entry point. They tap the FAB
(collapsed state), see the expanded menu, tap "Viết KUDOS", and land
on the compose screen.

**Why this priority**: "Viết KUDOS" is the single most important
action on the product — every feed consumption pattern ultimately
loops back to creating new content. The FAB is the quickest path.

**Independent Test**: with the menu already open (`open=true` state),
clicking the Viết KUDOS tile navigates to `/kudos/new` and closes the
menu before navigation begins. Renderable and testable without Live
board or Viết Kudo screens existing — assert the `Link`'s `href` and
`onClick` close handler.

**Acceptance Scenarios**:

1. **Given** the FAB is expanded and the user is authenticated,
   **When** the user clicks/taps the "Viết KUDOS" tile,
   **Then** the browser navigates to `/kudos/new` and the menu
   collapses (so when the user returns, they see the FAB, not the
   menu).
2. **Given** the menu is expanded on a touch viewport (≤ 639px wide),
   **When** the user taps the "Viết KUDOS" tile,
   **Then** the hit target is at least 44×44 px and the tile's active
   state is visible (background change `#FFEA9E` → `#FFDD6B`) for at
   least one frame before navigation commits.

---

### User Story 2 – Open the event rules via the FAB (Priority: P1)

A user expanding the FAB sees a "Thể lệ" shortcut and taps it to learn
or re-check the event rules without leaving the current screen's URL
path conceptually — `/the-le` is a dedicated route (already shipped).

**Why this priority**: Thể lệ is a frequently-referenced page during
the event (prize tiers, collectible badges). Having a shortcut on
every screen reduces friction; without it users would dig through
footer nav.

**Independent Test**: with the menu already open, clicking the Thể lệ
tile navigates to `/the-le` and collapses the menu.

**Acceptance Scenarios**:

1. **Given** the FAB is expanded, **When** the user clicks the "Thể lệ"
   tile, **Then** the browser navigates to `/the-le` and the menu
   collapses.
2. **Given** the user is already on `/the-le` and expands the FAB there
   (if the FAB is present on that screen — see Out of Scope),
   **When** they click Thể lệ, **Then** it is a no-op navigation
   (React / Next.js dedupe), and the menu still collapses.

---

### User Story 3 – Dismiss the menu without acting (Priority: P1)

A user expanded the FAB by mistake, or explored the menu and decided
not to navigate. They close the menu via the red circular Cancel
button, returning the widget to its collapsed state. Page scroll and
focus are restored / remain stable.

**Why this priority**: a menu that cannot be dismissed is
user-hostile. The explicit cancel target is especially important on
touch — outside-click and Esc are P2 augmentations, not replacements.

**Independent Test**: with `open=true`, clicking the red circle sets
`open=false` and moves focus back to the collapsed FAB trigger.

**Acceptance Scenarios**:

1. **Given** the menu is expanded, **When** the user clicks/taps the
   red circular Cancel button, **Then** the menu collapses to the FAB
   entry state and focus returns to the FAB trigger (so keyboard users
   never lose their place).
2. **Given** the menu is expanded and the user is composing in a
   nearby form, **When** they tap Cancel, **Then** focus returns to
   the FAB, not back into the form (the user explicitly left that
   context by opening the FAB).

---

### User Story 4 – Keyboard dismissal (Priority: P2)

A keyboard user expands the FAB, tabs through Thể lệ → Viết KUDOS →
Cancel, and can press Escape at any point to collapse the menu.

**Why this priority**: WCAG 2.2 AA + constitution §II require full
keyboard parity. Esc is the standard disclosure-menu dismiss pattern.

**Independent Test**: open menu, focus on any tile, press Escape →
`open=false`; focus on the FAB trigger.

**Acceptance Scenarios**:

1. **Given** the menu is open and focus is on "Viết KUDOS",
   **When** the user presses Escape, **Then** the menu collapses and
   focus returns to the FAB trigger.
2. **Given** the menu is open, **When** the user presses Tab from the
   Cancel button, **Then** focus wraps back to the first tile
   (Thể lệ) — not out into page content. (Focus-trap-within-menu
   behaviour.)

---

### User Story 5 – Outside-click dismissal (Priority: P2)

A user expands the FAB, then clicks elsewhere on the page without
choosing an action. The menu collapses so it doesn't persist as a
visual obstruction.

**Why this priority**: complements Cancel for mouse/pointer users.
Mirrors the pattern in the existing `QuickActionsFab` prototype and
`ProfileMenu`.

**Independent Test**: open menu, click anywhere outside the menu root
element → `open=false`.

**Acceptance Scenarios**:

1. **Given** the menu is open, **When** the user clicks anywhere
   outside the menu container, **Then** the menu collapses.
2. **Given** the menu is open, **When** the user clicks on one of the
   three tiles (inside the container), **Then** the outside-click
   handler does NOT fire; the tile's own handler runs instead.

---

### User Story 6 – Reduced-motion compliance (Priority: P3)

A user with `prefers-reduced-motion: reduce` expands the FAB and the
menu appears/disappears with opacity-only transitions — no slide or
scale.

**Why this priority**: accessibility polish; constitution §II WCAG 2.2
compliance. Low impact on core flow.

**Independent Test**: set system preference, open/close menu — inspect
that no `transform` transition runs.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion: reduce` is set,
   **When** the user opens the menu, **Then** tiles fade in at 80ms
   with no `translateY` motion.

---

### Edge Cases

- **Unauthenticated users**: the FAB is only rendered on authenticated
  screens. If somehow this component ends up on a public screen,
  clicking "Viết KUDOS" would redirect to `/login` via the existing
  middleware — acceptable, no custom handling needed.
- **Pre-launch (`/countdown` active)**: the FAB must NOT render while
  the middleware rewrite sends `/` to `/countdown`. Homepage SAA is
  the FAB's host and Homepage does not render pre-launch (countdown
  page is chromeless). ✓ already covered by existing routing.
- **Very short viewports (< 360px height)**: the 224px menu + 24px
  bottom offset + browser chrome can approach the viewport top. If
  the menu's top edge would leave the viewport, the trigger still
  works — the menu simply scrolls with the viewport since it's
  fixed-positioned on the document, not the viewport. Accepted as
  out-of-scope for MVP; flag if telemetry shows the issue.
- **Double-click on a tile**: since each tile is a `<Link>` /
  `<button>` with an `onClick` close-first-then-navigate, a
  double-click resolves to a single navigation. Guard inside React
  via a `useCallback`'d handler to avoid redundant state updates.
- **Rapid toggle** (user opens and immediately closes via cancel):
  state transitions are synchronous — no animation overlap, no stale
  state.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

Visual specifications live in
[design-style.md](./design-style.md). This section lists the
behavioural contract of each component.

| Component | Description | Interactions |
|-----------|-------------|--------------|
| `QuickActionsFabTrigger` (the collapsed pill) | Entry point — spec'd at [../_hphd32jN2-fab-collapsed/spec.md](../_hphd32jN2-fab-collapsed/spec.md). Per that spec's FR-012, the trigger is hidden while the menu is open; Cancel (C) takes its slot. | Click / Tap / Space / Enter → set `open === true` |
| `QuickActionsMenu` (the expanded container) | Vertical stack of 3 tiles, right-aligned, fixed bottom-right | Host for all three tile interactions |
| `RuleShortcutTile` (A) | "Thể lệ" shortcut — icon + label, cream background | Click → navigate `/the-le` + close menu |
| `ComposeShortcutTile` (B) | "Viết KUDOS" primary shortcut — icon + label, cream background | Click → navigate `/kudos/new` + close menu |
| `CancelButton` (C) | Red circular button, icon-only | Click → close menu, return focus to trigger |

### Navigation Flow

- **From**: Any authenticated screen where `<QuickActionsFab>` is
  mounted (currently Homepage; Live board will inherit).
- **To**:
  - `/the-le` — Thể lệ tile
  - `/kudos/new` — Viết KUDOS tile (route exists as placeholder;
    becomes real with the Viết Kudo spec implementation)
  - Same URL (cancel) — menu collapses, no navigation
- **Triggers**: tile click, Esc key, outside-click, explicit Cancel.

### Visual Requirements

- Responsive breakpoints: see `design-style.md` §Responsive
  Specifications.
- Animations: 150ms ease-out fade + 8px upward slide on open;
  120ms ease-in reverse on close. Respect
  `prefers-reduced-motion: reduce`.
- Accessibility: WCAG 2.2 AA. Focus-visible outlines on every tile;
  focus trap within menu; `aria-expanded` on trigger; `role="menu"`
  on container; `role="menuitem"` on each tile.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The menu MUST render as a fixed-position element anchored
  to the bottom-right of the viewport with 24px offset on desktop /
  tablet and 16px on mobile (< 640px) — the same anchor + offset the
  collapsed trigger uses. This is **intentional**: the Cancel (C)
  button occupies the same bottom-right slot the trigger did, so
  switching states feels like the trigger "morphed" into the menu.
- **FR-002**: The menu MUST only render while `open === true`. On
  `open === false` only the collapsed FAB trigger is visible. Trigger
  and menu MUST NEVER be visually co-present — render one or the
  other, never both (enforced on the collapsed side by its FR-012).
- **FR-003**: Clicking the Thể lệ tile MUST navigate to `/the-le` and
  set `open === false` before navigation commits.
- **FR-004**: Clicking the Viết KUDOS tile MUST navigate to
  `/kudos/new` and set `open === false` before navigation commits.
- **FR-005**: Clicking the Cancel (red circle) button MUST set
  `open === false` and return keyboard focus to the collapsed FAB
  trigger.
- **FR-006**: Pressing Escape while any part of the menu has focus
  MUST set `open === false` and return focus to the trigger.
- **FR-007**: A click / pointer event outside the menu root element
  MUST set `open === false`. A click INSIDE the menu root MUST NOT
  trigger close (except via the Cancel handler).
- **FR-008**: Tabbing forward past the Cancel button MUST wrap focus
  back to the first tile (Thể lệ). Tabbing backward past Thể lệ MUST
  wrap to Cancel. (Focus trap.)
- **FR-009**: All three tiles MUST display hover + active +
  focus-visible states as specified in `design-style.md`.
- **FR-010**: Labels ("Thể lệ", "Viết KUDOS") MUST come from i18n
  messages (vi + en) under a new `common.fab.*` namespace. The Cancel
  button's `aria-label` ("Đóng" / "Close") MUST also be i18n-sourced.
- **FR-011**: The component MUST NOT render the menu during SSR — it
  is a `"use client"` island with initial state `open === false`, so
  SSR markup contains only the collapsed trigger (or nothing on routes
  that don't mount it).
- **FR-012**: The entire `<QuickActionsFab>` (trigger + menu) MUST be
  hidden in print media (`print:hidden` Tailwind utility on the root
  element). Matches the collapsed spec's FR-011.

### Technical Requirements

- **TR-001**: The component MUST be a single `"use client"` module
  under `src/components/shell/QuickActionsFab.tsx`. `shell/` is a new
  feature-scoped folder (permitted under constitution §I) grouping
  cross-route widgets. Existing
  [src/components/homepage/QuickActionsFab.tsx](../../../src/components/homepage/QuickActionsFab.tsx)
  MUST be relocated + replaced.
- **TR-002**: Use Next.js `<Link>` for Thể lệ + Viết KUDOS tiles so
  prefetching works.
- **TR-003**: Use the existing `<Icon>` component for all three icons
  (`saa`, `pencil`, `close`) — do not introduce new SVG paths.
- **TR-004**: No new analytics events in MVP. When Live board ships,
  track `fab_open`, `fab_action_click` (with action = "rules" |
  "write_kudo"), `fab_close_cancel` — reserve the names in
  [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts)
  but don't emit until integration.
- **TR-005**: The integration tests for the new component MUST cover
  every FR above, mirroring the patterns already used in
  [src/components/homepage/ProfileMenu.tsx](../../../src/components/homepage/ProfileMenu.tsx)
  tests.
- **TR-006**: The component MUST honour `prefers-reduced-motion:
  reduce` by skipping the 8px translate transition and shortening the
  opacity fade to 80ms.

### Key Entities *(if feature involves data)*

None. This is a pure-navigation UI component with no persistent state
and no server data.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| — | — | None — pure navigation, no API calls | — |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When the component is implemented, **100%** of the
  functional requirements FR-001 through FR-012 are covered by unit
  or integration tests.
- **SC-002**: Playwright a11y sweep (`@axe-core/playwright`) on the
  Homepage SAA page with menu expanded reports **zero serious/critical
  violations** on the FAB subtree.
- **SC-003**: Keyboard walkthrough — a user can open, navigate, and
  dismiss the menu using only Tab + Shift-Tab + Enter + Esc, without
  losing focus outside the menu while `open === true`.
- **SC-004**: Visual regression — screenshot diff of menu open vs
  Figma `frame.png` in
  [.momorph/specs/Sv7DFwBw1h-fab-quick-actions/assets/frame.png](./assets/frame.png)
  within the project's existing threshold (same bar as Homepage hero).

---

## Out of Scope

- **Collapsed FAB state** (`_hphd32jN2`) — defined in [its own
  spec](../_hphd32jN2-fab-collapsed/spec.md). This document covers
  the expanded state; the collapsed trigger is a one-way opener that
  sets `open === true`. Closing always happens from within the
  expanded menu (this spec's FR-005–FR-007).
- **Placement on Live board** — this spec focuses on the component's
  contract. Which routes mount the FAB is decided by the Live board
  spec when that screen is built.
- **Animations beyond open/close** — no staggered entry, no tile-level
  hover scale, no spring physics. Simple fade + slide is sufficient.
- **Haptics / sound** — none.
- **Right-to-left layouts** — not in scope for this project.
- **Custom per-screen action lists** — the menu always shows the same
  two actions in MVP. Dynamic action configuration is a future
  enhancement.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications available (`.momorph/API.yml`) — **N/A** (no
      API calls)
- [ ] Database design completed (`.momorph/database.sql`) — **N/A** (no
      persistent data)
- [x] Screen flow documented (`.momorph/contexts/screen_specs/SCREENFLOW.md`)
- [x] Design style document complete ([design-style.md](./design-style.md))
- [x] Reference screenshot saved to `./assets/frame.png`
- [x] Thể lệ route shipped (`/the-le`) — navigation target 1
- [ ] Viết Kudo route shipped (`/kudos/new`) — navigation target 2;
      placeholder exists today, real compose screen lands with the
      Viết Kudo spec

---

## Notes

- **Paired frames**: this is frame 2 of a two-frame pattern (collapsed
  + expanded). Both specs are ready — plan + implement as one bundled
  sprint. See [../_hphd32jN2-fab-collapsed/spec.md](../_hphd32jN2-fab-collapsed/spec.md)
  for the trigger contract.
- **Relation to current code**: the current
  [src/components/homepage/QuickActionsFab.tsx](../../../src/components/homepage/QuickActionsFab.tsx)
  uses a different expanded pattern (dark dropdown list with a single
  "Viết KUDO" link). Reconciling the two is the implementation's first
  task — don't preserve the current design, replace it.
- **i18n copy** — confirmed 2026-04-20 (Q5 ✅):
  - VI: "Thể lệ" / "Viết KUDOS" / "Đóng"
  - EN: "Rules" / "Write KUDOS" / "Close" (plus `open` = "Open quick actions menu")
- **Icon mapping** (Q4 ✅ resolved 2026-04-20): Design provided a
  dedicated PNG glyph for the Thể lệ tile at
  `public/images/the-le/icon_rule_saa@2x.png` (48×48, rendered at
  24×24 via `next/image` + `unoptimized`). It is **not** the Sun*
  monogram from `<Icon name="saa">` — that `saa` entry stays in the
  icon registry for other consumers (collapsed FAB trigger pill,
  footer logo).
