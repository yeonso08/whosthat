import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatAirDate } from "@/lib/data";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

/** 줄 왼쪽에 겹쳐 쌓는 얼굴 수. 더 넣으면 기수 이름이 밀린다. */
const FACE_COUNT = 4;

type Props = { season: Season };

export function SeasonRow({ season }: Props) {
  const coverage = getCoverage(season.cast);
  const faces = season.cast.slice(0, FACE_COUNT);
  const airDate = formatAirDate(season.airDate);
  const detail = [airDate, season.special].filter(Boolean).join(" · ");

  return (
    <Item className="gap-3.5 p-3" render={<Link href={seasonHref(season.id)} />}>
      {/* 기본값 두 개를 되돌린다 — 설명이 있으면 위로 붙는 정렬, 그리고 얼굴 겹침을 상쇄하는 gap. */}
      <ItemMedia className="translate-y-0 gap-0 self-center pl-2.5">
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

        {faces.length === 0 &&
          Array.from({ length: FACE_COUNT }, (_, i) => (
            <div
              key={i}
              className="-ml-2.5 size-9.5 rounded-full border-2 border-background bg-card"
            />
          ))}
      </ItemMedia>

      <ItemContent className="gap-0.5">
        <ItemTitle className="text-base font-bold tracking-tight">
          {season.label}
        </ItemTitle>
        <ItemDescription className="font-lat text-xs">
          {detail ? `${detail} · ` : ""}
          {coverage.total === 0
            ? "명단 정리 중"
            : `${coverage.found} / ${coverage.total} 확인`}
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <ChevronRight className="size-4 shrink-0 text-ring" />
      </ItemActions>
    </Item>
  );
}
