import Link from "next/link";
import { LiveDot } from "@/components/live-dot";
import {
  currentLocale,
  formatCoverage,
  getDictionary,
  localizeProgramName,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

type Props = { season: Season };

/**
 * 홈 검색창 바로 아래, 지금 방영 중인 기수로 바로 가는 한 줄.
 *
 * **이 사이트에 사람이 오는 순간은 방송 직후다.** "저 사람 누구야" 하고 검색해
 * 착지하는데, 그전 홈은 프로그램을 고르고 → 기수를 고르고 → 사람을 찾는 세
 * 단계였다. 방영 중인 기수는 그 세 단계를 한 번으로 줄인다.
 *
 * **홈이 어느 기수가 방영 중인지 말하지 않던 규칙을 여기서 뒤집는다.** 그
 * 규칙은 포스터 판이 좁아 글자가 안 들어간다는 사정에서 나온 것이었는데,
 * 히어로에는 자리가 있다. 포스터 모서리는 지금도 점만 찍는다.
 *
 * 현황(`0 / 12 확인`)을 숨기지 않는다 — 방영 중인 기수는 계정이 잠겨 있어 대개
 * 비어 있고, 눌러서 알게 하는 것보다 누르기 전에 말하는 편이 이 사이트가 파는
 * 신뢰와 맞는다.
 */
export async function LiveRow({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const coverage = getCoverage(season.cast);
  const { label } = localizeSeason(season, locale);
  const programName = localizeProgramName(season.programId, locale);

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      // 바탕이 `bg-card` 가 아니라 `bg-elevated` 인 건 바로 위 검색창과 겹쳐
      // 보이지 않게 하려는 것이다 — 흰 판이 흰 판 아래에 붙으면 검색 자동완성
      // 목록으로 읽힌다. 이건 입력의 결과가 아니라 따로 선 칩이다.
      className="press focus-ring inline-flex h-11 max-w-full items-center gap-2.5 rounded-full bg-elevated pr-4 pl-3.5 hover:bg-elevated/70"
    >
      <LiveDot />
      <span className="shrink-0 text-[11.5px] font-bold text-muted-foreground">
        {dict.season.onAir}
      </span>
      <span className="truncate text-[14px] font-bold tracking-[-0.02em]">
        {programName} {label}
      </span>
      <span className="font-lat shrink-0 text-[12px] font-semibold text-muted-foreground">
        {formatCoverage(coverage, locale)}
      </span>
    </Link>
  );
}
