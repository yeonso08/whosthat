import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { PRIVACY_HREF, TAKEDOWN_HREF } from "@/lib/links";
import { CONTACT_EMAIL } from "@/lib/site";

const TITLE = "개인정보 처리방침";
const DESCRIPTION =
  "이 사이트가 어떤 정보를 싣고, 방문자에 대해 무엇을 남기는지 적어 뒀다.";

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
      <BackLink />

      <article className="px-5 pt-1.5">
        <h1 className="text-3xl font-black tracking-tighter">{TITLE}</h1>
        <p className={BODY}>
          이 사이트가 어떤 정보를 다루는지 적어 둔다.
        </p>

        <h2 className={HEADING}>출연진 정보</h2>
        <p className={BODY}>
          방송 가명, 공개된 경우의 실명, 방영 당시 나이와 직업, 공개 인스타그램
          계정, 그리고 그 계정을 언제 어떻게 확인했는지를 싣는다.
        </p>
        <p className={BODY}>
          전부 방송과 공개된 자료에서 모은 것이고 본인에게 직접 받지 않는다.
          비공개 계정과 확인되지 않은 추측은 싣지 않는다. 사진은 쓰지 않는다.
        </p>

        <h2 className={HEADING}>방문자 정보</h2>
        <p className={BODY}>
          회원가입도 로그인도 없다. 이름이나 연락처를 입력받는 화면이 없다.
        </p>
        <p className={BODY}>
          접속 통계로 Vercel Web Analytics 를 쓴다. 어떤 페이지가 열렸는지, 어디서
          들어왔는지, 기기와 브라우저 종류 정도가 익명으로 집계된다. 쿠키는 쓰지
          않고 방문자를 따로 식별하지 않는다.
        </p>
        <p className={BODY}>
          메일로 문의하면 그 주소와 내용이 메일함에 남는다. 처리가 끝나면 지운다.
        </p>

        <h2 className={HEADING}>맡기는 곳</h2>
        <p className={BODY}>
          호스팅과 접속 통계는 Vercel Inc.(미국) 를 쓴다. 사이트에 접속하면 접속
          기록이 이곳에 남는다. 그 밖에 누구에게도 넘기거나 팔지 않는다.
        </p>

        <h2 className={HEADING}>광고</h2>
        <p className={BODY}>
          지금은 광고를 붙이지 않았다. 붙이면 광고사가 쿠키를 쓰게 되므로 이
          문서를 먼저 고친다.
        </p>

        <h2 className={HEADING}>권리</h2>
        <p className={BODY}>
          자기 정보를 열람·정정·삭제해 달라고 요청할 수 있다. 이유는 묻지 않고,
          확인되면 바로 지운다.{" "}
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
