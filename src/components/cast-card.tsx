import { CastPhoto } from "@/components/cast-photo";
import { InstagramIcon } from "@/components/icons";
import { formatChecked } from "@/lib/data";
import type { CastMember } from "@/lib/types";

const CARD_SIZES = "(min-width: 640px) 300px, 50vw";

export function CastCard({ member }: { member: CastMember }) {
  const found = member.status === "found";
  const description = describe(member);

  const body = (
    <>
      <div className="relative aspect-[6/7] w-full">
        <CastPhoto
          src={member.profileImageUrl}
          alt={`${member.alias} 사진`}
          sizes={CARD_SIZES}
          dimmed={!found}
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

  if (!found) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-card">{body}</div>
    );
  }

  return (
    <a
      href={`https://instagram.com/${member.instagramHandle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden rounded-2xl bg-elevated transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {body}
    </a>
  );
}

function CardStatus({ member }: { member: CastMember }) {
  if (member.status === "found") {
    return (
      <span className="font-lat mt-1 truncate text-[11.5px] font-semibold">
        @{member.instagramHandle}
      </span>
    );
  }

  if (member.status === "none") {
    const checked = member.lastVerified
      ? formatChecked(member.lastVerified)
      : "";
    return (
      <span className="mt-1 text-[11.5px] font-semibold text-muted-foreground">
        계정 없음{checked && ` · ${checked} 확인`}
      </span>
    );
  }

  return (
    <span className="mt-1 text-[11.5px] font-semibold text-searching">
      찾는 중
    </span>
  );
}

/** "김○○ · 31 · 간호사" — 모르는 항목은 통째로 뺀다. */
function describe(member: CastMember): string {
  return [member.name, member.ageAtAiring, member.occupation]
    .filter(Boolean)
    .join(" · ");
}
