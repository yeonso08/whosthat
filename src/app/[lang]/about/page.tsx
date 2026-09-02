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
import { getDictionary, isLocale } from "@/lib/i18n";
import { aboutHref, faqHref, takedownHref } from "@/lib/links";
import { breadcrumbSchema, policyMetadata } from "@/lib/seo";

/** 문단 사이의 목록. 상태·근거·제외 세 곳이 같은 모양이라 한 번만 적는다. */
const LIST = "mt-3 flex list-disc flex-col gap-2 pl-5";
const LIST_ITEM = "text-[13.5px] leading-[1.75] text-muted-foreground";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return policyMetadata(lang, "about");
}

export default async function Page({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const about = dict.about;

  return (
    <PolicyPage
      title={about.title}
      schema={breadcrumbSchema(lang, {
        name: about.title,
        path: aboutHref(lang),
      })}
    >
      <p className={POLICY_BODY}>
        <BrandSentence text={about.intro} />
      </p>

      <h2 className={POLICY_HEADING}>{about.whyHeading}</h2>
      <p className={POLICY_BODY}>{about.why1}</p>
      <p className={POLICY_BODY}>{about.why2}</p>
      <p className={POLICY_BODY}>{about.why3}</p>

      <h2 className={POLICY_HEADING}>{about.whatHeading}</h2>
      <p className={POLICY_BODY}>{about.what1}</p>
      <ul className={LIST}>
        {about.whatStates.map((line) => (
          <li key={line} className={LIST_ITEM}>
            {line}
          </li>
        ))}
      </ul>
      <p className={POLICY_BODY}>{about.what2}</p>

      <h2 className={POLICY_HEADING}>{about.howHeading}</h2>
      <p className={POLICY_BODY}>{about.how1}</p>
      <ul className={LIST}>
        {about.howEvidence.map((line) => (
          <li key={line} className={LIST_ITEM}>
            {line}
          </li>
        ))}
      </ul>
      <p className={POLICY_BODY}>{about.how2}</p>
      <p className={POLICY_BODY}>{about.how3}</p>

      <h2 className={POLICY_HEADING}>{about.excludeHeading}</h2>
      <ul className={LIST}>
        {about.exclude.map((line) => (
          <li key={line} className={LIST_ITEM}>
            {line}
          </li>
        ))}
      </ul>
      <p className={POLICY_BODY}>{about.excludeNote}</p>

      <h2 className={POLICY_HEADING}>{about.photoHeading}</h2>
      <p className={POLICY_BODY}>{about.photo1}</p>

      <h2 className={POLICY_HEADING}>{about.programsHeading}</h2>
      <p className={POLICY_BODY}>{about.programs1}</p>
      <p className={POLICY_BODY}>{about.programs2}</p>

      <h2 className={POLICY_HEADING}>{about.updateHeading}</h2>
      <p className={POLICY_BODY}>{about.update1}</p>
      <p className={POLICY_BODY}>{about.update2}</p>

      <h2 className={POLICY_HEADING}>{about.fixHeading}</h2>
      <p className={POLICY_BODY}>
        {about.fix1}{" "}
        <Link href={takedownHref(lang)} className={POLICY_LINK}>
          {about.fixLink}
        </Link>
        {" · "}
        <Link href={faqHref(lang)} className={POLICY_LINK}>
          {about.faqLink}
        </Link>
      </p>

      <TranslationNote note={about.translationNote} />
    </PolicyPage>
  );
}
