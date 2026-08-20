import { SeasonFeature } from "@/components/season-feature";
import { SeasonRow } from "@/components/season-row";
import { Wordmark } from "@/components/wordmark";
import { getProgram, getSeasons } from "@/lib/data";
import { getCoverage } from "@/lib/types";

export default function Page() {
  const program = getProgram();
  const seasons = getSeasons();
  const [featured, ...rest] = seasons;

  const totals = seasons.reduce(
    (acc, season) => {
      const c = getCoverage(season.cast);
      return { people: acc.people + c.total, found: acc.found + c.found };
    },
    { people: 0, found: 0 },
  );

  return (
    <main>
      <header className="px-5 pt-6 pb-1">
        <Wordmark />
        <p className="mt-5 text-sm font-bold tracking-tight text-muted-foreground">
          {program.name}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tighter">전체 기수</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {seasons.length}개 기수 · {totals.people}명 중 인스타 {totals.found}개
          확인
        </p>
      </header>

      {featured && (
        <div className="mt-5 px-5">
          <SeasonFeature season={featured} />
        </div>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="px-5 pt-7 pb-2 text-[13px] font-bold text-muted-foreground">
            지난 기수
          </h2>
          <section className="px-2">
            {rest.map((season) => (
              <SeasonRow key={season.id} season={season} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
