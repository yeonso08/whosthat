import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AutoAds } from "@/components/ads";
import { BackLink } from "@/components/back-link";
import { CastCard } from "@/components/cast-card";
import { EmptyCard } from "@/components/empty-card";
import { JsonLd } from "@/components/json-ld";
import { GroupHeading, PageEyebrow } from "@/components/page-heading";
import { PreviousSeasonLink } from "@/components/previous-season-link";
import { SeasonEpisodes } from "@/components/season-episodes";
import { VoteChip } from "@/components/vote-chip";
import { WithBanner } from "@/components/with-banner";
import {
  episodeVotesUrl,
  getEarlierAppearances,
  getPreviousSeason,
  getProgram,
  getPrograms,
  getSeason,
  getSeasons,
} from "@/lib/data";
import {
  fill,
  formatAirPeriod,
  formatFinalCouples,
  getDictionary,
  isLocale,
  languageAlternates,
  localizeProgramName,
  localizeSeason,
  programStrings,
  seasonDescription,
  seasonEpisodes,
} from "@/lib/i18n";
import { programHref, seasonHref, seasonPath, voteHref } from "@/lib/links";
import { programTintBackground } from "@/lib/program-tint";
import {
  hasAdContent,
  isIndexable,
  openGraphBase,
  seasonMetaText,
  seasonSchema,
  showsSeasonFacts,
} from "@/lib/seo";
import { getCoverage, getFinalCouples } from "@/lib/types";
import { votableEpisode } from "@/lib/vote";

/**
 * 머리글 포스터의 폭. 프로그램 화면(120px)보다 한 단계 작다 — 여기서 포스터는
 * "어느 프로그램의 기수인지" 를 알려 주는 표식이고 주인공은 기수 이름이다.
 */
const POSTER_WIDTH = "w-[60px] sm:w-[68px] lg:w-[84px]";

/** `next/image` 에 알려 주는 포스터 폭. **`POSTER_WIDTH` 와 짝이다.** */
const POSTER_SIZES = "(min-width: 1024px) 84px, (min-width: 640px) 68px, 60px";

/** 뒤에 번지는 빛으로만 쓰는 포스터 — 크게 흐리므로 작은 파일이면 된다. */
const BACKDROP_SIZES = "160px";

/**
 * 뒤 빛이 녹아드는 모양 — 프로그램 화면과 같은 빛이다(2026-11-20). 그쪽은 860px
 * 기둥이라 중심이 `50%-360px` 이고, 이 화면은 1280px 컨테이너라 포스터 자리가
 * 더 왼쪽(`50%-540px`)이다. 휴대폰은 화면 비율, 넓은 화면은 px 크기다.
 */
const BACKDROP_MASK =
  "[mask-image:radial-gradient(75%_100%_at_20%_0%,black_20%,transparent_75%)] lg:[mask-image:radial-gradient(1000px_420px_at_calc(50%-540px)_0%,black_15%,transparent_70%)]";

/**
 * 언어는 루트 레이아웃이 만들고 여기서 프로그램 × 기수를 곱한다.
 *
 * 프로그램과 기수를 한 번에 내는 이유: 기수 id 는 프로그램 안에서만 고유해서
 * (`s1` 이 두 프로그램에 다 있다) 두 값이 짝으로 나와야 한다.
 */
export async function generateStaticParams() {
  return (await getPrograms()).flatMap((program) =>
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

  const season = await getSeason(programId, id);
  if (!season) return {};

  const { title, description } = seasonMetaText(season, lang);
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

  const program = await getProgram(programId);
  const season = await getSeason(programId, id);
  if (!program || !season) notFound();

  const dict = getDictionary(lang);
  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, lang);
  // 방송 기간 날짜·최종 커플 줄은 시험 중인 기수만 낸다(`showsSeasonFacts`).
  // 나머지는 예전처럼 방송 달 하나다.
  const facts = showsSeasonFacts(season);
  const airPeriod = facts
    ? formatAirPeriod(season, lang)
    : airDate
      ? fill(dict.season.aired, { date: airDate })
      : "";
  // 최종 선택이 방송됐는데 커플이 없는 것(빈 배열)과 아직 방송 전(undefined)을 가른다.
  const finalCouples = facts ? getFinalCouples(season) : undefined;
  const couples = facts ? formatFinalCouples(season, lang) : undefined;
  const programName = localizeProgramName(programId, lang);
  const description = seasonDescription(season, lang);
  const episodes = seasonEpisodes(season, lang);
  const earlier = await getEarlierAppearances(program, season, lang);

  // 방영 중인 기수만 앞 기수로 잇는다 — 사람들이 몰려오는데 계정이 잠겨 있는
  // 자리다. 앞 기수도 확인한 계정이 없으면 이어 줘 봐야 같은 빈 화면이다.
  const airingEmpty = season.onAir && coverage.found === 0;
  // 투표는 회차 글처럼 한국어 화면만 있다. 방송 직후 사람이 몰리는 이 화면에서 보이게 칩을 건다.
  const voteEpisode = lang === "ko" ? votableEpisode(programId, season) : undefined;
  const candidate = season.onAir ? getPreviousSeason(program, season) : undefined;
  const previous =
    candidate && getCoverage(candidate.cast).found > 0 ? candidate : undefined;

  const below = (
    <>
      {/* 격자 아래다 — 위에 두면 이 기수의 명단을 밀어 내린다. 명단을 훑고 계정이
          없다는 걸 확인한 다음 자리가 "그럼 어디로" 다. 제목은 프로그램 화면의
          목록과 같은 말(`지난 기수`·`지난 시즌`)이다. */}
      {previous && (
        <section className="mt-2 lg:mt-6">
          <GroupHeading>{programStrings(programId, lang).pastSeasons}</GroupHeading>
          <div className="gutter max-w-[560px]">
            <PreviousSeasonLink season={previous} />
          </div>
        </section>
      )}

      {/* 소개는 격자 아래다 — 방문자는 핸들을 찾으러 오므로 문단이 격자를 밀어
          내리면 안 된다. 읽는 글이라 격자 폭이 아니라 좁은 기둥에 선다. */}
      {description.length > 0 && (
        <section className="mt-6 lg:mt-10">
          <GroupHeading>{fill(dict.season.aboutHeading, { season: label })}</GroupHeading>
          <div className="gutter max-w-[68ch] space-y-3 text-[14px] leading-[1.75] break-keep text-muted-foreground [overflow-wrap:anywhere]">
            {description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* 회차별 정리는 맨 아래다 — 소개 문단이 기수를 한 번에 요약하고, 이 글이
          방송 날짜순으로 풀어 쓴다. 글 속 이름은 위 격자의 카드로 돌아간다. */}
      {episodes.length > 0 && (
        <SeasonEpisodes
          episodes={episodes}
          cast={season.cast}
          heading={fill(dict.season.episodesHeading, { season: label })}
        />
      )}
    </>
  );

  return (
    // 프로그램 화면과 같은 틀이다 — 포스터 빛이 화면 폭 전체에 번지고, 그 위에
    // 본문이 선다(2026-11-20 재디자인). 프로그램 화면에서 눌러 들어왔을 때 같은
    // 빛이 이어져야 "그 프로그램의 한 기수" 로 읽힌다.
    <div className="relative isolate w-full overflow-x-clip">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[400px] overflow-hidden opacity-40 lg:opacity-30 dark:opacity-55 lg:dark:opacity-45 ${BACKDROP_MASK}`}
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

      <main>
        <JsonLd data={seasonSchema(program, season, lang)} />
        {/* 계정을 하나도 못 찾은 기수에는 광고를 걸지 않는다 — `hasAdContent` 참고. */}
        {hasAdContent(season) && <AutoAds />}

        {/* 머리글과 격자는 프로그램 화면과 같은 둥근 고딕이다. 아래의 읽는 글(소개·
            회차별 정리)은 회차 글 페이지와 같은 서체로 남긴다 — 같은 글이 화면마다
            다른 글꼴이면 다른 글로 읽힌다. */}
        <header className="font-home gutter pt-6 lg:pt-10">
          {/* 돌아가는 곳은 홈이 아니라 이 기수가 속한 프로그램 목록이다. 화살표의
              44px 탭 영역만큼 왼쪽으로 당겨 화살표를 본문 여백선에 맞춘다. */}
          <div className="-ml-3">
            <BackLink
              href={programHref(lang, programId)}
              label={fill(dict.nav.back, { program: programName })}
            />
          </div>

          <div className="mt-3 flex items-end gap-4 lg:gap-6">
            {/* 프로그램 포스터는 표식이라 대체 글을 비운다 — 바로 옆에 프로그램
                이름이 글자로 있다. */}
            {program.posterUrl && (
              <div
                className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-lg shadow-lifted ring-1 ring-white/15 ring-inset lg:rounded-xl ${POSTER_WIDTH}`}
              >
                <Image
                  src={program.posterUrl}
                  alt=""
                  fill
                  priority
                  sizes={POSTER_SIZES}
                  className="object-cover"
                />
              </div>
            )}

            <div className="min-w-0 pb-0.5">
              {/* 제목이 `33기` 뿐이라 프로그램 이름을 빼면 화면에 한 글자도 안
                  남는다 — 검색어(`나는 솔로 33기`)를 본문이 뒷받침해야 한다. */}
              <PageEyebrow>{programName}</PageEyebrow>
              <h1 className="mt-1 text-[32px] leading-[1.1] font-extrabold tracking-[-0.045em] break-keep [overflow-wrap:anywhere] sm:text-[38px] lg:text-[48px]">
                {label}
              </h1>
            </div>
          </div>

          {/* 특집은 칩 하나 — 프로그램 화면의 플랫폼 칩과 같은 모양이다. */}
          {special && (
            <span className="mt-4 inline-block rounded-full bg-foreground/[0.07] px-2.5 py-1 text-[12px] font-bold text-foreground/80 backdrop-blur dark:bg-white/10">
              {special}
            </span>
          )}
          {/* 시험 목록 밖의 기수는 예전 한 줄(`2022년 12월 방영 · 12명 중 5명 계정 확인`)
              그대로다 — 비교군이라 모양까지 바뀌면 안 된다(`showsSeasonFacts`). */}
          {!facts ? (
            <p className="mt-3 text-[13px] text-muted-foreground lg:text-[14px]">
              {airPeriod ? `${airPeriod} · ` : ""}
              {coverage.total === 0
                ? dict.season.castPending
                : fill(dict.season.castCount, {
                    total: coverage.total,
                    found: coverage.found,
                  })}
            </p>
          ) : (
          // 기수만 친 검색(`나는솔로 10기`)이 묻는 것 — 언제 방송됐고 누가 커플이 됐는지 —
          // 을 제목 바로 아래에서 말한다. 표로 세우지 않고 줄로 둔다.
          <div className="mt-3 space-y-1 text-[13px] text-muted-foreground lg:text-[14px]">
            {airPeriod && <p>{airPeriod}</p>}
            <p>
              {coverage.total === 0
                ? dict.season.castPending
                : fill(dict.season.castCount, {
                    total: coverage.total,
                    found: coverage.found,
                  })}
            </p>
            {couples ? (
              <p>
                {dict.season.finalCouple}{" "}
                <span className="font-semibold text-foreground">{couples}</span>
              </p>
            ) : (
              finalCouples && <p>{dict.season.noFinalCouple}</p>
            )}
          </div>
          )}

          {/* 방영 중이라 계정이 하나도 없는 이유를 사실로 말한다. "끝나면 채운다"
              같은 약속은 적지 않는다 — 지키는지 화면이 확인해 주지 못한다. */}
          {airingEmpty && (
            // 두 문장을 사전의 `\n` 에서 끊는다 — 한 단락으로 흘리면 폭에 따라
            // "이 / 기수에는" 처럼 문장 중간에서 꺾여 실수로 읽힌다. 문장 안에서
            // 다시 접힐 때는 `text-pretty` 가 마지막 줄에 한 어절만 남기지 않게 한다.
            <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.7] whitespace-pre-line text-pretty break-keep text-muted-foreground">
              {dict.season.airingEmpty}
            </p>
          )}

          {/* 시청자 투표로 가는 칩 — 머리글 안 한 줄이다. 격자 위에 판으로 얹으면 명단을
              밀어 내린다(앞 기수 판을 격자 아래에 둔 것과 같은 이유). */}
          {voteEpisode && (
            <div className="mt-4">
              <VoteChip
                href={voteHref(lang)}
                endpoint={episodeVotesUrl(programId, season.id, voteEpisode.airDate)}
                label={dict.vote.chip}
                leaderTemplate={dict.vote.chipLeader}
                candidates={season.cast.map((member) => ({
                  id: member.id,
                  alias: member.alias,
                  gender: member.gender,
                }))}
              />
            </div>
          )}
        </header>

        {/* 아래 글(지난 기수·소개·회차별 정리)도 배너 틀 안에 넣는다 — 데스크톱 세로 배너가
            격자 옆에서 멈추지 않고 글을 따라 내려가게. 휴대폰 배너는 격자 바로 아래다. */}
        {season.cast.length > 0 ? (
          // 모비온 배너는 명단이 있는 기수 전부에 건다 — 애드센스(`hasAdContent`)보다
          // 넓다. 계정이 0개인 방영 중 기수가 방송 직후 사람이 제일 몰리는 화면이고,
          // 모비온은 애드센스의 "게시자 콘텐츠 없는 화면" 위반과 무관하다.
          <WithBanner show railClassName="pt-9" after={below}>
            {/* 서체는 여기서 건다 — 틀(`WithBanner`)에 걸면 아래 읽는 글까지 물든다. */}
            <section className="font-home">
              {/* 격자에 제목을 단다 — 프로그램 화면의 `지난 기수 33` 과 같은 줄이다. */}
              <GroupHeading className="flex items-baseline gap-2">
                {dict.season.castHeading}
                <span className="font-lat text-[13px] font-semibold text-muted-foreground">
                  {season.cast.length}
                </span>
              </GroupHeading>
              <div className="gutter grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
                {season.cast.map((member) => (
                  <CastCard
                    key={member.id}
                    member={member}
                    earlier={earlier[member.id]}
                  />
                ))}
              </div>
            </section>
          </WithBanner>
        ) : (
          <>
            <EmptyCard>{dict.season.castPendingBody}</EmptyCard>
            {below}
          </>
        )}
      </main>
    </div>
  );
}
