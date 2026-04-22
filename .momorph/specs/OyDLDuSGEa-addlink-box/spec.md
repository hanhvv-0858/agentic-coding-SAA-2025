# Feature Specification: Addlink Box (Insert-link dialog)

**Frame ID**: `OyDLDuSGEa` — Figma node `1002:12917`
**Frame Name**: `Addlink Box`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/OyDLDuSGEa
**Created**: 2026-04-21
**Status**: Draft
**Parent screen**: [`ihQ26W78P2` Viết Kudo](../ihQ26W78P2-viet-kudo/spec.md) — this dialog opens when user clicks the Link toolbar button (C.5 per Viết Kudo FR-013) inside the compose editor
**Sibling overlays**: [`p9zO-c4a4x` Dropdown list hashtag](../p9zO-c4a4x-dropdown-list-hashtag/spec.md) — peer overlay owned by the same parent.

---

## Overview

A small secondary modal that opens over the Viết Kudo modal when the user clicks the Link (🔗) button in the TipTap editor toolbar. Collects two fields — **Nội dung** (anchor text, 1-100 chars) and **URL** (valid http/https URL, 5-2048 chars) — and on "Lưu" click injects an `<a href="{url}">{text}</a>` node at the TipTap editor's current cursor position. On "Hủy" click, closes without touching the editor. Shares the Viết Kudo modal's cream-paper (#FFF8E1) aesthetic; sits elevated above Viết Kudo's backdrop.

**Scope of this spec**: the Addlink dialog itself — 2 form fields + 2 action buttons. Does NOT cover: opening logic (Viết Kudo FR-013), the insert-link TipTap command mechanics (plan-phase implementation), or rendering `<a>` tags on the Live board (parent responsibility).

**Known clarifications applied** (from the plan-prep discussion):
- **Editor**: dialog calls into TipTap's `Link` extension (`@tiptap/extension-link`) — already scoped in Viết Kudo TR-001.
- **Selection-aware anchor text**: if the user has text selected when they click the Link button, Nội dung pre-fills with that selection. If no selection, the field starts empty.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Insert a plain-text → URL link (Priority: P1) 🎯 MVP

A Sunner composing a kudo wants to link a Sun* Showcase page. They place their cursor in the body editor, click the 🔗 toolbar button, type "Showcase" in Nội dung, paste `https://showcase.sun-asterisk.com/project-x` in URL, and click Lưu. The dialog closes; in the body editor, `Showcase` now appears as a clickable link pointing to that URL.

**Why this priority**: Links are the only way to reference external resources (project demos, Figma files, etc.) inside a kudo. Without this, the Link toolbar button has no effect. This IS the MVP.

**Independent Test**: From a blank Viết Kudo modal, click Link toolbar button → assert dialog opens with both fields empty → fill both fields → Lưu → assert dialog closes AND the editor now contains an `<a>` node with the correct `href` + inner text.

**Acceptance Scenarios**:

1. **Given** Viết Kudo is open with the body editor focused and no text selected, **When** the user clicks the Link toolbar button, **Then** the Addlink dialog opens with both Nội dung and URL fields empty.
2. **Given** Viết Kudo is open with the user having selected "Xem demo" in the body editor, **When** the user clicks the Link toolbar button, **Then** the dialog opens with Nội dung pre-filled to "Xem demo" and URL empty, focus landing on the URL field.
3. **Given** the dialog is open with both fields filled and valid, **When** the user clicks Lưu, **Then** the dialog closes AND TipTap inserts `<a href="{url}">{text}</a>` at the caret (or wraps the existing selection if Nội dung was pre-filled from one).
4. **Given** the dialog is open, **When** the user clicks Hủy, **Then** the dialog closes with NO changes to the editor content. Editor content + cursor position remain exactly as they were before the dialog opened.
5. **Given** the user successfully inserts a link, **When** focus returns to the editor, **Then** the caret sits at the end of the newly-inserted `<a>` node so the next typed character comes AFTER the link.

---

### User Story 2 — Validation before save (Priority: P1)

The Lưu button MUST be disabled until both fields are valid. Validation checks: Nội dung non-empty (trimmed, 1-100 chars), URL non-empty (trimmed, 5-2048 chars, matches http(s) pattern). If the user clicks Lưu with an invalid field (shouldn't happen due to disable, but defensive), the field gains a red border + inline error and focus moves to the first invalid field.

**Why this priority**: Allowing an empty or malformed URL insertion would produce broken links on the Live board. Client-side validation prevents bad data before it touches the TipTap schema. P1 because it's a correctness guard; P2 would risk data pollution.

**Independent Test**: Fill only Nội dung → assert Lưu disabled. Fill only URL with invalid format (`xxx`) → assert Lưu disabled. Fill URL with valid http/https + valid Nội dung → assert Lưu enabled. Force-click Lưu with an invalid URL (via bypassing disabled) → assert dialog stays open with red border on URL + error "URL không hợp lệ".

**Acceptance Scenarios**:

1. **Given** the dialog opens with empty fields, **When** the user has not typed anything, **Then** the Lưu button is disabled (`aria-disabled="true"`, not just greyed out).
2. **Given** the user fills Nội dung only (URL empty), **When** the form state updates, **Then** Lưu stays disabled.
3. **Given** the user fills URL with a malformed value like "htp://bad" or "not-a-url", **When** blur fires on the URL field, **Then** the field gains a red border + inline error "URL không hợp lệ" AND Lưu stays disabled.
4. **Given** both fields are valid (Nội dung 1-100 chars, URL matches `^https?://` with 5-2048 chars), **When** the form state reflects that, **Then** Lưu becomes enabled.
5. **Given** Nội dung contains only whitespace, **When** the user attempts to save, **Then** validation rejects it (same as empty — trim before length check).
6. **Given** URL exceeds 2048 chars, **When** the form state updates, **Then** the URL field gains a red border + "URL quá dài (tối đa 2048 ký tự)" message.

---

### User Story 3 — Edit an existing link (Priority: P2)

If the user's cursor is inside an existing `<a>` tag in the editor AND they click the Link toolbar button, the dialog MUST open in "edit mode" pre-filling both fields with the existing link's `text` and `href`. On Lưu, the existing `<a>` is updated (not duplicated). On Hủy, the link stays unchanged.

**Why this priority**: The primary MVP is insertion (US1). Edit is a natural follow-up — without it, users who made a typo would have to manually delete the old link before creating a new one. P2 because it's a nicer UX but not strictly blocking.

**Independent Test**: Insert a link via US1, then click somewhere inside that link → click Link toolbar button → assert dialog pre-fills with the link's current text + href → edit URL → Lưu → assert the same `<a>` node now has the updated href (verified via `editor.getHTML()`).

**Acceptance Scenarios**:

1. **Given** the caret is inside an existing `<a href="https://old.com">Old text</a>`, **When** the user clicks the Link toolbar button, **Then** the dialog opens with Nội dung = "Old text" and URL = "https://old.com".
2. **Given** the dialog is in edit mode, **When** the user changes URL to "https://new.com" and clicks Lưu, **Then** the existing `<a>` node's `href` attribute updates to "https://new.com" (NOT a new anchor inserted), and the dialog closes.
3. **Given** the dialog is in edit mode, **When** the user clears both fields and clicks Lưu, **Then** the existing `<a>` node is REMOVED from the editor (unwrapped — inner text stays) OR kept per TipTap's `Link.unsetLink` behaviour. Choose the TipTap default: `unsetLink` strips the anchor attribute while preserving the text.

---

### User Story 4 — Keyboard-only usage (Priority: P2)

The dialog MUST be operable with keyboard alone. Tab cycles through: Nội dung → URL → Hủy → Lưu → (loop). Enter on the URL field (when both fields valid) triggers Lưu. Esc closes the dialog (calls Hủy). Focus is trapped inside the dialog while open.

**Why this priority**: WCAG 2.2 AA (constitution §Principle II). Secondary modals need full keyboard parity; nested dialog-in-dialog makes focus management non-trivial.

**Independent Test**: Tab from initial open → focus lands on Nội dung; type text; Tab → URL; type URL; Enter → Lưu fires (if valid). Or: tab to Hủy → Enter → dialog closes. Or: from anywhere inside dialog, Esc → dialog closes.

**Acceptance Scenarios**:

1. **Given** the dialog opens, **When** focus settles, **Then** the first empty required field receives focus (Nội dung if empty, else URL).
2. **Given** focus is on URL with valid content, **When** the user presses Enter, **Then** Lưu fires (if form is valid). If form is invalid, Enter is a no-op (NOT a form submit via browser default).
3. **Given** the dialog is open, **When** the user presses Esc, **Then** Hủy fires (dialog closes with no editor change).
4. **Given** the dialog is open, **When** the user tabs past Lưu, **Then** focus wraps back to Nội dung (focus trap via first/last sentinels; same pattern as the parent Viết Kudo FR-015).

---

### User Story 5 — Cancel with dirty state (Priority: P3)

If the user has typed into either field and clicks Hủy (or backdrop, or Esc), a soft confirm MAY fire asking "Bỏ liên kết? Thay đổi chưa được lưu." Before closing. This is lower priority than the rest because the dialog is small and losing a draft link is cheap — a full confirm dialog could feel heavy.

**Why this priority**: Nice to have but optional. For MVP, skip the confirm and just close — the content is trivial to retype. Ship the confirm only if user feedback demands it.

**Independent Test**: Type into Nội dung, click Hủy → dialog closes immediately (no confirm). Document this as an explicit out-of-scope behavior for MVP.

**Acceptance Scenarios**:

1. **Given** the user has typed into either field and the form is dirty, **When** the user clicks Hủy, **Then** the dialog closes immediately without a confirm prompt (MVP behaviour). A confirm prompt is a Phase-2 enhancement if user feedback asks for it.

---

### Edge Cases

- **Selection spans multiple nodes (e.g., includes an image or another link)**: If the user selects text that crosses an `<img>` boundary and clicks Link, TipTap's `setLink` command applies only to the plain-text portion. Document the TipTap default; don't special-case.
- **Paste an invalid URL**: Same as typing invalid — blur triggers validation.
- **URL without protocol** (e.g. `sun-asterisk.com`): Reject per regex `^https?://`. Document explicitly. Auto-prefix `https://` is NOT spec'd for MVP (could be surprising UX); ship plain validation.
- **URL contains `javascript:` or other non-http schemes**: Reject — regex enforces `https?://` only.
- **User clicks Link button while body editor is NOT focused** (e.g., Nội dung field has focus in Viết Kudo): The dialog opens normally but inserting would be meaningless. Edge handled by Viết Kudo: Link toolbar button is enabled only when the body editor has focus. If the Addlink dialog is opened anyway via keyboard, Lưu click calls `editor.focus()` first then inserts at the restored caret — or falls back to appending at the end of the body. Prefer the first approach.
- **Backdrop click on the Viết Kudo modal underneath**: Does NOT close Addlink (Addlink is modal-on-modal). Only closes Addlink via Hủy / Esc / Lưu success.
- **Rapid double-click on Lưu**: `useTransition` wraps the insert → React batches; no double-insert. Defence: first click disables Lưu synchronously.
- **Resize / zoom**: Dialog scales normally; test at browser zoom 200%.
- **Paste a URL with trailing whitespace**: Trim on blur AND on submit. Don't show the trailing space as valid.
- **The editor becomes invalid before Lưu fires** (parent Viết Kudo modal unmounts mid-dialog): Addlink catches the missing editor ref and silently closes — the orphaned state is handled by React unmount.
- **Reduced-motion preference**: Respect `prefers-reduced-motion: reduce` — skip any scale/fade entry animation for the Addlink dialog.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Ref | Component | Node ID (Figma) | Description | Interactions |
|---|---|---|---|---|
| A | Title "Thêm đường dẫn" | `I1002:12682;1002:12500` | 672 × 40, Montserrat 32/700/40, black `#00101A`, left-aligned (matches Viết Kudo title pattern) | Read-only |
| B | Nội dung field | `I1002:12682;1002:12501` | Row: label "Nội dung" (107 × 28) + text input (549 × 56, flex-1). **Required**, 1-100 chars, no whitespace-only. | Type / paste. Blur fires length validation. Red border on error. |
| B.1 | Nội dung label | `I1002:12682;1002:12502` | Montserrat 22/700/28, black, centred within its 107 px container | Click label → focus input (native `<label for="…">`) |
| B.2 | Nội dung input | `I1002:12682;1002:12503` | 549 × 56, border 1 px `#998C5F`, bg `#FFF`, radius 8 px, padding 16/24, placeholder empty | Type, paste, blur → validate |
| C | URL field | `I1002:12682;1002:12652` | Same layout as B but label is "URL" (47 × 28) and input is flex-1 (~609 px). **Required**, 5-2048 chars, matches `^https?://`. | Type / paste. Blur fires format + length validation. Red border on error. |
| C.1 | URL label | `I1002:12682;1002:12653` | Montserrat 22/700/28, black | Click label → focus input |
| C.2 | URL input | `I1002:12682;1002:12654` | Border 1 px `#998C5F`, bg `#FFF`, radius 8 px, padding 16/24. Right-side icon slot (node `186:2761` "IC" — 24×24) is **NOT rendered** for MVP — the Figma node is unannotated and the rendered screenshot shows no visible icon. If Design later specifies a function (paste-from-clipboard, clear, URL-validity indicator), add it in a follow-up and the input's right-padding bumps from `px-6` to `pr-14`. | Type, paste, blur → validate |
| D | Footer buttons group | `I1002:12682;1002:12543` | 672 × 60, flex row, gap 24, left-aligned | Hosts Hủy + Lưu |
| D.1 | Hủy button | `I1002:12682;1002:12544` | padding 16/40, border 1 px `#998C5F`, bg `var(--color-secondary-btn-fill)` (cream @ 10%), radius 4 px (!) — smaller radius than Lưu, "Hủy" text + close icon | Click → close dialog, no editor change |
| D.2 | Lưu button | `I1002:12682;1002:12545` | 502 × 60, bg `#FFEA9E` (solid cream), radius 8 px, "Lưu" text + link icon, centred | Click (when valid) → insert/update link + close |

### Navigation Flow

- **From**: Click on the Link toolbar button (C.5 in Viết Kudo) inside the compose editor. Keyboard: Tab to the Link button + Enter.
- **To**:
  - **Lưu → insert / update link** → dialog closes → focus returns to body editor (caret at end of inserted `<a>`)
  - **Hủy / Esc / focus-lost** → dialog closes → focus returns to body editor (caret unchanged)
  - No external navigation — everything stays within the Viết Kudo modal
- **Triggers**: Mouse click, keyboard (Tab, Enter, Esc)

### Visual Requirements

- **Responsive breakpoints**:
  - Desktop (≥ 1024 px): 752 × hug centred over Viết Kudo
  - Tablet (640-1023 px): `max-w-[752px]` with 24 px margins, hug height
  - Mobile (< 640 px): full-width with 16 px margins, footer stacks vertically (Lưu on top per primary-action convention)
- **Animations**: 150 ms fade + scale 0.95 → 1 on open, mirror on close. `motion-safe:` wrapped.
- **Accessibility**:
  - `role="dialog"` + `aria-modal="true"` + `aria-labelledby="addlink-title"` pointing to the "Thêm đường dẫn" h2
  - Focus trap via first/last sentinels (no new lib — same pattern as Viết Kudo FR-015)
  - Each input has `aria-required="true"`; on validation error, `aria-invalid="true"` + `aria-describedby` pointing to inline error message
  - Lưu button `aria-disabled="true"` while form invalid (NOT `disabled` — `disabled` would prevent focus which breaks keyboard review of why it's disabled)
  - Esc → Hủy equivalence
  - Inline error messages live in a `<p>` below each field, `role="alert"` for the validation errors so SR announces changes

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dialog MUST open in response to (a) click on the Link toolbar button in Viết Kudo's compose editor, (b) keyboard Enter/Space on the focused Link button.
- **FR-002**: If the user has text selected in the body editor when opening, Nội dung MUST pre-fill with that selection AND focus lands on the URL field. Otherwise, Nội dung starts empty AND focus lands on Nội dung.
- **FR-003**: If the caret is inside an existing `<a>` tag, the dialog MUST open in "edit mode" — Nội dung pre-fills with the link's current inner text, URL pre-fills with the link's current `href`. On Lưu, the existing anchor is UPDATED, not duplicated.
- **FR-004**: The dialog MUST validate on blur AND on change: Nội dung → trimmed length 1-100, URL → trimmed length 5-2048 + matches `/^https?:\/\/.+/i`. Lưu button is disabled (`aria-disabled="true"`) unless both validators pass.
- **FR-005**: On Lưu click with a valid form, the dialog MUST invoke TipTap's `setLink({ href })` command on the active selection/caret AND then insert the anchor text if not already in the selection. The exact TipTap calls:
  - Insertion mode (no selection OR selection doesn't match Nội dung): `editor.chain().focus().insertContent(\`<a href="${url}">${text}</a>\`).run()`
  - Wrap-selection mode (selection text === Nội dung): `editor.chain().focus().setLink({ href: url }).run()`
  - Edit mode (caret inside existing `<a>`): `editor.chain().focus().extendMarkRange('link').setLink({ href: url }).command(({ tr }) => { tr.insertText(text); return true; }).run()`
  Implementation plan decides the exact command sequence — all three variants MUST produce a single `<a>` node with correct `href` + inner text.
- **FR-006**: On Lưu success, the dialog MUST close AND focus returns to the body editor with the caret positioned at the END of the newly-inserted `<a>` node.
- **FR-007**: On Hủy (or Esc, or **click on the Addlink dialog's own backdrop** — see backdrop model below), the dialog MUST close WITHOUT any editor mutation. Addlink renders its OWN dedicated backdrop layer (`bg-black/40` or similar dim) stacked ABOVE the Viết Kudo modal + its backdrop. Clicks on the Addlink backdrop close only Addlink; the Viết Kudo modal remains open. Clicks on the Addlink dialog paper itself are NOT close triggers.
- **FR-008**: The URL field MUST accept `http://` and `https://` schemes only. `javascript:`, `data:`, `file:`, and bare domains without scheme are rejected by the validator.
- **FR-009**: Inline error messages MUST be localised (vi / en catalogs — use the existing `useMessages`/`getMessages()` pattern). Default Vietnamese text: "Vui lòng nhập nội dung", "Vui lòng nhập URL", "URL không hợp lệ", "URL quá dài (tối đa 2048 ký tự)", "Nội dung quá dài (tối đa 100 ký tự)".
- **FR-010**: Focus trap — Tab from Lưu cycles to Nội dung; Shift+Tab from Nội dung cycles to Lưu. Esc always closes (equivalent to Hủy).
- **FR-011**: The dialog MUST NOT close the parent Viết Kudo modal. Clicks on the Viết Kudo backdrop underneath (visible around the Addlink paper edges) MUST be blocked while Addlink is open (event propagation stopped).

### Technical Requirements

- **TR-001 (Composition)**: The dialog is a new client component at `src/components/kudos/AddlinkDialog.tsx`. Prop surface:
  ```ts
  type AddlinkDialogProps = {
    isOpen: boolean;
    initialText?: string;          // from current selection or existing <a> inner text
    initialUrl?: string;           // from existing <a> href (edit mode)
    isEditMode?: boolean;          // distinguishes insert vs update
    onSave: (payload: { text: string; url: string }) => void; // parent executes TipTap command
    onClose: () => void;
  };
  ```
  Parent (`<Viết Kudo>`) holds TipTap editor ref; the dialog is TipTap-agnostic and simply hands back `{ text, url }`.
- **TR-002 (TipTap integration)**: Uses the Link extension already in Viết Kudo TR-001 (`@tiptap/extension-link`). Configure with `openOnClick: false` (Live-board rendering opens links; compose doesn't need click-through) and `autolink: false` (the compose flow explicitly prompts for URL; no automatic detection).
- **TR-003 (Validation)**: Client-side only. URL regex: `^https?:\/\/[^\s]+$` (reject whitespace, require scheme). Length enforced separately. No server-side URL reachability check for MVP (could spam servers; Phase 2 if needed).
- **TR-004 (Focus management)**: Use the same focus-trap pattern as Viết Kudo (FR-015) — hand-rolled first/last sentinel sentinels, no third-party lib.
- **TR-005 (No new icons)**: Reuses `link` icon (being added to `Icon.tsx` by Viết Kudo — see Viết Kudo §Icon Specifications) and `close` icon (already exists). Zero net-new icons from this spec.
- **TR-006 (No new tokens)**: Reuses `--color-modal-paper`, `--color-border-secondary`, `--color-accent-cream`, `--color-secondary-btn-fill` — all in globals.css (or being added by Viết Kudo plan). Zero new tokens.
- **TR-007 (React Portal)**: The dialog MUST render via `createPortal(<AddlinkDialog />, document.body)` so its `position: fixed` backdrop + paper escape any parent stacking context (e.g., Viết Kudo's `overflow-hidden` or `transform` wrappers). Portal target: `document.body`. This also keeps the ARIA `role="dialog"` at the top of the a11y tree, above Viết Kudo's `role="dialog"`, matching nested-modal stacking semantics.

### Data Requirements (consolidated)

| Field | Type | Required? | Validation | Where it lands |
|---|---|---|---|---|
| Nội dung (anchor text) | `string` | Yes | Trimmed length 1..100; no whitespace-only | Inner text of the inserted `<a>` node in TipTap body |
| URL (href) | `string` | Yes | Trimmed length 5..2048; matches `/^https?:\/\/.+/i`; rejects `javascript:`, `data:`, `file:`, bare domains | `href` attribute of the inserted `<a>` node |

No database writes from this screen — the payload is persisted only when Viết Kudo submits the overall kudo (parent's `createKudo` Server Action writes the body HTML to `kudos.body`).

### Key Entities

No database entities. The dialog produces a plain `{ text, url }` payload handed to TipTap, which persists as HTML in the parent's body editor state — ultimately stored in `kudos.body` (TEXT) when Viết Kudo submits.

### State Management

| Layer | State | Owner | Lifetime |
|---|---|---|---|
| **Local (form)** | `text: string`, `url: string`, `errors: { text?: string; url?: string }` | `<AddlinkDialog>` component (`useState`) | Until dialog closes |
| **Local (focus trap)** | DOM focus position | First/last sentinel refs | While dialog open |
| **Prop-driven (mode)** | `isEditMode`, `initialText`, `initialUrl` | Viết Kudo body-editor wrapper | Per open |
| **No persistent state** | — | — | Dialog is ephemeral; any unsaved content is lost on Hủy (FR-012 is Phase 2) |

---

## API Dependencies

No HTTP / Server Actions. The dialog is purely client-side; it handles form state and hands the validated payload to the parent, which calls TipTap's `setLink`.

---

## Success Criteria *(mandatory)*

- **SC-001**: 100 % of Lưu-button clicks on a valid form invoke `onSave` exactly once with `{ text, url }` — verified by a unit test that mocks `onSave`, fills valid fields, clicks Lưu, and asserts `expect(onSave).toHaveBeenCalledTimes(1)` plus the payload shape. The actual `<a>` node insertion happens in the parent Viết Kudo component (TipTap command) and is covered by Viết Kudo's own tests, not this spec.
- **SC-002**: 100 % of invalid-form Lưu attempts are blocked — verified by a unit test with `url = "htp://bad"` asserting `onSave` is NOT called AND the URL field carries `aria-invalid="true"`.
- **SC-003**: Esc + backdrop + Hủy all call `onClose` with zero `onSave` calls — verified by 3 unit tests.
- **SC-004**: Focus trap — Tab from Lưu cycles to Nội dung; verified by a unit test using `userEvent.tab()`.
- **SC-005**: Axe-core zero violations when the dialog is open.

---

## Out of Scope

- **Auto-scheme prefix**: Pasting `sun-asterisk.com` does NOT auto-prefix `https://`; user must type it. A Phase 2 "did you mean https://..." hint is possible but not spec'd.
- **URL reachability check**: No server-side HEAD to confirm the URL is live. If the URL 404s later, the link on the Live board will simply be broken.
- **Link preview / OG card**: The link inserts as a plain `<a>` with text only. No embedded preview card.
- **Open in new tab checkbox**: Figma shows only two fields. `target="_blank"` is not offered as an option — the Live-board renderer decides per kudo or defaults to same-tab.
- **Rich-media links** (email, phone): No `mailto:` or `tel:` schemes. http/https only.
- **Draft auto-save of the dialog's fields**: Closing and reopening starts fresh.
- **Confirm-on-dirty-Hủy** (US5): deferred to Phase 2.

---

## Dependencies

- [x] Constitution document exists
- [x] `Icon` registry — `close` icon exists
- [ ] **Depends on Viết Kudo** — Viết Kudo plan adds `link` icon to `Icon.tsx` + adds `--color-modal-paper`, `--color-error`, `--color-secondary-btn-fill` tokens to globals.css. If this dialog ships before those additions, the `link` icon rendering + error colour land together with Viết Kudo.
- [x] Parent spec `ihQ26W78P2-viet-kudo` authored
- [x] TipTap `@tiptap/extension-link` — already scoped by Viết Kudo TR-001
- [ ] **NEW**: `src/components/kudos/AddlinkDialog.tsx` component to be written
- [ ] **NEW**: `AddlinkDialog.spec.tsx` unit tests
- [ ] SCREENFLOW tracker — flip row #14 from ⚪ pending to 📋 spec'd

---

## Notes

**Relationship to the existing Viết Kudo modal**: This dialog is a **nested modal** over the Viết Kudo modal. Two stacked backdrops visually (Viết Kudo's dim + Addlink's subtle). The focus trap on Addlink takes precedence over Viết Kudo's focus trap. Clicks on Viết Kudo's backdrop do NOT close Addlink (FR-011). Esc in Addlink ONLY closes Addlink — to close Viết Kudo the user must close Addlink first, then Esc again.

**Right-side "IC" icon on URL input** (Figma node `I1002:12682;1002:12654;186:2761`): The Figma node is present but `list_design_items` doesn't annotate its purpose. Candidates:
- Paste-from-clipboard button (tap to inject clipboard contents)
- URL-preview indicator
- Clear ("X") button

For MVP, render this icon as a **decorative placeholder only** (`aria-hidden="true"`, no click handler). If Design later annotates it with a specific function, add the interaction in a follow-up. A reasonable default glyph: `link` (same as Lưu button's trailing icon).

**Edit-mode detection**: The caller (Viết Kudo's editor wrapper) owns detection logic — inspects TipTap's current marks at the caret to find an active `link` mark. If found, the caller passes `isEditMode=true`, `initialText`, `initialUrl`; otherwise all initial props are empty. The Addlink component itself does not know about TipTap — keeps it decoupled + unit-testable without an editor instance.

**Validation strictness**: URL regex `^https?:\/\/.+$` is intentionally loose (accepts any non-whitespace after the scheme). Don't try to build a full RFC 3986 URL parser client-side — the `URL` constructor can be used for sanity ("will the browser accept this?") but errors from it are language-specific and hard to translate. The simple regex + length check is sufficient for MVP.

**Nested-dialog pattern feasibility**: Using native HTML `<dialog>` with `showModal()` inside another open `<dialog>` is well-supported modern browsers (Chrome 37+, Safari 15.4+, Firefox 98+). Alternative: use a regular `<div role="dialog">` with explicit backdrop + focus trap (what the parent Viết Kudo spec already plans). This spec follows the parent's choice — both Addlink and Viết Kudo use the same implementation pattern.
