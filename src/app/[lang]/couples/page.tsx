import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { CollectionBrowser } from "@/components/collection-browser";
import { CoupleCard } from "@/components/couple-card";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/page-heading";
import { getProgramCouples } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  languageAlternates,
  localizeAlias,
  localizeProgramName,
  localizeProgramShortName,
  localizeSeason,
  type Locale,
} from "@/lib/i18n";
import { COUPLES_PATH, couplesHref, homeHref } from "@/lib/links";
import { breadcrumbSchema, openGraphBase } from "@/lib/seo";
import {
  countCouples,
  type CastMember,
  type ProgramCouples,
  type Season,
} from "@/lib/types";

/** `72쌍` — 한 쌍일 때 말이 달라지는 언어가 있어서 문구가 두 벌이다. */
function formatCount(count: number, locale: Locale): string {
  const dict = getDictionary(locale).couples;
  return fill(count === 1 ? dict.countOne : dict.count, { count });
}

/**
 * 판 하나를 찾을 때 훑는 글 — 프로그램·기수·특집·두 사람 이름. 번역 화면에서도
 * 한국 커뮤니티에서 본 말(`16기`·`영숙`)로 찾히게 한글 원문을 함께 싣는다
 * (`buildSearchIndex` 와 같은 이유다).
 */
function coupleKeywords(
  group: ProgramCouples,
  season: Season,
  couples: [CastMember, CastMember][],
  locale: Locale,
): string {
  const here = localizeSeason(season, locale);
  const source = localizeSeason(season, "ko");
  return [
    localizeProgramName(group.program.id, locale),
    localizeProgramShortName(group.program.id, locale),
    group.program.name,
    here.label,
    here.special,
    source.label,
    source.special,
    ...couples.flat().flatMap((member) => [
      localizeAlias(member.alias, locale),
      member.alias,
    ]),
  ].join(" ");
}

/**
 * 제목·설명에 들어가는 글자. 프로그램 이름을 사전에 박지 않고 데이터에서 잇는다 —
 * 최종 선택 기록이 생긴 프로그램이 저절로 제목에 들어온다.
 */
async function couplesText(locale: Locale) {
  const dict = getDictionary(locale);
  const groups = await getProgramCouples();
  const programs = groups
    // 짧은 이름이다 — 정식 이름으로 이으면 `나는 솔로·나는 솔로, 그 후 사랑은
    // 계속된다` 가 되어 같은 말이 두 번 읽히고, 사람들이 치는 말도 `나솔사계` 다.
    .map(({ program }) => localizeProgramShortName(program.id, locale))
    .join(dict.couples.programSeparator);
  const couples = countCouples(groups);

  return {
    groups,
    couples,
    title: fill(dict.couples.metaTitle, { programs }),
    description: fill(dict.couples.description, { programs, couples }),
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/couples">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { title, description } = await couplesText(lang);
  const url = couplesHref(lang);

  return {
    // 제목에 프로그램 이름이 다 들어 있어 이미 길다 — 루트의 title.template 이
    // 사이트 이름을 뒤에 또 붙이지 않게 한다(프로그램·기수 화면과 같다).
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(COUPLES_PATH) },
    openGraph: {
      ...openGraphBase(lang),
      type: "article",
      title,
      description,
      url,
    },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/couples">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const { groups, couples } = await couplesText(lang);

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema(lang, {
          name: dict.couples.navLabel,
          path: couplesHref(lang),
        })}
      />

      <header className="gutter pt-8 lg:pt-12">
        {/* 뒤로가기를 제목 줄에 붙인다 — 프로그램 화면과 같은 구조다. */}
        <div className="-ml-3 flex items-start gap-1">
          <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
          <PageTitle>{dict.couples.heading}</PageTitle>
        </div>
        {/* 두 문장을 사전의 `\n` 에서 끊는다 — 무엇을 모았는지와, 무엇은 여기 없는지다. */}
        <p className="mt-3 max-w-[62ch] text-[13.5px] leading-[1.75] whitespace-pre-line text-pretty break-keep text-muted-foreground">
          {fill(dict.couples.lead, { couples })}
        </p>
      </header>

      <CollectionBrowser
        groups={groups.map((group) => ({
          id: group.program.id,
          name: localizeProgramShortName(group.program.id, lang),
          count: formatCount(countCouples([group]), lang),
          items: group.seasons.map(({ season, couples: pairs }) => ({
            id: season.id,
            keywords: coupleKeywords(group, season, pairs, lang),
            card: <CoupleCard season={season} couples={pairs} />,
          })),
        }))}
        text={{
          placeholder: dict.couples.searchPlaceholder,
          clear: dict.search.clear,
          empty: dict.search.emptyTitle,
        }}
      />
    </main>
  );
}
