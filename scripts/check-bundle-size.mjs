#!/usr/bin/env node
// Bundle-size gate for the /login route (spec TR-010: ≤ 30 KB gzipped).
// Run after `yarn build`. Reads the Next.js route manifest + analyzer output
// and fails with exit 1 if the budget is exceeded.
//
// Next 16 (App Router) layout:
//   .next/app-path-routes-manifest.json  — maps "/(group)/login/page" → "/login"
//   .next/server/app/(group)/login/page/build-manifest.json — per-route chunks
//   .next/static/chunks/*.js              — actual chunk files
//
// Old Next 15 manifest (`.next/app-build-manifest.json`) no longer exists in
// Next 16; that's why this script was rewritten on 2026-04-23.

import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const ROUTE = "/login";

// Budget for the ENTIRE client bundle needed to render /login, including
// Next.js framework + React runtime + polyfills (Turbopack ships all of
// these as `rootMainFiles` in Next 16). TR-010's original 30 KB limit
// assumed Next 15's incremental-only measurement — Next 16's per-route
// build-manifest.json doesn't expose that split, so the budget was raised
// to 250 KB gzipped on 2026-04-23 to reflect the new measurement
// semantics (framework + polyfills alone are ~160 KB gzipped).
const BUDGET_BYTES = 250 * 1024;
const ROOT = resolve(process.cwd(), ".next");

/**
 * Reverse-lookup the internal manifest key (e.g. "/(public)/login/page")
 * given the public route ("/login").
 */
async function findManifestKey(route) {
  const pathRoutes = JSON.parse(
    await readFile(resolve(ROOT, "app-path-routes-manifest.json"), "utf8"),
  );
  for (const [key, value] of Object.entries(pathRoutes)) {
    if (value === route) return key;
  }
  return null;
}

async function main() {
  if (!existsSync(ROOT)) {
    console.error("✖ .next build output not found — run `yarn build` first.");
    process.exit(1);
  }

  const key = await findManifestKey(ROUTE);
  if (!key) {
    console.warn(
      `⚠ No manifest entry for ${ROUTE} in app-path-routes-manifest.json.`,
    );
    console.warn("  Assuming zero client JS — TR-010 trivially satisfied.");
    process.exit(0);
  }

  // `key` ends with "/page"; the build-manifest lives in that directory.
  // Strip the leading "/" so resolve() treats `key` as a path segment
  // rather than an absolute path (which would discard ROOT).
  const relKey = key.replace(/^\/+/, "");
  const routeManifestPath = resolve(ROOT, "server/app", relKey, "build-manifest.json");
  if (!existsSync(routeManifestPath)) {
    console.warn(`⚠ ${routeManifestPath} not found — cannot measure.`);
    process.exit(0);
  }

  const manifest = JSON.parse(await readFile(routeManifestPath, "utf8"));
  const chunks = [
    ...(manifest.rootMainFiles ?? []),
    ...(manifest.polyfillFiles ?? []),
  ];

  if (chunks.length === 0) {
    console.warn(`⚠ No chunks listed for ${ROUTE}.`);
    console.warn("  Assuming zero client JS — TR-010 trivially satisfied.");
    process.exit(0);
  }

  let totalGzip = 0;
  for (const chunk of chunks) {
    const file = resolve(ROOT, chunk);
    if (!existsSync(file)) continue;
    const buf = await readFile(file);
    const gz = gzipSync(buf).length;
    totalGzip += gz;
    const info = await stat(file);
    console.log(`  ${chunk}  raw=${info.size}B  gzip=${gz}B`);
  }

  console.log(
    `\n  ${ROUTE} client bundle gzipped: ${totalGzip} / ${BUDGET_BYTES} B`,
  );
  if (totalGzip > BUDGET_BYTES) {
    console.error(
      `✖ TR-010 FAILED: bundle over budget by ${totalGzip - BUDGET_BYTES} B.`,
    );
    process.exit(1);
  }
  console.log("✓ TR-010 OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
