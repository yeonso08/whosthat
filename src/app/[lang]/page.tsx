import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading, PageTitle } from "@/components/page-heading";
import { PageShell } from "@/components/page-shell";
import { ProgramCard } from "@/components/program-card";
import { SeasonSearch } from "@/components/season-search";
import { buildSearchIndex, getPrograms } from "@/lib/data";
import { fill, getDictionary, isLocale } from "@/lib/i18n";
import { websiteSchema } from "@/lib/seo";
import { getSiteTotals } from "@/lib/types";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const programs = getPrograms();

  return (
    <>
      {/* 사이트 이름을 검색 결과에 도메인 대신 띄우려면 홈에 이 마크업이 있어야 한다. */}
      <JsonLd data={websiteSchema(lang)} />

      <PageShell
        rail={
          <>
            {/* 워드마크 바로 아래라 "누꼬 / 출연진 인스타" 로 읽힌다 — 이름과
                하는 일이 한 덩어리다. */}
            <PageTitle className="mt-6 lg:mt-10">{dict.home.heading}</PageTitle>
            <p className="mt-2 text-[13px] break-keep text-muted-foreground lg:mt-3">
              {fill(dict.home.summary, getSiteTotals(programs))}
            </p>
          </>
        }
      >
        {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 격자가 보인다.
            홈의 인덱스는 프로그램을 안 가린다: 착지하자마자 사람을 찾는 게 이
            사이트의 존재 이유라, 프로그램을 먼저 고르게 만들지 않는다. */}
        <SeasonSearch
          index={buildSearchIndex(lang)}
          locale={lang}
          text={dict.search}
          status={dict.status}
        >
          <>
            <GroupHeading>{dict.home.programsHeading}</GroupHeading>
            {/* 포스터 격자다 — 프로그램이 늘어도 홈이 스크롤 지옥이 되지 않고,
                홀수로 남는 타일도 구멍이 안 난다. */}
            <section className="gutter grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-8 xl:grid-cols-5">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </section>
          </>
        </SeasonSearch>
      </PageShell>
    </>
  );
}
