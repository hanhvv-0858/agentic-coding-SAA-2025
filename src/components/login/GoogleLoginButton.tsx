"use client";

import { useState, useTransition } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/libs/supabase/client";
import { track } from "@/libs/analytics/track";

type GoogleLoginButtonProps = {
  defaultLabel: string;
  loadingLabel: string;
  nextParam?: string | null;
};

// CTA client island — FR-003, FR-006.
// Sets loading state synchronously before awaiting Supabase so double-clicks
// can't fire two OAuth flows.
export function GoogleLoginButton({ defaultLabel, loadingLabel, nextParam }: GoogleLoginButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const handleClick = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    track({ type: "login_attempt", provider: "google" });

    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callback = new URL("/auth/callback", origin);
    if (nextParam) callback.searchParams.set("next", nextParam);

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) {
        // Put us back into a recoverable UI state — the user can retry.
        setIsSubmitting(false);
        track({ type: "login_error", provider: "google", error_code: "network" });
      }
      // On success the browser is already redirecting to accounts.google.com,
      // so we intentionally leave `isSubmitting=true`.
    });
  };

  return (
    <PrimaryButton
      onClick={handleClick}
      loading={isSubmitting}
      trailingIcon={!isSubmitting ? <Icon name="google" /> : undefined}
      aria-label={defaultLabel}
    >
      {isSubmitting ? loadingLabel : defaultLabel}
    </PrimaryButton>
  );
}
