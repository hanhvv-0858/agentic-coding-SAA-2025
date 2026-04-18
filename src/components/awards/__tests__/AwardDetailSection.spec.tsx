import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AwardDetailSection } from "../AwardDetailSection";
import type { Award } from "@/data/awards";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

const TOP_TALENT: Award = {
  id: "top-talent",
  slug: "top-talent",
  titleKey: "homepage.awards.topTalent.title",
  descKey: "homepage.awards.topTalent.desc",
  image: "/images/awards/top-talent.png",
  longDescKey: "awards.topTalent.description",
  prizeCount: 10,
  prizeUnit: "individual",
  prizeValues: [{ suffixKey: "awards.card.perPrize", amountVnd: 7_000_000 }],
};

const SIGNATURE: Award = {
  id: "signature-2025-creator",
  slug: "signature-2025-creator",
  titleKey: "homepage.awards.signature2025.title",
  descKey: "homepage.awards.signature2025.desc",
  image: "/images/awards/signature-2025.png",
  longDescKey: "awards.signature2025.description",
  prizeCount: 1,
  prizeUnit: "either",
  prizeValues: [
    { suffixKey: "awards.card.signatureIndividualSuffix", amountVnd: 5_000_000 },
    { suffixKey: "awards.card.signatureTeamSuffix", amountVnd: 8_000_000 },
  ],
};

describe("<AwardDetailSection />", () => {
  it("renders with a <section id> matching the award slug (for hash deep-link)", () => {
    const { container } = render(
      <AwardDetailSection award={TOP_TALENT} messages={messages} title="Top Talent" />,
    );
    expect(container.querySelector("section#top-talent")).toBeInTheDocument();
  });

  it("renders the award title as an <h2> in content", () => {
    const { getByRole } = render(
      <AwardDetailSection award={TOP_TALENT} messages={messages} title="Top Talent" />,
    );
    // The <h2> comes from AwardContent; title overlay is <h3>
    expect(getByRole("heading", { level: 2 })).toHaveTextContent(/Top Talent/);
  });

  it("renders the overlay title as an aria-hidden decorative span (NOT an <h3>) — only one semantic H2 per section", () => {
    const { container, getAllByRole } = render(
      <AwardDetailSection award={TOP_TALENT} messages={messages} title="Top Talent" />,
    );
    // Exactly one heading — the <h2> from AwardContent.
    expect(getAllByRole("heading")).toHaveLength(1);
    // The decorative overlay is aria-hidden and displays the title visually.
    const decorative = container.querySelector('[aria-hidden="true"]');
    expect(decorative?.textContent).toMatch(/Top Talent/);
  });

  it("renders a single prize-value row for awards with prizeValues.length === 1", () => {
    render(
      <AwardDetailSection award={TOP_TALENT} messages={messages} title="Top Talent" />,
    );
    // "Giá trị giải thưởng:" appears once
    const labels = document.querySelectorAll(
      `:scope span:not([aria-hidden])`,
    );
    const texts = Array.from(labels).map((n) => n.textContent ?? "");
    const prizeLabelCount = texts.filter((t) => t.includes("Giá trị giải thưởng:")).length;
    expect(prizeLabelCount).toBe(1);
  });

  it("renders TWO prize-value rows for Signature 2025 (FR-007 count=1 two-values case)", () => {
    render(
      <AwardDetailSection
        award={SIGNATURE}
        messages={messages}
        title="Signature 2025 Creator"
      />,
    );
    const texts = Array.from(
      document.querySelectorAll(`:scope span:not([aria-hidden])`),
    ).map((n) => n.textContent ?? "");
    const prizeLabelCount = texts.filter((t) => t.includes("Giá trị giải thưởng:")).length;
    expect(prizeLabelCount).toBe(2);
    // Distinct suffixes for cá nhân / tập thể
    const joined = document.body.textContent ?? "";
    expect(joined).toContain("cho giải cá nhân");
    expect(joined).toContain("cho giải tập thể");
  });

  it("applies `reverse` variant class when reverse=true (even-indexed section)", () => {
    const { container } = render(
      <AwardDetailSection
        award={TOP_TALENT}
        messages={messages}
        title="Top Talent"
        reverse
      />,
    );
    const flexRow = container.querySelector("section > div");
    expect(flexRow?.className).toContain("lg:flex-row");
    expect(flexRow?.className).not.toContain("lg:flex-row-reverse");
  });

  it("applies the default (flex-row-reverse) when reverse=false", () => {
    const { container } = render(
      <AwardDetailSection
        award={TOP_TALENT}
        messages={messages}
        title="Top Talent"
        reverse={false}
      />,
    );
    const flexRow = container.querySelector("section > div");
    expect(flexRow?.className).toContain("lg:flex-row-reverse");
  });
});
