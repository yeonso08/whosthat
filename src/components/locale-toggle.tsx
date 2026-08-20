"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/locales";
import { switchLocalePath } from "@/lib/links";

type Props = {
  /** 눌렀을 때 갈 언어. 지금 언어가 아니라 다음 언어다. */
  target: Locale;
  label: string;
  /** 버튼에 보이는 짧은 이름. 그 언어를 쓰는 사람이 읽을 글자라 그 언어로 적는다. */
  short: string;
};

/**
 * 언어 전환. 보고 있던 화면의 다른 언어 판으로 간다 — 33기를 보다 누르면
 * 33기의 영어 화면이지 홈이 아니다.
 *
 * 클라이언트 컴포넌트인 이유는 지금 경로(`usePathname`)가 필요해서다. 문구는
 * 사전을 통째로 끌고 오지 않게 서버가 props 로 내려 준다.
 */
export function LocaleToggle({ target, label, short }: Props) {
  const pathname = usePathname();

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      // Link 는 <a> 라 native button 이 아니라고 알려 줘야 한다.
      nativeButton={false}
      render={
        <Link href={switchLocalePath(pathname, target)} hrefLang={target} />
      }
    >
      {short}
    </Button>
  );
}
