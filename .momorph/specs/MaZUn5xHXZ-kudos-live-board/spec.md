# Feature Specification: Sun\* Kudos – Live Board (Bảng Kudos trực tiếp)

**Frame ID**: `MaZUn5xHXZ` (Figma node `2940:13431`)
**Frame Name**: `Sun* Kudos – Live board`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**MoMorph URL**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**Created**: 2026-04-20
**Status**: Draft
**Target Route**: `/kudos`

---

## Overview

The **Sun\* Kudos – Live board** is the real-time feed that turns SAA 2025 into a visible movement. It is the single page where every Sunner can (a) see the newest "lời cảm ơn" (kudos) across the company, (b) scan the top hearted cards in the HIGHLIGHT KUDOS carousel, (c) explore the full spotlight word-cloud of everyone who has received recognition this season, (d) filter the feed by hashtag or by Phòng ban (department), and (e) heart a kudo they love. It is the **social heart of SAA 2025** — linked from the Homepage Kudos promo (`/` → Chi tiết → `/kudos`), from the header nav "Sun\* Kudos", and from the floating "Viết Kudo" FAB.

The layout has **three vertical slabs** inside a single `1440 × 5862` page:

1. **A — KV Kudos hero** (`2940:13437`): title "Hệ thống ghi nhận lời cảm ơn" + the big "KUDOS" logo artwork, followed by the **A.1 Ghi nhận pill** (the composer entry — "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?") and a secondary "Tìm kiếm sunner" input.
2. **B — Highlight section** (`2940:13451`): heading "HIGHLIGHT KUDOS" (cream 57/64) + a hashtag filter chip + a department filter chip + a 5-card carousel of the most-hearted kudos + prev/next arrow pager "2/5". Below it sits **B.7 SPOTLIGHT BOARD** (`2940:14174`) — a pan/zoom word-cloud of 388+ Sunner names on a cinematic cream panel with a sunner-search bar.
3. **C + D — All Kudos feed + right sidebar** (`2940:13475`): a 2-column body with:
   - **C** (`2940:13482`): vertical list of large cream-coloured KUDO post cards (680×~750 each), showing sender → recipient row, body, attached images, hashtags, heart button, and Copy Link.
   - **D** (`2940:13488`): sticky right sidebar with **D.1 personal stats** (Kudos received / sent / hearts / Secret Boxes opened / unopened) + a "Mở quà" CTA, and **D.3 10 SUNNER NHẬN QUÀ MỚI NHẤT** (vertical list of the 10 most recent gift recipients).

All user-facing numbers (total kudos in header "388 KUDOS", hearts count, stats in D.1) are **live**. Kudos listing and highlight carousel are **paginated**; the spotlight board is a single-page 2-D word-cloud (pan/zoom). Every action that mutates state (heart toggle, opening a secret box) is optimistic.

**Target users**: Every authenticated Sunner — recognition is universal across all departments and job levels.

**Business context**: The Live board converts kudos from private moments into **public signal**. Visibility drives participation; participation drives the awards the Homepage promises. Without this screen, the "Kudos" pillar of SAA 2025 is invisible.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Browse the live kudos feed (Priority: P1)

An authenticated Sunner opens `/kudos` and scrolls through the **All Kudos feed** (`2940:13482`). Each card shows who sent what to whom, when, the body, any attached photos, hashtags, and the number of hearts. This is the single most important journey: even if **nothing else worked** — no filters, no carousel, no spotlight, no heart button — the feed alone delivers the value of the Live board.

**Why this priority**: The whole event's "recognition is visible" promise collapses if users can't just arrive and see kudos. Every other interaction on this page is an enhancement of this core read.

**Independent Test**: A signed-in user opens `/kudos`, sees the hero + A.1 composer pill, scrolls past the HIGHLIGHT carousel and Spotlight, and reaches a vertical list of at least 4 KUDO post cards (`3127:21871` variants `C.3`, `C.5`, `C.6`, `C.7`). Each card renders sender, recipient, timestamp `HH:mm - MM/DD/YYYY`, body (≤ 5 lines), attached images thumbnail row (if any, max 5), hashtags (max 5 on one line), heart count, and Copy Link.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and `/kudos` has not been filtered, **When** the page loads, **Then** the server returns the first page of kudos (default page size = 10, newest first) and renders the 4 variant cards from Figma first (for visual parity) followed by any additional items.
2. **Given** the page has rendered, **When** the user scrolls to the bottom of the current page of cards, **Then** the feed either (a) auto-fetches the next page via IntersectionObserver (infinite scroll) **or** (b) reveals a "Load more" button — see Open Question Q1 for decision.
3. **Given** a card shows a body longer than 5 lines, **When** it renders, **Then** the excess text is truncated with an ellipsis and clicking anywhere on the card body area navigates to the Kudo detail view (route parked, see FR-012).
4. **Given** a card has attached images, **When** the card renders, **Then** up to 5 thumbnails are laid out in a single horizontal row (88×88 each, 16px gap, left-aligned); any 6th+ image is hidden from the thumbnail row (deep-link to detail view shows the rest — see Open Question Q2).
5. **Given** there are zero kudos in the system (empty DB), **When** the page loads, **Then** the All Kudos section shows the copy "Hiện tại chưa có Kudos nào." centered in the feed area; the HIGHLIGHT carousel shows the same copy in its slot.
6. **Given** the user has scrolled through every available page of kudos, **When** the next-page fetch returns an empty array (or `has_more: false`), **Then** the IntersectionObserver sentinel disconnects, no further requests fire, and a small end-of-feed marker "Bạn đã xem hết Kudos." renders below the last card (i18n key `kudos.feed.endOfList`).

---

### User Story 2 – React with a heart (Priority: P1)

Users express appreciation **on the Live board itself** — they see a card they like, they tap the heart. The count increments, the icon flips from grey (inactive) to red (active), and on the backend the **sender of that kudo** gains +1 heart on their personal stats (or +2 on admin-configured "special days"). Clicking the heart again unhearts (count −1, visual reset, sender loses 1 or 2 hearts accordingly).

**Why this priority**: The heart is the primary feedback loop of the whole Kudos activity. It is how hearts accumulate into the D.1 stats block, and (per SAA 2025 rules) it influences the "Kudos Quốc Dân" leaderboard. No hearts = no competition = no reason to participate.

**Independent Test**: Log in as user A; open `/kudos`; find a kudo sent by user B (A is **not** the sender); click the heart. The count increments by 1, icon turns red, aria-pressed="true". Click again: count −1, icon grey, aria-pressed="false". Open a second browser as user A (same account): the same kudo shows as already hearted (persistent state). Log in as user B (the sender of that kudo): the heart on their **own** kudo is visible but disabled (aria-disabled="true") because FR-006 forbids self-hearting.

**Acceptance Scenarios**:

1. **Given** user A is viewing a kudo they did NOT send, **When** A clicks the heart (`I3127:21871;256:5175`), **Then** the count optimistically increments by 1, the icon swaps to red `MM_MEDIA_Heart` (active), and a `POST /kudos/:id/hearts` fires with body `{ action: "add" }`.
2. **Given** the POST succeeds, **When** the response arrives, **Then** the UI keeps the optimistic state; the sender's D.1 heart stat increases by 1 (or 2 on a "ngày đặc biệt" flag returned in the response).
3. **Given** the POST fails (network / 500), **When** the error resolves, **Then** the optimistic state is rolled back (count −1, icon grey) and a toast "Không thể thả tim. Vui lòng thử lại." appears for 4 s.
4. **Given** user A has already hearted a kudo, **When** A clicks the heart again, **Then** it fires `POST /kudos/:id/hearts` with `{ action: "remove" }`, the count decrements by 1, and the icon returns to grey.
5. **Given** user A is the sender of the kudo, **When** the heart button renders, **Then** it is disabled (opacity 50 %, `aria-disabled="true"`, cursor `not-allowed`) and clicks are ignored.
6. **Given** the user double-taps/rapid-clicks the heart, **When** the second click fires within 300 ms of the first, **Then** the second click is debounced (ignored) — only one network call per 300 ms window (FR-007).
7. **Given** the user is offline (navigator.onLine === false), **When** they click the heart, **Then** the optimistic state applies locally but a warning toast "Bạn đang offline. Thao tác sẽ đồng bộ khi kết nối lại." appears; the request is queued and retried once the connection returns.

---

### User Story 3 – Filter the feed by hashtag (Priority: P1)

Users scan the stream with intent — "show me only `#Dedicated` kudos" or "only `#Inspiring` ones". The **B.1.1 ButtonHashtag** (`2940:13459`) above the HIGHLIGHT section opens a dropdown (frame `1002:13013` — *Dropdown list hashtag*, a parked frame). Selecting a hashtag refetches both the HIGHLIGHT carousel and the All Kudos feed with `?hashtag=<slug>`. Clicking a hashtag pill **inside** a KUDO card (`I3127:21871;256:5158`) applies the same filter.

**Why this priority**: Filtering is how Sunners find the kudos that resonate with them (or their project). Without it, a 388+ feed becomes unscannable within two weeks of the event. Still P1 because it is part of the Day-1 MVP surface per Figma.

**Independent Test**: Open `/kudos`; click **B.1.1** hashtag filter; select `#Dedicated`. Verify URL changes to `/kudos?hashtag=dedicated`, HIGHLIGHT carousel and All Kudos feed both refetch (loading skeletons appear for ≤ 1 s), and the resulting cards all contain `#Dedicated` in their hashtag row. Clear the filter → all cards return.

**Acceptance Scenarios**:

1. **Given** no filter is active, **When** the user clicks B.1.1 and chooses `#Dedicated`, **Then** the URL updates to `/kudos?hashtag=dedicated` (replaceState, not push), and both the carousel and the feed refetch with the hashtag filter applied.
2. **Given** a hashtag filter is active, **When** the user clicks the same B.1.1 button, **Then** the dropdown opens with `#Dedicated` marked as selected (checkmark / filled state).
3. **Given** a hashtag filter is active, **When** the user clicks a **different** hashtag **inside** a card body (`C.3.7`), **Then** the filter replaces to the new hashtag and the URL updates (FR-008).
4. **Given** a filter returns zero results, **When** the fetch resolves, **Then** the feed area renders the empty state "Hiện tại chưa có Kudos nào." and the carousel area shows the same message.
5. **Given** the user presses browser Back after filtering, **When** the previous URL is `/kudos` (unfiltered), **Then** the filter clears and both feed and carousel refetch the unfiltered first page.

---

### User Story 4 – Filter the feed by Phòng ban (Priority: P1)

Mirror of US3 but for **department** (`2940:13460` → parked dropdown frame `721:5684` — *Dropdown Phòng ban*, tracked on SCREENFLOW row 11). Selecting a department refetches the page with `?department=<slug>`. Hashtag and department filters **can combine** (`/kudos?hashtag=dedicated&department=engineering`).

**Why this priority**: Team leaders want to see "how is my department showing up in Kudos this year". Especially important for the "Best Manager" and "Top Project" award context.

**Independent Test**: Open `/kudos`; click **B.1.2 Button Phòng ban**; select "Engineering". URL becomes `/kudos?department=engineering`. All visible kudos (feed + highlight) feature an Engineering sender or recipient per the API contract. Combine with `#Dedicated`: URL is `/kudos?department=engineering&hashtag=dedicated`; both filters apply.

**Acceptance Scenarios**:

1. **Given** no filter is active, **When** the user selects "Engineering" in B.1.2, **Then** URL becomes `/kudos?department=engineering` and both sections refetch.
2. **Given** both hashtag and department are active, **When** the user clears only the hashtag, **Then** URL becomes `/kudos?department=engineering` (hashtag query-param removed) and a refetch runs.
3. **Given** the `GET /departments` endpoint required to populate B.1.2 is unavailable, **When** the dropdown is opened, **Then** it shows a "Không tải được danh sách Phòng ban" message with a Retry button; the feed remains usable without the filter.

---

### User Story 5 – Open a featured kudo via HIGHLIGHT carousel (Priority: P1)

Above the feed, the **B.2 HIGHLIGHT KUDOS carousel** (`2940:13461`) shows the 5 most-hearted kudos of the whole event. The current card is centered and sharp; the two side cards are dimmed. Prev/next arrows (`B.5.1`, `B.5.3`) step through; **B.5.2 số trang** ("2/5") reflects the position. Each highlight card has the same heart/Copy Link/Xem chi tiết actions as the main feed.

**Why this priority**: The carousel is the editorial "look at what the community did this week" moment — it's what new visitors see first (top of the fold for B). P1 because it's in the MVP Figma and each slide is also a first-class card that must heart/copy-link/navigate reliably.

**Independent Test**: Load `/kudos`; observe the HIGHLIGHT carousel with pager "2/5" (default middle slide active per Figma). Click next arrow → pager becomes "3/5", current slide advances. Click heart on the center card → count updates (same semantics as US2). Click "Xem chi tiết" → navigation is parked (FR-012), an "Đang xây dựng" toast appears.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the carousel mounts, **Then** the API `GET /kudos?sort=hearts&limit=5` returns the top 5 by hearts and the carousel defaults to slide 1 (or slide 3 / center-biased — see Open Question Q3).
2. **Given** the user is on slide 1, **When** they click B.5.1 prev arrow, **Then** the arrow is disabled (Figma shows disabled state at edges) — no action, focus stays.
3. **Given** the user is on slide 5, **When** they click B.5.3 next arrow, **Then** same — disabled, no action.
4. **Given** the user clicks the heart on a highlight card, **When** the optimistic update applies, **Then** both the carousel card and (if the same kudo appears in the feed) the feed card reflect the new count / active state (FR-009 — shared state).
5. **Given** `prefers-reduced-motion: reduce`, **When** arrows are clicked, **Then** the slide transition is instant (no crossfade) and the dimmed side-cards remain static (no "slide in" animation).

---

### User Story 6 – Explore the SPOTLIGHT BOARD word-cloud (Priority: P2)

**B.7 SPOTLIGHT** (`2940:14174`) is a cinematic 1157×548 panel with a warm wooden backdrop rendering the names of every Sunner who has received at least one kudo (the Figma mock shows ~120 name text nodes). The top-left header "388 KUDOS" (`3007:17482`) shows the live total across the system. A small sunner-search (`2940:14833` – *B.7.3*) in the top-right lets users find themselves. The panel supports **pan + zoom** (`3007:17479` – *B.7.2 Pan zoom*): mouse wheel / pinch zooms, drag pans. Hovering a name pops a tooltip "08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới"; clicking opens the kudo detail (parked → toast).

**Why this priority**: This is an emotional, delightful UX but not strictly needed to read/heart/filter kudos. P2 because the implementation effort (pan/zoom, word-cloud layout, live tooltip) is non-trivial relative to its read-only role.

**Independent Test**: Scroll to section B; see SPOTLIGHT. Counter shows current total "X KUDOS" (matches feed count). Hover over "Đỗ hoàng Hiệp" → tooltip appears with the most recent kudo timestamp and message preview. Drag the board — the names translate. Zoom in via wheel / pinch → names scale. Click a name → toast (detail route parked).

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the Spotlight mounts, **Then** `GET /kudos/spotlight` (predicted) returns `{ total: number, recipients: Array<{ name, recent_kudo: {time, preview}, x, y, weight }> }` and renders them with font-size proportional to `weight` (hearts received or kudos count, see Open Question Q4).
2. **Given** the Spotlight is rendered, **When** the user hovers a name, **Then** a tooltip shows within 200 ms containing the name + timestamp + "đã nhận được một Kudos mới" preview line.
3. **Given** there is no data, **When** the API returns `{ total: 0, recipients: [] }`, **Then** the Spotlight shows the empty state "Chưa có ai nhận Kudos" centered in the board.
4. **Given** the user has `prefers-reduced-motion: reduce`, **When** the board mounts, **Then** names render in their default positions (no mount-in animation) and pan/zoom operates without momentum smoothing.
5. **Given** the user types "Hiệp" into the sunner search (B.7.3), **When** they press Enter, **Then** the matching name pulses (subtle scale-up + cream outline) and the board auto-pans to center it.

---

### User Story 7 – Check personal stats & open a secret box (Priority: P2)

On desktop (≥ 1024 px), the right-hand sidebar **D.1 Thống kê tổng quát** (`2940:13489`) shows the user's own numbers: Kudos received, Kudos sent, hearts received, then a divider, then Secret Boxes opened and unopened, and the **D.1.8 Mở quà** CTA (`2940:13497`) that navigates to the parked `Open secret box` frame (`1466:7676`). **D.3 10 SUNNER NHẬN QUÀ MỚI NHẤT** (`2940:13510`) lists the 10 most recent gift recipients with avatar + name + gift description; clicking a name opens their profile (route parked).

**Why this priority**: The stats are a strong "come back tomorrow" hook (gamification), and the secret-box CTA is how the Live board hands off to the gift-reveal flow. P2 because the main read/heart/filter loop works without it.

**Independent Test**: Sign in; open `/kudos`; observe the right sidebar. D.1 shows "Số Kudos bạn nhận được: 25" and similar labels for the 4 other metrics. Click D.1.8 "Mở quà" → navigation to the parked secret-box screen (or toast fallback).

**Acceptance Scenarios**:

1. **Given** the user has session data, **When** the page loads, **Then** `GET /users/me/kudos-stats` (predicted) returns the 5 metrics and renders them in D.1 with the exact Figma labels.
2. **Given** the user has 0 unopened secret boxes, **When** D.1 renders, **Then** the "Mở quà" button is shown in a disabled style with aria-disabled="true" and a tooltip "Bạn chưa có hộp quà nào để mở."
3. **Given** the viewport is < 1024 px, **When** the page renders, **Then** the D sidebar collapses below the feed (stacks full-width) OR is hidden (see Open Question Q5).
4. **Given** D.3 `GET /users/latest-giftees` returns fewer than 10 users, **When** the list renders, **Then** only the returned items show; no skeleton placeholders are left.

---

### User Story 8 – Hand off to Viết Kudo (compose) (Priority: P2)

The **A.1 Button ghi nhận pill** (`2940:13449`) on the hero is the composer entry-point. Clicking opens the Viết Kudo dialog / full-screen form (frame `ihQ26W78P2`, parked, SCREENFLOW row 7). Additionally, the shared **QuickActionsFab** (`src/components/shell/QuickActionsFab.tsx`) already present on all authenticated pages offers a second entry ("Viết Kudo →"). Both routes converge on the same compose flow.

**Why this priority**: Creation volume drives the whole movement; but since the form lives in its own screen and this spec is the Live board, the handoff here is just "click → next screen". P2 because the Live board still delivers read-value without composing.

**Independent Test**: Click A.1 pill → navigation fires to the Viết Kudo route / modal. Click the FAB → same behaviour. Both should use the same navigation helper for telemetry consistency.

**Acceptance Scenarios**:

1. **Given** the user clicks A.1, **When** the click handler fires, **Then** it navigates to `/kudos/new` (or opens a modal — decision parked with Viết Kudo spec) and emits `track({ type: "compose_open", source: "liveboard_pill" })`.
2. **Given** the user clicks the FAB's "Viết Kudo" action, **When** navigation fires, **Then** it emits `track({ type: "compose_open", source: "fab" })` so Product can A/B the entry point.
3. **Given** the user returns from the compose flow after posting, **When** they re-enter `/kudos`, **Then** the feed refetches (newest-first sorts the just-posted kudo to slot 0) within 1 s (FR-019).

---

### User Story 9 – Reduced-motion, a11y, loading, and offline (Priority: P3)

The Live board ships **first-class accessibility and graceful degradation**: reduced-motion respects the OS preference, the heart button is `aria-pressed`, filter chips are `aria-haspopup="listbox"`, skeletons show during fetches, a global error toast covers 5xx. Keyboard-only navigation works end-to-end.

**Why this priority**: Non-negotiable per constitution (WCAG 2.2 AA) but not a "new feature" — it's a quality floor on top of US1–US8.

**Independent Test**: Run axe-core on `/kudos` desktop + mobile. Zero serious violations. Tab from top → every focusable element reachable in logical DOM order. Press Enter on heart → toggles. Press Escape in dropdown → closes with focus back on trigger.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion: reduce`, **When** any animation is scheduled (carousel slide, heart pop, skeleton shimmer, Spotlight mount), **Then** they are replaced with instant state swaps.
2. **Given** the feed is fetching, **When** the in-flight request is older than 200 ms, **Then** a set of 3 skeleton KUDO cards appears in the feed area (otherwise the spinner is skipped — avoid flash).
3. **Given** an API returns 401 (session expired), **When** the client receives the response, **Then** the user is redirected to `/login?next=/kudos` via the existing server-side guard.
4. **Given** an API returns 5xx, **When** the error resolves, **Then** the relevant block (feed / carousel / spotlight) shows its own inline error "Không tải được. Thử lại" with a Retry button, rather than failing the whole page.
5. **Given** the user is offline, **When** the Live board was already loaded, **Then** cached content stays readable; new heart clicks queue for replay; filter clicks show "Cần kết nối mạng để lọc" toast.

---

### Edge Cases

- **Empty feed**: "Hiện tại chưa có Kudos nào." — applies to C.2 and B.2.3 (FR-002).
- **Filter returns zero**: same empty state, but keeps the active filter chips visible so the user can clear them.
- **Heart on own kudo**: button is `disabled + aria-disabled="true"` (FR-006).
- **Double-tap heart**: debounced 300 ms (FR-007).
- **Very long body (> 5 lines on C.3.5, > 3 lines on B.3 highlight card)**: CSS line-clamp + ellipsis + click opens detail (parked → toast).
- **> 5 images on a card**: only first 5 thumbnails rendered; detail view (parked) would show the rest (Open Question Q2).
- **> 5 hashtags**: first 5 fit in one line; overflow ellipsis.
- **Missing avatar**: render the user's initials in a circular cream/dark avatar placeholder (FR-016).
- **Deleted sender / recipient account**: show placeholder name "Sunner đã rời" + default grey avatar; heart still works on the kudo (it persists independently).
- **Network error on initial SSR**: server returns page with feed in error state; client auto-retries once after 3 s.
- **Slow network (TTFB > 2 s)**: SSR holds until kudos payload arrives but ≤ 3 s total; after that, streams an empty feed and client takes over with skeleton.
- **`prefers-reduced-motion`**: carousel slide transitions → instant; heart pop → instant colour swap; Spotlight names → no float/parallax; skeleton → static grey bar (no shimmer).
- **JavaScript disabled**: SSR renders hero + feed + sidebar readable; heart/filter/carousel become inert. The page is still **legible**; interactive affordances are hidden via `<noscript>` CSS fallback.
- **Language switch VN↔EN mid-session**: all labels flip in place; filter dropdowns repopulate; timestamps reformat per locale; no scroll jump.
- **Viewport resize across breakpoints**: sidebar D collapses below 1024 px → stacks; Spotlight canvas re-fits its container; feed stays full-width.
- **Spotlight live update**: when a new kudo is posted and the user is on the board for > 60 s, the "388 KUDOS" counter and word-cloud **MAY** soft-refresh (Open Question Q6 — polling vs. manual refresh vs. SSE).
- **Very short session (< 1 s before signout)**: the heart toggle's in-flight request should survive logout and either succeed or be silently dropped (no unhandled-rejection console noise).
- **User has never logged in on SAA**: D.1 stats all return 0; D.3 still shows the 10 most-recent global gift recipients (not filtered to user).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Node | Description | Interactions |
|---|---|---|---|
| `SiteHeader` (existing) | `2940:13433` | Sticky dark-translucent header (bg `rgba(16,20,23,0.8)`), height 80 px, nav items `About SAA 2025`, `Award Information`, `Sun* Kudos` (active) | Logo → `/`; nav click; language toggle; bell; profile |
| `KudosHero` (new) | `2940:13432` + `2940:13437` | Full-bleed keyvisual backdrop 1440×512 with cream gradient cover + title "Hệ thống ghi nhận lời cảm ơn" + MM_MEDIA_Kudos logo art | Static, no interactions |
| `KudosComposerPill` (new — A.1) | `2940:13449` | 738×72 cream-bordered pill with pencil icon + placeholder "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" | Click / focus → opens Viết Kudo (route/modal parked); keyboard Enter activates |
| `SunnerSearchPill` (new — A.1 sibling) | `2940:13450` | 381×72 pill, magnifier icon + placeholder "Tìm kiếm" | Type + Enter → triggers `GET /users?search=…` (parked; debounced 300 ms) |
| `HashtagFilterButton` (new — B.1.1) | `2940:13459` | Icon-text button, opens hashtag dropdown (parked frame `1002:13013`) | Click → dropdown; select → filter |
| `DepartmentFilterButton` (new — B.1.2) | `2940:13460` | Icon-text button, opens department dropdown (parked frame `721:5684`) | Click → dropdown; select → filter |
| `HighlightSectionHeader` (new — B.1 header) | `2940:13453` | "Sun* Annual Awards 2025" caption / divider / "HIGHLIGHT KUDOS" title (cream 57/64) | Static |
| `HighlightCarousel` (new — B.2) | `2940:13461` | 1440×525 carousel of 5 `HighlightKudoCard` items with dimmed side slides | Prev/next arrows, swipe on touch, heart, Copy Link, Xem chi tiết |
| `HighlightKudoCard` (new — B.3) | `2940:13465` | Center-stage card shown in carousel, 3-line body clamp | Click → detail (parked); heart; Copy Link |
| `CarouselPager` (new — B.5) | `2940:13471` | "2/5" text + left/right arrow buttons | Prev/Next; disabled at edges |
| `SpotlightHeader` (new — B.6) | `2940:13476` | Section caption "Sun* Annual Awards 2025" + title "SPOTLIGHT BOARD" | Static |
| `SpotlightBoard` (new — B.7) | `2940:14174` | 1157×548 word-cloud canvas with name nodes, live counter "388 KUDOS", sunner search, pan/zoom | Hover → tooltip; click → detail (parked); pan/zoom |
| `SpotlightCounter` (new — B.7.1) | `3007:17482` | Live total kudos count + "KUDOS" label | Static, refreshes on poll |
| `SpotlightPanZoomControls` (new — B.7.2) | `3007:17479` | Floating pill with "Pan / Zoom" tools | Click → toggles pan or zoom cursor mode |
| `SpotlightSearch` (new — B.7.3) | `2940:14833` | Inline search in the spotlight top-right | Enter → pans/centers matching node |
| `AllKudosHeader` (new — C.1) | `2940:14221` | Section caption + title "ALL KUDOS" | Static |
| `KudoPostCard` (new — C.3 / C.5 / C.6 / C.7) | `3127:21871` et al | Cream `#FFF8E1` card, 680×~750, radius 24, padding 40/40/16/40 | See nested interactions below |
| `KudoCardSender` (new — C.3.1) | `I3127:21871;256:4858` | Avatar + name + hoa thị + danh hiệu | Hover → profile preview (parked); click → profile (parked) |
| `KudoCardRecipient` (new — C.3.3) | `I3127:21871;256:4860` | Same shape as sender | Same interactions |
| `KudoCardSentIcon` (new — C.3.2) | `I3127:21871;256:5161` | 32×123 arrow icon between sender and recipient | Static |
| `KudoCardTimestamp` (new — C.3.4) | `I3127:21871;256:5229` | 16/24 700 grey `#999` text "10:00 - 10/30/2025" | Static |
| `KudoCardContent` (new — C.3.5) | `I3127:21871;256:5155` | Body paragraph, max 5 lines, clamp + ellipsis | Click → detail (parked) |
| `KudoCardImages` (new — C.3.6) | `I3127:21871;256:5176` | Row of up to 5 square thumbnails 88×88, gap 16 | Click image → lightbox full (parked → toast) |
| `KudoCardHashtags` (new — C.3.7) | `I3127:21871;256:5158` | Text row "#Dedicated #Inspring …", max 5 | Click a tag → apply hashtag filter (FR-008) |
| `KudoCardActionBar` (new — C.4) | `I3127:21871;256:5194` | 600×56 row containing Hearts + Copy Link | – |
| `HeartButton` (new — C.4.1) | `I3127:21871;256:5175` | Grey/red heart icon + count text "1.000" | Click → toggle (US2); disabled if user = sender |
| `CopyLinkButton` (new — C.4.2) | `I3127:21871;256:5216` | Text + link icon | Click → copy URL + toast "Link copied — ready to share!" |
| `KudoStatsSidebar` (new — D) | `2940:13488` | 422-wide sticky sidebar on desktop | – |
| `StatsBlock` (new — D.1) | `2940:13489` | 5 metric rows + divider + "Mở quà" CTA | Mở quà click → `/gifts/open` (parked) |
| `LatestGiftRecipients` (new — D.3) | `2940:13510` | Header + vertical list of 10 recipients | Click name/avatar → profile (parked); scrollable if overflow |
| `QuickActionsFab` (existing) | global | Floating cream pill bottom-right | Click → menu with "Viết Kudo →" |
| `SiteFooter` (existing) | `2940:13522` | Dark footer with logo + 4 nav links | Nav link clicks |

### Navigation Flow

- **From**: Homepage `/` → Kudos promo "Chi tiết →"; header nav "Sun\* Kudos"; footer nav "Sun\* Kudos"; Awards page `/awards` Kudos promo
- **To**:
  - `/kudos/new` (or modal) — A.1 composer pill **and** FAB Viết Kudo
  - Viết Kudo flow (parked, SCREENFLOW row 7)
  - Dropdown list hashtag (parked, frame `1002:13013`)
  - Dropdown Phòng ban (parked, SCREENFLOW row 11)
  - View Kudo detail (parked — "Đang xây dựng" toast fallback)
  - User profile (parked → profile preview / full profile screens on SCREENFLOW)
  - Open secret box (parked, frame `1466:7676`)
  - `/login?next=/kudos` (unauthenticated)
- **Triggers**: see individual user stories.

### Visual Requirements

- **Breakpoints**:
  - Desktop (≥ 1024 px): full 3-slab layout; feed + sidebar side-by-side (680 + 422 + gaps).
  - Tablet (640–1023 px): sidebar D stacks **below** C; carousel still 1-slide-per-view but narrower (single card visible, side cards hidden); Spotlight scales fluidly, pan/zoom enabled.
  - Mobile (< 640 px): A.1 pill full-width; filter chips stack horizontally scrollable; HIGHLIGHT becomes 1-card-at-a-time with swipe; Spotlight may degrade to a simple scrolling list of top recipients (Open Question Q7); sidebar D stacks below (or is collapsed behind a "Thống kê của tôi" accordion).
- **Animations**:
  - Heart toggle: 250 ms scale 1 → 1.25 → 1 (ease-out) + colour cross-fade grey↔red; **under `prefers-reduced-motion`** the animation is removed (instant colour swap, no scale).
  - Carousel slide: 400 ms ease-in-out translate-X; reduced-motion → instant.
  - Skeleton shimmer: 1.5 s linear gradient sweep; reduced-motion → static grey bar.
  - Spotlight name mount: initial fade-in + small translateY(4 px) stagger (0–600 ms); reduced-motion → no stagger.
  - Tooltip on Spotlight hover: 200 ms fade + translateY(4 px); reduced-motion → instant.
  - Toast: slide-in from top-right, 200 ms; reduced-motion → fade only.
- **Accessibility** (WCAG 2.2 AA — constitution Principle II):
  - Contrast: body text navy `#00101A` on cream `#FFF8E1` ≈ 15.8:1 (default per OQ-DS-1; charcoal `#383838` fallback ≈ 10.3:1 also passes AA); white on `#00101A` = 17.4:1; cream `#FFEA9E` on dark = 12.1:1 — all pass AA large + normal text.
  - Heart button uses `aria-pressed="true|false"` + `aria-label="Thả tim cho kudo này"`; disabled state uses `aria-disabled="true"`.
  - Filter dropdowns use `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` state.
  - Carousel uses `role="region"` + `aria-roledescription="carousel"`; each slide is a `role="group"` with `aria-roledescription="slide"` and `aria-label="Slide {n} of 5"`.
  - Spotlight names are `<button>` with `aria-label` containing the name + last kudo summary (single tabstop for the whole board, arrow keys move focus between names — Open Question Q8).
  - Live "388 KUDOS" counter uses `aria-live="polite"`.
  - All icon-only buttons (prev/next, Copy Link, Mở quà if icon-only) have `aria-label`.
  - Skip link at the top of the page jumps to `#feed` (the All Kudos list).
  - Focus ring: 2 px `outline: var(--color-accent-cream)` with `outline-offset: 2px` on every focusable element.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Live board MUST render three vertical sections in fixed order: **A** hero + composer, **B** highlight section (header → carousel → Spotlight → pager), **C + D** all-kudos feed + right sidebar.
- **FR-002**: `/kudos` MUST display the empty state copy "Hiện tại chưa có Kudos nào." whenever the feed or carousel returns zero items (including post-filter).
- **FR-003**: The page MUST require an authenticated Supabase session; unauthenticated requests redirect to `/login?next=/kudos` (inherits the awards-system guard pattern).
- **FR-004**: The feed C.2 MUST be paginated with a default page size of 10, newest-first (`created_at DESC`). The client MUST support hashtag (`?hashtag=`) and department (`?department=`) query filters; both MAY combine.
- **FR-005**: The HIGHLIGHT carousel B.2 MUST render exactly 5 slides sourced from `GET /kudos?sort=hearts&limit=5&timeframe=event`. If fewer than 5 kudos exist, render only what exists; if zero, show the empty state.
- **FR-006**: `HeartButton` (C.4.1) MUST be **disabled** when the currently-authenticated user is the sender of that kudo. When enabled, clicking toggles heart (add or remove) via `POST /kudos/:id/hearts`.
- **FR-007**: Heart toggle MUST be debounced at 300 ms on the client — rapid repeated clicks within 300 ms of the last one MUST be ignored (no network request, no optimistic flicker).
- **FR-008**: Clicking a hashtag inside a KUDO card (C.3.7) MUST apply that hashtag as an active filter (same effect as selecting it from B.1.1), update the URL, and refetch both feed and carousel.
- **FR-009**: When a kudo appears in **both** the carousel and the feed (same id), the heart state MUST stay in sync — a toggle in one reflects in the other immediately (shared React state or cache key).
- **FR-010**: The "Mở quà" button (D.1.8) MUST be disabled with `aria-disabled="true"` when the user has zero unopened secret boxes.
- **FR-011**: All textual copy (placeholders, titles, empty-state messages, toasts, aria-labels) MUST live under `src/messages/{vi,en}.json` → `kudos.*` keys. No hardcoded user-facing strings in components.
- **FR-012**: "Xem chi tiết" and "Click on card body" on any KUDO card MUST navigate to `/kudos/:id` (View Kudo screen, parked). Until that screen ships, the click emits a toast "Đang xây dựng" + stays on page. Reason: SCREENFLOW marks View Kudo as parked.
- **FR-013**: Copy Link (C.4.2) MUST copy `${origin}/kudos/:id` to the clipboard via `navigator.clipboard.writeText`. The button label MUST swap inline to "Đã copy!" with a check icon for 1.5 s (per design-style §19) **and** a global toast "Link copied — ready to share!" (i18n key `kudos.copyLink.toast`) MUST fire for screen-reader announcement via `role="status"`. Fallback for older browsers: document.execCommand("copy") on a hidden textarea.
- **FR-014**: URL filters MUST be treated as the source of truth — a fresh page load with `?hashtag=dedicated&department=engineering` MUST SSR the pre-filtered data, not filter on the client after render.
- **FR-015**: The Spotlight counter B.7.1 MUST bind to `aria-live="polite"` so screen readers announce updates without stealing focus.
- **FR-016**: Any avatar (sender, recipient, sidebar recipient) MUST fall back to a monogram circle (first letter of name over cream bg, dark text) when the avatar URL is missing or returns 404.
- **FR-017**: On browser resize from desktop to tablet / mobile (crossing 1024 px), the right sidebar D MUST smoothly reflow below the feed without losing scroll position in the feed.
- **FR-018**: Heading hierarchy: **one** `<h1>` — the hero title "Hệ thống ghi nhận lời cảm ơn". Section titles "HIGHLIGHT KUDOS", "SPOTLIGHT BOARD", "ALL KUDOS" are `<h2>`. KUDO card sender / recipient names are **not** headings; they are `<button>`s.
- **FR-019**: After returning from `/kudos/new` (Viết Kudo post-submit), the feed MUST refetch page 1 so the just-posted kudo appears at the top.
- **FR-020**: The carousel B.2 and Spotlight B.7 MUST visually **never** scroll the main page — their pan/zoom/swipe gestures are scoped to their own containers (no body scroll jank on mobile).
- **FR-021**: Analytics: emit `track({ type: "screen_view", screen: "kudos_liveboard" })` on server render; emit `track({ type: "kudo_hearted", id, action })` on heart success; emit `track({ type: "kudo_filter", kind: "hashtag"|"department", value })` on filter change.
- **FR-022**: The page MUST gracefully handle a missing Supabase connection (try/catch around `getUser()`) and redirect to `/login` instead of crashing (inherits Homepage/Awards FR-013 pattern).
- **FR-023**: URL query-param filters MUST be kept in the URL via `router.replace()` (no new browser-history entry per filter change — avoids back-button spam).

### Technical Requirements

- **TR-001**: Route file at `src/app/kudos/page.tsx` as a **Server Component** that:
  1. Verifies session via `supabase.auth.getUser()` (redirect if absent).
  2. Reads `?hashtag` and `?department` from `searchParams`.
  3. Calls `GET /kudos` with the filters → first page.
  4. Calls `GET /kudos?sort=hearts&limit=5&timeframe=event` → carousel.
  5. Calls `GET /users/me/kudos-stats` → D.1 block.
  6. Calls `GET /users/latest-giftees` → D.3.
  7. Renders all sections with data hydrated.
- **TR-002**: Client Components (marked `"use client"`):
  - `<HeartButton />` — useOptimistic + useTransition for instant feedback.
  - `<HighlightCarousel />` — embla-carousel-react (already a potential dep) or custom; keep bundle < 10 KB.
  - `<SpotlightBoard />` — IntersectionObserver mount gate (lazy-load) + pan/zoom (custom or `react-zoom-pan-pinch` if license/size permits — see Open Question Q9).
  - `<FilterDropdown />` — Headless-style combobox pattern (no new dep if Tailwind Headless is absent; hand-rolled per constitution).
  - `<KudoListClient />` — wraps the SSR'd initial page + infinite-scroll/load-more logic (Open Question Q1 decision).
- **TR-003**: Bundle target: `/kudos` route total JS ≤ 85 KB gzipped (larger than `/` due to carousel + pan-zoom; reduce by lazy-loading Spotlight below-the-fold).
- **TR-004**: LCP target: < 2.5 s on Cloudflare Workers preview at mobile slow-4G. Above-the-fold LCP candidate = hero "Hệ thống ghi nhận lời cảm ơn" title (text, no image). The keyvisual image loads with `priority` on desktop; lazy on mobile.
- **TR-005**: Data fetching uses **Server Components** for initial render; mutations (heart, filter change) use **Server Actions** or a dedicated `/api/kudos/:id/hearts` route handler. Cache invalidation after mutation: `revalidateTag("kudos")` + optimistic UI.
- **TR-006**: Heart toggle concurrency — the server endpoint MUST be idempotent (receiving two identical `add` events within the debounce window MUST NOT double-increment). Enforce via `UNIQUE (user_id, kudo_id)` in the hearts table and UPSERT semantics server-side (spec deferred to momorph.database).
- **TR-007**: No new npm dependencies beyond:
  - **(optional)** a carousel primitive ≤ 10 KB (embla-carousel-react or keen-slider). If not added, hand-roll with CSS scroll-snap + a minimal swipe handler.
  - **(optional)** a pan/zoom primitive for Spotlight. If not added, hand-roll with Pointer Events (~100 LOC).
- **TR-008**: Reuse existing tokens from `globals.css`: `--color-brand-900`, `--color-brand-700` (header), `--color-accent-cream` + hover/active, `--color-divider`, `--font-montserrat`, `--shadow-fab-*`. **New tokens required** (see *New Tokens* section below).
- **TR-009**: Test coverage per constitution Principle III:
  - Unit: `<HeartButton />` — toggles state on click, disabled when sender, debounced at 300 ms, rolls back on network fail, respects reduced-motion.
  - Unit: `<FilterDropdown />` — opens on click, keyboard nav (ArrowUp/Down/Enter/Escape), single-select semantics, outside-click closes.
  - Unit: `<KudoPostCard />` — renders all required slots (sender/recipient/time/body/images/hashtags/action), body clamps to 5 lines, images cap at 5, hashtags cap at 5.
  - Unit: `<HighlightCarousel />` — renders N slides, arrows disable at edges, prev/next updates pager text, heart state syncs with feed via shared cache key.
  - Integration: SSR `/kudos` with filters — `?hashtag=x` returns filtered data.
  - Integration: unauthenticated redirect.
  - Integration: empty-state rendering when API returns `[]`.
  - E2E (Playwright): sign-in → land on `/kudos` → heart a kudo → reload → heart still active; apply hashtag filter → feed narrows; carousel next arrow works; FAB → Viết Kudo opens.
- **TR-010**: Responsive image behaviour — avatar 48×48 (sender/recipient on C.3), 32×32 (sidebar D.3), 32×32 (B.3 highlight card). Attachment thumbnails 88×88 on desktop; 64×64 on mobile. All via `next/image` with `sizes` attribute + `loading="lazy"` for below-the-fold rows.
- **TR-011**: Virtualise the feed once `items.length` > 30 — use `@tanstack/react-virtual` (~6 KB gzipped). Until then, plain DOM rendering.
- **TR-012**: The Spotlight word-cloud layout is **precomputed server-side** (`GET /kudos/spotlight` returns each name + x/y coords + weight). No live CSS reflow per tick. Coords may be returned as normalised 0–1 floats so the client scales them to the container.

### New Tokens Needed

Proposed additions to `src/app/globals.css` (flagged explicitly because no existing token matches):

| Token | Value | Why a new token is needed |
|---|---|---|
| `--color-kudo-card` | `#FFF8E1` | KUDO card cream-white surface (C.3 `backgroundColor`) — distinct from `--color-accent-cream` (`#FFEA9E`, which is the *accent/CTA* cream). Confirmed via `list_frame_styles` on `3127:21871`. |
| `--color-kudo-card-text` | `#00101A` (Figma) **or** `#383838` (visual) | Body / metadata text on cream cards. Figma exposes navy `rgba(0,16,26,1)`; reference image reads as charcoal `#383838`. Both pass WCAG AA. Implementation defaults to navy until Design confirms (OQ-DS-1 in design-style.md). |
| `--color-muted-grey` | `#999999` | `C.3.4_Time` colour in Figma is `rgba(153,153,153,1)` — a lighter grey than `--color-divider` (`#2E3940`). Used for small metadata, timestamps, and inactive heart icon. (Design-style.md uses the same name; this row supersedes the prior `--color-timestamp-grey` / `--color-heart-inactive` proposals — both consolidate into `--color-muted-grey`.) |
| `--color-secondary-btn-fill` | `rgba(255, 234, 158, 0.10)` | Translucent cream fill for pill-shaped secondary buttons on dark bg (composer pill, sunner search, filter chips). |
| `--color-heart-active` | `#D4271D` | Red heart icon when active. **Already defined** as `--color-nav-dot` (awards-system feature). Aliased as `--color-heart-active: var(--color-nav-dot);` per Open Question Q10 to express semantic intent. |
| `--radius-kudo-card` | `24px` | KUDO card uses 24 px border-radius per Figma. No matching radius token exists in `globals.css` today (current file defines colours, fonts, and shadow tokens only — radius scale is implicit via Tailwind utilities). |
| `--radius-highlight-card` | `16px` | B.3 highlight card (`2940:13465`). |
| `--radius-sidebar-card` | `17px` | D.1 / D.3 sidebar cards (`2940:13489`, `2940:13510`). |
| `--radius-spotlight` | `47px` | B.7 Spotlight panel (`2940:14174`, Figma 47.14 px). |
| `--radius-pill` | `68px` | Composer pill + Sunner search pill (`2940:13449`, `2940:13450`). Note: `globals.css` has no existing pill/full radius token; the Tailwind `rounded-full` utility (9999px) is also acceptable since both pills are taller than 68 px in width terms — visual parity holds. |
| `--radius-filter-chip` | `4px` | B.1.1 / B.1.2 filter chips (`2940:13459`, `2940:13460`). |
| `--shadow-kudo-card` | `0 4px 12px rgba(0, 0, 0, 0.25)` (derived) | Soft drop shadow implied by the contrast of the cream card over the dark backdrop; Figma doesn't expose an explicit box-shadow token. **Confirm with design (OQ-DS-2 in design-style.md).** |

### Key Entities

- **Kudo**
  - `id: string` (UUID)
  - `sender: User` (minimal projection: `id`, `display_name`, `avatar_url`, `honorific`, `hoa_thi_count`)
  - `recipient: User` (same shape) — note: Figma shows single recipient per card; multi-recipient is **out of scope** for MVP Live board.
  - `body: string` (markdown-limited or plain? — Open Question Q11)
  - `hashtags: string[]` (≤ 10 stored, ≤ 5 rendered inline)
  - `images: Array<{ url: string; alt?: string }>` (≤ 5 stored in MVP; more → detail page)
  - `hearts_count: number`
  - `has_hearted: boolean` (computed per viewer)
  - `created_at: ISO 8601 string` (rendered in `HH:mm - MM/DD/YYYY` via `date-fns` with the active locale)
  - `department: DepartmentSlug | null` (for filtering — derived from sender's or recipient's team? Open Question Q12)
- **KudosStats** (self)
  - `received_count: number`
  - `sent_count: number`
  - `hearts_received: number`
  - `secret_boxes_opened: number`
  - `secret_boxes_unopened: number`
- **LatestGiftee** (for D.3 — derived from `gift_redemptions`,
  migration 0005)
  - `id: string` — redemption event id (not user id; a user can recur
    when they've redeemed multiple prizes)
  - `display_name: string`
  - `avatar_url: string`
  - `gift_description: string` — server composes from template
    `"Nhận được {quantity} {gift_name}"` (vi) /
    `"Received {quantity} {gift_name}"` (en). Source row carries
    `gift_name`, `quantity`, `source` ("secret_box" default), and
    `redeemed_at`.
- **SpotlightRecipient** (for B.7)
  - `name: string`
  - `x: number` (normalised 0–1)
  - `y: number` (normalised 0–1)
  - `weight: number` (drives font size; hearts or kudos-count based)
  - `recent_kudo: { time: ISO, preview: string }`

### Honour tier auto-computation (resolved 2026-04-22)

The Thể lệ screen (`b1Filzi9i6-the-le/spec.md` line 16) states recipient Hero tier badges by counts: *"New 1–4 / Rising 5–9 / Super 10–20 / Legend 20+ senders"*. This spec **owns** the computation contract because the kudo write-path and `profiles.honour_title` read-path both belong to the Kudos Live board domain.

**Resolved decisions** (from reviewspecify round 2026-04-22):

- **Q1 — What to count**: **distinct senders** per recipient (`count(distinct sender_id)` over `kudos` joined with `kudo_recipients` where `recipient_id = $1`). The spec's wording "senders" is load-bearing — a single sender giving 5 kudos to the same recipient counts as 1 sender, not 5 kudos.
- **Q2 — Anonymous kudos**: **include** them in the count. Tier is a property of the recipient's social capital; sender privacy (the `is_anonymous` flag) does not affect whether the kudo-event happened.
- **Q3 — Threshold boundaries** (resolving the "10–20" ambiguity in spec copy):
  - `null` when distinct-sender count = 0 (user renders plain name row)
  - `New Hero` when 1 ≤ count ≤ 4
  - `Rising Hero` when 5 ≤ count ≤ 9
  - `Super Hero` when 10 ≤ count ≤ 19
  - `Legend Hero` when count ≥ 20
- **Q4 — Where to compute**: **DB trigger** on `INSERT` to `kudo_recipients`. Runs `AFTER INSERT FOR EACH ROW` → recomputes the recipient's tier via `compute_honour_tier()` helper → updates `profiles.honour_title` only if the new tier differs (avoid write churn). Chosen over inline in `create_kudo` for isolation + correctness if multi-recipient lands later.
- **Q5 — Backfill**: one-time `UPDATE profiles` at end of migration applies the tier to every existing recipient based on current `kudo_recipients` state, so legacy data is not blind.
- **Q6 — Migration file**: `supabase/migrations/0018_honour_tier_autocompute.sql` — contains: (a) `compute_honour_tier(uuid)` function, (b) `sync_recipient_honour()` trigger function, (c) trigger on `kudo_recipients`, (d) backfill UPDATE.

**Tier function contract**:

```sql
create or replace function compute_honour_tier(p_user_id uuid)
  returns honour_title language sql stable as $$
  select case
    when distinct_senders = 0 then null
    when distinct_senders <= 4 then 'New Hero'::honour_title
    when distinct_senders <= 9 then 'Rising Hero'::honour_title
    when distinct_senders <= 19 then 'Super Hero'::honour_title
    else 'Legend Hero'::honour_title
  end
  from (
    select count(distinct k.sender_id) as distinct_senders
    from kudo_recipients kr
    join kudos k on k.id = kr.kudo_id
    where kr.recipient_id = p_user_id
  ) t;
$$;
```

**Acceptance scenarios** (observable):

1. **Given** recipient Alice has 0 kudo_recipients rows, **When** sender Bob sends her his 1st kudo, **Then** post-commit `SELECT honour_title FROM profiles WHERE id = alice.id` returns `'New Hero'`.
2. **Given** Alice has kudos from 4 distinct senders (honour = `'New Hero'`), **When** a 5th distinct sender sends a kudo, **Then** her `honour_title` flips to `'Rising Hero'`.
3. **Given** Alice has kudos from sender Bob only (honour = `'New Hero'`), **When** Bob sends her another kudo (2nd from same sender), **Then** `distinct_senders` stays at 1 and her `honour_title` stays at `'New Hero'`.
4. **Given** a recipient has `is_anonymous=true` kudos from 3 distinct senders + `is_anonymous=false` from 2 more, **Then** distinct-sender count = 5 → `'Rising Hero'`.
5. **Given** the backfill UPDATE runs on an existing DB with mixed prior state, **When** the migration finishes, **Then** every recipient with ≥1 distinct sender has the correct `honour_title`; every recipient with 0 senders has `honour_title = null`.

**Edge cases**:

- **Self-kudo** (sender_id = recipient_id): still counted — no business rule excludes it. Flagged here for review; add filter if product team decides otherwise.
- **Soft-delete / hard-delete of a kudo** (not in current scope): if `kudo_recipients` rows are ever removed, the trigger should also be on `DELETE`. For MVP, kudos are insert-only; if delete arrives, add an `AFTER DELETE` branch to the trigger.
- **Concurrent inserts to same recipient**: Postgres `AFTER INSERT FOR EACH ROW` trigger serialises per row; recomputation is idempotent (`UPDATE ... WHERE honour_title IS DISTINCT FROM $new`), so race conditions converge.

### Anonymous sender rendering (resolved 2026-04-22 round 4)

When `kudo.is_anonymous === true`, the Live board card MUST hide the sender's real identity and render the dedicated anonymous variant. The spec source is Figma node `2099:9148` (design-style §17a "Anonymous-sender variant").

**Data contract** — the feed server actions (`getKudoFeed` + `getHighlightKudos`) perform the identity swap **server-side** before returning the payload to the client. The client component (`KudoParticipant`) is stateless with respect to anonymity and reads a single boolean prop.

| Returned field | Anonymous kudo                                              | Non-anonymous              |
| -------------- | ----------------------------------------------------------- | -------------------------- |
| `sender.id`    | `anon-{kudoId}` — stable seed for `pickMonogramColor` (n/a, monogram is replaced by incognito icon anyway) | real `profiles.id`        |
| `sender.display_name` | `anonymous_alias` (fallback "Ẩn danh" when null)      | real `display_name`         |
| `sender.avatar_url`   | `null`                                                 | real URL                    |
| `sender.department_id` / `department_code` | `null` / `null`                   | real values                 |
| `sender.honour_title` | `null`                                                 | real tier                   |
| Top-level `sender_id` | `null` (viewers can't correlate)                       | real `sender_id`            |
| Top-level `is_anonymous` | `true`                                              | `false`                     |
| Top-level `anonymous_alias` | alias string (for Live-board label) | `null`                      |

**Rendering contract** — when `is_anonymous={true}` is passed to `KudoParticipant`:

- Avatar: 64×64 circle with `bg-[var(--color-border-secondary)]/30` + `<Icon name="incognito" size={36} />` (hat + spectacles glyph, colour `--color-brand-900`).
- Name: displays `user.display_name` (= alias, already swapped server-side) in the same Montserrat 16/24/700 style as real names.
- Subline: literal text "Người gửi ẩn danh" via i18n key `kudos.card.anonymousSenderLabel` (vi) / "Anonymous sender" (en). Replaces the CECV code + Hero-tier pill.

**Edit-pencil behaviour** (intentional): anonymous kudos render with `sender_id = null`, so the `viewerId === kudo.sender_id` check in `KudoPostCard` is always false → the pencil button does NOT show for anyone on an anonymous kudo in the public feed. If a "Sent by me" tab/filter is built later, it must use a dedicated query (`sender_id = auth.uid()`) to show the sender's own sent kudos there without breaking anonymity on the public feed.

**Acceptance scenarios**:

1. **Given** a kudo with `is_anonymous=true, anonymous_alias='Anh Hùng Xạ Điêu'`, **When** any viewer loads `/kudos`, **Then** the card renders the incognito avatar + "Anh Hùng Xạ Điêu" + "Người gửi ẩn danh" subline; no CECV code, no Hero pill, no real name appears.
2. **Given** the same kudo, **When** the sender themselves loads `/kudos`, **Then** they ALSO see the anonymous variant (no special-case reveal) and the edit pencil does NOT appear on this card on the public feed.
3. **Given** a kudo with `is_anonymous=false`, **When** the card renders, **Then** the existing sender variant (real name + CECV + Hero pill) is unchanged.
4. **Given** a kudo where `anonymous_alias` is unexpectedly null despite `is_anonymous=true` (data integrity issue — CHECK constraint should prevent but defence-in-depth), **Then** the label falls back to "Ẩn danh" so nothing renders blank.

---

## State Management

### Server-side (SSR)

- **Session**: `user` from `supabase.auth.getUser()`. If absent → `redirect("/login?next=/kudos")`.
- **Locale**: via `getMessages()` + `NEXT_LOCALE` cookie.
- **Filters**: read from `searchParams.hashtag` and `searchParams.department`.
- **Parallel fetches** (Promise.all):
  - `GET /kudos?hashtag=&department=&limit=10&sort=created_at_desc`
  - `GET /kudos?sort=hearts&limit=5&timeframe=event` (carousel)
  - `GET /kudos/spotlight` (Spotlight)
  - `GET /users/me/kudos-stats`
  - `GET /users/latest-giftees?limit=10`
  - `GET /hashtags` (for dropdown — cache at edge)
  - `GET /departments` (same)
- **Analytics**: fire-and-forget `track("screen_view")`.

### Client-side

| State | Owner | Purpose |
|---|---|---|
| `heartState[id]` | `<HeartButton />` via `useOptimistic` | Instant toggle; rolls back on error |
| `filterState` | `<FilterDropdown />` driving URL params | Active hashtag + department |
| `carouselIndex` | `<HighlightCarousel />` | Current centered slide |
| `feedPage` | `<KudoListClient />` | Paginated / infinite list |
| `spotlightView` | `<SpotlightBoard />` | Pan offset + zoom scale |
| `prefersReducedMotion` | global (read once from matchMedia) | Disables animations |
| `heartsCache` | module-level `Map<string, {count, hearted}>` | Syncs carousel ↔ feed (FR-009) |

No React Context needed; SWR/react-query optional for client-side refetch after mutations — else use Server Actions + `revalidateTag`.

### Loading / Error States

- **Loading**: If the SSR fetch promises resolve in ≤ 200 ms, no skeleton is shown. Beyond 200 ms, skeletons render in place (3 KUDO card skeletons in the feed, 1 carousel skeleton, 1 Spotlight panel skeleton, 1 D.1 skeleton). Initial page render waits for all critical fetches except Spotlight (lazy).
- **Error**:
  - Session error → redirect.
  - Feed fetch error → inline "Không tải được Kudos. Thử lại" with Retry button in C slot.
  - Carousel fetch error → same, in B slot.
  - Spotlight fetch error → collapse the Spotlight block (don't block the page).
  - Stats fetch error → sidebar D collapses to "Không tải được thống kê" but page remains usable.
- **Empty**:
  - Feed / carousel → "Hiện tại chưa có Kudos nào."
  - Spotlight → "Chưa có ai nhận Kudos"
  - D.3 → "Chưa có ai nhận quà trong hôm nay"

### Cache Strategy

- **HTTP caching**: `Cache-Control: private, no-store` on `/kudos` (session-gated).
- **Client-side**: heart state cached per-session in a React module map; filter state in the URL (survives refresh).
- **Hashtag + Department lists**: cache at edge (`revalidate: 3600` — 1 hour TTL).
- **Spotlight data**: `revalidate: 60` (1-minute freshness window); falls back to polling if the page is idle ≥ 60 s (Open Question Q6).

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|---|---|---|---|
| `/kudos` | GET | Paginated feed with `hashtag` / `department` / `limit` / `cursor` / `sort` params | **[predicted]** SCREENFLOW row 6 |
| `/kudos?hashtag=<slug>` | GET | Filter by hashtag | **[predicted]** |
| `/kudos?department=<slug>` | GET | Filter by department | **[predicted]** |
| `/kudos?sort=hearts&limit=5&timeframe=event` | GET | HIGHLIGHT carousel | **[predicted]** |
| `/kudos/spotlight` | GET | Word-cloud payload `{ total, recipients: [...] }` | **[predicted — new]** |
| `/kudos/:id/hearts` | POST | Toggle heart (body: `{ action: "add" \| "remove" }`) | **[predicted]** SCREENFLOW row 6 |
| `/users/me/kudos-stats` | GET | D.1 personal stats | **[predicted — new]** |
| `/users/latest-giftees?limit=10` | GET | D.3 list | **[predicted — new]** |
| `/hashtags` | GET | Populate B.1.1 dropdown (parked) | **[predicted — new]** |
| `/departments` | GET | Populate B.1.2 dropdown (SCREENFLOW row 11) | **[predicted]** |
| `/users?search=<q>` | GET | A.1 sibling sunner-search + B.7.3 | **[predicted — new]** |
| Supabase `auth.getUser()` | built-in | Session verification | Reused |

All `[predicted]` endpoints to be formalised in `momorph.apispecs` once this spec is approved.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Heart-toggle P95 latency < 250 ms (optimistic) and < 1 s (server round-trip) on mobile slow-4G.
- **SC-002**: Lighthouse mobile: LCP < 2.5 s, CLS < 0.1, TBT < 300 ms, Performance score ≥ 80.
- **SC-003**: Zero axe-core serious/critical a11y violations at 375×812 (mobile) and 1440×900 (desktop).
- **SC-004**: Filter change → feed updates visually within 400 ms (optimistic) and 1 s (server) on mid-network.
- **SC-005**: Language toggle VN↔EN flips 100 % of visible copy (placeholders, labels, timestamps, empty states, toasts) with zero layout shift.
- **SC-006**: 95 % of heart-click attempts **across the event** succeed (accounting for flaky mobile networks) — measured via server analytics.
- **SC-007**: Spotlight board renders all recipient nodes within 1 s of becoming visible in the viewport (lazy-loaded below-the-fold).
- **SC-008**: Feed first-page response ≤ 500 ms TTFB on Cloudflare Workers preview.
- **SC-009**: After posting a kudo via Viết Kudo and returning, the new kudo is the top item in the feed within 1 s (FR-019).
- **SC-010**: Keyboard-only walkthrough: user can reach, open, and select a hashtag filter from B.1.1 without the mouse, close dropdown with Escape, and have focus return to the trigger.

---

## Out of Scope

- **Kudo detail view** (`/kudos/:id`) — tracked as parked on SCREENFLOW; the Live board links but doesn't implement it.
- **Viết Kudo compose form** — separate spec (SCREENFLOW row 7, frame `ihQ26W78P2`).
- **Hashtag dropdown** (`1002:13013`) and **Phòng ban dropdown** (`721:5684`) — separate parked specs; this page defines the filter *trigger* button behaviour only.
- **Secret box open flow** (`1466:7676`) — separate parked spec.
- **Profile preview / full profile** — separate parked specs.
- **Image lightbox** for full-size attachments — parked until Product specifies it; MVP treats image-click as "open detail view".
- **Real-time WebSocket push** of new kudos while the user is on the page — Open Question Q6; default MVP is polling or manual refresh.
- **Notifications integration** — the bell icon is in the header, but new-kudo notifications are handled by the existing Notifications feature on SCREENFLOW.
- **Admin moderation** — hiding/removing a kudo or banning a sender is out of scope for the Live board consumer surface.
- **Multi-recipient kudos** — Figma shows single sender → single recipient. Team kudos are a future enhancement.
- **Emoji reactions beyond heart** — only heart is in the Figma.
- **Export / download** — no "export my kudos" feature.
- **Print styles** — not in scope.

---

## Dependencies

- [x] Constitution (`.momorph/constitution.md`)
- [x] SCREENFLOW entry for Live board (row 6) with predicted APIs
- [x] Homepage + Awards design-style docs for token inheritance
- [x] Shared components: `<SiteHeader />`, `<SiteFooter />`, `<QuickActionsFab />`, `<Icon />`, `<PrimaryButton />`, `<NavLink />`, `<LanguageToggle />`
- [x] i18n catalogues (`src/messages/{vi,en}.json`)
- [ ] Fonts: Montserrat (already loaded); no new font dependency
- [ ] New icons in `<Icon />`: `heart` (grey + red variants), `heart-filled`, `magnifier` / `search`, `hashtag`, `building` (department), `arrow-left`, `copy-link` — add to the sprite per Icon.tsx convention
- [ ] Assets to export:
  - `public/images/kudos/kv-kudos-hero.jpg` — 1440×512 hero keyvisual
  - `public/images/kudos/kudos-logo-art.png` — the big "KUDOS" logo artwork in A_KV (`2940:13440`)
  - `public/images/kudos/spotlight-backdrop.jpg` — the warm wooden panel in B.7 (`2940:14173`)
- [ ] API contracts (`momorph.apispecs` to be run on this frame after approval)
- [ ] Database schema for `kudos`, `kudos_hearts`, `hashtags`, `secret_boxes` (`momorph.database`)

---

## Open Questions

> Flag for Product / Design / Backend. Each open question blocks a specific decision; capture as an assumption if unanswered at implementation time.

- **Q1 (UX)** — **Infinite scroll vs. "Load more"** for the C.2 feed? Figma doesn't show a footer nor a "load more" CTA inside the feed. Default assumption: infinite scroll with IntersectionObserver + a small skeleton row while fetching. Risk: breaks the sticky sidebar on long pages. Alternative: explicit "Load more" button at the bottom — simpler a11y.
- **Q2 (Product)** — **>5 attachment images** per kudo: hidden entirely in MVP, or show a "+N" badge overlay on the 5th thumbnail that opens a lightbox? Default: hidden until detail view ships.
- **Q3 (UX)** — **HIGHLIGHT carousel default slide**: slide 1 or slide 3 (center-biased)? Figma visually centers slide 3. Default: slide 3 to match the reference image; arrows jump to slide 1 / slide 5 at edges.
- **Q4 (Product)** — **Spotlight weight** source: hearts received, kudos received count, or hand-curated? Default: hearts received (biggest = most beloved) — but this excludes new Sunners with few hearts. Alternative: kudos-received count (fairer for new joiners).
- **Q5 (UX)** — **Mobile sidebar D collapse**: stack below C, OR collapse into an accordion "Thống kê của tôi" at the top of the page? Default: stack below (simpler) — but personal stats may feel buried. Confirm with Product.
- **Q6 (Technical)** — **Real-time updates**: polling every 60 s (cheap, good enough), SSE (one-way server push, better freshness), or WebSocket (bidirectional, overkill)? Default: polling on the Spotlight counter every 60 s; manual pull-to-refresh on the feed. Revisit at 500+ concurrent users.
- **Q7 (UX)** — **Mobile Spotlight**: the pan/zoom board is cumbersome on small screens. Default fallback: render as a vertical list of the top 20 recipients with their last-kudo time. Confirm with Design.
- **Q8 (a11y)** — **Spotlight keyboard nav**: single tabstop with arrow-key navigation between names (roving tabindex)? Or each name a separate tabstop (120 tabstops)? Default: roving tabindex.
- **Q9 (Technical)** — **Pan/zoom dependency**: `react-zoom-pan-pinch` (~12 KB) vs. hand-roll. Hand-roll is feasible in ~100 LOC with Pointer Events and meets the "no unnecessary deps" constitution principle. Default: hand-roll.
- **Q10 (Tokens)** — **Active heart colour reuse** `--color-nav-dot: #D4271D` or introduce a dedicated `--color-heart-active`? Semantically different use-cases — recommend a dedicated token with the same initial value, aliased if needed.
- **Q11 (Product)** — **Body format**: plain text only, or limited markdown (bold + italic + emoji)? Figma shows unformatted text. Default: plain text with auto-linkification of URLs + emoji rendering.
- **Q12 (Data)** — **Department filter semantics**: is a kudo's department derived from the **sender**'s team, the **recipient**'s team, or both (match-either)? Default: recipient's team — "show me kudos sent to my department". Confirm with Product.
- **Q13 (Design)** — **Special-day heart multiplier**: per C.4.1 description, on admin-configured special days the sender gets +2 hearts instead of +1. Where does the client learn this flag? Option A: server returns `{ multiplier: 2, reason: "ngày đặc biệt" }` in the heart-toggle response, and the UI shows a micro-confetti; Option B: flag is hidden and only reflected in stats silently. Default: Option A — delight users.
- **Q14 (Product)** — **Composer pill A.1** opens a full route (`/kudos/new`) or a modal overlay on `/kudos`? Modal wins on "don't lose feed scroll position"; full-route wins on URL shareability. Tied to the Viết Kudo spec (SCREENFLOW row 7). Default: modal, fallback to full-route if deep-linkable compose becomes a need.
- **Q15 (Product)** — **Sunner search A.1 secondary pill** (`2940:13450`): does it filter the current page or navigate to a separate search screen? Figma doesn't show a result panel. Default: same-page overlay showing matching Sunners as a dropdown.
- **Q16 (Technical)** — **B.7 Spotlight layout algorithm**: precomputed server-side (CSS x/y coords) or live client-side (e.g. d3-cloud)? Default: precomputed server-side → simpler client, predictable FPS.

---

## Notes

### Reuse from prior screens

- **SiteHeader / SiteFooter / NavLink / LanguageToggle / QuickActionsFab** — all shipped on Homepage / Awards. No changes needed here; `NavLink` active-state already matches `usePathname()` so "Sun\* Kudos" auto-highlights on `/kudos`.
- **HeroBadge / CollectibleBadge** (existing) — not reused; Kudos hero is text + logo art, no badge.
- **Icon component** — extend with `heart`, `heart-filled`, `search`, `hashtag`, `building`, `arrow-left`, `copy-link`, `eye` (for "Xem chi tiết" icon) per `src/components/ui/Icon.tsx` sprite convention.

### Data-location decision

KUDO content (body, hashtags, images, timestamps, avatars) is **dynamic** and comes from the API. **Labels** ("HIGHLIGHT KUDOS", "ALL KUDOS", "Số Kudos bạn nhận được:", "Mở quà", empty-state copy, toasts, aria-labels) are **i18n** in `kudos.*`. **Slugs** (hashtag / department identifiers) are API-driven, not hardcoded.

### Shared heart state rationale (FR-009)

The same kudo CAN appear in both the HIGHLIGHT carousel and the C.2 feed. Without a shared cache, clicking the heart in the carousel would visually desync the feed copy. Mitigation: module-level `Map<kudoId, {count, hearted}>` updated by `<HeartButton />` on every optimistic toggle; carousel + feed components read from this map via a tiny `useSyncExternalStore` subscription (no new dep).

### Keyboard shortcuts (nice-to-have, NOT in MVP)

Proposed for v2: `?` opens shortcut help; `/` focuses the sunner search; `H` toggles heart on the currently-focused card; `Left`/`Right` in carousel region advances slides.

### Rendering performance

- Server-render the first 10 cards inline (SSR payload).
- Lazy-mount the SpotlightBoard with IntersectionObserver (below-the-fold on load).
- Lazy-mount the HighlightCarousel's non-center slides (only the center is required for LCP).
- Virtualise the feed after 30 items (TR-011).

### Known risk

The page is tall (~5862 px in Figma; ~3200+ px rendered after responsive tightening). Sidebar D must use `position: sticky; top: <header-height>` and respect `overflow: auto` on its inner D.3 list to avoid pushing out of viewport on short-content pages. Test on 1080 p and 720 p heights.

### Research follow-ups for momorph.plan

- Pick carousel primitive (embla vs. keen vs. hand-roll) — decide in plan.
- Pick pan/zoom primitive (react-zoom-pan-pinch vs. hand-roll) — Q9.
- Confirm heart endpoint semantics (toggle vs. idempotent add/remove) — Q13.
- Finalise Spotlight algorithm (precomputed vs. live) — Q16.

---

## Implementation Updates (v2 — post-Figma iteration)

This appendix records functional/behavioural changes that landed during
implementation and differ from the original spec above. They are the
**current source of truth** where they conflict with earlier sections.
Layout/design token details live in `design-style.md` §"Implementation
Updates". Pairs 1:1 with the appendix there.

### Scope adjustments

1. **Page layout** — only the All Kudos feed + Sidebar (C + D) is a
   2-column grid; Hero (A), Highlight (B), and Spotlight (B.7) are
   full-width slabs. Max content width reduced to `1152 px` to match
   `--space-page-inset: 144 px` at 1440 viewport.
2. **Hero pills position** — A.1 composer + A.2 Sunner-search pills
   render **inside the hero** (lower region) instead of in their own
   section below the keyvisual.
3. **Filter chips position** (US3 + US4) — B.1.1 Hashtag + B.1.2 Phòng
   ban sit on the **same row as the "HIGHLIGHT KUDOS" header**. They
   no longer appear above the All Kudos feed.

### Feature additions

4. **Side nav arrows on the carousel** — new `<` / `>` chevrons flank
   the Highlight track outside its bounds (visible on `lg+`), in
   addition to the B.5 `CarouselPager` below. Keyboard ArrowLeft/
   ArrowRight focus behaviour unchanged.
5. **Edge shadow vignette on the carousel** — two radial-style gradient
   overlays fade the flanking dimmed slides into the dark page
   background (design §B.2). Purely decorative; `pointer-events-none`.
6. **"Xem chi tiết ↗" action on every card** — both
   `KudoPostCard` (§17) and `HighlightKudoCard` (§B.3) gain a third
   action-bar entry. Clicks fire the shared "Đang xây dựng" toast
   (FR-012) until the detail route ships.
7. **Spotlight recent-update log** — new bottom-left `aria-live="polite"`
   list showing the 4 most recent kudos with format
   `"{time} {name} đã nhận được một Kudos mới"` (time rendered
   `HH:MMPM` without a space, e.g. `08:30PM`).
8. **Spotlight dev mock fallback** — when `GET /kudos/spotlight`
   returns an empty payload, the board falls back to a seeded
   30-recipient cloud (total 388) so the section stays visually
   populated in pre-launch / empty-DB environments.

### Copy / i18n changes

9. **Hero H1** — `kudos.hero.h1` updated to the Figma copy
   `"Hệ thống ghi nhận và cảm ơn"` (en: `"A system to recognize and
   thank"`). Decorative `"KUDOS"` is now an image asset
   (`public/images/logo_footer_Kudos.png`) with i18n alt text via
   `kudos.hero.decorative`.
10. **Hero placeholders**
    - composer: `"Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"`
    - search: `"Tìm kiếm profile Sunner"`
11. **Spotlight counter** (B.7.1) — label flips from `"X người nhận"` /
    `"X recipients"` to `"X KUDOS"` (matches Figma "388 KUDOS"). New
    i18n key `kudos.spotlight.recentUpdateTemplate` drives the feed
    line. Counter position **top-center**; search moved to **top-left**.
12. **Sidebar D.1 stats labels** — rewritten to Figma verbatim:
    - `statReceived`: `"Số Kudos bạn nhận được:"`
    - `statSent`: `"Số Kudos bạn đã gửi:"`
    - `statHearts`: `"Số tim bạn nhận được:"`
    - `statBoxesOpened`: `"Số Secret Box bạn đã mở:"`
    - `statBoxesUnopened`: `"Số Secret Box chưa mở:"`
13. **"Mở quà" CTA** (D.1.8) — renamed to `"Mở Secret Box"`.
14. **Sidebar D.3** — title `"10 SUNNER NHẬN QUÀ MỚI NHẤT"` (was
    `"Người bạn vừa tặng"`). Empty copy:
    `"Chưa có Sunner nào nhận quà."`

### Behavioural changes

15. **D.3 scope change** — `getLatestGiftees()` now returns the
    **system-wide** 10 most recent gift recipients (previously scoped
    to `sender_id = viewer.id`). Matches the Figma title
    "10 SUNNER NHẬN QUÀ MỚI NHẤT", which is an org-wide stream.
    - **Impact**: every authenticated viewer sees the same list.
    - **Privacy**: only public `display_name` + `avatar_url` are
      exposed — no change to RLS.
16. **Highlight card body alignment** (US1 / US5) — body renders
    centered (was left-aligned) with a new `kudo.title` row (short
    award category text) above it. Hashtags and action bar unchanged.

### Data model additions (non-breaking)

New optional fields on the TS domain types (backend migration TBD):

- `KudoUser.honour_code?: string` — e.g. `"CECV10"`. Rendered as a
  small grey label beneath the participant's name.
- `KudoUser.honour_title?: string` — one of `"Legend Hero"`,
  `"Rising Hero"`, `"Super Hero"`, `"New Hero"`. Maps to a pre-rendered
  image pill under `public/images/the-le/pill-*.png`. **Auto-computed**
  from received-kudo activity — see §"Honour tier auto-computation"
  below.
- `Kudo.title?: string` — e.g. `"IDOL GIỚI TRẺ"`. Centered navy line
  above the body copy.

Until the DB schema exposes these, a deterministic helper
`decorateKudoMock` (in `src/libs/kudos/decorateMock.ts`) layers demo
values on each kudo for visual parity. Remove once the migration lands.

### Assets added / reused

- `public/images/logo_footer_Kudos.png` — 728 × 147 decorative KUDOS
  logo (reuses the Thể lệ footer asset).
- `public/images/the-le/pill-{legend,rising,super,new}@2x.png` — honour
  pill images reused from the Thể lệ screen.
- No new icon family — added `chevron-left` / `chevron-right` to the
  existing `<Icon />` sprite (`src/components/ui/Icon.tsx`).

### Known deltas vs original Figma (design-style §"Recent UI updates")

- Hero decorative image aspect 4.95 : 1 vs Figma frame 5.75 : 1 → we
  prioritise the 103 px height (yields ~510 px width, ≈ 14 % narrower
  than the 592 px frame). Flagged for Design if a true 5.75:1 crop is
  needed.

### v3 feed-card redesign (ALL KUDOS only — `KudoPostCard`)

Updates that only apply to the feed card (§17); the highlight carousel
card (§B.3) is untouched.

1. **Sender → recipient connector** uses the new image asset
   `/icons/ic_kudo_send@2x.png` (navy "send" triangle, 64 × 64 source)
   rendered at 32 × 32 / 28 × 28 in the feed / highlight cards —
   replaces the earlier `arrow-right` / `chevron-right` glyphs.
2. **Amber body panel** — a warmer inner panel
   (`bg-[var(--color-accent-cream)]/40`, `rounded-2xl`, `p-5`, plus a
   1 px `border border-[var(--color-accent-cream)]` outline per the
   Figma) wraps **only the thank-you message body**. Timestamp, title,
   attachments, and hashtags all render on the outer cream card
   surface. Body is clamped to **4 lines** (`line-clamp-4`, was 5 in
   v2) with an ellipsis indicating overflow.
2b. **Section dividers** — two hairline `<hr>` lines
   (`border-t border-[var(--color-accent-cream)]`, cream yellow)
   separate the data regions inside the card: one between the
   participant strip and the meta/timestamp row, one between the
   hashtags and the action bar.
3. **Timestamp position**: top-left of the card surface (above the
   title + amber panel), no flanking dividers. Typography `text-sm
   font-bold tracking-[0.5 px] text-[var(--color-muted-grey)]`.
4. **Edit pencil** (new affordance): a 32 × 32 pencil button anchored
   at the **right end of the timestamp row** (same row, `justify-
   between`). **Rendered only when the viewer is the kudo sender**
   (`viewerId === kudo.sender_id`). `aria-label` comes from new i18n
   key `kudos.card.editAria`. Action destination (`/kudos/{id}/edit`)
   is parked until the edit flow ships.
5. **Action bar** — reduced from three columns to a two-item
   `flex justify-between` row: `[❤ count]` left, `Copy Link` right.
   **`SeeDetailLink` / "Xem chi tiết" is removed from the feed card**;
   it stays on the highlight carousel card.
6. **HeartButton layout**: count span now renders **before** the heart
   icon (was after), so active state reads `1.000 ❤`.
7. **Attachments** (§17f): feed now renders the `KudoImageRow` when
   `kudo.images` is non-empty. The `Kudo` domain type gains an
   optional `images?: string[]` field. `decorateKudoMock` injects a
   5-image sample (`/images/awards/*.png`) on ~1 in 3 kudos so the
   dev feed shows both with-attachments and text-only variants; the
   real backend will populate this field once the attachments schema
   ships. Each thumbnail carries a 2 px `border-[var(--color-accent-
   cream)]` (#FFEA9E) outline per the Figma.
8. **Heart count typography**: the count span is navy
   (`--color-brand-900`, #00101A) + `font-bold text-[20px]`, decoupled
   from the `HeartButton` state colour. Only the heart icon reflects
   pressed / disabled state.
9. **`HighlightKudoCard` aligned to v3 layout**: the highlight card now
   mirrors the feed card structure (cream hairline dividers above and
   below, amber body panel with cream border, `line-clamp-4`,
   `KudoImageRow` wired to `kudo.images`) with two deltas:
   - **No edit pencil** — highlight surfaces other users' kudos so
     there's no edit affordance, regardless of viewer.
   - **Action bar keeps "Xem chi tiết ↗"** — 3-column grid
     `Heart | Copy Link | Xem chi tiết`. Feed card dropped this link;
     highlight retains it.
10. **StatsBlock divider repositioned**: the 1 px cream divider moved
    from below the 5 rows to **between the "Số tim bạn nhận được" and
    "Số Secret Box bạn đã mở" rows** so the stats block visually splits
    into kudo/heart vs. secret-box groups before the CTA.
11. **Mở Secret Box CTA gains gift glyph**: the primary CTA in the
    sidebar now renders `/icons/icon_open_gift@2x.png` to the right of
    the label inside the button (28 px rendered, sourced from the 56×56
    @2x asset). Label text and colour tokens unchanged; icon is
    decorative (`alt=""`, `aria-hidden="true"`).
12. **§D.3 backed by new `gift_redemptions` table** (migration 0005,
    2026-04-21). D.3 "10 SUNNER NHẬN QUÀ MỚI NHẤT" is now a true
    physical-prize feed, not recycled kudo bodies:
    - New table `gift_redemptions (id, user_id, gift_name, quantity,
      source, redeemed_at, created_at)` with RLS open-read for any
      authenticated Sunner and writes restricted to service_role (the
      Secret Box redemption flow owns inserts).
    - `getLatestGiftees(limit)` reads the ledger ordered by
      `redeemed_at DESC` and composes each row's `giftDescription` from
      a locale-specific template (`"Nhận được {quantity} {gift}"` /
      `"Received {quantity} {gift}"`). The `id` in the result is the
      redemption event id so one Sunner may legitimately appear across
      multiple rows (multi-redemption case).
    - Seed: `scripts/seed-kudos-fixtures.ts` now inserts 10 fixture
      redemptions across the 8 fixture Sunners (áo phông SAA, cốc sứ,
      sticker set, móc khoá, bình nước, voucher cafe 100k, túi canvas,
      tai nghe bluetooth, sổ tay, hộp quà Secret Box) spaced 45 minutes
      apart for stable ordering.
    - Empty state (`gifteesEmpty`) unchanged — triggers when the table
      has no rows. When the Secret Box flow ships, it writes to the
      same table; no further D.3 changes needed.
13. **Full DB wiring (2026-04-21)** — remove the last in-memory
    decoration / stubs so `/kudos` renders purely from Supabase state,
    unblocking the upcoming "Viết Kudo" composer task:
    - **Migration 0006** (`profiles.honour_code`, `profiles.honour_title`
      enum `Legend Hero | Rising Hero | Super Hero | New Hero`) —
      replaces the `decorateKudoMock` honour logic. `KudoUser` now
      sources both fields from the DB row directly.
    - **Migration 0007** (`kudos.title text`, new `kudo_images`
      junction with `(kudo_id, url, position)` + 5-image DB-level
      trigger, and a `kudos_with_stats` view recreate so `SELECT k.*`
      picks up `title`). `Kudo.images` is now a required `string[]`
      ordered by `position`.
    - **Migration 0008** (`secret_boxes(id, user_id, opened_at)`) —
      backend-inserted ledger consumed by `getMyKudosStats()` for
      `secretBoxesOpened` / `secretBoxesUnopened`. The box-minting
      trigger is intentionally deferred to a later task.
    - **`searchSunner()`** wired to `profiles.display_name ILIKE '%q%'`
      (min 2 chars, limit 10), LIKE wildcards escaped. Sunner search
      pill on the hero now returns real suggestions.
    - **`decorateKudoMock`** deleted — every field it used to inject
      (`honour_code`, `honour_title`, `title`, `images`) now comes
      straight from the DB. Seed script populates these for fixture
      data so the UI shows deterministic demo content.
