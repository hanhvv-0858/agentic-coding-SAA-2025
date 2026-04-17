import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { getMessages } from "@/libs/i18n/getMessages";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyVisualBackground } from "@/components/login/KeyVisualBackground";
import { LoginHero } from "@/components/login/LoginHero";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Server-side session check. If already signed in, send the user to `/`.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  const { messages } = await getMessages();
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-brand-900)]">
      <KeyVisualBackground />
      <SiteHeader />
      <main className="relative z-20 flex flex-1 flex-col items-start justify-center pt-20 sm:pt-24">
        <LoginHero
          messages={messages}
          errorParam={params.error}
          nextParam={params.next}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
