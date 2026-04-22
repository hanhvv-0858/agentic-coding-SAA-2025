# Design Style: Viết Kudo (Compose Kudo)

**Frame ID**: `ihQ26W78P2` (main) · `5c7PkAibyD` (error variant, folded as UI state)
**Frame Name**: `Viết Kudo`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
**Extracted At**: 2026-04-21

---

## Design Tokens

Most tokens reuse the existing theme in [src/app/globals.css](../../../src/app/globals.css). **Three net-new tokens** are proposed (marked ⚠) to capture the cream-paper modal surface + the red validation colour. The rest of the visuals ride on existing tokens.

### Colors

| Token Name | Hex Value | Opacity | Usage |
|---|---|---|---|
| **`--color-modal-paper`** ⚠ (NEW) | `#FFF8E1` | 100 % | Modal paper background (Figma `rgba(255, 248, 225, 1)` — same as `--color-kudo-card`, can alias) |
| `--color-brand-900` | `#00101A` | 100 % | Modal title + field labels + helper text + primary CTA text |
| `--color-border-secondary` | `#998C5F` | 100 % | 1 px gold border on all input fields, toolbar buttons, image thumbnails |
| `--color-muted-grey` | `#999999` | 100 % | Placeholder text + "+ Image"/"+ Hashtag" button text. **Note**: previously also used for the anonymous-checkbox label; round-3 screenshot (2026-04-21) updated that label to `--color-brand-900` — muted-grey no longer covers G. |
| `--color-accent-cream` | `#FFEA9E` | 100 % | Primary submit button (Gửi) background |
| **`--color-error`** ⚠ (NEW) | `#CF1322` | 100 % | Required-field asterisk + validation border on error (Figma `rgba(207, 19, 34, 1)`) |
| **`--color-close-red`** ⚠ (NEW) | `#D4271D` | 100 % | Circular × delete button on image thumbnails (Figma `rgba(212, 39, 29, 1)` — can alias `--color-nav-dot` if semantically compatible) |
| `--color-link-red` (consider aliasing) | `#E46060` | 100 % | "Tiêu chuẩn cộng đồng" link in toolbar row (Figma `rgba(228, 96, 96, 1)`) |
| `--color-panel-surface` | `#00070C` | 100 % | Recipient-search suggestion popover + @mention popover + hashtag picker overlay (dark-navy sibling family) |

**Token strategy**: Prefer aliasing new names onto existing hex values where semantic overlap is clean (e.g., `--color-error` could reuse `--color-nav-dot` = `#D4271D` — very close to `#CF1322` but not identical; keep separate if Design cares about the 8-unit delta; alias otherwise). The plan phase decides final token shape.

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Modal title (A) | Montserrat | 32 px | 700 | 40 px | 0 |
| Field label | Montserrat | 22 px | 700 | 28 px | 0 |
| Required asterisk (*) | Noto Sans JP | 16 px | 700 | 20 px | 0 |
| Input / body text | Montserrat | 16 px | 700 | 24 px | 0 |
| Helper text | Montserrat | 16 px | 700 | 24 px | 0 |
| Primary button text (Gửi) | Montserrat | 22 px | 700 | 28 px | 0 |
| Secondary button text (Hủy) | Montserrat | 16 px | 700 | 24 px | 0 |
| Toolbar link "Tiêu chuẩn cộng đồng" | Montserrat | 16 px | 700 | 24 px | 0 |
| Anonymous checkbox label | Montserrat | 22 px | 700 | 28 px | 0 | (colour now brand-900, was muted-grey pre-round-3) |

**Font loading**: `var(--font-montserrat)` already loaded globally. Noto Sans JP is used only for the asterisk — since `*` renders identically in both fonts, we can safely render with Montserrat in implementation (no need to load Noto Sans JP just for 1 glyph).

### Spacing

| Token Name | Value | Usage |
|---|---|---|
| Modal padding | 40 px | All 4 sides of the modal paper |
| Modal content gap | 32 px | Vertical gap between major sections (title, recipient, danh hiệu, editor, hashtag, image, checkbox, footer) |
| Field label gap | 16 px | Gap between field label and input (horizontal) |
| Editor toolbar button padding | 10 / 16 px | `py-2.5 px-4` on each format button |
| Input padding | 16 / 24 px | `py-4 px-6` on recipient + title inputs |
| Image gap | 16 px | Gap between image thumbnails + "+ Image" button |
| Hashtag chip gap | 8 px | Gap between hashtag chips |
| Footer button gap | 24 px | Gap between Hủy and Gửi |
| Checkbox label gap | 16 px | Gap between checkbox and its label |

### Border & Radius

| Token Name | Value | Usage |
|---|---|---|
| Modal border-radius | 24 px | Outer modal paper corners |
| Input / button border-radius | 8 px (match existing primary-button token) | Recipient + title inputs, all toolbar buttons, Gửi submit |
| Image thumbnail border | 1 px solid `#998C5F` | All 5 slots + "+ Image" slot |
| Input border (default) | 1 px solid `#998C5F` | All text inputs + toolbar buttons |
| Input border (error) | 1 px solid `--color-error` | Validation error state (US2) |
| Anonymous checkbox border | 1 px solid `#998C5F` (olive, `--color-border-secondary`) — updated from `#999` per round-3 screenshot | 24 × 24 box |

### Shadows

The modal sits over a dimmed backdrop. No explicit drop-shadow on the modal itself in Figma — the cream paper stands out against the dark page. If a subtle shadow is wanted for elevation clarity:

| Token Name | Value | Usage |
|---|---|---|
| Backdrop | `bg-black/50` | Dim the page behind the modal |
| Optional modal shadow | `0 16px 48px rgba(0, 0, 0, 0.25)` | Not in Figma; use only if the cream-on-dark contrast feels too flat in implementation |

---

## Layout Specifications

### Container

| Property | Value | Notes |
|---|---|---|
| Width | 752 px | Desktop fixed; responsive rules below |
| Height | hug content (Figma shows 1012 px with sample content) | Use `max-h-[90vh]` + `overflow-y-auto` on the scroll region |
| Padding | 40 px | All 4 sides |
| Background | `#FFF8E1` (`--color-modal-paper`) | |
| Border-radius | 24 px | |
| Display | flex column | |
| Gap | 32 px | Between sections |

### Layout Structure (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│  Modal paper  (752 × ~1012)                                 │
│  bg: #FFF8E1 · rounded-[24px] · p-10 · flex-col gap-8       │
│                                                             │
│  ┌──── A ────── Gửi lời cám ơn và ghi nhận đến đồng đội ──┐ │
│  │  Montserrat 32/700/40, centred, color #00101A         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──── B ────── Người nhận* ─────────────────────────────┐ │
│  │  Label (146 × 28) + Input (514 × 56)                  │ │
│  │  ┌────────┐ ┌──────────────────────────────────┐      │ │
│  │  │Người   │ │ Tìm kiếm                     ▼   │      │ │
│  │  │nhận *  │ │ border 1px #998C5F · p-4 px-6    │      │ │
│  │  └────────┘ └──────────────────────────────────┘      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──── ⚠ Danh hiệu* ─ (annotation gap in Figma) ────────┐ │
│  │  Label + Input 514 × 56                               │ │
│  │  Helper: "Ví dụ: Người truyền động lực cho tôi..."    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──── C + D ── Editor ─────────────────────────────────┐ │
│  │  ┌──── Toolbar (40px tall) ────────────────────────┐ │ │
│  │  │ [B] [I] [S] [⋮] [🔗] ["]  (each 40×40, gold    │ │ │
│  │  │                       border, gap 0)            │ │ │
│  │  │                         + "Tiêu chuẩn cộng đồng"│ │ │
│  │  │                           link (red, right-end) │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │  ┌──── D. TipTap body (672 × 200) ────────────────┐ │ │
│  │  │ border 1px #998C5F                             │ │ │
│  │  │ placeholder grey #999999                       │ │ │
│  │  │ @mention popover (dark-navy family) anchored   │ │ │
│  │  │ at caret when '@' is typed                     │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │  D.1: "Bạn có thể '@ + tên' để nhắc đồng nghiệp"   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──── E ────── Hashtag* ──────────────────────────────┐  │
│  │  Label + chip row                                    │  │
│  │  ┌────────┐ ┌──────────────┐ ┌──────────────┐        │  │
│  │  │Hashtag*│ │ + Hashtag    │ │ #dedicated × │ ...    │  │
│  │  └────────┘ │ (Tối đa 5)   │ └──────────────┘        │  │
│  │             └──────────────┘                         │  │
│  │                                                      │  │
│  │  Click "+ Hashtag" → p9zO-c4a4x overlay opens       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──── F ────── Image ──────────────────────────────────┐  │
│  │  Label + thumbnail row                                │  │
│  │  ┌────┐ ┌──80x80─┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │ │
│  │  │Img │ │ img ×  │ │img × │ │img × │ │img × │ │+   │ │ │
│  │  │    │ │        │ │      │ │      │ │      │ │Img │ │ │
│  │  └────┘ └────────┘ └──────┘ └──────┘ └──────┘ └────┘ │ │
│  │          (×=red circle 20×20 #D4271D, top-right)     │  │
│  │          Border 1px #998C5F around each tile         │  │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──── G ────── Gửi ẩn danh ────────────────────────────┐  │
│  │  ☐ Gửi lời cám ơn và ghi nhận ẩn danh                │  │
│  │  Checkbox 24×24 border 1px #999 + label #999         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──── G.1 ──── Nickname ẩn danh (only when G checked) ─┐  │
│  │  Nickname ẩn danh*  [  Nhập nickname  ]              │  │
│  │  label 22/700 brand-900   input h-14 rounded-lg bg-white │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──── H ────── Footer ─────────────────────────────────┐  │
│  │  [  Hủy  ×  ]  [   Gửi   ►   ]                       │  │
│  │   ↑ outline       ↑ primary cream bg #FFEA9E          │  │
│  │   border 1px                                          │  │
│  │   #998C5F                                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### A — Modal title

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `I520:11647;520:9870` | — |
| width / height | 672 × 80 | fill / hug |
| text | Montserrat 32/700/40 | `text-[32px] leading-10 font-bold font-[family-name:var(--font-montserrat)]` |
| color | `#00101A` | `text-[var(--color-brand-900)]` |
| alignment | centre | `text-center` |

---

### B — Người nhận (Recipient field)

**Container** (`I520:11647;520:9871` · 672 × 56 · flex row · gap 16):

| Property | Value | CSS |
|---|---|---|
| **B.1 Label** (`520:9872`) | 146 × 28, Montserrat 22/700/28, black with red `*` | `text-[22px] leading-7 font-bold text-[var(--color-brand-900)]` + `<span class="text-[var(--color-error)]">*</span>` |
| **B.2 Input** (`520:9873`) | 514 × 56, border 1 px `#998C5F`, padding 16/24, placeholder "Tìm kiếm" grey `#999` + dropdown chevron at right | `h-14 w-[514px] border border-[var(--color-border-secondary)] rounded-lg py-4 px-6` + `<Icon name="chevron-down" />` suffix |

**States** (input):

| State | Changes |
|---|---|
| Default | border `#998C5F` |
| Focus-visible | outline 2 px `var(--color-accent-cream)`, offset 2 px |
| Error | border `var(--color-error)` + red inline message below |
| Disabled | opacity 60 %, cursor-not-allowed |

**Suggestion popover**: opens below the input, uses the **dark-navy panel family** (`--color-panel-surface` bg, gold border, cream-tinted selected row). Reuse the `FilterDropdown` or `LanguageDropdown` styling.

**Cardinality** (resolved Q1 on 2026-04-21): the Recipient field is **single-select**. When a user picks a suggestion, the input value is replaced with the selected Sunner's display name (and the underlying `recipient: KudoUser | null` state updates); clicking the input again clears the selection and reopens the typeahead. There is NO multi-chip list inside the input. If Phase 2 adds multi-recipient, the field transitions to a chip-list input and this section updates.

---

### Danh hiệu (Title field) — ⚠ annotation gap

Not in `list_design_items` but visible in Figma + present in styles tree as `Frame 552` (`I520:11647;1688:10448`).

| Property | Value | CSS |
|---|---|---|
| **Container** | 672 × 104 (label + input + helper text) | `flex flex-col gap-2` |
| Label | "Danh hiệu*" Montserrat 22/700/28, 139 × 28 | Same pattern as B.1 |
| Input | 514 × 56, border 1 px `#998C5F`, padding 16/24, placeholder "Dành tặng một danh hiệu cho đồng đội" grey `#999` | Same as B.2 but no chevron suffix |
| Helper text | "Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề của Kudos của bạn." Montserrat 16/700/24 color `#999` | `text-base leading-6 text-[var(--color-muted-grey)]` |

Store submitted value in `kudos.title` (migration 0007).

---

### C — Editor toolbar

Container (`I520:11647;520:9877` · 40 px tall · flex row).

**Width note**: Figma styles tree shows `width: 1006px` on this frame, but the parent modal content area is 672 px wide. This is a Figma-layout artefact (the frame extends beyond the modal bounds in the tool), NOT a design intent to overflow. In implementation the toolbar MUST constrain to the modal's inner content width (672 px on desktop) with `flex-wrap: nowrap` + `overflow-x-auto` as a mobile fallback. The "Tiêu chuẩn cộng đồng" link uses `ml-auto` to push to the right edge of the available width, not of a 1006 px canvas.


Each toolbar button (`I520:11647;520:9881` bold, `662:11119` italic, `662:11213` strike, `662:10376` bullet-list, `662:10507` link, `662:10647` quote):

| Property | Value | CSS |
|---|---|---|
| Size | 40 × 40 (content 24 × 24 icon + padding) | `h-10 px-4 py-2.5` |
| Border | 1 px `#998C5F` | `border border-[var(--color-border-secondary)]` |
| Background | transparent by default; active → `var(--color-accent-cream)/20` | |
| Gap | 8 px internal | `gap-2` |

**Right-end "Tiêu chuẩn cộng đồng" link** (`I520:11647;3053:11619`):

| Property | Value | CSS |
|---|---|---|
| Text | "Tiêu chuẩn cộng đồng" Montserrat 16/700/24 colour `#E46060` | `text-[#E46060] text-base leading-6 font-bold` |
| Alignment | flex-grow right | `ml-auto` |
| Link target | **New tab** to community-standards page (URL TBD, resolved Q3 2026-04-21) | `<a href="#" target="_blank" rel="noopener noreferrer">` — OR stopgap `<a href="/the-le" target="_blank" rel="noopener noreferrer">` with a `{/* TODO(viet-kudo): real community-standards page pending */}` comment. Plan picks the stopgap. |

**Button states** (each toolbar toggle):

| State | Changes |
|---|---|
| Default | `bg-transparent` |
| Active (mark applied) | `bg-[var(--color-accent-cream)]/20` + `aria-pressed="true"` |
| Hover | `bg-[var(--color-accent-cream)]/10` |
| Focus-visible | outline 2 px cream, offset 2 px |
| Disabled (no selection for mark) | opacity 50 %, cursor not-allowed |

---

### D — Body editor (TipTap)

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `I520:11647;520:9886` | — |
| Dimensions | 672 × 200 min | `h-50 w-full` |
| Border | 1 px `#998C5F` | `border border-[var(--color-border-secondary)] rounded-lg` |
| Padding | 16 / 24 | `p-4` |
| Placeholder | "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!" Montserrat 16/700/24 grey `#999` | TipTap `Placeholder` extension |
| Content text | Montserrat 16/700/24 black | `text-[var(--color-brand-900)]` |

**States** mirror the Recipient input (Default / Focus / Error / Disabled).

**@Mention popover**: dark-navy family (`--color-panel-surface` bg, gold border), anchored at caret via floating-ui or TipTap Suggestion plugin. Row style mirrors the `LanguageDropdown` + `FilterDropdown` rows — cream @ 20 % selected.

### D.1 — Helper text

"Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác" — Montserrat 16/700/24, black `#00101A`. Always visible under D.

---

### E — Hashtag field

**Container** (`I520:11647;520:9890` · 672 × 48):

| Property | Value | CSS |
|---|---|---|
| Layout | flex row, gap 16 | `flex items-start gap-4` |
| Label (E.1) | 108 × 28, Montserrat 22/700/28, black + red asterisk | Same as B.1 |
| Chip row (E.2) | 548 × 48, flex row gap 8 | `flex items-center gap-2` |

**"+ Hashtag" button** (`I520:11647;662:8911`):

| Property | Value | CSS |
|---|---|---|
| Size | 116 × 48 | `h-12` |
| Border | 1 px `#998C5F` rounded | `border border-[var(--color-border-secondary)] rounded` |
| Padding | 4 / 8 | `py-1 px-2` |
| Content | `+ Icon` + "Hashtag" text + sub-note "Tối đa 5" | Two-row inner: top "+ Hashtag", bottom small "Tối đa 5" text |
| Text colour | grey `#999` (for button label, matching Figma) | `text-[var(--color-muted-grey)]` |

**Hashtag chip** (after selection) — pinned concrete classes so this spec is self-contained:

| Property | Value | CSS |
|---|---|---|
| Background | `#FFF8E1` (`var(--color-modal-paper)`) same as modal paper — chip reads as "on-paper" | `bg-[var(--color-modal-paper)]` |
| Border | 1 px `#998C5F` | `border border-[var(--color-border-secondary)]` |
| Border-radius | 4 px | `rounded` |
| Padding | 4 / 8 | `py-1 px-2` |
| Height | 48 | `h-12` |
| Text | hashtag slug (`#dedicated`), Montserrat 16/700/24, black `#00101A` | `text-base leading-6 font-bold text-[var(--color-brand-900)]` |
| `×` button | 16 × 16, colour `var(--color-close-red)` or cream-inverted; inline-flex right of label | `ml-2 w-4 h-4 text-[var(--color-close-red)]` |
| Gap between chips | 8 px | `gap-2` (owned by parent flex) |

**States**:

| State | Changes |
|---|---|
| Default | background cream paper, gold border |
| Hover (on × button) | `bg-[var(--color-close-red)]/10` on the × icon only |
| Focus-visible (chip itself) | outline 2 px cream, offset 2 px |
| Removing (optimistic) | opacity 50 % for 150 ms before disappearing |

This styling diverges intentionally from the Live-board `FilterBar` active-chip (which uses the dark-navy panel family) because the compose context sits on the cream-paper modal, not the dark Live-board page. Visual hierarchy is chip-on-paper (light), not chip-on-dark-navy.

---

### F — Image uploader

**Container** (`I520:11647;520:9896` · 672 × 80 · flex row · gap 16):

**F.1 Label** ("Image" · 74 × 28 · Montserrat 22/700/28 black).

**Each thumbnail** (F.2 / F.3 / F.4 · `I520:11647;662:9197` etc · 80 × 80):

| Property | Value | CSS |
|---|---|---|
| Size | 80 × 80 | `h-20 w-20` |
| Border | 1 px `#998C5F` (outer) + 1 px `#FFEA9E` (inner image) | Outer `border border-[var(--color-border-secondary)]` + inner image `border border-[var(--color-accent-cream)]` |
| Border-radius | implied by tile — keep sharp corners per Figma | Default (no rounding) or `rounded` (plan decides) |
| Remove (×) button | 20 × 20 circle `#D4271D`, white × icon, top-right overlap | Absolute-positioned `top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-[#D4271D] rounded-full` |

**"+ Image" button** (F.5 · `I520:11647;662:9132` · 98 × 48):

Same pattern as "+ Hashtag": icon + "Image" + "Tối đa 5" subtext, border 1 px `#998C5F`, grey text.

Disappears when `images.length === 5`.

---

### G — Anonymous checkbox

**Design update 2026-04-21 round 3**: the round-3 screenshot from Figma supersedes the initial spec — label colour is brand-900 (not muted-grey) and the checked-state fill is dark olive `#998C5F` (matches `--color-border-secondary`), not accent-cream. Existing `AnonymousCheckbox.tsx` code still uses the old cream fill and muted-grey label → must be patched in T077 alongside the alias work.

| Property | Value | CSS |
|---|---|---|
| **Node ID** | `I520:11647;520:14099` | — |
| Checkbox (unchecked) | 24 × 24 border 1 px `#998C5F` (olive — `--color-border-secondary`), bg transparent | `h-6 w-6 border border-[var(--color-border-secondary)] bg-transparent` |
| Checkbox (checked) | 24 × 24 solid fill `#998C5F` + cream checkmark inside | `bg-[var(--color-border-secondary)] border-[var(--color-border-secondary)]` + `<Icon name="check" size={16} className="text-[var(--color-accent-cream)]" />` |
| Label | "Gửi lời cám ơn và ghi nhận ẩn danh" Montserrat 22/700/28 **brand-900** `#1E2C4E` (updated from muted-grey per round-3 screenshot) | `text-[22px] leading-7 font-bold text-[var(--color-brand-900)]` |
| Layout | flex row gap 16 | `flex items-center gap-4` |

**Checkbox states**:

| State | Changes |
|---|---|
| Unchecked | empty 1 px olive border, transparent fill |
| Checked | fill + border both `--color-border-secondary` (olive) + cream checkmark icon |
| Focus-visible | outline 2 px cream, offset 2 px |
| Disabled | opacity 60 % |

---

### G.1 — Anonymous alias input (conditional, spec round 3 2026-04-21)

Rendered **immediately below G** when the checkbox is checked; hidden when unchecked. Uses the same horizontal label + input pattern as Recipient/Title fields (B, so implementation reuse is maximised).

| Property | Value | CSS |
|---|---|---|
| **Visibility** | `isAnonymous === true` | Conditionally mounted (unmount on false so stale alias is discarded) |
| Wrapper layout | horizontal label + input, flex row gap 16; stacks on `max-sm` | `flex items-center gap-4 max-sm:flex-col max-sm:items-start` |
| Label width (desktop) | hug content (~162 px incl. asterisk) — does NOT match the 146 px of B/C/E because the Figma round-3 screenshot shows this label left-aligned without a fixed width constraint. Use `w-auto` to let it hug. | `w-auto` |
| Label text | **"Nickname ẩn danh"** — Montserrat 22/700/28 brand-900. Asterisk `*` is a separate `<span>` in red, no space before it (per screenshot: `Nickname ẩn danh*`). | `text-[22px] leading-7 font-bold text-[var(--color-brand-900)]` |
| Required star | red `#CF1322`, rendered inline right after label text, no leading space | `text-[var(--color-error)]` |
| Input width | fills remaining row space | `flex-1` |
| Input height | **56 px** (h-14) — same as RecipientField (confirmed 2026-04-21) | `h-14` |
| Input padding | 24 px horizontal, 16 px vertical | `px-6 py-4` |
| Input border | 1 px `#E5E5E5` (default) / 1 px `#CF1322` (error) — olive `#998C5F` is NOT used on this input per screenshot | `border` + token |
| Input radius | 8 px | `rounded-lg` |
| Input background | white `#FFFFFF` (contrast against cream paper) | `bg-white` |
| Input typography | Montserrat 16/400/24 brand-900 | `text-base leading-6 text-[var(--color-brand-900)]` |
| Placeholder | "Doraemon" (example value in screenshot — keep a neutral placeholder like "Nhập nickname") grey `#999`. The vi placeholder key is `compose.fields.anonymousAlias.placeholder = "Nhập nickname"`. | `placeholder:text-[var(--color-muted-grey)]` |
| maxLength attr | `40` (hard DOM cap) | — |
| Focus ring | cream outline 2 px, offset 2 px | `focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]` |
| Inline error | 14/500/20 red, aligned under input (desktop `pl-[178px]` = label hug 162 + gap 16; `pl-0` mobile) | `text-sm leading-5 font-medium text-[var(--color-error)]` |

**Validation messages** (i18n keys live under `compose.fields.anonymousAlias`):

| Condition | Message (vi) |
|---|---|
| Trimmed length < 2 | "Vui lòng nhập nickname (2–40 ký tự)" |
| Trimmed length > 40 | "Nickname tối đa 40 ký tự" |

**Animation**: no animation for MVP — simple mount/unmount on checkbox toggle. Optional nice-to-have later: `motion-safe:animate-in motion-safe:fade-in-50 motion-safe:duration-150`.

---

### H — Footer buttons

**Container** (`I520:11647;520:9905` · 672 × 60 · gap 24):

**H.1 Hủy** (`I520:11647;520:9906`):

| Property | Value | CSS |
|---|---|---|
| Size | hug (≈ 90 × 60) | `h-15` |
| Padding | 16 / 40 | `py-4 px-10` |
| Border | 1 px `#998C5F` rounded | `border border-[var(--color-border-secondary)] rounded-lg` |
| Text | "Hủy" Montserrat 16/700/24 black | |
| Icon suffix | `Icon` name=`close` 24 × 24 | |
| Background | transparent | `bg-transparent hover:bg-black/5` |

**H.2 Gửi** (`I520:11647;520:9907`):

| Property | Value | CSS |
|---|---|---|
| Size | 502 × 60 | `h-15 grow` |
| Padding | 16 | `p-4` |
| Background | `#FFEA9E` | `bg-[var(--color-accent-cream)]` |
| Border | none | |
| Border-radius | 8 px | `rounded-lg` |
| Text | "Gửi" Montserrat 22/700/28 black | |
| Icon suffix | `Icon` name=`send` (new — see Icon Specifications below) | |

**States** (Gửi button):

| State | Changes |
|---|---|
| Default | `bg-[var(--color-accent-cream)]` |
| Hover | `bg-[var(--color-accent-cream-hover)]` |
| Active | `bg-[var(--color-accent-cream-active)]` |
| Disabled (invalid form) | opacity 50 %, cursor not-allowed |
| Pending (submitting) | spinner icon replaces send icon; text stays "Gửi"; button disabled |

---

## Error State (US2 / folded `5c7PkAibyD`)

When the user clicks Gửi with invalid fields, each missing required field flips to its error state:

| Property | Value | CSS |
|---|---|---|
| Input border | 1 px `var(--color-error)` (#CF1322) | `border-[var(--color-error)]` |
| Inline message (below input) | Montserrat 16/700/24 `var(--color-error)` | `text-[var(--color-error)] text-sm mt-1` |
| Focus target | First invalid field in visual order | JS `ref.focus()` |
| Live-region | `<div aria-live="polite">` announces count of errors | `aria-live="polite"` |

**Default error messages** (Vietnamese, localise per locale):

| Field | vi | en |
|---|---|---|
| Recipient | "Vui lòng chọn người nhận." | "Please select a recipient." |
| Title | "Vui lòng nhập danh hiệu." | "Please enter a title." |
| Body | "Vui lòng nhập nội dung." | "Please enter the kudo body." |
| Hashtag (< 1) | "Vui lòng chọn ít nhất 1 hashtag." | "Please select at least one hashtag." |
| Hashtag (> 5) | "Tối đa 5 hashtag." | "Maximum 5 hashtags." |
| Image (> 5 MB) | "Ảnh phải nhỏ hơn 5 MB." | "Image must be smaller than 5 MB." |
| Image (MIME reject) | "Chỉ hỗ trợ JPG, PNG, WebP." | "Only JPG, PNG, and WebP are supported." |

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
| Modal | Full-screen `w-screen h-dvh` · no rounded corners · padding 16 | 90 vw · `max-w-[752px]` · rounded-[24px] · padding 24 | 752 px fixed · rounded-[24px] · padding 40 |
| Input width | 100 % of modal inner | 100 % of modal inner | 514 px fixed (per Figma) |
| Toolbar | Horizontal scroll if needed (`overflow-x-auto`) | Fit | Fit (1006 px per Figma, but overflow if narrower) |
| Image row | 4-col grid of 80 × 80 + "+" | 5-col grid | 5-col + "+" |
| Footer | `flex-col gap-3` (buttons stack; Gửi on top) | `flex-row gap-6` | `flex-row gap-6` |
| Modal entry animation | disabled on reduced-motion | fade+scale 150 ms | fade+scale 150 ms |

---

## Icon Specifications

| Icon Name | Size | Status | Usage |
|---|---|---|---|
| `bold` | 24 × 24 | **NEW** | Toolbar B button |
| `italic` | 24 × 24 | **NEW** | Toolbar I button |
| `strikethrough` | 24 × 24 | **NEW** | Toolbar S button |
| `list-bullet` (or `list-ordered` — Figma says "Number List") | 24 × 24 | **NEW** | Toolbar list button |
| `link` | 24 × 24 | **NEW** | Toolbar link button |
| `quote` | 24 × 24 | **NEW** | Toolbar quote button |
| `send` | 24 × 24 | **NEW** | Gửi button icon |
| `close` | 24 × 24 | **EXISTS** | Hủy button + × on image thumbnail (reuse) |
| `chevron-down` | 24 × 24 | **EXISTS** | Recipient search dropdown indicator (reuse) |
| `plus` | 24 × 24 | **NEW** or reuse if already present | "+ Hashtag" and "+ Image" buttons |

Six new icons (all toolbar + `send` + `plus` if not present) land in `src/components/ui/Icon.tsx`. All inlined SVG per constitution "All icons in Icon Component".

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---|---|---|---|---|
| Modal entry | opacity 0 → 1 + scale 0.95 → 1 | 150 ms | `ease-out` | Open |
| Modal exit | opacity 1 → 0 + scale 1 → 0.95 | 120 ms | `ease-in` | Close |
| Backdrop entry / exit | opacity 0 → 1 / 1 → 0 | 100 ms | linear | Open / close |
| Toolbar button active | background | 120 ms | `ease-out` | Toggle |
| Gửi button hover | background | 150 ms | `ease-out` | Hover |
| Error border transition | border-color | 150 ms | `ease-out` | Validation flip |
| Thumbnail × button hover | scale 1 → 1.1 | 100 ms | `ease-out` | Hover |

**Reduced motion**: Every transition above wrapped with `motion-safe:`. Under `prefers-reduced-motion: reduce` the modal shows/hides instantly with no scale animation.

---

## Implementation Mapping

| Design Element | Figma Node ID | Tailwind / CSS Class | React Component |
|---|---|---|---|
| Modal paper | `520:11647` | `w-[752px] max-w-[90vw] max-h-[90vh] rounded-[24px] bg-[var(--color-modal-paper)] p-10 flex flex-col gap-8 overflow-y-auto` | `<Modal>` wrapper |
| Modal title (A) | `I520:11647;520:9870` | `text-[32px] leading-10 font-bold text-center text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)]` | `<h2>` heading |
| Recipient field (B) | `I520:11647;520:9871` | `flex items-center gap-4` | `<RecipientField />` (new client component) |
| Danh hiệu field (gap fix) | `I520:11647;1688:10448` | Same as B but without dropdown chevron | `<TitleField />` (new) |
| Toolbar (C) | `I520:11647;520:9877` | `flex items-center` | `<EditorToolbar />` |
| Toolbar button (C.1–C.6) | e.g. `I520:11647;520:9881` | `h-10 px-4 py-2.5 border border-[var(--color-border-secondary)] hover:bg-[var(--color-accent-cream)]/10 aria-pressed:bg-[var(--color-accent-cream)]/20` | `<ToolbarButton icon="…" />` |
| Standards link | `I520:11647;3053:11619` | `text-[#E46060] ml-auto` | `<a href="#" target="_blank" rel="noopener noreferrer">` (placeholder per Q3 — plan picks stopgap URL) |
| Body editor (D) | `I520:11647;520:9886` | `h-50 border border-[var(--color-border-secondary)] rounded-lg p-4` | `<BodyEditor />` — TipTap `<EditorContent />` |
| Helper text (D.1) | `I520:11647;520:9887` | `text-base leading-6 text-[var(--color-brand-900)]` | `<p>` |
| Hashtag field (E) | `I520:11647;520:9890` | `flex items-start gap-4` | `<HashtagField />` |
| "+ Hashtag" button | `I520:11647;662:8911` | `h-12 border border-[var(--color-border-secondary)] rounded py-1 px-2 text-[var(--color-muted-grey)]` | `<AddHashtagButton onClick={openPicker} />` |
| Hashtag chip | E.2 children | Reuse FilterBar active-chip classes | `<HashtagChip>` |
| Image uploader (F) | `I520:11647;520:9896` | `flex items-center gap-4` | `<ImageUploader />` |
| Image thumbnail | `I520:11647;662:9197` etc. | `relative h-20 w-20 border border-[var(--color-border-secondary)]` | `<ImageThumbnail src={signedUrl} onRemove={...} />` |
| "+ Image" button | `I520:11647;662:9132` | Same as "+ Hashtag" | `<AddImageButton />` |
| Anonymous checkbox (G) | `I520:11647;520:14099` | `flex items-center gap-4` | `<AnonymousCheckbox />` |
| Anonymous alias input (G.1) | (derived from G, round 3 2026-04-21) | `flex items-center gap-4` + conditional mount | `<AnonymousAliasField />` (new component, sibling of `RecipientField`) |
| Footer (H) | `I520:11647;520:9905` | `flex gap-6 sm:flex-row flex-col` | `<Footer>` |
| Hủy button (H.1) | `I520:11647;520:9906` | `h-15 py-4 px-10 border border-[var(--color-border-secondary)] rounded-lg` | `<Button variant="outline">` |
| Gửi button (H.2) | `I520:11647;520:9907` | `h-15 grow p-4 bg-[var(--color-accent-cream)] rounded-lg text-[22px] leading-7 font-bold` | `<Button variant="primary">` |

---

## Notes

- **All colours via CSS variables**: Add `--color-modal-paper` (or alias to `--color-kudo-card`), `--color-error` (or alias to `--color-nav-dot` + minor shift), `--color-close-red` (or alias `--color-nav-dot`) to globals.css during implementation. Final naming decision in plan phase.
- **All icons via `<Icon />`**: 6 new glyphs (bold, italic, strikethrough, list-bullet, link, quote, send) must land in `Icon.tsx` during plan/tasks.
- **Focus-ring everywhere**: Every interactive element gets the standard 2 px `var(--color-accent-cream)` outline with 2 px offset on `:focus-visible`. Add a lint-check or manual audit — no interactive control should ship without it (constitution WCAG AA rule).
- **TipTap content is HTML**: Persisted body goes into `kudos.body` as HTML text. Mentions persist as `<span data-mention-id="{uuid}">{displayName}</span>`. Live-board renderer owns the read-path parsing (out of scope here).
- **Backdrop click closes with dirty prompt**: Same logic as Hủy click — `<dialog>`'s backdrop click handler calls the same `attemptClose()` function.
- **Storage bucket migration**: `supabase/migrations/0014_kudo_images_storage.sql` creates the bucket + RLS. Exact SQL shape is a plan-phase concern.
