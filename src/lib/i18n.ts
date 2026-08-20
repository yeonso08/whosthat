/**
 * 그 언어로 화면에 뭐라고 적는지. 언어 목록 자체는 `locales.ts` 에 있다.
 *
 * 언어를 하나 더하려면 세 곳이다: `locales.ts` 의 목록, 사전 JSON 한 벌,
 * 그리고 이 파일의 어휘 표(가명 로마자·특집 이름). 화면 문구는 사전에, **데이터
 * 어휘**는 이 파일에 두는데, 고치는 사람이 다르기 때문이다 — 문구는 화면을 보며
 * 고치고, 어휘는 데이터를 채우며 는다.
 *
 * 서버 전용이다. 클라이언트 컴포넌트는 이 파일을 import 하지 말 것(사전 두 벌이
 * 통째로 번들에 딸려 온다) — 필요한 문구만 props 로 받는다. `import type` 은
 * 컴파일에서 지워지므로 예외다.
 */

import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import en from "@/dictionaries/en.json";
import ko from "@/dictionaries/ko.json";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./locales";
import type { Coverage, Season } from "./types";

// 언어 목록은 `locales.ts` 가 갖고 있지만, 화면 쪽 파일이 두 군데서 가져오지
// 않게 여기서 그대로 내보낸다.
export {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  otherLocale,
  type Locale,
} from "./locales";

/** 사전의 모양은 한국어가 정한다 — en.json 에 키가 빠지면 여기서 컴파일 에러가 난다. */
export type Dictionary = typeof ko;

const DICTIONARIES: Record<Locale, Dictionary> = { ko, en };

/** OG 프로토콜의 locale 표기. `og:locale` 은 언어 코드만으로는 부족하다. */
const OG_LOCALES: Record<Locale, string> = { ko: "ko_KR", en: "en_US" };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function ogLocale(locale: Locale): string {
  return OG_LOCALES[locale];
}

/**
 * 같은 화면의 다른 언어 판 목록(hreflang). `path` 는 언어 뒤의 나머지 경로다.
 *
 * x-default 는 "언어를 못 고르겠으면 여기" 라는 뜻이라 기본 언어를 가리킨다 —
 * 빠뜨리면 크롤러가 한국어와 영어 페이지를 중복으로 보고 한쪽을 버린다.
 */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, `/${locale}${path}`])),
    "x-default": `/${DEFAULT_LOCALE}${path}`,
  };
}

/**
 * 지금 요청의 언어. `app/[lang]` 이 루트라 서버 컴포넌트라면 어디서든 부를 수 있다 —
 * 페이지가 컴포넌트마다 lang 을 내려보내지 않아도 된다.
 *
 * 클라이언트 컴포넌트에서는 못 쓴다(Next 의 제약). 그쪽은 props 로 받는다.
 */
export async function currentLocale(): Promise<Locale> {
  const value = await lang();
  // 주소창에 /de 를 쳐 넣은 경우다. 기본 언어로 눙치면 없는 번역이 있는 척 된다.
  if (!value || !isLocale(value)) notFound();
  return value;
}

export async function currentDictionary(): Promise<Dictionary> {
  return getDictionary(await currentLocale());
}

/** "{found} / {total} 확인" + { found: 4, total: 14 } → "4 / 14 확인". */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

/**
 * 방송 가명의 로마자 표기. 14개가 318명에 반복되므로 여기만 채우면 전부 덮인다.
 *
 * 국립국어원 로마자 표기법을 따르되 `희` 만 예외로 `hee` 다 — 규정대로면
 * `Jeonghui` 인데, 영어권에서 그렇게 검색하는 사람이 없다.
 */
const ROMANIZED_ALIASES: Record<string, string> = {
  경수: "Gyeongsu",
  광수: "Gwangsu",
  상철: "Sangcheol",
  순자: "Sunja",
  영수: "Yeongsu",
  영숙: "Yeongsuk",
  영식: "Yeongsik",
  영자: "Yeongja",
  영철: "Yeongcheol",
  영호: "Yeongho",
  옥순: "Oksun",
  정숙: "Jeongsuk",
  정희: "Jeonghee",
  현숙: "Hyeonsuk",
};

/** 특집 이름. 13종뿐이라 통째로 적는다 — "N차"를 따로 조립하면 서수 규칙까지 떠안는다. */
const TRANSLATED_SPECIALS: Record<string, string> = {
  "1차 모태솔로 특집": "1st Never-Dated Special",
  "2차 모태솔로 특집": "2nd Never-Dated Special",
  "3차 모태솔로 특집": "3rd Never-Dated Special",
  "돌싱 특집": "Divorcee Special",
  "2차 돌싱 특집": "2nd Divorcee Special",
  "3차 돌싱 특집": "3rd Divorcee Special",
  "4차 돌싱 특집": "4th Divorcee Special",
  "5차 돌싱 특집": "5th Divorcee Special",
  "40대 특집": "40s Special",
  "2차 40대 특집": "2nd 40s Special",
  "40대 골드 특집": "40s Gold Special",
  "질투 특집": "Jealousy Special",
  "연상연하 특집": "Age-Gap Special",
};

/** 한국어 화면은 데이터를 그대로 쓴다. 표에 없는 값도 원문 그대로 나간다. */
export function localizeAlias(alias: string, locale: Locale): string {
  if (locale === "ko") return alias;
  return ROMANIZED_ALIASES[alias] ?? alias;
}

export function localizeSpecial(special: string, locale: Locale): string {
  if (locale === "ko") return special;
  return TRANSLATED_SPECIALS[special] ?? special;
}

export function localizeProgramName(programId: string, locale: Locale): string {
  const names: Record<string, string> = getDictionary(locale).site.programs;
  return names[programId] ?? programId;
}

/** "33기" → 33. 정렬과 "Season 33" 이 같은 값을 본다. */
export function seasonNumber(label: string): number {
  return Number.parseInt(label, 10) || 0;
}

/** "33기" → "Season 33". 라벨을 언어별로 저장하지 않고 번호에서 만든다. */
export function localizeSeasonLabel(label: string, locale: Locale): string {
  if (locale === "ko") return label;
  return fill(getDictionary(locale).season.label, {
    n: seasonNumber(label),
  });
}

/** "2024-08" → "2024년 8월" / "August 2024". 비어 있으면 빈 문자열. */
export function formatAirDate(airDate: string, locale: Locale): string {
  const [year, month] = airDate.split("-");
  if (!year || !month) return "";
  if (locale === "ko") return `${year}년 ${Number(month)}월`;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    // 빌드 머신의 시간대에 따라 달이 하나 밀리지 않게 못 박는다.
    timeZone: "UTC",
  }).format(Date.UTC(Number(year), Number(month) - 1, 1));
}

/** "2026-08-18" → "26.08.18" / "Aug 18, 2026" */
export function formatChecked(date: string, locale: Locale): string {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return "";
  if (locale === "ko") return `${year.slice(2)}.${month}.${day}`;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

/**
 * "4 / 14 확인". 명단을 아직 못 채운 기수는 개수 대신 그 사실을 적는다 —
 * "0 / 0 확인"은 아무도 못 찾았다는 뜻으로 읽혀서 사실과 다르다.
 */
export function formatCoverage(coverage: Coverage, locale: Locale): string {
  const dict = getDictionary(locale).season;
  if (coverage.total === 0) return dict.coveragePending;
  return fill(dict.coverage, {
    found: coverage.found,
    total: coverage.total,
  });
}

/** 기수 카드가 쓰는 문구 묶음. 라벨과 특집이 늘 같이 필요해서 함께 만든다. */
export function localizeSeason(season: Season, locale: Locale) {
  return {
    label: localizeSeasonLabel(season.label, locale),
    special: season.special ? localizeSpecial(season.special, locale) : "",
    airDate: formatAirDate(season.airDate, locale),
  };
}
