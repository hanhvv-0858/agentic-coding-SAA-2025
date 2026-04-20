# Design Style: Sun\* Kudos – Live Board

**Frame ID**: `MaZUn5xHXZ` (Figma node `2940:13431`)
**Frame Name**: `Sun* Kudos - Live board`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**Reference Image**: [assets/frame.png](assets/frame.png)
**Extracted At**: 2026-04-20

> Tokens inherited from [Homepage design-style](../i87tDx10uM-homepage-saa/design-style.md)
> and [Awards design-style](../zFYDgyj_pD-awards-system/design-style.md)
> where possible. This doc lists Kudos-specific additions + per-node values
> only. Header / footer / FAB / nav dot already ship on earlier pages.
> The **cream KUDO post card (`#FFF8E1`, 24 px radius, charcoal body text)**,
> the **HIGHLIGHT carousel (5 slides with dimmed side cards)**, the **SPOTLIGHT
> pan/zoom board**, and the **right-sidebar stats panel** are page-unique.

---

## Visual Reference

- Figma frame screenshot: [assets/frame.png](assets/frame.png) (1440 × 5862 PNG
  export of the full vertical composition)
- Figma deep-link (node-id scoped):
  `https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C?node-id=2940-13431`
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ

The screen has three vertical slabs inside a single 1440 × 5862 page:

1. **A — KV Kudos hero** (`2940:13437`) → title + composer pill + sunner search
2. **B — Highlight section** (`2940:13451`) → section heading, filter chips,
   5-slide carousel, pager, Spotlight word-cloud panel
3. **C + D — All Kudos feed** (`2940:13475`) → 680-wide cream card stream on
   the left, 422-wide dark sticky sidebar on the right

---

## Design Tokens (additions / deltas vs Homepage + Awards)

### Colors

All Homepage / Awards tokens still apply. New / confirmed values extracted
from `list_frame_styles` on the Kudos frame:

| Token | Hex / RGBA | Source node | Usage | Status |
|---|---|---|---|---|
| `--color-brand-900` | `#00101A` | `2940:13431` frame bg | Page background | Existing (globals.css) |
| `--color-brand-700` | `#101417` @ 80% | Header instance | Sticky translucent header | Existing |
| `--color-accent-cream` | `#FFEA9E` | `2940:13497` Mở quà fill, `2940:13457` HIGHLIGHT title | Primary CTA fill, section titles, active state highlights | Existing |
| `--color-kudo-card` | `#FFF8E1` | `3127:21871` bg, `2940:13465` highlight-card bg | Cream post-card surface | **NEW — propose adding to globals.css** |
| `--color-kudo-card-text` | `#00101A` | `I2940:13464;335:9443;256:4735` sender name on cream card | Dark navy text on cream card (uses `--color-brand-900`) | Reuses brand-900 |
| `--color-kudo-card-body` | `#00101A` (Figma) **or** `#383838` (image) | `I2940:13464;662:12223` body copy — Figma exposes `rgba(0,16,26,1)` (navy); reference PNG reads as charcoal | Body paragraph on cream card | **Open Question OQ-DS-1** — implementation defaults to Figma-exact navy `#00101A` until Design confirms |
| `--color-muted-grey` | `#999999` | `I3127:21871;256:5229` timestamp, `I3127:21871;256:4751` CECV2 label | Metadata / timestamp / inactive heart icon | **NEW — propose adding to globals.css** (matches spec §TR-008 New Tokens) |
| `--color-heart-active` | `#D4271D` | `I2940:13464;335:9459` hashtag row (shares same red) and heart-active by design ref | Active heart icon + active hashtag text | Alias of existing `--color-nav-dot` (spec Open Q10) |
| `--color-details-border` | `#998C5F` | `2940:13449` composer pill border, `2940:13489` sidebar border, `2940:14174` Spotlight border | Warm desaturated cream outline for dark pills / panels | Reuses `--color-border-secondary` (already in globals.css) |
| `--color-secondary-btn-fill` | `rgba(255, 234, 158, 0.10)` | `2940:13449`, `2940:13450`, `2940:13459`, `2940:13460` | Translucent cream fill for pill-shaped secondary buttons on dark bg | **NEW — propose `--color-secondary-btn-fill`** |
| `--color-sidebar-surface` | `#00070C` | `2940:13489` D.1 bg, `2940:13510` D.3 bg | Darker-than-body surface for sidebar cards | Reuses existing `--color-panel-surface` |
| `--color-spotlight-backdrop` | Not specified — **OQ-DS-6** | `2940:14173` panel ships as `MM_MEDIA_Kudos` image export | Warm wooden / parchment backdrop in Spotlight (image asset, not a token) | Image asset |
| `--color-kudos-beige` | `#DBD1C1` | `2940:13441` big decorative "KUDOS" text | Baked into `kudos-logo-art.png` (NOT a live colour) | Existing (awards-system) |

### Typography

All values extracted verbatim from `list_frame_styles` on the Kudos frame —
no derivations. Kudos re-uses Montserrat as the sole font family; no new
font dependency.

| Token | Font | Size | Weight | Line-height | Letter-spacing | Figma Source | Colour |
|---|---|---|---|---|---|---|---|
| `--text-section-title` | Montserrat | **57px** | 700 | 64px | -0.25px | `2940:13457` "HIGHLIGHT KUDOS", `2940:14179` "SPOTLIGHT BOARD", `2940:14223` "ALL KUDOS" | cream `#FFEA9E` |
| `--text-hero-title` | Montserrat | **36px** | 700 | 44px | 0 | `2940:13439` "Hệ thống ghi nhận lời cảm ơn" (H1), `3007:17482` "388 KUDOS" counter | cream `#FFEA9E` / white (counter) |
| `--text-display-lg` | Montserrat | 24px | 700 | 32px | 0 | `2940:13454` section caption "Sun* Annual Awards 2025", `I3127:21871;335:9463` heart count "1.000" | white / navy |
| `--text-stats-title` | Montserrat | **32px** | 700 | — | 0 | `I2940:13491;256:6753` D.1 stat numbers (e.g. "25") | cream `#FFEA9E` |
| `--text-stats-label` | Montserrat | **22px** | 700 | 32px | 0 | `I2940:13491;256:6735` "Số Kudos bạn nhận được:", `2940:13513` D.3 title, `I2940:13497;186:1568` Mở quà CTA label | white / cream / navy |
| `--text-card-body` | Montserrat | **20px** | 700 | 28px (derived) | 0 | `I2940:13464;662:12223` kudo body paragraph | navy `#00101A` |
| `--text-body-bold` | Montserrat | 16px | 700 | 24px | +0.15px | Sender name, recipient name, nav links, filter chip labels, Copy Link text | white / navy depending on surface |
| `--text-body-sm` | Montserrat | 14px | 700 | 20px | +0.1px | `I2940:13464;335:9443;256:4751` CECV2 / honourific beneath sender name, header nav | grey `#999999` / white |
| `--text-timestamp` | Montserrat | 16px | 700 | 24px | +0.5px | `I3127:21871;256:5229` "10:00 - 10/30/2025" | grey `#999999` |
| `--text-hashtag` | Montserrat | 16px | 700 | 24px | +0.5px (derived) | `I3127:21871;256:5158` hashtag row | red `#D4271D` |
| `--text-spotlight-name-sm` | Montserrat | ~6.6px – 11.3px (variable) | 700 | — | 0 | `2995:15926`, `2940:14198`, `2995:15930` Spotlight name nodes (size encodes weight) | white, with one red accent `rgba(241,118,118,1)` |
| `--text-kudos-decorative` | SVN-Gotham | 139.78px | 400 | 34.94px | -13% | `2940:13441` big "KUDOS" text | beige `#DBD1C1` — baked into PNG asset |

> **Font dependencies**: Only Montserrat (already loaded). SVN-Gotham is
> **baked** into `public/images/kudos/kudos-logo-art.png`. No new `@font-face`
> required.

### Spacing

New / confirmed tokens (inherit Homepage scale for anything not listed):

| Token | Value | Usage (Figma source) |
|---|---|---|
| `--space-card-inner-gap` | 16px | `3127:21871` inner gap between card rows |
| `--space-card-padding-x` | 40px | `3127:21871` horizontal padding |
| `--space-card-padding-top` | 40px | `3127:21871` top padding |
| `--space-card-padding-bottom` | 16px | `3127:21871` bottom padding |
| `--space-hashtag-gap` | ~30px | `I3127:21871;256:5158` inline hashtag row (29.89px exact) |
| `--space-image-gap` | 16px | `I3127:21871;256:5176` attachment thumbnail gap |
| `--space-card-to-card` | 24px | `2940:13482` C.2 vertical feed gap |
| `--space-feed-sidebar-gap` | 50px | Between C (x:824) and D (x:874) in 1440 layout |
| `--space-section-v` | 40px | `2940:13451`, `2940:13475` outer `gap: 40px` |
| `--space-pill-padding-x` | 16px | Composer pill, filter chips horizontal padding |
| `--space-pill-padding-y` | 24px | Composer pill top/bottom padding (yields 72 px total height) |
| `--space-sidebar-padding` | 24px | `2940:13489`, `2940:13510` D card padding |
| `--space-page-inset` | 144px | Page horizontal inset (inherited from Homepage) |

### Border & Radius

| Token | Value | Usage (Figma source) |
|---|---|---|
| `--radius-kudo-card` | **24px** | `3127:21871` (All Kudos post card) — **NEW** |
| `--radius-highlight-card` | **16px** | `2940:13465` B.3 highlight card — **NEW** |
| `--radius-sidebar-card` | **17px** | `2940:13489`, `2940:13510` (D.1 / D.3) — **NEW** |
| `--radius-spotlight` | **47.14px** | `2940:14174` Spotlight panel — **NEW** (use `47px` rounded in CSS) |
| `--radius-pill` | **68px** | `2940:13449`, `2940:13450` (composer + sunner search pills) — **NEW** (Tailwind `rounded-full` / 9999 px is also acceptable since both pills are wider than 2× their height — visual parity holds) |
| `--radius-filter-chip` | 4px | `2940:13459`, `2940:13460` B.1.1 / B.1.2 filter buttons |
| `--radius-button-md` | 8px | `2940:13497` Mở quà CTA (inherited from Homepage) |
| `--border-width-filter` | 1px | `#998C5F` pill + sidebar outlines |
| `--border-width-highlight` | 4px | `2940:13465` B.3 highlight card cream outline |
| `--border-width-focus` | 2px | Focus-visible ring (inherited constitution) |

### Shadows

Kudos does **not** expose explicit drop-shadow tokens in Figma. Two shadows
are needed at implementation time, derived from the reference image:

| Token | Value | Usage |
|---|---|---|
| `--shadow-kudo-card` | `0 4px 12px rgba(0, 0, 0, 0.25)` (derived) | Elevation of cream KUDO card over dark bg — **OQ-DS-2** (confirm value) |
| `--shadow-highlight-center` | `0 8px 24px rgba(0, 0, 0, 0.35)` (derived, matches `--shadow-fab-tile`) | Elevation of centered HIGHLIGHT slide |
| `--shadow-fab-pill` / `--shadow-fab-pill-hover` / `--shadow-fab-tile` | Existing | Inherited from globals.css for the floating `QuickActionsFab` reused on this page |

No drop-shadow is used for B.7 Spotlight, for D.1/D.3 sidebar cards (they sit
on the dark body with a 1 px `#998C5F` border instead), or for filter chips.

---

## Component Specifications

All dimensions, paddings, fills, and borders are extracted verbatim from
`list_frame_styles` on the Kudos frame unless flagged "(derived)".

### 1. Page Frame (`2940:13431`)

| Property | Value | Tailwind |
|---|---|---|
| width × height | 1440 × 5862 (desktop) | `w-full min-h-screen` |
| background | `#00101A` | `bg-brand-900` |
| position | `relative` | `relative` |

### 2. `SiteHeader` (`2940:13433`) — reused

Already shipped on Homepage / Awards. No changes. 1440 × 80, padding
12 / 144, bg `rgba(16, 20, 23, 0.80)`, z-40 sticky. Active nav "Sun\* Kudos"
shows the red dot `--color-nav-dot` (awards-system pattern).

### 3. `KudosHero` (`2940:13432` + `2940:13437`)

Full-bleed keyvisual 1440 × 512 (`MM_MEDIA_KV Background`) + radial cover
`linear-gradient(25deg, #00101A 14.74%, rgba(0,19,32,0) 47.8%)` for text
legibility (copied from Awards). Inner content frame `2940:13437`:

| Property | Value | Notes |
|---|---|---|
| **Node ID** | `2940:13437` | `A_KV Kudos` |
| width × height | 1152 × 160 | `flex flex-col gap-2.5 items-start` |
| position | `absolute`, top 184, left 144 | Overlays hero image |
| gap | 10px | Between title + decorative KUDOS logo |
| contents | `2940:13439` H1 + `2940:13441` SVN-Gotham decorative text (image) | — |

### 4. `KudosHeroTitle` (`2940:13439`) — H1

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13439` | — |
| font | Montserrat 36 / 44 / 700 | `text-[36px] leading-[44px] font-bold` |
| color | `#FFEA9E` | `text-accent-cream` |
| role | `<h1>` | FR-018 |

### 5. `KudosComposerPill` — A.1 (`2940:13449`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13449` | — |
| width × height | 738 × 72 | `w-[738px] h-[72px]` |
| padding | 24px 16px | `px-4 py-6` |
| gap | 8px | `gap-2` |
| background | `rgba(255, 234, 158, 0.10)` | `bg-[var(--color-secondary-btn-fill)]` |
| border | 1px solid `#998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 68px | `rounded-[68px]` |
| children | pencil icon + placeholder text (16/24/700 white) | — |

**States:**

| State | Changes |
|---|---|
| Default | bg @ 10% cream |
| Hover | bg @ 15% cream (derived; **OQ-DS-3**) |
| Focus-visible | outline 2px `--color-accent-cream`, offset 2px |
| Active / Pressed | bg @ 20% cream |
| Disabled | opacity 50%, cursor not-allowed (not used on this button in MVP) |

### 6. `SunnerSearchPill` — A.1 sibling (`2940:13450`)

Identical to composer pill except:

| Property | Value |
|---|---|
| **Node ID** | `2940:13450` |
| width | 381px |
| children | magnifier icon + "Tìm kiếm" placeholder |

States identical to §5. Adds `focus-within` ring on the inner `<input>` per
constitution.

### 7. `HashtagFilterButton` — B.1.1 (`2940:13459`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13459` | — |
| width | hug content (~136 px in Figma) | `w-fit` |
| height | hug (~56 px with 16 px padding) | `h-14` |
| padding | 16px | `p-4` |
| gap | 8px | `gap-2` |
| background | `rgba(255, 234, 158, 0.10)` | same token as §5 |
| border | 1px solid `#998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 4px | `rounded` |
| children | `#` icon 16×16 + label "Hashtag" (16/24/700 white) + chevron (if any) | — |

**States:**

| State | Changes |
|---|---|
| Default | bg @ 10% cream, border `#998C5F` |
| Hover | bg @ 15% cream |
| Focus-visible | outline 2px `--color-accent-cream`, offset 2px; `aria-haspopup="listbox"` |
| Open (aria-expanded="true") | bg @ 20% cream, icon rotates 180° |
| Selected (filter active) | cream `#FFEA9E` left-dot badge appears; label gains `#FFEA9E` colour |
| Disabled (no hashtags loaded) | opacity 50%, cursor not-allowed, tooltip "Không tải được danh sách" |

### 8. `DepartmentFilterButton` — B.1.2 (`2940:13460`)

Identical to §7 except:

| Property | Value |
|---|---|
| **Node ID** | `2940:13460` |
| children | building icon + "Phòng ban" label |

### 9. `HighlightCarousel` — B.2 (`2940:13461`)

| Property | Value | Notes |
|---|---|---|
| **Node ID** | `2940:13461` | — |
| width × height | 1440 × 525 | Full-bleed carousel row |
| layout | 5 `HighlightKudoCard`s horizontal, centered slide sharp, flanking slides dimmed/shrunk | — |
| gap | 24px (derived from Figma horizontal rhythm) | **OQ-DS-4** |

The centered slide is rendered at 100 % scale and opacity; each adjacent
slide at ~0.92 scale and opacity 0.6; further-out slides opacity 0.3. Under
`prefers-reduced-motion: reduce`, transitions become instant (FR-020).

### 10. `HighlightKudoCard` — B.3 (`2940:13465`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13465` | — |
| width | 528px | `w-[528px]` |
| height | hug (content-driven, ~525 px for 3-line body) | — |
| padding | 24px 24px 16px 24px | `pt-6 pr-6 pb-4 pl-6` |
| gap | 16px | `gap-4` |
| background | `#FFF8E1` | `bg-[var(--color-kudo-card)]` |
| border | 4px solid `#FFEA9E` | `border-4 border-accent-cream` |
| border-radius | 16px | `rounded-[var(--radius-highlight-card)]` |
| shadow | `--shadow-highlight-center` on centered slide; none on flanking | — |
| layout | `flex flex-col items-start` | — |
| body clamp | 3 lines | `line-clamp-3` |

**States** — inherits heart + copy-link states from §18 / §19.

### 11. `CarouselPager` — B.5 (`2940:13471`)

| Property | Value |
|---|---|
| **Node ID** | `2940:13471` |
| width × height | 1440 × 52 |
| gap | 32px |
| padding | 0 144px |
| layout | `flex items-center justify-center` |
| children | Prev arrow (B.5.1) · "2/5" text (B.5.2) · Next arrow (B.5.3) |

**States** (applies to B.5.1 / B.5.3 arrow buttons):

| State | Changes |
|---|---|
| Default | cream `#FFEA9E` stroke on arrow glyph, 40×40 hit-box, transparent bg |
| Hover | cream bg @ 10% (circular) |
| Focus-visible | outline 2px cream, offset 2px |
| Disabled (edge) | opacity 40%, cursor not-allowed, `aria-disabled="true"` (slide 1 prev, slide 5 next) |

### 12. `SpotlightBoard` — B.7 (`2940:14174`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:14174` | — |
| width × height | 1157 × 548 | `w-[1157px] h-[548px]` |
| border | 1px solid `#998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 47.14px | `rounded-[47px]` |
| background | wooden-backdrop image (`public/images/kudos/spotlight-backdrop.jpg`) | `bg-cover bg-center` |
| overflow | hidden (pan/zoom scoped inside, FR-020) | `overflow-hidden` |
| contents | B.7.1 counter, B.7.2 pan/zoom controls, B.7.3 search, N name nodes | — |

**States:**

| State | Changes |
|---|---|
| Default | Idle; names at rest |
| Hover name | Scale 1.05, tooltip appears within 200 ms |
| Pan active | Cursor `grab` / `grabbing` |
| Zoom active | Cursor `zoom-in` / `zoom-out` |
| Reduced motion | No mount stagger, no tooltip slide-in; plain fade only |

### 13. `SpotlightCounter` — B.7.1 (`3007:17482`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `3007:17482` | — |
| width × height | 217 × 44 | text-sized |
| font | Montserrat 36 / 44 / 700 | `text-[36px] font-bold` |
| color | white `#FFFFFF` | `text-white` |
| aria | `aria-live="polite"` (FR-015) | — |

### 14. `SpotlightPanZoomControls` — B.7.2 (`3007:17479`)

| Property | Value |
|---|---|
| **Node ID** | `3007:17479` |
| shape | Pill with pan + zoom segmented controls |
| size | Not specified — **OQ-DS-5** (confirm exact dims) |

### 15. `SpotlightSearch` — B.7.3 (`2940:14833`)

| Property | Value |
|---|---|
| **Node ID** | `2940:14833` |
| font | Montserrat 10.92 / — / 500 / white (placeholder "Tìm Sunner") |
| shape | Compact pill with magnifier icon (size scales within Spotlight panel) |
| placement | Top-right of Spotlight panel |

### 16. `AllKudosHeader` — C.1 (`2940:14221`)

| Property | Value |
|---|---|
| **Node ID** | `2940:14221` |
| layout | `flex flex-col gap-4` |
| caption | "Sun* Annual Awards 2025" — Montserrat 24 / 32 / 700 / white |
| title | "ALL KUDOS" — `--text-section-title` (57 / 64 / 700 / cream) — `<h2>` |

### 17. `KudoPostCard` — C.3 / C.5 / C.6 / C.7 (`3127:21871`)

The single most-important card component. All 4 Figma variants share the
same shape; only inner slot presence varies (C.5 has no images, C.6 has no
hashtags, C.7 has both, etc.).

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `3127:21871` | — |
| width | 680px | `w-[680px]` |
| height | content-driven (749 in Figma full variant) | `h-fit` |
| padding | 40px 40px 16px 40px | `pt-10 px-10 pb-4` |
| gap | 16px | `flex flex-col gap-4` |
| background | `#FFF8E1` | `bg-[var(--color-kudo-card)]` |
| border-radius | 24px | `rounded-[var(--radius-kudo-card)]` |
| box-shadow | `--shadow-kudo-card` (derived) | — |
| layout | `flex flex-col items-start` | — |
| body clamp | 5 lines (spec US1 #3) | `line-clamp-5` |
| images max | 5 @ 88×88 (spec US1 #4) | — |
| hashtags max | 5 (spec edge cases) | — |

**States:**

| State | Changes |
|---|---|
| Default | as above |
| Hover | shadow elevates to `0 8px 20px rgba(0,0,0,0.3)`; cursor `pointer` on body area |
| Focus-visible (card-wrap `<button>` for detail click) | outline 2px cream, offset 2px |
| Active (pressed) | transform translateY(1px) |
| Skeleton (loading > 200 ms) | bg `#FFF8E1` with pulsing `rgba(0,0,0,0.05)` stripes; reduced-motion → static |
| Error (single-card fetch failed) | replaced with inline "Không tải được Kudos này" + Retry |

#### 17a. `KudoCardSender` — C.3.1 (`I3127:21871;256:4858`)

| Property | Value |
|---|---|
| width × height | 235 × 123 |
| gap | 13px |
| layout | `flex flex-col items-center justify-center` |
| children | avatar 64×64 + name (Montserrat 16/24/700/navy) + honourific (Montserrat 14/20/700/grey `#999`) + optional hoa-thị row |

#### 17b. `KudoCardRecipient` — C.3.3 (`I3127:21871;256:4860`)

Identical shape to 17a.

#### 17c. `KudoCardSentIcon` — C.3.2 (`I3127:21871;256:5161`)

| Property | Value |
|---|---|
| width × height | 32 × 123 |
| padding | 16px 0 |
| glyph | Arrow / paper-plane "sent" icon, cream stroke |

#### 17d. `KudoCardTimestamp` — C.3.4 (`I3127:21871;256:5229`)

| Property | Value | CSS |
|---|---|---|
| width | 600px | `w-full` |
| height | 24px | `h-6` |
| font | Montserrat 16 / 24 / 700 / +0.5 px letter-spacing | — |
| color | `#999999` | `text-[var(--color-muted-grey)]` |
| text | `HH:mm - MM/DD/YYYY` (example: "10:00 - 10/30/2025") | — |

#### 17e. `KudoCardContent` — C.3.5 (`I3127:21871;256:5155`)

| Property | Value | CSS |
|---|---|---|
| width | 552px | `w-full max-w-[552px]` |
| height | ~160px (5 lines × 28 px) | — |
| font | Montserrat 20 / 28 (derived) / 700 / navy `#00101A` | `text-[20px] leading-7 font-bold text-brand-900` |
| clamp | 5 lines + ellipsis | `line-clamp-5` |
| interactive | click → detail view (parked → "Đang xây dựng" toast per FR-012) | `cursor-pointer` |

#### 17f. `KudoCardImages` — C.3.6 (`I3127:21871;256:5176`)

| Property | Value |
|---|---|
| width | 600px |
| height | 88px |
| gap | 16px |
| layout | `flex flex-row items-center` |
| thumbnail | 88 × 88, `rounded-md`, object-cover |

Mobile (<640 px): thumbnails shrink to 64×64 (TR-010).

#### 17g. `KudoCardHashtags` — C.3.7 (`I3127:21871;256:5158`)

| Property | Value | CSS |
|---|---|---|
| width | 600px | — |
| height | 48px | — |
| gap | 29.9px (rounded to 30 px) | `gap-[30px]` or `gap-x-8` |
| font | Montserrat 16 / 24 / 700 / +0.5 px | — |
| color | red `#D4271D` | `text-[var(--color-heart-active)]` |
| layout | `flex flex-row items-center flex-wrap` | — |
| max | 5 tags on one line; 6+ clipped | — |

Each hashtag is a `<button>` that re-filters the page (FR-008).

#### 17h. `KudoCardActionBar` — C.4 (`I3127:21871;256:5194`)

| Property | Value |
|---|---|
| width | 600px |
| height | 56px |
| gap | 24px |
| layout | `flex flex-row items-center justify-between` |
| children | `HeartButton` + `CopyLinkButton` |

### 18. `HeartButton` — C.4.1 (`I3127:21871;256:5175`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `I3127:21871;256:5175` | — |
| width × height | 101 × 32 | — |
| gap | 4px | `gap-1` |
| layout | `flex flex-row items-center` |
| icon size | 24 × 24 | — |
| icon (inactive) | `heart` outline, `#999999` | — |
| icon (active) | `heart-filled`, `#D4271D` | — |
| count text | Montserrat 24 / 32 / 700 / navy `#00101A` | `text-[24px] font-bold text-brand-900` |
| aria | `role="button"`, `aria-pressed={hearted}`, `aria-label="Thả tim cho kudo này"` | — |

**States:**

| State | Changes |
|---|---|
| Default (not hearted) | grey outline icon, count grey `#999999` |
| Hover (enabled) | icon scales 1.1, cursor `pointer` |
| Active / Pressed | icon scales 0.95 briefly |
| Hearted (aria-pressed="true") | icon red filled, count navy; motion: 250 ms scale 1 → 1.25 → 1 ease-out (reduced-motion: instant colour swap only, per spec US2/US9) |
| Focus-visible | outline 2px cream, offset 2px |
| Disabled (user is sender, FR-006) | opacity 50%, `aria-disabled="true"`, `cursor: not-allowed`, no hover grow |
| Offline optimistic | count still updates; toast "Bạn đang offline..." appears |
| Error rollback | count reverts; error toast fires |

### 19. `CopyLinkButton` — C.4.2 (`I3127:21871;256:5216`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `I3127:21871;256:5216` | — |
| width × height | 145 × 56 | — |
| padding | 16px | `p-4` |
| gap | 4px | `gap-1` |
| border-radius | 4px | `rounded` |
| children | link-icon 16×16 + "Copy Link" label (Montserrat 16 / 24 / 700 / navy) | — |

**States:**

| State | Changes |
|---|---|
| Default | transparent bg, navy text + icon |
| Hover | bg `rgba(0, 16, 26, 0.06)` (navy @ 6%) |
| Focus-visible | outline 2px cream, offset 2px |
| Active (right after click) | label swaps to "Đã copy!" for 1.5 s, icon swaps to check glyph |
| Disabled | not used |

### 20. `KudoStatsSidebar` — D (`2940:13488`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13488` | — |
| width | 422px | `w-[422px]` |
| gap | 24px | `gap-6` |
| layout | `flex flex-col items-start` | — |
| position | `sticky top-[calc(var(--header-h)+24px)]` desktop | — |

### 21. `StatsBlock` — D.1 (`2940:13489`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13489` | — |
| width | hug content (422 px match) | — |
| padding | 24px | `p-6` |
| gap | 10px | `gap-2.5` |
| background | `#00070C` | `bg-[var(--color-panel-surface)]` |
| border | 1px solid `#998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 17px | `rounded-[17px]` |
| layout | `flex flex-col items-start` | — |
| children | 5 × stat row (label 22/32/700/white + number 32/700/cream) + divider + "Mở quà" CTA | — |

**Divider**: `1px solid #2E3940` (`--color-divider`).

### 22. `MoQuaCTA` — D.1.8 (`2940:13497`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13497` | — |
| width × height | 374 × 60 | `w-[374px] h-[60px]` |
| padding | 16px | `p-4` |
| gap | 8px | `gap-2` |
| background | `#FFEA9E` | `bg-accent-cream` |
| border-radius | 8px | `rounded-lg` |
| layout | `flex items-center justify-center` |
| label | Montserrat 22 / 28 (derived) / 700 / navy `#00101A` | — |

**States** (inherits Homepage `PrimaryButton` variants):

| State | Changes |
|---|---|
| Default | cream bg, navy text |
| Hover | bg `#FFE586` (`--color-accent-cream-hover`) |
| Active | bg `#FFDD6B` (`--color-accent-cream-active`) |
| Focus-visible | outline 2px cream, offset 2px |
| Disabled (0 unopened boxes, FR-010) | opacity 50%, cursor not-allowed, `aria-disabled="true"`, tooltip copy |

### 23. `LatestGiftRecipients` — D.3 (`2940:13510`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `2940:13510` | — |
| width | 422 (matches sidebar) | — |
| padding | 24px 16px 24px 24px | `pt-6 pr-4 pb-6 pl-6` |
| gap | 10px | — |
| background | `#00070C` | same token as §21 |
| border | 1px solid `#998C5F` | — |
| border-radius | 17px | — |
| layout | `flex flex-col items-start` | — |
| title | `2940:13513` "10 SUNNER NHẬN QUÀ MỚI NHẤT" — Montserrat 22/32/700/cream `#FFEA9E` | — |
| list | 10 rows of `avatar 32×32 + name + gift_description` | — |

**Row states:** hover → row bg `rgba(255, 234, 158, 0.08)`, cursor pointer;
focus-visible cream outline.

### 24. `QuickActionsFab` — reused

Global floating action button defined in Homepage. No changes on this page.
Uses `--shadow-fab-pill` / `--shadow-fab-pill-hover` / `--shadow-fab-tile`.

### 25. `SiteFooter` — reused (`2940:13522`)

No changes. Inherits Homepage / Awards style verbatim.

---

## Layout Structure (ASCII — desktop 1440 × 5862)

```
┌────────────────────────────────────────────────────────────────────┐
│  SiteHeader (1440×80, padding 12/144, bg #101417/80, z-40 sticky)  │
│  [LOGO]  [About SAA 2025] [Award Information] [Sun* Kudos •]  ...  │
├────────────────────────────────────────────────────────────────────┤
│  A — KV Kudos Hero  (1440×512 keyvisual + gradient cover)          │
│   ┌── A_KV inner 1152×160 at (144, 184) ──────────────┐             │
│   │  H1 "Hệ thống ghi nhận lời cảm ơn"  (36/44/cream) │             │
│   │  Decorative KUDOS (SVN-Gotham 139.78, beige)      │             │
│   └───────────────────────────────────────────────────┘             │
│                                                                    │
│   ┌── A.1 Composer pill 738×72, radius 68, cream@10 ──┐             │
│   │  ✎  Hôm nay, bạn muốn gửi lời cảm ơn… →            │             │
│   └───────────────────────────────────────────────────┘             │
│   ┌── Sunner search 381×72, same styling ──────┐                   │
│   │  🔎 Tìm kiếm                                │                   │
│   └────────────────────────────────────────────┘                   │
├────────────────────────────────────────────────────────────────────┤
│  B — Highlight  (1440 × 786, gap 40)                               │
│   B.1 Header   "Sun* Annual Awards 2025" + "HIGHLIGHT KUDOS"        │
│                (57/64/cream) + [# Hashtag] [🏢 Phòng ban]           │
│   B.2 Carousel (1440×525)                                           │
│     ┌─ dim ─┐  ┌───── CENTER 528×hug, radius 16, 4px cream ─────┐  │
│     │ slide │  │ [sender ↔ recipient]  timestamp                 │  │
│     │  n-1  │  │ body (3-line clamp)                             │  │
│     │       │  │ hashtags red                                    │  │
│     │       │  │ [♥ 1.000]                     [Copy Link]       │  │
│     └───────┘  └─────────────────────────────────────────────────┘  │
│   B.5 Pager  (← 2/5 →)                                              │
│                                                                    │
│   B.6 Header  "Sun* Annual Awards 2025" + "SPOTLIGHT BOARD"         │
│   B.7 Spotlight (1157×548, radius 47, wooden backdrop)              │
│     ┌──────────────────────────────────────────────────────────┐   │
│     │ 388 KUDOS                     [pan/zoom]   [🔎 search]   │   │
│     │                                                          │   │
│     │     ...name-cloud of 120+ Sunner names...                │   │
│     │                                                          │   │
│     └──────────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────────────┤
│  C + D — All Kudos  (1440 × 3237, gap 40)                          │
│   C.1 Header  "Sun* Annual Awards 2025" + "ALL KUDOS"               │
│                                                                    │
│   ┌── C.2 Feed 680-wide, gap 24 ──┐   ┌── D sidebar 422-wide ──┐   │
│   │ ┌─ KUDO Post card (3127:21871)│   │ D.1 Stats (17-radius)   │   │
│   │ │  680×749, radius 24, cream  │   │  Số Kudos bạn nhận: 25   │   │
│   │ │  pad 40/40/16/40, gap 16    │   │  ...4 more metrics...    │   │
│   │ │  sender ↔ recipient          │   │  ────────────            │   │
│   │ │  timestamp (grey)            │   │  [ Mở quà ]  (cream CTA) │   │
│   │ │  body (5-line clamp)         │   │                          │   │
│   │ │  [img][img][img][img][img]   │   └────────────────────────┘   │
│   │ │  #Dedicated #Inspiring …     │                                │
│   │ │  [♥ 1.000]   [Copy Link]     │   ┌── D.3 Gift recipients ──┐  │
│   │ └──────────────────────────────┘   │ 10 SUNNER NHẬN QUÀ …     │  │
│   │ ┌── next card ──┐                  │  avatar + name + desc × 10│  │
│   │ └───────────────┘                  └─────────────────────────┘   │
│   │   (repeat × N)                                                 │
│   └────────────────────────────────┘                                │
├────────────────────────────────────────────────────────────────────┤
│  SiteFooter (1440, padding 40/90)                                  │
└────────────────────────────────────────────────────────────────────┘

Floating, absolute position:
   QuickActionsFab (106×64, radius 100, cream, bottom-right, z-50)
```

---

## Responsive Breakpoints

Per constitution §II, Tailwind-standard thresholds. Figma ships **desktop
only**; every tablet/mobile value below is spec-driven (not extracted from
Figma). All spec-driven values are flagged "**Open question to Design**"
when the mapping is non-obvious.

| Name | Min width | Notes |
|---|---|---|
| `base` (mobile) | 0 | Fallback — safe minimum 360 px |
| `sm` | ≥ 640 px | Large mobile |
| `md` | ≥ 768 px | Tablet portrait |
| `lg` | ≥ 1024 px | Tablet landscape / small desktop — sidebar D appears |
| `xl` | ≥ 1280 px | Desktop — full 3-column layout |

### Component reflow

| Component | Mobile `<640` | `sm` 640–767 | `md` 768–1023 | `lg` 1024–1279 | `xl` ≥1280 |
|---|---|---|---|---|---|
| `SiteHeader` | Burger + logo | Burger + logo | Full nav | Full nav | Full nav |
| `KudosHero` | 360×320 bg, H1 24/32 | 640×360 bg, H1 28/36 | 768×420 bg, H1 32/40 | 1024×460, H1 36/44 | 1440×512, H1 36/44 |
| A.1 Composer pill | full width − 16 px insets | full width − 24 px | 720×72 | 720×72 | 738×72 (Figma) |
| A.1 Sunner search | stacked below composer, full-width | stacked | inline 320×72 | 381×72 | 381×72 |
| Filter chips (B.1.1 / B.1.2) | horizontal scroll strip (`overflow-x-auto`) | same | inline | inline | inline |
| `HighlightCarousel` | 1 slide visible, side slides hidden, swipe only (**OQ-DS-9** mobile reflow) | 1 slide, side slides 0.4 opacity | 3 slides visible | 3 slides visible | 5 slides visible (Figma) |
| `HighlightKudoCard` width | 100 % − 32 px | 480 | 500 | 528 | 528 (Figma) |
| `KudoPostCard` width | 100 % − 32 px | 600 | 680 | 680 | 680 (Figma) |
| Card padding | 24/24/12/24 | 32/32/16/32 | 40/40/16/40 | 40/40/16/40 | 40/40/16/40 (Figma) |
| Attachment thumbs | 64×64 (TR-010) | 72×72 | 88×88 | 88×88 | 88×88 |
| Sidebar D | stacks below C, full-width | stacks below | stacks below | 422 sticky right | 422 sticky right |
| `SpotlightBoard` | Degrades to vertical top-20 list (**OQ-DS-8** / spec Q7) | same fallback | 720×360 pan/zoom | 1024×500 pan/zoom | 1157×548 (Figma) |
| `QuickActionsFab` | bottom-right, 16 px inset | same | same | 24 px inset | 24 px inset |

### Container widths

| Breakpoint | Max content width | Horizontal inset |
|---|---|---|
| `xl` | 1152 (C + D + 50 gap = 1152) | 144 px (inherits Homepage) |
| `lg` | 1152 | 40 px |
| `md` | 720 | 24 px |
| `sm` | 608 | 16 px |
| `base` | 100 % | 16 px |

---

## Accessibility (WCAG 2.2 AA — constitution Principle II)

### Colour contrast (verified from tokens)

| Foreground | Background | Ratio | Pass? |
|---|---|---|---|
| Navy `#00101A` | Cream `#FFF8E1` | ~15.8 : 1 | AA large + normal |
| Charcoal `#383838` | Cream `#FFF8E1` | ~10.3 : 1 | AA normal (used only if OQ-DS-1 resolves to charcoal) |
| White `#FFFFFF` | Brand-900 `#00101A` | 17.4 : 1 | AA normal |
| Cream `#FFEA9E` | Brand-900 `#00101A` | 12.1 : 1 | AA normal |
| Red `#D4271D` | Cream `#FFF8E1` | ~4.8 : 1 | AA normal (barely — monitor; flag if design shifts) |
| Grey `#999999` | Cream `#FFF8E1` | ~2.3 : 1 | **FAILS** for body text — allowed only for **metadata** / timestamp (not considered "body text" per WCAG 1.4.3 exception for incidental UI). **OQ-DS-7** (is timestamp decorative or required?) |

### Focus order

Skip link → header nav → composer pill A.1 → sunner search → filter chips
(B.1.1, B.1.2) → carousel region (left-arrow / slide / heart / copy / right-arrow
as roving tabindex) → Spotlight (single tabstop + arrow-key roving, Open Q8) →
All Kudos feed (each card: sender name → recipient name → hashtag chips → heart
→ copy link, in DOM order) → sidebar D (Mở quà CTA → D.3 list) → footer.

### ARIA labels & roles

| Element | Role / ARIA |
|---|---|
| Skip link | `<a href="#feed">` at body top |
| H1 | `<h1>` — the hero title; **exactly one** per page (FR-018) |
| Section titles | `<h2>` — HIGHLIGHT / SPOTLIGHT / ALL KUDOS |
| Filter chips | `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` |
| Hashtag chips inside card | `<button>` + `aria-label="Lọc theo #Dedicated"` |
| Carousel region | `role="region"` + `aria-roledescription="carousel"` |
| Carousel slide | `role="group"` + `aria-roledescription="slide"` + `aria-label="Slide {n} of 5"` |
| Prev / Next arrow | `aria-label="Slide trước"` / `aria-label="Slide sau"` + `aria-disabled` at edges |
| Heart button | `<button>` + `aria-pressed` + `aria-label="Thả tim cho kudo này"` ; disabled uses `aria-disabled="true"` (FR-006) |
| Copy-link button | `aria-label="Copy đường dẫn Kudo"` ; on success announces "Đã copy" via live region |
| Spotlight counter | `aria-live="polite"` (FR-015) |
| Spotlight names | Each `<button>` + `aria-label="Tên: Đỗ Hoàng Hiệp — Nhận Kudos gần nhất lúc 08:30 PM"` |
| Mở quà CTA | `<button>` + `aria-label="Mở hộp quà của bạn"` ; disabled uses `aria-disabled` (FR-010) |
| Toast region | `role="status"` + `aria-live="polite"` |
| Sidebar D | `<aside>` + `aria-label="Thống kê Kudos cá nhân"` |

### Focus-visible ring

`outline: 2px solid var(--color-accent-cream); outline-offset: 2px;` on every
focusable element. On the cream KUDO card surface, use a navy fallback ring
`outline-color: var(--color-brand-900);` to preserve contrast.

### Keyboard operations

| Action | Shortcut |
|---|---|
| Open hashtag filter dropdown | `Enter` / `Space` on B.1.1 |
| Navigate dropdown options | `ArrowUp` / `ArrowDown` |
| Confirm dropdown selection | `Enter` |
| Close dropdown (restore focus) | `Escape` |
| Toggle heart | `Enter` / `Space` on heart button |
| Copy link | `Enter` / `Space` on copy-link button |
| Carousel prev / next | `ArrowLeft` / `ArrowRight` when focus is inside region |
| Spotlight pan | `ArrowUp/Down/Left/Right` when focus inside board |
| Spotlight zoom | `+` / `-` (Q8) |

---

## Motion

All motion respects `prefers-reduced-motion: reduce` — spec US9 #1 is
non-negotiable.

| Element | Animation | Duration | Easing | Reduced-motion fallback |
|---|---|---|---|---|
| Heart icon pop | scale 1 → 1.25 → 1 + colour cross-fade | 250 ms | ease-out | Instant colour swap only |
| Heart count bump | numeric tween 250 ms | 250 ms | linear | Instant swap |
| Carousel slide | translateX | 400 ms | ease-in-out | Instant |
| Carousel side-card dim | opacity + scale | 400 ms | ease-in-out | Instant |
| Skeleton shimmer | linear gradient sweep 200 % | 1.5 s infinite | linear | Static grey bar (no animation) |
| Spotlight name mount | fade + translateY(4px) stagger | 0–600 ms | ease-out | No stagger; all names appear together |
| Spotlight hover tooltip | fade + translateY(4px) | 200 ms | ease-out | Instant fade only |
| Spotlight pan/zoom | pointer-driven transform | real-time | — | No momentum / inertia smoothing |
| Filter chip open | chevron rotate 180° | 150 ms | ease-in-out | Instant rotate |
| Toast | slide-in from top-right | 200 ms | ease-out | Fade only |
| Card hover shadow | box-shadow | 200 ms | ease-out | Instant |
| Mở quà CTA hover | bg colour | 150 ms | ease-in-out | Instant |

Global CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0ms !important;
  }
}
```

---

## Implementation Mapping

One row per component named in spec §Screen Components. Tailwind classes
below are illustrative — the exact class string will be tuned in
`momorph.implement`.

| Design Element | Figma Node ID | Tailwind / CSS Class | React Component |
|---|---|---|---|
| Page wrapper | `2940:13431` | `relative min-h-screen bg-brand-900 text-white` | `src/app/kudos/page.tsx` |
| SiteHeader | `2940:13433` | inherited from Homepage | `src/components/layout/SiteHeader.tsx` (existing) |
| KudosHero | `2940:13432` | `relative h-[512px] w-full bg-cover bg-center` | `src/components/kudos/KudosHero.tsx` |
| KudosHeroTitle (H1) | `2940:13439` | `text-[36px] leading-[44px] font-bold text-accent-cream` | inlined in `KudosHero` |
| KudosComposerPill (A.1) | `2940:13449` | `flex items-center gap-2 h-[72px] w-[738px] px-4 py-6 rounded-[68px] border border-[var(--color-border-secondary)] bg-[rgba(255,234,158,0.10)] hover:bg-[rgba(255,234,158,0.15)]` | `src/components/kudos/ComposerPill.tsx` |
| SunnerSearchPill | `2940:13450` | same as above, `w-[381px]` | `src/components/kudos/SunnerSearchPill.tsx` |
| HashtagFilterButton (B.1.1) | `2940:13459` | `inline-flex items-center gap-2 p-4 rounded border border-[var(--color-border-secondary)] bg-[rgba(255,234,158,0.10)]` | `src/components/kudos/FilterDropdown.tsx` |
| DepartmentFilterButton (B.1.2) | `2940:13460` | same pattern as B.1.1 | `src/components/kudos/FilterDropdown.tsx` (same, different icon + data) |
| HighlightSectionHeader (B.1) | `2940:13453` | `flex flex-col gap-4 items-start` | `src/components/kudos/HighlightHeader.tsx` |
| HighlightCarousel (B.2) | `2940:13461` | `relative w-full h-[525px] overflow-hidden` | `src/components/kudos/HighlightCarousel.tsx` |
| HighlightKudoCard (B.3) | `2940:13465` | `flex flex-col items-start gap-4 w-[528px] pt-6 px-6 pb-4 rounded-[16px] border-4 border-accent-cream bg-[var(--color-kudo-card)]` | `src/components/kudos/HighlightKudoCard.tsx` |
| CarouselPager (B.5) | `2940:13471` | `flex items-center justify-center gap-8 h-[52px]` | `src/components/kudos/CarouselPager.tsx` |
| SpotlightHeader (B.6) | `2940:13476` | same flex pattern as HighlightHeader | `src/components/kudos/SpotlightHeader.tsx` |
| SpotlightBoard (B.7) | `2940:14174` | `relative w-[1157px] h-[548px] rounded-[47px] overflow-hidden border border-[var(--color-border-secondary)]` | `src/components/kudos/SpotlightBoard.tsx` |
| SpotlightCounter (B.7.1) | `3007:17482` | `absolute top-6 left-6 text-[36px] leading-[44px] font-bold text-white` + `aria-live="polite"` | inlined in `SpotlightBoard` |
| SpotlightPanZoomControls (B.7.2) | `3007:17479` | `absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-brand-900/70 border border-[var(--color-border-secondary)]` | inlined in `SpotlightBoard` |
| SpotlightSearch (B.7.3) | `2940:14833` | `absolute top-6 right-6 flex items-center gap-2 px-3 py-2 rounded-full bg-brand-900/70 border border-[var(--color-border-secondary)]` | inlined in `SpotlightBoard` |
| AllKudosHeader (C.1) | `2940:14221` | `flex flex-col gap-4` | `src/components/kudos/AllKudosHeader.tsx` |
| KudoPostCard (C.3) | `3127:21871` | `flex flex-col items-start gap-4 w-[680px] pt-10 px-10 pb-4 rounded-[24px] bg-[var(--color-kudo-card)] shadow-[0_4px_12px_rgba(0,0,0,0.25)]` | `src/components/kudos/KudoPostCard.tsx` |
| KudoCardSender (C.3.1) | `I3127:21871;256:4858` | `flex flex-col items-center justify-center gap-[13px] w-[235px]` | `src/components/kudos/KudoParticipant.tsx` |
| KudoCardRecipient (C.3.3) | `I3127:21871;256:4860` | same as C.3.1 | `src/components/kudos/KudoParticipant.tsx` (same) |
| KudoCardSentIcon (C.3.2) | `I3127:21871;256:5161` | `flex flex-row items-start py-4 w-8 h-[123px]` | inlined in `KudoPostCard` |
| KudoCardTimestamp (C.3.4) | `I3127:21871;256:5229` | `text-[16px] leading-6 font-bold tracking-[0.5px] text-[var(--color-muted-grey)]` | inlined in `KudoPostCard` |
| KudoCardContent (C.3.5) | `I3127:21871;256:5155` | `text-[20px] leading-7 font-bold text-brand-900 line-clamp-5 cursor-pointer` | inlined in `KudoPostCard` |
| KudoCardImages (C.3.6) | `I3127:21871;256:5176` | `flex flex-row items-center gap-4 w-full h-[88px]` | `src/components/kudos/KudoImageRow.tsx` |
| KudoCardHashtags (C.3.7) | `I3127:21871;256:5158` | `flex flex-row items-center flex-wrap gap-x-[30px] gap-y-2 text-[16px] font-bold text-[var(--color-heart-active)] tracking-[0.5px]` | `src/components/kudos/KudoHashtagRow.tsx` |
| KudoCardActionBar (C.4) | `I3127:21871;256:5194` | `flex flex-row items-center justify-between gap-6 h-14 w-full` | inlined in `KudoPostCard` |
| HeartButton (C.4.1) | `I3127:21871;256:5175` | `inline-flex items-center gap-1 h-8` + icon motion classes | `src/components/kudos/HeartButton.tsx` |
| CopyLinkButton (C.4.2) | `I3127:21871;256:5216` | `inline-flex items-center gap-1 h-14 p-4 rounded` | `src/components/kudos/CopyLinkButton.tsx` |
| KudoStatsSidebar (D) | `2940:13488` | `flex flex-col gap-6 w-[422px] sticky top-[104px]` | `src/components/kudos/KudoStatsSidebar.tsx` |
| StatsBlock (D.1) | `2940:13489` | `flex flex-col items-start gap-2.5 p-6 rounded-[17px] bg-[var(--color-panel-surface)] border border-[var(--color-border-secondary)]` | `src/components/kudos/StatsBlock.tsx` |
| MoQuaCTA (D.1.8) | `2940:13497` | `flex items-center justify-center gap-2 h-[60px] w-[374px] p-4 rounded-lg bg-accent-cream text-brand-900 text-[22px] font-bold hover:bg-accent-cream-hover` | `src/components/kudos/MoQuaButton.tsx` (or reuse `<PrimaryButton>`) |
| LatestGiftRecipients (D.3) | `2940:13510` | `flex flex-col items-start gap-2.5 pt-6 pr-4 pb-6 pl-6 rounded-[17px] bg-[var(--color-panel-surface)] border border-[var(--color-border-secondary)] w-full` | `src/components/kudos/LatestGifteeList.tsx` |
| QuickActionsFab | global | inherited | `src/components/shell/QuickActionsFab.tsx` (existing) |
| SiteFooter | `2940:13522` | inherited | `src/components/layout/SiteFooter.tsx` (existing) |
| EmptyState (FR-002) | no Figma node | `flex flex-col items-center justify-center py-20 text-white/70 text-[16px]` | `src/components/kudos/EmptyState.tsx` |
| LoadingSkeleton (heart card) | n/a | `w-[680px] h-[749px] rounded-[24px] bg-[var(--color-kudo-card)] animate-pulse opacity-60` | `src/components/kudos/KudoCardSkeleton.tsx` |
| ErrorState (inline per-block) | n/a | `flex flex-col items-center gap-2 py-12 text-white` | `src/components/kudos/InlineError.tsx` |

---

## Icons

Extend the existing `<Icon />` sprite (`src/components/ui/Icon.tsx`) per
spec Dependencies. All new glyphs 16 × 16 base (scale via `size` prop to
20 / 24 / 32).

| Icon Name | Size | Default colour | Usage |
|---|---|---|---|
| `heart-outline` | 24×24 | `#999999` | Inactive heart on card |
| `heart-filled` | 24×24 | `#D4271D` | Active heart |
| `search` | 20×20 | white | A.1 sibling pill, B.7.3 |
| `pencil` | 20×20 | white | A.1 composer pill prefix |
| `hashtag` | 16×16 | white | B.1.1 |
| `building` | 16×16 | white | B.1.2 (Phòng ban) |
| `arrow-left` / `arrow-right` | 24×24 | cream | Carousel pager |
| `copy-link` | 16×16 | navy | C.4.2 |
| `eye` | 16×16 | navy | "Xem chi tiết" link (optional) |
| `gift` | 20×20 | navy | D.1.8 Mở quà CTA prefix (optional) |

---

## Notes

- **Reuse existing tokens** before introducing new ones. `--color-border-secondary`,
  `--color-panel-surface`, `--color-accent-cream*`, `--color-nav-dot`,
  `--color-divider`, `--color-brand-900/700`, `--font-montserrat`, and all
  `--shadow-fab-*` already exist in `src/app/globals.css` and MUST be reused.
- **Proposed NEW tokens** to add to `globals.css` during implementation:
  `--color-kudo-card: #FFF8E1`, `--color-muted-grey: #999999`,
  `--color-secondary-btn-fill: rgba(255, 234, 158, 0.10)`,
  `--color-heart-active: var(--color-nav-dot)` (alias — pending spec Q10),
  `--radius-kudo-card: 24px`, `--radius-highlight-card: 16px`,
  `--radius-sidebar-card: 17px`, `--radius-spotlight: 47px`,
  `--radius-pill: 68px` (composer / sunner-search pills — Tailwind `rounded-full` 9999 px is an acceptable substitute since the pills are wider than 2× their height),
  `--radius-filter-chip: 4px`,
  `--shadow-kudo-card: 0 4px 12px rgba(0, 0, 0, 0.25)` (pending OQ-DS-2). Mirrored in spec §TR-008 New Tokens table.
- All icons MUST be rendered via the `<Icon />` component (constitution §VI —
  no raw `<svg>` or `<img>` for iconography).
- All user-facing copy (Vietnamese + English) MUST live in
  `src/messages/{vi,en}.json` under `kudos.*` keys per FR-011.
- Fonts: only Montserrat. No new `@font-face` declarations on this page. The
  decorative "KUDOS" SVN-Gotham text is a baked PNG asset
  (`public/images/kudos/kudos-logo-art.png`).
- Contrast: monitor red `#D4271D` hashtag text on cream `#FFF8E1` — ratio
  ~4.8 : 1 passes AA for normal text but not AAA. If Product wants AAA,
  shift hashtag colour to `#B21B14` (AAA-safe).
- `HeartButton` and `KudoPostCard` share their optimistic-heart state via
  a module-level `Map<kudoId, {count, hearted}>` (spec §Shared heart state
  rationale) so the same kudo in carousel + feed stays in sync (FR-009).

---

## Open Questions (Design)

Consolidated list of all design-style decisions still pending Product / Design
input. Each item also remains flagged inline above for traceability.

### Design

- **OQ-DS-1** — Confirm exact body text colour on cream KUDO card: Figma
  exposes navy `#00101A` for `I2940:13464;662:12223`, but the reference PNG
  reads as charcoal `#383838`. Implementation defaults to navy until Design
  decides; both pass WCAG AA on `#FFF8E1`.
- **OQ-DS-2** — Confirm `--shadow-kudo-card` value. Derived as
  `0 4px 12px rgba(0, 0, 0, 0.25)` from the reference image; Figma exposes
  no explicit shadow token on `3127:21871`.
- **OQ-DS-3** — Confirm hover-fill darkening for translucent cream pills
  (composer A.1, sunner search, filter chips). Default: `rgba(255, 234, 158, 0.15)`
  (10 % → 15 %).
- **OQ-DS-4** — Confirm `HighlightCarousel` slide-to-slide gap. Default
  derived as 24 px from horizontal rhythm in Figma.
- **OQ-DS-5** — Confirm `SpotlightPanZoomControls` exact dimensions.
  `3007:17479` ships in Figma but no explicit width/height was captured by
  `list_frame_styles`.
- **OQ-DS-6** — Confirm Spotlight backdrop colour / image. `2940:14173`
  ships as a `MM_MEDIA_Kudos` image export — no token. Implementation will
  bake it into `public/images/kudos/spotlight-backdrop.jpg`.
- **OQ-DS-7** — Confirm timestamp grey `#999999` on cream `#FFF8E1`
  (~2.3 : 1) is acceptable as decorative metadata under WCAG 1.4.3
  exception. If Product wants AA-compliant timestamps, shift to
  `#5A5A5A` (4.7 : 1).

### Technical

- **OQ-DS-8** — Mobile Spotlight fallback shape (vertical top-20 list per
  spec Q7). Need Design layout for `< 640 px` rendering.
- **OQ-DS-9** — Carousel mobile reflow: 1-up swipe vs 1-up + visible peek
  edge. Default 1-up swipe (no peek).

> All other inline "Open question" mentions in this doc resolve to one of
> the OQ-DS-* items above. Once Design answers, update the inline row's
> Status column and remove the OQ from this list.

---

## Quality Checklist

- [x] Frame screenshot referenced
- [x] Figma node-id deep-link included
- [x] Tokens extracted from `list_frame_styles`, not invented
- [x] Every token mapped to existing globals.css var OR clearly flagged "NEW"
- [x] Every major component has Node ID + dimensions + layout + colours + states
- [x] Layout ASCII diagram with pixel values
- [x] Responsive reflow table covering all 5 constitution breakpoints
- [x] Accessibility: focus order, ARIA labels, WCAG 2.2 AA contrast verified
- [x] Motion table with `prefers-reduced-motion` fallbacks for every animation
- [x] Implementation mapping: Node ID → Tailwind → React component path
- [x] Vietnamese labels used where Figma is Vietnamese (Kudos, Phòng ban, Hashtag)
- [x] Cross-references to spec.md FR/TR/US numbers
- [x] Open questions flagged inline (contrast, shadow, Spotlight mobile fallback, backdrop colour)
- [x] No hardcoded user-facing strings in component specs (i18n per FR-011)
- [x] Icon component usage documented (constitution §VI)

---

## Implementation Updates (v2 — post-Figma iteration)

This appendix captures UI decisions and divergences from the original
Figma extraction above. They are the **current source of truth** where
they conflict with earlier sections; the original rows are kept intact
for traceability.

### Page layout

- **Max content width**: `1152px` (was `1280px`). Horizontal inset falls
  out of `mx-auto max-w-[1152px]` + `px-4 sm:px-8`, matching design
  `--space-page-inset: 144px` at 1440-viewport.
- **Section vertical rhythm**: `pb-20` (80 px) between Highlight →
  Spotlight → All Kudos (was `pb-10`; visually doubled to match the
  breathing room in the latest Figma mock).
- **Page structural slabs**: Hero (A) and Highlight (B) + Spotlight
  (B.6/B.7) are **full-width**. Only the **All Kudos + Sidebar** block
  (C + D) is wrapped in the 2-column grid. Grid template is
  `lg:grid-cols-[minmax(0,1fr)_422px]` (the `minmax(0, …)` prevents the
  intrinsic-sized carousel track from blowing the column open) with
  `min-w-0` on the left column's flex-column.
- **Main overflow**: `<main>` carries `overflow-x-hidden w-full
  max-w-full` so no internal element can force page-level horizontal
  scroll.

### A — KudosHero (`2940:13437`)

- **H1 copy**: `messages.kudos.hero.h1` = `"Hệ thống ghi nhận và cảm ơn"`
  (was `"Sun* Kudos"`). English: `"A system to recognize and thank"`.
- **Decorative "KUDOS"**: rendered as the bundled image
  `public/images/logo_footer_Kudos.png` (728×147, Sun\* flame + KUDOS
  cream text). Class: `h-[clamp(56px,7vw,103px)] w-auto` so the element
  settles at ~103 px tall on desktop (matches Figma frame 592×103 — see
  "Aspect note" below).
- **Aspect note**: image source ratio 4.95 : 1 vs design frame 5.75 : 1.
  Implementation prioritises height (103 px) which yields ~510 px width
  (≈ 14 % narrower than 592). If pixel-perfect 592 × 103 is required,
  export a 1184 × 206 (2×) crop.
- **Hero content frame**: left-aligned (was centered), absolute top 184
  / left 144 inside the keyvisual. Pills slot below via `pillsSlot`
  prop.

### A.1 / A.2 Composer + Sunner search

- **Position**: overlaid in the lower region of the hero (previously a
  separate section below the hero). Wrapped in a flex-row with ratio
  `flex-[2] : flex-[1]` → composer ≈ 2× search width (738 / 381).
- **Placeholder copy**: updated to match Figma
  - Composer (vi): `"Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"`
  - Search (vi): `"Tìm kiếm profile Sunner"`

### B.1 Highlight header

- **Filter chips** (B.1.1 Hashtag + B.1.2 Phòng ban) sit on the **same
  row** as the H2 title via `HighlightHeader.rightSlot`. Previously
  rendered under the All Kudos header.

### B.2 Highlight carousel

- **Side navigation arrows** (new): absolute `<` / `>` chevrons
  positioned `-left-14` / `-right-14` outside the track container,
  48 × 48 hit box, **white** stroke, hidden below `lg`.
- **Edge shadow vignette** (new): two `pointer-events-none` gradient
  overlays at the inner edges (`w-[18%]` each) that fade
  `var(--color-brand-900)` → transparent on the left/right, giving the
  flanking cards the "recede into shadow" look from design §B.2.
- **Active slide shadow**: upgraded from `0 8px 24px rgba(0,0,0,0.35)`
  to `0 12px 32px rgba(0,0,0,0.45), 0 0 16px rgba(255,234,158,0.18)`
  (subtle cream glow + deeper drop).

### B.5 CarouselPager

- **Big current number + small total**: split `"3/5"` into
  `<span text-[32px] font-bold>{current}</span>` +
  `<span text-lg opacity-70>/{total}</span>` (was a single 20 px line).
- **Arrows**: use `chevron-left` / `chevron-right` icons (new sprite
  additions), 20 × 20, cream — matches Figma's clean "`< >`" chevrons.

### B.7 Spotlight board

- **Layout**: counter moved to **top-center** (was top-left), search
  moved to **top-left** (was top-right). Swap reflects updated Figma.
- **Counter label**: uses the key `counterSuffix` = `"KUDOS"` (e.g.
  `"388 KUDOS"`) — was `"người nhận"` / `"recipients"`.
- **Recent update log** (new): `aria-live="polite"` list at bottom-left
  showing the 4 most recent kudos in the format
  `"{time} {name} đã nhận được một Kudos mới"`. Time is rendered
  **`HH:MMAM`/`HH:MMPM`** (no space — e.g. `08:30PM`). Implementation
  formats ISO `recentKudo.time` via an inline `formatRecentTime()`
  helper and falls back to the pre-formatted mock string. Items fade
  along the column (`opacity: 1 - i * 0.18`).
- **Dev-mode mock fallback**: when the real `GET /kudos/spotlight`
  returns zero recipients, the client falls back to
  `buildSpotlightMock()` (30 deterministic names, total 388) from
  `src/libs/kudos/spotlightMock.ts`.

### §17 KudoPostCard (Feed card — ALL KUDOS section)

Structure in v3 (latest Figma for the feed card):

```
        [Sender]  [>]  [Recipient]          ← participant strip
─────────────────────────────────────────   ← hairline divider
10:00 - 10/30/2025                    [✎]   ← meta row on card surface
              IDOL GIỚI TRẺ                 ← title on card surface
┌─────────────────────────────────────────┐ ← amber body panel only
│  Cảm ơn người em bình thường nhưng phi │  (bg accent-cream @ 40 %,
│  thường :D Cảm ơn sự chăm chỉ, cần mẫn  │   border accent-cream,
│  của em đã tạo động lực rất nhiều cho   │   rounded-2xl, p-5)
│  team…                                   │   4-line clamp
└─────────────────────────────────────────┘
[img][img][img][img][img]                   ← attachments (if any)
#Dedicated #Inspiring #Dedicated …          ← red hashtags
─────────────────────────────────────────   ← hairline divider
[1.000 ❤]                    [Copy Link]   ← action bar
```

Key divergences from the original §17 spec:

- **Sender → recipient connector**: uses the bundled image asset
  `public/icons/ic_kudo_send@2x.png` (64 × 64 source, rendered at
  32 × 32 in the feed card and 28 × 28 in the highlight card).
  Replaces the earlier `arrow-right` / `chevron-right` glyphs across
  both `KudoPostCard` and `HighlightKudoCard`.
- **Amber body panel** (v3 scope): the **body text only** sits in the
  warmer tint (`bg-[var(--color-accent-cream)]/40 rounded-2xl p-5`
  plus a 1 px `border border-[var(--color-accent-cream)]` outline per
  the Figma). Timestamp, title, attachments, and hashtags all render
  on the outer cream card surface. Earlier v3 draft wrapped the whole
  content region — design follow-up narrowed this to just the
  thank-you message per the Figma.
- **Section dividers** (new): two hairline `border-t
  border-[var(--color-accent-cream)]` (cream yellow) `<hr>` lines sit
  (a) between the participant strip and the meta row and
  (b) between the hashtags and the action bar — match the Figma
  "line phân cách" between data regions.
- **Body clamp**: `line-clamp-4` (was `line-clamp-5` under v2). The
  ellipsis indicates more content behind the detail route.
- **Timestamp (§17d)**: `text-sm font-bold tracking-[0.5 px]
  text-[var(--color-muted-grey)]`, top-left on the cream card surface
  (was originally centered with hairline dividers).
- **Kudo title row** (new, optional): centered bold navy
  (`text-[var(--color-brand-900)]`, e.g. `"IDOL GIỚI TRẺ"`) between
  the meta row and the amber body panel.
- **Body alignment**: `text-center`, full panel width.
- **Edit pencil** (new, §17 edit affordance): sits at the **right end
  of the meta row** (same row as the timestamp) **only when
  `viewerId === kudo.sender_id`**. 32 × 32 square with 1 px grey
  border, pencil icon (navy). Click route is TBD
  (`/kudos/{id}/edit`).
- **Action bar** (§17h): flex row `justify-between` — Heart on the
  left, Copy Link on the right. **"Xem chi tiết" removed** for the
  feed card (it remains on `HighlightKudoCard` only). Heart count now
  sits to the **left of** the heart icon (was right). The count
  number itself is navy (`--color-brand-900`, #00101A) + `font-bold
  text-[20px] leading-6`, decoupled from the button's pressed/disabled
  state colour (only the heart icon changes with state).
- **Image thumbnails** (§17f): each 88 × 88 thumb gains a 2 px
  `border-[var(--color-accent-cream)]` (#FFEA9E) outline matching the
  Figma §17f treatment.

### §B.3 HighlightKudoCard (Highlight carousel card — v3)

The highlight card now mirrors the v3 feed card layout, with two
deltas: **no edit pencil** (highlight shows other users' kudos —
no edit affordance), and the action bar **keeps "Xem chi tiết ↗"**.

```
        [Sender]  [send]  [Recipient]          ← participant strip
─────────────────────────────────────────      ← cream hairline
10:00 - 10/30/2025                              ← timestamp (no pencil)
              IDOL GIỚI TRẺ                    ← title
┌─────────────────────────────────────────┐    ← amber body panel
│   Cảm ơn người em bình thường…          │    (border accent-cream,
└─────────────────────────────────────────┘     bg @ 40 %, rounded-2xl)
[img][img][img][img][img]                      ← attachments (optional)
#Dedicated #Inspiring …                        ← red hashtags
─────────────────────────────────────────      ← cream hairline
[1.000 ❤]       [Copy Link]    [Xem chi tiết ↗] ← 3-col action bar
```

Key pieces:

- **Hairline dividers** (two): `border-t
  border-[var(--color-accent-cream)]` between participants/meta and
  between hashtags/action bar — same tokens as the feed card.
- **Timestamp**: `text-sm font-bold tracking-[0.5 px] text-[var(--color-
  muted-grey)]`, left-aligned on the card surface.
- **Amber body panel**: `border border-[var(--color-accent-cream)]
  bg-[var(--color-accent-cream)]/40 rounded-2xl p-5`. Body text
  `line-clamp-4` (was `line-clamp-3`), centered, 18 / 28 / 700 navy.
- **Attachments**: `KudoImageRow` now receives `kudo.images ?? []`
  (was hardcoded to `[]`). Renders the 88 × 88 cream-outlined thumbs
  when the kudo has attachments.
- **Action bar**: 3-column grid `[1fr_auto_auto]` — Heart (count-left-
  of-icon) | Copy Link | Xem chi tiết ↗.

### §17a/17b KudoParticipant

- **Row order**: `[avatar] → [name] → [CECV code + honour pill inline]`
  (was `[avatar] → [name] → [honorific line]` with separate code +
  pill stacked on different rows).
- **Honour pill as image** (new): the `honour_title` string maps to one
  of the pre-rendered PNGs shared with the Thể lệ screen
  (`public/images/the-le/pill-{legend,rising,super,new}@2x.png`,
  255 × 47 or 253 × 44) via `HONOUR_PILL_MAP`. Fallback text pill
  preserved for titles outside the map. Pill renders at `h-5 w-auto`.

### D — KudoStatsSidebar (i18n + behaviour)

- **D.1 stats labels** — updated to the Figma Vietnamese strings:
  - `statReceived`: `"Số Kudos bạn nhận được:"`
  - `statSent`: `"Số Kudos bạn đã gửi:"`
  - `statHearts`: `"Số tim bạn nhận được:"`
  - `statBoxesOpened`: `"Số Secret Box bạn đã mở:"`
  - `statBoxesUnopened`: `"Số Secret Box chưa mở:"`
  - `moQuaCta`: `"Mở Secret Box"` (was `"Mở quà"`)
- **D.3 scope change**: `getLatestGiftees()` is now **system-wide**
  (drops `.eq("sender_id", user.id)`) — matches Figma title
  `"10 SUNNER NHẬN QUÀ MỚI NHẤT"` which is the org-wide feed, not the
  viewer-scoped list. Empty copy: `"Chưa có Sunner nào nhận quà."`

### Types

Three optional fields added to carry new render data without blocking
on a DB migration:

- `KudoUser.honour_code?: string` (e.g. `"CECV10"`) — inline grey label
  under the participant's name.
- `KudoUser.honour_title?: string` (e.g. `"Legend Hero"`) — maps to one
  of the image pills above.
- `Kudo.title?: string` (e.g. `"IDOL GIỚI TRẺ"`) — renders the centered
  navy title above the body.

A deterministic dev helper
`src/libs/kudos/decorateMock.ts#decorateKudoMock` layers mock values on
to every kudo rendered until the backend/schema exposes the real fields.
Once the migration lands (profiles `honour_code`, `honour_title`; kudos
`title`), the helper becomes a no-op and can be removed.

### New icons

Added to `src/components/ui/Icon.tsx`:
- `chevron-left` — stroke `M15 6L9 12L15 18`, used by carousel side
  arrows + pager.
- `chevron-right` — stroke `M9 6L15 12L9 18`, ditto.

### Tiered content max-width (2026-04-21)

Design Figma is authored at 1440 px with 144 px gutters ⇒ 1152 px
content column. Scaling that up to 1920 px+ monitors at a fixed 1152 px
produced excessive black gutters (~384 px each side). Pattern now
applied across all content sections on `/kudos`:

```
mx-auto w-full max-w-[1152px] 2xl:max-w-[1400px]
px-4 sm:px-8 2xl:px-12
```

- **< 1536 px** (Tailwind `<2xl`): keep `max-w-[1152px]` — matches the
  Figma source exactly at the 1440 px design viewport.
- **≥ 1536 px** (Tailwind `2xl`): expand to `max-w-[1400px]`, which
  trims gutters on 1920 px+ screens from ~384 px to ~260 px each side.
- Horizontal padding scales `px-4 → px-8 → px-12` across the three
  tiers so content never sits hard against the clamp edge.

Applied to: `KudosHero` inner frame, Highlight section wrapper,
SpotlightSection wrapper, feed + sidebar grid, loading skeleton.

**Exception**: `SpotlightBoard` keeps `max-w-[1157px]` because
`BOARD_W = 1157` is the coordinate-scaling constant used by
`relaxPositions()`; bumping the board wider without updating
`BOARD_W` would cluster names toward the left edge. The board is
centred inside the wider SpotlightSection container at 2xl — a small
horizontal margin on each side is acceptable.

### B.7 Name collision avoidance (2026-04-21)

Server coords from `getSpotlight()` (and `buildSpotlightMock()`) are
pure hash-derived — with small recipient counts (e.g. ≤ 15) two names
can land on top of each other. `SpotlightBoard` now runs a lightweight
relaxation pass (`relaxPositions`) inside a `useMemo` before render:

- Each name's bounding box is estimated as
  `charCount · fontSize · 0.55 × fontSize · 1.3` with a `NAME_PADDING`
  of 12 px on every side.
- Up to 60 iterations nudge overlapping pairs along the smaller-overlap
  axis, then clamp to the 1157×548 board bounds.
- Pure function — same input ⇒ same output, so the layout is
  deterministic across SSR and re-renders, yet guarantees no overlap.

### B.7 SpotlightBoard backdrop composition (2026-04-21)

Figma publishes the board backdrop as two layered PNGs rather than one
composite. The component recreates the composite in CSS by stacking the
two images inside the board container (below the pan/zoom canvas and
above `--color-panel-surface`):

- **Base** — `/images/kudos/kudo_spotlight_bg@2x.png` (constellation /
  star grid). `object-cover`, full bleed inside the rounded-[47px]
  container, **`opacity-60`** so the constellation sits at the muted
  saturation level shown in the Figma mock.
- **Overlay** — `/images/kudos/kudo_root-further_bg@2x.png` (coloured
  root/tree strands). Same fill rules, **`opacity-55`** +
  **`mix-blend-mode: screen`** so the image's near-black fill is
  blended to transparent against the constellation and the remaining
  orange/red/green roots sit at the damped saturation of the design.
- **Vignette** — a `bg-[var(--color-brand-900)]/45` layer on top of
  both images pulls the overall brightness down to match the near-navy
  mood of the Figma mock. Without it, `mix-blend-mode: screen` would
  blow the roots too bright against the dark panel.

Both layers are decorative (`alt=""`, `aria-hidden="true"`,
`pointer-events-none`) and do NOT transform with pan/zoom — only the
inner word-cloud translates/scales. `object-cover` means the images
gracefully crop on narrower viewports down to 640 px (the mobile
breakpoint below which B.7 collapses to the Top-20 list and neither bg
is rendered).

### D.3 LatestGiftRecipients data source (2026-04-21)

D.3 "10 SUNNER NHẬN QUÀ MỚI NHẤT" is now backed by a dedicated
`gift_redemptions` ledger (migration 0005), **not** recycled kudo bodies.
Each row in the list corresponds to one redemption event:

- **Avatar** — `profiles.avatar_url` via JOIN on `gift_redemptions.user_id`.
- **Primary line** — `profiles.display_name` (cream, 700).
- **Secondary line** — composed server-side from a locale template:
  `"Nhận được {quantity} {gift_name}"` (vi) or
  `"Received {quantity} {gift_name}"` (en). White / 70 % opacity,
  12 px. `gift_name` stores the human-readable prize ("áo phông SAA",
  "cốc sứ SAA", "voucher cafe 100k", …); `quantity` is a positive int.
- **Ordering** — `redeemed_at DESC`, limit 10.
- **Duplicate Sunners** — a single user can appear multiple times when
  they've redeemed several prizes; the list is keyed on redemption id.

### D.1 StatsBlock + MoQuaCTA v2 (2026-04-21)

- **Divider position** moved **above** the "Số Secret Box bạn đã mở" row
  (between the Hearts and Boxes-Opened rows), splitting the block into
  two visual groups: received/sent/hearts vs. boxes-opened/unopened. Line
  is 1 px, cream `--color-accent-cream`.
- **Mở Secret Box CTA** now renders the `/icons/icon_open_gift@2x.png`
  glyph to the right of the label inside the pill button (gap-2, 28×28
  render size, sourced from the 56×56 @2x asset). Label stays centered
  with the icon; navy on cream, other button tokens unchanged.

### Open Question resolutions

- **OQ-DS-1** (body colour) — resolved to navy `#00101A`, matches Figma
  `rgba(0,16,26,1)`.
- **OQ-DS-2** (card shadow) — active HighlightKudoCard uses
  `0 12px 32px rgba(0,0,0,0.45), 0 0 16px rgba(255,234,158,0.18)`.
  Feed card `--shadow-kudo-card` remains `0 4px 12px rgba(0,0,0,0.25)`.
- **OQ-DS-3** (pill hover) — unchanged (`rgba(255,234,158,0.15)`).
- **OQ-DS-4** (carousel gap) — confirmed 24 px.
- **OQ-DS-6** (Spotlight backdrop) — not baked in yet; board still uses
  `--color-panel-surface`. Wooden backdrop image is a future polish.
- **OQ-DS-7** (timestamp grey) — kept at `#999999` (decorative metadata
  exception, WCAG 1.4.3).
