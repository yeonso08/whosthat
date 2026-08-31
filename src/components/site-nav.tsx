import { LocaleToggle } from "@/components/locale-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Wordmark } from "@/components/wordmark";
import { currentLocale, getDictionary } from "@/lib/i18n";

/**
 * 화면 맨 위에 늘 붙어 있는 바. 워드마크 · 언어 · 라이트다크, 셋뿐이다.
 *
 * **프로그램 링크는 두지 않는다**(2026-08-31 에 뺐다). 둘일 때는 한 줄에
 * 들어갔지만 프로그램은 계속 는다 — 이름을 하나씩 붙이는 자리는 어느 개수에서
 * 반드시 넘치고, 그때 "더보기" 를 만들면 상단 바가 두 번째 목록 화면이 된다.
 * 프로그램 목록은 홈이 지고, 홈으로 가는 길은 워드마크 하나로 충분하다
 * (안쪽 화면에는 제목 옆 되돌아가기도 있다).
 *
 * **바깥은 화면 폭을 다 쓰고 안쪽만 컨테이너에 맞춘다.** 아래로 스크롤해도
 * 경계선이 화면을 가로지르는 게 이 바가 화면의 일부로 읽히게 하는 부분이다.
 */
export async function SiteNav() {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  return (
    // 경계선을 반투명으로 내리고 블러를 키웠다 — 실선 한 줄이 바를 화면에
    // 얹은 자막처럼 보이게 했다. 아래 내용이 비쳐 흐르는 편이 바가 화면의
    // 일부로 읽힌다.
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="gutter mx-auto flex h-15 w-full max-w-[1280px] items-center gap-6 lg:h-[68px]">
        <Wordmark />

        <div className="ml-auto flex items-center gap-1">
          <LocaleToggle current={locale} label={dict.nav.language} />
          <ModeToggle label={dict.nav.theme} />
        </div>
      </div>
    </header>
  );
}
