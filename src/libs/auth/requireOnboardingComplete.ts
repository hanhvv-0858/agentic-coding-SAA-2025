import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";

// Called by each authenticated Server Component after the user is resolved.
// If `profiles.department_id IS NULL`, the caller is funnelled to
// `/onboarding` before any other authenticated route can render (spec
// ObrdH9pKx7, FR-001).
//
// Single DB round-trip per page load: one indexed lookup on `profiles.id`.
// See plan.md §Architecture > Routing gate for the trade-off vs. a custom
// JWT claim (deferred until p95 layout latency is measured in prod).
export async function requireOnboardingComplete(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data || data.department_id === null) {
    redirect("/onboarding");
  }
}
