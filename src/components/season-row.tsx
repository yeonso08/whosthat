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
import { formatCoverage, getCoverage, type Season } from "@/lib/types";

/** 줄 왼쪽에 겹쳐 쌓는 얼굴 수. 더 넣으면 기수 이름이 밀린다. */
const FACE_COUNT = 4;

/**
 * 겹쳐 쌓이는 원형 자리. 명단이 빈 기수의 빈 원까지 같은 모양을 써야 해서
 * 뽑아 뒀다. text 는 사진이 없을 때 나오는 가명 배지가 상속받는다.
 */
const FACE_SHAPE =
  "relative -ml-2.5 size-9.5 shrink-0 overflow-hidden rounded-full border-2 border-background text-[10px]";

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
          <div key={member.id} className={FACE_SHAPE}>
            <CastPhoto
              src={member.profileImageUrl}
              alias={member.alias}
              status={member.status}
              alt=""
              sizes="38px"
            />
          </div>
        ))}

        {faces.length === 0 &&
          Array.from({ length: FACE_COUNT }, (_, i) => (
            <div key={i} className={`${FACE_SHAPE} bg-card`} />
          ))}
      </ItemMedia>

      <ItemContent className="gap-0.5">
        <ItemTitle className="text-base font-bold tracking-tight">
          {season.label}
        </ItemTitle>
        <ItemDescription className="font-lat text-xs">
          {detail ? `${detail} · ` : ""}
          {formatCoverage(coverage)}
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <ChevronRight className="size-4 shrink-0 text-ring" />
      </ItemActions>
    </Item>
  );
}
