import type { ReactNode } from "react";

import { MobonBanner } from "@/components/mobon-banner";

type Props = {
  /** 이 화면에 배너를 걸지. 거는 기준은 쓰는 쪽이 정한다(빈 명단·정책 페이지는 안 건다). */
  show: boolean;
  /** 본문 묶음의 바깥 여백. */
  className?: string;
  /**
   * 세로 칸의 높이(`top-[…]`). 기본은 상단 바(68px) 바로 아래다. 본문 첫 줄이 위 여백을
   * 안에 품고 있는 화면(홈의 제목 줄)은 그 높이로 내려야 배너가 혼자 떠 보이지 않는다.
   */
  railClassName?: string;
  children: ReactNode;
};

/**
 * 모비온 배너를 거는 화면의 틀. 홈·프로그램·기수 상세가 같은 모양이다(2026-11-13).
 *
 * - 데스크톱(`lg` 부터): 화면 왼쪽 끝에 300×600 세로 칸을 고정한다. 본문 레이아웃은
 *   배너가 없을 때와 같다 — 본문 옆에 칸을 두면 격자·포스터·기둥 폭이 전부 줄었다.
 * - 휴대폰: 본문 아래 300×250. 방문자가 찾던 걸 본 다음 자리라야 본문을 밀지 않는다.
 *
 * 어느 쪽이 실제로 뜰지는 `MobonBanner` 가 기기를 보고 정한다 — 여기는 자리만 둔다.
 */
export function WithBanner({
  show,
  className = "",
  railClassName = "top-[92px]",
  children,
}: Props) {
  if (!show) return <div className={className}>{children}</div>;

  return (
    <>
      <div className={className}>{children}</div>
      <aside className={`fixed left-4 z-40 hidden lg:block ${railClassName}`}>
        <MobonBanner placement="rail" />
      </aside>
      <div className="mt-10 lg:hidden">
        <MobonBanner placement="inline" />
      </div>
    </>
  );
}
