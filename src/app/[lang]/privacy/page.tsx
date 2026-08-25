import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  POLICY_BODY,
  POLICY_HEADING,
  POLICY_LINK,
  PolicyPage,
  TranslationNote,
} from "@/components/policy-page";
import { BrandSentence } from "@/components/wordmark";
import { fill, getDictionary, isLocale } from "@/lib/i18n";
import { privacyHref, takedownHref } from "@/lib/links";
import { breadcrumbSchema, policyMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * 구글이 광고에 쿠키를 어떻게 쓰는지 밝힌 공식 문서. 아래 광고 문단은 그걸
 * 두 줄로 줄인 것이라, 원문을 방문자가 직접 열어 볼 수 있어야 한다.
 */
const GOOGLE_ADS_POLICY_URL = "https://policies.google.com/technologies/ads";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return policyMetadata(lang, "privacy");
}

export default async function Page({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const privacy = dict.privacy;

  return (
    <PolicyPage
      title={privacy.title}
      schema={breadcrumbSchema(lang, {
        name: privacy.title,
        path: privacyHref(lang),
      })}
    >
      <p className={POLICY_BODY}>
        <BrandSentence text={privacy.intro} />
      </p>

      <h2 className={POLICY_HEADING}>{privacy.castHeading}</h2>
      <p className={POLICY_BODY}>{privacy.cast1}</p>
      <p className={POLICY_BODY}>{privacy.cast2}</p>

      <h2 className={POLICY_HEADING}>{privacy.visitorHeading}</h2>
      <p className={POLICY_BODY}>{privacy.visitor1}</p>
      <p className={POLICY_BODY}>{privacy.visitor2}</p>
      <p className={POLICY_BODY}>{privacy.visitor3}</p>

      <h2 className={POLICY_HEADING}>{privacy.processorHeading}</h2>
      <p className={POLICY_BODY}>{privacy.processor}</p>

      <h2 className={POLICY_HEADING}>{privacy.adsHeading}</h2>
      <p className={POLICY_BODY}>
        {privacy.ads}{" "}
        <a
          href={GOOGLE_ADS_POLICY_URL}
          target="_blank"
          rel="noreferrer"
          className={POLICY_LINK}
        >
          {privacy.adsLink}
        </a>
      </p>

      <h2 className={POLICY_HEADING}>{privacy.rightsHeading}</h2>
      <p className={POLICY_BODY}>
        {privacy.rights}{" "}
        <Link href={takedownHref(lang)} className={POLICY_LINK}>
          {dict.takedown.title}
        </Link>
      </p>

      <h2 className={POLICY_HEADING}>{privacy.contactHeading}</h2>
      <p className={`font-lat ${POLICY_BODY}`}>{CONTACT_EMAIL}</p>

      <p className="mt-8 text-xs text-muted-foreground">
        {fill(privacy.effective, { date: privacy.effectiveDate })}
      </p>

      <TranslationNote note={privacy.translationNote} className="mt-2" />
    </PolicyPage>
  );
}
