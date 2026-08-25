/**
 * ImageResponse 용 폰트 로더.
 *
 * satori(ImageResponse)는 시스템 폰트를 모르기 때문에 폰트 바이트를 직접 넘겨야
 * 한다. 폰트를 통째로 받으면(특히 한글은 수 MB) 무거워서 레포에 넣지 않고,
 * Google Fonts 의 `text=` 서브셋으로 그 이미지에 쓰는 글자만 받아 쓴다.
 *
 * 브라우저 UA 없이 요청하면 woff2 대신 truetype 을 주는데, satori 가 woff2 를
 * 못 읽어서 이 동작에 기대고 있다.
 */

import type { Locale } from "./locales";

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

export function ogFontFamily(locale: Locale): string {
  return OG_FONTS[locale];
}

/** 그 이미지에 실제로 그리는 글자만 받는다. `text` 를 빠뜨리면 폰트를 통째로 받는다. */
export function loadOgFont(
  locale: Locale,
  text: string,
  weight: 700 | 800 | 900,
): Promise<ArrayBuffer> {
  return loadFont(OG_FONTS[locale], text, weight);
}

async function loadFont(
  family: string,
  text: string,
  weight: number,
): Promise<ArrayBuffer> {
  const cssUrl = `${FONT_CSS}?family=${family.replaceAll(" ", "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl).then((res) => res.text());

  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`${family} 서브셋 URL을 못 찾았다: ${cssUrl}`);

  return fetch(url).then((res) => res.arrayBuffer());
}
