import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading, PageTitle } from "@/components/page-heading";
import { LiveRow } from "@/components/live-row";
import { ProgramCard } from "@/components/program-card";
import { SeasonSearch } from "@/components/season-search";
import { buildSearchIndex, getAiringSeasons, getPrograms } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { aboutHref } from "@/lib/links";
import { POLICY_LINK } from "@/components/policy-page";
import { websiteSchema } from "@/lib/seo";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const programs = getPrograms();
  const airing = getAiringSeasons();

  return (
    <main>
      {/* 사이트 이름을 검색 결과에 도메인 대신 띄우려면 홈에 이 마크업이 있어야 한다. */}
      <JsonLd data={websiteSchema(lang)} />

      {/*
       * **홈만 가운데로 세운다**(2026-08-31). 1280px 컨테이너에 프로그램이 둘뿐이라
       * 왼쪽 정렬로는 화면의 오른쪽 절반이 통째로 비었다 — 열을 늘리거나 카드를
       * 키워서 메울 수 있는 종류가 아니다(프로그램이 둘인 게 사실이니까).
       * 가운데로 모으면 같은 여백이 "덜 그려진 화면" 이 아니라 착지 화면의 여유로
       * 읽힌다.
       *
       * 안쪽 화면(프로그램·기수)은 그대로 왼쪽 정렬이다 — 거기는 읽고 훑는
       * 화면이라 눈이 돌아갈 왼쪽 세로선이 있어야 한다.
       */}
      <header className="gutter pt-16 text-center lg:pt-24">
        {/* 워드마크 바로 아래라 "누꼬 / 출연진 인스타" 로 읽힌다 — 이름과 하는 일이
            한 덩어리다. 사이트 전체 집계를 여기 한 줄 더 적지 않는 건 아래 카드가
            프로그램마다 그 숫자를 이미 말하기 때문이다. */}
        <PageTitle className="lg:text-[46px]">{dict.home.heading}</PageTitle>
        {/* 제목이 하는 일을 말하면 이 한 줄은 그 일을 어떻게 하는지 말한다 —
            "확인한 것만 싣는다" 가 이 사이트가 파는 값이라, 착지 화면에서
            한 번은 글자로 나와야 한다. 자세한 기준은 소개가 진다. */}
        <p className="mx-auto mt-3 max-w-[46ch] text-[13.5px] leading-[1.7] text-muted-foreground">
          {dict.home.tagline}{" "}
          <Link href={aboutHref(lang)} className={POLICY_LINK}>
            {dict.about.title}
          </Link>
        </p>
      </header>

      {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 카드가 보인다.
          홈의 인덱스는 프로그램을 안 가린다: 착지하자마자 사람을 찾는 게 이
          사이트의 존재 이유라, 프로그램을 먼저 고르게 만들지 않는다. */}
      <SeasonSearch
        hero
        index={buildSearchIndex(lang)}
        locale={lang}
        text={dict.search}
        status={dict.status}
      >
        <>
          {/*
           * **히어로의 주인공은 검색창이고, 그 바로 아래가 방영 중인 기수다.**
           * 이 사이트에 사람이 오는 순간은 방송 직후 "저 사람 누구야" 이고,
           * 그때 찾는 기수는 거의 언제나 지금 나가는 기수다 — 프로그램을 고르고
           * 기수를 고르는 두 단계를 건너뛴다. 검색어를 치면 이 줄도 결과에
           * 자리를 내준다(검색창의 `children` 이라 그렇다).
           *
           * 방영 중인 게 없으면 통째로 사라진다 — 빈 자리를 "없음" 으로 채우면
           * 히어로가 안내문이 된다.
           */}
          {airing.length > 0 && (
            <div className="gutter flex flex-wrap justify-center gap-2 pt-5">
              {airing.map((season) => (
                <LiveRow key={`${season.programId}-${season.id}`} season={season} />
              ))}
            </div>
          )}

          <GroupHeading className="text-center">
            {dict.home.programsHeading}
          </GroupHeading>
          {/*
           * 포스터 진열대다 — 격자가 아니라 가운데로 모이는 줄바꿈이라, 프로그램이
           * 둘일 때도 스무 개일 때도 마지막 줄이 왼쪽에 몰리지 않는다. 판 크기는
           * 화면이 아니라 포스터가 정한다(고정 폭) — 컨테이너를 열로 나누면 둘뿐인
           * 지금 판이 손톱만 해진다.
           *
           * 세로 간격이 넓은 건 포스터 아래 현황 줄이 다음 줄 포스터에 붙지 않게
           * 하려는 것이다.
           */}
          <section className="gutter flex flex-wrap justify-center gap-x-4 gap-y-9 lg:gap-x-6">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </section>
        </>
      </SeasonSearch>
    </main>
  );
}
