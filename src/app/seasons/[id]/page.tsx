import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CastCard } from "@/components/cast-card";
import { Button } from "@/components/ui/button";
import { formatAirDate, getSeason, getSeasons } from "@/lib/data";
import { getCoverage } from "@/lib/types";

export function generateStaticParams() {
  return getSeasons().map((season) => ({ id: season.id }));
}

export async function generateMetadata({ params }: PageProps<"/seasons/[id]">) {
  const { id } = await params;
  const season = getSeason(id);
  if (!season) return {};
  return {
    title: `나는 솔로 ${season.label} 출연진 인스타`,
    description: `나는 솔로 ${season.label} 출연진의 인스타그램 계정. 확인된 것만 모아 뒀다.`,
  };
}

export default async function Page({ params }: PageProps<"/seasons/[id]">) {
  const { id } = await params;
  const season = getSeason(id);
  if (!season) notFound();

  const coverage = getCoverage(season.cast);
  const airDate = formatAirDate(season.airDate);

  return (
    <main className="pb-10">
      <div className="px-3 pt-3.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label="기수 목록으로"
          className="size-11 [&_svg]:size-5"
          // Link 는 <a> 라 native button 이 아니라고 알려 줘야 한다.
          nativeButton={false}
          render={<Link href="/" />}
        >
          <ChevronLeft />
        </Button>
      </div>

      <header className="px-5 pt-1.5">
        <h1 className="text-3xl font-black tracking-tighter">{season.label}</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {airDate ? `${airDate} 방영 · ` : ""}
          {coverage.total}명 중 {coverage.found}명 계정 확인
        </p>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        {season.cast.map((member) => (
          <CastCard key={member.id} member={member} />
        ))}
      </section>

      <p className="mt-8 px-5 text-xs leading-relaxed text-muted-foreground">
        방송에서 공개됐거나 본인이 공개로 둔 계정만 올린다. 잘못된 계정을
        발견하면 알려주면 내린다.
      </p>
    </main>
  );
}
