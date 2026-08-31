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
  /**
   * 기수·시즌 번호. 화면에 보이는 라벨("20기"·"시즌 4")은 저장하지 않고
   * 프로그램별로 사전이 만든다 — 프로그램마다 부르는 말이 다르기 때문이다.
   * 정렬도 이 값을 본다.
   */
  number: number;
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
  /** 한국어 원문. 다른 언어 이름은 사전의 `site.programs` 가 갖는다. */
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

/** 사이트 전체 집계. 키 이름은 사전의 자리표시자(`{seasons}`·`{people}`·`{found}`)와 맞춰 둔다. */
export type Totals = { seasons: number; people: number; found: number };

/**
 * 홈 머리글과 홈 OG 카드가 같은 숫자를 말하게 한다.
 *
 * 두 곳에서 각자 세던 것을 모았다 — 공유 카드는 눌러서 도착할 화면을 미리
 * 보여 주는 것이라, 숫자가 어긋나면 카드가 그 페이지에 대해 거짓말을 한다.
 */
export function getTotals(seasons: Season[]): Totals {
  return seasons.reduce<Totals>(
    (acc, season) => {
      const coverage = getCoverage(season.cast);
      return {
        seasons: acc.seasons + 1,
        people: acc.people + coverage.total,
        found: acc.found + coverage.found,
      };
    },
    { seasons: 0, people: 0, found: 0 },
  );
}

/** 사이트 전체 집계. 키 이름은 홈 사전의 자리표시자(`{programs}`)와 맞춰 둔다. */
export type SiteTotals = { programs: number; people: number; found: number };

/** 홈 머리글과 홈 OG 카드가 같은 숫자를 말하게 한다 — `getTotals` 와 같은 이유다. */
export function getSiteTotals(programs: Program[]): SiteTotals {
  return programs.reduce<SiteTotals>(
    (acc, program) => {
      const totals = getTotals(program.seasons);
      return {
        programs: acc.programs + 1,
        people: acc.people + totals.people,
        found: acc.found + totals.found,
      };
    },
    { programs: 0, people: 0, found: 0 },
  );
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
  /** 화면에 안 나오고 검색만 훑는 글자. 번역된 화면에서 원문(한글)을 받는 자리다. */
  keywords?: string;
};

export type IndexedSeason = {
  id: string;
  /** 결과 줄이 어느 프로그램의 시즌으로 이동할지 정한다. */
  programId: string;
  /**
   * 여러 프로그램을 한 인덱스에 담았을 때만 채운다 — 홈 검색의 결과 줄이
   * 프로그램을 밝히는 자리다. 프로그램 화면의 인덱스는 한 프로그램뿐이라
   * 매 줄에 같은 이름을 반복할 이유가 없어서 비운다.
   */
  programName?: string;
  label: string;
  special?: string;
  /** "4 / 14 확인" 처럼 이미 그 화면 언어로 만들어 둔 문구. 검색은 클라이언트라 사전을 못 본다. */
  coverage: string;
  /** 화면에 안 나오고 검색만 훑는 글자. 번역된 화면에서 원문(한글)을 받는 자리다. */
  keywords?: string;
  cast: IndexedMember[];
};

export type SearchIndex = IndexedSeason[];

/** 사람 결과는 어느 기수인지까지 알아야 이동할 곳이 정해진다. */
export type MemberHit = {
  member: IndexedMember;
  programId: string;
  seasonId: string;
  seasonLabel: string;
};

export type SearchResults = {
  seasons: IndexedSeason[];
  members: MemberHit[];
  /** 사람 결과가 상한에 걸려 잘렸다. 화면에서 좁히는 법을 안내한다. */
  membersTruncated: boolean;
};
