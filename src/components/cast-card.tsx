import type { ReactElement } from "react";
import { CastAvatar } from "@/components/cast-avatar";
import { InstagramIcon } from "@/components/icons";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatChecked } from "@/lib/data";
import { instagramUrl } from "@/lib/links";
import type { CastMember } from "@/lib/types";

/** 카드와 그 안의 상태 줄이 같은 사람을 그리므로 타입을 함께 쓴다. */
type Props = { member: CastMember };

export function CastCard({ member }: Props) {
  const found = member.status === "found";
  const handle = member.instagramHandle;
  const description = describe(member);

  const content = (
    <>
      <ItemMedia>
        <CastAvatar alias={member.alias} status={member.status} />
      </ItemMedia>

      <ItemContent className="gap-0.5">
        <ItemTitle
          className={`text-base font-bold tracking-tight ${found ? "" : "text-muted-foreground"}`}
        >
          {member.alias}
        </ItemTitle>
        {description && (
          <ItemDescription className="text-[12.5px]">
            {description}
          </ItemDescription>
        )}
        <CardStatus member={member} />
      </ItemContent>

      {found && (
        <ItemActions>
          <InstagramIcon className="size-4 text-muted-foreground" />
        </ItemActions>
      )}
    </>
  );

  // handle 까지 봐야 타입이 좁혀진다. found 인데 핸들이 없는 건 데이터 오류라
  // 링크를 거는 대신 카드로만 둔다.
  if (!found || !handle) {
    return <Item className="rounded-2xl bg-card p-3.5">{content}</Item>;
  }

  return (
    <Item
      className="rounded-2xl bg-card p-3.5 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      render={
        <a
          href={instagramUrl(handle)}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    >
      {content}
    </Item>
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
        <span className="font-lat mt-0.5 truncate text-[12.5px] font-semibold">
          @{member.instagramHandle}
        </span>
      );

    case "none": {
      const checked = member.lastVerified
        ? formatChecked(member.lastVerified)
        : "";
      return (
        <span className="mt-0.5 text-[12.5px] font-semibold text-muted-foreground">
          계정 없음{checked && ` · ${checked} 확인`}
        </span>
      );
    }

    case "searching":
      return (
        <span className="mt-0.5 text-[12.5px] font-semibold text-searching">
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
