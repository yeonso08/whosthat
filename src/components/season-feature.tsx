import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import { formatAirDate } from "@/lib/data";
import { seasonHref } from "@/lib/links";
import { formatCoverage, getCoverage, type Season } from "@/lib/types";

/** 히어로에 나란히 세우는 사진 수. */
const TILE_COUNT = 3;

/** 타일이 좁아서 카드보다 한 단계 작다. 사진 없는 사람의 가명 배지가 상속받는다. */
const FALLBACK_TEXT = "text-[19px] tracking-tight";

type Props = { season: Season };

/** 목록 맨 위에 크게 세우는 최신(또는 방영 중) 기수. */
export function SeasonFeature({ season }: Props) {
  const coverage = getCoverage(season.cast);
  const tiles = season.cast.slice(0, TILE_COUNT);
  const airDate = formatAirDate(season.airDate);

  return (
    <Link
      href={seasonHref(season.id)}
      className="block overflow-hidden rounded-2xl bg-card transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* 사진이 없는 타일끼리는 배경이 같아 경계가 사라진다 — 아래 색이 틈으로 비쳐 구분선이 된다. */}
      <div className="flex gap-0.5 bg-elevated">
        {tiles.map((member) => (
          <div
            key={member.id}
            className={`relative h-32 grow ${FALLBACK_TEXT}`}
          >
            <CastPhoto
              src={member.profileImageUrl}
              alias={member.alias}
              status={member.status}
              alt=""
              sizes="140px"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-4">
        <div className="flex min-w-0 flex-col gap-1.5">
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
          <span className="text-lg font-bold tracking-tight">
            {season.label}
          </span>
        </div>
        <span className="font-lat shrink-0 text-xs font-semibold text-muted-foreground">
          {formatCoverage(coverage)}
        </span>
      </div>
    </Link>
  );
}
