import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getMessages } from "@/libs/i18n/getMessages";
import { clientEnv } from "@/libs/env/client";
import { track } from "@/libs/analytics/track";
import { PrelaunchCountdown } from "@/components/countdown/PrelaunchCountdown";

// Indirection so React's `react-hooks/purity` lint doesn't flag the
// intentional `Date.now()` read in a Server Component (SC renders per
// request, not per React lifecycle).
function serverNow(): number {
  return Date.now();
}

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getMessages();
  return {
    title: messages.countdown.prelaunch.meta.title,
    description: messages.countdown.prelaunch.meta.description,
  };
}

// Prelaunch countdown — PUBLIC, chromeless route (no SiteHeader / SiteFooter
// / FAB per plan Q8). Server-side gate redirects to `/login` once the event
// has started so new visits post-launch never see a frozen `00:00:00`.
export default async function CountdownPage() {
  // Prelaunch counts down to mốc A — NEXT_PUBLIC_SITE_LAUNCH_AT. This is
  // independent of NEXT_PUBLIC_CEREMONY_AT (mốc B) which powers the
  // Homepage hero countdown.
  const siteLaunchAt = clientEnv.NEXT_PUBLIC_SITE_LAUNCH_AT;
  const { messages } = await getMessages();

  // Server-side post-launch gate (FR-008). `Date.now()` is intentional in a
  // Server Component — this path runs once per request on the edge, not on
  // the React client re-render lifecycle the purity rule targets.
  const now = serverNow();
  if (siteLaunchAt) {
    const target = Date.parse(siteLaunchAt);
    if (!Number.isNaN(target) && now >= target) {
      redirect("/login");
    }
  }

  const remainingMinutes = siteLaunchAt
    ? Math.max(0, Math.floor((Date.parse(siteLaunchAt) - now) / 60_000))
    : 0;

  try {
    track({ type: "prelaunch_view", remaining_minutes: remainingMinutes });
  } catch {
    /* swallow — analytics MUST NOT block render */
  }

  const cd = messages.homepage.countdown;

  return (
    <main className="relative w-full min-h-dvh overflow-hidden bg-[var(--color-brand-900)]">
      <Image
        src="/images/homepage-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="absolute inset-0 z-0 object-cover object-center"
        unoptimized
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)",
        }}
      />
      <section className="relative z-20 flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16 sm:px-12 sm:py-20 lg:px-36 lg:py-24">
        <h1 className="text-center font-[family-name:var(--font-montserrat)] font-bold text-white text-[24px] leading-[32px] sm:text-[32px] sm:leading-[44px] lg:text-[36px] lg:leading-[48px]">
          {messages.countdown.prelaunch.headline}
        </h1>
        <PrelaunchCountdown
          eventStartAt={siteLaunchAt}
          labels={{ days: cd.days, hours: cd.hours, minutes: cd.minutes }}
        />
      </section>
    </main>
  );
}
