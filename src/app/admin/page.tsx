import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/libs/supabase/server";
import { requireOnboardingComplete } from "@/libs/auth/requireOnboardingComplete";

// Admin-only dashboard — server-side role gate per constitution Principle IV.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const role = (data.user.app_metadata as { role?: string } | null)?.role;
  if (role !== "admin") redirect("/error/403");
  await requireOnboardingComplete(data.user.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[var(--color-brand-900)] px-6 py-24 text-white">
      <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold">
        Admin Dashboard
      </h1>
      <p className="text-white/70">Coming soon.</p>
      <Link href="/" className="text-[var(--color-accent-cream)] underline">
        ← Back to home
      </Link>
    </main>
  );
}
