"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { castMemberHref, seasonHref } from "@/lib/links";
import { search } from "@/lib/search";
import {
  formatCoverage,
  type IndexedMember,
  type SearchIndex,
} from "@/lib/types";

type Props = { index: SearchIndex };
type HitProps = { member: IndexedMember };

/**
 * 기수·출연진을 한 목록에서 찾는 팔레트.
 *
 * `shouldFilter={false}` 로 cmdk 의 기본 점수 매기기를 끈다 — 그건 라틴 문자
 * 기준 퍼지 매칭이라 "22기 영수" 같은 복합 질의에서 엉뚱한 줄을 위로 올린다.
 * cmdk 에는 키보드 이동·포커스·ARIA 만 맡기고 무엇이 걸리는지는 `lib/search`
 * 가 정한다.
 */
export function SiteSearch({ index }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => search(index, query), [index, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="검색"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="검색"
        description="기수 번호, 특집 이름, 출연진 가명으로 찾는다."
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="기수 · 특집 · 가명으로 찾기"
          />
          <CommandList>
            <CommandEmpty className="text-[13px] leading-relaxed text-muted-foreground">
              찾는 게 없다.
              <br />
              기수 번호나 특집 이름으로도 찾을 수 있다.
            </CommandEmpty>

            {results.seasons.length > 0 && (
              <CommandGroup heading="기수">
                {results.seasons.map((season) => (
                  <CommandItem
                    key={season.id}
                    value={season.id}
                    onSelect={() => go(seasonHref(season.id))}
                  >
                    <span className="font-bold tracking-tight">
                      {season.label}
                    </span>
                    {season.special && (
                      <span className="truncate text-[13px] text-muted-foreground">
                        {season.special}
                      </span>
                    )}
                    <CommandShortcut className="font-lat">
                      {formatCoverage(season.coverage)}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.members.length > 0 && (
              <CommandGroup heading="출연진">
                {results.members.map(({ member, seasonId, seasonLabel }) => (
                  <CommandItem
                    key={member.id}
                    value={member.id}
                    onSelect={() => go(castMemberHref(seasonId, member.id))}
                  >
                    <span className="font-bold tracking-tight">
                      {member.alias}
                    </span>
                    <HitStatus member={member} />
                    <CommandShortcut className="font-lat">
                      {seasonLabel}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.membersTruncated && (
              <p className="px-3 pt-1 pb-3 text-[12px] leading-relaxed text-muted-foreground">
                같은 가명이 기수마다 있다. 기수를 함께 치면 좁혀진다 — 예:{" "}
                <span className="font-lat">22기 영수</span>
              </p>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
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
