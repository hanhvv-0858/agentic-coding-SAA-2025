import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyLinkButton } from "../CopyLinkButton";
import { resetToasts, getSnapshot } from "@/libs/toast";

const trackMock = vi.fn();
vi.mock("@/libs/analytics/track", () => ({
  track: (event: unknown) => trackMock(event),
}));

const labels = {
  copy: "Copy link",
  copied: "Copied!",
  toast: "Link copied — ready to share!",
  errorToast: "Couldn't copy the link. Try again.",
};

beforeEach(() => {
  resetToasts();
  trackMock.mockReset();
  vi.useFakeTimers();
  // Default origin so the button computes a stable URL.
  Object.defineProperty(window, "location", {
    value: new URL("https://saa.test"),
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  // Reset clipboard between tests.
  // @ts-expect-error happy-dom doesn't strictly type-check this delete.
  delete (navigator as Navigator & { clipboard?: unknown }).clipboard;
});

const setup = (kudoId = "kudo-1") =>
  render(<CopyLinkButton kudoId={kudoId} labels={labels} />);

describe("<CopyLinkButton />", () => {
  it("renders the idle label by default", () => {
    setup();
    const btn = screen.getByTestId("kudo-copy-link-button");
    expect(btn).toHaveAttribute("aria-label", labels.copy);
    expect(screen.getByTestId("kudo-copy-link-label").textContent).toBe(
      labels.copy,
    );
    expect(btn).toHaveAttribute("data-copied", "false");
  });

  it("copies the kudo URL via navigator.clipboard.writeText on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    setup("kudo-42");
    await act(async () => {
      fireEvent.click(screen.getByTestId("kudo-copy-link-button"));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("https://saa.test/kudos/kudo-42");
  });

  it("swaps the inline label to copied + reverts after 1.5 s", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    setup();
    await act(async () => {
      fireEvent.click(screen.getByTestId("kudo-copy-link-button"));
    });

    // Immediately swapped to "copied" state.
    expect(screen.getByTestId("kudo-copy-link-label").textContent).toBe(
      labels.copied,
    );
    expect(screen.getByTestId("kudo-copy-link-button")).toHaveAttribute(
      "data-copied",
      "true",
    );

    // Reverts after 1.5 s.
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByTestId("kudo-copy-link-label").textContent).toBe(
      labels.copy,
    );
    expect(screen.getByTestId("kudo-copy-link-button")).toHaveAttribute(
      "data-copied",
      "false",
    );
  });

  it("emits a status toast on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    setup();
    await act(async () => {
      fireEvent.click(screen.getByTestId("kudo-copy-link-button"));
    });
    const toasts = getSnapshot();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe(labels.toast);
    expect(toasts[0].role).toBe("status");
  });

  it("emits the kudos_copy_link analytics event on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    setup("kudo-7");
    await act(async () => {
      fireEvent.click(screen.getByTestId("kudo-copy-link-button"));
    });
    expect(trackMock).toHaveBeenCalledWith({
      type: "kudos_copy_link",
      id: "kudo-7",
    });
  });

  it("falls back to document.execCommand when navigator.clipboard is missing", async () => {
    // Force the modern path off — happy-dom may ship a clipboard stub.
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    // happy-dom doesn't ship `execCommand` so install a stub directly.
    const execStub = vi.fn(() => true);
    (document as unknown as { execCommand: typeof execStub }).execCommand =
      execStub;

    setup("kudo-fb");
    await act(async () => {
      fireEvent.click(screen.getByTestId("kudo-copy-link-button"));
    });
    expect(execStub).toHaveBeenCalledWith("copy");
    // Inline label still flips on fallback success.
    expect(screen.getByTestId("kudo-copy-link-label").textContent).toBe(
      labels.copied,
    );
  });

  it("emits an alert toast when both clipboard paths fail", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("nope"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const execStub = vi.fn(() => false);
    (document as unknown as { execCommand: typeof execStub }).execCommand =
      execStub;

    setup();
    await act(async () => {
      fireEvent.click(screen.getByTestId("kudo-copy-link-button"));
    });

    const toasts = getSnapshot();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe(labels.errorToast);
    expect(toasts[0].role).toBe("alert");
    // Inline label should NOT flip on failure.
    expect(screen.getByTestId("kudo-copy-link-label").textContent).toBe(
      labels.copy,
    );
  });
});
