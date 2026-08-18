import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  /** 계정을 못 찾았거나 없는 사람은 사진도 한 단계 죽인다. */
  dimmed?: boolean;
  sizes?: string;
  /** 실루엣 크기가 달라진다. 카드는 아래쪽이 스크림에 가려지고, 아바타는 원으로 잘린다. */
  variant?: "card" | "avatar";
};

/**
 * 출연진 사진. 아직 사진이 없으면 실루엣을 대신 그린다.
 * src 는 /public 아래 경로(`/cast/s20-oksun.jpg`)를 쓴다 — 남의 서버 이미지를 직접 걸지 않는다.
 */
export function CastPhoto({
  src,
  alt,
  dimmed = false,
  sizes,
  variant = "card",
}: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "50vw"}
        className={`object-cover ${dimmed ? "opacity-45" : ""}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-end justify-center ${
        dimmed ? "bg-card" : "bg-photo"
      } ${variant === "card" ? "pb-[22%]" : ""}`}
    >
      <svg
        viewBox="0 0 64 70"
        className={`w-auto ${variant === "card" ? "h-[52%]" : "h-[74%]"} ${
          dimmed ? "text-elevated" : "text-photo-ink"
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="32" cy="22" r="12.5" />
        <path d="M7 70c0-13.5 11.2-21.5 25-21.5S57 56.5 57 70z" />
      </svg>
    </div>
  );
}
