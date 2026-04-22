// BodyEditor unit tests — PR 2 US1 T028. TipTap is hard to fully
// drive under happy-dom, so these tests scope to:
//   1. renders an editor container + toolbar + mention helper
//   2. exposes an editor instance via onEditorReady
//   3. toolbar buttons render with correct aria-label

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BodyEditor } from "../BodyEditor";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

describe("<BodyEditor />", () => {
  it("T028-1: renders the mention helper text below the editor", async () => {
    render(<BodyEditor onEditorReady={() => {}} onOpenAddlink={() => {}} messages={messages} />);
    // The helper text is rendered immediately (does not depend on editor).
    expect(
      await screen.findByText(/@ \+ tên/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("T028-2: calls onEditorReady once the editor mounts", async () => {
    const onReady = vi.fn();
    render(<BodyEditor onEditorReady={onReady} onOpenAddlink={() => {}} messages={messages} />);
    // useEditor creates the editor asynchronously after mount; wait for it.
    await vi.waitFor(() => expect(onReady).toHaveBeenCalled(), {
      timeout: 2000,
    });
  });

  it("T028-3: renders 6 toolbar buttons (Bold/Italic/Strike/Bullet/Link/Quote)", async () => {
    render(<BodyEditor onEditorReady={() => {}} onOpenAddlink={() => {}} messages={messages} />);
    const expectedLabels = [
      messages.compose.toolbar.bold,
      messages.compose.toolbar.italic,
      messages.compose.toolbar.strikethrough,
      messages.compose.toolbar.bulletList,
      messages.compose.toolbar.link,
      messages.compose.toolbar.quote,
    ];
    for (const label of expectedLabels) {
      // Wait for toolbar to appear (depends on useEditor).
      await screen.findByRole("button", { name: label }, { timeout: 2000 });
    }
  });
});
