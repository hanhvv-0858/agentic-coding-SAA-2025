import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Wire the OpenNext Cloudflare adapter for `next dev` so bindings + env vars
// mirror production (per plan T013, constitution Principle V — Cloudflare Workers).
// Fire-and-forget (next.config.ts is compiled without top-level-await support).
void initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {};

export default nextConfig;
