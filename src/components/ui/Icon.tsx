import type { SVGProps } from "react";

export type IconName =
  | "flag-vn"
  | "flag-gb"
  | "chevron-down"
  | "google"
  | "globe"
  | "spinner"
  | "bell"
  | "pencil"
  | "close"
  | "arrow-right"
  | "arrow-up-right"
  | "saa"
  | "target"
  | "diamond"
  | "license"
  // Kudos Live board (spec MaZUn5xHXZ) — sprite additions per plan
  // §Source code — modified files + design-style §Icons.
  | "heart"
  | "heart-filled"
  | "search"
  | "hashtag"
  | "building"
  | "arrow-left"
  | "chevron-left"
  | "chevron-right"
  | "copy-link"
  | "check"
  | "eye"
  | "gift";

type IconProps = Omit<SVGProps<SVGSVGElement>, "xmlns" | "viewBox"> & {
  name: IconName;
  size?: number;
  title?: string;
};

const DEFAULT_SIZE = 24;

export function Icon({ name, size = DEFAULT_SIZE, title, className, ...rest }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    role: title ? "img" : "presentation",
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    className,
    ...rest,
  } as const;

  switch (name) {
    case "flag-vn":
      return (
        <svg {...common} fill="none">
          <g clipPath="url(#icon-flag-vn-clip)">
            <rect width="20" height="15" x="2" y="5" fill="#F7FCFF" />
            <path fillRule="evenodd" clipRule="evenodd" d="M2 5V20H22V5H2Z" fill="#E31D1C" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0396 14.988L8.82029 17.0349L9.9001 13.4517L7.60389 11.1107L10.7696 11.0415L12.1702 7.50412L13.4465 11.0882L16.6047 11.1434L14.2314 13.5273L15.3396 16.9361L12.0396 14.988Z"
              fill="#FFD221"
            />
          </g>
          <defs>
            <clipPath id="icon-flag-vn-clip">
              <rect width="20" height="15" x="2" y="5" fill="#fff" />
            </clipPath>
          </defs>
        </svg>
      );
    case "flag-gb":
      return (
        <svg {...common} fill="none">
          <g clipPath="url(#icon-flag-gb-clip)">
            <rect width="20" height="15" x="2" y="5" fill="#012169" />
            <path d="M2,5 L22,20 M22,5 L2,20" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M2,5 L22,20 M22,5 L2,20" stroke="#C8102E" strokeWidth="1" />
            <rect x="2" y="11" width="20" height="3" fill="#FFFFFF" />
            <rect x="10.5" y="5" width="3" height="15" fill="#FFFFFF" />
            <rect x="2" y="11.75" width="20" height="1.5" fill="#C8102E" />
            <rect x="11.25" y="5" width="1.5" height="15" fill="#C8102E" />
          </g>
          <defs>
            <clipPath id="icon-flag-gb-clip">
              <rect width="20" height="15" x="2" y="5" fill="#fff" />
            </clipPath>
          </defs>
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common} fill="none">
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common} fill="none">
          <path
            d="M15 6L9 12L15 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common} fill="none">
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "google":
      return (
        <svg {...common} fill="none">
          <path
            d="M20.8245 12.2073C20.8245 11.5955 20.7748 10.9804 20.669 10.3785H12.1799V13.8443H17.0412C16.8395 14.962 16.1913 15.9508 15.2422 16.5792V18.8279H18.1425C19.8456 17.2604 20.8245 14.9455 20.8245 12.2073Z"
            fill="#4285F4"
          />
          <path
            d="M12.1799 21.0006C14.6073 21.0006 16.6543 20.2036 18.1458 18.8279L15.2455 16.5792C14.4386 17.1281 13.3969 17.439 12.1832 17.439C9.83527 17.439 7.84445 15.8549 7.13014 13.7252H4.1373V16.0434C5.66514 19.0826 8.77703 21.0006 12.1799 21.0006Z"
            fill="#34A853"
          />
          <path
            d="M7.12684 13.7252C6.74984 12.6074 6.74984 11.3971 7.12684 10.2793V7.96112H4.13731C2.86081 10.5042 2.8608 13.5003 4.1373 16.0434L7.12684 13.7252Z"
            fill="#FBBC04"
          />
          <path
            d="M12.1799 6.56224C13.463 6.5424 14.7032 7.02523 15.6324 7.9115L18.202 5.34196C16.5749 3.81413 14.4155 2.97415 12.1799 3.00061C8.77702 3.00061 5.66515 4.91868 4.13731 7.96112L7.12684 10.2793C7.83785 8.14631 9.83196 6.56224 12.1799 6.56224Z"
            fill="#EA4335"
          />
        </svg>
      );
    case "globe":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9z" />
        </svg>
      );
    case "spinner":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="origin-center motion-safe:animate-spin"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} fill="none">
          <path
            d="M21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10 4.19 10 4.1 10 4C10 3.46957 10.2107 2.96086 10.5858 2.58579C10.9609 2.21071 11.4696 2 12 2C12.5304 2 13.0391 2.21071 13.4142 2.58579C13.7893 2.96086 14 3.46957 14 4C14 4.1 14 4.19 14 4.29C16.97 5.17 19 7.9 19 11V17L21 19ZM14 21C14 21.5304 13.7893 22.0391 13.4142 22.4142C13.0391 22.7893 12.5304 23 12 23C11.4696 23 10.9609 22.7893 10.5858 22.4142C10.2107 22.0391 10 21.5304 10 21"
            fill="currentColor"
          />
        </svg>
      );
    case "pencil":
      return (
        <svg {...common} fill="none">
          <path
            d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
            fill="currentColor"
          />
        </svg>
      );
    case "close":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-up-right":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7" />
          <path d="M8 7h9v9" />
        </svg>
      );
    case "target":
      // Figma node I313:8467;214:2529 — target/aim-like glyph used on
      // award titles and prize-count rows. Fill color inherits via currentColor
      // so it adapts to cream / white depending on context.
      return (
        <svg {...common} fill="none">
          <path
            d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.84 21.79 9.69 21.39 8.61L19.79 10.21C19.93 10.8 20 11.4 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C12.6 4 13.2 4.07 13.79 4.21L15.4 2.6C14.31 2.21 13.16 2 12 2ZM19 2L15 6V7.5L12.45 10.05C12.3 10 12.15 10 12 10C11.4696 10 10.9609 10.2107 10.5858 10.5858C10.2107 10.9609 10 11.4696 10 12C10 12.5304 10.2107 13.0391 10.5858 13.4142C10.9609 13.7893 11.4696 14 12 14C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12C14 11.85 14 11.7 13.95 11.55L16.5 9H18L22 5H19V2ZM12 6C10.4087 6 8.88258 6.63214 7.75736 7.75736C6.63214 8.88258 6 10.4087 6 12C6 13.5913 6.63214 15.1174 7.75736 16.2426C8.88258 17.3679 10.4087 18 12 18C13.5913 18 15.1174 17.3679 16.2426 16.2426C17.3679 15.1174 18 13.5913 18 12H16C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8V6Z"
            fill="currentColor"
          />
        </svg>
      );
    case "diamond":
      // Figma node I313:8467;214:2535 — diamond gem glyph used on primary
      // prize-value rows.
      return (
        <svg {...common} fill="none">
          <path
            d="M16 9H19L14 16M10 9H14L12 17M5 9H8L10 16M15 4H17L19 7H16M11 4H13L14 7H10M7 4H9L8 7H5M6 2L2 8L12 22L22 8L18 2H6Z"
            fill="currentColor"
          />
        </svg>
      );
    case "license":
      // Figma node I313:8467;214:2543 — certificate/license ribbon used only
      // on Signature 2025's second prize-value row (tập thể variant).
      return (
        <svg {...common} fill="none">
          <path
            d="M9.00011 10C9.01047 9.20761 9.32986 8.45055 9.89024 7.89017C10.4506 7.32979 11.2077 7.0104 12.0001 7.00004C12.7925 7.0104 13.5496 7.32979 14.11 7.89017C14.6704 8.45055 14.9897 9.20761 15.0001 10C14.9897 10.7925 14.6704 11.5495 14.11 12.1099C13.5496 12.6703 12.7925 12.9897 12.0001 13C11.2077 12.9897 10.4506 12.6703 9.89024 12.1099C9.32986 11.5495 9.01047 10.7925 9.00011 10ZM12.0001 19L16.0001 20V16.92C14.7938 17.6465 13.4081 18.0206 12.0001 18C10.5921 18.0206 9.20643 17.6465 8.00011 16.92V20M12.0001 4.00004C11.2121 3.98566 10.4294 4.1326 9.70027 4.43183C8.97112 4.73106 8.31087 5.17625 7.76011 5.74004C7.19022 6.2914 6.73988 6.95414 6.4371 7.68701C6.13431 8.41988 5.98557 9.20722 6.00011 10C5.98969 10.7878 6.14044 11.5695 6.4431 12.2969C6.74576 13.0243 7.19394 13.6821 7.76011 14.23C8.3083 14.7993 8.9674 15.25 9.69668 15.5544C10.426 15.8589 11.2099 16.0105 12.0001 16C12.7903 16.0105 13.5743 15.8589 14.3035 15.5544C15.0328 15.25 15.6919 14.7993 16.2401 14.23C16.8063 13.6821 17.2545 13.0243 17.5571 12.2969C17.8598 11.5695 18.0105 10.7878 18.0001 10C18.0146 9.20722 17.8659 8.41988 17.5631 7.68701C17.2603 6.95414 16.81 6.2914 16.2401 5.74004C15.6893 5.17625 15.0291 4.73106 14.2999 4.43183C13.5708 4.1326 12.7881 3.98566 12.0001 4.00004ZM20.0001 10C19.9788 10.9599 19.7858 11.9082 19.4301 12.8C19.1097 13.7075 18.6249 14.5481 18.0001 15.28V23L12.0001 21L6.00011 23V15.28C4.7058 13.8265 3.99361 11.9463 4.00011 10C3.98248 8.95062 4.18014 7.90873 4.58089 6.93868C4.98163 5.96864 5.57696 5.09103 6.33011 4.36004C7.06381 3.60013 7.94547 2.99867 8.92067 2.59277C9.89587 2.18686 10.9439 1.98514 12.0001 2.00004C13.0563 1.98514 14.1043 2.18686 15.0795 2.59277C16.0547 2.99867 16.9364 3.60013 17.6701 4.36004C18.4233 5.09103 19.0186 5.96864 19.4193 6.93868C19.8201 7.90873 20.0177 8.95062 20.0001 10Z"
            fill="currentColor"
          />
        </svg>
      );
    case "saa":
      // Sun* brand asterisk — simplified to a single path for Icon use at
      // any size/color. Exact gradient version lives in /public/images/saa-logo.png.
      return (
        <svg {...common} fill="none">
          <path
            d="M12.3 4.1l3.2 4.6 5.5 0.5-4 3.9 1.1 5.4-4.9-2.7-4.9 2.7 1.1-5.4-4-3.9 5.5-0.5 3.2-4.6z"
            fill="currentColor"
          />
        </svg>
      );
    case "heart":
      // Outline heart — Kudos action bar idle state (C.4.1).
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "heart-filled":
      // Filled heart — Kudos action bar active state (C.4.1).
      return (
        <svg {...common} fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="currentColor"
          />
        </svg>
      );
    case "search":
      // Magnifier — A.1 Sunner search + B.7.3 spotlight search.
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case "hashtag":
      // Hashtag glyph — B.1.1 filter chip + C.3.7 hashtag pill prefix.
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9h16" />
          <path d="M4 15h16" />
          <path d="M10 3L8 21" />
          <path d="M16 3l-2 18" />
        </svg>
      );
    case "building":
      // Department glyph — B.1.2 department filter chip.
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M9 7h2" />
          <path d="M13 7h2" />
          <path d="M9 11h2" />
          <path d="M13 11h2" />
          <path d="M9 15h2" />
          <path d="M13 15h2" />
          <path d="M10 21v-3h4v3" />
        </svg>
      );
    case "arrow-left":
      // B.5.1 carousel previous arrow (mirror of arrow-right).
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </svg>
      );
    case "copy-link":
      // C.4.2 copy link button (link-like glyph).
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
          <path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
        </svg>
      );
    case "check":
      // C.4.2 CopyLinkButton "Đã copy!" success state — replaces the
      // copy-link glyph for the 1.5 s confirmation window.
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case "eye":
      // Gift/visibility glyph — sidebar "see detail" CTA fallback.
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "gift":
      // D.1.8 Mở quà CTA + decorative glyph in sidebar.
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13" />
          <path d="M19 12v9H5v-9" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5c2 0 4.5 3 4.5 5" />
          <path d="M16.5 8a2.5 2.5 0 0 0 0-5c-2 0-4.5 3-4.5 5" />
        </svg>
      );
  }
}
