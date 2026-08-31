import { getPrograms } from "@/lib/data";
import { BRAND_WORDMARK } from "@/lib/brand";
import { fill, getDictionary } from "@/lib/i18n";
import { LOCALES, resolveLocale } from "@/lib/locales";
import { OG_ALT, OG_CONTENT_TYPE, ogImageResponse } from "@/lib/og";
import { OG_SIZE } from "@/lib/site";
import { getSiteTotals } from "@/lib/types";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** 없으면 이 라우트만 요청마다 서버에서 렌더된다 — 아래 기수 카드와 같은 이유다. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);

  return ogImageResponse({
    locale,
    scale: "sentence",
    // 홈은 프로그램 하나를 가리키지 않는다 — 작은 줄이 브랜드를 맡는다.
    eyebrow: BRAND_WORDMARK[locale],
    headline: dict.og.heading,
    stat: fill(dict.og.stat, getSiteTotals(getPrograms())),
  });
}
