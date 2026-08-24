import Link from "next/link";
import {
  BRAND_MARK,
  BRAND_WORDMARK,
  BRAND_WORDMARK_FONT,
} from "@/lib/brand";
import { currentLocale } from "@/lib/i18n";
import { homeHref } from "@/lib/links";

/**
 * 사이트 워드마크 `@누꼬`(ko)·`@nukko`(en). 누르면 보고 있던 언어의 홈으로 간다.
 *
 * `@` 를 한 톤 죽이는 건 이름이 먼저 읽히게 하려는 것이다 — 마크는 앞에서
 * 거드는 자리고, 혼자 설 때(파비콘·앱 아이콘)만 흰색으로 올라간다.
 *
 * 서체가 두 조각으로 갈린 이유는 `BRAND_WORDMARK_FONT` 에 적어 뒀다.
 */
export async function Wordmark() {
  const locale = await currentLocale();

  return (
    <Link
      href={homeHref(locale)}
      className="inline-flex w-fit text-[15px] font-extrabold tracking-[-0.04em] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="font-lat text-muted-foreground">{BRAND_MARK}</span>
      <span className={BRAND_WORDMARK_FONT[locale]}>
        {BRAND_WORDMARK[locale]}
      </span>
    </Link>
  );
}
