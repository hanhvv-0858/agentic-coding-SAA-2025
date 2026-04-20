import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Toaster } from "../Toaster";
import {
  toast,
  resetToasts,
  TOAST_MAX_VISIBLE,
} from "@/libs/toast";

beforeEach(() => {
  resetToasts();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  resetToasts();
});

describe("<Toaster /> + toast()", () => {
  it("renders nothing initially — empty queue", () => {
    render(<Toaster />);
    expect(screen.queryByTestId("toast-item")).toBeNull();
    expect(screen.getByTestId("toaster-region")).toBeInTheDocument();
  });

  it("appends a toast when toast() is called", () => {
    render(<Toaster />);
    act(() => {
      toast({ message: "Hello world" });
    });
    const items = screen.getAllByTestId("toast-item");
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe("Hello world");
    // Default role = "status" (polite).
    expect(items[0]).toHaveAttribute("role", "status");
  });

  it("uses role='alert' when role: 'alert' is passed", () => {
    render(<Toaster />);
    act(() => {
      toast({ message: "Boom", role: "alert" });
    });
    expect(screen.getByTestId("toast-item")).toHaveAttribute("role", "alert");
  });

  it("auto-dismisses after the default duration (3000 ms)", () => {
    render(<Toaster />);
    act(() => {
      toast({ message: "Bye" });
    });
    expect(screen.getByTestId("toast-item")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.queryByTestId("toast-item")).toBeNull();
  });

  it("respects a custom duration", () => {
    render(<Toaster />);
    act(() => {
      toast({ message: "Quick", duration: 500 });
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByTestId("toast-item")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId("toast-item")).toBeNull();
  });

  it("caps the visible queue at MAX_VISIBLE — drops the oldest", () => {
    render(<Toaster />);
    act(() => {
      for (let i = 0; i < TOAST_MAX_VISIBLE + 2; i++) {
        toast({ message: `m${i}`, duration: 0 });
      }
    });
    const items = screen.getAllByTestId("toast-item");
    expect(items.length).toBe(TOAST_MAX_VISIBLE);
    // Oldest two were dropped — first remaining should be `m2`.
    expect(items[0].textContent).toBe("m2");
  });

  it("dismisses on Escape key", () => {
    render(<Toaster />);
    act(() => {
      toast({ message: "esc-test", duration: 0 });
    });
    const item = screen.getByTestId("toast-item");
    fireEvent.keyDown(item, { key: "Escape" });
    expect(screen.queryByTestId("toast-item")).toBeNull();
  });

  it("pauses the auto-dismiss timer on hover and resumes on leave", () => {
    render(<Toaster />);
    act(() => {
      toast({ message: "hover", duration: 1000 });
    });
    const item = screen.getByTestId("toast-item");

    // Half the duration elapses — still visible.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId("toast-item")).toBeInTheDocument();

    // Hover pauses the timer; advancing 2000 ms shouldn't dismiss.
    fireEvent.mouseEnter(item);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId("toast-item")).toBeInTheDocument();

    // Leave resumes — remaining ~500 ms should fire dismissal.
    fireEvent.mouseLeave(item);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByTestId("toast-item")).toBeNull();
  });
});
