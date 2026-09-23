# gitblog

한국어와 영어를 함께 쓰는 개발 블로그. [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) + [starlight-blog](https://starlight-blog-docs.vercel.app/)로 만들고 GitHub Pages에 배포합니다.

- 한국어: `/` — 기본 언어라 URL에 접두사가 없습니다.
- 영어: `/en/`

검색, 목차, 다크모드, 태그, 이전·다음 글, RSS는 테마가 제공합니다.
여기에 시리즈 차례, 링크 미리보기 이미지, 댓글을 더했습니다.

## 로컬에서 실행

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 정적 파일 생성
npm run preview  # 빌드 결과를 로컬에서 확인
```

> 개발 서버에서는 페이지를 넘길 때 화면 왼쪽 위에 무언가 잠깐 깜빡입니다. Vite가 CSS를 JS로 주입하느라 스타일이 붙기 전에 한 번 그리기 때문이고, `npm run preview`나 실제 사이트에서는 일어나지 않습니다.

## 글 쓰기

`src/content/docs/` 아래에 마크다운 파일을 만듭니다. 한국어는 루트, 영어는 `en/` 아래입니다.

```
src/content/docs/
├── blog/
│   └── blog-setup.md    → /blog/blog-setup/
└── en/blog/
    └── blog-setup.md    → /en/blog/blog-setup/
```

파일 이름이 같으면 서로의 번역본으로 묶입니다. 파일 이름이 곧 URL이므로 한글 대신 영문 슬러그를 쓰는 편이 좋습니다. 제목은 물론 한글로 씁니다.

### 프론트매터

```yaml
---
title: 블로그를 시작하며
description: 검색 결과와 링크 미리보기에 나오는 한 줄 요약.
excerpt: 목록 페이지에 보일 2~3줄 요약.
cover:
  alt: 이미지 설명 (필수)
  image: ../../../assets/blog/blog-setup.png
date: 2026-09-21
tags:
  - 생각
  - 회고
authors: nabong
draft: false
---
```

| 항목 | 설명 |
| --- | --- |
| `title` | 필수 |
| `description` | 검색엔진·SNS 미리보기용. 한글 기준 70~80자를 채우면 검색 결과에 온전히 나옵니다. |
| `excerpt` | **목록에 보일 요약.** 빠뜨리면 목록에 본문 전체가 깔립니다. |
| `date` | 필수 |
| `cover` | 선택. `alt`는 필수라 빠지면 빌드가 실패합니다. |
| `tags` | 분류. 아래 참고 |
| `authors` | `astro.config.mjs`에 정의된 이름 |
| `draft` | `true`면 `npm run dev`에서만 보이고 빌드 결과에는 안 들어갑니다 |
| `metrics` | 선택. 날짜 옆 "읽는 데 N분"은 자동 계산인데 코드도 단어로 셉니다. 코드가 많아 길게 나오면 `metrics: { readingTime: 300 }`(초)으로 덮어씁니다. |

### 썸네일

이미지는 `src/assets/blog/`에 넣습니다. 경로는 글 파일 기준 상대경로라 언어별로 다릅니다.

| 글 위치 | 경로 |
| --- | --- |
| `src/content/docs/blog/글.md` | `../../../assets/blog/...` |
| `src/content/docs/en/blog/글.md` | `../../../../assets/blog/...` |

라이트/다크에 다른 이미지를 쓰려면 `image` 대신 `light`와 `dark`를 씁니다. 배경색을 타는 다이어그램에 유용합니다.

```yaml
cover:
  alt: 배포 흐름도
  light: ../../../assets/blog/deploy-light.png
  dark: ../../../assets/blog/deploy-dark.png
```

로컬 파일을 쓰면 Astro가 WebP 변환과 크기 조절을 알아서 합니다. 외부 URL도 문자열로 넣을 수 있지만 그 경우 최적화는 없습니다.

썸네일이 없는 글은 목록에서 제목 아래에 얇은 그라데이션 띠가 대신 들어갑니다. 정보는 없고 목록 리듬만 맞추는 장식이라, `src/styles/custom.css`에서 해당 블록을 지우면 사라집니다.

### 카테고리

분류는 태그로 합니다. 사이드바에서는 `src/categories.ts`의 트리에 따라 대분류 아래로 묶여 보입니다.

```
프론트엔드   React · 상태 관리 · 스타일링
백엔드       Spring · API 설계 · Java
데이터 설계   스키마 설계 · 쿼리 튜닝 · 트랜잭션
인프라       Docker · Linux · CI/CD
생각         회고 · 일하는 방식
```

`backend`와 `infra`가 헷갈리면 **코드냐 환경이냐**로 나눕니다. Spring Boot로 API 짜는 얘기는 백엔드, 그걸 컨테이너에 올려 띄우는 얘기는 인프라입니다.

트리에 없는 태그도 그대로 동작하고, 사이드바에서는 **기타** 그룹에 모입니다. 거기 쌓이면 `src/categories.ts`에 자리를 잡아주라는 신호입니다.

### 시리즈

여러 편으로 이어 쓴 글은 `src/series.ts`에 순서를 적습니다. 글에는 아무것도 쓰지 않습니다.

```ts
export const seriesList: Series[] = [
	{
		label: { ko: 'Redis', en: 'Redis' },
		posts: ['blog/redis-basics', 'blog/redis-docker', 'blog/redis-java'],
	},
];
```

각 편의 맨 위에 차례가 붙고, 읽고 있는 편이 굵게 표시됩니다. 본문 끝에는 같은 모양의 상자에 이전 편·다음 편이 붙습니다. 그 아래의 이전 글·다음 글은 올린 날짜 순서라 읽는 순서와 다를 수 있어서, 둘을 모양으로 구분합니다. 아이디는 한국어 글 기준이고
영어 페이지는 앞에 `en/`만 붙여 찾습니다. 번역이 아직 없는 편은 한국어 제목으로 나옵니다.

초안(`draft: true`)은 운영 빌드에 페이지가 없으므로 차례에서 빠집니다.

### 링크 미리보기

카톡이나 슬랙에 링크를 붙였을 때 뜨는 이미지(`og:image`)는 세 단계로 고릅니다.

1. `cover`가 있는 글은 그 커버
2. 없는 페이지는 제목을 얹은 카드를 빌드 때 만듭니다 (`src/pages/og/[...route].ts`)
3. 목록과 태그 페이지는 파일이 없으므로 그 언어 홈의 카드를 빌려 씁니다

카드의 한글은 `src/fonts/`의 Pretendard로 그립니다. 빌드할 때만 읽고 사이트로는 나가지 않습니다.

### 댓글

giscus입니다. 댓글이 이 저장소의 Discussions에 쌓이므로 따로 띄울 서버가 없습니다.

깃허브 쪽 설정이 끝나기 전에는 아무것도 나오지 않습니다. `src/giscus.ts`에 `category`와
`categoryId`를 채우면 그때부터 글 아래에 붙습니다. 무엇을 어디서 받아 적는지는 그 파일에
적어두었습니다.

## 구조

| 경로 | 역할 |
| --- | --- |
| `src/content/docs/` | 글과 페이지 (한국어 루트, 영어 `en/`) |
| `src/content/i18n/ko.json` | 테마가 제공하지 않는 한국어 UI 문구 |
| `src/categories.ts` | 사이드바 카테고리 트리 |
| `src/series.ts` | 이어 쓴 글의 순서 |
| `src/giscus.ts` | 댓글 설정 |
| `src/routeData.ts` | 태그를 카테고리 트리로 다시 묶고, `<head>`를 마무리하는 미들웨어 |
| `src/og.ts` | 페이지마다 어떤 미리보기 이미지를 쓸지 고르는 규칙 |
| `src/pages/og/[...route].ts` | 커버가 없는 페이지의 카드를 빌드 때 그립니다 |
| `src/components/` | 테마를 덮어쓰는 컴포넌트와 직접 만든 조각 |
| `src/styles/custom.css` | 색과 목록 스타일 |
| `src/assets/blog/` | 썸네일 |
| `src/fonts/` | 카드에 한글을 그릴 때 쓰는 Pretendard |
| `astro.config.mjs` | 사이트 주소, 언어, 테마·플러그인 설정 |

사이드바는 컴포넌트가 아니라 라우트 미들웨어에서 만들어집니다. `src/routeData.ts`는 플러그인이 만든 사이드바를 받아 태그 그룹만 트리로 다시 묶고, 전체 글·최근 글·RSS는 그대로 둡니다.

## 색

`src/styles/custom.css`에서 Starlight의 강조색만 덮어씁니다.

```css
:root {
	--sl-color-accent-low: #182e52;
	--sl-color-accent: #2f6fd0;
	--sl-color-accent-high: #b9d3f7;
}
```

다크모드는 테마가 처리합니다. 헤더의 선택기로 자동/라이트/다크를 고릅니다.

## 배포

`main`에 푸시하면 `.github/workflows/deploy.yml`이 빌드해서 GitHub Pages에 올립니다. `dist/`는 커밋하지 않습니다.

최초 1회 저장소 설정이 필요합니다: **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 변경.

저장소 이름을 `<계정명>.github.io`가 아닌 것으로 바꾸면 `astro.config.mjs`의 `site`와 함께 `base: '/저장소이름/'`도 넣어야 합니다.
