import type { AccountStatus } from "@/lib/types";

type Props = { alias: string; status: AccountStatus };

/**
 * 상태가 하나 늘면 여기서 컴파일 에러가 난다.
 *
 * 전부 저대비다 — 사진 자리를 통째로 채우는 배지라, 카드 크기에서 또렷하면
 * 색면이 화면을 먹는다(반려된 포스터 방향). 상태는 카드 아래 상태 줄이
 * 또렷하게 말하므로 여기선 힌트만 준다.
 *
 * **바탕은 셋 다 `bg-elevated` 다.** 예전에 둘이 `bg-card` 였는데, 기수 목록이
 * 흰 판 위로 올라가면서 그 배지들이 판에 통째로 묻혔다 — 원이 있는지조차 안
 * 보였다. 상태를 가르는 건 바탕이 아니라 글자의 농도다.
 */
const STATUS_STYLE: Record<AccountStatus, string> = {
  found: "bg-elevated text-muted-foreground",
  none: "bg-elevated text-foreground/15",
  searching: "bg-elevated text-muted-foreground/45",
};

/**
 * 사진이 아직 없는 사람 자리에 가명 두 글자를 대신 넣는다. 사진 자리를 통째로
 * 채우고 모양(원형·사각)과 글자 크기는 감싸는 쪽이 정한다 — 같은 배지가 카드,
 * 히어로 타일, 목록 줄의 작은 원까지 세 크기로 쓰이기 때문이다.
 */
export function CastAvatar({ alias, status }: Props) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center font-bold ${STATUS_STYLE[status]}`}
    >
      {alias}
    </div>
  );
}
