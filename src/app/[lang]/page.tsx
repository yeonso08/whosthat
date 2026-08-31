import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading, PageTitle } from "@/components/page-heading";
import { ProgramCard } from "@/components/program-card";
import { SeasonSearch } from "@/components/season-search";
import { SiteHeader } from "@/components/site-header";
import { buildSearchIndex, getPrograms } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { websiteSchema } from "@/lib/seo";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const programs = getPrograms();

  return (
    <main>
      {/* 사이트 이름을 검색 결과에 도메인 대신 띄우려면 홈에 이 마크업이 있어야 한다. */}
      <JsonLd data={websiteSchema(lang)} />

      <header className="px-5 pt-6">
        <SiteHeader />
        {/* 워드마크 바로 아래라 "누꼬 / 출연진 인스타" 로 읽힌다 — 이름과 하는 일이
            한 덩어리다. 사이트 전체 집계를 여기 한 줄 더 적지 않는 건 아래 카드가
            프로그램마다 그 숫자를 이미 말하기 때문이다. */}
        <PageTitle className="mt-6">{dict.home.heading}</PageTitle>
      </header>

      {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 카드가 보인다.
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
          {/* 기수 상세의 출연진 그리드와 같은 2열이다 — 프로그램이 늘어도
              홈이 스크롤 지옥이 되지 않고, 홀수로 남는 타일도 구멍이 안 난다. */}
          <section className="grid grid-cols-2 gap-3 px-5">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </section>
        </>
      </SeasonSearch>
    </main>
  );
}
