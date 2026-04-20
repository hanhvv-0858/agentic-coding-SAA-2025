import type { Messages } from "@/libs/i18n/getMessages";

type EmptyStateVariant =
  | "feedEmpty"
  | "spotlightEmpty"
  | "gifteesEmpty"
  | "filtered";

type EmptyStateProps = {
  messages: Messages;
  variant?: EmptyStateVariant;
};

/**
 * Generic Kudos empty-state message (FR-002). `variant` picks the copy
 * from `messages.kudos.empty.*`; feed variant is the default. The
 * `filtered` variant (spec Edge Cases §"Filter returns zero") re-uses
 * the `feedEmpty` copy but is a distinct data-variant so parent code
 * can keep the active filter chips visible above the notice.
 */
export function EmptyState({
  messages,
  variant = "feedEmpty",
}: EmptyStateProps) {
  const copy =
    variant === "filtered"
      ? messages.kudos.empty.feedEmpty
      : messages.kudos.empty[variant];
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-20 text-center text-base text-white/70"
      data-testid="kudos-empty-state"
      data-variant={variant}
    >
      <span aria-hidden="true" className="text-4xl">
        {"\u{1F338}"}
      </span>
      <p>{copy}</p>
    </div>
  );
}
