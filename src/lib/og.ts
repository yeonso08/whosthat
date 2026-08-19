/**
 * OG 이미지용 한글 폰트.
 *
 * satori(ImageResponse)는 시스템 폰트를 모르기 때문에 폰트 바이트를 직접 넘겨야
 * 한다. 한글 ttf 는 통째로 받으면 수 MB 라 레포에 넣지 않고, Google Fonts 의
 * `text=` 서브셋으로 그 이미지에 쓰는 글자만 받아 쓴다.
 *
 * 브라우저 UA 없이 요청하면 woff2 대신 truetype 을 주는데, satori 가 woff2 를
 * 못 읽어서 이 동작에 기대고 있다.
 */
const FONT_CSS = "https://fonts.googleapis.com/css2";

export async function loadKoreanFont(
  text: string,
  weight: 700 | 900,
): Promise<ArrayBuffer> {
  const cssUrl = `${FONT_CSS}?family=Gothic+A1:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl).then((res) => res.text());

  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error(`Gothic A1 서브셋 URL을 못 찾았다: ${cssUrl}`);

  return fetch(url).then((res) => res.arrayBuffer());
}
