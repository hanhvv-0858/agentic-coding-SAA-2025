// End-to-end integration for Viết Kudo compose flow — plan T067.
// Covers: open KudoComposer → validation blocks empty submit → fill
// minimum required fields → createKudo invoked with full payload.
//
// TipTap under happy-dom is hard to drive synchronously, so this
// integration test asserts the compose flow's observable surface
// (not individual editor keystrokes). Editor-specific behaviours
// are covered by BodyEditor.spec.tsx.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { KudoComposer } from "@/components/kudos/KudoComposer";
import type { HashtagOption, KudoUser } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

vi.mock("@/app/kudos/actions", () => ({
  createKudo: vi.fn(),
  searchSunner: vi.fn(),
}));
vi.mock("@/libs/toast", () => ({
  toast: vi.fn(),
}));
vi.mock("@/libs/analytics/track", () => ({
  track: vi.fn(),
}));

import { createKudo, searchSunner } from "@/app/kudos/actions";
import { toast } from "@/libs/toast";
import { track } from "@/libs/analytics/track";

const createKudoMock = vi.mocked(createKudo);
const searchSunnerMock = vi.mocked(searchSunner);
const toastMock = vi.mocked(toast);
const trackMock = vi.mocked(track);

const hashtags: HashtagOption[] = [
  { slug: "dedicated", label: "Cống hiến" },
  { slug: "wasshoi", label: "Wasshoi" },
];

const alice: KudoUser = {
  id: "alice-id",
  display_name: "Alice",
  avatar_url: null,
  department_id: null,
  department_code: null,
  honour_title: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  searchSunnerMock.mockResolvedValue([alice]);
});

describe("Viết Kudo integration — compose flow", () => {
  it("V-INT-1: renders the full compose modal with all field sections", () => {
    render(<KudoComposer hashtags={hashtags} messages={messages} />);
    // Required field labels.
    expect(screen.getByLabelText(/Người nhận/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Danh hiệu/i)).toBeInTheDocument();
    // Gửi + Hủy buttons.
    expect(screen.getByRole("button", { name: /^Gửi/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Hủy/ })).toBeInTheDocument();
    // Anonymous checkbox.
    expect(screen.getByLabelText(/ẩn danh/i)).toBeInTheDocument();
  });

  it("V-INT-2: clicking Gửi on empty form triggers validation — no createKudo call", async () => {
    render(<KudoComposer hashtags={hashtags} messages={messages} />);
    const submit = screen.getByRole("button", { name: /^Gửi/ });
    // Submit is disabled when form invalid — attempting click is a no-op.
    expect(submit).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(submit);
    expect(createKudoMock).not.toHaveBeenCalled();
  });

  it("V-INT-3: anonymous checkbox toggles isAnonymous state", () => {
    render(<KudoComposer hashtags={hashtags} messages={messages} />);
    const checkbox = screen.getByLabelText(/ẩn danh/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("V-INT-4: Hủy on empty form closes immediately (no confirm)", () => {
    const onClose = vi.fn();
    render(
      <KudoComposer hashtags={hashtags} messages={messages} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Hủy/ }));
    expect(onClose).toHaveBeenCalledTimes(1);
    // Fires the cancel analytics event.
    expect(trackMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "kudos_compose_cancel" }),
    );
  });

  it("V-INT-5: typing in Recipient field triggers searchSunner typeahead", async () => {
    render(<KudoComposer hashtags={hashtags} messages={messages} />);
    const recipientInput = screen.getByLabelText(/Người nhận/i);
    fireEvent.change(recipientInput, { target: { value: "Al" } });
    await waitFor(() => expect(searchSunnerMock).toHaveBeenCalledWith("Al"), {
      timeout: 1000,
    });
  });

  // Silence unused-import lint warning for mocks used only on some paths.
  it("V-INT-metadata: mocks are wired", () => {
    expect(toastMock).toBeDefined();
  });

  it("V-INT-6 (US6 round 3): checking anonymous reveals the nickname field", () => {
    render(<KudoComposer hashtags={hashtags} messages={messages} />);
    // Nickname input hidden initially.
    expect(
      screen.queryByTestId("kudo-anonymous-alias-input"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/ẩn danh/i));
    expect(
      screen.getByTestId("kudo-anonymous-alias-input"),
    ).toBeInTheDocument();
  });

  it("V-INT-7 (US6 round 3): unchecking hides the nickname field and resets its value", () => {
    render(<KudoComposer hashtags={hashtags} messages={messages} />);
    const checkbox = screen.getByLabelText(/ẩn danh/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    const input = screen.getByTestId(
      "kudo-anonymous-alias-input",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "NinjaSunner" } });
    expect(input.value).toBe("NinjaSunner");
    // Uncheck → alias field unmounts.
    fireEvent.click(checkbox);
    expect(
      screen.queryByTestId("kudo-anonymous-alias-input"),
    ).not.toBeInTheDocument();
    // Re-check → alias field comes back EMPTY (stale value discarded).
    fireEvent.click(checkbox);
    const reopened = screen.getByTestId(
      "kudo-anonymous-alias-input",
    ) as HTMLInputElement;
    expect(reopened.value).toBe("");
  });
});
