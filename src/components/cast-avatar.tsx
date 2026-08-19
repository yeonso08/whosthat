import type { AccountStatus } from "@/lib/types";

type Props = {
  alias: string;
  status: AccountStatus;
  /** row = 기수 상세의 목록 행, face = 기수 목록 줄에 겹쳐 쌓는 작은 표식. */
  variant?: "row" | "face";
};

/** 상태가 하나 늘면 여기서 컴파일 에러가 난다. */
const STATUS_STYLE: Record<AccountStatus, string> = {
  found: "bg-elevated text-foreground",
  none: "bg-card text-muted-foreground",
  searching: "bg-card text-searching",
};

/**
 * 사진 대신 가명 두 글자를 원형 배지로 보여준다. 사진을 못 쓰게 되면서
 * (초상권 문제) 실루엣 자리를 대신하는 표식이라, 상태별로 색만 다르다.
 */
export function CastAvatar({ alias, status, variant = "row" }: Props) {
  const isFace = variant === "face";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${
        isFace
          ? "-ml-2.5 size-9.5 border-2 border-background text-[10px]"
          : "size-11 text-[13px]"
      } ${STATUS_STYLE[status]}`}
    >
      {alias}
    </div>
  );
}
