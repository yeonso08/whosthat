"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { EmptyCard } from "@/components/empty-card";
import { ListCard } from "@/components/list-card";
import { GroupHeading } from "@/components/page-heading";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { Dictionary, Locale } from "@/lib/i18n";
import { castMemberHref, seasonHref } from "@/lib/links";
import { search } from "@/lib/search";
import type { IndexedMember, SearchIndex } from "@/lib/types";

type Props = {
  index: SearchIndex;
  locale: Locale;
  /**
   * 사전을 통째로 들고 오면 세 언어가 클라이언트 번들에 실린다 — 쓰는 묶음만 받는다.
   *
   * 프로그램 화면은 `placeholder`·`seasonsHeading` 을 그 프로그램의 말로 갈아
   * 끼워 넘긴다(`기수` / `시즌`). 사전의 값은 둘이 섞이는 홈에서만 쓰인다.
   */
  text: Dictionary["search"];
  status: Dictionary["status"];
  /**
   * 홈처럼 화면이 가운데로 서는 자리. 검색창과 결과 묶음이 좁은 기둥으로
   * 모인다 — 1280px 을 다 쓰면 글자 하나 없는 띠가 되고, 홈에서는 그 띠가
   * 가운데 정렬된 머리글과도 어긋난다.
   */
  hero?: boolean;
  /** 검색 전에 보여 줄 것 — 홈의 "지난 기수" 목록이 그대로 들어온다. */
  children: ReactNode;
};

type HitProps = { member: IndexedMember; status: Dictionary["status"] };

/**
 * 결과 한 줄. `SeasonRow` 와 같은 판(`ListCard`) 안에 들어가므로 높이·여백을
 * 그쪽에 맞춘다 — 검색 전후로 줄 높이가 달라지면 목록이 튀어 보인다.
 */
const ROW =
  "focus-ring press flex items-center gap-2.5 px-4 py-3.5 hover:bg-elevated/60 lg:px-5";

/**
 * 기수 목록 위에 놓는 검색창.
 *
 * 입력이 비어 있으면 `children`(지난 기수 목록)을 그대로 두고, 뭔가 입력하면
 * 그 자리를 결과로 바꾼다. 목록을 두 벌 그리지 않으려고 서버가 그린 목록을
 * children 으로 받는다 — `SeasonRow` 를 여기서 import 하면 그 컴포넌트가 쓰는
 * `lib/data` 를 타고 원본 JSON 이 클라이언트 번들로 딸려 온다.
 */
export function SeasonSearch({
  index,
  locale,
  text,
  status,
  hero = false,
  children,
}: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(index, query), [index, query]);
  const searching = query.trim().length > 0;
  const nothing = results.seasons.length === 0 && results.members.length === 0;

  // 홈은 좁은 기둥으로 모으고, 프로그램 화면은 그 화면이 이미 폭을 묶고 있어
  // 여기서 또 줄이면 위아래 카드와 오른쪽 끝이 어긋난다.
  const column = hero ? "mx-auto w-full max-w-[560px]" : "";
  const resultsColumn = hero ? "mx-auto w-full max-w-[640px]" : "";

  return (
    <>
      <div className={`gutter ${hero ? "pt-8 lg:pt-10" : "pt-7"}`}>
        {/*
         * 테두리 대신 그림자로 세운 입력창. 선으로 그린 상자는 폼 필드로
         * 읽히는데, 이 사이트에서 이건 폼이 아니라 화면의 주인공이다 —
         * 착지하자마자 사람을 찾는 게 존재 이유라 제일 먼저 눈에 걸려야 한다.
         */}
        <InputGroup
          className={`h-13 rounded-2xl border-transparent bg-card px-1.5 shadow-soft transition-shadow duration-200 ease-soft focus-within:shadow-lifted lg:h-14 ${column}`}
        >
          <InputGroupAddon>
            <Search className="size-4.5 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.placeholder}
            aria-label={text.label}
            className="text-[15px] md:text-[15px]"
          />
          {searching && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                className="size-8 rounded-full"
                aria-label={text.clear}
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
        <EmptyCard className={resultsColumn}>
          {text.emptyTitle}
          <br />
          {text.emptyHint}
        </EmptyCard>
      )}

      {searching && results.seasons.length > 0 && (
        <div className={resultsColumn}>
          <GroupHeading>{text.seasonsHeading}</GroupHeading>
          <ListCard>
            {results.seasons.map((season) => (
              <Link
                key={season.id}
                href={seasonHref(locale, season.programId, season.id)}
                className={ROW}
              >
                {/* 프로그램 이름은 여러 프로그램을 한 인덱스에 담았을 때만 실린다. */}
                {season.programName && (
                  <span className="shrink-0 text-[13px] text-muted-foreground">
                    {season.programName}
                  </span>
                )}
                <span className="font-bold tracking-tight">{season.label}</span>
                {season.special && (
                  <span className="truncate text-[13px] text-muted-foreground">
                    {season.special}
                  </span>
                )}
                <span className="font-lat ml-auto shrink-0 text-xs text-muted-foreground">
                  {season.coverage}
                </span>
              </Link>
            ))}
          </ListCard>
        </div>
      )}

      {searching && results.members.length > 0 && (
        <div className={resultsColumn}>
          <GroupHeading>{text.castHeading}</GroupHeading>
          <ListCard>
            {results.members.map(({ member, programId, seasonId, seasonLabel }) => (
              <Link
                key={`${programId}-${member.id}`}
                href={castMemberHref(locale, programId, seasonId, member.id)}
                className={ROW}
              >
                <span className="font-bold tracking-tight">{member.alias}</span>
                <HitStatus member={member} status={status} />
                <span className="font-lat ml-auto shrink-0 text-xs text-muted-foreground">
                  {seasonLabel}
                </span>
              </Link>
            ))}
          </ListCard>

          {results.membersTruncated && (
            <p className="gutter pt-3 text-[12px] leading-relaxed text-muted-foreground">
              {text.truncated}{" "}
              <span className="font-lat">{text.truncatedExample}</span>
            </p>
          )}
        </div>
      )}
    </>
  );
}

/**
 * 결과 한 줄의 상태 표시. `CastCard` 의 `CardStatus` 와 같은 장치다 — 반환
 * 타입을 못 박아 두면 `AccountStatus` 에 상태가 늘 때 여기서 컴파일 에러가 난다.
 */
function HitStatus({ member, status }: HitProps): ReactElement {
  switch (member.status) {
    case "found":
      return (
        <span className="font-mono truncate text-[13px] font-medium text-verified">
          @{member.handle}
        </span>
      );

    case "none":
      return (
        <span className="truncate text-[13px] text-muted-foreground">
          {status.none}
        </span>
      );

    case "searching":
      return (
        <span className="truncate text-[13px] text-searching">
          {status.searching}
        </span>
      );
  }
}
