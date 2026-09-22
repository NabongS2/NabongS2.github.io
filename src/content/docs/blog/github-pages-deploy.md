---
title: GitHub Actions로 GitHub Pages에 배포하기
description: main에 푸시하면 자동으로 빌드해서 GitHub Pages에 올리는 워크플로를 정리합니다.
date: 2026-09-21
tags:
  - 인프라
  - CI/CD
authors: nabong
---

이 블로그는 `main` 브랜치에 푸시하면 알아서 빌드되어 올라갑니다. 빌드 결과물(`dist/`)은 저장소에 커밋하지 않습니다.

## 저장소 설정

먼저 GitHub 저장소에서 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿔야 합니다. 기본값인 "Deploy from a branch"로 두면 워크플로가 돌아도 반영되지 않습니다.

## 워크플로

`.github/workflows/deploy.yml` 한 파일이면 끝입니다. Astro가 공식 액션을 제공하기 때문에 직접 쓸 게 많지 않습니다.

```yaml
- uses: withastro/action@v5
- uses: actions/deploy-pages@v4
```

권한 설정이 빠지면 배포 단계에서 막힙니다.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## 자주 걸리는 것

- **CSS가 깨져 보인다** — `astro.config.mjs`의 `site` 값이 실제 주소와 다른 경우입니다. 저장소 이름이 `<계정명>.github.io`가 아니라면 `base: '/저장소이름/'`도 같이 넣어야 합니다.
- **404가 뜬다** — Pages 소스가 아직 "Deploy from a branch"에 머물러 있는지 확인해 보세요.
- **글은 썼는데 안 보인다** — 프론트매터의 `pubDate` 형식이 잘못되면 빌드가 실패합니다. 콘텐츠 스키마가 잡아주니 액션 로그를 보면 바로 나옵니다.
