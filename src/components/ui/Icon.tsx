import type { SVGProps } from "react";

export type IconName =
  | "flag-vn"
  | "chevron-down"
  | "google"
  | "globe"
  | "spinner"
  | "bell"
  | "pencil"
  | "arrow-right"
  | "arrow-up-right"
  | "saa";

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
    case "chevron-down":
      return (
        <svg {...common} fill="none">
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
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
  }
}
