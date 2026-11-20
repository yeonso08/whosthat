import { buildLlmsFullTxt } from "@/lib/llms";

// sitemap 처럼 빌드 때 한 번 굽는다 — 데이터가 바뀌면 "사이트에 반영" 빌드가 다시 만든다.
export const dynamic = "force-static";

export async function GET() {
  return new Response(await buildLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
