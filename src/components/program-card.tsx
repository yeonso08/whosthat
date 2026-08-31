import Image from "next/image";
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
 * 포스터 비율. 넷플릭스·티빙의 세로 포스터가 2:3 이고, 그 비율이라야 격자가
 * "고를 것들" 로 읽힌다 — 정사각형에 가까우면 설정 화면의 타일처럼 보인다.
 */
const POSTER = "aspect-[2/3]";

/**
 * 포스터 모서리. 사이트 반경 규칙(12–16px)의 아래끝이다 — 카드보다 조여야
 * 상자가 아니라 그림으로 읽힌다.
 */
const POSTER_RADIUS = "rounded-xl";

/**
 * 판 하나의 폭. **격자의 열 수와 짝이다** — 홈이 2→3→4→5열로 늘어나므로 여기도
 * 같은 중단점을 밟아야 `next/image` 가 맞는 크기를 고른다. 한쪽만 고치면 화면은
 * 멀쩡한데 필요 이상으로 큰 파일이 내려간다.
 */
const POSTER_SIZES =
  "(min-width: 1024px) 240px, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

/**
 * 포스터가 아직 없을 때 판을 채우는 활자.
 *
 * 한국 예능 포스터는 원래 제목 글자가 그림의 몫을 하므로, 빈 판을 회색으로
 * 두는 것보다 이름을 크게 앉히는 쪽이 같은 격자 안에서 덜 튄다.
 *
 * 줄바꿈 규칙이 두 겹인 게 핵심이다. `break-keep` 은 한글이 기본값대로 음절
 * 아무 데서나 꺾여 `솔로지/옥` 이 되는 걸 막아 `나는 / 솔로` 처럼 읽는 단위로
 * 앉힌다. 다만 그것만 두면 **띄어쓰기가 없는 일본어 이름이 판을 넘친다**
 * (`脱出おひとり島`). `overflow-wrap: anywhere` 를 겹쳐서, 한 줄에 안 들어가는
 * 낱말은 그때만 꺾이게 한다.
 */
const POSTER_TITLE =
  "mt-auto text-[30px] leading-[0.94] font-black tracking-tighter break-keep [overflow-wrap:anywhere]";

/**
 * 방송사·플랫폼. 티빙이 판 모서리에 채널 배지를 얹는 자리와 같다.
 *
 * **포스터가 없는 동안은 이 줄이 프로그램을 가른다** — 팔레트가 흑백뿐이라
 * (유채색은 `searching` 전용) 색면으로 판을 구분하는 길이 막혀 있고, 그건
 * 반복해서 반려된 방향이기도 하다. 대신 라틴 대문자에 트래킹을 벌려 이 줄
 * 자체를 활자로 만든다.
 */
const PLATFORM =
  "font-lat truncate text-[9px] font-bold tracking-[0.16em] uppercase";

type Props = { program: Program };

/**
 * 홈의 프로그램 한 장. 포스터 한 장과 그 아래 현황 한 줄이다.
 *
 * **넷플릭스·티빙의 문법 그대로다** — 판 안에는 그림과 모서리 배지만 두고,
 * 부가 정보는 판 밖으로 내린다. 판 안에 캡션·아바타·통계를 채워 넣으면 그건
 * 포스터가 아니라 정보 상자가 된다.
 *
 * **이름은 판 안에 한 번만 나온다.** 포스터가 걸리면 그 그림이 이미 제목을
 * 갖고 있어서(한국 예능 포스터는 거의 그렇다) 위에 이름을 또 얹지 않고,
 * 포스터가 없으면 이름 자체가 판의 그림이 된다. 어느 쪽이든 판 아래는 현황
 * 한 줄이라 격자 줄이 어긋나지 않는다.
 */
export async function ProgramCard({ program }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const strings = programStrings(program.id, locale);

  const seasons = getSeasons(program);
  const { people, found } = getTotals(seasons);

  return (
    <Link href={programHref(locale, program.id)} className="focus-ring group block">
      {/* 포스터가 없을 때 판의 깊이는 세로 그러데이션 하나로 낸다 — 흑백
          팔레트에서 색을 안 쓰고 "칠해진 면" 을 만드는 유일한 수단이고, 두
          토큰 사이라 라이트·다크가 알아서 뒤집힌다. 테두리 실선은 판의
          가장자리를 끊어 준다 — 그림이 없는 판은 배경에 번져서 어디까지가 한
          장인지 흐려진다(그림이 걸리면 그 일을 그림이 한다). */}
      <div
        className={`relative flex ${POSTER} ${POSTER_RADIUS} flex-col overflow-hidden bg-gradient-to-b from-elevated to-card p-3.5 ring-1 ring-border transition-opacity ring-inset group-hover:opacity-85`}
      >
        {program.posterUrl && (
          <Image
            src={program.posterUrl}
            alt={fill(dict.program.posterAlt, { program: strings.name })}
            fill
            sizes={POSTER_SIZES}
            className="object-cover"
          />
        )}

        {/* 위 모서리 두 개는 그림 위에도 얹히므로 글자가 묻히지 않게 판 위쪽을
            한 번 눌러 준다. 포스터가 없으면 눌릴 것이 없어 보이지 않는다. */}
        {program.posterUrl && (
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/55 to-transparent" />
        )}

        <div className="relative flex items-start gap-1.5">
          <span
            className={`${PLATFORM} ${program.posterUrl ? "text-white/85" : "text-muted-foreground"}`}
          >
            {program.platform}
          </span>
          {seasons.some((season) => season.onAir) && (
            <span className="ml-auto flex shrink-0 items-center pt-px">
              <span className="size-1.5 rounded-full bg-searching" />
              <span className="sr-only">{dict.season.onAir}</span>
            </span>
          )}
        </div>

        {program.posterUrl ? (
          // 포스터가 제목을 갖고 있다. 화면에는 안 내보내되 링크가 무엇으로
          // 가는지는 스크린리더에 남긴다.
          <span className="sr-only">{strings.name}</span>
        ) : (
          <p className={POSTER_TITLE}>{strings.name}</p>
        )}
      </div>

      <p className="font-lat mt-2.5 truncate text-[11px] font-semibold text-muted-foreground">
        {people === 0
          ? dict.season.coveragePending
          : fill(dict.season.coverage, { found, total: people })}
      </p>
    </Link>
  );
}
