@AGENTS.md

# whosthat

예능 출연진의 인스타그램 계정을 기수별로 모아 두는 아카이브. 1차 대상은 "나는 솔로", 이후 넷플릭스 프로그램으로 확장한다. 배경과 범위는 `PLANNING.md`에 있다.

## 명령어

```bash
pnpm dev      # 개발 서버 (3000)
pnpm build    # 프로덕션 빌드 — 기수 페이지를 전부 SSG로 뽑는다
pnpm lint

pnpm exec shadcn add <name>   # shadcn/ui 컴포넌트 추가 — 손으로 짜기 전에 먼저 확인
```

## 브랜치·PR

**`main` 에 직접 올리지 않는다. 흐름은 무조건 `작업 브랜치 → dev → main` 이다.**

```bash
git checkout -b <branch> dev          # dev 기준으로 딴다 — main 기준이면 PR 에 남의 커밋이 딸려 온다
gh pr create --base dev               # --base 를 빼면 GitHub 기본 브랜치(main)로 잡힌다
# 머지 후
git push origin --delete <branch> && git branch -d <branch>
```

**저장소 상태로 이 규칙을 추론하지 말 것.** 반대로 읽히게 생겼다 — `origin/dev` 가 `main` 보다 뒤처져 있어 죽은 브랜치처럼 보이고, 머지된 PR #1(`feat/brand-wordmark-icon` → `main`)은 이 규칙을 어긴 예다. 그래도 규칙은 위가 맞다.

## 구조

```
src/app/[lang]/page.tsx              기수 목록 — [lang] 이 루트 세그먼트다(전 화면이 그 아래)
src/app/[lang]/seasons/[id]/page.tsx 기수 상세 (언어 × 기수로 전부 프리렌더)
src/app/[lang]/takedown/page.tsx     삭제·정정 요청 창구
src/app/[lang]/privacy/page.tsx      개인정보 처리방침
src/app/[lang]/layout.tsx            루트 레이아웃 — <html lang>, 언어별 metadata, generateStaticParams
src/app/icon.tsx                     파비콘 — ㄲ 마크, 코드 생성(ImageResponse). 언어를 안 탄다
src/app/apple-icon.tsx               iOS 홈 화면 아이콘 — 같은 마크, 180×180
src/app/sitemap.ts / robots.ts       언어마다 한 줄씩 + hreflang (명단 빈 기수는 뺀다)
src/proxy.ts                         `/` 로 들어온 사람을 브라우저 언어로 보낸다 (Next 16 의 미들웨어)
src/lib/locales.ts                   언어 목록 — 화면·클라이언트·프록시가 다 읽는 순수 모듈
src/lib/i18n.ts                      사전 로더 + 데이터 어휘(가명 로마자·특집) + 날짜/현황 포맷
src/dictionaries/{ko,en}.json        화면 문구
src/lib/brand.ts                     BRAND_MARK_PATHS(ㄲ 좌표) — 언어 불변, 아이콘과 공유 / BRAND_WORDMARK(누꼬·nukko) — 언어별
src/lib/links.ts                     내부 경로 — 전부 언어로 시작한다
src/lib/seo.ts                       색인 여부·OG 공통 필드·JSON-LD — 검색엔진에 보이는 것을 한 곳에
src/lib/types.ts                     Program → Season → CastMember 모델
src/lib/data.ts                      JSON 로더 + 검색 인덱스 생성
src/lib/search.ts                    검색 매칭 — 데이터를 모른다(클라이언트로 넘어간다)
src/data/na-neun-solo.json           실데이터 — 채우는 법은 src/data/README.md
src/components/                      cast-card, cast-photo, cast-avatar, season-row, season-feature, season-search, site-footer, site-header, back-link, wordmark, icons, json-ld, theme-provider, mode-toggle, locale-toggle
public/cast/                         출연진 사진 — profileImageUrl 이 가리키는 곳 (아직 비어 있다)
```

Next.js 16 App Router + Tailwind v4 + shadcn/ui, pnpm. `params` 는 Promise 라 반드시 await 한다.

## 언어 — 한국어·영어 (일본어 예정)

해외에서 한국 예능 출연진을 찾는 사람을 받으려고 2026-08-21 에 언어를 붙였다. **URL 이 언어를 정한다** — `/ko/seasons/s33`, `/en/seasons/s33`. 언어가 없는 주소는 두 갈래로 처리한다: `/` 는 `src/proxy.ts` 가 `Accept-Language` 를 보고 307 로 보내고, 언어를 붙이기 전의 옛 주소(`/seasons/s33`·`/takedown`·`/privacy`)는 `next.config.ts` 가 한국어로 308 한다.

- **언어를 감지하는 순간은 `/` 하나뿐이다.** proxy 의 matcher 가 `/` 라서 나머지 경로는 엣지를 안 거치고 정적으로 나간다. 공유받은 `/ko/...` 링크가 읽는 사람 브라우저 설정 때문에 다른 언어로 튀지도 않는다.
- **언어 선택을 쿠키로 기억하지 않는다.** 처리방침에 "쿠키는 쓰지 않는다"고 적어 뒀다 — 편의 하나 때문에 그 문장을 거짓으로 만들지 말 것. 전환 버튼이 주소를 바꾸므로 기억할 것도 없다.
- 아는 언어가 하나도 안 걸리면 영어로 보낸다(`UNMATCHED_LOCALE`). `DEFAULT_LOCALE`(한국어)은 원문·canonical·`x-default` 의 기준이지 "모르면 한국어"라는 뜻이 아니다.

### 문구는 사전에, 데이터 어휘는 `i18n.ts` 에

- **화면에 보이는 글자를 컴포넌트에 박지 않는다.** `src/dictionaries/{ko,en}.json` 에 넣고 키로 부른다. 사전 모양은 한국어가 정한다(`Dictionary = typeof ko`) — `en.json` 에 키가 빠지면 컴파일 에러가 난다.
- **데이터에서 나온 말은 사전이 아니라 `i18n.ts` 의 표다**: 가명 로마자 21개, 특집 이름 13개, 프로그램 이름. 고치는 때가 달라서 갈라 뒀다 — 문구는 화면을 보며 고치고, 어휘는 데이터를 채우며 는다.
- 숫자가 낀 문장은 `{ }` 자리표시자 + `fill()` 이다. 문장을 조각내 이어 붙이면 어순이 다른 언어에서 반드시 어색해진다.
- 날짜·현황은 `formatAirDate`·`formatChecked`·`formatCoverage` 가 언어를 받아 만든다(영어는 `Intl`). 컴포넌트에서 다시 자르거나 붙이지 말 것.

### 언어를 어떻게 얻나

- **서버 컴포넌트는 `currentLocale()` / `currentDictionary()` 로 스스로 가져온다**(`next/root-params`). `[lang]` 이 루트 세그먼트라 페이지가 컴포넌트마다 언어를 내려보내지 않아도 된다.
- **클라이언트 컴포넌트는 그걸 못 쓴다**(Next 의 제약). `SeasonSearch`·`ModeToggle`·`LocaleToggle` 은 쓰는 문구만 props 로 받는다 — `i18n.ts` 를 import 하면 사전 두 벌이 클라이언트 번들에 딸려 온다. `import type` 은 컴파일에서 지워지므로 예외다.
- **내부 링크는 `lib/links.ts` 의 함수로만 만든다.** 전부 첫 인자가 locale 이다. 손으로 `/seasons/...` 를 적으면 언어가 빠진 주소가 나오는데, 그건 눌러 보기 전까지 화면에 안 보인다.
- **언어 전환만 하드 내비게이션이다.** `LocaleToggle` 이 `next/link` 가 아니라 맨 `<a>` 를 쓰는 이유이고, 되돌리면 버그가 돌아온다 — 언어가 바뀌면 루트 레이아웃이 다시 그려지는데, 클라이언트 내비게이션으로 그러면 React 가 `<html>` 의 class 를 서버가 준 값으로 덮어쓴다. 거기엔 테마 클래스가 없어서(next-themes 가 런타임에 붙인다) 다크 모드가 한 프레임 벗겨지고 화면이 하얗게 번쩍인다. 콘솔에도 "Encountered a script tag while rendering React component" 가 같이 뜬다.
- 검색 인덱스는 서버가 그 언어로 **미리 만들어** 내려보낸다. 영어 인덱스에는 한글 원문이 `keywords` 로 함께 실린다 — 화면은 `Yeongsu` 지만 `영수` 로도 걸리게 하려는 것이다(화면에 안 나오는 검색 전용 필드).

### 언어를 하나 더할 때

세 곳이다: `locales.ts` 의 `LOCALES`, `src/dictionaries/<code>.json` 한 벌, `i18n.ts` 의 어휘 표(가명·특집)와 `OG_LOCALES`. 화면·sitemap·hreflang·정적 생성은 그 목록을 따라가므로 따로 손댈 게 없다.

### 번역이 화면과 안 맞는 자리

- **가명 배지(사진 없는 자리)는 언어를 안 따라간다.** 로마자로 바꾸면 40px 원에 안 들어가고, 앞 두 글자만 자르면 영수·영호·영식·영철이 전부 `Ye` 가 되어 배지가 있는 이유(빈 자리에 변화를 주는 것)가 통째로 사라진다. 그래서 겹친 원의 배지는 한글이고, 이름은 기수 상세 카드가 그 언어로 온전히 말한다.
- **정책 두 페이지(`/takedown`·`/privacy`)의 영어는 번역본이다.** 맨 아래 `translationNote` 로 "다르면 한국어 원문이 기준" 이라고 밝힌다 — 지키지 못할 약속이 언어별로 갈리는 게 제일 위험하다. 한국어 사전에서는 이 키가 빈 문자열이라 화면에서 통째로 빠진다.

## 검색 노출 — 판단은 `lib/seo.ts` 한 곳

배관(canonical·hreflang·sitemap·robots·OG 이미지)은 처음부터 있었고, 남은 구멍은 2026-08-21 에 메웠다. 새 화면을 붙일 때 걸리는 건 아래 넷이다.

- **`openGraph` 를 정의하는 페이지는 `openGraphBase(locale)` 를 펼치는 것으로 시작한다.** Next 의 metadata 는 얕게 병합돼서, 페이지가 `openGraph` 를 정의하는 순간 레이아웃의 `openGraph` 가 **통째로** 덮인다 — `og:site_name`·`og:locale`·`og:locale:alternate` 가 조용히 빠진다. 화면에선 안 보이고 공유 카드에서만 드러나서 늦게 발견된다(기수·정책 세 페이지가 실제로 그 상태였다).
- **색인 여부는 `isIndexable(season)` 하나로 정하고, 두 곳에 함께 건다.** 명단이 빈 기수는 화면에 "명단 정리 중" 한 문장뿐이라 크롤러가 soft 404 로 읽고, 그 판정은 그 페이지로 끝나지 않고 사이트 전체 평가로 번진다. 그래서 `robots: noindex, follow`(기수 상세의 `generateMetadata`)와 sitemap 제외를 **같이** 한다 — 하나만 하면 어느 쪽으로든 어긋난다. noindex 페이지를 sitemap 으로 제출하면 Search Console 이 오류로 잡고, sitemap 에서만 빼면 홈의 링크를 타고 그대로 색인된다. 명단이 들어오면 저절로 돌아온다.
- **JSON-LD 는 화면에 이미 있는 것만 옮긴다.** 홈은 `WebSite`(검색 결과에 도메인 대신 사이트 이름을 쓸지 Google 이 여기를 본다), 기수 상세와 정책 두 페이지는 `BreadcrumbList`, 기수 상세는 거기에 `ItemList` 가 더 붙는다. **`ItemList` 에는 `found` 인 사람만 넣는다** — 못 찾은 사람은 이을 `sameAs` 가 없어서 "사람이 있다"는 주장만 남고, 그건 화면에 없는 말을 마크업으로 더하는 것이다. 삭제 요청으로 계정을 내리면 마크업도 함께 사라진다(데이터에서 나오므로 따로 손댈 게 없다).
- **기수 상세 머리글의 프로그램 이름을 빼지 말 것.** 제목은 `나는 솔로 33기 출연진 인스타` 인데 본문에는 `33기` 와 가명뿐이라 프로그램 이름이 한 글자도 없던 적이 있다 — 주 검색어를 본문이 뒷받침하지 못하는 상태였다. 홈 머리글과 같은 구조(프로그램 이름 한 줄 + 큰 제목)다.

**검색엔진 등록(Google Search Console·네이버 서치어드바이저·Bing Webmaster Tools)은 커스텀 도메인을 연결한 뒤에 한다.** 코드가 아니라 운영이고, 검증과 색인이 호스트네임 단위로 쌓여서 순서를 바꾸면 같은 일을 두 번 한다. 근거는 `PLANNING.md` §10. 이 프로젝트는 2026-08-24 에 실제로 밟았다 — 절차는 바로 아래에 있고, 다음에 도메인을 옮길 때도 같은 순서를 따른다.

### 커스텀 도메인을 연결할 때

**코드는 고칠 게 없다.** `lib/site.ts` 가 도메인을 정하는 유일한 곳이고, canonical·hreflang·sitemap·robots·JSON-LD·OG 이미지가 전부 그 값을 따라간다. 할 일은 Vercel 설정과 검색엔진 콘솔 쪽이다.

1. **`NEXT_PUBLIC_SITE_URL` 을 Production 환경변수로 준다**(`https://www.nukko.net`). **"Primary 도메인 지정" 같은 설정은 Vercel 에 없다** — `VERCEL_PROJECT_PRODUCTION_URL` 은 [문서](https://vercel.com/docs/environment-variables/system-environment-variables)대로 **"가장 짧은 커스텀 도메인"을 자동으로** 고른다. apex 와 `www` 를 함께 등록하면 짧은 쪽은 언제나 apex 인데, apex 는 `www` 로 308 하는 리다이렉트 전용이라 그대로 두면 canonical·sitemap 이 **열면 딴 데로 튕기는 주소**를 가리킨다. 그래서 이 프로젝트는 자동값에 기대지 않고 못박는다 — `NEXT_PUBLIC_SITE_URL` 은 원래 "Vercel 밖에 배포할 때"용이었지만, 이 구성에서는 Vercel 위에서도 필요하다.
2. **배포 후 `curl https://<새도메인>/sitemap.xml` 로 `<loc>` 을 확인한다.** 여기가 옛 도메인으로 나오면 프로젝트 설정에서 시스템 환경변수 접근이 꺼진 것이다(`lib/site.ts` 주석). 이건 에러 없이 조용히 틀리는 종류라 눈으로 봐야 안다.
3. **그 다음이 검색엔진 등록이다.** 세 곳 다 등록 → sitemap 제출 순이다. `.vercel.app` 을 GSC 에 이미 등록해 뒀다면 주소 변경 도구를 쓰고, 안 했다면 새 도메인만 새로 등록하면 된다. 네이버는 주소 변경 도구가 없어서 어느 쪽이든 새로 등록이다.
4. **소유 확인 코드가 필요하면 `metadata.verification` 이다**(루트 레이아웃). 구글은 도메인 속성 + DNS TXT 라 코드에 안 남지만, 네이버는 DNS 방식이 없어서 붙어 있다 — 값은 `lib/site.ts` 의 `NAVER_SITE_VERIFICATION`. **Bing 은 "Import from Google Search Console"** 을 쓰면 구글 쪽 확인을 그대로 물려받아서 코드도 새 값도 필요 없다 — 그게 안 될 때만 네이버처럼 메타 태그 방식으로 간다. 세 곳 다 HTML 파일 업로드 방식도 받는데, 그건 `public/` 에 그대로 넣으면 된다.

배포 후 확인은 `validator.schema.org`(타입을 안 가린다)와 `search.google.com/test/rich-results`(탐색경로만 잡힌다 — `WebSite`·`ItemList` 가 여기서 안 보이는 건 정상이다) 두 곳이다.

## 코드 규칙

원론이 아니라 이 코드베이스에 걸리는 형태로만 적는다. 새 코드는 아래를 만족해야 한다.

### 컴포넌트는 shadcn/ui 에 있는지 먼저 본다

- **손으로 짜기 전에 레지스트리를 먼저 확인한다.** 있으면 그걸 쓴다. 받는 건 로컬 CLI 로 — `pnpm exec shadcn add <name>`. `dlx shadcn@latest` 는 설치된 버전(4.18.0)·스타일(`base-nova`)과 어긋날 수 있으니 쓰지 않는다.
- **접근성이 걸린 것은 특히 직접 만들지 않는다.** dialog, dropdown, popover, tooltip, tabs, sheet, command, form, input. 포커스 트랩·키보드 이동·ARIA 를 손으로 다시 짜면 반드시 빠뜨린다. 제보 폼은 `form` + `input` 부터 본다.
- 아이콘도 같다. `lucide-react` 가 이미 깔려 있다(`components.json` 의 `iconLibrary: lucide`). 새 아이콘은 lucide 에서 가져오고, `components/icons.tsx` 에는 **lucide 에 없는 것만** 둔다(인스타그램 같은 브랜드 마크).
- 받은 뒤에는 **시안 D 에 맞춰 고쳐 쓴다.** 들어온 순간 우리 코드라 수정해도 된다 — 다만 기본 스타일이 디자인 규칙(흑백, 유채색은 `searching` 전용, 반경 12~16px)을 이기게 두지 않는다.
- **`components/ui/` 는 shadcn 자리, `components/` 바로 아래는 우리 자리.** 섞지 않아야 나중에 `add` 로 덮어써도 안전하다.
- 직접 만드는 건 레지스트리에 없거나 **도메인이 들어갈 때**다. `CastCard` 는 `found/none/searching` 3상태를 아는 컴포넌트라 우리 것이 맞다.

### 의존 방향은 한 쪽으로만 (결합도)

- `page → components → lib → data(JSON)`. 역방향 import 는 없다. `lib` 은 컴포넌트를 모르고, 컴포넌트는 JSON 을 모른다.
- **출연진 JSON 을 직접 import 하는 파일은 `lib/data.ts` 하나뿐이다.** 제보 기능에서 DB 로 갈아탈 때(로드맵 2단계) 고칠 파일을 하나로 묶어 두는 게 목적이다. 페이지에서 `@/data/*.json` 을 부르고 싶어지면 `data.ts` 에 함수를 하나 더 만든다. (사전 JSON 은 별개다 — `i18n.ts` 가 읽는다. 옮길 대상이 아니라 코드에 가까운 자원이다.)
- 컴포넌트는 **그리는 데 필요한 최소 타입만** props 로 받는다. `SeasonRow` 는 `Season`, `CastCard` 는 `CastMember` 다. 편하다고 `Program` 을 통째로 내려보내면 그 컴포넌트는 프로그램 구조가 바뀔 때마다 같이 깨진다.

### 한 파일에 한 역할 (단일 책임)

- 카드를 그리는 건 `CastCard`, 상태 한 줄은 `CardStatus`, 가명 이니셜 배지는 `CastAvatar`. 역할이 갈리면 **같은 파일 안의 작은 컴포넌트로 먼저 쪼갠다** — 파일이나 폴더부터 만들지 않는다. 두 번째 사용처가 생기면 그때 파일로 뽑는다.
- **포맷팅은 컴포넌트가 하지 않는다.** `formatAirDate`, `formatChecked`, `formatCoverage` 처럼 `lib/i18n.ts` 에 두고 불러 쓴다 — 전부 언어를 받는다. JSX 안에 `.split("-")` 이나 `.slice(2)` 가 보이면 자리를 잘못 잡은 것이다.
- 데이터 정렬·집계도 마찬가지다. 기수 정렬은 `getSeasons`, 현황 집계는 `getCoverage` 가 한다. 페이지에서 `.sort()` 를 다시 부르지 않는다.

### 같이 바뀌는 것을 같이 둔다 (응집성)

- `AccountStatus` 와 `getCoverage` 가 `types.ts` 에 함께 있는 이유: 상태가 하나 늘면 둘 다 손대야 한다. 반대로 함께 바뀌지 않는 것은 같은 파일에 두지 않는다.
- **파생값은 저장하지 않고 계산한다.** 확인 개수를 JSON 에 적어 두지 않고 `getCoverage` 로 세는 게 그 이유다. 두 군데 적힌 숫자는 반드시 어긋난다.

### status 가 분기의 유일한 근원

- `found / none / searching` 분기는 **`member.status` 로만** 한다. `instagramHandle` 이 있는지로 "찾았다"를 유추하지 말 것 — 애써 셋으로 나눈 상태가 그렇게 다시 둘로 무너진다.
- 상태를 하나 추가하면 네 곳을 함께 고친다: `types.ts` 의 유니온, `CastCard` 의 `CardStatus`, `getCoverage`, 그리고 사전의 `status` 묶음(언어마다). **유니온만 늘리면 나머지 두 곳에서 컴파일 에러가 난다** — `CardStatus` 는 반환 타입을 못 박은 `switch`, `getCoverage` 는 `Record<AccountStatus, number>` 리터럴이라 그렇다. 새 분기를 추가할 때도 이 장치를 없애지 말 것.

### 추상화는 늦게

- 두 번째 사용처까지는 복붙이 낫다. 반대로 **쓰임이 줄면 플래그를 도로 뺀다** — `CastAvatar` 의 `variant` 는 사진이 돌아오면서 세 크기(카드·히어로 원·목록 원)로 늘 뻔했지만, 크기와 모양을 감싸는 쪽에 맡기고 플래그를 통째로 없앴다. 배지는 글자 크기를 상속만 받는다.
- 쓰이지 않는 옵션·설정·확장 포인트는 만들지 않는다.

### 값은 상수로 뽑는다

- **코드 안에 그냥 박힌 숫자·문자열을 두지 않는다.** 파일 상단에 `SCREAMING_SNAKE_CASE` 상수로 올리고, **왜 그 값인지** 한 줄 주석을 단다. `FACE_COUNT`(더 넣으면 기수 이름이 밀린다), `CARD_SIZES` 가 그 형태다.
- 기준은 "의미가 있는가"지 "몇 번 쓰였는가"가 아니다. 한 번만 쓰여도 그 값이 왜 4인지 설명이 필요하면 상수다. 반대로 `flex gap-3` 같은 Tailwind 클래스 문자열은 그대로 둔다 — 상수로 빼면 오히려 안 읽힌다.
- **두 파일 이상에서 쓰이는 값은 파일 상단이 아니라 `lib` 으로 올린다.** 외부 URL(`https://instagram.com/`)과 내부 라우트(`/{lang}/seasons/{id}`)가 `lib/links.ts` 에 모여 있는 게 그 형태다 — 언어가 붙으면서 경로 규칙이 바뀌었을 때 고칠 곳이 한 파일이었다.
- 화면에 보이는 문구도 같은 자리에서 반복되면 상수로 뺀다. 특히 `"찾는 중"`, `"계정 없음"` 처럼 **상태와 짝이 되는 문구**는 흩어지면 상태를 추가할 때 빠뜨린다.

### 타입은 컴포넌트 파일에 두지 않는다

- **도메인 타입과 공유 타입은 전부 `src/lib/types.ts` 에 있다.** 컴포넌트 파일에서 `CastMember` 같은 타입을 새로 정의하거나 부분 복제(`{ alias: string; status: string }`)하지 않는다 — 데이터 모델이 두 군데로 갈라지는 순간 한쪽만 고치게 된다.
- 컴포넌트 파일이 타입을 쓸 때는 **`import type` 으로 가져다 쓰기만 한다.** 정의는 `types.ts`, 사용은 컴포넌트다.
- 그 컴포넌트만 쓰는 Props 는 파일에 둬도 되지만, **`type Props` 로 이름 붙여 파일 상단 한 곳에** 선언한다. 함수 시그니처 안에 인라인으로 흩뿌리지 않는다(`cast-avatar.tsx` 가 이 형태다).
- **그 Props 를 다른 파일이 참조하는 순간 `types.ts` 로 옮긴다.** 두 번째 사용처가 분리 기준이다.
- 타입만 모아 두는 파일은 `types.ts` 하나로 충분하다. 프로그램이 늘어 이 파일이 커지면 도메인 단위(`types/cast.ts`, `types/season.ts`)로 나누고, 컴포넌트별로 쪼개지 않는다.

### 화면 문구는 존댓말, 코드는 평서체

- **사용자에게 보이는 글은 전부 `합니다`체다.** 본문, 빈 상태, 안내, 버튼, 그리고 `metadata` 의 description(검색 결과·공유 카드에 그대로 나간다)까지 포함이다. `찾는 게 없다` 가 아니라 `찾는 항목이 없습니다`.
- 방문자 입장에서 적는 문장(삭제 요청 페이지의 요청 예시 목록)은 그 사람 말투인 `~해 주세요` / `~있어요` 로 둔다. 사이트가 하는 말과 방문자가 하는 말을 섞지 않는다.
- **반대로 코드 주석·`CLAUDE.md`·`PLANNING.md`·`src/data/README.md` 는 평서체다.** 읽는 사람이 다르다 — 이쪽은 짧고 단정한 쪽이 낫다. 화면 문구를 고칠 때 주석까지 같이 존댓말로 바꾸지 말 것.
- 상태 라벨처럼 문장이 아닌 것(`찾는 중`, `계정 없음`, `명단 정리 중`, `4 / 14 확인`)은 그대로 명사구로 둔다. 억지로 `~습니다` 를 붙이지 않는다.
- **영어도 같은 태도다**: 꾸미지 않은 평서문, 마케팅 어투 금지(`Discover`·`Explore` 류를 쓰지 않는다). 한국어 문구의 단정함을 그대로 옮긴다 — `We only list accounts that were made public…` 처럼.
- **문구는 코드가 아니라 사전에 있다.** 화면 글자를 고칠 때 `.tsx` 를 열고 있으면 자리를 잘못 잡은 것이다(위 "언어" 절).

### 이름은 도메인 용어 그대로

- 기수는 `season`, 방송 가명은 `alias`, 실명은 `name`. `title` 이나 `label` 같은 일반 명사로 바꾸지 않는다 — 가명과 실명이 섞이는 순간 데이터 규칙(공개된 실명만)을 지키기 어려워진다.

## 디자인 — 시안 D "어둠 속 사진"

시안 D 는 사진이 화면을 채우는 넷플릭스·티빙 브라우징 문법이다. 초상권·저작권 우려로 사진을 한 번 걷어냈다가(2026-08-19) **2026-08-20 에 되돌렸다** — 사진 자리는 세 곳 다 살아 있다(히어로만 2026-08-21 에 모양이 바뀌었다). 리스크 자체는 사라지지 않았으니 `PLANNING.md` §9 ① 을 먼저 읽고 무엇을 올릴지 정할 것.

- **사진 자리는 세 곳이다.** 기수 상세의 2열 카드 그리드(`CastCard`), 기수 목록 히어로에 겹쳐 쌓는 원 6개(`SeasonFeature`), 기수 목록 줄에 겹쳐 쌓는 작은 원 4개(`SeasonRow`). 셋 다 `CastPhoto` 를 쓴다.
- **히어로는 사진 스트립이 아니라 겹친 원 줄이다**(2026-08-21). 원래는 128px 짜리 3장 사진 스트립이었는데, 사진이 0장인 동안 그 자리가 가명 배지 상자 셋으로 떨어졌다 — 가명은 21개가 408명에 반복되는 글자라 정보량이 0인데 카드의 절반을 먹었고, 정작 `33기`·`방영 중`·`0 / 12 확인` 이 아래로 눌렸다. 그래서 목록 줄과 같은 겹침 문법으로 낮추고 기수 이름을 카드에서 제일 큰 요소로 올렸다. **값은 히어로와 목록 줄이 같은 그림이 된 것**이라, 카드 배경 · `방영 중` 점 · 큰 기수 이름 셋이 그 구분을 지고 있다 — 셋 중 하나를 빼면 히어로가 목록 줄에 묻힌다.
- **겹친 원의 테두리는 두 곳 다 `border-background` 다.** 히어로는 카드 위에 얹히니 `border-card` 가 맞아 보이지만 틀렸다 — `CastAvatar` 의 `searching` 배지가 `bg-card` 라, 테두리까지 카드 색이면 원 윤곽이 통째로 사라지고 가명 글자만 떠 있는 화면이 된다. 배경색 테두리라야 원끼리도 갈리고 원 자체도 드러난다.
- **사진이 없는 사람은 가명 두 글자 배지(`CastAvatar`)로 대신 채운다.** 사진이 있는 쪽이 한동안 소수라 일괄 실루엣으로 두면 화면 전체가 같은 그림이 된다. 배지는 **저대비 워터마크**다 — 카드 크기에서 또렷하면 색면이 화면을 먹는다. 상태는 카드 아래 상태 줄이 또렷하게 말한다.
- **자리 크기·모양·글자 크기는 감싸는 쪽이 정한다.** `CastPhoto`·`CastAvatar` 는 `h-full w-full` 로 채우기만 하고, `relative` 박스와 `text-[…]` 는 호출부에 있다(`CARD_SIZES`, `FALLBACK_TEXT`, `FACE_SHAPE`).
- 사이트는 **라이트·다크 두 팔레트를 다 가진다**(2026-08-20 부로 "다크 전용" 원칙 폐기). `globals.css` 의 `:root` 가 라이트, `.dark` 가 다크다 — 둘 다 위 시안 D 팔레트를 흑백 축으로 그대로 짝지은 것이라 명도만 뒤집혔지 구조는 같다. `next-themes` 로 전환하고(`ThemeProvider`, `attribute="class"`), 기본값은 여전히 `dark`다 — 원래 시안의 첫인상을 지키려는 것이다. 전환 버튼(`ModeToggle`)은 네 화면 헤더 맨 위, 워드마크 옆에 있다 — `SiteHeader` 가 `Wordmark` 와 `ModeToggle` 을 한 줄로 묶어서 페이지마다 그 줄을 반복하지 않는다.
- **색은 흑백뿐이다.** 유일한 유채색 `--searching`(황토 `#d9a44b`)은 "아직 못 찾음" 상태 전용이다. 강조·CTA·배지 같은 다른 용도로 번지게 하지 말 것.
- 폰트: 한글 `Gothic A1`(`--font-sans`), 라틴·숫자 `Manrope`(`--font-lat`). 핸들·날짜·개수처럼 숫자가 섞인 곳은 `font-lat`.
- 모서리 반경 12~16px, 전환 180~220ms.

**색면 포스터풍으로 가지 말 것.** 굵은 디스플레이 서체 + 강한 색면 + 거대한 숫자 조합은 이 프로젝트에서 반복해서 반려됐다. **사진 없는 자리를 메울 때 특히 걸린다** — 가명 배지를 처음엔 상태색 그대로 칠했더니 히어로 타일 세 장이 황토색 색면 띠가 됐다. 그래서 배지는 저대비고, 그 타일 자체도 결국 겹친 원 줄로 낮췄다. 방향이 애매하면 시안을 더 찍기보다 레퍼런스를 물어보는 게 빠르다.

### 브랜드 — ㄲ 마크 + `누꼬` / `nukko`

워드마크는 [ㄲ 마크] `누꼬`(ko)·[ㄲ 마크] `nukko`(en). 마크는 겹친 두 원(얼굴·계정을 잇는 모양)의 둘레를 따라 ㄱ 을 하나씩 깎아 만든 모노그램(ㄲ)이다 — 누꼬의 ㄲ, nukko 의 kk. `@` 마크(인스타그램을 가리키던 글자)를 2026-08-24 에 통째로 교체했다 — 남들이 다 쓰는 기성 글자·기성 도형(원·물음표·말풍선 등도 검토 후 기각) 대신, 이름 속 글자에서 나온 도형이라야 이 브랜드만 가질 수 있다는 결론이었다.

- **마크는 도형(SVG)이지 글자가 아니다.** 좌표는 `lib/brand.ts` 의 `BRAND_MARK_VIEWBOX`·`BRAND_MARK_PATHS` — 두 개의 `<path>`(각각 수평 획 + 라운드 코너 + 수직 획)가 `stroke-linecap: round` 로 그려진다. 이 획 끝 처리가 사이트의 반경 규칙(12–16px)과 같은 태도라 각진 ㄱ 대신 이 모양을 골랐다.
- **마크는 언어를 타지 않고, 이름만 탄다.** `[lang]` 바깥인 파비콘·앱 아이콘이 애초에 언어를 못 받으므로, 두 언어가 같은 도형을 공유하는 것 말고 다른 수가 없다. 이름(`BRAND_WORDMARK`)만 로케일별로 갈아 끼운다.
- **한글 워드마크를 반려했던 규칙이 뒤집혔다.** `whosthat` 시절엔 "브랜드를 번역하지 않는다"는 이유로 한글을 뺐는데, `누꼬` 는 `nukko` 의 번역이 아니라 **원문**이다(경상도 사투리). 그 규칙을 그대로 적용하면 한국어 화면이 원문 대신 로마자 표기를 쓰는 꼴이 된다. 이름이 사투리인 동안만 성립하는 예외지 "브랜드도 번역한다"로 넓히지 말 것.
- **서체는 이름만 갈아 끼운다**(`BRAND_WORDMARK_FONT`). 마크가 도형이 된 뒤로는 이 표가 서체 문제에서 완전히 자유롭다 — 예전엔 `@` 를 어느 서체로 그릴지가 걸렸지만(Gothic A1 의 `@` 는 안쪽 `a` 배가 작고 둥글어 이름과 서체가 갈리면 마크가 다른 글자로 읽혔다), 이제 마크는 서체 자체가 없다. 한글 쪽 값이 빈 문자열이 아니라 `font-sans` 인 건 이 값이 `font-lat` 을 이미 걸어 둔 상자(푸터 카피라이트 줄) 안에도 들어가기 때문이다.
- **워드마크의 마크·이름 정렬은 `items-center` 다.** 마크가 텍스트가 아니라 도형이라 베이스라인 개념이 없다 — `items-baseline` 을 쓰면 오히려 광학 중심이 어긋난다. (`@` 시절엔 두 서체의 라인 메트릭 차이로 세로 위치가 어긋나는 버그가 있었다 — 도형으로 바꾸면서 그 버그의 원인 자체가 사라졌다.)
- **언어를 못 받는 자리는 라틴 표기로 고정한다.** OG 이미지의 `alt` 는 정적 export 라 locale 을 못 받으므로 `BRAND_WORDMARK.en`(도메인과 같은 표기)만 쓴다 — 마크는 도형이라 글로 옮길 말이 없다. 반대로 `websiteSchema` 의 `alternateName` 은 locale 을 받으므로 화면 워드마크와 같은 언어로 준다 — 검색 결과에 뜬 이름과 눌러서 도착한 화면이 어긋나면 안 된다.
- `BrandMark` 컴포넌트(`components/icons.tsx`)가 좌표를 그린다. `className`(Tailwind)과 `style`(인라인) 둘 다 받는 이유는 렌더 경로가 둘로 갈리기 때문이다 — 화면 컴포넌트(`Wordmark`·`SiteFooter`)는 `className` 만 쓰고, `icon.tsx`·`apple-icon.tsx` 는 satori(ImageResponse) 위에서 렌더되는데 satori 가 Tailwind 클래스를 못 읽어서 `style` 로 크기·색을 준다.
- **파비콘·앱 아이콘은 폰트가 필요 없다.** 마크가 벡터라 `loadLatinFont` 호출도, `fonts` 배열도 없다 — `@` 글리프 시절엔 Manrope 서브셋을 매번 받아야 했다. 폭은 타일 대비 비율(`MARK_WIDTH_RATIO`)로 정하고 높이는 `BRAND_MARK_ASPECT`(88:64)로 뺀다. 앱 아이콘 쪽 비율이 더 작은 건 iOS 마스크가 모서리를 먹어서 여백을 더 줘야 하기 때문이다.
- `Wordmark` 는 홈·기수 상세·정책 페이지(처리방침·삭제요청) 헤더에 있다. 정책 페이지는 검색으로 바로 착지하는 진입점이라 워드마크가 특히 중요하다 — 본문의 "이 사이트" 도 첫 문장에서 `BRAND_WORDMARK` 로 못박는다.
- `BackLink` 는 바깥 여백을 갖지 않는다 — 정책 페이지는 제목 위 한 줄, 기수 상세는 제목 옆(`‹ 33기`)에 붙이므로 자리는 쓰는 쪽이 정한다. 제목이 두 줄로 접힐 때 화살표가 첫 줄에 붙게 `-mt-1` 로 광학 정렬한다.

## 데이터 규칙

- 계정 상태는 `found` / `none` / `searching` 3가지다. **`none`("찾아봤는데 없다")은 결과지 실패가 아니다** — 방문자의 헛수고를 막는 게 이 사이트의 핵심 가치라 별개 상태로 둔다. `searching` 으로 방치하지 말 것.
- **계정을 지어내지 않는다.** 확인한 것만 `found` 로 올린다. 비공개 계정·추정 계정·커뮤니티 추측은 넣지 않는다(`PLANNING.md` §9).
- `found` 는 `lastVerified` 와 `source` 를 반드시 함께 채운다. 이 사이트를 믿을 근거가 그 두 줄이다.
- **사진은 `profileImageUrl` 에 `/public` 아래 경로로 넣는다.** 남의 서버 이미지를 직접 걸지 않는다(핫링크 금지, `PLANNING.md` §9 ⑤). 비워 두면 화면에서 가명 배지가 대신 나온다.
- **사진 방침은 "올려 두고 요청이 오면 내린다"(사후 대응)다.** 사전 허락을 다 받는 건 불가능하고 사진을 안 쓰면 시안 D 가 성립하지 않아서 내린 결정이다 — 배경은 `PLANNING.md` §9 ①. 이 방침은 **내리는 쪽이 빠를 때만 성립하므로 절차를 느슨하게 하지 말 것**: 삭제 요청이 오면 계정과 사진을 함께 내린다(`src/data/README.md`), 화면 문구(`/takedown`·`/privacy`)는 사진을 명시한 상태로 유지한다. 처리방침이 사실과 다른 게 사진을 싣는 것보다 위험하다.
- 실명은 공개된 경우에만. 모르면 비우면 가명으로만 나온다.

## 현재 상태

네 화면(기수 목록·기수 상세·삭제 요청·처리방침)이 **한국어·영어 두 벌**로 동작하고 빌드가 통과한다(80 페이지 프리렌더). SEO 배관(sitemap·robots·canonical·hreflang·OG 이미지·JSON-LD)까지 붙어 있고 전부 정적이다 — 서버가 하는 일은 `/` 하나를 언어로 보내는 proxy 뿐이다. Vercel 에 배포돼 있다 — https://www.nukko.net (2026-08-24 에 커스텀 도메인 연결, Cloudflare Registrar 등록·DNS. 프록시는 **DNS only** 로 둔다 — 주황 구름을 켜면 Vercel 검증·SSL 발급이 막히고 Bot Fight Mode 가 크롤러를 자른다). 사진을 한 번 걷어냈다가 2026-08-20 에 시안 D 의 이미지 카드로 되돌렸고, 사진이 없는 자리는 `CastAvatar` 가 채운다 — 위 "디자인" 절 참고. 실제 사진 파일은 아직 한 장도 없다.

브랜드 워드마크·파비콘·앱 아이콘([ㄲ 마크] `누꼬`/[ㄲ 마크] `nukko`)이 붙었다 — 위 "브랜드" 절 참고. 네 화면 헤더가 전부 같은 `‹ 제목` 인라인 구조를 쓴다.

도메인은 `lib/site.ts` 한 곳에서 정해진다. **`NEXT_PUBLIC_SITE_URL`(Production)에 `https://www.nukko.net` 을 박아 뒀다** — Vercel 자동값(`VERCEL_PROJECT_PRODUCTION_URL`)은 "가장 짧은 커스텀 도메인"을 고르는데, 그러면 리다이렉트 전용인 apex(`nukko.net`)가 뽑힌다. 이유는 위 "커스텀 도메인을 연결할 때" 1번에 있다.

**검색엔진 등록도 끝났다**(2026-08-24). Google Search Console(도메인 속성, DNS TXT)·네이버 서치어드바이저(HTML 메타 태그)는 소유확인·sitemap 제출까지 직접 확인했다. **Bing Webmaster Tools** 는 GSC 에서 Import 로 가져왔다 — 코드 변경이 없어서 값을 남길 파일이 없고, sitemap 도 소유확인과 함께 자동으로 넘어왔다(콘솔에서 확인). 절차는 위 "커스텀 도메인을 연결할 때". 남은 건 색인을 기다리는 것뿐이다.

기수 골격은 1~33기 전부 들어가 있고 명단도 전부 채워졌다(408명, 2026-08-21). 계정은 320명이 `found` 고 나머지는 `searching` 이다 — 아직 못 채운 건 방영 중이라 계정이 잠긴 33기와 각 기수에 한둘씩 남은 자리다. 빈 `cast` 는 이제 없다.

**계정을 채울 때는 `src/data/README.md` 의 "계정 검증 방법"을 먼저 읽을 것.** 계정 하나를 잘못 올리면 무관한 사람이 피해를 본다. 집계 사이트·블로그를 그대로 옮기다 실제로 여러 번 걸렸다(가짜 목록, 오타 핸들, 사진작가 계정 등). 반드시 인스타 페이지를 직접 열어 확인한다. 다음 배치 순서는 `PLANNING.md` §10.

삭제·정정 요청 창구(`/takedown`)와 개인정보 처리방침(`/privacy`)이 붙어 있고, 푸터가 레이아웃에 있어 전 화면에서 닿는다. 푸터 맨 아래 카피라이트 연도는 `new Date()` 가 아니라 상수다 — 전 페이지가 SSG 라 그 값은 빌드 시각에 얼어붙는다. **삭제 요청 처리 방법은 `src/data/README.md` 의 "내려 달라는 요청이 오면" 을 따른다** — `searching` 으로 되돌리면 다음 배치에서 다시 올라온다. 계정과 사진을 **함께** 내린다(계정만 내리면 요청을 반만 처리한 것이다). 두 화면(`/takedown`·`/privacy`)도 사진을 명시하고 있으니, 사진 방침을 바꾸면 그 문구부터 같이 고친다.

연락처는 `lib/site.ts` 의 `CONTACT_EMAIL` 한 곳이다. 이 주소는 **실제로 열려 있어야 한다** — 반송되면 사이트가 지키지 못할 약속을 걸어 둔 셈이 된다. 브랜드가 `nukko` 로 바뀐 뒤에도 **아직 `whosthat.archive@gmail.com` 이다.** 새 주소로 옮기려면 **주소를 먼저 만들고** 코드를 고친다 — 순서를 바꾸면 그사이 들어온 삭제 요청이 통째로 사라진다.

검색(`SeasonSearch`)은 **홈의 기수 목록 바로 위 검색창**이다. 헤더 돋보기 + `⌘K` 팔레트(shadcn `command`)로 먼저 만들었다가 반려됐다 — 목록 위 검색창이 맞다. 그래서 `command`·`dialog` 는 다시 걷어냈고 `cmdk` 의존도 지웠다.

- **인덱스는 언어별로 만들어진다.** 영어 인덱스의 가명은 로마자고, 한글 원문은 `keywords` 로 함께 실려 `영수` 질의도 받는다(위 "언어" 절).

- **입력이 비어 있으면 원래의 지난 기수 목록, 뭔가 입력하면 그 자리가 결과로 바뀐다.** 목록을 두 벌 그리지 않으려고 서버가 그린 목록을 `children` 으로 받는다 — `SeasonRow` 를 클라이언트 컴포넌트에서 import 하면 그게 쓰는 `lib/data` 를 타고 원본 JSON 이 번들에 딸려 온다.

- **가명은 식별자가 아니다.** 408명이 쓰는 가명이 21개뿐이라 "영수" 한 단어는 33건이 걸린다(기수마다 하나씩). 그래서 ① 계정을 찾아 둔 사람(`found`)을 맨 위로 올리고 ② 기수 이름을 사람 쪽 검색 대상에 함께 넣어 `22기 영수` 로 좁혀지게 했다. 기수 토큰을 따로 골라내는 특수 처리는 없다 — 그 한 줄이 복합 질의를 통째로 받아낸다.
- 퍼지 매칭을 넣지 말 것. 가명이 한 글자씩만 달라서 오타를 관대하게 보면 "영수"에 "영식"·"영철"이 딸려 온다.
- **인덱스는 `buildSearchIndex`(`data.ts`)가 서버에서 만들어 홈 페이지가 prop 으로 내린다.** 검색이 클라이언트 컴포넌트라 `lib/search.ts` 는 `lib/data.ts` 를 import 하지 않는다 — 한 파일에 섞으면 원본 JSON 112KB 가 클라이언트 번들에 딸려 들어간다. 페이지당 인덱스는 gzip 2KB 다(가명·상태가 반복돼 잘 압축된다).
- 사람 결과는 `/seasons/{id}#{memberId}` 로 착지한다. 앵커는 `CastCard` 가 카드에 거는 DOM id 와 짝이다.

다음: 계정 데이터 채우기 → 제보 폼(`PLANNING.md` 로드맵 2단계). 언어는 영어까지 붙었고 일본어가 다음 후보다 — 절차는 위 "언어를 하나 더할 때".

**DB·백엔드는 아직 필요 없다.** 지금은 정적 JSON + SSG 로 충분하고, 데이터가 늘었다는 건 옮길 이유가 안 된다. 갈아탈 시점을 판단하는 기준은 `PLANNING.md` §7 "DB·백엔드는 언제 필요한가" 에 있다 — 조건이 실제로 걸리면 그때 먼저 말한다.

## Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
