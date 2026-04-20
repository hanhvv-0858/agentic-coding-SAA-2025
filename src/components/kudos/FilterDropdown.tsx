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
   * Human-readable label (locale-resolved for departments by the caller).
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
 * writes. ARIA: `role="combobox"`, `aria-haspopup="listbox"`,
 * `aria-expanded`, keyboard ArrowUp/ArrowDown/Enter/Escape, outside-
 * click closes.
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
  const allLabel = kind === "hashtag" ? filters.allHashtags : filters.allDepartments;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx + 1 : 0;
  });
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Virtual first option → "All hashtags" / "All departments" which clears the filter.
  const allOptions = useMemo<FilterDropdownOption[]>(
    () => [{ value: "", label: allLabel }, ...options],
    [options, allLabel],
  );

  const activeLabel = useMemo(() => {
    if (!value) return label;
    const hit = options.find((o) => o.value === value);
    return hit ? `${label}: ${hit.label}` : label;
  }, [options, value, label]);

  // Outside-click closes the popover.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const node = containerRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => {
      if (!prev) {
        const idx = allOptions.findIndex((o) => o.value === (value ?? ""));
        setActiveIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }, [disabled, allOptions, value]);

  const commit = useCallback(
    (idx: number) => {
      const opt = allOptions[idx];
      if (!opt) return;
      onSelect(opt.value === "" ? null : opt.value);
      setOpen(false);
      // Restore focus to the trigger for keyboard users.
      queueMicrotask(() => buttonRef.current?.focus());
    },
    [allOptions, onSelect],
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
          setActiveIndex((i) => Math.min(i + 1, allOptions.length - 1));
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
          setActiveIndex(allOptions.length - 1);
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
    [open, disabled, allOptions.length, activeIndex, commit],
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
            "absolute left-0 top-[calc(100%+8px)] z-30 flex max-h-[320px] min-w-full flex-col overflow-y-auto",
            "rounded-[var(--radius-sidebar-card,8px)] bg-[var(--color-panel-surface,#FFF9E8)] py-2",
            "shadow-[var(--shadow-fab-tile,0_8px_24px_rgba(0,0,0,0.15))]",
          ].join(" ")}
          data-testid={`filter-dropdown-${kind}-listbox`}
        >
          {allOptions.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[var(--color-brand-900)]/70">
              {filters.emptyList}
            </li>
          ) : (
            allOptions.map((opt, idx) => {
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
                    "cursor-pointer px-4 py-2 font-[family-name:var(--font-montserrat)] text-sm leading-5",
                    "text-[var(--color-brand-900)]",
                    active ? "bg-[var(--color-accent-cream)]/40" : "",
                    selected ? "font-bold" : "font-medium",
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
