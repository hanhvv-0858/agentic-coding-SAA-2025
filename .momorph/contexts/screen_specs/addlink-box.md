# Screen: Addlink Box (Insert-link dialog)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `OyDLDuSGEa` (node `1002:12917`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/OyDLDuSGEa |
| **Screen Group** | Viết Kudo overlays |
| **Status** | discovered |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

A **secondary (nested) modal** that opens over the Viết Kudo modal
(`ihQ26W78P2`) when the user clicks the Link (🔗) button in the TipTap
editor toolbar. Collects two fields — **Nội dung** (anchor text, 1–100
chars) and **URL** (`^https?://` with 5–2048 chars) — and on **Lưu**
injects an `<a href="{url}">{text}</a>` node at the TipTap cursor via
`setLink({ href })`. On **Hủy** / `Esc` / backdrop, closes without
mutating the editor.

Shares the Viết Kudo modal's cream-paper aesthetic (`#FFF8E1`) and sits
elevated above the parent modal + its backdrop via its own dim overlay.
Opens in **edit mode** (pre-filled fields) when the caret is inside an
existing `<a>` tag, and in **insert mode** otherwise (optionally
pre-filling Nội dung from the selected text).

Not a route — ephemeral client-side overlay; produces a `{ text, url }`
payload that the parent TipTap wrapper applies via a chain command.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Viết Kudo (`ihQ26W78P2`) | Click Link toolbar button (C.5) | Body editor focused |
| Viết Kudo | Keyboard `Enter` / `Space` on Link button | Same |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Viết Kudo (parent; editor mutated) | Lưu with valid form | `I1002:12682;1002:12545` | High | Closes dialog; injects / updates `<a>` node; focus returns to editor after inserted anchor |
| Viết Kudo (parent; no change) | Hủy / `Esc` / Addlink-own backdrop | `I1002:12682;1002:12544` | High | Dialog closes; editor content + caret unchanged |

### Navigation Rules

- **Back behavior**: N/A — overlay; browser Back does not target it.
- **Deep link support**: No — ephemeral, always launched from the parent.
- **Auth required**: Inherits Viết Kudo's session gate (authenticated).

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────┐
│  Thêm đường dẫn                      │  (A — title, 32/700)
├──────────────────────────────────────┤
│                                      │
│  Nội dung  [                    ]    │  (B — 1..100 chars)
│                                      │
│  URL       [                    ]    │  (C — https?:// + 5..2048)
│                                      │
├──────────────────────────────────────┤
│  [ X Hủy ]            [  🔗 Lưu  ]   │  (D — footer)
└──────────────────────────────────────┘
```

### Component Hierarchy

```
AddlinkDialog (Client — "use client", React portal to body)
├── Own backdrop (bg-black/40, click → onClose)
├── Paper (cream #FFF8E1, 752 × hug, rounded)
│   ├── Title "Thêm đường dẫn" (A)
│   ├── NoiDungField (B)
│   │   ├── Label "Nội dung"
│   │   ├── Input (required, 1..100)
│   │   └── InlineError (role="alert", conditional)
│   ├── UrlField (C)
│   │   ├── Label "URL"
│   │   ├── Input (required, https?://, 5..2048)
│   │   └── InlineError (role="alert", conditional)
│   └── Footer (D)
│       ├── HủyButton (outline, close icon)
│       └── LưuButton (primary cream, link icon, disabled until valid)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Title | Atom | `I1002:12682;1002:12500` | Montserrat 32/700/40, black `#00101A` | Yes |
| Nội dung input | Molecule | `I1002:12682;1002:12503` | 549 × 56, border 1 px `#998C5F`, radius 8, bg white | Yes |
| URL input | Molecule | `I1002:12682;1002:12654` | Same shape as Nội dung; decorative IC icon on right (MVP: hidden) | Yes |
| Hủy button | Atom | `I1002:12682;1002:12544` | Radius 4, `--color-secondary-btn-fill`, close icon | Yes |
| Lưu button | Atom | `I1002:12682;1002:12545` | 502 × 60, cream fill `#FFEA9E`, radius 8, link icon | Yes |

---

## Form Fields

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| `text` (Nội dung) | text | Yes | Trimmed length ∈ [1, 100]; rejects whitespace-only | — |
| `url` (URL) | url | Yes | Trimmed length ∈ [5, 2048]; matches `/^https?:\/\/.+$/i`; rejects `javascript:`, `data:`, `file:`, bare domains | — |

### Validation Rules

```typescript
const schema = {
  text: z.string().trim().min(1, "addlink.errors.textRequired").max(100, "addlink.errors.textTooLong"),
  url:  z.string().trim().min(5).max(2048, "addlink.errors.urlTooLong").regex(/^https?:\/\/.+$/i, "addlink.errors.urlInvalid"),
};
// Lưu button is aria-disabled (NOT `disabled`) until both fields pass —
// keeps the disabled state keyboard-reviewable.
```

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| — | — | No network I/O — pure client overlay | — |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Lưu (valid form) | `onSave({ text, url })` prop callback | — | — | Parent invokes TipTap chain: `editor.chain().focus().setLink({ href }).run()` (or `insertContent` for insert mode) |
| Hủy / Esc / backdrop | `onClose()` prop callback | — | — | Parent unmounts dialog; editor unchanged |

No HTTP / Server Actions. No DB writes — payload is persisted only when
Viết Kudo submits (`createKudo` writes `kudos.body` TEXT).

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| Invalid Nội dung | `addlink.errors.textRequired` / `textTooLong` | Red border + inline error under field |
| Invalid URL | `addlink.errors.urlInvalid` / `urlTooLong` | Red border + inline error |
| Editor unmounts mid-dialog | — | Dialog silently closes on React unmount |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `text` | string | `initialText` (from selection or existing `<a>`) | Nội dung value |
| `url` | string | `initialUrl` | URL value |
| `errors` | `{ text?: string; url?: string }` | `{}` | Inline validation |

### Prop-driven (mode)

| Prop | Source | Purpose |
|------|--------|---------|
| `isEditMode` | Viết Kudo editor wrapper detects active `link` mark at caret | Distinguishes insert vs update |
| `initialText` | Current selection OR existing `<a>` inner text | Pre-fill Nội dung |
| `initialUrl` | Existing `<a>` href | Pre-fill URL |

No persistent state — dialog is ephemeral.

---

## UI States

### Initial (insert / edit)
- Insert: both fields empty; focus on Nội dung (or URL if Nội dung pre-filled from selection).
- Edit: both fields pre-filled; focus on URL.

### Valid
- Lưu enabled (cream fill + link icon).

### Invalid
- Per-field red border + inline error; Lưu `aria-disabled="true"`.

### Closing
- Fade + scale entry animation reversed under `motion-safe:`. Under
  `prefers-reduced-motion: reduce`, instant dismiss.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA | `role="dialog"` + `aria-modal="true"` + `aria-labelledby="addlink-title"` |
| Focus trap | Hand-rolled first/last sentinels (same pattern as Viết Kudo FR-015) |
| Keyboard | Tab cycles Nội dung → URL → Hủy → Lưu → wrap. Enter on URL (valid) triggers Lưu. Esc = Hủy. |
| Required fields | `aria-required="true"`; on error `aria-invalid="true"` + `aria-describedby` |
| Disabled button | Lưu uses `aria-disabled="true"` (not `disabled`) so it stays keyboard-focusable |
| Error region | Inline `<p role="alert">` under each field |
| Contrast | WCAG 2.2 AA |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Full-width with 16 px margins; footer stacks vertically (Lưu on top) |
| Tablet (640–1023px) | `max-w-[752px]` with 24 px margins; hug height |
| Desktop (≥1024px) | 752 × hug centred over Viết Kudo |

Animations: 150 ms fade + scale 0.95 → 1 on open; mirror on close.

---

## Analytics Events (Optional)

No analytics in MVP — dialog is a building block inside Viết Kudo and
the parent spec owns compose telemetry.

---

## Design Tokens

Zero new tokens — inherits from Viết Kudo's token set:

| Token | Usage |
|-------|-------|
| `--color-modal-paper` (`#FFF8E1`) | Paper background |
| `--color-border-secondary` (`#998C5F`) | Input borders |
| `--color-accent-cream` (`#FFEA9E`) | Lưu button fill |
| `--color-secondary-btn-fill` | Hủy button fill |
| `--color-error` | Invalid-state border + text |
| `--font-montserrat` | Labels + inputs + buttons |

---

## Implementation Notes

### Dependencies
- TipTap `@tiptap/extension-link` (already in Viết Kudo scope; `openOnClick: false`, `autolink: false`).
- `link` + `close` icons in `src/components/ui/Icon.tsx` (link added by Viết Kudo sprint).
- React Portal to `document.body` (TR-007) so the fixed-position backdrop + paper escape any parent stacking / transform context.

### Special Considerations
- **Nested-modal backdrop**: dialog renders its OWN dim layer stacked above
  Viết Kudo's backdrop. Clicks on Addlink's backdrop close only Addlink.
- **Edit mode detection** lives in the caller (Viết Kudo editor wrapper) —
  inspects TipTap marks at the caret for an active `link` mark.
- **URL regex intentionally loose** (`^https?:\/\/.+$`) — don't build a
  full RFC 3986 parser client-side; length check handles abuse.
- No server-side reachability check (no HEAD on the URL) — out of scope.
- No auto-scheme prefix (typing `sun-asterisk.com` without `https://` is rejected).

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — spec self-contained |
| Confidence Score | High |

### Next Steps

- [ ] Confirm with Design the purpose (if any) of the right-side "IC"
      icon slot on the URL input — currently rendered as a decorative
      placeholder.
- [ ] Decide whether to ship the Phase-2 "confirm on dirty Hủy" prompt
      (US5) based on user feedback.
