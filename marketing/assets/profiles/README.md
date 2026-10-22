# 누꼬 계정 프로필 이미지

제작일: 2026-09-20 (KST)

수정: 2026-09-20 — 오른쪽 가장자리 얼룩과 원형 배경 경계를 제거한 수정본으로 아래 네 파일을 교체했다. 불투명 정사각형 PNG이며 저장된 파일을 다시 열어 확인했다.

런칭킷의 채널 간 일관성 원칙에 따라 세 채널에 같은 이미지를 사용한다.

| 용도 | 파일 |
| --- | --- |
| 인스타그램 | [nukko-instagram-profile.png](./nukko-instagram-profile.png) |
| 네이버 블로그 | [nukko-naver-blog-profile.png](./nukko-naver-blog-profile.png) |
| 쓰레드 | [nukko-threads-profile.png](./nukko-threads-profile.png) |
| 공통 원본 | [nukko-profile-master.png](./nukko-profile-master.png) |

- 실제 출력: 1254 × 1254px PNG. 채널별 파일은 공통 원본의 동일한 사본이다.
- 검은 배경에 흰색 소문자 `nukko`를 배치했다. 원형 크롭 시 글자가 잘리지 않도록 여백을 확보했다.
- 제작 방식: 내장 image_gen. Manrope 800을 참고하도록 요청한 AI 생성 워드마크로, 실제 폰트 파일을 조판한 결과와 정확히 동일함을 보장하지 않는다.
- 원본을 눈으로 확인해 철자와 여백을 점검했다. 실제 계정 업로드 후 축소 표시 상태는 추가 확인이 필요하다.
- 업로드할 때 중앙 정렬을 유지하고 과도하게 확대하지 않는다.

## 생성 프롬프트

```text
Use case: logo-brand
Asset type: shared Instagram, Naver Blog and Threads profile picture for Korean entertainment cast Instagram archive nukko.
Primary request: Create a single finished square raster profile avatar using only the existing Latin text wordmark "nukko". Match Manrope ExtraBold weight 800 geometric sans serif as closely as possible, tight letter spacing -0.04em. All lowercase, exact spelling nukko. No new symbol or character.
Scene/backdrop: perfectly solid near-black #0a0a0c edge-to-edge.
Subject: off-white #f4f4f6 wordmark "nukko" centered optically horizontally and vertically, occupying 66 percent of canvas width, generous clear space for circular social-avatar crop.
Style: immaculate flat typographic identity, crisp edges, no dimensionality, no texture.
Composition: 1024x1024 square, one single avatar, no mockup, no contact sheet. Entire word must fit comfortably within central circular safe zone.
Text (verbatim): "nukko"
Avoid: other text, domain suffix, Korean lettering, platform logos, icons, borders, gradients, shadows, watermark, decorative elements.
```

## 배경 수정 프롬프트 (내장 image_gen, 기존 원본 편집)

```text
Edit this profile avatar to fix defective background. Keep the exact existing lowercase "nukko" letter shapes, word size, placement, and generous margins. Replace ALL background across the entire SQUARE canvas including corners with perfectly uniform opaque solid #0a0a0c. Remove the circular disc boundary entirely, remove transparency, remove ALL gray smudges, blocks, grain and noise especially on the far right edge. This must be an edge-to-edge flat solid square background, NOT a circle sitting on another background. Keep wordmark off-white #f4f4f6 and crisp. Flat clean digital artwork, zero texture, no gradient, no shadow, no new elements, no watermark, no other text. Preserve square aspect ratio.
```
