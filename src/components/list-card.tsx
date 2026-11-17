import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 줄 목록을 담는 흰 판. 기수 목록과 검색 결과 두 묶음이 같은 판을 쓴다.
 *
 * **줄이 배경 위에 그냥 떠 있던 것을 판 하나로 묶었다**(2026-08-31). 1280px
 * 화면에서 그 줄들은 왼쪽에 제목, 오른쪽 끝에 숫자 하나가 떨어져 있는 긴 띠라
 * 목록으로 안 읽혔다 — 두 값을 이어 주는 면이 없어서다. 판이 생기면 줄 사이
 * 구분선이 짧아지고 목록 전체가 한 덩어리로 잡힌다.
 *
 * 여백(`gutter`)은 여기서 건다 — 안쪽 줄은 판 끝까지 채워야 눌리는 자리가
 * 판과 같은 크기가 된다.
 */
export function ListCard({ children, className = "" }: Props) {
  return (
    <div className={`gutter ${className}`}>
      <ListPanel>{children}</ListPanel>
    </div>
  );
}

/**
 * 여백 없는 판만. 홈의 두 단(최근 방송 · 모아 보기)처럼 판을 격자 칸에 넣을 때
 * 쓴다 — 거기서는 여백을 격자가 한 번만 걸어야 두 판의 끝이 화면 여백선에 선다.
 */
export function ListPanel({ children, className = "" }: Props) {
  return (
    <div
      className={`divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
