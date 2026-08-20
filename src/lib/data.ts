import programJson from "@/data/na-neun-solo.json";
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

function seasonNumber(label: string): number {
  return Number.parseInt(label, 10) || 0;
}

/** "2024-08" → "2024년 8월". 비어 있으면 빈 문자열. */
export function formatAirDate(airDate: string): string {
  const [year, month] = airDate.split("-");
  if (!year || !month) return "";
  return `${year}년 ${Number(month)}월`;
}

/** "2026-08-18" → "26.08.18" */
export function formatChecked(date: string): string {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return "";
  return `${year.slice(2)}.${month}.${day}`;
}

/**
 * 검색이 훑을 최소 데이터. 서버에서 한 번 만들어 클라이언트로 넘긴다.
 *
 * 이 함수가 `search.ts` 가 아니라 여기 있는 이유: 클라이언트 컴포넌트가
 * 검색 모듈을 import 하는데, 그 모듈이 JSON 을 읽는 쪽과 한 파일에 있으면
 * 원본 56KB 가 통째로 클라이언트 번들에 딸려 들어간다. JSON 을 아는 파일은
 * 계속 이 파일 하나여야 한다.
 */
export function buildSearchIndex(): SearchIndex {
  return getSeasons().map((season) => ({
    id: season.id,
    label: season.label,
    ...(season.special ? { special: season.special } : {}),
    coverage: getCoverage(season.cast),
    cast: season.cast.map((member) => ({
      id: member.id,
      alias: member.alias,
      ...(member.name ? { name: member.name } : {}),
      status: member.status,
      ...(member.instagramHandle ? { handle: member.instagramHandle } : {}),
    })),
  }));
}
