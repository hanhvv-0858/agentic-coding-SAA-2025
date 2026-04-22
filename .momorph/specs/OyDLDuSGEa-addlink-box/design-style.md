# Design Style: Addlink Box (Insert-link dialog)

**Frame ID**: `OyDLDuSGEa` — Figma node `1002:12917`
**Frame Name**: `Addlink Box`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/OyDLDuSGEa
**Extracted At**: 2026-04-21

---

## Design Tokens

**Zero new tokens.** Every value reuses the Viết Kudo token family (`--color-modal-paper`, `--color-brand-900`, `--color-border-secondary`, `--color-accent-cream`, `--color-secondary-btn-fill`, `--color-error`). This dialog is a nested modal that inherits the parent's visual language.

### Colors

| Token Name | Hex Value | Opacity | Usage |
|---|---|---|---|
| `--color-modal-paper` | `#FFF8E1` | 100 % | Dialog paper background (same as Viết Kudo; depends on Viết Kudo adding this token) |
| `--color-brand-900` | `#00101A` | 100 % | Title + labels + button text |
| `--color-border-secondary` | `#998C5F` | 100 % | 1 px gold border on inputs + Hủy button |
| `--color-secondary-btn-fill` | `rgba(255, 234, 158, 0.10)` | 10 % → literal | Hủy button background (already in globals.css — added by Kudos Live board) |
| `--color-accent-cream` | `#FFEA9E` | 100 % | Lưu button background + focus-visible outline |
| _(white)_ | `#FFFFFF` | 100 % | Input background |
| `--color-error` | `#CF1322` | 100 % | Validation error border + inline error text (new token added by Viết Kudo plan) |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Dialog title "Thêm đường dẫn" | Montserrat | 32 px | 700 | 40 px | 0 |
| Field label ("Nội dung" / "URL") | Montserrat | 22 px | 700 | 28 px | 0 |
| Input text (user-typed content) | Montserrat | 16 px | 400/700 — match Viết Kudo convention | 24 px | 0.15 px |
| Hủy button text | Montserrat | 16 px | 700 | 24 px | 0.15 px |
| Lưu button text | Montserrat | 22 px | 700 | 28 px | 0 |
| Inline error text | Montserrat | 14 px | 500 | 20 px | 0 |

### Spacing

| Token Name | Value | Usage |
|---|---|---|
| Dialog padding | 40 px | All 4 sides of the cream paper |
| Section gap | 32 px | Vertical gap between title → B → C → D |
| Field row gap | 16 px | Horizontal gap between label and input within each field row |
| Input padding | 16 / 24 | `py-4 px-6` on Nội dung + URL inputs |
| Footer gap | 24 px | Between Hủy and Lưu buttons |
| Button (Hủy) padding | 16 / 40 | `py-4 px-10` |
| Button (Lưu) padding | 16 | `p-4` on all sides |

### Border & Radius

| Token Name | Value | Usage |
|---|---|---|
| Dialog border-radius | 24 px | Outer modal paper |
| Input border-radius | 8 px | Both text inputs |
| Input border | 1 px solid `#998C5F` | Both inputs (default) |
| Input border (error) | 1 px solid `var(--color-error)` | Validation error state |
| Hủy border-radius | 4 px | **Note**: smaller than Lưu — matches Figma |
| Hủy border | 1 px solid `#998C5F` | Default |
| Lưu border-radius | 8 px | Larger (primary button) |
| Lưu border | none | Primary button, filled |

### Shadows

| Token Name | Value | Usage |
|---|---|---|
| Dialog shadow | `0 16px 48px rgba(0, 0, 0, 0.25)` | Elevation over the Viết Kudo backdrop — match Viết Kudo's optional shadow for nested-dialog visual separation |

---

## Layout Specifications

### Backdrop (own layer, over Viết Kudo's)

Addlink renders its own backdrop for click-to-close behaviour per spec FR-007:

| Property | Value | CSS |
|---|---|---|
| Position | fixed, full-viewport | `fixed inset-0` |
| Background | `rgba(0, 0, 0, 0.40)` — slightly darker than Viết Kudo's 50% to indicate stacking depth | `bg-black/40` |
| z-index | `40` | `z-40` (below the dialog paper's z-50, above Viết Kudo's z-30) |
| Click | closes Addlink (FR-007) | `onClick={onClose}` — stop-propagate inside the paper |

### Container (dialog paper)

| Property | Value | Notes |
|---|---|---|
| Width | 752 px desktop / 90 vw tablet / 100 vw mobile | Same width as Viết Kudo on desktop |
| Height | hug content (Figma: 388 px with empty fields) | `max-h-[90vh]` with `overflow-y-auto` |
| Padding | 40 px | All sides |
| Background | `#FFF8E1` (`--color-modal-paper`) | Cream paper |
| Border-radius | 24 px | |
| Display | flex column | |
| Gap | 32 px | Between major sections |
| z-index | 50 | Above the Addlink backdrop (z-40), above Viết Kudo (z-30) |
| Position | centred over viewport | `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` |

### Layout Structure (ASCII)

```
┌─────────────────────────────────────────────────┐
│ Dialog paper (752 × ~388)                       │
│ bg: #FFF8E1 · rounded-[24px] · p-10 · gap-8     │
│                                                 │
│ ┌── A ─ "Thêm đường dẫn" ────────────────────┐ │
│ │ Montserrat 32/700/40, black                │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ ┌── B_Nội dung ──────────────────────────────┐ │
│ │ ┌───────┐  ┌──────────────────────────────┐│ │
│ │ │Nội    │  │ (text input, flex-1, 56 tall)││ │
│ │ │dung   │  │ border 1px #998C5F · r:8     ││ │
│ │ └───────┘  └──────────────────────────────┘│ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ ┌── C_URL ───────────────────────────────────┐ │
│ │ ┌───┐  ┌──────────────────────────────────┐│ │
│ │ │URL│  │ (text input, flex-1, type="url") ││ │
│ │ └───┘  └──────────────────────────────────┘│ │
│ │   (Figma has an unannotated IC slot on the │ │
│ │   right — NOT rendered for MVP)            │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ ┌── D_Footer ────────────────────────────────┐ │
│ │ ┌─────────┐    ┌──────────────────────────┐│ │
│ │ │ Hủy  ×  │    │         Lưu  🔗         ││ │
│ │ │ (outline)    │  (solid cream, r:8)     ││ │
│ │ │  r:4, bg:    └──────────────────────────┘│ │
│ │ │  cream@10%)                              │ │
│ │ └─────────┘                                │ │
│ └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Component Style Details

### A — Title

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `I1002:12682;1002:12500` | — |
| Width / Height | 672 × 40 | fill / hug |
| Text | "Thêm đường dẫn" Montserrat 32/700/40 | `text-[32px] leading-10 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)]` |
| Alignment | left (Figma `textAlign: "left"`) | `text-left` |

---

### B — Nội dung field

**Container** (`I1002:12682;1002:12501`, 672 × 56, flex row gap 16):

| Property | Value | CSS |
|---|---|---|
| Layout | flex row | `flex items-center gap-4` |

**B.1 Label** (107 × 28):

| Property | Value | CSS |
|---|---|---|
| Text | "Nội dung" Montserrat 22/700/28 black | `text-[22px] leading-7 font-bold text-[var(--color-brand-900)]` |
| Alignment | centred in its 107 px container | `text-center` |

**B.2 Input** (flex-1, 549 × 56):

| Property | Value | CSS |
|---|---|---|
| Height | 56 | `h-14` |
| Padding | 16 / 24 | `py-4 px-6` |
| Background | white | `bg-white` |
| Border | 1 px `#998C5F` | `border border-[var(--color-border-secondary)]` |
| Border-radius | 8 px | `rounded-lg` |
| Font | Montserrat 16 / 400-700 / 24 / 0.15 | `text-base leading-6 tracking-[0.15px] font-[family-name:var(--font-montserrat)]` |
| Max chars | 100 | `maxLength={100}` |

**States (Nội dung + URL inputs)**:

| State | Changes |
|---|---|
| Default | border `#998C5F` |
| Focus-visible | outline 2 px `var(--color-accent-cream)`, offset 2 px |
| Error | border `var(--color-error)` + red inline message below |
| Disabled | opacity 60 %, `cursor-not-allowed` |

---

### C — URL field

Same layout as B with label "URL" (47 × 28) and input occupying the remaining flex.

**C.2 Input** (`I1002:12682;1002:12654`):

Identical styling to B.2. The Figma node tree includes a 24×24 "IC" slot on the right side (node `186:2761`) but per spec Screen Components row C.2 this is **not rendered for MVP** (unannotated + invisible in the reference screenshot).

| Property | Value | CSS |
|---|---|---|
| Max chars | 2048 | `maxLength={2048}` |
| Type | url | `<input type="url">` (gives mobile keyboards the `://` keys) |

---

### D — Footer

**Container** (`I1002:12682;1002:12543`, 672 × 60, flex row gap 24):

| Property | Value | CSS |
|---|---|---|
| Layout | flex row | `flex items-start gap-6` |

**D.1 Hủy** (`I1002:12682;1002:12544`):

| Property | Value | CSS |
|---|---|---|
| Padding | 16 / 40 | `py-4 px-10` |
| Height | hug (~60) | `h-15` or omit |
| Background | `rgba(255, 234, 158, 0.10)` | `bg-[var(--color-secondary-btn-fill)]` |
| Border | 1 px `#998C5F` | `border border-[var(--color-border-secondary)]` |
| Border-radius | **4 px** | `rounded` (NOT `rounded-lg` — Hủy uses smaller radius per Figma) |
| Text | "Hủy" Montserrat 16/700/24 black | `text-base leading-6 font-bold text-[var(--color-brand-900)]` |
| Icon suffix | `close` 24 × 24 | `<Icon name="close" size={24} />` |
| Gap (text → icon) | 8 px | `gap-2` |

**D.2 Lưu** (`I1002:12682;1002:12545`):

| Property | Value | CSS |
|---|---|---|
| Width | full-width mobile / 502 px desktop | `w-full sm:w-[502px]` (mobile-first — full width by default, fixed 502 px at `sm` breakpoint) |
| Height | 60 | `h-15` |
| Padding | 16 | `p-4` |
| Background | `#FFEA9E` (`--color-accent-cream`) | `bg-[var(--color-accent-cream)]` |
| Border | none | |
| Border-radius | 8 px | `rounded-lg` |
| Text | "Lưu" Montserrat 22/700/28 black | `text-[22px] leading-7 font-bold text-[var(--color-brand-900)]` |
| Icon suffix | `link` 24 × 24 | `<Icon name="link" size={24} />` |
| Gap (text → icon) | 8 px (internal flex gap) | `gap-2` |
| Align | centre | `flex items-center justify-center` |

**States (buttons)**:

| State | Hủy | Lưu |
|---|---|---|
| Default | `bg-[var(--color-secondary-btn-fill)]` (10% cream) | `bg-[var(--color-accent-cream)]` (100% cream) |
| Hover | `bg-[var(--color-accent-cream)]/15` | `bg-[var(--color-accent-cream-hover)]` |
| Active | `bg-[var(--color-accent-cream)]/20` | `bg-[var(--color-accent-cream-active)]` |
| Focus-visible | outline 2 px cream, offset 2 px | outline 2 px cream, offset 2 px |
| Disabled (Lưu: invalid form) | — | opacity 50 %, `cursor-not-allowed`, `aria-disabled="true"` |

---

### Inline error (shared across B.2 + C.2)

When a field is invalid on blur:

| Property | Value | CSS |
|---|---|---|
| Position | directly below the input | `mt-1` |
| Font | Montserrat 14 / 500 / 20 | `text-sm leading-5 font-medium` |
| Colour | `var(--color-error)` | `text-[var(--color-error)]` |
| Role | live-announced | `role="alert"` + `aria-live="polite"` |
| Bound to input | via `aria-describedby` | `<input aria-describedby="addlink-text-error" />` + `<p id="addlink-text-error" …>` |

---

## Component Hierarchy with Styles

```
Backdrop (Addlink own backdrop, over Viết Kudo's)
└── <div role="dialog" aria-modal="true" aria-labelledby="addlink-title"
          class="w-[752px] max-w-[90vw] max-h-[90vh] overflow-y-auto
                 rounded-[24px] bg-[var(--color-modal-paper)]
                 p-10 flex flex-col gap-8
                 shadow-[0_16px_48px_rgba(0,0,0,0.25)]
                 motion-safe:transition-all motion-safe:duration-150">
    │
    ├── <h2 id="addlink-title"
    │       class="text-[32px] leading-10 font-bold text-[var(--color-brand-900)]
    │              font-[family-name:var(--font-montserrat)] text-left">
    │     Thêm đường dẫn
    │
    ├── <div class="flex items-center gap-4">   ← Nội dung row
    │   ├── <label for="addlink-text" class="w-[107px] text-center
    │                text-[22px] leading-7 font-bold text-[var(--color-brand-900)]">
    │         Nội dung
    │   └── <input id="addlink-text" type="text" maxlength={100}
    │              aria-required="true" aria-invalid={textError !== null}
    │              aria-describedby={textError ? 'addlink-text-error' : undefined}
    │              class="flex-1 h-14 py-4 px-6 bg-white rounded-lg
    │                      text-base leading-6 tracking-[0.15px]
    │                      font-[family-name:var(--font-montserrat)]
    │                      border border-[var(--color-border-secondary)]
    │                      focus-visible:outline focus-visible:outline-2
    │                      focus-visible:outline-[var(--color-accent-cream)]
    │                      focus-visible:outline-offset-2
    │                      aria-invalid:border-[var(--color-error)]" />
    │
    ├── <p id="addlink-text-error" role="alert"
    │       class="text-sm leading-5 font-medium text-[var(--color-error)] -mt-4">
    │     {textError}   ← conditional
    │
    ├── <div class="flex items-center gap-4">   ← URL row (same pattern as Nội dung
    │   │                                          + right-side 24×24 icon)
    │   …
    │
    └── <div class="flex items-start gap-6">    ← Footer
        ├── <button type="button" onClick={onClose}
        │           class="h-15 py-4 px-10 rounded
        │                   border border-[var(--color-border-secondary)]
        │                   bg-[var(--color-secondary-btn-fill)]
        │                   hover:bg-[var(--color-accent-cream)]/15
        │                   flex items-center gap-2
        │                   text-base leading-6 font-bold text-[var(--color-brand-900)]
        │                   focus-visible:outline focus-visible:outline-2
        │                   focus-visible:outline-[var(--color-accent-cream)]
        │                   focus-visible:outline-offset-2">
        │     Hủy
        │     <Icon name="close" size={24} />
        │
        └── <button type="button" onClick={handleSave}
                    disabled={!isValid} aria-disabled={!isValid}
                    class="w-full sm:w-[502px] h-15 p-4 rounded-lg
                            bg-[var(--color-accent-cream)]
                            hover:bg-[var(--color-accent-cream-hover)]
                            flex items-center justify-center gap-2
                            text-[22px] leading-7 font-bold text-[var(--color-brand-900)]
                            aria-disabled:opacity-50 aria-disabled:cursor-not-allowed
                            focus-visible:outline focus-visible:outline-2
                            focus-visible:outline-[var(--color-accent-cream)]
                            focus-visible:outline-offset-2">
              Lưu
              <Icon name="link" size={24} />
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
| Dialog width | `w-screen` (full viewport) | `max-w-[752px]` with 24 px margins | 752 px fixed |
| Dialog padding | 16 px | 24 px | 40 px |
| Row layout (labels) | Stack vertically: label on top, input below | Stack (same as mobile at narrower widths) OR row | Row (per Figma) |
| Footer layout | `flex-col gap-3` — Lưu on top, Hủy below | `flex-row gap-6` | `flex-row gap-6` |
| Motion | Respect `prefers-reduced-motion` on all breakpoints | Same | Same |

**Mobile touch-target**: All buttons are 60 px tall (above the 44 × 44 minimum per constitution §II). Input height 56 px. Both clear the touch-target threshold. No bump required.

---

## Icon Specifications

| Icon Name | Size | Status | Usage |
|---|---|---|---|
| `link` | 24 × 24 | **NEW** (being added by Viết Kudo) | Lưu button suffix + (decorative) URL field icon |
| `close` | 24 × 24 | **EXISTS** in `Icon.tsx` | Hủy button suffix |

No net-new icons from this spec.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Dialog entry | opacity 0 → 1 + scale 0.95 → 1 | 150 ms | `ease-out` | Open |
| Dialog exit | opacity 1 → 0 + scale 1 → 0.95 | 120 ms | `ease-in` | Close |
| Input focus | border-color | 150 ms | `ease-out` | Focus-visible |
| Button hover | background-color | 150 ms | `ease-out` | Hover |
| Error border flip | border-color | 150 ms | `ease-out` | Blur-validation fail / success |

**Reduced motion**: Every transition wrapped `motion-safe:`. Under `prefers-reduced-motion: reduce`, the dialog shows/hides instantly with no scale.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS Class | React Component |
|---|---|---|---|
| Dialog paper | `1002:12682` | `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[752px] max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-[24px] bg-[var(--color-modal-paper)] p-10 flex flex-col gap-8 shadow-[0_16px_48px_rgba(0,0,0,0.25)]` | `<AddlinkDialog>` `<div role="dialog">` inside a `createPortal(..., document.body)` boundary — spec TR-007 |
| Backdrop (own layer) | — | `fixed inset-0 z-40 bg-black/40` | `<div onClick={onClose}>` sibling to the paper, inside the same portal |
| Title (A) | `I1002:12682;1002:12500` | `text-[32px] leading-10 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] text-left` | `<h2 id="addlink-title">` |
| Nội dung row (B) | `I1002:12682;1002:12501` | `flex items-center gap-4` | `<div>` wrapper |
| Nội dung label (B.1) | `I1002:12682;1002:12502` | `w-[107px] text-center text-[22px] leading-7 font-bold text-[var(--color-brand-900)]` | `<label for="addlink-text">` |
| Nội dung input (B.2) | `I1002:12682;1002:12503` | `flex-1 h-14 py-4 px-6 bg-white rounded-lg border border-[var(--color-border-secondary)] text-base leading-6 tracking-[0.15px] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 aria-invalid:border-[var(--color-error)]` | `<input type="text" maxLength={100} aria-required aria-invalid>` |
| URL row (C) | `I1002:12682;1002:12652` | Same as B row + wrapper with `relative` for icon positioning | `<div>` wrapper |
| URL input (C.2) | `I1002:12682;1002:12654` | Same as B.2 plus `pr-14` | `<input type="url" maxLength={2048} …>` |
| URL decorative icon slot | `I1002:12682;1002:12654;186:2761` | **Not rendered for MVP** (spec Screen Components row C.2 + Notes). If later needed, absolutely positioned `right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-muted-grey)]` with input padding bumped to `pr-14`. | *(omitted — see spec Screen Components row C.2)* |
| Footer (D) | `I1002:12682;1002:12543` | `flex items-start gap-6 sm:flex-row flex-col-reverse` | `<div>` footer |
| Hủy (D.1) | `I1002:12682;1002:12544` | `h-15 py-4 px-10 rounded border border-[var(--color-border-secondary)] bg-[var(--color-secondary-btn-fill)] hover:bg-[var(--color-accent-cream)]/15 flex items-center gap-2` | `<button onClick={onClose}>` |
| Lưu (D.2) | `I1002:12682;1002:12545` | `w-full sm:w-[502px] h-15 p-4 rounded-lg bg-[var(--color-accent-cream)] hover:bg-[var(--color-accent-cream-hover)] flex items-center justify-center gap-2 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed` | `<button onClick={handleSave} aria-disabled={!isValid}>` |

---

## Notes

- **Radius divergence between Hủy (4 px) and Lưu (8 px)** is intentional per Figma — Hủy signals "dismiss/secondary" via the smaller radius, Lưu signals "primary" via the larger one. Don't normalise both to 8 px.
- **All colours via CSS variables** — no hex literals in JSX. Tokens depend on Viết Kudo plan landing `--color-modal-paper` + `--color-error` in globals.css first.
- **All icons via `<Icon />`** — no inline SVG or `<img>`.
- **Decorative right-side URL icon**: Spec Screen Components row C.2 pins this as **NOT rendered for MVP** (the Figma node is unannotated and no icon is visible in the rendered screenshot). If Design later clarifies its purpose (paste-from-clipboard, preview, clear-button, etc.), the input's `pr-6` bumps to `pr-14` to accommodate the 24×24 icon absolutely positioned on the right.
- **Focus management**: the dialog handles its own focus trap — nested inside Viết Kudo's focus trap, taking precedence while Addlink is open. On close, focus returns to the Link toolbar button in Viết Kudo.
- **Contrast audit**: cream @ 10 % over cream paper yields roughly the same visual as the paper itself, giving Hủy a subtle "card-like" appearance. The gold border + close icon + black text at 18:1 contrast handle the accessibility. `#00101A` text on `#FFF8E1` paper yields ~16:1 — well above AA.
