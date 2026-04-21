# Design Style: Dropdown-ngôn ngữ (Language dropdown)

**Frame ID**: `hUyaaugye2`
**Frame Name**: `Dropdown-ngôn ngữ`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
**Extracted At**: 2026-04-21

---

## Design Tokens

All tokens below already exist in [src/app/globals.css](../../../src/app/globals.css) or are Tailwind defaults. **Zero new tokens** are introduced by this spec — intentionally, so the Language dropdown slots into the same dark-navy popover family as the Hashtag (`JWpsISMAaM`) and Department (`WXK5AYB_rG`) filters with no design-system churn.

### Colors

| Token Name | Hex Value | Opacity | Usage |
|------------|-----------|---------|-------|
| `--color-panel-surface` | `#00070C` | 100 % | Panel background (Figma: `Details-Container-2`) |
| `--color-border-secondary` | `#998C5F` | 100 % | 1 px gold panel border (Figma: `Details-Border`) |
| `--color-accent-cream` | `#FFEA9E` | **20 %** | Selected-row fill — rendered as `rgba(255, 234, 158, 0.20)` per Figma |
| `--color-accent-cream` | `#FFEA9E` | 100 % | Focus-visible outline on rows |
| _(white)_ | `#FFFFFF` | 100 % | Row label text colour |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|------------|-------------|------|--------|-------------|----------------|
| **Row label** | Montserrat (`var(--font-montserrat)`) | 16 px | 700 | 24 px | 0.15 px |

Source: Figma node `I525:11713;362:6085;186:1821;186:1439` (VN label) + sibling EN label — `fontSize: 16px`, `fontWeight: 700`, `lineHeight: 24px`, `letterSpacing: 0.15px`. Existing Tailwind utilities map to `font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px]` — exactly the same classes as the trigger pill already uses in [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) line 73.

### Spacing

| Token Name | Value | Usage |
|------------|-------|-------|
| `--spacing-panel-padding` | 6 px (Tailwind `p-1.5`) | Inner padding on the panel — matches `FilterDropdown` primitive |
| `--spacing-row-padding` | 16 px (`p-4`) | Inner padding on each row button |
| `--spacing-row-gap` | 4 px (`gap-1`) | Gap between the flag icon and the locale-code label |
| `--spacing-trigger-gap` | 8 px (`mt-2`) | Vertical gap between trigger pill and panel top |

### Border & Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| `--radius-panel` | 8 px (`rounded-lg`) | Panel outer radius |
| `--radius-row` | 4 px (`rounded`) | Row hit-target radius (Figma: 4 px on the `Frame 485` container) |
| `--radius-row-inner` | 2 px | Inner button radius on the VN row (Figma `I525:11713;362:6085` shows `borderRadius: 2px` on the selected container — visually absorbed into the 4 px hit target) |
| `--border-width-panel` | 1 px | Gold panel border |

### Shadows

| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-dropdown` | `0 8px 24px rgba(0, 0, 0, 0.35)` | Panel drop shadow — match the `--shadow-fab-tile` value so the Language dropdown, FAB tiles, and FilterDropdowns all share one shadow |

**Implementation note**: `--shadow-fab-tile` from globals.css is `0 8px 24px rgba(0, 0, 0, 0.35)` — the SAME value as `FilterDropdown`'s inline `shadow-[0_8px_24px_rgba(0,0,0,0.35)]`. Reuse one of these patterns; do NOT invent a new shadow token.

---

## Layout Specifications

### Container

The dropdown is absolutely-positioned relative to its trigger (`LanguageToggle`). No viewport-level container applies.

| Property | Value | Notes |
|----------|-------|-------|
| `position` | absolute | Anchored to the `LanguageToggle` ref container |
| `top` | `calc(100% + 8px)` | 8 px below the trigger bottom edge |
| `right` | `0` | Right-edge aligned with the trigger's right edge |
| `width` | hug content (~120 px) | `w-fit` or `w-[120px]`; MUST NOT stretch |
| `z-index` | `30` | Same as the existing `LanguageDropdown` prototype |

### Layout Structure (ASCII)

```
┌─────────────────────────────── Header (LanguageToggle) ──────────────────────────────┐
│                                                                                      │
│   … other header items …                      ┌──────────────────┐                   │
│                                                │ 🇻🇳 VN ▾          │  ← trigger pill │
│                                                └────┬─────────────┘                  │
└─────────────────────────────────────────────────────┼────────────────────────────────┘
                                                      │ 8 px gap (`mt-2`)
                                                      ▼
                           ┌────────────────────────────────────────────┐
                           │  A_Dropdown-List (panel)                   │
                           │  width: ~120px  ·  height: ~124px          │
                           │  bg: #00070C · border: 1px #998C5F · r: 8px│
                           │  padding: 6px  ·  shadow below             │
                           │  ┌──────────────────────────────────────┐  │
                           │  │  A.1  ●SELECTED                      │  │
                           │  │  w:108 · h:56 · r:4                  │  │
                           │  │  bg: rgba(255,234,158,0.20)          │  │
                           │  │  ┌──┐                                │  │
                           │  │  │🇻🇳│ VN          (16/700/24 white)  │  │
                           │  │  └──┘                                │  │
                           │  └──────────────────────────────────────┘  │
                           │  ┌──────────────────────────────────────┐  │
                           │  │  A.2                                 │  │
                           │  │  w:110 · h:56 · r:4                  │  │
                           │  │  bg: transparent (panel shows)       │  │
                           │  │  ┌──┐                                │  │
                           │  │  │🇬🇧│ EN          (16/700/24 white)  │  │
                           │  │  └──┘                                │  │
                           │  └──────────────────────────────────────┘  │
                           └────────────────────────────────────────────┘
```

---

## Component Style Details

### A_Dropdown-List (panel)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `525:11713` | — |
| position | absolute | `absolute right-0 top-full mt-2` |
| width | hug / ~120 px | `w-fit` (preferred) or `w-[120px]` |
| display | flex | `flex flex-col` |
| padding | 6 px | `p-1.5` |
| background | `#00070C` | `bg-[var(--color-panel-surface)]` |
| border | 1 px solid `#998C5F` | `border border-[var(--color-border-secondary)]` |
| border-radius | 8 px | `rounded-lg` |
| box-shadow | `0 8px 24px rgba(0,0,0,0.35)` | `shadow-[var(--shadow-fab-tile)]` or the inline equivalent |
| z-index | 30 | `z-30` |

**Figma source**: The `styles` block on node `525:11713` gives: `border: "1px solid var(--Details-Border, #998C5F)"`, `padding: "6px"`, `background: "var(--Details-Container-2, #00070C)"`, `border-radius: "8px"`, `flex-direction: "column"`, `align-items: "flex-start"`.

---

### A.1_tiếng Việt — Selected row (VN)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I525:11713;362:6085` | — |
| display | flex | `inline-flex` |
| align-items | center | `items-center` |
| justify-content | space-between | `justify-between` |
| width | equal to the widest row (panel hugs) | `w-full` on the button + `w-fit` on the panel. The 108 vs 110 px asymmetry in the Figma frame is a design-tool artefact; implementation renders both rows at identical width (see FR-011). |
| height | 56 px | `h-14` |
| padding | 16 px | `p-4` |
| gap (flag → label) | 4 px (Figma) / 2 px (inner) | `gap-1` |
| background | `rgba(255, 234, 158, 0.20)` | `bg-[var(--color-accent-cream)]/20` |
| border-radius | 4 px | `rounded` |
| typography | 16 / 700 / 24 / 0.15 px | `font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px]` |
| color | white | `text-white` |
| cursor | pointer | `cursor-pointer` |

**Figma sources**:
- Container: node `I525:11713;362:6085`, `backgroundColor: rgba(255,234,158, 0.20)`, `alignItems: center`, `flexDirection: row`.
- Hit target: node `I525:11713;362:6085;186:1821`, `padding: 16px`, `justify-content: space-between`, `border-radius: 4px`.
- Label: node `I525:11713;362:6085;186:1821;186:1439`, character `"VN"`, `fontSize: 16px`, `fontWeight: 700`, `lineHeight: 24px`, `letterSpacing: 0.15px`, `fontFamily: "Montserrat"`.

**States**:

| State | Changes |
|-------|---------|
| Default (when active locale) | background: `var(--color-accent-cream)` @ 20 %, `aria-checked="true"` |
| Hover | no change when already selected — the 20 % fill is the terminal state for the active row |
| Focus-visible | outline: 2 px solid `var(--color-accent-cream)`, offset: 2 px, same token family as every other interactive control in the kudos surface (see `focus-visible.spec.tsx`) |
| Active (mouse-down) | background: `var(--color-accent-cream)` @ 25 % (10 % brighter — optional, safe to skip) |

---

### A.2_tiếng Anh — Unselected row (EN)

| Property | Value | CSS |
|----------|-------|-----|
| **Node ID** | `I525:11713;362:6128` | — |
| display | flex | `inline-flex` |
| align-items | center | `items-center` |
| justify-content | space-between | `justify-between` |
| width | equal to the VN row (panel hugs) | `w-full` on the button — matches VN row width per FR-011 |
| height | 56 px | `h-14` |
| padding | 16 px | `p-4` |
| gap | 4 px | `gap-1` |
| background | transparent | _(panel surface shows through)_ |
| border-radius | 4 px | `rounded` |
| typography | 16 / 700 / 24 / 0.15 px | same as VN row |
| color | white | `text-white` |

**States**:

| State | Changes |
|-------|---------|
| Default | background: transparent |
| Hover | background: `var(--color-accent-cream)` @ 8–10 % (use `bg-[var(--color-accent-cream)]/10`) — matches hover token on FilterDropdown options |
| Selected (i.e. when EN becomes the active locale) | same 20 % cream fill as the VN row |
| Focus-visible | 2 px cream outline, offset 2 px |
| Active (mouse-down) | background: `var(--color-accent-cream)` @ 15 % |

---

### Flag icons

| Icon | Size | Location | Source |
|------|------|----------|--------|
| `flag-vn` | 24 × 24 px | VN row (left of "VN" label) | **Exists** in `src/components/ui/Icon.tsx` |
| `flag-gb` | 24 × 24 px | EN row (left of "EN" label) | **NEW** — add during implementation |

**Figma nodes for the flag containers**:
- VN flag: `I525:11713;362:6085;186:1821;186:1709` (width: 24, height: 24)
- EN flag: `I525:11713;362:6128;186:1903;186:1709` (width: 24, height: 24)

**Icon naming decision (normalise to `flag-gb`, drop the "NIR" suffix)**: The Figma asset is labelled "GB-NIR - Northern Ireland" but the rendered glyph is the full Union Jack (St George + St Andrew + St Patrick crosses, visible as three `stripe` / `cross` sub-groups under `I525:11713;362:6128;186:1903;186:1709` in the Figma node tree). To avoid the misleading "NIR" suffix in our Icon registry, register the glyph as `flag-gb`. The deliverable is a 24 × 24 SVG inlined as a React component under `src/components/ui/Icon.tsx` (no `.svg` file under `public/` and no `<img>` tag — per constitution's "All icons MUST be in the Icon Component" rule).

---

## Component Hierarchy with Styles

```
LanguageToggle wrapper (relative, h-14 w-[108px] flex items-center)
├── Trigger button (h-full w-full flex items-center justify-between gap-0.5 p-4 rounded
│                    text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2
│                    focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2
│                    cursor-pointer transition-colors)
│   └── [out of scope — owned by header specs]
│
└── A_Dropdown-List panel (absolute right-0 top-full mt-2 w-fit z-30 p-1.5
                            bg-[var(--color-panel-surface)]
                            border border-[var(--color-border-secondary)] rounded-lg
                            shadow-[0_8px_24px_rgba(0,0,0,0.35)])
    │
    ├── A.1 VN row (button, role="menuitemradio", aria-checked={active==="vi"},
    │                aria-label="Tiếng Việt",
    │                w-full h-14 flex items-center justify-between gap-1 p-4 rounded
    │                text-white text-base leading-6 font-bold tracking-[0.15px]
    │                font-[family-name:var(--font-montserrat)]
    │                bg-[var(--color-accent-cream)]/20  <-- only when active
    │                hover:bg-[var(--color-accent-cream)]/10  <-- only when not active
    │                focus-visible:outline focus-visible:outline-2
    │                focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2
    │                cursor-pointer)
    │   ├── Icon (flag-vn, size=24, aria-hidden)
    │   └── <span aria-hidden="true">VN</span>
    │
    └── A.2 EN row (button, role="menuitemradio", aria-checked={active==="en"},
                     aria-label="English",
                     same classes as VN row with selected/hover class swap)
        ├── Icon (flag-gb, size=24, aria-hidden)
        └── <span aria-hidden="true">EN</span>
```

---

## Responsive Specifications

### Breakpoints

| Name | Min Width | Max Width |
|------|-----------|-----------|
| Mobile | 0 | 639 px |
| Tablet | 640 px | 1023 px |
| Desktop | 1024 px | ∞ |

### Responsive Changes

| Component | Changes | Notes |
|-----------|---------|-------|
| Panel | None | Panel stays ~120 × 124 px at every breakpoint — small enough to avoid viewport clipping even on a 320 px Galaxy Fold edge case |
| Trigger | (owned by header) | Parent headers collapse their layout at `< 640 px`; the dropdown continues to anchor to the trigger's right edge |
| Row typography | None | 16 px / 24 px line-height reads well at every zoom level |

No mobile-specific "bottom sheet" variant — the panel is a desktop-style popover at every breakpoint.

---

## Icon Specifications

| Icon Name | Size | Color | Usage | Status |
|-----------|------|-------|-------|--------|
| `flag-vn` | 24 × 24 | multi-colour (red + yellow star) | VN row flag glyph | **Exists** |
| `flag-gb` (or `flag-gb`) | 24 × 24 | multi-colour (Union Jack) | EN row flag glyph | **NEW — must be added** |

Both icons MUST be added to [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx). No `<img>` tags, no `next/image`, no inline SVG in the dropdown component itself.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Panel open | opacity 0 → 1 | 150 ms | `ease-out` | Trigger click / keyboard activation |
| Panel open | translateY(-4 px) → 0 | 150 ms | `ease-out` | Same as opacity |
| Panel close | opacity 1 → 0 | 150 ms | `ease-in` | Select / outside click / Esc / toggle |
| Panel close | translateY(0) → -4 px | 150 ms | `ease-in` | Same as opacity |
| Row hover | background-color | 120 ms | `ease-out` | Mouse enter / leave |
| Row focus | outline | instant | — | Keyboard focus |

**Reduced motion**: Under `prefers-reduced-motion: reduce`, collapse all panel + row transitions to `0 ms` (instant show/hide). Same pattern as the `motion-safe:` utilities used throughout the Kudos surface (see `LanguageToggle.tsx` line 79 for the existing chevron rotation pattern).

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS Class | React Component |
|----------------|---------------|----------------------|-----------------|
| Panel | `525:11713` | `absolute right-0 top-full mt-2 z-30 w-fit p-1.5 bg-[var(--color-panel-surface)] border border-[var(--color-border-secondary)] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col` | `<LanguageDropdown>` — root `<ul role="menu">` element |
| VN row (selected) | `I525:11713;362:6085` | `w-full h-14 flex items-center justify-between gap-1 p-4 rounded text-white text-base leading-6 font-bold tracking-[0.15px] font-[family-name:var(--font-montserrat)] bg-[var(--color-accent-cream)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer` | `<button role="menuitemradio" aria-checked="true" aria-label="Tiếng Việt">` |
| EN row (unselected) | `I525:11713;362:6128` | Same as VN row, but `bg-transparent hover:bg-[var(--color-accent-cream)]/10` | `<button role="menuitemradio" aria-checked="false" aria-label="English">` |
| Flag icon container | `I525:11713;362:6085;186:1709` / `I525:11713;362:6128;186:1903;186:1709` | `w-6 h-6 inline-flex items-center justify-center` | `<Icon name="flag-vn" size={24} />` / `<Icon name="flag-gb" size={24} />` |
| Label text | `I525:11713;362:6085;186:1821;186:1439` (VN) / `I525:11713;362:6128;186:1903;186:1439` (EN) | Inherited from row typography | `<span aria-hidden="true">VN</span>` / `<span aria-hidden="true">EN</span>` |

---

## Notes

- **All colours MUST use CSS variables** for theming support — `--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream`. No hex literals in JSX.
- **All icons MUST be `<Icon />` components** per constitution (`design-style` rule: "All icons **MUST BE** in the Icon Component instead of svg files or img tags"). This means packaging the Union Jack as a new `flag-gb` entry in `Icon.tsx` before using it.
- **Font loading**: Montserrat already loaded via `next/font/google` in [src/app/layout.tsx](../../../src/app/layout.tsx) — no font loading work needed for this spec.
- **Contrast audit**: Cream @ 20 % over `#00070C` composites to a very dark colour (≈ `#333425`); white text on that composite yields > 12 : 1, well above WCAG AA's 4.5 : 1 threshold. No contrast remediation required. The gold `#998C5F` border on `#00070C` is ornamental (non-text), so the 3 : 1 non-text contrast rule does not strictly apply, but `#998C5F` on `#00070C` is ~6.5 : 1 — comfortably passing anyway.
- **Motion coverage**: The panel open/close animation should reuse the 150 ms motion token family that the `FilterDropdown` + `ProfileMenu` popovers already use, for consistency. If `FilterDropdown` uses a bare `motion-safe:transition-opacity motion-safe:duration-150`, copy that pattern.
- **Zero new tokens**: This spec is intentionally conservative on design-system churn. Every colour / spacing / radius token reuses something that globals.css already declares. Adding a new token now would imply either (a) a naming collision with the 11 Kudos tokens or (b) a premature abstraction for a cross-dropdown primitive — both worth avoiding until a `<DarkNavyPopover>` refactor is formally planned.
