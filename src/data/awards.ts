export type AwardSlug =
  | "top-talent"
  | "top-project"
  | "top-project-leader"
  | "best-manager"
  | "signature-2025-creator"
  | "mvp";

export type PrizeUnit = "individual" | "team" | "either";

export type AwardPrizeValue = {
  /** Optional i18n key for trailing suffix text (e.g., "cho mỗi giải thưởng"). Omit for no suffix. */
  suffixKey?: string;
  /** Prize amount in VND. */
  amountVnd: number;
};

export type Award = {
  id: string;
  slug: AwardSlug;
  titleKey: string;
  /** Short description used by Homepage AwardCard (2-line clamped body). */
  descKey: string;
  image: string;
  /** Long-form description paragraph for `/awards` page. Homepage ignores this. */
  longDescKey: string;
  /** How many winners for this award. */
  prizeCount: number;
  /** Whether winners are individuals, teams, or either. */
  prizeUnit: PrizeUnit;
  /** Cash prizes. Length 1 for most awards; length 2 for Signature 2025 (cá nhân + tập thể). */
  prizeValues: readonly AwardPrizeValue[];
};

export const AWARDS: readonly Award[] = [
  {
    id: "top-talent",
    slug: "top-talent",
    titleKey: "homepage.awards.topTalent.title",
    descKey: "homepage.awards.topTalent.desc",
    image: "/images/awards/top-talent.png",
    longDescKey: "awards.topTalent.description",
    prizeCount: 10,
    prizeUnit: "individual",
    prizeValues: [{ suffixKey: "awards.card.perPrize", amountVnd: 7_000_000 }],
  },
  {
    id: "top-project",
    slug: "top-project",
    titleKey: "homepage.awards.topProject.title",
    descKey: "homepage.awards.topProject.desc",
    image: "/images/awards/top-project.png",
    longDescKey: "awards.topProject.description",
    prizeCount: 2,
    prizeUnit: "team",
    prizeValues: [{ suffixKey: "awards.card.perPrize", amountVnd: 15_000_000 }],
  },
  {
    id: "top-project-leader",
    slug: "top-project-leader",
    titleKey: "homepage.awards.topProjectLeader.title",
    descKey: "homepage.awards.topProjectLeader.desc",
    image: "/images/awards/top-project-leader.png",
    longDescKey: "awards.topProjectLeader.description",
    prizeCount: 3,
    prizeUnit: "individual",
    prizeValues: [{ suffixKey: "awards.card.perPrize", amountVnd: 7_000_000 }],
  },
  {
    id: "best-manager",
    slug: "best-manager",
    titleKey: "homepage.awards.bestManager.title",
    descKey: "homepage.awards.bestManager.desc",
    image: "/images/awards/best-manager.png",
    longDescKey: "awards.bestManager.description",
    prizeCount: 1,
    prizeUnit: "individual",
    prizeValues: [{ amountVnd: 10_000_000 }],
  },
  {
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
  },
  {
    id: "mvp",
    slug: "mvp",
    titleKey: "homepage.awards.mvp.title",
    descKey: "homepage.awards.mvp.desc",
    image: "/images/awards/mvp.png",
    longDescKey: "awards.mvp.description",
    prizeCount: 1,
    prizeUnit: "individual",
    prizeValues: [{ amountVnd: 15_000_000 }],
  },
] as const;
