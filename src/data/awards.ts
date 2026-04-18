export type AwardSlug =
  | "top-talent"
  | "top-project"
  | "top-project-leader"
  | "best-manager"
  | "signature-2025-creator"
  | "mvp";

export type Award = {
  id: string;
  slug: AwardSlug;
  titleKey: string;
  descKey: string;
  image: string;
};

export const AWARDS: readonly Award[] = [
  {
    id: "top-talent",
    slug: "top-talent",
    titleKey: "homepage.awards.topTalent.title",
    descKey: "homepage.awards.topTalent.desc",
    image: "/images/awards/top-talent.png",
  },
  {
    id: "top-project",
    slug: "top-project",
    titleKey: "homepage.awards.topProject.title",
    descKey: "homepage.awards.topProject.desc",
    image: "/images/awards/top-project.png",
  },
  {
    id: "top-project-leader",
    slug: "top-project-leader",
    titleKey: "homepage.awards.topProjectLeader.title",
    descKey: "homepage.awards.topProjectLeader.desc",
    image: "/images/awards/top-project-leader.png",
  },
  {
    id: "best-manager",
    slug: "best-manager",
    titleKey: "homepage.awards.bestManager.title",
    descKey: "homepage.awards.bestManager.desc",
    image: "/images/awards/best-manager.png",
  },
  {
    id: "signature-2025-creator",
    slug: "signature-2025-creator",
    titleKey: "homepage.awards.signature2025.title",
    descKey: "homepage.awards.signature2025.desc",
    image: "/images/awards/signature-2025.png",
  },
  {
    id: "mvp",
    slug: "mvp",
    titleKey: "homepage.awards.mvp.title",
    descKey: "homepage.awards.mvp.desc",
    image: "/images/awards/mvp.png",
  },
] as const;
