import { LocaleToggle } from "@/components/locale-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { NavLinks } from "@/components/nav-links";
import { Wordmark } from "@/components/wordmark";
import { getPrograms } from "@/lib/data";
import { currentLocale, getDictionary, localizeProgramName } from "@/lib/i18n";
import { programHref } from "@/lib/links";

/**
 * 화면 맨 위에 늘 붙어 있는 바. 워드마크 · 프로그램 링크 · 언어 · 라이트다크.
 *
 * **페이지마다 워드마크를 다시 얹던 것을 여기로 올렸다.** 프로그램이 둘 이상이
 * 되면서 "지금 어느 프로그램을 보고 있고 다른 건 뭐가 있나" 가 화면에 늘 있어야
 * 하는 정보가 됐다 — 왓챠피디아·라프텔·티빙이 다 같은 자리에 같은 것을 둔다.
 * 그전에는 그걸 알려면 홈까지 두 번 올라가야 했다.
 *
 * **바깥은 화면 폭을 다 쓰고 안쪽만 컨테이너에 맞춘다.** 아래로 스크롤해도
 * 경계선이 화면을 가로지르는 게 이 바가 화면의 일부로 읽히게 하는 부분이다.
 *
 * 프로그램 링크는 좁은 화면에서 숨는다 — 이름 둘만 돼도 워드마크·토글과 한 줄에
 * 안 들어간다. 모바일은 홈의 포스터 격자가 그 일을 한다.
 */
export async function SiteNav() {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  const items = getPrograms().map((program) => ({
    href: programHref(locale, program.id),
    name: localizeProgramName(program.id, locale),
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="gutter mx-auto flex h-14 w-full max-w-[1280px] items-center gap-5 lg:h-16">
        <Wordmark />

        <div className="hidden md:block">
          <NavLinks items={items} />
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <LocaleToggle current={locale} label={dict.nav.language} />
          <ModeToggle label={dict.nav.theme} />
        </div>
      </div>
    </header>
  );
}
