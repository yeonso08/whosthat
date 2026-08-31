import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

/**
 * 화면의 뼈대. **좁을 때는 세로로 쌓이고, 넓어지면 왼쪽 레일 + 오른쪽 면이 된다.**
 *
 * 폭만 넓히고 열만 늘리면 그건 휴대폰 화면을 늘려 놓은 것이지 데스크톱 화면이
 * 아니다 — 큰 화면에서 달라져야 하는 건 열 수가 아니라 **구성**이다. 그래서
 * 화면의 정체(워드마크·제목·현황·되돌아갈 곳)를 한 덩어리로 묶어 왼쪽에 세우고,
 * 오른쪽 면은 격자와 목록만 갖는다. 모바일에서 그 덩어리는 그냥 페이지 머리다.
 *
 * **레일은 스크롤을 따라 붙어 있는다**(`sticky`). 출연진 격자가 길어져도 지금
 * 보고 있는 게 몇 기 누구인지가 화면에서 안 사라진다 — 기수 상세가 이 화면의
 * 주력이라 그 값이 제일 크다.
 *
 * 열 사이 간격은 `gap` 이 아니라 양쪽이 이미 가진 `gutter` 두 벌이 만든다 —
 * 여기서 `gap` 을 더하면 화면 좌우 여백과 열 간격이 서로 다른 값이 된다.
 */
const RAIL_WIDTH = "lg:grid-cols-[19rem_1fr]";

type Props = {
  /** 제목·현황처럼 이 화면이 무엇인지 말하는 것들. 워드마크 줄은 여기서 얹는다. */
  rail: ReactNode;
  /** 격자·목록. 스크롤되는 쪽이다. */
  children: ReactNode;
};

export function PageShell({ rail, children }: Props) {
  return (
    <main className={`lg:grid ${RAIL_WIDTH} lg:items-start`}>
      <div className="gutter pt-6 lg:sticky lg:top-0 lg:pt-10 lg:pb-12">
        <SiteHeader />
        {rail}
      </div>

      <div className="min-w-0 lg:pt-10">{children}</div>
    </main>
  );
}
