"use client";

import type { Messages } from "@/libs/i18n/getMessages";

// Nickname input for the anonymous-kudo pen-name (Viết Kudo spec
// ihQ26W78P2 round 3 — Figma item G.1). Rendered only when the
// anonymous checkbox is ticked; KudoComposer owns the mount guard.
// Design-style §G.1: label hugs content (`w-auto`), input h-14 with
// px-6 py-4 on white bg, matching RecipientField geometry.

type AnonymousAliasFieldProps = {
  value: string;
  onChange: (next: string) => void;
  messages: Messages;
  /** Validation error; when set, input gains red border + inline message. */
  error?: string;
};

export function AnonymousAliasField({
  value,
  onChange,
  messages,
  error,
}: AnonymousAliasFieldProps) {
  const field = messages.compose.fields.anonymousAlias;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
        <label
          htmlFor="kudo-anonymous-alias"
          className="flex w-auto items-center gap-0.5 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)]"
        >
          {field.label}
          <span className="text-[var(--color-error)]">*</span>
        </label>
        <input
          id="kudo-anonymous-alias"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={40}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "kudo-anonymous-alias-error" : undefined}
          className={`h-14 flex-1 rounded-lg border bg-white px-6 py-4 text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 placeholder:text-[var(--color-muted-grey)] max-sm:w-full ${
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border-secondary)]"
          }`}
          data-testid="kudo-anonymous-alias-input"
        />
      </div>
      {error && (
        <p
          id="kudo-anonymous-alias-error"
          role="alert"
          className="text-sm leading-5 font-medium text-[var(--color-error)] max-sm:pl-0"
        >
          {error}
        </p>
      )}
    </div>
  );
}
