import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  title: string;
  summary: string;
  icon: ReactNode;
  /** 아이콘 원의 바탕을 바꿀 때. 홈이 다크 모드에서 아이콘마다 옅은 색을 깐다. */
  iconClassName?: string;
};

/**
 * 홈 "모아 보기" 판의 한 줄 — 여러 프로그램을 가로질러 모은 화면으로 간다.
 *
 * **줄이다. 판 하나짜리 타일이 아니다**(2026-11-17, 두 번 반려된 끝에). 포스터
 * 줄 아래에 타일을 혼자 세우면 어떤 모양이든 얹어 놓은 것처럼 보였다. 모음 화면은
 * 앞으로 늘어나는 목록이라(방송 뒤 소식 등) 목록 줄로 두고, "최근 방송" 판 옆에
 * 세운다 — 한 줄뿐일 때도 옆 판이 받쳐 줘서 혼자 뜨지 않는다.
 *
 * 앞의 둥근 자리는 그 모음이 무엇인지 말하는 그림 하나다. 색은 쓰는 쪽이 준다.
 */
export function CollectionLink({ href, title, summary, icon, iconClassName = "" }: Props) {
  return (
    <Link
      href={href}
      className="press focus-ring group flex items-center gap-3.5 px-5 py-4.5 hover:bg-elevated/40"
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-elevated ${iconClassName}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-[1.35] font-bold tracking-[-0.02em] break-keep">
          {title}
        </span>
        <span className="mt-0.5 block text-[12px] leading-[1.5] break-keep text-muted-foreground">
          {summary}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
    </Link>
  );
}
