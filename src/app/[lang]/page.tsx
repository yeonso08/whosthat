import { ChevronRight, Heart, MapPin, NotebookText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AutoAds } from "@/components/ads";
import { CollectionLink } from "@/components/collection-link";
import { EpisodeRow } from "@/components/episode-row";
import { JsonLd } from "@/components/json-ld";
import { ListPanel } from "@/components/list-card";
import { ProgramCard } from "@/components/program-card";
import { SeasonSearch } from "@/components/season-search";
import { WithBanner } from "@/components/with-banner";
import {
  buildSearchIndex,
  getLatestEpisodes,
  getProgramEpisodes,
  getProgramCouples,
  getPrograms,
  getSolonaraSeasons,
} from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  localizeProgramShortName,
} from "@/lib/i18n";
import { couplesHref, episodesHref, solonaraHref } from "@/lib/links";
import { websiteSchema } from "@/lib/seo";
import { countCouples, countEpisodes } from "@/lib/types";

/**
 * 홈 목록 판의 다크 모드. 바탕(#0a0a0c)과 판(#141418)의 명도 차가 작고 검은 그림자는
 * 안 보여서, 다크에서는 판이 바탕에 붙어 화면이 한 장의 검은 면이 됐다(2026-11-19).
 * 반투명 유리판 + 위쪽 가장자리의 가는 빛으로 띄운다. 라이트는 그대로다.
 */
const HOME_PANEL =
  "dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07)] dark:ring-1 dark:ring-white/[0.07] dark:backdrop-blur";

/** "최근 방송" 에 세우는 회차 수. 방영 중인 프로그램이 셋이라 한 주치가 다 들어간다. */
const LATEST_COUNT = 3;

/**
 * 두 단의 제목. 판의 왼쪽 끝과 같은 선에서 시작한다 — `GroupHeading` 은 화면
 * 여백(`gutter`)을 제 안에 갖고 있어서 격자 칸 안에 넣으면 여백이 두 번 걸린다.
 */
function DigestHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-9 pb-3.5 text-[15px] font-bold tracking-[-0.02em] lg:text-base">
      {children}
    </h2>
  );
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const [programs, coupleGroups, latest, episodeGroups, solonara] = await Promise.all([
    getPrograms(),
    getProgramCouples(),
    // 회차별 정리는 한국어 화면에만 나온다(`seasonEpisodes` 와 같은 이유).
    lang === "ko" ? getLatestEpisodes(LATEST_COUNT) : [],
    lang === "ko" ? getProgramEpisodes() : [],
    // 숙소와 게임도 한국어 화면만 있다.
    lang === "ko" ? getSolonaraSeasons() : [],
  ]);
  const couples = countCouples(coupleGroups);
  const episodes = countEpisodes(episodeGroups);

  return (
    <main className="font-home relative isolate overflow-x-clip">
      {/* 사이트 이름을 검색 결과에 도메인 대신 띄우려면 홈에 이 마크업이 있어야 한다. */}
      <JsonLd data={websiteSchema(lang)} />

      {/*
       * 홈은 조건 없이 건다. 2026-09-02 의 위반 뒤 한동안 빼 뒀는데, 그때 걸린 건
       * "명단이 비어 화면에 한 문장뿐인" 화면들이었지 홈이 아니다 — 여기엔 사이트가
       * 무엇을 하는지 적은 줄, 지금 방영 중인 기수, 프로그램 판이 있다.
       *
       * 그리고 **애드센스에 등록된 사이트가 apex(`nukko.net`)라 심사 봇이 착지하는
       * 첫 화면이 여기다.** 홈에만 코드가 없으면 "사이트에서 광고 코드를 찾지 못했다"
       * 쪽으로 잘못 읽힐 자리가 생긴다.
       */}
      <AutoAds />

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
      {/* 모비온 배너는 홈에 조건 없이 건다 — 애드센스와 같은 이유다(위). */}
      {/* 배너를 제목 줄 높이에서 시작한다 — 제목 위 여백(`lg:pt-24`)과 짝이다. */}
      <WithBanner show railClassName="lg:mt-24">
        <header className="gutter relative pt-14 text-center lg:pt-24">
          {/*
           * 머리글 뒤에서 분홍과 파랑 두 빛이 만난다 — 이 장르의 솔로녀·솔로남
           * 색이고, 서로 다른 둘이 겹치는 자리가 연애 예능 그 자체다. 색은 이
           * 빛과 포스터 판 두 곳에만 쓴다(2026-11-19 홈 재디자인). 가로로 넘치는
           * 빛은 `main` 이 잘라 낸다.
           */}
          {/* 다크는 빛을 따로 칠한다(2026-11-19) — 다크 팔레트의 `--she`·`--he` 는 글자용
              파스텔이라 검정 위에 깔면 회보라 얼룩이 됐다. 진한 원색을 `screen` 으로
              겹쳐 겹친 자리가 밝아지게 한다. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[420px]">
            <div className="absolute top-0 left-1/2 size-[300px] -translate-x-[88%] rounded-full bg-she opacity-25 blur-[80px] lg:size-[420px] dark:bg-[#e0397a] dark:opacity-25 dark:mix-blend-screen" />
            <div className="absolute top-10 left-1/2 size-[300px] -translate-x-[12%] rounded-full bg-he opacity-25 blur-[80px] lg:size-[420px] dark:bg-[#2f62e8] dark:opacity-30 dark:mix-blend-screen" />
          </div>
          {/* `PageTitle` 을 안 쓰는 건 홈만 크기·서체가 달라서다. 제목은 착지한
              사람이 들고 온 질문 그대로다 — 굵은 낱말 하나(`출연진 인스타`)는
              무슨 사이트인지 말하지 못하고 도장처럼 찍혔다(2026-11-19 반려). */}
          <h1 className="text-[32px] leading-[1.18] font-bold tracking-[-0.045em] whitespace-pre-line break-keep lg:text-[54px]">
            {dict.home.heading}
          </h1>
          <p className="mx-auto mt-4 max-w-[36ch] text-[14.5px] leading-relaxed text-balance break-keep text-muted-foreground lg:text-[16px]">
            {dict.home.tagline}
          </p>
        </header>

        {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 카드가 보인다.
            홈의 인덱스는 프로그램을 안 가린다: 착지하자마자 사람을 찾는 게 이
            사이트의 존재 이유라, 프로그램을 먼저 고르게 만들지 않는다. */}
        <SeasonSearch
          hero
          index={await buildSearchIndex(lang)}
          locale={lang}
          text={dict.search}
          status={dict.status}
        >
          <>
            {/*
             * 포스터 진열대. 제목과 판을 왼쪽 선에 맞춘다(2026-11-19, 사용자 요청 —
             * 그전엔 가운데로 모이는 줄바꿈이었다). 기둥 폭은 포스터 네 장 줄과 같아
             * 지금 네 프로그램이면 한 줄이 꽉 찬다. 프로그램이 늘면 다음 줄이 왼쪽부터
             * 찬다.
             *
             * 검색창 아래 방영 중 바로가기 줄은 같은 날 뺐다 — "자리만 차지한다".
             */}
            <div className="gutter pt-10 lg:pt-14">
              <div className="mx-auto w-full max-w-[784px] lg:max-w-[920px]">
                <h2 className="pb-4 text-[22px] font-extrabold tracking-[-0.03em] lg:pb-5 lg:text-[26px]">
                  {dict.home.programsHeading}
                </h2>
                <section className="flex flex-wrap gap-x-4 gap-y-8 lg:gap-x-6">
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </section>
              </div>
            </div>

            {/*
             * 진열대 아래는 두 단이다 — 왼쪽은 **다시 올 이유**(최근 방송 정리),
             * 오른쪽은 **더 둘러볼 곳**(프로그램을 가로질러 모은 화면)이다. 폭은
             * 포스터 네 장 줄과 같아서 양 끝이 진열대와 같은 세로선에 선다.
             *
             * 여기는 가운데로 모으지 않는다 — 읽는 줄이라 눈이 돌아갈 왼쪽 선이
             * 있어야 한다. 회차별 정리는 한국어 화면에만 있어서, 다른 언어에서는
             * 모아 보기 한 단만 가운데에 선다.
             */}
            {(latest.length > 0 || couples > 0 || episodes > 0 || solonara.length > 0) && (
              <div
                className={`gutter mx-auto grid w-full gap-x-6 pt-4 ${
                  latest.length > 0
                    ? "max-w-[984px] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
                    : "max-w-[512px]"
                }`}
              >
                {latest.length > 0 && (
                  <section>
                    {/* "최근 방송" 은 기수마다 마지막 한 편뿐이다 — 나머지 글로 가는 길을
                        제목 줄 끝에 둔다(모아 보기 판의 "회차별 정리" 와 같은 곳으로 간다). */}
                    <div className="flex items-baseline justify-between gap-4">
                      <DigestHeading>{dict.home.latestHeading}</DigestHeading>
                      <Link
                        href={episodesHref(lang)}
                        className="focus-ring group flex items-center gap-0.5 rounded-md text-[13px] font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {dict.home.latestAll}
                        <ChevronRight className="size-4 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                    <ListPanel className={HOME_PANEL}>
                      {latest.map(({ season, episode }) => (
                        <EpisodeRow
                          key={`${season.programId}-${season.id}`}
                          season={season}
                          episode={episode}
                        />
                      ))}
                    </ListPanel>
                  </section>
                )}

                {(couples > 0 || episodes > 0 || solonara.length > 0) && (
                  <section>
                    <DigestHeading>{dict.home.collectionsHeading}</DigestHeading>
                    <ListPanel className={HOME_PANEL}>
                      {episodes > 0 && (
                        <CollectionLink
                          href={episodesHref(lang)}
                          title={dict.episodes.heading}
                          summary={fill(dict.episodes.summary, {
                            programs: episodeGroups
                              .map(({ program }) =>
                                localizeProgramShortName(program.id, lang),
                              )
                              .join(dict.episodes.programSeparator),
                            count: episodes,
                          })}
                          icon={<NotebookText className="size-4.5 text-foreground dark:text-[#8fb0ff]" />}
                          iconClassName="dark:bg-[#2f62e8]/20"
                        />
                      )}
                      {solonara.length > 0 && (
                        <CollectionLink
                          href={solonaraHref(lang)}
                          title={dict.solonara.heading}
                          summary={fill(dict.solonara.summary, {
                            count: solonara.length,
                          })}
                          icon={<MapPin className="size-4.5 text-foreground dark:text-[#c7a8ff]" />}
                          iconClassName="dark:bg-[#7a4fe0]/25"
                        />
                      )}
                      {couples > 0 && (
                        <CollectionLink
                          href={couplesHref(lang)}
                          title={dict.couples.heading}
                          summary={fill(dict.couples.summary, {
                            programs: coupleGroups
                              .map(({ program }) =>
                                localizeProgramShortName(program.id, lang),
                              )
                              .join(dict.couples.programSeparator),
                            couples,
                          })}
                          icon={<Heart className="size-4.5 fill-couple text-couple" />}
                          iconClassName="dark:bg-[#e0397a]/20"
                        />
                      )}
                    </ListPanel>
                  </section>
                )}
              </div>
            )}
          </>
        </SeasonSearch>
      </WithBanner>
    </main>
  );
}
