# Screen: Dropdown Hashtag filter

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `JWpsISMAaM` (wrapper `721:5580` / panel `563:8026`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JWpsISMAaM |
| **Screen Group** | Kudos Live board overlays |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

**Popover dropdown** anchored to the *Hashtag* chip in the Live board's
`FilterBar` (`/kudos`). Lists all active hashtags from the `hashtags` table
(13 canonical Q4-2025 tags per migration 0010). Selecting a tag narrows the
**All Kudos feed**, **HIGHLIGHT carousel**, and **SPOTLIGHT board** in one
shot by writing `?hashtag=<slug>` to the URL via `router.replace()`.

The panel is **not a route** — it's a floating popover anchored to the chip,
dismissable via outside click / `Esc` / chip re-click / selection. Mutually
exclusive with the sibling [Bộ phận dropdown](./dropdown-phong-ban.md) —
opening one closes the other. Shares the dark-navy panel visual family with
the department filter, language dropdown, and hashtag picker.

Implementation lives in `src/components/kudos/FilterDropdown.tsx` (generic,
used by both hashtag + department variants via a `kind` prop).

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Kudos Live board (`MaZUn5xHXZ`) | Click **Hashtag** chip in `FilterBar` | Authenticated; hashtag list non-empty |
| Kudos Live board | Keyboard `Enter` / `Space` on focused chip | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| `/kudos?hashtag=<slug>` (same page) | Row click / `Enter` on option | Items in panel `563:8026` | High | `router.replace()` with `{ scroll: false }` — no history entry |
| `/kudos` (filter cleared) | Click selected row (toggle-off) | Same | High | `updateParam("hashtag", null)` |
| Kudos Live board (unchanged URL) | Outside click / `Esc` / chip re-click | — | High | Dismiss without mutation |

### Navigation Rules

- **Back behavior**: The dropdown is a popover — no history entry. Browser Back
  on the underlying `/kudos` page returns to previous `?hashtag=` value.
- **Deep link support**: The resulting filtered page is shareable via
  `/kudos?hashtag=<slug>`; the popover itself is not deep-linked.
- **Auth required**: Yes — inherits `/kudos` session gate.

---

## Component Schema

### Layout Structure

```
              FilterBar
┌───────────────────────┐
│ [Hashtag ▾] [Bộ phận ▾]│
└─────┬─────────────────┘
      │  opens popover
      ▼
┌───────────────────────┐
│ Dark-navy panel       │
│ ┌───────────────────┐ │
│ │ #Toàn diện        │ │  ← row, hover = cream/8
│ │ #Cống hiến      ✓ │ │  ← selected = cream/10 + glow
│ │ #Wasshoi          │ │
│ │ …13 total         │ │
│ └───────────────────┘ │
└───────────────────────┘
```

### Component Hierarchy

```
FilterBar (Client)
├── HashtagChip (aria-haspopup="listbox")
└── FilterDropdown kind="hashtag" (popover)
    └── ul role="listbox"
        └── li role="option" × N
            └── "#<label>" text (locale-resolved)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| HashtagChip | Atom | — | Trigger in `FilterBar.tsx` | Yes |
| Dropdown panel | Organism | `563:8026` | 215 × hug, navy `#00070C`, cream 1 px border, radius 8, padding 6 | Yes — shared with Department |
| Option row | Molecule | — | 56 px tall, Montserrat 16/24/700 white, radius 4, padding 16 | Yes |
| Selected row | Molecule | — | Same + `bg rgba(255,234,158,0.10)` + text-shadow glow `0 0 6px #FAE287` | Yes |
| Active-filter chip | Molecule | — | Cream pill below FilterBar with `#<Label>` + ✕; owned by `<ActiveChip>` in `FilterBar.tsx` | Yes |

---

## Form Fields

N/A — single-select listbox; no input fields.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `getKudoHashtags()` Server Action (`src/app/kudos/actions.ts`) | RSC | Return 13 localised `{ slug, label }` rows ordered by locale label | Pre-fetched by `/kudos` Server Component and passed as prop; dropdown is a pure client consumer |

DB tables read: `hashtags` (migration 0010 — `slug`, `label_vi`, `label_en`).

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Select hashtag | URL update via `router.replace()` | client nav | — | `?hashtag=<slug>` → `getKudoFeed({ hashtag })`, `getHighlightKudos({ hashtag })`, `getSpotlight({ hashtag })` re-fetch server-side |
| Toggle-off (click selected) | Same | client nav | — | `?hashtag` removed from URL |
| Retry after load error | `onRetry` callback → re-invoke `getKudoHashtags()` | — | — | Refreshes `options` prop |

No new mutations — the dropdown is a filter trigger only.

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| `getKudoHashtags()` throws | — | Chip disabled (`aria-disabled`); "Không tải được — Thử lại" inline under chip |
| Empty list | — | Chip disabled (FR-007); dropdown does not open |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `isOpen` | boolean | `false` | Panel visibility |
| `focusIndex` | number | -1 | Roving tabindex cursor for keyboard nav |

### URL-derived State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| Active hashtag | `searchParams.hashtag` | Read (SSR) / Write (client via `router.replace()`) | Drives feed/carousel/spotlight filters |
| `FilterState.hashtag` | `src/types/kudo.ts` | Read | Existing contract consumed by `getKudoFeed` |

---

## UI States

### Loading State
- Chip shows skeleton shimmer until `getKudoHashtags()` resolves (handled by parent `/kudos` Server Component).

### Error State
- Chip disabled + inline retry banner ("Không tải được — Thử lại").

### Success State
- Panel opens on trigger click; selection applies filter and closes panel.

### Empty State
- Chip disabled; panel never opens (FR-007). Inline listbox empty message `filters.emptyList` reserved for mid-session data race.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA roles | `role="listbox"` on `<ul>`; `role="option"` + `aria-selected` on each `<li>` |
| Trigger state | Chip: `aria-haspopup="listbox"` + `aria-expanded` + `aria-controls` |
| Keyboard open | `Enter` / `Space` on chip opens + focuses selected row (or first) |
| Keyboard nav | ↓ / ↑ cycle with wrap; `Home` / `End` jump; `Enter` commits; `Esc` closes + returns focus to chip |
| Focus ring | 2 px cream + 2 px offset on `:focus-visible` |
| Contrast | White on `#00070C` = 20.4 : 1 (AAA) |
| Reduced motion | Instant show/hide under `prefers-reduced-motion: reduce` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | 215 px panel still anchors to chip; may overlap adjacent UI — acceptable for MVP (desktop-first) |
| Tablet (640–1023px) | Same as desktop |
| Desktop (≥1024px) | Figma baseline — 215 × hug, anchored below chip bottom-left |

Future mobile bottom-sheet variant tracked in spec Out of Scope.

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `kudos_filter_apply` (existing) | Selection fires `updateParam` | `{ kind: "hashtag", value: <slug \| "(cleared)"> }` |

No dropdown-specific event — selection event already fires from
`FilterBar.updateParam()`.

---

## Design Tokens

Inherits the dark-navy panel family — **zero new tokens**:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-panel-surface` | `#00070C` | Panel background |
| `--color-border-secondary` | `#998C5F` | 1 px panel border |
| `--color-accent-cream` | `#FFEA9E` | Hover 8 %, Selected 10 %, focus ring |
| `--font-montserrat` | 16/24/700 | Option labels |

---

## Implementation Notes

- Shared component: `src/components/kudos/FilterDropdown.tsx`
  (`kind="hashtag"` vs. `kind="department"`).
- Render via React Portal to `document.body` to escape `/kudos`'s
  `overflow-x-hidden` (TR-005).
- Outside-click listener on `window` (NOT `document`) for iOS Safari
  parity.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation shipped |
| Confidence Score | High |

### Next Steps

- [ ] Track mobile bottom-sheet variant for a future mobile Live-board redesign.
- [ ] Consider extracting a shared `<DarkNavyPopover>` primitive across
      hashtag / department / language / hashtag-picker overlays.
