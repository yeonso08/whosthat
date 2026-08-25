import { getProgram, getSeasons } from "@/lib/data";
import { fill, getDictionary, localizeProgramName } from "@/lib/i18n";
import { LOCALES, resolveLocale } from "@/lib/locales";
import { OG_ALT, OG_CONTENT_TYPE, ogImageResponse } from "@/lib/og";
import { OG_SIZE } from "@/lib/site";
import { getTotals } from "@/lib/types";

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
    eyebrow: localizeProgramName(getProgram().id, locale),
    headline: dict.og.heading,
    stat: fill(dict.og.stat, getTotals(getSeasons())),
  });
}
