# Design Style: Dropdown list hashtag (Compose-time hashtag picker)

**Frame ID**: `p9zO-c4a4x` — Figma node `1002:13013`
**Frame Name**: `Dropdown list hashtag`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/p9zO-c4a4x
**Extracted At**: 2026-04-21

---

## Design Tokens

**Zero new tokens.** Every visual value reuses tokens already in [src/app/globals.css](../../../src/app/globals.css) — the picker is a direct member of the dark-navy panel family (sibling of `FilterDropdown`, `LanguageDropdown`).

### Colors

| Token Name | Hex Value | Opacity | Usage |
|---|---|---|---|
| `--color-panel-surface` | `#00070C` | 100 % | Panel background (Figma: `Details-Container-2`) |
| `--color-border-secondary` | `#998C5F` | 100 % | 1 px gold panel border + trigger border |
| `--color-accent-cream` | `#FFEA9E` | 20 % → `rgba(255,234,158,0.20)` | Selected-row fill |
| `--color-accent-cream` | `#FFEA9E` | 100 % | Focus-visible outline + ✓ check glyph fill |
| _(white)_ | `#FFFFFF` | 100 % | Row label text |
| _(white)_ | `#FFFFFF` | 100 % | Trigger background (Figma `Details-Text-Secondary-1: #FFF`) |
| `--color-muted-grey` | `#999999` | 100 % | Trigger label "Hashtag / Tối đa 5" text |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **Row label** | Montserrat | 16 px | 700 | 24 px | 0.15 px |
| **Trigger label** (owned by parent spec; listed for context) | Montserrat | 11 px | 700 | 16 px | 0.5 px |

Rows use the same typography as `FilterDropdown`/`LanguageDropdown` rows — `font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px]`.

### Spacing

| Token Name | Value | Usage |
|---|---|---|
| Panel padding | 6 px | Inner padding on panel (`p-1.5`) |
| Row padding (horizontal) | 16 px | `px-4` on each row |
| Row padding (vertical) | 0 px | Row height carries the vertical space (40 px) |
| Gap (flag/icon → label) | 2 px | Subtle visual separation |
| Trigger-to-panel gap | 14 px (Figma position 56 → 70) or `mt-[14px]` | Vertical distance between trigger bottom and panel top |

### Border & Radius

| Token Name | Value | Usage |
|---|---|---|
| Panel border | 1 px `#998C5F` | Outer gold border |
| Panel border-radius | 8 px | `rounded-lg` |
| Row border-radius | 2 px (selected) / 0 (unselected) | Selected rows get a subtle inner radius per Figma |
| Trigger border | 1 px `#998C5F` | (owned by parent spec) |
| Trigger border-radius | 8 px | (owned by parent spec) |

### Shadows

| Token Name | Value | Usage |
|---|---|---|
| Panel drop shadow | `0 8px 24px rgba(0, 0, 0, 0.35)` | Match `FilterDropdown` + `LanguageDropdown` — same `shadow-[0_8px_24px_rgba(0,0,0,0.35)]` Tailwind arbitrary value |

---

## Layout Specifications

### Container

Picker panel is absolutely-positioned below the "+ Hashtag" trigger.

| Property | Value | Notes |
|---|---|---|
| `position` | absolute | Relative to the trigger's wrapper |
| `top` | `calc(100% + 14px)` | 14 px below trigger bottom |
| `left` | `0` (aligned with trigger) | Anchored via plain CSS `absolute` + parent `relative` wrapper — no `floating-ui` or third-party positioning library (constitution §III "no new deps where avoidable") |
| `width` | 318 px fixed | Large enough for longest Vietnamese hashtag label |
| `max-height` | `calc(100vh - 200px)` | Scrollable when viewport is short |
| `z-index` | `30` | Match sibling dropdowns |

### Layout Structure (ASCII)

```
(trigger "+ Hashtag" — owned by parent Viết Kudo spec)
┌────────────────────────────┐
│ ┌─ Frame 541 ─────────────┐│
│ │ ┌─ Button 116×48 ─────┐ ││
│ │ │  + Hashtag          │ ││  ← trigger click = open picker
│ │ │    Tối đa 5         │ ││
│ │ └──────────────────────┘ ││
│ └─────────────────────────┘│
│                            │
│ 14 px gap                  │
│          ▼                 │
│ ┌─── Panel 318 × ~330 ────┐│
│ │ bg: #00070C              ││
│ │ border: 1px #998C5F      ││
│ │ rounded: 8px             ││
│ │ padding: 6px             ││
│ │ shadow: 0 8 24 rgba(0... ││
│ │                          ││
│ │ ┌─ Selected row ───────┐ ││  ← 306 × 40, cream@20% bg, ✓ on right
│ │ │ #High-perorming   ✓ │ ││
│ │ └──────────────────────┘ ││
│ │ ┌─ Selected row ───────┐ ││
│ │ │ #BE PROFESSIONAL  ✓ │ ││
│ │ └──────────────────────┘ ││
│ │ ┌─ Selected row ───────┐ ││
│ │ │ #BE OPTIMISTIC    ✓ │ ││
│ │ └──────────────────────┘ ││
│ │ ┌─ Unselected row ─────┐ ││  ← 306 × 40, transparent bg, no icon
│ │ │ #BE A TEAM           │ ││
│ │ └──────────────────────┘ ││
│ │ ┌─ Unselected row ─────┐ ││
│ │ │ #THINK OUTSIDE THE B │ ││
│ │ └──────────────────────┘ ││
│ │ ... (more rows)          ││
│ └──────────────────────────┘│
└────────────────────────────┘
```

---

## Component Style Details

### Panel (B — `1002:13102`)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `1002:13102` | — |
| position | absolute | `absolute` |
| width | 318 px | `w-[318px]` |
| max-height | `calc(100vh - 200px)` | `max-h-[calc(100vh-200px)]` |
| overflow-y | auto | `overflow-y-auto` |
| padding | 6 px | `p-1.5` |
| background | `#00070C` | `bg-[var(--color-panel-surface)]` |
| border | 1 px `#998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 8 px | `rounded-lg` |
| box-shadow | `0 8px 24px rgba(0,0,0,0.35)` | `shadow-[0_8px_24px_rgba(0,0,0,0.35)]` |
| display | flex column | `flex flex-col` |
| z-index | 30 | `z-30` |
| role | `listbox` | `role="listbox" aria-multiselectable="true"` |

---

### Selected row (A / B / C — `1002:13185`, `1002:13207`, `1002:13216`)

| Property | Value | CSS |
|---|---|---|
| width | 306 px (panel-width minus 12 px padding) | `w-full` (inside 318 panel with 6 px padding) |
| height | 40 px desktop / 44 px mobile (constitution §II touch-target) | `h-11 sm:h-10` (Tailwind mobile-first: 44 px default, 40 px at `sm` breakpoint+) |
| padding | 0 / 16 | `px-4` |
| background | `rgba(255, 234, 158, 0.20)` | `bg-[var(--color-accent-cream)]/20` |
| border-radius | 2 px | `rounded-sm` |
| display | flex row | `flex flex-row items-center justify-between` |
| cursor | pointer | `cursor-pointer` |

**Label** (inside selected row):

| Property | Value | CSS |
|---|---|---|
| font | Montserrat 16 / 700 / 24 / 0.15 px | `font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px]` |
| color | white | `text-white` |

**✓ Check icon** (on right):

| Property | Value | CSS |
|---|---|---|
| size | 24 × 24 | `w-6 h-6` |
| colour | cream (matches selected-state accent) | `text-[var(--color-accent-cream)]` |
| Position | right edge | `ml-auto` via row flex-between |
| Icon | Reuse existing `check` from `Icon.tsx` | `<Icon name="check" size={24} />` |

**States (selected row)**:

| State | Changes |
|---|---|
| Default (selected) | bg cream @ 20 %, ✓ visible, label white |
| Hover | bg cream @ 25 % (subtle deepening) |
| Focus-visible | outline 2 px cream, offset 2 px |
| Click | → deselect (row becomes an unselected row — see next) |

---

### Unselected row (D + others — `1002:13104`, `1002:13131`, `1002:13137`, `1002:13151`, `1002:13227`)

| Property | Value | CSS |
|---|---|---|
| width | 306 px | `w-full` |
| height | 40 px desktop / 44 px mobile | `h-11 sm:h-10` (same pattern as selected row — constitution §II) |
| padding | 0 / 16 | `px-4` |
| background | transparent | `bg-transparent` (panel shows through) |
| border-radius | 0 | `rounded-none` or omit |
| display | flex row | `flex flex-row items-center` |
| cursor | pointer (when < 5 selected) / not-allowed (when = 5) | `cursor-pointer aria-disabled:cursor-not-allowed` |

**Label**: same as selected-row label above.

**No ✓ icon** — the right 24 × 24 slot is empty.

**States (unselected row)**:

| State | Changes |
|---|---|
| Default | bg transparent |
| Hover | bg cream @ 10 % (`bg-[var(--color-accent-cream)]/10`) — matches `FilterDropdown` hover |
| Focus-visible | outline 2 px cream, offset 2 px |
| Disabled (when selection-cap = 5) | opacity 50 %, cursor not-allowed, no hover effect |
| Click (when < 5 selected) | → toggle to selected row |
| Click (when = 5 selected) | no-op (FR-005) |

---

### Loading skeleton state (US4)

When `options` is `undefined` or the parent signals a loading state, render 3 skeleton rows:

| Property | Value | CSS |
|---|---|---|
| Size | 306 × 40 each | `w-full h-10` |
| Background | `bg-white/5` with shimmer | `bg-white/5 animate-pulse` |
| Border-radius | 2 px | `rounded-sm` |

---

### Empty state (US4)

When `options` is `[]`:

| Property | Value | CSS |
|---|---|---|
| Message (vi) | "Chưa có hashtag" | `text-[var(--color-muted-grey)]` |
| Message (en) | "No hashtags available" | same |
| Padding | 24 px | `p-6` |
| Alignment | centred | `text-center` |
| Font | Montserrat 16 / 700 / 24 | same as row label but muted colour |

---

### Error state (US4 AC3)

When `loadError` prop is non-null, render:

| Element | Content (vi) | Content (en) | CSS |
|---|---|---|---|
| Message | "Không tải được hashtag." | "Could not load hashtags." | `text-[var(--color-error)] p-6 text-center` |
| Retry button | "Thử lại" | "Try again" | `mt-2 underline text-[var(--color-accent-cream)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]` |

Retry click → `onRetry` callback fires (parent owns the Server Action re-invocation; see spec TR-001).

Note: `--color-error` is a token introduced by the Viết Kudo spec (not yet in globals.css). If the error state lands before that token is added, fall back to a literal `text-red-400`.

---

## Component Hierarchy with Styles

```
HashtagField wrapper (Viết Kudo modal)                    ← parent spec
├── "+ Hashtag" trigger button                            ← parent spec
└── <ul role="listbox" aria-multiselectable="true"         ← THIS spec
       absolute z-30 w-[318px]
       max-h-[calc(100vh-200px)] overflow-y-auto
       p-1.5 flex flex-col
       bg-[var(--color-panel-surface)]
       border border-[var(--color-border-secondary)] rounded-lg
       shadow-[0_8px_24px_rgba(0,0,0,0.35)]
       motion-safe:transition-opacity motion-safe:duration-150>
    │
    ├── <li role="option" aria-selected="true"
    │      class="h-11 sm:h-10 w-full flex items-center justify-between
    │              px-4 rounded-sm cursor-pointer
    │              bg-[var(--color-accent-cream)]/20
    │              hover:bg-[var(--color-accent-cream)]/25
    │              focus-visible:outline focus-visible:outline-2
    │              focus-visible:outline-[var(--color-accent-cream)]
    │              focus-visible:outline-offset-2">
    │   ├── <span class="font-[family-name:var(--font-montserrat)]
    │   │               text-base leading-6 font-bold tracking-[0.15px] text-white">
    │   │     #High-performing
    │   ├── <Icon name="check" size={24}
    │               class="text-[var(--color-accent-cream)]" />
    │
    ├── <li role="option" aria-selected="false"
    │      aria-disabled={selectedSlugs.length === 5}
    │      class="h-11 sm:h-10 w-full flex items-center px-4 cursor-pointer
    │              bg-transparent
    │              hover:bg-[var(--color-accent-cream)]/10
    │              aria-disabled:opacity-50 aria-disabled:cursor-not-allowed
    │              focus-visible:outline focus-visible:outline-2
    │              focus-visible:outline-[var(--color-accent-cream)]
    │              focus-visible:outline-offset-2">
    │   ├── <span …>
    │         #BE A TEAM
    │
    └── (repeat for each option)
```

---

## Responsive Specifications

### Breakpoints

| Name | Min Width | Max Width |
|---|---|---|
| Mobile | 0 | 639 px |
| Tablet | 640 px | 1023 px |
| Desktop | 1024 px | ∞ |

### Responsive Changes

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Panel width | 318 px (may overflow the Viết Kudo modal on narrow mobile — accept horizontal scroll OR clip to modal width via `max-w-full`) | 318 px | 318 px |
| Row height | **44 px** (constitution §II touch-target) | 40 px (`sm:` breakpoint kicks in) | 40 px |
| Panel max-height | `calc(100vh - 120px)` (more viewport space reserved) | `calc(100vh - 200px)` | `calc(100vh - 200px)` |
| Motion | Respect `prefers-reduced-motion` on all breakpoints | Same | Same |

**Mobile touch-target**: Row height bumps to 44 px on mobile via Tailwind `h-11 sm:h-10` — constitution §II is a hard rule ("Touch targets MUST be at least 44 × 44 px on mobile"), not waivable. The 4 px divergence from the 40 px Figma spec on mobile only is the agreed trade-off.

---

## Icon Specifications

| Icon Name | Size | Status | Usage |
|---|---|---|---|
| `check` | 24 × 24 | **EXISTS** (`Icon.tsx` — used on CopyLinkButton) | ✓ on selected row |

No new icons.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Panel open | opacity 0 → 1 | 150 ms | `ease-out` | Trigger activation |
| Panel open | translateY(-4 px) → 0 | 150 ms | `ease-out` | Same |
| Panel close | opacity 1 → 0 | 150 ms | `ease-in` | Close |
| Row hover | background-color | 120 ms | `ease-out` | Hover |
| Row toggle (click) | background-color + icon fade | 100 ms | `ease-out` | Click |

**Reduced motion**: All transitions wrapped `motion-safe:`. Under `prefers-reduced-motion: reduce`, panel open/close is instant; row toggles instantly swap state without the 100 ms colour blend.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS Class | React Component |
|---|---|---|---|
| Panel | `1002:13102` | `absolute z-30 w-[318px] max-h-[calc(100vh-200px)] overflow-y-auto p-1.5 flex flex-col bg-[var(--color-panel-surface)] border border-[var(--color-border-secondary)] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)] motion-safe:transition-opacity motion-safe:duration-150` | `<ul role="listbox" aria-multiselectable="true" aria-label="Chọn hashtag">` in `<HashtagPicker />` |
| Selected row | `1002:13185` etc. | `h-11 sm:h-10 w-full flex items-center justify-between px-4 rounded-sm cursor-pointer bg-[var(--color-accent-cream)]/20 hover:bg-[var(--color-accent-cream)]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2` | `<li role="option" aria-selected="true" onClick={() => onToggle(slug)}>` |
| Unselected row | `1002:13104` etc. | Same as selected but `bg-transparent hover:bg-[var(--color-accent-cream)]/10 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed` | `<li role="option" aria-selected="false" aria-disabled={atCap}>` |
| Row label | inner TEXT node e.g. `1002:13190` | `font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px] text-white` | `<span>` |
| ✓ check icon | `1002:13204` etc. (component `1002:13201`) | `w-6 h-6 text-[var(--color-accent-cream)]` | `<Icon name="check" size={24} />` |

---

## Notes

- **Hashtag labels are locale-aware** — render whatever `getKudoHashtags()` returns. Do NOT hard-code the Figma placeholder labels ("#BE PROFESSIONAL", etc.) — those are design-tool placeholders, not real data.
- **`role="listbox"` vs `FilterDropdown`'s `role="combobox"`** — this picker has NO text input associated with it (it's pure selection), so `role="listbox"` is the correct ARIA role (WAI-ARIA 1.2). `aria-multiselectable="true"` communicates the multi-select semantic. Selected-state on options uses `aria-selected` (not `aria-checked` — `aria-checked` is for `role="option"` inside `role="menu"` trees, not inside `role="listbox"`).
- **Roving tabindex pattern** — each `<li role="option">` carries `tabindex="-1"` by default; the currently-focused option has `tabindex="0"`. Arrow-key handler on `<ul>` updates which `<li>` gets `tabindex="0"` + calls `.focus()` on the new one. The `<ul>` itself is NOT in the Tab sequence. This matches WAI-ARIA 1.2 Authoring Practices for multi-select listbox.
- **`aria-disabled` on an option at cap** — valid per WAI-ARIA 1.2. Screen readers announce "option X, dimmed" (JAWS) or "unavailable" (VoiceOver). Pair with `opacity-50` + `cursor-not-allowed` CSS for visual parity.
- **✓ icon reuse**: `<Icon name="check" />` already exists and is 24 × 24 with `currentColor` stroke — colour controllable via `text-[var(--color-accent-cream)]` class on the parent element.
- **Cap visual feedback** (US2 AC1): `aria-disabled="true"` + `opacity-50` + `cursor-not-allowed` is **required** at cap (spec US2 AC1 was tightened in review round 1). Optional enhancements a developer may add but not required: a brief shake animation (`animate-[shake_200ms]`) OR a `title="Tối đa 5 hashtag"` native tooltip. Don't add a custom tooltip library.
- **Focus-ring contrast**: Cream `#FFEA9E` outline on `#00070C` panel has ~13:1 contrast — well above WCAG AA for non-text contrast (3:1 minimum). Safe.
