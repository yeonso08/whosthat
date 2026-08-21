/**
 * 검색엔진에 이 사이트가 어떻게 보이는지. 색인 여부·OG 공통 필드·구조화
 * 데이터(JSON-LD)가 한 파일에 있다.
 *
 * 셋을 묶어 둔 이유는 **함께 어긋나기 때문**이다. 빈 기수를 noindex 로 돌리면서
 * sitemap 에서 빼는 걸 잊으면 "색인하지 말라고 적어 둔 페이지를 sitemap 으로
 * 제출하는" 상태가 되고, Search Console 이 그걸 오류로 잡는다.
 *
 * 서버 전용이다 — 사전과 SITE_URL 을 읽는다.
 */

import { BRAND_WORDMARK } from "./brand";
import {
  fill,
  getDictionary,
  localizeAlias,
  localizeSeason,
  ogAlternateLocales,
  ogLocale,
  type Locale,
} from "./i18n";
import { homeHref, instagramUrl, seasonHref } from "./links";
import { SITE_URL } from "./site";
import { getCoverage, type Season } from "./types";

/** JSON-LD 한 덩어리. 스키마가 자유 형식이라 여기까지만 좁힌다. */
export type Schema = Record<string, unknown>;

/**
 * 이 기수를 색인에 올릴지. 명단을 아직 못 채운 기수는 화면에 "명단 정리 중"
 * 한 문장뿐이라 크롤러가 soft 404 로 읽는다 — 그 판정은 그 페이지 하나로 끝나지
 * 않고 사이트 전체 평가로 번진다.
 *
 * 명단이 들어오면 저절로 색인으로 돌아온다. 기수 목록에서 링크는 계속 걸리고
 * (`follow`) sitemap 에서만 빠진다.
 */
export function isIndexable(season: Season): boolean {
  return season.cast.length > 0;
}

/**
 * 모든 페이지가 공유하는 openGraph 필드.
 *
 * **페이지가 `openGraph` 를 정의하는 순간 레이아웃의 `openGraph` 는 통째로
 * 덮인다**(Next 의 metadata 는 얕게 병합된다). 그래서 페이지마다 제목만 적으면
 * `og:site_name` 과 `og:locale` 이 조용히 빠진 채로 나간다 — 눈에 안 보이고
 * 공유 카드에서만 드러난다. 페이지의 openGraph 는 이걸 펼치는 것으로 시작한다.
 */
export function openGraphBase(locale: Locale) {
  return {
    siteName: getDictionary(locale).site.name,
    locale: ogLocale(locale),
    // 이 화면의 다른 언어 판이 있다는 표시. 카카오톡·페이스북이 읽는다.
    alternateLocale: ogAlternateLocales(locale),
  };
}

/**
 * 사이트 자체를 가리키는 엔티티. Google 이 검색 결과에 도메인 대신 사이트
 * 이름을 쓸지 정할 때 홈의 이 마크업을 본다.
 *
 * `url` 은 언어 홈(`/ko`)이 아니라 사이트 루트다 — WebSite 는 사이트 하나를
 * 가리키므로 언어마다 다른 사이트가 되면 안 된다. 언어는 `inLanguage` 가 말한다.
 */
export function websiteSchema(locale: Locale): Schema {
  const dict = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: dict.site.name,
    // 브랜드는 라틴 기준이라 언어를 안 탄다. 사이트 이름 후보로 함께 준다.
    alternateName: BRAND_WORDMARK,
    url: SITE_URL,
    description: dict.site.description,
    inLanguage: locale,
  };
}

/**
 * 홈 › 이 페이지. 검색 결과의 주소 줄이 경로로 바뀐다.
 *
 * 이 사이트는 두 단계뿐이라 마지막 한 칸만 받는다. 세 단계가 생기면 그때
 * 배열로 바꾼다.
 */
export function breadcrumbSchema(
  locale: Locale,
  current: { name: string; path: string },
): Schema {
  const dict = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: dict.site.name, path: homeHref(locale) },
      current,
    ].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/**
 * 기수 상세가 내보내는 구조화 데이터. 빵부스러기 + 계정을 찾아 둔 사람 목록이다.
 *
 * **`found` 인 사람만 넣는다.** 계정을 못 찾은 사람은 이을 곳(`sameAs`)이 없어서,
 * 넣어 봐야 "사람이 있다"는 주장만 남는다 — 화면에 없는 말을 마크업으로 더하지
 * 않는다는 게 이 사이트의 데이터 규칙이다.
 */
export function seasonSchema(season: Season, locale: Locale): Schema[] {
  const { label, special } = localizeSeason(season, locale);
  const dict = getDictionary(locale);

  const crumb = breadcrumbSchema(locale, {
    name: label,
    path: seasonHref(locale, season.id),
  });

  // status 만 보면 핸들이 있는지까지는 타입이 안 좁혀진다 — 둘을 함께 확인하며
  // 필요한 두 값만 꺼낸다. (핸들 없는 found 는 데이터 오류라 카드도 링크를 안 건다.)
  const found = season.cast.flatMap((member) =>
    member.status === "found" && member.instagramHandle
      ? [{ alias: member.alias, handle: member.instagramHandle }]
      : [],
  );
  if (found.length === 0) return [crumb];

  const coverage = getCoverage(season.cast);

  return [
    crumb,
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: fill(dict.season.metaTitle, {
        season: label,
        special: special ? ` ${special}` : "",
      }),
      // 전체 인원이 아니라 계정을 찾아 둔 사람 수다. 아래 description 이 둘의
      // 차이를 말한다 — 안 적으면 이 기수 인원이 이만큼인 줄로 읽힌다.
      numberOfItems: found.length,
      description: fill(dict.og.seasonStat, {
        total: coverage.total,
        found: coverage.found,
      }),
      itemListElement: found.map((member, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Person",
          // 가명 하나를 318명 중 26명이 같이 쓴다 — 기수를 붙여야 사람이 갈린다.
          name: `${label} ${localizeAlias(member.alias, locale)}`,
          sameAs: instagramUrl(member.handle),
        },
      })),
    },
  ];
}
