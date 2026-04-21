"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Locale } from "@/types/auth";

type LanguageDropdownProps = {
  id: string;
  currentLocale: Locale;
  onSelect: (next: Locale) => void;
  onClose: () => void;
};

// Dropdown-ngôn ngữ overlay (spec hUyaaugye2 / design-style §Component
// Style Details). Dark-navy panel with gold border + cream-highlighted
// active row. Renders `VN` / `EN` as visible text (2-letter locale codes
// per FR-003); the full language name lives in each row's `aria-label`
// (FR-010). The FR-006 "re-selecting active locale is a no-op" guard is
// enforced by `LanguageToggle.handleSelect` one layer up — the overlay
// always fires `onSelect(locale)` on click.
const ITEMS: { locale: Locale; icon: IconName; code: string; fullName: string }[] = [
  { locale: "vi", icon: "flag-vn", code: "VN", fullName: "Tiếng Việt" },
  { locale: "en", icon: "flag-gb", code: "EN", fullName: "English" },
];

export function LanguageDropdown({ id, currentLocale, onSelect, onClose }: LanguageDropdownProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Focus the active-locale row on mount so screen-reader users hear
  // "{fullName}, selected, N of 2" immediately (FR-008). Defensive
  // fallback to index 0 if `currentLocale` is somehow not in ITEMS.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("button"));
    const idx = ITEMS.findIndex((i) => i.locale === currentLocale);
    buttons[idx >= 0 ? idx : 0]?.focus();
  }, [currentLocale]);

  const handleKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    // Tab leaves the menu: close after native focus movement (FR-002(d),
    // US3 AC4). queueMicrotask schedules onClose AFTER the browser has
    // already moved focus to the next tab target.
    if (e.key === "Tab") {
      queueMicrotask(() => onClose());
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const list = listRef.current;
    if (!list) return;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("button"));
    const idx = buttons.findIndex((b) => b === document.activeElement);
    const nextIdx =
      e.key === "ArrowDown"
        ? (idx + 1) % buttons.length
        : (idx - 1 + buttons.length) % buttons.length;
    buttons[nextIdx]?.focus();
  };

  return (
    <ul
      id={id}
      ref={listRef}
      role="menu"
      onKeyDown={handleKey}
      className="absolute right-0 top-full z-30 mt-2 flex w-fit flex-col rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] motion-safe:transition-opacity motion-safe:duration-150"
    >
      {ITEMS.map(({ locale, icon, code, fullName }) => {
        const selected = locale === currentLocale;
        return (
          <li key={locale} role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              aria-label={fullName}
              onClick={() => onSelect(locale)}
              className={`inline-flex h-14 w-full cursor-pointer items-center justify-between gap-1 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-white font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)] ${
                selected
                  ? "bg-[var(--color-accent-cream)]/20"
                  : "hover:bg-[var(--color-accent-cream)]/10"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Icon name={icon} size={24} />
                <span aria-hidden="true">{code}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
