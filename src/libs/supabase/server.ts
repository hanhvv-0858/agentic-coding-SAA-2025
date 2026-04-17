import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/libs/env/server";

// Cookie-aware Supabase client for Server Components, Server Actions, and
// Route Handlers. Uses @supabase/ssr so the same cookie jar is shared with the
// middleware session-refresh step — Workers-compatible per constitution V.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component that can't set cookies. The
          // middleware refresh path handles this instead — see middleware.ts.
        }
      },
    },
  });
}
