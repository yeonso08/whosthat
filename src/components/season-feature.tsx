import Link from "next/link";
import { formatAirDate } from "@/lib/data";
import { seasonHref } from "@/lib/links";
import { getCoverage, type AccountStatus, type Season } from "@/lib/types";

type Props = { season: Season };

/** 상태가 하나 늘면 여기서 컴파일 에러가 난다. */
const DOT_STYLE: Record<AccountStatus, string> = {
  found: "bg-foreground",
  none: "bg-elevated",
  searching: "bg-searching/50",
};

/** 목록 맨 위에 크게 세우는 최신(또는 방영 중) 기수. */
export function SeasonFeature({ season }: Props) {
  const coverage = getCoverage(season.cast);
  const airDate = formatAirDate(season.airDate);

  return (
    <Link
      href={seasonHref(season.id)}
      className="block rounded-2xl bg-card px-5 py-5 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {season.onAir ? (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-searching">
          <span className="size-1.5 rounded-full bg-searching" />
          방영 중
          {season.special && (
            <span className="font-lat font-semibold text-muted-foreground">
              · {season.special}
            </span>
          )}
        </span>
      ) : (
        <span className="font-lat text-[11px] font-semibold text-muted-foreground">
          {[airDate, season.special].filter(Boolean).join(" · ") ||
            "최신 기수"}
        </span>
      )}

      <span className="mt-2 block text-2xl font-bold tracking-tight">
        {season.label}
      </span>

      {season.cast.length > 0 && (
        <div className="mt-4 flex gap-1">
          {season.cast.map((member) => (
            <span
              key={member.id}
              className={`h-1.5 flex-1 rounded-full ${DOT_STYLE[member.status]}`}
            />
          ))}
        </div>
      )}

      <span className="font-lat mt-3 block text-xs font-semibold text-muted-foreground">
        {coverage.total === 0
          ? "명단 정리 중"
          : `${coverage.found} / ${coverage.total} 확인`}
      </span>
    </Link>
  );
}
