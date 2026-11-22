"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/template";
import type { VoteCandidate } from "@/lib/types";
import { rankVotes } from "@/lib/vote";
import { programVotesQuery } from "@/lib/vote-queries";

export type VoteHistorySeason = {
  id: string;
  label: string;
  candidates: VoteCandidate[];
  /** 최신 회차부터. */
  episodes: { airDate: string; dateLabel: string; title: string; href: string }[];
  /** `영철♥정숙`. 최종 선택이 아직이면 undefined, 커플이 없으면 빈 배열. */
  finalCouples?: [string, string][];
};

type Props = {
  endpoint: string;
  /** 최신 기수부터. */
  seasons: VoteHistorySeason[];
  strings: Dictionary["vote"] & Pick<Dictionary["episodeVote"], "votes">;
};

const TONE = { male: "text-he", female: "text-she" } as const;

/**
 * 투표 화면의 "회차별 결과" — 기수마다 회차별 솔로남·솔로녀 1위, 그리고 실제 최종 선택.
 * 시청자가 고른 사람과 방송의 결말을 한 판에서 나란히 보게 하는 게 이 화면의 재미다.
 *
 * 표가 쌓인 기수·회차만 그린다. API 가 안 되면 빈 안내 한 줄이다. 투표함에서 표를 넣으면
 * 같은 화면의 이 결과도 함께 바뀐다(`vote-queries.ts`).
 */
export function VoteHistory({ endpoint, seasons, strings }: Props) {
  // 투표함에서 한 표를 넣으면 이 쿼리도 무효화돼 다시 불린다(새로고침 없이 바뀐다).
  const { data: votes, isError: failed } = useQuery(programVotesQuery(endpoint));

  if (!votes && !failed) return null;

  const shown = seasons
    .map((season) => ({
      season,
      episodes: season.episodes.filter((e) => votes?.[season.id]?.[e.airDate]),
    }))
    .filter(({ episodes }) => episodes.length > 0);

  if (shown.length === 0) {
    return <p className="text-[14px] text-muted-foreground">{strings.historyEmpty}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {shown.map(({ season, episodes }) => (
        <section key={season.id} className="overflow-hidden rounded-[22px] bg-card shadow-soft">
          <h3 className="bg-linear-to-r from-he-soft to-she-soft px-5 pt-4 pb-3.5 text-[17px] font-bold tracking-[-0.02em]">
            {season.label}
          </h3>
          <ol className="divide-y divide-border px-5 py-1.5">
            {episodes.map((episode) => {
              const counts = votes?.[season.id]?.[episode.airDate] ?? {};
              return (
                <li key={episode.airDate} className="py-3">
                  <Link href={episode.href} className="focus-ring group block">
                    <span className="font-lat text-[12.5px] font-semibold text-muted-foreground">
                      {episode.dateLabel}
                    </span>
                    <span className="ml-2 text-[14px] text-foreground/80 group-hover:underline">
                      {episode.title}
                    </span>
                  </Link>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(["male", "female"] as const).map((gender) => (
                      <Top
                        key={gender}
                        label={gender === "male" ? strings.topMale : strings.topFemale}
                        tone={TONE[gender]}
                        candidates={season.candidates.filter((c) => c.gender === gender)}
                        counts={counts}
                        strings={strings}
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="border-t border-border px-5 py-3.5 text-[14px] break-keep">
            <span className="mr-2 font-bold">{strings.finalLabel}</span>
            {season.finalCouples === undefined ? (
              <span className="text-muted-foreground">{strings.finalPending}</span>
            ) : season.finalCouples.length === 0 ? (
              <span className="text-muted-foreground">{strings.finalNone}</span>
            ) : (
              season.finalCouples.map(([man, woman], i) => (
                <span key={man} className="font-semibold">
                  {i > 0 && <span className="text-muted-foreground">, </span>}
                  <span className={TONE.male}>{man}</span>
                  <span className="px-0.5 text-couple">♥</span>
                  <span className={TONE.female}>{woman}</span>
                </span>
              ))
            )}
          </p>
        </section>
      ))}
    </div>
  );
}

/** 한 성별의 1위. 같은 표면 함께 적는다(`영수·영호`). */
function Top({
  label,
  tone,
  candidates,
  counts,
  strings,
}: {
  label: string;
  tone: string;
  candidates: VoteCandidate[];
  counts: Record<string, number>;
  strings: Props["strings"];
}) {
  const { total, ranked } = rankVotes(candidates, counts);
  const winners = ranked.filter((c) => c.rank === 1 && c.count > 0);

  return (
    <div className="rounded-xl bg-elevated px-3 py-2">
      <div className="text-[12px] font-semibold text-muted-foreground">{label}</div>
      {total === 0 || winners.length === 0 ? (
        <div className="text-[14px] text-muted-foreground">{strings.none}</div>
      ) : (
        <div className="text-[15px] font-bold">
          <span className={tone}>{winners.map((w) => w.alias).join("·")}</span>
          <span className="font-lat ml-1.5 text-[12.5px] font-semibold text-foreground/60">
            {winners[0].percent}% · {fill(strings.votes, { count: winners[0].count })}
          </span>
        </div>
      )}
    </div>
  );
}
