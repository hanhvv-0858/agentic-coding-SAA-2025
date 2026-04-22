"use client";

import { Icon } from "@/components/ui/Icon";
import type { Messages } from "@/libs/i18n/getMessages";

// Anonymous-kudo toggle — Viết Kudo spec ihQ26W78P2 US6 / FR-011.
// Hidden native checkbox + custom cream-when-checked visual to match
// the Figma design (24 × 24 with 1 px #999 border).

type AnonymousCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  messages: Messages;
};

export function AnonymousCheckbox({ checked, onChange, messages }: AnonymousCheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-4 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
        aria-label={messages.compose.fields.anonymous.label}
      />
      <span
        aria-hidden
        className={`inline-flex h-6 w-6 items-center justify-center border motion-safe:transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--color-accent-cream)] peer-focus-visible:outline-offset-2 ${
          checked
            ? "border-[var(--color-border-secondary)] bg-[var(--color-border-secondary)]"
            : "border-[var(--color-border-secondary)] bg-transparent"
        }`}
      >
        {checked && (
          <Icon
            name="check"
            size={16}
            className="text-[var(--color-accent-cream)]"
          />
        )}
      </span>
      {messages.compose.fields.anonymous.label}
    </label>
  );
}
