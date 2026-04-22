// ProfileMenu unit tests — spec z4sCl3_Qtk-Dropdown-profile T013.
// Covers: default closed render, open/close, admin-conditional row,
// outside-click + Escape dismissal, structural anchors for the
// Server Action logout form, and visual-regression classname anchors.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ProfileMenu } from "../ProfileMenu";

vi.mock("@/libs/auth/signOut", () => ({
  signOut: vi.fn(),
}));

const baseLabels = {
  open: "Account menu",
  profile: "Profile",
  signOut: "Logout",
  adminDashboard: "Admin Dashboard",
};

const baseUser = {
  email: "alice@example.com",
  displayName: "Alice",
  avatarUrl: null,
};

function renderMenu(overrides: Partial<Parameters<typeof ProfileMenu>[0]> = {}) {
  return render(
    <ProfileMenu
      user={baseUser}
      isAdmin={false}
      labels={baseLabels}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("<ProfileMenu />", () => {
  it("renders the trigger closed by default — no role=menu in DOM", () => {
    renderMenu();
    expect(screen.getByRole("button", { name: /Account menu/i })).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens on trigger click and renders 2 menuitem rows (non-admin)", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Profile");
    expect(items[1]).toHaveTextContent("Logout");
  });

  it("renders 3 menuitem rows when isAdmin=true with Admin Dashboard in the middle", () => {
    renderMenu({ isAdmin: true });
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Profile");
    expect(items[1]).toHaveTextContent("Admin Dashboard");
    expect(items[2]).toHaveTextContent("Logout");
  });

  it("closes the menu when clicking outside", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    act(() => {
      // mousedown outside the root — matches the component's listener.
      fireEvent.mouseDown(document.body);
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the menu when Escape is pressed", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Profile row is an <a> element pointing to /profile", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    const profile = screen.getByRole("menuitem", { name: /Profile/i });
    expect(profile.tagName).toBe("A");
    expect(profile.getAttribute("href")).toBe("/profile");
  });

  it("Logout row is a submit button (wraps the signOut Server Action)", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    const logout = screen.getByRole("menuitem", { name: /Logout/i });
    expect(logout.tagName).toBe("BUTTON");
    expect(logout.getAttribute("type")).toBe("submit");
    // The <form action={signOut}> wraps this button — React's form
    // actions serialise into the DOM via a hidden `formAction`
    // attribute on the submit button in some builds, and via a
    // normal <form> element in others. The cross-build invariant is
    // `type="submit"` + a surrounding submit scope; behavioural
    // correctness is covered by the signOut Server Action's own tests.
  });

  it("applies the dark-navy listbox family classes (visual regression anchor)", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: /Account menu/i }));
    const panel = screen.getByRole("menu");
    expect(panel.className).toContain("bg-[var(--color-panel-surface)]");
    expect(panel.className).toContain("border-[var(--color-border-secondary)]");
  });
});
