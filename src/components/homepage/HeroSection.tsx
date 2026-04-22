import { getMessages } from "@/libs/i18n/getMessages";
import { clientEnv } from "@/libs/env/client";
import { EventInfo } from "./EventInfo";
import { HeroCtas } from "./HeroCtas";
import { Countdown } from "./Countdown";
import { ComingSoonLabel } from "./ComingSoonLabel";
import { RootFurtherTitle } from "./RootFurtherTitle";

// Hero content column — transparent section that sits on top of the shared
// <HeroBackdrop /> provided by the page layout. Contains the hero title,
// countdown, event info and primary CTAs.
export async function HeroSection() {
  const { messages } = await getMessages();
  const comingSoon = messages.homepage.hero.comingSoon;
  // Homepage About-SAA counts down to mốc B — the awards CEREMONY.
  // Separate env var from SITE_LAUNCH_AT (the Prelaunch gate in
  // `/countdown`). Independent per 2026-04-22 review decision.
  const ceremonyAt = clientEnv.NEXT_PUBLIC_CEREMONY_AT;

  return (
    <section className="relative w-full min-h-[720px] lg:min-h-[820px]">
      <div className="relative z-10 flex flex-col gap-8 px-6 pt-32 pb-16 sm:px-12 lg:px-36 lg:pt-40 lg:pb-24">
        <div className="flex flex-col gap-8 max-w-[680px]">
          <RootFurtherTitle />
          <ComingSoonLabel eventStartAt={ceremonyAt} label={comingSoon} />
          <Countdown
            eventStartAt={ceremonyAt}
            labels={{
              days: messages.homepage.countdown.days,
              hours: messages.homepage.countdown.hours,
              minutes: messages.homepage.countdown.minutes,
              fallback: messages.homepage.countdown.fallback,
            }}
          />
          <EventInfo />
          <HeroCtas />
        </div>
      </div>
    </section>
  );
}
