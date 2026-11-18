import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { CollectionBrowser } from "@/components/collection-browser";
import { EpisodeSeasonCard } from "@/components/episode-season-card";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/page-heading";
import { getProgramEpisodes } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  localizeProgramName,
  localizeProgramShortName,
  localizeSeason,
  type Locale,
} from "@/lib/i18n";
import { episodesHref, homeHref } from "@/lib/links";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { breadcrumbSchema, openGraphBase } from "@/lib/seo";
import {
  countEpisodes,
  type ProgramEpisodes,
  type Season,
} from "@/lib/types";

/**
 * 회차별 정리 모음 — 회차 글을 프로그램·기수별로 모은 화면. 최종 커플 모음과 같은 틀
 * (프로그램 탭 + 찾기 + 기수 판)이다.
 *
 * **한국어 화면만 있다** — 회차 글이 한국어로만 쓰여 있다(글 페이지와 같은 이유).
 * 다른 언어 주소는 404 고, hreflang 도 걸지 않는다.
 */

/** `451편` — 한 편일 때 말이 달라지는 언어가 있어서 문구가 두 벌이다. */
function formatCount(count: number, locale: Locale): string {
  const dict = getDictionary(locale).episodes;
  return fill(count === 1 ? dict.countOne : dict.count, { count });
}

/**
 * 판 하나를 찾을 때 훑는 글 — 프로그램·기수·특집, 그리고 회차 제목과 출연자 이름.
 * `작약`·`영호` 로 쳐도 그 사람이 나온 기수가 걸린다.
 */
function seasonKeywords(group: ProgramEpisodes, season: Season, locale: Locale): string {
  const { label, special } = localizeSeason(season, locale);
  return [
    localizeProgramName(group.program.id, locale),
    localizeProgramShortName(group.program.id, locale),
    label,
    special,
    ...season.cast.map((member) => member.alias),
    ...(season.episodes ?? []).map((episode) => episode.title),
  ].join(" ");
}

async function episodesText(locale: Locale) {
  const dict = getDictionary(locale);
  const groups = await getProgramEpisodes();
  const programs = groups
    .map(({ program }) => localizeProgramShortName(program.id, locale))
    .join(dict.episodes.programSeparator);
  const count = countEpisodes(groups);

  return {
    groups,
    count,
    title: fill(dict.episodes.metaTitle, { programs }),
    description: fill(dict.episodes.description, { programs, count }),
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/episodes">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== DEFAULT_LOCALE) return {};

  const { title, description } = await episodesText(lang);
  const url = episodesHref(lang);

  return {
    // 제목에 프로그램 이름이 다 들어 있어 이미 길다(최종 커플 모음과 같다).
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      ...openGraphBase(lang),
      type: "article",
      title,
      description,
      url,
    },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/episodes">) {
  const { lang } = await params;
  if (!isLocale(lang) || lang !== DEFAULT_LOCALE) notFound();

  const dict = getDictionary(lang);
  const { groups, count } = await episodesText(lang);

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema(lang, {
          name: dict.episodes.navLabel,
          path: episodesHref(lang),
        })}
      />

      <header className="gutter pt-8 lg:pt-12">
        <div className="-ml-3 flex items-start gap-1">
          <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
          <PageTitle>{dict.episodes.heading}</PageTitle>
        </div>
        <p className="mt-3 max-w-[62ch] text-[13.5px] leading-[1.75] whitespace-pre-line text-pretty break-keep text-muted-foreground">
          {fill(dict.episodes.lead, { count })}
        </p>
      </header>

      <CollectionBrowser
        groups={groups.map((group) => ({
          id: group.program.id,
          name: localizeProgramShortName(group.program.id, lang),
          count: formatCount(countEpisodes([group]), lang),
          items: group.seasons.map((season) => ({
            id: season.id,
            keywords: seasonKeywords(group, season, lang),
            card: <EpisodeSeasonCard season={season} />,
          })),
        }))}
        text={{
          placeholder: dict.episodes.searchPlaceholder,
          clear: dict.search.clear,
          empty: dict.search.emptyTitle,
        }}
      />
    </main>
  );
}
