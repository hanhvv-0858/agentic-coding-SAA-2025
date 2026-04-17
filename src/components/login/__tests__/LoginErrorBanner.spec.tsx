import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginErrorBanner } from "../LoginErrorBanner";
import vi_ from "@/messages/vi.json";
import en from "@/messages/en.json";

// Silence analytics stdout during tests.
vi.mock("@/libs/analytics/track", () => ({
  track: vi.fn(),
  emailDomain: (e: string) => e.split("@")[1] ?? "",
}));

const messagesVi = vi_ as never;
const messagesEn = en as never;

describe("<LoginErrorBanner />", () => {
  it("renders nothing when errorParam is missing", () => {
    const { container } = render(
      <LoginErrorBanner errorParam={undefined} messages={messagesVi} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for unknown error codes", () => {
    const { container } = render(
      <LoginErrorBanner errorParam="bogus" messages={messagesVi} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the VI copy for access_denied", () => {
    render(<LoginErrorBanner errorParam="access_denied" messages={messagesVi} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Đăng nhập đã bị huỷ. Vui lòng thử lại.",
    );
  });

  it("renders the VI copy for network errors", () => {
    render(<LoginErrorBanner errorParam="network" messages={messagesVi} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Không kết nối được tới Google. Hãy thử lại sau.",
    );
  });

  it("renders the VI copy for session_exchange_failed", () => {
    render(
      <LoginErrorBanner errorParam="session_exchange_failed" messages={messagesVi} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Phiên đăng nhập không hợp lệ.",
    );
  });

  it("renders the VI copy for cookie_blocked", () => {
    render(<LoginErrorBanner errorParam="cookie_blocked" messages={messagesVi} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Trình duyệt của bạn đang chặn cookie",
    );
  });

  it("switches to EN copy when given EN messages", () => {
    render(<LoginErrorBanner errorParam="access_denied" messages={messagesEn} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sign-in was cancelled. Please try again.",
    );
  });
});
