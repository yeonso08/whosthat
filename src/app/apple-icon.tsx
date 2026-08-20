import { ImageResponse } from "next/og";
import { BRAND_MARK } from "@/lib/brand";
import { loadLatinFont } from "@/lib/og";

// iOS 홈 화면 아이콘 표준 크기. 모서리는 iOS 가 직접 깎으므로 여기서 둥글리지
// 않는다 — 둥글리면 두 번 깎여 흰 테가 생긴다.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** 홈 화면 아이콘은 파비콘보다 여백을 더 준다. iOS 마스크가 모서리를 먹는다. */
const MARK_RATIO = 0.46;

export default async function AppleIcon() {
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
          color: "#f4f4f6",
          fontFamily: "Manrope",
          fontSize: size.height * MARK_RATIO,
          lineHeight: 1,
        }}
      >
        {BRAND_MARK}
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Manrope",
          data: await loadLatinFont(BRAND_MARK, 800),
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
