"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 상단 바의 프로그램 링크들. 지금 보고 있는 프로그램에 표시가 붙는다.
 *
 * 클라이언트 컴포넌트인 이유는 지금 경로(`usePathname`)뿐이다 — 이름은 서버가
 * 그 언어로 만들어 props 로 내려 준다. 여기서 사전이나 데이터를 읽으면 그게
 * 통째로 클라이언트 번들에 딸려 온다.
 */
type Props = { items: { href: string; name: string }[] };

export function NavLinks({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        // 기수 상세(`/ko/i-am-solo/seasons/s22`)에서도 그 프로그램이 켜져 있어야 한다.
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring rounded-lg px-2.5 py-1.5 text-[13px] font-bold whitespace-nowrap transition-colors ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
