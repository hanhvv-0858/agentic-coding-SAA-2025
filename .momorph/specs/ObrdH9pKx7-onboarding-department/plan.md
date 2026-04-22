# Implementation Plan: Onboarding — Complete Profile

**Screen**: `ObrdH9pKx7-onboarding-department`
**Spec**: [spec.md](spec.md)
**Design-style**: [design-style.md](design-style.md)
**Created**: 2026-04-22

---

## Constitution Compliance

| Requirement | Constitution Rule | Status |
|-------------|-------------------|--------|
| TypeScript strict mode | §I Clean Code | ✅ — all new files strict-typed |
| One-component-per-file, naming conventions, `@/*` import alias | §I Clean Code | ✅ — `OnboardingForm.tsx`, `completeOnboarding` action, `src/app/onboarding/*` follow conventions |
| Responsive across 3 breakpoints | §II Responsive Design | ✅ — form card adapts `< 640` / `640–1023` / `≥ 1024` per design-style §10 |
| Touch targets ≥ 44 × 44 px | §II Responsive Design | ✅ — inputs 56 px tall, submit 56 px, sign-out link has 24 px tap padding |
| Server Components by default; minimal client islands | §II / §App Router | ✅ — page + layout are RSC; client island is just `<OnboardingForm>` (≤ 10 KB gz per spec TR-005) |
| i18n via message catalog, never hardcoded strings | §III | ✅ — new `onboarding.*` namespace (19 keys — see Modified Files) |
| WCAG 2.2 AA, axe-core clean | §IV | ✅ — native `<form>` + `<select>`, focus ring, error live region, `aria-invalid`, 32 × 32 avatar with fallback letter |
| No secrets in client bundle | §IV | ✅ — anon key only on client; Service Role stays server-side |
| Cloudflare Workers compatible | §V Tech Stack | ✅ — `@supabase/ssr`, Server Actions, no `node:*` |
| Yarn v1 only | §V Tech Stack | ✅ — zero new npm deps |
| Testing: unit + integration + E2E + a11y | §III Quality | ✅ — see Testing Strategy below |

---

## Architecture Decisions

### Routing gate — where does the check live?

**Decision**: enforce in the **authenticated layout** Server Component, not in
`src/proxy.ts`.

Why not the proxy:
- Proxy (middleware) runs on the edge for every request including static
  assets; adding a DB round-trip there would increase LCP on every navigation.
- Proxy cannot easily read `profiles.department_id` with RLS because the
  Supabase Workers runtime for `proxy` does not share the cookie jar of page
  requests.

Why the layout:
- The authenticated layout (`src/app/(authed)/layout.tsx` or equivalent
  hierarchical layout above `/kudos`, `/`, etc.) already resolves the session.
  Adding `SELECT department_id FROM profiles WHERE id = auth.uid()` is
  one cheap index lookup per page load.
- Redirects from a Server Component are native (`redirect("/onboarding")`).

**Risk**: if the project does not yet have a shared authenticated layout, we
must introduce one. Audit before coding; if not present, add a route group
`(authed)` with its own `layout.tsx` wrapping every authenticated page.

### Department select — native `<select>` vs custom listbox

**Decision**: native `<select>` for MVP.

- Zero additional bundle weight.
- Free keyboard + screen-reader support.
- Acceptable visual fidelity — the onboarding page has no Figma frame so
  "close to" the text input styling is enough.
- Upgrade path: if Product asks for avatar-per-option or VN/EN label pairing,
  swap to a listbox variant modelled on `FilterDropdown`.

### Server Action signature + flow

```ts
// src/app/onboarding/actions.ts
export async function completeOnboarding(
  formData: FormData,
): Promise<never>; // always redirects or throws
```

Concrete step-by-step (mirrors spec FR-006 + Analytics contract):
1. Read the session via `createClient()` from `@/libs/supabase/server`. If
   missing → return a `{ error: "session_expired" }` shape via Next.js
   `redirect("/login?next=/onboarding")` immediately (no 1.5 s delay on
   server — that delay is client-side only when the *submit-response* path
   is used).
2. Fetch the **pre-form profile snapshot**:
   `SELECT display_name, department_id FROM profiles WHERE id = auth.uid()`.
   This serves two purposes: diff for analytics booleans, and idempotency
   (so a second submit of the same values is a true no-op).
3. Parse `formData` → `{ displayName, departmentCode }` (both strings).
   Server-side validation:
   - `display_name`: `trim()` → length ∈ [2, 80]; regex
     `/^[\p{L}\p{M}\s\-'.]+$/u` (spec Q1). Reject on mismatch with a
     generic submit-error banner (specific field errors are surfaced by
     the client; server rejection is defense-in-depth).
   - `departmentCode`: `supabase.from("departments").select("id").eq("code", code).single()`.
     Reject if not found.
4. `supabase.from("profiles").upsert({ id: user.id, display_name, department_id }, { onConflict: "id" })`.
   (Upsert per FR-013 — covers the trigger race on brand-new users. Explicit
   `onConflict: "id"` so we don't rely on PostgREST's default.)
5. Compute `has_display_name_changed` + `has_department_changed` by
   comparing the pre-form snapshot against the submitted values.
6. Emit `onboarding_complete` via `track()` with the booleans only. No PII.
7. Call `redirect("/")` — React's `redirect` throws, so return type is `never`.

### Client-side response handling

- **Validation errors**: `<OnboardingForm>` blocks submit if either field fails
  client-side validation — the action is never called.
- **Server rejects (non-session)**: `completeOnboarding` returns after a
  `redirect("/onboarding?error=<code>")` so the page re-renders. `page.tsx`
  reads the `?error=` query param and forwards it as a prop
  (`initialSubmitError: string | null`); the form renders the banner from
  that prop on mount.
- **Session expired *at submit time*** (server detects mid-action): the
  Server Action redirects directly to `/login?next=/onboarding` — no banner
  interstitial, no 1.5 s delay. User never sees the form again.
- **Session expired *before* submit** (client detects the server responded
  with `?error=session_expired`, e.g. from a retry after a stale-token
  request): the form renders the session-expired banner, starts
  `setTimeout(..., 1500)` on mount, then `window.location.assign("/login?next=/onboarding")`
  when the timer fires (spec Q8). This is the only client-initiated redirect
  on this screen — all other redirects are server-side.

**Signal path summary**: there is **no client polling** of session validity
on this screen. The session-expired banner only surfaces via the
`?error=session_expired` query param set by the Server Action. Keeps the
client island small and avoids race conditions.

### Avatar + account disambiguation data flow

- `src/app/onboarding/page.tsx` reads `profile.{display_name, avatar_url, department_id}`
  + `session.user.email` at render time (one `SELECT` — `department_id`
  drives the early-return, the other fields feed the form).
- Passes `{ initialDisplayName, avatarUrl, email, departments, initialSubmitError }`
  into `<OnboardingForm>`. No extra fetch.

### `<OnboardingForm>` props contract

```ts
type OnboardingFormProps = {
  initialDisplayName: string;        // from profile or Google full_name; may be "" if empty
  avatarUrl: string | null;          // null → AccountRow renders fallback initial
  email: string;                     // required — used by AccountRow
  departments: { code: string; label: string }[];  // from getKudoDepartments()
  initialSubmitError: "generic" | "session_expired" | null;  // from ?error= query
  messages: Messages;                // locale-resolved bundle (passed explicitly to avoid prop drilling hooks)
};
```

### Sign-out recovery affordance

- Renders a nested `<form action={signOut}>` inside the card footer. The
  existing `signOut` Server Action at
  [src/components/layout/ProfileMenu.tsx](../../../src/components/layout/ProfileMenu.tsx)
  is the source — export it to `@/app/(authed)/actions.ts` (or similar stable
  import path) if it currently lives alongside the ProfileMenu — audit in
  Phase 0 (T005 added below).

### Error surface

- Recoverable errors (validation, network, session_expired-client) render an
  inline banner and the page stays.
- Unrecoverable errors (Supabase down, RLS policy bug) let the exception
  bubble to `src/app/onboarding/error.tsx` (Next.js App Router convention).
  Add this file if not already present.

---

## Project Structure

### New Files

| File | Purpose |
|------|---------|
| `src/app/onboarding/page.tsx` | Server Component — reads `profile.{display_name, avatar_url, department_id}` + `session.user.email`, early-returns `redirect("/")` when `department_id IS NOT NULL`, otherwise renders welcome copy + `<OnboardingForm>` props |
| `src/app/onboarding/layout.tsx` | Chromeless shell — SAA logo + language toggle header + footer copyright. Reuses Login's visual pattern. No layout-level auth check here (page itself redirects). |
| `src/app/onboarding/actions.ts` | `completeOnboarding(formData)` Server Action per plan §Architecture > Server Action flow (steps 1–7) |
| `src/app/onboarding/error.tsx` | Next.js App Router `error.tsx` boundary for unrecoverable errors (Supabase down, RLS violation). Renders localized fallback — zero PII leaked |
| `src/components/onboarding/OnboardingForm.tsx` | Client island — form state, validation, submit, error banner focus, session-expired banner with 1.5 s delay (spec Q8), avatar + email disambiguation row (spec Q2) |
| `src/components/onboarding/AccountRow.tsx` | Tiny display-only component — avatar 32 × 32 with null-fallback initials circle + truncated email. Extracted because the fallback logic (first-letter-or-`?`) is worth unit-testing in isolation |
| `src/components/onboarding/DepartmentRetryBanner.tsx` | Inline error banner with retry button (design-style §4.3). Used when `getKudoDepartments()` throws at page-load |
| `src/components/onboarding/SignOutLink.tsx` | Wraps `<form action={signOut}>` + styled link per design-style §5.1 (spec Q7) |
| `src/libs/onboarding/validation.ts` | Pure validator (`validateDisplayName`, `validateDepartmentCode`) with the Unicode regex from spec Q1. Zero deps, reused by both client island and Server Action |
| `src/app/onboarding/__tests__/actions.spec.ts` | Server Action tests — analytics payload shape + redirect path + upsert idempotency + server-side validation; uses a Supabase mock |
| `src/components/onboarding/__tests__/OnboardingForm.spec.tsx` | RTL unit tests — 11 cases (T-U1..T-U11, see Phase 5) |
| `src/components/onboarding/__tests__/AccountRow.spec.tsx` | RTL unit tests — avatar fallback logic (T-U11 lives here, not in OnboardingForm tests) |
| `src/components/onboarding/__tests__/OnboardingGate.integration.spec.tsx` | Integration test — authenticated-path redirect behaviour (T-I1..T-I3) |
| `src/libs/onboarding/__tests__/validation.spec.ts` | Pure-function tests — Unicode charset, length bounds, emoji reject, trim behaviour |
| `tests/e2e/onboarding.spec.ts` | Playwright E2E — T-E1 happy path + T-E2 locale flip; gated on `SUPABASE_TEST_SESSION_TOKEN` |

### Modified Files

| File | Change |
|------|--------|
| `src/app/(authed)/layout.tsx` (see §Phase 0 for whether this exists) | After `await createClient()` + session resolve, `SELECT department_id FROM profiles WHERE id = auth.uid()` LIMIT 1. If null → `redirect("/onboarding")`. Otherwise pass through |
| `src/messages/vi.json` | Add `onboarding.*` namespace — **19 keys** (Q6 adds 3 list-fetch keys + Q7 adds 1 sign-out key — final count per spec i18n table) |
| `src/messages/en.json` | Mirror 19 keys with the draft EN copy per spec i18n table |
| `src/libs/analytics/track.ts` | Extend `TrackEvent` union with `{ type: "onboarding_complete"; has_display_name_changed: boolean; has_department_changed: boolean }` (spec Q3 — no `department_code` payload) |
| `src/libs/supabase/server.ts` *(verify, not modify)* | Already cookie-aware; no change. Listed here so reviewers can skip it |
| `src/components/layout/ProfileMenu.tsx` | Import `signOut` from the new stable path (output of A0-4) instead of declaring inline. Purely a re-import — behaviour unchanged |
| `src/app/(authed)/actions.ts` (NEW — created by A0-4 extraction, but modifies an existing surface so listed here) | Houses `signOut` Server Action (moved from `ProfileMenu.tsx`). Both `<ProfileMenu>` and `<SignOutLink>` import from here — no cycle |
| `.momorph/specs/GzbNeVGJHz-login/spec.md` | ✅ **Already patched** (Post-login routing section + FR-004 update + Q3 resolution) in the spec-authoring commit |
| `.momorph/contexts/screen_specs/SCREENFLOW.md` | ✅ **Already patched** (row #18 Onboarding + mermaid + Discovery Log + frame count) in the spec-authoring commit |

### Dependencies

Zero new npm packages. Reuses `@supabase/ssr`, `getMessages()` +
`getLocale()` helpers from `src/libs/i18n/getMessages.ts`, and the existing
`<Icon>` + `<PrimaryButton>` + `signOut` Server Action.

---

## Implementation Approach

### Phase 0 — Pre-flight audit

- **A0-1**: Verify an authenticated layout exists above `/kudos`, `/`, `/awards`,
  `/the-le`. Likely candidates: `src/app/layout.tsx` (root), `src/app/(authed)/layout.tsx`,
  or a wrapping Server Component used by each page. If no shared place to hook
  the gate, introduce a route group `(authed)` and move the authenticated
  pages under it. **Budget** ~2–4 h if refactor needed; 15 min if already
  present.
- **A0-2**: Verify RLS: `profiles` row owner can `UPDATE (display_name,
  department_id)`. Inspect `0002_kudos_rls.sql` + any subsequent migration
  that touches `profiles`. If blocked, add a targeted migration
  (number next in sequence — `0022_*` or later depending on current head).
- **A0-3**: Confirm `getKudoDepartments()` shape (spec's Data Requirements
  table assumes `{ code, label }[]`). Cross-check
  [src/app/kudos/actions.ts:659](../../../src/app/kudos/actions.ts#L659).
- **A0-4**: Locate the canonical `signOut` Server Action source. If it lives
  inline inside `ProfileMenu.tsx`, extract to a stable module so
  `<SignOutLink>` can import without a circular dep. Budget 15 min.
- **A0-5**: Confirm `track()` from `src/libs/analytics/track.ts` is callable
  from Server Actions (it's already server-safe, but confirm no `window`
  branches before extending the event union).
- **A0-6**: Confirm `<Icon name="spinner" />` exists in
  [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx)
  (design-style §9 references it). If not, extend the icon set with a spinner
  glyph before P3-1. Budget 10 min.

### Phase 1 — Foundations

- **P1-1**: Add the 19-key `onboarding.*` namespace to `src/messages/vi.json`.
- **P1-2**: Mirror the 19 keys in `src/messages/en.json` with the draft EN copy
  from spec's i18n table.
- **P1-3**: Extend `TrackEvent` union in `src/libs/analytics/track.ts`.
- **P1-4**: Implement pure validators in `src/libs/onboarding/validation.ts`
  using the Unicode regex from spec Q1. Write the pure-function test file
  first (TDD — regex + length bounds + emoji reject).
- **P1-5** *(optional, output of A0-2)*: If RLS migration is needed, add it
  under `supabase/migrations/` and run `yarn migrate` locally.

### Phase 2 — Server Action + Server Component page

- **P2-1**: Implement `completeOnboarding(formData)` in
  `src/app/onboarding/actions.ts` per the 7-step flow in §Architecture.
  Includes the pre-form profile snapshot read + diff + upsert + analytics +
  `redirect("/")`.
- **P2-2**: Implement `src/app/onboarding/page.tsx`: resolve session →
  early-return `redirect("/")` when `department_id IS NOT NULL` →
  otherwise fetch `profile.{display_name, avatar_url}` + `email` +
  `getKudoDepartments()` in parallel with `Promise.all` → pass props.
- **P2-3**: Implement `src/app/onboarding/layout.tsx` mirroring Login shell
  (logo header + language toggle + footer); **no** auth check in layout — the
  check lives in `page.tsx` (inverse direction) and `(authed)/layout.tsx`
  (forward direction).
- **P2-4**: Add `src/app/onboarding/error.tsx` for unrecoverable errors.

### Phase 3 — Client form island

- **P3-1**: Implement `<OnboardingForm>` with:
  - Controlled `displayName` state (pre-filled from prop).
  - Controlled `departmentCode` state (initially `null`).
  - Blur-level validation calling the pure validators from P1-4.
  - `action={completeOnboarding}` on the `<form>`.
  - `useFormStatus` (React 19) for the spinner + `aria-busy`.
  - Session-expired banner with `setTimeout(..., 1500)` before
    `window.location.assign("/login?next=/onboarding")` (spec Q8).
  - Error banner with `tabIndex={-1}` + `.focus()` on mount.
- **P3-2**: Implement `<AccountRow>` (avatar + fallback initial + email) —
  design-style §4.0.
- **P3-3**: Implement `<DepartmentRetryBanner>` — design-style §4.3. Wired
  into P2-2's page when the department-list fetch throws.
- **P3-4**: Implement `<SignOutLink>` — design-style §5.1 / spec Q7.
- **P3-5**: Verify the client island bundle size ≤ 10 KB gz (spec TR-005) via
  `yarn build`. Note Form-island imports only pure validators + `PrimaryButton`
  + `Icon` — should come in well under.

### Phase 4 — Routing gate

- **P4-1**: Add the `department_id IS NULL → redirect("/onboarding")` branch
  in the authenticated layout located during A0-1.
- **P4-2**: Verify the inverse branch in `src/app/onboarding/page.tsx` (P2-2)
  catches users whose dept was set in another tab and who navigate back to
  `/onboarding`.
- **P4-3**: Smoke: log in with a null-dept seeded user; step through `/`,
  `/kudos`, `/awards`, `/the-le` — all should redirect to `/onboarding`.
  Sign out, log back in with a fixture who has a dept — all routes pass through.
- **P4-4**: Concurrent-tab sanity: open `/onboarding` in two tabs with the
  same session; complete the form in tab A; hit Submit in tab B with
  different values. The action MUST succeed (upsert idempotent — overwrites
  with tab B's values) and redirect. Document the final-write-wins behaviour
  as intentional (spec Edge Cases: "Concurrent tabs").

### Phase 5 — Tests + analytics

Unit / RTL (`src/components/onboarding/__tests__/OnboardingForm.spec.tsx`):
- T-U1 Empty submit → validation errors surfaced, action not called.
- T-U2 Too-short displayName (post-trim) → error line.
- T-U3 Too-long displayName (81 chars) → error line.
- T-U4 Invalid charset (emoji) → error line.
- T-U5 Valid charset (Unicode letters with diacritics, e.g.
  `Nguyễn Thị Lan-Anh`) → no error.
- T-U6 Missing department → error line.
- T-U7 Happy-path submit → spinner + `aria-busy`, action called once,
  `onSuccess` fires (intercepted via mock).
- T-U8 Server error (`?error=generic`) → banner focused, role=alert.
- T-U9 Session-expired banner renders → after ~1.5 s mock timer, location
  assignment called.
- T-U10 Sign-out link submits the `signOut` form.
- T-U11 `<AccountRow>` fallback renders the first letter of display_name
  when `avatarUrl === null`, and `?` when both are empty.

Pure validator tests (`src/libs/onboarding/__tests__/validation.spec.ts`):
covered by P1-4.

Integration (`OnboardingGate.integration.spec.tsx`):
- T-I1 Null dept → layout redirects to `/onboarding`.
- T-I2 Set dept → layout passes through.
- T-I3 Visiting `/onboarding` with set dept → page redirects to `/`.

E2E (`tests/e2e/onboarding.spec.ts`), gated on `SUPABASE_TEST_SESSION_TOKEN`:
- T-E1 Log in as seeded null-dept user → land on `/onboarding` → complete
  form → land on `/` → header shows department code.
- T-E2 Language toggle on `/onboarding` flips copy (VI → EN) without losing
  form state.

Accessibility:
- T-A1 axe-core run on rendered onboarding page — zero serious / critical.
- T-A2 Keyboard-only walk-through: tab order per spec §Accessibility
  Keyboard order (5 stops: language toggle → displayName → department →
  submit → sign-out link).

Analytics:
- Owned by `src/app/onboarding/__tests__/actions.spec.ts`. Assert via a
  mocked `track()` that the call payload is exactly
  `{ type: "onboarding_complete", has_display_name_changed, has_department_changed }`
  with no extra keys (compile-time TS narrowing + runtime shape check).

### Phase 6 — Cross-doc updates *(largely already done)*

- Login spec patch — ✅ landed during spec authoring.
- SCREENFLOW patch — ✅ landed during spec authoring.
- Remaining: once implementation merges, flip Onboarding row in
  SCREENFLOW from 📋 `spec'd` to 🟢 `shipped` + bump the Discovery
  Progress table.

---

## Testing Strategy

Phase 5 lists individual test cases. The table below is the summary (counts
and ownership) — **single source of truth is Phase 5**; revise both if a test
is added or dropped.

| Type | Focus | Cases | File |
|------|-------|-------|------|
| Pure-function unit | Unicode regex charset, length bounds (post-trim), emoji reject, apostrophe/dash allowed | 6–8 | `src/libs/onboarding/__tests__/validation.spec.ts` |
| Server Action unit | Analytics payload shape, upsert idempotency, server-side regex + dept-code validation, `?error=session_expired` redirect path | 4–5 | `src/app/onboarding/__tests__/actions.spec.ts` |
| Component unit (Vitest + RTL) | T-U1..T-U10 listed in Phase 5 — form validation, submit spinner, error banner focus, session-expired banner timer, sign-out link | 10 | `src/components/onboarding/__tests__/OnboardingForm.spec.tsx` |
| Component unit (AccountRow) | T-U11 — avatar fallback (null → first letter → `?`) | 1 | `src/components/onboarding/__tests__/AccountRow.spec.tsx` |
| Integration | T-I1..T-I3 — authenticated layout gate in both directions + `/onboarding` page's inverse redirect | 3 | `src/components/onboarding/__tests__/OnboardingGate.integration.spec.tsx` |
| E2E (Playwright) | T-E1 happy path; T-E2 locale flip preserves form state | 2 | `tests/e2e/onboarding.spec.ts` |
| Accessibility | T-A1 axe-core zero serious/critical; T-A2 keyboard walk-through (5 tab stops) | 2 | co-located with `OnboardingForm.spec.tsx` + `tests/e2e/onboarding.a11y.spec.ts` |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Authenticated layout does not exist → route-group refactor | High | Phase 0 A0-1 audit; if missing, introduce `(authed)` before wiring the gate. Budget 2–4 h |
| RLS blocks `profiles` self-update for `display_name` + `department_id` | High | Phase 0 A0-2 verify; add targeted migration if needed. No user-facing release until RLS passes |
| `signOut` Server Action lives inside `ProfileMenu.tsx` → import cycle with `<SignOutLink>` | Medium | Phase 0 A0-4 extracts to `@/app/(authed)/actions.ts`; both consumers import from there |
| DB roundtrip in layout adds latency to every page load | Medium | Accepted for MVP (spec TR-001). Monitor; if > 30 ms p95, implement `app_metadata.has_department` custom claim (deferred per spec open Q4) |
| User with stale `/onboarding` tab after completing in another tab | Low | UPDATE is idempotent; redirect fires on next navigation |
| Native `<select>` visual fidelity below Product's bar | Low | Accepted for MVP — can swap to a listbox modelled on `FilterDropdown` later |
| Native `<select>` chevron positioning differs across Chrome/Safari/Firefox | Low | Use `appearance-none` + a positioned sibling `<Icon>`; `<select>` preserves keyboard/accessibility semantics |
| Locale flip mid-form drops field state | Low | `NEXT_LOCALE` cookie write re-runs the Server Component; controlled-input state is preserved by React's form re-hydration if inputs have `defaultValue` matching the prior state. Verify in P3-1 unit test |
| `onboarding_complete` analytics payload accidentally includes PII | Medium | Typed `TrackEvent` union narrows the shape — adding `department_code` would be a compile error. Enforced by TypeScript |

---

## Open Questions

Spec-level Q1–Q8 are resolved — see spec's Decision Log. Plan-level questions:

- **PQ-1 (Product)**: Sign-off on the 19 draft EN translations in spec §i18n
  before P1-2 lands in CI.
- **PQ-2 (Product)**: Confirm display_name max = 80 chars (twice the
  anonymous-alias bound of 40). Adjust spec + validators if a different bound
  is preferred.
- **PQ-3 (Eng — output of Phase 0 A0-1)**: Does `(authed)` route group exist
  already? Exact answer drives whether Phase 0 budget is 15 min or 4 h.
- **PQ-4 (Security)**: Do we want to promote `has_department` into a custom
  JWT claim (`app_metadata`) so the layout avoids a per-request DB roundtrip?
  **Recommendation**: defer until LCP is measured in prod. If p95 layout
  latency crosses 30 ms, add a DB trigger + custom-claim update in a follow-up
  spec.
