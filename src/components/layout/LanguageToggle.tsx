"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { LanguageDropdown } from "@/components/login/LanguageDropdown";
import { setLocale } from "@/libs/i18n/setLocale";
import { track } from "@/libs/analytics/track";
import type { Locale } from "@/types/auth";

type LanguageToggleProps = {
  locale: Locale;
  label: string;
  ariaLabel: string;
};

const DROPDOWN_ID = "language-dropdown";

// Opens / closes the language dropdown and forwards selections to the
// `setLocale` server action. FR-008, FR-012, US3 AC2-AC5.
export function LanguageToggle({ locale, label, ariaLabel }: LanguageToggleProps) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const toggleRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (toggleRef.current && !toggleRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, close]);

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    } else if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSelect = (next: Locale) => {
    close();
    if (next === locale) return;
    track({ type: "language_change", from: locale, to: next });
    startTransition(() => {
      void setLocale(next);
    });
  };

  return (
    <div ref={toggleRef} className="relative h-14 w-[108px] flex items-center">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={DROPDOWN_ID}
        onClick={toggle}
        onKeyDown={handleKey}
        className="h-full w-full flex items-center justify-between gap-0.5 p-4 rounded text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer transition-colors"
      >
        <span className="inline-flex items-center gap-1">
          <Icon name={locale === "vi" ? "flag-vn" : "globe"} />
          <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px]">
            {label}
          </span>
        </span>
        <Icon
          name="chevron-down"
          className={`transition-transform motion-safe:duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <LanguageDropdown
          id={DROPDOWN_ID}
          currentLocale={locale}
          onSelect={handleSelect}
          onClose={close}
        />
      )}
    </div>
  );
}
