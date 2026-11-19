import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  currentLocale,
  fill,
  formatEpisodeDate,
  getDictionary,
  localizeProgramShortName,
  localizeSeason,
} from "@/lib/i18n";
import { episodeHref } from "@/lib/links";
import { getEpisodeExcerpt, type LatestEpisode } from "@/lib/types";

/**
 * 홈 "최근 방송" 판의 한 줄 — 어느 프로그램 몇 기의 언제 방송인지, 그 회차의 제목,
 * 첫 문단 두 줄. 누르면 그 회차의 글 페이지로 간다.
 *
 * **이 줄이 홈에 다시 올 이유다.** 방영 중인 프로그램은 매주 한 회차씩 정리가
 * 붙는데, 그전에는 기수 화면 맨 아래까지 내려가야 보였다. 글이 주인공이라 얼굴도
 * 숫자도 없다 — 제목이 가장 크고, 위 한 줄은 어디 것인지, 아래 두 줄은 맛보기다.
 */
export async function EpisodeRow({ season, episode }: LatestEpisode) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const excerpt = getEpisodeExcerpt(episode);

  return (
    <Link
      href={episodeHref(locale, season.programId, season.id, episode.airDate)}
      className="press focus-ring group flex items-center gap-4 px-5 py-4.5 hover:bg-elevated/40 lg:px-6 lg:py-5"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground">
          <span className="truncate text-foreground/80">
            {localizeProgramShortName(season.programId, locale)}{" "}
            {localizeSeason(season, locale).label}
          </span>
          <span className="font-lat shrink-0">
            {fill(dict.season.episodeAired, {
              date: formatEpisodeDate(episode.airDate, locale),
            })}
          </span>
        </span>
        <span className="mt-1.5 block text-[16px] leading-[1.4] font-bold tracking-[-0.02em] break-keep lg:text-[17px]">
          {episode.title}
        </span>
        {excerpt && (
          <span className="mt-1 line-clamp-2 text-[13.5px] leading-[1.65] break-keep text-muted-foreground [overflow-wrap:anywhere]">
            {excerpt}
          </span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
    </Link>
  );
}
