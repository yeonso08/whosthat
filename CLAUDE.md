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

## 구조

```
src/app/page.tsx              기수 목록
src/app/seasons/[id]/page.tsx 기수 상세 (generateStaticParams 로 전 기수 프리렌더)
src/app/takedown/page.tsx     삭제·정정 요청 창구
src/app/privacy/page.tsx      개인정보 처리방침
src/app/icon.tsx              파비콘 — @ 마크, 코드 생성(ImageResponse)
src/app/apple-icon.tsx        iOS 홈 화면 아이콘 — 같은 마크, 180×180
src/lib/brand.ts              BRAND_MARK(@)·BRAND_WORDMARK(whosthat) — 워드마크와 아이콘이 공유
src/lib/types.ts              Program → Season → CastMember 모델
src/lib/data.ts               JSON 로더 + 날짜 포맷
src/data/na-neun-solo.json    실데이터 — 채우는 법은 src/data/README.md
src/components/               cast-card, cast-avatar, season-row, season-feature, site-footer, site-header, back-link, wordmark, icons, theme-provider, mode-toggle
```

Next.js 16 App Router + Tailwind v4 + shadcn/ui, pnpm. `params` 는 Promise 라 반드시 await 한다.

## 코드 규칙

원론이 아니라 이 코드베이스에 걸리는 형태로만 적는다. 새 코드는 아래를 만족해야 한다.

### 컴포넌트는 shadcn/ui 에 있는지 먼저 본다

- **손으로 짜기 전에 레지스트리를 먼저 확인한다.** 있으면 그걸 쓴다. 받는 건 로컬 CLI 로 — `pnpm exec shadcn add <name>`. `dlx shadcn@latest` 는 설치된 버전(4.18.0)·스타일(`base-nova`)과 어긋날 수 있으니 쓰지 않는다.
- **접근성이 걸린 것은 특히 직접 만들지 않는다.** dialog, dropdown, popover, tooltip, tabs, sheet, command, form, input. 포커스 트랩·키보드 이동·ARIA 를 손으로 다시 짜면 반드시 빠뜨린다. 로드맵상 검색은 `command`, 제보 폼은 `form` + `input` 부터 본다.
- 아이콘도 같다. `lucide-react` 가 이미 깔려 있다(`components.json` 의 `iconLibrary: lucide`). 새 아이콘은 lucide 에서 가져오고, `components/icons.tsx` 에는 **lucide 에 없는 것만** 둔다(인스타그램 같은 브랜드 마크).
- 받은 뒤에는 **시안 D 에 맞춰 고쳐 쓴다.** 들어온 순간 우리 코드라 수정해도 된다 — 다만 기본 스타일이 디자인 규칙(흑백, 유채색은 `searching` 전용, 반경 12~16px)을 이기게 두지 않는다.
- **`components/ui/` 는 shadcn 자리, `components/` 바로 아래는 우리 자리.** 섞지 않아야 나중에 `add` 로 덮어써도 안전하다.
- 직접 만드는 건 레지스트리에 없거나 **도메인이 들어갈 때**다. `CastCard` 는 `found/none/searching` 3상태를 아는 컴포넌트라 우리 것이 맞다.

### 의존 방향은 한 쪽으로만 (결합도)

- `page → components → lib → data(JSON)`. 역방향 import 는 없다. `lib` 은 컴포넌트를 모르고, 컴포넌트는 JSON 을 모른다.
- **JSON 을 직접 import 하는 파일은 `lib/data.ts` 하나뿐이다.** 제보 기능에서 DB 로 갈아탈 때(로드맵 2단계) 고칠 파일을 하나로 묶어 두는 게 목적이다. 페이지에서 `@/data/*.json` 을 부르고 싶어지면 `data.ts` 에 함수를 하나 더 만든다.
- 컴포넌트는 **그리는 데 필요한 최소 타입만** props 로 받는다. `SeasonRow` 는 `Season`, `CastCard` 는 `CastMember` 다. 편하다고 `Program` 을 통째로 내려보내면 그 컴포넌트는 프로그램 구조가 바뀔 때마다 같이 깨진다.

### 한 파일에 한 역할 (단일 책임)

- 카드를 그리는 건 `CastCard`, 상태 한 줄은 `CardStatus`, 가명 이니셜 배지는 `CastAvatar`. 역할이 갈리면 **같은 파일 안의 작은 컴포넌트로 먼저 쪼갠다** — 파일이나 폴더부터 만들지 않는다. 두 번째 사용처가 생기면 그때 파일로 뽑는다.
- **포맷팅은 컴포넌트가 하지 않는다.** `formatAirDate`, `formatChecked` 처럼 `lib/data.ts` 에 두고 불러 쓴다. JSX 안에 `.split("-")` 이나 `.slice(2)` 가 보이면 자리를 잘못 잡은 것이다.
- 데이터 정렬·집계도 마찬가지다. 기수 정렬은 `getSeasons`, 현황 집계는 `getCoverage` 가 한다. 페이지에서 `.sort()` 를 다시 부르지 않는다.

### 같이 바뀌는 것을 같이 둔다 (응집성)

- `AccountStatus` 와 `getCoverage` 가 `types.ts` 에 함께 있는 이유: 상태가 하나 늘면 둘 다 손대야 한다. 반대로 함께 바뀌지 않는 것은 같은 파일에 두지 않는다.
- **파생값은 저장하지 않고 계산한다.** 확인 개수를 JSON 에 적어 두지 않고 `getCoverage` 로 세는 게 그 이유다. 두 군데 적힌 숫자는 반드시 어긋난다.

### status 가 분기의 유일한 근원

- `found / none / searching` 분기는 **`member.status` 로만** 한다. `instagramHandle` 이 있는지로 "찾았다"를 유추하지 말 것 — 애써 셋으로 나눈 상태가 그렇게 다시 둘로 무너진다.
- 상태를 하나 추가하면 세 곳을 함께 고친다: `types.ts` 의 유니온, `CastCard` 의 `CardStatus`, `getCoverage`. **유니온만 늘리면 나머지 두 곳에서 컴파일 에러가 난다** — `CardStatus` 는 반환 타입을 못 박은 `switch`, `getCoverage` 는 `Record<AccountStatus, number>` 리터럴이라 그렇다. 새 분기를 추가할 때도 이 장치를 없애지 말 것.

### 추상화는 늦게

- 두 번째 사용처까지는 복붙이 낫다. `CastAvatar` 의 `variant` 는 기수 상세 행과 기수 목록 얼굴 표식 **두 곳이 실제로 생긴 뒤에** 붙인 것이다. 세 번째 variant 가 필요해지면 그때는 플래그를 늘리지 말고 컴포넌트를 나눈다.
- 쓰이지 않는 옵션·설정·확장 포인트는 만들지 않는다.

### 값은 상수로 뽑는다

- **코드 안에 그냥 박힌 숫자·문자열을 두지 않는다.** 파일 상단에 `SCREAMING_SNAKE_CASE` 상수로 올리고, **왜 그 값인지** 한 줄 주석을 단다. `FACE_COUNT`(더 넣으면 기수 이름이 밀린다), `CARD_SIZES` 가 그 형태다.
- 기준은 "의미가 있는가"지 "몇 번 쓰였는가"가 아니다. 한 번만 쓰여도 그 값이 왜 4인지 설명이 필요하면 상수다. 반대로 `flex gap-3` 같은 Tailwind 클래스 문자열은 그대로 둔다 — 상수로 빼면 오히려 안 읽힌다.
- **두 파일 이상에서 쓰이는 값은 파일 상단이 아니라 `lib` 으로 올린다.** 외부 URL(`https://instagram.com/`)과 내부 라우트(`/seasons/{id}`)가 지금 컴포넌트에 직접 박혀 있는데, 이런 건 헬퍼 하나로 모아 두 번째 호출부가 생길 때 같이 안 틀리게 한다.
- 화면에 보이는 문구도 같은 자리에서 반복되면 상수로 뺀다. 특히 `"찾는 중"`, `"계정 없음"` 처럼 **상태와 짝이 되는 문구**는 흩어지면 상태를 추가할 때 빠뜨린다.

### 타입은 컴포넌트 파일에 두지 않는다

- **도메인 타입과 공유 타입은 전부 `src/lib/types.ts` 에 있다.** 컴포넌트 파일에서 `CastMember` 같은 타입을 새로 정의하거나 부분 복제(`{ alias: string; status: string }`)하지 않는다 — 데이터 모델이 두 군데로 갈라지는 순간 한쪽만 고치게 된다.
- 컴포넌트 파일이 타입을 쓸 때는 **`import type` 으로 가져다 쓰기만 한다.** 정의는 `types.ts`, 사용은 컴포넌트다.
- 그 컴포넌트만 쓰는 Props 는 파일에 둬도 되지만, **`type Props` 로 이름 붙여 파일 상단 한 곳에** 선언한다. 함수 시그니처 안에 인라인으로 흩뿌리지 않는다(`cast-avatar.tsx` 가 이 형태다).
- **그 Props 를 다른 파일이 참조하는 순간 `types.ts` 로 옮긴다.** 두 번째 사용처가 분리 기준이다.
- 타입만 모아 두는 파일은 `types.ts` 하나로 충분하다. 프로그램이 늘어 이 파일이 커지면 도메인 단위(`types/cast.ts`, `types/season.ts`)로 나누고, 컴포넌트별로 쪼개지 않는다.

### 이름은 도메인 용어 그대로

- 기수는 `season`, 방송 가명은 `alias`, 실명은 `name`. `title` 이나 `label` 같은 일반 명사로 바꾸지 않는다 — 가명과 실명이 섞이는 순간 데이터 규칙(공개된 실명만)을 지키기 어려워진다.

## 디자인 — 사진 없는 버전 (시안 D 이후)

원래 시안 D "어둠 속 사진"은 사진이 화면을 채우는 넷플릭스·티빙 브라우징 문법이었다. **초상권·저작권 때문에 사진을 아예 못 쓰게 되면서 그 전제가 깨졌다** — `PLANNING.md` §9 ①이 이미 이 위험을 지적했었고, 결국 실현됐다. 그래서 사진·실루엣 자리를 없애고 타이포그래피 중심으로 다시 짰다.

- 사진 대신 **가명 두 글자를 원형 배지로** 쓴다(`CastAvatar`). 상태별로 배지 색만 다르다 — found 는 밝게, none 은 죽이고, searching 은 `--searching` 색.
- 기수 카드(`SeasonFeature`)의 사진 스트립도 없앴다. 대신 출연진 각각의 확인 상태를 **가는 막대 스트립**으로 보여준다 — 흑백 위주에 searching 만 황토색이라 색 규칙과 충돌하지 않는다.
- 기수 상세는 사진 카드 2열 그리드가 아니라 **한 줄짜리 목록**이다. 사진이 없으니 격자로 채울 이유가 없다.
- 사이트는 **라이트·다크 두 팔레트를 다 가진다**(2026-08-20 부로 "다크 전용" 원칙 폐기). `globals.css` 의 `:root` 가 라이트, `.dark` 가 다크다 — 둘 다 위 시안 D 팔레트를 흑백 축으로 그대로 짝지은 것이라 명도만 뒤집혔지 구조는 같다. `next-themes` 로 전환하고(`ThemeProvider`, `attribute="class"`), 기본값은 여전히 `dark`다 — 원래 시안의 첫인상을 지키려는 것이다. 전환 버튼(`ModeToggle`)은 네 화면 헤더 맨 위, 워드마크 옆에 있다 — `SiteHeader` 가 `Wordmark` 와 `ModeToggle` 을 한 줄로 묶어서 페이지마다 그 줄을 반복하지 않는다.
- **색은 흑백뿐이다.** 유일한 유채색 `--searching`(황토 `#d9a44b`)은 "아직 못 찾음" 상태 전용이다. 강조·CTA·배지 같은 다른 용도로 번지게 하지 말 것.
- 폰트: 한글 `Gothic A1`(`--font-sans`), 라틴·숫자 `Manrope`(`--font-lat`). 핸들·날짜·개수처럼 숫자가 섞인 곳은 `font-lat`.
- 모서리 반경 12~16px, 전환 180~220ms.

**색면 포스터풍으로 가지 말 것.** 굵은 디스플레이 서체 + 강한 색면 + 거대한 숫자 조합은 이 프로젝트에서 반복해서 반려됐다. 사진이 빠진 자리를 거대한 숫자나 색면으로 메우려 하지 말 것 — 이니셜 배지·진행 스트립·타이포 위계로 대신한다. 방향이 애매하면 시안을 더 찍기보다 레퍼런스를 물어보는 게 빠르다.

### 브랜드 — `@whosthat`

워드마크는 `@whosthat`, 마크는 그 앞의 `@` 하나다. **라틴 문자 기준이다** — 글로벌 확장 전제라 한글 워드마크는 후보에서 뺐다(1차 화면 문구는 한국어지만 브랜드는 그 범위에 묶지 않는다).

- `BRAND_MARK`·`BRAND_WORDMARK` 는 `lib/brand.ts` 하나에 있다. 워드마크(`Wordmark` 컴포넌트)와 파비콘(`icon.tsx`)·앱 아이콘(`apple-icon.tsx`)이 같은 값을 쓰므로 두 번째 사용처가 생겼을 때 이미 여기로 올렸다.
- 파비콘·앱 아이콘은 **도형이 아니라 Manrope 글리프(`@`)를 그대로 그린다.** 직접 그린 도형(원호+꼬리)으로 먼저 시도했지만 32px 에서 안쪽 구멍이 막히고 꼬리가 말려 로딩 스피너처럼 읽혔다 — 폰트 글리프는 안쪽 `a` 배와 세로획이 살아 있어 작은 크기에서도 `@` 로 읽힌다.
- `Wordmark` 는 홈·기수 상세·정책 페이지(처리방침·삭제요청) 헤더에 있다. 정책 페이지는 검색으로 바로 착지하는 진입점이라 워드마크가 특히 중요하다 — 본문의 "이 사이트" 도 첫 문장에서 `BRAND_WORDMARK` 로 못박는다.
- `BackLink` 는 바깥 여백을 갖지 않는다 — 정책 페이지는 제목 위 한 줄, 기수 상세는 제목 옆(`‹ 33기`)에 붙이므로 자리는 쓰는 쪽이 정한다. 제목이 두 줄로 접힐 때 화살표가 첫 줄에 붙게 `-mt-1` 로 광학 정렬한다.

## 데이터 규칙

- 계정 상태는 `found` / `none` / `searching` 3가지다. **`none`("찾아봤는데 없다")은 결과지 실패가 아니다** — 방문자의 헛수고를 막는 게 이 사이트의 핵심 가치라 별개 상태로 둔다. `searching` 으로 방치하지 말 것.
- **계정을 지어내지 않는다.** 확인한 것만 `found` 로 올린다. 비공개 계정·추정 계정·커뮤니티 추측은 넣지 않는다(`PLANNING.md` §9).
- `found` 는 `lastVerified` 와 `source` 를 반드시 함께 채운다. 이 사이트를 믿을 근거가 그 두 줄이다.
- **출연진 사진은 쓰지 않는다.** 방송 캡처는 제작사·방송사 저작권, 인스타 프로필 사진은 본인 저작권·초상권과 겹친다(`PLANNING.md` §9 ①). `CastMember` 에 이미지 필드 자체가 없다 — 다시 넣지 말 것.
- 실명은 공개된 경우에만. 모르면 비우면 가명으로만 나온다.

## 현재 상태

네 화면(기수 목록·기수 상세·삭제 요청·처리방침)이 동작하고 빌드가 통과한다. SEO 배관(sitemap·robots·canonical·OG 이미지)까지 붙어 있고 전부 정적으로 프리렌더된다. Vercel 에 배포돼 있다 — https://whosthat-six.vercel.app (도메인은 추후 구매 예정). 사진을 못 쓰게 되면서 `CastPhoto` 를 걷어내고 이니셜 배지(`CastAvatar`) 중심으로 다시 짰다 — 위 "디자인" 절 참고.

브랜드 워드마크·파비콘·앱 아이콘(`@whosthat`)이 붙었다 — 위 "브랜드" 절 참고. 네 화면 헤더가 전부 같은 `‹ 제목` 인라인 구조를 쓴다.

도메인은 `lib/site.ts` 한 곳에서 정해진다. Vercel 이 넣어 주는 `VERCEL_PROJECT_PRODUCTION_URL` 을 쓰므로 **평소엔 설정할 게 없고**, 커스텀 도메인을 Vercel 에 연결하면 자동으로 따라간다. Vercel 밖에 배포할 때만 `NEXT_PUBLIC_SITE_URL` 을 준다.

기수 골격은 1~33기 전부 들어가 있다(318명). 계정은 채워 나가는 중이고 대부분 아직 `searching` 이다. 1~5·25·32기는 명단을 확인 못 해 `cast` 가 비어 있다(화면에 "명단 정리 중").

**계정을 채울 때는 `src/data/README.md` 의 "계정 검증 방법"을 먼저 읽을 것.** 계정 하나를 잘못 올리면 무관한 사람이 피해를 본다. 집계 사이트·블로그를 그대로 옮기다 실제로 여러 번 걸렸다(가짜 목록, 오타 핸들, 사진작가 계정 등). 반드시 인스타 페이지를 직접 열어 확인한다. 다음 배치 순서는 `PLANNING.md` §10.

삭제·정정 요청 창구(`/takedown`)와 개인정보 처리방침(`/privacy`)이 붙어 있고, 푸터가 레이아웃에 있어 전 화면에서 닿는다. **삭제 요청 처리 방법은 `src/data/README.md` 의 "내려 달라는 요청이 오면" 을 따른다** — `searching` 으로 되돌리면 다음 배치에서 다시 올라온다.

연락처는 `lib/site.ts` 의 `CONTACT_EMAIL` 한 곳이다. 이 주소는 **실제로 열려 있어야 한다** — 반송되면 사이트가 지키지 못할 약속을 걸어 둔 셈이 된다.

다음: 계정 데이터 채우기 → 그 다음 검색 기능(데이터가 비어 있으면 검색할 게 없어 미뤄 뒀다) → 제보 폼(`PLANNING.md` 로드맵 2단계).

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
