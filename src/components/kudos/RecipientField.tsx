"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { searchSunner } from "@/app/kudos/actions";
import { getInitials, pickMonogramColor } from "@/libs/kudos/monogram";
import type { KudoUser } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";

// Single-select typeahead for the Viết Kudo "Người nhận" field
// (spec ihQ26W78P2 FR-002, resolved Q1 → single recipient).
// Dark-navy suggestion popover matches LanguageDropdown family.

type RecipientFieldProps = {
  value: KudoUser | null;
  onChange: (recipient: KudoUser | null) => void;
  messages: Messages;
  /** Validation error string; when set, the input gains a red border + `role="alert"` message below. */
  error?: string;
};

export function RecipientField({ value, onChange, messages, error }: RecipientFieldProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<KudoUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search — 250ms after last keystroke. All state mutations
  // happen inside the setTimeout callback (async boundary) so the
  // `react-hooks/set-state-in-effect` rule doesn't fire.
  useEffect(() => {
    const trimmed = query.trim();
    const handle = setTimeout(async () => {
      if (trimmed.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await searchSunner(trimmed);
        setSuggestions(results);
        setActiveIdx(0);
      } catch (err) {
        console.error("[compose] searchSunner failed:", err);
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  const handleSelect = useCallback(
    (user: KudoUser) => {
      onChange(user);
      setQuery("");
      setSuggestions([]);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[activeIdx]) handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const displayValue = value ? value.display_name ?? "" : query;

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1">
      <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
        <label
        htmlFor="kudo-recipient"
        className="flex w-[146px] items-center gap-0.5 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] max-sm:w-auto"
      >
        {messages.compose.fields.recipient.label}
        <span className="text-[var(--color-error)]">*</span>
      </label>
      <div className="relative flex-1 max-sm:w-full">
        <input
          ref={inputRef}
          id="kudo-recipient"
          type="text"
          value={displayValue}
          readOnly={value !== null}
          onChange={(e) => {
            if (value) onChange(null);
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!value) setIsOpen(true);
          }}
          onKeyDown={handleKey}
          aria-required="true"
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "kudo-recipient-error" : undefined}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="kudo-recipient-suggestions"
          placeholder={messages.compose.fields.recipient.placeholder}
          className={`h-14 w-full rounded-lg border bg-white px-6 py-4 pr-12 text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 placeholder:text-[var(--color-muted-grey)] ${error ? "border-[var(--color-error)]" : "border-[var(--color-border-secondary)]"}`}
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear recipient"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-grey)] hover:text-[var(--color-close-red)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
          >
            <Icon name="close" size={24} />
          </button>
        ) : (
          <Icon
            name="chevron-down"
            size={24}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-grey)] pointer-events-none"
          />
        )}
        {isOpen && suggestions.length > 0 && (
          <ul
            id="kudo-recipient-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 z-40 max-h-[240px] overflow-y-auto rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            {suggestions.map((user, idx) => (
              <li key={user.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={idx === activeIdx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(user);
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`flex w-full items-center gap-3 rounded px-4 py-3 text-left cursor-pointer ${idx === activeIdx ? "bg-[var(--color-accent-cream)]/20" : "hover:bg-[var(--color-accent-cream)]/10"}`}
                >
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-[var(--color-brand-900)]"
                      style={{
                        backgroundColor: pickMonogramColor(user.id),
                      }}
                    >
                      {getInitials(user.display_name ?? "")}
                    </span>
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-white text-base leading-6 font-bold font-[family-name:var(--font-montserrat)]">
                      {user.display_name}
                    </span>
                    {user.department_code && (
                      <span className="truncate text-xs leading-4 font-medium text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]">
                        {user.department_code}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
      {error && (
        <p
          id="kudo-recipient-error"
          role="alert"
          className="text-sm leading-5 font-medium text-[var(--color-error)] max-sm:pl-0 pl-[162px]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
