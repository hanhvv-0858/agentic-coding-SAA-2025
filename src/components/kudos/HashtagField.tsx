"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { HashtagOption } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import { HashtagPicker } from "./HashtagPicker";

// Hashtag field — trigger + selected chips + picker overlay.
// PR 3 wires the dark-navy <HashtagPicker /> (spec p9zO-c4a4x) in
// place of the PR 2 native <select> stub.

type HashtagFieldProps = {
  options: HashtagOption[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  messages: Messages;
  /** Validation error; when set, trigger gains red border + inline message. */
  error?: string;
};

export function HashtagField({
  options,
  selectedSlugs,
  onToggle,
  messages,
  error,
}: HashtagFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const atCap = selectedSlugs.length >= 5;
  const selectedOptions = options.filter((o) => selectedSlugs.includes(o.slug));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-4 max-sm:flex-col">
      <label
        htmlFor="kudo-hashtag-trigger"
        className="flex w-[146px] items-center gap-0.5 pt-3 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] max-sm:w-auto max-sm:pt-0"
      >
        {messages.compose.fields.hashtag.label}
        <span className="text-[var(--color-error)]">*</span>
      </label>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Selected chips */}
        {selectedOptions.map((opt) => (
          <span
            key={opt.slug}
            className="inline-flex h-12 items-center gap-2 rounded border border-[var(--color-border-secondary)] bg-[var(--color-modal-paper)] px-2 py-1 text-base leading-6 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)]"
          >
            #{opt.label}
            <button
              type="button"
              onClick={() => onToggle(opt.slug)}
              aria-label={`Remove ${opt.label}`}
              className="text-[var(--color-close-red)] hover:opacity-80 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
            >
              <Icon name="close" size={16} />
            </button>
          </span>
        ))}

        {/* Trigger (hidden at cap) */}
        {!atCap && (
          <div className="relative">
            <button
              ref={triggerRef}
              id="kudo-hashtag-trigger"
              type="button"
              onClick={() => setIsPickerOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={isPickerOpen}
              aria-describedby={error ? "kudo-hashtag-error" : undefined}
              className={`inline-flex h-12 cursor-pointer items-center gap-2 rounded border bg-white px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 hover:bg-[var(--color-accent-cream)]/10 ${error ? "border-[var(--color-error)]" : "border-[var(--color-border-secondary)]"}`}
            >
              <Icon name="plus" size={24} className="text-[var(--color-muted-grey)]" />
              <span className="flex flex-col items-start leading-none">
                <span className="text-base leading-5 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)]">
                  {messages.compose.fields.hashtag.trigger}
                </span>
                <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]">
                  {messages.compose.fields.hashtag.max}
                </span>
              </span>
            </button>

            {/* Picker overlay */}
            {isPickerOpen && (
              <HashtagPicker
                options={options}
                selectedSlugs={selectedSlugs}
                onToggle={onToggle}
                onClose={() => setIsPickerOpen(false)}
                triggerRef={triggerRef}
              />
            )}
          </div>
        )}
      </div>
      </div>
      {error && (
        <p
          id="kudo-hashtag-error"
          role="alert"
          className="text-sm leading-5 font-medium text-[var(--color-error)] max-sm:pl-0 pl-[162px]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
