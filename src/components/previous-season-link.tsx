import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  currentLocale,
  fill,
  getDictionary,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

type Props = { season: Season };

/**
 * 방영 중인 기수 화면에서 바로 앞 기수로 가는 한 줄.
 *
 * 방송 직후엔 사람들이 지금 나오는 기수를 찾아 오는데, 그 기수는 계정이 잠겨
 * 있어 대개 비어 있다. 찾던 걸 못 찾은 사람을 그냥 보내지 않고, 막 끝나서
 * 계정이 채워진 앞 기수로 잇는다. 개수가 아니라 문장으로 말하는 건 `12 / 12`
 * 를 읽고 해석하게 두지 않으려는 것이다.
 */
export async function PreviousSeasonLink({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const coverage = getCoverage(season.cast);
  const { label } = localizeSeason(season, locale);
  const values = { season: label, total: coverage.total, found: coverage.found };

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className="press focus-ring flex max-w-full items-center gap-3 rounded-2xl bg-elevated py-3 pr-3 pl-4 hover:bg-elevated/70 sm:inline-flex"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-bold text-muted-foreground">
          {dict.season.previousHeading}
        </span>
        <span className="mt-0.5 block text-[14px] font-bold tracking-[-0.02em] break-keep">
          {fill(
            coverage.found === coverage.total
              ? dict.season.previousAllFound
              : dict.season.previousSomeFound,
            values,
          )}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
