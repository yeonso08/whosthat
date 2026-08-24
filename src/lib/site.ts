/**
 * 배포 도메인. metadataBase·sitemap·robots·OG 이미지가 전부 이 값을 쓴다.
 *
 * 틀리면 조용히 망가진다 — 에러 없이 canonical 과 sitemap 이 엉뚱한 곳을
 * 가리키고, 색인과 공유 카드가 통째로 무의미해진다.
 *
 * 서버에서만 쓴다. VERCEL_ 변수는 클라이언트 번들에 안 들어가므로
 * 클라이언트 컴포넌트에서 이 값을 읽지 말 것.
 */
export const SITE_URL = resolveSiteUrl();

function resolveSiteUrl(): string {
  // 손으로 못박은 도메인. 설정하면 항상 이게 이긴다.
  //
  // 이 프로젝트는 Vercel 위에서도 이걸 쓴다 — 아래 자동값이 "가장 짧은 커스텀
  // 도메인"을 고르는데, apex(`nukko.net`)와 `www` 를 함께 등록해 두면 짧은 쪽은
  // 언제나 apex 다. 그런데 apex 는 `www` 로 308 하는 리다이렉트 전용이라, 그대로
  // 두면 canonical 과 sitemap 이 열면 딴 데로 튕기는 주소를 가리킨다.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  // Vercel 이 넣어 주는 프로덕션 도메인. 위 값이 없을 때의 차선책이다.
  // 프리뷰 배포에서도 프로덕션 주소가 들어와서 canonical 이 흩어지지 않는다.
  // (프로젝트 설정에서 시스템 환경변수 접근이 꺼져 있으면 값이 없다.)
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * 삭제·정정 요청을 받는 주소.
 *
 * PLANNING.md §9 가 약속한 창구라 **실제로 열려 있는 주소여야 한다.** 반송되면
 * 요청이 통째로 사라지고, 사이트는 지키지 못할 약속을 걸어 둔 셈이 된다.
 * 개인 메일 대신 이 사이트 전용 주소를 쓴다 — 공개되면 수집되기 때문이다.
 */
export const CONTACT_EMAIL = "nukko.team@gmail.com";

/**
 * 네이버 서치어드바이저 소유확인 코드.
 *
 * 구글은 DNS TXT 로 확인해서 코드에 아무것도 안 남지만, 네이버는 DNS 방식이
 * 없어서 메타 태그밖에 못 쓴다.
 *
 * 도메인과 짝이라 SITE_URL 옆에 둔다 — 검증은 호스트네임 단위로 쌓여서, 위
 * 주소가 바뀌면 이 값도 새로 받아야 한다. 지우면 소유확인이 풀린다.
 */
export const NAVER_SITE_VERIFICATION = "f56f484cb0064465cd6e845f845153a34a2733be";

/** OG 카드 규격. 1200×630 은 카카오톡·페이스북·X 가 공통으로 받는 크기다. */
export const OG_SIZE = { width: 1200, height: 630 };
