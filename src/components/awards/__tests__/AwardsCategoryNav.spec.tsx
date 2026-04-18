import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { AwardsCategoryNav } from "../AwardsCategoryNav";
import type { AwardSlug } from "@/data/awards";

const ITEMS: ReadonlyArray<{ slug: AwardSlug; label: string }> = [
  { slug: "top-talent", label: "Top Talent" },
  { slug: "top-project", label: "Top Project" },
  { slug: "top-project-leader", label: "Top Project Leader" },
  { slug: "best-manager", label: "Best Manager" },
  { slug: "signature-2025-creator", label: "Signature 2025 Creator" },
  { slug: "mvp", label: "MVP" },
];

// ──────────────────────────────────────────────────────────────
// Global mocks for browser APIs not in happy-dom.
// ──────────────────────────────────────────────────────────────

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IOCallback;
  observed = new Set<Element>();

  constructor(cb: IOCallback) {
    this.callback = cb;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  // Test helper: manually fire the callback for a given element.
  fire(target: Element, isIntersecting: boolean) {
    this.callback([
      {
        target,
        isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as IntersectionObserverEntry,
    ]);
  }
}

function mockMatchMedia(prefersReduced: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches: prefersReduced,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    dispatchChange: () => listeners.forEach((cb) => cb()),
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue(mq),
  });
  return mq;
}

function seedSections() {
  // Create 6 <section id="<slug>"> elements so getElementById works + observer observes.
  const container = document.createElement("div");
  container.id = "sections-root";
  for (const item of ITEMS) {
    const section = document.createElement("section");
    section.id = item.slug;
    section.scrollIntoView = vi.fn();
    container.appendChild(section);
  }
  document.body.appendChild(container);
  return container;
}

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────

describe("<AwardsCategoryNav />", () => {
  let sectionsRoot: HTMLElement;
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockMatchMedia(false);
    sectionsRoot = seedSections();
    replaceStateSpy = vi.spyOn(window.history, "replaceState");
    // happy-dom lacks scrollend — force fallback path
    // by removing the property if present.
    if ("onscrollend" in window) {
      delete (window as unknown as Record<string, unknown>).onscrollend;
    }
    window.location.hash = "";
  });

  afterEach(() => {
    replaceStateSpy.mockRestore();
    document.body.removeChild(sectionsRoot);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders all 6 nav items as anchors with href=#<slug>", () => {
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    for (const item of ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", `#${item.slug}`);
    }
  });

  it("click on a nav item updates active state + URL hash via replaceState", () => {
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    const link = screen.getByRole("link", { name: "Top Project" });
    fireEvent.click(link);

    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "#top-project");
    expect(screen.getByRole("link", { name: "Top Project" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    const target = document.getElementById("top-project");
    expect(target?.scrollIntoView).toHaveBeenCalled();
  });

  it("Enter key activates the same handler as click (FR-014 keyboard support)", () => {
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    const link = screen.getByRole("link", { name: "Best Manager" });
    fireEvent.keyDown(link, { key: "Enter" });

    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "#best-manager");
    expect(screen.getByRole("link", { name: "Best Manager" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("scroll-spy observer updates active state when a section intersects", () => {
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );

    const [observer] = MockIntersectionObserver.instances;
    expect(observer).toBeDefined();
    const mvpSection = document.getElementById("mvp");
    expect(mvpSection).toBeInTheDocument();

    act(() => {
      observer.fire(mvpSection!, true);
    });

    expect(screen.getByRole("link", { name: "MVP" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("scroll-spy pauses during programmatic scroll triggered by click (FR-005a)", () => {
    vi.useFakeTimers();
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );

    const [observer] = MockIntersectionObserver.instances;
    fireEvent.click(screen.getByRole("link", { name: "Best Manager" }));
    // Mid-scroll, a different section's intersection fires — should be ignored.
    const mvpSection = document.getElementById("mvp")!;
    act(() => {
      observer.fire(mvpSection, true);
    });
    expect(screen.getByRole("link", { name: "Best Manager" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    // Advance past 600 ms fallback — observer updates resume.
    act(() => {
      vi.advanceTimersByTime(700);
    });
    act(() => {
      observer.fire(mvpSection, true);
    });
    expect(screen.getByRole("link", { name: "MVP" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("reads initial hash on mount and scrolls to matching section", async () => {
    window.location.hash = "#signature-2025-creator";
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    // requestAnimationFrame defers the scroll call; wait for it to land.
    const target = document.getElementById("signature-2025-creator");
    await waitFor(() => {
      expect(target?.scrollIntoView).toHaveBeenCalled();
    });
  });

  it("invalid hash on mount is ignored (no crash, first section stays active)", () => {
    window.location.hash = "#nonexistent-slug";
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    expect(screen.getByRole("link", { name: "Top Talent" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("hashchange event re-syncs active state + scrolls", async () => {
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    window.location.hash = "#top-project-leader";
    act(() => {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    const target = document.getElementById("top-project-leader");
    await waitFor(() => {
      expect(target?.scrollIntoView).toHaveBeenCalled();
    });
  });

  it("uses `instant` scroll behaviour when prefers-reduced-motion: reduce", () => {
    mockMatchMedia(true);
    render(
      <AwardsCategoryNav
        items={ITEMS}
        ariaLabel="Awards categories"
        initialActiveSlug="top-talent"
      />,
    );
    const link = screen.getByRole("link", { name: "MVP" });
    fireEvent.click(link);

    const target = document.getElementById("mvp");
    expect(target?.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });
});
