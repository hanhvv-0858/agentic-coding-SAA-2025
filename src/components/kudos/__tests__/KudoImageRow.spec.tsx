import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudoImageRow } from "../KudoImageRow";

const make = (n: number) =>
  Array.from({ length: n }, (_, i) => `/images/kudo-img-${i}.png`);

describe("<KudoImageRow />", () => {
  it("renders nothing when no images provided", () => {
    const { container } = render(<KudoImageRow images={[]} alt="attachment" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders 3 thumbnails when given 3 images", () => {
    const { container } = render(
      <KudoImageRow images={make(3)} alt="attachment" />,
    );
    expect(container.querySelectorAll("img").length).toBe(3);
  });

  it("renders exactly 5 thumbnails at the cap", () => {
    const { container } = render(
      <KudoImageRow images={make(5)} alt="attachment" />,
    );
    expect(container.querySelectorAll("img").length).toBe(5);
  });

  it("caps at 5 even when given 7 images (spec US1 #4)", () => {
    const { container } = render(
      <KudoImageRow images={make(7)} alt="attachment" />,
    );
    expect(container.querySelectorAll("img").length).toBe(5);
  });

  it("has a consistent testid wrapper for Playwright E2E selectors", () => {
    render(<KudoImageRow images={make(2)} alt="attachment" />);
    expect(screen.getByTestId("kudo-image-row")).toBeInTheDocument();
  });
});
