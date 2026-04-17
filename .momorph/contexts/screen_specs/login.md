# Screen: Login

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `GzbNeVGJHz` (node `662:14387`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz |
| **Screen Group** | Authentication |
| **Status** | discovered |
| **Discovered At** | 2026-04-17 |
| **Last Updated** | 2026-04-17 |

---

## Description

Public entry point of the **Sun Annual Awards 2025 (SAA)** web application. Unauthenticated
visitors land here and sign in with their Google (Sun* Workspace) account. The screen also
exposes a language selector so the marketing copy and the post-login UI can be read in VN or
EN. After successful Google OAuth, the user is redirected to the Homepage.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| App launch (root URL) | Auto | No active session |
| Any authenticated screen | Logout | Explicit logout action |
| `Error page - 403` | "Đăng nhập lại" link | Session expired / forbidden |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| `Dropdown-ngôn ngữ` (`hUyaaugye2`) | A.2_Language toggle ("VN") | `I662:14391;186:1601` | High | `navigation.action = on_click`, `linkedFrameId = 721:4942` encoded in spec |
| Homepage SAA (`i87tDx10uM`) | B.3_Login button ("LOGIN With Google") | `662:14425` | High | Standard OAuth success redirect for SAA web app |
| Error page - 403 (`T3e_iS9PCL`) | OAuth (domain rejected) | - | Medium | Inferred: non-Sun* domains denied |

### Navigation Rules

- **Back behavior**: N/A — Login is the root public route; browser back is a no-op when no
  prior in-app history exists.
- **Deep link support**: Yes — `/login` (public). Authenticated users visiting `/login` MUST
  be redirected to `/` (Homepage).
- **Auth required**: No. This is the one public route; accessing any other route without a
  session MUST redirect here with an intended-destination query param (e.g., `?next=/kudos`).

---

## Component Schema

### Layout Structure

```
┌───────────────────────────────────────────────────────────┐
│  A_Header                                                 │
│  [A.1_Logo: SAA 2025]               [A.2_Language: 🇻🇳 VN ▾]│
├───────────────────────────────────────────────────────────┤
│                                                           │
│  B_Bìa (Hero)                                             │
│                                                           │
│     ┌─────────────────────────────────────────────┐       │
│     │  B.1_Key Visual   "ROOT FURTHER"            │       │
│     │                                             │       │
│     │  B.2_content                                │       │
│     │    Bắt đầu hành trình của bạn cùng SAA 2025.│       │
│     │    Đăng nhập để khám phá!                   │       │
│     │                                             │       │
│     │  B.3_Login   [ G  LOGIN With Google ]       │       │
│     └─────────────────────────────────────────────┘       │
│                                                           │
├───────────────────────────────────────────────────────────┤
│  D_Footer           Bản quyền thuộc về Sun* © 2025        │
└───────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Screen: Login
├── A_Header (Organism, instance)
│   ├── A.1_Logo (Molecule)
│   │   └── MM_MEDIA_Logo (Atom — image)
│   └── A.2_Language (Molecule, toggle)
│       ├── MM_MEDIA_VN (Atom — flag icon)
│       ├── "VN" label (Atom — text)
│       └── MM_MEDIA_Down (Atom — chevron)
├── B_Bìa (Organism — hero)
│   ├── B.1_Key Visual (Molecule)
│   │   └── MM_MEDIA_Root Further Logo (Atom — image)
│   ├── B.2_content (Molecule — 2 copy lines)
│   └── B.3_Login (Molecule — Google OAuth button)
│       ├── "LOGIN With Google" label (Atom)
│       └── MM_MEDIA_Google (Atom — Google logo)
└── D_Footer (Organism, instance)
    └── "Bản quyền thuộc về Sun* © 2025" (Atom — text)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| A_Header | Organism | `662:14391` | Global top bar (logo + language) | Yes — reused across public pages |
| A.1_Logo | Molecule | `I662:14391;186:2166` | SAA 2025 logo, non-interactive | Yes |
| A.2_Language | Molecule | `I662:14391;186:1601` | Language toggle, opens language dropdown | Yes |
| B_Bìa | Organism | `662:14393` | Hero section of login page | No — login-specific |
| B.3_Login | Molecule | `662:14425` | Google sign-in button | Partial — button pattern reused |
| D_Footer | Organism | `662:14447` | Global footer with copyright | Yes |

---

## Form Fields (If Applicable)

No form fields on this screen. Authentication is delegated entirely to Google OAuth — the user
is redirected off-domain to Google's consent screen, then back to the SAA callback route.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `GET /auth/session` (Supabase) | GET | Detect any existing session | If session present, redirect to `/` Homepage |
| `GET /i18n/{locale}` (static JSON) | GET | Load current-locale strings | Populate hero + button copy |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click "LOGIN With Google" | `POST /auth/v1/authorize?provider=google` (Supabase Auth) | POST / redirect | `{ provider: "google", redirectTo: "<origin>/auth/callback" }` | 302 → Google OAuth consent screen |
| Google consent returns | `GET /auth/callback?code=...` (Next.js route handler) | GET | `code`, `state` query params | Exchanges code via `supabase.auth.exchangeCodeForSession`, sets cookie, 302 → `/` |
| Click language toggle | — | — | Opens `Dropdown-ngôn ngữ` overlay | — |
| Select language | `POST /api/i18n/preference` (or cookie set) | POST | `{ locale: "vi" \| "en" }` | Sets `NEXT_LOCALE` cookie, reloads locale |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| OAuth denied by user | "Đăng nhập đã bị huỷ. Vui lòng thử lại." | Inline banner above the button; button re-enables |
| Non-Sun* domain / policy violation | "Tài khoản không được phép truy cập SAA." | Redirect to `Error page - 403` |
| Google 5xx / network failure | "Không kết nối được tới Google. Hãy thử lại sau." | Inline banner with "Thử lại" link |
| Supabase exchangeCodeForSession fails | "Phiên đăng nhập không hợp lệ." | Redirect back to `/login?error=session_exchange_failed` |

---

## State Management

### Local State (client component)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `isSubmitting` | boolean | `false` | Disable button + show spinner during OAuth redirect |
| `authError` | `string \| null` | `null` | Render inline error banner for OAuth failures |
| `isLanguageOpen` | boolean | `false` | Open/close state of language dropdown |

### Global State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| Supabase session | `@supabase/ssr` cookie-based | Write (after callback) | Authenticated session persisted as secure cookie |
| Current locale | `NEXT_LOCALE` cookie (Next.js i18n) | Read/Write | Drives language on all screens |

No client-side global store (Zustand/Redux) is required for this screen.

---

## UI States

### Loading State

- The OAuth redirect happens almost instantly, but the button MUST show a spinner + "Đang
  mở Google..." label as soon as it is clicked, to avoid double-submits.
- Initial page render: Server Component — no skeleton required.

### Error State

- Inline error banner above the Google button, using the "Alert Overlay" style.
- The banner has a `role="alert"` + `aria-live="assertive"` region so screen readers announce
  failures.

### Success State

- On successful session exchange, the callback route redirects to `/` (Homepage).
- No on-screen success toast is necessary; the navigation is the success signal.

### Empty State

- N/A — Login has no empty state; the hero copy IS the resting state.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus management | On load, focus moves to the "LOGIN With Google" button (it's the primary action). |
| Keyboard navigation | Tab order: Language toggle → Google login button. Enter/Space activate. |
| Screen reader | Button has `aria-label="Đăng nhập bằng Google"`; language toggle exposes `aria-expanded` + `aria-controls` to its dropdown. |
| Error announcement | Inline error banner uses `role="alert"` + `aria-live="assertive"`. |
| Color contrast | Hero text ≥ 4.5:1 against background; button label ≥ 4.5:1. Must be verified via Lighthouse/axe per constitution Principle IV. |
| Reduced motion | Any hero animations respect `prefers-reduced-motion: reduce`. |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Header collapses to single row; hero art scales to full width; button is full-width with min 44px touch target. |
| Tablet (640–1023px) | Hero centered, max-w ~520px; art fills the top. |
| Desktop (≥1024px) | Key visual dominates the page; hero copy + button right-aligned per the Figma composition. |

Per constitution Principle II, mobile-first Tailwind utilities (`sm:`, `md:`, `lg:`) MUST be
used; no fixed-pixel container widths.

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `screen_view` | On mount | `{ screen: "login" }` |
| `login_attempt` | Click Google button | `{ provider: "google" }` |
| `login_success` | Successful callback | `{ user_id, email_domain }` |
| `login_error` | Callback / OAuth failure | `{ error_code, provider: "google" }` |
| `language_change` | Locale selected in dropdown | `{ from: "vi", to: "en" }` |

---

## Design Tokens

Tokens will be extracted during the detailed-analysis pass (`list_frame_styles`). Placeholder
references for now:

| Token | Expected Usage |
|-------|----------------|
| `--color-brand-primary` | "LOGIN With Google" button background |
| `--color-bg-hero` | Hero wrapper background |
| `--color-text-inverse` | Hero body copy |
| `--radius-button` | Button corner radius |
| `--shadow-button-hover` | Button hover elevation |

---

## Implementation Notes

### Dependencies

- **Auth**: `@supabase/supabase-js` + `@supabase/ssr` (Next.js App Router cookie helpers).
- **i18n**: Next.js built-in `next-intl` or equivalent — decision deferred to first i18n task.
- **No form libs** needed (no inputs on screen).
- **UI**: Tailwind utilities only (per constitution Principle V).

### Special Considerations

- The OAuth callback route (`app/auth/callback/route.ts`) MUST be a Route Handler on the
  server; it MUST call `supabase.auth.exchangeCodeForSession()` with the `code` query param
  and MUST set cookies via the SSR helper. Never perform this exchange client-side.
- The redirect-after-login target MUST respect a whitelisted `next` param to prevent open
  redirect vulnerabilities (OWASP, constitution Principle IV).
- The login page renders as a **Server Component** by default; only the button (with its
  click handler + loading state) needs `"use client"`.
- Domain allow-listing (Sun*-only) is enforced at the Supabase Auth config + a server-side
  check in the callback route; DO NOT rely on client-side checks.
- Language preference from this screen MUST persist after login as a user preference once a
  session exists.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-17 |
| Needs Deep Analysis | Yes — style tokens and exact copy not yet extracted |
| Confidence Score | High |

### Next Steps

- [ ] Run `list_frame_design_items` on `GzbNeVGJHz` to extract exact strings and validation
      metadata.
- [ ] Run `list_frame_styles` to capture color/typography tokens.
- [ ] Confirm redirect-after-login behavior with product (default `/`, or last intended URL).
- [ ] Confirm whether EN copy exists as a separate frame or via i18n only.
- [ ] Verify the 403 / denied-domain UX with design (currently inferred).
