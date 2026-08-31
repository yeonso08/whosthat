import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/page-heading";
import { ProgramRow } from "@/components/program-row";
import { SeasonSearch } from "@/components/season-search";
import { SiteHeader } from "@/components/site-header";
import { buildSearchIndex, getPrograms } from "@/lib/data";
import { fill, getDictionary, isLocale } from "@/lib/i18n";
import { websiteSchema } from "@/lib/seo";
import { getSiteTotals } from "@/lib/types";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const programs = getPrograms();

  return (
    <main>
      {/* 사이트 이름을 검색 결과에 도메인 대신 띄우려면 홈에 이 마크업이 있어야 한다. */}
      <JsonLd data={websiteSchema(lang)} />

      <header className="px-5 pt-6 pb-1">
        <SiteHeader />
        <PageTitle className="mt-6">{dict.home.heading}</PageTitle>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {fill(dict.home.summary, getSiteTotals(programs))}
        </p>
      </header>

      {/* 홈의 인덱스는 프로그램을 안 가린다 — 착지하자마자 사람을 찾는 게 이
          사이트의 존재 이유라, 프로그램을 먼저 고르게 만들지 않는다. */}
      <SeasonSearch
        index={buildSearchIndex(lang)}
        locale={lang}
        text={dict.search}
        status={dict.status}
      >
        <section className="px-2 pt-2">
          {programs.map((program) => (
            <ProgramRow key={program.id} program={program} />
          ))}
        </section>
      </SeasonSearch>
    </main>
  );
}
