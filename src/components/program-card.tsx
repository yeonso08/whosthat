import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import { getSeasons } from "@/lib/data";
import {
  currentLocale,
  formatProgramSummary,
  getDictionary,
  programStrings,
} from "@/lib/i18n";
import { programHref } from "@/lib/links";
import { getTotals, type CastMember, type Program } from "@/lib/types";

/** 겹쳐 쌓는 얼굴 수. 기수 히어로와 같은 값이다 — 둘 다 카드 폭을 쓴다. */
const FACE_COUNT = 6;

/**
 * 겹쳐 쌓이는 원형 자리. 기수 히어로와 값이 같지만 따로 둔다 — 홈 카드와 기수
 * 카드가 늘 같은 얼굴 크기를 써야 할 이유는 없고, 지금 합치면 둘 중 하나를
 * 키울 때 플래그가 생긴다.
 */
const FACE_SHAPE =
  "relative -ml-2.5 size-11 shrink-0 overflow-hidden rounded-full border-2 border-background text-[11px]";

/**
 * 방송사·플랫폼 한 줄. **홈에서 두 프로그램을 가르는 것은 색이 아니라 이 글자다** —
 * 팔레트가 흑백뿐이라(유채색은 `searching` 전용) 색면으로 카드를 구분하는 길이
 * 막혀 있고, 그건 반복해서 반려된 방향이기도 하다. 대신 라틴 대문자에 트래킹을
 * 벌려 이 줄 자체를 활자로 만든다.
 */
const PLATFORM =
  "font-lat text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase";

type Props = { program: Program };

/**
 * 홈의 프로그램 한 장. 기수 히어로(`SeasonFeature`)와 같은 문법이다 — 카드
 * 배경과 제일 큰 이름이 위계를 지고, 그 아래를 얼굴과 현황 한 줄이 받친다.
 *
 * 목록 줄이 아니라 카드인 이유: 홈의 프로그램은 기수보다 위인데, 줄로 그리면
 * 기수 목록의 한 줄과 같은 그림이 되어 오히려 가벼워 보인다.
 */
export async function ProgramCard({ program }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const strings = programStrings(program.id, locale);

  const seasons = getSeasons(program);
  const onAir = seasons.some((season) => season.onAir);
  const faces = pickFaces(program);

  return (
    <Link
      href={programHref(locale, program.id)}
      className="focus-ring block rounded-2xl bg-card p-4 transition-opacity hover:opacity-90"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={PLATFORM}>{program.platform}</span>
        {onAir && (
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-searching">
            <span className="size-1.5 rounded-full bg-searching" />
            {dict.season.onAir}
          </span>
        )}
      </div>

      <p className="mt-2.5 text-2xl font-black tracking-tighter">
        {strings.name}
      </p>

      {/* 얼굴 겹침(-ml)을 상쇄해 첫 원을 제목 선에 맞춘다. */}
      <div className="mt-4 flex items-center pl-2.5">
        {faces.map((member) => (
          <div key={member.id} className={FACE_SHAPE}>
            <CastPhoto
              src={member.profileImageUrl}
              // 배지는 사진 대신 놓는 워터마크라 언어를 안 따라간다 — 이유는
              // `SeasonRow` 에 적어 뒀다.
              alias={member.alias}
              status={member.status}
              alt=""
              sizes="44px"
            />
          </div>
        ))}

        {faces.length === 0 &&
          Array.from({ length: FACE_COUNT }, (_, i) => (
            <div key={i} className={`${FACE_SHAPE} bg-card`} />
          ))}
      </div>

      <p className="font-lat mt-3.5 text-xs font-semibold text-muted-foreground">
        {formatProgramSummary(program.id, getTotals(seasons), locale)}
      </p>
    </Link>
  );
}

/**
 * 카드에 세울 얼굴. **계정을 찾아 둔 사람이 먼저다.**
 *
 * 최신 기수에서 그냥 앞부터 자르면 방영 중인 기수가 통째로 `searching` 이라
 * 저대비 황토 배지 여섯 개가 한 줄로 깔린다 — 사진이 없던 시절 히어로를
 * 뜯어고치게 만든 바로 그 그림이다. 홈 카드가 말하는 것도 "확인된 계정" 이라
 * 내용상으로도 이쪽이 맞다.
 */
function pickFaces(program: Program): CastMember[] {
  const cast = program.seasons.flatMap((season) => season.cast);

  return [
    ...cast.filter((member) => member.status === "found"),
    ...cast.filter((member) => member.status !== "found"),
  ].slice(0, FACE_COUNT);
}
