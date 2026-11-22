"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/template";
import type { VoteCandidate, VoteResults } from "@/lib/types";
import { formatVoteDeadline, rankVotes } from "@/lib/vote";

type Gender = VoteCandidate["gender"];

type Strings = Dictionary["episodeVote"];

type Props = {
  /** 서버가 그린 머리 — 어느 기수·회차의 투표인지. */
  heading: ReactNode;
  /** 닫혔는데 표가 하나도 없을 때 대신 그릴 것. 없으면 아무것도 안 그린다. */
  fallback?: ReactNode;
  /** `episodeVotesUrl` 이 만든 주소. */
  endpoint: string;
  candidates: VoteCandidate[];
  strings: Strings;
  locale: string;
};

/** 브라우저 하나를 가리키는 무작위 토큰의 저장 키. 로그인이 없어서 이게 "한 사람" 이다. */
const VOTER_KEY = "nukko:voter";
/** 이 브라우저가 그 회차·성별에 누구를 찍었는지. 결과에서 "내 선택" 을 표시한다. */
const PICK_KEY_PREFIX = "nukko:vote:";
const GENDERS: Gender[] = ["male", "female"];

/** 회차 글의 성별 색 — 본문 사람 카드와 같은 짝이다(`season-episodes.tsx` 의 TONE). */
const TONE = {
  male: { text: "text-he", soft: "bg-he-soft", bar: "bg-he", ring: "ring-he", button: "bg-he" },
  female: { text: "text-she", soft: "bg-she-soft", bar: "bg-she", ring: "ring-she", button: "bg-she" },
} as const;

/** 후보 사진 칸. 고르는 격자는 휴대폰 3열 · 넓으면 4열이다. */
const PICK_PHOTO_SIZES = "(min-width: 1024px) 90px, 30vw";
const RESULT_PHOTO_SIZES = "40px";

// localStorage 는 사생활 보호 창·차단된 사이트 데이터에서 비거나 던진다 — 그래도 투표는 된다.
function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장이 안 되면 새로고침 뒤 다시 찍을 수 있다 — 서버의 IP 상한이 남는다.
  }
}

function voterToken(): string {
  const saved = readStorage(VOTER_KEY);
  if (saved) return saved;
  const token = crypto.randomUUID();
  writeStorage(VOTER_KEY, token);
  return token;
}

/**
 * 한 회차의 시청자 투표(투표 화면의 "진행 중인 투표"). 현황은 브라우저가 API 에서 읽는다
 * — 페이지는 정적이다.
 *
 * - **API 가 안 되면 아무것도 안 그린다.** 상자가 비어 깨진 채로 남는 것보다 낫다.
 * - 닫혔는데 표가 하나도 없는 회차는 `fallback` 을 그린다.
 * - 찍기 전에는 후보만, 찍은 뒤나 닫힌 뒤에는 **전원의 순위를 보여 준다**(0표 포함).
 */
export function EpisodeVote({ heading, fallback = null, endpoint, candidates, strings, locale }: Props) {
  const [results, setResults] = useState<VoteResults | null>(null);
  const [picks, setPicks] = useState<Partial<Record<Gender, string>>>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: VoteResults | null) => {
        // 내가 찍은 사람은 현황과 함께 꺼낸다 — 저장소는 서버 렌더에 없어서 effect 안에서만 읽힌다.
        const saved: Partial<Record<Gender, string>> = {};
        for (const gender of GENDERS) {
          const id = readStorage(`${PICK_KEY_PREFIX}${endpoint}:${gender}`);
          if (id) saved[gender] = id;
        }
        setPicks(saved);
        setResults(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [endpoint]);

  if (!results) return null;
  const total = Object.values(results.counts).reduce((sum, n) => sum + n, 0);
  if (!results.open && total === 0) return fallback;

  async function vote(gender: Gender, memberId: string): Promise<boolean> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, voter: voterToken() }),
    }).catch(() => null);
    if (!response?.ok) return false;
    setResults(await response.json());
    writeStorage(`${PICK_KEY_PREFIX}${endpoint}:${gender}`, memberId);
    setPicks((current) => ({ ...current, [gender]: memberId }));
    return true;
  }

  return (
    <section className="flex flex-col gap-4">
      {heading}
      <p className="text-[14px] leading-[1.6] text-muted-foreground break-keep">
        {results.open
          ? fill(strings.deadline, { date: formatVoteDeadline(results.closesAt, locale) })
          : strings.closed}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {GENDERS.map((gender) => {
          const group = candidates.filter((c) => c.gender === gender);
          if (group.length === 0) return null;
          return (
            <GenderPanel
              key={gender}
              gender={gender}
              candidates={group}
              results={results}
              pick={picks[gender]}
              strings={strings}
              onVote={(id) => vote(gender, id)}
            />
          );
        })}
      </div>
      <p className="text-[12px] leading-[1.7] text-muted-foreground break-keep">{strings.note}</p>
    </section>
  );
}

function GenderPanel({
  gender,
  candidates,
  results,
  pick,
  strings,
  onVote,
}: {
  gender: Gender;
  candidates: VoteCandidate[];
  results: VoteResults;
  pick?: string;
  strings: Strings;
  onVote: (memberId: string) => Promise<boolean>;
}) {
  const tone = TONE[gender];
  const { total, ranked } = rankVotes(candidates, results.counts);
  const showResults = Boolean(pick) || !results.open;

  return (
    <div className="overflow-hidden rounded-[22px] bg-card shadow-soft">
      <header className={`flex items-baseline justify-between px-5 pt-4 pb-3.5 ${tone.soft}`}>
        <h3 className={`text-[17px] font-bold tracking-[-0.02em] ${tone.text}`}>
          {gender === "male" ? strings.male : strings.female}
        </h3>
        <span className="font-lat text-[13px] font-semibold text-foreground/55">
          {fill(strings.votes, { count: total })}
        </span>
      </header>
      {showResults ? (
        <ResultList ranked={ranked} pick={pick} gender={gender} strings={strings} />
      ) : (
        <PickGrid candidates={candidates} gender={gender} strings={strings} onVote={onVote} />
      )}
    </div>
  );
}

function PickGrid({
  candidates,
  gender,
  strings,
  onVote,
}: {
  candidates: VoteCandidate[];
  gender: Gender;
  strings: Strings;
  onVote: (memberId: string) => Promise<boolean>;
}) {
  const tone = TONE[gender];
  const [selected, setSelected] = useState<string>();
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const chosen = candidates.find((c) => c.id === selected);

  async function submit() {
    if (!selected) return;
    setSending(true);
    setFailed(false);
    const ok = await onVote(selected);
    setSending(false);
    if (!ok) setFailed(true);
  }

  return (
    <div className="px-5 pt-4 pb-5">
      <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4">
        {candidates.map((c) => {
          const active = c.id === selected;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(c.id)}
                className="focus-ring press flex w-full flex-col items-center gap-1.5 rounded-xl"
              >
                <span
                  className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-elevated text-[22px] transition-shadow duration-200 ${
                    active ? `ring-3 ${tone.ring}` : "ring-1 ring-border"
                  }`}
                >
                  <Photo candidate={c} sizes={PICK_PHOTO_SIZES} />
                </span>
                <span className={`text-[14px] font-semibold ${active ? tone.text : "text-foreground/85"}`}>
                  {c.alias}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={!chosen || sending}
        onClick={submit}
        className={`focus-ring press mt-5 w-full rounded-xl py-3 text-[15px] font-bold text-background transition-opacity duration-200 disabled:opacity-35 ${tone.button}`}
      >
        {chosen ? fill(strings.submit, { name: chosen.alias }) : strings.choose}
      </button>
      {failed && (
        <p role="alert" className="mt-2 text-[13px] text-muted-foreground">
          {strings.error}
        </p>
      )}
    </div>
  );
}

function ResultList({
  ranked,
  pick,
  gender,
  strings,
}: {
  ranked: ReturnType<typeof rankVotes>["ranked"];
  pick?: string;
  gender: Gender;
  strings: Strings;
}) {
  const tone = TONE[gender];
  return (
    <ol className="divide-y divide-border px-5 py-1.5">
      {ranked.map((c) => (
        <li key={c.id} className="flex items-center gap-3 py-2.5">
          <span
            className={`font-lat w-8 shrink-0 text-[13px] font-bold ${c.rank === 1 ? tone.text : "text-muted-foreground"}`}
          >
            {fill(strings.rank, { rank: c.rank })}
          </span>
          <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-elevated text-[13px]">
            <Photo candidate={c} sizes={RESULT_PHOTO_SIZES} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] font-semibold">
                {c.alias}
                {c.id === pick && (
                  <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone.soft} ${tone.text}`}>
                    {strings.mine}
                  </span>
                )}
              </span>
              <span className="font-lat shrink-0 text-[13px] font-semibold text-foreground/70">
                {c.percent}% · {fill(strings.votes, { count: c.count })}
              </span>
            </div>
            <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${tone.soft}`}>
              <div
                className={`h-full rounded-full ${tone.bar} transition-[width] duration-500 ease-soft`}
                style={{ width: `${c.percent}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Photo({ candidate, sizes }: { candidate: VoteCandidate; sizes: string }) {
  // 사진이 없으면 옅은 사람 모양 — 출연진 카드와 같은 태도다(이름은 바로 옆에 있다).
  if (!candidate.profileImageUrl) {
    return <UserRound aria-hidden className="absolute inset-0 m-auto size-1/2 text-muted-foreground/40" />;
  }
  return <Image src={candidate.profileImageUrl} alt="" fill sizes={sizes} className="object-cover object-top" />;
}
