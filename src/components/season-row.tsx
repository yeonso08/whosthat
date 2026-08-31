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
import {
  currentLocale,
  formatCoverage,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

/** 줄 왼쪽에 겹쳐 쌓는 얼굴 수. 더 넣으면 기수 이름이 밀린다. */
const FACE_COUNT = 4;

/**
 * 겹쳐 쌓이는 원형 자리. 명단이 빈 기수의 빈 원까지 같은 모양을 써야 해서
 * 뽑아 뒀다. text 는 사진이 없을 때 나오는 가명 배지가 상속받는다.
 */
const FACE_SHAPE =
  "relative -ml-2.5 size-9.5 shrink-0 overflow-hidden rounded-full border-2 border-background text-[10px]";

type Props = { season: Season };

export async function SeasonRow({ season }: Props) {
  const locale = await currentLocale();
  const coverage = getCoverage(season.cast);
  const faces = season.cast.slice(0, FACE_COUNT);
  const { label, special, airDate } = localizeSeason(season, locale);
  const detail = [airDate, special].filter(Boolean).join(" · ");

  return (
    <Item
      className="gap-3.5 p-3"
      render={<Link href={seasonHref(locale, season.programId, season.id)} />}
    >
      {/* 기본값 두 개를 되돌린다 — 설명이 있으면 위로 붙는 정렬, 그리고 얼굴 겹침을 상쇄하는 gap. */}
      <ItemMedia className="translate-y-0 gap-0 self-center pl-2.5">
        {faces.map((member) => (
          <div key={member.id} className={FACE_SHAPE}>
            <CastPhoto
              src={member.profileImageUrl}
              // 배지는 사진 대신 놓는 워터마크라 언어를 안 따라간다 — 로마자로
              // 바꾸면 원에 안 들어가고, 잘라 쓰면 영수·영호·영식이 전부 "Ye" 가
              // 된다. 이름은 기수 상세의 카드가 그 언어로 온전히 말한다.
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
          {label}
        </ItemTitle>
        <ItemDescription className="font-lat text-xs">
          {detail}
          {/* 좁은 화면에서는 현황이 이 줄에 붙고, 넓어지면 오른쪽으로 간다 —
              1280px 에서 제목 옆에 다 붙여 두면 오른쪽 절반이 통째로 빈다. */}
          <span className="lg:hidden">
            {detail ? " · " : ""}
            {formatCoverage(coverage, locale)}
          </span>
        </ItemDescription>
      </ItemContent>

      <ItemActions className="gap-4">
        <span className="font-lat hidden text-xs text-muted-foreground lg:block">
          {formatCoverage(coverage, locale)}
        </span>
        <ChevronRight className="size-4 shrink-0 text-ring" />
      </ItemActions>
    </Item>
  );
}
