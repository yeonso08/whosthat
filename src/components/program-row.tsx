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
import { getSeasons } from "@/lib/data";
import { currentLocale, fill, getDictionary, localizeSeason, programStrings } from "@/lib/i18n";
import { programHref } from "@/lib/links";
import { getTotals, type Program } from "@/lib/types";

/** 줄 왼쪽에 겹쳐 쌓는 얼굴 수. 기수 목록 줄과 같은 문법이라 같은 값이다. */
const FACE_COUNT = 4;

/** 겹쳐 쌓이는 원형 자리. 테두리가 배경색이라야 원끼리도 갈리고 원 자체도 드러난다. */
const FACE_SHAPE =
  "relative -ml-2.5 size-9.5 shrink-0 overflow-hidden rounded-full border-2 border-background text-[10px]";

type Props = { program: Program };

/**
 * 홈의 프로그램 한 줄. 기수 목록 줄(`SeasonRow`)과 같은 그림을 쓴다 — 한 단계
 * 위로 올라갔을 뿐 하는 일이 같은 자리라, 문법이 갈리면 같은 사이트로 안 읽힌다.
 *
 * 얼굴은 최신 기수에서 가져온다. 프로그램 전체에서 고르면 어느 기수 사람인지
 * 알 수 없고, 최신 기수가 그 프로그램을 찾아온 사람이 제일 먼저 찾는 기수다.
 */
export async function ProgramRow({ program }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const strings = programStrings(program.id, locale);

  const seasons = getSeasons(program);
  const latest = seasons[0];
  const faces = latest ? latest.cast.slice(0, FACE_COUNT) : [];
  const totals = getTotals(seasons);

  const detail = [
    latest ? localizeSeason(latest, locale).label : "",
    totals.people === 0
      ? dict.season.coveragePending
      : fill(dict.season.coverage, { found: totals.found, total: totals.people }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Item
      className="gap-3.5 p-3"
      render={<Link href={programHref(locale, program.id)} />}
    >
      {/* 기본값 두 개를 되돌린다 — 설명이 있으면 위로 붙는 정렬, 그리고 얼굴 겹침을 상쇄하는 gap. */}
      <ItemMedia className="translate-y-0 gap-0 self-center pl-2.5">
        {faces.map((member) => (
          <div key={member.id} className={FACE_SHAPE}>
            <CastPhoto
              src={member.profileImageUrl}
              // 배지는 사진 대신 놓는 워터마크라 언어를 안 따라간다 — 이유는
              // `SeasonRow` 에 적어 뒀다.
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
          {strings.name}
        </ItemTitle>
        <ItemDescription className="font-lat text-xs">{detail}</ItemDescription>
      </ItemContent>

      <ItemActions>
        <ChevronRight className="size-4 shrink-0 text-ring" />
      </ItemActions>
    </Item>
  );
}
