# Screen: Viết Kudo (Compose Kudo)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `ihQ26W78P2` (node `520:11602`) |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 |
| **Screen Group** | Core App — Kudos compose |
| **Status** | implemented |
| **Discovered At** | 2026-04-23 |
| **Last Updated** | 2026-04-23 |

---

## Description

Cream-paper (`#FFF8E1`) modal form that lets a Sunner compose and publish
a kudo (lời cảm ơn + ghi nhận) to a single teammate. Reachable from:
- `<QuickActionsFab>` expanded-menu "Viết KUDOS" tile
- Thể lệ page "Viết KUDOS" CTA
- Direct URL `/kudos/new` (App Router intercepting-routes pattern — modal
  over `/kudos`; cold loads fall back to standalone page)

On submit the new **`createKudo`** Server Action atomically inserts into
`kudos` + `kudo_recipients` + `kudo_hashtags` + `kudo_images`, writes
anonymity fields when applicable, and `revalidatePath("/kudos")` so the
Live board shows the new kudo at the top within ≤ 1 s.

Rich-text editor: **TipTap** (`@tiptap/react` + `@tiptap/starter-kit` +
`@tiptap/extension-link` + `@tiptap/extension-mention`). Toolbar:
Bold / Italic / Strike / BulletList / Link / Blockquote. Body is
serialised as HTML (TipTap `editor.getHTML()`) into `kudos.body` (TEXT).

Error variant `5c7PkAibyD` folds in as "validation error" UI state — red
borders + inline messages + focus-jump to first invalid field. No
separate spec.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Homepage / Kudos Live board / Awards | FAB "Viết KUDOS" tile | Authenticated |
| Thể lệ (`/the-le`) | "Viết KUDOS" CTA | Authenticated |
| Kudos Live board | A.1 composer pill (`2940:13449`) | Authenticated |
| Kudos Live board | Profile preview tooltip "Gửi KUDO" CTA | `/kudos/new?recipient=<userId>` |
| Direct URL `/kudos/new` | Browser entry | Authenticated |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Kudos Live board (`/kudos`) | Submit success | `I520:11647;520:9905` (Gửi) | High | Closes modal; `revalidatePath("/kudos")`; stays on underlying page |
| Parent page (no change) | Hủy / Esc / backdrop | — | High | Dirty-state confirm if any content typed |
| Addlink Box (`OyDLDuSGEa`) | Link toolbar button (C.5) | `662:10507` | High | Nested dialog — see addlink-box.md |
| Dropdown list hashtag (`p9zO-c4a4x`) | "+ Hashtag" button | — | High | Picker overlay — see dropdown-list-hashtag.md |
| Community standards (parked) | "Tiêu chuẩn cộng đồng" link | `3053:11619` | Medium | Opens in new tab; target URL TBD |

### Navigation Rules

- **Back behavior**: Browser back with modal open triggers Hủy
  (dirty-state prompt if any content).
- **Deep link support**: Yes — `/kudos/new` standalone route supported;
  `?recipient=<userId>` pre-fills.
- **Auth required**: Yes.

---

## Component Schema

### Layout Structure

```
┌────────────────────────────────────────────────┐
│  Gửi lời cám ơn và ghi nhận đến đồng đội       │  (A — title)
├────────────────────────────────────────────────┤
│  Người nhận *   [Tìm kiếm                   ▾] │  (B)
│                                                │
│  Danh hiệu  *   [Dành tặng một danh hiệu…   ]  │  (⚠)
│                                                │
│  [B] [I] [S] [•] [🔗] [❝]   Tiêu chuẩn cộng đồng│  (C — toolbar)
│                                                │
│  ┌────────────────────────────────────────┐    │
│  │ Hãy gửi gắm lời cám ơn và ghi nhận…    │    │  (D — TipTap)
│  │ @mention support                       │    │
│  └────────────────────────────────────────┘    │
│  "Bạn có thể @ + tên để nhắc tới đồng nghiệp"  │
│                                                │
│  Hashtag *      [+ Hashtag] [#chip] [#chip]    │  (E)
│  Image          [+ Image]  [thumb × 5]         │  (F)
│  ☐ Gửi ẩn danh                                 │  (G)
│  └─ Nickname ẩn danh * [……]                    │  (G.1, conditional)
├────────────────────────────────────────────────┤
│  [ ✖ Hủy ]                     [ ✉ Gửi ]       │  (H)
└────────────────────────────────────────────────┘
```

### Component Hierarchy

```
VietKudoModal (Client — "use client")
├── Own backdrop (bg-black/50, click → Hủy)
├── Paper (cream #FFF8E1, 752 × hug)
│   ├── Title (A)
│   ├── RecipientField (B) — uses searchSunner Server Action
│   ├── TitleField (⚠ — "Danh hiệu")
│   ├── EditorToolbar (C) — 6 format buttons + "Tiêu chuẩn cộng đồng" link
│   ├── TipTap EditorContent (D) — StarterKit + Link + Mention
│   ├── HashtagField (E) — opens HashtagPicker overlay
│   ├── ImageUploader (F) — eager Supabase Storage upload
│   ├── AnonymousToggle (G)
│   ├── NicknameField (G.1, shown when G is checked)
│   └── Footer (H) — Hủy + Gửi
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| RecipientField | Molecule | `I520:11647;520:9871` | 514 × 56 search input + dropdown chevron; `searchSunner` typeahead | Yes |
| TitleField | Molecule | `1688:10448` (Frame 552) | Plain text input (required) → `kudos.title` | Yes |
| EditorToolbar | Molecule | `I520:11647;520:9877` | 6 toggle buttons (`aria-pressed`) | Yes |
| TipTap Body | Organism | `I520:11647;520:9886` | 672 × 200 rich-text with @mention suggestions | No |
| HashtagField | Molecule | `I520:11647;520:9890` | "+ Hashtag" chip-button + up-to-5 chips | No |
| ImageUploader | Molecule | `I520:11647;520:9896` | "+ Image" + 80 × 80 thumbs w/ red × | No |
| AnonymousToggle | Molecule | `I520:11647;520:14099` | Checkbox (olive border, olive checked-fill) + label "Gửi lời cám ơn và ghi nhận ẩn danh" | Yes |
| NicknameField (G.1) | Molecule | derived | Appears below G when checked; required 2–40 Unicode chars | No |
| Gửi button | Atom | `I520:11647;520:9905` | Primary cream + send icon; disabled while any required field invalid |

---

## Form Fields

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| `recipientId` | uuid | Yes | Exactly 1 valid `profiles.id` (FK via `kudo_recipients`) | "Tìm kiếm" |
| `title` (Danh hiệu) | text | Yes | Trimmed ≥ 1 char (recommend ≤ 120) → `kudos.title` | "Dành tặng một danh hiệu cho đồng đội" |
| `body` | HTML | Yes | TipTap `editor.getHTML()` non-empty after stripping tags (recommend ≤ 5000 chars) | "Hãy gửi gắm lời cám ơn…" |
| `hashtagSlugs` | string[] | Yes | 1..5 entries; each exists in `hashtags`; no duplicates | — |
| `imagePaths` | string[] | No | 0..5 entries; ≤ 5 MB; MIME ∈ {jpeg, png, webp} | — |
| `isAnonymous` | boolean | No | — | — |
| `anonymousAlias` | text | Yes iff `isAnonymous=true` | Trimmed 2..40 Unicode chars; DB CHECK enforces pairing | "Nhập nickname" |

### Validation Rules

```typescript
// Required fields gate Gửi button via aria-disabled="true".
// On Gửi click with invalid form:
//   - all invalid fields gain red border + inline message
//   - focus jumps to FIRST invalid field (Recipient → Title → Body → Hashtag)
//   - NO createKudo call fires
// Hashtag overflow: 6th click blocked, "Tối đa 5 hashtag" feedback.
```

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| `getKudoHashtags()` | Server Action | Pre-fetch 13 hashtags (migration 0010) | Hashtag picker options |
| `supabase.auth.getUser()` | built-in | Session gate + `sender_id` | Required for `createKudo` |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Recipient typeahead | `searchSunner(query)` (`src/app/kudos/actions.ts:681`) | Server Action | — | Up-to-10 suggestions |
| `@mention` typeahead | Same `searchSunner` | Server Action | — | Same |
| Image upload | `supabase.storage.from('kudo-images').upload({userId}/{uuid}.ext)` | Storage | File (≤ 5 MB, whitelist MIME) | Eager on pick; signed URL via `createSignedUrl(path, 3600)` |
| Image remove | `supabase.storage.from('kudo-images').remove([path])` | Storage | — | Best-effort cleanup |
| Submit | `createKudo({ recipientId, title, body, hashtagSlugs, imagePaths, isAnonymous, anonymousAlias })` | Server Action | See above | Atomic INSERT into `kudos` + `kudo_recipients` + `kudo_hashtags` + `kudo_images` + `revalidatePath("/kudos")` |

DB tables written: `kudos`, `kudo_recipients`, `kudo_hashtags`,
`kudo_images`. Storage bucket: `kudo-images` (private, RLS owner-only
write).

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| Validation failure | Per-field i18n errors | Red border + inline message; focus jumps to first invalid |
| Network / 500 on `createKudo` | "Không gửi được. Thử lại sau." | Modal stays open; re-enable Gửi; form state preserved |
| Image > 5 MB | "Ảnh phải nhỏ hơn 5 MB" | Client-rejects before upload |
| MIME not in whitelist | "Chỉ hỗ trợ JPG, PNG, WebP" | Same |
| Anonymous + no nickname | "Vui lòng nhập nickname (2–40 ký tự)" | Red border on G.1 |

---

## State Management

### Local State (form)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `recipient` | `KudoUser \| null` | null | Single recipient |
| `title` | string | `""` | Danh hiệu |
| `body` (TipTap editor) | Editor instance | empty | Rich-text body |
| `hashtagSlugs` | `string[]` | `[]` | 0..5 |
| `images` | `{ path; signedUrl }[]` | `[]` | 0..5 |
| `isAnonymous` | boolean | `false` | Anonymous flag |
| `anonymousAlias` | string | `""` | Reset when `isAnonymous` flips off |
| `errors` | per-field map | `{}` | Inline validation |
| `isSubmitting` | boolean | `false` | `useTransition` isPending |
| Dirty (derived) | boolean | — | `useMemo` — drives confirm-on-cancel |

### Server

Kudos rows + Storage objects after `createKudo` commits.

---

## UI States

### Loading State
- Hashtag picker shows skeleton rows if `getKudoHashtags()` not yet resolved.

### Error State (validation)
- Red borders + inline messages; submit disabled.

### Error State (submit)
- Toast "Không gửi được. Thử lại sau."; modal stays open.

### Uploading State
- Gửi disabled while any image uploading; subtle "Đang upload…" helper.

### Success State
- Modal closes 200 ms; success toast "Đã gửi kudo"; feed refreshes.

### Dirty + Cancel
- Confirm dialog "Bỏ bản nháp? Nội dung chưa gửi sẽ mất." before close.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on title heading |
| Focus trap | Hand-rolled first/last sentinels (no library) |
| Required fields | `aria-required="true"`; invalid → `aria-invalid="true"` + `aria-describedby` |
| Toolbar | `aria-pressed` on each toggle + `aria-label` on icon-only buttons |
| Keyboard | Esc = Hủy (with dirty prompt); Enter in inputs does NOT submit (only Gửi click / Enter on button) |
| Colour-blind | Red border paired with inline text message |
| Reduced motion | Entry animation gated `motion-safe:` |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<640px) | Full-screen sheet (100 vw × 100 dvh); no radius; footer stacks vertically |
| Tablet (640–1023px) | Centred, 90 % viewport, 24 px padding |
| Desktop (≥1024px) | 752 × 1012 (or hug) centred; backdrop 50 % dim |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `compose_open` | Modal mount | `{ source: "fab" \| "liveboard_pill" \| "the-le_cta" \| "profile_tooltip" }` |
| `compose_submit` | `createKudo` success | `{ hashtag_count, image_count, is_anonymous }` |
| `compose_cancel` | Hủy / Esc | `{ was_dirty: boolean }` |

---

## Design Tokens

**New tokens** added via migration through plan phase:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-modal-paper` | `#FFF8E1` | Paper surface |
| `--color-error` | — | Validation borders + inline messages |
| `--color-secondary-btn-fill` | `rgba(255,234,158,0.10)` | Hủy button bg |

Plus existing `--color-accent-cream`, `--color-border-secondary`,
`--color-brand-900`, `--font-montserrat`.

---

## Implementation Notes

### Dependencies
- TipTap v2: `@tiptap/react`, `@tiptap/starter-kit`,
  `@tiptap/extension-link`, `@tiptap/extension-mention`,
  `@tiptap/suggestion`.
- Icons: `bold`, `italic`, `strikethrough`, `list-bullet`, `link`,
  `quote`, `send` (7 new glyphs added to `Icon.tsx`).

### Migrations
| Migration | Purpose |
|---|---|
| `0014_kudo_images_storage.sql` | `kudo-images` private bucket + RLS (owner-only write, authenticated read) |
| `0015_kudo_anonymous.sql` | Add `kudos.is_anonymous boolean not null default false` + refresh `kudos_with_stats` view |
| `0017_kudo_anonymous_alias.sql` | Add `kudos.anonymous_alias text null` + CHECK pairing; update `create_kudo(p_anonymous_alias)` function |

### Special Considerations
- **Single recipient** per kudo (Q1). Junction table still supports N
  structurally for future multi-recipient.
- **Storage path stored in `kudo_images.url`**; reads generate signed URL
  on each render (TTL 1 h) via `createSignedUrl`.
- **Eager image upload** keeps submit fast; best-effort delete on Hủy —
  orphans acceptable for MVP.
- **TipTap SSR**: render modal client-only (or wrap `EditorContent` in
  dynamic import `{ ssr: false }`).
- **Anonymous rendering** is the Live board's responsibility — this spec
  only sets `is_anonymous` + `anonymous_alias`.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-04-23 |
| Needs Deep Analysis | No — spec locked and implementing |
| Confidence Score | High |

### Next Steps

- [ ] Add a MoMorph annotation for "Danh hiệu" field (currently an
      annotation gap in `list_design_items`).
- [ ] Author the community-standards page spec so "Tiêu chuẩn cộng đồng"
      link can point to a real route (MVP uses placeholder).
- [ ] Plan garbage-collection job for orphaned `kudo-images` uploads
      (Phase 2).
