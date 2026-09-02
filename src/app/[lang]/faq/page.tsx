import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import {
  POLICY_BODY,
  POLICY_HEADING,
  POLICY_LINK,
  PolicyPage,
  TranslationNote,
} from "@/components/policy-page";
import { BrandSentence } from "@/components/wordmark";
import { getDictionary, isLocale } from "@/lib/i18n";
import { aboutHref, faqHref } from "@/lib/links";
import { breadcrumbSchema, faqSchema, policyMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return policyMetadata(lang, "faq");
}

export default async function Page({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const faq = dict.faq;

  return (
    <PolicyPage
      title={faq.title}
      schema={breadcrumbSchema(lang, { name: faq.title, path: faqHref(lang) })}
    >
      {/* 문답은 화면에 그대로 있는 것을 옮긴다 — 껍데기의 탐색경로와 별개라
          여기서 한 벌 더 낸다. */}
      <JsonLd data={faqSchema(lang)} />

      <p className={POLICY_BODY}>
        <BrandSentence text={faq.intro} />{" "}
        <Link href={aboutHref(lang)} className={POLICY_LINK}>
          {faq.aboutLink}
        </Link>
      </p>

      {faq.items.map((item) => (
        <section key={item.q}>
          <h2 className={POLICY_HEADING}>{item.q}</h2>
          <p className={POLICY_BODY}>{item.a}</p>
        </section>
      ))}

      <TranslationNote note={faq.translationNote} />
    </PolicyPage>
  );
}
