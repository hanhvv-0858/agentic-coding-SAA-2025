# Screen: Onboarding — Complete Profile (Department + Display Name)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `ObrdH9pKx7` (synthetic — no Figma frame) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ObrdH9pKx7 |
| **Screen Group** | Authentication / post-login gate |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

One-time **post-login form** mounted at `/onboarding` that blocks every
authenticated route until the signed-in user has set
`profiles.department_id` and confirmed `profiles.display_name`.

Reached only via a **server-side gate** in `src/proxy.ts` (or the
authenticated layout) that redirects any Sunner whose
`profiles.department_id IS NULL` to `/onboarding` before rendering `/`,
`/kudos`, `/awards`, etc. Once submitted, the gate flips and all future
navigations bypass `/onboarding`. Typing `/onboarding` directly with a
complete profile server-redirects to `/`.

No Figma frame exists — the design inherits Login's visual system (hero
backdrop + cream CTA + footer) so the Login → Onboarding transition feels
continuous.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| `/auth/callback` | Post-OAuth redirect | `profiles.department_id IS NULL` |
| Any authenticated route (`/`, `/kudos`, `/awards`, `/the-le`) | Gate redirect in proxy/layout | Same condition (covers legacy users too) |
| Browser back from `/` | Re-evaluates gate | If `department_id IS NULL`, lands back here |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Homepage SAA (`/`) | Submit success | — | High | `completeOnboarding()` Server Action calls `redirect("/")` |
| Dropdown-ngôn ngữ (`hUyaaugye2`) | Language toggle in header | — | High | Overlay — returns to `/onboarding` |
| `/login?next=/onboarding` | Session expired (1.5 s delay) | — | High | Transient banner → redirect |
| `/login` | Click "Không phải bạn? Đăng xuất và thử lại" | — | High | Uses shared `signOut` Server Action |

### Navigation Rules

- **Back behavior**: Browser back from post-submit `/` re-enters the gate; if
  `department_id` now set, gate redirects forward to `/`.
- **Deep link support**: `/onboarding` exists but is unreachable once the
  gate is passed — direct URL entry server-redirects to `/`.
- **Auth required**: Yes — unauthenticated access sends to `/login`.
- **Blocked transitions**: All other authenticated routes redirect here
  while `department_id IS NULL`.

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────────────┐
│  Header  [Logo]               [Language ▾]   │
├──────────────────────────────────────────────┤
│                                              │
│       ┌────────────────────────────────┐     │
│       │  Avatar + email (disambig row) │     │
│       │                                │     │
│       │  Hoàn tất hồ sơ của bạn (h1)   │     │
│       │  Description paragraph…        │     │
│       │                                │     │
│       │  Display name *                │     │
│       │  [Google full_name prefilled] │     │
│       │                                │     │
│       │  Phòng ban *                   │     │
│       │  [Chọn phòng ban của bạn  ▾]   │     │
│       │                                │     │
│       │  [  Hoàn tất  ]                │     │
│       │                                │     │
│       │  Không phải bạn?               │     │
│       │  Đăng xuất và thử lại          │     │
│       └────────────────────────────────┘     │
│                                              │
├──────────────────────────────────────────────┤
│  Footer copyright                            │
└──────────────────────────────────────────────┘
```

### Component Hierarchy

```
OnboardingPage (Server Component — /onboarding)
├── OnboardingHeader (reused from Login)
│   ├── Logo
│   └── LanguageToggle
├── OnboardingFormCard (client island)
│   ├── AccountDisambiguationRow (avatar + email)
│   ├── Heading "Hoàn tất hồ sơ của bạn"
│   ├── Description paragraph
│   ├── DisplayNameInput (required, pre-filled)
│   ├── DepartmentSelect (required, from getKudoDepartments)
│   ├── SubmitButton "Hoàn tất"
│   ├── ErrorBanner (role="alert", conditional)
│   └── SignOutLink "Không phải bạn?"
└── SiteFooter (reused from Login)
```

### Main Components

| Component | Type | Description | Reusable |
|-----------|------|-------------|----------|
| OnboardingFormCard | Organism | Cream-surface card centring the 2-field form | No |
| DisplayNameInput | Molecule | Text input 2–80 Unicode chars; pre-filled from Google `full_name` | No |
| DepartmentSelect | Molecule | Native `<select>` populated from 49 canonical department codes | Yes (could migrate to styled listbox later) |
| SubmitButton | Atom | Cream primary CTA w/ loading spinner during submit | Yes |
| SignOutLink | Atom | Recovery affordance — posts to `signOut` Server Action | Yes |

---

## Form Fields

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| `display_name` | text | Yes | Trimmed length ∈ [2, 80]; charset `^[\p{L}\p{M}\s\-'.]+$` with `u` flag; rejects emoji + control chars | "Ví dụ: Nguyễn Văn A" |
| `department_code` | select (enum) | Yes | Must be one of the 49 codes returned by `getKudoDepartments()`; server re-validates via `departments.code → departments.id` lookup | "Chọn phòng ban của bạn" |

### Validation Rules

```typescript
// Both fields validated client-side before Server Action call,
// AND re-validated server-side (defense-in-depth)
const displayName = z.string()
  .trim()
  .min(2, "onboarding.errors.displayName.tooShort")
  .max(80, "onboarding.errors.displayName.tooLong")
  .regex(/^[\p{L}\p{M}\s\-'.]+$/u, "onboarding.errors.displayName.invalid");

const departmentCode = z.string().refine(
  (code) => knownCodes.includes(code),
  { message: "onboarding.errors.department.invalid" },
);
```

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `supabase.auth.getUser()` | built-in | Session + `profiles.display_name` / `avatar_url` | Pre-fill form + render disambiguation row |
| `getKudoDepartments()` (`src/app/kudos/actions.ts:659`) | Server Action | 49 canonical codes w/ locale-resolved labels | Populate DepartmentSelect options |
| Profile lookup (`SELECT department_id FROM profiles WHERE id = auth.uid()`) | RSC | Gate enforcement | Redirect to `/` if already set |

DB tables read: `profiles`, `departments`, `auth.users`.

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Submit form | `completeOnboarding(formData)` in `src/app/onboarding/actions.ts` | Server Action (form) | `{ display_name, department_code }` | UPSERT into `profiles` + `redirect("/")` |
| Retry dept fetch | `onRetry` → re-invoke `getKudoDepartments()` | client | — | Refresh options |
| Language toggle | `setLocale` Server Action | — | `{ locale }` | Cookie + `revalidatePath("/")` |
| Sign out recovery | `signOut` Server Action | form action | — | Terminate session + `redirect("/login")` |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| Network / 5xx | `onboarding.errors.submit.generic` | Inline banner top-of-card; re-enable submit |
| Session expired | `onboarding.errors.submit.sessionExpired` | Banner → 1.5 s → `redirect("/login?next=/onboarding")` |
| Department list fetch fails | `onboarding.errors.departmentList.loadFailed` + Retry | Inline retry above select |
| Department list empty | `onboarding.errors.departmentList.empty` | Banner; select disabled |

---

## State Management

### Local State (client island)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `displayName` | string | profile-provided | Editable text input |
| `departmentCode` | `string \| null` | `null` | Chosen department |
| `errors` | `{ displayName?: string; department?: string; submit?: string }` | `{}` | Inline validation |
| `isSubmitting` | boolean | `false` | Debounce + spinner |

### Global / Server State

Server Action writes directly to `profiles`; next page load re-reads. No
client global store.

---

## UI States

### Initial
- Display name pre-filled from Google; department empty; submit disabled.

### Valid
- Both fields pass → submit enabled (cream fill).

### Submitting
- Spinner replaces chevron, form disabled, `aria-busy="true"`.

### Error (validation)
- Per-field red border + `aria-invalid="true"` + inline error text.

### Error (submit)
- Inline banner at card top (`role="alert"`, auto-focused); form re-enabled.

### Error (session expired)
- Transient banner → 1.5 s delay → redirect to `/login?next=/onboarding`.

### Empty (department list)
- Select disabled + banner "Không tìm thấy danh sách phòng ban".

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Heading | Single `<h1>` "Hoàn tất hồ sơ của bạn" |
| Labels | Native `<label for="…">` on both fields |
| Required indicator | Visible asterisk + `aria-required="true"` |
| Error announcements | `role="alert"` + `aria-live="assertive"`; fields carry `aria-invalid` + `aria-describedby` |
| Focus ring | 2 px cream outline on every focusable |
| Keyboard order | Language → Display name → Department → Submit → Sign-out link |
| Contrast | WCAG 2.2 AA; Lighthouse a11y ≥ 95 |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Full-width card with 16 px inset; footer buttons full-width |
| Tablet (640–1023px) | 520 px card centred |
| Desktop (≥1024px) | Same 520 px card centred vertically + horizontally |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `onboarding_complete` | Server Action success | `{ has_display_name_changed: boolean; has_department_changed: boolean }` — **no PII** |

No `onboarding_view` / `onboarding_submit_attempt` in MVP (add later if
funnel diagnostics needed).

---

## Design Tokens

Zero new tokens — reuses Login + Thể lệ:

| Token | Usage |
|-------|-------|
| `--color-brand-900` | Page background |
| `--color-modal-paper` | Card surface |
| `--color-foreground` | Card text |
| `--color-border-secondary` | Input borders |
| `--color-accent-cream` | CTA fill |
| `--shadow-kudo-card` | Card drop shadow |

---

## Implementation Notes

### Dependencies
- Existing `getKudoDepartments()` Server Action (49 codes — migration 0011).
- Existing `profiles.department_id` column (migration 0001).
- Existing `profiles_update_own` RLS policy (verify scope on `display_name`
  + `department_id` — add targeted migration if needed).
- New: `completeOnboarding()` Server Action (`src/app/onboarding/actions.ts`).
- New: `onboarding.*` i18n keys added to `src/messages/{vi,en}.json`.

### Special Considerations
- Gate check in `src/proxy.ts` (or authenticated layout) runs **one
  lightweight SELECT per page load** — acceptable for MVP; defer the
  custom-claim approach to Phase 2 if measured costly.
- No skip / "Later" affordance — only exit path is submission or sign-out.
- Cloudflare Workers compat — no `node:*` imports.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — synthetic spec, form-only |
| Confidence Score | High |

### Next Steps

- [ ] Audit `profiles_update_own` RLS to confirm `display_name` +
      `department_id` are writeable by the row owner.
- [ ] Confirm EN copy with Product (currently draft).
- [ ] Consider migrating to a styled listbox if UX review flags the native
      select.
