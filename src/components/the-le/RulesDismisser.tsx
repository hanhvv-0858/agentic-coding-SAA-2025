"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/libs/analytics/track";

type RulesDismisserProps = {
  children: ReactNode;
};

// Thin wrapper that turns the Esc key into a back-nav on the Thể lệ route.
// Route mode — no focus trap, backdrop, or body-scroll-lock (those are
// modal-only behaviours; see plan.md §Scope of RulesDismisser in route mode).
export function RulesDismisser({ children }: RulesDismisserProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      try {
        track({ type: "rules_close", via: "esc" });
      } catch {
        /* swallow */
      }
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  return <>{children}</>;
}
