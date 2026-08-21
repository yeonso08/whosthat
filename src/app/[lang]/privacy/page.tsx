import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { BRAND_WORDMARK } from "@/lib/brand";
import { fill, getDictionary, isLocale, languageAlternates } from "@/lib/i18n";
import { privacyHref, takedownHref } from "@/lib/links";
import { breadcrumbSchema, openGraphBase } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { title, description } = getDictionary(lang).privacy;
  const path = privacyHref(lang);

  return {
    title,
    description,
    alternates: { canonical: path, languages: languageAlternates("/privacy") },
    openGraph: {
      ...openGraphBase(lang),
      type: "article",
      title,
      description,
      url: path,
    },
  };
}

const HEADING = "mt-8 text-sm font-bold";
const BODY = "mt-2.5 text-[13px] leading-relaxed text-muted-foreground";

export default async function Page({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const privacy = dict.privacy;
  const [beforeBrand, afterBrand] = privacy.intro.split("{brand}");

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema(lang, { name: privacy.title, path: privacyHref(lang) })}
      />

      {/* 홈을 안 거치고 검색으로 바로 들어오는 페이지라 누구의 방침인지
          화면에서 밝혀 둔다. */}
      <header className="px-5 pt-6">
        <SiteHeader />
      </header>

      <article className="px-5 pt-5">
        {/* 화살표의 44px 탭 영역이 제목을 밀지 않게 줄 전체를 왼쪽으로 당긴다. */}
        <div className="-ml-3 flex items-start gap-1">
          <BackLink />
          <h1 className="text-3xl font-black tracking-tighter">
            {privacy.title}
          </h1>
        </div>
        <p className={BODY}>
          {beforeBrand}
          <span className="font-lat font-semibold text-foreground">
            {BRAND_WORDMARK}
          </span>
          {afterBrand}
        </p>

        <h2 className={HEADING}>{privacy.castHeading}</h2>
        <p className={BODY}>{privacy.cast1}</p>
        <p className={BODY}>{privacy.cast2}</p>

        <h2 className={HEADING}>{privacy.visitorHeading}</h2>
        <p className={BODY}>{privacy.visitor1}</p>
        <p className={BODY}>{privacy.visitor2}</p>
        <p className={BODY}>{privacy.visitor3}</p>

        <h2 className={HEADING}>{privacy.processorHeading}</h2>
        <p className={BODY}>{privacy.processor}</p>

        <h2 className={HEADING}>{privacy.adsHeading}</h2>
        <p className={BODY}>{privacy.ads}</p>

        <h2 className={HEADING}>{privacy.rightsHeading}</h2>
        <p className={BODY}>
          {privacy.rights}{" "}
          <Link
            href={takedownHref(lang)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {dict.takedown.title}
          </Link>
        </p>

        <h2 className={HEADING}>{privacy.contactHeading}</h2>
        <p className={`font-lat ${BODY}`}>{CONTACT_EMAIL}</p>

        <p className="mt-8 text-xs text-muted-foreground">
          {fill(privacy.effective, { date: privacy.effectiveDate })}
        </p>

        {/* 번역본이라는 사실 자체가 약속의 일부다 — 원문이 어느 쪽인지 밝힌다. */}
        {privacy.translationNote && (
          <p className="mt-2 text-xs text-muted-foreground">
            {privacy.translationNote}
          </p>
        )}
      </article>
    </main>
  );
}
