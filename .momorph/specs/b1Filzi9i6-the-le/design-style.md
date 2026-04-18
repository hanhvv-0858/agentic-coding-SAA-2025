# Design Style: Thể lệ (Event Rules)

**Frame ID**: `b1Filzi9i6`
**Frame Name**: `Thể lệ UPDATE`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/b1Filzi9i6
**Extracted At**: 2026-04-18

---

## Design Tokens

### Colors

Reuses the global SAA 2025 palette (already declared in `src/app/globals.css`
from Homepage / Awards extraction). Only the tokens actually used by this
screen are listed; verify the referenced CSS variables exist in
`globals.css` before implementing.

| Token Name | Hex / rgba | Opacity | Usage |
|------------|------------|---------|-------|
| `--color-brand-900` | `#00101A` (`rgba(0,16,26,1)`) | 100% | Root page background (1440 × 1796) + Viết KUDOS text color |
| **`--color-panel-surface`** *(new)* | `#00070C` (`rgba(0,7,12,1)`) | 100% | Rules panel background (slightly darker than brand-900) |
| `--color-accent-cream` | `#FFEA9E` (`rgba(255,234,158,1)`) | 100% | Headings ("Thể lệ" / section titles / KUDOS QUỐC DÂN), hero tier pill border, Viết KUDOS button bg |
| `--color-accent-cream-hover` | `#FFE586` | 100% | Viết KUDOS hover (**existing token** in `globals.css`) |
| `--color-accent-cream-active` | `#FFDD6B` | 100% | Viết KUDOS active (**existing token** in `globals.css`) |
| `--color-accent-cream-alpha-10` | `rgba(255,234,158,0.10)` | 10% | Đóng button background (secondary/outlined); also `bg-[var(--color-accent-cream)]/10` |
| **`--color-border-secondary`** *(new)* | `#998C5F` | 100% | Đóng button border |
| `--color-text-on-dark` | `#FFFFFF` | 100% | Body copy, tier labels, badge labels |
| `--color-text-shadow-badge` | `rgba(0,0,0,1)` | 100% | Tier label drop shadow (`0 0.447px 1.787px`) |
| `--color-text-shadow-legend` | `#FFFFFF` | 100% | Legend Hero label glow (`0 0 1.505px`) |

> **New tokens to add**:
> - `--color-panel-surface: #00070C;`
> - `--color-border-secondary: #998C5F;`
>
> Both belong in the global tokens block in `src/app/globals.css` alongside
> the existing `--color-brand-*` / `--color-accent-*` declarations.

### Typography

All text uses the site's Montserrat family (already loaded via `next/font`).
Base weights, sizes, and line-heights are pulled 1:1 from
`list_frame_styles`.

| Token / Role | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|--------------|-------------|------|--------|-------------|----------------|-------|
| `--text-panel-title` | Montserrat | 45px | 700 | 52px | 0 | Panel title "Thể lệ" (node `3204:6055`) |
| `--text-section-heading` | Montserrat | 22px | 700 | 28px | 0 | Section titles "NGƯỜI NHẬN KUDOS…" / "NGƯỜI GỬI KUDOS…" (`3204:6132`, `3204:6077`) |
| `--text-quoc-dan-heading` | Montserrat | 24px | 700 | 32px | 0 | "KUDOS QUỐC DÂN" (`3204:6090`) |
| `--text-body-bold` | Montserrat | 16px | 700 | 24px | 0.5px | All body copy — intros, count labels, outro, Quốc Dân body (16px/24px bold, `letter-spacing: 0.5px`) |
| `--text-tier-desc` | Montserrat | 14px | 700 | 20px | 0.1px | Hero tier description one-liner (`3204:6168/6173/6182/6191`) |
| `--text-tier-label` | Montserrat | 13–15px | 700 | 18–19px | 0.094–0.106px | Hero tier pill label (per tier: New 13.2 / Rising 13.2 / Super 13.5 / Legend 14.8). Round to 14px at render. |
| `--text-badge-label-sm` | Montserrat | 12px | 700 | 16px | 0.5px | Short collectible labels (REVIVAL, STAY GOLD) |
| `--text-badge-label-lg` | Montserrat | 11px | 700 | 16px | 0.5px | Long collectible labels (TOUCH OF LIGHT, FLOW TO HORIZON, BEYOND THE BOUNDARY, ROOT FURTHER) |
| `--text-button` | Montserrat | 16px | 700 | 24px | 0.5px | Đóng + Viết KUDOS button labels |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-panel-x` | 40px | Panel horizontal padding (left + right) |
| `--spacing-panel-top` | 24px | Panel top padding |
| `--spacing-panel-bottom` | 40px | Panel bottom padding |
| `--spacing-panel-gap` | 40px | Gap between content block and footer button bar |
| `--spacing-content-gap` | 24px | Gap between sections within the content block |
| `--spacing-section-gap` | 16px | Gap between heading / intro / cards inside a single section |
| `--spacing-badge-grid-gap` | 24px (row) / 16px (col) | Badge grid: 24 px between rows (frame `3204:6080`), 16 px between columns (frame `3204:6081 / 6085`) |
| `--spacing-badge-cell-gap` | 8px | Gap between the badge circle and its label inside a cell |
| `--spacing-button-gap` | 8px | Gap between icon and text inside Đóng / Viết KUDOS |
| `--spacing-footer-gap` | 16px | Gap between Đóng and Viết KUDOS in the footer bar |

### Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-button` | 4px | Đóng + Viết KUDOS |
| `--radius-pill` | ~56px (`55.579px` in Figma) | Hero tier pill (`border-radius: 9999px` is acceptable since width is fixed at 126 px) |
| `--radius-badge` | 9999px (full circle) | 64 × 64 collectible badge medallion |
| `--border-pill` | 0.579px solid `#FFEA9E` | Hero tier pill border (round to 1 px in CSS; Figma uses sub-pixel due to export scale) |
| `--border-secondary-button` | 1px solid `#998C5F` | Đóng button border |
| `--border-badge-circle` | 2px solid `#FFFFFF` | Collectible badge circle outline |

### Shadows / Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--text-shadow-tier-label` | `0 0.447px 1.787px rgba(0,0,0,1)` | New / Rising / Super Hero pill label |
| `--text-shadow-legend-glow` | `0 0 1.505px #FFFFFF` | Legend Hero label glow |
| `--backdrop-dimmer` | `rgba(0,0,0,0.55)` (assumed) | Modal backdrop when panel opens over caller; exact opacity not declared in Figma — mirror the awards overlay dim if that token exists, else use `rgba(0,0,0,0.55)`. |

---

## Layout Specifications

### Container — Root Frame (desktop baseline)

| Property | Value | Notes |
|----------|-------|-------|
| `width` | `1440px` | Figma design viewport only — not a CSS constraint |
| `height` | `1796px` | Figma canvas height is an artefact (panel is 1410 tall + bottom dark gutter). **Implementation MUST use `min-h-dvh`** so the backdrop fills the viewport at any height. |
| `background-color` | `#00101A` (`--color-brand-900`) | Full-viewport dim behind the panel — also acts as backdrop when modal mode |

### Container — Rules Panel (`Thể Lệ` node `3204:6052`)

| Property | Value | Tailwind / CSS |
|----------|-------|----------------|
| `width` | Desktop: fixed `553px` (matches Figma); Tablet / Mobile: see Responsive section | `w-[553px] lg:w-[553px]` |
| `height` | Content-driven, capped at viewport. Figma value `1410px` is the authored height — do NOT hard-code it. | `max-h-dvh` |
| `position` | Right-anchored on desktop (Figma has panel at `left: 887`, `right: 40` in a 1440 canvas → ~40 px gutter from the right edge, full-height). | Desktop modal: fixed right-aligned; tablet/mobile: full-height sheet |
| `padding` | `24px 40px 40px 40px` (top / right / bottom / left) | `pt-6 px-10 pb-10` |
| `gap` | `40px` (between content block and footer) | `gap-10` on the flex container |
| `display` | `flex` column | `flex flex-col` |
| `justify-content` | `space-between` | Footer anchors bottom |
| `align-items` | `flex-end` (content stretches full width inside) | — |
| `background-color` | `#00070C` (`--color-panel-surface`) | `bg-[var(--color-panel-surface)]` |
| `border-radius` | `0px` | Flat edges — no rounding |

### Content Block `A_Nội dung thể lệ` (`3204:6053`)

| Property | Value | Notes |
|----------|-------|-------|
| `width` | `473px` (`553 − 40 − 40`) | Natural width inside panel padding |
| `display` | `flex` column | — |
| `gap` | `24px` | Between Title / Receiver / Sender sections |
| `overflow-y` | `auto` | Scroll when content taller than available height |

### Footer Button Bar `B_Button` (`3204:6092`)

| Property | Value | Notes |
|----------|-------|-------|
| `width` | `473px` | Matches content width |
| `height` | `56px` | Button height |
| `display` | `flex` row | — |
| `gap` | `16px` | Between Đóng and Viết KUDOS |
| `justify-content` | `flex-start` | Đóng is hug-content on the left; Viết KUDOS takes remaining width |

### Layout Structure (ASCII)

```
┌──────────────────────────────────────────────── 1440 px ──────────────────────────────────────────────┐
│                                                                                                      │
│    dimmed backdrop                                               panel (w=553, h=1410)               │
│                                                          ┌─────────────────────────────────────┐    │
│                                                          │ ╎ pt 24 / px 40 / pb 40              │    │
│                                                          │ ┌─────────────────────────────────┐ │    │
│                                                          │ │  Content block (w=473)          │ │    │
│                                                          │ │    Title: "Thể lệ"              │ │    │
│                                                          │ │                                  │ │    │
│                                                          │ │    [Section: Người nhận]        │ │    │
│                                                          │ │      H2 (22/28)                  │ │    │
│                                                          │ │      Intro (16/24 body)          │ │    │
│                                                          │ │      HeroTierCard × 4            │ │    │
│                                                          │ │                                  │ │    │
│                                                          │ │    [Section: Người gửi]         │ │    │
│                                                          │ │      H2 (22/28)                  │ │    │
│                                                          │ │      Intro (16/24 body)          │ │    │
│                                                          │ │      Badge grid 3×2              │ │    │
│                                                          │ │      Outro (16/24 body)          │ │    │
│                                                          │ │                                  │ │    │
│                                                          │ │    [Section: Kudos Quốc Dân]    │ │    │
│                                                          │ │      H3 (24/32)                  │ │    │
│                                                          │ │      Body (16/24)                │ │    │
│                                                          │ └─────────────────────────────────┘ │    │
│                                                          │   — gap 40 —                         │    │
│                                                          │ ┌────────┐ ┌──────────────────────┐ │    │
│                                                          │ │ Đóng   │ │ Viết KUDOS           │ │    │
│                                                          │ │ outline│ │ primary (cream bg)   │ │    │
│                                                          │ └────────┘ └──────────────────────┘ │    │
│                                                          └─────────────────────────────────────┘    │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘

Receiver tier row (HeroTierCard) — 400 × 72:

┌─────────────── 400 ─────────────────┐
│ [ pill 126 × 22 ]  Count label      │   ← row 1 — 20 px tall
│                                      │
│ Description (14/20, 450 × 44)        │   ← row 2 — 44 px tall
└──────────────────────────────────────┘

Badge grid — 2 rows × 3 cols (473 × 240 including padding 0 24 and row gap 16):

┌── cell 80 × 88 ──┐  ┌── cell 80 × 104 ─┐  ┌── cell 80 × 88 ──┐
│  ○ 64 × 64 white │  │  ○ 64 × 64 white │  │  ○ 64 × 64 white │
│  REVIVAL (12/16) │  │  TOUCH OF LIGHT  │  │  STAY GOLD       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         gap 16 →                                   gap 16 →

┌── cell 80 × 104 ─┐  ┌── cell 80 × 120 ─┐  ┌── cell 80 × 104 ─┐
│  ○ 64 × 64 white │  │  ○ 64 × 64 white │  │  ○ 64 × 64 white │
│  FLOW TO HORIZON │  │  BEYOND THE       │  │  ROOT FURTHER    │
│                  │  │  BOUNDARY         │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Component Style Details

### 1. RulesPanel (`Thể Lệ` — `3204:6052`)

| Property | Value | CSS / Tailwind |
|----------|-------|----------------|
| **Node ID** | `3204:6052` | — |
| width | 553px | `w-[553px]` |
| height | content-driven (max = viewport) | `max-h-dvh` |
| padding | 24px 40px 40px | `pt-6 px-10 pb-10` |
| gap | 40px | `gap-10` |
| display | flex column, `justify-content: space-between` | `flex flex-col justify-between` |
| background | `#00070C` | `bg-[var(--color-panel-surface)]` |
| border-radius | 0 | (none) |

When mounted as a modal:
- `role="dialog" aria-modal="true" aria-labelledby="rules-title"`.
- Focus trap + Esc to dismiss.
- Backdrop = `bg-black/55` covering the caller; click closes.

---

### 2. RulesTitle — "Thể lệ" (`3204:6055`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `3204:6055` | — |
| width | 473px | `w-full` |
| height | 52px | — |
| font-family | Montserrat | `font-[family-name:var(--font-montserrat)]` |
| font-size | 45px | `text-[45px]` |
| font-weight | 700 | `font-bold` |
| line-height | 52px | `leading-[52px]` |
| color | `#FFEA9E` | `text-[var(--color-accent-cream)]` |
| text-align | left | `text-left` |
| Semantic | `<h1 id="rules-title">` | — |

---

### 3. Section heading (Người nhận / Người gửi) — `3204:6132`, `3204:6077`

| Property | Value | CSS |
|----------|-------|-----|
| font-size | 22px | `text-[22px]` |
| line-height | 28px | `leading-7` |
| font-weight | 700 | `font-bold` |
| color | `#FFEA9E` | `text-[var(--color-accent-cream)]` |
| text-align | left | — |
| Semantic | `<h2>` | — |

### 4. Quốc Dân heading — `3204:6090`

Same as Section heading except:
- font-size: **24px**, line-height: **32px**.
- Semantic: `<h2>` (same level — the three sections form a sibling set).

---

### 5. Body text (intros, count labels, outros, Quốc Dân body)

Used by nodes `3204:6133`, `3204:6078`, `3204:6089`, `3204:6091`, `3204:6162`,
`3204:6171`, `3204:6180`, `3204:6189`.

| Property | Value |
|----------|-------|
| font-size | 16px |
| line-height | 24px |
| font-weight | 700 |
| letter-spacing | 0.5px |
| color | `#FFFFFF` |
| text-align | `justified` (Figma) — in web, **use `text-left`** (justified breaks readability on narrow viewports) |

### 6. Hero tier description (one-liner under count)

Nodes `3204:6168`, `3204:6173`, `3204:6182`, `3204:6191`.

| Property | Value |
|----------|-------|
| font-size | 14px |
| line-height | 20px |
| font-weight | 700 |
| letter-spacing | 0.1px |
| color | `#FFFFFF` |
| text-align | `left` (Figma "justified" but left reads better; verify with UX) |

---

### 7. HeroTierCard (screen-level organism — 4 variants)

Composition: screen-specific row wrapping the reusable **`<HeroBadge />`**
atom (the pill — shared with Profile + Hover-danh-hiệu overlays per spec
TR-004) plus a count label and a description line.

**Variants**: `new`, `rising`, `super`, `legend`.

| Property | Value |
|----------|-------|
| **Node IDs** | New `3204:6161` · Rising `3204:6170` · Super `3204:6179` · Legend `3204:6188` |
| width | Render as `w-full` inside the 473 px content column. Figma value `400 px` is the hug-content measurement; do NOT hard-code it in CSS. |
| height | `72 px` (content-driven; do not fix — `min-h-[72px]` acceptable if description wraps) |
| layout | Row 1 = `<HeroBadge />` pill + count label (flex row, gap 12); Row 2 = description |

#### `<HeroBadge />` atom (tier pill — nodes `3204:6163` / `6172` / `6181` / `6190`)

| Property | Value |
|----------|-------|
| width | 126.211px → `w-[126px]` |
| height | 22px |
| border | 0.579px solid `#FFEA9E` → render as `border border-[var(--color-accent-cream)]` |
| border-radius | 55.579px → `rounded-full` |
| background | transparent (decorative glow image behind — see Asset Map) |
| text | tier name, centered, Montserrat 14 / 19 bold, color `#FFFFFF`, text-shadow `0 0.447px 1.787px #000` |

Tier-specific label overrides:
- **New Hero**: plain white text, shadow as above.
- **Rising Hero**: identical.
- **Super Hero**: Figma includes a ghost "Super" layer at 66 % opacity behind — cosmetic, single-layer rendering is acceptable.
- **Legend Hero**: additional white glow `text-shadow: 0 0 1.505px #FFFFFF`.

#### Count label (to the right of the pill)

| Property | Value |
|----------|-------|
| font-size | 16 / weight 700 / line-height 24 / ls 0.5 / color #FFFFFF |
| width | hug content |

Count copy per tier (vi):
- New: `Có 1-4 người gửi Kudos cho bạn`
- Rising: `Có 5-9 người gửi Kudos cho bạn`
- Super: `Có 10–20 người gửi Kudos cho bạn`
- Legend: `Có hơn 20 người gửi Kudos cho bạn`

#### Description (full-width, below)

Text-only; see §6 above.

---

### 8. CollectibleBadge (shared atom — 6 variants)

**Variants**: `revival`, `touch-of-light`, `stay-gold`, `flow-to-horizon`,
`beyond-the-boundary`, `root-further`.

| Property | Value |
|----------|-------|
| **Node IDs** | REVIVAL `3204:6082` · TOUCH OF LIGHT `3204:6087` · STAY GOLD `3204:6086` · FLOW TO HORIZON `3204:6083` · BEYOND THE BOUNDARY `3204:6084` · ROOT FURTHER `3204:6088` |
| cell width | 80px |
| cell height | 88 / 104 / 120 (depends on label line count — auto-fits) |
| cell padding | 0 |
| cell gap | 8px (circle → label) |
| cell alignment | `items-center justify-center` (column flex) |

#### Badge circle (inside cell)

| Property | Value |
|----------|-------|
| width / height | 64 × 64 |
| border | `2px solid #FFFFFF` |
| border-radius | `9999px` (full) |
| background | Per-badge PNG/SVG asset, `object-fit: cover` |

#### Badge label

| Property | Value |
|----------|-------|
| font-size | 12px for REVIVAL / STAY GOLD; 11px for the rest (matches Figma) |
| line-height | 16px |
| font-weight | 700 |
| letter-spacing | 0.5px |
| color | `#FFFFFF` |
| text-align | `center` |
| width | 80px |
| allow-wrap | `whitespace-normal` (labels wrap to 2 lines for TOUCH OF LIGHT etc.) |

---

### 9. CloseButton — `B.1_Button đóng` (`3204:6093`)

| Property | Value | Tailwind |
|----------|-------|----------|
| **Node ID** | `3204:6093` | — |
| width | hug content (Figma renders 94 px; allow natural) | `w-auto` |
| height | 56px | `h-14` |
| padding | 16px (all sides) | `px-4 py-4` |
| display | flex row, `align-items:center`, `justify-content:center`, gap 8px | `inline-flex items-center justify-center gap-2` |
| background | `rgba(255,234,158,0.10)` | `bg-[var(--color-accent-cream-alpha-10)]` |
| border | `1px solid #998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 4px | `rounded-[4px]` |
| icon | `<Icon name="close" size={24} />` — white | `text-white` |
| label | "Đóng" / Montserrat 16 / 24 / 700 / ls 0.5 / color `#FFFFFF` | `text-white font-bold tracking-[0.5px]` |

**States**

> **Hover / active values are NOT specified in Figma.** Proposed values below
> align with the existing `PrimaryButton` `outline` variant
> ([src/components/ui/PrimaryButton.tsx](../../../src/components/ui/PrimaryButton.tsx)
> uses `hover:bg-[var(--color-accent-cream)]/10` + `active:bg-.../20`). Note
> that the Đóng button's **default** background is already `alpha-10`, so
> the hover/active ladder here starts one step higher (`/18` and `/25`).
> Confirm during `/momorph.plan` (see spec.md Q8).

| State | Changes |
|-------|---------|
| Hover *(proposed)* | `background: rgba(255,234,158,0.18)` (bump default `alpha-10` → `~alpha-18`) |
| Active *(proposed)* | `background: rgba(255,234,158,0.25)` |
| Focus-visible | `outline: 2px solid var(--color-accent-cream); outline-offset: 2px;` |
| Disabled | `opacity: 0.5; pointer-events: none;` |

---

### 10. WriteKudosButton — `B.2_Button viết kudos` (`3204:6094`)

| Property | Value | Tailwind |
|----------|-------|----------|
| **Node ID** | `3204:6094` | — |
| width | fills remaining (`363 px` in 473 footer) | `flex-1` |
| height | 56px | `h-14` |
| padding | 16px | `px-4 py-4` |
| display | flex row, `align-items:center`, `justify-content:center`, gap 8px | `inline-flex items-center justify-center gap-2` |
| background | `#FFEA9E` | `bg-[var(--color-accent-cream)]` |
| border | none | — |
| border-radius | 4px | `rounded-[4px]` |
| icon | `<Icon name="pen" size={24} />` — `#00101A` | `text-[var(--color-brand-900)]` |
| label | "Viết KUDOS" / Montserrat 16 / 24 / 700 / ls 0.5 / color `#00101A` | `text-[var(--color-brand-900)] font-bold tracking-[0.5px]` |

**States** — use the existing cream tokens already in
[`src/app/globals.css`](../../../src/app/globals.css):

| State | Changes |
|-------|---------|
| Hover | `background: var(--color-accent-cream-hover)` (`#FFE586`) |
| Active | `background: var(--color-accent-cream-active)` (`#FFDD6B`) |
| Focus-visible | `outline: 2px solid white; outline-offset: 2px` (matches existing `PrimaryButton` focus ring) |
| Disabled | `opacity: 0.6; cursor: not-allowed;` (matches existing `PrimaryButton`) |

> **Reuse**: the existing `PrimaryButton` solid variant already uses these
> exact cream tokens for hover/active. Extend it with a `size: "md"` prop
> (`h-14 px-4 py-4 text-base leading-6 rounded-[4px]`) rather than
> duplicating — see spec.md TR-003 / Q10.

---

## Component Hierarchy with Styles

```
RulesPanel
  bg: --color-panel-surface
  w: 553  pt: 24  px: 40  pb: 40  gap: 40  flex-col
│
├── RulesContent  (flex-col, gap: 24, w: 473, overflow-y: auto)
│   │
│   ├── RulesTitle  (<h1 id="rules-title"> · 45/52 bold · --color-accent-cream)
│   │
│   ├── ReceiverSection  (flex-col, gap: 16)
│   │   ├── SectionHeading  (<h2> · 22/28 bold · --color-accent-cream)
│   │   ├── IntroText       (16/24 bold white · ls 0.5)
│   │   ├── HeroTierCard "new"
│   │   ├── HeroTierCard "rising"
│   │   ├── HeroTierCard "super"
│   │   └── HeroTierCard "legend"
│   │
│   ├── SenderSection  (flex-col, gap: 16)
│   │   ├── SectionHeading  (<h2> · 22/28 bold · --color-accent-cream)
│   │   ├── IntroText       (16/24 bold white · ls 0.5)
│   │   ├── BadgeGrid  (flex-col · gap: 24 · px: 24)
│   │   │   ├── Row1  (flex · gap: 16 · justify-between)
│   │   │   │   ├── CollectibleBadge "revival"
│   │   │   │   ├── CollectibleBadge "touch-of-light"
│   │   │   │   └── CollectibleBadge "stay-gold"
│   │   │   └── Row2  (flex · gap: 16 · justify-between)
│   │   │       ├── CollectibleBadge "flow-to-horizon"
│   │   │       ├── CollectibleBadge "beyond-the-boundary"
│   │   │       └── CollectibleBadge "root-further"
│   │   └── OutroText       (16/24 bold white · ls 0.5)
│   │
│   └── NationalKudosSection
│       ├── SectionHeading  (<h2> · 24/32 bold · --color-accent-cream)
│       └── BodyText        (16/24 bold white · ls 0.5)
│
└── RulesFooter  (flex-row, gap: 16, h: 56, w: 473)
    ├── CloseButton   (hug · outline · text white)
    └── WriteKudosButton  (flex-1 · cream bg · text brand-900)
```

---

## Responsive Specifications

### Breakpoints

Per constitution Principle II (locked source of truth):

| Name | Tailwind Prefix | Min Width | Max Width | Panel Behaviour |
|------|-----------------|-----------|-----------|-----------------|
| Mobile | (base) | 0 | 639 px | Full-width panel (`w-full`); `px: 20`; badge grid reflows 2 cols × 3 rows |
| Tablet | `sm:` | 640 px | 1023 px | Centered `max-w-[553px]` modal sheet, `mx-auto`; badge grid 3 × 2 |
| Desktop | `lg:` | 1024 px | ∞ | Figma baseline — right-anchored 553-wide panel, `max-h-dvh`, 3 × 2 badges |

### Responsive Changes

#### Mobile (< 640 px)

| Component | Changes |
|-----------|---------|
| Panel | `w-full`, `min-h-dvh`, `px-5`, `pt-5`, `pb-6` |
| Panel border-radius | 0 (full-bleed modal sheet) |
| Title "Thể lệ" | `text-[36px] leading-[44px]` (down from 45 / 52 — avoid overflow at 320 px) |
| BadgeGrid | 2-col × 3-row; `gap: 16` both axes; cells remain 80 wide |
| Footer | `flex-col` stack; both buttons `w-full`, Đóng on top (matches mobile sheet convention) — **confirm with UX (spec Q6)** |
| Touch targets | All buttons ≥ 44 × 44 px (already satisfied at h=56) |

#### Tablet (≥ 640 px and < 1024 px, `sm:` → `lg:`)

| Component | Changes |
|-----------|---------|
| Panel | `sm:max-w-[553px]`, `sm:mx-auto`, `sm:px-10`, `sm:pt-6`, `sm:pb-10` (matches desktop padding) |
| BadgeGrid | 3 × 2 (same as desktop) |
| Footer | `sm:flex-row` (restores side-by-side) |

#### Desktop (≥ 1024 px, `lg:`)

| Component | Changes |
|-----------|---------|
| Panel | Right-anchored (`lg:ml-auto`), fixed width `lg:w-[553px]`, `lg:mr-10` (40 px gutter per Figma) |
| Backdrop | `rgba(0,0,0,0.55)` covering caller |

---

## Icon Specifications

All icons use the project `<Icon />` component (per constitution Principle V /
spec TR-002). Sizes match Figma (24 × 24).

| Icon Registry Name | Size | Color | Usage | Figma Node ID | Status |
|--------------------|------|-------|-------|---------------|--------|
| `close` *(new)* | 24 × 24 | `currentColor` (resolves to white on Đóng) | CloseButton leading icon | `I3204:6093;186:2759` (Figma layer name `MM_MEDIA_Close`) | **NOT in registry — must be added** to [`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx) as part of this screen's work |
| `pencil` | 24 × 24 | `currentColor` (resolves to `--color-brand-900`) | WriteKudosButton leading icon | `I3204:6094;186:1763` (Figma layer name `MM_MEDIA_Pen`) | Already in registry — reuse. Figma layer name is "Pen" but the project name is `pencil`. |

Registry verified at
[`src/components/ui/Icon.tsx:3–16`](../../../src/components/ui/Icon.tsx#L3-L16).
Icons currently registered: `flag-vn`, `chevron-down`, `google`, `globe`,
`spinner`, `bell`, `pencil`, `arrow-right`, `arrow-up-right`, `saa`,
`target`, `diamond`, `license`.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Modal panel | `transform: translateX(100%) → 0`, `opacity 0 → 1` | 200 ms | `ease-out` | Open |
| Modal panel | Reverse | 150 ms | `ease-in` | Close |
| Backdrop | `opacity 0 → 0.55` | 200 ms | `ease-out` | Open |
| Đóng button | `background-color` | 150 ms | `ease-in-out` | Hover / active |
| Viết KUDOS button | `background-color` | 150 ms | `ease-in-out` | Hover / active |

All motion is suppressed when `prefers-reduced-motion: reduce`.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|----------------|---------------|----------------|-----------------|
| Rules panel surface | `3204:6052` | `w-[553px] flex flex-col justify-between pt-6 px-10 pb-10 gap-10 bg-[var(--color-panel-surface)]` | `<RulesPanel>` (screen root) |
| Panel title | `3204:6055` | `text-[45px] leading-[52px] font-bold text-[var(--color-accent-cream)]` | `<h1 id="rules-title">` |
| Section heading (22/28) | `3204:6132`, `3204:6077` | `text-[22px] leading-7 font-bold text-[var(--color-accent-cream)]` | `<h2>` |
| Quốc Dân heading (24/32) | `3204:6090` | `text-2xl leading-8 font-bold text-[var(--color-accent-cream)]` | `<h2>` |
| Body text (16/24 bold) | `3204:6133`, `3204:6078`, `3204:6089`, `3204:6091` etc. | `text-base leading-6 font-bold tracking-[0.5px] text-white` | `<p>` |
| Hero tier description (14/20) | `3204:6168/6173/6182/6191` | `text-sm leading-5 font-bold tracking-[0.1px] text-white` | Inside `<HeroTierCard>` |
| Hero tier pill | `3204:6163/6172/6181/6190` | `inline-flex items-center justify-center w-[126px] h-[22px] rounded-full border border-[var(--color-accent-cream)]` | `<HeroBadge tier="..."/>` |
| Collectible badge circle | `I3204:6082/6083/...` | `w-16 h-16 rounded-full border-2 border-white overflow-hidden` | Inside `<CollectibleBadge name="..."/>` |
| Collectible badge cell | `3204:6082/6083/6084/6086/6087/6088` | `flex flex-col items-center gap-2 w-20` | `<CollectibleBadge>` |
| Badge grid | `3204:6079 / 6080` | `flex flex-col gap-6 px-6` | `<BadgeGrid>` |
| Badge row | `3204:6081 / 6085` | `flex flex-row justify-between gap-4` | Inner row in `<BadgeGrid>` |
| Footer button bar | `3204:6092` | `flex flex-row gap-4 h-14 w-full` | `<RulesFooter>` |
| Close button | `3204:6093` | `inline-flex items-center gap-2 px-4 py-4 h-14 rounded-[4px] border border-[var(--color-border-secondary)] bg-[var(--color-accent-cream)]/10 text-white font-bold tracking-[0.5px] hover:bg-[var(--color-accent-cream)]/18 active:bg-[var(--color-accent-cream)]/25` | `<PrimaryButton variant="secondary" size="md">` (pending Q10 resolution) |
| Viết KUDOS button | `3204:6094` | `flex-1 inline-flex items-center justify-center gap-2 px-4 py-4 h-14 rounded-[4px] bg-[var(--color-accent-cream)] text-[var(--color-brand-900)] font-bold tracking-[0.5px] hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)]` | `<PrimaryButton variant="solid" size="md">` (extend existing with `size="md"`) |

---

## Notes

- **Body-copy weight**: Figma marks `font-weight: 700` across nearly all
  body copy. However, the shipped Awards page uses `font-normal` (400) for
  paragraph text
  (`src/components/awards/AwardContent.tsx:50`). This spec defers to the
  open question **spec.md Q11** — recommendation is `font-normal` to match
  the Awards precedent, keeping `font-bold` only for: section headings,
  hero tier pill labels, hero tier count labels, badge labels, button
  labels. If Q11 resolves to follow Figma, swap globally by updating the
  body-copy Tailwind utility in a single commit.
- `text-align: justified` appears multiple times in Figma. **Do not
  justify** in web rendering — readability drops on narrow viewports and
  Vietnamese line-breaking rules don't align with CSS justification. Use
  `text-left`. Open question — see spec.md Q7.
- **Spelling — "ROOT FURTHER"**: Figma layer name has a typo
  (`MM_MEDIA_ Badge ROOT FUTHER`, node `3204:6088`), but the actual rendered
  character on the badge is `ROOT FURTHER` (correct). All spec documents and
  i18n keys use the correct spelling `root-further` / `ROOT FURTHER`. Open
  question — see spec.md Q9.
- Hero tier pill shows a subtle glow image (`Root further mo rong 2/3`)
  behind the label. It's an aesthetic flourish. Two options:
    1. Render as a background PNG inside the pill (decorative, `aria-hidden`).
    2. Approximate with a CSS `background-image: radial-gradient(...)`.
  Resolve during Plan phase; prefer option 1 for fidelity if the asset is
  already exported to `/public/images/the-le/pill-glow.png`.
- Collectible badges in Figma are layered image composites (circle + 2–3
  image layers). Deliverable for implementation is **one flattened image per
  badge** — request from Design (Q2).
- Color contrast at `#FFEA9E` on `#00070C` = ~11.9:1 → passes WCAG AAA for
  normal text. White on `#00070C` = 20+:1 → passes AAA. No contrast issues.
- All icons **MUST BE** rendered via the shared `<Icon />` component.
- Panel dimensions (553 × 1410) come from a 1440-wide artboard; at full
  viewport ≥ 1440 px the panel occupies the right third. At 1024–1439 px
  we still right-anchor the panel; at < 1024 px use the mobile/tablet
  adaptation above.

---

## Asset Map (to be finalised during Plan)

| Asset | Current location | Needed deliverable | Notes |
|-------|------------------|---------------------|-------|
| Pill glow bg (New / Rising / Super) | Figma (`3007:17507` etc. — images) | `/public/images/the-le/pill-glow.png` — single flattened tile | Single asset; all tiers reuse it |
| Legend pill bg | Figma (`3053:7682/7672`) | `/public/images/the-le/pill-glow-legend.png` | Distinct (Legend tier has a different glow + small decoration) |
| Collectible badge × 6 | Figma (`737:20446` etc.) | `/public/images/the-le/badge-{revival,touch-of-light,stay-gold,flow-to-horizon,beyond-the-boundary,root-further}.png` | Flattened, transparent bg where possible |
| `close` icon | Existing `<Icon name="close" />` | — | Verify registered |
| `pen` icon | Existing `<Icon name="pen" />` | — | Verify registered |

Record final paths + sizes in `assets-map.md` when Plan phase runs.
