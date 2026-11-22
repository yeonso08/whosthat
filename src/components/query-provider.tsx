"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

/** 같은 현황을 이 시간 안에는 다시 부르지 않는다 — 칩에서 투표 화면으로 넘어갈 때 등. */
const STALE_MS = 30_000;

/**
 * 브라우저에서 API 를 부르는 곳(지금은 시청자 투표)의 캐시 — TanStack Query.
 *
 * 화면은 전부 정적이라 대부분의 페이지에서는 아무것도 안 부른다. 클라이언트 하나를
 * 컴포넌트 상태에 두는 건 서버 렌더마다 새로 만들게 하려는 것이다(요청 사이에 캐시가 새지 않게).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: STALE_MS, retry: 1 } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
