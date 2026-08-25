/**
 * 공유 카드(OG 이미지)를 그리는 곳 — 폰트 로더와 카드 판이 함께 있다.
 *
 * 홈과 기수 상세가 같은 판에 글자만 바꿔 넣는다. 두 라우트에 각자 적어 두면
 * 한쪽만 손보게 되는데, 그 어긋남은 링크를 공유해 보기 전까지 안 보인다.
 *
 * ## 폰트
 *
 * satori(ImageResponse)는 시스템 폰트를 모르기 때문에 폰트 바이트를 직접 넘겨야
 * 한다. 폰트를 통째로 받으면(특히 한글은 수 MB) 무거워서 레포에 넣지 않고,
 * Google Fonts 의 `text=` 서브셋으로 그 이미지에 쓰는 글자만 받아 쓴다.
 *
 * 브라우저 UA 없이 요청하면 woff2 대신 truetype 을 주는데, satori 가 woff2 를
 * 못 읽어서 이 동작에 기대고 있다.
 */

import { ImageResponse } from "next/og";
import { BRAND_IMAGE_COLORS, BRAND_WORDMARK } from "./brand";
import type { Locale } from "./locales";
import { OG_SIZE } from "./site";

const FONT_CSS = "https://fonts.googleapis.com/css2";

/**
 * 언어별 OG 서체. 화면 서체와 같은 것을 고른다 — 공유 카드와 눌러서 도착한
 * 화면이 다른 글꼴이면 같은 사이트로 안 읽힌다.
 *
 * 글자 집합이 겹치지 않아서 한 벌로는 안 된다: Gothic A1 에는 가나·한자가,
 * Zen Kaku Gothic New 에는 한글이 없다. 영어는 라틴뿐이라 Manrope 로 족하다.
 */
const OG_FONTS: Record<Locale, string> = {
  ko: "Gothic A1",
  en: "Manrope",
  ja: "Zen Kaku Gothic New",
};

/** 카드 글자는 한 굵기뿐이다 — 큰 줄이 화면을 이끌고 나머지는 색으로 물러난다. */
const OG_FONT_WEIGHT = 700;

/** 그 이미지에 실제로 그리는 글자만 받는다. `text` 를 빠뜨리면 폰트를 통째로 받는다. */
async function loadOgFont(locale: Locale, text: string): Promise<ArrayBuffer> {
  const family = OG_FONTS[locale];
  const cssUrl = `${FONT_CSS}?family=${family.replaceAll(" ", "+")}:wght@${OG_FONT_WEIGHT}&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl).then((res) => res.text());

  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`${family} 서브셋 URL을 못 찾았다: ${cssUrl}`);

  return fetch(url).then((res) => res.arrayBuffer());
}

/**
 * 카드 두 종의 활자 크기.
 *
 * 큰 줄에 뭐가 들어오느냐가 다르다 — 홈은 문장(`나는 솔로 출연진 인스타`)이고
 * 기수는 덩어리 하나(`33기`)다. 같은 크기로 두면 홈 머리글이 판을 넘친다.
 */
const OG_SCALES = {
  sentence: { eyebrow: 34, headline: 110, stat: 34, headlineGap: 12, statGap: 28 },
  label: { eyebrow: 40, headline: 140, stat: 38, headlineGap: 8, statGap: 24 },
};

/** 좌우 여백. 1200px 판에서 글자가 가장자리에 붙지 않는 최소값이다. */
const OG_PADDING = "0 88px";

/**
 * 언어별 사이트 이름 대신 브랜드를 쓴다 — `alt` 는 정적 export 라 언어를 못
 * 받는다. 그래서 도메인과 같은 라틴 표기로 고정한다. 마크는 이제 도형이라 글로
 * 옮길 말이 없어 이름만 쓴다.
 */
export const OG_ALT = BRAND_WORDMARK.en;
export const OG_CONTENT_TYPE = "image/png";

type OgCard = {
  locale: Locale;
  scale: keyof typeof OG_SCALES;
  /** 큰 줄 위의 작은 줄. 지금은 두 카드 다 프로그램 이름이다. */
  eyebrow: string;
  headline: string;
  /** 큰 줄 아래 한 줄. 기수 수·인원 같은 현황이다. */
  stat: string;
};

/** 공유 카드 한 장. 폰트는 이 카드에 실제로 그리는 글자만 서브셋으로 받는다. */
export async function ogImageResponse({
  locale,
  scale,
  eyebrow,
  headline,
  stat,
}: OgCard): Promise<ImageResponse> {
  const type = OG_SCALES[scale];
  const fontFamily = OG_FONTS[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: BRAND_IMAGE_COLORS.background,
          color: BRAND_IMAGE_COLORS.foreground,
          padding: OG_PADDING,
          fontFamily,
        }}
      >
        <div style={{ fontSize: type.eyebrow, color: BRAND_IMAGE_COLORS.muted }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: type.headline,
            letterSpacing: "-0.04em",
            marginTop: type.headlineGap,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: type.stat,
            color: BRAND_IMAGE_COLORS.muted,
            marginTop: type.statGap,
          }}
        >
          {stat}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: fontFamily,
          data: await loadOgFont(locale, eyebrow + headline + stat),
          style: "normal",
          weight: OG_FONT_WEIGHT,
        },
      ],
    },
  );
}
