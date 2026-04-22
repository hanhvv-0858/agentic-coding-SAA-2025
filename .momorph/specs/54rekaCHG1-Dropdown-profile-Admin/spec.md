# Feature Specification: Dropdown-profile Admin

**Frame ID**: `54rekaCHG1`
**Figma frame name**: Dropdown-profile Admin
**Created**: 2026-04-22
**Status**: Draft
**Parent spec**: [`z4sCl3_Qtk-Dropdown-profile`](../z4sCl3_Qtk-Dropdown-profile/spec.md) — this doc records only the **admin delta**.

---

## Overview

### Feature name
Account dropdown menu — **admin variant**. Extends the non-admin `Dropdown-profile` (`z4sCl3_Qtk`) with a **Dashboard** row that deep-links into the admin console.

### Purpose
Admin Sunners (role granted via Supabase profile + server-side session claim) need a one-click path to the admin console without a mode-switch or separate login. Reusing the same account dropdown keeps the surface area small and the UX consistent.

### Target user
Signed-in Sunner **with admin role**. Admin status is carried in the Supabase JWT via `user.app_metadata.role === "admin"` — confirmed ground-truth in the codebase (see [`src/app/page.tsx:47`](../../../src/app/page.tsx), replicated in 4 consumer pages and in the `/admin` route guard at [`src/app/admin/page.tsx:10-11`](../../../src/app/admin/page.tsx)). Non-admin Sunners see the non-admin variant owned by the parent spec.

### Business context
- Same component (`src/components/layout/ProfileMenu.tsx`) renders both variants via an `isAdmin: boolean` prop already wired. **No new component.**
- The Dashboard entry is the only admin-exposed surface in the header — other admin routes (`/admin/*`) are deep-linked from Dashboard itself.

---

## User Scenarios & Testing

### US1 — Admin opens the menu and navigates to Dashboard (Priority: P1)

**As an** admin Sunner
**I want to** access the admin dashboard in one click from the header
**So that** I can jump into moderation / configuration without clicking through the main nav

#### Acceptance Scenarios

**Scenario 1 — Happy path**
- **Given** an admin user is signed in and on any authenticated page
- **When** they click the avatar trigger and then click "Dashboard"
- **Then** the menu closes and the app navigates to `/admin` (existing route — see `src/app/admin/`).

**Scenario 2 — Non-admin never sees Dashboard**
- **Given** a non-admin user is signed in
- **When** they open the dropdown
- **Then** only two rows render (Profile, Logout). The Dashboard row is conditionally skipped when `isAdmin === false`.

**Scenario 3 — Keyboard parity**
- **Given** an admin user opens the menu via keyboard
- **When** they press `Tab` / `Shift+Tab`
- **Then** focus moves through the three rows in document order: Profile → Dashboard → Logout.

---

### US2 — Profile and Logout behave identically to the non-admin variant (Priority: P1)

Inherits all acceptance scenarios from [parent spec US1 + US2](../z4sCl3_Qtk-Dropdown-profile/spec.md#user-scenarios--testing). No delta.

---

### US3 — Admin-role enforcement (Priority: P1)

**As** an admin
**I want** the Dashboard link to be gated by the same server-side role check as the `/admin` route
**So that** a user whose role is revoked at runtime cannot exploit a stale browser session to see the link.

#### Acceptance Scenarios

**Scenario 1 — Role source-of-truth is server-side**
- **Given** the `isAdmin` prop is derived **server-side** in the header RSC via `(user.app_metadata as { role?: string } | null)?.role === "admin"` — same pattern repeated in all 4 authenticated pages today
- **When** the admin claim is revoked while the page is loaded (e.g. admin demoted via Supabase Auth dashboard)
- **Then** on the **next** full page load the JWT returns a fresh `app_metadata`, `isAdmin` evaluates to `false`, and the Dashboard row disappears. Live revocation during a single page life is out of scope — server-side guards at privileged routes catch it.

**Scenario 2 — Defense in depth**
- **Given** a non-admin somehow spoofs `isAdmin=true` client-side (e.g. via React DevTools)
- **When** they click the forged Dashboard row and navigate to `/admin`
- **Then** the server-side guard at [`src/app/admin/page.tsx:10-11`](../../../src/app/admin/page.tsx) (`if (role !== "admin") redirect("/error/403")`) blocks rendering and issues a 403 redirect. **The client prop never grants privilege.**

---

### Edge Cases

- **Role flips from non-admin → admin mid-session**: the dropdown only gains Dashboard after a full page reload (RSC renders `isAdmin` once per request). Acceptable — admin role changes are rare and re-auth is expected.
- **Admin on `/admin` already clicks Dashboard**: navigation is a no-op (Next.js router dedupes); menu still closes.
- All other edge cases inherit from the parent spec.

---

## UI/UX Requirements

Visual specs are in [design-style.md](design-style.md). This spec only captures **functional** UI contracts.

### Screen Components

| Node ID                         | Role                                | Purpose                                                                                        | Interaction                                           |
| ------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `666:9728`                      | Dropdown panel (admin wider)        | Container for 3 menu items; dark-navy listbox family                                            | Opens via trigger; closes on outside click / Esc       |
| `I666:9728;666:9277`            | Profile menu item                   | Label "Profile" + user icon — enters the profile page                                           | Click / Enter / Space → navigate `/profile` + close    |
| `I666:9728;666:9452`            | **Dashboard menu item (new)**       | Label "Dashboard" + icon (TBD — see Q1) — enters the admin console                              | Click / Enter / Space → navigate `/admin` + close      |
| `I666:9728;666:9278`            | Logout menu item                    | Label "Logout" + chevron-right icon — ends the session                                          | Click / Enter / Space → submits `<form action={signOut}>` → redirect to `/login` |

### Navigation Flow

- **From**: Avatar / account trigger in the header (any authenticated page).
- **To**:
  - Profile → `/profile` (inherits from parent spec).
  - **Dashboard → `/admin`** (new path; existing route at `src/app/admin/page.tsx`).
  - Logout → `<form action={signOut}>` → Server Action → `redirect("/login")`.
- **Triggers**: Mouse click; keyboard `Enter` / `Space`; `Esc` for dismissal.

### Accessibility Requirements

Identical to parent spec. Dashboard row gets `role="menuitem"`; the panel's `aria-label="Account menu"` applies to all 3 rows.

---

## Data Requirements

| Field                | Type                | Source                                                                                |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `isAdmin`            | `boolean`           | **Server-side** derivation in the header RSC — from Supabase session + profile claim  |
| (All other fields)   | —                   | Inherit from parent spec (session, avatar, display name)                              |

---

## API Dependencies

| Endpoint / Action                             | Method            | Purpose                                                 | Status    |
| --------------------------------------------- | ----------------- | ------------------------------------------------------- | --------- |
| `<Link href="/admin">`                       | client navigation | Navigate to admin console                                | Existing  |
| (All other APIs)                              | —                 | Inherit from parent spec (signOut, /profile)             | Existing  |

No new Server Actions or endpoints.

---

## State Management

Identical to parent spec. No additional state for the admin variant — `isAdmin` is a passed-in prop, not local state.

---

## Functional Requirements

- **FR-A-001**: When `isAdmin={true}`, the dropdown MUST render 3 rows: Profile → Dashboard → Logout, in that order.
- **FR-A-002**: The Dashboard row MUST be a `<Link href="/admin">` with `role="menuitem"` and `onClick={close}` so clicking closes the menu before navigation.
- **FR-A-003**: When `isAdmin={false}`, the Dashboard row MUST NOT render at all (conditional return of `null`, not `display:none`).
- **FR-A-004**: Server-side route protection at `/admin` MUST exist and is the **authoritative** access gate; the `isAdmin` prop is a UX affordance only.
- **FR-A-005**: All other functional requirements inherit unchanged from the parent spec's FR-001 through FR-009.

---

## Technical Requirements

- **TR-A-001**: Dashboard row is implemented in [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) — the **same component** as the non-admin spec. Conditional rendering via `{isAdmin && <Link ... />}` pattern already wired.
- **TR-A-002**: Dashboard icon uses the shared `Icon` sprite. Current placeholder: `chevron-right`. **Real icon TBD** — see design-style.md Q1.
- **TR-A-003**: Admin role check MUST happen **server-side** via `user.app_metadata.role === "admin"` — ground-truth pattern in this codebase. Extract the 4-line block into a helper if duplication becomes painful; until then, mirror the existing convention in [`src/app/page.tsx:47`](../../../src/app/page.tsx). Never trust a client-side boolean.

---

## Success Criteria

- **SC-A-001**: Admin user sees 3 rows; non-admin user sees 2 rows — verified by a unit test for `<ProfileMenu isAdmin={true}/>` rendering 3 `menuitem` elements.
- **SC-A-002**: Dashboard row routes to `/admin` on click — verified by the same unit test asserting `href="/admin"`.
- **SC-A-003**: Bypass attempt (non-admin spoofs `isAdmin=true` via DevTools) reaches `/admin` but is redirected to `/error/403` by the existing server-side guard at `src/app/admin/page.tsx:10-11`. Verified manually (curl + stale JWT); the existing guard is already in place — this spec does not add a new test for it.
- **SC-A-004**: All other SCs inherit from the parent spec.

---

## Out of Scope

- The admin-role mechanism itself (`profiles.role` column vs Supabase custom claim) — owned by a separate auth spec.
- The `/admin` route and admin console UI — owned by the `Admin - *` specs.
- Live role-revocation propagation within a single page life — acceptable degradation; server-side route guard catches privileged actions.

---

## Dependencies

- Parent spec: [`z4sCl3_Qtk-Dropdown-profile`](../z4sCl3_Qtk-Dropdown-profile/) — all shared geometry, styling, and behaviour.
- Existing component: [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) — already accepts `isAdmin` and conditionally renders Dashboard.
- Existing route: [`src/app/admin/`](../../../src/app/admin/) — the `/admin` destination.
- Existing Server Action: [`src/libs/auth/signOut.ts`](../../../src/libs/auth/signOut.ts) — shared logout.
- Existing Icon sprite: [`src/components/ui/Icon.tsx`](../../../src/components/ui/Icon.tsx) — need to confirm which glyph to use for Dashboard (Q1).

---

## Open Questions

- **Q1 — Dashboard icon**: Figma `componentId: 662:10350` identifies the icon used for the Dashboard row. The existing sprite has candidates: `building`, `diamond`, `target`. Pick one that reads as "dashboard" semantically, OR add a new `"dashboard"` glyph to the sprite (e.g. 2×2 grid of squares — the classic dashboard symbol). **Non-blocking for MVP**: ship with `chevron-right` placeholder (same as Logout; visually consistent with the family), then upgrade the icon in a follow-up.

No other open questions — Q2 resolved in §Known clarifications applied.

---

## Known clarifications applied

- **Single component for both variants** (2026-04-22): The admin and non-admin variants share one React component (`ProfileMenu.tsx`) driven by an `isAdmin: boolean` prop. The admin spec is a **delta**, not a separate codebase concern. Confirmed by inspecting the existing file.
- **Server-side role derivation** (2026-04-22): `isAdmin` prop flows from the header RSC, not from client state — this aligns with Constitution §IV Security (never trust client auth state for authorization).
- **Q2 resolved (2026-04-22 review)**: Admin role is carried via **Supabase JWT `app_metadata.role`** (custom claim), NOT via a `profiles.role` column. Ground-truth pattern: `(user.app_metadata as { role?: string } | null)?.role === "admin"`. Replicated in 4 authenticated pages + the `/admin` route guard. No alternative mechanism is needed for this spec.
- **`/admin` route guard already exists** (2026-04-22 review): [`src/app/admin/page.tsx:10-11`](../../../src/app/admin/page.tsx) does `if (role !== "admin") redirect("/error/403")`. SC-A-003 "defense-in-depth" is already satisfied by existing code — no new server guard needs to be written for this spec.
