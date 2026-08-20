import { ModeToggle } from "@/components/mode-toggle";
import { SiteSearch } from "@/components/site-search";
import { Wordmark } from "@/components/wordmark";
import { buildSearchIndex } from "@/lib/data";

/** 워드마크와 검색·라이트 전환 버튼을 한 줄로 묶는다. 네 화면 헤더가 모두 이 줄로 시작한다. */
export function SiteHeader() {
  // 인덱스는 서버에서 만든다. 클라이언트가 `lib/data` 를 부르면 원본 JSON 이
  // 통째로 번들에 딸려 들어간다.
  const index = buildSearchIndex();

  return (
    <div className="flex items-center justify-between">
      <Wordmark />
      <div className="flex items-center gap-0.5">
        <SiteSearch index={index} />
        <ModeToggle />
      </div>
    </div>
  );
}
