import Link from "next/link";
import { BRAND_MARK, BRAND_WORDMARK } from "@/lib/brand";

/**
 * 사이트 워드마크 `@whosthat`. 누르면 홈으로 간다.
 *
 * `@` 를 한 톤 죽이는 건 이름이 먼저 읽히게 하려는 것이다 — 마크는 앞에서
 * 거드는 자리고, 혼자 설 때(파비콘·앱 아이콘)만 흰색으로 올라간다.
 */
export function Wordmark() {
  return (
    <Link
      href="/"
      className="font-lat inline-flex w-fit text-[15px] font-extrabold tracking-[-0.04em] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="text-muted-foreground">{BRAND_MARK}</span>
      {BRAND_WORDMARK}
    </Link>
  );
}
