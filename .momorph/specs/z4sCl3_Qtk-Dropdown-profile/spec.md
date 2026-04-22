# Feature Specification: Dropdown-profile

**Frame ID**: `z4sCl3_Qtk`
**Figma frame name**: Dropdown-profile
**Created**: 2026-04-22
**Status**: Draft (spec-only; no code yet)

---

## Overview

### Feature name
Account dropdown menu (a.k.a. "Dropdown-profile") — a small two-item overlay surfaced from the header's account/avatar trigger. Gives the signed-in Sunner one click into their profile page and one click to log out.

### Purpose
Provide **one canonical affordance** for the two most common account-scope actions: view my profile, and end my session. Keeping them in a single lightweight dropdown — versus scattered across the nav — matches the "simple internal tool" scope of SAA 2025.

### Target user
Signed-in Sunner (internal community member) on any authenticated page of the web app. The [iOS] native variants are **out of scope** per constitution Project Scope.

### Business context
- Member of the **dark-navy listbox family** shared with `Language Dropdown`, `FilterDropdown`, `HashtagPicker`. Visual/interaction consistency is the primary value; the feature itself is tiny.
- Logout flow must invalidate the Supabase Auth session and redirect to the login page per constitution §IV Security.

---

## User Scenarios & Testing

### US1 — Open the menu and navigate to Profile (Priority: P1) 🎯 MVP

**As a** signed-in Sunner
**I want to** click my avatar in the header and land on my profile page
**So that** I can view or edit my identity details without hunting for a menu entry

#### Acceptance Scenarios

**Scenario 1 (Happy path)**
- **Given** the user is signed in and on any authenticated page
- **When** they click the avatar trigger in the header
- **Then** the `Dropdown-profile` panel opens anchored below the trigger, with the "Profile" item rendered in its default state and "Logout" directly beneath.

**Scenario 2 (Profile navigation)**
- **Given** the dropdown is open
- **When** the user clicks "Profile" (or focuses it and presses `Enter` / `Space`)
- **Then** the menu closes and the app navigates to `/profile` (route confirmed — existing `src/app/profile/page.tsx`).

**Scenario 3 (Outside click closes the menu)**
- **Given** the dropdown is open
- **When** the user clicks anywhere outside the panel
- **Then** the menu closes without navigation; focus returns to the avatar trigger.

**Scenario 4 (Esc closes the menu)**
- **Given** the dropdown is open and an item is focused
- **When** the user presses `Esc`
- **Then** the menu closes; focus returns to the avatar trigger.

---

### US2 — Log out from the account menu (Priority: P1)

**As a** signed-in Sunner
**I want to** end my session in one click
**So that** I can hand the device back or switch accounts without manually clearing cookies

#### Acceptance Scenarios

**Scenario 1 (Happy path)**
- **Given** the dropdown is open
- **When** the user clicks "Logout" (or focuses it and presses `Enter` / `Space`)
- **Then** the form submits to the `signOut` **Server Action** at `@/libs/auth/signOut.ts`, which ends the Supabase session server-side (clearing the HttpOnly session cookies) and issues a `redirect("/login")`. The browser unloads the current page.

**Scenario 2 (Logout failure — Supabase unreachable)**
- **Given** logout is in flight
- **When** the Supabase call throws inside the Server Action
- **Then** the Server Action **swallows the error** and still redirects to `/login` (see `signOut.ts` comments — the intent is to match the browser view to the user's request; middleware session-refresh re-prompts on the next request). No user-facing toast is shown — the user lands on `/login`.

**Scenario 3 (Double-click prevention)**
- **Given** the user clicks "Logout" once
- **When** they click "Logout" again while the form submission is pending
- **Then** the second click is a no-op — the browser's native `<form>` submission serialises multiple submits automatically, so no explicit `aria-disabled` wiring is needed.

---

### US3 — Keyboard & screen-reader accessibility (Priority: P2)

**As a** keyboard-only or screen-reader Sunner
**I want to** open, navigate, and dismiss the account menu without a mouse
**So that** I have equal access to profile and logout

#### Acceptance Scenarios

**Scenario 1 — P1 (Open via keyboard)**
- **Given** the avatar trigger has focus
- **When** the user presses `Enter` / `Space`
- **Then** the menu opens and focus lands on the first item ("Profile"), which shows a visible focus ring (`outline 2 px var(--color-accent-cream)` + offset 2 px).

**Scenario 2 — P3 nice-to-have (Arrow-key navigation)**
- **Given** the menu is open and an item is focused
- **When** the user presses `ArrowDown` / `ArrowUp`
- **Then** focus moves to the next / previous item with roving tabindex.

> **Note**: Not a P1 gate — default `Tab` / `Shift+Tab` traversal between items is acceptable for MVP and matches the existing `ProfileMenu.tsx` behaviour (see FR-007). Upgrade if a11y audit requests it.

**Scenario 3 — P3 nice-to-have (Tab leaves the menu and closes it)**
- **Given** the last item has focus
- **When** the user presses `Tab`
- **Then** focus moves to the next focusable element outside the menu AND the menu closes.

> **Note**: Not required for MVP (see FR-006). `Esc` + outside-click handle dismissal for the common cases; Tab-out auto-close mirrors `HashtagPicker` and may be adopted later for consistency.

---

### Edge Cases

- **Session expires while menu is open**: the app detects the expired session (next server action returns 401) → middleware redirects to login → dropdown unmounts naturally. No special UI handling needed.
- **User is on the profile page already and clicks "Profile"**: navigation to `/profile` is a no-op (Next.js router dedupes), the menu still closes. Acceptable behaviour.
- **Reduced motion** (`prefers-reduced-motion: reduce`): open/close transition + text-shadow transitions are skipped (`motion-safe:` gating).
- **Mobile viewport (< 640 px)**: panel still anchors below the trigger; no full-sheet variant. Touch-target ≥ 56 × 119 px — constitution §II satisfied.

---

## UI/UX Requirements

Visual specs are in [design-style.md](design-style.md). This spec only captures **functional** UI contracts.

### Screen Components

| Node ID                         | Role                | Purpose                                                                    | Interaction                                                   |
| ------------------------------- | ------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `666:9601`                      | Dropdown panel      | Container for the two menu items; dark-navy listbox family surface         | Opens via trigger; closes on outside click / Esc / Tab-out    |
| `I666:9601;563:7844`            | Profile menu item   | Label "Profile" + user icon — enters the profile page                      | Click / Enter / Space → navigate + close menu                 |
| `I666:9601;563:7868`            | Logout menu item    | Label "Logout" + chevron-right icon — ends the session                      | Click / Enter / Space → submits `<form action={signOut}>` → redirect |

### Navigation Flow

- **From**: Avatar / account trigger in the header (any authenticated page).
- **To**:
  - Profile item → `/profile` (confirmed; `<Link href="/profile">`).
  - Logout item → `<form action={signOut}>` → Server Action `@/libs/auth/signOut.ts` → `redirect("/login")`.
  - Admin Dashboard (when `isAdmin=true`) → `/admin` (owned by sibling spec `54rekaCHG1`).
- **Triggers**: Mouse click; keyboard `Enter` / `Space`; `Esc` for dismissal.

### Visual Requirements

- Member of the **dark-navy listbox family** (see `Language Dropdown`, `FilterDropdown`, `HashtagPicker` design-styles). Panel bg `#00070C`, border `1 px #998C5F`, radius 8 px.
- Active / hover row fill `rgba(255,234,158,0.10)` (cream α=0.10); same-family convention for listbox rows.
- Text glow on active row: `text-shadow: 0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` — reserved for the active/hover state only (idle rows have no glow).

### Accessibility Requirements

| Concern            | Requirement                                                                                     | Priority |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------- |
| ARIA role          | Panel `role="menu"`, items `role="menuitem"`                                                   | P1       |
| Keyboard open      | Trigger `Enter` / `Space` opens the menu and focuses the first item                            | P1       |
| Keyboard dismiss   | `Esc` closes and returns focus to the trigger                                                   | P1       |
| Focus ring         | `outline 2 px var(--color-accent-cream) offset 2 px` on `focus-visible`                         | P1       |
| Labels             | Panel `aria-label="Account menu"`; items inherit their text labels                              | P1       |
| Touch-target       | Items ≥ 44 × 44 px (actual 56 × 119 px+) — constitution §II                                     | P1       |
| Reduced motion     | Transitions gated via `motion-safe:`                                                            | P1       |
| Keyboard nav       | `ArrowDown` / `ArrowUp` roves focus between items                                               | P3 (nice-to-have) |
| Tab-out close      | `Tab` leaving the menu bounds closes the panel                                                  | P3 (nice-to-have) |

---

## Data Requirements

| Field                | Type                | Source                                                          |
| -------------------- | ------------------- | --------------------------------------------------------------- |
| Current user session | `Session` (Supabase)| `@/libs/supabase/server.ts` → `supabase.auth.getUser()` (server)|
| Avatar / display name| read-only           | Used by the **trigger** only (out of scope for this panel)      |

This screen reads no extra data beyond the session presence. No forms, no inputs.

---

## API Dependencies

| Endpoint / Action                             | Method            | Purpose                                                                  | Status     |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------------------ | ---------- |
| `@/libs/auth/signOut.ts` (Server Action)      | form action       | End the Supabase session server-side; `redirect("/login")`               | Existing   |
| `<Link href="/profile">`                     | client navigation | Navigate to profile page                                                 | Existing   |

No new server actions or endpoints needed. `signOut` already exists and is the authority for logout across the app.

---

## State Management

| Layer           | State                                 | Owner                                                       | Lifetime                    |
| --------------- | ------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| Local (UI)      | `open: boolean`                       | `<ProfileMenu />` client component (`useState`)             | While mounted               |
| Server          | Supabase Auth session (HttpOnly cookies) | Supabase + middleware refresh                             | Until expiry or signOut     |

No global store. No client cache.

**Logout submission state**: not a separate `useTransition` — the `<form action={signOut}>` pattern lets the browser own the submission lifecycle. React 19's form actions handle the pending state implicitly; explicit `useFormStatus()` is only needed if we want a loading spinner on the Logout row (nice-to-have, not required).

---

## Functional Requirements

- **FR-001**: The trigger (avatar in header) MUST toggle the dropdown panel. Opening sets focus on the first menu item (`Profile`).
- **FR-002**: The panel MUST render `Profile` (icon: user, right of label) and `Logout` (icon: chevron-right, right of label). For admin users, the `Admin Dashboard` row MUST be inserted between them (owned by sibling spec `54rekaCHG1 Dropdown-profile Admin`; this spec defers to that file for its copy / route).
- **FR-003**: Clicking (or `Enter` / `Space` on) `Profile` MUST navigate to `/profile` and close the menu. Implemented via `<Link href="/profile">`.
- **FR-004**: Clicking (or `Enter` / `Space` on) `Logout` MUST submit a `<form action={signOut}>` targeting the existing `@/libs/auth/signOut.ts` Server Action. The Server Action clears the Supabase session and `redirect("/login")`.
- **FR-005**: Logout errors are swallowed inside the Server Action (see `signOut.ts`); the user is still redirected to `/login`. No toast is shown.
- **FR-006**: The panel MUST close on outside click or `Esc` keypress, and return focus to the trigger. (Tab-out closing is not required here — matches existing `ProfileMenu.tsx` behaviour.)
- **FR-007**: Items are in document order; default `Tab` / `Shift+Tab` traversal is acceptable — roving tabindex with arrow keys is a nice-to-have but not required by the existing implementation.
- **FR-008**: Double-click prevention is delegated to the browser's native `<form>` submission serialisation — no explicit `aria-disabled` wiring needed.
- **FR-009**: All transitions (fade-in, colour changes, text-shadow) MUST be gated by `motion-safe:` modifiers per constitution §II.

---

## Technical Requirements

- **TR-001**: Implement as a **Client Component** (`"use client"`) because it owns transient UI state (`open`) and keyboard/mouse dismissal listeners. The existing file to modify is [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx).
- **TR-002**: Reuse the existing `Icon` sprite ([`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx)); **add `user` glyph** (24 × 24, stroke-current) if not already present. `chevron-right` already ships in the sprite.
- **TR-003**: Reuse project design tokens (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`); **do NOT introduce new tokens**. The single new value is the text-shadow glow, written inline per design-style §Typography.
- **TR-004**: Dismissal behaviour (outside-click + `Esc`) already matches `HashtagPicker` in the current `ProfileMenu.tsx`. No re-architecture needed — only visual alignment.
- **TR-005**: Logout MUST use the existing `signOut` Server Action (`@/libs/auth/signOut.ts`) via `<form action={signOut}>`. Do NOT call `supabase.auth.signOut()` from the client — the Server Action is the single source of truth for session termination and pairs with middleware session-refresh.
- **TR-006**: Component MUST accept an `isAdmin: boolean` prop (already wired) so it renders the single-component dual-spec behaviour: this spec (`z4sCl3_Qtk`) describes the `isAdmin=false` case; sibling spec `54rekaCHG1 Dropdown-profile Admin` describes the `isAdmin=true` case.

---

## Success Criteria

- **SC-001**: Opening + closing the menu via click / `Esc` / outside-click behaves identically to `HashtagPicker` under both mouse and keyboard — verified by a shared integration test.
- **SC-002**: Logout submits the Server Action and the browser lands on `/login`. End-to-end wall time < 1 s on local dev. No toast and no client-side spinner are required (FR-005/FR-008).
- **SC-003**: axe-core reports zero violations on the opened panel at each viewport size (375 / 800 / 1440 px).
- **SC-004**: Reduced-motion users see no transitions — verified via `prefers-reduced-motion: reduce` emulation in Chrome DevTools.
- **SC-005**: Visual divergence table in §"Existing implementation — divergence vs Figma" is fully closed — every High/Medium/Low row resolved in the plan/tasks output.

---

## Out of Scope

- The **trigger** (avatar / account button) itself — handled by the existing header component.
- Language switch and notification bell — separate dropdowns (`Language Dropdown`, future Notifications).
- Admin variant (`54rekaCHG1 Dropdown-profile Admin`) — separate spec; shares geometry but adds an "Admin" entry.
- Mobile-sheet variant — out of scope (responsive web uses the desktop anchored panel at all breakpoints).

---

## Dependencies

- Constitution §IV Security (auth flow invariants — server-side session termination).
- Constitution §V Platform Best Practices (Next.js App Router + Supabase SSR client).
- Existing Server Action: [`src/libs/auth/signOut.ts`](../../../src/libs/auth/signOut.ts) — **authority for logout**.
- Existing component: [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) — this spec modifies this file, not a greenfield component.
- Existing `Icon` sprite ([`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx)) — `chevron-right` present; **add `user` glyph** if missing.
- Sibling spec [`54rekaCHG1 Dropdown-profile Admin`](../54rekaCHG1-Dropdown-profile-Admin/) — same component, `isAdmin=true` branch.

---

## Open Questions

All previously open questions have been resolved (see §Known clarifications applied below). No outstanding blockers for plan phase.

---

## Known clarifications applied

- **Family alignment** (2026-04-22): Panel inherits the dark-navy listbox geometry (`#00070C` + `#998C5F` + `rounded-lg`) shared with `Language Dropdown`, `FilterDropdown`, `HashtagPicker`. New tokens would be wasteful — reuse existing.
- **Hover/active state**: Figma frame shows the hover/active state on the Profile row (cream α=0.10 fill + text glow). The idle default is transparent fill + no glow — swap in on hover/focus via Tailwind modifiers.
- **Q1 resolved (2026-04-22 review)**: Profile route is `/profile` — confirmed by existing `src/app/profile/page.tsx`. `<Link href="/profile">` is the correct affordance.
- **Q2 resolved (2026-04-22 review)**: Logout uses the **existing Server Action** at `@/libs/auth/signOut.ts` via `<form action={signOut}>`. This is server-side logout — the Server Action clears the Supabase session cookie and `redirect("/login")`. Do not re-implement client-side logout.
- **Q3 resolved (2026-04-22 review)**: No non-session client state needs explicit cleanup — the project does not persist domain data in `localStorage` / `IndexedDB`. Cookies cleared server-side are sufficient.
- **Q4 resolved (2026-04-22 review)**: Admin and non-admin variants share **one component** (`src/components/layout/ProfileMenu.tsx`) taking an `isAdmin` prop. This spec covers `isAdmin=false`; sibling spec `54rekaCHG1 Dropdown-profile Admin` covers `isAdmin=true`. Code remains a single atom.
- **Q5 resolved (2026-04-22 review)**: Panel appears instantly (no open/close animation) in MVP — matches the current `ProfileMenu.tsx` behaviour and design frame. A fade-in can be added later as polish without spec revision.

---

## Existing implementation — divergence vs Figma

The current [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) ships a working menu but its **styling** does not yet match this spec. Plan / tasks will need to close the gap:

| Attribute             | Current (ProfileMenu.tsx)                                      | Target (this spec)                                               | Severity |
| --------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Panel background      | `bg-[var(--color-brand-800)]`                                   | `bg-[var(--color-panel-surface)]` (#00070C — dark-navy family)   | High     |
| Panel border          | `shadow-lg ring-1 ring-white/10`                                | `border border-[var(--color-border-secondary)]` (1 px olive)     | High     |
| Panel padding         | `overflow-hidden` (items span edge-to-edge)                     | `p-1.5` (6 px gutter); items rounded separately                  | Medium   |
| Item height           | `py-3` (≈ 48 px total)                                          | `h-14` (56 px — matches Figma absolute sizing)                   | Medium   |
| Item icons            | none                                                            | `user` 24×24 on Profile; `chevron-right` 24×24 on Logout         | High     |
| Active-state glow     | none                                                            | `text-shadow: 0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287`        | Medium   |
| Active-state fill     | `hover:bg-white/10`                                             | `hover:bg-[var(--color-accent-cream)]/10`                        | Medium   |
| Item border-radius    | none                                                            | `rounded` (4 px)                                                 | Low      |
| Min width             | `min-w-[220px]`                                                 | hug content (~133 px on desktop, may grow with locale text)      | Low      |

**Sign-off path**: this spec is the Figma source-of-truth; the visual divergence becomes work items in `/momorph.plan` → `/momorph.tasks`. The behaviour (dismissal, Server Action logout, admin-conditional row) does NOT need changes.
