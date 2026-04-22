# Design Style: Dropdown-profile

**Frame ID**: `z4sCl3_Qtk`
**Figma frame name**: Dropdown-profile
**Parent container Node ID**: `721:5223`
**Root component Node ID**: `666:9601`
**Date**: 2026-04-22

---

## 1. Overview

Small dark-navy dropdown panel that opens from an account/avatar trigger in the top navigation. Renders two stacked menu items — "Profile" (icon_text) and "Logout" (icon_text). Shares the **dark-navy listbox family** with `Language Dropdown`, `FilterDropdown`, `HashtagPicker` — same surface, same border, same interaction palette. Width hugs content (≈133 px); height hugs two 56 px rows.

---

## 2. Design Tokens (Figma → CSS variables)

### 2.1 Colors

| Figma variable / value                   | Hex                    | CSS variable                                     | Usage                                                       |
| ---------------------------------------- | ---------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `--Details-Container-2`                  | `#00070C`              | `--color-panel-surface` (project-standard)       | Panel background (near-black dark navy)                     |
| `--Details-Border`                       | `#998C5F`              | `--color-border-secondary`                       | 1 px olive panel border                                     |
| `--Details-Text-Secondary-1`             | `#FFFFFF`              | `--color-text-on-dark` (= pure white)            | Menu item text                                              |
| Accent glow (text-shadow second stop)    | `#FAE287`              | `--color-accent-cream-glow` (alias of cream)     | Active-state glow around label                              |
| Cream at α=0.10 (active-state background)| `rgba(255,234,158,.10)`| `bg-[var(--color-accent-cream)]/10`              | Active/hover row fill                                       |
| Item idle background                     | transparent            | —                                                | Non-active rows have no fill                                |

**Notes**
- The Figma root frame background `rgba(105,105,105,1)` (`#696969`) is the Figma artboard only — ignore in implementation.
- `--color-panel-surface` is already defined in the project (Kudos Live board spec). `#00070C` is very close to the existing panel surface; reuse the existing token instead of introducing a new one.

### 2.2 Typography

All text shares **one style** across both menu items (per Figma):

| Property        | Value          | Tailwind                                    |
| --------------- | -------------- | ------------------------------------------- |
| Font family     | Montserrat     | `font-[family-name:var(--font-montserrat)]` |
| Font size       | 16 px          | `text-base`                                 |
| Line-height     | 24 px (150 %)  | `leading-6`                                 |
| Font weight     | 700            | `font-bold`                                 |
| Letter-spacing  | 0.15 px        | `tracking-[0.15px]`                         |
| Color           | `#FFFFFF`      | `text-white`                                |
| Text-align      | center         | `text-center`                               |
| Text-shadow (active) | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` | `[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]` |

### 2.3 Spacing & Sizing

| Token                 | Value              | Notes                                                   |
| --------------------- | ------------------ | ------------------------------------------------------- |
| Panel padding         | 6 px all sides     | Inner gutter around the menu item list                  |
| Panel gap (items)     | 0 px               | Items stack flush; active-state highlight provides the  |
|                       |                    | visual separation                                       |
| Item height           | 56 px              | Fixed — constitution §II touch-target ≥ 44 px satisfied |
| Item padding          | 16 px all sides    | Inside each row                                         |
| Item gap (text ↔ icon)| 4 px               | Horizontal                                              |
| Panel width           | hug content (~133 px on desktop; may grow with locale) | |
| Profile item width    | 119 px             | From Figma absolute sizing — implement as hug-content   |
| Logout item width     | 121 px             | Same — 2 px difference is the icon glyph                |
| Icon size             | 24 × 24            | 24 px square box                                        |

### 2.4 Borders & Radii

| Token               | Value                  |
| ------------------- | ---------------------- |
| Panel border        | 1 px solid `#998C5F`   |
| Panel border-radius | 8 px                   |
| Item border-radius  | 4 px                   |

### 2.5 Shadows

- No drop-shadow on the panel in Figma (parent handles layering via `position: absolute` + `z-index`).
- Active-state text glow handled via `text-shadow` only (see Typography table).

---

## 3. Component Tree (Figma hierarchy)

```
721:5223 (frame artboard — ignored)
└── 666:9601  A  Dropdown-List (container)
    ├── I666:9601;563:7844  A.1  Profile menu item (icon_text)
    │   ├── Frame 486 (text wrapper)
    │   │   └── TEXT  "Profile"
    │   └── IC  user icon (componentId 186:1611)
    └── I666:9601;563:7868  A.2  Logout menu item (icon_text)
        ├── Frame 485 (text wrapper)
        │   └── TEXT  "Logout"
        └── IC  chevron-right icon (componentId 335:10890)
```

---

## 4. ASCII Layout

```
Trigger (avatar on header bar)
   │
   ▼ position: absolute; top: 100%; right: 0; mt: 8px
┌───────────────────────────────────┐
│ 1 px #998C5F border, rounded 8    │  ← 666:9601
│ bg #00070C · padding 6            │
│ ┌───────────────────────────────┐ │
│ │ bg cream α.10 · radius 4      │ │  ← A.1 (active / hover)
│ │ h-14 px-4 py-4 flex gap-1     │ │
│ │ [Profile text-center]  [👤ic] │ │
│ └───────────────────────────────┘ │
│ ┌───────────────────────────────┐ │
│ │ bg transparent · radius 4     │ │  ← A.2 (idle)
│ │ h-14 px-4 py-4 flex gap-1     │ │
│ │ [Logout  text-center]   [>ic] │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘
```

---

## 5. Component Details

### 5.1 Panel — `A_Dropdown-List` (`666:9601`)

| Property     | Value                                     | CSS / Tailwind                                           |
| ------------ | ----------------------------------------- | -------------------------------------------------------- |
| Width        | hug content                                | `w-max` (+ `min-w-[133px]` floor)                         |
| Height       | hug content                                | default                                                  |
| Layout       | flex column                                | `flex flex-col`                                           |
| Padding      | 6 px all sides                             | `p-1.5`                                                   |
| Gap          | 0                                          | (no gap utility)                                          |
| Background   | `#00070C`                                  | `bg-[var(--color-panel-surface)]`                         |
| Border       | 1 px solid `#998C5F`                       | `border border-[var(--color-border-secondary)]`           |
| Radius       | 8 px                                       | `rounded-lg`                                              |
| Role         | `menu` (WAI-ARIA)                          | `role="menu"`                                             |
| Position     | anchor below trigger, right-aligned        | `absolute right-0 top-full mt-2 z-40`                     |

### 5.2 Menu item — `A.1 Profile` (`I666:9601;563:7844`)

| Property       | Value                                          | CSS / Tailwind                                            |
| -------------- | ---------------------------------------------- | --------------------------------------------------------- |
| Height         | 56 px                                          | `h-14`                                                    |
| Padding        | 16 px all sides                                | `px-4 py-4`                                               |
| Gap            | 4 px (text ↔ icon)                             | `gap-1`                                                   |
| Layout         | flex row items-center justify-start            | `inline-flex items-center justify-start`                  |
| Radius         | 4 px                                           | `rounded`                                                 |
| Icon           | 24 × 24 user glyph (right of label)            | `<Icon name="user" size={24} />`                          |
| Role           | `menuitem`                                     | `role="menuitem"`                                         |
| Label          | "Profile"                                      | (text centered inside text wrapper)                       |

### 5.3 Menu item — `A.2 Logout` (`I666:9601;563:7868`)

Identical geometry to A.1 except icon = `chevron-right` (24 × 24) and default state has transparent background.

### 5.4 Interactive states (applies to both items)

| State           | Background                        | Text-shadow                                                                 | Other                                                                                                                      |
| --------------- | --------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Default         | transparent                       | none                                                                        | `cursor-pointer`                                                                                                           |
| Hover           | `rgba(255,234,158,.10)`           | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287`                               | —                                                                                                                          |
| Focus-visible   | `rgba(255,234,158,.10)` + 2 px cream outline offset 2 | same as hover                                           | `outline outline-2 outline-[var(--color-accent-cream)] outline-offset-2`                                                    |
| Active (pressed) | `rgba(255,234,158,.18)`          | same as hover                                                                | brief 100 ms tint on mousedown                                                                                              |

**Disabled state** is not used by this panel in MVP — both items are always enabled when the menu is open. If a future feature introduces an item that can be disabled (e.g., Logout during an ongoing API call), apply `opacity-50 cursor-not-allowed aria-disabled="true"` and drop the hover/focus backgrounds.

The Figma frame illustrates the **hover/active state on Profile** (cream α=0.10 fill + glow). The idle default renders with transparent fill — the hover state just swaps in the fill + glow via `motion-safe:transition-colors`.

---

## 6. Responsive Specifications

| Breakpoint       | Behaviour                                                                    |
| ---------------- | ---------------------------------------------------------------------------- |
| Desktop (≥ 1024) | Panel anchored to trigger (`right-0 top-full mt-2`); width hugs content.     |
| Tablet (640–1023)| Same desktop anchoring; if header trigger moves, keep `right-0` alignment.   |
| Mobile (< 640)   | Panel still opens anchored below trigger; no full-sheet variant.             |
| Touch-target     | Each item = 56 × ≥ 119 px → exceeds 44 × 44 constitution minimum.            |
| Reduced motion   | Drop transitions (`motion-safe:` gates) and text-shadow animation.           |

---

## 7. Accessibility

- **Role**: Panel `role="menu"`; children `role="menuitem"`.
- **Label**: `aria-label="Account menu"` on the panel; concrete text labels on items.
- **Keyboard (P1)**: `Tab` / `Shift+Tab` traverse items in document order; `Enter` / `Space` activate the focused item; `Esc` closes the menu and returns focus to the trigger.
- **Keyboard (P3 nice-to-have)**: `ArrowDown` / `ArrowUp` with roving tabindex; `Tab` leaving the menu bounds auto-closes. Align with spec FR-006 / FR-007 — not required for MVP.
- **Focus trap**: not required (menu is transient; closing on outside click / Esc handles dismissal).
- **Motion-safe**: hover/focus transitions wrapped in `motion-safe:` so reduced-motion users see no animated state changes.

---

## 8. Implementation Mapping

| Figma Node ID                    | Role                  | Tailwind / CSS skeleton                                                                                  | React component        |
| -------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| `666:9601`                       | Panel wrapper         | `absolute right-0 top-full mt-2 z-40 flex flex-col rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5` | `<ProfileDropdown />`  |
| `I666:9601;563:7844`             | Profile menu item     | `inline-flex h-14 items-center justify-start gap-1 rounded px-4 py-4 text-base leading-6 font-bold text-white tracking-[0.15px] hover:bg-[var(--color-accent-cream)]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer` | `<ProfileItem />` atom  |
| `I666:9601;563:7844;186:1498`    | user icon             | `<Icon name="user" size={24} />`                                                                          | `<Icon />` (sprite)     |
| `I666:9601;563:7868`             | Logout menu item      | same classes as Profile item                                                                              | `<LogoutItem />` atom   |
| `I666:9601;563:7868;186:1441`    | chevron-right icon    | `<Icon name="chevron-right" size={24} />`                                                                 | `<Icon />` (sprite)     |

**Existing icons to reuse**: `chevron-right` already in the sprite. `user` may need adding to the sprite (24 × 24, stroke-current).

---

## 9. Animation / Transitions

- **Panel open/close**: instant in MVP (matches current `ProfileMenu.tsx`). A 150 ms opacity + translate-y 4 px fade-in can be added later gated by `motion-safe:transition-opacity` — not blocking release.
- **Item hover/focus**: `motion-safe:transition-colors duration-150`.
- **No scale / pulse** effects — constitution §II forbids gratuitous motion.

---

## 10. Known divergence vs current implementation

The current [`src/components/layout/ProfileMenu.tsx`](../../../src/components/layout/ProfileMenu.tsx) is a functional menu but **does not yet match this design-style**. Alignment tasks (plan phase):

| Attribute          | Current (ProfileMenu.tsx)                 | Target (this doc)                                               |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| Panel background   | `bg-[var(--color-brand-800)]`              | `bg-[var(--color-panel-surface)]` (#00070C)                     |
| Panel border       | `shadow-lg ring-1 ring-white/10`           | `border border-[var(--color-border-secondary)]` (1 px olive)    |
| Panel padding      | 0 (items edge-to-edge via overflow-hidden) | `p-1.5` (6 px)                                                  |
| Item height        | `py-3` (≈ 48 px)                           | `h-14` (56 px)                                                  |
| Item icons         | text-only                                  | `<Icon name="user"/>` + `<Icon name="chevron-right"/>`          |
| Active-state fill  | `hover:bg-white/10`                        | `hover:bg-[var(--color-accent-cream)]/10`                       |
| Active text glow   | none                                       | `text-shadow: 0 4px 4px rgba(0,0,0,.25), 0 0 6px #FAE287`       |
| Item border-radius | inherits panel                             | `rounded` (4 px)                                                |
| Min width          | `min-w-[220px]`                            | hug content (~133 px)                                           |

Every gap above has an explicit target; plan phase turns each into a task. **Behavioural parts (open/close, outside-click, Esc, form-action signOut, admin-conditional row)** already match — no changes needed there.
