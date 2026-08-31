import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 보여 줄 게 없을 때 자리를 지키는 카드. 기수 상세의 "명단 정리 중" 과 검색
 * 결과 없음이 같은 모양이다 — 둘 다 "여기가 비어 있다" 를 말하는 자리다.
 *
 * 가운데로 서는 화면(홈)에서는 쓰는 쪽이 폭을 묶어 준다.
 */
export function EmptyCard({ children, className = "" }: Props) {
  return (
    <div className={`gutter mt-7 ${className}`}>
      <p className="rounded-2xl bg-card px-6 py-10 text-center text-[13px] leading-relaxed text-muted-foreground shadow-soft">
        {children}
      </p>
    </div>
  );
}
