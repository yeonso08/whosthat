import { ArrowUpRight, Lock, UserRound } from "lucide-react";
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

/**
 * 격자의 열 수와 짝이다 — 2→3→4→5열로 늘어나므로 같은 중단점을 밟는다. 사진은
 * 판 폭을 다 쓴다.
 */
const CARD_SIZES =
  "(min-width: 1024px) 240px, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw";

/** 명찰의 기울기 — 손으로 단 정도. 더 기울이면 장난스러워진다. */
const NAME_TAG_TILT = "-rotate-[1.5deg]";

/**
 * 사진 칸의 비율. 인물 사진이 서는 세로 4:5 — 정사각 원본(600×600)의 양옆을
 * 조금 자르고 얼굴은 그대로 남는다.
 */
const PHOTO_ASPECT = "aspect-[4/5]";

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
 * 출연진 한 장 — **위는 사진 칸, 아래는 글 칸이고, 그 경계에 흰 가명 명찰이
 * 걸친다**(2026-11-20 재디자인).
 *
 * 예전에는 정사각 판에 사진을 깔고 글자 블록을 그 위 아래쪽에 얹었다. 사진이 0장일
 * 때 만든 모양이라, 사진이 실제로 들어오자(34기) 글을 읽히게 하려고 깐 어두운
 * 그러데이션이 사진의 3분의 2를 덮어 "투명해서 안 보이고 글이랑 겹친다" 가 됐다.
 * 이제 둘이 겹치지 않으므로 그러데이션도 없다.
 *
 * **사진이 있든 없든 칸 구성은 같다.** 없으면 사진 칸에 옅은 사람 모양만 둔다 —
 * 가명 글자를 채우면 바로 아래 명찰과 한 카드에 같은 이름이 두 번 찍힌다(예전에
 * 실제로 그랬다).
 */
export async function CastCard({ member, earlier }: CardProps) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const found = member.status === "found";
  const handle = member.instagramHandle;
  // 판 전체가 인스타로 가는지. found 인데 핸들이 없는 건 데이터 오류라 링크를 안 건다.
  const linked = found && Boolean(handle);
  const alias = localizeAlias(member.alias, locale);
  const description = describe(member, locale);
  // 숫자만 두면 나이인지 번호인지 안 읽힌다 — 단위를 붙여 이름 옆에 둔다.
  const age = member.ageAtAiring
    ? fill(dict.season.age, { age: member.ageAtAiring })
    : "";

  const body = (
    <>
      {/* 사진 칸. 명찰이 이 칸 아래 경계에 걸쳐야 해서 바깥 상자는 자르지 않고
          사진만 안쪽 상자에서 자른다. */}
      <div className="relative">
        <div className={`relative ${PHOTO_ASPECT} overflow-hidden bg-elevated`}>
          {member.profileImageUrl ? (
            <Image
              src={member.profileImageUrl}
              alt={fill(dict.season.photoAlt, { alias })}
              fill
              sizes={CARD_SIZES}
              // 누를 수 있는 판만 사진이 살짝 다가온다 — 움직이면 눌리는 판으로 읽힌다.
              className={`object-cover transition-transform duration-300 ease-soft ${
                linked ? "group-hover:scale-[1.03]" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UserRound
                aria-hidden
                strokeWidth={1.25}
                className="size-1/3 text-foreground/[0.12]"
              />
            </div>
          )}
        </div>

        {/* **명찰.** 나는 솔로 출연자가 가슴에 다는 흰 가명 명찰에서 왔다 — 이 카드의
            단 하나의 장식이다. 사진과 글 칸의 경계에 걸쳐 두 칸을 한 장으로 묶고,
            사진 위에 글자를 얹지 않으면서도 이름이 사진에 붙어 있게 한다.
            현실의 물건이라 테마를 따라 뒤집지 않는다(다크에서도 흰 명찰). 살짝
            기운 건 손으로 단 느낌이다 — 더 기울이면 장난스러워진다. */}
        <span
          className={`absolute bottom-0 left-3 z-[1] flex max-w-[calc(100%-1.5rem)] translate-y-1/2 items-baseline gap-1.5 rounded-[6px] bg-white px-2.5 py-1 text-black shadow-[0_1px_0_rgb(0_0_0/0.06),0_6px_14px_-6px_rgb(0_0_0/0.45)] ring-1 ring-black/[0.06] ${NAME_TAG_TILT}`}
        >
          <span className="truncate text-[17px] leading-tight font-extrabold tracking-[-0.03em] lg:text-[18px]">
            {alias}
          </span>
          {/* 나이는 명찰 안, 이름 옆이다 — 방송 자막이 "영수(34)" 처럼 이름에
              붙여 부르는 자리라 설명 없이 읽힌다. */}
          {age && (
            <span className="font-lat shrink-0 text-[12px] font-semibold text-black/45">
              {age}
            </span>
          )}
        </span>
      </div>

      {/* 글 칸. 위 여백은 명찰이 내려와 걸친 만큼이다. */}
      <div className="flex flex-1 flex-col px-3.5 pt-7 pb-3 lg:px-4">
        {/* 출신은 이름 바로 다음이다 — 실명으로 나오는 프로그램에서 "이 사람이
            그 16기 상철" 이라는 게 이름 다음으로 궁금한 값이다. 직업보다 진하게
            둬서 두 줄이 한 덩어리로 안 뭉친다. */}
        {earlier && earlier.length > 0 && (
          <span className="mb-1 text-[12px] leading-[1.45] font-semibold break-keep text-foreground/75">
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
            className="line-clamp-2 text-[12.5px] leading-[1.5] break-keep text-muted-foreground [overflow-wrap:anywhere]"
          >
            {description}
          </span>
        )}
        {/* 계정 줄은 판 바닥에 붙인다 — 직업이 한 줄인 카드와 두 줄인 카드가 한
            줄에 서도 계정 줄이 같은 높이에 온다. 가는 선 하나로 사람 정보와 가른다. */}
        <div className="mt-auto pt-3">
          <div className="flex min-w-0 items-center gap-1.5 border-t border-border/70 pt-2.5">
            <CardStatus member={member} status={dict.status} locale={locale} />
          </div>
        </div>
      </div>
    </>
  );

  /*
   * 테두리 실선 대신 그림자로 판을 세운다 — 실선만 있으면 오려 붙인 종이로
   * 보인다. 라이트는 흰 판, 다크는 바탕보다 한 단계 밝은 판(`DARK_PANEL`)으로
   * 프로그램 화면의 기수 타일과 같다. `h-full` 로 같은 줄의 판 키를 맞춘다.
   */
  const shell = `group relative ${ANCHOR_OFFSET} flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft ${DARK_PANEL}`;

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
  // 계정 줄은 언제나 인스타 마크로 시작한다 — 이 사이트가 사람마다 답하는 질문이
  // "인스타가 있나" 라서, 답이 아직 없어도 그 질문의 자리는 보여야 한다. 마크의
  // 농도가 답을 미리 말한다(있으면 또렷하게, 아니면 옅게).
  const checked = member.lastVerified
    ? fill(status.checked, { date: formatChecked(member.lastVerified, locale) })
    : "";

  switch (member.status) {
    case "found":
      // **이 사이트에서 색이 도는 자리는 여기 하나다.** 방문자가 가지러 온 값이고,
      // 고정폭이라 한 글자씩 짚어 읽힌다 — 핸들은 문장이 아니라 식별자다.
      // 끝의 화살표는 판을 누르면 사이트 밖(인스타)으로 나간다는 표시다.
      return (
        <>
          <InstagramIcon className="size-3.5 shrink-0 text-foreground" />
          <span className="font-mono min-w-0 flex-1 truncate text-[12px] font-medium text-verified">
            @{member.instagramHandle}
          </span>
          <ArrowUpRight
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </>
      );

    case "none":
      return (
        <>
          <InstagramIcon className="size-3.5 shrink-0 text-foreground/25" />
          <span className="truncate text-[12px] font-semibold text-muted-foreground">
            {status.none}
            {checked && ` · ${checked}`}
          </span>
        </>
      );

    case "searching":
      return (
        <>
          <InstagramIcon className="size-3.5 shrink-0 text-foreground/25" />
          <span className="truncate text-[12px] font-semibold text-searching">
            {status.searching}
          </span>
        </>
      );

    // 핸들은 내지 않는다 — 본인이 잠근 계정이다(`AccountStatus` 주석).
    case "private":
      return (
        <>
          <Lock aria-hidden className="size-3.5 shrink-0 text-foreground/35" />
          <span className="truncate text-[12px] font-semibold text-muted-foreground">
            {status.private}
            {checked && ` · ${checked}`}
          </span>
        </>
      );
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
