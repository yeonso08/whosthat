"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 모비온 배너. 자리가 둘이고, 한 방문자에게는 둘 중 하나만 뜬다.
 *
 * - `inline` — 휴대폰. 본문 아래 300×250(모바일 지면).
 * - `rail` — 데스크톱. 본문 오른쪽에 붙어 따라오는 160×600(웹 지면).
 *
 * **지면이 기기마다 따로인 건 모비온 쪽 사정이다.** 웹 지면(`platform: "W"`, 반응형)은
 * 휴대폰에서 스스로 광고를 안 띄우고(`HawkEyesMaker.js` 의 `checkLanding`), 모바일
 * 지면은 반응형이 아니라 데스크톱에서도 뜬다. 그래서 기기를 우리가 고른다 — 판정은
 * 모비온 스크립트의 전역 `mobileCheck` 를 그대로 쓴다. 기준이 갈리면 어느 기기에선
 * 둘 다 빠지거나 둘 다 뜬다.
 *
 * **데스크톱이어도 창이 좁으면(`RAIL_MEDIA` 미만) 아무것도 안 건다.** 옆 칸이 없는 폭에서
 * 세로 배너를 불러오면 화면에 안 보이는 광고가 노출로 잡힌다.
 *
 * **스니펫을 JSX 에 그대로 적지 않고 effect 로 넣는다.** 이 스크립트는 자기를 부른
 * `<script>` 바로 뒤에 iframe 을 끼워 넣는데(`document.currentScript`), React 가
 * 그린 인라인 스크립트는 클라이언트 내비게이션에서 실행되지 않는다.
 *
 * 광고를 걸지 말지는 쓰는 쪽이 정한다(`hasAdContent`, `components/ads.tsx` 참고).
 */

const MOBON_SCRIPT_SRC = "https://img.mobon.net/js/common/HawkEyesMaker.js";

/** 옆 칸이 서는 폭 — 기수 상세의 `lg:` 두 칸 배치와 짝이다. */
const RAIL_MEDIA = "(min-width: 1024px)";

/** 모비온 매체 센터에서 받은 지면 코드 — 값을 손대지 말고 콘솔에서 받은 그대로 둔다. */
const MOBON_FRAMES = {
  rail: {
    type: "banner",
    responsive: "Y",
    platform: "W",
    scriptCode: "1073270",
    frameCode: "69",
    width: "160",
    height: "600",
    settings: { cntad: "1", cntsr: "1" },
  },
  inline: {
    type: "banner",
    responsive: "N",
    platform: "M",
    scriptCode: "1073286",
    frameCode: "42",
    width: "300",
    height: "250",
    settings: { cntsr: "4" },
  },
};

type Placement = keyof typeof MOBON_FRAMES;

type Props = {
  placement: Placement;
};

declare global {
  interface Window {
    mobileCheck?: () => boolean;
  }
}

// 페이지를 옮겨 다녀도 라이브러리는 한 번만 받는다. 실패하면 비워서 다음 화면이 다시 시도한다.
let loading: Promise<void> | undefined;

function loadMobon(): Promise<void> {
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MOBON_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = undefined;
      reject(new Error("mobon script failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** 이 방문자에게 이 자리가 맞는가. 휴대폰은 `inline`, 넓은 데스크톱은 `rail` 만 참이다. */
function belongsHere(placement: Placement): boolean {
  const mobile = window.mobileCheck?.() ?? false;
  if (placement === "inline") return mobile;
  return !mobile && window.matchMedia(RAIL_MEDIA).matches;
}

export function MobonBanner({ placement }: Props) {
  const slot = useRef<HTMLDivElement>(null);
  // 자리가 정해진 뒤에만 높이를 잡는다 — 미리 잡으면 광고가 안 뜨는 기기에 빈 칸이 남는다.
  const [active, setActive] = useState(false);

  useEffect(() => {
    const box = slot.current;
    if (!box) return;
    let cancelled = false;

    loadMobon()
      .then(() => {
        if (cancelled || !belongsHere(placement)) return;
        setActive(true);
        const call = document.createElement("script");
        call.text = `new HawkEyes(${JSON.stringify(MOBON_FRAMES[placement])});`;
        box.appendChild(call);
      })
      // 광고 차단기 등으로 못 받으면 자리만 비운다 — 화면이 깨질 일은 아니다.
      .catch(() => {});

    return () => {
      cancelled = true;
      box.replaceChildren();
      setActive(false);
    };
  }, [placement]);

  const { width, height } = MOBON_FRAMES[placement];
  return (
    <div
      ref={slot}
      className="flex justify-center"
      style={active ? { minWidth: `${width}px`, minHeight: `${height}px` } : undefined}
    />
  );
}
