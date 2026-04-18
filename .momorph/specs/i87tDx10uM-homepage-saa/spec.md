# Feature Specification: Homepage SAA 2025

**Frame ID**: `i87tDx10uM` (Figma node `2167:9026`)
**Frame Name**: `Homepage SAA`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**Created**: 2026-04-17
**Status**: Draft

> Visual specs (colors, typography, spacing, component dimensions, ASCII layout,
> responsive breakpoints, implementation mapping) live in a separate sibling
> document: **[design-style.md](design-style.md)**. This spec focuses on
> behavior, data, and acceptance criteria.

---

## Overview

The **Homepage SAA** is the landing page every authenticated Sun\* employee
sees after signing in. It introduces the "Root Further" theme of SAA 2025,
counts down to the event start, showcases the six award categories, and
promotes the Sun\* Kudos campaign.

**Target users**

- Sun\* employees who just signed in — primary audience, browse + navigate to
  subsections.
- Admins — same landing; admin tools are reached from the profile dropdown.

**Business context**

- The Homepage is the single post-login landing route (`/`).
- It's a **read-mostly** page — no CRUD happens here. Users navigate outward:
  `/awards`, `/kudos`, `/profile`, `/notifications`.
- Countdown reinforces event urgency; award cards whet interest in specific
  categories.
- "Root Further" block is the primary brand moment — substantial body copy
  explaining the event theme.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Landing after login (Priority: P1) 🎯 MVP

**As a** Sun\* employee who just authenticated,
**I want to** see the SAA 2025 landing page with event countdown, award
categories, and Kudos promo,
**So that** I can orient myself and decide where to navigate next.

**Why this priority**: Homepage is the destination of the entire Login flow
(already implemented). Without it, clicking "LOGIN With Google" dumps the user
on an empty placeholder. MVP-defining.

**Independent Test**: Authenticated browser hits `/` → see hero title "ROOT
FURTHER", the countdown, 6 award cards, and the Sun\* Kudos promo block all
rendered. Header shows the user's avatar.

**Acceptance Scenarios**

1. **Given** an authenticated session, **when** the user navigates to `/`,
   **then** the Homepage renders within LCP ≤ 2.5 s with:
   - Header showing SAA logo, 3 nav links (About SAA 2025 **selected**, Award
     Information, Sun\* Kudos), bell, language toggle, profile icon
   - Hero with "ROOT FURTHER" brand artwork (the `root-further.png` asset,
     not live text), "Comming soon" subtitle (sic — Figma typo, see Open
     Questions), live countdown, event info, 2 CTAs
   - "Root Further" description card
   - "Hệ thống giải thưởng" section header + 6 award cards in a grid
   - Sun\* Kudos promo block
   - Footer with logo + 4 nav links + copyright
   - Floating Widget Button (FAB) at bottom-right

2. **Given** no active session, **when** the user navigates to `/`,
   **then** they are redirected to `/login` (enforced server-side by
   `createServerClient().auth.getUser()`).

---

### User Story 2 — Countdown to event start (Priority: P1)

**As a** visitor to the Homepage,
**I want to** see an accurate countdown to the event start,
**So that** I know exactly when SAA 2025 begins.

**Why this priority**: Countdown is the most visually prominent element; if
it's wrong or missing, credibility of the whole page drops.

**Independent Test**: Set `NEXT_PUBLIC_EVENT_START_AT=<future-ISO-date>`; load
page; countdown shows correct DD/HH/MM values; wait 1 minute; minute digit
decrements.

**Acceptance Scenarios**

1. **Given** `NEXT_PUBLIC_EVENT_START_AT` is a future date, **when** the page
   mounts, **then** the 3 tiles display remaining `days`, `hours`,
   `minutes` — each a 2-digit zero-padded number (e.g. `02 · 18 · 45`).

2. **Given** the countdown is running, **when** one minute elapses, **then**
   the minutes tile re-renders with the new value (client-side tick every 60
   seconds). Hours and days roll over correctly at minute 00 / hour 00.

3. **Given** the event start time has passed (countdown = 0), **when** the
   page renders, **then** all three tiles show `00`, the "Coming soon"
   subtitle is hidden, and no negative countdown is shown (stays at zero).

4. **Given** `NEXT_PUBLIC_EVENT_START_AT` is missing or malformed, **when**
   the page loads, **then** the Countdown component renders a graceful
   fallback (e.g. "Event details coming soon") and logs the error
   server-side — does not crash the page.

---

### User Story 3 — Navigate to an award category (Priority: P1)

**As a** Sun\* employee curious about a specific award,
**I want to** click any award card (image, title, or "Chi tiết") on the
Homepage,
**So that** the Awards Information page opens pre-scrolled to the matching
category.

**Why this priority**: The primary browse path for the event. Without this,
the Homepage is decorative-only.

**Independent Test**: Click "Top Talent" card → land on `/awards#top-talent`;
verify the Top Talent section is at the viewport top (scroll-anchor behavior).

**Acceptance Scenarios**

1. **Given** the Homepage is rendered, **when** the user clicks any of the 6
   award card surfaces (image, title, or "Chi tiết →"), **then** the browser
   navigates to `/awards#<slug>` where `<slug>` is the canonical category
   slug (`top-talent`, `top-project`, `top-project-leader`, `best-manager`,
   `signature-2025-creator`, `mvp`).

2. **Given** the Awards page exists with matching anchor IDs, **when** the
   browser arrives at `/awards#top-talent`, **then** the corresponding
   section scrolls into view at the top.

3. **Given** the Awards page doesn't exist yet (current MVP state), **when**
   the user clicks a card, **then** they land on a temporary placeholder
   page (`/awards/page.tsx` stub) that shows "Awards content coming soon" and
   includes the correct hash in the URL. The stub can display which category
   was requested.

---

### User Story 4 — Navigate to Sun\* Kudos / About / Awards via header or hero CTA (Priority: P1)

**As a** Homepage visitor,
**I want to** click the "ABOUT AWARDS" / "ABOUT KUDOS" hero CTAs and the 3
header nav links,
**So that** I can jump to the respective sections.

**Why this priority**: Primary navigation. Integrates Header + Hero CTAs into
one coherent experience.

**Acceptance Scenarios**

1. **Given** the Homepage is rendered, **when** the user clicks "ABOUT
   AWARDS" (hero CTA), **then** navigate to `/awards`.

2. **Given** the Homepage is rendered, **when** the user clicks "ABOUT KUDOS"
   (hero CTA), **then** navigate to `/kudos`.

3. **Given** the user is on `/` (Homepage), **when** they click the header's
   "About SAA 2025" link, **then** the page **scrolls smoothly to the top**
   (already on the correct route — no navigation needed). The link is in
   "selected" state (yellow + underlined) while on this route.

4. **Given** any header link (other than the selected one), **when** the user
   hovers, **then** the link enters the hover state (subtle highlight).

5. **Given** any header link gets keyboard focus, **when** the user presses
   Enter/Space, **then** navigation / scroll-to-top fires identically to a
   click.

---

### User Story 5 — Language toggle works on Homepage too (Priority: P2)

**As a** Homepage visitor,
**I want to** toggle VI ↔ EN using the header language control (same as
Login's toggle),
**So that** the Homepage copy flips without losing my session.

**Why this priority**: Language switching already works on Login (US3). This
is just the same component reused on Homepage — verify the pattern scales.

**Acceptance Scenarios**

1. **Given** Homepage is loaded in VI (default), **when** the user selects
   EN from the language dropdown, **then** the page re-renders with EN copy:
   - Hero subtitle "Comming soon" / "Coming soon" — stays English-leaning
     (already English in Figma)
   - Countdown labels "DAYS / HOURS / MINUTES" — unchanged (uppercase, no
     localization needed)
   - Event info: `Thời gian: 26/12/2025` → `Time: December 26, 2025`
   - Event venue: `Địa điểm: Âu Cơ Art Center` → `Location: Âu Cơ Art Center`
     (proper noun stays Vietnamese — see Open Q3)
   - Live-stream note: `Tường thuật trực tiếp qua sóng Livestream` → `Live
     streamed`
   - "Hệ thống giải thưởng" → "Award system"
   - Award card descriptions — translated
   - Sun\* Kudos promo — translated
   - Footer copyright: `Bản quyền thuộc về Sun* © 2025` → `© 2025 Sun\* All
     rights reserved.` (same pattern as Login)

2. **Given** the page is EN, **when** the user reloads, **then** EN persists
   (cookie `NEXT_LOCALE=en`).

---

### User Story 6 — Notification bell shows unread count (Priority: P2)

**As a** Sun\* employee with unread notifications,
**I want to** see a badge on the bell icon showing the unread count,
**So that** I know someone interacted with me.

**Why this priority**: Not blocking MVP but expected as part of the
authenticated shell. Badge can be zero-count at launch.

**Acceptance Scenarios**

1. **Given** the user has `N > 0` unread notifications, **when** Homepage
   renders, **then** the bell icon displays a red badge with `N` (capped at
   "99+" when `N ≥ 100`).
2. **Given** the user has zero unread notifications, **when** Homepage
   renders, **then** the bell shows no badge.
3. **Given** the user clicks the bell, **then** navigate to `/notifications`
   (full notification list — separate spec for that screen).

---

### User Story 7 — Widget Button (FAB) opens quick actions (Priority: P3)

**As a** Homepage visitor,
**I want to** click the floating cream pill at bottom-right,
**So that** I can start composing a kudo without leaving the page.

**Why this priority**: Nice-to-have shortcut. Actual actions list is driven
by a separate Figma frame (`_hphd32jN2` / `Sv7DFwBw1h`). This spec only needs
the FAB to render and open a placeholder menu.

**Acceptance Scenarios**

1. **Given** the Homepage is rendered, **when** the user scrolls, **then**
   the Widget Button remains fixed at `bottom-right`, above scrolling
   content.
2. **Given** the user clicks the Widget Button, **then** a quick-actions
   popover opens anchored to the button. For this spec's MVP, the popover
   renders a single placeholder "Viết Kudo →" link that navigates to
   `/kudos/new`. Full menu items come from the `Floating Action Button`
   Figma spec.

---

### Edge Cases

- **Images still loading**: hero background + 6 award thumbnails + Kudos
  illustration — use `next/image` with blur placeholders to avoid layout
  shift. Award grid MUST reserve its final dimensions via `aspect-[1/1]` on
  image slots.
- **User hits `/` before session cookie is set** (race between callback 302
  and Homepage render): middleware should have refreshed the session already;
  if not, `getUser()` returns null → redirect to `/login`. No infinite loop
  because `/login` itself redirects to `/` only when session IS present.
- **Countdown clock skew**: client clock may differ from server's. Calculate
  remaining time as `eventStartAt - new Date()` client-side on mount, but
  also do a server-side render so the first paint shows the right number
  (compute from server time, pass as initial state to the client component).
- **Event is in the past** (`eventStartAt - now() ≤ 0`): Hide "Comming
  soon" / "Coming soon" subtitle; hold all three tiles at `00`; do not show
  negative values. If event has ended (for example, 1 day past event
  timestamp), consider showing a post-event state — but deferred until
  Product decides (Open Q4).
- **Tab backgrounded for hours**: when the tab returns to foreground after
  hours, the minute tick will have drifted. On `visibilitychange → visible`,
  immediately recompute and render the current value before resuming the
  60-s interval.
- **User's role is admin**: profile dropdown MUST include an extra **"Admin
  Dashboard"** item pointing to `/admin`. Role is read server-side from
  `auth.users.app_metadata.role === "admin"` and passed as a prop to the
  profile menu.
- **User's locale is neither VI nor EN**: default to VI (constitution
  i18n rule).
- **User arrives via `/?next=/kudos/123`** (carry-over from login's next
  param): Homepage ignores `next` — only `/auth/callback` honours it. If the
  user wants to go somewhere else, they should navigate from Homepage.
- **Reduced motion**: hero fade-in, award card hover lift, CTA transitions —
  all gated on `motion-safe:` Tailwind variant.
- **Slow 4G**: defer award thumbnail + Kudos illustration loads; only hero +
  "Root Further" PNG is `priority`.
- **Digital Numbers font fails to load**: countdown falls back to system
  monospace (`Courier New`) with `tabular-nums`. Acceptable for MVP.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

All dimensions, colors, typography, spacing, and per-node CSS live in
**[design-style.md](design-style.md)**. This table is the behavioral view.

| Component | Node ID | Description | Interactions |
|-----------|---------|-------------|--------------|
| Page frame | `2167:9026` | Full-bleed dark page, 1512×4480 | scroll container |
| Hero Keyvisual BG | `2167:9028` | Full-bleed background artwork behind hero | display only |
| Cover gradient | `2167:9029` | Readability gradient over hero | display only |
| A1 Header | `2167:9091` | Top nav — logo + 3 links + bell + language + profile | each element is clickable |
| A1.1 Logo | `I2167:9091;178:1033` | SAA logo, returns to `/` top | click / keyboard |
| A1.2–A1.5 Nav links | 3 nav instances | "About SAA 2025" (selected) / "Award Information" / "Sun\* Kudos" | click → route or scroll-to-top; states: normal / hover / selected / focus-visible |
| A1.6 Notification bell | `I2167:9091;186:2101` | Bell + unread badge | click → `/notifications` |
| A1.7 Language toggle | `I2167:9091;186:1696` | Current-locale label + chevron — reuses Login's component | click → language dropdown |
| A1.8 Profile button | `I2167:9091;186:1597` | Avatar → dropdown-profile (Figma `721:5223`) | click → dropdown |
| Hero title "ROOT FURTHER" | inside Frame 482 | Large display text | display only |
| Hero subtitle "Coming soon" | B1.2 (`2167:9036`) | Small label above countdown | display only; hidden when countdown = 0 |
| B1.3 Countdown | `2167:9037` | 3-tile DD/HH/MM | auto-tick every 60 s; zero-padded |
| B1.3.1/2/3 Tiles | `2167:9038` / `9043` / `9048` | Individual count tiles | display only |
| B2 Event info | `2167:9053` | Time (`Thời gian: 26/12/2025`) + location (`Địa điểm: Âu Cơ Art Center`) + livestream note | display only |
| B3 CTA row | `2167:9062` | 2 CTAs | click navigate |
| B3.1 ABOUT AWARDS | `2167:9063` | Cream primary CTA | click → `/awards` |
| B3.2 ABOUT KUDOS | `2167:9064` | Outlined cream CTA | click → `/kudos` |
| B4 Root Further description | `5001:14827` + `3204:10152` | Dark card with "ROOT FURTHER" title + body copy | display only |
| C1 Section header | `2167:9069` | caption + title + description | display only |
| C2 Award grid | `5005:14974` | 6 cards in 3×2 grid (desktop) | each card clickable |
| C2.1–C2.6 Award cards | 6 cards | Image + title + desc + "Chi tiết" | card click → `/awards#<slug>` |
| D1 Sun\* Kudos promo | `3390:10349` | Left text + right illustration + CTA | CTA click → `/kudos` |
| 7 Footer | `5001:14800` | Logo + 4 links + copyright | each link navigates |
| 6 Widget Button | `5022:15169` | Floating FAB, bottom-right fixed | click → quick-actions popover |

### Navigation Flow

- **From**: `/login` (after OAuth success), direct URL `/`, click on SAA logo
  from anywhere.
- **To**:
  - `/awards` via hero CTA "ABOUT AWARDS" or header link or award card (with
    `#<slug>` hash)
  - `/kudos` via hero CTA "ABOUT KUDOS" or header link or Sun\* Kudos promo
    CTA or FAB's quick action
  - `/profile` via profile dropdown
  - `/notifications` via bell click
  - Language dropdown overlay (stays on Homepage, just writes cookie +
    revalidates)

### Visual Requirements

- Responsive: mobile (<640) / tablet (640–1023) / desktop (≥1024). See
  [design-style.md → Responsive Specifications](design-style.md).
- Animations respect `prefers-reduced-motion` (Tailwind `motion-safe:`).
- Accessibility WCAG 2.2 AA (constitution Principle II).
- All interactive elements have ≥44×44 px touch targets.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `/` route MUST be a Server Component that calls
  `createServerClient().auth.getUser()`; if no session, redirect to
  `/login`.
- **FR-002**: The page MUST read the event start time from
  `NEXT_PUBLIC_EVENT_START_AT` (ISO 8601 UTC) and pass it to the Countdown
  client component. Figma indicates the event date is **2025-12-26** (value
  `26/12/2025` in the event info block) — so a sensible default is
  `NEXT_PUBLIC_EVENT_START_AT=2025-12-26T11:30:00Z` (confirm actual kick-off
  time with Product — the Figma doesn't specify a time-of-day). When the env
  var is missing or malformed, render a graceful fallback.
- **FR-003**: The Countdown component MUST compute remaining time using
  `eventStartAt - Date.now()` on mount, update every 60 000 ms, and stop
  updating when remaining ≤ 0 (hold digits at "00", hide "Coming soon").
- **FR-004**: Clicking any award card, its image, title, or "Chi tiết →"
  link MUST navigate to `/awards#<slug>` where `<slug>` is from a frozen
  slug map (`top-talent`, `top-project`, `top-project-leader`,
  `best-manager`, `signature-2025-creator`, `mvp`).
- **FR-005**: Clicking the header's "About SAA 2025" link while already on
  `/` MUST smooth-scroll to the top of the page (no navigation). Other
  links MUST navigate to their targets via `next/link`.
- **FR-006**: Clicking the hero CTA "ABOUT AWARDS" navigates to `/awards`;
  "ABOUT KUDOS" navigates to `/kudos`.
- **FR-007**: Clicking the bell navigates to `/notifications`. When unread
  count > 0, display a red badge with the number (capped at "99+").
- **FR-008**: Clicking the profile icon opens a profile dropdown with
  options `Profile` (→ `/profile`), `Sign out` (Server Action calling
  `supabase.auth.signOut()` then redirecting to `/login`), and **only when
  `auth.users.app_metadata.role === "admin"`** a third item `Admin
  Dashboard` (→ `/admin`). The role MUST be resolved server-side in the
  Homepage Server Component and passed as a prop to the client-island
  profile menu. This spec requires the trigger + logout action; full
  dropdown visual contents come from its own Figma frame (`721:5223`
  Dropdown-profile, `54rekaCHG1` Dropdown-profile Admin).
- **FR-009**: The Widget Button MUST be position-fixed at `bottom-right`,
  remain visible during scroll, and render above the page content
  (`z-index: 50`).
- **FR-010**: All user-visible strings MUST be loaded from the i18n message
  catalog (VI + EN) — no hardcoded JSX strings.
- **FR-011**: The page MUST render all 6 award cards with correct images,
  titles, and descriptions from a frozen data source (`src/data/awards.ts`
  — no backend call for MVP).
- **FR-012**: The Sun\* Kudos promo "Chi tiết →" CTA navigates to `/kudos`.
- **FR-013**: The footer's 4 nav links navigate to their respective routes:
  "About SAA 2025" → `/`, "Award Information" → `/awards`, "Sun\* Kudos"
  → `/kudos`, "Tiêu chuẩn chung" → `/standards`.
- **FR-014**: Clicking the SAA logo (in either header or footer) while on
  Homepage MUST smooth-scroll to the top of the page (matches FR-005 nav
  behavior). From other routes, logo click navigates to `/`.
- **FR-015**: The `A1_Header` MUST behave as **`position: sticky`** on
  scroll (remain pinned to top) — not `absolute` as Login uses. Homepage is
  4480 px tall and users expect persistent nav access. CSS:
  `position: sticky; top: 0; z-index: 40;` on the header wrapper.
- **FR-016**: If `supabase.auth.getUser()` throws (network error to
  Supabase, not just "no session"), the Homepage Server Component MUST
  render a minimal error page with a "Try again" link — it MUST NOT crash
  the route. The middleware should have already attempted session refresh
  and would have caught most failures; this is defense-in-depth.

### Technical Requirements

- **TR-001** (Performance): LCP ≤ 2.5 s on slow-4G mobile (Lighthouse). Hero
  image + "Root Further" PNG marked `priority`; award thumbnails lazy.
- **TR-002** (Server-first): Only Countdown, LanguageToggle, NotificationBell,
  ProfileMenu, QuickActionsFab (and any nav link needing active-route
  detection via `usePathname`) opt into `"use client"`. Everything else is a
  Server Component.
- **TR-003** (Bundle): Homepage client bundle ≤ 40 KB gzipped (5 small client
  islands). Measured via `scripts/check-bundle-size.mjs`.
- **TR-004** (Images): All `<img>` go through `next/image` with explicit
  `sizes` props; SVG icons via the `<Icon />` component (no inline `<svg>`).
- **TR-005** (Security): Profile dropdown's "Sign out" action MUST call
  `supabase.auth.signOut()` server-side (via a Server Action), then redirect
  to `/login`.
- **TR-006** (Accessibility): WCAG 2.2 AA. Each nav link has an `aria-current`
  or equivalent to indicate the active route. The countdown updates an
  `aria-live="polite"` region so screen readers catch minute changes.
- **TR-007** (i18n): Strings from `src/messages/vi.json` and
  `src/messages/en.json`; no JSX-hardcoded text.
- **TR-008** (Workers runtime): Homepage page + Countdown SSR compatible
  with Cloudflare Workers. No Node built-ins.
- **TR-009** (Keyboard nav): Tab order: logo → 3 nav links → bell → language
  → profile → hero CTA 1 → hero CTA 2 → award cards (6) → Kudos promo CTA
  → footer links → FAB. Skip-to-main-content link at very top.

### Key Entities *(from data sources)*

This page **reads** from the following, but doesn't mutate any:

- **Supabase `auth.users`** — current user's id, email, `user_metadata.avatar_url`,
  `user_metadata.full_name`, `app_metadata.role`.
- **(future) `public.user_profiles`** — avatar URL, display name, role flag.
  If missing, fall back to Google profile picture from `auth.users`.
- **(future) `public.notifications`** — unread count via
  `SELECT count(*) FROM notifications WHERE user_id = auth.uid() AND read_at
  IS NULL`. For MVP, can hardcode 0 or expose a mock count.

---

## i18n Message Keys

Add to [src/messages/vi.json](../../../src/messages/vi.json) + `en.json`
(extending the Login catalog):

| Key | VI | EN (draft) | Used by |
|-----|-----|-----|---------|
| `homepage.hero.title` | *(image — `/images/root-further.png`)* | *(same image)* | Hero big title renders as PNG, not text |
| `homepage.hero.comingSoon` | `Comming soon` *(sic — Figma typo; change to `Coming soon` if design confirms)* | `Coming soon` | Hero subtitle |
| `homepage.countdown.days` | `DAYS` | `DAYS` | Tile label |
| `homepage.countdown.hours` | `HOURS` | `HOURS` | Tile label |
| `homepage.countdown.minutes` | `MINUTES` | `MINUTES` | Tile label |
| `homepage.event.timeLabel` | `Thời gian:` | `Time:` | Event info label |
| `homepage.event.timeValue` | `26/12/2025` | `December 26, 2025` | Event date (value shown in cream) |
| `homepage.event.locationLabel` | `Địa điểm:` | `Location:` | Event info label |
| `homepage.event.locationValue` | `Âu Cơ Art Center` | `Âu Cơ Art Center` | Event venue (value shown in cream) |
| `homepage.event.streamNote` | `Tường thuật trực tiếp qua sóng Livestream` | `Live streamed` | Hero small note below event info |
| `homepage.cta.aboutAwards` | `ABOUT AWARDS` | `ABOUT AWARDS` | Hero CTA 1 |
| `homepage.cta.aboutKudos` | `ABOUT KUDOS` | `ABOUT KUDOS` | Hero CTA 2 |
| `homepage.rootFurther.title` | `Root Further` | `Root Further` | Section title |
| `homepage.rootFurther.body` | (long paragraph — confirm with copy team) | (translated) | B4 content |
| `homepage.awards.caption` | `Sun* annual awards 2025` | `Sun* annual awards 2025` | C1 caption |
| `homepage.awards.title` | `Hệ thống giải thưởng` | `Award system` | C1 title |
| `homepage.awards.description` | `Các hạng mục sẽ được trao giải theo TOP những người xuất sắc nhất.` | `Categories are awarded based on the TOP-ranked outstanding individuals.` | C1 description |
| `homepage.awards.topTalent.title` | `Top Talent` | `Top Talent` | Card 1 |
| `homepage.awards.topTalent.desc` | `Vinh danh top cá nhân xuất sắc trên mọi phương diện` | `Celebrating top individuals excelling across every dimension` | Card 1 desc |
| (…repeat for all 6 cards…) | — | — | — |
| `homepage.awards.detailLink` | `Chi tiết` | `Details` | Card CTA label |
| `homepage.kudos.caption` | `Phong trào ghi nhận` | `Recognition campaign` | Sun\* Kudos caption |
| `homepage.kudos.title` | `Sun* Kudos` | `Sun* Kudos` | Sun\* Kudos block title |
| `homepage.kudos.description` | (from design — TBD) | (translated) | Sun\* Kudos body |
| `homepage.kudos.detail` | `Chi tiết` | `Details` | Sun\* Kudos CTA |
| `common.nav.aboutSaa` | `About SAA 2025` | `About SAA 2025` | Header + footer nav |
| `common.nav.awardsInfo` | `Award Information` | `Award Information` | Header + footer nav (**singular** per Figma) |
| `common.nav.sunKudos` | `Sun* Kudos` | `Sun* Kudos` | Header + footer nav |
| `common.nav.standards` | `Tiêu chuẩn chung` | `Community standards` | Footer nav (not "Tiêu chuẩn cộng đồng") |
| `common.notification.unread` | `{count} thông báo chưa đọc` | `{count} unread notifications` | Bell `aria-label` |
| `common.profile.open` | `Mở menu tài khoản` | `Open account menu` | Profile button `aria-label` |
| `common.widget.openMenu` | `Mở menu nhanh` | `Open quick actions` | FAB `aria-label` |

Full body copy (Root Further description, Sun\* Kudos description, card
descriptions 2–6) needs confirmation from Product / design team before EN
translation.

---

## API Dependencies *(predicted)*

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `supabase.auth.getUser()` (SSR) | GET | Session check — redirects to /login if absent | Existing |
| `supabase.auth.signOut()` (Server Action) | POST | Logout from profile dropdown | **New** — sign-out action |
| Notification unread count — `GET notifications/count` via Supabase query | GET | Header badge | **New** — depends on `notifications` table (future) |
| User profile — `GET user_profiles/me` | GET | Avatar/name in profile button | **New** — depends on `user_profiles` (future) |

For MVP, the last two can be **mocked** (unread = 0, profile from
`auth.users.raw_user_meta_data.avatar_url`) and replaced later.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (functional)**: 100% of authenticated users can land on `/` and
  see all 6 award cards in UAT.
- **SC-002 (performance)**: LCP ≤ 2.5 s on slow-4G mobile Lighthouse;
  CLS ≤ 0.1; TTI ≤ 3.5 s.
- **SC-003 (a11y)**: Lighthouse accessibility score ≥ 95; axe-core reports
  zero serious/critical violations at mobile + desktop viewports.
- **SC-004 (navigation)**: clicking any award card reaches `/awards#<slug>`
  in < 300 ms (measured as click-to-paint of target page).
- **SC-005 (countdown accuracy)**: countdown minutes tile increments within
  ±2 s of real minute boundary when page is foregrounded.
- **SC-006 (security)**: zero server secrets in the client bundle (inherited
  CI gate).

---

## State Management

### Local state (client components)

| State | Owned by | Type | Initial | Purpose |
|-------|----------|------|---------|---------|
| `remainingMs` | `<Countdown />` | `number` | computed from SSR-provided `eventStartAt` | Ticks every 60 s |
| `unreadCount` | `<NotificationBell />` | `number` | derived from prop | Badge display |
| `isProfileOpen` | `<ProfileMenu />` | boolean | `false` | Dropdown open state |
| `isLanguageOpen` | `<LanguageToggle />` | boolean | `false` | Reused from Login |
| `isFabOpen` | `<QuickActionsFab />` | boolean | `false` | FAB menu open state |

### Global state

No client-side store introduced. All server state via Server Components.

### Cache

- Homepage page is **dynamic** (session check on every request) — served
  with `Cache-Control: no-store`.
- Award card images, Kudos illustration: `Cache-Control: public, max-age=
  31536000, immutable`.

---

## Out of Scope

- Actual `/awards` and `/kudos` pages — separate specs. This spec delivers a
  minimal placeholder at each route so links don't 404.
- Notification list / panel (`/notifications`) — separate spec.
- Profile page (`/profile`) — separate spec.
- Admin Dashboard — separate spec.
- Sun\* Kudos live board, compose, view — separate specs.
- Full Widget Button (FAB) quick-actions menu — separate Figma spec
  (`_hphd32jN2`, `Sv7DFwBw1h`). MVP ships only 1 item (Viết Kudo →
  `/kudos/new`).
- Community standards page (`/standards`) — placeholder only.
- The Sun* Kudos promo copy is partially from design only — get full copy
  from Product before shipping.

---

## Dependencies

- [x] Constitution ([.momorph/constitution.md](../../constitution.md))
- [x] Login screen implemented ([spec](../GzbNeVGJHz-login/spec.md)) — Homepage
      is Login's redirect target.
- [x] [design-style.md](design-style.md) (sibling).
- [x] SCREENFLOW lists Homepage
      ([SCREENFLOW.md](../../contexts/screen_specs/SCREENFLOW.md)).
- [ ] `NEXT_PUBLIC_EVENT_START_AT` env var added to `.env.example` +
      `.env.local`.
- [ ] `src/data/awards.ts` — frozen list of 6 award categories with id, slug,
      title key, description key, image path.
- [ ] Placeholder routes: `/awards`, `/kudos`, `/notifications`, `/profile`,
      `/standards` — minimal stubs so header/footer/hero/card links don't
      404.
- [ ] Dropdown-profile Figma frame (`721:5223`) — needs its own spec for the
      profile menu contents.
- [ ] 6 award thumbnail images + Kudos illustration exported from Figma
      (download via `get_media_files` at implementation time; fallback: user
      exports manually like login-bg.jpg).

---

## Notes

- **Homepage vs. Login shell overlap**: `SiteHeader` (Login) has only logo +
  language toggle. Homepage's Header needs 3 nav links + bell + profile. Plan:
  evolve `<SiteHeader />` to take an optional `navItems` prop + slot for
  right-side actions. Keep the Login usage working by defaulting to empty nav.
- **Footer divergence**: Login footer = copyright only. Homepage footer adds
  logo + 4 nav links. Evolve `<SiteFooter />` same way — optional nav prop.
- **"Tiêu chuẩn chung" link in footer**: the slug string in the Figma node is
  "Tiêu chuẩn chung" but SCREENFLOW / spec refers to it as "Tiêu chuẩn cộng
  đồng" (community standards). Confirm with design which is canonical.
- **Figma typo**: Footer description on Homepage frame says *"Bản quyền thuộc
  vè Sun\* © 2025"* (lowercase `vè`, typo) — same bug as Login. The visible
  string is correct (`về`). Use the visible string in i18n catalog.
- **"Tường thuật trực tiếp" note**: this is a live-stream note — might shift
  content based on whether the event is pre-, during, or post-launch. Consider
  making it a state-driven piece of copy controlled by `NEXT_PUBLIC_EVENT_
  START_AT`.

---

## Open Questions *(for Product / Design)*

**Business logic**

- Q1. Are the 6 award categories finalised, or will they change between now
  and event day? Affects whether `src/data/awards.ts` is static or backed by
  a CMS.
- Q2. What are the canonical slugs? My draft: `top-talent`, `top-project`,
  `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`. Please
  confirm.
- Q3. Figma shows event **date = 26/12/2025** and **venue = Âu Cơ Art
  Center**. Confirm:
  - Exact kick-off time-of-day (Figma omits it)
  - Time-zone (defaulting to Asia/Ho_Chi_Minh = UTC+7 until told otherwise)
  - Whether the venue name should be translated in EN or kept as the
    Vietnamese proper noun
- Q4. When the event is over, what does Homepage show? Replace the countdown
  with a "Thank you" block? Announce winners? Redirect?
- Q5. Full body copy for Root Further block + Sun\* Kudos block (both
  locales).

**Design / visual**

- Q6. Widget Button — what's in its quick-actions menu beyond "Viết Kudo"?
  Full Figma spec is in a separate frame.
- Q7. Root Further card has a vertical "2025" decoration on the right — is
  it a rotated SVG text, a PNG, or purely CSS?
- Q8. Award cards — exact typography sizes for title + description + "Chi
  tiết" link? (Currently derived.)
- Q9. Nav link hover treatment — underline, color swap, or both?

**Design — text content**

- Q12. "Comming soon" (sic — two `m`s) in the Figma subtitle. Typo? Confirmed
  intentional? The `login.hero` area uses "Đăng nhập để khám phá!" so the
  typo seems accidental. Assume **"Coming soon"** and correct in ship unless
  design confirms otherwise.
- Q13. Award card titles render in **Montserrat Regular 400** (not Bold).
  Unusual — verify intent (maybe a stylistic choice for elegance, or
  intentional to let the glowing photo card be the hero and title be
  secondary).

**Technical**

- Q10. Notification + profile data sources — fake for MVP, or wire real
  Supabase queries now? If real, need `notifications` + `user_profiles`
  tables first.
- Q11. Awards page (`/awards`) — is it one page with 6 anchor sections (what
  hash-scroll implies), or 6 separate pages with a `/awards` index? Determines
  whether card clicks go to `/awards#top-talent` or `/awards/top-talent`.
- Q14. **Digital Numbers** font — licensing + source:
  - Is there a Sun* account with Monotype / MyFonts / Adobe Fonts that we
    can self-host `digital-numbers.woff2`?
  - If no license is available, fall back to `Courier New, monospace` with
    `font-variant-numeric: tabular-nums` — still readable but loses the
    "digital clock" aesthetic.
