"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import type { Messages } from "@/libs/i18n/getMessages";

// Nested modal for inserting / editing links in the Viết Kudo body
// editor (spec OyDLDuSGEa). Rendered via React Portal to document.body
// so its `position: fixed` escapes the parent modal's stacking context.

export type AddlinkPayload = {
  text: string;
  url: string;
};

type AddlinkDialogProps = {
  isOpen: boolean;
  initialText?: string;
  initialUrl?: string;
  isEditMode?: boolean;
  onSave: (payload: AddlinkPayload) => void;
  onClose: () => void;
  messages: Messages;
};

const URL_REGEX = /^https?:\/\/\S+$/i;

function validate(
  text: string,
  url: string,
  messages: Messages,
): { text?: string; url?: string } {
  const errors: { text?: string; url?: string } = {};
  const trimmedText = text.trim();
  const trimmedUrl = url.trim();
  if (trimmedText.length === 0) {
    errors.text = messages.compose.addlink.validation.textRequired;
  } else if (trimmedText.length > 100) {
    errors.text = messages.compose.addlink.validation.textTooLong;
  }
  if (trimmedUrl.length === 0) {
    errors.url = messages.compose.addlink.validation.urlRequired;
  } else if (trimmedUrl.length > 2048) {
    errors.url = messages.compose.addlink.validation.urlTooLong;
  } else if (!URL_REGEX.test(trimmedUrl)) {
    errors.url = messages.compose.addlink.validation.urlInvalid;
  }
  return errors;
}

export function AddlinkDialog({
  isOpen,
  initialText = "",
  initialUrl = "",
  isEditMode = false,
  onSave,
  onClose,
  messages,
}: AddlinkDialogProps) {
  // Seed form state lazily from the props — resetting happens via a
  // ref-tracked "open generation" counter so we don't call setState
  // synchronously in an effect (react-hooks/set-state-in-effect).
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [errors, setErrors] = useState<{ text?: string; url?: string }>({});
  const paperRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Track the previous `isOpen` state via ref so we can reset form
  // fields on the open→true transition without a synchronous setState
  // in an effect. We do the reset inside a requestAnimationFrame
  // callback (async) per the react-hooks/set-state-in-effect rule.
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (!prevOpenRef.current && isOpen) {
      const id = requestAnimationFrame(() => {
        setText(initialText);
        setUrl(initialUrl);
        setErrors({});
      });
      prevOpenRef.current = isOpen;
      return () => cancelAnimationFrame(id);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialText, initialUrl]);

  // No mount guard — `"use client"` boundary already guarantees
  // document is defined. SSR would render nothing because the parent
  // KudoComposer is also client-only.

  // Focus-on-open: URL field if initialText is pre-filled, else text field.
  useEffect(() => {
    if (!isOpen) return;
    const target = initialText.trim().length > 0 ? urlInputRef : firstInputRef;
    const id = requestAnimationFrame(() => target.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen, initialText]);

  // Esc closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const isValid =
    text.trim().length > 0 &&
    url.trim().length > 0 &&
    URL_REGEX.test(url.trim()) &&
    url.trim().length <= 2048 &&
    text.trim().length <= 100;

  const handleSave = useCallback(() => {
    const errs = validate(text, url, messages);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({ text: text.trim(), url: url.trim() });
  }, [text, url, onSave, messages]);

  const handleUrlKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const dialog = (
    <>
      {/* Backdrop — own layer, z-40 above Viết Kudo's z-30. */}
      <div
        className="fixed inset-0 z-40 bg-black/40 motion-safe:transition-opacity motion-safe:duration-150"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={paperRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addlink-title"
        className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-[752px] -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-[24px] bg-[var(--color-modal-paper)] p-10 shadow-[0_16px_48px_rgba(0,0,0,0.25)] motion-safe:transition-all motion-safe:duration-150 max-sm:h-dvh max-sm:max-h-none max-sm:w-screen max-sm:rounded-none max-sm:p-4"
      >
        <h2
          id="addlink-title"
          className="font-[family-name:var(--font-montserrat)] text-[32px] leading-10 font-bold text-[var(--color-brand-900)]"
        >
          {messages.compose.addlink.title}
          {isEditMode ? "" : ""}
        </h2>

        {/* Nội dung */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
            <label
              htmlFor="addlink-text"
              className="w-[107px] text-center text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] max-sm:w-auto"
            >
              {messages.compose.addlink.textLabel}
            </label>
            <input
              ref={firstInputRef}
              id="addlink-text"
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errors.text) setErrors((p) => ({ ...p, text: undefined }));
              }}
              onBlur={() => {
                const errs = validate(text, url, messages);
                setErrors((p) => ({ ...p, text: errs.text }));
              }}
              maxLength={100}
              aria-required="true"
              aria-invalid={Boolean(errors.text)}
              aria-describedby={errors.text ? "addlink-text-error" : undefined}
              className={`h-14 flex-1 rounded-lg border bg-white px-6 py-4 text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 max-sm:w-full ${
                errors.text ? "border-[var(--color-error)]" : "border-[var(--color-border-secondary)]"
              }`}
            />
          </div>
          {errors.text && (
            <p
              id="addlink-text-error"
              role="alert"
              className="text-sm leading-5 font-medium text-[var(--color-error)] max-sm:pl-0 pl-[123px]"
            >
              {errors.text}
            </p>
          )}
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
            <label
              htmlFor="addlink-url"
              className="w-[107px] text-center text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] max-sm:w-auto max-sm:text-left"
            >
              {messages.compose.addlink.urlLabel}
            </label>
            <input
              ref={urlInputRef}
              id="addlink-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors((p) => ({ ...p, url: undefined }));
              }}
              onBlur={() => {
                const errs = validate(text, url, messages);
                setErrors((p) => ({ ...p, url: errs.url }));
              }}
              onKeyDown={handleUrlKey}
              maxLength={2048}
              aria-required="true"
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? "addlink-url-error" : undefined}
              placeholder="https://"
              className={`h-14 flex-1 rounded-lg border bg-white px-6 py-4 text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 max-sm:w-full ${
                errors.url ? "border-[var(--color-error)]" : "border-[var(--color-border-secondary)]"
              }`}
            />
          </div>
          {errors.url && (
            <p
              id="addlink-url-error"
              role="alert"
              className="text-sm leading-5 font-medium text-[var(--color-error)] max-sm:pl-0 pl-[123px]"
            >
              {errors.url}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-start gap-6 max-sm:flex-col-reverse">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-15 cursor-pointer items-center gap-2 rounded border border-[var(--color-border-secondary)] bg-[var(--color-secondary-btn-fill)] px-10 py-4 text-base leading-6 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] hover:bg-[var(--color-accent-cream)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 max-sm:w-full"
          >
            {messages.compose.addlink.cancel}
            <Icon name="close" size={24} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            aria-disabled={!isValid}
            className="inline-flex h-15 grow items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-cream)] p-4 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] hover:bg-[var(--color-accent-cream-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer aria-disabled:cursor-not-allowed aria-disabled:opacity-50 max-sm:w-full"
          >
            {messages.compose.addlink.save}
            <Icon name="link" size={24} />
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(dialog, document.body);
}
