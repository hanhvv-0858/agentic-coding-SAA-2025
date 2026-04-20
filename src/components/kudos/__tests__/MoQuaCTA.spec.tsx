import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoQuaCTA } from "../MoQuaCTA";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const messages = viMessages as unknown as Messages;

beforeEach(() => {
  pushMock.mockReset();
});

describe("<MoQuaCTA />", () => {
  it("renders enabled when unopened > 0 — clicking navigates to /gifts/open", () => {
    render(<MoQuaCTA unopened={3} messages={messages} />);
    const cta = screen.getByTestId("kudos-mo-qua-cta");
    expect(cta).not.toBeDisabled();
    fireEvent.click(cta);
    expect(pushMock).toHaveBeenCalledWith("/gifts/open");
  });

  it("renders disabled with aria-disabled=true when unopened === 0 (FR-010)", () => {
    render(<MoQuaCTA unopened={0} messages={messages} />);
    const cta = screen.getByTestId("kudos-mo-qua-cta");
    expect(cta).toBeDisabled();
    expect(cta).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(cta);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("applies the disabled tooltip via `title`", () => {
    render(<MoQuaCTA unopened={0} messages={messages} />);
    const cta = screen.getByTestId("kudos-mo-qua-cta");
    expect(cta.getAttribute("title")).toBe(
      messages.kudos.sidebar.moQuaDisabledTooltip,
    );
  });
});
