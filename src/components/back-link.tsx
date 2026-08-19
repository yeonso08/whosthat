import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** 홈으로 돌아가는 화살표. 기수 상세와 정책 페이지가 같은 걸 쓴다. */
export function BackLink() {
  return (
    <div className="px-3 pt-3.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="기수 목록으로"
        className="size-11 [&_svg]:size-5"
        // Link 는 <a> 라 native button 이 아니라고 알려 줘야 한다.
        nativeButton={false}
        render={<Link href="/" />}
      >
        <ChevronLeft />
      </Button>
    </div>
  );
}
