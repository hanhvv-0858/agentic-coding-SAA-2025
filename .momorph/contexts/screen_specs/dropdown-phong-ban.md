# Screen: Dropdown Phòng ban (Department filter)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `WXK5AYB_rG` (wrapper `721:5684` / panel `563:8027`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/WXK5AYB_rG |
| **Screen Group** | Kudos Live board overlays |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

**Popover dropdown** anchored to the **Bộ phận** (Department) chip in
the Live board's `FilterBar` at `/kudos`. Lists the 49 canonical Sun\*
department codes (migration 0011 — `CTO`, `CEVC1`, `STVC - R&D`,
`OPDC - HRD - HRBP`, etc.). Selecting a code narrows the **All Kudos
feed**, **HIGHLIGHT carousel**, and **SPOTLIGHT board** by joining on
each sender's `profiles.department_id`.

Direct sibling of the [Dropdown Hashtag filter](./dropdown-hashtag-filter.md)
(`JWpsISMAaM`) — same `FilterDropdown` primitive (just `kind="department"`),
same dark-navy panel visual, same open/close/keyboard/toggle-off
semantics, same mutual exclusion with the hashtag variant. This spec is a
behavioural delta documenting only the content list + the long-code
truncation rule.

Ordered alphabetically ASC by code (not Figma's organic ordering) for
findability across 49 rows.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Kudos Live board (`MaZUn5xHXZ`) | Click **Bộ phận** chip in `FilterBar` | Authenticated; department list non-empty |
| Kudos Live board | Keyboard `Enter` / `Space` on focused chip | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| `/kudos?department=<code>` (same page) | Row click / `Enter` on option | Items in panel `563:8027` | High | `router.replace()` with `{ scroll: false }` |
| `/kudos` (filter cleared) | Click selected row (toggle-off) | Same | High | `updateParam("department", null)` |
| Kudos Live board (unchanged URL) | Outside click / `Esc` / chip re-click | — | High | Dismiss without mutation |

### Navigation Rules

- **Back behavior**: Same as hashtag sibling — URL via `router.replace()`,
  no history entry.
- **Deep link support**: `/kudos?department=<code>` is shareable; combines
  with `?hashtag=<slug>` for intersection filtering.
- **Auth required**: Yes — inherits `/kudos` session gate.

---

## Component Schema

### Layout Structure

```
              FilterBar
┌─────────────────────────┐
│ [Hashtag ▾] [Bộ phận ▾] │
└──────────┬──────────────┘
           │  opens popover
           ▼
┌─────────────────────────┐
│ Dark-navy panel         │
│ ┌─────────────────────┐ │
│ │ BDV                 │ │
│ │ CEVC1               │ │
│ │ CEVC1 - AIE         │ │
│ │ CEVC1 - DSV - U…    │ │  ← truncated (Option B)
│ │ …49 total, alpha    │ │
│ │ ↓ scroll            │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Component Hierarchy

Identical to hashtag sibling — reuses `src/components/kudos/FilterDropdown.tsx`
with `kind="department"`. See
[dropdown-hashtag-filter.md](./dropdown-hashtag-filter.md) for details.

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| DepartmentChip | Atom | — | Trigger in `FilterBar.tsx` | Yes |
| Dropdown panel | Organism | `563:8027` | Same shell as hashtag — 215 × hug, navy, cream 1 px border | Yes (shared) |
| Option row | Molecule | — | Plain code text (no `#` prefix); Montserrat 16/24/700; truncate + title attribute for overflowing codes | Yes |
| Selected row | Molecule | — | Cream/10 fill + glow + ✓ in-state via `aria-selected="true"` | Yes |
| Active-filter chip | Molecule | — | Cream pill below FilterBar showing active code + ✕ (FilterBar.tsx L132-141) | Yes |

---

## Form Fields

N/A — single-select listbox.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `getKudoDepartments()` (`src/app/kudos/actions.ts:660`) | Server Action | 49 codes with locale-resolved labels (VN = EN = code) | Pre-fetched by `/kudos` RSC and passed as prop |

DB tables read: `departments` (migration 0011 — `code`, `name_vi`, `name_en`;
all three equal the code per the no-translation decision).

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Select department | URL via `router.replace()` | client nav | — | `?department=<code>` → `getKudoFeed({ department })`, `getHighlightKudos({ department })`, `getSpotlight()` refetch |
| Toggle-off | Same | client nav | — | `?department` removed |
| Retry after load error | `onRetry` → re-invoke `getKudoDepartments()` | — | — | Refresh options |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| `getKudoDepartments()` throws | — | Chip disabled + "Không tải được — Thử lại" inline |
| Empty list | — | Chip disabled (`aria-disabled="true"`, `opacity-50`) |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `isOpen` | boolean | `false` | Panel visibility |
| `focusIndex` | number | -1 | Roving tabindex cursor |

### URL-derived State

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| Active department | `searchParams.department` | Read (SSR) / Write (client) | Drives feed/carousel/spotlight filters |
| `FilterState.department` | `src/types/kudo.ts` | Read | Existing contract consumed by `getKudoFeed` |

---

## UI States

Identical to hashtag sibling. Key addition:

### Long-code rendering
- `CEVC1 - DSV - UI/UX 1` (26 chars) truncates via `truncate min-w-0 flex-1`
  + `title` attribute for full-text tooltip (Option B, applied proactively).

### Scroll
- 49 × 56 px = 2744 px intrinsic; panel `max-height: min(640px, 100vh-chipBottom-16px)`
  with `overflow-y-auto` — scroll is always visible on realistic viewports.

---

## Accessibility

Identical to hashtag sibling (see that spec). Adds:
- Long-code rows: `title="<full code>"` for hover tooltip; truncated text
  is wrapped in a `<span>` with `min-w-0 flex-1 truncate` so keyboard
  focus reveals the full string via the OS tooltip.

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | 215 px panel; long codes may wrap to 2 lines in the 56 px row if the `truncate` class is removed — default Option B truncates |
| Tablet (640–1023px) | Same as desktop |
| Desktop (≥1024px) | Figma baseline |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `kudos_filter_apply` (existing, shared) | Selection fires `updateParam` | `{ kind: "department", value: <code \| "(cleared)"> }` |

---

## Design Tokens

Zero new tokens — inherits from the hashtag/language dark-navy family.

---

## Implementation Notes

### Zero new UI code
The hashtag sibling's redesign of shared `FilterDropdown.tsx` automatically
flows to `kind="department"`. Implementation scope of this spec was DB-only:

- Migration `0011_seed_real_departments.sql` — 49 canonical codes inserted;
  6 generic `SVN-*` rows deleted.
- Migration `0012_purge_legacy_departments.sql` — cleanup of 5 pre-SVN
  legacy rows.
- `supabase/seed.sql` updated with 49-row INSERT block.
- `scripts/seed-kudos-fixtures.ts` — fixture Sunners remapped to real
  codes (e.g. Alice → `CEVC1`, Bob → `CEVC1 - DSV`).

### Special Considerations
- **No translation** — codes are proper nouns / internal org identifiers.
- **Mutual exclusion** — opening this dropdown closes the hashtag
  dropdown (shared FilterBar signal).
- **Execution order** — migration push → fixture re-seed in single commit
  to avoid NULL `department_id` window.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — implementation shipped |
| Confidence Score | High |

### Next Steps

- [ ] Consider hierarchical grouping (`CEVC1 - DSV` parent collapses its
      `UI/UX 1`/`UI/UX 2` children) if 49-item scroll UX becomes painful.
- [ ] Track mobile bottom-sheet variant alongside hashtag sibling.
- [ ] Add optional free-text search input if feedback calls for it.
