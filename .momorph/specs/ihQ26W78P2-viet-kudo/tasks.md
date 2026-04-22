# Tasks: Viết Kudo + Hashtag picker + Addlink Box (bundled)

**Parent frame**: `ihQ26W78P2-viet-kudo`
**Child frames**: `p9zO-c4a4x-dropdown-list-hashtag` · `OyDLDuSGEa-addlink-box`
**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [design-style.md](design-style.md) + 2 sibling spec/design-style pairs
**Scope**: 4 PRs · 70 tasks · 10 net-new components · 3 migrations · 6 new deps · 3 new tokens · 7 new icons · 1 new Server Action · 1 new storage bucket · 1 smoke E2E

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Task can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User-story label (US1..US7). `US7` = Addlink Box sub-feature (extends the parent US list since all 3 specs ship as one bundled feature)
- **|**: File path affected by the task

---

## Phase 1: Setup (Shared Infrastructure) — PR 1

**Purpose**: Land infrastructure that every downstream phase depends on. CI stays green; nothing ships in UI yet.

- [x] T001 Add 6 TipTap packages to `package.json` + run `yarn install` + commit `yarn.lock` — packages: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-mention`, `@tiptap/suggestion`, `@tiptap/extension-character-count` | package.json
- [x] T002 [P] Add 3 new CSS tokens to `@theme inline` block in globals.css — `--color-modal-paper: #fff8e1`, `--color-error: #cf1322`, `--color-close-red: #d4271d` | src/app/globals.css
- [x] T003 [P] Add 7 new icons to the `IconName` union + switch cases: `bold`, `italic`, `strikethrough`, `list-bullet`, `link`, `quote`, `send`. Inline SVG per constitution rule. If `plus` icon isn't present yet, add it as an 8th (used by + Hashtag / + Image buttons) | src/components/ui/Icon.tsx
- [x] T004 [P] Write migration `0014_kudo_images_storage.sql` — create `kudo-images` bucket (private, 5 MB, jpeg/png/webp) + 3 RLS policies (authenticated read, owner-only insert/delete) — SQL shape in plan.md §Database Changes | supabase/migrations/0014_kudo_images_storage.sql
- [x] T005 [P] Write migration `0015_kudo_anonymous.sql` — `alter table kudos add column is_anonymous boolean not null default false` + recreate `kudos_with_stats` view — SQL shape in plan.md | supabase/migrations/0015_kudo_anonymous.sql
- [x] T006 [P] Write migration `0016_create_kudo_fn.sql` — `create function create_kudo(...) returns uuid language plpgsql security definer`, hard-coded `sender_id = auth.uid()` inside the function body (NOT a parameter) per plan.md Risk Assessment row | supabase/migrations/0016_create_kudo_fn.sql
- [x] T007 Apply all 3 migrations via `supabase db push` (local + remote). Verify `\dT+` shows the bucket + `\df create_kudo` shows the function | N/A (database)
- [x] T008 [P] Add TypeScript types to `src/types/kudo.ts`: `HashtagOption` (`{ slug: string; label: string }`), `CreateKudoInput`, `CreateKudoResult` — shapes per plan.md §Backend Approach | src/types/kudo.ts
- [x] T009 [P] Add ~30 new i18n leaves to `vi.json` + `en.json` — validation error messages, field placeholders, button labels ("Gửi" / "Hủy" / "Lưu"), toast copy ("Đã gửi kudo" / "Không gửi được"), empty-state copy ("Chưa có hashtag"), hashtag picker error state | src/messages/vi.json, src/messages/en.json

**Checkpoint**: `yarn typecheck && yarn lint && yarn test:run` green. Supabase migrations applied cleanly. Ready for any downstream phase.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Route scaffolding + Server Action stub that US1 depends on.

**⚠️ CRITICAL**: No user-story work can begin until Phase 1 + Phase 2 complete.

- [x] T010 Scaffold the `/kudos/new` route: (a) `src/app/kudos/new/page.tsx` standalone page, (b) `src/app/kudos/@modal/new/page.tsx` intercepting-route modal, (c) `src/app/kudos/@modal/default.tsx` default fallback for the parallel slot, (d) `src/app/kudos/layout.tsx` renders `@modal` children if not already present. Timebox: 1 day — escape to standalone-only if intercepting routes prove fragile per plan.md risk row | src/app/kudos/new/, src/app/kudos/@modal/, src/app/kudos/layout.tsx
- [x] T011 Stub `createKudo` Server Action in existing actions file — returns `{ ok: false, error: "not implemented" }`. Real implementation lands in Phase 3 (T020). Import shape from `src/types/kudo.ts` CreateKudoInput/CreateKudoResult | src/app/kudos/actions.ts

**Checkpoint**: `/kudos/new` loads a placeholder page. `createKudo` importable but returns stub. Foundation ready — user-story phases can start in parallel.

---

## Phase 3: User Story 1 — Compose + send a kudo (Priority: P1) 🎯 MVP

**Goal**: Sunner opens the compose modal, fills all 4 required fields (Recipient, Title, Body, ≥1 Hashtag), clicks Gửi, and sees the new kudo on `/kudos` within 1 second.

**Independent Test**: Navigate to `/kudos/new` → fill required fields → Gửi → modal closes → new kudo visible on `/kudos` with correct sender + body + hashtag. Hard-refresh keeps the kudo (it's in the DB).

### Tests (US1) — write first, TDD

- [x] T012 [P] [US1] Create `KudoComposer.spec.tsx` integration test file with 3 scenarios covering US1: (1) render + hydrate with empty form, (2) fill valid fields + click Gửi → `createKudo` called once with correct payload, (3) submit error (createKudo returns `ok: false`) → modal stays open + error toast. Mocking per plan.md §Testing Strategy (vi.mock createKudo, searchSunner, track, supabase client) | src/components/kudos/__tests__/KudoComposer.spec.tsx
- [x] T013 [P] [US1] Create `createKudo.spec.ts` Server Action test — 4 scenarios: (1) happy path writes to all 4 tables via `rpc('create_kudo', …)`, (2) missing auth → error, (3) unknown hashtag slug → error, (4) image path outside caller's folder → error. Mocked Supabase RPC via `vi.mocked(createClient)` | tests/integration/createKudo.spec.ts

### Implementation (US1)

- [x] T014 [US1] Write `KudoComposer.tsx` parent orchestrator — form state via `useReducer` (recipient, title, body-editor-ref, hashtagSlugs, images, isAnonymous), `useMemo` derives `isValid` + `isDirty`, scaffolds modal paper with all section slots, registers trigger ref for focus-on-close | src/components/kudos/KudoComposer.tsx
- [x] T015 [P] [US1] Write `RecipientField.tsx` — single-select typeahead using existing `searchSunner` action; input + dark-navy suggestion popover (reuse LanguageDropdown panel classes); writes to form state via prop callback; shows chevron right-icon | src/components/kudos/RecipientField.tsx
- [x] T016 [P] [US1] Write `TitleField.tsx` — plain text input 1..120 chars; label "Danh hiệu" + asterisk; helper text "Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề của Kudos của bạn." | src/components/kudos/TitleField.tsx
- [x] T017 [US1] Write `BodyEditor.tsx` — `useEditor()` hook with StarterKit (disable Code, CodeBlock, HorizontalRule, OrderedList), Link (`openOnClick: false, autolink: false`), Placeholder, CharacterCount (`limit: 5000`). Mention extension added in Phase 5 | src/components/kudos/BodyEditor.tsx
- [x] T018 [US1] Write `EditorToolbar.tsx` — 6 format buttons (Bold/Italic/Strike/BulletList/Link/Blockquote) wired via `editor.chain().focus().toggleBold().run()` pattern; each button renders `aria-pressed` based on `editor.isActive('bold')`; right-end "Tiêu chuẩn cộng đồng" link (stopgap href `/the-le` with TODO comment; `target="_blank"`) | src/components/kudos/EditorToolbar.tsx
- [x] T019 [P] [US1] Write `HashtagField.tsx` trigger stub — renders "+ Hashtag" button + selected chip row. Click handler console.warns ("picker lands in Phase 6") for now; real picker wiring lands in T042 | src/components/kudos/HashtagField.tsx
- [x] T020 [US1] Implement `createKudo` Server Action — reads inputs, validates auth via `getUser()`, calls `supabase.rpc('create_kudo', { p_title, p_body, p_is_anonymous, p_recipient_id, p_hashtag_slugs, p_image_paths })`, returns `{ ok: true, kudoId }` on success. On error, returns `{ ok: false, error }`. Calls `revalidatePath('/kudos')` on success per FR-004 | src/app/kudos/actions.ts
- [x] T021 [US1] Wire Gửi button submit handler in `KudoComposer.tsx` — `useTransition` wrap; on success: close modal + `Toaster` success toast "Đã gửi kudo"; on error: keep modal open + error toast. Per FR-004/FR-005 | src/components/kudos/KudoComposer.tsx
- [x] T022 [US1] Wire Hủy + Esc + backdrop close in `KudoComposer.tsx` — native `window.confirm()` when `isDirty === true` (FR-012 MVP); no prompt when form is empty | src/components/kudos/KudoComposer.tsx
- [x] T023 [US1] Add focus trap to `KudoComposer.tsx` — first/last sentinel pattern (FR-015); focus-on-open lands on first focusable field; focus-on-close returns to trigger ref | src/components/kudos/KudoComposer.tsx
- [x] T024 [P] [US1] Wire "Viết KUDOS" tile in `QuickActionsFab` to navigate `/kudos/new` (verify existing; edit if already points elsewhere) | src/components/shell/QuickActionsFab.tsx
- [x] T025 [P] [US1] Wire "Viết KUDOS" CTA in Thể lệ page to navigate `/kudos/new` | src/app/the-le/page.tsx

### Tests green (US1)

- [x] T026 [US1] Run T012's 3 scenarios — all green after T014-T023 land | src/components/kudos/__tests__/KudoComposer.spec.tsx
- [x] T027 [P] [US1] Write `RecipientField.spec.tsx` unit tests — 4 scenarios: type opens suggestions, click selects, Esc closes popover, empty-form error state | src/components/kudos/__tests__/RecipientField.spec.tsx
- [x] T028 [P] [US1] Write `BodyEditor.spec.tsx` unit tests — mock `useEditor` at low detail; verify toolbar props wire correctly, CharacterCount limit set | src/components/kudos/__tests__/BodyEditor.spec.tsx

**Checkpoint US1**: MVP ships — user can compose + send a kudo with required fields only (stub hashtag button + no images + no anonymous). New kudo appears on `/kudos`. All US1 tests green.

---

## Phase 4: User Story 2 — Validation error state (Priority: P1)

**Goal**: Clicking Gửi with any required field empty surfaces red borders + inline errors + focus moves to first invalid field. Server is not called.

**Independent Test**: Leave Recipient empty → click Gửi → no network request fires → red border on Recipient + inline "Vui lòng chọn người nhận" + focus on Recipient input.

- [x] T029 [US2] Add validation logic to `KudoComposer.tsx` — computes `errors: Partial<Record<FieldKey, string>>` from form state, renders per-field red border + inline error message `<p role="alert">` below each invalid input. Focus moves to first invalid field in visual order on failed submit attempt (Recipient → Title → Body → Hashtag) | src/components/kudos/KudoComposer.tsx
- [x] T030 [P] [US2] Add `aria-invalid` + `aria-describedby` props to RecipientField, TitleField, BodyEditor, HashtagField — wire from parent errors map | src/components/kudos/RecipientField.tsx, TitleField.tsx, BodyEditor.tsx, HashtagField.tsx
- [x] T031 [US2] Append 3 US2 scenarios to `KudoComposer.spec.tsx` — (1) submit with empty Recipient → no createKudo call + red border + focus on Recipient, (2) submit with all empty → first invalid gets focus (Recipient), (3) fix field → border clears + error message disappears | src/components/kudos/__tests__/KudoComposer.spec.tsx
- [x] T032 [P] [US2] Append validation scenarios to RecipientField.spec + TitleField.spec — each asserts `aria-invalid="true"` when parent passes an error | src/components/kudos/__tests__/RecipientField.spec.tsx, TitleField.spec.tsx

**Checkpoint US2**: All 4 required-field validations gate submit. Red border + inline message + focus-first-invalid verified.

---

## Phase 5: User Story 3 — @mention teammates (Priority: P2)

**Goal**: Typing `@` + chars in body editor opens a suggestion popover listing Sunners; Enter/click inserts a mention chip.

**Independent Test**: Focus body, type `@al` → popover shows matching Sunners → Enter on first item → mention chip inserted with `data-mention-id="{profileId}"` attribute.

- [x] T033 [US3] Add `@tiptap/extension-mention` + `@tiptap/suggestion` to the `useEditor` config in `BodyEditor.tsx`; configure `Mention.configure({ suggestion: mentionSuggestion })` | src/components/kudos/BodyEditor.tsx
- [x] T034 [US3] Implement `mentionSuggestion` resolver wrapping existing `searchSunner(query)` Server Action — returns top 10 matches, empty state message "Không tìm thấy đồng nghiệp" | src/components/kudos/BodyEditor.tsx
- [x] T035 [US3] Render mention popover with dark-navy family styling — reuse `FilterDropdown` panel classes (`bg-[var(--color-panel-surface)]`, gold border, cream-20 selected). Position anchored at caret via TipTap Suggestion plugin's default renderer | src/components/kudos/BodyEditor.tsx
- [x] T036 [US3] Append 3 mention scenarios to `BodyEditor.spec.tsx` — (1) type `@` opens popover, (2) Arrow/Enter navigation + selection, (3) Esc closes without selecting | src/components/kudos/__tests__/BodyEditor.spec.tsx

**Checkpoint US3**: @mention inline typeahead works. Chip persists in `editor.getHTML()` for round-trip to Live board.

---

## Phase 6: User Story 4 — Hashtag picker overlay (Priority: P2)

**Goal**: Click "+ Hashtag" → dark-navy multi-select picker opens → select 1-5 tags → click outside → picker closes + chips visible in parent.

**Covers sibling spec `p9zO-c4a4x`** (Dropdown list hashtag) — all 4 of its user stories ship within this phase.

**Independent Test**: Click "+ Hashtag" → picker opens with 13 options → click `#dedicated` → row flips to selected (cream-20 bg + ✓) → click outside → picker closes → chip next to trigger.

- [x] T037 [P] [US4] Write `HashtagPicker.spec.tsx` unit tests with **10 scenarios** — render options from prop, toggle selected via click (fires `onToggle`), 5-cap blocks 6th click, Arrow/Enter/Space/Esc/Tab keyboard, focus-on-mount to first-selected-or-first, aria-selected mirrors state, loading skeleton when `options===undefined`, empty state when `options===[]`, error state when `loadError !== null` + Retry fires `onRetry` | src/components/kudos/__tests__/HashtagPicker.spec.tsx
- [x] T038 [US4] Write `HashtagPicker.tsx` — dark-navy panel (`<ul role="listbox" aria-multiselectable="true">`), w-[318px], 6 px padding, z-30, motion-safe fade+translateY entry. Render each option as `<li role="option" aria-selected={selected}>` with row classes (`h-11 sm:h-10` per constitution mobile touch-target) | src/components/kudos/HashtagPicker.tsx
- [x] T039 [US4] Implement roving tabindex keyboard in `HashtagPicker.tsx` — onKeyDown on `<ul>` handles ArrowUp/Down (wrap), Enter/Space (toggle), Esc (close + focus back to triggerRef), Tab (close via microtask + native focus) | src/components/kudos/HashtagPicker.tsx
- [x] T040 [US4] Implement 5-cap logic — `atCap = selectedSlugs.length === maxSelections (default 5)`. Unselected rows render `aria-disabled={atCap}` + `opacity-50` + `cursor-not-allowed`; `onClick` no-ops when atCap (FR-005) | src/components/kudos/HashtagPicker.tsx
- [x] T041 [US4] Render loading skeleton (3 shimmer rows when `options===undefined`), empty state ("Chưa có hashtag" grey centred), error state ("Không tải được hashtag." + "Thử lại" button that fires `onRetry`) | src/components/kudos/HashtagPicker.tsx
- [x] T042 [US4] Wire `HashtagField.tsx` to pass `triggerRef` + `options` (pre-fetched via `getKudoHashtags()` in parent `KudoComposer` on mount) + `selectedSlugs` + `onToggle` + `onClose` to `HashtagPicker`. Picker rendered conditionally when `isPickerOpen === true` | src/components/kudos/HashtagField.tsx
- [x] T043 [US4] Render selected hashtag chips next to "+ Hashtag" button in `HashtagField.tsx` — chip classes per design-style `p9zO-c4a4x` (cream paper bg, gold border, rounded, text-black, × button on cream-close-red). Trigger button hides when 5 selected | src/components/kudos/HashtagField.tsx
- [x] T044 [US4] Run T037's 10 scenarios — all green after T038-T042 land | src/components/kudos/__tests__/HashtagPicker.spec.tsx

**Checkpoint US4**: Hashtag picker fully functional with 5-cap enforcement, loading/empty/error states, keyboard parity. Parent modal's Hashtag field shows live chip state.

---

## Phase 7: User Story 5 — Image upload (Priority: P2)

**Goal**: Click "+ Image" → file picker → valid file uploads to `kudo-images` bucket → thumbnail appears. Up to 5 × ≤ 5 MB × (jpeg|png|webp).

**Independent Test**: Pick a 2 MB PNG → thumbnail renders with remove × → Gửi → image URL persists in `kudo_images` junction and renders on Live board card.

- [x] T045 [P] [US5] Write `ImageUploader.spec.tsx` unit tests — 6 scenarios: upload happy path + MIME whitelist enforcement + size ≤ 5 MB enforcement + thumbnail render + × removal + 5-cap hides "+ Image" button. Mock `supabase.storage.from(...).upload()` via `vi.mock("@/libs/supabase/client", ...)` | src/components/kudos/__tests__/ImageUploader.spec.tsx
- [x] T046 [US5] Write `ImageUploader.tsx` — file input with `accept="image/jpeg,image/png,image/webp"`, client-side validation (size + MIME) BEFORE calling Storage, upload via `supabase.storage.from('kudo-images').upload('{userId}/{uuid}.{ext}', file)`, returns stored path | src/components/kudos/ImageUploader.tsx
- [x] T047 [US5] Render 80 × 80 thumbnails with `createSignedUrl(path, 3600)`; × button (20 × 20 `bg-[var(--color-close-red)]` rounded-full) removes + calls `.remove([path])` best-effort. Hide "+ Image" button when 5 images present | src/components/kudos/ImageUploader.tsx
- [x] T048 [US5] Wire Hủy cleanup in `KudoComposer.tsx` — on modal close (Hủy path), best-effort `supabase.storage.from('kudo-images').remove(uploadedPaths)` for all paths not yet persisted via createKudo | src/components/kudos/KudoComposer.tsx, ImageUploader.tsx
- [x] T049 [US5] Update `isValid` derivation in `KudoComposer.tsx` to include `!isUploading` guard per plan.md T-VK-SUBMIT-001 edge case — Gửi button disabled while any upload pending | src/components/kudos/KudoComposer.tsx
- [x] T050 [US5] Plumb `imagePaths: string[]` from ImageUploader state up to createKudo call signature | src/components/kudos/KudoComposer.tsx
- [x] T051 [US5] Run T045's 6 scenarios — all green after T046-T050 land | src/components/kudos/__tests__/ImageUploader.spec.tsx

**Checkpoint US5**: Image attachment works end-to-end. Client validation catches oversized/wrong-MIME files before network. Submit waits for uploads to complete.

---

## Phase 8: User Story 6 — Send anonymously (Priority: P3)

**Goal**: Check the "Gửi lời cám ơn và ghi nhận ẩn danh" checkbox → on submit, kudo stored with `is_anonymous=true` → Live board hides sender identity.

**Independent Test**: Compose + tick checkbox + Gửi → query `kudos` table: new row has `is_anonymous=true`.

- [x] T052 [P] [US6] Write `AnonymousCheckbox.tsx` — checkbox (24 × 24 + 1 px `#999` border, cream bg when checked + white ✓) + label "Gửi lời cám ơn và ghi nhận ẩn danh" muted grey; `aria-checked` + `onChange` | src/components/kudos/AnonymousCheckbox.tsx
- [x] T053 [US6] Wire `isAnonymous: boolean` into `KudoComposer` form state; pass to `createKudo` Server Action payload | src/components/kudos/KudoComposer.tsx
- [x] T054 [US6] Append 1 US6 scenario to `KudoComposer.spec.tsx` — tick checkbox → submit → `createKudo` called with `isAnonymous: true` in payload | src/components/kudos/__tests__/KudoComposer.spec.tsx

**Checkpoint US6**: Anonymous flag persists. Live board rendering of anonymity is OUT OF SCOPE (flagged in plan.md risks — Live-board card spec maintainer owns that).

---

## Phase 9: User Story 7 — Addlink Box dialog (Priority: P2)

**Goal**: Click Link (🔗) in toolbar → nested modal opens → fill Nội dung + URL → Lưu → `<a>` inserted into body editor at caret.

**Covers sibling spec `OyDLDuSGEa`** — all 5 of its user stories ship within this phase (insert, validation, edit-mode, keyboard, dirty-state-deferred).

**Independent Test**: Click Link toolbar button → dialog opens → fill "Demo" + `https://demo.com` → Lưu → body editor contains `<a href="https://demo.com">Demo</a>` at caret.

- [x] T055 [P] [US7] Write `AddlinkDialog.spec.tsx` unit tests — 8 scenarios: (1) open with empty fields, (2) open in edit mode pre-fills from props, (3) Lưu with valid fields fires `onSave({text, url})`, (4) Lưu disabled when invalid, (5) Hủy fires `onClose` with zero `onSave`, (6) Esc fires `onClose`, (7) URL regex rejects `javascript:` / bare domain, (8) focus trap Tab cycles Nội dung → URL → Hủy → Lưu → Nội dung | src/components/kudos/__tests__/AddlinkDialog.spec.tsx
- [x] T056 [US7] Write `AddlinkDialog.tsx` — React Portal to `document.body`, own backdrop (`fixed inset-0 z-40 bg-black/40`), paper (`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ...` per design-style). Two text fields + Hủy + Lưu | src/components/kudos/AddlinkDialog.tsx
- [x] T057 [US7] Implement form validation — trim Nội dung (1..100), trim URL (5..2048) + regex `^https?:\/\/.+/i`; blur + change trigger validation; `aria-disabled` on Lưu when invalid; inline error `<p role="alert">` below each field | src/components/kudos/AddlinkDialog.tsx
- [x] T058 [US7] Implement focus trap — hand-rolled sentinels (same pattern as Viết Kudo); Esc fires `onClose`; Enter on URL field when valid fires Lưu (prevent default browser form submit) | src/components/kudos/AddlinkDialog.tsx
- [x] T059 [US7] Wire Link toolbar button in `EditorToolbar.tsx` to open `AddlinkDialog` — parent `KudoComposer` holds `isAddlinkOpen` state; passes `initialText` / `initialUrl` / `isEditMode` based on current editor selection + active `link` mark | src/components/kudos/EditorToolbar.tsx, KudoComposer.tsx
- [x] T060 [US7] In `KudoComposer.tsx`, compute `initialText` + `initialUrl` + `isEditMode` by inspecting TipTap editor at dialog-open time — use `editor.state.selection` for text + `editor.getAttributes('link').href` for edit mode detection | src/components/kudos/KudoComposer.tsx
- [x] T061 [US7] In `BodyEditor.tsx`, expose a `insertOrUpdateLink({ text, url, isEditMode })` method for `KudoComposer` to call on Lưu — 3 TipTap command variants per spec FR-005: `insertContent(<a>text</a>)` (no selection), `setLink` (wrap existing selection), `extendMarkRange('link').setLink(...).insertText(text)` (edit mode) | src/components/kudos/BodyEditor.tsx
- [x] T062 [US7] Implement `activeModal` state in `KudoComposer.tsx` — suppress Viết Kudo's Esc handler while `isAddlinkOpen === true` so Esc closes Addlink only. Addlink owns its own Esc/backdrop handling | src/components/kudos/KudoComposer.tsx
- [x] T063 [US7] Run T055's 8 scenarios — all green after T056-T058 land (T059-T062 are KudoComposer-side and covered by KudoComposer integration test appends if needed) | src/components/kudos/__tests__/AddlinkDialog.spec.tsx

**Checkpoint US7**: Link insertion, validation, and edit-mode update all work. Addlink stacks correctly over Viết Kudo without breaking focus.

---

## Phase 10: Polish & Cross-cutting concerns

**Purpose**: motion, a11y, responsive, E2E, screenflow flip. Lands in PR 4 alongside US7.

- [x] T064 Audit every transition across all 10 new components — wrap with `motion-safe:` modifier so reduced-motion users see instant show/hide. Touch points: `KudoComposer` modal entry/exit, `HashtagPicker` fade, `AddlinkDialog` fade+scale, toolbar button hover, row hover transitions | src/components/kudos/*.tsx
- [x] T065 [P] Responsive audit — verify against each design-style §Responsive table: (a) `KudoComposer` full-screen on mobile + footer stacks + Lưu on top, (b) `HashtagPicker` row height `h-11 sm:h-10` (constitution §II touch-target), (c) `AddlinkDialog` `w-full sm:w-[752px]`, (d) input widths fill on mobile. No new code expected — catch missed `sm:` prefixes | src/components/kudos/*.tsx
- [ ] T066 [P] Run axe-core on `/kudos/new` with modal open + each of the 2 overlays open. Zero violations required (SC-004 on all 3 specs). Fix any surfaced issues in place | N/A (report only)
- [x] T067 Write `tests/integration/viet-kudo.integration.spec.tsx` — full end-to-end happy path with mocked Supabase: FAB click → modal opens → fill all fields including image + hashtag + mention → Gửi → `createKudo` invoked with complete payload + `revalidatePath` called | tests/integration/viet-kudo.integration.spec.tsx
- [ ] T068 Write `tests/e2e/kudos/compose.spec.ts` — smoke Playwright covering compose → submit happy path. Gated on `SUPABASE_TEST_SESSION_TOKEN` env var (existing Kudos convention). Non-blocking in CI if env missing; must run green locally before PR 4 merges | tests/e2e/kudos/compose.spec.ts
- [ ] T069 Manual smoke test via `yarn dev` — navigate to `/kudos/new` + open each overlay, eyeball-compare against the 3 `assets/frame.png` files. No visual-regression infra today so this is eyeball-only | N/A (manual)
- [ ] T070 **After PR 4 merges**: flip SCREENFLOW rows #7 (Viết Kudo), #11 (Hashtag picker), #14 (Addlink) from `📋 spec'd` → `🟢 shipped`. Append one discovery-log entry summarising the bundled feature: 70 tasks, 10 new components, 3 migrations, 6 TipTap packages, 3 tokens, 7 icons, 1 Server Action, 1 storage bucket, 1 smoke E2E | .momorph/contexts/screen_specs/SCREENFLOW.md

**Final gate**: Zero axe violations on all 3 entrypoints. Full-feature compose flow ships end-to-end. All 70 tasks complete.

---

## Dependency Graph

```
Phase 1 (Setup — PR 1)
  T001 (TipTap deps) ──┐
  T002 (tokens) ───────┤
  T003 (icons) ────────┤
  T004, T005, T006 ────┼─> T007 (apply migrations) ──> Phase 2
  T008 (types) ────────┤
  T009 (i18n) ─────────┘

Phase 2 (Foundation — PR 1)
  T010 (routes) ──┬──> Phase 3
  T011 (SA stub) ─┘

Phase 3 (US1 — PR 2)
  T012 (KudoComposer test red)  ─┐
  T013 (createKudo test red)      ├─> TDD red
                                  │
  T014 (KudoComposer) ──┬──> T021 (submit) ─┬──> T026 (tests green)
  T015 (Recipient)    ──┤                   │
  T016 (Title)        ──┤                   │
  T017 (BodyEditor)   ──┤                   │
  T018 (Toolbar)      ──┤                   │
  T019 (Hashtag stub) ──┤                   │
  T020 (createKudo impl) ────────────────────┤
                                  │          │
  T022 (Hủy) ───────────────────── T023 (a11y)
                                             │
  T024 (FAB wire) ─┬── (independent)
  T025 (Thể lệ wire) ─┘
                                             │
  T027 (Recipient tests) ─┬── (parallel)     │
  T028 (BodyEditor tests) ─┘                 │
                                             ▼
                                        Checkpoint US1 (MVP)

Phase 4 (US2 — PR 3) — depends on US1
  T029 (validation) ──> T030 (aria) ──> T031 (test appends) ──> T032 (field tests)

Phase 5 (US3 — PR 3) — depends on US1 (BodyEditor)
  T033 (mention ext) ──> T034 (searchSunner wrap) ──> T035 (popover) ──> T036 (tests)

Phase 6 (US4 — PR 3) — depends on US1 (HashtagField stub)
  T037 (tests red) ──┬─> T038 (picker) ──┬─> T039 (keyboard) ─┐
                     │                   ├─> T040 (5-cap) ────┤
                     │                   ├─> T041 (states) ───┤
                     │                                         ├─> T044 (green)
                     │                                         │
                     │                   T042 (wire HashtagField) ──> T043 (chips)

Phase 7 (US5 — PR 3) — depends on US1 (KudoComposer)
  T045 (tests red) ──> T046 (uploader) ──┬─> T047 (thumbs)
                                          ├─> T048 (cleanup)
                                          ├─> T049 (isUploading guard)
                                          └─> T050 (plumb paths) ──> T051 (green)

Phase 8 (US6 — PR 4) — depends on US1
  T052 (checkbox) ──> T053 (plumb) ──> T054 (test)

Phase 9 (US7 — PR 4) — depends on US1 + US3 (editor)
  T055 (tests red) ──> T056 (dialog) ──┬─> T057 (validation)
                                        ├─> T058 (focus trap)
                                        │
  T059 (wire) ─┬─> T060 (edit-mode detect) ─> T061 (TipTap cmd) ─> T062 (activeModal)
               │
                                                                    ├─> T063 (green)

Phase 10 (Polish — PR 4) — depends on all above
  T064, T065, T066 ─┬─ (parallel)
  T067 (integration) ─┤
  T068 (E2E) ─────────┤
  T069 (manual smoke) ─┘
                     │
                    T070 (SCREENFLOW flip — POST-MERGE)
```

---

## Parallel Execution Opportunities

Within a single developer / single PR, parallelism matters less than cross-file isolation. These pairs/groups are safe to develop in parallel:

| Group | Tasks | Why |
|---|---|---|
| **Setup parallel cluster** | T001 ‖ T002 ‖ T003 ‖ T004 ‖ T005 ‖ T006 ‖ T008 ‖ T009 | All touch different files; T007 gates on T004-T006 |
| **US1 field components** | T015 ‖ T016 ‖ T019 | Different files; all consumed by T014 parent |
| **US1 entrypoints** | T024 ‖ T025 | Different files |
| **US1 test file authoring** | T027 ‖ T028 | Different test files |
| **US2 aria spread** | T030 applied across 4 files — within-task parallelism |
| **US6 simple component** | T052 ‖ parallel with Phase 7 tail | Different file |
| **Polish cluster** | T064 ‖ T065 ‖ T066 | Different concerns |

**Critical serial edges** (cannot parallelise):
- T007 → everything in Phases 2-9 (migrations must apply first)
- T014 → T021 (parent must exist before submit can be wired)
- T038-T041 → T044 (implementation must land before tests go green)
- T056-T058 → T063 (same pattern for AddlinkDialog)

---

## Implementation Strategy — MVP first, incremental delivery

**Suggested MVP** = Phases 1 + 2 + 3 (US1 only).

Delivering Phases 1-3 ships a **functional compose modal** with the 4 required fields (stub hashtag + no images + no anonymous). Users can write kudos; the feed updates. This is enough value to ship PR 2 as soon as it's green.

**Recommended split into 4 PRs**:

| PR | Phases | Story coverage | Value delivered |
|---|---|---|---|
| **PR 1** | 1 + 2 | infra only | CI green, routes scaffolded, migrations landed |
| **PR 2** | 3 | US1 MVP | Basic compose + send works end-to-end |
| **PR 3** | 4 + 5 + 6 + 7 | US2+US3+US4+US5 | Full-feature compose (validation, @mention, hashtag picker, images) |
| **PR 4** | 8 + 9 + 10 | US6+US7 + polish | Anonymous, Addlink dialog, E2E, SCREENFLOW flip |

Each PR is independently deployable — PRs 2-4 each make the feature more capable without breaking the prior state.

**Alternative single-PR delivery**: if the 4-PR split feels heavy for review, all 70 tasks can land in a single PR. Estimated effort: 2-3 weeks for one developer. Review complexity is the main trade-off.

---

## User-Story Independence Matrix

| Story | Depends on (hard) | Depends on (soft) | Independently testable? |
|---|---|---|---|
| **US1** — Compose + send | Phase 1 + 2 | — | ✅ MVP level |
| **US2** — Validation error | US1 (the form must exist) | — | ✅ Yes |
| **US3** — @mention | US1 (BodyEditor exists) | — | ✅ Yes |
| **US4** — Hashtag picker | US1 (HashtagField stub exists) | — | ✅ Yes — unit-testable standalone as `HashtagPicker` |
| **US5** — Images | US1 (form state exists) + Phase 1 (storage bucket) | — | ✅ Yes |
| **US6** — Anonymous + alias | US1 + Phase 1 (is_anonymous column) + Phase Patch-A (anonymous_alias column 0017) | — | ✅ Yes — small surface |
| **US7** — Addlink | US1 + US3 (editor with Link extension) | — | ✅ Yes — unit-testable standalone as `AddlinkDialog` |

---

## Independent Test Criteria (per story)

| Story | How to verify in isolation |
|---|---|
| **US1** | `/kudos/new` → fill 4 required fields → Gửi → new kudo appears on `/kudos` after reload |
| **US2** | Submit with any empty required field → no network request + red border + focus on first invalid field |
| **US3** | Focus body → type `@al` → popover lists Sunners matching "al" → Enter inserts mention chip with `data-mention-id` |
| **US4** | Click "+ Hashtag" → picker shows 13 options → select 2 → click outside → picker closes + 2 chips visible |
| **US5** | Click "+ Image" → pick 2 MB JPEG → thumbnail renders → Gửi → image URL persists in `kudo_images` table |
| **US6** | Tick anonymous → alias field appears → type "NinjaSunner" → Gửi → query `kudos` → row has `is_anonymous=true, anonymous_alias='NinjaSunner'`. Also: uncheck → alias field hides + value reset; empty alias → validation blocks submit |
| **US7** | Toolbar Link → dialog opens → fill "Demo" + `https://demo.com` → Lưu → `editor.getHTML()` contains `<a href="https://demo.com">Demo</a>` |

---

## Summary

- **Total tasks**: 80 (T001 – T080) including the round-3 anonymous-alias patch (T071–T080)
- **Setup**: 9 tasks (T001–T009 — 8 parallelisable via [P])
- **Foundational**: 2 tasks (T010–T011)
- **US1 MVP (P1)**: 17 tasks (T012–T028)
- **US2 (P1)**: 4 tasks (T029–T032)
- **US3 (P2)**: 4 tasks (T033–T036)
- **US4 (P2)**: 8 tasks (T037–T044)
- **US5 (P2)**: 7 tasks (T045–T051)
- **US6 (P3)**: 3 tasks (T052–T054)
- **US7 (Addlink P2)**: 9 tasks (T055–T063)
- **Polish**: 7 tasks (T064–T070)
- **Patch (round 3 — anonymous alias)**: 10 tasks (T071–T080)
- **New test files**: 8 (KudoComposer.spec, RecipientField.spec, BodyEditor.spec, HashtagPicker.spec, ImageUploader.spec, AddlinkDialog.spec, **AnonymousAliasField.spec**, + createKudo.spec integration, + viet-kudo.integration.spec, + e2e/compose.spec) → 10 files total
- **Estimated test scenarios**: ~60 unit + ~15 integration + 1 smoke E2E + ~6 alias scenarios = ~82 total
- **Parallelisable pairs/groups identified**: 7 — see Parallel Execution Opportunities
- **Constitution compliance**: all 37 FRs/TRs across 3 specs mapped to tasks (see plan.md compliance matrix)

---

## Phase Patch-A — Anonymous alias (spec round 3, 2026-04-21) · [US6]

Missed in earlier `/momorph.reviewspecify` rounds; Figma item G requires an alias text-field when the checkbox is ticked. This patch extends PR 4's already-shipped `AnonymousCheckbox` without breaking it. Ship either as a PR 5 follow-up OR fold into PR 4 if PR 4 hasn't merged yet.

- [x] **T071** [US6] Write migration `supabase/migrations/0017_kudo_anonymous_alias.sql` — adds `anonymous_alias text null`, CHECK constraint, recreate `kudos_with_stats` view, `CREATE OR REPLACE create_kudo(...)` with `p_anonymous_alias text default null` and defense-in-depth validation | `supabase/migrations/0017_kudo_anonymous_alias.sql`
- [x] **T072** [US6] Apply migration locally (`make db:reset` or equivalent) and confirm existing `createKudo.spec.ts` integration tests still pass | (no file — script run)
- [x] **T073** [US6] Extend type `CreateKudoInput` with `anonymousAlias: string \| null` + extend `Database['public']['Functions']['create_kudo']['Args']` with `p_anonymous_alias?: string \| null` | `src/types/kudo.ts` · `src/types/database.ts`
- [x] **T074** [P] [US6] Add i18n leaves `compose.fields.anonymousAlias.{label,placeholder,validation.required,validation.tooLong}` to vi + en. vi values per round-3 screenshot: `label="Nickname ẩn danh"`, `placeholder="Nhập nickname"`, `validation.required="Vui lòng nhập nickname (2–40 ký tự)"`, `validation.tooLong="Nickname tối đa 40 ký tự"`. en values: use "Anonymous nickname" / "Enter nickname" / "Please enter a nickname (2–40 chars)" / "Nickname is at most 40 chars" | `src/messages/vi.json` · `src/messages/en.json`
- [x] **T075** [US6] Update `createKudo` Server Action: when `isAnonymous=true` require trimmed alias 2..40 chars, forward as `p_anonymous_alias` in the RPC call; when false, force null | `src/app/kudos/actions.ts`
- [x] **T076** [P] [US6] Create `AnonymousAliasField.tsx` component per design-style §G.1 — label **`w-auto` hug** (not 146 px), text "Nickname ẩn danh" + red `*`, input **h-14** (56 px — same as RecipientField; confirmed 2026-04-21), `px-6 py-4`, white bg, `maxLength={40}`, `error` prop wired with `aria-invalid` + inline red message below input | `src/components/kudos/AnonymousAliasField.tsx`
- [x] **T077** [US6] Patch existing `AnonymousCheckbox.tsx` to match round-3 screenshot + extend `KudoComposer` reducer. Two changes in one file-group:<br/>(a) `AnonymousCheckbox.tsx`: label colour `--color-muted-grey` → `--color-brand-900`; checked-state box fill `--color-accent-cream` → `--color-border-secondary`; checkmark icon colour swaps to cream; unchecked border colour `--color-muted-grey` → `--color-border-secondary`.<br/>(b) `KudoComposer.tsx`: add `anonymousAlias: string` to reducer state + branch that resets to `""` whenever `isAnonymous` flips false; conditionally render `<AnonymousAliasField />` below `<AnonymousCheckbox />` when `isAnonymous===true`; include alias in the errors map + `isValid` + submit payload | `src/components/kudos/AnonymousCheckbox.tsx` · `src/components/kudos/KudoComposer.tsx`
- [x] **T078** [P] [US6] Unit tests for `AnonymousAliasField` — not-visible-when-unchecked, validation messages (required / tooLong), `maxLength` attr enforced | `src/components/kudos/__tests__/AnonymousAliasField.spec.tsx`
- [x] **T079** [US6] Extend `createKudo.spec.ts` — (a) alias forwarded in RPC args; (b) `isAnonymous=true` + empty alias returns `{ok:false}` without calling RPC; (c) `isAnonymous=false` + non-null alias coerced to null before RPC | `src/app/kudos/__tests__/createKudo.spec.ts`
- [ ] **T080** [US6] Extend integration spec `viet-kudo.integration.spec.tsx` — (a) checking anonymous makes alias field appear; (b) unchecking hides + resets the alias; (c) attempting submit with empty alias stays disabled | `tests/integration/viet-kudo.integration.spec.tsx`

**Gate**: All 10 patch tasks checked; existing tests remain green; `yarn tsc --noEmit` and `yarn lint` clean.

**Downstream flagged but out of scope here**: Live-board card (`KudoPostCard` / `HighlightKudoCard` / `KudoParticipant`) must honour `anonymous_alias` when rendering anonymous kudos — owner: Kudos Live board maintainer. Open as a separate ticket after this patch merges.
