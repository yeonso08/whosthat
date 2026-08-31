import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { CastCard } from "@/components/cast-card";
import { EmptyCard } from "@/components/empty-card";
import { JsonLd } from "@/components/json-ld";
import { PageEyebrow, PageTitle } from "@/components/page-heading";
import { getProgram, getPrograms, getSeason, getSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  languageAlternates,
  localizeProgramName,
  localizeSeason,
} from "@/lib/i18n";
import { programHref, seasonHref, seasonPath } from "@/lib/links";
import { isIndexable, openGraphBase, seasonSchema } from "@/lib/seo";
import { getCoverage } from "@/lib/types";

/**
 * 언어는 루트 레이아웃이 만들고 여기서 프로그램 × 기수를 곱한다.
 *
 * 프로그램과 기수를 한 번에 내는 이유: 기수 id 는 프로그램 안에서만 고유해서
 * (`s1` 이 두 프로그램에 다 있다) 두 값이 짝으로 나와야 한다.
 */
export function generateStaticParams() {
  return getPrograms().flatMap((program) =>
    getSeasons(program).map((season) => ({
      program: program.id,
      id: season.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[program]/seasons/[id]">): Promise<Metadata> {
  const { lang, program: programId, id } = await params;
  if (!isLocale(lang)) return {};

  const season = getSeason(programId, id);
  if (!season) return {};

  const dict = getDictionary(lang);
  const coverage = getCoverage(season.cast);
  const { label, special } = localizeSeason(season, lang);
  const values = {
    program: localizeProgramName(programId, lang),
    season: label,
    special: special ? ` ${special}` : "",
    total: coverage.total,
    found: coverage.found,
  };

  const title = fill(dict.season.metaTitle, values);
  const description = fill(
    coverage.total === 0
      ? dict.season.metaDescriptionPending
      : dict.season.metaDescription,
    values,
  );
  const path = seasonHref(lang, programId, season.id);

  return {
    // 제목에 이미 프로그램 이름이 들어 있어서 루트의 title.template 을 그대로
    // 두면 사이트 이름이 뒤에 또 붙는다.
    title: { absolute: title },
    description,
    // 같은 기수가 여러 경로로 잡히면 색인이 쪼개진다.
    alternates: {
      canonical: path,
      languages: languageAlternates(seasonPath(programId, season.id)),
    },
    // 명단을 못 채운 기수는 색인에서 뺀다 — 이유는 `isIndexable` 에 적어 뒀다.
    // 링크는 계속 따라가게 두므로(`follow`) 크롤러가 여기서 막히지는 않는다.
    ...(isIndexable(season) ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      ...openGraphBase(lang),
      type: "article",
      title,
      description,
      url: path,
    },
  };
}

export default async function Page({
  params,
}: PageProps<"/[lang]/[program]/seasons/[id]">) {
  const { lang, program: programId, id } = await params;
  if (!isLocale(lang)) notFound();

  const program = getProgram(programId);
  const season = getSeason(programId, id);
  if (!program || !season) notFound();

  const dict = getDictionary(lang);
  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, lang);
  const programName = localizeProgramName(programId, lang);

  return (
    <main>
      <JsonLd data={seasonSchema(program, season, lang)} />

      <header className="gutter pt-7 lg:pt-10">

        <PageEyebrow>{programName}</PageEyebrow>

        {/* 뒤로가기를 제목 줄에 붙인다. 화살표의 44px 탭 영역이 제목을 밀지
            않게 줄 전체를 왼쪽으로 당겨 화살표를 본문 여백선에 맞춘다.
            돌아가는 곳은 홈이 아니라 이 기수가 속한 프로그램 목록이다. */}
        <div className="mt-3 -ml-3 flex items-start gap-1">
          <BackLink
            href={programHref(lang, programId)}
            label={fill(dict.nav.back, { program: programName })}
          />
          <PageTitle>{label}</PageTitle>
        </div>

        {special && (
          <p className="mt-2 text-[13px] font-bold text-muted-foreground">
            {special}
          </p>
        )}
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {airDate ? `${fill(dict.season.aired, { date: airDate })} · ` : ""}
          {coverage.total === 0
            ? dict.season.castPending
            : fill(dict.season.castCount, {
                total: coverage.total,
                found: coverage.found,
              })}
        </p>
      </header>

      {season.cast.length > 0 ? (
        <section className="gutter mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
          {season.cast.map((member) => (
            <CastCard key={member.id} member={member} />
          ))}
        </section>
      ) : (
        <EmptyCard>{dict.season.castPendingBody}</EmptyCard>
      )}
    </main>
  );
}
