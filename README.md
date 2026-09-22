# gitblog

한국어와 영어를 함께 쓰는 개발 블로그. [Astro](https://astro.build/)로 만들고 GitHub Pages에 배포합니다.

- 한국어: `/` — 기본 언어라 URL에 접두사가 없습니다.
- 영어: `/en/`

## 로컬에서 실행

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 정적 파일 생성
npm run preview  # 빌드 결과를 로컬에서 확인
```

## 글 쓰기

`src/content/blog/` 아래 언어 폴더에 마크다운 파일을 만들면 됩니다.

```
src/content/blog/
├── ko/
│   └── hello-world.md   → /blog/hello-world/
└── en/
    └── hello-world.md   → /en/blog/hello-world/
```

**파일 이름이 같으면 서로의 번역본으로 묶입니다.** 글을 읽다가 언어 버튼을 누르면 같은 글의 반대편 언어로 넘어가고, 번역이 없으면 그 언어의 글 목록으로 보냅니다. 파일 이름이 곧 URL이므로 한글 대신 영문 슬러그를 쓰는 편이 좋습니다. 제목은 물론 한글로 씁니다.

프론트매터는 `src/content.config.ts`의 스키마로 검증됩니다. 형식이 틀리면 빌드가 실패하면서 어디가 틀렸는지 알려줍니다.

```yaml
---
title: '블로그를 시작하며'
description: '목록과 검색 결과에 노출되는 한 줄 요약.'
category: 'thoughts'
subcategory: 'retrospective'   # 선택
pubDate: 'Sep 21 2026'
heroImage: '../../../assets/blog-placeholder-2.jpg' # 선택
draft: false                                        # 선택, 기본값 false
---
```

### 카테고리

대분류(`category`)는 필수, 소분류(`subcategory`)는 선택입니다. 소분류를 안 쓰면 글이 대분류 바로 밑에 놓입니다.

```
frontend   프론트엔드      react       React
                          state       상태 관리
                          css         스타일링
backend    백엔드          spring      Spring
                          api         API 설계
                          java        Java
data       데이터 설계      schema      스키마 설계
                          query       쿼리 튜닝
                          transaction 트랜잭션
infra      인프라          docker      Docker
                          linux       Linux
                          cicd        CI/CD
thoughts   생각            retrospective 회고
                          process     일하는 방식
```

`backend`와 `infra`가 헷갈리면 **코드냐 환경이냐**로 나눕니다. Spring Boot로 API 짜는 얘기는 `backend`, 그걸 컨테이너에 올려 띄우는 얘기는 `infra`입니다.

목록 페이지는 `/blog/category/infra/`, `/blog/category/infra/cicd/`처럼 자동 생성되고, 글이 하나도 없는 가지는 사이드바에도 안 보이고 페이지도 안 만듭니다.

빌드가 막아주는 것:

- 목록에 없는 슬러그 → 오타로 유령 카테고리가 생기지 않습니다.
- **다른 대분류의 소분류** → `category: 'thoughts'`에 `subcategory: 'docker'`를 넣으면 `"docker" is not under the "thoughts" category`로 빌드가 멈춥니다.

**항목을 추가하려면** `src/i18n/categories.ts`의 트리에 슬러그를 넣고, `src/i18n/ui.ts`의 두 언어에 `category.<대분류>` 또는 `category.<대분류>.<소분류>` 문구를 추가하면 됩니다. 스키마·사이드바·목록 페이지가 알아서 따라옵니다.

> `heroImage`는 글 파일 기준 상대 경로입니다. 언어 폴더 안에 있으므로 `../../../assets/`입니다.

### 쓰다 만 글 숨기기

`draft: true`를 넣으면 `npm run dev`에서는 **초안** 배지와 함께 보이지만 `npm run build` 결과에는 들어가지 않습니다. 푸시해도 사이트에 안 나오므로, 쓰다 만 글을 커밋해둬도 안전합니다. 다 쓰면 그 줄을 지우거나 `false`로 바꾸면 공개됩니다.

`src/content/blog/en/`의 `markdown-style-guide`, `using-mdx`가 이 상태입니다. Astro 템플릿의 마크다운·MDX 문법 견본이라 참고용으로만 남겨뒀습니다.

## 번역 문구 고치기

메뉴 이름, 홈 문구 같은 UI 텍스트는 전부 `src/i18n/ui.ts` 한 곳에 있습니다. 두 언어 모두에 같은 키를 넣어야 하고, 빠지면 타입 오류로 잡힙니다.

언어를 더 추가하려면:

1. `src/i18n/ui.ts`의 `languages`와 `ui`에 새 언어를 추가
2. `astro.config.mjs`의 `i18n.locales`에 추가
3. `src/pages/<코드>/` 폴더를 만들고 `src/pages/en/`의 얇은 페이지 파일들을 복사해 `lang` 값만 교체
4. `src/content/blog/<코드>/` 폴더 생성

## 테마와 색

색은 전부 `src/styles/global.css` 맨 위 CSS 변수에 있습니다. 컴포넌트는 변수만 참조하므로 여기만 고치면 사이트 전체가 바뀝니다.

```css
--accent: #3b82f6;   /* 링크, 카테고리, 활성 항목 */
--bg: #ffffff;       /* 본문 배경 */
--surface: #ffffff;  /* 헤더 */
```

`--black`, `--gray` 계열은 `15, 23, 42`처럼 `#` 없이 적습니다. 투명도를 섞어 쓰기 위해서입니다 (`rgba(var(--gray), 25%)`).

다크모드는 시스템 설정을 따르고, 헤더의 해/달 버튼으로 덮어쓸 수 있습니다. 선택은 `localStorage`에 남고, `BaseHead.astro`의 인라인 스크립트가 첫 페인트 전에 적용해서 흰 화면이 번쩍이지 않습니다.

### React 컴포넌트에서 쓰기

먼저 통합을 설치합니다 (한 번만).

```sh
npx astro add react
```

**스타일은 그냥 됩니다.** CSS 변수가 `<html>`에 걸려 있어서 아일랜드 안까지 그대로 내려갑니다.

```tsx
<button style={{ background: 'var(--accent)', color: 'var(--bg)' }}>버튼</button>
```

단, **`.astro` 파일의 `<style>`은 React 컴포넌트에 닿지 않습니다.** Astro가 그 스타일을 자기 템플릿 요소에만 스코프하기 때문입니다. React 쪽은 CSS 모듈, styled-components, 인라인 스타일 중 하나를 쓰되 값은 같은 변수를 읽으면 됩니다.

**JS로 색 값이 필요할 때** — ECharts처럼 실제 색 문자열을 넘겨야 하는 라이브러리는 `src/utils/theme.ts`를 씁니다.

```tsx
import { getTheme, onThemeChange, cssVar } from '../utils/theme';

const [theme, setTheme] = useState(getTheme);
useEffect(() => onThemeChange(setTheme), []);   // 정리 함수까지 반환됩니다

const option = { color: [cssVar('--accent')], backgroundColor: cssVar('--bg') };
```

`onThemeChange`는 헤더 버튼과 시스템 설정 변경 양쪽을 다 잡습니다.

## 구조

| 경로 | 역할 |
| --- | --- |
| `src/i18n/ui.ts` | 번역 문구 원본 |
| `src/i18n/categories.ts` | 카테고리 트리 (대분류 > 소분류) |
| `src/i18n/utils.ts` | `t()`, URL 접두사 처리 등 헬퍼 |
| `src/utils/posts.ts` | 글 목록 조회, 언어/슬러그 분리, 번역본 탐색 |
| `src/layouts/Base.astro` | `<html lang>`, 헤더, 푸터 |
| `src/layouts/BlogPost.astro` | 글 상세 레이아웃 |
| `src/components/` | 헤더, 언어 전환기, 테마 버튼, 글 목록 등 |
| `src/styles/global.css` | 색 변수와 다크모드 |
| `src/utils/theme.ts` | JS에서 현재 테마·색 값을 읽는 헬퍼 |
| `src/pages/` | 한국어 라우트 (`src/pages/en/`이 영어) |

각 라우트 파일은 몇 줄뿐입니다. 실제 내용은 `src/components/`의 공용 컴포넌트에 있고, 라우트는 `lang` 값만 넘깁니다.

## 배포

`main`에 푸시하면 `.github/workflows/deploy.yml`이 빌드해서 GitHub Pages에 올립니다. `dist/`는 커밋하지 않습니다.

최초 1회 저장소 설정이 필요합니다: **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 변경.

저장소 이름을 `<계정명>.github.io`가 아닌 것으로 바꾸면 `astro.config.mjs`의 `site`와 함께 `base: '/저장소이름/'`도 넣어야 합니다.
