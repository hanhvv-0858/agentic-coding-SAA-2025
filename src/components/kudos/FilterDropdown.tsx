"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Messages } from "@/libs/i18n/getMessages";

export type FilterDropdownKind = "hashtag" | "department";

export type FilterDropdownOption = {
  /**
   * Canonical value (hashtag slug or department code) that lives in the URL.
   */
  value: string;
  /**
   * Human-readable label (locale-resolved for both hashtags + departments
   * by the caller's Server Action — see `getKudoHashtags()` /
   * `getKudoDepartments()`).
   */
  label: string;
};

type FilterDropdownProps = {
  kind: FilterDropdownKind;
  options: FilterDropdownOption[];
  value: string | null;
  onSelect: (next: string | null) => void;
  messages: Messages;
  /**
   * When true the control renders in its disabled state (server action
   * rejected or returned no options). Mirrors design-style §7 state
   * "Disabled (no hashtags loaded)".
   */
  disabled?: boolean;
  /**
   * Retry callback — rendered as an inline button below the label when
   * `disabled` is true (US4 #3 "Không tải được… Retry").
   */
  onRetry?: () => void;
};

/**
 * §B.1.1 HashtagFilterButton / §B.1.2 DepartmentFilterButton — single
 * combobox component parameterised by `kind`. Behaves as a popover
 * listbox with single-select; the parent owns the active value + URL
 * writes.
 *
 * Visual design per spec JWpsISMAaM (Dropdown Hashtag filter):
 * dark-navy panel `#00070C`, cream `#998C5F` border, selected item
 * carries cream-tint 10 % fill + text-shadow glow. Both Hashtag and
 * Department chips render via this same component.
 *
 * Clearing the filter is done by re-selecting the currently-active
 * item (toggle-off, FR-003). There is NO virtual "All hashtags /
 * All departments" first row — the active-chip ✕ button in
 * `FilterBar` is the alternative clear path.
 *
 * ARIA: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`,
 * keyboard ArrowUp/ArrowDown/Home/End/Enter/Escape, outside-click
 * closes (via `window` listener so iOS Safari body taps register).
 */
export function FilterDropdown({
  kind,
  options,
  value,
  onSelect,
  messages,
  disabled = false,
  onRetry,
}: FilterDropdownProps) {
  const filters = messages.kudos.filters;
  const label = kind === "hashtag" ? filters.hashtagLabel : filters.departmentLabel;
  const iconName = kind === "hashtag" ? "hashtag" : "building";

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  });
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeLabel = useMemo(() => {
    if (!value) return label;
    const hit = options.find((o) => o.value === value);
    return hit ? `${label}: ${hit.label}` : label;
  }, [options, value, label]);

  // Outside-click closes the popover. Bound to `window` (not `document`)
  // so iOS Safari body-click-through taps also close reliably
  // (spec TR-003).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const node = containerRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => {
      if (!prev) {
        const idx = options.findIndex((o) => o.value === (value ?? ""));
        setActiveIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }, [disabled, options, value]);

  const commit = useCallback(
    (idx: number) => {
      const opt = options[idx];
      if (!opt) return;
      // Toggle-off (FR-003): clicking the currently-selected item
      // clears the filter; any other item applies its slug/code.
      const next = opt.value === value ? null : opt.value;
      onSelect(next);
      setOpen(false);
      // Restore focus to the trigger for keyboard users.
      queueMicrotask(() => buttonRef.current?.focus());
    },
    [options, onSelect, value],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          return;
        }
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, options.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(Math.max(0, options.length - 1));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          commit(activeIndex);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          queueMicrotask(() => buttonRef.current?.focus());
          break;
      }
    },
    [open, disabled, options.length, activeIndex, commit],
  );

  const isSelected = value !== null && value !== "";

  return (
    <div
      ref={containerRef}
      className="relative inline-flex flex-col"
      data-testid={`filter-dropdown-${kind}`}
    >
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={activeLabel}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        data-open={open ? "true" : undefined}
        data-selected={isSelected ? "true" : undefined}
        className={[
          "inline-flex h-14 w-fit items-center gap-2 rounded-[var(--radius-filter-chip,4px)] border px-4 py-4",
          "font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.5px]",
          "transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-[rgba(255,234,158,0.15)]",
          "border-[var(--color-border-secondary,#998C5F)]",
          isSelected
            ? "bg-[rgba(255,234,158,0.20)] text-[var(--color-accent-cream)]"
            : "bg-[rgba(255,234,158,0.10)] text-white",
          open ? "bg-[rgba(255,234,158,0.20)]" : "",
        ].join(" ")}
      >
        <Icon name={iconName} size={16} />
        <span>{isSelected ? activeLabel : label}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={
            open
              ? "rotate-180 transition-transform motion-reduce:transition-none"
              : "transition-transform motion-reduce:transition-none"
          }
        />
      </button>

      {disabled && onRetry ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
          <span>{filters.loadError}</span>
          <button
            type="button"
            onClick={onRetry}
            className="underline underline-offset-2 hover:text-[var(--color-accent-cream)]"
          >
            {filters.retryLabel}
          </button>
        </div>
      ) : null}

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={[
            // Dark-navy popover panel — spec JWpsISMAaM §B.1.
            "absolute left-0 top-[calc(100%+8px)] z-50 flex w-[215px] min-w-full max-w-[260px] flex-col items-start overflow-y-auto",
            "max-h-[min(640px,calc(100vh-160px))]",
            "rounded-lg border border-[var(--color-border-secondary,#998C5F)] bg-[var(--color-details-container-2,#00070C)] p-1.5",
            "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
          ].join(" ")}
          data-testid={`filter-dropdown-${kind}-listbox`}
        >
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-white/60">
              {filters.emptyList}
            </li>
          ) : (
            options.map((opt, idx) => {
              const selected = (value ?? "") === opt.value;
              const active = idx === activeIndex;
              return (
                <li
                  key={`${opt.value}-${idx}`}
                  role="option"
                  aria-selected={selected}
                  data-active={active ? "true" : undefined}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => commit(idx)}
                  className={[
                    "flex h-14 w-full cursor-pointer items-center gap-1 rounded p-4",
                    "font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.5px] text-white",
                    "hover:bg-[var(--color-accent-cream)]/8",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]",
                    active ? "bg-[var(--color-accent-cream)]/8" : "",
                    selected
                      ? "bg-[var(--color-accent-cream)]/10 [text-shadow:_0_4px_4px_rgba(0,0,0,0.25),_0_0_6px_#FAE287]"
                      : "",
                  ].join(" ")}
                >
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
