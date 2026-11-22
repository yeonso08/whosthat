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
export const ABOUT_PATH = "/about";
export const FAQ_PATH = "/faq";
export const COUPLES_PATH = "/couples";
export const EPISODES_PATH = "/episodes";
export const SOLONARA_PATH = "/solonara";
export const VOTE_PATH = "/vote";
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

/**
 * 회차 글 한 편. `app/[lang]/[program]/seasons/[id]/episodes/[date]` 와 짝이다.
 *
 * **주소의 끝은 방송일이다**(`2026-11-11`). DB 의 회차 번호(id)는 백업에서 되살리거나
 * 다시 넣으면 바뀔 수 있고, 방송 회차 수(`279회`)는 데이터에 없다. 방송일은 한 기수
 * 안에서 겹치지 않고(넣는 스크립트가 날짜로 중복을 거른다) 읽어서 뜻이 통한다.
 */
export function episodePath(
  programId: string,
  seasonId: string,
  airDate: string,
): string {
  return `${seasonPath(programId, seasonId)}/episodes/${airDate}`;
}

export function episodeHref(
  locale: Locale,
  programId: string,
  seasonId: string,
  airDate: string,
): string {
  return localePath(locale, episodePath(programId, seasonId, airDate));
}

/** 최종 커플 모음. `app/[lang]/couples` 와 짝이다. */
export function couplesHref(locale: Locale): string {
  return localePath(locale, COUPLES_PATH);
}

/** 회차별 정리 모음 — 한국어 화면만 있다. `app/[lang]/episodes` 와 짝이다. */
export function episodesHref(locale: Locale): string {
  return localePath(locale, EPISODES_PATH);
}

/** 솔로나라 기록(기수별 숙소와 게임) — 한국어 화면만 있다. `app/[lang]/solonara` 와 짝이다. */
export function solonaraHref(locale: Locale): string {
  return localePath(locale, SOLONARA_PATH);
}

/** 시청자 투표 — 한국어 화면만 있다. `app/[lang]/vote` 와 짝이다. */
export function voteHref(locale: Locale): string {
  return localePath(locale, VOTE_PATH);
}

/** 사이트 소개. `app/[lang]/about` 과 짝이다. */
export function aboutHref(locale: Locale): string {
  return localePath(locale, ABOUT_PATH);
}

/** 자주 묻는 질문. `app/[lang]/faq` 와 짝이다. */
export function faqHref(locale: Locale): string {
  return localePath(locale, FAQ_PATH);
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
