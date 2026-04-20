/**
 * scripts/seed-reference-data.ts
 * ---------------------------------------------------------------------
 * PRODUCTION-SAFE seeder for Sun* Kudos reference data: 6 departments
 * + 10 hashtags. Idempotent (`on conflict do nothing`). No fixture
 * users, no sample kudos — only the canonical lookup rows the app
 * needs to function.
 *
 * Run (cloud):
 *   NEXT_PUBLIC_SUPABASE_URL=https://opmgaciujjeaugojcail.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<cloud-service-role> \
 *   npx tsx scripts/seed-reference-data.ts
 *
 * Run (local):
 *   (env vars from `supabase status --output env`)
 *   npx tsx scripts/seed-reference-data.ts
 *
 * Safe to re-run: conflicts on `departments.code` / `hashtags.slug`
 * are ignored.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY " +
      "— make sure .env.local is populated.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEPARTMENTS = [
  { code: "SVN-ENG", name_vi: "Kỹ thuật phần mềm", name_en: "Software Engineering" },
  { code: "DES", name_vi: "Thiết kế", name_en: "Design" },
  { code: "PM", name_vi: "Quản lý dự án", name_en: "Project Management" },
  { code: "QA", name_vi: "Đảm bảo chất lượng", name_en: "Quality Assurance" },
  { code: "BIZ", name_vi: "Kinh doanh", name_en: "Business" },
  { code: "HR", name_vi: "Nhân sự", name_en: "Human Resources" },
] as const;

const HASHTAGS = [
  { slug: "dedicated", label: "Dedicated" },
  { slug: "creative", label: "Creative" },
  { slug: "teamwork", label: "Teamwork" },
  { slug: "mentor", label: "Mentor" },
  { slug: "ontime", label: "On Time" },
  { slug: "leadership", label: "Leadership" },
  { slug: "innovation", label: "Innovation" },
  { slug: "customer-first", label: "Customer First" },
  { slug: "wellness", label: "Wellness" },
  { slug: "fun", label: "Fun" },
] as const;

async function seedDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .upsert(DEPARTMENTS, { onConflict: "code", ignoreDuplicates: true })
    .select("id, code");
  if (error) {
    console.error("Full error object:", error);
    console.error("error.cause:", (error as { cause?: unknown })?.cause);
    console.error("Error JSON:", JSON.stringify(error, null, 2));
    throw new Error(`Departments seed failed: ${error.message}`);
  }
  console.log(`Departments: ${data?.length ?? 0} upserted.`);
}

async function seedHashtags() {
  const { data, error } = await supabase
    .from("hashtags")
    .upsert(HASHTAGS, { onConflict: "slug", ignoreDuplicates: true })
    .select("id, slug");
  if (error) throw new Error(`Hashtags seed failed: ${error.message}`);
  console.log(`Hashtags: ${data?.length ?? 0} upserted.`);
}

async function main() {
  console.log(`Seeding reference data → ${SUPABASE_URL}`);
  await seedDepartments();
  await seedHashtags();
  console.log("Done. Reference data is live.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
