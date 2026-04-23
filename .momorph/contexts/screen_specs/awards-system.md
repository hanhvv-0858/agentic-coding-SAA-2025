# Screen: Awards System (Hệ thống giải thưởng SAA 2025)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `zFYDgyj_pD` (node `313:8436`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD |
| **Screen Group** | Core App |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

Dedicated landing at `/awards` for SAA 2025's **six award categories** —
the authoritative reference for each prize's purpose, criteria, count,
and cash value. Linked from the Homepage awards grid (`/` → each card →
`/awards#<slug>`), from the header "Award Information" nav, and from the
footer.

Two-column layout: a **sticky left nav** (6 category links with
scroll-spy) + a **right scrolling content column** with 6 large detail
cards — each card has an ornate 336×336 golden trophy badge, a long-form
description paragraph, the prize count, and the cash value(s). A reused
`<KudosPromoBlock />` sits below the awards list.

**Static, read-only** — no mutations, no runtime fetch. All data is
hard-coded in `src/data/awards.ts` and i18n catalogs; only the session
gate applies (same pattern as Homepage).

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Homepage SAA (`/`) | Any of 6 award cards with `#<slug>` deep link | Authenticated |
| Homepage SAA | Hero CTA "ABOUT AWARDS" | Authenticated |
| Homepage / Kudos / Thể lệ | Header nav "Award Information" | Authenticated |
| Footer (any authenticated screen) | "Award Information" footer link | Authenticated |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Kudos Live board (`/kudos`) | Kudos promo "Chi tiết →" | `335:12023` | High | Existing route |
| Homepage (`/`) | Logo / "About SAA 2025" nav | — | High | — |
| `/notifications` (parked) | Bell icon | — | Medium | — |
| `/profile` | Profile dropdown | — | High | — |
| Dropdown-ngôn ngữ (`hUyaaugye2`) | Language toggle | — | High | Overlay |
| `/the-le` (via FAB) | QuickActionsFab Thể lệ tile | — | High | Shell widget |
| `/kudos/new` (via FAB) | QuickActionsFab Viết KUDOS tile | — | High | Same |
| Same page (`/awards#<slug>`) | Left-nav click | `313:8459` | High | Smooth-scroll + `history.replaceState` on click; scroll-spy does NOT rewrite URL passively (Q8) |
| `/login?next=/awards` | 401 / missing session | — | High | Server guard |

### Navigation Rules

- **Back behavior**: Standard browser history. Hash-only nav uses
  `history.replaceState` on click (no stack pollution).
- **Deep link support**: Yes — `/awards#<slug>` auto-scrolls to matching
  section on load (respects `prefers-reduced-motion`).
- **Auth required**: Yes. `supabase.auth.getUser()` SSR gate.

---

## Component Schema

### Layout Structure

```
┌────────────────────────────────────────────────┐
│ SiteHeader (sticky)                            │
├────────────────────────────────────────────────┤
│                                                │
│   Hero: "Hệ thống giải thưởng SAA 2025"        │
│   Caption "Sun* annual awards 2025"            │
│                                                │
├────────┬───────────────────────────────────────┤
│ Nav    │  D.1 Top Talent                       │
│ (stick)│   [trophy 336×336]  ← alternating     │
│ • TT   │   description…                        │
│ • TP   │   Số lượng: 10 Cá nhân                │
│ • TPL  │   Giá trị: 7.000.000 VNĐ cho mỗi…     │
│ • BM   ├───────────────────────────────────────┤
│ • S25C │  D.2 Top Project (image left)         │
│ • MVP  │   …                                   │
│        ├───────────────────────────────────────┤
│        │  D.3 Top Project Leader               │
│        ├───────────────────────────────────────┤
│        │  D.4 Best Manager (count=1, 1 value)  │
│        ├───────────────────────────────────────┤
│        │  D.5 Signature 2025 (count=1, 2 vals) │
│        ├───────────────────────────────────────┤
│        │  D.6 MVP (count=1, 1 value)           │
├────────┴───────────────────────────────────────┤
│ Sun* Kudos promo (reused)                      │
├────────────────────────────────────────────────┤
│ SiteFooter                                     │
└────────────────────────────────────────────────┘
                                       [FAB]
```

### Component Hierarchy

```
AwardsPage (Server Component — src/app/awards/page.tsx)
├── SiteHeader
├── AwardsHeroBanner
├── AwardsCategoryNav (client — sticky, IntersectionObserver)
├── AwardDetailSection × 6 (alternating image side)
│   ├── TrophyBadgeImage (336×336 PNG)
│   ├── H2 title (cream 36/44 700)
│   ├── Long-form description
│   ├── PrizeCountRow "Số lượng giải thưởng: N Cá nhân|Tập thể"
│   └── PrizeValueRow × (1 or 2)
├── KudosPromoBlock (reused from Homepage)
├── SiteFooter
└── QuickActionsFab (shell widget)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| AwardsHeroBanner | Organism | `313:8437` + `313:8453` | Hero key visual + title + caption | No |
| AwardsCategoryNav | Organism | `313:8459` | Sticky left nav, scroll-spy active state | No |
| AwardDetailSection | Organism | `313:8467`–`313:8510` | 2-col alternating trophy + content | Yes (parameterised per award) |
| PrizeValueRow | Molecule | — | Suffix key per value ("cho mỗi giải thưởng", "cho giải cá nhân", "cho giải tập thể", or none) | Yes |
| KudosPromoBlock | Organism | `335:12023` | Reused from Homepage | Yes |

---

## Form Fields

N/A — fully read-only page.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `supabase.auth.getUser()` | built-in | Session gate | Redirect to `/login?next=/awards` if absent |
| Frozen data `src/data/awards.ts` | import | 6 awards w/ new fields `longDescKey`, `prizeCount`, `prizeUnit`, `prizeValues[]` | Section rendering |
| i18n `src/messages/{vi,en}.json` `awards.*` | import | All user-visible strings | Title, captions, descriptions, suffix copy |

No DB reads. No mutations.

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click left-nav item | `history.replaceState` + smooth scroll | client | — | URL → `/awards#<slug>` (no history entry); scroll-spy pauses until `scrollend` / 600 ms timeout |
| Scroll | IntersectionObserver (`rootMargin: "-40% 0px -60% 0px"`) | client | — | Active nav state updates; does **not** rewrite URL |
| Click Kudos promo CTA | `<Link href="/kudos">` | client nav | — | Navigate |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| `getUser()` throws | — | Redirect `/login?next=/awards` (FR-013, inherits Homepage pattern) |
| Unknown hash | — | Load normally; first section (Top Talent) active |
| `scrollend` unsupported (Safari < 16.4) | — | 600 ms `setTimeout` fallback to re-enable scroll-spy |

---

## State Management

### Server-side (SSR)
- Session via `supabase.auth.getUser()`.
- Locale via `getMessages()`.
- Analytics: `track({ type: "screen_view", screen: "awards" })`.

### Client-side (`<AwardsCategoryNav>` only)

| State | Type | Purpose |
|-------|------|---------|
| `activeSlug` | `AwardSlug` | Currently highlighted (scroll-spy OR deep-link OR click) |
| `prefersReducedMotion` | boolean | One-shot matchMedia read — toggles smooth vs instant scroll |

No global store. No SWR/React-Query. No runtime fetch.

### Cache Strategy
- `Cache-Control: private, no-store` (session-gated).
- 6 award badge PNGs cached at edge via `next/image`.

---

## UI States

### Loading State
- N/A — fully SSR; first paint complete.

### Error State
- Only the session-gate error (redirect). No inline error UI.

### Success State
- Default render.

### Empty State
- N/A — 6 awards always present.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Headings | Single `<h1>` = hero title; each award section `<h2>`. "ROOT FURTHER" backdrop wordmark is `aria-hidden="true"` (not a heading — FR-016) |
| Left nav | `<nav aria-label="Awards categories">`; active item `aria-current="true"` |
| Header nav | "Award Information" gets `aria-current="page"` via `<NavLink>` + `usePathname()` |
| Touch targets | ≥ 44 × 44 px on mobile-visible interactive elements |
| Contrast | Cream on dark = 12.1 : 1; white on dark = 17.4 : 1 (AA) |
| Keyboard | Tab through nav; Enter/Space scrolls + deep-links |
| Reduced motion | Smooth scroll → instant; nav hover skips `translateX` |
| Skip link | Lands in `#main` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Left nav hidden; sections stack image-top / content-below; responsive title `text-4xl sm:text-5xl` |
| Tablet (640–1023px) | Same single-column as mobile but wider |
| Desktop (≥1024px) | 2-col layout, sticky left nav, alternating image side (odd=image-right, even=image-left per FR-008) |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `screen_view` | SSR render | `{ screen: "awards" }` (FR-011) |
| `awards_nav_click` | Left-nav click | `{ slug }` |
| `awards_kudos_cta` | Click Kudos promo CTA | — |

---

## Design Tokens

Reuses Homepage tokens — **one new token**:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-nav-dot` | `#D4271D` | Red dot on active nav item (also aliased as `--color-heart-active` on Live board) |

Plus existing `--color-accent-cream`, `--color-brand-900`,
`--color-card`, `--color-divider`, `--font-montserrat`.

---

## Implementation Notes

### Dependencies
- Shared shell components: `<SiteHeader>`, `<SiteFooter>`,
  `<LanguageToggle>`, `<NotificationBell>`, `<ProfileMenu>`,
  `<QuickActionsFab>`, `<KudosPromoBlock>` (all from Homepage).
- Frozen data: `src/data/awards.ts` extended with **new fields**
  (`longDescKey`, `prizeCount`, `prizeUnit`, `prizeValues[]`) — additive,
  non-breaking for Homepage's `<AwardCard>`.
- i18n catalogs extended with `awards.*` namespace.
- IntersectionObserver (native) — no new deps.

### Special Considerations
- **Prize-value rendering (FR-007)**:
  - `prizeCount > 1` → single row with "cho mỗi giải thưởng" suffix.
  - `prizeCount === 1` + 1 value → no suffix (Best Manager, MVP).
  - `prizeCount === 1` + 2 values → two rows (cá nhân / tập thể) for
    Signature 2025.
- **Layout alternation (FR-008)**: odd sections image-right, even
  image-left on desktop; mobile stacks image-top.
- **Scroll-spy pause (FR-005a)**: while a programmatic smooth-scroll is
  in flight, observer updates are paused until `scrollend` or 600 ms
  fallback.
- **Workers compat**: SSR + hydration run on Cloudflare Workers; no
  `node:*` imports.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation in progress |
| Confidence Score | High |

### Next Steps

- [ ] Export 6 unique golden-badge PNGs (currently fallback to shared
      `/images/awards/award-frame.png`).
- [ ] Confirm EN translations for long-form descriptions (Q1) with
      Product.
- [ ] Confirm whether to display "before tax" footnote next to VND
      values (Q2).
- [ ] Resolve Signature 2025 eligibility wording (Q3).
- [ ] Confirm meta title / OG image (Q6).
