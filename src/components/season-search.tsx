"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { castMemberHref, seasonHref } from "@/lib/links";
import { search } from "@/lib/search";
import {
  formatCoverage,
  type IndexedMember,
  type SearchIndex,
} from "@/lib/types";

type Props = {
  index: SearchIndex;
  /** 검색 전에 보여 줄 것 — 홈의 "지난 기수" 목록이 그대로 들어온다. */
  children: ReactNode;
};

type HitProps = { member: IndexedMember };

/** 지난 기수 목록의 제목 줄과 같은 자리·같은 무게를 쓴다. 검색 결과도 그 목록의 한 형태다. */
const GROUP_HEADING = "px-5 pt-7 pb-2 text-[13px] font-bold text-muted-foreground";

const ROW =
  "flex items-center gap-2 rounded-2xl px-3.5 py-3 transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * 기수 목록 위에 놓는 검색창.
 *
 * 입력이 비어 있으면 `children`(지난 기수 목록)을 그대로 두고, 뭔가 입력하면
 * 그 자리를 결과로 바꾼다. 목록을 두 벌 그리지 않으려고 서버가 그린 목록을
 * children 으로 받는다 — `SeasonRow` 를 여기서 import 하면 그 컴포넌트가 쓰는
 * `lib/data` 를 타고 원본 JSON 이 클라이언트 번들로 딸려 온다.
 */
export function SeasonSearch({ index, children }: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(index, query), [index, query]);
  const searching = query.trim().length > 0;
  const nothing = results.seasons.length === 0 && results.members.length === 0;

  return (
    <>
      <div className="px-5 pt-7">
        <InputGroup className="h-11 rounded-2xl border-transparent bg-card">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="기수 · 특집 · 가명 검색"
            aria-label="기수와 출연진 검색"
          />
          {searching && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="검색어 지우기"
                onClick={() => setQuery("")}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {!searching && children}

      {searching && nothing && (
        <p className="mt-6 mx-5 rounded-2xl bg-card px-5 py-8 text-center text-[13px] leading-relaxed text-muted-foreground">
          찾는 항목이 없습니다.
          <br />
          기수 번호나 특집 이름으로도 찾을 수 있습니다.
        </p>
      )}

      {searching && results.seasons.length > 0 && (
        <>
          <h2 className={GROUP_HEADING}>기수</h2>
          <section className="px-2">
            {results.seasons.map((season) => (
              <Link key={season.id} href={seasonHref(season.id)} className={ROW}>
                <span className="font-bold tracking-tight">{season.label}</span>
                {season.special && (
                  <span className="truncate text-[13px] text-muted-foreground">
                    {season.special}
                  </span>
                )}
                <span className="font-lat ml-auto shrink-0 text-xs text-muted-foreground">
                  {formatCoverage(season.coverage)}
                </span>
              </Link>
            ))}
          </section>
        </>
      )}

      {searching && results.members.length > 0 && (
        <>
          <h2 className={GROUP_HEADING}>출연진</h2>
          <section className="px-2">
            {results.members.map(({ member, seasonId, seasonLabel }) => (
              <Link
                key={member.id}
                href={castMemberHref(seasonId, member.id)}
                className={ROW}
              >
                <span className="font-bold tracking-tight">{member.alias}</span>
                <HitStatus member={member} />
                <span className="font-lat ml-auto shrink-0 text-xs text-muted-foreground">
                  {seasonLabel}
                </span>
              </Link>
            ))}
          </section>

          {results.membersTruncated && (
            <p className="px-5 pt-2 text-[12px] leading-relaxed text-muted-foreground">
              같은 가명이 기수마다 있습니다. 기수를 함께 입력하면 좁혀집니다 —
              예: <span className="font-lat">22기 영수</span>
            </p>
          )}
        </>
      )}
    </>
  );
}

/**
 * 결과 한 줄의 상태 표시. `CastCard` 의 `CardStatus` 와 같은 장치다 — 반환
 * 타입을 못 박아 두면 `AccountStatus` 에 상태가 늘 때 여기서 컴파일 에러가 난다.
 */
function HitStatus({ member }: HitProps): ReactElement {
  switch (member.status) {
    case "found":
      return (
        <span className="font-lat truncate text-[13px] font-semibold">
          @{member.handle}
        </span>
      );

    case "none":
      return (
        <span className="truncate text-[13px] text-muted-foreground">
          계정 없음
        </span>
      );

    case "searching":
      return (
        <span className="truncate text-[13px] text-searching">찾는 중</span>
      );
  }
}
