import Link from "next/link";
import { BrandMark } from "@/components/icons";
import {
  BRAND_WORDMARK,
  BRAND_WORDMARK_FONT,
  BRAND_WORDMARK_NUDGE,
} from "@/lib/brand";
import { currentLocale } from "@/lib/i18n";
import { homeHref } from "@/lib/links";

/**
 * 사이트 워드마크 — ㄲ 마크 + `누꼬`(ko)·`nukko`(en·ja). 누르면 보고 있던 언어의
 * 홈으로 간다.
 *
 * 마크를 한 톤 죽이는 건 이름이 먼저 읽히게 하려는 것이다 — 마크는 앞에서
 * 거드는 자리고, 혼자 설 때(파비콘·앱 아이콘)만 흰색으로 올라간다.
 *
 * `items-center` 로 맞추는 건 마크가 이제 글자가 아니라 도형이라서다 — 텍스트
 * 베이스라인 개념이 없으니 광학 중심으로 맞추는 편이 자연스럽다.
 */
export async function Wordmark() {
  const locale = await currentLocale();

  return (
    <Link
      href={homeHref(locale)}
      className="focus-ring inline-flex w-fit items-center gap-1.5 text-[15px] font-extrabold tracking-[-0.04em] transition-opacity hover:opacity-80"
    >
      <BrandMark className="h-[1.3em] w-auto text-muted-foreground" />
      <BrandName />
    </Link>
  );
}

/**
 * 워드마크의 이름 부분만. 마크 없이 이름만 서는 자리가 셋 있다 — 푸터
 * 카피라이트 줄, 그리고 정책 두 페이지의 첫 문장 안이다.
 *
 * **서체와 광학 보정을 함께 건다.** 손으로 적으면 `BRAND_WORDMARK_NUDGE` 를
 * 빠뜨리기 쉬운데(실제로 정책 두 페이지가 그 상태였다), 그러면 한국어에서만
 * 같은 이름이 자리마다 다른 높이로 뜬다 — 이유는 `lib/brand.ts`.
 */
export async function BrandName({ className = "" }: { className?: string }) {
  const locale = await currentLocale();

  return (
    <span
      className={`${BRAND_WORDMARK_FONT[locale]} ${BRAND_WORDMARK_NUDGE[locale]} ${className}`}
    >
      {BRAND_WORDMARK[locale]}
    </span>
  );
}

/**
 * 이름이 문장 안에 들어가는 자리. 사전의 `{brand}` 를 이름으로 갈아 끼운다 —
 * 조각을 이어 붙이지 않는 건 이름이 오는 자리가 언어마다 다르기 때문이다.
 */
export async function BrandSentence({ text }: { text: string }) {
  const [before, after] = text.split("{brand}");

  return (
    <>
      {before}
      <BrandName className="font-semibold text-foreground" />
      {after}
    </>
  );
}
