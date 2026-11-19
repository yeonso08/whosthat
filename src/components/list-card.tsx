import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 판의 다크 모드 — 반투명 유리판 + 위쪽 가장자리의 가는 빛(2026-11-19). 다크는
 * 바탕(#0a0a0c)과 판(#141418)의 명도 차가 작고 검은 그림자는 안 보여서, 판이
 * 바탕에 붙어 화면이 한 장의 검은 면이 됐다. 라이트는 그대로다. 프로그램
 * 화면의 기수 목록과 최신 기수 판이 쓴다.
 */
export const GLASS_PANEL =
  "dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07)] dark:ring-1 dark:ring-white/[0.07] dark:backdrop-blur";

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
