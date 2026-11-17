"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LiveDot } from "@/components/live-dot";
import type { SeasonRailItem } from "@/lib/types";

/** 문구는 서버가 만들어 내린다 — 클라이언트 컴포넌트라 사전을 못 읽는다. */
type Props = { items: SeasonRailItem[]; label: string };

/**
 * 한 칸의 모양. 높이 40px 은 손가락 자리고, 폭은 글자가 정한다 — `33기` 와
 * `솔로민박 17` 이 한 줄에 같이 설 수 있어야 한다.
 */
const CHIP =
  "flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-semibold tracking-[-0.01em] whitespace-nowrap";

/**
 * 기수 상세의 격자 아래에 서는 기수 띠 — 그 프로그램의 기수 전부가 한 줄이고,
 * 지금 보는 기수가 칠해져 있다. OTT 의 시즌 고르기와 같은 문법이다.
 *
 * 처음엔 `이전`·`다음` 두 판이었는데 반려됐다(2026-11-17) — 판 둘이 화면 폭을
 * 다 쓰면서 말하는 건 번호 둘뿐이었고, 옆 기수로만 갈 수 있었다. 띠는 같은
 * 높이에 전 기수를 담고 어디로든 한 번에 간다.
 *
 * 좁은 화면에서는 옆으로 넘기고, 넓어지면(`lg`) 줄을 접어 다 보여 준다 —
 * 마우스로는 가로 스크롤이 불편하다. 넘기는 띠는 **지금 기수가 가운데 오게**
 * 열린다: 최신 기수부터 세우므로 그냥 두면 10기 화면의 띠가 34기에서 시작해
 * 지금 기수가 화면 밖에 있다. 페이지는 안 움직이고 띠 안에서만 옮긴다.
 */
export function SeasonRail({ items, label }: Props) {
  const rail = useRef<HTMLElement>(null);
  const current = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!rail.current || !current.current) return;
    const offset =
      current.current.offsetLeft -
      (rail.current.clientWidth - current.current.offsetWidth) / 2;
    rail.current.scrollLeft = Math.max(0, offset);
  }, []);

  return (
    <nav
      ref={rail}
      aria-label={label}
      // 위아래 여백은 그림자와 포커스 테두리가 잘리지 않을 자리다 — 가로로
      // 넘기는 상자는 세로로도 자른다. 바깥 여백으로 그만큼 되돌린다.
      className="gutter relative -my-2 flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) =>
        item.current ? (
          <span
            key={item.href}
            ref={current}
            aria-current="page"
            className={`${CHIP} bg-foreground text-background`}
          >
            {item.onAir && <LiveDot />}
            {item.label}
          </span>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={`${CHIP} press focus-ring bg-card text-muted-foreground shadow-soft transition-colors duration-200 hover:text-foreground`}
          >
            {item.onAir && <LiveDot />}
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
