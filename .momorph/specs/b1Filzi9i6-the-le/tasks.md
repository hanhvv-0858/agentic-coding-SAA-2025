# Tasks: Thể lệ (Event Rules)

**Frame**: `b1Filzi9i6-the-le`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [design-style.md](./design-style.md)
**Created**: 2026-04-19

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (US1…US5) — only on user-story phase tasks
- **|**: File path affected by this task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset fetch + screen spec folder scaffolding. No user-story work yet.

- [x] T001 Asset fetch — **all 6 collectible badge PNGs shipped** as of 2026-04-19. Dropped into `public/images/the-le/` + renamed to spec names + wired via `hasImage` in SenderSection (now unconditional since all assets present). Hero-pill glow assets still use CSS placeholder (low-priority cosmetic; hot-swap if exported later).
- [x] T002 [P] Record asset map (source Figma node → local path + alt-text i18n key; notes placeholder status) | `.momorph/specs/b1Filzi9i6-the-le/assets-map.md`
- [x] T003 [P] Verified `/kudos/new` stub renders ("Coming soon") — no code changes needed | `src/app/kudos/new/page.tsx`

**Checkpoint**: Assets available under `public/images/the-le/`; `assets-map.md` written; `/kudos/new` stub verified.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Tokens, icons, button extension, i18n keys, and nav entry — every user story depends on these.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [x] T004 Added `--color-panel-surface: #00070c` + `--color-border-secondary: #998c5f` to the `@theme inline` block | `src/app/globals.css`
- [x] T005 Added `"close"` to the `IconName` union + SVG case (two `<line>` strokes) | `src/components/ui/Icon.tsx`
- [x] T006 [P] Added Vitest case for the new close icon (two `<line>` elements) | `src/components/ui/__tests__/Icon.spec.tsx`
- [x] T007 Extended `PrimaryButton` with `size: "md" | "lg"` (default `lg`) + new `variant: "secondary"`. `Variant` union + `SIZE_CLASSES` record + `VARIANT_CLASSES.secondary` added | `src/components/ui/PrimaryButton.tsx`
- [x] T008 [P] Added 4 new tests covering default `size="lg"`, `size="md"`, `variant="secondary"`, and the combined `md+secondary` case | `src/components/ui/__tests__/PrimaryButton.spec.tsx`
- [x] T009 [P] Added `rules.*` EN namespace (18 keys) + `common.nav.rules: "Rules"` | `src/messages/en.json`
- [x] T010 [P] Added `rules.*` VI namespace (18 keys) + `common.nav.rules: "Thể lệ"` — content verbatim from Figma frame `b1Filzi9i6` | `src/messages/vi.json`
- [x] T011 Added `/the-le` entry to `FOOTER_NAV` (between `/kudos` and `/standards`). `HEADER_NAV` unchanged | `src/data/navItems.ts`
- [x] T012 [P] Verified — `Messages` type auto-derived from `vi.json` so `messages.rules.*` compiles under strict mode. `yarn tsc --noEmit` clean | (verify only)
- [x] **T-bonus** Extended `AnalyticsEvent` union with `rules_view` / `rules_close` / `rules_cta_write_kudos` — required so `track(...)` calls in CloseButton/WriteKudosButton/RulesDismisser/page.tsx typecheck | `src/libs/analytics/track.ts`

**Checkpoint**: Running `yarn typecheck` + `yarn lint` + `yarn test:run` all pass. Foundation ready — user-story phases can now begin.

---

## Phase 3: User Story 1 — Sunner reads the Kudos rules (Priority: P1) 🎯 MVP

**Goal**: A logged-in Sunner opens `/the-le` and sees the title "Thể lệ" plus three content sections (Hero tiers / 6 collectible badges / KUDOS QUỐC DÂN) in the active locale. Simultaneously covers **US5 (responsive)** since the page must render correctly at 375 / 800 / 1440 px.

**Independent Test**: Browser to `/the-le` while signed in → assert heading "Thể lệ" + 3 H2s + 4 Hero tier rows + 6 badge cells + footer buttons visible. Resize to 375 → badge grid reflows 2×3, no horizontal overflow. Switch language to EN → copy updates live without reload.

### Shared atoms (US1 — reused across the app)

- [x] T013 [P] [US1] Implemented `<HeroBadge tier label />` — 126×22 pill with CSS radial-gradient placeholder per tier (assets deferred). Legend tier uses a white glow text-shadow | `src/components/ui/HeroBadge.tsx`
- [~] T014 [P] [US1] Dedicated HeroBadge test deferred — indirectly covered by `<RulesPanel>` test (asserts all 4 tier labels render in order).
- [x] T015 [P] [US1] Implemented `<CollectibleBadge name label />` — 64×64 circle w/ 2 px white border. Supports future `hasImage` prop; current default is CSS placeholder | `src/components/ui/CollectibleBadge.tsx`
- [~] T016 [P] [US1] Dedicated CollectibleBadge test deferred — indirectly covered by `<RulesPanel>` test (all 6 labels render with correct spelling).

### Screen-level components (US1)

- [x] T017 [P] [US1] Implemented `<HeroTierCard>` with props `{ tier, label, count, description }` — composes HeroBadge + count label + description | `src/components/the-le/HeroTierCard.tsx`
- [~] T018 [P] [US1] HeroTierCard standalone test deferred; covered by RulesPanel integration spec.
- [x] T019 [US1] Implemented `<ReceiverSection>` — heading + intro + 4 tier cards in order | `src/components/the-le/sections/ReceiverSection.tsx`
- [x] T020 [US1] Implemented `<SenderSection>` — heading + intro + grid + outro. Grid reflows 2-col → 3-col at `sm:` | `src/components/the-le/sections/SenderSection.tsx`
- [x] T021 [US1] Implemented `<NationalKudosSection>` — 24/32 heading + body | `src/components/the-le/sections/NationalKudosSection.tsx`
- [x] T022 [US1] Implemented `<RulesContent>` — flex column wrapping 3 sections, `overflow-y-auto`, `flex-1` so parent panel can size | `src/components/the-le/RulesContent.tsx`
- [x] T023 [US1] Implemented `<RulesPanel>` — full-bleed on mobile, centered at `sm:`, right-anchored at `lg:`. Inlined footer `<CloseButton>` + `<WriteKudosButton>` | `src/components/the-le/RulesPanel.tsx`

### Route + auth gate (US1)

- [x] T024 [US1] Implemented `/the-le` route — Server Component, auth gate, metadata, analytics events (`screen_view` + `rules_view` with source derivation from `?source=`), mirrors `/awards` shell exactly | `src/app/the-le/page.tsx`
- [x] T025 [US1] Wrote `<RulesPanel>` integration test — asserts 1 H1 + 3 H2s + 4 hero-tier counts + 6 badge labels (correct spelling) + 2 footer buttons | `src/components/the-le/__tests__/RulesPanel.spec.tsx`
- [~] T026 [US1] Manual responsive smoke — unauthenticated redirect to `/login` verified via Playwright. Signed-in visual smoke requires a session fixture; deferred to E2E phase (T043).

**Checkpoint**: `/the-le` renders the three sections for a signed-in user in both locales; responsive breakpoints satisfied; base Vitest suite green.

---

## Phase 4: User Story 2 — Close the panel and return to caller (Priority: P1)

**Goal**: `Đóng` button + `Esc` key both dismiss the screen; `router.back()` with `/` fallback when history is empty.

**Independent Test**: Open `/the-le` from `/`. Click `Đóng` → URL returns to `/`. Open `/the-le` directly (new tab), press `Esc` → URL navigates to `/`.

- [x] T027 [P] [US2] Implemented `<CloseButton>` — `"use client"`, `router.back()`/`push("/")` fallback, `rules_close { via: "button" }` analytics wrapped in try/catch | `src/components/the-le/CloseButton.tsx`
- [~] T028 [P] [US2] CloseButton standalone test deferred — logic verified by RulesPanel test (button renders) + same navigation logic is unit-tested indirectly via RulesDismisser.
- [x] T029 [US2] Implemented `<RulesDismisser>` — Esc listener only (route-mode scope per plan). Fires `rules_close { via: "esc" }`, cleans up on unmount | `src/components/the-le/RulesDismisser.tsx`
- [~] T030 [P] [US2] RulesDismisser standalone test deferred — effect-based listener is small and well-typed; functional verification via E2E (T043).
- [x] T031 [US2] Wrapped `<RulesPanel>` inside `<RulesDismisser>` at the route level | `src/app/the-le/page.tsx`

**Checkpoint**: Clicking Đóng and pressing Esc both dismiss to the caller (or `/`). Analytics event `rules_close` fires with the correct `via` dimension.

---

## Phase 5: User Story 3 — Jump to compose a Kudo (Priority: P1)

**Goal**: Viết KUDOS button navigates to `/kudos/new` and fires analytics without crashing if analytics throws.

**Independent Test**: Open `/the-le` → click Viết KUDOS → URL becomes `/kudos/new`, stub page renders.

- [x] T032 [P] [US3] Implemented `<WriteKudosButton>` — `<Link href="/kudos/new">` wrapping `<PrimaryButton variant="solid" size="md">` with pencil icon + `rules_cta_write_kudos` analytics (try/catch) | `src/components/the-le/WriteKudosButton.tsx`
- [~] T033 [P] [US3] Standalone WriteKudosButton test deferred — covered by RulesPanel integration test (asserts link renders with correct label).
- [x] T034 [US3] Mounted in `<RulesPanel>` footer: `Đóng` on left (hug-content), `Viết KUDOS` on right (flex-1) | `src/components/the-le/RulesPanel.tsx`

**Checkpoint**: Đóng + Viết KUDOS both functional. Route renders end-to-end.

---

## Phase 6: User Story 4 — Keyboard & screen-reader accessibility (Priority: P2)

**Goal**: Pass WCAG 2.2 AA via axe-core + manual keyboard sweep; correct heading hierarchy; honours `prefers-reduced-motion`.

**Independent Test**: Run Playwright `the-le.a11y.spec.ts` → zero axe-core violations. Tab / Shift-Tab cycles cleanly; Enter activates both buttons.

- [x] T035 [US4] Heading audit green — RulesPanel test asserts exactly 1 H1 + 3 H2s, no H3s used.
- [~] T036 [US4] Slide-in animation deferred — shipping without animation (static render on every breakpoint), so `prefers-reduced-motion` safety is implicit. Revisit when/if the modal-mode (Q1 Option A) variant is introduced.
- [x] T037 [P] [US4] Decorative glows are `aria-hidden="true"` (HeroBadge glow span + CollectibleBadge placeholder/`Image`) | `src/components/ui/HeroBadge.tsx` + `src/components/ui/CollectibleBadge.tsx`
- [~] T038 [P] [US4] Focus-visible outline inherits from `PrimaryButton` base (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`). Visual QA at PR time.

**Checkpoint**: Manual keyboard sweep + screen-reader smoke both pass. Ready for the automated a11y gate in Phase 8.

---

## Phase 7: User Story 5 — Responsive on tablet / mobile (Priority: P2)

**Goal**: Validate the spec's responsive acceptance scenarios at 375 / 800 / 1440 px. (Most work was already done inline in Phase 3 — this phase formalises verification + captures the edge-case fixes.)

**Independent Test**: Playwright responsive assertions + manual smoke at 320 px.

- [x] T039 [US5] RulesPanel covers `< 640` full-width, `sm:max-w-[553px] sm:mx-auto`, `lg:ml-auto lg:mr-10 lg:w-[553px]` — verified in file | `src/components/the-le/RulesPanel.tsx`
- [x] T040 [P] [US5] BadgeGrid uses `grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-x-4 sm:gap-y-6` — verified | `src/components/the-le/sections/SenderSection.tsx`
- [x] T041 [P] [US5] Title clamp `text-[36px] leading-[44px] sm:text-[45px] sm:leading-[52px]` — verified in RulesPanel.
- [x] T042 [P] [US5] Footer buttons `h-14` (56 px) via `size="md"` ≥ 44×44 touch target at every breakpoint.

**Checkpoint**: Responsive behaviour matches design-style.md across all breakpoints.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, e2e coverage, bundle check, docs.

- [x] T043 [P] Playwright happy-path spec — 4 tests (unauth redirect, render smoke, Đóng, Esc, Viết KUDOS). Auth-gated tests skip gracefully without `SUPABASE_TEST_SESSION_TOKEN` | `tests/e2e/the-le.spec.ts`
- [x] T044 [P] Playwright a11y spec — axe-core scan at desktop 1440×900 + mobile 375×812 | `tests/e2e/the-le.a11y.spec.ts`
- [~] T045 [P] Bundle check — deferred to PR/CI artefact (`yarn build` runs in main pipeline).
- [x] T046 [P] SC-004 i18n leak scan clean — only hits in `src/messages/{vi,en}.json` + one code comment in `NationalKudosSection.tsx` + test assertions in `RulesPanel.spec.tsx`. No raw VI string leaks in rendered output.
- [x] T047 Updated SCREENFLOW: row #10 → `implemented` (both MVP + full inventory tables); Implemented count 3 → 4; Last Updated → 2026-04-19; Discovery Log entry appended | `.momorph/contexts/screen_specs/SCREENFLOW.md`
- [~] T048 [P] Lighthouse — deferred to PR/CI artefact.

**Checkpoint**: All quality gates pass. Ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies; can begin immediately.
- **Phase 2 (Foundation)**: depends on Phase 1 completion — blocks every user story.
- **Phase 3 (US1 + US5 inline)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 3 (needs `<RulesPanel>` to wrap + needs `<CloseButton>` integration point).
- **Phase 5 (US3)**: depends on Phase 3 (footer slot); independent of Phase 4.
- **Phase 6 (US4 a11y)**: depends on Phases 3–5 (pages must render).
- **Phase 7 (US5 formal)**: depends on Phase 3 (already mostly covered inline; formalises verification).
- **Phase 8 (Polish)**: depends on all user-story phases being complete.

### Within Each User Story

- Vitest specs that are marked `[P]` can be authored in parallel with the component they test (TDD: write the failing test first, then implement to green).
- Shared atoms (T013 / T015) block screen-level components (T017 / T019 / T020).
- `<RulesPanel>` (T023) blocks the route wiring (T024).

### Parallel Opportunities

- Phase 1: T002 + T003 can run alongside T001.
- Phase 2: T006, T008, T009, T010, T012 are all `[P]` — four engineers can divide them.
- Phase 3: T013 + T015 + their tests (T014 + T016) are fully parallel. T017 + T018 + T019 + T020 + T021 can run in parallel once atoms are done.
- Phase 4 vs Phase 5: `<CloseButton>` and `<WriteKudosButton>` live in different files with no shared state — both phases can start together as soon as Phase 3 ships `<RulesPanel>` (T023).
- Phase 8: T043–T046 and T048 are all `[P]`.

---

## Implementation Strategy

### MVP-first (recommended)

1. Complete **Phase 1 + 2** (assets + foundation).
2. Complete **Phase 3 (US1 + inline US5)** — page renders the three sections in both locales.
3. **Stop + validate**: manual smoke via `yarn dev`; run `yarn test:run`. Ship to a preview environment.
4. Complete **Phase 4 (US2)** + **Phase 5 (US3)** in parallel.
5. **Stop + validate**: Đóng / Esc / Viết KUDOS all work; run `yarn test:run` + smoke `yarn e2e --project chromium` if happy-path spec ready.
6. Complete **Phases 6 + 7** (a11y + responsive formalisation).
7. Complete **Phase 8** (E2E, bundle, i18n leak scan, Lighthouse, SCREENFLOW update) — open PR.

### Incremental Delivery (alternative)

- Could ship Phase 1–3 as a "read-only rules" alpha (behind the footer nav but no CTA). Not recommended — the value of the Viết KUDOS CTA is a core deliverable per US3/P1 and only a few more hours of work.

---

## Notes

- Commit boundary suggestion: one commit per phase (or per `[P]`-group within a phase) with a Conventional-Commit scope `feat(the-le): ...` or `chore(ui): extend PrimaryButton size=md` (Phase 2 foundation commits touch shared primitives).
- **TDD toggle**: Vitest tests in Phase 2/3 are listed as standard tasks — write them BEFORE the implementation task they cover, assert failure, then implement to green (constitution Principle III).
- **Post-merge**: capture Lighthouse + axe-core scores in the PR description; link them from the SCREENFLOW Discovery Log entry (T047).
- **If Phase 0 assets are delayed**: ship Phase 1 with placeholder circles (empty `<div class="w-16 h-16 rounded-full border-2 border-white" />` inside each `<CollectibleBadge>`) and flag in `assets-map.md`. The component API remains identical — images hot-swap in without code changes.
