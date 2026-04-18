import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/libs/i18n/getMessages";
import { Icon } from "@/components/ui/Icon";

// Sun* Kudos promo — design-style §D1. The golden-arc illustration spans the
// entire card as a full-bleed background. Text content sits on the left
// half, the Sun* Kudos wordmark on the right, both overlaid on the artwork.
export async function KudosPromoBlock() {
  const { messages } = await getMessages();
  const k = messages.homepage.kudos;

  return (
    <section className="mx-auto w-full max-w-[1224px] px-4 sm:px-8 lg:px-0">
      <div className="relative overflow-hidden rounded-lg bg-[var(--color-card)]">
        {/* Full-bleed golden-arc background covers the whole card. */}
        <Image
          src="/images/sunkudos-promo.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) 1224px, 100vw"
          className="pointer-events-none select-none object-cover object-center"
        />
        {/* Left-side dark fade so the text block stays legible over the
            artwork; fades to transparent on the right where the Kudos logo
            sits. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,20,25,0.92) 0%, rgba(11,20,25,0.82) 35%, rgba(11,20,25,0.55) 55%, rgba(11,20,25,0.2) 75%, rgba(11,20,25,0) 100%)",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 gap-6 p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-8 lg:p-12">
          <div className="flex flex-col gap-5 max-w-[520px]">
            <p className="font-[family-name:var(--font-montserrat)] text-lg leading-7 font-bold text-white sm:text-xl sm:leading-8">
              {k.caption}
            </p>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-[var(--color-accent-cream)] text-4xl leading-tight sm:text-5xl lg:text-[52px] lg:leading-[60px] lg:tracking-[-0.25px]">
              {k.title}
            </h2>
            <p className="font-[family-name:var(--font-montserrat)] text-xs leading-5 font-bold uppercase tracking-[0.1em] text-white">
              {k.descriptionHeadline}
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-sm leading-6 font-normal tracking-[0.3px] text-white/90">
              {k.descriptionBody}
            </p>
            <Link
              href="/kudos"
              className="inline-flex items-center gap-2 self-start rounded-md bg-[var(--color-accent-cream)] px-5 py-2.5 font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold text-[var(--color-brand-900)] transition-colors hover:bg-[var(--color-accent-cream-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {k.detail}
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
          <div className="hidden h-full min-h-[240px] items-center justify-center lg:flex">
            <Image
              src="/images/logo_footer_Kudos.png"
              alt="Sun* Kudos"
              width={728}
              height={147}
              className="h-auto w-[80%] max-w-[520px] select-none"
              style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
