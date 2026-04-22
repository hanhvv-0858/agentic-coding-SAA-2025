"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";
import { Icon } from "@/components/ui/Icon";
import type { HashtagOption } from "@/types/kudo";

// Compose-time hashtag multi-select picker — spec p9zO-c4a4x.
// Dark-navy listbox family (sibling of FilterDropdown + LanguageDropdown).
// Click on row toggles selection; outside click / Esc / Tab-out closes.

export type HashtagPickerProps = {
  /** `undefined` = loading skeleton. `[]` = empty state. */
  options: HashtagOption[] | undefined;
  /** Currently selected slugs (0..maxSelections). */
  selectedSlugs: string[];
  /** Max selection cap; default 5. */
  maxSelections?: number;
  /** Non-null → render error state with Retry button. */
  loadError?: Error | null;
  onToggle: (slug: string) => void;
  onClose: () => void;
  onRetry?: () => void;
  /** Outside-click detection ignores clicks inside this element. */
  triggerRef: RefObject<HTMLElement | null>;
};

export function HashtagPicker({
  options,
  selectedSlugs,
  maxSelections = 5,
  loadError,
  onToggle,
  onClose,
  onRetry,
  triggerRef,
}: HashtagPickerProps) {
  const panelRef = useRef<HTMLUListElement>(null);
  const atCap = selectedSlugs.length >= maxSelections;

  // Outside-click detection scoped to exclude the trigger element.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [onClose, triggerRef]);

  // Focus-on-mount: first selected row, else first row.
  useEffect(() => {
    if (!options || options.length === 0) return;
    const panel = panelRef.current;
    if (!panel) return;
    const optionEls = Array.from(panel.querySelectorAll<HTMLLIElement>('li[role="option"]'));
    if (optionEls.length === 0) return;
    const firstSelectedIdx = options.findIndex((o) => selectedSlugs.includes(o.slug));
    const target = firstSelectedIdx >= 0 ? optionEls[firstSelectedIdx] : optionEls[0];
    target.focus();
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const getOptionElements = useCallback(() => {
    return Array.from(
      panelRef.current?.querySelectorAll<HTMLLIElement>('li[role="option"]') ?? [],
    );
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      triggerRef.current?.focus();
      return;
    }
    if (e.key === "Tab") {
      // Let the browser move focus; then close.
      queueMicrotask(() => onClose());
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const optionEls = getOptionElements();
    if (optionEls.length === 0) return;
    const currentIdx = optionEls.findIndex((el) => el === document.activeElement);
    const nextIdx =
      e.key === "ArrowDown"
        ? (currentIdx + 1) % optionEls.length
        : (currentIdx - 1 + optionEls.length) % optionEls.length;
    // Update roving tabindex.
    optionEls.forEach((el, i) => {
      el.tabIndex = i === nextIdx ? 0 : -1;
    });
    optionEls[nextIdx].focus();
  };

  const handleOptionKey = (
    e: React.KeyboardEvent<HTMLLIElement>,
    opt: HashtagOption,
    isSelected: boolean,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isSelected && atCap) return;
      onToggle(opt.slug);
    }
  };

  // Loading skeleton.
  if (options === undefined && !loadError) {
    return (
      <ul
        ref={panelRef}
        role="listbox"
        aria-multiselectable="true"
        aria-label="Chọn hashtag"
        className="absolute left-0 top-full z-40 mt-[14px] flex w-[318px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-200px)] flex-col gap-1 overflow-y-auto rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      >
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="h-11 w-full rounded-sm bg-white/5 motion-safe:animate-pulse sm:h-10"
            aria-hidden
          />
        ))}
      </ul>
    );
  }

  // Error state.
  if (loadError) {
    return (
      <div
        ref={panelRef as unknown as RefObject<HTMLDivElement>}
        role="alert"
        className="absolute left-0 top-full z-40 mt-[14px] w-[318px] max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      >
        <p className="text-base leading-6 font-bold text-[var(--color-error)] font-[family-name:var(--font-montserrat)]">
          Không tải được hashtag.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 cursor-pointer text-base leading-6 font-bold text-[var(--color-accent-cream)] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  // Empty state.
  if (options && options.length === 0) {
    return (
      <ul
        ref={panelRef}
        role="listbox"
        aria-multiselectable="true"
        aria-label="Chọn hashtag"
        className="absolute left-0 top-full z-40 mt-[14px] w-[318px] max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      >
        <li className="text-base leading-6 font-bold text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]">
          Chưa có hashtag
        </li>
      </ul>
    );
  }

  // Happy path — render all options.
  return (
    <ul
      ref={panelRef}
      role="listbox"
      aria-multiselectable="true"
      aria-label="Chọn hashtag"
      onKeyDown={handleKey}
      className="absolute left-0 top-full z-40 mt-[14px] flex w-[318px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-200px)] flex-col overflow-y-auto rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] motion-safe:transition-opacity motion-safe:duration-150"
    >
      {options!.map((opt, idx) => {
        const isSelected = selectedSlugs.includes(opt.slug);
        const disabled = !isSelected && atCap;
        return (
          <li
            key={opt.slug}
            role="option"
            aria-selected={isSelected}
            aria-disabled={disabled || undefined}
            tabIndex={idx === 0 ? 0 : -1}
            onClick={() => {
              if (disabled) return;
              onToggle(opt.slug);
            }}
            onKeyDown={(e) => handleOptionKey(e, opt, isSelected)}
            className={`inline-flex h-11 w-full cursor-pointer items-center justify-between px-4 text-base leading-6 font-bold tracking-[0.15px] text-white font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 sm:h-10 ${
              isSelected
                ? "rounded-sm bg-[var(--color-accent-cream)]/20 hover:bg-[var(--color-accent-cream)]/25"
                : "bg-transparent hover:bg-[var(--color-accent-cream)]/10"
            } ${disabled ? "cursor-not-allowed opacity-50 hover:bg-transparent" : ""}`}
          >
            <span>#{opt.label}</span>
            {isSelected && (
              <Icon
                name="check"
                size={24}
                className="text-[var(--color-accent-cream)]"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
