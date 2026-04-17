"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DismissibleAlertProps = {
  children: ReactNode;
  autoFocus?: boolean;
  className?: string;
  onDismiss?: () => void;
};

// Accessible alert wrapper. Owns focus-on-mount + Esc-to-dismiss so the
// LoginErrorBanner server component can stay server-side.
export function DismissibleAlert({
  children,
  autoFocus = false,
  className,
  onDismiss,
}: DismissibleAlertProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDismissed(true);
        onDismiss?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (dismissed) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>
  );
}
