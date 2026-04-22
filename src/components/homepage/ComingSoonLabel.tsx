"use client";

import { useCountdown } from "@/hooks/useCountdown";

type ComingSoonLabelProps = {
  eventStartAt?: string;
  label: string;
};

// "Coming soon" subtitle above the Homepage countdown tiles. Hidden when
// no event is configured (server already skips the prop) AND hidden
// client-side once the countdown has reached T-0 — keeps the tiles on
// the frozen 00/00/00 state without the stale teaser copy.
//
// Mirrors the tick engine used by `<Countdown />` so both the subtitle
// and the digits update on the same minute boundary. See spec
// `8PJQswPZmU-countdown` FR-002 and the About-SAA T-0 requirement
// (2026-04-22 review): "khi về 0, ẩn subtitle Coming soon, giữ 00".
export function ComingSoonLabel({ eventStartAt, label }: ComingSoonLabelProps) {
  const { hasLaunched } = useCountdown(eventStartAt);
  if (!eventStartAt || hasLaunched) return null;
  return (
    <p
      aria-live="polite"
      className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-white"
    >
      {label}
    </p>
  );
}
