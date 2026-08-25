import { ImageResponse } from "next/og";
import { BRAND_WORDMARK } from "@/lib/brand";
import { getProgram, getSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  localizeProgramName,
} from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/locales";
import { loadOgFont, ogFontFamily } from "@/lib/og";
import { OG_SIZE } from "@/lib/site";
import { getCoverage } from "@/lib/types";

/**
 * 언어별 사이트 이름 대신 브랜드를 쓴다 — alt 는 정적이라 언어를 못 받는다.
 * 그래서 도메인과 같은 라틴 표기로 고정한다. 마크는 이제 도형이라 글로 옮길
 * 말이 없어 이름만 쓴다.
 */
export const alt = BRAND_WORDMARK.en;
export const size = OG_SIZE;
export const contentType = "image/png";

/** 없으면 이 라우트만 요청마다 서버에서 렌더된다 — 아래 기수 카드와 같은 이유다. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const seasons = getSeasons();
  const totals = seasons.reduce(
    (acc, season) => {
      const c = getCoverage(season.cast);
      return { people: acc.people + c.total, found: acc.found + c.found };
    },
    { people: 0, found: 0 },
  );

  const program = localizeProgramName(getProgram().id, locale);
  const heading = dict.og.heading;
  const stat = fill(dict.og.stat, {
    seasons: seasons.length,
    people: totals.people,
    found: totals.found,
  });

  const fontFamily = ogFontFamily(locale);
  const text = program + heading + stat;

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
        <div style={{ fontSize: 34, color: "#90909b" }}>{program}</div>
        <div style={{ fontSize: 110, letterSpacing: "-0.04em", marginTop: 12 }}>
          {heading}
        </div>
        <div style={{ fontSize: 34, color: "#90909b", marginTop: 28 }}>
          {stat}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: fontFamily,
          data: await loadOgFont(locale, text, 700),
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
