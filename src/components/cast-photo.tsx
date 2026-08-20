import Image from "next/image";
import { CastAvatar } from "@/components/cast-avatar";
import type { AccountStatus } from "@/lib/types";

type Props = {
  src?: string;
  /** 사진이 없을 때 배지에 들어갈 글자. */
  alias: string;
  /** found 가 아니면 사진도 한 단계 죽인다. */
  status: AccountStatus;
  alt: string;
  sizes: string;
};

/**
 * 출연진 사진. 아직 사진이 없으면 가명 배지(`CastAvatar`)를 대신 그린다 —
 * 사진이 있는 쪽이 한동안 소수라, 빈 자리를 일괄 실루엣으로 두면 화면 전체가
 * 같은 그림이 된다.
 *
 * 자리 크기·모양은 감싸는 쪽이 정한다(`relative` 박스 필수). src 는 /public
 * 아래 경로(`/cast/s20-oksun.jpg`)를 쓴다 — 남의 서버 이미지를 직접 걸지
 * 않는다(PLANNING.md §9 ⑤).
 */
export function CastPhoto({ src, alias, status, alt, sizes }: Props) {
  if (!src) return <CastAvatar alias={alias} status={status} />;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover ${status === "found" ? "" : "opacity-45"}`}
    />
  );
}
