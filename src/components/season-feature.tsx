import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { GLASS_PANEL } from "@/components/list-card";
import { LiveDot } from "@/components/live-dot";
import {
  currentLocale,
  formatCoverage,
  getDictionary,
  localizeSeason,
  programStrings,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

/**
 * 확인 현황 막대의 폭. 숫자 옆에 두는 것이라 길면 카드가 계기판처럼 보인다.
 */
const METER_WIDTH = "w-24 lg:w-32";

type Props = { season: Season };

/**
 * 목록 맨 위에 크게 세우는 최신(또는 방영 중) 기수.
 *
 * **판 안이 위·아래 두 단이다** — 위는 이 기수가 무엇인지(상태 줄 + 이름),
 * 아래는 얼마나 확인됐는지다. 아래 단에 있던 겹친 가명 원 여섯은 2026-11-19 에
 * 뺐다 — 사진이 0장이라 기수마다 같은 가명 글자만 반복돼 정보가 없었다.
 *
 * 현황은 숫자에 막대를 하나 붙인다 — `12 / 14` 는 읽어야 알지만 막대는 안
 * 읽어도 보인다. 색은 안 쓴다(유채색은 확인된 핸들 전용이라) — 명도만으로
 * 찬 만큼과 빈 만큼이 갈린다.
 */
export async function SeasonFeature({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  // "최신 기수" 는 프로그램마다 부르는 말이 달라서 사전의 프로그램 표에 있다.
  const strings = programStrings(season.programId, locale);

  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, locale);
  const filled = coverage.total === 0 ? 0 : (coverage.found / coverage.total) * 100;

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className={`lift focus-ring group block rounded-2xl bg-card p-5 shadow-soft lg:p-7 ${GLASS_PANEL}`}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {season.onAir ? (
            // 점만 빨강이고 글자는 그대로다 — 이유는 `LiveDot` 에 적어 뒀다.
            <span className="flex items-center gap-2 text-[12px] font-bold text-foreground">
              <LiveDot />
              {dict.season.onAir}
              {special && (
                <span className="font-lat truncate font-semibold text-muted-foreground">
                  · {special}
                </span>
              )}
            </span>
          ) : (
            <span className="font-lat text-[12px] font-semibold text-muted-foreground">
              {[airDate, special].filter(Boolean).join(" · ") || strings.latest}
            </span>
          )}

          <p className="mt-2 text-[28px] leading-[1.2] font-bold tracking-[-0.03em] break-keep lg:text-[36px]">
            {label}
          </p>
        </div>

        {/* 판 전체가 링크라는 걸 알려 주는 화살표. 판이 떠오를 때 같이 밀린다. */}
        <ChevronRight className="mt-1 size-5 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
      </div>

      {/* 가명 원 여섯을 뺀 자리에 현황 한 줄과 막대만 남긴다(2026-11-19). */}
      <div className="mt-5 flex items-center gap-3">
        <span className="font-lat text-xs font-semibold text-muted-foreground">
          {formatCoverage(coverage, locale)}
        </span>
        {/* 명단이 없으면 막대를 안 그린다 — 0/0 짜리 빈 트랙은 "아무것도 확인
            못 했다" 로 읽히는데, 사실은 셀 사람이 아직 없다는 뜻이다. */}
        {coverage.total > 0 && (
          <span
            className={`block h-1 ${METER_WIDTH} overflow-hidden rounded-full bg-elevated`}
          >
            <span
              className="block h-full rounded-full bg-foreground/75"
              style={{ width: `${filled}%` }}
            />
          </span>
        )}
      </div>
    </Link>
  );
}
