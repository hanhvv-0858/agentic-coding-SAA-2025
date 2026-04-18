"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";

// Server Action — ends the Supabase session and sends the user back to
// /login. Errors are swallowed: if Supabase is unreachable we still redirect
// so the browser view matches the intent, and the middleware session-refresh
// will re-prompt on next request.
export async function signOut(): Promise<never> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Swallow — see comment above.
  }
  redirect("/login");
}
