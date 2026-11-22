/**
 * 시청자 투표를 브라우저에서 부르는 쿼리 정의 — 키와 불러오기를 한 곳에 둔다. 칩·투표함·
 * 회차별 결과가 같은 키를 쓰므로 같은 현황은 한 번만 부르고, 투표 뒤에는 `VOTE_QUERY_ROOT`
 * 아래를 통째로 다시 부르게 하면 화면의 모든 현황이 함께 바뀐다.
 *
 * 클라이언트 번들로 가는 파일이라 사전도 데이터도 읽지 않는다.
 */
import { queryOptions } from "@tanstack/react-query";
import type { ProgramVotes, VoteResults } from "@/lib/types";

/** 투표 쿼리 키의 첫 칸. 무효화할 때 이 아래를 다 잡는다. */
export const VOTE_QUERY_ROOT = "votes";

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<T>;
}

/** 한 회차의 현황. 주소는 `episodeVotesUrl` 이 만든다. */
export function episodeVotesQuery(endpoint: string) {
  return queryOptions({
    queryKey: [VOTE_QUERY_ROOT, "episode", endpoint],
    queryFn: ({ signal }) => getJson<VoteResults>(endpoint, signal),
  });
}

/** 한 프로그램의 회차별 득표. 주소는 `programVotesUrl` 이 만든다. */
export function programVotesQuery(endpoint: string) {
  return queryOptions({
    queryKey: [VOTE_QUERY_ROOT, "program", endpoint],
    queryFn: ({ signal }) => getJson<ProgramVotes>(endpoint, signal),
  });
}

/** 한 표를 넣는다. 응답은 넣은 뒤의 현황이다. */
export async function postVote(endpoint: string, memberId: string, voter: string): Promise<VoteResults> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, voter }),
  });
  if (!response.ok) throw new Error(`${response.status} ${endpoint}`);
  return response.json() as Promise<VoteResults>;
}
