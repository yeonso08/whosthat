import type { ReactNode } from "react";
import {
  currentLocale,
  fill,
  formatEpisodeDate,
  getDictionary,
  type Dictionary,
} from "@/lib/i18n";
import {
  finalCouples,
  type CastMember,
  type Episode,
  type EpisodeBlock,
  type PickRound,
} from "@/lib/types";

type Props = {
  /** 방송 날짜순. 비어 있으면 부르지 않는다(`seasonEpisodes`). */
  episodes: Episode[];
  cast: CastMember[];
  /** "33기 회차별 정리" — 기수 라벨이 언어·프로그램마다 달라서 페이지가 만든다. */
  heading: string;
};

type Members = Map<string, CastMember>;

/** 같은 자리에 이어 붙은 자기소개는 한 판으로 묶는다 — 한 사람씩 판을 세우면 여섯 장이 된다. */
type Group =
  | { kind: "block"; block: EpisodeBlock }
  | { kind: "profiles"; blocks: EpisodeBlock[] };

/**
 * 기수 회차별 정리. 나솔 정리 블로그처럼 방송 날짜마다 끊고, 짧은 문단 · 출연자가
 * 한 말 · 자기소개 · 그 회차의 선택 결과를 섞는다.
 *
 * 표·득표 막대로 그린 시안은 "게임 공략 같다", 문단만 이은 시안은 "소설책 같다" 로
 * 반려됐다(2026-11-05) — 블록을 섞는 지금 모양이 통과한 것이다.
 */
export async function SeasonEpisodes({ episodes, cast, heading }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale);
  const members: Members = new Map(cast.map((m) => [m.id, m]));
  const first = episodes[0];
  const last = episodes[episodes.length - 1];

  return (
    <article className="gutter mt-12 max-w-[720px] lg:mt-16">
      <h2 className="text-[20px] font-bold tracking-[-0.02em] lg:text-[22px]">{heading}</h2>
      {first && last && first !== last && (
        <p className="mt-2 text-[13px] text-muted-foreground">
          {fill(dict.season.episodesRange, {
            first: formatEpisodeDate(first.airDate, locale),
            last: formatEpisodeDate(last.airDate, locale),
          })}
        </p>
      )}

      {/* 방송 순서가 실제 순서라 세로 선으로 잇는다. */}
      <ol className="mt-8 border-l border-border">
        {episodes.map((episode) => (
          <li key={episode.id} className="relative pb-12 pl-6 last:pb-2 lg:pl-8">
            <span className="absolute top-[7px] -left-[5px] size-[9px] rounded-full bg-foreground" />
            <p className="font-lat text-[12px] font-semibold text-muted-foreground">
              {fill(dict.season.episodeAired, {
                date: formatEpisodeDate(episode.airDate, locale),
              })}
            </p>
            <h3 className="mt-1 text-[18px] leading-[1.35] font-bold tracking-[-0.02em] break-keep">
              {episode.title}
            </h3>
            <div className="mt-4 space-y-4">
              {group(episode.blocks).map((g, i) =>
                g.kind === "profiles" ? (
                  <Profiles key={i} blocks={g.blocks} members={members} dict={dict} />
                ) : (
                  <Block key={i} block={g.block} members={members} dict={dict} />
                ),
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-[12px] leading-[1.7] text-muted-foreground">
        {dict.season.episodesSource}
      </p>
    </article>
  );
}

function group(blocks: EpisodeBlock[]): Group[] {
  const groups: Group[] = [];
  for (const block of blocks) {
    const previous = groups[groups.length - 1];
    if (block.kind === "profile" && previous?.kind === "profiles") {
      previous.blocks.push(block);
    } else if (block.kind === "profile") {
      groups.push({ kind: "profiles", blocks: [block] });
    } else {
      groups.push({ kind: "block", block });
    }
  }
  return groups;
}

type BlockProps = { block: EpisodeBlock; members: Members; dict: Dictionary };

function Block({ block, members, dict }: BlockProps): ReactNode {
  switch (block.kind) {
    case "text":
      return (
        <p className="text-[15px] leading-[1.8] break-keep text-foreground/85 [overflow-wrap:anywhere]">
          {linkNames(block.body ?? "", members)}
        </p>
      );

    case "quote":
      return (
        <blockquote className="border-l-2 border-foreground/25 py-0.5 pl-4">
          <p className="text-[17px] leading-[1.6] font-semibold tracking-[-0.01em] break-keep">
            &ldquo;{block.body}&rdquo;
          </p>
          <footer className="mt-1 text-[13px] text-muted-foreground">
            {aliasOf(block.memberId, members)}
          </footer>
        </blockquote>
      );

    case "picks":
      if (!block.round) return null;
      return block.round.isFinal ? (
        <Couples round={block.round} members={members} dict={dict} />
      ) : (
        <Picks round={block.round} members={members} dict={dict} />
      );

    // 자기소개는 `group` 이 묶어서 `Profiles` 로 보낸다.
    case "profile":
      return null;
  }
}

function Profiles({
  blocks,
  members,
  dict,
}: {
  blocks: EpisodeBlock[];
  members: Members;
  dict: Dictionary;
}) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-soft">
      {blocks.map((block, i) => {
        const member = block.memberId ? members.get(block.memberId) : undefined;
        return (
          <div key={i} className="px-5 py-3.5">
            <dt className="text-[14px] font-bold">
              {member?.alias}
              {member?.ageAtAiring && (
                <span className="ml-1.5 text-[12px] font-medium text-muted-foreground">
                  {fill(dict.season.age, { age: member.ageAtAiring })}
                </span>
              )}
            </dt>
            <dd className="mt-0.5 text-[14px] leading-[1.6] break-keep text-muted-foreground">
              {block.body}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

type RoundProps = { round: PickRound; members: Members; dict: Dictionary };

/**
 * 받은 사람 기준으로 묶는다 — "정숙, 영숙, 옥순 → 영식". 많이 받은 사람이 위다.
 * 고르지 않은 사람은 맨 아래 한 줄로 모은다.
 */
function Picks({ round, members, dict }: RoundProps) {
  const received = new Map<string, string[]>();
  const nobody: string[] = [];
  for (const pick of round.picks) {
    if (pick.chosenId === null) {
      nobody.push(pick.chooserId);
      continue;
    }
    received.set(pick.chosenId, [...(received.get(pick.chosenId) ?? []), pick.chooserId]);
  }
  const order = [...members.keys()];
  const byCast = (a: string, b: string) => order.indexOf(a) - order.indexOf(b);
  const rows = [...received.entries()]
    .map(([to, from]) => ({ to, from: from.sort(byCast) }))
    .sort((a, b) => b.from.length - a.from.length || byCast(a.to, b.to));
  const names = (ids: string[]) => ids.map((id) => aliasOf(id, members)).join(", ");

  return (
    <figure className="rounded-2xl bg-card px-5 py-4 shadow-soft">
      <figcaption className="text-[13px] font-semibold text-muted-foreground">
        {round.label}
      </figcaption>
      {/* 화살표를 한 세로줄에 세운다 — 고른 사람 수가 줄마다 달라서 그냥 흘리면
          화살표가 들쭉날쭉해 어느 이름이 받은 쪽인지 눈이 매번 다시 찾는다. */}
      <ul className="mt-3 grid grid-cols-[max-content_auto_1fr] items-baseline gap-x-3 gap-y-2.5 text-[15px]">
        {rows.map((row) => (
          <li key={row.to} className="contents">
            <span className="text-muted-foreground">{names(row.from)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-bold">{aliasOf(row.to, members)}</span>
          </li>
        ))}
        {nobody.length > 0 && (
          <li className="contents">
            <span className="text-muted-foreground">{names(nobody.sort(byCast))}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">{dict.season.pickedNobody}</span>
          </li>
        )}
      </ul>
      <Note text={round.note} />
    </figure>
  );
}

/** 최종 선택은 커플만 그린다. 서로 고른 짝을 세고(`finalCouples`), 남자 이름을 앞에 둔다. */
function Couples({ round, members, dict }: RoundProps) {
  const pairs = finalCouples(round).map((pair) =>
    members.get(pair[0])?.gender === "male" ? pair : ([pair[1], pair[0]] as const),
  );
  if (pairs.length === 0) {
    return (
      <div className="rounded-2xl bg-card px-5 py-4 shadow-soft">
        <p className="text-[15px] font-semibold">{dict.season.noFinalCouple}</p>
        <Note text={round.note} />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {pairs.map(([a, b]) => {
          const first = aliasOf(a, members);
          return (
            <div key={a} className="rounded-2xl bg-card px-5 py-4 shadow-soft">
              <p className="text-[13px] font-semibold text-muted-foreground">
                {dict.season.finalCouple}
              </p>
              <p className="mt-1 text-[18px] font-bold tracking-[-0.02em]">
                {first}
                {withParticle(first)} {aliasOf(b, members)}
              </p>
            </div>
          );
        })}
      </div>
      {round.note && (
        <p className="text-[13px] leading-[1.6] break-keep text-muted-foreground">{round.note}</p>
      )}
    </div>
  );
}

function Note({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="mt-3.5 border-t border-border pt-3 text-[13px] leading-[1.6] break-keep text-muted-foreground">
      {text}
    </p>
  );
}

function aliasOf(id: string | null, members: Members): string {
  return (id && members.get(id)?.alias) || "";
}

/** `[영수]` 를 위 카드로 가는 링크로 바꾼다. 기수에 없는 이름이면 괄호만 벗긴다. */
function linkNames(text: string, members: Members) {
  const byAlias = new Map([...members.values()].map((m) => [m.alias, m]));
  return text.split(/(\[[^\]]+\])/).map((part, i) => {
    const alias = part.match(/^\[(.+)\]$/)?.[1];
    if (!alias) return part;
    const member = byAlias.get(alias);
    return member ? (
      <a
        key={i}
        href={`#${member.id}`}
        className="focus-ring font-semibold text-foreground underline decoration-border decoration-1 underline-offset-[5px] hover:decoration-foreground"
      >
        {alias}
      </a>
    ) : (
      alias
    );
  });
}

/** 받침이 있으면 "과", 없으면 "와" — 영철과 / 영호와. 한국어로만 쓰는 화면이라 여기 둔다. */
function withParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code % 28 !== 0 ? "과" : "와";
}
