# Screen: Floating Action Button — Collapsed (Trigger)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `_hphd32jN2` |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/_hphd32jN2 |
| **Screen Group** | Shell widgets (authenticated FAB) |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

**Collapsed / entry state** of the authenticated-shell Floating Action
Button. A cream-coloured pill (106×64) pinned to the bottom-right of the
viewport on every authenticated screen where `<QuickActionsFab>`
(`src/components/shell/QuickActionsFab.tsx`) is mounted (Homepage, Live
board, etc.). Click / tap / `Enter` / `Space` toggles the
[expanded menu](./fab-quick-actions.md) (`Sv7DFwBw1h`).

The pill is **icon-only**: pen glyph + `"/"` separator + Sun\* Awards
monogram PNG. No text label — the combo is a brand wordmark for "write a
kudo / Sun Annual Awards". Composite drop + warm cream-glow shadow
(`--shadow-fab-pill`) makes it legible over dark + light page
backgrounds.

Hidden pre-launch because Homepage renders `/countdown` instead. Hidden in
print via `print:hidden`.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Any authenticated screen (mounted globally) | Auto — always visible | Authenticated; not pre-launch |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Expanded menu (`Sv7DFwBw1h`) | Click / Tap / Enter / Space on pill | — | High | One-way opener; sets `open === true`; trigger unmounts |

### Navigation Rules

- **Back behavior**: N/A — overlay, no history.
- **Deep link support**: No — always mounted by the authenticated layout.
- **Auth required**: Yes. FAB is only mounted on authenticated screens.

---

## Component Schema

### Layout Structure

```
 ╳ page content ╳
                                     ┌──────────────┐
                                     │  ✏️ / 🔶     │  ← 106×64 pill
                                     └──────────────┘
                                            bottom-6 right-6 (mobile: bottom-4 right-4)
```

### Component Hierarchy

```
QuickActionsFab (Client)
├── Trigger pill (rendered while open === false)
│   ├── Pencil icon (24x24)
│   ├── "/" separator (Montserrat 700 24/32 brand-900)
│   └── SAA monogram Image (24x24, next/image unoptimized)
└── Expanded menu (rendered while open === true — see fab-quick-actions.md)
```

### Main Components

| Component | Type | Description | Reusable |
|-----------|------|-------------|----------|
| QuickActionsFabTrigger | Molecule | 106×64 cream pill; pen + / + SAA logo; composite shadow | Yes — shared between screens |
| Pencil glyph | Atom | `<Icon name="pencil">` | Yes |
| "/" separator | Atom | Plain text node | Yes |
| SAA monogram | Atom | `public/images/the-le/icon_rule_saa@2x.png` rendered 24×24 | Yes |

---

## Form Fields

N/A.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| — | — | Pure client state (`open: boolean`); no network I/O | — |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click / Tap / Enter / Space on trigger | `setOpen(true)` | — | — | Trigger unmounts; menu renders (see `fab-quick-actions.md`) |

### Error Handling

N/A.

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `open` | boolean | `false` | Widget state (shared with expanded spec) |

SSR markup always has `open === false` — prevents open-menu flash +
hydration mismatch.

---

## UI States

### Default
- Pill visible; `--shadow-fab-pill` composite.

### Hover
- Shadow lift (`--shadow-fab-pill-hover`), 150 ms ease-in-out.

### Active
- Background flips `#FFEA9E` → `#FFDD6B` for one frame before open fires.

### Focus-visible
- 2 px white outline + 2 px offset (keyboard-only via `:focus-visible`).

### Reduced motion
- Background + shadow transitions instant; no `transition-*` applies.

### Menu open
- Trigger unmounts; Cancel button from the expanded menu occupies the
  same slot (no visual stacking).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA | `aria-haspopup="menu"` + `aria-expanded={open}` + `aria-label` from `common.fab.open` i18n key |
| Keyboard | Tab-reachable; `Enter` / `Space` opens; on keyboard-open focus moves to first menu item (Thể lệ) |
| Touch target | 106 × 64 px (well above 44 × 44 minimum) |
| Focus ring | 2 px white + 2 px offset, `:focus-visible` only |
| Reduced motion | No transforms; instant state swaps |
| Print | `print:hidden` on root |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | `bottom-4 right-4` offset; 106 × 64 fits even iPhone SE (320 × 568) |
| Tablet (640–1023px) | `bottom-6 right-6` |
| Desktop (≥1024px) | Same as tablet — Figma baseline |

Stacking: `z-50`. Modals (expected `z-index ≥ 100`) sit above the FAB.

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `fab_open` | Click trigger | — |

Reserved in `src/libs/analytics/track.ts`; emitted only once Live-board
integration lands (TR-008).

---

## Design Tokens

**New tokens** (shared with expanded spec — added once to `globals.css`):

| Token | Value | Usage |
|-------|-------|-------|
| `--text-fab` | Montserrat 700 24/32 | "/" separator + tile labels |
| `--shadow-fab-pill` | `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` | Default drop + glow |
| `--shadow-fab-pill-hover` | `0 6px 10px 0 rgba(0,0,0,0.3), 0 0 10px 0 #FAE287` | Hover lift |

Inherits existing `--color-accent-cream*`, `--color-brand-900`,
`--font-montserrat`.

---

## Implementation Notes

### Dependencies
- `<Icon>` primitive: `pencil` + `saa` (not used directly — the SAA PNG
  replaces `saa` for the monogram slot).
- PNG: `public/images/the-le/icon_rule_saa@2x.png` (48×48 @ 24×24
  render, `next/image unoptimized`).
- i18n: `common.fab.open` namespace entry (VI: "Mở menu thao tác nhanh",
  EN: "Open quick actions menu").

### Special Considerations
- **Trigger and expanded menu never co-present** — enforced on the
  expanded side too (FR-012 there, FR-010 here).
- **Mount once at authenticated layout level** — mounting per page would
  stack instances at the same z-50 slot.
- **Pre-launch**: middleware rewrites `/` → `/countdown`, which is
  chromeless — FAB never renders pre-launch by virtue of Homepage not
  rendering at all.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation shipped |
| Confidence Score | High |

### Next Steps

- [ ] Ratify project-wide modal z-index convention (currently assumed ≥
      100; FAB sits at z-50).
- [ ] Resolve Q3 (Figma) — decide whether a pill→menu morph animation
      replaces the current hard swap.
