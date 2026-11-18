import { Dices, Heart, MapPin, Sparkles, Trophy, Tv, type LucideIcon } from "lucide-react";
import { LiveDot } from "@/components/live-dot";
import { SolonaraFold } from "@/components/solonara-browser";
import { currentLocale, fill, getDictionary, localizeSeason, type Dictionary } from "@/lib/i18n";
import {
  SOLONARA_ITEM_KINDS,
  type SolonaraItem,
  type SolonaraItemKind,
  type SolonaraSeason,
} from "@/lib/types";

type Props = { entry: SolonaraSeason };

/** 같은 종류 게임들의 묶음. `continued` 면 접힘 경계 앞에서 이어지는 묶음이라 제목을 또 달지 않는다. */
type KindGroup = { kind: SolonaraItemKind; items: SolonaraItem[]; continued?: boolean };

/**
 * 판에 바로 펼쳐 두는 게임 수. 기수마다 게임 수가 달라 다 펼치면 판 키가 몇 배씩
 * 달라 격자에 빈 데가 생겼다(2026-11-18). 셋으로 시작했다가 하나로 줄였다(사용자
 * 요청) — 하나면 숙소 + 게임 한 장이라 판 키가 거의 같다.
 */
const SHOWN_GAMES = 1;

/** 종류마다 붙는 그림 — 제목을 읽기 전에 어떤 놀이인지 먼저 보이게 한다. */
export const KIND_ICON: Record<SolonaraItemKind, LucideIcon> = {
  firstImpression: Sparkles,
  dateChoice: Heart,
  random: Dices,
  superDate: Trophy,
};

/**
 * 위쪽 종류 칩을 누르면 판 바깥(`SolonaraBrowser`)에 `data-kind` 가 걸린다. 판 안의
 * 묶음은 그 값이 자기 종류가 아니면 숨는다 — 판은 서버가 그리고 칩은 클라이언트라,
 * 상태를 내려보내지 않고 CSS 로 거른다. Tailwind 가 클래스를 읽으려면 글자 그대로
 * 적혀 있어야 해서 표로 둔다.
 */
const HIDE_UNLESS: Record<SolonaraItemKind, string> = {
  firstImpression:
    "group-data-[kind=dateChoice]/solonara:hidden group-data-[kind=random]/solonara:hidden group-data-[kind=superDate]/solonara:hidden",
  dateChoice:
    "group-data-[kind=firstImpression]/solonara:hidden group-data-[kind=random]/solonara:hidden group-data-[kind=superDate]/solonara:hidden",
  random:
    "group-data-[kind=firstImpression]/solonara:hidden group-data-[kind=dateChoice]/solonara:hidden group-data-[kind=superDate]/solonara:hidden",
  superDate:
    "group-data-[kind=firstImpression]/solonara:hidden group-data-[kind=dateChoice]/solonara:hidden group-data-[kind=random]/solonara:hidden",
};

/**
 * 누가 고르는 판인지 — 솔로남 파랑, 솔로녀 분홍. 회차 글과 같은 짝이라 설명 없이
 * 읽힌다(`globals.css` 의 `--he`·`--she`). 랜덤·게임은 다 같이 해서 바탕이 회색이다.
 */
const WHO_TONE = {
  male: { tile: "bg-he-soft", chip: "bg-he text-background" },
  female: { tile: "bg-she-soft", chip: "bg-she text-background" },
} as const;

/** 종류 제목에 긋는 형광펜 — 회차 글 소제목과 같은 붓이다. */
const HIGHLIGHT = "bg-[linear-gradient(transparent_58%,var(--pop)_58%)] box-decoration-clone px-0.5";

/**
 * 숙소와 게임 모음의 한 판 — 한 기수의 숙소와 놀이들.
 *
 * 놀러 가거나 따라 해 보려는 사람이 읽는 화면이라(2026-11-18, "딱딱하다" 로 다시
 * 짰다) 게임 하나가 작은 카드 한 장이다: 누가 고르는지 칩 → 이름 → 진행 방법 →
 * 방송에서는 어땠는지. 숙소는 맨 위에 주소까지 한 덩어리로 둔다.
 *
 * **회차 글 링크를 걸지 않는다** — 줄마다 날짜 링크를 달았다가 "게임 옆에 링크는
 * 왜 거냐" 로 반려됐다. 판 머리도 링크가 아니다(기수 화면은 인스타 화면이다).
 */
export async function SolonaraSeasonCard({ entry }: Props) {
  const locale = await currentLocale();
  const dict = getDictionary(locale).solonara;
  const { season, stay, items } = entry;
  const { label, special } = localizeSeason(season, locale);
  const ordered = SOLONARA_ITEM_KINDS.flatMap((kind) =>
    items.filter((item) => item.kind === kind),
  );
  const shown = groupByKind(ordered.slice(0, SHOWN_GAMES));
  const rest = groupByKind(ordered.slice(SHOWN_GAMES), ordered[SHOWN_GAMES - 1]?.kind);

  return (
    <article className="rounded-[20px] bg-card p-4 shadow-soft sm:p-5">
      <header className="flex items-baseline gap-2 px-1">
        <h3 className="flex items-center gap-2 text-[24px] leading-none font-bold tracking-[-0.03em]">
          {label}
          {season.onAir && <LiveDot />}
        </h3>
        {special && (
          <span className="min-w-0 truncate text-[12.5px] text-muted-foreground">{special}</span>
        )}
      </header>

      <div className="mt-3.5 flex items-start gap-3 rounded-2xl border border-dashed border-ring/50 px-3.5 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <MapPin className="size-4" aria-hidden />
        </span>
        <p className="min-w-0 pt-0.5 text-[14.5px] leading-[1.45] break-keep">
          <span className="sr-only">{dict.stay} </span>
          {stay ? (
            <>
              <span className="font-bold">{stay.name}</span>
              {stay.address && (
                <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                  {stay.address}
                </span>
              )}
            </>
          ) : (
            <span className="text-[13px] text-muted-foreground">{dict.stayUnknown}</span>
          )}
        </p>
      </div>

      {ordered.length > 0 ? (
        rest.length > 0 ? (
          <SolonaraFold
            shown={<KindSections groups={shown} dict={dict} />}
            rest={<KindSections groups={rest} dict={dict} />}
            text={{
              more: fill(dict.more, { count: ordered.length - SHOWN_GAMES }),
              less: dict.less,
            }}
          />
        ) : (
          <KindSections groups={shown} dict={dict} />
        )
      ) : (
        <p className="mt-4 px-1 text-[13px] leading-[1.6] break-keep text-muted-foreground">
          {dict.noItems}
        </p>
      )}
    </article>
  );
}

/** 게임들을 종류마다 묶는다. 첫 묶음이 `previousKind` 와 같으면 앞 묶음이 이어지는 것이다. */
function groupByKind(games: SolonaraItem[], previousKind?: SolonaraItemKind): KindGroup[] {
  const groups: KindGroup[] = [];
  for (const item of games) {
    const last = groups.at(-1);
    if (last?.kind === item.kind) last.items.push(item);
    else
      groups.push({
        kind: item.kind,
        items: [item],
        continued: groups.length === 0 && item.kind === previousKind,
      });
  }
  return groups;
}

/** 종류 제목(그림 + 형광펜) 아래 게임 카드들. 이어지는 묶음은 제목 없이 바로 붙는다. */
function KindSections({
  groups,
  dict,
}: {
  groups: KindGroup[];
  dict: Dictionary["solonara"];
}) {
  return groups.map((group) => {
    const Icon = KIND_ICON[group.kind];
    return (
      <section
        key={group.kind}
        className={`${group.continued ? "mt-2" : "mt-5"} ${HIDE_UNLESS[group.kind]}`}
      >
        {!group.continued && (
          <h4 className="mb-2.5 flex items-center gap-1.5 px-1 text-[14px] font-bold tracking-[-0.01em]">
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className={HIGHLIGHT}>{dict.kinds[group.kind]}</span>
          </h4>
        )}
        <ul className="flex flex-col gap-2">
          {group.items.map((item) => (
            <GameTile
              key={`${item.date}-${item.name}`}
              item={item}
              whoLabel={item.who ? dict.who[item.who] : undefined}
              sceneLabel={dict.scene}
            />
          ))}
        </ul>
      </section>
    );
  });
}

/**
 * 놀이 한 장. 진행 방법이 본문이다 — 이름만 적으면 무슨 놀이인지 알 수 없다.
 * "방송에서는" 은 따로 띄운 말풍선이라 규칙과 섞여 읽히지 않는다.
 */
function GameTile({
  item,
  whoLabel,
  sceneLabel,
}: {
  item: SolonaraItem;
  whoLabel?: string;
  sceneLabel: string;
}) {
  const tone = item.who ? WHO_TONE[item.who] : undefined;

  return (
    <li className={`rounded-2xl px-3.5 py-3 break-keep ${tone?.tile ?? "bg-elevated/60"}`}>
      {tone && whoLabel && (
        <span
          className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11.5px] leading-[1.4] font-bold ${tone.chip}`}
        >
          {whoLabel}
        </span>
      )}
      <p className="text-[15.5px] leading-[1.4] font-bold tracking-[-0.02em]">{item.name}</p>
      <p className="mt-1 text-[13.5px] leading-[1.7] text-foreground/80">{item.how}</p>
      {item.scene && (
        <p className="mt-2.5 flex gap-2 rounded-xl bg-card/80 px-3 py-2 text-[12.5px] leading-[1.6] text-muted-foreground">
          <Tv className="mt-0.5 size-3.5 shrink-0" aria-label={sceneLabel} />
          <span>{item.scene}</span>
        </p>
      )}
    </li>
  );
}
