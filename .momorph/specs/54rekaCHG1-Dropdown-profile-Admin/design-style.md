# Design Style: Dropdown-profile Admin

**Frame ID**: `54rekaCHG1`
**Figma frame name**: Dropdown-profile Admin
**Parent container Node ID**: `721:5277`
**Root component Node ID**: `666:9728`
**Date**: 2026-04-22
**Parent spec**: [`z4sCl3_Qtk-Dropdown-profile`](../z4sCl3_Qtk-Dropdown-profile/design-style.md)

---

## 1. Overview

**Admin variant** of the non-admin `Dropdown-profile`. Adds a **Dashboard** row between Profile and Logout. All other visual properties — dark-navy listbox family, typography, panel geometry, active-state glow — are identical to the parent spec; this doc records only the **delta**.

To avoid drift, all tokens and layout rules come from the parent [design-style.md](../z4sCl3_Qtk-Dropdown-profile/design-style.md). **Read that file first.**

---

## 2. Delta vs `z4sCl3_Qtk-Dropdown-profile/design-style.md`

### 2.1 Structure (one extra row)

| # | Row        | Figma Node ID                              | Active on load?            | Icon (Figma `componentId`)  |
| - | ---------- | ------------------------------------------ | -------------------------- | --------------------------- |
| A.1 | Profile   | `I666:9728;666:9277`                       | ✅ (cream α=0.10 + glow)    | `186:1611` (user)           |
| A.2 | Dashboard | `I666:9728;666:9452`                       | — (idle)                   | `662:10350` (**TBD — see Q1**) |
| A.3 | Logout    | `I666:9728;666:9278`                       | — (idle)                   | `335:10890` (chevron-right) |

The three rows use the same item geometry (height 56, padding 16, radius 4, gap 4, text Montserrat 16/700/24, tracking 0.15 px, colour #FFFFFF). Icons and labels differ.

### 2.2 Panel dimensions

| Property     | Parent (`z4sCl3_Qtk`) | Admin (`54rekaCHG1`) | Reason                                                      |
| ------------ | --------------------- | -------------------- | ----------------------------------------------------------- |
| Row count    | 2                      | **3**                | +Dashboard row                                               |
| Panel width  | ~133 px hug            | **~166 px hug**      | "Dashboard" label is wider than "Profile" / "Logout"         |
| Panel height | 2 × 56 + 2 × 6 pad    | **3 × 56 + 2 × 6 pad** | Extra row                                                    |
| Panel radius | 8 px                   | 8 px                  | Unchanged                                                    |
| Panel border | 1 px olive             | 1 px olive            | Unchanged                                                    |
| Panel bg     | `#00070c`              | `#00070c`             | Unchanged                                                    |

All other tokens (colours, typography, spacing, shadows, transitions) inherit unchanged from the parent spec.

### 2.3 Dashboard row (new) — component details

| Property           | Value                                                                                | CSS / Tailwind                                           |
| ------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| **Node ID**        | `I666:9728;666:9452`                                                                  | —                                                        |
| Label              | Text "Dashboard"                                                                      | Inherits item typography (Montserrat 16/700/24)          |
| Icon               | `componentId: 662:10350` — **icon choice pending (see Q1)**. Placeholder: `chevron-right` matching family convention. | `<Icon name="chevron-right" size={24} className="ml-auto shrink-0" />` |
| Height             | 56 px                                                                                 | `h-14`                                                   |
| Padding            | 16 px all sides                                                                       | `px-4 py-4`                                              |
| Gap                | 4 px (text ↔ icon)                                                                    | `gap-1`                                                  |
| Border-radius      | 4 px                                                                                  | `rounded`                                                |
| Default state      | transparent bg, no glow                                                               | default                                                  |
| Hover / focus      | `rgba(255,234,158,.10)` fill + text-shadow glow                                       | same as Profile/Logout rows (reuses `itemClass`)         |
| Click target       | `<Link href="/admin" role="menuitem">` per existing `ProfileMenu.tsx`                 | —                                                        |

---

## 3. ASCII Layout (admin)

```
Trigger (avatar on header bar)
   │
   ▼ position: absolute; top: 100%; right: 0; mt: 8px
┌──────────────────────────────────────┐
│ 1 px #998C5F border, rounded 8       │  ← 666:9728
│ bg #00070C · padding 6               │
│ ┌──────────────────────────────────┐ │
│ │ bg cream α.10 · radius 4         │ │  ← A.1 Profile (active)
│ │ [Profile]                  [👤ic]│ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ bg transparent · radius 4        │ │  ← A.2 Dashboard (idle)
│ │ [Dashboard]               [📊ic] │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ bg transparent · radius 4        │ │  ← A.3 Logout (idle)
│ │ [Logout]                   [>ic] │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 4. Implementation Mapping

Reuses the `ProfileMenu.tsx` component (single file, dual-spec via `isAdmin` prop) — see parent spec §8. The `isAdmin` prop is derived **server-side** by each consumer page via `(user.app_metadata as { role?: string } | null)?.role === "admin"` — grep confirms this pattern in 4 pages today.

| Figma Node ID                    | Role                  | React code path                              |
| -------------------------------- | --------------------- | -------------------------------------------- |
| `666:9728`                       | Panel wrapper         | `<div role="menu">` in `ProfileMenu.tsx`     |
| `I666:9728;666:9277`             | Profile menu item     | `<Link href="/profile">` (always rendered)  |
| `I666:9728;666:9452`             | **Dashboard menu item (new)** | `{isAdmin && <Link href="/admin">...</Link>}` — conditional render, pre-wired  |
| `I666:9728;666:9278`             | Logout menu item      | `<button type="submit">` in `<form action={signOut}>` |

No new component extraction. The admin variant is a **conditional render of one extra `<Link>`** inside the same component.

---

## 5. Responsive & Accessibility

Identical to parent spec. No delta. Touch-target for Dashboard row = 56 × ~153 px → exceeds 44 × 44 constitution minimum. Screen-reader: the Dashboard row gets `role="menuitem"` and inherits the panel's `aria-label="Account menu"`.

---

## 6. Open Questions (design-style)

- **Q1 — Dashboard icon**: Figma `componentId: 662:10350` identifies the icon used in the Figma design. Possible sprite matches: `building`, `diamond`, `target`, `grid` (new). Pick one that reads as "dashboard" semantically. **Placeholder**: `chevron-right` (same as Logout; family-consistent but not ideal for admin semantic clarity). Ask design team or inspect the Figma component to confirm the real glyph name, then update the Tailwind `<Icon name="..."/>` usage.

No other open questions — all other properties inherit from the parent spec.
