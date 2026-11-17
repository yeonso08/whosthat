import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoAds } from "@/components/ads";
import { BackLink } from "@/components/back-link";
import { CollectionLink } from "@/components/collection-link";
import { InstagramIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { ListPanel } from "@/components/list-card";
import { PageEyebrow, PageTitle } from "@/components/page-heading";
import { EpisodeBlocks } from "@/components/season-episodes";
import { getProgram, getPrograms, getSeason, getSeasons } from "@/lib/data";
import {
  fill,
  formatEpisodeDate,
  formatFullDate,
  getDictionary,
  isLocale,
  localizeProgramName,
  localizeSeason,
  seasonEpisodes,
} from "@/lib/i18n";
import {
  castMemberHref,
  episodeHref,
  programHref,
  seasonHref,
} from "@/lib/links";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { breadcrumbSchema, isEpisodeIndexable, openGraphBase } from "@/lib/seo";
import { getCoverage, getEpisodeExcerpt } from "@/lib/types";

/** 검색 결과 설명 한 줄의 길이. 더 길면 검색엔진이 중간에서 자른다. */
const DESCRIPTION_LENGTH = 150;

/**
 * 회차 글은 한국어 화면에만 있다(`seasonEpisodes` 와 같은 이유 — 글이 한국어로만
 * 쓰여 있다). 다른 언어에서는 주소를 하나도 만들지 않고, 찾아와도 404 다.
 *
 * 언어는 루트 레이아웃이 만들어 내려 준다 — 여기서는 그 언어일 때만 프로그램 ×
 * 기수 × 방송일을 곱한다.
 */
export async function generateStaticParams({
  params,
}: {
  params: { lang: string };
}) {
  if (params.lang !== DEFAULT_LOCALE) return [];

  return (await getPrograms()).flatMap((program) =>
    getSeasons(program).flatMap((season) =>
      (season.episodes ?? []).map((episode) => ({
        program: program.id,
        id: season.id,
        date: episode.airDate,
      })),
    ),
  );
}

/** 주소가 가리키는 기수와 회차. 없으면 페이지도 metadata 도 만들지 않는다. */
async function findEpisode(lang: string, programId: string, id: string, date: string) {
  if (!isLocale(lang)) return undefined;

  const program = await getProgram(programId);
  const season = await getSeason(programId, id);
  if (!program || !season) return undefined;

  const episodes = seasonEpisodes(season, lang);
  const episode = episodes.find((e) => e.airDate === date);
  return episode ? { lang, program, season, episodes, episode } : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[program]/seasons/[id]/episodes/[date]">): Promise<Metadata> {
  const { lang, program: programId, id, date } = await params;
  const found = await findEpisode(lang, programId, id, date);
  if (!found) return {};

  const { season, episode } = found;
  const dict = getDictionary(found.lang);
  const title = fill(dict.episode.metaTitle, {
    title: episode.title,
    program: localizeProgramName(programId, found.lang),
    season: localizeSeason(season, found.lang).label,
    date: formatEpisodeDate(episode.airDate, found.lang),
  });
  const description = getEpisodeExcerpt(episode).slice(0, DESCRIPTION_LENGTH);
  const url = episodeHref(found.lang, programId, season.id, episode.airDate);

  return {
    // 제목에 프로그램·기수가 다 들어 있어 사이트 이름을 뒤에 또 붙이지 않는다.
    title: { absolute: title },
    description,
    // 다른 언어 판이 없어서 hreflang 을 걸지 않는다 — canonical 하나뿐이다.
    alternates: { canonical: url },
    // 얇은 글은 색인에서 뺀다 — 이유는 `isEpisodeIndexable` 에 적어 뒀다.
    ...(isEpisodeIndexable(episode)
      ? {}
      : { robots: { index: false, follow: true } }),
    openGraph: {
      ...openGraphBase(found.lang),
      type: "article",
      title,
      description,
      url,
    },
  };
}

export default async function Page({
  params,
}: PageProps<"/[lang]/[program]/seasons/[id]/episodes/[date]">) {
  const { lang, program: programId, id, date } = await params;
  const found = await findEpisode(lang, programId, id, date);
  if (!found) notFound();

  const { season, episodes, episode } = found;
  const locale = found.lang;
  const dict = getDictionary(locale);
  const programName = localizeProgramName(programId, locale);
  const { label } = localizeSeason(season, locale);
  const coverage = getCoverage(season.cast);
  // 최신 회차부터. 지금 읽는 회차는 뺀다.
  const others = episodes.filter((e) => e.id !== episode.id).reverse();

  return (
    // 읽는 화면이라 좁은 기둥이다 — 기수 화면 안에서 이 글이 서던 폭(720px)과 같다.
    <main className="mx-auto w-full max-w-[784px]">
      <JsonLd
        data={breadcrumbSchema(
          locale,
          { name: programName, path: programHref(locale, programId) },
          { name: label, path: seasonHref(locale, programId, season.id) },
          {
            name: episode.title,
            path: episodeHref(locale, programId, season.id, episode.airDate),
          },
        )}
      />
      {/* 색인에 올릴 만큼 쓴 글에만 광고를 건다 — 얇은 글에 걸면 "게시자 콘텐츠가
          없는 화면" 이 된다(기수 화면의 `hasAdContent` 와 같은 태도다). */}
      {isEpisodeIndexable(episode) && <AutoAds />}

      <header className="gutter pt-8 lg:pt-12">
        <PageEyebrow>
          {programName} {label}
        </PageEyebrow>

        {/* 뒤로가기는 이 회차가 속한 기수 화면이다 — 출연진과 계정이 거기 있다. */}
        <div className="mt-3 -ml-3 flex items-start gap-1">
          <BackLink
            href={seasonHref(locale, programId, season.id)}
            label={fill(dict.episode.backLabel, { season: label })}
          />
          <PageTitle>{episode.title}</PageTitle>
        </div>

        <p className="font-lat mt-2 text-[13px] font-semibold text-muted-foreground">
          {fill(dict.season.episodeAired, {
            date: formatFullDate(episode.airDate, locale),
          })}
        </p>
      </header>

      <article className="gutter mt-7 lg:mt-9">
        {/* 글 속 이름은 기수 화면의 그 사람 카드로 간다 — 계정이 거기 있다. */}
        <EpisodeBlocks
          blocks={episode.blocks}
          cast={season.cast}
          memberHref={(memberId) =>
            castMemberHref(locale, programId, season.id, memberId)
          }
        />
        <p className="mt-8 text-[12px] leading-[1.7] text-muted-foreground">
          {dict.season.episodesSource}
        </p>
      </article>

      {/* 글을 다 읽은 사람이 갈 곳 둘 — 이 사람들의 계정, 그리고 같은 기수의 다른 회차. */}
      <section className="gutter mt-10 lg:mt-12">
        <ListPanel>
          <CollectionLink
            href={seasonHref(locale, programId, season.id)}
            title={fill(dict.episode.castLink, { season: label })}
            summary={fill(dict.season.castCount, {
              total: coverage.total,
              found: coverage.found,
            })}
            icon={<InstagramIcon className="size-4.5 text-foreground" />}
          />
        </ListPanel>
      </section>

      {others.length > 0 && (
        <section className="gutter">
          <h2 className="pt-9 pb-3.5 text-[15px] font-bold tracking-[-0.02em] lg:text-base">
            {fill(dict.episode.othersHeading, { season: label })}
          </h2>
          <ListPanel>
            {others.map((other) => (
              <Link
                key={other.id}
                href={episodeHref(locale, programId, season.id, other.airDate)}
                className="press focus-ring group flex items-center gap-4 px-5 py-4 hover:bg-elevated/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="font-lat block text-[12px] font-semibold text-muted-foreground">
                    {fill(dict.season.episodeAired, {
                      date: formatEpisodeDate(other.airDate, locale),
                    })}
                  </span>
                  <span className="mt-0.5 block text-[15px] leading-[1.4] font-bold tracking-[-0.02em] break-keep">
                    {other.title}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
              </Link>
            ))}
          </ListPanel>
        </section>
      )}
    </main>
  );
}
