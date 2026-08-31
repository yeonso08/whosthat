"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type Props = { label: string };

/**
 * 아이콘을 둘 다 그려 두고 `.dark` 클래스로 보이는 쪽만 CSS 로 고른다 —
 * next-themes 가 하이드레이션 전에 <html> 클래스를 이미 정해 두므로, state 로
 * "마운트됐는가"를 따로 추적하지 않아도 서버·클라이언트가 어긋나지 않는다.
 */
export function ModeToggle({ label }: Props) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      // 원형이고 손가락 자리(36px)만큼 키웠다 — 상단 바의 다른 것들이 다
      // 둥근 알약이라 사각 버튼 둘만 각져 보였다.
      className="size-9 rounded-full"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden dark:inline-flex" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
