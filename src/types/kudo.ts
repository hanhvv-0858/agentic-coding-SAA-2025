// App-facing domain types for the Sun* Kudos Live board (spec
// MaZUn5xHXZ). Derived from the generated-but-currently-hand-written
// `Database` types in `src/types/database.ts`. Plan.md §Data Layer Plan
// > Type definitions.

import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type HashtagRow = Database["public"]["Tables"]["hashtags"]["Row"];
type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];
type KudoStatsRow = Database["public"]["Views"]["kudos_with_stats"]["Row"];

export type KudoUser = Pick<
  ProfileRow,
  "id" | "display_name" | "avatar_url" | "department_id"
> & {
  /** Department code resolved from the `profiles.department_id` FK
   * join — e.g. "CEVC1", "STVC - EE". Consolidated the former
   * `profiles.honour_code` column (migration 0013 dropped it). */
  department_code: string | null;
  /** Honour tier enum ("Legend Hero", "Rising Hero", "Super Hero",
   * "New Hero"). Widened to `string | null` so raw Supabase payloads
   * type-check; the DB enum enforces the closed set server-side. */
  honour_title: string | null;
};

// Hashtags carry a locale-resolved `label` alongside the canonical
// `slug`. `getKudoHashtags()` picks `label_vi` vs `label_en` based on
// the active locale (migration 0010) — the UI consumes `{ slug, label }`.
export type Hashtag = Pick<HashtagRow, "slug"> & { label: string };

// Departments carry a locale-resolved `label` alongside the canonical
// `code`. The Server Action picks name_vi vs name_en based on active
// locale; the UI only consumes `{ code, label }`.
export type Department = Pick<DepartmentRow, "code"> & { label: string };

export type Kudo = KudoStatsRow & {
  sender: KudoUser;
  recipients: KudoUser[];
  hashtags: Hashtag[];
  has_hearted: boolean;
  /** Up to 5 attachment URLs ordered by `kudo_images.position`. */
  images: string[];
};

export type FeedPage = {
  items: Kudo[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type FilterState = {
  hashtag: string | null;
  department: string | null;
};

export type KudosStats = {
  receivedCount: number;
  sentCount: number;
  heartsReceived: number;
  secretBoxesOpened: number;
  secretBoxesUnopened: number;
};

export type LatestGiftee = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  giftDescription: string;
};

export type SpotlightRecipient = {
  /** Recipient `profiles.id` — used by US10 tooltip trigger to fetch
   *  the profile preview. Optional for backward-compat; post-US10
   *  all payloads include it. */
  id?: string;
  name: string;
  x: number;
  y: number;
  weight: number;
  recentKudo: { time: string; preview: string };
};

// Flat "recent activity feed" rows — one per kudo, global order by
// `kudos.created_at DESC`. Used for the bottom-left "09:00 AM xx đã
// nhận được một Kudos mới" block (spec §B.7 live activity feed).
// Distinct from `SpotlightRecipient.recentKudo` (which is per-person).
export type SpotlightLatestKudo = {
  recipientName: string;
  time: string;
  preview: string;
};

export type HeartToggleResult = {
  id: string;
  heartsCount: number;
  hasHearted: boolean;
  multiplier: 1 | 2;
  reason?: string;
};

// Viết Kudo compose flow (spec ihQ26W78P2) — added in plan T008.

/** Alias of `Hashtag` — the hashtag picker's option prop name per
 * spec `p9zO-c4a4x`. Both refer to `{ slug, label }` locale-resolved. */
export type HashtagOption = Hashtag;

/** Payload accepted by the `createKudo` Server Action. Single-recipient
 * per spec Q1; image paths are Storage paths (not signed URLs) per Q4.
 * `anonymousAlias` is required (2–40 trimmed Unicode chars) when
 * `isAnonymous=true`, and null otherwise — round 3 spec 2026-04-21. */
export type CreateKudoInput = {
  recipientId: string;
  title: string;
  body: string; // TipTap-serialised HTML
  hashtagSlugs: string[]; // 1..5
  imagePaths: string[]; // 0..5, Supabase Storage paths under kudo-images/{userId}/
  isAnonymous: boolean;
  anonymousAlias: string | null;
};

/** Tagged-union result from `createKudo`. */
export type CreateKudoResult =
  | { ok: true; kudoId: string }
  | { ok: false; error: string };
