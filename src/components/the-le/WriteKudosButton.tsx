"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { track } from "@/libs/analytics/track";

type WriteKudosButtonProps = {
  label: string;
  className?: string;
};

// Primary CTA on the Thể lệ screen — links to /kudos/new and fires the
// `rules_cta_write_kudos` analytics event. Analytics is wrapped in try/catch
// per FR-015 so a tracker failure never blocks navigation.
export function WriteKudosButton({ label, className }: WriteKudosButtonProps) {
  const handleClick = () => {
    try {
      track({ type: "rules_cta_write_kudos" });
    } catch {
      /* swallow */
    }
  };
  return (
    <Link href="/kudos/new" className={["block flex-1", className ?? ""].filter(Boolean).join(" ")}>
      <PrimaryButton
        variant="solid"
        size="md"
        leadingIcon={<Icon name="pencil" size={24} aria-hidden="true" />}
        className="w-full justify-center"
        onClick={handleClick}
      >
        {label}
      </PrimaryButton>
    </Link>
  );
}
