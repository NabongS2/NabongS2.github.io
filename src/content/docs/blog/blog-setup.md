---
title: 이 블로그는 이렇게 만들었습니다
description: Astro와 Starlight로 한국어·영어 블로그를 만들고 GitHub Pages에 올렸습니다. 어떤 조각으로 이루어져 있고 글은 어떻게 쓰는지 정리했습니다.
excerpt: 정적 HTML을 뽑는 Astro 위에 문서 테마 Starlight를 얹고, 블로그 플러그인을 붙였습니다. 검색과 목차, 다크모드, 다국어는 테마가 가져다줍니다.
cover:
  alt: 나봉 개발 블로그 첫 화면
  image: ../../../assets/blog/blog-setup.png
date: 2026-09-21
tags:
  - 생각
  - 회고
authors: nabong
---

한국어와 영어를 같이 쓰는 블로그입니다. 어떤 조각으로 만들어졌는지 남겨둡니다.

## 무엇으로 만들었나

| | 하는 일 |
| --- | --- |
| [Astro](https://astro.build/) | 빌드 때 정적 HTML을 뽑습니다. 브라우저로 가는 JS가 거의 없습니다. |
| [Starlight](https://starlight.astro.build/) | Astro 공식 문서 테마. 검색·목차·다크모드·다국어가 들어 있습니다. |
| [starlight-blog](https://starlight-blog-docs.vercel.app/) | 문서 테마 위에 블로그를 얹는 플러그인. 글 목록, 태그, RSS를 맡습니다. |
| GitHub Pages | `main`에 푸시하면 Actions가 빌드해서 올립니다. |

조건은 두 가지였습니다. **한국어와 영어를 같이 쓸 것**, 그리고 **검색에 잡히게 할 것**.

다국어 라우팅과 언어 전환기를 직접 만드는 것보다 이미 있는 걸 쓰는 편이 나았습니다. 검색 쪽은 빌드 결과물을 열어보면 이런 게 들어 있습니다.

```html
<link rel="canonical" href="https://nabongs2.github.io/blog/blog-setup/">
<link rel="alternate" hreflang="ko" href="https://nabongs2.github.io/blog/blog-setup/">
<link rel="alternate" hreflang="en" href="https://nabongs2.github.io/en/blog/blog-setup/">
<link rel="alternate" hreflang="x-default" href="https://nabongs2.github.io/blog/blog-setup/">
```

`hreflang`은 한국어판과 영어판이 같은 글의 다른 언어라고 알려줍니다. 이게 없으면 중복 콘텐츠로 잡힐 수 있습니다. 사이트맵도 함께 생성됩니다.

여기에 정적 HTML이라는 점이 더해집니다. 이 글은 자바스크립트를 한 줄도 실행하지 않은 상태에서 본문이 그대로 읽힙니다. 크롤러가 받아 가는 게 빈 `<div>`가 아니라 완성된 문서입니다.

다만 여기까지는 **조건이 갖춰졌다**는 뜻이지 검색 결과 상위에 뜬다는 뜻은 아닙니다. 그건 글이 쌓이고 검색엔진에 등록한 뒤에 확인할 일입니다.

## 한국어와 영어

한국어는 루트에, 영어는 `/en/` 아래에 둡니다.

```
src/content/docs/
├── blog/
│   └── blog-setup.md      → /blog/blog-setup/
└── en/blog/
    └── blog-setup.md      → /en/blog/blog-setup/
```

파일 이름이 같으면 서로의 번역본으로 묶입니다. 글을 읽다가 언어 버튼을 누르면 같은 글의 반대편 언어로 넘어갑니다.

번역이 아직 없으면 Starlight가 기본 언어 글을 대신 보여줍니다. 이 동작을 끄는 설정은 없어서, 그런 페이지에는 `noindex`를 붙여 검색엔진이 한국어 본문을 영어 페이지로 수집하지 않게 했습니다. 나중에 번역을 올리면 자동으로 풀립니다.

## 분류

분류는 태그로 합니다.

```yaml
tags:
  - 인프라
  - CI/CD
```

사이드바에서는 `src/categories.ts`에 적어둔 트리에 따라 대분류 아래로 묶여 보입니다. 트리에 없는 태그는 **기타** 그룹에 모이는데, 거기 쌓이면 자리를 잡아주라는 신호입니다.

## 글 하나의 구성

```yaml
---
title: 제목
description: 검색 결과와 링크 미리보기에 나오는 한 줄
excerpt: 목록 페이지에 보일 2~3줄 요약
cover:
  alt: 이미지 설명
  image: ../../../assets/blog/example.png
date: 2026-09-21
tags:
  - 인프라
authors: nabong
---
```

`description`과 `excerpt`는 역할이 다릅니다. 앞은 검색엔진과 링크 미리보기용이고, 뒤는 목록에서 사람이 읽는 요약입니다. `excerpt`를 빼면 목록에 본문 전체가 깔립니다.

`draft: true`를 넣으면 로컬에서는 보이고 빌드 결과에는 들어가지 않습니다. 쓰다 만 글을 커밋해도 공개되지 않습니다.

## 배포

`main`에 푸시하면 끝입니다. 빌드 결과물은 저장소에 커밋하지 않습니다.

```
글 작성 → git push → GitHub Actions 빌드 → Pages 반영
```

워크플로는 `.github/workflows/deploy.yml` 한 파일입니다. Astro가 공식 액션을 제공해서 직접 쓸 게 많지 않습니다.

```yaml
- uses: withastro/action@v5
- uses: actions/deploy-pages@v4
```

권한이 빠지면 배포 단계에서 막힙니다.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### 자주 걸리는 것

- **404가 뜬다** — 저장소의 **Settings → Pages → Build and deployment → Source**가 아직 `Deploy from a branch`에 머물러 있는지 확인합니다. 기본값이 그것이라 바꾸지 않으면 워크플로가 아무리 돌아도 반영되지 않습니다.
- **CSS가 깨져 보인다** — `astro.config.mjs`의 `site` 값이 실제 주소와 다른 경우입니다. 저장소 이름이 `<계정명>.github.io`가 아니라면 `base: '/저장소이름/'`도 같이 넣어야 합니다.
- **글은 썼는데 안 보인다** — 프론트매터 형식이 틀리면 빌드가 실패합니다. 콘텐츠 스키마가 잡아주니 Actions 로그에 어느 파일의 어느 필드인지 그대로 나옵니다.
