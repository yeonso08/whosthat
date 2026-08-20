import type { NextConfig } from "next";
import { DEFAULT_LOCALE } from "./src/lib/locales";

const nextConfig: NextConfig = {
  /**
   * 언어를 붙이기 전의 주소들. 이미 공유·색인된 링크라 끊지 않고 한국어 판으로
   * 넘긴다 — 그때의 방문자는 전부 한국어로 보던 사람들이다.
   *
   * `/` 는 여기 없다. 브라우저 언어를 봐야 정해져서 `src/proxy.ts` 가 맡는다.
   */
  async redirects() {
    return [
      { source: "/seasons/:id", destination: `/${DEFAULT_LOCALE}/seasons/:id`, permanent: true },
      { source: "/takedown", destination: `/${DEFAULT_LOCALE}/takedown`, permanent: true },
      { source: "/privacy", destination: `/${DEFAULT_LOCALE}/privacy`, permanent: true },
    ];
  },
};

export default nextConfig;
