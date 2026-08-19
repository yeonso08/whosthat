/**
 * 앱 안팎의 URL 을 만드는 곳.
 * 라우트 문자열이 컴포넌트마다 흩어지면 경로가 바뀔 때 한쪽만 고치게 된다.
 */

import { CONTACT_EMAIL } from "./site";

/** 기수 상세 경로. `app/seasons/[id]` 와 짝이다. */
export function seasonHref(seasonId: string): string {
  return `/seasons/${seasonId}`;
}

/** 삭제·정정 요청. `app/takedown` 과 짝이다. */
export const TAKEDOWN_HREF = "/takedown";

/** 개인정보 처리방침. `app/privacy` 와 짝이다. */
export const PRIVACY_HREF = "/privacy";

/** 인스타그램 프로필 주소. handle 은 `@` 없이 넣는다. */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}

/**
 * 삭제·정정 요청 메일. 제목을 미리 채워 둔다 — 어느 기수 이야기인지 빠진
 * 메일이 오면 되묻느라 그만큼 늦어진다.
 */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "[삭제·정정 요청] 기수와 가명을 적어 주세요",
)}`;
