import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { DATA_TAG } from "@/lib/data";

/**
 * 관리자 화면에서 저장하면 백엔드(FastAPI)가 여기를 부른다. "구워 둔 페이지를
 * 버려라" 는 신호다 — 재배포가 아니라 결과물만 다시 만드는 것이다.
 *
 * **태그 하나로 전부 턴다.** 데이터를 `GET /programs` 한 번으로 통째로 받아
 * 오므로 캐시 항목도 하나뿐이고, 그걸 무효화하면 그 데이터를 쓴 페이지들이
 * 다음 방문 때 알아서 다시 구워진다. 기수별로 경로를 조립해 `revalidatePath`
 * 를 부르는 방법도 있지만, 그러면 이 파일이 언어 3벌 × 프로그램 × 기수의
 * 주소 규칙을 다시 알아야 한다 — `links.ts` 와 어긋날 자리를 하나 더 만드는
 * 셈이라 그러지 않는다.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // 비밀값이 아예 설정 안 됐으면 아무나 부를 수 있는 창구가 된다 — 열어 두느니
  // 막는다. 배포에 환경변수를 빠뜨렸을 때 조용히 통과하지 않게 하는 장치다.
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // `{ expire: 0 }` 은 "지금 즉시 만료" 다. 기본 권장값인 `"max"` 는
  // stale-while-revalidate 라서 저장 직후 첫 방문자가 옛 내용을 한 번 더 보게
  // 되는데, 그러면 관리자가 저장하고 확인하러 갔을 때 안 바뀐 화면을 본다.
  // 대신 그 첫 요청 하나가 API 응답을 기다린다 — 하루 몇 번뿐이라 그 편이 낫다.
  //
  // (`updateTag` 이 이 용도에 더 맞지만 Server Action 에서만 부를 수 있다.
  //  여기는 백엔드가 HTTP 로 부르는 라우트 핸들러라 쓸 수 없다.)
  revalidateTag(DATA_TAG, { expire: 0 });

  return NextResponse.json({ revalidated: true });
}
