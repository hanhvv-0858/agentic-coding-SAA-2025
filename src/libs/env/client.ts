import { z } from "zod";

// Client-safe env. Only NEXT_PUBLIC_* variables — Next.js inlines these into
// the client bundle at build time. Safe to import from "use client" code.

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  // SAA event kickoff datetime (ISO 8601 UTC). Optional — Countdown falls
  // back gracefully when missing.
  NEXT_PUBLIC_EVENT_START_AT: z.string().datetime().optional(),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

function parseClientEnv(): ClientEnv {
  const result = ClientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_EVENT_START_AT: process.env.NEXT_PUBLIC_EVENT_START_AT,
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
