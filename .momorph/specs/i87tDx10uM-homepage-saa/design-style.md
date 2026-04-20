# Design Style: Homepage SAA 2025

**Frame ID**: `i87tDx10uM` (Figma node `2167:9026`)
**Frame Name**: `Homepage SAA`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**Reference Image**: [assets/frame.png](assets/frame.png)
**Extracted At**: 2026-04-17

> Tokens are inherited from [Login design-style](../GzbNeVGJHz-login/design-style.md)
> where possible. This doc only lists Homepage-specific additions and deltas.
> Per-node styles (exact pixel paddings for each card, countdown tile inner
> metrics, etc.) will be fetched during implementation via `list_frame_styles`
> targeted at specific sub-nodes — this doc captures the layout-level truth.

---

## Design Tokens (additions / deltas vs. Login)

### Colors

All tokens from Login still apply. New/confirmed:

| Token Name | Hex Value | Source | Usage |
|------------|-----------|--------|-------|
| `--color-bg-primary` | `#00101A` | Frame background (same as Login) | Page background |
| `--color-bg-header` | `#101417` @ 80% | Header `rgba(16,20,23,0.8)` — minor hue shift vs. Login's `#0B0F12` | Translucent header over hero |
| `--color-accent-cream` | `#FFEA9E` | Widget button, CTA active state (same as Login) | Primary CTA fill, highlights |
| `--color-bg-card` | `#0B1419` **(derived)** | Dark cards (Root Further block, Award cards, Sun* Kudos block) | Card surfaces |
| `--color-card-border-gold` | `#FFEA9E` @ ~40% **(derived)** | Award card thin gold/cream outline visible in reference | Award card borders |
| `--color-divider` | `#2E3940` | Footer border-top (same as Login) | Horizontal dividers |
| `--gradient-hero-cover` | `linear-gradient(12deg, #00101A 23.7%, rgba(0,18,29,0.46) 38.34%, rgba(0,19,32,0) 48.92%)` | Hero overlay (`2167:9029`) | Reading legibility over key visual |

### Typography

**All values below are extracted verbatim from `list_frame_styles` on the
Homepage frame — no derivations.** Hero title "ROOT FURTHER" is **NOT text** —
it's the `root-further.png` image asset (same one reused from Login). Same
goes for the big "KUDOS" decorative text inside the promo illustration.

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Figma Source | Color |
|------------|-------------|------|--------|-------------|----------------|--------------|-------|
| `--text-section-title` | Montserrat | **57px** | 700 | 64px | -0.25px | `2167:9073` "Hệ thống giải thưởng" · `I3390:10349;313:8422` "Sun* Kudos" | cream `#FFEA9E` |
| `--text-display-lg` | Montserrat | **24px** | 700 | 32px | 0 | Section caption, "Coming soon", countdown labels, event values, promo caption | white or cream |
| `--text-body-bold` | Montserrat | 16px | 700 | 24px | +0.15px or +0.5px (context-dependent) | Nav labels, event info, footer links, CTA stream note | white |
| `--text-body-regular` | Montserrat | 16px | 400 | 24px | +0.5px | Award card description, Root Further body paragraph (partial) | white |
| `--text-body-medium` | Montserrat | 16px | 500 | 24px | +0.15px | "Chi tiết" links on award cards | white |
| `--text-nav-link` | Montserrat | **14px** | 700 | 20px | +0.1px | Header nav "Award Information", "Sun* Kudos" | white |
| `--text-card-title` | Montserrat | 24px | **400** | 32px | 0 | Award card titles — note THIN weight, unusual | cream `#FFEA9E` |
| `--text-hero-subtitle` | Montserrat | 24px | 700 | 32px | 0 | "Comming soon" hero subtitle (sic — Figma has 2x m typo, confirm with design) | white |
| `--text-cta` | Montserrat | 22px | 700 | 28px | 0 | ABOUT AWARDS / ABOUT KUDOS / widget "/" | dark navy (cream btn) / white (outlined btn) |
| `--text-event-value` | Montserrat | 24px | 700 | 32px | 0 | "26/12/2025" date · "Âu Cơ Art Center" venue | cream `#FFEA9E` |
| `--text-event-label` | Montserrat | 16px | 700 | 24px | +0.15px | "Thời gian:" · "Địa điểm:" labels | white |
| `--text-footer-copyright` | Montserrat Alternates | 16px | 700 | 24px | 0 | Footer © 2025 | white |
| `--text-countdown-number` | **Digital Numbers** | **49.152px** | 400 | — | 0 | Countdown tile digits | white |
| `--text-countdown-decorative-kudos` | SVN-Gotham | 96.16px | 400 | 24px | -13% | Big "KUDOS" in Sun\* Kudos promo illustration — decorative, render inside the SVG/PNG asset, not as live text | beige `#DBD1C1` |

> **New font dependencies** vs. Login:
> - **Digital Numbers** — custom display font for countdown digits. License + source
>   TBD; see Open Questions. Fallback: `font-family: "Courier New", monospace` with
>   `font-variant-numeric: tabular-nums`.
> - **SVN-Gotham** — only appears as decorative "KUDOS" text that's baked into the
>   promo illustration (treat as static image asset; no live text render).

### Spacing

New spacing tokens (in addition to Login's scale):

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xl` | 32px | Card inner padding, small block gap |
| `--space-2xl` | 40px | B3 CTA row gap; Root Further content outer padding top |
| `--space-3xl` | 48px | Footer nav link gap |
| `--space-4xl` | 64px | Header left-column gap (logo ↔ nav) |
| `--space-5xl` | 80px | Section-to-section vertical gap |
| `--space-6xl` | 96px | Hero outer vertical padding (inherited from Login `--space-9`) |
| `--space-7xl` | 104px | Root Further content inner horizontal padding |
| `--space-8xl` | 120px | Hero → content frame top gap |
| `--space-page-inset` | 144px | Page horizontal inset (inherited from Login) |
| `--space-header-gap` | 238px | Header justify-between gap at 1440 (inherited) |

### Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-card` | 8px | Root Further block, Award cards |
| `--radius-pill` | 100px | Widget Button |
| `--radius-button-md` | 8px | Primary CTA (same as Login) |

### Shadows

Same as Login: **no explicit drop-shadows** in Figma — elevation via translucent
surfaces + gradient vignettes.

---

## Layout Specifications

### Container

| Property | Value |
|----------|-------|
| Design viewport | 1512 × 4480 px (scrolls vertically) |
| Page horizontal inset | 144 px (same as Login) |
| Content max-width | 1224 px |
| Section gap (vertical) | 120 px |

### Z-order

1. `MM_MEDIA_Keyvisual BG` — hero artwork behind everything
2. `Cover` — gradient overlay over hero (readability)
3. `A1_Header` — translucent navbar floating on top (z-40, same pattern as Login)
4. `Bìa` — all body sections, stacking vertically
5. `7_Footer` — copyright footer
6. `6_Widget Button` — fixed floating CTA (position: fixed bottom-right)

### Layout Structure (ASCII — desktop 1512×4480)

```
┌─────────────────────────────────────────────────────────────────┐
│  A1_Header (1512×80, padding 12 144, bg #101417/80)             │
│  [LOGO 52×48]  [About SAA 2025] [Award Information] [Sun* Kudos]│
│                             [🔔 40×40] [VN 108×56] [👤 40×40]   │
├─────────────────────────────────────────────────────────────────┤
│  Hero (Keyvisual) — 1512×1392                                   │
│                                                                 │
│   ┌───────────── Bìa inner — padding 96 144 ───────────────┐    │
│   │  ROOT (huge display)                                   │    │
│   │  FURTHER                                                │    │
│   │                                                          │    │
│   │  Comming soon  (sic — Figma typo)                       │    │
│   │  ┌──────┐  ┌──────┐  ┌──────┐  (Digital Numbers 49.15px)│    │
│   │  │  02  │  │  18  │  │  45  │                           │    │
│   │  └──────┘  └──────┘  └──────┘                           │    │
│   │    DAYS      HOURS    MINUTES  (24/32/700 Montserrat)   │    │
│   │                                                          │    │
│   │  Thời gian: 26/12/2025   Địa điểm: Âu Cơ Art Center     │    │
│   │  Tường thuật trực tiếp qua sóng Livestream              │    │
│   │                                                          │    │
│   │  [ABOUT AWARDS (cream) ]   [ABOUT KUDOS (outlined)]     │    │
│   └──────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  B4 content — "Root Further" — Frame 486                        │
│  1152×1219, padding 120 104, radius 8, dark card                │
│  ┌──────────────────────────────────────────────────┐  2025     │
│  │  ROOT                                            │  (vert    │
│  │  FURTHER                                         │  text)    │
│  │                                                   │           │
│  │  …long descriptive paragraph…                    │           │
│  └──────────────────────────────────────────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  Hệ thống giải thưởng — 1224×1353, gap 80                       │
│                                                                 │
│  C1 Header Giải thưởng                                          │
│  · caption "Sun* annual awards 2025"                            │
│  · title  "Hệ thống giải thưởng"                                │
│  · desc   "Các hạng mục sẽ được trao giải theo TOP…"            │
│                                                                 │
│  C2 Award list — 3×2 grid, 1224×1144                            │
│  ┌─ C2.1 Top Talent ─┐ ┌─ C2.2 Top Project ─┐ ┌─ C2.3 TPL ──┐   │
│  │  square image      │ │  square image       │ │  square img │   │
│  │  Title             │ │  Title              │ │  Title      │   │
│  │  Desc              │ │  Desc               │ │  Desc       │   │
│  │  Chi tiết  →       │ │  Chi tiết →         │ │  Chi tiết → │   │
│  └───────────────────┘ └────────────────────┘ └─────────────┘   │
│  ┌─ C2.4 Best Mgr ───┐ ┌─ C2.5 Signature ───┐ ┌─ C2.6 MVP ───┐  │
│  │                    │ │                     │ │              │  │
│  └───────────────────┘ └────────────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  D1 Sunkudos — 1224×500                                         │
│  ┌───────────────────────────┐ ┌────────────────┐               │
│  │ Phong trào ghi nhận        │ │                │               │
│  │ Sun* Kudos                 │ │   KUDOS art    │               │
│  │ descriptive paragraph      │ │                │               │
│  │ [Chi tiết →]               │ │                │               │
│  └───────────────────────────┘ └────────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  7_Footer — 1512, padding 40 90                                 │
│  [LOGO 69×64]   About · Awards · Sun* Kudos · Tiêu chuẩn       │
│                 Bản quyền thuộc về Sun* © 2025                  │
└─────────────────────────────────────────────────────────────────┘

Floating, absolute position:
   6_Widget Button (106×64, radius 100, cream, bottom-right)
```

---

## Component Style Details

### 1. Page Frame (`2167:9026`)

| Property | Value | Tailwind |
|----------|-------|----------|
| width × height | 1512 × 4480 (desktop) | `w-full min-h-screen` |
| background | `#00101A` | `bg-brand-900` |
| position | `relative` | `relative` |

### 2. A1_Header (`2167:9091`)

Same component as Login's `<SiteHeader />` but with **3 nav links** instead of
just the language toggle. Size 1512×80, padding 12 144, bg `rgba(16,20,23,0.8)`,
`z-40`. Flex row, justify-between.

| Slot | Node ID | Content |
|------|---------|---------|
| Logo | `I2167:9091;178:1033` — A1.1_LOGO | SAA 2025 logo, 52×48 |
| Nav | Frame 476 (`I2167:9091;178:653`) | 3 links: About SAA 2025 (selected/yellow), **Award Information** (singular, per Figma), Sun\* Kudos |
| Right cluster | Frame 482 (`I2167:9091;186:1601`) | Bell (40×40) · Language (108×56) · Profile icon (40×40) |

> **Header scroll behavior**: Homepage is 4480 px tall. Unlike Login (short
> page, `absolute` header), Homepage MUST use **`position: sticky; top: 0`**
> so the nav remains accessible during scroll (per spec FR-015).

Nav link states (see full matrix in §Component States Documentation below):
Normal · Hover · Selected (aria-current="page") · Focus-visible (4 states).

### 3. Hero Keyvisual (`2167:9027` → `2167:9028` image, `2167:9029` gradient)

Full-bleed background PNG 1512×1392; gradient overlay `Cover` applies the
12° linear gradient for readability.

### 4. Hero content group (`2167:9031` Frame 487)

1224×596 inside `Bìa` (padding 96 144). Contains:
- `2167:9032` Frame 482 (1224×200, gap 10) — "ROOT FURTHER" hero title + "Coming soon"
- `2167:9034` Frame 523 (1224×256, gap 16) — B1 Countdown + B2 Event info
- `2167:9062` B3_Call-To-Action (570×60, gap 40) — two CTAs side-by-side

### 5. B1_Countdown (`2167:9035` → `2167:9037` B1.3_Countdown)

3 tiles (Days/Hours/Minutes), each a `FRAME` 2-digit number + uppercase unit
label below. Tile node IDs:
- `2167:9038` B1.3.1 Days
- `2167:9043` B1.3.2 Hours
- `2167:9048` B1.3.3 Minutes

Per-tile typography confirmed from `list_frame_styles`:

- Number: **Digital Numbers** 49.152px / weight 400 / white
- Label: **Montserrat** 24px / 32px line-height / weight 700 / white
- Tile frame/padding: not explicitly extracted — implement as `flex flex-col
  items-center gap-2`; each tile ~120px wide.

### 6. B3 CTAs (`2167:9062`)

| Button | Node ID | State in Figma | Visual |
|--------|---------|----------------|--------|
| ABOUT AWARDS | `2167:9063` B3.1 | **hover** | Cream fill, dark text (same as Login CTA hover) |
| ABOUT KUDOS | `2167:9064` B3.2 | **normal** | Outlined, cream border, cream text |

Both buttons share the `Button-IC About` pattern — reuse [PrimaryButton](../../../src/components/ui/PrimaryButton.tsx) primitive with a new **outlined** variant.

### 7. B4_content — Root Further description (`3204:10152` Frame 486 + `5001:14827` B4)

Dark card 1152×1219, padding 120 104, radius 8, gap 32 inside. Contains big
"ROOT FURTHER" title + paragraph body. A "2025" vertical label sits to the
right (likely a decorative overlay).

### 8. Hệ thống giải thưởng section (`2167:9068`)

Section wrapper 1224×1353, gap 80.

- **C1_Header Giải thưởng** (`2167:9069`) — 1224×129, gap 16. 3 stacked text
  rows: caption / title / description.
- **C2_Award list** (`5005:14974`) — 1224×1144. Grid of 6 cards (Top Talent,
  Top Project, Top Project Leader, Best Manager, Signature 2025 Creator, MVP).

### 9. Award Card (`C2.1` pattern, `2167:9075`)

Each card has:
- Square image (Picture-Award) — gold/cream-bordered with glow
- Title: **Montserrat 24px / 32px / weight 400** (regular, NOT bold — see Open
  Q13; flagged as unusual), color cream `#FFEA9E`
- Description: Montserrat 16px / 24px / weight 400 / +0.5px / white, **max
  2 lines** with `-webkit-line-clamp: 2` + `overflow: hidden` +
  `text-overflow: ellipsis`
- "Chi tiết →" Button-IC (text link with arrow icon) — Montserrat 16/24/500/
  +0.15px / white

All 6 cards render the same pattern with different content. Card click, image
click, title click, and "Chi tiết" all navigate to `/awards#<slug>` with
hash matching the slug of the category.

### 10. D1_Sunkudos promo (`3390:10349`)

1224×500 block with left text column + right illustration. Text includes:
- "Phong trào ghi nhận" (small caption)
- "Sun* Kudos" (big title)
- Description paragraph
- "Chi tiết →" CTA button

### 11. 7_Footer (`5001:14800`)

Same footer as Login but with nav links:
- Logo (69×64) — click returns to Homepage top (FR-014)
- "About SAA 2025" · **"Award Information"** (singular) · "Sun\* Kudos" · "Tiêu chuẩn chung"
- Copyright "Bản quyền thuộc về Sun\* © 2025" (Montserrat Alternates 16/24 700)

### 12. 6_Widget Button (`5022:15169`)

Pill 106×64, radius 100 (full), bg cream `#FFEA9E`, padding 16, gap 8.
Floating fixed to bottom-right across all authenticated pages.

Contains:
- Pencil icon (left) + "/" separator + SAA icon (right)

Click opens a quick-action menu (out of scope for Homepage spec — menu comes
from its own Figma spec later).

---

## Implementation Mapping

New components to add (reuse what exists from Login where possible):

| Design Element | Figma Node | Tailwind / CSS | React Component |
|----------------|------------|----------------|-----------------|
| Page shell | `2167:9026` | `relative min-h-screen bg-brand-900` | `<HomePage />` (Server Comp) |
| Hero background image | `2167:9028` | `absolute inset-0 -z-0` | reuse `<KeyVisualBackground />` from login — generalize |
| Hero cover gradient | `2167:9029` | `absolute inset-0 z-10 bg-[linear-gradient(...)]` | inline |
| Header | `2167:9091` | `absolute inset-x-0 top-0 h-20 flex items-center justify-between z-40 bg-[#101417]/80 backdrop-blur px-36 py-3` | **enhance** `<SiteHeader />` to accept nav items prop |
| Nav link | `I2167:9091;186:1579` · `.1587` · `.1593` | `text-white hover:text-[var(--color-accent-cream)] aria-current:text-[var(--color-accent-cream)] aria-current:underline` | `<NavLink />` (new) |
| Notification bell | `I2167:9091;186:2101` | `h-10 w-10 flex items-center justify-center hover:bg-white/10 rounded` | `<NotificationBell />` (new) |
| Profile icon | `I2167:9091;186:1597` | same size + rounded; opens dropdown-profile (`721:5223`) | `<ProfileMenu />` (new) |
| Countdown tile | `2167:9038/9043/9048` | `flex flex-col items-center gap-2` + inner tile | `<CountdownTile />` (new) |
| Countdown root | `2167:9037` | `flex items-end gap-6 sm:gap-10` | `<Countdown />` (new, client component — ticks every minute) |
| Event info | `2167:9053` | `flex flex-col gap-2 text-white` | inline |
| Primary CTA (cream) | `2167:9063` | reuse `<PrimaryButton />` | — |
| Outlined CTA | `2167:9064` | **new variant**: `border-2 border-accent-cream text-accent-cream bg-transparent` | extend `<PrimaryButton variant="outline">` |
| Root Further card | `3204:10152` + `5001:14827` | `rounded-lg bg-[var(--color-bg-card)] py-[120px] px-[104px]` | `<RootFurtherCard />` (new) |
| Awards section | `2167:9068` | `flex flex-col gap-20 w-full max-w-[1224px]` | `<AwardsSection />` (new) |
| Awards header | `2167:9069` | `flex flex-col gap-4` | `<SectionHeader caption title description />` (new, reusable) |
| Award grid | `5005:14974` | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8` | `<AwardGrid />` (new) |
| Award card | `2167:9075` (and siblings) | `flex flex-col gap-4 rounded-lg border border-accent-cream/40 p-6 hover:scale-[1.02] transition-transform` | `<AwardCard />` (new) |
| Sun* Kudos promo | `3390:10349` | `flex items-center justify-between gap-10 bg-[var(--color-bg-card)] rounded-lg p-10 lg:p-16` | `<KudosPromoBlock />` (new) |
| Footer | `5001:14800` | extend Login's `<SiteFooter />` to accept nav items | enhance existing |
| Widget Button | `5022:15169` | `fixed bottom-6 right-6 z-50 h-16 px-4 rounded-full bg-[var(--color-accent-cream)] ...` | `<QuickActionsFab />` (new, client — opens menu) |

### Tailwind / theme config additions

CSS (globals.css) — new `@theme` entries:

```css
@theme inline {
  /* existing Login tokens kept */
  --color-brand-700: #101417;      /* Homepage header bg (was 800 on Login — subtle hue shift) */
  --color-card: #0B1419;           /* Dark card surfaces on Homepage */

  --font-digital-numbers: var(--font-digital-numbers);  /* countdown digits */
}
```

Font loading (extend [src/app/layout.tsx](../../../src/app/layout.tsx)):

```tsx
// Load Montserrat + Montserrat Alternates (already done for Login) AND
// the custom "Digital Numbers" font. No free Google Fonts equivalent — either:
// (a) self-host a licensed copy at public/fonts/digital-numbers.woff2
//     and declare @font-face in globals.css, or
// (b) use next/font/local:
import localFont from "next/font/local";
// Path is relative to the importing file (src/app/layout.tsx → project root
// needs ../../../public/…). next/font/local resolves paths relative to the
// source file that imports it.
const digitalNumbers = localFont({
  src: "../../../public/fonts/digital-numbers.woff2",
  variable: "--font-digital-numbers",
  display: "swap",
});
```

Fallback if font can't be licensed:
```css
.countdown-digit {
  font-family: "Digital Numbers", "Courier New", monospace;
  font-variant-numeric: tabular-nums;
}
```

---

## Component States Documentation (key interactive elements)

### Nav link (3 states)

| State | Visual |
|-------|--------|
| Normal | `text-white`, no underline |
| Hover | `text-white`, `bg-white/5` inline |
| Selected (active route) | `text-accent-cream`, underline 2px offset 4px |
| Focus-visible | `outline-2 outline-accent-cream outline-offset-2` |

### CTA buttons (ABOUT AWARDS / ABOUT KUDOS)

Match Login's PrimaryButton state matrix (cream hover #FFE586, active #FFDD6B,
disabled opacity-60). Outlined variant adds:

| State | Visual |
|-------|--------|
| Normal | border 2px accent-cream, text accent-cream, bg transparent |
| Hover | bg accent-cream/10 |
| Active | bg accent-cream/20 |

### Award card

| State | Visual |
|-------|--------|
| Normal | border accent-cream/40, subtle inner glow |
| Hover | `translate-y-[-4px] shadow-[0_12px_32px_rgba(255,234,158,0.15)]` border accent-cream/80 |
| Focus-visible | outline 2px accent-cream outline-offset-2 |

### Widget Button (FAB)

| State | Visual |
|-------|--------|
| Normal | cream fill |
| Hover | `shadow-[0_8px_24px_rgba(255,234,158,0.35)]`, slight scale-up |
| Active | `scale-95` |

---

## Responsive Specifications

Same breakpoints as Login (mobile <640, tablet 640–1023, desktop ≥1024).
Key responsive behaviors:

### Mobile (<640px)

| Area | Behavior |
|------|----------|
| Header | Collapse 3 nav links into a hamburger menu; show only logo + bell + profile |
| Hero title | Scale "ROOT FURTHER" to fit — approx `text-5xl` |
| Countdown | 3 tiles in a row, scaled down (tile ~56px tall number) |
| CTAs | Stack vertically (2 rows, full-width) |
| Root Further card | Padding collapses to `py-16 px-6`, title smaller |
| Award grid | 1 column |
| Sun* Kudos promo | Stack text over image |
| Widget button | Still fixed bottom-right, smaller (maybe 80×56) |
| Footer | Stack logo / links / copyright vertically |

### Tablet (640–1023px)

| Area | Behavior |
|------|----------|
| Header | All 3 nav links visible; condense padding |
| Award grid | 2 columns |
| Hero padding | Reduce to `px-12 py-16` |

### Desktop (≥1024px)

Design-accurate 1512-wide composition with `lg:px-36`, 3-column award grid,
full hero padding.

### Touch targets

All interactive elements (nav links, bell, profile, CTA, award cards, widget
button) MUST maintain ≥44×44 px touch targets at all breakpoints.

---

## Animation & Transitions

All values are **(derived)** defaults consistent with Login; confirm with
design.

| Element | Property | Duration | Trigger |
|---------|----------|----------|---------|
| Nav link | `color`, underline | 150 ms | hover/active |
| CTA buttons | `bg-color`, `transform` | 150 ms | hover/active |
| Award card | `transform: translateY`, `box-shadow` | 200 ms ease-out | hover |
| Countdown digits | instant (no animation) | — | tick |
| Widget button | `transform: scale`, `box-shadow` | 150 ms ease-out | hover |
| Hero text + CTA | fade-in + `translateY(8px)` | 400 ms staggered | page mount |

All animations MUST respect `prefers-reduced-motion: reduce` (Tailwind
`motion-safe:` variant).

---

## Asset Checklist

New assets needed (existing login assets still used: `saa-logo.png`,
`root-further.png`):

| Asset | Source Figma Node | Destination |
|-------|-------------------|-------------|
| Hero key visual (Homepage variant) | `2167:9028` `MM_MEDIA_Keyvisual BG` | `public/images/homepage-hero.jpg` — **USER TO EXPORT** (same limitation as Login's `login-bg.jpg` — Figma embeds the URL as `<path-to-image>`) |
| Hero "ROOT FURTHER" title | **uncertain** — see §Asset Notes | possibly bundled with hero BG; or separate overlay image |
| Root Further block title image | `3204:10153` Group 434 (290×134) | `public/images/root-further-title-small.png` (if a separate asset) |
| "2025" vertical decor | sub-node of `3204:10152` | `public/images/2025-decoration.svg` |
| 6× award thumbnails | 6 cards' `Picture-Award` sub-instances (`I2167:9075;214:1019` + siblings) | `public/images/awards/{top-talent,top-project,top-project-leader,best-manager,signature-2025,mvp}.png` |
| Sun\* Kudos promo illustration (full) | `3390:10349` sub-node — includes the decorative "KUDOS" SVN-Gotham text baked in | `public/images/sunkudos-promo.png` |
| Bell icon | `I2167:9091;186:2101` | `public/icons/bell.svg` (or inline via `<Icon />`) |
| Pencil icon (widget) | `I5022:15169;…` | `public/icons/pencil.svg` (or inline via `<Icon />`) |
| Arrow-right icon (for "Chi tiết") | Award card sub-node | inline in `<Icon />` |

All downloadable via `mcp__momorph__get_media_files` at implementation time —
but expect the hero + B4 images to fail extraction (same pattern as Login).

### Asset Notes — hero "ROOT FURTHER" title (resolved 2026-04-21)

**Resolution**: Option (b) confirmed — "ROOT FURTHER" is a separate
image overlay, **not** baked into the hero PNG. Two distinct
exports are used across Homepage:

- `/images/root-further_big@2x.png` (902×400 intrinsic, 2× the
  **451×200** design size) — hero top-left, rendered by
  `<RootFurtherTitle variant="big">` (default) inside `<HeroSection>`.
- `/images/root-further_small@2x.png` (580×268 intrinsic, 2× the
  **290×134** design size) — Root Further narrative card, rendered by
  `<RootFurtherTitle variant="small">` centered inside
  `<RootFurtherCard>`.

`RootFurtherTitle` keeps its `<h1 aria-label="ROOT FURTHER">` wrapper
so the page still exposes a proper heading to assistive tech; the
inner `<Image>` carries `alt="ROOT FURTHER"` as a secondary anchor.
Responsive widths clamp on narrow viewports:
`big` → `w-[260px] sm:w-[340px] lg:w-[451px]`,
`small` → `w-[180px] sm:w-[230px] lg:w-[290px]`.

Login's `root-further.png` (451×200) remains separate — Login owns its
own asset under a different render context.

---

## Validation Checklist

- [x] All core color tokens mapped (reusing Login tokens + 3 additions)
- [x] Typography values extracted verbatim from `list_frame_styles` — no
      placeholders left. Per-tile padding estimates noted where Figma didn't
      expose them
- [x] Spacing scale extended (104, 120, 144px additions to Login's scale)
- [x] All components have Node IDs traceable back to Figma
- [x] States documented for all interactive elements (nav 4-state, CTA 5-state,
      card 3-state, FAB 3-state)
- [x] ASCII layout diagram covers all major sections
- [x] Responsive breakpoints defined (mobile stack, tablet 2-col, desktop 3-col)
- [x] Implementation mapping complete (new components + reuse notes)
- [~] **Hero "ROOT FURTHER" title asset origin uncertain** — see Asset Notes
      below

---

## Notes

- **Rendering performance**: 4480 px tall page. Use `next/image` with
  `priority` only on above-the-fold assets (hero key visual + Root Further
  PNG). Lazy-load award thumbnails + Sun* Kudos illustration.
- **Scroll anchoring**: When `A1.2 About SAA 2025` is the selected route and
  the user clicks it, scroll smoothly to the top of the page (per A1.2
  description). Use `scrollIntoView({ behavior: 'smooth', block: 'start' })`
  on the page wrapper.
- **Countdown target time**: driven by an env var (per B1 description). Add
  `NEXT_PUBLIC_EVENT_START_AT` (ISO 8601) to the env schema. When countdown
  reaches 0, hide "Coming soon" subtitle + hold digits at "00".
- **Navigation to awards detail**: each award card links to `/awards#<slug>`
  so the browser scrolls to the matching section once the Awards page exists.
  Define a canonical slug per category now so both pages stay in sync.
- **Page is dense**: 6 award cards × 3 images + hero + Sun* Kudos illustration.
  Keep bundle JS minimal — most blocks are Server Components with no
  interactivity beyond CTA click and the Countdown timer. Only Countdown,
  NavLink (if active-state uses `usePathname`), ProfileMenu, LanguageToggle,
  NotificationBell, and QuickActionsFab need `"use client"`.
- **Footer divergence**: Footer on Homepage includes **4 links** (adds
  "Tiêu chuẩn chung"), vs. Login's footer which has only copyright. Generalize
  `<SiteFooter />` to accept an optional `navLinks` prop.
