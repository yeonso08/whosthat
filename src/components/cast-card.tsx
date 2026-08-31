import Image from "next/image";
import type { ReactElement } from "react";
import { InstagramIcon } from "@/components/icons";
import {
  currentLocale,
  fill,
  formatChecked,
  getDictionary,
  localizeAlias,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import { instagramUrl } from "@/lib/links";
import type { CastMember } from "@/lib/types";

/** 카드와 그 안의 상태 줄이 같은 사람을 그리므로 타입을 함께 쓴다. */
type Props = { member: CastMember };

/** 사전을 통째로 받지 않는다 — 이 줄이 읽는 건 `status` 묶음뿐이다. */
type StatusProps = Props & { status: Dictionary["status"]; locale: Locale };

/** 격자의 열 수와 짝이다 — 2→3→4→5열로 늘어나므로 같은 중단점을 밟는다. */
const CARD_SIZES =
  "(min-width: 1024px) 240px, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

/**
 * 검색 결과에서 앵커로 내려왔을 때 카드가 화면 맨 위에 딱 붙지 않게 띄운다.
 * 붙어 있으면 위에 뭐가 더 있는지 안 보여서 목록의 첫 줄처럼 읽힌다.
 */
const ANCHOR_OFFSET = "scroll-mt-4";

/**
 * 출연진 한 장.
 *
 * **사진이 있든 없든 글자 블록은 같은 자리에 같은 모양으로 앉는다.** 예전에는
 * 사진이 없으면 그 자리를 흐린 가명 글자가 채우고 아래에 같은 가명이 또 나와서,
 * 한 카드에 같은 이름이 두 번 찍혔다 — 사진이 0장인 동안 격자 전체가 그 그림이라
 * "회색 상자에 글자 두 번" 으로 읽혔다. 지금은 사진 유무가 **뒤에 그림이 깔리느냐**
 * 하나만 가른다.
 */
export async function CastCard({ member }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const found = member.status === "found";
  const handle = member.instagramHandle;
  const alias = localizeAlias(member.alias, locale);
  const description = describe(member);

  const body = (
    <>
      {member.profileImageUrl && (
        <Image
          src={member.profileImageUrl}
          alt={fill(dict.season.photoAlt, { alias })}
          fill
          sizes={CARD_SIZES}
          className={`object-cover ${found ? "" : "opacity-45"}`}
        />
      )}

      {found && (
        // 계정이 있다는 표시. 사진 위에도 얹히므로 뒤를 흐려서 어떤 그림 위에서도
        // 마크가 살아 있게 한다.
        <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-md">
          <InstagramIcon className="size-4 text-foreground" />
        </span>
      )}

      {/* 그러데이션은 **사진 위에서 글자를 읽히게 하는 장치라 사진이 있을 때만
          깐다.** 없는 판에 깔면 위(판 그러데이션)·가운데·아래(이 그러데이션)로
          띠가 세 겹 생겨 판이 탁해진다 — 눌러야 할 그림이 없는데 눌러서다.
          글자 블록의 자리와 모양은 어느 쪽이든 같다. */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col px-4 pt-14 pb-4 ${
          member.profileImageUrl
            ? "bg-gradient-to-t from-background/95 via-background/60 to-transparent"
            : ""
        }`}
      >
        <span
          className={`text-[19px] leading-[1.25] font-bold tracking-[-0.02em] break-keep ${
            found ? "" : "text-muted-foreground"
          }`}
        >
          {alias}
        </span>
        {description && (
          <span className="mt-1 truncate text-[12px] text-muted-foreground">
            {description}
          </span>
        )}
        <CardStatus member={member} status={dict.status} locale={locale} />
      </div>
    </>
  );

  /*
   * 판은 정사각형이다. 세로로 길었던 때는 사진이 한 장도 없는 동안 격자가
   * 통째로 큰 빈 상자 열댓 개였다 — 채울 그림이 없는데 자리만 세로로 길었다.
   * 정사각형은 인스타 프로필 사진이 잘리지 않는 비율이기도 해서, 사진이
   * 들어와도 그대로 쓴다.
   *
   * 테두리 실선 대신 그림자로 판을 세운다 — 실선만 있으면 오려 붙인 종이로
   * 보인다. 포스터 판과 같은 처리다.
   */
  const shell = `relative ${ANCHOR_OFFSET} block aspect-square overflow-hidden rounded-2xl shadow-soft ring-1 ring-border/60 ring-inset ${
    member.profileImageUrl
      ? "bg-card"
      : "bg-gradient-to-b from-elevated to-card"
  }`;

  // handle 까지 봐야 타입이 좁혀진다. found 인데 핸들이 없는 건 데이터 오류라
  // 링크를 거는 대신 카드로만 둔다.
  if (!found || !handle) {
    return (
      <div id={member.id} className={shell}>
        {body}
      </div>
    );
  }

  return (
    <a
      id={member.id}
      href={instagramUrl(handle)}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-ring lift ${shell}`}
    >
      {body}
    </a>
  );
}

/**
 * 반환 타입을 못 박아 두면 AccountStatus 에 상태가 하나 늘 때
 * 여기서 컴파일 에러가 난다 — 화면 문구를 빠뜨리지 않게 하는 장치다.
 */
function CardStatus({ member, status, locale }: StatusProps): ReactElement {
  switch (member.status) {
    case "found":
      // **이 사이트에서 색이 도는 자리는 여기 하나다.** 방문자가 가지러 온 값이고,
      // 고정폭이라 한 글자씩 짚어 읽힌다 — 핸들은 문장이 아니라 식별자다.
      return (
        <span className="font-mono mt-2 truncate text-[12px] font-medium text-verified">
          @{member.instagramHandle}
        </span>
      );

    case "none": {
      const checked = member.lastVerified
        ? fill(status.checked, {
            date: formatChecked(member.lastVerified, locale),
          })
        : "";
      return (
        <span className="mt-2 text-[12px] font-semibold text-muted-foreground">
          {status.none}
          {checked && ` · ${checked}`}
        </span>
      );
    }

    case "searching":
      return (
        <span className="mt-2 text-[12px] font-semibold text-searching">
          {status.searching}
        </span>
      );
  }
}

/** "김○○ · 31 · 간호사" — 모르는 항목은 통째로 뺀다. */
function describe(member: CastMember): string {
  return [member.name, member.ageAtAiring, member.occupation]
    .filter(Boolean)
    .join(" · ");
}
