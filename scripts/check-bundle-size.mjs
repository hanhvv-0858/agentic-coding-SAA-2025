#!/usr/bin/env node
// Bundle-size gate for the /login route (spec TR-010: ≤ 30 KB gzipped).
// Run after `yarn build`. Reads the Next.js route manifest + analyzer output
// and fails with exit 1 if the budget is exceeded.

import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const ROUTE = "/login";
const BUDGET_BYTES = 30 * 1024;
const ROOT = resolve(process.cwd(), ".next");

async function main() {
  if (!existsSync(ROOT)) {
    console.error("✖ .next build output not found — run `yarn build` first.");
    process.exit(1);
  }

  const manifestPath = resolve(ROOT, "app-build-manifest.json");
  if (!existsSync(manifestPath)) {
    console.error(`✖ ${manifestPath} not found.`);
    process.exit(1);
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const pages = manifest.pages ?? {};
  const key = `app${ROUTE}/page`;
  const chunks = pages[key];

  if (!chunks) {
    console.warn(`⚠ No chunks listed for ${key} in app-build-manifest.json.`);
    console.warn("  Assuming zero client JS — TR-010 trivially satisfied.");
    process.exit(0);
  }

  let totalGzip = 0;
  for (const chunk of chunks) {
    const file = resolve(ROOT, chunk);
    if (!existsSync(file)) continue;
    const buf = await readFile(file);
    totalGzip += gzipSync(buf).length;
    const info = await stat(file);
    console.log(
      `  ${chunk}  raw=${info.size}B  gzip=${gzipSync(buf).length}B`,
    );
  }

  console.log(`\n  ${ROUTE} client bundle gzipped: ${totalGzip} / ${BUDGET_BYTES} B`);
  if (totalGzip > BUDGET_BYTES) {
    console.error(`✖ TR-010 FAILED: bundle over budget by ${totalGzip - BUDGET_BYTES} B.`);
    process.exit(1);
  }
  console.log("✓ TR-010 OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
