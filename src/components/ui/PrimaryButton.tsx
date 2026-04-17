import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

// Cream CTA per design-style.md §14 · Button-IC About (Figma node 662:14426).
// Height 60, padding 16px 24px, radius 8, Montserrat 22/28 700, #00101A on #FFEA9E.
const BASE =
  "inline-flex items-center justify-start gap-2 h-[60px] px-6 py-4 rounded-lg " +
  "font-[family-name:var(--font-montserrat)] text-[22px] leading-7 font-bold tracking-[0] " +
  "bg-[var(--color-accent-cream)] text-[var(--color-brand-900)] " +
  "transition-colors duration-150 ease-in-out " +
  "hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

export function PrimaryButton({
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  className,
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const trailing = loading ? <Icon name="spinner" size={24} aria-hidden="true" /> : trailingIcon;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[BASE, className].filter(Boolean).join(" ")}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailing}
    </button>
  );
}
