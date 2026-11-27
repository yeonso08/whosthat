#!/usr/bin/env bash
# Vercel "Ignored Build Step"(vercel.json 의 ignoreCommand). **종료 코드가 거꾸로다**:
# 0 이면 빌드를 건너뛰고, 1 이상이면 빌드한다.
#
# 빌드 한 번이 전 페이지를 새로 굽느라 Build CPU Minutes 가 쌓인다(2026-11-22). 그래서
# 미리보기(Preview)는 짓지 않는다 — 작업 브랜치도 dev 도. 화면은 로컬 dev 서버로 본다
# (2026-11-23 사용자 결정). 미리보기가 다시 필요해지면 이 줄부터 되돌린다.
#
# 운영(Production)은 언제나 빌드한다. "문서만 바뀐 커밋이면 건너뛴다" 를 두었다가
# 2026-11-27 에 뺐다 — "사이트에 반영"(Deploy Hook)은 main 의 맨 위 커밋을 다시 굽는데,
# 마지막 성공 운영 배포 이후 main 에 문서 커밋만 쌓여 있으면 그 빌드가 문서 커밋으로
# 읽혀 건너뛰어졌다. 커밋만 보고는 데이터 반영 빌드와 문서 커밋 빌드를 가를 수 없다.

if [ "$VERCEL_ENV" = "preview" ]; then
  echo "미리보기는 짓지 않는다 — 건너뛴다"
  exit 0
fi

echo "운영(또는 모르는 환경)은 빌드한다"
exit 1
