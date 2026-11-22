/**
 * 시청자 투표의 집계·표기. 투표 상자가 클라이언트 컴포넌트라 이 파일은 사전도 데이터도
 * 읽지 않는다(`search.ts` 와 같은 이유 — 읽으면 클라이언트 번들에 딸려 간다).
 */
import type { Episode, Season, VoteCandidate, VoteResults } from "@/lib/types";

/**
 * 시청자 투표를 거는 프로그램. 솔로남·솔로녀 여럿이 한 회차에 나오는 쪽만이다 — 계약결혼은
 * 두 쌍뿐이라 고를 게 없고, 솔로지옥은 회차 글이 없다.
 */
export const VOTE_PROGRAMS: readonly string[] = ["i-am-solo", "i-am-solo-love-goes-on"];

/**
 * 지금 투표가 열려 있을 수 있는 회차 — 투표하는 프로그램의 방영 중 기수, 그 마지막 회차.
 * 정적 페이지가 칩·줄을 걸지 정하는 기준이고, 실제로 열렸는지(마감)는 API 가 정한다.
 */
export function votableEpisode(programId: string, season: Season): Episode | undefined {
  if (!VOTE_PROGRAMS.includes(programId) || !season.onAir) return undefined;
  return season.episodes?.at(-1);
}

const VOTE_WINDOW_DAYS = 7;
const VOTE_CLOSE_TIME = "22:00:00";

/**
 * 투표가 닫히는 때 — 방송일 + 7일 밤 10시(KST). **API(`votes.py` 의 `_closes_at`)와 같은 규칙이다**
 * — 화면이 API 답을 기다리지 않고 투표함·마감 안내를 바로 그리려고 여기도 셈한다. 어긋나도
 * 막는 건 API 라 표가 잘못 들어가지는 않고, 답이 오면 화면이 API 값으로 바뀐다.
 */
export function voteClosesAt(airDate: string): string {
  const day = new Date(`${airDate}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + VOTE_WINDOW_DAYS);
  return `${day.toISOString().slice(0, 10)}T${VOTE_CLOSE_TIME}+09:00`;
}

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
