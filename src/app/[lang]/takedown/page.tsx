import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  POLICY_BODY,
  POLICY_HEADING,
  POLICY_STRONG,
  PolicyPage,
  TranslationNote,
} from "@/components/policy-page";
import { Button } from "@/components/ui/button";
import { BrandSentence } from "@/components/wordmark";
import { getDictionary, isLocale } from "@/lib/i18n";
import { takedownHref } from "@/lib/links";
import { breadcrumbSchema, policyMetadata } from "@/lib/seo";
import { contactMailto, CONTACT_EMAIL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/takedown">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return policyMetadata(lang, "takedown");
}

export default async function Page({ params }: PageProps<"/[lang]/takedown">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang).takedown;

  return (
    <PolicyPage
      title={dict.title}
      schema={breadcrumbSchema(lang, {
        name: dict.title,
        path: takedownHref(lang),
      })}
    >
      <p className={POLICY_BODY}>
        <BrandSentence text={dict.intro} />
      </p>

      <h2 className={POLICY_HEADING}>{dict.requestsHeading}</h2>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-4 text-[13.5px] leading-relaxed text-muted-foreground">
        {dict.requests.map((request) => (
          <li key={request}>{request}</li>
        ))}
      </ul>
      <p className={POLICY_BODY}>{dict.requestsNote}</p>

      <h2 className={POLICY_HEADING}>{dict.howHeading}</h2>
      <p className={POLICY_BODY}>
        {dict.howBefore}
        <strong className={POLICY_STRONG}>{dict.howWhat}</strong>
        {dict.howMiddle}
        <strong className={POLICY_STRONG}>{dict.howFix}</strong>
        {dict.howAfter}
      </p>
      <Button
        // 이 화면에서 유일하게 누르는 것이라 손가락 자리(48px)까지 키우고
        // 판과 같은 반경을 준다 — 8px 짜리 회색 막대는 안내문의 일부로 읽힌다.
        className="mt-5 h-12 w-full rounded-2xl text-[15px] font-bold"
        nativeButton={false}
        render={<a href={contactMailto(dict.mailSubject)} />}
      >
        {dict.button}
      </Button>
      <p className="font-lat mt-3 text-center text-xs text-muted-foreground">
        {CONTACT_EMAIL}
      </p>

      <h2 className={POLICY_HEADING}>{dict.verifyHeading}</h2>
      <p className={POLICY_BODY}>{dict.verifyBody}</p>

      <h2 className={POLICY_HEADING}>{dict.timeHeading}</h2>
      <p className={POLICY_BODY}>{dict.timeBody}</p>

      <TranslationNote note={dict.translationNote} />
    </PolicyPage>
  );
}
