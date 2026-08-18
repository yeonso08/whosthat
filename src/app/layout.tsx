import type { Metadata } from "next";
import { Gothic_A1, Manrope } from "next/font/google";
import "./globals.css";

const gothic = Gothic_A1({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-lat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "나는 솔로 출연진 인스타",
  description:
    "나는 솔로 기수별 출연진의 인스타그램 계정을 확인된 것만 모아 둔 아카이브.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${gothic.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col">
        {children}
      </body>
    </html>
  );
}
