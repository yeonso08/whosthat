import type { Schema } from "@/lib/seo";

type Props = { data: Schema | Schema[] };

/**
 * 구조화 데이터를 `<script type="application/ld+json">` 으로 내보낸다.
 * 무엇을 내보낼지는 `lib/seo.ts` 가 정한다 — 여기는 그리기만 한다.
 *
 * `JSON.stringify` 는 `<` 를 그대로 두기 때문에 데이터에 `</script` 가 섞이면
 * 태그가 거기서 끊긴다. 유니코드로 치환해서 넣는다(Next 문서 권고).
 */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
