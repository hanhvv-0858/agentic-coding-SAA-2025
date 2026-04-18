import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "../Icon";

describe("<Icon />", () => {
  it("renders the requested icon as an SVG", () => {
    const { container } = render(<Icon name="google" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("adds role=img and aria-label when `title` prop is set", () => {
    const { container } = render(<Icon name="flag-vn" title="Vietnamese" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "Vietnamese");
  });

  it("is aria-hidden by default (decorative)", () => {
    const { container } = render(<Icon name="chevron-down" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("respects custom size", () => {
    const { container } = render(<Icon name="globe" size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("renders the close (X) icon via two <line> strokes", () => {
    const { container } = render(<Icon name="close" />);
    const lines = container.querySelectorAll("line");
    expect(lines).toHaveLength(2);
  });
});
