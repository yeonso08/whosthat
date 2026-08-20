import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { BRAND_WORDMARK } from "@/lib/brand";
import { CONTACT_MAILTO, TAKEDOWN_HREF } from "@/lib/links";
import { CONTACT_EMAIL } from "@/lib/site";

const TITLE = "삭제·정정 요청";
const DESCRIPTION =
  "내 계정을 내려 주세요, 잘못된 계정이 걸려 있어요 — 어떻게 요청하고 언제까지 처리되는지 적어 뒀습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: TAKEDOWN_HREF },
  openGraph: { type: "article", title: TITLE, description: DESCRIPTION, url: TAKEDOWN_HREF },
};

export default function Page() {
  return (
    <main>
      {/* 홈을 안 거치고 검색으로 바로 들어오는 페이지라 어느 사이트에 하는
          요청인지 화면에서 밝혀 둔다. */}
      <header className="px-5 pt-6">
        <SiteHeader />
      </header>

      <article className="px-5 pt-5">
        {/* 화살표의 44px 탭 영역이 제목을 밀지 않게 줄 전체를 왼쪽으로 당긴다. */}
        <div className="-ml-3 flex items-start gap-1">
          <BackLink />
          <h1 className="text-3xl font-black tracking-tighter">{TITLE}</h1>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-lat font-semibold text-foreground">
            {BRAND_WORDMARK}
          </span>
          는 방송에서 공개됐거나 본인이 공개로 설정한 계정만 싣습니다. 그래도
          내리고 싶으시면 내립니다. 이유는 묻지 않습니다.
        </p>

        <h2 className="mt-8 text-sm font-bold">이런 요청을 받습니다</h2>
        <ul className="mt-2.5 flex list-disc flex-col gap-1.5 pl-4 text-[13px] leading-relaxed text-muted-foreground">
          <li>내 계정을 내려 주세요</li>
          <li>내 실명·나이·직업을 지우거나 고쳐 주세요</li>
          <li>나와 상관없는 계정이 내 가명에 걸려 있어요</li>
          <li>기수나 가명이 잘못 적혀 있어요</li>
        </ul>
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
          아래 둘은 본인이 아니어도 알려 주실 수 있습니다. 잘못 걸린 계정 하나가
          아무 상관 없는 사람에게 DM 을 몰리게 하기 때문에, 알려 주시는 쪽이
          반갑습니다.
        </p>

        <h2 className="mt-8 text-sm font-bold">어떻게 요청하나요</h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
          아래 주소로 메일을 보내 주세요. 두 줄이면 충분합니다 — <strong className="font-semibold text-foreground">기수와 가명</strong>(예: 28기 영숙),
          그리고 <strong className="font-semibold text-foreground">무엇을 지우거나 고쳐야 하는지</strong>.
        </p>
        <Button
          className="mt-4 w-full"
          nativeButton={false}
          render={<a href={CONTACT_MAILTO} />}
        >
          메일 보내기
        </Button>
        <p className="font-lat mt-2.5 text-center text-xs text-muted-foreground">
          {CONTACT_EMAIL}
        </p>

        <h2 className="mt-8 text-sm font-bold">본인 확인</h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
          남의 계정을 대신 내려 달라는 장난을 막아야 해서, 본인 요청이면 그
          계정을 쥐고 계시다는 게 드러나는 방법이 가장 빠릅니다. 해당 인스타
          계정으로 DM 을 주시거나, 그 계정에 걸린 메일 주소로 보내시면 됩니다.
          확인이 어렵더라도 우선 화면에서 내려 두고 이야기합니다.
        </p>

        <h2 className="mt-8 text-sm font-bold">처리 기간</h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
          확인되면 바로 지웁니다. 늦어도 7일 안에 회신합니다. 한 번 내린 계정은
          다시 올리지 않습니다.
        </p>
      </article>
    </main>
  );
}
