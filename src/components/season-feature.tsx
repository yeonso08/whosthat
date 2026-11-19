import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { DARK_PANEL } from "@/components/list-card";
import { LiveDot } from "@/components/live-dot";
import {
  currentLocale,
  formatCoverage,
  getDictionary,
  localizeSeason,
  programStrings,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { programTintGlow } from "@/lib/program-tint";
import { getCoverage, type Season } from "@/lib/types";

type Props = { season: Season };

/**
 * 목록 맨 위에 크게 세우는 최신(또는 방영 중) 기수.
 *
 * **판 안이 위·아래 두 단이다** — 위는 이 기수가 무엇인지(상태 줄 + 이름),
 * 아래는 얼마나 확인됐는지다. 아래 단에 있던 겹친 가명 원 여섯은 2026-11-19 에
 * 뺐다 — 사진이 0장이라 기수마다 같은 가명 글자만 반복돼 정보가 없었다.
 *
 * 현황은 숫자 한 줄뿐이다 — 붙어 있던 막대는 2026-11-19 에 뺐다(사용자 요청,
 * 기수 타일과 함께).
 */
export async function SeasonFeature({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  // "최신 기수" 는 프로그램마다 부르는 말이 달라서 사전의 프로그램 표에 있다.
  const strings = programStrings(season.programId, locale);

  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, locale);

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className={`lift focus-ring group relative isolate block overflow-hidden rounded-2xl bg-card p-5 shadow-soft lg:p-7 ${DARK_PANEL}`}
    >
      {/* 오른쪽 위 모서리에서 프로그램 색 빛이 번진다(2026-11-19) — 머리글 뒤의
          포스터 빛과 같은 색이라, 목록 맨 위의 이 판이 "지금 이 프로그램" 으로
          이어져 읽힌다. 판 안의 글자는 빛 위에 그대로 서도록 옅게만 깐다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 -z-10 size-56 rounded-full opacity-25 blur-3xl dark:opacity-35"
        style={{ background: programTintGlow(season.programId) }}
      />
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

      {/* 가명 원 여섯을 뺀 자리에 현황 한 줄만 남긴다(2026-11-19). */}
      <div className="mt-5 flex items-center gap-3">
        <span className="font-lat text-xs font-semibold text-muted-foreground">
          {formatCoverage(coverage, locale)}
        </span>
      </div>
    </Link>
  );
}
