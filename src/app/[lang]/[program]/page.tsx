import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading, PageEyebrow, PageTitle } from "@/components/page-heading";
import { SeasonFeature } from "@/components/season-feature";
import { SeasonRow } from "@/components/season-row";
import { PageShell } from "@/components/page-shell";
import { SeasonSearch } from "@/components/season-search";
import { buildSearchIndex, getProgram, getPrograms, getSeasons } from "@/lib/data";
import {
  formatProgramSummary,
  getDictionary,
  isLocale,
  programStrings,
} from "@/lib/i18n";
import { homeHref } from "@/lib/links";
import { breadcrumbSchema, programCrumb, programMetadata } from "@/lib/seo";
import { getTotals } from "@/lib/types";

/** 언어는 루트 레이아웃이 만든다 — 여기서는 프로그램만 내고 둘이 곱해진다. */
export function generateStaticParams() {
  return getPrograms().map((program) => ({ program: program.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[program]">): Promise<Metadata> {
  const { lang, program: programId } = await params;
  if (!isLocale(lang)) return {};

  const program = getProgram(programId);
  if (!program) return {};

  return programMetadata(program, lang);
}

export default async function Page({
  params,
}: PageProps<"/[lang]/[program]">) {
  const { lang, program: programId } = await params;
  if (!isLocale(lang)) notFound();

  const program = getProgram(programId);
  if (!program) notFound();

  const dict = getDictionary(lang);
  const strings = programStrings(program.id, lang);
  const seasons = getSeasons(program);
  const [featured, ...rest] = seasons;

  return (
    <>
      <JsonLd data={breadcrumbSchema(lang, programCrumb(program, lang))} />

      <PageShell
        rail={
          <>
            <PageEyebrow>{strings.name}</PageEyebrow>

            {/* 뒤로가기를 제목 줄에 붙인다 — 기수 상세와 같은 구조다. */}
            <div className="mt-3 -ml-3 flex items-start gap-1">
              <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
              <PageTitle>{strings.heading}</PageTitle>
            </div>

            <p className="mt-1.5 text-[13px] break-keep text-muted-foreground">
              {formatProgramSummary(program.id, getTotals(seasons), lang)}
            </p>

            {/* 최신 기수는 레일에 세운다 — 넓은 화면에서 목록 위에 눕히면 가로로
                늘어난 띠가 되고, 그 자리는 목록이 써야 한다. */}
            {featured && (
              <div className="mt-5 lg:mt-8">
                <SeasonFeature season={featured} />
              </div>
            )}
          </>
        }
      >
        {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 목록이 보인다.
            인덱스는 이 프로그램만 담는다: 프로그램 화면에서 친 말이 다른 프로그램
            으로 새면 지금 보고 있는 목록과 결과가 어긋난다. */}
        <SeasonSearch
          index={buildSearchIndex(lang, program)}
          locale={lang}
          text={{
            ...dict.search,
            placeholder: strings.searchPlaceholder,
            seasonsHeading: strings.seasonsHeading,
          }}
          status={dict.status}
        >
          {rest.length > 0 && (
            <>
              <GroupHeading>{strings.pastSeasons}</GroupHeading>
              {/* 넓은 화면에서는 두 줄씩 나란히 간다 — 33개를 한 줄로 세우면
                  오른쪽 면의 절반이 비고 스크롤만 두 배로 길어진다. */}
              <section className="gutter-inset xl:columns-2 xl:gap-4">
                {rest.map((season) => (
                  <SeasonRow key={season.id} season={season} />
                ))}
              </section>
            </>
          )}
        </SeasonSearch>
      </PageShell>
    </>
  );
}
