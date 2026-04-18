import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

type Variant = "solid" | "outline" | "secondary";
type Size = "md" | "lg";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: Variant;
  size?: Size;
};

const BASE =
  "inline-flex items-center justify-start gap-2 " +
  "font-[family-name:var(--font-montserrat)] font-bold " +
  "transition-colors duration-150 ease-in-out " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

// lg is the historical "About Awards" CTA treatment (Figma node 662:14426).
// md is the smaller footer-button treatment used on the Thể lệ screen
// (Figma B.1/B.2, nodes 3204:6093 / 3204:6094).
const SIZE_CLASSES: Record<Size, string> = {
  lg: "h-[60px] px-6 py-4 rounded-lg text-[22px] leading-7 tracking-[0]",
  md: "h-14 px-4 py-4 rounded-[4px] text-base leading-6 tracking-[0.5px]",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  solid:
    "bg-[var(--color-accent-cream)] text-[var(--color-brand-900)] " +
    "hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)]",
  outline:
    "bg-transparent text-[var(--color-accent-cream)] border-2 border-[var(--color-accent-cream)] " +
    "hover:bg-[var(--color-accent-cream)]/10 active:bg-[var(--color-accent-cream)]/20",
  secondary:
    "bg-[var(--color-accent-cream)]/10 text-white border border-[var(--color-border-secondary)] " +
    "hover:bg-[var(--color-accent-cream)]/20 active:bg-[var(--color-accent-cream)]/25",
};

export function PrimaryButton({
  loading = false,
  leadingIcon,
  trailingIcon,
  variant = "solid",
  size = "lg",
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
      className={[BASE, SIZE_CLASSES[size], VARIANT_CLASSES[variant], className].filter(Boolean).join(" ")}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailing}
    </button>
  );
}
