import type { CSSProperties } from "react";
import { BRAND_MARK_PATHS, BRAND_MARK_VIEWBOX } from "@/lib/brand";

type IconProps = { className?: string; style?: CSSProperties };

/**
 * 브랜드 마크 — 겹친 두 원에서 깎은 ㄲ 모노그램. 좌표는 `lib/brand.ts` 에 있다
 * (파비콘·앱 아이콘이 같은 좌표를 쓴다).
 *
 * `style` 은 `className`(Tailwind)이 안 통하는 satori 렌더 경로(`icon.tsx`·
 * `apple-icon.tsx`)를 위한 것이다 — 화면 컴포넌트는 `className` 만 쓰면 된다.
 */
export function BrandMark({ className, style }: IconProps) {
  return (
    <svg
      viewBox={BRAND_MARK_VIEWBOX}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={10}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {BRAND_MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5.4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
