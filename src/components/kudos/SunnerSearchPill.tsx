"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { searchSunner } from "@/app/kudos/actions";
import type { KudoUser } from "@/types/kudo";

type SunnerSearchPillProps = {
  placeholder: string;
};

/**
 * §A.2 Sunner search pill — 381×72 cream-bordered pill with magnifier.
 * Debounced 300 ms input → calls `searchSunner()` Server Action.
 * Phase 3 ships UI-only with stubbed results (Server Action returns
 * `[]` until Phase 8).
 */
export function SunnerSearchPill({ placeholder }: SunnerSearchPillProps) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<KudoUser[]>([]);
  const [, startTransition] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    // Minimal inline debounce (300 ms) — intentionally uses setTimeout
    // instead of a shared hook; the shared useDebouncedCallback lands
    // in Phase 4 (tasks.md T023).
    const scheduled = next;
    window.setTimeout(() => {
      if (scheduled !== next) return;
      startTransition(async () => {
        if (scheduled.trim().length === 0) {
          setResults([]);
          return;
        }
        const data = await searchSunner(scheduled);
        setResults(data);
      });
    }, 300);
  };

  return (
    <div className="relative flex w-full max-w-[381px] flex-col gap-2">
      <label className="relative flex h-[72px] flex-row items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-accent-cream)]/70 bg-[var(--color-secondary-btn-fill)] px-6 text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-accent-cream)]">
        <Icon name="search" size={24} />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-[family-name:var(--font-montserrat)] text-base text-white placeholder:text-white focus:outline-none"
        />
      </label>
      {results.length > 0 ? (
        <ul className="absolute top-full left-0 z-10 mt-2 w-full overflow-hidden rounded-md bg-[var(--color-kudo-card)] text-[var(--color-brand-900)] shadow-[var(--shadow-kudo-card)]">
          {results.map((u) => (
            <li key={u.id} className="px-4 py-2 text-sm">
              {u.display_name ?? u.id}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
