import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
});

const montserratAlt = Montserrat_Alternates({
  variable: "--font-montserrat-alt",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
});
// DSEG7 Classic (true 7-segment LCD face) is self-hosted in
// `public/fonts/` and registered via @font-face in globals.css —
// matches the calculator/digital-clock look of the Figma countdown.
// OFL licensed (https://github.com/keshikan/DSEG).

export const metadata: Metadata = {
  title: "Sun Annual Awards 2025",
  description: "Bắt đầu hành trình của bạn cùng SAA 2025.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${montserratAlt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
