# Tasks: Countdown – Prelaunch Page

**Frame**: `8PJQswPZmU-countdown`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [design-style.md](./design-style.md)
**Created**: 2026-04-19

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (US1…US4) — only on user-story phase tasks
- **|**: File path affected by this task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify pre-existing dependencies and spec folder scaffolding. No new assets required.

- [x] T001 [P] Verify `NEXT_PUBLIC_EVENT_START_AT` is set in `.env.local` (real value or a future ISO-8601 timestamp for dev/test). If missing, add per README guidance | `.env.local` (verify only — do not commit)
- [x] T002 [P] Verify `public/images/homepage-hero.png` exists (reused as the Prelaunch background per plan Q7). Note its 4.4 MB size for R2 follow-up | `public/images/homepage-hero.png` (verify only)
- [x] T003 [P] Verify `--font-digital-numbers` token is declared in `globals.css` (fallback `"Courier New", monospace`) — reused for the LED digits | `src/app/globals.css` (verify only)

**Checkpoint**: Environment + asset prerequisites confirmed. No code written yet.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Shared hook + analytics + i18n — every user-story phase depends on these.

**⚠️ CRITICAL**: No user-story work can begin until Phase 2 is complete (hook extract must land before `<PrelaunchCountdown>` can consume it).

- [x] T004 Add three new keys to the English message catalog under a new top-level `countdown.prelaunch` namespace: `headline: "Event starts in"`, `meta.title: "Countdown | SAA 2025"`, `meta.description: "SAA 2025 prelaunch countdown"`. Do NOT duplicate `homepage.countdown.{days,hours,minutes,fallback}` — they will be reused | `src/messages/en.json`
- [x] T005 [P] Mirror T004 for Vietnamese: `headline: "Sự kiện sẽ bắt đầu sau"`, `meta.title: "Đếm ngược | SAA 2025"`, `meta.description: "Đếm ngược khai mạc SAA 2025"` | `src/messages/vi.json`
- [x] T006 [P] Extend the `AnalyticsEvent` union with two new events following the `rules_*` precedent: `| { type: "prelaunch_view"; remaining_minutes: number }` and `| { type: "prelaunch_launch_transition" }` | `src/libs/analytics/track.ts`
- [x] T007 [P] Create `src/hooks/` directory (does not exist yet per constitution §I) — simple `mkdir` — and a co-located `__tests__/` folder | `src/hooks/` + `src/hooks/__tests__/`
- [x] T008 Write Vitest suite for the shared `useCountdown` hook **before** implementation (TDD gate). Cover: (a) returns `{ days, hours, minutes, hasLaunched }`; (b) returns all-zeros + `hasLaunched:true` when `eventStartAt` missing/invalid; (c) returns all-zeros + `hasLaunched:true` when target is in the past; (d) clamps `days` to `"99"` when > 99; (e) re-computes on `visibilitychange` (simulate via fake timers + `document.dispatchEvent`); (f) cleans up listeners on unmount | `src/hooks/__tests__/useCountdown.spec.ts`
- [x] T009 Implement `useCountdown({ eventStartAt }: { eventStartAt?: string })` — extract the `computeRemaining` + `useEffect` tick logic from [`src/components/homepage/Countdown.tsx`](../../../src/components/homepage/Countdown.tsx) verbatim. Return `{ days: string, hours: string, minutes: string, hasLaunched: boolean }`. Keep the 1-minute `setInterval` + `visibilitychange` + `focus` listeners. Make the hook green against T008 | `src/hooks/useCountdown.ts`
- [x] T010 Refactor Homepage `Countdown.tsx` to consume `useCountdown()` — strip inline tick logic, keep the `<CountdownTile>` rendering + `{ eventStartAt, labels }` prop shape intact. Import from `@/hooks/useCountdown`. Verify no Homepage test file exists (plan confirmed none); run `yarn test:run` for regression across existing 91 tests | `src/components/homepage/Countdown.tsx`

**Checkpoint**: `yarn typecheck` + `yarn lint` + `yarn test:run` all pass. Hook extracted cleanly. Homepage hero still renders the same Countdown. Foundation ready.

---

## Phase 3: User Story 1 — Anonymous visitor sees the countdown (Priority: P1) 🎯 MVP

**Goal**: A public visitor hits `/countdown` (or `/` pre-launch via middleware rewrite) and sees the key-visual background + headline + live D/H/M counter in the active locale. Also covers **US3 (localised headline)** and **US4 (responsive)** inline — both are primarily content + styling work that is complete when Phase 3 ships.

**Independent Test**: With `NEXT_PUBLIC_EVENT_START_AT` set to a future ISO-8601 timestamp, visit `/countdown` anonymously. Assert: title page is `"Countdown | SAA 2025"`; exactly one H1 with the headline; three H2-free unit labels (DAYS/HOURS/MINUTES); each unit has two LED tiles (77×123 at `lg:`, scaled at `sm:` and mobile) with Digital Numbers digits. Resize 375 / 800 / 1440 px — no horizontal overflow.

### Presentation atoms (US1)

- [x] T011 [P] [US1] Write Vitest for `<PrelaunchCountdownTile digit />` — asserts renders one Digital Numbers digit + has the glass styling classes (`w-[77px] h-[123px] border border-[var(--color-accent-cream)] rounded-xl backdrop-blur-[24px]`) | `src/components/countdown/__tests__/PrelaunchCountdownTile.spec.tsx`
- [x] T012 [US1] Implement `<PrelaunchCountdownTile digit: string />` — 77×123 at desktop, `lg:w-[77px] lg:h-[123px] sm:w-[66px] sm:h-[106px] w-[54px] h-[86px]` (mobile → tablet → desktop per design-style §Responsive), `relative flex items-center justify-center border border-[var(--color-accent-cream)] rounded-xl overflow-hidden`, `backdrop-blur-[24px]`. Background via inline `style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)" }}` (pre-multiplied `opacity: 0.5 × white→white/10%`). Digit span: `font-[family-name:var(--font-digital-numbers)] text-white tabular-nums text-[52px] sm:text-[64px] lg:text-[74px] leading-none` | `src/components/countdown/PrelaunchCountdownTile.tsx`
- [x] T013 [P] [US1] Implement `<CountdownUnit label: string, digits: [string, string] />` — `flex flex-col items-start gap-3 sm:gap-[21px]`. Row 1: `flex flex-row gap-3 sm:gap-[21px]` with two `<PrelaunchCountdownTile>`. Row 2: label `<span font-[family-name:var(--font-montserrat)] text-white font-bold text-base sm:text-2xl lg:text-[36px] lg:leading-[48px]` | `src/components/countdown/CountdownUnit.tsx`

### Client island (US1)

- [x] T014 [US1] Write Vitest for `<PrelaunchCountdown eventStartAt labels headline />` — mocks `useCountdown()` to return fixed values, mocks `useRouter` + `track`. Asserts: (a) renders 3 `<CountdownUnit>`; (b) has `role="timer" aria-live="polite"` with a readable `aria-label`; (c) when `hasLaunched` becomes true, calls `track({ type: "prelaunch_launch_transition" })` then `router.push("/login")` | `src/components/countdown/__tests__/PrelaunchCountdown.spec.tsx`
- [x] T015 [US1] Implement `<PrelaunchCountdown>` ("use client") — consumes `useCountdown({ eventStartAt })`, composes `<CountdownUnit>` × 3 (DAYS, HOURS, MINUTES). Wraps in `<div role="timer" aria-live="polite" aria-atomic="true" aria-label="...">` with the 3 units + computes aria-label from current values. On `hasLaunched` flip: `try { track({ type: "prelaunch_launch_transition" }) } catch {}` then `router.push("/login")` (FR-015 analytics-swallow pattern) | `src/components/countdown/PrelaunchCountdown.tsx`

### Route + server composition (US1)

- [x] T016 [US1] Create `src/app/countdown/page.tsx` — Server Component. Flow: (a) read `clientEnv.NEXT_PUBLIC_EVENT_START_AT`; (b) if already launched → `redirect("/login")` (FR-008); (c) call `getMessages()`; (d) compute `remainingMinutes` server-side → fire `track({ type: "prelaunch_view", remaining_minutes })`; (e) render the page — `<main relative w-full min-h-dvh bg-[var(--color-brand-900)] overflow-hidden>` with `<Image src="/images/homepage-hero.png" fill priority sizes="100vw" className="object-cover object-center" alt="" aria-hidden="true" unoptimized>` + cover-gradient `<div absolute inset-0 z-10 pointer-events-none style={{ background: "linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)" }}>` + `<section relative z-20 flex flex-col items-center justify-center gap-16 sm:gap-24 lg:gap-[120px] px-6 py-16 sm:px-12 sm:py-20 lg:px-36 lg:py-24>` containing `<h1 text-[24px] leading-[32px] sm:text-[32px] sm:leading-[44px] lg:text-[36px] lg:leading-[48px] font-bold text-white text-center>` + `<PrelaunchCountdown>` | `src/app/countdown/page.tsx`
- [x] T017 [US1] Implement `generateMetadata()` in `page.tsx` reading `messages.countdown.prelaunch.meta.{title,description}` — mirrors the pattern in [`src/app/awards/page.tsx:34`](../../../src/app/awards/page.tsx#L34) | `src/app/countdown/page.tsx` (same file as T016)
- [x] T018 [US1] Manual responsive smoke — `yarn dev` + visit `/countdown` at 375 / 800 / 1440 px. Verify: no horizontal overflow, tiles scale per design-style §Responsive, headline clamps on mobile, BG image fills viewport without dark gaps | (no file — QA artefact; capture screenshots for PR)

**Checkpoint**: Visiting `/countdown` anonymously (with a future env timestamp) renders the full panel in both locales. 91 Vitest + 3 new tests green. `yarn typecheck` + `yarn lint` clean.

---

## Phase 4: User Story 2 — Event launch transition (Priority: P1)

**Goal**: At T-0, visitors seamlessly transition from the Prelaunch page to the authenticated site. Covered by two mechanisms: (a) **middleware** rewrites `/ → /countdown` only while `now < target`; (b) **client tick** inside `<PrelaunchCountdown>` pushes to `/login` when the minute boundary crosses T-0; (c) **server gate** in `page.tsx` (shipped in T016) redirects new visits to `/login` once launched.

**Independent Test**: Set `NEXT_PUBLIC_EVENT_START_AT` to a time ~70 seconds in the future. Visit `/` anonymously → middleware rewrites to `/countdown`, page renders. Wait ~80 seconds → countdown tick flips, page `router.push("/login")`. Hard-refresh `/countdown` post-launch → `redirect("/login")` fires at the server. Hard-refresh `/` post-launch → middleware does NOT rewrite, existing Homepage shell runs → `redirect("/login")` per existing auth gate.

- [x] T019 [US2] Extend `middleware.ts` — add pre-launch dispatch **before** the `updateSession(request)` call. Logic: if `target` env set + parseable + `Date.now() < targetMs` + `pathname === "/"`, return `NextResponse.rewrite(url)` with `url.pathname = "/countdown"`. Otherwise fall through to `updateSession(request)`. Keep matcher unchanged. Include the tradeoff note from plan.md §Notes as a comment above the dispatch block. Import `NextResponse` from `next/server` | `middleware.ts`
- [x] T020 [P] [US2] Add Playwright test in the happy-path spec: (a) with env in the future → visit `/` → assert URL stays as `/` but page rendered is the Prelaunch (heading matches `countdown.prelaunch.headline`); (b) with env in the past → visit `/countdown` → assert redirect to `/login` — see T023 below | `tests/e2e/countdown.spec.ts`
- [x] T021 [P] [US2] Verify the client T-0 transition is implemented in T015 (no new work here — just confirmation that the Vitest case in T014 asserts `router.push("/login")` fires). Document in PR description that the 60 s tick + server gate together cover US2 | (no file — reviewer note)

**Checkpoint**: Middleware rewrites `/` → `/countdown` pre-launch; stops rewriting post-launch. Server `redirect` covers direct `/countdown` post-launch visits. Client tick covers users sitting on the page through T-0.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: E2E suites, a11y gate, SCREENFLOW update, bundle / Lighthouse verification. US3 (localisation) and US4 (responsive) are inline to Phase 3 — this phase formalises verification.

- [x] T022 Verify all 3 section sub-specs pass acceptance with both locales. Toggle `NEXT_LOCALE` cookie between `vi` and `en`; assert headline + unit labels + fallback all update without reload. Captured in T023 E2E spec | (no file — manual smoke)
- [x] T023 [P] Create Playwright happy-path E2E `tests/e2e/countdown.spec.ts` — tests: (a) anonymous visit to `/countdown` renders H1 + 3 unit labels (VI and EN); (b) middleware rewrites `/` → `/countdown` when env in future (fixture manipulates env); (c) visiting `/countdown` post-launch redirects to `/login`; (d) existing auth fixtures unused (this is a public route). Pattern mirrors [`tests/e2e/awards.spec.ts`](../../../tests/e2e/awards.spec.ts) structure | `tests/e2e/countdown.spec.ts`
- [x] T024 [P] Create Playwright a11y spec `tests/e2e/countdown.a11y.spec.ts` — `@axe-core/playwright` scan at desktop 1440×900 + mobile 375×812, assert zero serious/critical violations. Mirror [`tests/e2e/awards.a11y.spec.ts`](../../../tests/e2e/awards.a11y.spec.ts) | `tests/e2e/countdown.a11y.spec.ts`
- [x] T025 [P] SC-004 i18n leak scan — run `grep -RE "Sự kiện sẽ bắt đầu sau" src/` and confirm hits **only** in `src/messages/vi.json`. Block merge if the string leaks into a `.tsx`/`.ts` file | (no file — CI grep)
- [x] T026 [P] `yarn build` + inspect the `/countdown` route bundle — confirm added JS ≤ 15 KB gzipped. The route ships only `<PrelaunchCountdown>` (client) + `useCountdown` hook — should be tiny | (no file — CI artefact)
- [x] T027 [P] Lighthouse on `/countdown` (desktop + mobile) — Performance ≥ 90 (public LCP with 4.4 MB hero is the big variable — **R2**), Accessibility ≥ 95, Best Practices ≥ 95. If Performance drops below 85, file a follow-up ticket to ship AVIF/WebP derivative of `homepage-hero.png` (not blocking MVP) | (no file — QA artefact)
- [x] T028 Update [SCREENFLOW.md](../../contexts/screen_specs/SCREENFLOW.md): flip row #11 (MVP table) and full-inventory row #3 from `discovered` → `implemented`. Update "Last Updated" to implementation date. Append a Discovery Log entry summarising delivered scope | `.momorph/contexts/screen_specs/SCREENFLOW.md`

**Checkpoint**: All gates green. PR ready with screenshots + Lighthouse scores + axe report.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies; all 3 tasks parallel.
- **Phase 2 (Foundation)**: depends on Phase 1. T008 blocks T009 (TDD). T009 blocks T010 (consumer depends on hook). T004/T005/T006/T007 parallel.
- **Phase 3 (US1 + inline US3/US4)**: depends on Phase 2 complete (hook must exist + i18n keys present + `AnalyticsEvent` union updated).
- **Phase 4 (US2)**: depends on Phase 3 (route must exist before middleware rewrite has a target).
- **Phase 5 (Polish)**: depends on Phases 3 + 4.

### Within each user story

- Unit tests labelled `[P]` can be authored alongside the implementation task they precede (TDD: write failing test, implement to green).
- Atoms (T011–T013) block the client island (T015).
- Client island (T015) blocks route composition (T016–T017).

### Parallel opportunities

- **Phase 1**: 3 verify tasks fully parallel.
- **Phase 2**: T004, T005, T006, T007 all `[P]` (different files). T008 + T009 are sequential (TDD).
- **Phase 3**: T011/T013 parallel; T014 parallel to T011/T013 (different files). T012 blocks T015 (imports `<PrelaunchCountdownTile>`). T016 blocks T017 (same file).
- **Phase 5**: T023, T024, T025, T026, T027 all `[P]` (different artefacts / read-only scans).

---

## Implementation Strategy

### MVP-first (recommended)

1. **Phases 1 + 2** — setup + foundation. Hook extract must land first; Homepage regression gate confirms no break.
2. **Phase 3** — ship US1 (core render). Page renders with a future env timestamp. Stop + validate via manual smoke (T018).
3. **Phase 4** — ship US2 (middleware rewrite + T-0 transition). Stop + validate by setting env ~70 s in future and watching transition.
4. **Phase 5** — E2E + a11y + Lighthouse gates + SCREENFLOW update. Open PR.

### Incremental delivery (alternative)

Could ship Phase 1 + 2 + 3 as a preview route (`/countdown` reachable but not wired to `/`). Useful if Marketing wants to review the visual before flipping the middleware switch. Small additional cost: T019 lands in a follow-up PR.

---

## Notes

- **Commit boundaries**: one commit per phase (or per `[P]`-group). Use scopes `feat(countdown)`, `refactor(countdown)` (for the Homepage hook extract), `chore(i18n)` (for `countdown.prelaunch.*`).
- **TDD is the shipped pattern** in this project (constitution §III). Vitest specs in Phase 2 and Phase 3 are ordered to fail first, then implement to green.
- **Post-merge**: capture Lighthouse + axe scores in the PR description. Link them from the SCREENFLOW Discovery Log entry (T028).
- **Hero image size (R2)**: if Lighthouse Performance dips below 85 (likely at mobile throttled 3G), file a follow-up issue to ship an AVIF/WebP derivative. Not blocking MVP.
- **`unoptimized` on `<Image>`**: use it on the BG image (mirrors the recent CollectibleBadge / HeroBadge precedent on Thể lệ). Keeps raw file served — Next.js image optimizer cache is the exact issue we hit during the Thể lệ badge iteration.
- **Middleware test coverage**: deliberately covered via Playwright (T020) instead of a unit harness. Constitution §III TDD is satisfied via integration-level E2E rather than unit.
- **Homepage regression coverage**: per plan §Modified files note, no `Countdown.spec.tsx` exists in `src/components/homepage/__tests__/`. The refactor in T010 is covered by (a) `yarn test:run` still green after extract, (b) Playwright `awards.spec.ts` incidentally exercises the Homepage Countdown on route visits.
- **Skipped tasks**: none. All 4 user stories are addressed (US1 + US3 + US4 consolidated into Phase 3 inline since they are all content/styling; US2 in Phase 4).
