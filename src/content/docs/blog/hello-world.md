---
title: 블로그를 시작하며
description: Astro로 한국어·영어를 함께 쓰는 개발 블로그를 만들었습니다. 어떻게 굴러가는지 정리해 둡니다.
date: 2026-09-21
tags:
  - 생각
  - 회고
authors: nabong
---

블로그를 다시 시작합니다. 이번에는 [Astro](https://astro.build/)로 만들었고, 한국어와 영어를 같이 씁니다.

## 왜 Astro였나

몇 가지를 놓고 고민했습니다.

- **Jekyll** — GitHub Pages의 기본값이지만 Ruby를 깔아야 하고, Liquid 템플릿으로는 손대고 싶은 곳에 손이 잘 안 닿습니다.
- **Next.js** — 익숙하지만 블로그 하나 굴리기엔 과합니다.
- **Astro** — 기본 출력이 정적 HTML이라 GitHub Pages에 그대로 올라가고, 필요한 곳에만 React 컴포넌트를 꽂을 수 있습니다. 무엇보다 다국어 라우팅이 프레임워크에 들어 있습니다.

## 글은 어떻게 쓰나

`src/content/blog/` 아래에 언어별 폴더가 있습니다.

```
src/content/blog/
├── ko/
│   └── hello-world.md   → /blog/hello-world/
└── en/
    └── hello-world.md   → /en/blog/hello-world/
```

파일 이름(슬러그)이 같으면 서로의 번역본으로 묶입니다. 글을 읽다가 언어 버튼을 누르면 같은 글의 반대편 언어로 넘어가고, 번역이 아직 없으면 그 언어의 목록으로 보냅니다.

## 앞으로

작업하다 막혔던 것들을 그때그때 적어둘 생각입니다. 잘 된 것보다 잘 안 된 쪽이 나중에 더 쓸모 있더군요.
