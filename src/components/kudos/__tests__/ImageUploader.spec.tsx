// ImageUploader unit tests — tasks T045/T051 (PR 3 US5).
// Focus: client-side MIME + size validation happens BEFORE storage calls.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageUploader } from "../ImageUploader";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

// Mock the client-side Supabase + toast emitter at module boundary.
const uploadMock = vi.fn();
const removeMock = vi.fn();
const createSignedUrlMock = vi.fn();
const getUserMock = vi.fn();
vi.mock("@/libs/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    storage: {
      from: () => ({
        upload: uploadMock,
        remove: removeMock,
        createSignedUrl: createSignedUrlMock,
      }),
    },
  }),
}));
vi.mock("@/libs/toast", () => ({ toast: vi.fn() }));
import { toast } from "@/libs/toast";
const toastMock = vi.mocked(toast);

beforeEach(() => {
  vi.clearAllMocks();
  getUserMock.mockResolvedValue({ data: { user: { id: "user-a" } } });
  uploadMock.mockResolvedValue({ data: null, error: null });
  createSignedUrlMock.mockResolvedValue({
    data: { signedUrl: "https://signed.example/img.jpg" },
    error: null,
  });
});

function renderUploader() {
  const onChange = vi.fn();
  const onUploadingChange = vi.fn();
  render(
    <ImageUploader
      messages={messages}
      onChange={onChange}
      onUploadingChange={onUploadingChange}
    />,
  );
  return { onChange, onUploadingChange };
}

describe("<ImageUploader />", () => {
  it("T045-1: renders the '+ Image' trigger button", () => {
    renderUploader();
    expect(
      screen.getByRole("button", { name: /Image/i }),
    ).toBeInTheDocument();
  });

  it("T045-2: rejects oversized file BEFORE calling storage.upload", async () => {
    renderUploader();
    const input = document.getElementById("kudo-image-input") as HTMLInputElement;
    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(input, "files", { value: [bigFile] });
    fireEvent.change(input);
    // Wait a microtask for async handler.
    await Promise.resolve();
    expect(uploadMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: messages.compose.validation.imageTooLarge,
        role: "alert",
      }),
    );
  });

  it("T045-3: rejects non-whitelisted MIME (e.g. application/pdf)", async () => {
    renderUploader();
    const input = document.getElementById("kudo-image-input") as HTMLInputElement;
    const pdfFile = new File([new Uint8Array(100)], "doc.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(input, "files", { value: [pdfFile] });
    fireEvent.change(input);
    await Promise.resolve();
    expect(uploadMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: messages.compose.validation.imageMimeInvalid,
        role: "alert",
      }),
    );
  });

  it("T045-4: accepts a valid JPEG < 5MB and calls storage.upload", async () => {
    const { onChange, onUploadingChange } = renderUploader();
    const input = document.getElementById("kudo-image-input") as HTMLInputElement;
    const okFile = new File([new Uint8Array(1024)], "ok.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(input, "files", { value: [okFile] });
    await vi.waitFor(() => {
      fireEvent.change(input);
      return true;
    });
    // Wait for async upload flow.
    await vi.waitFor(() => expect(uploadMock).toHaveBeenCalled(), {
      timeout: 2000,
    });
    expect(onUploadingChange).toHaveBeenCalled();
    // onChange fires at least once (initial + after upload).
    expect(onChange).toHaveBeenCalled();
  });
});
