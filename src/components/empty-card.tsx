import type { ReactNode } from "react";

/**
 * 보여 줄 게 없을 때 자리를 지키는 카드. 기수 상세의 "명단 정리 중" 과 검색
 * 결과 없음이 같은 모양이다 — 둘 다 "여기가 비어 있다" 를 말하는 자리다.
 */
export function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div className="gutter mt-6">
      <p className="rounded-2xl bg-card px-5 py-8 text-center text-[13px] leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
