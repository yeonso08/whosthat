import { getProgram, getSeason, getSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  localizeProgramName,
  localizeSeasonLabel,
} from "@/lib/i18n";
import { resolveLocale } from "@/lib/locales";
import { OG_ALT, OG_CONTENT_TYPE, ogImageResponse } from "@/lib/og";
import { OG_SIZE } from "@/lib/site";
import { getCoverage } from "@/lib/types";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * 없으면 이 라우트만 요청마다 서버에서 렌더된다 — 공유될 때마다 Google Fonts
 * 를 다시 때리고, 나머지가 전부 정적인 사이트에 서버가 하나 붙는다.
 * 언어는 루트 레이아웃이 만들고 여기서 기수를 곱한다.
 */
export function generateStaticParams() {
  return getSeasons().map((season) => ({ id: season.id }));
}

export default async function Image({
  params,
}: PageProps<"/[lang]/seasons/[id]">) {
  const { lang, id } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);

  const season = getSeason(id);
  const coverage = getCoverage(season?.cast ?? []);

  return ogImageResponse({
    locale,
    scale: "label",
    eyebrow: localizeProgramName(getProgram().id, locale),
    headline: season ? localizeSeasonLabel(season.label, locale) : "",
    stat: fill(dict.og.seasonStat, {
      total: coverage.total,
      found: coverage.found,
    }),
  });
}
