import Link from "next/link";
import { CastPhoto } from "@/components/cast-photo";
import {
  currentLocale,
  formatCoverage,
  getDictionary,
  localizeSeason,
} from "@/lib/i18n";
import { seasonHref } from "@/lib/links";
import { getCoverage, type Season } from "@/lib/types";

/** 겹쳐 쌓는 얼굴 수. 목록 줄(4)보다 줄이 넓어 여섯까지 들어가고, 나머지는 +N 으로 센다. */
const FACE_COUNT = 6;

/**
 * 겹쳐 쌓이는 원형 자리. 목록 줄과 같은 문법이다 — 테두리가 배경색이라
 * 원끼리도 갈리고, 카드 위에 얹힌 원의 윤곽도 그 색으로 드러난다.
 * text 는 사진이 없을 때 나오는 가명 배지가 상속받는다.
 */
const FACE_SHAPE =
  "relative -ml-2.5 size-11 shrink-0 overflow-hidden rounded-full border-2 border-background text-[11px]";

type Props = { season: Season };

/** 목록 맨 위에 크게 세우는 최신(또는 방영 중) 기수. */
export async function SeasonFeature({ season }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const coverage = getCoverage(season.cast);
  const faces = season.cast.slice(0, FACE_COUNT);
  const rest = coverage.total - faces.length;
  const { label, special, airDate } = localizeSeason(season, locale);

  return (
    <Link
      href={seasonHref(locale, season.id)}
      className="block rounded-2xl bg-card p-4 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {season.onAir ? (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-searching">
          <span className="size-1.5 rounded-full bg-searching" />
          {dict.home.onAir}
          {special && (
            <span className="font-lat font-semibold text-muted-foreground">
              · {special}
            </span>
          )}
        </span>
      ) : (
        <span className="font-lat text-[11px] font-semibold text-muted-foreground">
          {[airDate, special].filter(Boolean).join(" · ") || dict.home.latest}
        </span>
      )}

      <p className="mt-2.5 text-2xl font-black tracking-tighter">{label}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
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

        <span className="font-lat shrink-0 text-xs font-semibold text-muted-foreground">
          {formatCoverage(coverage, locale)}
        </span>
      </div>
    </Link>
  );
}
