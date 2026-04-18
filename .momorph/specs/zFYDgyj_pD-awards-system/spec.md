# Feature Specification: Awards System (Hệ thống giải thưởng SAA 2025)

**Frame ID**: `zFYDgyj_pD` (Figma node `313:8436`)
**Frame Name**: `Hệ thống giải`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**MoMorph URL**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
**Created**: 2026-04-18
**Status**: Draft
**Target Route**: `/awards`

---

## Overview

The **Awards System** page is the dedicated landing for **SAA 2025's six award categories**. It is linked from the Homepage Awards grid (`/` → each award card navigates to `/awards#<slug>`) and from the header nav "Award Information" link. It serves as the authoritative reference for each award's purpose, criteria, prize count, and cash prize value.

The page has two content columns: a **sticky left nav** (6 category links with scroll-spy) and a **right scrolling content column** with 6 large detail cards — each card contains an ornate golden trophy badge, a long-form description, the number of prizes, and the cash value per prize. A reused **Sun\* Kudos promo block** sits below the awards list and mirrors the Homepage promo (with full background artwork).

This is a **static, read-only information screen** — no user data, no forms, no server mutations. All copy is authored content; only the Homepage/Header session gate still applies.

**Target users**: Every authenticated Sunner who wants to understand what they or their team can win at SAA 2025.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse every award category in one scroll (Priority: P1)

A Sunner arriving from the Homepage awards grid (or the header "Award Information" link) lands on `/awards` and scrolls through all six award cards to learn what each prize is about, how many winners there are, and the cash value. This is the **core MVP journey** and must be useful even without any other enhancements.

**Why this priority**: The Homepage already renders 6 `AwardCard` items that navigate to `/awards#<slug>`. Without this screen, those navigations dead-end. All SAA 2025 communications reference "Hệ thống giải thưởng" — this is the canonical explanation of every prize.

**Independent Test**: Authenticated user navigates to `/awards`, sees the hero banner with "Hệ thống giải thưởng SAA 2025" title, then scrolls through 6 sections (Top Talent → Top Project → Top Project Leader → Best Manager → Signature 2025 - Creator → MVP), each showing the golden badge image, title, description paragraph, prize count and cash value.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they navigate to `/awards`, **Then** the page renders hero + 6 award sections + Kudos promo + footer, in that vertical order.
2. **Given** the page is loaded, **When** the user scrolls through the content, **Then** each award section displays: image (336×336 golden badge), title (cream 36/44 700), description paragraph, prize count line ("Số lượng giải thưởng: {n} {Cá nhân|Tập thể}"), and prize value line(s) per the FR-007 conditional suffix rule (suffix "cho mỗi giải thưởng" only when `prizeCount > 1`).
3. **Given** the page renders, **When** the user reads "Signature 2025 - Creator", **Then** they see **two** prize-value rows: "5.000.000 VNĐ cho giải cá nhân" and "8.000.000 VNĐ cho giải tập thể" — it is the only card with a split prize structure.
4. **Given** any layout width ≥ 1024px, **When** the award sections render, **Then** odd sections (1,3,5) show image on right / content on left; even sections (2,4,6) show image on left / content on right — matching the alternating Figma layout.

---

### User Story 2 - Jump to a specific award via sticky left nav (Priority: P1)

While on `/awards`, the user sees a **sticky left navigation column** listing all six award categories. Clicking an item smooth-scrolls the main content to that award's section. The currently visible section is highlighted with a yellow underline + a small red dot indicator. This scroll-spy behaviour makes the long page easy to navigate and confirms the user's position.

**Why this priority**: The page is very long (~6400px). Without an in-page table of contents, users have to scroll blindly. The left nav is part of the core design and integral to the "long-form reference" experience. It also aligns with the deep-link pattern from the Homepage (`/awards#top-talent`, etc.).

**Independent Test**: Click each of the 6 nav items in sequence; verify (a) the page smooth-scrolls to the corresponding section, (b) the URL hash updates to `#<slug>`, (c) the clicked item gets the active style (cream text + yellow underline + red dot), (d) all other items revert to inactive. Then scroll manually — the active nav item should update to match whichever section is currently in the viewport.

**Acceptance Scenarios**:

1. **Given** the user is on `/awards`, **When** they click "Top Project" in the left nav, **Then** the page smooth-scrolls to the Top Project section, the URL becomes `/awards#top-project`, and "Top Project" in the nav gets the active style.
2. **Given** the user lands on `/awards#best-manager` (deep link from Homepage), **When** the page loads, **Then** the viewport auto-scrolls to the Best Manager section and the nav highlights "Best Manager".
3. **Given** the user manually scrolls down past the Top Talent section into Top Project, **When** Top Project's top edge crosses the upper 40% of the viewport (IntersectionObserver `rootMargin: "-40% 0px -60% 0px"`, see FR-005), **Then** the active nav state moves from "Top Talent" to "Top Project" without requiring a click.
4. **Given** the page viewport is < 1024px wide, **When** the page renders, **Then** the left nav collapses (hidden) and the award sections stack full-width — users scroll linearly without scroll-spy.
5. **Given** the user tabs through the left nav with a keyboard, **When** they press Enter on an item, **Then** it activates the same scroll/deep-link behaviour as clicking.

---

### User Story 3 - Promote the Sun\* Kudos movement (Priority: P2)

Near the bottom of the page, a Sun\* Kudos promo block — visually identical to the one on the Homepage (full-bleed golden-arc background + left text column + Kudos logo right) — invites the user to learn about the new Kudos activity. Clicking "Chi tiết →" navigates to `/kudos`.

**Why this priority**: Reuses the existing `<KudosPromoBlock />` component from the Homepage → zero-cost addition that keeps the Kudos CTA top-of-mind across the site. Priority P2 because the promo is a cross-sell, not the primary reason to visit `/awards`.

**Independent Test**: Scroll past all 6 award sections. Verify the Kudos promo renders with the full-bleed background, correct text copy, and a working "Chi tiết →" link to `/kudos`.

**Acceptance Scenarios**:

1. **Given** the user reaches the bottom of the awards list, **When** the next block renders, **Then** they see the Sun\* Kudos promo with the headline "Phong trào ghi nhận / Sun\* Kudos", the descriptionHeadline "ĐIỂM MỚI CỦA SAA 2025", the description paragraph, and the filled cream "Chi tiết →" CTA.
2. **Given** the user clicks the "Chi tiết →" CTA, **When** the navigation fires, **Then** the browser goes to `/kudos`.

---

### Edge Cases

- **Unauthenticated access**: `/awards` is behind the same session gate as `/`. If a user hits the page without a Supabase session, they are redirected to `/login?next=/awards`. Same try/catch graceful-failure pattern as Homepage (FR-016 inherited).
- **Invalid / unknown hash fragment**: `/awards#nonexistent` loads normally without scrolling and leaves the first section (Top Talent) as active — no console errors.
- **Reduced motion**: If the user has `prefers-reduced-motion: reduce`, nav-click scrolls instantly (no smooth animation) and the deep-link auto-scroll on page load is also instant.
- **Mobile viewport (< 1024px)**: Left nav is hidden; alternating image-left / image-right layout collapses to a single column with image-on-top-text-below for every section.
- **Slow network**: The 6 golden-badge images are lazy-loaded below the first one; the hero key visual is `priority`. First meaningful paint shows hero + active award section before other images fully load.
- **Language switch mid-scroll**: Switching VN↔EN preserves scroll position — all copy flips in place without scroll jump.
- **Missing award data**: All 6 awards are hard-coded in `src/data/awards.ts` (from Homepage MVP) — this page extends the existing data shape with new fields (`longDescKey`, `prizeCount`, `prizeUnit`, `prizeValues[]`); no runtime fetching.
- **JavaScript disabled**: Page is server-rendered so all 6 sections + hero + footer remain readable without JS. The scroll-spy left nav + smooth-scroll enhancements simply degrade to plain `<a href="#slug">` anchor links which still scroll (browser-native, instant). No content blocks on JS.
- **Clicking an already-active nav item**: Calls the same scroll-to-slug handler — browser scrolls back to the section's top (idempotent). No special case required.
- **`scrollend` not supported** (Safari < 16.4, older Firefox): Feature-detect via `'onscrollend' in window`. If absent, use a 600 ms `setTimeout` after initiating the smooth-scroll to re-enable scroll-spy (covers the worst-case smooth-scroll duration on long pages).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Node | Description | Interactions |
|-----------|------|-------------|--------------|
| `SiteHeader` (existing) | `313:8440` | Sticky dark-translucent header, 80px tall, "Award Information" nav link gets `aria-current="page"` | Logo smooth-scroll-to-top, nav links, language toggle, notification bell, profile menu |
| `AwardsHeroBanner` (new) | `313:8437` + `313:8453` | Hero banner with the Root Further key visual + title "Hệ thống giải thưởng SAA 2025" (cream 57/64 700) + caption "Sun\* annual awards 2025" (white 24/32 700) | Static, no interactions |
| `AwardsCategoryNav` (new) | `313:8459` (C) | Sticky left column nav, 6 items, scroll-spy active state (cream text + yellow underline + red dot) | Click/Enter navigates `/awards#<slug>` + smooth scroll; updates active state on scroll |
| `AwardDetailSection` ×6 (new) | `313:8467`–`313:8510` (D.1–D.6) | 2-column alternating layout per award: 336×336 golden badge image + content block (title 36/44 700 cream, description 16/24 400 white +0.5, prize count, prize value) | Static, read-only |
| `KudosPromoBlock` (reuse) | `335:12023` | Full-bleed dark card with golden-arc backdrop + left text + Sun\* Kudos logo right + filled cream CTA | "Chi tiết →" → `/kudos` |
| `SiteFooter` (existing) | `354:4323` | Dark footer with logo + 4 nav links + copyright | Nav link clicks |
| `QuickActionsFab` (existing) | global | Floating pill bottom-right | Popover with "Viết Kudo →" |

### Navigation Flow

- **From**: Homepage (`/`) — any of the 6 award cards with `#<slug>` deep link; header nav "Award Information"; footer nav "Award Information"
- **From**: Header nav on any authenticated page (sticky everywhere)
- **To**: `/kudos` (Kudos promo CTA); `/` (logo); `/notifications`, `/profile` (header widgets)
- **Triggers**: User click on any AwardCard at `/`; user click on header nav "Award Information"; user deep-links via URL

### Visual Requirements

- **Breakpoints**:
  - Desktop (≥ 1024px): 2-column layout with sticky left nav + content column, alternating image-left/right per section
  - Tablet (640–1023px): Full-width single column, left nav hidden, image-top/content-below per section
  - Mobile (< 640px): Same as tablet, but tighter padding and smaller title (responsive `text-4xl sm:text-5xl lg:text-[57px]`)
- **Animations**:
  - Smooth scroll on nav click (`behavior: "smooth"` unless `prefers-reduced-motion: reduce` → `"instant"`)
  - Nav-item hover: cream-tinted background `rgba(255,234,158,0.10)` + 2px leftward slide `transform: translateX(2px)` with 150 ms ease-out transition. Under `prefers-reduced-motion: reduce`, skip the `translateX` (background tint only).
  - No entrance animations on scroll
- **Accessibility**: **WCAG 2.2 AA** compliance (per constitution Principle II):
  - Colour contrast maintained (cream `#FFEA9E` on dark `#00101A` = 12.1:1, white on dark = 17.4:1)
  - Each award section has `<h2>` with section title, usable by screen reader navigation
  - Left nav has `<nav aria-label="Awards categories">` wrapping a list
  - Active nav item uses `aria-current="true"`
  - Header nav item "Award Information" gets `aria-current="page"` (via existing `<NavLink />` component which compares `usePathname()` to the link href)
  - Skip link from page shell still lands in `#main`
  - Keyboard: tab through nav links, Enter/Space activates
  - Touch targets on any mobile-visible interactive element ≥ 44×44 px

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST render all 6 award sections in fixed order (Top Talent → Top Project → Top Project Leader → Best Manager → Signature 2025 - Creator → MVP) without any runtime data fetch.
- **FR-002**: The page MUST require an authenticated Supabase session; unauthenticated requests redirect to `/login?next=/awards` via the existing server-side guard.
- **FR-003**: The page MUST support deep-linking via URL hash: visiting `/awards#<slug>` MUST auto-scroll to that section on load. Valid slugs: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`. Auto-scroll respects `prefers-reduced-motion`.
- **FR-004**: On **user click** of a left-nav item, the page MUST smooth-scroll to the target section AND update `window.location.hash` via `history.replaceState` (no new browser-history entry). If `prefers-reduced-motion: reduce`, scroll instantly. The URL is **only** rewritten on click — passive scroll does not rewrite it (Q8 decision).
- **FR-005**: A scroll-spy MUST update the visually-active nav item as the user scrolls. Active threshold: section's top edge has crossed the top 40% of the viewport (IntersectionObserver `rootMargin: "-40% 0px -60% 0px"`). Scroll-spy does NOT modify `window.location.hash`.
- **FR-005a**: When a programmatic smooth-scroll is in progress (triggered by FR-004 click or FR-003 hash deep-link), the scroll-spy observer MUST pause updates until `scrollend` (or 600 ms timeout fallback for browsers without `scrollend` support) to prevent active-state flicker mid-scroll.
- **FR-006**: Each `AwardDetailSection` MUST render: image (336×336 golden badge), `<h2>` title (cream 36/44 700) prefixed with a small `target`-style icon, description paragraph (white 16/24 400 +0.5px), prize-count row ("Số lượng giải thưởng: {count} {unit}" with a `target`-style icon), and prize-value row(s) (see FR-007).
- **FR-007**: Prize-value row rendering rules:
  - If `prizeCount > 1` (multiple winners): single row "Giá trị giải thưởng: {value} VNĐ **cho mỗi giải thưởng**" with `diamond`-style icon — the "cho mỗi giải thưởng" suffix is visible.
  - If `prizeCount === 1` and only one `prizeValue` (Best Manager, MVP): single row "Giá trị giải thưởng: {value} VNĐ" — **no** trailing suffix.
  - If `prizeCount === 1` and two `prizeValues` (Signature 2025 - Creator): two rows — first "Giá trị giải thưởng: 5.000.000 VNĐ **cho giải cá nhân**" with `diamond` icon; second "Giá trị giải thưởng: 8.000.000 VNĐ **cho giải tập thể**" with `license` icon. Each row gets its own suffix.
- **FR-008**: Layout direction MUST alternate per section on desktop (≥1024px): sections 1, 3, 5 = image-right / content-left; sections 2, 4, 6 = image-left / content-right. On mobile/tablet, all sections stack image-top / content-below.
- **FR-009**: The Kudos promo block at the bottom MUST reuse the existing `<KudosPromoBlock />` component unchanged — same copy, same layout, same "Chi tiết →" → `/kudos`.
- **FR-010**: The page MUST inherit the SiteHeader (`navItems={HEADER_NAV}`, `sticky`, `bgVariant="brand-700"`) and SiteFooter (`navItems={FOOTER_NAV}`, `showLogo`) from the Homepage pattern.
- **FR-011**: Emit `track({ type: "screen_view", screen: "awards" })` on server render (mirrors Homepage analytics).
- **FR-012**: All **textual** copy (titles, descriptions, captions, labels, suffixes) MUST live in `src/messages/vi.json` / `src/messages/en.json` under `awards.*` keys — no hardcoded user-facing strings in components. **Numeric** values (`prizeCount`, `amountVnd`) and identifiers (slug, image path) stay in `src/data/awards.ts` since they are language-neutral facts.
- **FR-013**: The page MUST gracefully handle a missing Supabase connection (`try/catch` around `getUser()`) and redirect to `/login` instead of crashing (inherit Homepage FR-016 pattern).
- **FR-014**: Active nav state MUST be keyboard-accessible: tab focus ring, Enter/Space activation, `aria-current="true"` on the currently visible section.
- **FR-015**: On browser resize from desktop → mobile (crossing 1024px breakpoint), the sticky left nav must gracefully hide without layout shift in the main content column.
- **FR-016**: Heading hierarchy — the page MUST have exactly **one `<h1>`**: "Hệ thống giải thưởng SAA 2025" (hero title). The top-left "ROOT FURTHER" decorative wordmark on the hero is **aria-hidden** and rendered as `<div aria-hidden="true">` (NOT an `<h1>`, NOT a heading) — it is brand decoration reused from the Homepage backdrop. Each award section title is `<h2>`. This prevents WCAG 2.2 1.3.1 info-and-relationships violations from duplicate top-level headings.

### Technical Requirements

- **TR-001**: Route file at `src/app/awards/page.tsx` (replaces the current stub).
- **TR-002**: Server Component by default — session gate + SSR render. The scroll-spy nav is a client-only enhancement loaded as a small `"use client"` component.
- **TR-003**: Bundle target: `/awards` route ≤ 50 KB gzipped (larger than `/` due to 6 card images, but images themselves are not part of the JS bundle).
- **TR-004**: LCP target < 2.5 s on Cloudflare Workers preview at mobile slow-4G; hero badge images lazy-loaded below the first card.
- **TR-005**: All 6 golden-badge images ship as PNG @2× at least 400×400 rendered size (assets-to-export.md item #2) — fallback to `/images/awards/award-frame.png` until the 6 unique badges are exported from Figma.
- **TR-006**: Hash scroll + scroll-spy logic MUST work with Next.js App Router client navigation (handle both full-page load and SPA-style hash changes via `popstate`/`hashchange`).
- **TR-007**: No additional npm dependencies. IntersectionObserver (native) for scroll-spy.
- **TR-008**: Reuse existing design tokens — `--color-accent-cream`, `--color-brand-900`, `--color-card`, `--color-divider`. Add one new token `--color-nav-dot: #D4271D` for the active-nav red dot indicator.
- **TR-009**: Test coverage per constitution Principle III (TDD). Co-located `__tests__/` directories:
  - Unit: `AwardDetailSection` renders correctly for each of the 3 prize-value cases (count>1, count=1 single, count=1 two-values).
  - Unit: `AwardsCategoryNav` — click updates active state + URL hash via `history.replaceState`; pressing Enter on focused item activates; pausing scroll-spy during programmatic scroll.
  - Unit: `IntersectionObserver` mock — scrolling past threshold updates active section.
  - Integration: `/awards` renders 6 sections + left nav + Kudos promo; deep link `/awards#signature-2025-creator` auto-scrolls on load; redirects to `/login` when session missing.
  - E2E (Playwright): authenticated user clicks Homepage award card → lands on correct `#<slug>` section; language toggle VN↔EN flips all 6 descriptions without layout shift.
- **TR-010**: Responsive image behaviour — badge image is **336×336** on desktop, scales **fluidly down** on smaller viewports via `w-full max-w-[336px] aspect-square` so it stays visually square without overflowing the column on mobile (≤ 375px viewport → image caps at ~280px given mobile padding).

### Key Entities *(static, hard-coded)*

- **Award** (extends existing `src/data/awards.ts` `Award` type — fields marked **(new)** are added by this feature; existing fields are **kept unchanged** to avoid breaking Homepage's `<AwardCard />`):
  - `id: string` — URL slug (`top-talent`, …) *(existing)*
  - `slug: AwardSlug` — typed union of slugs *(existing)*
  - `titleKey: string` — i18n key for short title e.g. `homepage.awards.topTalent.title` — **shared with Homepage, unchanged** *(existing)*
  - `descKey: string` — i18n key for **short** description (Homepage uses this for the 2-line clamp body e.g. `homepage.awards.topTalent.desc`) — **shared with Homepage, unchanged** *(existing)*
  - `image: string` — path to 336×336 golden badge PNG *(existing)*
  - `longDescKey: string` **(new)** — i18n key for **long-form** description paragraph on `/awards` (e.g. `awards.topTalent.description`). Homepage ignores this field.
  - `prizeCount: number` **(new)** — how many winners (1, 2, 3, or 10)
  - `prizeUnit: "individual" | "team" | "either"` **(new)** — renders as "Cá nhân", "Tập thể", or "Cá nhân hoặc tập thể" via i18n
  - `prizeValues: Array<{ suffixKey?: string; amountVnd: number }>` **(new)** — one item for most cards; two for Signature 2025 (cá nhân + tập thể split). Each item's `suffixKey` points to the i18n suffix copy ("cho mỗi giải thưởng" / "cho giải cá nhân" / "cho giải tập thể"). Empty / undefined `suffixKey` → no suffix rendered (Best Manager, MVP).

> **Backward compatibility**: Homepage's existing `<AwardCard />` reads only `{id, slug, titleKey, descKey, image}` — the new fields are additive, won't break Homepage.

- **Frozen data table** (authored copy — will live as TypeScript constant + i18n strings):

  | Slug | Title | Count | Unit | Prize VND |
  |---|---|---|---|---|
  | `top-talent` | Top Talent | 10 | Cá nhân | 7.000.000 mỗi giải |
  | `top-project` | Top Project | 02 | Tập thể | 15.000.000 mỗi giải |
  | `top-project-leader` | Top Project Leader | 03 | Cá nhân | 7.000.000 mỗi giải |
  | `best-manager` | Best Manager | 01 | Cá nhân | 10.000.000 |
  | `signature-2025-creator` | Signature 2025 - Creator | 01 | Cá nhân **hoặc** tập thể | 5.000.000 cá nhân / 8.000.000 tập thể |
  | `mvp` | MVP (Most Valuable Person) | 01 | Cá nhân | 15.000.000 |

---

## State Management

### Server-side (SSR)

- **Session**: `user` from `supabase.auth.getUser()` — same pattern as Homepage. If absent → `redirect("/login")`. No caching beyond request lifecycle.
- **Locale**: `messages` + `locale` from `getMessages()` (reads `NEXT_LOCALE` cookie). Server renders the appropriate VN/EN catalogue.
- **Analytics**: Fire-and-forget `track({ type: "screen_view", screen: "awards" })` on render — no returned state.

### Client-side (`<AwardsCategoryNav />` only)

Minimal state — everything else is static SSR.

| State | Type | Purpose |
|---|---|---|
| `activeSlug` | `AwardSlug` | Currently highlighted nav item (derived from scroll-spy IntersectionObserver) |
| `prefersReducedMotion` | `boolean` | Read once from `matchMedia("(prefers-reduced-motion: reduce)")` — toggles smooth vs instant scroll |

**No global store required.** No React Context, no Zustand, no SWR/React Query. The awards data is a frozen constant imported from `src/data/awards.ts`; the messages come from a prop passed server → client.

### Loading / Error States

- **Loading**: Not applicable — page is fully server-rendered with inline data. User sees the complete page immediately after SSR response.
- **Error**: Only possible error is Supabase session fetch failure. Handled identically to Homepage (FR-016 parity): try/catch → treat as unauthenticated → `redirect("/login")`. No inline error banner on this screen.
- **Empty state**: Not applicable — the 6 awards are always present.

### Cache Strategy

- **HTTP caching**: Page is dynamic (requires session cookie) — `Cache-Control: private, no-store`. Cloudflare Workers/Next.js default for session-gated routes.
- **Locale cookie**: `NEXT_LOCALE` cached in browser as per cookie settings (no expiry from our side; Supabase's cookie handler manages its own session cookies).
- **Static assets**: 6 award badge PNGs + hero artwork served via `next/image` optimisation — cached at edge with long TTL, cache-busted on redeploy via build hash.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|---|---|---|---|
| Supabase `auth.getUser()` | built-in | Session verification | **Reuses Homepage pattern** |

**No additional API endpoints are required.** This is a fully static page — no runtime data fetch, no mutations. All content is authored (i18n strings + frozen data). Future enhancement could externalise the awards data if Product wants to edit without a deploy; that is explicitly out of scope for MVP.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Homepage award-grid click-through lands on the correct section — deep link `/awards#<slug>` auto-scrolls to the matching card within 500 ms of page paint in 95% of navigations.
- **SC-002**: Scroll-spy nav correctly highlights the visible award section 100% of the time (all 6 → active state matches what the user is reading).
- **SC-003**: Zero axe-core serious/critical accessibility violations at mobile (375×812) and desktop (1440×900) viewports.
- **SC-004**: Lighthouse mobile slow-4G: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms.
- **SC-005**: Language toggle VN↔EN flips 100% of visible copy (title, captions, all 6 descriptions, prize labels, Kudos promo, footer) with zero layout shift.
- **SC-006**: Page renders identically in all supported browsers (Chrome, Safari, Edge — latest 2 versions).

---

## Out of Scope

- **Runtime data editing** — No admin UI to edit award content. Copy changes require a code deploy (edit `src/messages/vi.json` + `en.json` + `src/data/awards.ts`).
- **Filter/search/sort** — No way to filter the 6 awards; they are always shown in fixed order.
- **Pagination** — All 6 awards on one page; no infinite scroll.
- **Past-year awards archive** — Only SAA 2025 is documented. Past years (if any) are excluded.
- **Per-user personalisation** — Every Sunner sees the same content, regardless of role/department/project.
- **Winner reveals** — No names or photos of 2025 winners. That's a separate post-event screen.
- **Related content** — No "Related kudos" or "People who won this last year" — pure static reference.
- **Downloadable brochure** — No PDF export. Users can print the browser page if they must.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] Design style reference: `.momorph/specs/i87tDx10uM-homepage-saa/design-style.md` (tokens inherit 1:1)
- [x] Shared layout components exist: `<SiteHeader/>`, `<SiteFooter/>`, `<LanguageToggle/>`, `<NotificationBell/>`, `<ProfileMenu/>`, `<QuickActionsFab/>`, `<KudosPromoBlock/>`
- [x] Frozen awards data file: `src/data/awards.ts` — will be **extended** with new fields
- [x] i18n catalogs: `src/messages/vi.json`, `src/messages/en.json` — will be extended with `awards.*` keys
- [ ] 6 golden-badge images at pixel-perfect quality — currently blocked on design team (see [assets-to-export.md](../i87tDx10uM-homepage-saa/assets-to-export.md) item 2). **Workaround**: reuse the shared `/images/awards/award-frame.png` 336×336 with overlay text, same as Homepage AwardCard — `AwardDetailSection` can consume either.
- [ ] Digital Numbers font — **not needed** on this screen (no countdown). Skip.
- [ ] SCREENFLOW.md updated: Awards System status "pending" → "discovered" after spec drafted, "implemented" when shipped.

---

## Open Questions

> Flagged for Product/Design confirmation — document each as an assumption in the corresponding task when unanswered.

- **Q1** — Long descriptions (the paragraph body for each award) are currently in the Figma design in Vietnamese only. **Is the Product team providing the English translation**, or do we hire translation / use machine translation for EN? Affects whether the EN catalogue has full content or falls back to VN on Day 1.
- **Q2** — Prize cash amounts in the Figma reference are **before tax**. **Should we display a footnote** ("before tax" / "trước thuế") next to the VND numbers? Affects FR-006 copy.
- **Q3** — Signature 2025 - Creator allows both cá nhân AND tập thể prizes. Figma shows two values ("5.000.000 cá nhân" / "8.000.000 tập thể"). **Is a given submission eligible for EITHER prize OR BOTH** (if it qualifies under both interpretations)? Affects description wording (clarify eligibility).
- **Q4** — The left nav item order (6 awards) exactly matches the right-side section order. If the user scrolls down, the nav moves from top → bottom. **Is there a desired default active state** on fresh page load (no hash)? Probable default: "Top Talent" is active since it's the first section. Need confirmation.
- **Q5** — Is "Hệ thống giải thưởng SAA 2025" vs "Hệ thống giải thưởng" (without year) the final title? Figma frame name is "Hệ thống giải" (no "thưởng" even); visible title is "Hệ thống giải thưởng SAA 2025". Treat visible title as source of truth.
- **Q6** — Does `/awards` need a meta title + description for SEO / Facebook OG image? If so, what copy? Suggested default: `<title>Hệ thống giải thưởng | SAA 2025</title>`.
- **Q7** — The nav item for "Signature 2025 - Creator" is long; Figma truncates at 2 lines ("Signature 2025 / Creator"). **Confirm** we wrap at the hyphen, not force-truncate.
- **Q8** — Should the scroll-spy also update the browser URL hash (`/awards#<slug>`) as the user scrolls? Or only when they click? The latter is less noisy; the former supports deep-sharing ("send me the link to this exact section"). Defaulting to **update on click only, do NOT rewrite URL while passive-scrolling** unless Product requests it.

---

## Notes

### Reuse from Homepage

This page is architecturally a **simpler sibling of the Homepage**: same shell (header, footer, FAB, backdrop pattern), same design tokens, same typography scale. The only net-new components are:
- `<AwardsHeroBanner>` — hero key visual + title (could reuse `<HeroBackdrop>` pattern)
- `<AwardsCategoryNav>` — client component with `IntersectionObserver` scroll-spy
- `<AwardDetailSection>` — 2-column alternating card (new pattern, unique to this page)

### Data-location decision

**Decision**: Store the prize count / unit / value as TypeScript constants in `src/data/awards.ts` (extend the existing `Award` type), NOT in i18n. Rationale: numerical values (`7.000.000`, `10`) are not language-specific; they are facts. Only the **labels** around those numbers ("Số lượng giải thưởng", "Cá nhân", "cho mỗi giải thưởng") go into i18n. This keeps the VN↔EN switcher cheap and avoids duplicating "10" across both locales.

### Routing decision

**Decision**: Keep the existing `/awards` route. The current `src/app/awards/page.tsx` is a stub (coming-soon) — it will be **replaced** by the real page when implementation starts. No new route is created.

### Login regression guard

When extending `src/data/awards.ts` with new fields, be careful not to break the Homepage `<AwardCard>` component which reads `{titleKey, descKey, image, slug}`. The new fields (`prizeCount`, `prizeUnit`, `prizeValues`, potentially `longDescKey`) are **additive** — existing consumers stay untouched. Verify Homepage still renders all 6 cards after the extension.

### Research open items (follow-ups for /momorph.plan)

- **IntersectionObserver scroll-spy** — pick threshold (40% of viewport? Sentinel element at top of each section?) and test with browser zoom (500% zoom shouldn't break scroll-spy).
- **Hash change vs. `history.replaceState`** — confirm React/Next.js doesn't strip or duplicate the hash on soft-navigations.
- **Image optimisation** — should the 6 cards use a single shared `award-frame.png` with text overlay (cheap, matches current Homepage) or 6 unique images (expensive, blocks on design)? Spec defaults to shared + text overlay until 6 unique assets ship.
- **Print styles** — Should `/awards` have print CSS? Probably out of scope for MVP.
