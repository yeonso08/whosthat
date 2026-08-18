@AGENTS.md

# whosthat

예능 출연진의 인스타그램 계정을 기수별로 모아 두는 아카이브. 1차 대상은 "나는 솔로", 이후 넷플릭스 프로그램으로 확장한다. 배경과 범위는 `PLANNING.md`에 있다.

## 명령어

```bash
pnpm dev      # 개발 서버 (3000)
pnpm build    # 프로덕션 빌드 — 기수 페이지를 전부 SSG로 뽑는다
pnpm lint
```

## 구조

```
src/app/page.tsx              기수 목록
src/app/seasons/[id]/page.tsx 기수 상세 (generateStaticParams 로 전 기수 프리렌더)
src/lib/types.ts              Program → Season → CastMember 모델
src/lib/data.ts               JSON 로더 + 날짜 포맷
src/data/na-neun-solo.json    실데이터 — 채우는 법은 src/data/README.md
src/components/               cast-card, cast-photo, season-row, season-feature, icons
```

Next.js 16 App Router + Tailwind v4 + shadcn/ui, pnpm. `params` 는 Promise 라 반드시 await 한다.

## 디자인 — 시안 D "어둠 속 사진"

넷플릭스·티빙 브라우징 문법. **UI는 물러나고 사진이 주인공**이다. 시안 캔버스: https://claude.ai/code/artifact/1e0af2e1-9bf1-495e-81a3-961765ac044e (페이지 "새 시안"의 D 아트보드 2장)

- 사이트는 **다크 전용**이다. 라이트 모드가 없으므로 `globals.css` 의 `:root` 자체가 다크 팔레트고, `.dark` 클래스는 쓰지 않는다.
- **색은 흑백뿐이다.** 유일한 유채색 `--searching`(황토 `#d9a44b`)은 "아직 못 찾음" 상태 전용이다. 강조·CTA·배지 같은 다른 용도로 번지게 하지 말 것.
- 폰트: 한글 `Gothic A1`(`--font-sans`), 라틴·숫자 `Manrope`(`--font-lat`). 핸들·날짜·개수처럼 숫자가 섞인 곳은 `font-lat`.
- 모서리 반경 12~16px, 전환 180~220ms.

**색면 포스터풍으로 가지 말 것.** 굵은 디스플레이 서체 + 강한 색면 + 거대한 숫자 조합은 이 프로젝트에서 반복해서 반려됐다. 방향이 애매하면 시안을 더 찍기보다 레퍼런스를 물어보는 게 빠르다.

## 데이터 규칙

- 계정 상태는 `found` / `none` / `searching` 3가지다. **`none`("찾아봤는데 없다")은 결과지 실패가 아니다** — 방문자의 헛수고를 막는 게 이 사이트의 핵심 가치라 별개 상태로 둔다. `searching` 으로 방치하지 말 것.
- **계정을 지어내지 않는다.** 확인한 것만 `found` 로 올린다. 비공개 계정·추정 계정·커뮤니티 추측은 넣지 않는다(`PLANNING.md` §9).
- `found` 는 `lastVerified` 와 `source` 를 반드시 함께 채운다. 이 사이트를 믿을 근거가 그 두 줄이다.
- 사진은 `/public` 아래 로컬 경로(`/cast/s20-oksun.jpg`)로 둔다. 남의 서버 이미지를 핫링크하지 않는다.
- 실명은 공개된 경우에만. 모르면 비우면 가명으로만 나온다.

## 현재 상태

두 화면이 동작하고 빌드가 통과한다. 데이터는 **뼈대만** 있다 — 18~24기의 기수 번호와 가명 로스터만 있고 계정은 전부 `searching` 이라 화면이 "찾는 중"으로 차 있다. 실제 계정을 채우면 그 카드부터 살아난다.

다음: 계정 데이터 채우기 → 그 다음 검색 기능(데이터가 비어 있으면 검색할 게 없어 미뤄 뒀다) → 제보 폼(`PLANNING.md` 로드맵 2단계).
