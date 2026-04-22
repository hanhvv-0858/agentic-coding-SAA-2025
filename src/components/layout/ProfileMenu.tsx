"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
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

  // Shared class for every menu row — design-style §5.2/5.4 of
  // z4sCl3_Qtk spec. Keeps Profile/Admin/Logout visually in sync.
  // Text-shadow glow applied on hover + focus-visible only; idle rows
  // have no glow (Figma shows the glow on the hovered Profile row).
  const itemClass =
    "inline-flex h-14 items-center justify-start gap-1 rounded px-4 py-4 font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px] text-white motion-safe:transition-colors motion-safe:duration-150 hover:bg-[var(--color-accent-cream)]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 focus-visible:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] cursor-pointer";

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
        // Dismissal: outside-click + Escape only (spec FR-006); P3
        // ArrowUp/Down roving tabindex + Tab-out auto-close deferred.
        <div
          role="menu"
          aria-label={labels.open}
          className="absolute right-0 top-12 z-50 flex w-max min-w-[133px] flex-col gap-0.5 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5"
        >
          <Link href="/profile" role="menuitem" onClick={close} className={itemClass}>
            <span>{labels.profile}</span>
            <Icon name="user" size={24} className="ml-auto shrink-0" />
          </Link>
          {isAdmin && (
            <Link href="/admin" role="menuitem" onClick={close} className={itemClass}>
              <span>{labels.adminDashboard}</span>
              <Icon name="dashboard" size={24} className="ml-auto shrink-0" />
            </Link>
          )}
          <form action={signOut} className="contents">
            <button type="submit" role="menuitem" className={`${itemClass} w-full text-left`}>
              <span>{labels.signOut}</span>
              <Icon name="chevron-right" size={24} className="ml-auto shrink-0" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
