import programJson from "@/data/na-neun-solo.json";
import {
  formatCoverage,
  localizeAlias,
  localizeSeasonLabel,
  localizeSpecial,
  seasonNumber,
  type Locale,
} from "./i18n";
import {
  getCoverage,
  type Program,
  type SearchIndex,
  type Season,
} from "./types";

const program = programJson as Program;

export function getProgram(): Program {
  return program;
}

/** 최신 기수부터. 데이터 파일의 순서를 그대로 믿지 않고 기수 번호로 정렬한다. */
export function getSeasons(): Season[] {
  return [...program.seasons].sort(
    (a, b) => seasonNumber(b.label) - seasonNumber(a.label),
  );
}

export function getSeason(id: string): Season | undefined {
  return program.seasons.find((s) => s.id === id);
}

/**
 * 검색이 훑을 최소 데이터. 서버에서 한 번 만들어 클라이언트로 넘긴다.
 *
 * 이 함수가 `search.ts` 가 아니라 여기 있는 이유: 클라이언트 컴포넌트가
 * 검색 모듈을 import 하는데, 그 모듈이 JSON 을 읽는 쪽과 한 파일에 있으면
 * 원본 56KB 가 통째로 클라이언트 번들에 딸려 들어간다. JSON 을 아는 파일은
 * 계속 이 파일 하나여야 한다.
 */
export function buildSearchIndex(locale: Locale): SearchIndex {
  return getSeasons().map((season) => {
    const special = season.special
      ? localizeSpecial(season.special, locale)
      : undefined;

    // 영어 화면에서도 "33기"·"영수" 로 찾히게 원문을 함께 싣는다. 화면에 나오는
    // 건 위의 번역된 값이고, 이 줄은 검색에만 쓰인다 — 한국 커뮤니티에서 본
    // 이름을 그대로 붙여 넣는 사람이 영어권 방문자 중에도 있다.
    const source = locale === "ko" ? "" : `${season.label} ${season.special ?? ""}`;

    return {
      id: season.id,
      label: localizeSeasonLabel(season.label, locale),
      ...(special ? { special } : {}),
      ...(source.trim() ? { keywords: source } : {}),
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
}
