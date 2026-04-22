"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { track } from "@/libs/analytics/track";
import {
  validateDepartmentCode,
  validateDisplayName,
} from "@/libs/onboarding/validation";

// `completeOnboarding` — spec ObrdH9pKx7 FR-006.
// Validates both fields server-side (defense in depth), upserts
// `profiles.{display_name, department_id}`, emits a PII-clean analytics
// event, and redirects to `/`.
//
// Error handling uses query-param redirects because `<form action={...}>`
// loses the ability to return structured data once Next.js intercepts it —
// the page re-renders with `?error=<code>` and surfaces the banner.
export async function completeOnboarding(formData: FormData): Promise<never> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { data: pre } = await supabase
    .from("profiles")
    .select("display_name, department_id")
    .eq("id", user.id)
    .maybeSingle();
  const preDisplayName = pre?.display_name ?? null;
  const preDepartmentId = pre?.department_id ?? null;

  const rawDisplayName = (formData.get("displayName") as string | null) ?? "";
  const rawDepartmentCode = (formData.get("departmentCode") as string | null) ?? "";

  const nameResult = validateDisplayName(rawDisplayName);
  if (!nameResult.ok) {
    console.error("[onboarding] displayName validation failed", {
      reason: nameResult.reason,
    });
    redirect("/onboarding?error=generic");
  }

  const { data: dept, error: deptErr } = await supabase
    .from("departments")
    .select("id, code")
    .eq("code", rawDepartmentCode)
    .maybeSingle();
  if (deptErr || !dept) {
    console.error("[onboarding] department lookup failed", {
      code: rawDepartmentCode,
      err: deptErr?.message,
    });
    redirect("/onboarding?error=generic");
  }
  const codeResult = validateDepartmentCode(dept.code, [dept.code]);
  if (!codeResult.ok) {
    console.error("[onboarding] department code validation failed", dept);
    redirect("/onboarding?error=generic");
  }

  // The profile row already exists thanks to the `on_auth_user_created`
  // trigger (migration 0004), so a plain UPDATE is sufficient and matches
  // the existing `profiles_update_self` RLS policy. We deliberately avoid
  // `.upsert()` here because Supabase's upsert compiles as
  // `INSERT ... ON CONFLICT`, which RLS evaluates against `WITH CHECK` on
  // INSERT — and the current migrations ship no INSERT policy on
  // `profiles`, so the call is rejected even when the row exists.
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      display_name: nameResult.value,
      department_id: dept.id,
    })
    .eq("id", user.id);
  if (updateErr) {
    console.error("[onboarding] profile update failed", {
      userId: user.id,
      err: updateErr.message,
    });
    redirect("/onboarding?error=generic");
  }

  track({
    type: "onboarding_complete",
    has_display_name_changed: preDisplayName !== nameResult.value,
    has_department_changed: preDepartmentId !== dept.id,
  });

  redirect("/");
}
