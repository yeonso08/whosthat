import { ImageResponse } from "next/og";
import { getSeasons } from "@/lib/data";
import { loadKoreanFont } from "@/lib/og";
import { OG_SIZE, SITE_NAME } from "@/lib/site";
import { getCoverage } from "@/lib/types";

export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const seasons = getSeasons();
  const totals = seasons.reduce(
    (acc, season) => {
      const c = getCoverage(season.cast);
      return { people: acc.people + c.total, found: acc.found + c.found };
    },
    { people: 0, found: 0 },
  );

  const heading = "출연진 인스타";
  const program = "나는 솔로";
  const stat = `${seasons.length}개 기수 · ${totals.people}명 중 ${totals.found}개 확인`;

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
        <div style={{ fontSize: 34, color: "#90909b" }}>{program}</div>
        <div style={{ fontSize: 128, letterSpacing: "-0.04em", marginTop: 12 }}>
          {heading}
        </div>
        <div style={{ fontSize: 34, color: "#90909b", marginTop: 28 }}>
          {stat}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Gothic A1",
          data: await loadKoreanFont(heading + program + stat, 700),
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
