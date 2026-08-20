/**
 * 이 사이트가 아는 언어. **어떤 언어가 있는지**만 알고 그 언어로 뭐라고 적는지는
 * 모른다 — 사전과 어휘는 `i18n.ts` 다.
 *
 * 갈라 둔 이유는 이 목록을 읽는 쪽이 셋이기 때문이다: 화면(서버), 언어 전환
 * 버튼(클라이언트), 그리고 언어를 감지하는 `proxy.ts`(엣지). 사전을 안고 있는
 * `i18n.ts` 를 그 셋이 다 import 하면 사전 두 벌이 엉뚱한 번들까지 따라간다.
 */

/** 첫 값이 기본 언어다. 순서는 언어 전환 버튼이 다음 언어를 고를 때도 쓴다. */
export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** 원문의 언어. canonical 과 hreflang 의 x-default 가 여기를 가리킨다. */
export const DEFAULT_LOCALE: Locale = LOCALES[0];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** 지금 화면의 다음 언어. 둘뿐이라 토글이고, 셋이 되면 여기가 목록이 된다. */
export function otherLocale(locale: Locale): Locale {
  return LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];
}
