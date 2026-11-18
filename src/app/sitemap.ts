import type { MetadataRoute } from "next";
import { getPrograms, getSeasons } from "@/lib/data";
import { languageAlternates } from "@/lib/i18n";
import {
  ABOUT_PATH,
  COUPLES_PATH,
  EPISODES_PATH,
  episodePath,
  FAQ_PATH,
  HOME_PATH,
  localePath,
  PRIVACY_PATH,
  programPath,
  seasonPath,
  TAKEDOWN_PATH,
} from "@/lib/links";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/locales";
import {
  isEpisodeIndexable,
  isIndexable,
  isProgramIndexable,
} from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import type { Season } from "@/lib/types";

/**
 * 프로그램·기수가 늘면 자동으로 따라온다 — generateStaticParams 와 같은 목록을 쓴다.
 * 언어가 늘면 줄 수가 언어 배수로 는다.
 *
 * lastModified 는 그 화면의 내용이 마지막으로 바뀐 때다(`Season.updatedAt`, DB
 * 트리거가 올린다). 빌드 시각을 넣으면 내용이 안 바뀌어도 매 배포마다 "수정됨"이
 * 되어 크롤러가 신뢰를 잃는다. 예전에는 출연자의 `lastVerified` 중 최신을 썼는데,
 * 계정이 아닌 변경(소개 문단·직업)을 못 봤고, 못 찾은 사람(`null`)이 섞인 기수는
 * 날짜가 통째로 빠졌다(2026-10-14 기준 138줄 중 108줄).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 명단이 빈 기수와, 그런 기수뿐인 프로그램은 noindex 라 여기서도 뺀다 —
  // 색인하지 말라고 적어 둔 페이지를 sitemap 으로 제출하면 Search Console 이
  // 그걸 오류로 잡는다. 둘의 기준이 갈라지지 않게 판단은 `seo.ts` 에서만 한다.
  const programs = (await getPrograms()).filter(isProgramIndexable);

  const pages = [
    {
      path: HOME_PATH,
      // 홈과 프로그램 화면은 기수들의 현황을 모아 보여 주므로, 그 기수 중
      // 가장 최근에 바뀐 때가 곧 그 화면이 바뀐 때다.
      lastModified: latestUpdate(programs.flatMap((p) => p.seasons)),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...programs.flatMap((program) => [
      {
        path: programPath(program.id),
        lastModified: latestUpdate(program.seasons),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      ...getSeasons(program)
        .filter(isIndexable)
        .map((season) => ({
          path: seasonPath(program.id, season.id),
          lastModified: new Date(season.updatedAt),
          // 방영 중인 기수는 계정이 계속 붙는다. 지난 기수는 거의 안 바뀐다.
          changeFrequency: season.onAir
            ? ("daily" as const)
            : ("monthly" as const),
          priority: season.onAir ? 0.8 : 0.7,
        })),
    ]),
    // 최종 커플 모음은 기수들의 최종 선택을 모아 보여 주므로, 홈과 같이 그 기수 중
    // 가장 최근에 바뀐 때가 곧 이 화면이 바뀐 때다.
    {
      path: COUPLES_PATH,
      lastModified: latestUpdate(programs.flatMap((p) => p.seasons)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    // 소개·FAQ 는 이 사이트가 무엇을 어떻게 하는지 적어 둔 산문이라 색인에
    // 올린다 — 기수 목록보다 낮고 정책 문서보다는 높다.
    ...[ABOUT_PATH, FAQ_PATH].map((path) => ({
      path,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // 삭제 창구는 당사자가 검색으로도 닿아야 해서 색인에 올린다.
    ...[TAKEDOWN_PATH, PRIVACY_PATH].map((path) => ({
      path,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  // 언어마다 한 줄씩 내되, 서로가 서로의 다른 언어 판이라고 알려 준다 —
  // 그래야 크롤러가 같은 내용의 중복이 아니라 번역으로 읽는다.
  // 회차 글은 한국어 화면뿐이라 한 줄씩이고 hreflang 도 없다 — 없는 언어 판을
  // 가리키면 크롤러가 404 를 번역본으로 받아 간다. 얇은 글은 noindex 라 여기서도
  // 뺀다(`isEpisodeIndexable`). 회차에는 수정 시각이 따로 없어 그 기수의 것을 쓴다.
  const episodes = programs.flatMap((program) =>
    getSeasons(program)
      .filter(isIndexable)
      .flatMap((season) =>
        (season.episodes ?? []).filter(isEpisodeIndexable).map((episode) => ({
          url: absoluteUrl(
            localePath(
              DEFAULT_LOCALE,
              episodePath(program.id, season.id, episode.airDate),
            ),
          ),
          lastModified: new Date(season.updatedAt),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
      ),
  );

  // 회차별 정리 모음도 한국어 화면뿐이라 한 줄이다. 회차가 붙을 때마다 바뀐다.
  const episodeSeasons = programs.flatMap((p) =>
    p.seasons.filter((season) => (season.episodes?.length ?? 0) > 0),
  );
  const episodesIndex: MetadataRoute.Sitemap =
    episodeSeasons.length > 0
      ? [
          {
            url: absoluteUrl(localePath(DEFAULT_LOCALE, EPISODES_PATH)),
            lastModified: latestUpdate(episodeSeasons),
            changeFrequency: "weekly",
            priority: 0.6,
          },
        ]
      : [];

  return [
    ...pages.flatMap(({ path, ...meta }) =>
      LOCALES.map((locale) => ({
        url: absoluteUrl(localePath(locale, path)),
        ...meta,
        alternates: { languages: absolute(languageAlternates(path)) },
      })),
    ),
    ...episodesIndex,
    ...episodes,
  ];
}

/** hreflang 은 절대 URL 이라야 한다. 화면 쪽 alternates 는 상대경로를 쓴다. */
function absolute(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languages).map(([key, path]) => [key, absoluteUrl(path)]),
  );
}

function latestUpdate(seasons: Season[]): Date | undefined {
  const times = seasons.map((s) => Date.parse(s.updatedAt));
  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
}
