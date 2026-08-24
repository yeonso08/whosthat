import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/icons";
import { BRAND_MARK_ASPECT } from "@/lib/brand";

// 브라우저 탭 파비콘 표준 크기. 레티나 탭이 이 크기를 그대로 쓴다.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** 타일 폭 대비 마크 폭. 남는 폭이 안쪽 여백이 된다. */
const MARK_WIDTH_RATIO = 0.62;

export default function Icon() {
  const width = size.width * MARK_WIDTH_RATIO;
  const height = width / BRAND_MARK_ASPECT;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0c",
        }}
      >
        <BrandMark style={{ width, height, color: "#f4f4f6" }} />
      </div>
    ),
    size,
  );
}
