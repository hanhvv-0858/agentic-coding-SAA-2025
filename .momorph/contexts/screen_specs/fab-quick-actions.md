# Screen: Floating Action Button — Expanded (Quick Actions)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `Sv7DFwBw1h` |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/Sv7DFwBw1h |
| **Screen Group** | Shell widgets (authenticated FAB) |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

**Expanded state** of the authenticated-shell Floating Action Button
(`<QuickActionsFab>` at `src/components/shell/QuickActionsFab.tsx`). When
a signed-in user clicks the [collapsed FAB](./fab-collapsed.md), the
widget expands into a right-aligned vertical stack of three tiles:

1. **Thể lệ** — opens `/the-le` (event rules).
2. **Viết KUDOS** — opens `/kudos/new` (compose flow).
3. **Cancel** (red circular X) — collapses back to the trigger.

Fixed-position overlay pinned to `bottom-6 right-6` on desktop (`bottom-4
right-4` on mobile). Lives on every authenticated route; never renders
pre-launch (Homepage replaced by `/countdown` then). The menu and the
collapsed trigger are mutually exclusive — they share the same anchor
slot.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Any authenticated screen | Click collapsed FAB | `open === true` toggle |
| Keyboard activation | `Enter` / `Space` on focused collapsed trigger | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Thể lệ (`/the-le`) | Tile A "Thể lệ" | — | High | Existing route; `<Link>` with prefetch |
| Viết Kudo (`/kudos/new`) | Tile B "Viết KUDOS" | — | High | Route exists; opens compose modal |
| Same URL (menu collapses) | Tile C Cancel / Esc / outside-click | — | High | Sets `open === false` |

### Navigation Rules

- **Back behavior**: N/A — overlay; browser Back targets the underlying
  page, not the menu.
- **Deep link support**: No — ephemeral widget, not a route.
- **Auth required**: Yes — FAB is only mounted on authenticated screens.

---

## Component Schema

### Layout Structure

```
 ╳ page content (below) ╳
                                     ┌──────────────┐
                                     │ 📜 Thể lệ    │  (A)
                                     ├──────────────┤
                                     │ ✏️ Viết KUDOS│  (B)
                                     ├──────────────┤
                                     │      ✖       │  (C — red circular)
                                     └──────────────┘
                                            bottom-6 right-6
```

### Component Hierarchy

```
QuickActionsFab (Client — src/components/shell/QuickActionsFab.tsx)
├── Trigger pill (hidden when open === true)
└── QuickActionsMenu (open === true)
    ├── RuleShortcutTile "Thể lệ" (Link href="/the-le")
    ├── ComposeShortcutTile "Viết KUDOS" (Link href="/kudos/new")
    └── CancelButton (red circle, onClick → close)
```

### Main Components

| Component | Type | Description | Reusable |
|-----------|------|-------------|----------|
| QuickActionsMenu | Organism | Vertical stack, right-aligned, fixed bottom-right | No |
| RuleShortcutTile (A) | Molecule | Cream background + Thể lệ PNG icon + label | Yes |
| ComposeShortcutTile (B) | Molecule | Cream background + pencil icon + label | Yes |
| CancelButton (C) | Atom | Red circular (40×40), close icon, occupies trigger's slot | Yes |

---

## Form Fields

N/A — pure navigation widget.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| — | — | No network I/O; state is local to the component | — |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click Thể lệ | `<Link href="/the-le">` | client nav | — | Navigates + sets `open === false` |
| Click Viết KUDOS | `<Link href="/kudos/new">` | client nav | — | Navigates + sets `open === false` |
| Click Cancel | `setOpen(false)` | — | — | Menu collapses; focus returns to trigger |
| `Esc` / outside-click | Same | — | — | Same |

### Error Handling

N/A — no async operations.

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `open` | boolean | `false` | Menu visibility (owned by `<QuickActionsFab>`) |

No global store. Initial SSR markup renders collapsed trigger only
(`open === false`) to prevent hydration flash.

---

## UI States

### Closed (default)
- Only the collapsed pill renders (see `fab-collapsed.md`).

### Open
- Trigger unmounts; 3 tiles + cancel render stacked.

### Hover / active (per tile)
- Background `#FFEA9E` → `#FFDD6B` active flash; visible for ≥ 1 frame
  before navigation commits (US1 AC2).

### Reduced motion
- Tiles fade in at 80 ms with NO `translateY` (FR-022 / US6).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA | Container `role="menu"`; each tile `role="menuitem"`; trigger `aria-expanded` + `aria-haspopup="menu"` |
| Focus trap | Tab past Cancel wraps to Thể lệ; Shift-Tab from Thể lệ wraps to Cancel |
| Esc | Closes + returns focus to trigger |
| Outside click | Closes (scoped to menu root ref) |
| Touch target | ≥ 44 × 44 px per tile |
| Focus ring | Visible on every tile |
| Labels | i18n `common.fab.rules` / `common.fab.writeKudo` / `common.fab.close` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | `bottom-4 right-4` offset; tiles full-touch size |
| Tablet (640–1023px) | `bottom-6 right-6`; same tile sizes |
| Desktop (≥1024px) | Same as tablet — Figma baseline |

Print: `print:hidden` on the root.

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `fab_open` | Click trigger | — (reserved for Live-board integration) |
| `fab_action_click` | Tile click | `{ action: "rules" \| "write_kudo" }` |
| `fab_close_cancel` | Click Cancel | — |

Events reserved in `src/libs/analytics/track.ts`; not emitted in MVP.

---

## Design Tokens

| Token | Usage |
|-------|-------|
| `--color-accent-cream` | Tile backgrounds |
| `--color-brand-900` | Tile labels |
| `--shadow-fab-pill` / `--shadow-fab-pill-hover` | Composite drop + glow |
| `--text-fab` | Montserrat 700 24/32 |
| `--color-nav-dot` (`#D4271D`) | Cancel button fill |
| `--font-montserrat` | Labels |

---

## Implementation Notes

### Dependencies
- `<Icon>` primitive: `pencil`, `close` glyphs (`saa` for the paired collapsed spec).
- PNG: `public/images/the-le/icon_rule_saa@2x.png` (48×48, rendered 24×24 via `next/image unoptimized`).
- i18n: `common.fab.*` namespace.

### Special Considerations
- **Trigger and menu are never co-present** — render one or the other.
  Cancel occupies the trigger's former slot so state changes feel like a
  morph rather than a spawn.
- Mount the FAB once at the authenticated layout level
  (`src/app/(authenticated)/layout.tsx`) — never per page.
- Relocated from `src/components/homepage/` to `src/components/shell/`.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation shipped |
| Confidence Score | High |

### Next Steps

- [ ] Wire `fab_*` analytics events once Live board integration lands.
- [ ] Replace `/kudos/new` placeholder target once Viết Kudo ships fully.
