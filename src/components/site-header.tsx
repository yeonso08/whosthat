import { ModeToggle } from "@/components/mode-toggle";
import { Wordmark } from "@/components/wordmark";

/** 워드마크와 라이트·다크 전환 버튼을 한 줄로 묶는다. 네 화면 헤더가 모두 이 줄로 시작한다. */
export function SiteHeader() {
  return (
    <div className="flex items-center justify-between">
      <Wordmark />
      <ModeToggle />
    </div>
  );
}
