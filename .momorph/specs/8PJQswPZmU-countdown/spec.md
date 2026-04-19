# Feature Specification: Countdown – Prelaunch Page

**Frame ID**: `8PJQswPZmU`
**Frame Name**: `Countdown - Prelaunch page`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-04-19
**Status**: Draft

---

## Overview

Full-bleed pre-launch landing page that displays a live countdown to the
SAA 2025 ceremony opening (`NEXT_PUBLIC_EVENT_START_AT`). The screen is the
public "holding page" users land on before the site officially opens —
dramatic key-visual background on the right side of the viewport + dark
gradient overlay on the left + centered headline ("Sự kiện sẽ bắt đầu sau")
above a large glass-style LED display showing remaining **Days / Hours /
Minutes** (no Seconds, no navigation, no auth).

Once the event starts (`now >= NEXT_PUBLIC_EVENT_START_AT`), the screen
transitions to a "We're live" state that either auto-redirects to `/login`
or swaps the countdown for a "Go to site" CTA — exact behaviour driven by
open question Q5 below.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Anonymous visitor sees the countdown (Priority: P1)

As an anonymous visitor arriving at the SAA 2025 site before the event
opens, I want to see a visually striking countdown so I understand the
event hasn't started yet and know exactly how long until it does.

**Why this priority**: This is the primary purpose of the screen. Without
it, visitors hit a blank holding page or the login screen without context.

**Independent Test**: Open the site at a fixed `Date.now()` earlier than
`NEXT_PUBLIC_EVENT_START_AT`. Verify the headline + 3 LED counters (D/H/M)
render with correct remaining time and tick at least once per minute.

**Acceptance Scenarios**:

1. **Given** `NEXT_PUBLIC_EVENT_START_AT` is set to a future timestamp,
   **When** a visitor loads the prelaunch route, **Then** the page renders
   the key-visual background + headline + 3 countdown units (D / H / M) in
   the active locale.
2. **Given** the countdown is rendered, **When** the next minute boundary
   ticks, **Then** the minutes tile updates without a full page reload.
3. **Given** the user toggles between tabs for several minutes, **When**
   they return, **Then** the countdown shows the accurate current remaining
   time (no drift) — recompute on focus/visibilitychange.
4. **Given** `NEXT_PUBLIC_EVENT_START_AT` is unset or invalid, **When** the
   page renders, **Then** all three tiles show `00` and a fallback message
   is used instead of the default headline.

---

### User Story 2 — Event launch transition (Priority: P1)

As a visitor who sits on the prelaunch page until launch time, I want the
page to transition smoothly to the live site at T-0 so I don't have to
refresh manually.

**Why this priority**: Without T-0 handling, users would be stuck on a
`00 / 00 / 00` countdown. UX also calls out launch-time as a critical
moment.

**Independent Test**: Set `NEXT_PUBLIC_EVENT_START_AT` to a timestamp ~1
minute in the future, wait for the tick, and verify the page redirects to
`/login` (or shows the "Go to site" CTA per Q5 resolution).

**Acceptance Scenarios**:

1. **Given** the countdown reaches `00:00:00`, **When** the client tick
   detects `now >= target`, **Then** the page either (a) `router.push("/login")`
   OR (b) swaps the countdown for a "Vào sự kiện" CTA — behaviour chosen
   by Q5.
2. **Given** the user hard-refreshes after T-0, **When** the server renders,
   **Then** it responds with an HTTP redirect to the chosen post-launch
   destination (no flash of countdown).

---

### User Story 3 — Localised headline (Priority: P2)

As a bilingual Sunner, I want the countdown headline and unit labels
rendered in my preferred locale so the page feels polished.

**Why this priority**: The page is public-facing and branded. `vi` + `en`
parity is non-negotiable for launch quality.

**Independent Test**: Toggle the browser `NEXT_LOCALE` cookie between `vi`
and `en`; verify the headline + unit labels + fallback message all reflect
the current locale.

**Acceptance Scenarios**:

1. **Given** `NEXT_LOCALE=vi`, **When** the page renders, **Then**
   headline = `"Sự kiện sẽ bắt đầu sau"`, labels = `DAYS` / `HOURS` /
   `MINUTES` (English kept per Figma convention, shared with Homepage hero).
2. **Given** `NEXT_LOCALE=en`, **When** the page renders, **Then**
   headline = `"Event starts in"` (or equivalent chosen during Plan Q6),
   labels unchanged.

---

### User Story 4 — Responsive on mobile/tablet (Priority: P2)

As a visitor on a narrow viewport, I want the countdown to remain readable
and centered without horizontal overflow.

**Why this priority**: The prelaunch page is often shared on social
channels → opens on mobile in a preview pane. Constitution §II mandates
responsive web.

**Independent Test**: Resize to 375 / 800 / 1440 px; verify the 3 LED
groups stay on one row on `sm:+`, stack to 2 rows (D / H-M) or scale down
on mobile `< 640 px`, and the background image never leaves a dark gap.

**Acceptance Scenarios**:

1. **Given** viewport `< 640 px`, **When** the page renders, **Then** the
   3 LED groups scale down (tiles ~56 × 88 instead of 77 × 123) and either
   stay on one row with reduced gaps or wrap to 2 rows — finalised in
   Plan (see design-style §Responsive).
2. **Given** any viewport, **When** the page renders, **Then** the
   background image fills the viewport with `object-cover` — no blank
   edges.

---

### Edge Cases

- **Env var missing**: `NEXT_PUBLIC_EVENT_START_AT` not set → show `00:00:00`
  + locale-aware fallback (reuse existing `homepage.countdown.fallback` key).
- **Env var in the past**: treat as "event has started" → apply T-0 transition
  logic (Q5).
- **Clock skew**: Client uses local `Date.now()`. Drift up to a minute is
  acceptable because the display resolution is minutes (no seconds).
- **Reduced motion**: Tile flip/fade animations (if any) must be disabled under
  `prefers-reduced-motion`.
- **Tab backgrounding**: Browsers throttle `setInterval` in background tabs →
  recompute on `visibilitychange` event.
- **Multiple locales loading late**: Server pre-resolves copy via
  `getMessages()`; no client-side i18n fetch.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Node ID | Description | Interactions |
|-----------|---------|-------------|--------------|
| `PrelaunchPage` | `2268:35127` | Root frame — 1512 × 1077, `--color-brand-900` bg | Container |
| `BackgroundImage` | `2268:35129` | Full-bleed key-visual (shared with Homepage hero; see asset map) | Decorative, `aria-hidden` |
| `CoverGradient` | `2268:35130` | `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)` — darkens left ⅓ of viewport for text legibility | Decorative |
| `Headline` | `2268:35137` | "Sự kiện sẽ bắt đầu sau" / "Event starts in" — Montserrat 36/48 bold white, center | Non-interactive |
| `PrelaunchCountdown` | `2268:35138` | Row of 3 `CountdownUnit` components with 60 px gap | Reads live tick state |
| `CountdownUnit` × 3 | `2268:35139/35144/35149` | Pair of LED digit tiles + uppercase label (DAYS / HOURS / MINUTES) | Non-interactive |
| `LedTile` × 6 | `I2268:35141;186:2616` (+ siblings) | 77 × 123 glass-style tile: `opacity:0.5` white→white-10% gradient, 0.75 px cream border, 12 px radius, `backdrop-filter: blur(24.96px)` | Non-interactive |
| `LedDigit` | `I2268:35141;186:2617` | `Digital Numbers` 73.728 px, white, centered in each tile | Non-interactive |

Full visual specs live in [design-style.md](./design-style.md).

### Navigation Flow

- **Entry points**:
  - Direct URL — either `/` (if prelaunch replaces the homepage pre-event)
    or `/countdown` (dedicated route). Finalised in Plan Q2.
  - Marketing links shared externally (LinkedIn, email blasts, etc.).
- **Outgoing**:
  - T-0 → `/login` (or "Go to site" CTA → `/login`) — see Q5.
- **Auth**: Public — no auth required (differs from every other SAA screen).

### Visual Requirements

- **Breakpoints** per constitution §II: mobile `< 640 px`, tablet
  `≥ 640 px` (`sm:`), desktop `≥ 1024 px` (`lg:`).
- **Animations**: Minute-tick fade/flip on digit change is optional polish;
  respect `prefers-reduced-motion: reduce`.
- **Accessibility**: WCAG 2.2 AA. Headline is `<h1>`. LED digits + labels
  announced as a single `aria-live="polite"` region updating once per
  minute: e.g. `"Event starts in 0 days, 5 hours, 20 minutes"`. Digit
  tiles themselves are `aria-hidden="true"` (purely visual).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Countdown MUST compute remaining time from
  `NEXT_PUBLIC_EVENT_START_AT` (ISO 8601 string). Same env var as Homepage
  hero countdown — no new configuration surface. The variable is already
  declared in the Zod schema at
  [`src/libs/env/client.ts:12`](../../../src/libs/env/client.ts#L12)
  (`z.string().datetime().optional()`).
- **FR-002**: Countdown MUST tick at least once per minute while visible;
  MUST recompute on `visibilitychange` and `focus` events.
- **FR-003**: Display resolution MUST be **Days / Hours / Minutes** (no
  Seconds). Days clamps to `99` display maximum to fit 2 tiles.
- **FR-004**: At T-0 (remaining ≤ 0), the screen MUST transition per Q5
  resolution (redirect to `/login` OR show a "Vào sự kiện" CTA).
- **FR-005**: All text copy MUST come from `src/messages/{vi,en}.json`:
  - Unit labels (DAYS / HOURS / MINUTES) and the env-missing fallback
    **reuse the existing** `homepage.countdown.*` keys — already shipped
    in `src/messages/{vi,en}.json`.
  - The Prelaunch-specific copy adds **three new keys** per locale under
    `countdown.prelaunch.*`: `headline`, `meta.title`, `meta.description`.
  No duplicate `countdown.prelaunch.days` etc. — reuse `homepage.countdown.days`.
- **FR-006**: Unauthenticated visitors MUST be allowed (unlike every other
  screen). Auth gating in this project is per-page (each `page.tsx` calls
  `getUser()` + `redirect("/login")` itself; see
  [`middleware.ts`](../../../middleware.ts) — it only refreshes the
  Supabase session cookie, does not gate routes). The Prelaunch page
  therefore simply **omits** the `redirect("/login")` call — no middleware
  allowlist to maintain.
- **FR-007**: The screen MUST be SSR with proper HTTP cache headers — a
  `Cache-Control: public, s-maxage=60` is acceptable so the Cloudflare
  Worker edge caches the rendered HTML for 60 seconds during pre-launch
  traffic spikes.
- **FR-008**: At T-0, an HTTP-level redirect MUST apply on the server so
  new visits after launch never see the countdown (no flash).
- **FR-009**: Analytics: fire `prelaunch_view` on mount with
  `{ remaining_minutes: number }` dimension. Fire
  `prelaunch_launch_transition` when the T-0 transition triggers. Both
  event shapes MUST be added to the `AnalyticsEvent` union in
  [`src/libs/analytics/track.ts`](../../../src/libs/analytics/track.ts)
  (same pattern used for the `rules_*` events shipped with the Thể lệ
  screen). Wrap each `track(...)` call in `try/catch` so analytics
  failures never break navigation.

### Technical Requirements

- **TR-001**: Render as a Server Component with a single `"use client"`
  child (`<PrelaunchCountdown>`) handling the tick logic. Mirror the split
  already in place on Homepage (`Countdown.tsx` is client; rest is server).
- **TR-002**: Countdown logic MUST reuse / extract the existing
  [Countdown.tsx](../../../src/components/homepage/Countdown.tsx) tick
  engine. Factor the shared state calc into **`src/hooks/useCountdown.ts`**
  (per constitution §I — custom hooks live in `src/hooks/`, not `src/libs/`).
  The existing Homepage `<Countdown>` component refactors to consume the
  hook with **no API change** (props `{ eventStartAt, labels }` stay the
  same) — this is an internal refactor, not a breaking change.
- **TR-003**: The LED tile visual is **distinct** from Homepage hero's
  flip-clock tile
  ([CountdownTile.tsx](../../../src/components/homepage/CountdownTile.tsx)).
  Create a **new** component `<PrelaunchCountdownTile>` implementing the
  glass-style tile (see design-style §LedTile) — don't force the Homepage
  tile to absorb two visual variants.
- **TR-004**: Background image reuses
  `/images/homepage-hero.png` (already in the bundle — confirmed with Q7
  pending). No new media asset.
- **TR-005**: `Digital Numbers` font already wired via `--font-digital-numbers`
  in `globals.css` (fallback `"Courier New", monospace`). No new font load
  required.
- **TR-006**: Lighthouse performance ≥ 95 on desktop — mostly static
  content + one client island. LCP target = hero background image.
- **TR-007**: axe-core scan MUST pass with zero serious/critical violations.
  The `aria-live` region labelling is the key concern.
- **TR-008**: No DB calls. No Supabase requests. Screen is fully static
  beyond the tick state.
- **TR-009**: Responsive breakpoints MUST match constitution §II (`< 640 / sm: /
  lg:`), Tailwind utility classes only — no arbitrary breakpoint values.

### Data Requirements

No user input fields (read-only page). Display data is derived from:

| Source | Type | Purpose |
|--------|------|---------|
| `NEXT_PUBLIC_EVENT_START_AT` env var | ISO-8601 string | Launch timestamp — single source of truth for countdown target |
| `NEXT_LOCALE` cookie | `"vi" \| "en"` | Drives which message catalog `getMessages()` returns |
| `src/messages/{vi,en}.json → homepage.countdown.{days,hours,minutes,fallback}` | i18n | Unit labels + missing-env fallback — **reused from Homepage hero** (already shipped) |
| `src/messages/{vi,en}.json → countdown.prelaunch.headline` | i18n | Prelaunch headline ("Sự kiện sẽ bắt đầu sau" / "Event starts in") — **new key per locale** |
| `src/messages/{vi,en}.json → countdown.prelaunch.meta.title` | i18n | `<title>` used by `generateMetadata()` — new key per locale |
| `src/messages/{vi,en}.json → countdown.prelaunch.meta.description` | i18n | `<meta name="description">` used by `generateMetadata()` — new key per locale |

Derived display fields:

| Field | Format | Range |
|-------|--------|-------|
| `days` | two-digit string (`padStart(2, "0")`) | `"00"`–`"99"` (clamped to 99) |
| `hours` | two-digit string | `"00"`–`"23"` |
| `minutes` | two-digit string | `"00"`–`"59"` |
| `hasLaunched` | boolean (internal state) | true when `Date.now() >= target` |

### State Management

- **Server state**: None — page is a Server Component that pre-resolves
  locale copy via `getMessages()`. At request time the server reads
  `NEXT_PUBLIC_EVENT_START_AT` and can short-circuit to a redirect when
  `hasLaunched` is already true (FR-008).
- **Client state** (lives in `<PrelaunchCountdown>` only):
  - `remaining: { days: string; hours: string; minutes: string }` — derived
    each tick from `Date.now()` vs `target`.
  - `hasLaunched: boolean` — flips when `remaining` hits zero; triggers the
    T-0 transition per FR-004.
- **Global state**: None. The screen is intentionally independent of the
  auth session.
- **Loading state**: N/A — the countdown can render immediately with the
  server-computed initial `remaining`; no fetch-loading UI is required.
- **Error state**: Missing env var → render `00:00:00` + fallback copy
  (reuses existing `homepage.countdown.fallback` — `"Sự kiện đang được
  cập nhật."` / EN equivalent). No crash path.
- **Empty state**: N/A — the screen always has content.
- **Cache**: `Cache-Control: public, s-maxage=60` on the SSR response
  (FR-007). Client side: no localStorage / sessionStorage use.

### Key Entities

None — no DB model involved.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| (none) | — | No server API calls | — |

Countdown is driven entirely by `NEXT_PUBLIC_EVENT_START_AT`. No fetch
calls; no future API calls anticipated.

---

## Success Criteria

- **SC-001**: Prelaunch page renders the live countdown within 1 navigation
  step from the public URL in both `vi` and `en`, verified by a new
  Playwright spec `tests/e2e/countdown.spec.ts`.
- **SC-002**: `tests/e2e/countdown.a11y.spec.ts` (axe-core) passes with
  zero serious/critical violations at desktop 1440×900 + mobile 375×812.
- **SC-003**: Lighthouse ≥ 95 (performance, a11y, best-practices) on
  desktop.
- **SC-004**: Grep of the compiled bundle for "Sự kiện sẽ bắt đầu sau"
  returns only `src/messages/vi.json` (no hard-coded VI in `.tsx`).
- **SC-005**: Setting `NEXT_PUBLIC_EVENT_START_AT` to 1 minute in the
  future and waiting through T-0 transitions the page to the post-launch
  destination within 60 seconds (one tick).
- **SC-006**: On a warm cache, the HTML response arrives in ≤ 200 ms from
  the Cloudflare edge (FR-007 validation).

---

## Out of Scope

- **Seconds display** — Figma shows D/H/M only. Seconds would require a
  1-second tick, burning CPU and battery unnecessarily for a passive
  landing page.
- **Customisable launch message / admin CMS override** — Phase 2 concern.
- **Multiple sequential launch events** (e.g. prelaunch → pre-ceremony →
  post-ceremony) — Phase 2.
- **Animated launch reveal** (explosion, fireworks, etc.) — nice-to-have,
  not in the Figma source.
- **Newsletter signup form / "notify me when it launches"** — not in
  Figma.
- **i18n RTL support** — vi/en only.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] SCREENFLOW updated (row #11 discovered)
- [x] Homepage hero Countdown ships (provides the tick engine + env var)
- [x] Digital Numbers font token already declared in `globals.css`
  (fallback `Courier New`)
- [x] Background image `public/images/homepage-hero.png` exists
- [ ] Decision on Q1–Q7 below before `/momorph.plan`
- [ ] Decision on the auth-gate approach on the chosen route (per FR-006:
      the Prelaunch page page component simply omits `redirect("/login")`
      — no middleware change needed, since `middleware.ts` only refreshes
      the session cookie)

---

## Notes

### Open Questions (resolve during `/momorph.plan`)

- **Q1** *(Product)*: **Public or authenticated?** Figma suggests public
  (no header / profile menu / language toggle). Confirm visitors should
  NOT be forced through Google OAuth to see the countdown.
  - **Recommendation**: Public. Aligns with "marketing landing page"
    intent.

- **Q2** *(Product / UX)*: **Route placement** — does prelaunch live at
  `/` (replacing Homepage pre-event) OR at `/countdown` (dedicated)?
  - Option A: root swap with a feature-flag check in `src/app/page.tsx`
    — pre-event loads `<PrelaunchPage>`, post-event loads the normal
    Homepage.
  - Option B: dedicated `/countdown` route + a root redirect conditional
    on launch timestamp.
  - **Recommendation**: Option A (root swap) — matches the "holding page"
    mental model.

- **Q3** *(Tech)*: **Launch timestamp source** — reuse
  `NEXT_PUBLIC_EVENT_START_AT` or add a new `NEXT_PUBLIC_PRELAUNCH_END_AT`?
  - **Recommendation**: Reuse `NEXT_PUBLIC_EVENT_START_AT`. One source of
    truth prevents drift between Homepage hero countdown and this screen.

- **Q4** *(Design)*: **Seconds** — Figma shows D/H/M; Homepage hero also
  ships D/H/M/S. Do we align on D/H/M everywhere (remove seconds from
  Homepage), or accept the asymmetry?
  - **Recommendation**: Keep asymmetry. Homepage hero's seconds add
    excitement in the authenticated flow; the public prelaunch stays
    calm/static at minute resolution.

- **Q5** *(Product / UX)*: **T-0 behaviour**:
  - Option A: hard redirect to `/login` (matches "public holding page"
    → "authenticated app" transition).
  - Option B: swap the countdown for a "Vào sự kiện" CTA that the user
    must click (gives them agency, feels less jarring).
  - Option C: auto-refresh into a "We're live" state on the same URL
    (if Q2 is Option A root-swap).
  - **Recommendation**: Option C if root-swap is chosen; otherwise B.
    Minimises surprise redirects.

- **Q6** *(Copy)*: **EN headline** — "Event starts in" (mirrors VI) vs.
  "Launching in" vs. "The event begins in". Need final wording from
  Marketing.

- **Q7** *(Design)*: **Background asset** — confirm reuse of
  `/images/homepage-hero.png` (same key-visual as Homepage hero + Root
  Further), OR is there a distinct prelaunch export?
  - **Recommendation**: Reuse. Figma node `2268:35129` appears to load
    the same key-visual. Note: the existing asset is **4.4 MB** (large
    for a public-facing LCP image). Consider shipping an additional
    `<picture>`-source-set or AVIF/WebP optimised derivative during Plan.

- **Q8** *(Product / UX)*: **Site chrome** — the Figma frame has **no**
  `SiteHeader`, `SiteFooter`, or `QuickActionsFab`. Confirm the Prelaunch
  page renders chromeless (no nav links, no language toggle in-page, no
  profile menu). A pre-event visitor therefore has no language switcher
  surfaced — is that acceptable, or should a minimal toggle appear in the
  corner?
  - **Recommendation**: Ship chromeless for MVP. Add a floating corner
    language toggle as a Phase-2 polish if analytics show non-VI traffic
    on the prelaunch page.

- **Q9** *(Tech)*: **Root-swap implications** — if Q2 resolves to Option A
  (root swap), the existing authenticated
  [`src/app/page.tsx`](../../../src/app/page.tsx) must be rewritten to
  conditionally branch:
  - `now < target` → render `<PrelaunchPage>` (public, chromeless)
  - `now >= target` → require auth + render the current Homepage
  This mixes a public and an authenticated flow in one route file, which
  is unusual. Alternative: lift the dispatch into `middleware.ts`
  (inspect timestamp, rewrite URL to `/countdown` pre-event). Confirm
  approach during Plan.

### Assumptions (until Q1–Q7 resolved)

- The screen ships as a **public root replacement** at `/` when
  `now < NEXT_PUBLIC_EVENT_START_AT` (Q1 + Q2).
- Reuses existing env var (Q3) and existing background asset (Q7).
- T-0 behaviour is "same URL swap to authenticated Homepage" (Q5 Option C).
- Copy: `"Sự kiện sẽ bắt đầu sau"` for VI, `"Event starts in"` for EN
  until Marketing confirms (Q6).
- Digital Numbers font continues to fall back to `Courier New` tabular-nums
  until the licensed font is added — same behaviour as Homepage hero.
