# Implementation Plan: Viết Kudo + compose overlays (bundled)

**Parent frame**: `ihQ26W78P2-viet-kudo`
**Child frames**: `p9zO-c4a4x-dropdown-list-hashtag` · `OyDLDuSGEa-addlink-box`
**Date**: 2026-04-21
**Specs**:
- [ihQ26W78P2-viet-kudo/spec.md](spec.md) · [design-style.md](design-style.md)
- [p9zO-c4a4x-dropdown-list-hashtag/spec.md](../p9zO-c4a4x-dropdown-list-hashtag/spec.md) · [design-style.md](../p9zO-c4a4x-dropdown-list-hashtag/design-style.md)
- [OyDLDuSGEa-addlink-box/spec.md](../OyDLDuSGEa-addlink-box/spec.md) · [design-style.md](../OyDLDuSGEa-addlink-box/design-style.md)

---

## Summary

Ship the Viết Kudo compose modal + its 2 child overlays (Hashtag picker, Addlink dialog) as a coherent compose feature. The modal sits on `/kudos/new` (intercepting route fallback to standalone page); body editor is TipTap with 6 formatting controls + `@mention` + Link; hashtag picker opens a dark-navy multi-select (1..5 tags); Addlink opens as a nested modal to collect `{text, url}`. Submit atomically inserts into `kudos` + 3 junction tables + Supabase Storage via a new `createKudo` Server Action. Migrations 0014 (storage bucket) + 0015 (anonymous flag) + 0017 (anonymous alias — round 3, 2026-04-21) + 3 new CSS tokens + 7 new Icon glyphs + 5 TipTap packages are the net-new infrastructure.

**Scope**: one bundled feature delivered in 4 incremental PRs (see §Implementation Approach). Parent + child overlays cannot ship separately — the compose flow is meaningless without any one piece.

**Total shape**: ~95-110 tasks across 4 PRs + patch-PR · 11 net-new components (adds `AnonymousAliasField`) · **4** new migrations (0014/0015/0016/**0017**) · **6** new deps (TipTap core + 5 extensions) · 3 new tokens · 7 new icons · 1 new Server Action · 1 new storage bucket · 1 smoke E2E.

---

## Technical Context

| Field | Value |
|-------|-------|
| **Language/Framework** | TypeScript (strict) + Next.js 16 App Router + React 19 |
| **Primary Dependencies** | TailwindCSS v4, `@supabase/ssr`, `next/font/google` (Montserrat), **NEW**: `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-mention` + `@tiptap/suggestion` + `@tiptap/extension-character-count` (~62 KB gz total) |
| **Database** | Supabase Postgres with RLS (existing). 4 new migrations required (0014 storage bucket RLS, 0015 `is_anonymous` column, 0016 `create_kudo` stored function, 0017 `anonymous_alias` column + CHECK constraint + `CREATE OR REPLACE` of `create_kudo` to accept alias) |
| **Storage** | Supabase Storage — new `kudo-images` bucket (private, 5 MB, 3 MIME whitelist) |
| **Testing** | Vitest + `@testing-library/react` + happy-dom (existing Kudos pattern) |
| **State Management** | React hooks only (`useState`, `useReducer`, `useTransition`, `useMemo`) — constitution §III |
| **API Style** | Server Actions — `createKudo` (new) + `searchSunner` / `getKudoHashtags` (existing) |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] Follows project coding conventions (TypeScript strict, `@/*` alias, PascalCase components)
- [ ] **Uses approved libraries and patterns** — 5 new TipTap packages added. Justification: editor feature set required by Figma toolbar (Bold/Italic/Strike/BulletList/Link/Blockquote + @mention) cannot be delivered with plain textarea. Zero existing rich-text editor in project. TipTap chosen over Slate/Lexical for StarterKit ergonomics (spec TR-001 rationale).
- [x] Adheres to folder structure guidelines (`src/components/kudos/` for new compose components; `src/app/kudos/new/` for the modal route)
- [x] Meets security requirements — RLS on storage + kudos tables; Server Action validates ownership; TipTap default schema strips dangerous tags
- [x] Follows testing standards (TDD — unit + integration tests alongside implementation; see §Testing Strategy)

### Compliance matrix (spec → constitution, exhaustive — all 37 FRs/TRs)

**Viết Kudo (`ihQ26W78P2`) FRs/TRs**:

| Spec requirement | Constitution rule | Implementation note | Owning task group |
|---|---|---|---|
| FR-001 (open via FAB / Rules CTA / URL) | §App Router routing | `/kudos/new` intercepting route + standalone page fallback. Parent rendered via Next.js `@modal` slot on `/kudos` layout | T-VK-SETUP |
| FR-002 (4 required fields + disabled Gửi) | §III client state | `useMemo` over form state computes `isValid` | T-VK-FORM |
| FR-003 (`createKudo` atomic insert) | §V Supabase, §Principle I clean code | Single Server Action; calls `supabase.rpc('create_kudo', {...})` OR does transactional multi-insert with explicit rollback | T-VK-SA |
| FR-004 (revalidate + toast on success) | §App Router | `revalidatePath('/kudos')` owned by Server Action; `Toaster` exists | T-VK-SA |
| FR-005 (keep modal open + toast on failure) | §III | Error surfaced via `useTransition` isPending → thrown error → toast + form state preserved | T-VK-SA |
| FR-006 (red border + inline error on invalid submit) | §Principle II WCAG AA | Per-field `aria-invalid` + `aria-describedby`; first-invalid-field auto-focus | T-VK-VALID |
| FR-007 (TipTap toolbar 6 controls) | — | TipTap StarterKit disables Code; enables Bold/Italic/Strike/BulletList/Blockquote + Link | T-VK-EDITOR |
| FR-008 (@mention popover via searchSunner) | §V Supabase reuse | `@tiptap/extension-mention` + `@tiptap/suggestion` wrapping `searchSunner` | T-VK-EDITOR |
| FR-009 (hashtag picker — see child spec) | — | Child spec `p9zO-c4a4x` owns the picker; parent owns trigger | T-HP-* |
| FR-010 (image upload ≤ 5 × ≤ 5 MB × 3 MIME) | §V Supabase | Eager upload to `kudo-images/{userId}/{uuid}.{ext}`; client-side validate before calling `.upload()` | T-VK-IMG |
| FR-011 (anonymous checkbox → `is_anonymous` + alias) | `AnonymousAliasField` (new) | Migrations 0015 + 0017; `createKudo` honours flag + alias | T-VK-SA + T-VK-PATCH-ALIAS-* |
| FR-012 (Hủy with dirty prompt) | §Principle II | Native `window.confirm()` MVP — cheap, no new component. Phase-2 upgrade to custom modal if UX complaints. | T-VK-FORM |
| FR-013 (Link icon → Addlink dialog — see child spec) | — | Child spec `OyDLDuSGEa` | T-AL-* |
| FR-014 (Standards link new tab) | — | `<a href="#" target="_blank" rel="noopener noreferrer">` with stopgap URL `/the-le` + code comment | T-VK-UI |
| FR-015 (focus trap) | §Principle II WCAG AA | Hand-rolled first/last sentinels — no third-party lib | T-VK-A11Y |
| TR-001 (TipTap packages) | — | Add 5 packages to `package.json` in PR 1 | T-SETUP |
| TR-002 (Storage bucket) | §V Supabase | Migration 0014 creates bucket + RLS | T-SETUP |
| TR-003 (`createKudo` Server Action) | §V + §III | `src/app/kudos/actions.ts` — sibling of existing `toggleKudoHeart` | T-VK-SA |
| TR-004 (eager image upload) | — | Upload triggered on file-picker change; cleanup on Hủy/unmount | T-VK-IMG |
| TR-005 (HTML serialisation + mention attrs) | — | `editor.getHTML()` → stored in `kudos.body` TEXT | T-VK-SA |
| TR-006 (focus return on open/close) | §Principle II | Parent tracks trigger-ref; on close focuses it | T-VK-A11Y |
| TR-007 (reduced motion) | §Principle II WCAG | `motion-safe:` on every transition | T-VK-POLISH |
| TR-008 (dirty-state via `useMemo`) | §III | Derive from form state; no separate state | T-VK-FORM |

**Dropdown hashtag picker (`p9zO-c4a4x`) FRs/TRs**:

| Spec requirement | Implementation note | Owning task group |
|---|---|---|
| FR-001 (open/close paths) | Outside-click scoped to exclude trigger via `triggerRef`; window-level listener (TR-003) | T-HP-WIRING |
| FR-002 (render options from `getKudoHashtags()`) | Parent pre-fetches, passes as prop | T-HP-COMPONENT |
| FR-003 (toggle on click + `aria-selected`) | Via `onToggle` callback | T-HP-COMPONENT |
| FR-004 (selected-state visual) | Cream @ 20 % + ✓ icon per design-style | T-HP-COMPONENT |
| FR-005 (5-cap enforcement) | `aria-disabled` + no-op click + `opacity-50` at cap | T-HP-COMPONENT |
| FR-006 (no close on row click) | Explicit — click toggles only | T-HP-COMPONENT |
| FR-007 (keyboard: arrow/enter/space/esc/tab) | Roving tabindex; `onKeyDown` on `<ul>` | T-HP-KEYBOARD |
| FR-008 (focus on mount: active or first) | Imperative `.focus()` in `useEffect` | T-HP-KEYBOARD |
| FR-009 (parent pre-fetches) | Enforced by component not calling Server Action | T-HP-COMPONENT |
| FR-010 (dark-navy tokens) | Zero new tokens | T-HP-COMPONENT |
| TR-001 (component path + prop surface) | `src/components/kudos/HashtagPicker.tsx` | T-HP-COMPONENT |
| TR-003 (window-level listener) | Match `FilterDropdown` precedent | T-HP-WIRING |

**Addlink Box (`OyDLDuSGEa`) FRs/TRs**:

| Spec requirement | Implementation note | Owning task group |
|---|---|---|
| FR-001 (open via Link toolbar) | Called from Viết Kudo's body-editor wrapper | T-AL-OPEN |
| FR-002 (pre-fill from selection / edit mode) | Parent inspects active mark + selection, passes `initialText` / `initialUrl` / `isEditMode` | T-AL-OPEN |
| FR-003 (edit mode update, not duplicate) | TipTap `extendMarkRange('link').setLink(...)` pattern | T-AL-TIPTAP |
| FR-004 (blur + change validation) | `onBlur` + `onChange` handlers; `aria-disabled` on Lưu | T-AL-VALID |
| FR-005 (3 TipTap command variants) | `insertContent` / `setLink` wrap / `extendMarkRange` + `insertText` | T-AL-TIPTAP |
| FR-006 (close + focus return to editor) | `editor.focus()` after save | T-AL-TIPTAP |
| FR-007 (Hủy/Esc/backdrop close) | Addlink's own backdrop layer; z-40 below paper z-50 | T-AL-WIRING |
| FR-008 (http/https only) | Regex `/^https?:\/\/.+/i` | T-AL-VALID |
| FR-009 (localised error messages) | `useMessages()` / i18n catalogs | T-AL-I18N |
| FR-010 (focus trap) | Hand-rolled sentinels | T-AL-A11Y |
| FR-011 (block Viết Kudo backdrop) | Addlink backdrop covers; event.stopPropagation inside paper | T-AL-WIRING |
| TR-001 (component path + prop surface) | `src/components/kudos/AddlinkDialog.tsx` | T-AL-COMPONENT |
| TR-002 (TipTap Link config: no autolink, no openOnClick) | Config in parent editor setup | T-VK-EDITOR |
| TR-003 (client-side only validation) | No server reachability check | T-AL-VALID |
| TR-004 (hand-rolled focus trap) | Same pattern as Viết Kudo FR-015 | T-AL-A11Y |
| TR-007 (React Portal to document.body) | `createPortal(..., document.body)` | T-AL-WIRING |

**Violations**: None. TipTap deps justified above.

---

## Architecture Decisions

### Frontend Approach

**Component structure** (mobile-first atomic grouping):
- **Parent modal** (`src/components/kudos/ViếtKudoModal.tsx` — renamed `KudoComposer` for code ergonomics): orchestrates form state, TipTap editor instance, child overlays, submit.
- **Field components** (siblings of the modal, co-located):
  - `RecipientField.tsx` — single-select typeahead (reuses `searchSunner`)
  - `TitleField.tsx` — plain text input
  - `BodyEditor.tsx` — TipTap instance + toolbar + mention suggestions
  - `EditorToolbar.tsx` — 6 format buttons + Tiêu chuẩn link
  - `HashtagField.tsx` — trigger + selected chips (opens `HashtagPicker`)
  - `ImageUploader.tsx` — file input + thumbnails + Storage wiring
  - `AnonymousCheckbox.tsx` — single checkbox
- **Child overlays**:
  - `src/components/kudos/HashtagPicker.tsx` — multi-select listbox (spec `p9zO-c4a4x`)
  - `src/components/kudos/AddlinkDialog.tsx` — nested modal (spec `OyDLDuSGEa`)

**Styling strategy**: Tailwind v4 with arbitrary values (`bg-[var(--color-modal-paper)]`). Three new tokens added to globals.css; all other values reuse existing tokens.

**TipTap integration**:
- **Client-only boundary**: `BodyEditor.tsx` is `"use client"`; the parent `KudoComposer` is also client-only (forms are inherently interactive). No dynamic import needed because the whole compose feature mounts only in response to user action.
- **Editor config**: `StarterKit` with `code: false`, `codeBlock: false`, `horizontalRule: false`, `orderedList: false`. Plus `Link.configure({ openOnClick: false, autolink: false })`. Plus `Mention.configure({ suggestion: mentionSuggestion })`. Plus `Placeholder.configure({ placeholder: "..." })`.
- **Mention suggestion**: wraps existing `searchSunner(query)` Server Action; renders the popover via floating-ui-less absolute positioning (same pattern as LanguageDropdown).

**Routing (`/kudos/new`)**:
- **Primary**: Next.js App Router **intercepting routes** — `/kudos/@modal/new/page.tsx` so the compose modal overlays `/kudos` when navigated via `<Link href="/kudos/new">`. Direct hit to `/kudos/new` goes to the standalone page at `/kudos/new/page.tsx` for deep-linking + refresh.
- **Fallback**: If intercepting routes prove fragile (Next.js 16 quirks), drop to a simple `/kudos/new` route that renders the modal inline with a back-button to `/kudos`.
- **Decision**: start with primary; escape to fallback only if T-VK-ROUTE bloats beyond 1 day.

**Nested modal (Addlink)**:
- **Rendered via React Portal** to `document.body` (Addlink TR-007) so its `fixed` positioning escapes the Viết Kudo modal's stacking context.
- Own backdrop (`z-40`) + paper (`z-50`) — above Viết Kudo's backdrop (`z-30` / modal base).
- Esc + backdrop-click close only Addlink; Viết Kudo's Esc handler is SUPPRESSED while Addlink is open (guard via `isAddlinkOpen` state).

### Backend Approach

**`createKudo` Server Action** — `src/app/kudos/actions.ts`:
```ts
"use server";
export async function createKudo(input: CreateKudoInput): Promise<CreateKudoResult>;

type CreateKudoInput = {
  recipientId: string;         // single recipient (Q1 resolved)
  title: string;               // trimmed 1..120
  body: string;                // TipTap HTML 1..5000
  hashtagSlugs: string[];      // 1..5
  imagePaths: string[];        // 0..5, Storage paths
  isAnonymous: boolean;
};

type CreateKudoResult =
  | { ok: true; kudoId: string }
  | { ok: false; error: string };
```

**Atomicity strategy**: Prefer a Postgres stored function `create_kudo(...)` called via `supabase.rpc('create_kudo', ...)` — gives real transactional guarantees. If stored function feels heavyweight, fall back to manual multi-insert with error-on-first-fail and explicit rollback via `delete` of the partial `kudos` row. **Recommendation**: stored function for MVP (writes all 4 tables in one SQL transaction). If the function signature grows unwieldy, split into 3 `rpc` calls: insert kudo → insert recipients + hashtags → insert images.

**Validation**:
- Authentication (must have `auth.uid()`)
- `recipientId` exists in `profiles` + is not blocked by FK (enforced by FK)
- Each `hashtagSlug` resolves to a `hashtag.id` (fail fast if unknown slug)
- `imagePaths` all under `kudo-images/{auth.uid()}/...` (RLS enforces, but double-check client-provided paths)
- `body` passes basic sanity (length > 0 after strip-tags)

**Revalidation**: `revalidatePath('/kudos')` so the Live board feed picks up the new row.

### Database Changes

**Migration 0014** — `supabase/migrations/0014_kudo_images_storage.sql`:
```sql
-- Create kudo-images bucket + RLS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kudo-images', 'kudo-images', false, 5242880, array['image/jpeg','image/png','image/webp']);

-- RLS policies
create policy "kudo-images read for authenticated"
  on storage.objects for select
  using (bucket_id = 'kudo-images' and auth.role() = 'authenticated');

create policy "kudo-images insert own"
  on storage.objects for insert
  with check (bucket_id = 'kudo-images' and owner = auth.uid());

create policy "kudo-images delete own"
  on storage.objects for delete
  using (bucket_id = 'kudo-images' and owner = auth.uid());
```

**Migration 0015** — `supabase/migrations/0015_kudo_anonymous.sql`:
```sql
alter table kudos add column if not exists is_anonymous boolean not null default false;

-- Recreate kudos_with_stats view to include is_anonymous
drop view if exists kudos_with_stats;
create view kudos_with_stats as
select
  k.*,
  coalesce(h.cnt, 0) as hearts_count
from kudos k
left join (select kudo_id, count(*)::int as cnt from kudo_hearts group by kudo_id) h on h.kudo_id = k.id;
```

**Migration 0016** — `supabase/migrations/0016_create_kudo_fn.sql` (committed architecture choice — stored function is the default, not the fallback):
```sql
create or replace function create_kudo(
  p_title text,
  p_body text,
  p_is_anonymous boolean,
  p_recipient_id uuid,
  p_hashtag_slugs text[],
  p_image_paths text[]
) returns uuid
language plpgsql security definer
as $$
declare
  new_kudo_id uuid;
begin
  -- Insert kudos
  insert into kudos (sender_id, title, body, is_anonymous)
  values (auth.uid(), p_title, p_body, p_is_anonymous)
  returning id into new_kudo_id;

  -- Insert recipient
  insert into kudo_recipients (kudo_id, recipient_id) values (new_kudo_id, p_recipient_id);

  -- Insert hashtags
  insert into kudo_hashtags (kudo_id, hashtag_id)
  select new_kudo_id, id from hashtags where slug = any(p_hashtag_slugs);

  -- Insert images
  insert into kudo_images (kudo_id, url, position)
  select new_kudo_id, unnest(p_image_paths), generate_series(0, coalesce(array_length(p_image_paths,1),1)-1);

  return new_kudo_id;
end;
$$;
```

**Migration 0017** — `supabase/migrations/0017_kudo_anonymous_alias.sql` (round 3, 2026-04-21):

```sql
-- 1. Add the column (nullable; only populated when is_anonymous=true)
alter table kudos add column if not exists anonymous_alias text null;

-- 2. Pairing CHECK: alias required iff is_anonymous=true, 2..40 chars after trim
alter table kudos add constraint kudos_anonymous_alias_pairing
  check (
    (is_anonymous = false and anonymous_alias is null)
    or (is_anonymous = true and char_length(btrim(anonymous_alias)) between 2 and 40)
  );

-- 3. Include the column in kudos_with_stats view
drop view if exists kudos_with_stats;
-- …recreate with the same select list + `k.anonymous_alias` appended…

-- 4. Update the stored function to accept + persist the alias
create or replace function create_kudo(
  p_title text,
  p_body text,
  p_is_anonymous boolean,
  p_recipient_id uuid,
  p_hashtag_slugs text[],
  p_image_paths text[],
  p_anonymous_alias text default null  -- NEW
) returns uuid
language plpgsql security definer
as $$
declare
  new_kudo_id uuid;
  v_trimmed_alias text := btrim(coalesce(p_anonymous_alias, ''));
begin
  -- Defense-in-depth: reject the impossible pairing even if the CHECK
  -- is loosened later. Mirrors the client-side rule.
  if p_is_anonymous = true and (char_length(v_trimmed_alias) < 2 or char_length(v_trimmed_alias) > 40) then
    raise exception 'anonymous_alias must be 2..40 chars when is_anonymous=true';
  end if;
  if p_is_anonymous = false and v_trimmed_alias <> '' then
    raise exception 'anonymous_alias must be null when is_anonymous=false';
  end if;

  insert into kudos (sender_id, title, body, is_anonymous, anonymous_alias)
  values (
    auth.uid(),
    p_title,
    p_body,
    p_is_anonymous,
    case when p_is_anonymous then v_trimmed_alias else null end
  )
  returning id into new_kudo_id;

  -- (rest of inserts unchanged — recipient / hashtags / images)
  insert into kudo_recipients (kudo_id, recipient_id) values (new_kudo_id, p_recipient_id);
  insert into kudo_hashtags (kudo_id, hashtag_id)
    select new_kudo_id, id from hashtags where slug = any(p_hashtag_slugs);
  insert into kudo_images (kudo_id, url, position)
    select new_kudo_id, unnest(p_image_paths), generate_series(0, coalesce(array_length(p_image_paths,1),1)-1);

  return new_kudo_id;
end;
$$;
```

> **Note**: 0016 already shipped, so 0017 supersedes the function via `CREATE OR REPLACE`. The signature gains a trailing parameter with a default, so any existing caller that doesn't pass it continues to work (for Postgres overload resolution purposes; our only caller is `supabase.rpc('create_kudo', {...})` which names args).

### New Design Tokens

Added to `src/app/globals.css` `@theme inline`:

```css
/* Viết Kudo spec additions */
--color-modal-paper: #fff8e1;           /* cream paper background */
--color-error: #cf1322;                 /* validation red */
--color-close-red: #d4271d;             /* circular × buttons on image thumbs */
```

### Integration Points

- **Existing services this feature touches**:
  - `src/app/kudos/actions.ts` — append `createKudo`, import + reuse `searchSunner` + `getKudoHashtags`
  - `src/libs/supabase/client.ts` — client-side Supabase for Storage upload (authenticated RLS)
  - `src/components/ui/Icon.tsx` — add 7 new cases
  - `src/components/ui/Toaster.tsx` — reused for success + error toasts (already shipped)
  - `src/app/globals.css` — add 3 tokens
  - `src/app/kudos/page.tsx` — entrypoint already exists; wire a `@modal` slot for `/kudos/new` intercepting route
  - `src/components/shell/QuickActionsFab.tsx` — wire the "Viết KUDOS" tile to `/kudos/new` (if not already)
  - `src/app/the-le/page.tsx` — wire the "Viết KUDOS" CTA to `/kudos/new`

- **Shared contracts**:
  - `Locale` from `src/types/auth.ts` — used by i18n-aware error messages
  - `KudoUser`, `Hashtag`, `HashtagOption` from `src/types/kudo.ts` — extend if needed (add `HashtagOption` if not present)
  - `Messages` from `src/libs/i18n/getMessages` — extend catalogs with ~30 new leaves

---

## Project Structure

### New files

| File | Purpose | Owning spec |
|---|---|---|
| `supabase/migrations/0014_kudo_images_storage.sql` | Bucket + RLS | Viết Kudo TR-002 |
| `supabase/migrations/0015_kudo_anonymous.sql` | `is_anonymous` column + recreate view | Viết Kudo FR-011 |
| `supabase/migrations/0016_create_kudo_fn.sql` | Stored function for atomic insert (architecture commits to stored-function approach — not optional) | Viết Kudo TR-003 |
| `supabase/migrations/0017_kudo_anonymous_alias.sql` | `anonymous_alias text` column + CHECK constraint + `CREATE OR REPLACE create_kudo` with `p_anonymous_alias` | Viết Kudo FR-011 (round 3) |
| `src/app/kudos/new/page.tsx` | Standalone compose page (direct-URL entry) | Viết Kudo FR-001 |
| `src/app/kudos/@modal/new/page.tsx` | Intercepting-route modal (overlays /kudos) | Viết Kudo FR-001 |
| `src/app/kudos/@modal/default.tsx` | Default fallback for the modal slot | Viết Kudo FR-001 |
| `src/app/kudos/layout.tsx` (if missing) | Renders `@modal` parallel route | Viết Kudo FR-001 |
| `src/components/kudos/KudoComposer.tsx` | Parent modal orchestrator (ASCII-only filename to avoid cross-OS Unicode path issues; component exports as `<KudoComposer />`) | Viết Kudo |
| `src/components/kudos/RecipientField.tsx` | Single-select typeahead | Viết Kudo FR-002, FR-003 |
| `src/components/kudos/TitleField.tsx` | Plain text input | Viết Kudo |
| `src/components/kudos/BodyEditor.tsx` | TipTap `<EditorContent />` wrapper | Viết Kudo FR-007, FR-008 |
| `src/components/kudos/EditorToolbar.tsx` | 6 format buttons + Tiêu chuẩn link | Viết Kudo FR-007 |
| `src/components/kudos/HashtagField.tsx` | Trigger button + selected chips | Viết Kudo FR-009 |
| `src/components/kudos/HashtagPicker.tsx` | Multi-select listbox overlay | spec `p9zO-c4a4x` |
| `src/components/kudos/ImageUploader.tsx` | File picker + thumbnails + Storage upload | Viết Kudo FR-010 |
| `src/components/kudos/AnonymousCheckbox.tsx` | Checkbox + label | Viết Kudo FR-011 |
| `src/components/kudos/AddlinkDialog.tsx` | Nested modal for link insertion | spec `OyDLDuSGEa` |
| `src/components/kudos/__tests__/KudoComposer.spec.tsx` | Integration tests | — |
| `src/components/kudos/__tests__/HashtagPicker.spec.tsx` | Unit tests | — |
| `src/components/kudos/__tests__/AddlinkDialog.spec.tsx` | Unit tests | — |
| `src/components/kudos/__tests__/BodyEditor.spec.tsx` | Unit tests (with mocked TipTap) | — |
| `src/components/kudos/__tests__/RecipientField.spec.tsx` | Unit tests | — |
| `src/components/kudos/__tests__/ImageUploader.spec.tsx` | Unit tests | — |
| `tests/integration/viet-kudo.integration.spec.tsx` | Full end-to-end integration (trigger → compose → submit) | — |
| `tests/integration/createKudo.spec.ts` | Server Action integration (happy path + validation failures + RLS rejection simulations with mocked Supabase) | — |
| `tests/e2e/kudos/compose.spec.ts` | Smoke Playwright spec for compose happy path (gated on `SUPABASE_TEST_SESSION_TOKEN`) | T-VK-E2E-001 |

### Modified files

| File | Changes |
|---|---|
| `package.json` | Add 6 TipTap packages (PR 1) |
| `src/app/globals.css` | Add 3 design tokens (PR 1) |
| `src/components/ui/Icon.tsx` | Add 7 icon cases: `bold`, `italic`, `strikethrough`, `list-bullet`, `link`, `quote`, `send`. Reuses `close` + `plus` if already present (check during PR 1). |
| `src/app/kudos/actions.ts` | Append `createKudo` Server Action (~80-120 lines) |
| `src/types/kudo.ts` | Export `HashtagOption` type if not present; add `CreateKudoInput` + `CreateKudoResult` types |
| `src/messages/vi.json` + `en.json` | ~30 new i18n leaves (validation errors, placeholders, button labels, error/empty/toast copy) |
| `src/components/shell/QuickActionsFab.tsx` | Link "Viết KUDOS" tile to `/kudos/new` if not already |
| `src/app/the-le/page.tsx` | Link "Viết KUDOS" CTA to `/kudos/new` |
| `src/app/kudos/page.tsx` | Wire `@modal` parallel slot if intercepting route used |

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@tiptap/react` | ^2.x | React integration |
| `@tiptap/starter-kit` | ^2.x | Bold/Italic/Strike/BulletList/Blockquote/Placeholder |
| `@tiptap/extension-link` | ^2.x | Link mark + `setLink` command |
| `@tiptap/extension-mention` | ^2.x | `@mention` node type |
| `@tiptap/suggestion` | ^2.x | Popover mechanics for mention |
| `@tiptap/extension-character-count` | ^2.x | Enforce 5000-char body limit at TipTap schema level (review round 1 — was missing; TipTap has no native maxlength) |

All 6 packages are same-vendor with coordinated versioning. Total ~62 KB gz.

---

## Implementation Approach

**Delivery strategy**: Split into 4 incremental PRs. Each PR is a complete testable increment (green CI + smoke-testable feature surface). PRs 2-4 can be reviewed in parallel once PR 1 lands.

### PR 1 — Foundation (no user-facing feature yet, but unblocks everything)

**Scope**: Shared infrastructure. Nothing ships in the UI; CI stays green.

- **T-SETUP-001**: Add **6** TipTap packages to `package.json` + run install + lockfile commit (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-mention`, `@tiptap/suggestion`, `@tiptap/extension-character-count`)
- **T-SETUP-002**: Add 3 new design tokens to `src/app/globals.css`
- **T-SETUP-003**: Add 7 new icons to `src/components/ui/Icon.tsx` (inline SVGs; author or copy from icon library)
- **T-SETUP-004**: Write migration `0014_kudo_images_storage.sql` + apply via `supabase db push`
- **T-SETUP-005**: Write migration `0015_kudo_anonymous.sql` + apply
- **T-SETUP-006**: Write migration `0016_create_kudo_fn.sql` — creates the `create_kudo(...)` stored function (committed architecture choice; see Risk Assessment row on `SECURITY DEFINER` for the safety analysis — `sender_id` is hard-coded inside the function body, not a parameter, so callers cannot spoof identity)
- **T-SETUP-007**: Add `HashtagOption`, `CreateKudoInput`, `CreateKudoResult` types to `src/types/kudo.ts`
- **T-SETUP-008**: Stub `createKudo` Server Action in `src/app/kudos/actions.ts` (returns `{ ok: false, error: 'not implemented' }` — real impl in PR 2)
- **T-SETUP-009**: Add ~30 i18n leaves to `vi.json` + `en.json` (validation + placeholders + toasts)

**Gate**: `yarn typecheck && yarn lint && yarn test:run` all green. Supabase migrations apply cleanly on local + remote.

### PR 2 — Viết Kudo US1 (core happy-path compose + submit) 🎯 MVP

**Scope**: P1 user story — full compose + submit flow with required fields only. Ships a usable compose modal even without the nicer overlays.

- **T-VK-ROUTE-001**: Create `/kudos/new/page.tsx` standalone + intercepting-route scaffolding (`@modal` slot). Decide within 1 day whether intercepting routes work; escape to standalone-only if fragile.
- **T-VK-FORM-001**: `KudoComposer.tsx` — form state (`useReducer` with 6 fields), `useMemo` dirty + isValid derivation
- **T-VK-FIELDS-001**: `RecipientField.tsx` — single-select typeahead using `searchSunner` (dark-navy suggestion popover matching LanguageDropdown styling)
- **T-VK-FIELDS-002**: `TitleField.tsx` — plain text input, 1..120 chars
- **T-VK-EDITOR-001**: `BodyEditor.tsx` + `EditorToolbar.tsx` — TipTap StarterKit + Link + Placeholder + **CharacterCount** (`@tiptap/extension-character-count`, ~2 KB) configured with `limit: 5000`. Enforces the body length cap at the TipTap schema level (types beyond 5000 are blocked). Toolbar buttons toggle marks via `editor.chain().focus().toggleBold().run()` etc. **Note**: adds a 6th TipTap package to `package.json` — update PR 1 accordingly.
- **T-VK-HASHTAG-TRIGGER**: `HashtagField.tsx` trigger + selected-chip rendering (picker to open later; stub trigger that logs "picker coming in PR 3")
- **T-VK-SA-001**: `createKudo` Server Action implementation — stored function OR multi-insert path; validates + inserts
- **T-VK-SUBMIT-001**: Wire Gửi button to `useTransition` + call `createKudo` + success toast + modal close + `revalidatePath('/kudos')`. **Guard**: Gửi button MUST also be disabled while `isUploading === true` (any image still uploading) per Viết Kudo Edge Cases. Under the hood the `isValid` derived state in T-VK-FORM-001 includes `!isUploading` as a clause.
- **T-VK-HUY-001**: Hủy button + backdrop + Esc → native `window.confirm()` if dirty, then close
- **T-VK-A11Y-001**: Focus trap sentinels; focus-on-open → first empty required field; focus-on-close → trigger ref
- **T-VK-ENTRY-001**: Wire "Viết KUDOS" tile in `QuickActionsFab` + "Viết KUDOS" CTA in Thể lệ page to navigate to `/kudos/new`
- **T-VK-TEST-001**: Write `KudoComposer.spec.tsx` — 6-8 unit scenarios (render, fill, validation error, submit success, submit failure, Hủy confirm)
- **T-VK-TEST-002**: Write `tests/integration/viet-kudo.integration.spec.tsx` — 2-3 integration scenarios (trigger → compose → submit end-to-end with mocked Supabase)

**Gate**: User can compose + send a kudo with only required fields. New kudo appears on `/kudos` Live board after submit.

### PR 3 — Child overlays + validation error state + images

**Scope**: P1 US2 (validation error UI) + P2 US3 (@mention) + P2 US4 (hashtag picker overlay) + P2 US5 (image uploader). P1 items arguably should be in PR 2 but are decoupled enough to land separately.

- **T-VK-VALID-001**: Red borders + inline errors + focus-first-invalid behaviour (US2 / FR-006)
- **T-HP-COMPONENT-001**: `HashtagPicker.tsx` — full implementation per spec `p9zO-c4a4x`. 10 FRs. Consumes `HashtagOption[]` prop.
- **T-HP-WIRING-001**: Wire `HashtagField.tsx` to open `HashtagPicker`; pass `triggerRef`, `options`, `selectedSlugs`, `onToggle`, `onClose`.
- **T-HP-TEST-001**: `HashtagPicker.spec.tsx` — 8-10 unit scenarios (render, toggle, 5-cap, keyboard, loading, empty, error).
- **T-VK-MENTION-001**: Configure `@tiptap/extension-mention` + `@tiptap/suggestion` — wrap `searchSunner` as the suggestion resolver. Render the mention popover with dark-navy family styling.
- **T-VK-IMG-001**: `ImageUploader.tsx` — file input + thumbnails (80 × 80) + Storage upload via `supabase.storage.from('kudo-images').upload(...)` + signed URL for preview via `createSignedUrl(path, 3600)`.
- **T-VK-IMG-002**: Client-side validation — 5 MB / MIME whitelist — reject before calling `.upload()`.
- **T-VK-IMG-003**: Cleanup on Hủy/unmount — best-effort `.remove([paths])`.
- **T-VK-IMG-TEST**: `ImageUploader.spec.tsx` — 5-6 scenarios covering upload success, size reject, MIME reject, removal, cleanup.

**Gate**: User can select hashtags via picker, @mention teammates in body, attach images. Validation surfaces on invalid submit.

### PR 4 — Addlink Box + anonymous + polish

**Scope**: P2 US3 (Addlink) + P3 US6 (anonymous) + motion-safe + axe sweep + SCREENFLOW flip.

- **T-AL-COMPONENT-001**: `AddlinkDialog.tsx` — full implementation per spec `OyDLDuSGEa`. 11 FRs. React Portal. Own backdrop.
- **T-AL-TIPTAP-001**: 3 command variants (insert / wrap-selection / edit-mode) wired through Viết Kudo's editor ref.
- **T-AL-OPEN-001**: Link toolbar button in `EditorToolbar` opens Addlink; passes `initialText` / `initialUrl` / `isEditMode` computed from current selection + active mark.
- **T-AL-TEST-001**: `AddlinkDialog.spec.tsx` — 6-8 unit scenarios.
- **T-VK-ANON-001**: `AnonymousCheckbox.tsx` + wire into form state + pass to `createKudo`.
- **T-VK-MOTION-001**: Audit all transitions in all 6 new components — add `motion-safe:` modifiers everywhere.
- **T-VK-AXE-001**: Run axe-core against `/kudos/new` with modal + each child overlay open. Zero violations required.
- **T-VK-E2E-001**: Write one smoke Playwright spec `tests/e2e/kudos/compose.spec.ts` covering the happy path: sign in → navigate `/kudos` → open compose → fill all required fields → submit → assert new kudo on Live board. Gated on `SUPABASE_TEST_SESSION_TOKEN` env var (existing Kudos E2E convention — see `tests/e2e/kudos/*.spec.ts`). Non-blocking for PR merge if the gate env is not set in CI, but MUST run green locally before PR 4 lands.
- **T-VK-RESPONSIVE-001**: Audit each component against its design-style §Responsive Specifications table. Verify mobile breakpoints: Viết Kudo modal goes full-screen + footer stacks + Lưu on top; Hashtag picker uses 44 px row height (h-11 sm:h-10); Addlink uses `w-full sm:w-[752px]`. No new code expected — just verify the responsive Tailwind classes already specified in design-style are actually applied. Catch any components that forgot responsive prefixes.
- **T-VK-SCREENFLOW-001**: After PR 4 merges, flip rows #7 (Viết Kudo), #11 (Hashtag picker), #14 (Addlink) from 📋 spec'd → 🟢 shipped in SCREENFLOW + append discovery log entry.

**Gate**: All 15 + 10 + 11 = 36 spec FRs honoured. All 6 + 5 + 5 = 16 SCs pass. Axe zero violations on all 3 overlays. Full compose flow ships.

### PR 5 (patch) — Anonymous alias (round 3, 2026-04-21)

**Scope**: Spec round 3 surfaced a Figma requirement missed in earlier reviews — Figma item G ("Gửi ẩn danh") requires an alias text field to appear when the checkbox is ticked. PR 5 is an additive patch that extends the already-shipped `AnonymousCheckbox`; does not break PR 2–4.

- **T-ANON-DB-001**: Write migration `0017_kudo_anonymous_alias.sql` — column + CHECK + view recreate + `CREATE OR REPLACE create_kudo(... p_anonymous_alias text default null)`.
- **T-ANON-DB-002**: Run `make db:reset` (or equivalent) locally to apply 0017; run `yarn test:run` integration to confirm no regression.
- **T-ANON-TYPES-001**: Extend `CreateKudoInput` in `src/types/kudo.ts` with `anonymousAlias: string \| null`. Extend `Database['public']['Functions']['create_kudo']['Args']` in `src/types/database.ts` with `p_anonymous_alias?: string \| null`.
- **T-ANON-SA-001**: Update `createKudo` Server Action in `src/app/kudos/actions.ts` to validate alias (2–40 trimmed Unicode chars when `isAnonymous=true`; null otherwise) and pass `p_anonymous_alias` through to `supabase.rpc("create_kudo", …)`. Matches the DB CHECK for defense-in-depth.
- **T-ANON-UI-001**: Create `src/components/kudos/AnonymousAliasField.tsx` — label 146 px + input h-14 matching RecipientField pattern. Error prop identical API to RecipientField.
- **T-ANON-UI-002**: Extend `KudoComposer` reducer state with `anonymousAlias: string`; reset to `""` whenever `isAnonymous` flips false (pure reducer branch). Render `<AnonymousAliasField />` below `<AnonymousCheckbox />` when `isAnonymous===true`.
- **T-ANON-UI-003**: Extend validation: when `isAnonymous=true`, include `anonymousAlias` in the `errors` map; use keys `compose.fields.anonymousAlias.validation.required` / `.tooLong`.
- **T-ANON-I18N-001**: Add `compose.fields.anonymousAlias` leaves to `src/messages/vi.json` + `en.json` (`label`, `placeholder`, `validation.required`, `validation.tooLong`).
- **T-ANON-TEST-001**: `src/components/kudos/__tests__/AnonymousAliasField.spec.tsx` — visible-only-when-checked, validation messages, maxLength enforcement.
- **T-ANON-TEST-002**: Extend `src/app/kudos/__tests__/createKudo.spec.ts` — alias passes through; empty alias with `isAnonymous=true` returns `{ ok: false }` without calling RPC.
- **T-ANON-TEST-003**: Extend `tests/integration/viet-kudo.integration.spec.tsx` — check anonymous → alias field appears; uncheck → alias field disappears + value reset.
- **T-ANON-LIVE-001** (downstream, out of PR 5 scope but tracked): When Live-board card spec ships its anonymous-rendering contract, honour `anonymous_alias` in place of `display_name` + derive monogram from alias. Flag to Live-board owner.

**Gate**: Anonymous kudo round-trips alias correctly; unchecking discards the alias; validation fires per spec US6 scenarios 1–7; existing tests remain green.

---

## Testing Strategy

| Type | Focus | Estimated scenario count |
|---|---|---|
| **Unit** | Each new component's contract (render, props, interactions) | ~50 scenarios across 6 component test files |
| **Integration** | End-to-end flows within mocked Supabase: trigger → open → fill → submit → success OR error | ~10 scenarios in `tests/integration/viet-kudo.integration.spec.tsx` |
| **Server Action** | `createKudo` happy path + validation failures + RLS rejection simulations | ~8 scenarios in `tests/integration/createKudo.spec.ts` (with mocked Supabase client) |
| **E2E** | **1 smoke spec in PR 4** (T-VK-E2E-001): `tests/e2e/kudos/compose.spec.ts` covering compose → submit happy path. Gated on `SUPABASE_TEST_SESSION_TOKEN` (existing Kudos convention). More critical paths (anonymous, image attach, edit-link) deferred to Phase 2. | 1 critical path at ship; 2-3 more as follow-up |
| **Visual regression** | Manual (`yarn dev` + eyeball against each spec's `assets/frame.png`) — no automated infra today | — |
| **Accessibility** | Axe-core on `/kudos/new` with modal open + each overlay open | Zero violations (SC-004 on all 3 specs) |

**Test file map**:
- `src/components/kudos/__tests__/KudoComposer.spec.tsx`
- `src/components/kudos/__tests__/RecipientField.spec.tsx`
- `src/components/kudos/__tests__/BodyEditor.spec.tsx` (mock TipTap via `vi.mock('@tiptap/react', ...)` at low detail; integration tests cover real TipTap)
- `src/components/kudos/__tests__/HashtagPicker.spec.tsx`
- `src/components/kudos/__tests__/ImageUploader.spec.tsx`
- `src/components/kudos/__tests__/AddlinkDialog.spec.tsx`
- `tests/integration/viet-kudo.integration.spec.tsx`
- `tests/integration/createKudo.spec.ts`

**Mocking patterns** (consistent across files):
- `vi.mock('@/libs/supabase/client', () => ({ createClient: () => mockSupabase }))`
- `vi.mock('@/libs/supabase/server', () => ({ createClient: async () => mockSupabase }))`
- `vi.mock('@/app/kudos/actions', () => ({ createKudo: vi.fn(), searchSunner: vi.fn(), getKudoHashtags: vi.fn() }))`
- `vi.mock('@/libs/analytics/track', () => ({ track: vi.fn() }))`
- Per-test `vi.clearAllMocks()` in `beforeEach`

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **TipTap + React 19 + Next 16 SSR conflict** (`document is not defined` on render) | High — blocks PR 2 | Low — TipTap has Next.js integration docs | Client-only boundary on `BodyEditor.tsx` via `"use client"`; if still breaks, wrap `<EditorContent />` in `dynamic(() => import(...), { ssr: false })` |
| **Intercepting route `@modal` slot fragility** | Medium — degrades UX but standalone page fallback works | Medium (Next.js 16 is new; parallel routes still have edge cases) | Escape to standalone page if T-VK-ROUTE-001 bleeds into day 2 |
| **Storage upload fails silently** due to RLS misconfiguration | High — images never persist | Low — migration 0014 tested locally first | Verify with `supabase db push` + manual upload test before PR 3 lands |
| **Orphan images in Storage** after user cancels | Low (cost / clutter) | Medium (network interruption likely) | Best-effort delete on Hủy/unmount; Phase 2 adds a cron-like cleanup job |
| **`createKudo` multi-insert partial failure** leaves zombie `kudos` rows | High — data integrity | Low if stored function used (atomic); medium if manual multi-insert | Use stored function (migration 0016). Fallback: explicit rollback + test coverage for partial-failure paths |
| **TipTap package size** (~60 KB gz) on the compose route bundle | Low — compose is not a cold-start route | — | Accept. If Lighthouse red, lazy-load TipTap via `dynamic(...)` |
| **Mention popover positioning** without floating-ui | Medium — mispositioning on scroll / viewport edge | Medium | Use manual absolute positioning with viewport clamp; if too hairy, accept floating-ui as a focused dependency (NOT adding TipTap's floating-ui extension — just the core) |
| **Focus-trap edge cases** (nested Addlink within Viết Kudo within page) | Medium — broken keyboard UX | Medium (nested traps are tricky) | Isolate: Viết Kudo disables its trap while Addlink is open (`activeModal` state). Integration tests assert tab cycle inside each active modal. |
| **Anonymous-kudo rendering on Live board** (out of scope here but dependency) | Low — feature half-shipped | Medium — Live-board card spec needs update | Flag for Live-board maintainer in PR 4. Until updated, anonymous kudos simply render with `sender_id` unhidden (non-catastrophic). |
| **Paste-HTML into TipTap** inserts unwanted `<style>` / `<iframe>` | Medium — XSS risk | Low (TipTap default schema strips) | Verify TipTap strips `<script>` / `<iframe>` in a unit test |
| **Stored function `create_kudo` security** — SECURITY DEFINER + SQL injection via text params | High — SQL injection if misused | Low (we use parameterised input) | Review SQL carefully; no dynamic SQL concatenation. Plpgsql's `any()` + `unnest` are parameterised |
| **`SECURITY DEFINER` bypasses RLS on the 4 target tables** | Medium — we correctly bind `sender_id = auth.uid()` inside the function, so the function CAN'T be tricked into attributing kudos to the wrong user. But the function runs as the DB owner, skipping the RLS policies on `kudos`/`kudo_recipients`/`kudo_hashtags`/`kudo_images`. | Low (we don't accept sender_id as a parameter) | Document in T-SETUP-006: the `sender_id` is hard-coded to `auth.uid()` inside the function body (not a parameter), so callers cannot spoof identity. Hashtag slug resolution uses the public `hashtags` table (safe — only filtering). Image paths go through a downstream RLS check via `storage.objects`'s own policies during upload (happens BEFORE createKudo is called). Alternative: switch to `SECURITY INVOKER` — requires extending each table's INSERT RLS policies. Deferred as Phase 2 hardening if needed. |

---

## Open Questions

All prior open questions (Q1-Q4 from spec review) are resolved. No blocking questions for plan-phase implementation.

Minor decisions deferred to task phase (not blockers):

- [x] ~~**Stored function vs manual multi-insert** for `createKudo`~~ — **resolved during review round 2**: stored function is the committed choice (migration 0016 required). `SECURITY DEFINER` with hard-coded `sender_id = auth.uid()` is safe against identity spoofing; see Risk Assessment row for the full analysis.
- [ ] **Intercepting routes vs standalone-only** for `/kudos/new` — recommend intercepting routes with 1-day timebox. Final decision during T-VK-ROUTE-001.
- [ ] **Tiêu chuẩn link stopgap URL** — recommend `/the-le` with `{/* TODO(viet-kudo): real standards page pending */}` comment. Final decision during T-VK-UI.
- [ ] **Title maxlength** — spec says "recommend ≤ 120 chars". Recommend `120` as hard cap. Final decision during T-VK-FIELDS-002.

---

## Cross-references

- **Parent spec**: [spec.md](spec.md)
- **Child spec 1**: [../p9zO-c4a4x-dropdown-list-hashtag/spec.md](../p9zO-c4a4x-dropdown-list-hashtag/spec.md)
- **Child spec 2**: [../OyDLDuSGEa-addlink-box/spec.md](../OyDLDuSGEa-addlink-box/spec.md)
- **Design styles**: [design-style.md](design-style.md) · [Hashtag picker](../p9zO-c4a4x-dropdown-list-hashtag/design-style.md) · [Addlink](../OyDLDuSGEa-addlink-box/design-style.md)
- **SCREENFLOW rows**: #7 (Viết Kudo), #11 (Hashtag picker), #14 (Addlink) — all currently 📋 spec'd
- **Existing code to extend**:
  - [src/app/kudos/actions.ts](../../../src/app/kudos/actions.ts) — append `createKudo`
  - [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx) — add 7 glyphs
  - [src/components/ui/Toaster.tsx](../../../src/components/ui/Toaster.tsx) — reuse for toasts
  - [src/libs/supabase/client.ts](../../../src/libs/supabase/client.ts) — Storage client
  - [src/app/globals.css](../../../src/app/globals.css) — add 3 tokens
