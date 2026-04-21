"use server";

// Server Action skeletons for the Sun* Kudos Live board (spec
// MaZUn5xHXZ). Each action signature matches plan.md §Data Layer Plan >
// Server Action signatures. Phase 2 ships stubs only — real Supabase
// queries land in the user-story phases (US1/US2/US5/US6/US8).
//
// Every action begins with `await createClient()` from
// `@/libs/supabase/server` (cookie-aware, RLS honoured per caller) so
// the session boundary is in place today even though the queries are
// stubbed.

import { revalidatePath } from "next/cache";
import { createClient } from "@/libs/supabase/server";
import { getLocale } from "@/libs/i18n/getMessages";
import type {
  Department,
  FeedPage,
  FilterState,
  Hashtag,
  HeartToggleResult,
  Kudo,
  KudoUser,
  KudosStats,
  LatestGiftee,
  SpotlightRecipient,
} from "@/types/kudo";

// --------------------------------------------------------------------
// Feed + highlight (US1, US6)
// --------------------------------------------------------------------

// Default feed page size per FR-004.
const FEED_PAGE_SIZE = 10;

export async function getKudoFeed(
  filters: FilterState,
  cursor?: string | null,
): Promise<FeedPage> {
  const supabase = await createClient();
  const locale = await getLocale();

  // Base SELECT joins kudos_with_stats → profiles (sender + recipients)
  // + kudo_hashtags → hashtags. `has_hearted` is computed post-query
  // via a single IN() lookup on `kudo_hearts` (simpler than embedding
  // it in the view — works with RLS + Workers-friendly).
  // Hashtag filter (FR-006 / US2): resolve the slug to a set of
  // matching `kudo_id`s via the junction table in a pre-query, then
  // narrow the main query with `.in("id", matchingIds)`. PostgREST's
  // nested `.eq("kudo_hashtags.hashtags.slug", ...)` syntax does NOT
  // prune parent rows — it only narrows the embedded array — so a
  // two-step approach is required for a truly server-filtered result.
  let hashtagKudoIds: string[] | null = null;
  if (filters.hashtag) {
    const { data: hashtagRow, error: hashtagErr } = await supabase
      .from("hashtags")
      .select("id")
      .eq("slug", filters.hashtag)
      .maybeSingle();
    if (hashtagErr) {
      throw new Error(`getKudoFeed: ${hashtagErr.message}`);
    }
    if (!hashtagRow) {
      return { items: [], nextCursor: null, hasMore: false };
    }
    const { data: junctionRows, error: junctionErr } = await supabase
      .from("kudo_hashtags")
      .select("kudo_id")
      .eq("hashtag_id", hashtagRow.id);
    if (junctionErr) {
      throw new Error(`getKudoFeed: ${junctionErr.message}`);
    }
    hashtagKudoIds = (junctionRows ?? []).map((r) => r.kudo_id);
    if (hashtagKudoIds.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }
  }

  // Department filter (FR-007 / US3): resolve the code to a set of
  // `sender_id`s via `profiles.department_id` and narrow the main
  // query with `.in("sender_id", matchingIds)`. Mirrors the hashtag
  // strategy — PostgREST can't prune parent rows from nested filters
  // over the `sender → departments` relation reliably on views.
  let departmentSenderIds: string[] | null = null;
  if (filters.department) {
    const { data: deptRow, error: deptErr } = await supabase
      .from("departments")
      .select("id")
      .eq("code", filters.department)
      .maybeSingle();
    if (deptErr) {
      throw new Error(`getKudoFeed: ${deptErr.message}`);
    }
    if (!deptRow) {
      return { items: [], nextCursor: null, hasMore: false };
    }
    const { data: profileRows, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("department_id", deptRow.id);
    if (profileErr) {
      throw new Error(`getKudoFeed: ${profileErr.message}`);
    }
    departmentSenderIds = (profileRows ?? []).map((r) => r.id);
    if (departmentSenderIds.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }
  }

  let query = supabase
    .from("kudos_with_stats")
    .select(
      `id, body, title, created_at, sender_id, hearts_count,
       sender:profiles!sender_id ( id, display_name, avatar_url, department_id, honour_title, department:departments!department_id ( code ) ),
       kudo_recipients ( recipient:profiles!recipient_id ( id, display_name, avatar_url, department_id, honour_title, department:departments!department_id ( code ) ) ),
       kudo_hashtags ( hashtags ( id, slug, label_vi, label_en ) ),
       kudo_images ( url, position )`,
    )
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (cursor) query = query.lt("created_at", cursor);
  if (hashtagKudoIds) query = query.in("id", hashtagKudoIds);
  if (departmentSenderIds) query = query.in("sender_id", departmentSenderIds);

  const { data, error } = await query;
  if (error) {
    throw new Error(`getKudoFeed: ${error.message}`);
  }
  const rows = data ?? [];

  // Compute `has_hearted` for the current user. Non-auth callers
  // already hit the `/login` redirect in page.tsx, so `user` is
  // expected but we still guard.
  let heartedIds: Set<string> = new Set();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && rows.length > 0) {
    const kudoIds = rows.map((r: { id: string | null }) => r.id).filter(
      (id): id is string => typeof id === "string",
    );
    const { data: hearts } = await supabase
      .from("kudo_hearts")
      .select("kudo_id")
      .eq("user_id", user.id)
      .in("kudo_id", kudoIds);
    heartedIds = new Set((hearts ?? []).map((h) => h.kudo_id));
  }

  // The generated `Database` types model embedded relations as arrays
  // (even !inner single-row joins) so we normalise via a local shape
  // that accepts `X | X[] | null` and picks the first element.
  type MaybeRelated<T> = T | T[] | null | undefined;
  type RelatedProfile = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    department_id: string | null;
    honour_title: string | null;
    department: { code: string } | { code: string }[] | null;
  };
  type RelatedHashtag = { id: string; slug: string; label_vi: string; label_en: string };
  type RelatedImage = { url: string; position: number };
  type RawRow = {
    id: string | null;
    body: string | null;
    title: string | null;
    created_at: string | null;
    sender_id: string | null;
    hearts_count: number | null;
    sender: MaybeRelated<RelatedProfile>;
    kudo_recipients:
      | { recipient: MaybeRelated<RelatedProfile> }[]
      | null
      | undefined;
    kudo_hashtags:
      | { hashtags: MaybeRelated<RelatedHashtag> }[]
      | null
      | undefined;
    kudo_images: RelatedImage[] | null | undefined;
  };
  const pickOne = <T,>(v: MaybeRelated<T>): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

  const typedRows = rows as unknown as RawRow[];

  // Hashtag + department filters are now applied server-side (see
  // pre-query `.in()` narrowing above); rows here are already final.
  const items = typedRows.map((r) => {
    const senderProfile = pickOne(r.sender);
    const orderedImages = [...(r.kudo_images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url);
    return {
      id: r.id ?? "",
      body: r.body,
      title: r.title,
      created_at: r.created_at,
      sender_id: r.sender_id,
      hearts_count: r.hearts_count,
      sender: senderProfile
        ? {
            id: senderProfile.id,
            display_name: senderProfile.display_name,
            avatar_url: senderProfile.avatar_url,
            department_id: senderProfile.department_id,
            department_code: pickOne(senderProfile.department)?.code ?? null,
            honour_title: senderProfile.honour_title,
          }
        : {
            id: r.sender_id ?? "",
            display_name: null,
            avatar_url: null,
            department_id: null,
            department_code: null,
            honour_title: null,
          },
      recipients: (r.kudo_recipients ?? [])
        .map((kr) => pickOne(kr.recipient))
        .filter((p): p is RelatedProfile => !!p)
        .map((p) => ({
          id: p.id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          department_id: p.department_id,
          department_code: pickOne(p.department)?.code ?? null,
          honour_title: p.honour_title,
        })),
      hashtags: (r.kudo_hashtags ?? [])
        .map((kh) => pickOne(kh.hashtags))
        .filter((h): h is RelatedHashtag => !!h)
        .map((h) => ({
          slug: h.slug,
          label: locale === "en" ? h.label_en : h.label_vi,
        })),
      images: orderedImages,
      has_hearted: heartedIds.has(r.id ?? ""),
    };
  });

  const last = items[items.length - 1];
  const nextCursor =
    rows.length === FEED_PAGE_SIZE && last?.created_at ? last.created_at : null;

  return {
    items,
    nextCursor,
    hasMore: nextCursor !== null,
  };
}

// Highlight carousel size — top 5 by hearts_count per FR-015.
const HIGHLIGHT_LIMIT = 5;

export async function getHighlightKudos(
  filters: FilterState,
): Promise<Kudo[]> {
  const supabase = await createClient();
  const locale = await getLocale();

  // Mirror getKudoFeed's filter-pre-query strategy (server-side slug
  // → kudo_ids / code → sender_ids narrowing). Keeps the carousel
  // in lock-step with the feed so US3 Acceptance #1 holds.
  let hashtagKudoIds: string[] | null = null;
  if (filters.hashtag) {
    const { data: hashtagRow, error: hashtagErr } = await supabase
      .from("hashtags")
      .select("id")
      .eq("slug", filters.hashtag)
      .maybeSingle();
    if (hashtagErr) {
      throw new Error(`getHighlightKudos: ${hashtagErr.message}`);
    }
    if (!hashtagRow) return [];
    const { data: junctionRows, error: junctionErr } = await supabase
      .from("kudo_hashtags")
      .select("kudo_id")
      .eq("hashtag_id", hashtagRow.id);
    if (junctionErr) {
      throw new Error(`getHighlightKudos: ${junctionErr.message}`);
    }
    hashtagKudoIds = (junctionRows ?? []).map((r) => r.kudo_id);
    if (hashtagKudoIds.length === 0) return [];
  }

  let departmentSenderIds: string[] | null = null;
  if (filters.department) {
    const { data: deptRow, error: deptErr } = await supabase
      .from("departments")
      .select("id")
      .eq("code", filters.department)
      .maybeSingle();
    if (deptErr) {
      throw new Error(`getHighlightKudos: ${deptErr.message}`);
    }
    if (!deptRow) return [];
    const { data: profileRows, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("department_id", deptRow.id);
    if (profileErr) {
      throw new Error(`getHighlightKudos: ${profileErr.message}`);
    }
    departmentSenderIds = (profileRows ?? []).map((r) => r.id);
    if (departmentSenderIds.length === 0) return [];
  }

  let query = supabase
    .from("kudos_with_stats")
    .select(
      `id, body, title, created_at, sender_id, hearts_count,
       sender:profiles!sender_id ( id, display_name, avatar_url, department_id, honour_title, department:departments!department_id ( code ) ),
       kudo_recipients ( recipient:profiles!recipient_id ( id, display_name, avatar_url, department_id, honour_title, department:departments!department_id ( code ) ) ),
       kudo_hashtags ( hashtags ( id, slug, label_vi, label_en ) ),
       kudo_images ( url, position )`,
    )
    .order("hearts_count", { ascending: false })
    .limit(HIGHLIGHT_LIMIT);

  if (hashtagKudoIds) query = query.in("id", hashtagKudoIds);
  if (departmentSenderIds) query = query.in("sender_id", departmentSenderIds);

  const { data, error } = await query;
  if (error) {
    throw new Error(`getHighlightKudos: ${error.message}`);
  }
  const rows = data ?? [];

  // has_hearted enrichment — same single IN() lookup pattern.
  let heartedIds: Set<string> = new Set();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && rows.length > 0) {
    const kudoIds = rows
      .map((r: { id: string | null }) => r.id)
      .filter((id): id is string => typeof id === "string");
    const { data: hearts } = await supabase
      .from("kudo_hearts")
      .select("kudo_id")
      .eq("user_id", user.id)
      .in("kudo_id", kudoIds);
    heartedIds = new Set((hearts ?? []).map((h) => h.kudo_id));
  }

  type MaybeRelated<T> = T | T[] | null | undefined;
  type RelatedProfile = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    department_id: string | null;
    honour_title: string | null;
    department: { code: string } | { code: string }[] | null;
  };
  type RelatedHashtag = { id: string; slug: string; label_vi: string; label_en: string };
  type RelatedImage = { url: string; position: number };
  type RawRow = {
    id: string | null;
    body: string | null;
    title: string | null;
    created_at: string | null;
    sender_id: string | null;
    hearts_count: number | null;
    sender: MaybeRelated<RelatedProfile>;
    kudo_recipients:
      | { recipient: MaybeRelated<RelatedProfile> }[]
      | null
      | undefined;
    kudo_hashtags:
      | { hashtags: MaybeRelated<RelatedHashtag> }[]
      | null
      | undefined;
    kudo_images: RelatedImage[] | null | undefined;
  };
  const pickOne = <T,>(v: MaybeRelated<T>): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

  const typedRows = rows as unknown as RawRow[];

  return typedRows.map((r) => {
    const senderProfile = pickOne(r.sender);
    const orderedImages = [...(r.kudo_images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url);
    return {
      id: r.id ?? "",
      body: r.body,
      title: r.title,
      created_at: r.created_at,
      sender_id: r.sender_id,
      hearts_count: r.hearts_count,
      sender: senderProfile
        ? {
            id: senderProfile.id,
            display_name: senderProfile.display_name,
            avatar_url: senderProfile.avatar_url,
            department_id: senderProfile.department_id,
            department_code: pickOne(senderProfile.department)?.code ?? null,
            honour_title: senderProfile.honour_title,
          }
        : {
            id: r.sender_id ?? "",
            display_name: null,
            avatar_url: null,
            department_id: null,
            department_code: null,
            honour_title: null,
          },
      recipients: (r.kudo_recipients ?? [])
        .map((kr) => pickOne(kr.recipient))
        .filter((p): p is RelatedProfile => !!p)
        .map((p) => ({
          id: p.id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          department_id: p.department_id,
          department_code: pickOne(p.department)?.code ?? null,
          honour_title: p.honour_title,
        })),
      hashtags: (r.kudo_hashtags ?? [])
        .map((kh) => pickOne(kh.hashtags))
        .filter((h): h is RelatedHashtag => !!h)
        .map((h) => ({
          slug: h.slug,
          label: locale === "en" ? h.label_en : h.label_vi,
        })),
      images: orderedImages,
      has_hearted: heartedIds.has(r.id ?? ""),
    };
  });
}

// --------------------------------------------------------------------
// Heart toggle (US4)
// --------------------------------------------------------------------

export async function toggleKudoHeart(
  id: string,
  action: "add" | "remove",
): Promise<HeartToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  // Defensive: users whose account predates the `on_auth_user_created`
  // trigger (migration 0004) can be missing a `profiles` row, which
  // breaks the `kudo_hearts.user_id` FK. Upsert before writing so the
  // action is self-healing. `select("id").maybeSingle()` keeps the
  // round-trip cheap; only inserts when no row exists.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!existingProfile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Sunner";
    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ?? null;
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      display_name: fullName,
      avatar_url: avatarUrl,
    });
    if (profileErr && !profileErr.message.includes("duplicate")) {
      throw new Error(`toggleKudoHeart: profile backfill failed: ${profileErr.message}`);
    }
  }

  if (action === "add") {
    // Idempotent per TR-006: composite PK (kudo_id, user_id) makes
    // the insert a no-op if a row already exists. `.upsert` with
    // `ignoreDuplicates` maps cleanly to `INSERT ... ON CONFLICT DO
    // NOTHING`. RLS ensures `user_id` MUST match `auth.uid()` — the
    // server does not trust the client-supplied user id.
    const { error } = await supabase
      .from("kudo_hearts")
      .upsert(
        { kudo_id: id, user_id: user.id },
        { onConflict: "kudo_id,user_id", ignoreDuplicates: true },
      );
    if (error) {
      throw new Error(`toggleKudoHeart: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from("kudo_hearts")
      .delete()
      .eq("kudo_id", id)
      .eq("user_id", user.id);
    if (error) {
      throw new Error(`toggleKudoHeart: ${error.message}`);
    }
  }

  // Re-read `kudos_with_stats` for the authoritative count. In the
  // rare race where the view lags, surface the action's presumed
  // state rather than crashing the UI.
  const { data: statsRow } = await supabase
    .from("kudos_with_stats")
    .select("hearts_count")
    .eq("id", id)
    .maybeSingle();

  // Double-check hasHearted against the junction table (handles
  // cross-tab races where another session undid the action).
  const { data: heartRow } = await supabase
    .from("kudo_hearts")
    .select("kudo_id")
    .eq("kudo_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Post-mutation cache invalidation for any RSC served from `/kudos`
  // so a subsequent SSR render sees the new heart count on reload.
  revalidatePath("/kudos");

  // Multiplier: Q13 default — server reserved for a future "special
  // day" admin flag. Ships as `1` today; bump to `2` when the flag is
  // introduced (out of scope for Phase 5).
  return {
    id,
    heartsCount: statsRow?.hearts_count ?? 0,
    hasHearted: Boolean(heartRow),
    multiplier: 1,
  };
}

// --------------------------------------------------------------------
// Filters (US2, US3)
// --------------------------------------------------------------------

export async function getKudoHashtags(): Promise<Hashtag[]> {
  const supabase = await createClient();
  // Locale-resolve the display label (spec JWpsISMAaM FR-010).
  // Mirrors the `getKudoDepartments()` pattern below.
  const locale = await getLocale();
  const labelCol = locale === "en" ? "label_en" : "label_vi";
  const { data, error } = await supabase
    .from("hashtags")
    .select(`slug, label_vi, label_en`)
    .order(labelCol, { ascending: true });
  if (error) {
    throw new Error(`getKudoHashtags: ${error.message}`);
  }
  return (data ?? []).map((r) => ({
    slug: r.slug,
    label: locale === "en" ? r.label_en : r.label_vi,
  }));
}

export async function getKudoDepartments(): Promise<Department[]> {
  const supabase = await createClient();
  const locale = await getLocale();
  const labelCol = locale === "en" ? "name_en" : "name_vi";
  const { data, error } = await supabase
    .from("departments")
    .select(`code, name_vi, name_en`)
    .order(labelCol, { ascending: true });
  if (error) {
    throw new Error(`getKudoDepartments: ${error.message}`);
  }
  return (data ?? []).map((r) => ({
    code: r.code,
    label: locale === "en" ? r.name_en : r.name_vi,
  }));
}

// --------------------------------------------------------------------
// Sunner search (US8 — composer hand-off)
// --------------------------------------------------------------------

export async function searchSunner(query: string): Promise<KudoUser[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const supabase = await createClient();

  // Escape `%` and `_` (LIKE wildcards) so user input doesn't grant
  // broader matching than intended. Fuzzy match via ILIKE '%q%'.
  const sanitised = trimmed.replace(/[\\%_]/g, (c) => `\\${c}`);
  const pattern = `%${sanitised}%`;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, department_id, honour_title, department:departments!department_id ( code )",
    )
    .ilike("display_name", pattern)
    .order("display_name", { ascending: true })
    .limit(10);
  if (error) {
    throw new Error(`searchSunner: ${error.message}`);
  }
  type Row = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    department_id: string | null;
    honour_title: string | null;
    department: { code: string } | { code: string }[] | null;
  };
  const pickOne = <T,>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    department_id: row.department_id,
    department_code: pickOne(row.department)?.code ?? null,
    honour_title: row.honour_title,
  }));
}

// --------------------------------------------------------------------
// Spotlight board (US6)
// --------------------------------------------------------------------

// Deterministic 0–1 layout derived from the user_id hash so names keep
// their position across refreshes (TR-012 — coords precomputed server
// side). Padded to `[0.06, 0.94]` so labels never clip the panel edge.
function hashToUnit(input: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const normalised = ((h >>> 0) % 10_000) / 10_000;
  return 0.06 + normalised * 0.88;
}

export async function getSpotlight(): Promise<{
  total: number;
  recipients: SpotlightRecipient[];
}> {
  const supabase = await createClient();

  // Aggregate DISTINCT recipient profiles from `kudo_recipients`. Join
  // `profiles` for display_name/avatar_url + `kudos` for the most
  // recent kudo timestamp per recipient (used for the hover-tooltip
  // `recentKudo` preview). We post-aggregate in JS: the single query
  // returns at most N*K rows (K = kudos received) which is cheap for
  // the expected <= ~500 rows.
  const { data, error } = await supabase
    .from("kudo_recipients")
    .select(
      `recipient_id,
       recipient:profiles!recipient_id ( id, display_name ),
       kudo:kudos!kudo_id ( id, created_at, body )`,
    );
  if (error) {
    throw new Error(`getSpotlight: ${error.message}`);
  }
  const rows = data ?? [];

  type MaybeRelated<T> = T | T[] | null | undefined;
  type RowShape = {
    recipient_id: string;
    recipient: MaybeRelated<{ id: string; display_name: string | null }>;
    kudo: MaybeRelated<{ id: string; created_at: string | null; body: string | null }>;
  };
  const pickOne = <T,>(v: MaybeRelated<T>): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  const typed = rows as unknown as RowShape[];

  // Group by recipient_id, counting kudos + tracking most-recent.
  type Aggregate = {
    id: string;
    name: string;
    weight: number;
    latestAt: string;
    latestPreview: string;
  };
  const byId = new Map<string, Aggregate>();
  for (const row of typed) {
    const recipient = pickOne(row.recipient);
    const kudo = pickOne(row.kudo);
    if (!recipient) continue;
    const name = recipient.display_name?.trim() || "Sunner";
    const at = kudo?.created_at ?? "";
    const prev = byId.get(row.recipient_id);
    if (!prev) {
      byId.set(row.recipient_id, {
        id: row.recipient_id,
        name,
        weight: 1,
        latestAt: at,
        latestPreview: (kudo?.body ?? "").slice(0, 80),
      });
    } else {
      prev.weight += 1;
      if (at > prev.latestAt) {
        prev.latestAt = at;
        prev.latestPreview = (kudo?.body ?? "").slice(0, 80);
      }
    }
  }

  const recipients: SpotlightRecipient[] = Array.from(byId.values())
    .sort((a, b) => (b.weight - a.weight) || a.name.localeCompare(b.name))
    .map((a) => ({
      name: a.name,
      x: hashToUnit(a.id, 0x9e3779b1),
      y: hashToUnit(a.id, 0x7f4a7c15),
      weight: a.weight,
      recentKudo: {
        time: a.latestAt,
        preview: a.latestPreview,
      },
    }));

  // Total kudos = sum of all kudo_recipients rows (FR-015 live counter).
  return { total: rows.length, recipients };
}

// Alias exported for spec-table traceability (spec §API Dependencies
// references both names; plan.md normalises to `getSpotlight`).
export async function getSpotlightRecipients(): Promise<{
  total: number;
  recipients: SpotlightRecipient[];
}> {
  return getSpotlight();
}

// --------------------------------------------------------------------
// Sidebar personal stats (US7)
// --------------------------------------------------------------------

export async function getMyKudosStats(): Promise<KudosStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emptyStats: KudosStats = {
    receivedCount: 0,
    sentCount: 0,
    heartsReceived: 0,
    secretBoxesOpened: 0,
    secretBoxesUnopened: 0,
  };
  if (!user) return emptyStats;

  // sent_count: total rows in `kudos` authored by this user.
  const sentRes = await supabase
    .from("kudos")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id);
  const sentCount = sentRes.count ?? 0;

  // received_count: DISTINCT kudos where this user is a recipient. A
  // single kudo may have multiple recipients, but a recipient appears
  // at most once per kudo, so a plain COUNT(*) over `kudo_recipients`
  // filtered by recipient_id equals the DISTINCT kudo count.
  const recvRes = await supabase
    .from("kudo_recipients")
    .select("kudo_id", { count: "exact", head: true })
    .eq("recipient_id", user.id);
  const receivedCount = recvRes.count ?? 0;

  // hearts_received: sum of hearts_count over kudos authored by this
  // user. `kudos_with_stats` exposes `hearts_count` so this is a
  // single round-trip. Aggregation is client-side (JS) since
  // PostgREST's `sum` helper isn't available on views.
  const heartsRes = await supabase
    .from("kudos_with_stats")
    .select("hearts_count")
    .eq("sender_id", user.id);
  const heartsReceived = (heartsRes.data ?? []).reduce(
    (sum, row) => sum + (row.hearts_count ?? 0),
    0,
  );

  // secret_boxes (§D.1 FR-010): one row per awarded box; `opened_at`
  // NULL → unopened, NOT NULL → opened. Two COUNT(*) round-trips with
  // `head: true` so no row bodies return over the wire.
  const openedRes = await supabase
    .from("secret_boxes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("opened_at", "is", null);
  const unopenedRes = await supabase
    .from("secret_boxes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("opened_at", null);

  return {
    receivedCount,
    sentCount,
    heartsReceived,
    secretBoxesOpened: openedRes.count ?? 0,
    secretBoxesUnopened: unopenedRes.count ?? 0,
  };
}

export async function getLatestGiftees(
  limit = 10,
): Promise<LatestGiftee[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // §D.3 — org-wide ledger of the most recent Secret Box prize
  // redemptions. Source of truth is `gift_redemptions` (migration
  // 0005). Each row is one redemption event; we JOIN the winner's
  // profile for avatar + display name.
  const { data, error } = await supabase
    .from("gift_redemptions")
    .select(
      `id, gift_name, quantity, redeemed_at,
       recipient:profiles!user_id ( id, display_name, avatar_url )`,
    )
    .order("redeemed_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(`getLatestGiftees: ${error.message}`);
  }

  type MaybeRelated<T> = T | T[] | null | undefined;
  type Recipient = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  type RawRow = {
    id: string;
    gift_name: string;
    quantity: number;
    redeemed_at: string;
    recipient: MaybeRelated<Recipient>;
  };
  const pickOne = <T,>(v: MaybeRelated<T>): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

  const locale = await getLocale();
  const template =
    locale === "en"
      ? "Received {quantity} {gift}"
      : "Nhận được {quantity} {gift}";

  const out: LatestGiftee[] = [];
  for (const row of (data ?? []) as unknown as RawRow[]) {
    const p = pickOne(row.recipient);
    if (!p) continue;
    const giftDescription = template
      .replace("{quantity}", String(row.quantity))
      .replace("{gift}", row.gift_name);
    out.push({
      id: row.id,
      displayName: p.display_name ?? "Sunner",
      avatarUrl: p.avatar_url,
      giftDescription,
    });
  }
  return out;
}
