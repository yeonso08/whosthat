import type { MetadataRoute } from "next";
import { getSeasons } from "@/lib/data";
import { seasonHref } from "@/lib/links";
import { SITE_URL } from "@/lib/site";

/**
 * 기수가 늘면 자동으로 따라온다 — generateStaticParams 와 같은 목록을 쓴다.
 *
 * lastModified 는 그 기수에서 마지막으로 계정을 확인한 날짜다. 빌드 시각을
 * 넣으면 내용이 안 바뀌어도 매 배포마다 "수정됨"이 되어 크롤러가 신뢰를 잃는다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const seasons = getSeasons();

  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...seasons.map((season) => ({
      url: `${SITE_URL}${seasonHref(season.id)}`,
      lastModified: lastVerifiedIn(season.cast),
      // 방영 중인 기수는 계정이 계속 붙는다. 지난 기수는 거의 안 바뀐다.
      changeFrequency: season.onAir ? ("daily" as const) : ("monthly" as const),
      priority: season.onAir ? 0.9 : 0.7,
    })),
  ];
}

function lastVerifiedIn(cast: { lastVerified?: string }[]): Date | undefined {
  const latest = cast
    .map((m) => m.lastVerified)
    .filter((d) => d !== undefined)
    .sort()
    .at(-1);

  return latest ? new Date(latest) : undefined;
}
