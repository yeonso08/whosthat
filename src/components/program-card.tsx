import Link from "next/link";
import { getSeasons } from "@/lib/data";
import {
  currentLocale,
  fill,
  getDictionary,
  programStrings,
} from "@/lib/i18n";
import { programHref } from "@/lib/links";
import { getTotals, type Program } from "@/lib/types";

/**
 * 포스터 비율. 세로여야 격자가 "고를 것들" 로 읽힌다 — 정사각형에 가까우면
 * 설정 화면의 타일처럼 보인다.
 *
 * 넷플릭스·티빙의 2:3 보다 짧은 건 그쪽 판은 그림이 꽉 차 있고 이쪽은 활자만
 * 있어서다 — 같은 비율로 두면 이름 위가 통째로 빈 자국이 된다.
 */
const POSTER = "aspect-[3/4]";

/**
 * 포스터 모서리. 사이트 반경 규칙(12–16px)의 아래끝이다 — 카드보다 조여야
 * 상자가 아니라 그림으로 읽힌다.
 */
const POSTER_RADIUS = "rounded-xl";

/**
 * **포스터의 그림은 이름 그 자체다.**
 *
 * 프로그램 포스터는 앞으로도 못 싣는다 — 방송사·제작사가 저작권자라, 방송
 * 캡처를 안 쓰는 것과 같은 이유로 막혀 있다(`PLANNING.md` §9 ①). 그래서 이
 * 자리는 사진을 기다리는 빈 판이 아니라 활자로 완성해야 하는 판이다. 한국
 * 예능 포스터가 원래 활자로 그려진다는 점에서도 같은 방향이다.
 *
 * 줄바꿈 규칙이 두 겹인 게 핵심이다. `break-keep` 은 한글이 기본값대로 음절
 * 아무 데서나 꺾여 `솔로지/옥` 이 되는 걸 막아 `나는 / 솔로` 처럼 읽는 단위로
 * 앉힌다. 다만 그것만 두면 **띄어쓰기가 없는 일본어 이름이 판을 넘친다**
 * (`脱出おひとり島`). `overflow-wrap: anywhere` 를 겹쳐서, 한 줄에 안 들어가는
 * 낱말은 그때만 꺾이게 한다.
 */
const POSTER_TITLE =
  "text-[30px] leading-[0.94] font-black tracking-tighter break-keep [overflow-wrap:anywhere]";

/**
 * 방송사·플랫폼. **홈에서 프로그램을 가르는 것은 색이 아니라 이 글자다** —
 * 팔레트가 흑백뿐이라(유채색은 `searching` 전용) 색면으로 포스터를 구분하는
 * 길이 막혀 있고, 그건 반복해서 반려된 방향이기도 하다. 대신 라틴 대문자에
 * 트래킹을 벌려 이 줄 자체를 활자로 만든다.
 */
const PLATFORM =
  "font-lat truncate text-[9px] font-bold tracking-[0.16em] text-muted-foreground uppercase";

type Props = { program: Program };

/**
 * 홈의 프로그램 한 장. 포스터 한 장과 그 아래 현황 한 줄이다.
 *
 * **넷플릭스·티빙의 문법 그대로다** — 판 안에는 그림(여기서는 활자)과 모서리
 * 배지만 두고, 부가 정보는 판 밖으로 내린다. 판 안에 캡션·아바타·통계를 채워
 * 넣으면 그건 포스터가 아니라 정보 상자가 된다.
 */
export async function ProgramCard({ program }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const strings = programStrings(program.id, locale);

  const seasons = getSeasons(program);
  const { people, found } = getTotals(seasons);

  return (
    <Link href={programHref(locale, program.id)} className="focus-ring group block">
      {/* 판의 깊이는 세로 그러데이션 하나로 낸다 — 흑백 팔레트에서 색을 안 쓰고
          "칠해진 면" 을 만드는 유일한 수단이고, 두 토큰 사이라 라이트·다크가
          알아서 뒤집힌다. 테두리 실선은 판의 가장자리를 끊어 준다 — 그림이 없는
          판은 배경에 번져서 어디까지가 한 장인지 흐려진다. */}
      <div
        className={`relative flex ${POSTER} ${POSTER_RADIUS} flex-col overflow-hidden bg-gradient-to-b from-elevated to-card p-3.5 ring-1 ring-border transition-opacity ring-inset group-hover:opacity-85`}
      >
        <div className="flex items-start gap-1.5">
          <span className={PLATFORM}>{program.platform}</span>
          {seasons.some((season) => season.onAir) && (
            <span className="ml-auto flex shrink-0 items-center pt-px">
              <span className="size-1.5 rounded-full bg-searching" />
              <span className="sr-only">{dict.season.onAir}</span>
            </span>
          )}
        </div>

        <p className={`mt-auto ${POSTER_TITLE}`}>{strings.name}</p>
      </div>

      <p className="font-lat mt-2.5 truncate text-[11px] font-semibold text-muted-foreground">
        {people === 0
          ? dict.season.coveragePending
          : fill(dict.season.coverage, { found, total: people })}
      </p>
    </Link>
  );
}
