# Implementation Plan: Floating Action Button (collapsed + expanded)

**Frame**: `_hphd32jN2-fab-collapsed` **+** `Sv7DFwBw1h-fab-quick-actions`
**Date**: 2026-04-20
**Specs**:
- [`_hphd32jN2-fab-collapsed/spec.md`](./spec.md) — trigger pill
- [`Sv7DFwBw1h-fab-quick-actions/spec.md`](../Sv7DFwBw1h-fab-quick-actions/spec.md) — expanded menu

> This single plan covers both frames because they describe two phases
> of the same component (`<QuickActionsFab>`). Tasks + implementation
> run as one bundled sprint. A pointer copy exists at
> [`../Sv7DFwBw1h-fab-quick-actions/plan.md`](../Sv7DFwBw1h-fab-quick-actions/plan.md).

---

## Summary

Rebuild the authenticated-shell Floating Action Button so that it
matches the two Figma frames as a single React component:

- **Collapsed** (`_hphd32jN2`): 106×64 cream pill with pen + "/" + saa
  glyphs, fixed bottom-right, composite drop + cream-glow shadow.
- **Expanded** (`Sv7DFwBw1h`): 3-tile vertical stack (Thể lệ shortcut,
  Viết KUDOS primary action, red-circle Cancel). Cancel takes the same
  bottom-right slot the pill occupied.

States are **mutually exclusive** (collapsed spec FR-010 + expanded
FR-002) — trigger unmounts when menu opens, menu unmounts when trigger
is visible. No visual coexistence. Zero APIs; zero DB work.

**Technical approach**: one `"use client"` component relocated from
`src/components/homepage/` to a new `src/components/shell/` folder;
pure local state (`useState<boolean>(false)`); Next.js `<Link>` for
tile navigation; reuses existing `<Icon>` primitive and design tokens;
three new CSS-variable tokens for typography + shadow composites;
four new i18n keys under `common.fab.*`.

---

## Technical Context

| Area | Choice |
|------|--------|
| **Language / Framework** | TypeScript (strict) · Next.js 16 App Router |
| **UI Library** | React 19 (`"use client"` island) |
| **Styling** | TailwindCSS v4 with `@theme inline` tokens in [src/app/globals.css](../../../src/app/globals.css); arbitrary-value shadow utilities (`shadow-[var(--shadow-fab-pill)]` etc.) for composites |
| **State Management** | Local `useState<boolean>` — no global store, no context |
| **Data Fetching** | N/A — pure UI |
| **Testing** | Vitest + `@testing-library/react` + `happy-dom` for unit/integration; `@axe-core/playwright` + Playwright for E2E + a11y |
| **i18n** | `getMessages()` helper + `src/messages/{vi,en}.json`; new `common.fab.*` namespace |
| **Icons** | Existing `<Icon>` primitive (`pencil`, `saa`, `close` already present) |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin.*

| Constitution rule | Coverage | Status |
|-------------------|----------|--------|
| §I — TypeScript strict + `PascalCase.tsx` + `@/*` alias | Component named `QuickActionsFab`, sub-pieces co-located; all imports via `@/` | ✅ |
| §I — Folder structure (`components/[feature]/` or `components/ui/`) | New `src/components/shell/` folder for cross-route widgets — feature-scoped per §I (no new top-level tier) | ✅ |
| §I — No dead code | Delete `src/components/homepage/QuickActionsFab.tsx` + remove `QuickActionsFabProps` type after re-import | ✅ |
| §II — Responsive + touch targets ≥ 44×44 | Collapsed pill 106×64, tiles 149/214×64, Cancel 56×56 — all pass. Mobile offset 16px vs desktop 24px | ✅ |
| §II — WCAG 2.2 AA · axe-core gate | SC-002 (both specs) mandates zero serious/critical violations; covered in Phase 5 | ✅ (planned) |
| §II — No native-platform patterns | No iOS swipe-back, no Material ripple; `focus-visible` + explicit Cancel are web-native patterns | ✅ |
| §III — TDD (tests alongside code) | Phase 2 writes unit tests; Phase 3+4 integration; Phase 5 E2E + a11y | ✅ (planned) |
| §IV — No secrets / no `dangerouslySetInnerHTML` | Component has no server data; all text goes through i18n | ✅ |
| §V — Server Components by default, `"use client"` only when needed | Component needs `useState` + pointer listeners → `"use client"` is justified | ✅ |
| §V — Next/Link for internal navigation | Tile A + B both use `<Link href=…>` with `onClick` close handler | ✅ |
| §V — Tailwind utilities only; tokens via `@theme inline` | 3 new tokens added to `globals.css`; no `@apply`, no CSS Modules | ✅ |
| §V — Cloudflare Workers runtime safe | No Node APIs; no heavy deps; bundle-size impact = ~2 KB gzipped (one client component + tokens) | ✅ |

**Violations**: none.

---

## Architecture Decisions

### Component shape

Single component `src/components/shell/QuickActionsFab.tsx` marked
`"use client"`. Two rendering branches determined by one state flag:

```tsx
const [open, setOpen] = useState(false);
return (
  <div ref={rootRef} className="fixed bottom-6 right-6 z-50 print:hidden ...">
    {open ? <Menu onClose={() => setOpen(false)} /> : <Trigger onOpen={() => setOpen(true)} />}
  </div>
);
```

- `<Trigger>` — the pill. Calls `onOpen` on click / Enter / Space.
  Carries `aria-haspopup="menu"`, `aria-expanded="false"`, i18n
  `aria-label`.
- `<Menu>` — the 3-tile stack. `role="menu"`; each tile has
  `role="menuitem"`. Focus trap (FR-008 expanded), Esc + outside-click
  listeners, close-then-navigate handlers for A + B.

**Why not two sibling components** (e.g., `<Trigger>` + `<Menu>`
rendered simultaneously with CSS toggle): because the state model is
mutually exclusive and because the two have different semantics for
screen readers. Rendering both + hiding one via `display: none` wastes
accessibility-tree size and risks stale focus targets.

**Sub-component split** (inside the same file, not separate modules —
constitution §I: "duplicate is acceptable until three or more usages"):

```
QuickActionsFab.tsx
├── QuickActionsFab   (default export — root with state + ref)
├── Trigger           (the cream pill; local helper)
├── Menu              (the 3-tile stack; local helper)
├── QuickActionTile   (A + B render through this; takes icon + label + href)
└── CancelButton      (C; inline <button> with aria-label)
```

Keep them in **one file** until we add a third FAB variant or a
second consumer.

### State management

- `open: boolean` — local `useState`. Initialiser: `false` so SSR
  markup always ships the trigger (FR-009 expanded, FR-009 collapsed).
- Toggle semantics:
  - `<Trigger>` is a **one-way opener** (collapsed FR-006).
  - Menu close lives inside `<Menu>`: Cancel / Esc / outside-click /
    tile-click (expanded FR-005–FR-007).
- Focus behaviour (one shared effect, runs on `open` transition):
  - On `false → true` **via keyboard** (detect via `event.detail === 0`
    or track a `keyboardOpen` ref): move focus to first tile.
  - On `false → true` **via mouse/touch**: do not touch focus.
  - On `true → false`: request a microtask to focus the freshly
    re-mounted trigger. Use `ref.current?.focus()` in a
    `useLayoutEffect` guarded by the transition.
- No global state. No context. The component is single-instance per
  route.

### Styling

- **New tokens** (add exactly these three lines to
  [src/app/globals.css](../../../src/app/globals.css) inside the
  `@theme inline` block):
  ```css
  --shadow-fab-pill: 0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287;
  --shadow-fab-pill-hover: 0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 0 10px 0 #FAE287;
  --shadow-fab-tile: 0 8px 24px rgba(0, 0, 0, 0.35);
  ```
- **Typography — no CSS var for `--text-fab`.** Spec docs mention it
  as a **documentation alias** only (a name for "Montserrat 700
  24/32" shared across trigger + tiles). Call sites use the four
  inline utilities directly:
  `font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold`.
  Do not add `--text-fab` to globals.css — Tailwind v4 `@theme inline`
  can't express a compound font shorthand, and single-letter "/"
  separator + 10-char tile labels don't justify a new CSS var just to
  save four Tailwind utilities.
- Composite shadows use `shadow-[var(--shadow-fab-pill)]` /
  `shadow-[var(--shadow-fab-tile)]` arbitrary-value utilities. No
  `@apply`.
- Reduced-motion: a single `motion-reduce:` prefix on the transition
  utility (`transition-[background-color,box-shadow] duration-150
  motion-reduce:duration-0`) covers FR-006 on the trigger. For menu
  open/close, conditional logic inside the effect: skip the 8px
  `translateY` if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

### Integration points

- **Homepage** [src/app/page.tsx](../../../src/app/page.tsx) — currently
  imports + mounts `<QuickActionsFab>` with `openMenuLabel` + `writeKudoLabel`
  props sourced from `messages.common.widget`. Update import path
  (`@/components/homepage/QuickActionsFab` → `@/components/shell/QuickActionsFab`)
  and consolidate the two scalar props into a single typed `labels`
  object — same pattern already used by `<ProfileMenu labels={...} />`
  at [src/components/layout/ProfileMenu.tsx](../../../src/components/layout/ProfileMenu.tsx).
- **Awards** [src/app/awards/page.tsx](../../../src/app/awards/page.tsx) — same
  three-line change.
- **Future (Live board / other auth routes)**: follow the same pattern
  — page reads `messages.common.fab` and passes as `labels` prop.

**i18n consumer pattern** (matches `ProfileMenu`):

```tsx
// In a Server Component page (e.g. src/app/page.tsx):
const { messages } = await getMessages();
const fabLabels = messages.common.fab;
// …
<QuickActionsFab labels={fabLabels} />
```

**No** `QuickActionsFabHost` Server Component wrapper. The existing
convention is "page reads messages, passes labels to the client
island" — keep that. Introducing a Host wrapper would diverge from
`ProfileMenu`, `LanguageToggle`, `NotificationBell`, etc., which all
take labels as explicit props from their Server Component parent.

### Routing / navigation

- Thể lệ tile → `<Link href="/the-le">` (route shipped).
- Viết KUDOS tile → `<Link href="/kudos/new">` (placeholder route
  today; becomes real with the Viết Kudo spec — unchanged from current
  prototype).
- Cancel → no navigation; just `setOpen(false)` + focus restore.

---

## Project Structure

### Documentation (both features)

```text
.momorph/specs/_hphd32jN2-fab-collapsed/
├── spec.md              # Collapsed / trigger spec
├── design-style.md      # Trigger tokens + states
├── plan.md              # THIS FILE — canonical
├── tasks.md             # Next step — bundled tasks for both frames
└── assets/frame.png     # Trigger screenshot

.momorph/specs/Sv7DFwBw1h-fab-quick-actions/
├── spec.md              # Expanded menu spec
├── design-style.md      # Menu tokens + states
├── plan.md              # Short pointer → this file
├── tasks.md             # Short pointer → bundled tasks (see below)
└── assets/frame.png     # Menu screenshot
```

### Source code — new files

| File | Purpose |
|------|---------|
| `src/components/shell/QuickActionsFab.tsx` | Client island. Owns `open: boolean`; renders `<Trigger>` or `<Menu>` (both as local helpers inside the file). Takes a single `labels: { open, rules, writeKudo, close }` prop — mirrors `ProfileMenu` API shape. |

### Public assets (already added by Design)

| Asset | Purpose |
|-------|---------|
| `public/images/the-le/icon_rule_saa@2x.png` | 48×48 PNG glyph for the Thể lệ tile inside the expanded FAB menu. Displayed at 24×24 via `next/image` + `unoptimized`. Q4 ✅ 2026-04-20. |

No new hooks, no new types files, no wrapper component.
`QuickActionsFabLabels` type is co-located at the top of
`QuickActionsFab.tsx`.

### Source code — modified files

| File | Change | Why |
|------|--------|-----|
| `src/app/globals.css` | Add 3 tokens: `--shadow-fab-pill`, `--shadow-fab-pill-hover`, `--shadow-fab-tile` inside the `@theme inline` block | Composite shadow reuse; documented in both design-style docs |
| `src/messages/vi.json` | **Rename** `common.widget.*` → `common.fab.*`. Specifically: rename key `openMenu` → `open`, keep `writeKudo`, add new keys `rules` ("Thể lệ") and `close` ("Đóng"). | Consolidates the FAB's two existing VI strings with the two new ones into one namespace owned by this component |
| `src/messages/en.json` | Same namespace rename + confirmed EN strings (Q5 resolved): `open`="Open quick actions menu", `rules`="Rules", `writeKudo`="Write KUDOS", `close`="Close". | EN parity |
| `src/app/page.tsx` | (a) Replace `import { QuickActionsFab } from "@/components/homepage/QuickActionsFab"` → `import { QuickActionsFab } from "@/components/shell/QuickActionsFab"`. (b) Replace `const widgetLabels = messages.common.widget` → `const fabLabels = messages.common.fab`. (c) Collapse the two scalar props into `<QuickActionsFab labels={fabLabels} />`. | Route consumer update |
| `src/app/awards/page.tsx` | Same three changes as Homepage | Route consumer update |

> **`Messages` type** — auto-inferred via `export type Messages = typeof vi`
> in [src/libs/i18n/getMessages.ts](../../../src/libs/i18n/getMessages.ts).
> No separate types file to regenerate; editing the JSON + running
> `tsc --noEmit` catches any missing keys on the EN side.

### Source code — deleted

| File | Why |
|------|-----|
| `src/components/homepage/QuickActionsFab.tsx` | Replaced by `src/components/shell/QuickActionsFab.tsx` (relocation + redesign). No other callers (grep confirms 2 — Homepage + Awards). |

### Dependencies

| Package | Change | Reason |
|---------|--------|--------|
| — | — | No new packages; no version bumps. |

---

## Implementation Strategy

Vertical slice — one PR covers both frames. Phased internally for
reviewability.

### Phase 0: Asset preparation

**Skip**. Both design-styles confirm no new assets — icons (`pencil`,
`saa`, `close`) already exist in `<Icon>`; no images; no fonts beyond
Montserrat which is already loaded.

### Phase 1: Foundation

| Step | Deliverable |
|------|-------------|
| 1.1 | **Rename** `common.widget` → `common.fab` in `vi.json` + `en.json`: `openMenu`→`open`, keep `writeKudo`, add new `rules` + `close` keys. `Messages` type auto-updates via `typeof vi` in `getMessages.ts`. `tsc --noEmit` catches call-site drift. |
| 1.2 | Add `--shadow-fab-pill`, `--shadow-fab-pill-hover`, `--shadow-fab-tile` tokens to `globals.css` |
| 1.3 | Create `src/components/shell/` folder with a placeholder `.gitkeep` (convention) |
| 1.4 | Unit-test scaffold: create `src/components/shell/__tests__/QuickActionsFab.spec.tsx` (project convention is `.spec.tsx`) with a failing placeholder test to force TDD order |

### Phase 2: Collapsed state (trigger pill)

Implements `_hphd32jN2` FR-001–FR-007 + FR-009 + FR-011.

| Step | Deliverable |
|------|-------------|
| 2.1 | Write unit tests for `<Trigger>`: (a) renders 3 glyphs in order (pen / "/" / saa); (b) click fires the `onOpen` prop (spied); (c) Enter + Space keys fire the same `onOpen`; (d) correct aria attributes (`aria-haspopup="menu"`, `aria-expanded="false"`, i18n `aria-label`); (e) `focus-visible` outline utility classes applied. Test `<Trigger>` in isolation by passing an `onOpen` spy — don't mount through `QuickActionsFab` root for Phase 2 assertions. |
| 2.2 | Implement `<Trigger>` helper inside `QuickActionsFab.tsx` — minimal to make 2.1 pass |
| 2.3 | Wire up `QuickActionsFab` root with `useState` + conditional rendering (trigger only while `open===false`) |
| 2.4 | Visual-parity QA: run dev server, compare against `_hphd32jN2/assets/frame.png` — composite shadow + glow visible, 106×64 dimensions, Montserrat "/" centered |

### Phase 3: Expanded state (menu)

Implements `Sv7DFwBw1h` FR-001–FR-005 + FR-009–FR-011, plus collapsed
FR-010 (mutual exclusion).

| Step | Deliverable |
|------|-------------|
| 3.1 | Write unit tests for `<Menu>`: renders 3 tiles in order (A=Thể lệ / B=Viết KUDOS / C=Cancel); A + B have correct `href`s; Cancel click → `setOpen(false)` + focus returns to trigger after re-mount |
| 3.2 | Implement `<QuickActionTile>` — prop-driven (`icon`, `label`, `href`, `onClose`), renders `<Link>` with close-first-then-navigate handler |
| 3.3 | Implement `<CancelButton>` — 56×56 red circle, `close` icon, i18n aria-label |
| 3.4 | Assemble `<Menu>`: 3 children with 20px gap, flex-col items-end, `role="menu"` + `menuitem`s |
| 3.5 | Wire state transition: when `open` flips `false → true` + we detect keyboard activation, `useLayoutEffect` focuses first tile |
| 3.6 | Visual-parity QA: screenshot against `Sv7DFwBw1h/assets/frame.png` |

### Phase 4: Keyboard + outside-click + focus trap + motion

Implements expanded FR-006–FR-008 + collapsed FR-008, plus US-6 on both
sides.

| Step | Deliverable |
|------|-------------|
| 4.1 | Integration test: open menu → Esc → `open === false` + focus on re-mounted trigger |
| 4.2 | Integration test: open menu → mousedown outside root → `open === false` (but tile clicks do NOT trigger close through outside-click; they use their own close handler) |
| 4.3 | Integration test: open menu → Tab forward from Cancel wraps to A; Shift-Tab from A wraps to Cancel |
| 4.4 | Implement effects: one `useEffect` per listener (Esc, `mousedown`, focus trap). Cleanup on unmount or `open===false`. |
| 4.5 | Implement `prefers-reduced-motion` branch: skip the 8px slide on menu open; use 80ms opacity fade only |
| 4.6 | Integration test: set `matchMedia` mock to reduced-motion → menu open runs no transform transition |

### Phase 5: Integration + a11y + E2E

| Step | Deliverable |
|------|-------------|
| 5.1 | Swap imports in Homepage + Awards `page.tsx` from `@/components/homepage/QuickActionsFab` → `@/components/shell/QuickActionsFab`; switch label consumption from `messages.common.widget` → `messages.common.fab` and pass as single `labels={...}` prop |
| 5.2 | Delete `src/components/homepage/QuickActionsFab.tsx`; grep for any stray `common.widget` reference and remove (namespace is now retired); confirm zero broken imports via `tsc --noEmit` |
| 5.3 | Playwright E2E (`tests/e2e/fab.spec.ts`): 3 scenarios — (a) open homepage → click FAB → click Viết KUDOS → lands on `/kudos/new`, FAB is collapsed; (b) open homepage → click FAB → click Thể lệ → lands on `/the-le`, FAB is collapsed; (c) open homepage → click FAB → click Cancel → stays on `/`, FAB is collapsed, focus on trigger |
| 5.4 | Playwright a11y (`tests/e2e/fab.a11y.spec.ts`): open menu → axe-core sweep reports zero serious/critical violations on FAB subtree |
| 5.5 | Manual keyboard walkthrough (SC-003) — document in PR description |

### Phase 6: Polish

| Step | Deliverable |
|------|-------------|
| 6.1 | Analytics event-type reservations (no emission yet): add `fab_open`, `fab_action_click`, `fab_close_cancel` to `AnalyticsEvent` union in [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts) |
| 6.2 | Add `print:hidden` to the root (covers both collapsed FR-012 and expanded FR-012) |
| 6.3 | Visual regression baseline update: capture Playwright screenshots for both states on Homepage |
| 6.4 | Update [SCREENFLOW.md](../../contexts/screen_specs/SCREENFLOW.md) — flip both FAB rows to 🟢 shipped; add a Discovery Log entry |
| 6.5 | PR description: note 3 new tokens in `globals.css`, folder move `homepage/ → shell/`, 4 new i18n keys, no API / DB changes |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Focus management race — "close menu" and "focus trigger" happen in the same tick, trigger not yet re-mounted | Med | Med | Use `useLayoutEffect` on the wrapper div keyed on `open`; put the focus call after the conditional render commits |
| Mouse vs keyboard open detection wrong (focus wrongly jumps on mouse open) | Med | Low | Track a ref (`keyboardOpenRef`) set in the Enter/Space handler, cleared after effect runs. Integration test covers both paths |
| Visual shadow differs between Tailwind arbitrary-value and Figma intent on some browsers (older iOS Safari renders multi-layer `box-shadow` differently) | Low | Low | Playwright visual diff on Chromium + WebKit in CI; if WebKit regression, switch to `filter: drop-shadow()` fallback |
| Awards page consumer forgotten during import swap | Low | Med | Grep for `QuickActionsFab` before PR; Phase 5.2 explicitly lists both sites |
| EN strings not ready from Marketing by merge time | Med | Low | Ship with proposed placeholder EN (already drafted in spec); flip later via i18n update — no code change |
| Live board adds a 3rd consumer before FAB ships | Low | Med | Coordinate: spec-ready for Live board `MaZUn5xHXZ` but not yet implemented. If Live board lands first, it imports `QuickActionsFab` from the new path and reads `messages.common.fab` like the other pages |
| `common.widget` → `common.fab` rename breaks other consumers we didn't know about | Low | Med | Phase 5.2 grep for `common\.widget` or `widgetLabels` across the repo before deletion. Currently confirmed 2 consumers (Homepage, Awards); any third hit gets migrated in the same PR |
| Tailwind v4 `@theme inline` syntax diff — token lands but `shadow-[var(--shadow-fab-pill)]` doesn't resolve | Low | Low | Verify in Phase 1.2 with a dev-server hot-reload snapshot; documented token syntax already in use by `--font-digital-numbers` |

### Estimated Complexity

- **Frontend**: **Medium** — two render branches, focus management,
  keyboard vs mouse detection, outside-click, focus trap, reduced
  motion. All well-understood patterns; existing `ProfileMenu` is a
  template for 80% of this.
- **Backend**: **None**.
- **Testing**: **Medium** — ~12 unit tests + ~4 integration tests +
  2 Playwright specs. Mirrors `ProfileMenu`'s existing coverage.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component internals**: trigger ↔ menu state transition, focus
  restoration across re-mount boundary, listener lifecycle.
- [x] **Cross-component**: Homepage + Awards Server Components read
  `messages.common.fab` and pass the correct `labels` prop to
  `<QuickActionsFab>`; FAB renders in the expected DOM position.
- [ ] **External dependencies**: none.
- [ ] **Data layer**: none.
- [x] **User workflows**: open → pick tile → navigate → return → FAB
  is collapsed again.

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Trigger→Menu state transition; focus restoration; focus trap; keyboard vs mouse open |
| Service ↔ Service | No | — |
| App ↔ External API | No | — |
| App ↔ Data Layer | No | — |
| Cross-platform | Yes | Responsive offsets (mobile 16px / desktop 24px); Chromium + WebKit visual parity on shadows |

### Test Environment

- **Local**: `vitest` (happy-dom) + `yarn dev` for manual spot-checks.
- **CI**: same Vitest suite; Playwright against the built app with
  Supabase Auth emulator (pre-existing project setup).
- **Test data**: none — component has no server data.
- **Isolation**: each Vitest test mounts a fresh `<QuickActionsFab>`;
  Playwright uses a logged-in storage-state fixture already shipped.

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `next/link` | Real | We test navigation side-effects (close-before-navigate) via Next router's `push` spy |
| `getMessages()` | Bypassed entirely — tests pass `labels` prop directly | Client component is pure. i18n lives in the page Server Component, not this island; no wrapper to test |
| `matchMedia('(prefers-reduced-motion…)')` | Mock per-test | Required for reduced-motion branch coverage |
| `document.addEventListener` (mousedown / keydown) | Real | Simulated by `fireEvent` / userEvent |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Render `<QuickActionsFab labels={...}>` → trigger visible, menu not
   - [ ] Click trigger → menu visible, trigger not
   - [ ] Click Viết KUDOS tile → router navigates to `/kudos/new` + `open` becomes false
   - [ ] Click Thể lệ tile → router navigates to `/the-le` + `open` becomes false
   - [ ] Click Cancel → `open` becomes false + focus returns to trigger
2. **Keyboard**
   - [ ] Tab to trigger → press Enter → menu opens, focus on first tile
   - [ ] Tab forward from last tile (Cancel) → wraps to first (Thể lệ)
   - [ ] Shift-Tab backward from first tile → wraps to Cancel
   - [ ] Press Esc with any menu focus → menu closes, focus on trigger
3. **Outside-click**
   - [ ] Mousedown on `document.body` outside root → menu closes
   - [ ] Mousedown on a tile → menu stays, tile handler runs
4. **Reduced-motion**
   - [ ] With `prefers-reduced-motion: reduce`, open menu → no translate, opacity-only 80ms fade
5. **Print**
   - [ ] `@media print` → root element has `display: none`
6. **A11y (axe-core Playwright)**
   - [ ] Both states: zero serious/critical violations on FAB subtree

### Tooling & Framework

- **Test framework**: Vitest (existing project choice); Playwright +
  `@axe-core/playwright` for E2E/a11y.
- **Supporting tools**: userEvent v14 for realistic keyboard sim;
  `@testing-library/react` render + screen.
- **CI**: existing workflow; no new jobs.

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| FR-001–FR-012 (both specs) | 100 % of FRs asserted by at least one test | High |
| Keyboard / a11y | All 4 keyboard paths + axe-core clean | High |
| Visual regression | Both states diffed against Figma PNGs within project threshold | Medium |
| Reduced-motion branch | Single test covering branch execution | Medium |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` reviewed
- [x] Both `spec.md` approved (reviewed twice via `/momorph.reviewspecify`)
- [x] Both `design-style.md` approved
- [ ] `research.md` — **not required**; patterns well-established by
  existing `ProfileMenu` + `LanguageDropdown` components
- [ ] API contracts — **N/A**
- [ ] Database migrations — **N/A**

### External dependencies

- [x] `/the-le` route (shipped) — tile A target
- [ ] `/kudos/new` route (placeholder today, not blocking; tile B can
  ship pointing at the placeholder, becomes real with the Viết Kudo
  spec)

---

## Resolved Decisions & Open Questions

### Resolved (2026-04-20 plan review)

- **Q1 ✅** — Hover shadow for the trigger pill: **`0 6px 10px 0 rgba(0,0,0,0.3), 0 0 10px 0 #FAE287`**.
  Ship this as the value for `--shadow-fab-pill-hover`.
- **Q2 ✅** — Expanded-tile drop shadow: **`0 8px 24px rgba(0,0,0,0.35)`**.
  Ship this as the value for `--shadow-fab-tile`.
- **Q4 ✅** — Thể lệ tile icon: ship the new PNG asset at
  **`public/images/the-le/icon_rule_saa@2x.png`** (48×48 @2x,
  displayed at 24×24 via `next/image` with `unoptimized`). It is a
  dedicated glyph — **not** the Sun* monogram from `<Icon name="saa">`.
  The `saa` icon entry in `Icon.tsx` stays for the collapsed FAB
  trigger pill + other consumers.
- **Q5 ✅** — EN strings for `common.fab.*` locked in:
  - `open` → `"Open quick actions menu"`
  - `rules` → `"Rules"`
  - `writeKudo` → `"Write KUDOS"`
  - `close` → `"Close"`

### Still open

#### Design
- **Q3** — Menu-open transition: hard swap (trigger unmounts → menu
  mounts with its own 8px slide) or a crossfade / morph? Spec +
  plan currently assume hard swap.

#### Technical / Product
- **Q6** — Project-wide modal z-index convention. FAB uses `z-50`;
  US-3.3 assumes modals `z ≥ 100`. No modal exists today — ratify
  when Viết Kudo introduces the first.
- **Q7** — `/kudos/new` route longevity: stay as-is when Viết Kudo
  ships, or change? FAB hard-codes the path; cheap to flip later but
  worth confirming now.

---

## Next Steps

After plan approval:

1. ~~Resolve Q1 + Q2 + Q4 + Q5~~ — resolved 2026-04-20. Q3/Q6/Q7 remain
   open but are non-blocking and can slip into the tasks sprint.
2. ~~Run `/momorph.tasks`~~ — canonical tasks list already emitted at
   [`tasks.md`](./tasks.md); pointer at the expanded side.
3. Begin implementation in the phase order above. One PR; one reviewer;
   one sprint.

---

## Notes

- The existing `src/components/homepage/QuickActionsFab.tsx` prototype
  already renders the pill correctly (pen + "/" + saa). It does NOT
  match:
  - the composite shadow (missing `#FAE287` glow)
  - the expanded menu (it ships a 1-item dark dropdown instead of the
    3-tile cream menu)
  - the folder convention (belongs in `shell/`, not `homepage/`)
  Implementation swaps the expanded content wholesale; trigger pill
  visuals carry over 90 % of existing code.
- **Why `shell/` and not `ui/`**: `ui/` is for generic primitives
  (Button, Icon, Modal). The FAB is a specific widget tied to the
  authenticated shell — it has an opinionated layout, set of actions,
  and i18n namespace. Per constitution §I "[feature]/", `shell/` is a
  valid feature folder.
- **Why no Server-Component wrapper (Host) component**: the existing
  convention — `ProfileMenu`, `LanguageToggle`, `NotificationBell` —
  is "page Server Component calls `getMessages()` and passes the
  relevant slice as a `labels` prop to the client island". Adding a
  `QuickActionsFabHost` wrapper would be a new pattern for a single
  component. Keep the simpler convention: Homepage / Awards each do
  `const fabLabels = messages.common.fab` and pass it to
  `<QuickActionsFab labels={fabLabels} />`.
- **Scope discipline**: this plan intentionally excludes any FAB
  placement decisions beyond what exists today (Homepage + Awards).
  Adding the FAB to Live board happens as part of the Live board
  implementation, using the already-shipped `<QuickActionsFab>`
  import — Live board's page just reads `messages.common.fab` and
  passes it to the client island, like Homepage and Awards do.
