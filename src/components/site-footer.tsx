import Link from "next/link";
import { BrandMark } from "@/components/icons";
import { POLICY_LINK } from "@/components/policy-page";
import { BrandName } from "@/components/wordmark";
import { currentDictionary, currentLocale } from "@/lib/i18n";
import { privacyHref, takedownHref } from "@/lib/links";

/**
 * 카피라이트에 박는 연도. 사이트를 연 해다.
 *
 * `new Date().getFullYear()` 를 쓰지 않는 건 전 페이지가 SSG 라 빌드 시각에
 * 얼어붙기 때문이다 — 해가 바뀌어도 재배포 전까지 옛 연도가 그대로 남는다.
 * 어차피 손으로 고칠 값이면 코드에 적어 두는 편이 덜 헷갈린다.
 */
const COPYRIGHT_YEAR = 2026;

/**
 * 모든 화면 바닥. 삭제 요청 창구는 어느 기수에서든 한 번에 닿아야 한다.
 *
 * 화면 바닥까지 미는 건 루트 레이아웃이 한다(본문이 `flex-1`) — 여기서
 * `mt-auto` 로 하면 아래 `mt-10` 과 같은 속성이라 한쪽이 조용히 진다.
 */
export async function SiteFooter() {
  const locale = await currentLocale();
  const dict = await currentDictionary();

  return (
    <footer className="mt-20 border-t border-border/60">
      <div className="gutter mx-auto flex w-full max-w-[1280px] flex-col gap-3 pt-8 pb-12 text-xs leading-relaxed text-muted-foreground">
        <p>{dict.footer.note}</p>
        <p className="flex gap-5">
          <Link href={takedownHref(locale)} className={POLICY_LINK}>
            {dict.footer.takedown}
          </Link>
          <Link href={privacyHref(locale)} className={POLICY_LINK}>
            {dict.footer.privacy}
          </Link>
        </p>
        {/* 연도는 `font-lat`(Manrope), 이름만 언어에 따라 갈아 끼운다. */}
        <p className="font-lat mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/70">
          <span>
            © {COPYRIGHT_YEAR}
          </span>
          <BrandMark className="h-[0.85em] w-auto" />
          <BrandName />
        </p>
      </div>
    </footer>
  );
}
