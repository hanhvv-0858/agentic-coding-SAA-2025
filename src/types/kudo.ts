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
  "id" | "display_name" | "avatar_url" | "department_id" | "honour_code"
> & {
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
  name: string;
  x: number;
  y: number;
  weight: number;
  recentKudo: { time: string; preview: string };
};

export type HeartToggleResult = {
  id: string;
  heartsCount: number;
  hasHearted: boolean;
  multiplier: 1 | 2;
  reason?: string;
};
