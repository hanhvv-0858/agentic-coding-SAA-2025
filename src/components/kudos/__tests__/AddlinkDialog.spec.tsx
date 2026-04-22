// AddlinkDialog unit tests — spec OyDLDuSGEa / tasks T055 + T063.
// 8 scenarios covering insert, edit, validation, keyboard, and close paths.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddlinkDialog } from "../AddlinkDialog";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

beforeEach(() => {
  vi.clearAllMocks();
});

function renderDialog(overrides: Partial<Parameters<typeof AddlinkDialog>[0]> = {}) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(
    <AddlinkDialog
      isOpen
      messages={messages}
      onSave={onSave}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { onSave, onClose };
}

describe("<AddlinkDialog />", () => {
  it("T055-1: opens with empty fields when no initial values", () => {
    renderDialog();
    expect(screen.getByRole("dialog", { name: /Thêm đường dẫn/i })).toBeInTheDocument();
    const textInput = screen.getByLabelText(/Nội dung/i) as HTMLInputElement;
    const urlInput = screen.getByLabelText(/URL/i) as HTMLInputElement;
    expect(textInput.value).toBe("");
    expect(urlInput.value).toBe("");
  });

  it("T055-2: opens in edit mode pre-filling from initial props", () => {
    renderDialog({
      isEditMode: true,
      initialText: "Demo link",
      initialUrl: "https://demo.com",
    });
    const textInput = screen.getByLabelText(/Nội dung/i) as HTMLInputElement;
    const urlInput = screen.getByLabelText(/URL/i) as HTMLInputElement;
    expect(textInput.value).toBe("Demo link");
    expect(urlInput.value).toBe("https://demo.com");
  });

  it("T055-3: Lưu with valid fields fires onSave with payload", () => {
    const { onSave } = renderDialog();
    fireEvent.change(screen.getByLabelText(/Nội dung/i), {
      target: { value: "Showcase" },
    });
    fireEvent.change(screen.getByLabelText(/URL/i), {
      target: { value: "https://showcase.sun-asterisk.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Lưu/ }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      text: "Showcase",
      url: "https://showcase.sun-asterisk.com",
    });
  });

  it("T055-4: Lưu disabled when form invalid (aria-disabled=true)", () => {
    renderDialog();
    const save = screen.getByRole("button", { name: /^Lưu/ });
    expect(save).toHaveAttribute("aria-disabled", "true");
  });

  it("T055-5: Hủy fires onClose with zero onSave calls", () => {
    const { onSave, onClose } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /^Hủy/ }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("T055-6: Esc fires onClose", () => {
    const { onSave, onClose } = renderDialog();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("T055-7: URL regex rejects bare domain on blur (aria-invalid=true)", () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/Nội dung/i), {
      target: { value: "Demo" },
    });
    const url = screen.getByLabelText(/URL/i);
    fireEvent.change(url, { target: { value: "sun-asterisk.com" } });
    fireEvent.blur(url);
    expect(url).toHaveAttribute("aria-invalid", "true");
  });

  it("T055-8: URL regex rejects javascript: scheme", () => {
    const { onSave } = renderDialog();
    fireEvent.change(screen.getByLabelText(/Nội dung/i), {
      target: { value: "Demo" },
    });
    fireEvent.change(screen.getByLabelText(/URL/i), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Lưu/ }));
    // Lưu disabled → click does not fire onSave.
    expect(onSave).not.toHaveBeenCalled();
  });
});
