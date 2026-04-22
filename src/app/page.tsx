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
import { HeroBackdrop } from "@/components/homepage/HeroBackdrop";
import { HeroSection } from "@/components/homepage/HeroSection";
import { RootFurtherCard } from "@/components/homepage/RootFurtherCard";
import { AwardsSection } from "@/components/homepage/AwardsSection";
import { KudosPromoBlock } from "@/components/homepage/KudosPromoBlock";
import { QuickActionsFab } from "@/components/shell/QuickActionsFab";

type SupabaseUser = NonNullable<
  Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]
>;

// Homepage — authenticated landing. Server component so it can gate on the
// Supabase session before any client bundle ships. FR-001 / FR-016.
export default async function HomePage() {
  const supabase = await createClient();

  let user: SupabaseUser | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    // FR-016: graceful failure — treat as unauthenticated so the redirect
    // below still fires rather than blowing up the page.
    user = null;
  }
  if (!user) redirect("/login");
  await requireOnboardingComplete(user.id);

  const { locale, messages } = await getMessages();
  const languageLabel = messages.common.language.label[locale];
  const languageAria = messages.common.language.toggle[locale];
  const fabLabels = messages.common.fab;
  const profileLabels = messages.common.profile;
  const notificationLabel = messages.common.notification.unread;
  const skipLabel = messages.homepage.skipToMain;

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

  track({ type: "screen_view", screen: "homepage" });

  const headerRight = (
    <>
      <NotificationBell initialUnreadCount={0} ariaLabelTemplate={notificationLabel} />
      <LanguageToggle locale={locale} label={languageLabel} ariaLabel={languageAria} />
      <ProfileMenu user={profileUser} isAdmin={isAdmin} labels={profileLabels} />
    </>
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-[var(--color-accent-cream)] focus:px-4 focus:py-2 focus:text-[var(--color-brand-900)]"
      >
        {skipLabel}
      </a>
      <SiteHeader
        navItems={HEADER_NAV}
        right={headerRight}
        sticky
        bgVariant="brand-700"
      />
      <main id="main" className="flex flex-1 flex-col">
        {/* Shared full-bleed backdrop spans Hero + Root Further so the key
            visual artwork flows continuously across both sections. */}
        <div className="relative w-full overflow-hidden">
          <HeroBackdrop />
          <div className="relative z-10">
            <HeroSection />
            <RootFurtherCard />
          </div>
        </div>
        <div className="flex flex-col gap-16 bg-[var(--color-brand-900)] pt-10 pb-16 lg:gap-24 lg:pt-16 lg:pb-24">
          <AwardsSection />
          <KudosPromoBlock />
        </div>
      </main>
      <SiteFooter navItems={FOOTER_NAV} showLogo />
      <QuickActionsFab labels={fabLabels} />
    </>
  );
}
