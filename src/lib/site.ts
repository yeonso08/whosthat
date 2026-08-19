/**
 * 배포 도메인. metadataBase·sitemap·robots·OG 이미지가 전부 이 값을 쓴다.
 *
 * 배포 환경에서 NEXT_PUBLIC_SITE_URL 을 반드시 설정한다. 안 하면 canonical 과
 * sitemap 이 localhost 를 가리켜서 색인이 통째로 무의미해진다.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** 검색 결과와 공유 카드에 쓰는 사이트 이름. */
export const SITE_NAME = "나는 솔로 출연진 인스타";

/** OG 카드 규격. 1200×630 은 카카오톡·페이스북·X 가 공통으로 받는 크기다. */
export const OG_SIZE = { width: 1200, height: 630 };
