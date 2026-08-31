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
        <span className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-background/70">
          <InstagramIcon className="size-3.5 text-foreground" />
        </span>
      )}

      {/* 그러데이션은 사진 위에서 글자를 읽히게 하는 것이고, 사진이 없으면 눌릴
          것이 없어 그냥 판의 아래쪽을 가라앉힌다. 둘 다 같은 값으로 굴러간다. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-background/95 via-background/55 to-transparent px-3.5 pt-12 pb-3.5">
        <span
          className={`text-xl leading-tight font-black tracking-tight break-keep ${
            found ? "" : "text-muted-foreground"
          }`}
        >
          {alias}
        </span>
        {description && (
          <span className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {description}
          </span>
        )}
        <CardStatus member={member} status={dict.status} locale={locale} />
      </div>
    </>
  );

  // 사진이 없을 때 판이 배경에 번지지 않게 세로 그러데이션과 실선을 준다 —
  // 포스터 판과 같은 처리다.
  const shell = `relative ${ANCHOR_OFFSET} block aspect-[6/7] overflow-hidden rounded-2xl ring-1 ring-border ring-inset ${
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
      className={`focus-ring ${shell} transition-opacity hover:opacity-85`}
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
        <span className="font-mono mt-1.5 truncate text-[11.5px] font-medium text-verified">
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
        <span className="mt-1.5 text-[11.5px] font-semibold text-muted-foreground">
          {status.none}
          {checked && ` · ${checked}`}
        </span>
      );
    }

    case "searching":
      return (
        <span className="mt-1.5 text-[11.5px] font-semibold text-searching">
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
