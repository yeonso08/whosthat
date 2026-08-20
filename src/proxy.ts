import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/locales";

/**
 * 언어를 안 고르고 들어온 `/` 를 그 사람의 브라우저 언어로 보낸다.
 *
 * `/ko`·`/en` 처럼 언어가 박힌 주소는 건드리지 않는다 — 공유받은 링크가 읽는
 * 사람 브라우저 설정에 따라 다른 언어로 튀면 그게 더 이상하다. 언어 선택을
 * 쿠키로 기억하지도 않는다: 처리방침에 "쿠키를 쓰지 않는다"고 적어 뒀고, 전환
 * 버튼이 주소를 바꾸므로 기억할 것도 없다.
 */

/**
 * 아는 언어가 하나도 안 걸렸을 때. 기본 언어(한국어)가 아니라 영어다 —
 * 한국어를 안 쓰는 사람에게 한국어를 보여 줄 이유가 없고, 이 사이트를 찾아온
 * 이상 영어가 그나마 읽힐 확률이 높다.
 */
const UNMATCHED_LOCALE: Locale = "en";

export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;

  // 307 이다. 301 로 굳히면 브라우저가 언어까지 캐시해 버려서, 나중에 언어를
  // 바꿔도 `/` 가 계속 옛 언어로 간다.
  return NextResponse.redirect(url);
}

/**
 * `Accept-Language: ja,en-US;q=0.9,en;q=0.8` → "en".
 *
 * negotiator 같은 라이브러리를 넣지 않는다 — 언어가 둘뿐이고, 규칙은 q 값 순으로
 * 훑으며 아는 언어를 먼저 만나면 그걸 쓰는 게 전부다.
 */
function pickLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params.find((p) => p.trim().startsWith("q="));
      return {
        // "en-US" 의 지역은 버린다. 지금은 지역별 판이 없다.
        tag: tag.trim().toLowerCase().split("-")[0],
        quality: quality ? Number(quality.trim().slice(2)) : 1,
      };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.quality))
    .sort((a, b) => b.quality - a.quality);

  const hit = ranked.find((entry) => isLocale(entry.tag));
  if (hit) return hit.tag as Locale;

  // 여기까지 왔으면 아는 언어가 하나도 안 걸린 것이다.
  return UNMATCHED_LOCALE;
}

export const config = {
  // 언어를 정하는 순간은 `/` 하나뿐이다. 나머지 경로는 전부 정적으로 서빙되고
  // 엣지를 거치지 않는다.
  matcher: "/",
};
