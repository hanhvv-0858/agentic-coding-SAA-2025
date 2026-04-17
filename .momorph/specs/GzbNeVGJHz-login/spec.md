# Feature Specification: Login (Sun Annual Awards 2025)

**Frame ID**: `GzbNeVGJHz` (Figma node `662:14387`)
**Frame Name**: `Login`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
**Created**: 2026-04-17
**Status**: Draft

> Visual specs (colors, typography, spacing, component dimensions, ASCII layout, responsive
> breakpoints, implementation mapping) live in a separate sibling document:
> **[design-style.md](design-style.md)**. This spec focuses on behavior, data, and
> acceptance criteria.

---

## Overview

The Login screen is the **public entry point** of the Sun Annual Awards 2025 (SAA) web
application. Any unauthenticated visitor to the site lands here and signs in with their
Sun* Workspace Google account (via Supabase Auth). It also exposes a language toggle so
the marketing copy (and all downstream screens) can be read in Vietnamese or English.

**Target users**

- **Sun\* employees** (primary) who need access to post, read, and moderate Kudos and
  Awards content.
- **Sun\* administrators** (secondary) who need the same entry point and then pivot into
  the Admin area.

**Business context**

- SAA 2025 is an internal company product; sign-in is restricted to the Sun\* corporate
  Google Workspace domain. Non-Sun\* Google accounts are rejected by Supabase Auth's
  allow-list and redirected to `Error page - 403`.
- No self-registration, no password form, no "forgot password" — identity is delegated
  entirely to Google SSO.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign in with Google and reach the home page (Priority: P1) 🎯 MVP

**As a** Sun\* employee visiting the SAA web app for the first time,
**I want to** sign in with a single click on "LOGIN With Google",
**So that** I can start reading and posting Kudos without having to create yet another
password.

**Why this priority**: The entire application is gated behind this one button. If it
doesn't work, nothing else in the product is reachable — it is the MVP by definition.

**Independent Test**: Visit `/login` in a clean browser session (no cookies). Click the
primary CTA. The browser is redirected to Google's OAuth consent screen; after consent,
the browser lands on `/` (Homepage SAA) and a Supabase session cookie is present.

**Acceptance Scenarios**

1. **Given** a visitor with no active session opens `/login`,
   **When** the page has finished rendering,
   **Then** the hero copy, the "LOGIN With Google" button, the language toggle, and the
   footer copyright are all visible, with focus on the Google CTA.

2. **Given** the visitor clicks the "LOGIN With Google" button,
   **When** the click handler fires,
   **Then** the button enters a loading state (label becomes "Đang mở Google...", the
   Google icon is replaced by a spinner, the button is disabled) **before** the browser
   begins the OAuth redirect, so the click cannot be double-submitted.

3. **Given** the visitor completes Google consent with a `@sun-asterisk.com` identity,
   **When** Google redirects back to `/auth/callback?code=...`,
   **Then** the server route exchanges the code for a Supabase session, sets an HttpOnly
   `Secure` `SameSite=Lax` session cookie, and responds with a 302 to `/`.

4. **Given** the visitor already has a valid session cookie when opening `/login`,
   **When** the page loads,
   **Then** the server detects the session and immediately redirects (HTTP 302) to `/`,
   without rendering the login UI.

5. **Given** the visitor arrived at `/login?next=/kudos/123`,
   **When** authentication succeeds,
   **Then** the final redirect targets `/kudos/123` **only if** `next` resolves to a
   same-origin path; otherwise the app falls back to `/` to prevent open redirect.

---

### User Story 2 — See an accurate error when sign-in fails (Priority: P1)

**As a** visitor whose Google login cannot complete (consent denied, non-Sun\* domain,
transient Google error, or Supabase exchange failure),
**I want to** be told, in plain language, what went wrong,
**So that** I know whether to retry, use a different Google account, or contact support.

**Why this priority**: Failures on the only login path are indistinguishable from a
broken app if unhandled. Rapid, accurate diagnosis is part of the MVP.

**Independent Test**: Deny consent on the Google prompt; decode the error from the
callback URL; confirm the visitor lands back on `/login` with a localized error banner
and the button re-enabled.

**Acceptance Scenarios**

1. **Given** the visitor clicks "LOGIN With Google" and denies consent on Google's
   screen, **when** Google redirects with `error=access_denied`, **then** the visitor is
   returned to `/login`, an inline error banner (`role="alert"`, `aria-live="assertive"`)
   reads *"Đăng nhập đã bị huỷ. Vui lòng thử lại."* (or the EN equivalent), and the
   Google button is enabled again.

2. **Given** the visitor successfully consents with a Google account **not** on the
   Sun\* allow-list, **when** the Supabase callback rejects the identity, **then** the
   visitor is redirected to `Error page - 403` (`T3e_iS9PCL`) with copy that clearly
   states the domain is not authorized.

3. **Given** Google's authorization endpoint returns a 5xx or times out,
   **when** the error surfaces, **then** the inline banner reads *"Không kết nối được
   tới Google. Hãy thử lại sau."* and the button re-enables.

4. **Given** `supabase.auth.exchangeCodeForSession` throws,
   **when** the callback handler catches it, **then** the visitor is redirected to
   `/login?error=session_exchange_failed`, the banner reads *"Phiên đăng nhập không hợp
   lệ."*, and nothing sensitive (stack trace, token) is revealed in the URL or UI.

5. **Given** any of the above errors,
   **when** analytics are enabled, **then** a `login_error` event is emitted with
   `{ provider: "google", error_code }` — **without** any PII.

---

### User Story 3 — Switch the UI language before signing in (Priority: P2)

**As a** visitor who prefers English over Vietnamese (or vice versa),
**I want to** change the UI language from the header before I sign in,
**So that** I can read the copy on this screen — and every screen after login — in my
preferred language from the start.

**Why this priority**: Not strictly required to reach the product, but meaningful for
non-Vietnamese-speaking staff. The language dropdown frame already exists
(`Dropdown-ngôn ngữ` / `hUyaaugye2`) and is referenced from this screen's
`navigation.linkedFrameId`.

**Independent Test**: Click the `VN` toggle, select `EN`, confirm the hero copy and
button label are re-rendered in English, confirm a cookie named `NEXT_LOCALE` is set to
`en`, reload the page, confirm the language persists, sign in, confirm the post-login
Homepage is still English.

**Acceptance Scenarios**

1. **Given** the default Vietnamese page is shown,
   **when** the visitor clicks the language toggle (labeled `VN` with a flag and chevron),
   **then** the `Dropdown-ngôn ngữ` overlay opens with `VI` marked as currently selected
   and `EN` available.
2. **Given** the dropdown is open,
   **when** the visitor selects `EN`,
   **then** the page reloads (or re-renders) with English copy, the toggle label
   becomes `EN`, and the cookie `NEXT_LOCALE=en` is set with `Path=/; SameSite=Lax`.
3. **Given** the locale cookie exists,
   **when** the visitor navigates to `/login` on a later session,
   **then** the page renders directly in the stored language — no flicker.
4. **Given** the toggle button is focused,
   **when** the visitor presses `Enter` or `Space`,
   **then** the dropdown opens identically to a mouse click.

5. **Given** a screen-reader user focuses the language toggle,
   **when** the reader announces the button,
   **then** it reads the accessible name *"Chọn ngôn ngữ, hiện tại tiếng Việt"* (VI) or
   *"Select language, current English"* (EN) — **not** the bare character string "VN".

---

### Edge Cases

- **Cookie blocked / third-party cookies disabled**: Supabase Auth needs first-party
  cookies for the callback. If cookies are blocked, the callback MUST fall back to an
  error banner ("Trình duyệt của bạn đang chặn cookie — hãy bật cookie cho
  saa.sun-asterisk.com.") rather than loop silently.
- **Browser back after OAuth**: After successful login, pressing browser back to `/login`
  MUST redirect to `/`; the button MUST NOT re-initiate OAuth.
- **Multiple tabs**: If a second tab on `/login` sees a fresh session in another tab, it
  should redirect on next focus/render (rely on Next.js server component + session read
  on page mount).
- **Slow network**: If the OAuth redirect to Google takes more than 500 ms, keep the
  button in its loading state rather than falling back.
- **Screen reader**: Screen readers MUST announce the hero copy as a single paragraph
  per line break (two logical lines) and announce the button with its accessible name
  "Đăng nhập bằng Google".
- **Reduced motion**: Hero mount animation MUST be disabled when
  `prefers-reduced-motion: reduce`.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

All dimensions, colors, typography, spacing, and per-node CSS live in
**[design-style.md](design-style.md)**. The table below is the behavioral view.

| Component | Node ID | Description | Interactions |
|-----------|---------|-------------|--------------|
| Page frame | `662:14387` | Full-bleed dark page with hero background image | n/a |
| `C_Keyvisual` | `662:14388` | Full-page artwork behind everything | Display only |
| `A_Header` | `662:14391` | Translucent top bar (logo + language) pinned to top | Contains the language toggle |
| `A.1_Logo` | `I662:14391;186:2166` | SAA 2025 brand logo, left-aligned | None (not a home link here — this is the root of the public site) |
| `A.2_Language` | `I662:14391;186:1601` | Language toggle with flag + `VN` label + chevron | `click` / `Enter` → opens `Dropdown-ngôn ngữ` (`hUyaaugye2`); chevron rotates 180° while open |
| `Rectangle 57` | `662:14392` | Left-side vignette gradient for text legibility | Display only |
| `B_Bìa` (Hero) | `662:14393` | Hero section wrapper | Display only |
| `B.1_Key Visual` | `662:14395` | "ROOT FURTHER" brand artwork, 451×200 | Display only |
| `B.2_content` | `662:14753` | Hero copy (two lines, Vietnamese default) | Display only |
| `B.3_Login` / `Button-IC About` | `662:14425` / `662:14426` | Primary CTA: "LOGIN With Google" + Google icon | `click` / `Enter` / `Space` → start Supabase Google OAuth flow |
| `Cover` | `662:14390` | Bottom-up vignette fading into footer | Display only |
| `D_Footer` | `662:14447` | Copyright bar, fixed at bottom | Display only |

### Navigation Flow

- **From**: Any unauthenticated route on the SAA web app (app launch, logout, 403, 404).
- **To**:
  - `Homepage SAA` (`i87tDx10uM`) — on successful authentication.
  - `Dropdown-ngôn ngữ` (`hUyaaugye2`) — when the language toggle is clicked (verified
    by Figma's `A.2_Language.navigation.linkedFrameId`).
  - `Error page - 403` (`T3e_iS9PCL`) — when the signed-in identity is rejected by the
    Sun\* allow-list.
  - Back to `/login` with an inline banner — on recoverable OAuth errors.

### Visual Requirements

- Responsive breakpoints: mobile (<640px) / tablet (640–1023px) / desktop (≥1024px). See
  the Responsive Specifications section of `design-style.md`.
- Animations/Transitions: hero copy + CTA fade-in on mount (≤ 400 ms, staggered);
  chevron rotation on dropdown toggle; button hover/active transitions. All respect
  `prefers-reduced-motion`.
- Accessibility: WCAG 2.2 AA (constitution Principle IV — Platform-Appropriate UI/UX).
  Focus-visible ring on both interactive elements; semantic `<header>` + `<main>` +
  `<footer>` landmarks; button has a descriptive `aria-label`; error banner uses
  `role="alert"` + `aria-live="assertive"`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the login page as a **Server Component** by default.
  Only the language toggle and the Google button may opt into `"use client"` — each
  because they need event handlers and loading state.
- **FR-002**: The system MUST detect any existing Supabase session on server-side page
  load and, if present and valid, redirect the visitor to `/` without rendering the
  login UI.
- **FR-003**: The system MUST initiate Google OAuth via Supabase Auth on CTA click. The
  redirect URL MUST include `redirectTo = <origin>/auth/callback`.
- **FR-004**: The system MUST expose an `/auth/callback` Route Handler on the server
  that calls `supabase.auth.exchangeCodeForSession(code)`, sets the session cookie using
  `@supabase/ssr`, and responds with `302` to either a validated `next` param (same
  origin only) or `/`.
- **FR-005**: The system MUST reject any Google identity whose email domain is not on the
  Sun\* allow-list (enforced at Supabase Auth plus a defense-in-depth check in the
  callback), redirecting to `Error page - 403` with no session cookie set.
- **FR-006**: The system MUST debounce the CTA: after the first click, the button MUST
  become `disabled`, the label MUST change to the localized "Đang mở Google..." /
  "Opening Google...", and the Google icon MUST be replaced by a spinner — all before the
  redirect starts.
- **FR-007**: The system MUST render OAuth failures as an inline banner on `/login`,
  using the query string `?error=<code>` as the error source. The banner MUST be
  rendered **inside the hero column (`Frame 550`), directly above `B.2_content`** so it
  sits in the natural reading path above the CTA. It MUST receive focus on mount
  (`tabIndex={-1}` + programmatic `focus()`), have `role="alert"` and
  `aria-live="assertive"`, and MUST be dismissible with `Esc`.
- **FR-008**: The system MUST offer a language toggle that opens
  `Dropdown-ngôn ngữ`, persists the selected locale in a first-party cookie
  (`NEXT_LOCALE`), and re-renders the page copy in the chosen locale.
- **FR-009**: The system MUST render the SAA logo, language toggle, hero copy, CTA, and
  footer copyright at the dimensions, colors, typography, spacing, and node structure
  defined in `design-style.md`.
- **FR-010**: The system MUST NOT display, request, or accept any username / password /
  email input on this screen.
- **FR-011**: The system MUST allow the visitor to reach all interactive elements using
  only the keyboard, in visual order (language toggle → Google CTA), with a visible
  focus ring on each.
- **FR-012**: The language toggle MUST expose an accessible name via `aria-label` (not
  the bare text "VN"): *"Chọn ngôn ngữ, hiện tại tiếng Việt"* when VI is active, or
  *"Select language, current English"* when EN is active. It MUST also set
  `aria-expanded` and `aria-controls` against the language dropdown overlay.

### Technical Requirements

- **TR-001** (Performance): The login page MUST ship ≤ 50 KB of client JavaScript
  (gzipped) — the only client islands are the language toggle and the Google button.
  LCP MUST be ≤ 2.5 s on a simulated 4G connection (per constitution "Performance
  budgets").
- **TR-002** (Security — OWASP): No secret (Supabase service-role key, OAuth client
  secret) may be exposed to the browser. Only the Supabase **anon** key (which is safe
  for client use when RLS is in place) may be referenced from client components. The
  callback handler MUST run on the server and MUST validate the `next` param against a
  same-origin allow-list.
- **TR-003** (Security — cookies): The Supabase session cookie MUST be `HttpOnly`,
  `Secure`, `SameSite=Lax`; the `NEXT_LOCALE` cookie MUST be `SameSite=Lax` with no
  secret content.
- **TR-004** (Security — headers): The response MUST include the global CSP declared in
  the project's security headers, disallowing inline scripts and third-party script
  origins other than `accounts.google.com` (for the OAuth redirect).
- **TR-005** (Integration): The screen MUST use the shared `<Icon />` component for the
  flag, chevron, and Google icons (per constitution — no raw `<svg>`/`<img>` tags for
  icons).
- **TR-006** (Accessibility): Color contrast ratios MUST meet WCAG 2.2 AA. The current
  palette (cream CTA on navy, white text on navy) exceeds AAA; any future variant MUST
  be re-checked.
- **TR-007** (i18n): All user-visible strings on this screen (hero copy, button label,
  language labels, error banner copy, footer copyright) MUST be loaded from the i18n
  message catalog — never hardcoded in JSX. See **i18n Message Keys** below.
- **TR-008** (Runtime): The login page, the `/auth/callback` route handler, and any
  middleware used for session handling MUST be compatible with the Cloudflare Workers
  runtime (constitution Principle V). No Node.js built-ins (`fs`, `path`, `child_process`,
  etc.); prefer Web `crypto` over `node:crypto`; use `@supabase/ssr` (Workers-compatible)
  rather than `@supabase/auth-helpers-nextjs` (Node-only).
- **TR-009** (Package manager): Dependencies for this feature MUST be installed via
  **Yarn v1 (classic)** per constitution. No npm or pnpm lockfiles may appear.
- **TR-010** (Bundle size): The login-route client bundle (language toggle + Google
  button + error banner) MUST be ≤ 30 KB gzipped. Measured via `yarn build` + bundle
  analyzer; verified in CI for route `/login`.
- **TR-011** (File layout): The Supabase client for this feature MUST be imported from
  `@/libs/supabase/server.ts` (server components, callback handler) and
  `@/libs/supabase/client.ts` (the Google button). No ad-hoc `createClient` calls.

### Key Entities

The Login screen does not persist any new entity. It consumes the following entities
managed by Supabase Auth:

- **`auth.users`** (Supabase-managed): `id`, `email`, `raw_user_meta_data` (Google
  profile: `full_name`, `avatar_url`). Populated on first successful OAuth.
- **`auth.sessions`** (Supabase-managed): keyed by user; cookie reference lives in the
  browser; the application itself does not read this table directly.
- **(Optional) `public.user_profiles`**: the Homepage likely derives from this; it is
  out of scope for the Login screen but MUST exist before FR-002 can resolve sensibly
  for a brand-new user. A first-login insert trigger (on `auth.users` → seed
  `public.user_profiles`) is a **prerequisite** for this screen and will be tracked as a
  separate spec.

---

## i18n Message Keys

Every user-visible string on this screen MUST be served from the message catalog.
Suggested namespace: `login.*` / `common.*`. English strings below are TODO — confirm
with Product before translation.

| Key | VI (authoritative) | EN (draft — confirm with Product) | Used by |
|-----|---------------------|----------------------------------|---------|
| `login.hero.line1` | `Bắt đầu hành trình của bạn cùng SAA 2025.` | `Start your journey with SAA 2025.` | `B.2_content` line 1 |
| `login.hero.line2` | `Đăng nhập để khám phá!` | `Sign in to explore!` | `B.2_content` line 2 |
| `login.cta.default` | `ĐĂNG NHẬP với Google` *(see note below)* | `LOGIN With Google` | `B.3_Login` button label |
| `login.cta.loading` | `Đang mở Google…` | `Opening Google…` | `B.3_Login` during OAuth redirect |
| `login.error.access_denied` | `Đăng nhập đã bị huỷ. Vui lòng thử lại.` | `Sign-in was cancelled. Please try again.` | Error banner after user denies consent |
| `login.error.network` | `Không kết nối được tới Google. Hãy thử lại sau.` | `Couldn't reach Google. Please try again later.` | Error banner for 5xx / timeout |
| `login.error.session_exchange_failed` | `Phiên đăng nhập không hợp lệ.` | `Your sign-in session is invalid.` | Error banner after failed code exchange |
| `login.error.cookie_blocked` | `Trình duyệt của bạn đang chặn cookie — hãy bật cookie cho saa.sun-asterisk.com.` | `Your browser is blocking cookies — enable cookies for saa.sun-asterisk.com.` | Error banner when cookie write fails |
| `common.language.toggle.vi` | `Chọn ngôn ngữ, hiện tại tiếng Việt` | `Select language, current Vietnamese` | `A.2_Language` `aria-label` when VI |
| `common.language.toggle.en` | `Chọn ngôn ngữ, hiện tại tiếng Anh` | `Select language, current English` | `A.2_Language` `aria-label` when EN |
| `common.footer.copyright` | `Bản quyền thuộc về Sun* © 2025` | `© 2025 Sun* All rights reserved.` | `D_Footer` |

> Note on `login.cta.default`: Figma's rendered text reads "LOGIN With Google" — i.e.,
> the English-looking phrase appears in both locales in the current design. Confirm
> whether the VI locale should keep that phrasing or localize to "ĐĂNG NHẬP với Google".
> The table above reflects the safer (localized) option; update after Product confirms.

---

## API Dependencies *(predicted)*

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| Supabase `GET /auth/v1/user` (via `supabase.auth.getUser()`) | GET | Server-side session detection on page load | Supabase built-in |
| Supabase `POST /auth/v1/authorize?provider=google` (via `supabase.auth.signInWithOAuth`) | POST / 302 | Initiate Google OAuth | Supabase built-in |
| `GET /auth/callback?code=...&state=...` | GET | Exchange OAuth code for session cookie | **New** — Next.js Route Handler to add |
| `POST /api/i18n/preference` *(optional — cookie write may suffice)* | POST | Persist selected locale | **New / optional** |
| `GET /error/403` | GET | Render denied-domain page | **New** — static page (separate spec) |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (functional)**: 100% of Sun\* employees whose Google account is on the
  allow-list can reach the Homepage in ≤ 10 s (clicks through Google consent screen)
  in pre-launch UAT.
- **SC-002 (performance)**: LCP ≤ 2.5 s, TTI ≤ 3.0 s, CLS ≤ 0.1 on a simulated Moto G
  Power / slow 4G (Lighthouse mobile profile).
- **SC-003 (a11y)**: Lighthouse Accessibility score ≥ 95; axe-core reports zero
  serious/critical violations.
- **SC-004 (error rate)**: After the first two weeks post-launch, the `login_error`
  analytics event rate is < 2% of `login_attempt` (excluding deliberate `access_denied`).
- **SC-005 (i18n)**: `language_change` event fires within 200 ms of toggle selection and
  the new locale persists for at least the next 30 days across sessions.
- **SC-006 (security)**: Zero production secrets appear in the client bundle
  (verified by automated bundle-scan in CI, per constitution CI gate #5).

---

## State Management

### Local State (client components)

| State | Owned by | Type | Initial | Purpose |
|-------|----------|------|---------|---------|
| `isSubmitting` | `<GoogleLoginButton />` | boolean | `false` | Show spinner + disable button during OAuth redirect |
| `authError` | `<LoginPage />` (derived from `?error=` query) | `string \| null` | `null` | Render inline error banner |
| `isLanguageOpen` | `<LanguageToggle />` | boolean | `false` | Open/close language dropdown overlay |

### Global State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| Supabase session | Cookie managed by `@supabase/ssr` | Write (callback route) | Authenticated session |
| Current locale | `NEXT_LOCALE` cookie (Next.js i18n) | Read / Write | Drives i18n on every screen |

No client-side global store (Zustand, Redux, Context) is introduced by this screen.

### Cache

- Static assets (hero image, key visual, logo, Google icon, VN flag) MUST be served with
  `Cache-Control: public, max-age=31536000, immutable`.
- The page itself MUST be served uncached (`Cache-Control: no-store`) because it
  conditionally redirects when a session exists.

---

## Out of Scope

- Email / password login, passwordless magic links, biometric login.
- Self-registration or "request access" flows.
- "Forgot password" / account recovery (managed by Google Workspace).
- Multi-factor prompts beyond what Google Workspace already enforces.
- Language *selection inside the dropdown* (that behavior belongs to the
  `Dropdown-ngôn ngữ` spec; this screen only opens the dropdown and consumes its
  selection via cookie).
- Admin-role gating beyond "is authenticated". Admin route protection is a separate
  feature.

---

## Dependencies

- [x] Constitution document exists: [`.momorph/constitution.md`](../../constitution.md).
- [x] Screen is in SCREENFLOW: [`SCREENFLOW.md`](../../contexts/SCREENFLOW.md) lists
      Login as `discovered` with detail file
      [`screen_specs/login.md`](../../contexts/screen_specs/login.md).
- [x] Design-style document exists: [design-style.md](design-style.md) (sibling).
- [ ] Supabase project created, Google OAuth provider configured, and Sun\* domain
      added to the allow-list. Requires installing `@supabase/supabase-js` and
      `@supabase/ssr` via Yarn.
- [ ] Supabase client files scaffolded at `@/libs/supabase/server.ts`,
      `@/libs/supabase/client.ts`, and `@/libs/supabase/middleware.ts`.
- [ ] A testing framework compatible with the project's TDD requirement is installed
      (recommendation: Vitest + React Testing Library for unit/integration, Playwright
      for E2E). Installation is deferred until this feature begins implementation.
- [ ] API specifications (`.momorph/API.yml`) — out of scope for Login, will exist once
      `momorph.apispecs` runs on authenticated screens.
- [ ] Database design (`.momorph/database.sql`) — out of scope for Login; relies only on
      Supabase-managed `auth.*` tables.

---

## Notes

- **Figma typo**: Footer copy description field contains *"Bản quyền thuộc vè Sun\*
  © 2025"* (lowercase `vè`, typo). The visible `character` string in the same node
  correctly reads `Bản quyền thuộc về Sun* © 2025`. Use the correct visible string —
  mirrored into `common.footer.copyright` in the i18n table above.
- **Trailing space**: Figma's button label is `"LOGIN With Google "` with a trailing
  space. Strip on render.
- **Casing on the button label**: The Figma label mixes casing ("LOGIN With Google").
  Confirm with design whether this is intentional before shipping.
- **Figma → CSS layout**: Every child in the raw Figma export carries
  `position: absolute`. Real implementation uses normal flex flow per the Tailwind
  classes listed in `design-style.md`'s Implementation Mapping.
- **Footer alignment**: Figma exports `justify-content: space-between` for `D_Footer`
  but the single visible child is manually centered at x≈582–857 of the 1440 frame —
  the real CSS is `justify-center` (see `design-style.md` §15). This matters only if a
  second footer element is added later.
- **Next param safety**: Validate any `?next=` param against `url.origin ===
  request.origin` AND reject values containing `//` authority shortcuts, to prevent
  open-redirect abuse (OWASP — constitution Principle IV).
- **Defense in depth**: Even with Supabase's domain allow-list enabled, the
  `/auth/callback` handler MUST re-verify `user.email.endsWith('@sun-asterisk.com')`
  (or the configured allow-list) server-side. Do not rely on a single layer.
- **Spec cross-refs**: This spec will be consumed by `/momorph.plan` and
  `/momorph.tasks` for implementation planning; no code is produced yet.

---

## Open Questions *(for Product / Design / Security)*

**Business Logic**

- Q1. Is the OAuth allow-list exactly `@sun-asterisk.com`, or does it include any
  subdomain / partner domain?
- Q2. On a first successful Google sign-in for a brand-new user, who creates the
  `public.user_profiles` row — a Supabase DB trigger, the callback handler, or the
  Homepage on first hit? Affects FR-004.
- Q3. Should a brand-new (first-ever-login) user be redirected to Homepage `/` or to an
  onboarding flow (if one exists)?

**Design / Visual**

- Q4. Is the 40px reserved gap next to `B.3_Login` intentional for a future secondary
  action, or is it leftover? If intentional, what action?
- Q5. Should the button label remain `LOGIN With Google` in both locales, or be
  localized to `ĐĂNG NHẬP với Google` for VI? (Affects `login.cta.default`.)
- Q6. Confirm hover / active / focus visuals for the cream CTA — the Figma has no
  explicit variants; the design-style doc derives them.
- Q7. Should the header apply `backdrop-filter: blur(...)` on top of the 80% opacity
  fill, or is the alpha alone sufficient? (Workers may render differently than Chrome.)

**Technical / Security**

- Q8. Where will CSP be configured — Next.js middleware or Cloudflare Worker response
  headers? Needed to finalize TR-004.
- Q9. What is the intended session duration? Supabase default is 1 hour access + 30 day
  refresh; confirm per Sun* security policy.
- Q10. Is there a requirement to enforce 2FA beyond what Google Workspace provides?
