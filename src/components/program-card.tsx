import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import { getSeasons } from "@/lib/data";
import {
  currentLocale,
  fill,
  getDictionary,
  programStrings,
} from "@/lib/i18n";
import { programHref } from "@/lib/links";
import { getTotals, type CastMember, type Program } from "@/lib/types";

/**
 * 타일 안에 겹쳐 쌓는 얼굴 수. 기수 목록 줄과 같은 넷이다 — 더 넣으면 가명 21개가
 * 반복되는 글자 벽이 되는데, 그건 사진이 없던 시절 기수 히어로를 뜯어고치게
 * 만든 바로 그 그림이다.
 */
const FACE_COUNT = 4;

/** 겹쳐 쌓이는 원형 자리. 테두리가 배경색이라야 원끼리도 갈리고 원 자체도 드러난다. */
const FACE_SHAPE =
  "relative -ml-2 size-8 shrink-0 overflow-hidden rounded-full border-2 border-background text-[9px]";

/**
 * 방송사·플랫폼 한 줄. **홈에서 프로그램을 가르는 것은 색이 아니라 이 글자다** —
 * 팔레트가 흑백뿐이라(유채색은 `searching` 전용) 색면으로 타일을 구분하는 길이
 * 막혀 있고, 그건 반복해서 반려된 방향이기도 하다. 대신 라틴 대문자에 트래킹을
 * 벌려 이 줄 자체를 활자로 만든다.
 */
const PLATFORM =
  "font-lat truncate text-[9.5px] font-bold tracking-[0.16em] text-muted-foreground uppercase";

type Props = { program: Program };

/**
 * 홈의 프로그램 한 장.
 *
 * **기수 상세의 출연진 카드(`CastCard`)와 같은 모양이다** — 같은 비율의 2열
 * 격자에, 이름이 아래에 앉는다. 한 단 위인 프로그램도 같은 문법으로 훑게 되고,
 * 나중에 사진이 들어오면 이 상자가 그대로 사진 자리가 된다.
 *
 * 전면 카드로 쌓지 않는 이유는 프로그램이 늘기 때문이다. 한 장이 화면 폭을 다
 * 쓰면 스무 개가 됐을 때 홈이 스무 번 스크롤하는 화면이 된다.
 */
export async function ProgramCard({ program }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const strings = programStrings(program.id, locale);

  const seasons = getSeasons(program);
  const { people, found } = getTotals(seasons);
  const faces = pickFaces(program);

  return (
    <Link
      href={programHref(locale, program.id)}
      className="focus-ring flex aspect-[6/7] flex-col justify-between rounded-2xl bg-card p-3.5 transition-colors hover:bg-elevated"
    >
      <div className="flex items-start gap-1.5">
        <span className={PLATFORM}>{program.platform}</span>
        {seasons.some((season) => season.onAir) && (
          <span className="ml-auto flex shrink-0 items-center pt-0.5">
            <span className="size-1.5 rounded-full bg-searching" />
            <span className="sr-only">{dict.season.onAir}</span>
          </span>
        )}
      </div>

      {/* 얼굴 겹침(-ml)을 상쇄해 첫 원을 글자 선에 맞춘다. */}
      <div className="flex items-center pl-2">
        {faces.map((member) => (
          <div key={member.id} className={FACE_SHAPE}>
            <CastPhoto
              src={member.profileImageUrl}
              // 배지는 사진 대신 놓는 워터마크라 언어를 안 따라간다 — 이유는
              // `SeasonRow` 에 적어 뒀다.
              alias={member.alias}
              status={member.status}
              alt=""
              sizes="32px"
            />
          </div>
        ))}

        {faces.length === 0 &&
          Array.from({ length: FACE_COUNT }, (_, i) => (
            <div key={i} className={`${FACE_SHAPE} bg-card`} />
          ))}
      </div>

      <div>
        <p className="text-[17px] leading-snug font-black tracking-tight">
          {strings.name}
        </p>
        <p className="font-lat mt-1 truncate text-[11px] font-semibold text-muted-foreground">
          {people === 0
            ? dict.season.coveragePending
            : fill(dict.season.coverage, { found, total: people })}
        </p>
      </div>
    </Link>
  );
}

/**
 * 타일에 세울 얼굴. **계정을 찾아 둔 사람이 먼저다.**
 *
 * 최신 기수에서 그냥 앞부터 자르면 방영 중인 기수가 통째로 `searching` 이라
 * 저대비 황토 배지가 한 줄로 깔린다 — 사진이 없던 시절 기수 히어로를 뜯어고치게
 * 만든 바로 그 그림이다. 타일이 말하는 것도 "확인된 계정" 이라 내용상으로도
 * 이쪽이 맞다.
 */
function pickFaces(program: Program): CastMember[] {
  const cast = program.seasons.flatMap((season) => season.cast);

  return [
    ...cast.filter((member) => member.status === "found"),
    ...cast.filter((member) => member.status !== "found"),
  ].slice(0, FACE_COUNT);
}
