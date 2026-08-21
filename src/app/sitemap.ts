import type { MetadataRoute } from "next";
import { getSeasons } from "@/lib/data";
import { languageAlternates } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";
import { isIndexable } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

/**
 * 기수가 늘면 자동으로 따라온다 — generateStaticParams 와 같은 목록을 쓴다.
 * 언어가 늘면 줄 수가 언어 배수로 는다.
 *
 * lastModified 는 그 기수에서 마지막으로 계정을 확인한 날짜다. 빌드 시각을
 * 넣으면 내용이 안 바뀌어도 매 배포마다 "수정됨"이 되어 크롤러가 신뢰를 잃는다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // 명단이 빈 기수는 noindex 라 여기서도 뺀다 — 색인하지 말라고 적어 둔 페이지를
  // sitemap 으로 제출하면 Search Console 이 그걸 오류로 잡는다. 둘의 기준이
  // 갈라지지 않게 판단은 `isIndexable` 한 곳에서만 한다.
  const seasons = getSeasons().filter(isIndexable);

  const pages = [
    { path: "", changeFrequency: "daily" as const, priority: 1 },
    ...seasons.map((season) => ({
      path: `/seasons/${season.id}`,
      lastModified: lastVerifiedIn(season.cast),
      // 방영 중인 기수는 계정이 계속 붙는다. 지난 기수는 거의 안 바뀐다.
      changeFrequency: season.onAir ? ("daily" as const) : ("monthly" as const),
      priority: season.onAir ? 0.9 : 0.7,
    })),
    // 삭제 창구는 당사자가 검색으로도 닿아야 해서 색인에 올린다.
    ...["/takedown", "/privacy"].map((path) => ({
      path,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  // 언어마다 한 줄씩 내되, 서로가 서로의 다른 언어 판이라고 알려 준다 —
  // 그래야 크롤러가 같은 내용의 중복이 아니라 번역으로 읽는다.
  return pages.flatMap(({ path, ...meta }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      ...meta,
      alternates: { languages: absolute(languageAlternates(path)) },
    })),
  );
}

/** hreflang 은 절대 URL 이라야 한다. 화면 쪽 alternates 는 상대경로를 쓴다. */
function absolute(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languages).map(([key, path]) => [key, `${SITE_URL}${path}`]),
  );
}

function lastVerifiedIn(cast: { lastVerified?: string }[]): Date | undefined {
  const latest = cast
    .map((m) => m.lastVerified)
    .filter((d) => d !== undefined)
    .sort()
    .at(-1);

  return latest ? new Date(latest) : undefined;
}
