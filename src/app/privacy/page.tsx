import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { BRAND_WORDMARK } from "@/lib/brand";
import { PRIVACY_HREF, TAKEDOWN_HREF } from "@/lib/links";
import { CONTACT_EMAIL } from "@/lib/site";

const TITLE = "개인정보 처리방침";
const DESCRIPTION =
  "이 사이트가 어떤 정보를 싣고, 방문자에 대해 무엇을 남기는지 적어 뒀습니다.";

/** 내용을 고치면 이 날짜도 함께 올린다. */
const EFFECTIVE_DATE = "2026년 8월 19일";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PRIVACY_HREF },
  openGraph: { type: "article", title: TITLE, description: DESCRIPTION, url: PRIVACY_HREF },
};

const HEADING = "mt-8 text-sm font-bold";
const BODY = "mt-2.5 text-[13px] leading-relaxed text-muted-foreground";

export default function Page() {
  return (
    <main>
      {/* 홈을 안 거치고 검색으로 바로 들어오는 페이지라 누구의 방침인지
          화면에서 밝혀 둔다. */}
      <header className="px-5 pt-6">
        <SiteHeader />
      </header>

      <article className="px-5 pt-5">
        {/* 화살표의 44px 탭 영역이 제목을 밀지 않게 줄 전체를 왼쪽으로 당긴다. */}
        <div className="-ml-3 flex items-start gap-1">
          <BackLink />
          <h1 className="text-3xl font-black tracking-tighter">{TITLE}</h1>
        </div>
        <p className={BODY}>
          <span className="font-lat font-semibold text-foreground">
            {BRAND_WORDMARK}
          </span>
          (이하 &ldquo;이 사이트&rdquo;)가 어떤 정보를 다루는지 적어 둡니다.
        </p>

        <h2 className={HEADING}>출연진 정보</h2>
        <p className={BODY}>
          방송 가명, 공개된 경우의 실명, 방영 당시 나이와 직업, 공개 인스타그램
          계정, 그리고 그 계정을 언제 어떻게 확인했는지를 싣습니다. 사진이 함께
          실리는 경우도 있습니다.
        </p>
        <p className={BODY}>
          전부 방송과 공개된 자료에서 모은 것이고 본인에게 직접 받지 않습니다.
          비공개 계정과 확인되지 않은 추측은 싣지 않습니다. 사진을 포함해 내려
          달라고 하시면 이유를 묻지 않고 내립니다.
        </p>

        <h2 className={HEADING}>방문자 정보</h2>
        <p className={BODY}>
          회원가입도 로그인도 없습니다. 이름이나 연락처를 입력받는 화면이
          없습니다.
        </p>
        <p className={BODY}>
          접속 통계로 Vercel Web Analytics 를 씁니다. 어떤 페이지가 열렸는지,
          어디서 들어왔는지, 기기와 브라우저 종류 정도가 익명으로 집계됩니다.
          쿠키는 쓰지 않고 방문자를 따로 식별하지 않습니다.
        </p>
        <p className={BODY}>
          메일로 문의하시면 그 주소와 내용이 메일함에 남습니다. 처리가 끝나면
          지웁니다.
        </p>

        <h2 className={HEADING}>맡기는 곳</h2>
        <p className={BODY}>
          호스팅과 접속 통계는 Vercel Inc.(미국) 를 씁니다. 사이트에 접속하면
          접속 기록이 이곳에 남습니다. 그 밖에 누구에게도 넘기거나 팔지
          않습니다.
        </p>

        <h2 className={HEADING}>광고</h2>
        <p className={BODY}>
          지금은 광고를 붙이지 않았습니다. 붙이면 광고사가 쿠키를 쓰게 되므로
          이 문서를 먼저 고칩니다.
        </p>

        <h2 className={HEADING}>권리</h2>
        <p className={BODY}>
          자기 정보를 열람·정정·삭제해 달라고 요청하실 수 있습니다. 이유는 묻지
          않고, 확인되면 바로 지웁니다.{" "}
          <Link
            href={TAKEDOWN_HREF}
            className="underline underline-offset-4 hover:text-foreground"
          >
            삭제·정정 요청
          </Link>
        </p>

        <h2 className={HEADING}>문의</h2>
        <p className={`font-lat ${BODY}`}>{CONTACT_EMAIL}</p>

        <p className="mt-8 text-xs text-muted-foreground">
          시행일 {EFFECTIVE_DATE}
        </p>
      </article>
    </main>
  );
}
