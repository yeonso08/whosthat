import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { CastCard } from "@/components/cast-card";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { getSeason, getSeasons } from "@/lib/data";
import {
  fill,
  getDictionary,
  isLocale,
  languageAlternates,
  localizeProgramName,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { isIndexable, openGraphBase, seasonSchema } from "@/lib/seo";
import { getCoverage } from "@/lib/types";

/** 언어는 루트 레이아웃이 만든다 — 여기서는 기수만 내고 둘이 곱해진다. */
export function generateStaticParams() {
  return getSeasons().map((season) => ({ id: season.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/seasons/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};

  const season = getSeason(id);
  if (!season) return {};

  const dict = getDictionary(lang);
  const coverage = getCoverage(season.cast);
  const { label, special } = localizeSeason(season, lang);
  const values = {
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
  const path = seasonHref(lang, season.id);

  return {
    // 제목에 이미 프로그램 이름이 들어 있어서 루트의 title.template 을 그대로
    // 두면 사이트 이름이 뒤에 또 붙는다.
    title: { absolute: title },
    description,
    // 같은 기수가 여러 경로로 잡히면 색인이 쪼개진다.
    alternates: {
      canonical: path,
      languages: languageAlternates(`/seasons/${season.id}`),
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
}: PageProps<"/[lang]/seasons/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const season = getSeason(id);
  if (!season) notFound();

  const dict = getDictionary(lang);
  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, lang);

  return (
    <main>
      <JsonLd data={seasonSchema(season, lang)} />

      <header className="px-5 pt-6">
        <SiteHeader />

        {/* 제목이 "33기" 뿐이면 이 화면에 프로그램 이름이 한 글자도 안 남는다 —
            검색어는 "나는 솔로 33기" 인데 본문이 그걸 뒷받침하지 못한다.
            홈의 머리글과 같은 구조다. */}
        <p className="mt-5 text-sm font-bold tracking-tight text-muted-foreground">
          {localizeProgramName(season.programId, lang)}
        </p>

        {/* 뒤로가기를 제목 줄에 붙인다. 화살표의 44px 탭 영역이 제목을 밀지
            않게 줄 전체를 왼쪽으로 당겨 화살표를 본문 여백선에 맞춘다. */}
        <div className="mt-3 -ml-3 flex items-start gap-1">
          <BackLink />
          <h1 className="text-3xl font-black tracking-tighter">{label}</h1>
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
        <section className="mt-5 grid grid-cols-2 gap-3 px-5">
          {season.cast.map((member) => (
            <CastCard key={member.id} member={member} />
          ))}
        </section>
      ) : (
        <p className="mt-6 rounded-2xl bg-card px-5 py-8 text-center text-[13px] leading-relaxed text-muted-foreground mx-5">
          {dict.season.castPendingBody}
        </p>
      )}
    </main>
  );
}
