import { z } from "zod";

// Client-safe env. Only NEXT_PUBLIC_* variables — Next.js inlines these into
// the client bundle at build time. Safe to import from "use client" code.

const ClientEnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
    // Moment the SAA SITE opens (registration / kudo compose enabled).
    // When set: the `/` route is rewritten to `/countdown` until this
    // instant passes, and direct access to `/countdown` redirects to
    // `/login` afterwards. When missing: site is always open (no prelaunch
    // gate) — resolved 2026-04-22.
    NEXT_PUBLIC_SITE_LAUNCH_AT: z.string().datetime().optional(),
    // Moment the SAA CEREMONY (awards night) takes place. Powers the
    // Homepage About-SAA countdown + "Coming soon" subtitle. Independent
    // of SITE_LAUNCH_AT; when missing, the homepage countdown falls back.
    NEXT_PUBLIC_CEREMONY_AT: z.string().datetime().optional(),
  })
  .refine(
    (env) => {
      // Invariant: site must open at or before the ceremony. Both vars
      // optional; enforce only when both are set. Resolved 2026-04-22:
      // "validation fail" (not warn).
      if (!env.NEXT_PUBLIC_SITE_LAUNCH_AT || !env.NEXT_PUBLIC_CEREMONY_AT) return true;
      const siteMs = Date.parse(env.NEXT_PUBLIC_SITE_LAUNCH_AT);
      const ceremonyMs = Date.parse(env.NEXT_PUBLIC_CEREMONY_AT);
      if (Number.isNaN(siteMs) || Number.isNaN(ceremonyMs)) return true;
      return siteMs <= ceremonyMs;
    },
    {
      message:
        "NEXT_PUBLIC_SITE_LAUNCH_AT must be less-than-or-equal to NEXT_PUBLIC_CEREMONY_AT (site opens at or before the ceremony)",
      path: ["NEXT_PUBLIC_SITE_LAUNCH_AT"],
    },
  );

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

function parseClientEnv(): ClientEnv {
  const result = ClientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_LAUNCH_AT: process.env.NEXT_PUBLIC_SITE_LAUNCH_AT,
    NEXT_PUBLIC_CEREMONY_AT: process.env.NEXT_PUBLIC_CEREMONY_AT,
  });
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid client environment variables:\n${issues}`);
  }
  return result.data;
}

export const clientEnv: ClientEnv = parseClientEnv();
