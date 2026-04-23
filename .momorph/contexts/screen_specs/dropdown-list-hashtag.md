# Screen: Dropdown list hashtag (Compose-time hashtag picker)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `p9zO-c4a4x` (node `1002:13013`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/p9zO-c4a4x |
| **Screen Group** | Viết Kudo overlays |
| **Status** | discovered |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

**Multi-select popover** that opens below the "+ Hashtag" button inside
the [Viết Kudo modal](./viet-kudo.md) (`ihQ26W78P2`). Shows the full
13-tag list from `getKudoHashtags()` (migration 0010); the user toggles
rows on/off by clicking them. Selected rows render with cream-tint fill
(`--color-accent-cream @ 20%`) plus a white ✓ icon on the right.

**Key difference vs. the Live-board FilterDropdown**: this picker is
**multi-select** (commit ≤ 5 tags per kudo), not single-select +
toggle-off. Row click = toggle, not close. The picker stays open while
the user is picking — closes only on outside click / `Esc` / `Tab`-out
or parent unmount.

Enforces the **5-tag cap**: when `selectedSlugs.length === 5`, unselected
rows render `aria-disabled="true"` + `opacity-50` + `cursor-not-allowed`
and clicks are no-ops. Selected rows remain toggleable (deselect works
at cap).

Member of the dark-navy panel family (same tokens as hashtag/department
filters and language dropdown) — zero new design tokens.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Viết Kudo (`ihQ26W78P2`) | Click "+ Hashtag" button | `selectedSlugs.length < 5` (trigger hidden at cap) |
| Viết Kudo | Keyboard `Enter` / `Space` on focused trigger | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Viết Kudo (parent, state mutated) | Row click / `Enter` / `Space` | `1002:13185` / `1002:13207` / `1002:13216` (selected); `1002:13104`-`:13227` (unselected) | High | Fires `onToggle(slug)` — parent adds/removes slug |
| Viết Kudo (parent, picker closed) | Outside click / `Esc` / `Tab` past last row / parent unmount | — | High | `onClose()` callback |

### Navigation Rules

- **Back behavior**: N/A — overlay, no history.
- **Deep link support**: No — always embedded in Viết Kudo.
- **Auth required**: Inherits Viết Kudo's session gate.

---

## Component Schema

### Layout Structure

```
 [Trigger: + Hashtag]  ← owned by Viết Kudo
       │
       ▼
 ┌───────────────────────────────┐
 │  Dark-navy panel              │
 │ ┌───────────────────────────┐ │
 │ │ #Cống hiến             ✓ │ │  ← selected (cream/20 + ✓)
 │ │ #Wasshoi                 │ │
 │ │ #Truyền cảm hứng         │ │
 │ │ #Aim High                │ │
 │ │ …13 total                │ │
 │ └───────────────────────────┘ │
 └───────────────────────────────┘
```

### Component Hierarchy

```
HashtagPicker (Client — src/components/kudos/HashtagPicker.tsx)
└── ul role="listbox" aria-multiselectable="true" aria-label="Chọn hashtag"
    └── li role="option" aria-selected × N
        ├── "#<label>" text (locale-resolved, Montserrat 16/24/700)
        └── ✓ check icon (only when aria-selected="true")
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Panel | Organism | `1002:13102` | 318 × ~330, navy `#00070C`, cream 1 px border, radius 8, padding 6 | No |
| Selected row | Molecule | `1002:13185` / `:13207` / `:13216` | 306 × 40 (desktop) / 306 × 44 (mobile), bg cream/20, label + right ✓ | Yes (across picker rows) |
| Unselected row | Molecule | `1002:13104` / `:13131` / `:13137` / `:13151` / `:13227` | 306 × 40 / 306 × 44, transparent bg, label only | Yes |
| ✓ check icon | Atom | component `1002:13201` (set `178:1020`) | 24 × 24 right edge | Yes (reuse existing `check` icon) |

---

## Form Fields

N/A — list toggles; no input fields.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `getKudoHashtags()` (`src/app/kudos/actions.ts:641`) | Server Action (parent pre-fetches) | 13 `{ slug, label }` with locale-resolved labels | Parent passes as `options` prop; picker is pure UI |

DB tables read: `hashtags` (migration 0010).

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click unselected row (< 5 picked) | `onToggle(slug)` prop | — | — | Parent adds `slug` to `hashtagSlugs` |
| Click selected row | `onToggle(slug)` prop | — | — | Parent removes `slug` |
| Click unselected row (5 picked) | — | — | — | **No-op** (aria-disabled) |
| Outside click / Esc / Tab-out | `onClose()` prop | — | — | Parent hides picker |
| Retry (load error) | `onRetry()` prop | — | — | Parent re-invokes `getKudoHashtags` + updates `options` |

No new API endpoints — the picker is a child UI component.

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| `options === undefined` | — | Render 3-row skeleton shimmer |
| `options === []` | "Chưa có hashtag" | Centred grey message |
| `loadError !== null` | "Không tải được hashtag. Thử lại" | Inline + Retry button → `onRetry()` |

---

## State Management

### Local (open)
- `open: boolean` — owned by parent `HashtagField` wrapper inside Viết Kudo.

### Local (focus)
- Roving tabindex — focused `<li>` has `tabindex="0"`; arrow keys move
  imperative `.focus()`. `onKeyDown` handler on `<ul>` centralises
  Arrow / Enter / Space / Esc / Tab handling.

### Prop-driven

| Prop | Source | Purpose |
|------|--------|---------|
| `options: HashtagOption[] \| undefined` | Viết Kudo (pre-fetched) | List to render; `undefined` = loading |
| `selectedSlugs: string[]` | Viết Kudo form state | 0..5 chosen |
| `maxSelections` | default 5 | Cap |
| `loadError` | Viết Kudo | Drives error state |
| `onToggle` / `onClose` / `onRetry` | Viết Kudo callbacks | — |
| `triggerRef: RefObject<HTMLElement \| null>` (**required**) | Viết Kudo | For outside-click exclusion + Esc focus-return |

No persisted state — selection lives only in parent form until `createKudo`.

---

## UI States

### Loading
- 3 skeleton rows inside the panel (same height as real rows).

### Error
- Inline "Không tải được hashtag." + Retry button.

### Empty
- "Chưa có hashtag" centred grey — shouldn't happen with 13 seeded tags.

### Default / selected
- Per FR-004: selected = cream/20 bg + ✓; unselected = transparent + no icon.

### 5-cap reached
- Unselected rows: `aria-disabled="true"` + `opacity-50` + `cursor-not-allowed`.
- Selected rows: remain toggleable.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA | `<ul role="listbox" aria-multiselectable="true">`; `<li role="option" aria-selected>` — NOT `aria-checked` |
| Panel label | `aria-label="Chọn hashtag"` |
| Keyboard | Enter/Space on trigger opens + focuses first selected (or first row); ↓/↑ cycle with wrap; Enter/Space toggles (does NOT close); Esc closes + focus returns to `triggerRef`; Tab leaves + closes |
| Focus ring | 2 px cream + 2 px offset (dark-navy family) |
| Touch target | 40 px desktop / **44 px mobile** (constitution §II over Figma — acceptable divergence) |
| Reduced motion | Entry fade wrapped `motion-safe:` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | 318 px panel; row height bumps to 44 px (`h-11`) per WCAG 2.2 AA touch-target |
| Tablet (640–1023px) | Same 318 px; 40 px rows |
| Desktop (≥1024px) | Figma baseline |

---

## Analytics Events (Optional)

No picker-specific events — the aggregate `compose_submit` event in
Viết Kudo carries `hashtag_count`.

---

## Design Tokens

Zero new tokens — inherits dark-navy family:

| Token | Usage |
|-------|-------|
| `--color-panel-surface` (`#00070C`) | Panel bg |
| `--color-border-secondary` (`#998C5F`) | 1 px border |
| `--color-accent-cream` (`#FFEA9E`) | Selected row bg @ 20 %; focus ring |
| `--font-montserrat` | Row labels |

---

## Implementation Notes

### Dependencies
- Existing `getKudoHashtags()` Server Action.
- Existing `check` icon in `Icon.tsx` (reused — CopyLinkButton already uses it).
- Parent spec `ihQ26W78P2-viet-kudo` adds `--color-error` to globals.css;
  fallback to literal `text-red-400` if picker ships before that token.

### Special Considerations
- **Roving tabindex** — the `<ul>` itself is NOT in the tab sequence;
  only the focused `<li>` is. Key handler lives on `<ul>` (events bubble
  from focused `<li>`).
- **`triggerRef` required, not optional** — outside-click exclusion +
  Esc focus-return both rely on it. Unit tests pass `{ current: null }`;
  the picker handles that gracefully.
- **5-cap duplication** — Viết Kudo also hides the "+ Hashtag" button at
  cap (FR-009). Picker cap check is defence-in-depth.
- **Figma label discrepancy**: ignore the placeholder English hashtag
  strings in the Figma frame — trust `getKudoHashtags()` output.
- Outside-click listener on `window` (NOT `document`) per iOS-Safari
  precedent.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — spec self-contained |
| Confidence Score | High |

### Next Steps

- [ ] Add optional search input at top of picker if hashtag list grows
      past ~20 rows (Phase 2).
- [ ] Revisit extracting a shared `<DarkNavyPopover>` primitive across
      the 4 sibling overlays.
