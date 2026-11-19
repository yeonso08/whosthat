import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AutoAds } from "@/components/ads";
import { BackLink } from "@/components/back-link";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading } from "@/components/page-heading";
import { SeasonFeature } from "@/components/season-feature";
import { SeasonTile } from "@/components/season-tile";
import { SeasonSearch } from "@/components/season-search";
import { WithBanner } from "@/components/with-banner";
import { buildSearchIndex, getProgram, getPrograms, getSeasons } from "@/lib/data";
import {
  fill,
  formatProgramSummary,
  getDictionary,
  isLocale,
  programStrings,
} from "@/lib/i18n";
import { homeHref } from "@/lib/links";
import { programTintBackground } from "@/lib/program-tint";
import {
  breadcrumbSchema,
  isProgramIndexable,
  programCrumb,
  programHasAdContent,
  programMetadata,
} from "@/lib/seo";
import { getTotals } from "@/lib/types";

/**
 * 머리글 포스터의 폭. 여기서는 포스터가 주인공이 아니라 제목의 짝이라, 2:3 의
 * 세로가 제목 덩어리보다 크게 솟지 않는 데서 멈춘다 — 168px(세로 252px)은 제목
 * 옆에서 기둥처럼 길었다(2026-11-19).
 */
const POSTER_WIDTH = "w-[88px] sm:w-[104px] lg:w-[120px]";

/** `next/image` 에 알려 주는 포스터 폭. **`POSTER_WIDTH` 와 짝이다.** */
const POSTER_SIZES = "(min-width: 1024px) 120px, (min-width: 640px) 104px, 88px";

/**
 * 뒤에 번지는 빛으로만 쓰는 포스터 — 크게 흐리므로 작은 파일이면 된다.
 */
const BACKDROP_SIZES = "160px";

/**
 * 뒤 빛이 사방으로 녹아드는 모양 — 포스터 쪽(왼쪽 위)이 가장 진하고 바깥으로
 * 사라진다. 휴대폰은 화면 비율, 넓은 화면은 px 크기다(아래 머리글 주석).
 */
const BACKDROP_MASK =
  "[mask-image:radial-gradient(75%_100%_at_25%_0%,black_20%,transparent_75%)] lg:[mask-image:radial-gradient(1000px_440px_at_calc(50%-360px)_0%,black_15%,transparent_70%)]";

/** 언어는 루트 레이아웃이 만든다 — 여기서는 프로그램만 내고 둘이 곱해진다. */
export async function generateStaticParams() {
  return (await getPrograms()).map((program) => ({ program: program.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[program]">): Promise<Metadata> {
  const { lang, program: programId } = await params;
  if (!isLocale(lang)) return {};

  const program = await getProgram(programId);
  if (!program) return {};

  return programMetadata(program, lang);
}

export default async function Page({
  params,
}: PageProps<"/[lang]/[program]">) {
  const { lang, program: programId } = await params;
  if (!isLocale(lang)) notFound();

  const program = await getProgram(programId);
  if (!program) notFound();

  const dict = getDictionary(lang);
  const strings = programStrings(program.id, lang);
  const seasons = getSeasons(program);
  const [featured, ...rest] = seasons;
  const showBanner = isProgramIndexable(program);

  return (
    // **읽는 화면은 좁은 기둥으로 묶는다.** 1280px 을 다 쓰면 기수 한 줄이
    // 왼쪽 끝의 제목과 오른쪽 끝의 숫자로 찢어져서, 한 줄인데 두 덩어리로
    // 읽힌다. 격자 화면(홈·기수 상세)만 컨테이너를 다 쓴다.
    //
    // 모비온 배너가 걸리면 데스크톱에서 오른쪽 세로 칸(간격 32 + 배너 160 + 끝 여백 32)만큼
    // 판을 넓힌다 — 기둥 폭은 860px 그대로다.
    <div className="relative isolate w-full overflow-x-clip">
      {/*
       * **앰비언트 포스터**(2026-11-19 재디자인). 포스터를 크게 흐려 머리글 뒤에
       * 깔고, 그 빛이 바탕으로 녹아든다 — 요즘 OTT 상세 화면의 문법이다. 프로그램
       * 마다 색이 저절로 갈려서, 같은 틀인데 화면마다 그 프로그램 같아진다. 포스터가
       * 없으면 홈 포스터 판과 같은 프로그램 색이 대신 번진다.
       *
       * **빛은 기둥 밖, 화면 폭 전체에 깐다.** 860px 기둥 안에 가둬 두면 넓은
       * 화면에서 가운데 떠 있는 흐린 상자로 보였다(2026-11-19 반려). 넓은 화면은
       * 빛의 크기를 px 로 못박는다 — 화면 폭의 비율이면 1920px 에서 화면 위쪽이
       * 통째로 물든다. 중심은 기둥 왼쪽의 포스터 자리다.
       */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[440px] overflow-hidden opacity-40 lg:opacity-30 dark:opacity-55 lg:dark:opacity-45 ${BACKDROP_MASK}`}
      >
        {program.posterUrl ? (
          <Image
            src={program.posterUrl}
            alt=""
            fill
            sizes={BACKDROP_SIZES}
            className="scale-125 object-cover blur-3xl saturate-150"
          />
        ) : (
          <div
            className="absolute inset-0 blur-3xl"
            style={{ background: programTintBackground(program.id) }}
          />
        )}
      </div>

      <main
        className={`font-home mx-auto w-full max-w-[860px] ${showBanner ? "lg:max-w-[1084px]" : ""}`}
      >
        <JsonLd data={breadcrumbSchema(lang, programCrumb(program, lang))} />
        {/* 확인한 계정이 한 건도 없는 프로그램에는 광고를 걸지 않는다. */}
        {programHasAdContent(program) && <AutoAds />}

        {/* 명단이 한 줄도 없는 프로그램에는 배너를 안 건다 — 화면이 빈 줄의 목록이다. */}
        <WithBanner show={showBanner}>
          <header className="gutter pt-6 pb-1 lg:pt-10">
            <div className="-ml-3">
              <BackLink href={homeHref(lang)} label={dict.nav.backHome} />
            </div>

            <div className="mt-3 flex items-end gap-5 lg:gap-8">
              {program.posterUrl && (
                <div
                  className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-xl shadow-lifted ring-1 ring-white/15 ring-inset lg:rounded-2xl ${POSTER_WIDTH}`}
                >
                  <Image
                    src={program.posterUrl}
                    alt={fill(dict.program.posterAlt, { program: strings.name })}
                    fill
                    priority
                    sizes={POSTER_SIZES}
                    className="object-cover"
                  />
                </div>
              )}

              <div className="min-w-0 pb-1">
                {/* 플랫폼은 칩 하나 — 홈 포스터 판 위에 얹던 그 줄이다. */}
                <span className="font-lat inline-block rounded-full bg-foreground/[0.07] px-2.5 py-1 text-[11px] font-bold tracking-[0.02em] text-foreground/80 backdrop-blur dark:bg-white/10">
                  {program.platform}
                </span>
                {/* 큰 제목은 프로그램 이름이다 — 이 화면을 찾아오는 검색어가 그것이다. */}
                <h1 className="mt-2.5 text-[28px] leading-[1.15] font-extrabold tracking-[-0.045em] break-keep [overflow-wrap:anywhere] sm:text-[34px] lg:text-[46px]">
                  {strings.name}
                </h1>
                <p className="mt-2 text-[13px] font-semibold text-muted-foreground lg:text-[14px]">
                  {formatProgramSummary(program.id, getTotals(seasons), lang)}
                </p>
              </div>
            </div>

            {/* 어떤 프로그램인지 한 문단. 검색으로 이 화면에 바로 착지하는 사람은
                프로그램 이름 말고는 아무 설명도 없이 목록을 마주하게 된다. */}
            <p className="mt-5 max-w-[62ch] text-[13.5px] leading-[1.75] text-muted-foreground lg:mt-6 lg:text-[14.5px]">
              {strings.about}
            </p>
          </header>

          {featured && (
            <div className="gutter mt-6">
              <SeasonFeature season={featured} />
            </div>
          )}

          {/* 검색창이 목록 자리를 쥐고 있다 — 입력이 없을 때만 아래 목록이 보인다.
              인덱스는 이 프로그램만 담는다: 프로그램 화면에서 친 말이 다른 프로그램
              으로 새면 지금 보고 있는 목록과 결과가 어긋난다. */}
          <SeasonSearch
            index={await buildSearchIndex(lang, program)}
            locale={lang}
            text={{
              ...dict.search,
              placeholder: strings.searchPlaceholder,
              seasonsHeading: strings.seasonsHeading,
            }}
            status={dict.status}
          >
            {rest.length > 0 && (
              <>
                <GroupHeading className="flex items-baseline gap-2">
                  {strings.pastSeasons}
                  <span className="font-lat text-[13px] font-semibold text-muted-foreground">
                    {rest.length}
                  </span>
                </GroupHeading>
                {/* 타일 격자 — 이유는 `SeasonTile` 에 있다. 기둥이 860px 라 넓어도 넷이다. */}
                <div className="gutter grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                  {rest.map((season) => (
                    <SeasonTile key={season.id} season={season} />
                  ))}
                </div>
              </>
            )}
          </SeasonSearch>
        </WithBanner>
      </main>
    </div>
  );
}
