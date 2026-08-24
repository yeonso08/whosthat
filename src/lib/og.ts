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
const FONT_CSS = "https://fonts.googleapis.com/css2";

/** 한글 본문·제목용. OG 이미지가 쓴다. */
export function loadKoreanFont(
  text: string,
  weight: 700 | 900,
): Promise<ArrayBuffer> {
  return loadFont("Gothic A1", text, weight);
}

/** 라틴·숫자용. 영어 워드마크·핸들이 이 폰트다. 브랜드 마크는 이제 도형이라 폰트가 필요 없다. */
export function loadLatinFont(
  text: string,
  weight: 700 | 800,
): Promise<ArrayBuffer> {
  return loadFont("Manrope", text, weight);
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
