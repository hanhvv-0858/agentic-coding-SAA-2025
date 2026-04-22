"use client";

import type { Messages } from "@/libs/i18n/getMessages";

// Plain text input for the "Danh hiệu" field (Viết Kudo spec
// ihQ26W78P2 — annotation gap, but present in the Figma frame).
// Required, 1..120 chars. Stored in `kudos.title` (migration 0007).

type TitleFieldProps = {
  value: string;
  onChange: (title: string) => void;
  messages: Messages;
  /** Validation error; when set, input gains red border + inline message. */
  error?: string;
};

export function TitleField({ value, onChange, messages, error }: TitleFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
        <label
          htmlFor="kudo-title"
          className="flex w-[146px] items-center gap-0.5 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] max-sm:w-auto"
        >
          {messages.compose.fields.honor.label}
          <span className="text-[var(--color-error)]">*</span>
        </label>
        <input
          id="kudo-title"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={120}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "kudo-title-error" : undefined}
          placeholder={messages.compose.fields.honor.placeholder}
          className={`h-14 flex-1 rounded-lg border bg-white px-6 py-4 text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 placeholder:text-[var(--color-muted-grey)] max-sm:w-full ${error ? "border-[var(--color-error)]" : "border-[var(--color-border-secondary)]"}`}
        />
      </div>
      {error ? (
        <p
          id="kudo-title-error"
          role="alert"
          className="text-sm leading-5 font-medium text-[var(--color-error)] max-sm:pl-0 pl-[162px]"
        >
          {error}
        </p>
      ) : (
        <p className="text-base leading-6 text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)] max-sm:pl-0 pl-[162px]">
          {messages.compose.fields.honor.helper}
        </p>
      )}
    </div>
  );
}
