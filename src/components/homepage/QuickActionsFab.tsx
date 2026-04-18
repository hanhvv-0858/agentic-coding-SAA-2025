"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type QuickActionsFabProps = {
  openMenuLabel: string;
  writeKudoLabel: string;
};

// Floating quick-actions pill CTA — design-style §Widget Button. Click opens
// a small popover with 1 item linking to /kudos/new. Esc + outside click
// close the popover.
export function QuickActionsFab({ openMenuLabel, writeKudoLabel }: QuickActionsFabProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          role="menu"
          aria-label={openMenuLabel}
          className="mb-3 flex min-w-[200px] flex-col overflow-hidden rounded-lg bg-[var(--color-brand-800)] shadow-lg ring-1 ring-white/10"
        >
          <Link
            href="/kudos/new"
            role="menuitem"
            onClick={close}
            className="flex items-center justify-between gap-3 px-4 py-3 font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
          >
            {writeKudoLabel}
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      )}
      <button
        type="button"
        aria-label={openMenuLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-16 items-center gap-2 rounded-full bg-[var(--color-accent-cream)] px-4 text-[var(--color-brand-900)] transition-colors hover:bg-[var(--color-accent-cream-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 cursor-pointer"
      >
        <Icon name="pencil" size={24} />
        <span className="font-[family-name:var(--font-montserrat)] text-[22px] leading-7 font-bold">/</span>
        <Icon name="saa" size={28} />
      </button>
    </div>
  );
}
