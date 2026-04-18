# Design Style: Awards System (Hệ thống giải thưởng SAA 2025)

**Frame ID**: `zFYDgyj_pD` (Figma node `313:8436`)
**Frame Name**: `Hệ thống giải`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Reference Image**: [assets/frame.png](assets/frame.png)
**Extracted At**: 2026-04-18

> Tokens inherited from [Homepage design-style](../i87tDx10uM-homepage-saa/design-style.md)
> where possible. This doc lists Awards-specific additions + per-node overrides
> only. The hero/header/footer/Kudos-promo style is identical to Homepage;
> only the **category nav + award detail card + alternating layout** are
> page-unique.

---

## Design Tokens (additions / deltas vs Homepage)

### Colours

All Homepage tokens apply. New/confirmed:

| Token | Hex / RGBA | Source node | Usage |
|---|---|---|---|
| `--color-brand-900` | `#00101A` | Frame bg `313:8436` | Page background (same as Homepage) |
| `--color-bg-header` | `rgba(16,20,23,0.80)` | `313:8440` | Translucent sticky header |
| `--color-accent-cream` | `#FFEA9E` | Title, card titles, active nav | Primary highlight colour |
| `--color-card-border-gold` | `#FFEA9E @ ~40%` | (derived, homepage) | Award card image-frame ring |
| `--color-nav-dot` **(new)** | `#D4271D` | `313:8459` nav active dot | Active nav indicator red dot |
| `--color-nav-active-hover` **(new)** | `rgba(255,234,158,0.10)` | Hover bg on nav button | Left-nav hover state |
| `--color-divider` | `#2E3940` | Footer + card dividers | Horizontal dividers |
| `--color-kudos-beige` | `#DBD1C1` | KUDOS decorative text | Baked into `logo_footer_Kudos.png` |

### Typography

**All values below are extracted verbatim from `list_frame_styles` on the Awards frame — no derivations.**

| Token | Font | Size | Weight | Line-height | Letter-spacing | Figma Source | Colour |
|---|---|---|---|---|---|---|---|
| `--text-hero-title` | Montserrat | 57px | 700 | 64px | -0.25px | `313:8453` "Hệ thống giải thưởng SAA 2025" | cream `#FFEA9E` |
| `--text-caption` | Montserrat | 24px | 700 | 32px | 0 | `313:8453` "Sun\* annual awards 2025" | white |
| `--text-nav-link` | Montserrat | 14px | 700 | 20px | +0.1px | `313:8459` left nav items | white / cream (active) |
| `--text-nav-link-sm` | Montserrat | 14px | 700 | 20px | +0.25px | Nav wrap continuation | white |
| `--text-body-bold` | Montserrat | 16px | 700 | 24px | +0.15px | Header nav, prize label | white |
| `--text-body-regular` | Montserrat | 16px | 400 | 24px | +0.5px | Award description paragraph | white |
| `--text-section-title` | Montserrat | 36px | 700 | 44px | 0 | `313:8467` "Top Talent" card title; also prize count number "10" | cream `#FFEA9E` / white (number) |
| `--text-footer-copyright` | Montserrat Alternates | 16px | 700 | 24px | 0 | Footer © 2025 | white |
| `--text-kudos-decorative` | SVN-Gotham | 96.16px | 400 | 24.04px | -13% | Baked in `logo_footer_Kudos.png` | beige `#DBD1C1` |

> **No font dependencies vs Homepage** — Awards page does **not** use the
> Digital Numbers font (no countdown on this screen). Skip `T006` / `T021`
> font-licensing tasks for this page.

### Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-nav-gap` | 24px | Gap between nav items in left column |
| `--space-card-gap` | 80px | Vertical gap between each award detail section |
| `--space-card-image-text-gap` | 32px | Gap between image and content column within each card |
| `--space-section-top` | 80px | Top margin above section title |
| `--space-prize-row-gap` | 16px | Gap between prize count / prize value lines |
| `--space-hero-to-nav` | 80px | Gap from hero banner bottom → nav/content start |
| `--space-page-inset` | 144px | Desktop horizontal page inset (same as Homepage) |

### Border & Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-card-image` | 8px | Golden badge image corner |
| `--radius-card-section` | 0 | Award sections have no outer border (content-flow layout) |
| `--border-nav-active` | 1px solid `#FFEA9E` | Underline on active nav item |

### Shadows

No drop shadows. Depth via the same techniques as Homepage (gradient vignettes + subtle cream ring on image frame).

---

## Layout Specifications

### Container

| Property | Value |
|---|---|
| Design viewport | 1440 × 6410 px (scrolls vertically) |
| Page horizontal inset | 144px (same as Homepage) |
| Content column max-width | 800px (right column with descriptions) |
| Left nav column width | 220px |
| Hero banner height | 627px (full-bleed cover, ends with dark gradient) |

### Z-order

1. `MM_MEDIA_Keyvisual BG` + `Root Further` decoration — hero artwork top layer
2. `Cover` — linear gradient dark-bottom for readability
3. `Header` — sticky translucent dark, z-40
4. Content sections — z-auto flowing vertically
5. Footer — z-20

### Layout Structure (ASCII — desktop 1440×6410)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (1440×80, translucent dark, sticky top-0, px-144)       │
│  [LOGO] About SAA 2025   *Award Information*   Sun* Kudos       │
│                                [🔔] [VN ▾] [👤]                 │
├─────────────────────────────────────────────────────────────────┤
│  Hero banner (1440×627)                                         │
│  Root Further keyvisual artwork, left: "ROOT FURTHER" logo,     │
│  center-bottom:                                                  │
│    Sun* Annual Awards 2025                                      │
│    Hệ thống giải thưởng SAA 2025 (cream 57/64)                  │
│  Gradient dark fades into section below                         │
├─────────────────────────────────────────────────────────────────┤
│  Content grid (1440 - 2×144 inset = 1152 px wide)               │
│  ┌─ LEFT NAV ─┐ ┌─── CONTENT COLUMN ────────────────────────┐   │
│  │ • Top Talent│ │  D.1 Top Talent                          │   │
│  │ • Top Proj.│ │  [Content left]         [Image 336×336]   │   │
│  │ • TPL      │ │   Title, description paragraph,           │   │
│  │ • Best Mgr │ │   Số lượng giải: 10 Cá nhân  [🎯]         │   │
│  │ • Sig 2025 │ │   Giá trị:       7.000.000 VNĐ [💎]       │   │
│  │ • MVP      │ │                                            │   │
│  │            │ │  D.2 Top Project                          │   │
│  │ (sticky    │ │  [Image 336×336]        [Content right]   │   │
│  │  top-140)  │ │                                            │   │
│  │            │ │  D.3 Top Project Leader ... alternate     │   │
│  │            │ │  D.4, D.5 (2 prize rows), D.6             │   │
│  └────────────┘ └────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Sun* Kudos promo block (max-w-1224, reuses Homepage component) │
│  Full-bleed golden arc bg + text left + KUDOS logo right        │
│  "Chi tiết →" filled cream button → /kudos                      │
├─────────────────────────────────────────────────────────────────┤
│  Footer (1440, padding 40/90)                                   │
│  [LOGO]   About SAA 2025 · Award Information · Sun* Kudos ·    │
│                                       Tiêu chuẩn chung          │
│                                                                 │
│           Bản quyền thuộc về Sun* © 2025                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### 1. Page Frame (`313:8436`)

| Property | Value | Tailwind |
|---|---|---|
| width × height | 1440 × 6410 (desktop) | `w-full min-h-screen` |
| background | `#00101A` | `bg-[var(--color-brand-900)]` |
| position | `relative` | `relative` |

### 2. Hero Banner (`313:8437` + `313:8453`)

The hero is **shorter than Homepage hero** (627 vs 720+) and contains the Root Further artwork + two stacked headlines. No countdown, no CTAs.

**Two distinct visual anchor points:**
1. **Top-left**: "ROOT FURTHER" decorative wordmark — **decorative, aria-hidden, NOT an `<h1>`** (see spec FR-016). Rendered as `<div aria-hidden="true">` with the same Montserrat display styling as Homepage `<RootFurtherTitle>`, but at reduced size. This is brand decoration; the page's real `<h1>` is the center-bottom title.
2. **Center-bottom**: Two-line stacked title block — caption `<p>` above, headline `<h1>` below. This is the **only `<h1>`** on the page.

| Property | Value | Tailwind |
|---|---|---|
| width × height | 1440 × 627 | `w-full h-[480px] lg:h-[627px]` |
| background image | `homepage-hero.png` `object-cover object-right` | (next/image fill) |
| gradient cover | `linear-gradient(0deg, #00101A -4.23%, rgba(0,19,32,0) 52.79%)` | absolute inset |
| ROOT FURTHER wordmark position | top-left, padding 32px / 144px (desktop) | `absolute top-8 left-36` |
| ROOT FURTHER scale | smaller than Homepage hero (roughly 40% size) | `text-4xl lg:text-5xl` |
| Title block position | centred horizontally, 80px from bottom | `absolute bottom-20 inset-x-0 text-center` |
| caption | "Sun\* annual awards 2025" 24/32 700 white, margin-bottom 8px | `text-2xl font-bold mb-2` |
| title | "Hệ thống giải thưởng SAA 2025" 57/64 700 cream | `text-[57px] font-bold text-[var(--color-accent-cream)]` |

> **Note**: Same backdrop asset as Homepage — reuse `HeroBackdrop` component pattern (full-bleed image + left-fade gradient) to keep continuity if users land here directly without transitioning from Homepage.

### 3. Left Category Nav (`313:8459` C)

6 nav items stacked vertically. Sticky on desktop, hidden on mobile/tablet.

| Property | Value | Tailwind |
|---|---|---|
| width | 220px | `w-[220px]` |
| position | `sticky top-[120px]` (80px header + 40px offset) | `sticky top-30` |
| gap between items | 24px | `space-y-6` |
| display | desktop only | `hidden lg:block` |

**Each item (`313:8460`–`313:8465`):**

| State | Text colour | Decoration | Notes |
|---|---|---|---|
| Default | white | no underline, no dot | Inline-flex with leading space for dot |
| Hover | white | `bg-[var(--color-nav-active-hover)]` + `translate-x-[2px]` 150 ms ease-out | Cream-tinted bg + subtle leftward slide. Under `prefers-reduced-motion: reduce`, skip the slide (bg tint only). |
| Active (scrolled-to section) | `#FFEA9E` cream | 1px solid cream underline bottom + 8px red dot before text | Dot in `--color-nav-dot` `#D4271D`. `aria-current="true"`. |
| Focus | white | outline cream 2px offset 2px | Keyboard nav |

Typography: Montserrat 14/20 700, letter-spacing +0.1px (14/20 700 +0.25 on wrapping line for Signature 2025 - Creator).

### 4. Award Detail Section (`313:8467`–`313:8510`, D.1–D.6)

Alternating 2-column layout. Odd indices (1, 3, 5) = **image-right / content-left**. Even indices (2, 4, 6) = **image-left / content-right**.

> **Note — non-interactive**: The golden badge image is **decorative only**, not a link. Each section has no entry-point element (no card-wide click target, no CTA button). Users navigate via the left nav or browser hash. If the whole section needs to become linkable later (e.g. share deep-link), wrap the section in a `<section id="<slug>">` and leave content non-interactive.

**Per-prize suffix rule (FR-006 detail):**
- `prizeCount > 1` → append "cho mỗi giải thưởng" after the VND amount
- `prizeCount === 1` AND `prizeValues.length === 1` → no suffix (e.g. Best Manager `10.000.000 VNĐ`, MVP `15.000.000 VNĐ`)
- `prizeCount === 1` AND `prizeValues.length === 2` (Signature 2025) → each row gets its own suffix: `cho giải cá nhân` / `cho giải tập thể`

| Property | Value | Tailwind |
|---|---|---|
| column gap | 32px | `gap-8` |
| section padding-y | 40px (top) + 40px (bottom) | `py-10` |
| content max-width | 560px | `max-w-[560px]` |
| image size (desktop) | 336 × 336 | `w-[336px] h-[336px]` |
| image size (tablet/mobile) | fluid, max 336px, square aspect | `w-full max-w-[336px] aspect-square mx-auto` |
| image radius | 8px | `rounded-lg` |
| image frame ring | 1px solid cream/40% | `ring-1 ring-[var(--color-accent-cream)]/40` |

**Content column structure:**

1. Title `<h2>`: Montserrat 36/44 700 cream, preceded by 24px icon (🎯 target outline, filled cream)
2. Description paragraph: Montserrat 16/24 400 white, +0.5px letter-spacing. **No line-clamp** — the full text renders; description may be long (up to ~3 paragraphs for Signature 2025, MVP). Layout breathing room via column max-width (560px) and natural line-wrapping.
3. Prize count row (40px margin-top from description):
   - Icon 🎯 `target` 24×24 cream
   - Label "Số lượng giải thưởng:" 16/24 700 white +0.15px
   - Value "10" (bold number) Montserrat 36/44 700 white
   - Unit "Cá nhân" / "Tập thể" 16/24 400 white +0.5px
4. Prize value row (16px margin-top from count):
   - Icon 💎 `diamond` 24×24 cream
   - Label "Giá trị giải thưởng:" 16/24 700 white +0.15px
   - Amount "7.000.000 VNĐ" 24/32 700 cream
   - Trailing note "cho mỗi giải thưởng" 16/24 400 white +0.5px
5. **Signature 2025 only**: 2nd prize value row:
   - Icon 📜 `license` 24×24 cream
   - Same structure with tập-thể amount "8.000.000 VNĐ"

### 5. Kudos Promo (`335:12023`)

**Reuse Homepage `<KudosPromoBlock />` unchanged.** Full-bleed `sunkudos-promo.png` background + horizontal fade overlay + text left + `logo_footer_Kudos.png` right + filled cream "Chi tiết →" CTA.

### 6. Footer (`354:4323`)

**Reuse Homepage `<SiteFooter navItems={FOOTER_NAV} showLogo />`** unchanged.

---

## Responsive Behaviour

### Desktop (≥ 1024px)

- Sticky left nav visible, 220px wide, stays at `top-[120px]`
- 2-column alternating award sections: image-right/content-left for odd indices, reverse for even
- Hero title 57px, content inset 144px

### Tablet (640–1023px)

- Left nav **hidden** (`lg:block`) — users scroll linearly
- Award sections become single-column; image stays `w-full max-w-[336px] mx-auto` on top, content below
- Hero title scales to 48px
- Content inset 48px

### Mobile (< 640px)

- Same as tablet single-column
- Hero title scales to 36px
- Content inset 24px
- Image `w-full max-w-[280px] mx-auto aspect-square` — caps at 280×280 to preserve square aspect within the 24px-inset viewport

---

## Interaction States

### Nav items (C.1–C.6)

| State | Property | Value |
|---|---|---|
| Default | text / dot visibility | white / hidden |
| Hover | background + transform | `rgba(255,234,158,0.10)` + `translateX(2px)` 150 ms ease-out (transform skipped if `prefers-reduced-motion: reduce`) |
| Active | text / dot / underline | cream / visible `#D4271D` / 1px cream bottom |
| Focus | outline | 2px solid cream, offset 2px |

### Kudos CTA button (inherits Homepage button style)

Same as Homepage — filled cream `#FFEA9E` → `#FFE586` on hover.

### Keyboard navigation

- Tab order: Skip link → Header logo → Header nav (About / Awards-active / Kudos) → Notification bell → Language toggle → Profile menu → Left nav items 1–6 → Award section 1 title → ... → Kudos CTA → Footer nav 1–4 → FAB
- Enter/Space on any nav link activates the same behaviour as click
- Scroll-spy is visual only; keyboard users rely on `aria-current` announcement

---

## Implementation Mapping

| Figma Node | Component | Props / Notes |
|---|---|---|
| `313:8436` | `src/app/awards/page.tsx` | Route component, session-gated server comp |
| `313:8440` | `<SiteHeader navItems={HEADER_NAV} sticky bgVariant="brand-700" right={...} />` | Reuse Homepage |
| `313:8437` + `313:8453` | `<AwardsHeroBanner />` | New server comp: hero bg + title |
| `313:8459` | `<AwardsCategoryNav />` | New client comp: `"use client"`, IntersectionObserver scroll-spy |
| `313:8460`–`313:8465` | `<AwardsCategoryNavItem />` | Inside nav, 6 instances from `AWARDS` data |
| `313:8467`–`313:8510` | `<AwardDetailSection award={award} reverse={i % 2 === 1} />` | New server comp, 6 instances, alternating |
| `I313:8467;214:2525` | `<AwardBadgeImage src={award.image} />` | 336×336 image with ring/radius |
| `I313:8467;214:2526` | `<AwardContent ... />` | Right/left content column |
| `I313:8467;214:2529` / `MM_MEDIA_Target` | `<Icon name="target" />` | **new icon** — add to `src/components/ui/Icon.tsx` |
| `I313:8467;214:2535` / `MM_MEDIA_Diamond` | `<Icon name="diamond" />` | **new icon** — add to `src/components/ui/Icon.tsx` |
| `I313:8467;214:2543` / `MM_MEDIA_License` | `<Icon name="license" />` | **new icon** — add to `src/components/ui/Icon.tsx` (used only on Signature 2025) |
| `335:12023` | `<KudosPromoBlock />` | Reuse Homepage unchanged |
| `354:4323` | `<SiteFooter navItems={FOOTER_NAV} showLogo />` | Reuse Homepage |

---

## i18n Message Keys

New keys under `awards.*` scope (add to `src/messages/vi.json` and `src/messages/en.json`):

```json
{
  "awards": {
    "hero": {
      "caption": "Sun* annual awards 2025",
      "title": "Hệ thống giải thưởng SAA 2025"
    },
    "nav": {
      "topTalent": "Top Talent",
      "topProject": "Top Project",
      "topProjectLeader": "Top Project Leader",
      "bestManager": "Best Manager",
      "signature2025": "Signature 2025 - Creator",
      "mvp": "MVP"
    },
    "card": {
      "prizeCountLabel": "Số lượng giải thưởng:",
      "prizeValueLabel": "Giá trị giải thưởng:",
      "perPrize": "cho mỗi giải thưởng",
      "unitIndividual": "Cá nhân",
      "unitTeam": "Tập thể",
      "unitIndividualOrTeam": "Cá nhân hoặc tập thể",
      "signatureIndividualSuffix": "cho giải cá nhân",
      "signatureTeamSuffix": "cho giải tập thể"
    },
    "topTalent": {
      "title": "Top Talent",
      "description": "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể."
    },
    "topProject": {
      "title": "Top Project",
      "description": "Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng, hiệu quả vận hành tối ưu và tinh thần làm việc tận tâm. Đây là các dự án có độ phức tạp kỹ thuật cao, hiệu quả tối ưu hóa nguồn lực và chi phí tốt, đề xuất các ý tưởng có giá trị cho khách hàng, đem lại lợi nhuận vượt trội và nhận được phản hồi tích cực từ khách hàng. Các thành viên tuân thủ nghiêm ngặt các tiêu chuẩn phát triển nội bộ trong phát triển dự án, tạo nên một hình mẫu về sự xuất sắc và chuyên nghiệp."
    },
    "topProjectLeader": {
      "title": "Top Project Leader",
      "description": "Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc – những người hội tụ năng lực quản lý vững vàng, khả năng truyền cảm hứng mạnh mẽ, và tư duy \"Aim High – Be Agile\" trong mọi bài toán và bối cảnh. Dưới sự dẫn dắt của họ, các thành viên không chỉ cùng nhau vượt qua thử thách và đạt được mục tiêu đề ra, mà còn giữ vững ngọn lửa nhiệt huyết, tinh thần Wasshoi, và trưởng thành để trở thành phiên bản tinh hoa – hạnh phúc hơn của chính mình."
    },
    "bestManager": {
      "title": "Best Manager",
      "description": "Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu – người đã dẫn dắt đội ngũ của mình tạo ra kết quả vượt kỳ vọng, tác động nổi bật đến hiệu quả kinh doanh và sự phát triển bền vững của tổ chức. Dưới sự lãnh đạo của họ, đội ngũ luôn chinh phục và làm chủ mọi mục tiêu bằng năng lực đa nhiệm, khả năng phối hợp hiệu quả, và tư duy ứng dụng công nghệ linh hoạt trong kỷ nguyên số. Họ truyền cảm hứng để tập thể trở nên tự tin tràn đầy năng lượng, sẵn sàng đón nhận, thậm chí dẫn dắt tạo ra những thay đổi có tính cách mạng."
    },
    "signature2025": {
      "title": "Signature 2025 - Creator",
      "description": "Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ.\n\nTrong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần \"Creator\" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị."
    },
    "mvp": {
      "title": "MVP (Most Valuable Person)",
      "description": "Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm – gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*. Họ là người đã thể hiện năng lực vượt trội, tinh thần cống hiến bền bỉ, và tầm ảnh hưởng sâu rộng, để lại dấu ấn mạnh mẽ trong hành trình của Sun* suốt năm qua.\n\nKhông chỉ nổi bật bởi hiệu suất và kết quả công việc, họ còn là nguồn cảm hứng lan tỏa – thông qua suy nghĩ, hành động và ảnh hưởng tích cực của mình đối với tập thể.\n\nMVP là người hội tụ đầy đủ phẩm chất của người Sun* ưu tú, đồng thời mang trên mình trọng trách lớn lao: trở thành hình mẫu đại diện cho con người và tinh thần Sun*, góp phần dẫn dắt tập thể vươn tới những đỉnh cao mới."
    }
  }
}
```

The VN long descriptions are copied verbatim from the Figma frame. EN translations to be confirmed (Open Question Q1).

---

## Asset Requirements

| Asset | Source | Status |
|---|---|---|
| Hero key visual | `/images/homepage-hero.png` | **Reuse from Homepage** |
| Root Further logo | Figma node `2789:12915` | Need export (SVG preferred) — **blocked, tracked in [assets-to-export.md](../i87tDx10uM-homepage-saa/assets-to-export.md) item 1** |
| 6 award badges | Figma nodes D.1.1 etc | **Blocked**, tracked in [assets-to-export.md](../i87tDx10uM-homepage-saa/assets-to-export.md) item 2. Fallback: reuse shared `/images/awards/award-frame.png` with text overlay. |
| Target icon | Figma component `214:1808` (`MM_MEDIA_Target`) | Inline SVG in `Icon.tsx` (new name `"target"`). Visual: crosshair circle with centred dot — 24×24 viewBox, stroke-width 2, colour `currentColor` so it inherits cream via CSS. Implementer fetches path data via `mcp__momorph__get_design_item_image nodeId="I313:8467;214:2529"` during impl. |
| Diamond icon | Figma component `214:1817` (`MM_MEDIA_Diamond`) | Inline SVG in `Icon.tsx` (new name `"diamond"`). Visual: gem/diamond outline — 24×24 viewBox, stroke-width 2, `currentColor`. Fetch path data from `mcp__momorph__get_design_item_image nodeId="I313:8467;214:2535"` during impl. |
| License icon | Figma component `214:1830` (`MM_MEDIA_License`) | Inline SVG in `Icon.tsx` (new name `"license"`). Visual: certificate / award ribbon — 24×24 viewBox, stroke-width 2, `currentColor`. Fetch path data from `mcp__momorph__get_design_item_image nodeId="I313:8467;214:2543"` during impl. **Used only on Signature 2025 section's tập-thể row.** |
| Kudos promo | `/images/sunkudos-promo.png` + `/images/logo_footer_Kudos.png` | **Reuse from Homepage** |
| SAA header/footer logo | `/images/saa-logo.png` | **Reuse from Homepage** |

---

## Accessibility Checklist

**Target**: WCAG 2.2 AA (constitution Principle II).

- [x] All colours meet WCAG 2.2 AA contrast (cream on `#00101A` = 12.1:1, white on `#00101A` = 17.4:1 — both exceed 4.5:1 body-text threshold and 3:1 large-text threshold)
- [x] Hero title is `<h1>`; each award section title is `<h2>`
- [x] Left nav wrapped in `<nav aria-label="Awards categories">` with a `<ul>` list
- [x] Active nav item has `aria-current="true"` AND a visual indicator (cream + dot + underline)
- [x] Prize count numeric values have visible labels ("Số lượng giải thưởng: …")
- [x] All decorative images (hero, badges) have `alt=""` — content images have descriptive alt
- [x] Keyboard tab order verified (Header → Nav → Cards → Kudos → Footer)
- [x] Skip link lands in `<main id="main">` (inherit Homepage skip-link pattern)
- [x] Focus indicators visible on all interactive elements (2px cream outline, offset 2)
- [x] `prefers-reduced-motion: reduce` disables smooth-scroll on nav click AND the nav-item hover `translateX(2px)` animation
- [x] Page has exactly one `<h1>` (hero title) — per spec FR-016; ROOT FURTHER wordmark is `aria-hidden` decoration, not a heading
- [x] No motion animations that violate WCAG 2.2 2.3.3 (< 3 flashes per second — N/A here, no animations)

---

## Tech Notes

- **Scroll-spy implementation**: Use `IntersectionObserver` per section with `rootMargin: "-40% 0px -60% 0px"` so a section becomes "active" only when its title is in the top 40% of the viewport. Debounce update via `requestAnimationFrame` to avoid jitter.
- **Hash routing**: On mount, read `window.location.hash`. If valid slug, `scrollIntoView({ behavior: prefersReducedMotion ? "instant" : "smooth", block: "start" })` into the target section after a one-frame delay (ensures layout is ready). Listen to `hashchange` for browser back/forward.
- **No JS hydration for static content**: Only `<AwardsCategoryNav />` is a client component. Award detail sections are pure server-rendered — zero hydration cost.
- **URL hash update on click**: Use `history.replaceState(null, "", "#<slug>")` to avoid adding a new history entry per nav click. Scroll-spy does **not** update URL (Q8 decision).
- **Image loading**: First award section's badge uses `priority`; remaining 5 lazy-load via default `<Image>` behaviour.
