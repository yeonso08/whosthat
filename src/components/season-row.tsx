import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import { ChevronRightIcon } from "@/components/icons";
import { formatAirDate } from "@/lib/data";
import { getCoverage, type Season } from "@/lib/types";

/** 줄 왼쪽에 겹쳐 쌓는 얼굴 수. 더 넣으면 기수 이름이 밀린다. */
const FACE_COUNT = 4;

export function SeasonRow({ season }: { season: Season }) {
  const coverage = getCoverage(season.cast);
  const faces = season.cast.slice(0, FACE_COUNT);
  const airDate = formatAirDate(season.airDate);

  return (
    <Link
      href={`/seasons/${season.id}`}
      className="flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-elevated focus-visible:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex shrink-0 pl-2.5">
        {faces.map((member) => (
          <div
            key={member.id}
            className="relative -ml-2.5 size-9.5 overflow-hidden rounded-full border-2 border-background"
          >
            <CastPhoto
              src={member.profileImageUrl}
              alt=""
              sizes="38px"
              variant="avatar"
              dimmed={member.status !== "found"}
            />
          </div>
        ))}
      </div>

      <div className="flex min-w-0 grow flex-col gap-0.5">
        <span className="text-base font-bold tracking-tight">
          {season.label}
        </span>
        <span className="font-lat text-xs text-muted-foreground">
          {airDate ? `${airDate} · ` : ""}
          {coverage.found} / {coverage.total} 확인
        </span>
      </div>

      <ChevronRightIcon className="size-4 shrink-0 text-ring" />
    </Link>
  );
}
