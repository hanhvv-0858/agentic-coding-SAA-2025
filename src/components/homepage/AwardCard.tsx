import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Award } from "@/data/awards";

type AwardCardProps = {
  award: Award;
  title: string;
  description: string;
  detailLabel: string;
};

// Award card — design-style §9. No outer card wrapper — just a golden badge
// square with the award name burned in, followed by a title + short description
// and a "detail" link. Entire block is a Link so any inner element navigates.
export function AwardCard({ award, title, description, detailLabel }: AwardCardProps) {
  return (
    <Link
      href={`/awards#${award.slug}`}
      className="group flex flex-col gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-4 rounded-sm"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md transition-transform duration-200 ease-out group-hover:-translate-y-1">
        <Image
          src="/images/awards/award-frame.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center"
        />
        <span
          className="absolute inset-0 flex items-center justify-center px-4 text-center font-[family-name:var(--font-montserrat)] font-bold uppercase tracking-tight text-[var(--color-accent-cream)]"
          style={{
            fontSize: "clamp(15px, 1.9vw, 22px)",
            lineHeight: 1.1,
            textShadow: "0 2px 10px rgba(0,0,0,0.55)",
          }}
        >
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-[family-name:var(--font-montserrat)] text-lg leading-6 font-bold text-[var(--color-accent-cream)] sm:text-xl sm:leading-7">
          {title}
        </h3>
        <p
          className="font-[family-name:var(--font-montserrat)] text-sm leading-5 font-normal tracking-[0.2px] text-white/80 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </p>
        <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-montserrat)] text-sm leading-5 font-medium text-white transition-colors group-hover:text-[var(--color-accent-cream)]">
          {detailLabel}
          <Icon name="arrow-up-right" size={14} />
        </span>
      </div>
    </Link>
  );
}
