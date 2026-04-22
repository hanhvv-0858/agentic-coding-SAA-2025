# Feature Specification: Viết Kudo (Compose Kudo)

**Frame ID**: `ihQ26W78P2` (main) — `520:11602` Figma node
**Error variant**: `5c7PkAibyD` folded as UI state "validation error" (no separate spec)
**Frame Name**: `Viết Kudo`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
**Created**: 2026-04-21
**Status**: Draft
**Sibling specs (compose overlays, authored separately)**: [`p9zO-c4a4x` Dropdown list hashtag](../p9zO-c4a4x-dropdown-list-hashtag/) · [`OyDLDuSGEa` Addlink Box](../OyDLDuSGEa-addlink-box/) — both open as child dialogs of this screen.

---

## Overview

Modal form that lets a Sunner compose and publish a kudo (lời cảm ơn + ghi nhận) to one or more teammates. Opened from (a) the FAB expanded-menu "Viết KUDOS" tile and (b) the "Viết KUDO" CTA on the Thể lệ page. On submit, posts to a new `createKudo` Server Action which atomically inserts into `kudos` + `kudo_recipients` + `kudo_hashtags` + `kudo_images` and revalidates the Live board feed. The cream-paper modal (#FFF8E1) sits centred over the parent page backdrop.

**Scope of this spec**: the parent modal + error validation state. The two child overlays (hashtag picker, addlink box) have their own specs. The image-upload flow touches Supabase Storage and introduces one net-new storage bucket (`kudo-images`).

**Known clarifications applied** (from the `/momorph.plan` prep discussion + `/momorph.reviewspecify` rounds 1+2):
- **Editor**: TipTap (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-mention`) — Option A (plain textarea) was rejected because the toolbar requires Bold/Italic/Strike/BulletList/Link/Blockquote + inline `@mention`.
- **Storage**: `kudo-images` bucket, **private** with authenticated RLS read + owner-only write, 5 MB / file, MIME whitelist = `image/jpeg`, `image/png`, `image/webp`.
- **Rich-text serialisation**: TipTap default HTML → stored in `kudos.body` column (TEXT). Sanitisation inherits from TipTap's built-in schema.
- **Recipients**: **single recipient per kudo** (resolved Q1 2026-04-21). The `kudo_recipients` junction still supports N structurally but this screen writes exactly one row per new kudo. Multi-recipient remains available as a Phase 2 expansion without schema change.
- **Anonymous flag**: **migration `0015_kudo_anonymous.sql` adds `kudos.is_anonymous boolean not null default false`** (resolved Q2 2026-04-21). US6 + FR-011 + SC-005 stay in scope.
- **Anonymous nickname** (resolved 2026-04-21 round 3 + round-3-visual): Figma item **G** ("Gửi ẩn danh") requires a **nickname text field** to appear when the checkbox is ticked. Label per the round-3 screenshot is **"Nickname ẩn danh"** (not "Tên ẩn danh"). The round-3 screenshot also updated item G itself: checkbox label colour is now `--color-brand-900` (was muted-grey `#999`) and the checked-state fill is `--color-border-secondary` (olive `#998C5F`, was cream). **Migration `0017_kudo_anonymous_alias.sql`** adds `kudos.anonymous_alias text null` (CHECK: `char_length(btrim(...)) between 2 and 40` when `is_anonymous=true`, else `null`). The nickname is **required** when `is_anonymous=true` (client-side validation + DB CHECK). Unicode allowed (giống `profiles.display_name`). No moderation / no impersonation check for MVP. The nickname is **public** — rendered everywhere in place of the sender's real name on anonymous kudos. **Not persisted** to the user profile (fresh input per kudo).
- **Standards link**: opens in **new tab** (`target="_blank" rel="noopener noreferrer"`) — the target page is TBD (not `/the-le`), a future spec will define it (resolved Q3 2026-04-21).
- **Image URL storage**: `kudo_images.url` stores the **Storage path** (e.g. `{userId}/{uuid}.jpg`); read-path generates signed URLs via `createSignedUrl(path, 3600)` on each render (resolved Q4 2026-04-21). Changeable later: the column is `text` so a future migration can transform stored values OR add a helper column without schema break.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Compose + send a kudo (Priority: P1) 🎯 MVP

A Sunner spots a teammate who went above and beyond on a project. They open the Viết Kudo modal from the FAB, pick the teammate as recipient, type a title ("Người truyền động lực cho tôi"), write a few paragraphs in the body editor, pick one or more hashtags, optionally attach a photo, and click Gửi. The modal closes, the Live board refreshes, and the new kudo appears at the top of the feed.

**Why this priority**: This IS the core interaction of the whole event. Without a working compose flow, the entire Live board is just a static seed dataset. Every other story (validation, @mention, anonymous, etc.) is decoration on top.

**Independent Test**: Open `/kudos` (or any authenticated page), click the FAB → "Viết KUDOS" tile → fill all required fields (Người nhận, Danh hiệu, Body, ≥1 Hashtag) → Gửi → modal closes → new kudo visible on `/kudos` within 1 second (optimistic revalidation).

**Acceptance Scenarios**:

1. **Given** a Sunner is logged in with the compose modal open, **When** they fill Recipient ("Bob"), Title ("Hero Frontend"), Body ("Cảm ơn bạn đã support team rất nhiều..."), pick hashtag `#dedicated`, and click **Gửi**, **Then** the modal closes within 200 ms and a new kudo with those fields appears on `/kudos` after `revalidatePath("/kudos")`.
2. **Given** the modal is open with all required fields filled, **When** the user presses Enter inside any input (except the rich-text body, where Enter inserts a newline), **Then** submit does NOT fire — only the Gửi button click or its keyboard-activation triggers submit (prevents accidental submit-by-tab-and-Enter).
3. **Given** a successful submit, **When** the modal closes, **Then** focus returns to the trigger element (FAB or Thể lệ CTA) so keyboard-only users don't lose their place.
4. **Given** the submit Server Action throws (network error, RLS violation, etc.), **When** the UI receives the error, **Then** the modal STAYS open, shows a generic error toast ("Không gửi được. Thử lại sau."), and the Gửi button re-enables so the user can retry without retyping.

---

### User Story 2 — Validation error state when required fields missing (Priority: P1)

This story folds in the `5c7PkAibyD` "Viết KUDO - Lỗi chưa điền đủ thông tin đã ấn gửi" variant. A Sunner rushes through the form and clicks Gửi with one or more required fields empty. Instead of submitting, the modal surfaces red validation borders + inline messages under each missing field; the Gửi button stays disabled until all required fields become valid.

**Why this priority**: P1 because submitting an incomplete kudo to the server is wasteful + pollutes the DB with half-formed records. The client-side validation also doubles as the visible contract of "what's required" — without red borders, a user hitting a silent-reject has no feedback.

**Independent Test**: Open the modal, leave Recipient empty, fill everything else, click Gửi. Expected: no network request fires, Recipient input gains a red border + "Vui lòng chọn người nhận" inline message appears below it, and focus jumps to the Recipient input so the user can fix it.

**Acceptance Scenarios**:

1. **Given** the modal is open with Recipient empty but all other required fields filled, **When** the user clicks Gửi, **Then** no `createKudo` Server Action call fires, the Recipient input gains `border-[var(--color-error)]` (the red validation border), and a small red message "Vui lòng chọn người nhận" renders below.
2. **Given** multiple required fields are empty, **When** the user clicks Gửi, **Then** ALL missing fields gain the red border simultaneously, and focus moves to the FIRST missing field in visual order (Recipient → Title → Body → Hashtag).
3. **Given** a field has the red border error, **When** the user types into it / picks a value, **Then** the border reverts to the normal gold `var(--color-border-secondary)` as soon as the field becomes non-empty; the inline message disappears.
4. **Given** all required fields are now valid, **When** the user clicks Gửi, **Then** submit fires normally (US1 path).
5. **Given** a Hashtag count outside 1..5 (e.g., 0 selected, or 6+ tried to be selected), **When** the user clicks Gửi or tries to add a 6th tag, **Then** the validation prevents submit / rejects the 6th-tag click with "Tối đa 5 hashtag" feedback.

---

### User Story 3 — @mention a teammate in the body (Priority: P2)

While typing in the body editor, the author types `@` followed by the first letters of a teammate's name. A suggestion dropdown appears showing matching profiles from `searchSunner`. Selecting a suggestion inserts a mention node rendered as a cream-highlighted chip tied to that profile ID. The mention is persisted so the Live board can render it as a clickable link to the profile.

**Why this priority**: Core to the social fabric of kudos — teams want to shout-out specific colleagues without retyping "@ten" literally. However US1 ships without this (user can type `@ten` as plain text), so it's P2 not P1.

**Independent Test**: Inside the body editor, type `@al` — the suggestion dropdown lists profiles matching "al" (Alice, Alison, etc.); Enter or click on Alice inserts a chip; submit the kudo → stored mention is round-tripped correctly in the DB + rendered as a chip on the Live board card.

**Acceptance Scenarios**:

1. **Given** focus is in the body editor, **When** the user types `@` followed by ≥1 character, **Then** a suggestion popover (floating, anchored at the caret) appears listing up to 10 Sunners from `searchSunner(query)`.
2. **Given** the suggestion popover is open, **When** the user presses ↓/↑ to navigate, Enter to select, or Esc to dismiss, **Then** the popover responds as expected (keyboard-first parity).
3. **Given** a mention chip is inserted, **When** the kudo is submitted, **Then** the chip round-trips through the DB (mention metadata stored in `kudos.body` as TipTap HTML with `data-mention-id` attribute) and renders as a chip on the Live board.
4. **Given** the user types `@xxx` where no matching Sunner exists, **When** the search returns empty, **Then** the popover shows "Không tìm thấy đồng nghiệp" and Enter/click does nothing (the literal `@xxx` stays as plain text).

---

### User Story 4 — Pick hashtags via the compose-time picker (Priority: P2)

The user clicks the "+ Hashtag" chip-button next to the Hashtag field. The `p9zO-c4a4x` overlay opens (spec'd separately) showing a scrollable list of available hashtags. Selecting a hashtag adds it as a chip next to the button; clicking the chip's × removes it. The picker enforces the 1..5 range by hiding the "+ Hashtag" button when 5 tags are already selected.

**Why this priority**: Core to kudo classification (Hashtag field is **required** per Figma → at least 1 tag must be selected). P2 because the button could theoretically be inlined into a `<select>` for an MVP without the `p9zO-c4a4x` picker, but that loses the "selected / not-selected" visual cue.

**Independent Test**: Click "+ Hashtag" → picker opens → click `#dedicated` → chip appears next to the button → click `#wasshoi` → second chip appears. Click × on `#dedicated` chip → it vanishes, picker re-enables that option. Add a 5th tag → "+ Hashtag" button disappears. Remove any tag → "+ Hashtag" button returns.

**Acceptance Scenarios**:

1. **Given** zero hashtags selected, **When** the user clicks "+ Hashtag", **Then** the `p9zO-c4a4x` overlay opens with all hashtags visible.
2. **Given** a hashtag is selected in the overlay, **When** the overlay closes, **Then** a chip appears next to the "+ Hashtag" button showing the hashtag label (localised via the existing `getKudoHashtags` pattern).
3. **Given** 5 hashtags are selected, **When** the user looks at the form, **Then** the "+ Hashtag" button is removed from the DOM (not just visually hidden) to keep keyboard-tab order clean.
4. **Given** any selected chip, **When** the user clicks the × icon on the chip, **Then** the chip is removed and the "+ Hashtag" button re-appears if count drops below 5.

---

### User Story 5 — Attach images (Priority: P2)

The user clicks "+ Image" — a native file picker opens, constrained to jpeg/png/webp. Selected file(s) upload to the `kudo-images` Supabase Storage bucket; progress can be visible but not strictly required for MVP. Once uploaded, a 80×80 thumbnail appears with a red × button to remove. Maximum 5 images total; each ≤ 5 MB.

**Why this priority**: Nice to have for the event — photos of team moments make kudos visually rich. But the feed can display just text + hashtag cards effectively.

**Independent Test**: Click "+ Image" → pick a 2 MB PNG → thumbnail appears → submit kudo → image URL is persisted in `kudo_images` junction + renders on the Live board card. Try a 6 MB file → client-side rejection toast "Ảnh phải nhỏ hơn 5 MB". Try a .pdf → "Chỉ hỗ trợ JPG, PNG, WebP".

**Acceptance Scenarios**:

1. **Given** 0 images selected, **When** the user clicks "+ Image" and picks a 2 MB JPEG, **Then** the file uploads to `kudo-images/{userId}/{uuid}.jpg`, a signed URL is returned (TTL 1 h), and a thumbnail renders.
2. **Given** 5 images selected, **When** the user looks at the form, **Then** the "+ Image" button is removed (same pattern as hashtags).
3. **Given** a user tries to upload a 6 MB PNG, **When** the file picker returns, **Then** the client rejects BEFORE calling Storage and shows "Ảnh phải nhỏ hơn 5 MB". No network request fires.
4. **Given** a user tries to upload a PDF, **When** the file picker returns, **Then** the client rejects with "Chỉ hỗ trợ JPG, PNG, WebP".
5. **Given** a user clicks × on a thumbnail, **When** the image was already uploaded to Storage, **Then** the client removes it from the form state AND (best-effort) deletes it from Storage — leaving orphan files if delete fails is acceptable for MVP (a garbage-collection job is a Phase-2 concern).
6. **Given** the user clicks Hủy on the modal after uploading images, **When** the modal closes, **Then** the client best-effort deletes all uploaded-but-not-submitted files from Storage (documented limitation: network interruption during cleanup leaves orphans).

---

### User Story 6 — Send anonymously with a nickname (Priority: P3)

The user checks "Gửi lời cám ơn và ghi nhận ẩn danh". A nickname text field **appears below the checkbox** (Figma item G). The user types a nickname (2–40 chars) and submits. The kudo is stored with `is_anonymous=true` + `anonymous_alias='<nickname>'`. On the Live board, the sender's real name + avatar are hidden and replaced with the nickname (plus a neutral monogram avatar derived from the nickname). The recipient sees the nickname, not the sender. (Naming note: the DB column remains `anonymous_alias` — "alias" = schema concept, "nickname" = user-facing copy per the round-3 screenshot.)

**Why this priority**: A small but culturally important option — lets shy or senior Sunners send appreciation without drawing attention to themselves. Low priority because the feature is self-contained and ships after core compose works.

**Independent Test**: Fill a valid form, tick the checkbox, type alias "NinjaSunner", Gửi. On the Live board, the new kudo card shows "NinjaSunner" where the sender name normally appears.

**Acceptance Scenarios**:

1. **Given** the anonymous checkbox is ticked, **When** the user submits **without** typing a nickname, **Then** validation fires: the nickname input gains a red border + inline message "Vui lòng nhập nickname (2–40 ký tự)", Gửi stays disabled, and `createKudo` is NOT invoked.
2. **Given** the anonymous checkbox is ticked and alias = "NinjaSunner", **When** the user submits, **Then** `createKudo` sets `kudos.is_anonymous = true` and `kudos.anonymous_alias = 'NinjaSunner'` in the INSERT.
3. **Given** a kudo with `is_anonymous = true` and `anonymous_alias = 'NinjaSunner'`, **When** rendered on the Live board, **Then** the sender avatar is replaced with a **monogram derived from the alias** (first two letters, colour-hashed via `pickMonogramColor`) and the sender name is replaced with the alias text. The Live-board card owns this rendering — this spec flags the contract.
4. **Given** the kudo is anonymous, **When** the recipient views their own received-kudo list, **Then** the kudo shows the alias instead of the sender's real identity (consistent with the Live-board rule).
5. **Given** the user types a nickname >40 chars, **When** blur or submit, **Then** validation fires with message "Nickname tối đa 40 ký tự".
6. **Given** the user types a nickname of exactly 1 character, **When** blur or submit, **Then** validation fires with message "Vui lòng nhập nickname (2–40 ký tự)" (single copy covers both the empty and <2 cases).
7. **Given** the user unchecks the anonymous checkbox after typing a nickname, **When** they uncheck, **Then** the nickname field is hidden AND its value is discarded (not persisted into `createKudo`). Re-checking shows an empty nickname field.

---

### Edge Cases

- **Submit while an image is still uploading**: Block submit — the Gửi button disables while `isUploading===true`; show a subtle "Đang upload..." helper text under the Image row. Alternative (simpler) design: disable Gửi only; let the upload finish naturally.
- **Submit pressed twice (double-click)**: `useTransition` + disable button on the first click — second click is a no-op.
- **Recipient = self (the author)**: Allowed. Self-kudos are a thing in the event spec. But flag as a nuance for plan review — if the product team wants to disallow, the `createKudo` action validates `sender_id != recipient_id`.
- **Dirty state + close attempt**: If the form has any unsaved content (body text, uploaded images, selected recipient/hashtags), clicking Hủy or the backdrop MUST show a confirm dialog "Bỏ bản nháp? Nội dung chưa gửi sẽ mất." before closing. Initially-empty form closes without prompt.
- **Hashtag dropdown empty** (e.g., `getKudoHashtags()` returns []): "+ Hashtag" button disabled with tooltip "Đang tải hashtag..." or similar. The form stays un-submittable until hashtags load.
- **@mention search returns 500**: Popover shows "Lỗi kết nối. Thử lại." — user can continue typing plain text `@ten` as a fallback.
- **Body editor pastes HTML with disallowed tags** (e.g., `<script>`, `<iframe>`): TipTap's default schema strips these. No extra sanitisation needed.
- **Storage upload returns 403 (RLS policy misconfigured)**: Client shows "Tải ảnh lỗi. Kiểm tra lại quyền." — this would indicate a setup bug, not a user error.
- **Network lost mid-submit**: `useTransition` surfaces the error; modal stays open; retry button available.
- **Body editor cleared, then submit**: Even with Title + Recipient + Hashtag set, an empty body fails validation (body is required).
- **Anonymous checked, nickname empty / whitespace only**: Trimmed nickname length < 2 → validation fires with "Vui lòng nhập nickname (2–40 ký tự)"; Gửi disabled; `createKudo` not invoked.
- **Anonymous checked, nickname > 40 chars**: Input enforces `maxLength=40`; on blur/submit shows "Nickname tối đa 40 ký tự".
- **User types nickname, then unchecks anonymous**: Nickname field hides AND value resets to `""`. Re-checking starts with empty field — stale nickname never submitted.
- **Anonymous with nickname identical to a real Sunner's display_name**: Allowed for MVP (no impersonation check). Flagged for a follow-up spec if abuse observed.
- **Cancel with uploaded images**: Best-effort `DELETE FROM storage.objects WHERE name IN (...)` via Supabase client (see US5 AC6). Orphans acceptable for MVP.
- **Modal opens on mobile (< 640 px)**: Modal becomes full-screen (100 dvh), no 24 px border-radius; scrollable content region. Footer buttons stack vertically.
- **User hits browser back-button with modal open**: Behave like clicking Hủy (unsaved-changes prompt if dirty).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| # | Component | Node ID | Description | Interactions |
|---|---|---|---|---|
| A | Modal title "Gửi lời cám ơn và ghi nhận đến đồng đội" | `I520:11647;520:9870` | Montserrat 32/700/40, black `#00101A`, centred | Read-only |
| B | Người nhận field | `I520:11647;520:9871` | Label "Người nhận*" + search input (514 × 56) with placeholder "Tìm kiếm" and dropdown chevron. **Required**. Uses existing `searchSunner` Server Action for suggestions. | Type → suggestions; select → fills field; Esc → close suggestions. Red border when empty on submit. |
| ⚠ | Danh hiệu field (**new** — not in `list_design_items` annotation but visible in Figma + styles tree node `I520:11647;1688:10448`) | `1688:10448` (Frame 552) | Label "Danh hiệu*" (Montserrat 22/700/28) + text input (514 × 56, placeholder "Dành tặng một danh hiệu cho đồng đội") + helper text "Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề của Kudos của bạn." | Required plain-text input. Stored in `kudos.title` column (migration 0007). |
| C | Editor toolbar | `I520:11647;520:9877` | 6 format buttons: **C.1** Bold (`520:9881`), **C.2** Italic (`662:11119`), **C.3** Strike (`662:11213`), **C.4** Bullet list (`662:10376`), **C.5** Link (`662:10507`), **C.6** Blockquote (`662:10647`). Plus a right-aligned red link "Tiêu chuẩn cộng đồng" (`3053:11619`) → `/the-le`. | Each button = toggle; visual pressed-state when active. Link button opens `OyDLDuSGEa` Addlink Box dialog. |
| D | Body textarea (TipTap editor) | `I520:11647;520:9886` | 672 × 200, border 1 px `#998C5F`, placeholder "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!" | Rich-text edit with `@mention` typeahead. **Required**. |
| D.1 | Helper text | `I520:11647;520:9887` | "Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác" (Montserrat 16/700/24) | Read-only |
| E | Hashtag field | `I520:11647;520:9890` | Label "Hashtag*" + "+ Hashtag" chip-button with sub-note "Tối đa 5" + chip row. **Required (1..5)**. | Click button → opens `p9zO-c4a4x` picker; chip × → remove. |
| F | Image uploader | `I520:11647;520:9896` | Label "Image" + up-to-5 thumbnails (80 × 80, each with red × button) + "+ Image" button with sub-note "Tối đa 5". **Optional**. | Click button → file picker (accept jpeg/png/webp); × → remove. |
| G | Anonymous toggle | `I520:11647;520:14099` | Checkbox (24 × 24 border olive `--color-border-secondary`; checked-state fill olive + cream checkmark) + label "Gửi lời cám ơn và ghi nhận ẩn danh" (Montserrat 22/700/28 **brand-900** per round-3 screenshot). **Optional**. | Click → toggle `is_anonymous`. When checked, G.1 nickname input appears. |
| G.1 | Nickname ẩn danh input | (derived from G, round-3 screenshot 2026-04-21) | Text input **h-14** (56 px — same as RecipientField), white bg, label-hug (`w-auto`) to the left with the text **"Nickname ẩn danh*"** (Montserrat 22/700/28 brand-900, red asterisk suffix, no leading space). Appears **below** G only when the checkbox is ticked. Placeholder: "Nhập nickname". Validation: 2–40 trimmed Unicode chars, required when G=true. Red border + inline error when invalid. | Visible only when `is_anonymous=true`. Clearing the checkbox discards the alias value. |
| H | Footer buttons | `I520:11647;520:9905` | H.1 Hủy (outline + icon close) + H.2 Gửi (primary cream + icon send). Gap 24 px. | Hủy → unsaved-changes prompt → close; Gửi → validate → submit. |

### Navigation Flow

- **From**:
  - FAB "Viết KUDOS" tile (via `QuickActionsFab` on Homepage + Live board)
  - Thể lệ page "Viết KUDOS" CTA (via `/the-le`)
  - Direct URL `/kudos/new` (or a modal-route pattern `/kudos?compose=1` — plan decision)
- **To**:
  - On successful submit → close modal + `revalidatePath("/kudos")` → stay on current page with the new kudo visible
  - On Hủy → close modal → stay on current page
  - Toolbar "Tiêu chuẩn cộng đồng" → external link to `/the-le` (opens in new tab per design — to be confirmed; or soft-navigation in same tab for consistency)
- **Triggers**: Click, keyboard (Tab + Enter / Space), form submit via Gửi only (not Enter in any input)

### Visual Requirements

- **Responsive breakpoints**:
  - Desktop (≥ 1024 px): Modal centred, 752 × 1012 (or hug content), backdrop 50 % dim
  - Tablet (640–1023 px): Modal centred, 90 % viewport width, padding reduced to 24 px
  - Mobile (< 640 px): Full-screen sheet (100 vw × 100 dvh), no border-radius, footer buttons stack vertically
- **Animations**: Modal fade-in + scale-95 → 100 over 150 ms (`motion-safe:` modifier for reduced-motion compliance). Backdrop fades in over 100 ms.
- **Accessibility**:
  - WCAG 2.2 AA across all breakpoints
  - Focus trapped inside modal while open (use focus-trap pattern or first/last focusable sentinel)
  - Esc closes modal (with unsaved-changes prompt if dirty)
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby` points to the title heading
  - Each required field carries `aria-required="true"`; on validation error, `aria-invalid="true"` + `aria-describedby` points to the inline error message
  - Toolbar buttons have `aria-pressed` for toggle state + `aria-label` for icon-only buttons
  - Red border alone is insufficient for colour-blind users → always pair with inline text message

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The modal MUST open in response to (a) FAB "Viết KUDOS" tile click, (b) Thể lệ "Viết KUDOS" CTA click, (c) direct URL navigation to `/kudos/new`. The `/kudos/new` route SHOULD use Next.js App Router's **intercepting routes** pattern so that direct-URL loads render the modal overlaid on the Live board (when possible) and deep-linked cold loads work as a standalone page. If intercepting routes prove too fragile, fall back to a simple `/kudos/new` standalone page (modal-on-empty-state).
- **FR-002**: The modal MUST enforce that all 4 required fields are non-empty before submit: Người nhận (**exactly 1 recipient** — Q1), Danh hiệu (≥1 char after trim), Body (TipTap content non-empty after stripping HTML tags), Hashtag (1..5 tags). The Gửi button MUST be disabled when any required field is empty.
- **FR-003**: On Gửi click with all required fields valid, the modal MUST call the new `createKudo` Server Action with `{ recipientId: string, title: string, body: string (HTML), hashtagSlugs: string[], imagePaths: string[], isAnonymous: boolean, anonymousAlias: string | null }`. `anonymousAlias` MUST be non-null (2–40 chars, trimmed) iff `isAnonymous=true`; the Server Action also enforces this pairing and the DB has a matching CHECK constraint (migration 0017). The action atomically inserts into `kudos` + **one row** into `kudo_recipients` + 1..5 rows into `kudo_hashtags` + 0..5 rows into `kudo_images`.
- **FR-004**: On successful submit, the modal MUST close, `revalidatePath("/kudos")` MUST be invoked (owned by the Server Action), and the user MUST see a success toast "Đã gửi kudo" (3 s auto-dismiss) via the existing `Toaster` primitive.
- **FR-005**: On submit failure (server error, network), the modal MUST stay open, display an error toast "Không gửi được. Thử lại sau.", and re-enable the Gửi button for retry. Form state MUST NOT be cleared.
- **FR-006**: On Gửi click with any required field invalid, validation MUST fire client-side BEFORE the Server Action call. Each invalid field MUST gain a red border (`border-[var(--color-error)]`) + a small red inline message below; focus MUST move to the FIRST invalid field in visual order (Recipient → Title → Body → Hashtag).
- **FR-007**: The body editor MUST be a TipTap instance with extensions: StarterKit (Bold, Italic, Strike, BulletList, Blockquote), Link, Mention + Suggestion. Toolbar buttons MUST mirror editor state via `aria-pressed`.
- **FR-008**: The `@` key inside the body editor MUST open a suggestion popover listing up to 10 Sunners via `searchSunner(query)`. Arrow keys navigate; Enter selects; Esc closes.
- **FR-009**: Clicking "+ Hashtag" MUST open the `p9zO-c4a4x` overlay (spec'd separately). Selected hashtags render as chips next to the button. The button MUST disappear when 5 tags are selected and re-appear below 5.
- **FR-010**: Clicking "+ Image" MUST open the native file picker with `accept="image/jpeg,image/png,image/webp"`. Selected files MUST be validated client-side: each file ≤ 5 MB, MIME in the whitelist. Valid files MUST be uploaded to `kudo-images/{userId}/{uuid}.{ext}` via `supabase.storage.from('kudo-images').upload(...)`. Up to 5 images total.
- **FR-011**: The anonymous checkbox MUST set `kudos.is_anonymous = true` on submit. When ticked, the alias text field (component G.1) MUST become visible and required (2–40 Unicode chars after trim). `createKudo` MUST set `kudos.anonymous_alias = <trimmed input>` on submit. Unchecking the checkbox MUST hide G.1 AND reset its value to `""` (so re-checking starts empty, and a stale alias is never submitted). On the Live board, kudos with `is_anonymous = true` MUST render the alias in place of the sender's real name + an initials monogram derived from the alias in place of the avatar (Live-board card owns rendering — out of scope here).
- **FR-012**: Clicking Hủy OR clicking the backdrop MUST (a) if the form has any dirty content, show a `confirm()` or custom confirm dialog "Bỏ bản nháp? Nội dung chưa gửi sẽ mất." — only close on user confirm; (b) if the form is empty, close without prompt.
- **FR-013**: Clicking the Link icon (C.5) MUST open the `OyDLDuSGEa` Addlink Box dialog (spec'd separately) to collect anchor text + URL; on save, inject an `<a href="url">text</a>` node at the TipTap cursor.
- **FR-014**: The "Tiêu chuẩn cộng đồng" link in the toolbar row MUST open the community-standards page **in a new tab** (`target="_blank" rel="noopener noreferrer"`). The target page URL is TBD (not `/the-le`); a future spec will define it. For MVP, a placeholder `href="#"` with a `console.warn("Tiêu chuẩn cộng đồng page pending")` click handler is acceptable, OR link to the existing `/the-le` as a stopgap with a code comment flagging it as placeholder. Plan phase picks the stopgap.
- **FR-015**: The modal MUST trap keyboard focus while open. Implementation uses hand-rolled first/last focusable sentinels (NOT a third-party `focus-trap` library — constitution §III "React hooks only, no new deps where avoidable"). Tab from the last interactive control cycles to the first; Shift+Tab from the first cycles to the last. Esc closes with the dirty-state prompt from FR-012.

### Technical Requirements

- **TR-001 (Editor)**: TipTap v2.x — packages `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-mention`, `@tiptap/suggestion`. Rendered client-side only (`"use client"` boundary). StarterKit includes Bold/Italic/Strike/BulletList/Blockquote/Code/etc. — configure to disable unused nodes (Code) to keep toolbar aligned to Figma.
- **TR-002 (Storage bucket)**: A new Supabase Storage bucket `kudo-images` MUST be created with:
  - `public = false`
  - File size limit 5 MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
  - RLS SELECT: `auth.role() = 'authenticated'`
  - RLS INSERT: `auth.role() = 'authenticated'` AND the object `owner = auth.uid()`
  - RLS UPDATE/DELETE: owner-only (`owner = auth.uid()`)
  - Migration file: `supabase/migrations/0014_kudo_images_storage.sql` (or next sequential number)
- **TR-003 (Server Action)**: A new `createKudo` Server Action in `src/app/kudos/actions.ts`:
  ```ts
  export async function createKudo(input: CreateKudoInput): Promise<{ ok: true; kudoId: string } | { ok: false; error: string }>
  ```
  Validates authentication, recipient existence, hashtag existence, body non-empty, hashtag count 1..5, image URLs belong to the caller. INSERT is transactional via a single RPC or manual multi-insert with rollback on any failure.
- **TR-004 (Image upload flow)**: Uploads happen **eagerly during compose** (as soon as the user picks a file), NOT deferred until submit. This keeps submit fast and lets the user see thumbnails immediately. On Hủy or unmount, best-effort delete uploaded-but-unsubmitted files. Trade-off: orphan files possible on network interruption; acceptable for MVP.
- **TR-005 (Rich-text serialisation)**: Body content MUST be serialised as HTML (TipTap's `editor.getHTML()`) and stored in `kudos.body` (TEXT column). Mention chips MUST carry `data-mention-id="{profileId}"` attribute so the renderer on Live board can resolve them back to profile links.
- **TR-006 (Focus management)**: On modal open, focus moves to the first focusable element (Recipient input). On close, focus returns to the element that triggered open (tracked via React ref on the parent page).
- **TR-007 (Reduced-motion)**: Modal entry animation wrapped with `motion-safe:` Tailwind modifier. Under `prefers-reduced-motion: reduce`, modal shows/hides instantly.
- **TR-008 (Dirty-state tracking)**: Form is "dirty" if any of: body editor has content (checked via `editor.isEmpty === false`), recipient selected, title non-empty after trim, hashtag count > 0, or image count > 0. Implemented as a `useMemo` over form state, not a separate piece of state.

### Key Entities

- **Kudo** (`kudos` table — already exists with migration 0001 + 0007 title/images column additions). New write: `sender_id`, `title`, `body`, `is_anonymous` **⚠ column does not yet exist — see Schema Gaps below**, `created_at`.
- **KudoRecipient** (`kudo_recipients` junction) — exactly 1 row per new kudo in this spec (resolved Q1: single-recipient). Schema still supports N structurally for future multi-recipient expansion.
- **KudoHashtag** (`kudo_hashtags` junction) — one row per hashtag per kudo, 1..5 rows.
- **KudoImage** (`kudo_images` junction — created by migration 0007) — one row per image per kudo, 0..5 rows. **Stores the bucket path** (not a signed URL) in `kudo_images.url`; reading code generates a signed URL per render via `createSignedUrl(path, 3600)`. Rationale: signed URLs have TTL; path stays stable forever.
- **Profile** (`profiles`) — read-only here for recipient search + @mention suggestions.
- **Hashtag** (`hashtags`) — read-only for the picker overlay.
- **storage.objects** (Supabase Storage internal table) — write path via the `kudo-images` bucket.

### Schema Gaps (pending migrations)

Three migrations are required to cover this spec and are NEW work:

| Migration | Purpose | Detail |
|---|---|---|
| `0014_kudo_images_storage.sql` | Storage bucket + RLS | As described in TR-002 |
| `0015_kudo_anonymous.sql` ⚠ | Add `is_anonymous` column | `alter table kudos add column if not exists is_anonymous boolean not null default false;` + update `kudos_with_stats` view to include it |
| `0017_kudo_anonymous_alias.sql` ⚠ | Add `anonymous_alias` column | `alter table kudos add column if not exists anonymous_alias text null;` + `CHECK ((is_anonymous = false AND anonymous_alias IS NULL) OR (is_anonymous = true AND char_length(btrim(anonymous_alias)) BETWEEN 2 AND 40));` + update `kudos_with_stats` view to include it + update `create_kudo` function (migration 0016) to accept `p_anonymous_alias text default null` and insert it. **Note**: 0016 already shipped — migration 0017 supersedes it via `CREATE OR REPLACE FUNCTION` |

All three migrations are confirmed in scope per Q2 + Q4 + 2026-04-21 round 3 resolutions. Plan phase writes them; tasks execute them.

### Data Requirements (consolidated)

| Field | Type | Required? | Validation | DB column |
|---|---|---|---|---|
| Recipient | `uuid` (single `profiles.id` — resolved Q1) | Yes | Exactly 1 valid profile; must exist in `profiles` (enforced via FK in `kudo_recipients`) | `kudo_recipients` junction (1 row per kudo) |
| Title (Danh hiệu) | `string` | Yes | Non-empty after trim; no hard char limit (plan decides — recommend ≤ 120 chars to match UI typography) | `kudos.title` |
| Body | `string` (HTML from TipTap) | Yes | Non-empty content after stripping HTML tags; no hard char limit (recommend ≤ 5000 chars) | `kudos.body` |
| Hashtags | `string[]` (array of `hashtags.slug`) | Yes | 1..5 entries; each slug must exist in `hashtags`; no duplicates | `kudo_hashtags` junction |
| Images | `string[]` (array of Storage paths) | No | 0..5 entries; each path under `kudo-images/{userId}/…` (RLS enforces ownership); file validated client-side: ≤ 5 MB + MIME in `{jpeg,png,webp}` | `kudo_images` junction |
| Anonymous flag | `boolean` | No | Defaults to `false` | `kudos.is_anonymous` (new — migration 0015) |
| Anonymous alias | `string` | Yes **iff** anonymous=true | 2–40 Unicode chars after trim; null when `is_anonymous=false`. DB CHECK constraint enforces the pairing | `kudos.anonymous_alias` (new — migration 0017) |

### State Management

| Layer | State | Owner | Lifetime |
|-------|-------|-------|----------|
| **Local (form)** | `recipient: KudoUser \| null`, `title: string`, `body: TipTap editor`, `hashtagSlugs: string[]`, `images: { path: string; signedUrl: string }[]`, `isAnonymous: boolean`, `anonymousAlias: string` (reset to `""` when `isAnonymous` flips false) | Modal component (`useState` / `useReducer`) | Until modal closes |
| **Local (validation)** | `errors: Partial<Record<FieldKey, string>>` — map of field → error message; cleared per-field on edit | Modal component | Until modal closes |
| **Local (submit)** | `useTransition` isPending; `useState<Error | null>` submitError | Modal component | Until submit resolves |
| **Local (dirty)** | Derived via `useMemo` from form state — no separate state | Modal component | Until modal closes |
| **Editor** | TipTap editor instance + its internal state (doc tree, selection) | `@tiptap/react` `useEditor` hook | Lifetime of the `<EditorContent />` element |
| **Suggestion popover** | `@mention` query string + floating-ui position | TipTap Suggestion extension | While `@` prefix active |
| **Server (authoritative)** | Kudos rows + storage objects after commit | Supabase via `createKudo` | Permanent |

**No global state store, no client cache**: Same constraint as the rest of the app (constitution §III). Server Components supply the initial hashtag list via the existing `getKudoHashtags` action pre-fetched in the parent page and passed as a prop.

---

## API Dependencies

| Endpoint / Action | Method | Purpose | Status |
|---|---|---|---|
| `createKudo` | Server Action (new) | Atomic INSERT into 4 tables + revalidate `/kudos` | **NEW** — must be implemented |
| `searchSunner` | Server Action (exists) | Typeahead for Recipient field + `@mention` popover | **EXISTS** — `src/app/kudos/actions.ts:581` |
| `getKudoHashtags` | Server Action (exists) | Populate the `p9zO-c4a4x` overlay's option list | **EXISTS** — locale-aware |
| `supabase.storage.from('kudo-images').upload(path, file)` | Supabase JS SDK (new bucket) | Client-side image upload | **NEW bucket** — migration 0014 required |
| `supabase.storage.from('kudo-images').createSignedUrl(path, 3600)` | Supabase JS SDK | Generate 1 h signed URL for thumbnail rendering + feed display | Same bucket; used both at compose time and on Live-board render |
| `supabase.storage.from('kudo-images').remove([path])` | Supabase JS SDK | Best-effort cleanup on Hủy / thumbnail × | Bucket RLS allows owner-only DELETE |

No new HTTP routes — everything rides on Server Actions + the Supabase JS SDK.

---

## Success Criteria *(mandatory)*

- **SC-001**: 100 % of required fields surface client-side validation before a network request fires (zero server round-trips for invalid forms).
- **SC-002**: After a successful submit, the new kudo appears in the Live board `/kudos` within ≤ 1 s of modal close (measured via `revalidatePath` latency + the feed's SSR re-render).
- **SC-003**: Image uploads respect the 5 MB / MIME whitelist client-side — zero cases where Storage 4xx-rejects a file that the client accepted.
- **SC-004**: Axe-core sweep on the open modal returns zero violations.
- **SC-005**: Anonymous kudos hide sender identity on the Live board and render the alias instead — verified by an integration test rendering a kudo with `is_anonymous=true, anonymous_alias='NinjaSunner'`: asserts the card shows "NinjaSunner" + alias-derived monogram, NOT the sender's real name / avatar.
- **SC-006**: Dirty-state prompt fires on Hủy + backdrop + Esc when form is non-empty — verified by 3 unit tests.

---

## Out of Scope

- **Draft auto-save** — if the user refreshes mid-compose, drafts are lost. A `localStorage` draft recovery feature is Phase-2.
- **Rich-text table / horizontal-rule / code-block** — TipTap StarterKit includes these but we disable them; toolbar only exposes Bold/Italic/Strike/BulletList/Link/Blockquote per Figma.
- **Image cropping / rotation** — MVP accepts files as-is.
- **Mention notifications** — mentioned users do NOT receive a separate notification on submit (that's a Phase-2 feature via Notifications screen, parked).
- **Scheduled send / draft** — kudos post immediately.
- **Multi-language body content** — body is plain TipTap HTML regardless of locale.
- **Recipient = self validation** — allowed for MVP (see Edge Cases). Disallowing self-recipient is a Phase-2 product decision.
- **Storage garbage collection for orphan images** — documented limitation in US5 AC6. A scheduled cleanup job is Phase-2 infra.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] `searchSunner` Server Action ships in production
- [x] `getKudoHashtags` Server Action ships in production
- [x] `kudos`, `kudo_recipients`, `kudo_hashtags`, `kudo_images` tables exist (migrations 0001 + 0007)
- [x] `Toaster` primitive ships (`src/components/ui/Toaster.tsx`)
- [x] `FilterDropdown` dark-navy primitive ships (sibling visual language)
- [ ] **NEW**: `createKudo` Server Action — to be written during plan phase (`src/app/kudos/actions.ts`)
- [ ] **NEW**: Supabase Storage bucket `kudo-images` + RLS policies — migration `0014_kudo_images_storage.sql`
- [ ] **NEW**: `kudos.is_anonymous` column — migration `0015_kudo_anonymous.sql` (resolved Q2 — migration confirmed)
- [ ] **NEW**: `kudos.anonymous_alias` column + CHECK constraint — migration `0017_kudo_anonymous_alias.sql` (resolved round 3 2026-04-21). `create_kudo` function updated via `CREATE OR REPLACE` to accept `p_anonymous_alias text`
- [ ] **NEW**: TipTap packages added to `package.json` — `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-mention`, `@tiptap/suggestion`
- [ ] **NEW**: 6 icons in `src/components/ui/Icon.tsx` — bold, italic, strikethrough, list-bullet, link, quote, send (7 total if `plus` not already present)
- [ ] **NEW**: `p9zO-c4a4x` Dropdown list hashtag overlay — sibling spec pending
- [ ] **NEW**: `OyDLDuSGEa` Addlink Box overlay — sibling spec pending
- [x] SCREENFLOW tracker (`.momorph/contexts/screen_specs/SCREENFLOW.md`) — row #7 flipped from 🟡 next up to 📋 spec'd on 2026-04-21 (done during spec authoring)

---

## Notes

**Annotation gap in Figma**: `list_design_items` does NOT include the "Danh hiệu" (Title) field even though it's visible in the rendered frame + present in the styles tree as `Frame 552` / node `1688:10448`. This is a MoMorph annotation gap, not a missing field. Spec treats Danh hiệu as a required text input (migration 0007 already added the `kudos.title` column for this very purpose). Flag for Design to formally annotate the field in MoMorph so future spec runs don't miss it.

**Error variant folded**: `5c7PkAibyD` "Viết KUDO - Lỗi chưa điền đủ thông tin đã ấn gửi" exists as a Figma frame but has no `list_design_items` entries and no captured image. US2 + FR-006 infer the validation UI state from standard red-border patterns. If Design produces a concrete error-variant frame with specific red shade or layout nuances later, update the design-style.md Error State section in place.

**Open questions resolved (2026-04-21)** — all answers locked into the spec body above:

| # | Question | Resolution |
|---|---|---|
| Q1 | Recipient cardinality | **Single recipient.** `createKudo` takes `recipientId: string`; exactly 1 row written to `kudo_recipients` per new kudo. Multi-recipient is Phase 2 (no schema change needed, purely a UI + action-signature change). |
| Q2 | Anonymous flag | **Add migration `0015_kudo_anonymous.sql`**: `alter table kudos add column if not exists is_anonymous boolean not null default false;` + recreate `kudos_with_stats` view. US6 stays in scope. |
| Q3 | Standards-link target | **New tab** via `target="_blank" rel="noopener noreferrer"`. The target page URL is TBD (not `/the-le`); for MVP use `href="#"` with a placeholder console warning OR link to `/the-le` as a stopgap with a code comment flagging it. Plan picks the stopgap approach. |
| Q4 | Image URL storage | **Path-only** (e.g. `{userId}/{uuid}.jpg`) stored in `kudo_images.url`; signed URL generated on each render via `createSignedUrl(path, 3600)`. Since the column is `text`, switching to full-URL or a separate path column later is a non-breaking migration — flexible for future download/long-TTL needs. |

No open questions remain. Spec is self-contained and ready for `/momorph.plan`.

**Sender's view of their own anonymous kudo**: Even with `is_anonymous=true`, the sender can still identify their own kudo in a "Sent" list because the query filters by `sender_id = auth.uid()`. The anonymity is purely a rendering concern (hide sender identity on public feeds); the DB relationship remains intact so the sender can manage their own kudos.

**TipTap + Next.js SSR**: The editor is SSR-unfriendly (it touches `document` on mount). Wrap `<EditorContent />` in a dynamic import with `ssr: false`, OR render the modal as a client component from the start. Prefer the latter for simplicity since the modal is interactive throughout.

**Sibling specs**: This screen is the parent of two child dialogs (`p9zO-c4a4x` hashtag picker + `OyDLDuSGEa` Addlink Box). Those specs own their own visual treatments, keyboard handling, and aria roles. This spec treats them as black boxes triggered by FR-009 + FR-013 and cares only about the return contract (selected hashtag slug / `{text, url}` pair).

**Dark-navy sibling dropdowns**: The `@mention` suggestion popover + the hashtag picker + the Recipient-search dropdown should all visually match the **dark-navy panel family** already in production (`--color-panel-surface`, `--color-border-secondary`, `--color-accent-cream` tokens). This is per constitution's visual consistency rule, not a per-component decision.
