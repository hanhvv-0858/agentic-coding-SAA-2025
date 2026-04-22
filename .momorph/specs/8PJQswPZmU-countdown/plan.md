# Implementation Plan: Countdown – Prelaunch Page

**Frame**: `8PJQswPZmU-countdown`
**Date**: 2026-04-19
**Spec**: [`spec.md`](./spec.md)
**Design**: [`design-style.md`](./design-style.md)

---

## Summary

Ship a **public, chromeless** Prelaunch landing page that shows a live
Days / Hours / Minutes countdown to `NEXT_PUBLIC_SITE_LAUNCH_AT` on top of
the shared SAA key-visual background. Transitions to the authenticated
Homepage at T-0.

**Chosen approach (resolves all 9 open questions):**

| Q | Decision |
|---|----------|
| **Q1 — Public or auth-gated?** | **Public**. No `redirect("/login")`, no `SiteHeader`. |
| **Q2 — Route placement?** | **Dedicated `/countdown` route** (Option B). Avoids the risky refactor of `src/app/page.tsx` and keeps the authenticated Homepage untouched. A small `middleware.ts` tweak handles the "redirect `/` → `/countdown` while `now < target`" dispatch. |
| **Q3 — Launch timestamp source?** | **Reuse `NEXT_PUBLIC_SITE_LAUNCH_AT`** (already in `src/libs/env/client.ts`). |
| **Q4 — Seconds?** | **D/H/M only** on Prelaunch. Keep Homepage hero's D/H/M/S asymmetry (the minute-resolution tick is cheaper + matches the quiet "holding page" mood). |
| **Q5 — T-0 behaviour?** | **Auto-rewrite** via `middleware.ts`: once `Date.now() >= target`, the middleware stops rewriting `/` → `/countdown`. Client-side detects T-0 locally and calls `router.push("/login")` so users already on the page don't sit on `00:00:00`. |
| **Q6 — EN headline?** | **"Event starts in"** — direct mirror of VI, consistent with Homepage `hero.comingSoon` tone. Can be swapped via i18n key `countdown.prelaunch.headline` if Marketing revises. |
| **Q7 — BG asset?** | **Reuse `public/images/homepage-hero.png`**. Known concern: 4.4 MB — deferred AVIF/WebP optimisation as Phase 4 polish; not a blocker for MVP. |
| **Q8 — Site chrome?** | **Chromeless**. No `SiteHeader`, `SiteFooter`, or `QuickActionsFab`. A language toggle may come in Phase 2 based on analytics. |
| **Q9 — Root-swap refactor?** | **Not applicable** given Q2 = dedicated route. Homepage stays as-is. |

Core technical moves:

1. **Extract** `computeRemaining` + tick effect out of
   [`src/components/homepage/Countdown.tsx`](../../../src/components/homepage/Countdown.tsx)
   into a new hook `src/hooks/useCountdown.ts`. Refactor Homepage to
   consume the hook — **no API change** to `<Countdown>`.
2. **New client component** `<PrelaunchCountdown>` that consumes the same
   hook but renders the glass-style tiles (distinct visual from Homepage's
   flip-clock).
3. **New Server Component route** `src/app/countdown/page.tsx` — public,
   chromeless, renders `<BackgroundImage>` + `<CoverGradient>` +
   `<PrelaunchCountdown>`.
4. **Middleware dispatch** — extend [`middleware.ts`](../../../middleware.ts)
   to rewrite `/` → `/countdown` when `now < NEXT_PUBLIC_SITE_LAUNCH_AT`.
   Session refresh behaviour stays intact.

No DB, no API, no new npm deps.

---

## Technical Context

| Aspect | Choice |
|--------|--------|
| Language / Framework | TypeScript (strict) / Next.js 16 App Router |
| Primary Dependencies | React 19, TailwindCSS 4, `@supabase/ssr` (for session refresh pass-through only) |
| Database | None |
| Auth | N/A — public route (explicitly skips per-page `getUser()` + `redirect("/login")`) |
| Testing | Vitest (unit / integration), Playwright + `@axe-core/playwright` (E2E + a11y) |
| State Management | Single `"use client"` island with `useCountdown()` hook; server derives `hasLaunched` flag from env var |
| API Style | N/A |
| i18n | Existing `getMessages()` — reuse `homepage.countdown.*` labels + add one new `countdown.prelaunch.headline` key per locale |
| Analytics | Extend `AnalyticsEvent` union in [`src/libs/analytics/track.ts`](../../../src/libs/analytics/track.ts) with `prelaunch_view` + `prelaunch_launch_transition` |
| Env | `NEXT_PUBLIC_SITE_LAUNCH_AT` — already declared in [`src/libs/env/client.ts:12`](../../../src/libs/env/client.ts#L12) |

---

## Constitution Compliance Check

*GATE: all items MUST pass before implementation begins.*

| Principle | Rule | How this plan complies |
|-----------|------|------------------------|
| I. Clean Code | TypeScript strict, `@/*` aliases, PascalCase components, one item per file, **hooks under `src/hooks/`** | Extract `useCountdown` to `src/hooks/useCountdown.ts` (constitution-mandated path); new Prelaunch components under `src/components/countdown/` |
| II. Responsive Design | Breakpoints 640/1024 via Tailwind `sm:` / `lg:`; touch targets ≥ 44×44 px | Full responsive spec in design-style.md §Responsive (mobile `<640`: tiles 54×86; tablet: 66×106; desktop: 77×123) |
| III. TDD | Write failing tests first; unit + integration + E2E | Vitest for `useCountdown` hook (pure function); component test for `<PrelaunchCountdown>`; Playwright `countdown.spec.ts` + `countdown.a11y.spec.ts` |
| IV. Security | No client-exposed secrets; no user input | Read-only public page; only consumes a `NEXT_PUBLIC_*` env var; no Supabase calls on this route |
| V. Platform Best Practices | Server Components by default; `next/image`; `<Icon />`; Tailwind utilities; no `useEffect` for data fetch | Page is Server Component; `<Image>` for bg with `priority` + `unoptimized` option (see §Architecture); tick-effect in hook is for local derived state, not data fetch |
| Tech stack | Next.js 16 / React 19 / Tailwind 4 / Yarn | No new npm deps. `yarn lint` + `yarn build` gates apply. |

**Violations**: None.

---

## Architecture Decisions

### Frontend

**Component structure**

```
<CountdownPage>  Server Component (src/app/countdown/page.tsx)
  — no SiteHeader / SiteFooter / FAB (chromeless per Q8)
  — calls generateMetadata() from countdown.prelaunch.meta.*
  — reads NEXT_PUBLIC_SITE_LAUNCH_AT server-side
  — if hasLaunched already (now >= target) → redirect("/login")
  — fires track({ type: "prelaunch_view", remaining_minutes })
    directly (precedent: Homepage `page.tsx:60` + Awards `page.tsx:81`
    both call track() from Server Components)
  │
  ├── <BackgroundImage>    next/image, fill, object-cover, priority, aria-hidden
  ├── <CoverGradient>      <div> inline style, aria-hidden
  └── <PrelaunchContent>   relative z-20 · flex column center · gap-16 sm:gap-24 lg:gap-[120px]
      ├── <h1>             headline "Sự kiện sẽ bắt đầu sau" / "Event starts in"
      └── <PrelaunchCountdown>  "use client" island
          uses useCountdown() → { days, hours, minutes, hasLaunched }
          role="timer" aria-live="polite" aria-atomic="true"
          aria-label={`Event starts in ${days} days, ${hours} hours, ${minutes} minutes`}
          fires track({ type: "prelaunch_launch_transition" }) at T-0
          then router.push("/login")
          │
          └── 3× <CountdownUnit>  flex column items-start gap-[21px]
                ├── <div flex gap-[21px]>  ← pair of <PrelaunchCountdownTile>
                └── <span label>           ← DAYS / HOURS / MINUTES
```

**State management**

- Server-side: `hasLaunched` computed from env var at request time. If
  already true → `redirect("/login")` in `page.tsx` (FR-008) so new
  visitors post-launch never see a stale countdown.
- Client-side: `useCountdown()` hook owns `remaining` + `hasLaunched`
  state. On mount: starts a 1-minute `setInterval` + `visibilitychange`
  listener. On T-0: fires `track({ type: "prelaunch_launch_transition" })`
  then `router.push("/login")`. Hook returns early with static zeros
  when `eventStartAt` is missing/invalid.

**Data fetching**: none.

### Middleware dispatch (Q2/Q5 implementation)

Extend [`middleware.ts`](../../../middleware.ts):

```ts
export async function middleware(request: NextRequest) {
  // Pre-launch gate: rewrite / → /countdown when event hasn't started.
  const target = process.env.NEXT_PUBLIC_SITE_LAUNCH_AT;
  if (target && request.nextUrl.pathname === "/") {
    const targetMs = Date.parse(target);
    if (!Number.isNaN(targetMs) && Date.now() < targetMs) {
      const url = request.nextUrl.clone();
      url.pathname = "/countdown";
      return NextResponse.rewrite(url);
    }
  }
  return updateSession(request);
}
```

Keeps session-refresh side effect when not rewriting. Matcher unchanged.

### Backend

None. No DB, no API endpoints. Supabase Auth is untouched.

### Integration Points

| Existing Service / Component | How used |
|------------------------------|----------|
| `@/libs/env/client#clientEnv.NEXT_PUBLIC_SITE_LAUNCH_AT` | Source of launch timestamp (both server + client) |
| `@/libs/i18n/getMessages` | Load `countdown.prelaunch.headline` + reused `homepage.countdown.*` labels |
| `@/libs/analytics/track` | Fire `prelaunch_view` + `prelaunch_launch_transition` — union extension required |
| `@/components/homepage/Countdown` | **Refactored** to consume new `useCountdown()` hook; public API unchanged |
| `public/images/homepage-hero.png` | Background image (reused) |

---

## Project Structure

### Documentation (this feature)

```
.momorph/specs/8PJQswPZmU-countdown/
├── spec.md           (existing)
├── design-style.md   (existing)
├── plan.md           (this file)
├── tasks.md          (next step — /momorph.tasks)
└── assets/
    └── frame.png     (existing)
```

### New source files

| File | Purpose |
|------|---------|
| `src/app/countdown/page.tsx` | Server Component — public route, metadata, server-side `hasLaunched` check + post-launch redirect, renders the full page |
| `src/components/countdown/PrelaunchCountdown.tsx` | `"use client"` — consumes `useCountdown()`, renders 3 `<CountdownUnit>` + handles T-0 `router.push("/login")` + fires `prelaunch_launch_transition` analytics |
| `src/components/countdown/PrelaunchCountdownTile.tsx` | Presentational — single 77×123 glass tile with one Digital Numbers digit |
| `src/components/countdown/CountdownUnit.tsx` | Presentational — pair of tiles + uppercase label |
| `src/hooks/useCountdown.ts` | **Shared hook** — ticks state every minute, recomputes on `visibilitychange` + `focus`, returns `{ days, hours, minutes, hasLaunched }`. Extracted from Homepage `<Countdown>` |
| `src/hooks/__tests__/useCountdown.spec.ts` | Vitest — pure function correctness (edge cases: env missing, past target, > 99 days clamp, visibilitychange recompute) |
| `src/components/countdown/__tests__/PrelaunchCountdown.spec.tsx` | Vitest — renders 3 units + aria-label; fires `router.push("/login")` at T-0 |
| `src/components/countdown/__tests__/PrelaunchCountdownTile.spec.tsx` | Vitest — renders a single digit + glass styling |
| `tests/e2e/countdown.spec.ts` | Playwright happy-path — page renders headline + 3 units in VI + EN; middleware rewrite when env in future; post-launch redirect to `/login` |
| `tests/e2e/countdown.a11y.spec.ts` | Playwright + axe-core — zero serious/critical violations at desktop 1440×900 + mobile 375×812 |

### Modified files

| File | Changes |
|------|---------|
| `src/components/homepage/Countdown.tsx` | Strip inline tick logic → call `useCountdown()` hook. Keep `{ eventStartAt, labels }` prop shape. Retain flip-clock tile rendering. Verified: no `__tests__/Countdown.spec.tsx` exists today (no homepage-level test folder), so no test edits required — regression coverage is via the Playwright `awards.spec.ts`/`countdown.spec.ts` flows that indirectly hit the Homepage Countdown on route visits. |
| `middleware.ts` | Add pre-launch dispatch: `/` → `/countdown` rewrite while `now < NEXT_PUBLIC_SITE_LAUNCH_AT` |
| `src/libs/analytics/track.ts` | Extend `AnalyticsEvent` union with `prelaunch_view` + `prelaunch_launch_transition` (mirror how `rules_*` events were added) |
| `src/messages/en.json` | Add `countdown.prelaunch.headline: "Event starts in"` + `countdown.prelaunch.meta.title: "Countdown \| SAA 2025"` + `countdown.prelaunch.meta.description: "SAA 2025 prelaunch countdown"`. Unit labels (DAYS/HOURS/MINUTES) + env-missing fallback reused from existing `homepage.countdown.*`. |
| `src/messages/vi.json` | Add `countdown.prelaunch.headline: "Sự kiện sẽ bắt đầu sau"` + `countdown.prelaunch.meta.title: "Đếm ngược \| SAA 2025"` + `countdown.prelaunch.meta.description: "Đếm ngược khai mạc SAA 2025"`. |
| `.momorph/contexts/screen_specs/SCREENFLOW.md` | Flip row #11 `discovered` → `implemented` on completion; Discovery Log entry |

### Dependencies

**No new npm packages.** Everything is built on installed primitives.

---

## Implementation Strategy

### Phase 0 — Asset preparation

No new assets for this screen. `public/images/homepage-hero.png` already
exists. An AVIF/WebP derivative is a Phase-4 polish item (risk R2).

### Phase 1 — Foundation (parallel-safe)

1. Extend `AnalyticsEvent` union + add matching `try/catch` precedent
   (shipped with `rules_*` is the exact pattern).
2. Add `countdown.prelaunch.{headline, meta.title, meta.description}` to both i18n catalogs (unit labels + env-missing fallback reuse existing `homepage.countdown.*`).
3. Create `src/hooks/useCountdown.ts` + its Vitest spec (TDD: write
   failing test first that asserts `computeRemaining` + `hasLaunched`
   behaviour; then extract from Homepage).
4. Refactor `src/components/homepage/Countdown.tsx` to consume the new
   hook. Run existing Homepage tests — must stay green.

### Phase 2 — Core screen (US1 — P1)

1. Vitest (TDD) for `<PrelaunchCountdownTile>` — asserts single digit
   renders with glass-style class set.
2. Implement `<PrelaunchCountdownTile>`.
3. Implement `<CountdownUnit>` (trivial flex wrapper).
4. Vitest for `<PrelaunchCountdown>` — asserts 3 units + aria-label
   composition + digit values come from hook.
5. Implement `<PrelaunchCountdown>` wiring the hook.
6. Build `src/app/countdown/page.tsx` — Server Component, chromeless,
   pulls copy via `getMessages()`, renders `<Image>` + `<CoverGradient>` +
   `<PrelaunchContent>`.
7. Manual smoke at 375 / 800 / 1440 px — verify responsive spec from
   design-style.md §Responsive.

### Phase 3 — T-0 transition + middleware (US2 — P1)

1. Client tick: when `hasLaunched` flips, call
   `track({ type: "prelaunch_launch_transition" })` inside try/catch then
   `router.push("/login")`.
2. Server gate in `page.tsx`: if `Date.now() >= target`, skip render and
   `redirect("/login")` (FR-008).
3. Extend `middleware.ts` with the `/` → `/countdown` rewrite. Write a
   dedicated unit test in `middleware.spec.ts` **if** the project has a
   middleware test harness; otherwise rely on the Playwright e2e to
   cover the end-to-end rewrite behaviour.

### Phase 4 — Localisation + a11y polish (US3 + US4 — P2)

1. Verify both locales render; toggle via `NEXT_LOCALE` cookie and smoke-
   test.
2. Run axe-core via Playwright (`countdown.a11y.spec.ts`) — zero
   serious/critical violations at desktop + mobile viewports.
3. Lighthouse run — performance ≥ 95 / a11y ≥ 95. If hero image LCP too
   slow, flag R2 mitigation for follow-up.
4. `prefers-reduced-motion` check — no animations ship in MVP anyway, so
   this is a grep confirmation.

### Phase 5 — E2E + SCREENFLOW

1. `tests/e2e/countdown.spec.ts`:
   - Unauthenticated user → `/countdown` renders happy path.
   - Middleware rewrites `/` → `/countdown` when env future.
   - Post-launch: hitting `/` and `/countdown` both land on `/login`.
   - Language toggle via cookie: VI ↔ EN.
2. `tests/e2e/countdown.a11y.spec.ts` — axe scan.
3. Flip SCREENFLOW row #11 to `implemented`; append Discovery Log.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: `useCountdown()` hook correctness (pure function); `<PrelaunchCountdown>` consumes hook + fires analytics + navigates; `<Countdown>` regression after hook extract.
- [x] **External dependencies**: none (middleware rewrite covered by Playwright).
- [ ] **Data layer**: N/A.
- [x] **User workflows**: public visit pre-launch; post-launch redirect; middleware rewrite.

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Tick advance triggers DOM update; T-0 triggers `router.push` |
| Service ↔ Service | No | N/A |
| App ↔ External API | No | N/A |
| App ↔ Data Layer | No | N/A |
| Cross-platform | Yes | Responsive 375 / 800 / 1440 |

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `useRouter` (`next/navigation`) | `vi.mock` | Assert `router.push("/login")` at T-0 |
| `track` | `vi.fn()` | Assert event payloads |
| `Date.now()` | `vi.useFakeTimers()` | Deterministic tick + T-0 simulation |
| `NEXT_PUBLIC_SITE_LAUNCH_AT` | Per-test env override | Cover future/past/missing cases |

### Test Scenarios Outline

1. **Happy path**
   - [x] Render 3 units with 2-digit values
   - [x] Tick advances from `00:05:20` → `00:05:19` (minute boundary)
   - [x] `aria-label` announces remaining time
2. **Error handling**
   - [x] Missing env → 3×`00`, fallback i18n string rendered, no crash
   - [x] Past env → server-side `redirect("/login")`, no hydration flash
3. **Edge cases**
   - [x] `visibilitychange` recomputes remaining (simulated with `vi.advanceTimersByTime` + tab hide/show)
   - [x] Days > 99 → clamps to `"99"`
   - [x] Middleware rewrite honours session-refresh side effect

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| `useCountdown()` | 100 % branch | High |
| `<PrelaunchCountdown>` + subcomponents | 90 %+ | High |
| Middleware dispatch | E2E coverage | High |
| a11y gates | Zero violations | High |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1** — Extracting `useCountdown` breaks Homepage hero | Low | High | TDD: write hook tests first, run existing Homepage tests after refactor, keep `<Countdown>` prop API identical |
| **R2** — 4.4 MB hero image tanks Lighthouse LCP on prelaunch (public page, cold cache) | Medium | Medium | Accept for MVP; ship AVIF/WebP derivative as Phase-4 polish. `unoptimized` Next.js Image still benefits from browser cache on repeat visit. |
| **R3** — Middleware rewrite collides with existing `updateSession` cookie pass-through | Low | High | Rewrite returns a distinct `NextResponse.rewrite`; session-refresh path untouched when `now >= target` or pathname ≠ `/`. Covered by manual smoke + e2e. |
| **R4** — `NEXT_PUBLIC_SITE_LAUNCH_AT` unset in production | Low | Medium | Zod schema marks env optional; hook + server gate both handle undefined gracefully (show `00:00:00` + fallback). Add a PR-time check in README. |
| **R5** — Clock skew between client and server surfaces inconsistent state at T-0 | Low | Low | Client checks every minute; any drift ≤ 60 s is invisible at minute resolution. |
| **R6** — `prefers-reduced-motion` users see tick animation flicker | Low | Low | No animations in MVP — risk is zero until Phase-5 polish adds flip/fade. |
| **R7** — i18n key missing breaks render | Low | Low | Only one new key (`countdown.prelaunch.headline`); everything else reused. `getMessages()` graceful-degrades to key name per existing pattern. |

### Estimated Complexity

- **Frontend**: **Low-Medium** — 5 new components (4 are trivial presentation) + 1 hook extract + 1 route. No new dependencies.
- **Backend**: **None**.
- **Testing**: **Medium** — hook needs careful fake-timer coverage; middleware dispatch needs Playwright verification.
- **Overall**: ~**1.5–2 engineering days** for a single engineer (hook extract + Homepage regression + 5 components + 1 route + 1 middleware tweak + tests).

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed (section §I mandates `src/hooks/` location)
- [x] `spec.md` approved (4 user stories, 9 FRs, 9 TRs, 6 SCs, 9 open Qs **resolved in §Summary above**)
- [x] `design-style.md` approved (tokens + layout + implementation mapping)
- [x] `SCREENFLOW.md` updated (row #11 `discovered`)
- [x] Homepage hero `<Countdown>` already shipped (source of the tick engine)
- [x] `NEXT_PUBLIC_SITE_LAUNCH_AT` declared in Zod env schema
- [ ] Stakeholder ack of Q2/Q5/Q6 decisions captured in this plan

### External Dependencies

- None.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to break this plan into executable tasks.
2. **Review** `tasks.md` for parallel `[P]` opportunities (Phase 1's 4
   foundation tasks are all independent).
3. **Begin** implementation with Phase 1 (hook extract + Homepage
   regression test gate) — this unblocks all downstream Prelaunch work.

---

## Notes

- **No new atoms promoted to `src/components/ui/`**: `<PrelaunchCountdownTile>`
  and `<CountdownUnit>` live in `src/components/countdown/` because they
  are screen-specific to Prelaunch. If the Homepage hero is ever
  redesigned to match the glass aesthetic (Q4 re-resolution), the tile
  can be promoted at that point.
- **Middleware test coverage**: project currently has no middleware unit
  test scaffolding. Rely on Playwright e2e to cover the
  `/` → `/countdown` rewrite end-to-end rather than building a unit-test
  harness just for this feature. Constitution §III TDD still satisfied
  via integration-level coverage.
- **Homepage `<Countdown>` refactor is non-breaking**: props
  `{ eventStartAt, labels }` preserved; only internal structure changes.
  The existing `Countdown.spec.tsx` (if any) stays green without edits.
- **Analytics note**: `prelaunch_view`'s `remaining_minutes` dimension
  is computed once on mount (client). It is NOT re-fired on each tick —
  that would spam the data layer. Use `prelaunch_launch_transition` for
  the T-0 moment.
- **Middleware rewrite consideration**: browsers cache rewrites at the
  URL level, so the `/` → `/countdown` dispatch is tried fresh on each
  request. Edge CDN caching can be added in Phase-4 polish via
  `s-maxage=60` per FR-007.
- **Middleware session-refresh tradeoff** (tied to Q5/R3 in risk register):
  the proposed dispatch runs `NextResponse.rewrite(url)` and **skips**
  `updateSession(request)` on the `/` pre-launch path. Rationale:
  1. Prelaunch visitors are typically anonymous — session refresh is a
     no-op.
  2. Signed-in users who happen to land on `/` pre-launch get a session
     refresh on any subsequent navigation to `/awards`, `/the-le`, etc.
  3. Merging a rewrite response with `updateSession`'s cookie side
     effects requires manually copying cookies from one `NextResponse`
     to another — adds complexity for negligible benefit.
  If Q5 is later re-resolved, the mitigation is a 4-line cookie-copy
  from `sessionResponse.cookies` to the rewrite response. Not needed
  for MVP.
- **Analytics `prelaunch_view`**: fired from the Server Component
  `page.tsx` directly (precedent: `src/app/page.tsx:60` +
  `src/app/awards/page.tsx:81` both call `track({ type: "screen_view" })`
  server-side). The `track()` helper handles server vs client split
  internally — server emits a stdout JSON log; client pushes to
  `window.dataLayer`. One analytics call site, no extra client island.
