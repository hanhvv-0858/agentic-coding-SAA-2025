# Feature Specification: Dropdown Hashtag Filter

**Frame ID**: `721:5580` (wrapper) / `563:8026` (dropdown panel)
**Frame Name**: `Dropdown Hashtag filter`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Screen ID**: `JWpsISMAaM`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JWpsISMAaM
**Parent screen**: `MaZUn5xHXZ` — Kudos Live board (`/kudos`)
**Created**: 2026-04-21
**Status**: Draft

---

## Overview

A **popover dropdown** that opens when the Sunner clicks the **Hashtag**
chip in the Live board's `FilterBar`. The panel lists all kudo hashtags
registered in the system. Picking one filters **All Kudos feed**,
**Highlight carousel**, and **Spotlight board** in one shot via the
existing `FilterState.hashtag` contract in `src/types/kudo.ts`.

The dropdown is **not a full page** — it's a floating panel anchored to
the Hashtag chip, closes on outside-click / ESC / selection, and
survives navigation only as a query-string reflection (the parent
`/kudos` route already reads `?hashtag=<slug>`).

### Relationship to existing code (2026-04-21)

A generic `FilterDropdown` component already exists at
[src/components/kudos/FilterDropdown.tsx](../../../src/components/kudos/FilterDropdown.tsx)
and is currently used by both Hashtag + Department filters. **Its
visual today is different from this Figma source** — the live
component renders a **cream panel (`#FFF9E8`) with navy text**,
while the Figma source of `JWpsISMAaM` is a **dark navy panel
(`#00070C`) with white text and a cream glow on the selected row**.

**Path confirmed (2026-04-21)**: the shared `FilterDropdown` will
be redesigned in-place so both Hashtag AND Department filters
adopt the new dark visual. Department filter has no separate
Figma source for the dark variant — it extrapolates from this
spec (same chrome, same item rows, same state tokens).

### Analytics (existing)

`FilterBar.updateParam()` already fires
`track({ type: "kudos_filter_apply", kind: "hashtag", value: <slug | "(cleared)"> })`
on every URL update ([FilterBar.tsx:66-71](../../../src/components/kudos/FilterBar.tsx#L66)).
**This spec does NOT add a new analytics event** — the dropdown's
`onSelect` callback feeds into the same `updateParam` so the event
continues to fire unchanged.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Filter feed by picking a hashtag (Priority: P1)

A Sunner browsing `/kudos` clicks the **Hashtag** chip in the
FilterBar. A dropdown opens with all hashtags. They pick one (e.g.
`#Dedicated`). The dropdown closes, the feed / carousel / spotlight
narrow to kudos tagged with that slug, and the chip label updates to
show the active hashtag.

**Why this priority**: This is the core reason the dropdown exists.
Without it, the existing `?hashtag` filter on `/kudos` has no
picker UI — the feature is unusable end-to-end.

**Independent Test**: Navigate to `/kudos`, open the dropdown, pick
one hashtag. Assert the URL updates to `?hashtag=<slug>`, the feed
re-renders with only matching kudos, and the dropdown is closed.

**Acceptance Scenarios**:

1. **Given** the Sunner is on `/kudos` with no hashtag filter
   applied, **when** they click the Hashtag chip, **then** the
   dropdown opens anchored to the chip, the 13 hashtags are rendered,
   and no item is marked selected.
2. **Given** the dropdown is open, **when** the Sunner clicks one
   hashtag item, **then** the dropdown closes, `?hashtag=<slug>` is
   written via `router.replace()` (FR-020 — no history pollution),
   and the feed + carousel + spotlight refetch with the filter
   applied (re-using existing `getKudoFeed({ hashtag })` wiring).
3. **Given** `?hashtag=dedicated` is already in the URL, **when** the
   Sunner re-opens the dropdown, **then** the matching item renders
   with the **Selected** visual state (cream-tinted panel + glow).
4. **Given** the dropdown is open, **when** the Sunner clicks the
   currently-selected item again, **then** the filter is cleared,
   `?hashtag` is removed from the URL, and the dropdown closes.
   (toggle-off behaviour matches the spec's "Click item: toggle").

---

### User Story 2 — Dismiss without changing the filter (Priority: P1)

A Sunner opens the dropdown, looks at the options, and decides not to
filter. They close the dropdown by clicking outside, pressing
**Escape**, or clicking the Hashtag chip again.

**Why this priority**: Core UX expectation for popovers — without
dismiss, the panel becomes a trap on wide screens and violates
WCAG 2.1.2 (Keyboard).

**Independent Test**: Open the dropdown, then (a) click the main
content area, (b) press ESC, (c) click the chip again — in all three
cases the dropdown closes without mutating `?hashtag`.

**Acceptance Scenarios**:

1. **Given** the dropdown is open, **when** the Sunner clicks anywhere
   outside the panel + chip, **then** the dropdown closes and the
   filter state is unchanged.
2. **Given** the dropdown is open and the focus is on an item,
   **when** the Sunner presses `Escape`, **then** the dropdown
   closes and focus returns to the Hashtag chip (WCAG 2.4.3 focus
   order).
3. **Given** the dropdown is open, **when** the Sunner clicks the
   Hashtag chip again, **then** the dropdown toggles closed
   (idempotent toggle, mirrors the Bộ phận dropdown pattern).

---

### User Story 3 — Keyboard navigation (Priority: P2)

A keyboard-first Sunner tabs to the Hashtag chip, opens the
dropdown, uses arrow keys to move focus through items, and presses
**Enter** to select.

**Why this priority**: Important for a11y conformance (WCAG 2.1.1)
but MVP-usable without it (mouse users unblocked by US1). Wire after
core open/select/close is shipped.

**Independent Test**: With JS focus on the chip, press
`Space`/`Enter` → dropdown opens with focus on the first item
(or the selected item if one is active). Arrow-Down / Arrow-Up move
focus; Home/End jump to first/last. Enter selects; Esc cancels.

**Acceptance Scenarios**:

1. **Given** focus is on the Hashtag chip, **when** the Sunner
   presses `Enter`, **then** the dropdown opens and focus moves to
   the selected item (or the first item if none selected).
2. **Given** focus is on an item, **when** the Sunner presses
   `ArrowDown`, **then** focus moves to the next item; `ArrowUp`
   moves to the previous item; wrap at list ends.
3. **Given** focus is on an item, **when** the Sunner presses
   `Enter`, **then** the filter applies and the dropdown closes
   (same as click).

---

### User Story 4 — Scroll through a long list (Priority: P3)

With 13 hashtags the default panel height (≈ 410 px) may overflow on
short viewports. The list scrolls internally; the panel shell stays
anchored.

**Why this priority**: 13 items fit at ≈ 56 px each (728 px) — on a
desktop 1440×900 the list exceeds the panel at the current 410 px
height, so scrolling is necessary; however it won't block MVP ship
on desktop-first viewport where the panel can grow.

**Independent Test**: Shrink the viewport to a short height (e.g.
500 px), open the dropdown, verify the inner list scrolls and the
cream border + radius of the outer shell stay intact.

**Acceptance Scenarios**:

1. **Given** the viewport height is less than the total list
   height + chrome, **when** the dropdown opens, **then** the
   item container shows a scrollbar and all 13 items remain
   reachable.
2. **Given** the dropdown is scrolled, **when** the Sunner selects
   an item, **then** the dropdown closes regardless of scroll
   position.

---

### Edge Cases

- **Zero hashtags in DB** — dropdown shows an empty state ("Chưa có
  hashtag nào") instead of an empty list. Match the existing
  `EmptyState` atom used by the feed (variant `feedEmpty`) or add a
  `hashtagFilterEmpty` variant.
- **Slug renamed while dropdown open** — the active `?hashtag`
  becomes a dead slug. Re-render with no item highlighted and keep
  the list usable (don't crash on missing match).
- **User clicks chip while a network fetch is in-flight** — the
  dropdown should still open using the cached hashtag list from the
  Server Component render; the re-fetch on selection proceeds in the
  background.
- **Touch device** — outside-tap must close the popover (iOS body
  click-through quirk requires attaching the listener to
  `window`, not `document`).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Description | Interactions |
|-----------|-------------|--------------|
| `HashtagDropdown` (popover) | Floating popover shell (215 × hug, cream 1 px border `#998C5F`, navy `#00070C` fill, radius 8, padding 6) | Opens on chip click; closes on outside-click / ESC / select |
| `HashtagItem` (default) | Row with `#<Label>` text (the `#` prefix is added client-side — the `hashtags.label` DB column stores `"Dedicated"` not `"#Dedicated"`), Montserrat 16/24/700, white fill, padding 16, radius 4, hug-width | Hover = 8% cream tint; Click = select + close |
| `HashtagItem` (selected) | Same as default + `bg rgba(255,234,158,0.10)` + text-shadow glow `0 0 6px #FAE287` | Click = toggle-off (clear filter) |
| `HashtagItemList` | `<ul role="listbox">` column, scroll-y when overflow | Arrow keys move focus between items |
| **Active filter chip** *(existing, outside the dropdown)* | Cream pill below the FilterBar showing the active `#<Label>` + ✕, rendered by `<ActiveChip>` in [FilterBar.tsx:148-175](../../../src/components/kudos/FilterBar.tsx#L148) | Click ✕ → clears the filter (equivalent to selecting "toggle-off" inside the dropdown) |
| **"Clear all" text link** *(existing, next to the chips in FilterBar)* | Small underlined link that appears only when at least one filter is active | Click → clears both hashtag AND department filters at once |

See [design-style.md](design-style.md) §Component Style Details for
pixel specs and Node IDs.

### Navigation Flow

- **From**: Kudos Live board (`/kudos`) — click on `FilterBar`
  Hashtag chip.
- **Open side-effects**: popover positioned against the chip's
  bottom-left corner; background scroll of the page is **not**
  locked (popover ≠ modal).
- **Close**: selection → apply + close; outside-click → cancel +
  close; ESC → cancel + close; toggle chip → close; page navigation
  → close.
- **To**: No full-screen transitions. URL mutates in-place via
  `router.replace()` with `{ scroll: false }` (existing FilterBar
  path — preserves scroll position + avoids back-stack pollution so
  the browser Back button doesn't "step through" each filter change).

### Visual Requirements

- **Responsive breakpoints**: The current `FilterBar` renders on
  **all viewports** (it has no `hidden md:flex` guard in code).
  This popover design is Figma-authored at desktop; on narrow
  viewports (< 640 px) the 215 px panel can still render anchored
  to the chip but may overlap adjacent UI. Acceptable for MVP
  because `/kudos` itself is desktop-first. A future mobile bottom-
  sheet variant (tracked in **Out of Scope**) will replace the
  popover when the Live board earns a mobile redesign.
- **Animations/Transitions**: fade-in 150 ms + y-translate 4 px on
  open; fade-out 100 ms on close. Respect
  `prefers-reduced-motion` (instant show/hide).
- **Accessibility**:
  - `role="listbox"` on the list, `role="option"` on items,
    `aria-selected` on the current slug.
  - `aria-expanded` + `aria-controls` on the parent chip.
  - Focus trap **off** (popover ≠ modal); focus returns to chip on
    close.
  - Colour contrast: white text on `#00070C` = 20.4:1 (AAA);
    selected cream-tint panel preserves the same text fill.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render all active hashtags from the
  `hashtags` table, ordered ASC by the locale-resolved label
  column (`label_vi` when `locale === "vi"`, `label_en` when
  `locale === "en"`), as items in the dropdown when it opens.
- **FR-002**: System MUST persist the selected hashtag as
  `?hashtag=<slug>` on the `/kudos` URL so selections are
  shareable + refresh-stable.
- **FR-003**: Users MUST be able to clear the filter by clicking
  the currently-selected item (toggle-off).
- **FR-004**: System MUST close the dropdown on outside-click,
  ESC, chip re-click, or item selection.
- **FR-005**: System MUST highlight the item matching the current
  `?hashtag` slug with the **Selected** visual state on open.
- **FR-006**: System MUST keep the existing `FilterState.hashtag`
  contract consumed by `getKudoFeed`, `getHighlightKudos`, and
  `getSpotlight` — no new server contract is introduced by this
  feature.
- **FR-007**: When `getKudoHashtags()` returns an empty list, the
  Hashtag chip MUST render **disabled** (`aria-disabled="true"`,
  reduced opacity) — the dropdown does NOT open. This matches the
  existing `FilterDropdown` disabled path and avoids a pointless
  popover with a single "empty" row. The i18n key `filters.emptyList`
  exists for the inline listbox empty message (used if the list
  legitimately becomes empty AFTER opening, e.g. data race).
- **FR-008**: When `getKudoHashtags()` errors out, the Hashtag chip
  MUST render disabled AND show an inline "Không tải được — Retry"
  control directly below it (existing `onRetry` prop path in
  `FilterDropdown`). Retry triggers a re-fetch without reopening
  the popover.
- **FR-009**: Hashtag dropdown and Department dropdown MUST be
  **mutually exclusive** — opening one closes the other. Attach a
  shared "close others" signal in the parent `FilterBar` (or use
  `document` outside-click on each popover — opening a new trigger
  fires outside-click on the currently-open popover and closes it).
- **FR-010**: Hashtag labels MUST be **locale-resolved** — the
  dropdown displays `label_vi` when the active locale is `vi`,
  `label_en` when `en`. See Key Entities + Data Requirements
  below for the DB shape.

### Technical Requirements

- **TR-001**: Open/close render MUST complete within one frame
  (< 16 ms) on mid-range laptop — list is pre-fetched on the
  server, dropdown is a client-only visibility toggle.
- **TR-002**: Popover positioning MUST NOT cause horizontal
  overflow (`overflow-x-clip` on the viewport container prevents
  scrollbars at narrow widths).
- **TR-003**: Outside-click detection MUST be scoped to `window`
  (not `document`) so iOS Safari taps close the popover
  reliably.
- **TR-004**: Keyboard navigation MUST follow WCAG 2.1.1 and
  WAI-ARIA 1.2 combobox / listbox patterns.
- **TR-005**: Popover MUST NOT be clipped by the `overflow-x-hidden`
  on `/kudos` `<main>`. Implementation SHOULD render the popover
  via a React portal to `document.body` with an absolute position
  computed from the chip's `getBoundingClientRect()` on open. If
  portal is not feasible, set `overflow: visible` on every ancestor
  between the chip and the viewport.

### Key Entities *(if feature involves data)*

- **Hashtag** (migrated, `hashtags` table) — **schema change
  required** to support FR-010:

  | Column | Type | Notes |
  |---|---|---|
  | `id` | `uuid` | PK (unchanged) |
  | `slug` | `text` | unique, URL-safe (unchanged; drives `?hashtag=<slug>`) |
  | `label_vi` | `text` | **new** — Vietnamese display name (e.g. `"Cống hiến"`) |
  | `label_en` | `text` | **new** — English display name (e.g. `"Dedicated"`) |
  | `created_at` | `timestamptz` | unchanged |

  Mirrors the existing `departments.name_vi` / `name_en` pattern.
  Migration plan: rename current `label` → `label_en` (already
  English), add nullable `label_vi`, backfill `label_vi` from the
  canonical VN translation list, then set `label_vi` NOT NULL. A
  follow-up migration in the next phase will `DROP COLUMN label`
  once all callers migrate to the localized columns.

- **FilterState** (existing, `src/types/kudo.ts`):
  `{ hashtag: string | null, department: string | null }` — the
  dropdown only mutates `hashtag`. Value stored is the `slug` (not
  the label), so URL remains stable across locales
  (`?hashtag=dedicated` works in both VN + EN mode).

### Data Requirements

| Field | Source | Consumed as | Notes |
|---|---|---|---|
| `hashtags.slug` | DB | URL param `?hashtag=<slug>` + `<option value>` | Stable across locale switches |
| `hashtags.label_vi` | DB | Display label when `locale === "vi"` | Rendered with `#` prefix client-side |
| `hashtags.label_en` | DB | Display label when `locale === "en"` | Rendered with `#` prefix client-side |
| `Hashtag.label` | Server Action | Single resolved label | `getKudoHashtags()` picks the correct column based on current locale at action entry (mirrors `getKudoDepartments()` pattern) and returns a single `label` field in its `Hashtag` DTO. UI stays locale-agnostic. |

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `GET /hashtags` → Server Action `getKudoHashtags()` | GET | Returns `Hashtag[]` (`{ slug, label }`) where `label` is pre-resolved to `label_vi` / `label_en` by the action based on current locale (mirrors `getKudoDepartments()`). | **Modified** — action body needs locale-aware column selection; signature unchanged. |
| Schema migration | — | Rename `hashtags.label` → `label_en`, add `label_vi NOT NULL`, backfill from canonical VN list. See §Migration Plan below. | **New** |
| No new REST endpoints | — | Dropdown is client UI around the existing filter contract. | — |

### Migration Plan (new)

**Canonical Q4 2025 hashtag set — 13 tags** (user-confirmed
2026-04-21). This REPLACES the existing 10-tag seed (which was a
generic placeholder); only `dedicated` overlaps between old + new.

| # | slug | `label_vi` | `label_en` |
|---|---|---|---|
| 1 | `comprehensive` | Toàn diện | Comprehensive |
| 2 | `expertise` | Giỏi chuyên môn | Expertise |
| 3 | `high-performance` | Hiệu suất cao | High Performance |
| 4 | `inspiring` | Truyền cảm hứng | Inspiring |
| 5 | `dedicated` | Cống hiến | Dedicated |
| 6 | `aim-high` | Aim High | Aim High |
| 7 | `be-agile` | Be Agile | Be Agile |
| 8 | `wasshoi` | Wasshoi | Wasshoi |
| 9 | `goal-oriented` | Hướng mục tiêu | Goal-Oriented |
| 10 | `customer-focused` | Hướng khách hàng | Customer-Focused |
| 11 | `process-driven` | Chuẩn quy trình | Process-Driven |
| 12 | `creative-solution` | Giải pháp sáng tạo | Creative Solution |
| 13 | `excellent-management` | Quản lý xuất sắc | Excellent Management |

> Slug rules (mirrors existing convention): lowercase, kebab-case,
> ASCII-only. `Aim High` / `Be Agile` / `Wasshoi` come from
> Sun\* company values and stay identical in both locales — label
> columns carry the same string for those three rows.

---

**Migration `0010_hashtags_localize.sql`** (project uses numbered
`supabase/migrations/NNNN_*.sql`):

1. Rename + add localized columns:
   ```sql
   alter table hashtags rename column label to label_en;
   alter table hashtags add column label_vi text;
   ```
2. Purge the old seed rows + their junction joins (dev-only data —
   no production kudos exist yet):
   ```sql
   delete from kudo_hashtags where hashtag_id in (
     select id from hashtags where slug not in (
       'comprehensive', 'expertise', 'high-performance', 'inspiring',
       'dedicated', 'aim-high', 'be-agile', 'wasshoi',
       'goal-oriented', 'customer-focused', 'process-driven',
       'creative-solution', 'excellent-management'
     )
   );
   delete from hashtags where slug not in (
     'comprehensive', 'expertise', 'high-performance', 'inspiring',
     'dedicated', 'aim-high', 'be-agile', 'wasshoi',
     'goal-oriented', 'customer-focused', 'process-driven',
     'creative-solution', 'excellent-management'
   );
   ```
3. Upsert the 13 canonical rows with both locales:
   ```sql
   insert into hashtags (slug, label_vi, label_en) values
     ('comprehensive',       'Toàn diện',         'Comprehensive'),
     ('expertise',            'Giỏi chuyên môn',   'Expertise'),
     ('high-performance',     'Hiệu suất cao',     'High Performance'),
     ('inspiring',            'Truyền cảm hứng',   'Inspiring'),
     ('dedicated',            'Cống hiến',         'Dedicated'),
     ('aim-high',             'Aim High',          'Aim High'),
     ('be-agile',             'Be Agile',          'Be Agile'),
     ('wasshoi',              'Wasshoi',           'Wasshoi'),
     ('goal-oriented',        'Hướng mục tiêu',    'Goal-Oriented'),
     ('customer-focused',     'Hướng khách hàng',  'Customer-Focused'),
     ('process-driven',       'Chuẩn quy trình',   'Process-Driven'),
     ('creative-solution',    'Giải pháp sáng tạo','Creative Solution'),
     ('excellent-management', 'Quản lý xuất sắc',  'Excellent Management')
   on conflict (slug) do update set
     label_vi = excluded.label_vi,
     label_en = excluded.label_en;
   ```
4. Enforce NOT NULL on both columns:
   ```sql
   alter table hashtags alter column label_vi set not null;
   alter table hashtags alter column label_en set not null;
   ```

---

**Seed update** in `supabase/seed.sql` — replace the existing
10-row INSERT block with the 13-row list above (using
`on conflict (slug) do nothing` so `supabase db reset` remains
idempotent after migration).

**Action update** in `src/app/kudos/actions.ts#getKudoHashtags`:
```ts
const locale = await getLocale();
const col = locale === "vi" ? "label_vi" : "label_en";
const { data } = await supabase
  .from("hashtags")
  .select(`slug, label:${col}`)
  .order(col, { ascending: true });
```

**Type sync** — regenerate `src/types/database.ts` after
migration push so `Database["public"]["Tables"]["hashtags"]["Row"]`
reflects `label_vi` + `label_en`.

**Fixture seed update** in `scripts/seed-kudos-fixtures.ts` — the
`HASHTAG_SLUGS` array currently cycles through the old slugs
(`dedicated`, `creative`, `teamwork`, …). Replace with the 13 new
slugs so kudos attach to real tags after the reset.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Selecting a hashtag updates feed + carousel +
  spotlight within 500 ms on production Supabase latency.
- **SC-002**: Dropdown passes WCAG 2.1 AA keyboard + screen-reader
  audits (tested with VoiceOver + NVDA).
- **SC-003**: ≥ 90 % of kudo browse sessions that use the Hashtag
  chip successfully complete a select + filter action (bounce rate
  < 10 %).

---

## Out of Scope

- Free-text hashtag search input inside the dropdown (list of 13 is
  short enough to scan).
- Multi-select (picking 2+ hashtags) — MVP is single-select.
- Mobile bottom-sheet variant — will be specified in a future
  screen once the mobile Live board redesign is finalised.
- Creation of new hashtags from the dropdown — only the composer
  (`Viết Kudo`) mints new `hashtags` rows.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] Parent Live board spec exists
  (`.momorph/specs/MaZUn5xHXZ-kudos-live-board/spec.md`)
- [x] `getKudoHashtags()` Server Action shipped
  (`src/app/kudos/actions.ts`) — **needs body update** for
  locale-resolved label column (see §Migration Plan § Action update)
- [ ] `hashtags` table migrated to `label_vi` + `label_en` and
  seeded with the 13 Q4 2025 tags — **blocked on migration
  `0010_hashtags_localize.sql` push + fixture seed update** (see
  §Migration Plan)
- [x] `FilterBar` client component exists
  (`src/components/kudos/FilterBar.tsx` or similar)
- [x] `FilterDropdown` generic popover exists
  (`src/components/kudos/FilterDropdown.tsx`) — **needs visual
  redesign in-place to match this Figma source** (affects
  Department filter too; see §Relationship to existing code)
- [x] SCREENFLOW.md updated with the popover entry
  (`.momorph/contexts/screen_specs/SCREENFLOW.md`)

---

## Clarification Needed

_All open questions resolved as of 2026-04-21. Decisions:_

1. **Hashtag localization** → **Option 1a**. Migration adds
   `hashtags.label_vi` + `label_en`; action resolves per-locale.
   See §API Dependencies §Migration Plan.
2. **Toggle-off on selected item** → **Yes** (FR-003).
3. **Dark visual applies to BOTH** Hashtag + Department filters
   — redesign shared `FilterDropdown` in-place.
4. **Scroll when list > panel height** → **Yes** (US4 + design-
   style §max-height). Don't grow unbounded.
5. **Dropdown-open analytics event** → **No**. Keep the existing
   `kudos_filter_apply` (select-only) event.

---

## Notes

- **Component naming**: The spec's "HashtagDropdown" / "HashtagItem"
  labels describe the **visual roles** shown in Figma. The
  implementation target is the existing generic
  `FilterDropdown.tsx` (its styles + markup get updated to match
  this design), NOT a new `HashtagDropdown.tsx` file. Department
  filter is the second consumer of the same updated component —
  no fork.
- **Popover clipping gotcha**: the `<main>` element on `/kudos`
  uses `overflow-x-hidden` (added during the hero full-bleed fix).
  If the dropdown renders as an in-tree descendant of a wrapper
  that inherits this clip, the popover can be cut off when it
  extends beyond the viewport. Fix at implementation time: either
  set `overflow: visible` on the immediate FilterBar wrapper or
  render the popover via a React portal to `document.body` with
  an anchored position derived from the chip's bounding rect.
  Tracked in TR-005 below.
- **Selected tint**: the `rgba(255,234,158,0.10)` value is the
  same `--color-accent-cream/10` alpha already used on Live board
  hover states — no new CSS custom property needed.
