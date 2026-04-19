# Design Style: Countdown – Prelaunch Page

**Frame ID**: `8PJQswPZmU`
**Frame Name**: `Countdown - Prelaunch page`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
**Extracted At**: 2026-04-19

---

## Design Tokens

### Colors

All tokens below are existing in [`src/app/globals.css`](../../../src/app/globals.css)
— no new tokens required for this screen.

| Token Name | Hex / rgba | Opacity | Usage |
|------------|------------|---------|-------|
| `--color-brand-900` | `#00101A` | 100% | Root frame background + opaque end of cover gradient |
| `--color-accent-cream` | `#FFEA9E` | 100% | LED tile border (0.75 px) |
| (plain) | `#FFFFFF` | 100% | Headline text, unit labels, digit text — use Tailwind `text-white` directly (no project token needed) |
| — | `rgba(255,255,255,0.5)` | 50% | LED tile gradient top stop + tile opacity:0.5 |
| — | `rgba(255,255,255,0.10)` | 10% | LED tile gradient bottom stop |
| — | `rgba(0,18,29,0.46)` | 46% | Mid-stop of cover gradient |
| — | `rgba(0,19,32,0)` | 0% | End of cover gradient (transparent, reveals background image) |

### Typography

| Token / Role | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|--------------|-------------|------|--------|-------------|----------------|-------|
| `--text-headline-countdown` | Montserrat | 36 px | 700 | 48 px | 0 | "Sự kiện sẽ bắt đầu sau" headline (node `2268:35137`) |
| `--text-unit-label` | Montserrat | 36 px | 700 | 48 px | 0 | `DAYS` / `HOURS` / `MINUTES` labels |
| `--text-led-digit` | Digital Numbers (fallback: `"Courier New", monospace`) | 73.728 px | 400 | tabular-nums | 0 | LED digit inside each tile (node `I2268:35141;186:2617`) |

> **Note on the LED font**: `--font-digital-numbers` already declared in
> [`globals.css:30`](../../../src/app/globals.css#L30) with a monospace
> fallback. The licensed font can be added later without any change to
> this screen's components.

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-screen-y` | 96 px | Vertical padding of the `Bìa` wrapper (node `2268:35131` — `padding: 96px 144px`) |
| `--spacing-screen-x` | 144 px | Horizontal padding of the `Bìa` wrapper |
| `--spacing-headline-to-countdown` | 24 px | Gap between headline and LED row |
| `--spacing-between-units` | 60 px | Gap between D / H / M groups |
| `--spacing-tile-to-tile` | 21 px | Gap between the two LED tiles inside a unit |
| `--spacing-tile-to-label` | 21 px | Gap between LED tile row and the unit label below |

### Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-led-tile` | 12 px | LED tile corner radius |
| `--border-led-tile` | 0.75 px solid `#FFEA9E` | LED tile border (round to 1 px in implementation — sub-pixel is a Figma export artefact) |

### Shadows / Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--backdrop-blur-led` | `blur(24.96px)` | LED tile `backdrop-filter` — round to `24px` in Tailwind (`backdrop-blur-xl` closest; use arbitrary `backdrop-blur-[24px]` for fidelity) |
| `--cover-gradient` | `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)` | Full-bleed overlay above the key-visual for text legibility (node `2268:35130`) |
| `--led-tile-gradient` | `linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%)` | LED tile fill (applied with overall `opacity: 0.5` per Figma — use `rgba(255,255,255,0.5)` top stop + `rgba(255,255,255,0.05)` bottom stop to mimic) |

---

## Layout Specifications

### Container — Root Frame (`2268:35127`)

| Property | Value |
|----------|-------|
| width | `1512 px` (Figma canvas, not a CSS constraint) |
| height | `1077 px` (Figma canvas; implementation MUST use `min-h-dvh`) |
| background-color | `#00101A` (fallback behind the image) |

### Background layers

1. **BG Image** (`2268:35129`) — `<Image src="/images/homepage-hero.png" fill object-cover sizes="100vw" />`. `aria-hidden`. Full-bleed at all breakpoints.
2. **Cover gradient** (`2268:35130`) — `<div>` with inline `background: var(--cover-gradient);` `absolute inset-0 pointer-events-none`.

### Content wrapper — `Bìa` (`2268:35131`)

| Property | Value |
|----------|-------|
| display | `flex` column |
| alignItems | `center` |
| justifyContent | `center` |
| gap | `120 px` |
| padding | `96 px 144 px` |
| width | full |

On narrow viewports, scale padding down: `px-6 py-16 sm:px-12 lg:px-36`, `lg:py-24`.

### Layout Structure (ASCII, desktop ≥ 1024 px)

```
┌─────────────────────────────────────── 1512px ──────────────────────────────────────┐
│                         (BG image, full-bleed, object-cover)                        │
│            (Cover gradient — darkens the left half; right half shows art)           │
│                                                                                     │
│                                                                                     │
│                                   ┌──────────────────────────┐                      │
│                                   │  Sự kiện sẽ bắt đầu sau │  ← 36/48, white      │
│                                   └──────────────────────────┘                      │
│                                           ↕ 24 px                                   │
│           ┌────┐ ┌────┐    ←60px→    ┌────┐ ┌────┐    ←60px→   ┌────┐ ┌────┐       │
│           │ 0  │ │ 0  │              │ 0  │ │ 5  │             │ 2  │ │ 0  │       │
│           └────┘ └────┘              └────┘ └────┘             └────┘ └────┘       │
│              ↕ 21 px                                                                │
│              DAYS                       HOURS                    MINUTES            │
│                                                                                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

Each LED tile:
  77 × 123 px
  border: 0.75 px solid #FFEA9E   (round to 1 px in CSS)
  border-radius: 12 px
  background: linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)
  opacity: 0.5
  backdrop-filter: blur(24.96 px)
  Digit centered: Digital Numbers 73.728 px white
```

---

## Component Style Details

### 1. PrelaunchPage (root, `2268:35127`)

| Property | Value | Tailwind |
|----------|-------|----------|
| position | relative | `relative` |
| width | full viewport | `w-full` |
| min-height | viewport | `min-h-dvh` |
| background-color | brand-900 | `bg-[var(--color-brand-900)]` |
| overflow | hidden | `overflow-hidden` |

Direct children (stacking order):
1. `<Image>` — BG, `absolute inset-0 z-0`
2. Cover gradient — `<div absolute inset-0 z-10 pointer-events-none>`
3. Content — `<div relative z-20>` wrapping headline + countdown

---

### 2. BackgroundImage (`2268:35129`)

| Property | Value | Tailwind / Props |
|----------|-------|------------------|
| src | `/images/homepage-hero.png` | — |
| fill | `true` | — |
| sizes | `100vw` | — |
| className | `object-cover` | `object-cover object-center` |
| aria-hidden | `true` | — |
| priority | `true` | Hero LCP image |

---

### 3. CoverGradient (`2268:35130`)

Full-bleed `<div aria-hidden="true">` with:
```css
background: linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%);
```
Tailwind: class uses inline `style={{ background: "..." }}` — no Tailwind utility fits the multi-stop 18 deg gradient cleanly. Accept inline style here (same pattern as `HeroBackdrop`).

---

### 4. Headline (`2268:35137`)

| Property | Value | Tailwind |
|----------|-------|----------|
| **Node ID** | `2268:35137` | — |
| tag | `<h1>` | — |
| font-family | Montserrat | `font-[family-name:var(--font-montserrat)]` |
| font-size | 36 px | `text-[36px]` (or `text-4xl` if 36 ≈ spec default) |
| line-height | 48 px | `leading-[48px]` |
| font-weight | 700 | `font-bold` |
| color | `#FFFFFF` | `text-white` |
| text-align | center | `text-center` |

Copy: `"Sự kiện sẽ bắt đầu sau"` (VI) / `"Event starts in"` (EN, pending Q6).

---

### 5. CountdownUnit (`2268:35139 / 35144 / 35149`)

| Property | Value | Tailwind |
|----------|-------|----------|
| display | flex column | `flex flex-col` |
| alignItems | start | `items-start` (labels left-align under tiles per Figma) |
| gap | 21 px | `gap-[21px]` |
| width | hug content | — |

Contains:
1. Tile pair (inner `Frame 485`) — `flex flex-row gap-[21px]` holding 2 `<LedTile>` instances.
2. `<span>` label — `text-white font-bold text-4xl leading-[48px] font-[family-name:var(--font-montserrat)]` (36 / 48).

### 6. LedTile (shared atom — `I2268:35141;186:2616`)

| Property | Value | Tailwind |
|----------|-------|----------|
| width | 77 px (≈ 76.8) | `w-[77px]` |
| height | 123 px (≈ 122.88) | `h-[123px]` |
| border | 0.75 px solid `#FFEA9E` | `border border-[var(--color-accent-cream)]` (1 px acceptable; sub-pixel is export artefact) |
| border-radius | 12 px | `rounded-xl` |
| background | `linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)` (pre-multiplied `opacity:0.5 × white→white/10%`) | inline `style={{ background: ... }}` |
| backdrop-filter | `blur(24.96 px)` | `backdrop-blur-[24px]` |
| display | flex center | `flex items-center justify-center` |
| position | relative (for absolute digit overlay) | `relative` |

Digit content inside:

| Property | Value | Tailwind |
|----------|-------|----------|
| font-family | Digital Numbers | `font-[family-name:var(--font-digital-numbers)]` |
| font-size | 73.728 px | `text-[74px]` (round) |
| line-height | 1 | `leading-none` |
| color | `#FFFFFF` | `text-white` |
| font-variant-numeric | tabular-nums | `tabular-nums` |

---

### 7. PrelaunchCountdown (`2268:35138` — row wrapper)

| Property | Value | Tailwind |
|----------|-------|----------|
| display | flex row | `flex flex-row` |
| gap | 60 px | `gap-[60px]` |
| alignItems | center | `items-center` |
| justifyContent | start (centered in parent) | — |

Semantic wrapper announces the remaining time to screen readers:

```tsx
<div role="timer" aria-live="polite" aria-atomic="true"
     aria-label={`Event starts in ${days} days, ${hours} hours, ${minutes} minutes`}>
  <CountdownUnit label="DAYS" digits={days}/>
  <CountdownUnit label="HOURS" digits={hours}/>
  <CountdownUnit label="MINUTES" digits={minutes}/>
</div>
```

The visual digit tiles stay `aria-hidden="true"` — the `aria-label` on the
wrapper is the single source of announcement.

---

## Component Hierarchy with Styles

```
PrelaunchPage (Server Component)
  relative · w-full · min-h-dvh · bg-[var(--color-brand-900)] · overflow-hidden
│
├── <Image> BackgroundImage  (absolute · inset-0 · z-0 · fill · object-cover)
├── <div>   CoverGradient    (absolute · inset-0 · z-10 · pointer-events-none · bg:linear-gradient(...))
└── <div>   ContentWrapper   (relative · z-20 · flex flex-col items-center justify-center gap-[120px] · px-6 py-16 sm:px-12 sm:py-20 lg:px-36 lg:py-24)
      │
      ├── <h1>  Headline  (text-[36px] leading-[48px] font-bold text-white text-center)
      │
      └── <PrelaunchCountdown>  ("use client" island)
            role="timer" · aria-live="polite"
            flex flex-row items-center gap-[60px] (mobile fallbacks below)
            │
            ├── <CountdownUnit label="DAYS"    digits={days}/>
            ├── <CountdownUnit label="HOURS"   digits={hours}/>
            └── <CountdownUnit label="MINUTES" digits={minutes}/>
                  │
                  └── (inside each unit)
                        <div flex flex-row gap-[21px]>
                          <LedTile digit={d[0]} />
                          <LedTile digit={d[1]} />
                        </div>
                        <span label>  (mt-[21px])
```

---

## Responsive Specifications

### Breakpoints (constitution §II)

| Name | Prefix | Min Width | Max Width |
|------|--------|-----------|-----------|
| Mobile | (base) | 0 | 639 px |
| Tablet | `sm:` | 640 px | 1023 px |
| Desktop | `lg:` | 1024 px | ∞ |

### Responsive Changes

#### Mobile (< 640 px)

| Component | Changes |
|-----------|---------|
| ContentWrapper | `px-6 py-12 gap-16` (down from 120 px) |
| Headline | `text-[24px] leading-[32px]` (down from 36 / 48) |
| PrelaunchCountdown | keep `flex-row` but reduce gap to `gap-6` (24 px) |
| LedTile | `w-[54px] h-[86px]` (≈ 70 % scale) |
| LED digit | `text-[52px]` |
| Unit label | `text-base leading-6` (down from 36 / 48) |
| Tile gap inside unit | `gap-[12px]` (down from 21 px) |
| Tile-to-label gap | `gap-3` (12 px) |

#### Tablet (≥ 640 px and < 1024 px)

| Component | Changes |
|-----------|---------|
| ContentWrapper | `sm:px-12 sm:py-16 sm:gap-24` |
| Headline | `sm:text-[32px] sm:leading-[44px]` |
| PrelaunchCountdown | `sm:gap-10` (40 px) |
| LedTile | `sm:w-[66px] sm:h-[106px]` |
| LED digit | `sm:text-[64px]` |
| Unit label | `sm:text-2xl sm:leading-8` |

#### Desktop (≥ 1024 px)

| Component | Changes |
|-----------|---------|
| ContentWrapper | `lg:px-36 lg:py-24 lg:gap-[120px]` (matches Figma) |
| Headline | `lg:text-[36px] lg:leading-[48px]` |
| PrelaunchCountdown | `lg:gap-[60px]` |
| LedTile | `lg:w-[77px] lg:h-[123px]` |
| LED digit | `lg:text-[74px]` |
| Unit label | `lg:text-[36px] lg:leading-[48px]` |

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| LED digit | opacity fade-in on change (optional polish) | 200 ms | `ease-out` | minute tick rolls a digit |
| Headline | none | — | — | — |

All motion suppressed under `prefers-reduced-motion: reduce`.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|----------------|---------------|----------------|-----------------|
| Root frame | `2268:35127` | `relative w-full min-h-dvh bg-[var(--color-brand-900)] overflow-hidden` | `<PrelaunchPage>` (new Server Component, `src/app/countdown/page.tsx` OR root swap in `src/app/page.tsx`) |
| BG image | `2268:35129` | `<Image fill object-cover />` | Inline in page — no wrapper |
| Cover gradient | `2268:35130` | `absolute inset-0 z-10 pointer-events-none` + inline style | Inline `<div>` |
| Headline | `2268:35137` | `text-[36px] leading-[48px] font-bold text-white text-center font-[family-name:var(--font-montserrat)]` | `<h1>` inline in page |
| Countdown row | `2268:35138` | `flex flex-row items-center gap-[60px]` | `<PrelaunchCountdown>` ("use client", `src/components/countdown/PrelaunchCountdown.tsx`) |
| Countdown unit | `2268:35139/35144/35149` | `flex flex-col items-start gap-[21px]` | `<CountdownUnit label digits>` inside `<PrelaunchCountdown>` |
| LED tile pair | `Frame 485` × 3 | `flex flex-row gap-[21px]` | Inline |
| LED tile | `I2268:35141;186:2616` etc. | `w-[77px] h-[123px] rounded-xl border border-[var(--color-accent-cream)] backdrop-blur-[24px] flex items-center justify-center relative overflow-hidden` + inline `style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)" }}` | `<PrelaunchCountdownTile digit>` (new atom, `src/components/countdown/PrelaunchCountdownTile.tsx`) |
| LED digit | `I2268:35141;186:2617` | `font-[family-name:var(--font-digital-numbers)] text-[74px] leading-none tabular-nums text-white` | `<span>` inside `<PrelaunchCountdownTile>` |

### Reuse decisions

- **Tick engine**: extract shared hook to `src/hooks/useCountdown.ts`
  (constitution §I — custom hooks live in `src/hooks/`).
  `<Countdown>` on Homepage + `<PrelaunchCountdown>` both consume it.
  Homepage's existing `<Countdown>` component keeps its `{ eventStartAt,
  labels }` prop shape — internal refactor only, no API change.
- **LED tile visual**: **new component** `<PrelaunchCountdownTile>` — the
  Homepage hero's `<CountdownTile>` uses a flip-clock aesthetic that does
  NOT transfer. Keep both in `src/components/countdown/` after extract.

---

## Notes

- The Figma headline layer is named `"Awards Information Navigation Links"` —
  that's a generic component name from the Figma library, **not** the
  actual label. Use `character` field `"Sự kiện sẽ bắt đầu sau"` as the
  source of truth.
- Figma uses `opacity: 0.5` at the tile level + a 180 deg white-to-white/10%
  gradient. The visual effect is a translucent glass pane. In CSS, we
  approximate by pre-multiplying: top stop `rgba(255,255,255,0.5)`, bottom
  stop `rgba(255,255,255,0.05)` — avoids an extra wrapper.
- The `backdrop-filter: blur(24.96px)` requires a non-empty backdrop (i.e.
  the BG image + cover gradient must sit UNDER the tile). Keep the
  `z-index` order documented above.
- Color contrast at `#FFFFFF` on the tile gradient is poor where the tile
  sits over the lighter right half of the BG — the cover gradient only
  darkens the left 63 %. If the countdown center crosses that threshold,
  consider extending the cover gradient's mid-stop to `70 %` or adding a
  radial darkening behind the tiles. Open cosmetic item for Plan phase.
- No new assets required for Phase 1. Background reuses
  `/images/homepage-hero.png`. The existing asset is **4.4 MB**; as the
  public prelaunch LCP, consider adding an optimised `.avif` / `.webp`
  derivative during Plan (see spec Q7).
- **Chromeless screen**: the Figma frame has **no** `SiteHeader`,
  `SiteFooter`, or `QuickActionsFab`. The Prelaunch page MUST render
  chromeless — no nav, no language toggle, no profile menu. See spec Q8.
- **Auth gating**: Per-page (each authenticated route calls
  `getUser()` + `redirect("/login")` itself). The Prelaunch page simply
  omits the redirect — no `middleware.ts` allowlist to maintain.

---

## Asset Map

| Asset | Current location | Needed deliverable | Notes |
|-------|------------------|---------------------|-------|
| Background key-visual | `public/images/homepage-hero.png` | — (reuse) | Same asset as Homepage hero |
| LED font | `Digital Numbers` declared in `globals.css` (fallback `"Courier New", monospace`) | Licensed file optional | Fallback is readable; upgrade when licensing lands |
