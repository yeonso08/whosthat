"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

/**
 * 줄은 서버가 그려서 내린다(`items`) — 링크를 만드는 사전·데이터가 클라이언트로
 * 딸려 오지 않게. 문구도 받기만 한다.
 */
type Props = {
  items: ReactNode[];
  shown: number;
  text: { more: string; less: string };
};

/**
 * 앞 몇 줄만 보이고 나머지는 접힌 목록 — 회차별 정리 모음의 기수 판.
 *
 * 처음엔 `<details>` 였는데, 여는 줄이 목록 한가운데 남고 펼친 줄이 위 목록과
 * 끊겨 다른 목록처럼 붙었다. 지금은 **한 목록이 그대로 길어지고, 버튼은 늘 판
 * 맨 아래에 있다**(펼치면 `접기`).
 *
 * 접힌 줄도 HTML 에 남긴다(`hidden`) — 크롤러가 모든 글로 가는 링크를 받아야 한다.
 */
export function FoldList({ items, shown, text }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const folded = items.length - shown;

  return (
    <>
      {/* 줄 사이 선은 위쪽 테두리로 긋는다 — `divide-y` 는 숨긴 줄 앞의 줄에도 밑줄을
          남겨서, 접힌 판의 마지막 줄 아래에 선이 하나 더 생겼다. */}
      <ul id={id}>
        {items.map((item, i) => (
          <li
            key={i}
            className={`border-t border-border first:border-t-0 ${!open && i >= shown ? "hidden" : ""}`}
          >
            {item}
          </li>
        ))}
      </ul>
      {folded > 0 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="press focus-ring mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-elevated py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          {open ? text.less : text.more}
          <ChevronDown
            aria-hidden
            className={`size-4 transition-transform duration-200 ease-soft ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </>
  );
}
