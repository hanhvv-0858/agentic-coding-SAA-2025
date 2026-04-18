import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Wire the OpenNext Cloudflare adapter for `next dev` so bindings + env vars
// mirror production (per plan T013, constitution Principle V — Cloudflare Workers).
// Fire-and-forget (next.config.ts is compiled without top-level-await support).
void initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile avatars (Supabase OAuth stores the URL in
      // user_metadata.avatar_url / picture). Variants are lh3/lh4/lh5/lh6.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
