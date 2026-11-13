"use client";

import { useEffect, useRef } from "react";

/**
 * 모비온 300×250 배너 한 자리.
 *
 * **지면이 둘인 건 모비온이 기기마다 지면을 따로 받기 때문이다.** 웹 지면
 * (`platform: "W"`, 반응형)은 휴대폰에서 스스로 광고를 안 띄우고(`HawkEyesMaker.js`
 * 의 `checkLanding`), 모바일 지면은 반응형이 아니라 데스크톱에서도 뜬다. 둘을 함께
 * 걸면 데스크톱에 두 장이 나오므로 기기를 보고 하나만 건다. 판정은 모비온 스크립트의
 * 전역 `mobileCheck` 를 그대로 쓴다 — 기준이 우리와 갈리면 어느 기기에선 둘 다 빠진다.
 *
 * **스니펫을 JSX 에 그대로 적지 않고 effect 로 넣는다.** 이 스크립트는 자기를 부른
 * `<script>` 바로 뒤에 iframe 을 끼워 넣는데(`document.currentScript`), React 가
 * 그린 인라인 스크립트는 클라이언트 내비게이션에서 실행되지 않는다 — 다른 기수로
 * 옮겨 가면 자리만 남고 광고가 안 뜬다.
 *
 * 광고를 걸지 말지는 쓰는 쪽이 정한다(`hasAdContent`, `components/ads.tsx` 참고).
 */

const MOBON_SCRIPT_SRC = "https://img.mobon.net/js/common/HawkEyesMaker.js";

/** 모비온 매체 센터에서 받은 지면 코드 — 값을 손대지 말고 콘솔에서 받은 그대로 둔다. */
const MOBON_FRAMES = {
  web: {
    type: "banner",
    responsive: "Y",
    platform: "W",
    scriptCode: "1073270",
    frameCode: "74",
    width: "300",
    height: "250",
    settings: { cntad: "1", cntsr: "1" },
  },
  mobile: {
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

export function MobonBanner() {
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = slot.current;
    if (!box) return;
    let cancelled = false;

    loadMobon()
      .then(() => {
        if (cancelled) return;
        const frame = window.mobileCheck?.() ? MOBON_FRAMES.mobile : MOBON_FRAMES.web;
        const call = document.createElement("script");
        call.text = `new HawkEyes(${JSON.stringify(frame)});`;
        box.appendChild(call);
      })
      // 광고 차단기 등으로 못 받으면 자리만 비운다 — 화면이 깨질 일은 아니다.
      .catch(() => {});

    return () => {
      cancelled = true;
      box.replaceChildren();
    };
  }, []);

  // 높이를 미리 잡아 둔다 — 광고가 늦게 끼어들며 아래 소개 문단을 밀어 내리지 않게.
  return (
    <div
      ref={slot}
      className="gutter mx-auto mt-10 flex min-h-[250px] max-w-[340px] justify-center"
    />
  );
}
