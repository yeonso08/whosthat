@AGENTS.md

# 누꼬 (nukko)

예능 출연진의 인스타그램 계정을 프로그램·기수별로 모아 두는 아카이브. "나는 솔로" 로 시작해 2026-08-31 에 "솔로지옥"(넷플릭스)을 붙였다. 배경과 범위는 `PLANNING.md`에 있다.

## 명령어

```bash
pnpm dev      # 개발 서버 (3000)
pnpm build    # 프로덕션 빌드 — 기수 페이지를 전부 SSG로 뽑는다
pnpm lint
pnpm typecheck   # tsc --noEmit — 빌드보다 빠르게 타입만 본다

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
src/app/[lang]/page.tsx              프로그램 목록(홈) — 검색창 + 프로그램 카드. [lang] 이 루트 세그먼트다(전 화면이 그 아래)
src/app/[lang]/[program]/page.tsx    한 프로그램의 기수 목록 (히어로 + 검색 + 목록)
src/app/[lang]/[program]/seasons/[id]/page.tsx 기수 상세 (언어 × 프로그램 × 기수로 전부 프리렌더)
src/app/[lang]/takedown/page.tsx     삭제·정정 요청 창구
src/app/[lang]/privacy/page.tsx      개인정보 처리방침
src/app/[lang]/layout.tsx            루트 레이아웃 — <html lang>, 언어별 metadata, generateStaticParams
src/app/icon.tsx                     파비콘 — 크기·여백만 정하고 그림은 BrandTile 이 그린다. 언어를 안 탄다
src/app/apple-icon.tsx               iOS 홈 화면 아이콘 — 같은 타일, 180×180
src/app/[lang]/opengraph-image.tsx   공유 카드 — 글자만 고르고 판은 lib/og.tsx 가 그린다 (프로그램·기수 상세도 한 벌씩)
src/app/sitemap.ts / robots.ts       언어마다 한 줄씩 + hreflang (명단 빈 기수·그런 기수뿐인 프로그램은 뺀다)
src/proxy.ts                         `/` 로 들어온 사람을 브라우저 언어로 보낸다 (Next 16 의 미들웨어)
src/lib/locales.ts                   언어 목록 + 언어 이름 — 화면·클라이언트·프록시가 다 읽는 순수 모듈
src/lib/i18n.ts                      사전 로더 + 데이터 어휘(가명·특집) + 프로그램 문구 조회(programStrings) + 날짜/현황 포맷
src/dictionaries/{ko,en,ja}.json     화면 문구
src/lib/brand.ts                     BRAND_MARK_PATHS(ㄲ 좌표) — 언어 불변, 아이콘과 공유 / BRAND_WORDMARK(누꼬·nukko) — 언어별 / BRAND_IMAGE_COLORS — satori 가 CSS 토큰을 못 읽어서 값으로 박은 색
src/lib/links.ts                     내부 경로 — 전부 `언어/프로그램` 으로 시작한다. 값 import 가 없다(클라이언트로 딸려 간다)
src/lib/site.ts                      도메인·연락처·광고 ID — absoluteUrl·contactMailto 도 여기다
src/lib/og.tsx                       공유 카드 한 장 + OG 서체 로더. `.tsx` 인 건 카드 판을 여기서 그리기 때문이다
src/lib/seo.ts                       색인 여부·OG 공통 필드·정책 페이지 metadata·JSON-LD — 검색엔진에 보이는 것을 한 곳에
src/lib/types.ts                     Program → Season → CastMember 모델 + getCoverage·getTotals·getSiteTotals
src/lib/data.ts                      프로그램 JSON 로더(PROGRAMS 배열) + 검색 인덱스 생성
src/lib/search.ts                    검색 매칭 — 데이터를 모른다(클라이언트로 넘어간다)
src/data/i-am-solo.json           실데이터(1~33기, 408명) — 채우는 법은 src/data/README.md
src/data/singles-inferno.json              솔로지옥 시즌 1~5 골격 — 명단이 아직 비어 있다
src/components/                      cast-card, cast-photo, cast-avatar, program-card, season-row, season-feature, season-search, site-footer, site-header, back-link, wordmark, page-heading, policy-page, empty-card, icons, json-ld, theme-provider, mode-toggle, locale-toggle
public/cast/                         출연진 사진 — profileImageUrl 이 가리키는 곳 (아직 비어 있다)
public/ads.txt                       애드센스 판매자 선언 — lib/site.ts 의 ADSENSE_CLIENT_ID 와 pub 번호가 같아야 한다
```

Next.js 16 App Router + Tailwind v4 + shadcn/ui, pnpm. `params` 는 Promise 라 반드시 await 한다.

## 프로그램 — 나는 솔로 · 솔로지옥

프로그램이 둘이 되면서 화면이 세 단계가 됐다: **홈(프로그램 목록) → 프로그램(기수 목록) → 기수 상세**. 그전에는 홈이 곧 나는 솔로의 기수 목록이었다. 프로그램을 하나 더 붙이는 절차는 `src/data/README.md` 의 "프로그램을 추가할 때" 에 있다.

- **주소가 프로그램을 정한다** — `/ko/i-am-solo/seasons/s33`, `/ko/singles-inferno/seasons/s4`. **슬러그는 그 프로그램의 공식 영어 제목이다**(`I Am SOLO` → `i-am-solo`, `Single's Inferno` → `singles-inferno`). 한국어 로마자(`na-neun-solo`)로 시작했다가 바꿨다 — 프로그램마다 규칙이 갈리면 다음 프로그램에서 또 고민하게 되고, 주소는 한 벌뿐이라 언어를 안 타는 표기라야 한다. **기수 `id` 는 프로그램 안에서만 고유하다**(`s1` 이 두 프로그램에 다 있다). 그래서 `getSeason` 도 `seasonPath` 도 첫 인자가 프로그램이다 — 기수 id 만 들고 다니면 어느 프로그램인지 정해지지 않는다.
- **옛 주소는 `next.config.ts` 가 308 한다.** 두 세대가 겹쳐 있다 — 언어가 붙기 전(`/seasons/s33`)과 프로그램이 붙기 전(`/ko/seasons/s33`)이다. **둘 다 한 번에 최종 주소로 보낸다**: 리다이렉트를 두 번 태우면 크롤러가 체인을 싫어하고 링크 신호도 샌다. 언어가 있는 쪽은 그 언어를 지킨다 — `/en/seasons/s33` 을 한국어로 보내면 읽던 언어를 빼앗는 것이 된다.
- **`Season.label` 은 없다. `Season.number` 뿐이다.** 화면에 뜨는 말은 프로그램마다 다르다 — `33기` 와 `시즌 4` 다. 라벨을 데이터에 저장하면 언어 × 프로그램만큼 적어야 하므로, 번호만 두고 사전의 `site.programs.<id>.seasonLabel` 이 만든다(`localizeSeasonLabel`). 정렬도 이 번호를 본다.
- **프로그램마다 다른 말은 사전의 `site.programs` 에 문장째로 있다.** 이름·기수 라벨·목록 제목(`전체 기수` / `전체 시즌`)·`지난 기수`·`최신 기수`·요약 두 줄·검색 안내 두 줄이다. **낱말만 표로 두고 문장에 끼워 넣지 말 것** — 어순이 다른 언어에서 반드시 어색해진다(가명·특집 표와 같은 이유). 꺼내는 곳은 `programStrings(programId, locale)` 하나고, **사전에 없는 프로그램이면 던진다** — 조용히 `singles-inferno` 이 제목으로 나가는 것보다 빌드가 깨지는 쪽이 낫다.
- **`alias` 는 "방송에서 불린 이름" 이다.** 나는 솔로는 가명(`영수`), 솔로지옥은 실명(`최시훈`) 이 들어간다. 필드를 나누지 않은 이유는 화면이 하는 일이 같기 때문이다 — 크게 부르는 이름 하나와, 그 아래 실명·나이·직업 줄이다. 로마자·가타카나 표기는 `i18n.ts` 의 `ALIASES` 한 표에 프로그램 구분 없이 쌓인다(한글 원문이 키다). 실명이 들어가는 프로그램은 `name`(실명) 을 비워 둔다 — 같은 값이 두 줄로 나온다.
- **홈의 검색은 프로그램을 안 가리고, 프로그램 화면의 검색은 자기 것만 본다**(`buildSearchIndex(locale, program?)`). 착지하자마자 사람을 찾는 게 이 사이트의 존재 이유라 홈에서 프로그램을 먼저 고르게 만들지 않는다. 여러 프로그램을 담은 인덱스에만 `programName` 이 실려 결과 줄이 프로그램을 밝힌다 — 한 프로그램뿐인 인덱스에서 매 줄에 같은 이름을 반복할 이유가 없다.
- **결과 그룹 제목은 홈만 중립어다**(`기수·시즌`). 프로그램 화면은 `programStrings` 의 낱말로 갈아 끼운다. 홈은 두 프로그램의 줄이 섞여 나오므로 한쪽 말을 쓰면 다른 쪽 줄에 틀린 제목이 붙는다.
- **명단이 한 줄도 없는 프로그램은 색인에서 뺀다**(`isProgramIndexable`). 기수가 전부 "명단 정리 중" 이면 그 화면도 빈 줄의 목록이라 기수 상세와 같은 soft 404 판정을 받는다 — 새 프로그램을 골격만 먼저 넣는 동안이 정확히 그 상태다. `robots: noindex, follow` 와 sitemap 제외를 **같이** 한다.
- **`0명 중 인스타 0개 확인` 을 만들지 말 것.** 프로그램 요약 한 줄은 `formatProgramSummary` 를 거친다 — 명단이 비면 개수 대신 그 사실을 적는다. `formatCoverage` 가 기수에서 하는 일과 같고, 화면과 공유 카드가 같은 함수를 봐서 어긋나지 않는다.
- **뒤로가기 목적지는 쓰는 쪽이 준다**(`BackLink` 의 `href`·`label`). 세 단계가 되면서 "위" 가 어디인지 컴포넌트가 알 수 없게 됐다 — 기수 상세는 프로그램 목록으로, 프로그램과 정책 페이지는 홈으로 간다.

## 언어 — 한국어·영어·일본어

해외에서 한국 예능 출연진을 찾는 사람을 받으려고 2026-08-21 에 언어를 붙였고, 일본어를 2026-08-25 에 더했다. **URL 이 언어를 정한다** — `/ko/i-am-solo/seasons/s33`, `/en/...`, `/ja/...`. 언어가 없는 주소는 두 갈래로 처리한다: `/` 는 `src/proxy.ts` 가 `Accept-Language` 를 보고 307 로 보내고, 언어를 붙이기 전의 옛 주소(`/seasons/s33`·`/takedown`·`/privacy`)는 `next.config.ts` 가 한국어로 308 한다(프로그램까지 한 번에 끼워서 — 위 "프로그램" 절).

- **언어를 감지하는 순간은 `/` 하나뿐이다.** proxy 의 matcher 가 `/` 라서 나머지 경로는 엣지를 안 거치고 정적으로 나간다. 공유받은 `/ko/...` 링크가 읽는 사람 브라우저 설정 때문에 다른 언어로 튀지도 않는다.
- **언어 선택을 쿠키로 기억하지 않는다.** 처리방침에 "쿠키는 쓰지 않는다"고 적어 뒀다 — 편의 하나 때문에 그 문장을 거짓으로 만들지 말 것. 선택 목록이 주소를 바꾸므로 기억할 것도 없다.
- **헤더의 언어 버튼은 드롭다운이다**(`LocaleToggle`, shadcn `dropdown-menu`). 셋이 되면서 순환 토글을 접었다 — 두 언어일 땐 "누르면 다른 쪽" 이 자명했지만, 셋부터는 다음에 뭐가 나올지 눌러 봐야 알게 된다. 목록의 언어 이름(`LOCALE_NAMES`)은 **그 언어로 적는다** — 한국어를 못 읽는 사람이 "일본어" 라고 적힌 줄을 찾을 수는 없다. 그래서 화면 언어를 안 타고 사전이 아니라 `locales.ts` 에 있다.
- 아는 언어가 하나도 안 걸리면 영어로 보낸다(`UNMATCHED_LOCALE`). `DEFAULT_LOCALE`(한국어)은 원문·canonical·`x-default` 의 기준이지 "모르면 한국어"라는 뜻이 아니다.

### 문구는 사전에, 데이터 어휘는 `i18n.ts` 에

- **화면에 보이는 글자를 컴포넌트에 박지 않는다.** `src/dictionaries/{ko,en,ja}.json` 에 넣고 키로 부른다. 사전 모양은 한국어가 정한다(`Dictionary = typeof ko`) — 다른 사전에 키가 빠지면 컴파일 에러가 난다.
- **데이터에서 나온 말은 사전이 아니라 `i18n.ts` 의 표다**: 가명 21개(`ALIASES`), 특집 이름 13개(`SPECIALS`), 프로그램 이름. 고치는 때가 달라서 갈라 뒀다 — 문구는 화면을 보며 고치고, 어휘는 데이터를 채우며 는다. 두 표 다 언어별로 한 칸씩이고 **한국어 칸은 비어 있다** — 데이터가 원문이라 늘 `?? alias` 로 떨어진다.
- **가명 표기가 사람을 못 가르면 표기를 바꾼다.** 일본어 가타카나는 관행대로면 `정수`·`종수` 가 둘 다 `ジョンス` 로 겹치는데, 1·2·3기는 그 둘이 같은 기수에 있어서 한 화면에 이름이 같은 사람이 둘 생긴다. 사람을 갈라 주는 게 이 사이트라 실제로 둘 다 쓰이는 표기 중에서 `정`→`チョン`·`종`→`ジョン` 으로 못박았다. 언어를 더할 때 표를 채우고 나면 **21개가 서로 다른지 먼저 확인할 것.**
- 숫자가 낀 문장은 `{ }` 자리표시자 + `fill()` 이다. 문장을 조각내 이어 붙이면 어순이 다른 언어에서 반드시 어색해진다.
- 날짜·현황은 `formatAirDate`·`formatChecked`·`formatCoverage` 가 언어를 받아 만든다(한국어만 손으로 짜고 나머지는 `Intl`). 컴포넌트에서 다시 자르거나 붙이지 말 것.

### 언어를 어떻게 얻나

- **서버 컴포넌트는 `currentLocale()` / `currentDictionary()` 로 스스로 가져온다**(`next/root-params`). `[lang]` 이 루트 세그먼트라 페이지가 컴포넌트마다 언어를 내려보내지 않아도 된다.
- **클라이언트 컴포넌트는 그걸 못 쓴다**(Next 의 제약). `SeasonSearch`·`ModeToggle`·`LocaleToggle` 은 쓰는 문구만 props 로 받는다 — `i18n.ts` 를 import 하면 사전 세 벌이 클라이언트 번들에 딸려 온다. `import type` 은 컴파일에서 지워지므로 예외다. (`LocaleToggle` 이 `locales.ts` 를 값으로 import 하는 건 괜찮다 — 그 파일이 사전을 안 읽는 이유가 이거다.)
- **내부 링크는 `lib/links.ts` 의 함수로만 만든다.** 전부 첫 인자가 locale 이고, 기수로 가는 것은 그다음이 프로그램이다. 손으로 `/seasons/...` 를 적으면 언어도 프로그램도 빠진 주소가 나오는데, 그건 눌러 보기 전까지 화면에 안 보인다.
- **언어 전환만 하드 내비게이션이다.** `LocaleToggle` 의 줄이 `next/link` 가 아니라 맨 링크인 이유이고, 되돌리면 버그가 돌아온다 — 언어가 바뀌면 루트 레이아웃이 다시 그려지는데, 클라이언트 내비게이션으로 그러면 React 가 `<html>` 의 class 를 서버가 준 값으로 덮어쓴다. 거기엔 테마 클래스가 없어서(next-themes 가 런타임에 붙인다) 다크 모드가 한 프레임 벗겨지고 화면이 하얗게 번쩍인다. 콘솔에도 "Encountered a script tag while rendering React component" 가 같이 뜬다.
- **그 줄은 `DropdownMenuItem` + `render={<a>}` 가 아니라 `DropdownMenuLinkItem` 이다.** 전자는 클릭이 삼켜져 아무 데도 안 간다 — 메뉴만 닫히고 주소가 그대로라 눈으로는 "안 눌렸나" 로 보인다. Base UI 가 링크용으로 따로 둔 부품(`Menu.LinkItem`)이 있고, shadcn 이 그 껍데기를 안 만들어 줘서 `components/ui/dropdown-menu.tsx` 에 직접 넣어 뒀다.
- 검색 인덱스는 서버가 그 언어로 **미리 만들어** 내려보낸다. 한국어가 아닌 인덱스에는 한글 원문이 `keywords` 로 함께 실린다 — 화면은 `Yeongsu`·`ヨンス` 지만 `영수` 로도 걸리게 하려는 것이다(화면에 안 나오는 검색 전용 필드).

### 언어를 하나 더할 때

네 곳이다: `locales.ts` 의 `LOCALES`·`LOCALE_NAMES`, `src/dictionaries/<code>.json` 한 벌, `i18n.ts` 의 어휘 표(`ALIASES`·`SPECIALS`)와 `OG_LOCALES`, 그리고 **서체 두 자리**. 화면·sitemap·hreflang·정적 생성은 그 목록을 따라가므로 따로 손댈 게 없다 — `Record<Locale, …>` 로 못박은 표들이 빠진 칸마다 컴파일 에러를 낸다.

**서체가 네 번째 자리다.** 글자 집합이 안 겹치면 폰트를 한 벌로 못 쓴다 — Gothic A1 에는 가나·한자가, Zen Kaku Gothic New 에는 한글이 없다. 그래서 화면은 `layout.tsx` 의 `SANS_FONT` 가, OG 이미지는 `lib/og.tsx` 의 `OG_FONTS` 가 언어마다 하나씩 고른다. 화면 쪽은 그 언어일 때만 클래스를 걸어서 다른 언어가 안 받고, OG 쪽은 그 이미지에 그리는 글자만 `text=` 서브셋으로 받는다. **화면과 OG 는 같은 서체라야 한다** — 공유 카드와 눌러서 도착한 화면이 다른 글꼴이면 같은 사이트로 안 읽힌다.

### 번역이 화면과 안 맞는 자리

- **가명 배지(사진 없는 자리)는 언어를 안 따라간다.** 로마자로 바꾸면 40px 원에 안 들어가고, 앞 두 글자만 자르면 영수·영호·영식·영철이 전부 `Ye` 가 되어 배지가 있는 이유(빈 자리에 변화를 주는 것)가 통째로 사라진다. 가타카나도 `ヨンチョル` 처럼 길어져 마찬가지다. 그래서 겹친 원의 배지는 한글이고, 이름은 기수 상세 카드가 그 언어로 온전히 말한다.
- **워드마크는 한국어만 원문이다.** `누꼬`(ko)·`nukko`(en·ja) — 일본어를 `ヌッコ` 로 옮기면 그건 원문이 아니라 음역이고, "브랜드를 번역하지 않는다" 는 규칙을 언어마다 하나씩 깨는 셈이 된다. 가명을 가타카나로 적는 것과 다른 문제다: 가명은 일본어 문장 안에서 읽히는 데이터고, 워드마크는 도메인(`nukko.net`)과 짝인 고유명이다.
- **정책 두 페이지(`/takedown`·`/privacy`)의 번역본은 원문이 아니다.** 맨 아래 `translationNote` 로 "다르면 한국어 원문이 기준" 이라고 밝힌다 — 지키지 못할 약속이 언어별로 갈리는 게 제일 위험하다. 한국어 사전에서는 이 키가 빈 문자열이라 화면에서 통째로 빠진다.

## 검색 노출 — 판단은 `lib/seo.ts` 한 곳

배관(canonical·hreflang·sitemap·robots·OG 이미지)은 처음부터 있었고, 남은 구멍은 2026-08-21 에 메웠다. 새 화면을 붙일 때 걸리는 건 아래 넷이다.

- **공유 카드는 `lib/og.tsx` 의 `ogImageResponse()` 한 판이다.** 라우트는 글자 넷(언어·활자 크기·작은 줄·큰 줄·현황)만 고르고 판·색·폰트 서브셋은 안 만진다. 두 라우트가 각자 그리던 시절엔 90줄 중 85줄이 같았는데, 어긋나도 링크를 실제로 공유해 보기 전까지 안 보인다. 활자 크기가 두 벌인 건 큰 줄에 뭐가 오느냐가 달라서다 — 홈은 문장, 기수는 `33기` 한 덩어리다.
- **`openGraph` 를 정의하는 페이지는 `openGraphBase(locale)` 를 펼치는 것으로 시작한다.** Next 의 metadata 는 얕게 병합돼서, 페이지가 `openGraph` 를 정의하는 순간 레이아웃의 `openGraph` 가 **통째로** 덮인다 — `og:site_name`·`og:locale`·`og:locale:alternate` 가 조용히 빠진다. 화면에선 안 보이고 공유 카드에서만 드러나서 늦게 발견된다(기수·정책 세 페이지가 실제로 그 상태였다).
- **색인 여부는 `isIndexable(season)`·`isProgramIndexable(program)` 로 정하고, 두 곳에 함께 건다.** 명단이 빈 기수는 화면에 "명단 정리 중" 한 문장뿐이라 크롤러가 soft 404 로 읽고, 그 판정은 그 페이지로 끝나지 않고 사이트 전체 평가로 번진다. 그래서 `robots: noindex, follow`(기수 상세의 `generateMetadata`)와 sitemap 제외를 **같이** 한다 — 하나만 하면 어느 쪽으로든 어긋난다. noindex 페이지를 sitemap 으로 제출하면 Search Console 이 오류로 잡고, sitemap 에서만 빼면 홈의 링크를 타고 그대로 색인된다. 명단이 들어오면 저절로 돌아온다.
- **JSON-LD 는 화면에 이미 있는 것만 옮긴다.** 홈은 `WebSite`(검색 결과에 도메인 대신 사이트 이름을 쓸지 Google 이 여기를 본다), 나머지는 `BreadcrumbList`, 기수 상세는 거기에 `ItemList` 가 더 붙는다. **탐색경로는 화면마다 길이가 다르다** — 정책 두 페이지는 `홈 › 이 페이지` 두 칸, 기수 상세는 `홈 › 나는 솔로 › 33기` 세 칸이다. `breadcrumbSchema(locale, ...trail)` 이 홈 칸을 알아서 앞에 놓으므로 쓰는 쪽은 그 뒤만 적는다. **`ItemList` 에는 `found` 인 사람만 넣는다** — 못 찾은 사람은 이을 `sameAs` 가 없어서 "사람이 있다"는 주장만 남고, 그건 화면에 없는 말을 마크업으로 더하는 것이다. 삭제 요청으로 계정을 내리면 마크업도 함께 사라진다(데이터에서 나오므로 따로 손댈 게 없다).
- **언어 없는 경로를 리터럴로 적지 말 것.** canonical·hreflang·sitemap 이 같은 문자열을 봐야 한다 — `links.ts` 의 `programPath()`·`seasonPath()`·`TAKEDOWN_PATH`·`PRIVACY_PATH` 가 그 한 벌이고, 언어를 앞에 붙이는 것도 `localePath()` 하나다. 예전엔 `languageAlternates("/takedown")` 과 sitemap 의 `["/takedown", "/privacy"]` 가 각자 적혀 있었다 — 경로를 바꾸면 화면 링크만 따라오고 canonical 은 옛 주소를 가리키는데, 그건 화면에서 끝내 안 보인다.
- **정책 두 페이지의 metadata 는 `policyMetadata(locale, page)` 다.** 둘은 제목·설명만 다르고 나머지가 같아서, 각자 적어 두면 한쪽만 고치게 된다. 새 정책 페이지를 붙이면 `seo.ts` 의 `POLICY_PATHS` 에 한 줄 더한다.
- **기수 상세 머리글의 프로그램 이름을 빼지 말 것.** 제목은 `나는 솔로 33기 출연진 인스타` 인데 본문에는 `33기` 와 가명뿐이라 프로그램 이름이 한 글자도 없던 적이 있다 — 주 검색어를 본문이 뒷받침하지 못하는 상태였다. 프로그램 화면과 같은 구조(프로그램 이름 한 줄 + 큰 제목)다.
- **`site.name` 은 프로그램 이름이 아니다.** 프로그램이 하나였을 땐 `나는 솔로 출연진 인스타` 였는데, 그건 title.template·`og:site_name`·`WebSite` 이름·탐색경로 첫 칸에 다 쓰이는 값이라 프로그램이 둘이 되는 순간 사이트가 자기 이름으로 거짓말을 하게 됐다. 지금은 `누꼬 — 예능 출연진 인스타` 다. 프로그램 이름은 프로그램·기수 화면의 제목이 진다(둘 다 `title: { absolute }` 라 사이트 이름이 뒤에 또 붙지 않는다).

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
- **`components/ui/` 는 shadcn 자리, `components/` 바로 아래는 우리 자리.** 섞지 않아야 나중에 `add` 로 덮어써도 안전하다. 다만 **레지스트리가 빠뜨린 부품은 그 파일에 채워 넣는다** — `dropdown-menu.tsx` 의 `DropdownMenuLinkItem` 이 그렇다(Base UI 의 `Menu.LinkItem` 껍데기). 도메인이 아니라 그 부품의 형제라서 여기가 맞고, `add` 로 덮어쓸 때 같이 날아가니 그때 다시 넣어야 한다.
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
- **다만 그 클래스 뭉치가 화면에서 이름을 가진 자리면 컴포넌트로 뽑는다.** `PageTitle`·`PageEyebrow`·`GroupHeading`(`components/page-heading.tsx`), `EmptyCard`, 정책 문서의 `POLICY_HEADING`·`POLICY_BODY`·`POLICY_LINK` 가 그 형태다 — 넷 화면이 같은 크기의 제목을 쓴다는 게 우연이 아니라 규칙이라, 손으로 네 번 적으면 한 곳만 어긋난다. **자리(바깥 여백)는 여전히 쓰는 쪽이 정한다** — `BackLink` 와 같은 태도다.
- **여백·포커스 링처럼 여러 화면이 공유하는 값은 `globals.css` 의 `@utility` 다** — `gutter`·`gutter-inset`(화면 좌우 여백, 위 "화면 폭" 절)과 `focus-ring` 이 그것이다.
- **포커스 링은 `focus-ring` 유틸리티다**(`globals.css` 의 `@utility`). 네 자리가 같은 `focus-visible:outline-*` 세 줄을 각자 적고 있었다. 키보드로만 보이는 것이라 한 자리에서 빠져도 눈으로는 안 걸린다 — 새로 누를 수 있는 것을 만들면 이 클래스를 건다.
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

## 화면 폭 — 모바일과 데스크톱

2026-08-31 까지 `body` 가 `max-w-screen-sm`(640px) 고정이었다. 큰 화면에서는 가운데 좁은 기둥 하나였고, 프로그램이 늘면서 그게 통째로 안 맞게 됐다 — 휴대폰 화면을 늘려 놓은 꼴이다. 지금은 `max-w-[1280px]` 이고, 좁은 화면에서는 그 값이 안 걸리므로 **모바일 화면은 그대로다.**

- **여백은 `gutter` / `gutter-inset` 두 유틸리티가 정한다**(`globals.css`). 열 곳에 `px-5` 로 흩어져 있던 것을 모았다 — 한 곳에서 정해야 헤더·격자·목록·푸터가 같은 세로선에 선다. **둘은 늘 짝으로 움직인다**: `gutter-inset` 은 줄 목록(`Item`)용이고, 그 컴포넌트가 자체로 12px 을 갖고 있어 그만큼 뺀 값이다. 한쪽만 키우면 목록만 어긋나는데 그건 나란히 놓고 봐야 보인다.
- **격자는 2 → 3 → 4 → 5 열로 늘어난다**(홈 포스터·기수 상세 출연진 둘 다). **`next/image` 의 `sizes` 가 같은 중단점을 밟아야 한다** — 안 맞추면 화면은 멀쩡한데 필요 이상으로 큰 파일이 내려간다. 눈으로는 안 보이는 종류라 열 수를 고칠 때 `POSTER_SIZES`·`CARD_SIZES` 를 같이 연다.
- **산문은 컨테이너를 다 쓰지 않는다.** 정책 두 페이지는 `max-w-[68ch]` 다 — 1280px 짜리 한 줄은 눈이 다음 줄 첫 글자를 못 찾는다. 검색창도 `lg:max-w-2xl` 로 묶는다(컨테이너를 다 쓰면 글자 하나 없는 띠가 된다).
- **기수 줄은 넓어지면 현황이 오른쪽으로 간다**(`SeasonRow`, `lg` 부터). 제목 옆에 다 붙여 두면 1280px 에서 오른쪽 절반이 통째로 빈다. 좁은 화면에서는 지금처럼 설명 줄에 붙는다 — 같은 값을 두 자리에 두고 중단점으로 하나만 보인다.
- **`max-w-screen-sm` 을 되살리지 말 것.** 화면을 좁히고 싶으면 그 자리에서(산문·검색창처럼) 묶는다. 컨테이너를 다시 640 으로 되돌리면 격자가 갈 곳이 없어진다.

## 디자인 — 시안 D "어둠 속 사진"

시안 D 는 사진이 화면을 채우는 넷플릭스·티빙 브라우징 문법이다. 초상권·저작권 우려로 사진을 한 번 걷어냈다가(2026-08-19) **2026-08-20 에 되돌렸다** — 사진 자리는 세 곳 다 살아 있다(히어로만 2026-08-21 에 모양이 바뀌었다). 리스크 자체는 사라지지 않았으니 `PLANNING.md` §9 ① 을 먼저 읽고 무엇을 올릴지 정할 것.

- **홈의 프로그램은 포스터 한 장과 그 아래 현황 한 줄이다**(`ProgramCard`). 넷플릭스·티빙의 문법 그대로다 — **판 안에는 그림과 모서리 배지만 두고 부가 정보는 판 밖으로 내린다.** 판 안에 캡션·아바타·통계를 채워 넣으면 포스터가 아니라 정보 상자가 되는데, 여기까지 세 번 뒤집으며 배운 것이다(2026-08-31): ① 목록 줄 — `SeasonRow` 와 같은 그림이라 기수보다 위인 것이 더 가벼워 보였다 ② 전면 카드 — 프로그램이 스무 개가 되면 홈이 스무 번 스크롤하는 화면이 된다 ③ 아바타를 넣은 타일 — 판 안이 UI 로 차서 투박했다.
- **판에는 프로그램 포스터를 건다**(`Program.posterUrl`, `public/programs/`). 저작권자는 제작사·방송사고, 방침은 출연자 사진과 같은 **사후 대응**이다 — 2026-08-31 에 그렇게 정했다. **출연자 사진 규칙은 안 바뀌었다**(본인 프로필 사진만, 방송 캡처 금지) — 그쪽은 저작권 위에 일반인의 초상권이 겹쳐서 판단의 성격이 다르다.
- **포스터가 없으면 이름이 판의 그림이 된다.** 한국 예능 포스터는 제목 글자가 그림의 몫을 하므로, 빈 판을 회색으로 두는 것보다 이름을 크게 앉히는 쪽이 같은 격자 안에서 덜 튄다. `CastPhoto`→`CastAvatar` 와 같은 태도다.
- **이름은 판 안에 한 번만 나온다.** 포스터가 걸리면 그 그림이 이미 제목을 갖고 있어서 위에 이름을 또 얹지 않고(`sr-only` 로만 남긴다), 없으면 이름이 그림이 된다. 어느 쪽이든 판 아래는 현황 한 줄이라 **포스터가 섞여 있어도 격자 줄이 안 어긋난다.**
- **판 위쪽 두 모서리(플랫폼·방영 중 점)는 그림 위에도 얹힌다.** 포스터가 걸릴 때만 위쪽에 어두운 그러데이션을 한 겹 깔아 글자가 안 묻히게 한다 — 없을 때 깔면 눌릴 것이 없는데 판만 탁해진다.
- **포스터 제목의 줄바꿈 규칙은 두 겹이다**(`break-keep` + `overflow-wrap: anywhere`). 앞은 한글이 기본값대로 음절 아무 데서나 꺾여 `솔로지/옥` 이 되는 걸 막고, 뒤는 **띄어쓰기가 없는 일본어 이름이 판을 넘치는 것**을 막는다(`脱出おひとり島`). 한쪽만 걸면 한 언어에서 반드시 깨지고, 그건 그 언어 화면을 열기 전까지 안 보인다.
- **비율은 2:3 이다** — 넷플릭스·티빙의 세로 포스터가 그 비율이고, 실제 포스터를 걸 자리라 맞춰야 위아래가 안 잘린다. 포스터가 0장이던 동안 3:4 로 줄여 뒀던 적이 있는데(활자만 있으면 이름 위가 빈 자국이 된다) 포스터를 싣기로 하면서 되돌렸다.
- **판에는 실선 테두리(`ring-border`)를 두른다.** 그림이 없는 판은 배경에 번져서 어디까지가 한 장인지 흐려진다 — 넷플릭스에서 그 경계를 만드는 건 그림 자체다.
- **홈에서 프로그램을 가르는 것은 색이 아니라 플랫폼 캡션이다**(`SBS PLUS · ENA` / `NETFLIX`). 팔레트가 흑백뿐이라 색면으로 판을 구분하는 길이 막혀 있고 그건 반복해서 반려된 방향이기도 하다 — 대신 라틴 대문자에 트래킹(`0.16em`)을 벌려 그 줄 자체를 활자로 만든다. 사이트에서 유일한 uppercase 처리라 여기서만 쓴다.
- **홈에 `방영 중` 은 글자가 아니라 점만 찍는다**(`sr-only` 로 읽어 준다). 판이 좁아 글자가 들어갈 자리가 없고, 홈은 무엇이 방영 중인지(어느 기수인지)까지는 말하지 않는 화면이다 — 그건 프로그램 화면의 히어로가 한다.
- **사진 자리는 세 곳이다.** 기수 상세의 2열 카드 그리드(`CastCard`), 기수 목록 히어로에 겹쳐 쌓는 원 6개(`SeasonFeature`), 기수 목록 줄에 겹쳐 쌓는 작은 원 4개(`SeasonRow`). 셋 다 `CastPhoto` 를 쓴다.
- **홈에는 사이트 전체 집계를 적지 않는다.** 프로그램 카드가 저마다 `33개 기수 · 408명 중 인스타 320개 확인` 을 말하므로, 그 위에 사이트 합계를 한 줄 더 두면 같은 숫자를 한 화면에서 두 번 읽게 된다(프로그램이 둘인 지금은 거의 같은 값이다). 홈의 큰 제목은 숫자가 아니라 사이트가 하는 일(`출연진 인스타`)이다.
- **히어로는 사진 스트립이 아니라 겹친 원 줄이다**(2026-08-21). 원래는 128px 짜리 3장 사진 스트립이었는데, 사진이 0장인 동안 그 자리가 가명 배지 상자 셋으로 떨어졌다 — 가명은 21개가 408명에 반복되는 글자라 정보량이 0인데 카드의 절반을 먹었고, 정작 `33기`·`방영 중`·`0 / 12 확인` 이 아래로 눌렸다. 그래서 목록 줄과 같은 겹침 문법으로 낮추고 기수 이름을 카드에서 제일 큰 요소로 올렸다. **값은 히어로와 목록 줄이 같은 그림이 된 것**이라, 카드 배경 · `방영 중` 점 · 큰 기수 이름 셋이 그 구분을 지고 있다 — 셋 중 하나를 빼면 히어로가 목록 줄에 묻힌다.
- **겹친 원의 테두리는 두 곳 다 `border-background` 다.** 히어로는 카드 위에 얹히니 `border-card` 가 맞아 보이지만 틀렸다 — `CastAvatar` 의 `searching` 배지가 `bg-card` 라, 테두리까지 카드 색이면 원 윤곽이 통째로 사라지고 가명 글자만 떠 있는 화면이 된다. 배경색 테두리라야 원끼리도 갈리고 원 자체도 드러난다.
- **사진이 없는 사람은 가명 두 글자 배지(`CastAvatar`)로 대신 채운다.** 사진이 있는 쪽이 한동안 소수라 일괄 실루엣으로 두면 화면 전체가 같은 그림이 된다. 배지는 **저대비 워터마크**다 — 카드 크기에서 또렷하면 색면이 화면을 먹는다. 상태는 카드 아래 상태 줄이 또렷하게 말한다.
- **자리 크기·모양·글자 크기는 감싸는 쪽이 정한다.** `CastPhoto`·`CastAvatar` 는 `h-full w-full` 로 채우기만 하고, `relative` 박스와 `text-[…]` 는 호출부에 있다(`CARD_SIZES`, `FALLBACK_TEXT`, `FACE_SHAPE`).
- 사이트는 **라이트·다크 두 팔레트를 다 가진다**(2026-08-20 부로 "다크 전용" 원칙 폐기). `globals.css` 의 `:root` 가 라이트, `.dark` 가 다크다 — 둘 다 위 시안 D 팔레트를 흑백 축으로 그대로 짝지은 것이라 명도만 뒤집혔지 구조는 같다. `next-themes` 로 전환하고(`ThemeProvider`, `attribute="class"`), 기본값은 여전히 `dark`다 — 원래 시안의 첫인상을 지키려는 것이다. 전환 버튼(`ModeToggle`)은 네 화면 헤더 맨 위, 워드마크 옆에 있다 — `SiteHeader` 가 `Wordmark` 와 `ModeToggle` 을 한 줄로 묶어서 페이지마다 그 줄을 반복하지 않는다.
- **유채색은 하나뿐이고, 그 하나는 확인된 계정의 핸들에 쓴다**(`--verified`, 앰버). 강조·CTA·배지 같은 다른 용도로 번지게 하지 말 것.
- **2026-08-31 에 그 색의 의미를 뒤집었다. 되돌리지 말 것.** 그전에는 유일한 유채색이 `--searching`("아직 못 찾음") 이었는데, 그러면 **데이터가 채워질수록 화면에서 색이 사라진다** — 22기(14/14)는 완전한 무채색이고 33기(0/12)만 색이 도는, 성취와 색이 반대로 붙은 구조였다. "화면이 밋밋하다"는 지적의 원인이 취향이 아니라 여기였다. 지금은 아카이브가 채워질수록 화면이 산다.
- **`--searching` 은 무채색이다.** 못 찾은 자리를 색으로 부각하면 눈이 구멍부터 훑는데, 이 사이트가 파는 건 구멍이 아니라 확인이다. "찾는 중" 이라는 사실은 글자가 그대로 말한다.
- **`방영 중` 은 색이 아니라 명도로 세운다**(`bg-foreground` 점). 방영 여부는 확인 여부와 다른 축이라 `--verified` 를 빌려 쓰면 두 축이 한 색으로 뭉갠다. 유채색을 하나로 유지하면서 신호를 세우는 수단은 명도뿐이다.
- **바탕은 따뜻한 쪽이다**(다크 `#161511`). 순흑(`#0a0a0c`)이었을 때 화면이 통째로 평평했다 — 넷플릭스류의 다크가 살아 보이는 건 그림이 색을 다 대기 때문이고, 사진이 0장이면 같은 값이 그냥 빈 화면이 된다.
- 폰트는 세 역할이다: 한글 `Gothic A1`(`--font-sans`), 라틴·숫자 `Manrope`(`--font-lat`), **인스타 핸들 `IBM Plex Mono`(`--font-mono`)**. 핸들만 고정폭인 건 그게 **문장이 아니라 식별자**이기 때문이다 — 방문자가 이 사이트에서 실제로 가져가는 유일한 값이고 한 글자만 달라도 다른 사람이 된다. 날짜·개수는 계속 `font-lat` 이다.
- **출연진 카드는 사진 유무로 구성이 갈리지 않는다.** 사진이 있든 없든 글자 블록이 같은 자리에 같은 모양으로 앉고, 사진은 뒤에 깔릴 뿐이다. 예전에는 사진이 없으면 그 자리를 흐린 가명이 채우고 아래에 같은 가명이 또 나와서 **한 카드에 같은 이름이 두 번** 찍혔다 — 사진이 0장인 동안 격자 전체가 그 그림이었다. `CastAvatar` 는 작은 원(히어로·목록 줄) 전용이고 카드에는 안 쓴다.
- 모서리 반경 12~16px, 전환 180~220ms.

**색면 포스터풍으로 가지 말 것.** 굵은 디스플레이 서체 + 강한 색면 + 거대한 숫자 조합은 이 프로젝트에서 반복해서 반려됐다. **사진 없는 자리를 메울 때 특히 걸린다** — 가명 배지를 처음엔 상태색 그대로 칠했더니 히어로 타일 세 장이 황토색 색면 띠가 됐다. 그래서 배지는 저대비고, 그 타일 자체도 결국 겹친 원 줄로 낮췄다. 방향이 애매하면 시안을 더 찍기보다 레퍼런스를 물어보는 게 빠르다.

### 브랜드 — ㄲ 마크 + `누꼬` / `nukko`

워드마크는 [ㄲ 마크] `누꼬`(ko)·[ㄲ 마크] `nukko`(en). 마크는 겹친 두 원(얼굴·계정을 잇는 모양)의 둘레를 따라 ㄱ 을 하나씩 깎아 만든 모노그램(ㄲ)이다 — 누꼬의 ㄲ, nukko 의 kk. `@` 마크(인스타그램을 가리키던 글자)를 2026-08-24 에 통째로 교체했다 — 남들이 다 쓰는 기성 글자·기성 도형(원·물음표·말풍선 등도 검토 후 기각) 대신, 이름 속 글자에서 나온 도형이라야 이 브랜드만 가질 수 있다는 결론이었다.

- **마크는 도형(SVG)이지 글자가 아니다.** 좌표는 `lib/brand.ts` 의 `BRAND_MARK_VIEWBOX`·`BRAND_MARK_PATHS` — 두 개의 `<path>`(각각 수평 획 + 라운드 코너 + 수직 획)가 `stroke-linecap: round` 로 그려진다. 이 획 끝 처리가 사이트의 반경 규칙(12–16px)과 같은 태도라 각진 ㄱ 대신 이 모양을 골랐다.
- **마크는 언어를 타지 않고, 이름만 탄다.** `[lang]` 바깥인 파비콘·앱 아이콘이 애초에 언어를 못 받으므로, 두 언어가 같은 도형을 공유하는 것 말고 다른 수가 없다. 이름(`BRAND_WORDMARK`)만 로케일별로 갈아 끼운다.
- **한글 워드마크를 반려했던 규칙이 뒤집혔다.** `whosthat` 시절엔 "브랜드를 번역하지 않는다"는 이유로 한글을 뺐는데, `누꼬` 는 `nukko` 의 번역이 아니라 **원문**이다(경상도 사투리). 그 규칙을 그대로 적용하면 한국어 화면이 원문 대신 로마자 표기를 쓰는 꼴이 된다. 이름이 사투리인 동안만 성립하는 예외지 "브랜드도 번역한다"로 넓히지 말 것. **일본어가 `ヌッコ` 가 아니라 `nukko` 인 게 그 선이다** — 가타카나는 원문이 아니라 음역이라, 옮기는 순간 예외가 언어마다 하나씩 생긴다.
- **서체는 이름만 갈아 끼운다**(`BRAND_WORDMARK_FONT`). 마크가 도형이 된 뒤로는 이 표가 서체 문제에서 완전히 자유롭다 — 예전엔 `@` 를 어느 서체로 그릴지가 걸렸지만(Gothic A1 의 `@` 는 안쪽 `a` 배가 작고 둥글어 이름과 서체가 갈리면 마크가 다른 글자로 읽혔다), 이제 마크는 서체 자체가 없다. 한글 쪽 값이 빈 문자열이 아니라 `font-sans` 인 건 이 값이 `font-lat` 을 이미 걸어 둔 상자(푸터 카피라이트 줄) 안에도 들어가기 때문이다.
- **워드마크의 마크·이름 정렬은 `items-center` 다.** 마크가 텍스트가 아니라 도형이라 베이스라인 개념이 없다 — `items-baseline` 을 쓰면 오히려 광학 중심이 어긋난다. (`@` 시절엔 **마크와 이름 사이**에 두 서체의 라인 메트릭 차이로 세로 위치가 어긋나는 버그가 있었다 — 도형으로 바꾸면서 그 버그는 사라졌다.)
- **다만 `items-center` 는 줄 상자만 맞춘다 — 상자 안에서 글자가 잉크를 칠하는 위치까지 맞춰 주진 않는다.** 한글 이름(`누꼬`, Gothic A1)이 라틴 이름(`nukko`, Manrope)보다 베이스라인 위쪽으로 더 쏠려 있어서, 상자 중심은 픽셀 단위로 같은데도 한글만 마크보다 살짝 떠 보이는 게 실제로 발견됐다(2026-08-25, 헤더 15px 기준 1.44px). `BRAND_WORDMARK_NUDGE` 로 한국어에만 `translate-y-[0.1em]` 보정을 건다 — `em` 인 건 이 워드마크가 헤더(15px)·푸터(11px) 두 크기로 쓰여서 고정 px 로는 한쪽만 맞기 때문이다. 언어를 더할 때 그 언어 이름이 한글도 라틴도 아니면(예: 가나 혼합), 이 상자에서 다시 실측해 볼 것 — 서체마다 다르지 굳이 셋 다 같다고 가정할 이유가 없다.
- **이름을 손으로 적지 말고 `BrandName` 을 쓴다**(`components/wordmark.tsx`). 이름·서체·광학 보정 세 표를 늘 함께 읽어야 하는데, 손으로 조립하면 보정을 빠뜨리기 쉽다 — 실제로 정책 두 페이지가 `BRAND_WORDMARK_NUDGE` 없이 렌더되어, 한국어에서만 같은 이름이 헤더·푸터와 다른 높이로 떠 있었다(2026-08-25 에 이 컴포넌트로 묶으며 고침). 문장 안에 들어가는 자리는 `BrandSentence` 가 사전의 `{brand}` 를 갈아 끼운다.
- **언어를 못 받는 자리는 라틴 표기로 고정한다.** OG 이미지의 `alt` 는 정적 export 라 locale 을 못 받으므로 `BRAND_WORDMARK.en`(도메인과 같은 표기)만 쓴다 — 마크는 도형이라 글로 옮길 말이 없다. 반대로 `websiteSchema` 의 `alternateName` 은 locale 을 받으므로 화면 워드마크와 같은 언어로 준다 — 검색 결과에 뜬 이름과 눌러서 도착한 화면이 어긋나면 안 된다.
- `BrandMark` 컴포넌트(`components/icons.tsx`)가 좌표를 그린다. `className`(Tailwind)과 `style`(인라인) 둘 다 받는 이유는 렌더 경로가 둘로 갈리기 때문이다 — 화면 컴포넌트(`Wordmark`·`SiteFooter`)는 `className` 만 쓰고, `BrandTile`(파비콘·앱 아이콘)은 satori(ImageResponse) 위에서 렌더되는데 satori 가 Tailwind 클래스를 못 읽어서 `style` 로 크기·색을 준다.
- **satori 위의 색은 `BRAND_IMAGE_COLORS` 다.** 파비콘·앱 아이콘·OG 카드가 다 CSS 를 실행하지 않는 판 위에 그려져서 `globals.css` 의 토큰을 못 읽는다 — 다크 팔레트의 세 값을 그대로 옮겨 적어 뒀고, **한쪽만 고치면 어긋난 채로 아무 에러도 안 난다.** 공유 카드는 방문자 테마를 모르므로 라이트 모드에서도 어두운 판이다.
- **파비콘·앱 아이콘은 폰트가 필요 없다.** 마크가 벡터라 폰트 로더 호출도, `fonts` 배열도 없다 — `@` 글리프 시절엔 Manrope 서브셋을 매번 받아야 했다. 두 라우트는 크기(`size`)와 여백 비율(`MARK_WIDTH_RATIO`)만 정하고 그림은 `BrandTile` 한 곳이 그린다 — 높이는 `BRAND_MARK_ASPECT`(88:64)로 뺀다. 앱 아이콘 쪽 비율이 더 작은 건 iOS 마스크가 모서리를 먹어서 여백을 더 줘야 하기 때문이다.
- `Wordmark` 는 홈·기수 상세·정책 페이지(처리방침·삭제요청) 헤더에 있다. 정책 페이지는 검색으로 바로 착지하는 진입점이라 워드마크가 특히 중요하다 — 본문의 "이 사이트" 도 첫 문장에서 `BRAND_WORDMARK` 로 못박는다.
- `BackLink` 는 바깥 여백을 갖지 않는다 — 정책 페이지는 제목 위 한 줄, 기수 상세는 제목 옆(`‹ 33기`)에 붙이므로 자리는 쓰는 쪽이 정한다. 제목이 두 줄로 접힐 때 화살표가 첫 줄에 붙게 `-mt-1` 로 광학 정렬한다.

## 데이터 규칙

- 계정 상태는 `found` / `none` / `searching` 3가지다. **`none`("찾아봤는데 없다")은 결과지 실패가 아니다** — 방문자의 헛수고를 막는 게 이 사이트의 핵심 가치라 별개 상태로 둔다. `searching` 으로 방치하지 말 것.
- **계정을 지어내지 않는다.** 확인한 것만 `found` 로 올린다. 비공개 계정·추정 계정·커뮤니티 추측은 넣지 않는다(`PLANNING.md` §9).
- `found` 는 `lastVerified` 와 `source` 를 반드시 함께 채운다. 이 사이트를 믿을 근거가 그 두 줄이다.
- **사진은 `profileImageUrl` 에 `/public` 아래 경로로 넣는다.** 남의 서버 이미지를 직접 걸지 않는다(핫링크 금지, `PLANNING.md` §9 ⑤). 비워 두면 화면에서 가명 배지가 대신 나온다.
- **프로그램 포스터(`Program.posterUrl`)와 출연자 사진(`CastMember.profileImageUrl`)은 규칙이 다르다.** 포스터는 제작사 저작물이고 사후 대응으로 싣는다(`src/data/README.md` 의 "프로그램 포스터를 올릴 때"). 아래는 **출연자 사진** 규칙이고, 여기는 일반인의 초상권이 겹쳐서 더 좁다.
- **사진 출처는 본인 인스타 프로필 사진뿐이다 — 방송 캡처는 쓰지 않는다.** 캡처는 저작권자가 제작사라, 개인 요청과 달리 협상 여지 없이 사이트 전체가 한 번에 걸린다. 프로필 사진은 저작권·초상권이 모두 본인이라 사후 대응 방침이 성립하는 유일한 출처다. 규격(`public/cast/<member.id>.jpg`, 600×600)은 `src/data/README.md` 의 "사진을 올릴 때".
- **사진 방침은 "올려 두고 요청이 오면 내린다"(사후 대응)다.** 사전 허락을 다 받는 건 불가능하고 사진을 안 쓰면 시안 D 가 성립하지 않아서 내린 결정이다 — 배경은 `PLANNING.md` §9 ①. 이 방침은 **내리는 쪽이 빠를 때만 성립하므로 절차를 느슨하게 하지 말 것**: 삭제 요청이 오면 계정과 사진을 함께 내린다(`src/data/README.md`), 화면 문구(`/takedown`·`/privacy`)는 사진을 명시한 상태로 유지한다. 처리방침이 사실과 다른 게 사진을 싣는 것보다 위험하다.
- 실명은 공개된 경우에만. 모르면 비우면 가명으로만 나온다.

## 현재 상태

다섯 화면(프로그램 목록·기수 목록·기수 상세·삭제 요청·처리방침)이 **한국어·영어·일본어 세 벌**로 동작하고 빌드가 통과한다(138 페이지 프리렌더). SEO 배관(sitemap·robots·canonical·hreflang·OG 이미지·JSON-LD)까지 붙어 있고 전부 정적이다 — 서버가 하는 일은 `/` 하나를 언어로 보내는 proxy 뿐이다. Vercel 에 배포돼 있다 — https://www.nukko.net (2026-08-24 에 커스텀 도메인 연결, Cloudflare Registrar 등록·DNS. 프록시는 **DNS only** 로 둔다 — 주황 구름을 켜면 Vercel 검증·SSL 발급이 막히고 Bot Fight Mode 가 크롤러를 자른다). 사진을 한 번 걷어냈다가 2026-08-20 에 시안 D 의 이미지 카드로 되돌렸고, 사진이 없는 자리는 `CastAvatar` 가 채운다 — 위 "디자인" 절 참고. 실제 사진 파일은 아직 한 장도 없다.

브랜드 워드마크·파비콘·앱 아이콘([ㄲ 마크] `누꼬`(ko)/[ㄲ 마크] `nukko`(en·ja))이 붙었다 — 위 "브랜드" 절 참고. 홈을 뺀 네 화면 헤더가 전부 같은 `‹ 제목` 인라인 구조를 쓴다(홈은 더 올라갈 곳이 없어 화살표가 없다).

도메인은 `lib/site.ts` 한 곳에서 정해진다. **`NEXT_PUBLIC_SITE_URL`(Production)에 `https://www.nukko.net` 을 박아 뒀다** — Vercel 자동값(`VERCEL_PROJECT_PRODUCTION_URL`)은 "가장 짧은 커스텀 도메인"을 고르는데, 그러면 리다이렉트 전용인 apex(`nukko.net`)가 뽑힌다. 이유는 위 "커스텀 도메인을 연결할 때" 1번에 있다.

**검색엔진 등록도 끝났다**(2026-08-24). Google Search Console(도메인 속성, DNS TXT)·네이버 서치어드바이저(HTML 메타 태그)는 소유확인·sitemap 제출까지 직접 확인했다. **Bing Webmaster Tools** 는 GSC 에서 Import 로 가져왔다 — 코드 변경이 없어서 값을 남길 파일이 없고, sitemap 도 소유확인과 함께 자동으로 넘어왔다(콘솔에서 확인). 절차는 위 "커스텀 도메인을 연결할 때". 남은 건 색인을 기다리는 것뿐이다.

**프로그램은 둘이다**(2026-08-31). 나는 솔로는 1~33기 골격과 명단이 다 들어가 있고(408명, 2026-08-21) 계정은 320명이 `found`, 나머지가 `searching` 이다 — 아직 못 채운 건 방영 중이라 계정이 잠긴 33기와 각 기수에 한둘씩 남은 자리다. **솔로지옥은 시즌 1~5 골격만 있고 명단이 비어 있다** — 그래서 지금은 프로그램 화면째로 색인에서 빠져 있다(`isProgramIndexable`). 다음 일이 그 명단을 채우는 것이다.

**계정을 채울 때는 `src/data/README.md` 의 "계정 검증 방법"을 먼저 읽을 것.** 계정 하나를 잘못 올리면 무관한 사람이 피해를 본다. 집계 사이트·블로그를 그대로 옮기다 실제로 여러 번 걸렸다(가짜 목록, 오타 핸들, 사진작가 계정 등). 반드시 인스타 페이지를 직접 열어 확인한다. 다음 배치 순서는 `PLANNING.md` §10.

삭제·정정 요청 창구(`/takedown`)와 개인정보 처리방침(`/privacy`)이 붙어 있고, 푸터가 레이아웃에 있어 전 화면에서 닿는다. 푸터 맨 아래 카피라이트 연도는 `new Date()` 가 아니라 상수다 — 전 페이지가 SSG 라 그 값은 빌드 시각에 얼어붙는다. **삭제 요청 처리 방법은 `src/data/README.md` 의 "내려 달라는 요청이 오면" 을 따른다** — `searching` 으로 되돌리면 다음 배치에서 다시 올라온다. 계정과 사진을 **함께** 내린다(계정만 내리면 요청을 반만 처리한 것이다). 두 화면(`/takedown`·`/privacy`)도 사진을 명시하고 있으니, 사진 방침을 바꾸면 그 문구부터 같이 고친다.

**광고(구글 애드센스)를 붙였다**(2026-08-24). 값은 두 곳이 짝이다 — `lib/site.ts` 의 `ADSENSE_CLIENT_ID`(`ca-pub-…`)와 `public/ads.txt`(`pub-…`). 번호가 어긋나면 애드센스가 "승인되지 않은 판매자"로 잡아 수익이 막힌다. 스크립트는 루트 레이아웃이 걸고, ID 가 비면 아예 안 건다 — 틀린 ID 로 요청이 나가는 게 안 나가는 것보다 나쁘다.

**광고 자리를 코드로 만들지 않는다 — 자동 광고다.** 스니펫 한 줄이 전부고 구글이 위치를 정한다. 종류별 토글은 애드센스 콘솔에 있는데, **전면 광고(vignette)는 꺼야 한다** — 기수 목록과 상세를 계속 오가는 사이트라 페이지를 넘길 때마다 화면을 덮으면 "검색 없이 바로 찾는다"가 무너진다. 위치가 디자인과 안 맞으면 그때 수동 광고 단위로 바꾼다(코드 작업).

**운영 상태**(2026-08-24): 소유권 확인·검토 요청·GDPR 동의 메시지까지 끝났고 심사 결과를 기다리는 중이다. 소유권은 **ads.txt 방식**으로 통과했다 — 코드 스니펫 방식은 실패했는데, 애드센스에 등록된 사이트가 apex(`nukko.net`)고 실제 사이트는 `www` 라 그런 것으로 보인다. 동의 메시지는 구글 CMP 의 **3선택 형식**(동의·동의하지 않음·옵션 관리)이다 — 2선택은 첫 화면에 거부 버튼이 없어서, 거부가 동의만큼 쉬워야 한다는 GDPR 원칙에 어긋난다. 미국 주 규정 메시지는 만들지 않았다(CCPA 는 매출·이용자 수 기준이 있어 대상이 아니고, 없어도 구글이 광고를 막지 않는다).

**정리 한 번 돌았다**(2026-08-25). 죽은 CSS 토큰(`--sidebar-*`·`--chart-*`·`create-next-app` 잔재)과 안 쓰는 shadcn 파일(`textarea`·`separator`)을 걷어내고, 중복을 다음 다섯 곳으로 모았다: 공유 카드(`lib/og.tsx`), 브랜드 타일(`BrandTile`), 정책 페이지 껍데기(`PolicyPage`)와 그 metadata(`policyMetadata`), 브랜드 이름(`BrandName`), 사이트 집계(`getTotals`). 경로 리터럴은 `links.ts` 로, 절대 URL 은 `absoluteUrl` 로 모았고, `contactMailto` 를 `links.ts` 에서 `site.ts` 로 옮겨 **클라이언트 번들에서 `site.ts` 를 뺐다**(언어 전환 버튼이 `links.ts` 를 타고 끌고 들어오던 것이다). 화면 동작은 그대로고 빌드도 117 페이지 그대로다.

**아직 안 건드린 것들**(알고 남긴 것이므로 "발견"으로 다시 올리지 말 것): 벤더링된 shadcn 파일의 안 쓰는 export(`dropdown-menu` 16개 중 4개만 쓴다 — `add` 로 덮어쓰면 되돌아온다), `Program.type`·`CastMember.gender`(읽는 곳이 없지만 데이터에는 들어 있는 모델 면 — `Program.platform` 은 2026-08-31 에 홈 카드가 읽기 시작했다), `SeasonFeature`·`SeasonRow` 의 `FACE_SHAPE` 두 벌(크기가 달라서 합치면 플래그가 생긴다 — "추상화는 늦게" 절 참고).

**처리방침·삭제 창구는 프로그램이 늘면 같이 손본다.** 나는 솔로만 있던 시절의 문구가 `가명`·`기수와 가명(예: 28기 영숙)` 을 전제하고 있었다 — 솔로지옥은 실명으로 나오는 프로그램이라 그대로 두면 처리방침이 사실과 다른 말을 한다. 2026-08-31 에 `privacy.cast1` 과 `/takedown` 의 요청 예시·메일 제목을 "방송에서 불린 이름" 쪽으로 고치고 `effectiveDate` 를 함께 옮겼다.

**광고를 떼거나 바꾸면 `/privacy` 부터 되돌린다.** 처리방침의 세 문단이 광고를 전제하고 쓰여 있다 — `visitor2`(무쿠키 주장을 Vercel Analytics 로 한정), `processor`(Google LLC 가 제3자로 들어가 있다), `ads`(게재 중이라고 말한다). 광고를 떼고 이 문구를 두면 처리방침이 반대 방향으로 거짓말을 한다. 문구가 바뀌면 `effectiveDate` 도 함께 옮긴다.

연락처는 `lib/site.ts` 의 `CONTACT_EMAIL` 한 곳이다. 이 주소는 **실제로 열려 있어야 한다** — 반송되면 사이트가 지키지 못할 약속을 걸어 둔 셈이 된다. `whosthat.archive@gmail.com` 에서 `nukko.team@gmail.com` 으로 옮겼다(2026-08-24) — 브랜드 이름과 짝이 맞는 주소다. 새 주소로 다시 옮길 때도 **주소를 먼저 만들고** 코드를 고친다 — 순서를 바꾸면 그사이 들어온 삭제 요청이 통째로 사라진다.

검색(`SeasonSearch`)은 **홈의 기수 목록 바로 위 검색창**이다. 헤더 돋보기 + `⌘K` 팔레트(shadcn `command`)로 먼저 만들었다가 반려됐다 — 목록 위 검색창이 맞다. 그래서 `command`·`dialog` 는 다시 걷어냈고 `cmdk` 의존도 지웠다.

- **인덱스는 언어별로, 그리고 담는 범위별로 만들어진다.** 영어 인덱스의 가명은 로마자고, 한글 원문은 `keywords` 로 함께 실려 `영수` 질의도 받는다(위 "언어" 절). 홈은 전 프로그램, 프로그램 화면은 자기 것만 담는다(위 "프로그램" 절).

- **입력이 비어 있으면 원래의 목록(홈은 프로그램, 프로그램 화면은 지난 기수), 뭔가 입력하면 그 자리가 결과로 바뀐다.** 목록을 두 벌 그리지 않으려고 서버가 그린 목록을 `children` 으로 받는다 — `SeasonRow` 를 클라이언트 컴포넌트에서 import 하면 그게 쓰는 `lib/data` 를 타고 원본 JSON 이 번들에 딸려 온다.

- **가명은 식별자가 아니다.** 408명이 쓰는 가명이 21개뿐이라 "영수" 한 단어는 33건이 걸린다(기수마다 하나씩). 그래서 ① 계정을 찾아 둔 사람(`found`)을 맨 위로 올리고 ② 프로그램·기수 이름을 사람 쪽 검색 대상에 함께 넣어 `22기 영수`·`솔로지옥 시즌 4` 로 좁혀지게 했다. 그 토큰을 따로 골라내는 특수 처리는 없다 — 그 한 줄이 복합 질의를 통째로 받아낸다.
- 퍼지 매칭을 넣지 말 것. 가명이 한 글자씩만 달라서 오타를 관대하게 보면 "영수"에 "영식"·"영철"이 딸려 온다.
- **인덱스는 `buildSearchIndex`(`data.ts`)가 서버에서 만들어 홈 페이지가 prop 으로 내린다.** 검색이 클라이언트 컴포넌트라 `lib/search.ts` 는 `lib/data.ts` 를 import 하지 않는다 — 한 파일에 섞으면 원본 JSON 112KB 가 클라이언트 번들에 딸려 들어간다. 페이지당 인덱스는 gzip 2KB 다(가명·상태가 반복돼 잘 압축된다).
- 사람 결과는 `/{lang}/{program}/seasons/{id}#{memberId}` 로 착지한다. 앵커는 `CastCard` 가 카드에 거는 DOM id 와 짝이다.

다음: 솔로지옥 시즌별 출연진 명단 채우기 → 계정 데이터 채우기 · 사진 채우기(파이프라인은 붙었고 파일이 0장이다 — `src/data/README.md` 의 "사진을 올릴 때") → 제보 폼(`PLANNING.md` 로드맵 2단계). 언어는 일본어까지 셋이고, 더 붙일 때 절차는 위 "언어를 하나 더할 때". 프로그램을 더 붙일 때는 `src/data/README.md` 의 "프로그램을 추가할 때".

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
