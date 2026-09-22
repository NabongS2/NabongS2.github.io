---
title: Starting this blog
description: I built a bilingual dev blog with Astro. Here is how it fits together.
date: 2026-09-21
tags:
  - Thoughts
  - Retrospective
authors: nabong
---

I'm starting this blog again. This time it's built with [Astro](https://astro.build/), and it runs in both Korean and English.

## Why Astro

A few options were on the table.

- **Jekyll** — the GitHub Pages default, but it needs Ruby installed, and Liquid templates make it awkward to reach the parts I actually want to change.
- **Next.js** — familiar, but overkill for one blog.
- **Astro** — ships static HTML by default, so it drops straight onto GitHub Pages, and I can still slot in a React component where one earns its place. Most of all, i18n routing is built into the framework.

## How posts are organised

`src/content/blog/` holds one folder per language.

```
src/content/blog/
├── ko/
│   └── hello-world.md   → /blog/hello-world/
└── en/
    └── hello-world.md   → /en/blog/hello-world/
```

Two files that share a slug are treated as translations of each other. Hit the language button while reading a post and you land on the same post in the other language; if no translation exists yet, you land on that language's post list instead.

## What's next

I'll write things down as I get stuck on them. The ones that didn't go well tend to be more useful later than the ones that did.
