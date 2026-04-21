# Implementation Plan: Dropdown-ngôn ngữ (Language dropdown)

**Frame**: `hUyaaugye2-dropdown-ngon-ngu`
**Date**: 2026-04-21
**Spec**: [spec.md](spec.md)
**Design style**: [design-style.md](design-style.md)

---

## Summary

Retrofit the existing client prototype [src/components/login/LanguageDropdown.tsx](../../../src/components/login/LanguageDropdown.tsx) to match the Figma dark-navy popover family (sibling of the Hashtag + Department filter dropdowns already in production). The prop surface stays backwards-compatible — the only caller, [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx), needs two targeted edits (drop `globe` fallback + pass the new `flag-gb` icon; flip outside-click listener from `document` → `window` per TR-004). A third small change adds the `flag-gb` entry to the shared Icon registry. One behavioural fix lands alongside the visual refactor: Tab-out must close the menu (FR-002(d) / US3 AC4), a gap the current prototype does not handle.

**Scope**: one PR, 4 phases, 3 modified files + 2 new test files, 13 new test scenarios. Zero new deps, zero new design tokens, zero server-side work, zero database changes.

---

## Technical Context

| Field | Value |
|-------|-------|
| **Language/Framework** | TypeScript (strict) + Next.js 16 App Router + React 19 |
| **Primary Dependencies** | TailwindCSS v4 (utility-first), `next/font/google` (Montserrat) — no new packages |
| **Database** | N/A (no persistence beyond the existing `NEXT_LOCALE` cookie) |
| **Testing** | Vitest + `@testing-library/react` + happy-dom (matches the existing `FilterDropdown.spec.tsx` pattern) |
| **State Management** | React hooks only (`useState`, `useRef`, `useEffect`, `useTransition`) — constitution §III |
| **API Style** | Server Action (`setLocale`) — already exists, no changes |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] Follows project coding conventions (TypeScript strict, `@/*` alias, PascalCase component file)
- [x] Uses approved libraries and patterns (no new deps)
- [x] Adheres to folder structure guidelines (`src/components/login/LanguageDropdown.tsx` + `src/components/ui/Icon.tsx`)
- [x] Meets security requirements (no new surface; `setLocale` already gated + writes to HttpOnly-equivalent cookie)
- [x] Follows testing standards (TDD — add `LanguageDropdown.spec.tsx` before shipping the visual refactor)

### Compliance matrix (spec → constitution, exhaustive)

| Spec requirement | Constitution rule | Implementation note | Owning task |
|---|---|---|---|
| FR-001 (open on click / Enter / Space / ↓; toggle closed on repeat click) | §Principle II keyboard parity | Already implemented in `LanguageToggle.tsx` lines 40–48 (`handleKey`) + `toggle` callback — **preserve unchanged** | (no change) |
| FR-002(a) (close on select) | §Principle II | `handleSelect` in `LanguageToggle.tsx` line 51 calls `close()` first — preserve | (no change) |
| FR-002(b) (close on outside click, scope = wrapper) | §Principle II + TR-004 | `toggleRef.current.contains(e.target)` guard (line 32) — preserve; flip listener attach target from `document` → `window` (T102) | T102 |
| FR-002(c) (close on Esc) | §Principle II | `handleKey` in `LanguageDropdown.tsx` line 35 + `LanguageToggle.tsx` line 41 — preserve | (no change) |
| FR-002(d) + US3 AC4 (close when Tab leaves menu) | §Principle II | **Behavioural gap — not implemented in prototype.** Must add a `Tab` branch to `LanguageDropdown.handleKey` (or a `focusout` listener) that calls `onClose()` after native focus moves out. See T204. | **T204 (new)** |
| FR-003 (two-letter visible labels "VN" / "EN") | §Principle I "clean code" | Drop the `label` values `"Tiếng Việt"`/`"English"` from the internal `ITEMS` array; use `code` for visible text and `fullName` for `aria-label` | T202 |
| FR-004 (selected cream @ 20 % fill + aria-checked) | §Principle VI design-tokens via CSS variables | `bg-[var(--color-accent-cream)]/20` on active row; `aria-checked={selected}` already correct in prototype | T202 |
| FR-005 (call `setLocale` + emit `language_change`) | §V Supabase / §III client state | Already wired in `LanguageToggle.handleSelect` lines 53–56 — **preserve; do not duplicate in the overlay** | (no change) |
| FR-006 (re-select active locale = no-op) | §Principle I "no dead code" | Already guarded in `LanguageToggle.handleSelect` line 52 (`if (next === locale) return;`) — **load-bearing, do NOT remove during refactor** | (no change, assert via T301) |
| FR-007 (ArrowUp/Down/Enter/Space/Esc/Tab) | §Principle II WCAG 2.2 AA | Arrow/Esc in prototype `handleKey`. Enter/Space fire the button's native `onClick` (standard a11y — rows are `<button>`). Tab — see FR-002(d) row. | T204 |
| FR-008 (focus active row on open) | §Principle II | Imperative `.focus()` in prototype `useEffect` — keep; update `buttons[idx]` lookup to survive the row-structure refactor. Add defensive fallback: if `idx < 0`, focus index 0 | T202 |
| FR-009 (`flag-gb` icon in registry) | §Principle I "All icons in Icon Component" | Add one case to the `switch(name)` block in `Icon.tsx`; inline SVG (no `public/assets/*.svg` file) | T101 |
| FR-010 (`aria-label` = full language name) | §Principle II screen-reader clarity | Row button `aria-label={fullName}`; visible label wrapped with `aria-hidden="true"` | T202 |
| FR-011 (panel hugs content, equal-width rows) | §Principle II responsive (no fixed-px containers where avoidable) | `w-fit` on `<ul>`; `w-full` on each `<button>` so both rows render identically | T202 |
| FR-012 (prop surface preserved: `{ id, currentLocale, onSelect, onClose }`) | §Principle I clean types | Pinned by `LanguageToggle` integration test (T301) + PR-description diff (T302) | T301, T302 |
| FR-013 (no pending spinner inside dropdown) | §Principle I "no dead code" / §III simplicity | Prototype does not currently render a spinner — do NOT add one during refactor. `useTransition` stays in `LanguageToggle`. | T202 (negative) |
| TR-001 (paint < 16 ms) | §Principle I performance | Pure-client overlay; no network I/O at open — guaranteed by architecture | (inherent) |
| TR-002 (`setLocale` persistence) | §V Supabase | Reuse existing Server Action; no changes to `src/libs/i18n/setLocale.ts` | (no change) |
| TR-003 (no duplicate `revalidatePath`) | §Principle I | Caller (`LanguageToggle`) delegates; overlay does not import `revalidatePath` | T202 (negative) |
| TR-004 (`window` listener for outside click) | precedent from `FilterDropdown` | Flip `document.addEventListener` → `window.addEventListener` in `LanguageToggle.tsx` line 36; mirror in the cleanup on line 37 | T102 |
| TR-005 (Icon component, no `<img>` / `next/image`) | §Principle I "All icons in Icon Component" | `flag-gb` inlined as SVG case in `Icon.tsx`, consumed via `<Icon name="flag-gb" />` | T101 |

**Violations**: None.

---

## Architecture Decisions

### Frontend Approach

- **Component structure**: Retrofit one existing client component ([`src/components/login/LanguageDropdown.tsx`](../../../src/components/login/LanguageDropdown.tsx)). Do not relocate (keeps blast radius minimal — only one importer, `LanguageToggle`). Relocating to `src/components/layout/` to reflect its now-shared status is a reasonable **follow-up**, not part of this PR.
- **Styling strategy**: Tailwind utilities + `bg-[var(--color-accent-cream)]/20` Tailwind v4 opacity syntax. Zero new CSS tokens (all three needed — `--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream` — already live in [src/app/globals.css](../../../src/app/globals.css)).
- **Data fetching**: None (overlay is pure-client; selection delegates to `setLocale` Server Action owned by caller).
- **Popover primitive**: Do NOT reuse `FilterDropdown` from Kudos. Its prop surface (`options[]`, `kind`, `onSelect(string | null)`) is designed for n-item filters; mapping a binary locale through it is strictly more complex than the current 2-row `<ul>` layout. Extracting a shared `<DarkNavyPopover>` across all three dropdowns (Language + Hashtag + Department) is a plausible refactor but **explicitly out of scope** (spec §Notes).

### Backend Approach

- **API design**: N/A — reuses the existing Server Action `setLocale(next: Locale)` from [src/libs/i18n/setLocale.ts](../../../src/libs/i18n/setLocale.ts). Contract is stable (writes `NEXT_LOCALE` cookie + `revalidatePath("/")`).
- **Data access**: None.
- **Validation**: `isSupportedLocale(next)` inside `setLocale` already rejects unknown values silently — no client-side validation required.

### Integration Points

- **Existing services this feature touches**:
  - [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) — the sole caller of `LanguageDropdown`. Two edits: (1) drop the `globe` fallback and pass `flag-gb` when locale is `en`; (2) flip outside-click listener from `document` → `window`.
  - [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx) — append one case to `IconName` union + `switch` statement for `"flag-gb"`.
  - [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts) — **no change**. The `language_change` event type is already defined; we keep emitting it (FR-005).

- **Shared contracts**:
  - `Locale` union from [src/types/auth.ts](../../../src/types/auth.ts) — unchanged.
  - `setLocale` Server Action — unchanged.

---

## Project Structure

### New files

| File | Purpose |
|------|---------|
| `src/components/login/__tests__/LanguageDropdown.spec.tsx` | 10 unit scenarios covering the overlay contract: 2-letter labels (FR-003), `aria-label` wiring (FR-010), `aria-checked` mirrors `currentLocale` (FR-004), selection fires `onSelect` at the overlay boundary (FR-005 delegation), Esc fires `onClose` (FR-002(c)), arrow keys cycle + wrap (FR-007), focus-on-mount targets active row (FR-008), Tab-out calls `onClose` via T204 microtask (FR-002(d), US3 AC4). The FR-006 no-op guard lives in `LanguageToggle`, so it is NOT tested here — see the integration test below. |
| `src/components/layout/__tests__/LanguageToggle.integration.spec.tsx` | 5 integration scenarios: trigger opens menu (US1 AC2), select-different fires `setLocale("en")` exactly once + one `language_change` event, select-same fires zero `setLocale` + zero analytics calls (FR-006 / SC-003), Esc closes with zero side effects, Tab-out closes end-to-end (US3 AC4). |

### Modified files

| File | Changes |
|------|---------|
| `src/components/login/LanguageDropdown.tsx` | Full visual refactor against `design-style.md`: panel classes → dark-navy + gold border + `w-fit` + `p-1.5` + new shadow; rows → `h-14`, 16/700/24 Montserrat, cream @ 20 % selected + cream @ 10 % hover; labels → 2-letter codes with full names as `aria-label`; flag icons → `flag-vn` + `flag-gb`. Prop surface unchanged. |
| `src/components/layout/LanguageToggle.tsx` | (a) Drop the `<Icon name={locale === "vi" ? "flag-vn" : "globe"} />` fallback — render `flag-gb` for `en` (line 72). (b) Flip outside-click listener from `document.addEventListener` → `window.addEventListener` (line 36) per TR-004. |
| `src/components/ui/Icon.tsx` | Add `"flag-gb"` to `IconName` union (line 3-31) and a new `case "flag-gb":` inlined SVG Union Jack (24 × 24, `viewBox="0 0 24 24"`). |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| _(none)_ | — | Zero new packages. Everything needed is already in `package.json`. |

---

## Implementation Approach

Phases run sequentially — no parallelism needed because the component surface is small and each phase's changes live in different files.

### Phase 0: Asset preparation

**Deliverable**: `flag-gb` Union Jack SVG ready to inline in `Icon.tsx`.

- No download from Figma required. The `flag-gb` icon is inlined as a React SVG component (design-style §Icon naming decision). Two options:
  1. **Preferred**: hand-author a 24 × 24 Union Jack using standard British-flag SVG coordinates (white/blue/red bands). Keeps the registry self-contained.
  2. **Fallback**: if exact Figma asset export is desired, use MCP tool `mcp__momorph__get_design_item_image` with node `I525:11713;362:6128;186:1903;186:1709` and trace to SVG. Only necessary if visual regression reports differ from hand-authored.
- Verify icon renders cleanly at 24 × 24 (the single size used in the dropdown); pixel-align strokes.

### Phase 1: Foundation — Icon + state-management prep

**Scope**: US-independent infra.

**T101** — Add `"flag-gb"` to `IconName` union in [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx). Add the inlined SVG case. **No dedicated Icon unit test** — `Icon.tsx` follows the convention of being tested implicitly through its consumers (e.g. `HeartButton.spec.tsx` asserts heart glyphs render; T201 scenario 1 asserts the EN row renders with the correct `flag-gb` icon). Snapshot coverage comes free from the consumer test.

**T102** — Flip outside-click listener in [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) from `document.addEventListener("mousedown", onClick)` → `window.addEventListener("mousedown", onClick)` (TR-004). Pure mechanical change, no behaviour difference on desktop; fixes potential iOS Safari tap-delegation bug. Cleanup also updates `removeEventListener` to match.

**Gate**: `yarn tsc --noEmit && yarn lint` stays green. No test regressions.

### Phase 2: Core features — US1 (switch locale) + US2 (dismiss without change) + US3 (keyboard)

**Scope**: The visual refactor + behavioural cleanup + Tab-close fix. This is the bulk of the work.

**T201** — Write `src/components/login/__tests__/LanguageDropdown.spec.tsx` (TDD red): 8 scenarios covering US1 + US2 + part of US3. T204 adds 2 more scenarios (Tab) to the same file.
  1. renders two rows with labels "VN" / "EN" (FR-003 — visible text is the code)
  2. each row's `aria-label` is the full language name "Tiếng Việt" / "English" (FR-010); visible text is `aria-hidden="true"`
  3. active locale row has `aria-checked="true"` and the cream @ 20 % selected-state class (FR-004)
  4. clicking the non-active row calls `onSelect` with the clicked locale (FR-005 delegation)
  5. clicking the active row still fires `onSelect(activeLocale)` at the overlay boundary — the FR-006 no-op guard lives one layer up in `LanguageToggle.handleSelect` (line 52, `if (next === locale) return;`) so the user-visible behaviour (no cookie / no analytics) is tested at the integration level in T301 scenario 3. At the overlay level the contract is simpler: every row click invokes `onSelect`
  6. pressing Esc calls `onClose` (FR-002(c))
  7. ArrowDown from first row moves focus to second; ArrowUp from first row wraps to last (FR-007)
  8. mounting focuses the active-locale row (FR-008); if `currentLocale` is not in the items list (defensive), focus the first row

**T202** — Full visual refactor of `src/components/login/LanguageDropdown.tsx`:
  - `<ul>` panel classes: `absolute right-0 top-full mt-2 w-fit z-30 p-1.5 bg-[var(--color-panel-surface)] border border-[var(--color-border-secondary)] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col`
  - Items: drop `label` field from the internal `ITEMS` array; use code (`"VN"` / `"EN"`) for visible text and a separate `fullName` (`"Tiếng Việt"` / `"English"`) for `aria-label`
  - Add new `flag-gb` icon case to the items array for English
  - Row `<button>` classes: `w-full h-14 inline-flex items-center justify-between gap-1 p-4 rounded text-white text-base leading-6 font-bold tracking-[0.15px] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer` + active: `bg-[var(--color-accent-cream)]/20` / inactive: `hover:bg-[var(--color-accent-cream)]/10`
  - Keep existing Arrow + Esc keyboard handling and focus-on-mount from the prototype. **Tab handling is added separately by T204** (microtask `onClose` after native focus movement).
  - The 8 tests from T201 should all go green. The 2 Tab-specific tests from T204 will go green once T204 lands.

**T203** — Update [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) line 72: replace `<Icon name={locale === "vi" ? "flag-vn" : "globe"} />` with `<Icon name={locale === "vi" ? "flag-vn" : "flag-gb"} />`. Explicitly **preserve** the `handleSelect` no-op guard on line 52 (`if (next === locale) return;` — this is the FR-006 implementation) and the `useTransition` wrapping (FR-013 delegates the async Server Action off the overlay). No other lines in this file are touched by Phase 2.

**T204** — **Close the Tab-out behavioural gap (FR-002(d), US3 AC4)** in [src/components/login/LanguageDropdown.tsx](../../../src/components/login/LanguageDropdown.tsx):
  - Extend `handleKey` with a `Tab` branch: when `e.key === "Tab"`, do NOT call `e.preventDefault()` (we want native focus movement), but schedule `onClose()` in a microtask (`queueMicrotask(() => onClose())`) so the close fires after the browser has already moved focus to the next tab target. This matches the spec AC — "focus leaves the menu and the menu closes".
  - Alternative: attach an `onBlur` handler on the `<ul>` that fires `onClose()` when `e.relatedTarget` is outside `listRef.current`. Either approach is acceptable; the `Tab` key-branch is less prone to false positives from programmatic blur events and is preferred.
  - Cover with two unit test scenarios (added to T201's test file): (a) pressing Tab from the second row calls `onClose`; (b) pressing Tab from the first row calls `onClose` (closes even if the user tabs "forward" through the menu items themselves — keeping the model simple).

**Gate**: All 10 new unit tests green (8 from T201 + 2 from T204). `yarn tsc --noEmit && yarn lint` clean. Visual regression against `assets/frame.png` at `/kudos` (authenticated) or `/login` (public) — **no visual-regression tooling exists in CI today**, so this comparison is manual: `yarn dev`, navigate, open devtools, screenshot-compare against the spec asset. Wire into a future visual-regression gate if one is adopted project-wide.

### Phase 3: Integration coverage — US4 (prototype reconciliation) + US1/US2/US3 at the caller boundary

**Scope**: The overlay-level contract is locked down by Phase 2 (T201 + T204). Phase 3 adds the integration-level guarantees that the caller wiring (`LanguageToggle` → `setLocale` → analytics) still honours FR-005, FR-006, and US3 AC4 after the visual refactor. Also produces the US4 AC1 prop-surface diff proof.

**T301** — Write `src/components/layout/__tests__/LanguageToggle.integration.spec.tsx`: 5 scenarios. **Mocking pattern** (match Kudos test conventions — see `src/components/kudos/__tests__/FilterDropdown.spec.tsx`): use `vi.mock("@/libs/i18n/setLocale", () => ({ setLocale: vi.fn() }))` and `vi.mock("@/libs/analytics/track", () => ({ track: vi.fn() }))`; `vi.clearAllMocks()` in `beforeEach`.
  1. trigger click opens the menu (US1 AC2) — assert `screen.getByRole("menu")` is in the document after click
  2. selecting a different locale calls `setLocale("en")` exactly once + emits one `language_change` event with `{ type: "language_change", from: "vi", to: "en" }`
  3. selecting the same locale as current fires zero `setLocale` + zero analytics calls (SC-003, FR-006)
  4. pressing Esc with menu open closes it + no side effects (zero `setLocale`, zero analytics)
  5. Tab-ing out of the menu closes it (US3 AC4) — simulate via `userEvent.tab()`; assert menu no longer in document

**T302** — (US4 AC1 evidence): produce a 1-line diff summary in the PR description that confirms the prop surface of `LanguageDropdown` — `{ id, currentLocale, onSelect, onClose }` — is byte-identical before/after. No code change; this is a PR-description artefact.

**Gate**: All tests green. The existing Login screen + authenticated headers still render correctly (smoke-test by navigating to `/login` and `/` with the dev server running).

### Phase 4: Polish

**T401** — Add `motion-safe:` modifiers to any transitions you introduce on the panel (opacity + translateY per design-style §Animation). The Tailwind `motion-safe:transition-opacity motion-safe:duration-150` pattern already used on the trigger chevron (see `LanguageToggle.tsx` line 79) is the shape to match. Under `prefers-reduced-motion: reduce` the panel shows/hides instantly.

**T402** — Accessibility sweep: run axe-core against `/login` + `/` with the dropdown open (SC-004). If any violations appear, fix in place. The 2-item menu is narrow enough that zero violations should be achievable.

**T403** — Update SCREENFLOW tracking if needed (status will already be `📋 spec'd (prototype)` — consider flipping to `🟢 shipped` once the PR lands and smoke tests pass).

**Gate**: Zero axe-core violations on both entry screens. All existing tests + **15 new tests** (10 unit from T201 + T204, 5 integration from T301) green.

---

## Testing Strategy

| Type | Focus | Coverage target |
|------|-------|-----------------|
| **Unit** | `LanguageDropdown` rendering, aria wiring, keyboard handlers, overlay→caller contract | **10 new scenarios** — 8 from T201 (FR-002(c), FR-003, FR-004, FR-005 delegation, FR-007 arrows, FR-008, FR-010, FR-011) + 2 from T204 (FR-002(d) / US3 AC4 Tab-close) |
| **Integration** | `LanguageToggle` → `LanguageDropdown` → `setLocale` + analytics wiring | **5 new scenarios (T301)** — covers FR-005 (exact-once), FR-006 (zero-fire on re-select), US1 AC2 (menu opens), US3 AC4 (Tab-close end-to-end), Esc-close end-to-end |
| **E2E** | Not required — the existing Playwright suite covers header rendering on `/login`. If a dedicated E2E is desired, gate on `SUPABASE_TEST_SESSION_TOKEN` (same pattern as Kudos E2Es). Not a ship-blocker. |
| **Visual regression** | Compare rendered overlay against `assets/frame.png` | **Manual on first ship.** No visual-regression tooling exists in CI today. Developer runs `yarn dev`, opens `/login`, clicks the language pill, screenshots, eyeballs against `.momorph/specs/hUyaaugye2-dropdown-ngon-ngu/assets/frame.png`. |
| **Accessibility** | axe-core on `/login` + `/` with the overlay open | Zero violations (SC-004) |

No coverage-percentage gate mandated by constitution (grep for "80%"/"70%" finds nothing); the **15 scenarios** above (10 unit + 5 integration) are the contract. Two integration scenarios (Esc-close, Tab-close) deliberately overlap with their unit-level counterparts so both the overlay contract and the caller-side wiring are guarded — the overlap is intentional, not bookkeeping slack.

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Retrofit breaks `LanguageToggle` imports** (e.g. accidental rename of exported symbol) | Medium — both Login and all authenticated shells would render a broken header | Low — `LanguageDropdown`'s exported symbol is `{ LanguageDropdown }`, prop surface is explicitly pinned by the integration test in T301 | FR-012 + T301 + PR-description diff check |
| **Outside-click flip (`document` → `window`) regresses some close-on-outside-click behaviour** | Medium — menu would stay stuck open on some click targets | Low — the Hashtag/Department dropdowns already do this successfully in production | Keep the existing `toggleRef.current.contains(e.target)` guard; smoke-test both mouse and touch |
| **New `flag-gb` SVG renders blurry at 24 × 24** | Low — only a visual polish issue | Medium (hand-authored SVGs can miss pixel alignment) | Pixel-align strokes during Phase 0; visual regression against `assets/frame.png` |
| **`w-fit` panel sizes inconsistently across locales** (e.g. cream-@-20 % fill on the wider row pushes the panel asymmetric) | Low | Low — both rows are width-equal per FR-011 | Explicit `w-full` on each button ensures both rows adopt the panel's hug width |
| **Analytics double-fire on rapid selection** | Low — only a data hygiene issue | Low — `useTransition` coalesces | T301 scenario 2 asserts "exactly once"; dropdown's internal `handleSelect` also closes the menu synchronously, preventing a second click |
| **Motion preferences ignored (reduced-motion users see the fade/scale)** | Low — non-critical a11y polish | Medium (easy to forget `motion-safe:` modifier) | T401 is explicit about adding `motion-safe:` everywhere transitions land |
| **Tab-close implementation races the browser's focus movement** | Low — could cause the menu to close a frame early, briefly flashing the page's prior focus target | Medium — `queueMicrotask` approach requires the browser to have already applied the focus change | T204 picks `queueMicrotask` specifically because it runs AFTER the synchronous focus change. If a regression shows up (menu-flash artefact in reduced-motion snapshots), fall back to the `onBlur` + `e.relatedTarget` alternative documented in T204 |
| **Removing the guard at `LanguageToggle.handleSelect` line 52 during refactor** | **High** — would cause every row click (including the active one) to fire `setLocale` + `language_change`, violating FR-006 + SC-003 | Low — visible in diff review, caught by T301 scenario 3 | T203 explicitly instructs "preserve the `if (next === locale) return;` guard"; T301 scenario 3 is a regression gate |

---

## Open Questions

- [x] ~~Should the EN row icon be named `flag-gb-nir` or `flag-gb`?~~ — **Resolved** during `/momorph.reviewspecify` round 1: normalise to `flag-gb` (see spec FR-009 naming rationale).
- [x] ~~Preserve prop surface vs breaking change to `LanguageToggle`?~~ — **Resolved** in US4: preserve.
- [x] ~~Reuse `FilterDropdown` primitive or keep `LanguageDropdown` standalone?~~ — **Resolved** in spec §Notes: keep standalone; primitive extraction is a follow-up.
- [ ] **Follow-up (out of scope)**: after this ships, consider relocating `src/components/login/LanguageDropdown.tsx` → `src/components/layout/LanguageDropdown.tsx` to reflect its now-shared status. One-line import change in `LanguageToggle.tsx`. Not a blocker for this PR.
- [ ] **Follow-up (out of scope)**: extract a shared `<DarkNavyPopover>` primitive consolidating `FilterDropdown`, `LanguageDropdown`, and any future header dropdowns. Only warranted once a third or fourth consumer appears beyond the existing three.

---

## Cross-references

- **Spec**: [spec.md](spec.md) — user stories, FRs/TRs, edge cases
- **Design style**: [design-style.md](design-style.md) — tokens, ASCII layout, implementation mapping table
- **Sibling specs**: [WXK5AYB_rG Dropdown Phòng ban](../WXK5AYB_rG-dropdown-phong-ban/plan.md) + [JWpsISMAaM Dropdown Hashtag filter](../JWpsISMAaM-dropdown-hashtag-filter/plan.md) — same visual family, different consumer pattern (filter bar vs header shell)
- **Screen flow**: row #8 in [.momorph/contexts/screen_specs/SCREENFLOW.md](../../contexts/screen_specs/SCREENFLOW.md) — currently `📋 spec'd (prototype)`; flip to `🟢 shipped` only after PR merge (not after Phase 4 locally) to match the convention used by the other 📋→🟢 transitions in the tracker
- **Existing code to retrofit**:
  - [src/components/login/LanguageDropdown.tsx](../../../src/components/login/LanguageDropdown.tsx)
  - [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx)
  - [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx)
