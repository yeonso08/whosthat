/**
 * `/llms.txt`·`/llms-full.txt` — AI 에게 주는 사이트 안내문(llmstxt.org 형식).
 *
 * 둘 다 sitemap 처럼 데이터에서 만든다 — 프로그램·기수가 늘면 저절로 따라온다.
 * 판단(색인 여부)은 sitemap 과 같은 `isProgramIndexable`·`isIndexable` 을 본다:
 * 색인하지 말라고 적어 둔 빈 화면을 AI 에게만 내밀 이유가 없다.
 *
 * 한국어 원문만 쓴다. 이 파일은 사이트에 하나라 언어를 고를 자리가 없고, 다른
 * 언어 화면은 주소(`/en`·`/ja`)로만 알린다.
 *
 * **인스타 핸들은 싣지 않는다.** 일반인 수백 명의 계정을 한 파일로 묶어 내보내는
 * 것은 화면에 한 기수씩 싣는 것과 성격이 다르다 — 통째로 긁어 가기 쉬운 목록이
 * 된다. AI 가 계정을 인용하려면 기수 화면을 읽으면 된다.
 */

import { BRAND_WORDMARK } from "./brand";
import { getPrograms, getSeasons } from "./data";
import {
  formatCoverage,
  formatProgramSummary,
  getDictionary,
  localizeProgramName,
  localizeSeason,
  programStrings,
  seasonDescription,
} from "./i18n";
import {
  aboutHref,
  couplesHref,
  episodesHref,
  faqHref,
  homeHref,
  privacyHref,
  programHref,
  seasonHref,
  solonaraHref,
  takedownHref,
} from "./links";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES } from "./locales";
import { isIndexable, isProgramIndexable } from "./seo";
import { absoluteUrl } from "./site";
import { getCoverage, getTotals, type Program } from "./types";

const LOCALE = DEFAULT_LOCALE;

/** 사이트 안 주소를 마크다운 링크로. */
function link(name: string, href: string): string {
  return `[${name}](${absoluteUrl(href)})`;
}

/** 사전 문구의 `{brand}` 를 이름으로. 화면은 `BrandSentence` 가 하는 일이다. */
function withBrand(text: string): string {
  return text.replaceAll("{brand}", BRAND_WORDMARK[LOCALE]);
}

async function indexablePrograms(): Promise<Program[]> {
  return (await getPrograms()).filter(isProgramIndexable);
}

/** 두 파일이 같이 쓰는 머리 — 이름, 한 줄 요약, 계정 상태의 뜻. */
function header(): string[] {
  const dict = getDictionary(LOCALE);
  const otherLocales = LOCALES.filter((l) => l !== LOCALE).map(
    (l) => `${LOCALE_NAMES[l]} ${absoluteUrl(homeHref(l))}`,
  );

  return [
    `# ${BRAND_WORDMARK.ko} (${BRAND_WORDMARK.en})`,
    "",
    `> ${dict.site.description}`,
    "",
    withBrand(dict.about.intro),
    "",
    dict.about.what1,
    ...dict.about.whatStates.map((state) => `- ${state}`),
    "",
    `다른 언어 화면: ${otherLocales.join(", ")}`,
  ];
}

function programLine(program: Program): string {
  const name = localizeProgramName(program.id, LOCALE);
  const summary = formatProgramSummary(
    program.id,
    getTotals(program.seasons),
    LOCALE,
  );
  return `- ${link(name, programHref(LOCALE, program.id))}: ${programStrings(program.id, LOCALE).about} (${summary})`;
}

function collectionLines(): string[] {
  const dict = getDictionary(LOCALE);
  return [
    `- ${link(dict.couples.heading, couplesHref(LOCALE))}`,
    `- ${link(dict.episodes.heading, episodesHref(LOCALE))}`,
    `- ${link(dict.solonara.heading, solonaraHref(LOCALE))}`,
  ];
}

function guideLines(): string[] {
  const dict = getDictionary(LOCALE);
  return [
    `- ${link(dict.about.title, aboutHref(LOCALE))}: ${dict.about.description}`,
    `- ${link(dict.faq.title, faqHref(LOCALE))}: ${dict.faq.description}`,
    `- ${link(dict.takedown.title, takedownHref(LOCALE))}: ${dict.takedown.description}`,
    `- ${link(dict.privacy.title, privacyHref(LOCALE))}: ${dict.privacy.description}`,
  ];
}

/** `/llms.txt` — 머리 + 주요 화면 링크. */
export async function buildLlmsTxt(): Promise<string> {
  const programs = await indexablePrograms();

  return [
    ...header(),
    "",
    "## 프로그램",
    "",
    ...programs.map(programLine),
    "",
    "## 모아 보기",
    "",
    ...collectionLines(),
    "",
    "## 사이트 안내",
    "",
    ...guideLines(),
    "",
    "## Optional",
    "",
    `- [llms-full.txt](${absoluteUrl("/llms-full.txt")}): 기수별 목록과 소개, 계정 확인 기준, 자주 묻는 질문 전문`,
    "",
  ].join("\n");
}

/** 기수 한 줄 + 소개 문단. 방송 기간 날짜는 넣지 않는다 — 기수 정보 시험(`SEASON_FACTS_TRIAL`)의 비교군이 깨진다. */
function seasonBlock(program: Program, season: Program["seasons"][number]): string[] {
  const { label, special } = localizeSeason(season, LOCALE);
  const name = special ? `${label} (${special})` : label;
  const coverage = formatCoverage(getCoverage(season.cast), LOCALE);
  const description = seasonDescription(season, LOCALE);

  return [
    `### ${link(name, seasonHref(LOCALE, program.id, season.id))}`,
    "",
    coverage,
    ...(description.length ? ["", ...description] : []),
    "",
  ];
}

/** `/llms-full.txt` — 링크 대신 본문까지. 기수 목록·확인 기준·FAQ 전문. */
export async function buildLlmsFullTxt(): Promise<string> {
  const dict = getDictionary(LOCALE);
  const programs = await indexablePrograms();

  return [
    ...header(),
    "",
    `## ${dict.about.howHeading}`,
    "",
    dict.about.how1,
    ...dict.about.howEvidence.map((evidence) => `- ${evidence}`),
    "",
    dict.about.how2,
    "",
    dict.about.how3,
    "",
    `## ${dict.about.excludeHeading}`,
    "",
    ...dict.about.exclude.map((item) => `- ${item}`),
    "",
    `## ${dict.faq.title}`,
    "",
    ...dict.faq.items.flatMap((item) => [`### ${item.q}`, "", item.a, ""]),
    "## 모아 보기",
    "",
    ...collectionLines(),
    "",
    "## 사이트 안내",
    "",
    ...guideLines(),
    "",
    ...programs.flatMap((program) => [
      `## ${link(localizeProgramName(program.id, LOCALE), programHref(LOCALE, program.id))}`,
      "",
      programStrings(program.id, LOCALE).about,
      "",
      formatProgramSummary(program.id, getTotals(program.seasons), LOCALE),
      "",
      ...getSeasons(program)
        .filter(isIndexable)
        .flatMap((season) => seasonBlock(program, season)),
    ]),
  ].join("\n");
}
