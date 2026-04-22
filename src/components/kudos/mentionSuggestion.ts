"use client";

import type { SuggestionOptions } from "@tiptap/suggestion";
import { searchSunner } from "@/app/kudos/actions";
import { getInitials, pickMonogramColor } from "@/libs/kudos/monogram";
import type { KudoUser } from "@/types/kudo";

// Suggestion resolver for TipTap Mention (Viết Kudo spec ihQ26W78P2
// FR-008 + US3). Wraps the existing `searchSunner` Server Action and
// renders a minimal popover anchored at the TipTap caret. The popover
// uses the dark-navy family tokens to match LanguageDropdown +
// FilterDropdown + HashtagPicker.

type MentionItem = Pick<
  KudoUser,
  "id" | "display_name" | "avatar_url" | "department_code"
>;

/**
 * Minimal floating-element popover rendered directly with DOM APIs —
 * keeps Mention decoupled from React renderer infra (the TipTap
 * Suggestion plugin runs outside the React tree). Exposes
 * `updateProps` / `onKeyDown` / `destroy` per the Suggestion contract.
 */
function createPopover() {
  const panel = document.createElement("div");
  panel.setAttribute("role", "listbox");
  panel.setAttribute("aria-label", "Chọn đồng nghiệp");
  panel.className =
    "absolute z-50 w-[280px] max-h-[240px] overflow-y-auto rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]";
  panel.style.visibility = "hidden";
  document.body.appendChild(panel);
  return panel;
}

type RendererProps = {
  items: MentionItem[];
  command: (attrs: { id: string; label: string }) => void;
  clientRect?: (() => DOMRect | null) | null;
};

export const mentionSuggestion: Omit<
  SuggestionOptions<MentionItem>,
  "editor"
> = {
  char: "@",
  items: async ({ query }) => {
    const trimmed = query.trim();
    if (trimmed.length < 1) return [];
    try {
      const results = await searchSunner(trimmed);
      return results.slice(0, 10).map((u) => ({
        id: u.id,
        display_name: u.display_name ?? "—",
        avatar_url: u.avatar_url,
        department_code: u.department_code,
      }));
    } catch (err) {
      console.error("[compose] mention searchSunner failed:", err);
      return [];
    }
  },
  render: () => {
    let panel: HTMLDivElement | null = null;
    let activeIdx = 0;
    let currentProps: RendererProps | null = null;
    let rowEls: HTMLButtonElement[] = [];

    const activeCls = "bg-[var(--color-accent-cream)]/20";
    const inactiveCls = "hover:bg-[var(--color-accent-cream)]/10";

    const updateActiveStyles = () => {
      rowEls.forEach((el, i) => {
        const isActive = i === activeIdx;
        el.setAttribute("aria-selected", String(isActive));
        el.classList.toggle(activeCls, isActive);
        el.classList.toggle(inactiveCls, !isActive);
      });
    };

    const rebuild = () => {
      if (!panel || !currentProps) return;
      const { items, command } = currentProps;
      panel.innerHTML = "";
      rowEls = [];

      if (items.length === 0) {
        const empty = document.createElement("div");
        empty.className =
          "p-4 text-center text-base leading-6 font-bold text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]";
        empty.textContent = "Không tìm thấy đồng nghiệp";
        panel.appendChild(empty);
        return;
      }

      items.forEach((item, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "option");
        btn.className = `flex w-full items-center gap-3 rounded px-4 py-2 text-left cursor-pointer`;

        const displayName = item.display_name ?? "—";

        if (item.avatar_url) {
          const img = document.createElement("img");
          img.src = item.avatar_url;
          img.alt = "";
          img.width = 40;
          img.height = 40;
          img.className =
            "h-10 w-10 flex-shrink-0 rounded-full object-cover";
          btn.appendChild(img);
        } else {
          const mono = document.createElement("span");
          mono.setAttribute("aria-hidden", "true");
          mono.className =
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-[var(--color-brand-900)]";
          mono.style.backgroundColor = pickMonogramColor(item.id);
          mono.textContent = getInitials(displayName);
          btn.appendChild(mono);
        }

        const stack = document.createElement("span");
        stack.className = "flex min-w-0 flex-col";

        const nameEl = document.createElement("span");
        nameEl.className =
          "truncate text-white text-base leading-6 font-bold font-[family-name:var(--font-montserrat)]";
        nameEl.textContent = displayName;
        stack.appendChild(nameEl);

        if (item.department_code) {
          const codeEl = document.createElement("span");
          codeEl.className =
            "truncate text-xs leading-4 font-medium text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]";
          codeEl.textContent = item.department_code;
          stack.appendChild(codeEl);
        }

        btn.appendChild(stack);

        // `mousedown` + preventDefault keeps the ProseMirror selection
        // alive so `command()` has a valid range to replace.
        btn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          command({ id: item.id, label: displayName });
        });
        btn.addEventListener("mouseenter", () => {
          activeIdx = idx;
          updateActiveStyles();
        });
        panel!.appendChild(btn);
        rowEls.push(btn);
      });
      updateActiveStyles();
    };

    const position = () => {
      if (!panel || !currentProps?.clientRect) return;
      const rect = currentProps.clientRect();
      if (!rect) return;
      panel.style.visibility = "visible";
      panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
      panel.style.left = `${rect.left + window.scrollX}px`;
    };

    return {
      onStart: (props) => {
        panel = createPopover();
        currentProps = props as unknown as RendererProps;
        activeIdx = 0;
        rebuild();
        position();
      },
      onUpdate: (props) => {
        currentProps = props as unknown as RendererProps;
        activeIdx = Math.min(activeIdx, Math.max(0, props.items.length - 1));
        rebuild();
        position();
      },
      onKeyDown: ({ event }) => {
        if (!currentProps) return false;
        const len = currentProps.items.length;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (len > 0) activeIdx = (activeIdx + 1) % len;
          updateActiveStyles();
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (len > 0) activeIdx = (activeIdx - 1 + len) % len;
          updateActiveStyles();
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          const item = currentProps.items[activeIdx];
          if (item) {
            currentProps.command({ id: item.id, label: item.display_name ?? item.id });
          }
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          panel?.remove();
          panel = null;
          return true;
        }
        return false;
      },
      onExit: () => {
        panel?.remove();
        panel = null;
        currentProps = null;
      },
    };
  },
};
