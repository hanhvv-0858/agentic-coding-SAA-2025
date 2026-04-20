import Image from "next/image";

type KudoImageRowProps = {
  images: string[];
  /** Locale-resolved image alt (fallback — individual images inherit index). */
  alt: string;
};

const MAX_THUMBS = 5;

/**
 * §17c KudoImages — up to 5 square 88×88 thumbnails, 16 px gap,
 * left-aligned. Any 6th+ image is hidden from the row (deep-link to
 * detail view exposes the remainder — Open Question Q2).
 *
 * Phase 3 seed script does NOT include attachment binaries (per the
 * Phase 3 scope), so most feed rows pass `images={[]}` and this
 * component renders nothing. The signature is wired now so Phase 5/6
 * can drop attachments in without touching KudoPostCard.
 */
export function KudoImageRow({ images, alt }: KudoImageRowProps) {
  if (!images || images.length === 0) return null;
  const capped = images.slice(0, MAX_THUMBS);
  return (
    <div
      className="flex flex-row items-center gap-4"
      data-testid="kudo-image-row"
    >
      {capped.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-md border-2 border-[var(--color-accent-cream)] sm:h-16 sm:w-16"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            sizes="88px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
