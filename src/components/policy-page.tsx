import type { ReactNode } from "react";
import { BackLink } from "@/components/back-link";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/page-heading";
import { SiteHeader } from "@/components/site-header";
import { currentDictionary, currentLocale } from "@/lib/i18n";
import { homeHref } from "@/lib/links";
import type { Schema } from "@/lib/seo";

/** 정책 문서의 소제목. */
export const POLICY_HEADING = "mt-8 text-sm font-bold";

/** 정책 문서의 본문 한 문단. */
export const POLICY_BODY =
  "mt-2.5 text-[13px] leading-relaxed text-muted-foreground";

/** 문장 안에 박히는 낱말 강조. */
export const POLICY_STRONG = "font-semibold text-foreground";

/**
 * 산문 속 링크. 푸터도 이 스타일을 쓴다 — 푸터의 링크 두 개가 가리키는 곳이
 * 정확히 이 두 페이지라, 같은 글이 이어지는 것처럼 보이는 편이 맞다.
 */
export const POLICY_LINK = "underline underline-offset-4 hover:text-foreground";

type Props = {
  title: string;
  /** 탐색경로(BreadcrumbList). 두 페이지 다 홈 › 이 페이지 두 단계다. */
  schema: Schema;
  children: ReactNode;
};

/**
 * 정책 두 페이지(`/takedown`·`/privacy`)의 껍데기.
 *
 * 둘은 홈을 안 거치고 검색으로 바로 착지하는 페이지다 — 그래서 워드마크로
 * 어느 사이트의 방침인지 화면에서 밝히는 것까지가 이 껍데기의 몫이다.
 */
export async function PolicyPage({ title, schema, children }: Props) {
  const locale = await currentLocale();
  const dict = await currentDictionary();

  return (
    <main>
      <JsonLd data={schema} />

      <header className="gutter pt-6">
        <SiteHeader />
      </header>

      <article className="gutter max-w-[68ch] pt-5">
        {/* 화살표의 44px 탭 영역이 제목을 밀지 않게 줄 전체를 왼쪽으로 당긴다. */}
        <div className="-ml-3 flex items-start gap-1">
          <BackLink href={homeHref(locale)} label={dict.nav.backHome} />
          <PageTitle>{title}</PageTitle>
        </div>
        {children}
      </article>
    </main>
  );
}

/**
 * 번역본이라는 사실 자체가 약속의 일부다 — 원문이 어느 쪽인지 밝힌다.
 *
 * 한국어 사전에서는 이 키가 빈 문자열이라 화면에서 통째로 빠진다. 위 여백은
 * 앞에 뭐가 오느냐에 따라 달라서 쓰는 쪽이 정한다.
 */
export function TranslationNote({
  note,
  className = "mt-8",
}: {
  note: string;
  className?: string;
}) {
  if (!note) return null;

  return <p className={`${className} text-xs text-muted-foreground`}>{note}</p>;
}
