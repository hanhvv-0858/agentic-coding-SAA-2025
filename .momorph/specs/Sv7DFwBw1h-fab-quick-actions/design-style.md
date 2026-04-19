# Design Style: Floating Action Button – Expanded (Quick Actions)

**Frame ID**: `Sv7DFwBw1h`
**Frame Name**: `Floating Action Button - phim nổi chức năng 2`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/Sv7DFwBw1h
**Companion frame**: `_hphd32jN2` (collapsed state — spec'd at [../_hphd32jN2-fab-collapsed/](../_hphd32jN2-fab-collapsed/))
**Extracted At**: 2026-04-19

---

## Overview

This frame describes the **expanded state** of the authenticated-shell
Floating Action Button. When the user clicks the collapsed FAB
(`_hphd32jN2`), the widget opens into a vertical stack of three tiles,
right-aligned, in a fixed bottom-right anchor:

1. `A_Button thể lệ` — secondary action, opens Thể lệ route
2. `B_Button viết kudos` — primary action, opens Viết Kudo route
3. `C_Button huỷ` — circular red "cancel", collapses back to the FAB

The frame itself is drawn on a 1440×1024 canvas, but the widget is
always absolutely positioned — Figma canvas bg is a display artefact,
**not a real page background**.

---

## Design Tokens

Colours all reuse existing tokens. **Two new additions are proposed**
(shared with the collapsed-state spec):

1. `--text-fab` — shared typography alias used for tile labels here
   and the "/" separator on the collapsed pill. Montserrat 700 24/32.
2. `--shadow-fab-tile` — drop-shadow for all three tiles. Figma did
   not emit shadow values for this frame but the screen description
   says "có shadow nhẹ"; the value below is **confirmed by Design
   during plan review (Q2 ✅, 2026-04-20)**.

The collapsed-state spec introduces `--shadow-fab-pill` (composite drop
+ glow) for the trigger; intentionally a different shadow from
`--shadow-fab-tile` because the values are different.

### Colors

| Token Name | Hex Value | Opacity | Usage |
|------------|-----------|---------|-------|
| `--color-accent-cream` | `#FFEA9E` | 100% | Background of A + B tiles |
| `--color-accent-cream-hover` | `#FFE586` | 100% | Hover state on A + B tiles |
| `--color-accent-cream-active` | `#FFDD6B` | 100% | Active/pressed state on A + B tiles |
| `--color-nav-dot` (`#D4271D`) | `#D4271D` | 100% | Background of C (cancel) tile |
| `--color-brand-900` | `#00101A` | 100% | Label + icon color on A + B tiles |
| `#FFFFFF` | `#FFFFFF` | 100% | Icon color on C (cancel) tile |

**Note on `--color-nav-dot`**: introduced in the Awards System work as
the red indicator dot on nav items. Re-used here intentionally — both
cases are the same brand red for a destructive / attention accent.

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|------------|-------------|------|--------|-------------|----------------|-------|
| `--text-fab` | Montserrat | 24px | 700 | 32px | 0 | Tile labels here; also the "/" separator on the collapsed pill. Shared token. |

Labels are centered within the remaining tile width after the icon.

### Spacing

| Token Name | Value | Usage |
|------------|-------|-------|
| `--spacing-sm` | 8px | Gap between icon and label inside A + B |
| `--spacing-md` | 16px | Internal padding on A + B + C |
| `--spacing-lg` | 20px | Vertical gap between A↔B and B↔C |
| Fixed-anchor offset | 24px | Distance from viewport right + bottom edge (project convention — not literal from Figma; see "Positioning" below) |

### Border & Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| `--radius-sm` | 4px | Corner radius of A + B tiles |
| `--radius-full` | 100px (effectively 50% of 56px) | C tile — perfect circle |

### Shadows

Figma `list_frame_styles` did not report explicit drop shadows on any
of the three tiles. The screen-spec description text for C mentions
"có shadow nhẹ" (light shadow). Apply project-standard FAB shadow:

| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-fab-tile` | `0 8px 24px rgba(0, 0, 0, 0.35)` | All three tiles; keeps them readable on any page background. **Confirmed by Design (Q2 ✅, 2026-04-20).** |

---

## Layout Specifications

### Container (the expanded menu)

| Property | Value | Notes |
|----------|-------|-------|
| position | fixed | Always pinned to viewport |
| right | 24px | Project convention (matches current `QuickActionsFab`) |
| bottom | 24px | Project convention |
| width | 214px | Width of the widest child (B) |
| height | 224px | 64 + 20 + 64 + 20 + 56 |
| display | flex | — |
| flex-direction | column | Stacked top-to-bottom |
| align-items | flex-end | Right-justify every child |
| gap | 20px | Between children |
| padding | 0 | — |
| z-index | 50 | Above page content, below modals (match existing FAB) |

### Positioning

The Figma frame uses `position: absolute` with pixel offsets measured
from the 1440×1024 canvas. **Do not copy those values**. Use
`position: fixed` with `right-6 bottom-6` (24px) to match the existing
`QuickActionsFab` prototype — same anchor, zero regression.

### Layout Structure (ASCII)

```
viewport
                                                    ┌────────────────────────┐
                                                    │                        │
                                                    │   Page content         │
                                                    │                        │
                                                    │                        │
                                                    │           ┌──────────┐ │
                                                    │           │ [ic] Thể │ │  ← A 149×64
                                                    │           │      lệ  │ │
                                                    │           └──────────┘ │
                                                    │   ┌──────────────────┐ │
                                                    │   │ [pen] Viết KUDOS │ │  ← B 214×64
                                                    │   └──────────────────┘ │
                                                    │                 ┌────┐ │
                                                    │                 │ ×  │ │  ← C 56×56
                                                    │                 └────┘ │
                                                    └────────────────────────┘
                                                          ↑ right: 24px, bottom: 24px
```

Vertical spacing: 64 + **20** + 64 + **20** + 56 = 224px total height.

---

## Component Style Details

### A — `A_Button thể lệ`

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I313:9140;214:3799` | — |
| **Component set** | `186:1426` (Widget Button variants) | — |
| width | 149px | `w-[149px]` |
| height | 64px | `h-16` |
| padding | 16px | `p-4` |
| background | `#FFEA9E` | `bg-[var(--color-accent-cream)]` |
| border-radius | 4px | `rounded` (Tailwind) or `rounded-sm` |
| gap (icon ↔ label) | 8px | `gap-2` |
| display | flex row, align-center, justify-start | `flex flex-row items-center justify-start` |
| box-shadow | `var(--shadow-fab-tile)` | `shadow-[var(--shadow-fab-tile)]` |

**Icon**: Custom PNG asset **`/images/the-le/icon_rule_saa@2x.png`**
(48×48 @2x, displayed at 24×24). Confirmed by Design 2026-04-20 (Q4
✅) — the Figma `MM_MEDIA_LOGO` component is a styled rules-tile glyph,
not the generic Sun* monogram. Ship via `next/image`:

```tsx
<Image
  src="/images/the-le/icon_rule_saa@2x.png"
  alt=""           // decorative — label text announces the action
  width={24}
  height={24}
  unoptimized      // 1 KB PNG, bypass Next image optimizer
/>
```

**Label**: `"Thể lệ"` · Montserrat 700 24/32 · color `#00101A` ·
text-align center inside the remaining 108px × 32px.

**States:**
| State | Changes |
|-------|---------|
| Default | `background: #FFEA9E` |
| Hover | `background: #FFE586` (`--color-accent-cream-hover`) |
| Active | `background: #FFDD6B` (`--color-accent-cream-active`) |
| Focus-visible | `outline: 2px solid #FFFFFF; outline-offset: 2px` (match existing FAB) |
| Disabled | _not applicable — always enabled when menu is open_ |

### B — `B_Button viết kudos`

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I313:9140;214:3732` | — |
| **Component set** | `186:1426` | — |
| width | 214px | `w-[214px]` |
| height | 64px | `h-16` |
| padding | 16px | `p-4` |
| background | `#FFEA9E` | `bg-[var(--color-accent-cream)]` |
| border-radius | 4px | `rounded-sm` |
| gap (icon ↔ label) | 8px | `gap-2` |
| display | flex row, align-center, justify-start | same as A |
| box-shadow | `--shadow-fab-tile` | same as A |

**Icon**: `MM_MEDIA_Pen` — maps to the existing `pencil` icon in
[src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx).
24×24, color `#00101A`.

**Label**: `"Viết KUDOS"` · Montserrat 700 24/32 · color `#00101A` ·
150px × 32px text field, centered within.

**States:** identical to A.

### C — `C_Button huỷ`

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I313:9140;214:3827` | — |
| **Component set** | `186:1426` | — |
| width | 56px | `w-14` |
| height | 56px | `h-14` |
| padding | 16px | `p-4` |
| background | `#D4271D` | `bg-[var(--color-nav-dot)]` |
| border-radius | 100px (fully circular) | `rounded-full` |
| display | flex, center | `flex items-center justify-center` |
| box-shadow | `--shadow-fab-tile` | same as A |

**Icon**: `MM_MEDIA_Close` — maps to the existing `close` icon added
during the Thể lệ UPDATE work in
[src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx).
24×24, color `#FFFFFF`.

**Label**: none (icon-only button). Requires `aria-label="Đóng"` (vi) /
`"Close"` (en).

**States:**
| State | Changes |
|-------|---------|
| Default | `background: #D4271D` |
| Hover | `background: color-mix(in srgb, #D4271D 92%, #000)` (~`#C1241A`) |
| Active | `background: color-mix(in srgb, #D4271D 85%, #000)` (~`#B42218`) |
| Focus-visible | `outline: 2px solid #FFFFFF; outline-offset: 2px` |

---

## Component Hierarchy with Styles

```
QuickActionsMenu (fixed bottom-6 right-6, flex flex-col items-end gap-5, z-50)
├── RuleShortcutButton (w-[149px] h-16 p-4 gap-2 bg-[var(--color-accent-cream)] rounded-sm shadow-[var(--shadow-fab-tile)])
│   ├── <Image src="/images/the-le/icon_rule_saa@2x.png" width={24} height={24} unoptimized />
│   └── span — Montserrat 700 24/32 text-[var(--color-brand-900)] "Thể lệ"
│
├── ComposeShortcutButton (w-[214px] h-16 p-4 gap-2 bg-[var(--color-accent-cream)] rounded-sm shadow-[var(--shadow-fab-tile)])
│   ├── Icon name="pencil" size={24} className="text-[var(--color-brand-900)]"
│   └── span — Montserrat 700 24/32 text-[var(--color-brand-900)] "Viết KUDOS"
│
└── CancelButton (w-14 h-14 p-4 rounded-full bg-[var(--color-nav-dot)] shadow-[var(--shadow-fab-tile)])
    └── Icon name="close" size={24} className="text-white"
```

---

## Responsive Specifications

### Breakpoints

Per constitution §II:
| Name | Min Width | Max Width |
|------|-----------|-----------|
| Mobile | 0 | 639px |
| Tablet | 640px | 1023px |
| Desktop | 1024px | ∞ |

### Responsive Changes

#### Mobile (< 640px)

| Component | Changes |
|-----------|---------|
| Menu container | `right: 16px; bottom: 16px` — tighter margin on cramped viewports |
| A (Thể lệ) | width: `auto` / `min-content` — keep 149px on devices ≥ 360px, shrink to `fit-content` below if needed |
| B (Viết KUDOS) | width: 214px — do not shrink the primary action label |
| C (Cancel) | width/height: 56px — meets 44×44 touch-target minimum with comfortable margin |
| Box-shadow | unchanged |

Total height 224px + 16px × 2 offsets = still fits any phone viewport.

#### Tablet (640px – 1023px) and Desktop (≥ 1024px)

No visual change — dimensions hold. Right/bottom offset stays at 24px.

#### Touch targets

All three buttons ≥ 44×44: A (149×64), B (214×64), C (56×56). ✓

---

## Icon Specifications

| Asset | Size | Color | Usage | Source |
|-------|------|-------|-------|--------|
| `/images/the-le/icon_rule_saa@2x.png` | 48×48 (rendered 24×24) | baked into PNG | **A tile** (Thể lệ — matches `MM_MEDIA_LOGO`) | New PNG asset in `public/images/the-le/` |
| `pencil` | 24×24 | `#00101A` | B tile (matches `MM_MEDIA_Pen`) | Already in `Icon.tsx` |
| `close` | 24×24 | `#FFFFFF` | C tile (matches `MM_MEDIA_Close`) | Already in `Icon.tsx` |

Note: the `saa` monogram in `Icon.tsx` is kept for other consumers
(Homepage FAB trigger pill, footer logo). The Thể lệ tile uses a
dedicated PNG glyph, not the monogram.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Menu open | `opacity`, `transform: translateY(8px → 0)` | 150ms | `ease-out` | Click on collapsed FAB |
| Menu close | `opacity`, `transform: translateY(0 → 8px)` | 120ms | `ease-in` | Click Cancel / Esc / outside-click |
| Tile background | `background-color` | 150ms | `ease-in-out` | Hover / active |
| Tile outline | `outline`, `outline-offset` | 0ms (instant) | — | Focus-visible |

If `prefers-reduced-motion: reduce`, skip the open/close transform and
opacity-only fade at 80ms.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|----------------|---------------|----------------|-----------------|
| Menu container | `313:9140` | `fixed bottom-6 right-6 z-50 flex flex-col items-end gap-5` | `<QuickActionsFab>` root (extend existing) |
| A – Thể lệ tile | `I313:9140;214:3799` | `flex items-center gap-2 w-[149px] h-16 p-4 bg-[var(--color-accent-cream)] rounded-sm shadow-[var(--shadow-fab-tile)] hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2` | new `<QuickActionTile iconNode={<Image src="/images/the-le/icon_rule_saa@2x.png" …/>} href="/the-le">` |
| B – Viết KUDOS tile | `I313:9140;214:3732` | same as A but `w-[214px]` | new `<QuickActionTile icon="pencil" href="/kudos/new">` |
| C – Cancel button | `I313:9140;214:3827` | `flex items-center justify-center w-14 h-14 p-4 rounded-full bg-[var(--color-nav-dot)] shadow-[var(--shadow-fab-tile)] hover:brightness-95 active:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2` | inline `<button>` within `<QuickActionsFab>`, `aria-label` from i18n |
| Labels | `I313:9140;214:3799;186:1568` (A), `I313:9140;214:3732;186:1568` (B) | `font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-brand-900)]` | plain `<span>` |

---

## Notes

- All three tiles share the same `186:1426` component set (Widget
  Button) in Figma — in code we'll keep them as distinct
  `QuickActionTile` instances so their hrefs + labels stay typed rather
  than mapping an enum through a generic component.
- `--shadow-fab-tile` was proposed from the design description ("có
  shadow nhẹ") since Figma's styles output did not include a drop
  shadow. Value `0 8px 24px rgba(0, 0, 0, 0.35)` confirmed by Design
  during plan review (Q2 ✅, 2026-04-20).
- The existing `QuickActionsFab` prototype (single-item dark dropdown)
  must be **replaced** — it does not match this frame. The Homepage
  SAA implementation will swap to this expanded design as part of the
  new component's integration.
- No new i18n keys required beyond `common.fab.open`, `common.fab.rules`,
  `common.fab.writeKudo`, `common.fab.close` — add under a new
  `common.fab.*` namespace.
