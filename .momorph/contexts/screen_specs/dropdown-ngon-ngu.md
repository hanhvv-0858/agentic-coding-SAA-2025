# Screen: Dropdown-ngôn ngữ (Language dropdown)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `hUyaaugye2` (panel `525:11713`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2 |
| **Screen Group** | Layout overlays (header) |
| **Status** | implemented (prototype in place; visual reconciliation pending) |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

Small popover overlay anchored to the header **Language toggle** button
(`src/components/layout/LanguageToggle.tsx`). Shown on the public
`/login` screen and on every authenticated screen's header.

Two options — **Tiếng Việt** (`vi`) and **English** (`en`) — rendered as
stacked rows with a national-flag glyph + 2-letter locale code
("VN" / "EN"). Selecting a row persists the locale via the existing
`setLocale` Server Action (writes `NEXT_LOCALE` cookie,
`revalidatePath("/")`) and closes the overlay. The active locale carries
a cream (`--color-accent-cream @ 20%`) fill and `aria-checked="true"`.

Member of the **dark-navy panel family** shared with Hashtag filter,
Department filter, and Hashtag picker. Existing prototype at
`src/components/login/LanguageDropdown.tsx` needs a visual reconciliation
against the Figma source (cream panel → dark-navy; "Tiếng Việt" →
"VN" / "EN"; `globe` icon → `flag-gb`).

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Login (`/login`) | Click LanguageToggle pill in header | Always |
| Any authenticated screen | Click LanguageToggle pill in header | Authenticated |
| Keyboard | `Enter` / `Space` / `↓` on focused trigger | Any |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Same URL (locale re-render) | Click row with different locale | `I525:11713;362:6085` (VN) / `I525:11713;362:6128` (EN) | High | `setLocale(next)` → cookie + `revalidatePath("/")`; page re-renders in new locale |
| Same URL (no change) | Click active-locale row / outside / `Esc` / `Tab` | — | High | Closes; no Server Action call (FR-006) |

### Navigation Rules

- **Back behavior**: N/A — overlay, no history.
- **Deep link support**: No — ephemeral; locale persists in the cookie.
- **Auth required**: No — overlay also renders on public Login screen.

---

## Component Schema

### Layout Structure

```
                ┌─ Trigger (LanguageToggle pill)
                │  [🇻🇳 VN ▾]
                ▼
              ┌─────────────────┐
              │ Panel (~120 px) │
              │ ┌─────────────┐ │
              │ │ 🇻🇳 VN    ✓ │ │  ← selected row (cream/20)
              │ ├─────────────┤ │
              │ │ 🇬🇧 EN      │ │  ← unselected (transparent)
              │ └─────────────┘ │
              └─────────────────┘
```

### Component Hierarchy

```
LanguageToggle (Client — src/components/layout/LanguageToggle.tsx)
├── TriggerButton (pill — out of this spec)
└── LanguageDropdown (panel)
    └── ul role="menu"
        ├── VNRow (role="menuitemradio", aria-checked)
        │   ├── flag-vn icon (24×24)
        │   └── "VN" label
        └── ENRow (role="menuitemradio", aria-checked)
            ├── flag-gb icon (24×24) — NEW entry in Icon registry
            └── "EN" label
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Dropdown panel | Organism | `525:11713` | Dark-navy `#00070C`, 1 px cream border, radius 8, padding 6 | Yes |
| VN row (selected) | Molecule | `I525:11713;362:6085` | 108 × 56, bg cream/20, VN flag + "VN" | Yes |
| EN row (unselected) | Molecule | `I525:11713;362:6128` | 110 × 56, transparent bg, Union Jack + "EN" | Yes |
| flag-gb icon | Atom | new | **NEW** glyph added to `src/components/ui/Icon.tsx` | Yes |

---

## Form Fields

N/A — overlay is a listbox/menu, no text input.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| — | — | `currentLocale` comes from the header RSC via `getLocale()` reading the `NEXT_LOCALE` cookie | Overlay is a pure client consumer |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Select new locale | `setLocale(next)` Server Action (`src/libs/i18n/setLocale.ts`) | — | `{ locale: "vi" \| "en" }` | Writes `NEXT_LOCALE` cookie (maxAge 1 y, path `/`, sameSite `lax`) + `revalidatePath("/")` |
| Re-select active locale | — | — | — | **No-op** (FR-006): no Server Action, no analytics, no cookie write; only closes |
| Outside click / `Esc` / chip re-click / `Tab`-out | — | — | — | Closes; focus returns to trigger |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| `setLocale` throws (network loss) | — | Menu closes optimistically; page does NOT re-render in new locale; user retries (no toast per FR-013) |

---

## State Management

### Local (overlay)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `open` | boolean | `false` | Panel visibility (owned by `LanguageToggle`) |
| Active focus | DOM | — | `.focus()` imperative on mount (first selected row) |

### Prop-driven

| Prop | Source | Purpose |
|------|--------|---------|
| `currentLocale` | Server cookie → header RSC | Drive `aria-checked` + initial focus |
| `onSelect(next)` | Caller (`LanguageToggle`) | Fires Server Action inside `useTransition` |
| `onClose` | Caller | Close request |

### Persisted (server)

| State | Store | Lifetime |
|-------|-------|----------|
| `NEXT_LOCALE` | HttpOnly cookie | 1 year |

No global store, no client cache, no `localStorage`.

---

## UI States

### Loading
- N/A — pure-client toggle; < 16 ms paint target. `useTransition`
  pending state is **NOT** surfaced inside the dropdown (FR-013).

### Error
- No inline error UI; `setLocale` is a Server Action that realistically
  can't fail client-side. Menu closes optimistically.

### Success
- Row selected → cookie written → page re-renders in new locale.

### Empty
- N/A — always exactly 2 rows.

### Reduced motion
- 150 ms opacity + 4 px `translateY` entry collapses to instant show/hide.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA roles | Panel `role="menu"`; rows `role="menuitemradio"` + `aria-checked` mirroring active locale |
| Labels | Visible text = "VN" / "EN"; `aria-label` = full "Tiếng Việt" / "English" so SR reads meaningfully (FR-010) |
| Keyboard | `Enter` / `Space` / `↓` on trigger opens + focuses selected row; `↑` / `↓` cycle with wrap; `Enter` / `Space` activates; `Esc` closes; `Tab` closes + exits |
| Focus ring | 2 px cream outline + 2 px offset on `:focus-visible` |
| Contrast | Cream@20% composite on `#00070C` ≈ `#333425`; white on that > 12 : 1 |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | ~120 × 124 panel still anchors to trigger's right edge; no mobile-sheet variant |
| Tablet (640–1023px) | Same |
| Desktop (≥1024px) | Figma baseline |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `language_change` (existing) | Selection of a **different** locale | `{ from: "vi" \| "en"; to: "vi" \| "en" }` |

Re-selecting the active locale fires zero events (FR-006).

---

## Design Tokens

Zero new tokens — dark-navy family inherits:

| Token | Usage |
|-------|-------|
| `--color-panel-surface` (`#00070C`) | Panel bg |
| `--color-border-secondary` (`#998C5F`) | 1 px border |
| `--color-accent-cream` (`#FFEA9E`) | Selected row bg @ 20 %; focus ring |
| `--font-montserrat` | 16/700/24 labels |

---

## Implementation Notes

### Dependencies
- Existing `setLocale` Server Action (`src/libs/i18n/setLocale.ts`).
- Existing `LanguageToggle` trigger (`src/components/layout/LanguageToggle.tsx`).
- Existing `LanguageDropdown` prototype (`src/components/login/LanguageDropdown.tsx`)
  — **needs visual reconciliation** (FR-011 prop surface preserved).
- **New** `flag-gb` glyph in `src/components/ui/Icon.tsx` (Union Jack,
  24 × 24, SVG-in-React per constitution).

### Special Considerations
- Outside-click listener on `window` (NOT `document`) — iOS Safari tap
  delegation fix (TR-004, inherited pattern).
- Panel width hugs content (~120 px). Right-edge aligned to trigger
  (`absolute right-0 top-full mt-2`).
- Implementation does **not** reuse `FilterDropdown` — different prop
  surface (binary vs. n-item) and different anchor (header vs. filter
  bar). Extracting a shared `<DarkNavyPopover>` across all four overlays
  is a future refactor.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — spec + prototype both exist; reconciliation is a task |
| Confidence Score | High |

### Next Steps

- [ ] Land the visual reconciliation PR (cream → dark-navy; labels to
      "VN"/"EN"; `globe` → `flag-gb`) without breaking
      `LanguageDropdown` prop surface.
- [ ] Add `flag-gb` glyph to `Icon.tsx`.
- [ ] Consider extracting `<DarkNavyPopover>` primitive once 4+ overlays
      share the same chrome.
