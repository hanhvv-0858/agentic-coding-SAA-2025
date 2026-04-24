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
 * are matched by email, kudos by `(sender_id, body)` uniqueness (the
 * 30-row seed plan never reuses the same pair, so an exact body match
 * on the same sender means the row is already present).
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

// Fixture Sunners mapped to real Sun* department codes after
// migration 0011_seed_real_departments.sql. Keep in sync with
// spec .momorph/specs/WXK5AYB_rG-dropdown-phong-ban/spec.md §Migration Plan.
const FIXTURE_USERS = [
  { email: "alice@kudos.test",  displayName: "Alice Nguyen",  deptCode: "CEVC1" },
  { email: "bob@kudos.test",    displayName: "Bob Tran",      deptCode: "CEVC1 - DSV" },
  { email: "charlie@kudos.test",displayName: "Charlie Le",    deptCode: "SPD" },
  { email: "diana@kudos.test",  displayName: "Diana Pham",    deptCode: "STVC - EE" },
  { email: "ethan@kudos.test",  displayName: "Ethan Vo",      deptCode: "BDV" },
  { email: "fiona@kudos.test",  displayName: "Fiona Bui",     deptCode: "OPDC - HRD" },
  { email: "george@kudos.test", displayName: "George Hoang",  deptCode: "CEVC2" },
  { email: "hanna@kudos.test",  displayName: "Hanna Do",      deptCode: "CEVC1 - DSV - UI/UX 1" },
] as const;

// 50 additional recipients used to populate the Spotlight board with
// a realistic variety of weights (high/mid/low kudo counts). These
// users are recipients only — they do not send kudos — so Spotlight
// sizing is driven by the weighted allocation in `seedKudosForExtras`.
// Idempotent by email (same path as FIXTURE_USERS).
const EXTRA_FIXTURE_USERS = [
  { email: "minh.nguyen@kudos.test",    displayName: "Minh Nguyen",     deptCode: "CEVC1" },
  { email: "linh.tran@kudos.test",      displayName: "Linh Tran",       deptCode: "CEVC1 - DSV" },
  { email: "khanh.le@kudos.test",       displayName: "Khanh Le",        deptCode: "CEVC2" },
  { email: "phong.pham@kudos.test",     displayName: "Phong Pham",      deptCode: "CEVC2 - CySS" },
  { email: "ngoc.vo@kudos.test",        displayName: "Ngoc Vo",         deptCode: "STVC" },
  { email: "quan.hoang@kudos.test",     displayName: "Quan Hoang",      deptCode: "STVC - R&D" },
  { email: "thao.bui@kudos.test",       displayName: "Thao Bui",        deptCode: "STVC - EE" },
  { email: "huy.do@kudos.test",         displayName: "Huy Do",          deptCode: "SPD" },
  { email: "mai.huynh@kudos.test",      displayName: "Mai Huynh",       deptCode: "FCOV" },
  { email: "duc.phan@kudos.test",       displayName: "Duc Phan",        deptCode: "FCOV - F&A" },
  { email: "trang.vu@kudos.test",       displayName: "Trang Vu",        deptCode: "FCOV - LRM" },
  { email: "tuan.dang@kudos.test",      displayName: "Tuan Dang",       deptCode: "BDV" },
  { email: "yen.ho@kudos.test",         displayName: "Yen Ho",          deptCode: "CPV" },
  { email: "bao.ngo@kudos.test",        displayName: "Bao Ngo",         deptCode: "CPV - CGP" },
  { email: "an.duong@kudos.test",       displayName: "An Duong",        deptCode: "GEU" },
  { email: "thanh.ly@kudos.test",       displayName: "Thanh Ly",        deptCode: "GEU - HUST" },
  { email: "hieu.nguyen@kudos.test",    displayName: "Hieu Nguyen",     deptCode: "GEU - DUT" },
  { email: "nam.tran@kudos.test",       displayName: "Nam Tran",        deptCode: "GEU - UET" },
  { email: "chau.le@kudos.test",        displayName: "Chau Le",         deptCode: "GEU - UIT" },
  { email: "my.pham@kudos.test",        displayName: "My Pham",         deptCode: "GEU - TM" },
  { email: "son.vo@kudos.test",         displayName: "Son Vo",          deptCode: "OPDC - HRD" },
  { email: "van.hoang@kudos.test",      displayName: "Van Hoang",       deptCode: "OPDC - HRD - L&D" },
  { email: "ha.bui@kudos.test",         displayName: "Ha Bui",          deptCode: "OPDC - HRD - TI" },
  { email: "long.do@kudos.test",        displayName: "Long Do",         deptCode: "OPDC - HRD - HRBP" },
  { email: "kim.huynh@kudos.test",      displayName: "Kim Huynh",       deptCode: "OPDC - HRF" },
  { email: "dat.phan@kudos.test",       displayName: "Dat Phan",        deptCode: "OPDC - HRF - C&B" },
  { email: "nga.vu@kudos.test",         displayName: "Nga Vu",          deptCode: "OPDC - HRF - TA" },
  { email: "toan.dang@kudos.test",      displayName: "Toan Dang",       deptCode: "OPDC - HRF - OD" },
  { email: "lam.ho@kudos.test",         displayName: "Lam Ho",          deptCode: "OPDC - HRD - C&C" },
  { email: "hoa.ngo@kudos.test",        displayName: "Hoa Ngo",         deptCode: "CEVEC" },
  { email: "viet.duong@kudos.test",     displayName: "Viet Duong",      deptCode: "CEVEC - SAPD" },
  { email: "loan.ly@kudos.test",        displayName: "Loan Ly",         deptCode: "CEVEC - GSD" },
  { email: "kien.nguyen@kudos.test",    displayName: "Kien Nguyen",     deptCode: "CEVC3" },
  { email: "dung.tran@kudos.test",      displayName: "Dung Tran",       deptCode: "CEVC4" },
  { email: "phuc.le@kudos.test",        displayName: "Phuc Le",         deptCode: "CEVC1 - DSV - UI/UX 1" },
  { email: "giang.pham@kudos.test",     displayName: "Giang Pham",      deptCode: "CEVC1 - DSV - UI/UX 2" },
  { email: "tien.vo@kudos.test",        displayName: "Tien Vo",         deptCode: "CEVC1 - AIE" },
  { email: "hang.hoang@kudos.test",     displayName: "Hang Hoang",      deptCode: "CEVC2 - System" },
  { email: "binh.bui@kudos.test",       displayName: "Binh Bui",        deptCode: "STVC - R&D - DTR" },
  { email: "vinh.do@kudos.test",        displayName: "Vinh Do",         deptCode: "STVC - R&D - DPS" },
  { email: "uyen.huynh@kudos.test",     displayName: "Uyen Huynh",      deptCode: "STVC - R&D - AIR" },
  { email: "cong.phan@kudos.test",      displayName: "Cong Phan",       deptCode: "STVC - R&D - SDX" },
  { email: "hung.vu@kudos.test",        displayName: "Hung Vu",         deptCode: "STVC - Infra" },
  { email: "nhung.dang@kudos.test",     displayName: "Nhung Dang",      deptCode: "FCOV - GA" },
  { email: "viet.ho@kudos.test",        displayName: "Viet Ho",         deptCode: "FCOV - ISO" },
  { email: "anh.ngo@kudos.test",        displayName: "Anh Ngo",         deptCode: "PAO" },
  { email: "quynh.duong@kudos.test",    displayName: "Quynh Duong",     deptCode: "PAO - PEC" },
  { email: "thu.ly@kudos.test",         displayName: "Thu Ly",          deptCode: "IAV" },
  { email: "oanh.nguyen@kudos.test",    displayName: "Oanh Nguyen",     deptCode: "CTO" },
  { email: "khoi.tran@kudos.test",      displayName: "Khoi Tran",       deptCode: "CEVC1" },
  { email: "phuong.le@kudos.test",      displayName: "Phuong Le",       deptCode: "CEVC2" },
] as const;

// 30 body variants — the dedup check uses `(sender_id, body)` so with
// 8 fixture senders we have 8 × 30 = 240 unique pairs, more than
// enough for the 130-kudo seed loop (no collisions before i = 240).
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
  "Cảm ơn đã chia sẻ kinh nghiệm debug Cloudflare Workers, mình học được nhiều mẹo hay.",
  "Proactive của bạn khi raise concern về security trong retro quá ấn tượng!",
  "Thank you for covering my on-call while I was sick — truly a lifesaver.",
  "Buổi workshop TypeScript generics bạn tổ chức rất dễ hiểu, cả team nâng level luôn.",
  "Kudos vì đã chủ động viết runbook cho incident response — không còn cảnh lục tìm giữa đêm nữa.",
  "Tinh thần mentor cực kỳ kiên nhẫn — newbie nào cũng cảm thấy welcome.",
  "Bạn refactor authentication layer gọn gàng quá, đọc code đã mắt.",
  "Cảm ơn vì đã đứng ra host cuộc họp sync với vendor khi mình kẹt lịch.",
  "Quality của PR review của bạn luôn đẳng cấp — catch được cả edge case nhỏ nhất.",
  "Your last-minute save on the launch day deploy was heroic!",
  "Cảm ơn đã giúp mình unblock feature flag config — mình stuck cả buổi trưa.",
  "Động viên team trong lúc burnout là một skill bạn làm cực tốt.",
  "Thank you for the honest feedback in 1:1 — it actually helped me grow.",
  "Bạn luôn chia sẻ resource học tập rất hữu ích cho cả team, respect!",
  "Cảm ơn vì đã kéo bugfix cross-team — leadership real sự!",
  "Absolutely crushed the tech talk last Friday — everyone in engineering is talking about it.",
  "Nhờ bạn mà mình quyết định theo đuổi hướng backend engineer, thank you genuinely.",
  "Bạn review design proposal của mình cực kỹ, catch được logic flaw sớm.",
  "Cảm ơn đã stepup lead sprint trong lúc PM nghỉ — team vẫn ship đúng hạn.",
  "Infra on-call bạn handle quá cool đầu, zero-downtime trong suốt ca trực.",
];

// Fresh 50 body variants used ONLY by `seedKudosForExtras` so the new
// rows never collide with the 130-kudo base loop above. Dedup key is
// `(sender_id, body)`; with 8 senders × 50 bodies = 400 unique pairs
// — comfortable headroom for the ~150 weighted kudos we generate for
// the 50 extra recipients.
const EXTRAS_SAMPLE_BODIES = [
  "Bạn handle client call hôm qua rất chuyên nghiệp, đàm phán khéo léo.",
  "Cảm ơn đã ghé giúp mình fix bug ở code review, debug chất lượng!",
  "Your grit on the Q4 migration sprint was exceptional — thank you.",
  "Tinh thần tự học của bạn truyền cảm hứng cho cả team mới.",
  "Cảm ơn vì đã cover shift on-call Tết nguyên đán, trên cả tuyệt vời.",
  "Pairing with you on the query optimization unlocked a 3× speedup.",
  "Bạn đã chủ động viết script monitor giúp team tiết kiệm hàng giờ mỗi ngày.",
  "Clean PR writeups like yours make reviews genuinely enjoyable.",
  "Tinh thần trách nhiệm khi release hotfix giữa đêm là điều đáng trân trọng.",
  "Thank you for patiently walking me through the CI pipeline mess.",
  "Cảm ơn vì đã dám nêu ý kiến trái chiều trong retro — team trưởng thành hơn.",
  "Bạn làm onboarding document mới quá chi tiết, newbie nào đọc cũng hiểu.",
  "Absolutely world-class focus during the launch-day crunch — chapeau.",
  "Cảm ơn đã hỗ trợ triển khai Sentry alert tuning — noise giảm hẳn.",
  "Your gentle feedback culture is rubbing off on the whole pod.",
  "Sáng kiến tái cấu trúc Storybook folder của bạn cực đỉnh.",
  "Cảm ơn vì đã đứng ra làm facilitator cho session design critique.",
  "Thank you for keeping the documentation current — invaluable gift.",
  "Bạn debug vấn đề Next.js cache miss siêu nhanh, cứu cả sprint.",
  "Cảm ơn vì đã dẫn dắt cuộc họp sync xuyên timezone thật chu đáo.",
  "Your insights at the architecture review genuinely shifted my thinking.",
  "Bạn take ownership end-to-end cho feature rất impressive.",
  "Cảm ơn đã dạy mình cách viết test fixture gọn gàng, đọc là hiểu.",
  "Your post-mortem write-up was a masterclass in blameless analysis.",
  "Tinh thần nâng đỡ junior teammates của bạn khiến team mạnh hơn hẳn.",
  "Cảm ơn vì đã đại diện team đi gặp đối tác — ngoại giao rất khéo.",
  "Impressed by how you turned the messy legacy module into a clean API.",
  "Bạn preview design system update cho client rất professional.",
  "Cảm ơn vì đã trực UAT thay mình khi mình bận họp khách hàng.",
  "Your data-driven approach to the prioritization call was spot on.",
  "Bạn catch được performance regression trước khi ship — savior!",
  "Cảm ơn đã chia sẻ article về LLM evaluation rất hữu ích.",
  "Seeing you unblock three teammates in a single standup was inspiring.",
  "Tinh thần học hỏi của bạn giữ cho team luôn tươi mới.",
  "Cảm ơn vì đã chuẩn bị demo sản phẩm cho leadership cực đẹp.",
  "Your code comments on the payments module are pedagogical gold.",
  "Bạn giải thích thuật toán fuzzy search cực dễ hiểu, thanks!",
  "Cảm ơn đã kết nối mình với mentor bên team khác — game changer.",
  "Your proactive scheduling of 1:1s keeps the team aligned beautifully.",
  "Bạn handle customer escalation với thái độ bình tĩnh đáng nể.",
  "Cảm ơn vì đã cheerlead cả team qua một quý rất áp lực.",
  "Your meticulous PR checklist saved a near-production outage.",
  "Bạn đã ship tính năng i18n trong thời gian kỷ lục, tuyệt vời!",
  "Cảm ơn vì đã viết migration rollback plan chi tiết, an tâm hẳn.",
  "Your willingness to pick up tickets outside your area is admirable.",
  "Bạn turn feedback sprint thành action plan rất rõ ràng — great facilitation.",
  "Cảm ơn vì đã dọn backlog kịp trước kỳ release, team thở phào.",
  "Your creativity on the dashboard wireframes made the UX shine.",
  "Bạn giữ lửa cho cả đội qua những ngày crunch cuối năm, trân trọng!",
  "Shoutout for owning the security patch rollout with zero drama.",
];

// Canonical Sun* Q4 2025 hashtag slugs (13) — kept in sync with
// `supabase/seed.sql` and migration 0010_hashtags_localize.sql.
const HASHTAG_SLUGS = [
  "comprehensive",
  "expertise",
  "high-performance",
  "inspiring",
  "dedicated",
  "aim-high",
  "be-agile",
  "wasshoi",
  "goal-oriented",
  "customer-focused",
  "process-driven",
  "creative-solution",
  "excellent-management",
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
  // The UI-displayed department code is now derived at read time from
  // the `departments` join via `profiles.department_id` — no separate
  // column to populate. Migration 0013 dropped `profiles.honour_code`.
  const honourTitle = HONOUR_TITLES[hashIndex(userId, HONOUR_TITLES.length)];
  const { error } = await admin
    .from("profiles")
    .update({
      display_name: displayName,
      department_id: dept?.id ?? null,
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

  // 130 kudos total — original 30 kept (idempotent skip on re-run)
  // plus 100 new rows for richer demo data (user request 2026-04-23).
  // The dedup check is `(sender_id, body)`, so re-running this script
  // after the bump skips the first 30 and inserts only the new 100.
  const TOTAL_KUDOS = 130;
  for (let i = 0; i < TOTAL_KUDOS; i++) {
    const sender = profiles[i % profiles.length];
    const body = SAMPLE_BODIES[i % SAMPLE_BODIES.length];
    if (await kudoExists(sender.id, body)) {
      skipped++;
      continue;
    }

    // created_at spread across the last ~27 days (130 × 5 h = 650 h ≈
    // 27 days). 5-hour stride keeps the feed timestamps nicely varied
    // across days + hours for visual QA.
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

/**
 * Populates the Spotlight board with a realistic weighted distribution
 * of kudo counts across the 50 extra recipients:
 *   - 5 "stars" receive 8 kudos each       → 40 kudos
 *   - 10 "mids" receive 4 kudos each       → 40 kudos
 *   - 35 "tails" receive 2 kudos each      → 70 kudos
 *   Total ≈ 150 kudos
 * Senders are drawn from the original 8 fixture users. Bodies come
 * from `EXTRAS_SAMPLE_BODIES` (disjoint from `SAMPLE_BODIES`) so the
 * `(sender_id, body)` dedup key never collides with the base loop.
 */
async function seedKudosForExtras(
  senders: Profile[],
  extras: Profile[],
  hashtags: Hashtag[],
): Promise<void> {
  if (extras.length === 0) {
    console.log("Extras: no additional recipients provided — skipping.");
    return;
  }
  const now = Date.now();

  // Build the recipient queue with weighted allocation so Spotlight
  // visibly differentiates high- / mid- / low-weight participants.
  const stars = extras.slice(0, Math.min(5, extras.length));
  const mids = extras.slice(5, Math.min(15, extras.length));
  const tails = extras.slice(15);
  const recipientQueue: string[] = [];
  for (const r of stars) for (let k = 0; k < 8; k++) recipientQueue.push(r.id);
  for (const r of mids)  for (let k = 0; k < 4; k++) recipientQueue.push(r.id);
  for (const r of tails) for (let k = 0; k < 2; k++) recipientQueue.push(r.id);

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < recipientQueue.length; i++) {
    const sender = senders[i % senders.length];
    const body = EXTRAS_SAMPLE_BODIES[i % EXTRAS_SAMPLE_BODIES.length];
    if (await kudoExists(sender.id, body)) {
      skipped++;
      continue;
    }

    // Offset these timestamps back from "now" by a base of 28 days so
    // they sit AFTER the 130-kudo base loop's ~27-day window, keeping
    // feed ordering coherent. 2-hour stride across ~300h ≈ 12 days.
    const baseOffsetHours = 28 * 24;
    const createdAt = new Date(
      now - (baseOffsetHours + i * 2) * 60 * 60 * 1000,
    ).toISOString();
    const title = ["IDOL GIỚI TRẺ", "NGƯỜI ĐỒNG ĐỘI", "NGÔI SAO SÁNG", "GUARDIAN ANGEL"][i % 4];

    const { data: inserted_, error } = await admin
      .from("kudos")
      .insert({ sender_id: sender.id, body, title, created_at: createdAt })
      .select("id")
      .single();
    if (error || !inserted_) {
      console.error(`extras kudos insert failed: ${error?.message}`);
      continue;
    }
    const kudoId = inserted_.id;

    const recipientId = recipientQueue[i];
    await admin
      .from("kudo_recipients")
      .insert({ kudo_id: kudoId, recipient_id: recipientId });

    // 1–2 hashtags per kudo from the rotating slug list.
    const tagSlugs = [
      HASHTAG_SLUGS[i % HASHTAG_SLUGS.length],
      HASHTAG_SLUGS[(i + 7) % HASHTAG_SLUGS.length],
    ];
    const uniqueTagSlugs = Array.from(new Set(tagSlugs));
    const tagIds = uniqueTagSlugs
      .map((slug) => hashtags.find((h) => h.slug === slug)?.id)
      .filter((id): id is string => typeof id === "string");
    if (tagIds.length > 0) {
      await admin.from("kudo_hashtags").insert(
        tagIds.map((hashtag_id) => ({ kudo_id: kudoId, hashtag_id })),
      );
    }

    inserted++;
  }
  console.log(
    `Kudos seeded (extras): ${inserted} new, ${skipped} already present ` +
      `across ${extras.length} recipients (` +
      `${stars.length} stars × 8, ${mids.length} mids × 4, ${tails.length} tails × 2).`,
  );
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

async function seedGiftRedemptions(
  senders: Profile[],
  extras: Profile[],
): Promise<void> {
  // Business rule: each Sunner can redeem only ONE gift. Demo data
  // therefore seeds exactly 10 DISTINCT recipients, each with a
  // different gift from SAMPLE_GIFTS[0..9]. The §D.3 "10 Sunner nhận
  // quà mới nhất" panel should never show a duplicated name.
  //
  // Because previous seeder versions could have written duplicate rows
  // (same user across multiple iterations), we first DELETE any fixture
  // gift_redemption rows before re-inserting a clean slate — idempotent
  // and self-healing on repeat runs.
  const now = Date.now();
  const pool = [...senders, ...extras];
  if (pool.length < 10) {
    console.warn(
      `Gift redemptions: only ${pool.length} fixture users available — need 10.`,
    );
    return;
  }

  // Wipe any existing rows for fixture users (clears pre-existing
  // duplicates from older seeder versions).
  const fixtureIds = pool.map((p) => p.id);
  const { error: deleteErr } = await admin
    .from("gift_redemptions")
    .delete()
    .in("user_id", fixtureIds);
  if (deleteErr) {
    console.error(`gift_redemptions delete failed: ${deleteErr.message}`);
    return;
  }

  let inserted = 0;
  for (let i = 0; i < 10; i++) {
    const user = pool[i]; // distinct user per iteration — no cycling
    const gift = SAMPLE_GIFTS[i]; // 10 gifts, exactly one per user
    // Redemptions 45 minutes apart so the §D.3 list has stable
    // newest-first ordering (i=0 is most recent).
    const redeemedAt = new Date(now - i * 45 * 60 * 1000).toISOString();

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
    `Gift redemptions seeded: ${inserted} distinct recipients × 1 gift each.`,
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
  console.log(`Fixture senders: ${profiles.length} ready.`);

  const extras: Profile[] = [];
  for (const u of EXTRA_FIXTURE_USERS) {
    const id = await ensureFixtureUser(u.email, u.displayName);
    await backfillProfile(id, u.displayName, u.deptCode, depts ?? []);
    extras.push({ id, email: u.email, display_name: u.displayName });
  }
  console.log(`Extra recipients: ${extras.length} ready.`);

  await seedKudos(profiles, hashtags ?? []);
  await seedKudosForExtras(profiles, extras, hashtags ?? []);
  await seedGiftRedemptions(profiles, extras);
  await seedSecretBoxes(profiles);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
