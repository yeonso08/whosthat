/**
 * 앱 안팎의 URL 을 만드는 곳.
 * 라우트 문자열이 컴포넌트마다 흩어지면 경로가 바뀔 때 한쪽만 고치게 된다.
 *
 * 내부 경로는 **전부 언어로 시작한다**(`/ko/seasons/s33`). 언어를 빼먹은 링크는
 * 눌러 보기 전까지 안 보이므로, 경로를 손으로 조립하지 말고 여기 함수를 쓴다.
 *
 * **값 import 가 없다.** 언어 전환 버튼이 클라이언트 컴포넌트라 이 파일도
 * 클라이언트로 딸려 들어간다 — 여기서 뭔가를 값으로 가져오면 그것까지 번들에
 * 실린다. 사전(`i18n.ts`)도 도메인(`site.ts`)도 타입만 스치거나 아예 안 본다.
 */

import type { Locale } from "./locales";

/**
 * 언어 앞자리를 뗀 경로. hreflang·sitemap 이 언어를 곱하기 전의 형태로 받는다.
 *
 * canonical·hreflang·sitemap 이 같은 문자열을 봐야 한다 — 한쪽만 리터럴로 적어
 * 두면 경로를 바꿀 때 나머지가 조용히 옛 주소를 가리킨다.
 */
export const HOME_PATH = "";
export const TAKEDOWN_PATH = "/takedown";
export const PRIVACY_PATH = "/privacy";

/** 한 프로그램의 기수 목록. `app/[lang]/[program]` 과 짝이다. */
export function programPath(programId: string): string {
  return `/${programId}`;
}

/**
 * 기수 상세. **프로그램이 앞에 붙는다** — 기수 id 는 프로그램 안에서만 고유해서
 * (`s1` 이 두 프로그램에 다 있다) 프로그램 없이는 어느 기수인지 정해지지 않는다.
 */
export function seasonPath(programId: string, seasonId: string): string {
  return `${programPath(programId)}/seasons/${seasonId}`;
}

/** 언어 없는 경로에 언어를 앞에 붙인다. 내부 링크는 전부 여기를 거친다. */
export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

/** 그 언어의 프로그램 목록. `app/[lang]` 과 짝이다. */
export function homeHref(locale: Locale): string {
  return localePath(locale, HOME_PATH);
}

/** 그 프로그램의 기수 목록. */
export function programHref(locale: Locale, programId: string): string {
  return localePath(locale, programPath(programId));
}

/** 기수 상세 경로. `app/[lang]/[program]/seasons/[id]` 와 짝이다. */
export function seasonHref(
  locale: Locale,
  programId: string,
  seasonId: string,
): string {
  return localePath(locale, seasonPath(programId, seasonId));
}

/**
 * 기수 상세 안의 한 사람. 검색 결과에서 곧장 그 줄로 내려간다.
 *
 * 앵커는 `CastCard` 가 카드에 거는 DOM id 와 짝이다 — 한쪽만 고치면 링크가
 * 조용히 기수 맨 위로 떨어진다.
 */
export function castMemberHref(
  locale: Locale,
  programId: string,
  seasonId: string,
  memberId: string,
): string {
  return `${seasonHref(locale, programId, seasonId)}#${memberId}`;
}

/** 삭제·정정 요청. `app/[lang]/takedown` 과 짝이다. */
export function takedownHref(locale: Locale): string {
  return localePath(locale, TAKEDOWN_PATH);
}

/** 개인정보 처리방침. `app/[lang]/privacy` 와 짝이다. */
export function privacyHref(locale: Locale): string {
  return localePath(locale, PRIVACY_PATH);
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
