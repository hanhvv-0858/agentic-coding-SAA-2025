# Tasks: Floating Action Button (collapsed + expanded)

**Frame**: `_hphd32jN2-fab-collapsed` **+** `Sv7DFwBw1h-fab-quick-actions`
**Prerequisites**:
- [plan.md](./plan.md) (canonical)
- [spec.md (collapsed)](./spec.md) · [spec.md (expanded)](../Sv7DFwBw1h-fab-quick-actions/spec.md)
- [design-style.md (collapsed)](./design-style.md) · [design-style.md (expanded)](../Sv7DFwBw1h-fab-quick-actions/design-style.md)
**Created**: 2026-04-20

> **One component, two frames**: `<QuickActionsFab>` owns both states via
> a single `open: boolean`. Trigger + menu are mutually exclusive — they
> never render simultaneously. Tasks below bundle both specs; FR
> references pin each task to its source of truth.

---

## Task Format

```
- [x] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (US1…US5) — only on user-story phase tasks
- **|**: File path affected by this task

### User-story consolidation

The two specs enumerate 12 user stories (6 each). For task organisation
they consolidate to 5 stories that match the plan's phase structure:

| Task US | Priority | Covers | Source spec IDs |
|---------|----------|--------|-----------------|
| **US1** | P1 | Happy-path: trigger opens → tiles navigate → Cancel closes; mutual exclusion; fixed positioning | collapsed US1/US2/US3, expanded US1/US2/US3, FR-001–FR-005 + FR-009 + FR-010 on both sides |
| **US2** | P2 | Keyboard flow: Enter/Space opens & moves focus, Esc closes + restores focus, Tab focus-trap | expanded US4, collapsed FR-008 |
| **US3** | P2 | Outside-click dismissal | expanded US5 (FR-007) |
| **US4** | P2 | A11y polish: composite shadow glow, focus-visible outlines, SR labels | collapsed US4/US5, expanded FR-009/FR-010 |
| **US5** | P3 | Reduced-motion compliance | both US6 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n rename, CSS tokens, folder scaffolding. No component code yet.

- [x] T001 Rename `common.widget` → `common.fab` in the VI catalog: rename key `openMenu` → `open`, keep `writeKudo`, add new `rules` ("Thể lệ") + `close` ("Đóng") | `src/messages/vi.json`
- [x] T002 [P] Same namespace rename on the EN catalog (Q5 ✅ confirmed): `openMenu` → `open` = "Open quick actions menu", `writeKudo` = "Write KUDOS", `rules` = "Rules", `close` = "Close" | `src/messages/en.json`
- [x] T003 [P] Add three composite-shadow tokens inside the `@theme inline` block: `--shadow-fab-pill: 0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287`, `--shadow-fab-pill-hover: 0 6px 10px 0 rgba(0,0,0,0.3), 0 0 10px 0 #FAE287`, `--shadow-fab-tile: 0 8px 24px rgba(0,0,0,0.35)`. Do NOT add `--text-fab` (spec alias only, per plan §Styling) | `src/app/globals.css`
- [x] T004 Create new feature folder + test sub-folder — `shell/` groups cross-route widgets per plan §Constitution Compliance. `mkdir -p src/components/shell/__tests__` | `src/components/shell/` + `src/components/shell/__tests__/`
- [x] T004b [P] Verify the Thể lệ tile icon asset exists: `file public/images/the-le/icon_rule_saa@2x.png` should report `PNG image data, 48 x 48, 8-bit/color RGBA`. Required by Q4 ✅. No file changes; fail fast if Design hasn't delivered | `public/images/the-le/icon_rule_saa@2x.png` (verify only)

**Checkpoint**: `yarn typecheck` passes (EN + VI catalogs retype automatically via `Messages = typeof vi`). Folder exists; no component yet.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Scaffolding the new `<QuickActionsFab>` file + typed `labels` prop contract so every User Story phase can build against a stable shape.

**⚠️ CRITICAL**: No user-story work begins until Phase 2 is complete.

- [x] T005 Write a single failing Vitest placeholder asserting `<QuickActionsFab labels={...} />` mounts with trigger visible. This forces the TDD gate and verifies the test path is wired | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T006 Create the component skeleton — export `QuickActionsFab` named export and co-located `QuickActionsFabLabels` type at the top. Mark `"use client"`. Owns `const [open, setOpen] = useState(false)` + `const rootRef = useRef<HTMLDivElement>(null)`. Renders a single `<div ref={rootRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 print:hidden">` with a placeholder `<button>Trigger</button>` so T005 passes. No branching yet | `src/components/shell/QuickActionsFab.tsx`

**Checkpoint**: T005 test passes against T006 skeleton. Component mounts in isolation with a typed `labels` prop. Foundation ready.

---

## Phase 3: User Story 1 — Happy-path MVP (Priority: P1) 🎯 MVP

**Goal**: Core component lifecycle — signed-in user sees the pill, clicks it, sees the 3 tiles, picks a tile to navigate or Cancel to dismiss.

**Independent Test**: Mount `<QuickActionsFab labels={fixture} />`; assert trigger visible + menu not in DOM. Click trigger → menu visible + trigger not in DOM. Click Viết KUDOS tile → Next router `push` called with `/kudos/new` + state is closed. Click Thể lệ tile → `push('/the-le')` + closed. Click Cancel → closed + focus on re-mounted trigger.

Covers: collapsed FR-001–FR-007, FR-009, FR-010 · expanded FR-001–FR-005, FR-009.

### Trigger pill (US1)

- [x] T007 [P] [US1] Write unit tests for the `Trigger` local helper — mount with a spied `onOpen` prop. Assert: (a) renders 3 children in order (pen `<Icon>`, `<span>"/"</span>`, saa `<Icon>`); (b) click fires `onOpen`; (c) Enter fires `onOpen`; (d) Space fires `onOpen`; (e) carries `aria-haspopup="menu"`, `aria-expanded="false"`, and `aria-label={labels.open}`; (f) has `focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2` classes. Test in isolation, not through root | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T008 [US1] Implement `Trigger` as a file-local helper inside `QuickActionsFab.tsx`. Dimensions: `h-16 w-[106px] p-4 rounded-full bg-[var(--color-accent-cream)]`; layout `flex items-center gap-2`; glyphs `<Icon name="pencil" size={24} className="text-[var(--color-brand-900)]" />` + `<span className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-brand-900)]">/</span>` + `<Icon name="saa" size={24} className="text-[var(--color-brand-900)]" />`; shadow `shadow-[var(--shadow-fab-pill)]`; transitions `transition-[background-color,box-shadow] duration-150 ease-in-out motion-reduce:duration-0`. Must make T007 tests green | `src/components/shell/QuickActionsFab.tsx`

### Menu tiles (US1)

- [x] T009 [P] [US1] Write unit tests for `QuickActionTile` — render with props `{ iconNode, label, href, widthClass, onClose }` passed a spy. Assert: (a) renders `<Link>` with the exact `href`; (b) renders the supplied `iconNode` (test by passing a `<span data-testid="icon-probe" />` and asserting it's present); (c) shows the `label` text; (d) clicking the link calls `onClose` AND triggers navigation via the Link (mock `next/link`'s click behaviour with router spy); (e) has `role="menuitem"`; (f) applies cream-tile styling + `shadow-[var(--shadow-fab-tile)]`; (g) respects `widthClass` (one test with `w-[149px]`, one with `w-[214px]`) | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T010 [US1] Implement `QuickActionTile` as a file-local helper. Accept `iconNode: React.ReactNode` (so the Thể lệ tile can pass an `<Image>` and the Viết KUDOS tile an `<Icon>`). Props: `{ iconNode, label, href, widthClass, onClose }`. Common classes: `flex items-center gap-2 h-16 p-4 rounded-sm bg-[var(--color-accent-cream)] hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 shadow-[var(--shadow-fab-tile)]`. Label `<span className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-brand-900)]">`. Uses `<Link href onClick={onClose}>` so close precedes navigation | `src/components/shell/QuickActionsFab.tsx`
- [x] T011 [P] [US1] Write unit tests for `CancelButton` — render with `{ ariaLabel, onClose }`. Assert: (a) renders a `<button type="button">`; (b) contains `<Icon name="close" size={24} className="text-white" />`; (c) click fires `onClose`; (d) has `aria-label={ariaLabel}`; (e) has `role="menuitem"`; (f) applies red-circle styling + focus-visible outline | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T012 [US1] Implement `CancelButton` local helper — dimensions `w-14 h-14 p-4 rounded-full`; background `bg-[var(--color-nav-dot)]`; hover/active via `hover:brightness-95 active:brightness-90`; layout `flex items-center justify-center`; shadow `shadow-[var(--shadow-fab-tile)]`; focus-visible outline white 2px offset 2; transitions as per trigger | `src/components/shell/QuickActionsFab.tsx`
- [x] T013 [US1] Implement the `Menu` local helper composing the three tiles. Import `Image` from `next/image` at the top of the file. Container: `role="menu"` + `aria-label={labels.open}` + `flex flex-col items-end gap-5`. Children in order: (A) `<QuickActionTile iconNode={<Image src="/images/the-le/icon_rule_saa@2x.png" alt="" width={24} height={24} unoptimized />} label={labels.rules} href="/the-le" onClose={handleClose} widthClass="w-[149px]" />` (Q4 ✅), (B) `<QuickActionTile iconNode={<Icon name="pencil" size={24} />} label={labels.writeKudo} href="/kudos/new" onClose={handleClose} widthClass="w-[214px]" />`, (C) `<CancelButton ariaLabel={labels.close} onClose={handleClose} />` | `src/components/shell/QuickActionsFab.tsx`

### Root composition (US1)

- [x] T014 [US1] Wire the `QuickActionsFab` root to conditionally render `{open ? <Menu …/> : <Trigger …/>}`. Pass `onOpen={() => setOpen(true)}` to Trigger; pass `onClose={() => setOpen(false)}` to Menu. This satisfies the mutual-exclusion contract (collapsed FR-010, expanded FR-002) | `src/components/shell/QuickActionsFab.tsx`
- [x] T015 [US1] Integration test on the composed root: (a) renders trigger initially; (b) click trigger → menu renders, trigger unmounts; (c) click Viết KUDOS → `push('/kudos/new')` + menu unmounts; (d) click Thể lệ → `push('/the-le')` + menu unmounts; (e) click Cancel → menu unmounts, trigger re-mounts. Mock `next/navigation`'s `useRouter` for push spy | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`

### Consumer swap + cleanup (US1)

- [x] T016 [US1] Update Homepage to consume the new component — (a) replace `import { QuickActionsFab } from "@/components/homepage/QuickActionsFab"` with `import { QuickActionsFab } from "@/components/shell/QuickActionsFab"`; (b) replace `const widgetLabels = messages.common.widget` with `const fabLabels = messages.common.fab`; (c) collapse the two scalar props `openMenuLabel={...} writeKudoLabel={...}` to a single `labels={fabLabels}` | `src/app/page.tsx`
- [x] T017 [P] [US1] Apply the same three-line change to Awards | `src/app/awards/page.tsx`
- [x] T018 [US1] Delete the old component; grep-verify no remaining `common.widget` or `widgetLabels` references anywhere in `src/`. Run `yarn typecheck && yarn lint && yarn test:run` | `src/components/homepage/QuickActionsFab.tsx` (deleted)

### E2E (US1)

- [x] T019 [US1] Playwright E2E with 3 scenarios on an authenticated Homepage session: (a) click FAB trigger → click "Viết KUDOS" → asserts URL is `/kudos/new` AND the `[data-testid="fab-trigger"]` pill reappears; (b) same but click "Thể lệ" → URL `/the-le`; (c) click FAB → click Cancel → URL unchanged (`/`) + trigger visible + `document.activeElement` matches the trigger | `tests/e2e/fab.spec.ts`

**Checkpoint**: MVP happy path green. Homepage + Awards render the new FAB. Three tile paths work end-to-end.

---

## Phase 4: User Story 2 — Keyboard + focus (Priority: P2)

**Goal**: Full keyboard parity. Enter/Space opens and moves focus to first tile. Esc closes from any menu focus and returns focus to the re-mounted trigger. Tab wraps within the menu.

**Independent Test**: Keyboard-only Playwright walkthrough — Tab to FAB, Enter → focus lands on "Thể lệ"; Tab → "Viết KUDOS"; Tab → "Cancel"; Tab again → wraps to "Thể lệ"; Shift-Tab from Thể lệ → wraps to Cancel; Esc → menu closes + focus on trigger.

Covers: expanded FR-006 + FR-008, collapsed FR-008.

- [x] T020 [P] [US2] Write integration tests covering Esc + focus-trap + keyboard-open focus: (a) keyboard-open (Enter on trigger) → focus is on the "Thể lệ" tile; (b) mouse-open (click) → focus does NOT move (remains on `<body>` or wherever click landed); (c) Esc with focus on any tile → `open === false` + focus on trigger after re-mount; (d) Tab from Cancel wraps to Thể lệ; (e) Shift-Tab from Thể lệ wraps to Cancel. Use `userEvent.keyboard({ ... })` + `within` queries | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T021 [US2] Implement keyboard-vs-mouse focus detection — add a `keyboardOpenRef = useRef<boolean>(false)`; Trigger sets it to `true` in its Enter/Space handlers before calling `onOpen`; a `useLayoutEffect` keyed on `open` reads the ref after the `false → true` transition and focuses the first menuitem, then resets the ref | `src/components/shell/QuickActionsFab.tsx`
- [x] T022 [US2] Implement Esc close effect — inside the root, `useEffect` guarded on `open === true`: `document.addEventListener('keydown', e => e.key === 'Escape' && setOpen(false))`; cleanup removes the listener. After close, a second `useLayoutEffect` focuses the freshly re-mounted trigger via `rootRef.current.querySelector('[data-fab-trigger]')?.focus()` (add a `data-fab-trigger` marker on the Trigger button) | `src/components/shell/QuickActionsFab.tsx`
- [x] T023 [US2] Implement focus trap — inside Menu, `onKeyDown` handler: if `e.key === 'Tab'` and current target is last menuitem (Cancel) and not shift-tab, prevent default + focus first menuitem. Symmetric case for Shift-Tab from Thể lệ. Use refs to the three menuitems (array or individual) | `src/components/shell/QuickActionsFab.tsx`

**Checkpoint**: `yarn test:run` passes T020 cases. Manual keyboard walkthrough on `yarn dev` confirms focus behaviour.

---

## Phase 5: User Story 3 — Outside-click dismissal (Priority: P2)

**Goal**: Clicking anywhere outside the FAB root while menu is open closes the menu. Clicks inside the root (i.e. on tiles) do NOT trigger the outside-click path.

**Independent Test**: Integration test mounts `<QuickActionsFab>` with a sibling `<div data-testid="outside">` in the render container; open menu; `userEvent.click(screen.getByTestId('outside'))` → menu closes. Second test: click on a tile → tile navigation fires, menu closes via tile's own handler (not the outside-click path — assert through an effect-call counter if needed).

Covers: expanded FR-007.

- [x] T024 [P] [US3] Write integration test for outside-click: (a) open menu → `mousedown` event on `document.body` outside the root → `open === false`; (b) open menu → `mousedown` on a tile element inside the root → menu stays open for that mousedown (actual close happens later when the tile's own click handler fires). Use `fireEvent.mouseDown` on precise elements | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T025 [US3] Implement outside-click effect — `useEffect` guarded on `open === true`: add `document.addEventListener('mousedown', e => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false) })`. Cleanup on unmount or `open` flipping false. This listener + the Esc listener from T022 should live in the same `useEffect` for lifecycle parity | `src/components/shell/QuickActionsFab.tsx`

**Checkpoint**: Outside-click tests pass. Combined `useEffect` manages both keyboard and pointer listeners.

---

## Phase 6: User Story 4 — A11y polish & branded shadow (Priority: P2)

**Goal**: Composite `--shadow-fab-pill` glow visible on dark + light backgrounds. Axe-core zero serious/critical violations in both states. Focus-visible outlines present everywhere. SR announcements correct.

**Independent Test**: Playwright + @axe-core/playwright sweep on Homepage (trigger state) and with menu manually opened (expanded state). Screenshot diff vs `_hphd32jN2/assets/frame.png` and `Sv7DFwBw1h/assets/frame.png` within project visual threshold.

Covers: collapsed US4/US5 (FR-004 + aria attrs), expanded FR-009, FR-010.

- [x] T026 [P] [US4] Add hover shadow on the trigger — extend T008's className: `hover:shadow-[var(--shadow-fab-pill-hover)]`. Verify with a Playwright interaction test that hover triggers the stronger shadow by reading `getComputedStyle().boxShadow` | `src/components/shell/QuickActionsFab.tsx`
- [x] T027 [P] [US4] Playwright a11y test on Homepage — open `/`, assert axe-core returns zero serious/critical violations for the FAB subtree while collapsed. Then programmatically click the trigger (`await page.click('[data-fab-trigger]')`) and re-run axe on the expanded state | `tests/e2e/fab.a11y.spec.ts`
- [x] T028 [P] [US4] Unit test: trigger carries correct aria trio (`aria-haspopup="menu"`, `aria-expanded="false"`, `aria-label={labels.open}`); Menu has `role="menu"` + `aria-label={labels.open}`; each tile has `role="menuitem"`; Cancel has `aria-label={labels.close}`. This may already be partly covered by T007/T009/T011 — consolidate into one assertion suite here | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T029 [US4] Visual regression: capture screenshots of both states on Homepage via Playwright; compare against the two Figma PNGs (`assets/frame.png` in each spec folder) using the project's existing screenshot-diff threshold | `tests/e2e/fab.spec.ts` (extends T019)

**Checkpoint**: A11y + visual gates green. Both states match Figma.

---

## Phase 7: User Story 5 — Reduced motion (Priority: P3)

**Goal**: With `prefers-reduced-motion: reduce`, skip the 8px slide + 150ms duration on menu open; use opacity-only 80ms fade. Trigger hover/active state changes are instant (no transition).

**Independent Test**: Unit test mocks `window.matchMedia` to return `{ matches: true }` for the reduced-motion query; opening the menu should not apply any `translateY`-bearing transition.

Covers: collapsed US6, expanded US6.

- [x] T030 [P] [US5] Write unit test for reduced-motion — stub `window.matchMedia` via `vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))`; open menu; assert that the Menu element's inline style / className does NOT include a `translate-y`-class for the reduced-motion render path | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T031 [US5] Implement reduced-motion branch — on Menu mount, read `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches`; conditional transition classes: when reduced, Menu container uses `opacity-0 animate-in fade-in duration-75`; when normal, uses the 150ms ease-out fade + 8px `translate-y-2 data-[state=open]:translate-y-0`. Trigger already uses `motion-reduce:duration-0` Tailwind prefix — no extra work there | `src/components/shell/QuickActionsFab.tsx`

**Checkpoint**: Reduced-motion test green. Regular-motion render unaffected.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Non-blocking completeness after all user stories ship.

- [x] T032 [P] Reserve analytics event names in the `AnalyticsEvent` union — add `| { type: "fab_open" } | { type: "fab_action_click"; action: "rules" | "write_kudo" } | { type: "fab_close_cancel" }`. Do NOT emit events yet; wait for Live board integration | `src/libs/analytics/track.ts`
- [x] T033 [P] Verify `print:hidden` already applied to root (set in T006); add a Vitest assertion that inspects the root className string contains `print:hidden` | `src/components/shell/__tests__/QuickActionsFab.spec.tsx`
- [x] T034 Update SCREENFLOW — flip both FAB rows (`_hphd32jN2`, `Sv7DFwBw1h`) from 📋 spec'd to 🟢 shipped. Update the Actions & animations group table. Add a 2026-04-XX Discovery Log entry noting the bundled delivery | `.momorph/contexts/screen_specs/SCREENFLOW.md`
- [x] T035 [P] Final grep sweep to ensure the old component is fully gone — `grep -rn "components/homepage/QuickActionsFab\|common\.widget\|widgetLabels" src/` should return zero hits. If any hit remains (unexpected third consumer), migrate it in this same PR | repo-wide (verify only)
- [x] T036 Write the PR description: enumerate the 3 new CSS tokens, i18n namespace rename (`widget` → `fab`), folder move (`homepage/QuickActionsFab.tsx` → `shell/QuickActionsFab.tsx`), zero API/DB changes, and link to Q1–Q7 decisions made during plan review | PR description (GitHub only — no file)

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)** — start immediately; T001/T002/T003/T004 all independent and parallelisable.
- **Phase 2 (Foundation)** — depends on Phase 1; gates every user story.
- **Phase 3 (US1 MVP)** — depends on Phase 2; internal task order is roughly (Trigger tests/impl) → (Tile tests/impl) → (Cancel tests/impl) → (Menu compose) → (root wire) → (consumer swap) → (delete old file) → (E2E).
- **Phase 4 (US2 Keyboard)** — depends on Phase 3 T014 (root wired). Can run in parallel with Phase 5, 6, 7 once T014 lands.
- **Phase 5 (US3 Outside-click)** — depends on Phase 3 T014.
- **Phase 6 (US4 A11y)** — depends on Phase 3 T014; T026 can start after T008; T027 after T019.
- **Phase 7 (US5 Reduced motion)** — depends on Phase 3 T014 (specifically T013 for Menu).
- **Phase 8 (Polish)** — depends on all user story phases for T032 and T034; T033 can run right after Phase 2.

### Within each user story

- Tests first (TDD gate — constitution §III). Each `[P]` test task can start before the matching implementation task.
- Helpers first, Root wire last (Phase 3: Trigger → Tile → Cancel → Menu → Root).
- Consumer updates (T016/T017) only after the new component's exported API is stable (post-T014).
- Delete the old file (T018) only after consumers import from the new path.

### Parallel opportunities

- **Phase 1**: T002/T003/T004 all `[P]` — three terminal tabs can run them concurrently.
- **Phase 3**: T007 + T009 + T011 are all test files editing the same `.spec.tsx` — treat them as sequential edits inside one task sitting, even though they are logically `[P]`. T017 (Awards) parallel with T016 (Homepage) once T014 lands.
- **Phase 4–7**: once Phase 3 T014 lands, all four phases can proceed in parallel by different engineers if staffing allows.
- **Phase 8**: T032 + T033 + T035 all `[P]`.

---

## Implementation Strategy

### MVP First (Recommended)

1. Ship Phase 1 + 2 (setup + skeleton).
2. Ship Phase 3 (US1 happy path — MVP).
3. **STOP + validate**: users can open menu, navigate, cancel. That's the deliverable floor.
4. PR-merge to main if stakeholder wants to de-risk — FAB visibly improved, keyboard/a11y polish follows.

### Incremental Delivery (preferred for this sprint)

1. Setup + Foundation + MVP (Phases 1–3) in one commit block → preview deploy.
2. Keyboard (Phase 4) + Outside-click (Phase 5) in one commit block → preview deploy.
3. A11y polish (Phase 6) + Reduced motion (Phase 7) + Polish (Phase 8) in one commit block → merge to main.

Single PR covering all three blocks is also acceptable; separate commits keep the diff readable.

### Definition of Done

- [ ] All 36 tasks checked.
- [ ] `yarn typecheck` + `yarn lint` + `yarn test:run` all clean.
- [ ] Playwright E2E (`tests/e2e/fab.spec.ts`) + a11y (`tests/e2e/fab.a11y.spec.ts`) green.
- [ ] Manual keyboard walkthrough recorded in PR description.
- [ ] Visual screenshots attached showing both states match Figma.
- [ ] SCREENFLOW flipped to 🟢 shipped for both rows.

---

## Notes

- Tasks T007, T009, T011, T015, T020, T024, T028, T030, T033 all edit the **same file** (`__tests__/QuickActionsFab.spec.tsx`). They are logically `[P]` but must be applied sequentially to avoid merge conflicts. If a single engineer owns Phase 3–7, expect this file to grow to ~300 lines.
- Tasks T008, T010, T012, T013, T014, T021, T022, T023, T025, T026, T031 all edit `src/components/shell/QuickActionsFab.tsx`. Same caveat — sequential edits inside one file.
- Consumer updates (T016, T017) are the only cross-file tasks besides scaffolding and polish. They can run in parallel.
- Q5 (EN strings) resolved 2026-04-20 — T002 uses the confirmed
  strings. Remaining open items (Q3 transition, Q4 Thể lệ icon, Q6
  modal z-index, Q7 `/kudos/new` route) are non-blocking and can slip
  into the tasks sprint.
