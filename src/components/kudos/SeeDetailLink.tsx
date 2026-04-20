"use client";

import { toast } from "@/libs/toast";
import { Icon } from "@/components/ui/Icon";

type SeeDetailLinkProps = {
  kudoId: string;
  label: string;
  parkedToastMessage: string;
};

/**
 * §17h "Xem chi tiết ↗" link inside `KudoCardActionBar` (design node
 * `3127:21871`). The detail route is parked (FR-012), so click fires
 * the shared "Đang xây dựng" toast via `src/libs/toast.ts`.
 */
export function SeeDetailLink({
  kudoId,
  label,
  parkedToastMessage,
}: SeeDetailLinkProps) {
  const handleClick = () => {
    toast({ message: parkedToastMessage, role: "status" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid="kudo-see-detail"
      data-kudo-id={kudoId}
      className="inline-flex items-center gap-1 rounded font-[family-name:var(--font-montserrat)] text-base font-bold text-[var(--color-brand-900)] transition hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-900)]"
    >
      <span>{label}</span>
      <Icon name="arrow-up-right" size={16} />
    </button>
  );
}
