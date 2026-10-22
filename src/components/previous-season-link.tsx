import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import {
  currentLocale,
  fill,
  getDictionary,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

/** 겹쳐 쌓는 얼굴 수. 히어로(`SeasonFeature`)와 같다 — 나머지는 +N 으로 센다. */
const FACE_COUNT = 6;

/**
 * 겹쳐 쌓이는 원형 자리. `SeasonFeature` 와 같은 문법이고 흰 판 위라 테두리도
 * 판 색이다 — 이유는 그쪽 주석에 있다.
 */
const FACE_SHAPE =
  "relative -ml-2.5 size-11 shrink-0 overflow-hidden rounded-full border-2 border-card text-[11px]";

type Props = { season: Season };

/**
 * 방영 중인 기수 화면에서 바로 앞 기수로 가는 판.
 *
 * 방송 직후엔 사람들이 지금 나오는 기수를 찾아 오는데, 그 기수는 계정이 잠겨
 * 있어 대개 비어 있다. 찾던 걸 못 찾은 사람을 그냥 보내지 않고, 막 끝나서
 * 계정이 채워진 앞 기수로 잇는다. 개수가 아니라 문장으로 말하는 건 `12 / 12`
 * 를 읽고 해석하게 두지 않으려는 것이다.
 *
 * 판은 히어로(`SeasonFeature`)와 같은 흰 판 + 겹친 얼굴이다 — 이 기수 화면의
 * 회색 칩으로 두면 안내문 한 줄로 읽혀 눌러 볼 자리로 안 보였다.
 */
export async function PreviousSeasonLink({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const coverage = getCoverage(season.cast);
  const faces = season.cast.slice(0, FACE_COUNT);
  const rest = coverage.total - faces.length;
  const { label } = localizeSeason(season, locale);

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className="lift focus-ring group block rounded-2xl bg-card p-5 shadow-soft lg:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[22px] leading-[1.2] font-bold tracking-[-0.03em] break-keep lg:text-[26px]">
            {label}
          </p>
          <p className="mt-1.5 text-[14px] leading-[1.5] break-keep text-muted-foreground">
            {fill(
              coverage.found === coverage.total
                ? dict.season.previousAllFound
                : dict.season.previousSomeFound,
              { total: coverage.total, found: coverage.found },
            )}
          </p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
      </div>

      {/* 얼굴 겹침(-ml)을 상쇄해 첫 원을 제목 선에 맞춘다. */}
      <div className="mt-5 flex items-center pl-2.5">
        {faces.map((member) => (
          <div key={member.id} className={FACE_SHAPE}>
            <CastPhoto
              src={member.profileImageUrl}
              alias={member.alias}
              status={member.status}
              alt=""
              sizes="44px"
            />
          </div>
        ))}
        {rest > 0 && (
          <span className="font-lat pl-3 text-xs font-semibold text-muted-foreground">
            +{rest}
          </span>
        )}
      </div>
    </Link>
  );
}
