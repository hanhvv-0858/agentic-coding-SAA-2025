"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

// Header/footer nav link — same-route click smooth-scrolls to top, different
// route navigates via next/link. Active route gets aria-current="page".
export function NavLink({ href, children, className }: NavLinkProps) {
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
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-current={isActive ? "page" : undefined}
      className={[
        "font-[family-name:var(--font-montserrat)] text-sm leading-5 font-bold tracking-[0.1px]",
        "px-3 py-2 rounded transition-colors hover:text-[var(--color-accent-cream)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2",
        isActive
          ? "text-[var(--color-accent-cream)] underline decoration-2 underline-offset-4"
          : "text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Link>
  );
}
