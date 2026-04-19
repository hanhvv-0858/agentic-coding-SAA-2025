"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { CountdownTile } from "./CountdownTile";

type CountdownProps = {
  eventStartAt?: string;
  labels: { days: string; hours: string; minutes: string; fallback: string };
};

function toDigits(value: string): [string, string] {
  return [value.charAt(0), value.charAt(1)];
}

// Countdown — FR-002 / FR-003. Consumes the shared `useCountdown` hook so the
// Prelaunch screen can reuse the same tick engine. Renders a fallback when
// the env var is missing/unparseable. Flip-clock tile aesthetic.
export function Countdown({ eventStartAt, labels }: CountdownProps) {
  const { days, hours, minutes, hasLaunched } = useCountdown(eventStartAt);

  if (hasLaunched && !eventStartAt) {
    return (
      <p
        aria-live="polite"
        className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold text-white/80"
      >
        {labels.fallback}
      </p>
    );
  }

  return (
    <div aria-live="polite" className="flex flex-wrap items-start gap-4 sm:gap-6">
      <CountdownTile digits={toDigits(days)} label={labels.days} />
      <CountdownTile digits={toDigits(hours)} label={labels.hours} />
      <CountdownTile digits={toDigits(minutes)} label={labels.minutes} />
    </div>
  );
}
