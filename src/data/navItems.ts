export type NavItem = {
  href: string;
  labelKey: string;
};

export const HEADER_NAV: readonly NavItem[] = [
  { href: "/", labelKey: "common.nav.aboutSaa" },
  { href: "/awards", labelKey: "common.nav.awardsInfo" },
  { href: "/kudos", labelKey: "common.nav.sunKudos" },
] as const;

export const FOOTER_NAV: readonly NavItem[] = [
  { href: "/", labelKey: "common.nav.aboutSaa" },
  { href: "/awards", labelKey: "common.nav.awardsInfo" },
  { href: "/kudos", labelKey: "common.nav.sunKudos" },
  { href: "/standards", labelKey: "common.nav.standards" },
] as const;
