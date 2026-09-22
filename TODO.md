# TODO

## 검색엔진 등록

글이 어느 정도 쌓인 뒤에 한다. 등록을 안 하면 검색엔진이 사이트의 존재를 몇 달간 모를 수도 있고, 등록하면 며칠로 줄어든다.

- [ ] **커밋 푸시** — 이게 먼저다. 올라가 있지 않은 건 색인될 수 없다.
- [ ] **Google Search Console** — <https://search.google.com/search-console>
  - `https://nabongs2.github.io` 속성 추가
  - 소유 확인 (HTML 메타태그 방식이면 `src/components/BaseHead.astro`에 넣는다)
  - `sitemap-index.xml` 제출
- [ ] **네이버 서치어드바이저** — <https://searchadvisor.naver.com>
  - 국내 개발 검색 유입이 꽤 되므로 구글과 별개로 등록
  - 소유 확인 + 사이트맵 제출
- [ ] **Bing 웹마스터 도구** — Search Console을 연동하면 대부분 자동으로 넘어간다

등록 후 `site:nabongs2.github.io`로 검색해서 색인 여부를 확인한다.

## 글쓰기

- [ ] `description`을 좀 더 길게 — 구글이 검색 결과에 보여주는 길이는 한글 기준 70~80자인데 지금 샘플 글들은 50자 안팎이라 자리가 남는다.
- [ ] 회사에서 부딪힌 문제를 구체적으로 쓴다. 일반 키워드(`React 상태관리`)는 경쟁이 심하지만, 정확한 에러 메시지나 구체적인 조합은 검색하면 거의 유일한 답이 된다. 단, 회사 소스와 내부 구조는 일반화해서 쓸 것.
- [ ] 샘플 글 정리 — `src/content/blog/en/`의 `markdown-style-guide`, `using-mdx`는 Astro 템플릿 견본이라 `draft: true`로 숨겨둔 상태다. 문법 참고가 더 필요 없으면 지운다.

## 내용 채우기

아래는 포트폴리오와 GitHub 프로필을 보고 임시로 채워둔 것이라 실제와 다를 수 있다.

- [ ] `src/i18n/ui.ts` — 사이트 제목, 홈 소개 문구
- [ ] `src/pages/about.astro`, `src/pages/en/about.astro` — 관심 분야와 기술 스택
- [ ] `src/i18n/categories.ts` — 소분류 목록을 실제로 쓸 주제에 맞게 조정

## 나중에

- [ ] **검색 기능** — 글이 쌓이면 필요해진다. 이때 `npx astro add react`를 하고 검색창만 React 컴포넌트로 만들어 `client:load`로 붙인다. 본문은 그대로 정적 HTML이므로 SEO에 영향 없다.
- [ ] 목차(TOC) — 긴 글이 생기면
- [ ] 댓글 (giscus 등) — GitHub Discussions를 쓰므로 별도 서버가 필요 없다
