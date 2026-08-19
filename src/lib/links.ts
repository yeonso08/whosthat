/**
 * 앱 안팎의 URL 을 만드는 곳.
 * 라우트 문자열이 컴포넌트마다 흩어지면 경로가 바뀔 때 한쪽만 고치게 된다.
 */

/** 기수 상세 경로. `app/seasons/[id]` 와 짝이다. */
export function seasonHref(seasonId: string): string {
  return `/seasons/${seasonId}`;
}

/** 인스타그램 프로필 주소. handle 은 `@` 없이 넣는다. */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}
