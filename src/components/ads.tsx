import { ADSENSE_CLIENT_ID } from "@/lib/site";

/**
 * 애드센스 자동 광고 스니펫.
 *
 * **레이아웃이 아니라 페이지가 건다.** 처음에는 루트 레이아웃에 있었는데, 그러면
 * 명단이 빈 기수·골격만 있는 프로그램·정책 두 페이지에도 광고가 나간다. 애드센스는
 * 그걸 "게시자 콘텐츠가 없는 화면에 Google 게재 광고" 로 잡고, 2026-09-02 에 실제로
 * 그 사유로 정책 위반이 걸렸다 — 색인 쪽은 `isIndexable` 로 빼 두고 광고만 그대로
 * 나가고 있었다.
 *
 * 그래서 판단을 색인과 같은 곳에 묶는다: **`noindex` 인 화면에는 광고도 안 건다.**
 * 새 화면을 붙일 때 이 컴포넌트를 안 쓰면 광고가 안 나갈 뿐 위반은 안 생긴다 —
 * 빠뜨렸을 때 안전한 쪽이 기본값이라야 한다.
 *
 * 게시자 ID 가 비어 있으면 아예 안 건다. 틀린 ID 로 요청이 나가는 게 안 나가는
 * 것보다 나쁘다.
 *
 * `next/script` 가 아니라 맨 태그다 — `<Script>` 가 붙이는 `data-nscript` 를
 * adsbygoogle.js 가 모르는 속성이라며 콘솔에 경고로 남긴다. async src 짜리는
 * React 가 알아서 `<head>` 로 올리고 중복도 지운다.
 */
export function AutoAds() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
