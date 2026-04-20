/**
 * scripts/seed-kudos-fixtures.ts
 * ---------------------------------------------------------------------
 * Idempotent local-dev seeder for the Sun* Kudos Live board (Phase 3
 * fixtures). The base `supabase/seed.sql` only ships 6 departments +
 * 10 hashtags; this script layers on top:
 *
 *   1. Creates 8 fixture `auth.users` via the Admin API (idempotent by
 *      email — existing users are re-used).
 *   2. Relies on the `on_auth_user_created` trigger to populate
 *      `profiles` rows; then backfills `display_name` / `department_id`
 *      / `avatar_url` so each fixture user has a deterministic shape.
 *   3. Inserts ~30 sample kudos spread across the 8 users, tagged with
 *      a mix of hashtags, with varied `created_at` so the feed has
 *      realistic ordering. Each kudo gets 1–2 recipients + 0–3 hearts.
 *
 * Run:
 *   yarn tsx scripts/seed-kudos-fixtures.ts
 *
 * Env vars required (read from .env.local by default — the script
 * explicitly loads it so you don't need `dotenv -e`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotency: re-running the script is a no-op on second run — users
 * are matched by email, kudos by a deterministic `external_ref` prefix
 * encoded in the body (`[fixture#N]`) so duplicates are skipped.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// -------- env loader --------------------------------------------------

function loadDotenv(path: string): void {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local optional — CI may inject via other means.
  }
}

loadDotenv(resolve(process.cwd(), ".env.local"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY " +
      "— make sure .env.local is populated (see .env.example).",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// -------- fixture data -----------------------------------------------

const FIXTURE_USERS = [
  { email: "alice@kudos.test",  displayName: "Alice Nguyen",  deptCode: "SVN-ENG" },
  { email: "bob@kudos.test",    displayName: "Bob Tran",      deptCode: "SVN-DES" },
  { email: "charlie@kudos.test",displayName: "Charlie Le",    deptCode: "SVN-PM"  },
  { email: "diana@kudos.test",  displayName: "Diana Pham",    deptCode: "SVN-QA"  },
  { email: "ethan@kudos.test",  displayName: "Ethan Vo",      deptCode: "SVN-BIZ" },
  { email: "fiona@kudos.test",  displayName: "Fiona Bui",     deptCode: "SVN-HR"  },
  { email: "george@kudos.test", displayName: "George Hoang",  deptCode: "SVN-ENG" },
  { email: "hanna@kudos.test",  displayName: "Hanna Do",      deptCode: "SVN-DES" },
] as const;

const SAMPLE_BODIES = [
  "Cảm ơn bạn đã hỗ trợ mình pair-programming cả buổi chiều. Code review thần tốc!",
  "Thank you for mentoring me through the Supabase migration — it saved our sprint.",
  "Bạn đã chuẩn bị design review rất kỹ lưỡng, cả team học được rất nhiều.",
  "Shoutout for staying late to help ship the hotfix — real teamwork.",
  "Cảm ơn vì luôn onboard người mới rất nhiệt tình!",
  "Your attention to detail on the QA pass caught a blocker we all missed.",
  "Tinh thần chủ động fix prod issue của bạn cực đáng quý.",
  "Appreciate the super-clear docs you wrote for the deploy flow.",
  "Cảm ơn sếp đã unblock rất nhanh khi đội cần review urgent.",
  "You made the client demo feel effortless today — thank you!",
];

const HASHTAG_SLUGS = [
  "dedicated",
  "creative",
  "teamwork",
  "mentor",
  "ontime",
  "leadership",
  "innovation",
  "customer-first",
  "wellness",
  "fun",
];

// -------- helpers ----------------------------------------------------

type Dept = { id: string; code: string };
type Hashtag = { id: string; slug: string };
type Profile = { id: string; email: string; display_name: string | null };

async function ensureFixtureUser(
  email: string,
  displayName: string,
): Promise<string> {
  // Try to find an existing auth user by email — the Admin API has
  // `listUsers` which is paginated; we do a single page scan (we only
  // ever insert 8 fixture users so it's fine).
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(`listUsers: ${listErr.message}`);
  const existing = list.users.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "fixture-password-not-for-prod",
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (error || !data.user) {
    throw new Error(`createUser(${email}): ${error?.message ?? "no user"}`);
  }
  return data.user.id;
}

const HONOUR_CODES = ["CECV10", "CECV07", "CECV05", "CECV12", "CECV03"] as const;
const HONOUR_TITLES = [
  "Legend Hero",
  "Rising Hero",
  "Super Hero",
  "New Hero",
] as const;

function hashIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h) % modulo;
}

async function backfillProfile(
  userId: string,
  displayName: string,
  deptCode: string,
  depts: Dept[],
): Promise<void> {
  const dept = depts.find((d) => d.code === deptCode);
  const honourCode = HONOUR_CODES[hashIndex(userId, HONOUR_CODES.length)];
  const honourTitle = HONOUR_TITLES[hashIndex(userId, HONOUR_TITLES.length)];
  const { error } = await admin
    .from("profiles")
    .update({
      display_name: displayName,
      department_id: dept?.id ?? null,
      honour_code: honourCode,
      honour_title: honourTitle,
    })
    .eq("id", userId);
  if (error) {
    // If the profile row doesn't exist yet (trigger race), upsert it.
    await admin.from("profiles").upsert({
      id: userId,
      email: `${displayName.toLowerCase().replace(/\s+/g, ".")}@kudos.test`,
      display_name: displayName,
      department_id: dept?.id ?? null,
      honour_code: honourCode,
      honour_title: honourTitle,
    });
  }
}

async function kudoExists(senderId: string, body: string): Promise<boolean> {
  const { data, error } = await admin
    .from("kudos")
    .select("id")
    .eq("sender_id", senderId)
    .eq("body", body)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

async function seedKudos(
  profiles: Profile[],
  hashtags: Hashtag[],
): Promise<void> {
  const now = Date.now();
  let inserted = 0;
  let skipped = 0;

  const KUDO_TITLES = [
    "IDOL GIỚI TRẺ",
    "NGƯỜI ĐỒNG ĐỘI",
    "CHIẾN BINH PROJECT",
    "NGÔI SAO SÁNG",
    "GUARDIAN ANGEL",
  ];
  const SAMPLE_IMAGE_URLS = [
    "/images/awards/mvp.png",
    "/images/awards/top-talent.png",
    "/images/awards/top-project.png",
    "/images/awards/best-manager.png",
    "/images/awards/top-project-leader.png",
  ];

  for (let i = 0; i < 30; i++) {
    const sender = profiles[i % profiles.length];
    const body = `[fixture#${i}] ${SAMPLE_BODIES[i % SAMPLE_BODIES.length]}`;
    if (await kudoExists(sender.id, body)) {
      skipped++;
      continue;
    }

    // created_at spread across the last 7 days, 1 hour apart.
    const createdAt = new Date(now - i * 60 * 60 * 1000 * 5).toISOString();
    const title = KUDO_TITLES[i % KUDO_TITLES.length];

    const { data: inserted_, error } = await admin
      .from("kudos")
      .insert({ sender_id: sender.id, body, title, created_at: createdAt })
      .select("id")
      .single();
    if (error || !inserted_) {
      console.error(`kudos insert failed: ${error?.message}`);
      continue;
    }
    const kudoId = inserted_.id;

    // 1–2 recipients (exclude the sender).
    const others = profiles.filter((p) => p.id !== sender.id);
    const recipients: string[] = [others[i % others.length].id];
    if (i % 3 === 0) {
      const second = others[(i + 1) % others.length].id;
      if (second !== recipients[0]) recipients.push(second);
    }
    await admin.from("kudo_recipients").insert(
      recipients.map((rid) => ({ kudo_id: kudoId, recipient_id: rid })),
    );

    // 1–3 hashtags from the rotating slug list.
    const tagSlugs = [
      HASHTAG_SLUGS[i % HASHTAG_SLUGS.length],
      HASHTAG_SLUGS[(i + 3) % HASHTAG_SLUGS.length],
    ];
    if (i % 4 === 0) tagSlugs.push(HASHTAG_SLUGS[(i + 5) % HASHTAG_SLUGS.length]);
    const uniqueTagSlugs = Array.from(new Set(tagSlugs));
    const tagIds = uniqueTagSlugs
      .map((slug) => hashtags.find((h) => h.slug === slug)?.id)
      .filter((id): id is string => typeof id === "string");
    if (tagIds.length > 0) {
      await admin.from("kudo_hashtags").insert(
        tagIds.map((hashtag_id) => ({ kudo_id: kudoId, hashtag_id })),
      );
    }

    // 0–3 hearts from random other users (excluding the sender).
    const heartCount = i % 4;
    const heartUsers = others
      .slice(0, heartCount)
      .map((u) => ({ kudo_id: kudoId, user_id: u.id }));
    if (heartUsers.length > 0) {
      await admin.from("kudo_hearts").insert(heartUsers);
    }

    // Attach 0–3 images on every 3rd kudo so the feed shows both
    // "with images" and "text-only" variants in demo data.
    if (i % 3 === 0) {
      const count = 1 + (i % 3);
      const imageRows = Array.from({ length: count }, (_, pos) => ({
        kudo_id: kudoId,
        url: SAMPLE_IMAGE_URLS[(i + pos) % SAMPLE_IMAGE_URLS.length],
        position: pos,
      }));
      const { error: imgErr } = await admin.from("kudo_images").insert(imageRows);
      if (imgErr) {
        console.error(`kudo_images insert failed: ${imgErr.message}`);
      }
    }

    inserted++;
  }
  console.log(`Kudos seeded: ${inserted} new, ${skipped} already present.`);
}

async function seedSecretBoxes(profiles: Profile[]): Promise<void> {
  // Give each fixture Sunner 3 secret boxes — 2 unopened, 1 opened —
  // so the sidebar stats block has real data. Idempotent: skip if the
  // user already owns ≥ 3 boxes.
  let inserted = 0;
  let skipped = 0;
  for (const p of profiles) {
    const { count } = await admin
      .from("secret_boxes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", p.id);
    if ((count ?? 0) >= 3) {
      skipped++;
      continue;
    }
    const now = Date.now();
    const rows = [
      { user_id: p.id, opened_at: null },
      { user_id: p.id, opened_at: null },
      { user_id: p.id, opened_at: new Date(now - 60 * 60 * 1000).toISOString() },
    ];
    const { error } = await admin.from("secret_boxes").insert(rows);
    if (error) {
      console.error(`secret_boxes insert failed: ${error.message}`);
      continue;
    }
    inserted++;
  }
  console.log(
    `Secret boxes seeded: ${inserted} users new, ${skipped} users already had ≥3.`,
  );
}

const SAMPLE_GIFTS = [
  "áo phông SAA",
  "cốc sứ SAA",
  "sticker set SAA",
  "móc khoá SAA",
  "bình nước SAA",
  "voucher cafe 100k",
  "túi canvas SAA",
  "tai nghe bluetooth",
  "sổ tay SAA",
  "hộp quà Secret Box",
] as const;

async function seedGiftRedemptions(profiles: Profile[]): Promise<void> {
  // 10 fixture redemptions across the fixture users so §D.3 has stable
  // demo data. Idempotent by `(user_id, gift_name, redeemed_at)` — we
  // skip any row whose (user, gift, redeemed_at) already exists.
  const now = Date.now();
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < 10; i++) {
    const user = profiles[i % profiles.length];
    const gift = SAMPLE_GIFTS[i % SAMPLE_GIFTS.length];
    // Redemptions 45 minutes apart so §D.3 list has stable ordering.
    const redeemedAt = new Date(now - i * 45 * 60 * 1000).toISOString();

    const { data: existing } = await admin
      .from("gift_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("gift_name", gift)
      .eq("redeemed_at", redeemedAt)
      .limit(1);
    if ((existing?.length ?? 0) > 0) {
      skipped++;
      continue;
    }
    const { error } = await admin.from("gift_redemptions").insert({
      user_id: user.id,
      gift_name: gift,
      quantity: 1,
      source: "secret_box",
      redeemed_at: redeemedAt,
    });
    if (error) {
      console.error(`gift_redemptions insert failed: ${error.message}`);
      continue;
    }
    inserted++;
  }
  console.log(
    `Gift redemptions seeded: ${inserted} new, ${skipped} already present.`,
  );
}

// -------- main --------------------------------------------------------

async function main(): Promise<void> {
  console.log("Seeding Kudos fixtures (idempotent)…");

  const { data: depts, error: deptsErr } = await admin
    .from("departments")
    .select("id, code");
  if (deptsErr) throw new Error(`departments: ${deptsErr.message}`);

  const { data: hashtags, error: tagsErr } = await admin
    .from("hashtags")
    .select("id, slug");
  if (tagsErr) throw new Error(`hashtags: ${tagsErr.message}`);

  const profiles: Profile[] = [];
  for (const u of FIXTURE_USERS) {
    const id = await ensureFixtureUser(u.email, u.displayName);
    await backfillProfile(id, u.displayName, u.deptCode, depts ?? []);
    profiles.push({ id, email: u.email, display_name: u.displayName });
  }
  console.log(`Fixture users: ${profiles.length} ready.`);

  await seedKudos(profiles, hashtags ?? []);
  await seedGiftRedemptions(profiles);
  await seedSecretBoxes(profiles);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
