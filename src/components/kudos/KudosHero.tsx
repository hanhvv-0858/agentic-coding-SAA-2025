import Image from "next/image";
import type { ReactNode } from "react";
import type { Messages } from "@/libs/i18n/getMessages";

type KudosHeroProps = {
  messages: Messages;
  /** Pills overlayed in the lower-left of the hero (composer + search). */
  pillsSlot?: ReactNode;
};

/**
 * §A Kudos Hero (design-style §3–6) — full-bleed 1440×512 keyvisual with
 * an angled radial cover and the `KudosHeroContent` inner frame
 * (`2940:13437`) anchored top-left at `144×184`. Holds the single H1
 * (FR-018), the decorative "KUDOS" logotype beneath it, and the composer
 * pill + Sunner search pill in the lower region (A.1, A.2).
 */
export function KudosHero({ messages, pillsSlot }: KudosHeroProps) {
  return (
    <section
      className="relative isolate w-full overflow-hidden"
      aria-labelledby="kudos-hero-title"
    >
      <div className="relative h-[420px] w-full sm:h-[480px] lg:h-[512px]">
        <Image
          src="/images/homepage-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(25deg,var(--color-brand-900)_14.74%,rgba(0,19,32,0)_47.8%)]"
        />
      </div>

      {/* Inner content frame — 1152px wide, anchored at left=144/top=184
          on desktop, with proportional insets on smaller viewports. */}
      <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1152px] px-4 sm:px-8 2xl:max-w-[1400px] 2xl:px-12">
        <div className="flex h-full flex-col justify-between py-10 sm:py-12 lg:py-[46px]">
          <div className="flex flex-col items-start gap-2.5">
            <h1
              id="kudos-hero-title"
              className="font-[family-name:var(--font-montserrat)] text-[clamp(28px,4vw,36px)] font-bold leading-[1.2] text-[var(--color-accent-cream)]"
            >
              {messages.kudos.hero.h1}
            </h1>
            <Image
              src="/images/logo_footer_Kudos.png"
              alt={messages.kudos.hero.decorative}
              width={728}
              height={147}
              priority
              className="h-[clamp(56px,7vw,103px)] w-auto select-none"
            />
          </div>

          {pillsSlot ? (
            <div className="pointer-events-auto mt-6 w-full">{pillsSlot}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
