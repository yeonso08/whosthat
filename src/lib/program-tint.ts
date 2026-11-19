/**
 * 홈에서 프로그램마다 입히는 색 — 포스터 판의 그러데이션(2026-11-19 홈
 * 재디자인). 포스터가 걸리면 그림 뒤로 가려지고, 없는 프로그램에서만 보인다.
 *
 * 포스터가 0장인 동안 회색 판이 줄지어 "칙칙하다" 는 지적을 받았다. 색면을
 * 평평하게 칠하면 반려됐던 색면 포스터풍이 되므로, 앨범 커버처럼 한쪽 모서리에서
 * 빛이 번지는 두 겹 그러데이션이다. 글자는 어느 테마에서나 흰색이다 — 판이
 * 그림 자리라 테마를 따라 뒤집히지 않는다(포스터가 걸려도 마찬가지다).
 *
 * 색은 프로그램의 무대에서 골랐다: 나는 솔로는 장미(이 장르의 솔로녀 분홍),
 * 솔로지옥은 섬의 바다, 나솔사계는 보라, 계약결혼은 반지의 호박빛이다.
 * 표에 없는 프로그램은 무채색으로 떨어진다 — 관리자에서 막 만든 프로그램이
 * 엉뚱한 색을 빌려 입지 않게.
 */
type Tint = { glow: string; from: string; to: string };

const TINTS: Record<string, Tint> = {
  "i-am-solo": { glow: "#ff9cbf", from: "#e0397a", to: "#4a0f2e" },
  "singles-inferno": { glow: "#7fe3d6", from: "#1f7ad6", to: "#0a1d45" },
  "i-am-solo-love-goes-on": { glow: "#c7a8ff", from: "#7a4fe0", to: "#22134d" },
  "contract-marriage": { glow: "#ffd08a", from: "#e0782f", to: "#4a1d0b" },
};

const NEUTRAL: Tint = { glow: "#8a8a96", from: "#45454f", to: "#141418" };

function programTint(programId: string): Tint {
  return TINTS[programId] ?? NEUTRAL;
}

/** 포스터 판의 배경. 왼쪽 위에서 빛이 번지고 오른쪽 아래로 가라앉는다. */
export function programTintBackground(programId: string): string {
  const { glow, from, to } = programTint(programId);
  return `radial-gradient(120% 70% at 0% 0%, ${glow} 0%, transparent 55%), linear-gradient(155deg, ${from} 0%, ${to} 100%)`;
}
