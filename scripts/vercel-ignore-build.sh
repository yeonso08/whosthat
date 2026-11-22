#!/usr/bin/env bash
# Vercel "Ignored Build Step"(vercel.json 의 ignoreCommand). **종료 코드가 거꾸로다**:
# 0 이면 빌드를 건너뛰고, 1 이상이면 빌드한다.
#
# 문서만 바뀐 커밋은 미리보기(Preview) 빌드를 건너뛴다 — 빌드 한 번이 전 페이지를 새로
# 굽느라 Build CPU Minutes 가 쌓였다(2026-11-22). **운영(Production)은 언제나 빌드한다**:
# "사이트에 반영"(Deploy Hook)은 새 커밋 없이 같은 커밋을 다시 굽는데, 여기서 차이만 보고
# 건너뛰면 데이터 반영이 막힌다. 모르는 경우(환경변수·이전 커밋이 없을 때)도 빌드한다.

if [ "$VERCEL_ENV" != "preview" ]; then
  echo "운영이거나 환경을 모른다 — 빌드한다"
  exit 1
fi

# 이 브랜치에서 마지막으로 배포된 커밋과 비교한다(없으면 바로 앞 커밋).
base="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"

# 사이트 빌드에 들어가지 않는 것: 문서·홍보 자료·마크다운·GitHub Actions.
git diff --quiet "$base" HEAD -- . \
  ':(exclude)docs' \
  ':(exclude)marketing' \
  ':(exclude).github' \
  ':(exclude,glob)**/*.md'
status=$?

if [ "$status" -eq 0 ]; then
  echo "문서만 바뀌었다 — 미리보기 빌드를 건너뛴다"
  exit 0
fi
# 1 = 사이트 파일이 바뀌었다, 그 밖(128 등) = 비교를 못 했다. 둘 다 빌드한다.
echo "사이트 파일이 바뀌었거나 비교를 못 했다 — 빌드한다"
exit 1
