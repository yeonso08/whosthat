import { ImageResponse } from "next/og";
import { getSeason, getSeasons } from "@/lib/data";
import { loadKoreanFont } from "@/lib/og";
import { OG_SIZE, SITE_NAME } from "@/lib/site";
import { getCoverage } from "@/lib/types";

export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * 없으면 이 라우트만 요청마다 서버에서 렌더된다 — 공유될 때마다 Google Fonts
 * 를 다시 때리고, 나머지가 전부 정적인 사이트에 서버가 하나 붙는다.
 */
export function generateStaticParams() {
  return getSeasons().map((season) => ({ id: season.id }));
}

export default async function Image({ params }: PageProps<"/seasons/[id]">) {
  const { id } = await params;
  const season = getSeason(id);
  const coverage = getCoverage(season?.cast ?? []);

  const program = "나는 솔로";
  const label = season?.label ?? "";
  const stat = `출연진 ${coverage.total}명 중 인스타 ${coverage.found}개 확인`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0c",
          color: "#f4f4f6",
          padding: "0 88px",
          fontFamily: "Gothic A1",
        }}
      >
        <div style={{ fontSize: 40, color: "#90909b" }}>{program}</div>
        <div style={{ fontSize: 168, letterSpacing: "-0.04em", marginTop: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 38, color: "#90909b", marginTop: 24 }}>
          {stat}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Gothic A1",
          data: await loadKoreanFont(program + label + stat, 700),
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
