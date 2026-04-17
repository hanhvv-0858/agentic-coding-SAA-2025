"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/types/auth";

type LanguageDropdownProps = {
  id: string;
  currentLocale: Locale;
  onSelect: (next: Locale) => void;
  onClose: () => void;
};

// Minimal overlay menu — tokens + exact styling come from the dedicated
// `Dropdown-ngôn ngữ` Figma spec (frame hUyaaugye2) later. For now, render
// two items with keyboard nav + click.
const ITEMS: { locale: Locale; icon: "flag-vn" | "globe"; label: string }[] = [
  { locale: "vi", icon: "flag-vn", label: "Tiếng Việt" },
  { locale: "en", icon: "globe", label: "English" },
];

export function LanguageDropdown({ id, currentLocale, onSelect, onClose }: LanguageDropdownProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Focus the current item on mount so keyboard users land inside the menu.
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
      className="absolute right-0 top-full mt-2 w-[160px] rounded-lg bg-[var(--color-brand-800)] border border-[var(--color-divider)] shadow-lg p-1 z-30"
    >
      {ITEMS.map(({ locale, icon, label }) => {
        const selected = locale === currentLocale;
        return (
          <li key={locale} role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => onSelect(locale)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left text-white text-sm ${selected ? "bg-white/10" : "hover:bg-white/5"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-[-2px]`}
            >
              <Icon name={icon} size={20} />
              <span className="font-[family-name:var(--font-montserrat)]">{label}</span>
              {selected && <span aria-hidden className="ml-auto text-[var(--color-accent-cream)]">✓</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
