"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/libs/analytics/track";
import { toast } from "@/libs/toast";

// Per design-style §19 — inline label swaps to "Đã copy!" with check
// glyph for 1.5 s before reverting. The global toast (FR-013) provides
// the screen-reader announcement separately.
const CONFIRM_MS = 1500;

export type CopyLinkButtonLabels = {
  /** Idle aria-label + visible label, e.g. "Copy link" / "Sao chép link". */
  copy: string;
  /** Success aria-label + visible label, e.g. "Copied!" / "Đã copy!". */
  copied: string;
  /** Toast message announced on successful copy. */
  toast: string;
  /** Toast message on clipboard failure (both modern + fallback paths). */
  errorToast: string;
};

export type CopyLinkButtonProps = {
  kudoId: string;
  labels: CopyLinkButtonLabels;
};

/**
 * §C.4.2 CopyLinkButton — copies `${origin}/kudos/:id` to the clipboard
 * via `navigator.clipboard.writeText`, with a hidden-textarea fallback
 * for legacy browsers / non-secure-context environments.
 *
 * On success:
 *   1. Inline label swaps to `labels.copied` + check icon for 1.5 s
 *      (per design-style §19).
 *   2. `toast({ message: labels.toast, role: "status" })` for the global
 *      ARIA-live announcement (FR-013 reconciliation).
 *   3. `kudos_copy_link` analytics event.
 *
 * On failure: `toast({ message: labels.errorToast, role: "alert" })`
 * — no inline swap so the user sees the idle state restored.
 */
export function CopyLinkButton({
  kudoId,
  labels,
}: CopyLinkButtonProps): ReactNode {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const buildUrl = (): string => {
    if (typeof window === "undefined") {
      // SSR safety — the button never actually runs on the server, but
      // keep the function pure so unit tests and future SSR previews
      // don't crash.
      return `/kudos/${kudoId}`;
    }
    return new URL(`/kudos/${kudoId}`, window.location.origin).toString();
  };

  const writeViaClipboardApi = async (text: string): Promise<boolean> => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to legacy path.
        return false;
      }
    }
    return false;
  };

  const writeViaExecCommand = (text: string): boolean => {
    if (typeof document === "undefined") return false;
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      // Avoid scroll jumps + keep it invisible.
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const flashCopied = () => {
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopied(false);
      timerRef.current = null;
    }, CONFIRM_MS);
  };

  const handleClick = async () => {
    const url = buildUrl();
    const ok =
      (await writeViaClipboardApi(url)) || writeViaExecCommand(url);

    if (!ok) {
      toast({ message: labels.errorToast, role: "alert" });
      return;
    }

    flashCopied();
    toast({ message: labels.toast, role: "status" });
    track({ type: "kudos_copy_link", id: kudoId });
  };

  const visibleLabel = copied ? labels.copied : labels.copy;
  const ariaLabel = visibleLabel;

  const baseClass =
    "inline-flex h-10 items-center gap-1 rounded px-4 py-1 font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 transition-[color,background-color,opacity] duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]";
  const stateClass = copied
    ? "text-[var(--color-brand-900)] bg-[rgba(0,16,26,0.06)]"
    : "text-[var(--color-brand-900)] hover:bg-[rgba(0,16,26,0.06)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid="kudo-copy-link-button"
      data-kudo-id={kudoId}
      data-copied={copied ? "true" : "false"}
      className={`${baseClass} ${stateClass}`}
    >
      <Icon name={copied ? "check" : "copy-link"} size={16} />
      <span data-testid="kudo-copy-link-label">{visibleLabel}</span>
    </button>
  );
}
