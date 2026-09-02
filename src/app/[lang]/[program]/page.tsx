import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoAds } from "@/components/ads";
import { BackLink } from "@/components/back-link";
import { JsonLd } from "@/components/json-ld";
import { ListCard } from "@/components/list-card";
import { GroupHeading, PageEyebrow, PageTitle } from "@/components/page-heading";
import { SeasonFeature } from "@/components/season-feature";
import { SeasonRow } from "@/components/season-row";
import { SeasonSearch } from "@/components/season-search";
import { buildSearchIndex, getProgram, getPrograms, getSeasons } from "@/lib/data";
import {
  formatProgramSummary,
  getDictionary,
  isLocale,
  programStrings,
} from "@/lib/i18n";
import { homeHref } from "@/lib/links";
import {
  breadcrumbSchema,
  programCrumb,
  programHasAdContent,
  programMetadata,
} from "@/lib/seo";
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
    // **읽는 화면은 좁은 기둥으로 묶는다.** 1280px 을 다 쓰면 기수 한 줄이
    // 왼쪽 끝의 제목과 오른쪽 끝의 숫자로 찢어져서, 한 줄인데 두 덩어리로
    // 읽힌다. 격자 화면(홈·기수 상세)만 컨테이너를 다 쓴다.
    <main className="mx-auto w-full max-w-[860px]">
      <JsonLd data={breadcrumbSchema(lang, programCrumb(program, lang))} />
      {/* 확인한 계정이 한 건도 없는 프로그램에는 광고를 걸지 않는다. */}
      {programHasAdContent(program) && <AutoAds />}

      <header className="gutter pt-8 pb-1 lg:pt-12">
        <PageEyebrow>{strings.name}</PageEyebrow>

        {/* 뒤로가기를 제목 줄에 붙인다 — 기수 상세와 같은 구조다. */}
        <div className="mt-3 -ml-3 flex items-start gap-1">
          <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
          <PageTitle>{strings.heading}</PageTitle>
        </div>

        <p className="mt-2 text-[13px] text-muted-foreground">
          {formatProgramSummary(program.id, getTotals(seasons), lang)}
        </p>

        {/* 어떤 프로그램인지 한 문단. 현황 줄이 숫자를 말하고 이 줄이 무엇을
            세는 숫자인지 말한다 — 검색으로 이 화면에 바로 착지하는 사람은
            프로그램 이름 말고는 아무 설명도 없이 목록을 마주하게 된다. */}
        <p className="mt-3 max-w-[62ch] text-[13.5px] leading-[1.75] text-muted-foreground">
          {strings.about}
        </p>
      </header>

      {featured && (
        <div className="gutter mt-6">
          <SeasonFeature season={featured} />
        </div>
      )}

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
            <ListCard>
              {rest.map((season) => (
                <SeasonRow key={season.id} season={season} />
              ))}
            </ListCard>
          </>
        )}
      </SeasonSearch>
    </main>
  );
}
