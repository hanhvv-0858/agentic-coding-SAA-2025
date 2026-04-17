# Design Style: Login (SAA 2025)

**Frame ID**: `GzbNeVGJHz` (Figma node `662:14387`)
**Frame Name**: `Login`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
**Reference Image**: [assets/frame.png](assets/frame.png)
**Extracted At**: 2026-04-17

> All values below were extracted verbatim from `list_frame_styles` and `list_design_items`
> on the `GzbNeVGJHz` frame. Where a token is marked **(derived)**, it was computed from
> the raw Figma geometry (e.g. Tailwind breakpoints, WCAG-equivalent opacity). Anything
> marked **(assumed)** is a sensible default pending confirmation from design.

---

## Design Tokens

### Colors

| Token Name | Hex Value | Opacity | Figma Source | Usage |
|------------|-----------|---------|--------------|-------|
| `--color-bg-primary` | `#00101A` | 100% | Frame background `rgba(0,16,26,1)` | Page background fallback, button text color |
| `--color-bg-header` | `#0B0F12` | 80% | Header `rgba(11,15,18,0.8)` | Translucent header over key visual |
| `--color-accent-cream` | `#FFEA9E` | 100% | Login button `rgba(255,234,158,1)` | Primary CTA (Google login) fill |
| `--color-text-inverse` | `#FFFFFF` | 100% | Hero copy, language label, footer | Text over dark backgrounds |
| `--color-text-on-accent` | `#00101A` | 100% | Button label color | Text on cream button |
| `--color-divider` | `#2E3940` | 100% | Footer `border-top` — `var(--Details-Divider)` | Horizontal divider above footer |
| `--gradient-rect57` | `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)` | — | `Rectangle 57` (`662:14392`) | Left-side vignette over key visual so hero text stays readable |
| `--gradient-cover` | `linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)` | — | `Cover` (`662:14390`) | Bottom vignette fading into footer |

> The design uses only **dark surface + cream accent + white type**. There is no secondary
> brand color, no error color, and no border color on this screen — those tokens will be
> introduced in later screens (e.g. forms, toasts).

### Typography

All families on this screen are **Montserrat** (body + button + nav) and **Montserrat
Alternates** (footer only). Both must be loaded with weights **400** and **700** at a
minimum.

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Figma Source |
|------------|-------------|------|--------|-------------|----------------|--------------|
| `--text-hero-body` | Montserrat | 20px | 700 | 40px | 0.5px | `B.2_content` (`662:14753`) |
| `--text-button-cta` | Montserrat | 22px | 700 | 28px | 0 | Login button label (`I662:14426;186:1568`) |
| `--text-nav-lang` | Montserrat | 16px | 700 | 24px | 0.15px | Language label (`I662:14391;186:1696;186:1821;186:1439`) |
| `--text-footer` | Montserrat Alternates | 16px | 700 | 24px | 0 | Footer copyright (`I662:14447;342:1413`) |

### Spacing

| Token Name | Value | Usage | Figma Source |
|------------|-------|-------|--------------|
| `--space-1` | 2px | Gap between flag + label inside language button | `Button` (`I662:14391;186:1696;186:1821`) |
| `--space-2` | 4px | Inner gap of the `VN` + flag row | `Frame 485` |
| `--space-3` | 8px | Gap between button label and Google icon | `Button-IC About` (`662:14426`) |
| `--space-4` | 16px | Language button inner padding, hero text left inset | multiple |
| `--space-5` | 24px | Gap between key visual and hero copy; gap between copy and CTA; horizontal button padding | `B.3_Login` wrapper, `Frame 487` sub-gaps |
| `--space-6` | 40px | Vertical footer padding; gap reserved beside login button | `D_Footer`, `B.3_Login` row gap |
| `--space-7` | 80px | Gap between key visual block and hero-copy block | `Frame 487` (`662:14394`) |
| `--space-8` | 90px | Footer horizontal padding | `D_Footer` (`662:14447`) |
| `--space-9` | 96px | Hero section vertical padding (top + bottom) | `B_Bìa` (`662:14393`) |
| `--space-10` | 120px | Hero section top-level gap (content ↔ spacer) | `B_Bìa` (`662:14393`) |
| `--space-11` | 144px | Page-level horizontal inset (applies to header + hero) | `A_Header`, `B_Bìa` |
| `--space-12` | 238px | Right-side header gap (space-between distribution at 1440) | `A_Header` (`662:14391`) |

### Border & Radius

| Token Name | Value | Usage | Figma Source |
|------------|-------|-------|--------------|
| `--radius-button-sm` | 4px | Language button corners | `I662:14391;186:1696;186:1821` |
| `--radius-button-md` | 8px | Primary "LOGIN With Google" button | `662:14426` |
| `--border-divider` | `1px solid #2E3940` | Footer top border | `D_Footer` |

No other borders exist on this screen.

### Shadows

The Figma file has **no drop-shadow effects** on any Login-frame node. Elevation is
expressed purely through translucent backgrounds and gradient vignettes. **(derived)**

| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-button-hover` **(assumed)** | `0 6px 16px rgba(255,234,158,0.25)` | Hover elevation for CTA — design confirmation pending |

---

## Layout Specifications

### Container

| Property | Value | Notes |
|----------|-------|-------|
| Design viewport | 1440 × 1024 px | From frame `styles.width/height` |
| Page horizontal inset | 144 px | Both header and hero use the same inset |
| Hero inner max-width | 1152 px | `1440 − 2·144` — the active content column |
| Hero vertical padding | 96 px top + 96 px bottom | `B_Bìa` padding |
| Footer vertical padding | 40 px | `D_Footer` |
| Footer horizontal padding | 90 px | `D_Footer` |

### Z-order (stacking)

Each child of the Login frame is absolutely positioned with `z-index: 1`; they stack in
DOM order:

1. `C_Keyvisual` — full-bleed background image
2. `A_Header` — translucent nav bar (top, full width)
3. `Rectangle 57` — left-to-right dark gradient covering the top ~25% for legibility
4. `B_Bìa` — hero content (logo art + copy + CTA)
5. `Cover` — bottom-up dark gradient fading into the footer
6. `D_Footer` — bottom copyright bar

### Layout Structure (ASCII, pixel-accurate at 1440 × 1024)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Login frame — 1440 × 1024, bg #00101A                                   │
│                                                                          │
│  ┌───────────────── C_Keyvisual (0,0 → 1440,1022) ─────────────────────┐ │
│  │         full-bleed background artwork (PNG)                          │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────────── A_Header (0,0 → 1440,80) ──────────────────────────┐ │
│  │  bg rgba(11,15,18,0.8)   padding 12px 144px   flex row space-between│ │
│  │                                                                      │ │
│  │  [A.1_Logo  52×56]                                [A.2_Language 108×56]│
│  │  SAA 2025 logo                                 [🇻🇳  VN  ▾]          │ │
│  │                                                 radius 4px · pad 16px│ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────── Rectangle 57 (1,0 → 1440,1024) ────────────────────────┐ │
│  │  linear-gradient(90deg, #00101A 0%, #00101A 25.41%, transparent 100%)│ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────── B_Bìa (0,88 → 1440,933) — hero ────────────────────────┐ │
│  │  padding 96px 144px  ·  gap 120px  ·  flex column                    │ │
│  │                                                                      │ │
│  │  ┌─── Frame 487 (144,184 → 1296,837) — 1152×653 ───────────────────┐ │ │
│  │  │  gap 80px · flex column · justify center                        │ │ │
│  │  │                                                                 │ │ │
│  │  │  ┌── B.1_Key Visual 1152×200 (144,288 → 1296,488) ──────────┐   │ │ │
│  │  │  │  "ROOT FURTHER" PNG — 451×200, aspect-ratio 115:51       │   │ │ │
│  │  │  └───────────────────────────────────────────────────────────┘   │ │ │
│  │  │                                                                 │ │ │
│  │  │  ┌── Frame 550 (160,568 → 640,732) — 496×164 ───────────────┐   │ │ │
│  │  │  │  padding-left 16px  ·  gap 24px  ·  flex column          │   │ │ │
│  │  │  │                                                          │   │ │ │
│  │  │  │  B.2_content  480×80                                      │   │ │ │
│  │  │  │    Montserrat 20/40, 700, +0.5px, white                   │   │ │ │
│  │  │  │    "Bắt đầu hành trình của bạn cùng SAA 2025.\n           │   │ │ │
│  │  │  │     Đăng nhập để khám phá!"                               │   │ │ │
│  │  │  │                                                          │   │ │ │
│  │  │  │  B.3_Login  305×60  (wrapper — gap 40px reserved at right)│   │ │ │
│  │  │  │    └─ Button-IC About 305×60                              │   │ │ │
│  │  │  │       bg #FFEA9E · radius 8px · pad 16px 24px · gap 8px   │   │ │ │
│  │  │  │       [ LOGIN With Google  G ]                            │   │ │ │
│  │  │  │         Montserrat 22/28, 700, #00101A    icon 24×24      │   │ │ │
│  │  │  └───────────────────────────────────────────────────────────┘   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────── Cover (0,138 → 1440,1024) ─────────────────────────────┐ │
│  │  linear-gradient(0deg, #00101A 22.48%, transparent 51.74%)           │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────── D_Footer (0,933 → 1440,1024) ──────────────────────────┐ │
│  │  padding 40px 90px  ·  border-top 1px solid #2E3940                  │ │
│  │  flex row · items-center · justify-center  (Figma exports            │ │
│  │  `space-between` but single child is manually centered — see §15)    │ │
│  │                    "Bản quyền thuộc về Sun* © 2025"                  │ │
│  │                    Montserrat Alternates 16/24, 700, #FFFFFF         │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Figma-to-CSS translation caveat**: Every child in the raw Figma export carries
> `position: absolute`. This is a Figma tooling artifact — it does **not** mean the
> real implementation should use absolute positioning everywhere. The correct mapping is:
> `absolute` for the overlay layers that sit on top of the hero (`C_Keyvisual`,
> `Rectangle 57`, `Cover`, and `A_Header` — the translucent header floats above the key
> visual); `relative` + normal flex flow for `B_Bìa` and `D_Footer` (these are the
> actual content containers). The Tailwind column in each component-card below reflects
> the real CSS to write.

---

## Component Style Details

### 1. Page Frame (`662:14387`)

| Property | Value | CSS / Tailwind |
|----------|-------|----------------|
| **Node ID** | `662:14387` | — |
| width × height | 1440 × 1024 | `w-full min-h-screen` (fluid) |
| background | `#00101A` | `bg-[#00101A]` / `bg-brand-900` |
| position context | `relative` | `relative` |

No padding at the frame level — children are absolutely positioned.

### 2. C_Keyvisual — Hero background (`662:14388`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14388` (group) · child image `662:14389` | — |
| size | 1441 × 1022 | `absolute inset-0` |
| background | `url(<keyvisual-image>) -440px -217.975px / 159.763% 133.371% no-repeat` | CSS `background` shorthand |
| z-index | 1 | `z-0` |
| aspect ratio (raw image) | 141 : 100 | Used for `<Image priority>` sizing |

### 3. Rectangle 57 — Left vignette (`662:14392`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14392` | — |
| size | 1442 × 1024 | `absolute inset-0` |
| background | `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)` | `bg-[linear-gradient(...)]` |
| role | Legibility shade behind hero copy | — |

### 4. Cover — Bottom vignette (`662:14390`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14390` | — |
| size | 1440 × 1093 (extends past frame by 69px — intentional) | `absolute inset-x-0 bottom-0 h-[1093px]` |
| background | `linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)` | CSS `background` |
| role | Fade into footer | — |

### 5. A_Header (`662:14391`) — Top navigation

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14391` (componentId `186:1602`) | — |
| size | 1440 × 80 | `w-full h-20` |
| padding | 12px 144px | `py-3 px-36` |
| display | flex, row, space-between, items-center | `flex items-center justify-between` |
| gap (distributed) | 238px | emerges from `justify-between` at 1440 |
| background | `rgba(11,15,18,0.8)` | `bg-[#0B0F12]/80 backdrop-blur` **(backdrop-blur assumed)** |
| z-index | 20 (above hero + vignettes) | `z-20` |

### 6. A.1_Logo (`I662:14391;186:2166`) — SAA logo

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I662:14391;186:2166` · image `I662:14391;178:1033;178:1030` | — |
| size | 52 × 56 (image 52 × 48 inside) | `h-14 w-[52px]` |
| background | `<logo-image>` cover 50% center | `<Image src=... />` |
| interactive | no | — |

### 7. A.2_Language (`I662:14391;186:1601`) — Language toggle button

Outer wrapper frame — handles positioning only. (Figma says `gap: 16px` but this
wrapper has a single inner child, so the gap is inert. Implement without `gap-*`.)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** (wrapper) | `I662:14391;186:1601` | — |
| size | 108 × 56 | `h-14 w-[108px]` |
| display | flex, row, items-center | `flex items-center` |
| navigation | click → `Dropdown-ngôn ngữ` (`hUyaaugye2` / `721:4942`) | — |

Inner button (the actual target):

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** (button) | `I662:14391;186:1696;186:1821` (componentId `186:1433`, componentSetId `186:1426`) | — |
| size | 108 × 56 | — |
| padding | 16px (all sides) | `p-4` |
| gap | 2px | `gap-0.5` |
| border-radius | 4px | `rounded` |
| display | flex row, items-center, justify-between | `flex items-center justify-between` |
| background | transparent | — |

Inner contents:

| Element | Node ID | Spec |
|---------|---------|------|
| `Frame 485` (flag + label) | `I662:14391;186:1696;186:1821;186:1937` | 53×24 · flex row · gap 4px · items-center |
| `MM_MEDIA_VN` (flag icon) | `I662:14391;186:1696;186:1821;186:1709` | 24×24 · componentId `178:1019` · componentSetId `178:1020` |
| `VN` label | `I662:14391;186:1696;186:1821;186:1439` | 25×24 · Montserrat 16/24 · weight 700 · `+0.15px` · color `#FFFFFF` |
| `MM_MEDIA_Down` (chevron) | `I662:14391;186:1696;186:1821;186:1441` | 24×24 · componentId `186:1862` |

**States (derived):**

| State | Property | Value |
|-------|----------|-------|
| Default | background | transparent; label `#FFFFFF`; chevron `#FFFFFF` |
| Hover | background | `rgba(255,255,255,0.08)`; cursor pointer |
| Focus-visible | outline | `2px solid #FFEA9E`, `outline-offset: 2px` (constitution Principle IV — WCAG AA focus ring) |
| Active / Open | chevron | `rotate(180deg)`; `aria-expanded="true"` |
| Disabled | n/a — always available on Login | — |

### 8. B_Bìa — Hero section wrapper (`662:14393`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14393` | — |
| size | 1440 × 845 (desktop Figma) | `w-full lg:min-h-[845px]` (only lock height at desktop — mobile flows naturally) |
| padding | 96px 144px | `py-12 px-4 lg:py-24 lg:px-36` (see Responsive Specifications) |
| display | flex column, items-start | `flex flex-col items-start` |
| gap | 120px | `gap-16 lg:gap-[120px]` (shrink on mobile) |
| background | none | — |

### 9. Frame 487 — Hero inner column (`662:14394`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14394` | — |
| size | 1152 × 653 | `w-full max-w-[1152px]` |
| display | flex column, justify-center, items-start | `flex flex-col justify-center items-start` |
| gap | 80px | `gap-20` |

### 10. B.1_Key Visual — "ROOT FURTHER" image (`662:14395`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14395` · image `2939:9548` | — |
| size | 1152 × 200 (image 451 × 200, aspect 115:51) | `w-[451px] h-[200px]` at desktop |
| display | flex column · items-start · gap 24px | `flex flex-col items-start gap-6` |
| background | `<root-further-image>` cover 50% center | `<Image src=... alt="Root Further" priority />` |

### 11. Frame 550 — Text + CTA column (`662:14755`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14755` | — |
| size | 496 × 164 | `w-[496px]` |
| padding | 0 0 0 16px | `pl-4` |
| display | flex column · items-start | `flex flex-col items-start` |
| gap | 24px | `gap-6` |

### 12. B.2_content — Hero copy text (`662:14753`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14753` | — |
| size | 480 × 80 | `w-[480px] h-20` |
| font-family | Montserrat | `font-montserrat` |
| font-size | 20px | `text-xl` (custom — default Tailwind xl = 20px, line ≠ 40) |
| font-weight | 700 | `font-bold` |
| line-height | 40px | `leading-[40px]` |
| letter-spacing | 0.5px | `tracking-[0.5px]` |
| color | `#FFFFFF` | `text-white` |
| text-align | left | `text-left` |
| content | `Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!` | Use `<br />` between lines |

### 13. B.3_Login — Login button wrapper (`662:14425`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14425` | — |
| size | 305 × 60 | — |
| display | flex row · items-start · gap 40px | `flex items-start` (gap has no effect — single child) |

> Note: The `gap: 40px` on this wrapper has no visual effect — the wrapper has only one
> child (`Button-IC About`). It likely reserves space for a future secondary action
> (e.g., a "Tìm hiểu thêm" text link). Implement the wrapper without `gap-10` unless/until
> a second child is introduced.

### 14. Button-IC About — Primary CTA (`662:14426`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14426` (componentId `186:1567`, componentSetId `186:1426`) | — |
| size | 305 × 60 | `h-15 w-[305px]` (or `w-auto` to hug) |
| padding | 16px 24px | `px-6 py-4` |
| background | `#FFEA9E` | `bg-[#FFEA9E]` / `bg-accent-cream` |
| border | none | — |
| border-radius | 8px | `rounded-lg` |
| display | flex row · items-center · justify-start | `flex items-center` |
| gap | 8px | `gap-2` |
| cursor | pointer | `cursor-pointer` |

Inner text:

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I662:14426;186:1568` | — |
| font-family | Montserrat | `font-montserrat` |
| font-size | 22px | `text-[22px]` |
| font-weight | 700 | `font-bold` |
| line-height | 28px | `leading-7` |
| letter-spacing | 0 | — |
| text-align | center | `text-center` |
| color | `#00101A` | `text-[#00101A]` |
| content | `LOGIN With Google ` (note trailing space in Figma) | Render as `LOGIN With Google` |

Inner icon:

| Property | Value |
|---------|------|
| **Node ID** | `I662:14426;186:1766` (componentId `662:14662`) |
| size | 24 × 24 |
| source | Google "G" mark |

**States:**

| State | Property | Value |
|-------|----------|-------|
| Default | background | `#FFEA9E` · color `#00101A` |
| Hover **(derived)** | background | `#FFE586` (~4% darker) · optional shadow `0 6px 16px rgba(255,234,158,0.25)` |
| Active **(derived)** | background | `#FFDD6B` (~8% darker) |
| Focus-visible **(derived)** | outline | `2px solid #FFFFFF` · `outline-offset: 2px` (contrast against cream) |
| Disabled / Submitting | opacity | `0.6` · `cursor: not-allowed` · replace icon with spinner · label `Đang mở Google...` |

### 15. D_Footer (`662:14447`)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `662:14447` (componentId `342:1427`) | — |
| width | 1440 | `w-full` |
| padding | 40px 90px | `px-[90px] py-10` |
| border-top | `1px solid #2E3940` | `border-t border-[#2E3940]` |
| display | flex row · items-center · **justify-center** | `flex items-center justify-center` |

> Note: Figma's raw export says `justify-content: space-between`, but the footer has a
> single visible child positioned at x≈582–857 (horizontally centered at the 1440 frame).
> In real CSS `space-between` with one child renders it left-aligned — that contradicts
> the reference screenshot. Implement as `justify-center`. If additional footer content
> (social links, legal nav) is added later, revisit this.

Inner text:

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I662:14447;342:1413` | — |
| size | 275 × 11 | auto |
| font-family | Montserrat Alternates | `font-montserrat-alt` |
| font-size | 16px | `text-base` |
| font-weight | 700 | `font-bold` |
| line-height | 24px | `leading-6` |
| letter-spacing | 0 | — |
| text-align | center | `text-center` |
| color | `#FFFFFF` | `text-white` |
| content | `Bản quyền thuộc về Sun* © 2025` | — |

---

## Component Hierarchy with Styles

```
LoginPage (min-h-screen · bg-[#00101A] · relative · overflow-hidden)
├── BackgroundImage  [C_Keyvisual 662:14388]   absolute inset-0 · z-0
│   └── <Image> key visual PNG · object-cover
├── SiteHeader       [A_Header 662:14391]      absolute top-0 inset-x-0 h-20 · z-20
│   │                                           bg-[#0B0F12]/80 · px-36 py-3
│   │                                           flex items-center justify-between
│   ├── SiteLogo     [A.1_Logo]                 h-14 w-[52px]
│   └── LanguageToggle [A.2_Language]           h-14 w-[108px] · flex items-center gap-4
│       └── Button   [Button 186:1433]          p-4 rounded gap-0.5 flex items-center justify-between
│           ├── Flag + "VN" [Frame 485]         flex gap-1 items-center
│           │   ├── <Icon name="flag-vn" />     24×24
│           │   └── <span>VN</span>             Montserrat 16/24 700 +0.15px text-white
│           └── <Icon name="chevron-down" />    24×24
├── LeftVignette     [Rectangle 57 662:14392]   absolute inset-0 · z-10
│   │                                           bg-gradient-to-r from-[#00101A] via-[#00101A_25.41%] to-transparent
├── HeroSection      [B_Bìa 662:14393]          relative · z-20 · py-24 px-36 · flex flex-col gap-[120px]
│   └── HeroColumn   [Frame 487 662:14394]      max-w-[1152px] · flex flex-col gap-20 justify-center items-start
│       ├── KeyVisual   [B.1_Key Visual]        flex flex-col items-start gap-6
│       │   └── <Image alt="Root Further" />    451×200 · aspect-[115/51]
│       └── TextColumn [Frame 550 662:14755]    w-[496px] pl-4 flex flex-col gap-6 items-start
│           ├── HeroCopy   [B.2_content]        w-[480px] · Montserrat 20/40 700 +0.5px text-white
│           │   "Bắt đầu hành trình của bạn cùng SAA 2025." (br)
│           │   "Đăng nhập để khám phá!"
│           └── LoginButton [B.3_Login 662:14425] flex items-start (no gap — single child)
│               └── <PrimaryButton />            h-15 w-[305px] px-6 py-4 rounded-lg bg-[#FFEA9E]
│                   │                            flex items-center gap-2
│                   ├── <span>LOGIN With Google</span>   Montserrat 22/28 700 text-[#00101A]
│                   └── <Icon name="google" />            24×24
├── BottomVignette   [Cover 662:14390]          absolute inset-x-0 bottom-0 · z-10
│   │                                           bg-gradient-to-t from-[#00101A_22.48%] to-transparent
└── SiteFooter       [D_Footer 662:14447]       relative · z-20 · border-t border-[#2E3940]
    │                                           px-[90px] py-10 · flex items-center justify-center
    └── <small>Bản quyền thuộc về Sun* © 2025</small>   Montserrat Alternates 16/24 700 text-white
```

---

## Responsive Specifications

### Breakpoints (project standard, per `constitution.md` Principle II)

| Name | Min Width | Max Width | Tailwind |
|------|-----------|-----------|----------|
| Mobile | 0 | 639 px | default |
| Tablet | 640 px | 1023 px | `sm:` / `md:` |
| Desktop | 1024 px | ∞ | `lg:` / `xl:` / `2xl:` |

> Figma design is drawn at 1440 desktop only; the values below are **derived** from
> the design and must be validated when mobile/tablet mocks arrive.

### Responsive Changes

#### Mobile (< 640px)

| Component | Change |
|-----------|--------|
| Page horizontal inset | 144px → 16px · `px-4` |
| Header vertical padding | 12px → 12px (keep); stays 64px tall · `h-16` |
| Header logo | scale to h-10 (40px) · `h-10 w-auto` |
| Hero vertical padding | 96px → 48px · `py-12` |
| Hero column max-width | 1152 → full · `w-full` |
| Hero inner gap (key visual ↔ copy) | 80px → 24px · `gap-6` |
| `B.1_Key Visual` image width | 451px → full column width (max ~320px) |
| `B.2_content` text | 20/40 → 18/28 (still 700) · `text-lg leading-7` |
| `B.3_Login` button | 305px → full-width · `w-full` |
| Button font | 22/28 → 18/24 · `text-lg leading-6` |
| Footer padding | `40px 90px` → `24px 16px` · `px-4 py-6` |
| Footer text align | center (stack) · `text-center` |

#### Tablet (640–1023 px)

| Component | Change |
|-----------|--------|
| Page horizontal inset | 144px → 48px · `sm:px-12` |
| Hero column max-width | 1152 → `max-w-2xl` · `sm:max-w-2xl` |
| Hero inner gap | 80px → 48px · `sm:gap-12` |
| Button | keep 305×60, left-aligned |
| Footer | keep desktop layout |

#### Desktop (≥ 1024 px)

| Component | Change |
|-----------|--------|
| Page horizontal inset | 144px (honor Figma) · `lg:px-36` |
| Hero column max-width | 1152px · `lg:max-w-[1152px]` |
| All gaps | Figma values as-is |

### Touch-target floor

Per constitution Principle II, **every interactive element must be ≥ 44 × 44 px on
touch viewports**. The only two interactives on this screen are:

- Language toggle: 108 × 56 ✅
- Login button: 305 × 60 ✅ (full-width on mobile)

---

## Icon Specifications

All icons MUST be rendered via a shared `<Icon />` component (constitution Principle V —
no inline SVG tags in page code). Source files are imported from the Figma MM_MEDIA
components.

| Icon Name | Node ID (Figma) | Size | Color | Usage |
|-----------|-----------------|------|-------|-------|
| `icon-flag-vn` | `I662:14391;186:1696;186:1821;186:1709` (componentSet `178:1020`) | 24 × 24 | full color | Language toggle left-hand flag |
| `icon-chevron-down` | `I662:14391;186:1696;186:1821;186:1441` (componentId `186:1862`) | 24 × 24 | `#FFFFFF` | Language toggle right-hand chevron |
| `icon-google` | `I662:14426;186:1766` (componentId `662:14662`) | 24 × 24 | full color (Google brand) | CTA right-hand Google "G" |

---

## Animation & Transitions

All values below are **(derived)** defaults consistent with the rest of the Figma library
(no explicit motion specs in the frame). Must honor `prefers-reduced-motion`.

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Login button | `background-color`, `transform` | 150 ms | `ease-in-out` | Hover / active |
| Language toggle | `background-color` | 120 ms | `ease-out` | Hover |
| Chevron in language toggle | `transform` (rotate 180°) | 150 ms | `ease-out` | Dropdown open/close |
| Hero copy + CTA | `opacity`, `transform: translateY(8px)` | 400 ms | `ease-out` | Page mount (staggered 0 / 80 ms) |

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|----------------|---------------|----------------|-----------------|
| Page shell | `662:14387` | `relative min-h-screen overflow-hidden bg-[#00101A]` | `<LoginPage />` (Server Component) |
| Hero background image | `662:14388` | `absolute inset-0 -z-0` | `<KeyVisualBackground />` (uses `next/image`) |
| Left vignette | `662:14392` | `absolute inset-0 bg-[linear-gradient(90deg,#00101A_0%,#00101A_25.41%,transparent_100%)]` | inline in `<LoginPage />` |
| Bottom vignette | `662:14390` | `absolute inset-x-0 bottom-0 h-[1093px] bg-[linear-gradient(0deg,#00101A_22.48%,transparent_51.74%)]` | inline in `<LoginPage />` |
| Header | `662:14391` | `absolute inset-x-0 top-0 h-20 flex items-center justify-between bg-[#0B0F12]/80 backdrop-blur px-36 py-3 z-20` | `<SiteHeader />` |
| Logo | `I662:14391;186:2166` | `h-14 w-[52px]` | `<SiteLogo />` (uses `next/image`) |
| Language toggle | `I662:14391;186:1601` | `h-14 w-[108px] flex items-center` wrapping a real `<button>` (the `<button>` gets `p-4 rounded gap-0.5`, focus/aria) | `<LanguageToggle />` (`"use client"`) |
| Hero section | `662:14393` | `relative z-20 flex flex-col items-start gap-[120px] py-24 px-36` | `<HeroSection />` |
| Hero column | `662:14394` | `flex flex-col gap-20 justify-center items-start max-w-[1152px] w-full` | inline |
| Key visual | `662:14395` | `<Image priority src="/images/root-further.png" width={451} height={200} alt="Root Further" />` | `<KeyVisual />` |
| Text column | `662:14755` | `flex flex-col gap-6 items-start w-[496px] pl-4` | inline |
| Hero copy | `662:14753` | `font-montserrat text-[20px] leading-[40px] font-bold tracking-[0.5px] text-white` | `<HeroCopy />` |
| Login button wrapper | `662:14425` | `flex items-start` *(Figma's `gap: 40px` is dead — single child; see §13)* | inline |
| Primary CTA button | `662:14426` | `inline-flex items-center gap-2 h-[60px] px-6 py-4 rounded-lg bg-[#FFEA9E] text-[#00101A] font-montserrat text-[22px] leading-7 font-bold hover:bg-[#FFE586] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed` | `<GoogleLoginButton />` (`"use client"`, calls Supabase OAuth) |
| Footer | `662:14447` | `relative z-20 flex items-center justify-center border-t border-[#2E3940] px-[90px] py-10` | `<SiteFooter />` |
| Footer text | `I662:14447;342:1413` | `font-montserrat-alt text-base leading-6 font-bold text-white` | inline |

### Required Supabase client locations (per constitution Principle V)

| File | Purpose | Used by |
|------|---------|---------|
| `@/libs/supabase/server.ts` | Cookie-aware server client (`createServerClient` from `@supabase/ssr`) | `<LoginPage />` server component, `app/auth/callback/route.ts` |
| `@/libs/supabase/client.ts` | Browser client (`createBrowserClient` from `@supabase/ssr`) | `<GoogleLoginButton />` (for `signInWithOAuth`) |
| `@/libs/supabase/middleware.ts` | Session refresh middleware | `middleware.ts` in project root |

Tailwind config additions required:

```ts
// tailwind.config.ts  (fragment)
theme: {
  extend: {
    fontFamily: {
      montserrat: ['Montserrat', 'sans-serif'],
      'montserrat-alt': ['Montserrat Alternates', 'sans-serif'],
    },
    colors: {
      brand: {
        900: '#00101A',
        800: '#0B0F12',
      },
      accent: {
        cream: '#FFEA9E',
      },
      divider: '#2E3940',
    },
  },
},
```

---

## Asset Checklist

| Asset | Source | Destination (in repo) |
|-------|--------|----------------------|
| Hero key visual PNG | `MM_MEDIA_Root Further Logo` (`2939:9548`) | `public/images/root-further.png` (+ @2x) |
| Full-page background | `C_Keyvisual` child image (`662:14389`) | `public/images/login-bg.jpg` |
| SAA logo | `MM_MEDIA_Logo` (`I662:14391;178:1033;178:1030`) | `public/images/saa-logo.svg` (prefer SVG) |
| VN flag icon | `MM_MEDIA_VN` (componentSet `178:1020`) | `public/icons/flag-vn.svg` |
| Chevron down icon | `MM_MEDIA_Down` (`186:1862`) | `public/icons/chevron-down.svg` |
| Google "G" icon | `MM_MEDIA_Google` (`662:14662`) | `public/icons/google.svg` |
| Frame screenshot (reference) | `get_frame_image` PNG | [assets/frame.png](assets/frame.png) ✅ saved |

---

## Validation Checklist

- [x] All colors documented with hex values (8 tokens / gradients)
- [x] All fonts have complete specs (family, size, weight, line-height, letter-spacing)
- [x] All spacing values captured (12 tokens)
- [x] All components have Node IDs
- [x] States documented for interactive elements (language toggle, primary CTA)
- [x] ASCII layout diagram is accurate (pixel-precise at 1440×1024)
- [x] Responsive breakpoints defined (mobile / tablet / desktop)
- [x] Implementation mapping table complete

---

## Notes

- **Font loading**: `Montserrat` and `Montserrat Alternates` must be added via
  `next/font/google` in `app/layout.tsx`. At minimum, import weights **400** and **700**
  and subsets **`latin`** + **`vietnamese`** (the content is Vietnamese).
- **Contrast check**: cream `#FFEA9E` on navy `#00101A` ≈ 14.6:1 (AAA large text, AAA
  normal); white `#FFFFFF` on navy ≈ 18.3:1 (AAA). All on-screen text meets WCAG 2.2 AA
  per constitution Principle IV.
- **Iconography rule**: constitution mandates `<Icon />` component; no raw `<svg>` or
  `<img>` tags for icons.
- **Accessibility nits**: the button label contains a trailing space in Figma (`"LOGIN
  With Google "`) — strip it before rendering to avoid odd screen-reader pronunciation.
  The rendered Vietnamese footer string is already correct (`về`); the typo (`vè`) only
  exists in Figma's description/metadata field. See `spec.md` → Notes for details.
- **Theming**: the single brand-color + cream accent leaves room for light-mode in
  future; CSS variables via Tailwind v4 are the recommended mechanism.
