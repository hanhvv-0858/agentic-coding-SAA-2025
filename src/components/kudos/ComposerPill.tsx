"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/libs/analytics/track";

type ComposerPillProps = {
  placeholder: string;
};

/**
 * §A.1 Composer pill — 738×72 cream-bordered pill. Click / Enter →
 * `router.push('/kudos/new')` + emit `kudos_compose_open` analytics
 * (plan §Analytics, US8 #1).
 */
export function ComposerPill({ placeholder }: ComposerPillProps) {
  const router = useRouter();

  const open = () => {
    track({ type: "kudos_compose_open", source: "liveboard_pill" });
    router.push("/kudos/new");
  };

  return (
    <button
      type="button"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="flex h-[72px] w-full max-w-[738px] flex-row items-center gap-4 rounded-[var(--radius-pill)] border border-[var(--color-accent-cream)]/70 bg-[var(--color-secondary-btn-fill)] px-6 text-left text-white transition hover:bg-[var(--color-accent-cream)]/20 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
    >
      <Icon name="pencil" size={24} />
      <span className="font-[family-name:var(--font-montserrat)] text-base">
        {placeholder}
      </span>
    </button>
  );
}
