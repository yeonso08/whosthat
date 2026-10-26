#!/usr/bin/env bash
# 하루(KST)의 방문자·페이지뷰·유입 상위·페이지 상위를 Vercel Web Analytics 에서 뽑아 JSON 한 줄로 낸다.
# 노션 운영 일지(docs/DAILY_LOG.md)를 채울 때 쓴다.
#
#   scripts/daily-metrics.sh            # 어제(KST)
#   scripts/daily-metrics.sh 2026-10-25
#
# 로그인된 vercel CLI 를 쓰고, VERCEL_TOKEN 이 있으면 그걸 쓴다(클라우드 예약 작업).
set -euo pipefail

# .vercel/project.json 은 gitignore 라 클라우드 체크아웃에는 없다 — 값을 박아 둔다.
PROJECT="prj_ZZ8jcmwCViDqp4P7hvY3rSGzSIyr"
SCOPE="team_vZDYqfZnjagaoFwB6eL1vfwP"
# --group-by 결과에서 날마다 몇 개를 남길지 — 노션 칸 하나에 들어가는 만큼.
TOP_N=3
# 유입 경로를 숫자 칸(channels)으로 셀 때 받을 리퍼러 수 — 구글처럼 상위 3에 못 드는 경로까지 잡히게 넉넉히.
REFERRER_LIMIT=50
METRIC="vercel.analytics_pageview.count"

day="${1:-$(TZ=Asia/Seoul date -v-1d +%F 2>/dev/null || TZ=Asia/Seoul date -d yesterday +%F)}"

# KST 하루 = 전날 15:00Z ~ 당일 15:00Z
since="$(node -e 'const d=new Date(process.argv[1]+"T00:00:00+09:00");console.log(d.toISOString())' "$day")"
until="$(node -e 'const d=new Date(process.argv[1]+"T00:00:00+09:00");d.setUTCDate(d.getUTCDate()+1);console.log(d.toISOString())' "$day")"

auth=()
[[ -n "${VERCEL_TOKEN:-}" ]] && auth=(--token "$VERCEL_TOKEN")

# JSON 이 진행 메시지와 함께 stderr 로 섞여 나와서 2>&1 후 첫 `{` 부터 닫는 `}` 까지만 자른다.
# 클라우드에서는 그 뒤에 `npm notice`(새 버전 안내)가 붙어 파싱이 깨졌다 — 안내도 끈다.
# Hobby 요금제는 최근 31일만 준다 — 그보다 옛날 날짜는 에러가 난다.
query() {
  npm_config_update_notifier=false npx --yes vercel@59.11.7 metrics "$METRIC" "$@" --prod -s "$since" -u "$until" \
    --project "$PROJECT" --scope "$SCOPE" --json ${auth[@]+"${auth[@]}"} 2>&1 | sed -n '/^{/,/^}/p'
}

pv="$(query)"
uv="$(query -a unique/visitor_id)"
# -l 은 "기간 전체 상위 N" 이라 하루 범위로만 질의해야 그날의 상위가 나온다.
ref="$(query -a unique/visitor_id --group-by referrer_hostname -l "$REFERRER_LIMIT")"
path="$(query -a unique/visitor_id --group-by request_path -l "$TOP_N")"

node -e '
const [day, topN, ...raw] = process.argv.slice(1);
const [pv, uv, ref, path] = raw.map((s) => JSON.parse(s));
for (const r of [pv, uv, ref, path]) if (r.error) { console.error(r.error.message); process.exit(1); }
const val = (r) => Object.entries(r).find(([k]) => k.startsWith("vercel_"))?.[1] ?? 0;
const top = (r, key) => r.summary.filter((x) => val(x)).sort((a, b) => val(b) - val(a))
  .map((x) => ({ [key]: x[key] || "(직접)", visitors: val(x) }));
// 경로별 방문자 — 호스트별 순방문자를 더한 값이라, 한 사람이 두 호스트로 오면 두 번 센다(거의 없다).
const CHANNELS = {
  naver_search: /(^|\.)search\.naver\.com$/,
  naver_blog: /(^|\.)blog\.naver\.com$/,
  google: /(^|\.)google\.[a-z.]+$/,
};
const channels = Object.fromEntries(Object.entries(CHANNELS).map(([name, re]) =>
  [name, ref.summary.filter((x) => re.test(x.referrer_hostname || "")).reduce((n, x) => n + val(x), 0)]));
console.log(JSON.stringify({
  date: day,
  visitors: val(uv.summary[0] ?? {}),
  pageviews: val(pv.summary[0] ?? {}),
  referrers: top(ref, "referrer_hostname").slice(0, Number(topN)),
  channels,
  pages: top(path, "request_path"),
}));
' "$day" "$TOP_N" "$pv" "$uv" "$ref" "$path"
