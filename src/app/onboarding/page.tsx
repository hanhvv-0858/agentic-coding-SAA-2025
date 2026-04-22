import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { getMessages } from "@/libs/i18n/getMessages";
import { getKudoDepartments } from "@/app/kudos/actions";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyVisualBackground } from "@/components/login/KeyVisualBackground";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

// Spec ObrdH9pKx7 — post-OAuth gate that collects `display_name` +
// `department_id` when the Google-seeded profile is missing them.
// This Server Component owns:
//   - Unauthenticated → `/login`
//   - Already-onboarded (`department_id IS NOT NULL`) → `/` (spec FR-002,
//     covers US3 direct-URL bypass)
//   - Otherwise: load profile + department list, hand off to the form island.
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, department_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.department_id) {
    redirect("/");
  }

  const [{ messages }, params, departments] = await Promise.all([
    getMessages(),
    searchParams,
    getKudoDepartments(),
  ]);

  const userMeta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const initialDisplayName =
    profile?.display_name ?? userMeta.full_name ?? userMeta.name ?? "";
  const avatarUrl = profile?.avatar_url ?? userMeta.avatar_url ?? userMeta.picture ?? null;
  const email = user.email ?? "";

  const errorParam = params.error;
  const initialSubmitError =
    errorParam === "generic" || errorParam === "session_expired" ? errorParam : null;

  const m = messages.onboarding;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-brand-900)]">
      <KeyVisualBackground />
      <SiteHeader />
      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-12 sm:px-8 sm:pt-28">
        <div className="w-full max-w-[520px] rounded-2xl bg-[color:var(--color-modal-paper)] p-6 shadow-[var(--shadow-kudo-card)] sm:p-8 lg:p-10">
          <header className="mb-6 flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-montserrat)] text-[28px] font-bold leading-9 text-[color:var(--color-brand-900)]">
              {m.title}
            </h1>
            <p className="font-[family-name:var(--font-montserrat)] text-sm leading-[22px] text-[color:var(--color-brand-900)]/75">
              {m.description}
            </p>
          </header>
          <OnboardingForm
            initialDisplayName={initialDisplayName}
            avatarUrl={avatarUrl}
            email={email}
            departments={departments}
            initialSubmitError={initialSubmitError}
            messages={messages}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
