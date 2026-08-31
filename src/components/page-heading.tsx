import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 페이지 제목. 네 화면이 같은 크기·무게를 쓴다.
 *
 * **900(`font-black`) + `tracking-tighter` 를 700 + -0.03em 으로 내렸다**
 * (2026-08-31). 한글에서 그 조합은 획이 서로 붙어 제목이 한 덩어리 도장처럼
 * 찍히는데, 그게 화면이 "딱딱하고 투박하다" 고 읽히던 첫 원인이었다. 크기는
 * 오히려 키워서 위계는 그대로 두고 무게만 덜어 낸다 — 세련됨은 굵기가 아니라
 * 크기 차이와 여백에서 온다.
 *
 * 바깥 여백은 두지 않는다 — 기수 상세는 뒤로가기 화살표와 한 줄로 묶이고
 * 정책 페이지는 그러지 않아서, 자리는 쓰는 쪽이 정한다.
 */
export function PageTitle({ children, className = "" }: Props) {
  return (
    <h1
      className={`text-[26px] leading-[1.25] font-bold tracking-[-0.03em] break-keep lg:text-[34px] ${className}`}
    >
      {children}
    </h1>
  );
}

/**
 * 제목 위의 프로그램 이름 줄.
 *
 * 제목이 `33기` 뿐이면 그 화면에 프로그램 이름이 한 글자도 안 남는다 —
 * 검색어는 `나는 솔로 33기` 인데 본문이 그걸 뒷받침하지 못하게 된다.
 * 홈과 기수 상세가 같은 구조를 쓰는 이유다.
 */
export function PageEyebrow({ children }: Props) {
  return (
    <p className="text-[13px] font-bold tracking-[-0.01em] text-muted-foreground">
      {children}
    </p>
  );
}

/** 목록 위의 그룹 제목. 홈의 "지난 기수" 와 검색 결과 그룹이 같은 자리·같은 무게다. */
export function GroupHeading({ children, className = "" }: Props) {
  return (
    <h2
      className={`gutter pt-9 pb-3.5 text-[15px] font-bold tracking-[-0.02em] lg:text-base ${className}`}
    >
      {children}
    </h2>
  );
}
