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
import { AWARDS } from "@/data/awards";
import { AwardsHeroBanner } from "@/components/awards/AwardsHeroBanner";
import { AwardsCategoryNav } from "@/components/awards/AwardsCategoryNav";
import { AwardDetailSection } from "@/components/awards/AwardDetailSection";
import { KudosPromoBlock } from "@/components/homepage/KudosPromoBlock";
import { QuickActionsFab } from "@/components/shell/QuickActionsFab";

type SupabaseUser = NonNullable<
  Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]
>;

const NAV_LABEL_KEY_BY_SLUG: Record<string, string> = {
  "top-talent": "topTalent",
  "top-project": "topProject",
  "top-project-leader": "topProjectLeader",
  "best-manager": "bestManager",
  "signature-2025-creator": "signature2025",
  mvp: "mvp",
};

// Locale-aware metadata — reads awards.meta.* from the active catalogue so
// the browser tab title + social share preview respect the user's language.
export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getMessages();
  return {
    title: messages.awards.meta.title,
    description: messages.awards.meta.description,
  };
}

// Awards System page — authenticated long-form reference for all 6 SAA 2025
// awards. Session-gated (FR-002), fully server-rendered (zero runtime fetch),
// with a single client island for the scroll-spy left nav.
export default async function AwardsPage() {
  const supabase = await createClient();

  let user: SupabaseUser | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    // FR-013: graceful failure — treat as unauthenticated.
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
  const awardsNav = messages.awards.nav;

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

  track({ type: "screen_view", screen: "awards" });

  // Pre-resolve nav labels server-side so the client component never touches
  // the full message catalogue (keeps hydration payload minimal).
  const navItems = AWARDS.map((a) => ({
    slug: a.slug,
    label: (awardsNav as unknown as Record<string, string>)[
      NAV_LABEL_KEY_BY_SLUG[a.slug] ?? ""
    ] ?? a.slug,
  }));

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
        <AwardsHeroBanner />

        <div className="mx-auto w-full max-w-[1280px] px-4 pt-10 pb-16 sm:px-8 lg:pt-16 lg:pb-24">
          <div className="flex gap-0 lg:gap-8 xl:gap-12">
            <AwardsCategoryNav
              items={navItems}
              ariaLabel={awardsNav.ariaLabel}
              initialActiveSlug="top-talent"
            />
            <div className="flex flex-1 flex-col gap-4">
              {AWARDS.map((award, i) => {
                const navKey = NAV_LABEL_KEY_BY_SLUG[award.slug] ?? "";
                const title =
                  (awardsNav as unknown as Record<string, string>)[navKey] ?? award.slug;
                return (
                  <AwardDetailSection
                    key={award.id}
                    award={award}
                    messages={messages}
                    title={title}
                    reverse={i % 2 === 0}
                    priority={i === 0}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-brand-900)] pb-16 lg:pb-24">
          <KudosPromoBlock />
        </div>
      </main>
      <SiteFooter navItems={FOOTER_NAV} showLogo />
      <QuickActionsFab labels={fabLabels} />
    </>
  );
}
