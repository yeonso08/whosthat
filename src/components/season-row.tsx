import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  currentLocale,
  formatCoverage,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

type Props = { season: Season };

/**
 * 프로그램 화면의 기수 한 줄 — 기수 이름, 방송 시기·특집, 현황.
 *
 * **왼쪽의 겹친 가명 원 넷을 2026-11-19 에 뺐다**(사용자 요청). 사진이 0장이라
 * 원마다 `영수`·`영호` 같은 가명 글자만 기수마다 똑같이 반복돼, 정보 없이
 * 줄의 3분의 1을 차지했다.
 */
export async function SeasonRow({ season }: Props) {
  const locale = await currentLocale();
  const coverage = getCoverage(season.cast);
  const { label, special, airDate } = localizeSeason(season, locale);
  const detail = [airDate, special].filter(Boolean).join(" · ");

  return (
    <Item
      // 판(`ListCard`) 안의 한 줄이라 모서리를 죽인다 — 줄마다 둥글면 판 안에
      // 작은 카드가 겹쳐 있는 것처럼 보인다. 높이는 손가락 자리에 맞춰 키웠다.
      className="press gap-4 rounded-none px-5 py-4 lg:px-6"
      render={<Link href={seasonHref(locale, season.programId, season.id)} />}
    >
      <ItemContent className="gap-1">
        <ItemTitle className="text-[15px] font-bold tracking-[-0.02em] lg:text-base">
          {label}
        </ItemTitle>
        <ItemDescription className="font-lat text-[12px]">
          {detail}
          {/* 좁은 화면에서는 현황이 이 줄에 붙고, 넓어지면 오른쪽으로 간다 —
              1280px 에서 제목 옆에 다 붙여 두면 오른쪽 절반이 통째로 빈다. */}
          <span className="lg:hidden">
            {detail ? " · " : ""}
            {formatCoverage(coverage, locale)}
          </span>
        </ItemDescription>
      </ItemContent>

      <ItemActions className="gap-3">
        <span className="font-lat hidden text-xs font-semibold text-muted-foreground lg:block">
          {formatCoverage(coverage, locale)}
        </span>
        {/* 줄 위에 손이 올라오면 화살표가 먼저 반응한다 — 줄 전체가 눌린다는 걸
            배경색 하나로만 말하면 좁은 화면에서는 아예 안 보인다. */}
        <ChevronRight className="size-4 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover/item:translate-x-0.5" />
      </ItemActions>
    </Item>
  );
}
