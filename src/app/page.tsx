import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";

// Homepage stub — redirects unauthenticated visitors to /login. The full
// Homepage spec is tracked separately (Figma frame i87tDx10uM).
export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[var(--color-brand-900)] text-white">
      <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold">
        Sun Annual Awards 2025
      </h1>
      <p className="mt-4 text-white/70">Welcome, {data.user.email}.</p>
    </main>
  );
}
