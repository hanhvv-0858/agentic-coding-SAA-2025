#!/usr/bin/env node
// Secrets-in-bundle scan (spec SC-006).
// Greps the built client bundle for forbidden substrings that shouldn't leak
// from server-only env vars. Fails CI with exit 1 on any hit.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { glob } from "node:fs/promises";

const FORBIDDEN = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
  "GITHUB_TOKEN",
  "gho_",
  "ghp_",
];

const CLIENT_BUNDLE_GLOBS = [
  ".next/static/chunks/**/*.js",
  ".open-next/assets/_next/static/chunks/**/*.js",
];

async function main() {
  const root = process.cwd();
  const hits = [];

  for (const pattern of CLIENT_BUNDLE_GLOBS) {
    const dir = resolve(root, pattern.split("/**")[0]);
    if (!existsSync(dir)) continue;

    for await (const file of glob(pattern, { cwd: root })) {
      const full = resolve(root, file);
      const contents = await readFile(full, "utf8");
      for (const needle of FORBIDDEN) {
        if (contents.includes(needle)) {
          hits.push({ file, needle });
        }
      }
    }
  }

  if (hits.length > 0) {
    console.error("✖ SC-006 FAILED: forbidden strings found in client bundle:");
    for (const { file, needle } of hits) {
      console.error(`  - ${needle}  @  ${file}`);
    }
    process.exit(1);
  }
  console.log(`✓ SC-006 OK — no server-only secrets in client bundle (${FORBIDDEN.length} patterns checked)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
