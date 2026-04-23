import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { getMessages } from "@/libs/i18n/getMessages";
import { track } from "@/libs/analytics/track";
import { requireOnboardingComplete } from "@/libs/auth/requireOnboardingComplete";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { HEADER_NAV, FOOTER_NAV } from "@/data/navItems";
import { RulesPanel } from "@/components/the-le/RulesPanel";
import { RulesDismisser } from "@/components/the-le/RulesDismisser";

type SupabaseUser = NonNullable<
  Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]
>;

type PageProps = {
  searchParams?: Promise<{ source?: string }>;
};

const VALID_SOURCES = new Set(["homepage", "live-board", "compose"]);

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getMessages();
  return {
    title: messages.rules.meta.title,
    description: messages.rules.meta.description,
  };
}

// Thể lệ (Rules) page — session-gated authenticated route. Static content
// sourced from src/messages/{vi,en}.json. No DB / API calls.
export default async function TheLePage({ searchParams }: PageProps) {
  const supabase = await createClient();

  let user: SupabaseUser | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    user = null;
  }
  if (!user) redirect("/login");
  await requireOnboardingComplete(user.id);

  const { locale, messages } = await getMessages();
  const languageLabel = messages.common.language.label[locale];
  const languageAria = messages.common.language.toggle[locale];
  const profileLabels = messages.common.profile;
  const notificationLabel = messages.common.notification.unread;

  const role = (user.app_metadata as { role?: string } | null)?.role;
  const isAdmin = role === "admin";
  const userMeta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const profileUser = {
    email: user.email ?? "",
    displayName: userMeta.full_name ?? userMeta.name ?? null,
    avatarUrl: userMeta.avatar_url ?? userMeta.picture ?? null,
  };

  const rawSource = (await searchParams)?.source ?? "";
  const source = VALID_SOURCES.has(rawSource)
    ? (rawSource as "homepage" | "live-board" | "compose")
    : "direct";

  track({ type: "screen_view", screen: "the-le" });
  track({ type: "rules_view", source });

  const headerRight = (
    <>
      <NotificationBell initialUnreadCount={0} ariaLabelTemplate={notificationLabel} />
      <LanguageToggle locale={locale} label={languageLabel} ariaLabel={languageAria} />
      <ProfileMenu user={profileUser} isAdmin={isAdmin} labels={profileLabels} />
    </>
  );

  return (
    <>
      <SiteHeader navItems={HEADER_NAV} right={headerRight} sticky bgVariant="brand-700" />
      <main id="main" className="flex flex-1 flex-col bg-[var(--color-brand-900)]">
        <RulesDismisser>
          <RulesPanel rules={messages.rules} />
        </RulesDismisser>
      </main>
      <SiteFooter navItems={FOOTER_NAV} showLogo />
    </>
  );
}
