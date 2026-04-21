# Design Style: Dropdown Hashtag Filter

**Frame ID**: `721:5580` (wrapper) / `563:8026` (dropdown panel)
**Frame Name**: `Dropdown Hashtag filter`
**Screen ID**: `JWpsISMAaM`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JWpsISMAaM
**Extracted At**: 2026-04-21

---

## Design Tokens

### Colors

| Token Name | Hex Value | Opacity | Usage |
|------------|-----------|---------|-------|
| `--color-details-container-2` | `#00070C` | 100% | Dropdown panel fill (`563:8026` background) |
| `--color-details-border` | `#998C5F` | 100% | Dropdown 1 px border (`563:8026` stroke) |
| `--color-accent-cream` | `#FFEA9E` | 10% | **Selected** item background fill (`rgba(255,234,158,0.10)`) |
| `--color-accent-cream-glow` | `#FAE287` | 100% | **Selected** item text-shadow glow color |
| `--color-schemes-on-primary` | `#FFFFFF` | 100% | Default + selected item text |
| `--color-shadow-soft` | `rgba(0,0,0,0.25)` | 25% | Selected item text-shadow drop |

> The Figma design-system tokens `Details-Container-2`,
> `Details-Border`, and `Schemes/On-Primary` are already mapped
> on the project palette — no new CSS custom properties needed.
> The existing `--color-accent-cream` (`#FFEA9E`, used on the
> Live board) covers the selected tint with a `/10` Tailwind
> opacity modifier.

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|------------|-------------|------|--------|-------------|----------------|
| `--text-dropdown-item` | Montserrat | 16 px | 700 | 24 px (150 %) | 0.5 px |

Used on every hashtag item. Figma `character` examples:
`#Dedicated`, `#Inspring`. Selected state inherits the same
family + weight; it adds a text-shadow, not a weight/size bump.

### Spacing

| Token Name | Value | Usage |
|------------|-------|-------|
| `--spacing-panel-padding` | 6 px | Outer panel padding (`563:8026`) |
| `--spacing-item-padding` | 16 px | Inside each item (`525:13508`, `525:14864`, …) |
| `--spacing-item-gap` | 4 px | Gap between the text atom and any leading icon row |
| `--spacing-item-row-gap` | 0 px | Vertical gap between items (items butt up against each other) |

### Border & Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| `--radius-dropdown-panel` | 8 px | Outer `563:8026` panel |
| `--radius-dropdown-item` | 4 px | Individual item (`525:*`) |
| `--border-width-dropdown` | 1 px | Panel stroke |

### Shadows

| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-selected-text` | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` | Text-shadow on selected-item label (Figma raw) |
| `--shadow-popover` | `0 8px 24px rgba(0,0,0,0.35)` | **Added** — gives the popover visible elevation over the hero/page background (not in Figma source; derived from Live board card shadow) |

---

## Layout Specifications

### Container (`563:8026` dropdown panel)

| Property | Value | Notes |
|----------|-------|-------|
| width | 215 px (desktop) | Figma wrapper width; hug content when item labels are shorter |
| max-width | 260 px | Guards against long labels pushing past chip width |
| max-height | `min(640px, calc(100vh - chip.bottom - 16px))` | Scroll internally past that |
| border | 1 px solid `#998C5F` | Cream border |
| border-radius | 8 px | Panel radius |
| background | `#00070C` | Near-black navy |
| padding | 6 px | Outer padding around the list |
| display | flex | — |
| flex-direction | column | — |
| align-items | flex-start | Items left-align inside the panel |
| position | absolute (anchored to chip) | `top: chip.bottom + 8px; left: chip.left` |
| z-index | 50 | Above feed cards, below global toasts |

### Item row (`525:13508`, `525:14864`, `525:14791`, …)

| Property | Value | Notes |
|----------|-------|-------|
| height | 56 px | Fixed row height |
| width | hug-content (min 118 px, max 183 px) | Per Figma: `#Inspring` → 118 px, `#Dedicated` → 135 px — we'll cap at panel width minus padding so long labels wrap |
| padding | 16 px | All sides |
| border-radius | 4 px | Item radius |
| display | flex | — |
| flex-direction | row | — |
| align-items | center | — |
| gap | 4 px | — |
| cursor | pointer | — |

### Layout Structure (ASCII)

```
┌─────────────────────────── 215 px ────────────────────────────┐
│  panel (bg #00070C, border 1px #998C5F, radius 8, p 6)        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  item (Selected)                                        │  │
│  │  h 56, w hug, p 16, radius 4, bg cream/10               │  │
│  │     #Dedicated  ←  Montserrat 16/24/700, white          │  │
│  │                     text-shadow drop+glow               │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  item (Default)                                         │  │
│  │  h 56, w hug, p 16, radius 4, bg transparent            │  │
│  │     #Inspring   ←  Montserrat 16/24/700, white          │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  item (Default)  —  #Dedicated                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  item (Default)  —  #Dedicated                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  item (Default)  —  #Inspring                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  item (Default)  —  #Inspring                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ···  (scrolls internally when the remaining 7 items overflow)│
└───────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### HashtagDropdown panel

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `563:8026` | — |
| width | 215 px (design); clamp 200–260 px in code | `w-[215px] max-w-[260px]` |
| padding | 6 px | `p-1.5` |
| background | `#00070C` | `bg-[var(--color-details-container-2,#00070C)]` |
| border | 1 px solid `#998C5F` | `border border-[var(--color-details-border,#998C5F)]` |
| border-radius | 8 px | `rounded-lg` |
| display | flex col + items-start | `flex flex-col items-start` |
| box-shadow | `0 8px 24px rgba(0,0,0,0.35)` | `shadow-[0_8px_24px_rgba(0,0,0,0.35)]` |
| position | absolute | `absolute z-50` |
| z-index | 50 | — |
| transform-origin | top-left (chip anchor) | — |

### HashtagItem — Default

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `525:14864` / `525:14791` / `525:15060` / `525:13538` / `525:15061` | — |
| width | hug (min 118 px) | `w-full` (fills panel) or `w-auto` (original hug) |
| height | 56 px | `h-14` |
| padding | 16 px | `p-4` |
| border-radius | 4 px | `rounded` |
| display | flex + items-center + gap-1 | `flex items-center gap-1` |
| font-family | Montserrat | `font-[family-name:var(--font-montserrat)]` |
| font-size | 16 px | `text-base` |
| font-weight | 700 | `font-bold` |
| line-height | 24 px | `leading-6` |
| letter-spacing | 0.5 px | `tracking-[0.5px]` |
| color | `#FFFFFF` | `text-white` |
| background | transparent | `bg-transparent` |
| cursor | pointer | `cursor-pointer` |

**States:**

| State | Property | Value |
|-------|----------|-------|
| Default | background | transparent |
| Hover | background | `rgba(255,234,158,0.08)` (cream/8) |
| Focus-visible | outline | `2px solid var(--color-accent-cream)`, offset 2 |
| Selected | background | `rgba(255,234,158,0.10)` (cream/10) |
| Selected | text-shadow | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` |

### HashtagItem — Selected (A.1, `525:13508`)

Same structure as Default with these overrides:

| Property | Value | CSS |
|----------|-------|-----|
| background | `rgba(255,234,158,0.10)` | `bg-[var(--color-accent-cream)]/10` |
| text-shadow | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` | `[text-shadow:_0_4px_4px_rgba(0,0,0,0.25),_0_0_6px_#FAE287]` |
| border-radius | 4 px | `rounded` (unchanged) |
| aria-selected | `true` | — |

---

## Component Hierarchy with Styles

```
HashtagDropdown (role=listbox, absolute, z-50)
├── panel <div>
│   bg: var(--color-details-container-2) → #00070C
│   border: 1px solid var(--color-details-border) → #998C5F
│   radius: 8px, padding: 6px, flex-col items-start
│   shadow: 0 8px 24px rgba(0,0,0,0.35)
│
│   └── list <ul role="listbox">
│       flex-col, gap: 0
│       overflow-y-auto (kicks in past max-height)
│
│       ├── HashtagItem (role=option, aria-selected=true)  ← selected
│       │   h: 56px, p: 16px, radius: 4px
│       │   bg: rgba(255,234,158,0.10)
│       │   text: Montserrat 16/24/700 white
│       │   text-shadow: 0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287
│       │
│       ├── HashtagItem (role=option)  ← default
│       │   same geometry, bg transparent, no text-shadow
│       │
│       └── … (11 more items, one per hashtag slug)
```

---

## Responsive Specifications

### Breakpoints

| Name | Min Width | Behaviour |
|------|-----------|-----------|
| Mobile | 0–767 px | FilterBar hidden on `/kudos` — dropdown not reachable. Out of scope for this spec. |
| Tablet | 768–1023 px | Dropdown opens as on desktop; `max-width` clamps at 260 px so it doesn't cover the feed card. |
| Desktop | ≥ 1024 px | Design target. 215 px panel anchored to chip. |

### Responsive Changes

#### Desktop / Tablet

No layout change between tablet and desktop. Dropdown always
positions at `chip.bottom + 8px` and left-aligns with the chip.
`max-height` prevents bottom-clip on short viewports
(`max-height: calc(100vh - chipBottom - 16px)` with internal
scroll).

#### Mobile (< 768 px) — Out of scope

A future bottom-sheet variant will replace the popover when the
FilterBar ships on mobile. Tracked in the spec's **Out of Scope**
list.

---

## Icon Specifications

| Icon Name | Size | Color | Usage |
|-----------|------|-------|-------|
| — | — | — | No icons in this screen (text-only labels). |

> The Figma wrapper (`721:5580`) contains a gray background
> `rgba(105,105,105,1)` at a full 215 × 410 — that's the
> **annotation canvas** of the Figma artboard, not a real
> component. The real dropdown is `563:8026` inside it.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Dropdown panel | `opacity` + `translateY` | 150 ms | `ease-out` | Open (from `opacity: 0, translateY(-4px)` → `1, 0`) |
| Dropdown panel | `opacity` | 100 ms | `ease-in` | Close |
| Item hover | `background-color` | 120 ms | `ease-in-out` | Hover in/out |
| Focus ring | `outline-width` | instant | — | Focus-visible toggle |

`prefers-reduced-motion: reduce` → all three durations collapse to 0 ms.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|----------------|---------------|-----------------|-----------------|
| Dropdown panel | `563:8026` | `absolute z-50 flex flex-col items-start rounded-lg border border-[var(--color-details-border,#998C5F)] bg-[var(--color-details-container-2,#00070C)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]` | `<HashtagDropdown />` |
| Item (Default) | `525:14864` / `525:14791` / `525:15060` / `525:13538` / `525:15061` | `flex h-14 w-full items-center gap-1 rounded p-4 font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.5px] text-white hover:bg-[var(--color-accent-cream)]/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]` | `<HashtagItem />` |
| Item (Selected) | `525:13508` | above + `bg-[var(--color-accent-cream)]/10 [text-shadow:_0_4px_4px_rgba(0,0,0,0.25),_0_0_6px_#FAE287]` | `<HashtagItem selected />` |
| Empty state | — (not in Figma) | `p-6 text-sm text-white/60` | `<EmptyState variant="hashtagFilterEmpty" />` |

Existing code that OWNS this UI today:

- [src/components/kudos/FilterDropdown.tsx](../../../src/components/kudos/FilterDropdown.tsx)
  — Generic popover combobox parameterised by
  `kind: "hashtag" | "department"`. **Will be redesigned in-place**
  (not forked per kind) so that both Hashtag AND Department
  dropdowns adopt the dark-navy visual from this Figma source.
  User confirmed Path A on 2026-04-21:
  - Panel fill: `#00070C` (from `#FFF9E8`)
  - Panel border: `#998C5F` (unchanged token name `--color-border-secondary`)
  - Item text: white (from navy `--color-brand-900`)
  - Selected item: `bg-[var(--color-accent-cream)]/10` + text-shadow glow
  - Hover: `bg-[var(--color-accent-cream)]/8`
  - "All hashtags" / "All departments" virtual first option: **remove** — the new design clears the filter via toggle-off on the currently-selected item (FR-003 in spec.md); the active chip ✕ button remains as an alternative clear path.

- [src/components/kudos/FilterBar.tsx](../../../src/components/kudos/FilterBar.tsx)
  — Composes two `FilterDropdown`s + active chip row + "Clear all"
  link. Already wires `router.replace()` + analytics
  (`kudos_filter_apply`). **No changes required** here.

- [src/app/kudos/actions.ts](../../../src/app/kudos/actions.ts)
  `getKudoHashtags()` — action body update required (signature
  unchanged). Resolves `label` from `label_vi` / `label_en` based
  on the current locale. See spec.md §API Dependencies §Migration
  Plan for the DDL + code snippet.

### Department filter — inherits the new dark visual

Path A means `FilterDropdown` with `kind="department"` also
renders in the dark-navy style. No separate Figma source exists
for the dark Department variant — extrapolate from this spec:
same panel chrome, same item rows, same state tokens. Item
labels come from `Department.label` (locale-resolved by
`getKudoDepartments()`; the display is the VN or EN name, NOT
a `#` prefix).

---

## Notes

- **Selected fill strength — visual sanity check**: the raw
  Figma `fills[0]` returns `rgba(255,234,158,0.10)` (10 % alpha).
  In the rendered frame PNG the selected row LOOKS stronger than
  10 % due to the added text-shadow glow + drop + the high
  contrast navy base. Keep the 10 % value — the perceived
  "brighter" look comes from the shadow layers, not the fill.

- The Figma source shows only 6 items in the 410 px panel; the
  canonical Q4 2025 dataset has **13 hashtags** (user-confirmed
  2026-04-21). Implementation MUST scroll internally past the
  panel's `max-height` (see spec US4). Keep the scrollbar visible
  in Firefox (`scrollbar-width: thin`) and styled in WebKit
  (`scrollbar-color: #998C5F #00070C`).
- Cream border color `#998C5F` differs slightly from the Live
  board's `#FFEA9E` accent-cream. These are **different tokens**
  in the Figma design system (Details-Border vs Accent-Cream);
  keep them separate in CSS even though both read as "cream".
- The selected item's cream-tint background (`10%` alpha) is the
  same alpha we already apply on `KudoPostCard` hairline hovers;
  use the existing `--color-accent-cream` + Tailwind `/10`
  modifier rather than introducing a new token.
- All icons **MUST BE** in an **Icon Component** (project
  convention) — but this screen has no icons, so no Icon imports
  are added.
- Ensure the popover doesn't get clipped by the
  `overflow-x-hidden` on `<main>` — set `overflow: visible` on the
  FilterBar wrapper or render the popover via a portal to `<body>`.
