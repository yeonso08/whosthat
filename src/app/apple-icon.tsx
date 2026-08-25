import { ImageResponse } from "next/og";
import { BrandTile } from "@/components/icons";

// iOS 홈 화면 아이콘 표준 크기. 모서리는 iOS 가 직접 깎으므로 여기서 둥글리지
// 않는다 — 둥글리면 두 번 깎여 흰 테가 생긴다.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** 홈 화면 아이콘은 파비콘보다 여백을 더 준다. iOS 마스크가 모서리를 먹는다. */
const MARK_WIDTH_RATIO = 0.5;

export default function AppleIcon() {
  return new ImageResponse(
    <BrandTile tileSize={size.width} markWidthRatio={MARK_WIDTH_RATIO} />,
    size,
  );
}
