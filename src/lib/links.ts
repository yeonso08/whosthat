/**
 * 앱 안팎의 URL 을 만드는 곳.
 * 라우트 문자열이 컴포넌트마다 흩어지면 경로가 바뀔 때 한쪽만 고치게 된다.
 *
 * 내부 경로는 **전부 언어로 시작한다**(`/ko/seasons/s33`). 언어를 빼먹은 링크는
 * 눌러 보기 전까지 안 보이므로, 경로를 손으로 조립하지 말고 여기 함수를 쓴다.
 *
 * 값 import 는 `site.ts` 하나뿐이다 — 언어 전환 버튼이 클라이언트 컴포넌트라
 * 이 파일도 클라이언트로 딸려 들어간다. 사전(`i18n.ts`)은 타입만 가져온다.
 */

import type { Locale } from "./locales";
import { CONTACT_EMAIL } from "./site";

/** 그 언어의 기수 목록. `app/[lang]` 과 짝이다. */
export function homeHref(locale: Locale): string {
  return `/${locale}`;
}

/** 기수 상세 경로. `app/[lang]/seasons/[id]` 와 짝이다. */
export function seasonHref(locale: Locale, seasonId: string): string {
  return `/${locale}/seasons/${seasonId}`;
}

/**
 * 기수 상세 안의 한 사람. 검색 결과에서 곧장 그 줄로 내려간다.
 *
 * 앵커는 `CastCard` 가 카드에 거는 DOM id 와 짝이다 — 한쪽만 고치면 링크가
 * 조용히 기수 맨 위로 떨어진다.
 */
export function castMemberHref(
  locale: Locale,
  seasonId: string,
  memberId: string,
): string {
  return `${seasonHref(locale, seasonId)}#${memberId}`;
}

/** 삭제·정정 요청. `app/[lang]/takedown` 과 짝이다. */
export function takedownHref(locale: Locale): string {
  return `/${locale}/takedown`;
}

/** 개인정보 처리방침. `app/[lang]/privacy` 와 짝이다. */
export function privacyHref(locale: Locale): string {
  return `/${locale}/privacy`;
}

/**
 * 보고 있던 화면의 다른 언어 판. 언어 전환 버튼이 쓴다.
 *
 * 첫 조각만 갈아 끼우므로 기수 상세에서 누르면 그 기수의 다른 언어로 간다 —
 * 홈으로 튕기지 않는 게 중요하다. 앵커·쿼리는 `usePathname` 이 이미 뺀 뒤다.
 */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const rest = pathname.split("/").slice(2).join("/");
  return rest ? `/${locale}/${rest}` : `/${locale}`;
}

/** 인스타그램 프로필 주소. handle 은 `@` 없이 넣는다. */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}

/**
 * 삭제·정정 요청 메일. 제목을 미리 채워 둔다 — 어느 기수 이야기인지 빠진
 * 메일이 오면 되묻느라 그만큼 늦어진다. 제목도 화면 언어를 따라간다.
 */
export function contactMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
