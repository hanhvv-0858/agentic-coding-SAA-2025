# Design Style: Dropdown Phòng ban (Department Filter)

**Frame ID**: `721:5684` (wrapper) / `563:8027` (dropdown panel)
**Frame Name**: `Dropdown Phòng ban`
**Screen ID**: `WXK5AYB_rG`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/WXK5AYB_rG
**Sibling spec**: [JWpsISMAaM-dropdown-hashtag-filter/design-style.md](../JWpsISMAaM-dropdown-hashtag-filter/design-style.md)
**Extracted At**: 2026-04-21

---

## Relationship to Hashtag sibling

This design is the **exact same popover pattern** as the Hashtag
filter (JWpsISMAaM) — same panel shell, same item rows, same state
tokens, same animations, same responsive rules. The implementation
is the **shared `FilterDropdown` component** rendered with
`kind="department"`. This document records only the deltas +
department-specific content. **For all numeric values not re-stated
here, see the sibling design-style.md.**

---

## Design Tokens (inherited)

All colour, typography, spacing, border, and shadow tokens are
identical to the Hashtag sibling:

- Panel fill: `#00070C` (Figma `Details-Container-2`)
- Panel border: `#998C5F` (`--color-border-secondary`)
- Selected item bg: `rgba(255,234,158,0.10)` (cream/10)
- Selected text-shadow: `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287`
- Default/hover item text: white
- Item label: Montserrat 16/24/700 letter-spacing 0.5 px
- Panel radius 8 px, item radius 4 px, panel padding 6 px, item
  padding 16 px

See [sibling design-style.md §Design Tokens](../JWpsISMAaM-dropdown-hashtag-filter/design-style.md#design-tokens)
for the full tables.

---

## Deltas vs Hashtag sibling

| Property | Hashtag | Department |
|---|---|---|
| Item label format | `#<label>` (prefix added client-side) | Plain `<code>` string — no prefix |
| Max label width | short slugs (≤ 14 chars) | long codes up to **26 chars** (`CEVC1 - DSV - UI/UX 1`) → **ellipsis needed** |
| Panel width | 215 px design | **289 px** wrapper in Figma, inner panel `563:8027` is narrower (101 px); but in code we keep the unified 215 px with `max-w-[260px]` cap so both filters align |
| Item count | 13 | **49** (massive overflow → scroll guaranteed) |
| Selected item width | 135 px (hug) | 90 px (hug — codes are shorter than `#<tag>`) |

---

## Layout Specifications

### Container (`563:8027` — inner dropdown panel)

Same as sibling. ASCII diagram unchanged — only the content labels differ.

### Figma wrapper

| Property | Value |
|---|---|
| Wrapper (`721:5684`) | 289 × 410 px — **this is the debug canvas** (grey `rgba(105,105,105,1)` background); NOT a real UI element. Ignored in code. |
| Inner panel (`563:8027`) | 1 px solid `#998C5F` border, radius 8, `#00070C` fill, padding 6, flex-column |

### Item row (INSTANCE `563:7956` / `7957` / `7958` / `7959` / `7960` / `7961`)

Same geometry as sibling — 56 × hug (90–91 px per Figma). In code we
render at `h-14 w-full` so item fills the panel's content area.

### Layout Structure (ASCII)

```
┌─────────────────── 215 px (code width) ───────────────────┐
│  panel (bg #00070C, border 1px #998C5F, radius 8, p 6)    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  item (Selected) — CEVC2                            │  │
│  │  h 56, w hug, p 16, radius 4, bg cream/10           │  │
│  │     text-shadow drop + glow                         │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  item (Default) — CEVC3                             │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  item (Default) — CEVC4                             │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  item (Default) — CEVC1                             │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  item (Default) — OPD                               │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  item (Default) — Infra                             │  │
│  └─────────────────────────────────────────────────────┘  │
│  ···  scroll past this  (43 more items — 49 total)        │
└───────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### HashtagDropdown panel — unchanged

See [sibling](../JWpsISMAaM-dropdown-hashtag-filter/design-style.md#hashtagdropdown-panel).

### HashtagItem — Default / Selected — unchanged

See sibling. Add the following **delta** for long-label items:

| Property | Delta | CSS |
|---|---|---|
| Label truncation | long codes wrap/overflow | Add `truncate min-w-0` on the `<li>` text container to clip + ellipsis within the panel's `max-w-[260px]` |

---

## Content List — all 49 department codes

From Figma `design_items` description of `WXK5AYB_rG` (for reference
when seed is expanded — currently only 6 generic codes are seeded;
see spec Q1/Q2):

```
CTO
SPD
FCOV
CEVC1
CEVC2
STVC - R&D
CEVC2 - CySS
FCOV - LRM
CEVC2 - System
OPDC - HRF
CEVC1 - DSV - UI/UX 1
CEVC1 - DSV
CEVEC
OPDC - HRD - C&C
STVC
FCOV - F&A
CEVC1 - DSV - UI/UX 2
CEVC1 - AIE
OPDC - HRF - C&B
FCOV - GA
FCOV - ISO
STVC - EE
GEU - HUST
CEVEC - SAPD
OPDC - HRF - OD
CEVEC - GSD
GEU - TM
STVC - R&D - DTR
STVC - R&D - DPS
CEVC3
STVC - R&D - AIR
CEVC4
PAO
GEU
GEU - DUT
OPDC - HRD - L&D
OPDC - HRD - TI
OPDC - HRF - TA
GEU - UET
STVC - R&D - SDX
OPDC - HRD - HRBP
PAO - PEC
IAV
STVC - Infra
CPV - CGP
GEU - UIT
OPDC - HRD
BDV
CPV
PAO - PAO
```

That's actually **50 entries** — the Figma description lists 49 names
plus one duplicate (`CEVC2` appears once as selected item and once in
the expanded list as a regular row). De-duplicated content set = **49
unique codes**. Treat ties as a data-entry artefact; the canonical
list has 49.

> ✅ **Migration authored (2026-04-21)**: Option B locked.
> `supabase/migrations/0011_seed_real_departments.sql` replaces the 6
> generic `SVN-*` rows with the 49 canonical Sun\* codes
> (`name_vi == name_en == code` — no translation, department names
> are proper nouns). See [spec.md §Migration Plan](spec.md#migration-plan-2026-04-21-user-confirmed-option-b).
> Pending push + fixture re-seed before going live.

---

## Component Hierarchy with Styles — unchanged

Same tree as the Hashtag sibling — `FilterDropdown` with
`kind="department"`. See
[sibling §Component Hierarchy with Styles](../JWpsISMAaM-dropdown-hashtag-filter/design-style.md#component-hierarchy-with-styles).

---

## Responsive Specifications — unchanged

Same three breakpoints, same mobile-out-of-scope caveat as the
Hashtag sibling.

---

## Icon Specifications

Chip trigger renders with the `building` icon (Phòng ban glyph),
already wired in `FilterDropdown` via `iconName = kind === "hashtag" ? "hashtag" : "building"`.

See [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx)
for the `building` icon SVG. No new icon needed.

---

## Animation & Transitions — unchanged

Same 150 ms fade-in, 100 ms fade-out, 120 ms hover.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS | React Component |
|---|---|---|---|
| Dropdown panel | `563:8027` | Same as sibling | `<FilterDropdown kind="department" />` |
| Item (Default) — CEVC3 etc. | `I563:8027;563:7957` / `7958` / `7959` / `7960` / `7961` | Same as sibling | rendered inside `FilterDropdown.options.map()` |
| Item (Selected) — CEVC2 | `I563:8027;563:7956` | Same as sibling | same, `aria-selected="true"` branch |
| Empty state (not in Figma) | — | Same as sibling | inline `<li>` with `filters.emptyList` i18n key |

Existing code that OWNS this UI:

- [src/components/kudos/FilterDropdown.tsx](../../../src/components/kudos/FilterDropdown.tsx)
  — shared component. **No change required for this screen**.
- [src/components/kudos/FilterBar.tsx:93-100](../../../src/components/kudos/FilterBar.tsx#L93)
  — already passes `kind="department"` + wires `updateParam("department", …)`.
- [src/app/kudos/actions.ts#getKudoDepartments](../../../src/app/kudos/actions.ts)
  — already returns locale-resolved `{ code, label }`. No code change.

**Only potential code touch**: `FilterDropdown.tsx` item label may
need `truncate min-w-0` if real long codes (`CEVC1 - DSV - UI/UX 1`)
surface horizontal overflow. This is a one-class delta, tracked as
FR-011 and verified during Phase 7 QA.

---

## Notes

- **Selected item** in the Figma source is `CEVC2` (Node `563:7956`).
  Default items visible in the 410 px panel: `CEVC3`, `CEVC4`,
  `CEVC1`, `OPD`, `Infra` — 5 visible out of 49. Scroll is
  **mandatory** at any realistic viewport.
- **`OPD` vs `OPDC`** — the Figma description includes both `OPD` (no
  C) as a selected sample AND `OPDC - HRD`, `OPDC - HRF`, etc. as the
  canonical parent codes. `OPD` may be a typo in the Figma artboard;
  verify with the content-owner before seeding. For this spec, we
  include both as two separate codes but flag `OPD` as
  potentially-erroneous in the migration plan.
- **Scrollbar styling** (cream track on navy track) inherited from
  sibling — `scrollbar-color: #998C5F #00070C`.
- **No icons inside items** — codes are text-only. `Icon` component
  not used inside the listbox for this screen.
