import { LocaleToggle } from "@/components/locale-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Wordmark } from "@/components/wordmark";
import { currentLocale, getDictionary } from "@/lib/i18n";

/** 워드마크·언어·라이트다크를 한 줄로 묶는다. 네 화면 헤더가 모두 이 줄로 시작한다. */
export async function SiteHeader() {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex items-center justify-between">
      <Wordmark />
      <div className="flex items-center gap-0.5">
        <LocaleToggle current={locale} label={dict.nav.language} />
        <ModeToggle label={dict.nav.theme} />
      </div>
    </div>
  );
}
