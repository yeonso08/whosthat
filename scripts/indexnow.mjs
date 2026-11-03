// IndexNow — 라이브 sitemap 에서 지난번과 달라진 주소만 골라 Bing·네이버 등에 알린다.
//
// 빌드가 아니라 배포가 끝난 "라이브" sitemap 을 읽는다. 빌드 중에 알리면 크롤러가
// 아직 옛 화면을 받아 간다. 바뀌었는지는 `lastmod`(DB 의 `updatedAt`)로 가르고,
// 지난번 sitemap 은 스냅숏 파일로 들고 다닌다(워크플로가 Actions 캐시에 넣는다).
//
//   node scripts/indexnow.mjs <스냅숏 경로>          알리고 스냅숏을 새로 쓴다
//   node scripts/indexnow.mjs <스냅숏 경로> --dry-run  보낼 목록만 출력한다
//
// 구글은 IndexNow 를 안 받는다 — 거기는 지금처럼 sitemap 이 맡는다.

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const HOST = "www.nukko.net";
// public/<KEY>.txt 와 짝이다. 엔진이 그 파일을 열어 키가 이 사이트 것인지 확인한다.
const KEY = "5669a365ebc9d9ec6d1428d840bb862a";
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
// 한 곳에 보내면 참여 엔진(Bing·네이버·Yandex·Seznam …)끼리 나눠 갖는다.
const ENDPOINT = "https://api.indexnow.org/indexnow";
// 규격상 한 번에 1만 개까지다. 지금 sitemap 은 그 100분의 1 남짓이다.
const MAX_URLS_PER_REQUEST = 10_000;

const [snapshotPath, flag] = process.argv.slice(2);
if (!snapshotPath) {
  console.error("사용법: node scripts/indexnow.mjs <스냅숏 경로> [--dry-run]");
  process.exit(2);
}
const dryRun = flag === "--dry-run";

const current = await fetchSitemap();
const previous = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, "utf8"))
  : {};

// 새로 생겼거나 lastmod 가 바뀐 주소 + sitemap 에서 빠진 주소(삭제·noindex 전환).
// 빠진 주소도 알리는 건 IndexNow 규격이 그걸 요구해서다 — 엔진이 다시 와서 404·noindex 를 본다.
const changed = [
  ...Object.keys(current).filter((url) => previous[url] !== current[url]),
  ...Object.keys(previous).filter((url) => !(url in current)),
];

console.log(`sitemap ${Object.keys(current).length}줄, 알릴 주소 ${changed.length}개`);
for (const url of changed) console.log(`  ${url}`);

if (dryRun || changed.length === 0) {
  if (!dryRun) writeFileSync(snapshotPath, JSON.stringify(current, null, 2));
  process.exit(0);
}

for (let i = 0; i < changed.length; i += MAX_URLS_PER_REQUEST) {
  await submit(changed.slice(i, i + MAX_URLS_PER_REQUEST));
}
// 보내는 데 성공했을 때만 스냅숏을 옮긴다 — 실패하면 다음 실행이 같은 목록을 다시 보낸다.
writeFileSync(snapshotPath, JSON.stringify(current, null, 2));

/** sitemap 을 { 주소: lastmod } 로 읽는다. lastmod 가 없는 줄(소개·정책)은 빈 문자열이다. */
async function fetchSitemap() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();
  const entries = {};
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) continue;
    entries[loc] = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? "";
  }
  // 빈 sitemap 을 스냅숏으로 남기면 다음 번에 전 주소가 "삭제" 로 나간다.
  if (Object.keys(entries).length === 0) throw new Error("sitemap 이 비어 있다");
  return entries;
}

async function submit(urlList) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });
  // 200 은 받음, 202 는 받았고 키 확인은 아직이라는 뜻이다. 둘 다 성공이다.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow ${res.status}: ${await res.text()}`);
  }
  console.log(`IndexNow ${res.status} — ${urlList.length}개 보냄`);
}
