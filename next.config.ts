import type { NextConfig } from "next";
import { LOCALES, DEFAULT_LOCALE } from "./src/lib/locales";

/**
 * 프로그램이 둘이 되기 전의 기수 주소. 그때는 나는 솔로 하나뿐이라 프로그램
 * 세그먼트가 없었다(`/ko/seasons/s33`). 이미 색인·공유된 링크라 끊지 않는다.
 */
const FIRST_PROGRAM = "na-neun-solo";

const nextConfig: NextConfig = {
  /**
   * 옛 주소를 지금 주소로 넘긴다. 두 세대가 겹쳐 있다 — 언어가 붙기 전(`/seasons/s33`)과
   * 프로그램이 붙기 전(`/ko/seasons/s33`)이다. 둘 다 한 번에 최종 주소로 보낸다:
   * 리다이렉트를 두 번 태우면 크롤러가 체인을 싫어하고 링크 신호도 샌다.
   *
   * `/` 는 여기 없다. 브라우저 언어를 봐야 정해져서 `src/proxy.ts` 가 맡는다.
   */
  async redirects() {
    return [
      // 언어가 붙기 전의 주소. 그때의 방문자는 전부 한국어로 보던 사람들이다.
      {
        source: "/seasons/:id",
        destination: `/${DEFAULT_LOCALE}/${FIRST_PROGRAM}/seasons/:id`,
        permanent: true,
      },
      { source: "/takedown", destination: `/${DEFAULT_LOCALE}/takedown`, permanent: true },
      { source: "/privacy", destination: `/${DEFAULT_LOCALE}/privacy`, permanent: true },
      // 프로그램이 붙기 전의 주소. 언어는 그대로 두고 프로그램만 끼운다 —
      // `/en/seasons/s33` 을 한국어로 보내면 읽던 언어를 빼앗는 것이 된다.
      ...LOCALES.map((locale) => ({
        source: `/${locale}/seasons/:id`,
        destination: `/${locale}/${FIRST_PROGRAM}/seasons/:id`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
