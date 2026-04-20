"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/libs/toast";
import type { Messages } from "@/libs/i18n/getMessages";

type MoQuaCTAProps = {
  unopened: number;
  messages: Messages;
};

/**
 * §D.1.8 "Mở quà" CTA. Disabled + `aria-disabled="true"` when the
 * caller has zero unopened secret boxes per FR-010. Click when enabled
 * tries `/gifts/open` (parked route) and falls back to the parked
 * toast copy per FR-012.
 */
export function MoQuaCTA({ unopened, messages }: MoQuaCTAProps) {
  const router = useRouter();
  const disabled = unopened <= 0;

  const handleClick = () => {
    if (disabled) return;
    try {
      router.push("/gifts/open");
    } catch {
      toast({
        message: messages.kudos.error.parkedToast,
        role: "status",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled ? "true" : undefined}
      title={disabled ? messages.kudos.sidebar.moQuaDisabledTooltip : undefined}
      className="flex h-[60px] w-full max-w-[374px] items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-cream)] p-4 font-[family-name:var(--font-montserrat)] text-[22px] font-bold leading-7 text-[var(--color-brand-900)] transition hover:bg-[var(--color-accent-cream-hover,#FFE586)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--color-accent-cream)]"
      data-testid="kudos-mo-qua-cta"
    >
      <span>{messages.kudos.sidebar.moQuaCta}</span>
      <Image
        src="/icons/icon_open_gift@2x.png"
        alt=""
        aria-hidden="true"
        width={56}
        height={56}
        className="h-7 w-7 select-none"
      />
    </button>
  );
}
