import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { QuickActionsFab, type QuickActionsFabLabels } from "../QuickActionsFab";

const LABELS: QuickActionsFabLabels = {
  open: "Open quick actions menu",
  rules: "Rules",
  writeKudo: "Write KUDOS",
  close: "Close",
};

// `next/link` renders as a plain <a>; default behaviour is fine for these
// tests because we never actually navigate (happy-dom cancels navigation).

describe("<QuickActionsFab />", () => {
  afterEach(() => {
    // Ensure no stray listeners persist between tests.
    document.body.innerHTML = "";
  });

  describe("initial render (Phase 2 + FR-009 / FR-011 collapsed)", () => {
    it("mounts with trigger visible and menu hidden", () => {
      render(<QuickActionsFab labels={LABELS} />);
      expect(
        screen.getByRole("button", { name: LABELS.open }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("trigger has correct aria attributes", () => {
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-label", LABELS.open);
    });

    it("root has fixed position + z-50 + print:hidden", () => {
      const { container } = render(<QuickActionsFab labels={LABELS} />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain("fixed");
      expect(root.className).toContain("z-50");
      expect(root.className).toContain("print:hidden");
    });
  });

  describe("happy path — US1 (FR-001..FR-005 expanded)", () => {
    it("clicking trigger opens the menu and unmounts the trigger", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));

      expect(screen.getByRole("menu")).toBeInTheDocument();
      // Trigger pill no longer in DOM — enforced by mutual-exclusion.
      expect(
        screen.queryByRole("button", { name: LABELS.open }),
      ).not.toBeInTheDocument();
    });

    it("Thể lệ tile links to /the-le and closes menu on click", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));

      const menu = screen.getByRole("menu");
      const rulesLink = within(menu).getByRole("menuitem", {
        name: LABELS.rules,
      });
      expect(rulesLink).toHaveAttribute("href", "/the-le");

      await user.click(rulesLink);
      // In happy-dom, clicking a link's onClick fires before the browser
      // tries to navigate. Our onClick calls setOpen(false) synchronously.
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("Viết KUDOS tile links to /kudos/new and closes menu on click", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));

      const menu = screen.getByRole("menu");
      const writeLink = within(menu).getByRole("menuitem", {
        name: LABELS.writeKudo,
      });
      expect(writeLink).toHaveAttribute("href", "/kudos/new");

      await user.click(writeLink);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("Cancel button closes menu and re-mounts the trigger", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));

      const cancel = within(screen.getByRole("menu")).getByRole("menuitem", {
        name: LABELS.close,
      });
      await user.click(cancel);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: LABELS.open }),
      ).toBeInTheDocument();
    });

    it("menu has role=menu with localised aria-label", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));
      expect(screen.getByRole("menu")).toHaveAttribute(
        "aria-label",
        LABELS.open,
      );
    });

    it("three tiles render in order: Rules, Write KUDOS, Cancel", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));
      const items = within(screen.getByRole("menu")).getAllByRole("menuitem");
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveAccessibleName(LABELS.rules);
      expect(items[1]).toHaveAccessibleName(LABELS.writeKudo);
      expect(items[2]).toHaveAccessibleName(LABELS.close);
    });
  });

  describe("keyboard — US2 (FR-006 + FR-008)", () => {
    it("Enter on trigger opens menu and moves focus to first tile", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      trigger.focus();
      await user.keyboard("{Enter}");

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
      expect(document.activeElement).toBe(
        within(menu).getByRole("menuitem", { name: LABELS.rules }),
      );
    });

    it("Space on trigger also opens and focuses first tile", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      trigger.focus();
      await user.keyboard(" ");

      const menu = screen.getByRole("menu");
      expect(document.activeElement).toBe(
        within(menu).getByRole("menuitem", { name: LABELS.rules }),
      );
    });

    it("Esc closes menu and returns focus to re-mounted trigger", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      trigger.focus();
      await user.keyboard("{Enter}");
      // Menu open + first item focused now.

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      const newTrigger = screen.getByRole("button", { name: LABELS.open });
      expect(document.activeElement).toBe(newTrigger);
    });

    it("Tab from last menuitem (Cancel) wraps to first (Rules)", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      trigger.focus();
      await user.keyboard("{Enter}");

      const menu = screen.getByRole("menu");
      const cancel = within(menu).getByRole("menuitem", {
        name: LABELS.close,
      });
      cancel.focus();
      await user.tab();

      expect(document.activeElement).toBe(
        within(menu).getByRole("menuitem", { name: LABELS.rules }),
      );
    });

    it("Shift-Tab from first menuitem (Rules) wraps to last (Cancel)", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      trigger.focus();
      await user.keyboard("{Enter}");

      const menu = screen.getByRole("menu");
      const rules = within(menu).getByRole("menuitem", { name: LABELS.rules });
      rules.focus();
      await user.tab({ shift: true });

      expect(document.activeElement).toBe(
        within(menu).getByRole("menuitem", { name: LABELS.close }),
      );
    });

    it("mouse-open does NOT move focus to first tile", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      // userEvent.click simulates a mouse event with detail > 0.
      await user.click(screen.getByRole("button", { name: LABELS.open }));

      const menu = screen.getByRole("menu");
      const firstItem = within(menu).getByRole("menuitem", {
        name: LABELS.rules,
      });
      expect(document.activeElement).not.toBe(firstItem);
    });
  });

  describe("outside-click — US3 (FR-007)", () => {
    it("mousedown outside root closes the menu", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside">Outside content</div>
          <QuickActionsFab labels={LABELS} />
        </div>,
      );
      await user.click(screen.getByRole("button", { name: LABELS.open }));
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Use fireEvent.mouseDown so the state update is wrapped in act().
      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("mousedown on a tile does NOT close via outside-click path", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));

      const menu = screen.getByRole("menu");
      const tile = within(menu).getByRole("menuitem", { name: LABELS.rules });
      fireEvent.mouseDown(tile);
      // Menu still open — the tile's own click handler runs later.
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
  });

  describe("a11y polish — US4", () => {
    it("each menu tile has focus-visible outline classes", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));
      const items = within(screen.getByRole("menu")).getAllByRole("menuitem");
      items.forEach((item) => {
        expect(item.className).toContain("focus-visible:outline");
      });
    });

    it("trigger has focus-visible outline classes", () => {
      render(<QuickActionsFab labels={LABELS} />);
      const trigger = screen.getByRole("button", { name: LABELS.open });
      expect(trigger.className).toContain("focus-visible:outline");
      expect(trigger.className).toContain("focus-visible:outline-white");
    });

    it("Cancel button carries localised aria-label", async () => {
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));
      const cancel = within(screen.getByRole("menu")).getByRole("menuitem", {
        name: LABELS.close,
      });
      expect(cancel).toHaveAttribute("aria-label", LABELS.close);
    });
  });

  describe("reduced motion — US5", () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it("carries motion-reduce utility classes for reduced-motion UA", async () => {
      // The reduced-motion branch is expressed via Tailwind `motion-reduce:`
      // and `motion-safe:` prefixes on the class string — we assert the
      // classes are present; CSS itself is tested visually in Playwright.
      const user = userEvent.setup();
      render(<QuickActionsFab labels={LABELS} />);
      await user.click(screen.getByRole("button", { name: LABELS.open }));
      const menu = screen.getByRole("menu");
      expect(menu.className).toContain("motion-reduce:duration-75");
      expect(menu.className).toContain("motion-reduce:translate-y-0");
    });
  });
});
