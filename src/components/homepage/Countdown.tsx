"use client";

import { useEffect, useMemo, useState } from "react";
import { CountdownTile } from "./CountdownTile";

type CountdownProps = {
  eventStartAt?: string;
  labels: { days: string; hours: string; minutes: string; fallback: string };
};

type Remaining = { days: string; hours: string; minutes: string };

const ZERO: Remaining = { days: "00", hours: "00", minutes: "00" };

function computeRemaining(target: number, now: number): Remaining {
  const diff = Math.max(0, target - now);
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return {
    days: String(Math.min(days, 99)).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
  };
}

function toDigits(value: string): [string, string] {
  return [value.charAt(0), value.charAt(1)];
}

// Countdown — FR-002 / FR-003. Ticks every minute; pauses at 00:00:00 when
// the event has started. Recomputes on tab refocus so background tabs stay
// accurate without a per-second timer.
export function Countdown({ eventStartAt, labels }: CountdownProps) {
  const targetMs = useMemo(() => {
    if (!eventStartAt) return null;
    const parsed = Date.parse(eventStartAt);
    return Number.isNaN(parsed) ? null : parsed;
  }, [eventStartAt]);

  const [remaining, setRemaining] = useState<Remaining>(() =>
    targetMs === null ? ZERO : computeRemaining(targetMs, Date.now()),
  );

  useEffect(() => {
    if (targetMs === null) return;
    const tick = () => setRemaining(computeRemaining(targetMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [targetMs]);

  if (targetMs === null) {
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
      <CountdownTile digits={toDigits(remaining.days)} label={labels.days} />
      <CountdownTile digits={toDigits(remaining.hours)} label={labels.hours} />
      <CountdownTile digits={toDigits(remaining.minutes)} label={labels.minutes} />
    </div>
  );
}
