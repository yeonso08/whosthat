import type { Locale } from "./locales";

/**
 * 데이터에 한국어로 들어 있는 말(출연자 alias·기수 special)을 영어·일본어
 * 화면에서 뭐라고 부를지. `program-strings.ts` 와 같은 구조다 — 데이터를 읽는
 * 곳이 채우고, 화면 곳곳이 여기서 꺼내 쓴다.
 *
 * **`globalThis` 에 붙이는 이유**는 `program-strings.ts` 와 같다: Next 가 서버
 * 코드를 라우트별로 쪼개면 이 모듈이 복제돼, 채우는 Map 과 읽는 Map 이 서로
 * 다른 객체가 된다.
 */
export type TranslationTable = Record<string, { en: string; ja: string }>;

type Store = { aliases: TranslationTable; specials: TranslationTable };

const store: Store = ((
  globalThis as typeof globalThis & { __nukkoTranslations?: Store }
).__nukkoTranslations ??= { aliases: {}, specials: {} });

/** `getTranslations()` 가 부른다. */
export function registerTranslations(next: Partial<Store>): void {
  if (next.aliases) Object.assign(store.aliases, next.aliases);
  if (next.specials) Object.assign(store.specials, next.specials);
}

/**
 * 없으면 `undefined` — 부르는 쪽이 한국어 원문으로 떨어뜨린다.
 *
 * **한국어는 조회하지 않는다.** 데이터 자체가 한국어 원문이라 번역할 게 없다.
 */
function lookup(
  table: TranslationTable,
  ko: string,
  locale: Locale,
): string | undefined {
  if (locale === "ko") return undefined;
  return table[ko]?.[locale];
}

export function lookupAlias(ko: string, locale: Locale): string | undefined {
  return lookup(store.aliases, ko, locale);
}

export function lookupSpecial(ko: string, locale: Locale): string | undefined {
  return lookup(store.specials, ko, locale);
}
