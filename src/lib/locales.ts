/**
 * 이 사이트가 아는 언어. **어떤 언어가 있는지**만 알고 그 언어로 화면에 뭐라고
 * 적는지는 모른다 — 사전과 어휘는 `i18n.ts` 다.
 *
 * 갈라 둔 이유는 이 목록을 읽는 쪽이 셋이기 때문이다: 화면(서버), 언어 전환
 * 버튼(클라이언트), 그리고 언어를 감지하는 `proxy.ts`(엣지). 사전을 안고 있는
 * `i18n.ts` 를 그 셋이 다 import 하면 사전 세 벌이 엉뚱한 번들까지 따라간다.
 */

/** 첫 값이 기본 언어다. 순서는 언어 선택 목록에 그대로 쓰인다. */
export const LOCALES = ["ko", "en", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

/** 원문의 언어. canonical 과 hreflang 의 x-default 가 여기를 가리킨다. */
export const DEFAULT_LOCALE: Locale = LOCALES[0];

/**
 * 언어 선택 목록에 보이는 이름. **그 언어를 쓰는 사람이 읽을 글자라 그 언어로
 * 적는다** — 한국어를 못 읽는 사람이 "일본어" 라고 적힌 줄을 찾을 수는 없다.
 *
 * 그래서 화면 언어를 안 타고, 사전이 아니라 여기 있다. 언어 전환 버튼이
 * 클라이언트 컴포넌트라 사전을 못 읽는 것도 같은 이유로 맞아떨어진다.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
