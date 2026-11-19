import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 프로그램 화면 판(최신 기수 판·기수 타일)의 다크 모드.
 *
 * **라이트와 같은 구조로 띄운다** — 라이트는 바탕(#fafafa)보다 밝은 흰 판이
 * 그림자 위에 선다. 다크는 바탕(#0a0a0c)에서 한 단계 밝은 불투명 판에, 위가 조금
 * 더 밝은 세로 그러데이션과 위쪽 가장자리의 가는 빛을 준다(빛을 위에서 받은 면).
 * 검은 그림자는 다크에서 안 보이므로 판을 띄우는 건 명도 차와 가장자리다.
 *
 * 반투명 유리판(`bg-white/[0.045]`)이던 때는 바탕과 명도 차가 거의 없고 뒤의
 * 앰비언트 포스터 빛이 비쳐 판이 탁했다 — "라이트에 비해 별로" 로 반려됐다
 * (2026-11-19). 홈의 판(`HOME_PANEL`)은 따로다.
 */
export const DARK_PANEL =
  "dark:bg-transparent dark:bg-gradient-to-b dark:from-[#1d1d23] dark:to-[#16161b] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.8)] dark:ring-1 dark:ring-white/[0.06] dark:hover:from-[#222229] dark:hover:to-[#1a1a20]";

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
