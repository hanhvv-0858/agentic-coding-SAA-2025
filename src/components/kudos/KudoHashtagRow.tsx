"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@/libs/analytics/track";
import type { Hashtag } from "@/types/kudo";

type KudoHashtagRowProps = {
  hashtags: Hashtag[];
};

const MAX_HASHTAGS = 5;

/**
 * §17g KudoHashtags — Phase 4 / US2 / T054 interactive variant. Each
 * pill is a `<button>` that writes `?hashtag={slug}` to the URL via
 * `router.replace()` (preserves the department param if present),
 * emits `kudos_filter_apply`, and lets the RSC re-run `getKudoFeed`
 * with the new `FilterState`. Row caps at 5 visible tags.
 */
export function KudoHashtagRow({ hashtags }: KudoHashtagRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (!hashtags || hashtags.length === 0) return null;
  const capped = hashtags.slice(0, MAX_HASHTAGS);

  const onPick = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("hashtag", slug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    track({ type: "kudos_filter_apply", kind: "hashtag", value: slug });
  };

  return (
    <ul
      className="flex w-full flex-row flex-wrap items-center gap-x-[30px] gap-y-2"
      data-testid="kudo-hashtag-row"
    >
      {capped.map((h) => (
        <li key={h.slug}>
          <button
            type="button"
            onClick={() => onPick(h.slug)}
            className="font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.5px] text-[var(--color-heart-active)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
            data-hashtag-slug={h.slug}
          >
            {"#"}
            {h.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
