import { cache } from "react";
import {
  formatCoverage,
  hasProgramStrings,
  localizeAlias,
  localizeProgramName,
  localizeProgramShortName,
  localizeSeasonLabel,
  localizeSpecial,
  programStrings,
  type Locale,
} from "./i18n";
import { registerProgramStrings } from "./program-strings";
import { registerTranslations } from "./translations";
import {
  getCoverage,
  type Program,
  type SearchIndex,
  type Season,
} from "./types";

/**
 * 데이터를 읽어 오는 유일한 파일. 예전에는 `@/data/*.json` 을 직접 import 했고,
 * 지금은 관리자 백엔드(FastAPI)를 부른다 — 고칠 곳을 이 파일 하나로 묶어 둔
 * 덕분에 옮기는 비용이 여기서 끝났다(`CLAUDE.md` 의 의존 방향 규칙).
 *
 * **이 fetch 는 빌드할 때만 돈다.** 관리자가 저장하면 백엔드가 Vercel Deploy
 * Hook 을 불러 사이트를 통째로 다시 빌드한다(2026-09-22). 방문자 요청은 구워 둔
 * 페이지만 받으므로 OCI 프리티어 서버가 방문자 트래픽을 안 받고, 빌드 중에 API 가
 * 죽으면 빌드가 실패해 **이전 사이트가 그대로 남는다** — 방문자가 에러 화면을 볼
 * 경로가 없다.
 */
const API_URL = process.env.NUKKO_API_URL ?? "http://127.0.0.1:8000";

/**
 * 응답 캐시의 키를 배포마다 바꾼다. **Vercel 의 데이터 캐시는 배포를 넘어 살아남아서**
 * (문서: "Persistent across deployments") 같은 URL 이면 새 빌드가 옛 응답을 그대로
 * 굽는다 — 저장해서 다시 빌드했는데 화면이 안 바뀌는 상태다. 배포 ID 를 붙이면 배포당
 * API 를 한 번 새로 부르고, 그 배포 안의 페이지 144개는 그 한 번을 나눠 쓴다.
 * 로컬에는 배포 ID 가 없어서 **이 모듈이 올라온 시각**을 쓴다. 고정값("local")이던
 * 때는 DB 를 고쳐도 로컬 화면이 옛 응답을 계속 보였다(dev 서버가 메모리에도 들고
 * 있어서 `.next/cache` 를 지워도 안 풀렸다). 서버를 켤 때마다·이 파일이 다시 올라올
 * 때마다 새로 받는다.
 */
const DATA_VERSION = process.env.VERCEL_DEPLOYMENT_ID ?? `local-${Date.now()}`;

function apiUrl(path: string): string {
  return `${API_URL}${path}?v=${encodeURIComponent(DATA_VERSION)}`;
}

/**
 * `cache()` 는 한 번의 렌더 안에서만 메모한다. 여러 렌더에 걸친 재사용은 위
 * fetch 의 데이터 캐시가 맡는다 — 둘은 층이 다르다.
 *
 * **배열 순서가 홈 목록 순서다.** 백엔드가 `sort_order` 로 정렬해서 준다.
 */
export const getPrograms = cache(async (): Promise<Program[]> => {
  const response = await fetch(apiUrl("/programs"), { cache: "force-cache" });

  // 여기서 던지면 빌드가 깨진다 — 그게 맞다. 명단을 통째로 잃은 화면을
  // 조용히 배포하는 것보다, 데이터를 못 읽었다는 사실이 드러나는 편이 낫다.
  if (!response.ok) {
    throw new Error(`데이터를 못 읽었습니다 (${API_URL}: ${response.status})`);
  }

  const programs: Program[] = await response.json();

  // 번역표도 여기서 함께 받는다 — 화면이 두 번 부르는 걸 기억하지 않아도 되게.
  await getTranslations();

  // 화면 곳곳이 programId 만 들고 문구를 찾는다 — 데이터를 읽는 이 자리에서
  // 넣어 두면 그 함수들의 시그니처를 안 바꿔도 된다(`program-strings.ts`).
  registerProgramStrings(programs);

  /**
   * **화면 문구가 없는 프로그램은 화면까지 보내지 않는다.**
   *
   * 관리자에서 프로그램을 만들고 문구를 아직 안 채운 상태다. 예전에는 그대로
   * 흘러가 `programStrings` 가 던졌는데, **그러면 이미 떠 있는 홈이 500 이
   * 됐다**(재현해서 확인했다). 번역 하나가 없다고 사이트를 내리는 건 어느
   * CMS 도 하지 않는 동작이다.
   *
   * 그래서 조용히 빼고 경고만 남긴다 — 사이트는 살아 있고, 잘못된 제목
   * (`singles-inferno`)이 나가지도 않는다. 관리자에서 문구를 채우면 저절로
   * 나타난다.
   *
   * 경고를 남기는 건 **오타로 진짜 프로그램이 사라지는 경우**를 잡기 위해서다
   * — 빌드 로그에 뜬다.
   */
  return programs.filter((program) => {
    if (hasProgramStrings(program.id)) return true;
    console.warn(
      `[nukko] 화면 문구가 없어 제외합니다: ${program.id}` +
        ` — 관리자(admin.nukko.net)의 프로그램 화면에서 "문구" 를 채우세요.`,
    );
    return false;
  });
});

/**
 * 이름·특집 번역표. 프로그램에 딸린 게 아니라 사이트 전체가 공유하므로 따로
 * 받는다 — "영수" 는 33명이 함께 쓰고 프로그램도 가로지른다.
 *
 * **못 읽어도 던지지 않는다.** 번역이 없으면 한국어 원문으로 뜨는데, 그건
 * 화면이 깨진 게 아니라 "아직 번역 안 됨" 이다. 명단을 못 읽는 것과 성격이
 * 다르므로 빌드를 세우지 않는다.
 */
export const getTranslations = cache(async (): Promise<void> => {
  try {
    const response = await fetch(apiUrl("/translations"), {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(String(response.status));
    registerTranslations(await response.json());
  } catch (error) {
    console.warn("[nukko] 번역표를 못 읽었습니다 — 한국어 원문으로 뜹니다.", error);
  }
});

export async function getProgram(id: string): Promise<Program | undefined> {
  return (await getPrograms()).find((program) => program.id === id);
}

/**
 * 최신 기수부터. 받은 순서를 그대로 믿지 않고 번호로 정렬한다.
 *
 * 프로그램 객체를 받아 정렬만 하므로 여기는 계속 동기다 — 데이터를 가지러
 * 가는 함수만 async 다.
 */
export function getSeasons(program: Program): Season[] {
  return [...program.seasons].sort((a, b) => b.number - a.number);
}

export async function getSeason(
  programId: string,
  seasonId: string,
): Promise<Season | undefined> {
  return (await getProgram(programId))?.seasons.find((s) => s.id === seasonId);
}

/**
 * 같은 프로그램에서 바로 앞 기수. 방영 중인 기수 화면이 이리로 이어 준다 —
 * 그 기수를 찾아 온 사람은 대개 앞 기수도 본 사람이다.
 */
export function getPreviousSeason(
  program: Program,
  season: Season,
): Season | undefined {
  return getSeasons(program).find((s) => s.number < season.number);
}

/** 모든 프로그램의 기수를 한 줄로. sitemap 과 정적 생성이 같은 목록을 본다. */
export async function getAllSeasons(): Promise<Season[]> {
  return (await getPrograms()).flatMap(getSeasons);
}

/**
 * 지금 방영 중인 기수들. 홈이 착지하자마자 이걸 한 줄로 세운다.
 *
 * 프로그램을 가로질러 모으는 집계라 페이지가 아니라 여기 있다 — 홈에서
 * `getPrograms().flatMap(...).filter(...)` 를 다시 적으면 프로그램이 늘 때마다
 * 그 줄이 같이 늘어난다.
 */
export async function getAiringSeasons(): Promise<Season[]> {
  return (await getAllSeasons()).filter((season) => season.onAir);
}

/**
 * 검색이 훑을 최소 데이터. 서버에서 한 번 만들어 클라이언트로 넘긴다.
 *
 * `program` 을 주면 그 프로그램만, 안 주면 전부 담는다 — 홈은 전부, 프로그램
 * 화면은 자기 것만 본다. 여러 프로그램을 담을 때만 결과 줄에 프로그램 이름이
 * 붙는다(`programName`).
 *
 * 이 함수가 `search.ts` 가 아니라 여기 있는 이유: 클라이언트 컴포넌트가
 * 검색 모듈을 import 하는데, 그 모듈이 데이터를 읽는 쪽과 한 파일에 있으면
 * 원본이 통째로 클라이언트 번들에 딸려 들어간다.
 */
export async function buildSearchIndex(
  locale: Locale,
  program?: Program,
): Promise<SearchIndex> {
  const programs = program ? [program] : await getPrograms();
  const spansPrograms = programs.length > 1;
  // 프로그램 화면의 인덱스라도 다른 프로그램의 이름은 다 본다 — 계약결혼 화면에서
  // `16기 상철` 로 찾는 사람이 있다.
  const otherNames = otherNamesByPerson(await getPrograms());

  return programs.flatMap((current) => {
    // 결과 줄에는 짧은 이름을 띄운다 — 정식 이름(`나는 솔로, 그 후 사랑은
    // 계속된다`)은 줄 하나를 통째로 먹는다. 정식 이름은 아래 `source` 에 실어
    // 그 이름으로 쳐도 걸리게 한다.
    const programName = localizeProgramShortName(current.id, locale);

    return getSeasons(current).map((season) => {
      const special = season.special
        ? localizeSpecial(season.special, locale)
        : undefined;

      // 번역된 화면에서도 "33기"·"영수" 로 찾히게 원문을 함께 싣는다. 화면에
      // 나오는 건 위의 번역된 값이고, 이 줄은 검색에만 쓰인다 — 한국 커뮤니티에서
      // 본 이름을 그대로 붙여 넣는 사람이 해외 방문자 중에도 있다. 프로그램
      // 이름은 언어와 무관하게 싣는다: 한 인덱스에 프로그램이 둘 이상이면
      // "솔로지옥 시즌 4" 로 좁히는 게 기수를 함께 치는 것과 같은 장치다.
      const source = [
        current.name,
        programStrings(current.id, "ko").shortName ?? "",
        locale === "ko" ? "" : localizeProgramName(current.id, locale),
        locale === "ko" ? "" : localizeSeasonLabel(current.id, season.number, "ko"),
        locale === "ko" ? "" : (season.special ?? ""),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: season.id,
        programId: current.id,
        ...(spansPrograms ? { programName } : {}),
        label: localizeSeasonLabel(current.id, season.number, locale),
        ...(special ? { special } : {}),
        ...(source ? { keywords: source } : {}),
        coverage: formatCoverage(getCoverage(season.cast), locale),
        cast: season.cast.map((member) => {
          // 번역 화면의 한글 원문 + 같은 사람의 다른 출연 이름(`16기 상철`).
          const keywords = [
            locale === "ko" ? "" : member.alias,
            ...(otherNames.get(member.personId) ?? [])
              .filter(
                (other) =>
                  other.key !== `${current.id}/${season.id}/${member.id}`,
              )
              .map((other) => other.text),
          ]
            .filter(Boolean)
            .join(" ");

          return {
            id: member.id,
            alias: localizeAlias(member.alias, locale),
            ...(member.name ? { name: member.name } : {}),
            ...(keywords ? { keywords } : {}),
            status: member.status,
            // 비공개로 돌린 계정의 핸들은 검색에도 싣지 않는다(`AccountStatus`).
            ...(member.status === "found" && member.instagramHandle
              ? { handle: member.instagramHandle }
              : {}),
          };
        }),
      };
    });
  });
}

/**
 * 기수 카드의 "출신" 줄 — 같은 사람(`personId`)이 **먼저 방송된** 다른 출연을
 * `나는 솔로 16기 상철` 처럼 그 화면 언어로 돌려준다. 키는 출연자 id 다.
 *
 * 계약결혼은 실명으로 나와서, 카드만 봐서는 강정환이 16기 상철인지 알 수 없다.
 * 같은 사람인지는 관리자 백엔드가 묶어 준다(2026-11-13, 사람·출연 분리) — 계정을
 * 못 찾은 사람도 이어진다.
 *
 * - **이름이 이미 출신을 말하면 뺀다** — 나솔사계는 지난 출연자를 `16기 상철` 로
 *   부르므로, 그 카드에 `나는 솔로 16기 상철` 을 또 적으면 같은 말이 두 번이다.
 * - 나중 출연은 싣지 않는다. 16기 상철 카드에 계약결혼을 적는 건 "출신" 이 아니라
 *   근황이고, 그건 기수 소개 문단이 날짜와 함께 맡는다.
 * - 방송 연월이 같거나 비어 있으면 앞뒤를 가릴 수 없어서 뺀다.
 */
export async function getEarlierAppearances(
  program: Program,
  season: Season,
  locale: Locale,
): Promise<Record<string, string[]>> {
  const appearances = appearancesByPerson(await getPrograms());
  const result: Record<string, string[]> = {};

  for (const member of season.cast) {
    if (!season.airDate) continue;
    const earlier = (appearances.get(member.personId) ?? []).filter(
      (other) =>
        other.airDate !== "" &&
        other.airDate < season.airDate &&
        member.alias !==
          `${localizeSeasonLabel(other.programId, other.number, "ko")} ${other.alias}`,
    );
    if (earlier.length === 0) continue;

    result[member.id] = earlier.map((other) =>
      [
        localizeProgramShortName(other.programId, locale),
        localizeSeasonLabel(other.programId, other.number, locale),
        localizeAlias(other.alias, locale),
      ].join(" "),
    );
  }
  return result;
}

type Appearance = {
  programId: string;
  seasonId: string;
  memberId: string;
  number: number;
  airDate: string;
  alias: string;
};

/** 사람 → 그 사람의 모든 출연. 방송 순서대로다. */
function appearancesByPerson(programs: Program[]): Map<number, Appearance[]> {
  const byPerson = new Map<number, Appearance[]>();
  for (const program of programs) {
    for (const season of program.seasons) {
      for (const member of season.cast) {
        const entries = byPerson.get(member.personId) ?? [];
        entries.push({
          programId: program.id,
          seasonId: season.id,
          memberId: member.id,
          number: season.number,
          airDate: season.airDate,
          alias: member.alias,
        });
        byPerson.set(member.personId, entries);
      }
    }
  }
  for (const entries of byPerson.values()) {
    entries.sort((a, b) => a.airDate.localeCompare(b.airDate));
  }
  return byPerson;
}

/**
 * 같은 사람의 다른 출연 이름을 검색어로 나눠 갖는다 — `16기 상철` 로 쳐도 계약결혼
 * 강정환 카드가 나오게. 방문자는 먼저 본 프로그램의 이름으로 찾는다. 인덱스에는
 * 한국어 이름(`나는 솔로 32기 영수`)만 실리고 핸들은 안 실린다(비공개 계정 보호).
 */
function otherNamesByPerson(
  programs: Program[],
): Map<number, { key: string; text: string }[]> {
  const result = new Map<number, { key: string; text: string }[]>();
  for (const [personId, appearances] of appearancesByPerson(programs)) {
    if (appearances.length < 2) continue;
    result.set(
      personId,
      appearances.map((a) => {
        const programName = [
          programs.find((p) => p.id === a.programId)?.name ?? "",
          programStrings(a.programId, "ko").shortName ?? "",
        ]
          .filter(Boolean)
          .join(" ");
        return {
          key: `${a.programId}/${a.seasonId}/${a.memberId}`,
          text: `${programName} ${localizeSeasonLabel(a.programId, a.number, "ko")} ${a.alias}`,
        };
      }),
    );
  }
  return result;
}
