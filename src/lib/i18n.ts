/**
 * 그 언어로 화면에 뭐라고 적는지. 언어 목록 자체는 `locales.ts` 에 있다.
 *
 * 언어를 하나 더하려면 세 곳이다: `locales.ts` 의 목록, 사전 JSON 한 벌,
 * 그리고 이 파일의 어휘 표(가명 로마자·특집 이름). 프로그램마다 다른 말(이름·기수
 * 라벨·목록 제목)은 사전의 `site.programs` 에 있다. 화면 문구는 사전에, **데이터
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
import ja from "@/dictionaries/ja.json";
import ko from "@/dictionaries/ko.json";
import { localePath } from "./links";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./locales";
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
export type ProgramStrings = Dictionary["site"]["programs"]["na-neun-solo"];

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

/**
 * 방송 가명의 언어별 표기. 21개가 408명에 반복되므로 여기만 채우면 전부 덮인다.
 *
 * 로마자는 국립국어원 표기법을 따르되 `희` 만 예외로 `hee` 다 — 규정대로면
 * `Jeonghui` 인데, 영어권에서 그렇게 검색하는 사람이 없다.
 *
 * 가타카나는 한국 예능·연예인을 다루는 일본 매체의 표기 관행을 따른다. **다만
 * `정수` 와 `종수` 는 관행대로면 둘 다 `ジョンス` 로 겹친다** — 1·2·3기는 그
 * 둘이 같은 기수에 함께 있어서, 그대로 두면 한 화면에 이름이 같은 사람이 둘
 * 생긴다. 사람을 갈라 주는 게 이 사이트의 존재 이유라, 실제로 둘 다 쓰이는
 * 표기 중에서 `정`→`チョン`·`종`→`ジョン` 으로 갈라 못박았다.
 *
 * 한국어는 데이터가 원문이라 표가 비어 있다 — 늘 아래 `?? alias` 로 떨어진다.
 */
const ALIASES: Record<Locale, Record<string, string>> = {
  ko: {},
  en: {
    경수: "Gyeongsu",
    광수: "Gwangsu",
    미경: "Migyeong",
    상철: "Sangcheol",
    순자: "Sunja",
    영수: "Yeongsu",
    영숙: "Yeongsuk",
    영순: "Yeongsun",
    영식: "Yeongsik",
    영자: "Yeongja",
    영철: "Yeongcheol",
    영호: "Yeongho",
    옥순: "Oksun",
    정수: "Jeongsu",
    정숙: "Jeongsuk",
    정순: "Jeongsun",
    정식: "Jeongsik",
    정자: "Jeongja",
    정희: "Jeonghee",
    종수: "Jongsu",
    현숙: "Hyeonsuk",
  },
  ja: {
    경수: "キョンス",
    광수: "クァンス",
    미경: "ミギョン",
    상철: "サンチョル",
    순자: "スンジャ",
    영수: "ヨンス",
    영숙: "ヨンスク",
    영순: "ヨンスン",
    영식: "ヨンシク",
    영자: "ヨンジャ",
    영철: "ヨンチョル",
    영호: "ヨンホ",
    옥순: "オクスン",
    정수: "チョンス",
    정숙: "チョンスク",
    정순: "チョンスン",
    정식: "チョンシク",
    정자: "チョンジャ",
    정희: "チョンヒ",
    종수: "ジョンス",
    현숙: "ヒョンスク",
  },
};

/** 특집 이름. 13종뿐이라 통째로 적는다 — "N차"를 따로 조립하면 서수 규칙까지 떠안는다. */
const SPECIALS: Record<Locale, Record<string, string>> = {
  ko: {},
  en: {
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
  },
  ja: {
    "1차 모태솔로 특집": "第1回 恋愛未経験特集",
    "2차 모태솔로 특집": "第2回 恋愛未経験特集",
    "3차 모태솔로 특집": "第3回 恋愛未経験特集",
    "돌싱 특집": "バツイチ特集",
    "2차 돌싱 특집": "第2回 バツイチ特集",
    "3차 돌싱 특집": "第3回 バツイチ特集",
    "4차 돌싱 특집": "第4回 バツイチ特集",
    "5차 돌싱 특집": "第5回 バツイチ特集",
    "40대 특집": "40代特集",
    "2차 40대 특집": "第2回 40代特集",
    "40대 골드 특집": "40代ゴールド特集",
    "질투 특집": "嫉妬特集",
    "연상연하 특집": "年の差特集",
  },
};

/** 표에 없는 값은 원문 그대로 나간다. */
export function localizeAlias(alias: string, locale: Locale): string {
  return ALIASES[locale][alias] ?? alias;
}

export function localizeSpecial(special: string, locale: Locale): string {
  return SPECIALS[locale][special] ?? special;
}

/**
 * 그 프로그램이 이 언어로 쓰는 말 한 벌.
 *
 * 사전에 없는 프로그램이면 던진다 — 데이터에는 있는데 화면에 부를 말이 없다는
 * 뜻이라, 조용히 id 를 그대로 그리면 `solo-hell` 이 제목으로 나가 버린다.
 * 전 페이지가 SSG 라 이 에러는 빌드에서 잡힌다.
 */
export function programStrings(
  programId: string,
  locale: Locale,
): ProgramStrings {
  const table: Record<string, ProgramStrings | undefined> =
    getDictionary(locale).site.programs;
  const strings = table[programId];
  if (!strings) throw new Error(`사전에 없는 프로그램: ${programId}`);
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
