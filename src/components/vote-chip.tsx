"use client";

import { ChevronRight, Vote } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fill } from "@/lib/template";
import type { VoteCandidate } from "@/lib/types";
import { rankVotes } from "@/lib/vote";
import { episodeVotesQuery } from "@/lib/vote-queries";

type Props = {
  href: string;
  /** `episodeVotesUrl` 이 만든 그 회차의 투표 주소. */
  endpoint: string;
  /** `시청자 투표 중` — 날짜를 넣으면 휴대폰에서 1위 이름이 잘렸다. */
  label: string;
  /** `현재 1위 {names}` */
  leaderTemplate: string;
  candidates: VoteCandidate[];
};

/** 성별 사이 구분. 같은 성별 공동 1위는 `·` 로 잇는다(`영수·영호, 옥순`). */
const GENDER_SEPARATOR = ", ";

/**
 * 투표 화면으로 가는 칩 한 줄 — 방영 중 기수 화면과 회차 글 머리에 건다. 방문자가 착지하는
 * 곳이 거기라 홈 "모아 보기" 줄만으로는 투표가 안 보였다.
 *
 * **처음부터 칩을 그려 둔다**(대개 열려 있다) — 현황을 받은 뒤에 나타나면 머리글이 한 번
 * 밀린다. 받아 보니 닫혔으면 그때 감춘다. 현재 1위는 받은 뒤에 붙는다 — 1위를 보여 주면
 * 궁금해서 누른다.
 *
 * 흑백 칩이다(기수 화면의 특집 칩과 같은 모양) — 기수 화면은 유채색을 쓰지 않는다.
 */
export function VoteChip({ href, endpoint, label, leaderTemplate, candidates }: Props) {
  const { data: results } = useQuery(episodeVotesQuery(endpoint));

  if (results && !results.open) return null;

  const leaders = results
    ? (["male", "female"] as const)
        .map((gender) =>
          rankVotes(
            candidates.filter((c) => c.gender === gender),
            results.counts,
          )
            .ranked.filter((c) => c.rank === 1 && c.count > 0)
            .map((c) => c.alias)
            .join("·"),
        )
        .filter(Boolean)
        .join(GENDER_SEPARATOR)
    : "";

  return (
    <Link
      href={href}
      className="focus-ring press inline-flex max-w-full items-center gap-1.5 rounded-full bg-foreground/[0.07] py-1.5 pr-2.5 pl-3 text-[13px] font-bold text-foreground/85 dark:bg-white/10"
    >
      <Vote aria-hidden className="size-4 shrink-0" />
      <span className="min-w-0 truncate">
        {label}
        {leaders && (
          <span className="font-semibold text-foreground/60">
            {" · "}
            {fill(leaderTemplate, { names: leaders })}
          </span>
        )}
      </span>
      <ChevronRight aria-hidden className="size-4 shrink-0 text-foreground/50" />
    </Link>
  );
}
