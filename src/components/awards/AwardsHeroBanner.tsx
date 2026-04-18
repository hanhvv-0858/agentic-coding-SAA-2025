import { HeroBackdrop } from "@/components/homepage/HeroBackdrop";
import { getMessages } from "@/libs/i18n/getMessages";

/**
 * Awards page hero banner — reuses the Homepage full-bleed backdrop + gradient
 * and adds two text anchors:
 *
 *  1. Top-left: ROOT FURTHER decorative wordmark (`aria-hidden`, NOT an `<h1>`
 *     — FR-016) so the page has exactly one `<h1>` (the title below).
 *  2. Center-bottom: caption `<p>` + `<h1>` title block.
 */
export async function AwardsHeroBanner() {
  const { messages } = await getMessages();
  const caption = messages.awards.hero.caption;
  const title = messages.awards.hero.title;

  return (
    <section className="relative w-full overflow-hidden min-h-[420px] lg:min-h-[627px]">
      <HeroBackdrop />

      {/* Decorative ROOT FURTHER wordmark top-left — aria-hidden, not a heading. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 left-6 z-10 sm:left-12 lg:top-28 lg:left-36"
      >
        <span className="block font-[family-name:var(--font-montserrat)] text-3xl leading-[0.9] font-bold uppercase tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
          ROOT
        </span>
        <span className="block font-[family-name:var(--font-montserrat)] text-3xl leading-[0.9] font-bold uppercase tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
          FURTHER
        </span>
      </div>

      {/* Center-bottom title block. */}
      <div className="absolute inset-x-0 bottom-12 z-10 flex flex-col items-center px-6 text-center lg:bottom-20">
        <p className="font-[family-name:var(--font-montserrat)] text-lg leading-7 font-bold text-white sm:text-2xl sm:leading-8">
          {caption}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-montserrat)] text-3xl leading-[1.1] font-bold tracking-tight text-[var(--color-accent-cream)] sm:text-5xl lg:text-[57px] lg:leading-[64px] lg:tracking-[-0.25px]">
          {title}
        </h1>
      </div>
    </section>
  );
}
