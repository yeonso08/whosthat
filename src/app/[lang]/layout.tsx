import type { Metadata } from "next";
import { Gothic_A1, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import {
  getDictionary,
  isLocale,
  languageAlternates,
  LOCALES,
} from "@/lib/i18n";
import { homeHref } from "@/lib/links";
import { openGraphBase } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const gothic = Gothic_A1({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-lat",
  subsets: ["latin"],
  // 800 은 워드마크(`@nukko`) 전용이다. 본문에는 쓰지 않는다.
  weight: ["500", "600", "700", "800"],
});

/** 언어를 하나 더하면 전 화면이 그 언어로 한 벌 더 프리렌더된다. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const home = homeHref(lang);

  return {
    // 이게 있어야 canonical·OG 이미지가 절대 URL 로 나간다. 없으면 상대경로로
    // 새어 나가서 카카오톡·X 미리보기가 통째로 깨진다.
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.site.name,
      // 기수 페이지가 자기 제목만 주면 뒤에 사이트 이름이 붙는다.
      template: `%s · ${dict.site.name}`,
    },
    description: dict.site.description,
    alternates: { canonical: home, languages: languageAlternates("") },
    openGraph: {
      ...openGraphBase(lang),
      type: "website",
      title: dict.site.name,
      description: dict.site.description,
      url: home,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      // next-themes 가 마운트 시점에 <html> 클래스를 다크/라이트로 고쳐 쓴다 —
      // 서버가 모르는 값이라 하이드레이션 경고가 나므로 여기서만 억제한다.
      suppressHydrationWarning
      className={`${gothic.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          {/* 레이아웃에 두면 기수를 아무리 늘려도 삭제 창구가 빠지는 화면이 없다. */}
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
