import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactElement } from "react";
import { InstagramIcon } from "@/components/icons";
import { DARK_PANEL } from "@/components/list-card";
import {
  currentLocale,
  fill,
  formatChecked,
  getDictionary,
  localizeAlias,
  localizeOccupation,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import { instagramUrl } from "@/lib/links";
import type { CastMember, EarlierAppearance } from "@/lib/types";

/** 카드와 그 안의 상태 줄이 같은 사람을 그리므로 타입을 함께 쓴다. */
type Props = { member: CastMember };

/**
 * `earlier` 는 같은 사람이 먼저 나온 프로그램 — 이미 그 화면 언어로 만든
 * `나는 솔로 16기 상철` 과 그 카드로 가는 주소다(`getEarlierAppearances`).
 * 없으면 줄이 빠진다.
 */
type CardProps = Props & { earlier?: EarlierAppearance[] };

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
 * 판 안의 두 겹. 인스타 링크가 판 전체를 덮고(`CARD_LINK_LAYER`), 출신 줄의 링크만
 * 그 위로 올라온다 — 링크 안에 링크를 넣을 수 없어서 겹으로 가른다. 둘은 짝이라
 * 위쪽 값이 아래쪽보다 커야 한다.
 */
const CARD_LINK_LAYER = "z-10";
const EARLIER_LINK_LAYER = "z-20";

/**
 * 출연진 한 장.
 *
 * **사진이 있든 없든 글자 블록은 같은 자리에 같은 모양으로 앉는다.** 예전에는
 * 사진이 없으면 그 자리를 흐린 가명 글자가 채우고 아래에 같은 가명이 또 나와서,
 * 한 카드에 같은 이름이 두 번 찍혔다 — 사진이 0장인 동안 격자 전체가 그 그림이라
 * "회색 상자에 글자 두 번" 으로 읽혔다. 지금은 사진 유무가 **뒤에 그림이 깔리느냐**
 * 하나만 가른다.
 */
export async function CastCard({ member, earlier }: CardProps) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const found = member.status === "found";
  const handle = member.instagramHandle;
  const alias = localizeAlias(member.alias, locale);
  const description = describe(member, locale);
  // 숫자만 두면 나이인지 번호인지 안 읽힌다 — 단위를 붙여 이름 옆에 둔다.
  const age = member.ageAtAiring
    ? fill(dict.season.age, { age: member.ageAtAiring })
    : "";

  const body = (
    <>
      {member.profileImageUrl && (
        <Image
          src={member.profileImageUrl}
          alt={fill(dict.season.photoAlt, { alias })}
          fill
          sizes={CARD_SIZES}
          className="object-cover"
        />
      )}

      {found && (
        // 계정이 있다는 표시. 사진 위에도 얹히므로 뒤를 흐려서 어떤 그림 위에서도
        // 마크가 살아 있게 한다.
        // 사진이 없는 판에서는 판 색과 거의 같은 바탕이라 원이 사라졌다 — 그때는
        // 글자색을 옅게 깐다.
        <span
          className={`absolute top-3 right-3 flex size-8 items-center justify-center rounded-full ${
            member.profileImageUrl
              ? "bg-background/70 backdrop-blur-md"
              : "bg-foreground/[0.06] dark:bg-white/[0.08]"
          }`}
        >
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
        {/* 나이는 이름 옆이다 — 방송 자막이 "영수(34)" 처럼 이름에 붙여 부르는
            자리라 설명 없이 읽힌다. 이름보다 작고 흐리게 둬서 이름이 주인공인
            건 그대로다. */}
        <span
          className={`text-[19px] leading-[1.25] font-bold tracking-[-0.02em] break-keep ${
            found ? "" : "text-muted-foreground"
          }`}
        >
          {alias}
          {age && (
            <span className="ml-1.5 text-[13px] font-medium tracking-normal text-muted-foreground">
              {age}
            </span>
          )}
        </span>
        {/* 출신은 이름 바로 아래다 — 실명으로 나오는 프로그램에서 "이 사람이
            그 16기 상철" 이라는 게 이름 다음으로 궁금한 값이다. 직업보다 진하게
            둬서 두 줄이 한 덩어리로 안 뭉친다. */}
        {earlier && earlier.length > 0 && (
          <span className="mt-1 text-[12px] leading-[1.45] font-semibold break-keep text-foreground/75">
            {earlier.map((appearance, index) => (
              <Fragment key={appearance.href}>
                {index > 0 && " · "}
                {/* 밑줄을 평소에도 긋는다 — 판 전체가 인스타로 가는 자리라, 이 줄만
                    다른 곳으로 간다는 걸 손을 올리기 전에(휴대폰은 아예 못 올린다)
                    알려야 한다. 위아래로 탭 영역만 넓히고 줄 간격은 그대로 둔다. */}
                <Link
                  href={appearance.href}
                  className={`focus-ring relative ${EARLIER_LINK_LAYER} -my-1 rounded-sm py-1 underline decoration-foreground/30 underline-offset-[3px] transition-colors duration-200 hover:text-foreground hover:decoration-foreground`}
                >
                  {appearance.text}
                </Link>
              </Fragment>
            ))}
          </span>
        )}
        {/* 직업은 방송 자막 그대로라 길다("P회사 기술연구원 수석연구원"). 한 줄로
            자르면 끝이 사라져서 두 줄까지 보이고, 그래도 넘치면 전체를 title 로 준다. */}
        {description && (
          <span
            title={description}
            className="mt-1 line-clamp-2 text-[12px] leading-[1.45] break-keep text-muted-foreground [overflow-wrap:anywhere]"
          >
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
   *
   * 사진이 없는 판은 프로그램 화면의 기수 타일과 같은 판이다(2026-11-20) — 라이트는
   * 흰 판, 다크는 바탕보다 한 단계 밝은 판(`DARK_PANEL`). 회색에서 흰색으로 내려가던
   * 그러데이션은 판 위쪽 절반을 탁한 회색 띠로 만들었다.
   */
  const shell = `relative ${ANCHOR_OFFSET} block aspect-square overflow-hidden rounded-2xl bg-card shadow-soft ${
    member.profileImageUrl ? "ring-1 ring-border/60 ring-inset" : DARK_PANEL
  }`;

  // handle 까지 봐야 타입이 좁혀진다. found 인데 핸들이 없는 건 데이터 오류라
  // 링크를 거는 대신 카드로만 둔다.
  if (!found || !handle) {
    // 누를 수 없는 판이라 `DARK_PANEL` 의 hover 밝기를 되돌린다 — 밝아지면 눌리는
    // 판으로 읽힌다.
    return (
      <div
        id={member.id}
        className={`${shell} dark:hover:from-[#1d1d23] dark:hover:to-[#16161b]`}
      >
        {body}
      </div>
    );
  }

  // 판은 링크가 아니라 상자고, 인스타 링크가 그 위를 통째로 덮는다. 판 자체를
  // `<a>` 로 두면 출신 줄의 링크가 링크 안의 링크가 된다(HTML 이 금지한다).
  // 포커스 테두리는 판이 대신 그린다 — 덮개에 그리면 `overflow-hidden` 에 잘린다.
  return (
    <div id={member.id} className={`focus-ring-cover lift ${shell}`}>
      {body}
      <a
        href={instagramUrl(handle)}
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute inset-0 ${CARD_LINK_LAYER} outline-none`}
      >
        <span className="sr-only">
          {alias} @{handle}
        </span>
      </a>
    </div>
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

    // 핸들은 내지 않는다 — 본인이 잠근 계정이다(`AccountStatus` 주석).
    case "private": {
      const checked = member.lastVerified
        ? fill(status.checked, {
            date: formatChecked(member.lastVerified, locale),
          })
        : "";
      return (
        <span className="mt-2 text-[12px] font-semibold text-muted-foreground">
          {status.private}
          {checked && ` · ${checked}`}
        </span>
      );
    }
  }
}

/**
 * "김○○ · 간호사" — 모르는 항목은 통째로 뺀다. 나이는 여기 없다: 이름 옆에 단위를
 * 붙여 따로 둔다(숫자만 이 줄에 섞이면 나이인지 안 읽혔다).
 */
function describe(member: CastMember, locale: Locale): string {
  return [member.name, localizeOccupation(member, locale)]
    .filter(Boolean)
    .join(" · ");
}
