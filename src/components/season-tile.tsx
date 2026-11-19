import Link from "next/link";
import { DARK_PANEL } from "@/components/list-card";
import { currentLocale, formatCoverage, localizeSeason } from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

type Props = { season: Season };

/**
 * 프로그램 화면의 지난 기수 한 칸 — 기수 이름, 방송 시기·특집, 현황.
 *
 * **줄 목록을 타일 격자로 바꿨다**(2026-11-19 프로그램 화면 재디자인). 나는 솔로는
 * 지난 기수가 서른 줄이 넘어 한 줄짜리 목록이 끝없는 띠였고, 넓은 화면에서는
 * 왼쪽 제목과 오른쪽 숫자가 갈라졌다. 타일은 한 칸 안에 이름·시기·현황을 세로로
 * 묶어서 그 간격이 안 생기고, 한 화면에 기수가 서너 배 들어온다.
 *
 * 높이는 칸끼리 같다 — 특집 이름이 없는 기수도 현황이 바닥에 붙어 줄이 맞는다.
 * 현황 아래 막대는 뺐다(2026-11-19, 사용자 요청) — 칸마다 막대가 서면 격자가
 * 계기판이 된다. 막대는 최신 기수 판에만 있다.
 */
export async function SeasonTile({ season }: Props) {
  const locale = await currentLocale();
  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, locale);

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className={`lift focus-ring flex min-h-[124px] flex-col rounded-2xl bg-card p-4 shadow-soft lg:p-5 ${DARK_PANEL}`}
    >
      <p className="text-[19px] leading-tight font-bold tracking-[-0.03em] break-keep lg:text-[21px]">
        {label}
      </p>
      <p className="font-lat mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
        {[airDate, special].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-auto pt-4">
        <p className="font-lat text-[11.5px] font-semibold text-muted-foreground">
          {formatCoverage(coverage, locale)}
        </p>
      </div>
    </Link>
  );
}
