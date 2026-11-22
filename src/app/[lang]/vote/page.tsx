import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { EpisodeVote } from "@/components/episode-vote";
import { PageTitle } from "@/components/page-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteHistory } from "@/components/vote-history";
import {
  episodeVotesUrl,
  getPrograms,
  getSeasons,
  programVotesUrl,
} from "@/lib/data";
import {
  fill,
  formatEpisodeDate,
  getDictionary,
  isLocale,
  localizeProgramShortName,
  localizeSeason,
  type Locale,
} from "@/lib/i18n";
import { episodeHref, homeHref, voteHref } from "@/lib/links";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { openGraphBase } from "@/lib/seo";
import { getFinalCouples, type CastMember, type Season } from "@/lib/types";
import { VOTE_PROGRAMS, votableEpisode } from "@/lib/vote";

/** 화면 안 두 덩어리(진행 중·회차별 결과)의 제목. 탭 아래라 `GroupHeading`(자기 여백을 가진다)을 못 쓴다. */
const SECTION_HEADING = "text-[17px] font-bold tracking-[-0.02em]";

/**
 * 시청자 투표 — 회차마다 마음에 든 솔로남·솔로녀를 고르고, 회차별 1위와 실제 최종 선택을
 * 나란히 본다. 프로그램은 탭으로 가른다(모음 화면들과 같은 문법).
 *
 * **한국어 화면만 있다** — 투표가 회차 글(한국어)에 묶여 있다. 현황은 전부 브라우저가
 * API 에서 읽어서 크롤러가 받는 HTML 은 후보 이름뿐이라 **색인에서 뺀다**(sitemap 에도
 * 없다) — 얇은 화면이 사이트 평가를 깎는 걸 기수 상세에서 이미 겪었다.
 */

function candidates(cast: CastMember[]) {
  return cast.map((member) => ({
    id: member.id,
    alias: member.alias,
    gender: member.gender,
    profileImageUrl: member.profileImageUrl,
  }));
}

/** 지금 투표가 열려 있을 수 있는 회차(`votableEpisode`). 열고 닫기는 API 가 정한다. */
function liveEpisodes(programId: string, seasons: Season[]) {
  return seasons.flatMap((season) => {
    const episode = votableEpisode(programId, season);
    return episode ? [{ season, episode }] : [];
  });
}

function historySeasons(programId: string, seasons: Season[], locale: Locale) {
  return seasons
    .filter((season) => (season.episodes?.length ?? 0) > 0)
    .map((season) => ({
      id: season.id,
      label: localizeSeason(season, locale).label,
      candidates: candidates(season.cast),
      episodes: [...season.episodes].reverse().map((episode) => ({
        airDate: episode.airDate,
        dateLabel: formatEpisodeDate(episode.airDate, locale),
        title: episode.title,
        href: episodeHref(locale, programId, season.id, episode.airDate),
      })),
      finalCouples: getFinalCouples(season)?.map(
        ([man, woman]) => [man.alias, woman.alias] as [string, string],
      ),
    }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/vote">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== DEFAULT_LOCALE) return {};

  const dict = getDictionary(lang).vote;
  const url = voteHref(lang);
  return {
    title: { absolute: dict.metaTitle },
    description: dict.description,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: {
      ...openGraphBase(lang),
      title: dict.metaTitle,
      description: dict.description,
      url,
    },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/vote">) {
  const { lang } = await params;
  if (!isLocale(lang) || lang !== DEFAULT_LOCALE) notFound();

  const dict = getDictionary(lang);
  const programs = (await getPrograms()).filter((program) =>
    VOTE_PROGRAMS.includes(program.id),
  );
  if (programs.length === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-[1080px]">
      <header className="gutter pt-8 lg:pt-12">
        <div className="-ml-3 flex items-start gap-1">
          <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
          <PageTitle>{dict.vote.heading}</PageTitle>
        </div>
        <p className="mt-3 max-w-[62ch] text-[13.5px] leading-[1.75] whitespace-pre-line text-pretty break-keep text-muted-foreground">
          {dict.vote.lead}
        </p>
      </header>

      <Tabs defaultValue={programs[0].id} className="gap-0">
        <div className="gutter pt-7 lg:pt-9">
          <TabsList variant="line" className="h-auto gap-5 p-0">
            {programs.map((program) => (
              <TabsTrigger
                key={program.id}
                value={program.id}
                className="h-10 flex-none rounded-none border-0 px-0 text-[16px] font-bold tracking-[-0.02em] text-muted-foreground group-data-horizontal/tabs:after:bottom-0 data-active:text-foreground dark:data-active:bg-transparent"
              >
                {localizeProgramShortName(program.id, lang)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {programs.map((program) => {
          const seasons = getSeasons(program);
          const live = liveEpisodes(program.id, seasons);
          return (
            <TabsContent key={program.id} value={program.id} className="gutter flex flex-col gap-12 pt-6">
              <section className="flex flex-col gap-4">
                <h2 className={SECTION_HEADING}>{dict.vote.liveHeading}</h2>
                {live.length === 0 ? (
                  <p className="text-[14px] text-muted-foreground">{dict.vote.liveEmpty}</p>
                ) : (
                  live.map(({ season, episode }) => (
                    <EpisodeVote
                      key={season.id}
                      heading={
                        <div>
                          <p className="text-[13px] font-semibold text-muted-foreground">
                            {fill(dict.vote.aired, {
                              season: localizeSeason(season, lang).label,
                              date: formatEpisodeDate(episode.airDate, lang),
                            })}
                          </p>
                          <Link
                            href={episodeHref(lang, program.id, season.id, episode.airDate)}
                            className="focus-ring mt-1 block text-[19px] leading-[1.4] font-bold tracking-[-0.02em] break-keep hover:underline"
                          >
                            {episode.title}
                          </Link>
                        </div>
                      }
                      fallback={
                        <p className="text-[14px] text-muted-foreground">{dict.vote.liveEmpty}</p>
                      }
                      endpoint={episodeVotesUrl(program.id, season.id, episode.airDate)}
                      candidates={candidates(season.cast)}
                      strings={dict.episodeVote}
                      locale={lang}
                    />
                  ))
                )}
              </section>

              <section className="flex flex-col gap-4">
                <h2 className={SECTION_HEADING}>{dict.vote.historyHeading}</h2>
                <VoteHistory
                  endpoint={programVotesUrl(program.id)}
                  seasons={historySeasons(program.id, seasons, lang)}
                  strings={{ ...dict.vote, votes: dict.episodeVote.votes }}
                />
              </section>
            </TabsContent>
          );
        })}
      </Tabs>
    </main>
  );
}
