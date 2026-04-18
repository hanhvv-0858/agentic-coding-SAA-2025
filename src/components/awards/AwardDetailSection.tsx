import Image from "next/image";
import type { Award } from "@/data/awards";
import type { Messages } from "@/libs/i18n/getMessages";
import { AwardContent } from "./AwardContent";
import { splitOverlayTitle } from "./splitOverlayTitle";

type AwardDetailSectionProps = {
  award: Award;
  messages: Messages;
  /** Pre-resolved award title (to overlay on the shared badge — decorative only). */
  title: string;
  /** Reverse 2-col order on desktop: `false` → image right / content left (odd index); `true` → image left / content right (even index). */
  reverse?: boolean;
  /** Set `true` for the first section only — marks the badge image as LCP-eligible. */
  priority?: boolean;
};

/**
 * One award detail section on `/awards`. `<section id={award.slug}>` wrapper
 * so IntersectionObserver + `scrollIntoView` can target it. 2-col alternating
 * layout on desktop (`reverse` prop), stacks single-column image-top on
 * mobile/tablet per TR-010.
 *
 * Badge visual: shared `award-frame.png` golden ring (336×336) with the
 * award title overlaid as decorative-only text (aria-hidden; the semantic
 * `<h2>` lives in AwardContent) — until the 6 unique badges are exported
 * (assets-to-export.md item #2).
 */
export function AwardDetailSection({
  award,
  messages,
  title,
  reverse = false,
  priority = false,
}: AwardDetailSectionProps) {
  return (
    <section id={award.slug} className="scroll-mt-28 py-10 lg:py-12">
      <div
        className={[
          "flex flex-col items-center gap-8 lg:gap-10 lg:items-start xl:gap-14",
          reverse ? "lg:flex-row" : "lg:flex-row-reverse",
        ].join(" ")}
      >
        <div
          className={[
            "relative aspect-square w-full max-w-[336px] shrink-0 overflow-hidden rounded-md",
            // Matches Homepage AwardCard — no outer border/ring/shadow; the
            // golden ring inside the frame image is the only visual accent.
            // Slight scale-down at md (700-1023) so the single-column stack on
            // tablet/mobile doesn't overwhelm the viewport.
            "lg:h-[300px] lg:w-[300px] xl:h-[336px] xl:w-[336px]",
          ].join(" ")}
        >
          <Image
            src="/images/awards/award-frame.png"
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 336px, (min-width: 1024px) 300px, 336px"
            className="object-cover object-center"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center font-[family-name:var(--font-montserrat)] font-bold uppercase tracking-tight text-[var(--color-accent-cream)] select-none"
            style={{
              fontSize: "clamp(18px, 2.2vw, 28px)",
              lineHeight: 1.1,
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {splitOverlayTitle(title).map((line: string, i: number) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </span>
        </div>
        <AwardContent award={award} messages={messages} />
      </div>
    </section>
  );
}
