import type { ReactNode } from "react";

import { MobonBanner } from "@/components/mobon-banner";

type Props = {
  /** 이 화면에 배너를 걸지. 거는 기준은 쓰는 쪽이 정한다(빈 명단·정책 페이지는 안 건다). */
  show: boolean;
  /** 두 칸 줄의 바깥 여백 — 옆 칸이 본문 첫 줄과 같은 높이에서 시작하게 여기서 준다. */
  className?: string;
  /**
   * 옆 칸을 더 내릴 때. 본문 첫 줄이 위 여백을 안에 품고 있는 화면(홈의 제목 줄)은
   * 그 여백만큼 내려야 배너가 혼자 떠 보이지 않는다.
   */
  railClassName?: string;
  children: ReactNode;
};

/**
 * 모비온 배너를 거는 화면의 틀. 홈·프로그램·기수 상세가 같은 모양이다(2026-11-13).
 *
 * - 데스크톱(`lg` 부터): 본문 오른쪽에 300×600 세로 칸이 상단 바(68px) 아래에 붙어
 *   따라온다.
 * - 휴대폰: 본문 아래 300×250. 방문자가 찾던 걸 본 다음 자리라야 본문을 밀지 않는다.
 *
 * 어느 쪽이 실제로 뜰지는 `MobonBanner` 가 기기를 보고 정한다 — 여기는 자리만 둔다.
 */
export function WithBanner({
  show,
  className = "",
  railClassName = "",
  children,
}: Props) {
  if (!show) return <div className={className}>{children}</div>;

  return (
    <>
      <div className={`lg:flex lg:items-start lg:gap-8 ${className}`}>
        <div className="min-w-0 flex-1">{children}</div>
        {/* 본문이 `gutter` 로 여백을 갖는 것과 맞춰 오른쪽 끝도 `gutter` 의 lg 값(2rem)만큼 띄운다. */}
        <aside className={`sticky top-[92px] hidden shrink-0 pr-8 lg:block ${railClassName}`}>
          <MobonBanner placement="rail" />
        </aside>
      </div>
      <div className="mt-10 lg:hidden">
        <MobonBanner placement="inline" />
      </div>
    </>
  );
}
