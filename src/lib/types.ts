/** 계정 확인 상태. PLANNING.md 의 verified/lastVerified 를 화면에서 쓰는 형태로 좁힌 것. */
export type AccountStatus =
  /** 계정을 찾아서 확인까지 마쳤다. instagramHandle 이 반드시 있다. */
  | "found"
  /** 찾아봤고, 계정이 없다는 것까지 확인했다. */
  | "none"
  /** 아직 못 찾았다. 제보를 받는 상태. */
  | "searching";

export type CastMember = {
  id: string;
  /** 실명. 공개된 경우에만 채운다 — 모르면 비워 두고 가명으로만 보여준다. */
  name?: string;
  /** 방송에서 쓰는 가명. 영수·정숙·옥순처럼 기수마다 반복되는 고정 이름. */
  alias: string;
  gender: "male" | "female";
  occupation?: string;
  /** 방영 당시 나이. */
  ageAtAiring?: number;
  /** /public 아래 경로. 없으면 화면에서 가명 배지가 대신 나온다. */
  profileImageUrl?: string;
  status: AccountStatus;
  /** status 가 "found" 일 때만 채운다. @ 없이 핸들만. */
  instagramHandle?: string;
  /** 마지막으로 확인한 날짜 (YYYY-MM-DD). "searching" 이면 없다. */
  lastVerified?: string;
  /** 어떻게 확인했는지. 직접 검색 / 제보 등. */
  source?: string;
};

export type Season = {
  id: string;
  programId: string;
  /** 예: "20기" */
  label: string;
  /** 예: "2024-08". 확인 못 한 기수는 빈 문자열로 두고 화면에서 생략한다. */
  airDate: string;
  /** 예: "3차 모태솔로 특집". 특집이 아닌 기수는 없다. */
  special?: string;
  onAir: boolean;
  /**
   * 출연진 명단. 인원 구성을 확인하지 못한 기수는 빈 배열로 둔다 —
   * 6:6 이 아닌 기수가 있어서 기본 로스터를 찍어 넣으면 없는 사람을 만들게 된다.
   */
  cast: CastMember[];
};

export type Program = {
  id: string;
  name: string;
  type: string;
  platform: string;
  seasons: Season[];
};

/** 한 기수의 계정 확인 현황. 목록·상세 양쪽에서 같은 계산을 쓰려고 뽑아 둔다. */
export type Coverage = Record<AccountStatus, number> & { total: number };

export function getCoverage(cast: CastMember[]): Coverage {
  // AccountStatus 에 상태가 늘면 이 리터럴에서 컴파일 에러가 난다.
  // 새 상태가 어디에도 안 세어진 채 조용히 지나가는 걸 막는 장치다.
  const byStatus: Record<AccountStatus, number> = {
    found: 0,
    none: 0,
    searching: 0,
  };

  for (const member of cast) {
    byStatus[member.status] += 1;
  }

  return { ...byStatus, total: cast.length };
}

/**
 * "4 / 14 확인". 명단을 아직 못 채운 기수는 개수 대신 그 사실을 적는다 —
 * "0 / 0 확인"은 아무도 못 찾았다는 뜻으로 읽혀서 사실과 다르다.
 */
export function formatCoverage(coverage: Coverage): string {
  if (coverage.total === 0) return "명단 정리 중";
  return `${coverage.found} / ${coverage.total} 확인`;
}

/**
 * 검색이 훑는 최소 데이터.
 *
 * 이 인덱스는 통째로 클라이언트에 실려 나간다 — 원본 JSON(56KB)을 그대로
 * 내려보내지 않으려고 화면에 쓰는 필드만 남긴 것이다. `source`·`lastVerified`
 * 같은 근거 자료는 기수 상세에서만 필요하므로 여기 넣지 않는다.
 */
export type IndexedMember = {
  id: string;
  alias: string;
  name?: string;
  status: AccountStatus;
  /** CastMember.instagramHandle 과 같은 값. 결과 줄에 핸들을 보여주려고 싣는다. */
  handle?: string;
};

export type IndexedSeason = {
  id: string;
  label: string;
  special?: string;
  /** 결과 줄에 "12명 중 3명" 을 적으려고 미리 센다. 화면마다 다시 세지 않는다. */
  coverage: Coverage;
  cast: IndexedMember[];
};

export type SearchIndex = IndexedSeason[];

/** 사람 결과는 어느 기수인지까지 알아야 이동할 곳이 정해진다. */
export type MemberHit = {
  member: IndexedMember;
  seasonId: string;
  seasonLabel: string;
};

export type SearchResults = {
  seasons: IndexedSeason[];
  members: MemberHit[];
  /** 사람 결과가 상한에 걸려 잘렸다. 화면에서 좁히는 법을 안내한다. */
  membersTruncated: boolean;
};
