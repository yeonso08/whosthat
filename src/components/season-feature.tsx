import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import { LiveDot } from "@/components/live-dot";
import {
  currentLocale,
  formatCoverage,
  getDictionary,
  localizeSeason,
  programStrings,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

/** 겹쳐 쌓는 얼굴 수. 목록 줄(4)보다 줄이 넓어 여섯까지 들어가고, 나머지는 +N 으로 센다. */
const FACE_COUNT = 6;

/**
 * 겹쳐 쌓이는 원형 자리. 목록 줄과 같은 문법이다.
 *
 * **테두리는 판 색(`border-card`)이다.** 원이 놓이는 자리가 둘 다 흰 판 위로
 * 옮겨 오면서 배경색 테두리는 원끼리 갈라 주지 못하게 됐다 — 배지 바탕
 * (`bg-elevated`)과 배경색이 거의 같은 명도라서다. 판 색이라야 겹친 자리에
 * 흰 선이 지나가 원이 하나씩 세어진다.
 * text 는 사진이 없을 때 나오는 가명 배지가 상속받는다.
 */
const FACE_SHAPE =
  "relative -ml-2.5 size-11 shrink-0 overflow-hidden rounded-full border-2 border-card text-[11px]";

/**
 * 확인 현황 막대의 폭. 숫자 옆에 두는 것이라 길면 카드가 계기판처럼 보인다.
 */
const METER_WIDTH = "w-20 lg:w-28";

type Props = { season: Season };

/**
 * 목록 맨 위에 크게 세우는 최신(또는 방영 중) 기수.
 *
 * **판 안이 위·아래 두 단이다** — 위는 이 기수가 무엇인지(상태 줄 + 이름),
 * 아래는 누가 나왔고 얼마나 확인됐는지다. 예전에는 이름 아래에 얼굴과 숫자가
 * 한 줄로 눕고 가운데가 통째로 비어서, 넓은 화면에서 카드가 아니라 가로로
 * 늘어난 띠로 읽혔다.
 *
 * 현황은 숫자에 막대를 하나 붙인다 — `12 / 14` 는 읽어야 알지만 막대는 안
 * 읽어도 보인다. 색은 안 쓴다(유채색은 확인된 핸들 전용이라) — 명도만으로
 * 찬 만큼과 빈 만큼이 갈린다.
 */
export async function SeasonFeature({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  // "최신 기수" 는 프로그램마다 부르는 말이 달라서 사전의 프로그램 표에 있다.
  const strings = programStrings(season.programId, locale);

  const coverage = getCoverage(season.cast);
  const faces = season.cast.slice(0, FACE_COUNT);
  const rest = coverage.total - faces.length;
  const { label, special, airDate } = localizeSeason(season, locale);
  const filled = coverage.total === 0 ? 0 : (coverage.found / coverage.total) * 100;

  return (
    <Link
      href={seasonHref(locale, season.programId, season.id)}
      className="lift focus-ring group block rounded-2xl bg-card p-5 shadow-soft lg:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {season.onAir ? (
            // 점만 빨강이고 글자는 그대로다 — 이유는 `LiveDot` 에 적어 뒀다.
            <span className="flex items-center gap-2 text-[12px] font-bold text-foreground">
              <LiveDot />
              {dict.season.onAir}
              {special && (
                <span className="font-lat truncate font-semibold text-muted-foreground">
                  · {special}
                </span>
              )}
            </span>
          ) : (
            <span className="font-lat text-[12px] font-semibold text-muted-foreground">
              {[airDate, special].filter(Boolean).join(" · ") || strings.latest}
            </span>
          )}

          <p className="mt-2 text-[28px] leading-[1.2] font-bold tracking-[-0.03em] break-keep lg:text-[36px]">
            {label}
          </p>
        </div>

        {/* 판 전체가 링크라는 걸 알려 주는 화살표. 판이 떠오를 때 같이 밀린다. */}
        <ChevronRight className="mt-1 size-5 shrink-0 text-ring transition-transform duration-200 ease-soft group-hover:translate-x-0.5" />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        {/* 얼굴 겹침(-ml)을 상쇄해 첫 원을 제목 선에 맞춘다. */}
        <div className="flex min-w-0 items-center pl-2.5">
          {faces.map((member) => (
            <div key={member.id} className={FACE_SHAPE}>
              <CastPhoto
                src={member.profileImageUrl}
                // 배지는 사진 대신 놓는 워터마크라 언어를 안 따라간다 — 로마자로
                // 바꾸면 원에 안 들어가고, 잘라 쓰면 영수·영호·영식이 전부 "Ye" 가
                // 된다. 이름은 기수 상세의 카드가 그 언어로 온전히 말한다.
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

        <div className="shrink-0 text-right">
          <span className="font-lat text-xs font-semibold text-muted-foreground">
            {formatCoverage(coverage, locale)}
          </span>
          {/* 명단이 없으면 막대를 안 그린다 — 0/0 짜리 빈 트랙은 "아무것도 확인
              못 했다" 로 읽히는데, 사실은 셀 사람이 아직 없다는 뜻이다. */}
          {coverage.total > 0 && (
            <span
              className={`mt-2 block h-1 ${METER_WIDTH} overflow-hidden rounded-full bg-elevated`}
            >
              <span
                className="block h-full rounded-full bg-foreground/75"
                style={{ width: `${filled}%` }}
              />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
