# 시청자 투표 — 전체 흐름

2026-11-22 에 만들었다. 나는 솔로·나솔사계 회차마다 시청자가 "이번 회 마음에 든 솔로남·솔로녀" 를 한 명씩 고르고, 회차별 1위를 그 기수의 실제 최종 선택과 나란히 본다. 매주 다시 올 이유를 만드는 게 목적이다.

이 문서는 **무엇이 어디서 어떤 순서로 일어나는지**를 처음부터 끝까지 적는다. 지켜야 할 규칙의 요약은 `CLAUDE.md` 의 "시청자 투표", 만든 경위(결정·반려·사고)는 `docs/HISTORY.md` §47 이다.

---

## 1. 한눈에

```
[빌드 때]  Vercel 빌드 ── GET /programs ──▶ api.nukko.net(OCI) ──▶ Supabase(뭄바이)
              │  후보 명단·회차·방송일을 HTML 에 굽는다
              ▼
[방문 때]  방문자 브라우저 ── 정적 HTML(/ko/vote, 기수 화면, 회차 글) ◀── Vercel CDN
              │
              ├─ GET  /votes/{프로그램}/{기수}/{방송일}   현황(열림·마감·표 수)
              ├─ POST /votes/{프로그램}/{기수}/{방송일}   한 표
              └─ GET  /votes/{프로그램}                   회차별 결과 전부
                        ▼
                  api.nukko.net(OCI, FastAPI) ── SQL 한 문장 ──▶ Supabase episode_votes
```

- **페이지는 전부 정적이다.** 투표 화면도 빌드 때 구운 HTML 이고, 표 수·열림 여부만 브라우저가 API 에서 읽는다. API 가 죽어도 사이트는 뜬다(투표 숫자만 안 나온다).
- **이 API 경로(`/votes`)는 방문자 브라우저가 부르는 유일한 API 다.** 나머지 API 는 빌드와 관리자만 부른다.
- 로그인·쿠키가 없다. "한 사람" 은 브라우저가 만든 무작위 토큰 하나다.

### 정해 둔 것 (사용자 결정)

| 결정 | 내용 |
|---|---|
| 순위는 전원 공개 | 0표·꼴찌도 보여 준다("다 보여 줄 거야"). |
| 저장은 OCI API | Vercel 함수 + DB 안은 팀 예산 $1 을 넘으면 사이트가 통째로 멈춰서 접었다. |
| 주간 투표만 | 연말 "올해의 인기남·인기녀" 월드컵은 올해 하지 않는다. |
| 전용 화면 | 처음엔 회차 글 맨 아래 상자였다 — "위치가 마음에 안 든다" 로 `/ko/vote` 로 뺐다. |
| 들어오는 길 | 홈 "모아 보기" 줄 + 방영 중 기수 화면 칩 + 투표가 열린 회차 글 칩(사용자가 1·2번 안을 골랐다). |
| 브라우저 데이터는 TanStack Query | 브라우저에서 부르는 화면이 늘어날 것이라. |

---

## 2. 어디에 무엇이 있나

### 누꼬 사이트 (`whosthat`)

| 파일 | 하는 일 |
|---|---|
| `src/app/[lang]/vote/page.tsx` | 투표 화면. 한국어만(다른 언어는 404), `noindex`. 프로그램 탭 → "진행 중인 투표" + "회차별 결과". |
| `src/components/episode-vote.tsx` | 투표함(클라이언트). 후보 고르기 → 투표 → 순위. |
| `src/components/vote-history.tsx` | 회차별 결과(클라이언트). 회차마다 솔로남·솔로녀 1위 + 기수의 최종 선택. |
| `src/components/vote-chip.tsx` | 칩(클라이언트). `시청자 투표 중 · 현재 1위 영호, 현숙 ›`. |
| `src/components/query-provider.tsx` | TanStack Query 클라이언트. 루트 레이아웃 본문을 감싼다. |
| `src/lib/vote-queries.ts` | 쿼리 키·GET 두 개·POST 한 개. 브라우저 호출은 전부 여기를 거친다. |
| `src/lib/vote.ts` | 투표 프로그램 목록, 투표할 회차 고르기, 순위 셈, 마감 시각 셈, 마감 표기. |
| `src/lib/data.ts` | `episodeVotesUrl`·`programVotesUrl` — API 주소를 만든다(`NUKKO_API_URL`). |
| `src/lib/links.ts` | `VOTE_PATH = "/vote"`, `voteHref(locale)`. |
| `src/lib/template.ts` | `fill()` — 클라이언트도 쓰려고 `i18n.ts` 에서 뺐다. |
| `src/lib/types.ts` | `VoteCandidate`·`VoteResults`·`ProgramVotes`. |
| `src/dictionaries/*.json` | `episodeVote`(투표함 문구)·`vote`(화면·칩 문구)·`privacy.visitor4`. |
| 홈·기수 화면·회차 글 페이지 | 들어오는 길(아래 4절). |

### API (`nukko-admin-api`)

| 파일 | 하는 일 |
|---|---|
| `app/routers/votes.py` | `/votes` 세 경로. 열림 판단·IP 해시·SQL. |
| `app/database.py` | `vote_engine`(투표 전용 연결)·`warm_vote_connection`(1분마다 데우기). |
| `app/main.py` | 라우터 등록, CORS, 앱 시작 때 데우기 시작(lifespan). |
| `app/config.py` | `public_origins` — 브라우저가 부르는 곳의 CORS 기본값. |
| `app/schemas.py` | `VoteIn`(요청)·`VoteResultsOut`(응답). |
| `app/models.py` | `EpisodeVote` 모델. |
| `schema.sql` 맨 아래 "시청자 투표" | `episode_votes` 표. |

---

## 3. 데이터 — `episode_votes` 표

| 칸 | 뜻 |
|---|---|
| `id` | 일련번호. |
| `program_id`·`season_id`·`air_date` | 어느 회차인지. **회차 id 가 아니라 방송일**로 가리킨다 — 회차 id 는 백업에서 되살리면 바뀌고, 방송일은 회차 글 주소이기도 하다. |
| `member_id` | 고른 출연자(`cast_members.id`, 예: `s34-hyeonsuk`). |
| `gender` | `male`/`female`. 출연자의 성별을 API 가 `people.gender` 에서 옮겨 적는다(브라우저가 보내지 않는다). |
| `voter` | 브라우저 토큰(16~64자, 영문·숫자·`-`). |
| `ip_hash` | 접속 IP 를 비밀키로 HMAC 한 값. 원래 IP 는 저장하지 않는다. 사설·루프백 주소면 빈 문자열. |
| `created_at` | 넣은 시각. |

제약:

- **`unique (program_id, season_id, air_date, gender, voter)`** — 한 토큰은 한 회차에 솔로남 한 표·솔로녀 한 표. 성별 칸을 둔 이유가 이 제약이다.
- 회차 외래키 `on update cascade on delete cascade` — 관리자에서 방송일을 고치면 표가 따라 옮겨 가고, 회차를 지우면 표도 지워진다.
- 출연자 외래키 `on delete cascade` — 출연자를 지우면 그 사람 표도 지워진다.
- 인덱스 `(program_id, season_id, air_date, gender, ip_hash)` — IP 상한을 셀 때 쓴다.
- RLS 를 켜 두었다(Supabase 의 공개 키로는 못 읽는다 — API 만 읽는다).
- **매일 백업(`GET /programs`)에 안 들어간다.** 표는 사라져도 되는 재미용 데이터로 본다.
- 투표는 정적 페이지 내용이 아니라서 `seasons.updated_at` 을 올리지 않는다("사이트에 반영" 대기 수도 안 오른다).

---

## 4. 규칙

### 어느 회차가 투표 대상인가

`lib/vote.ts` 의 `votableEpisode(programId, season)`:

1. 프로그램이 `VOTE_PROGRAMS`(`i-am-solo`, `i-am-solo-love-goes-on`)에 있고
2. 기수가 방영 중(`season.onAir`)이면
3. **그 기수의 마지막 회차** 하나.

계약결혼은 두 쌍뿐이라 고를 게 없어서, 솔로지옥은 회차 글이 없어서 뺐다. 이 함수는 **빌드 때** 화면이 칩·투표함을 걸지 정하는 기준이다. 실제로 열렸는지는 API 가 정한다.

### 언제 열리고 닫히나

- **열림 = 그 기수의 마지막 회차 && 지금 < 방송일 + 7일 22:00(KST).**
- 나는 솔로(수 22:30)·나솔사계(목 22:30) 모두 다음 회 방송 30분 전에 닫힌다 — 다음 회를 보고 지난 회에 찍는 일이 없다.
- 마감 전이라도 관리자가 **다음 회차 글을 넣으면 그 순간 닫힌다**(더는 마지막 회차가 아니다).
- **같은 규칙이 두 곳에 있다**: API `votes.py` 의 `_closes_at`(`VOTE_WINDOW = 7일`, `VOTE_CLOSE_TIME = 22:00`)과 사이트 `vote.ts` 의 `voteClosesAt`(`VOTE_WINDOW_DAYS = 7`, `VOTE_CLOSE_TIME = "22:00:00"`). 사이트 쪽은 API 답을 기다리지 않고 화면을 그리려는 것이다. **바꾸면 둘 다 바꾼다.** 어긋나도 표를 막는 건 API 라 잘못 들어가지는 않고, API 답이 오면 화면이 API 값으로 바뀐다.

### 한 사람 한 표

- 토큰: 브라우저 localStorage `nukko:voter`. 처음 투표할 때 `crypto.randomUUID()` 로 만든다.
- 같은 토큰이 같은 회차·같은 성별에 또 찍으면 **조용히 무시**한다(첫 표가 남는다, 200 으로 현황을 돌려준다).
- 토큰을 지우거나 다른 브라우저를 쓰면 다시 찍을 수 있다 — 재미용이라 받아들인다.

### IP 상한

- 한 IP(해시)가 한 회차·한 성별에 넣을 수 있는 표는 **30**(`VOTES_PER_IP`). 넘으면 429.
- 1로 두지 않는 이유: 통신사 휴대폰 망은 많은 사람이 IP 하나를 함께 쓴다.
- IP 는 nginx 가 넘긴 `X-Forwarded-For` 를 uvicorn 이 풀어 `request.client.host` 에 넣은 값이다(nginx 는 `$proxy_add_x_forwarded_for` 로 넘긴다 — 2026-11-22 확인).
- 사설·루프백 주소가 보이면(프록시 설정이 깨진 경우) 해시를 `None` 으로 두고 상한을 건너뛴다. 그 값으로 상한을 걸면 모든 방문자가 한 IP 로 묶여 서른 표 뒤에 투표가 멈춘다.
- 해시 키: `supabase_secret_key + "|episode-votes"`, HMAC-SHA256.

### 순위

`lib/vote.ts` 의 `rankVotes(candidates, counts)`:

- 후보 **전원**을 싣는다(0표 포함).
- 표가 많은 순, 같으면 명단 순서(방송 순서).
- 같은 표면 같은 등수(예: 1위·1위·3위).
- 퍼센트는 그 성별 총표 대비 반올림 정수 — 합이 100 이 안 될 수 있다.

---

## 5. 빌드 때 일어나는 일

"사이트에 반영"(Deploy Hook) 또는 main 머지로 Vercel 이 빌드할 때:

1. `lib/data.ts` 가 `GET /programs` 로 전 데이터를 받는다.
2. `/ko/vote` 를 굽는다:
   - `VOTE_PROGRAMS` 에 든 프로그램만 탭으로 만든다(없으면 404).
   - 탭마다 `votableEpisode` 로 "진행 중인 투표" 회차를 고른다. 없으면 `지금 열린 투표가 없습니다…` 한 줄.
   - 있으면 `EpisodeVote` 를 그린다 — 넘기는 것: 머리(기수 · 방송일 · 회차 제목 링크), `endpoint`(`episodeVotesUrl`), `airDate`, 후보 명단(`id`·`alias`·`gender`·`profileImageUrl`), 문구, 언어.
   - "회차별 결과" 에 `VoteHistory` — 넘기는 것: `programVotesUrl`, 회차가 있는 기수 전부(최신 회차부터, 날짜 라벨·제목·글 주소), 최종 커플(`getFinalCouples` — 없으면 `undefined` = 최종 선택 전, 빈 배열 = 커플 없음).
3. 기수 화면·회차 글에 칩을 걸지 정한다(아래 6절).
4. **이 시점의 HTML 에 투표함이 이미 들어간다** — 후보 사진·이름·"한 명을 고르세요" 버튼·마감 안내까지. 서버 렌더에서는 "열림" 으로 그린다(아래 7절의 시계 이야기).

API 주소는 빌드 환경변수 `NUKKO_API_URL` 이다(운영 `https://api.nukko.net`, 로컬은 보통 운영 주소이고 로컬 API 로 시험할 때만 `http://localhost:8011` 등).

---

## 6. 방문자가 들어오는 길

방문자는 대부분 검색으로 기수 화면·회차 글에 바로 착지한다 — 홈 줄만으로는 투표가 안 보였다.

| 자리 | 조건 | 모양 |
|---|---|---|
| 홈 "모아 보기" | 한국어 홈 + 회차 글이 1편 이상 | `시청자 투표` 줄(분홍 아이콘 원) |
| 기수 화면 머리글 | 한국어 + `votableEpisode` 가 있는 기수(방영 중 · 투표 프로그램) | `VoteChip`, 머리글 맨 끝 한 줄 |
| 회차 글 제목 아래 | 그 회차가 `votableEpisode`(기수의 마지막 회차) | `VoteChip`, 방송일 줄 아래 |
| 회차 글 맨 아래 목록 판 | 같은 조건 | `이번 회 시청자 투표` 줄 |

- 칩은 흑백이다(기수 화면은 유채색을 안 쓴다). 머리글 안 한 줄이라 명단을 밀어 내리지 않는다.
- 칩에 날짜를 넣지 않는다 — 휴대폰에서 1위 이름이 잘렸다.
- **상단 바에는 걸지 않는다**(모음 화면을 상단 바에 건 안은 이미 반려됐다).

### 칩이 하는 일 (`vote-chip.tsx`)

1. HTML 에 `시청자 투표 중 ›` 만 있는 칩이 이미 있다(처음부터 그려 둔다 — 나중에 나타나면 머리글이 한 번 밀린다).
2. 브라우저가 `useQuery(episodeVotesQuery(endpoint))` 로 그 회차 현황을 읽는다.
3. 답이 `open: false` 면 칩을 감춘다.
4. 열려 있으면 성별마다 1위를 붙인다: `현재 1위 영호, 현숙`. 같은 표면 `영수·영호` 처럼 `·` 로 잇고, 표가 0 인 성별은 뺀다. 두 성별 다 0 이면 `시청자 투표 중` 만 남는다.
5. 누르면 `/ko/vote` 로 간다. 투표 화면은 같은 쿼리 키를 쓰므로 **30초 안에 넘어가면 현황을 다시 부르지 않고 캐시를 쓴다**.

---

## 7. `/ko/vote` 를 열었을 때 — 단계별

### ① HTML 받기

Vercel CDN 이 구워 둔 HTML 을 준다(서버 계산 없음). 이 안에 제목·설명·탭·**투표함(후보 격자·"한 명을 고르세요"·마감 안내)**·"회차별 결과" 제목이 다 있다. 투표함 숫자 자리는 비어 있다.

### ② 하이드레이션 — 브라우저가 화면을 넘겨받기

`EpisodeVote` 가 브라우저에서 깨어나며 세 가지를 본다.

1. **내가 전에 찍은 사람** — `useStoredPick(endpoint, gender)` 가 localStorage `nukko:vote:{endpoint}:{male|female}` 를 읽는다. `useSyncExternalStore` 라서 서버 값은 "없음", 브라우저 값은 저장소 — 하이드레이션 불일치 없이 바로 바뀐다. 찍은 적이 있으면 그 성별 판이 곧바로 순위 목록으로 바뀐다(숫자는 아직 `·`).
2. **셈한 마감이 지났는지** — `useOpenByClock(voteClosesAt(airDate))`. 서버 값은 언제나 "열림"(빌드 시각으로 정하면 마감 뒤 방문자에게 HTML 과 화면이 어긋난다), 브라우저 값은 지금 시계. 지났으면 API 답이 올 때까지 투표함을 감춘다.
3. **현황 불러오기 시작** — `useQuery(episodeVotesQuery(endpoint))`.

### ③ 현황 요청 — `GET /votes/{프로그램}/{기수}/{방송일}`

예: `GET https://api.nukko.net/votes/i-am-solo/s34/2026-11-18`

API 안에서:

1. `_fetch` 가 투표 전용 연결(`vote_engine`)을 하나 받는다 — 1분마다 데워 둔 연결이라 새로 열지 않는다.
2. **SQL 한 문장**(`_GET_SQL`)으로 세 가지를 한 번에 읽는다:
   - 그 기수의 마지막 방송일(`max(air_date)`)
   - 이 방송일 회차가 있는지(`bool_or(air_date = :air_date)`)
   - 이 회차의 출연자별 표 수(`group by member_id`) — 표가 없어도 첫 줄이 남게 `left join … on true`
3. 회차가 없으면 **404**.
4. `open = (방송일 == 마지막 방송일) && 지금 < 마감`.
5. 응답:

```json
{
  "open": true,
  "closesAt": "2026-11-25T22:00:00+09:00",
  "counts": { "s34-yeongho": 2, "s34-hyeonsuk": 2, "s34-sangcheol": 1 }
}
```

표가 0 인 출연자는 `counts` 에 키가 없다 — 사이트가 명단으로 0 을 채운다.

### ④ 화면 채우기

- 답이 오면 `loaded = true` → 판 머리에 `3표`, 순위 목록이면 `60% · 3표` 와 막대가 찬다.
- `open: false` 이고 표가 하나도 없으면 투표함 자리에 `fallback`(`지금 열린 투표가 없습니다…`).
- `open: false` 인데 표가 있으면 `투표가 끝났습니다.` + 두 성별 순위(고르기 없이).
- API 가 실패하면(1번 재시도 뒤) 투표함을 감춘다 — 숫자 없는 상자가 깨진 채로 남는 것보다 낫다.

### ⑤ 회차별 결과 — `GET /votes/{프로그램}`

`VoteHistory` 가 탭 하나에 한 번 부른다(`useQuery(programVotesQuery(endpoint))`).

API 는 SQL 한 문장(`group by season_id, air_date, member_id`)으로:

```json
{ "s34": { "2026-11-18": { "s34-yeongho": 2, "s34-hyeonsuk": 2 } } }
```

화면은 **표가 있는 회차만** 그린다. 기수마다 판 하나:

- 회차 줄: 방송일 · 회차 제목(글 링크) · `솔로남 1위 영호 67% · 2표` · `솔로녀 1위 현숙 67% · 2표`(공동 1위는 `·` 로 잇는다, 표 없으면 `표 없음`)
- 판 맨 아래: `최종 선택` — `최종 선택 전` / `최종 커플 없음` / `영철♥정숙`(파랑·장미색 하트·분홍)

표가 쌓인 회차가 하나도 없으면 `아직 쌓인 결과가 없습니다.` API 가 실패해도 같은 문장이다.

### 투표함 화면 상태 정리

| 상태 | 판 머리 | 판 안 |
|---|---|---|
| 현황 오기 전, 안 찍음 | 비어 있음 | 후보 격자 + 버튼 |
| 현황 오기 전, 전에 찍음 | 비어 있음 | 순위 목록, 숫자 자리 `·`, 막대 0 |
| 현황 옴, 열림, 안 찍음 | `N표` | 후보 격자 + 버튼 |
| 현황 옴, 열림, 찍음 | `N표` | 순위 목록 + `내 선택` 배지 |
| 투표 보내는 중 | 비어 있음 | 순위 목록(내 표 반영), 숫자 자리 `·` |
| 저장 실패 | 비어 있음 또는 `N표` | 후보 격자로 되돌아감 + `투표를 보내지 못했습니다…` |
| 닫힘, 표 있음 | `N표` | 순위 목록, 위에 `투표가 끝났습니다.` |
| 닫힘, 표 없음 | — | `fallback` 한 줄 |
| 셈한 마감 지남 + 현황 오기 전 | — | 아무것도 없음(답을 기다린다) |
| API 실패 | — | 아무것도 없음 |

---

## 8. 투표 버튼을 눌렀을 때 — 단계별

### ① 고르기

후보 사진을 누르면 테두리가 성별 색(`ring-he`/`ring-she`)으로 바뀌고 버튼이 `영호에게 투표` 가 된다. 이건 화면 안 상태뿐이다.

### ② 누르는 순간 (`useMutation` 의 `onMutate`)

서버에 보내기 **전에** 화면을 먼저 바꾼다(낙관적 반영):

1. 이 회차 현황 불러오기를 멈춘다(`cancelQueries`) — 늦게 온 현황(내 표가 빠진)이 덮어쓰지 않게.
2. 지금 캐시(`before`)를 기억해 둔다.
3. 캐시의 그 사람 표에 +1 한다(현황을 아직 못 받았으면 빈 현황에서 시작).
4. localStorage `nukko:vote:{endpoint}:{gender}` 에 고른 사람을 적는다.
5. "내 선택" 을 표시하고 그 성별 판을 순위 목록으로 바꾼다.
6. 숫자 자리는 `·` 로 비운다 — 내 표만 더한 `1표 · 100%` 는 진짜 현황이 아니다(`loaded` 는 보내는 중이면 거짓).

로컬 측정: 버튼에서 "내 선택" 까지 0.03~0.04초.

### ③ 서버로 — `POST /votes/{프로그램}/{기수}/{방송일}`

브라우저가 보내는 본문:

```json
{ "memberId": "s34-yeongho", "voter": "1f0c2a8e-…" }
```

`voter` 는 `nukko:voter` 토큰(없으면 이때 만든다). CORS 사전 요청(OPTIONS)이 먼저 한 번 간다(`Content-Type: application/json` 이라서) — nginx·FastAPI 가 바로 답해서 0.02초쯤이다.

API 안에서:

1. 본문 검사(Pydantic) — `voter` 가 16~64자·영문/숫자/`-` 가 아니면 **422**. 방송일 형식이 틀려도 422.
2. IP 해시를 만든다(위 4절).
3. **SQL 한 문장**(`_POST_SQL`)으로 전부 한다:
   - `episode` — 마지막 방송일 · 이 회차가 있는지
   - `member` — 이 기수의 그 출연자 성별(`cast_members` ⨝ `people`)
   - `used` — 이 IP 해시가 이 회차·이 성별에 넣은 표 수
   - `inserted` — 조건이 다 맞을 때만 한 줄 넣는다: 마지막 회차 && 마감 전(`in_time` 은 API 가 셈해 넘긴다) && (상한 미적용 || used < 30). 같은 토큰·성별이면 `on conflict do nothing`.
   - 마지막에 그 회차 출연자별 표 수
4. 돌려받은 값으로 결과를 가린다(이 순서):
   - 회차가 없으면 **404** `회차가 없습니다`
   - 닫혔으면 **403** `투표가 닫혔습니다`
   - 그 기수 출연자가 아니면 **422** `이 기수의 출연자가 아닙니다`
   - 상한에 걸렸으면 **429** `이 네트워크에서 너무 많이 투표했습니다`
   - 아니면 **200** + 현황
5. 같은 문장 안의 집계는 넣기 전 스냅숏이라 방금 넣은 표가 안 보인다 — `inserted` 가 있으면 그 사람에 +1 해서 돌려준다.
6. 이미 찍은 토큰(중복)은 넣지 않고 200 + 현황(첫 표가 남는다).

autocommit 연결이라 BEGIN·COMMIT 왕복이 없고, 한 문장이라 그래도 원자적이다. 쉬던 연결이 끊겨 있었으면 새 연결로 한 번 더 한다 — 같은 토큰은 `on conflict` 가 걸러서 두 번 들어가지 않는다.

### ④ 성공 (`onSuccess` → `onSettled`)

1. 서버가 준 현황으로 캐시를 바꾼다 → 숫자·막대가 찬다(`60% · 3표`).
2. **`votes` 키 아래 쿼리를 전부 무효화한다**(`invalidateQueries({ queryKey: ["votes"] })`) → 같은 화면의 "회차별 결과"(`GET /votes/{프로그램}`)가 다시 불려 **새로고침 없이 바뀐다.** 기다리지 않는다(`void`) — 기다리면 그동안 투표가 "보내는 중" 으로 남아 숫자가 비어 있다.

### ⑤ 실패 (`onError`)

네트워크 오류·403·429·500 모두:

1. 캐시를 `before` 로 되돌린다. 현황을 받기 전이었으면(`before` 없음) `resetQueries` 로 비우고 다시 부른다 — `setQueryData(undefined)` 는 TanStack Query 가 무시해서 내 표가 남는 구멍이 있었다.
2. localStorage 의 내 선택을 지운다.
3. 그 성별 판을 후보 격자로 되돌리고 `투표를 보내지 못했습니다. 잠시 뒤 다시 해 주세요.` 를 띄운다.
4. `onSettled` 의 무효화로 현황을 다시 읽는다 — 마감이었으면 `투표가 끝났습니다.` 로 바뀐다.

---

## 9. TanStack Query

- 설치: `@tanstack/react-query` 5.
- `QueryProvider`(`components/query-provider.tsx`)가 루트 레이아웃의 본문(`{children}`)을 감싼다. 클라이언트는 컴포넌트 상태에 하나 — 서버 렌더마다 새로 만들어 요청 사이에 캐시가 새지 않는다.
- 기본값: `staleTime` 30초(그 안에는 같은 현황을 다시 부르지 않는다), `retry` 1번. 창에 다시 들어오면(포커스) 30초가 지났을 때 다시 부른다(v5 기본).
- 쿼리 키 (`lib/vote-queries.ts`):

| 키 | 불러오기 | 쓰는 곳 |
|---|---|---|
| `["votes", "episode", endpoint]` | `GET /votes/{p}/{s}/{date}` | 투표함, 칩 |
| `["votes", "program", endpoint]` | `GET /votes/{p}` | 회차별 결과 |

- 한 표 넣기는 `postVote(endpoint, memberId, voter)` — `useMutation` 이 부른다.
- **브라우저에서 부르는 데이터가 새로 생기면 `fetch` + `useEffect` 로 짜지 말고 이 방식으로 쿼리 파일을 둔다.** 정적 페이지의 데이터는 지금처럼 빌드 때 `lib/data.ts` 가 읽는다 — Query 로 옮기지 않는다(빌드 서버 코드라 hook 을 못 쓰고, 옮기면 사이트가 정적이 아니게 된다).

---

## 10. API 연결과 속도

### 왜 신경 쓰나

Supabase `nukko` 프로젝트가 **뭄바이(`ap-south-1`)** 에 있다. OCI 서버(한국)에서 재면(2026-11-22):

| | 시간 |
|---|---|
| 브라우저 → OCI | 0.01초 |
| OCI → 서울 리전(비교용) 한 번 왕복 | 0.005초 |
| OCI → 뭄바이 한 번 왕복 | **0.15초** |
| 질의 하나(asyncpg 준비 + 실행) | 0.29초 |
| 새 DB 연결 열기(TLS·인증) | 1초 이상 |
| 투표 집계 SQL 자체 실행 | 0.0002초 |

처음 짠 대로(연결 확인 + 질의 3~5개 + BEGIN·COMMIT)는 현황 1~1.5초, 한 표 2~3초였다.

### 지금 구성

- **요청 하나 = SQL 한 문장 = DB 왕복 한 번.** 질의를 쪼개 더하지 말 것 — 하나 늘 때마다 0.15~0.3초씩 는다.
- **투표 전용 연결 `vote_engine`**: `isolation_level="AUTOCOMMIT"`(BEGIN·COMMIT 왕복 없음), `pool_pre_ping` 없음(요청마다 SELECT 1 왕복 없음), `pool_size=3`·`max_overflow=2`, `pool_recycle=1800`, `pool_use_lifo=True`. 관리자 경로(`engine`)는 그대로다.
- **데우기 `warm_vote_connection`**: 앱이 뜨면(lifespan) 백그라운드로 1분마다 `select 1`. LIFO 라 방문자도 그 연결을 먼저 받는다. 첫 배포는 연결을 4분마다 갈게 둬서 한동안 조용하다 온 첫 방문자가 새 연결 때문에 2.5초를 기다렸다 — 데우기로 막았다.
- 끊긴 연결이면 `_fetch` 가 새 연결로 한 번 더 한다.

운영 측정(데운 뒤): 현황 0.17초, 한 표 0.17초, 6분 쉰 뒤 첫 요청 0.19초.

### 서울로 옮긴다면

Supabase 는 지역을 바꿀 수 없어 새 프로젝트로 이사해야 한다. 무료 활성 프로젝트 한도(2개)가 `nukko`(뭄바이)·`keywi-db`(us-east-1)로 차 있어, Pro 로 잠깐 올리거나 keywi-db 를 멈춰야 한다. 결정 대기다(`docs/PROGRESS.md`).

---

## 11. 브라우저에 남는 것과 서버에 남는 것

| 어디 | 무엇 | 왜 |
|---|---|---|
| 브라우저 localStorage `nukko:voter` | 무작위 토큰 | 한 사람 한 표 |
| 브라우저 localStorage `nukko:vote:{endpoint}:{gender}` | 내가 고른 출연자 id | "내 선택" 표시, 새로고침 뒤 순위 바로 보이기 |
| 서버 `episode_votes` | 출연자·성별·토큰·IP 해시·시각 | 집계, 중복·상한 |

- 쿠키는 없다. 사생활 보호 창이거나 저장소가 막혀 있어도 투표는 된다(저장이 안 되면 새로고침 뒤 다시 찍을 수 있다 — IP 상한은 남는다).
- 처리방침 `/privacy` 의 `visitor4`(투표 토큰·IP 해시)와 `processor`(Oracle·Supabase)가 이 사실을 말한다. **방식을 바꾸면 그 문장부터 고친다**(ko·en·ja + `effectiveDate`).

---

## 12. 문구

`src/dictionaries/ko.json` (투표 화면이 한국어만 있어도 사전 세 벌의 키는 맞춰 둔다 — `Dictionary = typeof ko`).

- `episodeVote` — `deadline`(`{date}까지 투표할 수 있습니다.`), `closed`, `male`/`female`(솔로남/솔로녀), `votes`(`{count}표`), `submit`(`{name}에게 투표`), `choose`(`한 명을 고르세요`), `mine`(`내 선택`), `rank`(`{rank}위`), `error`, `note`.
- `vote` — 화면 제목·설명·안내(`heading`·`metaTitle`·`description`·`lead`·`summary`), `liveHeading`·`liveEmpty`·`aired`(`{season} · {date} 방송`), `historyHeading`·`historyEmpty`·`topMale`·`topFemale`·`none`·`finalLabel`·`finalNone`·`finalPending`, 회차 글 맨 아래 줄 `episodeLink`·`episodeLinkSummary`, 칩 `chip`(`시청자 투표 중`)·`chipLeader`(`현재 1위 {names}`).
- 마감 표기는 `formatVoteDeadline` — `11월 25일 (수) 오후 10시`, 시간대는 언제나 `Asia/Seoul`(해외에서 열어도 한국 밤 10시).

---

## 13. 검색엔진

- `/ko/vote` 는 `robots: noindex, follow` + sitemap 에 없다. 크롤러가 받는 HTML 은 후보 이름뿐이라 얇은 화면으로 판정받는다(기수 상세에서 겪었다).
- `/en/vote`·`/ja/vote` 는 404, hreflang 없음.
- 칩·회차 글 줄은 일반 링크라 크롤러가 따라가도 noindex 에서 멈춘다.

---

## 14. 운영

### 배포 순서

1. **DB** — 표를 바꾸면 `schema.sql` 의 해당 절을 운영 Supabase 에 먼저(로컬에 운영 `.env` 가 없으면 OCI 서버의 venv·`.env` 로 실행한다).
2. **API** — OCI 에서 `git pull --ff-only` → **`./venv/bin/python -c "import app.main"` 이 되는지 확인** → `sudo systemctl restart nukko-admin-api`. 서버 Python 이 3.9 라 `str | None` 같은 3.10+ 문법이면 import 에서 죽는다(2026-11-22 첫 배포 때 운영 API 가 2분 502 였다). import 가 안 되면 재시작하지 말고 직전 커밋으로 되돌린다.
3. **사이트** — 작업 브랜치 → dev → main. 거꾸로 하면 투표함이 404 를 받아 안 그려질 뿐 깨지지는 않는다.

### 확인

```bash
# 현황(열림·마감·표)
curl -s https://api.nukko.net/votes/i-am-solo/s34/2026-11-18
# 프로그램 전체
curl -s https://api.nukko.net/votes/i-am-solo
# 속도
curl -s -o /dev/null -w "%{time_total}s\n" https://api.nukko.net/votes/i-am-solo/s34/2026-11-18
# CORS
curl -s -D - -o /dev/null -H "Origin: https://www.nukko.net" https://api.nukko.net/votes/i-am-solo | grep -i access-control
```

**운영에 시험 표를 넣지 않는다.** 속도를 재려면 없는 출연자로 POST 한다(422 가 나고 표는 안 들어간다, 걸리는 시간은 같다).

### 자주 할 일

- **표를 지우려면** — Supabase SQL 로 `delete from episode_votes where …`. 관리자 화면에는 기능이 없다. 사이트 반영은 필요 없다(브라우저가 바로 읽는다).
- **새 프로그램에 투표를 걸려면** — `lib/vote.ts` 의 `VOTE_PROGRAMS` 에 id 를 더한다. 회차 글이 있고 솔로남·솔로녀 여럿이 나오는 프로그램이어야 한다.
- **마감 시각을 바꾸려면** — API `_closes_at` 과 사이트 `voteClosesAt` 둘 다. 처리방침은 그대로다.
- **로컬에서 시험하려면** — 로컬 Postgres + 로컬 API 를 띄우고 `NUKKO_API_URL` 을 로컬 API 로 둔 채 `pnpm dev`. 운영 `.env.local` 은 운영 API 를 가리킨다. CORS 기본값에 `http://localhost:3000` 이 들어 있다.

---

## 15. 알려진 한계

- 토큰을 지우거나 브라우저를 바꾸면 다시 찍을 수 있다(IP 당 30표까지). 재미용이라 받아들였다.
- 표는 매일 백업에 안 들어간다.
- 마감 규칙이 사이트·API 두 곳에 있다(위 4절).
- 같은 브라우저의 다른 탭에서 찍은 것은 그 탭을 새로고침해야 보인다(저장소 변화를 구독하지 않는다).
- 투표 화면은 한국어만 있다.
- DB 가 뭄바이라 데우기가 없으면 느리다 — 데우기 작업이 멈추면(앱 재시작 직후 등) 첫 요청이 1초를 넘을 수 있다.
