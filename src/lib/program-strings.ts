import { DEFAULT_LOCALE, type Locale } from "./locales";
import type { Program, ProgramStrings } from "./types";

/**
 * API 에서 받은 프로그램 문구를 담아 두는 자리.
 *
 * **왜 이런 게 필요한가**: 화면 곳곳(`localizeProgramName`·`localizeSeasonLabel`
 * ·`formatProgramSummary` 등 20곳 남짓)이 `programId` 만 들고 문구를 찾는다.
 * 문구가 사전(코드)에 있을 땐 그냥 import 하면 됐는데, DB 로 옮기면서 데이터를
 * 따라다녀야 한다. 그 함수들 시그니처를 전부 바꾸는 대신, 데이터를 읽는 곳
 * (`getPrograms`)이 여기에 넣어 두고 나머지는 여기서 꺼내 쓴다.
 *
 * **안전한 이유**: 화면에서 프로그램 이름을 부르려면 그 프로그램을 먼저
 * 가져왔어야 하고, 데이터를 가져오는 길은 `getPrograms()` 하나뿐이다. 그래서
 * 읽기 전에 반드시 채워진다. 값은 매번 같은 것으로 덮어써지므로 렌더가 겹쳐도
 * 문제가 없다.
 */
/**
 * **`globalThis` 에 붙이는 이유**: Next 가 서버 코드를 라우트별 번들로 쪼개면서
 * 이 모듈이 복제되면, `data.ts` 가 채운 Map 과 `i18n.ts` 가 읽는 Map 이 서로
 * 다른 객체가 된다. 실제로 그랬다 — 모듈 지역 변수로 뒀더니 빌드는 통과하는데
 * 문구가 언제나 사전 값으로 떨어졌다(DB 값을 넣어 두고 확인). 프로세스에 하나만
 * 두면 어느 복사본이 읽어도 같은 것을 본다.
 */
const registry: Map<string, ProgramStrings> = ((
  globalThis as typeof globalThis & {
    __nukkoProgramStrings?: Map<string, ProgramStrings>;
  }
).__nukkoProgramStrings ??= new Map());

const key = (programId: string, locale: string) => `${programId}:${locale}`;

/** `getPrograms()` 가 부른다. 다른 곳에서 부를 일이 없다. */
export function registerProgramStrings(programs: Program[]): void {
  for (const program of programs) {
    for (const [locale, strings] of Object.entries(program.strings ?? {})) {
      if (strings) registry.set(key(program.id, locale), strings);
    }
  }
}

/**
 * 그 프로그램이 이 언어로 쓰는 말. 없으면 한국어로 떨어진다.
 *
 * **한국어로 떨어지는 게 정상 동작이다** — 관리자에서 프로그램을 만들고 아직
 * 영어·일본어를 안 넣은 상태다. 화면은 한국어로 뜨고, 번역을 채우면 그때
 * 바뀐다. 가명·특집이 이미 그렇게 동작하고 있고, 상용 CMS 도 이 방식이다
 * (Payload 는 `fallback` 이 기본값). 여기서 던지면 사이트가 죽는다.
 */
export function lookupProgramStrings(
  programId: string,
  locale: Locale,
): ProgramStrings | undefined {
  return (
    registry.get(key(programId, locale)) ??
    registry.get(key(programId, DEFAULT_LOCALE))
  );
}

/** 이 프로그램의 문구가 (어떤 언어로든) 있나. `getPrograms()` 가 거를 때 쓴다. */
export function hasRegisteredStrings(programId: string): boolean {
  return registry.has(key(programId, DEFAULT_LOCALE));
}
