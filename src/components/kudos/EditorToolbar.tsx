"use client";

import type { Editor } from "@tiptap/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Messages } from "@/libs/i18n/getMessages";

// Editor toolbar with 6 format controls + "Tiêu chuẩn cộng đồng" link
// (Viết Kudo spec ihQ26W78P2 FR-007). Link button (C.5) opens the
// Addlink Box dialog in PR 4; for MVP it uses a native prompt.

type ToolbarButtonSpec = {
  key: string;
  icon: IconName;
  labelKey: keyof Messages["compose"]["toolbar"];
  toggle: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
};

const BUTTONS: ToolbarButtonSpec[] = [
  {
    key: "bold",
    icon: "bold",
    labelKey: "bold",
    toggle: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive("bold"),
  },
  {
    key: "italic",
    icon: "italic",
    labelKey: "italic",
    toggle: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive("italic"),
  },
  {
    key: "strikethrough",
    icon: "strikethrough",
    labelKey: "strikethrough",
    toggle: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive("strike"),
  },
  {
    key: "bulletList",
    icon: "list-bullet",
    labelKey: "bulletList",
    toggle: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive("bulletList"),
  },
  // Link button — behaviour is controlled by the parent via the
  // `onOpenAddlink` prop (see EditorToolbar below). `toggle` / `isActive`
  // retained for symmetry but both are no-ops here.
  {
    key: "link",
    icon: "link",
    labelKey: "link",
    toggle: () => {},
    isActive: (e) => e.isActive("link"),
  },
  {
    key: "quote",
    icon: "quote",
    labelKey: "quote",
    toggle: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive("blockquote"),
  },
];

type EditorToolbarProps = {
  editor: Editor;
  messages: Messages;
  /** Parent-owned callback invoked when user clicks the Link button.
   *  Parent opens `<AddlinkDialog />` and orchestrates the TipTap
   *  command variants per spec OyDLDuSGEa FR-005. */
  onOpenAddlink: () => void;
};

export function EditorToolbar({ editor, messages, onOpenAddlink }: EditorToolbarProps) {
  return (
    <div className="flex items-center border-b border-[var(--color-border-secondary)]">
      {BUTTONS.map(({ key, icon, labelKey, toggle, isActive }) => {
        const active = isActive(editor);
        const handleClick = () => {
          if (key === "link") {
            onOpenAddlink();
            return;
          }
          toggle(editor);
        };
        return (
          <button
            key={key}
            type="button"
            onClick={handleClick}
            aria-pressed={active}
            aria-label={messages.compose.toolbar[labelKey]}
            className={`inline-flex h-10 items-center justify-center border-r border-[var(--color-border-secondary)] px-4 py-2.5 text-[var(--color-brand-900)] cursor-pointer motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-[-2px] ${
              active
                ? "bg-[var(--color-accent-cream)]/20"
                : "hover:bg-[var(--color-accent-cream)]/10"
            }`}
          >
            <Icon name={icon} size={24} />
          </button>
        );
      })}
      {/* Spacer takes the remaining row width and centres the standards
          link horizontally in the whitespace between the last format
          button and the right edge. */}
      <div className="flex flex-1 justify-center">
        <a
          href="/the-le"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 text-base leading-6 font-bold text-[#E46060] underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2"
        >
          {messages.compose.toolbar.standardsLink}
        </a>
      </div>
    </div>
  );
}
