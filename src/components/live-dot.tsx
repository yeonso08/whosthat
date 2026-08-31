type Props = { className?: string };

/**
 * 방영 중을 알리는 빨간 점. 홈의 방영 중 줄 · 홈 포스터 모서리 · 최신 기수
 * 카드 셋이 같은 것을 쓴다.
 *
 * **빨강은 점에만 쓴다.** 방송의 라이브 표시가 어디서나 빨간 점이라 설명이
 * 필요 없는 기호고, 옆 글자까지 물들이면 붉은 면적이 앰버 핸들(방문자가
 * 가지러 온 값)과 경쟁한다. "방영 중" 이라는 사실은 글자가 그대로 말한다.
 *
 * 무리(halo)가 붙는 게 핵심이다 — 정지한 점은 상태 배지지만, 천천히 퍼지는
 * 무리가 있으면 "지금" 이 된다. 모션을 줄인 사람에게는 무리가 안 움직이고
 * 옅게 멈춰 서서, 점 하나보다는 크게 보인다.
 *
 * 크기는 감싸는 쪽이 정한다 — 포스터 모서리(6px)와 카드 줄(6px)이 같고,
 * 넓은 자리에서는 키운다.
 */
export function LiveDot({ className = "size-1.5" }: Props) {
  return (
    <span className={`relative flex shrink-0 ${className}`}>
      <span className="live-halo absolute inset-0 rounded-full bg-live" />
      <span className="relative h-full w-full rounded-full bg-live" />
    </span>
  );
}
