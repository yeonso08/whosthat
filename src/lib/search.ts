/**
 * 기수와 출연진을 한 번에 찾는다.
 *
 * 퍼지 매칭을 쓰지 않는다. 가명이 14개뿐이라 오타를 관대하게 봐 주면 "영수"
 * 질의에 "영식"·"영철"까지 딸려 와 26개짜리 결과가 78개가 된다. 여기서는
 * **모든 토큰이 그대로 들어 있는지**만 본다 — 결과가 왜 나왔는지 설명 가능한
 * 쪽이 낫다.
 */

import type {
  IndexedSeason,
  MemberHit,
  SearchIndex,
  SearchResults,
} from "./types";

/** 기수 결과의 상한. 아래 사람 결과가 화면 밖으로 밀리지 않게 끊는다. */
const MAX_SEASONS = 8;

/**
 * 가명 하나는 26개 기수에 걸쳐 있다. 다 그리면 스크롤만 길어지므로 끊고,
 * 대신 "기수를 같이 치라"고 안내한다 — 그게 이 검색을 제대로 쓰는 법이다.
 */
const MAX_MEMBERS = 24;

export function search(index: SearchIndex, query: string): SearchResults {
  const tokens = tokenize(query);

  // 빈 질의는 결과가 없는 게 맞다. 그때 화면에 남는 건 검색 결과가 아니라
  // 원래의 기수 목록이고, 그건 `SeasonSearch` 가 children 으로 들고 있다.
  if (tokens.length === 0) {
    return { seasons: [], members: [], membersTruncated: false };
  }

  const seasons: IndexedSeason[] = [];
  const members: MemberHit[] = [];

  for (const season of index) {
    // 프로그램·기수 이름을 사람 쪽 건초더미에도 넣는 게 "22기 영수" 와
    // "솔로지옥 시즌 4" 를 받는 유일한 장치다. 질의에서 그 토큰을 따로 골라내는
    // 특수 처리가 필요 없어진다.
    const seasonText = `${season.programName ?? ""} ${season.label} ${season.special ?? ""} ${season.keywords ?? ""}`;
    if (matches(seasonText, tokens)) seasons.push(season);

    for (const member of season.cast) {
      const text = `${seasonText} ${member.alias} ${member.keywords ?? ""} ${member.name ?? ""} ${member.handle ?? ""}`;
      if (matches(text, tokens)) {
        members.push({
          member,
          programId: season.programId,
          seasonId: season.id,
          seasonLabel: season.label,
        });
      }
    }
  }

  // 계정을 찾아 둔 사람이 이 사이트에 온 이유다. 같은 가명 26명 중 그 둘이
  // 스크롤 아래 묻히지 않게 위로 올린다. sort 가 안정 정렬이라 나머지는
  // 인덱스 순서(최신 기수 → 로스터 순)를 그대로 지킨다.
  members.sort(
    (a, b) =>
      Number(b.member.status === "found") -
      Number(a.member.status === "found"),
  );

  return {
    seasons: seasons.slice(0, MAX_SEASONS),
    members: members.slice(0, MAX_MEMBERS),
    membersTruncated: members.length > MAX_MEMBERS,
  };
}

/** "22기 영수" → ["22기", "영수"]. 빈 질의는 빈 배열이다. */
function tokenize(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function matches(text: string, tokens: string[]): boolean {
  const haystack = text.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}
