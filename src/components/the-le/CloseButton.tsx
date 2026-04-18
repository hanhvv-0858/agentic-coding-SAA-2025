"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { track } from "@/libs/analytics/track";

type CloseButtonProps = {
  label: string;
};

// "Đóng" — closes the Thể lệ screen. `router.back()` when there is history,
// else falls back to `/` (FR-002 / FR-007). Fires the `rules_close` analytics
// event with `via: "button"` (FR-015) wrapped in try/catch so a failing
// tracker does not block navigation.
export function CloseButton({ label }: CloseButtonProps) {
  const router = useRouter();
  const handleClick = () => {
    try {
      track({ type: "rules_close", via: "button" });
    } catch {
      /* swallow — analytics MUST NOT block navigation (FR-015) */
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <PrimaryButton
      variant="secondary"
      size="md"
      leadingIcon={<Icon name="close" size={24} aria-hidden="true" />}
      onClick={handleClick}
    >
      {label}
    </PrimaryButton>
  );
}
