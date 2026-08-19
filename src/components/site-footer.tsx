import Link from "next/link";
import { PRIVACY_HREF, TAKEDOWN_HREF } from "@/lib/links";

const LINK_STYLE = "underline underline-offset-4 hover:text-foreground";

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
    </footer>
  );
}
