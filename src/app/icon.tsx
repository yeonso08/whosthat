import { ImageResponse } from "next/og";
import { BrandTile } from "@/components/icons";

// 브라우저 탭 파비콘 표준 크기. 레티나 탭이 이 크기를 그대로 쓴다.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** 타일 폭 대비 마크 폭. 남는 폭이 안쪽 여백이 된다. */
const MARK_WIDTH_RATIO = 0.62;

export default function Icon() {
  return new ImageResponse(
    <BrandTile tileSize={size.width} markWidthRatio={MARK_WIDTH_RATIO} />,
    size,
  );
}
