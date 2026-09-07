/**
 * 그 언어로 화면에 뭐라고 적는지. 언어 목록 자체는 `locales.ts` 에 있다.
 *
 * **여기에 있는 것과 DB 에 있는 것이 갈린다**(2026-09-07 에 나눴다).
 *
 * - 사전(`src/dictionaries/*.json`) — 버튼·안내·상태 라벨·정책 본문처럼
 *   **프로그램이 늘어도 개수가 안 늘어나는** UI 문구. 화면 구조에 묶여 있어서
 *   보통 화면을 고칠 때 같이 고친다.
 * - DB(관리자에서 편집) — 프로그램 이름·기수 라벨·소개, 그리고 출연자 이름과
 *   특집 이름의 영어·일본어 표기. **프로그램이나 출연자가 늘면 같이 늘어나는**
 *   것들이라 콘텐츠에 가깝다. 코드를 고쳐 배포해야 화면에 나오면 안 된다.
 *
 * 가르는 기준은 "프로그램을 하나 더 추가할 때 이 문구도 새로 써야 하나" 다.
 *
 * 언어를 하나 더하려면 두 곳이다: `locales.ts` 의 목록과 사전 JSON 한 벌.
 * (DB 쪽은 관리자 화면에서 그 언어 탭을 채우면 된다.)
 *
 * 서버 전용이다. 클라이언트 컴포넌트는 이 파일을 import 하지 말 것(사전 두 벌이
 * 통째로 번들에 딸려 온다) — 필요한 문구만 props 로 받는다. `import type` 은
 * 컴파일에서 지워지므로 예외다.
 */

import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import en from "@/dictionaries/en.json";
import ja from "@/dictionaries/ja.json";
import ko from "@/dictionaries/ko.json";
import { localePath } from "./links";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./locales";
import { hasRegisteredStrings, lookupProgramStrings } from "./program-strings";
import { lookupAlias, lookupSpecial } from "./translations";
import type { ProgramStrings } from "./types";
import type { Coverage, Season, Totals } from "./types";

// 언어 목록은 `locales.ts` 가 갖고 있지만, 화면 쪽 파일이 두 군데서 가져오지
// 않게 여기서 그대로 내보낸다.
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  isLocale,
  type Locale,
} from "./locales";

/** 사전의 모양은 한국어가 정한다 — 다른 사전에 키가 빠지면 여기서 컴파일 에러가 난다. */
export type Dictionary = typeof ko;

/**
 * 프로그램 하나가 화면에서 쓰는 말.
 *
 * **프로그램마다 기수를 부르는 말이 다르다** — 나는 솔로는 `33기`, 솔로지옥은
 * `시즌 4` 다. 낱말만 표로 두고 문장에 끼워 넣으면 어순이 다른 언어에서 반드시
 * 어색해지므로, 그 낱말이 들어가는 문장을 통째로 프로그램마다 적는다.
 */
// ProgramStrings 는 이제 사전이 아니라 DB 에서 온다 — 타입도 데이터 쪽에 있다.
// 여기서 다시 내보내는 건 예전부터 이 파일에서 가져다 쓰던 곳들 때문이다.
export type { ProgramStrings };

const DICTIONARIES: Record<Locale, Dictionary> = { ko, en, ja };

/** OG 프로토콜의 locale 표기. `og:locale` 은 언어 코드만으로는 부족하다. */
const OG_LOCALES: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function ogLocale(locale: Locale): string {
  return OG_LOCALES[locale];
}

/** 지금 화면 말고 나머지 언어들. `og:locale:alternate` 가 언어마다 한 줄씩 받는다. */
export function ogAlternateLocales(locale: Locale): string[] {
  return LOCALES.filter((other) => other !== locale).map(ogLocale);
}

/**
 * 같은 화면의 다른 언어 판 목록(hreflang). `path` 는 언어 뒤의 나머지 경로다.
 *
 * x-default 는 "언어를 못 고르겠으면 여기" 라는 뜻이라 기본 언어를 가리킨다 —
 * 빠뜨리면 크롤러가 한국어와 영어 페이지를 중복으로 보고 한쪽을 버린다.
 */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      LOCALES.map((locale) => [locale, localePath(locale, path)]),
    ),
    "x-default": localePath(DEFAULT_LOCALE, path),
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



/** 표에 없는 값은 원문 그대로 나간다. */
export function localizeAlias(alias: string, locale: Locale): string {
  // 번역이 없으면 한국어 원문 그대로 — 화면이 깨지는 것보다 번역이 안 된 채
  // 뜨는 게 낫다. 관리자에서 채우면 그때 바뀐다.
  return lookupAlias(alias, locale) ?? alias;
}

export function localizeSpecial(special: string, locale: Locale): string {
  return lookupSpecial(special, locale) ?? special;
}

/**
 * 이 프로그램의 문구가 사전에 있나. `lib/data.ts` 가 이걸로 걸러서, 문구가
 * 없는 프로그램은 화면까지 오지 않는다.
 *
 * **세 언어 중 하나만 봐도 된다** — `Dictionary = typeof ko` 라서 사전 세 벌이
 * 같은 프로그램 키를 갖도록 타입이 강제한다(하나를 빼면 컴파일 에러). 그래서
 * "ko 에는 있는데 en 에는 없는" 상태가 존재할 수 없다.
 */
export function hasProgramStrings(programId: string): boolean {
  return hasRegisteredStrings(programId);
}

/**
 * 그 프로그램이 이 언어로 쓰는 말 한 벌.
 *
 * 사전에 없으면 던진다 — 조용히 id 를 그리면 `singles-inferno` 이 제목으로
 * 나가 버린다. **다만 이제 여기까지 오지 않는다**: `getPrograms()` 가 문구
 * 없는 프로그램을 먼저 걸러내기 때문이다. 그래도 남겨 두는 건 그 장치가
 * 깨졌을 때 조용히 지나가지 않게 하려는 것이다.
 */
export function programStrings(
  programId: string,
  locale: Locale,
): ProgramStrings {
  const strings = lookupProgramStrings(programId, locale);

  // 여기까지 오면 `getPrograms()` 의 거르는 장치가 깨진 것이다 — 문구 없는
  // 프로그램은 화면까지 오지 않아야 한다. 조용히 지나가지 않게 던진다.
  if (!strings) throw new Error(`문구를 찾을 수 없는 프로그램: ${programId}`);
  return strings;
}

export function localizeProgramName(programId: string, locale: Locale): string {
  return programStrings(programId, locale).name;
}

/** 33 → "33기" / "Season 33" / "シーズン33". 라벨은 저장하지 않고 번호에서 만든다. */
export function localizeSeasonLabel(
  programId: string,
  number: number,
  locale: Locale,
): string {
  return fill(programStrings(programId, locale).seasonLabel, { n: number });
}

/**
 * `YYYY-MM(-DD)` 를 그 언어의 날짜로. 한국어는 위 두 함수가 직접 조립하고
 * 여기까지 오지 않는다.
 *
 * **`timeZone: "UTC"` 가 이 함수의 존재 이유다** — 빼면 빌드 머신의 시간대에
 * 따라 달이 하나 밀린다. 두 번 적어 두면 한쪽만 고치게 되는 종류의 값이다.
 */
function formatUtcDate(
  parts: string[],
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  const [year, month, day] = parts;
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
    Date.UTC(Number(year), Number(month) - 1, day ? Number(day) : 1),
  );
}

/** "2024-08" → "2024년 8월" / "August 2024". 비어 있으면 빈 문자열. */
function formatAirDate(airDate: string, locale: Locale): string {
  const parts = airDate.split("-");
  const [year, month] = parts;
  if (!year || !month) return "";
  if (locale === "ko") return `${year}년 ${Number(month)}월`;

  return formatUtcDate(parts, locale, { year: "numeric", month: "long" });
}

/** "2026-08-18" → "26.08.18" / "Aug 18, 2026" */
export function formatChecked(date: string, locale: Locale): string {
  const parts = date.split("-");
  const [year, month, day] = parts;
  if (!year || !month || !day) return "";
  if (locale === "ko") return `${year.slice(2)}.${month}.${day}`;

  return formatUtcDate(parts, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

/**
 * 프로그램 화면의 부제 한 줄. "{seasons}개 기수 · {people}명 중 인스타 {found}개 확인".
 *
 * 명단이 한 줄도 없는 프로그램은 개수 대신 그 사실을 적는다 — "0명 중 0개 확인"은
 * 아무도 못 찾았다는 뜻으로 읽혀서 사실과 다르다(`formatCoverage` 와 같은 이유).
 * 화면과 공유 카드가 여기를 함께 봐서 서로 다른 말을 하지 않는다.
 */
export function formatProgramSummary(
  programId: string,
  totals: Totals,
  locale: Locale,
): string {
  const strings = programStrings(programId, locale);
  return fill(
    totals.people === 0 ? strings.summaryPending : strings.summary,
    totals,
  );
}

/** 기수 카드가 쓰는 문구 묶음. 라벨과 특집이 늘 같이 필요해서 함께 만든다. */
export function localizeSeason(season: Season, locale: Locale) {
  return {
    label: localizeSeasonLabel(season.programId, season.number, locale),
    special: season.special ? localizeSpecial(season.special, locale) : "",
    airDate: formatAirDate(season.airDate, locale),
  };
}
