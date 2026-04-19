import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

const pushMock = vi.fn();
const trackMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
}));

vi.mock("@/libs/analytics/track", () => ({
  track: (e: unknown) => trackMock(e),
}));

import { PrelaunchCountdown } from "../PrelaunchCountdown";

const LABELS = { days: "DAYS", hours: "HOURS", minutes: "MINUTES" };

describe("<PrelaunchCountdown />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    pushMock.mockReset();
    trackMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a role=timer region with a readable aria-label", () => {
    render(
      <PrelaunchCountdown
        eventStartAt={new Date("2026-01-02T05:20:00Z").toISOString()}
        labels={LABELS}
      />,
    );
    const timer = screen.getByRole("timer");
    expect(timer).toHaveAttribute("aria-live", "polite");
    expect(timer.getAttribute("aria-label")).toMatch(/days: 01/);
    expect(timer.getAttribute("aria-label")).toMatch(/hours: 05/);
    expect(timer.getAttribute("aria-label")).toMatch(/minutes: 20/);
  });

  it("renders all three unit labels", () => {
    render(
      <PrelaunchCountdown
        eventStartAt={new Date("2026-01-02T00:00:00Z").toISOString()}
        labels={LABELS}
      />,
    );
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("does NOT redirect when eventStartAt is missing (fallback path)", () => {
    render(<PrelaunchCountdown eventStartAt={undefined} labels={LABELS} />);
    expect(pushMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
  });
});
