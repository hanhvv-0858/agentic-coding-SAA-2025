import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrimaryButton } from "../PrimaryButton";

describe("<PrimaryButton />", () => {
  it("renders the children as the button label", () => {
    render(<PrimaryButton>Sign in</PrimaryButton>);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("forwards clicks to onClick in default state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Click me</PrimaryButton>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables and shows aria-busy when `loading`", () => {
    render(<PrimaryButton loading>Sign in</PrimaryButton>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("swaps trailing icon for spinner when loading", () => {
    const { container } = render(
      <PrimaryButton loading trailingIcon={<span data-testid="normal-icon" />}>
        Open
      </PrimaryButton>,
    );
    expect(container.querySelector("[data-testid='normal-icon']")).toBeNull();
    // The spinner is rendered as an SVG.
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("defaults to type='button' (prevents accidental form submit)", () => {
    render(<PrimaryButton>Safe</PrimaryButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
