import type { Metadata } from "next";
import { Gothic_A1, Manrope, Zen_Kaku_Gothic_New } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import {
  getDictionary,
  isLocale,
  languageAlternates,
  LOCALES,
  type Locale,
} from "@/lib/i18n";
import { homeHref } from "@/lib/links";
import { openGraphBase } from "@/lib/seo";
import { ADSENSE_CLIENT_ID, NAVER_SITE_VERIFICATION, SITE_URL } from "@/lib/site";
import "../globals.css";

const gothic = Gothic_A1({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
});

/**
 * 일본어 화면의 본문 서체. **Gothic A1 은 한글·라틴 전용이라 가나·한자
 * 글리프가 아예 없다** — 그대로 두면 일본어 화면이 통째로 시스템 폰트로
 * 떨어진다.
 *
 * 기하학적 산세리프라 Gothic A1·Manrope 와 형태 언어가 같다. 다른 언어
 * 화면에서는 이 클래스를 안 걸어서 받지도 않는다(아래 `SANS_FONT`).
 */
const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-lat",
  subsets: ["latin"],
  // 800 은 워드마크(`nukko`) 전용이다. 본문에는 쓰지 않는다.
  weight: ["500", "600", "700", "800"],
});

/** 둘 다 `--font-sans` 를 채우므로 화면에는 한 번에 하나만 걸린다. */
const SANS_FONT: Record<Locale, { variable: string }> = {
  ko: gothic,
  en: gothic,
  ja: zenKaku,
};

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
    // 구글은 DNS TXT 로 확인해서 여기 없다. 네이버만 태그를 요구한다.
    verification: {
      other: { "naver-site-verification": NAVER_SITE_VERIFICATION },
    },
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
      className={`${SANS_FONT[lang].variable} ${manrope.variable} h-full antialiased`}
    >
            {/* 데스크톱까지 여는 폭. 예전엔 `max-w-screen-sm`(640px) 고정이라 큰 화면에서
          가운데 좁은 기둥 하나로 보였다 — 휴대폰 화면을 늘려 놓은 꼴이다.
          좁은 화면에서는 이 값이 안 걸리므로 모바일은 그대로다. */}
      <body className="mx-auto flex min-h-full w-full max-w-[1280px] flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* 본문이 남은 높이를 먹어 푸터를 화면 바닥까지 민다 — 홈처럼 짧은
              화면에서 푸터가 콘텐츠에 바로 붙으면 그 아래 빈 화면이 "덜 그려진
              페이지" 로 읽힌다. */}
          <div className="flex-1">{children}</div>
          {/* 레이아웃에 두면 기수를 아무리 늘려도 삭제 창구가 빠지는 화면이 없다. */}
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
        {/* 자동 광고. 게시자 ID 가 비어 있으면 안 건다 — 틀린 ID 로 요청이
            나가면 애드센스가 정책 위반으로 잡는다.
            next/script 가 아니라 맨 태그다 — <Script> 가 붙이는 data-nscript 를
            adsbygoogle.js 가 모르는 속성이라며 콘솔에 경고로 남긴다. async src
            짜리는 React 가 알아서 <head> 로 올리고 중복도 지운다. */}
        {ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
