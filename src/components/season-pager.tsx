import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { currentLocale, getDictionary, localizeSeason } from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import type { Season } from "@/lib/types";

type Props = { previous?: Season; next?: Season };

type SideProps = { season: Season; direction: "previous" | "next" };

/**
 * 기수 상세 맨 아래의 이전·다음 기수.
 *
 * 카드의 링크는 전부 인스타로 나가고, 이게 없던 동안 사이트 안으로 가는 길은
 * 제목 옆 뒤로가기 하나였다 — 기수 화면이 통째로 막다른 길이었다. 회차별 정리를
 * 끝까지 읽은 사람이 다음으로 갈 곳이 옆 기수다.
 *
 * **이전은 왼쪽, 다음은 오른쪽에 못박는다.** 한쪽만 있을 때(1기·최신 기수)도
 * 자리를 안 당긴다 — 기수를 넘겨 가며 볼 때 같은 버튼이 같은 자리에 있어야 한다.
 */
export async function SeasonPager({ previous, next }: Props) {
  if (!previous && !next) return null;

  const dict = getDictionary(await currentLocale());

  return (
    <nav
      aria-label={dict.season.pagerLabel}
      className="gutter mt-10 grid max-w-[720px] grid-cols-2 gap-3 lg:mt-14"
    >
      {previous && <PagerSide season={previous} direction="previous" />}
      {next && <PagerSide season={next} direction="next" />}
    </nav>
  );
}

async function PagerSide({ season, direction }: SideProps) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const { label, special } = localizeSeason(season, locale);
  const isNext = direction === "next";

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className={`lift focus-ring group flex flex-col rounded-2xl bg-card px-4 py-3.5 shadow-soft lg:px-5 lg:py-4 ${
        isNext ? "col-start-2 items-end text-right" : "col-start-1 items-start"
      }`}
    >
      <span className="flex items-center gap-0.5 text-[12px] font-semibold text-muted-foreground">
        {!isNext && (
          <ChevronLeft className="-ml-1 size-4 text-ring transition-transform duration-200 ease-soft group-hover:-translate-x-0.5" />
        )}
        {isNext ? dict.season.pagerNext : dict.season.pagerPrevious}
        {isNext && (
          <ChevronRight className="-mr-1 size-4 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="mt-1 text-[17px] leading-[1.3] font-bold tracking-[-0.02em] break-keep lg:text-[19px]">
        {label}
      </span>
      {/* 특집 이름이 있으면 번호만으로는 안 떠오르는 기수를 짚어 준다(`돌싱 특집`). */}
      {special && (
        <span className="mt-0.5 text-[12px] leading-[1.45] break-keep text-muted-foreground [overflow-wrap:anywhere]">
          {special}
        </span>
      )}
    </Link>
  );
}
