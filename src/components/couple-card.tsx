import { ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import {
  currentLocale,
  fill,
  getDictionary,
  localizeAlias,
  localizeSeason,
} from "@/lib/i18n";
import { castMemberHref, seasonHref } from "@/lib/links";
import type { CastMember, SeasonCouples } from "@/lib/types";

type NameProps = { member: CastMember; programId: string; seasonId: string };

/**
 * 최종 커플 모음의 한 판 — 한 기수와 그 기수의 최종 커플.
 *
 * 판 머리(기수 이름)는 그 기수 화면으로, 이름은 그 사람 카드로 간다. 판 자체는
 * 링크가 아니다 — 안에 갈 곳이 여럿이라 통째로 한 곳으로 보내면 나머지를 못 누른다.
 *
 * 커플은 `영철 ♥ 정숙` 한 줄이다. 이 장르의 기사·정리 글이 커플을 적는 표기
 * 그대로라 설명 없이 읽히고, 하트가 이 화면에서 색이 도는 유일한 자리다
 * (`--couple`, `globals.css`). 남자가 앞인 건 `orderedFinalCouples` 가 정한다.
 */
export async function CoupleCard({ season, couples }: SeasonCouples) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const { label, special, airDate } = localizeSeason(season, locale);
  const detail = [special, airDate].filter(Boolean).join(" · ");

  return (
    // 높이는 격자가 줄마다 맞춘다(`h-full`) — 같은 줄의 판은 키가 같다.
    <article className="flex h-full flex-col rounded-2xl bg-card p-5 shadow-soft">
      <Link
        href={seasonHref(locale, season.programId, season.id)}
        className="focus-ring group -m-1 flex items-start gap-3 rounded-lg p-1"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] leading-[1.3] font-bold tracking-[-0.02em] break-keep">
            {label}
          </span>
          {detail && (
            <span className="font-lat mt-0.5 block text-[12px] leading-[1.45] break-keep text-muted-foreground">
              {detail}
            </span>
          )}
        </span>
        <span className="font-lat flex shrink-0 items-center gap-0.5 pt-1 text-[12px] font-semibold text-muted-foreground">
          {couples.length > 0 &&
            fill(couples.length === 1 ? dict.couples.countOne : dict.couples.count, {
              count: couples.length,
            })}
          <ChevronRight className="size-4 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
        </span>
      </Link>

      {couples.length > 0 ? (
        // 커플을 한 줄씩 쌓지 않고 옆으로 흘린다 — 쌓으면 한 쌍짜리 판과 여섯 쌍짜리
        // 판의 키가 세 배 차이라 격자의 줄이 들쭉날쭉했다. 흘리면 대부분 한두 줄이다.
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-border/60 pt-4">
          {couples.map(([a, b]) => (
            <li
              key={`${a.id}-${b.id}`}
              className="flex items-center gap-x-1.5 text-[15px] leading-[1.4] font-semibold tracking-[-0.01em]"
            >
              <CoupleName member={a} programId={season.programId} seasonId={season.id} />
              <Heart aria-hidden className="size-3.5 shrink-0 fill-couple text-couple" />
              <CoupleName member={b} programId={season.programId} seasonId={season.id} />
            </li>
          ))}
        </ul>
      ) : (
        // 최종 선택은 방송됐는데 아무도 안 맺어진 기수다. 빈 판으로 두면 "아직
        // 안 채웠다" 로 읽히므로 그 사실을 적는다.
        <p className="mt-4 border-t border-border/60 pt-4 text-[13.5px] leading-[1.6] text-muted-foreground">
          {dict.season.noFinalCouple}
        </p>
      )}
    </article>
  );
}

async function CoupleName({ member, programId, seasonId }: NameProps) {
  const locale = await currentLocale();

  return (
    <Link
      href={castMemberHref(locale, programId, seasonId, member.id)}
      className="focus-ring rounded-sm break-keep underline decoration-transparent underline-offset-[3px] transition-colors duration-200 hover:decoration-foreground/50"
    >
      {localizeAlias(member.alias, locale)}
    </Link>
  );
}
