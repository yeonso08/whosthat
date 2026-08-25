import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading, PageEyebrow, PageTitle } from "@/components/page-heading";
import { SeasonFeature } from "@/components/season-feature";
import { SeasonRow } from "@/components/season-row";
import { SeasonSearch } from "@/components/season-search";
import { SiteHeader } from "@/components/site-header";
import { buildSearchIndex, getProgram, getSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  localizeProgramName,
} from "@/lib/i18n";
import { websiteSchema } from "@/lib/seo";
import { getTotals } from "@/lib/types";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const program = getProgram();
  const seasons = getSeasons();
  const [featured, ...rest] = seasons;

  const totals = getTotals(seasons);

  return (
    <main>
      {/* 사이트 이름을 검색 결과에 도메인 대신 띄우려면 홈에 이 마크업이 있어야 한다. */}
      <JsonLd data={websiteSchema(lang)} />

      <header className="px-5 pt-6 pb-1">
        <SiteHeader />
        <PageEyebrow>{localizeProgramName(program.id, lang)}</PageEyebrow>
        <PageTitle className="mt-3">{dict.home.heading}</PageTitle>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {fill(dict.home.summary, totals)}
        </p>
      </header>

      {featured && (
        <div className="mt-5 px-5">
          <SeasonFeature season={featured} />
        </div>
      )}

      {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 목록이 보인다. */}
      <SeasonSearch
        index={buildSearchIndex(lang)}
        locale={lang}
        text={dict.search}
        status={dict.status}
      >
        {rest.length > 0 && (
          <>
            <GroupHeading>{dict.home.pastSeasons}</GroupHeading>
            <section className="px-2">
              {rest.map((season) => (
                <SeasonRow key={season.id} season={season} />
              ))}
            </section>
          </>
        )}
      </SeasonSearch>
    </main>
  );
}
