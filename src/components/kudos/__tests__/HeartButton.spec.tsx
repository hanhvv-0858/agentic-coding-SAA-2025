import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HeartButton } from "../HeartButton";
import { reset } from "../hooks/heartsCache";

const toggleMock = vi.fn();
const pushMock = vi.fn();
const trackMock = vi.fn();

vi.mock("@/app/kudos/actions", () => ({
  toggleKudoHeart: (...args: unknown[]) => toggleMock(...args),
}));

vi.mock("@/libs/analytics/track", () => ({
  track: (event: unknown) => trackMock(event),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/kudos",
  useSearchParams: () => new URLSearchParams(""),
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const labels = {
  add: "Heart this kudo",
  remove: "Unheart this kudo",
  disabled: "Can't heart your own kudo",
  error: "Couldn't save your heart. Please try again.",
};

beforeEach(() => {
  reset();
  toggleMock.mockReset();
  pushMock.mockReset();
  trackMock.mockReset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const setup = (overrides: Partial<React.ComponentProps<typeof HeartButton>> = {}) =>
  render(
    <HeartButton
      kudoId="k1"
      initialHeartsCount={3}
      initialHasHearted={false}
      isSender={false}
      labels={labels}
      {...overrides}
    />,
  );

describe("<HeartButton />", () => {
  it("renders the initial count + add label", () => {
    setup();
    expect(screen.getByTestId("kudo-heart-count").textContent).toBe("3");
    expect(screen.getByTestId("kudo-heart-button")).toHaveAttribute(
      "aria-label",
      labels.add,
    );
    expect(screen.getByTestId("kudo-heart-button")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("flips optimistically on click — +1 + heart-filled + aria-pressed=true", () => {
    toggleMock.mockResolvedValue({
      id: "k1",
      heartsCount: 4,
      hasHearted: true,
      multiplier: 1,
    });
    setup();
    act(() => {
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
    });
    expect(screen.getByTestId("kudo-heart-count").textContent).toBe("4");
    expect(screen.getByTestId("kudo-heart-button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("disables + aria-disabled when the viewer is the sender (FR-006)", () => {
    setup({ isSender: true });
    const btn = screen.getByTestId("kudo-heart-button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveAttribute("aria-label", labels.disabled);
  });

  it("debounce — two rapid clicks fire the Server Action only once", async () => {
    toggleMock.mockResolvedValue({
      id: "k1",
      heartsCount: 3,
      hasHearted: false,
      multiplier: 1,
    });
    setup();
    act(() => {
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
    });
    // Neither has fired yet — debounce pending.
    expect(toggleMock).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it("rolls back the optimistic state + calls onError on rejection", async () => {
    toggleMock.mockRejectedValue(new Error("boom"));
    const onError = vi.fn();
    setup({ onError });
    act(() => {
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
    });
    // Optimistic flip first.
    expect(screen.getByTestId("kudo-heart-count").textContent).toBe("4");
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    // Rollback to original count.
    expect(screen.getByTestId("kudo-heart-count").textContent).toBe("3");
    expect(onError).toHaveBeenCalledWith(labels.error);
  });

  it("redirects to /login?next=/kudos when authenticated=false (FR-003)", () => {
    setup({ authenticated: false });
    act(() => {
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
    });
    expect(pushMock).toHaveBeenCalledWith("/login?next=/kudos");
    expect(toggleMock).not.toHaveBeenCalled();
  });

  it("redirects on UNAUTHENTICATED server response", async () => {
    toggleMock.mockRejectedValue(new Error("UNAUTHENTICATED"));
    setup();
    act(() => {
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    expect(pushMock).toHaveBeenCalledWith("/login?next=/kudos");
  });

  it("emits kudos_heart_toggle analytics event on success", async () => {
    toggleMock.mockResolvedValue({
      id: "k1",
      heartsCount: 4,
      hasHearted: true,
      multiplier: 1,
    });
    setup();
    act(() => {
      fireEvent.click(screen.getByTestId("kudo-heart-button"));
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    expect(trackMock).toHaveBeenCalledWith({
      type: "kudos_heart_toggle",
      id: "k1",
      action: "add",
      multiplier: 1,
    });
  });
});
