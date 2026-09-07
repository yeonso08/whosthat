import { cache } from "react";
import {
  formatCoverage,
  hasProgramStrings,
  localizeAlias,
  localizeProgramName,
  localizeSeasonLabel,
  localizeSpecial,
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
 * **이 fetch 는 방문자 요청마다 돌지 않는다.** `force-cache` 라서 빌드할 때 한 번
 * 굽고, 그 뒤로는 관리자가 저장해서 `revalidateTag` 가 걸릴 때만 다시 부른다
 * (`app/api/revalidate/route.ts`). 그래서 OCI 프리티어 서버가 방문자 트래픽을
 * 받지 않고, 그 서버가 멈춰도 이미 구워진 페이지는 멀쩡히 서빙된다.
 */
const API_URL = process.env.NUKKO_API_URL ?? "http://127.0.0.1:8000";

/** 이 태그 하나가 전 페이지의 데이터 캐시를 가리킨다 — 저장되면 이걸 무효화한다. */
export const DATA_TAG = "nukko-data";

/**
 * `cache()` 는 한 번의 렌더 안에서만 메모한다. 여러 렌더에 걸친 재사용은 위
 * fetch 의 데이터 캐시가 맡는다 — 둘은 층이 다르다.
 *
 * **배열 순서가 홈 목록 순서다.** 백엔드가 `sort_order` 로 정렬해서 준다.
 */
export const getPrograms = cache(async (): Promise<Program[]> => {
  const response = await fetch(`${API_URL}/programs`, {
    cache: "force-cache",
    next: { tags: [DATA_TAG] },
  });

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
   * **사전에 문구가 없는 프로그램은 화면까지 보내지 않는다.**
   *
   * 관리자 화면에서 프로그램을 만들면 DB 에는 바로 생기지만, 화면에 쓸
   * 이름·기수 라벨은 사전(코드)에 있어서 배포 전까지 없다. 예전에는 그 상태로
   * 화면까지 흘러가 `programStrings` 가 던졌는데, **그러면 이미 떠 있는 홈이
   * 500 이 됐다**(실제로 재현해서 확인했다). 번역 하나가 없다고 사이트를
   * 내리는 건 어느 CMS 도 하지 않는 동작이다.
   *
   * 그래서 여기서 조용히 빼고 경고만 남긴다 — 사이트는 살아 있고, 잘못된
   * 제목(`singles-inferno`)이 나가지도 않는다. 사전에 문구를 넣고 배포하면
   * 저절로 나타난다.
   *
   * 경고를 남기는 건 **오타로 진짜 프로그램이 사라지는 경우**를 잡기 위해서다
   * — 빌드 로그에 뜬다.
   */
  return programs.filter((program) => {
    if (hasProgramStrings(program.id)) return true;
    console.warn(
      `[nukko] 사전에 문구가 없어 화면에서 제외합니다: ${program.id}` +
        ` — src/dictionaries/{ko,en,ja}.json 의 site.programs 에 추가하세요.`,
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
    const response = await fetch(`${API_URL}/translations`, {
      cache: "force-cache",
      next: { tags: [DATA_TAG] },
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

  return programs.flatMap((current) => {
    const programName = localizeProgramName(current.id, locale);

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
        cast: season.cast.map((member) => ({
          id: member.id,
          alias: localizeAlias(member.alias, locale),
          ...(member.name ? { name: member.name } : {}),
          ...(locale === "ko" ? {} : { keywords: member.alias }),
          status: member.status,
          ...(member.instagramHandle ? { handle: member.instagramHandle } : {}),
        })),
      };
    });
  });
}
