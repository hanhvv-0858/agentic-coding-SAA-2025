"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useState } from "react";
import type { Messages } from "@/libs/i18n/getMessages";
import { EditorToolbar } from "./EditorToolbar";
import { mentionSuggestion } from "./mentionSuggestion";

// TipTap body editor for Viết Kudo (spec ihQ26W78P2 FR-007 + FR-008).
// PR 2 MVP: StarterKit + Link + CharacterCount(5000).
// Mention + Suggestion land in PR 3 (US3 / Phase 5).
//
// The editor instance is lifted up to KudoComposer via onEditorReady
// so the parent can: (a) check isEmpty for validation, (b) call
// getHTML() on submit, (c) pass to AddlinkDialog (PR 4 / US7).

type BodyEditorProps = {
  onEditorReady: (editor: Editor | null) => void;
  messages: Messages;
  /** Validation error; when set, outer wrapper gains red border + inline message. */
  error?: string;
  /** Invoked when user clicks the Link toolbar button — parent opens AddlinkDialog. */
  onOpenAddlink: () => void;
};

export function BodyEditor({ onEditorReady, messages, error, onOpenAddlink }: BodyEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable marks/nodes not offered by the Figma toolbar.
        codeBlock: false,
        code: false,
        horizontalRule: false,
        orderedList: false,
        heading: false,
        // StarterKit v3 bundles Link; disable it here so the standalone
        // `Link.configure(...)` below (with `openOnClick: false` +
        // custom styling) owns the extension without duplicate-name
        // warnings from TipTap.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: {
          class: "text-[var(--color-error)] underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            "inline-flex items-center rounded bg-[var(--color-accent-cream)]/30 px-1.5 text-[var(--color-brand-900)] font-bold",
        },
        suggestion: mentionSuggestion,
        renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
        renderHTML: ({ node, options }) => [
          "span",
          {
            ...options.HTMLAttributes,
            "data-mention-id": node.attrs.id,
          },
          `@${node.attrs.label ?? node.attrs.id}`,
        ],
      }),
      CharacterCount.configure({ limit: 5000 }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[176px] px-4 py-3 outline-none text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] placeholder:text-[var(--color-muted-grey)]",
        "aria-required": "true",
        "aria-label": messages.compose.fields.body.placeholder,
      },
    },
  });

  useEffect(() => {
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  // Force re-render on editor updates so `isEmpty` stays fresh. TipTap's
  // `useEditor` skips re-renders on every transaction for perf; we opt
  // back in just for the placeholder visibility toggle.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const bump = () => setTick((n) => n + 1);
    editor.on("update", bump);
    editor.on("selectionUpdate", bump);
    return () => {
      editor.off("update", bump);
      editor.off("selectionUpdate", bump);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="h-[240px] rounded-lg border border-[var(--color-border-secondary)] bg-white" />
    );
  }

  const isEmpty = editor.isEmpty;

  return (
    <div className="flex flex-col gap-2">
      <div
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? "kudo-body-error" : undefined}
        className={`rounded-lg border bg-white ${error ? "border-[var(--color-error)]" : "border-[var(--color-border-secondary)]"}`}
      >
        <EditorToolbar editor={editor} messages={messages} onOpenAddlink={onOpenAddlink} />
        <div className="relative">
          {isEmpty && (
            <p
              aria-hidden
              className="pointer-events-none absolute left-4 top-3 text-base leading-6 text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]"
            >
              {messages.compose.fields.body.placeholder}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
      {error ? (
        <p
          id="kudo-body-error"
          role="alert"
          className="text-sm leading-5 font-medium text-[var(--color-error)] text-center"
        >
          {error}
        </p>
      ) : (
        <p className="text-base leading-6 text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] text-center">
          {messages.compose.fields.body.mentionHelper}
        </p>
      )}
    </div>
  );
}
