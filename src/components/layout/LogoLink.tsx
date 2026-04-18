"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, MouseEvent, KeyboardEvent } from "react";

type LogoLinkProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

// Home-link wrapper that smooth-scrolls to the top of the page when the user
// is already on the target route, instead of triggering a same-page navigation
// that would flash. FR-014.
export function LogoLink({
  href = "/",
  children,
  className,
  ariaLabel = "Sun Annual Awards 2025",
}: LogoLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) return;
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (!isActive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKey}
      className={[
        "inline-flex items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Link>
  );
}
