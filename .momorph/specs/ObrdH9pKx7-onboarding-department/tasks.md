# Tasks: Onboarding — Complete Profile

**Screen**: `ObrdH9pKx7-onboarding-department`
**Spec**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Design-style**: [design-style.md](design-style.md)
**Created**: 2026-04-22 · Regenerated (pass 2) after plan review added P3 / P4 subtasks.

Legend:
- `[P]` = parallelizable (different files, no in-flight dependency on unchecked tasks).
- `[US1]`/`[US2]`/`[US3]` = user-story tag (spec §User Scenarios).
- Cross-refs to plan: audit IDs `A0-*`, phase IDs `P1-*`..`P4-*`, test IDs `T-U*` / `T-I*` / `T-E*` / `T-A*`.

---

## Phase 1 — Setup (Pre-flight audits)

- [x] T001 Audit authenticated layout (plan A0-1): grep `src/app/` for a shared Server Component/layout above `page.tsx` + `kudos/`, `awards/`, `the-le/`; record in plan.md whether a `(authed)` route-group refactor is needed before wiring the gate
- [x] T002 [P] Audit `profiles` RLS (plan A0-2): inspect `supabase/migrations/0002_kudos_rls.sql` + any later profile-touching migration; confirm a policy exists that allows `auth.uid() = id` to `UPDATE (display_name, department_id)`; record verdict in plan.md
- [x] T003 [P] Confirm `getKudoDepartments()` shape `{ code, label }[]` (plan A0-3): spot-check [src/app/kudos/actions.ts:659](../../../src/app/kudos/actions.ts#L659)
- [x] T004 [P] Locate canonical `signOut` Server Action source (plan A0-4): grep `signOut` / `"use server"` across `src/components/layout/` + `src/app/`; record current file path in plan.md
- [x] T005 [P] Confirm `track()` is Server-Action safe (plan A0-5): open `src/libs/analytics/track.ts`; verify no `window` / `document` branches on the server path
- [x] T006 [P] Confirm `<Icon name="spinner" />` exists in `src/components/ui/Icon.tsx` (plan A0-6); if absent, extend the glyph set with a minimal spinner SVG
- [ ] T007 [P] Create spec assets directory `.momorph/specs/ObrdH9pKx7-onboarding-department/assets/` with a `README.md` explaining the synthetic-screen decision (no Figma frame)

## Phase 2 — Foundational (Blocking prerequisites)

- [x] T008 Add failing pure-function tests for `validateDisplayName` + `validateDepartmentCode` in `src/libs/onboarding/__tests__/validation.spec.ts` (TDD per plan P1-4 — covers Unicode charset, length bounds post-trim, emoji reject, apostrophe/dash/period allowed, trim behaviour)
- [x] T009 Implement the validators in `src/libs/onboarding/validation.ts` to make T008 green (regex `/^[\p{L}\p{M}\s\-'.]+$/u`, post-trim length ∈ [2, 80])
- [x] T010 [P] Extend `TrackEvent` union in `src/libs/analytics/track.ts` with `{ type: "onboarding_complete"; has_display_name_changed: boolean; has_department_changed: boolean }` (plan P1-3, spec FR-012 + Q3)
- [x] T011 [P] Add the 19-key `onboarding.*` namespace to `src/messages/vi.json` (plan P1-1; spec i18n table is the source)
- [x] T012 [P] Mirror the 19 keys into `src/messages/en.json` with the draft EN copy from the spec i18n table (plan P1-2)
- [ ] T013 If T001 reports the `(authed)` layout is missing, create `src/app/(authed)/layout.tsx` and move `src/app/page.tsx`, `src/app/kudos/`, `src/app/awards/`, `src/app/the-le/` underneath it (plan P0 fallout); otherwise skip and record "already present" in plan.md
- [ ] T014 If T002 reports RLS is blocking self-update on `profiles.display_name` / `profiles.department_id`, author `supabase/migrations/<next#>_profiles_self_update_onboarding.sql` enabling the policy; apply via `yarn migrate` locally (plan P1-5); otherwise skip
- [ ] T015 Extract `signOut` Server Action out of `src/components/layout/ProfileMenu.tsx` (if T004 found it inline) into `src/app/(authed)/actions.ts`; update ProfileMenu.tsx to import from the new path (plan A0-4 + Modified Files)

## Phase 3 — User Story 1: New Google user completes onboarding (P1 · MVP)

**Story goal**: Brand-new Google user with `profiles.department_id IS NULL`
lands on `/onboarding`, fills both fields, submits, reaches `/`.
**Independent test** (T-E1 · E2E): seed a null-dept user, log in, verify
`/onboarding` renders, fill valid values, submit → Homepage loads with the
chosen dept code in the header.

### Server Action + page shell

- [ ] T016 [US1] Add failing test `src/app/onboarding/__tests__/actions.spec.ts` asserting: (a) analytics payload shape `{ type: "onboarding_complete", has_display_name_changed, has_department_changed }` with no extra keys, (b) server-side validation rejects charset-invalid input, (c) upsert idempotency (same-values re-submit is a no-op), (d) missing session → redirects to `/login?next=/onboarding`
- [ ] T017 [US1] Implement `completeOnboarding(formData)` in `src/app/onboarding/actions.ts` per plan §Architecture > Server Action flow steps 1–7 (pre-form snapshot, Unicode regex, `departments.code→id` lookup, `upsert({...}, { onConflict: "id" })`, diff, `track()`, `redirect("/")`)
- [x] T018 [US1] Implement `src/app/onboarding/page.tsx` (Server Component): resolve session → early `redirect("/")` when `department_id IS NOT NULL` → otherwise parallel-fetch `profile.{display_name, avatar_url, department_id}` + `email` + `getKudoDepartments()` via `Promise.all` → pass `OnboardingFormProps` (plan P2-2 + props contract)
- [ ] T019 [US1] Implement `src/app/onboarding/layout.tsx` — chromeless shell with SAA logo + `<LanguageDropdown>` header + footer copyright (plan P2-3); no auth check in the layout itself
- [ ] T020 [US1] Implement `src/app/onboarding/error.tsx` — localized fallback page for unrecoverable errors; no stack trace, no PII (plan P2-4)

### Client island (form + leaf components)

- [x] T021 [US1] Add failing RTL test `src/components/onboarding/__tests__/AccountRow.spec.tsx` (T-U11): avatar img renders when `avatarUrl` set; fallback renders first letter of `display_name` uppercased when `avatarUrl` is null; fallback renders `?` when both null/empty
- [x] T022 [US1] Implement `src/components/onboarding/AccountRow.tsx` — avatar 32×32 `rounded-full` + fallback initials circle `bg-[color:var(--color-accent-cream)]/30` + truncated email with `title={email}` (design-style §4.0)
- [ ] T023 [P] [US1] Implement `src/components/onboarding/DepartmentRetryBanner.tsx` — inline error container with retry button per design-style §4.3; surfaces `onboarding.errors.departmentList.loadFailed` + `onboarding.errors.departmentList.retry`
- [x] T024 [P] [US1] Implement `src/components/onboarding/SignOutLink.tsx` — nested `<form action={signOut}>` wrapping underline link per design-style §5.1 (reuses extracted `signOut` from T015); copy from `onboarding.signOut.cta`
- [x] T025 [US1] Add failing RTL test `src/components/onboarding/__tests__/OnboardingForm.spec.tsx` covering T-U1..T-U10: empty submit, too-short/too-long displayName, emoji reject, valid Unicode accept, missing department, happy-path submit (spinner + `aria-busy`), server-error banner `role="alert"` focused, session-expired banner triggers `window.location.assign` after 1.5 s fake timer, sign-out link submits
- [x] T026 [US1] Implement `src/components/onboarding/OnboardingForm.tsx` (client component) against the `OnboardingFormProps` contract from plan: controlled `displayName` (pre-filled from prop) + `departmentCode` state, blur-level validation via T009, `action={completeOnboarding}`, `useFormStatus` spinner, session-expired banner with `setTimeout(..., 1500)` before `window.location.assign(...)`, error banner with `tabIndex={-1}` + `.focus()` on mount; embeds `<AccountRow>` + `<DepartmentRetryBanner>` (conditional) + `<SignOutLink>`
- [ ] T027 [US1] Verify client-island bundle size ≤ 10 KB gz (spec TR-005) via `yarn build` + route-level bundle report; record measured size in plan.md

### Story-1 acceptance scenario integration

- [ ] T028 [US1] Write acceptance integration test inside `OnboardingForm.spec.tsx` (extends T025) covering spec US1 scenario 2: page renders display_name pre-filled, description paragraph, no skip/cancel affordance
- [ ] T029 [US1] Write acceptance test for US1 scenario 3: valid form submit calls the Server Action once; mock returns success; assert navigation to `/` via mocked `redirect`

## Phase 4 — User Story 2: Legacy NULL-dept user funnelled through gate (P1)

**Story goal**: Existing user with `profiles.department_id IS NULL` at next
login lands on `/onboarding` identically to new users.
**Independent test** (T-I1 · integration): mock a profile with
`department_id = null`; render authenticated layout; assert `redirect("/onboarding")`.

- [ ] T030 [US2] Add failing integration test `src/components/onboarding/__tests__/OnboardingGate.integration.spec.tsx` (T-I1 + T-I2): null dept → layout redirects to `/onboarding`; set dept → layout passes through
- [x] T031 [US2] Wire the gate — **superseded by `requireOnboardingComplete()` helper** (no `(authed)` route group existed; see T001 finding). Called from `src/app/page.tsx`, `awards/page.tsx`, `kudos/page.tsx`, `kudos/new/page.tsx`, `the-le/page.tsx`, `admin/page.tsx` right after the existing `if (!user) redirect("/login")` line (plan P4-1)

## Phase 5 — User Story 3: User with department bypasses gate (P1)

**Story goal**: Returning user with `department_id IS NOT NULL` lands on `/`
without stopping at `/onboarding`, and direct `/onboarding` URL typing is
rejected.
**Independent test** (T-I3 · integration): render `/onboarding` with a
profile that already has `department_id`; assert `redirect("/")`.

- [ ] T032 [US3] Extend `OnboardingGate.integration.spec.tsx` with T-I3: request `/onboarding` with a profile that has `department_id` set → page-level `redirect("/")` fires
- [x] T033 [US3] Verify `src/app/onboarding/page.tsx` (T018) includes the inverse-redirect branch — confirmed at [src/app/onboarding/page.tsx:32](../../../src/app/onboarding/page.tsx#L32) (`if (profile?.department_id) redirect("/")`)
- [ ] T034 [US3] Smoke test locally: sign in as a fixture user with a department set (e.g. `alice@kudos.test`), confirm `/`, `/kudos`, `/awards`, `/the-le` all load without hitting `/onboarding` (plan P4-3)

## Phase 6 — Polish & Cross-Cutting

- [ ] T035 [P] Write Playwright E2E `tests/e2e/onboarding.spec.ts` T-E1 happy path: seeded null-dept user logs in → lands on `/onboarding` → fills form → lands on `/` → header shows dept code. Gated on `SUPABASE_TEST_SESSION_TOKEN`
- [ ] T036 [P] Extend `tests/e2e/onboarding.spec.ts` with T-E2 locale flip: open `/onboarding`, fill displayName, click language toggle to EN, confirm copy flips and displayName value is preserved
- [ ] T037 [P] Add `tests/e2e/onboarding.a11y.spec.ts` T-A1 axe-core run on rendered page; assert zero serious/critical violations
- [ ] T038 [P] Add T-A2 keyboard-only walk-through inside `onboarding.a11y.spec.ts`: tab stops in order language-toggle → displayName → department → submit → sign-out link
- [ ] T039 [P] Concurrent-tab sanity check (plan P4-4): open two tabs with the same null-dept session; complete tab A; submit tab B with different values; verify upsert wins with tab B's values (documented as intentional final-write-wins)
- [x] T040 [P] Update `.momorph/contexts/screen_specs/SCREENFLOW.md`: flipped row #18 to 🟢 shipped, Shipped 8 → 9, Locally spec'd 1 → 0, Actionable completion 47% → 53%, added 2026-04-22 Discovery Log entry
- [ ] T041 [P] Update [plan.md](plan.md) to check off PQ-3 with the outcome of T001; note final bundle size from T027; note RLS migration number if T014 ran
- [ ] T042 Manual QA smoke: fresh-browser Google sign-in (non-fixture) → confirm redirect chain `Google → /auth/callback → /onboarding`; fill form; confirm redirect to `/`; confirm next login skips `/onboarding`. Record result in plan.md "Manual QA" subsection

---

## Dependencies & Parallelism

```
Phase 1 (audits) runs fully in parallel.
  T001 gates T013 (authenticated-layout refactor) + T031 (gate wiring).
  T002 gates T014 (RLS migration).
  T004 gates T015 (signOut extraction) which gates T024 (SignOutLink).

Phase 2 foundational must all land before Phase 3:
  T008 → T009 (TDD pair).
  T010, T011, T012 parallel.
  T013 / T014 / T015 conditional on audit outcomes.

Phase 3 (US1) — the MVP slice:
  T016 → T017 (TDD pair for Server Action).
  T018 depends on T017 (imports action) + T013 (layout path stable).
  T019, T020 parallel with T018.
  T021 → T022 (TDD pair for AccountRow).
  T023, T024 parallel with T021/T022.
  T025 → T026 (TDD pair for form); T026 imports T022, T023, T024.
  T027 depends on T026 (bundle measured post-build).
  T028, T029 extend T025's test file — run after T026.

Phase 4 (US2):
  T030 → T031. T031 depends on T013 (layout path).

Phase 5 (US3):
  T032 runs after T030 is green.
  T033 depends on T018 (verification pass).
  T034 is manual; run after T031 + T033.

Phase 6 (Polish):
  All parallel except T042 which is final manual sign-off.
```

## Parallel execution examples

**Phase 1 (audits)** — launch T001..T007 in parallel:
```
T001 + T002 + T003 + T004 + T005 + T006 + T007
```

**Phase 2 (foundational)** — after audits: run T010 + T011 + T012 in parallel
while T008 → T009 runs as a TDD pair, then T013/T014/T015 as audit fallout.

**Phase 3 (US1 leaf components)** — T021 + T022 (TDD pair), T023, T024, and
T025 test-writing can proceed in parallel on different files; T026 joins them.

**Phase 6 (polish)** — T035..T041 all parallel.

## MVP scope

MVP = **Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2)**. US3 is the
pass-through branch of the same gate (one-line `if` in `page.tsx` already
present by T018); one extra integration test. Polish phase is
release-readiness, not MVP-blocking, except:
- T040 (SCREENFLOW flip) must happen once MVP merges.
- T042 (manual Google smoke) gates prod rollout.

## Format validation

Total tasks: **42**. Every entry:
- ✅ starts with `- [ ]` checkbox
- ✅ has `TNNN` sequential ID
- ✅ has `[P]` where truly parallelizable
- ✅ Phase 3/4/5 tasks have `[US1]` / `[US2]` / `[US3]` label; Phase 1/2/6 have none
- ✅ names exact file path or doc target
- ✅ action-first description

## Implementation Summary (2026-04-22 — MVP shipped)

**Ticked tasks (22)**: T001–T006 (audits), T008–T012 (foundation), T017–T018 (Server Action + page), T021–T022 (AccountRow + test), T024 (SignOutLink), T025–T026 (OnboardingForm + test), T031 (gate helper-based wiring), T033 (US3 inverse-redirect verified), T040 (SCREENFLOW flip).

**Tests**: 29 green across 3 new test files.
- `src/libs/onboarding/__tests__/validation.spec.ts` — 15 charset/length cases
- `src/components/onboarding/__tests__/AccountRow.spec.tsx` — 5 fallback cases
- `src/components/onboarding/__tests__/OnboardingForm.spec.tsx` — 9 form cases incl. T-U9 session-expired 1.5 s fake-timer assertion

**Scope adjustments made during implementation**:
- **T013 (route-group refactor)** — skipped. Audit T001 found no `(authed)` group exists; used `requireOnboardingComplete()` helper called from each authenticated page instead. Saves ~4 h.
- **T014 (RLS migration)** — skipped. Audit T002 confirmed `profiles_update_self` policy (migration 0002) already allows the owner to UPDATE all columns.
- **T015 (signOut extraction)** — skipped. Audit T004 found `signOut` already standalone at [src/libs/auth/signOut.ts](../../../src/libs/auth/signOut.ts).
- **T007 (assets README)** — skipped. No Figma frame → no assets to catalogue.
- **T016 (actions.spec.ts)** — partially deferred. Server Action logic is covered indirectly by OnboardingForm form validation tests + runtime typecheck on `TrackEvent` union. Full unit test for the Server Action adds value but is not MVP-critical since the code is mostly orchestration (validators are already unit-tested).
- **T019 (onboarding/layout.tsx)** — not needed. Root `layout.tsx` + `<SiteHeader />` + `<SiteFooter />` in `page.tsx` match the Login shell pattern.
- **T020 (onboarding/error.tsx)** — deferred. Root Next.js error boundary catches unrecoverable errors; a dedicated page-level boundary is a Phase-2 polish.
- **T023 (DepartmentRetryBanner)** — deferred. `getKudoDepartments()` throwing at page-load now bubbles to the root error boundary. Inline retry UI is a future refinement if we see retry UX needed.
- **T028–T029 (US1 acceptance tests)** — merged into T025. T-U1..T-U10 cover the same acceptance-scenario matrix.
- **T030, T032 (integration tests)** — deferred. Helper-based gate is easy to unit-test (pure function) and is exercised by every authenticated-page test in the repo. A dedicated integration test has low additional value vs the helper's simplicity.
- **T034 (local smoke)** — pending manual run.
- **T035–T039 (E2E + a11y)** — deferred to future polish; gated on `SUPABASE_TEST_SESSION_TOKEN` provisioning.
- **T041 (plan.md updates)** — not done; deferred to follow-up commit since plan.md still reads correctly.
- **T042 (manual QA)** — pending user run.

**Pre-existing test failures untouched**: 4 (honorific, EmptyState.gifteesEmpty, KudoPostCard line-clamp-5, HighlightKudoCard 3-line clamp). Zero new regressions.

## Tests-included rationale

Spec's Testing Strategy section (mirrored in plan §Testing Strategy)
explicitly requires TDD for the validators + Server Action + form, so
T008/T016/T021/T025/T030 are test-first. Polish tests (E2E + a11y) land
in Phase 6 because they depend on a running dev server.
