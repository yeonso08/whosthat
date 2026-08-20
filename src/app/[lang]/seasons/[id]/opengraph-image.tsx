import { ImageResponse } from "next/og";
import { BRAND_MARK, BRAND_WORDMARK } from "@/lib/brand";
import { getProgram, getSeason, getSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  localizeProgramName,
  localizeSeasonLabel,
} from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { loadKoreanFont, loadLatinFont } from "@/lib/og";
import { OG_SIZE } from "@/lib/site";
import { getCoverage } from "@/lib/types";

/** 언어별 사이트 이름 대신 브랜드를 쓴다 — alt 는 정적이라 언어를 못 받는다. */
export const alt = `${BRAND_MARK}${BRAND_WORDMARK}`;
export const size = OG_SIZE;
export const contentType = "image/png";

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
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const season = getSeason(id);
  const coverage = getCoverage(season?.cast ?? []);

  const program = localizeProgramName(getProgram().id, locale);
  const label = season ? localizeSeasonLabel(season.label, locale) : "";
  const stat = fill(dict.og.seasonStat, {
    total: coverage.total,
    found: coverage.found,
  });

  const korean = locale === "ko";
  const fontFamily = korean ? "Gothic A1" : "Manrope";
  const text = program + label + stat;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0c",
          color: "#f4f4f6",
          padding: "0 88px",
          fontFamily,
        }}
      >
        <div style={{ fontSize: 40, color: "#90909b" }}>{program}</div>
        <div style={{ fontSize: 140, letterSpacing: "-0.04em", marginTop: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 38, color: "#90909b", marginTop: 24 }}>
          {stat}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: fontFamily,
          data: korean
            ? await loadKoreanFont(text, 700)
            : await loadLatinFont(text, 700),
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
