---
title: Deploying to GitHub Pages with GitHub Actions
description: The workflow that builds this site and publishes it to GitHub Pages on every push to main.
date: 2026-09-21
tags:
  - Infrastructure
  - CI/CD
authors: nabong
---

Pushing to `main` is all it takes to publish this blog. The build output (`dist/`) never gets committed.

## Repository settings

First, in the GitHub repository, go to **Settings → Pages → Build and deployment → Source** and switch it to **GitHub Actions**. Leave it on the default "Deploy from a branch" and your workflow will run happily while nothing it produces ever goes live.

## The workflow

One file, `.github/workflows/deploy.yml`, covers it. Astro ships an official action, so there isn't much to write yourself.

```yaml
- uses: withastro/action@v5
- uses: actions/deploy-pages@v4
```

Leave out the permissions and the deploy step will refuse to run.

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Things that trip people up

- **The CSS looks broken** — the `site` value in `astro.config.mjs` doesn't match the real address. If the repository isn't named `<username>.github.io`, you also need `base: '/repository-name/'`.
- **You get a 404** — check whether the Pages source is still sitting on "Deploy from a branch".
- **A post you wrote doesn't show up** — a malformed `pubDate` in the frontmatter fails the build. The content schema catches it, so the reason is right there in the Actions log.
