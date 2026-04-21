# Tasks: Dropdown-ngôn ngữ (Language dropdown)

**Frame**: `hUyaaugye2-dropdown-ngon-ngu`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [design-style.md](design-style.md)
**Scope**: 1 PR · 3 modified files · 2 new test files · 15 new test scenarios · zero new deps · zero new design tokens

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Task can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User-story label (US1, US2, US3, US4) — required for user-story phase tasks only
- **|**: File path affected by the task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prep assets and shared registry entries before touching behaviour.

- [x] T001 Hand-author a 24 × 24 Union Jack SVG (white/blue/red bands, three overlapping crosses per standard British flag; pixel-align strokes so it renders cleanly at the one size used in this feature). No file written yet — output is the SVG source ready to inline in T002. Per plan §Phase 0, hand-authoring is preferred; fall back to `mcp__momorph__get_design_item_image` on Figma node `I525:11713;362:6128;186:1903;186:1709` only if visual regression reports differ.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Infrastructure required by every user story — must land before any US* work.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [x] T002 [P] Add `"flag-gb"` to the `IconName` union and inline the Union Jack SVG (from T001) as a new `case "flag-gb":` in the `switch(name)` block | src/components/ui/Icon.tsx
- [x] T003 [P] Wire two edits into the header trigger: (a) replace line 72 `<Icon name={locale === "vi" ? "flag-vn" : "globe"} />` with `<Icon name={locale === "vi" ? "flag-vn" : "flag-gb"} />` (FR-009 · consumer of T002); (b) flip the outside-click listener on line 36 + cleanup on line 37 from `document.addEventListener` / `document.removeEventListener` to `window.addEventListener` / `window.removeEventListener` (TR-004 · iOS Safari tap-delegation fix). Explicitly PRESERVE the FR-006 no-op guard on line 52 (`if (next === locale) return;`) and the `useTransition` wrapping | src/components/layout/LanguageToggle.tsx

**Checkpoint**: Foundation ready. Running `yarn tsc --noEmit && yarn lint` must stay green. Existing tests must stay green (no behaviour regression expected from T002 + T003).

---

## Phase 3: User Story 1 — Switch interface language (Priority: P1) 🎯 MVP

**Goal**: A Sunner can open the dropdown, see the two-option menu with the new dark-navy visual treatment, pick the opposite locale, and watch the whole page re-render in the new language (cookie persisted).

**Independent Test**: Open `/login` or any authenticated screen (`/`, `/kudos`, `/awards`), click the header language pill, confirm the panel matches Figma (`assets/frame.png`), click the non-active row, confirm (a) the menu closes, (b) the page re-renders in the new language, (c) the `NEXT_LOCALE` cookie updates, (d) a hard refresh keeps the new locale.

### Tests (US1) — write first, TDD

- [x] T004 [US1] Create new test file with 4 scenarios covering visual + selection contract: (1) renders two rows with visible labels `"VN"` / `"EN"` (FR-003); (2) each row exposes its full language name via `aria-label` and the visible text is `aria-hidden="true"` (FR-010); (3) the row matching `currentLocale` has `aria-checked="true"` and carries the cream @ 20 % selected-state class (FR-004); (4) clicking the non-active row fires `onSelect(locale)` with the correct locale (FR-005 delegation) | src/components/login/__tests__/LanguageDropdown.spec.tsx
- [x] T005 [P] [US1] Create integration test file with 2 scenarios covering the caller wiring: (1) clicking the header trigger opens the menu — assert `screen.getByRole("menu")` is in the document (US1 AC2); (2) selecting a DIFFERENT locale calls `setLocale("en")` exactly once AND emits exactly one analytics event with payload `{ type: "language_change", from: "vi", to: "en" }` (FR-005). Use `vi.mock("@/libs/i18n/setLocale", () => ({ setLocale: vi.fn() }))` + `vi.mock("@/libs/analytics/track", () => ({ track: vi.fn() }))` + `vi.clearAllMocks()` in `beforeEach` (matches `FilterDropdown.spec.tsx` pattern) | src/components/layout/__tests__/LanguageToggle.integration.spec.tsx

### Implementation (US1)

- [x] T006 [US1] Full visual refactor. (a) `<ul>` panel classes → `absolute right-0 top-full mt-2 w-fit z-30 p-1.5 bg-[var(--color-panel-surface)] border border-[var(--color-border-secondary)] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col`. (b) Internal `ITEMS` array: drop the `label` values `"Tiếng Việt"` / `"English"`; introduce `code` (`"VN"` / `"EN"`) for visible text and `fullName` (`"Tiếng Việt"` / `"English"`) for `aria-label`. (c) Items array entries: `{ locale: "vi", icon: "flag-vn", code: "VN", fullName: "Tiếng Việt" }` and `{ locale: "en", icon: "flag-gb", code: "EN", fullName: "English" }`. (d) Row `<button>` classes → `w-full h-14 inline-flex items-center justify-between gap-1 p-4 rounded text-white text-base leading-6 font-bold tracking-[0.15px] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer` + conditional `bg-[var(--color-accent-cream)]/20` when selected, `hover:bg-[var(--color-accent-cream)]/10` when not selected. (e) Wrap visible `code` text in `<span aria-hidden="true">`. (f) Preserve the prop surface `{ id, currentLocale, onSelect, onClose }` unchanged. Tests from T004 should all go green | src/components/login/LanguageDropdown.tsx

**Checkpoint US1**: The 6 tests from T004 + T005 are green. Manual visual comparison against `assets/frame.png` on `/login` passes. Selecting a non-active locale flips the UI language on hard refresh.

---

## Phase 4: User Story 2 — Dismiss without changing language (Priority: P1)

**Goal**: Every dismiss path (select-active-locale, outside click, Esc, re-click trigger, Tab-out via US3) closes the menu with zero side effects (no Server Action, no analytics, no cookie write).

**Independent Test**: Open the dropdown, perform each dismiss action in turn, confirm the menu closes and that spy-wrapped `setLocale` + `track` counters stay at zero. The outside-click scope test also verifies the `window` listener swap from T003 still respects the `LanguageToggle` wrapper boundary.

### Tests (US2)

- [x] T007 [US2] Append 2 scenarios to the existing file from T004: (5) clicking the ACTIVE row still fires `onSelect(activeLocale)` at the overlay boundary — the FR-006 no-op guard lives one layer up in `LanguageToggle.handleSelect`, so the user-visible "no cookie / no analytics" behaviour is asserted at integration level (T008 scenario 3), not here; (6) pressing Esc from inside the `<ul>` calls `onClose` (FR-002(c)) | src/components/login/__tests__/LanguageDropdown.spec.tsx
- [x] T008 [US2] Append 2 scenarios to the integration file from T005: (3) selecting the SAME locale as `currentLocale` fires ZERO `setLocale` calls AND ZERO analytics events (FR-006 / SC-003 — this is the regression gate for accidentally removing the line-52 guard during refactor); (4) pressing Esc with the menu open closes it AND produces zero `setLocale` calls + zero analytics events | src/components/layout/__tests__/LanguageToggle.integration.spec.tsx

### Implementation (US2)

US2 is "test-only" — every dismiss path is already implemented. T003's outside-click listener flip (Phase 2) covers FR-002(b) with TR-004's improvement; Esc (FR-002(c)) is already in the prototype's `handleKey`; re-click trigger (FR-002 toggle close) is already handled by `LanguageToggle.toggle`; and FR-006's no-op guard is already on line 52 of `LanguageToggle.tsx`. The T003 note "explicitly PRESERVE the FR-006 no-op guard" is the regression control.

**Checkpoint US2**: The 10 tests now green (4 unit from T004 + 2 unit from T007 + 2 integration from T005 + 2 integration from T008). Dismiss without-select is silent on the network + analytics side.

---

## Phase 5: User Story 3 — Keyboard-only navigation (Priority: P2)

**Goal**: A keyboard-only user can open the menu, arrow between rows (with wrap), activate via Enter / Space, dismiss via Esc, and Tab-out cleanly closes the menu (this is the net-new behavioural fix versus the current prototype).

**Independent Test**: Tab to the trigger. Press `Enter` — menu opens, focus lands on the active-locale row. Press `↓` — focus moves to next row; press `↑` from the first row — focus wraps to last. Press `Enter` on the non-active row — locale switches, menu closes. Re-open; press `Tab` — focus moves to the next focusable element on the page AND the menu closes.

### Implementation (US3)

- [x] T009 [US3] Close the Tab-out behavioural gap in `handleKey`. When `e.key === "Tab"`, do NOT call `e.preventDefault()` (we want native focus movement to proceed) but schedule the close via `queueMicrotask(() => onClose())` so it fires AFTER the browser has moved focus to the next tab target (FR-002(d), US3 AC4). Preserve the existing `ArrowUp` / `ArrowDown` / `Escape` branches and the mount-focus effect; only add the Tab branch | src/components/login/LanguageDropdown.tsx

### Tests (US3)

- [x] T010 [US3] Append 4 scenarios to the file from T004 + T007: (7) ArrowDown from the first row moves focus to the second row AND ArrowUp from the first row wraps focus to the last row (FR-007); (8) on mount, keyboard focus lands on the active-locale row; if the provided `currentLocale` is not in `SUPPORTED_LOCALES` (defensive fallback) focus the first row instead (FR-008); (9) pressing Tab while focus is on the SECOND row calls `onClose` in the next microtask; (10) pressing Tab while focus is on the FIRST row also calls `onClose` (keep the model simple — any Tab from inside the menu closes) | src/components/login/__tests__/LanguageDropdown.spec.tsx
- [x] T011 [US3] Append 1 scenario to the integration file (T005 + T008): (5) opening the menu and calling `userEvent.tab()` results in the menu no longer being in the document AND zero `setLocale` / zero analytics calls fire (US3 AC4 end-to-end) | src/components/layout/__tests__/LanguageToggle.integration.spec.tsx

**Checkpoint US3**: 15 total test scenarios now green (10 unit from T004 + T007 + T010, 5 integration from T005 + T008 + T011). Keyboard-only parity end-to-end verified.

---

## Phase 6: User Story 4 — Prototype ↔ Figma reconciliation (Priority: P2)

**Goal**: Demonstrate that the refactor preserves the `LanguageDropdown` prop surface (`{ id, currentLocale, onSelect, onClose }`) — no breaking change for any caller.

**Independent Test**: `git diff src/components/login/LanguageDropdown.tsx` shows the `LanguageDropdownProps` type declaration is unchanged byte-for-byte. The sole importer (`LanguageToggle.tsx`) keeps the exact same call site.

### Implementation (US4)

- [x] T012 [US4] In the PR description, include a 1-line diff snippet or callout confirming the `type LanguageDropdownProps = { id: string; currentLocale: Locale; onSelect: (next: Locale) => void; onClose: () => void; }` declaration is byte-identical before vs after (US4 AC1). No code change — this is an artefact of the PR-description review gate | (PR description, not a file)

**Checkpoint US4**: Prop-surface evidence in PR description. T005 + T008 + T011 integration tests would have failed at runtime if any prop were renamed or retyped; T012 formalises the human review.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Motion preferences, a11y sweep, SCREENFLOW bookkeeping.

- [x] T013 Add `motion-safe:transition-opacity motion-safe:duration-150` (and matching `motion-safe:transition-transform` + `motion-safe:duration-150` for the 4 px `translateY` entry) to the `<ul>` panel. Under `prefers-reduced-motion: reduce`, the panel shows/hides instantly (design-style §Animation · T401 per plan). Match the shape of the trigger chevron on `LanguageToggle.tsx` line 79 | src/components/login/LanguageDropdown.tsx
- [ ] T014 [P] Run axe-core against `/login` and `/` with the language dropdown open. Capture the report. Zero violations required (SC-004 · T402 per plan). If any violation appears, fix in place before shipping — the 2-item menu is narrow enough that zero violations should be achievable | (axe report, no file)
- [ ] T015 [P] After PR merge: flip row #8 in `.momorph/contexts/screen_specs/SCREENFLOW.md` from `📋 spec'd (prototype)` to `🟢 shipped`; append a discovery-log entry dated the merge date summarising the 3 modified files + 2 new test files + 15 test scenarios + the Tab-close behavioural fix | .momorph/contexts/screen_specs/SCREENFLOW.md

**Final gate**: Zero axe-core violations on both entry screens. All existing tests + 15 new tests green. `yarn tsc --noEmit && yarn lint` clean. Manual visual check at `/login` matches `assets/frame.png`.

---

## Dependency Graph

```
T001 (SVG prep)
  │
  ▼
T002 (Icon registry) ─────────────────────────┐
  │                                            │
  ▼                                            │
T003 (LanguageToggle edits) ──────────────────┤
  │                                            │
  ▼                                            │
┌─ Phase 3: US1 ──────────────────────────────┤
│ T004 (unit test file, 4 scenarios) ─┐       │
│ T005 (integration test file, 2 scn)  │      │ ┐
│              │                       │      │ │
│              ▼                       │      │ │
│ T006 (visual refactor) ◄─────────────┘      │ │  Phases run
└──────────────────────────────────────────────┤ │  in strict
┌─ Phase 4: US2 ──────────────────────────────┤ │  sequence —
│ T007 (+2 unit scenarios) [P w/ T008]         │ │  each phase
│ T008 (+2 integration scenarios) [P w/ T007]  │ │  is a complete
└──────────────────────────────────────────────┤ │  testable
┌─ Phase 5: US3 ──────────────────────────────┤ │  increment
│ T009 (Tab-close implementation) ─┐           │ │
│                                   ▼          │ │
│ T010 (+4 unit scenarios) [P w/ T011]         │ │
│ T011 (+1 integration scenario) [P w/ T010]   │ │
└──────────────────────────────────────────────┤ │
┌─ Phase 6: US4 ──────────────────────────────┤ │
│ T012 (PR description diff)                   │ │
└──────────────────────────────────────────────┤ │
┌─ Phase 7: Polish ───────────────────────────┤ │
│ T013 (motion-safe)                           │ │
│ T014 (axe-core) [P w/ T013, T015]            │ │
│ T015 (SCREENFLOW bookkeeping) [P w/ T014]    │ ┘
└──────────────────────────────────────────────┘
```

## Parallel Execution Opportunities

Within a single developer / single PR, the parallelism matters less than the cross-file isolation. The following pairs can be authored in parallel without stepping on each other:

| Pair | Files | Why parallel is safe |
|------|-------|----------------------|
| T002 ‖ T003 | `Icon.tsx` + `LanguageToggle.tsx` | Different files, no cross-dependency |
| T004 ‖ T005 | Two new test files | Different files; T005 is the integration harness, T004 is the unit harness |
| T007 ‖ T008 | Two existing test files | Both append-only, no file overlap |
| T010 ‖ T011 | Two existing test files (after T009 lands) | Same pattern as T007 / T008 |
| T014 ‖ T015 | Axe report + SCREENFLOW edit | Completely unrelated files |

**Critical serial edges** (cannot be parallelised):
- T001 → T002 (SVG source must exist before it's inlined)
- T002 → T003 (the icon name must exist in the registry before the consumer references it)
- T004 → T006 (TDD: red before green)
- T009 → T010 (tests assert the behaviour being implemented in T009)

---

## MVP Scope

**Suggested MVP = Phase 1 + Phase 2 + Phase 3 (US1)**.

Delivering only US1 would:
- ✅ Ship a visually correct language dropdown matching Figma
- ✅ Ship the Union Jack icon for English
- ✅ Ship the outside-click bug fix (T003's `window` listener flip)
- ✅ Preserve the existing FR-006 no-op guard (already in production code)
- ⚠️ Leave the Tab-close gap open (US3 AC4 would fail) — but the current prototype already has this gap, so it's a pre-existing issue, not a regression
- ⚠️ Skip the integration-level regression gate for the FR-006 guard (T008 scenario 3) — accept this risk only if the PR can be hand-audited

Because the plan-level risk assessment flagged "accidentally removing the FR-006 guard" as **High impact**, the pragmatic recommendation is to **NOT ship US1 alone**. Ship Phase 3 + Phase 4 together as a single PR; that's still well under a day of work.

If the PR is being split for review ergonomics, a reasonable split is:
- **PR 1**: Phases 1–4 (US1 + US2 = locale switching, dismiss paths, FR-006 regression gate)
- **PR 2**: Phases 5–7 (US3 keyboard fix + US4 evidence + polish)

Single-PR delivery remains preferred given the tight file overlap (all changes live in 3 files).

---

## User-Story Independence Matrix

| Story | Depends on (hard) | Depends on (soft) | Independently testable? |
|-------|-------------------|-------------------|--------------------------|
| **US1** — Switch language | Phase 1 + Phase 2 (foundation) | — | ✅ Yes — visual + basic selection works end-to-end after Phase 3 |
| **US2** — Dismiss without change | Phase 2 (T003 outside-click flip) | US1 (tests assume the refactored markup) | ✅ Yes — but shipping US2's tests before US1's visual refactor would be meaningless (nothing visual changed). In practice US2 completes together with US1. |
| **US3** — Keyboard-only | Phase 2 + T009 (net-new Tab-close code) | US1 + US2 (same DOM structure) | ✅ Yes — Tab-out assertion depends ONLY on T009 + the test file setup from T004 |
| **US4** — Prototype reconciliation | Phase 3 done (T006 has landed the refactor) | — | ✅ Yes — a git diff confirms the prop surface, regardless of what behavioural changes are inside |

---

## Independent Test Criteria (per story, summarised)

| Story | How to verify in isolation |
|-------|----------------------------|
| **US1** | Visual match to `assets/frame.png`; click "EN" on a `vi` session → page re-renders in English; `NEXT_LOCALE` cookie = `en`; hard refresh keeps English |
| **US2** | Open → Esc → menu closes with zero `setLocale` / `track` calls; open → click outside → closes; open → click active row → closes with zero cookie / analytics |
| **US3** | Tab to trigger → Enter → focus lands on active row; ↓/↑ cycle with wrap; Enter on non-active → switches locale + closes; Tab from any row → menu closes AND focus moves forward |
| **US4** | `git diff src/components/login/LanguageDropdown.tsx` shows the exported `LanguageDropdownProps` type unchanged |

---

## Summary

- **Total tasks**: 15 (T001 – T015)
- **Setup**: 1 task (T001)
- **Foundation**: 2 tasks (T002, T003 — parallelisable)
- **US1 (P1, MVP)**: 3 tasks (T004, T005, T006)
- **US2 (P1)**: 2 tasks (T007, T008 — parallelisable)
- **US3 (P2)**: 3 tasks (T009, T010, T011 — T010 and T011 parallelisable after T009)
- **US4 (P2)**: 1 task (T012 — documentation only)
- **Polish**: 3 tasks (T013, T014, T015 — T014 and T015 parallelisable)
- **Net test scenarios added**: 15 (10 unit + 5 integration)
- **Files touched**: 3 modified + 2 new + 1 bookkeeping (SCREENFLOW) = 6 total
- **Parallelisable pairs identified**: 5 — see "Parallel Execution Opportunities" above
