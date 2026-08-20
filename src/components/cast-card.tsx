import type { ReactElement } from "react";
import { CastPhoto } from "@/components/cast-photo";
import { InstagramIcon } from "@/components/icons";
import { formatChecked } from "@/lib/data";
import { instagramUrl } from "@/lib/links";
import type { CastMember } from "@/lib/types";

/** 카드와 그 안의 상태 줄이 같은 사람을 그리므로 타입을 함께 쓴다. */
type Props = { member: CastMember };

/** 2열 그리드라 모바일에선 화면 절반, 넓어지면 카드가 300px 에서 멈춘다. */
const CARD_SIZES = "(min-width: 640px) 300px, 50vw";

/** 사진 자리를 채우는 가명 배지의 글자 크기. 배지는 상속받아 쓴다. */
const FALLBACK_TEXT = "text-[22px] tracking-tight";

/**
 * 검색 결과에서 앵커로 내려왔을 때 카드가 화면 맨 위에 딱 붙지 않게 띄운다.
 * 붙어 있으면 위에 뭐가 더 있는지 안 보여서 목록의 첫 줄처럼 읽힌다.
 */
const ANCHOR_OFFSET = "scroll-mt-4";

export function CastCard({ member }: Props) {
  const found = member.status === "found";
  const handle = member.instagramHandle;
  const description = describe(member);

  const body = (
    <>
      <div className={`relative aspect-[6/7] w-full ${FALLBACK_TEXT}`}>
        <CastPhoto
          src={member.profileImageUrl}
          alias={member.alias}
          status={member.status}
          alt={`${member.alias} 사진`}
          sizes={CARD_SIZES}
        />
      </div>

      {found && (
        <span className="absolute top-2.5 right-2.5 flex size-7.5 items-center justify-center rounded-full bg-background/65">
          <InstagramIcon className="size-3.5 text-foreground" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-background/95 to-transparent px-3 pt-8 pb-3">
        <span
          className={`text-xl font-bold tracking-tight ${found ? "" : "text-muted-foreground"}`}
        >
          {member.alias}
        </span>
        {description && (
          <span className="truncate text-[11.5px] text-muted-foreground">
            {description}
          </span>
        )}
        <CardStatus member={member} />
      </div>
    </>
  );

  // handle 까지 봐야 타입이 좁혀진다. found 인데 핸들이 없는 건 데이터 오류라
  // 링크를 거는 대신 카드로만 둔다.
  if (!found || !handle) {
    return (
      <div
        id={member.id}
        className={`relative overflow-hidden rounded-2xl bg-card ${ANCHOR_OFFSET}`}
      >
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
      className={`relative block overflow-hidden rounded-2xl bg-elevated ${ANCHOR_OFFSET} transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
    >
      {body}
    </a>
  );
}

/**
 * 반환 타입을 못 박아 두면 AccountStatus 에 상태가 하나 늘 때
 * 여기서 컴파일 에러가 난다 — 화면 문구를 빠뜨리지 않게 하는 장치다.
 */
function CardStatus({ member }: Props): ReactElement {
  switch (member.status) {
    case "found":
      return (
        <span className="font-lat mt-1 truncate text-[11.5px] font-semibold">
          @{member.instagramHandle}
        </span>
      );

    case "none": {
      const checked = member.lastVerified
        ? formatChecked(member.lastVerified)
        : "";
      return (
        <span className="mt-1 text-[11.5px] font-semibold text-muted-foreground">
          계정 없음{checked && ` · ${checked} 확인`}
        </span>
      );
    }

    case "searching":
      return (
        <span className="mt-1 text-[11.5px] font-semibold text-searching">
          찾는 중
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
