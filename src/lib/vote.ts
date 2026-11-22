/**
 * 시청자 투표의 집계·표기. 투표 상자가 클라이언트 컴포넌트라 이 파일은 사전도 데이터도
 * 읽지 않는다(`search.ts` 와 같은 이유 — 읽으면 클라이언트 번들에 딸려 간다).
 */
import type { VoteCandidate, VoteResults } from "@/lib/types";

/**
 * 시청자 투표를 거는 프로그램. 솔로남·솔로녀 여럿이 한 회차에 나오는 쪽만이다 — 계약결혼은
 * 두 쌍뿐이라 고를 게 없고, 솔로지옥은 회차 글이 없다.
 */
export const VOTE_PROGRAMS: readonly string[] = ["i-am-solo", "i-am-solo-love-goes-on"];

/** 마감 시각은 방송 시간대로 적는다 — 해외에서 열어도 "한국 밤 10시" 가 기준이다. */
const VOTE_TIME_ZONE = "Asia/Seoul";

export type RankedCandidate = VoteCandidate & {
  count: number;
  /** 0~100 정수. 합이 100 이 안 될 수 있다(반올림). */
  percent: number;
  /** 같은 표면 같은 등수다. */
  rank: number;
};

/**
 * 한 성별의 순위. **득표 0 인 사람도 전부 싣는다**(사용자 결정 — 순위를 다 보여 준다).
 * 같은 표면 명단 순서(방송 순서)를 지킨다.
 */
export function rankVotes(
  candidates: VoteCandidate[],
  counts: VoteResults["counts"],
): { total: number; ranked: RankedCandidate[] } {
  const total = candidates.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);
  const sorted = candidates
    .map((c, order) => ({ c, order, count: counts[c.id] ?? 0 }))
    .sort((a, b) => b.count - a.count || a.order - b.order);

  const ranked = sorted.map(({ c, count }) => ({
    ...c,
    count,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
    rank: 1 + sorted.filter((other) => other.count > count).length,
  }));
  return { total, ranked };
}

/** `11월 29일 (토) 오후 10시` — 투표 마감. */
export function formatVoteDeadline(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    timeZone: VOTE_TIME_ZONE,
  }).format(new Date(iso));
}
