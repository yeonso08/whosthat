import { notFound } from "next/navigation";
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
import { getCoverage } from "@/lib/types";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const program = getProgram();
  const seasons = getSeasons();
  const [featured, ...rest] = seasons;

  const totals = seasons.reduce(
    (acc, season) => {
      const c = getCoverage(season.cast);
      return { people: acc.people + c.total, found: acc.found + c.found };
    },
    { people: 0, found: 0 },
  );

  return (
    <main>
      <header className="px-5 pt-6 pb-1">
        <SiteHeader />
        <p className="mt-5 text-sm font-bold tracking-tight text-muted-foreground">
          {localizeProgramName(program.id, lang)}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tighter">
          {dict.home.heading}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {fill(dict.home.summary, {
            seasons: seasons.length,
            people: totals.people,
            found: totals.found,
          })}
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
            <h2 className="px-5 pt-7 pb-2 text-[13px] font-bold text-muted-foreground">
              {dict.home.pastSeasons}
            </h2>
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
