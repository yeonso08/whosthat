/**
 * 사전 문구의 `{ }` 자리표시자를 채운다. 사전을 안 읽는 순수 함수라 클라이언트 컴포넌트도
 * 쓸 수 있다(투표 상자) — `i18n.ts` 를 import 하면 사전 세 벌이 번들에 딸려 가서 따로 뺐다.
 * 서버 쪽은 지금처럼 `i18n.ts` 에서 가져다 쓴다(거기서 다시 내보낸다).
 */

/** "{found} / {total} 확인" + { found: 4, total: 14 } → "4 / 14 확인". */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}
