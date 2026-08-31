import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 페이지 제목. 네 화면이 같은 크기·무게를 쓴다.
 *
 * 바깥 여백은 두지 않는다 — 기수 상세는 뒤로가기 화살표와 한 줄로 묶이고
 * 정책 페이지는 그러지 않아서, 자리는 쓰는 쪽이 정한다.
 */
export function PageTitle({ children, className = "" }: Props) {
  return (
    // `break-keep` 은 좁은 레일에서 제목이 음절 단위로 꺾이는 걸 막는다
    // (`삭제·정정 요/청`). 데스크톱에서 제목이 레일 폭에 갇히면서 걸렸다.
    <h1
      className={`text-3xl font-black tracking-tighter break-keep lg:text-4xl ${className}`}
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
    <p className="mt-5 text-sm font-bold tracking-tight text-muted-foreground">
      {children}
    </p>
  );
}

/** 목록 위의 그룹 제목. 홈의 "지난 기수" 와 검색 결과 그룹이 같은 자리·같은 무게다. */
export function GroupHeading({ children }: Props) {
  return (
    <h2 className="gutter pt-7 pb-2 text-[13px] font-bold text-muted-foreground lg:text-sm">
      {children}
    </h2>
  );
}
