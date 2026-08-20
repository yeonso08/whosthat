import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 홈으로 돌아가는 화살표. 기수 상세와 정책 페이지가 같은 걸 쓴다.
 *
 * 바깥 여백은 두지 않는다 — 정책 페이지는 제목 위에 한 줄로 세우고 기수
 * 상세는 제목 옆에 붙이므로, 자리는 쓰는 쪽이 정해야 한다.
 */
export function BackLink() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="기수 목록으로"
      // 44px 은 탭 영역이고, 화살표 자체는 옆에 서는 30px 제목에 맞춰 24px 이다.
      // -mt-1 은 44px 상자를 제목 첫 줄(36px)의 중심에 맞추는 값이다 — 제목이
      // 두 줄로 접혀도 화살표가 첫 줄에 붙어 있게 한다.
      className="-mt-1 size-11 shrink-0 [&_svg]:size-6"
      // Link 는 <a> 라 native button 이 아니라고 알려 줘야 한다.
      nativeButton={false}
      render={<Link href="/" />}
    >
      <ChevronLeft />
    </Button>
  );
}
