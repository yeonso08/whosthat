import { getProgram, getPrograms, getSeasons } from "@/lib/data";
import {
  formatProgramSummary,
  getDictionary,
  localizeProgramName,
} from "@/lib/i18n";
import { resolveLocale } from "@/lib/locales";
import { OG_ALT, OG_CONTENT_TYPE, ogImageResponse } from "@/lib/og";
import { OG_SIZE } from "@/lib/site";
import { getTotals } from "@/lib/types";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** 없으면 이 라우트만 요청마다 서버에서 렌더된다 — 기수 카드와 같은 이유다. */
export function generateStaticParams() {
  return getPrograms().map((program) => ({ program: program.id }));
}

export default async function Image({
  params,
}: PageProps<"/[lang]/[program]">) {
  const { lang, program: programId } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);

  const program = getProgram(programId);
  const totals = getTotals(program ? getSeasons(program) : []);

  return ogImageResponse({
    locale,
    scale: "sentence",
    eyebrow: localizeProgramName(programId, locale),
    headline: dict.og.heading,
    // 프로그램 화면의 부제와 같은 문장이다 — 카드가 그 페이지에 대해 다른 말을
    // 하지 않게 같은 표를 본다.
    stat: formatProgramSummary(programId, totals, locale),
  });
}
