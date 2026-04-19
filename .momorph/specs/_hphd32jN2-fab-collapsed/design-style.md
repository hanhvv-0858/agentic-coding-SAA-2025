# Design Style: Floating Action Button – Collapsed (Trigger)

**Frame ID**: `_hphd32jN2`
**Frame Name**: `Floating Action Button - phim nổi chức năng`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/_hphd32jN2
**Companion frame**: `Sv7DFwBw1h` (expanded state — already spec'd at [../Sv7DFwBw1h-fab-quick-actions/](../Sv7DFwBw1h-fab-quick-actions/))
**Extracted At**: 2026-04-20

---

## Overview

This frame defines the **collapsed / entry state** of the authenticated-
shell Floating Action Button. It's the small pill button a user sees
pinned to the bottom-right of the viewport; clicking it opens the
expanded menu (`Sv7DFwBw1h`).

The pill is an **icon-only trigger** — three glyphs stacked
horizontally:

```
[pen]  /  [saa-logo]
```

There is no text label. The "/" is typographic (Montserrat 700 24/32),
acting as a visual separator, not a navigation slash.

The canvas around the pill in Figma (1440×1024, dark) is a display
backdrop — **the pill renders over whatever page is behind it**.

---

## Design Tokens

Colours + fonts all reuse existing tokens. **Two new additions are
proposed** in this spec, both shared with the expanded-menu spec:

1. `--text-fab` — shared typography token for both the "/" separator
   here and the tile labels in the expanded menu. Same computed value
   (Montserrat 700 24/32); a single alias keeps the two specs in lock-
   step.
2. `--shadow-fab-pill` / `--shadow-fab-pill-hover` — composite pill
   shadow. Figma emits an exact value, so we elevate it to a token
   rather than inlining at call sites.

A third token (`--shadow-fab-tile`) lives on the expanded-menu side —
different values, different purpose — see that spec's Shadows
section.

### Colors

| Token Name | Hex Value | Opacity | Usage |
|------------|-----------|---------|-------|
| `--color-accent-cream` | `#FFEA9E` | 100% | Pill background (default) |
| `--color-accent-cream-hover` | `#FFE586` | 100% | Pill background on hover |
| `--color-accent-cream-active` | `#FFDD6B` | 100% | Pill background on press |
| `--color-brand-900` | `#00101A` | 100% | Icon + "/" color |
| `#FAE287` (raw hex) | `#FAE287` | 100% | Warm cream glow layer inside `--shadow-fab-pill` / `--shadow-fab-pill-hover` — not a standalone colour token |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|------------|-------------|------|--------|-------------|----------------|-------|
| `--text-fab` | Montserrat | 24px | 700 | 32px | 0 | The "/" separator here; also tile labels in the expanded menu (`Sv7DFwBw1h`). Shared token. |

### Spacing

| Token Name | Value | Usage |
|------------|-------|-------|
| `--spacing-sm` | 8px | Gap between pen ↔ "/" ↔ saa inside the pill |
| `--spacing-md` | 16px | Internal padding of the pill (all sides) |
| Fixed-anchor offset | 24px (desktop/tablet) · 16px (mobile) | Distance from viewport right + bottom edge — project convention, matches `Sv7DFwBw1h` expanded menu |

### Border & Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| `--radius-full` | 100px (effectively fully rounded for a 64px tall pill) | Pill corner radius |

### Shadows

Figma reports a **composite shadow** with two layers:

```
box-shadow:
  0 4px 4px 0 rgba(0, 0, 0, 0.25),
  0 0 6px 0 #FAE287;
```

The first layer is a standard drop-shadow (25% black, 4px offset, 4px
blur). The second is a 6px warm-cream glow on all sides — a gentle
"branded" halo effect that makes the pill read as interactive without
a border.

| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-fab-pill` | `0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287` | Collapsed pill, default state (drop + warm cream glow) |
| `--shadow-fab-pill-hover` | `0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 0 10px 0 #FAE287` | Hover — stronger lift. Matches Figma "hover: Bóng nhẹ" intent. **Confirmed by Design during plan review (Q1 ✅, 2026-04-20).** |

---

## Layout Specifications

### Container (the pill itself)

| Property | Value | Notes |
|----------|-------|-------|
| position | fixed | Pinned to viewport, not page flow |
| right | 24px | Project convention. Figma canvas anchor is `right: 19px` (artefact of the 1440×1024 mock); use 24 for parity with expanded menu |
| bottom | 24px | Same reasoning |
| width | 106px | Fixed — hugs content + padding |
| height | 64px | Fixed |
| padding | 16px | All sides |
| display | flex | — |
| flex-direction | row | — |
| align-items | center | Vertically centers pen / "/" / logo |
| justify-content | flex-start | — |
| gap | 8px | Between children |
| background | `#FFEA9E` | `bg-[var(--color-accent-cream)]` |
| border-radius | 100px | `rounded-full` |
| box-shadow | see `--shadow-fab-pill` above | composite drop + glow |
| z-index | 50 | Above page content, below modals — matches expanded menu and `QuickActionsFab` current prototype |

### Layout Structure (ASCII)

```
viewport
                                                         ┌─────────────────────────┐
                                                         │                         │
                                                         │   page content          │
                                                         │                         │
                                                         │            ┌──────────┐ │
                                                         │            │[pen] / ✨│ │ ← pill 106×64
                                                         │            └──────────┘ │
                                                         └─────────────────────────┘
                                                               ↑ right: 24px
                                                               ↑ bottom: 24px
```

Detail inside the pill (content box 74×32 after 16px padding):

```
┌────────── 106px ──────────┐
│  16px                16px │  ┐
│   ┌────────── 74 ──────┐  │  │
│   │ [pen] "/" [saa]    │  │  64px (32px content row centered)
│   └────────────────────┘  │  │
│                           │  ┘
└───────────────────────────┘
      24      8  10  8  24     ← px: pen-w, gap, "/"-w, gap, saa-w ≈ total 74
```

---

## Component Style Details

### Collapsed FAB pill

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `313:9138` (wrapper) → `I313:9138;214:3839` (inner "Button") | — |
| **Component set** | `186:1426` (Widget Button variants) | — |
| width | 106px | `w-[106px]` or `w-auto` + children content |
| height | 64px | `h-16` |
| padding | 16px | `p-4` |
| background | `#FFEA9E` | `bg-[var(--color-accent-cream)]` |
| border | none | `border-0` |
| border-radius | 100px | `rounded-full` |
| gap | 8px | `gap-2` |
| cursor | pointer | `cursor-pointer` |
| box-shadow | composite (drop + cream glow) | `shadow-[var(--shadow-fab-pill)]` |

**Children (L → R)**:

1. **Pen icon** (`I313:9138;214:3839;186:1763`)
   - 24×24, color `#00101A`
   - Reuse `<Icon name="pencil" size={24} />` (already in `Icon.tsx`)
   - Design item maps to `MM_MEDIA_Pen` / `componentId=214:3812`

2. **"/" separator** (`I313:9138;214:3839;186:1568`)
   - TEXT node · `character: "/"` · Montserrat 700, 24/32, color `#00101A`
   - Width 10px, height 32px · `text-align: center`
   - Implement as `<span>` with `--text-fab` spec; do NOT use an icon

3. **Rule/SAA glyph** (`I313:9138;214:3839;186:1766`)
   - 24×24 rendered · 48×48 source
   - Design-provided PNG: **`/images/the-le/icon_rule_saa@2x.png`**
     (Q4 ✅ resolved 2026-04-20 — same glyph as the Thể lệ tile in the
     expanded menu; NOT the Sun* monogram from `<Icon name="saa">`).
   - Ship via `next/image` with `unoptimized` (1 KB PNG):
     ```tsx
     <Image
       src="/images/the-le/icon_rule_saa@2x.png"
       alt=""
       width={24}
       height={24}
       unoptimized
     />
     ```
   - Design item maps to `MM_MEDIA_LOGO` / `componentId=214:3752`

**States:**

| State | Property | Value |
|-------|----------|-------|
| Default | background | `#FFEA9E` |
| | box-shadow | `var(--shadow-fab-pill)` |
| Hover | background | `#FFE586` |
| | box-shadow | `var(--shadow-fab-pill-hover)` (stronger lift) |
| Active (pressed) | background | `#FFDD6B` |
| | box-shadow | default (no lift) |
| Focus-visible | outline | `2px solid #FFFFFF` + `outline-offset: 2px` |
| Expanded (`aria-expanded="true"`) | optional | Same as default — the visual "is open" indicator is the expanded menu appearing *above* the pill, not a pill appearance change |
| Disabled | N/A | The FAB is never disabled in MVP |

---

## Component Hierarchy with Styles

```
QuickActionsFabTrigger (fixed bottom-6 right-6 z-50)
└── button[aria-label, aria-expanded, aria-haspopup="menu"]
    (h-16 px-4 rounded-full bg-[var(--color-accent-cream)]
     flex items-center gap-2 cursor-pointer
     shadow-[var(--shadow-fab-pill)]
     hover:bg-[var(--color-accent-cream-hover)]
     hover:shadow-[var(--shadow-fab-pill-hover)]
     active:bg-[var(--color-accent-cream-active)]
     focus-visible:outline focus-visible:outline-2
     focus-visible:outline-white focus-visible:outline-offset-2
     transition-[background-color,box-shadow] duration-150 ease-in-out)
    ├── Icon name="pencil" size={24} className="text-[var(--color-brand-900)]"
    ├── span — Montserrat 700 24/32 text-[var(--color-brand-900)] "/"
    └── <Image src="/images/the-le/icon_rule_saa@2x.png" alt="" width={24} height={24} unoptimized />
```

---

## Responsive Specifications

Per constitution §II:

| Name | Min Width | Max Width |
|------|-----------|-----------|
| Mobile | 0 | 639px |
| Tablet | 640px | 1023px |
| Desktop | 1024px | ∞ |

### Responsive Changes

| Breakpoint | Changes |
|-----------|---------|
| Mobile (< 640px) | Pill: width 106px, height 64px — unchanged. Anchor: `right-4 bottom-4` (16px) instead of 24px. |
| Tablet (640–1023px) | No change from desktop. |
| Desktop (≥ 1024px) | Default spec — `right-6 bottom-6` (24px). |

Touch target: the full 106×64 area is well above 44×44 on any
breakpoint. ✓

---

## Icon Specifications

| Asset | Size | Color | Usage | Source |
|-------|------|-------|-------|--------|
| `pencil` | 24×24 | `#00101A` | Left glyph — maps to `MM_MEDIA_Pen` | Already in `Icon.tsx` |
| `/images/the-le/icon_rule_saa@2x.png` | 48×48 source, rendered 24×24 | baked into PNG | Right glyph — maps to `MM_MEDIA_LOGO`. Shared with the expanded-menu Thể lệ tile. Q4 ✅ 2026-04-20 | PNG asset in `public/images/the-le/` |

Note: the `saa` monogram entry in `Icon.tsx` remains for other
consumers (e.g., future footer logo, brand mark placements). The FAB
trigger and the Thể lệ tile both use the PNG instead.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Pill | `background-color`, `box-shadow` | 150ms | `ease-in-out` | Hover / active |
| Pill | `outline`, `outline-offset` | instant | — | Focus-visible |

Under `prefers-reduced-motion: reduce`, keep the hover/active style
changes but skip the 150ms transition (instant).

The pill itself does **not** animate when expanding the menu — the
appearance/disappearance is the job of the expanded menu container
(`Sv7DFwBw1h`'s spec defines that 8px slide + fade).

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|----------------|---------------|----------------|-----------------|
| Pill wrapper (outer, for shadow) | `313:9138` | `fixed bottom-6 right-6 z-50` | root `<div>` of `<QuickActionsFab>` |
| Pill button (inner, clickable) | `I313:9138;214:3839` | see Component Hierarchy block above | `<button>` inside `<QuickActionsFab>` |
| Pen icon | `I313:9138;214:3839;186:1763` | — | `<Icon name="pencil" size={24} />` |
| "/" separator | `I313:9138;214:3839;186:1568` | `font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-brand-900)]` | inline `<span>"/"</span>` |
| Rule/SAA glyph | `I313:9138;214:3839;186:1766` | — | `<Image src="/images/the-le/icon_rule_saa@2x.png" alt="" width={24} height={24} unoptimized />` |

---

## Notes

- **Prototype alignment**: the existing
  [src/components/homepage/QuickActionsFab.tsx](../../../src/components/homepage/QuickActionsFab.tsx)
  already renders this exact pill (pen + "/" + saa) with
  `h-16 bg-accent-cream rounded-full`. The only gaps vs this spec:
  - Current prototype lacks the composite `--shadow-fab-pill` glow
    (`0 0 6px 0 #FAE287`).
  - Hover currently only changes background, not shadow.
  - Menu dropdown content is wrong — see the expanded-state spec for
    what replaces it.
- **Why keep the "/" as text**: Figma defines it as a 10px TEXT node,
  not an icon. Keeping it as typographic `<span>` avoids a new SVG,
  preserves font metrics, and matches the design intent (a thin
  separator, not a bold glyph).
- **Shadow layer ordering matters** — CSS renders later layers above
  earlier ones. Figma's order is `drop → glow`; we preserve that in the
  inlined arbitrary value so the glow halos around the drop shadow,
  not underneath it.
- **`aria-expanded` does not change visual**: per spec of
  `Sv7DFwBw1h`, the "open" indicator is the menu appearing above. The
  pill stays visually identical whether menu is open or closed. Keep
  `aria-expanded` on the `<button>` element for screen-reader state.
