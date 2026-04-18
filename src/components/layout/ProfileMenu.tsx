"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "@/libs/auth/signOut";

type ProfileUser = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

type ProfileMenuProps = {
  user: ProfileUser;
  isAdmin: boolean;
  labels: {
    open: string;
    profile: string;
    signOut: string;
    adminDashboard: string;
  };
};

// Avatar trigger + dropdown menu with Profile / Sign out / (Admin Dashboard).
// Outside click + Escape both close; sign-out goes through the signOut Server
// Action so the session cookie is cleared server-side.
export function ProfileMenu({ user, isAdmin, labels }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const initial = (user.displayName ?? user.email).trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        aria-label={labels.open}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer"
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 object-cover" />
        ) : (
          <span className="font-[family-name:var(--font-montserrat)] text-sm font-bold">{initial}</span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={labels.open}
          className="absolute right-0 top-12 z-50 flex min-w-[220px] flex-col overflow-hidden rounded-lg bg-[var(--color-brand-800)] shadow-lg ring-1 ring-white/10"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={close}
            className="px-4 py-3 font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
          >
            {labels.profile}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={close}
              className="px-4 py-3 font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
            >
              {labels.adminDashboard}
            </Link>
          )}
          <form action={signOut} className="contents">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-3 text-left font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] cursor-pointer"
            >
              {labels.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
