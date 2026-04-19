"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Icon } from "@/components/ui/Icon";

export type QuickActionsFabLabels = {
  /** aria-label on the collapsed trigger pill. Also used as menu aria-label. */
  open: string;
  /** Thể lệ tile label. */
  rules: string;
  /** Viết KUDOS tile label. */
  writeKudo: string;
  /** aria-label on the red circular Cancel button. */
  close: string;
};

type QuickActionsFabProps = {
  labels: QuickActionsFabLabels;
};

// Bundled spec: `.momorph/specs/_hphd32jN2-fab-collapsed/` (trigger pill)
// + `.momorph/specs/Sv7DFwBw1h-fab-quick-actions/` (expanded menu).
// Trigger + menu are mutually exclusive — see collapsed FR-010 + expanded
// FR-002. `ProfileMenu` pattern for i18n (page passes labels prop).
export function QuickActionsFab({ labels }: QuickActionsFabProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Populated by the Menu via `onFirstItemMount` callback. Used from
  // the `useLayoutEffect` below to focus the first tile after a
  // keyboard-triggered open.
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);
  const setFirstItem = useCallback((el: HTMLAnchorElement | null) => {
    firstItemRef.current = el;
  }, []);
  // Tracks whether the last `open` transition originated from keyboard.
  // Drives focus behaviour per collapsed FR-008: keyboard-open moves
  // focus to first menu item; mouse/touch-open leaves focus alone.
  const keyboardOpenedRef = useRef(false);

  const handleOpen = useCallback((withKeyboard: boolean) => {
    keyboardOpenedRef.current = withKeyboard;
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Focus restoration across the trigger ↔ menu re-mount boundary.
  // useLayoutEffect runs after the conditional render commits, so the
  // element we want to focus actually exists in the DOM by this point.
  useLayoutEffect(() => {
    if (open) {
      if (keyboardOpenedRef.current && firstItemRef.current) {
        firstItemRef.current.focus();
      }
    } else if (keyboardOpenedRef.current && triggerRef.current) {
      triggerRef.current.focus();
      keyboardOpenedRef.current = false;
    }
  }, [open]);

  // Esc + outside-click while menu is open. Single effect, single listener
  // set per `open` transition to keep lifecycle simple.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        // Esc is a keyboard dismiss — keep `keyboardOpenedRef` true so
        // useLayoutEffect restores focus to the trigger after re-mount.
        keyboardOpenedRef.current = true;
        handleClose();
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, handleClose]);

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 print:hidden"
    >
      {open ? (
        <Menu labels={labels} onClose={handleClose} onFirstItemMount={setFirstItem} />
      ) : (
        <Trigger ref={triggerRef} label={labels.open} onOpen={handleOpen} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trigger — the collapsed cream pill
// ---------------------------------------------------------------------------

type TriggerProps = {
  label: string;
  onOpen: (withKeyboard: boolean) => void;
  ref?: Ref<HTMLButtonElement>;
};

function Trigger({ label, onOpen, ref }: TriggerProps) {
  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    // `e.detail === 0` on mouseless activation (e.g., Enter/Space synthesising
    // a click). Track whether keyboard opened the menu so focus can restore
    // appropriately on close. Redundant with the keydown handler's explicit
    // call, but safe.
    const viaKeyboard = e.detail === 0;
    onOpen(viaKeyboard);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(true);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded="false"
      aria-label={label}
      data-fab-trigger
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="flex h-16 w-[106px] cursor-pointer items-center gap-2 rounded-full bg-[var(--color-accent-cream)] p-4 transition-[background-color,box-shadow] duration-150 ease-in-out hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:duration-0"
      style={{
        boxShadow: "var(--shadow-fab-pill)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-fab-pill-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-fab-pill)";
      }}
    >
      <Icon
        name="pencil"
        size={24}
        className="text-[var(--color-brand-900)]"
      />
      <span className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-brand-900)]">
        /
      </span>
      {/* Q4 ✅ — Figma `MM_MEDIA_LOGO` resolves to this PNG (not the
         Sun* monogram `<Icon name="saa">`). Same glyph as the Thể lệ
         tile in the expanded menu. */}
      <Image
        src="/images/the-le/icon_rule_saa@2x.png"
        alt=""
        width={24}
        height={24}
        unoptimized
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Menu — the expanded 3-tile stack
// ---------------------------------------------------------------------------

type MenuProps = {
  labels: QuickActionsFabLabels;
  onClose: () => void;
  /** Called after the first menu item mounts so the parent can focus it
   *  on keyboard-triggered open. Cleanup fires `null`. */
  onFirstItemMount: (el: HTMLAnchorElement | null) => void;
};

function Menu({ labels, onClose, onFirstItemMount }: MenuProps) {
  // `mounted` flips to true after the first paint so the opacity+translate
  // transition plays. Avoids using framer-motion for a 150ms fade.
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Individual refs so we never read `.current` during render — eslint
  // `react-hooks/refs` would flag an indexed ref-array callback.
  const writeKudoRef = useRef<HTMLAnchorElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Callback ref forwards the first tile's DOM node up to the parent so
  // its `useLayoutEffect` can focus it when menu opens via keyboard.
  // Callback refs run after commit and accept null on unmount.
  const rulesCallbackRef = useCallback(
    (el: HTMLAnchorElement | null) => {
      rulesLocalRef.current = el;
      onFirstItemMount(el);
    },
    [onFirstItemMount],
  );
  // Local mirror so the focus-trap handler below can read the first node
  // synchronously in a Tab event handler.
  const rulesLocalRef = useRef<HTMLAnchorElement | null>(null);

  // Focus trap: Tab from last item wraps to first; Shift-Tab from first
  // wraps to last. Collapsed FR-008, expanded FR-008. Runs in event
  // handler, not render, so `.current` access is safe.
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const first = rulesLocalRef.current;
    const last = cancelRef.current;
    if (!first || !last) return;
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleTileClose = () => {
    // Tile click/tap closes the menu but does NOT restore focus to the
    // trigger — the page navigates away. Keep `keyboardOpenedRef` at false
    // so the parent effect doesn't call `.focus()` on an unmounted trigger.
    onClose();
  };

  return (
    <div
      role="menu"
      aria-label={labels.open}
      onKeyDown={handleKeyDown}
      className={`flex flex-col items-end gap-5 transition-[opacity,transform] duration-150 ease-out motion-reduce:translate-y-0 motion-reduce:duration-75 ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <QuickActionTile
        ref={rulesCallbackRef}
        iconNode={
          <Image
            src="/images/the-le/icon_rule_saa@2x.png"
            alt=""
            width={24}
            height={24}
            unoptimized
          />
        }
        label={labels.rules}
        href="/the-le"
        widthClass="w-[149px]"
        onClose={handleTileClose}
      />
      <QuickActionTile
        ref={writeKudoRef}
        iconNode={
          <Icon
            name="pencil"
            size={24}
            className="text-[var(--color-brand-900)]"
          />
        }
        label={labels.writeKudo}
        href="/kudos/new"
        widthClass="w-[214px]"
        onClose={handleTileClose}
      />
      <CancelButton
        ref={cancelRef}
        ariaLabel={labels.close}
        onClose={onClose}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuickActionTile — A (Thể lệ) + B (Viết KUDOS)
// ---------------------------------------------------------------------------

type QuickActionTileProps = {
  iconNode: ReactNode;
  label: string;
  href: string;
  widthClass: string;
  onClose: () => void;
  ref?: Ref<HTMLAnchorElement>;
};

function QuickActionTile({
  iconNode,
  label,
  href,
  widthClass,
  onClose,
  ref,
}: QuickActionTileProps) {
  return (
    <Link
      ref={ref}
      href={href}
      role="menuitem"
      onClick={onClose}
      className={`flex h-16 ${widthClass} items-center gap-2 rounded-sm bg-[var(--color-accent-cream)] p-4 transition-colors duration-150 ease-in-out hover:bg-[var(--color-accent-cream-hover)] active:bg-[var(--color-accent-cream-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:duration-0`}
      style={{ boxShadow: "var(--shadow-fab-tile)" }}
    >
      {iconNode}
      <span className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-brand-900)]">
        {label}
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// CancelButton — C (Huỷ)
// ---------------------------------------------------------------------------

type CancelButtonProps = {
  ariaLabel: string;
  onClose: () => void;
  ref?: Ref<HTMLButtonElement>;
};

function CancelButton({ ariaLabel, onClose, ref }: CancelButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      aria-label={ariaLabel}
      onClick={onClose}
      className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--color-nav-dot)] p-4 transition-[filter] duration-150 ease-in-out hover:brightness-95 active:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:duration-0"
      style={{ boxShadow: "var(--shadow-fab-tile)" }}
    >
      <Icon name="close" size={24} className="text-white" />
    </button>
  );
}
