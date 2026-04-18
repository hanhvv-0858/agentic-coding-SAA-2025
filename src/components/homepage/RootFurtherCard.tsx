import { getMessages } from "@/libs/i18n/getMessages";
import { RootFurtherTitle } from "./RootFurtherTitle";

// "Root Further" narrative block — sits on the shared hero backdrop. The
// block itself is transparent: only a soft radial vignette darkens the
// center so body copy stays legible while the colorful artwork bleeds
// through from the page-wide background.
export async function RootFurtherCard() {
  const { messages } = await getMessages();
  const rf = messages.homepage.rootFurther;

  return (
    <section className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-8 lg:px-16">
      {/* Soft vignette for text legibility — sits on top of the shared
          backdrop but below the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,16,26,0.70) 0%, rgba(0,16,26,0.35) 60%, rgba(0,16,26,0) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center py-16 sm:py-20 lg:py-24">
        <RootFurtherTitle className="text-center text-[var(--color-accent-cream)] text-4xl sm:text-5xl lg:text-6xl" />

        <div className="mx-auto mt-10 flex max-w-[920px] flex-col gap-5 text-center font-[family-name:var(--font-montserrat)] text-[15px] leading-7 font-normal tracking-[0.3px] text-white/95 sm:text-base sm:leading-[28px]">
          {rf.paragraphs.map((p, i) => (
            <p key={`before-${i}`}>{p}</p>
          ))}

          <blockquote className="flex flex-col items-center gap-1 py-6">
            <p className="font-[family-name:var(--font-montserrat)] text-lg font-bold italic text-white sm:text-xl">
              &ldquo;{rf.quote}&rdquo;
            </p>
            <cite className="font-[family-name:var(--font-montserrat)] text-sm not-italic text-white/80">
              {rf.quoteAttribution}
            </cite>
          </blockquote>

          {rf.paragraphsAfter.map((p, i) => (
            <p key={`after-${i}`}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
