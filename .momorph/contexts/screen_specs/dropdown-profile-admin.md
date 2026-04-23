# Screen: Dropdown-profile Admin

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `54rekaCHG1` (node `666:9728`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/54rekaCHG1 |
| **Screen Group** | Layout overlays (admin) |
| **Status** | discovered |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

**Admin variant of the account dropdown** surfaced from the header's avatar
trigger on any authenticated page. Extends the non-admin
[`Dropdown-profile`](./dropdown-profile.md) (`z4sCl3_Qtk`) with a third row —
**Dashboard** — that deep-links into the `/admin` console. The admin role is
derived server-side from the Supabase JWT claim
`user.app_metadata.role === "admin"` and passed to
`<ProfileMenu isAdmin={true} />` as a boolean prop (same component renders
both variants).

Not a route — it is a popover anchored to the avatar button, dismissable on
outside click / `Esc`. The Dashboard entry is a *UX affordance only*: the
authoritative gate is the server-side guard at `src/app/admin/page.tsx` which
redirects non-admins to `/error/403`.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Any authenticated screen | Click avatar in `SiteHeader` | Signed-in user with `app_metadata.role === "admin"` |
| Keyboard activation | Tab to avatar → `Enter` / `Space` | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| `/profile` (Profile page) | Profile row (`Link href="/profile"`) | `I666:9728;666:9277` | High | Route exists at `src/app/profile/page.tsx` |
| `/admin` (Admin Dashboard) | **Dashboard row** (`Link href="/admin"`) | `I666:9728;666:9452` | High | Route exists at `src/app/admin/page.tsx`; only rendered when `isAdmin === true` |
| `/login` (Login) | Logout row (`<form action={signOut}>`) | `I666:9728;666:9278` | High | Server Action at `src/libs/auth/signOut.ts` clears session + `redirect("/login")` |
| `/error/403` | Dashboard click if role revoked mid-session | — | Medium | Defense-in-depth — server guard at `src/app/admin/page.tsx:10-11` |

### Navigation Rules

- **Back behavior**: N/A — popover; Esc or outside-click just closes it.
- **Deep link support**: No — this is an overlay, not a route.
- **Auth required**: Yes. Admin role required for the Dashboard row to render;
  role revocation between sessions removes the row on next full page load
  (RSC re-renders `isAdmin` per request).

---

## Component Schema

### Layout Structure

```
┌───────────────────────────────┐
│  Dropdown panel               │
│  (dark-navy listbox family)   │
│ ┌───────────────────────────┐ │
│ │ 👤 Profile              > │ │
│ ├───────────────────────────┤ │
│ │ ▦ Dashboard             > │ │ ← admin-only row
│ ├───────────────────────────┤ │
│ │ ↪ Logout                > │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

### Component Hierarchy

```
ProfileMenu (Client — "use client")
├── TriggerButton (owned by header, out of this spec)
└── Panel (role="menu", aria-label="Account menu")
    ├── ProfileMenuItem (role="menuitem", Link href="/profile")
    │   ├── user Icon (24x24)
    │   └── "Profile" label
    ├── DashboardMenuItem (role="menuitem", Link href="/admin")     ← isAdmin gate
    │   ├── dashboard Icon placeholder (chevron-right in MVP)
    │   └── "Dashboard" label
    └── LogoutMenuItem (form action={signOut})
        ├── "Logout" label
        └── chevron-right Icon (24x24)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Dropdown panel | Organism | `666:9728` | Dark-navy listbox container; slightly wider than non-admin (3 rows) | No — admin variant of `ProfileMenu` |
| Profile item | Molecule | `I666:9728;666:9277` | Inherited from parent spec | Yes |
| Dashboard item | Molecule | `I666:9728;666:9452` | **New row** — only rendered when `isAdmin={true}` | No |
| Logout item | Molecule | `I666:9728;666:9278` | Inherited from parent spec | Yes |

---

## Form Fields

N/A — pure navigation overlay; no inputs.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `supabase.auth.getUser()` (server, upstream) | RSC | Resolve session + `app_metadata.role` | Sets `isAdmin` prop passed to `ProfileMenu` |

No dropdown-specific fetch — rendering data comes from the parent Server
Component.

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click Profile | `<Link href="/profile">` | client nav | — | Navigate |
| Click Dashboard | `<Link href="/admin">` | client nav | — | Navigate; `src/app/admin/page.tsx` re-verifies role |
| Click Logout | `signOut` Server Action (`src/libs/auth/signOut.ts`) | form action | — | Clears Supabase session → `redirect("/login")` |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| Logout throws | — | Server Action swallows error; still `redirect("/login")` (intentional — matches user intent) |
| Role revoked mid-session | — | Dashboard click → `/admin` → server guard redirects to `/error/403` |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `open` | boolean | `false` | Panel visibility (owned by `ProfileMenu`) |

### Global / Server State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| `isAdmin` | Supabase JWT `app_metadata.role` | Read (server-side) | Conditional render of Dashboard row |
| Session cookies | Supabase SSR | Write (on logout) | Terminated by `signOut` |

No global client store needed.

---

## UI States

### Loading State
- N/A — panel is a synchronous client-only toggle.

### Error State
- Logout errors swallowed server-side; no inline UI.

### Success State
- Navigation replaces the page (Profile / Dashboard / Login).

### Empty State
- N/A — the 3 rows always render for admins; 2 for non-admins.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA role | Panel `role="menu"`; rows `role="menuitem"` |
| Panel label | `aria-label="Account menu"` |
| Focus ring | 2 px cream outline + 2 px offset on `:focus-visible` |
| Keyboard open | `Enter` / `Space` on trigger opens + focuses first row |
| Keyboard dismiss | `Esc` closes, returns focus to trigger |
| Tab order | Profile → Dashboard → Logout → (exit) |
| Touch target | ≥ 44 × 44 px per row (constitution §II) |
| Reduced motion | Transitions gated via `motion-safe:` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Panel anchors below trigger; no bottom-sheet variant |
| Tablet (640–1023px) | Same as mobile |
| Desktop (≥1024px) | Same anchored panel; Figma baseline |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `profile_menu_open` | Click trigger | `{ is_admin: true }` |
| `profile_menu_navigate` | Click item | `{ target: "dashboard" \| "profile" \| "logout" }` |

No new events required for MVP — the existing non-admin spec events extend
to this variant with a role flag.

---

## Design Tokens

Inherits the dark-navy listbox family — **zero new tokens**:

| Token | Usage |
|-------|-------|
| `--color-panel-surface` (`#00070C`) | Panel background |
| `--color-border-secondary` (`#998C5F`) | 1 px panel border |
| `--color-accent-cream` (`#FFEA9E`) | Hover/active fill at 10 % alpha; focus ring |
| `--font-montserrat` | Row labels |

---

## Implementation Notes

- **Single component for both variants**: `src/components/layout/ProfileMenu.tsx`
  receives `isAdmin: boolean`; the Dashboard row is conditionally rendered
  via `{isAdmin && <Link ... />}` (return `null`, NOT `display:none`).
- **Role derivation is server-side only** — never trust a client-side boolean
  for privilege. Authority is the guard at `src/app/admin/page.tsx`.
- **Dashboard icon** is still TBD — MVP placeholder is `chevron-right`; a
  dedicated 2×2 grid glyph can land in a follow-up.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — single-delta spec, parent owns geometry |
| Confidence Score | High |

### Next Steps

- [ ] Confirm dedicated Dashboard icon glyph with Design (Q1 in spec.md).
- [ ] Add `profile_menu_navigate.target="dashboard"` label to analytics types.
