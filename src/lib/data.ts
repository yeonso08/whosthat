import programJson from "@/data/na-neun-solo.json";
import type { Program, Season } from "./types";

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
