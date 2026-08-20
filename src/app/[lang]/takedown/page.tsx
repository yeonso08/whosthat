import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { BRAND_WORDMARK } from "@/lib/brand";
import { getDictionary, isLocale, languageAlternates } from "@/lib/i18n";
import { contactMailto, takedownHref } from "@/lib/links";
import { CONTACT_EMAIL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/takedown">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { title, description } = getDictionary(lang).takedown;
  const path = takedownHref(lang);

  return {
    title,
    description,
    alternates: { canonical: path, languages: languageAlternates("/takedown") },
    openGraph: { type: "article", title, description, url: path },
  };
}

const HEADING = "mt-8 text-sm font-bold";
const BODY = "mt-2.5 text-[13px] leading-relaxed text-muted-foreground";
const STRONG = "font-semibold text-foreground";

export default async function Page({ params }: PageProps<"/[lang]/takedown">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang).takedown;
  // 워드마크가 문장 안에 들어가는데 자리가 언어마다 다르다 — 한국어는 조사가
  // 붙어 맨 앞, 영어는 주어라 역시 앞이지만 뒤에 공백이 필요하다.
  const [beforeBrand, afterBrand] = dict.intro.split("{brand}");

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
          <h1 className="text-3xl font-black tracking-tighter">{dict.title}</h1>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {beforeBrand}
          <span className="font-lat font-semibold text-foreground">
            {BRAND_WORDMARK}
          </span>
          {afterBrand}
        </p>

        <h2 className={HEADING}>{dict.requestsHeading}</h2>
        <ul className="mt-2.5 flex list-disc flex-col gap-1.5 pl-4 text-[13px] leading-relaxed text-muted-foreground">
          {dict.requests.map((request) => (
            <li key={request}>{request}</li>
          ))}
        </ul>
        <p className={BODY}>{dict.requestsNote}</p>

        <h2 className={HEADING}>{dict.howHeading}</h2>
        <p className={BODY}>
          {dict.howBefore}
          <strong className={STRONG}>{dict.howWhat}</strong>
          {dict.howMiddle}
          <strong className={STRONG}>{dict.howFix}</strong>
          {dict.howAfter}
        </p>
        <Button
          className="mt-4 w-full"
          nativeButton={false}
          render={<a href={contactMailto(dict.mailSubject)} />}
        >
          {dict.button}
        </Button>
        <p className="font-lat mt-2.5 text-center text-xs text-muted-foreground">
          {CONTACT_EMAIL}
        </p>

        <h2 className={HEADING}>{dict.verifyHeading}</h2>
        <p className={BODY}>{dict.verifyBody}</p>

        <h2 className={HEADING}>{dict.timeHeading}</h2>
        <p className={BODY}>{dict.timeBody}</p>

        {/* 번역본이라는 사실 자체가 약속의 일부다 — 원문이 어느 쪽인지 밝힌다. */}
        {dict.translationNote && (
          <p className="mt-8 text-xs text-muted-foreground">
            {dict.translationNote}
          </p>
        )}
      </article>
    </main>
  );
}
