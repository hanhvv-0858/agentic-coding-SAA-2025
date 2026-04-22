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
import { QuickActionsFab } from "@/components/shell/QuickActionsFab";
import { HEADER_NAV, FOOTER_NAV } from "@/data/navItems";
import type {
  Department,
  FeedPage,
  FilterState,
  Hashtag,
  KudosStats,
  LatestGiftee,
  SpotlightRecipient,
} from "@/types/kudo";
import {
  getHighlightKudos,
  getKudoDepartments,
  getKudoFeed,
  getKudoHashtags,
  getLatestGiftees,
  getMyKudosStats,
  getSpotlight,
} from "./actions";
import type { Kudo } from "@/types/kudo";
import { KudosHero } from "@/components/kudos/KudosHero";
import { ComposerPill } from "@/components/kudos/ComposerPill";
import { SunnerSearchPill } from "@/components/kudos/SunnerSearchPill";
import { AllKudosHeader } from "@/components/kudos/AllKudosHeader";
import { KudoListClient } from "@/components/kudos/KudoListClient";
import { EmptyState } from "@/components/kudos/EmptyState";
import { InlineError } from "@/components/kudos/InlineError";
import { FilterBar } from "@/components/kudos/FilterBar";
import { HighlightHeader } from "@/components/kudos/HighlightHeader";
import { HighlightCarousel } from "@/components/kudos/HighlightCarousel";
import { SpotlightSection } from "@/components/kudos/SpotlightSection";
import { KudoStatsSidebar } from "@/components/kudos/KudoStatsSidebar";

type SupabaseUser = NonNullable<
  Awaited<
    ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>
  >["data"]["user"]
>;

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getMessages();
  return {
    title: messages.kudos.meta.title,
    description: messages.kudos.meta.description,
  };
}

// Sun* Kudos Live board — RSC route shell (Phase 1.5 scaffold).
// Phase 2 seats the real Promise.all + feed + carousel + spotlight +
// sidebar wiring. For now the page renders the shared shell, a
// placeholder hero slot, and an empty feed placeholder so the route
// compiles and renders without errors. Spec FR-003 auth gate and
// FR-022 try/catch pattern are already in place — mirrors Awards.
export default async function KudosPage({
  searchParams,
}: {
  searchParams?: Promise<{ hashtag?: string; department?: string }>;
}) {
  const supabase = await createClient();

  let user: SupabaseUser | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    // FR-022: graceful failure — treat as unauthenticated.
    user = null;
  }
  if (!user) redirect("/login?next=/kudos");
  await requireOnboardingComplete(user.id);

  const { locale, messages } = await getMessages();
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters: FilterState = {
    hashtag: resolvedSearchParams.hashtag ?? null,
    department: resolvedSearchParams.department ?? null,
  };

  track({
    type: "kudos_feed_view",
    filters: {
      hashtag: filters.hashtag ?? undefined,
      department: filters.department ?? undefined,
    },
  });

  // Phase 3 → Phase 4 — extend the `Promise.all` tuple with hashtags +
  // departments so the FilterBar has its option lists server-rendered.
  // Any one block may fail independently; the `inlineError` variants
  // below (FR-022) handle the feed branch while the filters degrade
  // to a disabled dropdown + "Không tải được" copy (design-style §7).
  let feedPage: FeedPage | null = null;
  let feedErrored = false;
  let hashtags: Hashtag[] = [];
  let departments: Department[] = [];
  let highlights: Kudo[] = [];
  let highlightsErrored = false;
  let spotlight: { total: number; recipients: SpotlightRecipient[] } | null =
    null;
  let spotlightErrored = false;
  let stats: KudosStats | null = null;
  let statsErrored = false;
  let giftees: LatestGiftee[] = [];
  try {
    [feedPage, hashtags, departments, highlights, spotlight, stats, giftees] =
      await Promise.all([
        getKudoFeed(filters, null),
        getKudoHashtags().catch((err) => {
          console.error("[kudos] getKudoHashtags failed:", err);
          return [] as Hashtag[];
        }),
        getKudoDepartments().catch((err) => {
          console.error("[kudos] getKudoDepartments failed:", err);
          return [] as Department[];
        }),
        getHighlightKudos(filters).catch((err) => {
          // Highlight failure is non-fatal — degrade to hidden section.
          console.error("[kudos] getHighlightKudos failed:", err);
          highlightsErrored = true;
          return [] as Kudo[];
        }),
        getSpotlight().catch((err) => {
          // Spotlight failure is non-fatal (FR-022, plan §Data flow).
          console.error("[kudos] getSpotlight failed:", err);
          spotlightErrored = true;
          return null;
        }),
        getMyKudosStats().catch((err) => {
          console.error("[kudos] getMyKudosStats failed:", err);
          statsErrored = true;
          return null;
        }),
        getLatestGiftees(10).catch((err) => {
          console.error("[kudos] getLatestGiftees failed:", err);
          return [] as LatestGiftee[];
        }),
      ]);
  } catch (err) {
    // FR-022: graceful failure — per-block inline error below.
    console.error("[kudos] getKudoFeed failed (fatal path):", err);
    feedErrored = true;
  }

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

  const headerRight = (
    <>
      <NotificationBell
        initialUnreadCount={0}
        ariaLabelTemplate={notificationLabel}
      />
      <LanguageToggle
        locale={locale}
        label={languageLabel}
        ariaLabel={languageAria}
      />
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
      <main
        id="main"
        className="flex w-full max-w-full flex-1 flex-col overflow-x-hidden bg-[var(--color-brand-900)] text-white"
      >
        {/* Hero (A) — H1 + decorative KUDOS + A.1/A.2 pills overlaid in
            the lower region of the keyvisual (design-style §3–6). */}
        <KudosHero
          messages={messages}
          pillsSlot={
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              {/* Composer ≈ 2 × search width per design §A.1 (738×72 / 381×72). */}
              <div className="flex-[2]">
                <ComposerPill
                  placeholder={messages.kudos.hero.composerPlaceholder}
                />
              </div>
              <div className="flex-[1]">
                <SunnerSearchPill
                  placeholder={messages.kudos.hero.searchPlaceholder}
                />
              </div>
            </div>
          }
        />

        {/* B — Highlight (full-width slab). Header with filter chips on
            the same row (design-style §B.1 / spec §US3-4). */}
        <section
          id="highlight"
          className="mx-auto w-full max-w-[1152px] px-4 pt-10 pb-20 sm:px-8 2xl:max-w-[1400px] 2xl:px-12"
          aria-label={messages.kudos.highlight.sectionTitle}
        >
          <HighlightHeader
            messages={messages}
            rightSlot={
              <FilterBar
                hashtag={filters.hashtag}
                department={filters.department}
                hashtags={hashtags}
                departments={departments}
                messages={messages}
              />
            }
          />
          <div className="mt-6 w-full">
            {highlightsErrored ? (
              <InlineError messages={messages} block="carousel" />
            ) : highlights.length > 0 ? (
              <HighlightCarousel
                highlights={highlights}
                messages={messages}
                locale={locale}
                viewerId={user.id}
                defaultIndex={2}
              />
            ) : (
              <EmptyState messages={messages} variant="feedEmpty" />
            )}
          </div>
        </section>

        {/* B.6 + B.7 — Spotlight (full-width slab). */}
        <SpotlightSection
          data={spotlight}
          errored={spotlightErrored}
          messages={messages}
        />

        {/* C + D — 2-column: All Kudos feed (left) + personal sidebar
            (right, 422 px). Grid collapses to single column on < lg,
            sidebar smoothly stacks below per FR-017. */}
        <div className="mx-auto grid w-full max-w-[1152px] grid-cols-1 gap-8 px-4 pb-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_422px] 2xl:max-w-[1400px] 2xl:px-12">
          <section
            id="feed"
            className="flex w-full min-w-0 flex-col gap-6"
            aria-label={messages.kudos.feed.sectionTitle}
          >
            <AllKudosHeader messages={messages} />
            <div className="flex w-full flex-col items-center">
              {feedErrored ? (
                <InlineError messages={messages} block="feed" />
              ) : feedPage && feedPage.items.length > 0 ? (
                <KudoListClient
                  initialPage={feedPage}
                  filters={filters}
                  messages={messages}
                  locale={locale}
                  viewerId={user.id}
                />
              ) : (
                <EmptyState
                  messages={messages}
                  variant={
                    filters.hashtag || filters.department
                      ? "filtered"
                      : "feedEmpty"
                  }
                />
              )}
            </div>
          </section>

          {/* D — personal stats sidebar (desktop sticky; stacks on < lg). */}
          <KudoStatsSidebar
            stats={stats}
            giftees={giftees}
            errored={statsErrored}
            messages={messages}
          />
        </div>
      </main>
      <SiteFooter navItems={FOOTER_NAV} showLogo />
      <QuickActionsFab labels={fabLabels} />
    </>
  );
}
