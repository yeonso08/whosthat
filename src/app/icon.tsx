import { ImageResponse } from "next/og";
import { BRAND_MARK } from "@/lib/brand";
import { loadLatinFont } from "@/lib/og";

// 브라우저 탭 파비콘 표준 크기. 레티나 탭이 이 크기를 그대로 쓴다.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * 타일 높이 대비 글자 크기.
 *
 * Manrope 의 `@` 는 em 박스보다 크게 그려져 있어서 이보다 키우면 위아래가
 * 타일 밖으로 잘린다.
 */
const MARK_RATIO = 0.58;

export default async function Icon() {
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
