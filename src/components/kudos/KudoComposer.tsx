"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/libs/toast";
import { createKudo } from "@/app/kudos/actions";
import { createClient as createSupabaseClient } from "@/libs/supabase/client";
import { track } from "@/libs/analytics/track";
import type { HashtagOption, KudoUser } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import { RecipientField } from "./RecipientField";
import { TitleField } from "./TitleField";
import { BodyEditor } from "./BodyEditor";
import { HashtagField } from "./HashtagField";
import { ImageUploader } from "./ImageUploader";
import { AnonymousCheckbox } from "./AnonymousCheckbox";
import { AnonymousAliasField } from "./AnonymousAliasField";
import { AddlinkDialog, type AddlinkPayload } from "./AddlinkDialog";

// Small inline escapers for safe `<a>` insertion via TipTap insertContent.
// TipTap will re-parse the HTML through its schema, so anything outside
// an allowed attribute gets stripped — but we still escape proactively.
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Parent modal orchestrator for the Viết Kudo compose flow (spec
// ihQ26W78P2). Holds form state via useReducer, pre-fetched hashtag
// options via prop, TipTap editor ref, and the submit pipeline.
//
// PR 2 MVP scope: recipient + title + body + hashtag (stub trigger,
// picker lands in PR 3) + submit. No images / anonymous / Addlink yet.

type ComposerState = {
  recipient: KudoUser | null;
  title: string;
  hashtagSlugs: string[];
  isAnonymous: boolean;
  anonymousAlias: string;
};

type ComposerAction =
  | { type: "setRecipient"; recipient: KudoUser | null }
  | { type: "setTitle"; title: string }
  | { type: "toggleHashtag"; slug: string }
  | { type: "setAnonymous"; isAnonymous: boolean }
  | { type: "setAnonymousAlias"; anonymousAlias: string }
  | { type: "reset" };

const initialState: ComposerState = {
  recipient: null,
  title: "",
  hashtagSlugs: [],
  isAnonymous: false,
  anonymousAlias: "",
};

function reducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "setRecipient":
      return { ...state, recipient: action.recipient };
    case "setTitle":
      return { ...state, title: action.title };
    case "toggleHashtag": {
      const exists = state.hashtagSlugs.includes(action.slug);
      if (exists) {
        return { ...state, hashtagSlugs: state.hashtagSlugs.filter((s) => s !== action.slug) };
      }
      if (state.hashtagSlugs.length >= 5) return state;
      return { ...state, hashtagSlugs: [...state.hashtagSlugs, action.slug] };
    }
    case "setAnonymous":
      // Flipping off discards any pre-typed alias so a stale nickname
      // never gets submitted (spec US6 scenario 7).
      return {
        ...state,
        isAnonymous: action.isAnonymous,
        anonymousAlias: action.isAnonymous ? state.anonymousAlias : "",
      };
    case "setAnonymousAlias":
      return { ...state, anonymousAlias: action.anonymousAlias };
    case "reset":
      return initialState;
  }
}

type KudoComposerProps = {
  hashtags: HashtagOption[];
  messages: Messages;
  /** Called when the user closes the modal (Hủy, Esc, backdrop, or successful submit). */
  onClose?: () => void;
};

export function KudoComposer({ hashtags, messages, onClose }: KudoComposerProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Addlink dialog state (US7 / spec OyDLDuSGEa). Opens over the Viết
  // Kudo modal via React Portal. `activeModal` state suppresses Viết
  // Kudo's Esc/backdrop close while Addlink is open.
  const [addlink, setAddlink] = useState<{
    open: boolean;
    initialText: string;
    initialUrl: string;
    isEditMode: boolean;
  }>({ open: false, initialText: "", initialUrl: "", isEditMode: false });
  // Kept in a ref so Hủy-cleanup sees the latest list even if React
  // state is stale during unmount.
  const imagePathsRef = useRef<string[]>([]);
  useEffect(() => {
    imagePathsRef.current = imagePaths;
  }, [imagePaths]);

  const paperRef = useRef<HTMLDivElement>(null);
  const firstSentinelRef = useRef<HTMLDivElement>(null);
  const lastSentinelRef = useRef<HTMLDivElement>(null);

  // Validation errors surfaced on failed submit attempt. Keyed by
  // field id. Clears on edit (see field `onChange` handlers).
  type FieldKey = "recipient" | "title" | "body" | "hashtag" | "anonymousAlias";
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  // Dirty derivation — any non-empty field counts. TipTap editor dirty
  // check uses `editor.isEmpty`; we call it lazily because editor may
  // be null during initial mount.
  const isDirty = useMemo(() => {
    if (state.recipient) return true;
    if (state.title.trim().length > 0) return true;
    if (state.hashtagSlugs.length > 0) return true;
    if (state.isAnonymous) return true;
    if (editor && !editor.isEmpty) return true;
    return false;
  }, [state, editor]);

  // Valid derivation — all 4 required fields present + no uploads pending.
  const isValid = useMemo(() => {
    if (!state.recipient) return false;
    if (state.title.trim().length === 0) return false;
    if (state.hashtagSlugs.length === 0 || state.hashtagSlugs.length > 5) return false;
    if (!editor || editor.isEmpty) return false;
    if (isUploading) return false;
    if (state.isAnonymous) {
      const trimmed = state.anonymousAlias.trim();
      if (trimmed.length < 2 || trimmed.length > 40) return false;
    }
    return true;
  }, [state, editor, isUploading]);

  // Best-effort cleanup of uploaded-but-unsubmitted images. Called on
  // every close path that is NOT a successful submit.
  const cleanupOrphanImages = useCallback(async () => {
    const paths = imagePathsRef.current;
    if (paths.length === 0) return;
    try {
      const supabase = createSupabaseClient();
      await supabase.storage.from("kudo-images").remove(paths);
    } catch (err) {
      console.error("[compose] orphan image cleanup failed:", err);
    }
  }, []);

  // Close attempt — prompt if dirty, else close. Fires orphan-image
  // cleanup when close proceeds (images uploaded in this session MUST
  // not linger if the kudo wasn't submitted).
  const attemptClose = useCallback(() => {
    if (isDirty) {
      const ok = window.confirm(messages.compose.actions.cancelDirtyConfirm);
      if (!ok) return;
    }
    void cleanupOrphanImages();
    track({ type: "kudos_compose_cancel", reason: "hủy_button" });
    if (onClose) onClose();
    else router.push("/kudos");
  }, [isDirty, messages, onClose, router, cleanupOrphanImages]);

  // Esc handler on the paper — delegated via keydown listener to catch
  // Esc from anywhere inside (inputs, editor, etc.). Suppressed while
  // Addlink is open — that nested dialog owns its own Esc handling
  // (spec OyDLDuSGEa FR-011 + activeModal state per plan T062).
  useEffect(() => {
    if (addlink.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        attemptClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [attemptClose, addlink.open]);

  // Open Addlink from the Link toolbar button. Inspects the TipTap
  // selection + active link mark to decide insert/wrap/edit mode.
  const handleOpenAddlink = useCallback(() => {
    if (!editor) {
      setAddlink({ open: true, initialText: "", initialUrl: "", isEditMode: false });
      return;
    }
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    const linkAttrs = editor.getAttributes("link");
    const isEdit = Boolean(linkAttrs.href);
    if (isEdit) {
      // Edit mode — extend selection to the full link and pull its text.
      editor.chain().focus().extendMarkRange("link").run();
      const { from: from2, to: to2 } = editor.state.selection;
      const fullLinkText = editor.state.doc.textBetween(from2, to2, " ");
      setAddlink({
        open: true,
        initialText: fullLinkText,
        initialUrl: linkAttrs.href as string,
        isEditMode: true,
      });
    } else {
      setAddlink({
        open: true,
        initialText: selectedText,
        initialUrl: "",
        isEditMode: false,
      });
    }
  }, [editor]);

  // Persist Addlink payload back into the TipTap document.
  const handleAddlinkSave = useCallback(
    ({ text, url }: AddlinkPayload) => {
      if (!editor) {
        setAddlink((p) => ({ ...p, open: false }));
        return;
      }
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ");
      if (addlink.isEditMode) {
        // Edit mode — extendMarkRange then replace text + update href.
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .insertContent(`<a href="${escapeAttr(url)}">${escapeHtml(text)}</a>`)
          .run();
      } else if (from !== to && selectedText === text) {
        // Wrap-selection mode — user left selection text unchanged.
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // Insertion mode — replace selection (if any) with new anchor.
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${escapeAttr(url)}">${escapeHtml(text)}</a>`)
          .run();
      }
      setAddlink((p) => ({ ...p, open: false }));
    },
    [editor, addlink.isEditMode],
  );

  // Focus trap — when focus escapes via sentinel, bounce it to the
  // other end of the tab sequence.
  const focusFirst = useCallback(() => {
    const focusables = paperRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    );
    if (focusables && focusables.length > 0) focusables[0].focus();
  }, []);
  const focusLast = useCallback(() => {
    const focusables = paperRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    );
    if (focusables && focusables.length > 0) focusables[focusables.length - 1].focus();
  }, []);

  // Focus-on-open — move to the first empty required field.
  useEffect(() => {
    focusFirst();
  }, [focusFirst]);

  // Per-field validators — run on Gửi click. Returns a fresh error map.
  const computeErrors = useCallback((): Partial<Record<FieldKey, string>> => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!state.recipient) {
      e.recipient = messages.compose.validation.recipientRequired;
    }
    if (state.title.trim().length === 0) {
      e.title = messages.compose.validation.titleRequired;
    } else if (state.title.trim().length > 120) {
      e.title = messages.compose.validation.titleTooLong;
    }
    if (!editor || editor.isEmpty) {
      e.body = messages.compose.validation.bodyRequired;
    }
    if (state.hashtagSlugs.length === 0) {
      e.hashtag = messages.compose.validation.hashtagRequired;
    } else if (state.hashtagSlugs.length > 5) {
      e.hashtag = messages.compose.validation.hashtagTooMany;
    }
    if (state.isAnonymous) {
      const trimmed = state.anonymousAlias.trim();
      if (trimmed.length < 2) {
        e.anonymousAlias = messages.compose.fields.anonymousAlias.validation.required;
      } else if (trimmed.length > 40) {
        e.anonymousAlias = messages.compose.fields.anonymousAlias.validation.tooLong;
      }
    }
    return e;
  }, [state, editor, messages]);

  const focusFirstInvalid = useCallback(
    (errorMap: Partial<Record<FieldKey, string>>) => {
      // Order per spec: Recipient → Title → Body → Hashtag → anonymousAlias.
      const order: FieldKey[] = ["recipient", "title", "body", "hashtag", "anonymousAlias"];
      const first = order.find((k) => errorMap[k]);
      if (!first) return;
      const idMap: Record<FieldKey, string> = {
        recipient: "kudo-recipient",
        title: "kudo-title",
        body: "", // TipTap editor — focus via editor.commands
        hashtag: "kudo-hashtag-trigger",
        anonymousAlias: "kudo-anonymous-alias",
      };
      if (first === "body") {
        editor?.commands.focus();
        return;
      }
      document.getElementById(idMap[first])?.focus();
    },
    [editor],
  );

  const handleSubmit = () => {
    const errorMap = computeErrors();
    if (Object.keys(errorMap).length > 0) {
      setErrors(errorMap);
      focusFirstInvalid(errorMap);
      return;
    }
    if (!editor || !state.recipient) return;
    setErrors({});
    setSubmitError(null);
    const body = editor.getHTML();
    startTransition(async () => {
      const result = await createKudo({
        recipientId: state.recipient!.id,
        title: state.title.trim(),
        body,
        hashtagSlugs: state.hashtagSlugs,
        imagePaths,
        isAnonymous: state.isAnonymous,
        anonymousAlias: state.isAnonymous ? state.anonymousAlias.trim() : null,
      });
      if (result.ok) {
        track({ type: "kudos_compose_submit", kudo_id: result.kudoId });
        toast({ message: messages.compose.toasts.success, role: "status" });
        dispatch({ type: "reset" });
        editor.commands.clearContent();
        // Clear paths so unmount cleanup doesn't remove just-persisted images.
        setImagePaths([]);
        if (onClose) onClose();
        else router.push("/kudos");
        router.refresh();
      } else {
        setSubmitError(result.error);
        toast({ message: messages.compose.toasts.error, role: "alert" });
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50 motion-safe:transition-opacity motion-safe:duration-150"
        onClick={attemptClose}
        aria-hidden
      />
      {/* Modal paper */}
      <div
        ref={paperRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kudo-composer-title"
        className="fixed left-1/2 top-1/2 z-30 flex max-h-[90vh] w-full max-w-[752px] -translate-x-1/2 -translate-y-1/2 flex-col gap-8 overflow-y-auto rounded-[24px] bg-[var(--color-modal-paper)] p-10 shadow-[0_16px_48px_rgba(0,0,0,0.25)] motion-safe:transition-all motion-safe:duration-150 sm:p-10 max-sm:h-dvh max-sm:w-screen max-sm:max-h-none max-sm:rounded-none max-sm:p-4"
      >
        <div ref={firstSentinelRef} tabIndex={0} onFocus={focusLast} aria-hidden />

        <h2
          id="kudo-composer-title"
          className="font-[family-name:var(--font-montserrat)] text-[32px] leading-10 font-bold text-[var(--color-brand-900)] text-center"
        >
          {messages.compose.title}
        </h2>

        <RecipientField
          value={state.recipient}
          onChange={(recipient) => {
            dispatch({ type: "setRecipient", recipient });
            if (errors.recipient) setErrors((p) => ({ ...p, recipient: undefined }));
          }}
          error={errors.recipient}
          messages={messages}
        />

        <TitleField
          value={state.title}
          onChange={(title) => {
            dispatch({ type: "setTitle", title });
            if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
          }}
          error={errors.title}
          messages={messages}
        />

        <BodyEditor
          onEditorReady={(e) => {
            setEditor(e);
            if (e) {
              e.on("update", () => {
                if (!e.isEmpty) {
                  setErrors((p) =>
                    p.body ? { ...p, body: undefined } : p,
                  );
                }
              });
            }
          }}
          error={errors.body}
          messages={messages}
          onOpenAddlink={handleOpenAddlink}
        />

        <HashtagField
          options={hashtags}
          selectedSlugs={state.hashtagSlugs}
          onToggle={(slug) => {
            dispatch({ type: "toggleHashtag", slug });
            if (errors.hashtag) setErrors((p) => ({ ...p, hashtag: undefined }));
          }}
          error={errors.hashtag}
          messages={messages}
        />

        <ImageUploader
          messages={messages}
          onChange={setImagePaths}
          onUploadingChange={setIsUploading}
        />

        <AnonymousCheckbox
          checked={state.isAnonymous}
          onChange={(checked) => {
            dispatch({ type: "setAnonymous", isAnonymous: checked });
            if (errors.anonymousAlias)
              setErrors((p) => ({ ...p, anonymousAlias: undefined }));
          }}
          messages={messages}
        />

        {state.isAnonymous && (
          <AnonymousAliasField
            value={state.anonymousAlias}
            onChange={(next) => {
              dispatch({ type: "setAnonymousAlias", anonymousAlias: next });
              if (errors.anonymousAlias)
                setErrors((p) => ({ ...p, anonymousAlias: undefined }));
            }}
            error={errors.anonymousAlias}
            messages={messages}
          />
        )}

        {submitError && (
          <p role="alert" className="text-sm text-[var(--color-error)]">
            {submitError}
          </p>
        )}

        {/* Footer: Hủy + Gửi */}
        <div className="flex items-start gap-6 max-sm:flex-col-reverse">
          <button
            type="button"
            onClick={attemptClose}
            className="inline-flex h-15 items-center gap-2 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-secondary-btn-fill)] px-10 py-4 text-base leading-6 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] hover:bg-[var(--color-accent-cream)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer max-sm:w-full"
          >
            {messages.compose.actions.cancel}
            <Icon name="close" size={24} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            aria-disabled={!isValid || isPending}
            className="inline-flex h-15 grow items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-cream)] p-4 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] hover:bg-[var(--color-accent-cream-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 cursor-pointer aria-disabled:cursor-not-allowed aria-disabled:opacity-50 max-sm:w-full"
          >
            {messages.compose.actions.submit}
            <Icon name={isPending ? "spinner" : "send"} size={24} />
          </button>
        </div>

        <div ref={lastSentinelRef} tabIndex={0} onFocus={focusFirst} aria-hidden />
      </div>
      {/* Nested modal — spec OyDLDuSGEa. Rendered via Portal inside the
           component; paper z-50 is above KudoComposer's z-30 per plan. */}
      <AddlinkDialog
        isOpen={addlink.open}
        initialText={addlink.initialText}
        initialUrl={addlink.initialUrl}
        isEditMode={addlink.isEditMode}
        onSave={handleAddlinkSave}
        onClose={() => setAddlink((p) => ({ ...p, open: false }))}
        messages={messages}
      />
    </>
  );
}
