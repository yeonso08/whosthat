import Link from "next/link";
import { BrandMark } from "@/components/icons";
import { BRAND_WORDMARK, BRAND_WORDMARK_FONT, BRAND_WORDMARK_NUDGE } from "@/lib/brand";
import { currentLocale } from "@/lib/i18n";
import { homeHref } from "@/lib/links";

/**
 * 사이트 워드마크 — ㄲ 마크 + `누꼬`(ko)·`nukko`(en). 누르면 보고 있던 언어의
 * 홈으로 간다.
 *
 * 마크를 한 톤 죽이는 건 이름이 먼저 읽히게 하려는 것이다 — 마크는 앞에서
 * 거드는 자리고, 혼자 설 때(파비콘·앱 아이콘)만 흰색으로 올라간다.
 *
 * `items-center` 로 맞추는 건 마크가 이제 글자가 아니라 도형이라서다 — 텍스트
 * 베이스라인 개념이 없으니 광학 중심으로 맞추는 편이 자연스럽다. 다만 줄
 * 상자가 맞아도 글자가 그 상자 안 어디에 잉크를 칠하는지는 서체마다 달라서,
 * 한국어만 `BRAND_WORDMARK_NUDGE` 로 살짝 보정한다 — 이유는 `lib/brand.ts`.
 */
export async function Wordmark() {
  const locale = await currentLocale();

  return (
    <Link
      href={homeHref(locale)}
      className="inline-flex w-fit items-center gap-1.5 text-[15px] font-extrabold tracking-[-0.04em] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <BrandMark className="h-[1.3em] w-auto text-muted-foreground" />
      <span className={`${BRAND_WORDMARK_FONT[locale]} ${BRAND_WORDMARK_NUDGE[locale]}`}>
        {BRAND_WORDMARK[locale]}
      </span>
    </Link>
  );
}
