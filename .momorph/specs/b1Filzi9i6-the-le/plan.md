# Implementation Plan: Thể lệ (Event Rules)

**Frame**: `b1Filzi9i6-the-le`
**Date**: 2026-04-19
**Spec**: [`spec.md`](./spec.md)
**Design**: [`design-style.md`](./design-style.md)

---

## Summary

Ship a read-only "Thể lệ" (Rules) surface explaining the SAA 2025 Kudos
programme — three content sections (Hero tiers, 6 collectible badges,
Kudos Quốc Dân) plus a footer action bar (Đóng + Viết KUDOS).

**Chosen approach (resolves spec Q1)**: Dedicated authenticated SSR route
`/the-le` rendered by a Server Component, with a thin `"use client"`
dismissal wrapper providing `Esc`-key + backdrop-click close, focus trap,
and body-scroll lock. Deferred to **Option B** (page-route, not
intercepting modal) because:

1. Next.js App Router **intercepting routes** have known rough edges with
   SSR auth middleware + locale cookies in the existing stack — shipping
   the rule page as a route avoids a week of middleware surgery.
2. All three caller screens (Homepage, Live board, Compose) will treat
   Rules as an external link anyway, so the back-button round-trip is
   adequate. Option A (true modal over caller) can be a Phase 2 upgrade.
3. Static content — no dynamic data — removes the need to preserve caller
   scroll/state across a real modal.

**No DB / no API**: content lives entirely in `src/messages/{vi,en}.json`
under the new `rules.*` namespace (14 keys from spec §Data Requirements).
Supabase Auth is reused unchanged — the route is gated by the same
`createClient().auth.getUser()` pattern already shipped on `/awards`.

---

## Technical Context

| Aspect | Choice |
|--------|--------|
| Language / Framework | TypeScript (strict) / Next.js 16 App Router |
| Primary Dependencies | React 19, TailwindCSS 4, `@supabase/ssr` |
| Database | None for this screen (Supabase RLS not touched) |
| Auth | Supabase Auth via `@/libs/supabase/server` — SSR `getUser()` + `redirect("/login")` on miss (existing pattern, see `src/app/awards/page.tsx`) |
| Testing | Vitest (unit / integration) + Playwright (E2E) |
| State Management | Server Components for content + minimal client island for Esc/backdrop/focus-trap |
| API Style | N/A (no endpoints for this screen) |
| i18n | Existing `getMessages()` in `@/libs/i18n/getMessages` |
| Analytics | Existing `@/libs/analytics/track` helper |

---

## Constitution Compliance Check

*GATE: all items MUST pass before implementation begins.*

| Principle | Rule | How this plan complies |
|-----------|------|------------------------|
| I. Clean Code | TypeScript strict, `@/*` aliases, PascalCase components, one item per file | New files under `src/components/the-le/` + `src/app/the-le/page.tsx` follow conventions |
| II. Responsive Design | Breakpoints 640/1024 via Tailwind `sm:` / `lg:`; touch targets ≥ 44×44 px | Mobile `< 640`: full-width sheet, stacked footer, 2×3 badge grid. Tablet `sm:`: centered `max-w-[553px]`, 3×2 grid. Desktop `lg:`: right-anchored 553-wide panel |
| III. TDD | Write failing tests first; unit + integration + E2E | Vitest suites per component (`__tests__/`); Playwright spec `tests/e2e/the-le.spec.ts` (happy-path + a11y scan) |
| IV. Security | Session verified on protected routes via Supabase middleware; no XSS surface | Route uses `createClient().auth.getUser()` + `redirect("/login")`; copy is plain text through React (no `dangerouslySetInnerHTML`) |
| V. Platform Best Practices | Server Components by default, `next/link`, `next/font`, `<Icon />`, Tailwind utilities, no custom CSS | Page is a Server Component; the only `"use client"` boundary is `<RulesDismisser />` for keyboard/backdrop handling. Icons via `<Icon />`. No new CSS files — one new CSS variable (`--color-border-secondary`) added to `globals.css` |
| Tech stack | Next.js 16 / React 19 / Tailwind 4 / Supabase / Yarn | No new dependencies. `yarn lint` + `yarn build` gates already in CI |

**Violations**: None.

---

## Architecture Decisions

### Frontend Approach

**Component structure (atomic-ish):**

```
<RulesPage>  Server Component — auth gate, i18n load, layout
  └── <SiteHeader>                                 (existing)
  └── <RulesDismisser>  "use client" — Esc + backdrop + focus-trap + scroll-lock
      └── <RulesPanel>
          ├── <RulesTitle />
          ├── <RulesContent>   (overflow-y-auto)
          │   ├── <ReceiverSection>
          │   │   ├── <SectionHeading />
          │   │   ├── <BodyParagraph />
          │   │   └── <HeroTierCard tier="new|rising|super|legend" />  × 4
          │   │        └── <HeroBadge tier="..." />  ← shared atom (future: Profile / hover)
          │   ├── <SenderSection>
          │   │   ├── <SectionHeading />
          │   │   ├── <BodyParagraph />
          │   │   ├── <BadgeGrid>
          │   │   │   └── <CollectibleBadge name="..." />  × 6  ← shared atom
          │   │   └── <BodyParagraph />
          │   └── <NationalKudosSection>
          │       ├── <SectionHeading />   (24/32 variant)
          │       └── <BodyParagraph />
          └── <RulesFooter>
              ├── <CloseButton />          ← `<PrimaryButton variant="secondary" size="md">`
              └── <WriteKudosButton />     ← `<PrimaryButton variant="solid"  size="md">`
```

- **Styling**: Tailwind utilities + CSS variables from `globals.css`. No
  `@apply`, no new CSS files.
- **Inlined layout wrappers**: `<BadgeGrid>` and `<RulesFooter>` from
  design-style.md are intentionally **not** broken out as separate
  component files. They are trivial flex/grid wrappers (~5 lines each)
  inlined inside `<SenderSection>` / `<RulesPanel>` respectively. If they
  grow past ~15 lines or become reused outside this screen, extract at
  that time (constitution §I — "avoid premature abstraction").
- **Data fetching**: None — `getMessages()` at the Server Component level
  pre-resolves all copy.
- **Animation**: Slide-in from right at 200 ms ease-out, disabled via
  `prefers-reduced-motion: reduce`. Gated behind `lg:` breakpoint
  (desktop only — mobile/tablet render statically). No backdrop fade
  since the page background is already the dark brand surface in route
  mode.

### Scope of `<RulesDismisser>` in route mode

Because this plan chose the **route** implementation (Q1 Option B), only
a subset of the modal-only FRs applies:

| Spec FR | Applies in route mode? | Implementation |
|---------|------------------------|----------------|
| FR-009 (Esc dismisses) | **Yes** | `useEffect` adds `keydown` listener on `<RulesDismisser>` mount |
| FR-012 (focus trap) | No | There is no caller to trap focus away from; normal tab flow out to header is fine |
| FR-013 (body scroll lock) | No | Page is the primary content; no caller to freeze |
| FR-014 (backdrop click dismiss) | No | No backdrop — the entire page is the rules surface |
| FR-015 (analytics `rules_close`) | **Yes** | Fired from `<CloseButton>` and from the Esc handler in `<RulesDismisser>` |

If Q1 is later re-resolved to modal mode, the disabled rows above activate
without changes to the atom layer (`<RulesPanel>`, `<HeroBadge>`,
`<CollectibleBadge>`). Only `<RulesDismisser>` expands.

### Backend Approach

- **API design**: No new endpoints.
- **Data access**: Supabase Auth `getUser()` only (existing).
- **Validation**: None (no input).

### Integration Points

| Existing Service / Component | How used |
|------------------------------|----------|
| `@/libs/supabase/server#createClient` | SSR auth check → redirect |
| `@/libs/i18n/getMessages` | Load `rules.*` catalog for active locale |
| `@/libs/analytics/track` | Fire `rules_view` / `rules_close` / `rules_cta_write_kudos` |
| `SiteHeader` + `LanguageToggle` + `NotificationBell` + `ProfileMenu` | Top-shell parity with `/awards` |
| `PrimaryButton` | Extend with `size: "md"` + `variant: "secondary"` |
| `Icon` | Add `name="close"`; reuse existing `pencil` |

### Resolved Open Questions (from spec)

| Q | Decision |
|---|----------|
| **Q1** Modal vs route | **Route** (`/the-le`). Rationale above. |
| **Q2** Collectible badge assets | Phase 1 ships with placeholder circles (white border, transparent center, label only) + a `TODO` in `assets-map.md`. Real exports fetched via MoMorph `get_media_files` once design confirms — does not block MVP. |
| **Q3** Hero-pill glow asset | Reuse the existing `Root further mo rong 2` image for New/Rising/Super; `image 26/27` composite for Legend. Download via `get_media_files` during Phase 0. |
| **Q4** EN "Viết KUDOS" copy | **"WRITE KUDOS"** (all caps, follows Vietnamese casing; matches homepage FAB label style). |
| **Q5** `linkedFrameId` mismatch | Ignore — we wire to the *route* `/kudos/new` which stubs Viết Kudo. Figma `520:11602` is a legacy draft; canonical is `ihQ26W78P2`. |
| **Q6** Mobile footer stack | **Side-by-side** with `gap: 8` at `< 640`. Both buttons shrink naturally; touch target still ≥ 44 px because `h-14` (56 px). Revisit only if design-review fails readability at 320 px width. |
| **Q7** Text-align justified | **`text-left`** everywhere. Rationale: readability on narrow viewports + Vietnamese line-breaking. |
| **Q8** Hover / active colors | Đóng — `hover:bg-[var(--color-accent-cream)]/18 active:bg-/25`. Viết KUDOS — reuse existing `--color-accent-cream-hover` / `--color-accent-cream-active`. |
| **Q9** "ROOT FURTHER" spelling | Correct spelling (with second R). Figma layer name typo ignored. |
| **Q10** Secondary button path | **Extend `PrimaryButton`** with `variant: "secondary"` + `size: "md"`. Keeps one component; simpler to maintain. Details in §Project Structure. |
| **Q11** Body-copy weight | **`font-normal`** (400) for paragraph text, matching `AwardContent.tsx:50`. `font-bold` reserved for headings / pill labels / count labels / button labels. |

---

## Project Structure

### Documentation (this feature)

```
.momorph/specs/b1Filzi9i6-the-le/
├── spec.md               (existing)
├── design-style.md       (existing)
├── plan.md               (this file)
├── tasks.md              (next step — /momorph.tasks)
├── assets-map.md         (new — generated during Phase 0)
└── assets/
    └── frame.png         (existing)
```

### New source files

| File | Purpose |
|------|---------|
| `src/app/the-le/page.tsx` | Server Component — route handler, auth gate, metadata, renders `<RulesDismisser>` + `<RulesPanel>` |
| `src/components/the-le/RulesPanel.tsx` | Server — layout, title, content block, footer composition |
| `src/components/the-le/RulesDismisser.tsx` | `"use client"` — **Esc-key dismissal only** for route mode. Calls `router.back()` with `history.length === 1` → `router.push("/")` fallback. FR-012 (focus trap), FR-013 (body scroll lock), FR-014 (backdrop click) do **NOT apply** to route mode (see §Architecture — Scope of `<RulesDismisser>` in route mode); they would activate only if Q1 is re-resolved to Option A (modal). |
| `src/components/the-le/RulesContent.tsx` | Server — wraps the 3 sections in a scrollable column |
| `src/components/the-le/sections/ReceiverSection.tsx` | Server — heading, intro, 4 HeroTierCards |
| `src/components/the-le/sections/SenderSection.tsx` | Server — heading, intro, badge grid, outro |
| `src/components/the-le/sections/NationalKudosSection.tsx` | Server — heading (24/32 variant) + body |
| `src/components/the-le/HeroTierCard.tsx` | Server — screen-level organism: pill + count + description |
| `src/components/the-le/CloseButton.tsx` | `"use client"` wrapper around `<PrimaryButton variant="secondary" size="md">` wiring: (a) `router.back()` if `window.history.length > 1` else `router.push("/")` (fallback per FR-002), (b) `track("rules_close", { via: "button" })` (FR-015) |
| `src/components/the-le/WriteKudosButton.tsx` | `"use client"` `<Link>` wrapper around `<PrimaryButton variant="solid" size="md">` → `href="/kudos/new"`, fires `track("rules_cta_write_kudos")` in an `onClick` handler (non-blocking — `try/catch` swallows analytics errors per FR-015) |
| `src/components/ui/HeroBadge.tsx` | **Shared atom** (see TR-004) — pill 126×22 + glow bg + tier label. Reused by Profile/hover overlays later. |
| `src/components/ui/CollectibleBadge.tsx` | **Shared atom** (see TR-005) — 64×64 circle + label, 6 name variants |
| `src/components/the-le/__tests__/RulesPanel.spec.tsx` | Vitest — renders all 3 sections + correct heading hierarchy |
| `src/components/the-le/__tests__/HeroTierCard.spec.tsx` | Vitest — 4 tier variants render expected label + count + description |
| `src/components/the-le/__tests__/CollectibleBadge.spec.tsx` | Vitest — 6 name variants render correct asset + label |
| `src/components/the-le/__tests__/RulesDismisser.spec.tsx` | Vitest — Esc / backdrop / focus-trap behaviour |
| `tests/e2e/the-le.spec.ts` | Playwright — happy-path flows (renders 3 sections in VI + EN; Đóng / Esc → caller; Viết KUDOS → `/kudos/new`; unauthenticated → `/login`) |
| `tests/e2e/the-le.a11y.spec.ts` | Playwright + `@axe-core/playwright` — a11y scan (mirrors existing [`awards.a11y.spec.ts`](../../../tests/e2e/awards.a11y.spec.ts) structure; zero-violation gate) |
| `public/images/the-le/pill-glow.png` | Shared glow asset for New/Rising/Super tier pills |
| `public/images/the-le/pill-glow-legend.png` | Distinct glow asset for Legend tier |
| `public/images/the-le/badge-{revival|touch-of-light|stay-gold|flow-to-horizon|beyond-the-boundary|root-further}.png` | 6 collectible badge images (placeholder-OK for Phase 1 — see Q2 decision) |

### Modified files

| File | Changes |
|------|---------|
| `src/components/ui/Icon.tsx` | Add `"close"` to `IconName` union + its SVG case (24×24, 2 px stroke, `currentColor`, plus `<line>` X) |
| `src/components/ui/PrimaryButton.tsx` | Add `size?: "md" \| "lg"` (default `"lg"` — no regression) and `variant: "secondary"` (border-1 `#998C5F` + cream/10 bg + white text + hover `/18` + active `/25`). Extend `VARIANT_CLASSES` + a new `SIZE_CLASSES` map |
| `src/components/ui/__tests__/PrimaryButton.spec.tsx` | Add cases for `size="md"` + `variant="secondary"` — ensures no regression on existing `size="lg"` / `variant="solid|outline"` |
| `src/app/globals.css` | Add `--color-panel-surface: #00070C;` and `--color-border-secondary: #998C5F;` |
| `src/data/navItems.ts` | Add `{ href: "/the-le", labelKey: "common.nav.rules" }` to `FOOTER_NAV` **only** (header already at capacity with 3 items; adding would force a layout change). If Product insists on header placement, raise in design-review. |
| `src/messages/en.json` + `src/messages/vi.json` | Add new top-level `rules` namespace (14 keys per spec §Data Requirements) + new `common.nav.rules` label ("Thể lệ" / "Rules") |
| `src/messages/{en,vi}.json` (meta) | Add `rules.meta.title` + `rules.meta.description` for `generateMetadata()` — pattern mirrors `awards.meta.*` in `src/app/awards/page.tsx` |
| `.momorph/contexts/screen_specs/SCREENFLOW.md` | Flip row #10 MVP table `discovered` → `implemented`, add Discovery Log entry |

### Stub routes (verified already present — no new files needed)

| File | Status |
|------|--------|
| `src/app/kudos/new/page.tsx` | **Already exists** (verified 2026-04-19) — renders a "Write a Kudo / Coming soon" placeholder. The Viết KUDOS CTA resolves cleanly until the real Viết Kudo screen ships. No work needed. |
| `src/app/kudos/page.tsx` | **Already exists** as a stub; not in this screen's path but relevant if header "Sun\* Kudos" link is clicked from the rules screen. No changes. |

### Dependencies

**No new npm packages.** The entire feature is built on already-installed
primitives (React, Tailwind, Supabase SSR, `next/image`, `next/link`).

---

## Implementation Strategy

### Phase 0 — Asset Preparation *(blocks Phase 3)*

1. Run `get_media_files` on `b1Filzi9i6` to pull hero-pill glow + 6 badge
   assets.
2. Flatten layered composites to single PNGs per badge (if MoMorph export
   returns them pre-flattened, skip).
3. Save under `public/images/the-le/` with names matching the
   `<CollectibleBadge>` registry.
4. Write `assets-map.md` recording source Figma node → local file path +
   dimensions + alt-text key.
5. If any badge exports are missing / visually broken, ship Phase 1 with
   placeholder circles + flag in `assets-map.md`.

### Phase 1 — Foundation *(parallel-safe once Phase 0 locks down tokens)*

1. Add `--color-panel-surface` + `--color-border-secondary` to
   `globals.css`.
2. Add `close` icon to `Icon.tsx` + unit test.
3. Extend `PrimaryButton` with `size: "md"` + `variant: "secondary"` + unit
   tests for all 4 combinations.
4. Add 14 i18n keys to `en.json` + `vi.json` under `rules.*` (English copy
   drafted from Vietnamese source — see `common.nav.rules`).
5. Add `/the-le` to `HEADER_NAV` in `data/navItems.ts`.

### Phase 2 — Shared atoms (US4 accessibility + reuse-first)

1. Write failing test: `<HeroBadge tier="new" />` renders correct
   label + tier pill + text-shadow. Repeat for Rising / Super / Legend.
2. Implement `<HeroBadge />` with props `{ tier: "new" | "rising" | "super"
   | "legend", className?: string }`. Make decorative images `aria-hidden`.
3. Write failing test for `<CollectibleBadge name="revival" />` — 64 × 64
   circle, 2 px white border, correct alt-text key. Repeat across 6
   variants.
4. Implement `<CollectibleBadge />` with `{ name: <one of 6>,
   className?: string }`. Label wraps to 2 lines for long names.

### Phase 3 — US1 "Reads the rules" (P1) + US5 responsive (P2)

1. Write failing Vitest: `<RulesPanel>` renders 1 H1 + 3 H2 + 4
   HeroTierCards + 6 CollectibleBadges + 2 footer buttons.
2. Build `<HeroTierCard>` composing `<HeroBadge>` + count + description.
3. Build `<ReceiverSection>` / `<SenderSection>` /
   `<NationalKudosSection>` — pure Server Components fed by
   `messages.rules.*`.
4. Build `<RulesPanel>` gluing them with a footer `<CloseButton>` +
   `<WriteKudosButton>`.
5. Build `src/app/the-le/page.tsx`: auth gate, `generateMetadata()`,
   `track("rules_view", { source })`, `SiteHeader`, panel render.
   - `source` is derived from the `?source=...` query-string parameter
     on the incoming URL (accepted values: `"homepage" | "live-board"
     | "compose"`). If absent or unrecognised, default to `"direct"`.
     Callers in Homepage / Live board / Compose will set the param on
     their `<Link>` hrefs in a follow-up PR — for MVP, "direct" is
     acceptable.
6. Manual responsive check at 375 / 800 / 1440 px — verify grid reflow +
   `max-h-dvh` scroll behaviour.

### Phase 4 — US2 close + US3 CTA (both P1)

1. Write failing Vitest for `<RulesDismisser>` (route mode): Esc triggers
   the dismiss callback; non-Esc key presses are ignored; unmount removes
   the listener. (Backdrop/focus-trap/scroll-lock tests deferred — not
   applicable in route mode per §Scope of `<RulesDismisser>`.)
2. Implement `<RulesDismisser>` as a thin `"use client"` wrapper — uses
   `useRouter` + calls `router.back()` if `window.history.length > 1`
   else `router.push("/")` as fallback (FR-002). Also fires
   `track("rules_close", { via: "esc" })`.
3. Wire `<CloseButton>` and backdrop onClick to the same dismiss handler.
4. Wire `<WriteKudosButton>` as a `<Link href="/kudos/new" />` + analytics
   side-effect (client component because the analytics call fires on
   click — alternatively use a `"use client"` tracker child inside the
   link).
5. `/kudos/new` stub verified already present in
   [`src/app/kudos/new/page.tsx`](../../../src/app/kudos/new/page.tsx) —
   no new work required. Smoke-test in Phase 6 E2E.

### Phase 5 — US4 accessibility + polish

1. Manual keyboard sweep: Tab / Shift-Tab / Esc / Enter on Close + Viết
   KUDOS.
2. Verify screen-reader announces H1 → H2 → H2 → H2 (no skips).
3. `prefers-reduced-motion` test — confirm slide-in disabled.
4. Run axe-core via Playwright — zero violations.
5. Lighthouse CI — performance ≥ 95 / a11y ≥ 95 / best-practices ≥ 95.

### Phase 6 — E2E + bundle check

1. `tests/e2e/the-le.spec.ts` (happy path) + `tests/e2e/the-le.a11y.spec.ts` (axe-core):
   - Signed-in user → `/the-le` renders 3 sections in VI.
   - Language toggle flips to EN → copy updates without reload.
   - Click Đóng → returns to caller (Homepage) — browser restores focus
     naturally via back navigation (FR-007).
   - Press `Esc` → same behaviour as Đóng (FR-009).
   - Click Viết KUDOS → navigates to `/kudos/new` (stub page renders).
   - Unauthenticated → redirect to `/login`.
   - a11y.spec: axe-core scan returns zero violations (TR-007 gate).
2. `yarn build` + inspect chunk for `/the-le` — confirm < 30 KB JS added
   (matches Awards-page budget).
3. **SC-004 i18n coverage gate**: `grep -R "Dựa trên số lượng\|NGƯỜI NHẬN KUDOS\|KUDOS QUỐC DÂN" src/` must return only `src/messages/vi.json` (no hits inside components or the page). Block the merge if a raw Vietnamese string leaks into a `.tsx` file.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: `<PrimaryButton>` variants + sizes, `<Icon name="close">` regression.
- [x] **External dependencies**: Supabase Auth (reused pattern — asserted via Playwright auth fixture).
- [ ] **Data layer**: N/A.
- [x] **User workflows**: Homepage → /the-le → Đóng → Homepage; Homepage → /the-le → Viết KUDOS → /kudos/new; Unauthenticated → /login.

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Esc/backdrop-close flow, focus-trap, scroll-lock |
| Service ↔ Service | No | No new services |
| App ↔ External API | Yes | Supabase `getUser()` gate (reused — smoke-tested) |
| App ↔ Data Layer | No | No DB |
| Cross-platform | Yes | Responsive 375 / 800 / 1440 |

### Test Environment

- **Environment**: Local dev via `make up` + `make dev`; CI via GitHub Actions using existing Playwright matrix from Homepage/Awards.
- **Test data**: Playwright fixture supplies a signed-in user from the existing auth harness (`tests/e2e/fixtures/`). No seed data required.
- **Isolation**: Fresh browser context per test.

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| Supabase Auth | Real (fixture-authenticated) | Parity with Homepage / Awards E2E tests |
| Analytics `track` | Spy (Vitest `vi.fn()`) | Assert events fired with correct payload |
| `next/navigation` `useRouter` | Spy (Vitest `vi.mock`) | Assert `router.back()` / `router.push("/kudos/new")` |

### Test Scenarios Outline

1. **Happy path**
   - [x] US1: render all 3 sections in VI + EN
   - [x] US2: click Đóng → `router.back()` called
   - [x] US3: click Viết KUDOS → `router.push("/kudos/new")` called
2. **Error handling**
   - [x] Unauthenticated → `redirect("/login")`
   - [x] Missing i18n key → fallback renders (warning in console, no crash)
   - [x] `/kudos/new` 404 → caught by Next.js `not-found.tsx`
3. **Edge cases**
   - [x] `history.length === 1` + Đóng → `router.push("/")`
   - [x] `prefers-reduced-motion` → no animation
   - [x] 320-px viewport → no horizontal overflow
   - [x] EN copy is ~10 % longer than VI → content scrolls, footer pinned

### Tooling & Framework

- **Test framework**: Vitest (unit/integration), Playwright (E2E + axe-core)
- **Supporting tools**: `@testing-library/react`, `@testing-library/user-event`, `@axe-core/playwright`
- **CI integration**: Runs via the existing scripts in [`package.json`](../../../package.json) — `yarn test:run` (one-shot Vitest) and `yarn e2e` (Playwright). Convenience wrappers also exist in [`Makefile`](../../../Makefile) (`make test`, `make e2e`). Lighthouse CI in PR-preview pipeline.

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| `<HeroBadge />` + `<CollectibleBadge />` atoms | 100 % branch | High |
| `<PrimaryButton>` extensions (new size/variant) | 100 % | High |
| `<RulesDismisser>` (keyboard / focus / scroll-lock) | 90 %+ | High |
| Section components (ReceiverSection, SenderSection, NationalKudosSection) | 80 %+ | Medium |
| E2E happy-path + a11y | Every P1 scenario | High |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Collectible badge assets (6×) delayed by Design | Medium | Medium | Phase 1 ships with placeholder circles + labels. Swap to real PNGs post-Phase 0 without code changes |
| `PrimaryButton` extension regresses Homepage "About Awards" button | Low | High | Default `size` = `"lg"` preserves behaviour. Existing test suite (`PrimaryButton.spec.tsx`) extended with `size`-preservation cases |
| Focus-trap interferes with site header Esc behaviour | Low | Medium | `<RulesDismisser>` scopes Esc handler via `ref.current.addEventListener`, removes on unmount. Unit-tested |
| Vietnamese copy exceeds panel height on small viewports | Medium | Low | `max-h-dvh` + `overflow-y-auto` on `<RulesContent>`; footer pinned. Verified at 320 × 568 px |
| `/kudos/new` route absent causes 404 | High | Low | Phase 4 step 5 adds a minimal stub page ("Coming soon") — unblocks CTA until Viết Kudo feature lands |
| Legend-tier pill uses a distinct image not yet exported | Medium | Low | Phase 0 confirms; placeholder glow acceptable for Phase 1 |
| Axe-core gate fails on colour contrast in ghost "Super" layer | Low | Low | Layer is decorative (`aria-hidden`) — ignore in axe run (tagged as decorative) |

### Estimated Complexity

- **Frontend**: **Medium** — one route, two new atoms (`HeroBadge`,
  `CollectibleBadge`), a client dismissal wrapper, plus a `PrimaryButton`
  extension. Bulk of work is i18n copy + accessibility + responsive
  tweaks.
- **Backend**: **None** — Supabase Auth reused unchanged.
- **Testing**: **Medium** — 4 Vitest specs + 1 Playwright spec; a11y scan
  integrated.

**Overall estimate**: ~3 engineering days for a single engineer (asset
prep + atoms + page + dismissal wrapper + tests), one of which is
assets/polish.

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed
- [x] `spec.md` approved (15 FRs, 11 TRs, 5 user stories)
- [x] `design-style.md` approved (tokens + layout + implementation mapping)
- [x] SCREENFLOW.md updated (status: discovered)
- [ ] Design sign-off on Q2/Q4/Q6/Q9/Q11 resolutions captured in this plan
- [ ] Asset exports from MoMorph `get_media_files` (Phase 0)

### External Dependencies

- **Supabase Auth** — in production, no changes required
- **MoMorph `get_media_files`** — for Phase 0 asset pull; fallback = placeholder circles

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the task breakdown aligned with
   this plan's phases.
2. **Review** `tasks.md` for parallelization opportunities (Phase 2 atoms,
   Phase 3 sections, and i18n copy are all independent `[P]` candidates).
3. **Begin** implementation — start with Phase 0 (asset pull) + Phase 1
   (foundation) in parallel since they touch disjoint files.

---

## Notes

- **No DB schema changes.** This plan intentionally avoids Supabase table
  work so the Rules screen can ship before the Kudos persistence layer
  lands.
- **Modal-mode (Q1 Option A)** is explicitly deferred. If Product later
  insists on slide-over-caller UX, revisit by introducing a parallel
  `@modal` slot at the root layout (`src/app/@modal/default.tsx` +
  `src/app/@modal/(.)the-le/page.tsx`) and adjusting caller `<Link>` usage.
  The codebase currently has only the `(public)` route group (for login);
  this refactor would be a first introduction of parallel routes and
  SHOULD be scoped as its own PR. `<RulesPanel>` and all atoms are
  mode-agnostic, so no component rewrites are needed when flipping.
- **Analytics wiring** is a single-line call per event using the existing
  `track` helper — mirrors the `track({ type: "screen_view", screen:
  "awards" })` pattern from `src/app/awards/page.tsx`.
- **Assumption on mobile footer stacking (Q6)** might need revision after
  design review. The chosen side-by-side layout relies on short button
  labels ("Đóng" / "Viết KUDOS") fitting within ~160 px each at 320 px
  viewport width. If designers prefer stacking, the change is a single
  `flex-row` → `flex-col sm:flex-row` swap in `<RulesFooter>`.
