#!/usr/bin/env bash
# Vercel "Ignored Build Step"(vercel.json 의 ignoreCommand). **종료 코드가 거꾸로다**:
# 0 이면 빌드를 건너뛰고, 1 이상이면 빌드한다.
#
# 빌드 한 번이 전 페이지를 새로 굽느라 Build CPU Minutes 가 쌓인다(2026-11-22). 그래서:
# 1. 미리보기(Preview)는 짓지 않는다 — 작업 브랜치도 dev 도. 화면은 로컬 dev 서버로 본다
#    (2026-11-23 사용자 결정). 미리보기가 다시 필요해지면 이 줄부터 되돌린다.
# 2. 운영(Production)은 문서만 바뀐 새 커밋이면 건너뛴다. 다만 **바뀐 게 하나도 없으면
#    빌드한다** — "사이트에 반영"(Deploy Hook)과 `vercel redeploy` 는 새 커밋 없이 같은
#    커밋을 다시 굽는 것이라, 이걸 건너뛰면 데이터 반영이 막힌다.
# 모르는 경우(환경·이전 커밋을 모를 때, 비교에 실패할 때)는 언제나 빌드한다.

if [ "$VERCEL_ENV" = "preview" ]; then
  echo "미리보기는 짓지 않는다 — 건너뛴다"
  exit 0
fi

if [ "$VERCEL_ENV" != "production" ]; then
  echo "환경을 모른다 — 빌드한다"
  exit 1
fi

# 운영에서 마지막으로 성공한 배포의 커밋. 없으면 비교할 수 없으니 빌드한다 —
# 여기서 HEAD^ 로 떨어지면 Deploy Hook 빌드를 문서 커밋으로 오인해 건너뛸 수 있다.
base="$VERCEL_GIT_PREVIOUS_SHA"
if [ -z "$base" ]; then
  echo "이전 운영 배포의 커밋을 모른다 — 빌드한다"
  exit 1
fi

# 같은 커밋을 다시 굽는 경우(Deploy Hook·redeploy) — 데이터 반영이라 빌드한다.
git diff --quiet "$base" HEAD
all=$?
if [ "$all" -eq 0 ]; then
  echo "커밋 변화 없음(데이터 반영) — 빌드한다"
  exit 1
fi
if [ "$all" -ne 1 ]; then
  echo "비교를 못 했다 — 빌드한다"
  exit 1
fi

# 사이트 빌드에 들어가지 않는 것: 문서·홍보 자료·마크다운·GitHub Actions.
git diff --quiet "$base" HEAD -- . \
  ':(exclude)docs' \
  ':(exclude)marketing' \
  ':(exclude).github' \
  ':(exclude,glob)**/*.md'
site=$?

if [ "$site" -eq 0 ]; then
  echo "문서만 바뀌었다 — 운영 빌드를 건너뛴다"
  exit 0
fi
echo "사이트 파일이 바뀌었거나 비교를 못 했다 — 빌드한다"
exit 1
