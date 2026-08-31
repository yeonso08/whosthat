import iAmSoloJson from "@/data/i-am-solo.json";
import singlesInfernoJson from "@/data/singles-inferno.json";
import {
  formatCoverage,
  localizeAlias,
  localizeProgramName,
  localizeSeasonLabel,
  localizeSpecial,
  type Locale,
} from "./i18n";
import {
  getCoverage,
  type Program,
  type SearchIndex,
  type Season,
} from "./types";

/**
 * 이 사이트가 아는 프로그램. **배열 순서가 홈 목록 순서다** — 기수처럼 번호로
 * 정렬할 수 있는 값이 없어서, 무엇을 먼저 보여 줄지는 여기서 손으로 정한다.
 *
 * 출연진 JSON 을 직접 import 하는 파일은 계속 이 파일 하나여야 한다(제보 기능에서
 * DB 로 갈아탈 때 고칠 곳을 하나로 묶어 두는 장치다 — `CLAUDE.md` 의 의존 방향).
 */
const PROGRAMS = [iAmSoloJson, singlesInfernoJson] as Program[];

export function getPrograms(): Program[] {
  return PROGRAMS;
}

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((program) => program.id === id);
}

/** 최신 기수부터. 데이터 파일의 순서를 그대로 믿지 않고 번호로 정렬한다. */
export function getSeasons(program: Program): Season[] {
  return [...program.seasons].sort((a, b) => b.number - a.number);
}

export function getSeason(
  programId: string,
  seasonId: string,
): Season | undefined {
  return getProgram(programId)?.seasons.find((s) => s.id === seasonId);
}

/** 모든 프로그램의 기수를 한 줄로. sitemap 과 정적 생성이 같은 목록을 본다. */
export function getAllSeasons(): Season[] {
  return PROGRAMS.flatMap(getSeasons);
}

/**
 * 검색이 훑을 최소 데이터. 서버에서 한 번 만들어 클라이언트로 넘긴다.
 *
 * `program` 을 주면 그 프로그램만, 안 주면 전부 담는다 — 홈은 전부, 프로그램
 * 화면은 자기 것만 본다. 여러 프로그램을 담을 때만 결과 줄에 프로그램 이름이
 * 붙는다(`programName`).
 *
 * 이 함수가 `search.ts` 가 아니라 여기 있는 이유: 클라이언트 컴포넌트가
 * 검색 모듈을 import 하는데, 그 모듈이 JSON 을 읽는 쪽과 한 파일에 있으면
 * 원본이 통째로 클라이언트 번들에 딸려 들어간다.
 */
export function buildSearchIndex(
  locale: Locale,
  program?: Program,
): SearchIndex {
  const programs = program ? [program] : PROGRAMS;
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
