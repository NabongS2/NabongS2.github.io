---
title: How this blog is put together
description: A Korean and English blog built with Astro and Starlight, published to GitHub Pages. What it's made of, and how posts get written.
excerpt: Astro emits the static HTML, the Starlight docs theme sits on top, and a blog plugin turns it into a blog. Search, table of contents, dark mode and i18n come with the theme.
cover:
  alt: The home page of Nabong's dev blog
  image: ../../../../assets/blog/blog-setup.png
date: 2026-09-21
tags:
  - Thoughts
  - Retrospective
authors: nabong
---

This blog runs in Korean and English. Here's what it's made of.

## The pieces

| | What it does |
| --- | --- |
| [Astro](https://astro.build/) | Emits static HTML at build time. Almost no JavaScript reaches the browser. |
| [Starlight](https://starlight.astro.build/) | Astro's official docs theme — search, table of contents, dark mode and i18n included. |
| [starlight-blog](https://starlight-blog-docs.vercel.app/) | Adds a blog on top of the docs theme: post lists, tags, RSS. |
| GitHub Pages | Push to `main` and Actions builds and publishes it. |

Two requirements: **run in Korean and English**, and **be findable in search**.

Building the routing and the language switcher by hand would have been more work than taking something that already does it. As for search, here's what ends up in the build output.

```html
<link rel="canonical" href="https://nabongs2.github.io/blog/blog-setup/">
<link rel="alternate" hreflang="ko" href="https://nabongs2.github.io/blog/blog-setup/">
<link rel="alternate" hreflang="en" href="https://nabongs2.github.io/en/blog/blog-setup/">
<link rel="alternate" hreflang="x-default" href="https://nabongs2.github.io/blog/blog-setup/">
```

`hreflang` tells search engines the Korean and English pages are the same post in two languages; without it they can be read as duplicate content. A sitemap is generated alongside.

Static HTML does the rest. This post's body is readable without running a single line of JavaScript — a crawler receives a finished document, not an empty `<div>`.

That only means the groundwork is in place. Whether anything ranks is a separate question, answered after there are posts and the site is registered with search engines.

## Korean and English

Korean sits at the root, English under `/en/`.

```
src/content/docs/
├── blog/
│   └── blog-setup.md      → /blog/blog-setup/
└── en/blog/
    └── blog-setup.md      → /en/blog/blog-setup/
```

Two files that share a name are treated as translations of each other, so the language button takes you to the same post in the other language.

When a translation doesn't exist yet, Starlight shows the default-language content instead. There's no setting to turn that off, so those pages carry a `noindex` — otherwise search engines would index Korean text as an English page. Adding a real translation clears it automatically.

## Filing posts

Posts are filed with tags.

```yaml
tags:
  - Infrastructure
  - CI/CD
```

The sidebar groups them under a parent category according to the tree in `src/categories.ts`. Tags that aren't in the tree collect under **Other**, which is the cue to give them a place.

## What a post looks like

```yaml
---
title: A title
description: One line for search results and link previews
excerpt: Two or three lines for the post list
cover:
  alt: Description of the image
  image: ../../../../assets/blog/example.png
date: 2026-09-21
tags:
  - Infrastructure
authors: nabong
---
```

`description` and `excerpt` do different jobs: the first is for search engines and link previews, the second is what a person reads in the list. Leave `excerpt` out and the whole post body lands in the list.

Setting `draft: true` keeps a post visible locally and out of the build, so an unfinished draft can be committed without going public.

## Publishing

Push to `main`. The build output is never committed.

```
write → git push → GitHub Actions builds → live on Pages
```

The workflow is a single file, `.github/workflows/deploy.yml`. Astro ships an official action, so there isn't much to write.

```yaml
- uses: withastro/action@v5
- uses: actions/deploy-pages@v4
```

Leave out the permissions and the deploy step refuses to run.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### What trips people up

- **A 404** — check whether **Settings → Pages → Build and deployment → Source** is still on `Deploy from a branch`. That's the default, and until it's switched the workflow can run all it likes without anything going live.
- **Broken CSS** — the `site` value in `astro.config.mjs` doesn't match the real address. If the repository isn't named `<username>.github.io`, you also need `base: '/repository-name/'`.
- **A post that doesn't show up** — malformed frontmatter fails the build. The content schema catches it, and the Actions log names the file and the field.
