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
    <section className="relative w-full">
      {/* Top-transparent → bottom-solid gradient: the shared backdrop reads
          clearly behind the ROOT FURTHER title, then fades to solid
          brand-900 so the description paragraphs + quote sit on a clean
          dark surface — matching the design. Spans the full viewport width
          (not capped by max-w) so the solid dark floor meets the edges of
          the backdrop wrapper. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,16,26,0) 0%, rgba(0,16,26,0) 18%, rgba(0,16,26,0.85) 45%, rgba(0,16,26,1) 65%, rgba(0,16,26,1) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 py-16 sm:px-8 sm:py-20 lg:px-16 lg:py-24">
        <RootFurtherTitle variant="small" className="flex justify-center" />

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
