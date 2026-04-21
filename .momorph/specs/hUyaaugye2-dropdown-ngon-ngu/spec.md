# Feature Specification: Dropdown-ngôn ngữ (Language dropdown)

**Frame ID**: `hUyaaugye2`
**Frame Name**: `Dropdown-ngôn ngữ`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
**Created**: 2026-04-21
**Status**: Draft
**Related prototype**: [src/components/login/LanguageDropdown.tsx](../../../src/components/login/LanguageDropdown.tsx) — reconcile visual treatment against this spec before shipping.
**Sibling spec**: [WXK5AYB_rG-dropdown-phong-ban](../WXK5AYB_rG-dropdown-phong-ban/spec.md) and [JWpsISMAaM-dropdown-hashtag-filter](../JWpsISMAaM-dropdown-hashtag-filter/spec.md) — three dropdowns share the same dark-navy panel family (same tokens, same motion, same close semantics). Implementing this spec on top of the already-landed `FilterDropdown` primitive is **not** required — the language dropdown ships as its own small popover inside the header `LanguageToggle`, but it MUST match the panel visuals pixel-for-pixel.

---

## Overview

Small popover overlay anchored to the header **Language toggle** button (see `LanguageToggle` in every authenticated screen and on the public `/login` page). Displays two options — **Tiếng Việt** (`vi`) and **English** (`en`) — as stacked rows with a flag glyph and a 2-letter locale code ("VN" / "EN"). Selecting a row persists the locale via the existing `setLocale` Server Action (writes the `NEXT_LOCALE` cookie, revalidates the current layout) and closes the menu. The currently active locale is visually highlighted with a warm cream (`var(--color-accent-cream)`) 20 % fill.

This spec does NOT cover the trigger button (the cream-outlined pill with the flag + "VN/EN" label and chevron) — that surface lives in [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) and is reused across the Login screen + every authenticated screen header. The trigger's own visual spec is currently undocumented (a known gap — will be closed by a future shell-layout spec); this spec leaves the trigger's classes untouched.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch interface language (Priority: P1)

A Sunner reading the Live board in Vietnamese realises the English copy would be clearer for their international teammate reviewing over the shoulder. They click the "VN" pill in the header, see the two-item menu, click "EN", and the full page re-renders in English without a page reload. The choice persists so their next session opens in English.

**Why this priority**: This is the entire reason the dropdown exists. Sun* is a bilingual company — having the wrong locale makes most content unusable for the non-Vietnamese audience. Without this, the `/en` side of every i18n catalog is dead code.

**Independent Test**: Can be verified by opening the dropdown from any authenticated screen (Homepage, Awards, Live board) or the public Login screen, clicking the opposite locale, and asserting (a) the menu closes, (b) server-rendered copy switches language, (c) `NEXT_LOCALE` cookie updates, (d) a hard refresh keeps the new locale.

**Acceptance Scenarios**:

1. **Given** the viewer is on Homepage with `NEXT_LOCALE=vi`, **When** they click the header language pill and select "EN", **Then** the menu closes, the page re-renders with English copy, and the `NEXT_LOCALE` cookie updates to `en` within one second.
2. **Given** the viewer is on Homepage with `NEXT_LOCALE=en`, **When** they click the header language pill, **Then** the menu opens showing two rows ("VN" above "EN") with the "EN" row highlighted (cream @ 20 % fill).
3. **Given** the viewer has switched to `en` via the dropdown, **When** they navigate to `/awards` and then hard-refresh, **Then** the Awards page renders in English.
4. **Given** the viewer is on the public `/login` screen, **When** they use the dropdown to switch locale, **Then** the switch works identically to the authenticated shell (same panel, same persistence).

---

### User Story 2 - Dismiss without changing language (Priority: P1)

The viewer opens the dropdown to check the current language, realises it was already correct, and dismisses the menu by clicking outside, pressing **Esc**, or clicking the trigger again. No analytics event, no cookie write, no revalidation.

**Why this priority**: Over-eager menus that close only on a selection feel hostile on desktop and trap focus for keyboard users. Dismiss-without-select MUST be equally easy as select.

**Independent Test**: Open the dropdown, perform each of the three dismiss actions (outside click, Esc, re-click trigger); each one closes the menu with no network request fired and no cookie change.

**Acceptance Scenarios**:

1. **Given** the dropdown is open, **When** the viewer clicks anywhere outside the panel, **Then** the menu closes and focus returns to the trigger button.
2. **Given** the dropdown is open with keyboard focus inside the menu, **When** the viewer presses **Esc**, **Then** the menu closes and focus returns to the trigger.
3. **Given** the dropdown is open, **When** the viewer clicks the trigger button again, **Then** the menu toggles closed.
4. **Given** the dropdown is open, **When** the viewer clicks the currently-selected row (same locale as active), **Then** the menu closes silently — no Server Action call, no cookie write, no analytics event (guard: re-selecting the active locale is a no-op).

---

### User Story 3 - Keyboard-only navigation (Priority: P2)

A keyboard-only user (screen-reader or motor-impairment accommodation) opens the dropdown with the keyboard, steps through both items with arrow keys, activates a selection with Enter, and never touches the mouse.

**Why this priority**: The project's WCAG 2.2 AA commitment (constitution §Principle II and axe-core CI gate on P1 screens) makes keyboard parity non-negotiable. Because the menu is only two items deep, the keyboard model is simple but it MUST exist.

**Independent Test**: Tab into the trigger, press **Enter** or **↓**, confirm focus lands on the active-locale row; arrow up/down wraps between rows; Enter on a row fires the selection; Esc closes without selection.

**Acceptance Scenarios**:

1. **Given** the trigger has keyboard focus, **When** the user presses **Enter** / **Space** / **↓**, **Then** the menu opens and focus moves to the currently-selected row.
2. **Given** the menu is open and focus is on the first row, **When** the user presses **↓**, **Then** focus moves to the next row; pressing **↑** from the first row wraps to the last row (and vice versa).
3. **Given** focus is on a row, **When** the user presses **Enter** or **Space**, **Then** the locale switches (if different from current) and the menu closes.
4. **Given** the menu is open, **When** the user presses **Tab**, **Then** focus leaves the menu and the menu closes (tab-through exits the popover rather than trapping).

---

### User Story 4 - Prototype ↔ Figma reconciliation (Priority: P2)

A developer picking up this spec sees the existing client prototype in `src/components/login/LanguageDropdown.tsx` and must update it to match the Figma visuals (dark-navy panel, cream highlight, 2-letter locale codes, flag icons for both VN and EN) without breaking the `setLocale` contract that already ships in production.

**Why this priority**: The prototype is already wired into both Login and every authenticated header. Replacing it vs. retro-fitting it materially changes the blast radius of the change. This spec asks for retro-fit (preserve the prop surface) so the PR stays small.

**Independent Test**: Diff `LanguageDropdown.tsx` before + after; assert props (`id`, `currentLocale`, `onSelect`, `onClose`) are unchanged, assert panel classes pick up the Figma tokens (`var(--color-panel-surface)`, `var(--color-border-secondary)`, cream @ 20 %), assert the EN row now shows the Union Jack (`flag-gb`) icon (not the `globe` fallback).

**Acceptance Scenarios**:

1. **Given** the LanguageDropdown prop surface (`id`, `currentLocale`, `onSelect`, `onClose`), **When** the component is refactored against this spec, **Then** the prop names, order, and types MUST remain identical (no breaking change to `LanguageToggle`).
2. **Given** the current `LanguageToggle`'s `useTransition` + `setLocale` wiring, **When** the dropdown is refactored, **Then** the selection handler MUST still return `void` synchronously and delegate the async server call to the caller (no new awaits inside the overlay).

---

### Edge Cases

- **Hard-refresh race during the Server Action**: The viewer clicks "EN" then hits **F5** before the cookie persists. Expected: worst-case the page re-renders in VI (the cookie wasn't written in time); the menu's next open still shows VI highlighted. No crash, no half-state. Acceptance: `setLocale` is idempotent and the cookie write either lands (next render is EN) or it doesn't (next render is VI).
- **Click outside that lands on the trigger button**: The trigger is inside the same ref boundary as the panel — outside-click detection MUST scope to the whole `LanguageToggle` wrapper (existing behaviour, verified in `LanguageToggle.tsx`).
- **Rapid repeated clicks on the same locale**: First click opens the menu; second click on the active-locale row closes without firing `setLocale` (FR-006 guard). No analytics spam from a frustrated user double-clicking.
- **The `globe` fallback icon on the Login page**: Current prototype uses `<Icon name="globe" />` for English because only `flag-vn` was added to the Icon registry. This spec formally requires the `flag-gb` (Union Jack) icon — a net-new asset to the Icon component. See FR-009 for the naming rationale.
- **Server Action transient failure**: `setLocale` is a Next.js Server Action — it cannot realistically "fail" from the client except due to network loss. No toast or error UI is specified; the menu closes optimistically and the page either re-renders in the new locale or the user retries. Acceptance: no error UI is rendered on the dropdown itself.
- **The viewer opens the dropdown on mobile (< 640 px)**: Panel is small enough (~132 × 124 px) that no viewport-edge clipping occurs on a 375 px-wide iPhone SE; the trigger sits in the header which is also compact on mobile. No special mobile layout required.
- **Reduced-motion preference**: The 150 ms fade/scale entry animation (design-style §Motion) MUST respect `prefers-reduced-motion: reduce` and collapse to an instant show/hide.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Description | Interactions |
|-----------|-------------|--------------|
| **`A_Dropdown-List`** (`525:11713`) | The popover panel itself. Dark-navy (`#00070C`) background, 1 px gold (`#998C5F`) border, `border-radius: 8px`, `padding: 6px`, drop shadow below. Anchored below the trigger with an 8 px gap (spec prototype uses `mt-2`). | Hosts two rows. Closes on outside click, **Esc**, or re-click trigger. |
| **`A.1_tiếng Việt`** (`I525:11713;362:6085`) | Selected-state row for Vietnamese. 108 × 56 px. Flag icon (VN national flag, 24 × 24) + label text "VN". Background: `rgba(255, 234, 158, 0.20)` — i.e. `var(--color-accent-cream)` @ 20 %. Border radius 2 px on the inner button, 4 px on the hit target. | `role="menuitemradio"`, `aria-checked="true"` when this is the active locale. Click → `onSelect("vi")`. |
| **`A.2_tiếng Anh`** (`I525:11713;362:6128`) | Unselected-state row for English. Renders at equal width to the VN row (Figma's 110 vs 108 px is a design-tool artefact — see FR-011). Flag icon (Union Jack, `flag-gb` in the Icon registry, 24 × 24) + label text "EN". Background: transparent (panel's `#00070C` shows through). Same radii as the VN row. | `role="menuitemradio"`, `aria-checked="false"` when EN is not the active locale. Click → `onSelect("en")`. Hover: show cream @ 8–10 % overlay (matches the `FilterDropdown` hover token). |

**Label treatment**: Per Figma the visible label is the two-letter locale code (**"VN"** / **"EN"**), *not* the full language name ("Tiếng Việt" / "English"). This diverges from the current prototype and MUST be updated. The full language name is used only as the `aria-label` on the row for screen-reader clarity (FR-010).

### Navigation Flow

- **From**: Header `LanguageToggle` trigger — on the public Login screen (`/login`) and on every authenticated screen (Homepage, Awards, Live board, Thể lệ, future Viết Kudo). The trigger is rendered by [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx).
- **To**:
  - **Select → locale switch + close**: Server Action `setLocale(next)` writes `NEXT_LOCALE` cookie + `revalidatePath("/")`. The current route re-renders in the new locale.
  - **Outside click / Esc / re-click trigger → close**: No navigation, no side effect.
- **Triggers**: Click the header pill (mouse), `Enter` / `Space` / `↓` on the focused trigger (keyboard).

### Visual Requirements

- **Responsive breakpoints**: No layout change across mobile / tablet / desktop — the panel is a fixed size that fits every supported viewport. The trigger pill itself repositions per header layout; the dropdown always anchors to the trigger's right edge (like the existing prototype: `absolute right-0 top-full mt-2`).
- **Animations / Transitions**: 150 ms opacity + 4 px `translateY` entry when opening; mirror for close. Respect `prefers-reduced-motion: reduce` (collapse to instant). Same motion token family as the `FilterDropdown` + `ProfileMenu` popovers.
- **Accessibility**: WCAG 2.2 AA — visible 2 px cream `focus-visible` ring on each row, colour contrast passes comfortably (cream @ 20 % over `#00070C` composites to a very dark tone ≈ `#333425`; white text on that composite is > 12 : 1, well above the 4.5 : 1 threshold — see design-style §Contrast audit), `role="menu"` on the panel, `role="menuitemradio"` with `aria-checked` on each row, keyboard navigation per US3.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dropdown MUST open in response to a click on the header language trigger, **Enter** / **Space** / **↓** on the focused trigger, and toggle closed on a repeated click.
- **FR-002**: The dropdown MUST close in response to (a) selecting any row, (b) clicking outside the panel (outside-click scope = the `LanguageToggle` wrapper, NOT the panel alone), (c) pressing **Esc**, (d) **Tab**-ing past the last row.
- **FR-003**: Rows MUST be labelled using the two-letter locale code ("VN" / "EN") as the visible text, with the full language name ("Tiếng Việt" / "English") set as the `aria-label` on each button.
- **FR-004**: The active locale row MUST receive the selected-state fill (`var(--color-accent-cream)` @ 20 % opacity) and `aria-checked="true"`. The non-active row MUST have transparent background and `aria-checked="false"`.
- **FR-005**: Selecting a row MUST call the existing `setLocale(next)` Server Action and emit a `language_change` analytics event (type already defined in [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts)).
- **FR-006**: Re-selecting the active-locale row (i.e. `next === currentLocale`) MUST be a no-op — no Server Action call, no analytics event, no cookie write; only the menu closes. This prevents spurious revalidation.
- **FR-007**: The menu MUST support keyboard navigation: **↓** / **↑** cycles between the two rows (with wrap), **Enter** / **Space** activates the focused row, **Esc** closes, **Tab** closes and moves focus out.
- **FR-008**: On open, keyboard focus MUST move to the currently-selected row (so screen-reader users hear "VN, selected, 1 of 2" immediately). This matches the current prototype. If `currentLocale` is somehow not in `SUPPORTED_LOCALES` (defensive-programming fallback, should never fire in production), focus the first row instead.
- **FR-009**: The EN row MUST render the Union Jack (British flag) glyph, not the existing `globe` fallback. A new **`flag-gb`** entry MUST be added to [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx) during implementation. **Naming rationale**: the Figma asset is labelled "GB-NIR - Northern Ireland" but the rendered glyph is the standard Union Jack (St George + St Andrew + St Patrick crosses visible in the node tree — see `I525:11713;362:6128;186:1903;186:1709`). We normalise to `flag-gb` in the Icon registry to avoid the misleading "NIR" suffix. The icon size is `24 × 24`, matching the existing `flag-vn` token.
- **FR-010**: Each row MUST expose its full language name to assistive tech via `aria-label`; the visible "VN" / "EN" text MUST be `aria-hidden="true"` or wrapped such that the aria-label takes precedence.
- **FR-011**: The panel width MUST hug its content (≈ 120 px: widest row + 12 px of panel padding) and MUST NOT stretch to the width of the trigger. Right-edge alignment with the trigger is preserved via `absolute right-0`. Both rows MUST render at identical width inside the panel (use `w-full` on the button element + `w-fit` on the panel). The 108 vs 110 px asymmetry in the Figma frame is a design-tool artefact — equal-width rows are the implementation contract.
- **FR-012**: The prop surface of the underlying `LanguageDropdown` component MUST remain backwards-compatible: `{ id, currentLocale, onSelect, onClose }`, all required, same types (`Locale` = `"vi" | "en"`).
- **FR-013**: The menu MUST close optimistically on selection — the Server Action's `useTransition` pending state MUST NOT be surfaced as a spinner, disabled row, or other loading indicator inside the dropdown. The page-level re-render (driven by `revalidatePath("/")`) is the user-visible confirmation.

### Technical Requirements

- **TR-001 (Performance)**: The menu MUST paint within one frame (< 16 ms) of the trigger click — it's a pure-client overlay with no network I/O at open time. The Server Action call only fires after a selection.
- **TR-002 (Persistence)**: Locale persistence MUST use the existing `setLocale` Server Action (writes the `NEXT_LOCALE` cookie with `maxAge = 1 year`, path `/`, sameSite `lax`). No client-side `localStorage` fallback — the cookie is the single source of truth so SSR reads the same value.
- **TR-003 (Integration)**: The revalidation side-effect (`revalidatePath("/")`) is owned by `setLocale` and MUST NOT be duplicated in the client. The client's only job post-selection is to call the Server Action and optionally wrap it in `useTransition` for a non-blocking UI (existing pattern in `LanguageToggle.tsx`).
- **TR-004 (iOS Safari + overlay event listeners)**: Outside-click detection SHOULD attach its listener to `window` not `document` to avoid iOS Safari's tap-delegation bug (same pattern we enforced in `FilterDropdown`). This spec inherits that rule from the Hashtag/Department sibling specs.
- **TR-005 (Icon registry)**: Adding the new `flag-gb` icon MUST reuse the existing SVG-in-React pattern of `src/components/ui/Icon.tsx` (no new `<img>` tags, no `next/image` — see constitution design-style "All icons MUST be in the Icon Component").

### Key Entities *(if feature involves data)*

- **Locale**: `"vi" | "en"` — the union type defined in [src/types/auth.ts](../../../src/types/auth.ts). `SUPPORTED_LOCALES = ["vi", "en"]` and `DEFAULT_LOCALE = "vi"`. No database entity; the locale lives entirely in a cookie.

### State Management

The dropdown owns very little state itself — most of the state-of-interest lives in the parent `LanguageToggle` trigger or in the server cookie. Distinguish three layers:

| Layer | State | Owner | Lifetime |
|-------|-------|-------|----------|
| **Local (overlay)** | `open: boolean` — is the panel rendered? | `LanguageToggle` wrapper (existing `useState(false)`) | Until trigger click / outside click / Esc / select |
| **Local (focus)** | Active DOM focus within the menu | The `<ul>` via imperative `.focus()` on mount (existing prototype pattern) | While the menu is open |
| **Prop-driven** | `currentLocale: Locale` (props `vi` / `en`) | Caller (parent layout / page) — sourced from the cookie via `getMessages()` on the server | Per render |
| **Pending (transient)** | `useTransition` isPending after a select | `LanguageToggle` (existing `useTransition` call site) | Duration of the Server Action round-trip |
| **Persisted (server)** | `NEXT_LOCALE` cookie | Server, written by `setLocale` Server Action | 1 year (`maxAge`) |

**No global state store, no cache**: React hooks only (constitution §III — "Client state = React hooks only, no global store"). No `localStorage`, no `useContext`, no data fetcher. Loading / error states deliberately **do not exist** inside the dropdown UI — per FR-013 the menu closes optimistically and the page re-render is the confirmation. If the Server Action throws (realistically only from network loss), the cookie is not updated and the next page render continues in the old locale; no toast / inline error is shown by this component.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `setLocale` Server Action | Server Action (no HTTP method) | Write `NEXT_LOCALE` cookie + `revalidatePath("/")` | **Exists** — `src/libs/i18n/setLocale.ts` |

No new endpoints. No Supabase tables involved.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % of spec-defined rows render per the Figma tokens (gold border, dark-navy fill, cream @ 20 % selected, Montserrat 16 / 700 / 24). Verified by visual-regression test against `assets/frame.png`.
- **SC-002**: Menu dismissal works for all four paths (select, outside click, Esc, Tab-out) — measured by unit tests covering each path.
- **SC-003**: Re-selecting the active locale fires **zero** analytics events and **zero** Server Action calls (FR-006). Verified by an integration test that spies on both.
- **SC-004**: Axe-core sweep on the opened dropdown returns zero violations on P1 screens (Homepage, Login).

---

## Out of Scope

- **Trigger button redesign** — the pill-shaped language toggle with flag + chevron lives in [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) and is shared across all headers (public Login + every authenticated screen). Its visual spec is currently undocumented (a known gap — will be closed when a future shell-layout spec is drafted). This spec changes only the overlay panel; the trigger pill's classes stay untouched.
- **Language persistence across devices** — out of scope; cookie scope is browser-only. A server-side user-profile language preference is a Phase 2 concern.
- **A third locale** (e.g. Japanese for global teammates) — out of scope. `SUPPORTED_LOCALES` is a closed set of two.
- **Animation of the flag icons** on selection — the 150 ms fade/scale is only the panel transition, not the flag itself.
- **Mobile-specific bottom-sheet variant** — even on mobile the menu opens as the small 120 × 124 px popover. There is no tray / bottom-sheet alternate layout.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] `setLocale` Server Action (`src/libs/i18n/setLocale.ts`) — ships in production
- [x] `LanguageToggle` trigger (`src/components/layout/LanguageToggle.tsx`) — ships in production
- [x] `LanguageDropdown` prototype (`src/components/login/LanguageDropdown.tsx`) — the component this spec reconciles against
- [x] `Icon` registry (`src/components/ui/Icon.tsx`) — **needs update**: add `flag-gb` glyph (see FR-009)
- [x] Screen flow tracker (`.momorph/contexts/screen_specs/SCREENFLOW.md`) — row #8 already flipped from 🔵 prototype to 📋 spec'd on 2026-04-21 as part of this spec pipeline

---

## Notes

**Sibling relationship to the Live-board filter dropdowns**: Three popovers now share the same visual family — Hashtag filter (`JWpsISMAaM`), Department filter (`WXK5AYB_rG`), and this Language dropdown (`hUyaaugye2`). All three use `--color-panel-surface` / `--color-border-secondary` / `--color-accent-cream` tokens. The Hashtag + Department filters share the `FilterDropdown` primitive; the Language dropdown does **not** reuse that primitive because its prop surface is simpler (binary locale vs. n-item filter list) and its anchor lives in the header (not the filter bar). Extracting a common `<DarkNavyPopover>` primitive across all three is a reasonable refactor but **explicitly out of scope for this spec** — first fix the Language dropdown, then consider the refactor in a follow-up.

**Why the panel width hugs content**: The Figma frame shows the panel at ~120 px wide — narrower than the trigger pill (~140 px including chevron). The design choice is deliberate: the menu is a small utility overlay, not a full-width selector. Implementation should use `w-fit` or a fixed `w-[120px]`, aligned to `right-0` against the trigger so the right edge lines up cleanly with the chevron.
