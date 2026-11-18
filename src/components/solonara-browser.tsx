"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { EmptyCard } from "@/components/empty-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { matchesQuery } from "@/lib/search";
import type { SolonaraItemKind } from "@/lib/types";

/**
 * 판·아이콘은 서버가 그려서 내린다 — 여기서 `SolonaraSeasonCard` 를 import 하면 그게
 * 쓰는 사전과 데이터가 클라이언트 번들에 딸려 온다(`CollectionBrowser` 와 같은 이유).
 */
type Props = {
  kinds: { id: SolonaraItemKind; label: string; icon: ReactNode }[];
  items: { id: string; keywords: string; kinds: SolonaraItemKind[]; card: ReactNode }[];
  text: { all: string; placeholder: string; clear: string; empty: string };
};

/**
 * 숙소와 게임 모음의 종류 칩 + 찾기 + 판 격자.
 *
 * 칩이 있는 이유: 이 화면에 오는 사람은 "첫인상 게임 뭐 있지" 처럼 **종류로** 찾는다.
 * 칩을 누르면 그 종류가 없는 기수는 빠지고, 남은 판 안에서도 그 종류만 남는다
 * (판 안의 거르기는 `data-kind` 를 본 CSS 가 한다 — `SolonaraSeasonCard`).
 * 칩을 뺐다가 같은 날 되돌렸다(2026-11-18, 사용자 결정).
 *
 * 판은 줄 순서 격자다(34기 옆에 33기). 단(column)으로 빈틈없이 쌓아 봤더니 34기
 * 옆에 18기가 와서 반려됐다(2026-11-18) — 기수 순서가 옆으로 읽혀야 한다. 판 키가
 * 달라 짧은 판 아래가 비는 건 감수한다(`items-start` 로 판을 늘리지는 않는다).
 *
 * 안 보이는 판도 HTML 에는 남긴다(`hidden`) — 크롤러가 모든 기수를 받아야 한다.
 */
export function SolonaraBrowser({ kinds, items, text }: Props) {
  const [kind, setKind] = useState<SolonaraItemKind | null>(null);
  const [query, setQuery] = useState("");

  const visible = items.map(
    (item) =>
      (kind === null || item.kinds.includes(kind)) && matchesQuery(item.keywords, query),
  );
  const chips = [{ id: null, label: text.all, icon: null }, ...kinds];

  return (
    <div className="pt-7 lg:pt-9">
      <div className="gutter flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
        >
          {chips.map((chip) => {
            const active = chip.id === kind;
            return (
              <button
                key={chip.id ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setKind(chip.id)}
                className={`press focus-ring flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold whitespace-nowrap transition-colors duration-200 ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-card text-foreground/80 shadow-soft hover:text-foreground"
                }`}
              >
                {chip.icon}
                {chip.label}
              </button>
            );
          })}
        </div>

        <InputGroup className="h-11 shrink-0 rounded-xl border-transparent bg-card px-1 shadow-soft transition-shadow duration-200 ease-soft focus-within:shadow-lifted lg:w-[280px]">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.placeholder}
            aria-label={text.placeholder}
            // 16px 미만이면 iOS 가 입력할 때 화면을 확대한다.
            className="text-base md:text-[15px]"
          />
          {query && (
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

      <div className="pt-5">
        {visible.some(Boolean) ? (
          <div
            data-kind={kind ?? undefined}
            className="group/solonara gutter grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          >
            {items.map((item, i) => (
              <div key={item.id} hidden={!visible[i]}>
                {item.card}
              </div>
            ))}
          </div>
        ) : (
          <EmptyCard>{text.empty}</EmptyCard>
        )}
      </div>
    </div>
  );
}

/**
 * 판 안의 접기 — 앞 게임 몇 개만 펼치고 나머지는 버튼 뒤에 둔다(2026-11-18, 판 키가
 * 기수마다 달라 격자에 빈 데가 생겨서). `FoldList` 와 같은 동작이지만 그건 줄마다
 * 선을 긋는 목록이라, 종류 제목이 섞인 이 판에는 따로 둔다.
 *
 * 종류 칩을 누르면 다 펼친다(`group-data-[kind]`) — 고른 종류가 접힌 쪽에만 있으면
 * 판에 숙소와 버튼만 남는다. 접힌 게임도 HTML 에 남긴다(`hidden`).
 */
export function SolonaraFold({
  shown,
  rest,
  text,
}: {
  shown: ReactNode;
  rest: ReactNode;
  text: { more: string; less: string };
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      {shown}
      <div id={id} className={open ? "" : "hidden group-data-[kind]/solonara:block"}>
        {rest}
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="press focus-ring mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-elevated py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors duration-200 group-data-[kind]/solonara:hidden hover:text-foreground"
      >
        {open ? text.less : text.more}
        <ChevronDown
          aria-hidden
          className={`size-4 transition-transform duration-200 ease-soft ${open ? "rotate-180" : ""}`}
        />
      </button>
    </>
  );
}
