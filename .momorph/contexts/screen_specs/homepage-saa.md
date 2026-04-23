# Screen: Homepage SAA 2025

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `i87tDx10uM` (node `2167:9026`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM |
| **Screen Group** | Core App |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

Post-login landing at `/` for every authenticated Sun\* employee.
Introduces the **"Root Further"** theme of SAA 2025, counts down to the
awards **ceremony** (`NEXT_PUBLIC_CEREMONY_AT` — mốc B), showcases the
six award categories, and promotes the Sun\* Kudos campaign.

Two distinct SAA moments are split across two pages:
- **mốc A** `NEXT_PUBLIC_SITE_LAUNCH_AT` — gated by the Prelaunch
  [countdown screen](./countdown.md).
- **mốc B** `NEXT_PUBLIC_CEREMONY_AT` — the hero countdown on **this**
  screen.

Invariant `SITE_LAUNCH_AT <= CEREMONY_AT` is enforced at boot via Zod
`.refine()` in `src/libs/env/client.ts`.

Read-mostly — no CRUD on this page. Users navigate out to `/awards`,
`/kudos`, `/profile`, `/notifications`.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Login (`/login`) | Successful Google OAuth | Session established |
| Any authenticated screen | Click SAA logo (header / footer) | Logo always navigates to `/` |
| Onboarding (`/onboarding`) | Submit success | `completeOnboarding()` redirects to `/` |
| Direct URL `/` | Browser entry | Authenticated |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Awards (`/awards`) | Hero CTA "ABOUT AWARDS" / header "Award Information" / footer / any award card w/ `#<slug>` | `2167:9063`, `5005:14974` × 6 | High | Deep link `/awards#<slug>`; slugs: top-talent / top-project / top-project-leader / best-manager / signature-2025-creator / mvp |
| Kudos Live board (`/kudos`) | Hero CTA "ABOUT KUDOS" / header "Sun\* Kudos" / footer / Kudos promo "Chi tiết →" | `2167:9064`, `3390:10349` | High | Inherits existing `/kudos` route |
| `/notifications` (parked) | Bell icon | `I2167:9091;186:2101` | Medium | Route stub; badge count TBD |
| `/profile` | Profile dropdown "Profile" row | `I2167:9091;186:1597` | High | Existing route `src/app/profile/page.tsx` |
| `/admin` | Profile dropdown "Dashboard" row | — | High | Only when `app_metadata.role === "admin"` — see [dropdown-profile-admin](./dropdown-profile-admin.md) |
| `/login` | Logout (Server Action) | — | High | `signOut` clears session |
| Dropdown-ngôn ngữ (`hUyaaugye2`) | Language toggle | `I2167:9091;186:1696` | High | Overlay |
| `/kudos/new` (via FAB) | `<QuickActionsFab>` | `5022:15169` | High | Shell widget, global |
| `/` self-scroll | Header "About SAA 2025" link on current page | — | High | Smooth-scroll to top (FR-005) |

### Navigation Rules

- **Back behavior**: Standard browser history. Post-login, visiting
  `/login` with an active session redirects back to `/`.
- **Deep link support**: Yes — `/` is public authenticated entry. Award
  card clicks embed `#<slug>` anchors.
- **Auth required**: Yes. `createServerClient().auth.getUser()` in SSR;
  unauthenticated → `/login`.

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────────────────┐
│ A1 Header  [Logo] [nav × 3] [🔔][VN ▾][👤]       │  ← sticky
├──────────────────────────────────────────────────┤
│                                                  │
│   B1 Hero ("ROOT FURTHER")                       │
│   "Coming soon" · DD · HH · MM                   │
│   Thời gian: 26/12/2025 — Địa điểm: Âu Cơ…       │
│   [ABOUT AWARDS]     [ABOUT KUDOS]               │
│                                                  │
├──────────────────────────────────────────────────┤
│   B4 Root Further description card               │
├──────────────────────────────────────────────────┤
│   C1 "Hệ thống giải thưởng" header               │
│   C2 Award grid (3×2 desktop)                    │
│     Top Talent | Top Project | TP Leader         │
│     Best Manager | Signature 2025 | MVP          │
├──────────────────────────────────────────────────┤
│   D1 Sun* Kudos promo + "Chi tiết →"             │
├──────────────────────────────────────────────────┤
│   7 Footer  [logo] [nav × 4] [© 2025]            │
└──────────────────────────────────────────────────┘
                                       [FAB] (fixed)
```

### Component Hierarchy

```
HomePage (Server Component — src/app/page.tsx)
├── SiteHeader (sticky, bg=brand-700)
│   ├── Logo (smooth-scroll-to-top on Home)
│   ├── NavLink × 3 (About SAA / Award Info / Sun* Kudos)
│   ├── NotificationBell (client, badge)
│   ├── LanguageToggle (client)
│   └── ProfileMenu (client, isAdmin prop)
├── HeroSection
│   ├── HeroBackdrop (full-bleed BG + cover)
│   ├── RootFurther PNG (priority next/image)
│   ├── ComingSoonLabel
│   ├── Countdown (client, 60 s tick, mốc B)
│   ├── EventInfoBlock (time/location/stream)
│   └── HeroCTAs × 2
├── RootFurtherDescription
├── AwardsSection
│   ├── SectionHeader
│   └── AwardCard × 6 (from src/data/awards.ts)
├── KudosPromoBlock
├── SiteFooter
└── QuickActionsFab (client, fixed z-50)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| SiteHeader | Organism | `2167:9091` | Sticky nav; reused on `/awards`, `/kudos` | Yes |
| Countdown | Organism | `2167:9037` | 3 tiles DD·HH·MM, client, 60 s tick | Yes |
| AwardCard | Molecule | `5005:14974` | Image + title + 2-line desc + "Chi tiết →" | Yes |
| KudosPromoBlock | Organism | `3390:10349` | Reused verbatim on `/awards` | Yes |
| QuickActionsFab | Molecule | `5022:15169` | Shell widget; see FAB specs | Yes |

---

## Form Fields

N/A — read-only page. Forms are reached by navigating out (language toggle, FAB → `/kudos/new`).

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `supabase.auth.getUser()` | built-in | Session gate + `app_metadata.role` | Redirect to `/login` if absent; feed `isAdmin` to ProfileMenu |
| `NEXT_PUBLIC_CEREMONY_AT` env | — | Countdown target timestamp | Compute remaining D/H/M |
| (future) `SELECT count(*) FROM notifications WHERE user_id AND read_at IS NULL` | Supabase | Bell badge count | MVP hardcodes 0 |
| Frozen data `src/data/awards.ts` | import | 6 award cards | Grid rendering |

No DB tables mutated by this screen.

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click award card / hero CTA / nav | `<Link>` / anchor | client nav | — | `/awards#<slug>` / `/kudos` / `/notifications` |
| Logout (in ProfileMenu) | `signOut` Server Action | form action | — | Clears session → `/login` |
| Language toggle | `setLocale` Server Action | — | `{ locale }` | Cookie + revalidate |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| `getUser()` throws (Supabase unreachable) | Minimal error page with "Try again" link | Defense-in-depth (FR-016) — does NOT crash route |
| `NEXT_PUBLIC_CEREMONY_AT` missing/invalid | "Event details coming soon" | Graceful Countdown fallback |
| Countdown < 0 | Tiles hold "00"; "Coming soon" hidden | No negative values |

---

## State Management

### Server-side
- Session + role: from `supabase.auth.getUser()`.
- Locale: `getMessages()` from `NEXT_LOCALE` cookie.
- Unread count: future query.

### Client-side

| State | Owner | Purpose |
|-------|-------|---------|
| `remainingMs` / `isLaunched` | `<Countdown>` | Visible DD/HH/MM + fallback when passed |
| `tickIntervalId` | `<Countdown>` | 60-s `setInterval` handle |
| `isLanguageOpen` / `isProfileOpen` | dropdown clients | Overlay state |
| `fabOpen` | `<QuickActionsFab>` | Widget state |
| `prefersReducedMotion` | matchMedia | Animation gating |

### Cache Strategy
- `/` session-gated — `Cache-Control: private, no-store`.
- Static PNGs cached at edge via `next/image`.

---

## UI States

### Loading State
- Hero + Countdown SSR; only lazy award thumbnails + Kudos illustration
  stream in later.

### Error State
- Per FR-016, minimal retry page for Supabase network failure; no crash.

### Success State
- Default render.

### Empty State
- Notifications badge hidden when unread = 0.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Heading hierarchy | Single `<h1>` = hero title; `<h2>` = "Hệ thống giải thưởng" etc. |
| Active route | Nav links carry `aria-current="page"` via `<NavLink>` + `usePathname()` |
| Countdown | `aria-live="polite"` wrapper so SR catches minute updates |
| Touch targets | ≥ 44 × 44 px on every interactive element |
| Skip link | Jumps to `#main` |
| Keyboard order | Logo → 3 nav links → bell → language → profile → hero CTAs → award cards → Kudos promo CTA → footer → FAB |
| Contrast | WCAG 2.2 AA — cream on dark ≈ 12.1 : 1 |
| Reduced motion | `motion-safe:` gating on hero fade-in, card lift, CTA transitions |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Hero tiles shrink; award grid 1-column; stacked CTAs; tighter padding |
| Tablet (640–1023px) | Award grid 2-column; hero centred |
| Desktop (≥1024px) | Award grid 3×2; full hero with PNG `priority` |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `screen_view` | SSR render | `{ screen: "homepage" }` |
| `award_card_click` | Any of 6 cards | `{ slug }` |
| `hero_cta_click` | "ABOUT AWARDS" / "ABOUT KUDOS" | `{ target: "awards" \| "kudos" }` |
| `language_change` | Locale selected | `{ from, to }` |

---

## Design Tokens

Inherits the SAA token system — examples:

| Token | Usage |
|-------|-------|
| `--color-brand-900` / `--color-brand-700` | Page + header bg |
| `--color-accent-cream` | CTA fill, cream text, countdown tile face |
| `--color-divider` | Section separators |
| `--font-montserrat` | Global type |
| Digital Numbers (fallback `Courier New tabular-nums`) | Countdown digits |

---

## Implementation Notes

### Dependencies
- `next/image` for hero + award PNGs with explicit `sizes`.
- `<Icon>` primitives — no inline SVG.
- `next-intl` / message catalog under `homepage.*`, `common.nav.*`.
- Frozen data: `src/data/awards.ts`.

### Special Considerations
- **Env-var split** enforces `SITE_LAUNCH_AT <= CEREMONY_AT`.
- **Countdown hydration**: SSR the initial remaining value from server
  time to avoid mismatch; client takes over ticking.
- **Tab backgrounded**: on `visibilitychange → visible`, immediately
  recompute before resuming the interval.
- **Admin surface**: Role resolved server-side only; propagated via
  `isAdmin` prop to `<ProfileMenu>`.
- **Bundle**: ≤ 40 KB client JS (5 small client islands).

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation shipped |
| Confidence Score | High |

### Next Steps

- [ ] Wire real notifications unread count once Notifications spec lands.
- [ ] Confirm actual kick-off time-of-day for `NEXT_PUBLIC_CEREMONY_AT`
      with Product.
- [ ] Confirm copy for "Coming soon" / "Comming soon" typo.
