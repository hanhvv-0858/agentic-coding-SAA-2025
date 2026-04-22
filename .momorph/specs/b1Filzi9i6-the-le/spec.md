# Feature Specification: Thể lệ (Event Rules)

**Frame ID**: `b1Filzi9i6`
**Frame Name**: `Thể lệ UPDATE`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-04-18
**Status**: Draft

---

## Overview

Static, read-only "Thể lệ" (Rules) panel explaining how the SAA 2025 Kudos
programme works. Presented as a right-anchored side panel / modal with:

1. **NGƯỜI NHẬN KUDOS** — four Hero tier badges (New 1–4 / Rising 5–9 / Super
   10–20 / Legend 20+ senders) shown on the receiver's profile. **Threshold
   boundary clarification** (round 2026-04-22): ranges are inclusive at the
   low end, exclusive at the high end — Super is 10–19 (not 10–20) and
   Legend is ≥ 20; "10–20" in the UI copy is a typography shortcut. The
   computation (distinct senders, anonymous kudos included) lives in the
   Kudos Live board spec
   ([MaZUn5xHXZ/spec.md §"Honour tier auto-computation"](../MaZUn5xHXZ-kudos-live-board/spec.md#honour-tier-auto-computation-resolved-2026-04-22))
   and is implemented via migration 0018 (`honour_tier_autocompute.sql`) —
   this screen only *renders* the rule, it does not own the computation.
2. **NGƯỜI GỬI KUDOS** — every 5 ❤ on a sent Kudo opens a Secret Box with a
   chance at one of six collectible badges (REVIVAL, TOUCH OF LIGHT, STAY GOLD,
   FLOW TO HORIZON, BEYOND THE BOUNDARY, ROOT FURTHER). Full set → mystery gift.
3. **KUDOS QUỐC DÂN** — top 5 most-hearted Kudos win the special "Root Further"
   prize from SAA 2025.

A footer action bar has two buttons: **Đóng** (close panel, `router.back()`)
and **Viết KUDOS** (primary, opens the compose-kudo route). No user input, no
DB — content is i18n-driven in `vi` + `en`.

The screen is authenticated (part of the post-login app shell); unauthenticated
visitors are redirected to `/login` per site-wide auth gating.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sunner reads the Kudos rules (Priority: P1)

As a logged-in Sunner, I want to read the programme rules so I understand how
to earn Hero badges, unlock Secret Box collectibles, and win the Kudos Quốc
Dân prize before sending or receiving a Kudo.

**Why this priority**: This is the primary purpose of the screen and the only
entry point explaining Hero tiers, Secret Box mechanics, and the KUDOS QUỐC
DÂN prize. It is also an MVP requirement per SCREENFLOW item #10.

**Independent Test**: Navigate to the rules screen from any entry (homepage
nav, live board footer, compose header). Verify that all three sections
(Receiver / Sender / Quốc Dân) render with correct copy in the active locale.

**Acceptance Scenarios**:

1. **Given** a Sunner is logged in, **When** they navigate to the rules panel,
   **Then** the panel renders the title "Thể lệ" + three content sections +
   two footer buttons in the active locale.
2. **Given** the active locale is `vi`, **When** the panel renders, **Then**
   all copy matches `src/messages/vi.json → rules.*` exactly.
3. **Given** the active locale is `en`, **When** the panel renders, **Then**
   all copy matches `src/messages/en.json → rules.*` exactly.
4. **Given** the panel content exceeds the viewport height, **When** the user
   scrolls, **Then** the content area scrolls independently and the footer
   button bar remains visible (sticky footer).

---

### User Story 2 — Close the panel and return to caller (Priority: P1)

As a Sunner who has finished reading the rules, I want to close the panel
easily and return to wherever I came from.

**Why this priority**: Without a working Close action the panel becomes a
dead-end; this is the minimum interaction to make the screen shippable.

**Independent Test**: Open the rules panel from the homepage, click **Đóng**,
and verify the URL/UI returns to the homepage in the same scroll position.

**Acceptance Scenarios**:

1. **Given** the panel is open, **When** the user clicks **Đóng**, **Then**
   the panel closes via `router.back()` and focus returns to the trigger
   element that opened it.
2. **Given** the panel is open, **When** the user presses `Esc`, **Then** the
   panel closes with the same behaviour as clicking **Đóng**.
3. **Given** the panel was opened via a deep link (no prior history entry),
   **When** the user clicks **Đóng**, **Then** the app navigates to `/`
   (Homepage) as a fallback.

---

### User Story 3 — Jump to compose a Kudo (Priority: P1)

As a Sunner motivated after reading the rules, I want a one-click shortcut to
start writing a Kudo.

**Why this priority**: Maintains funnel momentum — reading the rules
frequently precedes sending a Kudo, so the primary CTA must be present.

**Independent Test**: Open the rules panel, click **Viết KUDOS**, verify
the app navigates to the compose-kudo route (stub allowed until Viết Kudo ships).

**Acceptance Scenarios**:

1. **Given** the panel is open, **When** the user clicks **Viết KUDOS**,
   **Then** the app navigates to `/kudos/new` (Viết Kudo screen).
2. **Given** the compose-kudo route is not yet implemented, **When** the user
   clicks **Viết KUDOS**, **Then** the app navigates to the existing route
   stub and does not 404.

---

### User Story 4 — Keyboard & screen-reader accessibility (Priority: P2)

As a Sunner using a keyboard or screen reader, I want to navigate and read
the rules without visual-only cues.

**Why this priority**: WCAG 2.2 AA is a constitution requirement. Not blocking
happy-path release but must ship before GA.

**Independent Test**: Tab through the panel; verify focus order, focus-visible
outlines, `aria-labelledby`, heading hierarchy, and `Esc` dismiss.

**Acceptance Scenarios**:

1. **Given** the panel opens, **When** it mounts, **Then** focus is moved to
   the panel container (or the "Thể lệ" title) and `role="dialog"` +
   `aria-modal="true"` + `aria-labelledby="rules-title"` are set.
2. **Given** the panel is open, **When** the user presses Tab, **Then** focus
   cycles through: content region → Close → Viết KUDOS → (trap back to start).
3. **Given** the panel uses a screen reader, **When** the reader announces
   the structure, **Then** the heading hierarchy is: H1 "Thể lệ" → H2 section
   headings (3) → content, with no heading-level skips.
4. **Given** the user has `prefers-reduced-motion`, **When** the panel opens,
   **Then** no slide/fade animation plays.

---

### User Story 5 — Responsive on tablet / mobile (Priority: P2)

As a Sunner on a narrow viewport (mobile or tablet), I want the rules to stay
readable and every interactive element to remain tappable.

**Why this priority**: SAA 2025 is web-only; responsive web design is the
mobile story per constitution. Secondary because the design viewport is
desktop-first (1440×1024).

**Independent Test**: Resize viewport to 375 px (mobile), 800 px (tablet),
1440 px (desktop). Verify no horizontal overflow, badge grid reflows, and
footer buttons stay tappable (≥ 44 × 44 px).

**Acceptance Scenarios**:

1. **Given** the viewport is `< 640 px` (mobile, per constitution Principle II),
   **When** the panel renders, **Then** it spans the full viewport width
   (panel fills the screen, no side gap), and the 6-badge grid reflows from
   3×2 → 2×3 (2 columns × 3 rows).
2. **Given** the viewport is in the tablet range `≥ 640 px` and `< 1024 px`,
   **When** the panel renders, **Then** the panel occupies a centred
   `max-w-[553px]` column (full-height modal sheet).
3. **Given** the viewport is `≥ 1024 px`, **When** the panel renders, **Then**
   it matches the Figma baseline (right-anchored 553-wide panel over dimmed
   backdrop; height capped to viewport via `max-h-dvh`).
4. **Given** any viewport, **When** a user taps **Đóng** or **Viết KUDOS**,
   **Then** the hit area is ≥ 44 × 44 px (constitution Principle II touch-target rule).

---

### Edge Cases

- **Long scroll content**: Panel content is ~1386 px tall at desktop — the
  content region MUST scroll independently of the footer (footer stays pinned).
- **Missing translation key**: If an `rules.*` key is missing, render the
  English fallback (or the key itself) and log a warning — do not crash.
- **Deep link with no history**: Opening `/the-le` directly (no `document.referrer`
  and empty `history.length`) must not leave **Đóng** in a dead state — falls
  back to `/`.
- **Viết KUDOS not implemented**: Until `/kudos/new` ships, the CTA should still
  resolve to a real route (stub page) rather than a 404.
- **Reduced motion**: No open/close animation when `prefers-reduced-motion`.
- **RTL locales**: Out of scope (vi/en only), but the layout should not break
  if `dir="rtl"` is applied (use logical properties where feasible).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Description | Interactions |
|-----------|-------------|--------------|
| RulesPanel (`3204:6052`) | Right-anchored panel (553 × 1410) with dark-navy surface `#00070C` | Container; traps focus when modal |
| RulesTitle (`3204:6055`) | "Thể lệ" headline, 45 / 52 Montserrat bold, `#FFEA9E` | Non-interactive |
| RulesContent (`3204:6053`) | Scrollable info block, 473 wide, `gap:24px`, column flex | Vertical scroll when overflow |
| ReceiverSection (`3204:6131`) | Heading + intro + 4 HeroTierCards | Non-interactive |
| HeroTierCard × 4 (`3204:6161/6170/6179/6188`) | Tier pill (126 × 22, border #FFEA9E) + count label + description | Non-interactive (hover card may follow in Phase 2) |
| SenderSection (under `3204:6076`) | Heading + intro + badge grid + outro | Non-interactive |
| BadgeGrid (`3204:6079 → 6080`) | 2-row × 3-col grid, gap 16/24 | Non-interactive (Phase 2: click → Secret Box story) |
| CollectibleBadge × 6 (`3204:6082/6087/6086/6083/6084/6088`) | 64 × 64 circle (border 2 px #FFF) + 11–12 px label — shared atom per TR-005 | Non-interactive |
| NationalKudosSection (text `3204:6090/6091`) | "KUDOS QUỐC DÂN" heading + body | Non-interactive |
| RulesFooter (`3204:6092`) | Footer action bar, gap 16, row flex | Contains two buttons |
| CloseButton (`3204:6093`) | Outlined secondary: icon `Close` + text "Đóng" | Click → close panel |
| WriteKudosButton (`3204:6094`) | Primary: icon `Pen` + text "Viết KUDOS" on `#FFEA9E` | Click → `/kudos/new` |

Full visual specs for every component above live in
[design-style.md](./design-style.md).

### Navigation Flow

- **Entry points** (confirmed from SCREENFLOW + the-le.md):
  - Homepage SAA header/nav: "Thể lệ" (new nav link to add)
  - Sun* Kudos Live board footer / header (when shipped)
  - Viết Kudo "Xem thể lệ" link (when shipped)
  - Direct URL: `/the-le` (if route-based) or modal query param (if modal)
- **Outgoing**:
  - Đóng → `router.back()` with `/` fallback
  - Viết KUDOS → `/kudos/new` (Viết Kudo)
- **Auth**: Authenticated only. Unauthenticated → redirect to `/login`
  (same pattern as `/awards`).

### Visual Requirements

- **Breakpoints** (per constitution Principle II): mobile `< 640 px` (base),
  tablet `≥ 640 px` (`sm:`) to `< 1024 px`, desktop `≥ 1024 px` (`lg:`).
- **Animations**: None required. If the panel is implemented as a modal,
  slide-in from right + backdrop fade at 200 ms ease-out, disabled when
  `prefers-reduced-motion: reduce`.
- **Accessibility**: WCAG 2.2 AA. `role="dialog" aria-modal="true"
  aria-labelledby="rules-title"`, focus trap, Esc dismiss, body scroll lock
  while open, visible focus ring on interactive elements.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The rules surface MUST be reachable from at least the Homepage
  (header link "Thể lệ") once shipped; additional entry points wired as
  dependent screens land.
- **FR-002**: The surface MUST render as either a modal/side-panel over the
  caller OR a dedicated route `/the-le` — exact mode TBD via open question
  Q1 (see Notes). Whichever is chosen, **Đóng** must return the user to a
  sensible prior state.
- **FR-003**: All displayed copy MUST come from `src/messages/{vi,en}.json`
  under the `rules.*` namespace. No hard-coded Vietnamese/English strings.
- **FR-004**: The content section MUST render four Hero tier rows (New,
  Rising, Super, Legend) in the order defined in design.
- **FR-005**: The content section MUST render six collectible badges in
  order: REVIVAL, TOUCH OF LIGHT, STAY GOLD, FLOW TO HORIZON, BEYOND THE
  BOUNDARY, ROOT FURTHER.
- **FR-006**: The content area MUST scroll independently of the footer
  button bar; footer stays visible at all times.
- **FR-007**: The Close button MUST close the panel (or navigate back) and
  return focus to the opener.
- **FR-008**: The Viết KUDOS button MUST navigate to `/kudos/new`.
- **FR-009**: `Esc` key MUST close the panel (when implemented as modal).
- **FR-010**: Unauthenticated visitors MUST be redirected to `/login`.
- **FR-011**: The language toggle in the site header MUST update all rules
  copy live on locale change (i18n refetch).
- **FR-012**: *(Modal mode only — Q1 Option A)* Keyboard focus MUST be
  trapped within the panel while the modal is open. Tab / Shift-Tab cycles
  through interactive elements; no focus should escape to the caller page.
- **FR-013**: *(Modal mode only)* Page body scroll MUST be locked while the
  modal is open (e.g., `overflow: hidden` on `<html>`) and restored on
  close — preventing the background page from scrolling behind the panel.
- **FR-014**: *(Modal mode only)* Clicking the dimmed backdrop MUST dismiss
  the panel with the same behaviour as the Close button / Esc key (same
  focus return, same `router.back()` fallback).
- **FR-015**: Analytics events MUST fire:
  - `rules_view` on mount (dimensions: `{ source?: "homepage"|"live-board"|"compose"|"direct" }`),
  - `rules_close` on dismiss (dimensions: `{ via: "button"|"esc"|"backdrop" }`),
  - `rules_cta_write_kudos` on Viết KUDOS click.
  Wire through the existing `@/libs/analytics/track` helper. Failure of
  analytics MUST NOT crash the page.

### Technical Requirements

- **TR-001**: All rendering is SSR — the screen is a Server Component,
  consistent with Homepage and Awards. No runtime data fetch.
- **TR-002**: Icons MUST use the existing `<Icon />` component (constitution
  rule — no raw `<svg>` or `<img>` icons). The pencil icon **already exists**
  in the registry as `name="pencil"` (not `"pen"`); reuse it for the Viết
  KUDOS CTA. The `close` (X) icon is **NOT in the registry** and MUST be
  added as a new entry in [`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx)
  (24×24, 2px stroke, `currentColor`) before this screen can render.
- **TR-003**: The existing `PrimaryButton` has `variant: "solid" | "outline"`
  sized for hero CTAs (`h-[60px] px-6 py-4`, `text-[22px] leading-7`) and
  its `outline` treatment (`border-2` + transparent bg + cream text) does
  **NOT** match the Đóng button's treatment (`border-1 #998C5F` + `bg
  rgba(255,234,158,0.10)` + **white** text, `h-14 text-base`). Therefore:
  - **Viết KUDOS** (primary cream, but h-14 / 16-px text) → extend
    `PrimaryButton` with a `size?: "md" | "lg"` prop (`lg` keeps current
    behaviour, `md` = Figma footer-button sizing). MUST reuse existing
    `--color-accent-cream-hover` / `--color-accent-cream-active` tokens.
  - **Đóng** (secondary outlined, alpha-10 cream bg, white label) → either
    a new `variant: "secondary"` on `PrimaryButton` OR a new
    `<SecondaryButton />` primitive. Decision in Plan (see Q10).
- **TR-004**: Hero tier pills (4×) MUST be implemented as a shared
  `<HeroBadge tier="new|rising|super|legend" />` atom — the same atom is
  already listed as reusable for Profile / Hover-danh-hiệu overlays in
  `.momorph/contexts/screen_specs/the-le.md`.
- **TR-005**: Collectible badges (6×) MUST be implemented as a shared
  `<CollectibleBadge name="revival|touch-of-light|stay-gold|flow-to-horizon|beyond-the-boundary|root-further" />`
  atom — will be reused by Profile + Secret Box flow.
- **TR-006**: Lighthouse performance ≥ 95 on desktop (static content, no JS
  required beyond the Close/Esc handler).
- **TR-007**: axe-core automated scan MUST pass with zero violations (same
  CI gate as `spec SC-003` on Homepage).
- **TR-008**: No Supabase / DB calls in MVP. Content lives entirely in i18n
  catalogues. CMS/admin-campaign sourcing is a Phase 2 concern.
- **TR-009**: Responsive breakpoints MUST match constitution Principle II:
  Mobile `< 640 px`, Tablet `≥ 640 px` (`sm:`) to `< 1024 px` (`lg:`),
  Desktop `≥ 1024 px` (`lg:`). Tailwind `sm:` / `md:` / `lg:` prefixes only
  — no arbitrary breakpoint values.
- **TR-010**: Page MUST be a Server Component. Only the Close-panel /
  Esc-handler + focus-trap sits in a thin `"use client"` wrapper (if the
  modal option is chosen). No `useEffect`-based data fetching (constitution
  Principle V).
- **TR-011**: `yarn lint` + `yarn build` must pass with zero errors (pre-deploy
  gate per constitution Development Workflow).

### Data Requirements

Static screen — no user input fields. All display text comes from i18n
catalogs (`src/messages/{vi,en}.json`). Expected new i18n namespace
`rules.*` with approximately the following keys (finalise in `/momorph.plan`):

| Key | Type | Purpose |
|-----|------|---------|
| `rules.title` | string | Panel title "Thể lệ" |
| `rules.receiver.heading` | string | Section 1 heading |
| `rules.receiver.intro` | string | Section 1 intro copy |
| `rules.receiver.tiers.{new|rising|super|legend}.label` | string | Pill label per tier |
| `rules.receiver.tiers.{...}.count` | string | "Có 1-4 người gửi Kudos cho bạn" etc. |
| `rules.receiver.tiers.{...}.description` | string | One-liner below the count |
| `rules.sender.heading` | string | Section 2 heading |
| `rules.sender.intro` | string | Section 2 intro copy |
| `rules.sender.badges.{revival|touch-of-light|stay-gold|flow-to-horizon|beyond-the-boundary|root-further}.label` | string | Badge caption |
| `rules.sender.outro` | string | "Những Sunner thu thập trọn bộ 6 icon…" |
| `rules.quocDan.heading` | string | "KUDOS QUỐC DÂN" |
| `rules.quocDan.body` | string | Quốc Dân body paragraph |
| `rules.actions.close` | string | "Đóng" |
| `rules.actions.writeKudos` | string | "Viết KUDOS" |

### State Management

- **Server state**: None — content is pre-resolved from i18n at render time.
- **Client state** (only if modal mode per Q1):
  - `isOpen: boolean` — controlled via Next.js intercepting route segment or
    a local `useState` if the modal is component-level.
  - `prefers-reduced-motion: boolean` — derived via `matchMedia` to decide
    whether to animate open/close.
- **Loading state**: N/A (no fetch).
- **Error state**: N/A for content; if a new i18n key is missing,
  `getMessages()` returns `undefined` and the UI MUST render a graceful
  fallback (either the key name or the English copy). A console warning is
  acceptable in development.
- **Empty state**: N/A — copy always present.
- **Global state**: None. Uses existing session cookie + `NEXT_LOCALE` cookie.

### Key Entities *(if feature involves data)*

None. Read-only static content — no DB entities consumed for MVP.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| (none) | — | Content served from i18n catalogs | — |

No API calls in MVP. A future `GET /api/rules/current` is possible when the
admin Campaign settings drive rule content, but that is Phase 2.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Rules panel is reachable and fully rendered from Homepage in
  both `vi` and `en` within 1 click — verified by manual smoke + a new e2e
  test `tests/e2e/the-le.spec.ts`.
- **SC-002**: axe-core scan of `/the-le` (or modal-open state) returns zero
  violations.
- **SC-003**: Lighthouse performance ≥ 95, accessibility ≥ 95, best-practices
  ≥ 95 on desktop.
- **SC-004**: 100% of copy renders via i18n — grep of the compiled bundle for
  any of the Vietnamese section strings returns zero hits outside
  `src/messages/vi.json`.
- **SC-005**: Close via click, Esc, and browser back button all return the
  user to the caller screen.
- **SC-006**: `Viết KUDOS` button navigates to `/kudos/new` (route exists as
  stub if Viết Kudo is not yet shipped).

---

## Out of Scope

- CMS/admin-driven rule editing — deferred to Phase 2 (linked to the Admin
  `Setting - Campaign` screens).
- Hero badge hover cards (`Hover danh hiệu Legend/New/Rising/Super Hero`
  overlays `XI0QKVv1qZ / twC9br89ra / IjeDnHmzou / d6zEZ9ccoX`) — separate
  overlays, tracked independently.
- Secret Box animation flow (`_YLVd7Ij6e`, etc.) — deferred per SCREENFLOW.
- RTL locale support — vi/en only.
- Analytics events beyond the three defined in FR-015
  (`rules_view`, `rules_close`, `rules_cta_write_kudos`) — wait for the
  project-wide analytics spec.
- `Tiêu chuẩn cộng đồng` screen (`Dpn7C89--r`) — sibling content page, own
  spec.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] Screen flow documented (`.momorph/contexts/screen_specs/SCREENFLOW.md`
      and `the-le.md`)
- [x] Homepage SAA shipped — provides `SiteHeader`/`SiteFooter`/`Icon`/
      `PrimaryButton` primitives + `messages.*` infrastructure.
- [x] Awards System shipped — provides precedent for an authenticated SSR
      content page, language toggle wiring, and the site shell layout.
- [ ] `/kudos/new` route stub (minimally a page placeholder) — required for
      the Viết KUDOS CTA to resolve to a real route instead of a 404.
- [ ] `HeroBadge` atom + `CollectibleBadge` atom (new shared components).
- [ ] 4 Hero tier media assets + 6 collectible badge media assets exported
      from Figma and placed under `public/images/the-le/`. Capture in
      `assets-map.md` during planning.

---

## Notes

### Open Questions (resolve during `/momorph.plan`)

- **Q1** *(Product / UX)*: Modal/side-panel OR dedicated route?
  - **Option A** (matches Figma behaviour — "Click 'Đóng': đóng panel"):
    implement as an intercepting modal route (`/(authenticated)/@modal/(.)the-le`)
    so the URL changes but the caller stays mounted. Allows deep links + back
    button + backdrop dismiss.
  - **Option B**: dedicated full-page route `/the-le` with the 553-wide panel
    centered over a dark background. Simpler to ship, but loses the "slide
    over caller" affordance.
  - **Recommendation**: Option A for parity with Figma behaviour; fall back
    to Option B if Next.js intercepting routes conflict with the existing
    SSR auth-gate middleware. Confirm with UX.

- **Q2** *(Design)*: Collectible badge media — do we have final exports for
  all 6 icons (REVIVAL / TOUCH OF LIGHT / STAY GOLD / FLOW TO HORIZON /
  BEYOND THE BOUNDARY / ROOT FURTHER)? Figma shows image-based badges
  composited from multiple layers; we need flattened PNG/SVG per badge.

- **Q3** *(Design)*: Hero tier pill uses a decorative glow image behind the
  border (`Root further mo rong 2/3`). Is that a shared asset with the
  Profile's hero-badge row? Needed to decide whether the `<HeroBadge />` atom
  should include the glow or receive it as a slot.

- **Q4** *(Product)*: "Viết KUDOS" button text is in Vietnamese UPPERCASE.
  In the `en` locale should this be "WRITE KUDOS" (ALL CAPS), "Write Kudos",
  or keep "Viết KUDOS"? Affects i18n key casing.

- **Q5** *(Tech)*: The frame spec on `B.2_Button viết kudos` declares
  `linkedFrameId=520:11602` / `linkedFrameName="Viết Kudo"`, but the MVP
  inventory maps "Viết Kudo" to frame `ihQ26W78P2`. Flagged by the screenflow
  agent. Before implementing, confirm whether `520:11602` is a duplicate or a
  legacy draft.

- **Q6** *(UX)*: On mobile (`< 640 px`), should the footer buttons stack
  vertically (`flex-col`, Đóng on top for primary-below convention, or
  Đóng on bottom following iOS sheet patterns) OR stay side-by-side with
  smaller padding? Figma does not provide a mobile variant. Current default
  in design-style.md is stack with Đóng on top.

- **Q7** *(Design)*: Figma marks most body copy (`3204:6078`, `3204:6089`,
  `3204:6091`, `3204:6133`, `3204:6162`, `3204:6182`, `3204:6191`) as
  `text-align: justified`. In web we recommend `text-left` for readability
  (especially on narrow viewports and with Vietnamese line-breaking). Confirm
  UX accepts `text-left` as the implementation default.

- **Q8** *(Design)*: Hover / active background colors for Đóng (secondary
  outlined button) and Viết KUDOS (primary cream button) are **not specified
  in Figma**. design-style.md proposes values that align with the existing
  `PrimaryButton` hover treatment. Confirm the exact tokens during Plan,
  or accept the proposed values (rgba(255,234,158,0.18 / 0.25) for Đóng;
  #FFD86B / #E6C357 for Viết KUDOS).

- **Q9** *(Design)*: The badge label in Figma is spelled "ROOT FUTHER" on
  the layer name `MM_MEDIA_ Badge ROOT FUTHER` (`3204:6088`) but the actual
  rendered character is "ROOT FURTHER" (with second R). All spec documents
  use "ROOT FURTHER" (correct spelling). Confirm the user-facing spelling
  is indeed "ROOT FURTHER".

- **Q10** *(Tech)*: Secondary-button implementation path. The existing
  `PrimaryButton` `outline` variant does not match the Đóng visual
  treatment (see TR-003). Options:
  - **A**: Extend `PrimaryButton` with a `variant: "secondary"` + a `size: "md"`
    prop. Keeps one component; adds mild complexity.
  - **B**: Introduce a new `<SecondaryButton />` primitive in
    `src/components/ui/`. Cleaner but creates two button components to
    maintain.
  - **Recommendation**: Option A — matches the project's preference for
    extending existing primitives over spawning new ones.

- **Q11** *(Design)*: Body-copy weight. Figma marks **all** body copy at
  `font-weight: 700` (bold), whereas the shipped Awards page uses
  `font-normal` for paragraph text
  (`src/components/awards/AwardContent.tsx:50`). Current design-style.md
  defers to Figma (`font-bold`). Confirm:
  - **Option A** (follow Figma): render body copy `font-bold` — visually
    louder, matches the Figma export pixel-for-pixel.
  - **Option B** (follow project precedent): render body copy `font-normal`
    — reads better, consistent with Awards. Hero-tier-count labels /
    badge labels stay bold.
  - **Recommendation**: **Option B** for consistency with Awards. Flag this
    as a project-wide decision since it affects any future rules/content
    page generated from Figma.

### Assumptions

- The panel is a modal (Option A above) — planning proceeds on this assumption
  and switches to Option B only if Q1 resolves differently.
- Copy length fits within the 1386 px content height at desktop; the content
  area still scrolls on narrower viewports or when translations expand (e.g.,
  vi → en typically adds ~10–15% length in this project).
- Icon registry: verified in [`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx).
  **`pencil` is registered** (reuse for Viết KUDOS — the Figma layer is named
  `MM_MEDIA_Pen` but we map to the existing `pencil` name). **`close` is NOT
  registered** — add it in the same commit that introduces the rules screen.
- Analytics events are formalized in FR-015 (three events wired via
  `@/libs/analytics/track`). Event name normalized to `rules_cta_write_kudos`
  (plural `kudos`, matching the button label).
