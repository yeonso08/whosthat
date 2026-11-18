"use client";

import { Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { EmptyCard } from "@/components/empty-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { matchesQuery } from "@/lib/search";

/**
 * 판은 서버가 그려서 내린다(`card`) — 여기서 `CoupleCard` 를 import 하면 그게 쓰는
 * 사전과 데이터가 클라이언트 번들에 딸려 온다. `keywords` 는 화면에 안 나오는
 * 걸러내기 전용 글이다.
 */
type Props = {
  groups: {
    id: string;
    name: string;
    count: string;
    items: { id: string; keywords: string; card: ReactNode }[];
  }[];
  text: { placeholder: string; clear: string; empty: string };
};

/**
 * 모음 화면(최종 커플·회차별 정리)의 프로그램 탭 + 찾기.
 *
 * 처음엔 프로그램을 위아래로 쭉 이어 붙였는데, 그러면 둘째 프로그램은 첫째의 기수를
 * 다 지나야 나오고 기수가 늘수록 더 멀어진다. **프로그램은 탭으로 가르고, 그 안에서는
 * 기수 번호나 이름을 쳐서 찾는다.**
 *
 * 찾는 말은 프로그램을 안 가린다 — 지금 탭에는 없고 다른 탭에만 있으면 그 탭을
 * 보여 준다. `국화` 를 치고 "없습니다" 를 본 사람이 탭을 바꿔 다시 쳐 보리라고
 * 기대할 수 없다.
 *
 * 안 보이는 탭도 지우지 않고 둔다(`keepMounted`) — 크롤러가 받는 HTML 에 모든
 * 프로그램의 커플이 들어 있어야 한다.
 */
export function CollectionBrowser({ groups, text }: Props) {
  const [picked, setPicked] = useState(groups[0]?.id);
  const [query, setQuery] = useState("");

  const filtered = groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => matchesQuery(item.keywords, query)),
  }));
  const pickedHasHits = filtered.some(
    (group) => group.id === picked && group.items.length > 0,
  );
  const active = pickedHasHits
    ? picked
    : (filtered.find((group) => group.items.length > 0)?.id ?? picked);

  return (
    <Tabs value={active} onValueChange={setPicked} className="gap-0">
      <div className="gutter flex flex-col gap-4 pt-7 sm:flex-row sm:items-center sm:justify-between lg:pt-9">
        <TabsList variant="line" className="h-auto gap-5 p-0">
          {groups.map((group) => (
            <TabsTrigger
              key={group.id}
              value={group.id}
              className="h-10 flex-none items-baseline gap-1.5 rounded-none border-0 px-0 text-[16px] font-bold tracking-[-0.02em] text-muted-foreground group-data-horizontal/tabs:after:bottom-0 data-active:text-foreground dark:data-active:bg-transparent"
            >
              {group.name}
              <span className="font-lat text-[12px] font-semibold text-muted-foreground">
                {group.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <InputGroup className="h-11 rounded-xl border-transparent bg-card px-1 shadow-soft transition-shadow duration-200 ease-soft focus-within:shadow-lifted sm:w-[280px]">
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

      {filtered.map((group) => (
        <TabsContent key={group.id} value={group.id} keepMounted className="pt-5">
          {group.items.length > 0 ? (
            <div className="gutter grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {group.items.map((item) => (
                <div key={item.id}>{item.card}</div>
              ))}
            </div>
          ) : (
            <EmptyCard>{text.empty}</EmptyCard>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
