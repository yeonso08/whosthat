"use client";

import { Check, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/locales";
import { switchLocalePath } from "@/lib/links";

type Props = {
  /** 지금 보고 있는 언어. 목록에서 이 줄에만 체크가 붙는다. */
  current: Locale;
  label: string;
};

/**
 * 언어 선택. 보고 있던 화면의 다른 언어 판으로 간다 — 33기를 보다 고르면
 * 33기의 일본어 화면이지 홈이 아니다.
 *
 * 아이콘은 지구본이다. lucide 의 `Languages`(文A)가 의미로는 더 정확하지만 구글
 * 번역 마크로 읽히는데, 이 사이트의 번역은 기계번역이 아니고 정책 페이지가
 * "번역본이고 원문은 한국어" 라고 따로 말한다. 16px 에서 두 글자가 뭉개지는
 * 것도 걸렸다.
 *
 * **줄마다 `next/link` 가 아니라 맨 링크(`DropdownMenuLinkItem`)다. 되돌리지
 * 말 것.** 언어가 바뀌면
 * 루트 레이아웃(`app/[lang]/layout.tsx`)이 통째로 다시 그려지는데, 클라이언트
 * 내비게이션으로 그렇게 되면 React 가 `<html>` 의 class 를 서버가 준 값으로
 * 덮어쓴다. 거기엔 테마 클래스가 없다(next-themes 가 런타임에 붙이는 것이라)
 * — 다크 모드가 한 프레임 벗겨졌다 돌아오면서 화면이 하얗게 번쩍인다.
 * 문서를 새로 받으면 `<head>` 의 테마 스크립트가 먼저 돌아 그 틈이 없다.
 *
 * 클라이언트 컴포넌트인 이유는 지금 경로(`usePathname`)가 필요해서다. 언어
 * 이름은 화면 언어를 안 타서 `locales.ts` 에서 바로 읽고, 사전에서 오는 문구는
 * 서버가 props 로 내려 준다(사전을 통째로 끌고 오지 않게).
 */
export function LocaleToggle({ current, label }: Props) {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={label}>
            <Globe />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuLinkItem
            key={locale}
            className="justify-between gap-6"
            href={switchLocalePath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
          >
            {LOCALE_NAMES[locale]}
            {locale === current && <Check />}
          </DropdownMenuLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
