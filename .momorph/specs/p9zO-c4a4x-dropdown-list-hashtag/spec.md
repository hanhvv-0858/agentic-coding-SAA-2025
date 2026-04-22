# Feature Specification: Dropdown list hashtag (Compose-time hashtag picker)

**Frame ID**: `p9zO-c4a4x` — Figma node `1002:13013`
**Frame Name**: `Dropdown list hashtag`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/p9zO-c4a4x
**Created**: 2026-04-21
**Status**: Draft
**Parent screen**: [`ihQ26W78P2` Viết Kudo](../ihQ26W78P2-viet-kudo/spec.md) — this picker opens when user clicks the "+ Hashtag" chip in the Viết Kudo modal
**Sibling visual family**: `FilterDropdown` (Hashtag filter `JWpsISMAaM` + Department filter `WXK5AYB_rG`) and `LanguageDropdown` (`hUyaaugye2`) — same dark-navy panel tokens (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`).

---

## Overview

A multi-select popover that opens below the "+ Hashtag" button inside the Viết Kudo modal. Shows the full list of available hashtags from `getKudoHashtags()`; the user toggles 0..5 tags on/off by clicking them. Selected rows have a cream-tint fill (`--color-accent-cream @ 20%`) plus a white ✓ check icon on the right; unselected rows are transparent. The picker stays open while the user selects/deselects — closes only on outside click, Esc, or when the parent unmounts it.

**Key difference vs. the Live-board FilterDropdown**: This picker is **multi-select** (commit ≤ 5 tags to the kudo), not single-select + toggle-off. Click on a row = toggle, not close.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pick one or more hashtags (Priority: P1) 🎯 MVP

A Sunner composing a kudo clicks the "+ Hashtag" button in the Viết Kudo modal. The picker opens below the button showing all available hashtags with locale-resolved labels (13 tags per migration 0010). The user clicks `#Cống hiến` → it flips to selected (cream fill + check icon). User clicks `#Wasshoi` → also selected. They click outside the panel → picker closes, the 2 selected tags appear as chips next to the "+ Hashtag" button in the parent modal.

**Why this priority**: The picker is the ONLY UI for selecting hashtags during compose. Without it, the "Hashtag *" required field in Viết Kudo cannot be satisfied → entire compose flow blocked. This IS the MVP of this overlay.

**Independent Test**: Inside Viết Kudo modal, click "+ Hashtag" → assert popover opens → click 2 different rows → assert both flip to selected state (cream fill + ✓) → click outside → popover closes + parent form state includes both slugs.

**Acceptance Scenarios**:

1. **Given** Viết Kudo is open with 0 hashtags selected, **When** the user clicks "+ Hashtag", **Then** the picker popover opens anchored below the trigger, rendering whatever `HashtagOption[]` the parent has pre-fetched via `getKudoHashtags()` and passed as the `options` prop.
2. **Given** the picker is open and `#dedicated` is NOT selected, **When** the user clicks the `#dedicated` row, **Then** the row background flips to cream @ 20%, a white ✓ check appears on the right, `aria-selected` becomes `true` (WAI-ARIA 1.2 listbox-option state), and the parent's `hashtagSlugs` state adds `"dedicated"`. The picker stays open.
3. **Given** `#dedicated` is selected, **When** the user clicks the same row again, **Then** the row flips back to transparent bg + no check, `aria-selected` becomes `false`, and `"dedicated"` is removed from parent state. Picker stays open.
4. **Given** the picker is open with 2 tags selected, **When** the user clicks outside the panel, **Then** the picker closes and the 2 selected tags render as chips next to the "+ Hashtag" button (owned by parent Viết Kudo spec).

---

### User Story 2 — 5-tag cap prevents a 6th selection (Priority: P1)

The user has already selected 5 hashtags. The 6th row they try to click does NOT become selected — instead a subtle visual feedback shows that the cap is reached. The 6th click MUST NOT flash "selected" momentarily.

**Why this priority**: The "Tối đa 5" constraint is a hard rule on the Viết Kudo spec (`kudos` schema + `enforce_kudo_image_limit`-style invariant). Without this guard the user can build a "dirty" state that the Server Action rejects later, frustrating them with a late error.

**Independent Test**: Select 5 tags → try clicking a 6th row → assert the row does NOT flip to selected state and the parent's `hashtagSlugs` stays at 5 items.

**Acceptance Scenarios**:

1. **Given** 5 hashtags are already selected, **When** the user clicks an unselected row, **Then** nothing happens (row stays transparent, `aria-selected` stays `false`, no call to parent callback fires). Optional: a brief shake animation OR a tooltip "Tối đa 5 hashtag" for feedback. Unselected rows MUST render with `aria-disabled="true"` + `opacity-50` + `cursor-not-allowed` at cap so the disabled state is perceivable without triggering a click.
2. **Given** 5 hashtags are selected, **When** the user clicks an already-selected row, **Then** deselection fires normally (the 5-cap only blocks additions, never removals).
3. **Given** 5 tags selected, **When** the user deselects one to land at 4, **Then** subsequent unselected rows become clickable again.
4. **Given** the "+ Hashtag" button in the parent Viết Kudo modal is hidden when 5 tags are selected (per Viết Kudo FR-009), **When** the picker is opened via some other means (keyboard shortcut, etc. — not currently spec'd), **Then** clicks on unselected rows still no-op at 5-cap (defence in depth).

---

### User Story 3 — Keyboard-only navigation (Priority: P2)

A keyboard-only user opens the picker with Enter on the focused trigger, navigates with ↑/↓, toggles with Enter or Space, and dismisses with Esc or Tab-out. Focus model mirrors `FilterDropdown` and `LanguageDropdown` from the dark-navy family.

**Why this priority**: WCAG 2.2 AA (constitution §Principle II). Not P1 only because the picker is gated behind Viết Kudo, which itself is P1; keyboard parity on a P2 overlay is still required but ships alongside Viết Kudo's own keyboard work.

**Independent Test**: Tab to "+Hashtag" trigger → Enter → picker opens, focus on first row → ↓ cycles down → Enter toggles selection → Esc closes.

**Acceptance Scenarios**:

1. **Given** the trigger has keyboard focus, **When** the user presses Enter or Space, **Then** the picker opens AND focus moves to the first row (or the first selected row if any are pre-selected).
2. **Given** the picker is open, **When** the user presses ↓, **Then** focus moves to the next row; ↑ moves up; both wrap at boundaries.
3. **Given** focus is on a row, **When** the user presses Enter or Space, **Then** that row toggles (same semantics as click) — the picker does NOT close.
4. **Given** the picker is open, **When** the user presses Esc, **Then** the picker closes with focus returning to the "+ Hashtag" trigger.
5. **Given** the picker is open, **When** the user presses Tab, **Then** focus leaves the picker AND the picker closes (same pattern as `LanguageDropdown` T204).

---

### User Story 4 — Loading + empty states (Priority: P3)

If `getKudoHashtags()` is slow or returns empty, the picker surfaces it gracefully. Slow = show a skeleton or "Đang tải…" until ready. Empty = show "Chưa có hashtag" message (shouldn't happen in production since 13 seeded tags exist, but guarded for dev/staging).

**Why this priority**: Graceful degradation. Low priority because the 13 tags are seeded into the DB by migration 0010 — realistic production never hits the empty case. Slow network shows the skeleton naturally.

**Independent Test**: Mock `getKudoHashtags()` to return `[]` → assert "Chưa có hashtag" text renders. Mock a slow response → assert skeleton renders.

**Acceptance Scenarios**:

1. **Given** `getKudoHashtags()` is still pending, **When** the picker opens, **Then** a skeleton row shimmer (3 rows, same height as real rows) renders inside the panel.
2. **Given** `getKudoHashtags()` returns `[]`, **When** the picker opens, **Then** a single "Chưa có hashtag" message renders inside the panel (grey text centred).
3. **Given** `getKudoHashtags()` throws (parent surfaces this via `loadError` prop), **When** the picker opens, **Then** an inline "Không tải được hashtag." message with a "Thử lại" button renders. Clicking Retry fires the `onRetry` callback (parent re-invokes the Server Action and updates `options` / `loadError` accordingly).

---

### Edge Cases

- **Duplicate clicks on the same row** (rapid double-click): toggle fires exactly once per user-visible click; debounce not required because the state flip is synchronous.
- **Picker opens while parent's hashtag data is still loading**: Per US4 — skeleton state until data arrives; user can't select until then.
- **Locale changes while picker is open** (user switches VN ↔ EN via header): The picker's labels re-render on next parent re-render because `getKudoHashtags()` is already locale-aware. Does NOT require closing + reopening the picker.
- **Parent unmounts the picker** (Viết Kudo closes): picker cleans up naturally via React unmount. No extra logic needed.
- **Scroll overflow**: 13 hashtags × 40 px each = 520 px. Panel is tall but fits ≥ 640 px viewports. If viewport shorter, panel MUST scroll internally (`overflow-y-auto` with `max-h-[calc(100vh-200px)]`). No change to parent page scrolling.
- **Outside-click that lands inside the "+ Hashtag" trigger**: The trigger is OUTSIDE the picker panel's ref. Outside-click detection closes the picker; the trigger's own click handler then tries to open it again. Net effect: picker appears to stay open (toggle close + toggle open). Fix: scope outside-click detection to exclude the trigger element — use a combined ref (picker panel + trigger) just like `LanguageToggle` does.
- **Reduced-motion preference**: No fade/scale entry animation — skip the 150 ms fade OR wrap in `motion-safe:`.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Ref | Component | Node ID (Figma) | Description | Interactions |
|---|---|---|---|---|
| 1 | Trigger "+ Hashtag" button (**owned by Viết Kudo spec**, listed here for context only) | `1002:15114` + `1002:15115` | 116 × 48, white bg, 1 px gold border, 8 px radius, "+ Hashtag" + sub "Tối đa 5" text | Click → opens the picker (this spec owns picker behaviour only; trigger visuals live in Viết Kudo's design-style.md §E) |
| 2 | Picker panel | `1002:13102` | 318 × ~330, `#00070C` bg, 1 px gold border, 8 px radius, 6 px padding, absolute-positioned below trigger | Hosts the list rows; closes on outside click + Esc + Tab-out |
| 3 | Selected row (3 Figma instances: A `1002:13185`, B `1002:13207`, C `1002:13216`) | `1002:13185` / `1002:13207` / `1002:13216` | 306 × 40 (desktop) / 306 × 44 (mobile, per WCAG 2.2 touch-target), `rgba(255,234,158,0.20)` bg, 2 px inner radius, hashtag label on left + ✓ check icon on right | Click → toggle off (deselect); stay open |
| 4 | Unselected row (5 Figma instances reusing component `490:5562`) | `1002:13104`, `1002:13131`, `1002:13137`, `1002:13151`, `1002:13227` | 306 × 40 (desktop) / 306 × 44 (mobile), transparent bg, hashtag label on left only (no icon on right) | Click → toggle on (select); stay open. Blocked if 5-cap reached (US2). |
| 5 | ✓ check icon (Figma component `1002:13201` — set `178:1020`) | `1002:13204`, `1002:13214`, `1002:13223` (per-row instances) | 24 × 24 on right edge of selected rows | Decorative — click bubbles to the row, not the icon |

### Navigation Flow

- **From**: Click on "+ Hashtag" button inside Viết Kudo modal (parent spec `ihQ26W78P2`, FR-009). Click on trigger while picker is open re-closes it (toggle).
- **To**: Picker has NO internal navigation. Closes via:
  - Outside click (scoped to exclude the trigger button — see Edge Cases)
  - Esc key
  - Tab leaving the panel (US3 AC5, same pattern as LanguageDropdown T204)
  - Parent unmounting the picker (Viết Kudo closes)
- **Triggers**: Click, Enter/Space on trigger (keyboard), ↑/↓/Enter/Space/Esc/Tab inside picker

### Visual Requirements

- **Responsive breakpoints**: Panel width fixed at 318 px on all breakpoints (small enough to fit). If parent modal becomes full-screen on mobile, picker anchors to the trigger's position within the modal; no special mobile-sheet variant.
- **Animations**: 150 ms opacity + 4 px translateY entry. Wrapped in `motion-safe:`.
- **Accessibility**:
  - `role="listbox"` on the `<ul>` panel with `aria-multiselectable="true"`
  - `role="option"` on each row with `aria-selected` mirroring selection state
  - `aria-label` on the panel: "Chọn hashtag"
  - Focus-visible ring: 2 px cream, offset 2 px (match dark-navy sibling family)
  - Row height: 40 px on desktop (matches Figma) / **44 px on mobile** (Tailwind `h-10 sm:h-11` — up from `h-10`). Constitution §II mandates 44 × 44 minimum touch targets on mobile; this is a hard rule, not a waiver, even for desktop-first apps. The 4 px bump diverges from Figma on mobile only — acceptable trade-off to honour constitution.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The picker MUST open in response to (a) click on the "+ Hashtag" trigger, (b) Enter/Space on the focused trigger, and MUST close in response to (c) outside click (scope: exclude the trigger), (d) Esc, (e) Tab leaving the last focusable row.
- **FR-002**: The picker MUST render all options returned by `getKudoHashtags()` — the Server Action already ships locale-aware labels (migration 0010). Options appear in the order the Server Action returns.
- **FR-003**: Each row MUST be `role="option"` with `aria-selected={slug ∈ hashtagSlugs}`. Click on a row MUST toggle the slug in the parent-owned `hashtagSlugs` array via an `onToggle(slug: string)` callback.
- **FR-004**: Selected rows MUST render the cream @ 20 % background (`bg-[var(--color-accent-cream)]/20`) + the ✓ check icon on the right. Unselected rows MUST render with transparent background and NO right icon.
- **FR-005**: When `hashtagSlugs.length === 5`, clicks on unselected rows MUST be no-ops (no callback fired). Clicks on selected rows (deselect) MUST continue to work unimpeded.
- **FR-006**: The picker MUST NOT close on a row click (unlike the LanguageDropdown which closes-on-select). The user MUST close via outside click / Esc / Tab.
- **FR-007**: Keyboard: ↓ / ↑ cycle (wrap); Enter / Space toggle the focused row; Esc closes with focus returning to the `triggerRef.current` element (required prop — see TR-001); Tab leaves + closes. ← / → have no binding inside the picker. Implementation uses **roving tabindex**: each `<li role="option">` has `tabindex="-1"` by default; the currently-focused option has `tabindex="0"` and `.focus()` is called imperatively on arrow navigation. The `<ul role="listbox">` itself is NOT in the tab sequence. The `onKeyDown` handler lives on the `<ul>` element (key events bubble up from the focused `<li>`), handling Arrow/Enter/Space/Esc/Tab centrally — same pattern as `LanguageDropdown.handleKey`.
- **FR-008**: On open, keyboard focus MUST land on (a) the first selected row if any selections exist, (b) the first row otherwise (matches WAI-ARIA 1.2 listbox guidance — "If none of the options are selected before the listbox receives focus, focus is set on the first option and the first option is the initial active option").
- **FR-009**: Data fetch — the parent MUST pre-fetch `getKudoHashtags()` and pass the `HashtagOption[]` as a prop. The picker does NOT call the Server Action itself. This keeps the picker a pure UI component and lets the parent cache / share the list with the hashtag-chip renderer.
- **FR-010**: Visual family — the picker MUST use the exact same tokens as `FilterDropdown` (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`, plus the 150 ms motion token). Zero new design tokens.

### Technical Requirements

- **TR-001 (Composition)**: The picker is a new client component at `src/components/kudos/HashtagPicker.tsx` (sibling of `FilterDropdown`). Prop surface:
  ```ts
  type HashtagPickerProps = {
    options: HashtagOption[] | undefined;  // undefined = loading skeleton (US4 AC1)
    selectedSlugs: string[];               // parent-owned state (0..5)
    maxSelections?: number;                // default 5
    loadError?: Error | null;              // non-null => render error state (US4 AC3)
    onToggle: (slug: string) => void;      // parent updates state
    onClose: () => void;                   // outside click / Esc / Tab-out
    onRetry?: () => void;                  // parent re-invokes getKudoHashtags on Retry click
    triggerRef: React.RefObject<HTMLElement | null>; // REQUIRED — for outside-click exclusion + Esc focus-return (FR-007)
  };
  ```
  `triggerRef` is required (not optional) because Esc close + outside-click exclusion both need it. Unit tests in isolation pass a `{ current: null }` ref — the picker's outside-click guard handles `null` gracefully (closes on any outside click when no trigger is registered).
- **TR-002 (No new Server Action)**: Reuse existing `getKudoHashtags()` from `src/app/kudos/actions.ts`. No new DB reads introduced.
- **TR-003 (Outside-click listener)**: Attach to `window` (NOT `document`) — iOS Safari tap-delegation fix, same as `FilterDropdown` + `LanguageToggle` precedent. Listener checks that the click target is NOT inside the panel AND NOT inside the `triggerRef.current` element before firing `onClose()`.
- **TR-004 (Accessibility semantics)**: `role="listbox"` + `aria-multiselectable="true"` on `<ul>`; `role="option"` + `aria-selected` on each `<li>` (NOT `aria-checked` since this is a listbox not a group of checkboxes).
- **TR-005 (No new design tokens)**: Zero additions to globals.css. All colours pull from existing variables (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`).

### Key Entities

- **Hashtag** (`hashtags` table, migration 0010 localised with `label_vi` + `label_en`). Read-only via `getKudoHashtags()`.
- **HashtagOption** (in-memory TypeScript type, defined in `src/types/kudo.ts`): `{ slug: string; label: string }` — label is locale-resolved by the Server Action at fetch time.

### State Management

| Layer | State | Owner | Lifetime |
|-------|-------|-------|----------|
| **Local (open)** | `open: boolean` | Parent `<HashtagField>` wrapper inside Viết Kudo | Until Viết Kudo unmounts or picker closed |
| **Local (focus)** | Active DOM focus within picker | `HashtagPicker` via imperative `.focus()` + arrow-key cycling | While picker is open |
| **Prop-driven (options)** | `HashtagOption[]` | Viết Kudo modal (pre-fetched from `getKudoHashtags()`) | Per Viết Kudo render |
| **Prop-driven (selection)** | `selectedSlugs: string[]` | Viết Kudo modal form state | Until submit / cancel |
| **No persisted state** | — | — | Selection lives only in parent form until kudo is submitted (then goes to `kudo_hashtags` table) |

---

## API Dependencies

| Endpoint / Action | Method | Purpose | Status |
|---|---|---|---|
| `getKudoHashtags` | Server Action (exists) | Return `HashtagOption[]` with locale-resolved labels | **EXISTS** — `src/app/kudos/actions.ts` (shipped with Kudos Live board + Hashtag filter) |

No new APIs.

---

## Success Criteria *(mandatory)*

- **SC-001**: All 13 hashtags from migration 0010 render in the picker — verified by a single integration test that mocks `getKudoHashtags()` to return all 13 and asserts 13 `role="option"` elements appear.
- **SC-002**: 5-cap enforcement: clicking a 6th unselected row fires zero callbacks — verified by a unit test with `selectedSlugs.length === 5` and `fireEvent.click` on an unselected row.
- **SC-003**: Keyboard parity: Enter / Space on a row toggles selection without closing the picker — verified by 2 unit tests (one for Enter, one for Space).
- **SC-004**: Visual regression: panel + selected row + unselected row match `assets/frame.png` — manual comparison during implementation.
- **SC-005**: Axe-core: zero violations when picker is open inside Viết Kudo modal.

---

## Out of Scope

- **Search / filter inside the picker** — the 13 tags fit in a ~520 px panel; no search needed for MVP. If the list grows beyond 20+ tags, add a search input at the top (Phase 2).
- **Hashtag creation / "Add new hashtag"** — hashtags are a closed set managed by Admin (out of scope for Viết Kudo).
- **Sort / group by category** — order is whatever `getKudoHashtags()` returns (DB order by `slug`, per migration 0010).
- **Recent / favourite hashtags** — all tags shown in a single flat list.
- **Picker as a standalone route** — this is ALWAYS rendered inside Viết Kudo; never navigated-to directly.
- **Persistent selection across modal open/close cycles** — opening Viết Kudo fresh starts at `selectedSlugs = []`.

---

## Dependencies

- [x] Constitution document exists
- [x] `getKudoHashtags` Server Action ships in production
- [x] 13 hashtags seeded via migration 0010
- [x] Dark-navy visual family tokens (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`) exist in globals.css
- [x] `Icon` registry — `check` icon already exists (used on CopyLinkButton) — reuse for ✓
- [x] Parent spec `ihQ26W78P2-viet-kudo` authored
- [ ] **Depends on parent** — Viết Kudo plan must add `--color-error` to globals.css (used by this picker's error state). If this picker ships before Viết Kudo's token addition, fall back to literal `text-red-400` (flagged in design-style.md error-state note).
- [ ] **NEW**: `src/components/kudos/HashtagPicker.tsx` component to be written
- [ ] **NEW**: `HashtagPicker.spec.tsx` unit tests
- [x] SCREENFLOW tracker — row #11 flipped from ⚪ pending to 📋 spec'd on 2026-04-21 (done during spec authoring)

---

## Notes

**Relationship to `FilterDropdown`**: The Hashtag filter on the Live board is **single-select** (pick ONE hashtag to filter the feed) and was implemented as a combobox (`role="combobox"` + `aria-haspopup="listbox"`). This compose-time picker is **multi-select** (pick up to 5 tags to tag the kudo) and is implemented as a standalone listbox (`role="listbox"` + `aria-multiselectable`). Different ARIA roles despite similar visuals. Do NOT extract a shared primitive yet — the prop surfaces diverge meaningfully.

**Figma label discrepancy**: The Figma frame shows placeholder English hashtag labels ("#High-perorming", "#BE PROFESSIONAL", "#BE A TEAM", etc.) and the annotation lists Vietnamese names ("Toàn diện", "Giỏi chuyên môn", etc.). The **real list** is the 13 tags in migration 0010 with locale-aware labels (`getKudoHashtags()` returns them). Implementation MUST ignore the Figma placeholder labels and trust the Server Action output.

**5-cap duplication between parent and picker**: Both Viết Kudo and the picker enforce the cap. Picker enforces at UI-click level (FR-005); parent enforces by hiding the "+ Hashtag" button when 5 reached (Viết Kudo FR-009 — trigger disappears). The picker's cap check is defence-in-depth — if keyboard somehow reopens the picker at 5, no 6th selection can sneak in.

**Trigger visuals are owned by parent spec**: This spec documents the trigger for context (Screen Components row A) but does NOT define its styling or behaviour — that lives in Viết Kudo's design-style.md (E.1 + Hashtag field section). This spec only owns the panel, rows, and picker behaviour.
