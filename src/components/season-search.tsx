"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { EmptyCard } from "@/components/empty-card";
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
  /** 검색 전에 보여 줄 것 — 홈의 "지난 기수" 목록이 그대로 들어온다. */
  children: ReactNode;
};

type HitProps = { member: IndexedMember; status: Dictionary["status"] };

const ROW =
  "focus-ring flex items-center gap-2 rounded-2xl px-3.5 py-3 transition-colors hover:bg-card";

/**
 * 기수 목록 위에 놓는 검색창.
 *
 * 입력이 비어 있으면 `children`(지난 기수 목록)을 그대로 두고, 뭔가 입력하면
 * 그 자리를 결과로 바꾼다. 목록을 두 벌 그리지 않으려고 서버가 그린 목록을
 * children 으로 받는다 — `SeasonRow` 를 여기서 import 하면 그 컴포넌트가 쓰는
 * `lib/data` 를 타고 원본 JSON 이 클라이언트 번들로 딸려 온다.
 */
export function SeasonSearch({ index, locale, text, status, children }: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(index, query), [index, query]);
  const searching = query.trim().length > 0;
  const nothing = results.seasons.length === 0 && results.members.length === 0;

  return (
    <>
      <div className="gutter pt-7">
        {/* 넓은 화면에서 폭을 묶는다 — 컨테이너를 다 쓰면 글자 하나 없는 띠가 된다. */}
        <InputGroup className="h-11 rounded-2xl border-transparent bg-card lg:h-12 lg:max-w-2xl">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.placeholder}
            aria-label={text.label}
          />
          {searching && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
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
        <EmptyCard>
          {text.emptyTitle}
          <br />
          {text.emptyHint}
        </EmptyCard>
      )}

      {searching && results.seasons.length > 0 && (
        <>
          <GroupHeading>{text.seasonsHeading}</GroupHeading>
          <section className="gutter-inset">
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
          </section>
        </>
      )}

      {searching && results.members.length > 0 && (
        <>
          <GroupHeading>{text.castHeading}</GroupHeading>
          <section className="gutter-inset">
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
          </section>

          {results.membersTruncated && (
            <p className="gutter pt-2 text-[12px] leading-relaxed text-muted-foreground">
              {text.truncated}{" "}
              <span className="font-lat">{text.truncatedExample}</span>
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
