# Screen: Sun* Kudos – Live board

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `MaZUn5xHXZ` (node `2940:13431`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ |
| **Screen Group** | Core App — Kudos |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

Authenticated real-time feed at `/kudos` — the social heart of SAA 2025. A
single page where every Sunner can:

1. **Browse** the newest "lời cảm ơn" (kudos) across the company.
2. **Scan** the top-5 hearted cards in the HIGHLIGHT KUDOS carousel.
3. **Explore** the SPOTLIGHT BOARD word-cloud of every kudo recipient (pan/zoom).
4. **Filter** the feed by hashtag or Phòng ban (department).
5. **Heart** a kudo they love (toggle, optimistic, debounced 300 ms).
6. **Compose** a new kudo via the A.1 pill → `/kudos/new`.
7. **Preview profile** via hover/tap tooltip on any avatar/name.
8. **See honour tiers** via hoa-thị hover (New / Rising / Super / Legend Hero).

Layout is three vertical slabs inside a 1440 × 5862 page:
- **A** — KV Kudos hero (title + composer pill + sunner search)
- **B** — HIGHLIGHT carousel + SPOTLIGHT word-cloud
- **C + D** — All Kudos feed + sticky right sidebar (personal stats + 10
  latest giftees)

All mutations are optimistic; feed + carousel are paginated (10 per page,
newest-first); spotlight is a single precomputed word-cloud. 60-second
polling via `<SpotlightAutoRefresh />` keeps the counter + cloud fresh.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Homepage SAA (`/`) | Hero CTA "ABOUT KUDOS" / Kudos promo "Chi tiết →" / header "Sun* Kudos" | Authenticated |
| Awards page (`/awards`) | Kudos promo "Chi tiết →" / header "Sun* Kudos" | Authenticated |
| Thể lệ (`/the-le`) | "Viết KUDOS" CTA lands on `/kudos/new` (sibling); rules link back to `/kudos` | Authenticated |
| QuickActions FAB | "Viết KUDOS" tile → `/kudos/new`, which posts back to `/kudos` | Authenticated |
| Login (`/login`) | Post-OAuth redirect if `?next=/kudos` | Authenticated |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| `/kudos/new` (Viết Kudo) | A.1 composer pill (`2940:13449`) | `2940:13449` | High | Also reachable via FAB — see `ihQ26W78P2` |
| Dropdown hashtag (`JWpsISMAaM`) | B.1.1 Hashtag chip | `2940:13459` | High | Popover, not a route |
| Dropdown Phòng ban (`WXK5AYB_rG`) | B.1.2 Bộ phận chip | `2940:13460` | High | Popover |
| `/kudos?hashtag=<slug>` | Hashtag pill inside a kudo card (C.3.7) | `I3127:21871;256:5158` | High | FR-008 — inline tag click applies filter |
| `/profile/:userId` (parked) | Profile preview tooltip CTA | — | Medium | Route currently parked; dev-only `toast("Đang xây dựng")` |
| `/kudos/new?recipient=:userId` | "Gửi KUDO" CTA inside profile preview tooltip | `721:5827` | High | Pre-fills recipient field |
| Secret Box dialog (parked) | D.1.8 "Mở quà" CTA | `2940:13497` | Medium | Figma frame `1466:7676` — deferred to own spec; toast for MVP |
| `/kudos/:id` (parked) | Click card body / "Xem chi tiết" | — | Medium | FR-012 — toast fallback |
| `/login?next=/kudos` | 401 API response | — | High | Session-expired guard |

### Navigation Rules

- **Back behavior**: URL-filter changes use `router.replace()` (no history spam).
  Plain browser Back returns to pre-/kudos origin.
- **Deep link support**: Yes — `/kudos?hashtag=<slug>&department=<code>` is
  the shareable filtered view. Filters MUST SSR with pre-filtered data.
- **Auth required**: Yes. Unauthenticated → `/login?next=/kudos`.

---

## Component Schema

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  SiteHeader (sticky)                                       │
├────────────────────────────────────────────────────────────┤
│  A — KV Kudos hero                                         │
│   "Hệ thống ghi nhận lời cảm ơn"                           │
│   [A.1 Ghi nhận pill: Hôm nay...] [A.1' Tìm kiếm sunner]   │
├────────────────────────────────────────────────────────────┤
│  B — HIGHLIGHT section                                     │
│   [B.1.1 #Hashtag] [B.1.2 Bộ phận]                         │
│   HIGHLIGHT KUDOS                                          │
│   ◀  [side]  [CENTER CARD]  [side]  ▶    (pager "2/5")    │
│   SPOTLIGHT BOARD (pan/zoom word-cloud)                    │
│   [388 KUDOS counter]             [B.7.3 sunner search]    │
├────────────────────────────────────────────────────────────┤
│  C — ALL KUDOS feed          │  D — Personal sidebar       │
│  ┌─────────────────────────┐ │  ┌─────────────────────┐    │
│  │ KudoPostCard            │ │  │ D.1 Thống kê tổng   │    │
│  │ sender → recipient      │ │  │  Kudos nhận / gửi   │    │
│  │ body (clamp 5 lines)    │ │  │  Hearts             │    │
│  │ [image thumbs × ≤5]     │ │  │  Secret boxes       │    │
│  │ #tag #tag (≤5)          │ │  │  [D.1.8 Mở quà]     │    │
│  │ ♥ 1.000   🔗 Copy Link  │ │  └─────────────────────┘    │
│  └─────────────────────────┘ │  ┌─────────────────────┐    │
│  (…feed, page size 10)       │  │ D.3 10 latest       │    │
│                              │  │ gift recipients     │    │
│                              │  └─────────────────────┘    │
├────────────────────────────────────────────────────────────┤
│  SiteFooter + QuickActionsFab (fixed)                      │
└────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
KudosPage (Server Component — /kudos)
├── SiteHeader
├── KudosHero + KudosComposerPill (A)
├── FilterBar
│   ├── HashtagChip → FilterDropdown kind="hashtag"
│   └── DepartmentChip → FilterDropdown kind="department"
├── HighlightSection
│   ├── HighlightHeader
│   ├── HighlightCarousel (client — embla or hand-rolled)
│   └── CarouselPager
├── SpotlightSection (lazy-mounted below fold)
│   ├── SpotlightHeader + SpotlightCounter
│   ├── SpotlightSearch
│   ├── SpotlightBoard (pan/zoom)
│   └── SpotlightAutoRefresh (60 s visibility-gated)
├── AllKudosFeed (C)
│   └── KudoPostCard × N (client — optimistic heart)
│       ├── KudoParticipant × 2 (sender / recipient)
│       │   └── hover → ProfilePreviewTooltip / HonourTooltip
│       ├── KudoCardContent (clamp 5)
│       ├── KudoCardImages (≤5)
│       ├── KudoCardHashtags (≤5)
│       └── KudoCardActionBar (HeartButton + CopyLinkButton)
├── KudoStatsSidebar (D)
│   ├── StatsBlock (D.1)
│   └── LatestGiftRecipients (D.3)
├── QuickActionsFab
└── SiteFooter
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| KudosHero | Organism | `2940:13432` | Hero + composer pill | No |
| KudosComposerPill | Molecule | `2940:13449` | 738×72 cream-bordered pill → `/kudos/new` | No |
| HashtagFilterButton | Molecule | `2940:13459` | Opens hashtag dropdown | Yes |
| DepartmentFilterButton | Molecule | `2940:13460` | Opens dept. dropdown | Yes |
| HighlightCarousel | Organism | `2940:13461` | 5-card carousel | No |
| SpotlightBoard | Organism | `2940:14174` | Word-cloud w/ pan/zoom | No |
| KudoPostCard | Organism | `3127:21871` | Cream card 680×~750 | Yes |
| HeartButton | Atom | `I3127:21871;256:5175` | Optimistic toggle, debounce 300 ms | Yes |
| CopyLinkButton | Atom | `I3127:21871;256:5216` | Clipboard + toast | Yes |
| ProfilePreviewTooltip | Molecule | `721:5827` | Hover popover w/ "Gửi KUDO" CTA | Yes |
| HonourTooltip | Molecule | `twC9br89ra` / 3 more | Tier-specific hero copy | Yes |
| StatsBlock (D.1) | Organism | `2940:13489` | 5 metrics + secret-box CTA | No |

---

## Form Fields (If Applicable)

The feed itself has no inputs; the *Sunner search* (A.1 sibling) and
*SPOTLIGHT search* (B.7.3) are read-only lookups — no validation beyond
non-empty query. Heart toggle is a button, not a form.

---

## API Mapping

### On Screen Load (Server Component `src/app/kudos/page.tsx`)

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `getKudoFeed({ hashtag, department, limit: 10 })` | Server Action | First page of kudos (newest-first) | Feed rows — tables `kudos`, `kudo_recipients`, `kudo_hashtags`, `kudo_images`, `kudo_hearts` |
| `getHighlightKudos({ hashtag, department })` | Server Action | Top-5 hearted kudos | Carousel items |
| `getSpotlight()` / `getSpotlightRecipients()` | Server Action | Precomputed word-cloud positions + total | `SpotlightBoard` + counter |
| `getMyKudosStats()` | Server Action | Viewer's 5 personal metrics | D.1 sidebar — reads `kudos`, `kudo_hearts`, `secret_boxes` |
| `getLatestGiftees(10)` | Server Action | 10 most-recent gift recipients | D.3 — reads `gift_redemptions` |
| `getKudoHashtags()` | Server Action | Populate hashtag dropdown | `hashtags` table |
| `getKudoDepartments()` | Server Action | Populate dept dropdown | `departments` table |
| `supabase.auth.getUser()` | built-in | Session gate | Redirect to `/login` if absent |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Heart toggle | `toggleKudoHeart(kudoId)` | Server Action | — | Writes to `kudo_hearts` (UNIQUE `(user_id, kudo_id)`); idempotent UPSERT |
| Apply filter | URL `router.replace()` | client nav | — | Re-triggers SSR fetch with new `searchParams` |
| Compose kudo | `Link /kudos/new` | client nav | — | Opens Viết Kudo |
| Hover avatar | `getProfilePreview(userId)` | Server Action | — | 400 ms dwell → popover with display name, dept, tier, kudos-sent/received |
| Copy link | `navigator.clipboard.writeText(url)` | client | — | Toast "Link copied — ready to share!" |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| 401 | — | Redirect `/login?next=/kudos` |
| 5xx on feed | "Không tải được Kudos. Thử lại" | Inline retry in C slot |
| 5xx on carousel | Same | Inline retry in B slot |
| 5xx on spotlight | — | Collapse block (non-blocking) |
| Heart offline | "Bạn đang offline. Thao tác sẽ đồng bộ khi kết nối lại." | Queue + retry on reconnect |

---

## State Management

### Server-side (SSR)

All critical data (feed / carousel / stats / D.3 / hashtag+dept lists) pre-fetched in `/kudos/page.tsx` via `Promise.all` and hydrated into components. Spotlight is lazy (below-the-fold).

### Client-side

| State | Owner | Purpose |
|-------|-------|---------|
| `heartState[id]` | `<HeartButton>` via `useOptimistic` | Instant toggle; rollback on error |
| `filterState` | `FilterBar` (URL-driven) | Active hashtag + department |
| `carouselIndex` | `<HighlightCarousel>` | Current slide |
| `feedPage` | `<KudoListClient>` | Pagination cursor |
| `spotlightView` | `<SpotlightBoard>` | Pan offset + zoom scale |
| `heartsCache` | module-level Map | Syncs carousel ↔ feed (FR-009) |

### Cache Strategy

- `/kudos` route: `Cache-Control: private, no-store` (session-gated).
- Hashtag + Department lists: edge revalidate 3600 s.
- Spotlight: 60 s polling via `<SpotlightAutoRefresh />` with visibility gate.

---

## UI States

### Loading State
- Feed / carousel skeletons if SSR fetch > 200 ms.
- Spotlight skeleton until lazy-mount resolves.

### Error State
- Per-block inline error + Retry (feed / carousel / spotlight / D.1 / D.3 each fail independently).

### Success State
- Feed renders; heart toggle animates (unless reduced-motion); tooltips appear after 400 ms dwell.

### Empty State
- Feed / carousel: "Hiện tại chưa có Kudos nào."
- Spotlight: "Chưa có ai nhận Kudos."
- D.3: "Chưa có ai nhận quà trong hôm nay."

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Heading hierarchy | `<h1>` = "Hệ thống ghi nhận lời cảm ơn"; section titles = `<h2>` |
| Heart state | `aria-pressed="true\|false"`; disabled self-hearts via `aria-disabled="true"` |
| Filter chips | `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` |
| Carousel | `role="region"` + `aria-roledescription="carousel"`; slides are `role="group"` |
| Spotlight names | `<button>` with `aria-label`; single tabstop + arrow-key focus |
| Live counter | `aria-live="polite"` on "388 KUDOS" |
| Contrast | Navy on cream ≈ 15.8 : 1; cream on dark = 12.1 : 1 (AA) |
| Skip link | To `#feed` |
| Focus ring | 2 px cream outline + 2 px offset on every focusable |
| Reduced motion | Heart scale, carousel, shimmer, tooltip fade → instant |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | A.1 pill full-width; filter chips horizontally scroll; carousel 1-at-a-time + swipe; sidebar D stacks below; Spotlight may degrade to list |
| Tablet (640–1023px) | Sidebar D stacks below C; carousel single card visible |
| Desktop (≥1024px) | Full 3-slab layout (680 + 422 columns) per Figma |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `screen_view` | SSR render | `{ screen: "kudos_liveboard" }` |
| `kudo_hearted` | Heart success | `{ id, action: "add" \| "remove" }` |
| `kudos_filter_apply` | Filter change | `{ kind, value }` (existing) |
| `compose_open` | Click A.1 pill / FAB | `{ source: "liveboard_pill" \| "fab" }` |
| `copy_link` | Click Copy Link | `{ kudo_id }` |

---

## Design Tokens

Key additions flagged in spec — **new tokens**:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-kudo-card` | `#FFF8E1` | Cream-white KUDO card surface |
| `--color-muted-grey` | `#999999` | Timestamps, inactive heart |
| `--color-heart-active` | alias of `--color-nav-dot` (`#D4271D`) | Active heart |
| `--color-secondary-btn-fill` | `rgba(255,234,158,0.10)` | Composer pill / filter chips |
| `--radius-kudo-card` | `24px` | Card corner |
| `--radius-highlight-card` | `16px` | Highlight card |
| `--radius-spotlight` | `47px` | Spotlight panel |
| `--radius-pill` | `68px` | Composer + sunner-search pills |
| `--shadow-kudo-card` | `0 4px 12px rgba(0,0,0,0.25)` | Card drop shadow |

Plus existing brand tokens (`--color-brand-900`, `--color-accent-cream`,
`--font-montserrat`, etc.).

---

## Implementation Notes

### Dependencies
- Server Actions in `src/app/kudos/actions.ts`.
- Client components: `HeartButton`, `HighlightCarousel`, `SpotlightBoard`,
  `FilterDropdown`, `KudoListClient`, `SpotlightAutoRefresh`.
- Virtualise feed once `items.length > 30` via `@tanstack/react-virtual`.

### Special Considerations
- **Honour tier auto-computation** — DB trigger on `INSERT kudo_recipients`
  calls `compute_honour_tier()` (migration 0018). Thresholds:
  1–4 New / 5–9 Rising / 10–19 Super / ≥20 Legend. Counts **distinct senders**.
- **Anonymous kudos** — server-side identity swap in `getKudoFeed` +
  `getHighlightKudos` (`sender_id=null`, `display_name=<alias>`, incognito
  avatar). Card reads a single `is_anonymous` prop (see migrations 0015+0017).
- **Spotlight word-cloud** — precomputed x/y/weight from the server; no
  live CSS reflow per tick.
- **Session-gated**: try/catch around `getUser()` → redirect to `/login`.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation shipped |
| Confidence Score | High |

### Next Steps

- [ ] Finalise Secret Box dialog spec (currently a placeholder CTA).
- [ ] Ship the `/kudos/:id` detail view so card clicks + Copy Link land somewhere.
- [ ] Ship `/profile/:userId` so ProfilePreview → full profile lands.
