import { ArrowLeftRight, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  currentLocale,
  fill,
  formatEpisodeDate,
  getDictionary,
  localizeOccupation,
  type Dictionary,
} from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import {
  getEpisodeHeading,
  getEpisodeList,
  orderedFinalCouples,
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
            <div className="mt-4">
              <EpisodeBlocks blocks={episode.blocks} cast={cast} />
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

type BlocksProps = {
  blocks: EpisodeBlock[];
  cast: CastMember[];
  /**
   * 글 속 이름이 가는 곳. 기수 화면에서는 같은 화면 위쪽의 카드(`#id`)라 안 줘도
   * 되고, 회차 글 페이지는 카드가 다른 화면에 있어서 그 주소를 만들어 준다.
   */
  memberHref?: (memberId: string) => string;
  /**
   * 글 속 소제목의 단계. 회차 제목 바로 아래 단계라야 한다 — 기수 화면은 회차
   * 제목이 h3 이라 h4, 회차 글 페이지는 제목이 h1 이라 h2 다.
   */
  headingTag?: "h2" | "h4";
};

/** 블록을 그리는 데 함께 들고 다니는 것들. */
type Ctx = {
  members: Members;
  byAlias: Map<string, CastMember>;
  dict: Dictionary;
  locale: Locale;
  memberHref: (memberId: string) => string;
  headingTag: "h2" | "h4";
  /** 사람 카드 안이면 목록을 판에 또 담지 않는다 — 판 안의 판이 된다. */
  nested: boolean;
};

/**
 * 사람 색 — 솔로남 파랑, 솔로녀 분홍. 이 장르가 늘 쓰는 짝이라 설명 없이 읽힌다.
 * 회차 글에만 쓴다(`globals.css` 의 `--he`·`--she`).
 */
const TONE = {
  male: { text: "text-he", soft: "bg-he-soft", solid: "bg-he text-background" },
  female: { text: "text-she", soft: "bg-she-soft", solid: "bg-she text-background" },
} as const;

/** 소제목에 긋는 형광펜 — 글자 아래 절반만 칠한다. */
const HIGHLIGHT = "bg-[linear-gradient(transparent_58%,var(--pop)_58%)] box-decoration-clone px-0.5";

/** 글 속 이름 표기 — `[영수]`. 기수 화면의 카드 링크와 같은 약속이다. */
const NAME_TOKEN = /\[([^\]]+)\]/g;

/**
 * 사람 소제목 — `## [영호] 3대1 데이트`, `## [광수]·[정숙] 잘 맞은 데이트`.
 * 글머리가 이름이면 그 사람 카드가 된다(이름은 기수에 있어야 한다).
 */
const PERSON_HEADING = /^((?:\[[^\]]+\]\s*[·,]?\s*)+)(.*)$/;

/**
 * 마음의 방향 한 줄 — `[영호] → [현숙]·[순자] 메모`. `↔` 는 서로를 본다는 뜻이다.
 * 오른쪽 이름 뒤에 남는 글은 메모로 붙는다.
 */
const RELATION_LINE = /^\[([^\]]+)\]\s*(→|↔)\s*((?:\[[^\]]+\]\s*[·,]?\s*)*)(.*)$/;

/**
 * 한 회차의 본문 — 문단·말풍선·사람 카드·선택판을 방송 순서대로. 기수 화면의
 * 회차별 정리와 회차 글 페이지가 같은 것을 그린다: 두 곳이 각자 그리면 한쪽만
 * 고치게 되고, 같은 회차가 화면마다 다르게 읽힌다.
 *
 * 장면을 따라 문단을 잇는 글은 "소설책 같다" 로 반려됐다(2026-11-18). 그래서
 * 사람이 단위다 — 이름으로 찾아온 사람이 자기 칸을 바로 찾고, 말은 그 사람
 * 이름 아래 말풍선으로, 선택은 받은 사람마다 한 칸으로 보인다. 가명 두 글자
 * 원(`CastAvatar`)은 여기서 쓰지 않는다 — 이름을 원에 또 적으면 같은 이름이
 * 두 번 찍힌다(2026-11-18 에 넣었다가 뺐다).
 */
export async function EpisodeBlocks({
  blocks,
  cast,
  memberHref = (memberId) => `#${memberId}`,
  headingTag = "h4",
}: BlocksProps) {
  const locale = await currentLocale();
  const members: Members = new Map(cast.map((m) => [m.id, m]));
  const ctx: Ctx = {
    members,
    byAlias: new Map(cast.map((m) => [m.alias, m])),
    dict: getDictionary(locale),
    locale,
    memberHref,
    headingTag,
    nested: false,
  };

  return <div className="space-y-5">{renderGroups(group(blocks, ctx), ctx)}</div>;
}

function renderGroups(groups: Group[], ctx: Ctx): ReactNode[] {
  return groups.map((g, i) => {
    switch (g.kind) {
      case "profiles":
        return <Profiles key={i} blocks={g.blocks} ctx={ctx} />;
      case "person":
        return <PersonSection key={i} section={g} ctx={ctx} />;
      case "block":
        return <Block key={i} block={g.block} ctx={ctx} />;
    }
  });
}

/** 같은 자리에 이어 붙은 자기소개는 한 판으로, 사람 소제목 뒤의 블록은 그 사람 카드로 묶는다. */
type Group =
  | { kind: "block"; block: EpisodeBlock }
  | { kind: "profiles"; blocks: EpisodeBlock[] }
  | { kind: "person"; people: CastMember[]; title: string; blocks: EpisodeBlock[] };

function group(blocks: EpisodeBlock[], ctx: Ctx): Group[] {
  const groups: Group[] = [];
  // 지금 채우는 사람 카드. 다음 소제목(사람이든 아니든)이 나오면 닫힌다.
  let section: Extract<Group, { kind: "person" }> | undefined;

  for (const block of blocks) {
    const heading = getEpisodeHeading(block);
    if (heading !== undefined) {
      const person = parsePersonHeading(heading, ctx.byAlias);
      section = person && { kind: "person", ...person, blocks: [] };
      groups.push(section ?? { kind: "block", block });
      continue;
    }
    if (section) {
      section.blocks.push(block);
      continue;
    }
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

function parsePersonHeading(
  heading: string,
  byAlias: Map<string, CastMember>,
): { people: CastMember[]; title: string } | undefined {
  const match = heading.match(PERSON_HEADING);
  if (!match) return undefined;
  const people = resolveNames(match[1], byAlias);
  return people ? { people, title: match[2].trim() } : undefined;
}

/** `[영호]·[순자]` 의 이름을 전부 사람으로. 하나라도 기수에 없으면 undefined. */
function resolveNames(
  text: string,
  byAlias: Map<string, CastMember>,
): CastMember[] | undefined {
  const people = [...text.matchAll(NAME_TOKEN)].map((m) => byAlias.get(m[1]));
  return people.length > 0 && people.every(Boolean) ? (people as CastMember[]) : undefined;
}

function Block({ block, ctx }: { block: EpisodeBlock; ctx: Ctx }): ReactNode {
  switch (block.kind) {
    case "text": {
      // 글머리가 소제목 표기면 문단이 아니라 제목으로 그린다(`getEpisodeHeading`).
      // 위 여백을 넓혀 앞 장면과 끊는다 — 소제목이 문단에 붙으면 굵은 문장으로 읽힌다.
      const heading = getEpisodeHeading(block);
      if (heading !== undefined) {
        return <EpisodeHeading as={ctx.headingTag}>{heading}</EpisodeHeading>;
      }
      const list = getEpisodeList(block);
      if (list !== undefined) return <List lines={list} ctx={ctx} />;
      return (
        <p className="text-[15px] leading-[1.8] break-keep text-foreground/85 [overflow-wrap:anywhere]">
          {linkNames(block.body ?? "", ctx)}
        </p>
      );
    }

    case "quote":
      return <Bubble block={block} ctx={ctx} />;

    case "picks":
      if (!block.round) return null;
      return block.round.isFinal ? (
        <Couples round={block.round} ctx={ctx} />
      ) : (
        <PickBoard round={block.round} ctx={ctx} />
      );

    // 자기소개는 `group` 이 묶어서 `Profiles` 로 보낸다.
    case "profile":
      return null;
  }
}

/**
 * 한 사람(또는 한 쌍)의 칸. 머리에 이름·나이·직업을 두는 건 `34기 영호` 로
 * 찾아온 사람이 제일 먼저 확인하는 게 "이 사람이 그 사람인가" 라서다.
 */
function PersonSection({
  section,
  ctx,
}: {
  section: Extract<Group, { kind: "person" }>;
  ctx: Ctx;
}) {
  const Heading = ctx.headingTag;
  const [only] = section.people;
  const single = section.people.length === 1;
  const occupation = single ? localizeOccupation(only, ctx.locale) : undefined;
  const inner: Ctx = { ...ctx, nested: true };

  return (
    <section className="overflow-hidden rounded-[22px] bg-card shadow-soft">
      <header
        className={`px-5 pt-4 pb-3.5 lg:px-6 ${
          // 남녀가 섞인 카드만 파랑→분홍으로 잇는다. 같은 성별끼리면 그 색 하나다.
          section.people.every((p) => p.gender === only.gender)
            ? TONE[only.gender].soft
            : "bg-linear-to-r from-he-soft to-she-soft"
        }`}
      >
        <div className="min-w-0">
          <Heading className="text-[18px] leading-[1.35] font-bold tracking-[-0.02em] break-keep">
            {section.people.map((person, i) => (
              <span key={person.id}>
                {i > 0 && <span className="px-1 text-couple">♥</span>}
                <a
                  href={ctx.memberHref(person.id)}
                  className={`focus-ring hover:underline ${TONE[person.gender].text}`}
                >
                  {person.alias}
                </a>
              </span>
            ))}
            {single && (only.ageAtAiring || occupation) && (
              <span className="ml-2 text-[13px] font-medium tracking-normal text-foreground/55">
                {[only.ageAtAiring && fill(ctx.dict.season.age, { age: only.ageAtAiring }), occupation]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </Heading>
          {section.title && (
            <p className="mt-0.5 text-[15px] leading-[1.45] font-bold tracking-[-0.01em] break-keep">
              {section.title}
            </p>
          )}
        </div>
      </header>
      {section.blocks.length > 0 && (
        <div className="space-y-3.5 px-5 pt-4 pb-6 lg:px-6">{renderGroups(group(section.blocks, inner), inner)}</div>
      )}
    </section>
  );
}

/**
 * 출연자가 한 말. 따옴표와 `— 영호` 를 단 인용은 책 같다는 말을 들었다 — 이름
 * 아래 말풍선은 메신저에서 매일 보는 모양이라 누가 한 말인지 읽기 전에 보인다.
 */
function Bubble({ block, ctx }: { block: EpisodeBlock; ctx: Ctx }) {
  const member = block.memberId ? ctx.members.get(block.memberId) : undefined;
  return (
    <figure>
      <div className="min-w-0">
        <figcaption
          className={`text-[12px] font-bold ${member ? TONE[member.gender].text : "text-muted-foreground"}`}
        >
          {member?.alias}
        </figcaption>
        <blockquote
          className={`mt-1 w-fit rounded-[18px] rounded-tl-[6px] px-4 py-2.5 text-[15.5px] leading-[1.55] font-semibold break-keep ${
            member ? TONE[member.gender].soft : "bg-elevated"
          }`}
        >
          {block.body}
        </blockquote>
      </div>
    </figure>
  );
}

/**
 * 회차 글의 소제목 — 형광펜을 긋는다. 글 페이지 아래 "다른 회차" 도 이걸 써서
 * 본문의 소제목과 같은 모양으로 선다.
 */
export function EpisodeHeading({ as: Heading, children }: { as: "h2" | "h4"; children: ReactNode }) {
  return (
    <Heading className="pt-6 text-[19px] leading-[1.4] font-bold tracking-[-0.02em] break-keep first:pt-0">
      <span className={HIGHLIGHT}>{children}</span>
    </Heading>
  );
}

/** 회차 글의 목록 판 — 본문 목록과 글 페이지 아래 "다른 회차" 가 같은 판을 쓴다. */
export const EPISODE_LIST_PANEL = "divide-y divide-border rounded-2xl bg-card px-5 py-1.5 text-[15px] leading-[1.6] break-keep shadow-soft";

/**
 * 목록. 줄이 `[영호] → [현숙]·[순자]` 꼴이면 이름 칩을 화살표로 잇는다 — 마음의
 * 방향을 문장으로 읽게 하지 않고 한눈에 보이게. 나머지 줄은 그대로 한 줄씩이다.
 */
function List({ lines, ctx }: { lines: string[]; ctx: Ctx }) {
  return (
    <ul
      className={
        ctx.nested ? "divide-y divide-border text-[15px] leading-[1.6] break-keep" : EPISODE_LIST_PANEL
      }
    >
      {lines.map((line, i) => {
        const relation = parseRelation(line, ctx.byAlias);
        if (relation) {
          return (
            <li key={i} className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 py-3">
              <Chip member={relation.from} ctx={ctx} strong />
              {relation.mutual ? (
                <ArrowLeftRight aria-label="서로" className="size-4 text-muted-foreground" />
              ) : (
                <ArrowRight aria-hidden className="size-4 text-muted-foreground" />
              )}
              {relation.to.map((member) => (
                <Chip key={member.id} member={member} ctx={ctx} />
              ))}
              {relation.note && (
                <span className="basis-full pl-1 text-[13px] text-muted-foreground sm:basis-auto sm:pl-1.5">
                  {linkNames(relation.note, ctx)}
                </span>
              )}
            </li>
          );
        }
        return (
          <li key={i} className="flex gap-2.5 py-2.5">
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
            <span className="min-w-0 text-foreground/85">{linkNames(line, ctx)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function parseRelation(line: string, byAlias: Map<string, CastMember>) {
  const match = line.match(RELATION_LINE);
  if (!match) return undefined;
  const from = byAlias.get(match[1]);
  const to = match[3] ? resolveNames(match[3], byAlias) : [];
  if (!from || !to) return undefined;
  return { from, mutual: match[2] === "↔", to, note: match[4].trim() };
}

function Chip({ member, ctx, strong }: { member: CastMember; ctx: Ctx; strong?: boolean }) {
  return (
    <a
      href={ctx.memberHref(member.id)}
      className={`focus-ring press inline-flex items-center rounded-full px-3 py-1 text-[14px] font-semibold ${
        strong ? TONE[member.gender].solid : `${TONE[member.gender].soft} ${TONE[member.gender].text}`
      }`}
    >
      {member.alias}
    </a>
  );
}

function Profiles({ blocks, ctx }: { blocks: EpisodeBlock[]; ctx: Ctx }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-soft">
      {blocks.map((block, i) => {
        const member = block.memberId ? ctx.members.get(block.memberId) : undefined;
        return (
          <div key={i} className="px-5 py-3.5">
            <dt className="text-[14px] font-bold">
              {member?.alias}
              {member?.ageAtAiring && (
                <span className="ml-1.5 text-[12px] font-medium text-muted-foreground">
                  {fill(ctx.dict.season.age, { age: member.ageAtAiring })}
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

type RoundProps = { round: PickRound; ctx: Ctx };

/**
 * 선택판 — 받는 쪽 사람마다 한 칸, 그 아래 고른 사람들의 이름. 많이
 * 받은 사람이 앞이다. **한 표도 못 받은 사람도 칸을 세운다**(흐리게) — 그게 이
 * 회차의 결과 절반이다. 받는 쪽은 고르는 쪽의 반대 성별이고, 양쪽이 다 고르는
 * 회차는 받은 사람만 세운다.
 */
function PickBoard({ round, ctx }: RoundProps) {
  const order = [...ctx.members.keys()];
  const byCast = (a: string, b: string) => order.indexOf(a) - order.indexOf(b);

  const received = new Map<string, string[]>();
  const nobody: string[] = [];
  for (const pick of round.picks) {
    if (pick.chosenId === null) nobody.push(pick.chooserId);
    else received.set(pick.chosenId, [...(received.get(pick.chosenId) ?? []), pick.chooserId]);
  }
  if (round.chooser !== "both") {
    const target = round.chooser === "female" ? "male" : "female";
    for (const member of ctx.members.values()) {
      if (member.gender === target && !received.has(member.id)) received.set(member.id, []);
    }
  }
  const tiles = [...received.entries()]
    .map(([to, from]) => ({ to: ctx.members.get(to), from: from.sort(byCast) }))
    .filter((t): t is { to: CastMember; from: string[] } => Boolean(t.to))
    .sort((a, b) => b.from.length - a.from.length || byCast(a.to.id, b.to.id));
  const people = (ids: string[]) =>
    ids.flatMap((id) => ctx.members.get(id) ?? []);

  return (
    <figure className="rounded-[20px] bg-card px-4 pt-4 pb-5 shadow-soft lg:px-5">
      <figcaption className="px-1 text-[15px] font-bold">
        <span className={HIGHLIGHT}>{round.label}</span>
      </figcaption>
      <ul className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
        {tiles.map(({ to, from }) => (
          <li
            key={to.id}
            className={`flex flex-col items-center rounded-2xl px-2 pt-3.5 pb-3.5 text-center ${
              from.length > 0
                ? TONE[to.gender].soft
                : "border border-dashed border-border text-muted-foreground"
            }`}
          >
            <a
              href={ctx.memberHref(to.id)}
              className={`focus-ring text-[17px] font-bold hover:underline ${
                from.length > 0 ? TONE[to.gender].text : ""
              }`}
            >
              {to.alias}
            </a>
            {from.length > 0 ? (
              <span
                className={`font-lat mt-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-bold ${TONE[to.gender].solid}`}
              >
                {fill(ctx.dict.season.pickVotes, { count: from.length })}
              </span>
            ) : (
              <span className="mt-1.5 text-[12px] font-semibold">{ctx.dict.season.pickedByNobody}</span>
            )}
            {from.length > 0 && (
              <span className="mt-2 text-[12px] leading-[1.5] font-medium break-keep text-foreground/60">
                {people(from)
                  .map((m) => m.alias)
                  .join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>
      {nobody.length > 0 && (
        <p className="mt-3 px-1 text-[13px] text-muted-foreground">
          {people(nobody.sort(byCast))
            .map((m) => m.alias)
            .join(", ")}{" "}
          · {ctx.dict.season.pickedNobody}
        </p>
      )}
      <Note text={round.note} />
    </figure>
  );
}

/** 최종 선택은 커플만 그린다. 짝과 순서는 `orderedFinalCouples` 가 정한다(기수 머리글과 같다). */
function Couples({ round, ctx }: RoundProps) {
  const { dict } = ctx;
  const pairs = orderedFinalCouples(round, [...ctx.members.values()]);
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
        {pairs.map(([a, b]) => (
          <div
            key={a.id}
            className="rounded-2xl bg-linear-to-r from-he-soft to-she-soft px-5 py-4 shadow-soft"
          >
            <p className="text-[13px] font-semibold text-foreground/60">{dict.season.finalCouple}</p>
            <p className="mt-0.5 text-[18px] font-bold tracking-[-0.02em]">
              <span className={TONE[a.gender].text}>{a.alias}</span>
              <span aria-hidden className="px-1.5 text-couple">
                ♥
              </span>
              <span className="sr-only">{withParticle(a.alias)}</span>
              <span className={TONE[b.gender].text}>{b.alias}</span>
            </p>
          </div>
        ))}
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
    <p className="mt-3.5 border-t border-border px-1 pt-3 text-[13px] leading-[1.6] break-keep text-muted-foreground">
      {text}
    </p>
  );
}

/** `[영수]` 를 그 사람 카드로 가는 링크로 바꾼다. 기수에 없는 이름이면 괄호만 벗긴다. */
function linkNames(text: string, ctx: Ctx) {
  return text.split(/(\[[^\]]+\])/).map((part, i) => {
    const alias = part.match(/^\[(.+)\]$/)?.[1];
    if (!alias) return part;
    const member = ctx.byAlias.get(alias);
    return member ? (
      <a
        key={i}
        href={ctx.memberHref(member.id)}
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
