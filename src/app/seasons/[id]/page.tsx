import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CastCard } from "@/components/cast-card";
import { Button } from "@/components/ui/button";
import { formatAirDate, getSeason, getSeasons } from "@/lib/data";
import { seasonHref } from "@/lib/links";
import { getCoverage } from "@/lib/types";

export function generateStaticParams() {
  return getSeasons().map((season) => ({ id: season.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/seasons/[id]">): Promise<Metadata> {
  const { id } = await params;
  const season = getSeason(id);
  if (!season) return {};

  const coverage = getCoverage(season.cast);
  const special = season.special ? ` ${season.special}` : "";
  const title = `나는 솔로 ${season.label}${special} 출연진 인스타`;
  const description =
    coverage.total === 0
      ? `나는 솔로 ${season.label}${special} 출연진의 인스타그램 계정. 명단을 정리하는 중이다.`
      : `나는 솔로 ${season.label}${special} 출연진 ${coverage.total}명의 인스타그램 계정. 확인된 것만 모아 뒀고, 계정이 없는 사람은 없다고 적어 뒀다.`;
  const path = seasonHref(season.id);

  return {
    // 제목에 이미 "나는 솔로" 가 들어 있어서 루트의 title.template 을 그대로 두면
    // 사이트 이름이 뒤에 또 붙는다.
    title: { absolute: title },
    description,
    // 같은 기수가 여러 경로로 잡히면 색인이 쪼개진다.
    alternates: { canonical: path },
    openGraph: { type: "article", title, description, url: path },
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
        {season.special && (
          <p className="mt-2 text-[13px] font-bold text-muted-foreground">
            {season.special}
          </p>
        )}
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {airDate ? `${airDate} 방영 · ` : ""}
          {coverage.total === 0
            ? "출연진 명단 정리 중"
            : `${coverage.total}명 중 ${coverage.found}명 계정 확인`}
        </p>
      </header>

      {season.cast.length > 0 ? (
        <section className="mt-5 flex flex-col gap-2 px-5">
          {season.cast.map((member) => (
            <CastCard key={member.id} member={member} />
          ))}
        </section>
      ) : (
        <p className="mt-6 rounded-2xl bg-card px-5 py-8 text-center text-[13px] leading-relaxed text-muted-foreground mx-5">
          아직 이 기수의 출연진 명단을 확인하지 못했다. 기수마다 인원이 달라서
          짐작으로 채우지 않는다.
        </p>
      )}

      <p className="mt-8 px-5 text-xs leading-relaxed text-muted-foreground">
        방송에서 공개됐거나 본인이 공개로 둔 계정만 올린다. 잘못된 계정을
        발견하면 알려주면 내린다.
      </p>
    </main>
  );
}
