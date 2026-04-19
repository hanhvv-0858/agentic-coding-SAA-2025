"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/useCountdown";
import { track } from "@/libs/analytics/track";
import { CountdownUnit } from "./CountdownUnit";

type PrelaunchCountdownProps = {
  eventStartAt?: string;
  labels: { days: string; hours: string; minutes: string };
};

function toDigits(value: string): [string, string] {
  return [value.charAt(0), value.charAt(1)];
}

// Client island — drives the tick via `useCountdown`, renders 3 unit columns,
// and handles the T-0 transition: fire analytics then push to `/login`.
// The `<div role="timer">` announces the remaining time to screen readers
// via `aria-label`; individual tiles are `aria-hidden`.
export function PrelaunchCountdown({ eventStartAt, labels }: PrelaunchCountdownProps) {
  const router = useRouter();
  const { days, hours, minutes, hasLaunched } = useCountdown(eventStartAt);
  const transitionedRef = useRef(false);

  useEffect(() => {
    // Only fire the T-0 transition once, and only when we actually had a
    // target to count down to (don't redirect users who landed with a
    // missing env var).
    if (!hasLaunched || !eventStartAt || transitionedRef.current) return;
    transitionedRef.current = true;
    try {
      track({ type: "prelaunch_launch_transition" });
    } catch {
      /* swallow — analytics failure MUST NOT block navigation */
    }
    router.push("/login");
  }, [hasLaunched, eventStartAt, router]);

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${labels.days.toLowerCase()}: ${days}, ${labels.hours.toLowerCase()}: ${hours}, ${labels.minutes.toLowerCase()}: ${minutes}`}
      className="flex flex-row items-start gap-6 sm:gap-10 lg:gap-[60px]"
    >
      <CountdownUnit label={labels.days} digits={toDigits(days)} />
      <CountdownUnit label={labels.hours} digits={toDigits(hours)} />
      <CountdownUnit label={labels.minutes} digits={toDigits(minutes)} />
    </div>
  );
}
