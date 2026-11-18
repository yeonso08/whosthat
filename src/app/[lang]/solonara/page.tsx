import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/page-heading";
import { SolonaraBrowser } from "@/components/solonara-browser";
import { KIND_ICON, SolonaraSeasonCard } from "@/components/solonara-season-card";
import { getSolonaraSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  localizeSeason,
  type Locale,
} from "@/lib/i18n";
import { homeHref, solonaraHref } from "@/lib/links";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { breadcrumbSchema, openGraphBase } from "@/lib/seo";
import { SOLONARA_ITEM_KINDS, type SolonaraSeason } from "@/lib/types";

/**
 * 숙소와 게임 모음 — 나는 솔로 기수마다 묵은 숙소와, 첫인상·데이트 상대를 정한
 * 방식, 슈퍼 데이트권을 건 게임을 모은 화면(2026-11-18).
 *
 * 숙소 목록만이면 다른 사이트에도 있다. 놀이마다 진행 방법을 적어 두는 것이 이
 * 화면의 몫이다 — 나는 솔로처럼 모임을 열어 보거나 그 숙소에 놀러 가려는 사람이
 * 가져다 쓰는 화면이라, 다른 모음 화면(탭 + 찾기)과 달리 놀이 종류 칩이 있다.
 *
 * **한국어 화면만 있다** — 방식 문장이 한국어로만 쓰여 있다(회차 글과 같은 이유).
 */

/** 판 하나를 찾을 때 훑는 글 — 기수·특집, 숙소 이름·주소, 게임 이름과 진행 방법. */
function seasonKeywords(entry: SolonaraSeason, locale: Locale): string {
  const { label, special } = localizeSeason(entry.season, locale);
  return [
    label,
    special,
    entry.stay?.name,
    entry.stay?.address,
    ...entry.items.flatMap((item) => [item.name, item.how]),
  ]
    .filter(Boolean)
    .join(" ");
}

async function solonaraText(locale: Locale) {
  const dict = getDictionary(locale).solonara;
  const entries = await getSolonaraSeasons();
  const count = entries.length;
  return {
    entries,
    count,
    title: dict.metaTitle,
    description: fill(dict.description, { count }),
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/solonara">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== DEFAULT_LOCALE) return {};

  const { title, description } = await solonaraText(lang);
  const url = solonaraHref(lang);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      ...openGraphBase(lang),
      type: "article",
      title,
      description,
      url,
    },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/solonara">) {
  const { lang } = await params;
  if (!isLocale(lang) || lang !== DEFAULT_LOCALE) notFound();

  const dict = getDictionary(lang);
  const { entries, count } = await solonaraText(lang);
  if (count === 0) notFound();

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema(lang, {
          name: dict.solonara.navLabel,
          path: solonaraHref(lang),
        })}
      />

      <header className="gutter pt-8 lg:pt-12">
        <div className="-ml-3 flex items-start gap-1">
          <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
          <PageTitle>{dict.solonara.heading}</PageTitle>
        </div>
        <p className="mt-3 max-w-[62ch] text-[13.5px] leading-[1.75] whitespace-pre-line text-pretty break-keep text-muted-foreground">
          {fill(dict.solonara.lead, { count })}
        </p>
      </header>

      <SolonaraBrowser
        kinds={SOLONARA_ITEM_KINDS.map((kind) => {
          const Icon = KIND_ICON[kind];
          return {
            id: kind,
            label: dict.solonara.kinds[kind],
            icon: <Icon className="size-4" aria-hidden />,
          };
        })}
        items={entries.map((entry) => ({
          id: entry.season.id,
          keywords: seasonKeywords(entry, lang),
          kinds: [...new Set(entry.items.map((item) => item.kind))],
          card: <SolonaraSeasonCard entry={entry} />,
        }))}
        text={{
          all: dict.solonara.all,
          placeholder: dict.solonara.searchPlaceholder,
          clear: dict.search.clear,
          empty: dict.search.emptyTitle,
        }}
      />
    </main>
  );
}
