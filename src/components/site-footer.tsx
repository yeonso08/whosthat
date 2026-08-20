import Link from "next/link";
import { BRAND_MARK, BRAND_WORDMARK } from "@/lib/brand";
import { PRIVACY_HREF, TAKEDOWN_HREF } from "@/lib/links";

const LINK_STYLE = "underline underline-offset-4 hover:text-foreground";

/**
 * 카피라이트에 박는 연도. 사이트를 연 해다.
 *
 * `new Date().getFullYear()` 를 쓰지 않는 건 전 페이지가 SSG 라 빌드 시각에
 * 얼어붙기 때문이다 — 해가 바뀌어도 재배포 전까지 옛 연도가 그대로 남는다.
 * 어차피 손으로 고칠 값이면 코드에 적어 두는 편이 덜 헷갈린다.
 */
const COPYRIGHT_YEAR = 2026;

/** 모든 화면 바닥. 삭제 요청 창구는 어느 기수에서든 한 번에 닿아야 한다. */
export function SiteFooter() {
  return (
    <footer className="mt-10 flex flex-col gap-2.5 border-t border-border px-5 pt-5 pb-8 text-xs leading-relaxed text-muted-foreground">
      <p>
        방송에서 공개됐거나 본인이 공개로 둔 계정만 올린다. 확인한 것만 싣고,
        추측은 싣지 않는다.
      </p>
      <p className="flex gap-4">
        <Link href={TAKEDOWN_HREF} className={LINK_STYLE}>
          삭제·정정 요청
        </Link>
        <Link href={PRIVACY_HREF} className={LINK_STYLE}>
          개인정보 처리방침
        </Link>
      </p>
      <p className="font-lat mt-1 text-[11px] text-muted-foreground/70">
        © {COPYRIGHT_YEAR} {BRAND_MARK}
        {BRAND_WORDMARK}
      </p>
    </footer>
  );
}
