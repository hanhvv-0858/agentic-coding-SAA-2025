# Screen: Dropdown-profile

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `z4sCl3_Qtk` (panel `666:9601`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/z4sCl3_Qtk |
| **Screen Group** | Layout overlays (header) |
| **Status** | implemented (visual reconciliation pending) |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

Two-item **account dropdown menu** surfaced from the header's avatar
trigger on any authenticated page. Gives the signed-in Sunner one click
into their profile page and one click to end their session.

Member of the **dark-navy listbox family** shared with Language Dropdown,
FilterDropdown, and HashtagPicker. Non-admin variant — the
[admin variant](./dropdown-profile-admin.md) (`54rekaCHG1`) adds a
third "Dashboard" row via the same `<ProfileMenu isAdmin>` component.

Logout flow submits a `<form action={signOut}>` that invokes the
existing `@/libs/auth/signOut.ts` Server Action, which ends the Supabase
session server-side (clearing HttpOnly cookies) and issues
`redirect("/login")`.

Not a route — ephemeral popover dismissable on outside-click / `Esc`.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Any authenticated screen | Click avatar trigger in `SiteHeader` | Signed-in, non-admin (admin users see sibling spec variant) |
| Keyboard | Tab to avatar → `Enter` / `Space` | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| `/profile` (Profile page) | Profile row — `<Link href="/profile">` | `I666:9601;563:7844` | High | Route exists at `src/app/profile/page.tsx` |
| `/login` (Login) | Logout row — `<form action={signOut}>` | `I666:9601;563:7868` | High | Server Action clears session → `redirect("/login")` |
| Back to caller (panel closes) | Outside click / `Esc` | — | High | No navigation |

### Navigation Rules

- **Back behavior**: N/A — overlay.
- **Deep link support**: No — the panel is not a route.
- **Auth required**: Yes. Trigger only renders when Supabase session is
  present.

---

## Component Schema

### Layout Structure

```
 ╳ page content ╳                    ┌──────── Trigger (avatar in header)
                                     │
                                     ▼
               ┌───────────────────────────────┐
               │  Dropdown panel               │
               │  (dark-navy listbox family)   │
               │ ┌───────────────────────────┐ │
               │ │ 👤 Profile              > │ │
               │ ├───────────────────────────┤ │
               │ │ ↪ Logout                > │ │
               │ └───────────────────────────┘ │
               └───────────────────────────────┘
```

### Component Hierarchy

```
ProfileMenu (Client — src/components/layout/ProfileMenu.tsx, "use client")
├── TriggerButton (owned by SiteHeader; out of this spec)
└── Panel (role="menu", aria-label="Account menu")
    ├── ProfileMenuItem (role="menuitem")
    │   ├── user Icon (24x24)  ← NEW glyph to add if missing
    │   └── "Profile" label (Link href="/profile")
    └── LogoutMenuItem (form action={signOut})
        ├── "Logout" label
        └── chevron-right Icon (24x24)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Dropdown panel | Organism | `666:9601` | Dark-navy `#00070C`, cream 1 px border, radius 8, padding 6 | Yes |
| Profile item | Molecule | `I666:9601;563:7844` | 56 × hug row, user icon + "Profile" | Yes |
| Logout item | Molecule | `I666:9601;563:7868` | 56 × hug row, "Logout" + chevron-right | Yes |

---

## Form Fields

Logout uses a native `<form action={signOut}>` — no user input, no
validation. Submit is implicit on row click.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `supabase.auth.getUser()` (upstream in header RSC) | built-in | Session presence + avatar | Feeds trigger; `isAdmin` prop derived from `app_metadata.role` |

No dropdown-specific fetch.

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click Profile | `<Link href="/profile">` | client nav | — | Navigate |
| Click Logout | `signOut` Server Action (`src/libs/auth/signOut.ts`) | form action | — | Clears Supabase session (HttpOnly cookies) → `redirect("/login")` |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| Logout Server Action throws | — | Error swallowed; still `redirect("/login")` (intentional — matches user intent; middleware session refresh re-prompts on next request) |

---

## State Management

### Local (UI)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `open` | boolean | `false` | Panel visibility (owned by `<ProfileMenu>`) |

### Server

- Supabase Auth session (HttpOnly cookies) — managed by Supabase + middleware.

No global store. Logout pending state is owned by the browser's native
form submission; explicit `useTransition`/`useFormStatus` is optional
(not used in MVP).

---

## UI States

### Loading
- N/A — panel is a synchronous client toggle.

### Error
- Logout errors swallowed server-side; no inline UI.

### Success
- Navigation replaces the page (Profile or Login).

### Empty
- N/A — always exactly 2 rows (3 when `isAdmin={true}`).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA | Panel `role="menu"`; rows `role="menuitem"`; panel `aria-label="Account menu"` |
| Keyboard open | `Enter` / `Space` on trigger opens + focuses first row |
| Keyboard dismiss | `Esc` closes + returns focus to trigger |
| Keyboard nav | Default Tab / Shift-Tab between items (roving tabindex with arrow keys is a P3 nice-to-have) |
| Focus ring | 2 px cream + 2 px offset on `:focus-visible` |
| Touch target | ≥ 44 × 44 px per row (constitution §II) |
| Reduced motion | Transitions gated `motion-safe:` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Same anchored panel; no bottom-sheet variant |
| Tablet (640–1023px) | Same |
| Desktop (≥1024px) | Figma baseline |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `profile_menu_open` | Click trigger | `{ is_admin: boolean }` |
| `profile_menu_navigate` | Click item | `{ target: "profile" \| "logout" }` |

No new events required for MVP — keep parity with existing logout flow.

---

## Design Tokens

Zero new tokens — inherits dark-navy family:

| Token | Usage |
|-------|-------|
| `--color-panel-surface` (`#00070C`) | Panel bg |
| `--color-border-secondary` (`#998C5F`) | 1 px border |
| `--color-accent-cream` (`#FFEA9E`) | Hover/active fill @ 10 %; focus ring |
| `--font-montserrat` | Labels |

Text-shadow glow on active row: `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287`
(inline per design-style).

---

## Implementation Notes

### Dependencies
- Existing `signOut` Server Action (`src/libs/auth/signOut.ts`).
- Existing `<ProfileMenu>` component (`src/components/layout/ProfileMenu.tsx`)
  — this spec modifies it, not a greenfield write.
- `Icon` sprite (`src/components/ui/Icon.tsx`) — `chevron-right` present;
  **add `user` glyph** if missing.

### Special Considerations
- **Single component for both variants** — admin adds a Dashboard row
  via the `isAdmin: boolean` prop (see sibling spec `54rekaCHG1`).
- **Logout authority is server-side**. Never call
  `supabase.auth.signOut()` from the client — the Server Action is the
  single source of truth and pairs with middleware session refresh.
- **Divergence from current code** (to be closed by tasks): panel bg
  → `--color-panel-surface`; panel border → 1 px olive; item padding
  `p-1.5` / height `h-14`; add user + chevron-right icons; `hover:bg-[var(--color-accent-cream)]/10`; text-shadow glow on active.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — spec + prototype both in place |
| Confidence Score | High |

### Next Steps

- [ ] Close the visual divergence table (bg / border / padding / height
      / icons / hover tint / text-shadow glow).
- [ ] Add `user` glyph to the Icon sprite if not present.
- [ ] Consider upgrading keyboard nav to arrow-key roving tabindex after
      a11y audit (currently P3).
