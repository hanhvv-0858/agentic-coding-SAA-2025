# Feature Specification: Onboarding — Complete Profile (Department + Display Name)

**Screen ID**: `ObrdH9pKx7` (synthetic — no Figma frame; derived from decision 2026-04-22)
**Screen Name**: `Onboarding - Complete profile`
**Created**: 2026-04-22
**Status**: Draft
**Parent decisions**: post-Google-OAuth gate to fill missing `profiles.department_id` and let users correct Google-supplied `display_name`. Discussed + confirmed in chat 2026-04-22:
- **Q1 fields** → department **and** display_name (both editable).
- **Q2 skip** → no skip button; copy explains why it is required.
- **Q3 legacy users** → existing users with `department_id IS NULL` are also funnelled through the gate on their next login.

> Visual specs (colors, typography, spacing) live in a separate sibling document:
> **[design-style.md](design-style.md)**. This spec focuses on behaviour, data, and
> acceptance criteria. Because the design has no Figma frame, `design-style.md`
> extends the Login screen (`GzbNeVGJHz`) visual system so the two screens feel
> like one continuous post-auth flow.

---

## Overview

Onboarding is a **one-time, post-login form** that blocks access to `/kudos`
(and every other authenticated route) until the user has set a
`profiles.department_id` and confirmed their `profiles.display_name`. It is
reached **only** via a server-side gate in
[src/proxy.ts](../../../src/proxy.ts) or the authenticated layout — users cannot
type `/onboarding` themselves and reach anything useful unless they have
`department_id IS NULL`.

**Why a gate instead of inline fields in the composer?**
- Google OAuth returns only `email` + `full_name` + `avatar_url`. Department is
  Sun\*-internal data that Google cannot provide.
- Kudos shows the sender's **and** recipient's department code on every feed
  card. Without a department, the card renders `—` which devalues demo/prod
  data and cannot be patched retroactively.
- A one-shot gate pays the friction once; inline composer fields pay it every
  time AND still leave receiver-side data gaps.

**Target users**
- **New Google-signed-in Sun\* employees** (primary) on their first session.
- **Legacy users** who were seeded before `profiles.department_id` became
  effectively required and whose row is still `NULL`.

**Business context**
- SAA 2025 requires accurate department attribution on every kudo card, honour
  tier computation, and department filter (live board, Spotlight, hashtag filters).
- No Workspace API / HRIS is wired up for MVP — manual self-select is the
  shortest path to complete data.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — New Google user completes onboarding and reaches Homepage (Priority: P1) 🎯 MVP

**As a** Sun\* employee signing in with Google for the first time,
**I want to** pick my department and confirm my display name in one place,
**So that** every kudo I send or receive is attributed correctly, without me
having to edit my profile later.

**Why this priority**: Without this form the core product (kudo feed, honour
tier, department filter) shows incomplete data for every new user. P1 by
definition.

**Independent Test**: Sign up with a brand-new `@sun-asterisk.com` Google
account, consent on Google's screen, land on `/onboarding`; confirm the form
shows `display_name` pre-filled from Google and department empty; pick a
department, submit; confirm redirect to `/` and the header shows the chosen
department code.

**Acceptance Scenarios**

1. **Given** a new Sunner has just completed Google OAuth and
   `profiles.department_id IS NULL`, **when** the `/auth/callback` handler
   resolves the session and the user's next navigation hits any route, **then**
   the proxy / layout redirects (HTTP 302 or `redirect()`) to `/onboarding`.
2. **Given** the user lands on `/onboarding`, **when** the page renders,
   **then** the form shows:
   - A required **Display name** text input **pre-filled** from
     `profiles.display_name` (seeded by the `on_auth_user_created` trigger
     from Google's `full_name`), editable, 2–80 chars (same bounds as
     `AnonymousAliasField.maxLength = 40` but doubled since this is the real
     name — confirmed as a sensible default, can be adjusted).
   - A required **Department** selector populated from the existing
     `getKudoDepartments()` Server Action (49 canonical codes, alphabetical,
     locale-resolved label).
   - A paragraph of description copy explaining *why* the form is mandatory
     (see FR-008 copy below).
   - A single **"Hoàn tất" / "Complete"** submit button.
   - **No skip button, no "Later" link, no close X.** The only exit path is
     submission.
3. **Given** the form is valid, **when** the user clicks Submit, **then** the
   `completeOnboarding()` Server Action updates `profiles`
   SET `display_name = <input>`, `department_id = <selected dept.id>`,
   returns `{ ok: true }`, and the page server-redirects to `/`.
4. **Given** the submit triggers a network / RPC failure, **when** the Server
   Action throws, **then** the page shows an inline error banner
   (`role="alert"` `aria-live="assertive"`) with a localized message and the
   submit button re-enables so the user can retry.
5. **Given** the user somehow navigates to `/onboarding` while their profile
   already has `department_id != NULL`, **when** the page loads, **then** it
   server-redirects to `/` immediately (the page is not reachable once the
   gate is passed).

---

### User Story 2 — Legacy user with NULL department is funnelled through the gate (Priority: P1)

**As a** Sun\* employee who signed up before the onboarding gate existed and
whose `profiles.department_id` is still `NULL`,
**I want to** be asked once — at my next login — to pick my department,
**So that** my kudos start rendering with the correct department code and my
historical kudos backfill automatically.

**Why this priority**: Matches decision Q3. Without this, the data-gap problem
isn't fully solved — only new users get correct data.

**Independent Test**: Take any existing user whose `department_id IS NULL`,
sign them in via Google, confirm they land on `/onboarding` rather than `/`.

**Acceptance Scenarios**
1. **Given** an existing user whose `profiles.department_id IS NULL`, **when**
   they complete Google OAuth and their session is established, **then** the
   gate routes them to `/onboarding` identically to US1. The legacy-vs-new
   distinction is invisible to the user.
2. **Given** the user submits the form, **when** the Server Action updates
   `profiles`, **then** all kudos that reference the user as sender or
   recipient **automatically** start rendering with the new department code on
   next feed refresh (the join is at read-time, no per-kudo backfill needed).

---

### User Story 3 — User with department already set bypasses the gate (Priority: P1)

**As a** returning Sunner who already completed onboarding (or was seeded with
a department by a fixture script / admin action),
**I want to** sign in and land directly on the Homepage without being stopped
at `/onboarding`,
**So that** the gate never becomes recurring friction.

**Independent Test**: Sign in with a fixture account whose `department_id` is
set. Confirm the redirect chain is `Google → /auth/callback → /` with no stop
at `/onboarding`.

**Acceptance Scenarios**
1. **Given** `profiles.department_id IS NOT NULL`, **when** the user lands on
   any authenticated route, **then** the proxy / layout does NOT redirect to
   `/onboarding`.
2. **Given** the user manually types `/onboarding` in the URL bar, **when** the
   page loads, **then** the server immediately `redirect("/")` — the form is
   unreachable.

---

### Edge Cases

- **User's Google `full_name` is empty or only whitespace**: the `display_name`
  column ends up NULL/empty; the form renders with the input empty and the
  client-side "required" validation blocks submission with localized copy.
- **User clears the display_name input and submits**: validation fails with
  *"Vui lòng nhập họ tên hiển thị."* / *"Please enter your display name."*.
- **User submits the form twice rapidly**: FR-006 — the submit button debounces
  (`disabled + spinner + aria-busy`) until the Server Action returns.
- **User browser-backs after completing**: previous URL was `/onboarding`; back
  button triggers a fresh navigation which now sees `department_id != NULL` →
  redirect to `/` per US3.
- **Department list fetch fails at page load**: render an inline retry banner
  (same pattern as `FilterDropdown`'s `loadError` state) and keep the form
  disabled until retry succeeds.
- **Concurrent tabs**: tab A finishes onboarding → tab B was idle on
  `/onboarding`. On tab B's next submit the write still succeeds (idempotent —
  SET repeats the same values) and redirect fires. Acceptable.
- **Session cookie expires mid-form**: the Server Action returns
  `{ error: "session_expired" }` and the page redirects to `/login?next=/onboarding`
  so the user re-auths and lands back here.
- **Reduced motion**: no motion is used on this screen (no hero animation, no
  focus transitions) so no `prefers-reduced-motion` branch needed.

---

## UI/UX Requirements

### Screen Components

| Component | Purpose | Interactions |
|-----------|---------|--------------|
| Page background | Reuse Login hero background image (or a solid navy fallback) so the transition from Login → Onboarding feels continuous | Display only |
| Branding header | SAA logo (left), language toggle (right) — same header as Login | Language toggle opens `Dropdown-ngôn ngữ` (`hUyaaugye2`) |
| Welcome copy | `h1` "Hoàn tất hồ sơ của bạn" + paragraph explaining why the form is required | Display only |
| Account disambiguation row *(see Q2)* | Small row above the form showing `avatar_url` (32×32 circle) + `email` so the user can confirm the right Google account | Display only |
| Display name input | Required text input; Montserrat 16/24/500; pre-filled from Google profile; 2–80 chars | Live validation: blur → show error if empty or too short; aria-invalid toggles on error |
| Department select | Required single-select from the 49 canonical department codes (`getKudoDepartments()`); shows code as option value; label is locale-resolved (VN = EN = code per the existing `departments` policy) | Opens native dropdown on click / `Enter` / `Space`; `Arrow↑↓` navigate; `Enter` commits; `Esc` closes; `aria-invalid` toggles on error |
| Submit button | Primary cream-filled CTA "Hoàn tất" / "Complete" | Disabled until both fields valid; spinner + disabled state during submit (`aria-busy="true"` on form) |
| Error banner (conditional) | Rendered above the form when Server Action fails; auto-focused (`tabIndex={-1}` + `.focus()`); `Esc` dismisses | `role="alert"` `aria-live="assertive"` |
| Footer copyright | Reuse Login footer copy | Display only |

### Navigation Flow

- **Entry points (from)** — authenticated-only:
  - `/auth/callback` → after successful OAuth code exchange, the authenticated
    layout detects `profiles.department_id IS NULL` and redirects here.
  - Any other authenticated URL typed directly (e.g. `/`, `/kudos`, `/awards`) →
    same redirect rule fires on the first Server Component render.
  - Browser back-button from `/` or `/kudos` → gate re-evaluates; if
    `department_id` is still `NULL` we re-land here.
- **Exit points (to)**:
  - `/` (Homepage SAA, `i87tDx10uM`) — after successful `completeOnboarding()`
    submit (the default happy path).
  - `/login?next=/onboarding` — if the session expired mid-form (see UI States
    table, *Error (session expired)*).
  - `Dropdown-ngôn ngữ` (`hUyaaugye2`) — overlay opens when the language
    toggle is clicked; overlay dismisses back to `/onboarding`.
- **Blocked transitions**:
  - Users MUST NOT be able to navigate to `/kudos`, `/awards`, `/the-le`, or
    `/` without completing the form — any such navigation re-redirects to
    `/onboarding`.
  - Signing out (POST `/auth/signout` via the language-independent logout form)
    MUST still work from this screen so users can switch accounts.

### Visual Requirements

- **No new design tokens.** Reuse from [`b1Filzi9i6-the-le`](../b1Filzi9i6-the-le/design-style.md)
  and [`GzbNeVGJHz-login`](../GzbNeVGJHz-login/design-style.md):
  - Background: `--color-brand-900` navy with hero-bg image overlay
  - Surface card (the form wrapper): `--color-modal-paper` with
    `rounded-2xl` + `shadow-[var(--shadow-kudo-card)]` (existing token —
    [src/app/globals.css:82](../../../src/app/globals.css#L82))
  - Text: `--color-foreground` on the card, white on the page bg
  - Input borders: `--color-border-secondary` (olive)
  - CTA: `--color-accent-cream` fill + `--color-brand-900` text
- **No Figma frame** — visual choices are derived defaults; `design-style.md`
  documents them explicitly so future design iterations don't have to
  re-derive.
- **Responsive**: mobile <640px = full-width card with 16 px side-inset;
  desktop ≥ 1024px = 520 px wide card centered vertically + horizontally.
- **Accessibility**: WCAG 2.2 AA. Visible focus ring on every focusable element.
  Form uses native `<form>` + labeled `<input>`/`<select>`; live region for
  errors; `aria-invalid` on invalid fields.
- **Keyboard order** (left-to-right, top-to-bottom):
  1. Language toggle (header)
  2. Display name input
  3. Department select (opens native dropdown with `Space` / `Enter`;
     `Arrow↑↓` navigate options)
  4. Submit button
  5. Sign-out recovery link (per Q7 — always rendered).
  After redirect the next page's focus order takes over.
- **Screen reader announcements**:
  - `h1` title: *"Hoàn tất hồ sơ của bạn"*
  - Description paragraph is read after the title
  - Each field announces `label + (required)` + its current value + any error
  - Error banner: `role="alert"` → announced immediately on mount
  - Submit button: announces `Hoàn tất, nút` (VI) / `Complete, button` (EN);
    while loading announces `aria-busy` as "busy".

---

## Data Requirements

| Field | Source | Type | Validation (client + server) | Persisted to |
|-------|--------|------|------------------------------|--------------|
| `display_name` | pre-filled from `profiles.display_name` (seeded by `on_auth_user_created` trigger from Google `full_name`) — editable | `string` | required; `trim()`d length ∈ [2, 80]; Unicode letters + spaces + `-` + `'` + `.`; auto-trim leading/trailing whitespace; reject if post-trim length < 2 | `profiles.display_name` |
| `department_code` | `getKudoDepartments()` Server Action (49 canonical codes, locale-resolved label) | `string` | required; MUST be one of the codes returned by the action (server re-validates by looking up `departments.id`) | `profiles.department_id` (via `departments.code → departments.id` lookup) |
| `avatar_url` (display only) | `profiles.avatar_url` (populated from Google `picture` on first sign-in) | `string \| null` | n/a — read only, not submitted | not written by this screen |
| `email` (display only, see §Q2) | `auth.users.email` | `string` | n/a — shown as account-identifier disambiguation | not written by this screen |

## UI States

Every state below MUST be reachable via keyboard and announced by screen readers.

| State | Trigger | UI | Controls enabled |
|-------|---------|-----|------------------|
| **Initial (default)** | Page load, both fields empty or `display_name` pre-filled | Form visible, submit disabled until both fields pass validation | Display name + department select |
| **Valid** | Both fields pass client-side validation | Submit enabled (cream fill) | All |
| **Submitting** | User clicks Submit | Spinner icon replaces chevron; label swaps to `onboarding.submit.loading`; form fields + submit button `disabled`; `aria-busy="true"` on form | None |
| **Error (validation)** | Blur on invalid field OR submit with invalid field | Per-field `aria-invalid="true"`, red border, inline error line below field, submit re-enabled after user edits | All fields remain enabled |
| **Error (submit)** | Server Action returns failure (non-session) | Inline banner at top of card (`role="alert"` `aria-live="assertive"`, auto-focused `tabIndex={-1}`), form re-enabled, submit button back to default | All |
| **Error (session expired)** | Server Action returns `session_expired` | Transient banner `onboarding.errors.submit.sessionExpired`, then `redirect("/login?next=/onboarding")` after **1.5 s** delay (per Q8) | None (redirecting) |
| **Error (department list fetch failed)** | `getKudoDepartments()` throws on page load | Department select replaced with an inline retry banner showing `onboarding.errors.departmentList.loadFailed` + `onboarding.errors.departmentList.retry` button; display_name still editable; submit disabled until retry succeeds | Display name + Retry button |
| **Empty (department list empty)** | `getKudoDepartments()` returns `[]` | Department select disabled with `aria-disabled="true"`; banner above the form shows `onboarding.errors.departmentList.empty` | Display name only |

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Server-side routing MUST redirect any authenticated user whose
  `profiles.department_id IS NULL` to `/onboarding` before rendering any other
  authenticated route. Enforced in [src/proxy.ts](../../../src/proxy.ts) (or,
  if proxy cannot read DB cheaply, in the shared authenticated layout).
- **FR-002**: Server-side routing MUST redirect any authenticated user whose
  `profiles.department_id IS NOT NULL` **away from** `/onboarding` to `/`.
- **FR-003**: `/onboarding` MUST be **unreachable to unauthenticated users** —
  the existing session check (Login spec FR-002) fires first and sends them to
  `/login`.
- **FR-004**: The page MUST be a **Server Component** that fetches the current
  profile (`display_name`) + department list (`getKudoDepartments()`) on load,
  and passes them as props to a thin client island that owns only form state.
- **FR-005**: The form MUST validate both fields client-side before submit:
  - `display_name`: `trim()`d length ∈ [2, 80]; charset regex
    `^[\p{L}\p{M}\s\-'.]+$` with `u` flag (Unicode letters + combining marks
    + whitespace + `-` + `'` + `.` per Q1). Emoji + control characters
    rejected.
  - `department_code`: MUST be one of the codes returned by
    `getKudoDepartments()` — defense-in-depth re-validated server-side.
- **FR-006**: On submit the `completeOnboarding(formData)` Server Action MUST:
  1. Re-read `auth.users.id` from the session.
  2. Re-validate both fields (defense in depth — never trust client).
  3. Look up `departments.id` by the submitted code; reject if not found.
  4. `UPDATE profiles SET display_name, department_id WHERE id = auth.uid()`.
  5. Redirect to `/` via `redirect("/")` so the browser URL changes.
- **FR-007**: The submit button MUST debounce (disabled + spinner) from the
  moment the form submits until the server responds.
- **FR-008**: The form MUST include a **description paragraph** in both
  locales explaining why the form is required. Confirmed copy (pending
  Product sign-off):
  - VI: *"Để mỗi lời cảm ơn bạn gửi và nhận được hiển thị đúng phòng ban, vui
    lòng hoàn tất thông tin dưới đây. Bước này chỉ thực hiện một lần."*
  - EN: *"So that every kudo you send and receive shows the right department,
    please complete the information below. You only need to do this once."*
- **FR-009**: The form MUST NOT render a skip / "do this later" affordance.
  There is no keyboard shortcut, no close X, and no URL to bypass the gate.
- **FR-010**: The language toggle MUST be present + functional (same behaviour
  as Login).
- **FR-011**: All user-visible copy MUST be served from the i18n catalog —
  namespace `onboarding.*`. See **i18n Message Keys** below.
- **FR-012**: The Server Action MUST emit a typed analytics event
  `onboarding_complete` with payload
  `{ has_display_name_changed: boolean; has_department_changed: boolean }`
  on success. **No PII** in the payload. See the Analytics section below
  for contract detail.
- **FR-013**: If the user row does not exist yet when the form submits (trigger
  race on a brand-new user), the Server Action MUST `upsert` the profile row
  with both fields set.

### Technical Requirements

- **TR-001** (Routing — cheap check): The proxy / layout check for
  `department_id` MUST NOT trigger a DB round-trip on every request. Strategy:
  cache `has_department` in the Supabase session's `app_metadata` (set by a
  DB trigger `AFTER UPDATE profiles SET department_id IS NOT NULL → write custom claim`)
  OR add a `user-has-department` cookie flipped on first-successful submit.
  **Default pick for MVP**: use the authenticated **layout** (Server Component)
  that does a single lightweight `SELECT department_id FROM profiles WHERE id = auth.uid()`
  on navigation — one DB call per page load, acceptable for MVP. Defer the
  custom-claim approach to Phase 2 if measured to be costly.
- **TR-002** (RLS): `profiles UPDATE` MUST be allowed by existing RLS policy
  `profiles_update_own` (user can update their own row). Verify policy exists;
  if not, add migration.
- **TR-003** (SSR + Workers compat): All code MUST run on Cloudflare Workers
  (constitution §V). No `node:*` imports; use `@supabase/ssr`.
- **TR-004** (i18n): VI is the authoritative source; EN catalog keys
  (`onboarding.*`) added alongside.
- **TR-005** (Bundle): Client island MUST be ≤ 10 KB gzipped. Contains only
  the form state + validation logic; the department select can reuse a
  `<select>` native control to keep the bundle tiny, then upgrade to a styled
  listbox if UX review asks for it.
- **TR-006** (Accessibility): Lighthouse a11y ≥ 95; axe-core zero serious /
  critical violations. Every interactive element has a visible focus ring
  (`focus-visible:outline-2 outline-[var(--color-accent-cream)]`).
- **TR-007** (Idempotency): Re-submitting the form twice with identical input
  MUST be safe (UPDATE is idempotent for the same values). Re-submitting with
  different input MUST overwrite — no "already set" error.

### Key Entities

- **`public.profiles`** (existing — migration 0001). Columns touched:
  - `display_name TEXT`
  - `department_id UUID REFERENCES departments(id)` (set from NULL → not-NULL
    by this flow)
- **`public.departments`** (existing — migration 0011). Read-only from this
  screen.
- **`auth.users`** (Supabase-managed). Read-only from this screen.

No migration expected if existing `profiles_update_own` RLS allows `display_name`
and `department_id` updates by the owner. Verify during TDD phase; add a
targeted migration if RLS blocks.

---

## i18n Message Keys

Namespace: `onboarding.*`. Copy table:

| Key | VI | EN (draft — confirm with Product) |
|-----|----|-----------------------------------|
| `onboarding.title` | `Hoàn tất hồ sơ của bạn` | `Complete your profile` |
| `onboarding.description` | `Để mỗi lời cảm ơn bạn gửi và nhận được hiển thị đúng phòng ban, vui lòng hoàn tất thông tin dưới đây. Bước này chỉ thực hiện một lần.` | `So that every kudo you send and receive shows the right department, please complete the information below. You only need to do this once.` |
| `onboarding.fields.displayName.label` | `Họ và tên hiển thị` | `Display name` |
| `onboarding.fields.displayName.placeholder` | `Ví dụ: Nguyễn Văn A` | `e.g. John Doe` |
| `onboarding.fields.department.label` | `Phòng ban` | `Department` |
| `onboarding.fields.department.placeholder` | `Chọn phòng ban của bạn` | `Select your department` |
| `onboarding.errors.displayName.required` | `Vui lòng nhập họ tên hiển thị.` | `Please enter your display name.` |
| `onboarding.errors.displayName.tooShort` | `Họ tên cần tối thiểu 2 ký tự.` | `Display name must be at least 2 characters.` |
| `onboarding.errors.displayName.tooLong` | `Họ tên tối đa 80 ký tự.` | `Display name must be at most 80 characters.` |
| `onboarding.errors.department.required` | `Vui lòng chọn phòng ban của bạn.` | `Please select your department.` |
| `onboarding.errors.department.invalid` | `Phòng ban không hợp lệ. Vui lòng chọn lại.` | `Invalid department. Please pick one from the list.` |
| `onboarding.errors.submit.generic` | `Không thể lưu thông tin. Vui lòng thử lại.` | `Couldn't save. Please try again.` |
| `onboarding.errors.submit.sessionExpired` | `Phiên đăng nhập đã hết hạn. Đang chuyển về trang đăng nhập…` | `Your session expired. Redirecting to sign-in…` |
| `onboarding.errors.departmentList.loadFailed` | `Không tải được danh sách phòng ban. Vui lòng thử lại.` | `Couldn't load departments. Please try again.` |
| `onboarding.errors.departmentList.retry` | `Thử lại` | `Retry` |
| `onboarding.errors.departmentList.empty` | `Không tìm thấy danh sách phòng ban. Vui lòng liên hệ quản trị viên.` | `No departments available. Please contact an administrator.` |
| `onboarding.submit.default` | `Hoàn tất` | `Complete` |
| `onboarding.submit.loading` | `Đang lưu…` | `Saving…` |
| `onboarding.signOut.cta` | `Không phải bạn? Đăng xuất và thử lại` | `Not you? Sign out and try again` |

---

## Analytics

One new typed event is emitted on successful submit.

| Event | Fired by | Payload | Notes |
|-------|----------|---------|-------|
| `onboarding_complete` | `completeOnboarding()` Server Action, before `redirect("/")` | `{ has_display_name_changed: boolean; has_department_changed: boolean }` | **No PII** — we deliberately exclude `department_code`, `user_id`, and any name fragment. `has_*_changed` compares the submitted value against the pre-form profile state. See Q3. |

No `onboarding_view` / `onboarding_submit_attempt` events in MVP — add later
if SC-001 (first-attempt completion rate) needs funnel diagnostics.

## API Dependencies

| Endpoint / Action | Method | Purpose | Status |
|-------------------|--------|---------|--------|
| `getKudoDepartments()` Server Action | — | Returns the 49 department codes with localized labels | **Exists** ([src/app/kudos/actions.ts:659](../../../src/app/kudos/actions.ts#L659)) |
| `completeOnboarding(formData)` Server Action | POST (form action) | Validates + updates `profiles.display_name` + `profiles.department_id`; redirects | **New** — `src/app/onboarding/actions.ts` |

---

## Success Criteria

### Measurable Outcomes
- **SC-001**: ≥ 99 % of new Google users complete the form on first attempt
  (tracked via `onboarding_complete` event rate / `login_success` event rate
  for first-time users).
- **SC-002**: Median time on `/onboarding` ≤ 60 seconds.
- **SC-003**: After rollout, zero kudo feed cards render `—` for sender or
  recipient department (audited weekly via a SQL count on
  `profiles.department_id IS NULL`).
- **SC-004**: Lighthouse a11y ≥ 95; axe-core zero serious / critical
  violations.

---

## State Management

### Local state (client island)
| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `displayName` | string | profile-provided | editable text input |
| `departmentCode` | string \| null | null | chosen department |
| `errors` | `{ displayName?: string; department?: string; submit?: string }` | `{}` | inline validation |
| `isSubmitting` | boolean | `false` | debounce + spinner |

### Global state
None. Server Action writes directly to DB; next page load re-reads profile.

---

## Out of Scope
- Avatar picker / upload (Google's `avatar_url` is used as-is).
- Editing email or honorific.
- Choosing sub-team or role within department.
- Any "invite colleagues" step.
- HRIS / Workspace API integration (future; would auto-fill department).

---

## Dependencies
- [x] Constitution document exists.
- [x] `getKudoDepartments()` Server Action exists.
- [x] `departments` table seeded with the 49 canonical codes (migration 0011).
- [x] `profiles` table has `department_id` nullable (migration 0001).
- [ ] RLS policy allowing the row owner to `UPDATE` `display_name` +
      `department_id` — **verify in Phase 0 audit** (plan.md T002). Add a
      targeted migration if the existing policy is missing or too narrow.
- [ ] `completeOnboarding()` Server Action — to be added.
- [ ] `src/proxy.ts` (or authenticated layout) branch for `department_id IS NULL`.
- [ ] `onboarding.*` i18n keys added to `src/messages/en.json` + `vi.json`.
- [ ] Update to Login spec (post-login routing section) — see
      [GzbNeVGJHz-login/spec.md](../GzbNeVGJHz-login/spec.md).
- [ ] Update to SCREENFLOW — add Onboarding node + edges.

---

## Decision Log

All Q1–Q8 resolved 2026-04-22 (user confirmed all QA recommendations).

| # | Decision | Notes |
|---|----------|-------|
| Q1 | `display_name` charset = Unicode letters `\p{L}` + whitespace + `-` + `'` + `.` | Regex: `^[\p{L}\p{M}\s\-'.]+$` (with `u` flag). Emoji + control chars rejected. Auto-trim leading/trailing whitespace **before** length check. Reject if post-trim length ∉ [2, 80]. |
| Q2 | Show avatar + email disambiguation row | Read `profiles.avatar_url` + `auth.users.email` at page-load; render per design-style §4.0. Display-only. |
| Q3 | `onboarding_complete` analytics payload omits `department_code` | Payload is exactly `{ has_display_name_changed, has_department_changed }`. No user id, no name fragment, no org code. |
| Q4 | Admins treated as regular users for onboarding | No separate admin onboarding path. Admin role flip via `app_metadata.role` remains out-of-scope for this spec. |
| Q7 | Sign-out recovery link rendered unconditionally | Affordance: *"Không phải bạn? Đăng xuất và thử lại"* / *"Not you? Sign out and try again"*. Reuses existing `signOut` Server Action — no new endpoint. Design-style §5.1 is no longer conditional. |
| Q5 | Locale default = inherit `NEXT_LOCALE` cookie, fallback VI | Onboarding layout reads the cookie via existing `getLocale()`; language toggle in the header can flip mid-form and server-renders immediately. |
| Q6 | Add two new i18n keys for empty-department-list copy | See the i18n Message Keys table below — rows `onboarding.errors.departmentList.empty` + `onboarding.errors.departmentList.loadFailed` + `onboarding.errors.departmentList.retry`. |
| Q8 | Session-expired banner → 1.5 s delay → `redirect("/login?next=/onboarding")` | Client-side `setTimeout` after banner mount. Fallback: the Server Action can also return a 302 immediately if the session is already gone at form-submit time — both paths land on `/login`. |
