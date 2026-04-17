import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/libs/env/client";

// Browser-side Supabase client. Imports clientEnv (NEXT_PUBLIC_* only) so the
// client bundle never references server-only vars like ALLOWED_EMAIL_DOMAINS.
export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
