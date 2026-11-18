import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FoldList } from "@/components/fold-list";
import { LiveDot } from "@/components/live-dot";
import {
  currentLocale,
  fill,
  formatEpisodeDate,
  getDictionary,
  localizeSeason,
} from "@/lib/i18n";
import { episodeHref, seasonHref } from "@/lib/links";
import type { Episode, Season } from "@/lib/types";

type Props = { season: Season };

/**
 * 판에 바로 펼쳐 두는 회차 수. 기수 하나가 열다섯 편까지 가서 다 펼치면 판 키가
 * 다섯 배씩 차이 나 격자가 들쭉날쭉해진다. 나머지는 접어 두되 HTML 에는 남긴다
 * (`FoldList` — 크롤러가 모든 글로 가는 링크를 받아야 한다).
 */
const SHOWN_EPISODES = 4;

/**
 * 회차별 정리 모음의 한 판 — 한 기수와 그 기수의 회차 글(최신부터).
 *
 * 판 머리는 그 기수 화면으로, 줄은 그 회차 글로 간다. 줄 모양은 글 페이지 아래
 * "다른 회차" 와 같다 — 날짜 + 제목 한 줄이다.
 */
export async function EpisodeSeasonCard({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const { label, special, airDate } = localizeSeason(season, locale);
  const detail = [special, airDate].filter(Boolean).join(" · ");
  const episodes = [...(season.episodes ?? [])].reverse();
  const count = (n: number) =>
    fill(n === 1 ? dict.episodes.countOne : dict.episodes.count, { count: n });

  return (
    // 높이를 줄에 맞추지 않는다(`h-full` 없음) — 한 판을 펼치면 같은 줄의 판까지
    // 늘어나 빈 판이 됐다. 접힌 판은 줄 수가 같아 대부분 키가 같다.
    <article className="flex flex-col rounded-2xl bg-card p-5 shadow-soft">
      <Link
        href={seasonHref(locale, season.programId, season.id)}
        className="focus-ring group -m-1 flex items-start gap-3 rounded-lg p-1"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[18px] leading-[1.3] font-bold tracking-[-0.02em] break-keep">
            {label}
            {season.onAir && <LiveDot />}
          </span>
          {detail && (
            <span className="font-lat mt-0.5 block text-[12px] leading-[1.45] break-keep text-muted-foreground">
              {detail}
            </span>
          )}
        </span>
        <span className="font-lat flex shrink-0 items-center gap-0.5 pt-1 text-[12px] font-semibold text-muted-foreground">
          {count(episodes.length)}
          <ChevronRight className="size-4 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
        </span>
      </Link>

      <div className="mt-4 border-t border-border/60">
        <FoldList
          shown={SHOWN_EPISODES}
          items={episodes.map((episode) => (
            <EpisodeLine key={episode.id} season={season} episode={episode} />
          ))}
          text={{
            more: fill(dict.episodes.more, {
              count: Math.max(episodes.length - SHOWN_EPISODES, 0),
            }),
            less: dict.episodes.less,
          }}
        />
      </div>
    </article>
  );
}

async function EpisodeLine({ season, episode }: { season: Season; episode: Episode }) {
  const locale = await currentLocale();

  return (
    <Link
      href={episodeHref(locale, season.programId, season.id, episode.airDate)}
      className="focus-ring group flex gap-2.5 py-2.5 text-[14.5px] leading-[1.55] break-keep"
    >
      <span className="font-lat w-[60px] shrink-0 pt-px whitespace-nowrap text-[12.5px] font-semibold text-muted-foreground">
        {formatEpisodeDate(episode.airDate, locale)}
      </span>
      <span className="min-w-0 flex-1 text-foreground/85 group-hover:text-foreground">
        {episode.title}
      </span>
    </Link>
  );
}
